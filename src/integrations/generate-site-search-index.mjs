/**
 * Generates the search corpus from rendered pages, rather than maintaining a
 * second catalogue beside the route generators. Every emitted HTML document
 * with a title becomes a search record.
 *
 * Production reads the finished static site after `astro build`. Development
 * enumerates the same routes (each page's own `getStaticPaths`), renders them
 * through the running dev server and serves the result at the same URL, so
 * both environments share one extractor, one schema and one corpus.
 *
 * Pages declare search metadata through Layout's `search` prop, emitted as
 * <meta name="opda:search-*"> tags; route-based defaults from the shared
 * model cover everything else. Editorial aliases merge in by URL.
 */
import { closeSync, existsSync, fstatSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLOBAL_DESTINATIONS, getActiveDestination } from '../lib/site-ia.mjs';
import {
  COLLECTIONS, DOMAINS, KINDS, PAGE_TYPES, RESULT_TYPES, STATUSES,
  SEARCH_ALIAS_META_NAME, SEARCH_INDEX_SCHEMA_VERSION, SEARCH_INDEX_URL, SEARCH_META_NAMES, optionFor,
} from '../lib/site-search-model.mjs';
import { SITE_SEARCH_ENTRIES, normaliseSearchRecord } from '../lib/site-search.mjs';

const INDEX_PATH = SEARCH_INDEX_URL.slice(1);
const EXCLUDED_ROUTES = new Set(['/404', '/resource', '/search']);
const SUMMARY_LIMIT = 240;
const DEV_CONCURRENCY = 6;
const SEARCHABLE_HTML_PREFIX_BYTES = 256 * 1024;
const ENTITY = { amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"' };
const META_FIELDS = new Map(SEARCH_META_NAMES.map(([field, name]) => [name, field]));
// `pageType` is schema-3 compatibility metadata, not a user-facing facet.
const VOCABULARIES = { type: RESULT_TYPES, collection: COLLECTIONS, kind: KINDS, domain: DOMAINS, pageType: PAGE_TYPES, status: STATUSES };
const destinationTitles = new Map(GLOBAL_DESTINATIONS.map(({ key, title }) => [key, title]));
const editorialAliases = new Map(SITE_SEARCH_ENTRIES.map(({ url, aliases }) => [url, aliases]));

function decodeHtml(value = '') {
  return value
    .replace(/&#(x[\da-f]+|\d+);/giu, (_match, code) => String.fromCodePoint(
      code.startsWith('x') ? Number.parseInt(code.slice(1), 16) : Number.parseInt(code, 10),
    ))
    .replace(/&([a-z]+);/giu, (_match, name) => ENTITY[name.toLowerCase()] ?? `&${name};`)
    .replace(/<[^>]*>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function attribute(tag, name) {
  const match = new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`, 'iu').exec(tag);
  return decodeHtml(match?.[1] ?? match?.[2] ?? '');
}

function firstTag(html, expression) {
  return expression.exec(html)?.[1] ?? '';
}

function walkHtml(directory, files = []) {
  for (const name of readdirSync(directory)) {
    const absolute = join(directory, name);
    const stat = statSync(absolute);
    if (stat.isDirectory()) walkHtml(absolute, files);
    else if (name === 'index.html') files.push(absolute);
  }
  return files;
}

function routeFor(directory, file) {
  const folder = relative(directory, file).replace(/\\/gu, '/').replace(/\/index\.html$/u, '');
  return folder ? `/${folder}` : '/';
}

/**
 * Search metadata, document titles and the first heading all occur near the
 * start of rendered pages. Reading only that prefix prevents large generated
 * ontology payloads and repeated client data from exhausting the build heap.
 */
function readSearchableHtml(file) {
  const descriptor = openSync(file, 'r');
  try {
    const length = Math.min(fstatSync(descriptor).size, SEARCHABLE_HTML_PREFIX_BYTES);
    const buffer = Buffer.allocUnsafe(length);
    const bytesRead = readSync(descriptor, buffer, 0, length, 0);
    return buffer.toString('utf8', 0, bytesRead);
  } finally {
    closeSync(descriptor);
  }
}

/** Collect every opda:search-* meta tag the page declared. */
function declaredMeta(html) {
  const declared = { aliases: [] };
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/giu)) {
    const name = attribute(tag, 'name');
    if (name === SEARCH_ALIAS_META_NAME) declared.aliases.push(attribute(tag, 'content'));
    else if (META_FIELDS.has(name)) declared[META_FIELDS.get(name)] = attribute(tag, 'content');
  }
  return declared;
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit).replace(/\s+\S*$/u, '');
  return `${cut}…`;
}

function warnUnknown(route, declared) {
  for (const [field, options] of Object.entries(VOCABULARIES)) {
    if (declared[field] && !optionFor(options, declared[field])) {
      console.warn(`[site-search] ${route} declares unknown ${field} "${declared[field]}"; using route defaults.`);
    }
  }
}

/** One extractor for both environments: a route plus its rendered HTML. */
function recordFromHtml(route, html) {
  if (EXCLUDED_ROUTES.has(route) || route.startsWith('/api/')) return null;
  const documentTitle = decodeHtml(firstTag(html, /<title[^>]*>([\s\S]*?)<\/title>/iu))
    .replace(/\s+·\s+(?:OPDA Knowledge Base|Open Property Data Association)$/u, '');
  const declared = declaredMeta(html);
  const title = declared.title || documentTitle;
  if (!title) return null;
  warnUnknown(route, declared);
  const descriptionTag = firstTag(html, /(<meta\b(?=[^>]*\bname=["']description["'])[^>]*>)/iu);
  const heading = decodeHtml(firstTag(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/iu));
  const canonical = normaliseSearchRecord({
    title,
    url: route,
    summary: truncate(attribute(descriptionTag, 'content') || heading, SUMMARY_LIMIT),
    identifier: declared.identifier,
    aliases: [...new Set([...declared.aliases, ...(editorialAliases.get(route) ?? [])])],
    type: declared.type,
    collection: declared.collection,
    kind: declared.kind,
    domain: declared.domain,
    pageType: declared.pageType,
    status: declared.status,
    context: declared.context,
    date: declared.date,
    area: destinationTitles.get(getActiveDestination(route)) ?? 'Resources',
  });
  return compact(canonical);
}

/** Emit only populated fields; the runtime normaliser restores the rest. */
function compact(record) {
  const output = {};
  for (const field of ['title', 'url', 'summary', 'identifier', 'aliases', 'type', 'collection', 'kind', 'domain', 'pageType', 'status', 'context', 'date', 'area']) {
    const value = record[field];
    if (Array.isArray(value) ? value.length : value) output[field] = value;
  }
  return output;
}

function payloadFor(records) {
  const unique = new Map(records.filter(Boolean).map((record) => [record.url, record]));
  const entries = [...unique.values()].sort((left, right) => left.title.localeCompare(right.title, 'en-GB'));
  const counts = Object.fromEntries(RESULT_TYPES.map(({ key }) => [key, entries.filter((record) => record.type === key).length]));
  return { schemaVersion: SEARCH_INDEX_SCHEMA_VERSION, generatedAt: new Date().toISOString(), counts, entries };
}

function describeCounts(payload) {
  return Object.entries(payload.counts).map(([key, count]) => `${key} ${count}`).join(', ');
}

function writeIndex(file, payload) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(payload)}\n`);
}

/** Static HTML copied verbatim from public/ (third-party tool output) is not a site page. */
function copiedPublicRoutes(root) {
  const publicDir = join(root, 'public');
  return new Set(existsSync(publicDir) ? walkHtml(publicDir).map((file) => routeFor(publicDir, file)) : []);
}

function generateIndex(directory, root) {
  const copied = copiedPublicRoutes(root);
  const payload = payloadFor(walkHtml(directory)
    .map((file) => [routeFor(directory, file), file])
    .filter(([route]) => !copied.has(route))
    .map(([route, file]) => recordFromHtml(route, readSearchableHtml(file))));
  writeIndex(join(directory, INDEX_PATH), payload);
  console.log(`[site-search] Indexed ${payload.entries.length} emitted pages (${describeCounts(payload)}) → ${INDEX_PATH}`);
}

/**
 * Expand every user page route exactly as the build would, through each page's
 * own getStaticPaths. Only project-origin page routes qualify: Astro's internal
 * routes (for example /_server-islands/[name]) and injected or external routes
 * have no source page to render. `route.generate` always needs a params object;
 * Astro's sanitiser calls Object.entries on it.
 */
async function devRoutes(server, routes, root) {
  const paths = [];
  for (const route of routes) {
    if (route.type !== 'page' || route.origin !== 'project' || !route.entrypoint) continue;
    try {
      if (!(route.params ?? []).length) { paths.push(route.generate({})); continue; }
      const mod = await server.ssrLoadModule(join(root, route.entrypoint));
      const staticPaths = typeof mod.getStaticPaths === 'function'
        ? await mod.getStaticPaths({ routePattern: route.pattern })
        : [];
      if (!Array.isArray(staticPaths)) throw new TypeError('getStaticPaths did not return an array');
      for (const entry of staticPaths) {
        if (entry?.params && typeof entry.params === 'object') paths.push(route.generate(entry.params));
      }
    } catch (error) {
      console.warn(`[site-search] Could not enumerate ${route.pattern}: ${error instanceof Error ? error.message : error}`);
    }
  }
  return [...new Set(paths.filter((path) => typeof path === 'string' && path.startsWith('/'))
    .map((path) => (path === '/' ? path : path.replace(/\/+$/u, ''))))];
}

/** Render every dev route through the live server and run the shared extractor over the HTML. */
async function crawlDevIndex(server, routes, root, origin) {
  const started = Date.now();
  const paths = (await devRoutes(server, routes, root)).filter((path) => !EXCLUDED_ROUTES.has(path));
  const records = [];
  let failures = 0;
  let cursor = 0;
  async function worker() {
    while (cursor < paths.length) {
      const path = paths[cursor++];
      try {
        const response = await fetch(new URL(path, origin), { headers: { Accept: 'text/html' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        records.push(recordFromHtml(path, await response.text()));
      } catch (error) {
        failures += 1;
        console.warn(`[site-search] Skipped ${path}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  await Promise.all(Array.from({ length: DEV_CONCURRENCY }, worker));
  const payload = payloadFor(records);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`[site-search] Dev index ready: ${payload.entries.length} pages (${describeCounts(payload)}) in ${seconds}s${failures ? `, ${failures} skipped` : ''}.`);
  return payload;
}

function readCachedIndex(file) {
  try {
    if (!existsSync(file)) return null;
    const payload = JSON.parse(readFileSync(file, 'utf8'));
    return payload?.schemaVersion === SEARCH_INDEX_SCHEMA_VERSION && Array.isArray(payload.entries) ? payload : null;
  } catch {
    return null;
  }
}

export function siteSearchIndexGenerator() {
  let root = process.cwd();
  let cacheFile = join(root, 'node_modules', '.astro', INDEX_PATH);
  let routes = [];
  let server;
  let index = null;
  let pending = null;
  return {
    name: 'opda-site-search-index',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(config.root);
        cacheFile = join(fileURLToPath(config.cacheDir), INDEX_PATH);
      },
      'astro:routes:resolved': ({ routes: resolved }) => { routes = resolved; },
      'astro:server:setup': ({ server: devServer }) => {
        server = devServer;
        index = readCachedIndex(cacheFile);
        devServer.middlewares.use(async (request, response, next) => {
          if ((request.url ?? '').split('?', 1)[0] !== SEARCH_INDEX_URL) return next();
          const payload = index ?? await pending;
          if (!payload) { response.statusCode = 503; response.end(); return; }
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.setHeader('Cache-Control', 'no-cache');
          response.end(JSON.stringify(payload));
        });
      },
      'astro:server:start': ({ address }) => {
        if (!server) return;
        const host = address.family === 'IPv6' ? `[${address.address}]` : address.address;
        const origin = `http://${host}:${address.port}`;
        if (index) console.log(`[site-search] Serving cached dev index (${index.entries.length} pages) while refreshing.`);
        pending = crawlDevIndex(server, routes, root, origin)
          .then((payload) => {
            index = payload;
            writeIndex(cacheFile, payload);
            return payload;
          })
          .catch((error) => {
            console.warn(`[site-search] Dev index failed: ${error instanceof Error ? error.message : error}`);
            return index;
          });
      },
      'astro:build:done': ({ dir }) => generateIndex(fileURLToPath(dir), root),
    },
  };
}
