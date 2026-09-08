import { createHash } from 'node:crypto';

export const APPROVAL = Object.freeze({
  id: 'hubspot-existing-contacts-2026-09-08',
  portalId: 144765514,
  cutoff: '2026-09-08T18:26:22.388Z',
  reason: 'Operator explicitly approved existing HubSpot contacts for website login.',
});
export const CONTACT_PROPERTIES = Object.freeze([
  'email', 'firstname', 'lastname', 'company', 'jobtitle',
  'opda_full_name', 'opda_role_or_expertise', 'opda_requested_working_groups',
  'opda_contribution_preferences', 'opda_relevant_perspective',
  'opda_review_status', 'opda_enrolment_status', 'opda_active',
]);
export const emailKey = email => `EMAIL#${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}`;
export const snapshotDigest = snapshot => createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

export function planApprovedContacts(contacts) {
  if (!Array.isArray(contacts) || contacts.length > 10000) throw new TypeError('Invalid contact inventory');
  const seenIds = new Set();
  const eligible = [], excluded = [];
  for (const contact of contacts) {
    if (!contact || !/^[1-9][0-9]*$/.test(contact.id) || seenIds.has(contact.id)) {
      throw new TypeError('Invalid or repeated contact ID; inventory is not safe to import');
    }
    seenIds.add(contact.id);
    const created = Date.parse(contact.createdAt);
    const reason = contact.archived ? 'archived'
      : !Number.isFinite(created) ? 'missing-creation-time'
        : created > Date.parse(APPROVAL.cutoff) ? 'outside-approved-snapshot' : null;
    if (reason) { excluded.push({ contactId: contact.id, reason }); continue; }
    const p = contact.properties ?? {};
    const email = typeof p.email === 'string' ? p.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)) {
      excluded.push({ contactId: contact.id, reason: 'missing-or-invalid-primary-email' }); continue;
    }
    const name = [p.firstname, p.lastname].filter(Boolean).join(' ').trim();
    eligible.push({
      contactId: contact.id, email, name: String(p.opda_full_name || name || email).slice(0, 256),
      profile: Object.fromEntries(CONTACT_PROPERTIES.map(key => [key, typeof p[key] === 'string' ? p[key] : null])),
      sourceCreatedAt: contact.createdAt, sourceUpdatedAt: contact.updatedAt ?? null,
    });
  }
  const counts = new Map();
  for (const c of eligible) counts.set(c.email, (counts.get(c.email) ?? 0) + 1);
  const approved = eligible.filter(c => {
    if (counts.get(c.email) === 1) return true;
    excluded.push({ contactId: c.contactId, reason: 'ambiguous-primary-email' });
    return false;
  }).sort((a,b) => a.contactId.localeCompare(b.contactId));
  return { approval: APPROVAL, scanned: contacts.length, approved, excluded };
}

export function initialParticipant(contact, { participantId, cognitoSub, importedAt, digest }) {
  if (!contact?.email || !participantId || !cognitoSub || !Number.isSafeInteger(importedAt)
    || !/^[a-f0-9]{64}$/.test(digest)) throw new TypeError('Invalid participant import binding');
  return {
    pk: `USER#${cognitoSub}`, participantId, cognitoSub, email: contact.email, name: contact.name,
    hubspotPortalId: APPROVAL.portalId, hubspotContactId: contact.contactId,
    profile: contact.profile, reviewStatus: 'approved', active: true, suspended: false,
    enrolmentStatus: 'not_invited', accessVersion: 1, createdAt: importedAt,
    approvedAt: Date.parse(APPROVAL.cutoff), approvalId: APPROVAL.id,
    approvalReason: APPROVAL.reason, sourceSnapshotDigest: digest,
  };
}
