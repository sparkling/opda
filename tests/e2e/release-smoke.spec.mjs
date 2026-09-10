import { expect, test } from '@playwright/test';

import { emailPreviewPath, visit, watchRuntime } from './support.mjs';

test('homepage exposes the primary public journey', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Join a working group' }).first()).toHaveAttribute('href', '/join');
  await expect(page.getByRole('contentinfo')).toBeVisible();
  clean();
});

test('primary navigation preserves the selected colour mode', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/programme');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const navigationToggle = page.getByRole('button', { name: 'Open site navigation' });
  if (await navigationToggle.isVisible()) await navigationToggle.click();
  const primaryNavigation = page.getByRole('navigation', { name: 'Primary', exact: true });
  await expect(primaryNavigation).toBeVisible();
  await primaryNavigation.getByRole('link', { name: 'Governance', exact: true }).click();
  await expect(page).toHaveURL(/\/governance$/u);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  clean();
});

test('join page exposes the complete registration boundary', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/join');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('group', { name: 'About you' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Register my interest' })).toBeVisible();
  clean();
});

test('search returns a navigable result', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/search?q=ontology');
  const search = page.getByRole('search').getByRole('searchbox', { name: 'Search documentation' });
  await expect(search).toHaveValue('ontology');
  await expect(page.locator('[data-search-results] a').first()).toBeVisible();
  clean();
});

test('technical documentation retains its reader navigation', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/semantic-modelling/method/languages-and-profiles');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'On this page' })).toBeVisible();
  clean();
});

test('marketing rich previews remain bounded and plain-text copy is disclosed first', async ({ page }) => {
  const clean = watchRuntime(page, { verifyEmailSandboxDiagnostics: true });
  await visit(page, '/marketing/packs/general');
  const origin = new URL(page.url()).origin;
  const frames = page.locator('iframe[data-email-preview]');
  expect(await frames.count()).toBeGreaterThan(0);
  for (const source of await frames.evaluateAll((nodes) => nodes.map((node) => node.src))) {
    expect(emailPreviewPath(source, origin), source).not.toBeNull();
  }

  const material = page.locator('[data-marketing-material]').filter({
    has: page.locator('iframe[src="/marketing/general/email/member.html"]'),
  });
  const disclosure = material.locator('details.marketing-plain-text');
  await expect(disclosure.locator('textarea')).toBeHidden();
  await disclosure.locator('summary').click();
  await expect(disclosure.locator('textarea')).toBeVisible();
  await disclosure.getByRole('button', { name: /Copy .*member email preview/iu }).click();
  await expect(disclosure.locator('[data-copy-status]')).toHaveText(/Copied|Text selected/iu);
  await clean();
});
