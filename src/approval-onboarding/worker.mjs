import { createHash } from 'node:crypto';
import { classifyEmailDomain } from '../agents/working-group-inbox/domain.mjs';
import { APPROVAL_GROUP_IDS } from './invitation.mjs';
import { sendAccessNotice } from './notice-worker.mjs';

const OPERATION_ID = /^[a-f0-9]{64}$/;
const EMAIL_HASH = /^[a-f0-9]{64}$/;
const copy = value => structuredClone(value);
const emailHash = value => createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');

/** Deterministic effects; provider receipts are private, reference-only jobs are not authority. */
export function createOnboardingWorker({ store, graph, sharepoint, postmark, workspaces, invitationRegistry,
  templatePin, templatePins = {}, noticePins = {}, logoBase64, enabled = false, canaryEmailHash = '', now = Date.now }) {
  if (typeof canaryEmailHash !== 'string' || canaryEmailHash !== '' && !EMAIL_HASH.test(canaryEmailHash)) {
    throw new TypeError('Invalid onboarding canary configuration');
  }
  async function process(operationId) {
    if (!OPERATION_ID.test(operationId ?? '')) throw new TypeError('Invalid onboarding operation reference');
    const context = await store.claim(operationId);
    if (!context) return { status: 'skipped' };
    const guard = requireEligible => store.guard(context, { requireEligible });
    const finish = async (status, stage, reason) => {
      if (await store.finish(context, { status, stage, ...(reason ? { reason } : {}) }) !== true) {
        throw new Error('Onboarding completion lease unavailable');
      }
      return { status, stage, ...(reason ? { reason } : {}) };
    };
    async function save(change, options) {
      const next = copy(context.receipts);
      change(next);
      if (await store.saveReceipts(context, next, options) !== true) throw new Error('Onboarding receipt lease unavailable');
      return true;
    }
    const saveGraph = receipt => save(next => { next.graph = receipt; });
    const saveSharepoint = id => receipt => save(next => { next.sharepoint[id] = receipt; });
    const graphReceipt = () => Object.keys(context.receipts.graph).length ? context.receipts.graph : undefined;
    async function sourceEffect(method, args) {
      try { return await sharepoint[method](args); }
      catch (error) {
        if (/^sharepoint-[a-z-]+$/.test(error?.code ?? '') && ['pending', 'manual-review'].includes(error.status)) {
          return { status: error.status }; // Only static classifications cross this boundary.
        }
        throw new Error('Onboarding source access unavailable');
      }
    }
    async function notice(kind, domainId) {
      const result = await sendAccessNotice({ context, store, postmark, kind, ...(domainId ? { groupId: domainId } : {}),
        pin: kind === 'website-disabled' ? noticePins.website : noticePins.groups?.[domainId], logoBase64, now });
      return finish(result.status, result.stage, result.reason);
    }
    try {
      if (!await guard(false)) return await finish('cancelled', 'superseded');
      if (context.operation.schemaVersion === 3) return await notice('website-disabled');
      const snapshot = context.audit.onboarding;
      const provisioning = context.operation.action === 'provision';
      const domainId = context.operation.schemaVersion === 2 ? context.operation.domainId : undefined;
      const pin = domainId ? templatePins[domainId] : templatePin;
      if (provisioning && !enabled && (!canaryEmailHash || emailHash(context.account?.email) !== canaryEmailHash)) {
        return await finish('pending', 'awaiting-activation');
      }
      if (provisioning && domainId && (!pin || !Number.isSafeInteger(pin.templateId))) {
        return await finish('pending', 'awaiting-domain-template');
      }
      if (provisioning && (!await guard(true) || snapshot.snapshotStatus !== 'approved'
        || snapshot.templateVersion !== pin.version || !Array.isArray(snapshot.groups)
        || domainId && (snapshot.groups.length !== 1 || snapshot.groups[0] !== domainId)
        || !snapshot.groups.length || snapshot.groups.some(id => !APPROVAL_GROUP_IDS.includes(id)))) {
        return await finish('cancelled', 'eligibility-unavailable');
      }
      const desired = new Set(provisioning ? snapshot.groups : []);
      let pending = false, attention = false;
      if (!provisioning) await save(next => {
        for (const mail of Object.values(next.mail)) {
          if (mail.kind) continue; // Access notices are not invitations awaiting cancellation.
          if (domainId && mail.domainId !== domainId) continue;
          if (['prepared', 'pending'].includes(mail.status)) mail.status = 'cancelled';
          if (['attempting', 'unknown'].includes(mail.status)) mail.cancellationRequestedAt = now();
        }
      });
      // Close private source access first. No shared folder, content, group or user is deleted.
      for (const [id, receipt] of Object.entries(context.receipts.sharepoint)) {
        if (domainId && id !== domainId) continue;
        if (desired.has(id)) continue;
        if (!APPROVAL_GROUP_IDS.includes(id)) { attention = true; continue; }
        const result = await sourceEffect('revoke', { groupId: id, receipt, guard: () => guard(provisioning), persistReceipt: saveSharepoint(id) });
        pending ||= result.status === 'pending';
        attention ||= !['ready', 'revoked', 'pending'].includes(result.status);
      }
      for (const id of APPROVAL_GROUP_IDS) {
        if (domainId && id !== domainId) continue;
        if (desired.has(id) || !context.receipts.graph.memberships?.[workspaces[id].teamId]) continue;
        const result = await graph.revokeMembership({ groupId: id, userId: context.receipts.graph.identity?.userId,
          receipt: context.receipts.graph, guard: () => guard(provisioning), persistReceipt: saveGraph });
        pending ||= result.status === 'pending';
        attention ||= !['ready', 'pending'].includes(result.status);
      }
      if (!await guard(provisioning)) return await finish('cancelled', 'superseded');
      if (!provisioning) {
        if (attention) return await finish('attention', 'withdrawal-review', 'manual-or-ambiguous-grants-retained');
        if (!pending && snapshot.notifyWithdrawal === true) return await notice('group-withdrawn', domainId);
        return await finish(pending ? 'pending' : 'complete', pending ? 'withdrawal-propagating' : 'withdrawn');
      }
      if (attention) return await finish('attention', 'previous-grants-review', 'manual-or-ambiguous-grants-retained');
      if (pending) return await finish('pending', 'previous-grants-propagating');
      const identity = await graph.resolveIdentity({ email: context.account.email, displayName: context.account.name,
        receipt: graphReceipt(), guard: () => guard(true), persistReceipt: saveGraph });
      if (identity.status !== 'ready') return await finish(identity.status === 'pending' ? 'pending' : 'attention', 'microsoft-identity-review');
      const domain = classifyEmailDomain(context.account.email);
      const groups = [];
      for (const id of snapshot.groups) {
        const team = await graph.ensureMembership({ groupId: id, userId: identity.userId,
          receipt: context.receipts.graph, guard: () => guard(true), persistReceipt: saveGraph });
        pending ||= team.status === 'pending';
        attention ||= !['ready', 'pending'].includes(team.status);
        if (!['ready', 'pending'].includes(team.status)) continue;
        const source = domain.sharePointEligible ? await sourceEffect('ensure', { groupId: id, domain: domain.domain,
          loginName: identity.loginName, entraUserId: identity.userId, receipt: context.receipts.sharepoint[id],
          guard: () => guard(true), persistReceipt: saveSharepoint(id) }) : { status: 'teams-only', permissionsVerified: true };
        pending ||= source.status === 'pending';
        attention ||= !['ready', 'teams-only', 'pending'].includes(source.status);
        groups.push({ groupId: id, teamMembershipVerified: team.status === 'ready', sourceAccess: {
          status: source.status === 'teams-only' ? 'teams_only' : source.status,
          permissionsVerified: source.permissionsVerified === true, ...(source.folderUrl ? { folderUrl: source.folderUrl } : {}),
        } });
      }
      if (!await guard(true)) return await finish('cancelled', 'superseded');
      if (attention) return await finish('attention', 'microsoft-access-review');
      if (pending) return await finish('pending', 'microsoft-propagating');
      const previousMail = context.receipts.mail[operationId];
      if (previousMail?.status === 'accepted') return await finish('complete', 'invitation-accepted');
      if (previousMail && previousMail.fingerprint !== pin.fingerprint) return await finish('attention', 'historical-template-review');
      if (['attempting', 'unknown'].includes(previousMail?.status)) {
        const result = await postmark.reconcile({ operationKey: operationId, ...(domainId ? { groupId: domainId } : {}) });
        await save(next => { next.mail[operationId] = { ...previousMail, ...result, checkedAt: now() }; });
        if (!await guard(true)) return await finish('cancelled', 'superseded');
        return await finish(result.status === 'accepted' ? 'complete' : 'attention', result.status === 'accepted' ? 'invitation-accepted' : 'invitation-outcome-unknown');
      }
      if (previousMail) return await finish('attention', 'invitation-review'); // No automatic retries of failed/cancelled mail.
      const result = await postmark.send({ input: { displayName: context.account.name, email: context.account.email,
        microsoft: { redemptionRequired: identity.redemptionRequired,
          ...(identity.redemptionRequired ? { redemptionUrl: identity.redemptionUrl } : {}) }, groups },
        registry: invitationRegistry, logoBase64, operationKey: operationId,
        ...(domainId ? { groupId: domainId } : {}),
        beforeSend: async () => {
          if (!await guard(true)) return false;
          await save(next => { next.mail[operationId] = { status: 'attempting', startedAt: now(),
            ...(domainId ? { domainId } : {}), templateVersion: pin.version, fingerprint: pin.fingerprint }; }, { requireEligible: true });
          return guard(true);
        },
      });
      if (result.attempted || context.receipts.mail[operationId]) await save(next => {
        next.mail[operationId] = { ...next.mail[operationId], ...result, updatedAt: now() };
      });
      if (!await guard(true)) return await finish('cancelled', 'superseded');
      if (result.status === 'accepted') return await finish('complete', 'invitation-accepted');
      if (!result.attempted && !context.receipts.mail[operationId]
        && ['preflight-unavailable', 'suppression-check-unavailable', 'approval-guard-unavailable'].includes(result.reason)) {
        return await finish('pending', 'invitation-preflight-pending');
      }
      return await finish('attention', result.status === 'unknown' ? 'invitation-outcome-unknown' : 'invitation-blocked', result.reason);
    } catch {
      // Provider details can contain identities or invitation capabilities; never propagate them.
      // An unavailable guard is NOT evidence that approval was withdrawn.
      const current = await guard(false).catch(() => undefined);
      if (current === false) {
        try { return await finish('cancelled', 'superseded'); } catch { /* Leave retryable work durable. */ }
      } else if (current === true) {
        try { await finish('pending', 'retry-required'); } catch { /* Never report an unpersisted success. */ }
      }
      throw new Error('Onboarding effects incomplete');
    } finally {
      try { await store.release(context); } catch { /* The bounded lease also expires after an outage. */ }
    }
  }
  return { process };
}
