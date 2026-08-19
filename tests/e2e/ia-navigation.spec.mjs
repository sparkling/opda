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

test('public entry stays abbreviated while the knowledge home carries six paths', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/');
  await expect(page.locator('.public-overview article')).toHaveCount(4);
  await visit(page, '/home');
  await expect(page.locator('.home-section-card')).toHaveCount(6);
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

test('retained V2 seed is owned by SPDTF development, not a top-level V2 destination', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/v2/validation');
  await expect(page.locator('nav[aria-label="Primary"] a[aria-current="page"]'))
    .toHaveText('SPDTF 2.0 Development');
  expect(await page.locator('nav[aria-label="Primary"] a').allTextContents()).not.toContain('V2');
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

test('canonical development routes expose the complete five-field status contract', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const route of ['/spdtf-2/ontologies', '/spdtf-2/working-groups/estate-agency']) {
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

test('all Layout pages expose versioned route status metadata', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const [route, expected] of [
    ['/ontology/classes', 'PDTF 1.0-derived'],
    ['/v2/contexts/estate-agency', '0.1.0-draft seed'],
    ['/spdtf-2/working-groups/estate-agency', 'no candidate version'],
  ]) {
    await visit(page, route);
    await expect(page.locator('html')).toHaveAttribute('data-content-version', new RegExp(expected, 'iu'));
    await expect(page.locator('meta[name="opda:authority"]')).toHaveCount(1);
  }
  clean();
});

test('participant reaches evidence, questions and review from one canonical workspace', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/working-groups/estate-agency');
  await expect(page.locator('nav[aria-label="Breadcrumb"]')).toHaveCount(1);
  const workspace = page.locator('nav[aria-label="Working-group workspace"]');
  await expect(workspace.getByRole('link')).toHaveCount(4);
  for (const label of ['Evidence', 'Questions', 'Review']) {
    await workspace.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/estate-agency/${label.toLowerCase()}$`, 'u'));
    await page.goBack();
  }
  clean();
});

test('PDTF alias search labels historical and continuation results with authority', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/search?q=PDTF');
  const results = page.locator('.search-result:not([hidden])');
  await expect(results.filter({ hasText: 'PDTF 1.0' }).first()).toContainText('historical name');
  await expect(results.getByRole('link', { name: 'SPDTF 2.0 Development', exact: true })).toHaveCount(1);
  expect(await results.count()).toBeGreaterThan(1);
  await expect(results.locator('dt', { hasText: 'Authority' }).first()).toBeVisible();
  clean();
});

test('wide standards table gains only one conditional keyboard scroll region', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/ontologies/standards');
  await expect(page.locator('.responsive-table .responsive-table')).toHaveCount(0);
  const viewports = page.locator('.responsive-table__viewport');
  await expect(viewports).toHaveCount(2);
  for (const viewport of await viewports.all()) {
    const overflow = await viewport.evaluate((node) => node.scrollWidth > node.clientWidth + 1);
    await expect(viewport).toHaveAttribute('tabindex', overflow ? '0' : '-1');
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
