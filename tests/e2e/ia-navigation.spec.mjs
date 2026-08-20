import { test, expect } from '@playwright/test';
import {
  GLOBAL_DESTINATIONS,
  IA_STATUS_FIELDS,
  findForbiddenIaLabels,
} from '../../src/lib/site-ia.mjs';
import { assertNoBodyOverflow, visit, watchRuntime } from './support.mjs';

const primary = GLOBAL_DESTINATIONS.map(({ title, url }) => ({ title, url }));

test('primary navigation exposes exactly six ordered destinations', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/programme');
  const links = page.locator('nav[aria-label="Primary"] a');
  await expect(links).toHaveCount(6);
  await expect(links).toHaveText(primary.map(({ title }) => title));
  expect(await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
    .toEqual(primary.map(({ url }) => url));
  expect(findForbiddenIaLabels(await links.allTextContents().then((values) => values.join('\n')))).toEqual([]);
  clean();
});

test('public entry stays abbreviated while the knowledge home carries six paths', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/');
  await expect(page.locator('.public-overview article')).toHaveCount(4);
  await visit(page, '/home');
  await expect(page.locator('.home-section-card')).toHaveCount(6);
  clean();
});

test('aria-current follows canonical and legacy route ownership', async ({ page }) => {
  const clean = watchRuntime(page);
  const cases = [
    ['/programme', 'Programme'],
    ['/spdtf-2', 'SPDTF 2.0 Development'],
    ['/spdtf-2/working-groups', 'Working groups'],
    ['/spdtf-2/working-groups/estate-agency', 'Working groups'],
    ['/pdtf-1', 'PDTF 1.0'],
    ['/governance', 'Governance'],
    ['/resources', 'Resources'],
    ['/strategy/strategy-overview', 'Programme'],
    ['/spdtf-2/property-pack/validation', 'SPDTF 2.0 Development'],
    ['/ontology/classes', 'PDTF 1.0'],
    ['/library/resources', 'Resources'],
  ];
  for (const [route, label] of cases) {
    await visit(page, route);
    const active = page.locator('nav[aria-label="Primary"] a[aria-current="page"]');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText(label);
  }
  clean();
});

test('left section navigation covers every canonical destination', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [route, section, label] of [
    ['/programme', 'programme', 'Overview'],
    ['/spdtf-2', 'spdtf-2', 'Overview'],
    ['/spdtf-2/working-groups', 'working-groups', 'Group workspaces'],
    ['/pdtf-1', 'pdtf-1', 'Overview'],
    ['/governance', 'governance', 'Governance framework'],
    ['/resources', 'resources', 'Overview'],
  ]) {
    await visit(page, route);
    const sidebar = page.locator('#app-sidebar');
    const navigation = sidebar.locator('#section-navigation');
    await expect(sidebar).toBeVisible();
    await expect(navigation).toHaveAttribute('data-section', section);
    await expect(navigation).toHaveAttribute('aria-label', / section$/u);
    const active = navigation.locator('a[aria-current="page"]');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText(label);
    await expect(active).toHaveClass(/nav-group-link/u);
    await expect(navigation.locator(`a[href="${route}"]`)).toHaveCount(1);
    await expect(sidebar.locator('#sidebar-collapse')).toHaveAttribute('aria-controls', 'section-navigation');
  }
  clean();
});

test('left navigation follows route ownership with one active link', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [route, section, label] of [
    ['/strategy/project-roadmap', 'programme', 'Project roadmap'],
    ['/spdtf-2/property-pack/validation', 'spdtf-2', 'Validation evidence'],
    ['/spdtf-2/working-groups/estate-agency/evidence', 'working-groups', 'Evidence'],
    ['/ontology/classes', 'pdtf-1', 'Classes'],
    ['/engagement/meetings-decisions', 'governance', 'Programme decisions'],
    ['/engagement/transcripts', 'resources', 'Transcripts index'],
  ]) {
    await visit(page, route);
    const navigation = page.locator('#section-navigation');
    await expect(navigation).toHaveAttribute('data-section', section);
    const active = navigation.locator('a[aria-current="page"]');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText(label);
  }

  await visit(page, '/ontology/classes');
  await page.evaluate(() => localStorage.setItem('opda.sidebar.pdtf-1.Ontology reference', 'closed'));
  await page.reload();
  await expect(page.locator('#section-navigation .nav-group[data-active="true"]')).toHaveClass(/is-open/u);
  await page.evaluate(() => localStorage.setItem('opda-sidebar-collapsed', '1'));
  await page.reload();
  await expect(page.locator('.app-body')).toHaveClass(/sidebar-collapsed/u);
  await expect(page.locator('#sidebar-collapse')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#sidebar-collapse')).toHaveAttribute('aria-label', 'Expand sidebar');
  clean();
});

test('category pages remain links beside independent disclosure controls', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/spdtf-2/ontologies/standards');
  const category = page.locator('.nav-group[data-group="Semantic modelling"]');
  const link = category.locator('.nav-group-link[href="/spdtf-2/ontologies"]');
  const toggle = category.locator('.nav-group-toggle');
  await expect(link).toBeVisible();
  expect(await category.locator(':scope > .nav-group-row > button, :scope > .nav-group-row > a')
    .evaluateAll((nodes) => nodes.map(({ tagName }) => tagName))).toEqual(['BUTTON', 'A']);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const controls = await toggle.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
  await expect(page.locator(`#${controls}`)).toBeVisible();
  const before = page.url();
  await toggle.focus();
  await page.keyboard.press('Space');
  expect(page.url()).toBe(before);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`#${controls}`)).toBeHidden();

  const otherCategory = page.locator('.nav-group[data-group="Property Pack ontology"]');
  await otherCategory.locator('.nav-group-toggle').click();
  await expect(otherCategory).toHaveClass(/is-open/u);
  await expect(category).not.toHaveClass(/is-open/u);

  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/spdtf-2\/ontologies$/u);
  await expect(page.locator('.nav-group-row.is-active-page a[aria-current="page"]'))
    .toHaveAttribute('href', '/spdtf-2/ontologies');
  await expect(page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]'))
    .toHaveText('Semantic modelling');
  await expect(page.locator('nav.page-footer a').last())
    .toHaveAttribute('href', '/spdtf-2/ontologies/why-ontologies');
  clean();
});

test('Property Pack definition cards link to their canonical views', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/property-pack/definition-and-scope');
  const contextCards = page.locator('.context-grid > a.context-card');
  await expect(contextCards).toHaveCount(8);
  await expect(contextCards.first()).toHaveAttribute('href', /\/spdtf-2\/property-pack\/contexts\//u);
  const artefactCards = page.locator('#candidate-artefacts + p + .v2-card-grid > a.v2-card');
  await expect(artefactCards).toHaveCount(6);
  await expect(artefactCards.first()).toHaveAttribute('href', /\/resource\?path=source\/03-standards\/ontology-candidates/u);
  clean();
});

test('nested navigation follows one consistent indentation ladder', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/spdtf-2/ontologies/standards');

  const geometry = await page.evaluate(() => {
    const link = (href) => document.querySelector(`#section-navigation a[href="${href}"]`);
    const textLeft = (element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().left;
    };
    const rootLeaf = link('/spdtf-2');
    const rootFolder = link('/spdtf-2/ontologies');
    const childLeaf = link('/spdtf-2/ontologies/why-ontologies');
    const toggle = rootFolder?.parentElement?.querySelector('.nav-group-toggle');
    return {
      rootLeaf: textLeft(rootLeaf),
      rootFolder: textLeft(rootFolder),
      childLeaf: textLeft(childLeaf),
      toggleWidth: toggle?.getBoundingClientRect().width,
    };
  });

  expect(Math.abs(geometry.rootLeaf - geometry.rootFolder)).toBeLessThanOrEqual(1);
  expect(geometry.childLeaf - geometry.rootFolder).toBeGreaterThanOrEqual(15);
  expect(geometry.childLeaf - geometry.rootFolder).toBeLessThanOrEqual(17);
  expect(geometry.toggleWidth).toBeGreaterThanOrEqual(44);
  clean();
});

test('page navigation exposes headings and a single previous-next sequence', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/programme');
  const toc = page.locator('aside.toc[aria-label="On this page"]');
  await expect(toc).toBeVisible();
  expect(await toc.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('href'))))
    .toEqual(['#continuation', '#policy', '#start']);
  const toggle = toc.locator('#toc-collapse');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const sequence = page.locator('nav.page-footer[aria-label="Previous and next pages"]');
  await expect(sequence).toHaveCount(1);
  await expect(sequence.locator('a')).toHaveCount(1);
  await expect(sequence.locator('a')).toHaveAttribute('href', '/strategy');
  clean();
});

test('Property Pack ontology is owned by SPDTF development', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/property-pack/validation');
  await expect(page.locator('nav[aria-label="Primary"] a[aria-current="page"]'))
    .toHaveText('SPDTF 2.0 Development');
  expect(await page.locator('nav[aria-label="Primary"] a').allTextContents()).not.toContain('V2');
  const local = page.locator('#section-navigation');
  await expect(local.locator('a[href="/spdtf-2/property-pack"]')).toHaveText('Property Pack ontology');
  await expect(local.locator('a[aria-current="page"]')).toHaveText('Validation evidence');
  await expect(local.locator('a[href="/spdtf-2/property-pack"]')
    .locator('xpath=ancestor::section[1]')).toHaveClass(/is-open/u);
  clean();
});

test('Property Pack detail pages expose their full canonical ancestry', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/property-pack/resources/common/Property');
  const crumbs = page.locator('nav[aria-label="Breadcrumb"]');
  await expect(crumbs.locator('a, [aria-current="page"]')).toHaveText([
    'SPDTF 2.0 Development', 'Property Pack ontology', 'Ontology resources', 'Common boundary', 'Property',
  ]);
  expect(await crumbs.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual([
    '/spdtf-2', '/spdtf-2/property-pack', '/spdtf-2/property-pack/resources',
    '/spdtf-2/property-pack/contexts/common',
  ]);
  const local = page.locator('#section-navigation');
  await expect(local.locator('a[aria-current="page"]')).toHaveCount(1);
  await expect(local.locator('.nav-group[data-group="Property Pack ontology"]')).toHaveClass(/is-open/u);
  await expect(local.locator('.tree-folder:has(> .tree-folder-row > a[href="/spdtf-2/property-pack/model"])'))
    .toHaveClass(/is-open/u);
  await expect(local.locator('.tree-folder:has(> .tree-folder-row > a[href="/spdtf-2/property-pack/coverage"])'))
    .not.toHaveClass(/is-open/u);
  await expect(page.locator('[aria-label="Property Pack lifecycle status"] dt')).toHaveCount(6);
  const returnToResources = page.locator('a.btn[href="/spdtf-2/property-pack/resources"]');
  await expect(returnToResources).toHaveText('All resources');
  await expect(returnToResources).toBeVisible();
  const [heading, action] = await Promise.all([
    page.locator('.property-pack-resource-title h1').boundingBox(),
    returnToResources.boundingBox(),
  ]);
  expect(action.y).toBeLessThanOrEqual(heading.y + heading.height);
  expect(action.x).toBeGreaterThan(heading.x);
  await returnToResources.click();
  await expect(page).toHaveURL(/\/spdtf-2\/property-pack\/resources\/?$/u);
  clean();
});

test('Property Pack candidate status is collapsed until requested', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/property-pack/resources/common/Property');
  const candidateStatus = page.locator('details.v2-candidate-banner');
  await expect(candidateStatus).not.toHaveAttribute('open', '');
  await expect(candidateStatus.locator('summary')).toContainText('Machine-proposed');
  await expect(candidateStatus.locator('[aria-label="Property Pack lifecycle status"]')).not.toBeVisible();
  await candidateStatus.locator('summary').click();
  await expect(candidateStatus).toHaveAttribute('open', '');
  await expect(candidateStatus.locator('[aria-label="Property Pack lifecycle status"] dt')).toHaveCount(6);
  await expect(candidateStatus.locator('[aria-label="Property Pack lifecycle status"]')).toBeVisible();
  clean();
});

test('reader pages omit the authority box while retaining route-status metadata', async ({ page }) => {
  const clean = watchRuntime(page);
  const attributes = {
    workArea: 'data-work-area',
    authority: 'data-authority',
    maturity: 'data-maturity',
    version: 'data-content-version',
    provenance: 'data-provenance',
  };
  const metas = {
    workArea: 'opda:work-area',
    authority: 'opda:authority',
    maturity: 'opda:maturity',
    version: 'opda:version',
    provenance: 'opda:provenance',
  };
  for (const route of [
    ...primary.map(({ url }) => url),
    '/spdtf-2/ontologies',
    '/spdtf-2/working-groups/estate-agency',
    '/spdtf-2/working-groups/estate-agency/review',
  ]) {
    await visit(page, route);
    await expect(page.locator('.ia-authority, [data-ia-status], [aria-label="Authority and status"]')).toHaveCount(0);
    for (const field of IA_STATUS_FIELDS) {
      await expect(page.locator('html')).toHaveAttribute(attributes[field], /\S/u);
      await expect(page.locator(`meta[name="${metas[field]}"]`)).toHaveAttribute('content', /\S/u);
    }
  }
  clean();
});

test('candidate and feedback status uses the shared responsive definition-list pattern', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit(page, '/spdtf-2/working-groups/estate-agency/review');
    const status = page.locator('#candidate + .status-definition-list');
    await expect(status).toBeVisible();
    await expect(status.locator(':scope > div')).toHaveCount(8);
    await assertNoBodyOverflow(page);
    const geometry = await status.evaluate((element) => {
      const parent = element.parentElement.getBoundingClientRect();
      const self = element.getBoundingClientRect();
      return { parentWidth: parent.width, width: self.width, left: self.left, parentLeft: parent.left };
    });
    expect(Math.abs(geometry.width - geometry.parentWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.left - geometry.parentLeft)).toBeLessThanOrEqual(1);
  }
  clean();
});

test('all Layout pages expose versioned route status metadata', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const [route, expected] of [
    ['/ontology/classes', 'PDTF 1.0-derived'],
    ['/spdtf-2/property-pack/contexts/estate-agency', '0.1.0-draft candidate cut'],
    ['/spdtf-2/working-groups/estate-agency', 'no candidate version'],
  ]) {
    await visit(page, route);
    await expect(page.locator('html')).toHaveAttribute('data-content-version', new RegExp(expected, 'iu'));
    await expect(page.locator('meta[name="opda:authority"]')).toHaveCount(1);
  }
  clean();
});

test('participant reaches evidence, questions and review from one canonical workspace', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/working-groups/estate-agency');
  await expect(page.locator('nav[aria-label="Breadcrumb"]')).toHaveCount(1);
  const workspace = page.locator('nav[aria-label="Working-group workspace"]');
  await expect(workspace.getByRole('link')).toHaveCount(4);
  for (const label of ['Evidence', 'Questions', 'Review']) {
    await workspace.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/estate-agency/${label.toLowerCase()}$`, 'u'));
    await page.goBack();
  }
  clean();
});

test('PDTF alias search labels historical and continuation results with authority', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/search?q=PDTF');
  const results = page.locator('.search-result:not([hidden])');
  await expect(results.filter({ has: page.locator('a[href="/pdtf-1"]') })).toContainText('historical name');
  await expect(results.getByRole('link', { name: 'SPDTF 2.0 Development', exact: true })).toHaveCount(1);
  expect(await results.count()).toBeGreaterThan(1);
  await expect(results.locator('dt', { hasText: 'Authority' }).first()).toBeVisible();
  clean();
});

test('each wide standards table gains one conditional keyboard scroll region', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/ontologies/standards');
  await expect(page.locator('.responsive-table .responsive-table')).toHaveCount(0);
  const viewports = page.locator('.responsive-table__viewport');
  await expect(viewports).toHaveCount(3);
  for (const viewport of await viewports.all()) {
    const overflow = await viewport.evaluate((node) => node.scrollWidth > node.clientWidth + 1);
    await expect(viewport).toHaveAttribute('tabindex', overflow ? '0' : '-1');
  }
  clean();
});

test('retained routes remain reachable without redirecting', async ({ page }) => {
  const clean = watchRuntime(page);
  for (const route of ['/strategy/strategy-overview', '/pdtf/Seller', '/working-groups/join']) {
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

test('Property Pack source catalogue retains its 451-item interaction', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf-2/property-pack/definition-and-scope');
  expect(await page.locator('#property-pack-rows').evaluate((node) => JSON.parse(node.textContent).length)).toBe(451);
  await expect(page.locator('#property-pack-browser tbody tr')).toHaveCount(25);
  const search = page.locator('#property-pack-browser input[type="search"]');
  await search.fill('UPRN');
  await expect(page.locator('#property-pack-browser tbody tr')).not.toHaveCount(25);
  await search.fill('');
  const first = page.locator('#property-pack-browser [data-property-id]').first();
  await first.click();
  await expect(page.locator('#property-detail')).toBeVisible();
  await expect(page.locator('#property-detail-title')).not.toBeEmpty();
  await page.locator('#property-detail-close').click();
  await expect(page.locator('#property-detail')).toBeHidden();
  clean();
});
