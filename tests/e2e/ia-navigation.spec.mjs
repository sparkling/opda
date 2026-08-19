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

test('left section navigation covers every canonical destination', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [route, section, label] of [
    ['/programme', 'programme', 'Programme overview'],
    ['/spdtf-2', 'spdtf-2', 'Development overview'],
    ['/spdtf-2/working-groups', 'working-groups', 'Working-group overview'],
    ['/pdtf-1', 'pdtf-1', 'PDTF 1.0 overview'],
    ['/governance', 'governance', 'Section overview'],
    ['/resources', 'resources', 'Resources overview'],
  ]) {
    await visit(page, route);
    const sidebar = page.locator('#app-sidebar');
    const navigation = sidebar.locator('#section-navigation');
    await expect(sidebar).toBeVisible();
    await expect(navigation).toHaveAttribute('data-section', section);
    await expect(navigation).toHaveAttribute('aria-label', / section$/u);
    const active = navigation.locator('a[aria-current="page"]');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText(label);
    await expect(active.locator('xpath=ancestor::details[1]')).toHaveAttribute('open', '');
    await expect(sidebar.locator('#sidebar-collapse')).toHaveAttribute('aria-controls', 'section-navigation');
  }
  clean();
});

test('left navigation follows route ownership with one active link', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [route, section, label] of [
    ['/strategy/project-roadmap', 'programme', 'Project roadmap'],
    ['/v2/validation', 'spdtf-2', 'Validation evidence'],
    ['/spdtf-2/working-groups/estate-agency/evidence', 'working-groups', 'Evidence'],
    ['/ontology/classes', 'pdtf-1', 'Classes'],
    ['/engagement/meetings-decisions', 'governance', 'Meetings & decisions'],
    ['/engagement/transcripts', 'resources', 'Transcripts index'],
  ]) {
    await visit(page, route);
    const navigation = page.locator('#section-navigation');
    await expect(navigation).toHaveAttribute('data-section', section);
    const active = navigation.locator('a[aria-current="page"]');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText(label);
  }

  await visit(page, '/ontology/classes');
  await page.evaluate(() => localStorage.setItem('opda.sidebar.pdtf-1.Ontology reference', 'closed'));
  await page.reload();
  await expect(page.locator('#section-navigation details[data-active="true"]')).toHaveAttribute('open', '');
  await page.evaluate(() => localStorage.setItem('opda-sidebar-collapsed', '1'));
  await page.reload();
  await expect(page.locator('.app-body')).toHaveClass(/sidebar-collapsed/u);
  await expect(page.locator('#sidebar-collapse')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#sidebar-collapse')).toHaveAttribute('aria-label', 'Expand sidebar');
  clean();
});

test('folder pages remain links beside independent disclosure controls', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/spdtf-2/ontologies/standards');
  const folder = page.locator('.tree-folder', { has: page.locator('a[href="/spdtf-2/ontologies"]') }).first();
  const link = folder.locator('a[href="/spdtf-2/ontologies"]');
  const toggle = folder.locator(':scope > .tree-folder-row > .tree-toggle');
  await expect(link).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const controls = await toggle.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
  await expect(page.locator(`#${controls}`)).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`#${controls}`)).toBeHidden();
  clean();
});

test('page navigation exposes headings and a single previous-next sequence', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/programme');
  const toc = page.locator('aside.toc[aria-label="On this page"]');
  await expect(toc).toBeVisible();
  expect(await toc.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('href'))))
    .toEqual(['#continuation', '#policy', '#start']);
  const toggle = toc.locator('#toc-collapse');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const sequence = page.locator('nav.page-footer[aria-label="Previous and next pages"]');
  await expect(sequence).toHaveCount(1);
  await expect(sequence.locator('a')).toHaveCount(1);
  await expect(sequence.locator('a')).toHaveAttribute('href', '/strategy');
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
  // Keep the primary-nav task-ordering check independent from the compact
  // disclosure boundary tested above.
  await page.setViewportSize({ width: 1440, height: 900 });
  await visit(page, '/home');

  // Interaction 1: enter the published implementation from the primary nav.
  await page.locator('nav[aria-label="Primary"] a', { hasText: 'PDTF 1.0' }).click();
  await expect(page).toHaveURL(/\/pdtf-1$/u);
  const implementationLinks = page.locator('main a');
  await expect(implementationLinks.filter({ hasText: 'Schemas and overlays' })).toBeVisible();
  await expect(implementationLinks.filter({ hasText: 'Implementation guidance' })).toBeVisible();
  expect((await implementationLinks.allTextContents()).join('\n')).not.toMatch(/archive/iu);

  // Interaction 2: both implementation entry points are directly available;
  // validation guidance is visible from the implementation route itself.
  await implementationLinks.filter({ hasText: 'Schemas and overlays' }).click();
  await expect(page).toHaveURL(/\/schema$/u);
  expect((await page.locator('a').allTextContents()).join('\n')).not.toMatch(/archive/iu);

  await page.goto('/pdtf-1');
  await page.locator('main a', { hasText: 'Implementation guidance' }).click();
  await expect(page).toHaveURL(/\/implementation$/u);
  await expect(page.getByRole('link', { name: 'Validation', exact: true })).toBeVisible();
  expect((await page.locator('a').allTextContents()).join('\n')).not.toMatch(/archive/iu);
  clean();
});
