import { createHash } from 'node:crypto';
import { buildInvitationPayload, INVITATION_SUBJECT, INVITATION_TEMPLATE_ALIAS } from './invitation.mjs';

const ORIGIN = 'https://api.postmarkapp.com';
const DIGEST = /^[a-f0-9]{64}$/;
const UUID = /^(?!00000000-0000-0000-0000-000000000000$)[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})$/;
const TAG = 'approval-onboarding';
const MAX_LOCAL_ATTEMPTS = 1000;

function requireValue(condition, message) {
  if (!condition) throw new TypeError(`Invalid Postmark invitation configuration: ${message}`);
}

function object(value, keys) {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value)), 'plain object required');
  requireValue(!keys || Object.keys(value).every((key) => keys.includes(key)), 'unsupported field');
  requireValue(Object.values(Object.getOwnPropertyDescriptors(value)).every((item) => !item.get && !item.set), 'accessors are unsupported');
}

const validDate = (value) => typeof value === 'string' && DATE.test(value) && Number.isFinite(Date.parse(value));
const readSucceeded = (status, data) => status === 200 && (data.ErrorCode === undefined || data.ErrorCode === 0);
const failed = (reason, attempted = false, extra = {}) => ({ status: 'failed', attempted, reason, ...extra });
const unknown = (reason, attempted = false) => ({ status: 'unknown', attempted, reason });

/** Byte-exact content pin; no provider-native immutable version is assumed. */
export function fingerprintTemplate(template) {
  object(template);
  const { Alias = INVITATION_TEMPLATE_ALIAS, Subject = INVITATION_SUBJECT,
    HtmlBody, TextBody, TemplateType = 'Standard', LayoutTemplate = null } = template;
  requireValue(Alias === INVITATION_TEMPLATE_ALIAS && Subject === INVITATION_SUBJECT
    && TemplateType === 'Standard' && LayoutTemplate === null, 'unexpected template contract');
  for (const body of [HtmlBody, TextBody]) requireValue(typeof body === 'string' && body.length > 0
    && body.length <= 500_000 && body.includes('pm:unsubscribe'), 'bounded body with unsubscribe required');
  requireValue(HtmlBody.includes('cid:opda-logo'), 'CID logo required');
  return createHash('sha256').update(JSON.stringify([Alias, Subject, HtmlBody, TextBody, TemplateType, LayoutTemplate])).digest('hex');
}

/**
 * No secret loading, logging, template writes, suppression removal or automatic retry.
 * beforeSend must recheck CURRENT approval/withdrawal and acquire the caller's durable
 * per-review send claim. A true return authorizes exactly one POST. Keep this callback
 * bounded. Cancellation is checked after it returns, immediately before dispatch.
 * That guard cannot be atomic with Postmark: a dispatched message cannot be recalled.
 * A same-process map supplements, but NEVER replaces, the durable caller-owned ledger.
 * Postmark also cannot atomically assert a template hash with sending: keep the pinned
 * template version unchanged while attempts run; content drift blocks the next preflight.
 *
 * Official contracts:
 * https://postmarkapp.com/developer/api/templates-api
 * https://postmarkapp.com/developer/api/suppressions-api
 * https://postmarkapp.com/developer/api/messages-api
 */
export function createPostmarkInvitationAdapter(config) {
  object(config, ['token', 'fetchImpl', 'expectedServerId', 'expectedTemplateId', 'expectedTemplateFingerprint', 'timeoutMs']);
  const { token, fetchImpl = globalThis.fetch, expectedServerId, expectedTemplateId,
    expectedTemplateFingerprint, timeoutMs = 10_000 } = config;
  requireValue(typeof token === 'string' && token.length > 0 && token.length <= 512 && /^[\x21-\x7e]+$/u.test(token), 'bounded token required');
  requireValue(typeof fetchImpl === 'function', 'fetch implementation required');
  requireValue([expectedServerId, expectedTemplateId].every((value) => Number.isSafeInteger(value) && value > 0), 'positive server and template IDs required');
  requireValue(typeof expectedTemplateFingerprint === 'string' && DIGEST.test(expectedTemplateFingerprint), 'SHA-256 template pin required');
  requireValue(Number.isInteger(timeoutMs) && timeoutMs >= 1 && timeoutMs <= 30_000, 'timeout must be 1–30000 milliseconds');
  const localAttempts = new Map();

  async function request(path, { method = 'GET', body, signal } = {}) {
    const deadline = AbortSignal.timeout(timeoutMs);
    const response = await fetchImpl(`${ORIGIN}${path}`, {
      method, redirect: 'error',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': token },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
    });
    const text = await response.text();
    requireValue(text.length <= 1_100_000, 'provider response exceeds limit');
    const data = JSON.parse(text);
    object(data);
    return { status: response.status, data };
  }

  async function verifyTemplate(signal) {
    try {
      const { status, data } = await request(`/templates/${INVITATION_TEMPLATE_ALIAS}`, { signal });
      return readSucceeded(status, data) && data.Active === true && data.TemplateId === expectedTemplateId
        && data.AssociatedServerId === expectedServerId && data.Alias === INVITATION_TEMPLATE_ALIAS
        && data.Subject === INVITATION_SUBJECT && data.TemplateType === 'Standard' && data.LayoutTemplate === null
        && fingerprintTemplate(data) === expectedTemplateFingerprint;
    } catch { return false; }
  }

  async function verifyStream(signal) {
    try {
      const { status, data } = await request('/message-streams/broadcast', { signal });
      return readSucceeded(status, data) && data.ID === 'broadcast' && data.ServerID === expectedServerId
        && data.MessageStreamType === 'Broadcasts' && data.ArchivedAt === null
        && data.SubscriptionManagementConfiguration?.UnsubscribeHandlingType === 'Postmark';
    } catch { return false; }
  }

  async function checkSuppression(email, signal) {
    try {
      const query = new URLSearchParams({ EmailAddress: email });
      const { status, data } = await request(`/message-streams/broadcast/suppressions/dump?${query}`, { signal });
      if (!readSucceeded(status, data) || !Array.isArray(data.Suppressions) || data.Suppressions.length > 100
        || !data.Suppressions.every((row) => typeof row?.EmailAddress === 'string'
          && row.EmailAddress.toLowerCase() === email)) return 'unavailable';
      // Any matching suppression blocks, including an unfamiliar future reason.
      return data.Suppressions.length ? 'suppressed' : 'clear';
    } catch { return 'unavailable'; }
  }

  function classifySend({ status, data }, email) {
    if (status === 200 && data.ErrorCode === 0 && UUID.test(data.MessageID ?? '')
      && validDate(data.SubmittedAt) && typeof data.To === 'string' && data.To.toLowerCase() === email) {
      return { status: 'accepted', attempted: true, messageId: data.MessageID, submittedAt: data.SubmittedAt };
    }
    const rejectionStatus = status === 200 || (status >= 400 && status < 500 && status !== 408);
    if (rejectionStatus && Number.isSafeInteger(data.ErrorCode) && data.ErrorCode > 0
      && (!data.MessageID || data.MessageID === '00000000-0000-0000-0000-000000000000')) {
      return failed('provider-rejected', true, { errorCode: data.ErrorCode });
    }
    return unknown('send-outcome-unknown', true);
  }

  /** Input is the invitation builder contract plus a hash key and final guard. */
  async function send(args) {
    let payload;
    try {
      object(args, ['input', 'registry', 'logoBase64', 'operationKey', 'beforeSend', 'signal']);
      requireValue(typeof args.operationKey === 'string' && DIGEST.test(args.operationKey), 'opaque operation key required');
      requireValue(typeof args.beforeSend === 'function', 'final approval guard required');
      requireValue(args.signal === undefined || args.signal instanceof AbortSignal, 'AbortSignal required');
      payload = buildInvitationPayload(args.input, args.registry, { logoBase64: args.logoBase64 });
    } catch { return failed('invalid-input'); }
    const { operationKey, beforeSend, signal } = args;
    if (signal?.aborted) return failed('stale-or-cancelled');
    if (localAttempts.has(operationKey)) return { ...localAttempts.get(operationKey), attempted: false, reason: 'already-attempted' };
    if (localAttempts.size >= MAX_LOCAL_ATTEMPTS) return failed('local-ledger-full');
    localAttempts.set(operationKey, unknown('send-in-progress'));
    let dispatched = false;
    const finish = (result) => {
      if (dispatched) localAttempts.set(operationKey, { ...result });
      else localAttempts.delete(operationKey);
      return result;
    };
    try {
      const [templateValid, streamValid] = await Promise.all([verifyTemplate(signal), verifyStream(signal)]);
      if (signal?.aborted) return finish(failed('stale-or-cancelled'));
      if (!templateValid) return finish(failed('template-verification-failed'));
      if (!streamValid) return finish(failed('stream-verification-failed'));
      // Pin the verified numeric ID so an alias reassignment cannot redirect a send.
      delete payload.TemplateAlias;
      payload.TemplateId = expectedTemplateId;
      payload.Tag = TAG;
      payload.Metadata = { opda_onboarding_key: operationKey, opda_template_sha256: expectedTemplateFingerprint };
      const suppression = await checkSuppression(payload.To, signal);
      if (signal?.aborted) return finish(failed('stale-or-cancelled'));
      if (suppression === 'unavailable') return finish(failed('suppression-check-unavailable'));
      if (suppression === 'suppressed') return finish(failed('suppressed'));
      let current;
      try { current = await beforeSend(); } catch { return finish(failed('approval-guard-unavailable')); }
      if (current !== true || signal?.aborted) return finish(failed('stale-or-cancelled'));
      // No provider read or asynchronous work is inserted between this guard and POST.
      dispatched = true;
      return finish(classifySend(await request('/email/withTemplate', { method: 'POST', body: payload, signal }), payload.To));
    } catch {
      // Once fetch starts, a timeout/abort/parse failure is ambiguous, NOT retryable proof.
      return finish(dispatched ? unknown('send-outcome-unknown', true) : failed('preflight-unavailable'));
    }
  }

  /**
   * Reconcile a previously attempted/unknown operation, never a new send population.
   * Search metadata is not an idempotency facility. Not-found remains unknown because
   * activity can be delayed or outside configured retention; no absence authorizes a resend.
   * Queued/Sent/Processed proves provider acceptance only, not delivery or recipient access.
   */
  async function reconcile(args) {
    try {
      object(args, ['operationKey', 'signal']);
      requireValue(typeof args.operationKey === 'string' && DIGEST.test(args.operationKey), 'opaque operation key required');
      requireValue(args.signal === undefined || args.signal instanceof AbortSignal, 'AbortSignal required');
    } catch { return unknown('invalid-input'); }
    const { operationKey, signal } = args;
    let result;
    try {
      const query = new URLSearchParams({ count: '2', offset: '0', messagestream: 'broadcast', metadata_opda_onboarding_key: operationKey });
      const { status, data } = await request(`/messages/outbound?${query}`, { signal });
      if (!readSucceeded(status, data) || !Number.isSafeInteger(data.TotalCount) || data.TotalCount < 0
        || !Array.isArray(data.Messages) || data.Messages.length > 2) result = unknown('activity-unavailable');
      else if (data.TotalCount > 1) result = unknown('multiple-provider-matches');
      else if (data.TotalCount === 0 && data.Messages.length === 0) result = unknown('not-found');
      else {
        const row = data.Messages[0];
        const matches = data.TotalCount === 1 && data.Messages.length === 1 && row
          && UUID.test(row.MessageID ?? '') && row.MessageStream === 'broadcast'
          && row.Metadata?.opda_onboarding_key === operationKey
          && row.Metadata?.opda_template_sha256 === expectedTemplateFingerprint
          && row.Tag === TAG && row.Subject === INVITATION_SUBJECT
          && ['Queued', 'Sent', 'Processed'].includes(row.Status) && validDate(row.ReceivedAt)
          && row.TrackOpens === false && row.TrackLinks === 'None' && row.Sandboxed === false
          && Array.isArray(row.To) && row.To.length === 1 && typeof row.To[0]?.Email === 'string'
          && Array.isArray(row.Cc) && row.Cc.length === 0 && Array.isArray(row.Bcc) && row.Bcc.length === 0;
        result = matches ? { status: 'accepted', attempted: false, messageId: row.MessageID,
          submittedAt: row.ReceivedAt, providerStatus: row.Status, reconciled: true } : unknown('activity-mismatch');
      }
    } catch { result = unknown('activity-unavailable'); }
    // Retain uncertain reconciliation as a no-resend guard in this process, too.
    if (localAttempts.size < MAX_LOCAL_ATTEMPTS || localAttempts.has(operationKey)) localAttempts.set(operationKey, { ...result });
    return result;
  }

  return Object.freeze({ send, reconcile });
}
