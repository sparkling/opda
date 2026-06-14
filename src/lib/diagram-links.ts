/**
 * ADR-0022: build-time label→route manifest for diagram click navigation.
 *
 * Derives routes from the manual content collection entries (ids) using the
 * same helpers as manual.ts/cross-tier.ts. Does NOT require the API to be
 * running — pure content-collection derivation.
 *
 * Keys are normalised: lower-cased, trimmed. Multiple keys map to the same
 * route when an entity has alternate display forms (e.g. "Address", "address",
 * "opda:Address").
 */

import type { Tier } from './manual.ts';
import { deriveTier, deriveModule, deriveKind, deriveSlug } from './manual.ts';

/** A label→route entry; route is always a root-relative URL string. */
export interface DiagramLinkEntry {
  label: string;
  route: string;
}

/**
 * Build the diagram-links manifest from a list of content entry ids.
 * Returns a Record<string, string> where keys are normalised labels and
 * values are root-relative routes.
 *
 * Only emits entries for kinds that have a page: entity, scheme, exemplar,
 * cross-cutting, per-module-deployment, derived-profile, overlay-deployment,
 * operations, tier-readme, module-readme.
 */
export function buildDiagramLinks(ids: string[]): Record<string, string> {
  const out: Record<string, string> = {};

  for (const id of ids) {
    const tier = deriveTier(id);
    if (!tier) continue;

    const slug = deriveSlug(id, tier);
    const route = slug ? `/model/${tier}/${slug}` : `/model/${tier}`;

    // Normalised stem (last segment of the slug, or the slug itself)
    const stem = slug.split('/').pop() ?? slug;
    if (!stem) continue;

    // PascalCase variant (e.g. "address" → "Address", "legal-estate" → "LegalEstate")
    const pascal = stem.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

    addKey(out, stem.toLowerCase(), route);
    addKey(out, pascal.toLowerCase(), route);

    // opda: prefix variant — "opda:Address", "opda:LegalEstate"
    addKey(out, `opda:${pascal}`.toLowerCase(), route);

    // Scheme pages may also be referenced as "<Name>Scheme"
    const kind = deriveKind(id);
    if (kind === 'scheme') {
      addKey(out, `opda:${pascal}scheme`.toLowerCase(), route);
    }
  }

  return out;
}

/** Add key only if not already set (first writer wins). */
function addKey(map: Record<string, string>, key: string, route: string): void {
  if (key && !map[key]) map[key] = route;
}
