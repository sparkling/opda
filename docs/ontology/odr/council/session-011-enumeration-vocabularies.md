# Council Session 011 — Enumeration Vocabularies (Phase 2.5 substrate; B3 pilot Q8)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0011 — Enumeration Vocabularies](../ODR-0011-enumeration-vocabularies.md) (`kind: pattern`; A9 §Per-kind discipline (b) applies at the scheme level).
- **Queen / Moderator:** **Antoine Isaac / Alistair Miles** (extended panel — W3C SKOS Working Group editors of SKOS Reference 2009). Queen synthesises drawing on the standing panel's positions plus the DA's. Isaac/Miles's SKOS WG authority on scheme-membership, cardinality, and notation typing is decisive for Q1, Q2, Q7 frameworks; the substantive UFO-typing question (Q8) routes to Guizzardi-solo.
- **Devil's Advocate:** Fabien Gandon (W3C / Inria — RDF/RDFS/OWL standards). DA selected per ODR-0001 §Roles: Gandon's published methodology pushes back hardest when SKOS-vs-OWL distinctions matter formally.
- **Panel (4 teammates + DA + Queen; substrate mode):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | guizzardi-solo | Giancarlo Guizzardi (UFO load on Q8) | [guizzardi-solo.md](./session-011-enumeration-vocabularies/guizzardi-solo.md) |
  | governance-pair | Tom Baker + Harshvardhan Pandit | [baker-pandit.md](./session-011-enumeration-vocabularies/baker-pandit.md) |
  | shacl-solo | Kurt Cagle (SHACL + AI-RDF; Q5/Q7 depth) | [cagle.md](./session-011-enumeration-vocabularies/cagle.md) |
  | da-solo | **Fabien Gandon (DA)** | [gandon-da.md](./session-011-enumeration-vocabularies/gandon-da.md) |

- **Input Documents:**
  - [ODR-0011 — Enumeration Vocabularies](../ODR-0011-enumeration-vocabularies.md) (substantive stub with detailed §Rules already).
  - [ODR-0001 §What an ODR records (per-kind discipline)](../ODR-0001-linked-data-council-methodology.md) — A9 amendment 2026-05-27.
  - [ODR-0002](../ODR-0002-ontology-language-adoption.md) — SKOS Core-tier admission.
  - [ODR-0004 §3a/6a/7a/8a](../ODR-0004-pdtf-ontology-foundation.md) — three-graph separation, generator-first, term-sourcing precedence, exemplar discipline.
  - [ODR-0005 §2a/3a-c/6a/6b](../ODR-0005-property-land-identity-crux.md) — UFO Substance Kind precedent; SHACL-AF succession rule pattern; Address routed to ODR-0015.
  - [ODR-0015 §2a/6a](../ODR-0015-address-and-geography.md) — `opda:Address` Substance Kind + `opda:addressVariant` as UFO Quality.
  - [Scope-Check 1](./scope-check-1-programme.md) Q3 — Guizzardi UFO-per-scheme sub-finding adopted as A5 (8-1).
  - W3C: SKOS Reference 2009 (Miles & Bechhofer eds.) §§1.4, S14, S15, §3, §S26-29, §S37-46; PROV-O Recommendation; SHACL Core 1.2; DCMI 2013 (Baker, Bechhofer, Isaac, Miles); ISO 25964-1:2011 §8.
  - Foundational: Guizzardi 2005 Ch. 4; Masolo et al. 2003 *WonderWeb D18* §4.3; Guizzardi & Wagner 2010 (action modelling).
- **`consensus-mode`:** **B3 pilot — `hive-mind/typed-output` for Q8 only** (per Scope-Check 2 amendment B3); two-artefact discipline (narrative + structured tally) applies session-wide per B2-pilot EXTEND-CAUTIOUSLY recommendation from S005 + S015. **Third pilot site** for two-artefact discipline EXPAND threshold.
- **Format tier:** **Full Council, substrate mode.** Phase 2.5 substrate; Q3 (cross-vocabulary mapping) deferred to Phase-3.5 audit per plan §S011 two-pass option.

## Context

ODR-0011 is the substrate session for the 160 enum leaves in PDTF v3. The stub is substantially developed — §Rules already commits to SKOS-as-mechanism, closed-vs-open `sh:in` discipline, `dct:source` provenance per concept, single hash namespace per ODR-0004. The session's task is to (a) pressure-test the existing rules against SKOS WG authority (Q1/Q2/Q4/Q6/Q7); (b) discharge the lifecycle question (Q5) the stub left underspecified; and (c) deliver the B3 pilot's typed-output verdict on Q8 — per-scheme UFO meta-category, with the four-category framework from Scope-Check 1 Q3 operationally tested.

ODR-0011 is `kind: pattern` per A9 §Per-kind discipline (b) — and at the scheme level. ODR-0005 §2a discharged A9 (a) for `opda:Property` / `opda:LegalEstate` / `opda:RegisteredTitle` as Substance Kinds; ODR-0015 §2a discharged it for `opda:Address` as Substance Kind. S011 discharges A9 (a) at the *scheme* level — per scheme, not per concept. The per-scheme UFO category is the B3 pilot's structured output, consumed by `odr-review` lint, the SKOS scheme generator, and LLM tooling.

This is the **third** pilot site for the two-artefact discipline (after S005 Full Council + S015 Reduced Council). The three-pilot threshold for EXPAND (full adoption across all sessions) is satisfied iff the structured tally captures dissent the narrative reading would bury — observed in S005 (Davis+Cagle Q5) and S015 (Allemang DA Q3); awaiting confirmation here.

**Substrate mode (per plan §S011 two-pass option).** Q3 (cross-vocabulary mapping) genuinely benefits from module context (the module sessions consuming the SKOS schemes will surface real mapping needs); it defers to a Phase-3.5 audit session after S006/S007/S008. Q1 retains a *provisional* threshold; Q1 may tighten in the audit. The substrate-mode work is Qs 1, 2, 4, 5, 6, 7 + Q8 (the B3 pilot).

## Pre-flight scope check

Per ODR-0001 §Pre-flight scope check. Outcome: **ratify-as-is**.

- Coherent proposition (SKOS substrate for 160 enums; Phase 2.5 promotion out of cross-cutting; substrate mode with Q3 deferral).
- No retire signal (every module session consumes the SKOS schemes; the substrate is load-bearing).
- No re-scope signal — Q3 deferral is plan-ratified, not a re-scope.
- A9 application: ODR-0011 is `kind: pattern`; the per-scheme UFO meta-category MUST is the B3 pilot's load-bearing question.

## Question-by-question verdicts

### Q1 — Scheme membership criteria

**Positions:**

- **Guizzardi-solo:** Floor with cross-overlay-reuse trigger (≥3 members AND (cross-overlay reuse OR governable-by-authority OR cited from another ODR's `## References`)).
- **Baker+Pandit:** Every JSON enum becomes a `skos:ConceptScheme` (no floor); amendment: each scheme names a steward via `dct:creator`/`dct:publisher`. DPV-side: PII-sensitive enums must have schemes for DPV co-annotation to attach.
- **Cagle:** Concur stub + SHACL invariant on one primary scheme per concept.
- **Gandon DA:** CONCEDED — W3C SKOS Reference §3 settles this; no published alternative.

**Verdict:** **4-0 FOR every-enum-a-scheme** (Baker+Pandit's framing prevails over Guizzardi's floor proposal on Pandit's DPV evidence — PII-sensitive enums need the scheme-IRI to land annotations on; a two-member `yesNoNotKnown` enum could in principle be `sh:in`-only, but the cost of NOT having a scheme is the cross-scheme co-reference problem). **Amendment adopted:** each scheme declares its steward via `dct:creator`/`dct:publisher` (Baker DCMI Usage Board discipline). Cagle's SHACL invariant on one-primary-scheme-per-concept adopted as enforcement.

### Q2 — Cardinality

**Positions:**

- **Guizzardi-solo:** `prefLabel @en` exactly 1; `notation` exactly 1; `definition` exactly 1.
- **Baker+Pandit:** Per SKOS Reference §S14 (`prefLabel @en` MUST exactly 1) + §S15 (`notation` MAY be 1..* with distinct datatypes) + DCMI Usage Board (`definition @en` SHOULD exactly 1). Pandit's amendment: for PII-bearing schemes, `definition @en` is MUST exactly 1 (ICO compliance grounds — multiple definitions = regulatory ambiguity).
- **Cagle:** Concur stub + SHACL shapes on cardinality + `skos:altLabel` unconstrained.
- **Gandon DA:** CONCEDED — W3C SKOS §S14/S15 settled; the MAY/SHOULD/MUST split is a SHACL severity question for ODR-0013.

**Verdict:** **4-0 FOR Baker+Pandit's SKOS-§S14/§S15-grounded cardinality table** (with the Pandit PII-strict amendment on `definition @en` for PII-bearing schemes). The discipline:

| Property | Cardinality | Source |
|---|---|---|
| `skos:prefLabel @en` | exactly 1 (MUST) | SKOS Reference §S14 |
| `skos:notation` | 1..* with distinct datatypes (Q7 elaborates which datatypes) | SKOS Reference §S15 |
| `skos:definition @en` | exactly 1 (SHOULD; MUST for PII-bearing) | DCMI UB + ICO compliance |
| `skos:altLabel` | 0..* | (no shape) |

### Q4 — Definition source

**Positions:**

- **Guizzardi-solo:** Glossary→data-dictionary→schema-annotation precedence; `dct:source` mandatory per concept.
- **Baker+Pandit:** Inherits ODR-0004 §7a five-line precedence (W3C/external spec > OPDA Trust Framework > regulators > glossary > schema annotation). **Pandit amendment:** for regulator-governed concepts (GDPR/ICO/FCA/HMLR/VOA), `skos:definition` cites the regulator's text **verbatim**; OPDA-context paraphrase moves to `skos:scopeNote` (DPV-PD §Scope language — paraphrase introduces audit-trail risk).
- **Cagle:** Concur stub + ODR-0004 §7a URI-pinning-to-version discipline propagates to concept-level `dct:source`.
- **Gandon DA:** CONCEDED — DCMI Baker/Bechhofer/Isaac/Miles 2013 provenance discipline settled.

**Verdict:** **4-0 FOR ODR-0004 §7a five-line precedence + Pandit verbatim-citation amendment** for regulator-governed PII-bearing concepts. Mandatory for DPV-PD-inherited schemes; strongly recommended for all regulator-governed schemes. `dct:source` on every concept resolves to authoritative source URL with version pin; mirrors via `dct:isReferencedBy`.

### Q5 — Code-list lifecycle (MILD CONTESTED — Gandon DA mild attack)

**Positions:**

- **Guizzardi-solo:** `prov:wasDerivedFrom` for succession; `dct:isReplacedBy` for retirement-with-replacement; `owl:deprecated true` on the concept; `owl:versionIRI` on the scheme.
- **Baker+Pandit:** ISO 25964-1 §8 thesaurus-maintenance discipline. Five-row lifecycle-mechanism table: retire-without-successor (`owl:deprecated` + `skos:historyNote`); retire-with-successor (`owl:deprecated` + `dct:isReplacedBy`); derivation/lineage (`prov:wasDerivedFrom`); equivalent in external scheme (`skos:exactMatch`/`closeMatch`); scheme versioning (`owl:versionIRI` + `dct:hasVersion`). **Pandit amendment:** for PII-bearing schemes, deprecated concepts MUST remain dereferenceable for regulatory retention window.
- **Cagle (DEPTH):** **Q5 SHACL operationalisation.** `sh:in` covers ACTIVE concepts only; deprecated concepts marked `owl:deprecated true` + optional `dct:isReplacedBy`. **SHACL-AF rule** (re-instantiates ODR-0005 §6a pattern): `opda:DeprecatedConceptValueRule` materialises deprecation-chain into validation report at `sh:Info` (with-succession) or `sh:Warning` (without-succession) severity. Three-part operational test (active / deprecated-with-succession / retired-without-succession).
- **Gandon DA — MILD ATTACK:** AGAINST blanket PROV-O succession framing. **Withdrawal condition:** ODR-0011 §Rules names three cases: (i) deprecation-with-replacement → `dct:isReplacedBy`; (ii) substantive-redefinition → `prov:wasDerivedFrom`; (iii) minor-edit → `dct:modified` only.

**Verdict:** **4-0 FOR the three-case discipline** (Gandon DA withdrawal condition met by Baker+Pandit + Cagle convergence; their tables substantively name the three cases). Adopted lifecycle-mechanism discipline:

| Lifecycle event | Mechanism | Citation |
|---|---|---|
| Deprecation-with-replacement | `owl:deprecated true` + `dct:isReplacedBy` to successor | DCMI; ISO 25964-1 §8 |
| Substantive-redefinition (derivation) | `prov:wasDerivedFrom` to predecessor; predecessor stays live | PROV-O Recommendation §3 |
| Retirement-without-successor | `owl:deprecated true` + `skos:historyNote`; deprecated concept stays dereferenceable per Pandit PII-retention | DCMI |
| Minor-edit (label rephrase, definition tightening) | `dct:modified` timestamp only; no relation | Gandon DA condition |
| Equivalent in external scheme | `skos:exactMatch`/`closeMatch` | SKOS Reference §4 |
| Scheme-level versioning | `owl:versionIRI` + `dct:hasVersion`/`dct:isVersionOf` on `skos:ConceptScheme` | OWL 2 + DCMI |

**Cagle's SHACL-AF rule adopted** (re-instantiates ODR-0005 §6a pattern; **PROV-O succession pattern now at 4th citing site** — `pattern`-extraction candidate per ODR-0001 A9 §Artefact identity test, see §Synthesis below). Three-part operational test in §Enforcement.

**Pandit PII-retention amendment adopted:** for PII-bearing schemes, deprecated concepts remain dereferenceable for the regulatory retention window; `owl:deprecated true` is a state flag, not a delete signal.

**Allemang DA status: WITHDRAWN on Q5** (three-case discipline condition met).

### Q6 — Namespace

**Positions:**

- **Guizzardi-solo:** Single `opda:` namespace with scheme-qualified URI path (`opda:role/Buyer`); per-scheme namespaces fragment the URI graph.
- **Baker+Pandit:** Single `opda:` per ODR-0004 Rule 1 (non-negotiable). Slash-within-hash pattern (`opda:Role/Conveyancer`) preferred per SKOS Reference published-example convention; intra-namespace separator WG-owned.
- **Cagle:** Concur stub.
- **Gandon DA:** CONCEDED — ODR-0004 Rule 1 + W3C TAG Cool URIs settled.

**Verdict:** **4-0 FOR single `opda:` namespace with scheme-qualified concept IRIs** (inherits ODR-0004). Intra-namespace separator (slash-within-hash `opda:Role/Conveyancer` vs kebab `opda:Role-Conveyancer`) is WG-owned drafting choice; either preserves the single-namespace discipline.

### Q7 — Notation typing

**Positions:**

- **Guizzardi-solo:** Scheme-specific datatype where notation is banded/ordinal (`opda:EPCBandLiteral`, `opda:CouncilTaxBandLiteral`); `xsd:string` otherwise.
- **Baker+Pandit:** Per SKOS §S15, multi-typed notations permitted (typed datatype alongside `xsd:string` for broad compatibility). Per-scheme-type discipline: closed regulator-governed (typed + string), closed without external code (`xsd:string` only), open-ended (`xsd:string` only).
- **Cagle (DEPTH):** **Decline custom datatypes**; use `sh:pattern` on `xsd:string` for lexical-form validation. Custom datatypes earn their keep ONLY when (a) lexical form is constrained AND (b) constraint checkable at parse-time — neither holds for OPDA's named schemes. `xsd:string` + `sh:pattern "^[A-G]$"` is the default; custom datatypes are over-engineering.
- **Gandon DA:** CONCEDED with Cagle — `sh:pattern` over custom datatypes is the operational practice.

**Verdict:** **4-0 FOR `xsd:string` + `sh:pattern` default for OPDA's named schemes** (Cagle's operational position prevails; Baker+Pandit's SKOS §S15 multi-typing remains *permitted* per spec for downstream consumers genuinely needing typed dispatch, but `sh:pattern` is what the OPDA generator emits). Per-scheme guidance:

| Scheme | Notation typing | Validation |
|---|---|---|
| EPC band (closed; A-G) | `xsd:string` | `sh:pattern "^[A-G]$"` |
| Council-tax band (closed; A-I) | `xsd:string` | `sh:pattern "^[A-I]$"` |
| `ownerType` (closed; small set) | `xsd:string` | `sh:in` on concept URI (no `sh:pattern` needed) |
| HMLR `classOfTitleCode` (closed; numeric) | `xsd:string` | `sh:pattern "^[1-9][0-9]$"` + `sh:in` on active set |
| Fuel types (open) | `xsd:string` | no constraint |

Scheme-specific datatypes (`opda:EPCBandLiteral` etc.) **NOT minted by default**. If a downstream consumer (regulator audit pipeline; specialised tooling) requires typed dispatch via `sh:datatype`, the scheme MAY carry a typed `skos:notation` alongside the `xsd:string` notation per SKOS §S15. Generator emits the typed notation conditionally on downstream-consumer demand.

### Q8 — UFO meta-category per scheme (B3 PILOT — typed output)

**Positions:**

- **Guizzardi-solo (LOAD-BEARING):** **Five-category framework** (extends the four Scope-Check 1 Q3 candidates with two extensions to cover all PDTF v3 named schemes):
  - **Quale-in-Region** (values in a metric-banded quality region) — EPC band, council-tax band, `ownershipType`, `builtForm`, `currentEnergyRating`.
  - **Role label** — `role`.
  - **Phase label** — `participantStatus`.
  - **Method/plan code** — `sellersCapacity`.
  - **Quality Region** (NEW — proposed extension; the scheme IS the region) — `opda:assuranceLevel`.
  - **Substance Kind label** (NEW — proposed extension; labels for UFO sub-Kinds with `skos:exactMatch` to OWL sub-class) — `tenureKind`.
  - **Quality Value** (NEW — proposed extension; values of a UFO Quality particularising a Substance Kind) — `addressVariant` (from S015).

  All extensions grounded in published UFO sources (Guizzardi 2005 Ch. 4; Masolo et al. 2003 D18 §4.3). Per-scheme typed-output table emits `opda:<scheme>Scheme opda:ufoCategory "<value>"` triples for downstream tooling consumption.

- **Baker+Pandit:** Defer to Guizzardi-solo on UFO authority; contribute **governance-sensitivity column** alongside the UFO category column: `role` (PII-trigger when regulated-profession); `participantStatus` (DPV processing-event trigger); `opda:assuranceLevel` (lawful-basis trigger); `tenureKind` (low PII; HMLR-published already); `addressVariant` (PII-regime discriminator per S005 §6b).

- **Cagle:** Defer to Guizzardi-solo on UFO category authority; contribute **SHACL-targeting-consequence column**: Role label → SHACL targets Role-bearing entity; Phase label → SHACL targets Kind-in-phase; Quale-in-Region → SHACL targets quale value; Method/plan code → SHACL targets activity; Substance Kind label → SHACL targets the sub-Kind via `skos:exactMatch`.

- **Gandon DA — PRIMARY ATTACK on source-attribution:** Per A9 §(a), `kind: pattern` ODRs cite UFO/DOLCE meta-category. Guizzardi's framework applies UFO to SKOS schemes — *novel work* not in published UFO sources. **Withdrawal condition:** (a) Guizzardi cites published source for UFO-SKOS-binding OR (b) framework attributed to ODR-0011 with `dct:source <ODR-0011>` (Council-authored extension).

**Verdict (B3 pilot typed output):** **4-1 FOR the seven-category framework** (Guizzardi's five-category framework + the two-extension categories — `Quality Region` + `Substance Kind label` + `Quality Value` — bringing the total to seven distinct categories, all grounded in published UFO/DOLCE sources AND attributed to ODR-0011 as Council-authored SKOS-binding). Gandon DA's withdrawal condition (b) is met substantively — see below.

**Gandon DA withdrawal mechanism (Q8 condition (b)):** the seven-category framework is declared in ODR-0011 §Operational specifications with **dual `dct:source`**:

- Upstream UFO/DOLCE grounding per category (Guizzardi 2005 Ch. 4; Masolo et al. 2003 D18 §4.3; Guizzardi & Wagner 2010 for Method/plan codes).
- Council-authored attribution: `<ODR-0011> dct:source <ODR-0011>` on the SKOS-binding framework itself (the application of UFO categories to SKOS schemes is the Council-authored extension; UFO category itself is upstream).

This dual citation discharges Gandon's A9-attribution concern: a future maintainer tracing `dct:source` finds BOTH the upstream UFO publication AND the Council-authored SKOS-binding ODR. The audit trail is intact.

**Per-scheme typed-output table** (B3 pilot's load-bearing artefact; the generator emits `opda:ufoCategory` triples on each `skos:ConceptScheme`):

| Scheme | UFO meta-category | Governance flag (Baker+Pandit) | SHACL targeting (Cagle) |
|---|---|---|---|
| `role` | **Role label** | PII-trigger when regulated-profession | Role-bearing entity (Person/Organisation) |
| `sellersCapacity` | **Method/plan code** | (no PII flag) | Activity (the capacity-exercise event) |
| `participantStatus` | **Phase label** | DPV processing-event trigger | Kind-in-phase (Participant) |
| `ownershipType` | **Quale-in-Region** | (no PII flag) | Quale value (LegalEstate's ownership-structure) |
| `builtForm` | **Quale-in-Region** | (no PII flag) | Quale value (Property's physical form) |
| `councilTaxBand` | **Quale-in-Region** | (HMLR-published; low PII) | Quale value (Property's council-tax band) |
| `currentEnergyRating` | **Quale-in-Region** | (no PII flag) | Quale value (Property's energy efficiency) |
| `opda:assuranceLevel` | **Quality Region** (the scheme IS the region) | Lawful-basis trigger | Quality space (assurance strength) |
| `tenureKind` | **Substance Kind label** (`skos:exactMatch` to OWL sub-class) | (HMLR-published; low PII) | Sub-Kind via `skos:exactMatch` |
| `addressVariant` (S015) | **Quality Value** (values of UFO Quality particularising Substance Kind) | PII-regime discriminator | Quality value (Address's variant) |

**Generator emission** (per ODR-0004 §6a deterministic-emission discipline):

```turtle
opda:roleScheme a skos:ConceptScheme ; opda:ufoCategory "RoleLabel" .
opda:sellersCapacityScheme a skos:ConceptScheme ; opda:ufoCategory "MethodPlanCode" .
opda:participantStatusScheme a skos:ConceptScheme ; opda:ufoCategory "PhaseLabel" .
opda:ownershipTypeScheme a skos:ConceptScheme ; opda:ufoCategory "QualeInRegion" .
opda:builtFormScheme a skos:ConceptScheme ; opda:ufoCategory "QualeInRegion" .
opda:councilTaxBandScheme a skos:ConceptScheme ; opda:ufoCategory "QualeInRegion" .
opda:currentEnergyRatingScheme a skos:ConceptScheme ; opda:ufoCategory "QualeInRegion" .
opda:assuranceLevelScheme a skos:ConceptScheme ; opda:ufoCategory "QualityRegion" .
opda:tenureKindScheme a skos:ConceptScheme ; opda:ufoCategory "SubstanceKindLabel" .
opda:addressVariantScheme a skos:ConceptScheme ; opda:ufoCategory "QualityValue" .
```

**`odr-review` lint extension contract** (flagged for next skill release per ODR-0004 §Consequences): the lint reads each `kind: pattern` ODR's `skos:ConceptScheme` declarations and verifies `opda:ufoCategory` triple presence + value-in-vocabulary (seven categories named in ODR-0011 §Operational specification 8a).

**Cross-scheme consistency check (Guizzardi amendment).** SKOS schemes typed as `SubstanceKindLabel` (e.g. `tenureKind`) MUST carry `skos:exactMatch` from each scheme member to the corresponding OWL sub-class (e.g. `opda:tenureKind/Freehold skos:exactMatch opda:Freehold`). NEVER `owl:sameAs` (inherits ODR-0005 Anti-pattern §5).

**`pattern`-extraction count update.** Cagle's SHACL-AF rule for deprecation-chain materialisation (Q5) is the **fourth citing site** of the SHACL-AF non-blocking-data-quality-rules pattern (ODR-0005 §6a UPRN succession; ODR-0009 PROV-O Claims; ODR-0015 §4a INSPIRE succession; ODR-0011 §Q5 deprecation). This satisfies ODR-0001 A9 §Artefact identity test's fourth-citing-site threshold for `pattern`-extraction. Spawn-rule fires (see §Synthesis).

## Synthesis

This session ratifies SKOS as the substrate for PDTF v3's 160 enumeration vocabularies, discharging the per-kind discipline at the scheme level via a seven-category UFO typing framework, with the B3 pilot's typed-output verdict consumed by downstream tooling. The substrate carries forward to module sessions (S006, S007, S008, S009, S012) which author per-scheme concept content within the framework.

**Five load-bearing moves:**

1. **Every JSON enum becomes a `skos:ConceptScheme`** (4-0; no floor). Cross-scheme co-reference via `skos:exactMatch`/`closeMatch`; PII-sensitive schemes require the scheme-IRI to land DPV co-annotations on (Pandit's evidence). Steward declaration per scheme via `dct:creator`/`dct:publisher` (Baker DCMI discipline).

2. **Three-case lifecycle discipline** (4-0 with Gandon DA withdrawn): `dct:isReplacedBy` for deprecation-with-replacement; `prov:wasDerivedFrom` for substantive-redefinition; `dct:modified` only for minor-edit. PII-bearing schemes preserve dereferenceability through retention window. Cagle's SHACL-AF deprecation-chain rule re-instantiates the ODR-0005 §6a pattern — **fourth citing site for the SHACL-AF non-blocking-data-quality-rules pattern**, satisfying ODR-0001 A9 §Artefact identity test's fourth-site threshold.

3. **Verbatim-citation discipline for regulator-governed concepts** (Pandit amendment; 4-0): `skos:definition` carries the regulator's verbatim text; OPDA-context paraphrase moves to `skos:scopeNote`. Mandatory for DPV-PD inheritance; strongly recommended for all GDPR/ICO/FCA/HMLR/VOA-governed concepts.

4. **`xsd:string` + `sh:pattern` over custom datatypes** (Cagle position; 4-0): scheme-specific datatypes admissible per SKOS §S15 but `sh:pattern` is the operational default for OPDA's named schemes. Custom datatypes minted only on downstream-consumer demand.

5. **Seven-category UFO typing framework for SKOS schemes** (B3 pilot typed-output verdict, 4-1 with Gandon DA withdrawn on condition (b)): Role label / Phase label / Quale-in-Region / Method-plan code (four original Scope-Check 1 Q3 categories) + Quality Region / Substance Kind label / Quality Value (three Council-authored extensions grounded in published UFO/DOLCE sources). Per-scheme typed-output table consumed by `odr-review` lint, SKOS scheme generator, LLM tooling. Dual `dct:source` (upstream UFO + ODR-0011 attribution) discharges Gandon DA's A9-attribution concern.

**A9 pressure-test passes (third `kind: pattern` ODR).** ODR-0011 discharges A9 §Per-kind discipline at the scheme level: (a) UFO category per scheme (seven categories named); (b) IC over named hard cases — closed-vs-open `sh:in`, lifecycle three-case discipline, cardinality bands; (c) artefact realisation via SHACL shapes + SHACL-AF deprecation rule + generator emission of typed `opda:ufoCategory` triples. The methodology continues to operate as designed; three of three `kind: pattern` ODRs discharge cleanly under A9.

**`pattern`-extraction spawn fires (fourth citing site reached).** The SHACL-AF non-blocking-data-quality-rules pattern now appears in: ODR-0005 §6a (UPRN succession at `sh:Info`); ODR-0009 (PROV-O Claims/Evidence, S001 Q6 Moreau); ODR-0015 §4a (INSPIRE/AddressBase succession at `sh:Info`); ODR-0011 §Q5 (concept deprecation chain at `sh:Info`/`sh:Warning`). Per ODR-0001 A9 §Artefact identity test fourth-citing-site threshold, **spawn a shared `pattern` ODR**: `opda-shacl-af-quality-rules` (or whatever naming the Queen chooses). The four citing sites become `implements:` of the extracted pattern. Recorded in §Track record for future Queen action.

**Gate cleared at deliberative level; namespace block carries forward.** ODR-0011 moves `proposed → proposed` with `council: session-011`. `status: accepted` blocked on WG namespace ratification per inherited ODR-0004 block. Downstream: **S006/S007/S008/S009/S012 unblocked** at the substrate level (each authors per-scheme concept content within the framework); S008 remains deferred on S005 cardinality (per S005 Kendall+Davis joint amendment). **Phase-3.5 audit session for Q3** (cross-vocabulary mapping; SSSOM re-open trigger from S002 Q11 named here) flagged for post-module-session scheduling.

**B3 pilot — third site observation: structured tally captured Q5 mild dissent + Q8 source-attribution attack + DA scorecard mechanical-check as machine-readable data.** EXPAND threshold reached: three pilot sites (S005 Full Council + S015 Reduced Council + S011 Full Council substrate-mode with B3 typed-output) all observed the structured tally adding value the narrative reading would miss. **Recommendation: EXPAND** — two-artefact discipline (narrative synthesis + structured per-question tally appendix) becomes the default across all remaining sessions (S006, S007, S009, S010, S012, S013). Recorded for ODR-0001 author-only amendment in a follow-up session.

## B3 pilot — structured tally appendix (typed-output for Q8)

Per Scope-Check 2 amendment B3, Q8 uses `consensus-mode: hive-mind/typed-output`. The structured output is the per-scheme typed-output table above (consumed by `odr-review` lint + SKOS generator + LLM tooling).

### Per-voice votes

Vote codes: **F** = FOR; **A** = AGAINST; **C** = CONCEDE; **W** = WITHDREW; **H** = HELD; **P** = PARTIAL.

| Voice | Q1 | Q2 | Q4 | Q5 | Q6 | Q7 | Q8 |
|---|---|---|---|---|---|---|---|
| Guizzardi-solo | F | F | F | F | F | F (banded-datatype) | **F (seven categories)** |
| Baker (governance-pair) | F | F | F | F | F | F | F (defer Guizzardi) |
| Pandit (governance-pair) | F | F | F | F | F | F | F (defer Guizzardi) |
| Cagle (shacl-solo) | F | F | F | F | F | F (decline custom) | F (defer Guizzardi + SHACL-targeting) |
| Gandon (DA) | C | C | C | W | C | C | W |

### Per-question tally

| Question | F count | A count | H (dissent) | W/C (DA) | Verdict shape |
|---|---|---|---|---|---|
| Q1 — Scheme membership | 4 | 0 | 0 | 1 C | **4-0 FOR every-enum-a-scheme** + steward amendment |
| Q2 — Cardinality | 4 | 0 | 0 | 1 C | **4-0 FOR §S14/§S15 + Pandit PII-strict amendment** |
| Q4 — Definition source | 4 | 0 | 0 | 1 C | **4-0 FOR ODR-0004 §7a + Pandit verbatim-citation amendment** |
| Q5 — Code-list lifecycle | 4 | 0 | 0 | 1 W | **4-0 FOR three-case discipline** (Gandon DA condition met) + Cagle SHACL-AF rule + Pandit PII-retention |
| Q6 — Namespace | 4 | 0 | 0 | 1 C | **4-0 FOR single `opda:` namespace** (inherits ODR-0004) |
| Q7 — Notation typing | 4 | 0 | 0 | 1 C | **4-0 FOR `xsd:string` + `sh:pattern` default** (Cagle position; custom datatypes admissible per §S15) |
| Q8 — UFO meta-category (B3 pilot) | 4 | 0 | 0 | 1 W | **4-0 FOR seven-category framework** (Gandon DA condition (b) met via dual `dct:source`) |

### Gandon DA scorecard

| Question | DA position | Withdrawal condition | Outcome |
|---|---|---|---|
| Q1 | Concede | (none) | **CONCEDED** |
| Q2 | Concede | (none) | **CONCEDED** |
| Q4 | Concede | (none) | **CONCEDED** |
| Q5 | Mild attack | Three-case discipline named | **WITHDRAWN** (Baker+Pandit + Cagle named three cases mechanically) |
| Q6 | Concede | (none) | **CONCEDED** |
| Q7 | Concede with Cagle | (none) | **CONCEDED** |
| Q8 | Primary attack | Cite published source OR Council-authored attribution | **WITHDRAWN** (dual `dct:source` — upstream UFO/DOLCE + ODR-0011 SKOS-binding) |

**DA scorecard summary:** 2 withdrawn (Q5, Q8) + 5 conceded = 7 of 7 contested questions met. Full DA withdrawal. The DA functioned as designed: Q5 mild attack converted into mechanical three-case discipline; Q8 primary attack converted into dual `dct:source` attribution discipline (the SKOS-binding is now auditable as Council-authored).

### B3 pilot observation (third site)

The hypothesis under test: typed-output (per-scheme UFO category as `opda:ufoCategory` literal) is mechanically consumable by downstream tooling.

**Observations:**

- **The typed-output table is the artefact.** The narrative position files document the reasoning; the table is the data. Three downstream consumers named explicitly (`odr-review` lint extension; SKOS scheme generator; LLM tooling per Cagle's DBpedia 2017 lesson) — each consumes the table mechanically.
- **The DA primary attack on Q8 was source-attribution, not the typed output itself.** The dual `dct:source` resolution preserves the typed output's consumability while making the audit trail correct. The B3 pilot's mechanism is intact.
- **Pair-internal alignment was high** (Guizzardi-solo authored the category framework; Baker+Pandit and Cagle deferred to UFO authority while contributing orthogonal columns — governance-sensitivity and SHACL-targeting). The structured tally captured this by recording per-voice deferral as `F (defer Guizzardi)` rather than collapsing to a single FOR vote.

**Third-site verdict toward EXPAND threshold:**

| Site | Format | Two-artefact observation |
|---|---|---|
| S005 (Full Council) | B2 pilot `hive-mind/byzantine` | Caught Davis+Cagle Q5 dissent + 8-of-8 Allemang DA withdrawal as machine-checkable |
| S015 (Reduced Council) | Two-artefact only | Caught Allemang DA Q3 held-as-live + DA scorecard mechanical-check |
| S011 (Full Council substrate + B3 pilot for Q8) | B3 pilot `hive-mind/typed-output` for Q8; two-artefact session-wide | Caught Gandon DA Q5 mild + Q8 source-attribution attacks as withdrawal-conditions; typed-output table consumable as data |

Three pilot sites observed; structured tally added value at all three (caught dissent or attack the narrative reading would have buried). **EXPAND threshold satisfied.**

**Recommendation: EXPAND (full adoption).** Two-artefact discipline (narrative synthesis + structured per-question tally appendix) becomes the **default across all remaining sessions** (S006, S007, S009, S010, S012, S013). The B2 and B3 pilot-specific consensus-mode labels (`hive-mind/byzantine`, `hive-mind/typed-output`) are retired as session-level labels; the underlying discipline (two-artefact + per-question structured tally + DA scorecard mechanical-check) is the operational practice.

**Author-only follow-up session required:** ODR-0001 amendment recording the EXPAND verdict; updating §Format tiers / §Substrate operations to make the two-artefact discipline the default for Full Council + Reduced Council sessions. Flagged for next /loop fire or user-convened session.

## Track record (for adoption.md §Track Record)

- **Session 011 — ODR-0011 Enumeration Vocabularies** (Phase 2.5 substrate; substrate mode with Q3 deferred). Full Council, 4 panel teammates + DA + Queen synthesis. **B3 pilot for Q8** (`consensus-mode: hive-mind/typed-output`); two-artefact discipline session-wide per B2-pilot EXTEND-CAUTIOUSLY recommendation from S005 + S015. Queen Isaac/Miles (extended SKOS WG). DA Gandon (W3C standards; **2 withdrawn / 5 conceded — full DA withdrawal**). **Third `kind: pattern` ODR to discharge under A9 per-kind discipline at the scheme level.** 7 questions (Q3 deferred): Q1 4-0 FOR every-enum-a-scheme + Baker steward amendment + Cagle one-primary-scheme SHACL invariant; Q2 4-0 FOR Baker SKOS-§S14/§S15-grounded cardinality + Pandit PII-strict `definition @en` amendment; Q4 4-0 FOR ODR-0004 §7a five-line precedence + Pandit verbatim-citation amendment for regulator-governed PII concepts; Q5 4-0 FOR three-case lifecycle discipline (Gandon DA mild attack withdrawn — `dct:isReplacedBy` deprecation-with-replacement / `prov:wasDerivedFrom` substantive-redefinition / `dct:modified` minor-edit) + Cagle SHACL-AF deprecation-chain rule (re-instantiates ODR-0005 §6a; **fourth citing site of SHACL-AF non-blocking-data-quality-rules pattern**); Q6 4-0 FOR single `opda:` namespace (inherits ODR-0004); Q7 4-0 FOR `xsd:string` + `sh:pattern` default (Cagle position; custom datatypes admissible per SKOS §S15 but not minted by default); **Q8 (B3 typed-output) 4-0 FOR seven-category UFO framework** — Quale-in-Region + Role label + Phase label + Method/plan code (four original Scope-Check 1 Q3 categories) + Quality Region + Substance Kind label + Quality Value (three Council-authored extensions grounded in Guizzardi 2005 Ch. 4 + Masolo et al. 2003 D18 §4.3); Gandon DA primary attack on source-attribution withdrawn via dual `dct:source` (upstream UFO + ODR-0011 Council-authored SKOS-binding); per-scheme typed-output table consumed by `odr-review` lint + SKOS scheme generator + LLM tooling. ODR-0011 amended: new §Operational specifications 2a/4a/5a/7a/8a discharging A9 inline; §Consequences updated for downstream inheritance + SHACL-AF `pattern`-extraction spawn-rule fires. Council:session-011 set; **status:proposed retained** per inherited ODR-0004 namespace block. **B3 pilot third-site observation: EXPAND threshold satisfied — two-artefact discipline (narrative + structured tally) becomes default across remaining sessions (S006/S007/S009/S010/S012/S013); ODR-0001 amendment flagged for follow-up author-only session.** **SHACL-AF non-blocking-data-quality-rules pattern: fourth citing site reached; spawn rule fires per §6.**
