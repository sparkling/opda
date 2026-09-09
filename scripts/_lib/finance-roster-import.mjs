import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { readCsv } from './csv.mjs';
import { APPROVED_GROUPS, contactProfile, digest, mayApprove } from '../../config/aws/hubspot-approval/domain.mjs';
import { planDomainApprovals } from '../../config/aws/hubspot-approval/domain-onboarding.mjs';
import { FINANCE_IMPORT_ID, FINANCE_ROSTER_SHA256, FINANCE_DOMAIN_ID,
  captureFinanceImport, financeImportDecisions } from '../../config/aws/hubspot-approval/finance-import.mjs';

export const ROSTER_FILE = new URL('../../source/_inbox/finance-banking-working-group/participants.csv', import.meta.url);
export const IMPORT_PREFIX = `FINANCE_IMPORT#${FINANCE_IMPORT_ID}#`;
export const LEGACY_APPROVAL_ID = 'legacy-auth0-allowlist-2026-09-08';
const REVIEW_PROPERTY = 'opda_review_finance_and_banking';

export function indexFinanceContacts(roster, contacts) {
  const target = new Set(roster.map(row => row.email)), matched = new Map();
  for (const contact of contacts) {
    const primary = contact.properties?.email?.trim().toLowerCase();
    const aliases = (contact.properties?.hs_additional_emails ?? '').split(';').map(email => email.trim().toLowerCase());
    const matching = [...new Set([primary, ...aliases].filter(email => target.has(email)))];
    if (!matching.length) continue;
    if (contact.archived || matching.length !== 1 || matching[0] !== primary || matched.has(primary)) throw new Error('CRM archive or alias requires review');
    contactProfile(contact); matched.set(primary, contact);
  }
  return matched;
}

export function readFinanceRoster() {
  if (digest(readFileSync(ROSTER_FILE)) !== FINANCE_ROSTER_SHA256) throw new Error('Roster source pin mismatch');
  const rows = readCsv(ROSTER_FILE);
  const emails = new Set();
  for (const row of rows) {
    const profile = contactProfile({ id: '1', properties: { email: row.email, opda_full_name: row.display_name } });
    if (!row.display_name?.trim() || row.display_name.length > 256 || /[\u0000-\u001f\u007f<>]/u.test(row.display_name)
      || emails.has(profile.email)) throw new Error('Invalid roster identity');
    emails.add(profile.email); row.email = profile.email;
  }
  if (rows.length !== 372 || digest(readFileSync(ROSTER_FILE)) !== FINANCE_ROSTER_SHA256) throw new Error('Roster changed');
  return rows;
}

/** Only the operator-authorised Finance review; no other domain or marketing consent. */
export function financeProperties(roster, contact) {
  const p = contact?.properties ?? {};
  if (contact && (contact.archived || contactProfile(contact).email !== roster.email)) throw new Error('Contact identity mismatch');
  for (const key of ['opda_review_status', REVIEW_PROPERTY]) {
    if (p[key] && !['received', 'approved'].includes(p[key])) throw new Error('Contact has a newer review hold');
  }
  const selected = p.opda_requested_working_groups ? p.opda_requested_working_groups.split(';') : [];
  if (new Set(selected).size !== selected.length || selected.some(id => !APPROVED_GROUPS.includes(id))) throw new Error('Invalid existing interests');
  const properties = {};
  const groups = APPROVED_GROUPS.filter(id => id === FINANCE_DOMAIN_ID || selected.includes(id)).join(';');
  if (groups !== p.opda_requested_working_groups) properties.opda_requested_working_groups = groups;
  if (p[REVIEW_PROPERTY] !== 'approved') properties[REVIEW_PROPERTY] = 'approved';
  if (p.opda_review_status !== 'approved') properties.opda_review_status = 'approved';
  if (!p.opda_full_name) properties.opda_full_name = roster.display_name;
  if (!contact) properties.email = roster.email;
  return properties;
}

export function assertImportAccount(map, row, now) {
  if (!map || !row || map.contactId !== row.hubspotContactId || map.email !== row.email
    || map.participantId !== row.participantId || map.cognitoSub !== row.cognitoSub
    || map.domainMigrationPending || row.domainMigrationPending || map.holdReason || map.domainGlobalState === 'held'
    || !mayApprove(row, { trusted: true, status: 'approved' }, now)) throw new Error('Account requires individual review');
}

/** Preserve a previously frozen website identity; never claim an arbitrary same-email account. */
export function legacyFinanceIdentity(person, claim, op, row, marker, now) {
  const key = `IMPORT#${LEGACY_APPROVAL_ID}#${digest(person.email)}`;
  if (claim?.importKey !== key || op?.pk !== key || op.phase !== 'complete' || op.email !== person.email
    || op.participantId !== claim.participantId || row?.participantId !== op.participantId
    || row.cognitoSub !== op.cognitoSub || row.pk !== `USER#${op.cognitoSub}` || row.email !== person.email
    || row.hubspotContactId || row.source !== 'legacy-auth0-allowlist' || row.approvalId !== LEGACY_APPROVAL_ID
    || marker?.pk !== `MIGRATION#${LEGACY_APPROVAL_ID}` || marker.approvedCount !== 6
    || row.sourceSnapshotDigest !== marker.digest || op.sourceSnapshotDigest !== marker.digest
    || row.sourceSnapshotVersionId !== marker.versionId
    || !mayApprove(row, { trusted: true, status: 'approved' }, now)) throw new Error('Legacy identity binding requires review');
  return row;
}

/** Seed historical permission without manufacturing an invitation, send receipt or enrolment. */
export function planFinanceSeed({ contact, map, row, actorArn, microsoft, now, cutover }) {
  assertImportAccount(map, row, now);
  if (map.financeRosterImport) throw new Error('Import already recorded; verify instead of reapproving');
  if (map.domainApprovals?.[FINANCE_DOMAIN_ID]) throw new Error('Finance has an existing decision');
  const receipt = captureFinanceImport(contact, map, { actorArn, microsoft, now });
  const importedMap = { ...map, financeRosterImport: receipt };
  const { globalDecision, domainDecision } = financeImportDecisions(contact, importedMap, { now });
  if (!globalDecision || !domainDecision) throw new Error('Import evidence did not round trip');
  const plan = planDomainApprovals({ map: importedMap, row, decisions: [domainDecision], globalDecision, now, cutover });
  if (!plan.fields.active || plan.fields.domainApprovals[FINANCE_DOMAIN_ID]?.status !== 'approved'
    || plan.operations.some(op => op.domainId !== FINANCE_DOMAIN_ID || op.action !== 'provision')) throw new Error('Unexpected import transition');
  plan.fields.domainApprovals[FINANCE_DOMAIN_ID].onboarding = null;
  plan.fields.domainApprovals[FINANCE_DOMAIN_ID].reason = 'operator-approved-historical-finance-import';
  for (const [id, value] of Object.entries(row.domainApprovals ?? {})) {
    if (!isDeepStrictEqual(value, plan.fields.domainApprovals[id])) throw new Error('Import changed another domain');
  }
  const nextMap = { ...importedMap, ...plan.mapFields, revision: map.revision + 1 };
  const account = { ...row, ...plan.fields, profile: { ...row.profile,
    opda_requested_working_groups: contact.properties.opda_requested_working_groups } };
  const audit = { pk: `${IMPORT_PREFIX}${digest(row.email)}`, importId: FINANCE_IMPORT_ID,
    sourceDigest: FINANCE_ROSTER_SHA256, contactId: map.contactId, participantId: row.participantId,
    cognitoSub: row.cognitoSub, at: now, actorArn, microsoft: receipt.microsoft, phase: 'approved',
    notifications: 'suppressed', microsoftProvisioning: 'not-requested', enrolmentStatus: row.enrolmentStatus };
  return { binding: nextMap, account, audit, operations: [] };
}
