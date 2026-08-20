import assert from 'node:assert/strict';
import test from 'node:test';

import {
  deriveExpectedOntologyAssets,
  expectedOntologyAssetPaths,
  isExpectedOntologyAsset,
  validateOntologyAssetPath,
} from '../src/lib/ontology-publication-assets.ts';

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
    'bake-off', 'classes', 'exemplars', 'profiles',
    'properties', 'shapes', 'usage', 'vocabularies',
  ];
  for (const page of pages) {
    const source = await fs.readFile(new URL(`../src/pages/ontology/${page}.astro`, import.meta.url), 'utf8');
    assert.match(source, /ontology-publication-assets/u, `${page} must use the shared availability helper`);
    assert.doesNotMatch(source, /path\.resolve\(process\.cwd\(\), ['"]public\/ontology/u,
      `${page} must not derive generated-asset availability from the local filesystem`);
    assert.doesNotMatch(source, /path\.join\(PUB/u,
      `${page} must not probe generated assets through a local publication directory`);
  }
});
