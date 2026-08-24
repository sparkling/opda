import { test, expect } from '@playwright/test';
import { GLOBAL_DESTINATIONS, IA_STATUS_FIELDS, findForbiddenIaLabels } from '../../src/lib/site-ia.mjs';
import { PDTF1_ROUTES } from '../../src/lib/pdtf1-routes.mjs';
import { assertNoBodyOverflow, visit, watchRuntime } from './support.mjs';

const primary = GLOBAL_DESTINATIONS.map(({ title, url }) => ({ title, url }));
const pdtfClasses = `${PDTF1_ROUTES.terms}/classes`;

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

test('public entry mirrors the six global destinations while the knowledge home carries six paths', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/');
  const publicDestinations = page.locator('.public-overview a.card');
  await expect(publicDestinations).toHaveCount(6);
  expect(await publicDestinations.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
    .toEqual(primary.map(({ url }) => url));
  await visit(page, '/home');
  await expect(page.locator('.home-section-card')).toHaveCount(6);
  clean();
});

test('aria-current follows canonical route ownership', async ({ page }) => {
  const clean = watchRuntime(page);
  const cases = [
    ['/programme', 'Programme'],
    ['/governance', 'Governance'],
    ['/semantic-modelling', 'Semantic modelling'],
    ['/semantic-modelling/standards', 'Semantic modelling'],
    ['/spdtf', 'SPDTF Development'],
    ['/spdtf/working-groups', 'Working groups'],
    ['/spdtf/working-groups/estate-agency', 'Working groups'],
    ['/resources', 'Resources'],
    ['/strategy/strategy-overview', 'Programme'],
    ['/spdtf/property-pack/validation', 'SPDTF Development'],
    [pdtfClasses, 'SPDTF Development'],
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
    ['/governance', 'governance', 'Governance framework'],
    ['/semantic-modelling', 'semantic-modelling', 'Overview'],
    ['/spdtf', 'spdtf', 'Overview'],
    ['/spdtf/working-groups', 'working-groups', 'Group workspaces'],
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
    ['/spdtf/property-pack/validation', 'spdtf', 'Validation evidence'],
    ['/spdtf/working-groups/estate-agency/evidence', 'working-groups', 'Evidence'],
    [pdtfClasses, 'pdtf-schema', 'Classes'],
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

  await visit(page, pdtfClasses);
  await page.evaluate(() => localStorage.setItem('opda.sidebar.pdtf-1.Schema-derived ontology', 'closed'));
  await page.reload();
  await expect(page.locator('#section-navigation .nav-group[data-active="true"]')).toHaveClass(/is-open/u);
  await page.evaluate(() => localStorage.setItem('opda-sidebar-collapsed', '1'));
  await page.reload();
  await expect(page.locator('.app-body')).toHaveClass(/sidebar-collapsed/u);
  await expect(page.locator('#sidebar-collapse')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#sidebar-collapse')).toHaveAttribute('aria-label', 'Expand sidebar');
  clean();
});

test('PDTF schema navigation separates supporting material from the schema-derived ontology', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, pdtfClasses);

  const navigation = page.locator('#section-navigation[data-section="pdtf-schema"]');
  const groups = navigation.locator(':scope > .nav-group');
  await expect(groups).toHaveCount(3);
  await expect(groups.locator('.nav-group-link')).toHaveText([
    'Overview', 'Schema and supporting material', 'Schema-derived ontology',
  ]);
  await expect(navigation.locator('a[aria-current="page"]')).toHaveText('Classes');
  await expect(navigation.locator('.nav-group[data-group="Schema-derived ontology"]')).toHaveClass(/is-open/u);
  await expect(navigation.locator('.nav-group[data-group="Schema and supporting material"]')).not.toHaveClass(/is-open/u);
  const taskCategories = navigation.locator('.nav-group[data-group="Schema-derived ontology"] .tree-folder.is-task-category');
  await expect(taskCategories).toHaveCount(7);
  await expect(taskCategories.filter({ has: page.locator(`a[href="${PDTF1_ROUTES.terms}"]`) }))
    .toHaveClass(/is-open/u);
  await expect(taskCategories.filter({ has: page.locator(`a[href="${PDTF1_ROUTES.validation}"]`) }))
    .not.toHaveClass(/is-open/u);
  const categoryStyle = await navigation.locator(`a[href="${PDTF1_ROUTES.terms}"]`)
    .evaluate((link, leafUrl) => {
      const row = link.parentElement;
      const leaf = document.querySelector(`#section-navigation a[href="${leafUrl}"]`);
      const rowStyle = getComputedStyle(row);
      return {
        background: rowStyle.backgroundColor,
        border: rowStyle.borderTopStyle,
        categoryWeight: getComputedStyle(link).fontWeight,
        leafWeight: getComputedStyle(leaf).fontWeight,
      };
    }, `${PDTF1_ROUTES.terms}/properties`);
  expect(categoryStyle.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(categoryStyle.border).toBe('solid');
  expect(Number(categoryStyle.categoryWeight)).toBeGreaterThan(Number(categoryStyle.leafWeight));
  const nestedFolderStyle = await navigation.locator(`a[href="${PDTF1_ROUTES.schemaVerification}"]`)
    .evaluate((link) => ({
      background: getComputedStyle(link.parentElement).backgroundColor,
      weight: getComputedStyle(link).fontWeight,
    }));
  expect(nestedFolderStyle.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(Number(nestedFolderStyle.weight)).toBeGreaterThan(Number(categoryStyle.leafWeight));
  const disclosureContract = await navigation.locator('.nav-group[data-group="Schema-derived ontology"] .tree-folder')
    .evaluateAll((folders) => folders.map((folder) => {
      const row = folder.querySelector(':scope > .tree-folder-row');
      const controls = row.querySelector('button').getAttribute('aria-controls');
      return {
        controls,
        tags: [...row.children].map(({ tagName }) => tagName),
        buttonName: row.querySelector('button').getAttribute('aria-label'),
        linkText: row.querySelector('a').textContent.trim(),
        targetCount: document.querySelectorAll(`#${CSS.escape(controls)}`).length,
      };
    }));
  expect(new Set(disclosureContract.map(({ controls }) => controls)).size)
    .toBe(disclosureContract.length);
  for (const record of disclosureContract) {
    expect(record.tags).toEqual(['BUTTON', 'A']);
    expect(record.buttonName).toMatch(/^(?:Expand|Collapse) /u);
    expect(record.buttonName).toContain(record.linkText);
    expect(record.targetCount).toBe(1);
  }
  for (const id of [
    'schema', 'implementation', 'adoption', 'modelling', 'model', 'ontology', 'mapping',
  ]) await expect(page.locator(`#section-nav-group-pdtf-schema-${id === 'adoption' ? 'usage' : id}`)).toHaveCount(1);

  await expect(page.locator('nav[aria-label="Breadcrumb"] li')).toHaveText([
    /PDTF schema/u, /Schema-derived ontology/u, /Terms and model resources/u, /Classes/u,
  ]);

  await visit(page, `${PDTF1_ROUTES.original}/schema/legal-estate`);
  await expect(navigation.locator('.nav-group[data-group="Schema and supporting material"]')).toHaveClass(/is-open/u);
  await expect(navigation.locator('.nav-group[data-group="Schema-derived ontology"]')).not.toHaveClass(/is-open/u);
  await expect(navigation.locator('a[aria-current="page"]')).toHaveCount(1);

  await navigation.locator(`a[href="${PDTF1_ROUTES.extracted}"]`).click();
  await expect(page.locator('h1')).toHaveText('schema-derived ontology reference');
  await expect(page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]'))
    .toHaveText('Schema-derived ontology');
  expect(await page.locator('#explore + p + .card-grid > a').evaluateAll((cards) => (
    cards.map((card) => card.getAttribute('href'))
  ))).toEqual([
    PDTF1_ROUTES.lineage, PDTF1_ROUTES.modelViews, PDTF1_ROUTES.concepts,
    PDTF1_ROUTES.terms, PDTF1_ROUTES.validation, PDTF1_ROUTES.trust, PDTF1_ROUTES.use,
  ]);
  await expect(page.locator('nav.page-footer a').last())
    .toHaveAttribute('href', PDTF1_ROUTES.lineage);

  for (const [route, label] of [
    [PDTF1_ROUTES.modelViews, 'Model views by audience'],
    [PDTF1_ROUTES.trust, 'Trust, governance and limitations'],
    [PDTF1_ROUTES.use, 'Use and tooling'],
  ]) {
    await visit(page, route);
    await expect(page.locator('h1')).toHaveText(label);
    await expect(page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]')).toHaveText(label);
    await expect(page.locator('#section-navigation a[aria-current="page"]')).toHaveText(label);
  }
  clean();
});

test('category pages remain links beside independent disclosure controls', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/semantic-modelling/standards');
  const category = page.locator('.nav-group[data-group="Understand ontologies"]');
  const link = category.locator('.nav-group-link[href="/semantic-modelling/why-ontologies"]');
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

  const otherCategory = page.locator('.nav-group[data-group="How we model SPDTF"]');
  await otherCategory.locator('.nav-group-toggle').click();
  await expect(otherCategory).toHaveClass(/is-open/u);
  await expect(category).not.toHaveClass(/is-open/u);

  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/semantic-modelling\/why-ontologies$/u);
  await expect(page.locator('.nav-group-row.is-active-page a[aria-current="page"]'))
    .toHaveAttribute('href', '/semantic-modelling/why-ontologies');
  await expect(page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]'))
    .toHaveText('Understand ontologies');
  await expect(page.locator('nav.page-footer a').last())
    .toHaveAttribute('href', '/semantic-modelling/reading-the-model');
  clean();
});

test('dark active category renders one amber stripe', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/spdtf/working-groups');
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const row = page.locator('.nav-group-row.is-active-page');
  const link = row.locator('a.active');
  await expect(row).toBeVisible();
  await expect(link).toBeVisible();
  expect(await row.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
  expect(await link.evaluate((element) => getComputedStyle(element).boxShadow)).toBe('none');
  clean();
});

test('Property Pack definition cards link to their canonical views', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf/property-pack/definition-and-scope');
  const contextCards = page.locator('.context-grid > a.context-card');
  await expect(contextCards).toHaveCount(8);
  await expect(contextCards.first()).toHaveAttribute('href', /\/spdtf\/property-pack\/contexts\//u);
  const artefactCards = page.locator('#candidate-artefacts + p + .v2-card-grid > a.v2-card');
  await expect(artefactCards).toHaveCount(6);
  await expect(artefactCards.first()).toHaveAttribute('href', /\/resource\?path=source\/03-standards\/ontology-candidates/u);
  clean();
});

test('nested navigation follows one consistent indentation ladder', async ({ page }) => {
  const clean = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/semantic-modelling/standards');

  const geometry = await page.evaluate(() => {
    const link = (href) => document.querySelector(`#section-navigation a[href="${href}"]`);
    const textLeft = (element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().left;
    };
    const rootLeaf = link('/semantic-modelling');
    const rootFolder = link('/semantic-modelling/why-ontologies');
    const childLeaf = link('/semantic-modelling/reading-the-model');
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
  await visit(page, '/spdtf/property-pack/validation');
  await expect(page.locator('nav[aria-label="Primary"] a[aria-current="page"]'))
    .toHaveText('SPDTF Development');
  expect(await page.locator('nav[aria-label="Primary"] a').allTextContents()).not.toContain('V2');
  const local = page.locator('#section-navigation');
  await expect(local.locator('a[href="/spdtf/property-pack"]')).toHaveText('Property Pack ontology');
  await expect(local.locator('a[aria-current="page"]')).toHaveText('Validation evidence');
  await expect(local.locator('a[href="/spdtf/property-pack"]')
    .locator('xpath=ancestor::section[1]')).toHaveClass(/is-open/u);
  clean();
});

test('Property Pack detail pages expose their full canonical ancestry', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf/property-pack/resources/common/Property');
  const crumbs = page.locator('nav[aria-label="Breadcrumb"]');
  await expect(crumbs.locator('a, [aria-current="page"]')).toHaveText([
    'SPDTF Development', 'Property Pack ontology', 'Ontology resources', 'Common boundary', 'Property',
  ]);
  expect(await crumbs.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual([
    '/spdtf', '/spdtf/property-pack', '/spdtf/property-pack/resources',
    '/spdtf/property-pack/contexts/common',
  ]);
  const local = page.locator('#section-navigation');
  await expect(local.locator('a[aria-current="page"]')).toHaveCount(1);
  await expect(local.locator('.nav-group[data-group="Property Pack ontology"]')).toHaveClass(/is-open/u);
  await expect(local.locator('.tree-folder:has(> .tree-folder-row > a[href="/spdtf/property-pack/model"])'))
    .toHaveClass(/is-open/u);
  await expect(local.locator('.tree-folder:has(> .tree-folder-row > a[href="/spdtf/property-pack/coverage"])'))
    .not.toHaveClass(/is-open/u);
  await expect(page.locator('[aria-label="Property Pack lifecycle status"] dt')).toHaveCount(6);
  const returnToResources = page.locator('a.btn[href="/spdtf/property-pack/resources"]');
  await expect(returnToResources).toHaveText('All resources');
  await expect(returnToResources).toBeVisible();
  const [heading, action] = await Promise.all([
    page.locator('.property-pack-resource-title h1').boundingBox(),
    returnToResources.boundingBox(),
  ]);
  expect(action.y).toBeLessThanOrEqual(heading.y + heading.height);
  expect(action.x).toBeGreaterThan(heading.x);
  await returnToResources.click();
  await expect(page).toHaveURL(/\/spdtf\/property-pack\/resources\/?$/u);
  clean();
});

test('Property Pack candidate status is collapsed until requested', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf/property-pack/resources/common/Property');
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
    '/semantic-modelling',
    '/spdtf/working-groups/estate-agency',
    '/spdtf/working-groups/estate-agency/review',
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
    await visit(page, '/spdtf/working-groups/estate-agency/review');
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
    [pdtfClasses, 'schema-derived'],
    ['/spdtf/property-pack/contexts/estate-agency', '0.1.0-draft candidate cut'],
    ['/spdtf/working-groups/estate-agency', 'no candidate version'],
  ]) {
    await visit(page, route);
    await expect(page.locator('html')).toHaveAttribute('data-content-version', new RegExp(expected, 'iu'));
    await expect(page.locator('meta[name="opda:authority"]')).toHaveCount(1);
  }
  clean();
});

test('participant reaches evidence, questions and review from one canonical workspace', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf/working-groups/estate-agency');
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
  await expect(results.filter({ has: page.locator('a[href="/pdtf-schema"]') })).toContainText('historical name');
  await expect(results.getByRole('link', { name: 'SPDTF Development', exact: true })).toHaveCount(1);
  expect(await results.count()).toBeGreaterThan(1);
  await expect(results.locator('dt', { hasText: 'Authority' }).first()).toBeVisible();
  clean();
});
test('Property Pack source catalogue retains its 451-item interaction', async ({ page }) => {
  const clean = watchRuntime(page);
  await visit(page, '/spdtf/property-pack/definition-and-scope');
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
