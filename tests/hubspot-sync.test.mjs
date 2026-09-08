import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createHandler, createWorker, parseSubmissionMessage, RetryLater } from '../config/aws/hubspot-sync/index.mjs';
import { createHubSpotClient } from '../config/aws/hubspot-sync/client.mjs';
import { createStore } from '../config/aws/hubspot-sync/store.mjs';

const now = Date.parse('2026-09-08T20:00:00Z');
const id = '00000000-0000-4000-8000-000000000001';
const otherId = '00000000-0000-4000-8000-000000000002';
const queueArn = 'arn:aws:sqs:eu-west-2:123456789012:opda-hubspot-signups';
const registration = (registrationId = id) => ({
  registrationId, fullName: 'Synthetic Example Person', email: 'synthetic@example.test',
  organisation: 'Example organisation', role: 'Research and domain expertise',
  workingGroups: ['conveyancing', 'finance-and-banking'], contributions: ['review-model-candidates'],
  relevantPerspective: 'Synthetic professional perspective', acknowledgement: true,
  privacyNoticeVersion: '2026-09-08', status: 'received', createdAt: now - 10000,
  expiresAt: Math.floor(now / 1000) + 10000,
});
const message = (registrationId = id) => ({
  messageId: 'message-1', eventSource: 'aws:sqs', eventSourceARN: queueArn, receiptHandle: 'opaque',
  body: JSON.stringify({ schemaVersion: 1, eventId: 'stream-event-1',
    eventType: 'working-group-interest.received.v1', occurredAt: new Date(now - 10000).toISOString(),
    record: { kind: 'working-group-interest', id: registrationId } }),
});
function setup(overrides = {}) {
  const items = new Map();
  const registrations = new Map([[id, registration()], [otherId, registration(otherId)]]);
  const calls = [];
  const store = {
    async get(pk) { return structuredClone(items.get(pk) ?? null); },
    async getRegistration(registrationId) { return structuredClone(registrations.get(registrationId)); },
    async put(item, previous = null) {
      const current = items.get(item.pk);
      if ((current?.revision ?? null) !== (previous?.revision ?? null)) throw new Error('Conditional conflict');
      const saved = { ...structuredClone(item), revision: (previous?.revision ?? 0) + 1 };
      items.set(item.pk, saved);
      return structuredClone(saved);
    },
    async authorizeCreation(claim, source, timestamp) {
      calls.push(['authorize', source.registrationId]);
      return store.put({ ...claim, state: 'creating', attemptedAt: timestamp }, claim);
    },
    ...overrides.store,
  };
  const hubspot = {
    async findContacts(email) { calls.push(['find', email]); return []; },
    async createContact(properties) { calls.push(['create', properties]); return { id: '123', email: properties.email }; },
    ...overrides.hubspot,
  };
  const worker = createWorker({ store, hubspot, now: () => now, newId: () => 'pending-random-id',
    transferNoticeVersion: '2026-09-08', ...overrides.worker });
  return { items, registrations, calls, store, hubspot, worker };
}

test('validates a reference-only event and rejects queue, kind, identifier and table injection', () => {
  assert.equal(parseSubmissionMessage(message(), queueArn), id);
  const body = JSON.parse(message().body);
  for (const patch of [{ eventType: 'newsletter-subscription.received.v1' }, { schemaVersion: 2 },
    { record: { kind: 'working-group-interest', id: '../other' } },
    { record: { ...body.record, tableName: 'other-table' } }, { email: 'injected@example.test' }]) {
    assert.throws(() => parseSubmissionMessage({ ...message(), body: JSON.stringify({ ...body, ...patch }) }, queueArn));
  }
  assert.throws(() => parseSubmissionMessage(message(), `${queueArn}-shared`));
});

test('creates only a lossless pending contact and makes duplicate deliveries inert', async () => {
  const f = setup();
  await f.worker(id);
  await f.worker(id);
  const writes = f.calls.filter(([action]) => action === 'create');
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0][1], {
    email: 'synthetic@example.test', company: 'Example organisation', opda_full_name: 'Synthetic Example Person',
    opda_role_or_expertise: 'Research and domain expertise', opda_requested_working_groups: 'finance-and-banking;conveyancing',
    opda_contribution_preferences: 'review-model-candidates', opda_relevant_perspective: 'Synthetic professional perspective',
    opda_review_status: 'received', opda_enrolment_status: 'not_invited', opda_active: 'false',
  });
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).contactId, '123');
  assert.ok([...f.items.keys()].every(key => key.startsWith('SYNC#')));
  assert.equal(f.registrations.get(id).fullName, registration().fullName);
});

test('existing contacts and repeated anonymous applications stay in one AWS review backlog without CRM writes', async () => {
  const f = setup({ hubspot: { async findContacts() { return ['345']; } } });
  await f.worker(id);
  await f.worker(otherId);
  assert.equal(f.calls.filter(([action]) => action === 'create').length, 0);
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).reason, 'existing-contact');
  assert.equal(f.items.get(`SYNC#APPLICATION#${otherId}`).reason, 'repeat-application');
  assert.equal([...f.items.keys()].filter(key => key.startsWith('SYNC#EMAIL#')).length, 1);
  assert.equal(f.registrations.size, 2);
});

test('never updates an already-created contact from a resubmission', async () => {
  const f = setup();
  await f.worker(id);
  f.registrations.get(otherId).fullName = 'Anonymous replacement name';
  await f.worker(otherId);
  assert.equal(f.calls.filter(([action]) => action === 'create').length, 1);
  assert.equal(f.items.get(`SYNC#APPLICATION#${otherId}`).state, 'quarantined');
});

test('expired, erased, invalid and old-notice sources cause no CRM calls', async () => {
  for (const mutate of [r => { r.expiresAt = now / 1000; }, r => { r.erasedAt = now - 1; },
    r => { r.workingGroups.push('administrator'); }, r => { r.privacyNoticeVersion = '2026-08-13'; }]) {
    const f = setup(); mutate(f.registrations.get(id)); await f.worker(id);
    assert.equal(f.calls.length, 0);
  }
  const f = setup(); f.registrations.delete(id); await f.worker(id);
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).state, 'suppressed');
});

test('checks durable source and email suppression before every create', async () => {
  const f = setup();
  f.items.set(`SYNC#SUPPRESS#REGISTRATION#${id}`, { pk: `SYNC#SUPPRESS#REGISTRATION#${id}`, revision: 1 });
  await f.worker(id);
  assert.equal(f.calls.length, 0);
});

test('ambiguous create outcome reconciles to review and is never retried or adopted by email', async () => {
  let creates = 0, finds = 0, timestamp = now;
  const f = setup({ worker: { now: () => timestamp }, hubspot: {
    async findContacts() { finds++; return finds > 1 ? ['999'] : []; },
    async createContact() { creates++; throw new Error('secret email must not be surfaced'); },
  } });
  await assert.rejects(f.worker(id));
  // A duplicate delivered while the first invocation could still be running
  // must wait for its short lease, not race it into review quarantine.
  await assert.rejects(f.worker(id), RetryLater);
  timestamp += 121000;
  await f.worker(id);
  await f.worker(id);
  assert.equal(creates, 1);
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).reason, 'ambiguous-create');
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).contactId, undefined);
});

test('long Retry-After is persisted even when a single SQS visibility period is shorter', async () => {
  const f = setup({ hubspot: { async createContact() { throw new RetryLater(90000); } } });
  await assert.rejects(f.worker(id), error => error.seconds === 90000);
  const claim = [...f.items.values()].find(item => item.pk.startsWith('SYNC#EMAIL#'));
  assert.equal(claim.nextAttemptAt, now + 90000000);
});

test('known 429 waits for Retry-After, but retry expiry cannot resurrect an application', async () => {
  const f = setup({ hubspot: { async createContact() { throw new RetryLater(3600); } } });
  await assert.rejects(f.worker(id), RetryLater);
  await assert.rejects(f.worker(id), RetryLater);
  assert.equal(f.calls.filter(([action]) => action === 'authorize').length, 1);
  f.registrations.get(id).expiresAt = now / 1000;
  await f.worker(id);
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).state, 'suppressed');
});

test('daily create budget failures preserve the source and retryable operation', async () => {
  const f = setup({ store: { async authorizeCreation() { return null; } } });
  await assert.rejects(f.worker(id), RetryLater);
  assert.equal(f.calls.filter(([action]) => action === 'create').length, 0);
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).state, 'pending');
});

test('SQS batch failures are partial, bounded and omit errors and personal data', async () => {
  const visibility = [];
  const handler = createHandler({ queueArn, worker: async () => { throw new RetryLater(7200); },
    changeVisibility: async (record, seconds) => visibility.push([record.messageId, seconds]) });
  const result = await handler({ Records: [message()] });
  assert.deepEqual(result, { batchItemFailures: [{ itemIdentifier: 'message-1' }] });
  assert.deepEqual(visibility, [['message-1', 7200]]);
});

const secret = { portalId: 144765514, appId: 52397854, role: 'bridge', accessToken: `pat-${'x'.repeat(30)}` };
const info = { hubId: secret.portalId, appId: secret.appId,
  scopes: ['oauth', 'crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.schemas.contacts.read'] };
const response = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });

test('API adapter verifies exact portal/app/scopes and never follows redirects or logs request URLs', async () => {
  const calls = [];
  const client = createHubSpotClient({ secretArn: 'arn:example', getSecret: async () => secret,
    fetch: async (url, options) => { calls.push([url, options]); return calls.length === 1 ? response(info) : response({}, 404); } });
  assert.deepEqual(await client.findContacts('synthetic@example.test'), []);
  assert.equal(calls[0][0], 'https://api.hubapi.com/oauth/v2/private-apps/get/access-token-info');
  assert.ok(calls.every(([, options]) => options.redirect === 'error'));
  const bad = createHubSpotClient({ getSecret: async () => ({ ...secret, portalId: 1 }), fetch: async () => assert.fail() });
  await assert.rejects(bad.findContacts('synthetic@example.test'), /configuration/);
});

test('API adapter observes numeric and HTTP-date Retry-After without blindly retrying creates', async () => {
  for (const value of ['123', new Date(Date.now() + 120000).toUTCString()]) {
    let count = 0;
    const client = createHubSpotClient({ getSecret: async () => secret, fetch: async () => ++count === 1
      ? response(info) : response({}, 429, { 'Retry-After': value }) });
    await assert.rejects(client.createContact({ email: 'synthetic@example.test',
      opda_review_status: 'received', opda_enrolment_status: 'not_invited', opda_active: 'false' }),
    error => error instanceof RetryLater && error.seconds >= 119);
    assert.equal(count, 2);
  }
});

test('DynamoDB adapter uses strong original reads, conditional sync writes and atomic daily/source/suppression guards', async () => {
  const calls = [];
  const aws = Object.fromEntries(['GetItemCommand', 'PutItemCommand', 'TransactWriteItemsCommand'].map(name => [name, class {
    constructor(input) { this.input = input; this.name = name; }
  }]));
  const store = createStore({ registrationsTableName: 'intake', participantsTableName: 'participants', maxCreatesPerDay: 100 }, {
    loadAws: async () => aws, client: { async send(command) { calls.push(command); return {}; } },
  });
  await store.getRegistration(id);
  assert.equal(calls[0].input.ConsistentRead, true);
  assert.equal(calls[0].input.TableName, 'intake');
  await assert.rejects(store.put({ pk: 'USER#forbidden' }), /sync key/);
  await store.authorizeCreation({ pk: 'SYNC#EMAIL#abc', revision: 1 }, registration(), now);
  const transaction = calls.at(-1).input.TransactItems;
  assert.equal(transaction.length, 5);
  assert.ok(transaction.some(item => item.ConditionCheck?.TableName === 'intake'));
  assert.match(transaction[0].Update.ConditionExpression, /:limit/);
});

test('infrastructure uses a dedicated SNS-filtered queue and cannot write eligibility or call Cognito', () => {
  const template = readFileSync(new URL('../config/aws/hubspot-sync-stack.yaml', import.meta.url), 'utf8');
  assert.match(template, /eventType: \['working-group-interest\.received\.v1'\]/);
  assert.match(template, /ReportBatchItemFailures/);
  assert.match(template, /dynamodb:LeadingKeys/);
  assert.match(template, /'SYNC#\*'/);
  assert.doesNotMatch(template, /cognito-idp:|opda-public-submission-events\n/);
  assert.match(template, /maxReceiveCount: 8/);
  assert.match(template, /BridgeSecretArn:/);
});
