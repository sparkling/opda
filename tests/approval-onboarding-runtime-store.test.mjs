import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import test from 'node:test';
import { createOnboardingStore } from '../src/approval-onboarding/store.mjs';

const digest = value => createHash('sha256').update(value).digest('hex');
const instant = Date.parse('2026-09-09T12:00:00Z');
const empty = () => ({ graph: {}, sharepoint: {}, mail: {} });
const av = v => v === null ? { NULL: true } : typeof v === 'string' ? { S: v }
  : typeof v === 'number' ? { N: String(v) } : typeof v === 'boolean' ? { BOOL: v }
    : Array.isArray(v) ? { L: v.map(av) } : { M: encode(v) };
const encode = v => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, av(x)]));
const value = v => v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L ? v.L.map(value) : decode(v.M)));
const decode = v => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x)]));

function records(version = 2, action = 'provision') {
  const participantId = 'participant-123', contactId = '123', cognitoSub = 'sub-123';
  const decisionId = digest(`decision-${version}`), operationId = digest(JSON.stringify([1, participantId, decisionId, version]));
  const groups = action === 'provision' ? ['conveyancing'] : [];
  const onboarding = { operationId, action, snapshotStatus: action === 'provision' ? 'approved' : 'denied',
    groups, groupDigest: digest(JSON.stringify(groups)), groupsAt: groups.length ? instant - 2000 : null,
    reason: action === 'provision' ? 'reviewed-group-selection' : 'review-withdrawn', decisionId,
    decisionAt: instant - 1000, actor: '42', accessVersion: version, templateVersion: 1 };
  const operation = { pk: `CRM#ONBOARDING#${operationId}`, schemaVersion: 1, operationId, participantId,
    contactId, cognitoSub, accountKey: `USER#${cognitoSub}`, bindingKey: `CRM#CONTACT#${contactId}`,
    auditKey: `CRM#AUDIT#${contactId}#${decisionId}`, decisionId, accessVersion: version,
    action, status: 'pending', createdAt: instant };
  const account = { pk: operation.accountKey, cognitoSub, participantId, email: 'synthetic@example.test',
    hubspotContactId: contactId, hubspotPortalId: 144765514, accessVersion: version, onboarding,
    active: action === 'provision', suspended: action !== 'provision',
    reviewStatus: action === 'provision' ? 'approved' : 'withdrawn', enrolmentStatus: 'not_invited' };
  const binding = { pk: operation.bindingKey, cognitoSub, participantId, contactId,
    email: account.email, registrationId: 'registration-123', revision: version, onboarding };
  const audit = { pk: operation.auditKey, contactId, participantId, decisionId, actor: '42', at: instant,
    reviewStatus: account.reviewStatus, active: account.active, accessVersion: version,
    reason: onboarding.reason, onboarding };
  const email = { pk: `EMAIL#${digest(account.email)}`, participantId, approvalKey: binding.pk };
  return { operation, account, binding, audit, email, stateKey: `CRM#ONBOARDING_STATE#${participantId}` };
}

// Evaluate every emitted condition before any mock transaction write, including CAS races.
function condition(op, row = {}) {
  const tokens = op.ConditionExpression.match(/#[\w]+|:[\w]+|[\w]+|<=|>=|[()=><]/g);
  let index = 0;
  const field = key => op.ExpressionAttributeNames?.[key] ?? key;
  const consume = expected => assert.equal(tokens[index++], expected);
  function atom() {
    const token = tokens[index++];
    if (token === '(') { const result = or(); consume(')'); return result; }
    if (['attribute_exists', 'attribute_not_exists'].includes(token)) {
      consume('('); const exists = Object.hasOwn(row, field(tokens[index++])); consume(')');
      return token === 'attribute_exists' ? exists : !exists;
    }
    const left = row[field(token)], operator = tokens[index++], right = value(op.ExpressionAttributeValues[tokens[index++]]);
    if (operator === '=') return isDeepStrictEqual(left, right);
    if (operator === '>') return left > right;
    if (operator === '<=') return left <= right;
    assert.fail('Unsupported test condition');
  }
  function and() { let r = atom(); while (tokens[index] === 'AND') { index++; const next = atom(); r = r && next; } return r; }
  function or() { let r = and(); while (tokens[index] === 'OR') { index++; const next = and(); r = r || next; } return r; }
  const result = or(); assert.equal(index, tokens.length); return result;
}
function fixture(options = {}) {
  const base = records(), items = new Map(), writes = [], reads = [];
  let time = instant, beforeWrite;
  const seed = row => items.set(row.pk, structuredClone(row));
  const read = key => structuredClone(items.get(key));
  Object.values(base).filter(row => row?.pk).forEach(seed);
  const send = async (command, input) => {
    if (command === 'GetItemCommand') {
      assert.equal(input.ConsistentRead, true); reads.push(input.Key.pk.S);
      const row = read(input.Key.pk.S); return row ? { Item: encode(row) } : {};
    }
    assert.ok(['TransactWriteItemsCommand', 'UpdateItemCommand', 'PutItemCommand'].includes(command));
    writes.push(structuredClone(input));
    const operations = input.TransactItems ?? [{ [command === 'PutItemCommand' ? 'Put' : 'Update']: input }];
    const targets = operations.map(item => {
      const [kind, op] = Object.entries(item)[0], row = kind === 'Put' ? decode(op.Item) : null;
      return { kind, op, row, pk: row?.pk ?? op.Key.pk.S };
    });
    assert.equal(new Set(targets.map(t => t.pk)).size, targets.length);
    await beforeWrite?.();
    if (targets.some(t => !condition(t.op, read(t.pk)))) {
      const error = new Error('Synthetic conditional conflict');
      error.name = command === 'TransactWriteItemsCommand' ? 'TransactionCanceledException' : 'ConditionalCheckFailedException';
      error.CancellationReasons = [{ Code: 'ConditionalCheckFailed' }]; throw error;
    }
    for (const { kind, op, row, pk } of targets) {
      if (kind === 'Put') seed(row);
      if (kind === 'Update') {
        const updated = read(pk) ?? { pk };
        for (const assignment of op.UpdateExpression.slice(4).split(', ')) {
          const [key, rhs] = assignment.split(' = ');
          updated[op.ExpressionAttributeNames?.[key] ?? key] = value(op.ExpressionAttributeValues[rhs]);
        }
        seed(updated);
      }
    }
    return {};
  };
  const config = { tableName: 'participants', now: () => time, send, ...options };
  return { ...base, items, writes, reads, seed, read, store: createOnboardingStore(config),
    another: () => createOnboardingStore(config), advance: ms => { time += ms; },
    race: callback => { beforeWrite = callback; }, replace: (version, action) => {
      const next = records(version, action); Object.values(next).filter(row => row?.pk).forEach(seed); return next;
    } };
}

test('claim strongly resolves immutable references and holds one participant lease for 900 seconds', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId);
  assert.deepEqual(context.operation, f.operation); assert.deepEqual(context.account, f.account);
  assert.deepEqual(context.binding, f.binding); assert.deepEqual(context.audit, f.audit);
  assert.deepEqual(context.receipts, empty()); assert.equal(context.revision, 1);
  assert.equal(f.read(f.stateKey).leaseUntil, instant + 900000);
  assert.equal(await f.another().claim(f.operation.operationId), null);
  assert.equal(await f.store.guard(context, { requireEligible: true }), true);
  assert.ok([f.operation.pk, f.account.pk, f.binding.pk, f.audit.pk, f.email.pk].every(pk => f.reads.includes(pk)));
});

test('unknown, terminal and invalid operation references never create a lease', async () => {
  const f = fixture(); assert.equal(await f.store.claim('f'.repeat(64)), null);
  for (const id of ['USER#sub', null, 'A'.repeat(64)]) await assert.rejects(f.store.claim(id), /Invalid onboarding/);
  f.seed({ ...f.operation, status: 'complete' }); assert.equal(await f.store.claim(f.operation.operationId), null);
  assert.equal(f.writes.length, 0);
});

test('a conditional claim race does not replace another owner or mistake service failures for contention', async () => {
  const f = fixture(); f.race(() => f.seed({ pk: f.stateKey, revision: 1, leaseId: 'other', leaseUntil: instant + 900000 }));
  assert.equal(await f.store.claim(f.operation.operationId), null); assert.equal(f.read(f.stateKey).leaseId, 'other');
  const broken = createOnboardingStore({ tableName: 'participants', send: async () => { throw new Error('secret@example.test ticket=private'); } });
  await assert.rejects(broken.claim(f.operation.operationId), error => error.message === 'Onboarding storage unavailable');
});

test('immutable identity, operation digest and audit snapshot corruption fail closed', async () => {
  for (const mutate of [f => f.seed({ ...f.binding, participantId: 'another' }),
    f => f.seed({ ...f.account, cognitoSub: 'another' }), f => f.seed({ ...f.account, hubspotPortalId: 99 }),
    f => f.seed({ ...f.operation, accountKey: 'USER#another' }), f => f.seed({ ...f.operation, accessVersion: 3 }),
    f => f.seed({ ...f.audit, onboarding: { ...f.audit.onboarding, groups: ['technology'] } }),
    f => f.seed({ ...f.binding, onboarding: { ...f.binding.onboarding, actor: '99' } })]) {
    const f = fixture(); mutate(f);
    await assert.rejects(f.store.claim(f.operation.operationId), /Invalid onboarding/); assert.equal(f.writes.length, 0);
  }
});

test('audit timestamps match the approval writer bounded future-clock tolerance', async () => {
  for (const offset of [60000, 60001]) {
    const f = fixture(), onboarding = { ...f.audit.onboarding, decisionAt: instant + offset };
    for (const row of [f.account, f.binding, f.audit]) f.seed({ ...row, onboarding });
    if (offset === 60000) assert.ok(await f.store.claim(f.operation.operationId));
    else await assert.rejects(f.store.claim(f.operation.operationId), /Invalid onboarding/);
  }
});

test('participant-wide state never adopts another contact or Cognito identity', async () => {
  for (const patch of [{ participantId: 'another' }, { contactId: '999' }, { cognitoSub: 'another' }]) {
    const f = fixture(), context = await f.store.claim(f.operation.operationId); await f.store.release(context);
    f.seed({ ...f.read(f.stateKey), ...patch });
    await assert.rejects(f.another().claim(f.operation.operationId), /Invalid onboarding/);
  }
});

test('stale decision/version never grants and stale pending operations remain cancellable', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId);
  f.replace(3, 'revoke'); assert.equal(await f.store.guard(context, { requireEligible: true }), false);
  assert.equal(await f.store.guard(context, { requireEligible: false }), false);
  assert.equal(await f.store.finish(context, { status: 'cancelled', stage: 'stale-decision' }), true);
  assert.equal(f.read(f.operation.pk).status, 'cancelled'); await f.store.release(context);
  const g = fixture(); g.replace(3, 'revoke');
  const stale = await g.store.claim(g.operation.operationId); assert.ok(stale);
  assert.equal(await g.store.guard(stale, { requireEligible: true }), false);
});

test('eligibility and both suppression markers block grants, not owned withdrawal cleanup', async () => {
  for (const patch of [{ active: false }, { suspended: true }, { reviewStatus: 'withdrawn' },
    { erasedAt: instant }, { deletedAt: instant }, { expiresAt: instant / 1000 }, { enrolmentStatus: 'invited' }]) {
    const f = fixture(), context = await f.store.claim(f.operation.operationId); f.seed({ ...f.account, ...patch });
    assert.equal(await f.store.guard(context, { requireEligible: true }), false);
  }
  for (const key of [`SYNC#SUPPRESS#EMAIL#${digest('synthetic@example.test')}`, 'SYNC#SUPPRESS#REGISTRATION#registration-123']) {
    const f = fixture(), context = await f.store.claim(f.operation.operationId); f.seed({ pk: key });
    assert.equal(await f.store.guard(context, { requireEligible: true }), false);
    await f.store.release(context); const next = f.replace(3, 'revoke');
    const revoke = await f.store.claim(next.operation.operationId);
    assert.equal(await f.store.guard(revoke, { requireEligible: false }), true);
    assert.equal(await f.store.guard(revoke, { requireEligible: true }), false);
  }
});

test('EMAIL rebinding and current snapshot drift deny provision even with unchanged eligibility', async () => {
  for (const mutate of [f => f.seed({ ...f.email, participantId: 'another' }),
    f => f.seed({ ...f.email, approvalKey: 'CRM#CONTACT#999' }), f => f.items.delete(f.email.pk),
    f => f.seed({ ...f.binding, email: 'different@example.test' }),
    f => f.seed({ ...f.account, onboarding: { ...f.account.onboarding, decisionAt: instant } })]) {
    const f = fixture(), context = await f.store.claim(f.operation.operationId); mutate(f);
    assert.equal(await f.store.guard(context, { requireEligible: true }), false);
  }
});

test('acknowledged receipts survive withdrawal after the provider effect and are shared by the revoke', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId), next = f.replace(3, 'revoke');
  const receipts = { ...empty(), graph: { userId: 'guest-123', memberships: [{ groupId: 'group-123', owned: true }] } };
  assert.equal(await f.store.guard(context, { requireEligible: true }), false);
  assert.equal(await f.store.saveReceipts(context, receipts), true); assert.equal(context.revision, 2);
  assert.deepEqual(context.receipts, receipts); assert.deepEqual(f.read(f.stateKey).receipts, receipts);
  receipts.graph.userId = 'modified-after-write'; assert.equal(context.receipts.graph.userId, 'guest-123');
  await f.store.release(context); const revoke = await f.store.claim(next.operation.operationId);
  assert.equal(revoke.receipts.graph.userId, 'guest-123'); assert.equal(await f.store.guard(revoke, { requireEligible: false }), true);
});

test('expired/replaced lease cannot guard, save, finish or release another owner', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId); f.advance(900000);
  const other = f.another(), replacement = await other.claim(f.operation.operationId); assert.ok(replacement);
  assert.notEqual(context.leaseId, replacement.leaseId);
  assert.equal(await f.store.guard(context, { requireEligible: true }), false);
  assert.equal(await f.store.saveReceipts(context, empty()), false);
  assert.equal(await f.store.finish(context, { status: 'complete', stage: 'ready' }), false);
  assert.equal(await f.store.release(context), false); assert.equal(f.read(f.stateKey).leaseId, replacement.leaseId);
});

test('receipt revision CAS rejects a race without mutating the caller context', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId);
  f.race(() => f.seed({ ...f.read(f.stateKey), revision: 2 }));
  assert.equal(await f.store.saveReceipts(context, { ...empty(), graph: { owned: true } }), false);
  assert.equal(context.revision, 1); assert.deepEqual(context.receipts, empty());
});

test('eligible receipt claim atomically checks USER, map, operation, EMAIL and suppressions', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId);
  const next = { ...empty(), mail: { [f.operation.operationId]: { status: 'attempting', attemptedAt: instant } } };
  assert.equal(await f.store.saveReceipts(context, next, { requireEligible: true }), true);
  const transaction = f.writes.at(-1).TransactItems;
  const keys = transaction.map(item => (item.Update ?? item.ConditionCheck).Key.pk.S);
  for (const pk of [f.stateKey, f.operation.pk, f.account.pk, f.binding.pk, f.email.pk,
    `SYNC#SUPPRESS#EMAIL#${digest(f.account.email)}`, 'SYNC#SUPPRESS#REGISTRATION#registration-123']) assert.ok(keys.includes(pk));
  assert.equal(context.receipts.mail[f.operation.operationId].status, 'attempting');
});

test('mail-attempt transaction rejects withdrawal, enrolment, suppression and ownership races', async () => {
  for (const mutate of [f => f.replace(3, 'revoke'),
    f => f.seed({ ...f.account, active: false }), f => f.seed({ ...f.account, enrolmentStatus: 'expired' }),
    f => f.seed({ ...f.account, erasedAt: instant }), f => f.seed({ ...f.binding, revision: 3 }),
    f => f.seed({ ...f.operation, status: 'cancelled' }), f => f.seed({ ...f.operation, cognitoSub: 'another' }),
    f => f.seed({ ...f.email, participantId: 'another' }),
    f => f.seed({ pk: `SYNC#SUPPRESS#EMAIL#${digest(f.account.email)}` }),
    f => f.seed({ pk: 'SYNC#SUPPRESS#REGISTRATION#registration-123' })]) {
    const f = fixture(), context = await f.store.claim(f.operation.operationId); f.race(() => mutate(f));
    assert.equal(await f.store.saveReceipts(context, { ...empty(), mail: { status: 'attempting' } }, { requireEligible: true }), false);
    assert.equal(context.revision, 1); assert.deepEqual(context.receipts, empty());
    assert.deepEqual(f.read(f.stateKey).receipts, empty());
  }
});

test('concurrent saves capture their original revision before asynchronous receipt protection', async () => {
  let unblock, block = false;
  const f = fixture({ protectReceipts: async value => {
    if (block && value.graph.first) await new Promise(resolve => { unblock = resolve; });
    return value;
  } });
  const context = await f.store.claim(f.operation.operationId); block = true;
  const slow = f.store.saveReceipts(context, { ...empty(), graph: { first: true } });
  assert.equal(await f.store.saveReceipts(context, { ...empty(), graph: { second: true } }), true);
  unblock(); assert.equal(await slow, false);
  assert.deepEqual(context.receipts.graph, { second: true }); assert.equal(context.revision, 2);
});

test('erasure removes identity data without losing cleanup references or acknowledged receipts', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId);
  await f.store.saveReceipts(context, { ...empty(), graph: { userId: 'guest-123', owned: true } });
  await f.store.release(context); const next = f.replace(3, 'revoke');
  f.items.delete(f.account.pk); f.items.delete(f.binding.pk); f.items.delete(f.email.pk);
  f.seed({ pk: `SYNC#SUPPRESS#EMAIL#${digest(f.account.email)}` });
  const revoke = await f.store.claim(next.operation.operationId); assert.ok(revoke);
  assert.equal(revoke.account, null); assert.equal(await f.store.guard(revoke, { requireEligible: false }), true);
  assert.equal(await f.store.guard(revoke, { requireEligible: true }), false);
  assert.equal(await f.store.saveReceipts(revoke, { ...revoke.receipts, graph: { userId: 'guest-123', owned: false } }), true);
});

test('finish updates only the operation status/stage and pending remains eligible for relay', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId);
  assert.equal(await f.store.finish(context, { status: 'pending', stage: 'team-propagation', reason: 'not-yet-visible' }), true);
  assert.equal(f.read(f.operation.pk).status, 'pending'); assert.equal(f.read(f.operation.pk).stage, 'team-propagation');
  assert.deepEqual(f.read(f.account.pk), f.account); assert.deepEqual(f.read(f.binding.pk), f.binding);
  assert.deepEqual(f.read(f.audit.pk), f.audit); assert.deepEqual(f.read(f.stateKey).receipts, empty());
  assert.equal(await f.store.release(context), true); assert.ok(await f.another().claim(f.operation.operationId));
  await assert.rejects(f.store.finish(context, { status: 'sent', stage: 'ready' }), /Invalid onboarding/);
  await assert.rejects(f.store.finish(context, { status: 'attention', stage: 'secret@example.test' }), /Invalid onboarding/);
});

test('receipt protection is participant-bound and the durable ledger never receives plaintext private links', async () => {
  const calls = [], protector = async (value, participantId) => {
    calls.push(['protect', participantId]); return { encrypted: Buffer.from(JSON.stringify(value)).toString('base64') };
  };
  const unprotector = async (value, participantId) => {
    calls.push(['unprotect', participantId]); return JSON.parse(Buffer.from(value.encrypted, 'base64').toString());
  };
  const f = fixture({ protectReceipts: protector, unprotectReceipts: unprotector });
  const context = await f.store.claim(f.operation.operationId);
  const receipts = { ...empty(), graph: { redemptionUrl: 'https://login.microsoftonline.com/redeem?ticket=synthetic' } };
  await f.store.saveReceipts(context, receipts); const persisted = f.read(f.stateKey).receipts;
  assert.equal(JSON.stringify(persisted).includes('login.microsoftonline'), false);
  assert.deepEqual(context.receipts, receipts); await f.store.release(context);
  const again = await f.another().claim(f.operation.operationId); assert.deepEqual(again.receipts, receipts);
  assert.deepEqual(f.read(f.stateKey).receipts, persisted);
  assert.ok(calls.some(([method]) => method === 'unprotect'));
  assert.ok(calls.every(([, id]) => id === f.operation.participantId));
});

test('bounded receipt shape and encryption failures do not overwrite durable receipts or leak details', async () => {
  const f = fixture(), context = await f.store.claim(f.operation.operationId);
  for (const invalid of [null, [], { graph: {} }, { ...empty(), tokens: {} },
    { ...empty(), graph: { bad: 'x'.repeat(300000) } }, { ...empty(), graph: { invalid: NaN } }]) {
    await assert.rejects(f.store.saveReceipts(context, invalid), /Invalid onboarding/);
  }
  assert.equal(context.revision, 1); assert.deepEqual(f.read(f.stateKey).receipts, empty());
  const g = fixture({ protectReceipts: async () => { throw new Error('private-link secret'); }, unprotectReceipts: async value => value });
  await assert.rejects(g.store.claim(g.operation.operationId), error => !/private-link|secret/.test(error.message));
  assert.equal(g.read(g.stateKey), undefined);
});
