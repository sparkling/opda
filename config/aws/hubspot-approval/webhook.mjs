import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const PORTAL_ID = 144765514;
const APP_ID = 52397854;
const ENDPOINT = '/hubspot/approval';
const MAX_BODY_BYTES = 512 * 1024;
const MAX_EVENTS = 100;
const MAX_CONTACTS = 100;
const MAX_SIGNATURE_AGE_MS = 300000;
const MAX_SIGNATURE_FUTURE_MS = 60000;
const CONTACT_ID = /^[1-9][0-9]{0,19}$/;
const PROPERTIES = new Set(['opda_review_status', 'email']);
const OBJECT_EVENTS = new Set(['contact.deletion', 'contact.privacyDeletion', 'contact.restore']);
const utf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

class Rejected extends Error {
  constructor(statusCode) { super('Request rejected'); this.statusCode = statusCode; }
}
function reject(statusCode = 400) { throw new Rejected(statusCode); }
function response(statusCode) {
  return { statusCode, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(statusCode === 202 ? { accepted: true }
      : { error: statusCode === 503 ? 'Service unavailable' : 'Request rejected' }) };
}

function rawBody(event) {
  if (event?.version !== '2.0') reject();
  if (event.rawPath !== ENDPOINT) reject(404);
  if (event.requestContext?.http?.method !== 'POST') reject(405);
  if (event.rawQueryString !== undefined && event.rawQueryString !== '') reject();
  if (typeof event.body !== 'string'
    || ![true, false, undefined].includes(event.isBase64Encoded)) reject();
  if (event.isBase64Encoded) {
    if (event.body.length > Math.ceil(MAX_BODY_BYTES / 3) * 4) reject(413);
    // Buffer.from is deliberately permissive; require API Gateway's canonical encoding.
    if (event.body.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(event.body)) reject();
    const raw = Buffer.from(event.body, 'base64');
    if (raw.toString('base64') !== event.body) reject();
    if (raw.length > MAX_BODY_BYTES) reject(413);
    return raw;
  }
  if (Buffer.byteLength(event.body, 'utf8') > MAX_BODY_BYTES) reject(413);
  const raw = Buffer.from(event.body, 'utf8');
  if (raw.toString('utf8') !== event.body) reject();
  return raw;
}

function singleHeader(headers, name) {
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) reject(401);
  const matches = Object.entries(headers).filter(([key]) => key.toLowerCase() === name);
  if (matches.length > 1 || (matches.length === 1 && typeof matches[0][1] !== 'string')) reject(401);
  return matches[0]?.[1];
}

function requestSignature(headers, receivedAt) {
  const v3 = singleHeader(headers, 'x-hubspot-signature-v3');
  const version = singleHeader(headers, 'x-hubspot-signature-version');
  const v1 = singleHeader(headers, 'x-hubspot-signature');
  const timestamp = singleHeader(headers, 'x-hubspot-request-timestamp');
  // The version header labels the legacy digest, including on dual-header requests.
  if ((version !== undefined && version !== 'v1')
    || (v1 !== undefined && !/^[a-f0-9]{64}$/i.test(v1))) reject(401);
  if (v3 !== undefined) {
    if (!/^[A-Za-z0-9+/]{43}=$/.test(v3)) reject(401);
    const digest = Buffer.from(v3, 'base64');
    if (digest.length !== 32 || digest.toString('base64') !== v3) reject(401);
    if (typeof timestamp !== 'string' || !/^(?:0|[1-9][0-9]{0,15})$/.test(timestamp)) reject(401);
    const at = Number(timestamp);
    if (!Number.isSafeInteger(at) || receivedAt - at > MAX_SIGNATURE_AGE_MS
      || at - receivedAt > MAX_SIGNATURE_FUTURE_MS) reject(401);
    return { version: 3, digest, timestamp };
  }
  if (v1 === undefined) reject(401);
  return { version: 1, digest: Buffer.from(v1, 'hex') };
}

function configuredPublicUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new TypeError('Invalid webhook configuration'); }
  if (typeof value !== 'string' || url.protocol !== 'https:' || url.username || url.password || url.port
    || !/^[a-z0-9]{10}\.execute-api\.[a-z0-9-]+\.amazonaws\.com(?:\.cn)?$/.test(url.hostname)
    || value !== `${url.origin}${ENDPOINT}`) throw new TypeError('Invalid webhook configuration');
  // Only this canonical URL is signed. No query, escapes, stage, or user-controlled
  // host is allowed, so HubSpot's documented URI percent-decoding is an identity.
  return value;
}

function signingSecret(stored) {
  if (!stored || stored.portalId !== PORTAL_ID || stored.appId !== APP_ID
    || typeof stored.clientSecret !== 'string' || !stored.clientSecret.trim()
    || stored.clientSecret.length > 4096) throw new Error('Signing configuration unavailable');
  return stored.clientSecret;
}

function contactId(value) {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value <= 0) reject();
    return String(value);
  }
  if (typeof value !== 'string' || !CONTACT_ID.test(value)) reject();
  return value;
}

function contactHints(raw) {
  let events;
  try { events = JSON.parse(utf8.decode(raw)); } catch { reject(); }
  if (!Array.isArray(events) || events.length < 1 || events.length > MAX_EVENTS) reject();
  const ids = new Set();
  const add = value => {
    ids.add(contactId(value));
    if (ids.size > MAX_CONTACTS) reject();
  };
  for (const event of events) {
    if (!event || typeof event !== 'object' || Array.isArray(event)) reject();
    if (event.portalId !== PORTAL_ID || event.appId !== APP_ID) reject(403);
    // HubSpot's legacy docs show both field names. Contradictions are not hints.
    if (Object.hasOwn(event, 'subscriptionType') && Object.hasOwn(event, 'eventType')
      && event.subscriptionType !== event.eventType) reject();
    const type = event.subscriptionType ?? event.eventType;
    if (type === 'contact.propertyChange') {
      if (!PROPERTIES.has(event.propertyName)) reject();
      add(event.objectId);
    } else if (OBJECT_EVENTS.has(type)) {
      add(event.objectId);
    } else if (type === 'contact.merge') {
      if (!Array.isArray(event.mergedObjectIds) || event.mergedObjectIds.length < 1
        || event.mergedObjectIds.length > MAX_CONTACTS) reject();
      add(event.primaryObjectId);
      event.mergedObjectIds.forEach(add);
      if (Object.hasOwn(event, 'newObjectId')) add(event.newObjectId);
      if (Object.hasOwn(event, 'objectId')) add(event.objectId);
    } else {
      // An unsupported event rejects the whole batch, never a partial enqueue.
      reject();
    }
  }
  return [...ids];
}

let secretsClient, queueClient;
async function getSecret(secretArn) {
  const aws = await import('@aws-sdk/client-secrets-manager');
  secretsClient ??= new aws.SecretsManagerClient({ maxAttempts: 2 });
  const stored = await secretsClient.send(new aws.GetSecretValueCommand({ SecretId: secretArn }),
    { abortSignal: AbortSignal.timeout(2000) });
  return JSON.parse(stored.SecretString);
}
async function sendMessage(input) {
  const aws = await import('@aws-sdk/client-sqs');
  queueClient ??= new aws.SQSClient({ maxAttempts: 2 });
  await queueClient.send(new aws.SendMessageCommand(input), { abortSignal: AbortSignal.timeout(2000) });
}

/**
 * Authenticated invalidation hints, never approval authority. The worker must
 * re-read current CRM and durable participant state for every received contact.
 * Verify preferred v3 HMAC or legacy v1 against exact bytes, never reserialized JSON:
 * https://developers.hubspot.com/docs/apps/legacy-apps/authentication/validating-requests
 * https://developers.hubspot.com/docs/api-reference/legacy/webhooks/guide
 *
 * @param {{signingSecretArn: string, queueUrl: string, publicWebhookUrl: string}} config
 * @param {{getSecret?: Function, sendMessage?: Function, now?: Function}} deps
 */
export function createWebhookHandler(config, deps = {}) {
  if (typeof config?.signingSecretArn !== 'string' || !config.signingSecretArn.trim()
    || typeof config?.queueUrl !== 'string' || !config.queueUrl.trim()) {
    throw new TypeError('Invalid webhook configuration');
  }
  const publicUrl = configuredPublicUrl(config.publicWebhookUrl);
  const read = deps.getSecret ?? getSecret;
  const send = deps.sendMessage ?? sendMessage;
  const now = deps.now ?? Date.now;
  return async event => {
    try {
      const raw = rawBody(event);
      const receivedAt = now();
      if (!Number.isSafeInteger(receivedAt) || receivedAt < 0) throw new Error('Clock unavailable');
      const supplied = requestSignature(event.headers, receivedAt);
      const secret = signingSecret(await read(config.signingSecretArn));
      const expected = supplied.version === 3
        ? createHmac('sha256', secret).update('POST' + publicUrl, 'utf8').update(raw).update(supplied.timestamp, 'utf8').digest()
        : createHash('sha256').update(secret, 'utf8').update(raw).digest();
      // A present v3 signature has exactly one verification path: never retry v1.
      if (!timingSafeEqual(expected, supplied.digest)) reject(401);
      const contactIds = contactHints(raw);
      // Deliberately exclude raw payloads, property values, emails and event IDs.
      // v1 has no timestamp binding: duplicate/replayed hints must be safe downstream.
      await send({ QueueUrl: config.queueUrl, MessageBody: JSON.stringify({
        schemaVersion: 1, contactIds, receivedAt, receiptId: createHash('sha256').update(raw).digest('hex'),
      }) });
      return response(202);
    } catch (error) {
      // Never log or return raw errors, bodies, signatures or signing secrets.
      return response(error instanceof Rejected ? error.statusCode : 503);
    }
  };
}

let runtime;
export async function handler(event) {
  try {
    runtime ??= createWebhookHandler({ signingSecretArn: process.env.SIGNING_SECRET_ARN,
      queueUrl: process.env.APPROVAL_QUEUE_URL, publicWebhookUrl: process.env.PUBLIC_WEBHOOK_URL });
    return await runtime(event);
  } catch {
    return response(503);
  }
}
