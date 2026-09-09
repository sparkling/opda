import { createHash, randomBytes as cryptoRandomBytes } from 'node:crypto';
import {
  approvedParticipant, constantTimeEqual, createIdentityVerifier, environmentConfig, normaliseConfig,
} from './identity.mjs';
import { createStore, sessionKey } from './store.mjs';
import { readApprovedSession, validSessionToken } from './session.mjs';

const CALLBACK_PATH = '/_auth/callback';
const LOGIN_PATH = '/_auth/login';
const LOGOUT_PATH = '/_auth/logout';
const ME_PATH = '/_auth/me';
const KNOWN_PATHS = new Set([CALLBACK_PATH, LOGIN_PATH, LOGOUT_PATH, ME_PATH]);
const COOKIE = Object.freeze({
  session: '__Host-opda_session',
  accessToken: '__Host-opda_at', // Clear legacy Auth0 cookies during migration.
  idToken: '__Host-opda_id',
  nonce: '__Host-opda_nonce',
  returnPath: '__Host-opda_return',
  state: '__Host-opda_oauth_state',
  verifier: '__Host-opda_verifier',
});
const NO_STORE_HEADERS = Object.freeze({
  'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff',
});
const base64url = (value) => Buffer.from(value).toString('base64url');

export function safeReturnPath(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 2048) return '/';
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f\u007f]/u.test(value)) return '/';
  return value;
}

function response(statusCode, body, headers = {}, cookies = []) {
  return { statusCode, headers: { ...NO_STORE_HEADERS, ...headers }, body, cookies };
}
function json(statusCode, body, cookies = []) {
  return response(statusCode, JSON.stringify(body), { 'content-type': 'application/json; charset=utf-8' }, cookies);
}
function redirect(location, cookies = []) {
  return response(302, '', { location }, cookies);
}
function secureCookie(name, value, maxAge) {
  return name + '=' + value + '; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=' + maxAge;
}
const expiredCookie = (name) => secureCookie(name, '', 0);
const clearAllCookies = () => Object.values(COOKIE).map(expiredCookie);
const clearTransientCookies = () => [COOKIE.verifier, COOKIE.state, COOKIE.nonce, COOKIE.returnPath].map(expiredCookie);
const clearLegacyCookies = () => [COOKIE.idToken, COOKIE.accessToken].map(expiredCookie);

function parseCookies(event) {
  const values = Array.isArray(event?.cookies)
    ? event.cookies : [event?.headers?.cookie ?? event?.headers?.Cookie ?? ''];
  const cookies = Object.create(null);
  for (const value of values) {
    for (const pair of String(value).split(';')) {
      const separator = pair.indexOf('=');
      if (separator < 1) continue;
      const name = pair.slice(0, separator).trim();
      if (!(name in cookies)) cookies[name] = pair.slice(separator + 1).trim();
    }
  }
  return cookies;
}

export function createHandler(overrides = {}) {
  const fetchImpl = overrides.fetch ?? globalThis.fetch;
  const now = overrides.now ?? (() => Date.now());
  const randomBytes = overrides.randomBytes ?? cryptoRandomBytes;
  let config, store, verifyIdToken;
  function initialise() {
    config ??= normaliseConfig(overrides.config ?? environmentConfig());
    store ??= overrides.store ?? createStore(config);
    verifyIdToken ??= createIdentityVerifier(config, { fetch: fetchImpl, now });
  }

  function startLogin(returnValue) {
    const verifier = base64url(randomBytes(32));
    const state = base64url(randomBytes(32));
    const nonce = base64url(randomBytes(32));
    const authorize = new URL(config.providerOrigin + (config.provider === 'auth0' ? '/authorize' : '/oauth2/authorize'));
    authorize.search = new URLSearchParams({
      response_type: 'code', client_id: config.clientId,
      redirect_uri: config.siteOrigin + CALLBACK_PATH, scope: 'openid email profile', state, nonce,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256',
    }).toString();
    return redirect(authorize.toString(), [
      secureCookie(COOKIE.verifier, verifier, 300), secureCookie(COOKIE.state, state, 300),
      secureCookie(COOKIE.nonce, nonce, 300),
      secureCookie(COOKIE.returnPath, base64url(safeReturnPath(returnValue)), 300),
    ]);
  }

  async function callback(event, query) {
    const cookies = parseCookies(event);
    const verifier = cookies[COOKIE.verifier], nonce = cookies[COOKIE.nonce];
    const storedReturn = cookies[COOKIE.returnPath];
    if (typeof query.code !== 'string' || query.code.length < 1 || query.code.length > 4096
      || !validSessionToken(verifier) || !validSessionToken(nonce)
      || typeof storedReturn !== 'string' || storedReturn.length > 4096
      || !validSessionToken(query.state) || !constantTimeEqual(query.state, cookies[COOKIE.state])) {
      return json(400, { error: 'The sign-in transaction is invalid or has expired.' }, clearAllCookies());
    }
    const tokenResult = await fetchImpl(config.providerOrigin + (config.provider === 'auth0' ? '/oauth/token' : '/oauth2/token'), {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', client_id: config.clientId,
        redirect_uri: config.siteOrigin + CALLBACK_PATH, code: query.code, code_verifier: verifier,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!tokenResult.ok) return json(401, { error: 'Sign-in could not be completed.' }, clearAllCookies());
    // Discard access/refresh tokens. Only the verified ID-token claims cross this boundary.
    const tokens = await tokenResult.json();
    const identity = await verifyIdToken(tokens?.id_token, nonce);
    if (!identity) return json(401, { error: 'This account is not authorised.' }, clearAllCookies());
    const resolved = config.provider === 'auth0' ? await store.resolveParticipant(identity)
      : { participant: await store.getParticipant(identity.sub) };
    const { participant, binding } = resolved ?? {};
    const canonicalIdentity = { ...identity, sub: participant?.cognitoSub };
    const current = Math.floor(now() / 1000);
    if (identity.exp <= current || !approvedParticipant(participant, canonicalIdentity, current)) {
      return json(401, { error: 'This account is not authorised.' }, clearAllCookies());
    }
    const token = base64url(randomBytes(32));
    const expiresAt = Math.min(current + 3600, identity.exp, participant.expiresAt ?? Infinity);
    const session = {
      pk: sessionKey(token), sub: canonicalIdentity.sub, email: identity.email,
      participantId: participant.participantId, accessVersion: participant.accessVersion,
      createdAt: current, expiresAt,
      ...(binding ? { auth0BindingKey: binding.record.pk } : {}),
    };
    try {
      // Approval and version are checked again atomically with session persistence.
      await store.issueSession({ participant, session, now: current, identity, binding });
    } catch (error) {
      if (error?.name === 'TransactionCanceledException' || error?.name === 'ConditionalCheckFailedException') {
        return json(401, { error: 'This account is not authorised. Please sign in again.' }, clearAllCookies());
      }
      throw error;
    }
    let returnPath = '/';
    try { returnPath = safeReturnPath(Buffer.from(storedReturn, 'base64url').toString('utf8')); } catch { /* root */ }
    return redirect(config.siteOrigin + returnPath, [
      secureCookie(COOKIE.session, token, expiresAt - current), ...clearTransientCookies(), ...clearLegacyCookies(),
    ]);
  }

  async function session(event) {
    const token = parseCookies(event)[COOKIE.session];
    const denied = () => json(401, { authenticated: false }, clearAllCookies());
    const approved = await readApprovedSession(token, store, now);
    if (!approved) return denied();
    const { session: saved, participant } = approved;
    return json(200, {
      email: saved.email, name: typeof participant.name === 'string' ? participant.name : null,
      picture: null, authenticated: true, participantId: participant.participantId,
    }, clearLegacyCookies());
  }

  async function logout(event) {
    const token = parseCookies(event)[COOKIE.session];
    if (validSessionToken(token)) await store.deleteSession(sessionKey(token));
    const target = new URL(config.providerOrigin + (config.provider === 'auth0' ? '/v2/logout' : '/logout'));
    target.search = new URLSearchParams({
      client_id: config.clientId, [config.provider === 'auth0' ? 'returnTo' : 'logout_uri']: config.siteOrigin + '/',
    }).toString();
    return redirect(target.toString(), clearAllCookies());
  }

  return async function authSessionHandler(event) {
    const path = String(event?.rawPath ?? '');
    const method = String(event?.requestContext?.http?.method ?? '').toUpperCase();
    if (!KNOWN_PATHS.has(path)) return json(404, { error: 'Not found.' });
    if (method !== 'GET') return json(405, { error: 'Use GET for this operation.' });
    try {
      initialise();
      if (path === LOGIN_PATH) return startLogin(event?.queryStringParameters?.return);
      if (path === CALLBACK_PATH) return await callback(event, event?.queryStringParameters ?? {});
      if (path === ME_PATH) return await session(event);
      return await logout(event);
    } catch {
      return json(503, { authenticated: false, error: 'Sign-in is temporarily unavailable.' }, clearAllCookies());
    }
  };
}

export const handler = createHandler();
