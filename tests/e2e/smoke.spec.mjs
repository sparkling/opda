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

test('estate agency keeps Mermaid/ELK geometry under the Diagram Design OPDA skin', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/v2/contexts/estate-agency');
  const wrapper = page.locator('.graph-diagram-wrapper[data-diagram-renderer="mermaid"]').filter({
    has: page.locator('.gd-config'),
  }).first();
  await wrapper.scrollIntoViewIfNeeded();
  await expect(wrapper).toHaveAttribute('data-diagram-profile', 'opda-diagram-design');
  await expect(wrapper).toHaveAttribute('data-diagram-ready', 'true');
  await expect(wrapper).toHaveAttribute('data-profile-geometry-invariant', 'true');
  const beforeGeometrySha256 = await wrapper.getAttribute('data-profile-geometry-before-sha256');
  expect(beforeGeometrySha256).toMatch(/^[0-9a-f]{64}$/u);
  await expect(wrapper).toHaveAttribute('data-profile-geometry-after-sha256', beforeGeometrySha256);
  const svg = wrapper.locator('.gd-mermaid svg');
  await expect(svg).toBeVisible();
  await expect(wrapper.locator('[data-diagram-action="toggle-mode"]')).toBeVisible();
  await expect(svg.locator('.node')).toHaveCount(22);
  await expect(svg.locator('.edgePaths path.flowchart-link')).toHaveCount(25);
  await expect(svg.locator('.node[role="link"]')).toHaveCount(19);
  await expect(svg).toHaveAttribute('role', 'group');
  await expect(svg).toHaveAttribute('aria-labelledby', /gd-svg-title-/u);
  const paint = await wrapper.evaluate((element) => {
    const root = getComputedStyle(document.documentElement);
    const colour = (value) => {
      const probe = document.createElement('span');
      probe.style.color = value;
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    };
    const node = (key) => [...element.querySelectorAll('.node')]
      .find((item) => new RegExp(`-term_${key}-\\d+$`, 'u').test(item.id));
    const shape = (key) => node(key)?.querySelector(':scope > rect, :scope > polygon, :scope > path');
    return {
      focalStroke: shape(3).style.getPropertyValue('stroke'),
      focalToken: colour(root.getPropertyValue('--color-data-1').trim()),
      propertyStroke: shape(7).style.getPropertyValue('stroke'),
      propertyToken: colour(root.getPropertyValue('--color-text-muted').trim()),
      boundaryDash: getComputedStyle(shape(0)).strokeDasharray,
    };
  });
  expect(paint.focalStroke).toBe(paint.focalToken);
  expect(paint.propertyStroke).toBe(paint.propertyToken);
  expect(paint.boundaryDash).toBe('4px, 3px');

  const config = JSON.parse(await wrapper.locator('.gd-config').textContent());
  expect(config.source).not.toMatch(/^\s*click\s+/gmu);
  expect(Object.keys(config.links)).toHaveLength(19);
  expect(config.provenance.mode).toBe('preserve-renderer-layout');
  const routes = Object.values(config.links);
  expect(new Set(routes).size).toBe(19);

  const geometry = async () => svg.evaluate((element) => [...element.querySelectorAll('*')].map((node) => ({
    tag: node.tagName,
    id: node.id,
    viewBox: node.getAttribute('viewBox'),
    transform: node.getAttribute('transform'),
    x: node.getAttribute('x'), y: node.getAttribute('y'),
    width: node.getAttribute('width'), height: node.getAttribute('height'),
    cx: node.getAttribute('cx'), cy: node.getAttribute('cy'),
    points: node.getAttribute('points'), d: node.getAttribute('d'),
    markerStart: node.getAttribute('marker-start'), markerEnd: node.getAttribute('marker-end'),
  })));
  const styledGeometry = await geometry();
  await wrapper.evaluate((element) => element.removeAttribute('data-diagram-profile'));
  expect(await geometry()).toEqual(styledGeometry);
  await wrapper.evaluate((element) => element.setAttribute('data-diagram-profile', 'opda-diagram-design'));

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

  // Route compilation can trigger an Astro dev-server HMR refresh, so verify
  // the link targets only after all same-page geometry and keyboard assertions.
  for (const route of routes) {
    const response = await page.request.get(route);
    expect(response.status(), route).toBe(200);
  }

  await visit(page, '/v2/contexts/conveyancing');
  const mermaid = page.locator('.graph-diagram-wrapper[data-diagram-renderer="mermaid"]').first();
  await mermaid.scrollIntoViewIfNeeded();
  await expect(mermaid.locator('.gd-mermaid svg')).toBeVisible();
  await expect(mermaid.locator('[data-diagram-action="toggle-mode"]')).toBeVisible();
  clean();
});

test('estate agency fails closed when profile styling changes Mermaid geometry', async ({ page }) => {
  await page.addInitScript(() => {
    const getAttribute = Element.prototype.getAttribute;
    let profileViewBoxReads = 0;
    Element.prototype.getAttribute = function patchedGetAttribute(name) {
      const value = getAttribute.call(this, name);
      if (
        name === 'viewBox'
        && this instanceof SVGSVGElement
        && this.closest('[data-diagram-profile="opda-diagram-design"]')
      ) {
        profileViewBoxReads += 1;
        return profileViewBoxReads > 1 ? `${value} 0` : value;
      }
      return value;
    };
  });
  await visit(page, '/v2/contexts/estate-agency');
  const wrapper = page.locator('[data-diagram-profile="opda-diagram-design"]');
  await wrapper.scrollIntoViewIfNeeded();
  await expect(wrapper.locator('.gd-empty')).toHaveText('Diagram unavailable.');
  await expect(wrapper).toHaveAttribute('data-diagram-ready', 'false');
  await expect(wrapper).toHaveAttribute('data-profile-geometry-invariant', 'false');
  await expect(wrapper.locator('.gd-mermaid svg')).toHaveCount(0);
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
