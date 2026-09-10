import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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

test('modelling destination lists share readable linked-card navigation', () => {
  const component = read('src/components/modelling/SubpageCards.astro');
  assert.match(component, /class="card-grid modelling-subpages"/u);
  assert.match(component, /aria-labelledby=\{labelledby\}/u);
  assert.match(component, /ordered \? 'ol' : 'ul'/u);
  assert.match(component, /<slot\s*\/>/u);
  assert.match(component, /minmax\(min\(100%, 26rem\), 1fr\)/u);
  assert.match(component, /font: 400 var\(--text-lg\)/u);
  assert.doesNotMatch(component, /var\(--text-(?:xs|sm)\)/u);
  for (const path of ['index', 'understand/index', 'explore/index', 'contribute/index', 'method/index', 'explore/contexts-and-connections']) {
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
  assert.deepEqual(Object.keys(manifest.scenes).sort(), [
    'agency', 'context-bridges', 'conveyancing', 'data-services', 'dates-and-history',
    'definition-review', 'finance', 'model-collection', 'rule-testing',
    'sensitive-information', 'surveying', 'technology', 'vocabulary', 'workshop',
  ]);
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

test('retained field-guide illustration uses resolve with contextual alternatives', () => {
  const manifest = JSON.parse(read('public/images/modelling/field-guide/manifest.json'));
  for (const section of ['understand', 'explore', 'contribute']) {
    const directory = 'src/pages/semantic-modelling/' + section + '/';
    for (const file of readdirSync(new URL('../' + directory, import.meta.url)).filter((name) => name.endsWith('.astro'))) {
      const source = read(directory + file);
      for (const [tag] of source.matchAll(/<LearningIllustration\b[^>]*\/>/gu)) {
        const scene = tag.match(/\bscene="([^"]+)"/u)?.[1];
        const alt = tag.match(/\balt="([^"]+)"/u)?.[1];
        assert.ok(Object.hasOwn(manifest.scenes, scene), file + ' uses an unknown scene');
        assert.ok(alt?.trim(), file + ' needs a contextual alternative');
      }
    }
  }
});

test('every live modelling page has its own relevant, paired header artwork', () => {
  const root = new URL('../src/pages/semantic-modelling/', import.meta.url);
  const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    return entry.isDirectory() ? walk(url) : entry.name.endsWith('.astro') ? [url] : [];
  });
  const pages = new Map(walk(root).flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    if (source.includes('Astro.redirect')) return [];
    const suffix = file.pathname.slice(root.pathname.length).replace(/(?:\/)?index\.astro$|\.astro$/u, '');
    return [[('/semantic-modelling/' + suffix).replace(/\/$/u, ''), source]];
  }));
  const directory = new URL('../public/images/modelling/page-headers/', import.meta.url);
  const records = readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const text = readFileSync(new URL(entry.name + '/manifest.json', directory), 'utf8');
      const manifest = JSON.parse(text);
      assert.ok(text.split('\n').length < 500, entry.name + ' manifest exceeds file limit');
      assert.ok(manifest.lightPrompt && manifest.darkPrompt, entry.name + ' needs reproducible prompts');
      return manifest.pages;
    });
  assert.deepEqual(records.map(({ route }) => route).sort(), [...pages.keys()].sort());
  const files = new Set();
  const sourceHashes = new Set();
  const exportHashes = new Set();
  const prompts = new Set();
  for (const record of records) {
    assert.ok(record.title && pages.get(record.route).includes(record.title), record.route + ' title mismatch');
    assert.ok(record.alt?.trim() && record.prompt?.trim(), record.route + ' needs a relevant alternative and scene brief');
    assert.ok(!prompts.has(record.prompt), record.route + ' reuses a scene brief');
    prompts.add(record.prompt);
    assert.equal(record.dark.editedFrom, record.light.source);
    for (const mode of ['light', 'dark']) {
      const asset = record[mode];
      assert.match(asset.file, /^\/images\/modelling\/(?:page-headers\/[a-z-]+|style-variants\/\d{4}-\d{2}\/[a-z-]+)\/[a-z-]+\.webp$/u);
      assert.match(asset.sourceSha256, /^[a-f0-9]{64}$/u);
      const bytes = readFileSync(new URL('../public' + asset.file, import.meta.url));
      const exportHash = createHash('sha256').update(bytes).digest('hex');
      assert.ok(!files.has(asset.file), record.route + ' reuses an image URL');
      assert.ok(!sourceHashes.has(asset.sourceSha256), record.route + ' reuses generated artwork');
      assert.ok(!exportHashes.has(exportHash), record.route + ' duplicates another exported image');
      files.add(asset.file);
      sourceHashes.add(asset.sourceSha256);
      exportHashes.add(exportHash);
      assert.deepEqual(webpSize(bytes), [asset.width, asset.height]);
      assert.equal(asset.width, record.light.width);
      // Native palette edits can differ by one source pixel. Preserve the whole
      // image instead of cropping or stretching it to force identical rounding.
      assert.ok(Math.abs(asset.height - record.light.height) <= 1, asset.file + ' changes the composition ratio');
      assert.equal(bytes.length, asset.bytes);
      assert.ok(bytes.length <= 150_000, asset.file + ' exceeds the editorial asset budget');
      assert.ok(asset.width <= 1200 && asset.width / asset.height >= 2, asset.file + ' is not a shallow landscape');
      const content = asset.exportContentBounds ?? { left: 0, top: 0, width: asset.width, height: asset.height };
      assert.ok(Object.values(content).every(Number.isSafeInteger) && content.width > 0 && content.height > 0
        && content.left >= 0 && content.top >= 0 && content.left + content.width <= asset.width
        && content.top + content.height <= asset.height, asset.file + ' has invalid artwork bounds');
      if (asset.exportContentBounds) assert.deepEqual(asset.exportPadding, {
        left: content.left, top: content.top, right: asset.width - content.left - content.width,
        bottom: asset.height - content.top - content.height,
      }, asset.file + ' must account for every paper-padding pixel');
      assert.ok(Math.abs(content.width / content.height - asset.sourceWidth / asset.sourceHeight) < 0.01,
        asset.file + ' must preserve the uncropped source proportions');
    }
  }
});

test('selected header styles preserve the original artwork and slot dimensions', () => {
  const collections = ['understand', 'ontology', 'participate'].flatMap((name) =>
    JSON.parse(read(`public/images/modelling/page-headers/${name}/manifest.json`)).pages);
  const expected = new Map([
    ['/semantic-modelling/understand/a-property-story', 'architectural-cutaway'],
    ['/semantic-modelling/understand/what-we-are-building', 'sequential-ink-narrative'],
    ['/semantic-modelling/method', 'risograph-editorial'],
    ['/semantic-modelling/method/from-question-to-candidate', 'sequential-ink-narrative'],
  ]);
  for (const [route, style] of expected) {
    const record = collections.find((entry) => entry.route === route);
    assert.equal(record.style, style, route + ' needs the selected medium');
    assert.ok(record.previousIllustrations?.length, route + ' must preserve its earlier illustration');
    for (const previous of record.previousIllustrations) {
      for (const mode of ['light', 'dark']) {
        const oldAsset = previous[mode];
        const bytes = readFileSync(new URL('../public' + oldAsset.file, import.meta.url));
        assert.equal(createHash('sha256').update(bytes).digest('hex'), oldAsset.sha256,
          route + ' must retain the original image unchanged');
        assert.notEqual(record[mode].file, oldAsset.file);
        assert.deepEqual([record[mode].width, record[mode].height], [oldAsset.width, oldAsset.height],
          route + ' must preserve the header dimensions');
      }
    }
  }
});

test('lower-page scene assets are shallower than headers and preserve their source geometry', () => {
  for (const kind of ['working-package', 'revision-review']) {
    const manifest = JSON.parse(read(`public/images/modelling/inline-scenes/2026-09/${kind}/manifest.json`));
    assert.equal(manifest.id, kind);
    assert.ok(manifest.alt && manifest.caption && manifest.lightPrompt && manifest.darkPrompt);
    assert.equal(manifest.dark.editedFrom, manifest.light.source);
    for (const mode of ['light', 'dark']) {
      const asset = manifest[mode];
      assert.match(asset.file, /^\/images\/modelling\/inline-scenes\/2026-09\/[a-z-]+\/[a-z-]+\.webp$/u);
      const bytes = readFileSync(new URL('../public' + asset.file, import.meta.url));
      assert.deepEqual(webpSize(bytes), [asset.width, asset.height]);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
      assert.equal(bytes.length, asset.bytes);
      assert.ok(bytes.length <= 150_000);
      assert.ok(asset.width <= 1200 && asset.width / asset.height >= 3.8,
        `${kind} needs a shallower composition than the 3:1 page headers`);
      assert.deepEqual([asset.width, asset.height], [manifest.light.width, manifest.light.height]);
      const content = asset.exportContentBounds ?? { width: asset.width, height: asset.height };
      // The generator may add blank paper outside a deliberately composed strip.
      // Only a recorded, visually reviewed paper trim may change canvas geometry.
      const source = asset.sourceCrop ?? { x: 0, y: 0, width: asset.sourceWidth, height: asset.sourceHeight };
      assert.ok(Object.values(source).every(Number.isSafeInteger) && source.x >= 0 && source.y >= 0
        && source.width > 0 && source.height > 0 && source.x + source.width <= asset.sourceWidth
        && source.y + source.height <= asset.sourceHeight);
      assert.ok(asset.sourceWidth - source.width <= 4, `${kind} must retain the panoramic drawing's width`);
      if (asset.sourceCrop) assert.match(asset.exportOperation, /blank.*paper/iu);
      assert.ok(Math.abs(content.width / content.height - source.width / source.height) < 0.01,
        `${kind} must not stretch its generated artwork`);
    }
  }
});

test('both modelling templates share the top illustration and natural reading-width layout', () => {
  for (const name of ['ModellingLayout', 'OntologyChapter']) {
    const layout = read('src/layouts/' + name + '.astro');
    const imagePosition = layout.indexOf('<PageIllustration');
    assert.ok(imagePosition > layout.indexOf('<h1>') && imagePosition < layout.indexOf('<slot'), name + ' must show the image before the page content');
    assert.equal([...layout.matchAll(/<PageIllustration\b/gu)].length, 1);
    assert.match(layout, /getModellingPageArtwork\(Astro\.url\.pathname\)/u);
  }
  const component = read('src/components/modelling/PageIllustration.astro');
  assert.match(component, /CampaignThemeImage/u);
  assert.match(component, /data-modelling-illustration=\{artwork\.route\}/u);
  assert.match(component, /max-inline-size: min\(100%, var\(--editorial-text-max, 64rem\)\)/u);
  assert.match(component, /margin-inline: 0 auto/u);
  assert.match(component, /block-size: auto/u);
  assert.match(component, /loading="eager"/u);
  assert.doesNotMatch(component, /object-fit:\s*cover|aspect-ratio:|filter:|overflow:\s*hidden/u);
});
