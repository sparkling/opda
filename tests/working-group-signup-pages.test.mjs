import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const paths = {
  join: new URL('../src/pages/working-groups/join/index.astro', import.meta.url),
  confirmation: new URL('../src/scripts/working-group-confirm.ts', import.meta.url),
  privacy: new URL('../src/pages/working-groups/join/privacy.astro', import.meta.url),
  registration: new URL('../src/scripts/working-group-join.ts', import.meta.url),
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

test('public sign-up form exposes only the accepted working-group and contribution values', async () => {
  const source = await readFile(paths.join, 'utf8');
  for (const value of [...expectedGroups, ...expectedContributions]) {
    assert.match(source, new RegExp(`['"]${value}['"]`, 'u'));
  }
  assert.doesNotMatch(source, /type=["'](?:file|tel|url)["']/u);
  assert.doesNotMatch(source, /name=["'](?:address|phone|socialProfile|evidence|materialInterest)["']/u);
  assert.match(source, /PUBLIC_TURNSTILE_SITE_KEY/u);
  assert.match(source, /data-action=["']working-group-interest["']/u);
  assert.match(source, /data-privacy-notice-version=\{privacyNoticeVersion\}/u);
});

test('registration script sends the fixed allowlisted payload to the same-origin endpoint', async () => {
  const source = await readFile(paths.registration, 'utf8');
  for (const field of [
    'fullName', 'email', 'organisation', 'role', 'workingGroups', 'contributions',
    'relevantPerspective', 'acknowledgement', 'privacyNoticeVersion', 'turnstileToken',
    'website', 'startedAt',
  ]) {
    assert.match(source, new RegExp(`\\b${field}\\b`, 'u'));
  }
  assert.match(source, /fetch\('\/api\/working-group-interest'/u);
  assert.match(source, /privacyNoticeVersion:\s*'2026-08-12'/u);
  assert.match(source, /Date\.now\(\)/u);
});

test('confirmation strips a fragment token and mutates only after an explicit form submit', async () => {
  const source = await readFile(paths.confirmation, 'utf8');
  assert.match(source, /window\.location\.hash/u);
  assert.match(source, /window\.history\.replaceState/u);
  assert.match(source, /\^\[a-f0-9\]\{64\}\\\./u);
  assert.doesNotMatch(source, /searchParams\.get\(['"]token['"]\)/u);
  assert.match(source, /form\.addEventListener\(['"]submit['"]/u);
  assert.match(source, /fetch\('\/api\/working-group-interest\/confirm'/u);
  assert.match(source, /body:\s*JSON\.stringify\(\{ token \}\)/u);
});

test('privacy page publishes the current notice and operational boundaries', async () => {
  const source = await readFile(paths.privacy, 'utf8');
  for (const text of [
    'Version 2026-08-12',
    'Amazon Web Services',
    'Postmark',
    'Cloudflare Turnstile',
    'Microsoft Teams and SharePoint',
    'Unverified registrations',
    'smartdata@openpropdata.org.uk',
    'not put into the source corpus',
  ]) {
    assert.match(source, new RegExp(text, 'u'));
  }
});
