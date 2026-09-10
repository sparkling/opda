import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createGraphAdapter } from '../src/approval-onboarding/graph.mjs';
import { APPROVAL_GROUP_IDS, MICROSOFT_INVITATION_RETURN_URL, OPDA_TENANT_ID } from '../src/approval-onboarding/invitation.mjs';

const userId = '22222222-2222-4222-8222-222222222222';
const otherId = '33333333-3333-4333-8333-333333333333';
const redemptionUserId = '44444444-4444-4444-8444-444444444444';
const email = 'synthetic@example.invalid';
const displayName = 'Synthetic Participant';
const user = { id: userId, userType: 'Guest', accountEnabled: true, externalUserState: 'Accepted', mail: email, otherMails: [], userPrincipalName: 'synthetic_example.invalid#EXT#@example.onmicrosoft.com' };
const redemptionUrl = `https://login.microsoftonline.com/redeem?rd=${encodeURIComponent(`https://invitations.microsoft.com/redeem/?tenant=${OPDA_TENANT_ID}&user=${redemptionUserId}&ticket=SYNTHETIC-ONLY&ver=1`)}`;
const digest = createHash('sha256').update(email).digest('hex');
const identityReceipt = () => ({ schemaVersion: 1, identity: { state: 'bound', emailDigest: digest, userId, userType: 'Guest', loginName: `i:0#.f|membership|${user.userPrincipalName}` }, memberships: {} });

function fixture(options = {}) {
  const workspaces = Object.fromEntries(APPROVAL_GROUP_IDS.map((id, index) => [id, { teamId: `11111111-1111-4111-8111-${String(index + 1).padStart(12, '0')}`, status: 'provisioned' }]));
  const teamId = workspaces['finance-and-banking'].teamId;
  const calls = [], checkpoints = [], events = [];
  const state = { group: false, team: false, owners: [otherId], users: [user], current: true, ...options.state };
  const request = async (route, requestOptions = {}) => {
    calls.push({ route, ...requestOptions });
    events.push(`${requestOptions.method ?? 'GET'} ${route.split('?')[0]}`);
    if (options.request) {
      const replacement = await options.request(route, requestOptions, state);
      if (replacement !== undefined) return replacement;
    }
    if (route.startsWith('/users?')) return { value: state.users };
    if (route.startsWith(`/users/${userId}?`)) return state.userReadback ?? state.users.find((row) => row.id === userId) ?? null;
    if (route.startsWith(`/teams/${teamId}?`)) return { id: teamId, visibility: 'private', isArchived: false, ...state.teamDetails };
    if (route === `/groups/${teamId}/owners`) return { value: state.owners.map((id) => ({ id })) };
    if (route.startsWith(`/teams/${teamId}/members?`)) return { value: state.team ? [{ id: 'opaque-conversation-member-id', userId, roles: state.roles ?? ['guest'] }] : [] };
    if (route === `/groups/${teamId}/members/${userId}/$ref` && requestOptions.method === 'DELETE') { state.group = false; if (state.syncRemoval) state.team = false; return null; }
    if (route === `/groups/${teamId}/members/${userId}/graph.user?$select=id` && requestOptions.method === 'GET') return state.group ? { id: userId } : null;
    if (route === `/groups/${teamId}/members/$ref` && requestOptions.method === 'POST') { state.group = true; if (state.syncGrant) state.team = true; return null; }
    if (route === '/invitations' && requestOptions.method === 'POST') {
      state.users = [{ ...user, externalUserState: 'PendingAcceptance' }];
      return { invitedUser: { id: userId }, invitedUserEmailAddress: email, invitedUserType: 'Guest', sendInvitationMessage: false, resetRedemption: false, status: 'PendingAcceptance', inviteRedeemUrl: redemptionUrl, inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL };
    }
    throw new Error('unexpected fixture request');
  };
  const adapter = createGraphAdapter({ request, workspaces });
  const guard = async () => { events.push('guard'); return state.current; };
  const persistReceipt = async (receipt) => { events.push(`persist:${receipt.identity?.state ?? 'none'}:${receipt.memberships[teamId]?.state ?? 'none'}`); checkpoints.push(structuredClone(receipt)); if (options.persist) return options.persist(receipt, state); return true; };
  const identityArgs = { email, displayName, guard, persistReceipt };
  const memberArgs = { groupId: 'finance-and-banking', userId, receipt: identityReceipt(), guard, persistReceipt };
  return { adapter, workspaces, teamId, request, state, calls, checkpoints, events, identityArgs, memberArgs };
}

test('accepted guests and tenant members are bound by immutable ID without an invitation/reset', async () => {
  for (const userType of ['Guest', 'Member']) {
    const f = fixture({ state: { users: [{ ...user, userType }] } });
    const result = await f.adapter.resolveIdentity(f.identityArgs);
    assert.equal(result.status, 'ready');
    assert.equal(result.userId, userId);
    assert.equal(result.loginName, `i:0#.f|membership|${user.userPrincipalName}`);
    assert.equal(result.redemptionRequired, false);
    assert.equal(Object.hasOwn(result, 'redemptionUrl'), false);
    assert.equal(f.calls.some((call) => call.method === 'POST'), false);
    assert.equal(f.checkpoints.at(-1).identity.userId, userId);
    const repeated = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: result.receipt });
    assert.equal(repeated.status, 'ready');
    assert.equal(f.calls.filter((call) => call.route.startsWith('/users?')).length, 1);
  }
});

test('new and pending guests get one durable silent non-reset invitation and verified immutable readback', async () => {
  for (const users of [[], [{ ...user, externalUserState: 'PendingAcceptance' }]]) {
    const f = fixture({ state: { users } });
    const result = await f.adapter.resolveIdentity(f.identityArgs);
    assert.equal(result.status, 'ready');
    assert.equal(result.redemptionRequired, true);
    assert.equal(result.redemptionUrl, redemptionUrl);
    const invite = f.calls.find((call) => call.route === '/invitations');
    assert.deepEqual(invite.body, { invitedUserEmailAddress: email, invitedUserDisplayName: displayName, invitedUserType: 'Guest', inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL, sendInvitationMessage: false, resetRedemption: false });
    assert.equal(result.receipt.identity.inviteRedirectUrl, MICROSOFT_INVITATION_RETURN_URL);
    assert.ok(f.events.indexOf('persist:invite-intent:none') < f.events.indexOf('POST /invitations'));
    assert.equal(f.checkpoints.find((receipt) => receipt.identity?.state === 'invited').identity.userId, userId);
    const again = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: result.receipt });
    assert.equal(again.redemptionUrl, redemptionUrl);
    assert.equal(f.calls.filter((call) => call.route === '/invitations').length, 1);
  }
});

test('optional false invitation echoes may be omitted or null but never true or malformed', async () => {
  for (const flag of ['sendInvitationMessage', 'resetRedemption']) {
    for (const value of [undefined, null, false, true, 0, 'false']) {
      const f = fixture({ state: { users: [] }, request: async (route, options, state) => {
        if (route !== '/invitations') return undefined;
        state.users = [{ ...user, externalUserState: 'PendingAcceptance' }];
        const response = { invitedUser: { id: userId }, invitedUserEmailAddress: email, invitedUserType: 'Guest',
          status: 'PendingAcceptance', inviteRedeemUrl: redemptionUrl, inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL, sendInvitationMessage: false, resetRedemption: false };
        if (value === undefined) delete response[flag]; else response[flag] = value;
        return response;
      } });
      const result = await f.adapter.resolveIdentity(f.identityArgs);
      const accepted = value === undefined || value === null || value === false;
      assert.equal(result.status, accepted ? 'ready' : 'manual-review');
      assert.equal(result.receipt.identity.state, accepted ? 'bound' : 'invite-intent');
      if (accepted) assert.equal(f.checkpoints.find(receipt => receipt.identity.state === 'invited').identity.userId, userId);
    }
  }
});

test('InProgress acknowledgement persists the immutable identity and retries reads without inviting again', async () => {
  const f = fixture({ state: { users: [] }, request: async (route, options, state) => {
    if (route !== '/invitations') return undefined;
    return { invitedUser: { id: userId }, invitedUserEmailAddress: email, invitedUserType: 'Guest',
      status: 'InProgress', inviteRedeemUrl: redemptionUrl, inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL, sendInvitationMessage: null };
  } });
  let result = await f.adapter.resolveIdentity(f.identityArgs);
  assert.equal(result.status, 'pending');
  assert.equal(result.reason, 'invitation-in-progress');
  assert.equal(result.receipt.identity.state, 'invited');
  assert.equal(f.checkpoints.at(-1).identity.userId, userId);
  assert.equal(f.calls.some(call => call.route.startsWith('/users/')), false);
  result = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: result.receipt });
  assert.equal(result.status, 'pending');
  assert.equal(result.reason, 'identity-propagating');
  f.state.users = [{ ...user, externalUserState: 'PendingAcceptance' }];
  result = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: result.receipt });
  assert.equal(result.status, 'ready');
  assert.equal(result.redemptionUrl, redemptionUrl);
  assert.equal(f.calls.filter(call => call.route === '/invitations').length, 1);
  assert.equal(f.calls.filter(call => call.route.startsWith('/users?')).length, 1);
});

test('an InProgress invitation without its optional URL never triggers a second POST or claims readiness', async () => {
  const f = fixture({ state: { users: [] }, request: async (route, options, state) => {
    if (route !== '/invitations') return undefined;
    state.users = [{ ...user, externalUserState: 'PendingAcceptance' }];
    return { invitedUser: { id: userId }, invitedUserEmailAddress: email, invitedUserType: 'Guest', status: 'InProgress', inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL };
  } });
  const first = await f.adapter.resolveIdentity(f.identityArgs);
  assert.equal(first.status, 'pending');
  assert.equal(first.receipt.identity.userId, userId);
  const again = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: first.receipt });
  assert.equal(again.status, 'pending');
  assert.equal(again.reason, 'invitation-in-progress');
  assert.equal(f.calls.filter(call => call.route === '/invitations').length, 1);
  f.state.users = [user];
  assert.equal((await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: again.receipt })).status, 'ready');
});

test('a withdrawal racing an acknowledged InProgress invitation still persists its immutable identity', async () => {
  const f = fixture({ state: { users: [] }, request: async (route, options, state) => {
    if (route !== '/invitations') return undefined;
    state.current = false;
    return { invitedUser: { id: userId }, invitedUserEmailAddress: email, invitedUserType: 'Guest', status: 'InProgress', inviteRedeemUrl: redemptionUrl, inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL };
  } });
  const result = await f.adapter.resolveIdentity(f.identityArgs);
  assert.equal(result.reason, 'stale-operation');
  assert.equal(f.checkpoints.at(-1).identity.userId, userId);
  assert.equal(f.checkpoints.at(-1).identity.state, 'invited');
});

test('documented invitation-only address restrictions are checked before intent, without blocking accepted identity reuse', async () => {
  for (const local of ['person+tag', 'person!tag', 'person~tag', 'person#tag', 'person$tag', 'person%tag', 'person^tag', 'person&tag', 'person*tag', 'person=tag', 'person/tag', 'person?tag', 'person{tag}', 'person|tag', '-person', 'person-']) {
    const address = `${local}@example.invalid`;
    const f = fixture({ state: { users: [] } });
    const unsupported = await f.adapter.resolveIdentity({ ...f.identityArgs, email: address });
    assert.equal(unsupported.reason, 'invitation-address-unsupported');
    assert.equal(f.checkpoints.length, 0);
    assert.equal(f.calls.some(call => call.method === 'POST'), false);
    for (const userType of ['Guest', 'Member']) {
      f.state.users = [{ ...user, userType, mail: address }];
      assert.equal((await f.adapter.resolveIdentity({ ...f.identityArgs, email: address })).status, 'ready');
    }
    f.state.users = [{ ...user, mail: address, externalUserState: 'PendingAcceptance' }];
    assert.equal((await f.adapter.resolveIdentity({ ...f.identityArgs, email: address })).reason, 'invitation-address-unsupported');
    assert.equal(f.calls.some(call => call.method === 'POST'), false);
  }
});

test('documented dots, interior hyphens and underscores still permit a new invitation', async () => {
  for (const local of ['first.last', 'first-last', '_person_', 'person_name']) {
    const address = `${local}@example.invalid`;
    const f = fixture({ state: { users: [] }, request: async (route, options, state) => {
      if (route !== '/invitations') return undefined;
      state.users = [{ ...user, mail: address, externalUserState: 'PendingAcceptance' }];
      return { invitedUser: { id: userId }, invitedUserEmailAddress: address, invitedUserType: 'Guest',
        status: 'PendingAcceptance', inviteRedeemUrl: redemptionUrl, inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL };
    } });
    assert.equal((await f.adapter.resolveIdentity({ ...f.identityArgs, email: address })).status, 'ready');
    assert.equal(f.calls.filter(call => call.route === '/invitations').length, 1);
  }
});

test('ambiguous identities, disabled users and mismatched email/ID never acquire grants', async () => {
  for (const state of [{ users: [user, { ...user, id: otherId }] }, { users: [{ ...user, mail: 'other@example.invalid' }] }, { users: [{ ...user, accountEnabled: false }] }, { users: [user], userReadback: { ...user, id: otherId } }]) {
    const f = fixture({ state });
    const result = await f.adapter.resolveIdentity(f.identityArgs);
    assert.equal(result.status, 'manual-review');
    assert.equal(f.calls.some((call) => call.method === 'POST'), false);
  }
});

test('invitation timeouts and intent-only crashes are never blindly retried or inferred from presence', async () => {
  const f = fixture({ state: { users: [] }, request: async (route) => { if (route === '/invitations') throw new Error('secret redemption or token'); } });
  const result = await f.adapter.resolveIdentity(f.identityArgs);
  assert.equal(result.status, 'manual-review');
  assert.equal(result.receipt.identity.state, 'invite-intent');
  f.state.users = [user];
  const again = await f.adapter.resolveIdentity({ ...f.identityArgs, receipt: result.receipt });
  assert.equal(again.status, 'manual-review');
  assert.equal(f.calls.filter((call) => call.route === '/invitations').length, 1);
  assert.doesNotMatch(result.reason, /secret|token|redemption or/);
});

test('hostile redemption URLs and invitation ID changes stay manual-review without leaking URLs', async () => {
  for (const change of [{ invitedUser: { id: otherId } }, { inviteRedeemUrl: 'https://evil.invalid/redeem' }, { inviteRedeemUrl: `${redemptionUrl}&tenant=${otherId}` }, { inviteRedeemUrl: `${redemptionUrl}&user=${otherId}&user=${otherId}` }, { inviteRedeemUrl: `${redemptionUrl}&user=not-a-uuid` }, { inviteRedirectUrl: 'https://evil.invalid/continue' }, { inviteRedirectUrl: undefined }, { resetRedemption: true }]) {
    const f = fixture({ state: { users: [{ ...user, externalUserState: 'PendingAcceptance' }] }, request: async (route) => route === '/invitations' ? { invitedUser: { id: userId }, invitedUserEmailAddress: email, invitedUserType: 'Guest', sendInvitationMessage: false, resetRedemption: false, status: 'PendingAcceptance', inviteRedeemUrl: redemptionUrl, inviteRedirectUrl: MICROSOFT_INVITATION_RETURN_URL, ...change } : undefined });
    const result = await f.adapter.resolveIdentity(f.identityArgs);
    assert.equal(result.status, 'manual-review');
    assert.doesNotMatch(result.reason, /https:|example.invalid|SYNTHETIC/);
  }
});

test('a successful group add is owned only after acknowledgement, and actual Team synchronization stays pending', async () => {
  const f = fixture();
  const result = await f.adapter.ensureMembership(f.memberArgs);
  assert.equal(result.status, 'pending');
  assert.equal(result.reason, 'teams-sync-pending');
  assert.equal(result.receipt.memberships[f.teamId].ownership, 'owned');
  assert.equal(result.receipt.memberships[f.teamId].state, 'granted');
  const add = f.calls.find((call) => call.method === 'POST');
  assert.equal(add.route, `/groups/${f.teamId}/members/$ref`);
  assert.deepEqual(add.body, { '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${userId}` });
  assert.ok(f.calls.some(call => call.method === 'GET' && call.route === `/groups/${f.teamId}/members/${userId}/graph.user?$select=id`));
  assert.ok(f.events.indexOf('persist:bound:grant-intent') < f.events.indexOf(`POST /groups/${f.teamId}/members/$ref`));
  f.state.team = true;
  const ready = await f.adapter.ensureMembership({ ...f.memberArgs, receipt: result.receipt });
  assert.equal(ready.status, 'ready');
  assert.equal(f.calls.filter((call) => call.method === 'POST').length, 1);
  assert.equal(f.calls.some((call) => call.method === 'POST' && call.route.startsWith('/teams/')), false);
});

test('a pre-existing manual grant is usable but retained on withdrawal, never claimed or removed', async () => {
  const f = fixture({ state: { group: true, team: true } });
  const ready = await f.adapter.ensureMembership(f.memberArgs);
  assert.equal(ready.status, 'ready');
  assert.equal(ready.receipt.memberships[f.teamId].ownership, 'manual');
  const withdrawn = await f.adapter.revokeMembership({ ...f.memberArgs, receipt: ready.receipt });
  assert.equal(withdrawn.status, 'manual-review');
  assert.equal(withdrawn.retained, true);
  assert.equal(f.calls.some((call) => ['POST', 'DELETE'].includes(call.method)), false);
});

test('group or Team owners and non-private/archived/mismatched Teams are never modified', async () => {
  for (const state of [{ owners: [userId, otherId] }, { group: true, team: true, roles: ['owner'] }, { teamDetails: { visibility: 'public' } }, { teamDetails: { isArchived: true } }, { teamDetails: { id: otherId } }]) {
    const f = fixture({ state });
    assert.equal((await f.adapter.ensureMembership(f.memberArgs)).status, 'manual-review');
    assert.equal(f.calls.some((call) => ['POST', 'DELETE'].includes(call.method)), false);
  }
});

test('ambiguous grant acknowledgement never turns later presence into owned membership', async () => {
  const f = fixture({ request: async (route, options, state) => { if (options.method === 'POST') { state.group = true; state.team = true; throw new Error('ambiguous provider write'); } } });
  const result = await f.adapter.ensureMembership(f.memberArgs);
  assert.equal(result.status, 'manual-review');
  assert.equal(result.receipt.memberships[f.teamId].state, 'grant-intent');
  assert.equal(result.receipt.memberships[f.teamId].ownership, 'unknown');
  const again = await f.adapter.ensureMembership({ ...f.memberArgs, receipt: result.receipt });
  assert.equal(again.status, 'manual-review');
  const removal = await f.adapter.revokeMembership({ ...f.memberArgs, receipt: result.receipt });
  assert.equal(removal.status, 'manual-review');
  assert.equal(f.calls.filter((call) => call.method === 'POST').length, 1);
  assert.equal(f.calls.some((call) => call.method === 'DELETE'), false);
});

test('withdrawal racing an acknowledged add still durably records ownership before reporting stale', async () => {
  const f = fixture({ request: async (route, options, state) => { if (options.method === 'POST') { state.group = true; state.current = false; return null; } } });
  const result = await f.adapter.ensureMembership(f.memberArgs);
  assert.equal(result.status, 'pending');
  assert.equal(result.reason, 'stale-operation');
  assert.equal(f.checkpoints.at(-1).memberships[f.teamId].ownership, 'owned');
  assert.ok(f.events.indexOf(`POST /groups/${f.teamId}/members/$ref`) < f.events.indexOf('persist:bound:granted'));
});

test('a guard becoming false after a read prevents later intent/grant, and read outages remain pending', async () => {
  const stale = fixture({ request: async (route, options, state) => {
    if (route.startsWith('/users/')) { state.current = false; return user; }
  } });
  assert.equal((await stale.adapter.ensureMembership(stale.memberArgs)).reason, 'stale-operation');
  assert.equal(stale.checkpoints.length, 0);
  assert.equal(stale.calls.some((call) => call.method === 'POST'), false);
  const unavailable = fixture({ request: async () => { throw new Error('private Graph response'); } });
  const pending = await unavailable.adapter.ensureMembership(unavailable.memberArgs);
  assert.equal(pending.status, 'pending');
  assert.equal(pending.reason, 'graph-read-unavailable');
  const denied = fixture({ request: async () => { throw Object.assign(new Error('private denied response'), { status: 403 }); } });
  assert.equal((await denied.adapter.ensureMembership(denied.memberArgs)).reason, 'graph-permission-denied');
});

test('withdrawal deletes only an owned membership reference, then waits until both membership views disappear', async () => {
  const f = fixture({ state: { group: true, team: true } });
  const receipt = identityReceipt();
  receipt.memberships[f.teamId] = { groupId: 'finance-and-banking', userId, ownership: 'owned', state: 'granted' };
  const pending = await f.adapter.revokeMembership({ ...f.memberArgs, receipt });
  assert.equal(pending.status, 'pending');
  assert.equal(pending.reason, 'teams-removal-pending');
  assert.equal(f.checkpoints.at(-1).memberships[f.teamId].state, 'removed');
  assert.equal(f.calls.filter((call) => call.method === 'DELETE')[0].route, `/groups/${f.teamId}/members/${userId}/$ref`);
  f.state.team = false;
  assert.equal((await f.adapter.revokeMembership({ ...f.memberArgs, receipt: pending.receipt })).status, 'ready');
  assert.equal(f.calls.filter((call) => call.method === 'DELETE').length, 1);
});

test('an acknowledged removal is persisted even after the current guard becomes false', async () => {
  const f = fixture({ state: { group: true, team: true }, request: async (route, options, state) => { if (options.method === 'DELETE') { state.group = false; state.current = false; return null; } } });
  const receipt = identityReceipt();
  receipt.memberships[f.teamId] = { groupId: 'finance-and-banking', userId, ownership: 'owned', state: 'granted' };
  const result = await f.adapter.revokeMembership({ ...f.memberArgs, receipt });
  assert.equal(result.reason, 'stale-operation');
  assert.equal(f.checkpoints.at(-1).memberships[f.teamId].state, 'removed');
});

test('cleanup uses the immutable receipt ID even when an identity-link retry is pending', async () => {
  const f = fixture({ state: { group: true, team: true, syncRemoval: true } });
  const receipt = identityReceipt();
  receipt.identity.state = 'invite-intent';
  receipt.memberships[f.teamId] = { groupId: 'finance-and-banking', userId, ownership: 'owned', state: 'granted' };
  const result = await f.adapter.revokeMembership({ ...f.memberArgs, receipt });
  assert.equal(result.status, 'ready');
  assert.equal(result.receipt.memberships[f.teamId].state, 'removed');
  assert.equal(f.calls.some((call) => call.route.startsWith('/users')), false);
});

test('observed absence closes the owned receipt so a later explicit approval can grant afresh', async () => {
  const f = fixture({ state: { syncGrant: true } });
  const receipt = identityReceipt();
  receipt.memberships[f.teamId] = { groupId: 'finance-and-banking', userId, ownership: 'owned', state: 'granted' };
  const removed = await f.adapter.revokeMembership({ ...f.memberArgs, receipt });
  assert.equal(removed.status, 'ready');
  assert.equal(removed.receipt.memberships[f.teamId].state, 'removed');
  assert.equal(f.calls.some((call) => call.method === 'DELETE'), false);
  assert.equal((await f.adapter.ensureMembership({ ...f.memberArgs, receipt: removed.receipt })).status, 'ready');
  assert.equal(f.calls.filter((call) => call.method === 'POST').length, 1);
});

test('ambiguous deletion remains attention and is never retried merely because group membership is still visible', async () => {
  const f = fixture({ state: { group: true, team: true }, request: async (route, options) => { if (options.method === 'DELETE') throw new Error('ambiguous removal'); } });
  const receipt = identityReceipt();
  receipt.memberships[f.teamId] = { groupId: 'finance-and-banking', userId, ownership: 'owned', state: 'granted' };
  const result = await f.adapter.revokeMembership({ ...f.memberArgs, receipt });
  assert.equal(result.status, 'manual-review');
  assert.equal(result.receipt.memberships[f.teamId].state, 'remove-intent');
  assert.equal((await f.adapter.revokeMembership({ ...f.memberArgs, receipt: result.receipt })).status, 'manual-review');
  assert.equal(f.calls.filter((call) => call.method === 'DELETE').length, 1);
});

test('failed durable intent or false guard blocks mutations, while acknowledged ownership survives receipt failure in the result', async () => {
  for (const persist of [async () => false, async () => { throw new Error('private database detail'); }]) {
    const f = fixture({ persist });
    assert.equal((await f.adapter.ensureMembership(f.memberArgs)).status, 'manual-review');
    assert.equal(f.calls.some((call) => call.method === 'POST'), false);
  }
  const f = fixture({ state: { current: false } });
  assert.equal((await f.adapter.ensureMembership(f.memberArgs)).reason, 'stale-operation');
  assert.equal(f.calls.length, 0);
  const failedAck = fixture({ persist: async (receipt) => receipt.memberships[Object.keys(receipt.memberships)[0]]?.state !== 'granted' });
  const result = await failedAck.adapter.ensureMembership(failedAck.memberArgs);
  assert.equal(result.status, 'manual-review');
  assert.equal(result.reason, 'receipt-persistence-failed');
  assert.equal(result.receipt.memberships[failedAck.teamId].ownership, 'owned');
});

test('workspaces, identities, receipt bindings and provider paging/rows fail closed at boundaries', async () => {
  const f = fixture();
  for (const workspaces of [{}, { ...f.workspaces, technology: { teamId: otherId } }, { ...f.workspaces, 'property-technology': { teamId: '286b29b1-163d-4cb5-aaec-39b1c5ceef4b' } }, { ...f.workspaces, 'conveyancing': { teamId: f.teamId } }]) assert.throws(() => createGraphAdapter({ request: f.request, workspaces }));
  for (const change of [{ email: '<bad@example.invalid>' }, { email: "a' or mail ne 'b@example.invalid" }, { displayName: '<script>x</script>' }, { receipt: { ...identityReceipt(), identity: { ...identityReceipt().identity, emailDigest: 'b'.repeat(64) } } }]) assert.equal((await f.adapter.resolveIdentity({ ...f.identityArgs, ...change })).status, 'manual-review');
  for (const change of [{ groupId: 'technology' }, { userId: otherId }, { userId: '../users' }]) assert.equal((await f.adapter.ensureMembership({ ...f.memberArgs, ...change })).status, 'manual-review');
  const paged = fixture({ request: async (route) => route.startsWith('/users?') ? { value: [user], '@odata.nextLink': 'https://evil.invalid/users' } : undefined });
  assert.equal((await paged.adapter.resolveIdentity(paged.identityArgs)).status, 'manual-review');
  assert.equal(paged.calls.some((call) => call.route.includes('evil.invalid')), false);
  assert.equal(f.calls.some((call) => ['POST', 'PATCH', 'DELETE'].includes(call.method)), false);
});
