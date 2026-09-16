import { attribute, createSyncStore, emailDigest, encode, syncKey } from '../shared/sync-store.mjs';
export { emailDigest } from '../shared/sync-store.mjs';

/** The shared sync records, plus the one transaction only contact creation needs. */
export function createStore(config, overrides = {}) {
  const store = createSyncStore(config, overrides);
  const suppressionGuard = pk => ({ ConditionCheck: {
    TableName: config.participantsTableName, Key: { pk: { S: syncKey(pk) } },
    ConditionExpression: 'attribute_not_exists(pk)',
  } });
  return {
    getRegistration: store.getRegistration,
    get: store.get,
    put: store.put,
    /**
     * Reserves a daily budget unit, rechecks source retention/deletion and both
     * suppressions, and records "creating" — atomically, BEFORE the HTTP POST.
     * `createdAt` is pinned here, so a source altered after intake cannot be
     * turned into a contact by a replay.
     */
    async authorizeCreation(claim, source, now) {
      syncKey(claim.pk);
      const limit = config.maxCreatesPerDay ?? 100;
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Invalid daily creation limit');
      const next = { ...claim, state: 'creating', attemptedAt: now, revision: claim.revision + 1 };
      try {
        await store.send('TransactWriteItemsCommand', { TransactItems: [
          { Update: {
            TableName: config.participantsTableName,
            Key: { pk: { S: `SYNC#BUDGET#${new Date(now).toISOString().slice(0, 10)}` } },
            UpdateExpression: 'ADD #count :one',
            ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
            ExpressionAttributeNames: { '#count': 'count' },
            ExpressionAttributeValues: { ':one': { N: '1' }, ':limit': { N: String(limit) } },
          } },
          { Put: { TableName: config.participantsTableName, Item: encode(next),
            ConditionExpression: '#revision = :previous', ExpressionAttributeNames: { '#revision': 'revision' },
            ExpressionAttributeValues: { ':previous': attribute(claim.revision) } } },
          { ConditionCheck: {
            TableName: config.registrationsTableName, Key: { registrationId: { S: source.registrationId } },
            ConditionExpression: 'attribute_exists(registrationId) AND expiresAt > :now AND createdAt = :created'
              + ' AND #status = :received AND attribute_not_exists(erasedAt) AND attribute_not_exists(deletedAt)',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':now': attribute(Math.floor(now / 1000)),
              ':created': attribute(source.createdAt), ':received': { S: 'received' } },
          } },
          suppressionGuard(`SYNC#SUPPRESS#REGISTRATION#${source.registrationId}`),
          suppressionGuard(`SYNC#SUPPRESS#EMAIL#${emailDigest(source.email)}`),
        ] });
      } catch (error) {
        if (error?.name === 'TransactionCanceledException'
          && error.CancellationReasons?.[0]?.Code === 'ConditionalCheckFailed') return null;
        throw error;
      }
      return next;
    },
  };
}
