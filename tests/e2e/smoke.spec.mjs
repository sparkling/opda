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
