import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

import {
  bundleDesignSystem,
  designSystemBundler,
  renderBundledDesignSystem,
} from '../src/integrations/bundle-design-system.mjs';

test('the production facade bundles local modules in declared order and preserves asset URLs', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'opda-css-bundle-'));
  const publicDir = path.join(directory, 'public');
  const outputDir = path.join(directory, 'dist');
  const uiDir = path.join(publicDir, 'ui');
  try {
    await mkdir(path.join(uiDir, 'design'), { recursive: true });
    await mkdir(path.join(outputDir, 'ui'), { recursive: true });
    await writeFile(path.join(uiDir, 'design-system.css'), [
      '/* facade */',
      '@import url("./fonts.css?v=123456789abc");',
      '@import url("./design/components.css?v=123456789abc");',
      '',
    ].join('\n'));
    await writeFile(path.join(uiDir, 'fonts.css'), [
      "@import url('https://fonts.example.test/family.css');",
      ".font { src: url('./fonts/site.woff2') format('woff2'); }",
      '',
    ].join('\n'));
    await writeFile(path.join(uiDir, 'design/components.css'), [
      ".component { mask: url('../brand/mark.svg'); }",
      ".variant { mask: url('../brand/mark.svg?v=2#glyph'); }",
      ".absolute { mask: url('/ui/brand/mark.svg'); }",
      ".fragment { filter: url('#local-filter'); }",
      ".remote { mask: url('//cdn.example.test/mark.svg'); }",
      ".embedded { background: url('data:image/svg+xml;base64,AAAA'); }",
      '',
    ].join('\n'));

    const sourceBefore = await readFile(path.join(uiDir, 'design-system.css'), 'utf8');
    const result = await bundleDesignSystem({ publicDir, outputDir });
    const bundled = await readFile(path.join(outputDir, 'ui/design-system.css'), 'utf8');

    assert.deepEqual(result.imports, ['./fonts.css', './design/components.css']);
    assert.equal(await readFile(path.join(uiDir, 'design-system.css'), 'utf8'), sourceBefore,
      'the reviewable source facade must remain unchanged');
    assert.doesNotMatch(bundled, /@import(?:\s+url\(|\s*)["']\.\//u,
      'no same-origin CSS imports may remain');
    assert.equal(result.output, bundled, 'the returned bytes must match the production file');
    assert.doesNotMatch(bundled, /\/\* (?:facade|bundled from)/u,
      'ordinary source comments must not be delivered');
    assert.match(bundled, /@import"https:\/\/fonts\.example\.test\/family\.css";/u);
    const fontAt = bundled.indexOf('.font{');
    assert.ok(fontAt >= 0 && fontAt < bundled.indexOf('.component{'),
      'module rules must retain facade order');
    assert.match(bundled, /url\(\.\/fonts\/site\.woff2\)/u);
    assert.match(bundled, /url\(\.\/brand\/mark\.svg\)/u,
      'module-relative assets must be rebased to the facade URL');
    assert.match(bundled, /url\(\.\/brand\/mark\.svg\?v=2#glyph\)/u);
    assert.match(bundled, /url\(\/ui\/brand\/mark\.svg\)/u);
    assert.match(bundled, /url\(#local-filter\)/u);
    assert.match(bundled, /url\(\/\/cdn\.example\.test\/mark\.svg\)/u);
    assert.match(bundled, /url\(data:image\/svg\+xml;base64,AAAA\)/u);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('minification preserves layers, fallback order, themes, accessibility and legal comments', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'opda-css-semantics-'));
  const publicDir = path.join(directory, 'public');
  const uiDir = path.join(publicDir, 'ui');
  const facade = [
    '/*! Facade licence */',
    '@layer theme, overrides;',
    '@import url("./theme.css");',
    '@import url("./overrides.css");',
  ].join('\n');
  const theme = [
    '/* Source-only explanation */',
    '/* @license Theme MIT */',
    '@layer theme {',
    '  :root { --accent: #FFFFFF; --message: "two  spaces /* literal */"; }',
    '  :root[data-theme="dark"] { --accent: rgb(255, 255, 255); }',
    '  .card { color: red; color: var(--accent, red); display: block; display: grid;',
    '    padding: 0px 0px 0px 0px; width: calc(100% - 1rem); animation: panel-open 1s; }',
    '}',
    '@keyframes panel-open { from { opacity: 0; } to { opacity: 1; } }',
  ].join('\n');
  const overrides = [
    '/* @preserve Overrides notice */',
    '@layer overrides { .card { color: blue !important; } }',
    '@media (prefers-reduced-motion: reduce) { .card { animation: none; } }',
    '@media print { .card { display: block; } }',
    '@media (forced-colors: active) { .card { color: CanvasText; } }',
  ].join('\n');
  try {
    await mkdir(uiDir, { recursive: true });
    for (const [name, source] of [['design-system.css', facade], ['theme.css', theme], ['overrides.css', overrides]]) {
      await writeFile(path.join(uiDir, name), source);
    }
    const { output } = await renderBundledDesignSystem({ publicDir });
    assert.equal(output, [
      '/*! Facade licence */@layer theme,overrides;',
      '/* @license Theme MIT */@layer theme{',
      ':root{--accent: #FFFFFF;--message: "two  spaces /* literal */"}',
      ':root[data-theme=dark]{--accent: rgb(255, 255, 255)}',
      '.card{color:red;color:var(--accent, red);display:block;display:grid;',
      'padding:0px 0px 0px 0px;width:calc(100% - 1rem);animation:panel-open 1s}}',
      '@keyframes panel-open{from{opacity:0}to{opacity:1}}',
      '/* @preserve Overrides notice */@layer overrides{.card{color:blue!important}}',
      '@media(prefers-reduced-motion:reduce){.card{animation:none}}',
      '@media print{.card{display:block}}',
      '@media(forced-colors:active){.card{color:CanvasText}}\n',
    ].join(''));
    for (const [name, source] of [['design-system.css', facade], ['theme.css', theme], ['overrides.css', overrides]]) {
      assert.equal(await readFile(path.join(uiDir, name), 'utf8'), source, `${name} must remain reviewable`);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('minification rejects syntax recovery before replacing the production stylesheet', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'opda-css-invalid-'));
  const publicDir = path.join(directory, 'public');
  const outputDir = path.join(directory, 'dist');
  const outputPath = path.join(outputDir, 'ui/design-system.css');
  try {
    await mkdir(path.join(publicDir, 'ui'), { recursive: true });
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(path.join(publicDir, 'ui/design-system.css'), '@import url("./invalid.css");');
    await writeFile(path.join(publicDir, 'ui/invalid.css'), '.broken { color: red;');
    await writeFile(outputPath, '/* Previous successful build */');
    await assert.rejects(bundleDesignSystem({ publicDir, outputDir }), /CSS minification.*Expected "\}"/su);
    assert.equal(await readFile(outputPath, 'utf8'), '/* Previous successful build */');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('the bundler rejects imports outside the public UI boundary', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'opda-css-boundary-'));
  const publicDir = path.join(directory, 'public');
  try {
    await mkdir(path.join(publicDir, 'ui'), { recursive: true });
    await writeFile(path.join(publicDir, 'escape.css'), '.escape {}\n');
    await writeFile(path.join(publicDir, 'ui/design-system.css'), '@import url("../escape.css");\n');
    await assert.rejects(
      renderBundledDesignSystem({ publicDir }),
      /design-system import escapes public\/ui/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('Astro keeps the full documentation bundle and inlines the shared campaign cascade', async () => {
  const [config, layout, standalone, homepage] = await Promise.all([
    readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/layouts/StandalonePublicLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  ]);
  assert.match(config, /designSystemBundler\(\)/u);
  for (const source of [layout]) {
    assert.match(source, /import \{ designSystemVersion \} from '@\/lib\/design-system-version\.mjs'/u);
    assert.match(source, /const cssV = await designSystemVersion\(\)/u);
    assert.match(source, /href=\{`\/ui\/design-system\.css\?v=\$\{cssV\}`\}/u);
    assert.doesNotMatch(source, /design-system\.built\.css/u);
  }
  for (const source of [standalone, homepage]) {
    assert.match(source, /import CampaignDesignStyles from/u);
    assert.match(source, /<CampaignDesignStyles\s*\/>/u);
    assert.doesNotMatch(source, /href=\{`\/ui\/design-system\.css/u,
      'campaign pages must not also request the full documentation bundle');
  }
  assert.match(homepage, /<script is:inline defer src=\{`\/ui\/client\.js\?v=\$\{clientV\}`\}/u);
});

test('CSS versions hash exact output and refresh for child edits, not roots or mtimes', async () => {
  const { designSystemVersion } = await import('../src/lib/design-system-version.mjs');
  const directory = await mkdtemp(path.join(tmpdir(), 'opda-css-version-'));
  const publicDir = path.join(directory, 'public');
  const otherPublicDir = path.join(directory, 'other-public');
  const facade = '@import url("./theme.css?v=123456789abc");';
  const childPath = path.join(publicDir, 'ui/theme.css');
  const digest = (output) => createHash('sha256').update(output).digest('hex').slice(0, 12);
  try {
    for (const root of [publicDir, otherPublicDir]) {
      await mkdir(path.join(root, 'ui'), { recursive: true });
      await writeFile(path.join(root, 'ui/design-system.css'), facade);
      await writeFile(path.join(root, 'ui/theme.css'), '.theme { color: red; }');
    }
    const first = await designSystemVersion({ publicDir });
    const production = await bundleDesignSystem({ publicDir, outputDir: path.join(directory, 'dist') });
    assert.equal(first, digest(await readFile(production.outputPath)));
    assert.equal(await designSystemVersion({ publicDir: otherPublicDir }), first);
    await utimes(childPath, new Date('2001-01-01'), new Date('2001-01-01'));
    assert.equal(await designSystemVersion({ publicDir }), first);
    await writeFile(childPath, '.theme{color:red} /* Source-only explanation */');
    assert.equal(await designSystemVersion({ publicDir }), first,
      'identical delivered bytes must keep their version despite source formatting changes');
    await writeFile(childPath, '.theme { color: blue; }');
    const changed = await designSystemVersion({ publicDir });
    assert.notEqual(changed, first, 'changing a child must invalidate an untouched facade');
    assert.equal(await readFile(path.join(publicDir, 'ui/design-system.css'), 'utf8'), facade);
    await writeFile(childPath, '.theme { color: blue;');
    await assert.rejects(designSystemVersion({ publicDir }), /CSS minification refused/u);
    await writeFile(childPath, '.theme { color: blue; }');
    assert.equal(await designSystemVersion({ publicDir }), changed,
      'Node and development calls must not retain rejected or fulfilled promises');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('each production build versions and writes one snapshot without leaking into the next build', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'opda-css-build-version-'));
  const publicDir = path.join(directory, 'public');
  const childPath = path.join(publicDir, 'ui/theme.css');
  const { hooks } = designSystemBundler();
  const config = { publicDir: pathToFileURL(`${publicDir}/`) };
  const setup = async (command) => {
    const updates = [];
    await hooks['astro:config:setup']({ config, command, updateConfig: (value) => updates.push(value) });
    return updates;
  };
  const digest = (output) => createHash('sha256').update(output).digest('hex').slice(0, 12);
  try {
    await mkdir(path.dirname(childPath), { recursive: true });
    await writeFile(path.join(publicDir, 'ui/design-system.css'), '@import url("./theme.css");');
    await writeFile(childPath, '.theme { color: red; }');
    const first = await setup('build');
    assert.equal(first.length, 1);
    const firstVersion = JSON.parse(first[0].vite.define.__OPDA_DESIGN_SYSTEM_VERSION__);
    await writeFile(childPath, '.theme { color: blue; }');
    const firstDir = path.join(directory, 'first-dist');
    await hooks['astro:build:done']({ dir: pathToFileURL(`${firstDir}/`) });
    const firstOutput = await readFile(path.join(firstDir, 'ui/design-system.css'), 'utf8');
    assert.equal(firstVersion, digest(firstOutput));
    assert.match(firstOutput, /color:red/u, 'the build must emit its original versioned snapshot');

    const second = await setup('build');
    const secondVersion = JSON.parse(second[0].vite.define.__OPDA_DESIGN_SYSTEM_VERSION__);
    assert.notEqual(secondVersion, firstVersion, 'even the same integration instance must start fresh');
    const secondDir = path.join(directory, 'second-dist');
    await hooks['astro:build:done']({ dir: pathToFileURL(`${secondDir}/`) });
    const secondOutput = await readFile(path.join(secondDir, 'ui/design-system.css'), 'utf8');
    assert.equal(secondVersion, digest(secondOutput));
    assert.match(secondOutput, /color:blue/u);

    await writeFile(childPath, '.theme { color: blue;');
    assert.deepEqual(await setup('dev'), [], 'development must not inject a cached production version');
    await assert.rejects(setup('build'), /CSS minification refused/u,
      'build-time parsing failures must remain visible rather than becoming a dev cache key');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('the real design facade collapses every declared local import', async () => {
  const publicDir = new URL('../public/', import.meta.url);
  const result = await renderBundledDesignSystem({ publicDir });
  assert.equal(result.imports.length, 21);
  assert.equal(new Set(result.imports).size, result.imports.length);
  assert.doesNotMatch(result.output, /@import\b|https:\/\/fonts\.(?:googleapis|gstatic)\.com/u,
    'production typography must not introduce another render-blocking stylesheet or external font origin');
  const tokensAt = result.output.indexOf(':root{');
  assert.ok(tokensAt >= 0 && tokensAt < result.output.indexOf('.skip-link'),
    'tokens must still precede base styles');
  const printAt = result.output.lastIndexOf('@media print{');
  assert.ok(printAt >= 0 && printAt < result.output.lastIndexOf('@media(forced-colors:active){'),
    'the terminal accessibility styles must retain their declared order');
});

test('the real production CSS is deterministic and stays within minified transfer budgets', async () => {
  const publicDir = new URL('../public/', import.meta.url);
  const first = await renderBundledDesignSystem({ publicDir });
  const second = await renderBundledDesignSystem({ publicDir });
  assert.deepEqual(first, second);
  assert.ok(Buffer.byteLength(first.output) < 160_000, 'raw CSS must remain below 160 kB');
  assert.ok(gzipSync(first.output).length < 26_000, 'gzip CSS must remain below 26 kB');
  assert.ok(brotliCompressSync(first.output).length < 21_500, 'Brotli CSS must remain below 21.5 kB');
});

test('Source Sans 3 retains all original script subsets as local variable WOFF2 faces', async () => {
  const css = await readFile(new URL('../public/ui/fonts.css', import.meta.url), 'utf8');
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/gu)]
    .map((match) => match[1]).filter((face) => face.includes("'Source Sans 3'"));
  assert.equal(faces.length, 7);
  const sources = new Set();
  for (const face of faces) {
    assert.match(face, /font-weight:\s*400 700/u);
    assert.match(face, /font-display:\s*swap/u);
    assert.match(face, /unicode-range:/u);
    const source = face.match(/url\('\.\/fonts\/([^']+\.woff2)'\)/u)?.[1];
    assert.ok(source);
    const bytes = await readFile(new URL(`../public/ui/fonts/${source}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
    sources.add(source);
  }
  assert.equal(sources.size, 7);
  const licence = await readFile(new URL('../public/ui/fonts/SourceSans3-OFL.txt', import.meta.url), 'utf8');
  assert.match(licence, /Copyright 2010-2020 Adobe/u);
});

test('shared early font hints preload only core Latin faces with reusable CORS requests', async () => {
  const hints = await readFile(new URL('../src/components/FontPreloads.astro', import.meta.url), 'utf8');
  assert.match(hints, /SourceSans3-Variable-latin\.woff2/u);
  assert.match(hints, /AtkinsonHyperlegibleNext-Variable-latin\.woff2/u);
  assert.match(hints, /display &&/u);
  assert.doesNotMatch(hints, /latin-ext|Mono|https:\/\//u);
  assert.equal((hints.match(/rel="preload"/gu) ?? []).length, 3);
  assert.equal((hints.match(/as="font" type="font\/woff2" crossorigin="anonymous"/gu) ?? []).length, 3);
  for (const file of ['src/layouts/Layout.astro', 'src/layouts/StandalonePublicLayout.astro', 'src/pages/index.astro']) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /<FontPreloads/u, file);
  }
  const layout = await readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  assert.match(layout, /<FontPreloads display\s*\/>/u,
    'the shared framework heading uses the display face on knowledge-base pages too');
});
