import { DOMAIN_REVIEW_PROPERTIES } from '../hubspot-participation/properties.mjs';
import { approvalEvidence } from '../hubspot-approval/domain-reviews.mjs';
import { CONTACT_ID, digest } from '../hubspot-approval/domain.mjs';
import { createTeamsStore, reviewKey } from './store.mjs';

export const TEAMS_REASON = 'teams-bot-domain-review';
export const DECIDED = new Set(['approved', 'rejected']);
export const OBJECT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** The record's identity binds contact, domain, outcome, time, Entra actor and Teams message. */
export function teamsDecisionId({ contactId, domainId, status, at, actorObjectId, messageId }) {
  return digest(JSON.stringify(['teams-review', contactId, domainId, status, at, actorObjectId, messageId]));
}

export function validReviewRecord(record, contactId, domainId) {
  return object(record) && record.contactId === contactId && record.domainId === domainId
    && DECIDED.has(record.status) && Number.isSafeInteger(record.at) && record.at > 0
    && typeof record.actorObjectId === 'string' && OBJECT_ID.test(record.actorObjectId)
    && typeof record.messageId === 'string' && record.messageId.length > 0 && record.messageId.length <= 256
    && record.decisionId === teamsDecisionId(record);
}

/**
 * Only an integration-sourced review value can be a mirrored Teams decision, so
 * that is the only case worth a lookup. Returns the mirror entry the worker must
 * corroborate, or null when the normal CRM_UI policy applies unchanged.
 */
export function mirroredReview(contact, domainId) {
  const property = DOMAIN_REVIEW_PROPERTIES[domainId];
  const value = contact?.properties?.[property], history = contact?.propertiesWithHistory?.[property];
  if (!DECIDED.has(value) || !Array.isArray(history) || !history.length || history.length > 2000) return null;
  let latest = null;
  for (const item of history) {
    if (!object(item) || typeof item.timestamp !== 'string') return null;
    const at = Date.parse(item.timestamp);
    if (!Number.isSafeInteger(at)) return null;
    if (!latest || at > latest.at) latest = { ...item, at };
  }
  return latest.sourceType === 'INTEGRATION' && latest.value === value ? { value, latest, history } : null;
}

/**
 * Reconstitute a Teams decision only while the durable record and the CRM mirror
 * agree and no human has reviewed the domain since. Anything else falls through
 * to the normal policy, which denies an integration-sourced value: fail closed.
 */
export function corroborate(contact, domainId, record, now) {
  const mirror = mirroredReview(contact, domainId);
  if (!mirror || !validReviewRecord(record, contact.id, domainId) || record.at > now) return null;
  if (mirror.value !== record.status || mirror.latest.at < record.at) return null;
  for (const item of mirror.history) {
    const at = Date.parse(item.timestamp);
    if (at > record.at && (item.sourceType !== 'INTEGRATION' || item.value !== record.status)) return null;
  }
  const decision = { domainId, id: record.decisionId, at: record.at, actor: `teams:${record.actorObjectId}`,
    trusted: true, status: record.status, reason: TEAMS_REASON };
  if (record.status === 'approved') {
    const verified = approvalEvidence(contact, decision, now);
    if (!verified.groupSnapshot) return null;
    decision.groupSnapshot = verified.groupSnapshot;
  }
  return decision;
}

/** Worker-side source (ADR-0088): one strongly consistent read per mirrored domain, nothing otherwise. */
export function createTeamsDecisionSource({ participantsTableName, store } = {}) {
  const records = store ?? createTeamsStore({ participantsTableName });
  return async function teamsDecisions(contact, _binding, { now } = {}) {
    if (!Number.isSafeInteger(now) || now < 0) throw new TypeError('Teams decision clock unavailable');
    if (!contact || contact.archived || typeof contact.id !== 'string' || !CONTACT_ID.test(contact.id)) return [];
    const decisions = [];
    for (const domainId of Object.keys(DOMAIN_REVIEW_PROPERTIES).sort()) {
      if (!mirroredReview(contact, domainId)) continue;
      const decision = corroborate(contact, domainId, await records.get(reviewKey(contact.id, domainId)), now);
      if (decision) decisions.push(decision);
    }
    return decisions;
  };
}
