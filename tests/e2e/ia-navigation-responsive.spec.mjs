import { test, expect } from '@playwright/test';
import { GLOBAL_NAVIGATION_ITEMS } from '../../src/lib/site-ia.mjs';
import { PDTF1_ROUTES } from '../../src/lib/pdtf1-routes.mjs';
import { assertNoBodyOverflow, visit, watchRuntime } from './support.mjs';

const primary = GLOBAL_NAVIGATION_ITEMS.map(({ title, url }) => ({ title, url }));

test('mobile primary disclosure is keyboard-operable and 320px does not overflow', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 320, height: 900 });
  await visit(page, '/resources');
  const opener = page.locator('#global-nav-toggle');
  const panel = page.locator('#global-nav-panel');
  await expect(panel).toBeHidden();
  await expect(panel).toHaveAttribute('inert', '');
  await opener.click();
  await expect(panel).toBeVisible();
  await panel.locator('a').first().focus();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await assertNoBodyOverflow(page);
  clean();
});

test('compact primary disclosure keeps all navigation items discoverable through the safety boundary', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const width of [769, 1024, 1279, 1376, 1440, 1472, 1536]) {
    await page.setViewportSize({ width, height: 900 });
    await visit(page, '/resources');

    const header = page.locator('.app-header');
    const opener = page.locator('#global-nav-toggle');
    const panel = page.locator('#global-nav-panel');
    const allPrimaryLinks = panel.locator('nav[aria-label="Primary"] a');
    const links = panel.locator('.global-nav > a');
    const cta = panel.locator('.header-actions--compact .header-cta');
    const membership = panel.locator('.header-actions--compact .header-membership');

    await expect(opener).toBeVisible();
    await expect(panel).toBeHidden();
    await expect(panel).toHaveAttribute('inert', '');
    await opener.click();
    await expect(panel).toBeVisible();
    await expect(links).toHaveCount(primary.length);
    await expect(links).toHaveText(primary.map(({ title }) => title));
    await expect(cta).toHaveText('Join a working group');
    await expect(cta).toHaveAttribute('href', '/join');
    await expect(membership).toHaveText('Become a member');
    await expect(membership).toHaveAttribute('href', 'https://openpropdata.org.uk/become-a-member/');
    const desktopActions = page.locator('.header-action--desktop');
    await expect(desktopActions).toHaveCount(2);
    await expect(desktopActions.first()).toBeHidden();
    await expect(desktopActions.last()).toBeHidden();

    const geometry = await allPrimaryLinks.evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    }));
    for (const rect of geometry) {
      expect(rect.left, `left edge at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(rect.right, `right edge at ${width}px`).toBeLessThanOrEqual(width);
      expect(rect.top, `top edge at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(rect.bottom, `bottom edge at ${width}px`).toBeLessThanOrEqual(900);
    }
    await expect(header).toHaveClass(/primary-nav-open/);
    await assertNoBodyOverflow(page);

    await links.first().focus();
    await expect(links.first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(opener).toHaveAttribute('aria-expanded', 'false');
    await expect(opener).toBeFocused();
  }

  // At the first width beyond the disclosure boundary, the row must have
  // enough intrinsic space for every destination, with no clipped glyphs.
  await page.setViewportSize({ width: 1537, height: 900 });
  await visit(page, '/resources');
  const desktopNav = page.locator('nav[aria-label="Primary"]');
  const desktopDestinations = desktopNav.locator(':scope > a');
  const desktopActions = page.locator('.app-header__utilities > .header-actions');
  const desktopCta = desktopActions.locator('.header-cta');
  const desktopMembership = desktopActions.locator('.header-membership');
  await expect(page.locator('#global-nav-toggle')).toBeHidden();
  await expect(desktopNav).toBeVisible();
  await expect(desktopDestinations).toHaveCount(primary.length);
  await expect(desktopCta).toHaveText('Join a working group');
  await expect(desktopCta).toHaveAttribute('href', '/join');
  await expect(desktopMembership).toHaveText('Become a member');
  await expect(desktopMembership).toHaveAttribute('href', 'https://openpropdata.org.uk/become-a-member/');
  await expect(page.locator('.header-actions--compact')).toBeHidden();
  const alignment = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
    return {
      content: rect('.app-main > .prose'),
      utilities: rect('.app-header__utilities'),
      cta: rect('.app-header__utilities .header-actions > .header-cta'),
      icons: rect('.app-header .header-nav'),
      membership: rect('.app-header__utilities .header-actions > .header-membership'),
      navPanel: rect('.global-nav-panel'),
    };
  });
  expect(alignment.utilities.right).toBeCloseTo(alignment.content.right, 1);
  expect(alignment.cta.right).toBeLessThanOrEqual(alignment.icons.left);
  expect(alignment.cta.top).toBeCloseTo(alignment.icons.top, 1);
  expect(alignment.cta.bottom).toBeCloseTo(alignment.icons.bottom, 1);
  expect(alignment.membership.right).toBeLessThan(alignment.cta.left);
  expect(alignment.membership.top).toBeCloseTo(alignment.cta.top, 1);
  expect(alignment.membership.bottom).toBeCloseTo(alignment.cta.bottom, 1);
  const desktopGeometry = await desktopNav.locator('a').evaluateAll((nodes) => ({
    links: nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    }),
    client: nodes[0]?.parentElement?.clientWidth || 0,
    scroll: nodes[0]?.parentElement?.scrollWidth || 0,
  }));
  expect(desktopGeometry.scroll).toBeLessThanOrEqual(desktopGeometry.client + 1);
  for (const rect of desktopGeometry.links) {
    expect(rect.left, 'desktop left edge').toBeGreaterThanOrEqual(0);
    expect(rect.right, 'desktop right edge').toBeLessThanOrEqual(1537);
  }
  await assertNoBodyOverflow(page);
  clean();
});

test('current implementers reach nested third-party schema and validation guidance', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1536, height: 900 });
  await visit(page, '/');

  await page.locator('.public-overview a.card[href="/development"]').click();
  await expect(page).toHaveURL(/\/development$/u);
  await page.locator('main a[href="/development/inputs"]').click();
  await page.locator(`main a.ia-gateway-card[href="${PDTF1_ROUTES.root}"]`).click();
  await expect(page).toHaveURL(new RegExp(`${PDTF1_ROUTES.root}$`, 'u'));
  const implementationLinks = page.locator('main a');
  const schemasLink = page.getByRole('main').getByRole('link', {
    name: 'Schemas and overlays',
    exact: true,
  });
  const implementationLink = page.getByRole('main').getByRole('link', {
    name: 'Implementation guidance',
    exact: true,
  });
  await expect(schemasLink).toBeVisible();
  await expect(implementationLink).toBeVisible();
  expect((await implementationLinks.allTextContents()).join('\n')).not.toMatch(/archive/iu);

  await schemasLink.click();
  await expect(page).toHaveURL(new RegExp(`${PDTF1_ROUTES.original}/schema$`, 'u'));
  expect((await page.locator('a').allTextContents()).join('\n')).not.toMatch(/archive/iu);

  await page.goto(PDTF1_ROUTES.root);
  await page.getByRole('main').getByRole('link', {
    name: 'Implementation guidance',
    exact: true,
  }).click();
  await expect(page).toHaveURL(new RegExp(`${PDTF1_ROUTES.original}/implementation$`, 'u'));
  await expect(page.getByRole('link', { name: 'Validation', exact: true })).toBeVisible();
  expect((await page.locator('a').allTextContents()).join('\n')).not.toMatch(/archive/iu);
  clean();
});
