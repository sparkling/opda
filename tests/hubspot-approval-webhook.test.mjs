import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createWebhookHandler } from '../config/aws/hubspot-approval/webhook.mjs';

const now = Date.parse('2026-09-08T20:00:00Z');
const clientSecret = 'synthetic-signing-fixture-not-a-real-credential';
const secret = { portalId: 144765514, appId: 52397854, clientSecret };
const config = {
  signingSecretArn: 'arn:aws:secretsmanager:eu-west-2:123456789012:secret:opda-signing-fixture',
  queueUrl: 'https://sqs.eu-west-2.amazonaws.com/123456789012/opda-hubspot-approval',
};
const maxBytes = 512 * 1024;
const hash = value => createHash('sha256').update(value).digest('hex');
const sign = raw => createHash('sha256').update(clientSecret).update(raw).digest('hex');
const hint = (patch = {}) => ({
  portalId: secret.portalId, appId: secret.appId, objectId: 123,
  subscriptionType: 'contact.propertyChange', propertyName: 'opda_review_status',
  propertyValue: 'approved', occurredAt: now - 1000, eventId: 5, ...patch,
});
function request(payload = [hint()], { base64 = false, headers = {} } = {}) {
  const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return {
    version: '2.0', rawPath: '/hubspot/approval', rawQueryString: '',
    requestContext: { http: { method: 'POST', path: '/hubspot/approval' } },
    headers: { 'x-hubspot-signature': sign(raw), 'x-hubspot-signature-version': 'v1', ...headers },
    body: base64 ? Buffer.from(raw).toString('base64') : raw, isBase64Encoded: base64,
  };
}
function setup(overrides = {}) {
  const calls = [];
  const sent = [];
  const handler = createWebhookHandler(config, {
    getSecret: async arn => { calls.push(['secret', arn]); return secret; },
    sendMessage: async message => { sent.push(message); return { MessageId: 'durable-receipt' }; },
    now: () => now, ...overrides,
  });
  return { handler, calls, sent };
}

test('authenticates v1 raw bytes and queues exactly one reference-only receipt', async () => {
  const f = setup();
  const event = request();
  assert.equal((await f.handler(event)).statusCode, 202);
  assert.deepEqual(f.calls, [['secret', config.signingSecretArn]]);
  assert.equal(f.sent.length, 1);
  assert.deepEqual(f.sent[0], { QueueUrl: config.queueUrl, MessageBody: JSON.stringify({
    schemaVersion: 1, contactIds: ['123'], receivedAt: now, receiptId: hash(event.body),
  }) });
});

test('missing, invalid, truncated, forged, duplicate and mutated signatures never enqueue', async () => {
  const events = [request(), request(), request(), request(), request(), request()];
  delete events[0].headers['x-hubspot-signature'];
  events[1].headers['x-hubspot-signature'] = '0'.repeat(64);
  events[2].headers['x-hubspot-signature'] = 'a'.repeat(63);
  events[3].headers['x-hubspot-signature'] = 'z'.repeat(64);
  events[4].headers['X-HubSpot-Signature'] = events[4].headers['x-hubspot-signature'];
  events[5].body += ' ';
  for (const event of events) {
    const f = setup();
    assert.equal((await f.handler(event)).statusCode, 401);
    assert.equal(f.sent.length, 0);
  }
});

test('header case and an omitted v1 version are accepted without loosening authentication', async () => {
  const f = setup();
  const event = request();
  event.headers = { 'X-HubSpot-Signature': sign(event.body).toUpperCase() };
  assert.equal((await f.handler(event)).statusCode, 202);
});

test('never downgrades a v3-bearing request or accepts another declared signature version', async () => {
  for (const headers of [
    { 'x-hubspot-signature-version': 'v2' }, { 'x-hubspot-signature-version': 'v3' },
    { 'x-hubspot-signature-version': '' }, { 'x-hubspot-signature-version': 'v1,v2' },
    { 'x-hubspot-signature-v3': 'forged' }, { 'X-HubSpot-Signature-V3': '' },
    { 'X-HubSpot-Signature-Version': 'v1' },
  ]) {
    const f = setup();
    assert.equal((await f.handler(request([hint()], { headers }))).statusCode, 401);
    assert.equal(f.sent.length, 0);
  }
});

test('validates exact numeric portal and app IDs for every event before enqueuing anything', async () => {
  for (const patch of [
    { portalId: 1 }, { appId: 1 }, { portalId: String(secret.portalId) },
    { appId: String(secret.appId) }, { portalId: null }, { appId: null },
  ]) {
    const f = setup();
    assert.equal((await f.handler(request([hint(), hint(patch)]))).statusCode, 403);
    assert.equal(f.sent.length, 0);
  }
});

test('requires the separately pinned signing secret and hides dependency errors', async () => {
  for (const stored of [undefined, null, {}, { ...secret, portalId: 1 }, { ...secret, appId: 1 },
    { ...secret, portalId: String(secret.portalId) }, { ...secret, clientSecret: '' },
    { ...secret, clientSecret: ' ' }, { ...secret, clientSecret: 123 },
    { portalId: secret.portalId, appId: secret.appId, accessToken: 'not-a-signing-secret' }]) {
    const f = setup({ getSecret: async () => stored });
    assert.equal((await f.handler(request())).statusCode, 503);
    assert.equal(f.sent.length, 0);
  }
  const f = setup({ getSecret: async () => { throw new Error('synthetic@example.test secret text'); } });
  const response = await f.handler(request());
  assert.equal(response.statusCode, 503);
  assert.doesNotMatch(JSON.stringify(response), /synthetic|secret text/);
});

test('duplicates, old event timestamps and approval or email values remain only contact hints', async () => {
  const f = setup();
  const event = request([
    hint({ occurredAt: now, propertyValue: 'approved' }),
    hint({ occurredAt: 1, propertyValue: 'received', attemptNumber: 9 }),
    hint({ objectId: '123', propertyName: 'email', propertyValue: 'synthetic@example.test' }),
    hint({ objectId: 456, occurredAt: 0, propertyValue: 'rejected' }),
  ]);
  assert.equal((await f.handler(event)).statusCode, 202);
  assert.equal((await f.handler(event)).statusCode, 202);
  assert.equal(f.sent.length, 2);
  for (const sent of f.sent) {
    assert.deepEqual(JSON.parse(sent.MessageBody), {
      schemaVersion: 1, contactIds: ['123', '456'], receivedAt: now, receiptId: hash(event.body),
    });
    assert.doesNotMatch(sent.MessageBody, /approved|received"|rejected|email|synthetic|occurredAt|eventId/);
  }
});

test('acknowledges only after the durable queue send completes', async () => {
  let release, started;
  const sending = new Promise(resolve => { started = resolve; });
  const pendingSend = new Promise(resolve => { release = resolve; });
  const f = setup({ sendMessage: async () => { started(); await pendingSend; } });
  let acknowledged = false;
  const pending = f.handler(request()).then(response => { acknowledged = true; return response; });
  await sending;
  assert.equal(acknowledged, false);
  release();
  assert.equal((await pending).statusCode, 202);
});

test('queue failure returns a generic retryable 503 and replay attempts a fresh durable send', async () => {
  let sends = 0;
  const f = setup({ sendMessage: async () => {
    if (++sends === 1) throw new Error('synthetic@example.test private queue failure');
  } });
  const event = request();
  const first = await f.handler(event);
  assert.equal(first.statusCode, 503);
  assert.doesNotMatch(JSON.stringify(first), /synthetic|private queue/);
  assert.equal((await f.handler(event)).statusCode, 202);
  assert.equal(sends, 2);
});

test('uses decoded base64 raw bytes, retaining whitespace and non-ASCII signature fidelity', async () => {
  const f = setup();
  const raw = `\n ${JSON.stringify([hint({ propertyValue: 'synthetic-é-🏡' })], null, 2)}\n`;
  assert.equal((await f.handler(request(raw, { base64: true }))).statusCode, 202);
  assert.equal(JSON.parse(f.sent[0].MessageBody).receiptId, hash(raw));
  const changed = request(raw, { base64: true });
  changed.headers['x-hubspot-signature'] = sign(JSON.stringify(JSON.parse(raw)));
  assert.equal((await f.handler(changed)).statusCode, 401);
});

test('rejects malformed base64, invalid UTF-8, and invalid base64 encoding flags', async () => {
  for (const body of ['!', 'YQ', 'YR==', 'W10=\n', ' W10=']) {
    const f = setup();
    assert.equal((await f.handler({ ...request(), body, isBase64Encoded: true })).statusCode, 400);
    assert.equal(f.sent.length, 0);
  }
  const invalidUtf8 = Buffer.from([0x5b, 0x22, 0xc3, 0x28, 0x22, 0x5d]);
  const f = setup();
  assert.equal((await f.handler({ ...request(), body: invalidUtf8.toString('base64'), isBase64Encoded: true,
    headers: { 'x-hubspot-signature': sign(invalidUtf8) } })).statusCode, 400);
  assert.equal((await f.handler({ ...request(), isBase64Encoded: 'true' })).statusCode, 400);
  assert.equal(f.sent.length, 0);
});

test('enforces a 512 KiB byte limit before secret access for plain and base64 requests', async () => {
  const payload = JSON.stringify([hint()]);
  const exact = payload + ' '.repeat(maxBytes - Buffer.byteLength(payload));
  for (const base64 of [false, true]) {
    const f = setup();
    assert.equal((await f.handler(request(exact, { base64 }))).statusCode, 202);
    f.calls.length = 0;
    assert.equal((await f.handler(request(exact + ' ', { base64 }))).statusCode, 413);
    assert.equal(f.calls.length, 0);
    assert.equal(f.sent.length, 1);
  }
  const f = setup();
  assert.equal((await f.handler(request('é'.repeat(maxBytes / 2 + 1)))).statusCode, 413);
  assert.equal(f.calls.length, 0);
});

test('requires JSON arrays of one through 100 object events', async () => {
  for (const payload of ['not json', '', null, {}, [], [null], [false], [1], Array(101).fill(hint())]) {
    const f = setup();
    assert.equal((await f.handler(request(payload))).statusCode, 400);
    assert.equal(f.sent.length, 0);
  }
  const f = setup();
  assert.equal((await f.handler(request(Array.from({ length: 100 }, (_, i) => hint({ objectId: i + 1 }))))).statusCode, 202);
  assert.equal(JSON.parse(f.sent[0].MessageBody).contactIds.length, 100);
});

test('accepts deletion, privacy deletion and restoration only as contact-ID hints', async () => {
  const f = setup();
  for (const subscriptionType of ['contact.deletion', 'contact.privacyDeletion', 'contact.restore']) {
    const event = hint({ subscriptionType });
    delete event.propertyName;
    delete event.propertyValue;
    assert.equal((await f.handler(request([event]))).statusCode, 202);
  }
  assert.equal(f.sent.length, 3);
  assert.ok(f.sent.every(sent => JSON.parse(sent.MessageBody).contactIds[0] === '123'));
});

test('accepts either documented event-type field but refuses contradictory type fields', async () => {
  const f = setup();
  const event = hint({ eventType: 'contact.propertyChange' });
  delete event.subscriptionType;
  assert.equal((await f.handler(request([event]))).statusCode, 202);
  event.subscriptionType = 'contact.deletion';
  assert.equal((await f.handler(request([event]))).statusCode, 400);
  assert.equal(f.sent.length, 1);
});

test('rejects unsupported subscriptions and properties for the whole batch', async () => {
  for (const patch of [
    { subscriptionType: 'contact.creation' }, { subscriptionType: 'company.propertyChange' },
    { subscriptionType: 'contact.associationChange' }, { subscriptionType: null },
    { propertyName: 'opda_active' }, { propertyName: 'opda_enrolment_status' }, { propertyName: null },
  ]) {
    const f = setup();
    assert.equal((await f.handler(request([hint(), hint(patch)]))).statusCode, 400);
    assert.equal(f.sent.length, 0);
  }
});

test('rejects noncanonical, unsafe and overlong contact IDs without coercion', async () => {
  for (const objectId of [0, -1, 1.2, Number.MAX_SAFE_INTEGER + 1, '01', '+1', '1e3', '../1',
    '1'.repeat(21), true, null, {}, ['123']]) {
    const f = setup();
    assert.equal((await f.handler(request([hint({ objectId })]))).statusCode, 400);
    assert.equal(f.sent.length, 0);
  }
  const f = setup();
  assert.equal((await f.handler(request([hint({ objectId: '18446744073709551615' })]))).statusCode, 202);
  assert.deepEqual(JSON.parse(f.sent[0].MessageBody).contactIds, ['18446744073709551615']);
});

test('merge includes primary, merged, new and optional object IDs, deduplicated', async () => {
  const f = setup();
  const merged = hint({ subscriptionType: 'contact.merge', objectId: 3,
    primaryObjectId: 1, mergedObjectIds: [2, '3', 2], newObjectId: 4 });
  assert.equal((await f.handler(request([merged]))).statusCode, 202);
  assert.deepEqual(JSON.parse(f.sent[0].MessageBody).contactIds, ['1', '2', '3', '4']);
  delete merged.objectId;
  delete merged.newObjectId;
  assert.equal((await f.handler(request([merged]))).statusCode, 202);
  assert.deepEqual(JSON.parse(f.sent[1].MessageBody).contactIds, ['1', '2', '3']);
});

test('rejects malformed merge identifiers and unbounded merge arrays', async () => {
  for (const patch of [{ primaryObjectId: null }, { mergedObjectIds: [] }, { mergedObjectIds: '2' },
    { mergedObjectIds: [2, '02'] }, { mergedObjectIds: Array(101).fill(2) },
    { newObjectId: '../4' }, { objectId: false }]) {
    const f = setup();
    assert.equal((await f.handler(request([hint({ subscriptionType: 'contact.merge', objectId: 1,
      primaryObjectId: 1, mergedObjectIds: [2], newObjectId: 3, ...patch })]))).statusCode, 400);
    assert.equal(f.sent.length, 0);
  }
});

test('bounds all expanded merge IDs across the entire request to 100 distinct contacts', async () => {
  const f = setup();
  const merged = hint({ subscriptionType: 'contact.merge', objectId: 1, primaryObjectId: 1,
    mergedObjectIds: Array.from({ length: 99 }, (_, i) => i + 2), newObjectId: 1 });
  assert.equal((await f.handler(request([merged]))).statusCode, 202);
  assert.equal(JSON.parse(f.sent[0].MessageBody).contactIds.length, 100);
  assert.equal((await f.handler(request([merged, hint({ objectId: 101 })]))).statusCode, 400);
  assert.equal(f.sent.length, 1);
});

test('enforces API Gateway HTTP API v2, the exact route, POST and string bodies', async () => {
  for (const [patch, status] of [
    [{ version: '1.0' }, 400], [{ rawPath: '/elsewhere' }, 404],
    [{ requestContext: { http: { method: 'GET' } } }, 405], [{ body: null }, 400],
    [{ body: {} }, 400], [{ rawQueryString: 'unexpected=1' }, 400],
  ]) {
    const f = setup();
    assert.equal((await f.handler({ ...request(), ...patch })).statusCode, status);
    assert.equal(f.sent.length, 0);
    assert.equal(f.calls.length, 0);
  }
});

test('bad configuration or receipt clocks cannot produce an accepted message', async () => {
  for (const bad of [{}, { ...config, signingSecretArn: '' }, { ...config, queueUrl: '' }]) {
    assert.throws(() => createWebhookHandler(bad), /configuration/i);
  }
  for (const timestamp of [NaN, 1.5, -1, '123']) {
    const f = setup({ now: () => timestamp });
    assert.equal((await f.handler(request())).statusCode, 503);
    assert.equal(f.sent.length, 0);
  }
});
