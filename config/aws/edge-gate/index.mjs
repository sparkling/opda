// Lambda@Edge viewer-request gate — opda.org.uk (ADR-0038 §Gate, ADR-0040)
//
// Server-side protection for the knowledge base: the public homepage and
// static assets pass through; every other request must carry a valid Auth0
// ID token in an HttpOnly cookie, or it is 302-redirected into Auth0
// Universal Login's OAuth 2.0 authorization-code flow (with PKCE — the app
// client is public/SPA-type, no client secret exists anywhere). Gated HTML
// is never served to an unauthenticated request. Membership (the 3 allowed
// e-mails) is enforced here too — Auth0's shared Google dev keys
// authenticate anyone with a Google account.
//
// Lambda@Edge constraints shaping this file (ADR-0038 consequences):
//  - No environment variables → runtime config (user pool / client / domain)
//    is read from SSM Parameter Store in eu-west-2 at cold start. The
//    parameter is written by the site stack, which deploys *after* this
//    function — so a missing parameter is answered with 503, not a crash.
//  - Created in us-east-1, executes at edge PoPs; keep cold start small —
//    no bundled deps, only Node built-ins + the runtime's AWS SDK v3.
//
// Flow:
//   public path        → pass through
//   /_auth/callback    → exchange code (+ PKCE verifier cookie) for tokens,
//                        set ID-token cookie, redirect to original path
//   valid ID cookie    → pass through
//   otherwise          → set PKCE verifier cookie, 302 to Cognito authorize

import { createHash, createPublicKey, randomBytes, verify as cryptoVerify } from 'node:crypto';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const CONFIG_PARAM = '/opda/gate/config';
const CONFIG_REGION = 'eu-west-2';
const SITE_ORIGIN = 'https://opda.org.uk';
const CALLBACK_PATH = '/_auth/callback';
const LOGIN_PATH = '/_auth/login';
const LOGOUT_PATH = '/_auth/logout';
const ME_PATH = '/_auth/me';
const ID_COOKIE = 'opda_id';
const AT_COOKIE = 'opda_at';
const VERIFIER_COOKIE = 'opda_verifier';

// Public surface: the coming-soon homepage and non-content assets. Hashed
// build assets (/_astro/) are deliberately public — they are styling/scripts,
// not KB content, and the homepage needs them (ADR-0038: "/ and its assets").
const PUBLIC_EXACT = new Set([
  '/',
  '/index.html',
  '/robots.txt',
  '/favicon.svg',
  '/favicon.ico',
  '/coming-soon.jpg', // the homepage hero/og image
]);
const PUBLIC_PREFIXES = ['/_astro/', '/fonts/', '/favicon'];

// Cold-start caches (per edge-PoP execution environment). Config is
// re-fetched after a TTL so allowlist/IdP changes in SSM reach warm
// instances within minutes, not at the next arbitrary cold start.
const CONFIG_TTL_MS = 5 * 60 * 1000;
let configPromise = null;
let configFetchedAt = 0;
let jwksPromise = null;

const ssm = new SSMClient({ region: CONFIG_REGION });

async function getConfig() {
  // { domain, clientId, members } — domain is the Auth0 tenant host (e.g.
  // "opda.eu.auth0.com"); members is the lowercase member e-mail allowlist
  // (ADR-0038: Auth0's shared dev keys let any Google account authenticate,
  // so membership is enforced here at the gate).
  if (configPromise && Date.now() - configFetchedAt > CONFIG_TTL_MS) {
    configPromise = null;
  }
  if (!configPromise) {
    configFetchedAt = Date.now();
    configPromise = ssm
      .send(new GetParameterCommand({ Name: CONFIG_PARAM }))
      .then((r) => JSON.parse(r.Parameter.Value))
      .catch((err) => {
        configPromise = null; // retry on next request
        throw err;
      });
  }
  return configPromise;
}

async function getJwks(cfg) {
  const url = `https://${cfg.domain}/.well-known/jwks.json`;
  jwksPromise ??= fetch(url)
    .then((r) => r.json())
    .then((body) => Object.fromEntries(body.keys.map((k) => [k.kid, k])))
    .catch((err) => {
      jwksPromise = null;
      throw err;
    });
  return jwksPromise;
}

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const decodeJwtPart = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

function parseCookies(headers) {
  const out = {};
  for (const { value } of headers.cookie ?? []) {
    for (const pair of value.split(';')) {
      const idx = pair.indexOf('=');
      if (idx > 0) out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }
  }
  return out;
}

async function verifyIdToken(token, cfg) {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const header = decodeJwtPart(parts[0]);
  const payload = decodeJwtPart(parts[1]);

  if (payload.iss !== `https://${cfg.domain}/`) return false;
  if (payload.aud !== cfg.clientId) return false;
  if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return false;
  // Membership: signature alone is not enough — Auth0 authenticates any
  // Google account; only allowlisted member e-mails pass the gate.
  // cfg.members is comma-separated (it arrives via a CloudFormation
  // parameter, which cannot split strings).
  const email = (payload.email ?? '').toLowerCase();
  const members = String(cfg.members ?? '').toLowerCase().split(',').map((s) => s.trim());
  if (!email || !members.includes(email)) return false;

  const jwk = (await getJwks(cfg))[header.kid];
  if (!jwk || header.alg !== 'RS256') return false;
  const key = createPublicKey({ key: jwk, format: 'jwk' });
  return cryptoVerify(
    'RSA-SHA256',
    Buffer.from(`${parts[0]}.${parts[1]}`),
    key,
    Buffer.from(parts[2], 'base64url'),
  );
}

// `state` carries the originally-requested path. Constrain it to a local
// absolute path so the callback can never be steered into an open redirect.
const safeReturnPath = (state) =>
  typeof state === 'string' && state.startsWith('/') && !state.startsWith('//') ? state : '/';

// S3 origins don't resolve directory indexes (CloudFront's DefaultRootObject
// covers "/" only) — rewrite pretty URLs to the index.html object the Astro
// build emits. API paths pass through to the comments origin untouched.
function rewriteIndex(uri) {
  if (uri.startsWith('/api/')) return uri;
  if (uri.endsWith('/')) return `${uri}index.html`;
  return uri.split('/').pop().includes('.') ? uri : `${uri}/index.html`;
}

const response = (status, statusDescription, headers) => ({ status, statusDescription, headers });

function redirectToSignIn(cfg, returnPath) {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  const authorize = new URL(`https://${cfg.domain}/authorize`);
  authorize.search = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId,
    redirect_uri: `${SITE_ORIGIN}${CALLBACK_PATH}`,
    // profile gives name/picture for the header user-menu (/_auth/me).
    scope: 'openid email profile',
    state: returnPath,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString();
  return response('302', 'Found', {
    location: [{ key: 'Location', value: authorize.toString() }],
    'set-cookie': [
      {
        key: 'Set-Cookie',
        value: `${VERIFIER_COOKIE}=${verifier}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300`,
      },
    ],
    'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
  });
}

async function handleCallback(request, cfg) {
  const qs = new URLSearchParams(request.querystring ?? '');
  const code = qs.get('code');
  const verifier = parseCookies(request.headers)[VERIFIER_COOKIE];
  if (!code || !verifier) return redirectToSignIn(cfg, safeReturnPath(qs.get('state')));

  const tokenRes = await fetch(`https://${cfg.domain}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: cfg.clientId,
      redirect_uri: `${SITE_ORIGIN}${CALLBACK_PATH}`,
      code,
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) return redirectToSignIn(cfg, safeReturnPath(qs.get('state')));
  const tokens = await tokenRes.json();
  if (!(await verifyIdToken(tokens.id_token ?? '', cfg))) {
    return response('403', 'Forbidden', {
      'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
    });
  }

  // Cookie lifetime tracks the ID token's own exp; an expired cookie just
  // re-enters the flow. The access token rides in a second HttpOnly cookie:
  // /_auth/me hands it to same-origin JS so the comments widget can run the
  // Artalk SSO exchange (the fork verifies it against Auth0's /userinfo).
  const maxAge = Math.max(60, decodeJwtPart(tokens.id_token.split('.')[1]).exp - Math.floor(Date.now() / 1000));
  return response('302', 'Found', {
    location: [{ key: 'Location', value: `${SITE_ORIGIN}${safeReturnPath(qs.get('state'))}` }],
    'set-cookie': [
      {
        key: 'Set-Cookie',
        value: `${ID_COOKIE}=${tokens.id_token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
      },
      {
        key: 'Set-Cookie',
        value: `${AT_COOKIE}=${tokens.access_token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
      },
      {
        key: 'Set-Cookie',
        value: `${VERIFIER_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`,
      },
    ],
    'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
  });
}

// Same-origin session surface for the site's own JS (header user-menu and
// the comments widget). 401 when unauthenticated — public pages handle it.
async function handleMe(request, cfg) {
  const cookies = parseCookies(request.headers);
  const idToken = cookies[ID_COOKIE];
  let payload = null;
  try {
    if (idToken && (await verifyIdToken(idToken, cfg))) {
      payload = decodeJwtPart(idToken.split('.')[1]);
    }
  } catch { /* treat as unauthenticated */ }
  const headers = {
    'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
    'content-type': [{ key: 'Content-Type', value: 'application/json' }],
  };
  if (!payload) return { ...response('401', 'Unauthorized', headers), body: '{}' };
  return {
    ...response('200', 'OK', headers),
    body: JSON.stringify({
      email: payload.email,
      name: payload.name ?? null,
      picture: payload.picture ?? null,
      token: cookies[AT_COOKIE] ?? null, // for the Artalk SSO exchange
    }),
  };
}

function handleLogout(cfg) {
  const expire = (name) =>
    ({ key: 'Set-Cookie', value: `${name}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0` });
  const logout = new URL(`https://${cfg.domain}/v2/logout`);
  logout.search = new URLSearchParams({
    client_id: cfg.clientId,
    returnTo: `${SITE_ORIGIN}/`,
  }).toString();
  return response('302', 'Found', {
    location: [{ key: 'Location', value: logout.toString() }],
    'set-cookie': [expire(ID_COOKIE), expire(AT_COOKIE), expire(VERIFIER_COOKIE)],
    'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
  });
}

export async function handler(event) {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  if (PUBLIC_EXACT.has(uri) || PUBLIC_PREFIXES.some((p) => uri.startsWith(p))) {
    request.uri = rewriteIndex(uri);
    return request;
  }

  let cfg;
  try {
    cfg = await getConfig();
  } catch {
    // Site stack (which writes the SSM parameter) not deployed yet, or SSM
    // unreachable: fail closed — never serve gated content unauthenticated.
    return response('503', 'Service Unavailable', {
      'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
      'content-type': [{ key: 'Content-Type', value: 'text/plain' }],
    });
  }

  if (uri === CALLBACK_PATH) return handleCallback(request, cfg);
  if (uri === ME_PATH) return handleMe(request, cfg);
  if (uri === LOGOUT_PATH) return handleLogout(cfg);
  if (uri === LOGIN_PATH) {
    const qs = new URLSearchParams(request.querystring ?? '');
    return redirectToSignIn(cfg, safeReturnPath(qs.get('return')));
  }

  const idToken = parseCookies(request.headers)[ID_COOKIE];
  if (idToken) {
    try {
      if (await verifyIdToken(idToken, cfg)) {
        request.uri = rewriteIndex(uri);
        return request;
      }
    } catch {
      // JWKS fetch failure etc. — fall through to re-auth rather than serve.
    }
  }

  const returnPath = request.querystring ? `${uri}?${request.querystring}` : uri;
  return redirectToSignIn(cfg, returnPath);
}
