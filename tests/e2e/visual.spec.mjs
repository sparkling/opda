import { test, expect } from '@playwright/test';
import { settleVisualState, visit, watchRuntime } from './support.mjs';

const routeFamilies = [
  ['public-entry', '/'],
  ['knowledge-home', '/home'],
  ['prose', '/strategy/strategy-overview'],
  ['property-pack', '/spdtf-2/property-pack'],
  ['schema', '/schema/legal-estate/ownership/leasehold/lease-legal/building-safety'],
  ['diagram', '/ontology/graph'],
  ['working-group', '/working-groups/join'],
  ['presentation', '/presentation/working-group-kickoff'],
  ['design-system', '/design-system'],
];

for (const [name, path] of routeFamilies) {
  test(`${name} desktop light visual contract`, async ({ page }) => {
    const clean = watchRuntime(page);
    await visit(page, path);
    await settleVisualState(page);
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
    await expect(page).toHaveScreenshot(`${name}-mobile-dark.png`, {
      animations: 'disabled',
      fullPage: name !== 'presentation',
      mask: [page.locator('#comments'), page.locator('[data-dynamic]')],
    });
    clean();
  });
}
