import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const file = (path) => new URL(path, root);

test('tables separate column headers, row headers, and zebra rows', async () => {
  const [tokens, tables, data, glossary, design] = await Promise.all([
    readFile(file('public/ui/design-tokens.css'), 'utf8'),
    readFile(file('public/ui/design/tables.css'), 'utf8'),
    readFile(file('public/ui/design/data.css'), 'utf8'),
    readFile(file('public/ui/design/glossary-toc.css'), 'utf8'),
    readFile(file('DESIGN.md'), 'utf8'),
  ]);

  for (const token of [
    '--color-table-header-surface',
    '--color-table-header-text',
    '--color-table-row-header-surface',
    '--color-table-stripe-surface',
  ]) {
    assert.match(tokens, new RegExp(`${token}:`), `${token} must be defined`);
  }
  assert.match(tokens, /--color-table-row-header-surface:\s*#fff3c4/u);
  assert.match(tokens, /\[data-theme='dark'\][\s\S]*--color-table-row-header-surface:\s*#4a3e17/u);
  assert.match(
    tokens,
    /\[data-theme='dark'\][\s\S]*--color-table-header-surface:[\s\S]*--color-table-row-header-surface:[\s\S]*--color-table-stripe-surface:/u,
    'dark mode must override all three structural table surfaces',
  );
  assert.match(tables, /\.prose thead th\s*\{[^}]*background:\s*var\(--color-table-header-surface\)[^}]*color:\s*var\(--color-table-header-text\)/su);
  assert.match(tables, /\.prose tbody th\[scope=["']row["']\]\s*\{[^}]*background:\s*var\(--color-table-row-header-surface\)/su);
  assert.match(tables, /\.prose tbody tr:nth-child\(2n\) > td\s*\{[^}]*background:\s*var\(--color-table-stripe-surface\)/su);
  assert.match(data, /\.db-table thead th\s*\{[^}]*background:\s*var\(--color-table-header-surface\)[^}]*color:\s*var\(--color-table-header-text\)/su);
  assert.match(data, /\.db-table tbody tr:nth-child\(2n\) td\s*\{[^}]*background:\s*var\(--color-table-stripe-surface\)/su);
  assert.match(glossary, /\.glossary-table th\s*\{[^}]*background:\s*var\(--color-table-header-surface\)[^}]*color:\s*var\(--color-table-header-text\)/su);
  assert.match(glossary, /\.glossary-table tbody tr:nth-child\(2n\)\s*\{[^}]*background:\s*var\(--color-table-stripe-surface\)/su);
  assert.match(design, /column headers, row headers and zebra rows use three distinct semantic surfaces/u);
  assert.match(design, /Row headers use a restrained\s+yellow-tinted surface/u);
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
