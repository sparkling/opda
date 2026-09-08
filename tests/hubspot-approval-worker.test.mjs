import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewDecision, emailPredatesApproval, mayApprove, ordinaryAccess, parseHints } from '../config/aws/hubspot-approval/domain.mjs';
import { createWorker } from '../config/aws/hubspot-approval/index.mjs';

const now = Date.parse('2026-09-09T10:00:00Z');
const cutover = now - 100000;
const contact = (status = 'approved', at = now - 1000) => ({ id: '123', properties: {
  email: 'person@example.com', opda_full_name: 'Example Person', opda_review_status: status,
}, propertiesWithHistory: {
  opda_review_status: [{ value: status, timestamp: new Date(at).toISOString(), sourceType: 'CRM_UI', sourceId: 'userId:42', updatedByUserId: 42 }],
  email: [{ value: 'person@example.com', timestamp: new Date(now - 10000).toISOString() }],
} });
const account = () => ({ pk: 'USER#sub', participantId: 'pid', cognitoSub: 'sub', email: 'person@example.com',
  hubspotContactId: '123', hubspotPortalId: 144765514, active: true, suspended: false,
  reviewStatus: 'approved', enrolmentStatus: 'not_invited', accessVersion: 1 });

test('only a current manual CRM status with a recorded actor can approve', () => {
  const c = contact();
  assert.equal(reviewDecision(c, { cutover, now }).trusted, true);
  for (const source of ['INTEGRATION', 'FORM', 'IMPORT', 'WORKFLOW']) {
    c.propertiesWithHistory.opda_review_status[0].sourceType = source;
    const d = reviewDecision(c, { cutover, now });
    assert.equal(d.trusted, false);
    assert.equal(d.status, 'under_review');
  }
});
test('historical imports and missing histories do not become fresh decisions', () => {
  assert.equal(reviewDecision(contact('approved', cutover - 1), { cutover, now }), null);
  assert.equal(reviewDecision({ ...contact(), propertiesWithHistory: {} }, { cutover, now }), null);
});
test('every tied latest history entry must agree, including actor provenance', () => {
  const c = contact(); const h = c.propertiesWithHistory.opda_review_status[0];
  c.propertiesWithHistory.opda_review_status = [{ ...h }, { ...h }, { ...h, value: 'rejected' }];
  assert.equal(reviewDecision(c, { cutover, now }), null);
  c.propertiesWithHistory.opda_review_status[2] = { ...h, updatedByUserId: 77 };
  assert.equal(reviewDecision(c, { cutover, now }), null);
});
test('contradictory actor/status and future review timestamps cannot grant', () => {
  const c = contact();
  c.propertiesWithHistory.opda_review_status[0].updatedByUserId = 77;
  assert.equal(reviewDecision(c, { cutover, now }).trusted, false);
  c.propertiesWithHistory.opda_review_status[0].updatedByUserId = 42;
  c.properties.opda_review_status = 'rejected';
  assert.equal(reviewDecision(c, { cutover, now }).trusted, false);
  assert.throws(() => reviewDecision(contact('approved', now + 61000), { cutover, now }));
});
test('changed email requires a new approval, not reuse of an old decision', () => {
  const c = contact(); const d = reviewDecision(c, { cutover, now });
  assert.equal(emailPredatesApproval(c, d), true);
  c.propertiesWithHistory.email[0].timestamp = new Date(now).toISOString();
  assert.equal(emailPredatesApproval(c, d), false);
});
test('CRM approval cannot remove external suspension, erasure, expiry or expired enrolment', () => {
  const d = reviewDecision(contact(), { cutover, now });
  for (const patch of [{ suspended: true, suspensionSource: 'security' }, { erasedAt: now },
    { deletedAt: now }, { expiresAt: Math.floor(now / 1000) }, { enrolmentStatus: 'expired' }]) {
    assert.equal(mayApprove({ ...account(), ...patch }, d, now), false);
  }
  assert.equal(mayApprove({ ...account(), suspended: true, suspensionSource: 'hubspot-review' }, d, now), true);
  assert.equal(ordinaryAccess({ ...account(), active: false }, now), false);
});
test('queue accepts contact hints only from its dedicated queue', () => {
  const r = { eventSource: 'aws:sqs', eventSourceARN: 'queue', body: JSON.stringify({ schemaVersion: 1,
    contactIds: ['123'], receivedAt: now, receiptId: 'a'.repeat(64) }) };
  assert.deepEqual(parseHints(r, 'queue'), ['123']);
  assert.throws(() => parseHints(r, 'another'));
});

function fixture({ existing = true, crm = contact() } = {}) {
  const calls = [];
  let row = existing ? account() : null;
  let binding = existing ? { pk: 'CRM#CONTACT#123', contactId: '123', participantId: 'pid', email: row.email,
    cognitoSub: 'sub', revision: 1 } : null;
  const hubspot = { getContact: async () => { calls.push('read-crm'); return crm; },
    projectStatus: async () => calls.push('project') };
  const store = {
    checkPending: async () => {},
    binding: async () => binding,
    reserve: async profile => { calls.push('reserve'); binding = { ...profile, participantId: 'pid', revision: 1 }; return binding; },
    attach: async (map, sub) => { calls.push('attach-inactive'); row = { ...account(), active: false, reviewStatus: 'received' };
      binding = { ...map, cognitoSub: sub }; return binding; },
    account: async () => row,
    apply: async (map, before, decision) => { calls.push('apply'); row = { ...before, reviewStatus: decision.status,
      active: decision.status === 'approved', suspended: decision.status !== 'approved', accessVersion: before.accessVersion + 1 };
      binding = { ...map, decisionId: decision.id, decisionAt: decision.at }; return { binding, account: row }; },
    hold: async (map, before, reason) => { calls.push(`hold:${reason}`); row = { ...before, active: false, suspended: true };
      return { binding: map, account: row }; },
    markEffects: async () => calls.push('effects'),
  };
  const identity = { ensure: async () => { calls.push('create-suppressed'); return 'sub'; },
    setAccess: async (_, enabled) => calls.push(enabled ? 'enable' : 'disable') };
  return { calls, hubspot, store, identity, row: () => row,
    worker: createWorker({ store, hubspot, identity, cutover, now: () => now }) };
}
test('new approval reserves identity, creates inactive account, rereads CRM, then grants access', async () => {
  const f = fixture({ existing: false });
  await f.worker.processContact('123');
  assert.deepEqual(f.calls, ['read-crm', 'reserve', 'create-suppressed', 'attach-inactive', 'read-crm', 'apply', 'enable', 'project', 'effects']);
});
test('public/integration approval cannot provision a new identity', async () => {
  const crm = contact(); crm.propertiesWithHistory.opda_review_status[0].sourceType = 'INTEGRATION';
  const f = fixture({ existing: false, crm }); await f.worker.processContact('123');
  assert.deepEqual(f.calls, ['read-crm']);
});
test('withdrawal during Cognito creation cannot accidentally grant access', async () => {
  const f = fixture({ existing: false }); let reads = 0;
  f.hubspot.getContact = async () => (++reads === 1 ? contact() : contact('withdrawn'));
  await f.worker.processContact('123');
  assert.equal(f.calls.includes('enable'), false);
  assert.equal(f.row().active, false);
});
test('deletion revokes AWS eligibility before disabling Cognito', async () => {
  const f = fixture({ crm: null }); await f.worker.processContact('123');
  assert.ok(f.calls.indexOf('hold:contact-unavailable') < f.calls.indexOf('disable'));
  assert.equal(f.calls.includes('project'), false);
});
test('email changes never transfer account binding', async () => {
  const crm = contact(); crm.properties.email = 'other@example.com';
  const f = fixture({ crm }); await f.worker.processContact('123');
  assert.ok(f.calls.includes('hold:identity-changed'));
  assert.equal(f.calls.includes('enable'), false);
  assert.equal(f.calls.includes('reserve'), false);
});
test('provider failure remains retryable rather than acknowledging completion', async () => {
  const f = fixture(); f.identity.setAccess = async () => { throw new Error('provider unavailable'); };
  await assert.rejects(f.worker.processContact('123'));
  assert.equal(f.calls.includes('effects'), false);
});
