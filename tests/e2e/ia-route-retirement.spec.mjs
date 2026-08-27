import { test, expect } from '@playwright/test';
import { visit, watchRuntime } from './support.mjs';

test('retained routes remain reachable without redirecting', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const route of ['/strategy/strategy-overview', '/pdtf/Seller', '/spdtf/working-groups/join']) {
    await visit(page, route);
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}(?:[?#].*)?$`));
  }
  clean();
});

test('retired Property Pack routes return 404 without redirecting', async ({ page }) => {
  for (const route of [
    '/v2', '/v2/validation', '/v2/resources/common/Property', '/modelling/property-pack',
  ]) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(404);
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}$`, 'u'));
  }
});

test('retired working-group sign-up routes return 404 without redirecting', async ({ page }) => {
  for (const route of ['/working-groups/join', '/working-groups/join/privacy']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(404);
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}$`, 'u'));
  }
});

test('retired PDTF documentation routes return 404 without redirecting', async ({ page }) => {
  for (const route of [
    '/schema', '/implementation/quickstart', '/adoption',
    '/model/logical/property', '/manual/logical/property',
    '/ontology/classes', '/mapping/coverage',
    '/modelling', '/modelling/data-dictionary',
  ]) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(404);
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}$`, 'u'));
  }
});
