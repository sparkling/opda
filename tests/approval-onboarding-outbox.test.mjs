import assert from 'node:assert/strict';
import test from 'node:test';
import { createStore } from '../config/aws/hubspot-approval/store.mjs';
import { createWorker } from '../config/aws/hubspot-approval/index.mjs';
import { approvedGroupSnapshot, digest, emailHash, reviewDecision } from '../config/aws/hubspot-approval/domain.mjs';
import { APPROVAL } from '../config/aws/hubspot-participation/import.mjs';
import { createOnboardingNotifier, onboardingHint } from '../config/aws/hubspot-approval/onboarding.mjs';

const now = Date.parse('2026-09-09T12:00:00Z');
const cutover = now - 10000;
const config = { participantsTableName: 'participants', registrationsTableName: 'registrations', onboardingCutover: cutover };
const map = (patch = {}) => ({ pk: 'CRM#CONTACT#123', contactId: '123', participantId: 'synthetic-participant',
  cognitoSub: 'synthetic-sub', email: 'synthetic@example.test', revision: 1, ...patch });
const row = (patch = {}) => ({ pk: 'USER#synthetic-sub', hubspotPortalId: 144765514, hubspotContactId: '123',
  participantId: 'synthetic-participant', cognitoSub: 'synthetic-sub', email: 'synthetic@example.test',
  name: 'Synthetic Person', active: false, suspended: false, reviewStatus: 'received',
  enrolmentStatus: 'not_invited', accessVersion: 1, ...patch });
const entry = (value, at, extra = {}) => ({ value, timestamp: new Date(at).toISOString(), sourceType: 'CRM_UI',
  sourceId: 'userId:42', updatedByUserId: 42, ...extra });
const contact = (status = 'approved', at = now - 1000, groups = 'conveyancing') => ({ id: '123', properties: {
  email: row().email, opda_review_status: status, opda_requested_working_groups: groups,
  opda_active: 'true', opda_enrolment_status: 'not_invited',
}, propertiesWithHistory: { email: [entry(row().email, cutover - 1000)],
  opda_review_status: [entry(status, at)], opda_requested_working_groups: [entry(groups, cutover - 1000)] } });
function decision(c = contact()) {
  const d = reviewDecision(c, { cutover: cutover - 100000, now });
  return { ...d, groupSnapshot: approvedGroupSnapshot(c, d) };
}
const av = v => v === null ? { NULL: true } : typeof v === 'string' ? { S: v }
  : typeof v === 'number' ? { N: String(v) } : typeof v === 'boolean' ? { BOOL: v }
    : Array.isArray(v) ? { L: v.map(av) } : { M: encode(v) };
const encode = v => Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, av(x)]));
const value = v => v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L ? v.L.map(value) : decode(v.M)));
const decode = v => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x)]));

// Only the grammar emitted by the store is supported; check every condition before any write.
function condition(op, item = {}) {
  const tokens = op.ConditionExpression.match(/#[\w]+|:[\w]+|[\w]+|[()=><]/g);
  let i = 0;
  const field = name => op.ExpressionAttributeNames?.[name] ?? name;
  const consume = expected => assert.equal(tokens[i++], expected);
  function atom() {
    const token = tokens[i++];
    if (token === '(') { const result = or(); consume(')'); return result; }
    if (['attribute_exists', 'attribute_not_exists'].includes(token)) {
      consume('('); const exists = Object.hasOwn(item, field(tokens[i++])); consume(')');
      return token === 'attribute_exists' ? exists : !exists;
    }
    const left = item[field(token)], operator = tokens[i++], right = value(op.ExpressionAttributeValues[tokens[i++]]);
    assert.ok(['=', '>'].includes(operator)); return operator === '=' ? left === right : left > right;
  }
  function and() { let result = atom(); while (tokens[i] === 'AND') { i++; const next = atom(); result = result && next; } return result; }
  function or() { let result = and(); while (tokens[i] === 'OR') { i++; const next = and(); result = result || next; } return result; }
  const result = or(); assert.equal(i, tokens.length); return result;
}
function fixture(overrides = {}) {
  const items = new Map(), transactions = [], scans = [];
  const seed = item => items.set(item.pk, structuredClone(item));
  const read = pk => structuredClone(items.get(pk));
  seed(map()); seed(row()); seed({ pk: `EMAIL#${emailHash(row().email)}`, participantId: row().participantId });
  const store = createStore({ ...config, ...overrides.config }, { send: async (command, input) => {
    if (command === 'GetItemCommand') {
      assert.equal(input.ConsistentRead, true); const found = read(input.Key.pk.S);
      return found ? { Item: encode(found) } : {};
    }
    if (command === 'ScanCommand') {
      scans.push(input); assert.equal(input.ConsistentRead, true);
      if (input.ExpressionAttributeValues[':outbox']) return { Items: [...items.values()]
        .filter(item => item.pk.startsWith('CRM#ONBOARDING#') && item.status === 'pending').map(encode) };
      return { Items: [...items.values()].filter(item => /^(USER#|CRM#CONTACT#)/.test(item.pk)).map(encode) };
    }
    assert.equal(command, 'TransactWriteItemsCommand'); transactions.push(structuredClone(input));
    await overrides.beforeTransaction?.({ seed, read });
    const targets = input.TransactItems.map(operation => {
      const [kind, op] = Object.entries(operation)[0], item = kind === 'Put' ? decode(op.Item) : undefined;
      const pk = item?.pk ?? op.Key.pk.S;
      return { kind, op, item, pk, before: read(pk) };
    });
    assert.equal(new Set(targets.map(t => t.pk)).size, targets.length);
    if (targets.some(t => !condition(t.op, t.before))) throw new Error('Conditional transaction rejected');
    for (const { kind, op, item, before } of targets) {
      if (kind === 'Put') seed(item);
      if (kind === 'Update') {
        const updated = { ...before };
        for (const assignment of op.UpdateExpression.slice(4).split(', ')) {
          const [name, rhs] = assignment.split(' = ');
          updated[op.ExpressionAttributeNames?.[name] ?? name] = value(op.ExpressionAttributeValues[rhs]);
        }
        seed(updated);
      }
    }
    return {};
  } });
  return { store, seed, read, items, transactions, scans,
    ops: () => [...items.values()].filter(item => item.pk.startsWith('CRM#ONBOARDING#')) };
}

test('approval atomically freezes USER/map/audit and creates only a reference outbox', async () => {
  const f = fixture(); const d = decision(); const result = await f.store.apply(map(), row(), d, now);
  assert.equal(f.transactions.length, 1); assert.equal(result.account.active, true);
  const [op] = f.ops(); assert.ok(op); assert.equal(op.action, 'provision'); assert.equal(op.status, 'pending');
  assert.match(op.operationId, /^[a-f0-9]{64}$/); assert.equal(op.pk, `CRM#ONBOARDING#${op.operationId}`);
  assert.equal(op.accountKey, row().pk); assert.equal(op.bindingKey, map().pk); assert.equal(op.accessVersion, 2);
  assert.equal(op.auditKey, `CRM#AUDIT#123#${d.id}`);
  const snapshot = result.account.onboarding;
  assert.deepEqual(snapshot.groups, ['conveyancing']); assert.equal(snapshot.snapshotStatus, 'approved');
  assert.equal(snapshot.decisionId, d.id); assert.equal(snapshot.decisionAt, d.at); assert.equal(snapshot.actor, '42');
  assert.equal(snapshot.templateVersion, 1); assert.equal(snapshot.accessVersion, 2);
  assert.deepEqual(result.binding.onboarding, snapshot); assert.deepEqual(f.read(op.auditKey).onboarding, snapshot);
  assert.deepEqual(Object.keys(op).sort(), ['pk', 'schemaVersion', 'operationId', 'participantId', 'contactId',
    'cognitoSub', 'accountKey', 'bindingKey', 'auditKey', 'decisionId', 'accessVersion', 'action', 'status', 'createdAt'].sort());
  assert.equal(JSON.stringify(op).includes(row().email), false); assert.equal(JSON.stringify(op).includes('conveyancing'), false);
});

test('a failed version/suppression/outbox condition aborts all approval and snapshot writes', async () => {
  const d = decision();
  for (const mutate of [db => db.seed(row({ accessVersion: 2 })),
    db => db.seed({ pk: `SYNC#SUPPRESS#EMAIL#${emailHash(row().email)}` }),
    db => db.seed(map({ revision: 2 })), db => db.seed({
      pk: `CRM#ONBOARDING#${digest(JSON.stringify([1, map().participantId, d.id, 2]))}`, status: 'complete',
    })]) {
    const f = fixture({ beforeTransaction: mutate });
    await assert.rejects(f.store.apply(map(), row(), d, now), /Conditional/);
    assert.equal(f.ops().filter(op => op.status === 'pending').length, 0);
    assert.equal(f.read(row().pk).onboarding, undefined);
    assert.equal(f.read(`CRM#AUDIT#123#${d.id}`), undefined);
  }
});

test('no activation, pre-activation decisions and imported website approvals do not create onboarding', async () => {
  for (const cfg of [{ onboardingCutover: undefined }, { onboardingCutover: now }]) {
    const f = fixture({ config: cfg }); await f.store.apply(map(), row(), decision(), now);
    assert.equal(f.ops().length, 0); assert.equal(f.read(row().pk).active, true);
  }
  const f = fixture(); const imported = row({ active: true, reviewStatus: 'approved', approvalId: APPROVAL.id,
    approvedAt: Date.parse(APPROVAL.cutoff) }); f.seed(imported);
  await f.store.apply(map({ imported: true }), imported, decision(contact('approved', cutover - 1)), now);
  assert.equal(f.ops().length, 0);
});

test('activation configuration is explicit and invalid timestamps fail closed', () => {
  for (const onboardingCutover of [null, NaN, Infinity, -1, '2026-09-09', 1.5]) {
    assert.throws(() => createStore({ ...config, onboardingCutover }), /activation cutoff/);
  }
});

test('empty and invalid groups preserve website approval but request owned-grant reconciliation, never provisioning', async () => {
  for (const groups of ['', 'technology', null]) {
    const f = fixture(); const result = await f.store.apply(map(), row(), decision(contact('approved', now - 1000, groups)), now);
    assert.equal(result.account.active, true); assert.equal(f.ops()[0].action, 'revoke');
    assert.deepEqual(result.account.onboarding.groups, []);
    assert.equal(result.account.onboarding.snapshotStatus, groups === '' ? 'empty' : 'review_required');
  }
});

test('denial and deletion/email holds queue revocation without reading invalid group selections', async () => {
  for (const status of ['withdrawn', 'rejected', 'under_review', 'received']) {
    const f = fixture(); f.seed(row({ active: true }));
    const result = await f.store.apply(map(), row({ active: true }), decision(contact(status, now - 1000, null)), now);
    assert.equal(result.account.active, false); assert.equal(f.ops()[0].action, 'revoke');
    assert.equal(result.account.onboarding.snapshotStatus, 'denied');
  }
  for (const reason of ['contact-unavailable', 'identity-changed']) {
    const f = fixture(); const result = await f.store.hold(map(), row(), reason, now);
    assert.equal(result.account.active, false); assert.equal(f.ops()[0].action, 'revoke');
    assert.equal(result.account.onboarding.reason, reason);
  }
});

test('duplicate/reordered decisions and later checkbox edits cannot alter the frozen snapshot or enqueue twice', async () => {
  const f = fixture(); const first = await f.store.apply(map(), row(), decision(), now);
  const writes = f.transactions.length;
  for (const d of [decision(), decision(contact('approved', now - 2000)), decision(contact('approved', now - 1000, 'estate-agency'))]) {
    await f.store.apply(first.binding, first.account, d, now);
  }
  assert.equal(f.ops().length, 1); assert.equal(f.transactions.length, writes);
  assert.deepEqual(f.read(row().pk).onboarding.groups, ['conveyancing']);
});

test('withdrawal supersedes an operation and reapproval creates a new one without reviving an old operation', async () => {
  const f = fixture(); const first = await f.store.apply(map(), row(), decision(), now);
  const revoked = await f.store.apply(first.binding, first.account, decision(contact('withdrawn', now)), now);
  const fresh = await f.store.apply(revoked.binding, revoked.account,
    decision(contact('approved', now + 1000, 'estate-agency')), now + 1000);
  assert.equal(f.ops().length, 3);
  assert.equal(new Set(f.ops().map(op => op.operationId)).size, 3);
  assert.deepEqual(f.ops().map(op => op.action), ['provision', 'revoke', 'provision']);
  assert.deepEqual(f.ops().map(op => op.accessVersion), [2, 3, 4]);
  assert.deepEqual(fresh.account.onboarding.groups, ['estate-agency']);
  assert.equal(first.account.onboarding.operationId === fresh.account.onboarding.operationId, false);
});

test('disabling prospective onboarding still records revocation for earlier managed approvals', async () => {
  const f = fixture({ config: { onboardingCutover: undefined } });
  const onboarding = { operationId: digest('old-operation'), action: 'provision', accessVersion: 1 };
  f.seed(map({ onboarding })); f.seed(row({ active: true, onboarding }));
  await f.store.hold(map({ onboarding }), row({ active: true, onboarding }), 'contact-unavailable', now);
  assert.equal(f.ops().length, 1); assert.equal(f.ops()[0].action, 'revoke');
});

function worker(f, options = {}) {
  let c = options.contact ?? contact(); const hints = [], effects = [];
  const instance = createWorker({ store: f.store, cutover: cutover - 100000, now: () => now,
    hubspot: { getContact: async () => c, listContacts: async () => {
      await options.listContacts?.(); return [c];
    }, projectStatus: async () => effects.push('project') },
    identity: { setAccess: async (_, enabled) => { effects.push(enabled ? 'enable' : 'disable');
      await options.setAccess?.(); } },
    notifyOnboarding: async hint => { hints.push(hint); await options.notify?.(hint); } });
  return { instance, hints, effects, contact: value => { c = value; } };
}

test('only a committed operation is notified, and notification never marks it complete', async () => {
  const f = fixture(); const w = worker(f, { notify: hint => {
    assert.equal(f.read(row().pk).active, true); assert.ok(f.read(`CRM#ONBOARDING#${hint.operationId}`));
  } });
  await w.instance.processContact('123');
  assert.deepEqual(w.hints, [{ schemaVersion: 1, operationId: f.ops()[0].operationId }]);
  assert.equal(f.ops()[0].status, 'pending');
});

test('queue failure and commit-to-notify interruption are repaired from pending operations', async () => {
  const f = fixture(); const w = worker(f, { notify: () => { throw new Error('Synthetic queue unavailable'); } });
  await assert.rejects(w.instance.processContact('123'));
  assert.equal(f.read(row().pk).active, true); assert.equal(f.ops().length, 1);
  const retry = worker(f); await retry.instance.relayOnboarding();
  assert.deepEqual(retry.hints, [{ schemaVersion: 1, operationId: f.ops()[0].operationId }]);
  assert.equal(f.ops()[0].status, 'pending');
  f.seed({ ...f.ops()[0], status: 'complete' });
  assert.deepEqual(await f.store.pendingOnboarding(), []);
});

test('Cognito failure cannot suppress a committed withdrawal notification', async () => {
  const f = fixture(); f.seed(row({ active: true }));
  const w = worker(f, { contact: contact('withdrawn'), setAccess: () => { throw new Error('Synthetic Cognito failure'); } });
  await assert.rejects(w.instance.processContact('123'));
  assert.equal(f.ops()[0].action, 'revoke'); assert.equal(w.hints.length, 1);
  assert.equal(f.read(row().pk).active, false);
});

test('external suspension with unchanged CRM review creates a revocation operation', async () => {
  const f = fixture(); const w = worker(f); await w.instance.processContact('123');
  f.seed({ ...f.read(row().pk), suspended: true, suspensionSource: 'security', accessVersion: 3 });
  await w.instance.processContact('123');
  assert.equal(f.ops().length, 2); assert.equal(f.ops()[1].action, 'revoke');
  assert.equal(f.read(row().pk).suspensionSource, 'security');
  assert.equal(w.effects.at(-2), 'disable');
});

test('reconciliation detects disabled/expired access even without changed review or projection drift', async () => {
  for (const patch of [{ active: false }, { suspended: true, suspensionSource: 'security' },
    { expiresAt: Math.floor(now / 1000) }, { erasedAt: now }, { enrolmentStatus: 'expired' }]) {
    const f = fixture(); const w = worker(f); await w.instance.processContact('123');
    f.seed({ ...f.read(row().pk), ...patch });
    const c = contact(); c.properties.opda_active = 'false';
    c.properties.opda_enrolment_status = f.read(row().pk).enrolmentStatus; w.contact(c);
    await w.instance.reconcile();
    assert.equal(f.ops().length, 2); assert.equal(f.ops()[1].action, 'revoke');
    assert.equal(f.read(row().pk).active, false);
  }
});

test('an unrelated account-version change cannot strand a pending revocation as stale', async () => {
  const f = fixture(); const w = worker(f); await w.instance.processContact('123');
  f.seed({ ...f.read(row().pk), suspended: true, suspensionSource: 'security', accessVersion: 3 });
  await w.instance.processContact('123');
  const previous = f.ops().at(-1);
  f.seed({ ...f.read(row().pk), accessVersion: previous.accessVersion + 1 });
  await w.instance.processContact('123');
  assert.equal(f.ops().length, 3); assert.equal(f.ops().at(-1).action, 'revoke');
  assert.equal(f.ops().at(-1).accessVersion, f.read(row().pk).accessVersion);
  assert.notEqual(f.ops().at(-1).operationId, previous.operationId);
});

test('reconciliation repairs notification without a new CRM decision or website projection drift', async () => {
  const f = fixture(); const w = worker(f); await w.instance.processContact('123');
  const before = f.transactions.length; w.hints.length = 0;
  await w.instance.reconcile();
  assert.equal(f.transactions.length, before); assert.equal(w.hints.length, 1);
});

test('CRM outage does not prevent relay of an already committed withdrawal', async () => {
  const f = fixture(); await f.store.apply(map(), row(), decision(contact('withdrawn')), now);
  const w = worker(f, { listContacts: () => { throw new Error('Synthetic CRM unavailable'); } });
  await assert.rejects(w.instance.reconcile(), /Synthetic CRM unavailable/);
  assert.deepEqual(w.hints, [{ schemaVersion: 1, operationId: f.ops()[0].operationId }]);
});

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
