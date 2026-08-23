import assert from 'node:assert/strict';
import {
  mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { checkResourceLinkCoverage } from '../scripts/check-resource-link-coverage.mjs';

import {
  ONTOLOGY_ASSET_CLASSES,
  classifyOntologyAsset,
  deriveExpectedOntologyAssets,
  expectedOntologyAssetPaths,
  isExpectedOntologyAsset,
  isExpectedOntologyAssetUrl,
  validateOntologyAssetPath,
} from '../src/lib/ontology-publication-assets.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('built source-resource links require a manifest receipt and local archive file', () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), 'opda-resource-links-'));
  const dist = path.join(fixture, 'dist');
  const source = path.join(fixture, 'source');
  const manifest = path.join(fixture, 'resources-manifest.json');
  try {
    mkdirSync(dist, { recursive: true });
    mkdirSync(path.join(source, 'docs'), { recursive: true });
    writeFileSync(path.join(dist, 'index.html'), '<a href="/resource?path=source/docs/example.rq">Example</a>');
    writeFileSync(path.join(source, 'docs/example.rq'), 'ASK {}');
    writeFileSync(manifest, JSON.stringify([{ path: 'source/docs/example.rq' }]));
    assert.deepEqual(checkResourceLinkCoverage({ distDir: dist, sourceDir: source, manifestPath: manifest }), {
      linkedResourceCount: 1, verifiedSourceArchive: true,
    });
    writeFileSync(manifest, '[]');
    assert.throws(() => checkResourceLinkCoverage({ distDir: dist, sourceDir: source, manifestPath: manifest }), /not in resources manifest/u);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('the resource index encodes query values without treating literal plus signs as spaces', () => {
  const source = readFileSync(path.join(ROOT, 'src/pages/library/resources.astro'), 'utf8');
  assert.match(source, /encodeURIComponent\(e\.path\)/u);
  assert.doesNotMatch(source, /encodeURI\(e\.path\)/u);
});

test('expected ontology assets come from the retained IA family inventories', () => {
  const paths = expectedOntologyAssetPaths();

  assert.equal(paths.length, 864);
  assert.ok(paths.includes('tools/pylode/index.html'));
  assert.ok(paths.includes('tools/widoco/doc/index-en.html'));
  assert.ok(paths.includes('tools/shaclplay/index.html'));
  assert.ok(paths.includes('tools/ontospy/index.html'));
  assert.ok(paths.includes('tools/custom/index.html'));
  assert.ok(paths.includes('tools/COMPARISON.md'));
  assert.ok(paths.includes('artefacts/opda-merged.ttl'));
  assert.ok(paths.includes('artefacts/source/index.html'));
  assert.equal(isExpectedOntologyAsset('tools/pylode/index.html'), true);
  assert.equal(isExpectedOntologyAsset('artefacts/source/index.html'), true);
  assert.equal(isExpectedOntologyAsset('tools/not-in-the-manifest/index.html'), false);
});

test('ontology asset paths are validated at the logical boundary', () => {
  for (const value of [
    '', '/tools/pylode/index.html', '../tools/pylode/index.html',
    'tools/../artefacts/opda-merged.ttl', 'tools\\pylode\\index.html',
    'source/index.html', 'tools/', 'artefacts/', 'tools/\0bad',
  ]) {
    assert.throws(() => validateOntologyAssetPath(value), /logical ontology asset path/u);
  }
  assert.equal(validateOntologyAssetPath('tools/pylode/index.html'), 'tools/pylode/index.html');
  assert.equal(validateOntologyAssetPath('artefacts/source/index.html'), 'artefacts/source/index.html');
  assert.deepEqual(ONTOLOGY_ASSET_CLASSES, {
    artefacts: 'ontology-serialization',
    tools: 'tool-rendering',
  });
  assert.equal(classifyOntologyAsset('artefacts/opda-merged.ttl'), 'ontology-serialization');
  assert.equal(classifyOntologyAsset('tools/pylode/index.html'), 'tool-rendering');
});

test('published ontology URLs resolve only through the retained manifest', () => {
  const root = '/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling';
  assert.equal(isExpectedOntologyAssetUrl(`${root}/tools/pylode/index.html`), true);
  assert.equal(isExpectedOntologyAssetUrl(`${root}/artefacts/source/index.html`), true);
  assert.equal(isExpectedOntologyAssetUrl(`${root}/tools/not-in-the-manifest/index.html`), false);
  assert.equal(isExpectedOntologyAssetUrl('/spdtf/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources/classes'), false);
  assert.equal(isExpectedOntologyAssetUrl('/pdtf-schema/schema-derived-ontology/use-and-tooling/tools/pylode/index.html'), false);
  assert.equal(isExpectedOntologyAssetUrl('/ontology/tools/pylode/index.html'), false);
  assert.equal(isExpectedOntologyAssetUrl('/ontology/artefacts/source/index.html'), false);
  assert.equal(isExpectedOntologyAssetUrl('/api/v2/ontology/tools/pylode/index.html'), false);
  assert.equal(isExpectedOntologyAssetUrl(`${root}/tools/%2e%2e/artefacts/source/index.html`), false);
});

test('family-manifest derivation fails closed for missing retained inventories', () => {
  const manifest = {
    schemaVersion: 1,
    families: [{
      id: 'ontology-tools',
      policy: 'byte-identical',
      ciMode: 'manifest-only-in-ci',
      accepted: { records: [{ path: 'pylode/index.html' }] },
    }, {
      id: 'ontology-artefacts',
      policy: 'byte-identical',
      ciMode: 'manifest-only-in-ci',
      accepted: { records: [{ path: 'source/index.html' }] },
    }],
  };
  assert.deepEqual(deriveExpectedOntologyAssets(manifest), [
    'artefacts/source/index.html',
    'tools/pylode/index.html',
  ]);
  assert.throws(() => deriveExpectedOntologyAssets({ ...manifest, families: [] }), /family/u);
  assert.throws(() => deriveExpectedOntologyAssets({
    ...manifest,
    families: manifest.families.map((family) => family.id === 'ontology-tools'
      ? { ...family, accepted: { records: [{ path: '../escape' }] } } : family),
  }), /logical ontology asset path/u);
});

test('ontology pages use manifest availability rather than local filesystem probes', async () => {
  const fs = await import('node:fs/promises');
  const pages = [
    'use-and-tooling/bake-off', 'terms-and-model-resources/classes',
    'validation-and-examples/exemplars/index', 'validation-and-examples/profiles/index',
    'terms-and-model-resources/properties', 'validation-and-examples/shapes',
    'use-and-tooling/usage', 'terms-and-model-resources/vocabularies',
  ];
  for (const page of pages) {
    const source = await fs.readFile(new URL(`../src/pages/spdtf/inputs/pdtf-schema/schema-derived-ontology/${page}.astro`, import.meta.url), 'utf8');
    assert.match(source, /ontology-publication-assets/u, `${page} must use the shared availability helper`);
    assert.doesNotMatch(source, /path\.resolve\(process\.cwd\(\), ['"]public\/ontology/u,
      `${page} must not derive generated-asset availability from the local filesystem`);
    assert.doesNotMatch(source, /path\.join\(PUB/u,
      `${page} must not probe generated assets through a local publication directory`);
  }
});

test('release crawlers accept only manifest-backed assets retained outside clean dist', () => {
  const dist = mkdtempSync(path.join(os.tmpdir(), 'opda-retained-assets-'));
  const ontology = path.join(dist, 'spdtf/inputs/pdtf-schema/schema-derived-ontology');
  mkdirSync(ontology, { recursive: true });
  writeFileSync(path.join(dist, 'index.html'), '<a href="/spdtf/inputs/pdtf-schema/schema-derived-ontology">Ontology</a>');
  const page = path.join(ontology, 'index.html');
  const tools = '/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/tools';
  writeFileSync(page, `<a href="${tools}/pylode/index.html">Published tool</a>`);

  const run = (script) => spawnSync(process.execPath, [path.join(ROOT, script)], {
    cwd: ROOT,
    env: { ...process.env, DIST_DIR: dist },
    encoding: 'utf8',
  });

  try {
    for (const script of ['scripts/crawl-routes.mjs', 'scripts/check-links.mjs']) {
      const result = run(script);
      assert.equal(result.status, 0, `${script} rejected a retained asset:\n${result.stdout}${result.stderr}`);
    }

    writeFileSync(page, `<script src="${tools}/not-in-the-manifest/missing.js"></script>`);
    for (const script of ['scripts/crawl-routes.mjs', 'scripts/check-links.mjs']) {
      const result = run(script);
      assert.notEqual(result.status, 0, `${script} accepted an unmanifested missing asset`);
      assert.match(`${result.stdout}${result.stderr}`, /not-in-the-manifest/u);
    }
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});
