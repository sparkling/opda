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
  assert.match(tokens, /--color-table-header-surface:\s*var\(--brand-ink\)/u);
  assert.match(tokens, /\[data-theme='dark'\][\s\S]*--color-table-header-surface:\s*var\(--color-surface-tint\)/u);
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
  assert.match(design, /\| Column header \| `#2C273B` \| `#3A3550` \|/u);
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

test('table variants use the wrap-first layout contract', async () => {
  const [tables, data, glossary, propertyPack, designPage, presentation, client, forced, resource, design, adr] = await Promise.all([
    readFile(file('public/ui/design/tables.css'), 'utf8'),
    readFile(file('public/ui/design/data.css'), 'utf8'),
    readFile(file('public/ui/design/glossary-toc.css'), 'utf8'),
    readFile(file('src/styles/property-pack.css'), 'utf8'),
    readFile(file('src/pages/design-system.astro'), 'utf8'),
    readFile(file('docs/design-system-site/styles.css'), 'utf8'),
    readFile(file('public/ui/client.js'), 'utf8'),
    readFile(file('public/ui/design/forced-colors.css'), 'utf8'),
    readFile(file('src/pages/resource.astro'), 'utf8'),
    readFile(file('DESIGN.md'), 'utf8'),
    readFile(file('docs/adr/ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md'), 'utf8'),
  ]);

  assert.match(tables, /table-layout:\s*fixed/u);
  assert.match(tables, /overflow-wrap:\s*anywhere/u);
  assert.match(tables, /table > caption\s*\{[^}]*position:\s*absolute[^}]*clip-path:\s*inset\(50%\)/su);
  assert.match(data, /\.db-table\s*\{[^}]*min-width:\s*0[^}]*table-layout:\s*fixed/su);
  assert.match(data, /\.db-table :is\(th, td\)\s*\{[^}]*overflow-wrap:\s*anywhere[^}]*white-space:\s*normal/su);
  assert.doesNotMatch(data, /min-width:\s*60rem/u);
  assert.doesNotMatch(data, /\.db-table-wrap\s*\{[^}]*overflow-x:\s*auto/su);
  assert.match(glossary, /\.glossary-table\s*\{[^}]*table-layout:\s*fixed/su);
  assert.doesNotMatch(glossary, /\.glossary-table td:first-child\s*\{[^}]*white-space:\s*nowrap/su);
  assert.match(propertyPack, /\.v2-table-wrap table\s*\{[^}]*min-width:\s*0[^}]*table-layout:\s*fixed/su);
  assert.doesNotMatch(propertyPack, /min-width:\s*48rem/u);
  assert.doesNotMatch(propertyPack, /\.v2-table-wrap\s*\{[^}]*overflow-x:\s*auto/su);
  assert.doesNotMatch(designPage, /horizontally scrollable/u);
  assert.doesNotMatch(designPage, /\.table-region\s*\{[^}]*overflow-x:\s*auto/su);
  assert.match(presentation, /table\s*\{[^}]*min-width:\s*0[^}]*table-layout:\s*fixed/su);
  assert.match(presentation, /table > caption\s*\{[^}]*position:\s*absolute[^}]*clip-path:\s*inset\(50%\)/su);
  assert.doesNotMatch(presentation, /\.table-frame\s*\{[^}]*overflow-x:\s*auto/su);
  assert.doesNotMatch(client, /responsive-table/u);
  assert.doesNotMatch(forced, /responsive-table/u);
  assert.doesNotMatch(resource, /\.res-(?:csv|folder)-table-wrap\s*\{[^}]*overflow-x:\s*auto/su);
  assert.match(resource, /\.res-csv-wrap, \.res-folder-table-wrap\s*\{[^}]*overflow-x:\s*hidden[^}]*overflow-y:\s*auto/su);
  assert.match(resource, /\.res-prose-wrap table,[^}]*table-layout:\s*fixed/su);
  assert.match(resource, /\.res-prose-wrap th,[^}]*overflow-wrap:\s*anywhere[^}]*white-space:\s*normal/su);
  assert.match(resource, /\.res-prose-wrap th,[^}]*color:\s*var\(--color-table-header-text\)[^}]*background:\s*var\(--color-table-header-surface\)/su);
  assert.match(design, /Tables fit the available content track rather than creating a horizontal scrollbar/u);
  assert.match(design, /Visible caption bars are omitted/u);
  assert.doesNotMatch(design, /labelled horizontal overflow region/u);
  assert.match(adr, /table columns wrap within the content track without\s+horizontal scrolling/u);
  assert.match(adr, /Visible caption bars are\s+removed/u);
  assert.doesNotMatch(adr, /tables provide labelled overflow/u);
});

test('shared manual and ontology table components do not create focusable scrollers', async () => {
  const paths = [
    'src/components/manual/AttributeTable.astro',
    'src/components/manual/SchemeMembersTable.astro',
    'src/components/manual/EntityApiPage.astro',
    'src/components/ontology/ClassDetail.astro',
    'src/components/ontology/PropertyDetail.astro',
    'src/components/ontology/ShapeDetail.astro',
  ];
  for (const path of paths) {
    const source = await readFile(file(path), 'utf8');
    assert.doesNotMatch(source, /class="[^"]*table-wrap[^"]*"[^>]*role="region"[^>]*tabindex="0"/u, path);
    assert.doesNotMatch(source, /(?:table-wrap|table-wrap)\s*\{[^}]*overflow-x:\s*auto/su, path);
    assert.match(source, /table-layout:\s*fixed/u, path);
    assert.match(source, /overflow-wrap:\s*anywhere/u, path);
    assert.match(source, /white-space:\s*normal/u, path);
  }

  for (const path of paths.slice(0, 3)) {
    const source = await readFile(file(path), 'utf8');
    assert.match(source, /th\s*\{[^}]*background:\s*var\(--color-table-header-surface\)[^}]*color:\s*var\(--color-table-header-text\)/su, path);
  }
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
