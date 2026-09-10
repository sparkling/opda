import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const file = (path) => new URL(path, root);

async function filesWithExtension(path, extension) {
  const entries = await readdir(file(path), { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) return filesWithExtension(child, extension);
    return entry.name.endsWith(extension) ? [child] : [];
  }));
  return nested.flat();
}

test('every Astro page belongs to an explicit visual route family', async () => {
  const routes = await filesWithExtension('src/pages', '.astro');
  const standalone = new Set([
    'src/pages/index.astro',
    // Restored self-contained public landing: protected site assets cannot be dependencies.
    'src/pages/under-development.astro',
    'src/pages/presentation/working-group-kickoff.astro',
  ]);
  for (const path of routes) {
    const source = await readFile(file(path), 'utf8');
    if (source.includes('return Astro.redirect(')) {
      assert.match(source, /getModellingRedesignReplacementRoute\(Astro.url.pathname\)/u);
      assert.match(source, /Astro.redirect\(destination \+ Astro.url.search, 301\)/u);
      continue;
    }
    const owned = source.includes("@/layouts/Layout.astro")
      || source.includes("@/layouts/StandalonePublicLayout.astro")
      || source.includes("@/layouts/ModellingLayout.astro")
      || source.includes("@/layouts/MarketingLayout.astro")
      || source.includes("@/layouts/OntologyChapter.astro")
      || source.includes("@/components/property-pack/PropertyPackPage.astro")
      || source.includes("@/components/HeaderPreviewControls.astro")
      || standalone.has(path);
    assert.ok(owned, `${path} has no declared visual route-family owner`);
  }
});

test('the under-development sign-in returns to the homepage through auth', async () => {
  const source = await readFile(file('src/pages/under-development.astro'), 'utf8');
  const href = source.match(/<a class="cs-signin" href="([^"]+)">/u)?.[1];
  assert.equal(href, '/_auth/login?return=%2F');

  const destination = new URL(href, 'https://opda.test');
  assert.equal(destination.pathname, '/_auth/login');
  assert.equal(destination.searchParams.get('return'), '/');
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
  assert.match(adr, /documentation adopted direct-child flow/u);
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
  assert.match(navigation, /\.app-main:not\(:has\(> \.breadcrumbs\)\) > \.prose \{ padding-top:\s*var\(--space-5\); \}/u);
  assert.match(tokens, /--page-content-start-space:\s*var\(--space-3\)/u);
  assert.match(tokens, /--header-desktop-start-space:\s*var\(--space-6\)/u);
  assert.match(shell, /\.app-main\s*\{[^}]*--page-content-inline-padding:\s*calc\(var\(--content-gutter\) \+ var\(--space-2\)\);[^}]*padding:\s*var\(--page-content-start-space\) var\(--page-content-inline-padding\) var\(--space-8\)/su);
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

test('linked cards share a visible theme-aware hover and keyboard focus treatment', async () => {
  const components = await readFile(file('public/ui/design/components.css'), 'utf8');
  const interaction = components.match(/a\.card:is\(:hover, :focus-visible\)\s*\{([^}]*)\}/u)?.[1] ?? '';
  assert.match(interaction, /border-color: var\(--color-link\)/u);
  assert.match(interaction, /background: var\(--color-surface-tint\)/u);
  assert.match(interaction, /box-shadow: var\(--shadow-md\)/u);
  assert.doesNotMatch(interaction, /transform:|(?:width|height|padding|margin):/u);
  assert.match(components, /box-shadow var\(--duration-fast\) var\(--ease\)/u);
  assert.match(components, /a\.card:focus-visible\s*\{[^}]*outline: 3px solid var\(--color-focus\)/u);
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
  assert.match(header, /class="app-header__title[\s\S]*class="app-header__framework-row"[\s\S]*class="app-header__framework"[\s\S]*<div class="app-header__utilities"/u);
  assert.doesNotMatch(header, /app-header__identity/u);
  assert.match(header, /import BrandHeading from '@\/components\/BrandHeading\.astro'/u);
  assert.match(header, /import FrameworkHeading from '@\/components\/FrameworkHeading\.astro'/u);
  assert.match(header, /import \{ GLOBAL_NAVIGATION_ITEMS, getActiveDestination \} from '@\/lib\/site-ia\.mjs'/u);
  assert.doesNotMatch(header, /import HeaderPreviewControls from '@\/components\/HeaderPreviewControls\.astro'/u);
  assert.match(header, /<a href="\/" class="app-header__title">\s*<BrandHeading scale="mini"\s*\/>\s*<\/a>/u);
  assert.match(header, /<div class="global-nav-panel"[\s\S]*<nav class="global-nav"[\s\S]*GLOBAL_NAVIGATION_ITEMS\.map[\s\S]*data-header-preview-controls-loader[\s\S]*data-controls-src="\/ui\/header-preview-controls\/kb"/u);
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
  assert.match(navigation, /\.breadcrumbs\s*\{[^}]*max-width:\s*var\(--content-max\)[^}]*margin:\s*var\(--space-2\) auto 0;[^}]*padding-block:\s*0/su);
  assert.match(navigation, /\.app-main\s*\{\s*--page-context-row-height:\s*var\(--target-inline-min\);\s*\}/u);
  assert.match(navigation, /\.breadcrumbs\s*\{[^}]*min-height:\s*var\(--page-context-row-height\)/su);
  assert.match(navigation, /\.app-main:not\(:has\(> \.breadcrumbs\)\) > \.prose\s*\{\s*padding-top:\s*var\(--space-5\);\s*\}/u);
  assert.match(navigation, /\.breadcrumbs a,[^}]*\.breadcrumb-current\s*\{[^}]*min-height:\s*var\(--target-inline-min\);[^}]*align-items:\s*flex-end;/su);
  assert.match(base, /@media \(min-width: 96\.0625rem\) \{[\s\S]*?:root \{ --header-height:\s*11rem; \}/u);
  assert.doesNotMatch(toc, /@media[^}]+\.toc\s*\{\s*display:\s*none/su);
  assert.match(base, /@media \(max-width: 96rem\) \{[\s\S]*\.global-nav-toggle \{ display: inline-flex; \}/u);
  assert.match(base, /@media \(max-width: 96rem\) \{[\s\S]*\.global-nav-panel\s*\{[^}]*padding:\s*var\(--space-3\) var\(--content-gutter\)/su);
  assert.match(base, /\.app-header__utilities\s*\{[^}]*grid-area:\s*utilities;/su);
  assert.match(base, /\.app-header__title\s*\{[^}]*align-self:\s*end;/su);
  assert.match(base, /\.app-header__utilities\s*\{[^}]*align-self:\s*end;/su);
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
  assert.match(contentSource, /\.btn--compact\s*\{[^}]*min-height:\s*auto;[^}]*padding-block:\s*6px;[^}]*padding-inline:\s*var\(--space-3\);/su);
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
  assert.match(shell, /\.app-main\s*\{[^}]*--page-content-inline-padding:\s*calc\(var\(--content-gutter\) \+ var\(--space-2\)\);[^}]*padding:\s*var\(--page-content-start-space\) var\(--page-content-inline-padding\) var\(--space-8\)/su);
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

test('authored text has one reading measure while evidence and navigation use the layout track', async () => {
  const [design, content, editorial, layout, navigation] = await Promise.all([
    readFile(file('DESIGN.md'), 'utf8'),
    readFile(file('public/ui/design/content.css'), 'utf8'),
    readFile(file('src/styles/editorial-content.css'), 'utf8'),
    readFile(file('src/layouts/Layout.astro'), 'utf8'),
    readFile(file('public/ui/design/navigation.css'), 'utf8'),
  ]);
  assert.match(design, /1024px/u);
  assert.match(content, /\.prose\s*\{[^}]*max-width:\s*var\(--content-max\)/su);
  assert.match(editorial, /--editorial-text-max:\s*64rem;/u);
  const css = editorial.replace(/\/\*[\s\S]*?\*\//gu, '');
  const measureRules = css.match(/[^}]*max-inline-size:[^}]*\}/gu) ?? [];
  assert.equal(measureRules.length, 1, 'one shared rule owns authored text width');
  assert.match(measureRules[0], /h1, h2, h3, h4, p, ul, ol, dl, blockquote, details, \.callout/u);
  assert.doesNotMatch(measureRules[0], /figure|img|table|\.page-footer/u);
  assert.match(editorial, /max-inline-size:\s*min\(100%, var\(--editorial-text-max\)\)/u);
  assert.match(editorial, /text-align:\s*justify;/u);
  assert.match(editorial, /text-align-last:\s*start;/u);
  assert.match(layout, /generatedContent/u);
  assert.match(layout, /editorial-content/u);
  const footer = navigation.match(/^\.page-footer\s*\{([^}]*)\}/mu)?.[1] ?? '';
  assert.match(footer, /width:\s*100%;/u);
  assert.doesNotMatch(footer, /border|background|max-width/u);
  assert.doesNotMatch(navigation, /\.page-footer::before/u);
  assert.match(navigation, /\.page-footer a:focus-visible/u);
  assert.match(navigation, /margin-block-start:\s*var\(--space-6\)/u);
});

test('shared design controls remain hidden unless URL configuration is enabled', async () => {
  const [header, controls, client, css] = await Promise.all([
    readFile(file('src/components/Header.astro'), 'utf8'),
    readFile(file('src/components/HeaderPreviewControls.astro'), 'utf8'),
    readFile(file('public/ui/client.js'), 'utf8'),
    readFile(file('public/ui/design/header-brand.css'), 'utf8'),
  ]);
  assert.match(controls, /data-header-preview-controls[^>]*\bhidden/u);
  assert.match(header, /data-header-preview-controls-loader/u);
  assert.match(client, /async function loadHeaderPreviewControls\(life\)/u);
  assert.match(client, /fetch\(source, \{ credentials: 'same-origin', signal: life\.signal \}\)/u);
  assert.match(client, /loader\.replaceWith\(controls\)/u);
  assert.match(client, /currentUrl\.searchParams\.has\('config'\)/u);
  assert.match(client, /controls\.hidden = !configurationEnabled/u);
  assert.match(css, /\.header-preview-controls\[hidden\]\s*\{\s*display:\s*none\s*!important;/u);
});

test('the open account menu sits above the compact primary navigation', async () => {
  const base = await readFile(file('public/ui/design/base.css'), 'utf8');
  assert.match(base, /\.app-header__utilities:has\(\.auth-button__user-trigger\[aria-expanded='true'\]\)\s*\{\s*z-index:\s*101;/u);
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
  assert.match(rootPage, /import CampaignIdentity from '@\/components\/campaign\/CampaignIdentity\.astro'[\s\S]*<CampaignIdentity identityId="home-campaign-identity" themeToggleId="home-theme-toggle">[\s\S]*slot="controls"[\s\S]*<\/CampaignIdentity>/u);
  assert.match(themeToggle, /id = 'theme-toggle'/u);
  assert.match(rootPage, /import '@\/styles\/working-group-campaign.css'/u);
  const campaign = await readFile(file('src/styles/working-group-campaign.css'), 'utf8');
  assert.match(campaign, /:root\[data-theme='light'\] \.wg-campaign-hero/u);
  assert.match(rootPage, /data-astro-rerun/u);
  assert.match(rootPage, /localStorage\.getItem\('opda-header-palette'\)/u);
  assert.match(rootPage, /localStorage\.getItem\('opda-header-icon'\)/u);
  assert.match(brandHeading, /brand-heading__mark" aria-hidden="true"[\s\S]*brand-heading__icon[\s\S]*Open Property Data Association/u);
  assert.match(brandHeading, /'display' \| 'mini' \| 'compact'/u);
  assert.equal((rootPage.match(/class="btn btn--ghost wg-btn--large"/gu) ?? []).length, 2);
  assert.match(rootPage, /class="btn btn--emphasis wg-btn--large" href="\/join"/u);
  assert.match(base, /color:\s*var\(--color-header-muted\)/u);
  assert.doesNotMatch(base, /#d8d5df/iu);
  assert.match(content, /\[data-theme="dark"\]\s+:where\(\.pill\)/u);
  assert.match(components, /home-hero__index strong[^}]+var\(--text-3xl\)/su);
  assert.doesNotMatch(navigation + print, /0\.85em|#666\b/iu);
});
