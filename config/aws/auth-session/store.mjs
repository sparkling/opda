import { createHash } from 'node:crypto';

export const sessionKey = (token) => `SESSION#${createHash('sha256').update(token).digest('hex')}`;
export const identityKey = ({ issuer, sub }) => `IDENTITY#${createHash('sha256').update(JSON.stringify([issuer, sub])).digest('hex')}`;

function attribute(value) {
  if (typeof value === 'string') return { S: value };
  if (typeof value === 'boolean') return { BOOL: value };
  if (Number.isFinite(value)) return { N: String(value) };
  throw new Error('Unsupported authentication attribute.');
}

function decodeValue(value) {
  if (typeof value?.S === 'string') return value.S;
  if (value?.N !== undefined && Number.isFinite(Number(value.N))) return Number(value.N);
  if (typeof value?.BOOL === 'boolean') return value.BOOL;
  if (value?.NULL === true) return null;
  if (Array.isArray(value?.L)) return value.L.map(decodeValue);
  if (value?.M && typeof value.M === 'object') return decode(value.M);
  throw new Error('Unsupported authentication attribute.');
}
const decode = (item) => item
  ? Object.fromEntries(Object.entries(item).map(([key, value]) => [key, decodeValue(value)])) : null;

// The Lambda runtime supplies AWS SDK v3; no provider credentials or tokens are stored.
export function createStore(config, overrides = {}) {
  let services;
  async function send(command, input) {
    services ??= (overrides.loadAws ?? (() => import('@aws-sdk/client-dynamodb')))().then((aws) => ({
      aws, client: overrides.client ?? new aws.DynamoDBClient({ region: config.region, maxAttempts: 2 }),
    }));
    const { aws, client } = await services;
    return client.send(new aws[command](input), { abortSignal: AbortSignal.timeout(2000) });
  }

  async function get(table, pk) {
    const result = await send('GetItemCommand', { TableName: table, Key: { pk: { S: pk } }, ConsistentRead: true });
    return decode(result.Item);
  }

  async function resolveParticipant(identity) {
    const table = config.participantsTableName, key = identityKey(identity);
    const existing = await get(table, key);
    if (existing) {
      if (existing.issuer !== identity.issuer || existing.subject !== identity.sub || existing.email !== identity.email) return null;
      const participant = await get(table, `USER#${existing.sub}`);
      if (!participant || participant.auth0BindingKey !== key || participant.participantId !== existing.participantId
        || participant.cognitoSub !== existing.sub || participant.email !== identity.email) return null;
      return { participant, binding: { record: existing, first: false } };
    }
    // Email locates a reviewed, unbound enrolment, never a second-provider link.
    const emailKey = `EMAIL#${createHash('sha256').update(identity.email).digest('hex')}`;
    const reserved = await get(table, emailKey);
    const sourceKey = reserved?.approvalKey ?? reserved?.importKey;
    const knownSource = typeof sourceKey === 'string' && (
      /^(?:CRM#CONTACT#|IMPORT#hubspot-existing-contacts-2026-09-08#)[1-9][0-9]{0,19}$/u.test(sourceKey)
      || sourceKey === `IMPORT#legacy-auth0-allowlist-2026-09-08#${emailKey.slice('EMAIL#'.length)}`);
    if (!knownSource) return null;
    const source = await get(table, sourceKey);
    if (!source || source.participantId !== reserved.participantId || source.email !== identity.email
      || (sourceKey.startsWith('IMPORT#') && source.phase !== 'complete')
      || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/iu.test(source.cognitoSub ?? '')) return null;
    const participant = await get(table, `USER#${source.cognitoSub}`);
    if (!participant || participant.participantId !== reserved.participantId || participant.auth0BindingKey !== undefined
      || participant.cognitoSub !== source.cognitoSub || participant.email !== identity.email) return null;
    return { participant, binding: { first: true, emailKey, sourceKey, record: {
      pk: key, issuer: identity.issuer, subject: identity.sub, email: identity.email,
      sub: participant.cognitoSub, participantId: participant.participantId,
    } } };
  }

  return {
    getParticipant: (sub) => get(config.participantsTableName, `USER#${sub}`),
    resolveParticipant,
    getSession: (key) => get(config.sessionsTableName, key),
    deleteSession: (key) => send('DeleteItemCommand', { TableName: config.sessionsTableName, Key: { pk: { S: key } } }),
    async issueSession({ participant, session, now, identity, binding }) {
      if (participant.active !== true) throw new Error('Participant is inactive.');
      const guard = {
        TableName: config.participantsTableName,
        Key: { pk: { S: participant.pk } },
        ConditionExpression: 'attribute_exists(pk) AND #review = :approved AND #suspended = :false'
          + ' AND attribute_not_exists(erasedAt) AND attribute_not_exists(deletedAt)'
          + ' AND #version = :version AND #sub = :sub AND #email = :email AND #participant = :participant'
          + ' AND #enrolment = :enrolment AND #active = :active'
          + ' AND (attribute_not_exists(#expires) OR #expires > :now)',
        ExpressionAttributeNames: {
          '#review': 'reviewStatus', '#suspended': 'suspended', '#version': 'accessVersion',
          '#sub': 'cognitoSub', '#email': 'email', '#participant': 'participantId',
          '#enrolment': 'enrolmentStatus', '#active': 'active', '#expires': 'expiresAt',
        },
        ExpressionAttributeValues: {
          ':approved': { S: 'approved' }, ':false': { BOOL: false }, ':version': attribute(participant.accessVersion),
          ':sub': attribute(participant.cognitoSub), ':email': attribute(participant.email),
          ':participant': attribute(participant.participantId), ':enrolment': attribute(participant.enrolmentStatus),
          ':active': { BOOL: true }, ':now': attribute(now),
        },
      };
      const identityWrites = [];
      if (config.provider === 'auth0') {
        const record = binding?.record;
        if (!identity || !record || record.pk !== identityKey(identity) || record.sub !== session.sub
          || record.email !== session.email || record.participantId !== participant.participantId
          || record.issuer !== identity.issuer || record.subject !== identity.sub
          || session.auth0BindingKey !== record.pk) throw new Error('Invalid identity binding.');
        guard.ExpressionAttributeNames['#auth0Key'] = 'auth0BindingKey';
        guard.ConditionExpression += binding.first ? ' AND attribute_not_exists(#auth0Key)' : ' AND #auth0Key = :auth0Key';
        if (!binding.first) guard.ExpressionAttributeValues[':auth0Key'] = attribute(record.pk);
        const bindingValues = { ':pid': attribute(record.participantId), ':sub': attribute(record.sub), ':email': attribute(record.email) };
        if (binding.first) {
          identityWrites.push({ Put: { TableName: config.participantsTableName,
            Item: Object.fromEntries(Object.entries({ ...record, createdAt: now }).map(([k, v]) => [k, attribute(v)])),
            ConditionExpression: 'attribute_not_exists(pk)' } });
          identityWrites.push({ ConditionCheck: { TableName: config.participantsTableName,
            Key: { pk: attribute(binding.emailKey) }, ConditionExpression: 'participantId = :pid',
            ExpressionAttributeValues: { ':pid': bindingValues[':pid'] } } });
          identityWrites.push({ ConditionCheck: { TableName: config.participantsTableName,
            Key: { pk: attribute(binding.sourceKey) }, ConditionExpression: 'participantId = :pid AND cognitoSub = :sub AND email = :email',
            ExpressionAttributeValues: bindingValues } });
        } else {
          identityWrites.push({ ConditionCheck: { TableName: config.participantsTableName,
            Key: { pk: attribute(record.pk) }, ConditionExpression: 'participantId = :pid AND #sub = :sub AND email = :email',
            ExpressionAttributeNames: { '#sub': 'sub' }, ExpressionAttributeValues: bindingValues } });
        }
      }
      let participantWrite = { ConditionCheck: guard };
      if (participant.enrolmentStatus === 'not_invited') {
        participantWrite = { Update: {
          ...guard,
          UpdateExpression: 'SET #enrolment = :complete, #completed = :completed, #verifiedAt = :completed'
            + ', #verifiedEmail = :verifiedEmail, #verifiedSub = :verifiedSub, #verifiedIssuer = :verifiedIssuer',
          ExpressionAttributeNames: {
            ...guard.ExpressionAttributeNames, '#completed': 'completedAt', '#verifiedAt': 'verifiedEmailAt',
            '#verifiedEmail': 'verifiedEmail', '#verifiedSub': config.provider === 'auth0' ? 'verifiedSubject' : 'verifiedCognitoSub', '#verifiedIssuer': 'verifiedIssuer',
          },
          ExpressionAttributeValues: {
            ...guard.ExpressionAttributeValues, ':complete': { S: 'complete' },
            ':completed': { S: new Date(now * 1000).toISOString() },
            ':verifiedEmail': attribute(session.email), ':verifiedSub': attribute(identity?.sub ?? session.sub),
            ':verifiedIssuer': attribute(config.issuer),
          },
        } };
      }
      if (binding?.first) {
        const update = participantWrite.Update ?? { ...guard, UpdateExpression: 'SET #auth0Key = :auth0Key' };
        if (participantWrite.Update) update.UpdateExpression += ', #auth0Key = :auth0Key';
        update.ExpressionAttributeValues[':auth0Key'] = attribute(binding.record.pk);
        participantWrite = { Update: update };
      }
      const sessionItem = Object.fromEntries(['pk', 'sub', 'participantId', 'email', 'accessVersion', 'createdAt', 'expiresAt', 'auth0BindingKey']
        .filter(key => session[key] !== undefined)
        .map((key) => [key, attribute(session[key])]));
      await send('TransactWriteItemsCommand', { TransactItems: [participantWrite, ...identityWrites, { Put: {
        TableName: config.sessionsTableName, Item: sessionItem, ConditionExpression: 'attribute_not_exists(pk)',
      } }] });
    },
  };
}
