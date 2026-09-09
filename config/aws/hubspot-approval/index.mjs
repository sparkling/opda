import { createHubSpotClient } from './client.mjs';
import { createIdentity } from './identity.mjs';
import { createStore } from './store.mjs';
import { CONTACT_ID, contactProfile, reviewDecision, approvedGroupSnapshot, emailPredatesApproval, ordinaryAccess, parseHints } from './domain.mjs';
import { createOnboardingNotifier, onboardingHint } from './onboarding.mjs';

export function createWorker({ store, hubspot, identity, cutover, notifyOnboarding, now = Date.now }) {
  if (!Number.isFinite(cutover)) throw new Error('Approval cutover required');
  async function relayOnboarding() {
    if (!notifyOnboarding) return { notified: 0 };
    const pending = await store.pendingOnboarding();
    for (const operation of pending) {
      try { await notifyOnboarding(onboardingHint(operation.operationId)); }
      catch { throw new Error('Onboarding notification incomplete'); }
    }
    return { notified: pending.length };
  }
  async function processContact(contactId) {
    if (!CONTACT_ID.test(contactId)) throw new Error('Invalid contact reference');
    let contact = await hubspot.getContact(contactId);
    let binding = await store.binding(contactId);
    let decision = reviewDecision(contact, { cutover, now: now() });
    if (!binding) {
      if (!decision?.trusted || decision.status !== 'approved' || !emailPredatesApproval(contact, decision)) return;
      binding = await store.reserve(contactProfile(contact), now());
    }
    if (!binding.cognitoSub) {
      if (!decision?.trusted || decision.status !== 'approved' || !emailPredatesApproval(contact, decision)) return;
      const profile = contactProfile(contact);
      if (profile.email !== binding.email) throw new Error('Reserved identity changed');
      await store.checkPending(binding, now());
      const sub = await identity.ensure(binding);
      binding = await store.attach(binding, sub, now()); // Initially inactive, even if creation succeeded.
      contact = await hubspot.getContact(contactId); // Never grant from a pre-provisioning observation.
      decision = reviewDecision(contact, { cutover, now: now() });
    }
    let account = await store.account(binding);
    let reason;
    if (!contact || contact.archived) reason = 'contact-unavailable';
    else {
      try {
        if (contactProfile(contact).email !== binding.email) reason = 'identity-changed';
      } catch { reason = 'identity-changed'; }
    }
    if (reason) ({ binding, account } = await store.hold(binding, account, reason, now()));
    else if (decision) ({ binding, account } = await store.apply(binding, account, {
      ...decision, ...(decision.trusted && decision.status === 'approved'
        ? { groupSnapshot: approvedGroupSnapshot(contact, decision) } : {}),
    }, now()));
    if (binding.onboarding && !ordinaryAccess(account, now()) && (binding.onboarding.action === 'provision'
      || binding.onboarding.accessVersion !== account.accessVersion)) {
      ({ binding, account } = await store.hold(binding, account, 'access-unavailable', now()));
    }
    // No browser sessions or role grants are issued here. Existing sessions check
    // AWS eligibility/version on every protected request, including revocations.
    const enabled = ordinaryAccess(account, now());
    try {
      await identity.setAccess(account, enabled);
      if (contact && !contact.archived) await hubspot.projectStatus(contactId, {
        active: enabled, enrolmentStatus: account.enrolmentStatus,
      });
      await store.markEffects(binding, account);
    } finally {
      // Even a Cognito outage must not suppress a committed Microsoft revocation.
      if (notifyOnboarding && binding.onboarding) await notifyOnboarding(onboardingHint(binding.onboarding.operationId));
    }
  }
  async function reconcileContacts() {
    const contacts = await hubspot.listContacts(); // Complete inventory or throw; never infer deletion from a partial page.
    const { accounts, bindings } = await store.inventory();
    const current = new Map(contacts.map(c => [c.id, c]));
    const maps = new Map(bindings.map(b => [b.contactId, b]));
    const accountByContact = new Map(accounts.map(a => [a.hubspotContactId, a]));
    const pending = new Set();
    for (const contact of contacts) {
      const d = reviewDecision(contact, { cutover, now: now() });
      const map = maps.get(contact.id);
      if (d && d.id !== map?.decisionId && d.at > (map?.holdAt ?? 0)) pending.add(contact.id);
    }
    for (const account of accounts) {
      const c = current.get(account.hubspotContactId), map = maps.get(account.hubspotContactId);
      const active = ordinaryAccess(account, now());
      if (!c || c.properties?.email?.trim().toLowerCase() !== account.email
        || c.properties?.opda_active !== String(active)
        || c.properties?.opda_enrolment_status !== account.enrolmentStatus
        || (map && map.providerAccessVersion !== account.accessVersion)
        || (!active && map?.onboarding && (map.onboarding.action === 'provision'
          || map.onboarding.accessVersion !== account.accessVersion))) pending.add(account.hubspotContactId);
    }
    for (const map of bindings) if (!accountByContact.has(map.contactId)) pending.add(map.contactId);
    if (pending.size > 5000) throw new Error('Reconciliation bound exceeded');
    let failures = 0;
    for (const id of pending) {
      try { await processContact(id); } catch { failures++; }
    }
    if (failures) throw new Error(`Approval reconciliation incomplete (${failures})`);
    return { checked: contacts.length, processed: pending.size };
  }
  async function reconcile() {
    try { return await reconcileContacts(); }
    finally { await relayOnboarding(); } // Outbox repair is independent of CRM/Cognito availability.
  }
  return { processContact, reconcile, relayOnboarding };
}

let runtime;
function defaults() {
  runtime ??= createWorker({
    store: createStore({ participantsTableName: process.env.PARTICIPANTS_TABLE_NAME,
      registrationsTableName: process.env.REGISTRATIONS_TABLE_NAME,
      onboardingCutover: process.env.ONBOARDING_CUTOVER ? Date.parse(process.env.ONBOARDING_CUTOVER) : undefined }),
    hubspot: createHubSpotClient({ secretArn: process.env.BRIDGE_SECRET_ARN }),
    identity: createIdentity({ poolId: process.env.USER_POOL_ID }),
    cutover: Date.parse(process.env.REVIEW_CUTOVER),
    notifyOnboarding: process.env.ONBOARDING_QUEUE_URL ? createOnboardingNotifier(process.env.ONBOARDING_QUEUE_URL) : undefined,
  });
  return runtime;
}
export function createHandler({ worker, queueArn } = {}) {
  return async event => {
    const active = worker ?? defaults();
    if (event?.source === 'opda.hubspot-approval' && event['detail-type'] === 'reconcile') return active.reconcile();
    if (!Array.isArray(event?.Records) || !event.Records.length) throw new Error('Invalid approval invocation');
    const failures = [];
    for (const record of event.Records) {
      try {
        for (const id of parseHints(record, queueArn ?? process.env.APPROVAL_QUEUE_ARN)) await active.processContact(id);
      } catch {
        failures.push({ itemIdentifier: record.messageId });
        // Sanitized aggregate signal only; queue body, contact IDs and provider errors are not logged.
      }
    }
    if (failures.length && !worker) console.error(JSON.stringify({ event: 'approval_batch_retry', count: failures.length }));
    return { batchItemFailures: failures };
  };
}
export const handler = createHandler();
