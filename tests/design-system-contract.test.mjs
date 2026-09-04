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

test('every Astro page belongs to an explicit visual route family', async () => {
  const routes = await filesWithExtension('src/pages', '.astro');
  const standalone = new Set([
    'src/pages/index.astro',
    'src/pages/presentation/working-group-kickoff.astro',
  ]);
  for (const path of routes) {
    const source = await readFile(file(path), 'utf8');
    const owned = source.includes("@/layouts/Layout.astro")
      || source.includes("@/layouts/StandalonePublicLayout.astro")
      || source.includes("@/components/property-pack/PropertyPackPage.astro")
      || standalone.has(path);
    assert.ok(owned, `${path} has no declared visual route-family owner`);
  }
});

test('reader pages delegate local contents navigation to the shared right rail', async () => {
  const sources = await filesWithExtension('src', '.astro');
  for (const path of sources) {
    const source = await readFile(file(path), 'utf8');
    assert.doesNotMatch(source, /On this page|PropertyPackContents/u, `${path} duplicates the shared page navigation`);
  }

  const client = await readFile(file('public/ui/client.js'), 'utf8');
  assert.match(client, /toc\.setAttribute\('aria-label', 'On this page'\)/u);
  assert.match(client, /article\.querySelectorAll\('h2\[id\], h3\[id\], h4\[id\]'\)/u);
  assert.doesNotMatch(client, /heading\.id =/u);
  assert.match(client, /targetList\.appendChild\(li\)/u);
});

test('documentation flow has one direct-child spacing owner', async () => {
  const [contract, content, propertyPack, designSystem, adr] = await Promise.all([
    readFile(file('DESIGN.md'), 'utf8'),
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('src/styles/property-pack.css'), 'utf8'),
    readFile(file('src/pages/design-system.astro'), 'utf8'),
    readFile(file('docs/adr/ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md'), 'utf8'),
  ]);
  assert.match(contract, /Documentation flow has one owner/u);
  assert.match(adr, /documentation rhythm became a direct-child flow contract/u);
  assert.match(designSystem, /<h2 id="document-flow">Document flow<\/h2>/u);
  assert.match(content, /#main-content \.prose:not\(\.odr-detail\) > \* \{ margin-block:\s*0; \}/u);
  assert.match(content, /#main-content \.prose:not\(\.odr-detail\) > \* \+ \* \{ margin-block-start:\s*var\(--space-4\); \}/u);
  assert.match(content, /#main-content \.prose:not\(\.odr-detail\) > h1:first-of-type \{ margin-block-start:\s*0; \}/u);
  assert.match(content, /#main-content \.prose:not\(\.odr-detail\) > h2\s*\{[\s\S]*?margin-block-start:\s*var\(--space-6\)/u);
  assert.match(propertyPack, /#main-content \.prose \.v2-doc > \* \{ margin-block:\s*0; \}/u);
  assert.match(propertyPack, /#main-content \.prose \.v2-doc > \* \+ \* \{ margin-block-start:\s*var\(--space-4\); \}/u);
  assert.match(propertyPack, /#main-content \.prose \.v2-doc > section > \* \{ margin-block:\s*0; \}/u);
  assert.match(propertyPack, /#main-content \.prose \.v2-doc > section > \* \+ \* \{ margin-block-start:\s*var\(--space-4\); \}/u);
});

test('breadcrumbs use the documented linked-ancestor navigation role', async () => {
  const [contract, navigation, breadcrumb, propertyPack, propertyPackPage, layout, shell, tokens] = await Promise.all([
    readFile(file('DESIGN.md'), 'utf8'),
    readFile(file('public/ui/design/navigation.css'), 'utf8'),
    readFile(file('src/components/Breadcrumbs.astro'), 'utf8'),
    readFile(file('src/styles/property-pack.css'), 'utf8'),
    readFile(file('src/components/property-pack/PropertyPackPage.astro'), 'utf8'),
    readFile(file('src/layouts/Layout.astro'), 'utf8'),
    readFile(file('public/ui/design/shell.css'), 'utf8'),
    readFile(file('public/ui/design-tokens.css'), 'utf8'),
  ]);
  assert.match(contract, /Breadcrumbs:[\s\S]*base 16px role with a 24px line-height/u);
  assert.match(contract, /shared 32px compact inline-navigation target/u);
  assert.match(tokens, /--target-inline-min:\s*2rem/u);
  assert.match(navigation, /\.breadcrumbs\s*\{[^}]*font:\s*500 var\(--text-base\) \/ 1\.5 var\(--font-sans\)/su);
  assert.match(navigation, /\.breadcrumbs\s*\{[^}]*padding-block:\s*0/su);
  assert.match(breadcrumb, /const ancestors = breadcrumbs\.slice\(0, -1\)/u);
  assert.doesNotMatch(breadcrumb, /label:\s*destination\.title/u);
  assert.match(breadcrumb, /overviewParentsDestinationChildren/u);
  assert.doesNotMatch(breadcrumb, /breadcrumb-current|aria-current="page"/u);
  assert.match(breadcrumb, /class="breadcrumb-sep"[\s\S]*aria-hidden="true"/u);
  assert.match(navigation, /\.breadcrumbs__list > li\s*\{[^}]*align-items:\s*flex-end;/su);
  assert.match(navigation, /\.breadcrumbs__list\s*\{[^}]*align-items:\s*flex-end;/su);
  assert.match(navigation, /\.breadcrumb-sep\s*\{[^}]*align-self:\s*flex-end;[^}]*margin-block-end:\s*var\(--space-2\);[^}]*color:\s*var\(--color-link\);/su);
  assert.doesNotMatch(propertyPack, /\.v2-breadcrumbs/u);
  assert.match(layout, /<Breadcrumbs currentPageTitle=\{breadcrumbTitle\} \/>/u);
  assert.match(propertyPackPage, /breadcrumbTitle=\{title\}/u);
  assert.doesNotMatch(propertyPackPage, /hideBreadcrumbs|<nav[^>]+aria-label="Breadcrumb"/u);
  assert.match(navigation, /\.app-main:not\(:has\(> \.breadcrumbs\)\) > \.prose \{ padding-top:\s*0; \}/u);
  assert.match(tokens, /--page-content-start-space:\s*var\(--space-3\)/u);
  assert.match(tokens, /--header-desktop-start-space:\s*var\(--space-6\)/u);
  assert.match(shell, /\.app-main\s*\{[^}]*padding:\s*var\(--page-content-start-space\) var\(--content-gutter\) var\(--space-8\)/su);
  assert.doesNotMatch(navigation, /\.app-main:has\(> \.breadcrumbs\)\s*\{[^}]*padding-top:/su);

  const sources = await filesWithExtension('src', '.astro');
  for (const path of sources.filter((path) => path !== 'src/components/Breadcrumbs.astro')) {
    const source = await readFile(file(path), 'utf8');
    assert.doesNotMatch(
      source,
      /<nav[^>]+aria-label=(["'])[^"']*[Bb]readcrumb[^"']*\1/u,
      `${path} duplicates the shared page breadcrumb`,
    );
  }
});

test('the adopted motion contract excludes parallax and long campaign motion', async () => {
  const paths = [
    'src/pages/join/index.astro',
    'src/scripts/working-group-campaign.ts',
    'src/styles/working-group-campaign.css',
    'src/styles/working-group-campaign-sections.css',
    'src/styles/working-group-campaign-responsive.css',
  ];
  const [source, destinationCards] = await Promise.all([
    Promise.all(paths.map((path) => readFile(file(path), 'utf8'))).then((files) => files.join('\n')),
    readFile(file('src/components/ia/DestinationCards.astro'), 'utf8'),
  ]);
  assert.doesNotMatch(source, /parallax/iu);
  assert.doesNotMatch(source, /(?:transition|duration)[^;\n]*(?:[3-9]\d{2}|\d{4,})ms/iu);
  assert.doesNotMatch(source, /animation:[^;\n]*infinite/iu);
  assert.doesNotMatch(destinationCards, /a\.card:is\(:hover, :focus-visible\)\s*\{[^}]*transform/su);
  assert.match(destinationCards, /a\.card:active\s*\{[^}]*transform/su);
});

test('destination cards use the shared compact card-title scale', async () => {
  const [contract, components, destinationCards] = await Promise.all([
    readFile(file('DESIGN.md'), 'utf8'),
    readFile(file('public/ui/design/components.css'), 'utf8'),
    readFile(file('src/components/ia/DestinationCards.astro'), 'utf8'),
  ]);
  assert.match(contract, /Destination-card titles use the theme-aware interactive violet/u);
  assert.match(components, /\.destination-card-grid \.card h3\s*\{\s*color:\s*var\(--color-link\);\s*font:\s*var\(--h3\);\s*\}/u);
  assert.doesNotMatch(destinationCards, /\.destination-card-grid \.card h3\s*\{[^}]*var\(--h2\)/su);
});

test('shared navigation exposes visible focus, state and 44px targets', async () => {
  const [contentSource, shell, toc, client, header, sidebar, sidebarItem, layout, base, navigation, search, components, tokens, searchPage, searchController, headerBrand, shellSupport] = await Promise.all([
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('public/ui/design/shell.css'), 'utf8'),
    readFile(file('public/ui/design/glossary-toc.css'), 'utf8'),
    readFile(file('public/ui/client.js'), 'utf8'),
    readFile(file('src/components/Header.astro'), 'utf8'),
    readFile(file('src/components/Sidebar.astro'), 'utf8'),
    readFile(file('src/components/SidebarItem.astro'), 'utf8'),
    readFile(file('src/layouts/Layout.astro'), 'utf8'),
    readFile(file('public/ui/design/base.css'), 'utf8'),
    readFile(file('public/ui/design/navigation.css'), 'utf8'),
    readFile(file('src/pages/search.astro'), 'utf8'),
    readFile(file('public/ui/design/components.css'), 'utf8'),
    readFile(file('public/ui/design-tokens.css'), 'utf8'),
    readFile(file('public/ui/design/search-page.css'), 'utf8'),
    readFile(file('src/scripts/site-search-page.ts'), 'utf8'),
    readFile(file('public/ui/design/header-brand.css'), 'utf8'),
    readFile(file('public/ui/design/shell-support.css'), 'utf8'),
  ]);
  assert.match(contentSource, /heading-anchor:focus-visible[^}]*opacity:\s*1/su);
  assert.match(contentSource, /\.heading-anchor\s*\{[^}]*width:\s*var\(--target-min\)[^}]*min-height:\s*var\(--target-min\)/su);
  assert.match(shell, /\.app-sidebar a\s*\{[^}]*min-height:\s*var\(--target-min\)/su);
  assert.match(shell, /\.sidebar-nav\s*\{[^}]*--nav-tree-indent:\s*var\(--space-3\)/su);
  assert.match(shell, /\.sidebar-nav\s*\{[^}]*padding-inline:\s*var\(--space-3\)/su);
  assert.match(tokens, /--color-navigation-parent:\s*color-mix\(in srgb, var\(--color-link\) 38%, var\(--color-text\)\)/u);
  assert.match(tokens, /\[data-theme='dark'\][\s\S]*--color-navigation-parent:\s*color-mix\(in srgb, var\(--color-link\) 68%, var\(--color-text\)\)/u);
  assert.match(shell, /a\.nav-group-link\s*\{[^}]*font:\s*700 var\(--text-sm\) \/ 1\.4 var\(--font-sans\)[^}]*text-transform:\s*none[^}]*border-bottom:\s*1px solid var\(--color-border\)/su);
  assert.match(shell, /a\.nav-group-link\s*\{[^}]*color:\s*var\(--color-navigation-parent\)/su);
  assert.match(shell, /a\.tree-folder-link\s*\{[^}]*color:\s*var\(--color-navigation-parent\)[^}]*font-weight:\s*700/su);
  assert.match(shell, /\.tree-leaf > a\.active,[^}]*\.nav-group-leaf\.active\s*\{[^}]*color:\s*var\(--brand-deep\)/su);
  const lightSidebarActive = shell.match(/^\.app-sidebar a\.active\s*\{([^}]*)\}/mu)?.[1] ?? '';
  assert.doesNotMatch(lightSidebarActive, /font-weight/u);
  const darkSidebarActive = shell.match(/^:root\[data-theme="dark"\] \.app-sidebar a\.active\s*\{([^}]*)\}/mu)?.[1] ?? '';
  assert.doesNotMatch(darkSidebarActive, /font-weight/u);
  assert.match(shell, /\.tree-leaf > a\s*\{[^}]*padding-inline-start:\s*var\(--space-3\)/su);
  assert.match(shell, /\.tree-folder\.is-open > \.tree-children\s*\{[^}]*margin-inline-start:\s*var\(--nav-tree-indent\)/su);
  assert.doesNotMatch(shell, /\.nav-group\.is-open > \.nav-group-items\s*\{[^}]*border-inline-start/su);
  assert.doesNotMatch(shell, /\.tree-folder\.is-open > \.tree-children\s*\{[^}]*border-inline-start/su);
  assert.match(shell, /\.app-sidebar a\s*\{[^}]*overflow-wrap:\s*break-word[^}]*word-break:\s*normal/su);
  assert.match(shell, /\.tree-folder\.is-active-page > \.tree-folder-row\s*\{/u);
  assert.doesNotMatch(sidebar, /nav-group-toggle|nav-group-caret/u);
  assert.doesNotMatch(sidebar, /emphasizeFolders|has-emphasized-folders/u);
  assert.doesNotMatch(sidebarItem, /emphasized|is-task-category/u);
  assert.doesNotMatch(sidebarItem, /tree-toggle|tree-caret|<button|<svg/u);
  assert.doesNotMatch(shell, /nav-group-link::after|content:\s*['"][+\u2212-]['"]/u);
  assert.doesNotMatch(client, /querySelectorAll\('\.tree-toggle'\)|opda\.sidebar\./u);
  assert.doesNotMatch(shell, /\.nav-group\.has-emphasized-folders/u);
  assert.doesNotMatch(shell, /\.tree-children \.tree-children \.tree-leaf/u);
  assert.match(toc, /\.toc a\s*\{[^}]*min-height:\s*var\(--target-min\)/su);
  assert.match(client, /aside\.inert = mobileQuery\.matches && !shouldOpen/u);
  assert.match(client, /aria-current['"], ['"]location/u);
  assert.match(client, /Permalink to/u);
  assert.match(client, /aria-pressed/u);
  assert.match(client, /bindPrimaryNavigation/u);
  assert.match(client, /astro:before-swap[\s\S]*event\.newDocument\.documentElement\.setAttribute/u);
  assert.match(client, /panel\.inert/u);
  assert.match(client, /matchMedia\('\(max-width: 96rem\)'\)/u);
  assert.match(client, /function placeToc/u);
  assert.match(header, /showSidebar &&/u);
  assert.match(header, /app-header--with-sidebar/u);
  assert.match(header, /class="app-header__title[\s\S]*class="app-header__framework-row"[\s\S]*class="app-header__framework"[\s\S]*<div class="app-header__utilities">/u);
  assert.doesNotMatch(header, /app-header__identity/u);
  assert.match(header, /import BrandHeading from '@\/components\/BrandHeading\.astro'/u);
  assert.match(header, /import FrameworkHeading from '@\/components\/FrameworkHeading\.astro'/u);
  assert.match(header, /import \{ GLOBAL_NAVIGATION_ITEMS, getActiveDestination \} from '@\/lib\/site-ia\.mjs'/u);
  assert.match(header, /import HeaderPreviewControls from '@\/components\/HeaderPreviewControls\.astro'/u);
  assert.match(header, /<a href="\/" class="app-header__title">\s*<BrandHeading scale="mini" variant="paired"\s*\/>\s*<\/a>/u);
  assert.match(header, /<div class="app-header__framework-row">[\s\S]*<a href="\/" class="app-header__framework">\s*<FrameworkHeading\s*\/>\s*<\/a>[\s\S]*<HeaderPreviewControls[\s\S]*showScaleControl[\s\S]*identityId="app-header-identity"[\s\S]*initialScale=\{24\}[\s\S]*initialSpaceBelow=\{8\}[\s\S]*\/>/u);
  assert.match(header, /import ThemeToggle from '@\/components\/ThemeToggle\.astro'/u);
  assert.match(header, /<ThemeToggle\s*\/>/u);
  assert.match(header, /class="app-header__utilities"/u);
  assert.match(header, /class="app-header__utilities"[\s\S]*class="header-actions header-action--desktop"[\s\S]*class="header-membership btn btn--ghost btn--compact"[\s\S]*class="header-cta btn btn--compact"[\s\S]*<nav class="header-nav"/u);
  assert.match(header, /class="header-actions header-actions--compact"[\s\S]*class="header-membership btn btn--ghost btn--compact"[\s\S]*class="header-cta btn btn--compact"/u);
  assert.match(header, /<header[^>]*>[\s\S]*<div class="app-header__inner">[\s\S]*class="app-header__title"/u);
  assert.doesNotMatch(header, /brand-cell|brand-wordmark/u);
  assert.match(header, /id="global-nav-toggle"/u);
  assert.match(header, /id="global-nav-panel"/u);
  assert.match(header, /GLOBAL_NAVIGATION_ITEMS\.map/u);
  assert.match(header, /aria-current=\{isSearchPage \? 'page' : undefined\}/u);
  assert.match(sidebar, /aria-label=\{ariaLabel \?\? \(section \? `\$\{section\.title\} section` : label\)\}/u);
  assert.doesNotMatch(sidebar, /sidebar-section-title/u);
  assert.match(sidebar, /rail-collapse-toggle__label">\{label\}<\/span>/u);
  assert.doesNotMatch(sidebar, /id="sidebar-collapse"[^>]*aria-label=/su);
  assert.match(client, /rail-collapse-toggle__label toc-toggle__label">On this page/u);
  assert.match(client, /sectionNavigation\.inert = sidebarRailQuery\.matches &&/u);
  assert.match(client, /ul\.inert = railMode && collapsed/u);
  assert.match(shell, /\.rail-collapse-toggle__label\s*\{[^}]*var\(--font-mono\)[^}]*text-transform:\s*uppercase/su);
  assert.match(shell, /\.app-body\.sidebar-collapsed \.app-sidebar \.rail-collapse-toggle__label\s*\{[^}]*writing-mode:\s*vertical-rl/su);
  assert.match(toc, /\.app-body\.toc-collapsed \.toc \.rail-collapse-toggle__label\s*\{[^}]*writing-mode:\s*vertical-rl/su);
  assert.match(layout, /<Header\s+showSidebar=\{showSidebar\}/u);
  assert.match(layout, /app-body rail-state-restoring/u);
  assert.match(layout, /localStorage\.getItem\('opda-sidebar-collapsed'\)/u);
  assert.match(layout, /localStorage\.getItem\('opda-toc-collapsed'\)/u);
  assert.match(layout, /body\.classList\.remove\('rail-state-restoring'\)/u);
  assert.match(shell, /\.app-body\.rail-state-restoring \.app-sidebar,[\s\S]*transition:\s*none !important;/u);
  assert.match(shell, /\.app-main\s*\{[^}]*var\(--content-gutter\)/su);
  assert.match(shell, /\.app-body\.with-toc,\s*\.app-body\.reserve-toc-rail\s*\{\s*grid-template-columns:\s*var\(--shell-sidebar-track\) minmax\(0, 1fr\) var\(--shell-toc-track\);/u);
  assert.match(shell, /\.app-body\.reserve-toc-rail\s*\{[^}]*max-width:\s*calc\([^)]*var\(--content-max\)[^)]*var\(--shell-sidebar-track\)[^)]*var\(--shell-toc-track\)/su);
  assert.match(shell, /\.app-body\s*\{[^}]*margin-inline:\s*auto;/su);
  assert.doesNotMatch(shell, /\.app-body\.sidebar-collapsed\s*\{[^}]*--shell-sidebar-track:/su);
  assert.doesNotMatch(shell, /\.app-body\.toc-collapsed\s*\{[^}]*--shell-toc-track:/su);
  assert.match(shell, /\.app-body\.sidebar-collapsed \.app-sidebar\s*\{[^}]*width:\s*var\(--target-min\);[^}]*justify-self:\s*end;/su);
  assert.match(toc, /\.app-body\.toc-collapsed \.toc\s*\{[^}]*width:\s*var\(--target-min\);[^}]*justify-self:\s*start;/su);
  assert.match(shell, /\.app-body\.sidebar-collapsed \.sidebar-nav\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateX/su);
  assert.match(toc, /\.toc\.is-collapsed > ul\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateX/su);
  assert.match(shell, /\.app-body\s*\{[^}]*--rail-disclosure-duration:\s*calc\(var\(--duration-slow\) \+ var\(--duration-fast\)\)/su);
  assert.match(shell, /\.app-sidebar\s*\{[^}]*justify-self:\s*end;[^}]*overflow-x:\s*hidden;[^}]*transition:\s*width var\(--rail-disclosure-duration\)/su);
  assert.match(toc, /\.toc\s*\{[^}]*justify-self:\s*start;[^}]*overflow-x:\s*hidden;[^}]*transition:\s*width var\(--rail-disclosure-duration\)/su);
  assert.match(toc, /@media \(max-width: 1280px\)[\s\S]*\.toc\.is-collapsed > ul \{ display: none; \}/u);
  assert.match(shell, /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.app-sidebar,[^}]*\.sidebar-nav/su);
  assert.match(toc, /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.toc,[^}]*\.toc > ul/su);
  assert.doesNotMatch(base, /#app:has\(> \.app-body\.sidebar-collapsed\)/u);
  assert.doesNotMatch(base, /#app:has\(> \.app-body\.with-toc\.toc-collapsed\)/u);
  assert.match(base, /#app:has\(> \.app-body:is\(\.with-toc, \.reserve-toc-rail\)\) \.app-header--with-sidebar\s*\{[^}]*--header-content-right-rail:\s*var\(--toc-width\)/su);
  assert.match(base, /\.app-header\s*\{[^}]*--header-content-left-rail:[^}]*--header-content-right-rail:/su);
  assert.match(tokens, /--sidebar-width:\s*15rem;\s*--toc-width:\s*var\(--sidebar-width\);/u);
  assert.match(navigation, /\.breadcrumbs\s*\{[^}]*max-width:\s*var\(--content-max\)[^}]*margin:\s*0 auto;[^}]*padding-block:\s*0/su);
  assert.match(navigation, /\.app-main\s*\{\s*--page-context-row-height:\s*var\(--target-inline-min\);\s*\}/u);
  assert.match(navigation, /\.breadcrumbs\s*\{[^}]*min-height:\s*var\(--page-context-row-height\)/su);
  assert.match(navigation, /\.app-main:not\(:has\(> \.breadcrumbs\)\) > \.prose\s*\{\s*padding-top:\s*0;\s*\}/u);
  assert.match(navigation, /\.breadcrumbs a,[^}]*\.breadcrumb-current\s*\{[^}]*min-height:\s*var\(--target-inline-min\);[^}]*align-items:\s*flex-end;/su);
  assert.match(base, /@media \(min-width: 96\.0625rem\) \{[\s\S]*?:root \{ --header-height:\s*11rem; \}/u);
  assert.doesNotMatch(toc, /@media[^}]+\.toc\s*\{\s*display:\s*none/su);
  assert.match(base, /@media \(max-width: 96rem\) \{[\s\S]*\.global-nav-toggle \{ display: inline-flex; \}/u);
  assert.match(base, /@media \(max-width: 96rem\) \{[\s\S]*\.global-nav-panel\s*\{[^}]*padding:\s*var\(--space-3\) var\(--content-gutter\)/su);
  assert.match(base, /\.app-header__utilities\s*\{[^}]*grid-area:\s*utilities;/su);
  assert.match(components, /\.brand-heading--mini,\s*\.brand-heading--compact\s*\{[^}]*--brand-heading-mark-size:\s*1\.35em/su);
  assert.match(components, /\.brand-heading--mini\s*\{[^}]*--brand-heading-type:\s*600 var\(--text-xl\) \/ 1 var\(--font-sans\)/su);
  assert.match(components, /\.brand-heading__mark\s*\{[^}]*width:\s*var\(--brand-heading-mark-width\);[^}]*border-radius:\s*var\(--brand-heading-mark-radius\);[^}]*background:\s*var\(--opda-mark-fold\)/su);
  assert.match(components, /\.brand-heading__icon\s*\{[^}]*width:\s*76%;[^}]*height:\s*auto/su);
  assert.doesNotMatch(base, /\.app-header__title\s*\{[^}]*\bfont:/su);
  assert.doesNotMatch(base, /\.app-header__identity/u);
  assert.match(base, /\.app-header__framework-row\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*flex-start;[^}]*margin:\s*0;/su);
  assert.match(base, /\.app-header \.header-actions\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*flex-start;[^}]*gap:\s*var\(--space-4\)/su);
  assert.match(base, /\.app-header\s*\{[^}]*color:\s*var\(--color-header-text\);[^}]*background:\s*var\(--color-header-surface\);/su);
  assert.doesNotMatch(base, /\.app-header__title[^}]*\.brand-heading[^}]*color:/su);
  assert.match(base, /\.global-nav-toggle,[\s\S]*?\.menu-toggle\s*\{[^}]*border:\s*1px solid var\(--color-header-border\);[^}]*color:\s*var\(--color-header-text\);/su);
  assert.match(base, /\.app-header \.global-nav a:not\(\.btn\)\s*\{[^}]*font:\s*600 var\(--text-base\) \/ 1 var\(--font-sans\)/su);
  assert.match(base, /\.app-header__title\s*\{[^}]*width:\s*fit-content;[^}]*align-self:\s*end;[^}]*margin:\s*0;/su);
  assert.doesNotMatch(base, /\.app-header__title\s*\{[^}]*margin[^;]*calc\(-/su);
  assert.match(base, /@media \(max-width: 96rem\)[\s\S]*?\.app-header__title\s*\{[^}]*align-self:\s*center/su);
  assert.match(base, /\.app-header__inner\s*\{[^}]*padding-block:\s*var\(--identity-space-before\) 0;/su);
  assert.match(components, /\.brand-heading\s*\{[^}]*display:\s*inline-flex;[^}]*align-items:\s*flex-end;/su);
  assert.match(base, /\.global-nav-panel\s*\{[^}]*height:\s*calc\(var\(--target-min\) \+ var\(--space-3\)\)/su);
  assert.match(base, /\.app-header__framework\s*\{[^}]*width:\s*fit-content;[^}]*padding:\s*0;[^}]*color:\s*var\(--color-header-framework\);[^}]*text-decoration:\s*none/su);
  assert.match(headerBrand, /\.framework-heading\s*\{[^}]*font:\s*600 var\(--text-4xl\) \/ 1 var\(--font-display\)/su);
  assert.match(base, /\.app-header__inner\s*\{[^}]*max-width:\s*calc\([^}]*var\(--content-max\)[^}]*var\(--header-content-left-rail\)[^}]*var\(--header-content-right-rail\)[^}]*var\(--content-gutter\)[^}]*var\(--content-gutter\)[^}]*padding-inline-start:\s*calc\(var\(--header-content-left-rail\) \+ var\(--content-gutter\)\);[^}]*padding-inline-end:\s*calc\(var\(--header-content-right-rail\) \+ var\(--content-gutter\)\);/su);
  assert.match(base, /\.app-header :is\(\.header-membership, \.header-cta\)\s*\{[^}]*flex:\s*0 0 auto;[^}]*white-space:\s*nowrap;/su);
  assert.match(contentSource, /\.btn--compact\s*\{[^}]*min-height:\s*auto;[^}]*padding-block:\s*8px;[^}]*padding-inline:\s*var\(--space-3\);/su);
  assert.match(base, /@media \(max-width: 96rem\) \{[\s\S]*?\.app-header \.header-action--desktop \{ display:\s*none; \}/u);
  assert.match(base, /@media \(max-width: 96rem\) \{[\s\S]*?\.app-header \.global-nav-panel \.header-actions--compact\s*\{[^}]*display:\s*flex/su);
  assert.match(base, /\.app-header__utilities\s*\{[^}]*position:\s*static;[^}]*inset:\s*auto;[^}]*align-self:\s*end;[^}]*justify-self:\s*end;[^}]*margin-inline-end:\s*0;[^}]*padding-inline-end:\s*0;/su);
  assert.doesNotMatch(base, /\.app-header__utilities\s*\{[^}]*position:\s*absolute/su);
  assert.match(shellSupport, /\.auth-button__user-trigger\s*\{[^}]*padding-block:\s*0\.25rem;[^}]*padding-inline:\s*0\.5rem 0;/su);
  assert.match(base, /\.theme-toggle\s*\{[^}]*display:\s*inline-flex;[^}]*border:\s*0;[^}]*border-radius:\s*0;[^}]*color:\s*var\(--color-header-muted\);[^}]*background:\s*transparent;/su);
  assert.match(base, /\.theme-toggle:hover\s*\{[^}]*color:\s*var\(--color-header-text\);[^}]*background:\s*transparent;/su);
  assert.match(base, /@media \(max-width: 96rem\) \{[\s\S]*?\.app-header__utilities\s*\{[^}]*position:\s*static;[^}]*inset:\s*auto;/u);
  assert.match(base, /\.global-nav-panel\s*\{[^}]*width:\s*100%;/su);
  assert.match(base, /\.app-header \.global-nav > a:first-child\s*\{\s*padding-left:\s*0;/u);
  assert.match(navigation, /\.page-meta\s*\{[^}]*display:\s*none;/su);
  assert.match(shell, /\.app-main\s*\{[^}]*padding:\s*var\(--page-content-start-space\) var\(--content-gutter\) var\(--space-8\)/su);
  assert.match(base, /@media \(min-width: 60\.0625rem\) and \(max-width: 96rem\) \{[\s\S]*\.app-header--with-sidebar \.app-header__inner\s*\{[^}]*padding-inline-start:\s*calc\(var\(--header-content-left-rail\) \+ var\(--content-gutter\)\)/su);
  assert.match(search, /<form[^>]+role="search"/u);
  assert.match(search, /\{SEARCH_TABS\.map\(\(tab, index\) => \([\s\S]*data-search-tab=\{tab\.key\}[\s\S]*aria-pressed=\{String\(index === 0\)\}/u);
  assert.match(search, /\{FACETS\.map\(\(facet\) => \([\s\S]*type="checkbox"[\s\S]*name=\{facet\.param\}/u);
  assert.match(search, /data-search-facet=\{facet\.key\}/u);
  assert.match(search, /<Sidebar slot="sidebar" label="Filters" ariaLabel="Search filters">/u);
  assert.match(search, /form="site-search-form"/u);
  assert.match(search, /data-search-tab-input/u);
  assert.match(search, /site-search__scope/u);
  assert.doesNotMatch(search, /type="radio"|All results|data-search-type-filter|>Show<\/legend>/u);
  assert.match(searchController, /function syncScope\(tabKey: string\)/u);
  assert.match(search, /import '@\/scripts\/site-search-page'/u);
  assert.doesNotMatch(search, /reserveNavigationRail/u);
  assert.match(search, /reserveTableOfContentsRail/u);
  assert.match(search, /<label class="visually-hidden" for="site-search">Search documentation<\/label>/u);
  assert.doesNotMatch(search, /Every published page is indexed|Search terms|Matches titles, identifiers/u);
  assert.doesNotMatch(search, /aria-describedby="site-search-help"|site-search__help/u);
  assert.match(search, /<ol class="site-search-results"/u);
  assert.match(search, /<template data-search-card>/u);
  assert.match(searchController, /import \{ describeRecord, facetCounts, loadSearchIndex, searchEntries \} from '@\/lib\/site-search\.mjs'/u);
  assert.match(searchController, /astro:page-load/u);
  assert.match(searchController, /astro:before-swap/u);
  assert.match(searchController, /new AbortController\(\)/u);
  assert.doesNotMatch(searchController, /dataset\.searchBound/u);
  assert.match(searchController, /history\.replaceState/u);
  assert.match(searchPage, /@media \(min-width: 80rem\) \{[\s\S]*?\.site-search-page \.site-search-results\s*\{[^}]*repeat\(3, minmax\(0, 1fr\)\)/u);
  assert.match(layout, /hasSidebarSlot \? <slot name="sidebar" \/> : <Sidebar \/>/u);
  assert.doesNotMatch(searchPage, /site-search__help/u);
  assert.match(searchPage, /@media \(min-width: 80rem\)/u);
  assert.match(contentSource, /\.prose :is\(ul, ol\):not\(\[class\]\) > li \+ li\s*\{\s*margin-top:\s*var\(--space-2\);\s*\}/u);
});

test('quick search enhances the canonical search route without creating a second index', async () => {
  const [header, dialog, styles, decision, manifest] = await Promise.all([
    readFile(file('src/components/Header.astro'), 'utf8'),
    readFile(file('src/components/SiteSearchDialog.astro'), 'utf8'),
    readFile(file('public/ui/design/search-dialog.css'), 'utf8'),
    readFile(file('docs/adr/ADR-0082-add-a-progressively-enhanced-site-search-dialog.md'), 'utf8'),
    readFile(file('public/ui/design-system.css'), 'utf8'),
  ]);
  assert.match(header, /import SiteSearchDialog from '@\/components\/SiteSearchDialog\.astro'/u);
  assert.match(header, /href="\/search"[^>]*data-site-search-trigger/u);
  assert.match(header, /<SiteSearchDialog\s*\/>/u);
  assert.match(dialog, /<dialog id="site-search-dialog" class="site-search-dialog"/u);
  assert.match(dialog, /aria-label="Search documentation"/u);
  assert.doesNotMatch(dialog, /data-site-search-close|site-search-dialog__header|site-search-dialog-title/u);
  assert.match(dialog, /link\.tabIndex = -1/u);
  assert.match(dialog, /aria-autocomplete="list"/u);
  assert.match(dialog, /trigger\.setAttribute\('aria-haspopup', 'dialog'\)/u);
  assert.match(dialog, /action="\/search" method="get"/u);
  assert.match(dialog, /import\('@\/lib\/site-search\.mjs'\)/u);
  assert.doesNotMatch(dialog, /import\('@\/lib\/site-ia\.mjs'\)/u);
  assert.match(dialog, /searchSite: search\.searchSite/u);
  assert.match(dialog, /describeRecord: search\.describeRecord/u);
  assert.match(dialog, /aria-activedescendant/u);
  assert.match(dialog, /astro:page-load/u);
  assert.match(dialog, /event\.key === '\/'/u);
  assert.match(dialog, /window\.location\.pathname === '\/search'/u);
  assert.match(dialog, /Search couldn't load/u);
  assert.match(styles, /\.site-search-dialog::backdrop\s*\{[^}]*60%/su);
  assert.match(styles, /border-top:\s*4px solid var\(--brand-yellow\)/u);
  assert.match(styles, /@media \(max-width: 40rem\)/u);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/u);
  assert.match(styles, /@media \(forced-colors: active\)/u);
  assert.match(manifest, /\.\/design\/search-dialog\.css\?v=[a-f0-9]{12}/u);
  assert.match(manifest, /\.\/design\/search-page\.css\?v=[a-f0-9]{12}/u);
  assert.match(decision, /progressively enhanced native dialog/u);
});

test('text inherits its outer layout width instead of stacking nested measures', async () => {
  const [
    design,
    content,
    shell,
    shellSupport,
    navigation,
    components,
    publicEntry,
    campaign,
    campaignSections,
    join,
    ontologyGraph,
    presentation,
  ] = await Promise.all([
    readFile(file('DESIGN.md'), 'utf8'),
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('public/ui/design/shell.css'), 'utf8'),
    readFile(file('public/ui/design/shell-support.css'), 'utf8'),
    readFile(file('public/ui/design/navigation.css'), 'utf8'),
    readFile(file('public/ui/design/components.css'), 'utf8'),
    readFile(file('public/ui/design/public.css'), 'utf8'),
    readFile(file('src/styles/working-group-campaign.css'), 'utf8'),
    readFile(file('src/styles/working-group-campaign-sections.css'), 'utf8'),
    readFile(file('src/styles/working-group-join.css'), 'utf8'),
    readFile(file('src/pages/development/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources/graph.astro'), 'utf8'),
    readFile(file('docs/design-system-site/styles.css'), 'utf8'),
  ]);

  assert.match(design, /The outer layout container is the sole owner of content measure/u);
  assert.match(design, /Every documentation\s+article uses the available content track up to a 1600px maximum/u);
  assert.match(content, /\.prose\s*\{[^}]*max-width:\s*var\(--content-max\)/su);
  assert.match(shellSupport, /\.comments-section\s*\{[^}]*max-width:\s*var\(--content-max\)/su);
  assert.match(shellSupport, /\.comments-section\s*\{[^}]*margin:\s*var\(--space-5\) auto 0/su);
  assert.match(content, /\.prose:has\(~ \.comments-section\)\s*\{[^}]*padding-bottom:\s*0/su);
  assert.match(navigation, /\.page-footer\s*\{[^}]*max-width:\s*var\(--content-max\)/su);
  assert.match(navigation, /\.page-footer\s*\{[^}]*border:\s*1px solid var\(--color-border\)/su);
  assert.match(content, /\.prose h2\s*\{[^}]*padding-top:\s*var\(--space-5\)[^}]*border-top:\s*1px solid var\(--color-border\)/su);
  assert.match(navigation, /\.page-footer\s*\{[^}]*--page-footer-gap-before-rule:\s*var\(--space-5\)[^}]*--page-footer-gap-after-rule:\s*var\(--space-5\)/su);
  assert.match(navigation, /\.document-flow[^}]*\{[^}]*--page-footer-gap-before-rule:\s*var\(--space-2\)/su);
  assert.match(navigation, /\.page-footer::before\s*\{[^}]*top:\s*calc\(-1 \* var\(--page-footer-gap-after-rule\)\)[^}]*border-top:\s*1px solid var\(--color-border\)/su);
  assert.match(await readFile(file('src/components/property-pack/PropertyPackPage.astro'), 'utf8'), /class="v2-doc document-flow"/u);
  assert.match(publicEntry, /\.public-footer\s*\{[^}]*font:\s*400 var\(--text-caption\) \/ 1\.4 var\(--font-sans\)/su);

  const contentWithoutOuterMeasures = content
    .replace(/\.prose\s*\{[^}]*\}/su, '');
  const maxWidthDeclaration = /(?:^\s*|[;{]\s*)max-width\s*:/mu;
  assert.doesNotMatch(contentWithoutOuterMeasures, maxWidthDeclaration, 'content descendants must not own a second measure');

  for (const [path, source] of [
    ['public/ui/design/components.css', components],
    ['public/ui/design/public.css', publicEntry],
    ['src/styles/working-group-campaign.css', campaign],
    ['src/styles/working-group-campaign-sections.css', campaignSections],
    ['src/styles/working-group-join.css', join],
    ['src/pages/ontology/graph.astro', ontologyGraph],
  ]) {
    assert.doesNotMatch(source, maxWidthDeclaration, `${path} contains a nested max-width`);
  }
  for (const selector of ['p', '\\.chapter-hero h1', '\\.chapter-hero \\.lede']) {
    assert.doesNotMatch(presentation, new RegExp(`(?:^|\\n)${selector}\\s*\\{[^}]*max-width\\s*:`, 'su'));
  }
});

test('the adversarial conformance blockers remain closed', async () => {
  const [rootPage, brandHeading, themeToggle, base, content, components, navigation, print] = await Promise.all([
    readFile(file('src/pages/index.astro'), 'utf8'),
    readFile(file('src/components/BrandHeading.astro'), 'utf8'),
    readFile(file('src/components/ThemeToggle.astro'), 'utf8'),
    readFile(file('public/ui/design/base.css'), 'utf8'),
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('public/ui/design/components.css'), 'utf8'),
    readFile(file('public/ui/design/navigation.css'), 'utf8'),
    readFile(file('public/ui/design/print.css'), 'utf8'),
  ]);
  assert.doesNotMatch(rootPage, /<html[^>]+data-theme="light"/u);
  assert.match(rootPage, /URLSearchParams\(location\.search\)/u);
  assert.doesNotMatch(rootPage, /class="public-header"/u);
  assert.match(rootPage, /<header class="wg-campaign-hero__header">[\s\S]*<BrandHeading variant="paired"\s*\/>[\s\S]*<FrameworkHeading scale="display"\s*\/>[\s\S]*<ThemeToggle\s*\/>[\s\S]*<\/header>/u);
  assert.match(themeToggle, /id = 'theme-toggle'/u);
  assert.match(rootPage, /:root\[data-theme='light'\][\s\S]+\.home-campaign-hero/u);
  assert.match(rootPage, /data-astro-rerun/u);
  assert.match(rootPage, /localStorage\.getItem\('opda-header-palette'\)/u);
  assert.match(rootPage, /localStorage\.getItem\('opda-header-icon'\)/u);
  assert.match(brandHeading, /brand-heading__mark" aria-hidden="true"[\s\S]*brand-heading__icon[\s\S]*Open Property Data Association/u);
  assert.match(brandHeading, /'display' \| 'mini' \| 'compact'/u);
  assert.match(rootPage, /class="btn btn--outline-dark\b/u);
  assert.match(base, /color:\s*var\(--color-header-muted\)/u);
  assert.doesNotMatch(base, /#d8d5df/iu);
  assert.match(content, /\[data-theme="dark"\]\s+:where\(\.pill\)/u);
  assert.match(components, /home-hero__index strong[^}]+var\(--text-3xl\)/su);
  assert.doesNotMatch(navigation + print, /0\.85em|#666\b/iu);
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
