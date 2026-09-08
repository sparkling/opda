// Native PITR exports are recoverable table copies; start acknowledgements are not backups.
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const hash = (bytes, algorithm = 'sha256', encoding = 'hex') => createHash(algorithm).update(bytes).digest(encoding);
const fail = () => { throw new Error('Recovery verification failed'); };
const integer = x => Number.isSafeInteger(x) && x >= 0;
const json = object => JSON.parse(object.bytes.toString('utf8'));
const lines = bytes => bytes.toString('utf8').split('\n').filter(x => x.trim()).map(x => JSON.parse(x));
export const runPrefix = day => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day))) fail();
  return `recovery/runs/${day}`;
};
function keyWithin(key, prefix) {
  if (typeof key !== 'string' || !key.startsWith(`${prefix}/`) || key.includes('..') || key.includes('\\')) fail();
  return key;
}
function nativeKey(key, prefix) {
  // AWS full-export examples include both bucket-relative and prefix-relative keys.
  return keyWithin(key?.startsWith('AWSDynamoDB/') ? `${prefix}/${key}` : key, prefix);
}
async function readVerified(deps, key) {
  const object = await deps.get(key);
  if (!object?.bytes || !object.versionId || object.versionId === 'null') fail();
  return { ...object, descriptor: { key, versionId: object.versionId,
    sha256: hash(object.bytes), bytes: object.bytes.length } };
}
function validateConfig(config) {
  if (!config.bucket || !/^[0-9]{12}$/.test(config.accountId)
    || !integer(config.portalId) || config.portalId === 0
    || Object.keys(config.tables).join(',') !== 'participants,intake') fail();
  for (const arn of Object.values(config.tables)) {
    if (!/^arn:aws(?:-cn|-us-gov)?:dynamodb:[a-z0-9-]+:[0-9]{12}:table\/[A-Za-z0-9_.-]+$/.test(arn)
      || /session/i.test(arn)) fail();
  }
  if (config.tables.participants === config.tables.intake) fail();
}

export async function startRecovery(config, deps, scheduledTime) {
  validateConfig(config);
  const scheduled = new Date(scheduledTime);
  if (!Number.isFinite(scheduled.getTime())) fail();
  const day = scheduled.toISOString().slice(0, 10), prefix = runPrefix(day);
  if (await deps.get(`${prefix}/complete.json`)) return { status: 'complete' };
  let state = await deps.get(`${prefix}/run.json`);
  state = state ? json(state) : null;
  if (!state) {
    const windows = await Promise.all(Object.values(config.tables).map(arn => deps.recoveryWindow(arn)));
    const earliest = Math.max(...windows.map(x => new Date(x.earliest).getTime()));
    const latest = Math.min(...windows.map(x => new Date(x.latest).getTime()));
    if (!Number.isFinite(earliest) || !Number.isFinite(latest) || earliest > latest) fail();
    // A new table may have only minutes of PITR history; choose one common supported point.
    const point = Math.max(earliest, Math.min(latest, scheduled.getTime() - 600000));
    state = { version: 1, day, status: 'pending', startedAt: deps.now().toISOString(),
      pointInTime: new Date(point).toISOString(), exports: {} };
    await deps.put(`${prefix}/run.json`, state);
  }
  for (const [name, TableArn] of Object.entries(config.tables)) {
    if (state.exports[name]) continue;
    const request = { TableArn, ExportTime: new Date(state.pointInTime),
      ExportType: 'FULL_EXPORT', ExportFormat: 'DYNAMODB_JSON', S3Bucket: config.bucket,
      S3BucketOwner: config.accountId, S3Prefix: `${prefix}/${name}`, S3SseAlgorithm: 'AES256',
      ClientToken: hash(`${TableArn}|${state.pointInTime}|${prefix}`).slice(0, 32) };
    const exportArn = await deps.startExport(request);
    if (typeof exportArn !== 'string' || !exportArn.startsWith(`${TableArn}/export/`)) fail();
    state.exports[name] = exportArn;
    await deps.put(`${prefix}/run.json`, state);
  }
  return { status: 'pending', day, pointInTime: state.pointInTime };
}

export async function verifyExport(config, deps, name, description, prefix, pointInTime) {
  const d = description;
  if (d.ExportStatus !== 'COMPLETED' || d.TableArn !== config.tables[name]
    || d.S3Bucket !== config.bucket || d.S3Prefix !== prefix || d.S3SseAlgorithm !== 'AES256'
    || d.ExportFormat !== 'DYNAMODB_JSON' || d.ExportType !== 'FULL_EXPORT'
    || new Date(d.ExportTime).toISOString() !== pointInTime || !integer(d.ItemCount)) fail();
  const summaryObject = await readVerified(deps, nativeKey(d.ExportManifest, prefix));
  const summary = json(summaryObject);
  if (summary.exportArn !== d.ExportArn || summary.tableArn !== d.TableArn
    || summary.s3Bucket !== config.bucket || summary.s3Prefix !== prefix
    || summary.s3SseAlgorithm !== 'AES256' || summary.outputFormat !== 'DYNAMODB_JSON'
    || Date.parse(summary.exportTime) !== Date.parse(pointInTime) || summary.itemCount !== d.ItemCount) fail();
  const filesObject = await readVerified(deps, nativeKey(summary.manifestFilesS3Key, prefix));
  const files = lines(filesObject.bytes), seen = new Set(), contacts = new Set();
  if ((!files.length && d.ItemCount !== 0) || files.length > 10000) fail();
  const objects = [summaryObject.descriptor, filesObject.descriptor];
  let count = 0;
  for (const file of files) {
    const key = nativeKey(file.dataFileS3Key, prefix);
    if (seen.has(key) || !integer(file.itemCount)) fail();
    seen.add(key);
    const object = await readVerified(deps, key);
    if (hash(object.bytes, 'md5', 'base64') !== file.md5Checksum) fail();
    const items = lines(gunzipSync(object.bytes, { maxOutputLength: 64 * 1024 * 1024 }));
    if (items.length !== file.itemCount || items.some(x => !x.Item || typeof x.Item !== 'object')) fail();
    count += items.length;
    if (name === 'participants') for (const { Item: item } of items) {
      const syncBinding = /^SYNC#(?:APPLICATION|EMAIL)#/.test(item.pk?.S ?? '') && item.state?.S === 'synced';
      const contactId = item.hubspotContactId?.S ?? (syncBinding ? item.contactId?.S : undefined);
      if (!contactId) continue;
      // Sync rows are written by the single-portal bridge, whose exact app/portal is checked below.
      if (!/^[1-9][0-9]*$/.test(contactId)
        || (!syncBinding && Number(item.hubspotPortalId?.N) !== config.portalId)) fail();
      contacts.add(contactId);
    }
    objects.push({ ...object.descriptor, itemCount: file.itemCount, md5: file.md5Checksum });
  }
  if (count !== d.ItemCount) fail();
  return { exportArn: d.ExportArn, tableArn: d.TableArn, pointInTime, itemCount: count,
    objects, contactIds: [...contacts].sort() };
}

export async function verifyRecovery(config, deps, day) {
  validateConfig(config);
  const prefix = runPrefix(day);
  const complete = await deps.get(`${prefix}/complete.json`);
  if (complete) {
    const manifest = json(complete);
    // Measure the actual recovery point, not a delayed completion or replay time.
    await deps.completed(manifest.pointInTime);
    return manifest;
  }
  const stateObject = await deps.get(`${prefix}/run.json`);
  if (!stateObject) return { status: 'not-started', day };
  const state = json(stateObject);
  try {
    const descriptions = {};
    for (const [name, arn] of Object.entries(config.tables)) {
      const exportArn = state.exports?.[name];
      if (!exportArn) return { status: 'pending', day };
      if (!exportArn.startsWith(`${arn}/export/`)) fail();
      const description = await deps.describeExport(exportArn);
      if (description?.ExportArn !== exportArn || description.ExportStatus === 'FAILED') fail();
      if (description.ExportStatus !== 'COMPLETED') return { status: 'pending', day };
      descriptions[name] = description;
    }
    const tables = {};
    for (const name of Object.keys(config.tables)) {
      tables[name] = await verifyExport(config, deps, name, descriptions[name], `${prefix}/${name}`, state.pointInTime);
    }
    const ids = tables.participants.contactIds;
    const hubspot = await deps.snapshot(ids, `${prefix}/hubspot`);
    for (const table of Object.values(tables)) delete table.contactIds;
    const manifest = { version: 1, status: 'complete', day, startedAt: state.startedAt,
      completedAt: deps.now().toISOString(), pointInTime: state.pointInTime, tables, hubspot,
      excluded: ['sessions', 'credentials', 'hubspot-notes-tasks-associations'],
      restorePolicy: 'Quarantine only; reconcile erasures and suspensions; no active sessions or automatic identity reactivation.' };
    await deps.put(`${prefix}/complete.json`, manifest);
    await deps.completed(manifest.pointInTime);
    return manifest;
  } catch {
    await deps.put(`${prefix}/failure.json`, { version: 1, status: 'partial', day,
      failedAt: deps.now().toISOString(), code: 'recovery-verification-failed' });
    fail();
  }
}
