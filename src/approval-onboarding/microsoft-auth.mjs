import { X509Certificate, createPrivateKey, createHash, randomUUID, sign } from 'node:crypto';
import { OPDA_TENANT_ID } from './invitation.mjs';

export const MICROSOFT_CLIENT_ID = 'bef80d52-9f29-4e01-89a8-8a301fd06734';
export const GRAPH_ORIGIN = 'https://graph.microsoft.com';
export const SHAREPOINT_ORIGIN = 'https://openpropertydataassociation.sharepoint.com';
const GUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const GRAPH_ROLES = ['GroupMember.ReadWrite.All', 'Team.ReadBasic.All', 'TeamMember.Read.All', 'User.Invite.All', 'User.Read.All'];
const safeError = (message, status) => Object.assign(new Error(message), status ? { status } : {});

/** Certificate-only credentials. Tokens and provider response bodies never escape in errors. */
export function createMicrosoftClient({ getSecret, siteUrls, fetchImpl = fetch, now = Date.now,
  clientId = MICROSOFT_CLIENT_ID, tenantId = OPDA_TENANT_ID, timeoutMs = 15000 } = {}) {
  if (typeof getSecret !== 'function' || !GUID.test(clientId) || tenantId !== OPDA_TENANT_ID
    || !Array.isArray(siteUrls) || siteUrls.length !== 6 || new Set(siteUrls).size !== 6
    || siteUrls.some(url => !/^https:\/\/openpropertydataassociation\.sharepoint\.com\/sites\/[A-Za-z]+SourceIntake$/.test(url)
      || url.endsWith('/TechnologySourceIntake')) || !Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30000) {
    throw new TypeError('Invalid Microsoft service configuration');
  }
  const sites = new Set(siteUrls);
  const tokens = new Map();
  const endpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  async function token(resource) {
    const cached = tokens.get(resource);
    if (cached && cached.until > now()) return cached.value;
    let secret, certificate, key;
    try {
      secret = await getSecret();
      if (secret?.schemaVersion !== 1 || secret.tenantId !== tenantId || secret.clientId !== clientId) throw Error();
      certificate = new X509Certificate(secret.certificatePem);
      key = createPrivateKey(secret.privateKeyPem);
      const thumbprint = createHash('sha1').update(certificate.raw).digest('hex');
      if (thumbprint !== secret.certificateThumbprintSha1 || !certificate.checkPrivateKey(key)
        || new Date(certificate.validTo).getTime() <= now() + 60000 || new Date(certificate.validFrom).getTime() > now()
        || new Date(secret.expiresAt).getTime() !== new Date(certificate.validTo).getTime()) throw Error();
    } catch { throw safeError('Microsoft service credential unavailable or mismatched'); }
    const timestamp = Math.floor(now() / 1000);
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const unsigned = encode({ alg: 'RS256', typ: 'JWT', x5t: Buffer.from(secret.certificateThumbprintSha1, 'hex').toString('base64url') })
      + '.' + encode({ aud: endpoint, iss: clientId, sub: clientId, jti: randomUUID(), iat: timestamp, nbf: timestamp - 30, exp: timestamp + 300 });
    const assertion = unsigned + '.' + sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url');
    let response, data;
    try {
      response = await fetchImpl(endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(timeoutMs),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, scope: resource + '/.default',
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer', client_assertion: assertion }) });
      data = await response.json();
      if (!response.ok || typeof data.access_token !== 'string' || !Number.isFinite(data.expires_in) || data.expires_in < 120) throw Error();
      const claims = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64url'));
      const roles = resource === GRAPH_ORIGIN ? GRAPH_ROLES : ['Sites.Selected'];
      const audiences = resource === GRAPH_ORIGIN ? [GRAPH_ORIGIN, '00000003-0000-0000-c000-000000000000']
        : [SHAREPOINT_ORIGIN, '00000003-0000-0ff1-ce00-000000000000'];
      // This is a configuration readback, not independent token signature verification.
      if (claims.tid !== tenantId || (claims.appid ?? claims.azp) !== clientId || !audiences.includes(claims.aud)
        || JSON.stringify([...(claims.roles ?? [])].sort()) !== JSON.stringify([...roles].sort())) throw Error();
    } catch { throw safeError('Microsoft certificate authentication failed', response?.status); }
    const until = Math.min(now() + Math.min(data.expires_in - 60, 300) * 1000, new Date(certificate.validTo).getTime() - 60000);
    tokens.set(resource, { value: data.access_token, until });
    return data.access_token;
  }
  async function request(resource, url, { method = 'GET', body, headers = {}, allowNotFound = false } = {}) {
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(method) || Object.keys(headers).some(k => !['If-Match', 'X-HTTP-Method'].includes(k))) {
      throw new TypeError('Invalid Microsoft request options');
    }
    const accessToken = await token(resource);
    let response;
    try {
      response = await fetchImpl(url, { method, redirect: 'error', signal: AbortSignal.timeout(timeoutMs),
        headers: { Authorization: `Bearer ${accessToken}`, Accept: resource === SHAREPOINT_ORIGIN ? 'application/json;odata=nometadata' : 'application/json',
          ...(body !== undefined ? { 'Content-Type': resource === SHAREPOINT_ORIGIN ? 'application/json;odata=nometadata' : 'application/json' } : {}), ...headers },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    } catch { throw safeError('Microsoft request outcome unavailable'); }
    if (allowNotFound && response.status === 404) return null;
    if (!response.ok) {
      if ([401, 403].includes(response.status)) tokens.delete(resource);
      throw safeError('Microsoft request failed', response.status);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { throw safeError('Microsoft response unavailable'); }
  }
  return {
    graph(route, options) {
      if (typeof route !== 'string' || !/^\/(?:users|invitations|groups|teams)(?:[/?]|$)/.test(route)
        || /[\r\n\\#]/.test(route) || /(?:^|\/)\.\.?(?:\/|$)/.test(decodeURIComponent(route.split('?')[0]))) {
        throw new TypeError('Invalid Microsoft Graph route');
      }
      return request(GRAPH_ORIGIN, GRAPH_ORIGIN + '/v1.0' + route, options);
    },
    sharepoint(siteUrl, route, options) {
      if (!sites.has(siteUrl) || typeof route !== 'string' || !route.startsWith('/_api/') || /[\r\n\\#]/.test(route)
        || /(?:^|\/)\.\.?(?:\/|$)/.test(decodeURIComponent(route.split('?')[0]))) throw new TypeError('Invalid selected-site route');
      return request(SHAREPOINT_ORIGIN, siteUrl + route, options);
    },
  };
}
