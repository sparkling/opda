import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const file = (path) => new URL(path, root);

test('all tables separate column headers, first-column cells, and zebra rows', async () => {
  const [tokens, tables, data, glossary, design, presentation] = await Promise.all([
    readFile(file('public/ui/design-tokens.css'), 'utf8'),
    readFile(file('public/ui/design/tables.css'), 'utf8'),
    readFile(file('public/ui/design/data.css'), 'utf8'),
    readFile(file('public/ui/design/glossary-toc.css'), 'utf8'),
    readFile(file('DESIGN.md'), 'utf8'),
    readFile(file('docs/design-system-site/styles.css'), 'utf8'),
  ]);

  for (const token of [
    '--color-table-header-surface',
    '--color-table-header-text',
    '--color-table-row-header-surface',
    '--color-table-stripe-surface',
  ]) {
    assert.match(tokens, new RegExp(`${token}:`), `${token} must be defined`);
  }
  assert.match(tokens, /--color-table-row-header-surface:\s*#f4f0e4/u);
  assert.match(tokens, /\[data-theme='dark'\][\s\S]*--color-table-row-header-surface:\s*#302c26/u);
  assert.equal([...tokens.matchAll(/--color-table-header-surface:\s*var\(--color-data-1\)/gu)].length, 2);
  assert.match(
    tokens,
    /\[data-theme='dark'\][\s\S]*--color-table-header-surface:[\s\S]*--color-table-row-header-surface:[\s\S]*--color-table-stripe-surface:/u,
    'dark mode must override all three structural table surfaces',
  );
  assert.match(tables, /\.prose thead th\s*\{[^}]*background:\s*var\(--color-table-header-surface\)[^}]*color:\s*var\(--color-table-header-text\)/su);
  assert.match(tables, /\.prose tbody tr > :is\(th, td\):first-child\s*\{[^}]*background:\s*var\(--color-table-row-header-surface\)[^}]*font-weight:\s*400/su);
  assert.match(tables, /\.prose tbody tr:nth-child\(2n\) > td:not\(:first-child\)\s*\{[^}]*background:\s*var\(--color-table-stripe-surface\)/su);
  assert.match(data, /\.db-table thead th\s*\{[^}]*background:\s*var\(--color-table-header-surface\)[^}]*color:\s*var\(--color-table-header-text\)/su);
  assert.match(data, /\.db-table tbody td\s*\{[^}]*font:\s*400[^}]*\}/su);
  assert.match(data, /\.db-table tbody td:first-child\s*\{[^}]*background:\s*var\(--color-table-row-header-surface\)/su);
  assert.match(data, /\.db-table tbody tr:nth-child\(2n\) td:not\(:first-child\)\s*\{[^}]*background:\s*var\(--color-table-stripe-surface\)/su);
  assert.match(glossary, /\.glossary-table th\s*\{[^}]*background:\s*var\(--color-table-header-surface\)[^}]*color:\s*var\(--color-table-header-text\)/su);
  assert.match(glossary, /\.glossary-table td:first-child\s*\{[^}]*background:\s*var\(--color-table-row-header-surface\)[^}]*font:\s*400/su);
  assert.match(glossary, /\.glossary-table tbody tr:nth-child\(2n\) > td:not\(:first-child\)\s*\{[^}]*background:\s*var\(--color-table-stripe-surface\)/su);
  assert.match(presentation, /tbody tr > :first-child\s*\{[^}]*background:\s*var\(--table-row-header\)[^}]*font-weight:\s*400/su);
  assert.match(presentation, /tbody tr:nth-child\(even\) > td:not\(:first-child\)/u);
  assert.match(design, /column headers, first-column body cells and zebra rows use three distinct semantic/u);
  assert.match(design, /Every body-row first cell uses\s+regular body weight on a quiet warm-neutral surface/u);
  assert.match(design, /\| First body column \| `#F4F0E4` \| `#302C26` \|/u);
  assert.match(design, /\| Column header \| `#6C5BD4` \| `#6C5BD4` \|/u);
  assert.match(design, /Two or more repeated records with a\s+consistent label and explanation belong in a semantic two-column table/u);
});

test('prose lists have explicit space above and below', async () => {
  const [content, design] = await Promise.all([
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('DESIGN.md'), 'utf8'),
  ]);

  assert.match(content, /\.prose > :is\(ul, ol\)\s*\{[^}]*margin-block:\s*var\(--space-5\)/su);
  assert.match(design, /Lists have a small tokenised gap above and below/u);
});

test('repeated label-and-explanation records use semantic tables', async () => {
  const page = await readFile(
    file('src/pages/pdtf-1/extracted-ontology/lineage-provenance-and-verification/historical-modelling/bounded-contexts.astro'),
    'utf8',
  );
  const extensionSection = page.match(/<h2 id="extensionAxes">[\s\S]*?(?=<h2 id="implications">)/u)?.[0] ?? '';
  const implicationsSection = page.match(/<h2 id="implications">[\s\S]*?(?=<\/Layout>)/u)?.[0] ?? '';

  assert.doesNotMatch(extensionSection, /<ul>/u);
  assert.match(extensionSection, /<th scope="col">Potential context<\/th>/u);
  assert.equal([...extensionSection.matchAll(/<th scope="row">/gu)].length, 9);
  assert.doesNotMatch(implicationsSection, /<ul>/u);
  assert.match(implicationsSection, /<th scope="col">Linked-data area<\/th>/u);
  assert.equal([...implicationsSection.matchAll(/<th scope="row">/gu)].length, 5);
});
