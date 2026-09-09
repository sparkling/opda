import { DOMAIN_REVIEW_PROPERTIES } from '../hubspot-participation/properties.mjs';
import { APPROVED_GROUPS, CONTACT_ID, REVIEW, contactProfile, digest } from './domain.mjs';

const HISTORY_KEYS = ['value', 'timestamp', 'sourceType', 'sourceId', 'updatedByUserId'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const blank = value => value === undefined || value === null || value === '';
const bounded = value => typeof value === 'string' ? value.slice(0, 2048)
  : typeof value === 'number' || typeof value === 'boolean' || value === null ? value : typeof value;
// A malformed observation has a stable, bounded denial fingerprint. No raw
// history, email address, or user identifier is returned in an error or log.
const evidence = value => Array.isArray(value)
  ? [value.length, ...value.slice(0, 2001).map(item => object(item)
    ? HISTORY_KEYS.map(key => bounded(item[key])) : bounded(item))] : bounded(value);

function readHistory(history, now) {
  if (!Array.isArray(history) || !history.length || history.length > 2000) return { invalid: true };
  const entries = [];
  for (const item of history) {
    if (!object(item) || typeof item.timestamp !== 'string'
      || (typeof item.value !== 'string' && item.value !== null)
      || (typeof item.value === 'string' && item.value.length > 1024)) return { invalid: true };
    const at = Date.parse(item.timestamp);
    if (!Number.isSafeInteger(at) || at < 0 || at > now) return { invalid: true };
    entries.push({ ...item, at });
  }
  entries.sort((a, b) => b.at - a.at);
  for (let index = 1; index < entries.length; index++) {
    const previous = entries[index - 1], current = entries[index];
    if (previous.at === current.at && HISTORY_KEYS.some(key => previous[key] !== current[key])) {
      return { invalid: true, at: entries[0].at };
    }
  }
  return { entries, current: entries[0], at: entries[0].at };
}

function reviewer(history) {
  const source = history.sourceId;
  const sourceActor = /^userId:([1-9][0-9]{0,19})$/.exec(String(source ?? ''))?.[1];
  if (history.updatedByUserId !== undefined && history.updatedByUserId !== null
    && typeof history.updatedByUserId !== 'string'
    && !Number.isSafeInteger(history.updatedByUserId)) return null;
  const actor = history.updatedByUserId === undefined || history.updatedByUserId === null
    ? sourceActor : String(history.updatedByUserId);
  if (history.sourceType !== 'CRM_UI' || !CONTACT_ID.test(actor ?? '')
    || (source !== undefined && source !== null && !sourceActor)
    || (sourceActor && sourceActor !== actor)) return null;
  return actor;
}

function approvalEvidence(contact, decision, now) {
  const histories = contact.propertiesWithHistory ?? {}, properties = contact.properties ?? {};
  try { contactProfile(contact); }
  catch { return { reason: 'email-not-established-before-domain-review' }; }
  const email = readHistory(histories.email, now);
  if (email.invalid || email.current.at > decision.at
    || typeof email.current.value !== 'string' || typeof properties.email !== 'string'
    || email.current.value.trim().toLowerCase() !== properties.email.trim().toLowerCase()) {
    return { reason: 'email-not-established-before-domain-review' };
  }
  const requests = readHistory(histories.opda_requested_working_groups, now);
  if (requests.invalid || requests.current.value !== properties.opda_requested_working_groups) {
    return { reason: 'domain-selection-history-missing-or-inconsistent' };
  }
  const selected = requests.entries.find(item => item.at <= decision.at);
  if (!selected || typeof selected.value !== 'string') return { reason: 'domain-selection-history-missing-or-inconsistent' };
  const values = selected.value === '' ? [] : selected.value.split(';');
  if (values.length > APPROVED_GROUPS.length || new Set(values).size !== values.length
    || values.some(value => !APPROVED_GROUPS.includes(value))) return { reason: 'domain-selection-invalid' };
  if (!values.includes(decision.domainId)) return { reason: 'domain-not-selected-at-review' };
  const groups = [decision.domainId];
  return { groupSnapshot: { snapshotStatus: 'approved', groups, groupsAt: selected.at,
    groupDigest: digest(JSON.stringify(groups)), reason: 'reviewed-domain-selection' } };
}

/**
 * Independent staff decisions, never authority from webhook values or interests.
 * The store must compare IDs before time: a changed untrusted observation denies
 * that domain even when history time is unusable, retaining a hold that only a
 * fresh, trusted edit can clear. Replayed observations have the same ID. A future
 * or malformed timestamp uses observation time, never a future ordering watermark.
 */
export function domainReviewDecisions(contact, { cutover, now = Date.now() } = {}) {
  if (!Number.isSafeInteger(cutover) || cutover < 0 || !Number.isSafeInteger(now) || now < 0) {
    throw new TypeError('Domain review policy unavailable');
  }
  if (!contact || contact.archived) return [];
  if (typeof contact.id !== 'string' || !CONTACT_ID.test(contact.id)) throw new TypeError('Invalid review contact');
  const result = [];
  for (const [domainId, property] of Object.entries(DOMAIN_REVIEW_PROPERTIES).sort(([a], [b]) => a.localeCompare(b))) {
    const value = contact.properties?.[property], rawHistory = contact.propertiesWithHistory?.[property];
    if (blank(value) && (rawHistory === undefined || rawHistory === null
      || (Array.isArray(rawHistory) && rawHistory.length === 0))) continue;
    const history = readHistory(rawHistory, now);
    const deny = (reason, additionalEvidence = null) => ({ domainId,
      id: digest(JSON.stringify([contact.id, domainId, 'denied', reason, bounded(value),
        evidence(rawHistory), additionalEvidence])),
      at: history.at ?? now, actor: null, trusted: false, status: 'under_review', reason,
    });
    if (history.invalid) { result.push(deny('domain-review-history-missing-or-ambiguous')); continue; }
    if (history.at < cutover) continue; // Existing entitlements require an explicit migration, never a new grant.
    const current = history.current, actor = reviewer(current);
    const cleared = blank(value) && blank(current.value);
    const status = cleared ? 'withdrawn' : value;
    if (!actor || (!cleared && current.value !== value) || !REVIEW.has(status)) {
      result.push(deny('untrusted-domain-review-change')); continue;
    }
    const decision = { domainId,
      id: digest(JSON.stringify([contact.id, domainId, status, current.at, current.sourceType, actor])),
      at: current.at, actor, trusted: true, status,
      reason: cleared ? 'domain-review-cleared' : 'hubspot-manual-domain-review',
    };
    if (status === 'approved') {
      const verified = approvalEvidence(contact, decision, now);
      if (!verified.groupSnapshot) {
        result.push(deny(verified.reason, [bounded(contact.properties?.email),
          evidence(contact.propertiesWithHistory?.email), bounded(contact.properties?.opda_requested_working_groups),
          evidence(contact.propertiesWithHistory?.opda_requested_working_groups)]));
        continue;
      }
      decision.groupSnapshot = verified.groupSnapshot;
    }
    result.push(decision);
  }
  return result;
}
