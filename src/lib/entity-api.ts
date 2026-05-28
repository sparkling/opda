/**
 * Realises ADR-0021: build-time fetch helper for the GRLC SPARQL API.
 *
 * Base URL: process.env.OPDA_API or http://localhost:3000 (build-time).
 * The live Fuseki+GRLC stack is REQUIRED at build time. If the API is
 * unreachable, the build fails with a clear error message. No fixture fallback.
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
  const data = await apiFetch('/api/entities') as { items: EntityListItem[] };
  _localNameMap = new Map(data.items.map((e) => [e.localName.toLowerCase(), e.localName]));
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
  const data = await apiFetch('/api/entities') as { items: EntityListItem[] };
  return data.items;
}

/**
 * Fetch a single entity detail from GET /api/entities/{tier}/{module}/{localName}.
 * Resolves the localName against the entity list to handle acronym mismatches
 * (e.g. slug "dpv-mapping-record" → "DPVMappingRecord").
 * Returns null on 404 (entity not found in ontology); throws on connectivity failures.
 */
export async function fetchEntityDetail(
  tier: string,
  module: string,
  localName: string,
): Promise<EntityDetail | null> {
  const canonical = await resolveLocalName(localName);
  try {
    return await apiFetch(
      `/api/entities/${tier}/${module}/${canonical}`,
    ) as EntityDetail;
  } catch (err) {
    const msg = (err as Error).message;
    // 404 means this entity is not in the ontology for this tier — return null
    // so the page falls back to markdown rendering.
    if (msg.includes('entity-api 404')) return null;
    // Connectivity failures propagate to fail the build.
    throw err;
  }
}
