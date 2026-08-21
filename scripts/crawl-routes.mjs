#!/usr/bin/env node
/** Offline crawl of emitted resources and application-owned navigation. */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { parse } from 'parse5';

import { isExpectedOntologyAssetUrl } from '../src/lib/ontology-publication-assets.ts';

const DIST = resolve(process.cwd(), process.env.DIST_DIR || 'dist');
if (!existsSync(DIST)) {
  console.error('[routes] dist/ not found — run `make build` or `make build-data` first.');
  process.exit(1);
}

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

function* resourceAttributes(node) {
  for (const attribute of node.attrs || []) {
    if (['href', 'src', 'action', 'poster'].includes(attribute.name)) yield attribute;
    if (attribute.name === 'srcset') {
      for (const candidate of attribute.value.split(',')) {
        const value = candidate.trim().split(/\s+/u)[0];
        if (value) yield { name: 'srcset', value };
      }
    }
  }
  for (const child of node.childNodes || []) yield* resourceAttributes(child);
  if (node.content) yield* resourceAttributes(node.content);
}

const emitted = [...files(DIST)];
const emittedSet = new Set(emitted.map((path) => resolve(path)));
const html = emitted.filter((path) => path.endsWith('.html'));
const routeFiles = html.filter((path) => path.endsWith(`${sep}index.html`) || path === join(DIST, 'index.html'));
const ontologyModel = JSON.parse(readFileSync(resolve(process.cwd(), 'src/data/ontology-model.json'), 'utf8'));
const ontologyResourceIds = new Set([
  'classes', 'objectProperties', 'datatypeProperties', 'shapes', 'concepts', 'schemes',
].flatMap((group) => Object.values(ontologyModel[group] || {}).map((resource) => resource.id)));
const ontologyCaseGroups = new Map();
for (const id of ontologyResourceIds) {
  const folded = id.toLocaleLowerCase('en-GB');
  ontologyCaseGroups.set(folded, [...(ontologyCaseGroups.get(folded) || []), id]);
}
const localCaseCollisions = new Set();
const runtimePrefixes = ['/_auth', '/api', '/comments'];
const isRuntime = (path) => runtimePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
// Generated source projections and vendored documentation bundles preserve
// documentary repository links that are verified by focused doc/ontology
// gates. Their pages and local assets are still crawled here; only unresolved
// hrefs and fragments inside those documentary projections are delegated.
const bundlePrefixes = [
  '/pdtf-1/extracted-ontology/use-and-tooling/tools/',
  '/pdtf-1/extracted-ontology/use-and-tooling/artefacts/',
];
const isBundle = (path) => bundlePrefixes.some((prefix) => path.startsWith(prefix));
// Ontospy's vendored Bootswatch source tree includes upstream theme demo HTML
// whose relative examples were never part of the generated OPDA documentation.
// Exclude those fixtures only; actual Ontospy/artefact pages and every emitted
// CSS, script, image and font resource remain in the crawl.
const vendorFixturePrefixes = [
  '/pdtf-1/extracted-ontology/use-and-tooling/tools/ontospy/static/libs/',
];
const isVendorFixture = (path) => vendorFixturePrefixes.some((prefix) => path.startsWith(prefix));
// Generated reference projections retain links to their repository source
// graph (ADRs, ODRs, TTL, Markdown and code). Those are verified by their
// existing focused doc/ontology gates; this crawl still checks every emitted
// script/style/image on those pages and application navigation everywhere else.
const sourceProjectionPrefixes = [
  '/modelling/adr/', '/modelling/odr/',
  '/pdtf-1/extracted-ontology/model-views-by-audience/',
  '/pdtf-1/extracted-ontology/lineage-provenance-and-verification/schema-to-ontology-verification/',
  '/pdtf-1/extracted-ontology/concepts-and-architecture/contexts/',
];
const isSourceProjection = (path) => sourceProjectionPrefixes
  .some((prefix) => path.startsWith(prefix));
const isRedirect = (source) => /<meta\s+http-equiv=["']refresh["']/iu.test(source)
  && /<meta\s+name=["']robots["'][^>]+content=["']noindex["']/iu.test(source);

function pageUrl(file) {
  const rel = relative(DIST, file).replaceAll(sep, '/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/\/index\.html$/u, '').replace(/\.html$/u, '')}`;
}

function fileUrl(file) {
  return `/${relative(DIST, file).replaceAll(sep, '/')}`;
}

const documentIdCache = new Map();
function documentIds(file) {
  if (documentIdCache.has(file)) return documentIdCache.get(file);
  const ids = new Set();
  function visit(node) {
    for (const attribute of node.attrs || []) {
      if (attribute.name === 'id' || attribute.name === 'name') ids.add(attribute.value);
    }
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  }
  visit(parse(readFileSync(file, 'utf8')));
  documentIdCache.set(file, ids);
  return ids;
}

function targetFile(pathname) {
  let clean;
  try { clean = decodeURIComponent(pathname).replace(/\/$/u, ''); } catch { return null; }
  const relativePath = clean.replace(/^\//u, '');
  const candidates = clean === ''
    ? [join(DIST, 'index.html')]
    : [join(DIST, relativePath), join(DIST, relativePath, 'index.html'), join(DIST, `${relativePath}.html`)];
  for (const candidate of candidates) {
    const absolute = resolve(candidate);
    if (absolute === DIST || absolute.startsWith(`${DIST}${sep}`)) {
      if (emittedSet.has(absolute) && statSync(absolute).isFile()) return absolute;
      // A case-insensitive development filesystem cannot emit both resources
      // when their canonical ontology IDs differ only by case (for example,
      // LeaseTerm and leaseTerm). Accept that local alias only when both exact
      // IDs are declared in the ontology model. Linux CI remains fail-closed
      // because the wrong-case path does not exist there.
      const pdtfMatch = clean.match(/^\/pdtf\/(.+?)(?:\.ttl)?$/u);
      const id = pdtfMatch?.[1];
      const caseGroup = id && ontologyCaseGroups.get(id.toLocaleLowerCase('en-GB'));
      if (id && ontologyResourceIds.has(id) && caseGroup?.some((other) => other !== id)
        && existsSync(absolute) && statSync(absolute).isFile()) {
        localCaseCollisions.add(`${id} ⇄ ${caseGroup.filter((other) => other !== id).join(', ')}`);
        return absolute;
      }
    }
  }
  return null;
}

const failures = [];
const seenTargets = new Set();
for (const file of html) {
  const source = readFileSync(file, 'utf8');
  const page = pageUrl(file);
  if (isVendorFixture(page)) continue;
  const document = parse(source);
  for (const { name: attribute, value: raw } of resourceAttributes(document)) {
    if (/^(?:data:|javascript:|mailto:|tel:|https?:|\/\/)/iu.test(raw)) continue;
    const documentaryHref = attribute === 'href' && (isSourceProjection(page) || isBundle(page));
    let url;
    try { url = new URL(raw, `https://opda.invalid${fileUrl(file)}`); } catch {
      failures.push(`${page} invalid URL ${raw}`);
      continue;
    }
    if (url.origin !== 'https://opda.invalid' || isRuntime(url.pathname)) continue;
    const target = targetFile(url.pathname);
    if (!target) {
      if (!documentaryHref && !isExpectedOntologyAssetUrl(url.pathname)) {
        failures.push(`${page} → ${raw}`);
      }
    }
    else {
      seenTargets.add(target);
      if (!documentaryHref && url.hash && target.endsWith('.html')) {
        let fragment;
        try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { fragment = null; }
        if (!fragment || !documentIds(target).has(fragment)) {
          failures.push(`${page} → ${raw} (missing fragment)`);
        }
      }
    }
  }
}

for (const file of emitted.filter((path) => path.endsWith('.css'))) {
  const source = readFileSync(file, 'utf8');
  const resourcePattern = /url\(\s*(['"]?)(.*?)\1\s*\)/gu;
  for (const match of source.matchAll(resourcePattern)) {
    const raw = match[2].trim();
    if (!raw || /^(?:data:|#|https?:|\/\/)/iu.test(raw)) continue;
    let url;
    try { url = new URL(raw, `https://opda.invalid${fileUrl(file)}`); } catch {
      failures.push(`${fileUrl(file)} invalid CSS URL ${raw}`);
      continue;
    }
    if (url.origin === 'https://opda.invalid' && !targetFile(url.pathname)) {
      failures.push(`${fileUrl(file)} → ${raw}`);
    }
  }
}

const orphanRoutes = routeFiles
  .filter((file) => file !== join(DIST, 'index.html')
    && !isBundle(pageUrl(file))
    && !isRedirect(readFileSync(file, 'utf8'))
    && !seenTargets.has(resolve(file)))
  .map(pageUrl);
console.log(`[routes] scanned ${html.length} HTML files and ${emitted.length} emitted files`);
console.log(`[routes] unresolved internal resources: ${failures.length}`);
console.log(`[routes] unlinked emitted routes: ${orphanRoutes.length}`);
for (const collision of localCaseCollisions) {
  console.warn(`  local case-insensitive alias: ${collision} (exact paths required in Linux CI)`);
}
for (const failure of failures.slice(0, 100)) console.error(`  broken: ${failure}`);
for (const orphan of orphanRoutes.slice(0, 100)) console.error(`  orphan: ${orphan}`);
if (failures.length || orphanRoutes.length) process.exit(1);
console.log('[routes] PASS — emitted resources and application-owned navigation resolve.');
