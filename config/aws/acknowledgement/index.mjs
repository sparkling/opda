import { readFileSync } from 'node:fs';
import { buildAcknowledgementPayload } from '../hubspot-participation/acknowledgement.mjs';
import { WORKING_GROUP_LABELS } from '../hubspot-participation/properties.mjs';
import { createBatchHandler, parseSubmissionMessage, REGISTRATION_ID } from '../shared/submission-message.mjs';
import { createSyncStore, emailDigest } from '../shared/sync-store.mjs';
import { RetryLater } from '../shared/http-retry.mjs';
import { createPostmarkClient } from './postmark.mjs';
import { ACKNOWLEDGEMENT_PIN } from './settings.mjs';
export { RetryLater } from '../shared/http-retry.mjs';
export { parseSubmissionMessage } from '../shared/submission-message.mjs';

// A stored acknowledgement is settled unless it may still be in flight ("sending")
// or a provider explicitly asked us to come back later ("retry"). Every other
// value — including the pre-2026-09-16 outcome states — means: do not send again.
const RESUMABLE = new Set(['sending', 'retry']);
// Lambda execution is capped at 60s; a durable "in flight" marker outlives one attempt.
const LEASE_MS = 120000;

const liveSource = (source, registrationId, timestamp) => source && source.registrationId === registrationId
  && !source.deletedAt && !source.erasedAt && Number.isSafeInteger(source.expiresAt)
  && source.expiresAt > Math.floor(timestamp / 1000);

/**
 * ADR-0084 §4: every website submission is acknowledged, once per requested working
 * group, ALWAYS. New contact, known contact, ambiguous match or repeat application:
 * the person filled in the form, so the person hears back.
 *
 * This worker cannot reach HubSpot and holds no CRM credential, so no CRM match,
 * throttle, daily budget, outage or unresolvable contact can delay or withhold the
 * acknowledgement. The four conditions below are properties of the submission
 * itself — it is live, it is current, it is not suppressed, and its working groups
 * are real. Nothing else is consulted.
 *
 * Each group's send has its own durable record written BEFORE the POST, so a crash
 * cannot produce a second copy and a redelivery completes the rest. A send whose
 * outcome is unknown is never repeated: a dispatched email cannot be recalled.
 */
export function createWorker({ store, postmark, logoBase64, now = Date.now, transferNoticeVersion }) {
  async function sendGroup(registrationId, groupId, source, timestamp) {
    const pk = `SYNC#ACK#${registrationId}#${groupId}`;
    let record = await store.get(pk);
    if (record && !RESUMABLE.has(record.state)) return;
    if (record?.state === 'sending') {
      const leaseRemaining = (record.attemptedAt + LEASE_MS - timestamp) / 1000;
      if (leaseRemaining > 0) throw new RetryLater(leaseRemaining);
      // The POST may have reached Postmark. Settle rather than risk a second copy.
      await store.put({ ...record, state: 'done', reason: 'outcome-unknown', updatedAt: timestamp }, record);
      return;
    }
    if (record?.nextAttemptAt > timestamp) throw new RetryLater((record.nextAttemptAt - timestamp) / 1000);
    const base = { ...record, pk, registrationId, groupId, createdAt: record?.createdAt ?? timestamp };
    let payload;
    try {
      payload = buildAcknowledgementPayload({ displayName: `${source.firstName} ${source.lastName}`, email: source.email, groupId }, { logoBase64 });
    } catch {
      // Permanently unsendable input, e.g. an address this contract will not accept.
      await store.put({ ...base, state: 'done', reason: 'invalid-input', updatedAt: timestamp }, record);
      return;
    }
    record = await store.put({ ...base, state: 'sending', attemptedAt: timestamp, updatedAt: timestamp }, record);
    let result;
    try { result = await postmark.sendAcknowledgement(payload, { registrationId }); }
    catch (error) {
      // A throttled request was refused, not dispatched, so it stays resumable.
      if (error instanceof RetryLater) {
        await store.put({ ...record, state: 'retry', nextAttemptAt: timestamp + error.seconds * 1000, updatedAt: timestamp }, record);
      }
      // Any other failure intentionally leaves "sending" for the lease to settle.
      throw error;
    }
    await store.put({ ...record, state: 'done', reason: result.status, updatedAt: timestamp,
      ...(result.messageId ? { messageId: result.messageId, submittedAt: result.submittedAt } : {}),
      ...(result.errorCode ? { errorCode: result.errorCode } : {}) }, record);
  }

  return async function acknowledgeRegistration(registrationId) {
    if (!REGISTRATION_ID.test(registrationId)) throw new TypeError('Invalid registration reference');
    const timestamp = now();
    const source = await store.getRegistration(registrationId);
    if (!liveSource(source, registrationId, timestamp)) return;
    // The notice the applicant actually agreed to governs what we may send them.
    if (!transferNoticeVersion || source.privacyNoticeVersion !== transferNoticeVersion) return;
    const groups = Array.isArray(source.workingGroups) ? source.workingGroups : [];
    if (!groups.length || groups.some(group => !Object.hasOwn(WORKING_GROUP_LABELS, group))) return;
    if (await store.get(`SYNC#SUPPRESS#REGISTRATION#${registrationId}`)
      || await store.get(`SYNC#SUPPRESS#EMAIL#${emailDigest(source.email)}`)) return;
    for (const groupId of groups) await sendGroup(registrationId, groupId, source, timestamp);
  };
}

let runtime;
function defaults() {
  runtime ??= {
    worker: createWorker({
      store: createSyncStore({ registrationsTableName: process.env.REGISTRATIONS_TABLE_NAME,
        participantsTableName: process.env.PARTICIPANTS_TABLE_NAME }),
      postmark: createPostmarkClient({ secretArn: process.env.POSTMARK_SECRET_ARN, pin: ACKNOWLEDGEMENT_PIN }),
      // Packaged beside this handler; tests assert it stays byte-identical to the reviewed asset.
      logoBase64: readFileSync(new URL('./opda-email-logo.png', import.meta.url)).toString('base64'),
      transferNoticeVersion: process.env.TRANSFER_NOTICE_VERSION,
    }),
    async changeVisibility(record, seconds) {
      const aws = await import('@aws-sdk/client-sqs');
      await new aws.SQSClient({ maxAttempts: 2 }).send(new aws.ChangeMessageVisibilityCommand({
        QueueUrl: process.env.ACKNOWLEDGEMENT_QUEUE_URL, ReceiptHandle: record.receiptHandle, VisibilityTimeout: seconds,
      }));
    },
  };
  return runtime;
}

export function createHandler(overrides = {}) {
  return async event => {
    const dependencies = overrides.worker ? overrides : { ...defaults(), ...overrides };
    return createBatchHandler({ work: dependencies.worker, RetryLater, jitter: !overrides.worker,
      queueArn: () => dependencies.queueArn ?? process.env.ACKNOWLEDGEMENT_QUEUE_ARN,
      changeVisibility: dependencies.changeVisibility })(event);
  };
}
export const handler = createHandler();
