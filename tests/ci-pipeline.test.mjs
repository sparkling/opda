import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { classifyPaths } from '../scripts/lib/ci-change-classifier.mjs';
import { routesForPaths } from '../scripts/lib/changed-routes.mjs';
import { validateTestInventory } from '../scripts/check-ci-test-inventory.mjs';
import { selectNodeTests } from '../scripts/run-tiered-node-tests.mjs';
import { createReleaseManifest, writeReleaseManifest } from '../scripts/write-release-manifest.mjs';
import { inspectArtifact } from '../scripts/report-artifact-size.mjs';

test('change classification selects only the evidence lanes touched by a change', () => {
  assert.deepEqual(classifyPaths(['src/pages/programme.astro']), {
    editorial: true,
    application: false,
    ontology: false,
    infrastructure: false,
    site: true,
    primary: 'editorial',
  });
  assert.equal(classifyPaths(['public/ui/client.js']).primary, 'application');
  assert.equal(classifyPaths(['source/03-standards/ontology/core.ttl']).primary, 'ontology');
  assert.deepEqual(classifyPaths(['config/aws/site-stack.yaml']), {
    editorial: false,
    application: false,
    ontology: false,
    infrastructure: true,
    site: false,
    primary: 'infrastructure',
  });
  const mixed = classifyPaths(['src/pages/index.astro', 'config/aws/site-stack.yaml']);
  assert.equal(mixed.editorial, true);
  assert.equal(mixed.infrastructure, true);
  assert.equal(mixed.site, true);
  assert.equal(mixed.primary, 'infrastructure');
});

test('unknown and empty changes fail safe into application validation', () => {
  for (const paths of [[], ['unexpected/new-boundary.xyz']]) {
    const result = classifyPaths(paths);
    assert.equal(result.application, true);
    assert.equal(result.site, true);
    assert.equal(result.primary, 'application');
  }
});

test('changed source pages map to emitted routes with a critical fallback', () => {
  assert.deepEqual(routesForPaths(['src/pages/index.astro', 'src/pages/join/index.astro']), ['/', '/join']);
  assert.deepEqual(routesForPaths(['docs/adr/ADR-0083-rebuild-proportionate-risk-based-ci-cd.md']), [
    '/modelling/adr/adr-0083',
  ]);
  assert.deepEqual(routesForPaths(['src/components/Header.astro']), [
    '/', '/join', '/search', '/programme', '/semantic-modelling/method/languages-and-profiles',
  ]);
});

test('release manifest records validated immutable artifact identity', async () => {
  const commit = 'a'.repeat(40);
  const manifest = createReleaseManifest({
    commit,
    lane: 'editorial',
    builtAt: '2026-09-07T10:00:00.000Z',
    runId: '1234',
    runAttempt: '2',
  });
  assert.deepEqual(manifest, {
    schemaVersion: 1,
    sourceCommit: commit,
    validationLane: 'editorial',
    builtAt: '2026-09-07T10:00:00.000Z',
    githubRunId: '1234',
    githubRunAttempt: '2',
  });

  const directory = await mkdtemp(join(tmpdir(), 'opda-release-'));
  await writeReleaseManifest(directory, manifest);
  assert.deepEqual(JSON.parse(await readFile(join(directory, 'release.json'), 'utf8')), manifest);
  assert.throws(() => createReleaseManifest({ commit: 'main', lane: 'editorial' }), /40-character Git commit/u);
  assert.throws(() => createReleaseManifest({ commit, lane: 'anything' }), /validation lane/u);
});

test('artifact inspection reports bytes and enforces the configured ceiling', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'opda-artifact-'));
  await writeFile(join(directory, 'index.html'), '12345');
  await writeFile(join(directory, 'asset.js'), '123');
  const report = await inspectArtifact(directory, 10);
  assert.equal(report.totalBytes, 8);
  assert.equal(report.fileCount, 2);
  assert.equal(report.withinBudget, true);
  assert.equal((await inspectArtifact(directory, 7)).withinBudget, false);
});

test('every automated test has exactly one owner, tier and validation lane', async () => {
  const result = await validateTestInventory(
    new URL('../', import.meta.url).pathname,
    new URL('../config/ci-test-tiers.json', import.meta.url),
  );
  assert.deepEqual(result.duplicates, []);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.stale, []);
  assert.deepEqual(result.invalid, []);
});

test('tiered runner excludes scheduled and development-only tests', async () => {
  const manifest = JSON.parse(await readFile(new URL('../config/ci-test-tiers.json', import.meta.url), 'utf8'));
  const selected = selectNodeTests(manifest, 'application');
  assert.ok(selected.includes('tests/auth-session.test.mjs'));
  assert.ok(selected.includes('tests/ci-pipeline.test.mjs'));
  assert.ok(!selected.includes('tests/prefixed-preview.test.mjs'));
  assert.ok(!selected.some((path) => path.includes('/e2e/')));
});

test('release browser evidence stays small while broad assurance stays off the deploy path', async () => {
  const [smoke, release, assurance] = await Promise.all([
    readFile(new URL('./e2e/release-smoke.spec.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../.github/workflows/site-release.yml', import.meta.url), 'utf8'),
    readFile(new URL('../.github/workflows/site-assurance.yml', import.meta.url), 'utf8'),
  ]);
  assert.equal((smoke.match(/^test\('/gmu) ?? []).length, 5);
  assert.doesNotMatch(release, /run: pnpm run test:e2e\s*$/mu);
  assert.doesNotMatch(release, /run: pnpm run check:routes\s*$/mu);
  assert.match(assurance, /run: pnpm run test:e2e\s*$/mu);
  assert.match(assurance, /pnpm run check:routes && pnpm run check:resource-links/u);
  assert.doesNotMatch(assurance, /configure-aws-credentials|aws s3 sync/u);
});

test('content-addressed assets are immutable, published first and retained for open pages', async () => {
  const release = await readFile(new URL('../.github/workflows/site-release.yml', import.meta.url), 'utf8');
  assert.match(release, /for ASSET_PREFIX in _astro _images/u);
  assert.match(release, /--cache-control 'public,max-age=31536000,immutable'/u);
  assert.ok(release.indexOf('for ASSET_PREFIX') < release.indexOf('site-cache-release.mjs deploy dist'));
  assert.match(release, /for ASSET_PREFIX in _astro _images _ui/u);
  assert.doesNotMatch(release, /aws s3 sync[^\n]*--delete/u);
});

test('break-glass shares the production lock and cache-safe publisher without adding release gates', async () => {
  const [normal, emergency] = await Promise.all([
    readFile(new URL('../.github/workflows/deploy-aws.yml', import.meta.url), 'utf8'),
    readFile(new URL('../.github/workflows/deploy-aws-break-glass.yml', import.meta.url), 'utf8'),
  ]);
  const lock = workflow => workflow.match(/concurrency:\s*\n\s*group:\s*(.+)/u)?.[1];
  assert.equal(lock(emergency), lock(normal), 'all main-site publishers serialize on the same production lock');
  assert.match(emergency, /cancel-in-progress: false/u);
  assert.match(emergency, /github\.event_name == 'workflow_dispatch' && inputs\.confirm_release/u);
  assert.match(emergency, /contains\(github\.event\.head_commit\.message, '\[break-glass-release\]'\)/u);
  assert.match(emergency, /run: pnpm run build/u);
  assert.doesNotMatch(emergency, /pnpm run test:|make ci\b|pnpm run check:/u);
  assert.match(emergency, /site-cache-release\.mjs manifest dist/u);
  assert.match(emergency, /for ASSET_PREFIX in _astro _images _ui/u);
  assert.match(emergency, /--cache-control 'public,max-age=31536000,immutable'/u);
  assert.ok(emergency.indexOf('site-cache-release.mjs manifest dist') < emergency.indexOf('for ASSET_PREFIX'));
  assert.ok(emergency.indexOf('for ASSET_PREFIX') < emergency.indexOf('site-cache-release.mjs deploy dist'));
  assert.doesNotMatch(emergency, /--delete|--paths ['"]\/\*/u);
});
