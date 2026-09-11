import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { brotliCompressSync } from 'node:zlib';
import {
  CAMPAIGN_EXCLUDED_MODULES,
  renderBundledDesignSystem,
  renderCampaignDesignSystem,
} from '../src/integrations/bundle-design-system.mjs';

const publicDir = new URL('../public/', import.meta.url);

test('campaign CSS excludes only explicit knowledge-base modules and preserves source cascade order', async () => {
  const full = await renderBundledDesignSystem({ publicDir });
  const campaign = await renderCampaignDesignSystem({ publicDir });
  assert.deepEqual(campaign.imports, full.imports.filter((name) => !CAMPAIGN_EXCLUDED_MODULES.includes(name)));
  for (const name of [
    './fonts.css', './design-tokens.css', './design/base.css', './design/components.css',
    './design/content.css', './design/header-brand.css', './design/header-brand-previews.css',
    './design/newsletter.css', './design/public.css', './design/print.css', './design/forced-colors.css',
  ]) assert.ok(campaign.imports.includes(name), `${name} must not disappear from campaign pages`);
  assert.ok(!campaign.output.includes('.sidebar-nav{'), 'the documentation rail layout is not bundled');
  assert.ok(Buffer.byteLength(campaign.output) < Buffer.byteLength(full.output) * 0.70,
    'campaign CSS should omit a material amount of irrelevant knowledge-base CSS');
  assert.ok(brotliCompressSync(campaign.output).length < brotliCompressSync(full.output).length * 0.8);
});

test('inline campaign CSS uses crawlable root-relative fonts and masks for every route depth', async () => {
  const { output } = await renderCampaignDesignSystem({ publicDir });
  assert.doesNotMatch(output, /url\(["']?\.\.?\//u);
  assert.match(output, /url\(\/ui\/fonts\/SourceSans3-Variable-latin\.woff2\)/u);
  assert.match(output, /url\(\/ui\/brand\/opda-icon-yellow\.svg\)/u);
  assert.doesNotMatch(output, /https:\/\/(?:fonts\.googleapis|fonts\.gstatic|build\.invalid)/u);
});

test('campaign controls keep hover, focus, dark mode, hidden state and accessibility rules', async () => {
  const { output } = await renderCampaignDesignSystem({ publicDir });
  for (const fragment of [
    ':hover', ':focus-visible', '[data-theme=dark]', '[hidden]', '.btn--ghost',
    '.header-preview-selector', '.newsletter', '@media print', '@media(forced-colors:active)',
    '@media(prefers-reduced-motion:reduce)',
  ]) assert.ok(output.includes(fragment), `${fragment} remains in the generated campaign cascade`);
  const component = await readFile(new URL('../src/components/CampaignDesignStyles.astro', import.meta.url), 'utf8');
  assert.match(component, /<style is:inline data-opda-campaign-design-system set:html=\{css\}/u);
  assert.doesNotMatch(component, /onload=|media="print"|<script/u,
    'visible campaign styles must not depend on JavaScript or async stylesheet promotion');
});
