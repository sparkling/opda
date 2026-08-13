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
};

const expectedGroups = [
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

test('registration script sends the fixed allowlisted payload to the same-origin endpoint', async () => {
  const source = await readFile(paths.registration, 'utf8');
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
  assert.match(script, /requestAnimationFrame/u);
  assert.match(script, /IntersectionObserver/u);
  assert.match(script, /prefers-reduced-motion/u);
  assert.match(script, /typeof card\.animate === 'function'/u);
  assert.match(script, /classList\.add\('has-campaign-js'\)/u);
  assert.doesNotMatch(script, /innerHTML/u);
  assert.doesNotMatch(sectionsCss, /^\[data-reveal\]\s*\{/mu);
  assert.match(sectionsCss, /\.has-campaign-js \[data-reveal\]/u);
  assert.match(responsiveCss, /prefers-reduced-motion/u);
  assert.match(page, /data-parallax-layer/u);
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
