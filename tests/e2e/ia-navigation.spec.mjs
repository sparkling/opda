import { test, expect } from '@playwright/test';
import {
  GLOBAL_DESTINATIONS,
  IA_STATUS_FIELDS,
  findForbiddenIaLabels,
} from '../../src/lib/site-ia.mjs';
import { assertNoBodyOverflow, visit, watchRuntime } from './support.mjs';

const primary = GLOBAL_DESTINATIONS.map(({ title, url }) => ({ title, url }));

test('primary navigation exposes exactly six ordered destinations', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/programme');
  const links = page.locator('nav[aria-label="Primary"] a');
  await expect(links).toHaveCount(6);
  await expect(links).toHaveText(primary.map(({ title }) => title));
  expect(await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
    .toEqual(primary.map(({ url }) => url));
  expect(findForbiddenIaLabels(await links.allTextContents().then((values) => values.join('\n')))).toEqual([]);
  clean();
});

test('aria-current follows canonical and legacy route ownership', async ({ page }) => {
  const clean = watchRuntime(page);
  const cases = [
    ['/programme', 'Programme'],
    ['/spdtf-2', 'SPDTF 2.0 Development'],
    ['/spdtf-2/working-groups', 'Working groups'],
    ['/spdtf-2/working-groups/estate-agency', 'Working groups'],
    ['/pdtf-1', 'PDTF 1.0'],
    ['/governance', 'Governance'],
    ['/resources', 'Resources'],
    ['/strategy/strategy-overview', 'Programme'],
    ['/v2/validation', 'SPDTF 2.0 Development'],
    ['/ontology/classes', 'PDTF 1.0'],
    ['/library/resources', 'Resources'],
  ];
  for (const [route, label] of cases) {
    await visit(page, route);
    const active = page.locator('nav[aria-label="Primary"] a[aria-current="page"]');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText(label);
  }
  clean();
});

test('gateway pages expose the complete five-field status contract', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const route of primary.map(({ url }) => url)) {
    await visit(page, route);
    const status = page.locator('[data-ia-status]').first();
    await expect(status).toBeVisible();
    for (const field of IA_STATUS_FIELDS) {
      await expect(status.locator(`[data-ia-field="${field}"]`)).toHaveCount(1);
      await expect(status.locator(`[data-ia-field="${field}"]`)).not.toBeEmpty();
    }
  }
  clean();
});

test('legacy routes remain reachable without redirecting', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const route of ['/strategy/strategy-overview', '/v2/validation', '/pdtf/Seller', '/working-groups/join']) {
    await visit(page, route);
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}(?:[?#].*)?$`));
  }
  clean();
});

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
