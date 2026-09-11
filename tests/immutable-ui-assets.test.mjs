import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { publishImmutableUiAssets } from '../src/lib/immutable-ui-assets.mjs';

async function put(root, name, value) {
  const filename = path.join(root, name);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, value);
}

test('two releases hash CSS dependencies and JS imports, retaining old objects and stable URLs', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'opda-ui-hashes-'));
  await put(root, 'ui/fonts/body.woff2', Buffer.from('font-one'));
  await put(root, 'ui/brand/icon.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await put(root, 'ui/colours.css', ':root { --accent: teal; }');
  await put(root, 'ui/site.css', '@import "./colours.css"; @font-face { font-family: body; src: url("./fonts/body.woff2"); } .icon { mask: url("/ui/brand/icon.svg"); }');
  await put(root, 'ui/helper.js', 'export const answer = 41;');
  await put(root, 'ui/client.js', 'import { answer } from "./helper.js"; window.answer = answer;');
  const html = '<!doctype html><html><head><link rel="stylesheet" href="/ui/site.css?v=old"><link rel="preload" as="font" href="/ui/fonts/body.woff2"></head><body><img src="/ui/brand/icon.svg"><script defer src="/ui/client.js"></script><a href="/ui/header-preview-controls/kb">Controls</a></body></html>';
  await put(root, 'index.html', html);
  const first = await publishImmutableUiAssets({ outputDir: root });
  const firstHtml = await readFile(path.join(root, 'index.html'), 'utf8');
  assert.ok(firstHtml.includes(first.urls['/ui/site.css']));
  assert.ok(firstHtml.includes(first.urls['/ui/fonts/body.woff2']));
  assert.ok(firstHtml.includes(first.urls['/ui/client.js']));
  assert.ok(firstHtml.includes('/ui/header-preview-controls/kb'));
  assert.ok(!firstHtml.includes('?v=old'));
  const css = await readFile(path.join(root, first.urls['/ui/site.css'].slice(1)), 'utf8');
  assert.ok(css.includes(first.urls['/ui/fonts/body.woff2']));
  assert.ok(css.includes(first.urls['/ui/brand/icon.svg']));
  assert.ok(!css.includes('url(/ui/'));
  await access(path.join(root, 'ui/site.css'));

  await put(root, 'ui/fonts/body.woff2', Buffer.from('font-two'));
  await put(root, 'ui/helper.js', 'export const answer = 42;');
  await put(root, 'index.html', html);
  const second = await publishImmutableUiAssets({ outputDir: root });
  assert.notEqual(second.urls['/ui/site.css'], first.urls['/ui/site.css']);
  assert.notEqual(second.urls['/ui/client.js'], first.urls['/ui/client.js']);
  assert.notEqual(second.urls['/ui/fonts/body.woff2'], first.urls['/ui/fonts/body.woff2']);
  assert.equal(second.urls['/ui/brand/icon.svg'], first.urls['/ui/brand/icon.svg']);
  for (const oldUrl of Object.values(first.urls)) await access(path.join(root, oldUrl.slice(1)));

  await put(root, 'index.html', html);
  const repeat = await publishImmutableUiAssets({ outputDir: root });
  assert.deepEqual(repeat.urls, second.urls, 'same inputs produce identical URLs');
});

test('URL rewriting preserves fragments, integrity attributes, external URLs and literal prose', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'opda-ui-rewrite-'));
  await put(root, 'ui/site.css', 'body { color: teal; }');
  await put(root, 'index.html', '<html><head><link href="/ui/site.css?v=123#section" rel="stylesheet" integrity="sha384-old"></head><body><p>/ui/site.css</p><a href="https://elsewhere.test/ui/site.css">External</a><script>const example = "/ui/site.css";</script></body></html>');
  const result = await publishImmutableUiAssets({ outputDir: root });
  const output = await readFile(path.join(root, 'index.html'), 'utf8');
  assert.ok(output.includes(`${result.urls['/ui/site.css']}#section`));
  assert.ok(output.includes('<p>/ui/site.css</p>'));
  assert.ok(output.includes('https://elsewhere.test/ui/site.css'));
  assert.ok(output.includes('const example = "/ui/site.css";'));
  const bytes = await readFile(path.join(root, result.urls['/ui/site.css'].slice(1)));
  assert.ok(output.includes(`integrity="sha384-${createHash('sha384').update(bytes).digest('base64')}"`));
});

test('inline campaign CSS and preloaded fonts use the same immutable asset without changing JS', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'opda-ui-inline-'));
  await put(root, 'ui/fonts/body.woff2', 'font');
  await put(root, 'ui/site.css', '@font-face { font-family: body; src: url("./fonts/body.woff2"); font-display: swap; }');
  await put(root, 'index.html', '<html><head><link rel="preload" as="font" href="/ui/fonts/body.woff2"><style data-opda-campaign-design-system>@font-face {font-family: body; src: url("/ui/fonts/body.woff2"); font-display: swap;} body {font-family:body;}</style></head><body></body></html>');
  const result = await publishImmutableUiAssets({ outputDir: root });
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  assert.equal(html.split(result.urls['/ui/fonts/body.woff2']).length - 1, 2);
  assert.ok(!html.includes('/ui/fonts/'));
  assert.ok(html.includes('font-display:swap'));
});

test('page-owned Astro CSS referencing public fonts is re-emitted without overwriting its old hash', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'opda-ui-astro-css-'));
  await put(root, 'ui/fonts/body.woff2', 'font');
  await put(root, 'ui/site.css', 'body { color: teal; }');
  const original = '@font-face { font-family: body; src: url("/ui/fonts/body.woff2"); }';
  await put(root, '_astro/presentation.ORIGINAL.css', original);
  await put(root, 'index.html', '<html><head><link rel="stylesheet" href="/_astro/presentation.ORIGINAL.css"></head><body></body></html>');
  const result = await publishImmutableUiAssets({ outputDir: root });
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  const nextUrl = result.urls['/_astro/presentation.ORIGINAL.css'];
  assert.ok(nextUrl.startsWith('/_ui/astro/presentation.ORIGINAL.'));
  assert.ok(html.includes(nextUrl));
  assert.equal(await readFile(path.join(root, '_astro/presentation.ORIGINAL.css'), 'utf8'), original);
  const nextCss = await readFile(path.join(root, nextUrl.slice(1)), 'utf8');
  assert.ok(nextCss.includes(result.urls['/ui/fonts/body.woff2']));
});
