import { createHash } from 'node:crypto';

/**
 * Durable submission-processing records. These are not participant accounts and
 * carry no grants: every key is `SYNC#…`, and the IAM policy of each worker
 * narrows that further. The email digest is a key normaliser (fixed length,
 * lower-cased, no delimiter collisions), not a confidentiality control — the
 * address itself is stored in the intake record and on CRM mappings.
 */
export const emailDigest = email => createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
const REGISTRATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function syncKey(pk) {
  if (typeof pk !== 'string' || !/^SYNC#[A-Z]+#[a-zA-Z0-9#-]{1,200}$/.test(pk)) throw new TypeError('Invalid sync key');
  return pk;
}
export function attribute(value) {
  if (value === null) return { NULL: true };
  if (typeof value === 'string') return { S: value };
  if (typeof value === 'boolean') return { BOOL: value };
  if (Number.isSafeInteger(value)) return { N: String(value) };
  if (Array.isArray(value)) return { L: value.map(attribute) };
  throw new TypeError('Invalid sync attribute');
}
export function decode(item) {
  if (!item) return null;
  const value = v => v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L?.map(value)));
  return Object.fromEntries(Object.entries(item).map(([key, v]) => [key, value(v)]));
}
export const encode = item => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined)
  .map(([key, value]) => [key, attribute(value)]));

/** Strongly consistent reads and revision-conditional writes; `send` is exposed for extensions. */
export function createSyncStore(config, overrides = {}) {
  let services;
  async function send(command, input) {
    services ??= (overrides.loadAws ?? (() => import('@aws-sdk/client-dynamodb')))().then(aws => ({
      aws, client: overrides.client ?? new aws.DynamoDBClient({ maxAttempts: 2 }),
    }));
    const { aws, client } = await services;
    return client.send(new aws[command](input));
  }
  return {
    send,
    async getRegistration(registrationId) {
      if (!REGISTRATION_ID.test(registrationId)) throw new TypeError('Invalid registration reference');
      return decode((await send('GetItemCommand', { TableName: config.registrationsTableName,
        Key: { registrationId: { S: registrationId } }, ConsistentRead: true })).Item);
    },
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
  };
}
