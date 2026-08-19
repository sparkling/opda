import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildPrefixedPreview,
  prefixRootUrl,
  verifyPrefixedPreview,
} from '../scripts/build-prefixed-preview.mjs';

const SOURCE_SHA = 'a'.repeat(40);

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'opda-preview-'));
  const input = path.join(root, 'dist');
  const output = path.join(root, 'preview', 'v3');
  const put = (relative, content = '') => {
    const target = path.join(input, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };

  put('index.html', `<!doctype html><html><head><title>Preview</title></head><body>
    <a href="/guide#intro">Guide</a>
    <a href="/resources">Resource index</a>
    <a href="/resources/archive.pdf">Raw archive</a>
    <img src="/_astro/logo.svg" srcset="/images/logo.png 1x, /images/logo@2x.png 2x" alt="">
    <form action="/api/working-group-interest"><button>Submit</button></form>
    <script>fetch('/api/v2/comments'); location.href = '/guide';</script>
  </body></html>`);
  put('guide/index.html', '<!doctype html><html><head></head><body><h1 id="intro">Guide</h1></body></html>');
  put('resources/index.html', '<!doctype html><html><head></head><body>Resources</body></html>');
  put('_astro/logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  put('images/logo.png', 'one');
  put('images/logo@2x.png', 'two');
  put('fonts/body.woff2', 'font');
  put('ui/site.css', "@font-face{src:url('/fonts/body.woff2')} body{background:url(/images/logo.png)}");
  put('ui/site.js', "fetch('/data/site.json'); fetch('/_auth/me'); const next = `/guide`;");
  put('data/site.json', JSON.stringify({ route: '/guide', api: '/api/v2/comments' }));
  put('sitemap-index.xml', '<loc>https://opda.org.uk/sitemap-0.xml</loc>');
  put('sitemap-0.xml', '<loc>https://opda.org.uk</loc><loc>https://opda.org.uk/guide</loc>');
  put('robots.txt', 'Sitemap: https://opda.org.uk/sitemap-index.xml\n');

  return { root, input, output };
}

test('root URLs are prefixed while shared runtime and source endpoints remain canonical', () => {
  assert.equal(prefixRootUrl('/', '/v3'), '/v3/');
  assert.equal(prefixRootUrl('/guide?mode=full#part', '/v3'), '/v3/guide?mode=full#part');
  assert.equal(prefixRootUrl('/resources', '/v3'), '/v3/resources');
  assert.equal(prefixRootUrl('/resources/archive.pdf', '/v3'), '/resources/archive.pdf');
  assert.equal(prefixRootUrl('/_auth/me', '/v3'), '/_auth/me');
  assert.equal(prefixRootUrl('/api/v2/comments', '/v3'), '/api/v2/comments');
  assert.equal(prefixRootUrl('/comments/thread', '/v3'), '/comments/thread');
  assert.equal(prefixRootUrl('/v3/guide', '/v3'), '/v3/guide');
  assert.equal(prefixRootUrl('//cdn.example.test/a.js', '/v3'), '//cdn.example.test/a.js');
  assert.equal(prefixRootUrl('https://example.test/guide', '/v3'), 'https://example.test/guide');
});

test('a preview build rewrites navigation, assets, scripts, CSS and sitemap URLs', () => {
  const { root, input, output } = fixture();
  try {
    const receipt = buildPrefixedPreview({ inputDir: input, outputDir: output, prefix: '/v3', sourceSha: SOURCE_SHA });
    assert.equal(receipt.prefix, '/v3');
    assert.equal(receipt.sourceSha, SOURCE_SHA);
    assert.equal(receipt.verification.unprefixedRootReferences, 0);

    const html = readFileSync(path.join(output, 'index.html'), 'utf8');
    assert.match(html, /name="robots" content="noindex,nofollow"/u);
    assert.match(html, /href="\/v3\/guide#intro"/u);
    assert.match(html, /href="\/v3\/resources"/u);
    assert.match(html, /href="\/resources\/archive\.pdf"/u);
    assert.match(html, /src="\/v3\/_astro\/logo\.svg"/u);
    assert.match(html, /srcset="\/v3\/images\/logo\.png 1x, \/v3\/images\/logo@2x\.png 2x"/u);
    assert.match(html, /action="\/api\/working-group-interest"/u);
    assert.match(html, /fetch\('\/api\/v2\/comments'\)/u);
    assert.match(html, /location\.href = '\/v3\/guide'/u);

    assert.equal(
      readFileSync(path.join(output, 'ui/site.css'), 'utf8'),
      "@font-face{src:url('/v3/fonts/body.woff2')} body{background:url(/v3/images/logo.png)}",
    );
    assert.equal(
      readFileSync(path.join(output, 'ui/site.js'), 'utf8'),
      "fetch('/v3/data/site.json'); fetch('/_auth/me'); const next = `/v3/guide`;",
    );
    assert.deepEqual(JSON.parse(readFileSync(path.join(output, 'data/site.json'), 'utf8')), {
      route: '/v3/guide', api: '/api/v2/comments',
    });
    assert.equal(
      readFileSync(path.join(output, 'sitemap-index.xml'), 'utf8'),
      '<loc>https://opda.org.uk/v3/sitemap-0.xml</loc>',
    );
    assert.equal(
      readFileSync(path.join(output, 'sitemap-0.xml'), 'utf8'),
      '<loc>https://opda.org.uk/v3/</loc><loc>https://opda.org.uk/v3/guide</loc>',
    );
    assert.equal(
      readFileSync(path.join(output, 'robots.txt'), 'utf8'),
      'Sitemap: https://opda.org.uk/v3/sitemap-index.xml\n',
    );

    const verified = verifyPrefixedPreview({ outputDir: output, prefix: '/v3', sourceSha: SOURCE_SHA });
    assert.equal(verified.treeSha256, receipt.treeSha256);
    assert.equal(verified.fileCount, receipt.fileCount);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('verification fails closed if an unprefixed site URL is introduced after the build', () => {
  const { root, input, output } = fixture();
  try {
    buildPrefixedPreview({ inputDir: input, outputDir: output, prefix: '/v3', sourceSha: SOURCE_SHA });
    writeFileSync(path.join(output, 'ui/site.js'), "window.location.href='/programme';");
    assert.throws(
      () => verifyPrefixedPreview({ outputDir: output, prefix: '/v3', sourceSha: SOURCE_SHA }),
      /unprefixed site-owned root URL/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the build rejects unsafe prefixes and output paths', () => {
  const { root, input } = fixture();
  try {
    assert.throws(
      () => buildPrefixedPreview({ inputDir: input, outputDir: path.join(input, 'v3'), prefix: '/v3', sourceSha: SOURCE_SHA }),
      /outside the input directory/u,
    );
    assert.throws(
      () => buildPrefixedPreview({ inputDir: input, outputDir: path.join(root, 'bad'), prefix: '/../v3', sourceSha: SOURCE_SHA }),
      /single safe URL segment/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
