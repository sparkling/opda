import { ACKNOWLEDGEMENT_CONTRACT, acknowledgementPin, fingerprintAcknowledgementTemplate } from '../hubspot-participation/acknowledgement.mjs';
import { RetryLater, retryAfter } from '../shared/http-retry.mjs';

const ORIGIN = 'https://api.postmarkapp.com';
const STREAM = 'outbound';
const TAG = 'application-received';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

async function readSecret(secretArn) {
  const aws = await import('@aws-sdk/client-secrets-manager');
  const result = await new aws.SecretsManagerClient({ maxAttempts: 2 }).send(
    new aws.GetSecretValueCommand({ SecretId: secretArn }),
  );
  return JSON.parse(result.SecretString);
}

/**
 * Narrow transactional adapter for the applicant acknowledgement only. It sends one
 * pinned template; it has no template write, broadcast, reconciliation or retry API.
 * A POST that starts is never repeated by this client: the worker's durable lease
 * decides, because a dispatched message cannot be recalled.
 */
export function createPostmarkClient(overrides = {}) {
  const fetcher = overrides.fetch ?? globalThis.fetch;
  const pin = acknowledgementPin(overrides.pin);
  let credential;
  let verifiedAt = 0;
  async function request(token, path, { method = 'GET', body } = {}) {
    let response;
    try {
      response = await fetcher(`${ORIGIN}${path}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': token },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw new Error('Postmark transport failure'); }
    let data;
    try { data = await response.json(); } catch { data = null; }
    return { status: response.status, data: data && typeof data === 'object' ? data : {},
      retryAfter: response.headers.get('retry-after') };
  }
  async function verifiedCredential() {
    if (!credential || Date.now() - verifiedAt > 300000) {
      let stored;
      try { stored = await (overrides.getSecret ?? readSecret)(overrides.secretArn); }
      catch { throw new Error('Postmark credential configuration unavailable'); }
      if (stored?.schemaVersion !== 1 || stored?.serverId !== pin.serverId
        || typeof stored?.serverToken !== 'string' || !/^[\x21-\x7e]{8,512}$/u.test(stored.serverToken)) {
        throw new Error('Postmark credential configuration mismatch');
      }
      const { status, data, retryAfter: wait } = await request(stored.serverToken, `/templates/${pin.alias}`);
      if (status === 429) throw new RetryLater(retryAfter(wait));
      if (status === 408 || status >= 500) throw new Error('Postmark template verification unavailable');
      let fingerprint;
      try { fingerprint = fingerprintAcknowledgementTemplate(data); } catch { fingerprint = null; }
      // Pin the numeric ID and the byte-exact content so neither alias reassignment nor edits redirect a send.
      if (status !== 200 || data.Active !== true || data.TemplateId !== pin.templateId
        || data.AssociatedServerId !== pin.serverId || data.Alias !== pin.alias || data.Subject !== pin.subject
        || data.TemplateType !== 'Standard' || data.LayoutTemplate !== null || fingerprint !== pin.fingerprint) {
        throw new Error('Postmark template verification failed');
      }
      credential = stored.serverToken;
      verifiedAt = Date.now();
    }
    return credential;
  }
  return {
    /** payload from buildAcknowledgementPayload; context: { registrationId }. Never log either. */
    async sendAcknowledgement(payload, context) {
      if (payload?.TemplateAlias !== ACKNOWLEDGEMENT_CONTRACT.alias || payload.MessageStream !== STREAM
        || typeof payload.To !== 'string' || typeof payload.TemplateModel?.group_id !== 'string'
        || !UUID.test(context?.registrationId ?? '')) throw new TypeError('Only the acknowledgement payload may be sent');
      const token = await verifiedCredential();
      const query = new URLSearchParams({ EmailAddress: payload.To });
      const suppression = await request(token, `/message-streams/${STREAM}/suppressions/dump?${query}`);
      if (suppression.status === 429) throw new RetryLater(retryAfter(suppression.retryAfter));
      if (suppression.status !== 200 || !Array.isArray(suppression.data.Suppressions)) throw new Error('Postmark suppression check unavailable');
      if (suppression.data.Suppressions.length) return { status: 'suppressed' };
      const { TemplateAlias, ...rest } = payload;
      const body = { ...rest, TemplateId: pin.templateId, Tag: TAG, Metadata: {
        opda_registration_id: context.registrationId, opda_domain_id: payload.TemplateModel.group_id, opda_template_sha256: pin.fingerprint,
      } };
      const { status, data, retryAfter: wait } = await request(token, '/email/withTemplate', { method: 'POST', body });
      if (status === 200 && data.ErrorCode === 0 && UUID.test(data.MessageID ?? '') && data.To?.toLowerCase() === payload.To) {
        return { status: 'accepted', messageId: data.MessageID, submittedAt: data.SubmittedAt };
      }
      if (status === 429) throw new RetryLater(retryAfter(wait));
      if ((status === 200 || (status >= 400 && status < 500 && status !== 408)) && Number.isSafeInteger(data.ErrorCode)
        && data.ErrorCode > 0 && (!data.MessageID || data.MessageID === NIL_UUID)) {
        return { status: 'rejected', errorCode: data.ErrorCode };
      }
      // A timeout or 5xx after dispatch may have committed; the worker must not blindly retry.
      throw new Error('Postmark send outcome unknown');
    },
  };
}
