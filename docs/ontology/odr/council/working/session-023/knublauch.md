# Session 023 — Holger Knublauch (SHACL / TopBraid EDG)

**Lens:** I draw the **layer boundary** that dissolves the question. Coverage of the 31 forms is a **SHACL-targeting** property, not a count-of-TBox-properties property. The per-form leaf structure the S021 walk wants to mint as ~900 flat `owl:DatatypeProperty`s already has a home the Council ratified twice — the **SHACL overlay profiles** (ODR-0010), targeting a *lean* TBox, with **ODR-0008 §Q7a** stating the boundary in so many words. The forms are *regenerated from shapes over a small TBox*; that is exactly what SHACL is for.

**Grounding — named sources I cite throughout:**
- **W3C SHACL Recommendation** (Knublauch & Kontokostas eds., 2017): **Core §2** (shapes), **§2.1 / "Targets"** (`sh:targetClass` — targeting *is* the association), **§4** (constraint components: `sh:node`, `sh:property`, `sh:in`, `sh:minCount`/`maxCount`, `sh:datatype`, `sh:qualifiedValueShape`), **§5** (property shapes / `sh:path`), **§6.5** (severity).
- **SHACL Advanced Features** W3C WG Note (SHACL-AF) — `sh:rule` for derived views.
- **DASH** (datashapes.org) — `dash:editor`/`dash:viewer`, `sh:order`/`sh:group` form metadata.
- **TopBraid EDG governance practice** — taxonomy/ontology layer owns classification; shapes target it and **never reverse-engineer the model from the form's validation structure** (my S022 Q2 ruling, below).
- Standing OPDA precedent: **ODR-0010** (my own canonical mapping, ratified 12-0 at S001/S010); **ODR-0008 §Q7a** + CI-test-1 (per-form variation in the profile layer, base shapes carry zero descriptive `sh:minCount`); **ODR-0009** (Evidence as PROV-O subclasses); **ODR-0011 §1a / "one register, three consumers"** (enum value-sets as SKOS schemes driving `sh:in`).

**My S022 Q2 ruling — quoted, because it is the hinge of S023:**

> *"Shapes describe what data LOOKS LIKE, not what it IS; the taxonomy layer owns classification; shapes validate against it via targeting and NEVER reverse-engineer the model from validation requirements."*

The S021 "mechanical 935-leaf walk" is precisely the inverse of that ruling: it builds the **TBox** out of the **form's leaf structure**. That is the textbook EDG anti-pattern. The corrective is not to mint 900 properties faster — it is to recognise that ~88% of those leaves are *what the data looks like under a given form* (a SHACL-targeting fact), and only ~12% are *what the thing is* (a TBox fact).

---

## Q1 — Diagnosis: conceptual richness or repeated micro-structure?

**It is form-ergonomics + repeated micro-structure, not conceptual richness.** The evidence is decisive and I read it through the SHACL lens: a leaf is a *path in a data graph*, and SHACL's entire design premise (Core §2, §5) is that **many data paths validate against few shapes**. The corpus is exactly that shape:

- **840/1,493 annotated leaves (56%) are one of ~16 generic recurring tail segments** (`details`×269, `price`×99, `comments`×96, `isIncludedExcludedOrNone`×89, `attachments`×82, the six search-result fields ~24 each) — S023-EVIDENCE §B. The project's own `audit.json` already classifies these as *"reusable patterns"* and records `yesNo` *"referenced 1,135 times. Not 1,135 unique concepts."*
- **The final path-segment collapses to 337 distinct names; 241 occur exactly once** — i.e. the repetition is structural recurrence of a *micro-shape*, not 1,493 distinct facts.
- **378 enum leaves → only 54 distinct value-sets** (§B). A reused value-space is a `sh:in` over a SKOS scheme (Core §4.6.1; ODR-0011), authored once.

Is PDTF's granularity "poor modelling"? **No — it is correct-for-a-form-transport, wrong-altitude-for-a-TBox.** A JSON form schema is a *closed-world data-shape*: it must enumerate every field a UI renders. That is precisely the job SHACL Core does on the validation side — and PDTF's leaf tree maps cleanly onto **node shapes + property shapes** (§2, §5). The defect is only that S021 proposes to copy a *closed-world shape graph* into the *open-world TBox* as datatype properties. Per SHACL Core §1.5 (the open/closed-world distinction ODR-0010 §Rules already enforces): `sh:minCount`/the form's presence structure is **not** `owl:minCardinality` — they belong in the shapes graph, not the class graph. The granularity is a SHACL artefact misfiled as an OWL artefact.

**Vote Q1: FOR** the proposition's diagnosis — repeated micro-structure / wrong-altitude-for-a-TBox; not conceptual richness; not "poor modelling," but a form-transport shape that belongs on the SHACL side of the boundary. *(SHACL Core §1.5, §2, §5; S023-EVIDENCE §B; my S022 Q2 ruling.)*

---

## Q2 — The category taxonomy A–G as the import decision-cut

**FOR — A–G is the right decision-cut, because each category is a distinct *SHACL realisation*, not merely a UFO bucket.** My contribution is to name, per category, *which SHACL/standard construct realises it* — that is the operative routing, and it is the layer boundary made concrete:

| Cat | What it is | SHACL/standard realisation (the routing that matters) | Lives in |
|---|---|---|---|
| **A** Disclosure/free-text tails (~407) | one generic "elaborate in prose" slot per question | **one** `sh:property` shape (`opda:disclosureDetail`, `sh:datatype xsd:string`) reused via `sh:node` on the disclosure node-shape | **1 TBox prop + profile shape** |
| **B** Evidence/attachment envelope | a document/evidence envelope | **reuse ODR-0009** `opda:DocumentEvidence rdfs:subClassOf prov:Entity` + ~3 props; a `sh:property [ sh:node opda:EvidenceShape ]` | **0 new TBox** (ODR-0009) |
| **C** Reused status enums (378→54 sets) | enumerated value-spaces | **ODR-0011 SKOS schemes**; one shared property per value-space; `sh:in` over scheme members (Core §4.6.1) | **SKOS + 1 prop/space** |
| **D** Checklist chattels (~315 = 89 items×3) | a controlled list of *items* | **SKOS scheme of fixture items** + 3 props (`inclusionStatus`,`comment`,`price`); the item *is the value*, not the property | **SKOS + 3 props** |
| **E** Repeated report/result (~200) | one result class × ~24 datasets | **one `opda:RiskAssessment`/`SearchResult` node shape** (~6 props) + a peril/dataset SKOS scheme; `sh:node` reused per dataset, prov-bearing | **1 small class** |
| **F** Identity/address/geo (~133) | already modelled upstream | **reuse ODR-0015 (Address), ODR-0006 (Agents)**; geo deferred | **0 new TBox** |
| **G** Genuine descriptive attributes (352 instances → **181 distinct names**) | the real per-Property/LegalEstate facts | **the curated per-leaf TBox walk** — `owl:DatatypeProperty` on `opda:Property`/legal-estate, per ODR-0008 §Q5a/§Q6a; range-SHACL in `opda-shapes.ttl` | **TBox (~181 props)** |

The single boundary rule (state it once, ratify it): **The TBox carries Category G only — the ~181 distinct genuine descriptive concepts (plus the handful of B/E/F classes, mostly reused). Everything else — A's one detail slot, C/D's value-spaces, E's repeated result micro-structure, F's upstream reuse — is expressed as SHACL node/property shapes over that lean TBox, in the ODR-0010 overlay profiles.** Coverage of the 31 forms is then a property of *shape targeting*, not of TBox cardinality.

On the UFO leaning per category (Guarino/Guizzardi own the meta-category; I route, they classify — exactly the EDG order, classification flows *into* validation): A → quality/qua-text or `rdfs:comment`-grade; B → Object (Document, prov:Entity); C → Quale-in-Region (value in a value-space); D → the *item* is an Object/individual in a SKOS scheme, inclusion-status a Quality; E → Object + Quality, prov-bearing; F → settled elsewhere; G → per-leaf Quality/Quale-in-Region/Mode. I do **not** mint the meta-category from the shape — I read it off the taxonomy layer and target accordingly (my S022 Q2 ruling).

**Vote Q2: FOR** A–G as the decision-cut, with the per-category SHACL realisation above as the operative routing. *(SHACL Core §2/§4/§5; ODR-0009, ODR-0011, ODR-0015; my S022 Q2 ruling on classification-owns / shapes-target.)*

---

## Q3 — Whole or part? (the core decision)

**AGAINST importing all annotated leaves 1:1 as flat datatype properties (the S021 mechanical walk). FOR category-based import: collapse A–F to patterns/schemes/classes/upstream-reuse; per-leaf TBox walk only for G.**

This is the question my lens exists to answer, and the standing record already answers it — twice:

1. **ODR-0008 §Q7a, clause 1 (ratified):** *"base TBox `0..*` for every descriptive property; per-form `sh:minCount` lives in ODR-0010 profile shapes."* And **§Q7a CI-test 1:** `ASK { ?p a opda:DescriptiveProperty . ?p sh:minCount ?n . FILTER (?n > 0) }` **returns FALSE in base `opda-shapes.ttl`.** The Council has *already legislated* that per-form leaf structure does not live in the TBox. The 1:1 walk would mint 900 TBox properties to carry structure ODR-0008 explicitly assigned to the profile layer. It is not just over-altitude — it is a standing-decision violation.

2. **ODR-0010 §Rules 1–5 (my canonical mapping, 12-0):** a form is a **set of `sh:NodeShape`s `sh:targetClass`-ing the base classes** (Rule on graph separation: "Shapes reference classes via targeting, never `owl:imports`"). Per-form required → `sh:minCount 1` (Rule 1, *additive*); per-form enum → merged `sh:in` (Rule 2); `oneOf` → `sh:xone` (Rule 3); leaf-ref → `dct:source` (Rule 4). **None of these mints a TBox property per leaf.** The 31 forms are *regenerated from shapes over the TBox* — Rule 5's canonical round-trip. That is the mechanism; the walk bypasses it.

Why the 1:1 walk is affirmatively wrong (not merely larger): the build pass (2026-05-30) found naive last-segment naming **collapses 1,521 distinct leaves into ~351 colliding permanent IRIs** (§D). A SHACL processor would then have many `sh:path` references whose paths are *distinct in the data* (`boilerImmersionHeater.price` vs `radiator.price`) but *identical in the TBox* — you have destroyed exactly the path-distinction SHACL §5 (`sh:path`) is built to preserve, and the IRIs are permanent and unreversible. The category strategy keeps the path-distinction where it belongs: in the *shape's* `sh:path` (instance-addressable, per-form), over a small shared TBox property.

So the cut is: **ratify ~5 structural treatments (A–F) + curate ~181 G-leaves**, an ~80% reduction in the expensive operation, and the *correct* placement under SHACL Core's open/closed boundary and ODR-0008 §Q7a.

**Vote Q3: AGAINST** the 1:1 mechanical walk; **FOR** category-based import (collapse A–F, per-leaf only G). *(ODR-0008 §Q7a clause 1 + CI-test-1; ODR-0010 §Rules 1–5; SHACL Core §5 `sh:path`, §1.5 open/closed; S023-EVIDENCE §D.)*

---

## Q4 — Recurring micro-patterns (A, B, E): reusable shapes, not per-leaf properties

**FOR reusable property/class patterns; AGAINST per-leaf datatype properties.** Each of the three is a *node shape expressing a repeated micro-structure once* — the canonical SHACL move (Core §4.x `sh:node`, the structural-recursion constraint):

- **A — disclosure tail (the 269 `details`).** This is **one** free-text slot, 269 times. Mint **one** `opda:disclosureDetail` property (`sh:datatype xsd:string`); express the question→detail pattern as a node shape `opda:DisclosureShape` with `sh:property [ sh:path opda:disclosureDetail ]` (+ optional `[ sh:path opda:hasAttachment ; sh:node opda:EvidenceShape ]`), and **target it via `sh:node` wherever the pattern recurs**. The 269 occurrences become 269 *targets* of one shape, not 269 properties. (Per my S022 Q2: `details` is `rdfs:comment`-grade meaning — it carries no concept, so it is not a TBox concept.)

- **B — evidence/attachment envelope.** **Reuse ODR-0009 verbatim.** ODR-0009 already declares `opda:DocumentEvidence rdfs:subClassOf prov:Entity` (and `ElectronicRecordEvidence`, `VouchEvidence`), with the attachment/document facets and `prov:wasDerivedFrom`. The 82 `attachments` leaves are one `sh:property [ sh:node opda:EvidenceShape ]`. **Zero new TBox** — this is pure reuse of a ratified module, and SHACL `sh:node` is the construct that wires it in (Core §4.x).

- **E — search/risk-result structure (~200 leaves).** One `opda:RiskAssessment` (or `SearchResult`) **node shape** with ~6 property shapes (`riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution`) — the six fields S023-EVIDENCE §B records as repeating ~24× each. The ~24 datasets become **a peril/dataset SKOS scheme**; each dataset's result is an instance whose shape is the *same* node shape reused via `sh:node` (including the recursive `riskSubcategories[]` nesting, §B-pattern-2). prov-bearing per ODR-0009 (`datasetAttribution` → `prov:wasAttributedTo`). One class + one scheme replaces ~200 datatype properties.

The general principle (SHACL Core §4, the reason `sh:node` exists): **repeated micro-structure is expressed once as a shape and targeted many times; you do not mint a vocabulary term per occurrence.** Minting 269+82+200 ≈ 550 datatype properties for A+B+E would be writing out the shape's recursion as flat vocabulary — the precise misuse §4 is designed to avoid.

**Vote Q4: FOR** reusable shapes/classes (A=one detail prop + `DisclosureShape`; B=reuse ODR-0009 `EvidenceShape`; E=`RiskAssessment` node shape + dataset SKOS scheme); **AGAINST** per-leaf properties. *(SHACL Core §4.x `sh:node`; ODR-0009 PROV-O subclasses; ODR-0011 SKOS; S023-EVIDENCE §B.)*

---

## Q5 — Checklist + enums (D, C)

**FOR reference-data SKOS scheme + ~3 shared props for fixtures (D); FOR ODR-0011 SKOS schemes for the 54 enum value-sets (C). AGAINST 315 datatype properties and AGAINST 378 per-leaf enum properties.**

- **D — Fixtures & fittings (~315 leaves = 89 items × 3 fields).** The 89 chattels are **reference data — a controlled list of *items***, and the right place for a controlled list of items is a **SKOS concept scheme** (ODR-0011 §Rules; SKOS Reference §3), *not* the TBox property space. Mint `opda:FixtureItemScheme` (89 `skos:Concept`s: `boilerImmersionHeater`, `radiatorsWallHeaters`, …) and exactly **three** shared property shapes — `opda:inclusionStatus` (`sh:in` over the `(Excluded,Included,None)` scheme), `opda:fixtureComment`, `opda:fixturePrice`. A fixtures section is then a node shape iterating items from the scheme, each carrying the three props. **3 properties + 1 SKOS scheme replaces 315 datatype properties.** The item identity lives as a *value* (a `skos:Concept`), where reference data belongs — minting `boilerImmersionHeaterPrice`, `radiatorPrice`, … as 89 distinct TBox properties is encoding *reference-data rows* as *schema columns*, the canonical EDG modelling error (my S022 Q2 ruling: the taxonomy layer owns the item list; shapes target it).

- **C — the 54 enum value-sets.** Each value-space → **one `skos:ConceptScheme`** per ODR-0011 §1a, with **one shared reused property** carrying it, constrained by `sh:in` over the scheme's members where closed (ODR-0011 line 75; SHACL Core §4.6.1). ODR-0011's "one register, three consumers" (line 79) is exactly this: the scheme drives `sh:in` + `dash:EnumSelectEditor` + human rendering, authored once. 378 enum *occurrences* collapse to 54 schemes + shared properties — the reuse §B already measured.

**Vote Q5: FOR** D = `FixtureItemScheme` (SKOS) + 3 shared props; C = 54 ODR-0011 SKOS schemes with shared `sh:in`-driven properties. **AGAINST** 315 and 378 datatype properties. *(ODR-0011 §1a + line 75/79; SKOS Reference §3; SHACL Core §4.6.1; my S022 Q2 ruling on reference-data classification; S023-EVIDENCE §B.)*

---

## Q6 — Coverage, round-trip & residual scope (Davis's crux)

**FOR — category-based import satisfies BASPI5 round-trip AND consumer queries WITHOUT 1:1 leaves. The residual WG-curation scope IS Category G (~181 distinct names), and that is the right, bounded per-leaf target.** This is the question Davis owns, and SHACL answers it directly — I'll be concrete (full cross-talk below):

**Round-trip (the MVP gate).** ODR-0010 §Rule 5 *defines* the round-trip as **profile-shapes + DASH + `dct:source` regenerate the form**. Coverage of a form = "every form field is a property shape in the profile that `sh:targetClass`-es the (lean) TBox and carries `dct:source` to its form-question IRI." BASPI5 regenerates from `baspi5.ttl` shapes over the small TBox — *that is what ODR-0010 already proved at the S010 MVP gate*, with zero dependence on 900 TBox leaves. Each form field's per-form structure (`sh:minCount`, `sh:in`, `sh:order`, `dash:editor`, `dct:source`) lives in the **profile**, per ODR-0008 §Q7a. **Collapsing the TBox does not touch round-trip fidelity, because round-trip fidelity was never a TBox property — it is a profile-shape property.** ODR-0008 §Q7a CI-test-1 already *requires* the base shapes to carry none of it.

**Consumer addressability (e.g. `boilerImmersionHeater.price`).** Two independent SHACL-grounded answers, either sufficient:
1. **Instance addressing via path + `dct:source`.** The instance graph carries the full path; the profile property shape carries `sh:path` to the *specific* form location + `dct:source` to the form-question IRI (ODR-0010 Rule 4). A consumer asking for `boilerImmersionHeater.price` resolves it through the shape's `sh:path`/`dct:source`, over the shared `opda:fixturePrice` property scoped by the `FixtureItem` value — the price *of that item*. The path-distinction is preserved in the shape, exactly where SHACL §5 puts it; it is *destroyed* by the 1:1 walk's colliding IRIs (Q3, §D).
2. **Targeted query.** "Price of the immersion-heater fixture" = the `opda:fixturePrice` of the node whose `opda:inclusionStatus`/item value is `FixtureItemScheme:boilerImmersionHeater` — a one-shape SHACL/SPARQL target. The shared property + the item scheme answer the leaf-level query *without* a dedicated `boilerImmersionHeaterPrice` IRI.

**Residual scope.** After A–F collapse to shapes/schemes/reuse, the only per-leaf TBox work is **Category G: ~181 distinct genuine descriptive concepts** (`builtForm`, `yearOfBuild`, `currentEnergyRating`, `councilTaxBand`, `numberOfFloors`, `tenureKind`, `centralHeatingFuelType`, …). That is the *bounded* WG-curation target ODR-0008 envisaged for the descriptive layer — and it is ~12% of the 1,493, an ~80% reduction in the expensive per-leaf operation. It is right-sized because each G-leaf is a real `opda:Property`/legal-estate fact warranting a `dct:source`, an `rdfs:comment`, and a UFO classification — the curation ODR-0008 §Q5a/§Q6a specifies.

**Vote Q6: FOR** — category import satisfies round-trip + consumer queries without 1:1 leaves (round-trip is a profile-shape property, ODR-0010 Rule 5 + ODR-0008 §Q7a; addressability via `sh:path`/`dct:source` + targeted query); residual WG scope = Category G (~181), the correct bounded target. *(ODR-0010 §Rule 5 round-trip; ODR-0008 §Q7a clause 1 + CI-test-1; SHACL Core §5 `sh:path`; S023-EVIDENCE §C/§D.)*

---

## Cross-talk

**With Davis (DA) — answering the completeness-as-a-gate dissent, concretely: how shapes + `dct:source` regenerate BASPI5 without 1:1 TBox leaves.**

David, your S021 dissent has two prongs (S023-EVIDENCE §D); SHACL answers both, and the answer is *already ratified machinery*, not a promise.

*Prong 1 — "a collapsed TBox may fail to regenerate all 31 forms (BASPI5 round-trip, the MVP gate)."* The round-trip does not read the TBox property-set; it reads the **profile shapes graph**. Walk it through `baspi5.ttl` as ODR-0010 §Rule 5 defines it:

- A BASPI5 field — say the chattel `basicFittings.boilerImmersionHeater.price` — is regenerated from a **property shape in `baspi5.ttl`**:
  `sh:property [ sh:path opda:fixturePrice ; sh:node opda:FixtureItemShape ; dash:editor dash:TextFieldEditor ; sh:order N ; sh:group :BasicFittingsGroup ; dct:source <https://opda.uk/forms/baspi5#…> ]`,
  scoped to the `boilerImmersionHeater` item (a `skos:Concept` in `FixtureItemScheme`).
- Everything the DASH renderer needs to redraw that field — label, editor, order, section, the form-question link — is **on the shape**, not on a TBox `boilerImmersionHeaterPrice` property. ODR-0008 §Q7a CI-test-1 *forbids* that per-form structure from living in the base TBox anyway.
- So regenerating BASPI5 = walking `baspi5.ttl`'s shapes and emitting one field per property shape, resolving `dct:source` to the form question. **The TBox supplies only the shared semantic anchor (`opda:fixturePrice`, the item scheme); the profile supplies the form.** This is the round-trip you and Queen Kendall accepted at S010 — it never depended on 900 leaves.

*Prong 2 — "a consumer asks for a specific leaf (`boilerImmersionHeater.price`) and a collapsed TBox cannot answer."* It can, two ways (Q6 above): the **path + `dct:source`** carries the instance addressing (SHACL §5 keeps the path-distinction in the shape, where it is *lossless*); and the **targeted query** ("`opda:fixturePrice` of the node whose item is `FixtureItemScheme:boilerImmersionHeater`") returns the leaf without a dedicated IRI. Note the *reversal*: the 1:1 walk you'd defend **loses** this addressability — naive last-segment naming collapses 1,521 leaves into ~351 colliding IRIs (§D), so `boilerImmersionHeater.price` and `radiator.price` become the *same* TBox IRI. Completeness-as-a-gate, applied to the 1:1 walk, **fails its own test**; applied to the category strategy, it passes via `sh:path` + the item scheme.

*The deeper point.* Your gate is right to insist on; I'm disputing *where coverage is measured*. Coverage is a **SHACL-targeting** property — "does a profile shape target every form field and carry its `dct:source`?" — not a **count-of-TBox-properties** property. ODR-0008 §Q7a and ODR-0010 §Rule 5 already placed it there. Measure coverage against the profiles (where the CI test runs: §Q7a CI-test-2 already checks per-form `sh:in` reconstructs the scheme), and the category strategy is *complete by construction* while the 1:1 walk is *incomplete-and-colliding*. If you want a hard gate I'll co-sign: **a CI `ASK` that every BASPI5 form-question IRI is the `dct:source` of exactly one profile property shape** — that *is* round-trip coverage, and it is indifferent to TBox cardinality.

**One caution to the whole panel (the EDG anti-pattern, named):** the S021 "mechanical walk" builds the **model out of the form's validation structure** — it reads the leaf tree and emits a TBox property per leaf. In TopBraid EDG that is the canonical error: the taxonomy/ontology layer owns the model; shapes target it; you **never reverse-engineer the partition from validation requirements** (my S022 Q2 ruling, ratified context). "≈90% mechanical" (ADR-0028) is true *only* if the target is SHACL shapes (mechanical from the leaf tree — that is what shapes are *for*); it is false if the target is the TBox (the build pass proved it: no leaf→term map, colliding IRIs, hand-curated existing 23). Route the mechanical 90% to the **profiles**; reserve the deliberate 10% (~181 G-leaves) for the **TBox**. Same generator, correct destination.
