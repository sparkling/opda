import { test, expect } from '@playwright/test';
import {
  assertNoBodyOverflow,
  SEMANTIC_MODELLING_ROUTES,
  visit,
  watchRuntime,
} from './support.mjs';

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
  const activeTrigger = page.locator('.tree-toggle[data-label="JSON Schemas and overlays"]');
  const unrelatedTrigger = page.locator('.tree-toggle[data-label="Implementation guidance"]');
  await expect(activeTrigger).toHaveAttribute('aria-expanded', 'true');
  await expect(unrelatedTrigger).toHaveAttribute('aria-expanded', 'false');
  await unrelatedTrigger.click();
  await expect(unrelatedTrigger).toHaveAttribute('aria-expanded', 'true');
  clean();
});

test('mobile section drawer returns focus on Escape', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await visit(page, '/spdtf-2/ontologies/standards');
  const opener = page.locator('#menu-toggle');
  const sidebar = page.locator('#app-sidebar');
  await opener.click();
  await expect(sidebar).toHaveClass(/open/);
  await expect(sidebar).toHaveAttribute('role', 'dialog');
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  const first = sidebar.locator('a[href]:visible, button:visible, summary:visible').first();
  const last = sidebar.locator('a[href]:visible, button:visible, summary:visible').last();
  await expect(first).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  const category = sidebar.locator('.nav-group[data-group="Semantic modelling"]');
  const toggle = category.locator('.nav-group-toggle');
  const categoryLink = category.locator('a[href="/spdtf-2/ontologies"]');
  const before = page.url();
  await toggle.click();
  expect(page.url()).toBe(before);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(sidebar).not.toHaveClass(/open/);
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
  await expect(opener).toBeFocused();
  await opener.click();
  await categoryLink.click();
  await expect(page).toHaveURL(/\/spdtf-2\/ontologies$/u);
  await expect(sidebar).not.toHaveClass(/open/);
  await assertNoBodyOverflow(page);
  clean();
});

test('semantic modelling exposes linked audience branches and one active page', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/ontologies/standards');
  const navigation = page.locator('#section-navigation');
  const method = navigation.locator('.tree-folder:has(> .tree-folder-row > a[href="/spdtf-2/ontologies/modelling-method"])');
  const teaching = navigation.locator('.tree-folder:has(> .tree-folder-row > a[href="/spdtf-2/ontologies/why-ontologies"])');
  await expect(method).toHaveClass(/is-open/u);
  await expect(method.locator(':scope > .tree-folder-row > a'))
    .toHaveText('How we model SPDTF 2.0');
  await expect(method.locator(':scope > .tree-folder-row > button'))
    .toHaveAttribute('aria-expanded', 'true');
  await expect(teaching).not.toHaveClass(/is-open/u);
  await expect(navigation.locator('a[aria-current="page"]')).toHaveCount(1);
  await expect(navigation.locator('a[aria-current="page"]'))
    .toHaveAttribute('href', '/spdtf-2/ontologies/standards');
  clean();
});

test('every semantic teaching diagram is named, described, captioned and keyboard-operable', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 320, height: 900 });
  let diagramCount = 0;

  for (const path of SEMANTIC_MODELLING_ROUTES) {
    await visit(page, path);
    const figures = page.locator('.graph-diagram-wrapper');
    const count = await figures.count();
    diagramCount += count;

    for (let index = 0; index < count; index += 1) {
      const figure = figures.nth(index);
      await figure.scrollIntoViewIfNeeded();
      const svg = figure.locator('.gd-mermaid svg');
      await expect(svg).toBeVisible();
      await expect(svg).toHaveAttribute('role', 'img');
      await expect(svg).toHaveAttribute('tabindex', '0');

      const accessibility = await svg.evaluate((node) => {
        const title = node.querySelector(':scope > title');
        const description = node.querySelector(':scope > desc');
        const labelledBy = node.getAttribute('aria-labelledby');
        const describedBy = (node.getAttribute('aria-describedby') || '').split(/\s+/u).filter(Boolean);
        const directTags = [...node.children].slice(0, 2).map((child) => child.tagName.toLowerCase());
        return {
          directTags,
          titleId: title?.id,
          titleText: title?.textContent?.trim(),
          descriptionId: description?.id,
          descriptionText: description?.textContent?.trim(),
          labelledBy,
          describedBy,
        };
      });
      expect(accessibility.directTags).toEqual(['title', 'desc']);
      expect(accessibility.titleText?.length).toBeGreaterThan(10);
      expect(accessibility.descriptionText?.length).toBeGreaterThan(30);
      expect(accessibility.labelledBy).toBe(accessibility.titleId);
      expect(accessibility.describedBy).toContain(accessibility.descriptionId);

      const caption = figure.locator('figcaption');
      await expect(caption).toBeVisible();
      const captionId = await caption.getAttribute('id');
      expect(captionId).toBeTruthy();
      expect(accessibility.describedBy).toContain(captionId);

      await svg.focus();
      const canvas = figure.locator('.diagram-canvas');
      const before = await canvas.evaluate((node) => getComputedStyle(node).transform);
      await page.keyboard.press('ArrowRight');
      const after = await canvas.evaluate((node) => getComputedStyle(node).transform);
      expect(after).not.toBe(before);
    }
    await assertNoBodyOverflow(page);
  }

  expect(diagramCount).toBeGreaterThanOrEqual(10);
  clean();
});

test('semantic diagrams retain visible structure in forced colours', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.emulateMedia({ forcedColors: 'active' });
  await page.setViewportSize({ width: 390, height: 900 });

  for (const path of SEMANTIC_MODELLING_ROUTES) {
    await visit(page, path);
    const figures = page.locator('.graph-diagram-wrapper');
    for (let index = 0; index < await figures.count(); index += 1) {
      const figure = figures.nth(index);
      await figure.scrollIntoViewIfNeeded();
      const svg = figure.locator('.gd-mermaid svg');
      await expect(svg).toBeVisible();
      await expect(svg.locator('g.node')).not.toHaveCount(0);
      await expect(figure.locator('.diagram-toolbar')).toBeVisible();
    }
    await assertNoBodyOverflow(page);
  }
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

test('Property Pack diagrams use the PDTF 1.0 class-backbone convention', async ({ page }) => {
  const clean = watchRuntime(page);
  const routes = [
    ['/spdtf-2/property-pack/model', 53],
    ['/spdtf-2/property-pack/contexts/common', 21],
    ['/spdtf-2/property-pack/contexts/conveyancing', 21],
    ['/spdtf-2/property-pack/contexts/dbt-smart-data', 1],
  ];
  let conveyancingGraphText = '';

  for (const [path, nodeCount] of routes) {
    await visit(page, path);
    const diagram = page.locator('.graph-diagram-wrapper').first();
    await diagram.scrollIntoViewIfNeeded();
    const svg = diagram.locator('.gd-mermaid svg');
    await expect(svg).toBeVisible();
    await expect(svg.locator('g.node')).toHaveCount(nodeCount);
    const graphText = await svg.textContent();
    expect(graphText).not.toMatch(/\b(?:domain|range)\b/iu);
    expect(graphText).not.toMatch(/Datatype property|Object property|xsd:|skos:Concept/iu);
    if (path.endsWith('/contexts/conveyancing')) conveyancingGraphText = graphText ?? '';
  }

  expect(conveyancingGraphText).toMatch(/Property/iu);
  expect(conveyancingGraphText).toMatch(/Registered Title/iu);
  expect(conveyancingGraphText).toMatch(/has registered title/iu);
  expect(conveyancingGraphText).toMatch(/isA/u);
  clean();
});

test('reader pages use only the shared right-rail page navigation', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const path of ['/mapping', '/ontology/classes', '/spdtf-2/property-pack/model']) {
    await visit(page, path);
    await expect(page.locator('main nav').filter({ hasText: 'On this page' })).toHaveCount(0);
    await expect(page.locator('aside.toc[aria-label="On this page"]')).toBeVisible();
  }

  await visit(page, '/working-groups/join/privacy');
  await expect(page.locator('nav').filter({ hasText: 'On this page' })).toHaveCount(0);
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
