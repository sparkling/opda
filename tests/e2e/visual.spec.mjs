import { test, expect } from '@playwright/test';
import { PDTF1_ROUTES, settleVisualState, visit, watchRuntime } from './support.mjs';

const routeFamilies = [
  ['knowledge-home', '/'],
  ['prose', '/strategy/strategy-overview'],
  ['property-pack', '/development/property-pack'],
  ['schema', `${PDTF1_ROUTES.original}/schema/legal-estate/ownership/leasehold/lease-legal/building-safety`],
  ['diagram', `${PDTF1_ROUTES.terms}/graph`],
  ['working-group', '/join'],
  ['presentation', '/presentation/working-group-kickoff'],
  ['design-system', '/design-system'],
];

// Web fonts use font-display: optional (2026-09-11), so a cold context may render
// fallback faces when the network is slow and the receipt would depend on timing.
// Visit once to warm the context cache, then load again so the fonts are certain.
async function visitWarm(page, path) {
  // The preview has no session gate, so the header probe would otherwise settle on
  // "Sign-in unavailable" at a network-dependent moment; pin a signed-out session.
  await page.route('**/_auth/me', (route) => route.fulfill({
    status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'signed out' }),
  }));
  await visit(page, path);
  await page.evaluate(() => document.fonts?.ready);
  await visit(page, path);
}

for (const [name, path] of routeFamilies) {
  test(`${name} desktop light visual contract`, async ({ page }) => {
    const clean = watchRuntime(page);
    await visitWarm(page, path);
    await settleVisualState(page);
    await expect(page).toHaveScreenshot(`${name}-desktop-light.png`, {
      animations: 'disabled',
      fullPage: name !== 'presentation',
      mask: [page.locator('#comments'), page.locator('[data-dynamic]')],
      maxDiffPixelRatio: name === 'diagram' ? 0.02 : undefined,
    });
    clean();
  });

  test(`${name} mobile dark visual contract`, async ({ page }) => {
    const clean = watchRuntime(page);
    await page.setViewportSize({ width: 390, height: 844 });
    const themedPath = `${path}${path.includes('?') ? '&' : '?'}theme=dark`;
    await visitWarm(page, themedPath);
    await settleVisualState(page);
    // Some nowrap header text is clipped past the 390px viewport (overflow-x: clip).
    // A full-page capture would otherwise include that never-visible strip, which
    // Chromium rasterises non-deterministically; receipt only what a reader sees.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await expect(page).toHaveScreenshot(`${name}-mobile-dark.png`, {
      animations: 'disabled',
      fullPage: name !== 'presentation',
      ...(name !== 'presentation' ? { clip: { x: 0, y: 0, width: 390, height } } : {}),
      mask: [page.locator('#comments'), page.locator('[data-dynamic]')],
      maxDiffPixelRatio: name === 'diagram' ? 0.02 : undefined,
    });
    clean();
  });
}
