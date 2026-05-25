---
status: proposed
date: 2026-05-20
tags: [enumerations, skos, vocabularies, glossary]
supersedes: []
depends-on: [ONT-0004]
implements: [ONT-0003]
---

# Enumeration Vocabularies

## Context and Problem Statement

The PDTF v3 corpus is saturated with closed value lists. Across the 16 canonical schemas the data dictionary records 160 leaves carrying a JSON `enum` array — `role` (`baspi5.json`: Buyer, Seller's Conveyancer, Prospective Buyer, Buyer's Conveyancer, Estate Agent, Buyer's Agent…), `ownershipType` (Freehold, Commonhold, Leasehold, Other), `marketingTenure` (Commonhold, Freehold, Leasehold, Share of Freehold, Shared Ownership), `councilTaxBand` (A–H, with I for Wales), `currentEnergyRating` (A–G), `builtForm` (Detached, Semi-detached, Mid-terrace, End-terrace, Other), `centralHeatingFuelType`, `sellersCapacity` (Legal Owner / Personal Representative / Attorney / Mortgagee in Possession), `assignedContact` (Landlord, Management Company, Managing Agent, the Lessees), `riskIndicator`, `yesNoNotKnown`, `participantStatus` (Proposed, Invited, Active, Removed), and scores more. Each is presently a free-floating string constraint with no global identifier, no governable label, and no provenance back to the form question it serves.

A mechanical JSON-Schema-to-RDF rewrite would turn each enum into either a bag of `owl:NamedIndividual`s under an `owl:oneOf` class or, worse, leave them as bare `xsd:string` patterns. Both are wrong for the same reason: an enumeration of `Detached`/`Semi-detached`/`End-terrace` is a **controlled vocabulary** — a register of human-curated concepts with preferred labels, definitions, notations, and (sometimes) broader/narrower structure — not a set of logical individuals whose membership a reasoner should compute, and certainly not a class hierarchy where `Freehold` is a *subclass* of anything. Council Session 001 (Q5; Baker/Knublauch) ruled these are SKOS concept schemes, governable as vocabularies without dragging OWL semantics into a value list. This is a **cross-cutting register** every module draws on: roles feed Agents & Roles (ONT-0006), tenure and restriction codes feed Property & Land (ONT-0005), built form and EPC bands feed descriptive attributes (ONT-0008), evidence and assurance codes feed Claims & Evidence (ONT-0009), and PII/purpose taxonomies feed Governance (ONT-0012).

The question: how do we re-express the schema's `enum` arrays as governed controlled vocabularies — with labels and definitions sourced from the established business vocabulary rather than re-invented, and with provenance back to where each term actually lives — so that one register serves validation, form-rendering, and human comprehension at once?

## Decision Drivers

* **SKOS over OWL for value lists** (Baker, Knublauch) — a controlled vocabulary is a register of curated concepts, not a logical class extension; modelling `councilTaxBand` members as `owl:oneOf` individuals or as subclasses imports reasoning obligations that buy nothing and misstate the intent.
* **Govern labels and definitions from the business glossary, not re-invented** — the trust framework already speaks a settled vocabulary (`Participant`, `Role`, `Scheme Operator`, `Data Provider`, `Data Recipient`); concept labels and definitions must align to it rather than paraphrasing it afresh per scheme.
* **Provenance per concept** (ONT-0004 convention) — each concept must carry `dct:source` back to its business-glossary row or its canonical schema leaf path, so the register is auditable to its origin.
* **Closed vs open-ended must be a per-enum judgement** — a SHACL `sh:in` over a genuinely closed scheme (EPC bands) is correct; the same constraint over an extensible list (transport types, fuel types) freezes a vocabulary that the world will extend, forcing an ODR for every new member.
* **Reuse external schemes where one already governs the domain** (ONT-0002 adoption pattern) — council-tax bands, ISO country codes, and similar are externally governed; prefer the canonical external scheme to an `opda:` re-mint where one exists and is dereferenceable.
* **One register, three consumers** — the same scheme must drive SHACL `sh:in` (ONT-0013), DASH `dash:EnumSelectEditor` form controls (ONT-0010/0013), and human-readable rendering, so the labels and notations have to be authored once and reused.

## Considered Options

* **Bare string constraints** — leave each enum as an `xsd:string` with a `sh:in` list of literals. Faithful to the JSON, but the values have no URIs, no governable labels, no definitions, and no provenance; the same `Freehold` literal recurs across `ownershipType`, `marketingTenure`, and `tenure` with no statement that they denote the same concept.
* **OWL enumerated classes (`owl:oneOf` / subclassing)** — model each enum as an OWL class whose extension is a closed set of `owl:NamedIndividual`s, or as a subclass tree. Logically expressive, but it conscripts a reasoner to police membership of a list that is curated by hand, and it misclassifies a vocabulary term (`Detached`) as either an individual or a class.
* **SKOS concept schemes** (chosen) — each enum becomes a `skos:ConceptScheme`; each value a `skos:Concept` with `skos:prefLabel`, `skos:notation`, and `skos:definition`; hierarchical enums use `skos:broader`/`skos:narrower`; closed schemes are flagged for a downstream SHACL `sh:in`. Labels and definitions are sourced from the business glossary where a term exists, with `dct:source` provenance to the glossary row or schema leaf path.

## Decision Outcome

Chosen option: **SKOS concept schemes**, because a controlled vocabulary is precisely what SKOS exists to model — it gives each value a dereferenceable URI, a governable preferred label, a definition, and a notation, without importing the open-world class semantics of OWL or the membership-reasoning of `owl:oneOf` that a hand-curated list neither needs nor wants. It is also the only option that lets one register serve validation, form-rendering, and human comprehension simultaneously, because SKOS labels and notations are first-class.

- **Each enum is a `skos:ConceptScheme`.** Members are tied in with `skos:inScheme`; each member is a `skos:Concept` carrying `skos:prefLabel` (with a `@en` language tag), `skos:notation` for the canonical machine code (e.g. the HMLR `classOfTitleCode` values `10/20/30/…`, the `restrictionTypeCode` values `0/10/20/30`), and `skos:definition`.
- **Labels and definitions are sourced from the business glossary** where the term exists there — `Role`, `Participant`, `Scheme Operator`, `Data Provider`/`Data Recipient`, `TPP` all have glossary definitions that the role and participant-status schemes adopt verbatim rather than re-phrasing. Where no glossary term exists, the `skos:definition` is taken from the canonical schema leaf's `description` (e.g. `councilTaxBand`'s "Band I relates to Wales only").
- **Every concept carries `dct:source`** to its origin: the business-glossary row where one exists, otherwise the canonical schema leaf path (e.g. `…/baspi5.json#…/role`). This follows the term-sourcing and provenance convention established in [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md); this ODR does not re-define that convention, it applies it to the enum register.
- **Hierarchical enums use `skos:broader`/`skos:narrower`.** Where an enum is genuinely a taxonomy rather than a flat list — broadband `typeOfConnection` (None / ADSL copper / Cable / FTTC / FTTP, where the fibre variants narrow under a fibre concept), or transport `transportType` (rail / bus / ferry / airport under modal parents) — the scheme carries the broader/narrower structure rather than flattening it; flat enums (EPC band, `yesNoNotKnown`) stay flat.
- **Closed vs open-ended is flagged per scheme.** Closed schemes (EPC band A–G; council-tax band A–I; `ownerType` {Private individual, Organisation}) are marked for a SHACL `sh:in` over their members in [ONT-0013](./ONT-0013-shacl-validation-and-severity.md). Open-ended schemes (fuel types, transport types, media types) are not `sh:in`-constrained, so the world can extend them without an ODR.
- **External schemes are reused where one governs the domain.** Where an authoritative external register exists and is dereferenceable (council-tax bands as a governed concept; ISO 3166-1 alpha-3 for `countryCode`), the scheme references or aligns to it via `skos:exactMatch`/`skos:closeMatch` rather than re-minting an `opda:` scheme from scratch. Where none fits, an `opda:` scheme is minted under the single hash namespace (ONT-0004).

The **provenance/assurance schemes** (`evidence type`, `verification-method` code, `opda:assuranceLevel`) are owned by [ONT-0009](./ONT-0009-claims-evidence-provenance.md) and the **governance schemes** (DPV personal-data categories, the processing-purpose taxonomy) by [ONT-0012](./ONT-0012-data-governance-layer.md); this ODR provides the SKOS *mechanism* and conventions, and those ODRs author the domain-specific scheme content. The per-enum closed/open-ended call is made during drafting against the data dictionary, not pre-judged here.

### Consequences

* Good, because each enumerated value gains a dereferenceable URI, a governable preferred label, a definition, and a notation — so `Freehold` is one citable concept rather than a literal recurring uncontrolled across `ownershipType`, `marketingTenure`, and `tenure`.
* Good, because labels and definitions are sourced from the business glossary and `dct:source`-traced, so the register speaks the trust framework's settled vocabulary and is auditable to its origin rather than paraphrased per scheme.
* Good, because one register serves SHACL `sh:in` validation, DASH form-control generation, and human rendering at once, since SKOS labels and notations are first-class.
* Good, because the closed/open-ended flag lets genuinely closed lists be hard-validated while extensible lists grow without ODR churn — the constraint is applied where it is correct and withheld where it would freeze the world.
* Bad, because the closed-vs-open-ended judgement is per-enum and deferred to drafting, so the register is not fully determined by this ODR — a reviewer cannot tell from this record alone which of the 160 enums will carry an `sh:in`.
* Neutral, because reconciling cross-overlay synonymy (the recurring `Freehold`/`Commonhold` across distinct enums; `Attached`/`To follow`/`Not applicable` document-status values shared by dozens of leaves) is left to the per-scheme drafting pass — this ODR commits to SKOS as the mechanism, not to the final concept-deduplication map.

### Confirmation

- The SKOS schemes are validated against the W3C SKOS integrity constraints (a concept in exactly one primary scheme via `skos:inScheme`; `skos:prefLabel` unique per language per concept; `skos:broader`/`skos:narrower` acyclic).
- Closed schemes are confirmed by the presence of a corresponding SHACL `sh:in` shape in [ONT-0013](./ONT-0013-shacl-validation-and-severity.md) whose members are exactly the scheme's concepts; open-ended schemes are confirmed by the *absence* of such a shape.
- Each concept's `skos:prefLabel`/`skos:definition` is checked to carry a `dct:source` resolving to a business-glossary row or a canonical schema leaf path, per the [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) provenance convention.
- The register is exercised by the BASPI5 vertical slice (Q7 MVP): the `role`, `sellersCapacity`, `councilTaxBand`, and `builtForm` schemes must drive both a valid `sh:in` and a rendered `dash:EnumSelectEditor` with glossary-sourced labels.

## Pros and Cons of the Options

### Bare string constraints

* Good, because it is the lowest-effort, most literal translation of the JSON `enum` arrays.
* Bad, because the values have no URIs, no governable labels, no definitions, and no provenance — the register is uncitable and unmaintainable, and identical literals across distinct enums carry no statement of co-reference.

### OWL enumerated classes (`owl:oneOf` / subclassing)

* Good, because it is fully expressive in OWL and a reasoner can police closed membership.
* Bad, because it conscripts a reasoner to compute membership of a hand-curated list — machinery without a purpose — and misclassifies vocabulary terms as either individuals or classes (Baker/Knublauch, Q5).
* Bad, because subclassing implies an `is-a` relation (`Freehold` *is a kind of* tenure-type-class) that does not hold for a flat value list.

### SKOS concept schemes

* Good, because SKOS is purpose-built for controlled vocabularies — prefLabel, notation, definition, and broader/narrower are first-class, serving validation, rendering, and comprehension from one register.
* Good, because it reuses the business glossary's settled labels and definitions via `dct:source`, rather than re-inventing them.
* Bad, because the closed/open-ended flag and the cross-overlay concept-deduplication are per-scheme judgements that this mechanism enables but does not itself decide.

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Vocabularies**: SKOS (concept schemes, labels, notations, semantic relations); Core (`dct:source`/`dct:` on schemes per the commons-substrate decision, [ONT-0002](./ONT-0002-ontology-language-adoption.md) as amended by [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md)). SSSOM is **not** used for the internal `dct:source` references (ONT-0014 defers it; `dct:source` to a form-question IRI suffices for single-source internal refs) — it would earn its place only when these schemes map to *external* vocabularies (FIBO, INSPIRE), at which point `skos:exactMatch`/`skos:closeMatch` mappings could carry SSSOM justification metadata.
- **Glossary & data dictionary as inputs**: the schemes draw their enumerated members from the data dictionary's `enum` columns (`data-dictionary.md` / `data-dictionary-canonical.json`) — e.g. the `role` enum on `baspi5.json`, `ownershipType` {Freehold, Commonhold, Leasehold, Other}, `riskIndicator`, `yesNoNotKnown`, `assignedContact` {Landlord, Management Company, Managing Agent, the Lessees}, `councilTaxBand` {A–I}, `currentEnergyRating` {A–G}, `builtForm`, `sellersCapacity`, `participantStatus`. Each concept's `skos:prefLabel`/`skos:definition` is sourced from the **business glossary** (`source/00-deliverables/semantic-models/business-glossary.md`) where a term exists — `Participant`, `Role`, `Scheme Operator`, `Data Provider`, `Data Recipient`, `TPP` — and `dct:source` cites the glossary row or canonical schema leaf path. See [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) for the general term-sourcing and provenance convention. SKOS-specific reviewers (Antoine Isaac, Alistair Miles, as SKOS Reference editors) inform the broader/narrower and integrity-constraint conventions.
- **Indicative schemes (non-exhaustive — enumerated during drafting)**: Roles & capacity (participant `role`, `sellersCapacity`, `ownerType`, `participantStatus`); Tenure & legal (`tenure`, `marketingTenure`, `ownershipType`, `restrictionTypeCode`, `classOfTitleCode`, `subRegisterCode`); Built form (`builtForm`, `constructionType`, `units` {square metres, square feet}, `priceQualifier`); Energy & utilities (`currentEnergyRating` A–G, `centralHeatingFuelType`, `heatingType`, broadband `typeOfConnection`); Encumbrances (`councilTaxBand` A–I, `feeType`, `rentFrequency`); Searches (`transportType`, `ofstedRating`, `mediaType`); Provenance/assurance (evidence type, verification-method code, `opda:assuranceLevel` → [ONT-0009](./ONT-0009-claims-evidence-provenance.md)); Governance (DPV personal-data categories, processing-purpose taxonomy → [ONT-0012](./ONT-0012-data-governance-layer.md)).
- **Deliverables (when fleshed out)**: one TTL per scheme (or a consolidated `vocabularies.ttl`); the closed/open-ended register; the cross-overlay concept-deduplication map; cross-links to the modules and to the SHACL/DASH consumers.
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); foundation [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) (term-sourcing/provenance convention); consumers — Agents & Roles [ONT-0006](./ONT-0006-agents-and-roles.md), Property & Land [ONT-0005](./ONT-0005-property-land-identity-crux.md), descriptive attributes [ONT-0008](./ONT-0008-property-descriptive-attributes.md), Claims & Evidence [ONT-0009](./ONT-0009-claims-evidence-provenance.md), Governance [ONT-0012](./ONT-0012-data-governance-layer.md); SHACL `sh:in`/DASH consumer [ONT-0013](./ONT-0013-shacl-validation-and-severity.md); catalogue [ONT-0002](./ONT-0002-ontology-language-adoption.md) as amended by [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q5 (overlays/enums; Baker/Knublauch/Pandit).

## Vote and Dissent

This cross-cutting ODR records no vote of its own — it is a planning record to be fleshed out in its own follow-up session. The Council Session 001 positions it inherits:

- **Q2/Q5 SKOS for value lists** — Baker and Knublauch hold that the JSON enums are controlled vocabularies, modelled in SKOS, governable without OWL semantics. No recorded dissent on the SKOS-over-OWL choice.
- **Q2 Dublin Core as commons substrate** (Baker, carried) — `dct:source` provenance on each concept rests on this reclassification.
- **Q2 SSSOM deferred** (≈5-4, Cagle dissent recorded in [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md)) — bears on this register: internal enum provenance uses `dct:source`, not SSSOM mapping records; SSSOM would enter only for external-vocabulary mappings.
