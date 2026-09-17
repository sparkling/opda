import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createHandler, createWorker, parseSubmissionMessage, RetryLater } from '../config/aws/acknowledgement/index.mjs';

const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');
const now = Date.parse('2026-09-16T09:00:00Z');
const id = '00000000-0000-4000-8000-000000000001';
const queueArn = 'arn:aws:sqs:eu-west-2:123456789012:opda-application-acknowledgements';
const registration = (registrationId = id) => ({
  registrationId, firstName: 'Synthetic', lastName: 'Example Person', email: 'synthetic@example.test',
  organisation: 'Example organisation', role: 'Research and domain expertise',
  workingGroups: ['conveyancing', 'finance-and-banking'], contributions: ['review-model-candidates'],
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
  const registrations = new Map([[id, registration()]]);
  const sent = [];
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
    ...overrides.store,
  };
  const postmark = {
    async sendAcknowledgement(payload, context) {
      sent.push([payload.TemplateModel.group_id, payload.To, context.registrationId]);
      return { status: 'accepted', messageId: `msg-${payload.TemplateModel.group_id}`, submittedAt: new Date(now).toISOString() };
    },
    ...overrides.postmark,
  };
  let clock = now;
  const worker = createWorker({ store, postmark, logoBase64, now: () => clock,
    transferNoticeVersion: '2026-09-08', ...overrides.worker });
  return { items, registrations, sent, store, postmark, worker, tick: ms => { clock = now + ms; } };
}
const records = f => [...f.items.values()].filter(item => item.pk.startsWith('SYNC#ACK#'));

test('the worker has no CRM capability at all, so no CRM outcome can gate a receipt', () => {
  const source = readFileSync(new URL('../config/aws/acknowledgement/index.mjs', import.meta.url), 'utf8');
  // The shared template and property contracts are fine; a CRM client is not.
  const imports = [...source.matchAll(/^import .*? from '(.+?)';$/gmu)].map(match => match[1]);
  assert.deepEqual(imports.filter(path => /client\.mjs$/.test(path)), []);
  assert.doesNotMatch(source, /createHubSpotClient|createReviewTask|findContacts|createContact|BRIDGE_SECRET_ARN/);
});

test('every live submission is acknowledged once per requested group, and redelivery adds nothing', async () => {
  const f = setup();
  await f.worker(id);
  await f.worker(id);
  await f.worker(id);
  assert.deepEqual(f.sent, [
    ['conveyancing', 'synthetic@example.test', id],
    ['finance-and-banking', 'synthetic@example.test', id],
  ]);
  assert.deepEqual(records(f).map(r => [r.pk, r.state, r.reason, r.messageId]).sort(), [
    [`SYNC#ACK#${id}#conveyancing`, 'done', 'accepted', 'msg-conveyancing'],
    [`SYNC#ACK#${id}#finance-and-banking`, 'done', 'accepted', 'msg-finance-and-banking'],
  ]);
});

test('records settled under the pre-ADR-0087 vocabulary are never re-sent', async () => {
  for (const state of ['accepted', 'rejected', 'suppressed', 'unknown']) {
    const f = setup();
    for (const groupId of ['conveyancing', 'finance-and-banking']) {
      const pk = `SYNC#ACK#${id}#${groupId}`;
      f.items.set(pk, { pk, registrationId: id, groupId, state, revision: 1 });
    }
    await f.worker(id);
    assert.deepEqual(f.sent, [], `state ${state} must stay settled`);
  }
});

test('a submission that is gone, expired, stale-noticed or malformed is not emailed', async () => {
  for (const mutate of [r => { r.expiresAt = Math.floor(now / 1000); }, r => { r.erasedAt = now - 1; },
    r => { r.deletedAt = now - 1; }, r => { r.privacyNoticeVersion = '2026-08-13'; },
    r => { r.workingGroups = []; }, r => { r.workingGroups = ['administrator']; }]) {
    const f = setup(); mutate(f.registrations.get(id)); await f.worker(id);
    assert.deepEqual(f.sent, []);
    assert.deepEqual(records(f), []);
  }
  const missing = setup(); missing.registrations.delete(id); await missing.worker(id);
  assert.deepEqual(missing.sent, []);
  const noNotice = setup({ worker: { transferNoticeVersion: '' } });
  await noNotice.worker(id);
  assert.deepEqual(noNotice.sent, []);
});

test('a registration or email suppression record stops every group', async () => {
  for (const pk of [`SYNC#SUPPRESS#REGISTRATION#${id}`,
    'SYNC#SUPPRESS#EMAIL#0f9f3b8c3e0a0e2f9f6d2c4a1b8e7d6c5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c']) {
    const f = setup();
    // The digest of synthetic@example.test, resolved through the worker's own store call.
    const digestKey = pk.startsWith('SYNC#SUPPRESS#EMAIL#')
      ? `SYNC#SUPPRESS#EMAIL#${(await import('node:crypto')).createHash('sha256').update('synthetic@example.test').digest('hex')}`
      : pk;
    f.items.set(digestKey, { pk: digestKey, revision: 1 });
    await f.worker(id);
    assert.deepEqual(f.sent, []);
  }
});

test('an interrupted send holds a short lease, then settles as unknown and is never repeated', async () => {
  let timestamp = now;
  const f = setup({ worker: { now: () => timestamp },
    postmark: { async sendAcknowledgement() { throw new Error('socket closed'); } } });
  await assert.rejects(f.worker(id), /socket closed/);
  assert.equal(f.items.get(`SYNC#ACK#${id}#conveyancing`).state, 'sending');
  // Inside the lease another delivery must wait rather than risk a second copy.
  await assert.rejects(f.worker(id), RetryLater);
  timestamp += 121000;
  await assert.rejects(f.worker(id), /socket closed/);
  timestamp += 121000;
  await f.worker(id);
  await f.worker(id);
  assert.equal(records(f).length, 2);
  assert.ok(records(f).every(r => r.state === 'done' && r.reason === 'outcome-unknown'));
});

test('a throttled send is known not to have been dispatched, so it waits and then completes', async () => {
  let timestamp = now, sends = 0;
  const f = setup({ worker: { now: () => timestamp }, postmark: { async sendAcknowledgement(payload) {
    if (++sends === 1) throw new RetryLater(600);
    return { status: 'accepted', messageId: `msg-${payload.TemplateModel.group_id}`, submittedAt: new Date(now).toISOString() };
  } } });
  await assert.rejects(f.worker(id), error => error instanceof RetryLater && error.seconds === 600);
  assert.equal(f.items.get(`SYNC#ACK#${id}#conveyancing`).state, 'retry');
  await assert.rejects(f.worker(id), RetryLater);
  assert.equal(sends, 1, 'no send inside the Retry-After window');
  timestamp += 601000;
  await f.worker(id);
  assert.equal(sends, 3);
  assert.ok(records(f).every(r => r.state === 'done' && r.reason === 'accepted'));
});

test('a rejected or suppressed address is settled once, with the provider reason kept', async () => {
  const f = setup({ postmark: { async sendAcknowledgement(payload) {
    return payload.TemplateModel.group_id === 'conveyancing'
      ? { status: 'rejected', errorCode: 406 } : { status: 'suppressed' };
  } } });
  await f.worker(id);
  await f.worker(id);
  assert.deepEqual(Object.fromEntries(records(f).map(r => [r.groupId, [r.state, r.reason, r.errorCode]])), {
    conveyancing: ['done', 'rejected', 406],
    'finance-and-banking': ['done', 'suppressed', undefined],
  });
});

test('input the reviewed template cannot carry is settled permanently, never retried', async () => {
  const f = setup();
  f.registrations.get(id).lastName = 'Unsafe <b>name</b>';
  await f.worker(id);
  await f.worker(id);
  assert.deepEqual(f.sent, []);
  assert.ok(records(f).every(r => r.state === 'done' && r.reason === 'invalid-input'));
});

test('one group failing does not undo the group already acknowledged', async () => {
  const f = setup({ postmark: { async sendAcknowledgement(payload) {
    if (payload.TemplateModel.group_id === 'finance-and-banking') throw new Error('socket closed');
    return { status: 'accepted', messageId: 'm', submittedAt: new Date(now).toISOString() };
  } } });
  await assert.rejects(f.worker(id), /socket closed/);
  assert.equal(f.items.get(`SYNC#ACK#${id}#conveyancing`).reason, 'accepted');
  assert.equal(f.items.get(`SYNC#ACK#${id}#finance-and-banking`).state, 'sending');
});

test('the queue envelope is validated and batch failures are partial, bounded and quiet', async () => {
  assert.equal(parseSubmissionMessage(message(), queueArn), id);
  assert.throws(() => parseSubmissionMessage(message(), `${queueArn}-other`));
  const visibility = [];
  const handler = createHandler({ queueArn, worker: async () => { throw new RetryLater(7200); },
    changeVisibility: async (record, seconds) => visibility.push([record.messageId, seconds]) });
  assert.deepEqual(await handler({ Records: [message()] }), { batchItemFailures: [{ itemIdentifier: 'message-1' }] });
  assert.deepEqual(visibility, [['message-1', 7200]]);
  const delivered = [];
  const ok = createHandler({ queueArn, worker: async registrationId => delivered.push(registrationId) });
  assert.deepEqual(await ok({ Records: [message()] }), { batchItemFailures: [] });
  assert.deepEqual(delivered, [id]);
});

test('the packaged acknowledgement logo is byte-identical to the reviewed email asset', () => {
  const reviewed = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url));
  const packaged = readFileSync(new URL('../config/aws/acknowledgement/opda-email-logo.png', import.meta.url));
  assert.ok(reviewed.equals(packaged));
});

test('infrastructure gives the receipt its own queue, credential and failure domain', () => {
  const template = readFileSync(new URL('../config/aws/acknowledgement-stack.yaml', import.meta.url), 'utf8');
  assert.match(template, /eventType: \['working-group-interest\.received\.v1'\]/);
  assert.match(template, /ReportBatchItemFailures/);
  assert.match(template, /maxReceiveCount: 8/);
  // Write access is limited to its own send log; suppression is read-only.
  assert.match(template, /'SYNC#ACK#\*'/);
  assert.match(template, /'SYNC#SUPPRESS#\*'/);
  assert.doesNotMatch(template, /BridgeSecretArn|hubapi|cognito-idp:|dynamodb:DeleteItem|dynamodb:Scan/);
  // Exactly one credential: the shared transactional Postmark server, read-only.
  assert.equal((template.match(/secretsmanager:GetSecretValue/g) ?? []).length, 1);
  assert.match(template, /secret:opda\/postmark\/participation-onboarding/);
  // Every alarm must have somewhere to go.
  assert.equal((template.match(/AlarmActions: !If \[HasAlarmTopic/g) ?? []).length, 3);

  const site = readFileSync(new URL('../config/aws/site-stack.yaml', import.meta.url), 'utf8');
  assert.match(site, /TemplateURL: acknowledgement-stack\.yaml/);
  // No stack may declare an alarm destination that nothing supplies. The topic is
  // account-level, exported once, and imported by every service stack.
  const operations = readFileSync(new URL('../config/aws/operations-stack.yaml', import.meta.url), 'utf8');
  assert.match(operations, /TopicName: opda-operations-alarms/);
  assert.match(operations, /Export: \{ Name: !Sub '\$\{AWS::StackName\}-AlarmTopicArn' \}/);
  assert.equal((site.match(/AlarmTopicArn: \{'Fn::ImportValue': !Sub '\$\{OperationsStackName\}-AlarmTopicArn'\}/g) ?? []).length, 3);
  const infra = readFileSync(new URL('../.github/workflows/infra.yml', import.meta.url), 'utf8');
  assert.ok(infra.indexOf('config/aws/operations-stack.yaml') < infra.indexOf('config/aws/site-stack.yaml'),
    'the alarm export must exist before any stack imports it');

  const sync = readFileSync(new URL('../config/aws/hubspot-sync-stack.yaml', import.meta.url), 'utf8');
  assert.doesNotMatch(sync, /postmark|POSTMARK/i, 'the CRM bridge holds no mail credential');
  assert.equal((sync.match(/secretsmanager:GetSecretValue/g) ?? []).length, 1);
});
