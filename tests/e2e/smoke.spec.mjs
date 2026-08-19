import { test, expect } from '@playwright/test';
import { assertNoBodyOverflow, visit, watchRuntime } from './support.mjs';

test('shell theme toggle persists across navigation', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/');
  const html = page.locator('html');
  const toggle = page.locator('#theme-toggle');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await visit(page, '/design-system');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  clean();
});

test('skip link and keyboard focus are available', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/strategy/strategy-overview');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus-visible');
  await expect(focused).toHaveCount(1);
  clean();
});

test('desktop sidebar and nested tree controls work', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/strategy/strategy-overview');
  const body = page.locator('.app-body');
  await expect(page.locator('#app-sidebar')).toBeVisible();
  await page.locator('#sidebar-collapse').click();
  await expect(body).toHaveClass(/sidebar-collapsed/);
  await page.locator('#sidebar-collapse').click();
  await expect(body).not.toHaveClass(/sidebar-collapsed/);

  await visit(page, '/schema');
  const trigger = page.locator('.tree-folder > .tree-toggle').first();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  clean();
});

test('mobile section drawer returns focus on Escape', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await visit(page, '/strategy/strategy-overview');
  const opener = page.locator('#menu-toggle');
  const sidebar = page.locator('#app-sidebar');
  await opener.click();
  await expect(sidebar).toHaveClass(/open/);
  await expect(sidebar).toHaveAttribute('role', 'dialog');
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  const first = sidebar.locator('a[href], button, summary').first();
  const last = sidebar.locator('a[href], button, summary').last();
  await expect(first).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sidebar).not.toHaveClass(/open/);
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
  await expect(opener).toBeFocused();
  clean();
});

test('mobile primary navigation is an inert disclosure with Escape return', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await visit(page, '/home');
  const opener = page.locator('#global-nav-toggle');
  const panel = page.locator('#global-nav-panel');
  await expect(panel).toBeHidden();
  await expect(panel).toHaveAttribute('inert', '');
  await opener.click();
  await expect(panel).toBeVisible();
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  await panel.locator('a').first().focus();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(opener).toBeFocused();
  clean();
});

test('representative diagrams and data tables render', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const path of ['/modelling/data-dictionary', '/governance/data-stewardship']) {
    await visit(page, path);
    const diagramSource = page.locator('.gd-mermaid').first();
    await diagramSource.scrollIntoViewIfNeeded();
    await expect(diagramSource.locator('svg')).toBeVisible();
  }
  for (const path of ['/modelling/data-dictionary', '/modelling/business-glossary']) {
    await visit(page, path);
    const table = page.locator('main table').first();
    await expect(table).toBeVisible();
    expect(await table.locator('tbody tr').count()).toBeGreaterThan(0);
  }
  clean();
});

test('Mermaid source stays hidden while an off-screen diagram loads', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, '/strategy/strategy-overview?theme=dark');
  const loading = page.locator('.graph-diagram-wrapper').filter({ has: page.locator('.diagram-loading') }).first();
  await expect(loading.locator('.diagram-loading')).toHaveAttribute('role', 'status');
  await expect(loading.locator('.diagram-loading')).toHaveAttribute('aria-live', 'polite');
  await expect(loading.locator('.gd-mermaid')).toHaveAttribute('aria-hidden', 'true');
  const sourceVisibility = await loading.locator('.gd-mermaid').evaluate((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, clipPath: style.clipPath };
  });
  expect(sourceVisibility.opacity).toBe('0');
  expect(sourceVisibility.clipPath).toContain('50%');
  clean();
});

test('mobile shell has no body overflow', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 320, height: 900 });
  await visit(page, '/governance/data-security');
  await assertNoBodyOverflow(page);
  clean();
});

test('wide technical tables use a labelled keyboard overflow region', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 320, height: 900 });
  await visit(page, '/ontology/classes');
  const region = page.locator('.responsive-table').first();
  const viewport = region.locator('.responsive-table__viewport');
  await expect(region).toBeVisible();
  await expect(region.locator('.responsive-table__label')).toContainText('Scroll horizontally');
  await expect(viewport).toHaveAttribute('role', 'region');
  await expect(viewport).toHaveAttribute('tabindex', '0');
  await assertNoBodyOverflow(page);
  clean();
});

test('schema tables stay readable inside their mobile overflow region', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await visit(page, '/schema/legal-estate/ownership/leasehold/lease-legal/building-safety');

    const region = page.locator('.responsive-table:has(table.db-table)').first();
    const viewport = region.locator('.responsive-table__viewport');
    const table = viewport.locator('table.db-table').first();
    await expect(table).toHaveCSS('min-width', '960px');
    await expect(viewport).toHaveAttribute('role', 'region');
    await expect(viewport).toHaveAttribute('tabindex', '0');
    await expect(region.locator('.responsive-table__hint')).toContainText('Scroll horizontally');

    const dimensions = await viewport.evaluate((node) => ({
      viewport: node.clientWidth,
      scroll: node.scrollWidth,
      table: node.querySelector('table')?.getBoundingClientRect().width || 0,
    }));
    expect(dimensions.scroll).toBeGreaterThan(dimensions.viewport);
    expect(dimensions.table).toBeGreaterThanOrEqual(960);
    await assertNoBodyOverflow(page);
  }
  clean();
});

test('mobile interactive targets meet the 44px minimum', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 375, height: 900 });

  await visit(page, '/schema/legal-estate/ownership/leasehold/lease-legal/building-safety');
  for (const selector of ['#objects-search', '#filter-overlay-btn', '#objects-config-btn']) {
    const size = await page.locator(selector).evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(size.height, `${selector} height`).toBeGreaterThanOrEqual(44);
    if (selector !== '#objects-search') expect(size.width, `${selector} width`).toBeGreaterThanOrEqual(44);
  }

  await visit(page, '/presentation/working-group-kickoff');
  for (const selector of ['[data-testid="prev-slide"]', '[data-testid="fullscreen-toggle"]', '[data-testid="next-slide"]']) {
    const size = await page.locator(selector).evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(size.width, `${selector} width`).toBeGreaterThanOrEqual(44);
    expect(size.height, `${selector} height`).toBeGreaterThanOrEqual(44);
  }
  const overviewSize = await page.locator('[data-testid="overview-toggle"]').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(overviewSize.width, 'presentation overview width').toBeGreaterThanOrEqual(44);
  expect(overviewSize.height, 'presentation overview height').toBeGreaterThanOrEqual(44);

  await page.evaluate(() => { location.hash = '#dimensions'; });
  await page.waitForTimeout(250);
  for (const button of await page.locator('[data-interaction="dimensions"] button').all()) {
    const size = await button.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(size.width, 'completeness lens button width').toBeGreaterThanOrEqual(44);
    expect(size.height, 'completeness lens button height').toBeGreaterThanOrEqual(44);
  }

  await page.evaluate(() => { location.hash = '#website'; });
  await page.waitForTimeout(250);
  for (const button of await page.locator('[data-interaction="review-surface"] button').all()) {
    const size = await button.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(size.width, 'review view button width').toBeGreaterThanOrEqual(44);
    expect(size.height, 'review view button height').toBeGreaterThanOrEqual(44);
  }

  await visit(page, '/ontology/graph');
  await expect(page.locator('.og-tab').first()).toBeVisible();
  const graphTabHeight = await page.locator('.og-tab').first().evaluate((element) => element.getBoundingClientRect().height);
  expect(graphTabHeight, 'graph engine tab height').toBeGreaterThanOrEqual(44);
  const skosLabelSize = await page.locator('.og-ctl--check').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(skosLabelSize.height, 'SKOS toggle label height').toBeGreaterThanOrEqual(44);
  const tabs = page.locator('.og-tab');
  await expect(tabs.first()).toHaveAttribute('role', 'tab');
  await expect(tabs.first()).toHaveAttribute('aria-controls', 'ontology-graph');
  await expect(page.locator('#ontology-graph')).toHaveAttribute('role', 'tabpanel');
  await tabs.first().focus();
  await tabs.first().press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#ontology-graph')).toHaveAttribute('aria-labelledby', await tabs.nth(1).getAttribute('id'));

  await visit(page, '/');
  const enterSize = await page.locator('.public-header__signin').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(enterSize.width, 'public Enter link width').toBeGreaterThanOrEqual(44);
  expect(enterSize.height, 'public Enter link height').toBeGreaterThanOrEqual(44);
  clean();
});
