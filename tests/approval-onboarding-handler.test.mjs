import assert from 'node:assert/strict';
import test from 'node:test';
import { createHandler, createProductionWorker } from '../src/approval-onboarding/index.mjs';
import { MICROSOFT_CLIENT_ID } from '../src/approval-onboarding/microsoft-auth.mjs';
import { OPDA_TENANT_ID } from '../src/approval-onboarding/invitation.mjs';

const queueArn = 'arn:aws:sqs:eu-west-2:355653384628:opda-participation-onboarding';
const microsoftSecretArn = 'arn:aws:secretsmanager:eu-west-2:355653384628:secret:opda/microsoft/participation-onboarding-Ab1234';
const postmarkSecretArn = 'arn:aws:secretsmanager:eu-west-2:355653384628:secret:opda/postmark/participation-onboarding-Cd5678';
const instant = Date.parse('2026-09-09T12:00:00Z');
const canaryEmailHash = '388c735eec8225c4ad7a507944dd0a975296baea383198aa87177f29af2c6f69';
const config = { participantsTableName: 'opda-participants', queueArn, microsoftSecretArn, postmarkSecretArn,
  enabled: false, canaryEmailHash: '' };
const operationId = 'a'.repeat(64);
const message = (id = 'message-1', patch = {}) => ({ messageId: id, eventSource: 'aws:sqs', eventSourceARN: queueArn,
  awsRegion: 'eu-west-2', body: JSON.stringify({ schemaVersion: 1, operationId }), ...patch });
const invocation = (...records) => ({ Records: records });
const env = (patch = {}) => ({ PARTICIPANTS_TABLE_NAME: config.participantsTableName,
  ONBOARDING_QUEUE_ARN: queueArn, MICROSOFT_SECRET_ARN: microsoftSecretArn,
  POSTMARK_SECRET_ARN: postmarkSecretArn, ...patch });
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
const microsoft = () => ({ schemaVersion: 1, tenantId: OPDA_TENANT_ID, clientId: MICROSOFT_CLIENT_ID,
  certificatePem: '-----BEGIN CERTIFICATE-----\nsynthetic\n-----END CERTIFICATE-----\n',
  privateKeyPem: '-----BEGIN PRIVATE KEY-----\nsynthetic\n-----END PRIVATE KEY-----\n',
  certificateThumbprintSha1: 'a'.repeat(40), expiresAt: new Date(instant + 86400000).toISOString(),
  receiptEncryptionKey: Buffer.alloc(32, 7).toString('base64') });
const postmark = () => ({ schemaVersion: 1, serverId: 20188829, serverToken: 'synthetic-token' });
const response = (arn, secret) => ({ ARN: arn, Name: arn === microsoftSecretArn
  ? 'opda/microsoft/participation-onboarding' : 'opda/postmark/participation-onboarding',
VersionStages: ['AWSCURRENT'], SecretString: JSON.stringify(secret) });

function runtimeFixture(extra = {}) {
  let time = instant, secretOverride;
  const captured = {}, reads = [], adapters = [];
  const deps = { now: () => time, readLogo: async url => { captured.logoUrl = url; return png; },
    getSecretValue: async (input, options) => {
      reads.push(input); assert.ok(options.abortSignal instanceof AbortSignal);
      assert.equal(input.VersionStage, 'AWSCURRENT');
      return secretOverride ? secretOverride(input) : response(input.SecretId, input.SecretId === microsoftSecretArn ? microsoft() : postmark());
    }, factories: {
      createOnboardingStore: options => { captured.store = options; return { mock: 'store' }; },
      createMicrosoftClient: options => { captured.microsoft = options; return { graph() {}, sharepoint() {} }; },
      createGraphAdapter: options => { captured.graph = options; return { mock: 'graph' }; },
      createSharePointAdapter: options => { captured.sharepoint = options; return { mock: 'sharepoint' }; },
      createPostmarkInvitationAdapter: options => { adapters.push(options); return {
        send: async () => ({ status: 'accepted' }), reconcile: async () => ({ status: 'unknown' }),
      }; },
      createOnboardingWorker: options => { captured.worker = options; return { process: async () => ({ status: 'skipped' }) }; },
    }, ...extra };
  return { deps, captured, reads, adapters, advance: ms => { time += ms; }, secrets: callback => { secretOverride = callback; } };
}

test('reference-only SQS hints reach the worker; pending, skipped and terminal outcomes are acknowledged', async () => {
  const ids = [], outcomes = ['pending', 'skipped', 'complete', 'cancelled'];
  const handler = createHandler({ queueArn, worker: { process: async id => { ids.push(id); return { status: outcomes.shift() }; } } });
  const result = await handler(invocation(...[1, 2, 3, 4].map(n => message(`message-${n}`))));
  assert.deepEqual(result, { batchItemFailures: [] }); assert.deepEqual(ids, Array(4).fill(operationId));
});

test('one failure retries only its record and logs aggregate static signals without provider details', async () => {
  const logs = [];
  let count = 0;
  const handler = createHandler({ queueArn, log: entry => logs.push(entry), worker: { process: async () => {
    if (++count === 1) throw new Error('synthetic@example.test ticket=private');
    return { status: 'attention', reason: 'synthetic@example.test', operationId };
  } } });
  assert.deepEqual(await handler(invocation(message('first'), message('second'))), { batchItemFailures: [{ itemIdentifier: 'first' }] });
  assert.deepEqual(logs, [{ event: 'onboarding_attention', count: 1 }, { event: 'onboarding_batch_retry', count: 1 }]);
  assert.doesNotMatch(JSON.stringify(logs), /synthetic|ticket|first|second|aaaa/);
});

test('wrong source, queue, region and malformed or expanded messages never reach a worker', async () => {
  let calls = 0;
  const handler = createHandler({ queueArn, log: () => {}, worker: { process: async () => { calls++; return { status: 'complete' }; } } });
  const bodies = [null, '', 'null', '[]', '{}', '{', JSON.stringify({ schemaVersion: 2, operationId }),
    JSON.stringify({ schemaVersion: 1, operationId: 'A'.repeat(64) }), JSON.stringify({ schemaVersion: 1, operationId, email: 'synthetic@example.test' }),
    JSON.stringify({ schemaVersion: 1, operationId: operationId.slice(0, 32) + ' ' + operationId.slice(32) }),
    `{"schema Version":1,"operationId":"${operationId}"}`, `{"schemaVersion":1,"operation Id":"${operationId}"}`,
    `{"schemaVersion":1,"operationId":"${operationId}","operationId":"${operationId}"}`, ' '.repeat(513)];
  const patches = [{ eventSource: 'aws:sns' }, { eventSourceARN: queueArn + '-other' },
    { eventSourceARN: queueArn.replace('355653384628', '111111111111') }, { awsRegion: 'us-east-1' }, { awsRegion: undefined },
    ...bodies.map(body => ({ body }))];
  for (const patch of patches) {
    assert.deepEqual(await handler(invocation(message('invalid', patch))), { batchItemFailures: [{ itemIdentifier: 'invalid' }] });
  }
  assert.equal(calls, 0);
});

test('JSON whitespace and reversed member order remain reference-only', async () => {
  let calls = 0;
  const handler = createHandler({ queueArn, worker: { process: async () => { calls++; return { status: 'skipped' }; } } });
  assert.deepEqual(await handler(invocation(message('reference', { body: ` { "operationId" : "${operationId}",\n"schemaVersion" : 1 } ` }))), { batchItemFailures: [] });
  assert.equal(calls, 1);
});

test('unreportable message IDs, duplicate IDs and unbounded invocations fail before any processing', async () => {
  let calls = 0;
  const handler = createHandler({ queueArn, worker: { process: async () => { calls++; } } });
  for (const event of [null, {}, invocation(), invocation(message(undefined, { messageId: undefined })),
    invocation(message('synthetic@example.test')), invocation(message('same'), message('same')),
    invocation(...Array.from({ length: 11 }, (_, n) => message(`message-${n}`)))]) {
    await assert.rejects(handler(event), error => error.message === 'Invalid onboarding invocation');
  }
  assert.equal(calls, 0);
});

test('queue identity is pinned to the OPDA account and region, not inferred from incoming events', async () => {
  for (const bad of [undefined, queueArn.replace('355653384628', '111111111111'), queueArn.replace('eu-west-2', 'us-east-1'),
    queueArn + '.fifo', queueArn + ':extra']) {
    const handler = createHandler({ queueArn: bad, env: {}, worker: { process: async () => ({ status: 'complete' }) } });
    await assert.rejects(handler(invocation(message())), /Invalid onboarding configuration/);
  }
});

test('production assembly is disabled by default, resolves packaged assets and always encrypts receipts', async () => {
  const f = runtimeFixture(); await createProductionWorker(config, f.deps);
  assert.equal(f.captured.worker.enabled, false); assert.equal(f.captured.worker.canaryEmailHash, '');
  assert.equal(f.captured.worker.logoBase64, png.toString('base64'));
  assert.equal(f.captured.logoUrl.pathname.endsWith('/src/approval-onboarding/opda-email-logo.png'), true);
  assert.equal(f.captured.microsoft.siteUrls.length, 6); assert.equal(Object.keys(f.captured.graph.workspaces).length, 6);
  assert.equal(f.captured.worker.store.mock, 'store'); assert.equal(f.reads.length, 0);
  const receipt = { graph: { redemptionUrl: 'https://login.microsoftonline.com/redeem?ticket=synthetic' }, sharepoint: {}, mail: {} };
  const envelope = await f.captured.store.protectReceipts(receipt, 'participant-123');
  assert.equal(envelope.algorithm, 'A256GCM'); assert.doesNotMatch(JSON.stringify(envelope), /redeem|ticket/);
  assert.deepEqual(await f.captured.store.unprotectReceipts(envelope, 'participant-123'), receipt);
  await assert.rejects(f.captured.store.unprotectReceipts(envelope, 'another-participant'));
  assert.equal(f.reads.length, 1); assert.equal(f.reads[0].SecretId, microsoftSecretArn);
});

test('production secret caches refresh after five minutes and Postmark token refresh rebuilds its adapter', async () => {
  const f = runtimeFixture(); await createProductionWorker(config, f.deps);
  await f.captured.microsoft.getSecret(); await f.captured.microsoft.getSecret();
  await f.captured.worker.postmark.send({}); await f.captured.worker.postmark.reconcile({});
  assert.equal(f.reads.length, 2); assert.equal(f.adapters.length, 1);
  f.advance(299999); await f.captured.microsoft.getSecret(); await f.captured.worker.postmark.send({});
  assert.equal(f.reads.length, 2);
  f.advance(1); f.secrets(input => response(input.SecretId, input.SecretId === microsoftSecretArn
    ? microsoft() : { ...postmark(), serverToken: 'rotated-synthetic-token' }));
  await f.captured.microsoft.getSecret(); await f.captured.worker.postmark.send({});
  assert.equal(f.reads.length, 4); assert.equal(f.adapters.length, 2);
  assert.equal(f.adapters[1].token, 'rotated-synthetic-token'); assert.equal(f.adapters[1].expectedServerId, 20188829);
});

test('secret reads are single-flight and failed refresh cannot use a stale credential', async () => {
  const f = runtimeFixture(); await createProductionWorker(config, f.deps);
  await Promise.all([f.captured.microsoft.getSecret(), f.captured.microsoft.getSecret()]); assert.equal(f.reads.length, 1);
  f.advance(300000); f.secrets(() => { throw new Error('provider-secret@example.test'); });
  await assert.rejects(f.captured.microsoft.getSecret(), error => error.message === 'Onboarding service credential unavailable');
  await assert.rejects(f.captured.microsoft.getSecret(), /credential unavailable/); assert.equal(f.reads.length, 3);
});

test('native SecretsManager construction pins region, current version, retries and a five-second abort signal', async t => {
  const captured = {}, deadlines = [];
  t.mock.method(AbortSignal, 'timeout', milliseconds => { deadlines.push(milliseconds); return new AbortController().signal; });
  const f = runtimeFixture({ getSecretValue: undefined, loadAws: async () => ({
    SecretsManagerClient: class {
      constructor(options) { captured.client = options; }
      async send(command, options) {
        captured.command = command; captured.options = options;
        return response(command.input.SecretId, microsoft());
      }
    },
    GetSecretValueCommand: class { constructor(input) { this.input = input; } },
  }) });
  await createProductionWorker(config, f.deps); await f.captured.microsoft.getSecret();
  assert.deepEqual(captured.client, { region: 'eu-west-2', maxAttempts: 2 });
  assert.deepEqual(captured.command.input, { SecretId: microsoftSecretArn, VersionStage: 'AWSCURRENT' });
  assert.ok(captured.options.abortSignal instanceof AbortSignal); assert.deepEqual(deadlines, [5000]);
});

test('certificate refresh keeps the receipt key stable and expiry shortens the cache lifetime', async () => {
  const f = runtimeFixture(); await createProductionWorker(config, f.deps);
  const original = { graph: {}, sharepoint: {}, mail: {} };
  const envelope = await f.captured.store.protectReceipts(original, 'participant-123');
  f.advance(300000); f.secrets(input => response(input.SecretId, { ...microsoft(), certificateThumbprintSha1: 'b'.repeat(40) }));
  assert.deepEqual(await f.captured.store.unprotectReceipts(envelope, 'participant-123'), original);
  assert.equal(f.reads.length, 2);
  const g = runtimeFixture(); g.secrets(input => response(input.SecretId, { ...microsoft(), expiresAt: new Date(instant + 60005).toISOString() }));
  await createProductionWorker(config, g.deps); await g.captured.microsoft.getSecret(); g.advance(5);
  await assert.rejects(g.captured.microsoft.getSecret(), /credential unavailable/); assert.equal(g.reads.length, 2);
});

test('foreign, malformed, expired or plaintext-receipt credentials fail closed without disclosing payloads', async () => {
  const mutations = [secret => ({ ...secret, tenantId: 'wrong' }), secret => ({ ...secret, clientId: 'wrong' }),
    secret => ({ ...secret, schemaVersion: 2 }), secret => ({ ...secret, receiptEncryptionKey: undefined }),
    secret => ({ ...secret, receiptEncryptionKey: 'A'.repeat(43) + 'B' }), secret => ({ ...secret, expiresAt: new Date(instant).toISOString() }),
    secret => ({ ...secret, privateKeyPem: 'synthetic@example.test' }), secret => ({ ...secret, extraToken: 'private' })];
  for (const mutate of mutations) {
    const f = runtimeFixture(); f.secrets(input => response(input.SecretId, mutate(microsoft())));
    await createProductionWorker(config, f.deps);
    await assert.rejects(f.captured.microsoft.getSecret(), error => error.message === 'Onboarding service credential unavailable');
  }
  for (const patch of [{ ARN: postmarkSecretArn }, { Name: 'another/secret' }, { VersionStages: ['AWSPREVIOUS'] },
    { SecretString: '{' }, { SecretString: 'x'.repeat(65000) }, { SecretBinary: new Uint8Array([1]), SecretString: undefined }]) {
    const f = runtimeFixture(); f.secrets(input => ({ ...response(input.SecretId, microsoft()), ...patch }));
    await createProductionWorker(config, f.deps); await assert.rejects(f.captured.microsoft.getSecret(), /credential unavailable/);
  }
  const f = runtimeFixture(); f.secrets(input => response(input.SecretId, { ...postmark(), serverId: 123 }));
  await createProductionWorker(config, f.deps); await assert.rejects(f.captured.worker.postmark.send({}), /credential unavailable/);
});

test('runtime uses explicit true only and does not fetch secrets for rejected queue messages', async () => {
  for (const enabled of [undefined, 'false', 'true']) {
    const f = runtimeFixture(), logs = [];
    const handler = createHandler({ env: env(enabled === undefined ? {} : { ONBOARDING_ENABLED: enabled }), ...f.deps, log: value => logs.push(value) });
    await handler(invocation(message())); assert.equal(f.captured.worker.enabled, enabled === 'true'); assert.equal(f.reads.length, 0);
  }
  const canary = runtimeFixture();
  const canaryHandler = createHandler({ env: env({ ONBOARDING_ENABLED: 'false', ONBOARDING_CANARY_EMAIL_HASH: canaryEmailHash }),
    ...canary.deps, log: () => {} });
  await canaryHandler(invocation(message())); assert.equal(canary.captured.worker.canaryEmailHash, canaryEmailHash);
  const f = runtimeFixture(), handler = createHandler({ env: env(), ...f.deps, log: () => {} });
  await handler(invocation(message('invalid', { body: '{}' }))); assert.equal(f.captured.worker, undefined); assert.equal(f.reads.length, 0);
});

test('misconfigured activation, secret scope and missing logo become retries without exposing configuration', async () => {
  for (const patch of [{ ONBOARDING_ENABLED: 'yes' }, { ONBOARDING_ENABLED: 'TRUE' },
    { ONBOARDING_CANARY_EMAIL_HASH: 'A'.repeat(64) }, { ONBOARDING_CANARY_EMAIL_HASH: 'a'.repeat(63) },
    { MICROSOFT_SECRET_ARN: microsoftSecretArn.replace('opda/microsoft', 'opda/other') },
    { POSTMARK_SECRET_ARN: postmarkSecretArn.replace('355653384628', '111111111111') }]) {
    const f = runtimeFixture(), handler = createHandler({ env: env(patch), ...f.deps, log: () => {} });
    assert.deepEqual(await handler(invocation(message())), { batchItemFailures: [{ itemIdentifier: 'message-1' }] });
    assert.equal(f.reads.length, 0);
  }
  const f = runtimeFixture({ readLogo: async () => { throw new Error('private path'); } });
  const handler = createHandler({ env: env(), ...f.deps, log: () => {} });
  assert.deepEqual(await handler(invocation(message())), { batchItemFailures: [{ itemIdentifier: 'message-1' }] });
});
