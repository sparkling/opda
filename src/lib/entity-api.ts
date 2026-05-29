/**
 * Realises ADR-0021: build-time fetch helper for the GRLC SPARQL API.
 *
 * Base URL: process.env.OPDA_API or http://localhost:3000 (build-time).
 * The live Fuseki+GRLC stack is REQUIRED for a production build (`npm run
 * build:data`): if the API is unreachable there, the build fails loudly.
 * In dev (`astro dev`, import.meta.env.DEV) the API is usually not running, so
 * the helpers degrade gracefully — entity pages fall back to markdown rendering
 * instead of crashing getStaticPaths.
 */

import type { Tier } from './manual.ts';

// ---------------------------------------------------------------------------
// Typed contract — mirrors the shared API contract in ADR-0021.
// ---------------------------------------------------------------------------

export interface EntityListItem {
  uri: string;
  localName: string;
  label: string;
  module: string;
  tiers: Tier[];
}

export interface EntityAttribute {
  localName: string;
  label: string;
  type: string;
  cardinality: string;
  required: boolean;
  description: string;
}

export interface EntityRelationship {
  predicate: string;
  target: string;
  cardinality: string;
  inverse: string | null;
  description: string;
}

export interface EntityConstraint {
  message: string;
  severity: 'Violation' | 'Warning' | 'Info';
  shape: string;
}

export interface CrossTierUrls {
  concept: string | null;
  logical: string | null;
  physicalDatabase: string | null;
  physicalOntology: string | null;
}

export interface EntityDetail {
  uri: string;
  localName: string;
  label: string;
  module: string;
  tier: string;
  summary: string;
  scopeNote: string;
  dctSource: string[];
  attributes: EntityAttribute[];
  relationships: EntityRelationship[];
  constraints: EntityConstraint[];
  crossTier: CrossTierUrls;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

const API_BASE: string =
  (typeof process !== 'undefined' && process.env.OPDA_API) ||
  'http://localhost:3000';

async function apiFetch(path: string): Promise<unknown> {
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new Error(
      `[ADR-0021] OPDA API unreachable at ${url}. ` +
      `Start Fuseki + GRLC API before building (npm run build:data). ` +
      `Original error: ${(err as Error).message}`,
    );
  }
  if (!res.ok) throw new Error(`entity-api ${res.status}: ${url}`);
  return res.json();
}

/**
 * Lazy-loaded map from lowercased localName to canonical localName.
 * Handles acronym mismatches: slug "dpv-mapping-record" → "DPVMappingRecord".
 * Built once from the entity list on first call.
 */
let _localNameMap: Map<string, string> | null = null;

async function getLocalNameMap(): Promise<Map<string, string>> {
  if (_localNameMap) return _localNameMap;
  try {
    const data = await apiFetch('/api/entities') as { items: EntityListItem[] };
    _localNameMap = new Map(data.items.map((e) => [e.localName.toLowerCase(), e.localName]));
  } catch (err) {
    if (!import.meta.env.DEV) throw err;   // production build requires the API
    _localNameMap = new Map();             // dev: empty → resolveLocalName returns the guess
  }
  return _localNameMap;
}

/**
 * Resolve a PascalCase guess to the canonical localName used in the ontology.
 * Falls back to the input if not found in the entity list.
 */
async function resolveLocalName(pascalGuess: string): Promise<string> {
  const map = await getLocalNameMap();
  return map.get(pascalGuess.toLowerCase()) ?? pascalGuess;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the entity list from GET /api/entities.
 * Fails the build with a clear error if the API is not reachable.
 */
export async function fetchEntityList(): Promise<EntityListItem[]> {
  try {
    const data = await apiFetch('/api/entities') as { items: EntityListItem[] };
    return data.items;
  } catch (err) {
    if (!import.meta.env.DEV) throw err;   // production build requires the API
    return [];                             // dev: degrade gracefully
  }
}

/**
 * Fetch a single entity detail from GET /api/entities/{tier}/{module}/{localName}.
 * Resolves the localName against the entity list to handle acronym mismatches
 * (e.g. slug "dpv-mapping-record" → "DPVMappingRecord").
 * Returns null on 404 (entity not in the ontology for this tier) so the page
 * falls back to markdown rendering. In dev, any API failure also returns null
 * (degrade to markdown); in a production build a connectivity failure throws.
 */
export async function fetchEntityDetail(
  tier: string,
  module: string,
  localName: string,
): Promise<EntityDetail | null> {
  try {
    // resolveLocalName is inside the try so its API errors degrade too.
    const canonical = await resolveLocalName(localName);
    return await apiFetch(
      `/api/entities/${tier}/${module}/${canonical}`,
    ) as EntityDetail;
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('entity-api 404')) return null;   // not in ontology → markdown
    if (import.meta.env.DEV) return null;               // dev without the API → markdown
    throw err;                                          // production build: fail loudly
  }
}
