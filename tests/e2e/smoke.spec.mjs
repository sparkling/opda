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

test('estate agency uses the complete editorial SVG while other contexts retain Mermaid', async ({ page }) => {
  const clean = watchRuntime(page);
  const heavyRuntimeRequests = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script' && /mermaid|layout-elk/iu.test(request.url())) {
      heavyRuntimeRequests.push(request.url());
    }
  });

  await visit(page, '/v2/contexts/estate-agency');
  const wrapper = page.locator('.graph-diagram-wrapper[data-diagram-renderer="editorial"]');
  const svg = wrapper.locator('svg.estate-agency-diagram');
  await svg.scrollIntoViewIfNeeded();
  await expect(wrapper).toHaveAttribute('data-diagram-ready', 'true');
  await expect(svg).toBeVisible();
  await expect(wrapper.locator('.gd-mermaid')).toHaveCount(0);
  await expect(wrapper.locator('[data-diagram-action="toggle-mode"]')).toHaveCount(0);
  expect(await svg.evaluate((element) => [...element.children].slice(0, 2).map((child) => child.localName)))
    .toEqual(['title', 'desc']);
  await expect(svg.locator('.dd-card')).toHaveCount(7);
  await expect(svg.locator('a.dd-resource--class')).toHaveCount(7);
  await expect(svg.locator('a.dd-resource--relationship')).toHaveCount(5);
  await expect(svg.locator('a.dd-resource--field')).toHaveCount(7);
  await expect(svg.locator('.dd-connector')).toHaveCount(6);
  const overflowingCardText = await svg.locator('.dd-card').evaluateAll((cards) => cards.flatMap((card) => {
    const frame = card.querySelector('.dd-card__frame').getBBox();
    return [...card.querySelectorAll('text')].filter((text) => {
      const bounds = text.getBBox();
      return bounds.x < frame.x - 0.5
        || bounds.y < frame.y - 0.5
        || bounds.x + bounds.width > frame.x + frame.width + 0.5
        || bounds.y + bounds.height > frame.y + frame.height + 0.5;
    }).map((text) => `${card.dataset.resourceKey}: ${text.textContent.trim()}`);
  }));
  expect(overflowingCardText).toEqual([]);
  const fieldLabelCollisions = await svg.locator('a.dd-resource--field').evaluateAll((fields) => fields
    .filter((field) => {
      const label = field.querySelector('.dd-field__label').getBBox();
      const type = field.querySelector('.dd-field__type').getBBox();
      return label.x + label.width + 8 > type.x;
    })
    .map((field) => field.dataset.resourceKey));
  expect(fieldLabelCollisions).toEqual([]);
  const overflowingRelationshipLabels = await svg.locator('a.dd-resource--relationship').evaluateAll((relationships) => relationships
    .filter((relationship) => {
      const frame = relationship.querySelector('rect').getBBox();
      const label = relationship.querySelector('text').getBBox();
      return label.x < frame.x
        || label.y < frame.y
        || label.x + label.width > frame.x + frame.width
        || label.y + label.height > frame.y + frame.height;
    })
    .map((relationship) => relationship.dataset.resourceKey));
  expect(overflowingRelationshipLabels).toEqual([]);

  const routes = await svg.locator('a.dd-resource').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(routes).toHaveLength(19);
  expect(new Set(routes).size).toBe(19);
  for (const route of routes) {
    const response = await page.request.get(route);
    expect(response.status(), route).toBe(200);
  }

  await svg.focus();
  const initialTransform = await wrapper.locator('.diagram-canvas').evaluate((element) => element.style.transform);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => wrapper.locator('.diagram-canvas').evaluate((element) => element.style.transform))
    .not.toBe(initialTransform);
  await page.keyboard.press('Shift+=');
  await expect(wrapper.locator('.diagram-zoom-label')).toHaveText('120%');
  await page.keyboard.press('0');
  await expect(wrapper.locator('.diagram-zoom-label')).toHaveText('100%');

  const fullscreen = wrapper.locator('[data-diagram-action="fullscreen"]');
  await fullscreen.click();
  await expect(wrapper).toHaveAttribute('role', 'dialog');
  await expect(wrapper).toHaveAttribute('aria-modal', 'true');
  await expect(fullscreen).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(wrapper).toHaveAttribute('role', 'figure');
  await expect(fullscreen).toBeFocused();
  expect(heavyRuntimeRequests).toEqual([]);

  await visit(page, '/v2/contexts/conveyancing');
  const mermaid = page.locator('.graph-diagram-wrapper[data-diagram-renderer="mermaid"]').first();
  await mermaid.scrollIntoViewIfNeeded();
  await expect(mermaid.locator('.gd-mermaid svg')).toBeVisible();
  await expect(mermaid.locator('[data-diagram-action="toggle-mode"]')).toBeVisible();
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
