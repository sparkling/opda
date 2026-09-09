const RETRYABLE = ['preflight-unavailable', 'suppression-check-unavailable', 'approval-guard-unavailable'];
// Only the adapter's explicit proof that dispatch never began permits a retry.
// Missing/falsey evidence and attempted/unknown sends never qualify.
const retryableUnsent = receipt => receipt?.status === 'failed' && receipt.attempted === false
  && [...RETRYABLE, 'stale-or-cancelled'].includes(receipt.reason);

/** Access notices use the existing private mail ledger, with current-denial guards.
 * The website notice has its own operation and never waits for Microsoft effects.
 */
export async function sendAccessNotice({ context, store, postmark, pin, kind, groupId, logoBase64, now = Date.now }) {
  const operationKey = context.operation.operationId;
  const currentNotice = () => store.guard(context, { requireNotice: true });
  const providerReady = () => kind !== 'website-disabled'
    || context.binding?.providerAccessVersion === context.operation.accessVersion;
  const guard = async () => await currentNotice() && providerReady();
  const done = (status, stage, reason) => ({ status, stage, ...(reason ? { reason } : {}) });
  const disposition = async () => !await currentNotice() ? done('cancelled', 'notice-superseded')
    : !providerReady() ? done('pending', 'awaiting-provider-disable') : null;
  const initial = await disposition();
  if (initial) return initial;
  if (!pin || !Number.isSafeInteger(pin.templateId) || !postmark) return done('pending', 'awaiting-notice-template');
  const reference = { kind, ...(groupId ? { groupId } : {}), operationKey };
  async function save(receipt, options) {
    const next = structuredClone(context.receipts);
    next.mail[operationKey] = receipt;
    if (!await store.saveReceipts(context, next, options)) throw new Error('Access notice receipt unavailable');
  }
  const previous = context.receipts.mail[operationKey];
  if (previous && (previous.kind !== kind || previous.fingerprint !== pin.fingerprint)) {
    return done('attention', 'notice-template-review');
  }
  if (previous?.status === 'accepted') return done('complete', 'notice-accepted');
  if (['attempting', 'unknown'].includes(previous?.status)) {
    const result = await postmark.reconcile(reference);
    await save({ ...previous, ...result, checkedAt: now() });
    const current = await disposition(); if (current) return current;
    return done(result.status === 'accepted' ? 'complete' : 'attention',
      result.status === 'accepted' ? 'notice-accepted' : 'notice-outcome-unknown');
  }
  if (previous && !retryableUnsent(previous)) return done('attention', 'notice-review');
  const result = await postmark.send({ ...reference, logoBase64,
    input: { displayName: context.account.name, email: context.account.email },
    beforeSend: async () => {
      if (!await guard()) return false;
      await save({ kind, ...(groupId ? { domainId: groupId } : {}), status: 'attempting', startedAt: now(),
        templateVersion: pin.version, fingerprint: pin.fingerprint }, { requireNotice: true });
      return guard();
    } });
  if (result.attempted || context.receipts.mail[operationKey]) {
    await save({ ...context.receipts.mail[operationKey], ...result, updatedAt: now() });
  }
  const current = await disposition(); if (current) return current;
  if (result.status === 'accepted') return done('complete', 'notice-accepted');
  if (retryableUnsent(result)) {
    return done('pending', 'notice-preflight-pending');
  }
  return done('attention', result.status === 'unknown' ? 'notice-outcome-unknown' : 'notice-blocked', result.reason);
}
