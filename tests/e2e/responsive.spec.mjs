import { test, expect } from '@playwright/test';
import { assertNoBodyOverflow, visit, watchRuntime } from './support.mjs';

for (const { width, label } of [
  { width: 320, label: '320 CSS px (1280px at 400% zoom equivalent)' },
  { width: 768, label: '768 CSS px' },
]) {
  test(`reflows at ${label}`, async ({ page }) => {
    const clean = watchRuntime(page);
    await page.setViewportSize({ width, height: 900 });
    await visit(page, '/schema/legal-estate/ownership/leasehold/lease-legal/building-safety');
    await assertNoBodyOverflow(page);
    clean();
  });
}

test('forced colours preserve visible focus and labelled controls', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.emulateMedia({ forcedColors: 'active' });
  await visit(page, '/working-groups/join');
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  await page.locator('a, button, input, select, textarea').first().focus();
  const focused = page.locator(':focus-visible');
  await expect(focused).toHaveCount(1);
  const focusIndicator = await focused.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      boxShadow: style.boxShadow,
    };
  });
  expect(
    (focusIndicator.outlineStyle !== 'none' && focusIndicator.outlineWidth >= 2)
      || focusIndicator.boxShadow !== 'none',
  ).toBe(true);
  clean();
});

test('canonical IA tables and group pages reflow at 320 CSS px', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 320, height: 900 });
  for (const path of [
    '/spdtf-2/ontologies/standards',
    '/spdtf-2/working-groups/estate-agency',
  ]) {
    await visit(page, path);
    await assertNoBodyOverflow(page);
  }
  clean();
});

test('reduced motion disables non-essential motion', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await visit(page, '/working-groups/join');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  const motion = await page.locator('*').evaluateAll((elements) => {
    const milliseconds = (value) => value.split(',').map((part) => {
      const duration = part.trim();
      return duration.endsWith('ms')
        ? Number.parseFloat(duration)
        : Number.parseFloat(duration) * 1000;
    });
    const offenders = [];
    for (const element of elements) {
      const style = getComputedStyle(element);
      const animationActive = style.animationName.split(',').some((name) => name.trim() !== 'none')
        && milliseconds(style.animationDuration).some((duration) => duration > 1);
      const transitionActive = style.transitionProperty.split(',').some((name) => name.trim() !== 'none')
        && milliseconds(style.transitionDuration).some((duration) => duration > 1);
      const repeatsForever = style.animationIterationCount.split(',')
        .some((count) => count.trim() === 'infinite');
      if (animationActive || transitionActive || repeatsForever) {
        offenders.push({
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`,
          animation: `${style.animationName} ${style.animationDuration} ${style.animationIterationCount}`,
          transition: `${style.transitionProperty} ${style.transitionDuration}`,
        });
      }
    }
    return {
      offenders: offenders.slice(0, 20),
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  expect(motion.scrollBehavior).not.toBe('smooth');
  expect(motion.offenders).toEqual([]);
  clean();
});
