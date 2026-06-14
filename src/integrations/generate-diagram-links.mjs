/**
 * ADR-0022: Astro integration — generate diagram-links manifest at build time.
 *
 * Scans docs/manual to produce the same entry ids that Astro's glob loader
 * would assign (lowercase, no .md extension, path relative to docs/manual/),
 * then derives the label→route manifest and writes it to
 * public/data/diagram-links.json so client.js can fetch it at runtime.
 *
 * Runs at astro:config:setup so the file is available before any page build.
 * Does NOT require the GRLC/Fuseki API — purely content-collection derived.
 */
import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, relative, extname, dirname } from 'node:path';

const TIERS = ['concept', 'logical', 'physical-database', 'physical-ontology'];
const MODULES = ['foundation', 'property', 'agent', 'transaction', 'claim', 'governance', 'descriptive'];

/** Recursively collect all .md files under dir as ids relative to base. */
function collectIds(dir, base) {
  const ids = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return ids; }
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      ids.push(...collectIds(full, base));
    } else if (name.endsWith('.md')) {
      // Astro glob loader: lowercase, strip .md
      const rel = relative(base, full).replace(/\\/g, '/');
      ids.push(rel.slice(0, -3).toLowerCase());
    }
  }
  return ids;
}

/** Derive tier from id (mirrors manual.ts deriveTier). */
function deriveTier(id) {
  for (const tier of TIERS) {
    if (id === `${tier}/readme` || id.startsWith(`${tier}/`)) return tier;
  }
  return null;
}

/** Derive slug within tier (mirrors manual.ts deriveSlug). */
function deriveSlug(id, tier) {
  const without = id.replace(new RegExp(`^${tier}/`), '');
  if (without === 'readme') return '';
  if (without.endsWith('/readme')) return without.replace(/\/readme$/, '');
  return without;
}

/** Derive kind (mirrors manual.ts deriveKind, minimal for route gating). */
function deriveKind(id) {
  const without = id.replace(/^(concept|logical|physical-database|physical-ontology)\//, '');
  if (id.match(/^(concept|logical|physical-database|physical-ontology)\/readme$/)) return 'tier-readme';
  if (without.match(/^[^/]+\/readme$/)) return 'module-readme';
  if (without.match(/^[^/]+\/[^/]+\/readme$/)) return 'module-readme';
  if (id.startsWith('physical-ontology/exemplars/')) return 'exemplar';
  if (id.startsWith('physical-ontology/vocabularies/')) return 'scheme';
  if (without.includes('/enumerations/')) return 'scheme';
  if (
    id === 'physical-ontology/three-graph-separation' ||
    id === 'physical-ontology/severity-tiers' ||
    id === 'physical-ontology/shacl-af-rules'
  ) return 'cross-cutting';
  if (id.startsWith('physical-database/modules/')) return 'per-module-deployment';
  if (id.startsWith('physical-database/derived-profiles/')) return 'derived-profile';
  if (id.startsWith('physical-database/overlay-deployment/')) return 'overlay-deployment';
  if (
    id === 'physical-database/named-graphs' ||
    id.startsWith('physical-database/content-negotiation/') ||
    id.startsWith('physical-database/operations/')
  ) return 'operations';
  return 'entity';
}

/** Convert kebab slug to PascalCase. */
function toPascal(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/** Build the label→route manifest from a list of entry ids. */
function buildLinks(ids) {
  const out = {};
  const add = (key, route) => { if (key && !out[key]) out[key] = route; };

  for (const id of ids) {
    const tier = deriveTier(id);
    if (!tier) continue;
    const slug = deriveSlug(id, tier);
    const route = slug ? `/model/${tier}/${slug}` : `/model/${tier}`;
    const stem = slug.split('/').pop() ?? slug;
    if (!stem) continue;

    const pascal = toPascal(stem);
    const kind = deriveKind(id);

    add(stem.toLowerCase(), route);
    add(pascal.toLowerCase(), route);
    add(`opda:${pascal}`.toLowerCase(), route);
    if (kind === 'scheme') {
      add(`opda:${pascal}scheme`.toLowerCase(), route);
    }
  }
  return out;
}

function generateDiagramLinks(root) {
  const manualDir = resolve(root, 'docs/manual');
  const ids = collectIds(manualDir, manualDir);
  const links = buildLinks(ids);

  const outPath = resolve(root, 'public/data/diagram-links.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(links, null, 2));
  console.log(`[diagram-links] Wrote ${Object.keys(links).length} entries → public/data/diagram-links.json`);
}

export function diagramLinksGenerator() {
  return {
    name: 'opda-diagram-links',
    hooks: {
      'astro:config:setup': () => {
        generateDiagramLinks(process.cwd());
      },
    },
  };
}
