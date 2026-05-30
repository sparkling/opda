---
status: proposed
date: 2026-05-30
kind: pattern
tags: [descriptive-layer, authority-retrieved, searches, risk-assessment, prov-o, skos, information-object, sub-module]
scope: [pdtf-v3:propertyPack.environmentalIssues, pdtf-v3:propertyPack.localSearches, pdtf-v3:propertyPack.valuationComparisonData]
council: session-024
supersedes: []
depends-on: [ODR-0005, ODR-0009, ODR-0011, ODR-0018, ODR-0022, ODR-0023]
implements: [ODR-0007, ODR-0008, ODR-0017]
---

# Authority-Retrieved Artefacts

## Context

ODR-0008 §Q2a(b) named a spawn trigger: "when Survey/EPC/Search/Title-Plan cannot be flat datatype bags without losing `prov:wasGeneratedBy`, spawn **ODR-0008d 'Authority-Retrieved Artefacts'**." [ODR-0022](./ODR-0022-descriptive-layer-import-strategy.md) Category E fired it: the descriptive layer's search/environmental results are a six-field block (`riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution`) recurring across **exactly 24 parents = 12 environmental perils × 2** (the peril + its `riskSubcategories[]`), plus `localSearches` (185 leaves, CON29-style) and `valuationComparisonData` (23). The **five §Q4a-promoted classes** (`opda:Search`, `opda:Survey`, `opda:EPCCertificate`, `opda:Valuation`, `opda:Comparable`) ship today as *bare classes* with identity-key SHACL shapes; they have **no internal structure**, there is **no `opda:RiskAssessment` class**, and **no peril SKOS scheme**.

This is `kind: pattern` — it commits new classes with identity criteria, so under [ODR-0001](./ODR-0001-linked-data-council-methodology.md) §A9 it MUST state, for each, (a) a UFO meta-category, (b) an identity criterion over named hard cases, and (c) the artefact realisation. It was deliberated by the Linked Data Council at [session-024](./council/session-024-authority-retrieved-artefacts.md) (Full-lean; Queen Kendall; DA Cagle; `agent-fan-out`, the first of the ODR-0023 R1–R4 parallel run). Q1 7–1, Q2 8–0, Q3 7–1, Q4 6–1, Q5 8–0, Q6 7–1 FOR a `RiskAssessment` class + peril scheme; **Cagle DA holds a principled dissent for reuse-`Search` (alternative d).**

## Decision

Adopt the **authority-retrieved-artefact family** as **UFO Information Objects** on the ODR-0009 PROV-O backbone: mint **`opda:RiskAssessment`** (the per-peril search/environmental result) as one class (~6 properties) instantiated per peril; mint a first-class **`opda:PerilScheme`** SKOS concept scheme (12 dereferenceable peril concepts, each `dct:source`-d to its governing authority); give the five already-ratified classes their internal structure; and **retro-correct all six classes' UFO meta-category from "Substance Kind" to "Information Object"** — chosen because each artefact `prov:wasGeneratedBy` an authority's activity and bears a provenance-grounded identity (a re-run search is a *new* result), which is precisely what a flat datatype bag on `Search` (alternative d) cannot carry, while one class + a peril value-scheme (not 12 subclasses) answers the lender's cross-peril query without OWL over-classification.

## Rules

### 1. `opda:RiskAssessment` — A9 discharge

- **(a) UFO meta-category: Information Object** (DOLCE Non-Physical Object; gUFO `gufo:Object` artefact), `rdfs:subClassOf prov:Entity`. It is **not** a Substance Kind and **not** a Quality of `opda:Property` — it is a *report*, an information artefact existentially dependent on its generating activity.
- **(b) Identity criterion (over named hard cases):** an `opda:RiskAssessment` is individuated by the tuple **⟨generating activity (`prov:wasGeneratedBy`), source peril/dataset, subject property, generation time (`prov:generatedAtTime`)⟩** — identity grounded in the **activity**, not the result values. Hard cases:
  - **Re-run (the case that answers the DA):** a flood search re-run on the same property next year is a **distinct** `RiskAssessment` (new activity + new `generatedAtTime`), `prov:wasDerivedFrom` the prior — distinct identity *independent of the peril value*. This is the lifecycle a flat datum on `Search` cannot express.
  - **Co-reference:** two providers' flood assessments for one property are **distinct** instances (distinct `prov:wasAttributedTo` Agent), not one merged value.
  - **Sub-result:** a `riskSubcategories[]` entry is itself a (leaf) `RiskAssessment` (see Rule 4).
  - **`otherEnvironmental`** (a 2-of-6-field stub) is a valid leaf `RiskAssessment` with optional Qualities absent — an Object with missing Qualities, not a different kind.
- **(c) Artefact realisation:** one `sh:NodeShape` `sh:targetClass opda:RiskAssessment` with ~6 property shapes — `opda:peril` (`sh:in` the `opda:PerilScheme`), `opda:riskIndicator`/`opda:actionAlertRating` (`sh:in` their rating schemes), `result`/`summary`/`recommendations` (`opda:disclosureDetail`-grade strings), `opda:datasetAttribution` ≡ `prov:wasAttributedTo`; provenance-keyed by the §Q4a identity-key shape reused from the emitted family pattern; recursive via `sh:node opda:RiskAssessment` for `riskSubcategories[]`. **Not** 72 datatype properties (alternatives a/d), **not** 12 subclasses (alternative c).

### 2. `opda:PerilScheme` — the dataset/peril axis (SKOS, not subclasses)

A `skos:ConceptScheme` mirroring `opda:BoundedContextScheme` member-for-member: **12 `skos:Concept`s** — Flooding, CoalMining, NonCoalMining, Radon, GroundStability, ContaminatedLand, CoastalErosion, Climate, Energy, Infrastructure, Planning, Transportation — each with `skos:prefLabel`/`skos:definition`/`skos:inScheme`/`skos:topConceptOf`, **`dct:source` → its governing data authority** (Environment Agency, Coal Authority, UKHSA/BGS, DESNZ, the local authority, Groundsure/Landmark), `skos:narrower` to its sub-perils, `opda:ufoCategory "Quale-in-Region"`. **Steward: Baker (deputy Isaac).** The peril MUST be a dereferenceable concept (a lender's mortgage condition *names* "a satisfactory coal-mining search") — never an opaque string, never an `rdfs:subClassOf` hierarchy (SKOS Reference §3: a delimited value-space is a scheme, not a class tree).

### 3. The five existing classes — Information-Object retro-correction + internals

`opda:Search`, `opda:Survey`, `opda:EPCCertificate`, `opda:Valuation`, `opda:Comparable` are **Information Objects** (correcting the emitted "Substance Kind (informational)" scopeNotes — a normative A9 meta-category fix). Each IC = **⟨issuing authority, authority reference/number, issue date⟩** (extrinsic, provenance-grounded), `rdfs:subClassOf prov:Entity` (already emitted). Their internal property structure is given here as ~per-class node shapes. `opda:RiskAssessment` `prov:wasGeneratedBy` the activity that also generates the `opda:Search` it belongs to (one search yields many per-peril assessments). `opda:Comparable` relates to `opda:Valuation` via `prov:wasInformedBy`.

### 4. One class, not two; recursion via part-of

**One `opda:RiskAssessment`** for both environmental-search and local-authority (CON29) results — they differ only on the `prov:wasAttributedTo` Agent and the peril, both already modelled; a second class needs a named CON29-specific-property query (none attested — §Q6a). The `riskSubcategories[]` recursion is **self-referential**: `opda:hasSubAssessment` (a mereological part-of; sub-results are first-class `RiskAssessment`s) realised as `sh:node opda:RiskAssessment`. The peril *taxonomy* (peril → sub-perils) uses `skos:narrower` within `opda:PerilScheme`; the result *recursion* uses `opda:hasSubAssessment` — two distinct axes.

### 5. Provenance + PII

The family hangs off the ODR-0009 PROV-O backbone (`prov:wasGeneratedBy`/`wasAttributedTo`/`generatedAtTime`/`wasDerivedFrom`); `datasetAttribution` **reuses `prov:wasAttributedTo`** (do not mint). PII co-annotation per ODR-0018 where a result carries personal data (occupier/owner-named search results). Lifecycle (issued/superseded/re-run) uses ODR-0017 SHACL-AF succession rules — materialised at **`sh:severity sh:Info`** (a re-run records substantive succession via `prov:wasDerivedFrom`, so it meets ODR-0017 §Rules.2a's `sh:Info` tier rather than `sh:Warning`), **non-blocking**, and placed in the **shapes graph** (`opda-descriptive-shapes.ttl`, never `opda-annotations.ttl`, per ODR-0017 §Rules.3 + ODR-0004 §3a three-graph separation); the succession rule is **never `sh:Violation`** (it is informative, not normative-breaking — ODR-0017 §Rules.2). The `wasGeneratedBy` identity-key constraint of Rule 1(c) remains an ordinary `sh:Violation` SHACL-Core shape (a missing provenance key IS normative-breaking) — distinct from this non-blocking succession rule.

### Held dissent (recorded)

**Cagle (DA) HOLDS for alternative (d) — reuse `opda:Search`, no new class** — on the OntoClean carries-identity (+I) test (Guarino & Welty 2002): "a type supplying no identity beyond a discriminating value is not a sortal Kind"; he notes `opda:riskIndicator` already ships as a flat datatype property and `opda:Search`'s scopeNote already covers CON29/environmental/coal-mining. **Withdrawal trigger (his own):** "state an IC for `RiskAssessment` independent of (i) the peril value and (ii) the parent `Search`'s lifecycle." **Queen's assessment:** Rule 1(b)'s re-run hard case meets it — a re-run is a distinct `RiskAssessment` by activity + `generatedAtTime`, independent of both peril value and the parent Search (which persists across the re-run). Guizzardi & Guarino's instrument is decisive: "`details` collapses on value (−I, a datum); `RiskAssessment` does not (+I, a class) — same OntoClean instrument, opposite verdicts." The dissent is recorded **held-as-live** with a named **re-open trigger**: if implementation shows no `RiskAssessment` ever has a lifecycle independent of its parent `Search` (no re-run/supersession in real data), collapse to alternative (d). The peril scheme (Q2) and PROV-O wiring (Q5) and the five classes' internals (Q3) are **unanimous** and unaffected by the hold.

## Alternatives

* **(a) Flat datatype-bag on `Search`** — six fields as datatype properties; loses per-peril uniformity and the cross-peril query; an Object's Qualities modelled as the Object.
* **(c) 12 per-peril subclasses** (`FloodRisk`, `CoalMiningRisk`, …) — OWL over-classification (TopBraid-EDG anti-pattern): the perils differ by a *Quality value* (the peril), not by *identity*; a `sh:in` over the peril scheme expresses it without 12 rigid sortals. The byte-uniform six-field block across all 24 parents is the evidence (one Type varying by one Quale).
* **(d) Reuse `opda:Search` as a structured datatype** (Cagle's held position) — preserves parsimony but loses the per-result `prov:wasGeneratedBy` lifecycle (a re-run search's result has its own identity); rejected 7–1 but recorded held-as-live with a re-open trigger.

## Consequences

> **Emission status — 2026-05-30:** realised in the generator — `opda:RiskAssessment` + `opda:PerilScheme` (12 concepts) + `opda:RiskIndicatorScheme`/`opda:ActionAlertRatingScheme` + the node shapes + the five classes' Information-Object correction are emitted; pytest 243 pass / 1 xfail + all four CI gates byte-identity-green + site build green. Status stays `proposed` pending OPDA WG ratification — the WG may revisit three flagged modelling choices: the dedicated `opda:RiskIndicatorScheme` (vs. reusing the existing `YesNoNotKnownScheme`, since its value-space is No/Not known/Yes), `opda:PerilScheme` carrying no `skos:narrower` (the data attests no enumerated sub-peril value-set, so the per-result recursion rides `opda:hasSubAssessment` instead), and `opda:price` as a single shared property (no `opda:MonetaryAmount` value type exists yet). Cagle's held dissent (alternative-d) rides unaffected.

- **The generator emits a sixth class `opda:RiskAssessment`** (`opda-descriptive.ttl`) + its node shape (`opda-descriptive-shapes.ttl`) extending the existing `prov:wasGeneratedBy` identity-key pattern, **`opda:PerilScheme`** (12 concepts, `opda-vocabularies.ttl`, steward Baker), and the internal property structure of the five existing classes.
- **A9 meta-category retro-correction:** the five emitted classes' scopeNotes change from "Substance Kind (informational)" to **"Information Object"** — a normative correction (a report is not a Substance Kind). CI verifies all six carry `rdfs:subClassOf prov:Entity` + the `wasGeneratedBy` Violation shape.
- **This unblocks ODR-0022 Category E emission** (held pending this council) — the search/environmental ~200 leaves bind to `RiskAssessment` + `PerilScheme`, not flat properties; ODR-0023 R1 is struck.
- **Cagle's held dissent** rides as a re-open trigger; the WG ratifies `proposed → accepted`. The peril scheme + PROV-O wiring proceed unconditionally.
- **status `proposed`**; adoption via OPDA WG → Modelling Sub-Committee.

## References

- **Council**: [session-024 — Authority-Retrieved Artefacts](./council/session-024-authority-retrieved-artefacts.md) (Full-lean; Queen Kendall; DA Cagle — held for alt-d; Moreau/Knublauch/Guizzardi+Guarino/Baker+Isaac FOR the class). Evidence: [`working/session-024/EVIDENCE.md`](./council/working/session-024/EVIDENCE.md).
- **Parent + trigger**: [ODR-0008](./ODR-0008-property-descriptive-attributes.md) §Q2a(b) (the spawn), §Q4a (the five class promotions + the authority-provenance/lifecycle criteria), §Q6a (reasoner-independence).
- **Realizing records**: [ODR-0009](./ODR-0009-claims-evidence-provenance.md) (PROV-O backbone; `wasGeneratedBy`/`wasAttributedTo`); [ODR-0011](./ODR-0011-enumeration-vocabularies.md) (the `PerilScheme` + rating schemes); [ODR-0017](./ODR-0017-shacl-af-quality-rules-pattern.md) (succession/lifecycle); [ODR-0018](./ODR-0018-dpv-class-level-coannotation-pattern.md) (result PII); [ODR-0005](./ODR-0005-property-land-identity-crux.md) (the subject Property).
- **Fired by**: [ODR-0022](./ODR-0022-descriptive-layer-import-strategy.md) Category E; tracked in [ODR-0023](./ODR-0023-descriptive-layer-follow-on-council-roadmap.md) R1.
- **External citations** (per ODR-0001 §Citation grounding): W3C PROV-O Recommendation 2013 §3.2 (Moreau, co-editor); Guizzardi 2005 *Ontological Foundations for Conceptual Modeling* Ch. 4 (Information Object); Guarino & Welty 2002 *OntoClean* CACM 45(2) (the +I identity instrument — cited by both the class majority and the DA); W3C SHACL Recommendation 2017 §4.8.1 `sh:node` recursion (Knublauch, co-editor); SKOS Reference 2009 §3/§8 (Isaac) + Singapore Framework 2008 (Baker).
