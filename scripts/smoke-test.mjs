#!/usr/bin/env node
/**
 * OPDA Knowledge Base — Playwright smoke-test scaffold.
 *
 * Covers the interactive surface that is easy to break and hard to spot in
 * review: theme toggle, sidebar collapse, tree-folder toggle, mobile menu,
 * Mermaid rendering on representative pages, and data-table rendering on the
 * dictionary / glossary pages.
 *
 * TODO: `@playwright/test` is not yet in devDependencies.
 *   Install with:  npm install -D @playwright/test
 *   Then bootstrap browsers: npx playwright install --with-deps
 *   Optionally add a `test:smoke` script in package.json.
 *
 * Usage (after installing Playwright):
 *   npx playwright test scripts/smoke-test.mjs                 # against http://localhost:4321
 *   BASE_URL=http://localhost:4330 npx playwright test scripts/smoke-test.mjs
 *   BASE_URL=https://opda.pages.dev npx playwright test scripts/smoke-test.mjs
 *
 * The dynamic import below means `node scripts/smoke-test.mjs` only validates
 * that Playwright is installed; it does not run the tests. Use the runner.
 *
 * The dev server picks the first free port in 4330–4339 (see dev.mjs); set
 * BASE_URL accordingly when running against a non-default port.
 *
 * This is a scaffold: each test contains the navigation + selector skeleton.
 * Selectors marked TODO should be confirmed against the actual rendered DOM
 * before this is wired into CI.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

let test, expect;
try {
  ({ test, expect } = await import('@playwright/test'));
} catch (err) {
  console.error('✗ @playwright/test is not installed.');
  console.error('  Run: npm install -D @playwright/test && npx playwright install');
  process.exit(1);
}

test.describe('OPDA KB smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('theme toggle switches light/dark', async ({ page }) => {
    // TODO: confirm selector — likely a button with aria-label "Toggle theme"
    // or a data-theme-toggle attribute. Theme is reflected on <html data-theme>.
    const html = page.locator('html');
    const initial = await html.getAttribute('data-theme');
    const toggle = page.locator('[data-theme-toggle], button[aria-label*="theme" i]').first();
    await toggle.click();
    const next = await html.getAttribute('data-theme');
    expect(next).not.toEqual(initial);
  });

  test('sidebar collapses and expands', async ({ page }) => {
    // TODO: confirm selectors — sidebar root + collapse trigger.
    const sidebar = page.locator('[data-sidebar], aside.sidebar, nav.sidebar').first();
    const collapseBtn = page.locator('[data-sidebar-toggle], button[aria-label*="sidebar" i]').first();
    await expect(sidebar).toBeVisible();
    await collapseBtn.click();
    // After collapse, sidebar should report a collapsed state via attribute or class.
    await expect(sidebar).toHaveAttribute('data-collapsed', /true|1/);
    await collapseBtn.click();
    await expect(sidebar).not.toHaveAttribute('data-collapsed', /true|1/);
  });

  test('tree-folder toggles open and closed', async ({ page }) => {
    // TODO: confirm selector — sidebar tree folders likely use <details> or a
    // custom [data-tree-folder] element with an aria-expanded button.
    const folder = page.locator('[data-tree-folder], details.tree-folder').first();
    const trigger = folder.locator('summary, [data-tree-folder-toggle]').first();
    const initiallyOpen = await folder.evaluate(
      (el) => el.hasAttribute('open') || el.getAttribute('aria-expanded') === 'true'
    );
    await trigger.click();
    const afterClick = await folder.evaluate(
      (el) => el.hasAttribute('open') || el.getAttribute('aria-expanded') === 'true'
    );
    expect(afterClick).not.toEqual(initiallyOpen);
  });

  test('mobile menu opens and closes', async ({ page }) => {
    // TODO: confirm viewport breakpoint and selectors.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    const openBtn = page.locator('[data-mobile-menu-open], button[aria-label*="menu" i]').first();
    const menu = page.locator('[data-mobile-menu], nav.mobile-menu').first();
    await openBtn.click();
    await expect(menu).toBeVisible();
    const closeBtn = page.locator('[data-mobile-menu-close], button[aria-label*="close" i]').first();
    await closeBtn.click();
    await expect(menu).toBeHidden();
  });

  test('Mermaid diagrams render on modelling / governance / schema pages', async ({ page }) => {
    // TODO: replace with real page paths once known. These are representative
    // probes; failure means Mermaid did not hydrate (no <svg> emitted).
    const probes = [
      '/modelling/data-dictionary',
      '/governance/data-stewardship',
      '/schema/overlays',
    ];
    for (const path of probes) {
      await page.goto(`${BASE_URL}${path}`);
      // Mermaid hydration replaces <pre class="mermaid"> or <div class="mermaid">
      // with an inline <svg>. Wait for at least one rendered SVG inside the diagram host.
      const diagram = page.locator('.mermaid svg, [data-diagram] svg').first();
      await expect(diagram).toBeVisible({ timeout: 10_000 });
    }
  });

  test('data tables render on data dictionary and business glossary', async ({ page }) => {
    // TODO: confirm table selector — likely a <table> inside the page main content.
    const pages = [
      '/modelling/data-dictionary',
      '/modelling/business-glossary',
    ];
    for (const path of pages) {
      await page.goto(`${BASE_URL}${path}`);
      const table = page.locator('main table, [data-table] table').first();
      await expect(table).toBeVisible({ timeout: 10_000 });
      const rowCount = await table.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    }
  });
});
