import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parse, parseFragment } from 'parse5';
import { canonicalPageUrl, createPageMetadata, inspectSeoContent, isSearchUtility, navigationBreadcrumbs, serialiseStructuredData } from '../src/lib/page-seo.mjs';
import { hasIndexableHead } from '../src/lib/sitemap-pages.mjs';
import { auditPageHead } from '../scripts/check-page-seo.mjs';

test('explicit descriptions are preserved and rendered summaries ignore shared/interactive content', () => {
  const html = `<nav><p>Navigation text must not become the description of every page.</p></nav>
    <form><p>Form instructions are not this page's main content or summary.</p></form>
    <aside><p>Technical audience. This repeated warning must not become every description.</p></aside>
    <p class="overline">A long eyebrow which is not the actual introduction to this subject.</p>
    <p hidden>Hidden text that must never become a search-engine description.</p>
    <p class="lead">Understand a property claim through its subject, evidence and stated scope.</p>`;
  assert.equal(inspectSeoContent(html, 'Claims').description, 'Understand a property claim through its subject, evidence and stated scope.');
  assert.equal(createPageMetadata({ title: 'Claims', description: 'An explicit, editorially chosen summary.', contentHtml: html, url: '/claims' }).description, 'An explicit, editorially chosen summary.');
});

test('record-only pages describe their own labelled data instead of generic site boilerplate', () => {
  const result = inspectSeoContent('<header><h1>AreaShape</h1><p class="term-iri">https://opda.org.uk/pdtf/shape/AreaShape</p></header><section><h2>Target</h2><dl><dt>Target class</dt><dd><code>Area</code></dd></dl><h2>Constraints · 3</h2></section>', 'AreaShape');
  assert.equal(result.description, 'AreaShape. Target class: Area. Constraints · 3.');
});

test('descriptions remain concise without splitting the final word', () => {
  const result = inspectSeoContent(`<p>${'A meaningful sentence about the model. '.repeat(20)}</p>`, 'Model');
  assert.ok(result.description.length <= 240);
  assert.match(result.description, /…$/u);
});

test('canonicals remove tracking/configuration but retain content-defining queries and IRI case', () => {
  assert.equal(canonicalPageUrl('http://localhost:4331/pdtf/class/LeaseTerm/?config&theme=dark&utm_source=email#target'), 'https://opda.org.uk/pdtf/class/LeaseTerm');
  assert.equal(canonicalPageUrl('/resource?path=source%2Fmodel.ttl&config'), 'https://opda.org.uk/resource?path=source%2Fmodel.ttl');
  assert.equal(canonicalPageUrl('/records?version=2&language=cy'), 'https://opda.org.uk/records?version=2&language=cy');
  assert.equal(canonicalPageUrl('/'), 'https://opda.org.uk/');
  assert.throws(() => canonicalPageUrl('javascript:alert(1)'), /HTTP/u);
});

test('query-driven utility shells are noindex, not canonicalised to unrelated empty content', () => {
  const result = createPageMetadata({ title: 'Resource', url: '/resource?path=source/model.ttl' });
  assert.equal(result.canonical, undefined);
  assert.equal(result.robots, 'noindex,follow');
  assert.deepEqual(result.structuredData, []);
  assert.ok(isSearchUtility('/ui/header-preview-controls/home'));
  assert.equal(isSearchUtility('/resources'), false);
  assert.equal(isSearchUtility('/pdtf/shape/AreaShape'), false);
});

test('homepage identity is minimal, grounded and never invented on other pages', () => {
  const result = createPageMetadata({ title: 'A shared language for property data · OPDA', url: '/' });
  assert.deepEqual(result.structuredData.map((item) => item['@type']), ['Organization', 'WebSite']);
  assert.equal(result.structuredData[0].name, 'Open Property Data Association');
  assert.equal(result.structuredData[0].url, 'https://openpropdata.org.uk/');
  assert.ok(existsSync(new URL(`../public${new URL(result.structuredData[0].logo).pathname}`, import.meta.url)));
  assert.equal(result.structuredData[1].url, 'https://opda.org.uk/');
  assert.equal(result.structuredData[0].sameAs, undefined);
  assert.deepEqual(createPageMetadata({ title: 'Programme', url: '/programme' }).structuredData, []);
});

test('breadcrumbs use supplied real navigation hierarchy, not URL segment labels', () => {
  const items = navigationBreadcrumbs({ pathname: '/modelling/odr/odr-0051', title: 'Reviewed mappings',
    destination: { title: 'Governance', url: '/governance' },
    found: { group: { heading: 'Decisions', url: '/governance/decisions' }, trail: [{ title: 'Ontology decisions', url: '/modelling/odr' }] } });
  assert.deepEqual(items.map((item) => item.name), ['Governance', 'Decisions', 'Ontology decisions', 'Reviewed mappings']);
  const data = createPageMetadata({ title: 'Reviewed mappings', url: '/modelling/odr/odr-0051', breadcrumbs: items }).structuredData[0];
  assert.equal(data['@type'], 'BreadcrumbList');
  assert.deepEqual(data.itemListElement.map((item) => item.position), [1, 2, 3, 4]);
  assert.equal(data.itemListElement.at(-1).item, 'https://opda.org.uk/modelling/odr/odr-0051');
  assert.deepEqual(navigationBreadcrumbs({ pathname: '/unknown', title: 'Unknown' }), []);
});

test('social cards use artwork from their own placement and a public URL', () => {
  const result = createPageMetadata({ title: 'Meaning', url: '/meaning', contentHtml: '<img data-campaign-image-light="/images/meaning-light.webp" data-campaign-image-dark="/images/meaning-dark.webp" alt="A specific comparison of meanings">' });
  assert.equal(result.image, 'https://opda.org.uk/images/meaning-light.webp');
  assert.equal(result.imageAlt, 'A specific comparison of meanings');
  assert.equal(createPageMetadata({ title: 'Nothing', url: '/nothing' }).image, undefined);
});

test('JSON-LD escapes script terminators while retaining exact parsed data', () => {
  const object = { name: '</script><script>alert("x")</script>&\u2028\u2029' };
  const output = serialiseStructuredData(object);
  assert.doesNotMatch(output, /<|>|&|\u2028|\u2029/u);
  assert.deepEqual(JSON.parse(output), object);
});

test('sitemap reads real head directives, not code examples or script strings', () => {
  assert.equal(hasIndexableHead('<html><head><meta name="robots" content="noindex, follow"></head></html>'), false);
  assert.equal(hasIndexableHead('<html><head><meta content="NONE" name="Googlebot"></head></html>'), false);
  assert.equal(hasIndexableHead('<html><head><meta http-equiv="refresh" content="0;url=/new"></head></html>'), false);
  assert.equal(hasIndexableHead('<html><head><script>const example = \'<meta name="robots" content="noindex">\';</script></head><body><pre>&lt;meta name="robots" content="noindex"&gt;</pre></body></html>'), true);
});

test('built-output audit rejects duplicate, missing and conflicting metadata', () => {
  const valid = '<html><head><title>Example</title><meta name="description" content="Specific description"><link rel="canonical" href="https://opda.org.uk/example"><meta property="og:title" content="Example"><meta property="og:description" content="Specific description"><meta property="og:url" content="https://opda.org.uk/example"></head><body><h1>Example</h1></body></html>';
  assert.deepEqual(auditPageHead('https://opda.org.uk/example', valid).failures, []);
  assert.ok(auditPageHead('https://opda.org.uk/example', valid.replace('</head>', '<title>Duplicate</title></head>')).failures.some((failure) => failure.startsWith('title:')));
  assert.ok(auditPageHead('https://opda.org.uk/other', valid).failures.some((failure) => failure.startsWith('canonical mismatch')));
  assert.ok(auditPageHead('https://opda.org.uk/example', valid.replace('</head>', '<meta name="robots" content="noindex"></head>')).failures.some((failure) => failure.includes('noindex')));
});

test('all four public page templates use the static shared head without duplicate metadata', () => {
  for (const file of ['src/layouts/Layout.astro', 'src/layouts/StandalonePublicLayout.astro', 'src/pages/index.astro', 'src/pages/presentation/working-group-kickoff.astro']) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /<SeoHead\b/u, file);
    assert.doesNotMatch(source.split('---').slice(2).join('---'), /<title>|<meta name="description"|<meta property="og:/u, file);
  }
  const component = readFileSync(new URL('../src/components/SeoHead.astro', import.meta.url), 'utf8');
  assert.doesNotMatch(component, /client:|<img|<iframe|application\/javascript/u);
});

test('header preview utilities share a lightweight noindex document outside their controls', () => {
  const wrapper = readFileSync(new URL('../src/layouts/UtilityDocument.astro', import.meta.url), 'utf8');
  assert.match(wrapper, /<!doctype html>[\s\S]*<html lang="en">/iu);
  assert.match(wrapper, /<head>[\s\S]*<meta charset="utf-8"[\s\S]*<meta name="viewport"/u);
  assert.match(wrapper, /<head>[\s\S]*<SeoHead\b[^>]*robots="noindex,follow"[^>]*canonical=\{null\}[^>]*\/>[\s\S]*<\/head>/u);
  assert.match(wrapper, /<body>\s*<slot\s*\/>\s*<\/body>/u);
  assert.doesNotMatch(wrapper, /<script\b|<style\b|<Header\b|<Footer\b|FontPreloads|ClientRouter|rel="stylesheet"/u);
  for (const route of ['home', 'join', 'kb']) {
    const source = readFileSync(new URL(`../src/pages/ui/header-preview-controls/${route}.astro`, import.meta.url), 'utf8');
    assert.match(source, /import UtilityDocument from '@\/layouts\/UtilityDocument\.astro'/u);
    assert.match(source, /<UtilityDocument\b[^>]*title="[^"]+"[^>]*description="[^"]+"[^>]*>\s*<HeaderPreviewControls\b[\s\S]*\/>\s*<\/UtilityDocument>/u);
    assert.doesNotMatch(source, /<meta\b|<title\b/u, 'page head must remain owned by the wrapper');
    const metadata = createPageMetadata({ title: `${route} header controls`, url: `/ui/header-preview-controls/${route}`, robots: 'noindex,follow', canonical: null });
    assert.equal(metadata.robots, 'noindex,follow');
    assert.equal(metadata.canonical, undefined);
    assert.deepEqual(metadata.structuredData, []);
  }
});

test('the actual lazy loader imports only controls, never the utility document head', async () => {
  const client = readFileSync(new URL('../public/ui/client.js', import.meta.url), 'utf8');
  const start = client.indexOf('async function loadHeaderPreviewControls(life) {');
  const end = client.indexOf('\n  function bindHeaderPreviewControls', start);
  assert.ok(start >= 0 && end > start);
  const walk = node => [node, ...(node.childNodes ?? []).flatMap(walk)];
  const attrs = node => Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
  const markup = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Header preview controls</title><meta name="robots" content="noindex,follow"></head><body><div data-header-preview-controls hidden><button data-header-preview-toggle>Controls</button><input type="range" value="27"></div></body></html>';
  assert.equal(hasIndexableHead(markup), false, 'direct utility response is noindex');
  let imported;
  const warnings = [];
  const parentHead = parse('<html><head><title>Public page</title><meta name="description" content="Public description"></head></html>');
  const originalHead = JSON.stringify(walk(parentHead).filter(node => node.tagName === 'meta' || node.tagName === 'title').map(node => ({ tag: node.tagName, attrs: node.attrs })));
  const placeholder = {
    getAttribute: name => name === 'data-controls-src' ? '/ui/header-preview-controls/kb' : null,
    replaceWith: node => { imported = node; },
  };
  const document = {
    head: parentHead,
    querySelectorAll: selector => selector === '[data-header-preview-controls-loader]' ? [placeholder] : [],
    contains: node => node === placeholder && !imported,
    createRange: () => ({ createContextualFragment: html => {
      // Range's initial document context parses HTML as a body fragment. Head
      // metadata becomes siblings, and must never be adopted with the controls.
      const context = walk(parse('<html><head></head><body></body></html>')).find(node => node.tagName === 'body');
      const fragment = parseFragment(context, html);
      return { querySelector: selector => {
        assert.equal(selector, '[data-header-preview-controls]');
        return walk(fragment).find(node => Object.hasOwn(attrs(node), 'data-header-preview-controls'));
      } };
    } }),
  };
  const load = vm.runInNewContext(`(${client.slice(start, end).trim()})`, {
    URL, document, window: { location: { href: 'https://opda.org.uk/programme?config' } },
    fetch: async () => ({ ok: true, text: async () => markup }),
    console: { warn: (...args) => warnings.push(args) },
  });
  await load({ active: true, signal: new AbortController().signal });
  assert.equal(warnings.length, 0);
  assert.equal(imported?.tagName, 'div');
  assert.ok(Object.hasOwn(attrs(imported), 'data-header-preview-controls'));
  assert.ok(walk(imported).some(node => node.tagName === 'input' && attrs(node).value === '27'));
  assert.ok(!walk(imported).some(node => ['html', 'head', 'body', 'meta', 'title', 'script', 'link'].includes(node.tagName)));
  assert.equal(JSON.stringify(walk(parentHead).filter(node => node.tagName === 'meta' || node.tagName === 'title').map(node => ({ tag: node.tagName, attrs: node.attrs }))), originalHead);
});
