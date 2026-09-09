import { createHash } from 'node:crypto';
import { APPROVAL_GROUP_IDS, OPDA_TENANT_ID } from './invitation.mjs';

const GUID = /^(?!00000000-0000-0000-0000-000000000000$)[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const DIGEST = /^[a-f0-9]{64}$/;
const TECHNOLOGY_TEAM_ID = '286b29b1-163d-4cb5-aaec-39b1c5ceef4b';
const USER_FIELDS = 'id,userType,accountEnabled,externalUserState,mail,otherMails,userPrincipalName';
const UNSAFE = /[<>\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/u;
const hash = (value) => createHash('sha256').update(value).digest('hex');
const stop = (reason, status = 'manual-review') => { throw Object.assign(new Error(reason), { safeReason: reason, status }); };
const requireValue = (value, reason = 'invalid-input') => { if (!value) stop(reason); };
const emptyReceipt = () => ({ schemaVersion: 1, identity: null, memberships: {} });

function object(value, keys) {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value)));
  requireValue(!keys || Object.keys(value).every((key) => keys.includes(key)));
  requireValue(Object.values(Object.getOwnPropertyDescriptors(value)).every((item) => !item.get && !item.set));
}

function normalizedEmail(value) {
  requireValue(typeof value === 'string' && value.length <= 254
    && /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(value));
  requireValue(value.split('@')[0].length <= 64 && value.split('@')[1].split('.').every((label) => label.length <= 63));
  return value.toLowerCase();
}

function invitationAddress(email) {
  // Invitation-only restrictions, not a restriction on reusing an accepted user.
  // https://learn.microsoft.com/en-us/graph/api/resources/invitation?view=graph-rest-1.0#properties
  const local = email.split('@')[0], forbidden = '~!#$%^&*()+={}[]\\/:;"<>?,|';
  requireValue([...local].every(char => !forbidden.includes(char)) && !/^[.-]|[.-]$/u.test(local), 'invitation-address-unsupported');
}

function redemptionLink(value) {
  requireValue(typeof value === 'string' && value.length <= 8192 && !UNSAFE.test(value)
    && !/[\s\\{}"]/u.test(value) && /^https:\/\/login\.microsoftonline\.com\/redeem\/?\?/u.test(value), 'invalid-redemption-link');
  let url;
  try { url = new URL(value); } catch { stop('invalid-redemption-link'); }
  requireValue(!url.hash && !url.username && !url.password && !url.port, 'invalid-redemption-link');
  requireValue([...url.searchParams.keys()].every((key) => ['rd', 'tenant', 'ticket', 'ver'].includes(key))
    && new Set(url.searchParams.keys()).size === [...url.searchParams.keys()].length, 'invalid-redemption-link');
  if (url.searchParams.has('tenant')) requireValue(url.searchParams.get('tenant')?.toLowerCase() === OPDA_TENANT_ID, 'invalid-redemption-link');
  let target = url;
  if (url.searchParams.has('rd')) {
    const nested = url.searchParams.get('rd');
    requireValue(/^https:\/\/invitations\.microsoft\.com\/redeem\/?\?/u.test(nested) && !/[\s\\{}"]/.test(nested) && !UNSAFE.test(nested), 'invalid-redemption-link');
    try { target = new URL(nested); } catch { stop('invalid-redemption-link'); }
    requireValue(!target.hash && !target.username && !target.password && !target.port
      && [...target.searchParams.keys()].every((key) => ['tenant', 'ticket', 'ver'].includes(key))
      && new Set(target.searchParams.keys()).size === [...target.searchParams.keys()].length, 'invalid-redemption-link');
  }
  requireValue(target.searchParams.get('tenant')?.toLowerCase() === OPDA_TENANT_ID
    && Boolean(target.searchParams.get('ticket')) && !UNSAFE.test(target.searchParams.get('ticket')), 'invalid-redemption-link');
  return value;
}

function collection(data, maximum) {
  requireValue(data && Array.isArray(data.value) && data.value.length <= maximum && !data['@odata.nextLink'], 'ambiguous-provider-collection');
  return data.value;
}

/**
 * App-only, ordinary membership adapter. request is createMicrosoftClient().graph:
 * parsed JSON on reads/invitations, null for acknowledged 204 writes/allowed 404 reads.
 * No direct Teams writes, directory writes, redemption reset, welcome email or user delete.
 * guard() and persistReceipt(receipt) must resolve to true; persistence must be durable CAS.
 * Receipts are shared across review versions and contain private identity/redemption data:
 * store encrypted, never log or put them in queue messages. Serialize calls per participant.
 * An intent without acknowledgement is NOT ownership, even when a resource later exists.
 * Confirmed effects are persisted BEFORE a post-effect guard can stop stale work.
 *
 * https://learn.microsoft.com/en-us/graph/api/invitation-post?view=graph-rest-1.0
 * https://learn.microsoft.com/en-us/graph/api/group-post-members?view=graph-rest-1.0
 * https://learn.microsoft.com/en-us/graph/api/group-delete-members?view=graph-rest-1.0
 * https://learn.microsoft.com/en-us/graph/teams-create-group-and-team
 */
export function createGraphAdapter({ request, workspaces } = {}) {
  requireValue(typeof request === 'function');
  object(workspaces, APPROVAL_GROUP_IDS);
  requireValue(Object.keys(workspaces).length === APPROVAL_GROUP_IDS.length);
  const teams = Object.fromEntries(APPROVAL_GROUP_IDS.map((id) => {
    object(workspaces[id]);
    const { teamId, status } = workspaces[id];
    requireValue(typeof teamId === 'string' && GUID.test(teamId) && teamId.toLowerCase() !== TECHNOLOGY_TEAM_ID
      && (status === undefined || ['provisioned', 'implemented'].includes(status)), 'invalid-workspace');
    return [id, teamId.toLowerCase()];
  }));
  requireValue(new Set(Object.values(teams)).size === APPROVAL_GROUP_IDS.length, 'duplicate-workspace');

  function receiptFor(value) {
    if (value === undefined || value === null) return emptyReceipt();
    object(value, ['schemaVersion', 'identity', 'memberships']);
    requireValue(value.schemaVersion === 1, 'invalid-receipt');
    object(value.memberships, Object.values(teams));
    if (value.identity !== null) {
      object(value.identity, ['state', 'emailDigest', 'userId', 'userType', 'loginName', 'redemptionUrl']);
      const identity = value.identity;
      requireValue(['bound', 'invite-intent', 'invited'].includes(identity.state) && DIGEST.test(identity.emailDigest ?? ''), 'invalid-receipt');
      if (identity.userId !== undefined) requireValue(typeof identity.userId === 'string' && GUID.test(identity.userId), 'invalid-receipt');
      if (identity.state !== 'invite-intent') requireValue(typeof identity.userId === 'string' && GUID.test(identity.userId), 'invalid-receipt');
      if (identity.redemptionUrl !== undefined) redemptionLink(identity.redemptionUrl);
      if (identity.loginName !== undefined) requireValue(typeof identity.loginName === 'string' && identity.loginName.length <= 360 && !UNSAFE.test(identity.loginName), 'invalid-receipt');
      if (identity.userType !== undefined) requireValue(['Guest', 'Member'].includes(identity.userType), 'invalid-receipt');
    }
    for (const [teamId, grant] of Object.entries(value.memberships)) {
      object(grant, ['groupId', 'userId', 'ownership', 'state']);
      requireValue(teams[grant.groupId] === teamId && GUID.test(grant.userId ?? '') && grant.userId === value.identity?.userId, 'invalid-receipt-binding');
      const ownership = { 'grant-intent': 'unknown', granted: 'owned', retained: 'manual', 'remove-intent': 'owned', removed: 'owned' };
      requireValue(Object.hasOwn(ownership, grant.state) && ownership[grant.state] === grant.ownership, 'invalid-receipt');
    }
    return structuredClone(value);
  }

  async function run(args, kind, operation) {
    let receipt = emptyReceipt();
    try {
      object(args, kind === 'identity' ? ['email', 'displayName', 'receipt', 'guard', 'persistReceipt'] : ['groupId', 'userId', 'receipt', 'guard', 'persistReceipt']);
      requireValue(typeof args.guard === 'function' && typeof args.persistReceipt === 'function');
      receipt = receiptFor(args.receipt);
      const check = async () => {
        let current;
        try { current = await args.guard(); } catch { stop('guard-unavailable', 'pending'); }
        if (current !== true) stop('stale-operation', 'pending');
      };
      const persist = async (acknowledgedEffect = false) => {
        if (!acknowledgedEffect) await check();
        let persisted;
        try { persisted = await args.persistReceipt(structuredClone(receipt)); } catch { stop('receipt-persistence-failed'); }
        if (persisted !== true) stop('receipt-persistence-failed');
        await check();
      };
      const read = async (route, options = {}) => {
        await check();
        let result;
        try { result = await request(route, { method: 'GET', ...options }); }
        catch (error) { await check(); stop([401, 403].includes(error?.status) ? 'graph-permission-denied' : 'graph-read-unavailable', [401, 403].includes(error?.status) ? 'manual-review' : 'pending'); }
        await check();
        return result;
      };
      const write = async (route, options, acknowledge) => {
        await check();
        let result;
        try { result = await request(route, options); }
        catch { try { await check(); } catch {} stop('mutation-outcome-unknown'); }
        try { acknowledge(result); } catch (error) { try { await check(); } catch {} throw error; }
        // Withdrawal may have raced the response: retain known effects for its cleanup.
        await persist(true);
      };
      return { ...(await operation({ args, receipt, check, persist, read, write })), receipt };
    } catch (error) {
      return { status: error?.safeReason ? error.status : 'manual-review', reason: error?.safeReason ?? 'invalid-provider-response',
        ...(error?.safeReason === 'owner-membership-retained' ? { retained: true } : {}), receipt };
    }
  }

  function verifyUser(row, emailDigest, expectedId, expectedType) {
    requireValue(row && GUID.test(row.id ?? '') && (!expectedId || row.id === expectedId)
      && ['Guest', 'Member'].includes(row.userType) && (!expectedType || row.userType === expectedType)
      && row.accountEnabled === true, 'identity-binding-mismatch');
    requireValue(typeof row.userPrincipalName === 'string' && row.userPrincipalName.length <= 320
      && /^[^@\s<>|{}\/\\]+@[^@\s<>|{}\/\\]+$/u.test(row.userPrincipalName) && !UNSAFE.test(row.userPrincipalName), 'identity-binding-mismatch');
    const addresses = [row.mail, row.userPrincipalName, ...(Array.isArray(row.otherMails) ? row.otherMails : [])];
    requireValue(addresses.some((address) => typeof address === 'string' && hash(address.toLowerCase()) === emailDigest), 'identity-binding-mismatch');
    requireValue(row.userType === 'Member' || ['Accepted', 'PendingAcceptance'].includes(row.externalUserState), 'unsupported-guest-state');
    return row;
  }

  async function resolveIdentity(args) {
    return run(args, 'identity', async (ctx) => {
      const { receipt, read, persist, write } = ctx;
      const email = normalizedEmail(args.email), emailDigest = hash(email);
      requireValue(typeof args.displayName === 'string' && args.displayName.trim().length > 0 && args.displayName.length <= 256
        && !UNSAFE.test(args.displayName) && !/[{}]/u.test(args.displayName));
      requireValue(!receipt.identity || receipt.identity.emailDigest === emailDigest, 'identity-binding-mismatch');
      if (receipt.identity?.state === 'invite-intent') stop('invitation-intent-needs-review');
      let row;
      if (receipt.identity?.userId) {
        const observed = await read(`/users/${receipt.identity.userId}?$select=${USER_FIELDS}`, { allowNotFound: true });
        if (observed === null && receipt.identity.state === 'invited') stop('identity-propagating', 'pending');
        row = verifyUser(observed, emailDigest, receipt.identity.userId, receipt.identity.userType);
      } else {
        const literal = email.replace(/'/gu, "''");
        const query = new URLSearchParams({ '$filter': `mail eq '${literal}' or userPrincipalName eq '${literal}' or otherMails/any(m:m eq '${literal}')`, '$select': USER_FIELDS, '$top': '2' });
        const matches = collection(await read(`/users?${query}`), 2);
        requireValue(matches.length <= 1, 'ambiguous-identity');
        if (matches.length) {
          const candidate = verifyUser(matches[0], emailDigest);
          row = verifyUser(await read(`/users/${candidate.id}?$select=${USER_FIELDS}`, { allowNotFound: true }), emailDigest, candidate.id, candidate.userType);
        }
      }
      if (row?.userType === 'Guest' && row.externalUserState === 'PendingAcceptance'
        && receipt.identity?.state === 'invited' && !receipt.identity.redemptionUrl) stop('invitation-in-progress', 'pending');
      const needsInvitation = !row || (row.userType === 'Guest' && row.externalUserState === 'PendingAcceptance' && !receipt.identity?.redemptionUrl);
      if (needsInvitation) {
        invitationAddress(email);
        const expectedId = row?.id;
        let inProgress = false;
        receipt.identity = { state: 'invite-intent', emailDigest, ...(expectedId ? { userId: expectedId, userType: 'Guest' } : {}) };
        await persist();
        await write('/invitations', { method: 'POST', body: {
          invitedUserEmailAddress: email, invitedUserDisplayName: args.displayName.trim(), invitedUserType: 'Guest',
          inviteRedirectUrl: `https://teams.microsoft.com/?tenantId=${OPDA_TENANT_ID}`, sendInvitationMessage: false, resetRedemption: false,
        } }, (invitation) => {
          requireValue(invitation && GUID.test(invitation.invitedUser?.id ?? '') && (!expectedId || invitation.invitedUser.id === expectedId)
            && invitation.invitedUserEmailAddress?.toLowerCase() === email && invitation.invitedUserType === 'Guest'
            && [undefined, null, false].includes(invitation.sendInvitationMessage) && [undefined, null, false].includes(invitation.resetRedemption)
            && ['PendingAcceptance', 'Completed', 'InProgress'].includes(invitation.status), 'invitation-response-mismatch');
          inProgress = invitation.status === 'InProgress';
          const link = inProgress && invitation.inviteRedeemUrl == null ? undefined : redemptionLink(invitation.inviteRedeemUrl);
          receipt.identity = { state: 'invited', emailDigest, userId: invitation.invitedUser.id, userType: 'Guest', ...(link ? { redemptionUrl: link } : {}) };
        });
        if (inProgress) stop('invitation-in-progress', 'pending');
        const observed = await read(`/users/${receipt.identity.userId}?$select=${USER_FIELDS}`, { allowNotFound: true });
        if (observed === null) stop('identity-propagating', 'pending');
        row = verifyUser(observed, emailDigest, receipt.identity.userId, 'Guest');
      }
      const redemptionRequired = row.userType === 'Guest' && row.externalUserState === 'PendingAcceptance';
      const identity = { state: 'bound', emailDigest, userId: row.id, userType: row.userType,
        loginName: `i:0#.f|membership|${row.userPrincipalName}`, ...(redemptionRequired ? { redemptionUrl: redemptionLink(receipt.identity?.redemptionUrl) } : {}) };
      if (JSON.stringify(receipt.identity) !== JSON.stringify(identity)) { receipt.identity = identity; await persist(); }
      return { status: 'ready', userId: row.id, loginName: identity.loginName, redemptionRequired,
        ...(redemptionRequired ? { redemptionUrl: identity.redemptionUrl } : {}) };
    });
  }

  function membershipInput(ctx, revoking = false) {
    const { args, receipt } = ctx;
    requireValue(APPROVAL_GROUP_IDS.includes(args.groupId) && typeof args.userId === 'string' && GUID.test(args.userId)
      && receipt.identity?.userId === args.userId && (revoking || receipt.identity.state === 'bound'), 'invalid-membership-binding');
    return { teamId: teams[args.groupId], userId: args.userId, prior: receipt.memberships[teams[args.groupId]] };
  }

  async function membershipView(ctx, teamId, userId) {
    const team = await ctx.read(`/teams/${teamId}?$select=id,visibility,isArchived`);
    requireValue(team?.id === teamId && team.visibility === 'private' && team.isArchived === false, 'workspace-not-private-ready');
    const owners = collection(await ctx.read(`/groups/${teamId}/owners`), 100);
    requireValue(owners.length > 0 && owners.every((owner) => GUID.test(owner?.id ?? '')), 'owner-baseline-unverified');
    if (owners.some((owner) => owner.id === userId)) stop('owner-membership-retained');
    // Typed single-member GET is supported by the current Graph SDK contract.
    const group = await ctx.read(`/groups/${teamId}/members/${userId}/graph.user?$select=id`, { allowNotFound: true });
    requireValue(group === null || group?.id === userId, 'group-membership-mismatch');
    const query = new URLSearchParams({ '$filter': `(microsoft.graph.aadUserConversationMember/userId eq '${userId}')` });
    const members = collection(await ctx.read(`/teams/${teamId}/members?${query}`), 2);
    requireValue(members.length <= 1 && members.every((member) => member.userId === userId && typeof member.id === 'string' && member.id.length > 0
      && Array.isArray(member.roles) && member.roles.every((role) => ['guest', 'owner'].includes(role))), 'team-membership-mismatch');
    if (members.some((member) => member.roles.includes('owner'))) stop('owner-membership-retained');
    return { group: group !== null, team: members.length === 1 };
  }

  async function ensureMembership(args) {
    return run(args, 'membership', async (ctx) => {
      const { teamId, userId, prior } = membershipInput(ctx);
      if (['grant-intent', 'remove-intent'].includes(prior?.state)) stop('membership-intent-needs-review');
      verifyUser(await ctx.read(`/users/${userId}?$select=${USER_FIELDS}`, { allowNotFound: true }), ctx.receipt.identity.emailDigest, userId, ctx.receipt.identity.userType);
      let view = await membershipView(ctx, teamId, userId);
      if (prior?.state === 'granted') return view.group && view.team ? { status: 'ready', ownership: 'owned' } : { status: 'pending', reason: 'teams-sync-pending' };
      if (view.group || (view.team && prior?.state !== 'removed')) {
        ctx.receipt.memberships[teamId] = { groupId: args.groupId, userId, ownership: 'manual', state: 'retained' };
        await ctx.persist();
        return view.group && view.team ? { status: 'ready', ownership: 'manual', retained: true }
          : { status: view.group ? 'pending' : 'manual-review', reason: view.group ? 'teams-sync-pending' : 'team-only-membership-retained', retained: true };
      }
      ctx.receipt.memberships[teamId] = { groupId: args.groupId, userId, ownership: 'unknown', state: 'grant-intent' };
      await ctx.persist();
      await ctx.write(`/groups/${teamId}/members/$ref`, { method: 'POST', body: { '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${userId}` } }, (ack) => {
        requireValue(ack === null, 'mutation-acknowledgement-invalid');
        ctx.receipt.memberships[teamId] = { groupId: args.groupId, userId, ownership: 'owned', state: 'granted' };
      });
      view = await membershipView(ctx, teamId, userId);
      return view.group && view.team ? { status: 'ready', ownership: 'owned' } : { status: 'pending', reason: 'teams-sync-pending' };
    });
  }

  async function revokeMembership(args) {
    return run(args, 'membership', async (ctx) => {
      const { teamId, userId, prior } = membershipInput(ctx, true);
      if (['grant-intent', 'remove-intent'].includes(prior?.state)) stop('membership-intent-needs-review');
      let view = await membershipView(ctx, teamId, userId);
      if (!view.group && !view.team) {
        if (prior?.ownership === 'owned' && prior.state !== 'removed') {
          ctx.receipt.memberships[teamId] = { ...prior, state: 'removed' };
          await ctx.persist();
        }
        return { status: 'ready', removed: true };
      }
      if (prior?.ownership !== 'owned') return { status: 'manual-review', reason: 'manual-membership-retained', retained: true };
      if (prior.state === 'removed' || !view.group) return { status: 'pending', reason: 'teams-removal-pending' };
      ctx.receipt.memberships[teamId] = { ...prior, state: 'remove-intent' };
      await ctx.persist();
      await ctx.write(`/groups/${teamId}/members/${userId}/$ref`, { method: 'DELETE' }, (ack) => {
        requireValue(ack === null, 'mutation-acknowledgement-invalid');
        ctx.receipt.memberships[teamId] = { ...prior, state: 'removed' };
      });
      view = await membershipView(ctx, teamId, userId);
      return !view.group && !view.team ? { status: 'ready', removed: true } : { status: 'pending', reason: 'teams-removal-pending' };
    });
  }

  return Object.freeze({ resolveIdentity, ensureMembership, revokeMembership });
}

export const CreateGraphAdapter = createGraphAdapter;
