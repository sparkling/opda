import assert from 'node:assert/strict';
import test from 'node:test';
import { createStore } from '../config/aws/hubspot-approval/store.mjs';
import { DOMAIN_POLICY, planDomainApprovals } from '../config/aws/hubspot-approval/domain-onboarding.mjs';
import { relayPendingOnboarding } from '../config/aws/hubspot-approval/domain-worker.mjs';
import { createWorker } from '../config/aws/hubspot-approval/index.mjs';
import { digest, emailHash } from '../config/aws/hubspot-approval/domain.mjs';

const NOW = Date.parse('2026-09-09T16:00:00Z'), CUTOVER = NOW - 60000;
const A = 'finance-and-banking', B = 'conveyancing', C = 'estate-agency';
const config = { participantsTableName: 'participants', registrationsTableName: 'registrations',
  domainReviewCutover: CUTOVER, onboardingCutover: CUTOVER - 60000 };
const base = () => ({ map: { pk: 'CRM#CONTACT#123', contactId: '123', participantId: 'participant',
  cognitoSub: 'sub', email: 'synthetic@example.test', registrationId: 'registration', revision: 1 },
  row: { pk: 'USER#sub', participantId: 'participant', cognitoSub: 'sub', email: 'synthetic@example.test',
    hubspotContactId: '123', hubspotPortalId: 144765514, active: false, reviewStatus: 'received',
    suspended: false, enrolmentStatus: 'not_invited', accessVersion: 1 } });
const decision = (domainId = A, status = 'approved', at = NOW - 1000) => ({ domainId, status, at,
  actor: '42', trusted: true, id: digest(`${domainId}:${status}:${at}`), reason: 'hubspot-manual-domain-review',
  ...(status === 'approved' ? { groupSnapshot: { snapshotStatus: 'approved', groups: [domainId],
    groupDigest: digest(JSON.stringify([domainId])), groupsAt: CUTOVER - 1000 } } : {}) });
const av = v => v === null ? { NULL: true } : typeof v === 'string' ? { S: v } : typeof v === 'number'
  ? { N: String(v) } : typeof v === 'boolean' ? { BOOL: v } : Array.isArray(v) ? { L: v.map(av) } : { M: encode(v) };
const encode = item => Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined).map(([k, v]) => [k, av(v)]));
const value = v => v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L ? v.L.map(value) : decode(v.M)));
const decode = item => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, value(v)]));

// Only the emitted condition grammar is supported. All checks precede all writes.
function condition(op, item = {}) {
  const tokens = op.ConditionExpression.match(/#[\w]+|:[\w]+|[\w]+|[()=><]/g);
  let cursor = 0;
  const field = name => op.ExpressionAttributeNames?.[name] ?? name;
  const consume = expected => assert.equal(tokens[cursor++], expected);
  function atom() {
    const token = tokens[cursor++];
    if (token === '(') { const result = or(); consume(')'); return result; }
    if (['attribute_exists', 'attribute_not_exists'].includes(token)) {
      consume('('); const exists = Object.hasOwn(item, field(tokens[cursor++])); consume(')');
      return token === 'attribute_exists' ? exists : !exists;
    }
    const left = item[field(token)], operator = tokens[cursor++], right = value(op.ExpressionAttributeValues[tokens[cursor++]]);
    assert.ok(['=', '>'].includes(operator)); return operator === '=' ? left === right : left > right;
  }
  function and() { let result = atom(); while (tokens[cursor] === 'AND') { cursor++; const next = atom(); result = result && next; } return result; }
  function or() { let result = and(); while (tokens[cursor] === 'OR') { cursor++; const next = and(); result = result || next; } return result; }
  const result = or(); assert.equal(cursor, tokens.length); return result;
}
function fixture(input = base()) {
  const items = new Map(), transactions = [], scans = [], gets = [];
  let onTransaction;
  const key = (table, pk) => `${table}:${pk}`;
  const seed = (item, table = config.participantsTableName) => items.set(key(table, item.pk ?? item.registrationId), structuredClone(item));
  const read = (pk, table = config.participantsTableName) => structuredClone(items.get(key(table, pk)));
  const remove = (pk, table = config.participantsTableName) => items.delete(key(table, pk));
  seed(input.map); seed(input.row);
  seed({ pk: `EMAIL#${emailHash(input.map.email)}`, participantId: input.row.participantId });
  seed({ registrationId: 'registration', expiresAt: Math.floor(NOW / 1000) + 86400 }, config.registrationsTableName);
  const store = createStore(config, { send: async (command, request) => {
    if (command === 'GetItemCommand') {
      gets.push(request); assert.equal(request.ConsistentRead, true);
      const found = read(value(Object.values(request.Key)[0]), request.TableName);
      return found ? { Item: encode(found) } : {};
    }
    if (command === 'ScanCommand') {
      scans.push(request); assert.equal(request.ConsistentRead, true); assert.ok(request.Limit >= 1 && request.Limit <= 50);
      const rows = [...items.entries()].filter(([id]) => id.startsWith(`${config.participantsTableName}:`))
        .map(([, item]) => item).sort((a, b) => a.pk.localeCompare(b.pk));
      const start = request.ExclusiveStartKey ? rows.findIndex(row => row.pk === request.ExclusiveStartKey.pk.S) + 1 : 0;
      const page = rows.slice(start, start + request.Limit);
      const found = page.filter(row => row.pk.startsWith('CRM#ONBOARDING#') && row.status === 'pending');
      return { Items: found.map(encode), ...(start + page.length < rows.length
        ? { LastEvaluatedKey: { pk: { S: page.at(-1).pk } } } : {}) };
    }
    assert.equal(command, 'TransactWriteItemsCommand');
    transactions.push(request); onTransaction?.();
    const targets = request.TransactItems.map(operation => {
      const [kind, op] = Object.entries(operation)[0], item = kind === 'Put' ? decode(op.Item) : null;
      const pk = item?.pk ?? value(Object.values(op.Key)[0]);
      return { kind, op, item, pk, before: read(pk, op.TableName) };
    });
    assert.equal(new Set(targets.map(t => key(t.op.TableName, t.pk))).size, targets.length);
    if (targets.some(t => !condition(t.op, t.before))) throw new Error('Conditional transaction rejected');
    for (const { kind, op, item, before } of targets) {
      if (kind === 'Put') seed(item, op.TableName);
      if (kind === 'Update') {
        const updated = { ...before };
        for (const assignment of op.UpdateExpression.slice(4).split(', ')) {
          const [name, rhs] = assignment.split(' = ');
          updated[op.ExpressionAttributeNames?.[name] ?? name] = value(op.ExpressionAttributeValues[rhs]);
        }
        seed(updated, op.TableName);
      }
    }
    return {};
  } });
  return { store, read, seed, remove, transactions, scans, gets,
    race: fn => { onTransaction = fn; }, current: () => ({ map: read(input.map.pk), row: read(input.row.pk) }),
    operations: () => [...items.values()].filter(item => item.pk?.startsWith('CRM#ONBOARDING#')),
    audits: () => [...items.values()].filter(item => item.pk?.startsWith('CRM#AUDIT#')) };
}
const apply = (f, decisions = [], options = {}, at = NOW) => {
  const { map, row } = f.current(); return f.store.applyDomains(map, row, decisions, at, options);
};
function historical(f, status = 'complete', patch = {}) {
  const { map, row } = f.current(), operationId = digest('old-combined-invitation');
  const snapshot = { operationId, action: 'provision', snapshotStatus: 'approved',
    groups: [A, B], groupDigest: digest(JSON.stringify([A, B])), decisionAt: CUTOVER - 1000,
    decisionId: digest('old-global-approval'), actor: '42', accessVersion: row.accessVersion, templateVersion: 1 };
  f.seed({ ...map, onboarding: snapshot });
  f.seed({ ...row, active: true, reviewStatus: 'approved', approvedAt: snapshot.decisionAt, onboarding: snapshot,
    profile: { opda_requested_working_groups: `${A};${B};${C}` } });
  const old = { pk: `CRM#ONBOARDING#${operationId}`, operationId, schemaVersion: 1, status, action: 'provision',
    participantId: row.participantId, contactId: map.contactId, cognitoSub: row.cognitoSub,
    accountKey: row.pk, bindingKey: map.pk, ...patch };
  f.seed(old); return old;
}

test('first domain approval commits account, binding, single-domain audit and outbox atomically', async () => {
  const f = fixture(), result = await apply(f, [decision()]);
  assert.equal(result.account.active, true); assert.equal(result.account.accessVersion, 2);
  assert.deepEqual(result.account.approvedDomains, [A]);
  assert.deepEqual(result.binding.domainApprovals, result.account.domainApprovals);
  assert.equal(f.transactions.length, 1); assert.equal(f.operations().length, 1); assert.equal(f.audits().length, 1);
  assert.deepEqual(f.audits()[0].onboarding.groups, [A]);
  const checks = f.transactions[0].TransactItems.flatMap(item => item.ConditionCheck ?? []);
  assert.ok(checks.some(op => op.TableName === config.registrationsTableName));
  assert.ok(checks.some(op => op.Key.pk?.S.startsWith('SYNC#SUPPRESS#')));
});

test('version, source, suppression and duplicate-outbox races roll back every domain grant', async () => {
  for (const race of ['version', 'source', 'suppression', 'outbox']) {
    const f = fixture(), initial = f.current();
    const plan = planDomainApprovals({ ...initial, decisions: [decision()], now: NOW, cutover: CUTOVER });
    f.race(() => {
      if (race === 'version') f.seed({ ...initial.row, accessVersion: 99 });
      if (race === 'source') f.remove('registration', config.registrationsTableName);
      if (race === 'suppression') f.seed({ pk: `SYNC#SUPPRESS#EMAIL#${emailHash(initial.map.email)}` });
      if (race === 'outbox') f.seed(plan.operations[0]);
    });
    await assert.rejects(apply(f, [decision()]), /Conditional/);
    assert.deepEqual(f.current().map, initial.map); assert.equal(f.current().row.active, false);
    assert.equal(f.audits().length, 0); assert.equal(f.operations().length, race === 'outbox' ? 1 : 0);
  }
});

test('partial withdrawal is atomic, keeps the other domain, and cannot be blocked by intake/claim suppression', async () => {
  const f = fixture(); await apply(f, [decision(A), decision(B)]);
  const before = f.current(), other = before.row.domainApprovals[B];
  f.remove('registration', config.registrationsTableName);
  f.remove(`EMAIL#${emailHash(before.map.email)}`);
  f.seed({ pk: `SYNC#SUPPRESS#EMAIL#${emailHash(before.map.email)}` });
  const result = await apply(f, [decision(A, 'withdrawn', NOW)]);
  assert.equal(result.account.active, true); assert.equal(result.account.accessVersion, before.row.accessVersion);
  assert.deepEqual(result.account.approvedDomains, [B]); assert.deepEqual(result.account.domainApprovals[B], other);
  assert.equal(f.operations().filter(op => op.action === 'revoke').length, 1);
  assert.equal(f.transactions.at(-1).TransactItems.some(item => item.ConditionCheck), false);
});

test('completed v1 migration preserves only frozen scopes, never interests or historical invitation resends', async () => {
  const f = fixture(), old = historical(f), result = await apply(f);
  assert.equal(result.account.approvalPolicy, DOMAIN_POLICY); assert.deepEqual(result.account.approvedDomains, [A, B]);
  assert.equal(f.operations().length, 1); assert.equal(f.audits().length, 0);
  const guard = f.transactions.at(-1).TransactItems.find(item => item.ConditionCheck?.Key.pk?.S === old.pk);
  assert.ok(guard); assert.equal(guard.ConditionCheck.ExpressionAttributeValues[':complete'].S, 'complete');
  await apply(f); assert.equal(f.transactions.length, 1);
});

test('changing the historical completion receipt races and aborts the whole migration', async () => {
  const f = fixture(), old = historical(f), before = f.current();
  f.race(() => f.seed({ ...old, status: 'attention' }));
  await assert.rejects(apply(f), /Conditional/);
  assert.deepEqual(f.current(), before); assert.equal(f.audits().length, 0); assert.equal(f.operations().length, 1);
});

test('missing, ambiguous, cancelled or foreign historical outcome blocks new grants but not domain withdrawal', async () => {
  for (const state of ['missing', 'pending', 'attention', 'cancelled', 'foreign']) {
    const f = fixture(), old = historical(f, state === 'foreign' ? 'complete' : state,
      state === 'foreign' ? { participantId: 'different-participant' } : {});
    if (state === 'missing') f.remove(old.pk);
    const before = f.current();
    await apply(f, [decision(C)]); assert.deepEqual(f.current(), before);
    const result = await apply(f, [decision(A, 'withdrawn', NOW), decision(C)]);
    assert.equal(result.account.active, true); assert.deepEqual(result.account.approvedDomains, [B]);
    assert.equal(result.account.approvalPolicy, DOMAIN_POLICY);
    assert.deepEqual(result.binding.domainMigrationPending, { operationId: old.operationId });
    assert.deepEqual(result.account.domainMigrationPending, result.binding.domainMigrationPending);
    assert.equal(result.account.domainApprovals[C], undefined);
    const created = f.operations().filter(op => op.schemaVersion === 2);
    assert.equal(created.length, 1); assert.equal(created[0].action, 'revoke'); assert.equal(created[0].domainId, A);
  }
});

test('migration hold settlement requires the original outcome explicitly complete, not cancellation or attention', async () => {
  const f = fixture(), old = historical(f, 'pending');
  await apply(f, [decision(A, 'withdrawn', NOW)]);
  for (const status of ['pending', 'cancelled', 'attention']) {
    f.seed({ ...old, status }); const before = f.current();
    await apply(f, [decision(C, 'approved', NOW + 1000)], {}, NOW + 2000);
    assert.deepEqual(f.current(), before); assert.equal(f.operations().filter(op => op.schemaVersion === 2 && op.action === 'provision').length, 0);
  }
  // The original ledger must be reconciled by the operator/runtime first.
  // Merely cancelling stale work says nothing about an unknown mail outcome.
  f.seed({ ...old, status: 'complete' });
  const result = await apply(f, [decision(C, 'approved', NOW + 1000)], {}, NOW + 2000);
  assert.equal(result.binding.domainMigrationPending, null); assert.equal(result.account.domainMigrationPending, null);
  assert.deepEqual(result.account.approvedDomains, [B, C]);
  assert.equal(f.operations().filter(op => op.schemaVersion === 2 && op.action === 'provision').length, 1);
});

test('additional and final domain denials continue during the migration hold, without new provisions', async () => {
  const f = fixture(); historical(f, 'attention'); await apply(f, [decision(A, 'withdrawn', NOW)]);
  const version = f.current().row.accessVersion;
  const result = await apply(f, [decision(B, 'withdrawn', NOW + 1000)], {}, NOW + 2000);
  assert.equal(result.account.active, false); assert.equal(result.account.accessVersion, version + 1);
  assert.equal(f.operations().filter(op => op.schemaVersion === 2 && op.action === 'revoke').length, 2);
});

test('global and account holds deny immediately and use the existing v1 receipt-owned cleanup path', async () => {
  for (const options of [{ holdReason: 'contact-unavailable' }, { globalDecision: decision('global', 'withdrawn', NOW) }]) {
    const f = fixture(), old = historical(f, 'attention'), result = await apply(f, [], options);
    assert.equal(result.account.active, false); assert.equal(result.account.suspended, true);
    assert.equal(result.account.accessVersion, 2); assert.equal(result.account.approvalPolicy, undefined);
    assert.equal(result.account.onboarding.action, 'revoke'); assert.equal(result.account.onboarding.templateVersion, 1);
    assert.equal(result.binding.domainMigrationPending.operationId, old.operationId);
    assert.equal(f.gets.length, 0, 'A denial cannot depend on reading an old send outcome');
    const revoke = f.operations().find(op => op.action === 'revoke'); assert.ok(revoke); assert.equal(revoke.schemaVersion, 1);
    if (options.globalDecision) assert.equal(result.binding.domainGlobalState, 'held');
    const transactionCount = f.transactions.length;
    await apply(f, [], options, NOW + 1000); assert.equal(f.transactions.length, transactionCount);
  }
});

test('invalid frozen legacy scope fails closed into account hold and owned cleanup, not inferred scope', async () => {
  const f = fixture(); historical(f, 'pending');
  const { row, map } = f.current(), snapshot = { ...row.onboarding, groupDigest: digest('wrong-scope') };
  f.seed({ ...row, onboarding: snapshot }); f.seed({ ...map, onboarding: snapshot });
  const result = await apply(f, [decision(A, 'withdrawn', NOW)]);
  assert.equal(result.account.active, false); assert.equal(result.binding.holdReason, 'historical-domain-scope-unavailable');
  assert.equal(result.account.onboarding.action, 'revoke'); assert.equal(f.operations().some(op => op.schemaVersion === 2), false);
});

test('a fresh global denial during legacy cleanup advances the domain hold watermark, but replay does not', async () => {
  const f = fixture(); historical(f, 'attention');
  await apply(f, [], { globalDecision: decision('global', 'withdrawn', NOW) });
  const options = { globalDecision: decision('global', 'withdrawn', NOW + 1000) };
  await apply(f, [], options, NOW + 2000);
  assert.equal(f.current().map.domainHoldAt, NOW + 1000);
  const before = f.current(); await apply(f, [], options, NOW + 3000); assert.deepEqual(f.current(), before);
});

test('legacy cleanup is notified despite a Cognito failure and the committed denial is retried without a second revoke', async () => {
  const f = fixture(); historical(f, 'attention'); let attempts = 0;
  const hints = [], worker = createWorker({ store: f.store, domainCutover: CUTOVER, now: () => NOW,
    hubspot: { getContact: async () => null }, identity: { setAccess: async (_, enabled) => {
      assert.equal(enabled, false); if (++attempts === 1) throw new Error('Cognito unavailable');
    } }, notifyOnboarding: async hint => hints.push(hint) });
  await assert.rejects(worker.processContact('123'), /Cognito unavailable/);
  assert.equal(f.current().row.active, false); assert.equal(hints.length, 1);
  const operationId = f.current().map.onboarding.operationId;
  assert.equal(hints[0].operationId, operationId);
  await worker.processContact('123'); await worker.processContact('123');
  assert.equal(attempts, 2); assert.equal(f.operations().filter(op => op.action === 'revoke').length, 1);
  assert.ok(hints.every(hint => hint.operationId === operationId));
});

test('an inactive legacy account cannot lose receipt-owned cleanup merely because migration sees no eligible scope', async () => {
  const f = fixture(); historical(f); f.seed({ ...f.current().row, active: false });
  const hints = [], worker = createWorker({ store: f.store, domainCutover: CUTOVER, now: () => NOW,
    hubspot: { getContact: async () => ({ id: '123', properties: { email: base().row.email,
      opda_active: 'false', opda_enrolment_status: 'not_invited' } }) },
    identity: { setAccess: async (_, enabled) => assert.equal(enabled, false) },
    notifyOnboarding: async hint => hints.push(hint) });
  await worker.processContact('123');
  assert.equal(f.current().row.onboarding.action, 'revoke');
  assert.equal(f.current().map.holdReason, 'access-unavailable'); assert.equal(hints.length, 1);
});

test('5994 pending domain operations relay in bounded resumable batches without poison-entry starvation', async () => {
  const f = fixture(), seen = new Set();
  for (let i = 0; i < 5994; i++) {
    const operationId = i.toString(16).padStart(64, '0');
    f.seed({ pk: `CRM#ONBOARDING#${operationId}`, operationId, schemaVersion: 2, status: 'pending' });
  }
  const poison = '0'.repeat(64); let concurrent = 0, maximum = 0, batches = 0;
  const notify = async ({ operationId }) => {
    concurrent++; maximum = Math.max(maximum, concurrent); seen.add(operationId);
    await Promise.resolve(); concurrent--; if (operationId === poison) throw new Error('synthetic queue failure');
  };
  do {
    const previous = seen.size, before = f.scans.length;
    try { await relayPendingOnboarding(f.store, notify); } catch (error) { assert.match(error.message, /notification incomplete/); }
    assert.ok(seen.size - previous <= 100); assert.ok(f.scans.length - before <= 20); batches++;
    assert.ok(batches <= 62);
  } while (f.read('CRM#ONBOARDING_RELAY#cursor').cursor !== null);
  assert.equal(seen.size, 5994); assert.ok(maximum <= 4); assert.ok(maximum > 1);
  await assert.rejects(relayPendingOnboarding(f.store, notify), /notification incomplete/);
  assert.equal(f.operations().length, 5994, 'Queue hints do not complete or delete the durable outbox');
});

test('relay checkpoint CAS prevents a stale concurrent batch from moving progress backward', async () => {
  const f = fixture();
  const first = await f.store.pendingOnboarding({ resumable: true });
  const concurrent = await f.store.pendingOnboarding({ resumable: true });
  await f.store.advanceOnboardingRelay(first);
  await assert.rejects(f.store.advanceOnboardingRelay(concurrent), /Conditional/);
  assert.equal(f.read('CRM#ONBOARDING_RELAY#cursor').revision, 1);
});

test('an invalid outbox reference is reported without starving valid independent withdrawals', async () => {
  const f = fixture(), seen = [], operationId = digest('valid-revocation');
  f.seed({ pk: 'CRM#ONBOARDING#broken', operationId: 'broken', schemaVersion: 2, status: 'pending' });
  f.seed({ pk: `CRM#ONBOARDING#${operationId}`, operationId, schemaVersion: 2, status: 'pending' });
  await assert.rejects(relayPendingOnboarding(f.store, async hint => seen.push(hint)), /Invalid onboarding outbox/);
  assert.deepEqual(seen, [{ schemaVersion: 1, operationId }]);
  assert.equal(f.read('CRM#ONBOARDING_RELAY#cursor').revision, 1);
  assert.equal(f.operations().length, 2, 'The invalid record remains available for repair');
});
