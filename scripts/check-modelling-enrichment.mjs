/** Check the built documentation, without launching a browser or a server. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'parse5';
import { MODELLING_CHAPTERS } from '../src/lib/modelling-navigation.ts';

const output = resolve('dist');
const routes = ['/semantic-modelling', ...MODELLING_CHAPTERS.map(({ url }) => url)];
const walk = (node) => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const text = (node) => walk(node).filter((item) => item.nodeName === '#text').map((item) => item.value).join('').trim();
const cache = new Map();
function documentFor(route) {
  if (!cache.has(route)) {
    const file = join(output, route.slice(1), 'index.html');
    assert.ok(existsSync(file), `Missing built route: ${route}`);
    cache.set(route, walk(parse(readFileSync(file, 'utf8'))));
  }
  return cache.get(route);
}

let links = 0;
let diagrams = 0;
let illustrations = 0;
const judgementKinds = new Set();
for (const route of routes) {
  const nodes = documentFor(route);
  const article = nodes.find((node) => attr(node, 'class')?.split(/\s/u)
    .some((name) => ['modelling-document', 'ontology-chapter'].includes(name)));
  assert.ok(article, `Missing shared article: ${route}`);
  const content = walk(article);
  assert.equal(content.filter((node) => node.tagName === 'h1').length, 1, `Page title count: ${route}`);
  assert.equal(content.filter((node) => node.tagName === 'details').length, 0, `Hidden teaching content: ${route}`);
  const articleIds = content.map((node) => attr(node, 'id')).filter(Boolean);
  assert.equal(articleIds.length, new Set(articleIds).size, `${route}: duplicate article IDs`);
  for (const node of content) {
    const judgementKind = attr(node, 'data-judgement-diagram');
    if (judgementKind) {
      judgementKinds.add(judgementKind);
      assert.equal(node.tagName, 'figure');
      const parts = walk(node);
      assert.ok(parts.some((part) => part.tagName === 'figcaption' && text(part)), `${route}: missing caption`);
      assert.ok(parts.some((part) => attr(part, 'class') === 'judgement-equivalent' && text(part).length > 100),
        `${route}: missing complete responsive text equivalent`);
      assert.equal(parts.filter((part) => part.tagName === 'figure').length, 1, `${route}: nested diagram figure`);
    }
    const href = attr(node, 'href');
    if (node.tagName === 'a' && href && /^\/(?!\/)|^#/u.test(href)) {
      const target = new URL(href, 'https://local.invalid' + route);
      const path = target.pathname.replace(/\/$/u, '') || '/';
      if (/\.[a-z0-9]+$/iu.test(path)) {
        assert.ok(existsSync(join(output, path.slice(1))), `${route}: missing asset ${href}`);
      } else {
        const targetNodes = documentFor(path);
        if (target.hash) {
          const id = decodeURIComponent(target.hash.slice(1));
          assert.ok(targetNodes.some((item) => attr(item, 'id') === id), `${route}: missing anchor ${href}`);
        }
      }
      links++;
    }
    if (node.tagName === 'svg' && /^(enrichment|judgement)-/u.test(attr(node, 'aria-labelledby') ?? '')) {
      const children = walk(node);
      assert.match(attr(node, 'viewBox'), /^0 0 960 \d+$/u);
      assert.equal(attr(node, 'role'), 'img');
      for (const id of attr(node, 'aria-labelledby').split(' ')) {
        const target = children.find((item) => attr(item, 'id') === id);
        assert.ok(target && text(target), `${route}: empty accessible SVG description ${id}`);
      }
      const ids = children.map((item) => attr(item, 'id')).filter(Boolean);
      assert.equal(ids.length, new Set(ids).size, `${route}: duplicated SVG identifier`);
      for (const child of children) {
        const marker = attr(child, 'marker-end')?.match(/^url\(#(.+)\)$/u)?.[1];
        if (marker) assert.ok(ids.includes(marker), `${route}: unresolved arrow marker`);
      }
      diagrams++;
    }
    if (node.tagName === 'img' && /^\/images\/modelling\/(enrichment|judgement)\//u.test(attr(node, 'src') ?? '')) {
      const decorative = attr(node, 'src').includes('/judgement/');
      if (decorative) {
        assert.equal(attr(node, 'alt'), '');
        assert.ok(content.some((part) => attr(part, 'aria-hidden') === 'true' && walk(part).includes(node)),
          `${route}: decorative cover needs an explicit accessibility boundary`);
      } else assert.ok(attr(node, 'alt')?.length > 30, `${route}: missing illustration description`);
      for (const name of ['src', 'data-campaign-image-dark']) {
        const path = attr(node, name);
        assert.ok(path && existsSync(join(output, path.slice(1))), `${route}: missing ${name} image`);
      }
      assert.equal(attr(node, 'width'), '2172');
      assert.equal(attr(node, 'height'), '724');
      illustrations++;
    }
  }
}
const authoredKinds = readdirSync('docs/working/modelling-judgement')
  .filter((file) => file.endsWith('.html')).map((file) => file.slice(0, -5));
assert.deepEqual([...judgementKinds].sort(), authoredKinds.sort(), 'Every authored judgement diagram must appear in the course');
assert.ok(illustrations > 0, 'Missing paired illustrations');
console.log(`PASS: ${routes.length} routes, ${links} local links/anchors, ${diagrams} accessible diagrams (${judgementKinds.size} new designs), ${illustrations} paired illustrations. Browser rendering not assessed.`);
