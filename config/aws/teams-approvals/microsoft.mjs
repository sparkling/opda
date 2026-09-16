import { cardAttachment } from './card.mjs';

/**
 * The bot's own Microsoft identity, used two ways (ADR-0088): as a Bot Framework
 * client to post and update cards in the Signups channel, and as a Graph client
 * with the single `GroupMember.Read.All` permission to check the approver list.
 * The secret is read at runtime from Secrets Manager; a placeholder or malformed
 * value makes every call fail closed.
 */
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_SCOPE = 'https://api.botframework.com/.default';
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
export const SERVICE_HOST = 'smba.trafficmanager.net';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = message => { throw new Error(message); };

export function botCredential(stored) {
  if (!object(stored) || !GUID.test(stored.appId ?? '') || !GUID.test(stored.tenantId ?? '')
    || typeof stored.clientSecret !== 'string' || stored.clientSecret.length < 16 || stored.clientSecret.length > 512) {
    fail('Bot credential configuration unavailable');
  }
  return { appId: stored.appId, tenantId: stored.tenantId, clientSecret: stored.clientSecret };
}

/** Only Teams' own connector host is ever called back; a forged service URL is refused. */
export function serviceUrlOf(value) {
  let url;
  try { url = new URL(value); } catch { fail('Invalid service URL'); }
  if (url.protocol !== 'https:' || url.hostname !== SERVICE_HOST || url.username || url.password || url.port
    || url.search || url.hash) fail('Invalid service URL');
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
}

async function readSecret(secretArn) {
  const aws = await import('@aws-sdk/client-secrets-manager');
  const result = await new aws.SecretsManagerClient({ maxAttempts: 2 }).send(
    new aws.GetSecretValueCommand({ SecretId: secretArn }), { abortSignal: AbortSignal.timeout(3000) });
  return JSON.parse(result.SecretString);
}

export function createMicrosoftClient({ secretArn, getSecret = readSecret, fetch = globalThis.fetch, now = Date.now } = {}) {
  const tokens = new Map();
  let credential;

  async function loadCredential() {
    if (!credential) {
      let stored;
      try { stored = await getSecret(secretArn); } catch { fail('Bot credential configuration unavailable'); }
      credential = botCredential(stored);
    }
    return credential;
  }

  async function token(scope) {
    const cached = tokens.get(scope);
    if (cached && cached.expiresAt - 60000 > now()) return cached.value;
    const { appId, tenantId, clientSecret } = await loadCredential();
    let body;
    try {
      const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: appId, client_secret: clientSecret, scope }),
      });
      if (!response.ok) { credential = undefined; fail('token'); }
      body = await response.json();
    } catch { fail('Microsoft token request failed'); }
    if (!object(body) || typeof body.access_token !== 'string' || !Number.isSafeInteger(body.expires_in)) fail('Microsoft token request failed');
    tokens.set(scope, { value: body.access_token, expiresAt: now() + body.expires_in * 1000 });
    return body.access_token;
  }

  async function request(scope, url, { method = 'GET', body, headers = {} } = {}) {
    let response;
    try {
      response = await fetch(url, { method, redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${await token(scope)}`, 'content-type': 'application/json', ...headers },
        ...(body ? { body: JSON.stringify(body) } : {}) });
    } catch { fail('Microsoft transport failure'); }
    if (response.status === 401 || response.status === 403) tokens.delete(scope);
    if (!response.ok) fail(`Microsoft request failed (${response.status})`);
    if (response.status === 204) return null;
    try { return await response.json(); } catch { fail('Invalid Microsoft response'); }
  }

  return {
    async appId() { return (await loadCredential()).appId; },

    /** Proactive card in a channel: one new conversation (thread) per signup. */
    async postCard({ serviceUrl, channelId, tenantId, card }) {
      if (typeof channelId !== 'string' || !/^19:[a-zA-Z0-9_-]+@thread\.[a-z0-9]+$/.test(channelId)) fail('Invalid channel');
      const result = await request(BOT_SCOPE, `${serviceUrlOf(serviceUrl)}v3/conversations`, { method: 'POST', body: {
        isGroup: true, tenantId, channelData: { channel: { id: channelId } },
        activity: { type: 'message', attachments: [cardAttachment(card)] },
      } });
      if (!object(result) || typeof result.id !== 'string' || !result.id || typeof result.activityId !== 'string' || !result.activityId) fail('Invalid conversation response');
      return { conversationId: result.id, activityId: result.activityId };
    },

    /** Replace the posted card in place so every reader sees the decision. */
    async updateCard({ serviceUrl, conversationId, activityId, card }) {
      const path = `${serviceUrlOf(serviceUrl)}v3/conversations/${encodeURIComponent(conversationId)}/activities/${encodeURIComponent(activityId)}`;
      await request(BOT_SCOPE, path, { method: 'PUT', body: { type: 'message', id: activityId, attachments: [cardAttachment(card)] } });
    },

    /** Transitive membership of the approver group, checked live for every click. */
    async isGroupMember(groupId, userObjectId) {
      if (!GUID.test(groupId ?? '') || !GUID.test(userObjectId ?? '')) return false;
      const url = `https://graph.microsoft.com/v1.0/groups/${groupId}/transitiveMembers/microsoft.graph.user`
        + `?$filter=id%20eq%20'${userObjectId}'&$count=true&$select=id`;
      const result = await request(GRAPH_SCOPE, url, { headers: { ConsistencyLevel: 'eventual' } });
      return object(result) && Array.isArray(result.value) && result.value.length === 1
        && result.value[0]?.id?.toLowerCase() === userObjectId.toLowerCase();
    },
  };
}
