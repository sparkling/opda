import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { financeProperties, assertImportAccount, planFinanceSeed, legacyFinanceIdentity, LEGACY_APPROVAL_ID, indexFinanceContacts } from '../scripts/_lib/finance-roster-import.mjs';
import { digest } from '../config/aws/hubspot-approval/domain.mjs';
import { DOMAIN_POLICY, planDomainApprovals } from '../config/aws/hubspot-approval/domain-onboarding.mjs';
import { financeImportDecisions } from '../config/aws/hubspot-approval/finance-import.mjs';

const roster = { email: 'reader@example.test', display_name: 'Example Reader' };
test('CRM lookup rejects duplicate, archived and secondary-email identity collisions', () => {
  const contact = { id: '1', properties: { email: roster.email } };
  assert.equal(indexFinanceContacts([roster], [contact]).get(roster.email), contact);
  assert.equal(indexFinanceContacts([roster], []).size, 0);
  assert.throws(() => indexFinanceContacts([roster], [contact, { ...contact, id: '2' }]));
  assert.throws(() => indexFinanceContacts([roster], [{ ...contact, archived: true }]));
  assert.throws(() => indexFinanceContacts([roster], [{ id: '2', properties: { email: 'different@example.test', hs_additional_emails: `first@example.test;${roster.email}` } }]));
});
test('historical Finance import writes only its approved domain and preserves interests/profile', () => {
  const contact = { id: '1', properties: { email: roster.email, opda_full_name: 'Existing Name',
    opda_review_status: 'approved', opda_requested_working_groups: 'conveyancing',
    opda_review_conveyancing: 'approved', opda_enrolment_status: 'complete' } };
  const patch = financeProperties(roster, contact);
  assert.deepEqual(patch, { opda_requested_working_groups: 'finance-and-banking;conveyancing',
    opda_review_finance_and_banking: 'approved' });
  assert.equal(contact.properties.opda_enrolment_status, 'complete');
});
test('new contacts have approval metadata, not invented Microsoft acceptance or website enrolment', () => {
  const patch = financeProperties(roster, null);
  assert.equal(patch.email, roster.email);
  assert.equal(patch.opda_review_finance_and_banking, 'approved');
  assert.equal(patch.opda_review_status, 'approved');
  assert.equal(patch.opda_enrolment_status, undefined);
  assert.equal(patch.opda_active, undefined);
  assert.equal(Object.keys(patch).some(key => /marketing|subscription|consent|membership_type/.test(key)), false);
});
test('historical import cannot override holds, archives, identity changes or arbitrary groups', () => {
  for (const p of [{ email: 'other@example.test' }, { email: roster.email, opda_review_status: 'withdrawn' },
    { email: roster.email, opda_review_finance_and_banking: 'rejected' },
    { email: roster.email, opda_requested_working_groups: 'arbitrary' }]) {
    assert.throws(() => financeProperties(roster, { id: '1', properties: p }));
  }
  assert.throws(() => financeProperties(roster, { id: '1', archived: true, properties: { email: roster.email } }));
});
test('silent import preserves erasure and external security holds', () => {
  const map = { contactId: '1', email: roster.email, participantId: 'participant', cognitoSub: 'subject' };
  const row = { ...map, hubspotContactId: '1', suspended: false, enrolmentStatus: 'not_invited' };
  assert.doesNotThrow(() => assertImportAccount(map, row, Date.now()));
  for (const change of [{ erasedAt: 1 }, { deletedAt: 1 }, { expiresAt: 1 },
    { suspended: true, suspensionSource: 'security' }, { enrolmentStatus: 'expired' },
    { domainMigrationPending: { operationId: 'pending' } }]) {
    assert.throws(() => assertImportAccount(map, { ...row, ...change }, Date.now()));
  }
});
test('operator tooling contains no mail sender or Microsoft write capability', () => {
  const source = readFileSync(new URL('../scripts/finance-participant-import.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /SendEmailCommand|SendMessageCommand|inviteRedeemUrl|createInvitation|sendInvitationMessage|postmark.*send/i);
  assert.match(source, /MessageAction: 'SUPPRESS'|createIdentity/);
  assert.match(source, /TransactWriteCommand/);
});

test('seeding preserves another group and completed authentication, with no replay work', () => {
  const now = Date.parse('2026-09-10T12:00:00Z'), cutover = now - 60000;
  const observed = value => [{ value, timestamp: new Date(now - 5000).toISOString(), sourceType: 'INTEGRATION', sourceId: 'integration:123' }];
  const properties = { email: roster.email, opda_full_name: roster.display_name, opda_requested_working_groups: 'finance-and-banking;conveyancing',
    opda_review_status: 'approved', opda_review_finance_and_banking: 'approved' };
  const contact = { id: '123', properties, propertiesWithHistory: Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, observed(value)])) };
  const other = { status: 'approved', version: 4, decisionId: 'a'.repeat(64), decisionAt: now - 10000,
    actor: '42', reason: 'individual-domain-approved', legacy: false, onboarding: { operationId: 'b'.repeat(64) } };
  const map = { pk: 'CRM#CONTACT#123', contactId: '123', email: roster.email,
    participantId: '00000000-0000-4000-8000-000000000001', cognitoSub: '10000000-0000-4000-8000-000000000001',
    revision: 2, domainApprovals: { conveyancing: structuredClone(other) }, approvalPolicy: DOMAIN_POLICY };
  const row = { ...map, pk: `USER#${map.cognitoSub}`, hubspotContactId: map.contactId, hubspotPortalId: 144765514,
    active: true, suspended: false, reviewStatus: 'approved', enrolmentStatus: 'complete', accessVersion: 4,
    approvedDomains: ['conveyancing'], legacyWebsiteApproved: false, auth0BindingKey: 'existing-subject', verifiedEmail: roster.email,
    profile: { company: 'Existing Company' } };
  const input = { contact, map, row, now, cutover,
    actorArn: 'arn:aws:sts::355653384628:assumed-role/AWSReservedSSO_Administrator/user@example.test',
    microsoft: { userId: '20000000-0000-4000-8000-000000000001', state: 'PendingAcceptance', observedAt: now - 100 } };
  const seeded = planFinanceSeed(input);
  assert.deepEqual(seeded.operations, []);
  assert.equal(seeded.account.domainApprovals['finance-and-banking'].onboarding, null);
  assert.deepEqual(seeded.account.domainApprovals.conveyancing, other);
  for (const key of ['enrolmentStatus', 'auth0BindingKey', 'verifiedEmail', 'accessVersion']) assert.equal(seeded.account[key], row[key]);
  assert.equal(seeded.audit.microsoft.state, 'PendingAcceptance');
  assert.equal(seeded.account.profile.company, 'Existing Company');
  const decisions = financeImportDecisions(contact, seeded.binding, { now });
  const replay = planDomainApprovals({ map: seeded.binding, row: seeded.account, decisions: [decisions.domainDecision], globalDecision: decisions.globalDecision, now, cutover });
  assert.equal(replay.changed, false); assert.deepEqual(replay.operations, []);
  assert.throws(() => planFinanceSeed({ ...input, map: seeded.binding, row: seeded.account }));
});

test('legacy adoption requires the frozen email claim, operation, identity and migration marker', () => {
  const participantId = 'participant', cognitoSub = 'subject', sourceDigest = 'a'.repeat(64);
  const op = { pk: `IMPORT#${LEGACY_APPROVAL_ID}#${digest(roster.email)}`, phase: 'complete', email: roster.email,
    participantId, cognitoSub, sourceSnapshotDigest: sourceDigest };
  const claim = { importKey: op.pk, participantId };
  const marker = { pk: `MIGRATION#${LEGACY_APPROVAL_ID}`, approvedCount: 6, digest: sourceDigest, versionId: 'frozen-version' };
  const row = { pk: `USER#${cognitoSub}`, cognitoSub, participantId, email: roster.email, source: 'legacy-auth0-allowlist',
    approvalId: LEGACY_APPROVAL_ID, sourceSnapshotDigest: sourceDigest, sourceSnapshotVersionId: marker.versionId,
    suspended: false, enrolmentStatus: 'not_invited' };
  assert.equal(legacyFinanceIdentity(roster, claim, op, row, marker, Date.now()), row);
  for (const patch of [{ hubspotContactId: 'existing' }, { cognitoSub: 'someone-else' }, { sourceSnapshotVersionId: 'other' }, { erasedAt: 1 }]) {
    assert.throws(() => legacyFinanceIdentity(roster, claim, op, { ...row, ...patch }, marker, Date.now()));
  }
  assert.throws(() => legacyFinanceIdentity(roster, { ...claim, participantId: 'other' }, op, row, marker, Date.now()));
});
