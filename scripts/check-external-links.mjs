#!/usr/bin/env node
/**
 * External-URL 200 sweep (ADR-0044 Phase 8 — deferred sub-item).
 *
 * Companion to scripts/check-links.mjs (the fast, offline INTERNAL sweep).
 * This one crawls the built dist/ HTML, collects every external http(s):// link,
 * and performs a LIVE HTTP check of each unique URL (HEAD, falling back to a
 * ranged GET when HEAD is refused). 2xx/3xx = OK; 4xx/5xx + network/DNS/timeout
 * = FAIL.
 *
 * SCOPE / EXIT CODE — this is a maintenance/audit tool, NOT a deploy gate.
 * External sites flap, so the DEFAULT mode is REPORT-ONLY (always exit 0).
 * Failures are grouped by whether the referencing page is on the ADR-0044
 * surface (/ontology + /pdtf, excluding /ontology/tools + /ontology/artefacts)
 * vs elsewhere. Flags:
 *   --strict   exit 1 if any URL referenced from the ADR-0044 surface fails.
 *   --all      check ALL external URLs (default: still checks all, but only the
 *              onto-surface ones drive --strict; --all just widens what --strict
 *              would block on to the whole site).
 *   --json     dump the full results array as JSON to stdout (for tooling).
 *
 * Rate-limited: max 6 requests in flight, grouped/staggered per hostname so we
 * never hammer a single domain. Each request times out after 15s.
 *
 * Run: node scripts/check-external-links.mjs   (after `make build-data`)
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
if (!existsSync(DIST)) {
  console.error('[ext-links] dist/ not found — run `make build-data` first.');
  process.exit(1);
}

const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
const ALL = argv.includes('--all');
const JSON_OUT = argv.includes('--json');

// Tuning.
const CONCURRENCY = 6;        // max requests in flight, total
const PER_HOST_DELAY_MS = 300; // min gap between two hits to the same hostname
const TIMEOUT_MS = 15_000;     // per-request abort timeout
const USER_AGENT = 'opda-link-checker/1.0 (+https://opda.org.uk)';

// Skip-list: URLs that are not meant to 200 to an automated HEAD/GET, or are
// placeholders. Matched as substrings (case-insensitive) against the full URL.
// Edit freely — these are intentional non-failures, not real targets.
const SKIP = [
  'localhost',        // local dev references
  '127.0.0.1',        // local dev references
  '0.0.0.0',          // local dev references
  'example.com',      // RFC 2606 placeholder
  'example.org',      // RFC 2606 placeholder
  'example.net',      // RFC 2606 placeholder
];

// The ADR-0044 NATIVE surface this sweep cares about (mirrors check-links.mjs):
// the SPARQL-driven pages, excluding the ADR-0041 third-party tool renderings
// and the committed artefact bundles.
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

const skipped = (url) => SKIP.some((s) => url.toLowerCase().includes(s)) || /[{}]/.test(url);

// ── Collect external links, tracking onto-surface provenance ────────────────
// url → { url, onto, pages:Set<string> }
const links = new Map();
let pageCount = 0;

for (const file of htmlFiles(DIST)) {
  pageCount++;
  const html = readFileSync(file, 'utf8');
  const page = pageUrl(file);
  const onPage = isOnto(page);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    let link = m[1];
    if (!/^https?:\/\//.test(link)) continue; // protocol-relative + non-http handled elsewhere
    if (!links.has(link)) links.set(link, { url: link, onto: false, pages: new Set() });
    const rec = links.get(link);
    rec.pages.add(page);
    if (onPage) rec.onto = true;
  }
}

const all = [...links.values()];
const toCheck = all.filter((r) => !skipped(r.url));
const skipList = all.filter((r) => skipped(r.url));

// ── Live HTTP check with a ranged-GET fallback ──────────────────────────────
function hostOf(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

async function once(url, method) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers = { 'User-Agent': USER_AGENT };
    if (method === 'GET') headers['Range'] = 'bytes=0-0';
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: ctrl.signal,
      headers,
    });
    return { status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  try {
    let r = await once(url, 'HEAD');
    // Many servers refuse HEAD — retry with a ranged GET.
    if ([403, 405, 501].includes(r.status)) r = await once(url, 'GET');
    const ok = r.status >= 200 && r.status < 400;
    return { ok, status: r.status };
  } catch (head) {
    // HEAD threw (network/abort/etc) — give GET a chance before failing.
    try {
      const r = await once(url, 'GET');
      const ok = r.status >= 200 && r.status < 400;
      return { ok, status: r.status };
    } catch (get) {
      return { ok: false, status: 0, error: String(get?.cause?.code || get?.name || get?.message || get) };
    }
  }
}

// Concurrency-capped runner with a per-host stagger so we never hit one domain
// back-to-back. lastHit tracks the last dispatch time per hostname.
const lastHit = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runPool(items, worker) {
  const queue = [...items];
  const results = [];
  async function drain() {
    while (queue.length) {
      const item = queue.shift();
      const host = hostOf(item.url);
      const prev = lastHit.get(host) || 0;
      const wait = prev + PER_HOST_DELAY_MS - Date.now();
      if (wait > 0) await sleep(wait);
      lastHit.set(host, Date.now());
      results.push(await worker(item));
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, drain));
  return results;
}

const results = await runPool(toCheck, async (rec) => {
  const r = await check(rec.url);
  return { ...rec, ...r };
});

// ── Report ──────────────────────────────────────────────────────────────────
const okCount = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
const ontoFailed = failed.filter((r) => r.onto);
const otherFailed = failed.filter((r) => !r.onto);

if (JSON_OUT) {
  const dump = results.map((r) => ({ url: r.url, onto: r.onto, ok: r.ok, status: r.status, error: r.error, pages: [...r.pages] }));
  console.log(JSON.stringify(dump, null, 2));
}

console.log(`[ext-links] scanned ${pageCount} HTML pages`);
console.log(`[ext-links] ${results.length} external URLs · ${okCount} ok · ${failed.length} failed · ${skipList.length} skipped`);

if (otherFailed.length) {
  console.log(`\n[ext-links] off-scope failures (reported, not blocked): ${otherFailed.length}`);
  for (const r of otherFailed.slice(0, 80)) {
    console.log(`  ${r.status || r.error || 'ERR'}  ${r.url}`);
    console.log(`        ← ${[...r.pages].slice(0, 3).join(', ')}`);
  }
}

if (ontoFailed.length) {
  console.log(`\n[ext-links] ADR-0044 surface failures: ${ontoFailed.length}`);
  for (const r of ontoFailed) {
    console.log(`  ${r.status || r.error || 'ERR'}  ${r.url}`);
    console.log(`        ← ${[...r.pages].slice(0, 3).join(', ')}`);
  }
}

if (!failed.length) console.log(`\n[ext-links] PASS — every checked external URL returned 2xx/3xx.`);

// Exit code: report-only by default. --strict blocks on onto-surface failures
// (or all failures with --all).
if (STRICT) {
  const blocking = ALL ? failed : ontoFailed;
  if (blocking.length) {
    console.error(`\n[ext-links] FAIL (--strict) — ${blocking.length} external URL(s) failed${ALL ? '' : ' on the ADR-0044 surface'}.`);
    process.exit(1);
  }
}
process.exit(0);
