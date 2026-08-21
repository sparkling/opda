import { test, expect } from '@playwright/test';
import {
  assertNoBodyOverflow,
  PDTF1_ROUTES,
  PDTF_ONTOLOGY_CATEGORY_ROUTES,
  SEMANTIC_MODELLING_ROUTES,
  visit,
  watchRuntime,
} from './support.mjs';

for (const { width, label } of [
  { width: 320, label: '320 CSS px (1280px at 400% zoom equivalent)' },
  { width: 768, label: '768 CSS px' },
]) {
  test(`reflows at ${label}`, async ({ page }) => {
    const clean = watchRuntime(page);
    await page.setViewportSize({ width, height: 900 });
    await visit(page, `${PDTF1_ROUTES.original}/schema/legal-estate/ownership/leasehold/lease-legal/building-safety`);
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
    ...SEMANTIC_MODELLING_ROUTES,
    ...PDTF_ONTOLOGY_CATEGORY_ROUTES,
    '/spdtf-2/working-groups/estate-agency',
  ]) {
    await visit(page, path);
    await assertNoBodyOverflow(page);
  }
  clean();
});

test('section rails, page navigation and content stay inside the shared container', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const width of [320, 1280, 1281, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit(page, '/programme');
    await assertNoBodyOverflow(page);

    const containment = await page.evaluate(() => {
      const bounds = (element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      };
      const main = bounds(document.querySelector('.app-main'));
      const prose = bounds(document.querySelector('.prose'));
      const children = Array.from(document.querySelectorAll('.prose > :is(.card-grid, .responsive-table, pre)'))
        .map((element) => ({ selector: element.className || element.tagName, ...bounds(element) }));
      const heading = document.querySelector('h2[id]');
      const anchor = heading?.querySelector('.heading-anchor');
      return {
        main, prose, children,
        anchorPosition: anchor ? getComputedStyle(anchor).position : null,
        anchorInsideHeading: Boolean(anchor && heading
          && anchor.getBoundingClientRect().top >= heading.getBoundingClientRect().top - 1
          && anchor.getBoundingClientRect().bottom <= heading.getBoundingClientRect().bottom + 1),
      };
    });
    expect(containment.prose.left).toBeGreaterThanOrEqual(containment.main.left - 1);
    expect(containment.prose.right).toBeLessThanOrEqual(containment.main.right + 1);
    for (const child of containment.children) {
      expect(child.left, `${child.selector} left at ${width}px`).toBeGreaterThanOrEqual(containment.prose.left - 1);
      expect(child.right, `${child.selector} right at ${width}px`).toBeLessThanOrEqual(containment.prose.right + 1);
    }
    expect(containment.anchorPosition).toBe('absolute');
    expect(containment.anchorInsideHeading).toBe(true);

    const toc = page.locator('aside.toc');
    await expect(toc).toBeVisible();
    if (width <= 1280) {
      await expect(toc.locator('#toc-collapse')).toHaveAttribute('aria-expanded', 'true');
      expect(await toc.evaluate((node) => node.parentElement?.classList.contains('prose'))).toBe(true);
    } else {
      expect(await toc.evaluate((node) => node.parentElement?.classList.contains('app-body'))).toBe(true);
    }
  }

  await page.setViewportSize({ width: 1281, height: 1000 });
  await visit(page, '/spdtf-2/ontologies');
  await assertNoBodyOverflow(page);
  const gateway = await page.locator('.card-grid').first().evaluate((node) => {
    const container = node.getBoundingClientRect();
    const links = Array.from(node.querySelectorAll('a')).map((link) => link.getBoundingClientRect());
    return {
      container: { left: container.left, right: container.right },
      links: links.map((rect) => ({ left: rect.left, right: rect.right, width: rect.width })),
    };
  });
  for (const link of gateway.links) {
    expect(link.left).toBeGreaterThanOrEqual(gateway.container.left - 1);
    expect(link.right).toBeLessThanOrEqual(gateway.container.right + 1);
    expect(link.width).toBeGreaterThanOrEqual(180);
  }
  clean();
});

test('text flows to its outer content container without nested max-widths', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const cases = [
    ['/programme', ['.prose.wide > .lead', '.prose.wide > h2 + p', '.callout--key p:last-child']],
    ['/', ['.public-hero h1', '.public-hero p:not(.eyebrow)', '.public-overview > header']],
    ['/home', ['.home-hero h1', '.home-hero .lede', '.home-hero__index span', '.home-section__head', '.home-section__head > p:last-child']],
    ['/working-groups/join', ['.wg-campaign-hero h1', '.wg-campaign-hero .wg-lead', '.wg-section__heading p']],
    ['/working-groups/join/privacy', ['.wg-privacy__summary p', '.wg-privacy article p', '.wg-privacy article li']],
    [`${PDTF1_ROUTES.terms}/graph`, ['.term-comment', '.og-external']],
  ];

  for (const [route, selectors] of cases) {
    await visit(page, route);
    await assertNoBodyOverflow(page);
    for (const selector of selectors) {
      const element = page.locator(selector).first();
      await expect(element, `${route} ${selector}`).toBeAttached();
      expect(await element.evaluate((node) => getComputedStyle(node).maxWidth), `${route} ${selector}`)
        .toBe('none');
    }
  }
  clean();
});

test('Property Pack candidate status reflows inside the available article track', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1281, height: 900 });
  await visit(page, '/spdtf-2/property-pack/validation');
  await page.locator('.v2-candidate-banner > summary').click();
  await assertNoBodyOverflow(page);
  const containment = await page.locator('.v2-candidate-banner, .v2-candidate-banner > summary, .v2-candidate-banner__content, .v2-candidate-banner__content > *')
    .evaluateAll((elements) => {
      const article = document.querySelector('main > .prose').getBoundingClientRect();
      return {
        article: { left: article.left, right: article.right },
        items: elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right };
        }),
      };
    });
  for (const item of containment.items) {
    expect(item.left).toBeGreaterThanOrEqual(containment.article.left - 1);
    expect(item.right).toBeLessThanOrEqual(containment.article.right + 1);
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
