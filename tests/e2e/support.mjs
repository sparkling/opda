import assert from 'node:assert/strict';
import { PDTF1_ROUTES } from '../../src/lib/pdtf1-routes.mjs';

export { PDTF1_ROUTES };

export const SEMANTIC_MODELLING_ROUTES = [
  '/spdtf/ontologies',
  '/spdtf/ontologies/why-ontologies',
  '/spdtf/ontologies/reading-the-model',
  '/spdtf/ontologies/modelling-method',
  '/spdtf/ontologies/semantic-package',
  '/spdtf/ontologies/bounded-contexts',
  '/spdtf/ontologies/modelling-rules',
  '/spdtf/ontologies/coverage',
  '/spdtf/ontologies/standards',
  '/spdtf/ontologies/evidence-and-mappings',
  '/spdtf/ontologies/validation',
];

export const PDTF_ONTOLOGY_CATEGORY_ROUTES = [
  PDTF1_ROUTES.extracted,
  PDTF1_ROUTES.lineage,
  PDTF1_ROUTES.concepts,
  `${PDTF1_ROUTES.concepts}/contexts`,
  PDTF1_ROUTES.terms,
  PDTF1_ROUTES.validation,
  PDTF1_ROUTES.trust,
  PDTF1_ROUTES.use,
];

export const ROUTES = [
  '/',
  '/home',
  '/programme',
  '/spdtf',
  ...SEMANTIC_MODELLING_ROUTES,
  '/spdtf/working-groups/estate-agency',
  '/spdtf/working-groups/estate-agency/review',
  '/spdtf/candidates',
  '/spdtf/outputs',
  PDTF1_ROUTES.root,
  PDTF1_ROUTES.original,
  ...PDTF_ONTOLOGY_CATEGORY_ROUTES,
  '/governance',
  '/resources',
  '/search?q=PDTF',
  '/design-system',
  '/strategy/strategy-overview',
  '/governance/data-security',
  '/governance/data-stewardship',
  `${PDTF1_ROUTES.original}/data-dictionary`,
  `${PDTF1_ROUTES.original}/business-glossary`,
  `${PDTF1_ROUTES.original}/schema/overlays`,
  `${PDTF1_ROUTES.original}/schema`,
  `${PDTF1_ROUTES.original}/schema/legal-estate/ownership/leasehold/lease-legal/building-safety`,
  `${PDTF1_ROUTES.terms}/graph`,
  `${PDTF1_ROUTES.terms}/classes`,
  `${PDTF1_ROUTES.concepts}/contexts/agent`,
  `${PDTF1_ROUTES.modelViews}/concept/agent/buyer`,
  `${PDTF1_ROUTES.schemaVerification}/coverage`,
  '/pdtf/Seller',
  '/spdtf/property-pack',
  '/spdtf/property-pack/definition-and-scope',
  '/spdtf/property-pack/contexts/estate-agency',
  '/spdtf/property-pack/validation',
  '/working-groups/join',
  '/working-groups/join/privacy',
  '/presentation/working-group-kickoff',
];

export function watchRuntime(page) {
  const errors = [];
  const criticalFailures = [];
  const criticalResourceTypes = ['document', 'script', 'stylesheet', 'font', 'image'];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    // Chromium emits a generic console error for failed resources. The response
    // and requestfailed listeners below record those with the URL and resource
    // type, so avoid a duplicate, unactionable failure here.
    if (message.text().startsWith('Failed to load resource:')) return;
    const source = message.location().url;
    errors.push(`console: ${message.text()}${source ? ` (${source})` : ''}`);
  });
  page.on('response', (response) => {
    const type = response.request().resourceType();
    if (criticalResourceTypes.includes(type) && response.status() >= 400) {
      criticalFailures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (criticalResourceTypes.includes(request.resourceType())) {
      criticalFailures.push(`${request.failure()?.errorText || 'request failed'} ${request.url()}`);
    }
  });
  return () => {
    assert.deepEqual(criticalFailures, [], criticalFailures.join('\n'));
    assert.deepEqual(errors, [], errors.join('\n'));
  };
}

export async function visit(page, path) {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  assert.ok(response, `no response for ${path}`);
  assert.equal(response.status(), 200, `${path} returned ${response.status()}`);
  await page.waitForTimeout(250);
  return response;
}

export async function settleVisualState(page) {
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts?.ready);

  // GraphDiagram boots lazily near the viewport. Visit every visible diagram
  // before a full-page screenshot so the receipt cannot race between a loading
  // placeholder and its completed SVG.
  const wrappers = page.locator('.graph-diagram-wrapper');
  for (let index = 0; index < await wrappers.count(); index += 1) {
    const wrapper = wrappers.nth(index);
    if (!await wrapper.isVisible()) continue;
    await wrapper.scrollIntoViewIfNeeded();
    await page.waitForFunction((position) => {
      const current = document.querySelectorAll('.graph-diagram-wrapper')[position];
      return current
        && !current.querySelector('.diagram-loading')
        && Boolean(current.querySelector('.gd-mermaid svg, .gd-empty, .diagram-fallback'));
    }, index, { timeout: 15_000 });
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

export async function assertNoBodyOverflow(page) {
  const overflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  assert.ok(
    overflow.documentWidth <= overflow.viewport + 1,
    `body overflow: ${JSON.stringify(overflow)}`,
  );
}
