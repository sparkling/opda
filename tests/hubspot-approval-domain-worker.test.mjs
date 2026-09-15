import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorker } from '../config/aws/hubspot-approval/index.mjs';
import { DOMAIN_POLICY, planDomainApprovals } from '../config/aws/hubspot-approval/domain-onboarding.mjs';
import { DOMAIN_REVIEW_PROPERTIES } from '../config/aws/hubspot-participation/properties.mjs';
import { APPROVAL } from '../config/aws/hubspot-participation/import.mjs';

const NOW = Date.parse('2026-09-09T16:00:00Z'), CUTOVER = NOW - 600000;
const A = 'finance-and-banking', B = 'conveyancing';
const entry = (value, at = NOW - 1000, patch = {}) => ({ value,
  timestamp: new Date(at).toISOString(), sourceType: 'CRM_UI', sourceId: 'userId:42', updatedByUserId: 42, ...patch });
// `legacy` plants a value in the retired account-wide field, which some contacts
// still carry; the worker must treat it as if it were not there.
function contact(reviews = { [A]: 'approved' }, legacy = null) {
  const result = { id: '123', properties: { email: 'synthetic@example.test', opda_full_name: 'Synthetic Example',
    opda_requested_working_groups: `${A};${B}`, ...(legacy ? { opda_review_status: legacy } : {}),
    opda_active: 'false', opda_enrolment_status: 'not_invited' }, propertiesWithHistory: {
    email: [entry('synthetic@example.test', NOW - 90000)],
    opda_requested_working_groups: [entry(`${A};${B}`, NOW - 80000)],
    ...(legacy ? { opda_review_status: [entry(legacy, NOW - 70000)] } : {}),
  } };
  for (const [id, status] of Object.entries(reviews)) edit(result, DOMAIN_REVIEW_PROPERTIES[id], status);
  return result;
}
function edit(value, property, status, at = NOW - 1000, patch = {}) {
  value.properties[property] = status;
  (value.propertiesWithHistory[property] ??= []).unshift(entry(status, at, patch));
}
const initialRow = () => ({ pk: 'USER#sub', participantId: 'pid', cognitoSub: 'sub', email: 'synthetic@example.test',
  name: 'Synthetic Example', hubspotContactId: '123', hubspotPortalId: 144765514,
  active: false, suspended: false, reviewStatus: 'received', enrolmentStatus: 'not_invited', accessVersion: 1 });
function fixture({ existing = true, crm = contact(), rowPatch = {}, mapPatch = {} } = {}) {
  const calls = [], notifications = [], operations = new Map();
  let time = NOW, row = existing ? { ...initialRow(), approvalPolicy: DOMAIN_POLICY,
    domainApprovals: {}, legacyWebsiteApproved: false, ...rowPatch } : null;
  let binding = existing ? { pk: 'CRM#CONTACT#123', contactId: '123', participantId: 'pid', email: row.email,
    cognitoSub: 'sub', revision: 1, approvalPolicy: row.approvalPolicy,
    domainApprovals: row.domainApprovals, ...mapPatch } : null;
  const hubspot = {
    getContact: async () => { calls.push('read-crm'); return crm; },
    listContacts: async () => { calls.push('list-crm'); return crm ? [crm] : []; },
    projectStatus: async (_, status) => {
      calls.push('project');
      crm.properties.opda_active = String(status.active);
      crm.properties.opda_enrolment_status = status.enrolmentStatus;
    },
  };
  const store = {
    binding: async () => binding,
    reserve: async profile => { calls.push('reserve'); binding = { ...profile,
      pk: 'CRM#CONTACT#123', participantId: 'pid', revision: 1 }; return binding; },
    checkPending: async () => { calls.push('check-pending'); },
    attach: async (map, cognitoSub) => { calls.push('attach-inactive');
      row = initialRow(); binding = { ...map, cognitoSub }; return binding; },
    account: async () => row,
    applyDomains: async (map, before, decisions, now, options) => {
      calls.push(['apply', decisions, options]);
      const plan = planDomainApprovals({ map, row: before, decisions, now, cutover: CUTOVER, ...options });
      if (plan.changed) {
        row = { ...before, ...plan.fields }; binding = { ...map, ...plan.mapFields, revision: map.revision + 1 };
        for (const operation of plan.operations) operations.set(operation.operationId, operation);
      }
      return { binding, account: row };
    },
    markEffects: async (_, account) => { calls.push('effects'); binding.providerAccessVersion = account.accessVersion; },
    inventory: async () => ({ accounts: row ? [row] : [], bindings: binding ? [binding] : [] }),
    pendingOnboarding: async () => [...operations.values()].filter(item => item.status === 'pending'),
  };
  const identity = { ensure: async () => { calls.push('create-suppressed'); return 'sub'; },
    setAccess: async (_, enabled) => { calls.push(enabled ? 'enable' : 'disable'); } };
  const worker = createWorker({ store, hubspot, identity, cutover: CUTOVER - 100000,
    domainCutover: CUTOVER, now: () => time, notifyOnboarding: async hint => notifications.push(hint) });
  return { calls, notifications, operations, hubspot, store, identity, worker,
    crm, row: () => row, binding: () => binding, time: value => { time = value; } };
}

test('new domain approval reserves and attaches inactive, rereads CRM, and ignores the initial signup Received status', async () => {
  const f = fixture({ existing: false });
  await f.worker.processContact('123');
  assert.equal(f.row().active, true);
  assert.deepEqual(f.row().approvedDomains, [A]);
  assert.equal(f.calls.filter(value => value === 'read-crm').length, 2);
  assert.ok(f.calls.indexOf('attach-inactive') < f.calls.indexOf('enable'));
  assert.equal(f.operations.size, 1);
  assert.equal([...f.operations.values()][0].domainId, A);
  assert.equal(f.notifications.length, 1);
});

test('a legacy account-wide Approved or an untrusted domain property edit cannot reserve a new identity', async () => {
  for (const value of [contact({}, 'approved'), contact()]) {
    if (value.properties[DOMAIN_REVIEW_PROPERTIES[A]]) {
      value.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[A]][0].sourceType = 'INTEGRATION';
    }
    const f = fixture({ existing: false, crm: value });
    await f.worker.processContact('123');
    assert.equal(f.calls.includes('reserve'), false);
    assert.equal(f.calls.includes('create-suppressed'), false);
  }
});

test('a legacy account-wide value still on a contact neither grants nor blocks any domain', async () => {
  // Withdrawn/Rejected there used to veto every group; Approved there used to be required. Neither holds now.
  for (const legacy of ['withdrawn', 'rejected', 'under_review', 'approved', 'received']) {
    const f = fixture({ existing: false, crm: contact({ [A]: 'approved' }, legacy) });
    await f.worker.processContact('123');
    assert.equal(f.row().active, true, legacy);
    assert.equal(f.row().domainApprovals[A].status, 'approved', legacy);
    assert.equal(f.calls.includes('enable'), true, legacy);
  }
});

test('withdrawal during provisioning cannot turn a stale approval into access or an invitation', async () => {
  const f = fixture({ existing: false }); let reads = 0;
  f.hubspot.getContact = async () => ++reads === 1 ? contact() : contact({ [A]: 'withdrawn' });
  await f.worker.processContact('123');
  assert.equal(f.row().active, false);
  assert.equal(f.calls.includes('enable'), false);
  assert.equal(f.operations.size, 0);
});

test('approving and withdrawing individual domains preserves the other domain and avoids Cognito or projection churn', async () => {
  const f = fixture({ crm: contact({ [A]: 'approved', [B]: 'approved' }) });
  await f.worker.processContact('123');
  const version = f.row().accessVersion, bSnapshot = structuredClone(f.binding().domainApprovals[B].onboarding);
  f.calls.length = 0;
  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[A], 'withdrawn', NOW + 1000); f.time(NOW + 2000);
  await f.worker.processContact('123');
  assert.equal(f.row().active, true);
  assert.equal(f.row().accessVersion, version);
  assert.deepEqual(f.row().approvedDomains, [B]);
  assert.deepEqual(f.binding().domainApprovals[B].onboarding, bSnapshot);
  assert.ok(!f.calls.some(value => ['enable', 'disable', 'project', 'effects'].includes(value)));
  assert.equal([...f.operations.values()].filter(item => item.action === 'revoke').length, 1);
});

test('withdrawing the last approved domain disables Cognito despite a stale legacy flag and replays without churn', async () => {
  const f = fixture(); await f.worker.processContact('123');
  Object.assign(f.row(), { legacyWebsiteApproved: true });
  const version = f.row().accessVersion;
  f.calls.length = 0;
  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[A], 'withdrawn', NOW + 1000); f.time(NOW + 2000);
  await f.worker.processContact('123');
  assert.equal(f.row().active, false); assert.equal(f.row().legacyWebsiteApproved, false);
  assert.equal(f.row().accessVersion, version + 1); assert.deepEqual(f.row().approvedDomains, []);
  assert.equal(f.row().domainApprovals[A].onboarding.notifyWithdrawal, true);
  assert.equal(f.calls.filter(value => value === 'disable').length, 1);
  assert.equal(f.calls.includes('enable'), false); assert.equal(f.crm.properties.opda_active, 'false');
  const denied = structuredClone(f.row()); f.calls.length = 0;
  await f.worker.processContact('123');
  assert.deepEqual(f.row(), denied);
  assert.ok(!f.calls.some(value => ['enable', 'disable', 'project', 'effects'].includes(value)));
});

test('CRM denied-status changes keep notifying the same pending withdrawal without provider churn', async () => {
  const f = fixture(); await f.worker.processContact('123');
  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[A], 'withdrawn', NOW + 1000); f.time(NOW + 2000);
  await f.worker.processContact('123');
  const snapshot = structuredClone(f.row().domainApprovals[A].onboarding), version = f.row().accessVersion;
  const operationCount = f.operations.size; f.calls.length = 0; f.notifications.length = 0;
  for (const [i, status] of ['rejected', 'under_review'].entries()) {
    const at = NOW + (i + 3) * 1000;
    edit(f.crm, DOMAIN_REVIEW_PROPERTIES[A], status, at); f.time(at + 1);
    await f.worker.processContact('123');
    assert.equal(f.row().domainApprovals[A].status, status);
    assert.deepEqual(f.row().domainApprovals[A].onboarding, snapshot);
    assert.equal(f.row().accessVersion, version); assert.equal(f.operations.size, operationCount);
  }
  assert.equal(f.notifications.length, 2);
  assert.ok(f.notifications.every(hint => hint.operationId === snapshot.operationId));
  assert.ok(!f.calls.some(value => ['enable', 'disable', 'project', 'effects'].includes(value)));
});

test('clearing a previously managed field and losing its history denies only that domain', async () => {
  const f = fixture({ crm: contact({ [A]: 'approved', [B]: 'approved' }) });
  await f.worker.processContact('123');
  delete f.crm.properties[DOMAIN_REVIEW_PROPERTIES[A]];
  delete f.crm.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[A]];
  f.time(NOW + 1000);
  await f.worker.processContact('123');
  assert.equal(f.row().domainApprovals[A].status, 'under_review');
  assert.deepEqual(f.row().approvedDomains, [B]);
});

test('a later edit to the retired account-wide field, trusted or not, changes nothing', async () => {
  for (const mode of ['missing', 'old', 'current']) {
    const f = fixture(); await f.worker.processContact('123');
    assert.equal(f.row().active, true);
    f.crm.properties.opda_review_status = 'withdrawn';
    f.crm.propertiesWithHistory.opda_review_status = mode === 'missing' ? [] : [entry('withdrawn', mode === 'old' ? CUTOVER - 1 : NOW + 500)];
    const transactions = f.transactions?.length;
    f.time(NOW + 1000); await f.worker.processContact('123');
    assert.equal(f.row().active, true, mode);
    assert.equal(f.row().domainApprovals[A].status, 'approved', mode);
    assert.equal(f.calls.includes('disable'), false, mode);
    if (transactions !== undefined) assert.equal(f.transactions.length, transactions, 'no write for an inert field');
  }
});

test('the domain dropdown is the only revocation surface: withdraw disables, re-approve restores', async () => {
  const f = fixture(); await f.worker.processContact('123');
  assert.equal(f.row().active, true);
  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[A], 'withdrawn', NOW + 1000); f.time(NOW + 2000);
  await f.worker.processContact('123');
  assert.equal(f.row().active, false);
  assert.equal(f.row().domainApprovals[A].status, 'withdrawn');
  assert.equal(f.calls.includes('disable'), true);
  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[A], 'approved', NOW + 3000); f.time(NOW + 4000);
  await f.worker.processContact('123');
  assert.equal(f.row().active, true);
  assert.equal(f.row().domainApprovals[A].status, 'approved');
});

test('historically approved website-only imports lose eligibility without receiving a domain invitation', async () => {
  const value = contact({}); value.properties.opda_active = 'true';
  const f = fixture({ crm: value, rowPatch: { approvalPolicy: undefined, domainApprovals: undefined,
    approvalId: APPROVAL.id, active: true, suspended: false, reviewStatus: 'approved' },
  mapPatch: { imported: true, approvalPolicy: undefined, domainApprovals: undefined } });
  await f.worker.processContact('123');
  assert.equal(f.row().active, false);
  assert.equal(f.row().legacyWebsiteApproved, false);
  assert.equal(f.row().accessVersion, 2);
  assert.equal(f.calls.includes('disable'), true);
  assert.equal(f.calls.includes('enable'), false);
  assert.deepEqual(f.row().approvedDomains, []);
  assert.equal(f.operations.size, 0);
});

test('contact disappearance or a changed email uses owned domain revocation, never a new identity', async () => {
  for (const missing of [true, false]) {
    const f = fixture(); await f.worker.processContact('123'); f.calls.length = 0;
    if (missing) f.hubspot.getContact = async () => null;
    else f.crm.properties.email = 'different@example.test';
    f.time(NOW + 1000); await f.worker.processContact('123');
    const apply = f.calls.find(value => Array.isArray(value) && value[0] === 'apply');
    assert.deepEqual(apply[1], []);
    assert.equal(apply[2].holdReason, missing ? 'contact-unavailable' : 'identity-changed');
    assert.equal(f.row().active, false);
    assert.equal(f.calls.includes('reserve'), false);
    assert.equal(f.calls.includes('disable'), true);
  }
});

test('external account suspension revokes all owned domains and notifications survive a Cognito outage', async () => {
  const f = fixture({ crm: contact({ [A]: 'approved', [B]: 'approved' }) });
  await f.worker.processContact('123'); f.notifications.length = 0;
  Object.assign(f.row(), { suspended: true, suspensionSource: 'security' });
  f.identity.setAccess = async () => { throw new Error('Cognito unavailable'); };
  f.time(NOW + 1000);
  await assert.rejects(f.worker.processContact('123'));
  assert.equal(f.row().active, false);
  assert.deepEqual(f.row().approvedDomains, []);
  assert.equal(f.notifications.length, 2);
  assert.ok(f.notifications.every(hint => f.operations.get(hint.operationId).action === 'revoke'));
  assert.ok(Object.values(f.row().domainApprovals).every(state => state.onboarding.notifyWithdrawal === true));
});

test('a failed Cognito disable after external suspension is durably retried without a new review edit', async () => {
  const f = fixture(); await f.worker.processContact('123');
  Object.assign(f.row(), { suspended: true, suspensionSource: 'security' });
  let attempts = 0;
  f.identity.setAccess = async (_, enabled) => {
    assert.equal(enabled, false);
    if (++attempts === 1) throw new Error('Cognito unavailable');
  };
  f.time(NOW + 1000);
  await assert.rejects(f.worker.processContact('123'));
  await f.worker.processContact('123');
  assert.equal(attempts, 2);
  await f.worker.processContact('123');
  assert.equal(attempts, 2, 'the successful retry settles the provider effect');
});

test('one failed queue notification does not hide another domain revocation', async () => {
  const f = fixture({ crm: contact({ [A]: 'approved', [B]: 'approved' }) });
  await f.worker.processContact('123');
  // Two independent withdrawals, one per domain: there is no single field that revokes both.
  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[A], 'withdrawn', NOW + 1000);
  edit(f.crm, DOMAIN_REVIEW_PROPERTIES[B], 'withdrawn', NOW + 1000);
  const attempted = [];
  const worker = createWorker({ store: f.store, hubspot: f.hubspot, identity: f.identity,
    domainCutover: CUTOVER, now: () => NOW + 2000,
    notifyOnboarding: async hint => { attempted.push(hint); if (attempted.length === 1) throw new Error('Queue unavailable'); } });
  await assert.rejects(worker.processContact('123'), /notification/);
  assert.equal(attempted.length, 2);
  assert.ok(attempted.every(hint => f.operations.get(hint.operationId).action === 'revoke'));
});

test('reconciliation skips unchanged accounts and still relays pending onboarding independently', async () => {
  const f = fixture(); await f.worker.processContact('123'); f.calls.length = 0; f.notifications.length = 0;
  assert.deepEqual(await f.worker.reconcile(), { checked: 1, processed: 0 });
  assert.deepEqual(f.calls, ['list-crm']);
  assert.equal(f.notifications.length, 1);
  f.hubspot.listContacts = async () => { throw new Error('CRM unavailable'); };
  f.notifications.length = 0;
  await assert.rejects(f.worker.reconcile());
  assert.equal(f.notifications.length, 1);
});

test('the domain workflow needs an explicit valid activation cutoff', () => {
  for (const domainCutover of [null, NaN, 'now', -1]) {
    assert.throws(() => createWorker({ cutover: CUTOVER, domainCutover }), /cutover/i);
  }
});
