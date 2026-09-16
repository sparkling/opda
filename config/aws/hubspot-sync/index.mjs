import { randomUUID } from 'node:crypto';
import { planInitialContactSync } from '../hubspot-participation/mapping.mjs';
import { createBatchHandler, REGISTRATION_ID } from '../shared/submission-message.mjs';
import { RetryLater } from '../shared/http-retry.mjs';
import { createHubSpotClient } from './client.mjs';
import { createStore, emailDigest } from './store.mjs';
export { RetryLater } from '../shared/http-retry.mjs';
export { parseSubmissionMessage } from '../shared/submission-message.mjs';

// Two terminal states, because exactly one question has a consumer: did this
// application become a contact we created? `closed` means it did not, and the
// reason says why. Staff work from the HubSpot task, not from this column.
//
// A claim is identified by the states that are still in progress, never by the
// terminal ones. That is the safe direction — an unrecognised state stops rather
// than acting twice — and it keeps the pre-ADR-0087 terminals (`quarantined`,
// `suppressed`) settled without a migration. `terminalOf` reads them forward.
const IN_PROGRESS = new Set(['open', 'held', 'creating', 'reviewing', 'retry']);
const settled = claim => !IN_PROGRESS.has(claim.state);
const terminalOf = claim => (claim.state === 'synced' ? 'synced' : 'closed');
// ADR-0084 §4: at most one automatic CRM creation or task per email in 24 hours,
// and 100 new contacts per day. This throttles CRM writes only. The applicant's
// acknowledgement is a separate worker and is never delayed by any of it.
const EMAIL_TASK_INTERVAL_MS = 24 * 60 * 60 * 1000;
// Lambda execution is capped at 60s; a durable "in flight" marker outlives one attempt.
const LEASE_MS = 120000;

const liveSource = (source, registrationId, timestamp) => source && source.registrationId === registrationId
  && !source.deletedAt && !source.erasedAt && Number.isSafeInteger(source.expiresAt)
  && source.expiresAt > Math.floor(timestamp / 1000);

/**
 * Durable sync records are not participant accounts and carry no grants.
 *
 * This worker owns one thing: the CRM record for an application. It creates the
 * initial applicant contact, or raises a review task when a human must decide.
 * It never emails the applicant — `config/aws/acknowledgement` does that from its
 * own queue, so a CRM match, throttle or outage cannot silence a receipt.
 */
export function createWorker({ store, hubspot, now = Date.now, newId = randomUUID, transferNoticeVersion }) {
  /**
   * A later application from an email the CRM already knows. Staff must still see
   * it: the applicant may have requested a new working group. It becomes one review
   * task on the known contact, at most once per email per day; a repeat inside that
   * window waits in the queue rather than vanishing. Without a known contact there
   * is nothing to attach a task to, so it stays AWS evidence.
   */
  async function repeat(claim, registrationId, source, finish, timestamp) {
    if (!settled(claim)) throw new RetryLater(60);
    const contactIds = claim.contactId ? [claim.contactId] : claim.candidateContactIds ?? [];
    if (!contactIds.length) return finish('closed', 'repeat-application');
    if (claim.repeatRegistrationId !== registrationId) {
      // A replay of this registration after a crash proceeds; any other repeat waits
      // for the email's daily window measured from its last creation or task.
      const lastTaskAt = claim.lastTaskAt ?? claim.updatedAt ?? claim.createdAt;
      const wait = (lastTaskAt + EMAIL_TASK_INTERVAL_MS - timestamp) / 1000;
      if (wait > 0) throw new RetryLater(Math.min(wait, 43200));
    }
    // Claim this repeat BEFORE the POST so a crash cannot create a second task.
    claim = await store.put({ ...claim, repeatRegistrationId: registrationId }, claim);
    const task = await hubspot.createReviewTask({ contactIds, registrationId,
      requestedGroups: source.workingGroups, dueAt: timestamp });
    // The daily window advances only once HubSpot has confirmed a task, so a failed
    // POST never spends the next applicant's window on a task nobody can see.
    await store.put({ ...claim, lastTaskAt: timestamp }, claim);
    return finish('closed', 'repeat-application-reviewed',
      { candidateContactIds: contactIds, reviewTaskId: task.id });
  }

  async function syncContact(registrationId, pk, source, timestamp) {
    // A terminal record is the whole idempotency guard: no record means no decision yet.
    const decided = await store.get(pk);
    if (decided) return decided;
    let emailHash;
    const finish = (state, reason, extra = {}) => store.put({ pk, registrationId, state, reason,
      createdAt: timestamp, updatedAt: timestamp, ...(emailHash ? { emailHash } : {}), ...extra });
    if (!liveSource(source, registrationId, timestamp)) return finish('closed', 'missing-expired-or-erased');
    let plan;
    try { plan = planInitialContactSync(source, { contactMatches: [], now: timestamp }); }
    catch { return finish('closed', 'invalid-source'); }
    if (!transferNoticeVersion || source.privacyNoticeVersion !== transferNoticeVersion) {
      return finish('closed', 'privacy-review');
    }
    emailHash = emailDigest(plan.properties.email);
    if (await store.get(`SYNC#SUPPRESS#REGISTRATION#${registrationId}`)
      || await store.get(`SYNC#SUPPRESS#EMAIL#${emailHash}`)) {
      return finish('closed', 'suppression-record');
    }
    const claimKey = `SYNC#EMAIL#${emailHash}`;
    let claim = await store.get(claimKey);
    // The claim is the per-email mutex and the home of the canonical participant
    // reference. Allocating one identifies a record, never a proven person.
    if (!claim) claim = await store.put({ pk: claimKey, registrationId,
      participantId: newId(), state: 'open', createdAt: timestamp });
    if (claim.registrationId !== registrationId) return repeat(claim, registrationId, source, finish, timestamp);
    const settle = async (state, reason, extra = {}) => {
      claim = await store.put({ ...claim, state, reason, updatedAt: timestamp, ...extra }, claim);
      return finish(state, reason, extra);
    };
    if (settled(claim)) {
      return finish(terminalOf(claim), claim.reason, {
        ...(claim.contactId ? { contactId: claim.contactId } : {}),
        ...(claim.candidateContactIds ? { candidateContactIds: claim.candidateContactIds } : {}),
        ...(claim.reviewTaskId ? { reviewTaskId: claim.reviewTaskId } : {}) });
    }
    if (claim.state === 'creating') {
      // Lambda execution is capped at 60s; allow its write acknowledgement to
      // finish before another delivery attempts ambiguity reconciliation.
      const leaseRemaining = (claim.attemptedAt + LEASE_MS - timestamp) / 1000;
      if (leaseRemaining > 0) throw new RetryLater(leaseRemaining);
      // This also covers success followed by a failed DynamoDB acknowledgement.
      // Even a matching email cannot prove that this operation made the contact.
      const matches = await hubspot.findContacts(plan.properties.email);
      return settle('closed', 'ambiguous-create', { candidateContactIds: matches });
    }
    if (claim.nextAttemptAt > timestamp) throw new RetryLater((claim.nextAttemptAt - timestamp) / 1000);
    if (claim.state === 'reviewing') {
      // A review task attempt is in flight or was interrupted. Unlike a contact, a
      // second task is visible and harmless, while a missing one silently drops the
      // applicant; after the lease, retry rather than reconcile.
      const leaseRemaining = (claim.attemptedAt + LEASE_MS - timestamp) / 1000;
      if (leaseRemaining > 0) throw new RetryLater(leaseRemaining);
    }
    const matches = claim.state === 'reviewing' ? claim.candidateContactIds : await hubspot.findContacts(plan.properties.email);
    if (matches.length) {
      // ADR-0084 §4: never update the existing contact from anonymous input; hand the
      // application to a human as one open review task per normalised email.
      if (claim.state !== 'reviewing') {
        claim = await store.put({ ...claim, state: 'reviewing', attemptedAt: timestamp, candidateContactIds: matches }, claim);
      }
      const task = await hubspot.createReviewTask({ contactIds: matches, registrationId,
        requestedGroups: source.workingGroups, dueAt: timestamp });
      return settle('closed', matches.length === 1 ? 'existing-contact' : 'ambiguous-contacts',
        { candidateContactIds: matches, reviewTaskId: task.id, lastTaskAt: timestamp });
    }
    const reserved = await store.authorizeCreation(claim, source, now());
    if (!reserved) throw new RetryLater(43200);
    claim = reserved;
    let contact;
    try { contact = await hubspot.createContact(plan.properties); }
    catch (error) {
      if (error instanceof RetryLater) {
        claim = await store.put({ ...claim, state: 'retry', nextAttemptAt: timestamp + error.seconds * 1000 }, claim);
      }
      // An arbitrary failure intentionally leaves "creating" for safe replay.
      throw error;
    }
    if (!/^[1-9][0-9]*$/.test(contact?.id) || contact.email !== plan.properties.email) {
      throw new Error('Ambiguous HubSpot create result');
    }
    return settle('synced', 'contact-created', { contactId: contact.id, lastTaskAt: timestamp });
  }

  return async function syncRegistration(registrationId) {
    if (!REGISTRATION_ID.test(registrationId)) throw new TypeError('Invalid registration reference');
    await syncContact(registrationId, `SYNC#APPLICATION#${registrationId}`, await store.getRegistration(registrationId), now());
  };
}

let runtime;
function defaults() {
  runtime ??= {
    worker: createWorker({
      store: createStore({ registrationsTableName: process.env.REGISTRATIONS_TABLE_NAME,
        participantsTableName: process.env.PARTICIPANTS_TABLE_NAME, maxCreatesPerDay: 100 }),
      hubspot: createHubSpotClient({ secretArn: process.env.BRIDGE_SECRET_ARN }),
      transferNoticeVersion: process.env.TRANSFER_NOTICE_VERSION,
    }),
    async changeVisibility(record, seconds) {
      const aws = await import('@aws-sdk/client-sqs');
      await new aws.SQSClient({ maxAttempts: 2 }).send(new aws.ChangeMessageVisibilityCommand({
        QueueUrl: process.env.SYNC_QUEUE_URL, ReceiptHandle: record.receiptHandle, VisibilityTimeout: seconds,
      }));
    },
  };
  return runtime;
}

export function createHandler(overrides = {}) {
  return async event => {
    const dependencies = overrides.worker ? overrides : { ...defaults(), ...overrides };
    return createBatchHandler({ work: dependencies.worker, RetryLater, jitter: !overrides.worker,
      queueArn: () => dependencies.queueArn ?? process.env.SYNC_QUEUE_ARN,
      changeVisibility: dependencies.changeVisibility })(event);
  };
}
export const handler = createHandler();
