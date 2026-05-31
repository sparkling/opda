---
status: proposed
date: 2026-05-30
tags: [descriptive-layer, category-g, curated-walk, execution-plan, g11-reconciliation]
supersedes: []
depends-on: [ODR-0022, ODR-0008, ODR-0008d, ODR-0023, ADR-0005, ADR-0028, ADR-0030]
implements: []
---

# Category-G Curated Walk — Execution Plan and G11 Reconciliation

## Context and Problem Statement

[ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) re-scoped the PDTF descriptive-layer import from a 1:1 ~935-leaf walk to category treatments (A–G); only **Category G** (~188 candidate names) plus the regulatory-salience allow-list receives per-leaf curation. That curation — "the curated G walk" — is repeatedly deferred to the WG, but no record says *how it executes*. Three concrete gaps block it:

1. **No current execution plan.** [ADR-0028](./ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) did spell out a 6-step walk (datatype emission, §Q4a class-promotion, term-grain `requires`, `definedInContext` home-pass, reconciliation register, determinism) — but it was written for the *old ~935-leaf flat* walk and re-scoped by ODR-0022, never rewritten for the bounded Category-G curation. The ontology programme retired 2026-05-28 ([ADR-0005](./ADR-0005-deferred-work-register.md)); subsequent work lands as fresh ADRs, so this is a **successor, not an amendment**.
2. **Part of the walk is silently already done.** ADR-0005 item **G11** (closed 2026-05-28) emitted ~17 §Q5a Quale/boolean leaves as **flat datatype properties** on `opda:Property`/`opda:LegalEstate` (`builtForm`, `currentEnergyRating`, `councilTaxBand`, `ownershipType`, `centralHeatingFuelType`, `heatingType`, `propertyType`, …). These **overlap the candidate-G set**, so the 188 is not a clean to-do list, and the overlap is unreconciled — the `riskIndicator` case already surfaced as a conflicting-domain duplicate (flat `opda:Property` home vs ODR-0008d `opda:RiskAssessment` home), fixed 2026-05-30 by re-homing it onto `opda:RiskAssessment`.
3. **The walk is R2's trigger, unsequenced.** [ODR-0023](../ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) **R2** (the UFO-axis sub-module split) is gated *on the curated G walk* — only a UFO-typed leaf-set makes the Quality/Mode/Legal-estate axes countable — but nothing sequences walk → R2.

## Decision Drivers

* ODR-0022 §Rules (curate-per-leaf, one dereferenceable IRI per concept; reserve WG judgment for Category G + salience).
* ODR-0008 **§Q5a** (datatype-vs-SKOS per-leaf binding), **§Q6a** (flat-default; hierarchy only on a named consumer query), **§Q4a** (class-promotion), **§Q1a** (reconciliation register).
* ODR-0023 **R2** axis framework (qualities / modes / legal-estate), ratified but spawn-gated on this walk.
* ADR-0028's **totality assertion** (every annotated leaf emitted-or-promoted; zero silent omissions) + the **G3 `ci-descriptive-roundtrip`** coverage gate.
* The ADR-0005 §G1 principle: **engineering does not silently reconcile ratified-rules disagreements** — the G11∩ODR-0008d overlap is exactly such a reconciliation, and it routes through the WG.

## Considered Options

* **Option A — a fresh successor ADR (this) that reconciles, sequences, batches, and gates the curated Category-G walk.** Per-leaf modelling stays the WG's.
* **Option B — amend ADR-0028 in place.** Rejected: ADR-0028 is an accepted record of the retired programme; ODR-0022 explicitly permits "amend ADR-0028 *or author a successor*", and a successor keeps the retired programme's history intact.
* **Option C — leave the walk wholly to the WG with no plan.** Rejected: leaves the G11 overlap unreconciled and the R2 trigger unsequenced; the *process* (reconciliation, sequencing, batching, completion gate) is engineering, separable from the per-leaf modelling judgments.

## Decision Outcome

Chosen option: **Option A.** Five work items; the plan owns *process and sequencing only* — every per-leaf datatype-vs-SKOS / axis / domain / IRI decision remains the WG's (Modelling Sub-Committee), and any ratified-rules reconciliation routes through the WG, not silent engineering.

1. **G11 reconciliation (do first).** Diff `descriptive-category-binning.json` (the 188 candidate-G names) against the ~17 already-emitted G11 §Q5a leaves (`opda-property.ttl` / `opda-agent.ttl`). For each overlap leaf the WG records a disposition: **(a) the G11 flat emission stands** (curation = confirm `rdfs:domain` + add `dct:source` schema-leaf-path (G2) + bind a SKOS range where §Q5a says so), or **(b) re-home** under the R2 axis split. Capture dispositions in the ODR-0008 §Q1a reconciliation register (reuse, do not invent a parallel one). The `riskIndicator` re-home (G11 `opda:Property` → ODR-0008d `opda:RiskAssessment`, 2026-05-30) is the **first register entry and the worked template**. Net remaining ≈ 188 − (overlap that stands).
2. **Per-leaf curation procedure.** For each not-yet-emitted candidate-G leaf, in order: apply §Q5a (datatype property vs SKOS-scheme range), §Q6a (flat — no `rdfs:subPropertyOf` unless a named query forces it), assign the UFO axis (R2: quality / mode / legal-estate), the `rdfs:domain` (`opda:Property` / `opda:LegalEstate` / other), the `opda:` local name, and the `dct:source` schema-leaf-path (G2). Emit via the [ADR-0030](./ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) generator — no hand-edited TTL.
3. **Batching.** Curate in reviewable batches that each round-trip a form: **batch 1 = the G11-overlap §Q5a Quale family** (confirm/re-home — smallest, highest-certainty); subsequent batches by overlay/form (TA6, LPE1, …) so each batch flips a thin profile to enumerated under G3.
4. **R2 sequencing.** The walk produces the UFO-typed partition R2 needs; once batch 1 + a representative form-batch are typed, R2 can judge whether the axis split is "operationally load-bearing" (ODR-0008 §Q2a(a)). Fixed order: walk batches → R2 convenes → (if load-bearing) ODR-0008a/b/c spawn.
5. **Completion gate.** The G3 `ci-descriptive-roundtrip` gate (currently `xfail`) flips to PASS when every form's leaves are enumerated + emitted, satisfying ADR-0028's totality assertion (count(annotated leaves) == count(emitted properties) + count(class promotions); zero silent omissions). The thin-profile `xfail` is the live progress tracker.

### Consequences

* Good, because "deferred to the WG" becomes an executable, batched, gated plan with a falsifiable completion test (G3 + totality).
* Good, because the G11 overlap is reconciled explicitly rather than left as latent conflicting-domain bugs (the `riskIndicator` duplicate was exactly that).
* Good, because walk → R2 sequencing unblocks ODR-0023 R2 deterministically instead of by guess.
* Bad, because the reconciliation may **re-open** some "done" G11 leaves (re-homing) — a one-time cost, paid to remove the silent §Q5a-vs-ODR-0008d divergence.
* Neutral, because the per-leaf judgment stays WG-paced; this plan structures the work, it neither accelerates the modelling decisions nor pre-empts them.

### Confirmation

* The ODR-0008 §Q1a reconciliation register has a disposition for **every** G11∩candidate-G overlap leaf (the `riskIndicator` entry is present as the template).
* `grep` confirms no candidate-G IRI is emitted ahead of its WG disposition (the generator holds Category-G IRIs unminted per ADR-0030 until curated).
* G3 `ci-descriptive-roundtrip` flips `xfail → PASS` at completion; the ADR-0028 flat-default and totality CI continue to hold.

## More Information

* **Strategy it serves:** [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) §Rules.1/§Rules.6 (Category-G curated walk) — in `depends-on:`, not `implements:` (the latter is intra-corpus ADR→ADR only).
* **Per-leaf modelling rules:** [ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md) §Q5a / §Q6a / §Q4a / §Q1a; [ODR-0008d](../ontology/odr/ODR-0008d-authority-retrieved-artefacts.md) (the RiskAssessment home that re-claimed `riskIndicator`).
* **R2 trigger:** [ODR-0023](../ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) R2 (UFO-axis sub-modules, gated on this walk).
* **Generator + predecessor walk:** [ADR-0030](./ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) (the emission subsystem + gates G1–G3); [ADR-0028](./ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) (the re-scoped predecessor whose home-pass / `requires` / totality items this plan carries forward).
* **Already-emitted overlap:** [ADR-0005](./ADR-0005-deferred-work-register.md) §G11 (the ~17 §Q5a leaves emitted 2026-05-28; `riskIndicator` re-homed 2026-05-30).
* **Outcome (2026-05-31):** this walk executed (185/188 candidate-G emitted-or-collapsed) and was reviewed by Council [session-028](../ontology/odr/council/session-028-category-g-walk-review.md), ratified as [ODR-0024](../ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md) (the modelling rules) + [ADR-0032](./ADR-0032-category-g-walk-emission-and-coverage-gate.md) (the engineering + the two CI gates `ci-dup-declaration` / `ci-category-g-coverage`), and remediated to an honest **179/239** coverage. The leftover — the monetary walk, the R5-surfaced follow-on, and the held `opda:Room` leaves — is tracked in [ADR-0005](./ADR-0005-deferred-work-register.md) §G22–G24.
