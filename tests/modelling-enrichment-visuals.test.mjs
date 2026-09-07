import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const kinds = ['connected-views', 'vocabulary-representations', 'constraint-trace', 'mapping-review', 'privacy-scope'];

test('new diagrams share the accessible, theme-aware frame and have complete metadata', () => {
  const source = read('src/components/modelling/EnrichmentVisual.astro');
  assert.match(source, /<VisualFrame id=\{id\} \{\.\.\.figure\}>/u);
  assert.match(source, /randomUUID\(\)/u);
  assert.match(source, /Object\.hasOwn\(figures, kind\)/u);
  for (const kind of kinds) {
    assert.ok(source.includes(`'${kind}': {`));
    assert.ok(source.includes(`kind === '${kind}'`));
  }
  for (const field of ['title', 'description', 'eyebrow', 'takeaway']) {
    assert.equal([...source.matchAll(new RegExp(`    ${field}:`, 'g'))].length, kinds.length);
  }
  assert.doesNotMatch(source, /<script\b|<style\b|foreignObject|onload=/iu);
});

test('editorial pairs preserve intrinsic landscape geometry without cropping', () => {
  for (const kind of ['property-story', 'modelling-workbench']) {
    for (const mode of ['light', 'dark']) {
      const png = readFileSync(new URL(`../public/images/modelling/enrichment/${kind}-${mode}.png`, import.meta.url));
      assert.equal(png.subarray(1, 4).toString(), 'PNG');
      assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [2172, 724]);
    }
  }
  const component = read('src/components/modelling/ModellingIllustration.astro');
  assert.match(component, /CampaignThemeImage/u);
  assert.match(component, /block-size: auto/u);
  assert.doesNotMatch(component, /object-fit:\s*cover|overflow:\s*hidden/u);
  assert.match(read('src/components/campaign/CampaignThemeImage.astro'), /width=\{width\}[\s\S]*height=\{height\}/u);
});

test('learning term links resolve to the shared glossary and the new chapter is navigable', () => {
  const glossary = read('src/pages/glossary.astro');
  const routeRoot = new URL('../src/pages/semantic-modelling/', import.meta.url);
  const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    return entry.isDirectory() ? walk(url) : entry.name.endsWith('.astro') ? [url] : [];
  });
  for (const file of walk(routeRoot)) {
    const source = readFileSync(file, 'utf8');
    for (const [, anchor] of source.matchAll(/href="\/glossary#([^"]+)"/gu)) {
      assert.ok(glossary.includes(`id="${anchor}"`), `Missing shared glossary anchor: ${anchor}`);
    }
  }
  assert.match(read('src/lib/modelling-navigation.ts'), /page\('method\/vocabularies-and-classification', 'Vocabularies and classification'\)/u);
});
