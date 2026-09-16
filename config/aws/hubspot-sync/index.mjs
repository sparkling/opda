import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { planInitialContactSync } from '../hubspot-participation/mapping.mjs';
import { buildAcknowledgementPayload } from '../hubspot-participation/acknowledgement.mjs';
import { WORKING_GROUP_LABELS } from '../hubspot-participation/properties.mjs';
import { createHubSpotClient } from './client.mjs';
import { createPostmarkClient } from './postmark.mjs';
import { ACKNOWLEDGEMENT_PIN } from './settings.mjs';
import { createStore, emailDigest } from './store.mjs';
import { RetryLater } from './errors.mjs';
export { RetryLater } from './errors.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FINAL = new Set(['synced', 'quarantined', 'suppressed']);
// An application is acknowledged once staff can see it: a created contact, or a review task.
const ACKNOWLEDGED_REASONS = new Set(['pending-applicant-created', 'existing-contact', 'ambiguous-contacts',
  'ambiguous-create', 'repeat-application-reviewed']);
// ADR-0084 §4: at most one automatic CRM creation or task per email in 24 hours.
const EMAIL_TASK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const ACK_FINAL = new Set(['accepted', 'rejected', 'suppressed', 'unknown']);
// Lambda execution is capped at 60s; a durable "in flight" marker outlives one attempt.
const LEASE_MS = 120000;
const exactKeys = (object, keys) => object && !Array.isArray(object)
  && Object.keys(object).length === keys.length && keys.every(key => Object.hasOwn(object, key));

export function parseSubmissionMessage(message, queueArn) {
  if (!queueArn || message?.eventSource !== 'aws:sqs' || message.eventSourceARN !== queueArn
    || typeof message.body !== 'string' || Buffer.byteLength(message.body) > 2048) throw new TypeError('Invalid sync queue message');
  let event;
  try { event = JSON.parse(message.body); } catch { throw new TypeError('Invalid sync event'); }
  if (!exactKeys(event, ['schemaVersion', 'eventId', 'eventType', 'occurredAt', 'record'])
    || event.schemaVersion !== 1 || event.eventType !== 'working-group-interest.received.v1'
    || typeof event.eventId !== 'string' || !/^[a-zA-Z0-9:._-]{1,256}$/.test(event.eventId)
    || typeof event.occurredAt !== 'string' || event.occurredAt.length > 40 || !Number.isFinite(Date.parse(event.occurredAt))
    || !exactKeys(event.record, ['kind', 'id']) || event.record.kind !== 'working-group-interest'
    || !UUID.test(event.record.id)) throw new TypeError('Invalid sync event');
  return event.record.id;
}

function evidenceDigest(source) {
  const fields = ['registrationId', 'fullName', 'email', 'organisation', 'role', 'workingGroups',
    'contributions', 'relevantPerspective', 'acknowledgement', 'privacyNoticeVersion', 'createdAt', 'expiresAt'];
  // Never retain the transient website honeypot or client start timer, even if
  // an incorrectly imported historic source happens to contain those fields.
  return createHash('sha256').update(JSON.stringify(fields.map(key => [key, source[key] ?? null]))).digest('hex');
}

const liveSource = (source, registrationId, timestamp) => source && source.registrationId === registrationId
  && !source.deletedAt && !source.erasedAt && Number.isSafeInteger(source.expiresAt)
  && source.expiresAt > Math.floor(timestamp / 1000);

/** Durable sync records are not participant accounts and carry no grants. */
export function createWorker({ store, hubspot, postmark, logoBase64, now = Date.now, newId = randomUUID, transferNoticeVersion }) {
  /**
   * ADR-0084: acknowledge receipt once per requested working group, for the first
   * application per email, whether the CRM created a contact or quarantined for
   * review. Each send has its own durable record, so a delivery that fails after the
   * CRM outcome is final still completes the acknowledgements on redelivery. A send
   * whose outcome is unknown is never repeated: a dispatched email cannot be recalled.
   */
  async function acknowledge(registrationId, operation, source, timestamp) {
    if (!operation || !ACKNOWLEDGED_REASONS.has(operation.reason) || !FINAL.has(operation.state)) return;
    if (!liveSource(source, registrationId, timestamp) || source.privacyNoticeVersion !== transferNoticeVersion) return;
    if (await store.get(`SYNC#SUPPRESS#REGISTRATION#${registrationId}`)
      || await store.get(`SYNC#SUPPRESS#EMAIL#${emailDigest(source.email)}`)) return;
    const groups = Array.isArray(source.workingGroups) ? source.workingGroups : [];
    if (!groups.length || groups.some(group => !Object.hasOwn(WORKING_GROUP_LABELS, group))) return;
    for (const groupId of groups) {
      const pk = `SYNC#ACK#${registrationId}#${groupId}`;
      let record = await store.get(pk);
      if (record && ACK_FINAL.has(record.state)) continue;
      if (record?.state === 'sending') {
        const leaseRemaining = (record.attemptedAt + LEASE_MS - timestamp) / 1000;
        if (leaseRemaining > 0) throw new RetryLater(leaseRemaining);
        await store.put({ ...record, state: 'unknown', reason: 'send-outcome-unknown', updatedAt: timestamp }, record);
        continue;
      }
      if (record?.state === 'retry' && record.nextAttemptAt > timestamp) throw new RetryLater((record.nextAttemptAt - timestamp) / 1000);
      let payload;
      try {
        payload = buildAcknowledgementPayload({ displayName: source.fullName, email: source.email, groupId }, { logoBase64 });
      } catch {
        await store.put({ ...record, pk, registrationId, groupId, state: 'rejected', reason: 'invalid-input',
          createdAt: record?.createdAt ?? timestamp, updatedAt: timestamp }, record);
        continue;
      }
      // Record "sending" BEFORE the POST so a crash cannot produce a second copy.
      record = await store.put({ ...record, pk, registrationId, groupId, state: 'sending', attemptedAt: timestamp,
        createdAt: record?.createdAt ?? timestamp, updatedAt: timestamp }, record);
      let result;
      try { result = await postmark.sendAcknowledgement(payload, { registrationId }); }
      catch (error) {
        if (error instanceof RetryLater) {
          await store.put({ ...record, state: 'retry', nextAttemptAt: timestamp + error.seconds * 1000, updatedAt: timestamp }, record);
        }
        // Any other failure intentionally leaves "sending" for the lease to settle.
        throw error;
      }
      await store.put({ ...record, state: result.status, updatedAt: timestamp,
        ...(result.messageId ? { messageId: result.messageId, submittedAt: result.submittedAt } : {}),
        ...(result.errorCode ? { errorCode: result.errorCode } : {}) }, record);
    }
  }

  return async function syncRegistration(registrationId) {
    if (!UUID.test(registrationId)) throw new TypeError('Invalid registration reference');
    const pk = `SYNC#APPLICATION#${registrationId}`;
    const timestamp = now();
    const source = await store.getRegistration(registrationId);
    const operation = await syncContact(registrationId, pk, source, timestamp);
    await acknowledge(registrationId, operation, source, timestamp);
  };

  /**
   * A later application from an email the CRM already knows. Staff must still see
   * it: the applicant may have requested a new working group. It becomes one review
   * task on the known contact and is acknowledged, at most once per email per day;
   * a repeat inside that window waits in the queue rather than vanishing. Without a
   * known contact there is nothing to attach the task to, so it stays AWS evidence.
   */
  async function repeat(claim, claimKey, registrationId, source, finish, timestamp) {
    if (!FINAL.has(claim.state)) throw new RetryLater(60);
    const contactIds = claim.contactId ? [claim.contactId] : claim.candidateContactIds ?? [];
    if (!contactIds.length || claim.state === 'suppressed') return finish('quarantined', 'repeat-application', { reviewKey: claimKey });
    if (claim.repeatRegistrationId !== registrationId) {
      // A replay of this registration after a crash proceeds; any other repeat waits
      // for the email's daily window measured from its last creation or task.
      const lastTaskAt = claim.lastTaskAt ?? claim.updatedAt ?? claim.createdAt;
      const wait = (lastTaskAt + EMAIL_TASK_INTERVAL_MS - timestamp) / 1000;
      if (wait > 0) throw new RetryLater(Math.min(wait, 43200));
    }
    // Record the attempt BEFORE the POST so a crash cannot create a second task.
    claim = await store.put({ ...claim, repeatRegistrationId: registrationId, lastTaskAt: timestamp }, claim);
    const task = await hubspot.createReviewTask({ contactIds, registrationId,
      requestedGroups: source.workingGroups, dueAt: timestamp });
    return finish('quarantined', 'repeat-application-reviewed',
      { reviewKey: claimKey, candidateContactIds: contactIds, reviewTaskId: task.id });
  }

  async function syncContact(registrationId, pk, source, timestamp) {
    let operation = await store.get(pk);
    if (operation && FINAL.has(operation.state)) return operation;
    const finish = async (state, reason, extra = {}) => {
      operation = await store.put({ ...operation, pk, registrationId, state, reason,
        updatedAt: timestamp, ...extra }, operation);
      return operation;
    };
    if (!liveSource(source, registrationId, timestamp)) return finish('suppressed', 'missing-expired-or-erased');
    let plan;
    try { plan = planInitialContactSync(source, { contactMatches: [], now: timestamp }); }
    catch { return finish('quarantined', 'invalid-source'); }
    if (!transferNoticeVersion || source.privacyNoticeVersion !== transferNoticeVersion) {
      return finish('quarantined', 'privacy-review');
    }
    const digest = evidenceDigest(source);
    if (operation && operation.evidenceDigest !== digest) return finish('quarantined', 'source-changed');
    const emailHash = emailDigest(plan.properties.email);
    if (await store.get(`SYNC#SUPPRESS#REGISTRATION#${registrationId}`)
      || await store.get(`SYNC#SUPPRESS#EMAIL#${emailHash}`)) {
      return finish('suppressed', 'suppression-record');
    }
    if (!operation) operation = await store.put({ pk, registrationId, state: 'pending',
      participantId: newId(), emailHash, evidenceDigest: digest, createdAt: timestamp,
      sourceCreatedAt: source.createdAt, sourceExpiresAt: source.expiresAt,
      // Historic form and option-set versions were not collected; do not infer.
      sourceFormVersion: null, sourceOptionSetVersion: null, adapterOptionSetVersion: 1,
      privacyNoticeVersion: source.privacyNoticeVersion,
    });
    const claimKey = `SYNC#EMAIL#${emailHash}`;
    let claim = await store.get(claimKey);
    if (!claim) claim = await store.put({ pk: claimKey, registrationId,
      participantId: operation.participantId, state: 'held', createdAt: timestamp });
    if (claim.registrationId !== registrationId) return repeat(claim, claimKey, registrationId, source, finish, timestamp);
    const settle = async (state, reason, extra = {}) => {
      claim = await store.put({ ...claim, state, reason, updatedAt: timestamp, ...extra }, claim);
      return finish(state, reason, { reviewKey: claimKey, ...extra });
    };
    if (FINAL.has(claim.state)) {
      return finish(claim.state, claim.reason, { reviewKey: claimKey,
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
      return settle('quarantined', 'ambiguous-create', { candidateContactIds: matches });
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
      return settle('quarantined', matches.length === 1 ? 'existing-contact' : 'ambiguous-contacts',
        { candidateContactIds: matches, reviewTaskId: task.id });
    }
    // This transaction rechecks source retention/deletion and both suppressions,
    // reserves a daily budget unit, and records "creating" BEFORE the HTTP POST.
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
    return settle('synced', 'pending-applicant-created', { contactId: contact.id, lastSuccessfulSyncAt: timestamp });
  }
}

let runtime;
function defaults() {
  runtime ??= {
    worker: createWorker({
      store: createStore({ registrationsTableName: process.env.REGISTRATIONS_TABLE_NAME,
        participantsTableName: process.env.PARTICIPANTS_TABLE_NAME, maxCreatesPerDay: 100 }),
      hubspot: createHubSpotClient({ secretArn: process.env.BRIDGE_SECRET_ARN }),
      postmark: createPostmarkClient({ secretArn: process.env.POSTMARK_SECRET_ARN, pin: ACKNOWLEDGEMENT_PIN }),
      // Packaged beside this handler; tests assert it stays byte-identical to the reviewed asset.
      logoBase64: readFileSync(new URL('./opda-email-logo.png', import.meta.url)).toString('base64'),
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
    const failures = [];
    for (const message of event?.Records ?? []) {
      try {
        const registrationId = parseSubmissionMessage(message, dependencies.queueArn ?? process.env.SYNC_QUEUE_ARN);
        await dependencies.worker(registrationId);
      } catch (error) {
        failures.push({ itemIdentifier: message.messageId });
        if (error instanceof RetryLater && dependencies.changeVisibility) {
          // Add bounded positive jitter; never shorten the requested Retry-After.
          const seconds = Math.min(43200, error.seconds + (overrides.worker ? 0 : Math.floor(Math.random() * 10)));
          try { await dependencies.changeVisibility(message, seconds); } catch { /* Native queue retry remains available. */ }
        }
        // No raw errors, event bodies, email addresses or credentials are logged.
      }
    }
    return { batchItemFailures: failures };
  };
}
export const handler = createHandler();
