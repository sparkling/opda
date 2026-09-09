import { CONTACT_ID, contactProfile, digest, ordinaryAccess, reviewDecision } from './domain.mjs';
import { domainReviewDecisions } from './domain-reviews.mjs';
import { DOMAIN_POLICY } from './domain-onboarding.mjs';
import { onboardingHint } from './onboarding.mjs';

const NEGATIVE = new Set(['under_review', 'rejected', 'withdrawn']);
const approved = decision => decision?.trusted && decision.status === 'approved'
  && decision.groupSnapshot?.snapshotStatus === 'approved'
  && decision.groupSnapshot.groups.length === 1 && decision.groupSnapshot.groups[0] === decision.domainId;
const globalDenial = decision => decision && (!decision.trusted || NEGATIVE.has(decision.status));
const bounded = value => typeof value === 'string' ? value.slice(0, 2048)
  : typeof value === 'number' || value === null ? value : typeof value;

async function notifyReferences(operationIds, notify) {
  if (!notify) return { notified: 0 };
  const ids = [...new Set(operationIds)];
  let cursor = 0, failures = 0;
  await Promise.all(Array.from({ length: Math.min(4, ids.length) }, async () => {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      try { await notify(onboardingHint(id)); } catch { failures++; }
    }
  }));
  if (failures) throw new Error('Onboarding notification incomplete');
  return { notified: ids.length };
}

export async function relayPendingOnboarding(store, notify) {
  if (!notify) return { notified: 0 };
  const page = await store.pendingOnboarding({ resumable: true });
  const operations = Array.isArray(page) ? page : page.operations;
  try {
    const result = await notifyReferences(operations.map(op => op.operationId), notify);
    if (page.invalid) throw new Error('Invalid onboarding outbox reference');
    return result;
  }
  finally { if (!Array.isArray(page)) await store.advanceOnboardingRelay(page); }
}

function globalReview(contact, cutover, now) {
  if (!contact || contact.archived) return null;
  const value = contact.properties?.opda_review_status;
  const history = contact.propertiesWithHistory?.opda_review_status;
  const evidence = Array.isArray(history) ? [history.length, ...history.slice(0, 2001)
    .map(item => ['value', 'timestamp', 'sourceType', 'sourceId', 'updatedByUserId'].map(key => bounded(item?.[key])))]
    : bounded(history);
  const deny = () => ({ id: digest(JSON.stringify([contact.id, 'global-review-denial', bounded(value), evidence])),
    at: now, actor: null, trusted: false, status: 'under_review', reason: 'untrusted-global-review-change' });
  let decision;
  try { decision = reviewDecision(contact, { cutover, now }); } catch { return deny(); }
  if (decision?.at > now) return deny(); // Never persist a future revocation/approval ordering watermark.
  // The anonymous intake writes Received. It is not an administrator's hold and
  // must not suppress an independently reviewed domain. It cannot clear a hold.
  if (value === 'received' && Array.isArray(history) && history.length && history.length <= 2000
    && history.every(item => item?.value === 'received' && item.sourceType === 'INTEGRATION')) return null;
  if (value === 'received' && Array.isArray(history) && history.some(item => NEGATIVE.has(item?.value))) return deny();
  if (decision) return decision;
  // A current explicit denial is not ignored just because its provenance or
  // timestamp is missing/older than this deployment's activation boundary.
  return NEGATIVE.has(value) ? deny() : null;
}

function domainDecisions(contact, binding, cutover, now) {
  const decisions = domainReviewDecisions(contact, { cutover, now });
  const present = new Set(decisions.map(decision => decision.domainId));
  for (const [domainId, state] of Object.entries(binding?.domainApprovals ?? {})) {
    if (present.has(domainId) || state.status !== 'approved' || state.legacy) continue;
    // A genuinely untouched blank is different from a managed approval whose
    // current property and edit history unexpectedly disappeared.
    decisions.push({ domainId, id: digest(JSON.stringify([binding.contactId, domainId,
      'domain-review-evidence-unavailable', state.decisionId])), at: now, actor: null,
    trusted: false, status: 'under_review', reason: 'domain-review-evidence-unavailable' });
  }
  return decisions.sort((a, b) => a.domainId.localeCompare(b.domainId));
}

function contactHold(contact, binding) {
  if (!contact || contact.archived) return 'contact-unavailable';
  try { if (contactProfile(contact).email === binding.email) return null; } catch { /* Deny, never transfer identity. */ }
  return 'identity-changed';
}

function accountHold(account, now) {
  if (account.erasedAt || account.deletedAt || account.expiresAt && account.expiresAt <= Math.floor(now / 1000)
    || !['not_invited', 'complete'].includes(account.enrolmentStatus)
    || account.suspended && account.suspensionSource !== 'hubspot-review') return 'account-unavailable';
  if (!ordinaryAccess(account, now) && (account.approvalPolicy === DOMAIN_POLICY
    ? Object.values(account.domainApprovals ?? {}).some(state => state.status === 'approved')
    : account.onboarding?.action === 'provision')) return 'access-unavailable';
  return null;
}

function changedDecision(decision, binding) {
  const before = binding?.domainApprovals?.[decision.domainId];
  if (decision.id === before?.decisionId) return false;
  return !decision.trusted || decision.at > Math.max(before?.decisionAt ?? -1,
    before?.holdAt ?? 0, binding?.domainHoldAt ?? 0);
}

/** Activated explicitly; v1 remains available only while rollout is disabled. */
export function createDomainWorker({ store, hubspot, identity, domainCutover, notifyOnboarding, now = Date.now }) {
  if (!Number.isSafeInteger(domainCutover) || domainCutover < 0) throw new Error('Domain approval cutover required');
  const clock = () => {
    const at = now();
    if (!Number.isSafeInteger(at) || at < 0) throw new Error('Domain approval clock unavailable');
    return at;
  };
  const notifyAll = ids => notifyReferences(ids, notifyOnboarding);
  async function relayOnboarding() {
    return relayPendingOnboarding(store, notifyOnboarding);
  }
  async function processContact(contactId) {
    if (typeof contactId !== 'string' || !CONTACT_ID.test(contactId)) throw new Error('Invalid contact reference');
    let contact = await hubspot.getContact(contactId), binding = await store.binding(contactId);
    let at = clock(), globalDecision = globalReview(contact, domainCutover, at);
    let decisions = domainDecisions(contact, binding, domainCutover, at);
    const mayReserve = () => !globalDenial(globalDecision) && decisions.some(approved);
    if (!binding) {
      if (!mayReserve()) return;
      binding = await store.reserve(contactProfile(contact), at);
    }
    if (!binding.cognitoSub) {
      if (!mayReserve()) return;
      const profile = contactProfile(contact);
      if (profile.email !== binding.email) throw new Error('Reserved identity changed');
      await store.checkPending(binding, clock());
      binding = await store.attach(binding, await identity.ensure(binding), clock());
      contact = await hubspot.getContact(contactId); // Creation never turns an earlier observation into a grant.
      at = clock();
      globalDecision = globalReview(contact, domainCutover, at);
      decisions = domainDecisions(contact, binding, domainCutover, at);
    }
    let account = await store.account(binding);
    const holdReason = contactHold(contact, binding) || accountHold(account, at);
    const newlyHeld = holdReason && (binding.holdReason !== holdReason || account.active
      || Object.values(account.domainApprovals ?? {}).some(state => state.status === 'approved'));
    ({ binding, account } = await store.applyDomains(binding, account, holdReason ? [] : decisions, at,
      { globalDecision, ...(holdReason ? { holdReason } : {}) }));
    const enabled = ordinaryAccess(account, clock());
    // External suspension may already make ordinaryAccess false before this
    // worker sees it. Still disable Cognito even if that did not advance a version.
    const providerPending = newlyHeld || binding.providerAccessVersion !== account.accessVersion;
    const projectionPending = contact && !contact.archived && (contact.properties?.opda_active !== String(enabled)
      || contact.properties?.opda_enrolment_status !== account.enrolmentStatus);
    try {
      if (providerPending) await identity.setAccess(account, enabled);
      if (projectionPending) await hubspot.projectStatus(contactId, { active: enabled, enrolmentStatus: account.enrolmentStatus });
      if (providerPending) await store.markEffects(binding, account);
    } finally {
      // Attempt every independent revocation even when Cognito or another queue
      // notification fails. The durable outbox repairs any interrupted handoff.
      await notifyAll([
        ...(binding.accessNotice ? [binding.accessNotice.operationId] : []),
        ...(binding.approvalPolicy !== DOMAIN_POLICY && binding.onboarding ? [binding.onboarding.operationId] : []),
        ...Object.values(binding.domainApprovals ?? {}).flatMap(state => state.onboarding ? [state.onboarding.operationId] : []),
      ]);
    }
  }
  async function reconcileContacts() {
    const contacts = await hubspot.listContacts(); // The client rejects incomplete inventories.
    const { accounts, bindings } = await store.inventory();
    const current = new Map(contacts.map(contact => [contact.id, contact]));
    const maps = new Map(bindings.map(binding => [binding.contactId, binding]));
    const rows = new Map(accounts.map(account => [account.hubspotContactId, account]));
    const pending = new Set(), at = clock();
    for (const contact of contacts) {
      const binding = maps.get(contact.id), account = rows.get(contact.id);
      try {
        const global = globalReview(contact, domainCutover, at);
        const decisions = domainDecisions(contact, binding, domainCutover, at);
        if (!binding && !account) {
          if (!globalDenial(global) && decisions.some(approved)) pending.add(contact.id);
          continue;
        }
        if (!binding || !account || account.approvalPolicy !== DOMAIN_POLICY || binding.domainMigrationPending
          || decisions.some(decision => changedDecision(decision, binding))
          || global && global.id !== binding.domainGlobalDecisionId) pending.add(contact.id);
      } catch { pending.add(contact.id); } // One bad contact must not suppress other withdrawals.
    }
    for (const account of accounts) {
      const contact = current.get(account.hubspotContactId), binding = maps.get(account.hubspotContactId);
      const active = ordinaryAccess(account, at), hold = accountHold(account, at);
      if (!contact || !binding || contactHold(contact, binding)
        || contact.properties?.opda_active !== String(active)
        || contact.properties?.opda_enrolment_status !== account.enrolmentStatus
        || binding.providerAccessVersion !== account.accessVersion
        || hold && (binding.holdReason !== hold || account.active
          || Object.values(account.domainApprovals ?? {}).some(state => state.status === 'approved'))) pending.add(account.hubspotContactId);
    }
    for (const binding of bindings) if (!rows.has(binding.contactId)) pending.add(binding.contactId);
    if (pending.size > 5000) throw new Error('Domain reconciliation bound exceeded');
    let failures = 0;
    for (const id of pending) {
      try { await processContact(id); } catch { failures++; }
    }
    if (failures) throw new Error(`Domain approval reconciliation incomplete (${failures})`);
    return { checked: contacts.length, processed: pending.size };
  }
  async function reconcile() {
    try { return await reconcileContacts(); } finally { await relayOnboarding(); }
  }
  return { processContact, reconcile, relayOnboarding };
}
