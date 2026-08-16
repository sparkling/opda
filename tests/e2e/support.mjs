import assert from 'node:assert/strict';

export const ROUTES = [
  '/',
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
