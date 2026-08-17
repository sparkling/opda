import { test, expect } from '@playwright/test';
import { settleVisualState, visit, watchRuntime } from './support.mjs';

const routeFamilies = [
  ['public-entry', '/'],
  ['knowledge-home', '/home'],
  ['prose', '/strategy/strategy-overview'],
  ['v2-data', '/v2'],
  ['schema', '/schema/legal-estate/ownership/leasehold/lease-legal/building-safety'],
  ['diagram', '/ontology/graph'],
  ['estate-agency-diagram', '/v2/contexts/estate-agency'],
  ['working-group', '/working-groups/join'],
  ['presentation', '/presentation/working-group-kickoff'],
  ['design-system', '/design-system'],
];

async function settleRouteDiagram(page, name) {
  if (name !== 'estate-agency-diagram') return;
  const wrapper = page.locator('[data-diagram-profile="opda-diagram-design"]');
  await wrapper.scrollIntoViewIfNeeded();
  await expect(wrapper).toHaveAttribute('data-diagram-ready', 'true');
  await expect(wrapper.locator('.gd-mermaid svg')).toBeVisible();
  await page.waitForFunction(() => {
    const tables = [...document.querySelectorAll('.v2-table-wrap table')];
    return tables.length > 0 && tables.every((table) => table.closest('.responsive-table'));
  });
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const [name, path] of routeFamilies) {
  test(`${name} desktop light visual contract`, async ({ page }) => {
    const clean = watchRuntime(page);
    await visit(page, path);
    await settleVisualState(page);
    await settleRouteDiagram(page, name);
    await expect(page).toHaveScreenshot(`${name}-desktop-light.png`, {
      animations: 'disabled',
      fullPage: name !== 'presentation',
      mask: [page.locator('#comments'), page.locator('[data-dynamic]')],
    });
    clean();
  });

  test(`${name} mobile dark visual contract`, async ({ page }) => {
    const clean = watchRuntime(page);
    await page.setViewportSize({ width: 390, height: 844 });
    const themedPath = `${path}${path.includes('?') ? '&' : '?'}theme=dark`;
    await visit(page, themedPath);
    await settleVisualState(page);
    await settleRouteDiagram(page, name);
    await expect(page).toHaveScreenshot(`${name}-mobile-dark.png`, {
      animations: 'disabled',
      fullPage: name !== 'presentation',
      mask: [page.locator('#comments'), page.locator('[data-dynamic]')],
    });
    clean();
  });
}
