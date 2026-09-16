import test from 'node:test';
import assert from 'node:assert/strict';
import * as domain from '../config/aws/hubspot-approval/domain.mjs';
import { mayApprove, ordinaryAccess, parseHints } from '../config/aws/hubspot-approval/domain.mjs';
import { createWorker } from '../config/aws/hubspot-approval/index.mjs';
import { PARTICIPATION_PROPERTIES } from '../config/aws/hubspot-participation/properties.mjs';

const now = Date.parse('2026-09-09T10:00:00Z');
const account = () => ({ pk: 'USER#sub', participantId: 'pid', cognitoSub: 'sub', email: 'person@example.com',
  hubspotContactId: '123', hubspotPortalId: 144765514, active: true, suspended: false,
  reviewStatus: 'approved', enrolmentStatus: 'not_invited', accessVersion: 1 });
// A trusted per-domain decision is the only approval authority.
const decision = { domainId: 'conveyancing', id: 'a'.repeat(64), at: now - 1000, actor: '42', trusted: true, status: 'approved' };

test('approval and revocation have one control surface: the account-wide review field is gone', () => {
  assert.equal(PARTICIPATION_PROPERTIES.some(property => property.name === 'opda_review_status'), false);
  assert.equal(Object.hasOwn(domain, 'reviewDecision'), false);
  assert.equal(Object.hasOwn(domain, 'emailPredatesApproval'), false);
  assert.equal(Object.hasOwn(domain, 'approvedGroupSnapshot'), false);
  // The v1 account-wide worker is retired; only the domain worker can be constructed.
  assert.throws(() => createWorker({ store: {}, hubspot: {}, identity: {}, now: () => now }), /Domain approval cutover required/);
});

test('a domain approval cannot remove external suspension, erasure, expiry or expired enrolment', () => {
  for (const patch of [{ suspended: true, suspensionSource: 'security' }, { erasedAt: now },
    { deletedAt: now }, { expiresAt: Math.floor(now / 1000) }, { enrolmentStatus: 'expired' }]) {
    assert.equal(mayApprove({ ...account(), ...patch }, decision, now), false);
  }
  // A hold the worker itself placed can be lifted by a fresh domain approval.
  assert.equal(mayApprove({ ...account(), suspended: true, suspensionSource: 'hubspot-review' }, decision, now), true);
  assert.equal(mayApprove(account(), { ...decision, trusted: false }, now), false);
  assert.equal(mayApprove(account(), { ...decision, status: 'under_review' }, now), false);
});

test('ordinary access requires the derived approved state, an active account and a usable enrolment', () => {
  assert.equal(ordinaryAccess(account(), now), true);
  assert.equal(ordinaryAccess({ ...account(), active: false }, now), false);
  assert.equal(ordinaryAccess({ ...account(), reviewStatus: 'under_review' }, now), false);
  assert.equal(ordinaryAccess({ ...account(), enrolmentStatus: 'invited' }, now), false);
});

test('queue accepts contact hints only from its dedicated queue', () => {
  const r = { eventSource: 'aws:sqs', eventSourceARN: 'queue', body: JSON.stringify({ schemaVersion: 1,
    contactIds: ['123'], receivedAt: now }) };
  assert.deepEqual(parseHints(r, 'queue'), ['123']);
  assert.throws(() => parseHints(r, 'another'));
});
