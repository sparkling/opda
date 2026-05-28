/**
 * Realises ADR-0016 (manual content-collection wiring) per ADR-0015.
 * Path-derived metadata helpers for the `manual` content collection.
 *
 * Astro 6's glob loader uses githubSlug() for entry IDs: lowercase, no .md
 * extension, e.g. "concept/agent/readme" not "concept/agent/README.md".
 * All pattern matches here are lowercase to match actual entry ids.
 *
 * Because 218 of the 228 manual markdown files lack frontmatter, tier /
 * module / kind / title are derived from the collection entry's `id`.
 * ADR-0020 (Phase 5) will extend the generator to emit these fields; the
 * helpers below become fallback-only at that point.
 */

/** The four manual tiers. */
export type Tier =
  | 'concept'
  | 'logical'
  | 'physical-database'
  | 'physical-ontology';

/** Content kinds used for rendering decisions by downstream components (Phase 2). */
export type Kind =
  | 'tier-readme'
  | 'module-readme'
  | 'entity'
  | 'scheme'
  | 'exemplar'
  | 'cross-cutting'
  | 'per-module-deployment'
  | 'derived-profile'
  | 'overlay-deployment'
  | 'operations';

const TIERS: Tier[] = [
  'concept',
  'logical',
  'physical-database',
  'physical-ontology',
];

/** Extract the tier from entry id. */
export function deriveTier(id: string): Tier | null {
  for (const tier of TIERS) {
    if (id === `${tier}/readme` || id.startsWith(`${tier}/`)) {
      return tier;
    }
  }
  return null;
}

/** Extract the module name from entry id, or null if not applicable. */
export function deriveModule(id: string): string | null {
  const parts = id.replace(/^(concept|logical|physical-database|physical-ontology)\//, '').split('/');
  const modules = ['foundation', 'property', 'agent', 'transaction', 'claim', 'governance', 'descriptive'];
  if (modules.includes(parts[0])) return parts[0];
  return null;
}

/** Determine the content kind from entry id (lowercase, no .md extension). */
export function deriveKind(id: string): Kind {
  const withoutTier = id.replace(/^(concept|logical|physical-database|physical-ontology)\//, '');

  // Tier readme (e.g. "concept/readme")
  if (id.match(/^(concept|logical|physical-database|physical-ontology)\/readme$/)) {
    return 'tier-readme';
  }
  // Module readme (e.g. "concept/agent/readme")
  if (withoutTier.match(/^[^/]+\/readme$/)) {
    return 'module-readme';
  }
  // Sub-directory readmes (e.g. "physical-database/modules/readme")
  if (withoutTier.match(/^[^/]+\/[^/]+\/readme$/)) {
    return 'module-readme';
  }
  // Physical-database module deployment views
  if (id.startsWith('physical-database/modules/')) return 'per-module-deployment';
  // Physical-database derived profiles
  if (id.startsWith('physical-database/derived-profiles/')) return 'derived-profile';
  // Physical-database overlay deployment
  if (id.startsWith('physical-database/overlay-deployment/')) return 'overlay-deployment';
  // Physical-database operations and named-graphs
  if (
    id === 'physical-database/named-graphs' ||
    id.startsWith('physical-database/content-negotiation/') ||
    id.startsWith('physical-database/operations/')
  ) return 'operations';
  // Physical-ontology exemplars
  if (id.startsWith('physical-ontology/exemplars/')) return 'exemplar';
  // Physical-ontology vocabularies (SKOS schemes)
  if (id.startsWith('physical-ontology/vocabularies/')) return 'scheme';
  // Physical-ontology cross-cutting topics
  if (
    id === 'physical-ontology/three-graph-separation' ||
    id === 'physical-ontology/severity-tiers' ||
    id === 'physical-ontology/shacl-af-rules'
  ) return 'cross-cutting';
  // Logical enumerations (SKOS schemes)
  if (withoutTier.includes('/enumerations/')) return 'scheme';
  // Default for concept/logical module entities
  return 'entity';
}

/** Humanise a slug: "role-mixin" → "Role mixin". */
function humanise(slug: string): string {
  return slug
    .split('-')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Derive a display title from frontmatter + markdown body + slug fallback.
 * `body` is the raw markdown string (Astro provides this via entry.body).
 */
export function deriveTitle(
  frontmatterTitle: string | undefined,
  id: string,
  body?: string,
): string {
  if (frontmatterTitle) return frontmatterTitle;
  // Extract first H1 from body
  if (body) {
    const match = body.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
  }
  // Fallback: humanise the file stem (last path segment)
  const stem = id.split('/').pop() ?? id;
  // For readme entries, humanise the parent segment (module/tier name)
  if (stem === 'readme') {
    const parent = id.split('/').slice(-2, -1)[0] ?? stem;
    return humanise(parent);
  }
  return humanise(stem);
}

/**
 * Convert a kebab-case slug to PascalCase for API lookups.
 * Examples: "legal-estate" → "LegalEstate", "property" → "Property",
 * "diagnostic-exemplar" → "DiagnosticExemplar".
 */
export function slugToPascal(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * Compute the URL slug within the tier for a collection entry.
 * Strips tier prefix; converts readme → '' for tier root, or parent path for module root.
 * Returns '' for tier-level readme (maps to [...slug] with undefined → tier root URL).
 */
export function deriveSlug(id: string, tier: Tier): string {
  const withoutTier = id.replace(new RegExp(`^${tier}/`), '');
  // Tier-level readme → tier root (empty slug)
  if (withoutTier === 'readme') return '';
  // Module/sub-directory readme → parent path (e.g. "agent/readme" → "agent")
  if (withoutTier.endsWith('/readme')) {
    return withoutTier.replace(/\/readme$/, '');
  }
  return withoutTier;
}
