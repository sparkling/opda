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
