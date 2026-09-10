import { test, expect } from '@playwright/test';
import { assertNoBodyOverflow, emailPreviewPath, visit, watchRuntime } from './support.mjs';
import { PRIVACY_NOTICE_VERSION } from '../../config/aws/working-group-interest/domain.mjs';

async function exposeCompactHeaderControls(page) {
  const toggle = page.locator('#global-nav-toggle');
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(page.locator('#global-nav-panel')).toBeVisible();
  }
}

test.describe('runtime continuity boundaries', () => {
  test('operational email samples are separate, inert and use the shared preview', async ({ page }) => {
    const clean = watchRuntime(page, { verifyEmailSandboxDiagnostics: true });
    await visit(page, '/marketing/operational-emails');
    await expect(page.locator('article.marketing > h1')).toHaveText('Operational emails');
    await expect(page.locator('article.marketing iframe')).toHaveCount(0);
    await expect(page.locator('article.marketing .destination-card-grid a')).toHaveCount(19);
    for (const id of ['conveyancing-invitation-company-folder', 'conveyancing-invitation-teams-only', 'website-login-disabled']) {
      await visit(page, `/marketing/operational-emails/${id}`);
      const preview = page.locator('iframe[data-email-preview]');
      await expect(preview).toHaveCount(1);
      await preview.scrollIntoViewIfNeeded();
      const sample = page.frameLocator('iframe[data-email-preview]');
      await expect(sample.locator('body')).toContainText('Alex Morgan');
      await expect(sample.locator('body')).toContainText('Illustrative sample');
      await expect(sample.locator('a[href], script, form')).toHaveCount(0);
      await expect(page.locator('details.marketing-plain-text')).toHaveCount(0);
      for (const theme of ['light', 'dark']) {
        await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
        await page.setViewportSize({ width: 320, height: 900 });
        await assertNoBodyOverflow(page);
      }
    }
    await clean();
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

    const posts = page.locator('[data-marketing-post]');
    await expect(posts).toHaveCount(6);
    const previewPaths = new Set();
    for (const post of await posts.all()) {
      const heading = await post.locator('h4').innerText();
      const frame = post.locator('iframe[data-email-preview]');
      previewPaths.add(await frame.getAttribute('src'));
      await expect(post.locator('.marketing-plain-text')).toHaveCount(1);
      await expect(post.locator('textarea')).toBeHidden();
      await frame.scrollIntoViewIfNeeded();
      await expect(post.frameLocator('iframe').locator('article')).toHaveCount(1);
      await expect(post.frameLocator('iframe').locator('h1')).toHaveText(heading.replace(/^Post \d+:\s*/u, ''));
      const title = await frame.getAttribute('title');
      const downloadHtml = post.getByRole('link', { name: /^Download rich HTML/u });
      await expect(downloadHtml).toHaveAccessibleName(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
      await expect(downloadHtml).toHaveAttribute('href', await frame.getAttribute('src'));
    }
    expect(previewPaths.size).toBe(6);
    await clean();
  });

  test('Marketing uses the normal content rail and shared responsive components', async ({ page }) => {
    const clean = watchRuntime(page, { verifyEmailSandboxDiagnostics: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await visit(page, '/resources');
    await expect(page.locator('.app-body')).toHaveClass(/with-toc/u);
    const reference = await page.locator('article.prose > h1').boundingBox();
    for (const route of ['/marketing', '/marketing/share-with-members', '/marketing/packs/general', '/marketing/broadcasters/opda']) {
      await visit(page, route);
      await expect(page.locator('.app-body')).toHaveClass(/with-toc/u);
      const heading = await page.locator('article.marketing > h1').boundingBox();
      expect(Math.abs(heading.x - reference.x), route).toBeLessThanOrEqual(1);
      await expect(page.locator('.marketing-flow')).toHaveCount(0);
      await expect(page.locator('.marketing .destination-card-grid')).not.toHaveCount(0);
      await assertNoBodyOverflow(page);
    }
    await visit(page, '/marketing');
    // Browsers conceal :visited colours from computed-style reads. Replay the
    // actual rule with an equivalent-specificity marker to test the cascade.
    await page.evaluate(() => {
      const rules = [...document.styleSheets].flatMap((sheet) => {
        try { return [...sheet.cssRules]; } catch { return []; }
      }).filter((rule) => rule instanceof CSSStyleRule && rule.selectorText.includes(':visited'));
      if (!rules.some((rule) => rule.style.color.includes('--color-link-visited'))) {
        throw new Error('The shared visited-link rule must be exercised');
      }
      const style = document.createElement('style');
      style.textContent = rules.map((rule) => rule.cssText.replaceAll(':visited', '[data-test-visited]')).join('\n');
      document.head.append(style);
      document.querySelectorAll('article.marketing a.btn').forEach((link) => link.setAttribute('data-test-visited', ''));
    });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => document.documentElement.setAttribute('data-theme', theme), theme);
      const primary = page.getByRole('link', { name: 'Get a member-sharing pack', exact: true });
      await expect(primary).toHaveClass(/\bbtn\b/u);
      await expect(primary.locator('..')).toHaveClass(/\bbutton-actions\b/u);
      await primary.focus();
      await expect(primary).toBeFocused();
      await expect(primary).toHaveCSS('color', 'rgb(0, 0, 0)');
      await primary.hover();
      await expect(primary).toHaveCSS('color', 'rgb(0, 0, 0)');
      for (const width of [768, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await assertNoBodyOverflow(page);
      }
    }
    await clean();
  });

  test('portable Marketing slides use full width until notes are requested', async ({ page }) => {
    const clean = watchRuntime(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async value => { window.__marketingCopiedText = value; } },
      });
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await visit(page, '/marketing/general/slides.html');
    const canvas = page.locator('.slide[aria-hidden="false"] .slide-canvas');
    const notes = page.getByRole('button', { name: 'Speaker notes', exact: true });
    const edit = page.getByRole('button', { name: 'Edit text', exact: true });
    const fullWidth = (await canvas.boundingBox()).width;
    const availableWidth = await page.locator('.slide[aria-hidden="false"]').evaluate(node => {
      const style = getComputedStyle(node);
      return node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    });
    expect(Math.abs(fullWidth - availableWidth)).toBeLessThanOrEqual(1);
    await expect(notes).toHaveAttribute('aria-pressed', 'false');
    await notes.click();
    await expect(notes).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.slide[aria-hidden="false"] .speaker-notes')).toBeVisible();
    expect((await canvas.boundingBox()).width).toBeLessThan(fullWidth);
    await notes.click();
    await expect(notes).toHaveAttribute('aria-pressed', 'false');
    expect((await canvas.boundingBox()).width).toBeGreaterThanOrEqual(fullWidth - 1);
    await edit.click();
    await expect(edit).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.slide[aria-hidden="false"] .editable')).toHaveAttribute('contenteditable', 'true');
    await edit.click();
    await expect(edit).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await notes.click();
    await edit.click();
    const copy = page.locator('.slide[aria-hidden="false"] .slide-copy');
    await copy.locator('h2').fill('A locally edited presentation title');
    const expectedText = await copy.evaluate(node => [...node.querySelectorAll('h1,h2,p,li')]
      .map(element => element.textContent.trim()).filter(Boolean).join('\n'));
    await page.getByRole('button', { name: 'Copy slide text', exact: true }).click();
    await expect(page.locator('.control-status')).toHaveText('Slide text copied.');
    expect(await page.evaluate(() => window.__marketingCopiedText)).toBe(expectedText);
    const downloading = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download edited HTML', exact: true }).click();
    const download = await downloading;
    let exportedHtml = '';
    for await (const chunk of await download.createReadStream()) exportedHtml += chunk.toString();
    const exportedState = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return {
        editable: doc.querySelectorAll('[contenteditable]').length,
        controls: [...doc.querySelectorAll('[data-action="notes"],[data-action="edit"]')].map(node => node.getAttribute('aria-pressed')),
        notes: doc.documentElement.dataset.notes ?? null,
        printMode: doc.documentElement.dataset.printMode ?? null,
        status: doc.querySelector('.control-status').textContent,
        visibleSlides: [...doc.querySelectorAll('.slide[aria-hidden="false"]')].map(node => node.dataset.slide),
        title: doc.querySelector('[data-slide="2"] h2').textContent,
      };
    }, exportedHtml);
    expect(exportedState).toEqual({ editable: 0, controls: ['false', 'false'], notes: null, printMode: null,
      status: '', visibleSlides: ['1'], title: 'A locally edited presentation title' });
    await page.setViewportSize({ width: 375, height: 900 });
    await expect(page.locator('.slide[aria-hidden="false"] .speaker-notes')).toBeVisible();
    await assertNoBodyOverflow(page);
    await clean();
  });

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

  test('approved comments use same-origin credentials and post only after deliberate submission', async ({ page, baseURL }) => {
    const clean = watchRuntime(page);
    const apiRequests = [];
    const loginRequests = [];
    const content = '<strong>Retained comment, displayed as plain text.</strong>';
    const comments = [{ id: 41, rid: 0, nick: 'Test Participant', date: '2026-09-08T12:00:00Z', content }];

    // A non-auth fixture cookie proves same-origin browser transport. The real
    // HttpOnly session and approval checks are covered by gateway contracts.
    await page.context().addCookies([{ name: 'legacy-comment-session', value: 'synthetic-old-session', url: baseURL }]);

    await page.route('**/_auth/me', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ email: 'member@example.test', name: 'Test Member' }),
    }));
    await page.route('**/_auth/login**', async (route) => {
      loginRequests.push(route.request().url());
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'unexpected login' });
    });
    await page.route('**/api/v2/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      apiRequests.push({ url, method: request.method(), headers: await request.allHeaders(), body: request.postData() });
      if (url.pathname !== '/api/v2/comments' || !['GET', 'POST'].includes(request.method())) {
        await route.fulfill({ status: 403, contentType: 'application/json', body: '{}' });
        return;
      }
      if (request.method() === 'POST') {
        const submitted = JSON.parse(request.postData());
        const comment = { id: 42, rid: submitted.rid, nick: 'Test Member', date: '2026-09-09T12:00:00Z', content: submitted.content };
        comments.push(comment);
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: comment }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        data: { comments, count: comments.length, viewer: { name: 'Test Member' } },
      }) });
    });

    await visit(page, '/governance/stakeholder-engagement');
    await page.locator('.comments-section').scrollIntoViewIfNeeded();
    await expect(page.locator('.comments-section__notice')).toHaveCount(0);
    await expect(page.locator('#atk-comment-41 .comments-section__content')).toHaveText(content);
    await expect(page.locator('#atk-comment-41 header strong')).toHaveText('Test Participant');
    await expect(page.locator('#atk-comment-41 .comments-section__content strong')).toHaveCount(0);
    await expect(page.locator('#opda-comments-status')).toBeEmpty();
    await expect(page.locator('#opda-comments-more')).toBeHidden();
    await expect(page.locator('#opda-comments-form')).toBeVisible();
    await expect(page.locator('#opda-comments-author')).toHaveText('Commenting as Test Member');
    await expect(page.locator('#opda-comments-sign-in')).toBeHidden();
    expect(apiRequests).toHaveLength(1);
    const [read] = apiRequests;
    expect(read.url.origin).toBe(new URL(page.url()).origin);
    expect(read.url.pathname).toBe('/api/v2/comments');
    expect(Object.fromEntries(read.url.searchParams)).toEqual({
      page_key: await page.locator('.comments-section').getAttribute('data-comment-page-key'),
      site_name: 'OPDA', limit: '20', offset: '0', flat_mode: 'true', sort_by: 'date_asc',
    });
    expect(read.method).toBe('GET');
    expect(read.body).toBeNull();
    expect(read.headers.authorization).toBeUndefined();
    expect(read.headers.cookie).toContain('legacy-comment-session=synthetic-old-session');
    await page.locator('#atk-comment-41').getByRole('button', { name: 'Reply', exact: true }).click();
    await page.getByLabel('Your comment', { exact: true }).fill('A deliberate reply');
    await page.getByRole('button', { name: 'Post comment', exact: true }).click();
    await expect(page.locator('#atk-comment-42 .comments-section__content')).toHaveText('A deliberate reply');
    await expect(page.locator('#atk-comment-42 .comments-section__reply')).toHaveText('Reply to comment #41');
    await expect(page.locator('#opda-comments-status')).toHaveText('Your comment has been posted.');
    const posts = apiRequests.filter(request => request.method === 'POST');
    expect(posts).toHaveLength(1);
    expect(JSON.parse(posts[0].body)).toEqual({ page_key: read.url.searchParams.get('page_key'), content: 'A deliberate reply', rid: 41 });
    expect(posts[0].headers.authorization).toBeUndefined();
    expect(posts[0].headers.cookie).toContain('legacy-comment-session=synthetic-old-session');
    expect(loginRequests).toEqual([]);
    clean();
  });

  test('signed-out comments expose only the explicit sign-in link, not an editor or retained content', async ({ page }) => {
    const clean = watchRuntime(page);
    await page.route('**/_auth/me', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    await page.route('**/api/v2/comments?**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    await visit(page, '/governance/stakeholder-engagement');
    await page.locator('.comments-section').scrollIntoViewIfNeeded();
    await expect(page.locator('#opda-comments-sign-in')).toBeVisible();
    await expect(page.locator('#opda-comments-form')).toBeHidden();
    await expect(page.locator('#opda-comments-list')).toBeEmpty();
    await expect(page.locator('#opda-comments-status')).toHaveText('Please sign in with an approved account to use comments.');
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

    await visit(page, '/join');
    const privacyLinks = page.locator('a[href="/join/privacy"]');
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
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
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

    await visit(page, '/join');
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
