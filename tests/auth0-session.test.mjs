import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import test from 'node:test';
import { createHandler } from '../config/aws/auth-session/index.mjs';
import { createStore, identityKey } from '../config/aws/auth-session/store.mjs';
import { approvedParticipant } from '../config/aws/auth-session/identity.mjs';
import { socialProviders } from '../config/aws/auth-session/providers.mjs';

const NOW = 1_800_000_000, SUB = '11111111-2222-3333-4444-555555555555';
const ISSUER = 'https://sparklesparkle.auth0.com/', SUBJECT = 'google-oauth2|test-member';
const CONFIG = { provider: 'auth0', issuer: ISSUER, clientId: 'testclient', siteOrigin: 'https://opda.org.uk',
  participantsTableName: 'participants-test', sessionsTableName: 'sessions-test' };
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'auth0-key', use: 'sig', alg: 'RS256' };
const encode = v => v === null ? { NULL: true } : Array.isArray(v) ? { L: v.map(encode) }
  : typeof v === 'object' ? { M: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, encode(x)])) }
    : typeof v === 'boolean' ? { BOOL: v } : typeof v === 'number' ? { N: String(v) } : { S: v };
const decode = item => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v.S ?? (v.N ? Number(v.N) : v.BOOL)]));
const cookie = (response, name) => response.cookies.find(v => v.startsWith(name + '='))?.split(';')[0].slice(name.length + 1);
const oauthTransaction = response => {
  const state = new URL(response.headers.location).searchParams.get('state');
  const value = cookie(response, '__Host-opda_oauth_' + state);
  return { state, data: JSON.parse(Buffer.from(value, 'base64url').toString()) };
};
const request = (path, query = {}, cookies = []) => ({ rawPath: path, queryStringParameters: query,
  cookies, requestContext: { http: { method: 'GET' } } });

test('a legacy contact approval never bypasses the requirement for a currently approved working group', () => {
  const { row } = setup({ row: { approvalPolicy: undefined, approvedDomains: [], domainApprovals: {} } });
  assert.equal(approvedParticipant(row, { sub: SUB, email: row.email }, NOW), false);
});

function setup(options = {}) {
  const row = { pk: 'USER#' + SUB, cognitoSub: SUB, participantId: 'participant-123', email: 'member@example.test',
    name: 'Member', active: true, suspended: false, reviewStatus: 'approved', accessVersion: 1,
    enrolmentStatus: 'not_invited', approvalPolicy: 'individual-domains-v1',
    approvedDomains: ['conveyancing'], domainApprovals: { conveyancing: { status: 'approved' } }, ...options.row };
  const emailKey = 'EMAIL#' + createHash('sha256').update(row.email).digest('hex');
  const imported = options.imported || options.legacy;
  const sourceKey = options.legacy ? 'IMPORT#legacy-auth0-allowlist-2026-09-08#' + emailKey.slice(6)
    : imported ? 'IMPORT#hubspot-existing-contacts-2026-09-08#123' : 'CRM#CONTACT#123';
  const rows = new Map([[row.pk, row], [emailKey, { pk: emailKey, participantId: row.participantId,
    [imported ? 'importKey' : 'approvalKey']: sourceKey }], [sourceKey, { pk: sourceKey,
    participantId: row.participantId, email: row.email, cognitoSub: SUB, phase: 'complete' }]]);
  const commands = [], fetches = [];
  class GetItemCommand { constructor(input) { this.input = input; } }
  class TransactWriteItemsCommand extends GetItemCommand {}
  class DeleteItemCommand extends GetItemCommand {}
  const store = createStore(CONFIG, { loadAws: async () => ({ GetItemCommand, TransactWriteItemsCommand, DeleteItemCommand }),
    client: { async send(command) {
      const input = command.input; commands.push(input);
      if (input.TransactItems) {
        if (options.race) throw Object.assign(new Error('Approval changed'), { name: 'TransactionCanceledException' });
        for (const op of input.TransactItems) {
          if (op.Put) { const item = decode(op.Put.Item); rows.set(item.pk, item); }
          if (op.Update) {
            row.enrolmentStatus = 'complete';
            if (op.Update.ExpressionAttributeValues[':auth0Key']) {
              row.auth0BindingKey = op.Update.ExpressionAttributeValues[':auth0Key'].S;
            }
          }
        }
        return {};
      }
      const key = input.Key.pk.S;
      if (command instanceof DeleteItemCommand) { rows.delete(key); return {}; }
      assert.equal(input.ConsistentRead, true);
      return { Item: rows.has(key) ? encode(rows.get(key)).M : undefined };
    } } });
  let nonce, count = 0;
  const handler = createHandler({ config: { ...CONFIG, ...options.config }, store, now: () => NOW * 1000,
    randomBytes: () => Buffer.alloc(32, ++count), fetch: async (url, init) => {
      fetches.push({ url, init });
      if (url === ISSUER + '.well-known/jwks.json') return { ok: true, json: async () => ({ keys: [jwk] }) };
      assert.equal(url, ISSUER + 'oauth/token');
      const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: jwk.kid })).toString('base64url');
      const claims = { iss: ISSUER, aud: CONFIG.clientId, sub: SUBJECT, email: row.email,
        email_verified: true, nonce, iat: NOW, exp: NOW + 3600, ...options.claims };
      const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
      const input = header + '.' + body;
      return { ok: true, json: async () => ({ id_token: input + '.' + sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url') }) };
    } });
  async function login(provider) {
    const result = await handler(request('/_auth/login', { return: '/programme', ...(provider ? { provider } : {}) }));
    nonce = oauthTransaction(result).data.nonce; return result;
  }
  async function callback(provider) {
    const started = await login(provider);
    return handler(request('/_auth/callback', { state: oauthTransaction(started).state, code: 'one-use-provider-code' }, started.cookies));
  }
  return { row, rows, emailKey, sourceKey, commands, fetches, handler, login, callback };
}

test('Auth0 uses the public PKCE client and offers every configured social connection', async () => {
  const s = setup(), result = await s.login(), url = new URL(result.headers.location);
  assert.equal(url.origin + url.pathname, ISSUER + 'authorize');
  assert.equal(url.searchParams.get('connection'), null);
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), 'openid email profile');
  const transaction = oauthTransaction(result);
  assert.equal(url.searchParams.get('state'), transaction.state);
  assert.equal(url.searchParams.get('nonce'), transaction.data.nonce);
  assert.equal(s.commands.length, 0);
  assert.deepEqual(socialProviders.map(({ key, connection }) => [key, connection]), [
    ['google', 'google-oauth2'], ['github', 'github'], ['apple', 'apple'],
    ['facebook', 'facebook'], ['linkedin', 'linkedin'], ['microsoft', 'windowslive'],
  ]);
  for (const provider of socialProviders) {
    const direct = await s.login(provider.key), directUrl = new URL(direct.headers.location);
    assert.equal(directUrl.searchParams.get('connection'), provider.connection);
    assert.equal(directUrl.searchParams.get('connection_scope'), provider.connectionScope ?? null);
    assert.equal(oauthTransaction(direct).data.provider, provider.key);
  }
});

test('provider retry preserves every selected connection', async () => {
  for (const provider of socialProviders) {
    const s = setup({ claims: { email: null } });
    const started = await s.login(provider.key), transaction = oauthTransaction(started);
    const failed = await s.handler(request('/_auth/callback', { state: transaction.state, code: 'one-use-provider-code' }, started.cookies));
    assert.equal(failed.statusCode, 401);
    assert.match(failed.body, new RegExp(`provider=${provider.key}`, 'u'));
  }
  const s = setup();
  assert.equal((await s.handler(request('/_auth/login', { provider: 'unknown' }))).statusCode, 400);
});

test('first Auth0 enrolment atomically binds a unique eligible participant and issues only an opaque session', async () => {
  for (const source of [{}, { imported: true }, { legacy: true }]) {
    const s = setup(source), result = await s.callback();
    assert.equal(result.statusCode, 302);
    assert.equal(result.headers.location, CONFIG.siteOrigin + '/programme');
    const transaction = s.commands.find(c => c.TransactItems).TransactItems;
    assert.equal(transaction.length, 5);
    assert.match(transaction[0].Update.ConditionExpression, /attribute_not_exists\(#auth0Key\)/u);
    assert.match(transaction[0].Update.ConditionExpression, /#version = :version/u);
    assert.equal(transaction[1].Put.ConditionExpression, 'attribute_not_exists(pk)');
    assert.equal(transaction[2].ConditionCheck.Key.pk.S, s.emailKey);
    assert.equal(transaction[3].ConditionCheck.Key.pk.S, s.sourceKey);
    assert.equal(transaction[0].Update.ExpressionAttributeValues[':verifiedSub'].S, SUBJECT);
    assert.equal(transaction[0].Update.ExpressionAttributeNames['#verifiedSub'], 'verifiedSubject');
    assert.match(cookie(result, '__Host-opda_session'), /^[A-Za-z0-9_-]{43}$/u);
    assert.doesNotMatch(JSON.stringify(result), /id_token|access_token|refresh_token/u);
    assert.equal((await s.handler(request('/_auth/me', {}, result.cookies))).statusCode, 200);
    s.commands.length = 0;
    assert.equal((await s.callback()).statusCode, 302);
    assert.ok(!s.commands.some(c => c.Key?.pk.S.startsWith('EMAIL#')), 'repeat login resolves immutable issuer/subject, not email');
    s.row.domainApprovals.conveyancing.status = 'withdrawn';
    assert.equal((await s.handler(request('/_auth/me', {}, result.cookies))).statusCode, 401);
    assert.equal((await s.callback()).statusCode, 401);
  }
});

test('Auth0 cannot claim missing, ambiguous, ineligible or concurrently withdrawn participants', async () => {
  for (const modify of [s => s.rows.delete(s.emailKey),
    s => { s.row.approvedDomains = []; s.row.domainApprovals = {}; }, s => s.row.email = 'changed@example.test',
    s => s.rows.get(s.emailKey).participantId = 'different-participant']) {
    const s = setup(); modify(s);
    assert.equal((await s.callback()).statusCode, 401);
    assert.equal(s.commands.filter(c => c.TransactItems).length, 0);
  }
  assert.equal((await setup({ race: true }).callback()).statusCode, 401);
});

test('new Auth0 bindings accept the signed provider email without provider-specific verification claims', async () => {
  for (const email_verified of [false, 'true', null, undefined]) {
    const s = setup({ claims: { email_verified } });
    assert.equal((await s.callback('github')).statusCode, 302);
    assert.equal(s.commands.filter(c => c.TransactItems).length, 1);
  }
});

test('new Auth0 bindings still require a signed issuer, audience, nonce, email and subject', async () => {
  for (const claims of [{ email: null }, { iss: 'https://other.auth0.com/' }, { aud: 'another-client' }, { exp: NOW },
    { nonce: 'wrong' }, { sub: '' }, { sub: 'bad\nsubject' }, { token_use: 'access' }]) {
    const s = setup({ claims });
    assert.equal((await s.callback()).statusCode, 401);
    assert.equal(s.commands.filter(c => c.TransactItems).length, 0);
  }
});

test('a second Auth0 social provider can use the same approved or allowlisted website account', async () => {
  for (const row of [{}, { approvedDomains: [], domainApprovals: {}, websiteAllowlist: true }]) {
    const claims = {};
    const s = setup({ claims, row });
    const google = await s.callback();
    assert.equal(google.statusCode, 302);
    const originalKey = s.row.auth0BindingKey;
    claims.sub = 'github|311648';
    claims.email_verified = false;
    const github = await s.callback('github');
    assert.equal(github.statusCode, 302);
    assert.equal(s.row.auth0BindingKey, originalKey);
    assert.equal((await s.handler(request('/_auth/me', {}, github.cookies))).statusCode, 200);
    assert.equal((await s.handler(request('/_auth/me', {}, google.cookies))).statusCode, 200);
  }
});

test('every social provider uses the same first-binding path for approved and allowlist-only users', async () => {
  for (const eligible of [
    {},
    { approvedDomains: [], domainApprovals: {}, websiteAllowlist: true },
  ]) for (const [index, provider] of socialProviders.entries()) {
    const subject = `${provider.connection}|subject-${index}`;
    const s = setup({ claims: { sub: subject, email_verified: false }, row: eligible });
    assert.equal((await s.callback(provider.key)).statusCode, 302, provider.key);
    const key = identityKey({ issuer: ISSUER, sub: subject });
    assert.equal(s.rows.get(key).participantId, s.row.participantId, provider.key);
  }
});

test('an existing issuer/subject binding survives provider email changes but cannot move through corrupt records', async () => {
  const claims = {}, s = setup({ claims }), key = identityKey({ issuer: ISSUER, sub: SUBJECT });
  assert.equal((await s.callback()).statusCode, 302);
  for (const email of ['different@example.test', null]) {
    claims.email = email;
    const result = await s.callback();
    assert.equal(result.statusCode, 302);
    const token = cookie(result, '__Host-opda_session');
    const saved = s.rows.get('SESSION#' + createHash('sha256').update(token).digest('hex'));
    assert.equal(saved.email, s.row.email);
    assert.equal(saved.auth0BindingKey, s.row.auth0BindingKey);
    assert.equal(approvedParticipant(s.row, saved, NOW), true);
    const me = await s.handler(request('/_auth/me', {}, result.cookies));
    assert.equal(me.statusCode, 200, me.body);
    assert.equal(JSON.parse(me.body).email, s.row.email);
  }
  s.rows.get(key).subject = 'windowslive|different-subject';
  assert.equal((await s.callback()).statusCode, 401);
});

test('Auth0 logout removes the opaque session and returns through the existing registered logout URL', async () => {
  const s = setup(), signedIn = await s.callback();
  const response = await s.handler(request('/_auth/logout', {}, signedIn.cookies));
  const url = new URL(response.headers.location);
  assert.equal(url.origin + url.pathname, ISSUER + 'v2/logout');
  assert.equal(url.searchParams.get('returnTo'), CONFIG.siteOrigin + '/');
  assert.equal((await s.handler(request('/_auth/me', {}, signedIn.cookies))).statusCode, 401);
});
