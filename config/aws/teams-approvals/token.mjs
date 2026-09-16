import { createPublicKey, verify } from 'node:crypto';

/**
 * Bot Framework channel-to-bot authentication (ADR-0088). Every request to the
 * messaging endpoint carries a JWT the Bot Connector minted for this bot: the
 * audience is the bot's app id, the issuer is the connector (or, for a single-
 * tenant bot, the OPDA tenant), and the signing key is published at a fixed
 * well-known URL. Nothing about a request is trusted before this passes.
 * https://learn.microsoft.com/azure/bot-service/rest-api/bot-framework-rest-connector-authentication
 */
const BOT_FRAMEWORK_ISSUER = 'https://api.botframework.com';
const BOT_FRAMEWORK_KEYS = 'https://login.botframework.com/v1/.well-known/keys';
const CLOCK_SKEW_MS = 300000;
const KEYS_TTL_MS = 24 * 60 * 60 * 1000;
// The Bot Framework document listed 219 keys on 2026-09-16; the cap only bounds a hostile response.
const MAX_KEYS = 2000;
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export class Unauthorized extends Error {
  constructor() { super('Unauthorized'); }
}
const reject = () => { throw new Unauthorized(); };

export function trustedIssuers(tenantId) {
  if (!GUID.test(tenantId ?? '')) throw new TypeError('Invalid tenant configuration');
  const tenantKeys = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
  return new Map([
    [BOT_FRAMEWORK_ISSUER, BOT_FRAMEWORK_KEYS],
    [`https://sts.windows.net/${tenantId}/`, tenantKeys],
    [`https://login.microsoftonline.com/${tenantId}/v2.0`, tenantKeys],
  ]);
}

function decodeSegment(segment) {
  if (typeof segment !== 'string' || !/^[A-Za-z0-9_-]+$/.test(segment)) reject();
  const raw = Buffer.from(segment, 'base64url');
  if (raw.toString('base64url') !== segment) reject();
  return raw;
}
function decodeJson(segment) {
  let value;
  try { value = JSON.parse(decodeSegment(segment).toString('utf8')); } catch { reject(); }
  if (!object(value)) reject();
  return value;
}

/** Service URLs compare without a trailing slash, as the Bot Framework SDKs do. */
export const normalizeServiceUrl = value => typeof value === 'string' ? value.replace(/\/+$/, '').toLowerCase() : '';

export function createTokenValidator({ botAppId, tenantId, fetch = globalThis.fetch, now = Date.now }) {
  if (!GUID.test(botAppId ?? '')) throw new TypeError('Invalid bot configuration');
  const issuers = trustedIssuers(tenantId);
  const cache = new Map();

  async function keys(url, refresh = false) {
    const cached = cache.get(url);
    if (cached && !refresh && now() - cached.at < KEYS_TTL_MS) return cached.keys;
    let body;
    try {
      const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('keys');
      body = await response.json();
    } catch { throw new Error('Signing keys unavailable'); }
    if (!object(body) || !Array.isArray(body.keys) || body.keys.length > MAX_KEYS) throw new Error('Signing keys unavailable');
    cache.set(url, { at: now(), keys: body.keys });
    return body.keys;
  }

  async function signingKey(url, kid, channelId) {
    for (const refresh of [false, true]) {
      const jwk = (await keys(url, refresh)).find(key => object(key) && key.kid === kid && key.kty === 'RSA');
      if (!jwk) continue;
      // Bot Framework keys are endorsed per channel; a Teams request must carry a Teams-endorsed key.
      if (Array.isArray(jwk.endorsements) && !jwk.endorsements.includes(channelId)) reject();
      try { return createPublicKey({ key: { kty: 'RSA', n: jwk.n, e: jwk.e }, format: 'jwk' }); } catch { reject(); }
    }
    reject();
  }

  return async function validate(authorization, activity) {
    const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(authorization ?? '');
    if (!match || match[1].length > 8192) reject();
    const [headerSegment, payloadSegment, signatureSegment] = match[1].split('.');
    const header = decodeJson(headerSegment), claims = decodeJson(payloadSegment);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid || header.kid.length > 256) reject();
    const jwks = issuers.get(claims.iss);
    if (!jwks || claims.aud !== botAppId) reject();
    const at = now();
    if (!Number.isSafeInteger(claims.exp) || claims.exp * 1000 + CLOCK_SKEW_MS < at) reject();
    if (claims.nbf !== undefined && (!Number.isSafeInteger(claims.nbf) || claims.nbf * 1000 - CLOCK_SKEW_MS > at)) reject();
    // The connector binds the token to the service URL it will accept replies on.
    if (claims.serviceurl !== undefined
      && normalizeServiceUrl(claims.serviceurl) !== normalizeServiceUrl(activity?.serviceUrl)) reject();
    const key = await signingKey(jwks, header.kid, activity?.channelId);
    const valid = verify('sha256', Buffer.from(`${headerSegment}.${payloadSegment}`, 'utf8'), key, decodeSegment(signatureSegment));
    if (!valid) reject();
    return { issuer: claims.iss, appId: claims.aud, serviceUrl: claims.serviceurl ?? null };
  };
}
