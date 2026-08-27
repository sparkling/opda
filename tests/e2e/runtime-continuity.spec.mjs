import { test, expect } from '@playwright/test';
import { visit, watchRuntime } from './support.mjs';

async function exposeCompactHeaderControls(page) {
  const toggle = page.locator('#global-nav-toggle');
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(page.locator('#global-nav-panel')).toBeVisible();
  }
}

test.describe('runtime continuity boundaries', () => {
  test('signed-out auth preserves the return target and stays same-origin', async ({ page }) => {
    const clean = watchRuntime(page);
    const loginRequests = [];

    await page.route('**/_auth/me', (route) => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'signed out' }),
    }));
    await page.route('**/_auth/login**', async (route) => {
      loginRequests.push(route.request().url());
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'login intercepted' });
    });

    await visit(page, '/programme');
    const appOrigin = new URL(page.url()).origin;
    await exposeCompactHeaderControls(page);
    const login = page.locator('#auth-login-btn');
    await expect(login).toBeVisible();
    await login.click();
    await expect(page).toHaveURL(/\/_auth\/login\?return=%2Fprogramme$/u);
    expect(loginRequests).toEqual([
      `${appOrigin}/_auth/login?return=%2Fprogramme`,
    ]);
    clean();
  });

  test('authenticated auth exposes the user menu and same-origin logout contract', async ({ page }) => {
    const clean = watchRuntime(page);
    const logoutRequests = [];

    await page.route('**/_auth/me', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ email: 'member@example.test', name: 'Test Member' }),
    }));
    await page.route('**/_auth/logout', async (route) => {
      logoutRequests.push(route.request().url());
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'logout intercepted' });
    });

    await visit(page, '/programme');
    const appOrigin = new URL(page.url()).origin;
    await exposeCompactHeaderControls(page);
    await expect(page.locator('#auth-user-menu')).toBeVisible();
    await page.locator('#auth-user-trigger').click();
    await expect(page.locator('#auth-user-dropdown')).toBeVisible();
    await expect(page.locator('#auth-user-full')).toHaveText('member@example.test');
    await page.locator('#auth-logout-btn').click();
    await expect(page).toHaveURL(/\/_auth\/logout$/u);
    expect(logoutRequests).toEqual([`${appOrigin}/_auth/logout`]);
    clean();
  });

  test('comments degrade to an authorised-account prompt without an SSO POST', async ({ page }) => {
    const clean = watchRuntime(page);
    const exchangeRequests = [];

    await page.route('**/_auth/me', (route) => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'signed out' }),
    }));
    await page.route('**/api/v2/sso/exchange', async (route) => {
      exchangeRequests.push(route.request().method());
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    });

    await visit(page, '/governance/stakeholder-engagement');
    await page.locator('.comments-section').scrollIntoViewIfNeeded();
    await expect(page.locator('#opda-comments')).toContainText(
      'Sign in with an authorised OPDA account to view and post comments',
    );
    expect(exchangeRequests).toEqual([]);
    clean();
  });

  test('resource viewer resolves a markdown resource and keeps original/download links aligned', async ({ page }) => {
    const clean = watchRuntime(page);
    await visit(page, '/resource?path=council/adoption.md');
    await expect(page.locator('#res-title')).toHaveText('adoption.md');
    await expect(page.locator('#res-path')).toHaveText('council/adoption.md');
    await expect(page.locator('#res-rendered')).toHaveText('markdown');
    await expect(page.locator('.res-prose-wrap')).toBeVisible();
    await expect(page.locator('#res-open')).toHaveAttribute('href', '/council/adoption.md');
    await expect(page.locator('#res-download')).toHaveAttribute('href', '/council/adoption.md');
    clean();
  });

  test('working-group submission posts the accepted payload and renders the success state', async ({ page }) => {
    const clean = watchRuntime(page);
    const submissions = [];
    await page.route('**/api/working-group-interest', async (route) => {
      submissions.push(JSON.parse(route.request().postData() || '{}'));
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          state: 'received',
          message: 'Your expression of interest has been received.',
        }),
      });
    });

    await visit(page, '/spdtf/working-groups/join');
    const privacyLinks = page.locator('a[href="/spdtf/working-groups/join/privacy"]');
    expect(await privacyLinks.count()).toBeGreaterThan(0);
    await page.locator('#full-name').fill('Test Participant');
    await page.locator('#email').fill('participant@example.test');
    await page.locator('#organisation').fill('Example Organisation');
    await page.locator('#role').fill('Property data analyst');
    await page.locator('input[name="workingGroups"][value="estate-agency"]').check();
    await page.locator('input[name="contributions"][value="review-model-candidates"]').check();
    await page.locator('#acknowledgement').check();
    await page.getByRole('button', { name: 'Register my interest' }).click();

    await expect(page.locator('#registration-success')).toBeVisible();
    await expect(page.locator('#working-group-interest-form')).toBeHidden();
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      fullName: 'Test Participant',
      email: 'participant@example.test',
      organisation: 'Example Organisation',
      role: 'Property data analyst',
      workingGroups: ['estate-agency'],
      contributions: ['review-model-candidates'],
      acknowledgement: true,
      privacyNoticeVersion: '2026-08-13',
    });
    clean();
  });

  test('working-group submission reports a failed POST and re-enables the form', async ({ page }) => {
    const clean = watchRuntime(page);
    await page.route('**/api/working-group-interest', (route) => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'temporarily unavailable' }),
    }));

    await visit(page, '/spdtf/working-groups/join');
    await page.locator('#full-name').fill('Test Participant');
    await page.locator('#email').fill('participant@example.test');
    await page.locator('#organisation').fill('Example Organisation');
    await page.locator('#role').fill('Property data analyst');
    await page.locator('input[name="workingGroups"][value="estate-agency"]').check();
    await page.locator('input[name="contributions"][value="review-model-candidates"]').check();
    await page.locator('#acknowledgement').check();
    await page.getByRole('button', { name: 'Register my interest' }).click();

    await expect(page.locator('#form-status')).toContainText('could not submit your registration');
    await expect(page.getByRole('button', { name: 'Register my interest' })).toBeEnabled();
    await expect(page.locator('#registration-success')).toBeHidden();
    clean();
  });
});
