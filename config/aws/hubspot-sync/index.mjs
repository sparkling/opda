import { createHash, randomUUID } from 'node:crypto';
import { planInitialContactSync } from '../hubspot-participation/mapping.mjs';
import { createHubSpotClient } from './client.mjs';
import { createStore, emailDigest } from './store.mjs';
import { RetryLater } from './errors.mjs';
export { RetryLater } from './errors.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FINAL = new Set(['synced', 'quarantined', 'suppressed']);
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

/** Durable sync records are not participant accounts and carry no grants. */
export function createWorker({ store, hubspot, now = Date.now, newId = randomUUID, transferNoticeVersion }) {
  return async function syncRegistration(registrationId) {
    if (!UUID.test(registrationId)) throw new TypeError('Invalid registration reference');
    const pk = `SYNC#APPLICATION#${registrationId}`;
    let operation = await store.get(pk);
    if (operation && FINAL.has(operation.state)) return;
    const timestamp = now();
    const source = await store.getRegistration(registrationId);
    const finish = async (state, reason, extra = {}) => {
      operation = await store.put({ ...operation, pk, registrationId, state, reason,
        updatedAt: timestamp, ...extra }, operation);
    };
    if (!source || source.registrationId !== registrationId || source.deletedAt || source.erasedAt
      || !Number.isSafeInteger(source.expiresAt) || source.expiresAt <= Math.floor(timestamp / 1000)) {
      await finish('suppressed', 'missing-expired-or-erased'); return;
    }
    let plan;
    try { plan = planInitialContactSync(source, { contactMatches: [], now: timestamp }); }
    catch { await finish('quarantined', 'invalid-source'); return; }
    if (!transferNoticeVersion || source.privacyNoticeVersion !== transferNoticeVersion) {
      await finish('quarantined', 'privacy-review'); return;
    }
    const digest = evidenceDigest(source);
    if (operation && operation.evidenceDigest !== digest) {
      await finish('quarantined', 'source-changed'); return;
    }
    const emailHash = emailDigest(plan.properties.email);
    if (await store.get(`SYNC#SUPPRESS#REGISTRATION#${registrationId}`)
      || await store.get(`SYNC#SUPPRESS#EMAIL#${emailHash}`)) {
      await finish('suppressed', 'suppression-record'); return;
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
    if (claim.registrationId !== registrationId) {
      await finish('quarantined', 'repeat-application', { reviewKey: claimKey }); return;
    }
    const settle = async (state, reason, extra = {}) => {
      claim = await store.put({ ...claim, state, reason, updatedAt: timestamp, ...extra }, claim);
      await finish(state, reason, { reviewKey: claimKey, ...extra });
    };
    if (FINAL.has(claim.state)) {
      await finish(claim.state, claim.reason, { reviewKey: claimKey,
        ...(claim.contactId ? { contactId: claim.contactId } : {}),
        ...(claim.candidateContactIds ? { candidateContactIds: claim.candidateContactIds } : {}) });
      return;
    }
    if (claim.state === 'creating') {
      // Lambda execution is capped at 60s; allow its write acknowledgement to
      // finish before another delivery attempts ambiguity reconciliation.
      const leaseRemaining = (claim.attemptedAt + 120000 - timestamp) / 1000;
      if (leaseRemaining > 0) throw new RetryLater(leaseRemaining);
      // This also covers success followed by a failed DynamoDB acknowledgement.
      // Even a matching email cannot prove that this operation made the contact.
      const matches = await hubspot.findContacts(plan.properties.email);
      await settle('quarantined', 'ambiguous-create', { candidateContactIds: matches }); return;
    }
    if (claim.nextAttemptAt > timestamp) throw new RetryLater((claim.nextAttemptAt - timestamp) / 1000);
    const matches = await hubspot.findContacts(plan.properties.email);
    if (matches.length) {
      await settle('quarantined', matches.length === 1 ? 'existing-contact' : 'ambiguous-contacts',
        { candidateContactIds: matches }); return;
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
    await settle('synced', 'pending-applicant-created', { contactId: contact.id, lastSuccessfulSyncAt: timestamp });
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
