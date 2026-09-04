import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = (path) => readFile(new URL(path, root), 'utf8');
const paletteIds = [
  'kiln', 'tidewater', 'mulberry', 'moss', 'petrol',
  'aubergine', 'pine', 'ledger', 'cherry', 'harbour',
  'clay-indigo', 'amber-violet', 'rosewood', 'copper-ink', 'paprika',
  'heather-walnut', 'denim-chestnut', 'sepia', 'magenta-ink', 'midnight-sienna',
];

const defaultPaletteId = 'petrol';
const iconIds = [
  'twin-frames', 'open-frame', 'common-boundary', 'evidence-relay-first',
  'consent-aperture-first', 'semantic-weave-first', 'parcel-register', 'common-threshold',
  'evidence-relay-second', 'consent-aperture-second', 'semantic-weave-second', 'sixfold-register',
  'party-wall', 'root-of-title', 'quarter-turn', 'aperture-first', 'datum', 'aperture-second',
  'threshold-dual-theme', 'party-wall-altered', 'root-of-title-altered',
  'quarter-turn-altered', 'aperture-altered', 'datum-altered',
];

test('knowledge-base header uses paired OPDA and selectable framework identities', async () => {
  const [header, previewControls, brand, framework, iconRegistry, headerBrand, base] = await Promise.all([
    source('src/components/Header.astro'),
    source('src/components/HeaderPreviewControls.astro'),
    source('src/components/BrandHeading.astro'),
    source('src/components/FrameworkHeading.astro'),
    source('src/lib/header-icons.ts'),
    source('public/ui/design/header-brand.css'),
    source('public/ui/design/base.css'),
  ]);

  assert.match(header, /<BrandHeading scale="mini" variant="paired"\s*\/>/u);
  assert.match(header, /class="app-header__title"[\s\S]*class="app-header__framework-row"[\s\S]*<FrameworkHeading\s*\/>[\s\S]*<div class="app-header__utilities">[\s\S]*class="global-nav-panel"[\s\S]*class="global-nav"[\s\S]*<HeaderPreviewControls[\s\S]*showScaleControl[\s\S]*identityId="app-header-identity"[\s\S]*initialScale=\{24\}[\s\S]*initialSpaceBelow=\{0\}[\s\S]*showUtilitySpacingControl[\s\S]*\/>/u);
  assert.match(previewControls, /<HeaderIconSelector initialIcon=\{initialIcon\}>[\s\S]*<HeaderTuningSelector[\s\S]*<HeaderPaletteSelector embedded initialPalette=\{initialPalette\} \/>[\s\S]*<HeaderPaletteSelector initialPalette=\{initialPalette\}>[\s\S]*<HeaderTuningSelector[\s\S]*<HeaderIconSelector embedded initialIcon=\{initialIcon\} \/>/u);
  assert.doesNotMatch(header, /app-header__identity/u);
  assert.match(brand, /variant\?: 'document' \| 'paired'/u);
  assert.match(brand, /Open Property Data Association/u);
  assert.match(framework, /Smart Property Data Trust Framework/u);
  assert.match(framework, /scale\?: 'header' \| 'display'/u);
  assert.match(framework, /framework-heading--display/u);
  assert.doesNotMatch(framework, /Smart Property Data &amp; Trust Framework/u);
  assert.match(framework, /HEADER_ICONS\.map/u);
  assert.match(iconRegistry, /number: '24'/u);
  const iconMetrics = [...iconRegistry.matchAll(/viewBox: '0 0 (\d+) (\d+)', visibleWidth: (\d+), visibleBottom: (\d+)/gu)]
    .map((match) => ({
      width: Number(match[1]),
      height: Number(match[2]),
      visibleWidth: Number(match[3]),
      visibleBottom: Number(match[4]),
    }));
  assert.equal(iconMetrics.length, 24);
  for (const metric of iconMetrics) {
    assert.equal(metric.width, metric.height, 'archive icons use square source grids');
    assert.ok(metric.visibleWidth > 0 && metric.visibleWidth <= metric.width);
    assert.ok(metric.visibleBottom > 0 && metric.visibleBottom <= metric.height);
    const normalizedVisibleWidth = (metric.width / metric.visibleWidth) * (metric.visibleWidth / metric.width);
    assert.equal(normalizedVisibleWidth, 1);
  }
  assert.match(iconRegistry, /id: 'party-wall'/u);
  assert.match(iconRegistry, /viewBox: '0 0 16 16'/u);
  assert.match(iconRegistry, /d: 'M0 0h7v7H5v9H0Z'/u);
  assert.match(iconRegistry, /d: 'M9 0h7v16H7V9h2Z'/u);
  assert.doesNotMatch(base, /--header-mark-label-gap/u);
  assert.match(headerBrand, /:where\(\.brand-heading--paired, \.framework-heading\)\s*\{[^}]*--heading-mark-label-gap:\s*0\.3em;/su);
  assert.match(headerBrand, /\.brand-heading--paired\s*\{[^}]*display:\s*inline-flex;[^}]*align-items:\s*baseline;[^}]*gap:\s*var\(--heading-mark-label-gap\);/su);
  assert.match(headerBrand, /\.brand-heading--paired \.brand-heading__mark\s*\{[^}]*height:\s*0\.9em;[^}]*background:\s*none;/su);
  assert.match(headerBrand, /@media \(min-width: 60\.0625rem\)\s*\{[\s\S]*?\.app-header \.brand-heading--paired\.brand-heading--mini\s*\{[^}]*font-size:\s*calc\(var\(--identity-heading-size, 24px\) \* var\(--identity-opda-scale, 1\)\);/u);
  assert.match(headerBrand, /\.app-header \.framework-heading\s*\{[^}]*font-size:\s*calc\(var\(--identity-heading-size, 24px\) \* 1\.57\);/su);
  assert.match(headerBrand, /\.framework-heading\s*\{[^}]*display:\s*inline-flex;[^}]*align-items:\s*flex-end;[^}]*gap:\s*var\(--heading-mark-label-gap\);/su);
  assert.match(headerBrand, /\.framework-heading__marks\s*\{[^}]*align-items:\s*flex-end;/su);
  assert.match(headerBrand, /\.framework-heading__mark\s*\{[^}]*width:\s*0\.72em;[^}]*height:\s*0\.72em;[^}]*transform:\s*translateY\(-0\.14em\);/su);
  assert.match(headerBrand, /\.framework-heading--display\s*\{[^}]*font-size:\s*clamp\(var\(--text-3xl\), 4\.5vw, 5rem\);/su);
  assert.match(base, /--identity-line-gap:\s*0px;/u);
  assert.match(base, /grid-template-areas:\s*'title utilities'\s*'\. \.'\s*'framework framework'\s*'navigation navigation';/u);
  assert.match(base, /grid-template-rows:\s*var\(--target-min\)\s*var\(--identity-line-gap\)\s*calc\(\(var\(--identity-heading-size\) \* 1\.57\) \+ var\(--identity-space-after-origin\)\)/u);
  assert.match(base, /\.app-header__framework-row\s*\{[^}]*grid-area:\s*framework;[^}]*align-items:\s*flex-start;[^}]*margin:\s*0;/su);
  assert.match(base, /\.app-header__framework\s*\{[^}]*align-self:\s*flex-start;/su);
  assert.match(headerBrand, /\.app-header \.global-nav > \.header-preview-controls\s*\{[^}]*align-self:\s*center;/su);
  assert.match(base, /\.app-header__title\s*\{[^}]*transform:\s*translateY\(calc\(var\(--identity-space-after-origin\) - var\(--identity-space-after\)\)\);/su);
  assert.match(base, /\.app-header__framework\s*\{[^}]*transform:\s*translateY\(calc\(var\(--identity-space-after-origin\) - var\(--identity-space-after\)\)\);/su);
});

test('medium header collapses navigation without removing the paired identity', async () => {
  const [base, headerBrand] = await Promise.all([
    source('public/ui/design/base.css'),
    source('public/ui/design/header-brand.css'),
  ]);

  assert.match(base, /@media \(max-width: 96rem\)[\s\S]*?\.app-header__framework-row\s*\{\s*display:\s*none;\s*\}/u);
  assert.match(base, /@media \(min-width: 60\.0625rem\) and \(max-width: 96rem\)\s*\{[\s\S]*?:root\s*\{\s*--header-height:\s*7\.5rem;\s*\}/u);
  assert.match(base, /@media \(min-width: 60\.0625rem\) and \(max-width: 96rem\)\s*\{[\s\S]*?\.app-header__inner\s*\{[^}]*display:\s*grid;[^}]*grid-template-areas:\s*'title utilities'\s*'\. \.'\s*'framework framework';/u);
  assert.match(base, /@media \(min-width: 60\.0625rem\) and \(max-width: 96rem\)\s*\{[\s\S]*?\.app-header__framework-row\s*\{\s*display:\s*flex;\s*\}/u);
  assert.match(headerBrand, /@media \(min-width: 60\.0625rem\) and \(max-width: 96rem\)\s*\{\s*\.framework-heading\s*\{[^}]*font-size:\s*clamp\(var\(--text-2xl\), 3vw, 2\.5rem\);/u);
});

test('temporary selectors expose full preview cards and persist palettes and icons', async () => {
  const [selector, iconSelector, identityPreview, previewControls, tuningSelector, home, join, campaign, registry, iconRegistry, layout, client, headerBrandCore, headerBrandPreviews, header, base] = await Promise.all([
    source('src/components/HeaderPaletteSelector.astro'),
    source('src/components/HeaderIconSelector.astro'),
    source('src/components/HeaderIdentityPreview.astro'),
    source('src/components/HeaderPreviewControls.astro'),
    source('src/components/HeaderTuningSelector.astro'),
    source('src/pages/index.astro'),
    source('src/pages/join/index.astro'),
    source('src/styles/working-group-campaign.css'),
    source('src/lib/header-palettes.ts'),
    source('src/lib/header-icons.ts'),
    source('src/layouts/Layout.astro'),
    source('public/ui/client.js'),
    source('public/ui/design/header-brand.css'),
    source('public/ui/design/header-brand-previews.css'),
    source('src/components/Header.astro'),
    source('public/ui/design/base.css'),
  ]);
  const headerBrand = `${headerBrandCore}\n${headerBrandPreviews}`;

  const optionIds = [...registry.matchAll(/\{ id: '([^']+)'/gu)].map((match) => match[1]);
  assert.deepEqual(optionIds, paletteIds);
  assert.match(registry, new RegExp(`DEFAULT_HEADER_PALETTE = '${defaultPaletteId}'`, 'u'));
  assert.match(selector, /import \{[\s\S]*HEADER_PALETTES[\s\S]*\} from '@\/lib\/header-palettes'/u);
  assert.match(selector, /data-header-palette-selector/u);
  assert.match(selector, /data-header-palette-previous/u);
  assert.match(selector, /data-header-palette-next/u);
  assert.match(selector, /const inputName = embedded \? 'header-palette-embedded' : 'header-palette'/u);
  assert.match(selector, /type="radio"[\s\S]*name=\{inputName\}[\s\S]*data-header-palette-input/u);
  assert.match(selector, /checked=\{palette\.id === initialPalette\}/u);
  assert.match(selector, /data-header-palette-current>\{HEADER_PALETTES\.find/u);
  assert.match(selector, /HeaderIdentityPreview/u);
  assert.match(selector, /header-preview-selector__card-preview--light[\s\S]*<HeaderIdentityPreview \/>[\s\S]*header-preview-selector__card-preview--dark[\s\S]*<HeaderIdentityPreview \/>/u);
  assert.match(identityPreview, /<BrandHeading scale="mini" variant="paired" \/>/u);
  assert.match(identityPreview, /<FrameworkHeading \/>/u);
  assert.doesNotMatch(identityPreview, /FrameworkMark|HEADER_ICONS/u);
  assert.match(selector, /header-preview-selector__card/u);
  assert.match(selector, /const pageSize = 4/u);
  assert.match(selector, /data-header-palette-page=\{Math\.floor\(index \/ pageSize\) \+ 1\}/u);
  assert.match(selector, /data-header-palette-pagination/u);
  assert.match(iconSelector, /data-header-icon-selector/u);
  assert.match(iconSelector, /data-header-icon-previous/u);
  assert.match(iconSelector, /data-header-icon-next/u);
  assert.match(iconSelector, /HeaderIconPreview/u);
  assert.match(iconSelector, /const inputName = embedded \? 'header-icon-embedded' : 'header-icon'/u);
  assert.match(iconSelector, /Astro\.slots\.has\('companion'\)/u);
  assert.doesNotMatch(iconSelector, /HeaderIdentityPreview/u);
  assert.match(iconSelector, /name=\{inputName\}/u);
  assert.match(iconSelector, /data-header-icon-input/u);
  assert.match(iconSelector, /checked=\{icon\.id === initialIcon\}/u);
  assert.match(iconSelector, /data-icon-number=\{icon\.number\}/u);
  assert.match(iconSelector, /data-header-icon-current>\{HEADER_ICONS\.find/u);
  assert.match(selector, /Astro\.slots\.has\('companion'\)/u);
  assert.match(header, /import HeaderPreviewControls[^\n]+[\s\S]*<HeaderPreviewControls[\s\S]*showScaleControl[\s\S]*identityId="app-header-identity"[\s\S]*initialScale=\{24\}[\s\S]*initialOpdaScale=\{100\}[\s\S]*initialSpaceAbove=\{0\}[\s\S]*initialLineGap=\{0\}[\s\S]*initialSpaceBelow=\{0\}[\s\S]*initialUtilitySpaceAbove=\{24\}[\s\S]*initialIcon="common-boundary"[\s\S]*initialPalette="clay-indigo"[\s\S]*showUtilitySpacingControl[\s\S]*\/>/u);
  assert.match(previewControls, /data-header-preview-controls data-icon-selection="persistent" hidden[\s\S]*id=\{controlId\}[\s\S]*<HeaderIconSelector initialIcon=\{initialIcon\}>[\s\S]*<HeaderTuningSelector[\s\S]*<HeaderPaletteSelector embedded initialPalette=\{initialPalette\} \/>[\s\S]*<HeaderPaletteSelector initialPalette=\{initialPalette\}>[\s\S]*<HeaderTuningSelector[\s\S]*<HeaderIconSelector embedded initialIcon=\{initialIcon\} \/>[\s\S]*data-header-preview-toggle/u);
  assert.match(home, /<HeaderPreviewControls[\s\S]*showScaleControl[\s\S]*controlId="home-header-preview-selectors"[\s\S]*identityId="home-campaign-identity"/u);
  assert.match(home, /const homeHeaderIcon = 'common-boundary';[\s\S]*const homeHeaderPalette = 'clay-indigo';[\s\S]*const homeHeaderScale = 32;[\s\S]*const homeHeaderOpdaScale = 100;[\s\S]*const homeHeaderSpaceAbove = 59;[\s\S]*const homeHeaderLineGap = 0;[\s\S]*const homeHeaderSpaceBelow = 16;/u);
  assert.match(home, /identityId="home-campaign-identity"[\s\S]*initialScale=\{homeHeaderScale\}[\s\S]*initialOpdaScale=\{homeHeaderOpdaScale\}[\s\S]*initialSpaceAbove=\{homeHeaderSpaceAbove\}[\s\S]*initialLineGap=\{homeHeaderLineGap\}[\s\S]*initialSpaceBelow=\{homeHeaderSpaceBelow\}[\s\S]*initialIcon=\{homeHeaderIcon\}[\s\S]*initialPalette=\{homeHeaderPalette\}/u);
  assert.match(home, /import \{ assetVersion \} from '@\/lib\/asset-version\.mjs';[\s\S]*const clientV = assetVersion\('\/ui\/client\.js'\);[\s\S]*src=\{`\/ui\/client\.js\?v=\$\{clientV\}`\}/u);
  assert.match(join, /import \{ assetVersion \} from '@\/lib\/asset-version\.mjs';[\s\S]*const clientV = assetVersion\('\/ui\/client\.js'\);[\s\S]*src=\{`\/ui\/client\.js\?v=\$\{clientV\}`\}/u);
  assert.doesNotMatch(home, /src="\/ui\/client\.js"/u);
  assert.doesNotMatch(join, /src="\/ui\/client\.js"/u);
  assert.match(previewControls, /<HeaderTuningSelector/u);
  assert.match(tuningSelector, /data-header-tuning-selector/u);
  assert.match(tuningSelector, /Adjust heading layout/u);
  for (const label of ['Size', 'OPDA relative size', 'Space underneath SPDTF', 'Space between SPDTF and OPDA', 'Space above OPDA']) {
    assert.match(tuningSelector, new RegExp(label, 'u'));
  }
  assert.match(tuningSelector, /property: '--identity-heading-size', min: 8, max: 64/u);
  assert.match(tuningSelector, /property: '--identity-opda-scale', min: 25, max: 200/u);
  assert.match(tuningSelector, /property: '--identity-space-after', min: 0, max: 64/u);
  assert.match(tuningSelector, /property: '--identity-line-gap', min: 0, max: 64/u);
  assert.match(tuningSelector, /property: '--identity-space-before', min: 0, max: 96/u);
  assert.match(tuningSelector, /showUtilitySpacingControl \? \[\{ label: 'Space above icon and button row', property: '--header-utilities-space-above', min: 0, max: 96, value: initialUtilitySpaceAbove/u);
  assert.match(base, /\.app-header\s*\{[^}]*--identity-space-before:\s*0px;[^}]*--identity-line-gap:\s*0px;[^}]*--identity-space-after:\s*0px;[^}]*--header-utilities-space-above:\s*24px;/su);
  assert.match(base, /\.app-header__utilities\s*\{[^}]*transform:\s*translateY\(var\(--header-utilities-space-above, 0px\)\);/su);
  assert.match(headerBrand, /\.app-header \.global-nav > \.header-preview-controls\s*\{[^}]*align-self:\s*center;[^}]*margin-inline-start:\s*auto;/su);
  assert.doesNotMatch(base, /\.app-header \.header-preview-controls\s*\{[^}]*header-utilities-space-above/su);
  assert.match(tuningSelector, /data-css-property=\{adjustment\.property\}[\s\S]*data-value-factor=\{adjustment\.factor\}[\s\S]*data-header-preview-range/u);
  assert.match(previewControls, /initialScale = 24/u);
  assert.match(campaign, /\.wg-campaign-identity\s*\{[^}]*--identity-heading-size:\s*24px;/su);
  assert.match(campaign, /\.wg-campaign-identity\s*\{[^}]*--identity-opda-scale:\s*1;/su);
  assert.match(campaign, /\.wg-campaign-identity \.brand-heading--paired\s*\{[^}]*var\(--identity-heading-size\)[^}]*var\(--identity-opda-scale\)/su);
  assert.match(campaign, /\.wg-campaign-identity \.framework-heading--display\s*\{[^}]*calc\(var\(--identity-heading-size\) \* 1\.57\)/su);
  assert.match(campaign, /\.home-campaign-side\s*\{[^}]*display:\s*grid;[^}]*gap:\s*var\(--space-3\);/su);
  assert.match(campaign, /\.home-campaign-side > \.header-preview-controls\s*\{\s*justify-self:\s*end;\s*\}/u);

  const registeredIconIds = [...iconRegistry.matchAll(/\{\s*id: '([^']+)'/gu)].map((match) => match[1]);
  assert.deepEqual(registeredIconIds, iconIds);
  assert.match(iconRegistry, /DEFAULT_HEADER_ICON = 'party-wall'/u);
  assert.match(headerBrand, /\.header-preview-controls\s*\{[^}]*align-self:\s*center;[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*gap:\s*var\(--space-4\);[^}]*margin-inline-start:\s*auto;/su);
  assert.match(headerBrand, /\.header-preview-controls\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*100;/su);
  assert.match(headerBrand, /\.header-preview-selector__flyout\s*\{[^}]*position:\s*absolute;[^}]*z-index:\s*111;[^}]*isolation:\s*isolate;/su);
  assert.match(headerBrand, /\.header-preview-selector__flyout\.header-preview-tuning__flyout\s*\{[^}]*--header-preview-flyout-width:\s*40rem;[^}]*inset:\s*calc\(100% \+ var\(--space-3\)\) auto auto 0;/su);
  assert.match(headerBrand, /\.header-preview-tuning__control\s*\{[^}]*grid-template-columns:\s*minmax\(12rem, 1fr\) 20rem 3ch;/su);
  assert.match(headerBrand, /\.header-preview-tuning__control input\s*\{[^}]*width:\s*20rem;/su);
  assert.doesNotMatch(headerBrand, /\.app-header \.header-preview-tuning__flyout/u);
  assert.match(headerBrand, /\.header-preview-selector__flyout\s*\{[^}]*border:\s*1px solid var\(--color-header-border\);[^}]*border-radius:\s*var\(--radius-lg\);[^}]*padding:\s*var\(--space-3\);[^}]*box-shadow:[^}]*0 0 var\(--space-6\)[^}]*var\(--shadow-md\);/su);
  assert.match(headerBrand, /\.header-preview-selector__flyout fieldset\s*\{[^}]*padding:\s*var\(--space-6\);/su);
  assert.match(headerBrand, /\.header-preview-controls__drawer\s*\{[^}]*max-inline-size:\s*50rem;[^}]*transition:/su);
  assert.match(headerBrand, /\.header-preview-controls\.is-collapsed \.header-preview-controls__drawer\s*\{[^}]*max-inline-size:\s*0;[^}]*overflow:\s*hidden;/su);
  assert.match(headerBrand, /\.header-preview-controls__toggle\s*\{[^}]*width:\s*var\(--target-inline-min\);[^}]*min-height:\s*var\(--target-inline-min\);/su);
  assert.match(headerBrand, /\.header-preview-control\s*\{[^}]*display:\s*inline-flex;/su);
  assert.match(headerBrand, /\.header-preview-control__step\s*\{[^}]*min-height:\s*var\(--target-inline-min\);/su);
  assert.match(headerBrand, /\.header-preview-control\s*\{[^}]*--header-preview-summary-width:\s*12rem;[^}]*--header-preview-flyout-width:\s*42rem;[^}]*--header-preview-columns:\s*2;/su);
  assert.match(headerBrand, /\.header-preview-control--icon\s*\{[^}]*--header-preview-summary-width:\s*7rem;[^}]*--header-preview-flyout-width:\s*max-content;[^}]*--header-preview-columns:\s*4;[^}]*--header-preview-flyout-max-height:\s*none;[^}]*--header-preview-flyout-overflow:\s*visible;/su);
  assert.doesNotMatch(headerBrand, /header-preview-controls--with-scale[^}]*grid-template-columns/su);
  assert.match(headerBrand, /\.header-preview-control--palette\s*\{[^}]*--header-preview-flyout-width:\s*max-content;[^}]*--header-preview-flyout-max-height:\s*none;[^}]*--header-preview-flyout-overflow:\s*visible;/su);
  assert.match(headerBrand, /\.header-preview-selector > summary\s*\{[^}]*inline-size:\s*var\(--header-preview-summary-width\);[^}]*grid-template-columns:\s*auto minmax\(0, 1fr\) auto;/su);
  assert.match(headerBrand, /\.header-preview-selector__flyout\s*\{[^}]*position:\s*absolute;[^}]*width:\s*min\(var\(--header-preview-flyout-width\),/su);
  assert.match(headerBrand, /\.header-preview-control--icon > \.header-preview-selector > \.header-preview-selector__flyout,\s*\.header-preview-control--palette > \.header-preview-selector > \.header-preview-selector__flyout\s*\{[^}]*inset-block-start:\s*calc\(100% \+ var\(--space-3\)\);/su);
  assert.match(headerBrand, /\.header-preview-selector__options\s*\{[^}]*grid-template-columns:\s*repeat\(var\(--header-preview-columns\), minmax\(0, 1fr\)\);/su);
  assert.match(headerBrand, /\.header-preview-selector__card-preview\s*\{[^}]*display:\s*grid;/su);
  assert.match(headerBrand, /\.header-preview-selector__card\[hidden\]\s*\{\s*display:\s*none;\s*\}/u);
  assert.match(headerBrand, /\.header-preview-selector__card-previews\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/su);
  assert.match(headerBrand, /\.header-preview-selector__card\[data-header-palette-option\] > \.header-preview-selector__card-previews > \.header-preview-selector__card-preview--dark\s*\{[^}]*--color-header-opda:\s*var\(--preview-opda-dark\);/su);
  assert.match(headerBrand, /\.header-preview-selector__card\[data-header-palette-option\] > input,\s*\.header-preview-selector__card\[data-header-icon-option\] > input\s*\{[^}]*position:\s*absolute;[^}]*clip:\s*rect\(0 0 0 0\);/su);
  assert.match(headerBrand, /\.header-preview-selector__card\[data-header-palette-option\]:has\(> input:focus-visible\),\s*\.header-preview-selector__card\[data-header-icon-option\]:has\(> input:focus-visible\)\s*\{[^}]*outline:/su);
  assert.match(headerBrand, /\.header-preview-selector__card\[data-header-icon-option\] > input\s*\{[^}]*position:\s*absolute;[^}]*clip:\s*rect\(0 0 0 0\);/su);
  assert.match(headerBrand, /\.header-preview-selector__card\[data-header-icon-option\]:has\(> input:focus-visible\)\s*\{[^}]*outline:/su);
  assert.match(headerBrand, /\.header-preview-selector__card\[data-header-icon-option\]:has\(> input:checked\)\s*\{[^}]*border-color:\s*var\(--brand-yellow\);[^}]*box-shadow:/su);
  assert.match(headerBrand, /\.header-preview-selector__card\[data-header-palette-option\] > \.header-preview-selector__card-previews > \.header-preview-selector__card-preview\s*\{[^}]*--header-identity-card-scale:\s*0\.65;/su);
  assert.doesNotMatch(headerBrand, /\.header-preview-control--palette \.header-preview-selector__card-preview\s*\{/u);
  assert.match(headerBrand, /\.header-identity-preview\s*\{[^}]*gap:\s*calc\(var\(--identity-line-gap, 8px\) \* var\(--header-identity-card-scale, 0\.5\)\);[^}]*padding-block:/su);
  assert.match(headerBrand, /\.header-identity-preview__opda \.brand-heading--paired\.brand-heading--mini,[\s\S]*font-size:\s*calc\(var\(--identity-heading-size, 24px\) \* var\(--identity-opda-scale, 1\) \* var\(--header-identity-card-scale, 0\.5\)\);/u);
  assert.match(headerBrand, /\.header-identity-preview__framework \.framework-heading,[\s\S]*font-size:\s*calc\(var\(--identity-heading-size, 24px\) \* 1\.57 \* var\(--header-identity-card-scale, 0\.5\)\);/u);
  assert.match(headerBrand, /\.header-preview-selector__companion\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*flex-end;[^}]*gap:\s*var\(--space-3\);/su);
  assert.match(headerBrand, /grid-template-columns:\s*repeat\(4, 22rem\);/u);
  assert.match(headerBrand, /grid-template-columns:\s*minmax\(0, min\(84rem, calc\(100vw - \(8 \* var\(--space-6\)\)\)\)\);/u);
  assert.match(headerBrand, /\.header-icon-preview \.framework-mark\s*\{[^}]*width:\s*2\.5rem;[^}]*height:\s*2\.5rem;/su);
  assert.match(headerBrand, /\.header-icon-preview__name\s*\{[^}]*white-space:\s*nowrap;/su);
  assert.match(layout, /localStorage\.getItem\('opda-header-palette'\)/u);
  assert.match(layout, /localStorage\.getItem\('opda-header-icon'\)/u);
  assert.match(layout, /data-header-icon/u);
  assert.match(layout, /if \(!headerPaletteIds\.includes\(p\)\) p = defaultHeaderPalette/u);
  assert.match(client, /function bindHeaderPaletteSelector\(\)/u);
  assert.match(client, /function bindHeaderPalettePagination\(\)/u);
  assert.match(client, /page = \(\(requestedPage - 1 \+ pageCount\) % pageCount\) \+ 1;/u);
  assert.match(client, /previous\.disabled = pageCount <= 1;[\s\S]*next\.disabled = pageCount <= 1;/u);
  assert.match(client, /bindHeaderPalettePagination\(\);/u);
  assert.match(client, /function bindHeaderIconSelector\(\)/u);
  assert.match(client, /function bindHeaderPreviewControls\(\)/u);
  assert.match(client, /function syncHeaderConfigurationMode\(\)[\s\S]*searchParams\.has\('config'\)[\s\S]*controls\.hidden = !configurationEnabled/u);
  assert.match(client, /querySelectorAll\('a\[href\]'\)[\s\S]*destination\.origin !== currentUrl\.origin[\s\S]*destination\.searchParams\.set\('config', configurationValue\)/u);
  assert.match(client, /syncHeaderConfigurationMode\(\);[\s\S]*bindHeaderPaletteSelector\(\);/u);
  assert.match(client, /labelDataKey:\s*'iconNumber'/u);
  assert.match(client, /function bindIdentityHeadingControls\(\)/u);
  assert.match(client, /function syncRenderedHeaderHeight\(\)/u);
  assert.match(client, /new ResizeObserver\(syncRenderedHeaderHeight\)/u);
  assert.match(client, /applicationShell\.style\.setProperty\('--header-height', Math\.ceil\(applicationHeader\.getBoundingClientRect\(\)\.height\) \+ 'px'\)/u);
  assert.match(client, /document\.querySelectorAll\('\[data-header-preview-range\]'\)/u);
  assert.match(client, /candidate\.getAttribute\('aria-controls'\) === identity\.id[\s\S]*candidate\.dataset\.cssProperty === property/u);
  assert.match(client, /Number\(input\.value\) \* factor/u);
  assert.doesNotMatch(client, /placeApplicationHeaderFlyout|header-tuning-flyout-top|header-tuning-flyout-right/u);
  assert.match(client, /output\.textContent = input\.value/u);
  assert.match(client, /drawer\.inert = !expanded/u);
  assert.match(client, /bindHeaderPreviewControls\(\);/u);
  assert.match(client, /function bindHeaderPreviewSelector\(config\)/u);
  assert.match(client, /function closeSelectorChain\(selector\)/u);
  assert.match(client, /if \(config\.closeOnSelect !== false\) closeSelectorChain\(selector\)/u);
  assert.match(client, /if \(config\.closeOnSelect === false\) return;[\s\S]*target\.closest\(config\.optionSelector\)[\s\S]*requestAnimationFrame\(function \(\) \{ closeSelectorChain\(selector\); \}\)/u);
  assert.match(client, /const nextTarget = event\.relatedTarget;[\s\S]*nextTarget instanceof Node && !selector\.contains\(nextTarget\)/u);
  assert.match(client, /document\.addEventListener\('pointerdown'[\s\S]*selector\.open && target instanceof Node && !selector\.contains\(target\)/u);
  assert.doesNotMatch(client, /focusout'[\s\S]{0,120}requestAnimationFrame/u);
  assert.match(client, /inputSelector:\s*'\[data-header-palette-input\]'[\s\S]*closeOnSelect:\s*true/u);
  assert.match(client, /inputSelector:\s*'\[data-header-icon-input\]'[\s\S]*closeOnSelect:\s*false/u);
  assert.match(client, /document\.querySelectorAll\(config\.inputSelector\)/u);
  assert.match(client, /allInputs\.forEach\(function \(input\) \{ input\.checked = input\.value === selectedValue; \}\)/u);
  assert.match(client, /input\.defaultChecked/u);
  assert.match(client, /localStorage\.setItem\('opda-header-palette', palette\)/u);
  assert.match(client, /localStorage\.setItem\('opda-header-icon', icon\)/u);
  const frameworkMark = await source('src/components/FrameworkMark.astro');
  assert.match(frameworkMark, /const opticalWidthScale = viewBoxWidth \/ icon\.visibleWidth/u);
  assert.match(frameworkMark, /const translateY = viewBoxBottom - \(opticalWidthScale \* icon\.visibleBottom\)/u);
  assert.match(frameworkMark, /const artworkTransform = `translate\(\$\{translateX\} \$\{translateY\}\) scale\(\$\{opticalWidthScale\}\)`/u);
  assert.match(frameworkMark, /<g transform=\{artworkTransform\}>/u);
  assert.doesNotMatch(frameworkMark, /--framework-mark-width-scale/u);
});

test('palette tokens preserve the fixed dark OPDA yellow and all Fable colours', async () => {
  const tokens = await source('public/ui/design-tokens.css');
  const requiredColours = [
    '#8f4a10', '#c97a22', '#9e3a1e', '#d98b45', '#ee9270',
    '#7c5c12', '#0b4b47', '#106e68', '#1f8f87', '#5fc5ba',
    '#6e3c2a', '#5a1a3c', '#8e2a57', '#b85a87', '#e58db5',
    '#2f4a14', '#7e9a3a', '#4f7a1e', '#6b8a2f', '#a6c86b',
    '#6b6416', '#12313d', '#1f4a5c', '#4e8aa3', '#8fbdd0',
    '#4e1f55', '#a45fb0', '#712f7c', '#9e5baa', '#d69be0',
    '#573d1c', '#0f4633', '#1d6b4f', '#3fa07e', '#7fd1b0',
    '#1f4f5e', '#4c1119', '#7b2530', '#c0606a', '#f09a97',
    '#6b1f3e', '#a57a2c', '#6f4a10', '#b8965a', '#e2c79a',
    '#0e4f4a', '#123e3a', '#b4531a', '#4e9c8e', '#f6a55a',
    '#24345a', '#a8512a', '#41498c', '#ed9468', '#a9b8f0',
    '#4b2d73', '#8f5e08', '#5b3e8f', '#e9b44c', '#c6a9f0',
    '#6e2639', '#a04a5c', '#3e4e66', '#e896a6', '#b9c7dd',
    '#1c2b45', '#96491e', '#243b63', '#c97b3f', '#9fb6e4',
    '#4a3226', '#a93226', '#5c4433', '#f07b62', '#d9bfa8',
    '#503a28', '#6b5590', '#5c4130', '#bfa8e8', '#d8b08a',
    '#5c3317', '#33518f', '#6b3e1e', '#8fb0f0', '#e0a878',
    '#26334f', '#7a5230', '#4e3a22', '#d9a868', '#e3cda8',
    '#263355', '#8f2260', '#303f6b', '#ef7eb2', '#a5bbea',
    '#6e3a0c', '#3d4b8f', '#2a3562', '#93a3ee', '#c9d2f8',
  ];

  for (const colour of requiredColours) assert.ok(tokens.includes(colour), `missing ${colour}`);
  for (const id of paletteIds.filter((id) => id !== 'tidewater')) {
    assert.match(tokens, new RegExp(`:root\\[data-header-palette='${id}'\\]`, 'u'));
    assert.match(tokens, new RegExp(`\\[data-theme='dark'\\]\\[data-header-palette='${id}'\\]`, 'u'));
  }
  assert.match(tokens, /\[data-theme='dark'\]\s*\{[^}]*--color-header-opda:\s*var\(--brand-yellow\)/su);
  assert.match(tokens, /:root\[data-theme='dark'\]\[data-header-palette\]\s*\{[^}]*--color-header-opda:\s*var\(--brand-yellow\)/su);
  assert.doesNotMatch(tokens, /\[data-theme='dark'\]\[data-header-palette='[^']+'\]\s*\{[^}]*--color-header-opda:/su);
});
