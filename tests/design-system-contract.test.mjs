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
  'public/ui/design/content.css',
  'public/ui/design/tables.css',
  'public/ui/design/components.css',
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
    '--color-data-1', '--target-min', '--content-reading', '--motion-standard',
    '--color-text-placeholder', '--on-dark-muted', '--text-caption',
  ]) assert.ok(source.includes(token), `missing derived token ${token}`);
  assert.match(source, /Roboto Slab/u);
  assert.match(source, /DM Sans/u);
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

test('live shared surfaces no longer depend on the superseded visual language', async () => {
  const paths = [
    'public/ui/design-tokens.css',
    ...contractFiles.filter((path) => path.startsWith('public/ui/design/')),
    'src/styles/graph-diagram.css',
    'src/lib/diagram-palette.ts',
    'public/ui/graph-engines/_shared.js',
    'public/ui/graph-engines/mermaid.js',
    'public/ui/graph-engines/mermaid-elk.js',
    'src/styles/presentations/workshop-tokens.css',
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
  const shell = await readFile(file('src/scripts/graph-diagram.ts'), 'utf8');
  const renderer = await readFile(file('src/scripts/graph-diagram-mermaid.ts'), 'utf8');
  const styles = await readFile(file('src/styles/graph-diagram.css'), 'utf8');

  assert.match(component, /class="diagram-loading" role="status" aria-live="polite"/u);
  assert.match(component, /class="gd-mermaid" aria-hidden="true"/u);
  assert.match(shell, /class="diagram-loading" role="status" aria-live="polite"/u);
  assert.match(shell, /class="gd-mermaid" aria-hidden="true"/u);
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

test('every Astro page belongs to an explicit visual route family', async () => {
  const routes = await filesWithExtension('src/pages', '.astro');
  const standalone = new Set([
    'src/pages/index.astro',
    'src/pages/presentation/working-group-kickoff.astro',
  ]);
  for (const path of routes) {
    const source = await readFile(file(path), 'utf8');
    const owned = source.includes("@/layouts/Layout.astro")
      || source.includes("@/layouts/PublicWorkingGroupLayout.astro")
      || source.includes("@/components/v2/V2Page.astro")
      || standalone.has(path);
    assert.ok(owned, `${path} has no declared visual route-family owner`);
  }
});

test('the adopted motion contract excludes parallax and long campaign motion', async () => {
  const paths = [
    'src/pages/working-groups/join/index.astro',
    'src/scripts/working-group-campaign.ts',
    'src/styles/working-group-campaign.css',
    'src/styles/working-group-campaign-sections.css',
    'src/styles/working-group-campaign-responsive.css',
  ];
  const source = (await Promise.all(paths.map((path) => readFile(file(path), 'utf8')))).join('\n');
  assert.doesNotMatch(source, /parallax/iu);
  assert.doesNotMatch(source, /(?:transition|duration)[^;\n]*(?:[3-9]\d{2}|\d{4,})ms/iu);
  assert.doesNotMatch(source, /animation:[^;\n]*infinite/iu);
});

test('shared navigation exposes visible focus, state and 44px targets', async () => {
  const [contentSource, shell, toc, client, header, layout, base] = await Promise.all([
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('public/ui/design/shell.css'), 'utf8'),
    readFile(file('public/ui/design/glossary-toc.css'), 'utf8'),
    readFile(file('public/ui/client.js'), 'utf8'),
    readFile(file('src/components/Header.astro'), 'utf8'),
    readFile(file('src/layouts/Layout.astro'), 'utf8'),
    readFile(file('public/ui/design/base.css'), 'utf8'),
  ]);
  assert.match(contentSource, /heading-anchor:focus-visible[^}]*opacity:\s*1/su);
  assert.match(contentSource, /\.heading-anchor\s*\{[^}]*width:\s*var\(--target-min\)[^}]*min-height:\s*var\(--target-min\)/su);
  assert.match(shell, /\.app-sidebar a\s*\{[^}]*min-height:\s*var\(--target-min\)/su);
  assert.match(shell, /\.tree-leaf > a\s*\{[^}]*padding-inline-start:\s*calc\(var\(--target-min\) \+ var\(--space-3\)\)/su);
  assert.match(shell, /\.tree-folder\.is-open > \.tree-children\s*\{[^}]*margin-inline-start:\s*var\(--space-5\)[^}]*border-inline-start:/su);
  assert.match(shell, /\.tree-folder\.is-active-page > \.tree-folder-row\s*\{/u);
  assert.doesNotMatch(shell, /\.tree-children \.tree-children \.tree-leaf/u);
  assert.match(toc, /\.toc a\s*\{[^}]*min-height:\s*var\(--target-min\)/su);
  assert.match(client, /aside\.inert = mobileQuery\.matches && !shouldOpen/u);
  assert.match(client, /aria-current['"], ['"]location/u);
  assert.match(client, /Permalink to/u);
  assert.match(client, /aria-pressed/u);
  assert.match(client, /bindPrimaryNavigation/u);
  assert.match(client, /panel\.inert/u);
  assert.match(client, /matchMedia\('\(max-width: 86rem\)'\)/u);
  assert.match(client, /function placeToc/u);
  assert.match(header, /showSidebar &&/u);
  assert.match(header, /id="global-nav-toggle"/u);
  assert.match(header, /id="global-nav-panel"/u);
  assert.match(layout, /<Header showSidebar=\{showSidebar\}/u);
  assert.doesNotMatch(base, /--header-height:\s*6\.5rem/u);
  assert.doesNotMatch(toc, /@media[^}]+\.toc\s*\{\s*display:\s*none/su);
  assert.match(base, /@media \(max-width: 86rem\) \{[\s\S]*\.global-nav-toggle \{ display: inline-flex; \}/u);
});

test('dense prose tables become labelled keyboard-scrollable regions', async () => {
  const [client, tables] = await Promise.all([
    readFile(file('public/ui/client.js'), 'utf8'),
    readFile(file('public/ui/design/tables.css'), 'utf8'),
  ]);
  assert.match(client, /function enhanceResponsiveTables/u);
  assert.match(client, /responsive-table__viewport/u);
  assert.match(client, /Scroll horizontally to view all columns/u);
  assert.match(client, /setAttribute\('role', 'region'\)/u);
  assert.match(tables, /\.responsive-table__viewport:focus-visible/u);
  assert.match(tables, /\.prose > table/u, 'no-JavaScript containment fallback is required');
});

test('the adversarial conformance blockers remain closed', async () => {
  const [rootPage, homePage, base, content, components, navigation, print] = await Promise.all([
    readFile(file('src/pages/index.astro'), 'utf8'),
    readFile(file('src/pages/home.astro'), 'utf8'),
    readFile(file('public/ui/design/base.css'), 'utf8'),
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('public/ui/design/components.css'), 'utf8'),
    readFile(file('public/ui/design/navigation.css'), 'utf8'),
    readFile(file('public/ui/design/print.css'), 'utf8'),
  ]);
  assert.doesNotMatch(rootPage, /<html[^>]+data-theme="light"/u);
  assert.match(rootPage, /URLSearchParams\(location\.search\)/u);
  assert.match(rootPage, /id="theme-toggle"/u);
  assert.match(rootPage, /class="btn btn--outline-dark"/u);
  assert.match(homePage, /class="btn btn--outline-dark"/u);
  assert.match(base, /color:\s*var\(--on-dark-muted\)/u);
  assert.doesNotMatch(base, /#d8d5df/iu);
  assert.match(content, /\[data-theme="dark"\]\s+:where\(\.pill\)/u);
  assert.match(components, /home-hero__index strong[^}]+var\(--text-3xl\)/su);
  assert.doesNotMatch(navigation + print, /0\.85em|#666\b/iu);
});

test('graph and data tools preserve keyboard and semantic state contracts', async () => {
  const [component, graph, mermaid, graphCss, dataBrowser] = await Promise.all([
    readFile(file('src/components/GraphDiagram.astro'), 'utf8'),
    readFile(file('src/scripts/graph-diagram.ts'), 'utf8'),
    readFile(file('src/scripts/graph-diagram-mermaid.ts'), 'utf8'),
    readFile(file('src/styles/graph-diagram.css'), 'utf8'),
    readFile(file('public/ui/data-browser.js'), 'utf8'),
  ]);
  assert.match(component, /<figure class="graph-diagram-wrapper">/u);
  assert.match(component, /<figcaption class="gd-caption"/u);
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

test('shared buttons expose the adopted interaction and outcome states', async () => {
  const source = await readFile(file('public/ui/design/content.css'), 'utf8');
  for (const state of [':hover', ':active', ':focus-visible', ':disabled', '[aria-busy="true"]']) {
    assert.ok(source.includes(state), `missing button state ${state}`);
  }
  assert.match(source, /\.btn--danger/u);
  assert.match(source, /\.btn--success/u);
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
