import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createWorkspaceStore } from '../src/approval-onboarding/workspace-store.mjs';
import { createReceiptProtection } from '../src/approval-onboarding/receipt-protection.mjs';

const GROUP = 'conveyancing', NOW = 1800000000000;
const digest = v => createHash('sha256').update(v).digest('hex');
const av = v => v === null ? { NULL: true } : typeof v === 'string' ? { S: v }
  : typeof v === 'boolean' ? { BOOL: v } : typeof v === 'number' ? { N: String(v) }
    : Array.isArray(v) ? { L: v.map(av) } : { M: encode(v) };
const encode = v => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, av(x)]));
const val = v => v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L ? v.L.map(val) : decode(v.M)));
const decode = v => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, val(x)]));

function fixture() {
  let time = NOW, race;
  const p = { pk: 'USER#sub-123', participantId: 'person-123', cognitoSub: 'sub-123', hubspotContactId: '123',
    hubspotPortalId: 144765514, email: 'synthetic@example.test', accessVersion: 1, active: true, suspended: false,
    reviewStatus: 'approved', enrolmentStatus: 'complete', approvedDomains: [GROUP],
    domainApprovals: { [GROUP]: { status: 'approved', version: 1, decisionId: 'a'.repeat(64) } } };
  const binding = { pk: 'CRM#CONTACT#123', participantId: p.participantId, cognitoSub: p.cognitoSub,
    contactId: '123', email: p.email, domainApprovals: structuredClone(p.domainApprovals), registrationId: 'registration-1' };
  const owner = { pk: `EMAIL#${digest(p.email)}`, participantId: p.participantId, approvalKey: binding.pk };
  const items = new Map([p, binding, owner].map(v => [v.pk, v])), calls = [];
  const stateKey = `CRM#ONBOARDING_STATE#${p.participantId}`;
  const encryption = createReceiptProtection(Buffer.alloc(32, 42).toString('base64'));
  const send = async (command, input) => {
    calls.push({ command, input: structuredClone(input) });
    assert.equal(input.TableName, 'opda-participants');
    if (command === 'GetItemCommand') {
      assert.equal(input.ConsistentRead, true);
      return items.has(input.Key.pk.S) ? { Item: encode(items.get(input.Key.pk.S)) } : {};
    }
    assert.equal(command, 'PutItemCommand');
    const row = decode(input.Item); assert.equal(row.pk, stateKey);
    await race?.(row);
    const old = items.get(row.pk), values = input.ExpressionAttributeValues && decode(input.ExpressionAttributeValues);
    const allowed = input.ConditionExpression === 'attribute_not_exists(pk)' ? !old
      : input.ConditionExpression === 'revision = :revision AND leaseId = :lease'
        && old?.revision === values[':revision'] && old?.leaseId === values[':lease'];
    if (!allowed) throw Object.assign(Error('Conflict'), { name: 'ConditionalCheckFailedException' });
    assert.equal(row.receipts.algorithm, 'A256GCM');
    assert.ok(!JSON.stringify(input).includes('redemptionUrl'));
    items.set(row.pk, row);
    return {};
  };
  const store = createWorkspaceStore({ tableName: 'opda-participants', now: () => time, send, ...encryption });
  const claim = () => store.claim({ participant: p, groupId: GROUP });
  return { p, binding, owner, items, stateKey, store, claim, calls, encryption,
    advance: n => { time += n; }, race: value => { race = value; } };
}

test('shares the worker state schema with encrypted data and preserves other receipts', async () => {
  const f = fixture(), context = await f.claim();
  assert.equal(await f.store.guard(context, f.p), true);
  context.receipts.sharepoint = { retained: 'source-evidence' }; context.receipts.mail = { decision: 'sent' };
  assert.equal(await f.store.saveGraph(context, { identity: { redemptionUrl: 'private-synthetic-url' } }), true);
  await f.store.release(context);
  const row = f.items.get(f.stateKey);
  assert.equal(row.leaseUntil, 0); assert.equal(row.leaseId, null);
  const decoded = f.encryption.unprotectReceipts(row.receipts, f.p.participantId);
  assert.deepEqual(decoded.sharepoint, { retained: 'source-evidence' });
  assert.deepEqual(decoded.mail, { decision: 'sent' });
  assert.equal((await f.claim()).receipts.graph.identity.redemptionUrl, 'private-synthetic-url');
});
test('released worker receipts with a null lease support read-only entry and later repair', async () => {
  const f = fixture(), initial = await f.claim();
  const identity = { state: 'bound', emailDigest: digest(f.p.email), userId: '01234567-0123-4123-8123-012345678901' };
  await f.store.saveGraph(initial, { schemaVersion: 1, identity, memberships: {} });
  const state = f.items.get(f.stateKey);
  f.items.set(f.stateKey, { ...state, revision: state.revision + 1, leaseId: null, leaseUntil: 0 });
  const writes = f.calls.filter(c => c.command === 'PutItemCommand').length;
  const loaded = await f.store.load({ participant: f.p, groupId: GROUP });
  assert.equal(loaded.status, 'ready');
  assert.equal(await f.store.guard(loaded.context, f.p), true);
  await f.store.release(loaded.context);
  assert.equal(f.calls.filter(c => c.command === 'PutItemCommand').length, writes);
  const repair = await f.claim(); assert.ok(repair);
  assert.equal(await f.store.guard(repair, f.p), true);
  await f.store.release(repair);
  assert.equal(f.items.get(f.stateKey).leaseId, null);
});
test('imported email ownership remains usable without replacing its historical import key', async () => {
  const f = fixture(); delete f.owner.approvalKey;
  f.owner.importKey = 'IMPORT#hubspot-existing-contacts-2026-09-08#123';
  const before = structuredClone(f.owner), context = await f.claim();
  assert.ok(context); assert.equal(await f.store.guard(context, f.p), true);
  assert.deepEqual(f.owner, before);
  f.owner.approvalKey = 'CRM#CONTACT#999';
  assert.equal(await f.store.guard(context, f.p), false);
  assert.equal((await f.store.load({ participant: f.p, groupId: GROUP })).status, 'denied');
});
test('a live worker or other tab lease is never stolen', async () => {
  const f = fixture(); await f.claim();
  const writes = f.calls.filter(c => c.command === 'PutItemCommand').length;
  assert.equal(await f.claim(), null);
  assert.equal(f.calls.filter(c => c.command === 'PutItemCommand').length, writes);
});
test('expired lease can be claimed but the former caller cannot overwrite it', async () => {
  const f = fixture(), old = await f.claim();
  f.advance(20001); const next = await f.claim();
  assert.ok(next); assert.equal(await f.store.guard(old, f.p), false);
  assert.equal(await f.store.saveGraph(old, { attempt: 'stale' }), false);
  await f.store.release(old);
  assert.equal(await f.store.guard(next, f.p), true);
});
test('concurrent initial claim is compare-and-swap, not last-writer-wins', async () => {
  const f = fixture();
  f.race(row => { f.items.set(f.stateKey, { ...row, leaseId: 'other-worker' }); });
  assert.equal(await f.claim(), null);
  assert.equal(f.items.get(f.stateKey).leaseId, 'other-worker');
});
test('receipt acknowledgement survives withdrawal, but guard denies handoff', async () => {
  const f = fixture(), context = await f.claim();
  f.p.domainApprovals[GROUP].status = 'withdrawn';
  assert.equal(await f.store.guard(context, f.p), false);
  assert.equal(await f.store.saveGraph(context, { acknowledgement: 'not-a-grant' }), true);
  assert.equal(await f.store.guard(context, f.p), false);
});
test('suppression, identity mismatch and stale domain binding fail before a receipt write', async () => {
  for (const change of [f => { f.owner.participantId = 'other'; }, f => { f.binding.email = 'different@example.test'; },
    f => { f.binding.domainApprovals[GROUP].version = 99; }, f => { f.p.active = false; },
    f => f.items.set(`SYNC#SUPPRESS#EMAIL#${digest(f.p.email)}`, { pk: 'suppression' }),
    f => f.items.set('SYNC#SUPPRESS#REGISTRATION#registration-1', { pk: 'suppression' })]) {
    const f = fixture(); change(f); assert.equal(await f.claim(), null);
    assert.equal(f.calls.some(c => c.command === 'PutItemCommand'), false);
  }
});
test('historical Microsoft ID is a lookup pin, not a grant or an accepted-state assertion', async () => {
  const f = fixture(); f.binding.financeRosterImport = { participantId: f.p.participantId, cognitoSub: f.p.cognitoSub,
    email: f.p.email, contactId: f.p.hubspotContactId, microsoft: { userId: '01234567-0123-4123-8123-012345678901', state: 'Accepted' } };
  const context = await f.claim();
  assert.equal(context.receipts.graph.identity.userId, f.binding.financeRosterImport.microsoft.userId);
  assert.equal(context.receipts.graph.identity.externalUserState, undefined);
  assert.deepEqual(context.receipts.graph.memberships, {});
});
test('cross-participant or corrupted encrypted receipts are never adopted', async () => {
  for (const change of [row => { row.participantId = 'other'; }, row => { row.receipts.tag = 'bad'; }]) {
    const f = fixture(), ctx = await f.claim(); await f.store.release(ctx);
    change(f.items.get(f.stateKey));
    await assert.rejects(f.claim);
  }
});
test('load distinguishes an eligible participant with no identity from a read-only imported identity', async () => {
  const empty = fixture();
  assert.deepEqual(await empty.store.load({ participant: empty.p, groupId: GROUP }), { status: 'noidentity' });
  const imported = fixture(); imported.binding.financeRosterImport = { participantId: imported.p.participantId,
    cognitoSub: imported.p.cognitoSub, email: imported.p.email, contactId: imported.p.hubspotContactId,
    microsoft: { userId: '01234567-0123-4123-8123-012345678901' } };
  const result = await imported.store.load({ participant: imported.p, groupId: GROUP });
  assert.equal(result.status, 'ready');
  assert.equal(result.context.readOnly, true);
  assert.equal(result.context.receipts.graph.identity.userId, imported.binding.financeRosterImport.microsoft.userId);
  assert.equal(imported.calls.some(call => call.command === 'PutItemCommand'), false);
});
test('known read-only identity remains usable while a competing lease is live', async () => {
  const f = fixture(); f.binding.financeRosterImport = { participantId: f.p.participantId,
    cognitoSub: f.p.cognitoSub, email: f.p.email, contactId: f.p.hubspotContactId,
    microsoft: { userId: '01234567-0123-4123-8123-012345678901' } };
  const leased = await f.claim(); assert.ok(leased);
  const writes = f.calls.filter(call => call.command === 'PutItemCommand').length;
  const loaded = await f.store.load({ participant: f.p, groupId: GROUP });
  assert.equal(loaded.status, 'ready');
  assert.equal(await f.store.guard(loaded.context, f.p), true);
  assert.equal(f.calls.filter(call => call.command === 'PutItemCommand').length, writes);
});
test('a lease for another approved group does not block the read-only selected group', async () => {
  const f = fixture(), other = 'finance-and-banking';
  f.p.approvedDomains = [GROUP, other];
  f.p.domainApprovals[other] = { status: 'approved', version: 1, decisionId: 'b'.repeat(64) };
  f.binding.domainApprovals[other] = structuredClone(f.p.domainApprovals[other]);
  f.binding.financeRosterImport = { participantId: f.p.participantId, cognitoSub: f.p.cognitoSub,
    email: f.p.email, contactId: f.p.hubspotContactId,
    microsoft: { userId: '01234567-0123-4123-8123-012345678901' } };
  assert.ok(await f.store.claim({ participant: f.p, groupId: other }));
  const loaded = await f.store.load({ participant: f.p, groupId: GROUP });
  assert.equal(loaded.status, 'ready');
  assert.equal(await f.store.guard(loaded.context, f.p), true);
});
