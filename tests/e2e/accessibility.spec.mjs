import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import {
  ROUTES,
  SEMANTIC_MODELLING_ROUTES,
  visit,
  watchRuntime,
} from './support.mjs';

async function forceRenderDiagrams(page) {
  const figures = page.locator('.graph-diagram-wrapper');
  for (let index = 0; index < await figures.count(); index += 1) {
    const figure = figures.nth(index);
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator('.gd-mermaid svg')).toBeVisible();
  }
}

test.describe('representative WCAG 2.2 AA surfaces', () => {
  for (const path of ROUTES) {
    test(`axe ${path}`, async ({ page }) => {
      const clean = watchRuntime(page);
      await visit(page, path);
      await forceRenderDiagrams(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, results.violations
        .map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`)
        .join('\n'))
        .toEqual([]);
      clean();
    });
  }
});

test.describe('semantic modelling dark-mode WCAG 2.2 AA surfaces', () => {
  for (const path of SEMANTIC_MODELLING_ROUTES) {
    test(`axe dark ${path}`, async ({ page }) => {
      const clean = watchRuntime(page);
      await visit(page, `${path}?theme=dark`);
      await forceRenderDiagrams(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, results.violations
        .map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`)
        .join('\n'))
        .toEqual([]);
      clean();
    });
  }
});
