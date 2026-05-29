/**
 * ODR page registry (ADR-0024 — enrichment in markdown; HTML generated every build).
 *
 * Single source of truth shared by:
 *   - src/pages/modelling/odr/index.astro  (listing)
 *   - src/pages/modelling/odr/[id].astro   (detail)
 *   - src/lib/site.ts                      (nav group)
 *
 * Every ODR appears here and gets a live page. The generate-odr-html
 * integration converts each ODR's markdown to src/generated/odr/ODR-NNNN.html
 * (gitignored, regenerated every build); [id].astro serves it via set:html.
 *
 * Diagrams are authored in the ODR markdown (```mermaid fences). The `enriched`
 * flag is informational — true once an ODR's markdown carries illustrative
 * diagrams — and drives only the listing badge, not page existence.
 */

/**
 * @typedef {Object} OdrEntry
 * @property {string} id         - Kebab-case page ID, e.g. 'odr-0001'
 * @property {string} number     - Zero-padded number, e.g. '0001'
 * @property {string} title      - Short display title
 * @property {string} kind       - ODR kind: 'methodology' | 'pattern' | 'mapping' | 'architecture' | 'programme'
 * @property {string} status     - 'accepted' | 'proposed' | 'rejected'
 * @property {string} artefact   - Path to the committed HTML fragment
 * @property {boolean} enriched  - true = markdown carries illustrative diagrams (listing badge only)
 */

/** All 18 ODRs in the corpus. Every ODR gets a page; enriched=true = has diagrams. */
export const ODR_REGISTRY = [
  { id: 'odr-0001', number: '0001', title: 'Linked Data Council: Review Methodology',             kind: 'methodology',   status: 'accepted', artefact: 'src/generated/odr/ODR-0001.html', enriched: true  },
  { id: 'odr-0002', number: '0002', title: 'Ontology Languages and Vocabularies Adopted',         kind: 'architecture',  status: 'accepted', artefact: 'src/generated/odr/ODR-0002.html', enriched: true  },
  { id: 'odr-0003', number: '0003', title: 'PDTF to Ontology: Programme and Work Breakdown',      kind: 'programme',     status: 'accepted', artefact: 'src/generated/odr/ODR-0003.html', enriched: true  },
  { id: 'odr-0004', number: '0004', title: 'PDTF Ontology Foundation',                           kind: 'architecture',  status: 'accepted', artefact: 'src/generated/odr/ODR-0004.html', enriched: true  },
  { id: 'odr-0005', number: '0005', title: 'Property & Land: The Identity Crux',                  kind: 'pattern',       status: 'accepted', artefact: 'src/generated/odr/ODR-0005.html', enriched: true  },
  { id: 'odr-0006', number: '0006', title: 'Agents & Roles',                                      kind: 'pattern',       status: 'accepted', artefact: 'src/generated/odr/ODR-0006.html', enriched: true  },
  { id: 'odr-0007', number: '0007', title: 'Transactions & Lifecycle',                            kind: 'pattern',       status: 'accepted', artefact: 'src/generated/odr/ODR-0007.html', enriched: true  },
  { id: 'odr-0008', number: '0008', title: 'Property Descriptive Attributes',                     kind: 'pattern',       status: 'proposed', artefact: 'src/generated/odr/ODR-0008.html', enriched: true  },
  { id: 'odr-0009', number: '0009', title: 'Claims, Evidence & Provenance',                       kind: 'pattern',       status: 'accepted', artefact: 'src/generated/odr/ODR-0009.html', enriched: true  },
  { id: 'odr-0010', number: '0010', title: 'Overlay Profile Mechanism',                           kind: 'architecture',  status: 'accepted', artefact: 'src/generated/odr/ODR-0010.html', enriched: true  },
  { id: 'odr-0011', number: '0011', title: 'Enumeration Vocabularies',                            kind: 'architecture',  status: 'accepted', artefact: 'src/generated/odr/ODR-0011.html', enriched: true  },
  { id: 'odr-0012', number: '0012', title: 'Data-Governance Layer',                               kind: 'architecture',  status: 'accepted', artefact: 'src/generated/odr/ODR-0012.html', enriched: true  },
  { id: 'odr-0013', number: '0013', title: 'SHACL Validation & Severity',                         kind: 'architecture',  status: 'accepted', artefact: 'src/generated/odr/ODR-0013.html', enriched: true  },
  { id: 'odr-0014', number: '0014', title: 'Vocabulary Catalogue Amendments',                     kind: 'architecture',  status: 'accepted', artefact: 'src/generated/odr/ODR-0014.html', enriched: true  },
  { id: 'odr-0015', number: '0015', title: 'Address & Geography',                                 kind: 'pattern',       status: 'proposed', artefact: 'src/generated/odr/ODR-0015.html', enriched: true  },
  { id: 'odr-0016', number: '0016', title: 'W3C Verifiable Credentials / DID Compatibility Layer', kind: 'architecture',  status: 'proposed', artefact: 'src/generated/odr/ODR-0016.html', enriched: true  },
  { id: 'odr-0017', number: '0017', title: 'SHACL-AF Non-Blocking Data-Quality Rules',            kind: 'pattern',       status: 'accepted', artefact: 'src/generated/odr/ODR-0017.html', enriched: true  },
  { id: 'odr-0018', number: '0018', title: 'DPV Class-Level Co-Annotation Pattern',               kind: 'pattern',       status: 'accepted', artefact: 'src/generated/odr/ODR-0018.html', enriched: true  },
];

/** ODRs whose markdown carries diagrams (listing badge / progress tracking). */
export const ENRICHED_ODRS = ODR_REGISTRY.filter(o => o.enriched);

/**
 * ODR .md filenames → Astro route, for rewriting intra-ODR cross-links
 * in the HTML artefacts. Only maps ODRs that have committed artefacts;
 * non-enriched ODRs are left as-is (they 404 until their wave is done).
 */
export const ODR_LINK_MAP = Object.fromEntries(
  ODR_REGISTRY.map(o => [
    `ODR-${o.number}-${odrSlugFromId(o.id)}.md`,
    `/modelling/odr/${o.id}`,
  ])
);

/** Extract the descriptive slug part from an odr id like 'odr-0001'. */
function odrSlugFromId(id) {
  // Not needed for link-map key construction — the full filename is keyed by
  // each ODR file's actual filename. Kept for future use.
  return id.replace(/^odr-\d{4}-?/, '');
}
