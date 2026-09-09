import { APPROVED_GROUPS, digest } from './domain.mjs';

export const OPERATION_ID = /^[a-f0-9]{64}$/;
export const onboardingKey = id => {
  if (typeof id !== 'string' || !OPERATION_ID.test(id)) throw new TypeError('Invalid onboarding operation reference');
  return `CRM#ONBOARDING#${id}`;
};
export const onboardingHint = id => {
  onboardingKey(id);
  return { schemaVersion: 1, operationId: id };
};

function validatedSnapshot(candidate, at) {
  const failed = { snapshotStatus: 'review_required', groups: [], groupsAt: null,
    groupDigest: digest('[]'), reason: 'group-history-requires-review' };
  if (!candidate || !['approved', 'empty'].includes(candidate.snapshotStatus)
    || !Array.isArray(candidate.groups) || candidate.groups.length > APPROVED_GROUPS.length
    || candidate.groups.some(group => !APPROVED_GROUPS.includes(group))
    || new Set(candidate.groups).size !== candidate.groups.length
    || !Number.isSafeInteger(candidate.groupsAt) || candidate.groupsAt < 0 || candidate.groupsAt > at) return failed;
  const groups = APPROVED_GROUPS.filter(group => candidate.groups.includes(group));
  if ((candidate.snapshotStatus === 'approved') !== Boolean(groups.length)
    || candidate.groupDigest !== digest(JSON.stringify(groups))) return failed;
  return { snapshotStatus: groups.length ? 'approved' : 'empty', groups, groupsAt: candidate.groupsAt,
    groupDigest: candidate.groupDigest, reason: groups.length ? 'reviewed-group-selection' : 'empty-group-selection' };
}

/** Plan only. The caller persists snapshot, account, audit and outbox in one transaction. */
export function planOnboarding({ map, row, decision, grant, holdReason, auditId, accessVersion, now, cutover }) {
  const managed = OPERATION_ID.test(map.onboarding?.operationId ?? row.onboarding?.operationId ?? '');
  const decisionAt = holdReason ? now : decision?.at;
  const activated = Number.isSafeInteger(cutover) && cutover >= 0 && decisionAt >= cutover;
  // Disabling prospective work never cancels repair of already-owned grants.
  if (grant ? !activated || !decision?.trusted : !activated && !managed) return null;
  const selected = grant ? validatedSnapshot(decision.groupSnapshot, decision.at) : {
    snapshotStatus: 'denied', groups: [], groupsAt: null, groupDigest: digest('[]'),
    reason: holdReason ?? decision.reason,
  };
  const operationId = digest(JSON.stringify([1, map.participantId, auditId, accessVersion]));
  const action = selected.snapshotStatus === 'approved' ? 'provision' : 'revoke';
  const snapshot = { operationId, action, ...selected, decisionId: auditId, decisionAt,
    actor: decision?.actor ?? null, accessVersion, templateVersion: 1 };
  return { snapshot, operation: {
    pk: onboardingKey(operationId), schemaVersion: 1, operationId,
    participantId: map.participantId, contactId: map.contactId, cognitoSub: row.cognitoSub,
    accountKey: row.pk, bindingKey: map.pk, auditKey: `CRM#AUDIT#${map.contactId}#${auditId}`,
    decisionId: auditId, accessVersion, action, status: 'pending', createdAt: now,
  } };
}

/** The queue contains only an opaque reference; it is never approval authority. */
export function createOnboardingNotifier(queueUrl, overrides = {}) {
  if (typeof queueUrl !== 'string' || !queueUrl.trim()) throw new TypeError('Onboarding queue required');
  let service;
  return async hint => {
    if (!hint || hint.schemaVersion !== 1 || Object.keys(hint).length !== 2) throw new TypeError('Invalid onboarding hint');
    const body = JSON.stringify(onboardingHint(hint.operationId));
    const input = { QueueUrl: queueUrl, MessageBody: body };
    if (overrides.sendMessage) return overrides.sendMessage(input);
    service ??= import('@aws-sdk/client-sqs').then(aws => ({ aws, client: new aws.SQSClient({ maxAttempts: 2 }) }));
    const { aws, client } = await service;
    await client.send(new aws.SendMessageCommand(input), { abortSignal: AbortSignal.timeout(5000) });
  };
}
