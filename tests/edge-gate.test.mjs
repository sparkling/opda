import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
await import('../scripts/package-edge-gate.mjs');
const { createHandler, CONFIG } = await import('../_build/edge-gate/index.mjs');
const { sessionKey } = await import('../_build/edge-gate/store.mjs');
const NOW = 1_800_000_000, SUB = '11111111-2222-3333-4444-555555555555';
const TOKEN = Buffer.alloc(32, 7).toString('base64url');
const event = (uri, { cookie, method = 'GET', host = 'opda.org.uk', querystring = '' } = {}) => ({
  Records: [{ cf: { request: { uri, method, querystring,
    headers: { host: [{ key: 'Host', value: host }], ...(cookie ? { cookie: [{ key: 'Cookie', value: cookie }] } : {}) } } } }],
});
function setup() {
  const row = { pk: 'USER#' + SUB, cognitoSub: SUB, participantId: 'p1', email: 'member@example.test',
    active: true, suspended: false, reviewStatus: 'approved', enrolmentStatus: 'complete', accessVersion: 2,
    approvedDomains: ['conveyancing', 'property-technology'], domainApprovals: {
      conveyancing: { status: 'approved' }, 'property-technology': { status: 'approved' } } };
  const saved = { pk: sessionKey(TOKEN), sub: SUB, participantId: 'p1', email: row.email,
    accessVersion: 2, createdAt: NOW, expiresAt: NOW + 3600 };
  const calls = [], state = { row, saved, fail: false, time: NOW };
  const store = { async getSession(key) {
    calls.push(['session', key]); if (state.fail) throw new Error('Unavailable');
    return key === saved.pk ? state.saved : null;
  }, async getParticipant(sub) { calls.push(['participant', sub]); return state.row; } };
  const handler = createHandler({ store, now: () => state.time * 1000 });
  return { handler, state, calls, row, saved };
}

test('the edge package uses exactly the regional session and approval implementation', async () => {
  for (const file of ['identity.mjs', 'session.mjs', 'store.mjs']) {
    assert.ok((await readFile(new URL('../_build/edge-gate/' + file, import.meta.url)))
      .equals(await readFile(new URL('../config/aws/auth-session/' + file, import.meta.url))));
  }
  assert.equal(CONFIG.region, 'eu-west-2');
});

test('anonymous root shows only the original holding page and its one illustration', async () => {
  const s = setup();
  for (const uri of ['/', '/index.html', '/under-development', '/under-development/']) {
    assert.equal((await s.handler(event(uri))).uri, '/under-development/index.html');
  }
  assert.equal((await s.handler(event('/coming-soon.jpg'))).uri, '/coming-soon.jpg');
  assert.equal((await s.handler(event('/coming-soon.jpg', { method: 'POST' }))).status, '401');
  assert.equal(s.calls.length, 0);
});

test('all content, downloads, scripts, search data and API routes are gated, not just HTML', async () => {
  const s = setup();
  for (const uri of ['/programme', '/join', '/_astro/chunk.js', '/images/private.webp', '/data/site-search-index.json',
    '/resources/schema.ttl', '/sitemap-index.xml', '/robots.txt', '/404.html', '/api/v2/comments',
    '/api/working-group-interest', '/api/newsletter-subscription', '/_auth/not-a-route']) {
    for (const cookie of [undefined, '__Host-opda_session=forged', 'opda_id=legacy-token',
      '__Host-opda_session=' + TOKEN + '; __Host-opda_session=' + TOKEN]) {
      const result = await s.handler(event(uri, { cookie }));
      assert.equal(result.status, uri.startsWith('/api/v2/') ? '401' : '302', uri);
      if (!uri.startsWith('/api/v2/')) assert.ok(result.headers.location[0].value.startsWith('/_auth/login?return='));
      assert.equal(result.uri, undefined);
      assert.match(result.headers['cache-control'][0].value, /no-store/u);
    }
  }
  assert.equal(s.calls.length, 0, 'no database cost for absent, malformed or ambiguous sessions');
});

test('only exact GET auth routes pass through without an existing session', async () => {
  const s = setup();
  for (const route of ['login', 'callback', 'me', 'logout']) {
    assert.equal((await s.handler(event('/_auth/' + route))).uri, '/_auth/' + route);
    assert.equal((await s.handler(event('/_auth/' + route, { method: 'POST' }))).status, '405');
    assert.equal((await s.handler(event('/_auth/' + route + '/'))).status, '302');
  }
  assert.equal(s.calls.length, 0);
});

test('workspace entry exposes only its exact self-authenticated methods', async () => {
  const s = setup();
  assert.equal((await s.handler(event('/_auth/workspace'))).uri, '/_auth/workspace');
  assert.equal((await s.handler(event('/_auth/workspace', { method: 'POST' }))).uri, '/_auth/workspace');
  assert.equal((await s.handler(event('/_auth/workspace/continue'))).uri, '/_auth/workspace/continue');
  for (const method of ['PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    assert.equal((await s.handler(event('/_auth/workspace', { method }))).status, '405', method);
    assert.equal((await s.handler(event('/_auth/workspace/continue', { method }))).status, '405', method);
  }
  for (const uri of ['/_auth/workspaces', '/_auth/workspace/', '/_auth/workspace/continue/']) {
    assert.equal((await s.handler(event(uri))).status, '302', uri);
  }
  assert.equal(s.calls.length, 0);
});

test('alternate distribution hosts and encoded/dot paths cannot bypass the gate', async () => {
  const s = setup();
  assert.equal((await s.handler(event('/', { host: 'example.cloudfront.net' }))).status, '403');
  for (const uri of ['//programme', '/./programme', '/x/../programme', '/%2e%2e/programme', '/_auth%2flogin', '/x\\programme']) {
    assert.equal((await s.handler(event(uri))).status, '400');
  }
});

test('approved content is rewritten only after session/participant checks on every request', async () => {
  const s = setup(), options = { cookie: '__Host-opda_session=' + TOKEN };
  for (const [uri, expected] of [['/', '/index.html'], ['/programme', '/programme/index.html'],
    ['/resources/schema.ttl', '/schema.ttl'], ['/api/v2/comments', '/api/v2/comments']]) {
    assert.equal((await s.handler(event(uri, options))).uri, expected);
  }
  assert.equal(s.calls.length, 8, 'no authorization-result caching across requests');
  s.row.domainApprovals.conveyancing.status = 'withdrawn';
  assert.equal((await s.handler(event('/programme', options))).uri, '/programme/index.html');
  s.row.domainApprovals['property-technology'].status = 'withdrawn';
  assert.equal((await s.handler(event('/programme', options))).status, '302');
  s.row.domainApprovals.conveyancing.status = 'approved'; s.row.accessVersion++;
  assert.equal((await s.handler(event('/programme', options))).status, '302', 'reapproval cannot revive an old cookie');
});

test('expiry, logout, unknown cookies, missing membership and storage outages fail closed', async () => {
  for (const change of [s => s.state.saved = null, s => s.state.row = null, s => s.row.active = false,
    s => s.row.suspended = true, s => s.row.approvedDomains = [], s => s.state.time += 3600,
    s => s.row.enrolmentStatus = 'not_invited', s => s.saved.participantId = 'other']) {
    const s = setup(); change(s);
    assert.equal((await s.handler(event('/programme', { cookie: '__Host-opda_session=' + TOKEN }))).status, '302');
  }
  const s = setup(); s.state.fail = true;
  assert.equal((await s.handler(event('/programme', { cookie: '__Host-opda_session=' + TOKEN }))).status, '503');
  assert.equal((await s.handler(event('/api/v2/comments', { method: 'POST' }))).status, '401');
});

test('deleted or erased accounts cannot retain access through an otherwise valid session', async () => {
  for (const field of ['deletedAt', 'erasedAt']) {
    const s = setup(); s.row[field] = NOW;
    assert.equal((await s.handler(event('/programme', { cookie: '__Host-opda_session=' + TOKEN }))).status, '302');
  }
});
