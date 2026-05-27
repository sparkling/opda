---
status: proposed
date: 2026-05-20
kind: pattern
tags: [enumerations, skos, vocabularies, glossary]
scope: []
council: session-001
supersedes: []
depends-on: [ODR-0004]
implements: [ODR-0003]
---

# Enumeration Vocabularies

## Context

The PDTF v3 corpus carries 160 leaves whose JSON `enum` arrays act as closed value lists — `role`, `ownershipType`, `marketingTenure`, `councilTaxBand` (A–I), `currentEnergyRating` (A–G), `builtForm`, `centralHeatingFuelType`, `sellersCapacity`, `participantStatus`, and many more. Each is presently a free-floating string constraint: no global identifier, no governable label, no provenance back to the form question it serves.

A mechanical rewrite to either `owl:oneOf` bags of `owl:NamedIndividual`s or to bare `xsd:string` patterns is wrong: these enumerations are **controlled vocabularies** — registers of human-curated concepts with preferred labels, definitions, notations, and (sometimes) hierarchy — not logical extensions a reasoner should police, and not class hierarchies where `Freehold` is a subclass of anything. The register is cross-cutting: roles feed Agents & Roles (ODR-0006), tenure and restriction codes feed Property & Land (ODR-0005), built form and EPC bands feed descriptive attributes (ODR-0008), evidence and assurance codes feed Claims & Evidence (ODR-0009), and PII/purpose taxonomies feed Governance (ODR-0012).

## Decision

Each enum becomes a **SKOS concept scheme** whose members are `skos:Concept`s carrying `skos:prefLabel`, `skos:notation`, and `skos:definition` — because SKOS is purpose-built for controlled vocabularies and gives each value a dereferenceable URI, a governable label, and a definition without importing OWL membership-reasoning over a hand-curated list.

## Rules

- **Each enum is a `skos:ConceptScheme`.** Members are linked via `skos:inScheme`; each `skos:Concept` carries `skos:prefLabel` with an `@en` language tag, `skos:notation` for the canonical machine code (e.g. HMLR `classOfTitleCode` `10/20/30/…`, `restrictionTypeCode` `0/10/20/30`), and `skos:definition`.
- **Labels and definitions are sourced from the business glossary** where the term exists there (`Role`, `Participant`, `Scheme Operator`, `Data Provider`/`Data Recipient`, `TPP`) — adopted verbatim, not paraphrased. Where no glossary term exists, `skos:definition` is taken from the canonical schema leaf's `description` (e.g. `councilTaxBand`'s "Band I relates to Wales only").
- **Every concept carries `dct:source`** to its origin — the business-glossary row where one exists, otherwise the canonical schema leaf path (e.g. `…/baspi5.json#…/role`). This applies the [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md) provenance convention; it is not re-defined here.
- **Hierarchical enums use `skos:broader`/`skos:narrower`.** Genuine taxonomies — broadband `typeOfConnection` (None / ADSL copper / Cable / FTTC / FTTP, with fibre variants narrowing under a fibre concept), transport `transportType` (rail / bus / ferry / airport under modal parents) — carry the broader/narrower structure rather than flattening. Flat enums (EPC band, `yesNoNotKnown`) stay flat.
- **Closed vs open-ended is flagged per scheme.** Closed schemes (EPC band A–G; council-tax band A–I; `ownerType` {Private individual, Organisation}) are marked for a SHACL `sh:in` over their members in [ODR-0013](./ODR-0013-shacl-validation-and-severity.md). Open-ended schemes (fuel types, transport types, media types) are not `sh:in`-constrained, so the world can extend them without an ODR. The per-enum call is made during drafting against the data dictionary.
- **Per-scheme namespace convention** — `opda:` schemes are minted under the single hash namespace per [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md).
- **External schemes are reused where one governs the domain.** Where an authoritative external register exists and is dereferenceable (council-tax bands as a governed concept; ISO 3166-1 alpha-3 for `countryCode`), reference or align via `skos:exactMatch`/`skos:closeMatch` rather than re-minting an `opda:` scheme. SSSOM is **not** used for internal `dct:source` references ([ODR-0014](./ODR-0014-vocabulary-catalogue-amendments.md)); it would earn its place only for *external*-vocabulary mappings.
- **Domain ownership** — the **provenance/assurance schemes** (`evidence type`, `verification-method` code, `opda:assuranceLevel`) are owned by [ODR-0009](./ODR-0009-claims-evidence-provenance.md); the **governance schemes** (DPV personal-data categories, processing-purpose taxonomy) by [ODR-0012](./ODR-0012-data-governance-layer.md). This ODR provides the SKOS mechanism and conventions; those ODRs author the domain-specific content.
- **One register, three consumers.** Each scheme must drive SHACL `sh:in` (closed only), DASH `dash:EnumSelectEditor` form controls, and human-readable rendering. Labels and notations are authored once and reused.

**Enforcement**:

- SKOS integrity constraints (W3C) hold: a concept is in exactly one primary scheme via `skos:inScheme`; `skos:prefLabel` is unique per language per concept; `skos:broader`/`skos:narrower` are acyclic.
- A closed scheme is confirmed by a corresponding SHACL `sh:in` shape in [ODR-0013](./ODR-0013-shacl-validation-and-severity.md) whose members are exactly the scheme's concepts; an open-ended scheme is confirmed by the *absence* of such a shape.
- Each concept's `skos:prefLabel`/`skos:definition` carries a `dct:source` resolving to a business-glossary row or canonical schema leaf path, per [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md).
- The BASPI5 vertical slice (Q7 MVP) exercises the register: `role`, `sellersCapacity`, `councilTaxBand`, and `builtForm` schemes must drive both a valid `sh:in` and a rendered `dash:EnumSelectEditor` with glossary-sourced labels.

**Indicative schemes (non-exhaustive — enumerated during drafting)**: Roles & capacity (`role`, `sellersCapacity`, `ownerType`, `participantStatus`); Tenure & legal (`tenure`, `marketingTenure`, `ownershipType`, `restrictionTypeCode`, `classOfTitleCode`, `subRegisterCode`); Built form (`builtForm`, `constructionType`, `units`, `priceQualifier`); Energy & utilities (`currentEnergyRating` A–G, `centralHeatingFuelType`, `heatingType`, broadband `typeOfConnection`); Encumbrances (`councilTaxBand` A–I, `feeType`, `rentFrequency`); Searches (`transportType`, `ofstedRating`, `mediaType`).

## Alternatives

- **Bare string constraints** — leave each enum as `xsd:string` with `sh:in` literals. Fatal flaw: values have no URIs, no governable labels, no definitions, no provenance; identical literals across distinct enums (`Freehold` in `ownershipType`, `marketingTenure`, `tenure`) carry no statement of co-reference.
- **OWL enumerated classes (`owl:oneOf` / subclassing)** — model each enum as an OWL class with closed `owl:NamedIndividual` extension, or as a subclass tree. Fatal flaw: conscripts a reasoner to police membership of a hand-curated list — machinery without a purpose — and misclassifies vocabulary terms (`Detached`) as either individuals or classes (Baker/Knublauch, Q5).

## Consequences

- Adopt SKOS as the mechanism for every enum register; do not model enums as OWL classes or bare string constraints.
- Source `skos:prefLabel`/`skos:definition` from the business glossary verbatim where the term exists; cite `dct:source` on every concept.
- Author one scheme per enum; reuse external schemes via `skos:exactMatch`/`skos:closeMatch` where a governed register exists.
- Flag each scheme as closed or open-ended during drafting; closed schemes flow into a SHACL `sh:in` per [ODR-0013](./ODR-0013-shacl-validation-and-severity.md), open-ended schemes do not.
- Reconciling cross-overlay synonymy (recurring `Freehold`/`Commonhold`; `Attached`/`To follow`/`Not applicable` across dozens of leaves) is a per-scheme drafting concern — this ODR does not pre-decide the concept-deduplication map.
- Reviewers cannot tell from this record alone which of the 160 enums will carry an `sh:in`; that determination is made per scheme during drafting.

## References

- **Target versions**: RDF 1.2 and SHACL 1.2, per the Core-tier pin in [ODR-0002](./ODR-0002-ontology-language-adoption.md).
- **Vocabularies**: SKOS (concept schemes, labels, notations, semantic relations); Core (`dct:source`/`dct:` per [ODR-0002](./ODR-0002-ontology-language-adoption.md) as amended by [ODR-0014](./ODR-0014-vocabulary-catalogue-amendments.md)).
- **Inputs**: data dictionary `enum` columns (`data-dictionary.md` / `data-dictionary-canonical.json`); business glossary (`source/00-deliverables/semantic-models/business-glossary.md`).
- **Deliverables (when fleshed out)**: one TTL per scheme (or a consolidated `vocabularies.ttl`); the closed/open-ended register; the cross-overlay concept-deduplication map; cross-links to modules and SHACL/DASH consumers.
- **Related**: anchor [ODR-0003](./ODR-0003-pdtf-ontology-programme.md); foundation [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md); consumers — Agents & Roles [ODR-0006](./ODR-0006-agents-and-roles.md), Property & Land [ODR-0005](./ODR-0005-property-land-identity-crux.md), descriptive attributes [ODR-0008](./ODR-0008-property-descriptive-attributes.md), Claims & Evidence [ODR-0009](./ODR-0009-claims-evidence-provenance.md), Governance [ODR-0012](./ODR-0012-data-governance-layer.md); SHACL `sh:in`/DASH consumer [ODR-0013](./ODR-0013-shacl-validation-and-severity.md); catalogue [ODR-0002](./ODR-0002-ontology-language-adoption.md) as amended by [ODR-0014](./ODR-0014-vocabulary-catalogue-amendments.md).
- **Council deliberation**: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q5 (overlays/enums; Baker/Knublauch/Pandit). Q2 Dublin Core as commons substrate (Baker, carried) and Q2 SSSOM deferred (Cagle dissent in [ODR-0014](./ODR-0014-vocabulary-catalogue-amendments.md)) bear on this register.
- **SKOS reviewers**: Antoine Isaac and Alistair Miles (SKOS Reference editors) inform the broader/narrower and integrity-constraint conventions.
