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
