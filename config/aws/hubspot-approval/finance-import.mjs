import { APPROVED_GROUPS, CONTACT_ID, contactProfile, digest } from './domain.mjs';
import { DOMAIN_REVIEW_PROPERTIES } from '../hubspot-participation/properties.mjs';

export const FINANCE_IMPORT_ID = 'finance-banking-roster-2026-09-10';
export const FINANCE_ROSTER_SHA256 = '185045af93540be013b5c5f769af12e92ff4982c44d19e37d8ba5547dc7a8a85';
export const FINANCE_ROSTER_COUNT = 372;
export const FINANCE_DOMAIN_ID = 'finance-and-banking';

const FINANCE_PROPERTY = DOMAIN_REVIEW_PROPERTIES[FINANCE_DOMAIN_ID];
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const STS_ACTOR = /^arn:aws:sts::355653384628:assumed-role\/[A-Za-z0-9+=,.@_/-]{1,256}\/[A-Za-z0-9+=,.@_-]{1,128}$/;
const MICROSOFT_STATES = new Set(['Accepted', 'PendingAcceptance', 'Member']);
const OBSERVATION_KEYS = ['value', 'timestamp', 'sourceType', 'sourceId', 'updatedByUserId'];
const RECEIPT_KEYS = ['actorArn', 'capturedAt', 'cognitoSub', 'cohortSize', 'contactId', 'domainDecisionId',
  'domainDecisionAt', 'domainId', 'domainObservationHash', 'domainReviewedAt', 'email', 'emailObservationHash', 'emailObservedAt',
  'globalDecisionId', 'globalObservationHash', 'globalReviewedAt', 'importId', 'microsoft', 'participantId',
  'receiptDigest', 'schemaVersion', 'selectedFinanceAt', 'selectedFinanceObservationHash', 'sourceDigest'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => object(value)
  && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
const fail = () => { throw new Error('Finance roster import boundary failed'); };

function scalar(value, length = 512) {
  return typeof value === 'string' && value.length > 0 && value.length <= length ? value : null;
}

function actorId(value) {
  if (value === undefined || value === null) return null;
  const text = String(value);
  return CONTACT_ID.test(text) ? text : undefined;
}

function observation(contact, property, now) {
  const history = contact?.propertiesWithHistory?.[property];
  if (!Array.isArray(history) || !history.length || history.length > 2000) return null;
  const entries = [];
  for (const item of history) {
    const sourceId = item?.sourceId === undefined || item?.sourceId === null || item?.sourceId === ''
      ? null : scalar(item.sourceId, 512);
    if (!object(item) || typeof item.value !== 'string' || item.value.length > 1024
      || typeof item.timestamp !== 'string' || !scalar(item.sourceType, 128)
      || sourceId === null && ![undefined, null, ''].includes(item.sourceId)) return null;
    const at = Date.parse(item.timestamp), updatedByUserId = actorId(item.updatedByUserId);
    if (!Number.isSafeInteger(at) || at < 0 || at > now || updatedByUserId === undefined) return null;
    const normalized = { value: item.value, timestamp: new Date(at).toISOString(), sourceType: item.sourceType,
      sourceId, updatedByUserId };
    entries.push({ at, normalized });
  }
  entries.sort((a, b) => b.at - a.at);
  const latest = entries[0];
  if (entries.some(entry => entry.at === latest.at
    && OBSERVATION_KEYS.some(key => entry.normalized[key] !== latest.normalized[key]))) return null;
  if (contact?.properties?.[property] !== latest.normalized.value) return null;
  return { at: latest.at, hash: digest(JSON.stringify([property, ...OBSERVATION_KEYS.map(key => latest.normalized[key])])) };
}

function microsoftReference(value, now) {
  if (value === undefined || value === null) return null;
  if (!exactKeys(value, ['observedAt', 'state', 'userId']) || !UUID.test(value.userId ?? '')
    || !MICROSOFT_STATES.has(value.state) || !Number.isSafeInteger(value.observedAt)
    || value.observedAt < 0 || value.observedAt > now) fail();
  return { userId: value.userId.toLowerCase(), state: value.state, observedAt: value.observedAt };
}

function unavailable(binding, now) {
  const expired = binding.expiresAt !== undefined && binding.expiresAt !== null
    && (!Number.isSafeInteger(binding.expiresAt) || binding.expiresAt <= Math.floor(now / 1000));
  return binding.erasedAt !== undefined && binding.erasedAt !== null
    || binding.deletedAt !== undefined && binding.deletedAt !== null || expired;
}

function identity(contact, binding, now) {
  if (!object(binding) || unavailable(binding, now) || binding.pk !== `CRM#CONTACT#${binding.contactId}`
    || !CONTACT_ID.test(binding.contactId ?? '') || !UUID.test(binding.participantId ?? '')
    || !UUID.test(binding.cognitoSub ?? '')) return null;
  let profile;
  try { profile = contactProfile(contact); } catch { return null; }
  if (profile.contactId !== binding.contactId || profile.email !== binding.email) return null;
  return profile;
}

function payload(receipt) {
  return Object.fromEntries(RECEIPT_KEYS.filter(key => key !== 'receiptDigest').map(key => [key, receipt[key]]));
}

function decisionIds(receipt) {
  return {
    globalDecisionId: digest(JSON.stringify([FINANCE_IMPORT_ID, receipt.contactId, 'global',
      receipt.globalObservationHash, receipt.globalReviewedAt])),
    domainDecisionId: digest(JSON.stringify([FINANCE_IMPORT_ID, receipt.contactId, FINANCE_DOMAIN_ID,
      receipt.domainObservationHash, receipt.domainDecisionAt, receipt.selectedFinanceObservationHash,
      receipt.selectedFinanceAt])),
  };
}

function validReceipt(receipt, binding, now) {
  if (!exactKeys(receipt, RECEIPT_KEYS) || receipt.schemaVersion !== 1 || receipt.importId !== FINANCE_IMPORT_ID
    || receipt.sourceDigest !== FINANCE_ROSTER_SHA256 || receipt.cohortSize !== FINANCE_ROSTER_COUNT
    || receipt.domainId !== FINANCE_DOMAIN_ID || receipt.contactId !== binding.contactId
    || receipt.email !== binding.email || receipt.participantId !== binding.participantId
    || receipt.cognitoSub !== binding.cognitoSub || !STS_ACTOR.test(receipt.actorArn ?? '')
    || !Number.isSafeInteger(receipt.capturedAt) || receipt.capturedAt < 0 || receipt.capturedAt > now
    || ![receipt.globalReviewedAt, receipt.domainReviewedAt, receipt.domainDecisionAt,
      receipt.emailObservedAt, receipt.selectedFinanceAt]
      .every(at => Number.isSafeInteger(at) && at >= 0 && at <= receipt.capturedAt)
    || receipt.domainDecisionAt !== Math.max(receipt.domainReviewedAt, receipt.selectedFinanceAt)
    || ![receipt.globalObservationHash, receipt.domainObservationHash, receipt.emailObservationHash,
      receipt.selectedFinanceObservationHash, receipt.receiptDigest].every(hash => SHA256.test(hash ?? ''))) return false;
  try { microsoftReference(receipt.microsoft, receipt.capturedAt); } catch { return false; }
  const ids = decisionIds(receipt);
  return receipt.globalDecisionId === ids.globalDecisionId && receipt.domainDecisionId === ids.domainDecisionId
    && receipt.receiptDigest === digest(JSON.stringify(payload(receipt)));
}

/** Capture only the operator-authorised cohort observation; callers persist the returned receipt atomically. */
export function captureFinanceImport(contact, binding, { actorArn, now, microsoft } = {}) {
  if (!Number.isSafeInteger(now) || now < 0 || !STS_ACTOR.test(actorArn ?? '')
    || Object.hasOwn(binding ?? {}, 'financeRosterImport') || !identity(contact, binding, now)) fail();
  const global = observation(contact, 'opda_review_status', now);
  const domain = observation(contact, FINANCE_PROPERTY, now);
  const email = observation(contact, 'email', now);
  const selected = observation(contact, 'opda_requested_working_groups', now);
  const selectedGroups = contact.properties.opda_requested_working_groups.split(';');
  if (contact.properties.opda_review_status !== 'approved'
    || contact.properties[FINANCE_PROPERTY] !== 'approved' || !global || !domain || !email || !selected
    || selectedGroups.length > APPROVED_GROUPS.length || new Set(selectedGroups).size !== selectedGroups.length
    || selectedGroups.some(group => !APPROVED_GROUPS.includes(group))
    || !selectedGroups.includes(FINANCE_DOMAIN_ID)) fail();
  const receipt = { schemaVersion: 1, importId: FINANCE_IMPORT_ID, sourceDigest: FINANCE_ROSTER_SHA256,
    cohortSize: FINANCE_ROSTER_COUNT, domainId: FINANCE_DOMAIN_ID, contactId: binding.contactId,
    email: binding.email, participantId: binding.participantId, cognitoSub: binding.cognitoSub,
    capturedAt: now, actorArn, globalObservationHash: global.hash, globalReviewedAt: global.at,
    domainObservationHash: domain.hash, domainReviewedAt: domain.at,
    domainDecisionAt: Math.max(domain.at, selected.at),
    emailObservationHash: email.hash, emailObservedAt: email.at,
    selectedFinanceObservationHash: selected.hash, selectedFinanceAt: selected.at,
    microsoft: microsoftReference(microsoft, now) };
  Object.assign(receipt, decisionIds(receipt));
  receipt.receiptDigest = digest(JSON.stringify(payload(receipt)));
  return receipt;
}

/** Reconstitute authority only while the exact stored identity and captured observations remain current. */
export function financeImportDecisions(contact, binding, { now } = {}) {
  const missing = { globalDecision: null, domainDecision: null };
  if (!Number.isSafeInteger(now) || now < 0 || !identity(contact, binding, now)) return missing;
  const receipt = binding.financeRosterImport;
  if (!validReceipt(receipt, binding, now)) return missing;
  const email = observation(contact, 'email', now);
  if (!email || email.hash !== receipt.emailObservationHash || email.at !== receipt.emailObservedAt) return missing;
  const global = observation(contact, 'opda_review_status', now);
  const domain = observation(contact, FINANCE_PROPERTY, now);
  const globalDecision = contact.properties.opda_review_status === 'approved' && global
    && global.hash === receipt.globalObservationHash && global.at === receipt.globalReviewedAt
    ? { id: receipt.globalDecisionId, at: receipt.globalReviewedAt, actor: receipt.actorArn,
      trusted: true, status: 'approved', reason: 'operator-finance-roster-import' } : null;
  const domainDecision = contact.properties[FINANCE_PROPERTY] === 'approved' && domain
    && domain.hash === receipt.domainObservationHash && domain.at === receipt.domainReviewedAt
    ? { domainId: FINANCE_DOMAIN_ID, id: receipt.domainDecisionId, at: receipt.domainDecisionAt,
      actor: receipt.actorArn, trusted: true, status: 'approved', reason: 'operator-finance-roster-import',
      groupSnapshot: { snapshotStatus: 'approved', groups: [FINANCE_DOMAIN_ID],
        groupDigest: digest(JSON.stringify([FINANCE_DOMAIN_ID])), groupsAt: receipt.selectedFinanceAt,
        reason: 'operator-finance-roster-selection' } } : null;
  return { globalDecision, domainDecision };
}
