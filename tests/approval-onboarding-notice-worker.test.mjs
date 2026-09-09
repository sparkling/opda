import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sendAccessNotice } from '../src/approval-onboarding/notice-worker.mjs';
import { createPostmarkInvitationAdapter, fingerprintTemplate } from '../src/approval-onboarding/postmark.mjs';
import { compileWithdrawalNoticeTemplate } from '../src/approval-onboarding/withdrawal-notice.mjs';

const source = name => readFileSync(new URL(`../docs/templates/${name}`, import.meta.url), 'utf8');
const template = { ...compileWithdrawalNoticeTemplate('website-disabled', undefined, {
  HtmlBody: source('participation-access-change-email.html'), TextBody: source('participation-access-change-email.txt'),
}), Active: true, TemplateId: 123, AssociatedServerId: 20188829 };
const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

function fixture() {
  const context = { operation: { operationId: 'a'.repeat(64), accessVersion: 2 }, binding: { providerAccessVersion: 2 }, account: { name: 'Synthetic Participant', email: 'test@example.test' },
    receipts: { graph: {}, sharepoint: {}, mail: {} } };
  const pin = { version: 1, templateId: 123, fingerprint: 'b'.repeat(64) };
  const state = { current: true, sends: 0, reconciles: 0, writes: [] };
  const store = { guard: async (_ctx, options) => {
    assert.deepEqual(options, { requireNotice: true }); return state.current;
  }, saveReceipts: async (ctx, receipts, options) => {
    state.writes.push(options); ctx.receipts = structuredClone(receipts); return true;
  } };
  const postmark = { send: async args => {
    assert.equal(await args.beforeSend(), true); state.sends++;
    assert.equal(context.receipts.mail[context.operation.operationId].status, 'attempting');
    assert.deepEqual(state.writes.at(-1), { requireNotice: true });
    return { status: 'accepted', attempted: true, messageId: 'provider-ack' };
  }, reconcile: async () => { state.reconciles++; return { status: 'unknown', attempted: false }; } };
  const args = { context, store, postmark, pin, kind: 'website-disabled', logoBase64: 'test', now: () => 1000 };
  return { args, context, store, postmark, pin, state, run: () => sendAccessNotice(args) };
}

// The real adapter owns attempted:false and does not call this synthetic POST
// transport unless the complete final callback returned true.
function useRealAdapter(f, overrides = {}) {
  f.pin.fingerprint = fingerprintTemplate(template, { noticeKind: 'website-disabled' });
  f.args.logoBase64 = logoBase64;
  const adapter = createPostmarkInvitationAdapter({ token: 'synthetic-not-secret', expectedServerId: 20188829,
    expectedTemplateId: 123, expectedTemplateFingerprint: f.pin.fingerprint, noticeKind: 'website-disabled',
    fetchImpl: async (url, options) => {
      const path = new URL(url).pathname;
      if (options.method === 'POST') f.state.sends++;
      if (overrides[path]) return overrides[path]();
      if (path === `/templates/${template.Alias}`) return json(template);
      if (path === '/server') return json({ ID: 20188829, DeliveryType: 'Live', TrackOpens: false, TrackLinks: 'None' });
      if (path === '/message-streams/outbound') return json({ ID: 'outbound', ServerID: 20188829, MessageStreamType: 'Transactional',
        ArchivedAt: null, SubscriptionManagementConfiguration: { UnsubscribeHandlingType: 'None' } });
      if (path === '/message-streams/outbound/suppressions/dump') return json({ Suppressions: [] });
      if (path === '/messages/outbound') { f.state.reconciles++; return json({ TotalCount: 0, Messages: [] }); }
      if (path === '/email/withTemplate') return json({ ErrorCode: 0, MessageID: '22222222-2222-4222-8222-222222222222',
        SubmittedAt: '2026-09-09T17:00:00Z', To: f.context.account.email });
      throw new Error('Unexpected synthetic provider path');
    } });
  f.args.postmark = {
    send: ({ kind, ...args }) => { assert.equal(kind, 'website-disabled'); return adapter.send(args); },
    reconcile: ({ kind, ...args }) => { assert.equal(kind, 'website-disabled'); return adapter.reconcile(args); },
  };
}

function resetProviderAfterAttemptSave(f) {
  const persist = f.store.saveReceipts;
  let reset = true;
  f.store.saveReceipts = async (context, receipts, options) => {
    const result = await persist(context, receipts, options);
    if (reset && options?.requireNotice) { reset = false; context.binding.providerAccessVersion = null; }
    return result;
  };
}
test('notification persists its own attempt before dispatch, and accepted replay never sends again', async () => {
  const f = fixture();
  assert.equal((await f.run()).status, 'complete');
  assert.equal(f.context.receipts.mail[f.context.operation.operationId].kind, 'website-disabled');
  assert.equal((await f.run()).status, 'complete'); assert.equal(f.state.sends, 1);
});
test('reapproval or missing current identity suppresses stale removal notices', async () => {
  const f = fixture(); f.state.current = false;
  assert.equal((await f.run()).status, 'cancelled'); assert.equal(f.state.sends, 0);
});
test('website notice waits durably for Cognito disable/sign-out before making that claim', async () => {
  const f = fixture(); f.context.binding.providerAccessVersion = 1;
  assert.deepEqual(await f.run(), { status: 'pending', stage: 'awaiting-provider-disable' });
  assert.equal(f.state.sends, 0);
  f.context.binding.providerAccessVersion = 2;
  assert.equal((await f.run()).status, 'complete'); assert.equal(f.state.sends, 1);
});
test('a provider marker reset during preflight stays pending rather than cancelling the denial notice', async () => {
  const f = fixture(); const normal = f.postmark.send;
  f.postmark.send = async args => {
    f.context.binding.providerAccessVersion = null;
    assert.equal(await args.beforeSend(), false);
    return { status: 'failed', attempted: false, reason: 'stale-or-cancelled' };
  };
  assert.deepEqual(await f.run(), { status: 'pending', stage: 'awaiting-provider-disable' });
  assert.equal(f.state.sends, 0); assert.deepEqual(f.context.receipts.mail, {});
  f.context.binding.providerAccessVersion = 2; f.postmark.send = normal;
  assert.equal((await f.run()).status, 'complete'); assert.equal(f.state.sends, 1);
});
test('provider loss after the durable attempt save resumes only after the real adapter proves no POST occurred', async () => {
  const f = fixture(); useRealAdapter(f); resetProviderAfterAttemptSave(f);
  assert.deepEqual(await f.run(), { status: 'pending', stage: 'awaiting-provider-disable' });
  const receipt = f.context.receipts.mail[f.context.operation.operationId];
  assert.equal(receipt.status, 'failed'); assert.equal(receipt.attempted, false);
  assert.equal(receipt.reason, 'stale-or-cancelled'); assert.equal(f.state.sends, 0);
  f.context.binding.providerAccessVersion = 2;
  useRealAdapter(f); // A new process must recover from the durable receipt, not local adapter state.
  assert.deepEqual(await f.run(), { status: 'complete', stage: 'notice-accepted' });
  assert.equal(f.state.sends, 1); assert.equal(f.state.reconciles, 0);
  assert.equal((await f.run()).status, 'complete'); assert.equal(f.state.sends, 1);
});
test('a proven unsent receipt stays retryable through a later provider-read outage', async () => {
  const f = fixture(); useRealAdapter(f); resetProviderAfterAttemptSave(f);
  assert.equal((await f.run()).stage, 'awaiting-provider-disable');
  f.context.binding.providerAccessVersion = 2;
  useRealAdapter(f, { '/server': () => json({ ErrorCode: 100 }, 503) });
  assert.deepEqual(await f.run(), { status: 'pending', stage: 'notice-preflight-pending' });
  assert.equal(f.state.sends, 0);
  const receipt = f.context.receipts.mail[f.context.operation.operationId];
  assert.equal(receipt.attempted, false); assert.equal(receipt.reason, 'preflight-unavailable');
  useRealAdapter(f);
  assert.equal((await f.run()).status, 'complete'); assert.equal(f.state.sends, 1);
});
test('reapproval still cancels a proven unsent notice rather than retrying it', async () => {
  const f = fixture(); useRealAdapter(f); resetProviderAfterAttemptSave(f);
  assert.equal((await f.run()).status, 'pending');
  f.context.binding.providerAccessVersion = 2; f.state.current = false; useRealAdapter(f);
  assert.equal((await f.run()).status, 'cancelled'); assert.equal(f.state.sends, 0);
});
test('a provider marker reset after actual dispatch cannot turn uncertainty or rejection into retry permission', async () => {
  for (const outcome of ['unknown', 'rejected']) {
    const f = fixture();
    useRealAdapter(f, { '/email/withTemplate': () => {
      f.context.binding.providerAccessVersion = null;
      if (outcome === 'unknown') throw new Error('Synthetic post-dispatch timeout');
      return json({ ErrorCode: 406 }, 422);
    } });
    assert.equal((await f.run()).stage, 'awaiting-provider-disable');
    assert.equal(f.state.sends, 1);
    assert.equal(f.context.receipts.mail[f.context.operation.operationId].attempted, true);
    f.context.binding.providerAccessVersion = 2; useRealAdapter(f);
    assert.equal((await f.run()).status, 'attention'); assert.equal(f.state.sends, 1);
    assert.equal(f.state.reconciles, outcome === 'unknown' ? 1 : 0);
    assert.equal((await f.run()).status, 'attention'); assert.equal(f.state.sends, 1);
  }
});
test('receipt retry eligibility requires explicit false dispatch evidence and an allowed non-dispatch reason', async () => {
  for (const [status, attempted, reason] of [
    ['failed', true, 'stale-or-cancelled'], ['failed', undefined, 'stale-or-cancelled'], ['failed', 0, 'stale-or-cancelled'],
    ['failed', false, 'already-attempted'], ['failed', false, 'provider-rejected'], ['failed', false, 'suppressed'],
    ['failed', false, 'template-verification-failed'], ['unknown', false, 'stale-or-cancelled'], ['attempting', false, 'stale-or-cancelled'],
  ]) {
    const f = fixture();
    f.context.receipts.mail[f.context.operation.operationId] = { status, attempted, reason,
      kind: 'website-disabled', fingerprint: f.pin.fingerprint };
    assert.equal((await f.run()).status, 'attention'); assert.equal(f.state.sends, 0);
    assert.equal(f.state.reconciles, ['attempting', 'unknown'].includes(status) ? 1 : 0);
  }
});
test('unknown sends reconcile, never blindly resend or take another event receipt', async () => {
  const f = fixture();
  f.context.receipts.mail[f.context.operation.operationId] = { status: 'attempting', kind: 'website-disabled', fingerprint: f.pin.fingerprint };
  assert.equal((await f.run()).status, 'attention'); assert.equal(f.state.sends, 0); assert.equal(f.state.reconciles, 1);
  f.postmark.reconcile = async () => ({ status: 'accepted', attempted: false });
  assert.equal((await f.run()).status, 'complete'); assert.equal(f.state.sends, 0);
});
test('preflight outages remain retryable with no send receipt and definitive failures require attention', async () => {
  const f = fixture(); const normal = f.postmark.send;
  f.postmark.send = async () => ({ status: 'failed', attempted: false, reason: 'preflight-unavailable' });
  assert.equal((await f.run()).status, 'pending'); assert.deepEqual(f.context.receipts.mail, {});
  f.postmark.send = normal; assert.equal((await f.run()).status, 'complete'); assert.equal(f.state.sends, 1);
  const blocked = fixture(); blocked.postmark.send = async () => ({ status: 'failed', attempted: false, reason: 'suppressed' });
  assert.equal((await blocked.run()).status, 'attention'); assert.equal(blocked.state.sends, 0);
});
test('a changed pin or unexpected prior event never permits another send', async () => {
  const f = fixture();
  f.context.receipts.mail[f.context.operation.operationId] = { status: 'unknown', kind: 'group-withdrawn', fingerprint: 'c'.repeat(64) };
  assert.equal((await f.run()).status, 'attention'); assert.equal(f.state.sends, 0); assert.equal(f.state.reconciles, 0);
});
