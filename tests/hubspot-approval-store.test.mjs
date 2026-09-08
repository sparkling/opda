import assert from 'node:assert/strict';
import test from 'node:test';
import { createStore } from '../config/aws/hubspot-approval/store.mjs';
import { createWorker } from '../config/aws/hubspot-approval/index.mjs';
import { APPROVAL } from '../config/aws/hubspot-participation/import.mjs';
import { digest, emailHash, reviewDecision } from '../config/aws/hubspot-approval/domain.mjs';

const now = Date.parse('2026-09-09T10:00:00Z');
const cutover = now - 100000;
const config = { participantsTableName: 'participants-fixture', registrationsTableName: 'registrations-fixture' };
const sub = '00000000-0000-4000-8000-000000000001';
const profile = { contactId: '123', email: 'synthetic@example.test', name: 'Synthetic Person', profile: { company: 'Example' } };
const map = (patch = {}) => ({ ...profile, pk: 'CRM#CONTACT#123', participantId: 'participant-123',
  cognitoSub: sub, registrationId: 'application-123', revision: 3, ...patch });
const row = (patch = {}) => ({ pk: `USER#${sub}`, participantId: 'participant-123', cognitoSub: sub,
  email: profile.email, hubspotContactId: '123', hubspotPortalId: 144765514, reviewStatus: 'received',
  active: false, suspended: false, enrolmentStatus: 'not_invited', accessVersion: 1, ...patch });
const source = (patch = {}) => ({ registrationId: 'application-123', privacyNoticeVersion: '2026-09-08',
  expiresAt: Math.floor(now / 1000) + 86400, ...patch });
const decision = (patch = {}) => ({ id: digest('synthetic-manual-approval'), at: now - 1000, actor: '42',
  status: 'approved', trusted: true, reason: 'hubspot-manual-review', ...patch });
const crm = (status = 'approved', at = now - 1000) => ({ id: '123', properties: {
  email: profile.email, opda_full_name: profile.name, opda_review_status: status,
}, propertiesWithHistory: {
  email: [{ value: profile.email, timestamp: new Date(now - 10000).toISOString() }],
  opda_review_status: [{ value: status, timestamp: new Date(at).toISOString(),
    sourceType: 'CRM_UI', sourceId: 'userId:42', updatedByUserId: 42 }],
} });
const emailKey = `EMAIL#${emailHash(profile.email)}`;
const emailSuppression = `SYNC#SUPPRESS#EMAIL#${emailHash(profile.email)}`;
const sourceSuppression = 'SYNC#SUPPRESS#REGISTRATION#application-123';
const av = value => value === null ? { NULL: true } : typeof value === 'string' ? { S: value }
  : typeof value === 'number' ? { N: String(value) } : typeof value === 'boolean' ? { BOOL: value }
    : Array.isArray(value) ? { L: value.map(av) } : { M: encode(value) };
const encode = value => Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, av(v)]));
const value = attr => attr.S ?? (attr.N !== undefined ? Number(attr.N) : attr.BOOL ?? (attr.NULL ? null
  : attr.L ? attr.L.map(value) : decode(attr.M)));
const decode = item => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, value(v)]));

// Deliberately small fake for the emitted condition grammar, not a DynamoDB emulator.
// Unsupported grammar fails the test; transactions validate every item before any write.
function condition(op, item = {}) {
  const tokens = op.ConditionExpression.match(/#[\w]+|:[\w]+|[\w]+|[()=><]/g);
  let index = 0;
  const field = name => op.ExpressionAttributeNames?.[name] ?? name;
  const consume = expected => assert.equal(tokens[index++], expected);
  function atom() {
    const token = tokens[index++];
    if (token === '(') { const result = or(); consume(')'); return result; }
    if (['attribute_exists', 'attribute_not_exists'].includes(token)) {
      consume('('); const exists = Object.hasOwn(item, field(tokens[index++])); consume(')');
      return token === 'attribute_exists' ? exists : !exists;
    }
    const left = item[field(token)], operator = tokens[index++];
    const right = value(op.ExpressionAttributeValues[tokens[index++]]);
    assert.ok(['=', '>'].includes(operator));
    return operator === '=' ? left === right : left > right;
  }
  function and() { let result = atom(); while (tokens[index] === 'AND') { index++; const next = atom(); result = result && next; } return result; }
  function or() { let result = and(); while (tokens[index] === 'OR') { index++; const next = and(); result = result || next; } return result; }
  const result = or(); assert.equal(index, tokens.length); return result;
}
function fixture({ bound = true, account = true, onTransaction } = {}) {
  const items = new Map(), calls = [], transactions = [];
  const key = (table, id) => `${table}:${id}`;
  const seed = (item, table = config.participantsTableName) => items.set(key(table, item.pk ?? item.registrationId), structuredClone(item));
  const read = (id, table = config.participantsTableName) => structuredClone(items.get(key(table, id)));
  const remove = (id, table = config.participantsTableName) => items.delete(key(table, id));
  if (bound) { seed(map()); seed({ pk: emailKey, participantId: 'participant-123', approvalKey: map().pk }); }
  if (account) seed(row());
  seed(source(), config.registrationsTableName);
  const store = createStore(config, { send: async (command, input) => {
    calls.push([command, structuredClone(input)]);
    if (command === 'GetItemCommand') {
      assert.equal(input.ConsistentRead, true);
      const found = read(value(Object.values(input.Key)[0]), input.TableName);
      return found ? { Item: encode(found) } : {};
    }
    assert.equal(command, 'TransactWriteItemsCommand');
    transactions.push(structuredClone(input));
    await onTransaction?.(input, { seed, read, remove });
    const targets = input.TransactItems.map(operation => {
      const [kind, op] = Object.entries(operation)[0];
      const item = kind === 'Put' ? decode(op.Item) : undefined;
      const id = item?.pk ?? value(Object.values(op.Key)[0]);
      return { kind, op, item, id, before: read(id, op.TableName) };
    });
    assert.equal(new Set(targets.map(t => key(t.op.TableName, t.id))).size, targets.length);
    if (targets.some(t => !condition(t.op, t.before))) {
      const error = new Error('Conditional transaction rejected'); error.name = 'TransactionCanceledException'; throw error;
    }
    for (const { kind, op, item, before, id } of targets) {
      if (kind === 'Put') seed(item, op.TableName);
      if (kind === 'Update') {
        const updated = { ...before };
        for (const assignment of op.UpdateExpression.slice(4).split(', ')) {
          const [name, rhs] = assignment.split(' = ');
          updated[op.ExpressionAttributeNames?.[name] ?? name] = value(op.ExpressionAttributeValues[rhs]);
        }
        assert.equal(updated.pk, id); seed(updated, op.TableName);
      }
    }
    return {};
  } });
  return { store, items, calls, transactions, seed, read, remove };
}
function worker(f, contact = crm(), identity = {}) {
  const effects = [];
  const instance = createWorker({ store: f.store, cutover, now: () => now,
    hubspot: { getContact: async () => contact, projectStatus: async () => effects.push('project') },
    identity: { ensure: async () => { effects.push('create'); return sub; },
      setAccess: async (_, enabled) => effects.push(enabled ? 'enable' : 'disable'), ...identity },
  });
  return { instance, effects };
}
const checks = transaction => transaction.TransactItems.flatMap(item => item.ConditionCheck ? [item.ConditionCheck] : []);
function sourceCheck(transaction) {
  const check = checks(transaction).find(item => item.TableName === config.registrationsTableName);
  assert.ok(check, 'Source-retention condition must be in the same transaction');
  assert.deepEqual(check.Key, { registrationId: { S: 'application-123' } });
  for (const required of ['attribute_exists(registrationId)', 'expiresAt > :now',
    'attribute_not_exists(deletedAt)', 'attribute_not_exists(erasedAt)']) assert.ok(check.ConditionExpression.includes(required));
  assert.deepEqual(check.ExpressionAttributeValues[':now'], { N: String(Math.floor(now / 1000)) });
}
function suppressionChecks(transaction) {
  const guards = checks(transaction);
  for (const pk of [emailSuppression, sourceSuppression]) {
    const guard = guards.find(item => item.Key.pk?.S === pk);
    assert.ok(guard, `Missing suppression guard ${pk.split('#')[2]}`);
    assert.equal(guard.ConditionExpression, 'attribute_not_exists(pk)');
  }
}

test('reservation atomically claims a new contact and email without adopting an existing email owner', async () => {
  const f = fixture({ bound: false, account: false });
  const reserved = await f.store.reserve(profile, now);
  assert.match(reserved.participantId, /^[a-f0-9-]{36}$/);
  assert.equal(f.transactions.length, 1);
  assert.equal(f.read(map().pk).participantId, f.read(emailKey).participantId);
  for (const put of f.transactions[0].TransactItems.filter(item => item.Put)) {
    assert.equal(put.Put.ConditionExpression, 'attribute_not_exists(pk)');
  }
  const duplicate = fixture({ bound: false, account: false });
  duplicate.seed({ pk: emailKey, participantId: 'different-owner' });
  await assert.rejects(duplicate.store.reserve(profile, now), /already belongs/);
  assert.equal(duplicate.transactions.length, 0);
});

test('reservation of a synced application binds its exact contact and source retention transactionally', async () => {
  const f = fixture({ bound: false, account: false });
  f.seed({ pk: `SYNC#EMAIL#${emailHash(profile.email)}`, state: 'synced', contactId: '123',
    registrationId: 'application-123', participantId: 'source-participant' });
  const reserved = await f.store.reserve(profile, now);
  assert.equal(reserved.participantId, 'source-participant');
  assert.equal(reserved.registrationId, 'application-123');
  sourceCheck(f.transactions[0]); suppressionChecks(f.transactions[0]);
});

test('missing, erased, deleted or expired intake and wrong-contact sync claims cannot reserve', async () => {
  for (const patch of [null, { erasedAt: now }, { deletedAt: now }, { expiresAt: Math.floor(now / 1000) }]) {
    const f = fixture({ bound: false, account: false });
    f.seed({ pk: `SYNC#EMAIL#${emailHash(profile.email)}`, state: 'synced', contactId: '123', registrationId: 'application-123' });
    if (patch === null) f.remove('application-123', config.registrationsTableName);
    else f.seed(source(patch), config.registrationsTableName);
    await assert.rejects(f.store.reserve(profile, now), /unavailable/);
    assert.equal(f.transactions.length, 0);
  }
  const f = fixture({ bound: false, account: false });
  f.seed({ pk: `SYNC#EMAIL#${emailHash(profile.email)}`, state: 'synced', contactId: '999' });
  await assert.rejects(f.store.reserve(profile, now), /requires review/);
});

test('a concurrent same-email claim aborts the entire reservation instead of adopting its owner', async () => {
  const f = fixture({ bound: false, account: false, onTransaction: (_, db) => {
    db.seed({ pk: emailKey, participantId: 'concurrent-owner' });
  } });
  await assert.rejects(f.store.reserve(profile, now), /Conditional/);
  assert.equal(f.read(map().pk), undefined);
  assert.equal(f.read(emailKey).participantId, 'concurrent-owner');
});

test('attaching a subject creates only an inactive account with exact binding, CAS and source guards', async () => {
  const f = fixture({ account: false });
  f.seed(map({ cognitoSub: undefined }));
  const attached = await f.store.attach(map({ cognitoSub: undefined }), sub, now);
  const account = f.read(`USER#${sub}`);
  assert.equal(attached.revision, 4);
  assert.equal(account.active, false); assert.equal(account.reviewStatus, 'received');
  assert.equal(account.enrolmentStatus, 'not_invited'); assert.equal(account.accessVersion, 1);
  assert.equal(account.participantId, attached.participantId); assert.equal(account.cognitoSub, sub);
  assert.equal(account.approvedAt, undefined); assert.equal(account.approvalId, undefined);
  sourceCheck(f.transactions[0]); suppressionChecks(f.transactions[0]);
  const mapping = f.transactions[0].TransactItems.find(item => item.Put?.Item.pk.S === map().pk).Put;
  assert.deepEqual(mapping.ExpressionAttributeNames, { '#r': 'revision' });
  assert.deepEqual(mapping.ExpressionAttributeValues, { ':r': { N: '3' } });
});

test('intake deletion between provisioning and attach cannot create a participant account', async () => {
  const f = fixture({ account: false, onTransaction: (_, db) => db.remove('application-123', config.registrationsTableName) });
  f.seed(map({ cognitoSub: undefined }));
  await assert.rejects(f.store.attach(map({ cognitoSub: undefined }), sub, now), /Conditional/);
  assert.equal(f.read(`USER#${sub}`), undefined);
  assert.equal(f.read(map().pk).cognitoSub, undefined);
});

test('pending-source and suppression denials occur before any Cognito creation', async () => {
  for (const invalidate of [db => db.remove('application-123', config.registrationsTableName),
    db => db.seed(source({ expiresAt: Math.floor(now / 1000) }), config.registrationsTableName),
    db => db.seed({ pk: emailSuppression }), db => db.seed({ pk: sourceSuppression })]) {
    const f = fixture({ account: false, onTransaction: (_, db) => invalidate(db) });
    f.seed(map({ cognitoSub: undefined }));
    const w = worker(f);
    await assert.rejects(w.instance.processContact('123'), /Conditional/);
    assert.deepEqual(w.effects, []);
    assert.ok(f.transactions[0].TransactItems.every(item => item.ConditionCheck));
    sourceCheck(f.transactions[0]); suppressionChecks(f.transactions[0]);
  }
});

test('first approval atomically writes account, mapping watermark and immutable audit with safety guards', async () => {
  const f = fixture();
  const result = await f.store.apply(map(), row(), decision(), now);
  assert.equal(result.account.active, true); assert.equal(result.account.accessVersion, 2);
  assert.equal(f.transactions.length, 1); sourceCheck(f.transactions[0]); suppressionChecks(f.transactions[0]);
  const operations = f.transactions[0].TransactItems;
  assert.equal(operations.filter(item => item.Update).length, 1);
  assert.equal(operations.filter(item => item.Put).length, 2);
  assert.equal(f.read(map().pk).decisionId, decision().id);
  const audit = f.read(`CRM#AUDIT#123#${decision().id}`);
  assert.equal(audit.active, true); assert.equal(audit.accessVersion, 2); assert.equal(audit.actor, '42');
  assert.equal(audit.email, undefined); assert.equal(audit.profile, undefined);
  const update = operations.find(item => item.Update).Update;
  for (const term of ['attribute_not_exists(erasedAt)', 'attribute_not_exists(deletedAt)', 'expiresAt > :now']) {
    assert.ok(update.ConditionExpression.includes(term));
  }
});

test('retention or suppression races at first approval abort all writes and all provider effects', async () => {
  for (const invalidate of [db => db.remove('application-123', config.registrationsTableName),
    db => db.seed(source({ erasedAt: now }), config.registrationsTableName),
    db => db.seed({ pk: emailSuppression }), db => db.seed({ pk: sourceSuppression })]) {
    const f = fixture({ onTransaction: (_, db) => invalidate(db) });
    const w = worker(f);
    await assert.rejects(w.instance.processContact('123'), /Conditional/);
    assert.deepEqual(w.effects, []);
    assert.equal(f.read(`USER#${sub}`).active, false);
    assert.equal(f.read(map().pk).decisionId, undefined);
    assert.equal([...f.items.keys()].some(key => key.includes('CRM#AUDIT#')), false);
  }
});

test('a previously approved retained participant can receive a fresh review after intake expiry', async () => {
  const f = fixture();
  const before = row({ approvedAt: cutover - 1, approvalId: APPROVAL.id, suspended: true, suspensionSource: 'hubspot-review' });
  f.seed(before); f.remove('application-123', config.registrationsTableName);
  const result = await f.store.apply(map(), before, decision(), now);
  assert.equal(result.account.active, true);
  assert.equal(checks(f.transactions[0]).some(check => check.TableName === config.registrationsTableName), false);
  suppressionChecks(f.transactions[0]);
});

test('version, enrolment and identity races cancel the complete approval transaction', async () => {
  for (const patch of [{ accessVersion: 2 }, { enrolmentStatus: 'invited' }, { participantId: 'other' },
    { cognitoSub: 'other-sub' }, { email: 'other@example.test' }, { active: true }, { suspended: true }]) {
    const f = fixture({ onTransaction: (_, db) => db.seed(row(patch)) });
    await assert.rejects(f.store.apply(map(), row(), decision(), now), /Conditional/);
    assert.equal(f.read(map().pk).revision, 3);
    assert.equal([...f.items.keys()].some(key => key.includes('CRM#AUDIT#')), false);
  }
});

test('current USER records must match the exact participant, subject, email, portal and contact binding', async () => {
  for (const patch of [{ participantId: 'other' }, { cognitoSub: 'other' }, { email: 'other@example.test' },
    { hubspotPortalId: 1 }, { hubspotContactId: '999' }]) {
    const f = fixture(); f.seed(row(patch));
    await assert.rejects(f.store.account(map()), /binding requires review/);
  }
  const f = fixture(); f.remove(`USER#${sub}`);
  await assert.rejects(f.store.account(map()), /binding requires review/);
});

test('only a completed immutable import binding can be adopted, never an email match alone', async () => {
  const f = fixture({ bound: false });
  f.seed({ pk: emailKey, participantId: 'participant-123' });
  assert.equal(await f.store.binding('123'), null);
  const imported = { pk: `IMPORT#${APPROVAL.id}#123`, participantId: 'participant-123', email: profile.email, cognitoSub: sub };
  f.seed({ ...imported, phase: 'creating' });
  assert.equal(await f.store.binding('123'), null);
  f.seed({ ...imported, phase: 'complete' });
  const binding = await f.store.binding('123');
  assert.equal(binding.imported, true); assert.equal(binding.cognitoSub, sub);
  assert.equal(f.transactions.length, 1);
});

test('denial is durable before Cognito disable; failed provider effects retry without a second decision write', async () => {
  const f = fixture();
  f.seed(row({ active: true, reviewStatus: 'approved', approvedAt: cutover - 1 }));
  let attempts = 0;
  const w = worker(f, crm('withdrawn'), { setAccess: async (_, enabled) => {
    assert.equal(enabled, false); assert.equal(f.read(`USER#${sub}`).active, false);
    assert.equal(f.read(`USER#${sub}`).accessVersion, 2);
    if (++attempts === 1) throw new Error('Synthetic provider outage');
  } });
  await assert.rejects(w.instance.processContact('123'), /Synthetic provider outage/);
  const auditCount = [...f.items.keys()].filter(key => key.includes('CRM#AUDIT#')).length;
  assert.equal(auditCount, 1);
  await w.instance.processContact('123');
  assert.equal(f.read(`USER#${sub}`).accessVersion, 2);
  assert.equal([...f.items.keys()].filter(key => key.includes('CRM#AUDIT#')).length, 1);
  assert.equal(f.read(map().pk).providerAccessVersion, 2);
});

test('deletion hold cannot resurrect original imported approval on restore or stale replay', async () => {
  const f = fixture();
  const original = row({ active: true, reviewStatus: 'approved', approvedAt: cutover - 1, approvalId: APPROVAL.id });
  f.seed(original);
  const held = await f.store.hold(map(), original, 'contact-unavailable', now);
  assert.equal(held.account.active, false); assert.equal(held.binding.holdAt, now);
  assert.equal(reviewDecision(crm('approved', cutover - 1), { cutover, now }), null);
  const w = worker(f, crm('approved', cutover - 1));
  await w.instance.processContact('123');
  assert.equal(w.effects.includes('enable'), false);
  const writes = f.transactions.length;
  const stale = await f.store.apply(held.binding, held.account, decision({ at: now }), now);
  assert.equal(stale.account.active, false); assert.equal(f.transactions.length, writes);
  const fresh = await f.store.apply(held.binding, held.account, decision({ at: now + 1000 }), now + 1000);
  assert.equal(fresh.account.active, true); assert.equal(fresh.binding.holdReason, null);
});

test('duplicate and out-of-order decisions neither increment access version nor add audit records', async () => {
  const f = fixture();
  const first = await f.store.apply(map(), row(), decision(), now);
  const count = f.transactions.length;
  for (const replay of [decision(), decision({ id: digest('older'), at: now - 2000 })]) {
    const result = await f.store.apply(first.binding, first.account, replay, now);
    assert.equal(result.account.accessVersion, 2); assert.equal(f.transactions.length, count);
  }
});

test('effect acknowledgments require both the mapping revision and current account version', async () => {
  for (const mutate of [db => db.seed(map({ revision: 4 })), db => db.seed(row({ accessVersion: 2 }))]) {
    const f = fixture({ onTransaction: (_, db) => mutate(db) });
    await assert.rejects(f.store.markEffects(map(), row()), /Conditional/);
    assert.equal(f.read(map().pk).providerAccessVersion, undefined);
  }
});
