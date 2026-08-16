import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { ROUTES, visit, watchRuntime } from './support.mjs';

test.describe('representative WCAG 2.2 AA surfaces', () => {
  for (const path of ROUTES) {
    test(`axe ${path}`, async ({ page }) => {
      const clean = watchRuntime(page);
      await visit(page, path);
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
