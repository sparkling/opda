/**
 * Leaf-path -> {url, anchor} lookup over the committed /schema/*.astro pages
 * (2026-07-06 — replaces an earlier data-dictionary ?q= search-based link,
 * which was too imprecise for domain-less/shared properties: the dictionary
 * indexes ONE canonical example path per property name, not every real
 * occurrence, so a search on a bare field name could resolve to the wrong
 * occurrence entirely — confirmed directly with opda:documentDate, which
 * has two genuinely different real occurrences in the schema).
 *
 * The /schema pages themselves are generated (scripts/build-schema-pages.py)
 * from theme-map.yaml + provenance-map.yaml, but their OUTPUT is committed —
 * every leaf row already carries `data-leaf-path="{full.dotted.path}"`, and
 * every containing object already carries a real `id="..."` anchor. Scanning
 * the committed HTML directly sidesteps re-deriving the page-routing +
 * anchor-slug rules (theme-map.yaml's prefix matching, PAGE_ORDER, the
 * singularising short_for() slug algorithm) — this reads the pipeline's own
 * final, authoritative output instead of trying to reproduce it.
 */
import fs from 'node:fs';
import path from 'node:path';

const SCHEMA_DIR = path.resolve(process.cwd(), 'src/pages/schema');

function walkAstroFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkAstroFiles(full));
    else if (entry.name.endsWith('.astro')) out.push(full);
  }
  return out;
}

function urlForFile(file: string): string {
  let rel = path.relative(SCHEMA_DIR, file).replace(/\\/g, '/').replace(/\.astro$/, '');
  rel = rel.replace(/(^|\/)index$/, '');
  return '/schema' + (rel ? '/' + rel : '');
}

export interface SchemaAnchor {
  url: string;
  anchor: string | null;
}

let cachedLeaves: Record<string, SchemaAnchor> | null = null;
let cachedContainers: Record<string, SchemaAnchor> | null = null;

function buildIndexes(): void {
  const leaves: Record<string, SchemaAnchor> = {};
  const containers: Record<string, SchemaAnchor> = {};
  // id="..." and data-leaf-path="..." matched together, in document order, so
  // "nearest preceding id" can be tracked with a single left-to-right pass —
  // the same physical-proximity principle the generator itself relies on to
  // group a leaf row under its containing object's section.
  const leafRe = /\bid="([a-z0-9-]+)"|\bdata-leaf-path="([^"]+)"/g;
  // Each object's own container anchor sits right next to its real dotted
  // path, rendered verbatim for the reader (<code class="object-block__path">)
  // — reading that pair directly avoids re-deriving the anchor-slug algorithm
  // (lowercase + strip dots/brackets) and any edge case it might have.
  const containerRe = /<h4 id="([a-z0-9-]+)"[^>]*>[\s\S]*?<code class="object-block__path">([^<]*)<\/code>/g;
  for (const file of walkAstroFiles(SCHEMA_DIR)) {
    const text = fs.readFileSync(file, 'utf8');
    const url = urlForFile(file);

    let lastAnchor: string | null = null;
    let m: RegExpExecArray | null;
    leafRe.lastIndex = 0;
    while ((m = leafRe.exec(text))) {
      if (m[1]) lastAnchor = m[1];
      else if (m[2] && !(m[2] in leaves)) leaves[m[2]] = { url, anchor: lastAnchor };
    }

    containerRe.lastIndex = 0;
    while ((m = containerRe.exec(text))) {
      if (!(m[2] in containers)) containers[m[2]] = { url, anchor: m[1] };
    }
  }
  cachedLeaves = leaves;
  cachedContainers = containers;
}

/** Leaf-path (a scalar field) -> {url, anchor of its containing object}. */
export function schemaPathIndex(): Record<string, SchemaAnchor> {
  if (!cachedLeaves) buildIndexes();
  return cachedLeaves!;
}

/** Container/object path (e.g. a TriplesMap's own iterator context) -> its own anchor. */
export function schemaContainerIndex(): Record<string, SchemaAnchor> {
  if (!cachedContainers) buildIndexes();
  return cachedContainers!;
}
