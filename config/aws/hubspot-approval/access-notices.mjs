import { createHash } from 'node:crypto';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Add a notification-only outbox entry to the SAME transaction as last-group loss.
 * No population scan, historical backfill or inferred domain grants. This operation
 * is independent of Microsoft cleanup, so its delays cannot delay the login notice.
 */
export function addWebsiteDisabledNotice(plan, map, row, now) {
  const withdrawals = plan.audits.filter(audit => audit.onboarding?.notifyWithdrawal === true);
  if (row.active !== true || plan.fields.active || plan.fields.approvedDomains.length || !withdrawals.length) return;
  const accessVersion = plan.fields.accessVersion;
  const decisionId = hash(['website-disabled', row.participantId, accessVersion, withdrawals.map(audit => audit.decisionId).sort()]);
  const operationId = hash([3, row.participantId, decisionId, accessVersion]);
  const snapshot = { operationId, action: 'revoke', noticeKind: 'website-disabled', snapshotStatus: 'denied',
    groups: [], groupDigest: hash([]), groupsAt: null, reason: 'last-approved-domain-removed',
    decisionId, decisionAt: now, actor: null, accessVersion, templateVersion: 1 };
  const auditKey = `CRM#AUDIT#${map.contactId}#${decisionId}`;
  plan.fields.accessNotice = snapshot; plan.mapFields.accessNotice = snapshot;
  plan.operations.push({ pk: `CRM#ONBOARDING#${operationId}`, schemaVersion: 3, operationId,
    participantId: row.participantId, contactId: map.contactId, cognitoSub: row.cognitoSub,
    accountKey: row.pk, bindingKey: map.pk, auditKey, decisionId, accessVersion,
    action: 'revoke', noticeKind: 'website-disabled', status: 'pending', createdAt: now });
  plan.audits.push({ pk: auditKey, participantId: row.participantId, contactId: map.contactId,
    decisionId, actor: null, at: now, reviewStatus: 'under_review', active: false, accessVersion,
    reason: snapshot.reason, onboarding: snapshot });
}
