---
status: proposed
date: 2026-05-27
kind: pattern
tags: [enumerations, skos, vocabularies, glossary, ufo, council-cleared, namespace-blocked]
scope: []
council: session-011
supersedes: []
depends-on: [ODR-0004]
implements: [ODR-0003, ODR-0017]
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

### Operational specifications (added by [Session 011](./council/session-011-enumeration-vocabularies.md))

Session 011 (Full Council, substrate mode; **B3 pilot `consensus-mode: hive-mind/typed-output` for Q8**; two-artefact discipline session-wide; Queen Isaac/Miles; DA Gandon — 2 withdrawn / 5 conceded, full DA withdrawal) discharges A9 §Per-kind discipline (b) inline at the scheme level. The numbered rules above carry; the operational specifications below state the (a) UFO/DOLCE meta-category per scheme, (b) IC over named hard cases at the scheme level, and (c) artefact realisation. **Third `kind: pattern` ODR to discharge under A9.**

#### 1a. Every JSON enum becomes a `skos:ConceptScheme` + steward declaration (S011 Q1)

Per the W3C SKOS Reference §3, every controlled vocabulary needs a `skos:ConceptScheme`. No floor: cross-scheme co-reference via `skos:exactMatch`/`closeMatch` requires every enum's concepts to live in a scheme; PII-sensitive enums need the scheme-IRI to land DPV co-annotations on (Pandit's DPV evidence). Each scheme declares its **steward** via `dct:creator`/`dct:publisher` (Baker DCMI Usage Board discipline — one named expert with deputy per FIBO precedent).

**SHACL invariant** (Cagle amendment — `opda-shapes.ttl`):

```turtle
opda:ConceptInExactlyOnePrimarySchemeShape a sh:NodeShape ;
    sh:targetClass skos:Concept ;
    sh:property [
        sh:path skos:inScheme ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Concept must be in exactly one primary scheme (W3C SKOS integrity constraint)."
    ] .
```

#### 2a. Cardinality per SKOS §S14/§S15 + Pandit PII-strict amendment (S011 Q2)

| Property | Cardinality (per language) | Source | Severity |
|---|---|---|---|
| `skos:prefLabel @en` | exactly 1 (MUST) | SKOS Reference §S14 | `sh:Violation` |
| `skos:notation` | 1..* with distinct datatypes (Q7 elaborates) | SKOS Reference §S15 | `sh:Violation` if 0; `sh:Info` if >1 |
| `skos:definition @en` | exactly 1 (SHOULD; **MUST for PII-bearing per Pandit amendment**) | DCMI UB + ICO compliance | `sh:Violation` (PII); `sh:Warning` (non-PII) |
| `skos:altLabel @en` | 0..* | (no shape) | (no constraint) |

Pandit's PII-strict amendment: multiple definitions per language for PII-bearing concepts creates regulatory ambiguity (ICO *Guidance on Lawful Bases for Processing* 2023 §Definition stability); `skos:definition @en` exactly 1 is `sh:Violation`-severity for PII schemes.

#### 4a. Definition source — verbatim regulator citation discipline (S011 Q4)

Inherits ODR-0004 §7a five-line precedence (W3C/external spec > OPDA Trust Framework > regulators > glossary > schema annotation). **For regulator-governed concepts** (GDPR/ICO/FCA/HMLR/VOA), `skos:definition` cites the regulator's text **verbatim** (Pandit DPV-PD §Scope discipline — paraphrase introduces audit-trail risk that downstream compliance audits cannot rely on). OPDA-context paraphrase moves to `skos:scopeNote`, never `skos:definition`. Mandatory for DPV-PD-inherited schemes; strongly recommended for all regulator-governed schemes. `dct:source` URI pins the version IRI of the regulator's published list (per ODR-0004 §7a).

#### 5a. Three-case lifecycle discipline + Cagle SHACL-AF deprecation rule (S011 Q5)

Three lifecycle cases, each with named mechanism (Gandon DA withdrawal condition):

| Lifecycle event | Mechanism | Citation |
|---|---|---|
| **Deprecation-with-replacement** | `owl:deprecated true` + `dct:isReplacedBy` to successor | DCMI; ISO 25964-1:2011 §8 |
| **Substantive-redefinition (derivation)** | `prov:wasDerivedFrom` to predecessor; predecessor stays live | PROV-O Recommendation §3 |
| **Retirement-without-successor** | `owl:deprecated true` + `skos:historyNote` recording retirement reason+date | DCMI |
| **Minor-edit (label rephrase; definition tightening; no semantic change)** | `dct:modified` timestamp only; no relation | Gandon DA condition |
| **Equivalent in external scheme** | `skos:exactMatch`/`closeMatch` | SKOS Reference §4 |
| **Scheme-level versioning** | `owl:versionIRI` + `dct:hasVersion`/`dct:isVersionOf` on `skos:ConceptScheme` | OWL 2 + DCMI |

**Pandit PII-retention amendment:** for PII-bearing schemes, deprecated concepts remain dereferenceable for the regulatory retention window (typical 12y post-completion HMLR; trust-framework-defined elsewhere). `owl:deprecated true` is a state flag, NOT a delete signal.

**Cagle SHACL-AF deprecation-chain rule** (re-instantiates ODR-0005 §6a pattern; **fourth citing site for the SHACL-AF non-blocking-data-quality-rules pattern** — `pattern`-extraction spawn-rule fires per §Consequences below):

```turtle
opda:DeprecatedConceptValueRule a sh:NodeShape ;
    sh:targetClass opda:EnumValueBearer ;
    sh:sparql [
        sh:select """
            SELECT $this ?value ?successor WHERE {
                $this ?p ?value .
                ?value owl:deprecated true .
                OPTIONAL { ?value dct:isReplacedBy ?successor }
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "Node {$this} uses deprecated value {?value}; replaced by {?successor} (if substantive succession)."
    ] .
```

Rule fires `sh:Info` for historical data with substantive succession (`dct:isReplacedBy` present); `sh:Warning` (variant rule) for historical data with retirement (no `dct:isReplacedBy`). NEW data using deprecated value triggers `sh:Violation` from the scheme's `sh:in` (the `sh:in` covers ACTIVE concepts only; deprecated concepts removed at regeneration). Three-part operational test in §Enforcement.

**`sh:in` regeneration discipline.** When a scheme deprecates a concept, the `sh:in` shape MUST be regenerated to exclude the deprecated concept. The generator (per ODR-0004 §6a deterministic emission) does this mechanically; CI byte-identity test catches drift.

#### 7a. Notation typing — `xsd:string` + `sh:pattern` default (S011 Q7)

Per Cagle's SHACL operationalisation analysis: scheme-specific custom datatypes (`opda:EPCBandLiteral` etc.) are **NOT minted by default**. `xsd:string` + `sh:pattern` regex on lexical form is the operational discipline. Custom datatypes are admissible per SKOS §S15 (multi-typed notations) but only on downstream-consumer demand (e.g. regulator audit pipeline requiring `sh:datatype` dispatch).

| Scheme type | Notation typing | Validation |
|---|---|---|
| Closed lexical-form-constrained (EPC band A-G; council-tax band A-I) | `xsd:string` | `sh:pattern "^[A-G]$"` + `sh:in` on concept URI |
| Closed set-membership (`ownerType` {Private/Organisation}) | `xsd:string` | `sh:in` on concept URI |
| Closed numeric-coded (HMLR `classOfTitleCode` 10/20/30) | `xsd:string` | `sh:pattern "^[1-9][0-9]$"` + `sh:in` on active set |
| Open-ended (fuel types, transport types, media types) | `xsd:string` | no constraint |

When a downstream consumer genuinely requires `sh:datatype` dispatch, the scheme MAY carry a typed `skos:notation` alongside the `xsd:string` notation per SKOS §S15. Generator emits the typed notation conditionally.

#### 8a. UFO meta-category per scheme — seven-category framework (S011 Q8 — B3 pilot typed output)

Per A9 §Per-kind discipline (b), this ODR's `kind: pattern` commitment requires UFO/DOLCE meta-category statement at the scheme level. The **seven-category framework** below extends Scope-Check 1 Q3's four original candidates with three Council-authored extensions (each grounded in published UFO/DOLCE sources). The framework's SKOS-binding is Council-authored — `dct:source <ODR-0011>` cites the SKOS-application; upstream `dct:source` cites UFO/DOLCE for each category (Gandon DA Q8 withdrawal condition (b) — dual `dct:source`).

| UFO meta-category | Upstream `dct:source` | Definition | Example schemes |
|---|---|---|---|
| **Role label** | Guizzardi 2005 Ch. 4 (UFO Role) + ODR-0011 (SKOS-binding) | Labels for anti-rigid Roles a Person/Organisation plays in a Relator | `role` |
| **Phase label** | Guizzardi 2005 Ch. 4 (UFO Phase) + ODR-0011 | Labels for intra-Kind phases a Substance Kind passes through | `participantStatus` |
| **Quale-in-Region** | Masolo et al. 2003 D18 §4.3 (DOLCE Quality region) + ODR-0011 | Values in a metric-banded quality region of a Quality | `councilTaxBand`, `currentEnergyRating`, `builtForm`, `ownershipType` |
| **Method/plan code** | Guizzardi 2005 Ch. 4 + Guizzardi & Wagner 2010 (action modelling) + ODR-0011 | Codes for procedural methods or plans authorising an Activity | `sellersCapacity` |
| **Quality Region** (extension) | Masolo et al. 2003 D18 §4.3 + ODR-0011 | The scheme IS the region itself (an ordered range of Quality values) | `opda:assuranceLevel` |
| **Substance Kind label** (extension) | Guizzardi 2005 Ch. 4 + ODR-0011 | Labels for UFO sub-Kinds; bound to OWL sub-class hierarchy via `skos:exactMatch` (NEVER `owl:sameAs` per ODR-0005 Anti-pattern §5) | `tenureKind` (Freehold/Leasehold/Commonhold) |
| **Quality Value** (extension) | Masolo et al. 2003 D18 §4.3 + ODR-0011 | Values of a UFO Quality particularising a Substance Kind (per S015 §2a) | `addressVariant` (title/marketing/inspire) |

**Per-scheme typed-output table** (B3 pilot artefact; consumed mechanically by `odr-review` lint + SKOS scheme generator + LLM tooling per Cagle DBpedia 2017 lesson):

| Scheme | UFO category | Governance flag (Baker+Pandit) | SHACL targeting (Cagle) |
|---|---|---|---|
| `role` | Role label | PII-trigger when regulated-profession | Role-bearing entity |
| `sellersCapacity` | Method/plan code | (no PII flag) | Activity (capacity-exercise event) |
| `participantStatus` | Phase label | DPV processing-event trigger | Kind-in-phase (Participant) |
| `ownershipType` | Quale-in-Region | (no PII flag) | LegalEstate's ownership-structure quale |
| `builtForm` | Quale-in-Region | (no PII flag) | Property's physical-form quale |
| `councilTaxBand` | Quale-in-Region | HMLR-published; low PII | Property's council-tax-band quale |
| `currentEnergyRating` | Quale-in-Region | (no PII flag) | Property's energy-rating quale |
| `opda:assuranceLevel` | Quality Region | Lawful-basis trigger | Quality space (assurance strength) |
| `tenureKind` | Substance Kind label | HMLR-published; low PII | Sub-Kind via `skos:exactMatch` |
| `addressVariant` (S015) | Quality Value | PII-regime discriminator | Address's variant Quality value |

**Generator emission discipline** (per ODR-0004 §6a deterministic emission):

```turtle
opda:roleScheme a skos:ConceptScheme ; opda:ufoCategory "RoleLabel" ;
    dct:source <https://...guizzardi-2005-ch4> , <ODR-0011> .
opda:tenureKindScheme a skos:ConceptScheme ; opda:ufoCategory "SubstanceKindLabel" ;
    dct:source <https://...guizzardi-2005-ch4> , <ODR-0011> .
# ... etc. per the table above
```

**Cross-scheme consistency check (`SubstanceKindLabel` schemes only):** each scheme member MUST carry `skos:exactMatch` from the SKOS concept to the corresponding OWL sub-class (e.g. `opda:tenureKind/Freehold skos:exactMatch opda:Freehold`). NEVER `owl:sameAs`.

**`odr-review` lint extension contract** (flagged for next skill release per ODR-0004 §Consequences): the lint reads each `kind: pattern` ODR's `skos:ConceptScheme` declarations and verifies (i) `opda:ufoCategory` triple presence; (ii) value in the seven-category vocabulary above; (iii) dual `dct:source` (upstream UFO + `<ODR-0011>` Council-authored). Blocker on `status: accepted` per A9 enforcement discipline.

## Alternatives

- **Bare string constraints** — leave each enum as `xsd:string` with `sh:in` literals. Fatal flaw: values have no URIs, no governable labels, no definitions, no provenance; identical literals across distinct enums (`Freehold` in `ownershipType`, `marketingTenure`, `tenure`) carry no statement of co-reference.
- **OWL enumerated classes (`owl:oneOf` / subclassing)** — model each enum as an OWL class with closed `owl:NamedIndividual` extension, or as a subclass tree. Fatal flaw: conscripts a reasoner to police membership of a hand-curated list — machinery without a purpose — and misclassifies vocabulary terms (`Detached`) as either individuals or classes (Baker/Knublauch, Q5).

## Consequences

**Added by [Session 011](./council/session-011-enumeration-vocabularies.md) — Gandon DA full withdrawal (2 withdrawn / 5 conceded); B3 pilot third site EXPAND threshold reached.**

- **Namespace block carries forward.** ODR-0011 stays `status: proposed` per inherited ODR-0004 namespace block. Generator output for `opda:<scheme>Scheme` declarations carries `dct:status "draft"` until WG ratifies the namespace string.
- **A9 pressure-test passes (third `kind: pattern` ODR).** §Operational specifications 1a/2a/4a/5a/7a/8a discharge A9 (a) UFO/DOLCE meta-category at scheme level + (b) IC over named hard cases (closed-vs-open, three-case lifecycle, cardinality bands) + (c) artefact realisation via SHACL shapes + SHACL-AF deprecation rule + generator emission.
- **B3 pilot third-site verdict: EXPAND threshold satisfied.** Two-artefact discipline (narrative + structured tally) confirmed at three pilot sites (S005 Full Council + S015 Reduced Council + S011 Full Council substrate-mode). **Two-artefact discipline becomes the DEFAULT across remaining sessions** (S006, S007, S009, S010, S012, S013). Session-level pilot labels (`hive-mind/byzantine` for B2, `hive-mind/typed-output` for B3) retired; the underlying discipline (two-artefact + per-question structured tally + DA scorecard mechanical-check) is the operational practice. **ODR-0001 amendment flagged for follow-up author-only session** recording the EXPAND verdict + §Format tiers update.
- **`pattern`-extraction spawn-rule fires (fourth citing site reached).** The SHACL-AF non-blocking-data-quality-rules pattern appears in: ODR-0005 §6a (UPRN succession `sh:Info`); ODR-0009 (PROV-O Claims/Evidence, S001 Q6 Moreau); ODR-0015 §4a (INSPIRE/AddressBase succession `sh:Info`); ODR-0011 §5a (concept deprecation chain `sh:Info`/`sh:Warning`). Per ODR-0001 A9 §Artefact identity test fourth-citing-site threshold, **spawn a shared `pattern` ODR** (suggested: `opda-shacl-af-quality-rules`). The four citing sites become `implements:` of the extracted pattern. **Flagged for Queen action in next session.**

**Original consequences (carry forward):**

- Adopt SKOS as the mechanism for every enum register; do not model enums as OWL classes or bare string constraints.
- Source `skos:prefLabel`/`skos:definition` from the business glossary verbatim where the term exists; cite `dct:source` on every concept (+ verbatim-citation discipline for regulator-governed concepts per §4a above).
- Author one scheme per enum (no floor); reuse external schemes via `skos:exactMatch`/`skos:closeMatch` where a governed register exists.
- Flag each scheme as closed or open-ended during drafting; closed schemes flow into a SHACL `sh:in` per [ODR-0013](./ODR-0013-shacl-validation-and-severity.md), open-ended schemes do not.
- Reconciling cross-overlay synonymy (recurring `Freehold`/`Commonhold`; `Attached`/`To follow`/`Not applicable` across dozens of leaves) is a per-scheme drafting concern.

**Downstream ODR inheritance (deliberative level):**

- **ODR-0006 (Agents & Roles).** Consumes the `role` SKOS scheme (Role label); `participantStatus` (Phase label); + ODR-0011 §8a per-scheme UFO category framework for any additional Agent-related vocabularies.
- **ODR-0007 (Transactions & Lifecycle).** Consumes Method/plan codes (`sellersCapacity`); lifecycle phase tagging discipline.
- **ODR-0008 (Property descriptive attributes).** Consumes Quale-in-Region schemes (`councilTaxBand`, `currentEnergyRating`, `builtForm`, `ownershipType`); Substance Kind label scheme (`tenureKind`).
- **ODR-0009 (Claims, Evidence & Provenance).** Authors `opda:assuranceLevel` (Quality Region) under the framework here; consumes `verificationMethod` (Method/plan code).
- **ODR-0012 (Data-Governance Layer).** Inherits **governance-sensitivity column** alongside UFO category column (Baker+Pandit Q8 amendment); class-level DPV co-annotations per scheme; PII-history retention discipline per §5a Pandit amendment.
- **ODR-0013 (SHACL Validation & Severity).** Inherits the `sh:Info`/`sh:Warning` severity tier for the Cagle deprecation rule + the `sh:in` regeneration discipline.

**Phase-3.5 audit session flagged (Q3 deferral):** SSSOM re-open trigger (S002 Q11) + cross-vocabulary mapping with FIBO/INSPIRE/Land-Registry-RDF external vocabularies route to a Phase-3.5 audit session after S006/S007/S008 ratify. The audit refines Q1 against real usage and adjudicates SSSOM admission.

**Re-open triggers (recorded for future sessions):**

- SSSOM admission per S002 Q11 named trigger; Phase-3.5 audit owns the deliberation.
- Eighth UFO category candidate: if a Phase-3.5 module session surfaces a scheme that fits none of the seven categories (Role label / Phase label / Quale-in-Region / Method/plan code / Quality Region / Substance Kind label / Quality Value), an Author-only amendment to ODR-0011 adds the category with explicit `dct:source` to UFO/DOLCE + ODR-0011.

## References

- **Target versions**: RDF 1.2 and SHACL 1.2 + SHACL-AF (`sh:rule`, `sh:sparql`), per the Core-tier pin in [ODR-0002](./ODR-0002-ontology-language-adoption.md).
- **Vocabularies**: SKOS (concept schemes, labels, notations, semantic relations) per W3C SKOS Reference 2009 (Miles & Bechhofer eds.) §§1.4, S14, S15, §3, §4, §S26-29, §S37-46; Core (`dct:source`/`dct:isReplacedBy`/`dct:modified`) per ODR-0004 §7a; PROV-O Recommendation (Moreau & Missier 2013) for derivation/lineage succession; OWL 2 (`owl:deprecated`, `owl:versionIRI`); ISO 25964-1:2011 §8 (thesaurus maintenance discipline).
- **Foundational ontology**: Guizzardi 2005 *Ontological Foundations for Conceptual Modeling*, Ch. 4 (UFO Substance Kind / Role / Phase / Relator / Mode / Quale taxonomy); Guizzardi 2015 (UFO 2007/2011/2015 lineage); Masolo et al. 2003 *WonderWeb D18* §4.3 (DOLCE Quality / Quality Region / Quale); Guizzardi & Wagner 2010 (action-modelling / method-codes).
- **Inputs**: data dictionary `enum` columns (`data-dictionary.md` / `data-dictionary-canonical.json`); business glossary (`source/00-deliverables/semantic-models/business-glossary.md`).
- **External authority sources** (cited via `dct:source` with version pin per ODR-0004 §7a): HMLR Practice Guides (PG 1 First Registration; PG 16 Cancellation; PG 40 Plans) for `restrictionTypeCode` / `classOfTitleCode` / `subRegisterCode` definitions; VOA published council-tax band definitions; UK MEES regulation for EPC bands; FCA Handbook glossary for regulated-profession `role` values; ICO published taxonomies for PII categories; ISO 3166-1:2020 for `countryCode`.
- **Related ODRs**: programme anchor [ODR-0003](./ODR-0003-pdtf-ontology-programme.md); foundation [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md) (URI/term-sourcing/three-graph/exemplar inheritance); methodology [ODR-0001 §What an ODR records (per-kind discipline)](./ODR-0001-linked-data-council-methodology.md) (A9 — ODR-0011 is the **third** `kind: pattern` ODR to discharge under it). Upstream `pattern`-ODR precedents: [ODR-0005 §2a](./ODR-0005-property-land-identity-crux.md) (UFO Substance Kind discipline) + §6a (SHACL-AF rule pattern); [ODR-0015 §2a](./ODR-0015-address-and-geography.md) (UFO Quality particularising Substance Kind precedent for `addressVariant` Quality Value category). Downstream consumers: [ODR-0006](./ODR-0006-agents-and-roles.md) (role + participantStatus); [ODR-0007](./ODR-0007-transactions-and-lifecycle.md) (sellersCapacity + lifecycle phases); [ODR-0008](./ODR-0008-property-descriptive-attributes.md) (Quale-in-Region descriptive schemes); [ODR-0009](./ODR-0009-claims-evidence-provenance.md) (authors `opda:assuranceLevel` Quality Region; consumes verificationMethod); [ODR-0010](./ODR-0010-overlay-profile-mechanism.md) (overlay profiles may filter schemes by UFO category); [ODR-0012](./ODR-0012-data-governance-layer.md) (governance-sensitivity column; PII history retention; DPV class-level co-annotations); [ODR-0013](./ODR-0013-shacl-validation-and-severity.md) (SHACL severity tier for Cagle deprecation rule).
- **Council deliberation**: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q2 (vocabulary admission); [scope-check-1-programme](./council/scope-check-1-programme.md) Q3 (Guizzardi UFO-per-scheme sub-finding adopted as A5, 8-1); **[session-011 — Enumeration Vocabularies](./council/session-011-enumeration-vocabularies.md)** (2026-05-27; Full Council, substrate mode; B3 pilot `consensus-mode: hive-mind/typed-output` for Q8; two-artefact discipline session-wide; Queen Isaac/Miles extended; DA Gandon — 2 withdrawn / 5 conceded, full DA withdrawal). 7 questions (Q3 deferred to Phase-3.5 audit). Q1-Q7 4-0 votes with Gandon DA Q5 mild attack converted into three-case discipline; Q8 4-0 typed-output verdict with seven-category framework + dual `dct:source` (upstream UFO/DOLCE + ODR-0011 Council-authored SKOS-binding). **B3 pilot third site EXPAND threshold reached** — two-artefact discipline becomes default across remaining sessions. **Pattern-extraction spawn-rule fires** for SHACL-AF non-blocking-data-quality-rules (fourth citing site). Per-expert working notes under [`council/session-011-enumeration-vocabularies/`](./council/session-011-enumeration-vocabularies/).
- **Ratification provenance**: [session-011](./council/session-011-enumeration-vocabularies.md) (2026-05-27). Phase 2.5 substrate gate cleared substantively; formal `status: accepted` awaits WG namespace ratification (inherited from ODR-0004).
- **Deliverables (when fleshed out)**: one TTL per scheme (or a consolidated `vocabularies.ttl`); the closed/open-ended register; the cross-overlay concept-deduplication map; cross-links to modules and SHACL/DASH consumers.
- **Related**: anchor [ODR-0003](./ODR-0003-pdtf-ontology-programme.md); foundation [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md); consumers — Agents & Roles [ODR-0006](./ODR-0006-agents-and-roles.md), Property & Land [ODR-0005](./ODR-0005-property-land-identity-crux.md), descriptive attributes [ODR-0008](./ODR-0008-property-descriptive-attributes.md), Claims & Evidence [ODR-0009](./ODR-0009-claims-evidence-provenance.md), Governance [ODR-0012](./ODR-0012-data-governance-layer.md); SHACL `sh:in`/DASH consumer [ODR-0013](./ODR-0013-shacl-validation-and-severity.md); catalogue [ODR-0002](./ODR-0002-ontology-language-adoption.md) as amended by [ODR-0014](./ODR-0014-vocabulary-catalogue-amendments.md).
- **Council deliberation**: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q5 (overlays/enums; Baker/Knublauch/Pandit). Q2 Dublin Core as commons substrate (Baker, carried) and Q2 SSSOM deferred (Cagle dissent in [ODR-0014](./ODR-0014-vocabulary-catalogue-amendments.md)) bear on this register.
- **SKOS reviewers**: Antoine Isaac and Alistair Miles (SKOS Reference editors) inform the broader/narrower and integrity-constraint conventions.
