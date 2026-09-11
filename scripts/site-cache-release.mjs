#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { access, copyFile, link, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { CACHE_MANIFEST, CACHE_BOOTSTRAP_BASELINE, HTML_CACHE_CONTROL, IMMUTABLE_PREFIXES, MUTABLE_CACHE_CONTROL, createBootstrapBaseline, createCacheManifest, planCacheRelease } from './lib/site-cache-manifest.mjs';

const run = promisify(execFile);
async function aws(args) {
  const result = await run('aws', args, { maxBuffer: 32 * 1024 * 1024 });
  return result.stdout;
}

async function writeJson(filename, value) { await writeFile(filename, `${JSON.stringify(value, null, 2)}\n`); }
function batches(values, size) {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
}

export function createInvalidationBatches(previous, next, paths, executionId) {
  if (typeof executionId !== 'string' || !executionId.trim()) throw new Error('Missing deployment execution identity');
  const ordered = [...new Set(paths)].sort();
  const wildcardPaths = ordered.filter(value => value.endsWith('*'));
  const exactPaths = ordered.filter(value => !value.endsWith('*'));
  return [...batches(wildcardPaths, 15), ...batches(exactPaths, 3000)].map(Items => ({
    // CloudFront rejects one caller reference with different paths. Include the
    // exact batch, and distinguish a later A -> B -> A -> B from its first purge.
    CallerReference: `opda-${createHash('sha256').update(JSON.stringify([executionId, previous, next, Items])).digest('hex')}`,
    Paths: { Quantity: Items.length, Items },
  }));
}

function deploymentExecutionId() {
  const { GITHUB_RUN_ID, GITHUB_RUN_ATTEMPT } = process.env;
  return GITHUB_RUN_ID && GITHUB_RUN_ATTEMPT ? `github-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}` : randomUUID();
}

export async function writeCacheManifest(directory) {
  const manifest = await createCacheManifest(directory);
  await writeJson(path.join(directory, CACHE_MANIFEST), manifest);
  console.log(`[cache] recorded ${Object.keys(manifest.files).length} mutable object hashes.`);
  return manifest;
}

async function prepareRelease(directory, bucket, runAws) {
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/u.test(bucket)) throw new Error('Invalid site bucket');
  const root = path.resolve(directory);
  const next = JSON.parse(await readFile(path.join(root, CACHE_MANIFEST), 'utf8'));
  const actual = await createCacheManifest(root);
  if (JSON.stringify(next) !== JSON.stringify(actual)) {
    const expectedFiles = next?.files ?? {};
    const differingKeys = [...new Set([...Object.keys(expectedFiles), ...Object.keys(actual.files)])]
      .filter(key => JSON.stringify(expectedFiles[key]) !== JSON.stringify(actual.files[key]));
    const detail = differingKeys.length ? `; differing keys: ${differingKeys.slice(0, 5).join(', ')}${differingKeys.length > 5 ? ' …' : ''}` : '';
    throw new Error(`Validated artifact does not match its cache manifest${detail}`);
  }
  const workspace = await mkdtemp(path.join(tmpdir(), 'opda-cache-release-'));
  // Missing permissions must fail, not masquerade as an absent baseline.
  const keys = JSON.parse(await runAws(['s3api', 'list-objects-v2', '--bucket', bucket, '--query', 'Contents[].Key', '--output', 'json'])) ?? [];
  if (!Array.isArray(keys)) throw new Error('Invalid published object inventory');
  let previous = null;
  if (keys.includes(CACHE_MANIFEST)) {
    const filename = path.join(workspace, 'previous-manifest.json');
    await runAws(['s3api', 'get-object', '--bucket', bucket, '--key', CACHE_MANIFEST, filename]);
    previous = JSON.parse(await readFile(filename, 'utf8'));
    if (!previous) throw new Error('Invalid cache manifest');
  }
  let bootstrap = null;
  let bootstrapNeedsWrite = false;
  const bootstrapFile = path.join(workspace, CACHE_BOOTSTRAP_BASELINE);
  if (!previous) {
    if (keys.includes(CACHE_BOOTSTRAP_BASELINE)) {
      await runAws(['s3api', 'get-object', '--bucket', bucket, '--key', CACHE_BOOTSTRAP_BASELINE, bootstrapFile]);
      bootstrap = JSON.parse(await readFile(bootstrapFile, 'utf8'));
    } else {
      bootstrap = createBootstrapBaseline(keys);
      bootstrapNeedsWrite = true;
    }
  }
  const plan = planCacheRelease(previous, next, keys, bootstrap);
  await writeJson(path.join(workspace, 'plan.json'), plan);
  for (const key of plan.changed) {
    const stage = key.endsWith('.html') ? 'html' : 'mutable';
    const target = path.join(workspace, stage, key);
    await mkdir(path.dirname(target), { recursive: true });
    await link(path.join(root, key), target).catch(async error => {
      if (error.code !== 'EXDEV') throw error;
      await copyFile(path.join(root, key), target);
    });
  }
  if (bootstrapNeedsWrite) {
    // Persist the original inventory before any mutable publication. A retry
    // must reuse it; a racing first publisher cannot silently replace it.
    await writeJson(bootstrapFile, bootstrap);
    await runAws(['s3api', 'put-object', '--bucket', bucket, '--key', CACHE_BOOTSTRAP_BASELINE,
      '--body', bootstrapFile, '--content-type', 'application/json', '--cache-control', 'no-store', '--if-none-match', '*']);
  }
  console.log(`[cache] ${plan.changed.length} changed uploads; ${plan.deleted.length} deleted mutable objects; ${plan.invalidations.length} targeted invalidation paths.`);
  return { root, next, previous, workspace, plan };
}

/** CI-only deployment of the validated artifact; never rebuilds its content. */
export async function deployCacheRelease(directory, bucket, distribution, { runAws = aws, executionId = deploymentExecutionId() } = {}) {
  if (!/^[A-Z0-9]{8,32}$/u.test(distribution)) throw new Error('Invalid CloudFront distribution');
  if (typeof executionId !== 'string' || !executionId.trim()) throw new Error('Missing deployment execution identity');
  const { root, next, previous, workspace, plan } = await prepareRelease(directory, bucket, runAws);
  // The workflow has already uploaded all immutable prefixes before this step.
  const uploads = [];
  for (const [stage, cacheControl] of [['mutable', MUTABLE_CACHE_CONTROL], ['html', HTML_CACHE_CONTROL]]) {
    const stagePath = path.join(workspace, stage);
    if (await access(stagePath).then(() => true, () => false)) {
      uploads.push(runAws(['s3', 'cp', `${stagePath}/`, `s3://${bucket}/`, '--recursive', '--only-show-errors', '--cache-control', cacheControl]));
    }
  }
  await Promise.all(uploads);
  for (const [index, keys] of batches(plan.deleted, 1000).entries()) {
    const filename = path.join(workspace, `delete-${index}.json`);
    await writeJson(filename, { Objects: keys.map(Key => ({ Key })), Quiet: true });
    const response = JSON.parse(await runAws(['s3api', 'delete-objects', '--bucket', bucket, '--delete', `file://${filename}`]));
    if (response.Errors?.length) throw new Error(`S3 refused ${response.Errors.length} requested object deletions`);
  }
  // Retries within one execution reuse caller references, and no more than 3,000
  // individual paths are in flight at once. Compact complete changed subtrees
  // keep the normal release to a small batch without touching immutable assets.
  const invalidationBatches = createInvalidationBatches(previous, next, plan.invalidations, executionId);
  const queues = Object.groupBy(invalidationBatches.entries(), ([, batch]) => batch.Paths.Items[0]?.endsWith('*') ? 'wildcard' : 'exact');
  await Promise.all(Object.values(queues).map(async queue => {
    for (const [index, batch] of queue) {
      const filename = path.join(workspace, `invalidate-${index}.json`);
      await writeJson(filename, batch);
      const response = JSON.parse(await runAws(['cloudfront', 'create-invalidation', '--distribution-id', distribution, '--invalidation-batch', `file://${filename}`]));
      await runAws(['cloudfront', 'wait', 'invalidation-completed', '--distribution-id', distribution, '--id', response.Invalidation.Id]);
    }
  }));
  // Advance the baseline only after the whole publication succeeds. Immutable
  // objects are deliberately absent from deletion plans and survive rollbacks.
  await runAws(['s3', 'cp', path.join(root, CACHE_MANIFEST), `s3://${bucket}/${CACHE_MANIFEST}`, '--only-show-errors', '--cache-control', 'no-store']);
  console.log(`[cache] live publication complete; retained ${IMMUTABLE_PREFIXES.join(', ')} histories.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [command, directory = 'dist', bucket, distribution] = process.argv.slice(2);
  if (command === 'manifest') await writeCacheManifest(directory);
  else if (command === 'deploy') await deployCacheRelease(directory, bucket, distribution);
  else throw new Error('Usage: site-cache-release.mjs manifest <dist> | deploy <dist> <bucket> <distribution>');
}
