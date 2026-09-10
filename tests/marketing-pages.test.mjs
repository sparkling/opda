import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { marketingPacks, getMarketingPack, employerBrief } from '../src/data/marketing/packs.mjs';
import { workingGroupContexts } from '../src/data/working-group-campaign.ts';
import { GLOBAL_DESTINATIONS, getActiveDestination, getRouteStatus } from '../src/lib/site-ia.mjs';
import { validateSectionNavigation, findNavigationPage } from '../src/lib/site-navigation.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Marketing is a first-class destination with its own route and authority', () => {
  assert.deepEqual(GLOBAL_DESTINATIONS.find(({ key }) => key === 'marketing'), { key: 'marketing', title: 'Marketing', url: '/marketing' });
  for (const path of ['/marketing', '/marketing/share-with-members', '/marketing/packs/general']) {
    assert.equal(getActiveDestination(path), 'marketing');
    assert.match(getRouteStatus(path).authority, /recruitment|communication/i);
    assert.ok(findNavigationPage(path));
  }
  assert.equal(validateSectionNavigation(), true);
});

test('campaign pack IDs agree with the signup choices without merging distinct technology groups', () => {
  assert.deepEqual(marketingPacks.map(({ id }) => id), ['general', ...workingGroupContexts.map(({ value }) => value)]);
  assert.equal(getMarketingPack('finance-and-banking').campaignStatus, 'existing-group');
  assert.equal(marketingPacks.filter(({ campaignStatus }) => campaignStatus === 'current-wave').length, 5);
  assert.equal(getMarketingPack('technology'), undefined);
});

test('emails have distinct sender purposes and a bounded canonical signup destination', () => {
  for (const pack of marketingPacks) {
    assert.match(pack.email.opda.paragraphs.join(' '), /share.*members/i);
    assert.match(pack.email.member.paragraphs.join(' '), /our members/i);
    assert.match(pack.email.member.paragraphs.join(' '), /do not need data-modelling expertise/i);
    assert.match(pack.email.member.paragraphs.join(' '), /expression of interest/i);
    const url = new URL(pack.signupUrl);
    assert.equal(url.origin, 'https://opda.org.uk');
    assert.equal(url.pathname, '/join');
    assert.equal(url.searchParams.get('context'), pack.id === 'general' ? null : pack.id);
    for (const message of Object.values(pack.email)) {
      assert.doesNotMatch(message.subject, /[\r\n]/);
      assert.doesNotMatch(JSON.stringify(message), /\{\{|\[Name\]|henrik@|inviteRedeemUrl|sharepoint\.com|teams\.microsoft/i);
    }
  }
});

test('OPDA and organisations have independent complete LinkedIn sequences', () => {
  for (const pack of marketingPacks) {
    assert.notEqual(pack.linkedin.opda.copy, pack.linkedin.partner.copy);
    for (const role of ['opda', 'partner']) {
      assert.equal(pack.linkedin[role].posts.length, 3);
      for (const post of pack.linkedin[role].posts) {
        assert.ok(post.copy.includes(pack.signupUrl));
        assert.match(post.copy, /OPDA review|OPDA reviews/);
        assert.match(post.copy, /not automatic|not automatically/);
      }
    }
    assert.match(pack.newsletter.short, /OPDA review/);
    assert.match(pack.deck.slides.at(-1).body, /OPDA review/);
  }
  assert.match(employerBrief.paragraphs.join(' '), /authorise|authorised/);
});

test('Marketing pages reuse the site shell and static content, with no campaign sending integration', () => {
  for (const path of ['src/pages/marketing/index.astro', 'src/pages/marketing/[task].astro', 'src/pages/marketing/packs/[id].astro']) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
  }
  const layout = read('src/layouts/MarketingLayout.astro');
  assert.match(layout, /Layout\.astro/);
  assert.doesNotMatch(layout, /hideSidebar/);
  for (const path of ['src/pages/marketing/[task].astro', 'src/pages/marketing/packs/[id].astro']) {
    assert.match(read(path), /renderEmailPlain/);
    assert.doesNotMatch(read(path), /const messageText/);
  }
  assert.match(read('src/pages/marketing/packs/[id].astro'), /sandbox="allow-same-origin"/);
  assert.doesNotMatch(read('src/pages/marketing/packs/[id].astro'), /allow-scripts/);
  const script = read('src/scripts/marketing.ts');
  assert.doesNotMatch(script, /postmark|hubspot|fetch\(|requestAnimationFrame|setInterval/i);
  assert.match(script, /clipboard/);
  assert.match(script, /astro:before-swap/);
  assert.match(script, /astro:page-load/);
});
