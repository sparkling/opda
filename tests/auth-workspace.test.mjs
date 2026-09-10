import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { createHandler } from '../config/aws/auth-session/index.mjs';
import { sessionKey } from '../config/aws/auth-session/store.mjs';
import { WORKSPACE_GROUPS, approvedWorkspaceGroups, renderWorkspacePage, validateAccessResult } from '../config/aws/auth-session/workspace.mjs';
import { WORKSPACES } from '../src/approval-onboarding/settings.mjs';

const NOW = 1_800_000_000, TOKEN = 'A'.repeat(43), SUB = '11111111-2222-3333-4444-555555555555';
const CONFIG = { issuer: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_example',
  cognitoDomain: 'https://opda-test.auth.eu-west-2.amazoncognito.com', clientId: 'client', siteOrigin: 'https://opda.org.uk',
  participantsTableName: 'participants-test', sessionsTableName: 'sessions-test' };
const participant = { pk: `USER#${SUB}`, participantId: 'participant-1', cognitoSub: SUB, email: 'member@example.test',
  name: 'Member', reviewStatus: 'approved', active: true, suspended: false, enrolmentStatus: 'complete', accessVersion: 3,
  approvedDomains: ['conveyancing', 'estate-agency'], domainApprovals: { conveyancing: { status: 'approved' }, 'estate-agency': { status: 'approved' } } };

function event(path, { method = 'GET', query = {}, body, headers = {}, cookies = [`__Host-opda_session=${TOKEN}`] } = {}) {
  return { rawPath: path, queryStringParameters: query, body, headers, cookies, requestContext: { http: { method } } };
}
function fixture(runtime = async ({ groupId }) => ({ status: 'ready', location: WORKSPACE_GROUPS[groupId].teamUrl })) {
  const calls = [];
  const store = { async getSession(key) { return key === sessionKey(TOKEN) ? { pk: key, sub: SUB, email: participant.email,
    participantId: participant.participantId, accessVersion: participant.accessVersion, createdAt: NOW - 10, expiresAt: NOW + 300 } : null; },
  async getParticipant() { return structuredClone(participant); } };
  const handler = createHandler({ config: CONFIG, store, now: () => NOW * 1000,
    workspaceRuntime: async input => { calls.push(input); return runtime(input); } });
  return { handler, calls };
}

function runPageScript(html, { stored, storageError = false, pathname = '/_auth/workspace' } = {}) {
  const script = html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/u)?.[1];
  assert.ok(script);
  const form = { group: { value: '' }, phase: { value: 'open' }, submits: 0, requestSubmit() { this.submits += 1; } };
  const storage = { getItem: () => stored === undefined ? null : JSON.stringify(stored), setItem: () => { if (storageError) throw Error('blocked'); } };
  vm.runInNewContext(script, { Date, URLSearchParams, location: { pathname, search: '' }, sessionStorage: storage,
    document: { querySelector: () => form } });
  return form;
}

test('workspace map exposes only the six approved domains and no personal destination', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(WORKSPACE_GROUPS).map(([id, value]) => [id, value.teamId])),
    Object.fromEntries(Object.entries(WORKSPACES).map(([id, value]) => [id, value.teamId])));
  assert.deepEqual(approvedWorkspaceGroups(participant), ['conveyancing', 'estate-agency']);
  const html = renderWorkspacePage({ groups: ['conveyancing'], nonce: 'test' });
  assert.match(html, /sessionStorage/);
  assert.doesNotMatch(html, /login\.microsoftonline\.com|redemption|member@example/u);
});

test('workspace page scripts submit one correct per-tab continuation, expire safely, and do not loop on retry/storage failure', () => {
  const now = Date.now();
  const initial = runPageScript(renderWorkspacePage({ groups: ['conveyancing'], mode: 'initial', selectedGroup: 'conveyancing', nonce: 'test' }));
  assert.equal(initial.submits, 1); assert.equal(initial.group.value, 'conveyancing');
  const returned = runPageScript(renderWorkspacePage({ groups: ['conveyancing', 'estate-agency'], mode: 'return', nonce: 'test' }),
    { stored: { groupId: 'estate-agency', expiresAt: now + 1_800_000 }, pathname: '/_auth/workspace/continue' });
  assert.equal(returned.submits, 1); assert.equal(returned.group.value, 'estate-agency');
  const expired = runPageScript(renderWorkspacePage({ groups: ['conveyancing'], mode: 'return', nonce: 'test' }),
    { stored: { groupId: 'conveyancing', expiresAt: now - 1 }, pathname: '/_auth/workspace/continue' });
  assert.equal(expired.submits, 0);
  const retry = runPageScript(renderWorkspacePage({ groups: ['conveyancing'], mode: 'retry', selectedGroup: 'conveyancing', message: 'Try again', nonce: 'test' }));
  assert.equal(retry.submits, 0);
  const returnRetryHtml = renderWorkspacePage({ groups: ['conveyancing'], mode: 'retry', phase: 'return', selectedGroup: 'conveyancing', nonce: 'test' });
  assert.match(returnRetryHtml, /name="phase" value="return"/u);
  assert.equal(runPageScript(returnRetryHtml).submits, 0);
  const storageFailure = runPageScript(renderWorkspacePage({ groups: ['conveyancing'], mode: 'initial', selectedGroup: 'conveyancing', nonce: 'test' }), { storageError: true });
  assert.equal(storageFailure.submits, 0);
});

test('unauthenticated group entry starts the existing login flow with the exact same-origin return route', async () => {
  const { handler } = await fixture();
  const response = await handler(event('/_auth/workspace', { query: { group: 'conveyancing' }, cookies: [] }));
  assert.equal(response.statusCode, 302);
  const location = new URL(response.headers.location);
  const state = location.searchParams.get('state');
  const cookie = response.cookies.find(value => value.startsWith(`__Host-opda_oauth_${state}=`));
  const transaction = JSON.parse(Buffer.from(cookie.split('=', 2)[1].split(';', 1)[0], 'base64url').toString());
  assert.equal(transaction.returnPath, '/_auth/workspace?group=conveyancing');
});

test('GET requires current approval and POST enforces Origin, same-origin fetch and exact form fields', async () => {
  const f = await fixture();
  const page = await f.handler(event('/_auth/workspace', { query: { group: 'conveyancing' } }));
  assert.equal(page.statusCode, 200);
  assert.match(page.headers['content-security-policy'], /script-src 'nonce-/u);
  assert.equal(page.headers['x-robots-tag'], 'noindex, noarchive');
  const opened = await f.handler(event('/_auth/workspace', { method: 'POST', body: 'group=conveyancing&phase=open',
    headers: { origin: 'https://opda.org.uk', 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' } }));
  assert.equal(opened.statusCode, 303);
  assert.equal(f.calls[0].phase, 'open');
  for (const headers of [{ origin: 'https://evil.example', 'content-type': 'application/x-www-form-urlencoded' },
    { origin: 'https://opda.org.uk', 'sec-fetch-site': 'cross-site', 'content-type': 'application/x-www-form-urlencoded' }]) {
    assert.equal((await f.handler(event('/_auth/workspace', { method: 'POST', body: 'group=conveyancing&phase=open', headers }))).statusCode, 403);
  }
  assert.equal((await f.handler(event('/_auth/workspace', { method: 'POST', body: 'group=conveyancing&phase=open&phase=open', headers: { origin: 'https://opda.org.uk', 'content-type': 'application/x-www-form-urlencoded' } }))).statusCode, 400);
});

test('POST returns honest pending/review/unavailable states and rejects duplicate session cookies', async () => {
  for (const status of ['pending', 'review', 'unavailable', 'denied']) {
    const f = await fixture(async () => ({ status }));
    const response = await f.handler(event('/_auth/workspace', { method: 'POST', body: 'group=conveyancing&phase=return',
      headers: { origin: 'https://opda.org.uk', 'content-type': 'application/x-www-form-urlencoded' } }));
    assert.equal(response.statusCode, status === 'unavailable' ? 503 : status === 'denied' ? 403 : 409);
    assert.doesNotMatch(response.body, /redemption|login\.microsoftonline/u);
    if (status === 'pending') assert.match(response.body, /Access is still being prepared/);
    if (status !== 'denied') assert.match(response.body, /Try again/);
  }
  const f = await fixture();
  assert.equal((await f.handler(event('/_auth/workspace', { method: 'POST', body: 'group=conveyancing&phase=open',
    headers: { origin: 'https://opda.org.uk', 'content-type': 'application/x-www-form-urlencoded' }, cookies: [`__Host-opda_session=${TOKEN}`, `__Host-opda_session=${TOKEN}`] }))).statusCode, 403);
  for (const method of ['PUT', 'PATCH', 'DELETE']) {
    assert.equal((await f.handler(event('/_auth/workspace', { method }))).statusCode, 405);
    assert.equal((await f.handler(event('/_auth/workspace/continue', { method }))).statusCode, 405);
  }
});

test('POST denies a runtime result when current approval changes during invocation', async () => {
  const original = participant.domainApprovals.conveyancing.status;
  const f = await fixture(async () => {
    participant.domainApprovals.conveyancing.status = 'withdrawn';
    return { status: 'ready', location: WORKSPACE_GROUPS.conveyancing.teamUrl };
  });
  try {
    const response = await f.handler(event('/_auth/workspace', { method: 'POST', body: 'group=conveyancing&phase=return',
      headers: { origin: 'https://opda.org.uk', 'content-type': 'application/x-www-form-urlencoded' } }));
    assert.equal(response.statusCode, 403);
    assert.equal(response.headers.location, undefined);
  } finally {
    participant.domainApprovals.conveyancing.status = original;
  }
});

test('access result validation only accepts exact Team destinations or tenant-pinned Microsoft redemption URLs', () => {
  assert.equal(validateAccessResult({ status: 'ready', location: WORKSPACE_GROUPS.conveyancing.teamUrl }, 'conveyancing').status, 'ready');
  assert.throws(() => validateAccessResult({ status: 'ready', location: 'https://evil.example/' }, 'conveyancing'));
  assert.throws(() => validateAccessResult({ status: 'ready', location: WORKSPACE_GROUPS.conveyancing.teamUrl.replace('https:', 'http:') }, 'conveyancing'));
  for (const location of [
    'https://login.microsoftonline.com/redeem?tenant=143540d4-4fbc-4005-882a-29656cd01a36&ticket=x',
    'https://login.microsoftonline.com/redeem/?rd=' + encodeURIComponent('https://invitations.microsoft.com/redeem?tenant=143540d4-4fbc-4005-882a-29656cd01a36&ticket=x&user=11111111-2222-4333-8444-555555555555'),
  ]) assert.equal(validateAccessResult({ status: 'redeem', location }, 'conveyancing').status, 'redeem');
  assert.throws(() => validateAccessResult({ status: 'redeem', location: 'https://login.microsoftonline.com/redeem/?tenant=wrong&ticket=x' }, 'conveyancing'));
  assert.throws(() => validateAccessResult({ status: 'redeem', location: 'https://login.microsoftonline.com/redeem/?rd=https%3A%2F%2Fevil.example%2Fredeem%3Fticket%3Dx' }, 'conveyancing'));
  assert.throws(() => validateAccessResult({ status: 'redeem', location: 'https://login.microsoftonline.com/redeem/?rd=' + encodeURIComponent('https://invitations.microsoft.com/redeem?tenant=143540d4-4fbc-4005-882a-29656cd01a36&ticket=x&user=not-a-guid') }, 'conveyancing'));
});
