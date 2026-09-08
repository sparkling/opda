import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { startRecovery, verifyRecovery, verifyExport } from '../config/aws/participant-backup/recovery.mjs';
import { snapshotContacts, CONTACT_PROPERTIES, createHubSpotReader, BRIDGE_SCOPES } from '../config/aws/participant-backup/hubspot.mjs';
import { APP_SCOPES } from '../config/aws/hubspot-participation/admin.mjs';

const point = '2026-09-08T01:50:00.000Z';
const clock = () => new Date('2026-09-08T03:00:00.000Z');
const config = { bucket: 'private-recovery', accountId: '123456789012', portalId: 144765514,
  tables: { participants: 'arn:aws:dynamodb:eu-west-2:123456789012:table/participants',
    intake: 'arn:aws:dynamodb:eu-west-2:123456789012:table/intake' } };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

function fixture() {
  const objects = new Map(), calls = [], descriptions = new Map();
  let version = 0;
  const put = async (key, value) => {
    const bytes = Buffer.from(JSON.stringify(value));
    const object = { bytes, versionId: String(++version) };
    objects.set(key, object);
    return { key, versionId: object.versionId, sha256: sha(bytes), bytes: bytes.length };
  };
  const deps = { now: clock, put, get: async key => objects.get(key) ?? null,
    recoveryWindow: async () => ({ earliest: '2026-09-07T00:00:00Z', latest: '2026-09-08T02:55:00Z' }),
    startExport: async request => {
      calls.push(request);
      const arn = `${request.TableArn}/export/export1`;
      descriptions.set(arn, { ExportArn: arn, ExportStatus: 'IN_PROGRESS' });
      return arn;
    },
    describeExport: async arn => descriptions.get(arn),
    snapshot: async ids => ({ contactCount: ids.length, objects: [], atomic: false }),
    completed: async time => calls.push({ completed: time }),
  };
  return { deps, objects, calls, descriptions, put };
}

async function addExport(f, name, items = []) {
  const arn = `${config.tables[name]}/export/export1`;
  const prefix = `recovery/runs/2026-09-08/${name}`;
  const base = `${prefix}/AWSDynamoDB/export1`;
  const body = gzipSync(items.map(Item => JSON.stringify({ Item })).join('\n'));
  f.objects.set(`${base}/data/part.json.gz`, { bytes: body, versionId: 'data-v1' });
  const file = { dataFileS3Key: `${base}/data/part.json.gz`, itemCount: items.length,
    md5Checksum: createHash('md5').update(body).digest('base64') };
  f.objects.set(`${base}/manifest-files.json`, { bytes: Buffer.from(JSON.stringify(file) + '\n'), versionId: 'files-v1' });
  await f.put(`${base}/manifest-summary.json`, { exportArn: arn, tableArn: config.tables[name],
    s3Bucket: config.bucket, s3Prefix: prefix, s3SseAlgorithm: 'AES256', exportTime: point,
    itemCount: items.length, outputFormat: 'DYNAMODB_JSON', manifestFilesS3Key: `${base}/manifest-files.json` });
  const desc = { ExportArn: arn, TableArn: config.tables[name], S3Bucket: config.bucket,
    S3Prefix: prefix, ExportStatus: 'COMPLETED', ExportFormat: 'DYNAMODB_JSON',
    ExportType: 'FULL_EXPORT', ExportTime: point, S3SseAlgorithm: 'AES256',
    ExportManifest: `${base}/manifest-summary.json`, ItemCount: items.length };
  f.descriptions.set(arn, desc);
  return { desc, prefix, base };
}

test('daily start exports only two allowed PITR tables, persisting each idempotent request', async () => {
  const f = fixture();
  await startRecovery(config, f.deps, '2026-09-08T02:00:00Z');
  await startRecovery(config, f.deps, '2026-09-08T02:00:00Z');
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.calls.map(x => x.TableArn), Object.values(config.tables));
  assert.ok(f.calls.every(x => x.ExportType === 'FULL_EXPORT' && x.S3SseAlgorithm === 'AES256'));
  assert.ok(f.calls.every(x => new Date(x.ExportTime).toISOString() === point));
  assert.ok(f.calls.every(x => /^[a-f0-9]{32}$/.test(x.ClientToken)));
  assert.equal(f.objects.has('recovery/runs/2026-09-08/complete.json'), false);
});

test('successful start is pending, never a completed recovery point', async () => {
  const f = fixture();
  await startRecovery(config, f.deps, '2026-09-08T02:00:00Z');
  assert.equal((await verifyRecovery(config, f.deps, '2026-09-08')).status, 'pending');
  assert.equal(f.objects.has('recovery/runs/2026-09-08/complete.json'), false);
});

test('native files and counts are verified before one complete manifest is published', async () => {
  const f = fixture();
  await startRecovery(config, f.deps, '2026-09-08T02:00:00Z');
  await addExport(f, 'participants', [{ pk: { S: 'USER#test' }, hubspotContactId: { S: '123' }, hubspotPortalId: { N: '144765514' } }]);
  await addExport(f, 'intake');
  const result = await verifyRecovery(config, f.deps, '2026-09-08');
  assert.equal(result.status, 'complete');
  assert.equal(result.hubspot.contactCount, 1);
  assert.equal(result.tables.participants.itemCount, 1);
  assert.ok(result.tables.participants.objects.every(x => x.versionId && x.sha256));
  assert.ok(f.objects.has('recovery/runs/2026-09-08/complete.json'));
  assert.deepEqual(result.excluded, ['sessions', 'credentials', 'hubspot-notes-tasks-associations']);
  assert.equal(f.calls.at(-1).completed, point, 'late completion must not make an old recovery point look fresh');
  await verifyRecovery(config, f.deps, '2026-09-08');
  assert.equal(f.calls.at(-1).completed, point, 'verification replay must not refresh the recovery-point clock');
});

test('pending applicant sync bindings are backed up once alongside registered participants', async () => {
  const f = fixture();
  const { desc, prefix } = await addExport(f, 'participants', [
    { pk: { S: 'USER#test' }, hubspotContactId: { S: '123' }, hubspotPortalId: { N: '144765514' } },
    { pk: { S: 'SYNC#APPLICATION#test' }, contactId: { S: '456' }, state: { S: 'synced' } },
    { pk: { S: 'SYNC#EMAIL#test' }, contactId: { S: '456' }, state: { S: 'synced' } },
    { pk: { S: 'SYNC#APPLICATION#review' }, contactId: { S: '789' }, state: { S: 'review' } },
  ]);
  const result = await verifyExport(config, f.deps, 'participants', desc, prefix, point);
  assert.deepEqual(result.contactIds, ['123', '456']);
});

test('an empty completed export accepts an empty files manifest only with a zero native count', async () => {
  const f = fixture();
  const { desc, prefix, base } = await addExport(f, 'intake');
  f.objects.get(`${base}/manifest-files.json`).bytes = Buffer.from('');
  assert.equal((await verifyExport(config, f.deps, 'intake', desc, prefix, point)).itemCount, 0);
  desc.ItemCount = 1;
  await assert.rejects(verifyExport(config, f.deps, 'intake', desc, prefix, point));
});

test('corrupt, missing, mismatched or nonversioned native data never passes verification', async () => {
  for (const kind of ['corrupt', 'missing', 'unversioned', 'wrong-count', 'wrong-table', 'outside-prefix']) {
    const f = fixture();
    const { desc, prefix, base } = await addExport(f, 'participants');
    if (kind === 'corrupt') f.objects.get(`${base}/data/part.json.gz`).bytes = Buffer.from('bad');
    if (kind === 'missing') f.objects.delete(`${base}/data/part.json.gz`);
    if (kind === 'unversioned') f.objects.get(`${base}/data/part.json.gz`).versionId = 'null';
    if (kind === 'wrong-count') desc.ItemCount = 10;
    if (kind === 'wrong-table') desc.TableArn = config.tables.intake;
    if (kind === 'outside-prefix') desc.ExportManifest = 'private/sessions.json';
    await assert.rejects(verifyExport(config, f.deps, 'participants', desc, prefix, point));
  }
});

test('HubSpot failure leaves native copies but records partial recovery, not completion', async () => {
  const f = fixture();
  await startRecovery(config, f.deps, '2026-09-08T02:00:00Z');
  await addExport(f, 'participants'); await addExport(f, 'intake');
  f.deps.snapshot = async () => { throw new Error('API request included private@example.org'); };
  await assert.rejects(verifyRecovery(config, f.deps, '2026-09-08'), /Recovery verification failed/);
  assert.equal(f.objects.has('recovery/runs/2026-09-08/complete.json'), false);
  const failure = f.objects.get('recovery/runs/2026-09-08/failure.json').bytes.toString();
  assert.match(failure, /partial/); assert.doesNotMatch(failure, /private@example/);
});

test('failed native export is explicit and cannot be completed', async () => {
  const f = fixture();
  await startRecovery(config, f.deps, '2026-09-08T02:00:00Z');
  f.descriptions.values().next().value.ExportStatus = 'FAILED';
  await assert.rejects(verifyRecovery(config, f.deps, '2026-09-08'));
  assert.equal(f.objects.has('recovery/runs/2026-09-08/complete.json'), false);
});

function contactApi({ missing = false, duplicate = false } = {}) {
  const calls = [];
  const api = async (path, options) => {
    calls.push({ path, options });
    if (path.includes('/properties/')) return { status: 'COMPLETE', results: CONTACT_PROPERTIES.map(name => ({ name, type: 'string', options: [] })) };
    const results = options.body.inputs.map(({ id }) => ({ id, archived: false, createdAt: point, updatedAt: point,
      properties: { email: 'test@example.org', opda_active: 'true', unrelated_sensitive: 'omit' } }));
    if (missing) results.pop();
    if (duplicate) results.push(results[0]);
    return { status: 'COMPLETE', results };
  };
  return { api, calls };
}

test('mapped contact backup covers every batch and preserves only known profile fields', async () => {
  const f = fixture(), { api, calls } = contactApi();
  const ids = Array.from({ length: 205 }, (_, i) => String(i + 1));
  const result = await snapshotContacts({ ids, portalId: config.portalId, prefix: 'recovery/test', api, put: f.put, now: clock });
  assert.equal(result.contactCount, 205); assert.equal(result.atomic, false);
  assert.deepEqual(calls.filter(x => x.path.includes('/objects/')).map(x => x.options.body.inputs.length), [100, 100, 5]);
  assert.equal(result.objects.length, 4);
  const profiles = [...f.objects.values()].map(x => x.bytes.toString()).join('\n');
  assert.doesNotMatch(profiles, /unrelated_sensitive|omit/);
  assert.match(profiles, /"opda_active":"true"/);
  assert.doesNotMatch(profiles, /"grants"|"approvedGroups"/);
});

test('missing or duplicate mapped contacts fail closed instead of silently truncating a backup', async () => {
  for (const options of [{ missing: true }, { duplicate: true }]) {
    const f = fixture(), { api } = contactApi(options);
    await assert.rejects(snapshotContacts({ ids: ['1'], portalId: config.portalId, prefix: 'recovery/test', api, put: f.put, now: clock }));
  }
});

test('actual token portal, app and exact scopes are verified before any CRM batch read', async () => {
  assert.deepEqual(BRIDGE_SCOPES, APP_SCOPES.bridge);
  const token = 'pat-synthetic-private-app-test-token';
  const valid = { hubId: 144765514, appId: 52397854, scopes: [...BRIDGE_SCOPES] };
  for (const info of [{ ...valid, hubId: 999 }, { ...valid, appId: 999 },
    { ...valid, scopes: valid.scopes.slice(1) }, { ...valid, scopes: [...valid.scopes, 'crm.schemas.contacts.write'] }]) {
    const requests = [];
    const api = createHubSpotReader({ accessToken: token, sleep: async () => {}, fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return new Response(JSON.stringify(info), { status: 200 });
    } });
    await assert.rejects(api('/crm/v3/objects/contacts/batch/read', { body: { inputs: [{ id: '123' }] } }), /Scoped CRM snapshot incomplete/);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'https://api.hubapi.com/oauth/v2/private-apps/get/access-token-info');
    assert.equal(requests[0].options.headers.Authorization, `Bearer ${token}`);
    assert.deepEqual(JSON.parse(requests[0].options.body), { tokenKey: token });
    assert.equal(requests[0].options.redirect, 'error');
  }
});

test('a correctly scoped bridge is introspected once before all read batches', async () => {
  const requests = [];
  const api = createHubSpotReader({ accessToken: 'pat-synthetic-private-app-test-token', sleep: async () => {},
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      const body = url.includes('/oauth/') ? { hubId: 144765514, appId: 52397854, scopes: [...BRIDGE_SCOPES].reverse() }
        : { status: 'COMPLETE', results: [] };
      return new Response(JSON.stringify(body), { status: 200 });
    } });
  await api('/crm/v3/properties/contacts/batch/read', { body: { inputs: [] } });
  await api('/crm/v3/objects/contacts/batch/read', { body: { inputs: [] } });
  assert.equal(requests.length, 3);
  assert.match(requests[0].url, /access-token-info$/);
  assert.equal(requests.filter(x => x.url.includes('/oauth/')).length, 1);
});

test('backup IAM contains neither sessions nor restore/delete/database-write authority', async () => {
  const stack = await readFile(new URL('../config/aws/participant-backup-stack.yaml', import.meta.url), 'utf8');
  assert.match(stack, /Runtime: nodejs22.x/);
  assert.match(stack, /dynamodb:ExportTableToPointInTime/);
  assert.match(stack, /dynamodb:DescribeExport/);
  assert.match(stack, /ReservedConcurrentExecutions: 1/);
  assert.match(stack, /EvaluationPeriods: 26/);
  assert.match(stack, /TreatMissingData: breaching/);
  assert.match(stack, /ScheduleExpression: 'cron\(0 2 \* \* \? \*\)'/);
  assert.match(stack, /ScheduleExpression: 'cron\(15 \* \* \* \? \*\)'/);
  assert.equal((stack.match(/Type: AWS::Lambda::Permission/g) || []).length, 2);
  assert.match(stack, /SourceArn: !GetAtt DailyStart.Arn/);
  assert.match(stack, /SourceArn: !GetAtt HourlyVerification.Arn/);
  assert.doesNotMatch(stack, /SessionsTable|dynamodb:Scan|dynamodb:PutItem|dynamodb:Restore|s3:DeleteObject/);
});
