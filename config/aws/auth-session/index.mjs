import {
  createHash,
  createPublicKey,
  randomBytes as cryptoRandomBytes,
  timingSafeEqual,
  verify as cryptoVerify,
} from 'node:crypto';

const CALLBACK_PATH = '/_auth/callback';
const LOGIN_PATH = '/_auth/login';
const LOGOUT_PATH = '/_auth/logout';
const ME_PATH = '/_auth/me';
const KNOWN_PATHS = new Set([CALLBACK_PATH, LOGIN_PATH, LOGOUT_PATH, ME_PATH]);

const COOKIE = Object.freeze({
  accessToken: '__Host-opda_at',
  idToken: '__Host-opda_id',
  nonce: '__Host-opda_nonce',
  returnPath: '__Host-opda_return',
  state: '__Host-opda_oauth_state',
  verifier: '__Host-opda_verifier',
});

const JSON_HEADERS = Object.freeze({
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
});
const NO_STORE_HEADERS = Object.freeze({
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
});

const base64url = (value) => Buffer.from(value).toString('base64url');
const decodeJwtPart = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

export function safeReturnPath(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 2048) return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  if (/[\\\u0000-\u001f\u007f]/u.test(value)) return '/';
  return value;
}

function normaliseConfig(source) {
  const auth0Domain = String(source.auth0Domain ?? '').trim().toLowerCase();
  const clientId = String(source.clientId ?? '').trim();
  const siteOrigin = String(source.siteOrigin ?? '').trim().replace(/\/$/u, '');
  const memberValues = Array.isArray(source.members)
    ? source.members
    : String(source.members ?? '').split(',');
  const members = new Set(memberValues.map((value) => String(value).trim().toLowerCase()).filter(Boolean));

  if (!auth0Domain || auth0Domain.includes('/') || auth0Domain.includes('..')
    || !/^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/u.test(auth0Domain)) {
    throw new Error('Invalid Auth0 domain configuration.');
  }
  if (!clientId || clientId.length > 256 || /\s/u.test(clientId)) {
    throw new Error('Invalid Auth0 client configuration.');
  }
  let parsedOrigin;
  try {
    parsedOrigin = new URL(siteOrigin);
  } catch {
    throw new Error('Invalid site-origin configuration.');
  }
  if (parsedOrigin.protocol !== 'https:' || parsedOrigin.origin !== siteOrigin || parsedOrigin.pathname !== '/') {
    throw new Error('The site origin must be an HTTPS origin without a path.');
  }
  if (members.size === 0 || [...members].some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))) {
    throw new Error('Invalid member allowlist configuration.');
  }
  return { auth0Domain, clientId, members, siteOrigin };
}

function environmentConfig() {
  return {
    auth0Domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    members: process.env.MEMBER_EMAILS,
    siteOrigin: process.env.SITE_ORIGIN,
  };
}

function response(statusCode, body = '', headers = NO_STORE_HEADERS, cookies = []) {
  return { statusCode, headers: { ...headers }, body, cookies };
}

function json(statusCode, body, cookies = []) {
  return response(statusCode, JSON.stringify(body), JSON_HEADERS, cookies);
}

function redirect(location, cookies = []) {
  return response(302, '', { ...NO_STORE_HEADERS, location }, cookies);
}

function secureCookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

function expiredCookie(name) {
  return secureCookie(name, '', 0);
}

function transientCookies(verifier, state, nonce, returnPath) {
  return [
    secureCookie(COOKIE.verifier, verifier, 300),
    secureCookie(COOKIE.state, state, 300),
    secureCookie(COOKIE.nonce, nonce, 300),
    secureCookie(COOKIE.returnPath, base64url(returnPath), 300),
  ];
}

function clearTransientCookies() {
  return [COOKIE.verifier, COOKIE.state, COOKIE.nonce, COOKIE.returnPath].map(expiredCookie);
}

function clearAllCookies() {
  return Object.values(COOKIE).map(expiredCookie);
}

function parseCookies(event) {
  const values = Array.isArray(event?.cookies)
    ? event.cookies
    : [event?.headers?.cookie ?? event?.headers?.Cookie ?? ''];
  const cookies = {};
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

function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function route(event) {
  return {
    method: String(event?.requestContext?.http?.method ?? '').toUpperCase(),
    path: String(event?.rawPath ?? ''),
    query: event?.queryStringParameters ?? {},
  };
}

function tokenAudienceIsValid(payload, clientId) {
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(clientId)) return false;
  return audiences.length < 2 || payload.azp === clientId;
}

export function createHandler(overrides = {}) {
  const fetchImpl = overrides.fetch ?? globalThis.fetch;
  const now = overrides.now ?? (() => Date.now());
  const randomBytes = overrides.randomBytes ?? cryptoRandomBytes;
  let config;
  let jwks;

  function getConfig() {
    config ??= normaliseConfig(overrides.config ?? environmentConfig());
    return config;
  }

  async function loadJwks(force = false) {
    const cfg = getConfig();
    if (!jwks || force) {
      const result = await fetchImpl(`https://${cfg.auth0Domain}/.well-known/jwks.json`, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!result.ok) throw new Error('Unable to load identity-provider keys.');
      const body = await result.json();
      if (!Array.isArray(body?.keys)) throw new Error('Invalid identity-provider key set.');
      jwks = new Map(body.keys.map((key) => [key.kid, key]));
    }
    return jwks;
  }

  async function verifyIdToken(token, expectedNonce = null) {
    const cfg = getConfig();
    const parts = String(token ?? '').split('.');
    if (parts.length !== 3) return null;

    let header;
    let payload;
    try {
      header = decodeJwtPart(parts[0]);
      payload = decodeJwtPart(parts[1]);
    } catch {
      return null;
    }
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') return null;
    if (payload.iss !== `https://${cfg.auth0Domain}/`) return null;
    if (!tokenAudienceIsValid(payload, cfg.clientId)) return null;
    if (expectedNonce !== null && !constantTimeEqual(payload.nonce, expectedNonce)) return null;

    const current = Math.floor(now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp <= current - 60) return null;
    if (typeof payload.iat !== 'number' || payload.iat > current + 60) return null;
    if (typeof payload.nbf === 'number' && payload.nbf > current + 60) return null;
    const email = String(payload.email ?? '').trim().toLowerCase();
    if (!email || payload.email_verified !== true || !cfg.members.has(email)) return null;

    let keys = await loadJwks();
    let key = keys.get(header.kid);
    if (!key) {
      keys = await loadJwks(true);
      key = keys.get(header.kid);
    }
    if (!key) return null;
    try {
      const publicKey = createPublicKey({ key, format: 'jwk' });
      const valid = cryptoVerify(
        'RSA-SHA256',
        Buffer.from(`${parts[0]}.${parts[1]}`),
        publicKey,
        Buffer.from(parts[2], 'base64url'),
      );
      return valid ? { ...payload, email } : null;
    } catch {
      return null;
    }
  }

  function startLogin(returnValue) {
    const cfg = getConfig();
    const verifier = base64url(randomBytes(32));
    const state = base64url(randomBytes(32));
    const nonce = base64url(randomBytes(32));
    const returnPath = safeReturnPath(returnValue);
    const authorize = new URL(`https://${cfg.auth0Domain}/authorize`);
    authorize.search = new URLSearchParams({
      response_type: 'code',
      client_id: cfg.clientId,
      redirect_uri: `${cfg.siteOrigin}${CALLBACK_PATH}`,
      scope: 'openid email profile',
      state,
      nonce,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 'S256',
    }).toString();
    return redirect(authorize.toString(), transientCookies(verifier, state, nonce, returnPath));
  }

  async function callback(event, query) {
    const cfg = getConfig();
    const cookies = parseCookies(event);
    const state = query.state;
    const code = query.code;
    const verifier = cookies[COOKIE.verifier];
    const nonce = cookies[COOKIE.nonce];
    const storedReturn = cookies[COOKIE.returnPath];
    const transactionCookies = clearTransientCookies();
    if (!code || !verifier || !nonce || !storedReturn
      || !constantTimeEqual(state, cookies[COOKIE.state])) {
      return json(400, { error: 'The sign-in transaction is invalid or has expired.' }, transactionCookies);
    }

    let tokenResult;
    try {
      tokenResult = await fetchImpl(`https://${cfg.auth0Domain}/oauth/token`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: cfg.clientId,
          redirect_uri: `${cfg.siteOrigin}${CALLBACK_PATH}`,
          code,
          code_verifier: verifier,
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      return json(502, { error: 'Sign-in is temporarily unavailable.' }, transactionCookies);
    }
    if (!tokenResult.ok) {
      return json(401, { error: 'Sign-in could not be completed.' }, transactionCookies);
    }

    let tokens;
    try {
      tokens = await tokenResult.json();
    } catch {
      return json(502, { error: 'The identity provider returned an invalid response.' }, transactionCookies);
    }
    let identity;
    try {
      identity = await verifyIdToken(tokens.id_token, nonce);
    } catch {
      return json(502, { error: 'Sign-in could not be verified.' }, transactionCookies);
    }
    if (!identity || typeof tokens.access_token !== 'string' || !tokens.access_token) {
      return json(401, { error: 'This account is not authorised.' }, transactionCookies);
    }

    let returnPath = '/';
    try {
      returnPath = safeReturnPath(Buffer.from(storedReturn, 'base64url').toString('utf8'));
    } catch { /* use root */ }
    const maxAge = Math.max(60, Math.min(28_800, identity.exp - Math.floor(now() / 1000)));
    return redirect(`${cfg.siteOrigin}${returnPath}`, [
      secureCookie(COOKIE.idToken, tokens.id_token, maxAge),
      secureCookie(COOKIE.accessToken, tokens.access_token, maxAge),
      ...transactionCookies,
    ]);
  }

  async function session(event) {
    const cookies = parseCookies(event);
    let identity;
    try {
      identity = await verifyIdToken(cookies[COOKIE.idToken]);
    } catch {
      return json(503, { authenticated: false, error: 'Session verification is temporarily unavailable.' });
    }
    if (!identity) {
      return json(401, { authenticated: false }, [
        expiredCookie(COOKIE.idToken),
        expiredCookie(COOKIE.accessToken),
      ]);
    }
    return json(200, {
      email: identity.email,
      name: typeof identity.name === 'string' ? identity.name : null,
      picture: typeof identity.picture === 'string' ? identity.picture : null,
      token: cookies[COOKIE.accessToken] ?? null,
    });
  }

  function logout() {
    const cfg = getConfig();
    const target = new URL(`https://${cfg.auth0Domain}/v2/logout`);
    target.search = new URLSearchParams({
      client_id: cfg.clientId,
      returnTo: `${cfg.siteOrigin}/`,
    }).toString();
    return redirect(target.toString(), clearAllCookies());
  }

  return async function authSessionHandler(event) {
    const request = route(event);
    if (!KNOWN_PATHS.has(request.path)) return json(404, { error: 'Not found.' });
    if (request.method !== 'GET') return json(405, { error: 'Use GET for this operation.' });
    try {
      if (request.path === LOGIN_PATH) return startLogin(request.query.return);
      if (request.path === CALLBACK_PATH) return await callback(event, request.query);
      if (request.path === ME_PATH) return await session(event);
      return logout();
    } catch {
      return json(503, { error: 'Sign-in is temporarily unavailable.' });
    }
  };
}

export const handler = createHandler();
