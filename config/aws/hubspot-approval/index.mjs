import { createHubSpotClient } from './client.mjs';
import { createIdentity } from './identity.mjs';
import { createStore } from './store.mjs';
import { createOnboardingNotifier } from './onboarding.mjs';
import { parseHints } from './domain.mjs';
import { createDomainWorker } from './domain-worker.mjs';
import { createTeamsDecisionSource } from '../teams-approvals/decisions.mjs';

/**
 * Approval and revocation have one control surface: the six domain review
 * dropdowns. The v1 account-wide worker was removed with `opda_review_status`.
 */
export function createWorker({ store, hubspot, identity, domainCutover, notifyOnboarding, externalDecisions, now = Date.now }) {
  return createDomainWorker({ store, hubspot, identity, domainCutover, notifyOnboarding, externalDecisions, now });
}

let runtime;
function defaults() {
  runtime ??= createWorker({
    store: createStore({ participantsTableName: process.env.PARTICIPANTS_TABLE_NAME,
      registrationsTableName: process.env.REGISTRATIONS_TABLE_NAME,
      onboardingCutover: process.env.ONBOARDING_CUTOVER ? Date.parse(process.env.ONBOARDING_CUTOVER) : undefined,
      domainReviewCutover: process.env.DOMAIN_REVIEW_CUTOVER ? Date.parse(process.env.DOMAIN_REVIEW_CUTOVER) : undefined }),
    hubspot: createHubSpotClient({ secretArn: process.env.BRIDGE_SECRET_ARN }),
    identity: createIdentity({ poolId: process.env.USER_POOL_ID }),
    domainCutover: Date.parse(process.env.DOMAIN_REVIEW_CUTOVER),
    notifyOnboarding: process.env.ONBOARDING_QUEUE_URL ? createOnboardingNotifier(process.env.ONBOARDING_QUEUE_URL) : undefined,
    // ADR-0088: Teams decisions are durable records only the Teams bot role can write.
    externalDecisions: createTeamsDecisionSource({ participantsTableName: process.env.PARTICIPANTS_TABLE_NAME }),
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
