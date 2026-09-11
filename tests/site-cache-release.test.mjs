import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CACHE_MANIFEST, CACHE_BOOTSTRAP_BASELINE, createBootstrapBaseline, createCacheManifest, planCacheRelease, invalidationAliases, cachePolicyFor } from '../scripts/lib/site-cache-manifest.mjs';
import { createInvalidationBatches, deployCacheRelease, writeCacheManifest } from '../scripts/site-cache-release.mjs';

async function put(root, name, value) {
  await mkdir(path.dirname(path.join(root, name)), { recursive: true });
  await writeFile(path.join(root, name), value);
}

test('two releases invalidate changed/deleted mutable routes, never unchanged or immutable assets', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'opda-cache-plan-'));
  await put(root, 'index.html', '<h1>one</h1>');
  await put(root, 'programme/index.html', 'unchanged');
  await put(root, 'retired/index.html', 'remove me');
  await put(root, 'ui/client.js', 'old');
  await put(root, '_ui/client.ABC.js', 'immutable old');
  await put(root, '_images/art.DEF.webp', 'immutable image');
  const first = await createCacheManifest(root);
  await put(root, 'index.html', '<h1>two</h1>');
  await put(root, 'ui/client.js', 'new');
  await put(root, '_ui/client.GHI.js', 'immutable new');
  const second = await createCacheManifest(root);
  delete second.files['retired/index.html'];
  const plan = planCacheRelease(first, second);
  assert.deepEqual(plan.changed, ['index.html', 'ui/client.js']);
  assert.deepEqual(plan.deleted, ['retired/index.html']);
  assert.ok(plan.invalidations.includes('/index.html'));
  assert.ok(plan.invalidations.includes('/'));
  assert.ok(plan.invalidations.includes('/retired'));
  assert.ok(plan.invalidations.some(value => value.startsWith('/retired/')));
  assert.ok(!plan.invalidations.some(value => value.includes('programme')));
  assert.ok(!plan.invalidations.some(value => value.startsWith('/_ui') || value.startsWith('/_images')));
  assert.ok(!plan.invalidations.includes('/*'));
  assert.deepEqual(planCacheRelease(second, second).invalidations, []);
});

test('bootstrap preserves untracked objects and gives each cache class an explicit policy', () => {
  const next = { schemaVersion: 1, files: { 'index.html': { sha256: 'a'.repeat(64), cacheControl: cachePolicyFor('index.html') } } };
  const keys = ['index.html', 'unknown/index.html', 'outside-owner.txt', '_astro/old.HASH.js', '_images/old.HASH.webp', '_ui/old.HASH.css'];
  const plan = planCacheRelease(null, next, keys, createBootstrapBaseline(keys));
  assert.deepEqual(plan.deleted, []);
  assert.deepEqual(plan.invalidations, ['/', '/index.html']);
  assert.match(cachePolicyFor('_ui/site.HASH.css'), /31536000,immutable/);
  assert.equal(cachePolicyFor('index.html'), 'public,max-age=0,s-maxage=86400,must-revalidate');
  assert.match(cachePolicyFor('ui/site.css'), /max-age=0.*s-maxage=86400/);
  assert.deepEqual(invalidationAliases('programme/index.html'), ['/programme', '/programme/', '/programme/index.html']);
  assert.deepEqual(invalidationAliases('index.html'), ['/', '/index.html']);
  assert.throws(() => planCacheRelease(null, next, keys), /bootstrap baseline/i);
  assert.throws(() => createBootstrapBaseline(['../outside']), /unsafe/i);
});

test('unsafe manifest keys fail closed instead of broadening deletion or invalidation', () => {
  for (const key of ['../elsewhere', '/absolute', 'section/../../x', 'x*', 'x?y', 'x\\y']) {
    assert.throws(() => planCacheRelease(null, { schemaVersion: 1, files: { [key]: { sha256: 'a'.repeat(64) } } }), /unsafe|invalid/i);
  }
});

test('a changed subtree cannot invalidate unchanged archived resources beneath it', () => {
  const root = 'development/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/';
  const key = `${root}index.html`;
  const next = { schemaVersion: 1, files: { [key]: { sha256: 'a'.repeat(64), cacheControl: cachePolicyFor(key) } } };
  const archived = `${root}tools/widoco/report.js`;
  const plan = planCacheRelease(null, next, [key, archived], createBootstrapBaseline([key, archived]));
  assert.deepEqual(plan.deleted, []);
  assert.ok(!plan.invalidations.some(value => value.endsWith('*')));
});

test('release workflow keeps hash prefixes, stages changed mutable files and avoids blanket purge', async () => {
  const workflow = await readFile(new URL('../.github/workflows/site-release.yml', import.meta.url), 'utf8');
  assert.match(workflow, /_astro _images _ui/);
  assert.match(workflow, /site-cache-release\.mjs manifest dist/);
  assert.match(workflow, /site-cache-release\.mjs deploy dist/);
  assert.doesNotMatch(workflow, /--paths ['"]\/\*/);
  const manifest = workflow.indexOf('name: Record mutable-object hashes and cache policies');
  assert.ok(manifest > workflow.indexOf('name: Enforce artifact budget'), 'the budget report writes a file and must precede the manifest');
  assert.ok(manifest > workflow.indexOf('name: Focused application browser journeys'), 'record only the final validated artifact');
  assert.ok(manifest < workflow.indexOf('name: Upload immutable validated site'), 'the final manifest must travel with its artifact');
});

test('invalidation identities include the exact batch and deployment execution', () => {
  const a = { schemaVersion: 1, files: { 'index.html': { sha256: 'a'.repeat(64), cacheControl: cachePolicyFor('index.html') } } };
  const b = { schemaVersion: 1, files: { 'index.html': { sha256: 'b'.repeat(64), cacheControl: cachePolicyFor('index.html') } } };
  const paths = ['/', '/index.html'];
  const first = createInvalidationBatches(a, b, paths, 'run-1-attempt-1');
  assert.deepEqual(createInvalidationBatches(a, b, [...paths].reverse(), 'run-1-attempt-1'), first);
  assert.notEqual(createInvalidationBatches(a, b, ['/', '/different.html'], 'run-1-attempt-1')[0].CallerReference, first[0].CallerReference);
  // A -> B -> A -> B must invalidate again, not retrieve the first completed purge.
  const rollback = createInvalidationBatches(b, a, paths, 'run-2-attempt-1');
  const redeploy = createInvalidationBatches(a, b, paths, 'run-3-attempt-1');
  assert.notEqual(rollback[0].CallerReference, first[0].CallerReference);
  assert.notEqual(redeploy[0].CallerReference, first[0].CallerReference);
  const many = createInvalidationBatches(a, b, [
    ...Array.from({ length: 16 }, (_, index) => `/group-${index}/*`),
    ...Array.from({ length: 3001 }, (_, index) => `/page-${index}.html`),
  ], 'large-run');
  assert.deepEqual(many.map(batch => batch.Paths.Quantity), [15, 1, 3000, 1]);
  assert.equal(new Set(many.map(batch => batch.CallerReference)).size, 4);
  assert.throws(() => createInvalidationBatches(a, b, paths, ''), /execution identity/i);
});

async function releaseFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'opda-cache-deploy-'));
  await put(root, 'index.html', '<h1>new page</h1>');
  await put(root, 'section/index.html', '<h1>new section</h1>');
  const next = await createCacheManifest(root);
  await put(root, CACHE_MANIFEST, JSON.stringify(next));
  return { root, next };
}

function fakeAws(initial = {}, before = () => {}) {
  const objects = new Map(Object.entries(initial));
  const calls = [];
  const invalidations = [];
  const seen = new Map();
  const runAws = async args => {
    calls.push(args);
    await before(args);
    const option = name => args[args.indexOf(name) + 1];
    if (args[0] === 's3api' && args[1] === 'list-objects-v2') return JSON.stringify([...objects.keys()]);
    if (args[0] === 's3api' && args[1] === 'get-object') {
      const key = option('--key');
      if (!objects.has(key)) throw new Error('Expected baseline is missing');
      await writeFile(args.at(-1), objects.get(key));
      return '{}';
    }
    if (args[0] === 's3api' && args[1] === 'put-object') {
      const key = option('--key');
      assert.equal(option('--if-none-match'), '*');
      if (objects.has(key)) throw new Error('PreconditionFailed');
      objects.set(key, await readFile(option('--body'), 'utf8'));
      return '{}';
    }
    if (args[0] === 's3' && args[1] === 'cp') {
      if (args.includes('--recursive')) {
        const manifest = await createCacheManifest(args[2]);
        for (const key of Object.keys(manifest.files)) objects.set(key, await readFile(path.join(args[2], key), 'utf8'));
      } else objects.set(CACHE_MANIFEST, await readFile(args[2], 'utf8'));
      return '';
    }
    if (args[0] === 's3api' && args[1] === 'delete-objects') {
      const batch = JSON.parse(await readFile(option('--delete').slice('file://'.length), 'utf8'));
      for (const { Key } of batch.Objects) objects.delete(Key);
      return '{}';
    }
    if (args[0] === 'cloudfront' && args[1] === 'create-invalidation') {
      const batch = JSON.parse(await readFile(option('--invalidation-batch').slice('file://'.length), 'utf8'));
      if (seen.has(batch.CallerReference)) assert.deepEqual(batch, seen.get(batch.CallerReference));
      seen.set(batch.CallerReference, batch);
      invalidations.push(batch);
      return JSON.stringify({ Invalidation: { Id: 'I12345678' } });
    }
    if (args[0] === 'cloudfront' && args[1] === 'wait') return '';
    throw new Error(`Unexpected mock operation: ${JSON.stringify(args)}`);
  };
  return { objects, calls, invalidations, runAws };
}

test('artifact writers precede the manifest; a later added report fails integrity before AWS calls', async () => {
  const { root } = await releaseFixture();
  const report = JSON.stringify({ schemaVersion: 1, withinBudget: true });
  await put(root, 'artifact-size-report.json', report);
  const remote = fakeAws();
  const options = { runAws: remote.runAws, executionId: 'artifact-order-run' };
  await assert.rejects(deployCacheRelease(root, 'test-site-bucket', 'E123456789', options), /Validated artifact does not match its cache manifest.*artifact-size-report\.json/);
  assert.deepEqual(remote.calls, [], 'unrecorded files must not reach mutable publication');
  const next = await writeCacheManifest(root);
  assert.ok(next.files['artifact-size-report.json']);
  await deployCacheRelease(root, 'test-site-bucket', 'E123456789', options);
  assert.equal(remote.objects.get('artifact-size-report.json'), report);
  assert.deepEqual(JSON.parse(remote.objects.get(CACHE_MANIFEST)), next);
});

test('an interrupted bootstrap persists its baseline before publication and safely retries', async () => {
  const { root, next } = await releaseFixture();
  let interrupt = true;
  const initial = { 'index.html': 'old page', 'untracked/index.html': 'preserve', '_ui/old.HASH.js': 'immutable history' };
  const remote = fakeAws(initial, args => {
    if (interrupt && args[0] === 'cloudfront' && args[1] === 'wait') {
      interrupt = false;
      throw new Error('Simulated interrupted waiter');
    }
  });
  const options = { runAws: remote.runAws, executionId: 'bootstrap-run' };
  await assert.rejects(deployCacheRelease(root, 'test-site-bucket', 'E123456789', options), /interrupted waiter/);
  const baseline = JSON.parse(remote.objects.get(CACHE_BOOTSTRAP_BASELINE));
  assert.deepEqual(baseline, createBootstrapBaseline(Object.keys(initial)));
  assert.equal(remote.objects.has(CACHE_MANIFEST), false);
  const baselineWrite = remote.calls.findIndex(args => args[0] === 's3api' && args[1] === 'put-object');
  const siteWrite = remote.calls.findIndex(args => args[0] === 's3' && args[1] === 'cp');
  assert.ok(baselineWrite >= 0 && baselineWrite < siteWrite);
  await deployCacheRelease(root, 'test-site-bucket', 'E123456789', options);
  assert.deepEqual(JSON.parse(remote.objects.get(CACHE_MANIFEST)), next);
  assert.equal(remote.objects.get('untracked/index.html'), 'preserve');
  assert.equal(remote.objects.get('_ui/old.HASH.js'), 'immutable history');
  assert.equal(remote.calls.filter(args => args[0] === 's3api' && args[1] === 'put-object').length, 1);
  assert.equal(remote.calls.filter(args => args[1] === 'delete-objects').length, 0);
  assert.deepEqual(remote.invalidations[0], remote.invalidations[1]);
  assert.equal(remote.calls.at(-1)[3], `s3://test-site-bucket/${CACHE_MANIFEST}`);
});

test('tracked removals remain in the retry plan after deletion but before manifest advancement', async () => {
  const { root, next } = await releaseFixture();
  const previous = { schemaVersion: 1, files: {
    'index.html': { sha256: 'a'.repeat(64), cacheControl: cachePolicyFor('index.html') },
    'retired/index.html': { sha256: 'b'.repeat(64), cacheControl: cachePolicyFor('retired/index.html') },
  } };
  let interrupt = true;
  const remote = fakeAws({
    [CACHE_MANIFEST]: JSON.stringify(previous), 'index.html': 'old page',
    'retired/index.html': 'retired', 'outside-owner.txt': 'not ours',
  }, args => {
    if (interrupt && args[0] === 'cloudfront' && args[1] === 'wait') {
      interrupt = false;
      throw new Error('Simulated interrupted waiter');
    }
  });
  const options = { runAws: remote.runAws, executionId: 'tracked-run' };
  await assert.rejects(deployCacheRelease(root, 'test-site-bucket', 'E123456789', options), /interrupted waiter/);
  assert.equal(remote.objects.has('retired/index.html'), false);
  assert.deepEqual(JSON.parse(remote.objects.get(CACHE_MANIFEST)), previous);
  await deployCacheRelease(root, 'test-site-bucket', 'E123456789', options);
  assert.deepEqual(remote.invalidations[0], remote.invalidations[1]);
  assert.ok(remote.invalidations.some(batch => batch.Paths.Items.includes('/retired')));
  assert.equal(remote.objects.get('outside-owner.txt'), 'not ours');
  assert.deepEqual(JSON.parse(remote.objects.get(CACHE_MANIFEST)), next);
});

test('unreadable, invalid, or unpersistable baselines stop before site mutation', async () => {
  const { root } = await releaseFixture();
  for (const [initial, before, expected] of [
    [{ [CACHE_MANIFEST]: '{}' }, () => {}, /invalid cache manifest/i],
    [{ [CACHE_MANIFEST]: 'null' }, () => {}, /invalid cache manifest/i],
    [{ [CACHE_BOOTSTRAP_BASELINE]: '{"schemaVersion":1,"keys":"not an array"}' }, () => {}, /invalid bootstrap baseline/i],
    [{ [CACHE_MANIFEST]: '{}' }, args => { if (args[1] === 'get-object') throw new Error('AccessDenied'); }, /AccessDenied/],
    [{}, args => { if (args[1] === 'put-object') throw new Error('Baseline write refused'); }, /write refused/],
  ]) {
    const remote = fakeAws(initial, before);
    await assert.rejects(deployCacheRelease(root, 'test-site-bucket', 'E123456789', { runAws: remote.runAws, executionId: 'failed-run' }), expected);
    assert.ok(!remote.calls.some(args => args[0] === 's3' || args[0] === 'cloudfront' || args[1] === 'delete-objects'));
  }
});
