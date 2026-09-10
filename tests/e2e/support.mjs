import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'parse5';
import { marketingDomains } from '../../src/data/marketing/domains.mjs';
import { PDTF1_ROUTES } from '../../src/lib/pdtf1-routes.mjs';
import { MODELLING_CHAPTERS } from '../../src/lib/modelling-navigation.ts';

export { PDTF1_ROUTES };

export const SEMANTIC_MODELLING_ROUTES = [
  '/semantic-modelling',
  ...MODELLING_CHAPTERS.map(({ url }) => url),
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
  '/programme',
  '/development',
  ...SEMANTIC_MODELLING_ROUTES,
  '/development/working-groups/estate-agency',
  '/development/working-groups/estate-agency/review',
  '/development/candidates',
  '/development/outputs',
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
  '/development/property-pack',
  '/development/property-pack/definition-and-scope',
  '/development/property-pack/contexts/estate-agency',
  '/development/property-pack/validation',
  '/join',
  '/join/privacy',
  '/presentation/working-group-kickoff',
];

const marketingPackIds = new Set(marketingDomains.map(({ id }) => id));

export function isScriptFreeEmailPreview(html) {
  const inspect = (node) => {
    if (['script', 'iframe', 'object', 'embed', 'base', 'form', 'link', 'template'].includes(node.tagName)) return false;
    for (const { name, value } of node.attrs ?? []) {
      if (/^on/iu.test(name) || name === 'srcdoc' || name === 'http-equiv') return false;
      if (['href', 'src'].includes(name) && /^(?:javascript|vbscript|data:text\/html):?/iu.test(value.replace(/[\s\x00-\x1f]/gu, ''))) return false;
    }
    return (node.childNodes ?? []).every(inspect);
  };
  return inspect(parse(html));
}

export function matchesScriptFreeEmailPreview(actual, expected) {
  return actual.equals(expected) && isScriptFreeEmailPreview(actual.toString('utf8'));
}

export function emailPreviewPath(url, origin) {
  try {
    const parsed = new URL(url);
    const match = /^\/marketing\/([^/]+)\/email\/member\.html$/u.exec(parsed.pathname);
    return parsed.origin === origin && !parsed.username && !parsed.password && !parsed.search && !parsed.hash && match
      && marketingPackIds.has(match[1]) ? parsed.pathname : null;
  } catch { return null; }
}

export function watchRuntime(page, { verifyEmailSandboxDiagnostics = false } = {}) {
  const errors = [];
  const criticalFailures = [];
  const previewResponses = new Map();
  const sandboxDiagnostics = [];
  const criticalResourceTypes = ['document', 'script', 'stylesheet', 'font', 'image'];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    // Chromium emits a generic console error for failed resources. The response
    // and requestfailed listeners below record those with the URL and resource
    // type, so avoid a duplicate, unactionable failure here.
    if (message.text().startsWith('Failed to load resource:')) return;
    const source = message.location().url;
    const sandbox = /^Blocked script execution in '([^']+)' because the document's frame is sandboxed and the 'allow-scripts' permission is not set\.$/u.exec(message.text());
    if (verifyEmailSandboxDiagnostics && sandbox?.[1] === source
      && emailPreviewPath(source, new URL(page.url()).origin)) {
      sandboxDiagnostics.push({ source, text: message.text() });
      return;
    }
    errors.push(`console: ${message.text()}${source ? ` (${source})` : ''}`);
  });
  page.on('response', (response) => {
    const type = response.request().resourceType();
    const preview = verifyEmailSandboxDiagnostics && emailPreviewPath(response.url(), new URL(page.url()).origin);
    if (preview && type === 'document' && response.status() === 200 && response.request().frame().parentFrame()
      && /^text\/html(?:;|$)/iu.test(response.headers()['content-type'] ?? '')) {
      const verified = response.body().then((body) => matchesScriptFreeEmailPreview(
        body, readFileSync(new URL(`../../public${preview}`, import.meta.url)),
      )).catch(() => false);
      const earlier = previewResponses.get(response.url()) ?? Promise.resolve(true);
      previewResponses.set(response.url(), Promise.all([earlier, verified]).then((results) => results.every(Boolean)));
    }
    if (criticalResourceTypes.includes(type) && response.status() >= 400) {
      criticalFailures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (criticalResourceTypes.includes(request.resourceType())) {
      criticalFailures.push(`${request.failure()?.errorText || 'request failed'} ${request.url()}`);
    }
  });
  const assertClean = () => {
    assert.deepEqual(criticalFailures, [], criticalFailures.join('\n'));
    assert.deepEqual(errors, [], errors.join('\n'));
  };
  if (!verifyEmailSandboxDiagnostics) return assertClean;
  return async () => {
    // Playwright's main-world trace script can be blocked even in an empty
    // sandbox (microsoft/playwright#33343). Recognise only this exact message
    // after verifying the actual HTTP body is our script-free preview. Keep
    // the production sandbox, tracing and every other runtime gate unchanged.
    for (const { source, text } of sandboxDiagnostics) {
      if (!await previewResponses.get(source)) errors.push(`console: ${text} (${source})`);
    }
    assertClean();
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
  const overflow = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders = [...document.body.querySelectorAll('*')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.classList.length ? `.${[...element.classList].join('.')}` : ''}`,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          scrollWidth: element.scrollWidth,
        };
      })
      .filter(({ left, right }) => left < -1 || right > viewport + 1)
      .sort((a, b) => Math.max(b.right - viewport, -b.left) - Math.max(a.right - viewport, -a.left))
      .slice(0, 12);
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewport,
      bodyWidth: document.body.scrollWidth,
      offenders,
    };
  });
  assert.ok(
    overflow.documentWidth <= overflow.viewport + 1,
    `body overflow: ${JSON.stringify(overflow)}`,
  );
}
