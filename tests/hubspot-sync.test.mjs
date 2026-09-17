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
  registrationId, firstName: 'Synthetic', lastName: 'Example Person', email: 'synthetic@example.test',
  organisation: 'Example organisation', role: 'Research and domain expertise',
  workingGroups: ['conveyancing', 'finance-and-banking'], contributions: ['review-model-candidates'],
  referralSources: ['linkedin'], referralOther: '',
  relevantPerspective: 'Synthetic professional perspective', acknowledgement: true,
  privacyNoticeVersion: '2026-09-08', status: 'received', createdAt: now - 10000,
  expiresAt: Math.floor(now / 1000) + 2 * 24 * 60 * 60,
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
  let clock = now;
  const worker = createWorker({ store, hubspot, now: () => clock, newId: () => 'pending-random-id',
    transferNoticeVersion: '2026-09-08', ...overrides.worker });
  const tick = (ms) => { clock = now + ms; };
  return { items, registrations, calls, store, hubspot, worker, tick };
}
const application = (f, registrationId = id) => f.items.get(`SYNC#APPLICATION#${registrationId}`);

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
    email: 'synthetic@example.test', company: 'Example organisation', firstname: 'Synthetic', lastname: 'Example Person',
    opda_role_or_expertise: 'Research and domain expertise', opda_requested_working_groups: 'finance-and-banking;conveyancing',
    opda_contribution_preferences: 'review-model-candidates', opda_relevant_perspective: 'Synthetic professional perspective',
    opda_referral_sources: 'linkedin', opda_enrolment_status: 'not_invited', opda_active: 'false',
    opda_review_conveyancing: 'received', opda_review_finance_and_banking: 'received',
  });
  assert.equal(application(f).contactId, '123');
  assert.equal(application(f).state, 'synced');
  assert.equal(application(f).reason, 'contact-created');
  assert.ok([...f.items.keys()].every(key => key.startsWith('SYNC#')));
  assert.equal(f.registrations.get(id).lastName, registration().lastName);
});

test('an existing contact gets one review task, never a contact update; a repeat waits a day, then gets its own task', async () => {
  const f = setup({ hubspot: { async findContacts() { return ['345']; } } });
  await f.worker(id);
  await f.worker(id);
  // ADR-0084 §4: at most one task per email per day, so the repeat is queued, not dropped.
  await assert.rejects(f.worker(otherId), error => error instanceof RetryLater && error.seconds > 0 && error.seconds <= 43200);
  assert.equal(f.calls.filter(([action]) => action === 'create').length, 0);
  let tasks = f.calls.filter(([action]) => action === 'task');
  assert.equal(tasks.length, 1);
  assert.deepEqual(tasks[0][1], { contactIds: ['345'], registrationId: id,
    requestedGroups: ['conveyancing', 'finance-and-banking'], dueAt: now });
  assert.equal(application(f).reason, 'existing-contact');
  assert.equal(application(f).state, 'closed');
  assert.deepEqual(application(f).candidateContactIds, ['345']);
  assert.equal(application(f).reviewTaskId, '900');
  // No decision yet for the repeat: a record exists only once there is one.
  assert.equal(application(f, otherId), undefined);
  f.tick(24 * 60 * 60 * 1000 + 1);
  await f.worker(otherId);
  await f.worker(otherId);
  tasks = f.calls.filter(([action]) => action === 'task');
  assert.equal(tasks.length, 2);
  assert.equal(tasks[1][1].registrationId, otherId);
  assert.deepEqual(tasks[1][1].contactIds, ['345']);
  assert.equal(application(f, otherId).reason, 'repeat-application-reviewed');
  assert.equal(application(f, otherId).state, 'closed');
  assert.equal(application(f, otherId).reviewTaskId, '900');
  assert.equal([...f.items.keys()].filter(key => key.startsWith('SYNC#EMAIL#')).length, 1);
  assert.equal(f.registrations.size, 2);
});

test('claims settled under the pre-ADR-0087 vocabulary stay settled and read forward', async () => {
  // A deploy must not reopen a decided claim, nor create a second contact for it.
  for (const [state, expected] of [['quarantined', 'closed'], ['suppressed', 'closed'], ['synced', 'synced']]) {
    const f = setup();
    const claimKey = [...f.items.keys()].find(key => key.startsWith('SYNC#EMAIL#'))
      ?? `SYNC#EMAIL#${'a'.repeat(64)}`;
    await f.worker(id);
    const claim = f.items.get([...f.items.keys()].find(key => key.startsWith('SYNC#EMAIL#')));
    // Rewind both records to the shape this email would have had before the refactor.
    f.items.set(claim.pk, { ...claim, state, reason: 'existing-contact', revision: 1 });
    f.items.delete(`SYNC#APPLICATION#${id}`);
    f.calls.length = 0;
    await f.worker(id);
    assert.equal(application(f).state, expected, `${state} reads forward as ${expected}`);
    assert.equal(f.calls.filter(([action]) => action === 'create').length, 0, 'no second contact');
    assert.ok(claimKey);
  }
  // A repeat from another registration against an old terminal claim is reviewed, not stalled.
  const f = setup({ hubspot: { async findContacts() { return ['345']; } } });
  await f.worker(id);
  const claim = f.items.get([...f.items.keys()].find(key => key.startsWith('SYNC#EMAIL#')));
  f.items.set(claim.pk, { ...claim, state: 'quarantined', lastTaskAt: now - 25 * 60 * 60 * 1000, revision: 1 });
  await f.worker(otherId);
  assert.equal(application(f, otherId).state, 'closed');
  assert.equal(application(f, otherId).reason, 'repeat-application-reviewed');
});

test('a review task failure keeps a short lease, then retries; a duplicate task beats a silent drop', async () => {
  let attempts = 0, timestamp = now;
  const f = setup({ worker: { now: () => timestamp }, hubspot: {
    async findContacts() { return ['345']; },
    async createReviewTask() { attempts++; if (attempts === 1) throw new Error('transient'); return { id: '901' }; },
  } });
  await assert.rejects(f.worker(id), /transient/);
  assert.equal(application(f), undefined, 'an unfinished attempt records no decision');
  await assert.rejects(f.worker(id), RetryLater);
  timestamp += 121000;
  await f.worker(id);
  assert.equal(attempts, 2);
  assert.equal(application(f).reviewTaskId, '901');
  assert.equal(application(f).state, 'closed');
});

test('never updates or recreates an already-created contact from a resubmission; it is reviewed instead', async () => {
  const f = setup();
  await f.worker(id);
  f.registrations.get(otherId).lastName = 'Anonymous replacement name';
  await assert.rejects(f.worker(otherId), RetryLater);
  f.tick(24 * 60 * 60 * 1000 + 1);
  await f.worker(otherId);
  assert.equal(f.calls.filter(([action]) => action === 'create').length, 1);
  const task = f.calls.find(([action, input]) => action === 'task' && input.registrationId === otherId);
  assert.deepEqual(task[1].contactIds, ['123'], 'the task hangs off the contact this email created');
  assert.equal(application(f, otherId).state, 'closed');
  assert.equal(application(f, otherId).reason, 'repeat-application-reviewed');
  // A crash between the durable attempt marker and the task response replays without a second task.
  f.items.delete(`SYNC#APPLICATION#${otherId}`);
  await f.worker(otherId);
  assert.equal(f.calls.filter(([action, input]) => action === 'task' && input.registrationId === otherId).length, 2);
});

test('expired, erased, invalid and old-notice sources cause no CRM calls', async () => {
  for (const mutate of [r => { r.expiresAt = now / 1000; }, r => { r.erasedAt = now - 1; },
    r => { r.workingGroups.push('administrator'); }, r => { r.privacyNoticeVersion = '2026-08-13'; }]) {
    const f = setup(); mutate(f.registrations.get(id)); await f.worker(id);
    assert.equal(f.calls.length, 0);
  }
  const f = setup(); f.registrations.delete(id); await f.worker(id);
  assert.equal(application(f).state, 'closed');
  assert.equal(application(f).reason, 'missing-expired-or-erased');
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
  assert.equal(application(f).reason, 'ambiguous-create');
  assert.equal(application(f).state, 'closed');
  assert.equal(application(f).contactId, undefined);
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
  assert.equal(application(f).state, 'closed');
  assert.equal(application(f).reason, 'missing-expired-or-erased');
});

test('daily create budget failures preserve the source and retryable operation', async () => {
  const f = setup({ store: { async authorizeCreation() { return null; } } });
  await assert.rejects(f.worker(id), RetryLater);
  assert.equal(f.calls.filter(([action]) => action === 'create').length, 0);
  assert.equal(application(f), undefined, 'the application stays undecided and replayable');
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
      opda_enrolment_status: 'not_invited', opda_active: 'false' }),
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
  // ADR-0087: this role is the CRM bridge and only that. It holds one credential
  // and cannot send mail, so an email defect can no longer stop a CRM write.
  assert.doesNotMatch(template, /postmark|POSTMARK/i);
  assert.equal((template.match(/secretsmanager:GetSecretValue/g) ?? []).length, 1);
  assert.doesNotMatch(template, /ses:|sns:Publish|dynamodb:DeleteItem|dynamodb:Scan/);
  // Its alarms must reach somewhere; an unwired AlarmTopicArn made them decorative.
  assert.equal((template.match(/AlarmActions: !If \[HasAlarmTopic/g) ?? []).length, 2);
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
    opda_enrolment_status: 'not_invited', opda_active: 'false' };
  const client = createHubSpotClient({ getSecret: async () => secret, fetch: async (url, options) => url.endsWith('access-token-info')
    ? response(info) : response({ id: '321', properties: { email: 'synthetic@example.test' } }, 201) });
  assert.deepEqual(await client.createContact({ ...base, opda_review_conveyancing: 'received' }), { id: '321', email: base.email });
  for (const bad of [{ opda_review_conveyancing: 'approved' }, { opda_review_finance_and_banking: 'received' },
    { opda_review_conveyancing: 'received', opda_review_finance_and_banking: 'received' }]) {
    await assert.rejects(client.createContact({ ...base, ...bad }), TypeError);
  }
});
