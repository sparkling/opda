/**
 * Tests for src/lib/remark/frontmatter-uri-extraction.ts (ADR-0018).
 * Uses Node built-in test runner + jiti for TypeScript loading.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from '/Users/henrik/source/opda/node_modules/.pnpm/jiti@2.7.0/node_modules/jiti/lib/jiti.mjs';

const jiti = createJiti(import.meta.url, { moduleCache: false });
const { rehypeFrontmatterUriExtraction } = await jiti.import(
  '/Users/henrik/source/opda/src/lib/remark/frontmatter-uri-extraction.ts'
);

/** Build a minimal hast root with optional heading. */
function makeTree(headingText = null) {
  const children = [];
  if (headingText) {
    children.push({
      type: 'element',
      tagName: 'h3',
      properties: {},
      children: [{ type: 'text', value: headingText }],
    });
  }
  return { type: 'root', children };
}

/** Build a minimal VFile-like object. */
function makeFile(filePath, existingUri = undefined) {
  return {
    path: filePath,
    data: {
      astro: {
        frontmatter: existingUri ? { entityUri: existingUri } : {},
      },
    },
  };
}

function run(tree, file) {
  rehypeFrontmatterUriExtraction()(tree, file);
}

test('extracts URI from opda: heading for entity kind', () => {
  const tree = makeTree('opda:Property');
  const file = makeFile('/project/docs/manual/logical/property/property.md');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, 'opda:Property');
});

test('extracts URI from opda: heading for physical-ontology entity', () => {
  const tree = makeTree('opda:Address');
  const file = makeFile('/project/docs/manual/physical-ontology/property/classes.md');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, 'opda:Address');
});

test('falls back to filename derivation when no opda: heading found (concept entity)', () => {
  const tree = makeTree(null); // no heading with opda: URI
  const file = makeFile('/project/docs/manual/concept/property/property.md');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, 'opda:Property');
});

test('derives scheme URI from filename for vocabulary kind', () => {
  const tree = makeTree(null);
  const file = makeFile('/project/docs/manual/physical-ontology/vocabularies/built-form.md');
  run(tree, file);
  // 'built-form' → 'BuiltForm' → 'BuiltFormScheme' (no existing Scheme suffix)
  assert.equal(file.data.astro.frontmatter.entityUri, 'opda:BuiltFormScheme');
});

test('does not add Scheme suffix when heading already contains full name', () => {
  const tree = makeTree('opda:BuiltFormScheme');
  const file = makeFile('/project/docs/manual/physical-ontology/vocabularies/built-form.md');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, 'opda:BuiltFormScheme');
});

test('skips exemplar entries (no URI)', () => {
  const tree = makeTree(null);
  const file = makeFile('/project/docs/manual/physical-ontology/exemplars/chain-of-transactions.md');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, undefined);
});

test('skips cross-cutting entries (kind is cross-cutting, not entity/scheme)', () => {
  const tree = makeTree(null);
  const file = makeFile('/project/docs/manual/physical-ontology/severity-tiers.md');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, undefined);
});

test('skips tier-readme entries', () => {
  const tree = makeTree(null);
  const file = makeFile('/project/docs/manual/concept/readme.md');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, undefined);
});

test('is idempotent — does not overwrite existing entityUri', () => {
  const tree = makeTree('opda:SomethingElse');
  const file = makeFile('/project/docs/manual/concept/property/property.md', 'opda:AlreadySet');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, 'opda:AlreadySet');
});

test('extracts URI from logical enumeration scheme', () => {
  const tree = makeTree(null);
  const file = makeFile('/project/docs/manual/logical/agent/enumerations/role-scheme.md');
  run(tree, file);
  // 'role-scheme' → 'RoleScheme' — no extra suffix since ends in 'Scheme'
  assert.equal(file.data.astro.frontmatter.entityUri, 'opda:RoleScheme');
});

test('returns undefined entityUri when file path is not in docs/manual/', () => {
  const tree = makeTree(null);
  const file = makeFile('/project/src/pages/other.md');
  run(tree, file);
  assert.equal(file.data.astro.frontmatter.entityUri, undefined);
});

test('handles missing file path gracefully', () => {
  const tree = makeTree(null);
  const file = { path: undefined, data: { astro: { frontmatter: {} } } };
  assert.doesNotThrow(() => run(tree, file));
});
