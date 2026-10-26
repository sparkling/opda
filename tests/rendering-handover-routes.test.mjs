import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { HANDOVER_DOCUMENTS } from '../src/lib/handover-navigation.ts';

test('handover migration preserves document anchors and legacy URL search and fragments', async () => {
  const overview = await readFile(new URL('../src/pages/resources/handover/index.astro', import.meta.url), 'utf8');
  const anchors = [...overview.matchAll(/<li id="([^"]+)"><a href="([^"#]+)#([^"]+)"/gu)];
  assert.equal(anchors.length, 14);
  for (const [, id, route, fragment] of anchors) {
    assert.equal(id, fragment);
    const document = await readFile(new URL(`../src/pages${route}.astro`, import.meta.url), 'utf8');
    assert.ok(document.includes(`id="${fragment}"`), `${route} retains ${fragment}`);
  }
  const redirect = await readFile(new URL('../src/pages/handover/[...path].astro', import.meta.url), 'utf8');
  const script = redirect.match(/<script[^>]*>([\s\S]*?)<\/script>/u)[1];
  for (const target of ['/resources/handover', ...HANDOVER_DOCUMENTS.map(({ url }) => url)]) {
    let destination;
    runInNewContext(script, { target, window: { location: {
      search: '?from=handoff', hash: '#validation', replace: (url) => { destination = url; },
    } } });
    assert.equal(destination, `${target}?from=handoff#validation`);
  }
  assert.match(redirect, /name="robots" content="noindex"/u);
  assert.match(redirect, /rel="canonical"/u);
});
