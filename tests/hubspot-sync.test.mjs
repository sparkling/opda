import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createHandler, createWorker, parseSubmissionMessage, RetryLater } from '../config/aws/hubspot-sync/index.mjs';
import { createHubSpotClient } from '../config/aws/hubspot-sync/client.mjs';
import { createStore } from '../config/aws/hubspot-sync/store.mjs';

const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');

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
    async createReviewTask(task) { calls.push(['task', task]); return { id: '900' }; },
    ...overrides.hubspot,
  };
  const postmark = {
    async sendAcknowledgement(payload, context) {
      calls.push(['ack', payload.TemplateModel.group_id, payload.To, context.registrationId]);
      return { status: 'accepted', messageId: `msg-${payload.TemplateModel.group_id}`, submittedAt: new Date(now).toISOString() };
    },
    ...overrides.postmark,
  };
  const worker = createWorker({ store, hubspot, postmark, logoBase64, now: () => now, newId: () => 'pending-random-id',
    transferNoticeVersion: '2026-09-08', ...overrides.worker });
  return { items, registrations, calls, store, hubspot, postmark, worker };
}
const acks = f => f.calls.filter(([action]) => action === 'ack');
const ackRecords = f => [...f.items.values()].filter(item => item.pk.startsWith('SYNC#ACK#'));

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
    opda_review_conveyancing: 'received', opda_review_finance_and_banking: 'received',
  });
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).contactId, '123');
  assert.ok([...f.items.keys()].every(key => key.startsWith('SYNC#')));
  assert.equal(f.registrations.get(id).fullName, registration().fullName);
});

test('an existing contact gets one review task, never a contact update; repeats add no CRM objects', async () => {
  const f = setup({ hubspot: { async findContacts() { return ['345']; } } });
  await f.worker(id);
  await f.worker(id);
  await f.worker(otherId);
  assert.equal(f.calls.filter(([action]) => action === 'create').length, 0);
  const tasks = f.calls.filter(([action]) => action === 'task');
  assert.equal(tasks.length, 1);
  assert.deepEqual(tasks[0][1], { contactIds: ['345'], registrationId: id,
    requestedGroups: ['conveyancing', 'finance-and-banking'], dueAt: now });
  const application = f.items.get(`SYNC#APPLICATION#${id}`);
  assert.equal(application.reason, 'existing-contact');
  assert.equal(application.state, 'quarantined');
  assert.deepEqual(application.candidateContactIds, ['345']);
  assert.equal(application.reviewTaskId, '900');
  assert.equal(f.items.get(`SYNC#APPLICATION#${otherId}`).reason, 'repeat-application');
  assert.equal(f.items.get(`SYNC#APPLICATION#${otherId}`).reviewTaskId, undefined);
  assert.equal([...f.items.keys()].filter(key => key.startsWith('SYNC#EMAIL#')).length, 1);
  assert.equal(f.registrations.size, 2);
});

test('a review task failure keeps a short lease, then retries; a duplicate task beats a silent drop', async () => {
  let attempts = 0, timestamp = now;
  const f = setup({ worker: { now: () => timestamp }, hubspot: {
    async findContacts() { return ['345']; },
    async createReviewTask() { attempts++; if (attempts === 1) throw new Error('transient'); return { id: '901' }; },
  } });
  await assert.rejects(f.worker(id), /transient/);
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).state, 'pending');
  await assert.rejects(f.worker(id), RetryLater);
  timestamp += 121000;
  await f.worker(id);
  assert.equal(attempts, 2);
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).reviewTaskId, '901');
  assert.equal(f.items.get(`SYNC#APPLICATION#${id}`).state, 'quarantined');
});

test('every validated application is acknowledged once per requested group, created or quarantined', async () => {
  const created = setup();
  await created.worker(id);
  await created.worker(id);
  assert.deepEqual(acks(created).map(([, group, to]) => [group, to]),
    [['conveyancing', 'synthetic@example.test'], ['finance-and-banking', 'synthetic@example.test']]);
  assert.deepEqual(ackRecords(created).map(item => [item.pk, item.state, item.messageId]).sort(), [
    [`SYNC#ACK#${id}#conveyancing`, 'accepted', 'msg-conveyancing'],
    [`SYNC#ACK#${id}#finance-and-banking`, 'accepted', 'msg-finance-and-banking'],
  ]);
  const existing = setup({ hubspot: { async findContacts() { return ['345']; } } });
  await existing.worker(id);
  assert.equal(acks(existing).length, 2);
  // A repeat from the same email is AWS evidence only: no second acknowledgement, no task.
  await existing.worker(otherId);
  assert.equal(acks(existing).length, 2);
  assert.ok(!ackRecords(existing).some(item => item.pk.includes(otherId)));
});

test('suppressed, invalid or stale sources are never acknowledged', async () => {
  for (const mutate of [r => { r.expiresAt = now / 1000; }, r => { r.erasedAt = now - 1; },
    r => { r.workingGroups.push('administrator'); }, r => { r.privacyNoticeVersion = '2026-08-13'; }]) {
    const f = setup(); mutate(f.registrations.get(id)); await f.worker(id);
    assert.equal(acks(f).length, 0);
  }
  const suppressed = setup();
  suppressed.items.set(`SYNC#SUPPRESS#REGISTRATION#${id}`, { pk: `SYNC#SUPPRESS#REGISTRATION#${id}`, revision: 1 });
  await suppressed.worker(id);
  assert.equal(acks(suppressed).length, 0);
  // Acknowledgements already sent are not affected by a later erasure, and none are added.
  const erased = setup();
  await erased.worker(id);
  erased.registrations.get(id).erasedAt = now;
  await erased.worker(id);
  assert.equal(acks(erased).length, 2);
});

test('acknowledgement outcomes are durable: rejection is final, throttling waits, an interrupted send is never resent', async () => {
  let timestamp = now;
  const rejected = setup({ worker: { now: () => timestamp }, postmark: { async sendAcknowledgement(payload) {
    return payload.TemplateModel.group_id === 'conveyancing' ? { status: 'rejected', errorCode: 406 }
      : { status: 'accepted', messageId: 'm', submittedAt: new Date(now).toISOString() };
  } } });
  await rejected.worker(id);
  await rejected.worker(id);
  const states = Object.fromEntries(ackRecords(rejected).map(item => [item.groupId, item.state]));
  assert.deepEqual(states, { 'finance-and-banking': 'accepted', conveyancing: 'rejected' });

  let sends = 0;
  const throttled = setup({ worker: { now: () => timestamp }, postmark: { async sendAcknowledgement() {
    sends++; if (sends === 1) throw new RetryLater(600); return { status: 'accepted', messageId: 'm', submittedAt: new Date(now).toISOString() };
  } } });
  // The first 429 propagates so SQS delays the message; the durable record holds the deadline.
  await assert.rejects(throttled.worker(id), error => error instanceof RetryLater && error.seconds === 600);
  assert.equal(sends, 1);
  await assert.rejects(throttled.worker(id), error => error instanceof RetryLater);
  assert.equal(sends, 1, 'no send inside the Retry-After window');
  timestamp += 601000;
  await throttled.worker(id);
  assert.equal(sends, 3);
  assert.ok(ackRecords(throttled).every(item => item.state === 'accepted'));

  timestamp = now;
  const interrupted = setup({ worker: { now: () => timestamp }, postmark: { async sendAcknowledgement() { throw new Error('socket closed'); } } });
  // Each group's send is leased independently: a transport failure leaves "sending" for redelivery,
  // and once the lease lapses the outcome is recorded as unknown rather than resent.
  await assert.rejects(interrupted.worker(id), /socket closed/);
  await assert.rejects(interrupted.worker(id), RetryLater);
  timestamp += 121000;
  await assert.rejects(interrupted.worker(id), /socket closed/);
  timestamp += 121000;
  await interrupted.worker(id);
  await interrupted.worker(id);
  assert.equal(ackRecords(interrupted).length, 2);
  assert.ok(ackRecords(interrupted).every(item => item.state === 'unknown'), 'dispatch may have happened; never resend');
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

test('the packaged acknowledgement logo is byte-identical to the reviewed email asset', () => {
  const reviewed = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url));
  const packaged = readFileSync(new URL('../config/aws/hubspot-sync/opda-email-logo.png', import.meta.url));
  assert.ok(reviewed.equals(packaged));
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
  // The acknowledgement reads the shared Postmark credential; the sync role gets no other new grant.
  assert.match(template, /secret:opda\/postmark\/participation-onboarding-\?\?\?\?\?\?'/);
  assert.match(template, /POSTMARK_SECRET_ARN: !Sub 'arn:\$\{AWS::Partition\}:secretsmanager:\$\{AWS::Region\}:\$\{AWS::AccountId\}:secret:opda\/postmark\/participation-onboarding-U02V9v'/);
  assert.equal((template.match(/secretsmanager:GetSecretValue/g) ?? []).length, 2);
  assert.doesNotMatch(template, /ses:|sns:Publish|dynamodb:DeleteItem|dynamodb:Scan/);
  // SQS rejects multiple resource ARNs in a statement, even when the
  // CloudFormation QueuePolicy is attached to both queues.
  const queuePolicies = template.slice(template.indexOf('  QueuePolicy:'), template.indexOf('  SignupSubscription:'));
  assert.doesNotMatch(queuePolicies, /Resource: \[/);
  assert.match(queuePolicies, /Queues: \[!Ref SignupQueue\]/);
  assert.match(queuePolicies, /Queues: \[!Ref FailureQueue\]/);
  assert.equal((queuePolicies.match(/aws:SourceArn/g) ?? []).length, 2);
  assert.equal((queuePolicies.match(/aws:SecureTransport/g) ?? []).length, 2);
});

test('API adapter creates one review task bound to the matched contacts and refuses free text', async () => {
  const calls = [];
  const client = createHubSpotClient({ getSecret: async () => secret, fetch: async (url, options) => {
    calls.push([url, options]);
    return calls.length === 1 ? response(info) : response({ id: '519916213445', properties: { hs_task_subject: 'x' } }, 201);
  } });
  const task = await client.createReviewTask({ contactIds: ['345'], registrationId: id,
    requestedGroups: ['conveyancing', 'finance-and-banking'], dueAt: now });
  assert.deepEqual(task, { id: '519916213445' });
  const [url, options] = calls[1];
  assert.equal(url, 'https://api.hubapi.com/crm/v3/objects/tasks');
  const body = JSON.parse(options.body);
  assert.equal(body.properties.hs_task_status, 'NOT_STARTED');
  assert.equal(body.properties.hs_task_type, 'TODO');
  assert.equal(body.properties.hs_timestamp, new Date(now).toISOString());
  assert.match(body.properties.hs_task_subject, /existing contact/i);
  assert.match(body.properties.hs_task_body, /Finance and Banking/);
  assert.match(body.properties.hs_task_body, new RegExp(id));
  assert.deepEqual(body.associations, [{ to: { id: '345' }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 204 }] }]);
  // Applicant free text never reaches the CRM task; only finite group labels and the reference.
  assert.doesNotMatch(options.body, /Synthetic|Example organisation|perspective/);
  for (const bad of [{ contactIds: [] }, { contactIds: ['x'] }, { requestedGroups: ['administrator'] }, { registrationId: 'not-a-uuid' }]) {
    await assert.rejects(client.createReviewTask({ contactIds: ['345'], registrationId: id,
      requestedGroups: ['conveyancing'], dueAt: now, ...bad }), TypeError);
  }
});

test('API adapter writes Requested only on the domains the applicant selected, never a decision', async () => {
  const base = { email: 'synthetic@example.test', opda_requested_working_groups: 'conveyancing',
    opda_review_status: 'received', opda_enrolment_status: 'not_invited', opda_active: 'false' };
  const client = createHubSpotClient({ getSecret: async () => secret, fetch: async (url, options) => url.endsWith('access-token-info')
    ? response(info) : response({ id: '321', properties: { email: 'synthetic@example.test' } }, 201) });
  assert.deepEqual(await client.createContact({ ...base, opda_review_conveyancing: 'received' }), { id: '321', email: base.email });
  for (const bad of [{ opda_review_conveyancing: 'approved' }, { opda_review_finance_and_banking: 'received' },
    { opda_review_conveyancing: 'received', opda_review_finance_and_banking: 'received' }]) {
    await assert.rejects(client.createContact({ ...base, ...bad }), TypeError);
  }
});
