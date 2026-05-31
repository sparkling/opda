---
status: accepted
date: 2026-05-31
tags: [descriptive-layer, category-g, ci-gates, opda-gen]
supersedes: []
depends-on: [ODR-0008, ODR-0022, ODR-0024]
implements: [ADR-0030, ADR-0031]
---

# Curated Category-G Walk — Emission, Coverage Gate, and ODR-0024 Remediation

## Context and Problem Statement

[ADR-0031](./ADR-0031-category-g-curated-walk-execution-plan.md) planned the curated Category-G walk; [ADR-0030](./ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) is the emission pipeline + gates (G1–G3). Executing the walk surfaced four engineering problems this record settles:

1. **Emission must be emitter-driven, not hand-edited.** The 188 candidate-G leaves are realised as generator code, regenerated to the committed TTLs; `ci-byte-identity` forbids hand-editing.
2. **The walk needed an HONEST progress/completion metric.** The existing G3 `ci-descriptive-roundtrip` gate measures whether the *emitted SHACL profiles* round-trip their form-question leaves — a property of the BASPI5 overlay (the one non-thin profile), **not** candidate-G TBox emission coverage. Treating it as the walk-completion test conflated the two and over-claimed "the curated walk has landed" while only 7/188 leaves were emitted.
3. **A cross-module duplicate class slipped past CI.** `opda:riskIndicator` was once declared in two module TTLs with conflicting `rdfs:domain`, passing `ci-byte-identity` + `ci-three-graph` undetected.
4. **Council Session 028 ([ODR-0024](../ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md)) returned corrections** (monetary false-collapse, an unwarranted facility-class citation, a categoriser under-count) that must be reflected in the emitted model, or the model and the ratified ODR disagree.

## Decision Drivers

* Byte-deterministic, emitter-driven emission (no hand-edited TTL).
* An **un-gameable** progress metric — the over-claim proved a profile-round-trip gate is a weak proxy for TBox coverage.
* No silent omissions and no false coverage (the ADR-0031 totality assertion; ODR-0022 §5 residue discipline).
* The council-ratified modelling rules (ODR-0024) must be the emitted model.
* Every `opda:` term declared in exactly one module TTL.

## Considered Options

* **A — emitter-driven walk + a dedicated candidate-G coverage gate + a dup-declaration gate + apply the ODR-0024 remediation** (chosen).
* **B — hand-edit the module TTLs directly** — rejected: `ci-byte-identity` forbids it and it loses deterministic regeneration.
* **C — treat the G3 `ci-descriptive-roundtrip` gate as the walk-completion test** — rejected: it measures one emitted SHACL profile (BASPI5), not candidate-G TBox coverage; conflating them over-claimed completion at 7/188.
* **D — defer the ODR-0024 remediation** — rejected: leaves the emitted model and the ratified ODR in contradiction (the monetary false-collapse, the facility classes minted under a citation that does not license them).

## Decision Outcome

Chosen "A", because it makes walk progress an objective number the model is checked against, closes the cross-module-duplicate hole, and keeps the emitted model in step with the council-ratified rules — at the cost of one local-only gate and a one-time re-open of part of the committed walk.

The walk is realised as **table-driven emitter code per semantic family** (flat datatype/object properties per ODR-0024 R1), regenerated via `opda-gen emit`. Two CI gates are added to the ADR-0030 pipeline:

* **`ci-dup-declaration`** — fails if any `opda:` term is the subject of a defining `rdf:type` in more than one module TTL (the riskIndicator regression). Wired into the GitHub workflow.
* **`ci-category-g-coverage`** — reports `X/N` candidate-G leaves emitted-or-collapsed (N = the categoriser's candidate-G count, 239 after R5; minted = local-name match; collapsed = registered in `inputs/category_g_curation` with an emitted target; uncovered = reported by name). Derives the candidate-G set from the categoriser (reproducible); **local-only** — it needs the gitignored data dictionary, so it reports UNAVAILABLE on a CI checkout. `--strict` gates at totality.

The **ODR-0024 remediation** is applied: R3 (withdraw the 18 monetary collapses → defer; honest coverage 179/239 after R5's re-count), R4 (re-warrant `opda:NearbyFacility` off §Q4a onto the UFO Substance-Kind basis, collapse the subkinds into the genus, `schoolType`→SKOS), R5 (structural C-vs-G categoriser rule + re-run + regression test — a report-scope fix, no byte-identity re-pin), R6 (mint ~5 SKOS schemes from live enums), R7 (`opda:AttachedDocument`), R8 (`titleNumber`→`RegisteredTitle`), R11 (SHACL on `mediaUrl`/`url` + `hasSubAssessment` guard).

### Consequences

* Good, because walk progress is an honest, un-gameable number (179/239 after the R5 re-count), and the model is emitter-driven + byte-deterministic.
* Good, because `ci-dup-declaration` closes the cross-module-duplicate class that byte-identity + three-graph missed.
* Good, because the coverage gate distinguishes a report-scope miscount (the categoriser under-count) from an emitted-artefact defect, so a count fix does not force re-pinning correct emissions.
* Bad, because `ci-category-g-coverage` is local-only (gitignored data dictionary) — a dev-time tracker, not enforceable in GitHub CI.
* Bad, because the ODR-0024 remediation re-opens part of the just-committed walk (monetary defer, facility re-warrant) — a one-time cost paid for council-correctness.
* Neutral, because the monetary leaves (pending `opda:MonetaryAmount`) and the categoriser-surfaced additional G leaves are routed to follow-on chunks, not emitted here.

### Confirmation

Six gates gate the walk and run in `pytest`: `ci-byte-identity`, `ci-three-graph`, `ci-profile-contract`, `ci-dup-declaration`, `ci-descriptive-roundtrip` (BASPI5 profile round-trip), and `ci-category-g-coverage` (candidate-G TBox coverage; `--strict` at totality). Emission regenerates via `opda-gen emit`; a hand-edited TTL fails `ci-byte-identity`. Coverage settling at the honest 179/239 (the R3 de-collapse + R5's candidate-G re-count 188→239) is the expected post-remediation state, not a regression.

## Rules

* **The two coverage gates are orthogonal and neither substitutes for the other.** `ci-descriptive-roundtrip` = SHACL profile round-trip (a property of the emitted profiles); `ci-category-g-coverage` = candidate-G TBox emission coverage. Conflating them was the over-claim this ADR exists to prevent.
* **Coverage definition:** a candidate-G leaf is covered iff *minted* (its local name is declared in a module TTL) OR *collapsed* (recorded in `inputs/category_g_curation.COLLAPSED` with an emitted target). A collapse whose target is not emitted is a broken disposition the gate flags. Uncovered leaves are reported by name — nothing silently omitted.
* **Emitter discipline:** no hand-edited TTL; every minted term declared in exactly one module + listed in that module's catalogue tuple.

## More Information

* **Modelling rules realised (depends-on):** [ODR-0024](../ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md) — the Council Session 028 dispositions this engineering applies; [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) — the Category-G strategy + C/D/G boundary; [ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md) — §Q4a/§Q5a/§Q6a binding rules.
* **Realises (implements):** [ADR-0030](./ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) — the emission pipeline these two gates extend; [ADR-0031](./ADR-0031-category-g-curated-walk-execution-plan.md) — the walk execution plan.
* **Deliberation:** [Council session-028](../ontology/odr/council/session-028-category-g-walk-review.md) — the per-question verdicts + DA scorecard behind the remediation.
