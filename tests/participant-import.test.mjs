import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { APPROVAL, emailKey, initialParticipant, planApprovedContacts, snapshotDigest } from '../config/aws/hubspot-participation/import.mjs';

const contact = (id = '1', email = 'person@example.org') => ({
  id, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', archived: false,
  properties: { email, firstname: 'Test', lastname: 'Person', opda_requested_working_groups: 'finance-and-banking' },
});
test('only the bounded existing-contact snapshot is approved', () => {
  const future = { ...contact('2'), createdAt: '2026-09-09T00:00:00Z' };
  const plan = planApprovedContacts([contact(), future]);
  assert.equal(plan.approved.length, 1);
  assert.equal(plan.approval, APPROVAL);
  assert.deepEqual(plan.excluded, [{ contactId: '2', reason: 'outside-approved-snapshot' }]);
});
test('missing, malformed, archived and ambiguous email records do not create accounts', () => {
  const plan = planApprovedContacts([contact('1', ''), contact('2', 'bad'), { ...contact('3'), archived: true },
    contact('4', 'shared@example.org'), contact('5', ' SHARED@example.org ')]);
  assert.equal(plan.approved.length, 0);
  assert.equal(plan.excluded.length, 5);
  assert.equal(plan.excluded.filter(x => x.reason === 'ambiguous-primary-email').length, 2);
});
test('a complete inventory must contain valid distinct contact identifiers', () => {
  assert.throws(() => planApprovedContacts([contact(), contact()]), /repeated contact ID/);
  assert.throws(() => planApprovedContacts([contact('../1')]), /Invalid/);
  assert.throws(() => planApprovedContacts(null), /Invalid/);
});
test('profile fields survive without converting requested groups or CRM statuses into grants', () => {
  const c = contact(); c.properties.opda_active = 'true'; c.properties.opda_review_status = 'approved';
  const plan = planApprovedContacts([c]);
  const digest = snapshotDigest(plan);
  const p = initialParticipant(plan.approved[0], { participantId: 'participant', cognitoSub: 'subject', importedAt: 1788892000000, digest });
  assert.equal(p.active, true);
  assert.equal(p.enrolmentStatus, 'not_invited');
  assert.equal(p.reviewStatus, 'approved');
  assert.equal(p.suspended, false);
  assert.equal(p.accessVersion, 1);
  assert.equal(p.profile.opda_requested_working_groups, 'finance-and-banking');
  assert.equal(p.profile.opda_active, 'true');
  assert.equal(p.email_verified, undefined);
  assert.equal(p.grants, undefined);
  assert.equal(p.approvedGroups, undefined);
  assert.equal(p.sourceSnapshotDigest, digest);
});
test('email claim keys contain a digest, not a personal address', () => {
  assert.match(emailKey('person@example.org'), /^EMAIL#[a-f0-9]{64}$/);
  assert.equal(emailKey(' PERSON@example.org '), emailKey('person@example.org'));
});
test('identity infrastructure disables public signup and separates persistent records from sessions', async () => {
  const stack = await readFile(new URL('../config/aws/participant-identity-stack.yaml', import.meta.url), 'utf8');
  assert.match(stack, /AllowAdminCreateUserOnly: true/);
  assert.match(stack, /AllowedFirstAuthFactors: \[EMAIL_OTP\]/);
  assert.match(stack, /ManagedLoginVersion: 2/);
  assert.match(stack, /PreventUserExistenceErrors: ENABLED/);
  assert.match(stack, /AllowedOAuthFlows: \[code\]/);
  assert.match(stack, /RecoveryPeriodInDays: 35/);
  assert.match(stack, /BlockPublicPolicy: true/);
  assert.match(stack, /Prefix: recovery\//, 'only recovery snapshots expire; approval evidence is retained');
  assert.match(stack, /TimeToLiveSpecification: \{ AttributeName: expiresAt, Enabled: true \}/);
  assert.doesNotMatch(stack, /ALLOW_USER_PASSWORD_AUTH|ALLOW_ADMIN_USER_PASSWORD_AUTH/);
});
