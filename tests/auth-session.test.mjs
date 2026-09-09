import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createHandler, safeReturnPath } from '../config/aws/auth-session/index.mjs';
import { createStore, sessionKey } from '../config/aws/auth-session/store.mjs';
import { approvedParticipant } from '../config/aws/auth-session/identity.mjs';

const NOW = 1_800_000_000;
const SUB = '11111111-2222-3333-4444-555555555555';
const SITE = 'https://opda.org.uk';
const ISSUER = 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_example';
const DOMAIN = 'https://opda-test.auth.eu-west-2.amazoncognito.com';
const CLIENT = 'opdatestclient';
const CONFIG = {
  issuer: ISSUER, cognitoDomain: DOMAIN, clientId: CLIENT, siteOrigin: SITE,
  participantsTableName: 'participants-test', sessionsTableName: 'sessions-test',
};
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };
const base64url = (value) => Buffer.from(value).toString('base64url');
const clone = (value) => value == null ? value : structuredClone(value);

function idToken(overrides = {}, headerOverrides = {}) {
  const header = base64url(JSON.stringify({ alg: 'RS256', kid: jwk.kid, ...headerOverrides }));
  const payload = base64url(JSON.stringify({
    iss: ISSUER, aud: CLIENT, token_use: 'id', sub: SUB, exp: NOW + 3600, iat: NOW,
    email: 'member@example.test', email_verified: true, name: 'Provider Name', ...overrides,
  }));
  const input = header + '.' + payload;
  return input + '.' + sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url');
}

function participant(overrides = {}) {
  return {
    pk: 'USER#' + SUB, participantId: 'participant-123', cognitoSub: SUB,
    email: 'member@example.test', name: 'Test Member', reviewStatus: 'approved',
    active: true, suspended: false, enrolmentStatus: 'not_invited', accessVersion: 1,
    createdAt: '2026-09-08T10:00:00Z', approvedAt: '2026-09-08T10:00:00Z', ...overrides,
  };
}

test('domain-policy login requires a real approved group even before legacy projections reconcile', () => {
  const identity = { sub: SUB, email: 'member@example.test' };
  const row = participant({ approvalPolicy: 'individual-domains-v1', legacyWebsiteApproved: true,
    approvedDomains: [], domainApprovals: {} });
  assert.equal(approvedParticipant(row, identity, NOW), false);
  row.approvedDomains = ['conveyancing']; row.domainApprovals.conveyancing = { status: 'approved' };
  assert.equal(approvedParticipant(row, identity, NOW), true);
  row.domainApprovals.conveyancing.status = 'withdrawn';
  assert.equal(approvedParticipant(row, identity, NOW), false);
});

function event(path, { query = {}, cookies = [], method = 'GET' } = {}) {
  return { rawPath: path, queryStringParameters: query, cookies, requestContext: { http: { method } } };
}

function cookieValue(cookies, name) {
  return cookies.find((value) => value.startsWith(name + '='))?.split(';', 1)[0].slice(name.length + 1);
}

function handlerWith(options = {}) {
  const requests = [], operations = [], sessions = new Map();
  const state = { participant: options.participant === null ? null : participant(options.participant), nonce: null, now: NOW };
  let randomCounter = 0;
  const store = {
    async getParticipant(sub) {
      operations.push(['getParticipant', sub]);
      if (options.readFailure) throw new Error('database unavailable');
      options.afterParticipantRead?.(state);
      return clone(state.participant);
    },
    async getSession(key) {
      operations.push(['getSession', key]);
      if (options.readFailure) throw new Error('database unavailable');
      return clone(sessions.get(key));
    },
    async issueSession(input) {
      operations.push(['issueSession', clone(input)]);
      options.beforeIssue?.(state);
      if (options.writeFailure) throw new Error('write unavailable');
      if (JSON.stringify(state.participant) !== JSON.stringify(input.participant)) {
        throw Object.assign(new Error('approval changed'), { name: 'TransactionCanceledException' });
      }
      if (state.participant.enrolmentStatus === 'not_invited') {
        Object.assign(state.participant, {
          enrolmentStatus: 'complete', completedAt: new Date(NOW * 1000).toISOString(),
          verifiedEmailAt: new Date(NOW * 1000).toISOString(), verifiedEmail: input.session.email,
          verifiedCognitoSub: input.session.sub, verifiedIssuer: ISSUER,
        });
      }
      sessions.set(input.session.pk, clone(input.session));
    },
    async deleteSession(key) {
      operations.push(['deleteSession', key]);
      if (options.deleteFailure) throw new Error('delete unavailable');
      sessions.delete(key);
    },
  };
  const fetch = async (url, init = {}) => {
    requests.push({ url: String(url), init });
    if (options.fetchFailure) throw new Error('identity provider unavailable');
    if (String(url) === ISSUER + '/.well-known/jwks.json') {
      return { ok: !options.keysFailure, json: async () => ({ keys: [jwk] }) };
    }
    assert.equal(String(url), DOMAIN + '/oauth2/token');
    return {
      ok: !options.tokenFailure,
      json: async () => ({
        id_token: (options.tokenMutator ?? ((value) => value))(idToken({ nonce: state.nonce, ...options.tokenOverrides }, options.headerOverrides)),
        access_token: 'never-expose-provider-access-token', refresh_token: 'never-expose-provider-refresh-token',
      }),
    };
  };
  const handler = createHandler({
    config: { ...CONFIG, ...options.config }, fetch, store, now: () => state.now * 1000,
    randomBytes: () => Buffer.alloc(32, ++randomCounter),
  });
  async function login(returnPath = '/programme?view=current') {
    const result = await handler(event('/_auth/login', { query: { return: returnPath } }));
    state.nonce = cookieValue(result.cookies, '__Host-opda_nonce');
    return result;
  }
  async function callback(returnPath) {
    const started = await login(returnPath);
    return handler(event('/_auth/callback', {
      query: { code: 'authorization-code', state: cookieValue(started.cookies, '__Host-opda_oauth_state') },
      cookies: started.cookies,
    }));
  }
  return { handler, requests, operations, sessions, state, login, callback };
}

test('return targets are constrained to local absolute paths', () => {
  assert.equal(safeReturnPath('/programme?view=current'), '/programme?view=current');
  for (const unsafe of [undefined, '', 'programme', '//evil.test', 'https://evil.test', '/\\evil', '/line\nbreak', '/' + 'a'.repeat(4096)]) {
    assert.equal(safeReturnPath(unsafe), '/');
  }
});

test('login starts Cognito public-client code + S256 PKCE bound to secure state and nonce cookies', async () => {
  const response = await handlerWith().login();
  const authorize = new URL(response.headers.location);
  assert.equal(authorize.origin, DOMAIN);
  assert.equal(authorize.pathname, '/oauth2/authorize');
  for (const [key, value] of Object.entries({
    response_type: 'code', client_id: CLIENT, redirect_uri: SITE + '/_auth/callback',
    scope: 'openid email profile', code_challenge_method: 'S256',
  })) assert.equal(authorize.searchParams.get(key), value);
  const verifier = cookieValue(response.cookies, '__Host-opda_verifier');
  assert.equal(authorize.searchParams.get('code_challenge'), createHash('sha256').update(verifier).digest('base64url'));
  assert.equal(authorize.searchParams.get('state'), cookieValue(response.cookies, '__Host-opda_oauth_state'));
  assert.equal(authorize.searchParams.get('nonce'), cookieValue(response.cookies, '__Host-opda_nonce'));
  assert.equal(Buffer.from(cookieValue(response.cookies, '__Host-opda_return'), 'base64url').toString(), '/programme?view=current');
  assert.equal(response.headers['cache-control'], 'no-store');
  for (const cookie of response.cookies) assert.match(cookie, /; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=300$/u);
});

test('callback rejects a mismatched state before exchanging the code', async () => {
  const controls = handlerWith(), login = await controls.login();
  const response = await controls.handler(event('/_auth/callback', {
    query: { code: 'code', state: 'different-state' }, cookies: login.cookies,
  }));
  assert.equal(response.statusCode, 400);
  assert.equal(controls.requests.length, 0);
  assert.equal(controls.sessions.size, 0);
});

test('verified OTP callback completes approval-bound onboarding and exposes only an opaque session', async () => {
  const controls = handlerWith(), response = await controls.callback();
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, SITE + '/programme?view=current');
  const token = cookieValue(response.cookies, '__Host-opda_session');
  assert.match(token, /^[A-Za-z0-9_-]{43}$/u);
  assert.equal(controls.state.participant.enrolmentStatus, 'complete');
  assert.equal(controls.state.participant.active, true);
  assert.equal(controls.state.participant.verifiedEmailAt, new Date(NOW * 1000).toISOString());
  assert.equal(controls.state.participant.verifiedEmail, 'member@example.test');
  assert.equal(controls.state.participant.verifiedCognitoSub, SUB);
  assert.equal(controls.state.participant.verifiedIssuer, ISSUER);
  const persisted = controls.sessions.get(sessionKey(token));
  assert.equal(persisted.pk, 'SESSION#' + createHash('sha256').update(token).digest('hex'));
  assert.equal(persisted.expiresAt, NOW + 3600);
  assert.equal(persisted.accessVersion, 1);
  assert.equal(persisted.sub, SUB);
  assert.doesNotMatch(JSON.stringify(persisted), /provider-|id_token|access_token|refresh_token/u);
  assert.doesNotMatch(JSON.stringify(response), /provider-|eyJ/u);
  assert.equal(cookieValue(response.cookies, '__Host-opda_id'), '');
  assert.equal(cookieValue(response.cookies, '__Host-opda_at'), '');
  const exchange = controls.requests.find((request) => request.url.endsWith('/oauth2/token'));
  assert.equal(exchange.init.body.get('client_id'), CLIENT);
  assert.equal(exchange.init.body.get('client_secret'), null);
  assert.ok(exchange.init.body.get('code_verifier'));
  const me = await controls.handler(event('/_auth/me', { cookies: response.cookies }));
  assert.equal(me.statusCode, 200);
  assert.deepEqual(JSON.parse(me.body), {
    email: 'member@example.test', name: 'Test Member', picture: null,
    authenticated: true, participantId: 'participant-123',
  });
  assert.equal(me.headers['cache-control'], 'no-store');
  assert.doesNotMatch(me.body, /token|provider-/u);
});

test('unknown, unapproved, suspended, expired and identity-unbound participants cannot create sessions', async (t) => {
  const cases = [null, { reviewStatus: 'pending' }, { suspended: true }, { suspended: undefined },
    { cognitoSub: 'different-sub' }, { email: 'outsider@example.test' }, { expiresAt: NOW },
    { active: false }, { active: undefined }, { enrolmentStatus: 'complete', active: false },
    { enrolmentStatus: 'unexpected' }, { accessVersion: '1' }];
  for (const value of cases) await t.test(JSON.stringify(value), async () => {
    const controls = handlerWith({ participant: value });
    assert.equal((await controls.callback()).statusCode, 401);
    assert.equal(controls.sessions.size, 0);
    assert.equal(controls.operations.some(([kind]) => kind === 'issueSession'), false);
  });
});

test('callback rejects bad signatures, algorithms and all required Cognito ID-token claims', async (t) => {
  const cases = [
    { tokenOverrides: { iss: ISSUER + '/' } }, { tokenOverrides: { aud: 'other-client' } },
    { tokenOverrides: { aud: [CLIENT] } }, { tokenOverrides: { token_use: 'access' } },
    { tokenOverrides: { exp: NOW } }, { tokenOverrides: { iat: NOW + 61 } },
    { tokenOverrides: { iat: null } }, { tokenOverrides: { nbf: NOW + 61 } },
    { tokenOverrides: { email_verified: false } }, { tokenOverrides: { email_verified: 'true' } },
    { tokenOverrides: { nonce: 'wrong-nonce' } }, { tokenOverrides: { sub: '' } },
    { headerOverrides: { alg: 'HS256' } }, { headerOverrides: { kid: 'unknown' } },
    { tokenMutator: (token) => token.split('.').slice(0, 2).join('.') + '.' + base64url(Buffer.alloc(256)) },
    { tokenMutator: () => 'not-a-jwt' },
  ];
  for (const [index, options] of cases.entries()) await t.test(String(index), async () => {
    const controls = handlerWith(options), response = await controls.callback();
    assert.equal(response.statusCode, 401);
    assert.equal(controls.sessions.size, 0);
    assert.equal(controls.operations.length, 0);
    assert.equal(cookieValue(response.cookies, '__Host-opda_session'), '');
  });
});

test('session expiry is capped by both provider token and participant expiry', async () => {
  const controls = handlerWith({ tokenOverrides: { exp: NOW + 1800 }, participant: { expiresAt: NOW + 600 } });
  const response = await controls.callback();
  assert.equal(response.statusCode, 302);
  assert.equal([...controls.sessions.values()][0].expiresAt, NOW + 600);
  assert.match(response.cookies.find((cookie) => cookie.startsWith('__Host-opda_session=')), /Max-Age=600$/u);
});

test('an ID token that expires during the participant lookup never creates a session', async () => {
  const controls = handlerWith({ tokenOverrides: { exp: NOW + 1 }, afterParticipantRead: (state) => { state.now += 2; } });
  assert.equal((await controls.callback()).statusCode, 401);
  assert.equal(controls.sessions.size, 0);
});

test('already-complete active participants can sign in without repeating onboarding', async () => {
  const completedAt = '2026-09-01T10:00:00Z';
  const controls = handlerWith({ participant: { enrolmentStatus: 'complete', active: true, completedAt } });
  assert.equal((await controls.callback()).statusCode, 302);
  assert.equal(controls.state.participant.completedAt, completedAt);
  assert.equal(controls.state.participant.accessVersion, 1);
});

test('a concurrent approval, deactivation or enrollment change prevents enrollment and session issuance', async (t) => {
  for (const change of [{ suspended: true }, { active: false }, { accessVersion: 2 }, { reviewStatus: 'rejected' }, { enrolmentStatus: 'complete', active: false }]) {
    await t.test(JSON.stringify(change), async () => {
      const controls = handlerWith({ beforeIssue: (state) => Object.assign(state.participant, change) });
      assert.equal((await controls.callback()).statusCode, 401);
      assert.equal(controls.sessions.size, 0);
      assert.equal(controls.state.participant.active, change.active ?? true);
      assert.equal(controls.state.participant.verifiedEmailAt, undefined);
    });
  }
});

test('me rechecks current membership and session bindings instead of trusting a stale cookie', async (t) => {
  const changes = [null, { reviewStatus: 'rejected' }, { reviewStatus: 'withdrawn' }, { suspended: true }, { active: false },
    { enrolmentStatus: 'not_invited' }, { accessVersion: 2 }, { email: 'changed@example.test' },
    { cognitoSub: 'changed-sub' }, { participantId: 'changed-participant' }, { expiresAt: NOW }];
  for (const change of changes) await t.test(JSON.stringify(change), async () => {
    const controls = handlerWith(), response = await controls.callback();
    controls.state.participant = change === null ? null : { ...controls.state.participant, ...change };
    const me = await controls.handler(event('/_auth/me', { cookies: response.cookies }));
    assert.equal(me.statusCode, 401);
    assert.deepEqual(JSON.parse(me.body), { authenticated: false });
    assert.equal(cookieValue(me.cookies, '__Host-opda_session'), '');
    assert.ok(me.cookies.every(cookie => cookie.endsWith('Max-Age=0')));
  });
  for (const change of [{ expiresAt: NOW }, { accessVersion: 9 }, { email: 'different@example.test' }, { sub: 'other' }]) {
    await t.test('session ' + JSON.stringify(change), async () => {
      const controls = handlerWith(), response = await controls.callback();
      Object.assign([...controls.sessions.values()][0], change);
      assert.equal((await controls.handler(event('/_auth/me', { cookies: response.cookies }))).statusCode, 401);
    });
  }
});

test('withdrawal signs out every existing session and reapproval never revives old cookies', async () => {
  const controls = handlerWith();
  const first = await controls.callback(), second = await controls.callback();
  assert.equal(controls.sessions.size, 2);
  Object.assign(controls.state.participant, { reviewStatus: 'withdrawn', active: false, suspended: true, accessVersion: 2 });
  for (const session of [first, second]) {
    const denied = await controls.handler(event('/_auth/me', { cookies: session.cookies }));
    assert.equal(denied.statusCode, 401);
    assert.equal(cookieValue(denied.cookies, '__Host-opda_session'), '');
  }
  assert.equal((await controls.callback()).statusCode, 401);
  Object.assign(controls.state.participant, { reviewStatus: 'approved', active: true, suspended: false, accessVersion: 3 });
  for (const session of [first, second]) {
    assert.equal((await controls.handler(event('/_auth/me', { cookies: session.cookies }))).statusCode, 401);
  }
  const fresh = await controls.callback();
  assert.equal(fresh.statusCode, 302);
  assert.equal((await controls.handler(event('/_auth/me', { cookies: fresh.cookies }))).statusCode, 200);
});

test('me never accepts Auth0 token cookies or unknown/malformed opaque tokens', async () => {
  const controls = handlerWith();
  for (const cookies of [[], ['__Host-opda_id=legacy', '__Host-opda_at=legacy'], ['__Host-opda_session=malformed'], ['__Host-opda_session=' + base64url(Buffer.alloc(32, 9))]]) {
    const response = await controls.handler(event('/_auth/me', { cookies }));
    assert.equal(response.statusCode, 401);
    assert.deepEqual(JSON.parse(response.body), { authenticated: false });
  }
});

test('provider, key and persistence failures fail closed without issuing a cookie', async (t) => {
  for (const options of [{ fetchFailure: true }, { keysFailure: true }, { readFailure: true }, { writeFailure: true }]) {
    await t.test(JSON.stringify(options), async () => {
      const controls = handlerWith(options), response = await controls.callback();
      assert.equal(response.statusCode, 503);
      assert.equal(controls.sessions.size, 0);
      assert.equal(cookieValue(response.cookies, '__Host-opda_session'), '');
    });
  }
  const controls = handlerWith({ readFailure: true });
  const result = await controls.handler(event('/_auth/me', { cookies: ['__Host-opda_session=' + base64url(Buffer.alloc(32))] }));
  assert.equal(result.statusCode, 503);
  assert.equal(JSON.parse(result.body).authenticated, false);
});

test('logout deletes the server session, clears old and new cookies and redirects through Cognito logout', async () => {
  const controls = handlerWith(), signedIn = await controls.callback();
  const response = await controls.handler(event('/_auth/logout', { cookies: signedIn.cookies }));
  assert.equal(controls.sessions.size, 0);
  assert.equal(response.statusCode, 302);
  const logout = new URL(response.headers.location);
  assert.equal(logout.origin, DOMAIN);
  assert.equal(logout.pathname, '/logout');
  assert.equal(logout.searchParams.get('client_id'), CLIENT);
  assert.equal(logout.searchParams.get('logout_uri'), SITE + '/');
  assert.equal(response.cookies.length, 7);
  for (const cookie of response.cookies) assert.match(cookie, /Max-Age=0$/u);
  const failed = handlerWith({ deleteFailure: true });
  const rejected = await failed.handler(event('/_auth/logout', { cookies: signedIn.cookies }));
  assert.equal(rejected.statusCode, 503);
  assert.equal(cookieValue(rejected.cookies, '__Host-opda_session'), '');
});

test('invalid configuration and unsupported routes/methods fail without provider calls', async () => {
  const controls = handlerWith();
  assert.equal((await controls.handler(event('/_auth/unknown'))).statusCode, 404);
  assert.equal((await controls.handler(event('/_auth/login', { method: 'POST' }))).statusCode, 405);
  assert.equal(controls.requests.length, 0);
  for (const config of [{ issuer: 'https://evil.test/pool' }, { cognitoDomain: DOMAIN + '/path' }, { siteOrigin: SITE + '/path' }, { sessionsTableName: '' }]) {
    assert.equal((await handlerWith({ config }).handler(event('/_auth/login'))).statusCode, 503);
  }
});

test('real DynamoDB approval lists and maps survive session reads and deny withdrawn groups', async () => {
  const encode = (value) => value === null ? { NULL: true }
    : Array.isArray(value) ? { L: value.map(encode) }
      : typeof value === 'object' ? { M: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) }
        : typeof value === 'boolean' ? { BOOL: value }
          : typeof value === 'number' ? { N: String(value) } : { S: value };
  const row = participant({ enrolmentStatus: 'complete', approvalPolicy: 'individual-domains-v1',
    approvedDomains: ['conveyancing'], domainApprovals: { conveyancing: { status: 'approved' } },
    holdReason: null, history: [] });
  const token = base64url(Buffer.alloc(32, 3));
  const saved = { pk: sessionKey(token), sub: SUB, email: row.email, participantId: row.participantId,
    accessVersion: row.accessVersion, createdAt: NOW, expiresAt: NOW + 3600 };
  class Command { constructor(input) { this.input = input; } }
  const store = createStore(CONFIG, {
    loadAws: async () => ({ GetItemCommand: Command }),
    client: { async send({ input }) {
      assert.equal(input.ConsistentRead, true);
      return { Item: encode(input.TableName === CONFIG.participantsTableName ? row : saved).M };
    } },
  });
  assert.deepEqual(await store.getParticipant(SUB), row);
  const handler = createHandler({ config: CONFIG, store, now: () => NOW * 1000 });
  const request = event('/_auth/me', { cookies: ['__Host-opda_session=' + token] });
  assert.equal((await handler(request)).statusCode, 200);
  row.domainApprovals.conveyancing.status = 'withdrawn';
  assert.equal((await handler(request)).statusCode, 401);
  row.approvedDomains = [];
  assert.equal((await handler(request)).statusCode, 401);
});

test('DynamoDB adapter uses strong reads and atomic approval-bound enrollment/session writes', async () => {
  const commands = [];
  class Command { constructor(input) { this.input = input; } }
  const store = createStore(CONFIG, {
    loadAws: async () => ({ GetItemCommand: Command, DeleteItemCommand: Command, TransactWriteItemsCommand: Command }),
    client: { async send(command) { commands.push(command.input); return {}; } },
  });
  await store.getParticipant(SUB);
  await store.getSession('SESSION#hash');
  assert.equal(commands[0].ConsistentRead, true);
  assert.deepEqual(commands[0].Key, { pk: { S: 'USER#' + SUB } });
  assert.equal(commands[1].ConsistentRead, true);
  const session = { pk: 'SESSION#hash', sub: SUB, email: 'member@example.test', participantId: 'participant-123', accessVersion: 1, createdAt: NOW, expiresAt: NOW + 3600 };
  await store.issueSession({ participant: participant(), session, now: NOW });
  const transaction = commands[2].TransactItems;
  assert.equal(transaction.length, 2);
  const update = transaction[0].Update;
  assert.match(update.UpdateExpression, /#enrolment = :complete/u);
  assert.doesNotMatch(update.UpdateExpression, /#active/u);
  assert.equal(update.ExpressionAttributeValues[':active'].BOOL, true);
  for (const field of ['verifiedEmailAt', 'verifiedEmail', 'verifiedCognitoSub', 'verifiedIssuer']) {
    assert.ok(Object.values(update.ExpressionAttributeNames).includes(field), field);
  }
  assert.equal(update.ExpressionAttributeValues[':verifiedEmail'].S, session.email);
  assert.equal(update.ExpressionAttributeValues[':verifiedSub'].S, SUB);
  assert.equal(update.ExpressionAttributeValues[':verifiedIssuer'].S, ISSUER);
  for (const guard of ['#review = :approved', '#suspended = :false', '#version = :version', '#sub = :sub', '#email = :email', '#participant = :participant', '#enrolment = :enrolment', '#active = :active', '#expires > :now']) {
    assert.ok(update.ConditionExpression.includes(guard), guard);
  }
  assert.equal(update.ExpressionAttributeValues[':enrolment'].S, 'not_invited');
  assert.equal(transaction[1].Put.Item.expiresAt.N, String(NOW + 3600));
  assert.equal(transaction[1].Put.ConditionExpression, 'attribute_not_exists(pk)');
  assert.doesNotMatch(JSON.stringify(transaction), /id_token|access_token|refresh_token/u);
  await store.issueSession({ participant: participant({ enrolmentStatus: 'complete', active: true }), session, now: NOW });
  assert.ok(commands[3].TransactItems[0].ConditionCheck);
  assert.equal(commands[3].TransactItems[0].Update, undefined);
  await store.deleteSession('SESSION#hash');
  assert.deepEqual(commands[4].Key, { pk: { S: 'SESSION#hash' } });
  await assert.rejects(store.issueSession({ participant: participant({ active: false }), session, now: NOW }), /inactive/u);
  assert.equal(commands.length, 5);
});

test('comment migration reader has no login, bearer token, editor or background mutation path', async () => {
  const source = await readFile(new URL('../src/components/Comments.astro', import.meta.url), 'utf8');
  assert.match(source, /temporarily read-only/u);
  assert.match(source, /localStorage\.removeItem\('ArtalkUser'\)/u);
  assert.match(source, /credentials: 'omit'/u);
  assert.match(source, /method: 'GET'/u);
  assert.doesNotMatch(source, /sso\/exchange|\/_auth\/me|Artalk\.init|localStorage\.(getItem|setItem)|innerHTML|method: 'POST'/u);
  assert.match(source, /getLegacyCommentKey\(Astro\.url\.pathname\)/u);
});

test('anonymous comment reads omit credentials and render remote text without interpreting HTML', async () => {
  const source = await readFile(new URL('../src/components/Comments.astro', import.meta.url), 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/u)[1];
  class Element {
    children = []; dataset = {}; hidden = false; disabled = false; textContent = '';
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute() {}
    addEventListener() {}
  }
  const ids = new Map(['opda-comments', 'opda-comments-list', 'opda-comments-status', 'opda-comments-more']
    .map(id => [id, new Element()]));
  const section = new Element(); section.dataset.commentPageKey = '/retained-thread';
  const requests = [], removed = [];
  const malicious = '<img src=x onerror=alert(1)>';
  const context = {
    URL, URLSearchParams, AbortController, HTMLButtonElement: Element,
    window: { location: { pathname: '/new-location', origin: SITE }, localStorage: { removeItem: key => removed.push(key) } },
    document: { readyState: 'complete', getElementById: id => ids.get(id), querySelector: () => section,
      createElement: () => new Element(), addEventListener() {} },
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => ({ data: { count: 1, comments: [
        { id: 1, nick: malicious, content: malicious, date: '2026-09-08T10:00:00Z', rid: 0 },
      ] } }) };
    },
  };
  vm.runInNewContext(script, context);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(removed, ['ArtalkUser']);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.method, 'GET');
  assert.equal(requests[0].options.credentials, 'omit');
  assert.equal(requests[0].options.headers.Authorization, undefined);
  const target = new URL(requests[0].url);
  assert.equal(target.pathname, '/api/v2/comments');
  assert.equal(target.searchParams.get('page_key'), '/retained-thread');
  assert.equal(target.searchParams.get('site_name'), 'OPDA');
  assert.equal(target.searchParams.get('token'), null);
  const texts = element => [element.textContent, ...element.children.flatMap(texts)];
  assert.equal(texts(ids.get('opda-comments-list')).filter(value => value === malicious).length, 2);
  assert.equal(ids.get('opda-comments-more').hidden, true);
});
