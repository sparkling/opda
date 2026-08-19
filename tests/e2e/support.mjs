import assert from 'node:assert/strict';

export const ROUTES = [
  '/',
  '/home',
  '/programme',
  '/spdtf-2',
  '/spdtf-2/ontologies',
  '/spdtf-2/ontologies/standards',
  '/spdtf-2/working-groups/estate-agency',
  '/spdtf-2/working-groups/estate-agency/review',
  '/spdtf-2/candidates',
  '/spdtf-2/outputs',
  '/pdtf-1',
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
  '/pdtf/Seller',
  '/v2/validation',
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

  // GraphDiagram boots lazily near the viewport. A screenshot must observe the
  // completed SVG, not race the loading placeholder or fallback-font layout.
  await page.waitForFunction(() => [...document.querySelectorAll('.graph-diagram-wrapper')]
    .filter((wrapper) => {
      const rect = wrapper.getBoundingClientRect();
      return rect.width > 0 && rect.top < window.innerHeight + 300 && rect.bottom > -300;
    })
    .every((wrapper) => (
      !wrapper.querySelector('.diagram-loading')
      && Boolean(wrapper.querySelector('.gd-mermaid svg, .gd-empty, .diagram-fallback'))
    )), undefined, { timeout: 15_000 });

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
