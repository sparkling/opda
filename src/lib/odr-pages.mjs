/**
 * ODR page registry (ADR-0024 enrichment-in-markdown; ADR-0025 cascade contract).
 *
 * Single source of truth for ODR metadata, shared by:
 *   - src/pages/modelling/odr/index.astro  (listing + ✓-diagrams badge)
 *   - src/pages/modelling/odr/[id].astro   (detail-page meta pills + breadcrumb)
 *   - src/lib/site.ts                      (left-nav group, generated from this list)
 *
 * Each ODR's content (incl. its ```mermaid diagrams) lives in
 * docs/ontology/odr/ODR-NNNN-*.md and renders through the Astro `odr` content
 * collection (render(entry) → <Content/> in [id].astro) — the same path as the
 * manual. Adding an ODR here surfaces it in the sidebar, breadcrumb, and listing.
 *
 * `enriched` is informational — true once an ODR's markdown carries illustrative
 * diagrams — and drives only the listing badge, not page existence.
 */

/**
 * @typedef {Object} OdrEntry
 * @property {string}  id        - Kebab-case page ID, e.g. 'odr-0001'
 * @property {string}  number    - Zero-padded number, e.g. '0001'
 * @property {string}  title     - Short display title
 * @property {string}  kind      - 'methodology' | 'pattern' | 'mapping' | 'architecture' | 'programme'
 * @property {string}  status    - 'accepted' | 'proposed' | 'rejected'
 * @property {boolean} enriched  - true = markdown carries illustrative diagrams (listing badge only)
 */

/** All 18 ODRs in the corpus. Every ODR gets a live page; enriched=true = has diagrams. */
export const ODR_REGISTRY = [
  { id: 'odr-0001', number: '0001', title: 'Linked Data Council: Review Methodology',              kind: 'methodology',  status: 'accepted', enriched: true },
  { id: 'odr-0002', number: '0002', title: 'Ontology Languages and Vocabularies Adopted',          kind: 'architecture', status: 'accepted', enriched: true },
  { id: 'odr-0003', number: '0003', title: 'PDTF to Ontology: Programme and Work Breakdown',        kind: 'programme',    status: 'accepted', enriched: true },
  { id: 'odr-0004', number: '0004', title: 'PDTF Ontology Foundation',                              kind: 'architecture', status: 'accepted', enriched: true },
  { id: 'odr-0005', number: '0005', title: 'Property & Land: The Identity Crux',                    kind: 'pattern',      status: 'accepted', enriched: true },
  { id: 'odr-0006', number: '0006', title: 'Agents & Roles',                                        kind: 'pattern',      status: 'accepted', enriched: true },
  { id: 'odr-0007', number: '0007', title: 'Transactions & Lifecycle',                              kind: 'pattern',      status: 'accepted', enriched: true },
  { id: 'odr-0008', number: '0008', title: 'Property Descriptive Attributes',                       kind: 'pattern',      status: 'proposed', enriched: true },
  { id: 'odr-0009', number: '0009', title: 'Claims, Evidence & Provenance',                         kind: 'pattern',      status: 'accepted', enriched: true },
  { id: 'odr-0010', number: '0010', title: 'Overlay Profile Mechanism',                             kind: 'architecture', status: 'accepted', enriched: true },
  { id: 'odr-0011', number: '0011', title: 'Enumeration Vocabularies',                              kind: 'architecture', status: 'accepted', enriched: true },
  { id: 'odr-0012', number: '0012', title: 'Data-Governance Layer',                                 kind: 'architecture', status: 'accepted', enriched: true },
  { id: 'odr-0013', number: '0013', title: 'SHACL Validation & Severity',                           kind: 'architecture', status: 'accepted', enriched: true },
  { id: 'odr-0014', number: '0014', title: 'Vocabulary Catalogue Amendments',                       kind: 'architecture', status: 'accepted', enriched: true },
  { id: 'odr-0015', number: '0015', title: 'Address & Geography',                                   kind: 'pattern',      status: 'proposed', enriched: true },
  { id: 'odr-0016', number: '0016', title: 'W3C Verifiable Credentials / DID Compatibility Layer',  kind: 'architecture', status: 'proposed', enriched: true },
  { id: 'odr-0017', number: '0017', title: 'SHACL-AF Non-Blocking Data-Quality Rules',              kind: 'pattern',      status: 'accepted', enriched: true },
  { id: 'odr-0018', number: '0018', title: 'DPV Class-Level Co-Annotation Pattern',                 kind: 'pattern',      status: 'accepted', enriched: true },
];
