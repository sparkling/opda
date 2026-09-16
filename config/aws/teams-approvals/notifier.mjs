import { WORKING_GROUP_LABELS } from '../hubspot-participation/properties.mjs';
import { createBatchHandler } from '../shared/submission-message.mjs';
import { RetryLater } from '../shared/http-retry.mjs';
import { buildSignupCard } from './card.mjs';
import { createMicrosoftClient } from './microsoft.mjs';
import { INSTALL_KEY, REGISTRATION_ID, createTeamsStore, signupKey } from './store.mjs';
export { RetryLater } from '../shared/http-retry.mjs';

// One card per signup, ALWAYS, on the same terms as the applicant acknowledgement
// (ADR-0087): the card is a property of the submission. A durable record is
// written before the post so a crash cannot produce a second card silently, and
// an unknown outcome is retried once at most: a duplicate card is a nuisance, a
// missing one is an applicant nobody reviews.
const LEASE_MS = 120000;
const MAX_ATTEMPTS = 2;
// The CRM sync runs in parallel; wait briefly for the contact link, never indefinitely.
const LINK_WAIT_MS = 10 * 60 * 1000, LINK_RETRY_S = 30;
const SETTLED = new Set(['synced', 'closed']);

const liveSource = (source, registrationId, timestamp) => source && source.registrationId === registrationId
  && !source.deletedAt && !source.erasedAt && Number.isSafeInteger(source.expiresAt)
  && source.expiresAt > Math.floor(timestamp / 1000);

export function contactReference(claim) {
  if (!claim || !SETTLED.has(claim.state)) return { settled: false, contactId: null };
  if (typeof claim.contactId === 'string') return { settled: true, contactId: claim.contactId };
  const candidates = Array.isArray(claim.candidateContactIds) ? claim.candidateContactIds : [];
  return { settled: true, contactId: candidates.length === 1 && typeof candidates[0] === 'string' ? candidates[0] : null };
}

export function createNotifier({ store, microsoft, channelId, tenantId, serviceUrl, now = Date.now }) {
  if (typeof channelId !== 'string' || !channelId || typeof tenantId !== 'string' || !tenantId) throw new TypeError('Invalid notifier configuration');
  return async function notifySignup(registrationId) {
    if (!REGISTRATION_ID.test(registrationId)) throw new TypeError('Invalid registration reference');
    const timestamp = now();
    const pk = signupKey(registrationId);
    let record = await store.get(pk);
    if (record?.state === 'done') return;
    if (record?.state === 'posting') {
      const leaseRemaining = (record.attemptedAt + LEASE_MS - timestamp) / 1000;
      if (leaseRemaining > 0) throw new RetryLater(leaseRemaining);
      if ((record.attempts ?? 1) >= MAX_ATTEMPTS) {
        await store.put({ ...record, state: 'done', reason: 'outcome-unknown', updatedAt: timestamp }, record);
        return;
      }
    }
    const source = await store.getRegistration(registrationId);
    if (!liveSource(source, registrationId, timestamp)) return;
    const groups = Array.isArray(source.workingGroups) ? source.workingGroups : [];
    if (!groups.length || groups.some(group => !Object.hasOwn(WORKING_GROUP_LABELS, group))) return;
    const link = contactReference(await store.getSyncClaim(source.email));
    if (!link.settled && timestamp - source.createdAt < LINK_WAIT_MS) throw new RetryLater(LINK_RETRY_S);
    const install = await store.get(INSTALL_KEY);
    const target = install?.serviceUrl ?? serviceUrl;
    if (!target) throw new Error('Bot service URL unavailable');
    const base = { ...record, pk, registrationId, createdAt: record?.createdAt ?? timestamp };
    record = await store.put({ ...base, state: 'posting', attempts: (record?.attempts ?? 0) + 1,
      attemptedAt: timestamp, updatedAt: timestamp }, record);
    const card = buildSignupCard({ registration: source, contactId: link.contactId });
    // Any failure intentionally leaves "posting" for the lease to settle.
    const posted = await microsoft.postCard({ serviceUrl: target, channelId, tenantId, card });
    await store.put({ ...record, state: 'done', reason: 'posted', serviceUrl: target, contactId: link.contactId,
      conversationId: posted.conversationId, activityId: posted.activityId, updatedAt: timestamp }, record);
  };
}

let runtime;
function defaults() {
  runtime ??= {
    worker: createNotifier({
      store: createTeamsStore({ registrationsTableName: process.env.REGISTRATIONS_TABLE_NAME,
        participantsTableName: process.env.PARTICIPANTS_TABLE_NAME }),
      microsoft: createMicrosoftClient({ secretArn: process.env.BOT_SECRET_ARN }),
      channelId: process.env.SIGNUPS_CHANNEL_ID, tenantId: process.env.TENANT_ID,
      serviceUrl: process.env.BOT_SERVICE_URL,
    }),
    async changeVisibility(record, seconds) {
      const aws = await import('@aws-sdk/client-sqs');
      await new aws.SQSClient({ maxAttempts: 2 }).send(new aws.ChangeMessageVisibilityCommand({
        QueueUrl: process.env.SIGNUP_QUEUE_URL, ReceiptHandle: record.receiptHandle, VisibilityTimeout: seconds,
      }));
    },
  };
  return runtime;
}

export function createHandler(overrides = {}) {
  return async event => {
    const dependencies = overrides.worker ? overrides : { ...defaults(), ...overrides };
    return createBatchHandler({ work: dependencies.worker, RetryLater, jitter: !overrides.worker,
      queueArn: () => dependencies.queueArn ?? process.env.SIGNUP_QUEUE_ARN,
      changeVisibility: dependencies.changeVisibility })(event);
  };
}
export const handler = createHandler();
