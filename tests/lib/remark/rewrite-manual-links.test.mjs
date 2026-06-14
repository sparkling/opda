/**
 * Tests for src/lib/remark/rewrite-manual-links.ts (ADR-0018).
 * Uses Node built-in test runner + jiti for TypeScript loading.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createJiti } from 'jiti';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

const jiti = createJiti(import.meta.url, { moduleCache: false });
const { remarkRewriteManualLinks, toManualRoute } = await jiti.import(
  '/Users/henrik/source/opda/src/lib/remark/rewrite-manual-links.ts'
);

/** Absolute path of a manual source file, as Astro hands it to the plugin. */
function manualFile(rel) {
  return path.resolve('docs/manual', rel);
}

/** Parse markdown for a given source file, run the plugin, collect all link urls. */
function rewrite(md, sourceRel) {
  const tree = unified().use(remarkParse).parse(md);
  remarkRewriteManualLinks()(tree, { path: manualFile(sourceRel) });
  const urls = [];
  (function walk(n) {
    if (n.type === 'link') urls.push(n.url);
    for (const c of n.children ?? []) walk(c);
  })(tree);
  return urls;
}

test('rewrites a sibling entity link', () => {
  const urls = rewrite('[Address](./address.md)', 'concept/property/property.md');
  assert.deepEqual(urls, ['/model/concept/property/address']);
});

test('rewrites a cross-tier link', () => {
  const urls = rewrite('[Logical](../../logical/property/property.md)', 'concept/property/property.md');
  assert.deepEqual(urls, ['/model/logical/property/property']);
});

test('rewrites a cross-module link', () => {
  const urls = rewrite('[Txn](../transaction/transaction.md)', 'concept/property/property.md');
  assert.deepEqual(urls, ['/model/concept/transaction/transaction']);
});

test('collapses module README link to its directory route', () => {
  const urls = rewrite('[Property module](./README.md)', 'concept/property/README.md');
  assert.deepEqual(urls, ['/model/concept/property']);
});

test('collapses tier README link to its directory route', () => {
  const urls = rewrite('[Concept tier](../README.md)', 'concept/property/property.md');
  assert.deepEqual(urls, ['/model/concept']);
});

test('preserves #anchors', () => {
  const urls = rewrite('[IC](./property.md#identity-criterion)', 'concept/property/address.md');
  assert.deepEqual(urls, ['/model/concept/property/property#identity-criterion']);
});

test('leaves out-of-manual .md links unchanged (ODR corpus)', () => {
  const link = '[ODR-0005](../../../ontology/odr/ODR-0005-property-land-identity-crux.md)';
  const urls = rewrite(link, 'concept/property/property.md');
  assert.deepEqual(urls, ['../../../ontology/odr/ODR-0005-property-land-identity-crux.md']);
});

test('leaves external + absolute + non-.md links unchanged', () => {
  const md = '[ext](https://example.com/x.md) [abs](/model/concept) [png](diagrams/x.png)';
  const urls = rewrite(md, 'concept/property/property.md');
  assert.deepEqual(urls, ['https://example.com/x.md', '/model/concept', 'diagrams/x.png']);
});

test('toManualRoute maps tier/module/entity and umbrella README', () => {
  const root = path.resolve('docs/manual');
  assert.equal(toManualRoute(path.join(root, 'README.md')), '/model');
  assert.equal(toManualRoute(path.join(root, 'concept/README.md')), '/model/concept');
  assert.equal(toManualRoute(path.join(root, 'logical/agent/enumerations/role-scheme.md')),
    '/model/logical/agent/enumerations/role-scheme');
  assert.equal(toManualRoute('/some/other/tree/file.md'), null);
});
