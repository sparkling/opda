import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorker } from '../config/aws/hubspot-approval/index.mjs';
import { DOMAIN_POLICY, planDomainApprovals } from '../config/aws/hubspot-approval/domain-onboarding.mjs';
import { DOMAIN_REVIEW_PROPERTIES } from '../config/aws/hubspot-participation/properties.mjs';
import { corroborate, createTeamsDecisionSource, mirroredReview, teamsDecisionId } from '../config/aws/teams-approvals/decisions.mjs';
import { reviewKey } from '../config/aws/teams-approvals/store.mjs';

const NOW = Date.parse('2026-09-16T12:00:00Z'), CUTOVER = NOW - 600000;
const A = 'finance-and-banking', B = 'conveyancing';
const APPROVER = '7eaf4499-4442-4133-b685-ca6197084f79';
const DECIDED_AT = NOW - 5000, MIRRORED_AT = NOW - 4000;
const entry = (value, at, patch = {}) => ({ value, timestamp: new Date(at).toISOString(),
  sourceType: 'CRM_UI', sourceId: 'userId:42', updatedByUserId: 42, ...patch });
const integration = (value, at) => entry(value, at, { sourceType: 'INTEGRATION', sourceId: 'app:52397854', updatedByUserId: null });

function contact(history = { [A]: [integration('approved', MIRRORED_AT)] }) {
  const result = { id: '123', properties: { email: 'synthetic@example.test', firstname: 'Synthetic', lastname: 'Example',
    opda_requested_working_groups: `${A};${B}`, opda_active: 'false', opda_enrolment_status: 'not_invited' },
  propertiesWithHistory: { email: [entry('synthetic@example.test', NOW - 90000)],
    opda_requested_working_groups: [entry(`${A};${B}`, NOW - 80000)] } };
  for (const [id, items] of Object.entries(history)) {
    result.properties[DOMAIN_REVIEW_PROPERTIES[id]] = items[0].value;
    result.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[id]] = items;
  }
  return result;
}
function record(patch = {}) {
  const fields = { contactId: '123', domainId: A, status: 'approved', at: DECIDED_AT, actorObjectId: APPROVER, messageId: '100', ...patch };
  return { pk: reviewKey('123', A), ...fields, decisionId: teamsDecisionId(fields), actorName: 'Ada Reviewer',
    conversationId: '19:chan', registrationId: '00000000-0000-4000-8000-000000000001', mirroredAt: MIRRORED_AT, revision: 2 };
}

function fixture({ crm = contact(), records = [record()] } = {}) {
  const calls = [], reads = [], items = new Map(records.map(item => [item.pk, item]));
  let row = { pk: 'USER#sub', participantId: 'pid', cognitoSub: 'sub', email: 'synthetic@example.test', name: 'Synthetic Example',
    hubspotContactId: '123', hubspotPortalId: 144765514, active: false, suspended: false, reviewStatus: 'received',
    enrolmentStatus: 'not_invited', accessVersion: 1, approvalPolicy: DOMAIN_POLICY, domainApprovals: {}, legacyWebsiteApproved: false };
  let binding = { pk: 'CRM#CONTACT#123', contactId: '123', participantId: 'pid', email: row.email, cognitoSub: 'sub', revision: 1,
    approvalPolicy: DOMAIN_POLICY, domainApprovals: {} };
  const store = {
    binding: async () => binding, account: async () => row,
    applyDomains: async (map, before, decisions, now, options) => {
      calls.push(['apply', decisions.map(d => [d.domainId, d.status, d.trusted, d.actor, d.reason])]);
      const plan = planDomainApprovals({ map, row: before, decisions, now, cutover: CUTOVER, ...options });
      if (plan.changed) { row = { ...before, ...plan.fields }; binding = { ...map, ...plan.mapFields, revision: map.revision + 1 }; }
      return { binding, account: row };
    },
    markEffects: async () => { binding.providerAccessVersion = row.accessVersion; },
    inventory: async () => ({ accounts: [row], bindings: [binding] }),
    pendingOnboarding: async () => [],
  };
  let current = crm;
  const hubspot = { getContact: async () => current, listContacts: async () => [current],
    projectStatus: async (_, status) => { current.properties.opda_active = String(status.active); current.properties.opda_enrolment_status = status.enrolmentStatus; } };
  const identity = { ensure: async () => 'sub', setAccess: async (_, enabled) => calls.push(enabled ? 'enable' : 'disable') };
  const teams = { async get(pk) { reads.push(pk); return items.get(pk) ?? null; } };
  const worker = createWorker({ store, hubspot, identity, domainCutover: CUTOVER, now: () => NOW,
    externalDecisions: createTeamsDecisionSource({ store: teams }) });
  return { worker, calls, reads, items, account: () => row, setContact: value => { current = value; } };
}

test('a mirrored, corroborated Teams decision is applied as a trusted approval carrying the Teams identity', async () => {
  const f = fixture();
  await f.worker.processContact('123');
  assert.deepEqual(f.reads, [reviewKey('123', A)], 'exactly one read, for the mirrored domain only');
  assert.deepEqual(f.calls[0], ['apply', [[A, 'approved', true, `teams:${APPROVER}`, 'teams-bot-domain-review']]]);
  assert.equal(f.account().domainApprovals[A].status, 'approved');
  assert.equal(f.account().domainApprovals[A].actor, `teams:${APPROVER}`);
  assert.equal(f.account().domainApprovals[A].decisionId, record().decisionId);
  assert.equal(f.account().active, true);
  assert.ok(f.calls.includes('enable'));
});

test('an integration write without a durable Teams record stays untrusted and holds the domain', async () => {
  const f = fixture({ records: [] });
  await f.worker.processContact('123');
  assert.deepEqual(f.calls[0][1], [[A, 'under_review', false, null, 'untrusted-domain-review-change']]);
  assert.equal(f.account().domainApprovals[A].status, 'under_review');
  assert.equal(f.account().active, false);
});

test('the record must match the mirror exactly; drift, tampering, staleness or a later human edit fall through', () => {
  const now = NOW;
  assert.ok(corroborate(contact(), A, record(), now));
  assert.equal(corroborate(contact(), A, record({ status: 'rejected' }), now), null, 'outcome differs from the mirror');
  assert.equal(corroborate(contact(), A, { ...record(), decisionId: 'f'.repeat(64) }, now), null, 'tampered identity');
  assert.equal(corroborate(contact(), A, { ...record(), actorObjectId: 'not-a-guid', decisionId: teamsDecisionId({ ...record(), actorObjectId: 'not-a-guid' }) }, now), null);
  assert.equal(corroborate(contact(), A, record({ at: MIRRORED_AT + 1 }), now), null, 'decision after the mirror');
  assert.equal(corroborate(contact(), A, record({ at: NOW + 1000 }), now), null, 'future decision');
  assert.equal(corroborate(contact(), A, record({ contactId: '124' }), now), null);
  const overwritten = contact({ [A]: [integration('approved', MIRRORED_AT), entry('rejected', MIRRORED_AT - 500)] });
  assert.equal(corroborate(overwritten, A, record(), now), null, 'a human review between decision and mirror is never overridden');
  const reviewedLater = contact({ [A]: [entry('rejected', NOW - 1000), integration('approved', MIRRORED_AT)] });
  assert.equal(mirroredReview(reviewedLater, A), null, 'a later CRM_UI change follows the normal policy');
  assert.equal(mirroredReview(contact({ [A]: [integration('received', MIRRORED_AT)] }), A), null, 'intake markers are not decisions');
  assert.equal(mirroredReview(contact({ [A]: [entry('approved', MIRRORED_AT)] }), A), null, 'a human approval needs no lookup');
  const noInterest = contact();
  noInterest.properties.opda_requested_working_groups = B;
  noInterest.propertiesWithHistory.opda_requested_working_groups = [entry(B, NOW - 80000)];
  assert.equal(corroborate(noInterest, A, record(), now), null, 'approval evidence is the shared ADR-0085 check');
  assert.ok(corroborate(contact({ [A]: [integration('rejected', MIRRORED_AT)] }), A, record({ status: 'rejected' }), now));
});

test('a later Teams rejection withdraws an earlier Teams approval through the same path', async () => {
  const f = fixture();
  await f.worker.processContact('123');
  assert.equal(f.account().active, true);
  f.setContact(contact({ [A]: [integration('rejected', NOW - 1000), integration('approved', MIRRORED_AT)] }));
  f.items.set(reviewKey('123', A), record({ status: 'rejected', at: NOW - 2000, messageId: '100' }));
  await f.worker.processContact('123');
  assert.deepEqual(f.calls.at(-2)[1], [[A, 'rejected', true, `teams:${APPROVER}`, 'teams-bot-domain-review']]);
  assert.equal(f.account().domainApprovals[A].status, 'rejected');
  assert.equal(f.account().active, false);
  assert.ok(f.calls.includes('disable'));
});
