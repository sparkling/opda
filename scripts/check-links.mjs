#!/usr/bin/env node
/**
 * Link-validation sweep (ADR-0044 Phase 8).
 *
 * Crawls the built dist/ HTML and checks every site-absolute internal link
 * (href / src) resolves to an emitted page or asset — directory-format
 * (foo → foo/index.html), file-format (foo.html), or a static file (foo.ttl,
 * /ui/*.css, …).
 *
 * BLOCKING scope = the ADR-0044 surface (/ontology + /pdtf): a dangling link
 * from one of those pages, a broken link *to* one of them, or an orphan among
 * them fails the gate (exit 1). Links to genuinely non-static runtime routes
 * (Lambda@Edge auth, the resource viewer) are allow-listed. Dangling/orphans
 * elsewhere on the site (other ADRs' concerns — /manual redirects, the 404
 * page's links, …) are REPORTED, not blocked.
 *
 * Run: node scripts/check-links.mjs   (after `make build-data`)
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
if (!existsSync(DIST)) {
  console.error('[links] dist/ not found — run `make build-data` first.');
  process.exit(1);
}

// Valid routes that are intentionally NOT static files (served at the CDN/edge).
const ALLOW = ['/_auth/', '/resource'];
const isAllowed = (p) => ALLOW.some((a) => p.startsWith(a));
// The ADR-0044 NATIVE surface this gate is responsible for: the SPARQL-driven
// pages. Excludes the ADR-0041 third-party tool renderings (/ontology/tools/*)
// and committed artefact bundles (/ontology/artefacts/*) — version-pinned HTML
// with their own internal relative-link navigation, not native pages.
const isOnto = (u) =>
  (u.startsWith('/ontology') || u.startsWith('/pdtf')) &&
  !u.startsWith('/ontology/tools') && !u.startsWith('/ontology/artefacts');

function* htmlFiles(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

const pageUrl = (file) =>
  '/' + file.slice(DIST.length + 1).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');

function resolvesTo(linkPath) {
  const p = decodeURIComponent(linkPath.replace(/[?#].*$/, ''));
  if (p === '' || p === '/') return existsSync(join(DIST, 'index.html'));
  const base = join(DIST, p.replace(/^\//, ''));
  try {
    if (existsSync(base) && statSync(base).isFile()) return true;
    if (existsSync(base + '.html')) return true;
    if (existsSync(join(base, 'index.html'))) return true;
  } catch { /* ignore */ }
  return false;
}

const dangling = [];
const externals = new Set();
const linkedTargets = new Set();
let pageCount = 0;

for (const file of htmlFiles(DIST)) {
  pageCount++;
  const html = readFileSync(file, 'utf8');
  const page = pageUrl(file);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const link = m[1];
    if (/^(https?:)?\/\//.test(link)) { externals.add(link); continue; }
    if (/^(mailto:|tel:|javascript:|data:|#)/.test(link)) continue;
    if (!link.startsWith('/')) continue;
    if (isAllowed(link)) continue;
    const target = decodeURIComponent(link.replace(/[?#].*$/, '')).replace(/\/$/, '');
    linkedTargets.add(target);
    if (!resolvesTo(link)) dangling.push({ page, link, onto: isOnto(page) || isOnto(target) });
  }
}

const orphans = [];
for (const file of htmlFiles(DIST)) {
  const url = pageUrl(file);
  if (url === '' || url === '/') continue;
  if (!linkedTargets.has(url) && !linkedTargets.has(url + '/')) orphans.push(url);
}
const ontoDangling = [...new Map(dangling.filter((d) => d.onto).map((d) => [d.page + '|' + d.link, d])).values()];
const otherDangling = dangling.filter((d) => !d.onto);
const ontoOrphans = orphans.filter(isOnto);
const otherOrphans = orphans.filter((o) => !isOnto(o));

console.log(`[links] scanned ${pageCount} HTML pages · ${externals.size} external links referenced`);
console.log(`[links] off-scope (reported, not blocked): ${otherDangling.length} dangling · ${otherOrphans.length} orphan pages`);
console.log(`[links] ADR-0044 surface: ${ontoDangling.length} dangling · ${ontoOrphans.length} orphan`);

if (ontoDangling.length || ontoOrphans.length) {
  console.error(`\n[links] FAIL — broken links on the ADR-0044 (/ontology · /pdtf) surface:`);
  for (const d of ontoDangling.slice(0, 80)) console.error(`  dangling: ${d.page}  →  ${d.link}`);
  for (const o of ontoOrphans.slice(0, 80)) console.error(`  orphan:   ${o}`);
  process.exit(1);
}
console.log(`\n[links] PASS — the /ontology + /pdtf surface has no dangling links and no orphan pages.`);
process.exit(0);
