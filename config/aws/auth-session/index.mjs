import { createHash, randomBytes as cryptoRandomBytes } from 'node:crypto';
import {
  approvedParticipant, createIdentityVerifier, environmentConfig, normaliseConfig,
} from './identity.mjs';
import { createStore, sessionKey } from './store.mjs';
import { readApprovedSession, validSessionToken } from './session.mjs';
import {
  OPDA_ORIGIN, approvedWorkspaceGroups, createWorkspaceRuntime, renderWorkspacePage,
  validateGroupId, validateAccessResult, workspaceCsp,
} from './workspace.mjs';

const CALLBACK_PATH = '/_auth/callback';
const LOGIN_PATH = '/_auth/login';
const LOGOUT_PATH = '/_auth/logout';
const ME_PATH = '/_auth/me';
const WORKSPACE_PATH = '/_auth/workspace';
const WORKSPACE_CONTINUE_PATH = '/_auth/workspace/continue';
const KNOWN_PATHS = new Set([CALLBACK_PATH, LOGIN_PATH, LOGOUT_PATH, ME_PATH, WORKSPACE_PATH, WORKSPACE_CONTINUE_PATH]);
const COOKIE = Object.freeze({
  session: '__Host-opda_session',
  accessToken: '__Host-opda_at', // Clear legacy Auth0 cookies during migration.
  idToken: '__Host-opda_id',
});
const TRANSIENT_PREFIX = '__Host-opda_oauth_';
const NO_STORE_HEADERS = Object.freeze({
  'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, noarchive',
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
function seeOther(location) {
  return response(303, '', { location });
}
function secureCookie(name, value, maxAge) {
  return name + '=' + value + '; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=' + maxAge;
}
const expiredCookie = (name) => secureCookie(name, '', 0);
const clearAllCookies = () => Object.values(COOKIE).map(expiredCookie);
const clearLegacyCookies = () => [COOKIE.idToken, COOKIE.accessToken].map(expiredCookie);

function transientCookieName(state) {
  return TRANSIENT_PREFIX + state;
}

function transientCookie(state, verifier, nonce, returnPath, createdAt) {
  return secureCookie(transientCookieName(state), base64url(JSON.stringify({
    verifier, nonce, createdAt, returnPath: safeReturnPath(returnPath),
  })), 300);
}

function readTransientCookie(cookies, state, nowSeconds) {
  if (!validSessionToken(state)) return null;
  const value = cookies[transientCookieName(state)];
  if (typeof value !== 'string' || value.length < 1 || value.length > 4096) return null;
  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)
      || Object.keys(decoded).sort().join(',') !== 'createdAt,nonce,returnPath,verifier'
      || !validSessionToken(decoded.verifier) || !validSessionToken(decoded.nonce)
      || !Number.isSafeInteger(decoded.createdAt) || decoded.createdAt > nowSeconds || nowSeconds - decoded.createdAt > 300
      || typeof decoded.returnPath !== 'string' || decoded.returnPath.length < 1 || decoded.returnPath.length > 2048
      || safeReturnPath(decoded.returnPath) !== decoded.returnPath) return null;
    return decoded;
  } catch { return null; }
}

function clearTransientCookie(state) {
  return validSessionToken(state) ? [expiredCookie(transientCookieName(state))] : [];
}

function transientCookiePairs(event) {
  const values = Array.isArray(event?.cookies)
    ? event.cookies : [event?.headers?.cookie ?? event?.headers?.Cookie ?? ''];
  const found = [];
  for (const value of values) for (const pair of String(value).split(';')) {
    const separator = pair.indexOf('=');
    if (separator > 0) {
      const name = pair.slice(0, separator).trim();
      if (name.startsWith(TRANSIENT_PREFIX)) found.push([name, pair.slice(separator + 1).trim()]);
    }
  }
  return found;
}

function pendingTransientStats(event) {
  const pairs = transientCookiePairs(event);
  return { count: pairs.length, bytes: pairs.reduce((total, [name, value]) => total + Buffer.byteLength(`${name}=${value}`), 0) };
}

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

function singleCookie(event, name) {
  const values = Array.isArray(event?.cookies)
    ? event.cookies : [event?.headers?.cookie ?? event?.headers?.Cookie ?? ''];
  const found = [];
  for (const value of values) for (const pair of String(value).split(';')) {
    const separator = pair.indexOf('=');
    if (separator > 0 && pair.slice(0, separator).trim() === name) found.push(pair.slice(separator + 1).trim());
  }
  return found.length === 1 ? found[0] : null;
}

function header(event, name) {
  const value = event?.headers?.[name] ?? event?.headers?.[name.toLowerCase()] ?? event?.headers?.[name.toUpperCase()];
  return Array.isArray(value) ? value.length === 1 ? String(value[0]) : null : value === undefined ? undefined : String(value);
}

function htmlResponse(statusCode, body, nonce) {
  return response(statusCode, body, {
    'content-type': 'text/html; charset=utf-8',
    'content-security-policy': workspaceCsp(nonce),
  });
}

function workspaceBody(event) {
  if (event?.isBase64Encoded === true) {
    const raw = Buffer.from(String(event.body ?? ''), 'base64');
    if (raw.length > 4096) throw new TypeError('Workspace request is too large');
    return raw.toString('utf8');
  }
  const body = String(event?.body ?? '');
  if (Buffer.byteLength(body) > 4096) throw new TypeError('Workspace request is too large');
  return body;
}

function parseWorkspaceBody(event) {
  if (header(event, 'content-type')?.split(';', 1)[0].trim() !== 'application/x-www-form-urlencoded') throw new TypeError('Workspace form required');
  const params = new URLSearchParams(workspaceBody(event)), entries = [...params.entries()];
  if (entries.length !== 2 || new Set(entries.map(([key]) => key)).size !== 2 || entries.some(([key]) => !['group', 'phase'].includes(key))) {
    throw new TypeError('Invalid workspace form');
  }
  const values = Object.fromEntries(entries);
  validateGroupId(values.group);
  if (!['open', 'return'].includes(values.phase)) throw new TypeError('Invalid workspace phase');
  return values;
}

export function createHandler(overrides = {}) {
  const fetchImpl = overrides.fetch ?? globalThis.fetch;
  const now = overrides.now ?? (() => Date.now());
  const randomBytes = overrides.randomBytes ?? cryptoRandomBytes;
  let config, store, verifyIdToken, workspaceRuntime;
  function initialise() {
    config ??= normaliseConfig(overrides.config ?? environmentConfig());
    store ??= overrides.store ?? createStore(config);
    verifyIdToken ??= createIdentityVerifier(config, { fetch: fetchImpl, now });
    workspaceRuntime ??= overrides.workspaceRuntime ?? createWorkspaceRuntime({ invoke: overrides.workspaceInvoke });
  }

  function startLogin(event, returnValue) {
    const verifier = base64url(randomBytes(32));
    const state = base64url(randomBytes(32));
    const nonce = base64url(randomBytes(32));
    const nextCookie = transientCookie(state, verifier, nonce, returnValue, Math.floor(now() / 1000));
    const pending = pendingTransientStats(event);
    if (pending.count >= 6 || pending.bytes + Buffer.byteLength(nextCookie) > 6000) {
      return json(429, { error: 'Too many sign-in attempts. Complete one before starting another.' });
    }
    const authorize = new URL(config.providerOrigin + (config.provider === 'auth0' ? '/authorize' : '/oauth2/authorize'));
    authorize.search = new URLSearchParams({
      response_type: 'code', client_id: config.clientId,
      redirect_uri: config.siteOrigin + CALLBACK_PATH, scope: 'openid email profile', state, nonce,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256',
    }).toString();
    return redirect(authorize.toString(), [nextCookie]);
  }

  async function callback(event, query) {
    const cookies = parseCookies(event);
    const state = query.state;
    const stateName = validSessionToken(state) ? transientCookieName(state) : null;
    const stateValues = stateName ? transientCookiePairs(event).filter(([name]) => name === stateName) : [];
    const transaction = stateValues.length === 1 ? readTransientCookie(cookies, state, Math.floor(now() / 1000)) : null;
    if (typeof query.code !== 'string' || query.code.length < 1 || query.code.length > 4096 || !transaction) {
      return json(400, { error: 'The sign-in transaction is invalid or has expired.' }, clearTransientCookie(state));
    }
    const { verifier, nonce, returnPath: storedReturn } = transaction;
    const tokenResult = await fetchImpl(config.providerOrigin + (config.provider === 'auth0' ? '/oauth/token' : '/oauth2/token'), {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', client_id: config.clientId,
        redirect_uri: config.siteOrigin + CALLBACK_PATH, code: query.code, code_verifier: verifier,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!tokenResult.ok) return json(401, { error: 'Sign-in could not be completed.' }, clearTransientCookie(state));
    // Discard access/refresh tokens. Only the verified ID-token claims cross this boundary.
    const tokens = await tokenResult.json();
    const identity = await verifyIdToken(tokens?.id_token, nonce);
    if (!identity) return json(401, { error: 'This account is not authorised.' }, clearTransientCookie(state));
    const resolved = config.provider === 'auth0' ? await store.resolveParticipant(identity)
      : { participant: await store.getParticipant(identity.sub) };
    const { participant, binding } = resolved ?? {};
    const canonicalIdentity = { ...identity, sub: participant?.cognitoSub };
    const current = Math.floor(now() / 1000);
    if (identity.exp <= current || !approvedParticipant(participant, canonicalIdentity, current)) {
      return json(401, { error: 'This account is not authorised.' }, clearTransientCookie(state));
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
        return json(401, { error: 'This account is not authorised. Please sign in again.' }, clearTransientCookie(state));
      }
      throw error;
    }
    let returnPath = '/';
    try { returnPath = safeReturnPath(storedReturn); } catch { /* root */ }
    return redirect(config.siteOrigin + returnPath, [
      secureCookie(COOKIE.session, token, expiresAt - current), ...clearTransientCookie(state), ...clearLegacyCookies(),
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

  async function currentWorkspaceSession(event) {
    const token = singleCookie(event, COOKIE.session);
    if (!validSessionToken(token)) return null;
    return { token, approved: await readApprovedSession(token, store, now) };
  }

  function workspacePage(groups, mode, selectedGroup) {
    const nonce = base64url(randomBytes(16));
    return htmlResponse(200, renderWorkspacePage({ groups, mode, selectedGroup, nonce }), nonce);
  }

  async function workspaceGet(event, continuePage) {
    const rawQuery = event.rawQueryString ?? new URLSearchParams(event.queryStringParameters ?? {}).toString();
    const route = String(event.rawPath) + (rawQuery ? '?' + rawQuery : '');
    const current = await currentWorkspaceSession(event);
    if (!current?.approved) return startLogin(event, route);
    const groups = approvedWorkspaceGroups(current.approved.participant);
    const requested = continuePage ? undefined : event.queryStringParameters?.group;
    if (requested !== undefined) {
      try { validateGroupId(requested); } catch { return htmlResponse(400, '<!doctype html><title>Invalid working group</title><p>That working-group link is invalid.</p>', base64url(randomBytes(16))); }
      if (!groups.includes(requested)) return htmlResponse(403, '<!doctype html><title>Access unavailable</title><p>This working-group access is no longer available.</p>', base64url(randomBytes(16)));
      return workspacePage([requested], continuePage ? 'return' : 'initial', requested);
    }
    return workspacePage(groups, continuePage ? 'return' : 'initial');
  }

  async function workspacePost(event) {
    if (header(event, 'origin') !== OPDA_ORIGIN || ![undefined, 'same-origin'].includes(header(event, 'sec-fetch-site'))) {
      return json(403, { error: 'Workspace request not allowed.' });
    }
    let form;
    try { form = parseWorkspaceBody(event); } catch { return json(400, { error: 'Invalid workspace form.' }); }
    const { group, phase } = form;
    const current = await currentWorkspaceSession(event);
    if (!current?.approved || !approvedWorkspaceGroups(current.approved.participant).includes(group)) return json(403, { error: 'Workspace access is unavailable.' });
    const initialParticipant = current.approved.participant;
    const initialIdentity = {
      participantId: initialParticipant.participantId,
      cognitoSub: initialParticipant.cognitoSub,
      accessVersion: initialParticipant.accessVersion,
    };
    const result = await workspaceRuntime({ sessionToken: current.token, groupId: group, phase });
    const checked = validateAccessResult(result, group);
    const latest = await currentWorkspaceSession(event);
    const latestParticipant = latest?.approved?.participant;
    const unchanged = latest?.token === current.token && latestParticipant
      && latestParticipant.participantId === initialIdentity.participantId
      && latestParticipant.cognitoSub === initialIdentity.cognitoSub
      && latestParticipant.accessVersion === initialIdentity.accessVersion
      && approvedWorkspaceGroups(latestParticipant).includes(group);
    if (!unchanged) return json(403, { error: 'Workspace access is unavailable.' });
    if (checked.status === 'ready' || checked.status === 'redeem') return seeOther(checked.location);
    const status = checked.status === 'denied' ? 403 : checked.status === 'unavailable' ? 503 : 409;
    const nonce = base64url(randomBytes(16));
    const message = checked.status === 'pending' ? 'Access is still being prepared. Try again shortly.'
      : checked.status === 'review' ? 'Access needs a staff review before it can be opened.'
        : checked.status === 'denied' ? 'This working-group access is no longer available.' : 'Workspace access is temporarily unavailable.';
    return htmlResponse(status, renderWorkspacePage({ groups: [group], mode: 'retry', phase, selectedGroup: checked.status === 'denied' ? undefined : group, message, nonce }), nonce);
  }

  return async function authSessionHandler(event) {
    const path = String(event?.rawPath ?? '');
    const method = String(event?.requestContext?.http?.method ?? '').toUpperCase();
    if (!KNOWN_PATHS.has(path)) return json(404, { error: 'Not found.' });
    if ((path === WORKSPACE_PATH || path === WORKSPACE_CONTINUE_PATH) ? !['GET', 'POST'].includes(method) : method !== 'GET') return json(405, { error: 'Use GET for this operation.' });
    try {
      initialise();
      if (path === LOGIN_PATH) return startLogin(event, event?.queryStringParameters?.return);
      if (path === CALLBACK_PATH) return await callback(event, event?.queryStringParameters ?? {});
      if (path === ME_PATH) return await session(event);
      if (path === WORKSPACE_PATH) return method === 'GET' ? await workspaceGet(event, false) : await workspacePost(event);
      if (path === WORKSPACE_CONTINUE_PATH) return method === 'GET' ? await workspaceGet(event, true) : json(405, { error: 'Use GET for this operation.' });
      return await logout(event);
    } catch {
      if (path === WORKSPACE_PATH || path === WORKSPACE_CONTINUE_PATH) return json(503, { error: 'Workspace access is temporarily unavailable.' });
      const cookies = path === CALLBACK_PATH ? clearTransientCookie(event?.queryStringParameters?.state) : clearAllCookies();
      return json(503, { authenticated: false, error: 'Sign-in is temporarily unavailable.' }, cookies);
    }
  };
}

export const handler = createHandler();
