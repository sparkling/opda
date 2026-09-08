import { createHash } from 'node:crypto';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const emailDigest = email => createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
function syncKey(pk) {
  if (typeof pk !== 'string' || !/^SYNC#[A-Z]+#[a-zA-Z0-9#-]{1,200}$/.test(pk)) throw new TypeError('Invalid sync key');
  return pk;
}
function attribute(value) {
  if (value === null) return { NULL: true };
  if (typeof value === 'string') return { S: value };
  if (typeof value === 'boolean') return { BOOL: value };
  if (Number.isSafeInteger(value)) return { N: String(value) };
  if (Array.isArray(value)) return { L: value.map(attribute) };
  throw new TypeError('Invalid sync attribute');
}
function decode(item) {
  if (!item) return null;
  const value = v => v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L?.map(value)));
  return Object.fromEntries(Object.entries(item).map(([key, v]) => [key, value(v)]));
}
const encode = item => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined)
  .map(([key, value]) => [key, attribute(value)]));

export function createStore(config, overrides = {}) {
  let services;
  async function send(command, input) {
    services ??= (overrides.loadAws ?? (() => import('@aws-sdk/client-dynamodb')))().then(aws => ({
      aws, client: overrides.client ?? new aws.DynamoDBClient({ maxAttempts: 2 }),
    }));
    const { aws, client } = await services;
    return client.send(new aws[command](input));
  }
  async function getRegistration(registrationId) {
    if (!uuid.test(registrationId)) throw new TypeError('Invalid registration reference');
    return decode((await send('GetItemCommand', { TableName: config.registrationsTableName,
      Key: { registrationId: { S: registrationId } }, ConsistentRead: true })).Item);
  }
  const suppressionGuard = pk => ({ ConditionCheck: {
    TableName: config.participantsTableName, Key: { pk: { S: syncKey(pk) } },
    ConditionExpression: 'attribute_not_exists(pk)',
  } });
  return {
    getRegistration,
    async get(pk) {
      return decode((await send('GetItemCommand', { TableName: config.participantsTableName,
        Key: { pk: { S: syncKey(pk) } }, ConsistentRead: true })).Item);
    },
    async put(item, previous = null) {
      syncKey(item.pk);
      const result = { ...item, revision: (previous?.revision ?? 0) + 1 };
      await send('PutItemCommand', {
        TableName: config.participantsTableName, Item: encode(result),
        ConditionExpression: previous ? '#revision = :previous' : 'attribute_not_exists(pk)',
        ...(previous ? { ExpressionAttributeNames: { '#revision': 'revision' },
          ExpressionAttributeValues: { ':previous': attribute(previous.revision) } } : {}),
      });
      return result;
    },
    async authorizeCreation(claim, source, now) {
      syncKey(claim.pk);
      const limit = config.maxCreatesPerDay ?? 100;
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Invalid daily creation limit');
      const next = { ...claim, state: 'creating', attemptedAt: now, revision: claim.revision + 1 };
      try {
        await send('TransactWriteItemsCommand', { TransactItems: [
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
