import assert from 'node:assert/strict';
import test from 'node:test';
import { createStore } from '../config/aws/hubspot-approval/store.mjs';
import { digest } from '../config/aws/hubspot-approval/domain.mjs';
import { createOnboardingNotifier, onboardingHint } from '../config/aws/hubspot-approval/onboarding.mjs';

// The account-wide (v1) approval path and its outbox seeding are retired: per-domain
// outbox atomicity, relay and recovery live in hubspot-approval-domain-store.test.mjs.
// Only the transport-level pieces both paths share remain here.
const now = Date.parse('2026-09-09T12:00:00Z');
const config = { participantsTableName: 'participants', registrationsTableName: 'registrations', onboardingCutover: now - 10000 };
const row = () => ({ email: 'synthetic@example.test' });
const av = v => v === null ? { NULL: true } : typeof v === 'string' ? { S: v }
  : typeof v === 'number' ? { N: String(v) } : typeof v === 'boolean' ? { BOOL: v }
    : Array.isArray(v) ? { L: v.map(av) } : { M: encode(v) };
const encode = v => Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, av(x)]));
const value = v => v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L ? v.L.map(value) : decode(v.M)));
const decode = v => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x)]));

test('reference notifier sends no personal fields and never acknowledges before the queue call finishes', async () => {
  const calls = []; let complete;
  const notifier = createOnboardingNotifier('https://sqs.fixture.test/queue', { sendMessage: async input => {
    calls.push(input); await new Promise(resolve => { complete = resolve; });
  } });
  const hint = onboardingHint(digest('synthetic-operation')); let done = false;
  const pending = notifier(hint).then(() => { done = true; });
  await Promise.resolve(); assert.equal(done, false);
  assert.deepEqual(calls, [{ QueueUrl: 'https://sqs.fixture.test/queue', MessageBody: JSON.stringify(hint) }]);
  complete(); await pending; assert.equal(done, true);
  for (const invalid of [{ ...hint, email: row().email }, { ...hint, schemaVersion: 2 },
    { schemaVersion: 1, operationId: '../123' }, { schemaVersion: 1, operationId: '123' }]) {
    await assert.rejects(notifier(invalid));
  }
  assert.equal(calls.length, 1);
});

test('outbox recovery validates complete bounded pages before returning references', async () => {
  const operationId = digest('synthetic-operation');
  const item = encode({ pk: `CRM#ONBOARDING#${operationId}`, schemaVersion: 1, operationId, status: 'pending' });
  const pages = [{ Items: [], LastEvaluatedKey: { pk: { S: 'cursor' } } }, { Items: [item] }];
  let calls = 0;
  const store = createStore(config, { send: async (command, input) => {
    assert.equal(command, 'ScanCommand'); assert.equal(input.ConsistentRead, true);
    if (calls) assert.deepEqual(input.ExclusiveStartKey, { pk: { S: 'cursor' } });
    return pages[calls++];
  } });
  assert.equal((await store.pendingOnboarding())[0].operationId, operationId); assert.equal(calls, 2);
  for (const page of [{ Items: [encode({ ...decode(item), operationId: 'invalid' })] },
    { Items: 'invalid' }, { Items: [], LastEvaluatedKey: { pk: { S: 'repeated' } } },
    { Items: Array.from({ length: 5001 }, () => item) }]) {
    const invalid = createStore(config, { send: async () => page });
    await assert.rejects(invalid.pendingOnboarding());
  }
});
