import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import test from 'node:test';
import { createHandler } from '../config/aws/auth-session/index.mjs';
import { createStore, identityKey } from '../config/aws/auth-session/store.mjs';
import { approvedParticipant } from '../config/aws/auth-session/identity.mjs';

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
          if (op.Update) { row.enrolmentStatus = 'complete'; row.auth0BindingKey = op.Update.ExpressionAttributeValues[':auth0Key'].S; }
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
  async function login() {
    const result = await handler(request('/_auth/login', { return: '/programme' }));
    nonce = oauthTransaction(result).data.nonce; return result;
  }
  async function callback() {
    const started = await login();
    return handler(request('/_auth/callback', { state: oauthTransaction(started).state, code: 'one-use-provider-code' }, started.cookies));
  }
  return { row, rows, emailKey, sourceKey, commands, fetches, handler, login, callback };
}

test('Auth0 uses the existing public PKCE client and all enabled Universal Login connections', async () => {
  const s = setup(), result = await s.login(), url = new URL(result.headers.location);
  assert.equal(url.origin + url.pathname, ISSUER + 'authorize');
  assert.equal(url.searchParams.get('connection'), null, 'do not force email-only or one social provider');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), 'openid email profile');
  const transaction = oauthTransaction(result);
  assert.equal(url.searchParams.get('state'), transaction.state);
  assert.equal(url.searchParams.get('nonce'), transaction.data.nonce);
  assert.equal(s.commands.length, 0);
});

test('verified first Auth0 enrolment atomically binds a unique reviewed participant and issues only an opaque session', async () => {
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

test('Auth0 cannot claim missing, ambiguous, unapproved, already-bound or concurrently withdrawn participants', async () => {
  for (const modify of [s => s.rows.delete(s.emailKey), s => s.row.active = false,
    s => s.row.approvedDomains = [], s => s.row.email = 'changed@example.test',
    s => s.rows.get(s.emailKey).participantId = 'different-participant',
    s => s.row.auth0BindingKey = 'IDENTITY#another-provider']) {
    const s = setup(); modify(s);
    assert.equal((await s.callback()).statusCode, 401);
    assert.equal(s.commands.filter(c => c.TransactItems).length, 0);
  }
  assert.equal((await setup({ race: true }).callback()).statusCode, 401);
});

test('Auth0 tokens require verified email, signature-bound issuer/audience/nonce and nonempty subject', async () => {
  for (const claims of [{ email_verified: false }, { email_verified: 'true' }, { email_verified: null },
    { iss: 'https://other.auth0.com/' }, { aud: 'another-client' }, { exp: NOW },
    { nonce: 'wrong' }, { sub: '' }, { sub: 'bad\nsubject' }, { token_use: 'access' }]) {
    const s = setup({ claims });
    assert.equal((await s.callback()).statusCode, 401);
    assert.equal(s.commands.length, 0);
  }
});

test('an existing issuer/subject binding cannot be moved by a changed email or corrupt subject record', async () => {
  const s = setup(), key = identityKey({ issuer: ISSUER, sub: SUBJECT });
  await s.callback();
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
