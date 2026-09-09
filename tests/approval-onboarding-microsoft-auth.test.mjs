import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { X509Certificate, createHash, verify } from 'node:crypto';
import { createMicrosoftClient, MICROSOFT_CLIENT_ID, GRAPH_ORIGIN, SHAREPOINT_ORIGIN } from '../src/approval-onboarding/microsoft-auth.mjs';
import { OPDA_TENANT_ID } from '../src/approval-onboarding/invitation.mjs';
import { WORKING_GROUPS } from '../src/agents/working-group-inbox/domain.mjs';

const directory = mkdtempSync(join(tmpdir(), 'opda-test-certificate-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-sha256', '-nodes', '-days', '1',
  '-subj', '/CN=Synthetic test only', '-keyout', join(directory, 'key.pem'), '-out', join(directory, 'cert.pem')], { stdio: 'ignore' });
const certificatePem = readFileSync(join(directory, 'cert.pem'), 'utf8');
const certificate = new X509Certificate(certificatePem);
const secret = { schemaVersion: 1, clientId: MICROSOFT_CLIENT_ID, tenantId: OPDA_TENANT_ID,
  certificatePem, privateKeyPem: readFileSync(join(directory, 'key.pem'), 'utf8'),
  certificateThumbprintSha1: createHash('sha1').update(certificate.raw).digest('hex'), expiresAt: new Date(certificate.validTo).toISOString() };
const sites = WORKING_GROUPS.slice(0, 6).map(g => g.workspace.siteUrl);
const roles = ['GroupMember.ReadWrite.All', 'Team.ReadBasic.All', 'TeamMember.Read.All', 'User.Invite.All', 'User.Read.All'];
const token = (scope, patch = {}) => 'header.' + Buffer.from(JSON.stringify({
  tid: OPDA_TENANT_ID, appid: MICROSOFT_CLIENT_ID, aud: scope.replace('/.default', ''),
  roles: scope.startsWith(GRAPH_ORIGIN) ? roles : ['Sites.Selected'], ...patch,
})).toString('base64url') + '.synthetic-signature';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
function fixture(options = {}) {
  const calls = [];
  const client = createMicrosoftClient({ getSecret: async () => secret, siteUrls: sites,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return url.includes('/token') ? json({ access_token: token(init.body.get('scope')), expires_in: 3600 }) : json({ id: 'synthetic' });
    }, ...options });
  return { client, calls };
}

test('certificate assertions are signed, short-lived and audience-specific; cached tokens stay in memory', async () => {
  const f = fixture();
  await f.client.graph('/users?$top=1');
  await f.client.graph('/users?$top=1');
  await f.client.sharepoint(sites[0], '/_api/web?$select=Id');
  const authCalls = f.calls.filter(c => c.url.includes('/token'));
  assert.equal(authCalls.length, 2);
  const nonces = new Set();
  for (const { url, init } of authCalls) {
    assert.equal(init.redirect, 'error');
    assert.equal(init.body.get('grant_type'), 'client_credentials');
    assert.equal(init.body.has('client_secret'), false);
    const assertion = init.body.get('client_assertion');
    const [header, payload, signature] = assertion.split('.');
    const claims = JSON.parse(Buffer.from(payload, 'base64url'));
    assert.equal(claims.aud, url);
    assert.equal(claims.iss, MICROSOFT_CLIENT_ID);
    assert.equal(claims.sub, MICROSOFT_CLIENT_ID);
    assert.equal(claims.exp - claims.iat, 300);
    assert.ok(verify('RSA-SHA256', Buffer.from(header + '.' + payload), certificate.publicKey, Buffer.from(signature, 'base64url')));
    nonces.add(claims.jti);
  }
  assert.equal(nonces.size, 2);
});

test('foreign sites, unselected Technology and path escapes are refused before reading credentials', async () => {
  let reads = 0;
  const f = fixture({ getSecret: async () => { reads++; return secret; } });
  for (const site of ['https://foreign.example/sites/Test', SHAREPOINT_ORIGIN + '/sites/TechnologySourceIntake', sites[0] + '/child']) {
    assert.throws(() => f.client.sharepoint(site, '/_api/web'));
  }
  for (const route of ['/users/../applications', '/applications', '//evil.test/users', '/users/%2e%2e/applications']) assert.throws(() => f.client.graph(route));
  assert.equal(reads, 0);
});

test('mismatched certificate, identity, expiry or secret read failure never reaches Microsoft', async () => {
  for (const patch of [{ clientId: 'other' }, { tenantId: 'other' }, { certificateThumbprintSha1: '00' },
    { expiresAt: '2000-01-01T00:00:00Z' }, { privateKeyPem: 'secret-key-unavailable' }]) {
    const f = fixture({ getSecret: async () => ({ ...secret, ...patch }) });
    await assert.rejects(f.client.graph('/users'), /credential unavailable or mismatched/);
    assert.equal(f.calls.length, 0);
  }
  const f = fixture({ getSecret: async () => { throw Error('secret-value-do-not-log'); } });
  await assert.rejects(f.client.graph('/users'), error => !error.message.includes('secret-value-do-not-log'));
});

test('excessive token permissions, wrong tenant/client/audience fail closed', async () => {
  for (const patch of [{ roles: [...roles, 'Directory.ReadWrite.All'] }, { tid: 'foreign' }, { appid: 'foreign' }, { aud: SHAREPOINT_ORIGIN }]) {
    let requests = 0;
    const f = fixture({ fetchImpl: async (_url, init) => { requests++; return json({ access_token: token(init.body.get('scope'), patch), expires_in: 3600 }); } });
    await assert.rejects(f.client.graph('/users'), /certificate authentication failed/);
    assert.equal(requests, 1);
  }
});

test('provider errors never expose response content, headers or invitation URLs', async () => {
  const f = fixture({ fetchImpl: async (url, init) => url.includes('/token')
    ? json({ access_token: token(init.body.get('scope')), expires_in: 3600 }) : json({ secret: 'do-not-log' }, 403) });
  await assert.rejects(f.client.graph('/users'), error => error.status === 403 && !error.message.includes('do-not-log'));
  const missing = fixture({ fetchImpl: async (url, init) => url.includes('/token')
    ? json({ access_token: token(init.body.get('scope')), expires_in: 3600 }) : json({}, 404) });
  assert.equal(await missing.client.sharepoint(sites[0], '/_api/web', { allowNotFound: true }), null);
});
