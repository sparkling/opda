import assert from 'node:assert/strict';
import test from 'node:test';
import { createDomainWorker } from '../config/aws/hubspot-approval/domain-worker.mjs';
import { DOMAIN_POLICY, planDomainApprovals } from '../config/aws/hubspot-approval/domain-onboarding.mjs';
import { DOMAIN_REVIEW_PROPERTIES } from '../config/aws/hubspot-participation/properties.mjs';
import {
  FINANCE_DOMAIN_ID, FINANCE_IMPORT_ID, FINANCE_ROSTER_COUNT, FINANCE_ROSTER_SHA256,
  captureFinanceImport, financeImportDecisions,
} from '../config/aws/hubspot-approval/finance-import.mjs';

const NOW = Date.parse('2026-09-10T12:00:00.000Z');
const CUTOVER = NOW - 60000;
const FINANCE = FINANCE_DOMAIN_ID, OTHER = 'conveyancing';
const ACTOR = 'arn:aws:sts::355653384628:assumed-role/AWSReservedSSO_Administrator/user@example.test';
const PARTICIPANT = '00000000-0000-4000-8000-000000000001';
const SUB = '10000000-0000-4000-8000-000000000001';
const MICROSOFT_ID = '20000000-0000-4000-8000-000000000001';

const entry = (value, at, patch = {}) => ({ value, timestamp: new Date(at).toISOString(),
  sourceType: 'INTEGRATION', sourceId: 'integration:123', updatedByUserId: null, ...patch });

function contact(id = '123') {
  return { id, properties: { email: 'synthetic@example.test', opda_full_name: 'Synthetic Example',
    opda_requested_working_groups: FINANCE, opda_review_status: 'approved',
    [DOMAIN_REVIEW_PROPERTIES[FINANCE]]: 'approved', opda_active: 'true',
    opda_enrolment_status: 'not_invited' }, propertiesWithHistory: {
    email: [entry('synthetic@example.test', NOW - 100000)],
    opda_requested_working_groups: [entry(FINANCE, NOW - 90000)],
    opda_review_status: [entry('approved', NOW - 80000)],
    [DOMAIN_REVIEW_PROPERTIES[FINANCE]]: [entry('approved', NOW - 70000)],
  } };
}

function bareBinding(contactId = '123') {
  return { pk: `CRM#CONTACT#${contactId}`, contactId, email: 'synthetic@example.test',
    participantId: PARTICIPANT, cognitoSub: SUB, revision: 1 };
}

function capture(crm = contact(), binding = bareBinding()) {
  return captureFinanceImport(crm, binding, { actorArn: ACTOR, now: NOW,
    microsoft: { userId: MICROSOFT_ID, state: 'Accepted', observedAt: NOW - 50000 } });
}

function importedState(crm = contact()) {
  const initial = bareBinding(crm.id), receipt = capture(crm, initial);
  const domain = { status: 'approved', version: 1, decisionId: receipt.domainDecisionId,
    decisionAt: receipt.domainDecisionAt, actor: receipt.actorArn, reason: 'individual-domain-approved',
    legacy: false, onboarding: null };
  const row = { pk: `USER#${SUB}`, participantId: PARTICIPANT, cognitoSub: SUB,
    email: initial.email, name: 'Synthetic Example', hubspotContactId: crm.id, hubspotPortalId: 144765514,
    active: true, suspended: false, suspensionSource: '', reviewStatus: 'approved',
    enrolmentStatus: 'not_invited', accessVersion: 1, approvalPolicy: DOMAIN_POLICY,
    domainApprovals: { [FINANCE]: domain }, approvedDomains: [FINANCE], legacyWebsiteApproved: false,
    approvedAt: receipt.domainDecisionAt, approvalId: receipt.domainDecisionId, createdAt: NOW };
  const binding = { ...initial, approvalPolicy: DOMAIN_POLICY, domainApprovals: { [FINANCE]: structuredClone(domain) },
    domainGlobalDecisionId: receipt.globalDecisionId, holdReason: '', providerAccessVersion: 1,
    financeRosterImport: receipt };
  return { receipt, row, binding };
}

function edit(crm, property, value, at, sourceType = 'CRM_UI') {
  crm.properties[property] = value;
  crm.propertiesWithHistory[property] ??= [];
  crm.propertiesWithHistory[property].unshift(entry(value, at, sourceType === 'CRM_UI'
    ? { sourceType, sourceId: 'userId:42', updatedByUserId: 42 }
    : { sourceType, sourceId: 'integration:456', updatedByUserId: null }));
}

function fixture(crm = contact()) {
  const seeded = importedState(crm), calls = [], operations = new Map();
  let row = seeded.row, binding = seeded.binding, time = NOW + 1;
  const store = {
    binding: async () => binding,
    account: async () => row,
    reserve: async () => { calls.push('reserve'); throw new Error('must not reserve'); },
    attach: async () => { calls.push('attach'); throw new Error('must not attach'); },
    checkPending: async () => { calls.push('check-pending'); },
    applyDomains: async (map, before, decisions, now, options) => {
      calls.push(['apply', decisions, options]);
      const plan = planDomainApprovals({ map, row: before, decisions, now, cutover: CUTOVER, ...options });
      if (plan.changed) {
        row = { ...before, ...plan.fields };
        binding = { ...map, ...plan.mapFields, revision: map.revision + 1 };
        for (const operation of plan.operations) operations.set(operation.operationId, operation);
      }
      return { binding, account: row };
    },
    markEffects: async (_, account) => { calls.push('effects'); binding.providerAccessVersion = account.accessVersion; },
    inventory: async () => ({ accounts: [row], bindings: [binding] }),
    pendingOnboarding: async () => [...operations.values()].filter(operation => operation.status === 'pending'),
  };
  const hubspot = {
    getContact: async () => { calls.push('read-crm'); return crm; },
    listContacts: async () => { calls.push('list-crm'); return [crm]; },
    projectStatus: async (_, state) => { calls.push('project');
      crm.properties.opda_active = String(state.active); crm.properties.opda_enrolment_status = state.enrolmentStatus; },
  };
  const notifications = [];
  const identity = { ensure: async () => { calls.push('ensure'); throw new Error('must not create identity'); },
    setAccess: async (_, active) => calls.push(active ? 'enable' : 'disable') };
  const worker = createDomainWorker({ store, hubspot, identity, domainCutover: CUTOVER,
    notifyOnboarding: async hint => notifications.push(hint), now: () => time });
  return { crm, receipt: seeded.receipt, worker, calls, notifications, operations,
    row: () => row, binding: () => binding, time: value => { time = value; } };
}

test('capture binds the exact ALL372 Finance observations and keeps Microsoft evidence non-authoritative', () => {
  const crm = contact(), binding = bareBinding(), receipt = capture(crm, binding);
  assert.equal(receipt.importId, FINANCE_IMPORT_ID);
  assert.equal(receipt.sourceDigest, FINANCE_ROSTER_SHA256);
  assert.equal(receipt.cohortSize, FINANCE_ROSTER_COUNT);
  assert.equal(receipt.contactId, binding.contactId); assert.equal(receipt.email, binding.email);
  assert.equal(receipt.participantId, PARTICIPANT); assert.equal(receipt.cognitoSub, SUB);
  assert.deepEqual(receipt.microsoft, { userId: MICROSOFT_ID, state: 'Accepted', observedAt: NOW - 50000 });
  assert.equal(receipt.enrolmentStatus, undefined); assert.equal(receipt.onboarding, undefined);
  const decisions = financeImportDecisions(crm, { ...binding, financeRosterImport: receipt }, { now: NOW + 1 });
  assert.equal(decisions.globalDecision.id, receipt.globalDecisionId);
  assert.equal(decisions.domainDecision.id, receipt.domainDecisionId);
  assert.deepEqual(decisions.domainDecision.groupSnapshot.groups, [FINANCE]);
});

test('capture canonicalizes safe HubSpot metadata and freezes a current selection made after the old review', () => {
  const crm = contact();
  const selectedAt = NOW - 1000;
  crm.propertiesWithHistory.email[0].timestamp = crm.propertiesWithHistory.email[0].timestamp.replace('.000Z', 'Z');
  delete crm.propertiesWithHistory.email[0].sourceId;
  crm.propertiesWithHistory.opda_requested_working_groups.unshift(entry(FINANCE, selectedAt,
    { sourceId: '', updatedByUserId: undefined }));
  const receipt = capture(crm);
  assert.equal(receipt.selectedFinanceAt, selectedAt);
  assert.equal(receipt.domainDecisionAt, selectedAt);
  assert.ok(receipt.domainDecisionAt > receipt.domainReviewedAt);
});

test('capture rejects ambiguity, missing authority, mutable identity and unsafe Microsoft data', () => {
  const mutations = [
    crm => { crm.properties.opda_review_status = 'received'; },
    crm => { crm.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[FINANCE]] = []; },
    crm => { crm.propertiesWithHistory.opda_review_status.unshift(entry('approved', NOW - 80000,
      { sourceId: 'different' })); },
    crm => { crm.properties.opda_requested_working_groups = OTHER;
      crm.propertiesWithHistory.opda_requested_working_groups[0].value = OTHER; },
  ];
  for (const mutate of mutations) {
    const crm = contact(); mutate(crm);
    assert.throws(() => capture(crm));
  }
  assert.throws(() => captureFinanceImport(contact(), { ...bareBinding(), deletedAt: NOW }, { actorArn: ACTOR, now: NOW }));
  assert.throws(() => captureFinanceImport(contact(), bareBinding(), {
    actorArn: ACTOR.replace('355653384628', '111111111111'), now: NOW }));
  assert.throws(() => captureFinanceImport(contact(), bareBinding(), { actorArn: ACTOR, now: NOW,
    microsoft: { userId: MICROSOFT_ID, state: 'Accepted', observedAt: NOW, redemptionUrl: 'secret' } }));
});

test('unchanged imported seed replays and reconciles with no identity, provider, projection, outbox or email work', async () => {
  const f = fixture();
  await f.worker.processContact('123');
  assert.equal(f.operations.size, 0); assert.equal(f.notifications.length, 0);
  assert.ok(!f.calls.some(call => ['reserve', 'attach', 'ensure', 'enable', 'disable', 'project', 'effects'].includes(call)));
  f.calls.length = 0;
  assert.deepEqual(await f.worker.reconcile(), { checked: 1, processed: 0 });
  assert.equal(f.operations.size, 0); assert.equal(f.notifications.length, 0);
  assert.deepEqual(f.calls, ['list-crm']);
  assert.equal(f.row().enrolmentStatus, 'not_invited');
  assert.equal(f.row().domainApprovals[FINANCE].onboarding, null);
});

test('changed API reapproval or denial is untrusted and withdraws only the imported Finance decision', async () => {
  for (const status of ['approved', 'withdrawn']) {
    const f = fixture();
    edit(f.crm, DOMAIN_REVIEW_PROPERTIES[FINANCE], status, NOW + 1000, 'INTEGRATION');
    f.time(NOW + 2000);
    assert.equal(financeImportDecisions(f.crm, f.binding(), { now: NOW + 2000 }).domainDecision, null);
    await f.worker.processContact('123');
    assert.equal(f.row().active, false);
    assert.equal(f.row().domainApprovals[FINANCE].status, 'under_review');
    assert.equal([...f.operations.values()].filter(operation => operation.action === 'revoke').length, 1);
    assert.equal(f.calls.includes('ensure'), false);
  }
});

test('a changed or missing imported global API observation fails closed', async () => {
  for (const mode of ['reapproval', 'missing']) {
    const f = fixture();
    if (mode === 'reapproval') edit(f.crm, 'opda_review_status', 'approved', NOW - 1000, 'INTEGRATION');
    else delete f.crm.propertiesWithHistory.opda_review_status;
    f.time(NOW + 1000); await f.worker.processContact('123');
    assert.equal(f.row().active, false);
    assert.equal(f.binding().domainGlobalState, 'held');
    assert.equal(f.row().domainApprovals[FINANCE].status, 'withdrawn');
  }
});

test('cleared Finance evidence and changed email fail closed without transferring the receipt', async () => {
  const cleared = fixture();
  delete cleared.crm.properties[DOMAIN_REVIEW_PROPERTIES[FINANCE]];
  delete cleared.crm.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[FINANCE]];
  cleared.time(NOW + 1000); await cleared.worker.processContact('123');
  assert.equal(cleared.row().active, false);
  assert.equal(cleared.row().domainApprovals[FINANCE].reason, 'domain-review-evidence-unavailable');

  const changed = fixture(); changed.crm.properties.email = 'different@example.test';
  edit(changed.crm, 'email', 'different@example.test', NOW + 1000, 'INTEGRATION');
  changed.time(NOW + 2000); await changed.worker.processContact('123');
  assert.equal(changed.row().active, false); assert.equal(changed.binding().holdReason, 'identity-changed');
  assert.deepEqual(financeImportDecisions(changed.crm, changed.binding(), { now: NOW + 2000 }),
    { globalDecision: null, domainDecision: null });
  assert.equal(changed.calls.includes('reserve'), false); assert.equal(changed.calls.includes('ensure'), false);
});

test('interest changes neither invalidate Finance nor grant another domain; manual decisions remain authoritative', async () => {
  const f = fixture();
  edit(f.crm, 'opda_requested_working_groups', `${FINANCE};${OTHER}`, NOW + 100);
  f.time(NOW + 200); await f.worker.processContact('123');
  assert.deepEqual(f.row().approvedDomains, [FINANCE]);
  assert.equal(f.operations.size, 0);

  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[OTHER], 'approved', NOW + 300);
  f.time(NOW + 400); await f.worker.processContact('123');
  assert.deepEqual(f.row().approvedDomains, [FINANCE, OTHER]);
  const otherSnapshot = structuredClone(f.row().domainApprovals[OTHER]);

  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[FINANCE], 'withdrawn', NOW + 500);
  f.time(NOW + 600); await f.worker.processContact('123');
  assert.equal(f.row().active, true);
  assert.deepEqual(f.row().approvedDomains, [OTHER]);
  assert.deepEqual(f.row().domainApprovals[OTHER], otherSnapshot);
  assert.equal(f.binding().domainGlobalDecisionId, f.receipt.globalDecisionId,
    'Finance withdrawal does not invalidate the independently captured global observation');
});

test('receipt cannot grant another contact, identity or cohort and never implies completed enrolment', () => {
  const crm = contact(), seed = importedState(crm);
  const otherContact = contact('456'), otherBinding = { ...bareBinding('456'), financeRosterImport: seed.receipt };
  assert.deepEqual(financeImportDecisions(otherContact, otherBinding, { now: NOW + 1 }),
    { globalDecision: null, domainDecision: null });
  const otherIdentity = { ...seed.binding, participantId: '00000000-0000-4000-8000-000000000099' };
  assert.deepEqual(financeImportDecisions(crm, otherIdentity, { now: NOW + 1 }),
    { globalDecision: null, domainDecision: null });
  const otherCohort = { ...seed.receipt, sourceDigest: '0'.repeat(64) };
  assert.deepEqual(financeImportDecisions(crm, { ...seed.binding, financeRosterImport: otherCohort }, { now: NOW + 1 }),
    { globalDecision: null, domainDecision: null });
  assert.equal(seed.row.enrolmentStatus, 'not_invited');
  assert.equal(seed.receipt.microsoft.state, 'Accepted');
});
