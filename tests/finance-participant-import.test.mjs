import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { financeProperties, assertImportAccount, planFinanceSeed, planFinanceRecovery, legacyFinanceIdentity, LEGACY_APPROVAL_ID, indexFinanceContacts, createFinanceImportFetch } from '../scripts/_lib/finance-roster-import.mjs';
import { digest } from '../config/aws/hubspot-approval/domain.mjs';
import { DOMAIN_POLICY, planDomainApprovals } from '../config/aws/hubspot-approval/domain-onboarding.mjs';
import { financeImportDecisions } from '../config/aws/hubspot-approval/finance-import.mjs';

const roster = { email: 'reader@example.test', display_name: 'Example Reader' };
test('bulk CRM requests are paced globally and retry only explicit rate-limit rejections', async () => {
  let now = 0; const starts = [], replies = [429, 200, 200];
  const request = createFinanceImportFetch({ now: () => now, pause: async ms => { now += ms; },
    fetch: async () => { starts.push(now); return new Response('{}', { status: replies.shift(), headers: { 'retry-after': '1' } }); } });
  const results = await Promise.all([request('https://example.test/one'), request('https://example.test/two')]);
  assert.deepEqual(results.map(r => r.status), [200, 200]);
  assert.deepEqual(starts, [0, 1000, 1200]);
  let failures = 0;
  const uncertain = createFinanceImportFetch({ fetch: async () => { failures++; throw new Error('transport failure'); } });
  await assert.rejects(uncertain('https://example.test/create', { method: 'POST' }));
  assert.equal(failures, 1, 'an ambiguous contact creation must never be retried blindly');
  let attempts = 0;
  const limited = createFinanceImportFetch({ now: () => now, pause: async ms => { now += ms; },
    fetch: async () => { attempts++; return new Response('{}', { status: 429, headers: { 'retry-after': '1' } }); } });
  assert.equal((await limited('https://example.test/limited')).status, 429);
  assert.equal(attempts, 5);
});
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

function seedFixture() {
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
  return { input, other };
}

test('seeding preserves another group and completed authentication, with no replay work', () => {
  const { input, other } = seedFixture(), { contact, row, now, cutover } = input;
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

test('recovery only clears this importer verification hold with unchanged approval evidence', () => {
  const { input, other } = seedFixture(), seeded = planFinanceSeed(input), id = 'finance-and-banking';
  const at = input.now + 1000, original = seeded.account.domainApprovals[id];
  const held = { ...original, status: 'under_review', version: 2,
    decisionId: digest(`${original.decisionId}:import-verification-failed`), decisionAt: at, holdAt: at,
    reason: 'finance-import-verification-failed', onboarding: null };
  const map = { ...seeded.binding, domainApprovals: { ...seeded.binding.domainApprovals, [id]: held } };
  const row = { ...seeded.account, domainApprovals: structuredClone(map.domainApprovals), approvedDomains: ['conveyancing'], updatedAt: at };
  const recovery = { contact: input.contact, map, row, audit: seeded.audit, actorArn: input.actorArn, now: at + 1000 };
  const repaired = planFinanceRecovery(recovery);
  assert.equal(repaired.account.domainApprovals[id].status, 'approved');
  assert.equal(repaired.account.domainApprovals[id].version, 3);
  assert.equal(repaired.account.domainApprovals[id].decisionId, original.decisionId);
  assert.equal(repaired.account.domainApprovals[id].holdAt, undefined);
  assert.equal(repaired.account.domainApprovals[id].onboarding, null);
  assert.deepEqual(repaired.account.domainApprovals.conveyancing, other);
  assert.equal(repaired.account.enrolmentStatus, 'complete');
  assert.equal(repaired.account.accessVersion, row.accessVersion);
  assert.equal(repaired.audit.notifications, 'suppressed');
  assert.equal(repaired.audit.verificationRecoveredAt, recovery.now);
  assert.deepEqual(repaired.binding.financeRosterImport, seeded.binding.financeRosterImport);
  assert.deepEqual(repaired.operations, []);
  const decisions = financeImportDecisions(input.contact, repaired.binding, { now: recovery.now });
  const replay = planDomainApprovals({ map: repaired.binding, row: repaired.account, decisions: [decisions.domainDecision],
    globalDecision: decisions.globalDecision, now: recovery.now, cutover: input.cutover });
  assert.equal(replay.changed, false); assert.deepEqual(replay.operations, []);
  for (const patch of [{ status: 'withdrawn' }, { version: 4 }, { decisionId: 'f'.repeat(64) },
    { reason: 'staff-review' }, { onboarding: { operationId: 'real-work' } }]) {
    const domains = { ...row.domainApprovals, [id]: { ...held, ...patch } };
    assert.throws(() => planFinanceRecovery({ ...recovery, map: { ...map, domainApprovals: domains }, row: { ...row, domainApprovals: domains } }));
  }
  assert.throws(() => planFinanceRecovery({ ...recovery, audit: { ...seeded.audit, verificationRecoveredAt: at } }));
  assert.throws(() => planFinanceRecovery({ ...recovery, row: { ...row, suspended: true, suspensionSource: 'security' } }));
  const edited = structuredClone(input.contact);
  edited.propertiesWithHistory.opda_review_finance_and_banking[0].sourceId = 'newer-review';
  assert.throws(() => planFinanceRecovery({ ...recovery, contact: edited }));
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
