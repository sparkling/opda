import assert from 'node:assert/strict';

export const SEMANTIC_MODELLING_ROUTES = [
  '/spdtf-2/ontologies',
  '/spdtf-2/ontologies/why-ontologies',
  '/spdtf-2/ontologies/reading-the-model',
  '/spdtf-2/ontologies/modelling-method',
  '/spdtf-2/ontologies/semantic-package',
  '/spdtf-2/ontologies/bounded-contexts',
  '/spdtf-2/ontologies/modelling-rules',
  '/spdtf-2/ontologies/coverage',
  '/spdtf-2/ontologies/standards',
  '/spdtf-2/ontologies/evidence-and-mappings',
  '/spdtf-2/ontologies/validation',
];

export const PDTF_ONTOLOGY_CATEGORY_ROUTES = [
  '/ontology',
  '/ontology/lineage-and-verification',
  '/ontology/concepts-and-architecture',
  '/ontology/contexts',
  '/ontology/terms-and-model-resources',
  '/ontology/validation-and-examples',
  '/ontology/trust-and-governance',
  '/ontology/use-and-tooling',
];

export const ROUTES = [
  '/',
  '/home',
  '/programme',
  '/spdtf-2',
  ...SEMANTIC_MODELLING_ROUTES,
  '/spdtf-2/working-groups/estate-agency',
  '/spdtf-2/working-groups/estate-agency/review',
  '/spdtf-2/candidates',
  '/spdtf-2/outputs',
  '/pdtf-1',
  '/pdtf-1/original-standard',
  ...PDTF_ONTOLOGY_CATEGORY_ROUTES,
  '/governance',
  '/resources',
  '/search?q=PDTF',
  '/design-system',
  '/strategy/strategy-overview',
  '/governance/data-security',
  '/governance/data-stewardship',
  '/modelling/data-dictionary',
  '/modelling/business-glossary',
  '/modelling/overlays',
  '/schema',
  '/schema/legal-estate/ownership/leasehold/lease-legal/building-safety',
  '/ontology/graph',
  '/ontology/classes',
  '/ontology/context/agent',
  '/model/concept/agent/buyer',
  '/mapping/coverage',
  '/pdtf/Seller',
  '/spdtf-2/property-pack',
  '/spdtf-2/property-pack/definition-and-scope',
  '/spdtf-2/property-pack/contexts/estate-agency',
  '/spdtf-2/property-pack/validation',
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
