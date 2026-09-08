import { createHash } from 'node:crypto';
import { CONTACT_PROPERTIES } from '../hubspot-participation/import.mjs';

export const PORTAL_ID = 144765514;
export const CONTACT_ID = /^[1-9][0-9]{0,19}$/;
export const REVIEW = new Set(['received', 'under_review', 'approved', 'rejected', 'withdrawn']);
export const digest = value => createHash('sha256').update(value).digest('hex');
export const emailHash = email => digest(email.trim().toLowerCase());
export const mappingKey = id => `CRM#CONTACT#${id}`;

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

function latest(history) {
  if (!Array.isArray(history) || !history.length) return null;
  const sorted = history.map(item => ({ ...item, at: Date.parse(item.timestamp) })).sort((a, b) => b.at - a.at);
  if (sorted.some(item => !Number.isFinite(item.at))) return null;
  if (sorted.some(item => item.at === sorted[0].at && ['value', 'sourceType', 'sourceId', 'updatedByUserId']
    .some(key => item[key] !== sorted[0][key]))) return null;
  return sorted[0];
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
