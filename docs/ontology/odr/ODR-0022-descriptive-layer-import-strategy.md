---
status: accepted
date: 2026-05-30
kind: architecture
tags: [descriptive-layer, property-categorisation, import-strategy, vocabulary-granularity, skos, shacl-profile, reference-data, yagni]
scope: [pdtf-v3:propertyPack]
council: session-023
supersedes: []
depends-on: [ODR-0006, ODR-0009, ODR-0010, ODR-0011, ODR-0015]
implements: [ODR-0008]
---

# Descriptive-Layer Import Strategy & Property Categorisation

## Context and Problem Statement

[ODR-0008](./ODR-0008-property-descriptive-attributes.md) ratified *Declare-once-reconcile-overlays*: flatten the `propertyPack` tree and declare each descriptive property once on the Property/legal-estate classes. [Session 021](./council/session-021-bounded-context-implementation-plan.md) then scheduled the **935-leaf descriptive walk** as a "~90 %-mechanical" emission — one annotated PDTF base leaf → one flat `owl:DatatypeProperty` ([ADR-0028](../../adr/ADR-0028-descriptive-layer-walk-and-home-pass-emission.md)). The 2026-05-30 build pass proved the walk is **not** mechanical: there is no leaf→term map, the existing ~23 descriptive properties were hand-curated, and naive last-segment naming collapses 1,521 distinct leaves into ~351 **colliding, permanent, unreversible** `opda:` IRIs. The walk was deferred to "a curated WG pass" — exposing a prior question the schedule had skipped: *before curating, what should be imported at all, and at what granularity?*

The empirical answer (reproducible from `data-dictionary-canonical.json`; see the [evidence pack](./council/working/session-023/EVIDENCE.md)): of **~1,493 annotated base leaves**, **56 % (840) are ~16 generic recurring tail-segments** (`details`×269, `price`×99, `comments`×96, `isIncludedExcludedOrNone`×89…); 378 enum leaves carry only **54 distinct value-sets**; **809** leaf names appear in ≥2 of the 16 schemas (393 in ≥3); the project's own `audit.json` flags `yesNo` as "referenced 1,135 times — not 1,135 unique concepts." Three structures recur: fixtures = an ~89-item chattel checklist ×3 fields; searches/environmental = one six-field risk-result ×~24 datasets; disclosure = one `details` slot ×269. The leaf explosion is **form-ergonomics + repeated micro-structure**, not conceptual richness — PDTF is *correct-for-a-form-transport, wrong-altitude-for-a-TBox*. Only **~181 distinct names (~12 %)** are genuine descriptive concepts. This decision was deliberated by the Linked Data Council at [session-023](./council/session-023-descriptive-layer-import-strategy.md) (Full Council; Queen Allemang; DA Davis; near-unanimous, Q1/Q3/Q4/Q5/Q6 11–0–0, Q2 10–0–1).

## Considered Options

* **Option A (chosen) — Category-based descriptive-layer import (seven categories A–G).** Classify every annotated base descriptive leaf into one of seven property categories and apply each category's fixed treatment, reserving expensive per-leaf curation for Category G and a regulatory-salience allow-list.
* **Option B — Import 1:1 — the mechanical 935-leaf walk (S021 / ADR-0028 as written).** Rejected: neither mechanical (collides 1,521 leaves into ~351 colliding permanent IRIs; no leaf→term map) nor governable nor reversible; it is the strictly worse collapse, by accident and without provenance.
* **Option C — Import nothing / leave the descriptive layer to forms only.** Rejected: fails ODR-0008's ratified attachment of descriptive facts to real classes and the BASPI5 round-trip MVP gate; consumers get no descriptive vocabulary.
* **Option D — Promote every checklist item and search dataset to an OWL class.** Rejected: over-engineering — fixture items and enum value-spaces have no per-item identity criterion or lifecycle (Kendall & McGuinness Ch. 5 — SKOS for controlled value/reference sets); a class earns its keep only on a named §Q4a consumer query.
* **Option E — Collapse by last path-segment.** Rejected: catastrophic mis-binning (swallows the headline `priceInformation.price` into the chattel `price` bucket); permanent and unreversible.
* **Option F — Curate all ~935 leaves by hand up front.** Rejected: the expensive operation this record bounds; ~88 % of leaves are structure with no domain identity criterion, so per-leaf WG judgment on them is wasted.

## Decision Outcome

Chosen option: "Option A — Category-based descriptive-layer import", because the 1:1 walk is the strictly worse collapse (colliding ~1,521 leaves into ~351 accidental provenance-less permanent IRIs), whereas category import collapses by design with provenance preserved, ~5× fewer permanent IRIs, and more query power, while a lean TBox + SKOS schemes + a few classes carry every competency question the 935-leaf version answers.

Adopt **category-based descriptive-layer import**: classify every annotated base descriptive leaf into one of **seven property categories (A–G)**; apply each category's fixed **treatment** (collapse-to-pattern / reuse-upstream / map-to-SKOS-scheme / promote-to-class / curate-per-leaf) realised in the named record; reserve expensive per-leaf curation for **Category G (~181 genuine descriptive concepts) plus a small regulatory-salience allow-list carved from A/E**; and **do NOT import the ~935/1,493 leaves 1:1 as flat datatype properties** — chosen because the 1:1 walk is the *strictly worse* collapse (it collides ~1,521 leaves into ~351 accidental provenance-less permanent IRIs), whereas category import collapses by *design* with provenance preserved, ~5× fewer permanent IRIs, and more query power, while a lean TBox + SKOS schemes + a few classes carry every competency question the 935-leaf version answers. The collapse is ratified **behind three enforceable gates** (path-aware binning, schema-leaf-path traceability, coverage-by-test) that convert the Devil's-Advocate completeness dissent into acceptance criteria rather than a veto.

### Consequences

* **The ADR-0028 walk is re-scoped, not executed as written.** Its target becomes **Category G (~181) + the regulatory-salience allow-list**, emitted under the path-aware binning rule (G1) with schema-leaf-path `dct:source` (G2), gated by G3 — not a 935-leaf flat emission. Amend ADR-0028 (or author a successor) to record the bounded, gated scope; the walk stays deferred to the curated WG pass.
* **The ADR-0029 overlay profiles MUST enumerate each form's leaves** in their `sh:path`/`sh:minCount`/`dct:source` shapes (they are currently emitted *thin*) — this is what carries round-trip under G3. The C/D SKOS schemes and the E class become emitter targets alongside the G walk.
* **The engineering realization is owned by [ADR-0030](../../adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md)** (`implements: [ODR-0022]`): the path-aware classifier (G1), the category emitters (A `disclosureDetail` / C status-enum schemes / D `FixtureItemScheme`), the schema-leaf-path sourcing (G2), the `ci-descriptive-roundtrip` coverage gate (G3), and the in-code holds that keep the curated Category-G IRIs unminted (Categories E and D were emitted 2026-05-30 once their councils discharged — R1 / ODR-0008d and R4 — so only the curated Category-G walk stays held). This ODR decides *what* is imported and at what granularity; ADR-0030 owns *how* the generator realizes and enforces it.
* **ODR-0011 grows ~54 status-enum schemes + the `FixtureItemScheme`**, each with a named steward; regulator-governed schemes carry authority `dct:source`. **ODR-0009 absorbs Category B and E provenance** with no new local terms beyond the E class. **A new `pattern` ODR** discharges the E class's UFO commitment + IC (fires ODR-0008 §Q2a(b)).
* **The expensive WG operation shrinks ~80 %**: from "evaluate 935 leaves" to "ratify ~5 treatments + curate ~181 G-leaves + a small salience allow-list." Per-leaf WG judgment is spent only where a domain identity criterion exists.
* **Status `proposed`**; adoption flows through the OPDA WG → Modelling Sub-Committee (adoption.md §3). The build may proceed in parallel; status flips on ratification. The three gates are the WG's acceptance checklist.

## More Information

- **Council**: [session-023 — Descriptive-Layer Import Strategy & Property Categorisation](./council/session-023-descriptive-layer-import-strategy.md) (Full Council; Queen Allemang; DA Davis; Q1/Q3/Q4/Q5/Q6 11–0–0, Q2 10–0–1; the DA's completeness dissent converted into gates G1–G3). Shared evidence: [`working/session-023/EVIDENCE.md`](./council/working/session-023/EVIDENCE.md).
- **Operationalises**: [ODR-0008 — Property Descriptive Attributes](./ODR-0008-property-descriptive-attributes.md) (Declare-once-reconcile-overlays; §Q1a residue register, §Q2a(b) authority-artefact spawn, §Q3a schema-leaf-path `dct:source` = G2, §Q4a class-promotion, §Q5a datatype-vs-SKOS, §Q6a flat-default, §Q7a per-form variation → profiles).
- **Realizing records**: [ODR-0009](./ODR-0009-claims-evidence-provenance.md) (B, E provenance); [ODR-0011](./ODR-0011-enumeration-vocabularies.md) (C 54 schemes, D `FixtureItemScheme`); [ODR-0010](./ODR-0010-overlay-profile-mechanism.md) (per-form profiles carry round-trip); [ODR-0015](./ODR-0015-address-and-geography.md) + [ODR-0006](./ODR-0006-agents-and-roles.md) (F reuse); ODR-0007 (D inclusion Mode).
- **Realizing engineering ADR**: [ADR-0030 — Category-Based Descriptive Emission Pipeline & Import Gates (G1–G3)](../../adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) — the `opda-gen` realization of this strategy (the path-aware classifier, the category emitters, G1/G2/G3 as CI, the in-code boundary holds); `implements: [ODR-0022]`.
- **Cross-corpus ADRs**: [ADR-0007 — Ontology generator specification](../../adr/ADR-0007-ontology-generator-specification.md) (the deterministic-emission + byte-identity discipline ADR-0030 extends); [ADR-0028](../../adr/ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) (re-scoped to G + salience allow-list); [ADR-0029](../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) (profiles enumerate per-form leaves).
- **Data**: `source/00-deliverables/semantic-models/data-dictionary-canonical.json` (8,458 entries / 16 schemas), `audit.json` (the reusable-pattern inflation: `yesNo` ×1,135, etc.), `business-glossary.md` (trust-framework/API terms — does NOT define the descriptive properties; their meaning is the schema `title`).
- **External citations** (from the session, per ODR-0001 §Citation grounding): Kendall & McGuinness 2019 *Ontology Engineering* (message-model vs reference-ontology; identifiers are commitments); Guizzardi 2005 + Guarino & Welty 2002 OntoClean (no-IC ⇒ not a sortal worth minting); SKOS Reference (W3C 2009) §3 + Singapore Framework (Nilsson/Baker/Johnston 2008, reuse-before-mint); W3C SHACL Recommendation + TopBraid EDG (shapes describe what data looks like, not what it is); Linked Data principles + *Cool URIs Don't Change* (Berners-Lee) + Hendler 2003 "A Little Semantics Goes a Long Way"; BBC `/programmes/` ontology (Davis 2009).

## Rules

Normative for the descriptive-layer import (`propertyPack` tree + participant/chain descriptive leaves). This record decides *granularity, routing, and acceptance gates*; each category's binding ontological commitment (UFO meta-category + identity criterion) is discharged in its realizing `pattern` record, cited below.

### 1. The property-category taxonomy (A–G) — treatment + realizing record

Every annotated base descriptive leaf MUST be assigned to exactly one category. The treatment is fixed per category; the per-category ontological commitment is owned by the realizing record.

| Cat | Leaves (~) | What it is | UFO leaning | **Treatment** | Realizing record |
|---|---|---|---|---|---|
| **A** Disclosure / free-text tails (`details`, `comments`, `summary`) | ~407 | one generic prose-elaboration slot per question | not a domain entity; `rdfs:comment`-grade, no IC | **one** reusable annotation property `opda:disclosureDetail`; the question is carried by the subject + `dct:source`, **never** a per-question property | this ODR + ODR-0008 §Rules |
| **B** Evidence / attachment envelope (`attachments`, `fileName`, doc metadata) | (small as scalar leaves; arrays) | a document/evidence envelope | Object (Document/Evidence), prov-bearing | **reuse ODR-0009 Evidence + PROV-O; mint nothing** | [ODR-0009](./ODR-0009-claims-evidence-provenance.md) |
| **C** Reused status enums (Yes/No, Included/Excluded/None, Attached/To-follow) | 378 → **54 value-sets** | reused enumerated value-spaces | Quale-in-Region | **one `skos:ConceptScheme` per distinct value-set (~54), each reused by ONE shared property**; per-form `sh:in` restriction in the profile | [ODR-0011](./ODR-0011-enumeration-vocabularies.md) §8a |
| **D** Checklist items (fixtures & fittings chattels) | ~315 (≈89 items×3) | a controlled list of *items* | item = **Object/Kind**; inclusion = **Mode/Relator of the sale transaction** (NOT a Quality of the Property) | **one `opda:FixtureItemScheme` (SKOS, ~89 item concepts) + ~3 shared props on a transaction-scoped fixtures list** — `opda:inclusionStatus` (over the C scheme), `opda:comment` (A-grade), `opda:price` (**reuse a `MonetaryAmount` pattern, not 89 `price` props**). NOT a `FixtureItem` class (over-engineering; promote only on a named §Q4a query) | [ODR-0011](./ODR-0011-enumeration-vocabularies.md) + ODR-0007 (inclusion Mode — **confirmed [S027](./council/session-027-fixtures-inclusion-mode.md)**) |
| **E** Repeated report/result structures (search / environmental risk datasets) | ~200 | one six-field result × ~24 datasets | Object (information artefact, prov-bearing) + Qualities (`riskIndicator` = Quale-in-Region) | **promote to one `opda:SearchResult` / `opda:RiskAssessment` class (~6 props) + a first-class peril/dataset SKOS scheme**, hung off ODR-0009 provenance. The peril axis MUST be a dereferenceable scheme concept, never an opaque string | **realized by [ODR-0008d](./ODR-0008d-authority-retrieved-artefacts.md)** (S024) — `opda:RiskAssessment` (Information Object) + `opda:PerilScheme` |
| **F** Identity / address / contact / geo sub-fields (`line1`, `postcode`, `email`, `lat`, `lng`) | ~133 | already modelled upstream | Object, settled elsewhere | **reuse ODR-0015 (Address), ODR-0006 (Agents); geo deferred** — never re-mint | [ODR-0015](./ODR-0015-address-and-geography.md), [ODR-0006](./ODR-0006-agents-and-roles.md) |
| **G** Genuine descriptive attributes (`builtForm`, `currentEnergyRating`, `councilTaxBand`, `numberOfFloors`, `centralHeatingFuelType`…) | **~181 distinct names** | the real per-Property/legal-estate facts | Quality / Quale-in-Region / Substance-Kind label / Mode, per leaf | **the curated per-leaf walk** — one dereferenceable `opda:` term per concept, flat per §Q6a | [ODR-0008](./ODR-0008-property-descriptive-attributes.md) §Q4a/§Q5a/§Q6a |

Net: ~5 reusable patterns + ~56 SKOS schemes + ~2 classes + upstream reuse replace ~750 flat properties; **only Category G + the salience allow-list is curated per-leaf.**

**C vs G — the binning boundary (clarified after [session-025](./council/session-025-ufo-axis-submodules.md)).** A leaf is **G** when it is a genuine Property/estate attribute *even if it carries an enum* — `currentEnergyRating`, `councilTaxBand`, `builtForm`, `tenureKind` are **G**, their value-space becoming a SKOS *range* (ODR-0008 §Q5a: "Quale-in-Region → SKOS scheme; **Quality of `opda:Property`**"), not Category-C membership. **C** is reserved for the *reused status* value-spaces (Yes/No, Included/Excluded/None, Attached/To-follow) that recur as cross-cutting flags. A path-aware binner MUST NOT route an enum-bearing genuine attribute to C on the strength of the enum alone — the ADR-0030 §G1 categoriser defect (`if has_enum → C`) over-captured these flagship Quale attributes. **The binner has since been corrected** (S025 fix applied — the §Q5a-named Quale attributes route to G before the enum fallback), lifting the candidate-G count from 182 to **188** (C 159 → 153).

### 2. The three ratification gates (the collapse is ratified only behind these)

These are the **acceptance requirements** the import must satisfy — *what must hold* for the collapse to be sound. Their **realization and CI enforcement live in [ADR-0030](../../adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md)** (the path-aware classifier, the schema-leaf-path sourcing, the `ci-descriptive-roundtrip` gate, the byte-identity discipline): this ODR states the requirement, ADR-0030 states the mechanism.

| Gate | Requirement | Why (verified at S023) |
|---|---|---|
| **G1 — path-aware binning** | The leaf→category rule MUST be **path-aware, not last-segment**. It MUST demonstrably place `propertyPack.priceInformation.price` in **G** and `propertyPack.fixturesAndFittings.*.price` in **D**. The ~181 G-set is a *projection* until the rule runs; it becomes a **counted set before any IRI is minted**. | Of 99 `price` leaves, 98 are fixtures (D) but `priceInformation.price` (the headline asking price) is G — a name-only rule mis-bins it, and the mis-mint is permanent (ADR-0028 §14). |
| **G2 — schema-leaf-path traceability** | Every collapsed-category instance and every G property MUST carry `dct:source` to its **schema leaf path** (the form-question IRI, ODR-0008 §Q3a per-overlay array) — **NOT** to the deciding ODR. **(S034 amendment, 2026-06-01.)** The "schema leaf path" is satisfied by *either* a human form-question ref (e.g. `…/forms/baspi5#A1.1.5`) *or* a **JSON-pointer into the overlay schema** (`<schema $id>#/path/to/field`); both dereference to the originating leaf and neither is the deciding ODR, so a form with no human form-question ref is still anchorable. The overlay-profile enumerator ([ADR-0029](../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) gap-1, S034) takes the JSON-pointer anchor for ref-bearing forms. Forms carrying **no** ref at all (oc1/llc1 — [ODR-0008d](./ODR-0008d-authority-retrieved-artefacts.md) authority-retrieved register **extracts**, not human-filled forms) stay thin until a register-data consumer query lands (held-as-live, session-034). | The current emission points `dct:source` at the decision record (e.g. `…/odr/ODR-0008#section-Q5a`, verified in `opda-classes.ttl`). Under collapse that loses which question a leaf came from, in both directions. Fixing it makes "collapsed = recorded, never lost" true. **The pre-S034 thin oc1.ttl/llc1.ttl `dct:source`→ADR-0029 was exactly this anti-pattern; S034 admits the JSON-pointer anchor as the cure.** |
| **G3 — coverage-by-test** | "Coverage preserved" is ratified ONLY when **(a)** a BASPI5 round-trip passes on the *collapsed* TBox (the S021 byte-identity discipline applied to the descriptive layer), and **(b)** a worked SPARQL query retrieves a collapsed leaf **by path** + a Category-G leaf **by dereferenceable term** (and, for E, "flood `riskIndicator` for property X" by peril scheme). | Round-trip is a property of the SHACL profile (ODR-0008 §Q7a; base TBox carries zero descriptive `sh:minCount`), not of TBox cardinality — but it is *sound-but-untested* for a collapsed TBox. Test, don't assert. |

On G1 + G2 + G3 passing, the DA's S021 *completeness-as-a-gate* dissent is withdrawn in full.

### 3. Regulatory-salience carve-out

The A↔G and E↔G boundaries are drawn by **regulatory salience, not segment name**. A generic-tailed leaf (`details`, `result`) whose **parent question is regulator-named** — Building Safety Act, EWS1/cladding, spray-foam, Japanese knotweed, a named CON29 search peril, a regulator-governed value-space (EPC band A–G is DESNZ-governed; council-tax band A–I is VOA-governed) — is **curated as Category G regardless of its tail**, and its value-space scheme carries `dct:source` to the **governing authority**. Generic *shape* collapses; regulatory *substance* does not. This realises ODR-0008 §Q4a (distinct-lifecycle / distinct-PII promotion) at binning time.

### 4. The D Object/Mode split (normative)

A fixtures-checklist item is **NOT** a datatype Quality of `opda:Property`. The item (`boilerImmersionHeater`) is an **Object/Kind** → a `skos:Concept` in `opda:FixtureItemScheme`. Its **inclusion** ("Included / Excluded / None") is a **Mode/Relator of the sale transaction** (ODR-0007 territory) — the same boiler is included in one sale and absent from the next — modelled as `opda:inclusionStatus` on a transaction-scoped fixtures list, never as a property of the brick-and-mortar. `price` reuses a `MonetaryAmount` pattern.

### 5. The residue register (no silent loss)

Categories A–F are not exhaustive by construction. A leaf that resists every pattern routes to the **ODR-0008 §Q1a reconciliation register** with a recorded disposition. "Collapsed" MUST mean *recorded as collapsed*; a leaf is **never** silently dropped.

### 6. Anti-patterns (the reasons this record exists)

- **Do NOT mint one `owl:DatatypeProperty` per annotated leaf** (the S021 1:1 walk). It is neither mechanical (no leaf→term map; collides 1,521→~351) nor governable (900 permanent form-slot IRIs) nor reversible. Its only argument was one-time generator convenience; the build pass removed even that.
- **Do NOT bin by last path-segment** (G1). `details`×269 and `price`×99 are not one concept each.
- **Do NOT collapse Category G or the salience allow-list** — these keep term-grain, one dereferenceable `opda:` IRI per concept.
- **Do NOT flatten the peril/dataset axis (E) or a regulator-named disclosure (A) into an opaque string** — flatten the *shape*, keep the *scheme*.
- **Do NOT re-mint Category F** (address/contact/geo) — reuse ODR-0015/0006.
- **Do NOT point `dct:source` at the deciding ODR** (G2) — point at the schema leaf path.

