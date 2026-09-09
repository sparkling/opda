import test from 'node:test';
import assert from 'node:assert/strict';
import { createOnboardingWorker } from '../src/approval-onboarding/worker.mjs';
import { APPROVAL_GROUP_IDS } from '../src/approval-onboarding/invitation.mjs';
import { WORKSPACES, INVITATION_REGISTRY, TEMPLATE_PIN } from '../src/approval-onboarding/settings.mjs';

const ID = 'a'.repeat(64), OTHER = 'b'.repeat(64);
const USER = '00000000-0000-4000-8000-000000000123';
const CANARY = '388c735eec8225c4ad7a507944dd0a975296baea383198aa87177f29af2c6f69';
const copy = value => structuredClone(value);

function harness({ action = 'provision', enabled = true, canaryEmailHash = '', groups = APPROVAL_GROUP_IDS,
  email = 'test@example.org', domainId, notifyWithdrawal = false, websiteNotice = false } = {}) {
  const context = { operation: { operationId: ID, action, ...(domainId ? { schemaVersion: 2, domainId } : {}) }, account: { email, name: 'Test Participant' },
    audit: { onboarding: { snapshotStatus: action === 'provision' ? 'approved' : 'denied',
      groups: action === 'provision' ? [...groups] : [], templateVersion: domainId ? 2 : 1, notifyWithdrawal } },
    receipts: { graph: {}, sharepoint: {}, mail: {} } };
  if (websiteNotice) {
    context.operation = { operationId: ID, action: 'revoke', schemaVersion: 3, noticeKind: 'website-disabled', accessVersion: 2 };
    context.binding = { providerAccessVersion: 2 };
  }
  const state = { current: true, eligible: true, terminal: false, finishAccepted: true,
    context, calls: [], finishes: [], sends: 0, released: 0, saved: [] };
  const store = {
    async claim(id) { assert.equal(id, ID); return state.terminal ? null : context; },
    async guard(ctx, { requireEligible }) { assert.equal(ctx, context); return state.current && (!requireEligible || state.eligible); },
    async saveReceipts(ctx, receipts, options) {
      if (options?.requireEligible && (!state.current || !state.eligible)) return false;
      state.saved.push({ receipts: copy(receipts), options }); ctx.receipts = copy(receipts); return true;
    },
    async finish(ctx, result) {
      if (!state.finishAccepted) return false;
      state.finishes.push(result); state.terminal = result.status !== 'pending'; return true;
    },
    async release() { state.released++; return true; },
  };
  const graph = {
    async resolveIdentity(args) {
      state.calls.push('identity'); state.initialGraphReceipt = args.receipt;
      await args.persistReceipt({ schemaVersion: 1, identity: { userId: USER }, memberships: args.receipt?.memberships ?? {} });
      return { status: 'ready', userId: USER, loginName: 'i:0#.f|membership|test@example.org', redemptionRequired: false };
    },
    async ensureMembership(args) {
      state.calls.push(`team:${args.groupId}`);
      const receipt = copy(context.receipts.graph);
      receipt.memberships[WORKSPACES[args.groupId].teamId] = { groupId: args.groupId, userId: USER, ownership: 'owned', state: 'granted' };
      await args.persistReceipt(receipt); return { status: 'ready' };
    },
    async revokeMembership(args) {
      state.calls.push(`remove-team:${args.groupId}`); assert.equal(args.userId, USER);
      const receipt = copy(context.receipts.graph);
      receipt.memberships[WORKSPACES[args.groupId].teamId].state = 'removed';
      await args.persistReceipt(receipt); return { status: 'ready' };
    },
  };
  const sharepoint = {
    async ensure(args) {
      state.calls.push(`source:${args.groupId}`);
      await args.persistReceipt({ groupId: args.groupId, owned: true });
      return { status: 'ready', permissionsVerified: true, folderUrl: `${WORKSPACES[args.groupId].siteUrl}/Incoming%20Source%20Material/By%20Organisation/example.org` };
    },
    async revoke(args) { state.calls.push(`remove-source:${args.groupId}`); await args.persistReceipt({ ...args.receipt, removed: true }); return { status: 'ready' }; },
  };
  const postmark = {
    async send(args) {
      state.sentInput = copy(args.input);
      assert.equal(await args.beforeSend(), true);
      assert.equal(context.receipts.mail[ID].status, 'attempting');
      assert.deepEqual(state.saved.at(-1).options, args.kind ? { requireNotice: true } : { requireEligible: true });
      if (args.kind) state.calls.push(`notice:${args.kind}`);
      state.sends++; return { status: 'accepted', attempted: true, messageId: 'ack' };
    },
    async reconcile() { state.calls.push('reconcile'); return { status: 'unknown', attempted: false }; },
  };
  const worker = createOnboardingWorker({ store, graph, sharepoint, postmark, enabled, canaryEmailHash, now: () => 1000,
    workspaces: WORKSPACES, invitationRegistry: INVITATION_REGISTRY, templatePin: TEMPLATE_PIN,
    templatePins: domainId ? { [domainId]: { ...TEMPLATE_PIN, version: 2 } } : {},
    noticePins: { website: TEMPLATE_PIN, groups: Object.fromEntries(APPROVAL_GROUP_IDS.map(id => [id, TEMPLATE_PIN])) }, logoBase64: 'test' });
  return { state, context, store, graph, sharepoint, postmark, worker };
}

function ownedAccess(h, ids = APPROVAL_GROUP_IDS) {
  h.context.receipts.graph = { schemaVersion: 1, identity: { userId: USER }, memberships: {} };
  for (const id of ids) {
    h.context.receipts.graph.memberships[WORKSPACES[id].teamId] = { groupId: id, userId: USER, ownership: 'owned', state: 'granted' };
    h.context.receipts.sharepoint[id] = { groupId: id, owned: true };
  }
}

test('all frozen selected groups become verified access before one guarded invitation', async () => {
  const h = harness();
  assert.deepEqual(await h.worker.process(ID), { status: 'complete', stage: 'invitation-accepted' });
  assert.equal(h.state.initialGraphReceipt, undefined);
  assert.equal(h.state.sends, 1); assert.equal(h.state.released, 1);
  assert.deepEqual(h.state.sentInput.groups.map(group => group.groupId), APPROVAL_GROUP_IDS);
  assert.ok(h.state.sentInput.groups.every(group => group.teamMembershipVerified && group.sourceAccess.permissionsVerified));
  assert.deepEqual(await h.worker.process(ID), { status: 'skipped' }); assert.equal(h.state.sends, 1);
});

test('individual approval provisions and emails only its domain without removing another domain', async () => {
  const h = harness({ domainId: 'conveyancing', groups: ['conveyancing'] });
  ownedAccess(h, ['finance-and-banking']);
  const retained = copy(h.context.receipts.graph.memberships[WORKSPACES['finance-and-banking'].teamId]);
  assert.deepEqual(await h.worker.process(ID), { status: 'complete', stage: 'invitation-accepted' });
  assert.deepEqual(h.state.sentInput.groups.map(group => group.groupId), ['conveyancing']);
  assert.equal(h.context.receipts.mail[ID].domainId, 'conveyancing');
  assert.deepEqual(h.context.receipts.graph.memberships[WORKSPACES['finance-and-banking'].teamId], retained);
  assert.equal(h.state.calls.some(call => call.startsWith('remove-')), false);
});
test('individual withdrawal only cancels that domain mail and removes its own Microsoft grants', async () => {
  const h = harness({ domainId: 'conveyancing', action: 'revoke' });
  ownedAccess(h, ['finance-and-banking', 'conveyancing']);
  h.context.receipts.mail[OTHER] = { domainId: 'finance-and-banking', status: 'pending' };
  h.context.receipts.mail[ID] = { domainId: 'conveyancing', status: 'pending' };
  assert.deepEqual(await h.worker.process(ID), { status: 'complete', stage: 'withdrawn' });
  assert.deepEqual(h.state.calls, ['remove-source:conveyancing', 'remove-team:conveyancing']);
  assert.equal(h.context.receipts.mail[OTHER].status, 'pending');
  assert.equal(h.context.receipts.mail[ID].status, 'cancelled'); assert.equal(h.state.sends, 0);
});
test('a domain job can never dispatch a combined or different-domain invitation', async () => {
  for (const groups of [['finance-and-banking'], ['conveyancing', 'finance-and-banking']]) {
    const h = harness({ domainId: 'conveyancing', groups });
    assert.equal((await h.worker.process(ID)).stage, 'eligibility-unavailable');
    assert.equal(h.state.sends, 0); assert.deepEqual(h.state.calls, []);
  }
});

test('new group withdrawal sends one notice after scoped removal, preserving other groups', async () => {
  const h = harness({ action: 'revoke', domainId: 'conveyancing', notifyWithdrawal: true });
  ownedAccess(h, ['conveyancing', 'property-technology']);
  assert.equal((await h.worker.process(ID)).status, 'complete');
  assert.deepEqual(h.state.calls, ['remove-source:conveyancing', 'remove-team:conveyancing', 'notice:group-withdrawn']);
  assert.equal(h.state.sends, 1);
  assert.equal(h.context.receipts.mail[ID].kind, 'group-withdrawn');
  assert.equal(h.context.receipts.graph.memberships[WORKSPACES['property-technology'].teamId].state, 'granted');
  assert.equal((await h.worker.process(ID)).status, 'skipped'); assert.equal(h.state.sends, 1);
});
test('group notice waits for actual removal, while website notice does not run any Microsoft effects', async () => {
  const group = harness({ action: 'revoke', domainId: 'conveyancing', notifyWithdrawal: true }); ownedAccess(group, ['conveyancing']);
  group.graph.revokeMembership = async () => ({ status: 'pending' });
  assert.equal((await group.worker.process(ID)).stage, 'withdrawal-propagating'); assert.equal(group.state.sends, 0);
  const website = harness({ action: 'revoke', websiteNotice: true }); ownedAccess(website);
  assert.equal((await website.worker.process(ID)).status, 'complete');
  assert.deepEqual(website.state.calls, ['notice:website-disabled']); assert.equal(website.state.sends, 1);
});

test('activation gate leaves new provisioning pending without any provider effect', async () => {
  const h = harness({ enabled: false });
  assert.deepEqual(await h.worker.process(ID), { status: 'pending', stage: 'awaiting-activation' });
  assert.deepEqual(h.state.calls, []); assert.equal(h.state.sends, 0);
});

test('matching recipient canary provisions while global activation remains disabled', async () => {
  const h = harness({ enabled: false, canaryEmailHash: CANARY, email: ' Test@Example.ORG ' });
  assert.deepEqual(await h.worker.process(ID), { status: 'complete', stage: 'invitation-accepted' });
  assert.equal(h.state.sends, 1); assert.ok(h.state.calls.includes('identity'));
});

test('missing or non-matching recipient canary causes zero provider effects while disabled', async () => {
  for (const canaryEmailHash of ['', 'f'.repeat(64)]) {
    const h = harness({ enabled: false, canaryEmailHash });
    assert.deepEqual(await h.worker.process(ID), { status: 'pending', stage: 'awaiting-activation' });
    assert.deepEqual(h.state.calls, []); assert.equal(h.state.sends, 0);
  }
});

test('matching recipient canary cannot bypass stale or ineligible approval guards', async () => {
  for (const state of ['stale', 'ineligible']) {
    const h = harness({ enabled: false, canaryEmailHash: CANARY });
    h.state[state === 'stale' ? 'current' : 'eligible'] = false;
    assert.deepEqual(await h.worker.process(ID), { status: 'cancelled', stage: state === 'stale' ? 'superseded' : 'eligibility-unavailable' });
    assert.deepEqual(h.state.calls, []); assert.equal(h.state.sends, 0);
  }
});

test('malformed recipient canary configuration fails closed', () => {
  for (const canaryEmailHash of ['A'.repeat(64), 'a'.repeat(63), 'test@example.org']) {
    assert.throws(() => harness({ enabled: false, canaryEmailHash }), /canary/i);
  }
});

test('withdrawal runs while activation and a different recipient canary are disabled and retains source material', async () => {
  const h = harness({ action: 'revoke', enabled: false, canaryEmailHash: 'f'.repeat(64) }); ownedAccess(h);
  h.context.account = null;
  h.context.receipts.mail[OTHER] = { status: 'pending' };
  h.context.receipts.mail[ID] = { status: 'unknown' };
  assert.deepEqual(await h.worker.process(ID), { status: 'complete', stage: 'withdrawn' });
  assert.equal(h.context.receipts.mail[OTHER].status, 'cancelled');
  assert.equal(h.context.receipts.mail[ID].cancellationRequestedAt, 1000);
  assert.equal(h.state.sends, 0);
  assert.equal(h.state.calls.length, 12);
  assert.ok(h.state.calls.slice(0, 6).every(call => call.startsWith('remove-source:')));
  assert.ok(h.state.calls.slice(6).every(call => call.startsWith('remove-team:')));
});

test('Microsoft removal propagation remains durable pending instead of exhausting retries', async () => {
  const h = harness({ action: 'revoke' }); ownedAccess(h, [APPROVAL_GROUP_IDS[0]]);
  h.graph.revokeMembership = async () => ({ status: 'pending' });
  assert.deepEqual(await h.worker.process(ID), { status: 'pending', stage: 'withdrawal-propagating' });
  assert.equal(h.state.terminal, false); assert.equal(h.state.sends, 0);
});

test('manual or ambiguous grants require review while other owned grants are removed', async () => {
  const h = harness({ action: 'revoke' }); ownedAccess(h);
  h.sharepoint.revoke = async args => { h.state.calls.push(`remove-source:${args.groupId}`); return { status: 'manual-review' }; };
  const result = await h.worker.process(ID);
  assert.equal(result.status, 'attention'); assert.equal(result.stage, 'withdrawal-review');
  assert.equal(h.state.calls.filter(call => call.startsWith('remove-team:')).length, 6);
});

test('superseded jobs do not undo a newer approval or send invitations', async () => {
  for (const action of ['provision', 'revoke']) {
    const h = harness({ action }); ownedAccess(h); h.state.current = false;
    assert.deepEqual(await h.worker.process(ID), { status: 'cancelled', stage: 'superseded' });
    assert.deepEqual(h.state.calls, []); assert.equal(h.state.sends, 0);
  }
});

test('revised group selection removes former owned grants before preparing selected groups', async () => {
  const h = harness({ groups: [APPROVAL_GROUP_IDS[1]] }); ownedAccess(h, [APPROVAL_GROUP_IDS[0]]);
  assert.equal((await h.worker.process(ID)).status, 'complete');
  assert.deepEqual(h.state.calls.slice(0, 3), [`remove-source:${APPROVAL_GROUP_IDS[0]}`, `remove-team:${APPROVAL_GROUP_IDS[0]}`, 'identity']);
  assert.deepEqual(h.state.sentInput.groups.map(group => group.groupId), [APPROVAL_GROUP_IDS[1]]);
});

test('unverified Team membership holds the entire combined invitation', async () => {
  const h = harness(); h.graph.ensureMembership = async () => ({ status: 'pending' });
  assert.deepEqual(await h.worker.process(ID), { status: 'pending', stage: 'microsoft-propagating' });
  assert.equal(h.state.sends, 0);
});

test('a Team security-boundary failure does not grant SharePoint access for that group', async () => {
  const h = harness({ groups: [APPROVAL_GROUP_IDS[0]] });
  h.graph.ensureMembership = async () => ({ status: 'manual-review' });
  assert.deepEqual(await h.worker.process(ID), { status: 'attention', stage: 'microsoft-access-review' });
  assert.ok(!h.state.calls.some(call => call.startsWith('source:'))); assert.equal(h.state.sends, 0);
});

test('generic email providers get verified Teams-only invitations, no company folders', async () => {
  const h = harness({ email: 'test@gmail.com' });
  assert.equal((await h.worker.process(ID)).status, 'complete');
  assert.ok(!h.state.calls.some(call => call.startsWith('source:')));
  assert.ok(h.state.sentInput.groups.every(group => group.sourceAccess.status === 'teams_only'));
});

test('acknowledged membership is retained in the ledger when withdrawal races it', async () => {
  const h = harness({ groups: [APPROVAL_GROUP_IDS[0]] }), ensure = h.graph.ensureMembership;
  h.graph.ensureMembership = async args => { const result = await ensure(args); h.state.current = false; return result; };
  h.sharepoint.ensure = async args => { assert.equal(await args.guard(), false); return { status: 'pending' }; };
  assert.deepEqual(await h.worker.process(ID), { status: 'cancelled', stage: 'superseded' });
  assert.equal(h.context.receipts.graph.memberships[WORKSPACES[APPROVAL_GROUP_IDS[0]].teamId].ownership, 'owned');
  assert.equal(h.state.sends, 0);
});

test('withdrawal at the last send boundary prevents dispatch', async () => {
  const h = harness();
  h.postmark.send = async args => {
    h.state.current = false; assert.equal(await args.beforeSend(), false);
    return { status: 'failed', attempted: false, reason: 'stale-or-cancelled' };
  };
  assert.equal((await h.worker.process(ID)).status, 'cancelled');
  assert.equal(h.context.receipts.mail[ID], undefined); assert.equal(h.state.sends, 0);
});

test('an ambiguous attempted send is never automatically resent', async () => {
  const h = harness();
  h.context.receipts.mail[ID] = { status: 'attempting', fingerprint: TEMPLATE_PIN.fingerprint };
  assert.deepEqual(await h.worker.process(ID), { status: 'attention', stage: 'invitation-outcome-unknown' });
  assert.equal(h.state.sends, 0); assert.ok(h.state.calls.includes('reconcile'));
});

test('accepted reconciliation is saved even if withdrawal races the provider read', async () => {
  const h = harness();
  h.context.receipts.mail[ID] = { status: 'unknown', fingerprint: TEMPLATE_PIN.fingerprint };
  h.postmark.reconcile = async () => { h.state.current = false; return { status: 'accepted', messageId: 'ack' }; };
  assert.equal((await h.worker.process(ID)).status, 'cancelled');
  assert.equal(h.context.receipts.mail[ID].status, 'accepted'); assert.equal(h.state.sends, 0);
});

test('temporary guard outages never cancel the durable operation', async () => {
  const h = harness(); h.store.guard = async () => { throw new Error('private provider details'); };
  await assert.rejects(h.worker.process(ID), { message: 'Onboarding effects incomplete' });
  assert.deepEqual(h.state.finishes, []); assert.equal(h.state.released, 1);
});

test('lost finish CAS never reports completed work', async () => {
  const h = harness(); h.state.finishAccepted = false;
  await assert.rejects(h.worker.process(ID), { message: 'Onboarding effects incomplete' });
  assert.deepEqual(h.state.finishes, []); assert.equal(h.state.released, 1);
});

test('provider exceptions are sanitized and remain pending for retry', async () => {
  const h = harness(); h.graph.resolveIdentity = async () => { throw new Error('redemption secret'); };
  await assert.rejects(h.worker.process(ID), { message: 'Onboarding effects incomplete' });
  assert.deepEqual(h.state.finishes, [{ status: 'pending', stage: 'retry-required' }]);
});

test('SharePoint policy failures require attention without suppressing remaining withdrawal', async () => {
  const h = harness({ action: 'revoke' }); ownedAccess(h);
  h.sharepoint.revoke = async () => { throw Object.assign(new Error('private details'), { code: 'sharepoint-unexpected-acl', status: 'manual-review' }); };
  assert.equal((await h.worker.process(ID)).status, 'attention');
  assert.equal(h.state.calls.filter(call => call.startsWith('remove-team:')).length, 6);
});

test('SharePoint read outages remain pending while other withdrawal effects proceed', async () => {
  const h = harness({ action: 'revoke' }); ownedAccess(h);
  h.context.receipts.mail[ID] = { status: 'prepared' };
  h.sharepoint.revoke = async () => {
    assert.equal(h.context.receipts.mail[ID].status, 'cancelled');
    throw Object.assign(new Error('private details'), { code: 'sharepoint-read-failed', status: 'pending' });
  };
  assert.equal((await h.worker.process(ID)).status, 'pending');
  assert.equal(h.state.calls.filter(call => call.startsWith('remove-team:')).length, 6);
});

test('a failed preflight can retry only when no send was attempted or claimed', async () => {
  const h = harness();
  h.postmark.send = async () => ({ status: 'failed', attempted: false, reason: 'suppression-check-unavailable' });
  assert.deepEqual(await h.worker.process(ID), { status: 'pending', stage: 'invitation-preflight-pending' });
  assert.equal(h.context.receipts.mail[ID], undefined);
});

test('only opaque operation references are accepted', async () => {
  const h = harness();
  for (const id of [null, '', 'test@example.org', ID + 'x']) await assert.rejects(h.worker.process(id), TypeError);
  assert.deepEqual(h.state.calls, []);
});
