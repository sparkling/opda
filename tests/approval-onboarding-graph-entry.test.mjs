import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createGraphAdapter } from '../src/approval-onboarding/graph.mjs';
import { APPROVAL_GROUP_IDS, MICROSOFT_INVITATION_RETURN_URL, OPDA_TENANT_ID } from '../src/approval-onboarding/invitation.mjs';

const userId = '22222222-2222-4222-8222-222222222222';
const ownerId = '33333333-3333-4333-8333-333333333333';
const redemptionUserId = '44444444-4444-4444-8444-444444444444';
const email = 'synthetic@example.invalid';
const groupId = 'finance-and-banking';
const emailDigest = createHash('sha256').update(email).digest('hex');
const user = { id: userId, userType: 'Guest', accountEnabled: true, externalUserState: 'Accepted',
  mail: email, otherMails: [], userPrincipalName: 'synthetic_example.invalid#EXT#@example.onmicrosoft.com' };
const redemptionUrl = `https://login.microsoftonline.com/redeem?rd=${encodeURIComponent(`https://invitations.microsoft.com/redeem/?tenant=${OPDA_TENANT_ID}&user=${redemptionUserId}&ticket=SYNTHETIC-ONLY&ver=1`)}`;
const oldRedirect = `https://teams.microsoft.com/?tenantId=${OPDA_TENANT_ID}`;
const receiptFor = (identity = {}) => ({ schemaVersion: 1, identity: {
  state: 'bound', emailDigest, userId, userType: 'Guest', ...identity,
}, memberships: {} });

function fixture(overrides = {}) {
  const workspaces = Object.fromEntries(APPROVAL_GROUP_IDS.map((id, index) => [id, {
    teamId: `11111111-1111-4111-8111-${String(index + 1).padStart(12, '0')}`, status: 'provisioned',
  }]));
  const teamId = workspaces[groupId].teamId;
  const state = { users: [user], current: true, group: true, team: true, owners: [ownerId], roles: ['guest'], ...overrides };
  const calls = [], checkpoints = [];
  const request = async (route, options = {}) => {
    calls.push({ route, ...options });
    if (state.request) {
      const result = await state.request(route, options, state);
      if (result !== undefined) return result;
    }
    if (route.startsWith('/users?')) return { value: state.users };
    if (route.startsWith('/users/')) return state.readback ?? state.users.find(row => route.startsWith(`/users/${row.id}?`)) ?? null;
    const chosen = Object.values(workspaces).find(item => route.includes(item.teamId));
    if (chosen && route.startsWith(`/teams/${chosen.teamId}?`)) return { id: chosen.teamId, visibility: 'private', isArchived: false, ...state.teamDetails };
    if (chosen && route === `/groups/${chosen.teamId}/owners`) return { value: state.owners.map(id => ({ id })) };
    if (chosen && route.startsWith(`/groups/${chosen.teamId}/members/${userId}/graph.user?`)) return state.group ? { id: userId } : null;
    if (chosen && route.startsWith(`/teams/${chosen.teamId}/members?`)) return { value: state.team ? [{ id: 'member-id', userId, roles: state.roles }] : [] };
    if (route === '/invitations' && options.method === 'POST') {
      state.users = [{ ...user, externalUserState: 'PendingAcceptance' }];
      return { invitedUser: { id: userId }, invitedUserEmailAddress: email, invitedUserType: 'Guest',
        status: 'PendingAcceptance', sendInvitationMessage: false, resetRedemption: false,
        inviteRedeemUrl: redemptionUrl, inviteRedirectUrl: options.body.inviteRedirectUrl };
    }
    throw new Error('Unexpected synthetic request');
  };
  const guard = async () => state.current;
  const persistReceipt = async value => { checkpoints.push(structuredClone(value)); return true; };
  const adapter = createGraphAdapter({ request, workspaces });
  const args = { email, groupId, guard };
  const identityArgs = { email, displayName: 'Synthetic Participant', guard, persistReceipt, existingOnly: true };
  return { adapter, state, args, identityArgs, teamId, calls, checkpoints };
}

test('workspace access checks actual membership with GET only and never assumes ownership', async () => {
  const f = fixture();
  const receipt = receiptFor();
  receipt.memberships[f.teamId] = { groupId, userId, ownership: 'manual', state: 'retained' };
  const original = structuredClone(receipt);
  const result = await f.adapter.readAccess({ ...f.args, receipt });
  assert.equal(result.status, 'ready');
  assert.equal(result.userId, userId);
  assert.equal(result.userType, 'Guest');
  assert.equal(result.redemptionRequired, false);
  assert.equal(result.receipt.identity.state, 'bound');
  assert.deepEqual(result.receipt.memberships, original.memberships);
  assert.deepEqual(receipt, original);
  assert.equal(f.checkpoints.length, 0);
  assert.ok(f.calls.every(call => call.method === 'GET'));
  assert.ok(f.calls.some(call => call.route.includes('/graph.user?')));
  assert.ok(f.calls.some(call => call.route.startsWith('/teams/') && call.route.includes('/members?')));
});

test('read-only access permits existing group and Team owners without modifying ownership', async () => {
  for (const overrides of [{ owners: [userId] }, { roles: ['owner'] }, { owners: [userId], roles: ['owner'] }]) {
    const f = fixture(overrides);
    const result = await f.adapter.readAccess(f.args);
    assert.equal(result.status, 'ready');
    assert.deepEqual(result.receipt.memberships, {});
    assert.ok(f.calls.every(call => call.method === 'GET'));
    assert.equal(f.checkpoints.length, 0);
  }
});

test('an exact invited alias in otherMails can bind an existing immutable Microsoft identity', async () => {
  const f = fixture({ users: [{ ...user, mail: 'primary@example.invalid', otherMails: [email] }] });
  const result = await f.adapter.readAccess(f.args);
  assert.equal(result.status, 'ready');
  assert.equal(result.receipt.identity.emailDigest, emailDigest);
  assert.equal(result.userId, userId);
  assert.ok(f.calls.some(call => call.route.startsWith('/users?')));
  assert.ok(f.calls.some(call => call.route.startsWith(`/users/${userId}?`)));
});

test('wrong, disabled, missing and ambiguous Microsoft identities cannot open a group', async () => {
  for (const state of [{ users: [] }, { users: [user, { ...user, id: ownerId }] },
    { users: [{ ...user, mail: 'different@example.invalid' }] },
    { users: [{ ...user, accountEnabled: false }] }, { readback: { ...user, id: ownerId } }]) {
    const f = fixture(state);
    const result = await f.adapter.readAccess(f.args);
    assert.notEqual(result.status, 'ready');
    assert.ok(f.calls.every(call => call.method === 'GET'));
    assert.equal(f.checkpoints.length, 0);
  }
  const f = fixture();
  assert.notEqual((await f.adapter.readAccess({ ...f.args, receipt: receiptFor({ userId: ownerId }) })).status, 'ready');
  assert.equal(f.calls.some(call => call.route.startsWith('/users?')), false);
});

test('both membership views must be present in a private, active registered Team', async () => {
  for (const state of [{ group: false }, { team: false }, { group: false, team: false }]) {
    const f = fixture(state);
    const result = await f.adapter.readAccess(f.args);
    assert.equal(result.status, 'pending');
    assert.equal(result.reason, 'teams-sync-pending');
    assert.ok(f.calls.every(call => call.method === 'GET'));
  }
  for (const teamDetails of [{ visibility: 'public' }, { isArchived: true }, { id: ownerId }]) {
    const f = fixture({ teamDetails });
    assert.equal((await f.adapter.readAccess(f.args)).status, 'manual-review');
  }
});

test('readAccess retains unresolved invitation intent instead of converting directory presence into acknowledgement', async () => {
  const f = fixture();
  const receipt = receiptFor({ state: 'invite-intent' });
  const result = await f.adapter.readAccess({ ...f.args, receipt });
  assert.equal(result.status, 'manual-review');
  assert.equal(result.reason, 'invitation-intent-needs-review');
  assert.deepEqual(result.receipt, receipt);
  assert.equal(f.calls.length, 0);
  assert.equal(f.checkpoints.length, 0);
});

test('readAccess preserves acknowledged invitation still awaiting its redemption URL', async () => {
  const f = fixture({ users: [{ ...user, externalUserState: 'PendingAcceptance' }] });
  const receipt = receiptFor({ state: 'invited', inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL });
  const result = await f.adapter.readAccess({ ...f.args, receipt });
  assert.equal(result.status, 'pending');
  assert.equal(result.reason, 'invitation-in-progress');
  assert.deepEqual(result.receipt, receipt);
});

test('legacy pending invitations are silently refreshed once then shared across group entry reads', async () => {
  for (const metadata of [{}, { inviteRedirectUrl: oldRedirect }]) {
    const f = fixture({ users: [{ ...user, externalUserState: 'PendingAcceptance' }] });
    const legacy = receiptFor({ redemptionUrl, ...metadata });
    const read = await f.adapter.readAccess({ ...f.args, receipt: legacy });
    assert.equal(read.status, 'ready');
    assert.equal(read.redemptionRequired, true);
    assert.equal(f.calls.some(call => call.method === 'POST'), false);
    const result = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: read.receipt });
    assert.equal(result.status, 'ready');
    assert.equal(result.receipt.identity.userId, userId);
    assert.equal(result.receipt.identity.inviteRedirectUrl, MICROSOFT_INVITATION_RETURN_URL);
    const secondGroup = await f.adapter.readAccess({ ...f.args, groupId: 'conveyancing', receipt: result.receipt });
    assert.equal(secondGroup.status, 'ready');
    const repeated = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: secondGroup.receipt });
    assert.equal(repeated.status, 'ready');
    const posts = f.calls.filter(call => call.method === 'POST');
    assert.equal(posts.length, 1);
    assert.equal(posts[0].route, '/invitations');
    assert.equal(posts[0].body.sendInvitationMessage, false);
    assert.equal(posts[0].body.resetRedemption, false);
    assert.equal(posts[0].body.inviteRedirectUrl, MICROSOFT_INVITATION_RETURN_URL);
  }
});

test('accepted legacy guests never get another invitation and stale redemption details are removed', async () => {
  const f = fixture();
  const legacy = receiptFor({ redemptionUrl, inviteRedirectUrl: oldRedirect });
  const resolved = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: legacy });
  assert.equal(resolved.status, 'ready');
  assert.equal(resolved.redemptionRequired, false);
  assert.equal(Object.hasOwn(resolved.receipt.identity, 'redemptionUrl'), false);
  assert.equal(Object.hasOwn(resolved.receipt.identity, 'inviteRedirectUrl'), false);
  assert.equal(f.calls.some(call => call.method === 'POST'), false);
});

test('existingOnly never creates a missing guest and validates its boolean boundary', async () => {
  const f = fixture({ users: [] });
  const result = await f.adapter.resolveIdentity(f.identityArgs);
  assert.equal(result.status, 'pending');
  assert.equal(result.reason, 'microsoft-identity-missing');
  assert.equal(f.calls.some(call => call.method === 'POST'), false);
  assert.equal(f.checkpoints.length, 0);
  for (const existingOnly of ['true', 1, null]) {
    const invalid = await f.adapter.resolveIdentity({ ...f.identityArgs, existingOnly });
    assert.equal(invalid.status, 'manual-review');
  }
});

test('entry reads recheck guards after provider reads and do not disclose provider failures', async () => {
  const f = fixture({ request: async (route, _options, state) => {
    if (route.startsWith('/users/')) { state.current = false; return user; }
  } });
  assert.equal((await f.adapter.readAccess(f.args)).reason, 'stale-operation');
  assert.equal(f.calls.some(call => call.route.startsWith('/teams/')), false);
  const unavailable = fixture({ request: async () => { throw new Error('private provider body'); } });
  const result = await unavailable.adapter.readAccess(unavailable.args);
  assert.equal(result.reason, 'graph-read-unavailable');
  assert.doesNotMatch(JSON.stringify(result), /private provider body/);
  assert.equal((await fixture().adapter.readAccess({ ...f.args, groupId: 'unregistered' })).status, 'manual-review');
});
