import { createHash } from 'node:crypto';

export const sessionKey = (token) => `SESSION#${createHash('sha256').update(token).digest('hex')}`;

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
      aws, client: overrides.client ?? new aws.DynamoDBClient({ maxAttempts: 2 }),
    }));
    const { aws, client } = await services;
    return client.send(new aws[command](input));
  }

  async function get(table, pk) {
    const result = await send('GetItemCommand', { TableName: table, Key: { pk: { S: pk } }, ConsistentRead: true });
    return decode(result.Item);
  }

  return {
    getParticipant: (sub) => get(config.participantsTableName, `USER#${sub}`),
    getSession: (key) => get(config.sessionsTableName, key),
    deleteSession: (key) => send('DeleteItemCommand', { TableName: config.sessionsTableName, Key: { pk: { S: key } } }),
    async issueSession({ participant, session, now }) {
      if (participant.active !== true) throw new Error('Participant is inactive.');
      const guard = {
        TableName: config.participantsTableName,
        Key: { pk: { S: participant.pk } },
        ConditionExpression: 'attribute_exists(pk) AND #review = :approved AND #suspended = :false'
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
      let participantWrite = { ConditionCheck: guard };
      if (participant.enrolmentStatus === 'not_invited') {
        participantWrite = { Update: {
          ...guard,
          UpdateExpression: 'SET #enrolment = :complete, #completed = :completed, #verifiedAt = :completed'
            + ', #verifiedEmail = :verifiedEmail, #verifiedSub = :verifiedSub, #verifiedIssuer = :verifiedIssuer',
          ExpressionAttributeNames: {
            ...guard.ExpressionAttributeNames, '#completed': 'completedAt', '#verifiedAt': 'verifiedEmailAt',
            '#verifiedEmail': 'verifiedEmail', '#verifiedSub': 'verifiedCognitoSub', '#verifiedIssuer': 'verifiedIssuer',
          },
          ExpressionAttributeValues: {
            ...guard.ExpressionAttributeValues, ':complete': { S: 'complete' },
            ':completed': { S: new Date(now * 1000).toISOString() },
            ':verifiedEmail': attribute(session.email), ':verifiedSub': attribute(session.sub),
            ':verifiedIssuer': attribute(config.issuer),
          },
        } };
      }
      const sessionItem = Object.fromEntries(['pk', 'sub', 'participantId', 'email', 'accessVersion', 'createdAt', 'expiresAt']
        .map((key) => [key, attribute(session[key])]));
      await send('TransactWriteItemsCommand', { TransactItems: [participantWrite, { Put: {
        TableName: config.sessionsTableName, Item: sessionItem, ConditionExpression: 'attribute_not_exists(pk)',
      } }] });
    },
  };
}
