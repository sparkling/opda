import assert from 'node:assert/strict';
import test from 'node:test';
import { createHandler } from '../config/aws/comments-api/index.mjs';
import { sessionKey } from '../config/aws/auth-session/store.mjs';
import { createHash, createHmac } from 'node:crypto';
import { createArtalkClient } from '../config/aws/comments-api/artalk.mjs';

const NOW = 1_800_000_000, TOKEN = Buffer.alloc(32, 3).toString('base64url');
const syntheticEmail = id => createHash('sha256').update(id).digest('hex') + '@members.comments.opda.org.uk';
const query = new URLSearchParams({ page_key: '/retained-thread', site_name: 'OPDA', limit: '20', offset: '0', flat_mode: 'true', sort_by: 'date_asc' }).toString();
const entry = { id: 1, rid: 0, nick: 'Member', content: 'A question', date: '2026-09-09',
  email: 'private@example.test', ip: '10.42.0.2', user_id: 9, is_pending: false };
function setup() {
  const row = { pk: 'USER#member-1', cognitoSub: 'member-1', participantId: 'p1', email: 'member@example.test', name: 'Current Member',
    active: true, suspended: false, reviewStatus: 'approved', enrolmentStatus: 'complete', accessVersion: 2,
    approvedDomains: ['conveyancing'], domainApprovals: { conveyancing: { status: 'approved' } } };
  const saved = { pk: sessionKey(TOKEN), sub: row.cognitoSub, participantId: row.participantId, email: row.email,
    accessVersion: 2, createdAt: NOW, expiresAt: NOW + 3600 };
  const calls = [], state = { row, saved, fail: false };
  const store = { getSession: async key => {
    if (state.fail) throw new Error('Storage unavailable'); return key === saved.pk ? state.saved : null;
  }, getParticipant: async () => state.row };
  const comments = {
    list: async options => { calls.push(['list', options]); return { count: 1, comments: [entry] }; },
    create: async (body, identity) => { calls.push(['create', body, identity]); return entry; },
  };
  const handler = createHandler({ store, comments, now: () => NOW * 1000 });
  const event = (overrides = {}) => ({ rawPath: '/api/v2/comments', rawQueryString: query,
    cookies: ['__Host-opda_session=' + TOKEN], requestContext: { http: { method: 'GET' } }, headers: {}, ...overrides });
  const post = (body = { page_key: '/retained-thread', content: ' A suggestion ', rid: 0 }, changes = {}) => event({
    rawQueryString: '', requestContext: { http: { method: 'POST' } },
    headers: { origin: 'https://opda.org.uk', 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' },
    body: JSON.stringify(body), ...changes,
  });
  return { handler, event, post, calls, row, saved, state };
}

test('authenticated reads preserve thread keys while disclosing only safe comment fields', async () => {
  const s = setup(), response = await s.handler(s.event());
  assert.equal(response.statusCode, 200);
  assert.match(response.headers['cache-control'], /no-store/u);
  const data = JSON.parse(response.body).data;
  assert.deepEqual(data.viewer, { name: 'Current Member' });
  assert.equal(data.comments[0].content, entry.content);
  for (const key of ['email', 'ip', 'user_id', 'token']) assert.equal(data.comments[0][key], undefined);
  assert.equal(s.calls[0][1].page_key, '/retained-thread');
});

test('post identity is derived only from current approved membership, not the request', async () => {
  const s = setup(), response = await s.handler(s.post());
  assert.equal(response.statusCode, 200);
  assert.deepEqual(s.calls[0][1], { page_key: '/retained-thread', content: 'A suggestion', rid: 0 });
  assert.deepEqual(s.calls[0][2], { participantId: 'p1', name: 'Current Member', email: 'member@example.test' });
  assert.equal(JSON.parse(response.body).data.ip, undefined);
});

test('missing, duplicate, expired, withdrawn and stale sessions never reach Artalk', async () => {
  for (const mutate of [s => s.state.saved = null, s => s.row.active = false, s => s.row.suspended = true,
    s => s.row.domainApprovals.conveyancing.status = 'withdrawn', s => s.row.accessVersion++,
    s => s.saved.expiresAt = NOW, s => s.state.row = null]) {
    const s = setup(); mutate(s);
    for (const request of [s.event(), s.post()]) assert.equal((await s.handler(request)).statusCode, 401);
    assert.equal(s.calls.length, 0);
  }
  const s = setup();
  for (const cookies of [[], ['__Host-opda_session=forged'], ['__Host-opda_session=' + TOKEN, '__Host-opda_session=' + TOKEN]]) {
    assert.equal((await s.handler(s.event({ cookies }))).statusCode, 401);
  }
  s.state.fail = true;
  assert.equal((await s.handler(s.event())).statusCode, 503);
  assert.equal(s.calls.length, 0);
});

test('cross-site, missing-origin and non-JSON writes are rejected before storage work', async () => {
  const s = setup();
  for (const headers of [{}, { origin: 'null', 'content-type': 'application/json' },
    { origin: 'https://evil.test', 'content-type': 'application/json' },
    { origin: 'https://opda.org.uk', 'content-type': 'text/plain' },
    { origin: 'https://opda.org.uk', 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' }]) {
    assert.ok([403, 415].includes((await s.handler(s.post(undefined, { headers }))).statusCode));
  }
  assert.equal(s.calls.length, 0);
});

test('unknown paths, methods, extra identity fields and Artalk query capabilities stay closed', async () => {
  const s = setup();
  for (const rawPath of ['/api/v2/sso/exchange', '/api/v2/users', '/api/v2/comments/1', '/api/v2/comments/']) {
    assert.equal((await s.handler(s.event({ rawPath }))).statusCode, 404);
  }
  for (const method of ['PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
    assert.equal((await s.handler(s.event({ requestContext: { http: { method } } }))).statusCode, 405);
  }
  for (const suffix of ['&token=old', '&name=other', '&email=other', '&scope=site', '&limit=1', '&%74oken=old']) {
    assert.equal((await s.handler(s.event({ rawQueryString: query + suffix }))).statusCode, 400);
  }
  for (const extra of [{ name: 'Someone else' }, { email: 'other@example.test' }, { token: 'old' }, { is_admin: true }]) {
    assert.equal((await s.handler(s.post({ page_key: '/x', content: 'text', rid: 0, ...extra }))).statusCode, 400);
  }
  assert.equal(s.calls.length, 0);
});

test('bounded input, reply IDs and opaque upstream failures are enforced', async () => {
  const s = setup();
  for (const body of [null, [], { page_key: '//elsewhere', content: 'text' },
    { page_key: '/x', content: ' ' }, { page_key: '/x', content: 'x'.repeat(5001) },
    { page_key: '/x', content: 'text', rid: -1 }, { page_key: '/x', content: 'text', rid: '1' }]) {
    assert.equal((await s.handler(s.post(body))).statusCode, 400);
  }
  assert.equal(s.calls.length, 0);
});

test('private exchange is short-lived and identity-bound, with no provider calls or browser token output', async () => {
  const calls = [], secret = 'ab'.repeat(32);
  const client = createArtalkClient({ origin: 'http://comments-origin.opda.org.uk:23366', key: secret,
    now: () => NOW * 1000, fetch: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify(url.endsWith('/opda/session')
        ? { token: 'server-only-token', user: { id: 9, name: 'Current Member', email: syntheticEmail('p1'), is_admin: false } }
        : entry), { status: 200 });
    } });
  const result = await client.create({ page_key: '/retained-thread', content: 'text', rid: 0 }, { participantId: 'p1', name: 'Current Member' });
  assert.equal(result.id, 1);
  assert.equal(result.token, undefined);
  const { assertion } = JSON.parse(calls[0].options.body);
  const [header, payload, signature] = assertion.split('.');
  assert.equal(signature, createHmac('sha256', Buffer.from(secret, 'hex')).update(header + '.' + payload).digest('base64url'));
  const claims = JSON.parse(Buffer.from(payload, 'base64url'));
  assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url')), { alg: 'HS256', typ: 'JWT' });
  assert.equal(claims.iss, 'opda-comments-gateway'); assert.equal(claims.aud, 'artalk-comments');
  assert.equal(claims.sub, 'p1'); assert.equal(claims.name, 'Current Member');
  assert.equal(claims.iat, NOW); assert.equal(claims.exp, NOW + 15); assert.match(claims.jti, /^[a-f0-9-]{36}$/u);
  assert.equal(calls[1].options.headers.authorization, 'Bearer server-only-token');
  assert.equal(JSON.parse(calls[1].options.body).email, syntheticEmail('p1'));
  assert.ok(calls.every(call => call.url.startsWith('http://comments-origin.opda.org.uk:23366/api/v2/')));
  assert.ok(calls.every(call => call.options.headers.cookie === undefined && call.options.redirect === 'error'));
});

test('private adapter refuses unconfigured origins/keys, administrator sessions and oversized responses', async () => {
  for (const origin of ['https://evil.test', 'http://127.0.0.1:23366', 'http://comments-origin.opda.org.uk:23366/']) {
    assert.throws(() => createArtalkClient({ origin, key: 'ab'.repeat(32) }));
  }
  for (const key of ['', 'short', 'AB'.repeat(32)]) assert.throws(() => createArtalkClient({ origin: 'http://comments-origin.opda.org.uk:23366', key }));
  const options = { origin: 'http://comments-origin.opda.org.uk:23366', key: 'ab'.repeat(32) };
  const admin = createArtalkClient({ ...options, fetch: async () => new Response(JSON.stringify({ token: 'x', user: { id: 1, name: 'Admin', email: 'a@example.test', is_admin: true } })) });
  await assert.rejects(admin.create({}, { participantId: 'p1', name: 'Member' }), /Invalid comment identity/u);
  for (const user of [{ id: 2, name: 'Member', email: syntheticEmail('another-participant'), is_admin: false },
    { id: 2, name: 'Another name', email: syntheticEmail('p1'), is_admin: false }]) {
    let requests = 0;
    const mismatch = createArtalkClient({ ...options, fetch: async () => {
      requests++; return new Response(JSON.stringify({ token: 'x', user }));
    } });
    await assert.rejects(mismatch.create({}, { participantId: 'p1', name: 'Member' }), /Invalid comment identity/u);
    assert.equal(requests, 1, 'a mismatched identity must never create a comment');
  }
  const huge = createArtalkClient({ ...options, fetch: async () => new Response('x'.repeat(2 * 1024 * 1024 + 1)) });
  await assert.rejects(huge.list({}), /too large/u);
});
