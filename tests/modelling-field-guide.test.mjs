import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const sourceDirectory = new URL('../docs/working/modelling-learning/', import.meta.url);

test('field-guide figures are accessible authored sources with light and dark specimens', () => {
  const files = readdirSync(sourceDirectory).filter((file) => file.endsWith('.html'));
  assert.ok(files.length > 0, 'No reviewed teaching figures');
  for (const file of files) {
    const source = readFileSync(new URL(file, sourceDirectory), 'utf8');
    assert.match(source, /data-theme="light"/u);
    assert.match(source, /data-theme="dark"/u);
    assert.match(source, /<ol class="learning-equivalent">/u);
    const ids = [...source.matchAll(/\bid="([^"]+)"/gu)].map((match) => match[1]);
    assert.equal(ids.length, new Set(ids).size, file + ' repeats IDs');
    for (const [, svg] of source.matchAll(/(<svg\b[\s\S]*?<\/svg>)/gu)) {
      assert.match(svg, /role="img" aria-labelledby="/u);
      assert.match(svg, /<svg[^>]*>\s*<title\b/u);
      assert.match(svg, /<desc[^>]*>[^<]+<\/desc>/u);
      for (const [, refs] of svg.matchAll(/aria-labelledby="([^"]+)"/gu)) {
        for (const id of refs.split(' ')) assert.ok(ids.includes(id), 'Unresolved ' + id);
      }
    }
    assert.doesNotMatch(source, /<script|foreignObject|onload=/iu);
    assert.ok(source.split('\n').length < 500, file + ' exceeds file limit');
  }
});

test('field-guide visual projection is scoped and never accepts external HTML', () => {
  const renderer = read('src/components/modelling/learning/diagram-sources.ts');
  assert.match(renderer, /Object\.hasOwn\(sources, kind\)/u);
  assert.match(renderer, /Invalid learning-diagram ID/u);
  assert.doesNotMatch(renderer, /fetch\(|readFile|eval\(/u);
  const css = read('src/styles/modelling/field-guide.css');
  assert.match(css, /\.learning-document/u);
  assert.match(css, /@container/u);
  assert.match(css, /@media print/u);
});

test('editorial layouts constrain reading text, not comparisons and diagrams', () => {
  const css = read('src/styles/modelling/field-guide.css');
  assert.match(css, /\.learning-comparison/u);
  assert.match(css, /container-type: inline-size/u);
  assert.match(css, /max-inline-size: none/u);
  assert.doesNotMatch(css, /max-inline-size: (54|60)rem/u);
  assert.doesNotMatch(css, /\.learning-specimen[\s\S]*?background: var\(--color-surface-alt\)/u);
  const editorial = read('src/styles/editorial-content.css');
  assert.match(editorial, /--editorial-text-max: 64rem/u);
  assert.match(editorial, /:is\(h2, h3, h4\):first-child/u);
});

test('authored callouts share the design-system component without a second visual skin', () => {
  const component = read('src/components/Callout.astro');
  assert.match(component, /callout--/u);
  assert.match(component, /callout__label/u);
  assert.match(component, /aria-labelledby/u);
  assert.match(component, /<slot\s*\/>/u);
  assert.doesNotMatch(component, /<style/u);
  const layout = read('src/layouts/ModellingLayout.astro');
  assert.match(layout, /<Callout/u);
  assert.doesNotMatch(layout, /<aside class=/u);
});

const webpSize = (bytes) => {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const type = bytes.toString('ascii', offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === 'VP8 ') return [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
    if (type === 'VP8X') return [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1];
    if (type === 'VP8L') {
      const bits = bytes.readUInt32LE(data + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    offset = data + length + (length % 2);
  }
  throw new Error('Missing WebP dimensions');
};

test('editorial scenes have matched light/dark assets and intrinsic geometry', () => {
  const manifest = JSON.parse(read('public/images/modelling/field-guide/manifest.json'));
  assert.deepEqual(Object.keys(manifest.scenes).sort(), ['agency', 'conveyancing', 'data-services', 'finance', 'surveying', 'technology']);
  for (const scene of Object.values(manifest.scenes)) {
    assert.ok(scene.prompt && scene.caption);
    assert.equal(scene.dark.editedFrom, scene.light.source);
    for (const mode of ['light', 'dark']) {
      const asset = scene[mode];
      assert.match(asset.file, /^\/images\/modelling\/field-guide\/[a-z-]+\.webp$/u);
      const bytes = readFileSync(new URL('../public' + asset.file, import.meta.url));
      assert.deepEqual(webpSize(bytes), [asset.width, asset.height]);
      assert.deepEqual([asset.width, asset.height], [scene.light.width, scene.light.height]);
      assert.equal(bytes.length, asset.bytes);
    }
  }
  const component = read('src/components/modelling/LearningIllustration.astro');
  assert.match(component, /Object\.hasOwn\(manifest\.scenes, scene\)/u);
  assert.match(component, /CampaignThemeImage/u);
  assert.match(component, /width=\{illustration\.light\.width\} height=\{illustration\.light\.height\}/u);
});
