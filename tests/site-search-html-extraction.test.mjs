import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { recordFromHtml, siteSearchIndexGenerator } from '../src/integrations/generate-site-search-index.mjs';
import { SEARCH_INDEX_SCHEMA_VERSION } from '../src/lib/site-search-model.mjs';

const route = '/semantic-modelling/understand/shared-meaning';
const document = (head = '', body = '') => `<!doctype html><html><head><title>Shared meaning</title>${head}</head><body><h1>Shared meaning</h1>${body}</body></html>`;

test('HTML search excludes noindex and redirect documents regardless of attribute formatting', () => {
  for (const meta of [
    '<meta name="robots" content="noindex, follow">',
    '<META CONTENT = "NOINDEX FOLLOW" NAME = "RoBoTs">',
    "<meta content='none' name='robots'>",
    '<meta name=robots content=noindex>',
    '<meta name="robots" content="no&#105;ndex">',
    '<meta name="robots" content="index"><meta content="noindex" name="robots">',
    '<meta http-equiv="refresh" content="0;url=/semantic-modelling/understand">',
    "<META content = '5 ; URL = /semantic-modelling/understand' HTTP-EQUIV = Refresh>",
  ]) {
    assert.equal(recordFromHtml(route, document(meta)), null, meta);
  }
});

test('text mentioning noindex does not hide a real document from search', () => {
  for (const [head, body] of [
    ['<meta name="robots" content="index, nofollow">', ''],
    ['<meta name="description" content="How noindex works">', ''],
    ['<meta name="robots" content="noindexing">', ''],
    ['<!-- <meta name="robots" content="noindex"> -->', ''],
    ['<script>const example = \'<meta name="robots" content="noindex">\';</script>', ''],
    ['', '<template><meta name="robots" content="noindex"></template>'],
    ['', '<p>&lt;meta name="robots" content="noindex"&gt;</p>'],
  ]) {
    assert.equal(recordFromHtml(route, document(head, body))?.url, route);
  }
});

test('a redirected historical page does not produce a duplicate canonical search result', () => {
  const redirect = document('<meta http-equiv="refresh" content="0;url=/semantic-modelling/understand/shared-meaning">');
  const records = [
    recordFromHtml('/semantic-modelling/why-ontologies', redirect),
    recordFromHtml('/semantic-modelling/benefits', redirect),
    recordFromHtml(route, document()),
  ].filter(Boolean);
  assert.deepEqual(records.map(({ url }) => url), [route]);
});

test('identical rendered content emits byte-identical search indexes at different build times', (t) => {
  const fixture = mkdtempSync(join(tmpdir(), 'opda-search-reproducibility-'));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const output = join(fixture, 'dist');
  const pages = [
    ['/modelling/understand/shared-meaning', document('<meta name="opda:search-date" content="2026-09-05">')],
    ['/decisions/adr/example', document('<meta name="opda:search-title" content="An example decision"><meta name="opda:search-type" content="decision"><meta name="opda:search-collection" content="adr"><meta name="opda:search-date" content="2026-08-14">')],
  ];
  for (const [url, html] of pages) {
    const file = join(output, url.slice(1), 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
  const { hooks } = siteSearchIndexGenerator();
  hooks['astro:config:done']({ config: { root: pathToFileURL(`${fixture}/`), cacheDir: pathToFileURL(`${fixture}/.astro/`) } });
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-09-11T12:00:00Z') });
  const build = () => {
    hooks['astro:build:done']({ dir: pathToFileURL(`${output}/`) });
    return readFileSync(join(output, 'data/site-search-index.json'), 'utf8');
  };
  const firstBytes = build();
  t.mock.timers.setTime(new Date('2026-10-12T18:30:00Z').getTime());
  assert.equal(build(), firstBytes);
  const first = JSON.parse(firstBytes);
  assert.equal(first.schemaVersion, SEARCH_INDEX_SCHEMA_VERSION);
  assert.equal(Object.hasOwn(first, 'generatedAt'), false);
  assert.deepEqual(first.counts, { ontology: 0, decision: 1, group: 0, page: 1 });
  const expected = pages.map(([url, html]) => recordFromHtml(url, html))
    .sort((left, right) => left.title.localeCompare(right.title, 'en-GB'));
  assert.deepEqual(first.entries, expected);
  assert.deepEqual(first.entries.map(({ date }) => date), ['2026-08-14', '2026-09-05']);
});
