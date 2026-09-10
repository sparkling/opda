import { isDeepStrictEqual } from 'node:util';
import { APPROVAL_GROUP_IDS, MICROSOFT_INVITATION_RETURN_URL } from './invitation.mjs';

const result = status => ({ status });
const outcome = value => result(value?.status === 'manual-review' ? 'review' : 'pending');
const approved = (participant, groupId) => participant?.approvedDomains?.includes(groupId)
  && participant.domainApprovals?.[groupId]?.status === 'approved';
const fixedCallback = identity => typeof identity?.redemptionUrl === 'string'
  && identity.inviteRedirectUrl === MICROSOFT_INVITATION_RETURN_URL;

/** A bounded, single-participant hand-off. No mail, grants, jobs or account creation. */
export function createWorkspaceFlow({ authorize, store, graph, workspaces }) {
  return async function openWorkspace(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)
      || Object.keys(input).sort().join(',') !== 'groupId,phase,schemaVersion,sessionToken'
      || input.schemaVersion !== 1 || !APPROVAL_GROUP_IDS.includes(input.groupId)
      || !['open', 'return'].includes(input.phase)
      || typeof input.sessionToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(input.sessionToken)) return result('denied');
    let context, readOnly = false;
    try {
      const initial = await authorize(input.sessionToken);
      if (!initial || !approved(initial.participant, input.groupId)) return result('denied');
      const participant = initial.participant;
      const loaded = typeof store.load === 'function' ? await store.load({ participant, groupId: input.groupId }) : { status: 'repair' };
      if (loaded?.status === 'denied') return result('denied');
      if (loaded?.status === 'pending' || loaded?.status === 'noidentity' && input.phase === 'return') return result('pending');
      if (loaded?.status === 'ready') { context = loaded.context; readOnly = true; }
      else {
        context = await store.claim({ participant, groupId: input.groupId });
        if (!context) return result('pending');
      }
      let guard = async () => {
        const current = await authorize(input.sessionToken);
        return Boolean(current && approved(current.participant, input.groupId)
          && current.participant.participantId === participant.participantId
          && current.participant.cognitoSub === participant.cognitoSub
          && current.participant.email === participant.email
          && current.participant.accessVersion === participant.accessVersion
          && isDeepStrictEqual(current.participant.domainApprovals[input.groupId], participant.domainApprovals[input.groupId])
          && await store.guard(context, current.participant));
      };
      if (!await guard()) return result('denied');
      const readAccess = () => graph.readAccess({ email: participant.email, groupId: input.groupId,
        receipt: Object.keys(context.receipts.graph).length ? context.receipts.graph : undefined, guard });
      let access = await readAccess();
      if (!await guard()) return result('denied');
      if (access.status !== 'ready') {
        if (readOnly || input.phase === 'return' || access.reason !== 'microsoft-identity-missing') return outcome(access);
        const resolved = await graph.resolveIdentity({ email: participant.email,
          displayName: participant.name?.trim() || participant.email,
          existingOnly: true, receipt: context.receipts.graph, guard,
          persistReceipt: receipt => store.saveGraph(context, receipt) });
        if (resolved.status !== 'ready') return outcome(resolved);
        access = await readAccess();
        if (!await guard()) return result('denied');
        if (access.status !== 'ready') return outcome(access);
      }
      // Pin the exact verified directory object, also for imported manual memberships.
      // Preserve all grant ownership, SharePoint and mail receipts without adopting them.
      if (!readOnly && !isDeepStrictEqual(context.receipts.graph, access.receipt)
        && !await store.saveGraph(context, access.receipt)) return result('pending');
      let identity = access.receipt.identity;
      if (access.redemptionRequired) {
        // An unsolicited callback is not evidence of acceptance. No re-redemption loop.
        if (input.phase === 'return') return result('pending');
        if (!fixedCallback(identity)) {
          if (readOnly) {
            await store.release(context);
            context = await store.claim({ participant, groupId: input.groupId });
            if (!context) return result('pending');
            readOnly = false;
            guard = async () => {
              const current = await authorize(input.sessionToken);
              return Boolean(current && approved(current.participant, input.groupId)
                && current.participant.participantId === participant.participantId
                && current.participant.cognitoSub === participant.cognitoSub
                && current.participant.email === participant.email
                && current.participant.accessVersion === participant.accessVersion
                && isDeepStrictEqual(current.participant.domainApprovals[input.groupId], participant.domainApprovals[input.groupId])
                && await store.guard(context, current.participant));
            };
            if (!await guard()) return result('denied');
            access = await readAccess();
            if (!await guard()) return result('denied');
            if (access.status !== 'ready') return outcome(access);
            identity = access.receipt.identity;
            if (!access.redemptionRequired) return { status: 'ready', location: workspaces[input.groupId].teamUrl };
          }
          const resolved = await graph.resolveIdentity({ email: participant.email,
            displayName: participant.name?.trim() || participant.email,
            existingOnly: true, receipt: context.receipts.graph, guard,
            persistReceipt: receipt => store.saveGraph(context, receipt) });
          if (resolved.status !== 'ready') return outcome(resolved);
          // Membership and identity may have changed while the invitation was refreshed.
          const refreshed = await graph.readAccess({ email: participant.email, groupId: input.groupId,
            receipt: context.receipts.graph, guard });
          if (refreshed.status !== 'ready') return outcome(refreshed);
          identity = refreshed.receipt.identity;
          if (!await guard()) return result('denied');
          if (!refreshed.redemptionRequired) return { status: 'ready', location: workspaces[input.groupId].teamUrl };
        }
        if (!await guard()) return result('denied');
        return identity?.redemptionUrl && identity.inviteRedirectUrl === MICROSOFT_INVITATION_RETURN_URL
          ? { status: 'redeem', location: identity.redemptionUrl } : result('review');
      }
      if (!await guard()) return result('denied');
      return { status: 'ready', location: workspaces[input.groupId].teamUrl };
    } catch { return result('unavailable'); }
    finally { if (context) { try { await store.release(context); } catch { /* Lease expires; no provider retry here. */ } } }
  };
}
