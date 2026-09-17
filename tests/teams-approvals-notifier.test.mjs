import assert from 'node:assert/strict';
import test from 'node:test';
import { RetryLater, contactReference, createHandler, createNotifier } from '../config/aws/teams-approvals/notifier.mjs';
import { INSTALL_KEY, signupKey } from '../config/aws/teams-approvals/store.mjs';

const NOW = Date.parse('2026-09-16T09:00:00Z');
const id = '00000000-0000-4000-8000-000000000001';
const queueArn = 'arn:aws:sqs:eu-west-2:123456789012:opda-teams-signups';
const CHANNEL = '19:bd69ce445a4a4493854168e8e2c9ffc7@thread.tacv2';
const TENANT = '143540d4-4fbc-4005-882a-29656cd01a36';
const registration = (patch = {}) => ({ registrationId: id, firstName: 'Synthetic', lastName: 'Example Person', email: 'synthetic@example.test',
  organisation: 'Example organisation', role: 'Research', workingGroups: ['conveyancing'], relevantPerspective: '',
  privacyNoticeVersion: '2026-09-08', status: 'received', createdAt: NOW - 10000, expiresAt: Math.floor(NOW / 1000) + 86400, ...patch });
const message = () => ({ messageId: 'message-1', eventSource: 'aws:sqs', eventSourceARN: queueArn, receiptHandle: 'opaque',
  body: JSON.stringify({ schemaVersion: 1, eventId: 'stream-event-1', eventType: 'working-group-interest.received.v1',
    occurredAt: new Date(NOW - 10000).toISOString(), record: { kind: 'working-group-interest', id } }) });

function setup({ source = registration(), claim = { state: 'synced', contactId: '123' }, install = null } = {}) {
  const items = new Map(), posted = [];
  if (install) items.set(INSTALL_KEY, install);
  const store = {
    async get(pk) { return structuredClone(items.get(pk) ?? null); },
    async getRegistration(registrationId) { return registrationId === id ? structuredClone(source) : null; },
    async getSyncClaim() { return claim; },
    async put(item, previous = null) {
      if ((items.get(item.pk)?.revision ?? null) !== (previous?.revision ?? null)) throw new Error('Conditional conflict');
      const saved = { ...structuredClone(item), revision: (previous?.revision ?? 0) + 1 };
      items.set(item.pk, saved);
      return structuredClone(saved);
    },
  };
  const microsoft = { async postCard(input) {
    posted.push(input);
    if (microsoft.fail) throw new Error('connector down');
    return { conversationId: '19:chan;messageid=7', activityId: '7' };
  } };
  let clock = NOW;
  const worker = createNotifier({ store, microsoft, channelId: CHANNEL, tenantId: TENANT,
    serviceUrl: 'https://smba.trafficmanager.net/emea/', now: () => clock });
  return { worker, items, posted, microsoft, tick: ms => { clock += ms; } };
}

test('one card per live signup, recorded before the post and settled with the message reference', async () => {
  const { worker, items, posted } = setup();
  await worker(id);
  assert.equal(posted.length, 1);
  assert.deepEqual([posted[0].serviceUrl, posted[0].channelId, posted[0].tenantId], ['https://smba.trafficmanager.net/emea/', CHANNEL, TENANT]);
  assert.equal(posted[0].card.actions[0].url, 'https://app.hubspot.com/contacts/144765514/record/0-1/123');
  const record = items.get(signupKey(id));
  assert.equal(record.state, 'done');
  assert.deepEqual([record.conversationId, record.activityId, record.contactId, record.attempts], ['19:chan;messageid=7', '7', '123', 1]);
  await worker(id);
  assert.equal(posted.length, 1, 'a redelivery never posts a second card');
});

test('the recorded installation service URL wins over the configured fallback', async () => {
  const { worker, posted } = setup({ install: { pk: INSTALL_KEY, serviceUrl: 'https://smba.trafficmanager.net/emea/tenant/', revision: 1 } });
  await worker(id);
  assert.equal(posted[0].serviceUrl, 'https://smba.trafficmanager.net/emea/tenant/');
});

test('an unlinked signup waits briefly for the CRM sync, then posts with a search link', async () => {
  const waiting = setup({ claim: { state: 'creating' } });
  await assert.rejects(waiting.worker(id), error => error instanceof RetryLater && error.seconds === 30);
  assert.equal(waiting.posted.length, 0);
  waiting.tick(11 * 60 * 1000);
  await waiting.worker(id);
  assert.equal(waiting.posted.length, 1);
  assert.match(waiting.posted[0].card.actions[0].url, /objects\/0-1\/views\/all\/list\?query=/);
  assert.deepEqual(contactReference({ state: 'closed', candidateContactIds: ['55'] }), { settled: true, contactId: '55' });
  assert.deepEqual(contactReference({ state: 'closed', candidateContactIds: ['55', '56'] }), { settled: true, contactId: null });
  assert.deepEqual(contactReference(null), { settled: false, contactId: null });
});

test('an interrupted post is retried once after its lease and then settled as unknown', async () => {
  const { worker, items, posted, microsoft, tick } = setup();
  microsoft.fail = true;
  await assert.rejects(worker(id), /connector down/);
  assert.equal(items.get(signupKey(id)).state, 'posting');
  await assert.rejects(worker(id), RetryLater, 'inside the lease');
  tick(130000);
  await assert.rejects(worker(id), /connector down/);
  assert.equal(items.get(signupKey(id)).attempts, 2);
  tick(130000);
  await worker(id);
  assert.equal(posted.length, 2);
  assert.deepEqual([items.get(signupKey(id)).state, items.get(signupKey(id)).reason], ['done', 'outcome-unknown']);
});

test('expired, erased or malformed submissions are skipped without a card', async () => {
  for (const patch of [{ expiresAt: Math.floor(NOW / 1000) - 1 }, { erasedAt: NOW }, { workingGroups: [] }, { workingGroups: ['nope'] }]) {
    const { worker, posted } = setup({ source: registration(patch) });
    await worker(id);
    assert.equal(posted.length, 0);
  }
  await assert.rejects(setup().worker('not-an-id'), TypeError);
});

test('the queue handler pins its own queue and reports partial failures with a durable Retry-After', async () => {
  const { worker } = setup({ claim: { state: 'creating' } });
  const visibility = [];
  const handler = createHandler({ worker, queueArn, changeVisibility: async (record, seconds) => visibility.push([record.messageId, seconds]) });
  assert.deepEqual(await handler({ Records: [message()] }), { batchItemFailures: [{ itemIdentifier: 'message-1' }] });
  assert.deepEqual(visibility, [['message-1', 30]]);
  assert.deepEqual(await handler({ Records: [{ ...message(), eventSourceARN: 'arn:aws:sqs:eu-west-2:123456789012:other' }] }),
    { batchItemFailures: [{ itemIdentifier: 'message-1' }] });
});
