import { createCrmClient } from './crm.mjs';
import { createDecisionFlow, errorResponse } from './decision.mjs';
import { createMicrosoftClient, serviceUrlOf } from './microsoft.mjs';
import { INSTALL_KEY, createTeamsStore } from './store.mjs';
import { Unauthorized, createTokenValidator } from './token.mjs';

/**
 * The bot's messaging endpoint (ADR-0088). Teams delivers every activity here
 * through the Bot Connector; the connector's JWT is verified before anything in
 * the body is read as fact. Three activities matter: the installation event
 * (which records the connector service URL to post cards to), Adaptive Card
 * button clicks, and everything else, which is acknowledged and ignored.
 */
const ENDPOINT = '/teams/messages';
const MAX_BODY_BYTES = 256 * 1024;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const utf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

class Rejected extends Error {
  constructor(statusCode) { super('Request rejected'); this.statusCode = statusCode; }
}
const reject = (statusCode = 400) => { throw new Rejected(statusCode); };
// Failures surface by stage and error class only; activities, tokens and messages never reach the log.
const trace = (stage, error) => { try { console.error(JSON.stringify({ event: 'teams_messages_failed', stage, error: error?.name ?? 'Error' })); } catch {} };

export function response(statusCode, body = {}) {
  return { statusCode, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(body) };
}

function rawBody(event) {
  if (event?.version !== '2.0') reject();
  if (event.rawPath !== ENDPOINT) reject(404);
  if (event.requestContext?.http?.method !== 'POST') reject(405);
  if (typeof event.body !== 'string') reject();
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body, 'utf8');
  if (raw.length > MAX_BODY_BYTES) reject(413);
  return raw;
}

function header(headers, name) {
  if (!object(headers)) return undefined;
  const matches = Object.entries(headers).filter(([key]) => key.toLowerCase() === name);
  return matches.length === 1 && typeof matches[0][1] === 'string' ? matches[0][1] : undefined;
}

export function parseActivity(raw, { botAppId, tenantId }) {
  let activity;
  try { activity = JSON.parse(utf8.decode(raw)); } catch { reject(); }
  if (!object(activity) || typeof activity.type !== 'string' || activity.channelId !== 'msteams') reject();
  try { serviceUrlOf(activity.serviceUrl); } catch { reject(); }
  if (activity.recipient?.id !== `28:${botAppId}`) reject(403);
  const tenant = activity.conversation?.tenantId ?? activity.channelData?.tenant?.id;
  if (typeof tenant !== 'string' || tenant.toLowerCase() !== tenantId.toLowerCase()) reject(403);
  return activity;
}

export function createMessagesHandler(config, deps) {
  const { botAppId, tenantId } = config;
  const validate = deps.validateToken ?? createTokenValidator({ botAppId, tenantId, now: deps.now });
  const decide = deps.decide ?? createDecisionFlow({ store: deps.store, crm: deps.crm, microsoft: deps.microsoft,
    sendHint: deps.sendHint, approverGroupId: config.approverGroupId, approvalsEnabled: config.approvalsEnabled, now: deps.now });
  const now = deps.now ?? Date.now;

  async function installed(activity) {
    const added = Array.isArray(activity.membersAdded) ? activity.membersAdded : [];
    if (!added.some(member => member?.id === `28:${botAppId}`)) return;
    const previous = await deps.store.get(INSTALL_KEY);
    await deps.store.put({ pk: INSTALL_KEY, serviceUrl: serviceUrlOf(activity.serviceUrl), tenantId,
      teamId: typeof activity.channelData?.team?.id === 'string' ? activity.channelData.team.id : null,
      conversationId: activity.conversation?.id ?? null, updatedAt: now() }, previous);
  }

  return async event => {
    let activity;
    try {
      const raw = rawBody(event);
      activity = parseActivity(raw, { botAppId, tenantId });
      await validate(header(event.headers, 'authorization'), activity);
    } catch (error) {
      if (error instanceof Unauthorized) return response(401, { error: 'Unauthorized' });
      if (!(error instanceof Rejected)) trace('authenticate', error);
      return response(error instanceof Rejected ? error.statusCode : 500, { error: 'Request rejected' });
    }
    try {
      if (activity.type === 'invoke') {
        if (activity.name !== 'adaptiveCard/action') return response(200, errorResponse(400, 'BadRequest', 'Unsupported invoke.'));
        return response(200, await decide(activity));
      }
      if (activity.type === 'conversationUpdate') await installed(activity);
      return response(200);
    } catch (error) {
      // Never log or return raw errors, activities or credentials.
      trace(activity.type === 'invoke' ? 'decide' : 'install', error);
      return response(500, { error: 'Service unavailable' });
    }
  };
}

let runtime;
export async function handler(event) {
  try {
    if (!runtime) {
      const env = process.env;
      const store = createTeamsStore({ registrationsTableName: env.REGISTRATIONS_TABLE_NAME, participantsTableName: env.PARTICIPANTS_TABLE_NAME });
      const sendHint = async contactId => {
        const aws = await import('@aws-sdk/client-sqs');
        await new aws.SQSClient({ maxAttempts: 2 }).send(new aws.SendMessageCommand({ QueueUrl: env.APPROVAL_QUEUE_URL,
          MessageBody: JSON.stringify({ schemaVersion: 1, contactIds: [contactId], receivedAt: Date.now() }) }));
      };
      runtime = createMessagesHandler({ botAppId: env.BOT_APP_ID, tenantId: env.TENANT_ID,
        approverGroupId: env.APPROVER_GROUP_ID, approvalsEnabled: env.APPROVALS_ENABLED === 'true' }, {
        store, microsoft: createMicrosoftClient({ secretArn: env.BOT_SECRET_ARN }),
        crm: env.BRIDGE_SECRET_ARN ? createCrmClient({ secretArn: env.BRIDGE_SECRET_ARN }) : null, sendHint });
    }
    return await runtime(event);
  } catch (error) {
    trace('runtime', error);
    return response(503, { error: 'Service unavailable' });
  }
}
