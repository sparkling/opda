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

test('light and dark learning figures preserve the same claims and connector geometry', () => {
  for (const file of readdirSync(sourceDirectory).filter((name) => name.endsWith('.html'))) {
    const source = readFileSync(new URL(file, sourceDirectory), 'utf8');
    const specimens = [...source.matchAll(/<svg\b[\s\S]*?<\/svg>/gu)]
      .map(([svg]) => svg.replaceAll('-light', '-theme').replaceAll('-dark', '-theme'));
    assert.equal(specimens.length, 2, file + ' needs two theme specimens');
    assert.equal(specimens[0], specimens[1], file + ' changes meaning between themes');
  }
});

test('the property story draws both report versions describing one inspection', () => {
  const source = read('docs/working/modelling-learning/property-story.html');
  const [svg] = source.match(/<svg\b[\s\S]*?<\/svg>/u);
  for (const label of ['Report version 1', 'Report version 2', 'Inspection', 'Flat 1', 'Flat 2', 'Harbour Court']) {
    assert.ok(svg.includes('>' + label + '</text>'), 'Missing subject: ' + label);
  }
  assert.equal([...svg.matchAll(/>describes<\/text>/gu)].length, 2);
  assert.match(svg, />revises<\/text>/u);
  assert.match(svg, />concerns<\/text>/u);
  assert.equal([...svg.matchAll(/marker-end=/gu)].length, 4);
  assert.match(source, /Nothing here asserts a second visit or an inspection of Flat 2/u);
});

test('field-guide illustrations, diagrams and callouts share the reading width; tables stay wide', () => {
  const css = read('src/styles/modelling/field-guide.css');
  assert.match(css, /\.learning-comparison/u);
  assert.match(css, /container-type: inline-size/u);
  assert.match(css, /\.prose\.editorial-content\.learning-document :is\(\.callout, \.learning-editorial, \.learning-figure, \.learning-record, \.learning-comparison\)\s*\{[^}]*max-inline-size: min\(100%, var\(--editorial-text-max\)\)[^}]*margin-inline: 0 auto/su);
  assert.match(css, /\.learning-table\s*\{\s*max-inline-size: none/su);
  assert.doesNotMatch(css, /max-inline-size: (54|60)rem/u);
  assert.doesNotMatch(css, /\.learning-specimen[\s\S]*?background: var\(--color-surface-alt\)/u);
  const editorial = read('src/styles/editorial-content.css');
  assert.match(editorial, /--editorial-text-max: 64rem/u);
  assert.match(editorial, /:is\(h2, h3, h4\):first-child/u);
});

test('example records reuse the shared card surface with readable responsive facts', () => {
  const card = read('src/components/modelling/LearningCard.astro');
  assert.match(card, /class="card learning-record document-flow"/u);
  assert.match(card, /aria-labelledby=\{labelledby\}/u);
  assert.match(card, /<slot\s*\/>/u);
  assert.doesNotMatch(card, /<a\b|<style/u);
  const css = read('src/styles/modelling/field-guide.css');
  assert.match(css, /container: learning-record \/ inline-size/u);
  assert.match(css, /\.learning-record\s*\{[^}]*inline-size: 100%[^}]*min-inline-size: 0/su);
  assert.match(css, /\.learning-record \{ margin-block: var\(--space-6\); \}/u);
  assert.match(css, /\.learning-comparison > \.learning-record \{ margin-block: 0; \}/u);
  assert.match(css, /@container learning-record/u);
  assert.match(css, /grid-template-columns: minmax\(9rem, 12rem\) minmax\(0, 1fr\)/u);
  assert.doesNotMatch(css, /:is\(\.learning-comparison > \*/u);
  for (const path of ['explore/measurements-amounts-and-values', 'explore/names-and-choices']) {
    assert.match(read('src/pages/semantic-modelling/' + path + '.astro'), /<LearningCard labelledby=/u);
  }
});

test('diagram interpretations use the normal-sized shared callout instead of small captions', () => {
  const diagram = read('src/components/modelling/LearningDiagram.astro');
  assert.match(diagram, /import Callout/u);
  assert.match(diagram, /<Callout title=\{figure.title\} tone="information"/u);
  assert.match(diagram, /<p>\{caption \?\? figure.description\}<\/p>/u);
  const css = read('src/styles/modelling/field-guide.css');
  assert.doesNotMatch(css, /\.learning-figure[^{}]*figcaption\s*\{[^}]*var\(--text-sm\)/su);
});

test('modelling parent-page destinations share readable linked-card navigation', () => {
  const component = read('src/components/modelling/SubpageCards.astro');
  assert.match(component, /class="card-grid modelling-subpages"/u);
  assert.match(component, /aria-labelledby=\{labelledby\}/u);
  assert.match(component, /ordered \? 'ol' : 'ul'/u);
  assert.match(component, /<slot\s*\/>/u);
  assert.match(component, /minmax\(min\(100%, 26rem\), 1fr\)/u);
  assert.match(component, /font: 400 var\(--text-lg\)/u);
  assert.doesNotMatch(component, /var\(--text-(?:xs|sm)\)/u);
  for (const path of ['index', 'understand/index', 'explore/index', 'contribute/index', 'method/index']) {
    const source = read('src/pages/semantic-modelling/' + path + '.astro');
    assert.match(source, /<SubpageCards labelledby=/u, path);
    assert.match(source, /<a class="card" href=/u, path);
    assert.doesNotMatch(source, /class="(?:learning-index|og-atlas|og-reference-index)"/u, path);
  }
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
