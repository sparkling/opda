import { isDeepStrictEqual } from 'node:util';
import { APPROVED_GROUPS, digest, mayApprove, ordinaryAccess } from './domain.mjs';

export const DOMAIN_POLICY = 'individual-domains-v1';
const denied = new Set(['under_review', 'rejected', 'withdrawn']);
const hash = value => digest(JSON.stringify(value));

function initialDomains(map, row, cutover, now) {
  if (row.approvalPolicy === DOMAIN_POLICY) {
    if (!isDeepStrictEqual(map.domainApprovals, row.domainApprovals)) throw new Error('Domain approval binding mismatch');
    return structuredClone(row.domainApprovals);
  }
  // Carry only an already approved frozen selection, never today's requested interests.
  // The caller verifies historical completion before new grants. While that is
  // unresolved, it permits only denials and preserves this frozen prior scope.
  const snapshot = row.onboarding;
  if (!ordinaryAccess(row, now) || !snapshot || snapshot.action !== 'provision'
    || snapshot.snapshotStatus !== 'approved' || snapshot.decisionAt >= cutover
    || !isDeepStrictEqual(snapshot, map.onboarding)) return {};
  if (!Array.isArray(snapshot.groups) || !isDeepStrictEqual(snapshot.groups,
    APPROVED_GROUPS.filter(id => snapshot.groups.includes(id))) || snapshot.groupDigest !== hash(snapshot.groups)) {
    throw new Error('Historical domain approval snapshot requires review');
  }
  return Object.fromEntries(snapshot.groups.map(domainId => [domainId, {
    status: 'approved', version: 0, decisionId: hash(['legacy-domain', domainId, snapshot.decisionId]),
    decisionAt: snapshot.decisionAt, actor: snapshot.actor, reason: 'preserved-explicit-approval',
    legacy: true, onboarding: null,
  }]));
}

/** Pure per-domain state transition. It never derives a grant from application interests. */
export function planDomainApprovals({ map, row, decisions = [], globalDecision, holdReason, now, cutover }) {
  if (!Number.isSafeInteger(now) || !Number.isSafeInteger(cutover) || cutover < 0
    || !Array.isArray(decisions) || decisions.length > APPROVED_GROUPS.length
    || new Set(decisions.map(d => d.domainId)).size !== decisions.length) throw new Error('Invalid domain approval transition');
  const domains = initialDomains(map, row, cutover, now), previousDomains = structuredClone(domains);
  const migrated = row.approvalPolicy === DOMAIN_POLICY;
  // Retire old website-only flags without inventing or discarding frozen domain approvals.
  const legacyWebsiteApproved = false;
  const globalChanged = globalDecision && globalDecision.id !== map.domainGlobalDecisionId;
  const globalDenial = globalDecision && (!globalDecision.trusted || denied.has(globalDecision.status));
  const clearsGlobalHold = globalChanged && globalDecision.trusted && globalDecision.status === 'approved'
    && globalDecision.at > (map.domainHoldAt ?? 0);
  const globalHeld = globalDenial || map.domainGlobalState === 'held' && !clearsGlobalHold;
  const externalHold = row.suspended && row.suspensionSource !== 'hubspot-review';
  const unavailable = row.erasedAt || row.deletedAt || row.expiresAt && row.expiresAt <= Math.floor(now / 1000)
    || !['not_invited', 'complete'].includes(row.enrolmentStatus);
  const globalReason = holdReason || (globalHeld ? 'account-review-withdrawn' : externalHold || unavailable ? 'account-unavailable' : null);
  const holdChanged = (map.holdReason || null) !== globalReason;
  const globalAt = globalReason ? Math.max(map.domainHoldAt ?? 0, globalDenial && globalChanged ? globalDecision.at
    : map.holdReason === globalReason ? map.domainHoldAt ?? now : now) : map.domainHoldAt ?? 0;
  const changes = [];
  for (const decision of decisions) {
    const id = decision.domainId, before = domains[id];
    if (!APPROVED_GROUPS.includes(id) || !/^[a-f0-9]{64}$/.test(decision.id)
      || !Number.isSafeInteger(decision.at) || decision.at < 0) throw new Error('Invalid domain review decision');
    if (before?.decisionId === decision.id) continue;
    if (decision.trusted && (decision.at <= (before?.decisionAt ?? -1)
      || decision.at <= Math.max(before?.holdAt ?? 0, globalAt))) continue;
    const snapshot = decision.groupSnapshot;
    const approved = !globalReason && mayApprove(row, decision, now)
      && snapshot?.snapshotStatus === 'approved' && isDeepStrictEqual(snapshot.groups, [id])
      && snapshot.groupDigest === hash([id]) && Number.isSafeInteger(snapshot.groupsAt)
      && snapshot.groupsAt <= decision.at;
    const next = { status: approved ? 'approved' : decision.status === 'approved' ? 'under_review' : decision.status,
      version: (before?.version ?? 0) + 1, decisionId: decision.id, decisionAt: decision.at,
      actor: decision.actor ?? null, reason: approved ? 'individual-domain-approved' : decision.reason,
      legacy: false, onboarding: before?.onboarding ?? null,
      ...(!decision.trusted ? { holdAt: now } : before?.holdAt ? { holdAt: before.holdAt } : {}) };
    domains[id] = next;
    // Refreshing the evidence for an unchanged approval is not a new invitation.
    if ((before?.status === 'approved') !== approved) changes.push({ domainId: id, before, next, decision, approved });
  }
  if (globalReason) {
    for (const id of APPROVED_GROUPS) {
      const before = domains[id];
      if (before?.status !== 'approved') continue;
      const decision = { id: hash(['domain-hold', map.contactId, id, before.decisionId, globalReason, globalDecision?.id ?? null]),
        at: globalAt, actor: globalDecision?.actor ?? null, reason: globalReason };
      const next = { ...before, status: 'withdrawn', version: before.version + 1, decisionId: decision.id,
        decisionAt: globalAt, actor: decision.actor, holdAt: globalAt, reason: globalReason, legacy: false };
      domains[id] = next;
      changes.push({ domainId: id, before, next, decision, approved: false });
    }
  }
  const approvedDomains = APPROVED_GROUPS.filter(id => domains[id]?.status === 'approved');
  const active = !globalReason && approvedDomains.length > 0;
  // A change to one domain does not sign the person out of their remaining approved groups.
  // An external hold can already make ordinaryAccess false while the durable
  // active flag (and Cognito) is still true. Its disable must remain retryable.
  const eligibilityChanged = active !== row.active || active !== ordinaryAccess(row, now);
  const accessVersion = row.accessVersion + (eligibilityChanged ? 1 : 0);
  const operations = [], audits = [];
  for (const { domainId, before, next, decision, approved } of changes) {
    const operationId = hash([2, row.participantId, domainId, decision.id, next.version]);
    const groups = approved ? [domainId] : [];
    const snapshot = { operationId, action: approved ? 'provision' : 'revoke', domainId, domainVersion: next.version,
      snapshotStatus: approved ? 'approved' : 'denied', groups, groupDigest: hash(groups),
      groupsAt: approved ? decision.groupSnapshot.groupsAt : null, reason: next.reason,
      decisionId: decision.id, decisionAt: decision.at, actor: decision.actor ?? null,
      accessVersion, templateVersion: 2,
      ...(!approved && before?.status === 'approved' ? { notifyWithdrawal: true } : {}) };
    next.onboarding = snapshot;
    const auditKey = `CRM#AUDIT#${map.contactId}#${decision.id}`;
    operations.push({ pk: `CRM#ONBOARDING#${operationId}`, schemaVersion: 2, operationId, domainId,
      domainVersion: next.version, participantId: row.participantId, contactId: map.contactId, cognitoSub: row.cognitoSub,
      accountKey: row.pk, bindingKey: map.pk, auditKey, decisionId: decision.id, accessVersion,
      action: snapshot.action, status: 'pending', createdAt: now });
    audits.push({ pk: auditKey, participantId: row.participantId, contactId: map.contactId,
      decisionId: decision.id, actor: decision.actor ?? null, at: now, reviewStatus: approved ? 'approved' : next.status,
      active, accessVersion, reason: next.reason, onboarding: snapshot });
  }
  const fields = { approvalPolicy: DOMAIN_POLICY, domainApprovals: domains, legacyWebsiteApproved,
    approvedDomains, active, reviewStatus: active ? 'approved' : 'under_review', suspended: !active,
    suspensionSource: externalHold ? row.suspensionSource ?? 'external' : active ? '' : 'hubspot-review',
    accessVersion, updatedAt: now };
  if (active && !row.approvedAt && approvedDomains.length) {
    const first = domains[approvedDomains[0]];
    fields.approvedAt = first.decisionAt; fields.approvalId = first.decisionId;
  }
  for (const id of APPROVED_GROUPS) {
    const state = domains[id];
    if (!state || state.decisionId === previousDomains[id]?.decisionId || audits.some(audit => audit.decisionId === state.decisionId)) continue;
    audits.push({ pk: `CRM#AUDIT#${map.contactId}#${state.decisionId}`, participantId: row.participantId,
      contactId: map.contactId, domainId: id, domainVersion: state.version, decisionId: state.decisionId,
      decisionAt: state.decisionAt, actor: state.actor, at: now, reviewStatus: state.status,
      active, accessVersion, reason: state.reason });
  }
  const mapFields = { approvalPolicy: DOMAIN_POLICY, domainApprovals: domains,
    holdReason: globalReason ?? '',
    ...(globalReason && (holdChanged || eligibilityChanged) ? { providerAccessVersion: null } : {}),
    ...(globalChanged ? { domainGlobalDecisionId: globalDecision.id } : {}),
    ...(globalHeld || clearsGlobalHold ? { domainGlobalState: globalHeld ? 'held' : 'clear' } : {}),
    ...(globalReason ? { domainHoldAt: globalAt, holdReason: globalReason } : {}) };
  const changed = !migrated || !isDeepStrictEqual(domains, previousDomains) || globalChanged
    || holdChanged || eligibilityChanged || legacyWebsiteApproved !== row.legacyWebsiteApproved;
  return { changed: Boolean(changed), fields, mapFields, operations, audits };
}
