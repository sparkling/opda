import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceFlow } from '../src/approval-onboarding/workspace-flow.mjs';
import { WORKSPACES } from '../src/approval-onboarding/settings.mjs';
import { MICROSOFT_INVITATION_RETURN_URL } from '../src/approval-onboarding/invitation.mjs';

const GROUP = 'conveyancing', TOKEN = 'a'.repeat(43);
const REDEMPTION = 'https://login.microsoftonline.com/redeem?ticket=synthetic';
function fixture({ pending = false, legacy = false, imported = false, fast = false } = {}) {
  let current = true, leased = false, identityPending = pending;
  const calls = [];
  const participant = { participantId: 'p-1', cognitoSub: 's-1', email: 'example@example.test', name: 'Example',
    active: true, accessVersion: 1, approvedDomains: [GROUP],
    domainApprovals: { [GROUP]: { status: 'approved', version: 2, decisionId: 'd'.repeat(64) } } };
  const bound = { state: 'bound', userId: 'u-1', ...(pending ? {
    redemptionUrl: REDEMPTION,
    ...(legacy ? {} : { inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL }),
  } : {}) };
  const context = { receipts: { graph: imported ? {} : { schemaVersion: 1, identity: bound, memberships: {} },
    sharepoint: { untouched: true }, mail: { untouched: true } } };
  const store = {
    async load() {
      if (!fast) return { status: 'repair' };
      const loaded = structuredClone(context);
      loaded.readOnly = true;
      return { status: 'ready', context: loaded };
    },
    async claim() { calls.push('claim'); if (leased) return null; leased = true; return context; },
    async guard() { calls.push('guard'); return current && (leased || fast); },
    async saveGraph(ctx, receipt) { assert.equal(ctx, context); calls.push('persist'); ctx.receipts.graph = structuredClone(receipt); return true; },
    async release() { calls.push('release'); leased = false; },
  };
  const graph = {
    async readAccess(args) {
      calls.push('read'); assert.equal(args.email, participant.email); assert.equal(await args.guard(), true);
      return { status: 'ready', redemptionRequired: identityPending, userId: 'u-1',
        receipt: { schemaVersion: 1, identity: args.receipt?.identity ?? bound, memberships: {} } };
    },
    async resolveIdentity(args) {
      calls.push('invite'); assert.equal(args.existingOnly, true); assert.equal(await args.guard(), true);
      const receipt = { schemaVersion: 1, identity: { ...bound, inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL }, memberships: {} };
      await args.persistReceipt(receipt);
      return { status: 'ready', redemptionRequired: true, redemptionUrl: REDEMPTION, receipt };
    },
  };
  const flow = createWorkspaceFlow({ store, graph, workspaces: WORKSPACES,
    authorize: async token => { assert.equal(token, TOKEN); calls.push('authorize'); return current ? { participant } : null; } });
  const open = (patch = {}) => flow({ schemaVersion: 1, sessionToken: TOKEN, groupId: GROUP, phase: 'open', ...patch });
  return { open, calls, context, participant, store, graph, revoke: () => { current = false; }, accept: () => { identityPending = false; } };
}

test('accepted participant opens the exact registered Team without an invitation or email', async () => {
  const f = fixture();
  assert.deepEqual(await f.open(), { status: 'ready', location: WORKSPACES[GROUP].teamUrl });
  assert.equal(f.calls.includes('invite'), false);
  assert.equal(f.calls.at(-1), 'release');
});
test('pending participant reuses a current invitation and verifies access again before redirect', async () => {
  const f = fixture({ pending: true });
  assert.deepEqual(await f.open(), { status: 'redeem', location: REDEMPTION });
  assert.equal(f.calls.includes('invite'), false);
  assert.ok(f.calls.filter(c => c === 'read').length >= 1);
});
test('legacy pending invitation is silently refreshed under the shared lease, once', async () => {
  const f = fixture({ pending: true, legacy: true });
  assert.equal((await f.open()).status, 'redeem');
  assert.equal(f.calls.filter(c => c === 'invite').length, 1);
  assert.equal(f.context.receipts.graph.identity.inviteRedirectUrl, MICROSOFT_INVITATION_RETURN_URL);
  assert.deepEqual(f.context.receipts.mail, { untouched: true });
  assert.deepEqual(f.context.receipts.sharepoint, { untouched: true });
});
test('imported accepted participant gets a durable identity binding without grants or mail', async () => {
  const f = fixture({ imported: true });
  assert.equal((await f.open()).status, 'ready');
  assert.equal(f.context.receipts.graph.identity.userId, 'u-1');
  assert.equal(f.calls.includes('invite'), false);
});
test('return does not treat a callback as consent or automatically reinvite', async () => {
  const f = fixture({ pending: true, legacy: true });
  assert.deepEqual(await f.open({ phase: 'return' }), { status: 'pending' });
  assert.equal(f.calls.includes('invite'), false);
  f.accept();
  assert.equal((await f.open({ phase: 'return' })).status, 'ready');
});
test('withdrawn group is denied even while website session has another approved group', async () => {
  const f = fixture(); f.participant.domainApprovals[GROUP].status = 'withdrawn';
  f.participant.approvedDomains.push('finance-and-banking');
  assert.deepEqual(await f.open(), { status: 'denied' });
  assert.equal(f.calls.includes('claim'), false);
});
test('revocation during Microsoft check prevents the hand-off', async () => {
  const f = fixture(); const original = f.graph.readAccess;
  f.graph.readAccess = async args => { const result = await original(args); f.revoke(); return result; };
  assert.deepEqual(await f.open(), { status: 'denied' });
  assert.equal(f.calls.at(-1), 'release');
});
test('a competing tab or worker yields a retry, never writes around its lease', async () => {
  const f = fixture({ pending: true }); f.store.claim = async () => null;
  assert.deepEqual(await f.open(), { status: 'pending' });
  assert.equal(f.calls.includes('read'), false);
});
test('missing group membership and uncertain invitation outcomes never hand off', async () => {
  for (const status of ['pending', 'manual-review']) {
    const f = fixture(); f.graph.readAccess = async () => ({ status });
    assert.deepEqual(await f.open(), { status: status === 'manual-review' ? 'review' : 'pending' });
    assert.equal(f.calls.includes('invite'), false);
  }
});
test('malformed input fails closed before providers or receipt writes', async () => {
  for (const patch of [{ groupId: 'unknown' }, { phase: 'claim' }, { schemaVersion: 2 }, { email: 'victim@example.test' },
    { sessionToken: '' }, { groupId: '__proto__' }]) {
    const f = fixture(); assert.deepEqual(await f.open(patch), { status: 'denied' });
    assert.deepEqual(f.calls, []);
  }
});
test('exceptions release the lease and never expose provider content', async () => {
  const f = fixture(); f.graph.readAccess = async () => { throw Error('secret'); };
  assert.deepEqual(await f.open(), { status: 'unavailable' });
  assert.equal(f.calls.at(-1), 'release');
});
test('two concurrent accepted fast-path entries do not contend or persist', async () => {
  const f = fixture({ fast: true });
  const results = await Promise.all([f.open(), f.open()]);
  assert.deepEqual(results, [
    { status: 'ready', location: WORKSPACES[GROUP].teamUrl },
    { status: 'ready', location: WORKSPACES[GROUP].teamUrl },
  ]);
  assert.equal(f.calls.includes('claim'), false);
  assert.equal(f.calls.includes('persist'), false);
});
test('two concurrent cached pending entries reuse the fixed callback without persistence', async () => {
  const f = fixture({ pending: true, fast: true });
  const results = await Promise.all([f.open(), f.open()]);
  assert.deepEqual(results, [{ status: 'redeem', location: REDEMPTION }, { status: 'redeem', location: REDEMPTION }]);
  assert.equal(f.calls.includes('claim'), false);
  assert.equal(f.calls.includes('persist'), false);
  assert.equal(f.calls.includes('invite'), false);
});
test('legacy pending fast-path falls back to one guarded serialized repair', async () => {
  const f = fixture({ pending: true, legacy: true, fast: true });
  assert.deepEqual(await f.open(), { status: 'redeem', location: REDEMPTION });
  assert.equal(f.calls.filter(call => call === 'claim').length, 1);
  assert.equal(f.calls.filter(call => call === 'invite').length, 1);
  assert.ok(f.calls.includes('persist'));
});
