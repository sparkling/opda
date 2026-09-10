import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  bundleDesignSystem,
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
      ".absolute { mask: url('/ui/brand/mark.svg'); }",
      ".embedded { background: url('data:image/svg+xml;base64,AAAA'); }",
      '',
    ].join('\n'));

    const sourceBefore = await readFile(path.join(uiDir, 'design-system.css'), 'utf8');
    const result = await bundleDesignSystem({ publicDir, outputDir });
    const bundled = await readFile(path.join(outputDir, 'ui/design-system.css'), 'utf8');

    assert.deepEqual(result.imports, ['./fonts.css', './design/components.css']);
    assert.equal(await readFile(path.join(uiDir, 'design-system.css'), 'utf8'), sourceBefore,
      'the reviewable source facade must remain unchanged');
    assert.doesNotMatch(bundled, /@import url\("\.\//u, 'no same-origin CSS imports may remain');
    assert.match(bundled, /@import url\('https:\/\/fonts\.example\.test\/family\.css'\);/u);
    assert.ok(bundled.indexOf('.font {') < bundled.indexOf('.component {'),
      'module rules must retain facade order');
    assert.match(bundled, /url\('\.\/fonts\/site\.woff2'\)/u);
    assert.match(bundled, /url\('\.\/brand\/mark\.svg'\)/u,
      'module-relative assets must be rebased to the facade URL');
    assert.match(bundled, /url\('\/ui\/brand\/mark\.svg'\)/u);
    assert.match(bundled, /url\('data:image\/svg\+xml;base64,AAAA'\)/u);
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

test('Astro registers production CSS bundling without changing the public stylesheet URL', async () => {
  const [config, layout, standalone, homepage] = await Promise.all([
    readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/layouts/StandalonePublicLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  ]);
  assert.match(config, /designSystemBundler\(\)/u);
  for (const source of [layout, standalone, homepage]) {
    assert.match(source, /\/ui\/design-system\.css/u);
    assert.doesNotMatch(source, /design-system\.built\.css/u);
  }
});

test('the real design facade collapses every declared local import', async () => {
  const publicDir = new URL('../public/', import.meta.url);
  const result = await renderBundledDesignSystem({ publicDir });
  assert.equal(result.imports.length, 21);
  assert.equal(new Set(result.imports).size, result.imports.length);
  assert.doesNotMatch(result.output, /@import\s+url\(["']\.\//u);
  assert.doesNotMatch(result.output, /@import\s|https:\/\/fonts\.(?:googleapis|gstatic)\.com/u,
    'production typography must not introduce another render-blocking stylesheet or external font origin');
  assert.ok(result.output.indexOf(':root {') < result.output.indexOf('.skip-link'),
    'tokens must still precede base styles');
  assert.ok(result.output.indexOf('bundled from design/print.css')
    < result.output.indexOf('bundled from design/forced-colors.css'),
    'the terminal accessibility styles must retain their declared order');
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
  assert.match(hints, /display &&/u);
  assert.doesNotMatch(hints, /latin-ext|Mono|https:\/\//u);
  assert.equal((hints.match(/rel="preload"/gu) ?? []).length, 2);
  assert.equal((hints.match(/as="font" type="font\/woff2" crossorigin="anonymous"/gu) ?? []).length, 2);
  for (const file of ['src/layouts/Layout.astro', 'src/layouts/StandalonePublicLayout.astro', 'src/pages/index.astro']) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /<FontPreloads/u, file);
  }
});
