import { createHash } from 'node:crypto';
import { CONTACT_PROPERTIES } from '../hubspot-participation/import.mjs';
import { PARTICIPATION_PROPERTIES } from '../hubspot-participation/properties.mjs';

export const PORTAL_ID = 144765514;
export const CONTACT_ID = /^[1-9][0-9]{0,19}$/;
export const REVIEW = new Set(['received', 'under_review', 'approved', 'rejected', 'withdrawn']);
export const digest = value => createHash('sha256').update(value).digest('hex');
export const emailHash = email => digest(email.trim().toLowerCase());
export const mappingKey = id => `CRM#CONTACT#${id}`;
export const APPROVED_GROUPS = Object.freeze(PARTICIPATION_PROPERTIES
  .find(property => property.name === 'opda_requested_working_groups').options.map(option => option.value));

export function contactProfile(contact) {
  if (!CONTACT_ID.test(contact?.id) || contact.archived) throw new Error('Contact unavailable');
  const p = contact.properties ?? {};
  const email = typeof p.email === 'string' ? p.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)) {
    throw new Error('Contact email requires review');
  }
  return { contactId: contact.id, email,
    name: String(p.opda_full_name || [p.firstname, p.lastname].filter(Boolean).join(' ') || email).slice(0, 256),
    profile: Object.fromEntries(CONTACT_PROPERTIES.map(key => [key, typeof p[key] === 'string' ? p[key] : null])),
  };
}

function latest(history, before = Infinity) {
  if (!Array.isArray(history) || !history.length || history.length > 2000
    || history.some(item => !item || typeof item !== 'object' || Array.isArray(item)
      || typeof item.timestamp !== 'string')) return null;
  const sorted = history.map(item => ({ ...item, at: Date.parse(item.timestamp) })).sort((a, b) => b.at - a.at);
  if (sorted.some(item => !Number.isSafeInteger(item.at) || item.at < 0)) return null;
  const current = sorted.find(item => item.at <= before);
  if (!current || sorted.some(item => item.at === current.at && ['value', 'sourceType', 'sourceId', 'updatedByUserId']
    .some(key => item[key] !== current[key]))) return null;
  return current;
}

/** A checkbox edit is evidence to review, not a later expansion of an approval. */
export function approvedGroupSnapshot(contact, decision) {
  const failed = reason => ({ snapshotStatus: 'review_required', groups: [],
    groupDigest: digest('[]'), groupsAt: null, reason });
  if (!decision?.trusted || decision.status !== 'approved' || !Number.isSafeInteger(decision.at)) {
    return failed('manual-approval-required');
  }
  const history = contact?.propertiesWithHistory?.opda_requested_working_groups;
  const current = latest(history), selected = latest(history, decision.at);
  if (!current || !selected) return failed('group-history-missing-or-ambiguous');
  if (current.value !== contact?.properties?.opda_requested_working_groups) return failed('group-history-inconsistent');
  if (typeof selected.value !== 'string' || selected.value.length > 1024) return failed('group-selection-invalid');
  const values = selected.value === '' ? [] : selected.value.split(';');
  if (values.length > APPROVED_GROUPS.length || new Set(values).size !== values.length
    || values.some(value => !APPROVED_GROUPS.includes(value))) return failed('group-selection-invalid');
  const groups = APPROVED_GROUPS.filter(group => values.includes(group));
  return { snapshotStatus: groups.length ? 'approved' : 'empty', groups,
    groupDigest: digest(JSON.stringify(groups)), groupsAt: selected.at,
    reason: groups.length ? 'reviewed-group-selection' : 'empty-group-selection' };
}

/** Only a current manual CRM edit is approval authority. Webhook values are not. */
export function reviewDecision(contact, { cutover, now = Date.now() }) {
  if (!Number.isFinite(cutover) || !Number.isSafeInteger(now)) throw new Error('Review policy unavailable');
  if (!contact || contact.archived) return null;
  const history = latest(contact.propertiesWithHistory?.opda_review_status);
  if (!history || history.at < cutover) return null; // Preserve the frozen historical import.
  if (history.at > now + 60000) throw new Error('Review clock mismatch');
  const sourceActor = /^userId:(\d+)$/.exec(String(history.sourceId ?? ''))?.[1];
  const actor = history.updatedByUserId ? String(history.updatedByUserId) : sourceActor;
  const status = contact.properties?.opda_review_status;
  const trusted = history.sourceType === 'CRM_UI' && CONTACT_ID.test(actor ?? '')
    && (!sourceActor || sourceActor === actor) && REVIEW.has(status) && history.value === status;
  const id = digest(JSON.stringify([contact.id, status, history.at, history.sourceType, actor ?? null]));
  return { id, at: history.at, actor: actor ?? null, status: trusted ? status : 'under_review',
    reason: trusted ? 'hubspot-manual-review' : 'untrusted-review-change', trusted,
  };
}

export function emailPredatesApproval(contact, decision) {
  const email = latest(contact.propertiesWithHistory?.email);
  return Boolean(email && email.at <= decision.at
    && String(email.value).trim().toLowerCase() === String(contact.properties?.email).trim().toLowerCase());
}

export function ordinaryAccess(account, now) {
  return account?.reviewStatus === 'approved' && account.active === true && account.suspended === false
    && !account.erasedAt && !account.deletedAt && (!account.expiresAt || account.expiresAt > Math.floor(now / 1000))
    && ['not_invited', 'complete'].includes(account.enrolmentStatus);
}

export function mayApprove(account, decision, now) {
  return decision?.trusted && decision.status === 'approved' && !account.erasedAt && !account.deletedAt
    && (!account.suspended || account.suspensionSource === 'hubspot-review')
    && (!account.expiresAt || account.expiresAt > Math.floor(now / 1000))
    && ['not_invited', 'complete'].includes(account.enrolmentStatus);
}

export function parseHints(record, queueArn) {
  if (!queueArn || record?.eventSource !== 'aws:sqs' || record.eventSourceARN !== queueArn
    || typeof record.body !== 'string' || Buffer.byteLength(record.body) > 8192) throw new Error('Invalid approval message');
  let value;
  try { value = JSON.parse(record.body); } catch { throw new Error('Invalid approval message'); }
  if (value?.schemaVersion !== 1 || !Array.isArray(value.contactIds) || !value.contactIds.length
    || value.contactIds.length > 100 || value.contactIds.some(id => typeof id !== 'string' || !CONTACT_ID.test(id))
    || !Number.isSafeInteger(value.receivedAt) || !/^[a-f0-9]{64}$/.test(value.receiptId ?? '')) {
    throw new Error('Invalid approval message');
  }
  return [...new Set(value.contactIds)];
}
