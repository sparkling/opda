import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { marketingPacks, getMarketingPack, employerBrief } from '../src/data/marketing/packs.mjs';
import { marketingTasks } from '../src/data/marketing/tasks.mjs';
import { marketingBroadcasters } from '../src/data/marketing/broadcasters.mjs';
import { operationalEmails } from '../src/data/marketing/operational-emails.mjs';
import { workingGroupContexts } from '../src/data/working-group-campaign.ts';
import { GLOBAL_DESTINATIONS, getActiveDestination, getRouteStatus } from '../src/lib/site-ia.mjs';
import { SITE_SEARCH_ENTRIES } from '../src/lib/site-search.mjs';
import {
  SECTION_NAVIGATION,
  findNavigationPage,
  getNavigationPrevNext,
  validateSectionNavigation,
} from '../src/lib/site-navigation.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Marketing is a first-class destination with its own route and authority', () => {
  assert.deepEqual(GLOBAL_DESTINATIONS.find(({ key }) => key === 'marketing'), { key: 'marketing', title: 'Marketing', url: '/marketing' });
  for (const path of ['/marketing', '/marketing/share-with-members', '/marketing/packs', '/marketing/packs/general']) {
    assert.equal(getActiveDestination(path), 'marketing');
    assert.match(getRouteStatus(path).authority, /recruitment|communication/i);
    assert.ok(findNavigationPage(path));
  }
  assert.equal(validateSectionNavigation(), true);
});

test('Marketing navigation separates task, audience and broadcaster without duplicating destinations', () => {
  const marketing = SECTION_NAVIGATION.marketing;
  assert.deepEqual(marketing.groups.map(({ heading, url }) => [heading, url]), [
    ['By task', '/marketing'],
    ['By audience', '/marketing/packs'],
    ['By broadcaster', '/marketing/broadcasters'],
    ['Service emails', '/marketing/operational-emails'],
  ]);
  assert.deepEqual(marketing.groups[0].items, marketingTasks.map(({ id, title }) => ({
    url: `/marketing/${id}`,
    title,
  })));
  assert.deepEqual(marketing.groups[1].items, marketingPacks.map(({ id, label }) => ({
    url: `/marketing/packs/${id}`,
    title: label,
  })));
  assert.deepEqual(marketing.groups[2].items, marketingBroadcasters.map(({ id, title }) => ({
    url: `/marketing/broadcasters/${id}`,
    title,
  })));
  assert.deepEqual(marketing.groups[3].items, operationalEmails.map(({ url, title }) => ({ url, title })));
  assert.ok(findNavigationPage('/marketing/operational-emails'));
  for (const email of operationalEmails) assert.ok(findNavigationPage(email.url));
  for (const broadcaster of marketingBroadcasters) {
    assert.ok(findNavigationPage(`/marketing/broadcasters/${broadcaster.id}`));
    assert.ok(SITE_SEARCH_ENTRIES.some(({ url }) => url === `/marketing/broadcasters/${broadcaster.id}`));
    for (const material of broadcaster.materials) {
      assert.ok(findNavigationPage(material.url.split('#')[0]), material.url);
    }
  }
  assert.deepEqual(findNavigationPage('/marketing/packs/general')?.trail.map(({ url }) => url), [
    '/marketing/packs/general',
  ]);
  assert.equal(getNavigationPrevNext('/marketing/packs').next?.url, '/marketing/packs/general');
  assert.equal(getNavigationPrevNext('/marketing/packs/general').prev?.url, '/marketing/packs');
  assert.equal(getNavigationPrevNext('/marketing/broadcasters').next?.url, '/marketing/broadcasters/opda');
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
  for (const path of ['src/pages/marketing/index.astro', 'src/pages/marketing/[task].astro', 'src/pages/marketing/packs/index.astro', 'src/pages/marketing/packs/[id].astro']) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
  }
  const layout = read('src/layouts/MarketingLayout.astro');
  assert.match(layout, /Layout\.astro/);
  assert.doesNotMatch(layout, /hideSidebar|hideTableOfContents|hideBreadcrumbs|marketing-flow/);
  assert.match(layout, /<slot \/>/);
  for (const path of ['src/pages/marketing/[task].astro', 'src/pages/marketing/packs/[id].astro']) {
    assert.match(read(path), /renderEmailPlain/);
    assert.doesNotMatch(read(path), /const messageText/);
  }
  assert.match(read('src/components/marketing/MarketingPreview.astro'), /sandbox="allow-same-origin allow-top-navigation-by-user-activation"/);
  assert.doesNotMatch(read('src/components/marketing/MarketingPreview.astro'), /allow-scripts/);
  const script = read('src/scripts/marketing.ts');
  assert.doesNotMatch(script, /postmark|hubspot|fetch\(|requestAnimationFrame|setInterval/i);
  assert.match(script, /clipboard/);
  assert.match(script, /astro:before-swap/);
  assert.match(script, /astro:page-load/);
  assert.match(script, /document\.URL === 'about:blank'/u);
  assert.match(script, /Math\.min\(16000, height \+ 8\)/u);
});

test('campaign-pack cards link to pack overviews unless a task opts into a section anchor', () => {
  const grid = read('src/components/marketing/MarketingPackGrid.astro');
  assert.match(grid, /const \{ anchor \} = Astro\.props/u);
  assert.match(grid, /const fragment = anchor \? `#\$\{encodeURIComponent\(anchor\)\}` : '';/u);
  assert.doesNotMatch(grid, /anchor = ['"]member-email['"]/u);
  assert.doesNotMatch(grid, /CampaignThemeImage|<img/iu);

  const landing = read('src/pages/marketing/packs/index.astro');
  assert.match(landing, /<h1>Campaign packs by audience<\/h1>/u);
  assert.match(landing, /<MarketingPackGrid \/>/u);
  assert.doesNotMatch(landing, /CampaignThemeImage|<img/iu);
  assert.ok(SITE_SEARCH_ENTRIES.some(({ url }) => url === '/marketing/packs'));
});

test('rich previews are primary and plain-text copying is an optional disclosure', () => {
  const copy = read('src/components/marketing/MarketingCopy.astro');
  assert.match(copy, /<details class="marketing-plain-text">/);
  assert.match(copy, /View plain text/);
  assert.match(copy, /View plain text<span class="visually-hidden">: \{title\}<\/span>/u);
  assert.match(copy, /Download text<span class="visually-hidden">: \{title\}<\/span>/u);
  assert.match(copy, /aria-label=\{`Copy \$\{title\}`\} title=\{`Copy \$\{title\}`\}/u);
  assert.doesNotMatch(copy, /title\.toLowerCase|class="sr-only"/u);
  assert.doesNotMatch(copy, /<details[^>]+\sopen(?:\s|>|=)/);
  const preview = read('src/components/marketing/MarketingPreview.astro');
  assert.match(preview, /<iframe/);
  assert.match(preview, /loading="lazy"/);
  for (const action of ['Download email with embedded images · EML', 'Download rich HTML', 'Open full preview']) {
    assert.match(preview, new RegExp(`${action}<span class="visually-hidden">: \\{title\\}</span>`, 'u'));
  }
  assert.ok(preview.indexOf('<slot name="actions" />') < preview.indexOf('Download email with embedded images · EML'));
  for (const page of ['src/pages/marketing/[task].astro', 'src/pages/marketing/packs/[id].astro']) {
    const source = read(page);
    assert.match(source, /MarketingPreview/);
    assert.match(source, /\/email\/opda\.html/);
    assert.match(source, /\/email\/personal\.html/);
  }
  assert.match(preview, /<ActionGroup>/);
  const taskPage = read('src/pages/marketing/[task].astro');
  const packPage = read('src/pages/marketing/packs/[id].astro');
  assert.match(taskPage, /preview="\/marketing\/general\/email\/employer\.html"/u);
  assert.match(taskPage, /renderEmailPlain\(supplementalEmail\(pack, 'employer', employerBrief\), 'personal'\)/u);
  assert.match(taskPage, /<MarketingPackGrid anchor="member-email"/u);
  for (const kind of ['short', 'long']) {
    assert.ok(packPage.includes(`/newsletter/${kind}.html`));
    assert.ok(packPage.includes(`text={renderNewsletterPlain(pack, '${kind}')}`));
  }
  for (const page of [taskPage, packPage]) assert.match(page, /<MarketingSocial /u);
  const social = read('src/components/marketing/MarketingSocial.astro');
  assert.match(social, /<MarketingPreview /u);
  assert.match(social, /contribution-infographic\.png/u);
  assert.match(social, /not a LinkedIn editor/u);
});

test('each LinkedIn post owns a labelled rich preview and its own actions', () => {
  const social = read('src/components/marketing/MarketingSocial.astro');
  assert.match(social, /linkedInPostAssets\(pack, voice\.key\)\.map/u);
  assert.match(social, /data-marketing-post/u);
  assert.match(social, /<h4\s+id=/u);
  assert.match(social, /preview=\{html\}/u);
  assert.match(social, /text=\{renderLinkedIn\(pack, voice\.key, post\)\}/u);
  assert.match(social, /textDownload=\{text\}/u);
  assert.match(social, /linkedInImageDescription\(pack, index\)/u);
  assert.match(social, /Suggested image description:/u);
  assert.match(social, /No upload image for this post\./u);
  assert.match(social, /index === 0 && <Button href=\{`\$\{base\}\/images\/social-card\.jpg`\}/u);
  assert.match(social, /Download LinkedIn image · JPEG<span class="visually-hidden">: \{materialTitle\}<\/span>/u);
  assert.match(social, /Download infographic · PNG<span class="visually-hidden">: \{materialTitle\}<\/span>/u);
  assert.doesNotMatch(social, /<MarketingCopy|plainText=\{false\}|-sequence/u);
});

test('Marketing uses shared buttons, cards and editorial flow, not a parallel design system', () => {
  const pages = ['index.astro', '[task].astro', 'packs/index.astro', 'packs/[id].astro', 'broadcasters/index.astro', 'broadcasters/[id].astro'];
  for (const page of pages) {
    const source = read(`src/pages/marketing/${page}`);
    assert.doesNotMatch(source, /marketing-flow|marketing-pack-heading|marketing-actions|marketing-task-card|size="panel"/);
    assert.doesNotMatch(source, /<(?:a|button|summary)\b[^>]*class="[^"]*\bbtn\b/);
  }
  for (const component of ['MarketingCopy', 'MarketingPreview', 'MarketingSocial']) {
    const source = read(`src/components/marketing/${component}.astro`);
    assert.match(source, /Button\.astro/);
    assert.match(source, /ActionGroup\.astro|MarketingPreview\.astro/);
    assert.doesNotMatch(source, /<(?:a|button|summary)\b[^>]*class="[^"]*\bbtn\b/);
  }
  assert.match(read('src/components/marketing/MarketingPackGrid.astro'), /DestinationCards/);
  const css = read('src/styles/marketing.css');
  assert.doesNotMatch(css, /\.marketing-(?:flow|task-card|pack-card|actions|eyebrow|steps)|\.btn\b|font:\s*var\(--h[123]/);
  assert.match(read('src/scripts/marketing.ts'), /article\.marketing/);
  const button = read('src/components/Button.astro');
  assert.match(button, /class:list/);
  assert.match(button, /btn--compact/);
  assert.doesNotMatch(button, /<style/);
});
