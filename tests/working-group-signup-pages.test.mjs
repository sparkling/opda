import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const paths = {
  join: new URL('../src/pages/working-groups/join/index.astro', import.meta.url),
  privacy: new URL('../src/pages/working-groups/join/privacy.astro', import.meta.url),
  registration: new URL('../src/scripts/working-group-join.ts', import.meta.url),
  campaign: new URL('../src/scripts/working-group-campaign.ts', import.meta.url),
  campaignCss: new URL('../src/styles/working-group-campaign.css', import.meta.url),
  campaignResponsiveCss: new URL('../src/styles/working-group-campaign-responsive.css', import.meta.url),
  campaignSectionsCss: new URL('../src/styles/working-group-campaign-sections.css', import.meta.url),
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
  'not-sure',
];

const expectedContributions = [
  'share-source-material',
  'explain-domain-language-and-rules',
  'review-model-candidates',
  'test-schemas-and-integrations',
  'contribute-consumer-accessibility-regulatory-public-interest-experience',
];

function extractTupleValues(source, constantName) {
  const block = source.match(new RegExp(`const ${constantName} = \\[([\\s\\S]*?)\\n\\] as const;`, 'u'))?.[1];
  assert.ok(block, `Expected ${constantName} tuple allowlist`);
  return [...block.matchAll(/^\s*\[\s*['"]([^'"]+)['"],/gmu)].map((match) => match[1]);
}

function extractSetValues(source, constantName) {
  const block = source.match(new RegExp(`const ${constantName} = new Set\\(\\[([\\s\\S]*?)\\n\\]\\);`, 'u'))?.[1];
  assert.ok(block, `Expected ${constantName} set allowlist`);
  return [...block.matchAll(/^\s*['"]([^'"]+)['"],?$/gmu)].map((match) => match[1]);
}

test('public sign-up form exposes only the accepted working-group and contribution values', async () => {
  const source = await readFile(paths.join, 'utf8');
  assert.deepEqual(extractTupleValues(source, 'contexts'), expectedGroups.slice(0, -1));
  assert.deepEqual(extractTupleValues(source, 'contributions'), expectedContributions);
  assert.match(source, /name="workingGroups" value="not-sure"/u);
  assert.doesNotMatch(source, /type=["'](?:file|tel|url)["']/u);
  assert.doesNotMatch(source, /name=["'](?:address|phone|socialProfile|evidence|materialInterest)["']/u);
  assert.doesNotMatch(source, /Turnstile|turnstile|cf-turnstile|PUBLIC_TURNSTILE/u);
  assert.match(source, /name="website"/u);
  assert.match(source, /name="startedAt"/u);
  assert.match(source, /data-privacy-notice-version=\{privacyNoticeVersion\}/u);
});

test('global header promotes the canonical working-group sign-up route', async () => {
  const [header, baseCss] = await Promise.all([
    readFile(paths.header, 'utf8'),
    readFile(paths.baseCss, 'utf8'),
  ]);

  assert.match(header, /<a href="\/working-groups\/join" class="header-cta">Join a working group<\/a>/u);
  assert.match(header, /<a href="\/search" class="header-icon-link" aria-label="Search" title="Search">[\s\S]*?<svg[\s\S]*?aria-hidden="true"/u);
  assert.match(header, /class="header-icon-link"[\s\S]*?aria-label="GitHub"\s+title="GitHub"[\s\S]*?<svg[\s\S]*?aria-hidden="true"/u);
  assert.doesNotMatch(header, />Search<\/a>|>GitHub<\/a>/u);
  assert.match(baseCss, /\.app-header \.header-nav a\.header-icon-link\s*\{[^}]*width:\s*var\(--target-min\)[^}]*justify-content:\s*center/su);
  assert.match(baseCss, /\.app-header \.header-nav a\.header-cta\s*\{[^}]*background:\s*var\(--brand-yellow\)[^}]*color:\s*var\(--brand-ink\)/su);
  assert.match(baseCss, /@media \(max-width: 96rem\)\s*\{[\s\S]*\.app-header \.global-nav-panel \.header-nav\s*\{[^}]*grid-column:\s*1 \/ -1/su);
});

test('registration script sends the fixed allowlisted payload to the same-origin endpoint', async () => {
  const source = await readFile(paths.registration, 'utf8');
  assert.deepEqual(extractSetValues(source, 'WORKING_GROUPS'), expectedGroups);
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
});

test('campaign story progressively enhances a complete no-JS narrative', async () => {
  const [page, script, sectionsCss, responsiveCss] = await Promise.all([
    readFile(paths.join, 'utf8'),
    readFile(paths.campaign, 'utf8'),
    readFile(paths.campaignSectionsCss, 'utf8'),
    readFile(paths.campaignResponsiveCss, 'utf8'),
  ]);
  for (const phrase of [
    'One property.',
    'Many meanings.',
    'One connected journey.',
    'The problem is in the handoffs',
    'Estate Agency',
    'Finance and Banking',
    'Conveyancing',
    'Surveying and Valuation',
    'Property Data Services',
    'Property Technology',
    'AI-assisted modelling',
    'Human review',
    'You do not need to understand ontologies or adopt AI',
    'People decide;',
    'no candidate becomes official through AI alone',
  ]) {
    assert.match(page, new RegExp(phrase, 'u'));
  }
  assert.doesNotMatch(script, /parallax|requestAnimationFrame/iu);
  assert.match(script, /duration: reducedMotion\.matches \? 0 : 160/u);
  assert.match(script, /IntersectionObserver/u);
  assert.match(script, /prefers-reduced-motion/u);
  assert.match(script, /typeof card\.animate === 'function'/u);
  assert.match(script, /classList\.add\('has-campaign-js'\)/u);
  assert.doesNotMatch(script, /innerHTML/u);
  assert.doesNotMatch(sectionsCss, /^\[data-reveal\]\s*\{/mu);
  assert.match(sectionsCss, /\.has-campaign-js \[data-reveal\]/u);
  assert.match(responsiveCss, /prefers-reduced-motion/u);
  assert.doesNotMatch(page, /data-parallax-layer/u);
  assert.match(page, /data-story-step/u);
});

test('campaign styles remain split below the project file limit', async () => {
  for (const path of [paths.campaignCss, paths.campaignResponsiveCss, paths.campaignSectionsCss]) {
    const source = await readFile(path, 'utf8');
    assert.ok(source.split('\n').length < 500, `${path.pathname} must remain below 500 lines`);
  }
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
