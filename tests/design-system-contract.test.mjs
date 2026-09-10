import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdtemp, readFile, readdir, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { assetVersion } from '../src/lib/asset-version.mjs';

const root = new URL('../', import.meta.url);
const file = (path) => new URL(path, root);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function luminance(hex) {
  const channels = hex.replace('#', '').match(/../gu)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

async function markdownFiles(path) {
  try {
    const entries = await readdir(file(path), { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
      const child = `${path}/${entry.name}`;
      if (entry.isDirectory()) return markdownFiles(child);
      return entry.name.endsWith('.md') || entry.name.endsWith('.mdx') ? [child] : [];
    }));
    return nested.flat();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function filesWithExtension(path, extension) {
  const entries = await readdir(file(path), { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) return filesWithExtension(child, extension);
    return entry.name.endsWith(extension) ? [child] : [];
  }));
  return nested.flat();
}

const contractFiles = [
  'DESIGN.md',
  'public/ui/design-tokens.css',
  'public/ui/design-system.css',
  'public/ui/design/base.css',
  'public/ui/design/shell.css',
  'public/ui/design/shell-support.css',
  'public/ui/design/content.css',
  'public/ui/design/tables.css',
  'public/ui/design/components.css',
  'public/ui/design/header-brand.css',
  'public/ui/design/header-brand-previews.css',
  'public/ui/design/search-dialog.css',
  'public/ui/design/public.css',
  'public/ui/design/diagrams.css',
  'public/ui/design/navigation.css',
  'public/ui/design/data.css',
  'public/ui/design/glossary-toc.css',
  'public/ui/design/mermaid.css',
  'public/ui/design/print.css',
  'public/ui/design/forced-colors.css',
  'src/pages/design-system.astro',
  'docs/design-system-site/index.html',
  'docs/design-system-site/styles.css',
  'docs/design-system-site/site.js',
];

test('the replacement design system ships its normative contract and presentation', async () => {
  for (const path of contractFiles) await access(file(path));
  const [design, components, live, presentation, presentationCss, decision] = await Promise.all([
    readFile(file('DESIGN.md'), 'utf8'), readFile(file('public/ui/design/components.css'), 'utf8'),
    readFile(file('src/pages/design-system.astro'), 'utf8'), readFile(file('docs/design-system-site/index.html'), 'utf8'),
    readFile(file('docs/design-system-site/styles.css'), 'utf8'), readFile(file('docs/adr/ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md'), 'utf8'),
  ]);
  assert.match(design, /aligned fact rows support comparison/u);
  assert.match(components, /\.card-grid\s*\{[^}]*repeat\(auto-fit,/su);
  assert.match(components, /\.card__stats\s*\{[^}]*grid-template-columns:\s*repeat\(3,/su);
  assert.match(components, /a\.card:focus-visible/u);
  assert.match(live, /aria-label="Linked card pattern"/u);
  for (const source of [live, presentation]) assert.match(source, /Icon-and-name heading/u);
  assert.match(components + presentationCss, /brand-heading/u);
  assert.match(components, /\.brand-heading__label\s*\{[^}]*white-space:\s*nowrap/su);
  assert.match(presentation, /content-card__stats/u);
  assert.match(presentationCss, /\.content-card__stats/u);
  assert.match(decision, /On 23 August 2026 the shared card contract was clarified/u);
});

test('official brand assets retain supplied geometry, bytes and presentation parity', async () => {
  const assets = [
    ['opda-wordmark-dark.svg', '0 0 1385.6 392.9', '91f10f8481a2caab8700fdb540489004777a246348644e126eca7a4e3b9efb8f'],
    ['opda-wordmark-white.svg', '0 0 1385.6 392.9', '18bc8957fdd84342de4acc9284dd574a2604ecfcc5bdba5e26099e02168de97a'],
    ['opda-icon-yellow.svg', '0 0 84 100', 'e547e3a8fc9f4f9b0195b1dc4fae3deb71a70c5a24a634e4f7fc356c6488ab81'],
  ];
  for (const [name, viewBox, hash] of assets) {
    const canonical = await readFile(file(`public/ui/brand/${name}`));
    const presentation = await readFile(file(`docs/design-system-site/assets/${name}`));
    assert.match(canonical.toString('utf8'), new RegExp(`viewBox=["']${viewBox.replaceAll('.', '\\.')}["']`, 'u'));
    assert.equal(sha256(canonical), hash, `${name} differs from the supplied vector`);
    assert.equal(sha256(presentation), hash, `presentation copy of ${name} drifted`);
  }
});

test('tokens encode the supplied identity and derived accessible roles', async () => {
  const source = await readFile(file('public/ui/design-tokens.css'), 'utf8');
  for (const value of ['#2c273b', '#231f2f', '#fec92b', '#fac238', '#ffffff', '#f9f9f9']) {
    assert.ok(source.toLowerCase().includes(value), `missing supplied brand value ${value}`);
  }
  for (const token of [
    '--font-display', '--font-sans', '--font-mono', '--color-focus',
    '--color-status-success', '--color-status-warning', '--color-status-danger',
    '--color-data-1', '--color-header-brand-mark-tile', '--color-header-brand-name',
    '--target-inline-min', '--target-min', '--content-max', '--motion-standard',
    '--content-gutter', '--color-text-placeholder', '--on-dark-muted', '--text-caption',
    '--color-action-primary-text', '--color-header-surface', '--color-header-text',
    '--color-header-muted', '--color-header-border', '--color-header-hover-surface',
  ]) assert.ok(source.includes(token), `missing derived token ${token}`);
  assert.match(source, /--content-max:\s*100rem/u);
  assert.match(source, /Roboto Slab/u);
  assert.match(source, /--font-sans:\s*'Source Sans 3'/u);
  assert.match(source, /--font-reading:\s*'Atkinson Hyperlegible Next'/u);
});

test('the documentation corpus no longer freezes the superseded design system', async () => {
  const paths = [
    'DESIGN.md', 'CLAUDE-DESIGN-BRIEF.md',
    ...await markdownFiles('design'),
    ...await markdownFiles('docs'),
  ];
  const forbidden = /(?:Claude Design is authoritative|FROZEN SNAPSHOT|design system (?:is )?(?:locked|unchangeable)|never re-imported|MUST remain (?:unlayered|unchanged))/iu;
  for (const path of paths) {
    const source = await readFile(file(path), 'utf8');
    assert.doesNotMatch(source, forbidden, path);
  }
});

test('major semantic pairs meet the AA contrast contract', () => {
  const pairs = [
    ['body', '#231f2f', '#ffffff'],
    ['muted', '#625d72', '#ffffff'],
    ['link', '#5b51d8', '#ffffff'],
    ['ink on amber', '#2c273b', '#fec92b'],
    ['success', '#1e7b4d', '#e7f4ed'],
    ['warning', '#8a5a00', '#fbf1da'],
    ['danger', '#b42318', '#fbeae8'],
    ['information', '#2e5fa3', '#e9f0fa'],
    ['dark text', '#f9f9f9', '#131224'],
    ['dark secondary', '#a5a1b2', '#131224'],
    ['light placeholder', '#625d72', '#ffffff'],
    ['dark placeholder', '#a5a1b2', '#131224'],
    ['dark link', '#a9a0ff', '#131224'],
  ];
  for (const [name, foreground, background] of pairs) {
    assert.ok(contrast(foreground, background) >= 4.5, `${name} fails AA`);
  }
});

test('visited prose links cannot override shared button foregrounds', async () => {
  const base = await readFile(file('public/ui/design/base.css'), 'utf8');
  const visited = base.match(/([^{}]+)\{\s*color:\s*var\(--color-link-visited\);\s*\}/u)?.[1].trim();
  assert.equal(visited, '.prose a:visited:not(:where(.btn, .cta, [role="button"]))');
  assert.doesNotMatch(base, /\.prose\s+a:visited\s*\{/u);
});

test('live shared surfaces no longer depend on the superseded visual language', async () => {
  const paths = [
    'public/ui/design-tokens.css',
    ...contractFiles.filter((path) => path.startsWith('public/ui/design/')),
    'src/styles/graph-diagram.css',
    'src/lib/diagram-palette.ts',
    'public/ui/graph-engines/_shared.js',
    'public/ui/graph-engines/mermaid.js',
  ];
  const legacy = /(?:Fraunces|JetBrains Mono|fontFamily:\s*['"]Inter|font-family:\s*['"]Inter|#CC785C|#FAF9F5|Cagle palette|Claude theme)/iu;
  for (const path of paths) assert.doesNotMatch(await readFile(file(path), 'utf8'), legacy, path);
});

test('live implementation consumes semantic tokens rather than legacy aliases', async () => {
  const modules = [
    'public/ui/design-tokens.css',
    ...await filesWithExtension('public/ui/design', '.css'),
    ...await filesWithExtension('src/styles', '.css'),
    ...await filesWithExtension('src/pages', '.astro'),
    ...await filesWithExtension('src/components', '.astro'),
    ...await filesWithExtension('src/layouts', '.astro'),
    ...await filesWithExtension('public/ui', '.js'),
  ].filter((path) => path !== 'public/ui/tailwind.built.css');
  const legacyAlias = /--(?:(?:cream|bone|stone|graphite|terracotta|teal|amber|plum|crimson)-|ink-1000\b|surface-dark(?:-alt|-tint)?\b|color-(?:brand|ink|accent|success|warning|danger|info)-)/u;
  for (const path of modules) {
    assert.doesNotMatch(await readFile(file(path), 'utf8'), legacyAlias, path);
  }
  const dot = await readFile(file('public/ui/graph-engines/dot.js'), 'utf8');
  assert.match(dot, /fontname="DM Sans"/u);
  assert.doesNotMatch(dot, /fontname="Inter/u);
});

test('Mermaid loading state hides raw source and exposes labelled outcomes', async () => {
  const component = await readFile(file('src/components/GraphDiagram.astro'), 'utf8');
  const template = await readFile(file('src/lib/graph-diagram-shell.ts'), 'utf8');
  const shell = await readFile(file('src/scripts/graph-diagram.ts'), 'utf8');
  const renderer = await readFile(file('src/scripts/graph-diagram-mermaid.ts'), 'utf8');
  const styles = await readFile(file('src/styles/graph-diagram.css'), 'utf8');

  assert.match(component, /graphDiagramShellHtml/u);
  assert.doesNotMatch(component, /class="diagram-loading"|class="gd-actionbar"/u);
  assert.match(shell, /graphDiagramShellHtml/u);
  assert.doesNotMatch(shell, /const GD_SHELL_HTML|const GD_ICON/u);
  assert.match(template, /class="diagram-loading" role="status" aria-live="polite"/u);
  assert.match(template, /class="gd-mermaid" aria-hidden="true"/u);
  assert.match(styles, /\.graph-diagram-wrapper \.gd-mermaid:not\(\.gd-rendered\)[\s\S]*?opacity:\s*0;/u);
  assert.match(styles, /\.graph-diagram-wrapper \.gd-mermaid:not\(\.gd-rendered\)[\s\S]*?clip-path:\s*inset\(50%\);/u);
  assert.match(renderer, /pre\.classList\.add\('gd-rendered'\)/u);
  assert.match(renderer, /className = 'diagram-fallback'/u);
  assert.match(renderer, /setAttribute\('role', 'alert'\)/u);
});

test('the design facade versions every imported module from one graph hash', async () => {
  const source = await readFile(file('public/ui/design-system.css'), 'utf8');
  const imports = [...source.matchAll(/@import url\("[^"?]+\.css\?v=([a-f0-9]{12})"\);/gu)];
  assert.ok(imports.length >= 14, 'every design module must be versioned');
  assert.equal(new Set(imports.map((entry) => entry[1])).size, 1, 'module graph must share one hash');
  const script = await readFile(file('scripts/version-design-system.mjs'), 'utf8');
  assert.match(script, /renderVersionedFacade/u);
  assert.match(script, /design-system import escapes public\/ui/u);
});

test('public asset versions are content-derived, not timestamp-derived', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'opda-asset-version-'));
  const fixture = path.join(directory, 'client.js');
  try {
    await writeFile(fixture, 'export const version = 1;\n');
    const first = assetVersion('/client.js', directory);
    await utimes(fixture, new Date('2001-01-01T00:00:00Z'), new Date('2001-01-01T00:00:00Z'));
    assert.equal(assetVersion('/client.js', directory), first, 'mtime alone must not alter rendered asset URLs');
    await writeFile(fixture, 'export const version = 1;\n');
    assert.equal(assetVersion('/client.js', directory), first, 'a clean rebuild with identical bytes must preserve rendered asset URLs');
    await writeFile(fixture, 'export const version = 2;\n');
    assert.notEqual(assetVersion('/client.js', directory), first, 'changed bytes must alter rendered asset URLs');
    assert.throws(() => assetVersion('/../outside.js', directory), /stay within the public directory/u);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('interactive shell dependencies are pinned and bundled locally', async () => {
  const layout = await readFile(file('src/layouts/Layout.astro'), 'utf8');
  const packageSource = JSON.parse(await readFile(file('package.json'), 'utf8'));
  assert.match(layout, /import '@tailwindplus\/elements'/u);
  assert.match(layout, /import \{ assetVersion \} from '@\/lib\/asset-version\.mjs'/u);
  assert.doesNotMatch(layout, /mtimeMs|statSync/u);
  assert.doesNotMatch(layout, /cdn\.jsdelivr\.net|@tailwindplus\/elements@1/u);
  assert.equal(packageSource.dependencies['@tailwindplus/elements'], '1.0.22');
});


test('graph and data tools preserve keyboard and semantic state contracts', async () => {
  const [component, template, graph, mermaid, graphCss, dataBrowser] = await Promise.all([
    readFile(file('src/components/GraphDiagram.astro'), 'utf8'),
    readFile(file('src/lib/graph-diagram-shell.ts'), 'utf8'),
    readFile(file('src/scripts/graph-diagram.ts'), 'utf8'),
    readFile(file('src/scripts/graph-diagram-mermaid.ts'), 'utf8'),
    readFile(file('src/styles/graph-diagram.css'), 'utf8'),
    readFile(file('public/ui/data-browser.js'), 'utf8'),
  ]);
  assert.match(component, /<figure\s+class="graph-diagram-wrapper"\s+data-node-interaction="interactive"/u);
  assert.match(component, /<figcaption class="gd-caption"/u);
  assert.match(template, /role="group" aria-label="Property layers"/u);
  for (const [key, label, pressed] of [
    ['datatype', 'Datatype properties', 'false'],
    ['object', 'Object properties', 'true'],
    ['inheritance', 'Inheritance', 'true'],
  ]) {
    assert.match(template, new RegExp(`data-diagram-layer="${key}"[\\s\\S]*?aria-pressed="${pressed}"[\\s\\S]*?>${label}<`, 'u'));
  }
  assert.match(graph, /Figure \$\{number\}/u);
  assert.match(graph, /setAttribute\('role', 'dialog'\)/u);
  assert.match(graph, /setAttribute\('aria-modal', 'true'\)/u);
  assert.match(graph, /returnFocus\?\.isConnected/u);
  assert.match(graph, /document\.fonts\?\.ready/u);
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) assert.match(mermaid, new RegExp(key, 'u'));
  assert.match(mermaid, /setAttribute\('aria-pressed'/u);
  assert.doesNotMatch(graphCss, /drop-shadow\(0 0 0\b/iu);
  assert.match(dataBrowser, /class:\s*'db-sort-button'/u);
  assert.match(dataBrowser, /setAttribute\('aria-sort', 'ascending'\)/u);
  assert.match(dataBrowser, /aria-label': 'Choose visible columns'/u);
});

test('every live Mermaid path delegates to the single shared renderer', async () => {
  const [renderer, adapter, redundantAdapter, page, classIndex] = await Promise.all([
    readFile(file('src/scripts/graph-diagram-mermaid.ts'), 'utf8'),
    readFile(file('public/ui/graph-engines/mermaid.js'), 'utf8'),
    readFile(file('public/ui/graph-engines/mermaid-elk.js'), 'utf8').catch(() => ''),
    readFile(file('src/pages/development/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources/graph.astro'), 'utf8'),
    readFile(file('src/pages/development/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources/classes.astro'), 'utf8'),
  ]);
  assert.match(renderer, /import\('mermaid'\)/u);
  assert.match(renderer, /mermaid\.initialize/u);
  assert.match(renderer, /mermaid\.render/u);
  assert.match(adapter, /OPDA\.adoptBareMermaid/u);
  assert.doesNotMatch(adapter + redundantAdapter, /mermaid\.initialize|mermaid\.render|jsdelivr\.net\/npm\/mermaid/u);
  assert.equal((page.match(/graph-engines\/mermaid(?:-elk)?\.js/gu) ?? []).length, 1);
  assert.match(classIndex, /MERMAID_PROPERTY_LAYER_HEADER/u);
  assert.match(classIndex, /mermaidPropertyLayerCondition\('object'/u);
  assert.match(classIndex, /mermaidPropertyLayerCondition\('inheritance'/u);
});

test('shared buttons expose the adopted interaction and outcome states', async () => {
  const [source, tokens] = await Promise.all([
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('public/ui/design-tokens.css'), 'utf8'),
  ]);
  for (const state of [':hover', ':active', ':focus-visible', ':disabled', '[aria-busy="true"]']) {
    assert.ok(source.includes(state), `missing button state ${state}`);
  }
  assert.match(source, /\.btn--danger/u);
  assert.match(source, /\.btn--success/u);
  assert.match(tokens, /--color-action-primary-text:\s*#000/u);
  assert.match(source, /\.cta,\s*\.btn\s*\{[\s\S]*?color:\s*var\(--color-action-primary-text\)/u);
  assert.match(source, /\.cta:hover,\s*\.btn:hover\s*\{[\s\S]*?color:\s*var\(--color-action-primary-text\)/u);
});

test('design-system source files remain reviewable', async () => {
  for (const path of contractFiles) {
    const source = await readFile(file(path), 'utf8');
    assert.ok(source.split('\n').length < 500, `${path} must remain below 500 lines`);
  }
});

test('the presentation exposes evidence tiers and complete component states', async () => {
  const [html, script, styles] = await Promise.all([
    readFile(file('docs/design-system-site/index.html'), 'utf8'),
    readFile(file('docs/design-system-site/site.js'), 'utf8'),
    readFile(file('docs/design-system-site/styles.css'), 'utf8'),
  ]);
  for (const section of [
    'overview', 'foundations', 'brand', 'components', 'data-display',
    'motion', 'patterns', 'accessibility', 'governance', 'implementation',
  ]) assert.match(html, new RegExp(`id=["']${section}["']`, 'u'));
  for (const tier of ['Authoritative', 'Observed', 'Derived']) assert.match(html, new RegExp(tier, 'u'));
  for (const state of ['Default', 'Hover', 'Focus', 'Disabled', 'Loading', 'Error', 'Success']) {
    assert.match(html, new RegExp(state, 'u'));
  }
  assert.match(html, /aria-current/u);
  assert.match(html, /class="rail-close"/u);
  assert.match(html, /role="tabpanel"/u);
  for (const specimen of ['Categorical', 'Sequential', 'Diverging', 'Grayscale']) {
    assert.match(html, new RegExp(specimen, 'iu'));
  }
  assert.match(script, /IntersectionObserver/u);
  assert.match(script, /prefers-reduced-motion/u);
  assert.match(script, /rail\.inert/u);
  assert.match(script, /target\?\.focus/u);
  assert.match(script, /panel\.hidden = !selected/u);
  assert.match(styles, /aria-current='location'/u);
  assert.doesNotMatch(styles, /animation:[^;\n]*infinite/iu);
  assert.match(styles, /grid-template-columns:\s*minmax\(0, 1fr\)/u);
  assert.match(styles, /transform:\s*none !important;\s*transition:\s*none !important/u);
});
