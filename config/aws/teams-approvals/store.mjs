import { attribute, createSyncStore, decode, encode, emailDigest } from '../shared/sync-store.mjs';

/**
 * Durable Teams bot records in the participants table (ADR-0088). Every key is
 * `TEAMS#…`; the IAM policy of each function narrows that further, and only the
 * message handler's role may write `TEAMS#REVIEW#…`, which is what makes a stored
 * review record evidence of a verified Teams decision.
 */
export const REGISTRATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CONTACT_ID = /^[1-9][0-9]{0,19}$/;
export const INSTALL_KEY = 'TEAMS#BOT#INSTALL';
export const signupKey = registrationId => `TEAMS#SIGNUP#${registrationId}`;
export const reviewKey = (contactId, domainId) => `TEAMS#REVIEW#${contactId}#${domainId}`;
export { emailDigest };

export function teamsKey(pk) {
  if (typeof pk !== 'string' || !/^TEAMS#(SIGNUP|BOT|REVIEW)#[a-zA-Z0-9#-]{1,200}$/.test(pk)) throw new TypeError('Invalid Teams key');
  return pk;
}

/** Strongly consistent reads and revision-conditional writes, like the sync store. */
export function createTeamsStore(config, overrides = {}) {
  const sync = createSyncStore(config, overrides);
  return {
    getRegistration: sync.getRegistration,
    /** The CRM sync claim for an applicant's email: the home of the HubSpot contact reference. */
    async getSyncClaim(email) {
      return sync.get(`SYNC#EMAIL#${emailDigest(email)}`);
    },
    async get(pk) {
      return decode((await sync.send('GetItemCommand', { TableName: config.participantsTableName,
        Key: { pk: { S: teamsKey(pk) } }, ConsistentRead: true })).Item);
    },
    async put(item, previous = null) {
      teamsKey(item.pk);
      const result = { ...item, revision: (previous?.revision ?? 0) + 1 };
      await sync.send('PutItemCommand', {
        TableName: config.participantsTableName, Item: encode(result),
        ConditionExpression: previous ? '#revision = :previous' : 'attribute_not_exists(pk)',
        ...(previous ? { ExpressionAttributeNames: { '#revision': 'revision' },
          ExpressionAttributeValues: { ':previous': attribute(previous.revision) } } : {}),
      });
      return result;
    },
  };
}
