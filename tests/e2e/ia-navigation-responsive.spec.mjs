import { test, expect } from '@playwright/test';
import { GLOBAL_DESTINATIONS } from '../../src/lib/site-ia.mjs';
import { assertNoBodyOverflow, visit, watchRuntime } from './support.mjs';

const primary = GLOBAL_DESTINATIONS.map(({ title, url }) => ({ title, url }));

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

test('compact primary disclosure keeps all six destinations discoverable through the safety boundary', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const width of [769, 1024, 1279, 1376]) {
    await page.setViewportSize({ width, height: 900 });
    await visit(page, '/resources');

    const header = page.locator('.app-header');
    const opener = page.locator('#global-nav-toggle');
    const panel = page.locator('#global-nav-panel');
    const links = panel.locator('nav[aria-label="Primary"] a');

    await expect(opener).toBeVisible();
    await expect(panel).toBeHidden();
    await expect(panel).toHaveAttribute('inert', '');
    await opener.click();
    await expect(panel).toBeVisible();
    await expect(links).toHaveCount(primary.length);
    await expect(links).toHaveText(primary.map(({ title }) => title));

    const geometry = await links.evaluateAll((nodes) => nodes.map((node) => {
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
  await page.setViewportSize({ width: 1377, height: 900 });
  await visit(page, '/resources');
  const desktopNav = page.locator('nav[aria-label="Primary"]');
  await expect(page.locator('#global-nav-toggle')).toBeHidden();
  await expect(desktopNav).toBeVisible();
  await expect(desktopNav.locator('a')).toHaveCount(primary.length);
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
    expect(rect.right, 'desktop right edge').toBeLessThanOrEqual(1377);
  }
  await assertNoBodyOverflow(page);
  clean();
});

test('current implementers reach schema and validation guidance within two interactions', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await visit(page, '/home');

  await page.locator('nav[aria-label="Primary"] a', { hasText: 'PDTF 1.0' }).click();
  await expect(page).toHaveURL(/\/pdtf-1$/u);
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
  await expect(page).toHaveURL(/\/schema$/u);
  expect((await page.locator('a').allTextContents()).join('\n')).not.toMatch(/archive/iu);

  await page.goto('/pdtf-1');
  await page.getByRole('main').getByRole('link', {
    name: 'Implementation guidance',
    exact: true,
  }).click();
  await expect(page).toHaveURL(/\/implementation$/u);
  await expect(page.getByRole('link', { name: 'Validation', exact: true })).toBeVisible();
  expect((await page.locator('a').allTextContents()).join('\n')).not.toMatch(/archive/iu);
  clean();
});
