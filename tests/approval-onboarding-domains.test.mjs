import assert from 'node:assert/strict';
import test from 'node:test';
import { planDomainApprovals, DOMAIN_POLICY } from '../config/aws/hubspot-approval/domain-onboarding.mjs';
import { digest } from '../config/aws/hubspot-approval/domain.mjs';
import { APPROVAL } from '../config/aws/hubspot-participation/import.mjs';

const now = Date.parse('2026-09-09T15:00:00Z'), cutover = now - 10000;
const base = () => ({ map: { pk: 'CRM#CONTACT#123', contactId: '123', participantId: 'participant',
  cognitoSub: 'sub', email: 'synthetic@example.test', revision: 1 },
row: { pk: 'USER#sub', participantId: 'participant', cognitoSub: 'sub', email: 'synthetic@example.test',
  active: false, reviewStatus: 'received', suspended: false, enrolmentStatus: 'not_invited', accessVersion: 1 } });
const decision = (domainId, status = 'approved', at = now - 1000) => ({ domainId, status, at, actor: '42', trusted: true,
  id: digest(`${domainId}:${status}:${at}`), reason: 'hubspot-manual-domain-review',
  ...(status === 'approved' ? { groupSnapshot: { snapshotStatus: 'approved', groups: [domainId],
    groupDigest: digest(JSON.stringify([domainId])), groupsAt: cutover - 1000 } } : {}) });
function run(input, decisions, extra = {}) { return planDomainApprovals({ ...input, decisions, now, cutover, ...extra }); }
const next = (input, plan) => ({ map: { ...input.map, ...plan.mapFields }, row: { ...input.row, ...plan.fields } });

test('two independent approvals create two one-domain invitations, never a combined operation', () => {
  const plan = run(base(), [decision('conveyancing'), decision('finance-and-banking')]);
  assert.equal(plan.fields.active, true); assert.equal(plan.fields.accessVersion, 2);
  assert.equal(plan.operations.length, 2); assert.equal(new Set(plan.operations.map(op => op.operationId)).size, 2);
  for (const op of plan.operations) {
    assert.equal(op.schemaVersion, 2); assert.equal(op.domainVersion, 1);
    const audit = plan.audits.find(row => row.pk === op.auditKey);
    assert.deepEqual(audit.onboarding.groups, [op.domainId]); assert.equal(audit.onboarding.templateVersion, 2);
  }
});
test('withdrawing one domain retains the other approval and website access without session churn', () => {
  const initial = base(), approved = run(initial, [decision('conveyancing'), decision('finance-and-banking')]);
  const state = next(initial, approved), retained = state.row.domainApprovals['finance-and-banking'];
  const withdrawn = run(state, [decision('conveyancing', 'withdrawn', now)]);
  assert.equal(withdrawn.fields.active, true); assert.equal(withdrawn.fields.accessVersion, 2);
  assert.deepEqual(withdrawn.fields.approvedDomains, ['finance-and-banking']);
  assert.deepEqual(withdrawn.fields.domainApprovals['finance-and-banking'], retained);
  assert.equal(withdrawn.operations.length, 1); assert.equal(withdrawn.operations[0].domainId, 'conveyancing');
  assert.equal(withdrawn.operations[0].action, 'revoke');
  const final = run(next(state, withdrawn), [decision('finance-and-banking', 'withdrawn', now)]);
  assert.equal(final.fields.active, false); assert.equal(final.fields.accessVersion, 3);
});
test('later domain approval does not supersede another domain pending invitation', () => {
  const initial = base(), first = run(initial, [decision('conveyancing')]);
  const later = run(next(initial, first), [decision('finance-and-banking', 'approved', now)]);
  assert.deepEqual(later.fields.domainApprovals.conveyancing.onboarding, first.fields.domainApprovals.conveyancing.onboarding);
  assert.equal(later.operations.length, 1); assert.equal(later.fields.accessVersion, first.fields.accessVersion);
});
test('replayed/older approvals and re-confirming an unchanged approval never resend', () => {
  const initial = base(), d = decision('conveyancing'), first = run(initial, [d]), state = next(initial, first);
  assert.equal(run(state, [d]).changed, false);
  assert.equal(run(state, [decision('conveyancing', 'approved', now - 2000)]).changed, false);
  assert.equal(run(state, [decision('conveyancing', 'approved', now)]).operations.length, 0);
  const withdrawn = run(state, [decision('conveyancing', 'withdrawn', now)]);
  const again = run(next(state, withdrawn), [decision('conveyancing', 'approved', now + 1)]);
  assert.equal(again.operations.length, 1); assert.notEqual(again.operations[0].operationId, first.operations[0].operationId);
});
test('interests, untrusted edits and global Approved never create domain grants', () => {
  assert.equal(run(base(), [], { globalDecision: { ...decision('conveyancing'), domainId: undefined } }).fields.active, false);
  for (const patch of [{ trusted: false }, { groupSnapshot: undefined }, { groupSnapshot: {
    snapshotStatus: 'approved', groups: ['conveyancing', 'finance-and-banking'], groupsAt: cutover } }]) {
    const result = run(base(), [{ ...decision('conveyancing'), ...patch }]);
    assert.equal(result.fields.active, false); assert.equal(result.operations.length, 0);
  }
});
test('current global withdrawal overrides per-domain approvals and requires fresh evidence after clearing the hold', () => {
  const initial = base(), first = run(initial, [decision('conveyancing'), decision('finance-and-banking')]);
  const globalDecision = { ...decision('global', 'withdrawn', now), id: digest('global-withdrawal') };
  const denied = run(next(initial, first), [], { globalDecision });
  assert.equal(denied.operations.length, 2); assert.equal(denied.fields.active, false);
  const state = next(next(initial, first), denied);
  assert.equal(run(state, [decision('conveyancing', 'approved', now + 10)], { globalDecision }).fields.active, false);
  const cleared = { ...globalDecision, status: 'approved', id: digest('global-clear'), at: now + 5 };
  assert.equal(run(state, [decision('conveyancing')], { globalDecision: cleared }).fields.active, false);
  assert.equal(run(state, [decision('conveyancing', 'approved', now + 10)], { globalDecision: cleared }).fields.active, true);
});
test('historical website-only import is retained but never receives domain invitations', () => {
  const input = base(); input.map.imported = true;
  Object.assign(input.row, { active: true, reviewStatus: 'approved', approvalId: APPROVAL.id });
  const plan = run(input, []);
  assert.equal(plan.fields.legacyWebsiteApproved, true); assert.equal(plan.fields.active, true);
  assert.deepEqual(plan.fields.approvedDomains, []); assert.equal(plan.operations.length, 0);
  assert.equal(plan.fields.approvalPolicy, DOMAIN_POLICY);
});
test('migration preserves only explicitly frozen completed approval scopes and does not resend', () => {
  const input = base(), onboarding = { action: 'provision', snapshotStatus: 'approved', decisionAt: cutover - 1,
    decisionId: digest('old-review'), actor: '42', groups: ['conveyancing'], groupDigest: digest('["conveyancing"]') };
  Object.assign(input.row, { active: true, reviewStatus: 'approved', onboarding }); input.map.onboarding = onboarding;
  input.row.profile = { opda_requested_working_groups: 'conveyancing;finance-and-banking' };
  const plan = run(input, []);
  assert.deepEqual(plan.fields.approvedDomains, ['conveyancing']); assert.equal(plan.operations.length, 0);
  assert.equal(plan.fields.legacyWebsiteApproved, false);
});

test('a new occurrence of the same hold cannot replay the approval that cleared the earlier occurrence', () => {
  const initial = base(), approved = run(initial, [decision('conveyancing')]);
  const firstHold = run(next(initial, approved), [], { holdReason: 'contact-unavailable' });
  const held = next(next(initial, approved), firstHold);
  const fresh = decision('conveyancing', 'approved', now + 1000);
  const recovered = run(held, [fresh], { now: now + 2000 });
  assert.equal(recovered.fields.active, true);
  assert.equal(recovered.mapFields.holdReason, '');
  const restored = next(held, recovered);
  const secondHold = run(restored, [], { now: now + 3000, holdReason: 'contact-unavailable' });
  assert.equal(secondHold.mapFields.domainHoldAt, now + 3000);
  const replay = run(next(restored, secondHold), [fresh], { now: now + 4000 });
  assert.equal(replay.fields.active, false);
  assert.equal(replay.operations.length, 0);
});

test('a continuous hold has a stable timestamp and invalidates provider effects only once', () => {
  const initial = base();
  const first = run(initial, [], { holdReason: 'contact-unavailable' });
  assert.equal(first.changed, true);
  assert.equal(first.mapFields.providerAccessVersion, null);
  const state = next(initial, first);
  state.map.providerAccessVersion = state.row.accessVersion;
  const repeat = run(state, [], { now: now + 1000, holdReason: 'contact-unavailable' });
  assert.equal(repeat.changed, false);
  assert.equal(repeat.mapFields.domainHoldAt, now);
  assert.equal(Object.hasOwn(repeat.mapFields, 'providerAccessVersion'), false);
});
