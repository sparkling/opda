import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceEntry } from '../src/approval-onboarding/workspace-entry.mjs';
import { sessionKey } from '../config/aws/auth-session/store.mjs';
import { MICROSOFT_CLIENT_ID } from '../src/approval-onboarding/microsoft-auth.mjs';
import { OPDA_TENANT_ID } from '../src/approval-onboarding/invitation.mjs';
import { WORKSPACES } from '../src/approval-onboarding/settings.mjs';

const NOW = 1800000000000, TOKEN = 'a'.repeat(43), GROUP = 'conveyancing';
const ARN = 'arn:aws:secretsmanager:eu-west-2:355653384628:secret:opda/microsoft/participation-onboarding-Ab1234';
const ENV = { AWS_REGION: 'eu-west-2', PARTICIPANTS_TABLE_NAME: 'opda-participants',
  SESSIONS_TABLE_NAME: 'opda-participant-sessions', MICROSOFT_SECRET_ARN: ARN };
function fixture(patch = {}) {
  let time = NOW, allowed = true, loaded = false;
  const calls = [], captured = {};
  const participant = { pk: 'USER#sub-1', cognitoSub: 'sub-1', email: 'synthetic@example.test', participantId: 'participant-1',
    active: true, suspended: false, reviewStatus: 'approved', accessVersion: 1, enrolmentStatus: 'complete',
    approvedDomains: [GROUP], domainApprovals: { [GROUP]: { status: 'approved', version: 1, decisionId: 'a'.repeat(64) } } };
  const receipt = { schemaVersion: 1, identity: { state: 'bound', userId: 'id-1' }, memberships: {} };
  const context = { receipts: { graph: receipt, sharepoint: {}, mail: {} } };
  const handler = createWorkspaceEntry({ env: { ...ENV, ...patch }, now: () => time,
    getSecretValue: async ({ SecretId }) => {
      calls.push('secret'); assert.equal(SecretId, ARN);
      return { ARN, Name: 'opda/microsoft/participation-onboarding', VersionStages: ['AWSCURRENT'], SecretString: JSON.stringify({
        schemaVersion: 1, tenantId: OPDA_TENANT_ID, clientId: MICROSOFT_CLIENT_ID,
        certificatePem: '-----BEGIN CERTIFICATE-----\nsynthetic\n-----END CERTIFICATE-----\n',
        privateKeyPem: '-----BEGIN PRIVATE KEY-----\nsynthetic\n-----END PRIVATE KEY-----\n',
        certificateThumbprintSha1: 'a'.repeat(40), expiresAt: new Date(NOW + 86400000).toISOString(),
        receiptEncryptionKey: Buffer.alloc(32, 5).toString('base64'),
      }) };
    }, factories: {
      sessionStore: config => {
        captured.config = config;
        return { async getSession(key) { calls.push('session');
          return allowed && key === sessionKey(TOKEN) ? { pk: key, sub: participant.cognitoSub, participantId: participant.participantId,
            email: participant.email, accessVersion: 1, createdAt: NOW / 1000 - 10, expiresAt: NOW / 1000 + 300 } : null; },
        async getParticipant() { calls.push('participant'); return participant; } };
      },
      microsoft: options => { captured.microsoft = options; return { graph: async (route, opts) => { calls.push(['graph', route, opts.method]); } }; },
      store: options => { captured.store = options; return {
        load: async () => { loaded = true; calls.push('load'); return { status: 'ready', context }; },
        claim: async () => { throw new Error('Normal entry must not claim a lease'); },
        guard: async () => loaded,
        saveGraph: async () => { throw new Error('Normal entry must not persist'); },
        release: async () => { loaded = false; calls.push('release'); },
      }; },
      graph: options => { captured.graph = options; return {
        readAccess: async args => { calls.push('access'); assert.equal(await args.guard(), true);
          captured.onAccess?.();
          return { status: 'ready', redemptionRequired: false, receipt }; },
      }; },
    } });
  const open = () => handler({ schemaVersion: 1, sessionToken: TOKEN, groupId: GROUP, phase: 'open' });
  return { handler, open, calls, captured, deny: () => { allowed = false; }, advance: ms => { time += ms; } };
}

test('private runtime wires current opaque session to the exact registered group without mail', async () => {
  const f = fixture(); assert.deepEqual(await f.open(), { status: 'ready', location: WORKSPACES[GROUP].teamUrl });
  assert.equal(f.captured.config.sessionsTableName, 'opda-participant-sessions');
  assert.equal(f.captured.microsoft.timeoutMs, 4000);
  assert.equal(f.calls.includes('secret'), false);
  assert.equal(f.calls.includes('load'), true);
  assert.equal(f.calls.at(-1), 'release');
});
test('the private hand-off stops when its bounded request budget expires', async () => {
  const f = fixture();
  f.captured.onAccess = () => f.advance(9000);
  assert.deepEqual(await f.open(), { status: 'unavailable' });
  assert.equal(f.calls.at(-1), 'release');
});
test('invalid or revoked sessions stop before Graph, leases or secret reads', async () => {
  const f = fixture(); f.deny();
  assert.deepEqual(await f.open(), { status: 'denied' });
  assert.deepEqual(f.calls, ['session']);
  assert.deepEqual(await f.handler({ schemaVersion: 1, sessionToken: '', groupId: GROUP, phase: 'open' }), { status: 'denied' });
});
test('production configuration rejects other accounts, regions, tables and credentials', async () => {
  for (const patch of [{ AWS_REGION: 'us-east-1' }, { PARTICIPANTS_TABLE_NAME: 'other' }, { SESSIONS_TABLE_NAME: 'other' },
    { MICROSOFT_SECRET_ARN: ARN.replace('355653384628', '111111111111') }, { MICROSOFT_SECRET_ARN: ARN.replace('microsoft', 'postmark') }]) {
    const f = fixture(patch); assert.deepEqual(await f.open(), { status: 'unavailable' }); assert.deepEqual(f.calls, []);
  }
});
test('production adapter cannot mutate membership, reset invitations or send Microsoft email', async () => {
  const f = fixture(); await f.open();
  for (const [route, options] of [['/groups/id/members/$ref', { method: 'POST' }], ['/users/id', { method: 'DELETE' }],
    ['/invitations', { method: 'POST', body: { sendInvitationMessage: true, resetRedemption: false } }],
    ['/invitations', { method: 'POST', body: { sendInvitationMessage: false, resetRedemption: true } }]]) {
    assert.throws(() => f.captured.graph.request(route, options), /not permitted/);
  }
  await f.captured.graph.request('/users/id', { method: 'GET' });
  await f.captured.graph.request('/invitations', { method: 'POST', body: { sendInvitationMessage: false, resetRedemption: false } });
  assert.equal(f.calls.filter(c => Array.isArray(c) && c[0] === 'graph').length, 2);
});
test('receipt encryption uses the same participant-bound secret and does not expose its payload', async () => {
  const f = fixture(); await f.open();
  const receipt = { graph: { private: 'redemption-ticket' }, sharepoint: {}, mail: {} };
  const encrypted = await f.captured.store.protectReceipts(receipt, 'participant-1');
  assert.equal(encrypted.algorithm, 'A256GCM'); assert.doesNotMatch(JSON.stringify(encrypted), /redemption-ticket/);
  assert.deepEqual(await f.captured.store.unprotectReceipts(encrypted, 'participant-1'), receipt);
  await assert.rejects(() => f.captured.store.unprotectReceipts(encrypted, 'other-participant'));
  assert.equal(f.calls.filter(c => c === 'secret').length, 1);
});
