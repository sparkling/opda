import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const component = readFileSync(new URL('../src/components/campaign/CampaignThemeImage.astro', import.meta.url), 'utf8');
const bootstrap = component.match(/<script\b[^>]*data-campaign-image-bootstrap[^>]*>([\s\S]*?)<\/script>/u)?.[1];

function selectImage(theme, source) {
  const requests = [];
  const image = {
    dataset: { campaignImageLight: '/light.webp', campaignImageDark: '/dark.webp' },
    matches: (selector) => selector === 'img[data-campaign-image-dark]',
    getAttribute: () => source,
    setAttribute: (name, value) => {
      assert.equal(name, 'src');
      source = value;
      requests.push(value);
    },
  };
  assert.ok(bootstrap, 'theme selection must run inline beside the image');
  runInNewContext(bootstrap, {
    document: { documentElement: { dataset: { theme } }, currentScript: { previousElementSibling: image } },
  });
  return { source, requests };
}

test('paired images do not start a fallback download before selecting the page theme', () => {
  assert.match(component, /src=\{darkSrc \? undefined : lightSrc\}/u);
  assert.match(component, /<script\b[^>]*is:inline[^>]*data-astro-rerun[^>]*data-campaign-image-bootstrap/u);
  assert.doesNotMatch(bootstrap ?? '', /fetch\(|import\(|setTimeout|requestAnimationFrame/u);
  assert.match(component, /loading=\{loading\}[\s\S]*width=\{width\}[\s\S]*height=\{height\}/u);
});

test('dark mode requests only the dark image, immediately', () => {
  assert.deepEqual(selectImage('dark'), { source: '/dark.webp', requests: ['/dark.webp'] });
});

test('light and unspecified themes request only the light image', () => {
  for (const theme of ['light', undefined]) {
    assert.deepEqual(selectImage(theme), { source: '/light.webp', requests: ['/light.webp'] });
  }
});

test('Astro reruns do not reassign an already selected image', () => {
  assert.deepEqual(selectImage('dark', '/dark.webp'), { source: '/dark.webp', requests: [] });
  assert.deepEqual(selectImage('light', '/light.webp'), { source: '/light.webp', requests: [] });
});

test('an inline rerun without its image is harmless', () => {
  assert.ok(bootstrap);
  assert.doesNotThrow(() => runInNewContext(bootstrap, {
    document: { documentElement: { dataset: {} }, currentScript: null },
  }));
});

test('no-JavaScript readers retain the image and its intrinsic dimensions', () => {
  const fallback = component.match(/<noscript>([\s\S]*?)<\/noscript>/u)?.[1];
  assert.ok(fallback);
  assert.match(fallback, /<style is:inline>[\s\S]*img\[data-campaign-image-dark\][\s\S]*display:\s*none/u);
  assert.match(fallback, /<img[\s\S]*src=\{lightSrc\}[\s\S]*alt=\{alt\}[\s\S]*width=\{width\}[\s\S]*height=\{height\}/u);
  assert.match(component, /attributeFilter: \['data-theme'\]/u, 'later theme changes remain supported');
  assert.match(component, /astro:page-load/u, 'in-site navigation still selects images');
});

const layout = readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
const themeBootstrap = layout.match(/<script\b[^>]*data-opda-theme-bootstrap[\s\S]*?>([\s\S]*?)<\/script>/u)?.[1];

function preloadImage({ query = '', storedTheme = null, storageBlocked = false, existing, priorityImage = { lightSrc: '/light.webp', darkSrc: '/dark.webp' } } = {}) {
  const attributes = {};
  const links = existing ? [existing] : [];
  runInNewContext(themeBootstrap, {
    priorityImage,
    defaultHeaderPalette: 'petrol', headerPaletteIds: ['petrol'],
    defaultHeaderIcon: '01', headerIconIds: ['01'],
    URLSearchParams, location: { search: query },
    localStorage: { getItem: (key) => {
      if (storageBlocked) throw new Error('Storage unavailable');
      return key === 'opda-theme' ? storedTheme : null;
    } },
    document: {
      documentElement: {
        setAttribute: (key, value) => { attributes[key] = value; },
        getAttribute: (key) => attributes[key],
      },
      querySelector: () => links[0],
      createElement: (tag) => {
        assert.equal(tag, 'link');
        return { dataset: {}, setAttribute: (key, value) => { attributes[key] = value; } };
      },
      head: { appendChild: (link) => links.push(link) },
    },
  });
  return { attributes, links };
}

test('the selected hero is requested from the head before blocking stylesheets', () => {
  assert.ok(themeBootstrap);
  assert.ok(layout.indexOf('data-opda-theme-bootstrap') < layout.indexOf('<link rel="stylesheet"'));
  for (const [query, storedTheme, expected] of [
    ['?theme=dark', 'light', '/dark.webp'],
    ['?theme=light', 'dark', '/light.webp'],
    ['', 'dark', '/dark.webp'],
    ['?theme=unknown', 'bad-value', '/light.webp'],
  ]) {
    const { links } = preloadImage({ query, storedTheme });
    assert.equal(links.length, 1);
    assert.equal(links[0].rel, 'preload');
    assert.equal(links[0].as, 'image');
    assert.equal(links[0].fetchPriority, 'high');
    assert.equal(links[0].href, expected);
  }
});

test('hero preloading has a light fallback and is opt-in, without duplicate Astro reruns', () => {
  assert.ok(themeBootstrap);
  assert.equal(preloadImage({ storageBlocked: true }).links[0].href, '/light.webp');
  assert.equal(preloadImage({ priorityImage: { lightSrc: '/single.webp' }, query: '?theme=dark' }).links[0].href, '/single.webp');
  assert.equal(preloadImage({ priorityImage: null }).links.length, 0);
  const first = preloadImage({ query: '?theme=dark' }).links[0];
  assert.equal(preloadImage({ query: '?theme=dark', existing: first }).links.length, 1);
});

test('hero preload uses the selected theme responsive candidates and updates on navigation', () => {
  const priorityImage = { lightSrc: '/light.webp', darkSrc: '/dark.webp',
    lightSrcset: '/light-small.webp 480w, /light.webp 1200w',
    darkSrcset: '/dark-small.webp 480w, /dark.webp 1200w', sizes: '(max-width: 768px) 100vw, 1024px' };
  const link = preloadImage({ query: '?theme=dark', priorityImage }).links[0];
  assert.equal(link.imageSrcset, priorityImage.darkSrcset);
  assert.equal(link.imageSizes, priorityImage.sizes);
  preloadImage({ query: '?theme=light', priorityImage, existing: link });
  assert.equal(link.imageSrcset, priorityImage.lightSrcset);
  assert.equal(link.href, '/light.webp');
});

test('responsive candidates are selected before fallback src to avoid a full-size duplicate', () => {
  const assigned = [];
  const image = { dataset: { campaignImageDark: '/dark.webp', campaignSrcsetDark: '/dark-small.webp 480w' },
    matches: () => true, getAttribute: () => null, setAttribute: (key, value) => assigned.push([key, value]) };
  runInNewContext(bootstrap, { document: { documentElement: { dataset: { theme: 'dark' } },
    currentScript: { previousElementSibling: image } } });
  assert.deepEqual(assigned, [['srcset', '/dark-small.webp 480w'], ['src', '/dark.webp']]);
});

test('only top-of-page modelling artwork opts into high priority using the same manifest as the preload', () => {
  const image = readFileSync(new URL('../src/components/modelling/PageIllustration.astro', import.meta.url), 'utf8');
  assert.match(component, /fetchpriority=\{fetchpriority\}/u);
  assert.match(image, /loading="eager" fetchpriority="high"/u);
  for (const file of ['ModellingLayout', 'OntologyChapter']) {
    const source = readFileSync(new URL(`../src/layouts/${file}.astro`, import.meta.url), 'utf8');
    assert.match(source, /getModellingPageArtwork\(Astro\.url\.pathname\)/u);
    assert.match(source, /priorityImage=\{\{ lightSrc: artwork\.light\.file, darkSrc: artwork\.dark\.file \}\}/u);
    assert.match(source, /<PageIllustration artwork=\{artwork\}/u);
  }
});
