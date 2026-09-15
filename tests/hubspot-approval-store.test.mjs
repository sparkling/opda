import assert from 'node:assert/strict';
import test from 'node:test';
import { createStore } from '../config/aws/hubspot-approval/store.mjs';
import { APPROVAL } from '../config/aws/hubspot-participation/import.mjs';
import { emailHash } from '../config/aws/hubspot-approval/domain.mjs';

const now = Date.parse('2026-09-09T10:00:00Z');
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

test('effect acknowledgments require both the mapping revision and current account version', async () => {
  for (const mutate of [db => db.seed(map({ revision: 4 })), db => db.seed(row({ accessVersion: 2 }))]) {
    const f = fixture({ onTransaction: (_, db) => mutate(db) });
    await assert.rejects(f.store.markEffects(map(), row()), /Conditional/);
    assert.equal(f.read(map().pk).providerAccessVersion, undefined);
  }
});
