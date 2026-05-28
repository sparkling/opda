/**
 * Realises ADR-0021: per-entity cross-tier URL scheme.
 *
 * URL scheme (from ADR-0021 §"Implementation sketch"):
 *   concept/logical  → /manual/<tier>/<module>/<localName-lowercase>
 *   physical-ontology → /manual/physical-ontology/<module>/classes#<localName>
 *   physical-database → /manual/physical-database/modules/<module>#<localName>
 *
 * The canonical key is the opda:<LocalName> URI (camel-case local name).
 * URL slugs use lowercase to match the existing manual collection convention.
 */

import type { Tier } from './manual.ts';
import type { CrossTierUrls } from './entity-api.ts';

/**
 * Build the cross-tier URL map for an entity from its module + localName,
 * limited to tiers where the entity actually appears.
 *
 * `presentTiers` comes from EntityListItem.tiers (from the API), so links
 * are only generated where a page exists — satisfying ADR-0021 §Confirmation #5.
 */
export function buildCrossTierUrls(
  module: string,
  localName: string,
  presentTiers: Tier[],
): CrossTierUrls {
  const slug = localName.toLowerCase();
  const has = (t: Tier) => presentTiers.includes(t);

  return {
    concept: has('concept')
      ? `/manual/concept/${module}/${slug}`
      : null,
    logical: has('logical')
      ? `/manual/logical/${module}/${slug}`
      : null,
    physicalDatabase: has('physical-database')
      ? `/manual/physical-database/modules/${module}#${localName}`
      : null,
    physicalOntology: has('physical-ontology')
      ? `/manual/physical-ontology/${module}/classes#${localName}`
      : null,
  };
}

/**
 * Render the cross-tier URL map as a flat record keyed by tier identifier,
 * ready for the CrossTierLinks component.
 *
 * Returns only entries where the URL is non-null (page exists).
 */
export function crossTierToLinkMap(
  urls: CrossTierUrls,
): Partial<Record<Tier, string>> {
  const out: Partial<Record<Tier, string>> = {};
  if (urls.concept)          out['concept']           = urls.concept;
  if (urls.logical)          out['logical']           = urls.logical;
  if (urls.physicalDatabase) out['physical-database'] = urls.physicalDatabase;
  if (urls.physicalOntology) out['physical-ontology'] = urls.physicalOntology;
  return out;
}
