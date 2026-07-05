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

/** All 34 ODRs in the corpus. Every ODR gets a live page; enriched=true = has diagrams. */
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
  // ── Descriptive-layer & foundational waves (sessions 019–047) ────────────────
  { id: 'odr-0008d', number: '0008d', title: 'Authority-Retrieved Artefacts',                       kind: 'pattern',      status: 'accepted', enriched: false },
  { id: 'odr-0019', number: '0019', title: 'Bounded-Context Representation',                         kind: 'pattern',      status: 'accepted', enriched: false },
  { id: 'odr-0020', number: '0020', title: 'Bounded-Context Scheme and Term→Context Mapping',        kind: 'pattern',      status: 'accepted', enriched: false },
  { id: 'odr-0021', number: '0021', title: 'Deferred Form/Profile-Layer Enhancements',               kind: 'architecture', status: 'accepted', enriched: false },
  { id: 'odr-0022', number: '0022', title: 'Descriptive-Layer Import Strategy & Property Categorisation', kind: 'architecture', status: 'accepted', enriched: false },
  { id: 'odr-0023', number: '0023', title: 'Descriptive-Layer Follow-On Council Roadmap',            kind: 'programme',    status: 'accepted', enriched: false },
  { id: 'odr-0024', number: '0024', title: 'Curated Category-G Walk — Leaf Dispositions and Modelling Rules', kind: 'pattern', status: 'accepted', enriched: false },
  { id: 'odr-0025', number: '0025', title: 'Entailment Regime and Inference Semantics',              kind: 'architecture', status: 'accepted', enriched: false },
  { id: 'odr-0026', number: '0026', title: 'OWL-RL-Safe Ruleset Adoption and Unevaluated Modelling Axioms', kind: 'architecture', status: 'accepted', enriched: false },
  { id: 'odr-0027', number: '0027', title: 'Classification, Roles, Inheritance, and SKOS — opda Modelling Doctrine', kind: 'architecture', status: 'accepted', enriched: false },
  { id: 'odr-0028', number: '0028', title: 'Descriptive-Layer Conversion — Completeness Reconciliation', kind: 'programme', status: 'accepted', enriched: false },
  { id: 'odr-0029', number: '0029', title: 'Inference/Validation Boundary and the Entailment-Regime Disposition', kind: 'architecture', status: 'accepted', enriched: false },
  { id: 'odr-0030', number: '0030', title: 'Foundational-Ontology Choice: UFO-as-Lens, Scoped to the Relator Spine', kind: 'architecture', status: 'accepted', enriched: false },
  { id: 'odr-0031', number: '0031', title: 'opda:ufoCategory and the Upper-Ontology Layer',          kind: 'architecture', status: 'accepted', enriched: false },
  { id: 'odr-0032', number: '0032', title: 'Relationship Layer — Reify Inter-Entity Associations as OWL Object Properties', kind: 'pattern', status: 'proposed', enriched: false },
  { id: 'odr-0033', number: '0033', title: 'OWL/RDFS Axioms as Documentary AI-Signal — the Consolidated Doctrine', kind: 'architecture', status: 'proposed', enriched: false },
  { id: 'odr-0034', number: '0034', title: 'Relationship-Residue Completion — Events, Information Objects, and the Aboutness/Provenance Boundary', kind: 'pattern', status: 'proposed', enriched: false },
  { id: 'odr-0035', number: '0035', title: "RML as OPDA's Bidirectional Schema-Provenance Verification Mechanism", kind: 'architecture', status: 'accepted', enriched: false },
];
