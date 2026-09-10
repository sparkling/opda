import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createPageFeatureController } from '../src/scripts/page-features.mjs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const astroConfig = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const contentConfig = readFileSync(new URL('../src/content.config.ts', import.meta.url), 'utf8');

test('large documentation collections use Astro chunked storage', () => {
  assert.equal(packageJson.dependencies.astro, '^7.2.4');
  assert.match(
    astroConfig,
    /collectionStorage:\s*\{\s*type:\s*'chunked',\s*chunkSize:\s*1024\s*\*\s*1024,?\s*\}/su,
  );

  for (const collection of ['manual', 'odr', 'adr']) {
    assert.match(contentConfig, new RegExp(`const ${collection} = defineCollection\\(`, 'u'));
  }
  assert.match(contentConfig, /export const collections = \{ manual, odr, adr \};/u);
});

test('only small emitted page styles trade an asset request for protected HTML bytes', async () => {
  const { inlineSmallPageStyles } = await import('../src/integrations/asset-inlining.mjs');
  const bytes = (length) => Buffer.alloc(length);
  assert.equal(inlineSmallPageStyles('_astro/Layout.hash.css', bytes(8191)), true);
  assert.equal(inlineSmallPageStyles('_astro/Layout.hash.css', bytes(16383)), true);
  assert.equal(inlineSmallPageStyles('_astro/Layout.hash.css', bytes(16384)), false);
  assert.equal(inlineSmallPageStyles('_astro/kickoff.hash.css', bytes(52_283)), false);
  for (const name of ['_astro/page.js', '_astro/font.woff2', '_astro/image.webp', '/source.css']) {
    assert.equal(inlineSmallPageStyles(name, bytes(6000)), undefined, name);
  }
  assert.match(astroConfig, /inlineStylesheets:\s*'auto'/u);
  assert.match(astroConfig, /assetsInlineLimit:\s*inlineSmallPageStyles/u);
});

function featureHarness({ elements = false, diagrams = false, disabled = false, loaders = {} } = {}) {
  const page = new EventTarget();
  page.documentElement = { dataset: { pageElements: disabled ? 'disabled' : 'auto' } };
  page.features = { elements, diagrams };
  page.querySelector = (selector) => selector.includes('.mermaid')
    ? (page.features.diagrams ? {} : null)
    : (page.features.elements ? {} : null);
  const calls = { elements: 0, diagrams: 0, adopted: 0, errors: [] };
  const browser = {};
  const runtime = createPageFeatureController({
    pageDocument: page,
    pageWindow: browser,
    loadElements: async () => { calls.elements++; return loaders.elements?.(); },
    loadDiagrams: async () => {
      calls.diagrams++;
      return loaders.diagrams?.() ?? { adoptBareMermaid: () => { calls.adopted++; } };
    },
    onError: (error) => calls.errors.push(error),
  });
  return { page, browser, calls, runtime };
}

test('narrative pages do not request custom-element or diagram runtimes', async () => {
  const { runtime, calls, browser } = featureHarness();
  await runtime.mount();
  await browser.OPDA.adoptBareMermaid();
  assert.equal(calls.elements, 0);
  assert.equal(calls.diagrams, 0);
  runtime.destroy();
});

test('feature runtimes load only when needed and remain single-flight across navigation', async () => {
  const { runtime, page, calls } = featureHarness();
  await runtime.mount();
  page.features.elements = true;
  page.dispatchEvent(new Event('astro:page-load'));
  await runtime.mount();
  assert.equal(calls.elements, 1);
  assert.equal(calls.diagrams, 0);
  page.features.diagrams = true;
  page.dispatchEvent(new Event('astro:page-load'));
  await runtime.mount();
  assert.equal(calls.elements, 1);
  assert.equal(calls.diagrams, 1);
  assert.ok(calls.adopted > 0);
  runtime.destroy();
});

test('the explicit TailwindPlus opt-out does not suppress diagram enhancement', async () => {
  const { runtime, calls } = featureHarness({ elements: true, diagrams: true, disabled: true });
  await runtime.mount();
  assert.equal(calls.elements, 0);
  assert.equal(calls.diagrams, 1);
  assert.equal(calls.adopted, 1);
  runtime.destroy();
});

test('the existing Mermaid bridge enhances dynamically inserted diagrams', async () => {
  const { runtime, page, browser, calls } = featureHarness();
  await runtime.mount();
  page.features.diagrams = true;
  await browser.OPDA.adoptBareMermaid();
  assert.equal(calls.diagrams, 1);
  assert.equal(calls.adopted, 1);
  runtime.destroy();
});

test('navigation and teardown prevent a delayed import from mounting the old page', async () => {
  let resolveDiagrams;
  const waiting = new Promise((resolve) => { resolveDiagrams = resolve; });
  const { runtime, page, browser, calls } = featureHarness({
    diagrams: true, loaders: { diagrams: () => waiting },
  });
  const firstMount = runtime.mount();
  page.dispatchEvent(new Event('astro:before-swap'));
  resolveDiagrams({ adoptBareMermaid: () => { calls.adopted++; } });
  await firstMount;
  assert.equal(calls.adopted, 0);
  await runtime.mount();
  assert.equal(calls.adopted, 1);
  runtime.destroy();
  assert.equal(browser.OPDA.adoptBareMermaid, undefined);
  page.dispatchEvent(new Event('astro:page-load'));
  await runtime.mount();
  assert.equal(calls.adopted, 1);
});

test('failed enhancement imports are contained and retry only on another explicit mount', async () => {
  let fail = true;
  const { runtime, calls } = featureHarness({
    elements: true, loaders: { elements: () => { if (fail) throw new Error('Offline'); } },
  });
  await runtime.mount();
  assert.equal(calls.elements, 1);
  assert.equal(calls.errors.length, 1);
  fail = false;
  await runtime.mount();
  assert.equal(calls.elements, 2);
  runtime.destroy();
});

test('the shared layout uses a conditional feature bootstrap rather than eager engine imports', () => {
  const layout = readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  const features = readFileSync(new URL('../src/scripts/page-features.mjs', import.meta.url), 'utf8');
  assert.match(layout, /data-page-elements=\{tailwindPlus \? 'auto' : 'disabled'\}/u);
  assert.match(layout, /initialisePageFeatures\(\)/u);
  assert.match(layout, /<script is:inline defer src=\{`\/ui\/client\.js\?v=\$\{clientV\}`\}/u,
    'the shared controls must not block the HTML parser or first paint');
  for (const path of ['../src/pages/index.astro', '../src/pages/join/index.astro']) {
    assert.match(readFileSync(new URL(path, import.meta.url), 'utf8'),
      /<script is:inline defer src=\{`\/ui\/client\.js\?v=\$\{clientV\}`\}/u);
  }
  assert.doesNotMatch(layout, /import ['"]@tailwindplus\/elements['"]|import \{ adoptBareMermaid \}/u);
  assert.match(features, /import\('@tailwindplus\/elements'\)/u);
  assert.match(features, /import\('\.\/graph-diagram\.ts'\)/u);
  assert.match(features, /\.mermaid, \.graph-diagram-wrapper/u);
  assert.match(features, /\[popover\]/u);
  assert.doesNotMatch(features, /MutationObserver|setInterval|requestAnimationFrame/u);
});
