---
status: proposed
date: 2026-05-30
tags: [ontology, generator, descriptive-layer, categorisation, emission, gates, ci, byte-identity, skos]
supersedes: []
depends-on: [ADR-0007, ADR-0028, ADR-0029, ODR-0008, ODR-0011, ODR-0023, ODR-0022]
implements: []
---

# Category-Based Descriptive Emission Pipeline & Import Gates (G1–G3)

> **Build status — 2026-05-30: EXECUTED (sound slice; full-fidelity coupled to the deferred walk + councils R1/R4).** Delivered and green — full `opda-gen` pytest suite (216 pass / 1 xfail) + all three existing CI gates (byte-identity, three-graph, profile-contract) + the new `ci-descriptive-roundtrip` gate. The path-aware categoriser counted **182 candidate Category-G distinct names** (validating ODR-0022's ~181 projection; since corrected to **188** by the S025 G1 fix — see the amendment below). Uncommitted in the working tree. Status stays `proposed` pending OPDA WG ratification of [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md).

> **Amendment — Council Session 025 (R2; 2026-05-30): G1 binning defect + Category-E unblocked.** **(1) Defect:** the categoriser (`src/opda_gen/inputs/leaf_categoriser.py` — `if has_enum: → C`) routes **every** enum-bearing leaf to Category C, mis-capturing the **Quale-in-Region genuine descriptive attributes** (`currentEnergyRating`, `councilTaxBand`, `builtForm`, `tenureKind`) that ODR-0022 §1 lists as **Category G** (their value-space is a SKOS *range* per ODR-0008 §Q5a, not Category-C membership). So the counted candidate-G set (182) **undercounts G** and over-counts C — the figure is **provisional**. **Fix required:** route a leaf to **G** when it is a genuine Property/estate attribute even if it carries an enum (the enum becomes its SKOS range), reserving **C** for the *reused status* value-spaces (Yes/No, Included/Excluded/None, …); then re-run `categorise-leaves` before the WG curates G. Found by Davis (DA) at [session-025](../ontology/odr/council/session-025-ufo-axis-submodules.md); also recorded in ODR-0022 §1. **Fix applied (2026-05-30):** the categoriser routes the §Q5a-named genuine Quale attributes to **G** via a `_G_PROPERTY_QUALE_TAILS` allow-list *before* the `has_enum → C` fallback (which stays intact for reused-status flags); `categorise-leaves` re-run → candidate-G **182 → 188**, C **159 → 153**; full `opda-gen` suite + all four CI gates green; regression tests added. **(2) Category-E unblocked:** [ODR-0008d](../ontology/odr/ODR-0008d-authority-retrieved-artefacts.md) (S024) supplies the `opda:RiskAssessment` Information Object + `opda:PerilScheme`, so the held Category-E emitter target now has its model.

> **Emission update — 2026-05-30: Categories E and D now emitted (R1/R4 discharged).** The held Category-E and Category-D emitter targets are now realised in the generator, faithful to [ODR-0008d](../ontology/odr/ODR-0008d-authority-retrieved-artefacts.md) §Rules 1–5 and ODR-0022 §1 row D / R4. **Category E:** `opda:RiskAssessment` (Information Object, `rdfs:subClassOf prov:Entity`) + `opda:PerilScheme` (12 dereferenceable peril concepts, steward Baker) + `opda:RiskIndicatorScheme`/`opda:ActionAlertRatingScheme` + properties `opda:peril`/`opda:riskIndicator`/`opda:actionAlertRating`/`opda:hasSubAssessment` + `RiskAssessmentShape` (recursive `sh:node`) + the five classes' Substance-Kind→Information-Object correction and internal-structure shapes; `datasetAttribution` reuses `prov:wasAttributedTo` (not minted — Rule 5). **Category D:** `opda:inclusionStatus` (a sale-transaction Mode — `FixturesListShape` targets `opda:Transaction`, never `opda:Property`) + the single shared `opda:price`, over the existing `opda:FixtureItemScheme` (89 items). Verified: pytest **243 pass / 1 xfail**, all four CI gates byte-identity-clean, site build green. **Only the ~188 Category-G per-leaf IRIs remain held** for the WG curated walk. Three modelling choices are flagged for WG review: the dedicated `opda:RiskIndicatorScheme` (vs. reusing `YesNoNotKnownScheme`), `opda:PerilScheme` carrying no `skos:narrower` (the data attests no enumerated sub-peril value-set — recursion rides `opda:hasSubAssessment`), and `opda:price` as a single shared property (no `opda:MonetaryAmount` value type exists yet).

## Context and Problem Statement

[ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) decided — at the ontology-modelling layer — to import the PDTF descriptive layer **by property-category (A–G)** rather than as a 1:1 mechanical 935-leaf walk, ratified behind three gates (G1 path-aware binning, G2 schema-leaf-path `dct:source`, G3 coverage-by-test). That is a *modelling* decision; it does not say how the `opda-gen` generator realises it. The prior emission ADR — [ADR-0028](./ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) — specified the now-re-scoped flat walk and was found *not mechanical*; [ADR-0029](./ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) covers the overlay profiles. Neither records the **engineering subsystem ODR-0022 actually requires**: a path-aware leaf classifier, the per-category emitters, the gate machinery as CI, and — critically — the **in-code discipline that prevents the generator from minting the parts ODR-0022 reserved for council (Category E, the fixtures inclusion-Mode) and for the WG curated pass (the 182 Category-G permanent IRIs)**.

Without a dedicated record, a future engineer reading `opda-gen` cannot tell *why* the categoriser emits `disclosureDetail` and the `FixtureItemScheme` but pointedly does **not** emit `opda:RiskAssessment`, `opda:inclusionStatus`, or the 182 G properties — and might "complete" the pipeline, minting permanent IRIs the council and WG deliberately withheld. This ADR is that record.

## Decision Drivers

* **Permanence is irreversible.** `opda:` terms are published `w3id.org` IRIs (ODR-0004); the generator must not mint a term ODR-0022/ODR-0023 reserved for human curation or council.
* **Gates must be enforceable, not aspirational.** G1/G2/G3 have to be code + CI a reviewer runs, not prose.
* **Determinism / byte-identity.** Every emission change must survive the byte-identity, three-graph, and profile-contract CI (ADR-0007 discipline); the corpus is regenerated and re-pinned **once**.
* **Counted, not projected.** Davis's gate (session-023) requires the Category-G set be a counted artefact before any IRI is minted.
* **The ODR/ADR boundary.** Modelling (which categories, what they mean) is ODR-0022; encoding (how the generator classifies and emits) is this ADR.

## Considered Options

* **A — Dedicated category-emission pipeline + gate machinery (chosen):** a `leaf_categoriser` stage feeding per-category emitters, with G1/G2/G3 realised as the classifier + sourcing discipline + a `ci-descriptive-roundtrip` gate, and the council/WG-reserved emissions explicitly withheld in code.
* **B — Implement the mechanical 935-leaf walk in the generator (ADR-0028 as originally written):** rejected by ODR-0022 — not mechanical, collides 1,521 leaves into ~351 permanent IRIs, no provenance.
* **C — Fold the work into ADR-0007 / ADR-0028 without a dedicated ADR:** rejected — the categoriser + the three gates + the boundary holds are a distinct, independently-testable subsystem whose *omissions* (E, inclusion-Mode, G IRIs) are load-bearing and must be citable, or they will be "fixed" by a later contributor and mint reserved terms.

## Decision Outcome

Chosen option: **A — a category-based descriptive emission pipeline with enforceable import gates**, because it makes ODR-0022's strategy executable and verifiable while encoding, in the generator itself, the boundaries that keep council- and WG-reserved terms unminted.

The subsystem, as built in `tools/opda-gen/`:

- **G1 — path-aware leaf categoriser.** `src/opda_gen/inputs/leaf_categoriser.py` classifies every annotated base descriptive leaf into exactly one of A–G **by full path** (never last-segment): `propertyPack.priceInformation.price` → **G**, `propertyPack.fixturesAndFittings.*.price` → **D**, with the §3 regulatory-salience carve-out lifting generic-tailed regulator-named leaves (BSA / EWS1 / cladding / named CON29 perils / regulator-governed value-spaces) into **G**. A `categorise-leaves` CLI command writes the **counted** report — per-category counts, the **candidate Category-G set (182 distinct names)**, and the **residue register (16 leaves)** — to `source/00-deliverables/semantic-models/descriptive-category-binning.json`. The report emits **no ontology triples and mints no IRI**.
- **Category emitters (the buildable collapse).** **A** → one `opda:disclosureDetail` annotation property (`emitters/modules/descriptive.py`); **C** → the reused status-enum value-spaces as `skos:ConceptScheme`s (YesNo / Inclusion / AttachmentStatus families) reused by shared properties, with one-shot enums left to `sh:in` per ODR-0008 §Q5a (`emitters/vocabularies.py`); **D (candidate)** → `opda:FixtureItemScheme` with **89 fixture-item concepts** (items only).
- **G2 — schema-leaf-path `dct:source`.** Descriptive *property declarations* source to their defining ODR (A9 class/term discipline); the **instance-level** `dct:source` points at the **form-question schema leaf path** per ODR-0008 §Q3a (`term_sourcing.py`), curing the verified defect where terms pointed at the deciding-ODR section.
- **G3 — coverage-by-test gate.** `src/opda_gen/ci/descriptive_roundtrip_test.py` + the `ci-descriptive-roundtrip` CLI assert that every form-question leaf is the `dct:source` of exactly one profile property-shape `sh:path` (round-trip coverage), reporting gaps as gaps (it currently reports the thin-profile shortfall — "2 unaddressable, 3 doubly-bound, 3 traceability" — and skips clean) until the walk + per-form profile enumeration (ADR-0029) land.
- **Single byte-identity re-pin.** The emitters are changed in code; the corpus is regenerated (`emit`) and the byte-identity baseline re-pinned **once**, by the integrating step — not per-agent.

### Supersession scope:

This ADR does **not** supersede ADR-0028 or ADR-0029. ADR-0028's walk is **re-scoped** (its own Council-023 amendment) to the Category-G + salience target this pipeline feeds; ADR-0029's profiles remain the round-trip carrier this ADR's G3 gate measures. This ADR adds the *classifier + gate + non-walk-category* machinery between them.

### Consequences

* Good, because ODR-0022's three gates become **runnable CI** (`categorise-leaves`, `ci-descriptive-roundtrip`) a reviewer or the WG can execute, not prose.
* Good, because the **182-name candidate Category-G set is a counted, path-aware, reviewable artefact** (`descriptive-category-binning.json`) — the WG curation input, and Davis's gate precondition satisfied.
* Good, because the **collapse half emits now** (one `disclosureDetail`, the reused status schemes, the 89-item `FixtureItemScheme`) with all CI green — ~750 leaves no longer headed for flat datatype properties.
* Good, because the **council/WG boundaries are encoded in the generator**: Categories E and D emitted only once their councils discharged (`opda:RiskAssessment` → R1 / ODR-0008d; `opda:inclusionStatus` → R4), while the **~188 Category-G permanent IRIs** (→ WG curated pass) remain **not emitted** — the pipeline mints zero IRIs the WG has not yet authorised. *(E and D were emitted 2026-05-30 — see the Emission update above; at original authoring all three were held.)*
* Bad, because the descriptive layer is now **partially emitted**: the per-form profiles stay *thin* and G3 reports coverage gaps until the walk + profile enumeration land (intentional — gated on WG ratification + councils R1/R4).
* Neutral, because the build is **uncommitted** and `proposed`; it advances no published artefact until the WG ratifies and Henrik commits (deploys via CI only).

### Confirmation

Compliance is verified by:

- `cd tools/opda-gen && PYTHONPATH=src python -m pytest -q` — **243 pass / 1 xfail** (216 at original authoring; +27 from the S025 G1 fix and the E/D emission; the xfail is G3's pre-walk coverage gap, by design).
- `python -m opda_gen.cli ci-byte-identity` / `ci-three-graph` / `ci-profile-contract` — **all PASS** after the single re-pin.
- `python -m opda_gen.cli ci-descriptive-roundtrip` — reports current coverage (gaps expected until the walk lands; flips to PASS when ADR-0029 profiles enumerate per-form leaves).
- `python -m opda_gen.cli categorise-leaves` — regenerates the counted report; the G1 unit test asserts `priceInformation.price`→G and `fixturesAndFittings.*.price`→D by rule.
- **Boundary check (review):** `grep` confirms the **~188 Category-G per-leaf property IRIs** are **absent** from the emitted TTL (reserved for the WG curated pass). `opda:RiskAssessment` and `opda:inclusionStatus` are **now present** — emitted 2026-05-30 after their councils discharged (R1 → ODR-0008d, R4 confirmed); the boundary now holds at Category G alone.

## More Information

- **Realises**: [ODR-0022 — Descriptive-Layer Import Strategy & Property Categorisation](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) (§Rules.1 taxonomy, §Rules.2 gates G1–G3, §Rules.3 salience, §Rules.5 residue, §Rules.6 anti-patterns) and its Council [session-023](../ontology/odr/council/session-023-descriptive-layer-import-strategy.md).
- **Held work, routed to council/WG**: [ODR-0023 — Descriptive-Layer Follow-On Council Roadmap](../ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) (R1 Authority-Retrieved Artefacts incl. `RiskAssessment`; R4 fixtures inclusion-Mode) — the engineering boundary holds in this ADR mirror that roadmap's reservations.
- **Sibling emission ADRs**: [ADR-0028](./ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) (the re-scoped walk — Category-G target this pipeline feeds), [ADR-0029](./ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) (the overlay profiles whose per-form leaf enumeration discharges G3).
- **Generator spec**: [ADR-0007 — Ontology generator specification](./ADR-0007-ontology-generator-specification.md) (the deterministic-emission + byte-identity discipline this subsystem extends).
- **Realizing modelling records**: [ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md) (§Q3a sourcing, §Q5a datatype-vs-SKOS, §Q6a flat-default), [ODR-0011](../ontology/odr/ODR-0011-enumeration-vocabularies.md) (the SKOS-scheme pattern the C/D emitters follow).
- **Artefacts**: `tools/opda-gen/src/opda_gen/inputs/leaf_categoriser.py`, `ci/descriptive_roundtrip_test.py`, `emitters/{modules/descriptive.py,vocabularies.py}`, `term_sourcing.py`; report `source/00-deliverables/semantic-models/descriptive-category-binning.json`.
