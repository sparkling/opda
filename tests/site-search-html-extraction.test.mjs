import assert from 'node:assert/strict';
import test from 'node:test';
import { recordFromHtml } from '../src/integrations/generate-site-search-index.mjs';

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
