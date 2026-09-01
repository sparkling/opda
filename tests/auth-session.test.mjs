import assert from 'node:assert/strict';
import {
  createHash,
  generateKeyPairSync,
  sign,
} from 'node:crypto';
import test from 'node:test';

import {
  createHandler,
  safeReturnPath,
} from '../config/aws/auth-session/index.mjs';

const SITE_ORIGIN = 'https://opda.org.uk';
const AUTH0_DOMAIN = 'opda-test.eu.auth0.com';
const CLIENT_ID = 'opda-test-client';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };

const base64url = (value) => Buffer.from(value).toString('base64url');

function idToken(overrides = {}) {
  const now = 1_800_000_000;
  const header = base64url(JSON.stringify({ alg: 'RS256', kid: jwk.kid, typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: `https://${AUTH0_DOMAIN}/`,
    aud: CLIENT_ID,
    exp: now + 3600,
    iat: now,
    email: 'member@example.test',
    email_verified: true,
    name: 'Test Member',
    picture: 'https://example.test/member.png',
    ...overrides,
  }));
  const input = `${header}.${payload}`;
  const signature = sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url');
  return `${input}.${signature}`;
}

function event(path, { query = {}, cookies = [], method = 'GET' } = {}) {
  return {
    version: '2.0',
    routeKey: `${method} ${path}`,
    rawPath: path,
    queryStringParameters: query,
    cookies,
    requestContext: { http: { method, path } },
  };
}

function cookieValue(cookies, name) {
  const prefix = `${name}=`;
  const cookie = cookies.find((value) => value.startsWith(prefix));
  return cookie?.slice(prefix.length).split(';', 1)[0] ?? null;
}

function handlerWith({
  tokenEmail = 'member@example.test',
  tokenOverrides = {},
  tokenMutator = (token) => token,
} = {}) {
  const randomValues = [Buffer.alloc(32, 1), Buffer.alloc(32, 2), Buffer.alloc(32, 3)];
  const requests = [];
  let expectedNonce;
  const fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).endsWith('/.well-known/jwks.json')) {
      return { ok: true, json: async () => ({ keys: [jwk] }) };
    }
    if (String(url).endsWith('/oauth/token')) {
      return {
        ok: true,
        json: async () => ({
          id_token: tokenMutator(idToken({
            email: tokenEmail,
            nonce: expectedNonce,
            ...tokenOverrides,
          })),
          access_token: 'auth0-access-token',
        }),
      };
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };
  const handler = createHandler({
    config: {
      siteOrigin: SITE_ORIGIN,
      auth0Domain: AUTH0_DOMAIN,
      clientId: CLIENT_ID,
      members: ['member@example.test'],
    },
    fetch,
    now: () => 1_800_000_000_000,
    randomBytes: () => randomValues.shift() ?? Buffer.alloc(32, 4),
  });
  return {
    handler,
    requests,
    setExpectedNonce(value) { expectedNonce = value; },
  };
}

test('return targets are constrained to local absolute paths', () => {
  assert.equal(safeReturnPath('/programme?view=current'), '/programme?view=current');
  for (const unsafe of [undefined, '', 'programme', '//evil.test', 'https://evil.test', '/\\evil', '/line\nbreak']) {
    assert.equal(safeReturnPath(unsafe), '/');
  }
  assert.equal(safeReturnPath(`/${'a'.repeat(4096)}`), '/');
});

test('login starts Auth0 code plus PKCE and binds state, nonce and return path to secure cookies', async () => {
  const { handler } = handlerWith();
  const response = await handler(event('/_auth/login', {
    query: { return: '/programme?view=current' },
  }));

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers['cache-control'], 'no-store');
  const authorize = new URL(response.headers.location);
  assert.equal(authorize.origin, `https://${AUTH0_DOMAIN}`);
  assert.equal(authorize.pathname, '/authorize');
  assert.equal(authorize.searchParams.get('response_type'), 'code');
  assert.equal(authorize.searchParams.get('client_id'), CLIENT_ID);
  assert.equal(authorize.searchParams.get('redirect_uri'), `${SITE_ORIGIN}/_auth/callback`);
  assert.equal(authorize.searchParams.get('scope'), 'openid email profile');
  assert.equal(authorize.searchParams.get('code_challenge_method'), 'S256');

  const verifier = cookieValue(response.cookies, '__Host-opda_verifier');
  const state = cookieValue(response.cookies, '__Host-opda_oauth_state');
  const nonce = cookieValue(response.cookies, '__Host-opda_nonce');
  const returnPath = cookieValue(response.cookies, '__Host-opda_return');
  assert.ok(verifier && state && nonce && returnPath);
  assert.equal(authorize.searchParams.get('state'), state);
  assert.equal(authorize.searchParams.get('nonce'), nonce);
  assert.equal(
    authorize.searchParams.get('code_challenge'),
    createHash('sha256').update(verifier).digest('base64url'),
  );
  assert.equal(Buffer.from(returnPath, 'base64url').toString('utf8'), '/programme?view=current');
  for (const cookie of response.cookies) {
    assert.match(cookie, /; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=300$/u);
  }
});

test('callback rejects a mismatched state before exchanging a code', async () => {
  const { handler, requests } = handlerWith();
  const login = await handler(event('/_auth/login', { query: { return: '/programme' } }));
  const response = await handler(event('/_auth/callback', {
    query: { code: 'code', state: 'different-state' },
    cookies: login.cookies,
  }));

  assert.equal(response.statusCode, 400);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(requests.length, 0);
});

test('callback verifies the member ID token, creates a session and restores the return target', async () => {
  const controls = handlerWith();
  const login = await controls.handler(event('/_auth/login', {
    query: { return: '/programme?view=current' },
  }));
  const state = cookieValue(login.cookies, '__Host-opda_oauth_state');
  controls.setExpectedNonce(cookieValue(login.cookies, '__Host-opda_nonce'));

  const callback = await controls.handler(event('/_auth/callback', {
    query: { code: 'authorization-code', state },
    cookies: login.cookies,
  }));

  assert.equal(callback.statusCode, 302);
  assert.equal(callback.headers.location, `${SITE_ORIGIN}/programme?view=current`);
  assert.ok(cookieValue(callback.cookies, '__Host-opda_id'));
  assert.equal(cookieValue(callback.cookies, '__Host-opda_at'), 'auth0-access-token');
  assert.match(callback.cookies.join('\n'), /__Host-opda_verifier=; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=0/u);

  const sessionCookies = callback.cookies.filter((cookie) => (
    cookie.startsWith('__Host-opda_id=') || cookie.startsWith('__Host-opda_at=')
  ));
  const me = await controls.handler(event('/_auth/me', { cookies: sessionCookies }));
  assert.equal(me.statusCode, 200);
  assert.deepEqual(JSON.parse(me.body), {
    email: 'member@example.test',
    name: 'Test Member',
    picture: 'https://example.test/member.png',
    token: 'auth0-access-token',
  });
  assert.equal(me.headers['cache-control'], 'no-store');
  assert.equal(me.headers['x-content-type-options'], 'nosniff');
});

test('callback rejects authenticated identities outside the member allowlist', async () => {
  const controls = handlerWith({ tokenEmail: 'outsider@example.test' });
  const login = await controls.handler(event('/_auth/login'));
  controls.setExpectedNonce(cookieValue(login.cookies, '__Host-opda_nonce'));
  const callback = await controls.handler(event('/_auth/callback', {
    query: {
      code: 'authorization-code',
      state: cookieValue(login.cookies, '__Host-opda_oauth_state'),
    },
    cookies: login.cookies,
  }));

  assert.equal(callback.statusCode, 401);
  assert.doesNotMatch(callback.cookies.join('\n'), /__Host-opda_id=[^;]/u);
});

test('callback rejects invalid OIDC claims and signatures', async (t) => {
  const now = 1_800_000_000;
  const cases = [
    ['issuer', { tokenOverrides: { iss: 'https://other.example.test/' } }],
    ['audience', { tokenOverrides: { aud: 'different-client' } }],
    ['authorised party', { tokenOverrides: { aud: [CLIENT_ID, 'other'], azp: 'other' } }],
    ['expiry', { tokenOverrides: { exp: now - 120 } }],
    ['issued-at time', { tokenOverrides: { iat: now + 120 } }],
    ['not-before time', { tokenOverrides: { nbf: now + 120 } }],
    ['verified e-mail', { tokenOverrides: { email_verified: false } }],
    ['nonce', { tokenOverrides: { nonce: 'wrong-nonce' } }],
    ['signature', {
      tokenMutator: (token) => `${token.split('.').slice(0, 2).join('.')}.${base64url(Buffer.alloc(256))}`,
    }],
  ];

  for (const [label, options] of cases) {
    await t.test(label, async () => {
      const controls = handlerWith(options);
      const login = await controls.handler(event('/_auth/login'));
      controls.setExpectedNonce(cookieValue(login.cookies, '__Host-opda_nonce'));
      const callback = await controls.handler(event('/_auth/callback', {
        query: {
          code: 'authorization-code',
          state: cookieValue(login.cookies, '__Host-opda_oauth_state'),
        },
        cookies: login.cookies,
      }));
      assert.equal(callback.statusCode, 401);
      assert.doesNotMatch(callback.cookies.join('\n'), /__Host-opda_id=[^;]/u);
    });
  }
});

test('me is a cache-disabled JSON 401 without a valid session', async () => {
  const { handler } = handlerWith();
  const response = await handler(event('/_auth/me'));
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.deepEqual(JSON.parse(response.body), { authenticated: false });
});

test('logout clears every session cookie and redirects through Auth0 logout', async () => {
  const { handler } = handlerWith();
  const response = await handler(event('/_auth/logout'));
  assert.equal(response.statusCode, 302);
  const logout = new URL(response.headers.location);
  assert.equal(logout.origin, `https://${AUTH0_DOMAIN}`);
  assert.equal(logout.pathname, '/v2/logout');
  assert.equal(logout.searchParams.get('client_id'), CLIENT_ID);
  assert.equal(logout.searchParams.get('returnTo'), `${SITE_ORIGIN}/`);
  assert.equal(response.cookies.length, 6);
  for (const cookie of response.cookies) assert.match(cookie, /Max-Age=0$/u);
});

test('unsupported methods and routes fail without contacting Auth0', async () => {
  const { handler, requests } = handlerWith();
  assert.equal((await handler(event('/_auth/login', { method: 'POST' }))).statusCode, 405);
  assert.equal((await handler(event('/_auth/unknown'))).statusCode, 404);
  assert.equal(requests.length, 0);
});

test('invalid deployment configuration fails closed as a non-cacheable 503', async () => {
  const handler = createHandler({
    config: {
      siteOrigin: SITE_ORIGIN,
      auth0Domain: 'https://not-a-hostname.example.test',
      clientId: CLIENT_ID,
      members: ['member@example.test'],
    },
  });
  const result = await handler(event('/_auth/login'));
  assert.equal(result.statusCode, 503);
  assert.equal(result.headers['cache-control'], 'no-store');
});
