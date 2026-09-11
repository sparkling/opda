#!/usr/bin/env node
/** Audit delivered HTML in the sitemap; no browser or remote service required. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';
import { canonicalPageUrl, isSearchUtility } from '../src/lib/page-seo.mjs';
import { hasIndexableHead } from '../src/lib/sitemap-pages.mjs';

const attrsOf = (node) => Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
const textOf = (node) => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(textOf).join('');

export function auditPageHead(url, html) {
  const failures = [];
  const headHtml = html.slice(0, html.toLowerCase().indexOf('</head>') + 7);
  const document = parse(headHtml);
  const root = document.childNodes.find((node) => node.tagName === 'html');
  const head = root?.childNodes.find((node) => node.tagName === 'head');
  const children = head?.childNodes ?? [];
  const tags = (tag, key, value) => children.filter((node) => node.tagName === tag && (!key || attrsOf(node)[key] === value));
  const one = (nodes, label) => {
    if (nodes.length !== 1) failures.push(`${label}: expected one, found ${nodes.length}`);
    return nodes[0];
  };
  const titleNode = one(tags('title'), 'title');
  const title = titleNode ? textOf(titleNode).trim() : '';
  if (!title) failures.push('title is empty');
  const description = attrsOf(one(tags('meta', 'name', 'description'), 'description') ?? {}).content ?? '';
  if (!description.trim()) failures.push('description is empty');
  const canonical = attrsOf(one(tags('link', 'rel', 'canonical'), 'canonical') ?? {}).href;
  if (canonical !== canonicalPageUrl(url)) failures.push(`canonical mismatch: ${canonical ?? '(none)'}`);
  if (!hasIndexableHead(headHtml)) failures.push('sitemap contains a noindex or redirect page');
  if (isSearchUtility(url)) failures.push('sitemap contains a utility page');
  for (const [property, expected] of [['og:title', title], ['og:description', description], ['og:url', canonical]]) {
    const actual = attrsOf(one(tags('meta', 'property', property), property) ?? {}).content;
    if (actual !== expected) failures.push(`${property} does not match its page metadata`);
  }
  const structuredTypes = [];
  for (const script of tags('script', 'type', 'application/ld+json')) {
    try {
      const data = JSON.parse(textOf(script));
      structuredTypes.push(data['@type']);
      if (data['@context'] !== 'https://schema.org') failures.push('unexpected structured-data vocabulary');
      if (data['@type'] === 'BreadcrumbList') {
        const items = data.itemListElement ?? [];
        if (items.length < 2) failures.push('breadcrumb requires a real multi-level trail');
        for (const [index, item] of items.entries()) {
          if (item.position !== index + 1 || !item.name || !/^https:\/\//u.test(item.item ?? '')) failures.push('invalid breadcrumb item');
        }
        if (items.at(-1)?.item !== canonical) failures.push('breadcrumb does not finish on the current page');
      }
    } catch {
      failures.push('invalid structured-data JSON');
    }
  }
  if (new URL(url).pathname === '/' && !['Organization', 'WebSite'].every((type) => structuredTypes.includes(type))) {
    failures.push('homepage identity markup is incomplete');
  }
  return { failures, title, description, structuredTypes, hasSocialImage: tags('meta', 'property', 'og:image').length > 0 };
}

export function auditSiteSeo(directory) {
  const index = readFileSync(new URL('sitemap-index.xml', directory), 'utf8');
  const sitemaps = [...index.matchAll(/<loc>(.*?)<\/loc>/gu)].map(([, url]) => new URL(url).pathname.slice(1));
  const urls = sitemaps.flatMap((file) => [...readFileSync(new URL(file, directory), 'utf8').matchAll(/<loc>(.*?)<\/loc>/gu)].map(([, url]) => url));
  const failures = [];
  const types = {};
  const titles = new Map();
  let socialImages = 0;
  for (const url of urls) {
    const route = new URL(url).pathname.replace(/^\//u, '').replace(/\/+$/u, '');
    try {
      const html = readFileSync(new URL(route ? `${route}/index.html` : 'index.html', directory), 'utf8');
      const result = auditPageHead(url, html);
      failures.push(...result.failures.map((failure) => `${url}: ${failure}`));
      for (const type of result.structuredTypes) types[type] = (types[type] ?? 0) + 1;
      titles.set(result.title, (titles.get(result.title) ?? 0) + 1);
      if (result.hasSocialImage) socialImages += 1;
    } catch (error) {
      failures.push(`${url}: ${error.message}`);
    }
  }
  return { pages: urls.length, failures, structuredData: types, socialImages,
    repeatedTitles: [...titles.values()].filter((count) => count > 1).length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = pathToFileURL(`${resolve(process.argv[2] || 'dist')}/`);
  const audit = auditSiteSeo(directory);
  console.log(JSON.stringify(audit, null, 2));
  process.exitCode = audit.failures.length ? 1 : 0;
}
