import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const paths = {
  join: new URL('../src/pages/join/index.astro', import.meta.url),
  privacy: new URL('../src/pages/join/privacy.astro', import.meta.url),
  accessibility: new URL('../src/pages/accessibility.astro', import.meta.url),
  standaloneLayout: new URL('../src/layouts/StandalonePublicLayout.astro', import.meta.url),
  form: new URL('../src/components/campaign/WorkingGroupInterestForm.astro', import.meta.url),
  campaignData: new URL('../src/data/working-group-campaign.ts', import.meta.url),
  layout: new URL('../src/layouts/Layout.astro', import.meta.url),
  siteFooter: new URL('../src/components/SiteFooter.astro', import.meta.url),
  homepage: new URL('../src/pages/index.astro', import.meta.url),
  propertyPackPage: new URL('../src/components/property-pack/PropertyPackPage.astro', import.meta.url),
  registration: new URL('../src/scripts/working-group-join.ts', import.meta.url),
  campaignCss: new URL('../src/styles/working-group-campaign.css', import.meta.url),
  campaignResponsiveCss: new URL('../src/styles/working-group-campaign-responsive.css', import.meta.url),
  campaignSectionsCss: new URL('../src/styles/working-group-campaign-sections.css', import.meta.url),
  joinCss: new URL('../src/styles/working-group-join.css', import.meta.url),
  header: new URL('../src/components/Header.astro', import.meta.url),
  baseCss: new URL('../public/ui/design/base.css', import.meta.url),
  memberGuide: new URL('../src/pages/spdtf/working-groups/member-guide/index.astro', import.meta.url),
  gettingStarted: new URL('../src/pages/spdtf/working-groups/member-guide/getting-started.astro', import.meta.url),
  teamsAndDiscussions: new URL('../src/pages/spdtf/working-groups/member-guide/teams-and-discussions.astro', import.meta.url),
  sourceMaterial: new URL('../src/pages/spdtf/working-groups/member-guide/source-material-and-sharepoint.astro', import.meta.url),
  meetingsAndRecords: new URL('../src/pages/spdtf/working-groups/member-guide/meetings-and-records.astro', import.meta.url),
  modelReview: new URL('../src/pages/spdtf/working-groups/member-guide/model-review-and-decisions.astro', import.meta.url),
};

const memberGuidePaths = [
  paths.memberGuide,
  paths.gettingStarted,
  paths.teamsAndDiscussions,
  paths.sourceMaterial,
  paths.meetingsAndRecords,
  paths.modelReview,
];

const expectedGroups = [
  'finance-and-banking',
  'conveyancing',
  'estate-agency',
  'surveying-and-valuation',
  'property-data-services',
  'property-technology',
];

const expectedContributions = [
  'share-source-material',
  'explain-domain-language-and-rules',
  'review-model-candidates',
  'test-schemas-and-integrations',
  'represent-commercial-interests',
  'represent-public-interests',
];

function extractObjectValues(source, constantName) {
  const block = source.match(new RegExp(`export const ${constantName}:[^=]+ = \\[([\\s\\S]*?)\\n\\];`, 'u'))?.[1];
  assert.ok(block, `Expected ${constantName} object allowlist`);
  return [...block.matchAll(/^\s*value:\s*['"]([^'"]+)['"],/gmu)].map((match) => match[1]);
}

function extractSetValues(source, constantName) {
  const block = source.match(new RegExp(`const ${constantName} = new Set\\(\\[([\\s\\S]*?)\\n\\]\\);`, 'u'))?.[1];
  assert.ok(block, `Expected ${constantName} set allowlist`);
  return [...block.matchAll(/^\s*['"]([^'"]+)['"],?$/gmu)].map((match) => match[1]);
}

test('public sign-up form exposes only the accepted working-group and contribution values', async () => {
  const [form, data] = await Promise.all([
    readFile(paths.form, 'utf8'),
    readFile(paths.campaignData, 'utf8'),
  ]);
  assert.deepEqual(extractObjectValues(data, 'workingGroupContexts'), expectedGroups);
  assert.deepEqual(extractObjectValues(data, 'contributionOptions'), expectedContributions);
  assert.doesNotMatch(form, /not-sure|Not sure|help me choose|data-exclusive/u);
  assert.match(form, /<label for="email">Organisational email address <span class="wg-required">\*<\/span><\/label>/u);
  assert.doesNotMatch(form, /type=["'](?:file|tel|url)["']/u);
  assert.doesNotMatch(form, /name=["'](?:address|phone|socialProfile|evidence|materialInterest)["']/u);
  assert.doesNotMatch(form, /Turnstile|turnstile|cf-turnstile|PUBLIC_TURNSTILE/u);
  assert.match(form, /name="website"/u);
  assert.match(form, /name="startedAt"/u);
  assert.match(form, /data-privacy-notice-version=\{privacyNoticeVersion\}/u);
});

test('global header promotes the canonical working-group sign-up route', async () => {
  const [header, baseCss] = await Promise.all([
    readFile(paths.header, 'utf8'),
    readFile(paths.baseCss, 'utf8'),
  ]);

  const primaryStart = header.indexOf('<nav class="global-nav"');
  const primaryEnd = header.indexOf('</nav>', primaryStart);
  const utilitiesStart = header.indexOf('<nav class="header-nav"');
  const cta = header.indexOf('class="header-cta"');
  assert.ok(primaryStart >= 0 && cta > primaryStart && cta < primaryEnd);
  assert.ok(primaryEnd < utilitiesStart);
  assert.match(header, /const joinHref = currentPath === '\/join' \? '#register' : '\/join'/u);
  assert.match(header, /<a href=\{joinHref\} class="header-cta">Join a working group<\/a>/u);
  assert.match(header, /href="\/search"[\s\S]*?class=\{`header-icon-link\$\{isSearchPage[\s\S]*?aria-label="Search"[\s\S]*?aria-current=\{isSearchPage \? 'page' : undefined\}[\s\S]*?title="Search"[\s\S]*?<svg[\s\S]*?aria-hidden="true"/u);
  assert.match(header, /class="header-icon-link"[\s\S]*?aria-label="GitHub"\s+title="GitHub"[\s\S]*?<svg[\s\S]*?aria-hidden="true"/u);
  assert.doesNotMatch(header, />Search<\/a>|>GitHub<\/a>/u);
  assert.match(baseCss, /\.app-header \.header-nav a\.header-icon-link\s*\{[^}]*width:\s*var\(--target-min\)[^}]*justify-content:\s*center/su);
  assert.match(baseCss, /\.app-header \.global-nav a\.header-cta\s*\{[^}]*justify-content:\s*flex-start[^}]*background:\s*var\(--brand-yellow\)[^}]*color:\s*var\(--brand-ink\)/su);
  assert.match(baseCss, /@media \(max-width: 96rem\)\s*\{[\s\S]*\.app-header \.global-nav-panel \.header-nav\s*\{[^}]*grid-column:\s*1 \/ -1/su);
});

test('public recruitment routes use the standalone shell without Knowledge Base furniture', async () => {
  const [join, privacy, accessibility, standalone, layout, joinCss] = await Promise.all([
    readFile(paths.join, 'utf8'),
    readFile(paths.privacy, 'utf8'),
    readFile(paths.accessibility, 'utf8'),
    readFile(paths.standaloneLayout, 'utf8'),
    readFile(paths.layout, 'utf8'),
    readFile(paths.joinCss, 'utf8'),
  ]);

  for (const source of [join, privacy, accessibility]) {
    assert.match(source, /import StandalonePublicLayout from '@\/layouts\/StandalonePublicLayout\.astro'/u);
    assert.doesNotMatch(source, /import Layout from '@\/layouts\/Layout\.astro'/u);
  }
  assert.match(join, /workingGroupContexts\.map\(\(context\) =>/u);
  assert.doesNotMatch(join, /SemanticConstellation|contextual lenses|skos:/iu);
  assert.match(join, /<WorkingGroupInterestForm/u);
  assert.match(privacy, /bodyClass="working-group-privacy"/u);
  assert.match(accessibility, /bodyClass="accessibility-statement"/u);
  assert.doesNotMatch(standalone, /@\/components\/(?:Header|Sidebar|Breadcrumbs|PageFooter|TOC)/u);
  assert.match(standalone, /<header class="campaign-masthead">/u);
  assert.match(standalone, /<footer class="campaign-footer">/u);
  assert.match(standalone, /href="\/join\/privacy"/u);
  assert.match(standalone, /href="\/accessibility"/u);
  assert.match(layout, /<Header showSidebar=\{showSidebar\}/u);
  assert.match(layout, /<article class=\{proseClass\}>/u);
  assert.doesNotMatch(joinCss, /\.app-main/u);
  assert.match(joinCss, /\.wg-page\s*\{[^}]*width:\s*100%[^}]*margin:\s*0/su);
  assert.doesNotMatch(joinCss, /\.wg-form-shell\s*\{[^}]*(?:color-scheme:\s*light|--color-(?:surface|text|border)):/su);
  assert.match(joinCss, /\.wg-form-shell\s*\{[^}]*background:\s*var\(--color-surface-alt\)/su);
  assert.match(joinCss, /\.wg-form\s*\{[^}]*background:\s*var\(--color-surface\)/su);
});

test('former working-group sign-up paths have no page, redirect or rewrite', async () => {
  for (const retired of [
    '../src/pages/working-groups/join/index.astro',
    '../src/pages/working-groups/join/privacy.astro',
    '../src/pages/spdtf/working-groups/join/index.astro',
    '../src/pages/spdtf/working-groups/join/privacy.astro',
  ]) assert.equal(existsSync(new URL(retired, import.meta.url)), false);
  const [astroConfig, migrations] = await Promise.all([
    readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/site-route-migrations.mjs', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(astroConfig, /(?:spdtf\/)?working-groups\/join/u);
  assert.doesNotMatch(migrations, /(?:spdtf\/)?working-groups\/join|workingGroupJoin/u);
});

test('knowledge-base and standalone page families expose their required footer links', async () => {
  const [footer, layout, standalone, homepage, propertyPackPage] = await Promise.all([
    readFile(paths.siteFooter, 'utf8'),
    readFile(paths.layout, 'utf8'),
    readFile(paths.standaloneLayout, 'utf8'),
    readFile(paths.homepage, 'utf8'),
    readFile(paths.propertyPackPage, 'utf8'),
  ]);

  assert.match(footer, /<footer class="public-footer">/u);
  assert.match(footer, /opda-wordmark-white\.svg/u);
  assert.match(footer, /Property data that people and systems can understand together\./u);
  assert.match(footer, /href="\/accessibility"/u);
  assert.match(footer, /Visit the association website/u);
  for (const owner of [layout, homepage]) {
    assert.match(owner, /import SiteFooter from '@\/components\/SiteFooter\.astro'/u);
    assert.match(owner, /<SiteFooter\s*\/>/u);
  }
  assert.doesNotMatch(homepage, /<footer class="public-footer">/u);
  assert.match(propertyPackPage, /import Layout from '@\/layouts\/Layout\.astro'/u);
  assert.match(standalone, /<footer class="campaign-footer">[\s\S]*href="\/join\/privacy"[\s\S]*href="\/accessibility"/u);
});

test('registration script sends the fixed allowlisted payload to the same-origin endpoint', async () => {
  const [source, form] = await Promise.all([
    readFile(paths.registration, 'utf8'),
    readFile(paths.form, 'utf8'),
  ]);
  assert.deepEqual(extractSetValues(source, 'WORKING_GROUPS'), expectedGroups);
  assert.deepEqual(extractSetValues(source, 'CONTRIBUTIONS'), expectedContributions);
  for (const field of [
    'fullName', 'email', 'organisation', 'role', 'workingGroups', 'contributions',
    'relevantPerspective', 'acknowledgement', 'privacyNoticeVersion',
    'website', 'startedAt',
  ]) {
    assert.match(source, new RegExp(`\\b${field}\\b`, 'u'));
  }
  assert.doesNotMatch(source, /Turnstile|turnstile|cf-turnstile|turnstileToken/u);
  assert.match(source, /fetch\('\/api\/working-group-interest'/u);
  assert.match(source, /privacyNoticeVersion:\s*'2026-08-13'/u);
  assert.match(source, /Date\.now\(\)/u);
  assert.match(source, /document\.addEventListener\('astro:page-load', initWorkingGroupForm\)/u);
  assert.match(form, /method="post"[\s\S]*action="\/api\/working-group-interest"/u);
  assert.match(form, /<noscript>[\s\S]*smartdata@openpropdata\.org\.uk[\s\S]*Do not include confidential, customer, property-transaction\s+or\s+special-category information/u);
  assert.match(form, /<button class="btn" type="submit" disabled>/u);
  assert.match(source, /submitButton\.disabled = false/u);
  assert.match(source, /new AbortController\(\)/u);
  assert.match(source, /signal:\s*controller\.signal/u);
  assert.match(source, /window\.clearTimeout\(timeoutId\)/u);
  assert.match(source, /response\.status !== 201/u);
  assert.match(source, /body\.ok === true[\s\S]*body\.state === 'received'/u);
});

test('campaign recruits industry experts through purpose, influence and clear expectations', async () => {
  const [page, data, form, sectionsCss, responsiveCss] = await Promise.all([
    readFile(paths.join, 'utf8'),
    readFile(paths.campaignData, 'utf8'),
    readFile(paths.form, 'utf8'),
    readFile(paths.campaignSectionsCss, 'utf8'),
    readFile(paths.campaignResponsiveCss, 'utf8'),
  ]);
  const corpus = [page, data, form].join('\n');
  for (const phrase of [
    'Help shape the information',
    'work with.</em>',
    'The direction of travel is clear. The practical detail is still open.',
    'SPDTF is in development',
    'not a government-approved or adopted statutory scheme',
    'professional judgement',
    'Interest is reviewed by people.',
    'Estate Agency',
    'Finance and Banking',
    'Conveyancing',
    'Surveying and Valuation',
    'Property Data Services',
    'Property Technology',
    'commercial reality',
    'Protect the operating reality',
    'Make practice workable',
    'Build for the systems people use',
    'Design in trust and inclusion',
    'Define what matters',
    'Review the proposal',
    'Test a practical result',
    'Represent commercial interests',
    'Explain commercial needs, opportunities, costs and implementation impacts',
    'Represent public interests',
    'Bring consumer, accessibility, regulatory and wider public-interest perspectives',
    'No data-modelling expertise is needed.',
    'AI may assist comparison and drafting; it cannot make a draft official.',
    'expectations before asking you to commit',
  ]) {
    assert.match(corpus, new RegExp(phrase, 'iu'));
  }
  assert.match(corpus, /Data \(Use and\s+Access\) Act 2025/iu);
  assert.match(corpus, /property-specific\s+arrangements remain prospective/iu);
  assert.doesNotMatch(page, /ontology|SKOS|semantic constellation|contextual lenses|common boundary|AI-assisted modelling/iu);
  assert.doesNotMatch(corpus, /Contribute consumer, accessibility, regulatory or public-interest experience|Identify impacts and opportunities|Represent people and the public interest|technical model might otherwise miss|Not sure|help me choose/iu);
  assert.doesNotMatch(page, /data-parallax-layer|data-story-step|data-handoff-stage|data-reveal/u);
  assert.doesNotMatch(sectionsCss, /position:\s*sticky|data-reveal|wg-model-flow|wg-output-ribbon/u);
  assert.match(responsiveCss, /prefers-reduced-motion/u);
  assert.match(page, /data-context-register=\{context\.value\}/u);
  assert.ok(page.indexOf('<WorkingGroupInterestForm') > page.indexOf('class="wg-trust"'));
  assert.doesNotMatch(page, /0[1-4] ·/u);
  assert.doesNotMatch(form, /05 ·/u);
});

test('campaign styles remain split below the project file limit', async () => {
  for (const path of [paths.campaignCss, paths.campaignResponsiveCss, paths.campaignSectionsCss]) {
    const source = await readFile(path, 'utf8');
    assert.ok(source.split('\n').length < 500, `${path.pathname} must remain below 500 lines`);
  }
  const [campaign, sections] = await Promise.all([
    readFile(paths.campaignCss, 'utf8'),
    readFile(paths.campaignSectionsCss, 'utf8'),
  ]);
  assert.doesNotMatch(campaign, /position:\s*sticky/u);
  assert.doesNotMatch(sections, /calc\(50% - 50vw\)|position:\s*sticky/u);
  assert.match(campaign, /\.wg-campaign-hero\s*\{[\s\S]*?min-height:\s*min\(48rem, calc\(100svh - 5rem\)\)/u);
  assert.match(campaign, /\.wg-section\s*\{[\s\S]*?width:\s*min\(100%, var\(--campaign-max\)\)/u);
  assert.doesNotMatch(campaign, /\.wg-btn--large\s*\{[\s\S]*?color:\s*#000/u);
  assert.match(campaign, /\.wg-hero-journey h2\s*\{[\s\S]*?clamp\(2rem, 3\.1vw, 3\.5rem\)/u);
  assert.match(campaign, /\.wg-hero-journey \.wg-process\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/u);
  assert.match(campaign, /\.wg-hero-journey \.wg-process li\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?border:\s*0/u);
  assert.match(sections, /\.wg-participation\s*\{[\s\S]*?background:/u);
  assert.match(sections, /\.wg-trust\s*\{[\s\S]*?background:\s*var\(--brand-deep\)/u);
  assert.match(sections, /\.wg-policy\s*\{[\s\S]*?background:\s*var\(--brand-deep\)/u);
  assert.match(sections, /\.wg-motivation-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4/u);
});

test('form errors are associated with every control and group', async () => {
  const source = await readFile(paths.form, 'utf8');
  for (const [id, description] of [
    ['full-name', 'full-name-error'],
    ['email', 'email-error'],
    ['organisation', 'organisation-error'],
    ['role', 'role-error'],
    ['acknowledgement', 'acknowledgement-error'],
  ]) {
    assert.match(source, new RegExp(`id="${id}"[^>]*aria-describedby="${description}"`, 'u'));
  }
  assert.match(source, /id="relevant-perspective"[^>]*aria-describedby="perspective-hint perspective-count relevant-perspective-error"/u);
  assert.match(source, /data-group="workingGroups"[^>]*aria-describedby="working-groups-hint working-groups-error"/u);
  assert.match(source, /data-group="contributions"[^>]*aria-describedby="contributions-hint contributions-error"/u);
  assert.match(source, /id=\{`working-group-\$\{context\.value\}`\}/u);
  assert.match(source, /id=\{`contribution-\$\{contribution\.value\}`\}/u);
});

test('accessibility statement distinguishes its target from verified conformance', async () => {
  const source = await readFile(paths.accessibility, 'utf8');
  const content = source.replace(/\s+/gu, ' ');
  for (const text of [
    'Web Content Accessibility Guidelines version 2.2 at Level AA',
    'It is not a claim that every covered page currently conforms',
    'have not been independently certified as conformant',
    'not yet completed a full manual or independent accessibility audit',
    'Alternative formats and support',
    'Report a problem',
    'smartdata@openpropdata.org.uk',
  ]) assert.match(content, new RegExp(text, 'u'));
  assert.match(source, /<a href="\/join">\/join<\/a>/u);
  assert.match(source, /<a href="\/join\/privacy">privacy notice<\/a>/u);
});

test('privacy page publishes the current notice and operational boundaries', async () => {
  const source = await readFile(paths.privacy, 'utf8');
  for (const text of [
    'Version 2026-08-13',
    'Effective 13 August 2026',
    'Amazon Web Services',
    'request-rate controls',
    'Microsoft Teams and SharePoint',
    'Expressions of interest that are declined',
    'smartdata@openpropdata.org.uk',
    'not put into the source corpus',
  ]) {
    assert.match(source, new RegExp(text, 'u'));
  }
  assert.doesNotMatch(source, /Cloudflare|Turnstile|turnstile|Postmark|email-verification/u);
});

test('working-group member guide covers the complete participation journey', async () => {
  const [landing, ...children] = await Promise.all(memberGuidePaths.map((path) => readFile(path, 'utf8')));
  for (const slug of [
    'getting-started', 'teams-and-discussions', 'source-material-and-sharepoint',
    'meetings-and-records', 'model-review-and-decisions',
  ]) assert.match(landing, new RegExp(`href=["']\/spdtf\/working-groups\/member-guide\/${slug}["']`, 'u'));

  const corpus = [landing, ...children].join('\n').replace(/\s+/gu, ' ');
  for (const boundary of [
    'expression of interest',
    'does not confer membership',
    'Team roster',
    'private Microsoft Team',
    'thread-first',
    'one clear issue per thread',
    'Team-connected Shared Documents',
    'separate SharePoint source-intake',
    'private organisation folder',
    'company-domain account',
    'generic-provider account',
    'smartdata@openpropdata.org.uk',
    'website comments',
    'not a decision record',
    'Audio and video files are not accepted',
    'Personal, customer or live property-transaction data',
    'approved company-domain identity',
    'live SharePoint membership',
    'at most 50 MiB',
    'Larger or unknown files require manual review',
    'Technology Working Group',
    'Property Technology',
    'Finance and Banking',
    'planned',
    'AI has no decision authority',
    'ADR-0068 remains proposed',
  ]) assert.match(corpus, new RegExp(boundary, 'iu'), `Missing member guidance: ${boundary}`);

  for (const privateOperationalDetail of [
    /teams\.cloud\.microsoft/iu,
    /sharepoint\.com\/sites/iu,
    /groupId=/iu,
    /inviteRedeemUrl/iu,
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/iu,
  ]) assert.doesNotMatch(corpus, privateOperationalDetail);
});

test('member guidance distinguishes implemented infrastructure from modelling authority', async () => {
  const corpus = (await Promise.all(memberGuidePaths.map((path) => readFile(path, 'utf8'))))
    .join('\n').replace(/\s+/gu, ' ');
  assert.match(corpus, /Finance and Banking[^.]*implemented/isu);
  assert.match(corpus, /Technology Working Group[^.]*implemented/isu);
  assert.match(corpus, /Technology Working Group is not a ninth modelling context/iu);
  assert.match(corpus, /other seven[^.]*planned/isu);
  assert.match(corpus, /workspace infrastructure[^.]*does not mean[^.]*convened/isu);
  assert.match(corpus, /ADR-0065 remains proposed/iu);
});
