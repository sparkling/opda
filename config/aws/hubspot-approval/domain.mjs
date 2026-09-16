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
    || !Number.isSafeInteger(value.receivedAt)) {
    throw new Error('Invalid approval message');
  }
  return [...new Set(value.contactIds)];
}
