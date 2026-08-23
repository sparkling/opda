import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { GLOBAL_DESTINATION_CARDS, GLOBAL_DESTINATIONS } from '../src/lib/site-ia.mjs';
import { PROPERTY_PACK_ROUTE_MIGRATION } from '../src/lib/property-pack-routes.mjs';
import { PDTF1_ROUTES } from '../src/lib/pdtf1-routes.mjs';
import { getLegacyCommentKey } from '../src/lib/site-route-migrations.mjs';
import { SEMANTIC_PACKAGE_MANIFEST } from '../src/lib/spdtf-workspace.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const TEXT_EXTENSIONS = new Set([
  '.astro', '.css', '.html', '.js', '.json', '.md', '.mjs', '.py', '.toml', '.ts', '.yml', '.yaml',
]);
const oldPdtfLabel = /\bPDTF[\p{Z}\s]+1(?:\.0)?\b|\bPDTF1\.0\b/iu;
const oldSpdtfLabel = /\bSPDTF[\p{Z}\s]+2(?:\.0)?\b|\bSPDTF2\.0\b/iu;
const immutableEvidenceFiles = new Set([
  'src/data/ia-preservation-baseline.json',
  'src/data/ia-route-baseline.json',
  'src/data/ia-semantic-reframe-ledger.json',
]);

function filesBelow(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(absolute, entry.name);
    if (entry.isDirectory()) return filesBelow(path.relative(ROOT, child));
    return TEXT_EXTENSIONS.has(path.extname(entry.name)) ? [child] : [];
  });
}

test('the reader-facing corpus uses PDTF schema and SPDTF without deprecated numbered names', () => {
  const files = [
    ...filesBelow('docs'),
    ...filesBelow('src/pages'),
    ...filesBelow('src/components'),
    ...filesBelow('src/layouts'),
    ...filesBelow('src/lib'),
    ...filesBelow('src/api'),
    ...filesBelow('scripts'),
    ...filesBelow('tests'),
    ...filesBelow('public/ui'),
    ...filesBelow('public/spdtf/inputs/pdtf-schema'),
    ...filesBelow('.github'),
    ...filesBelow('config'),
    path.join(ROOT, 'DESIGN.md'),
    path.join(ROOT, 'README.md'),
  ].filter((file) => {
    const relative = path.relative(ROOT, file);
    return !file.endsWith('site-standard-naming.test.mjs')
      && !immutableEvidenceFiles.has(relative);
  });

  const failures = [];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const [index, line] of source.split('\n').entries()) {
      if (oldPdtfLabel.test(line) || oldSpdtfLabel.test(line)) {
        failures.push(`${path.relative(ROOT, file)}:${index + 1}: ${line.trim()}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('public hierarchy uses schema and scheme names in labels and routes', () => {
  assert.deepEqual(
    GLOBAL_DESTINATIONS.map(({ key, title, url }) => [key, title, url]),
    [
      ['programme', 'Programme', '/programme'],
      ['governance', 'Governance', '/governance'],
      ['semantic-modelling', 'Semantic modelling', '/semantic-modelling'],
      ['spdtf', 'SPDTF Development', '/spdtf'],
      ['working-groups', 'Working groups', '/spdtf/working-groups'],
      ['resources', 'Resources', '/resources'],
    ],
  );
  assert.equal(PDTF1_ROUTES.inputRoot, '/spdtf/inputs');
  assert.equal(PDTF1_ROUTES.root, '/spdtf/inputs/pdtf-schema');
  assert.equal(PDTF1_ROUTES.original, '/spdtf/inputs/pdtf-schema/schema-and-supporting-material');
  assert.equal(PDTF1_ROUTES.extracted, '/spdtf/inputs/pdtf-schema/schema-derived-ontology');
  assert.equal(PROPERTY_PACK_ROUTE_MIGRATION.canonicalRoot, '/spdtf/property-pack');
  assert.equal(existsSync(path.join(ROOT, 'src/pages/pdtf-1')), false);
  assert.equal(existsSync(path.join(ROOT, 'src/pages/spdtf-2')), false);
  assert.equal(existsSync(path.join(ROOT, 'src/pages/pdtf-schema')), false);
  assert.equal(existsSync(path.join(ROOT, 'src/pages/spdtf')), true);
  assert.equal(existsSync(path.join(ROOT, 'src/pages/spdtf/inputs/pdtf-schema/schema-and-supporting-material')), true);
  assert.equal(existsSync(path.join(ROOT, 'src/pages/spdtf/inputs/pdtf-schema/schema-derived-ontology')), true);
  assert.equal(SEMANTIC_PACKAGE_MANIFEST.id, 'https://opda.org.uk/spdtf/semantic-package/workspace-contract');
  assert.equal(SEMANTIC_PACKAGE_MANIFEST.version, '2026-08-22');
  assert.deepEqual(SEMANTIC_PACKAGE_MANIFEST.supersedes, {
    id: 'https://opda.org.uk/spdtf-2/semantic-package/workspace-contract',
    version: '1.0.0',
    reason: 'Chair-authorised correction from an unendorsed versioned draft label to the first collaborative SPDTF scheme draft',
  });
});

test('the public and Programme pages share the current task-and-authority cards', () => {
  const homepage = readFileSync(path.join(ROOT, 'src/pages/index.astro'), 'utf8');
  const programme = readFileSync(path.join(ROOT, 'src/pages/programme/index.astro'), 'utf8');

  assert.deepEqual(
    GLOBAL_DESTINATION_CARDS.map(({ key, title, url }) => [key, title, url]),
    GLOBAL_DESTINATIONS.map(({ key, title, url }) => [key, title, url]),
  );
  assert.equal(GLOBAL_DESTINATION_CARDS.every(({ audience, description }) => audience && description), true);
  assert.doesNotMatch(homepage, /card__action/u);
  assert.equal(existsSync(path.join(ROOT, 'src/pages/home.astro')), false);
  assert.match(homepage, /<nav class="public-overview" aria-labelledby="inside-title">/u);
  assert.match(homepage, /<DestinationCards\s*\/>/u);
  assert.match(programme, /<DestinationCards\s*\/>/u);
  assert.match(programme, /<DestinationCards cards=\{programmeNavigationCards\}\s*\/>/u);
  assert.match(programme, /\.filter\(\(group\) => group\.heading !== 'Overview'\)/u);
  assert.doesNotMatch(programme, /GatewayCard/u);
  assert.match(homepage, /SPDTF is in development/u);
  assert.match(homepage, /Human working groups own domain meaning/u);
  assert.doesNotMatch(homepage, /PDTF schema|Digital Property Pack|schema to scheme|schema → SPDTF/iu);
});

test('route moves retain comment identities without retaining public URLs', () => {
  assert.equal(getLegacyCommentKey('/spdtf'), '/spdtf-2');
  assert.equal(getLegacyCommentKey('/semantic-modelling/standards'), '/spdtf-2/ontologies/standards');
  assert.equal(getLegacyCommentKey('/spdtf/property-pack'), '/v2');
  assert.equal(getLegacyCommentKey('/spdtf/property-pack/pdtf-schema-lineage'), '/v2/comparison');
  assert.equal(getLegacyCommentKey('/spdtf/inputs/pdtf-schema'), '/pdtf-1');
  assert.equal(getLegacyCommentKey('/spdtf/inputs/pdtf-schema/schema-and-supporting-material'), '/pdtf-1/original-standard');
  assert.equal(getLegacyCommentKey('/spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema'), '/schema');
  assert.equal(getLegacyCommentKey('/spdtf/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources/classes'), '/ontology/classes');
  const intermediateOnly = [
    ['lineage-provenance-and-verification', 'lineage-provenance-and-verification'],
    ['concepts-and-architecture', 'concepts-and-architecture'],
    ['concepts-and-architecture/contexts', 'concepts-and-architecture/contexts'],
    ['terms-and-model-resources', 'terms-and-model-resources'],
    ['validation-and-examples', 'validation-and-examples'],
    ['trust-governance-and-limitations', 'trust-governance-and-limitations'],
    ['use-and-tooling', 'use-and-tooling'],
  ];
  for (const [canonicalSuffix, intermediateSuffix] of intermediateOnly) {
    assert.equal(
      getLegacyCommentKey(`/spdtf/inputs/pdtf-schema/schema-derived-ontology/${canonicalSuffix}`),
      `/pdtf-1/extracted-ontology/${intermediateSuffix}`,
    );
  }
  assert.equal(getLegacyCommentKey('/pdtf/Property'), '/pdtf/Property');
});

test('maintained documentation filenames do not encode deprecated numbered names', () => {
  const offenders = filesBelow('docs')
    .map((file) => path.relative(ROOT, file))
    .filter((file) => /(?:pdtf-1-0|spdtf-2-0)/iu.test(file));
  assert.deepEqual(offenders, []);
});

test('production builds invalidate cached content from retired route cuts', () => {
  const packageJson = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.match(packageJson.scripts.build, /\bastro build --force\b/u);
});
