# Council Session 049 — Single canonical UFO typing axis (Full Council)

- **Date:** 2026-06-17
- **Records:** → ADR-0050. Verdict matches prior art hm ODR-0100.
- **Queen:** Giancarlo Guizzardi (UFO author — conceptual modelling, identity & rigidity)
- **Devil's Advocate:** Ian Davis (publish-first / scope-discipline / YAGNI — "a corpus-wide re-typing for a CI gate nobody's blocked on is over-engineering")
- **Panel:** Nicola Guarino (formal IC / rigidity — the single-axis decidability case); Dean Allemang (pragmatic / minimum-model / reuse-vs-mint)
- **Voices:** 4 (Queen Guizzardi concurring) across 3 teammates (davis, guarino, allemang-b).
- **`consensus-mode`:** `agent-fan-out` (Agent Teams cross-talk via SendMessage, shared team `council-048`; working files mirrored)
- **Format:** Full Council (~3 runs)
- **Input:** ADR-0050; the rework handover (Part C5 / E3); session-040/041/042 (the foundational-ontology + gUFO + OntoClean precedents); ADR-0034/0045/0046. Working files: `working/session-049/{davis,guarino,allemang-b}.md`.

## Context

The proposition asked: type every class on **one canonical UFO ontological-type axis corpus-wide** to make OntoClean rigidity decidable and "unlock an anti-rigid-subsumption CI gate" — vs keep the gated/partial typing. The council found the headline **stale** and its expensive demand **wrong**, and converged on a smaller, correct disposition matching hm ODR-0100.

## Question 1 — Adopt a single canonical UFO typing axis corpus-wide?

**REVISE 4–0 — adopt the single-axis INVARIANT; REJECT corpus-wide rigidity-vector re-typing.**

Two stale premises rejected: (i) the anti-rigid-subsumption gate "to unlock" **already ships green** (ADR-0046 checks 8/9, TBox-only, verified `three_graph_test.py:348`/`:417`); (ii) the single category axis (`opda:ufoCategory`, `owl:AnnotationProperty`, closed `UFOCategoryScheme`) **already exists on 39/40 classes** — only `opda:SpecialCategoryScheme` (a `skos:ConceptScheme`) lacks it, and correctly so (scope the invariant to *first-order universals*; scheme/meta artefacts exempt).

**Formal core (Guarino):** rigidity is a meta-property `Type → {+R, −R, ~R, non-R}` that must denote a **function**; two unconstrained parallel typing axes make it a *relation*, and the SHACL gate's `−R ⋣ +R` check becomes **ill-typed** on contradictory inputs — a failure of **checker totality** *inside OPDA's own gate*, distinct from reasoner decidability (which OPDA correctly opted out of). The single-axis rule keeps the gate's function total for class N+1. **Davis (DA)** conceded the formal core but bounded it: checker-totality proves the single-*source* invariant + a consistency gate, NOT *coverage* — corpus-wide population does nothing to prevent a future second axis, and the lattice is flat by ODR-0027 (only 5 intra-`opda:` subsumption edges, all already tagged). **Allemang:** corpus-wide rigidity vectors are the session-042-rejected "all-40" over-modelling — ~31 unconsumed axioms (ODR-0101 "a latent liability, not a free asset"); and ±R coercion onto non-sortal categories (Information Object, Quality, Collective) would misstate their nature.

**Adopt (atomic — ships green or not at all):** (1) state the invariant (`ufoCategory` canonical; `ontoCleanRigidity`/`Identity`/`Dependence` a *derived view*, never a parallel assertion); (2) axis-consistency meta-shape over the 8 rigidity-tagged classes; (3) edge-targeted growth-frontier guard (fails CI when an intra-`opda:` subClassOf edge has an endpoint lacking a rigidity projection).

## Question 2 — Mechanism + scope

**REVISE 4–0 — reuse the existing `ufoCategory`/`UFOCategoryScheme` mechanism (do NOT mint a parallel scheme); gated/derivation-driven scope, not a flag-day re-type.** The `gufo:` `rdf:type` markers (ADR-0034) stay a derived/aligned view via `skos:closeMatch`, never a competing second axis. **Recommended (not a soundness precondition):** automate `g(ufoCategory)` to replace the hand-table (below).

**VERIFIED BUG (Allemang's find, Guarino + Davis confirmed, Queen re-verified):** `_ONTOCLEAN_TAGS` (`tools/opda-gen/src/opda_gen/emitters/ufo_categories.py:298-315`) is a **hand-maintained 8-row dict** keyed by class local-name; the `_RIGIDITY_COMMENT`/`_IDENTITY_COMMENT` (`:323`/`:334`) **claim** *"Derived from each type's `opda:ufoCategory` signature"* but **nothing computes it**. The 8 values are correct today (gate green) — so the docstring is true in *extension*, false in *mechanism*: a latent session-047-class defect that bites when a sortal subkind edge is added through an untyped middle class. **Fix:** the edge-targeted guard is REQUIRED for soundness; automating `g(ufoCategory)` (the 9 `UFOCategoryScheme` signatures already hold the table as data) is RECOMMENDED to stop the docstring lying.

## Synthesis (Queen — Guizzardi)

The proposition's gate already ships green over a partial axis, and its one expensive demand (corpus-wide rigidity re-typing) fails the minimum-model rule session-042 settled. What survives is the genuinely-load-bearing core: **single-valued ontological typing is the formal precondition for decidable rigidity** (Guarino's checker-totality argument) — so ratify `ufoCategory` as the single canonical axis (already corpus-wide on every first-order universal), make the OntoClean projection a real *derived function* of it (today a hand-table falsely documented as derived), and enforce it with an atomic consistency + edge-targeted gate. This is "derivation-complete, not assertion-blanket" — the opposite of the corpus-wide re-typing the headline demanded, and it matches hm ODR-0100. Routed to ADR-0050.

## Tally appendix

| Voice | Q1 | Q2 |
|---|---|---|
| Guarino | REVISE/FOR (invariant) | REVISE/FOR (reuse) |
| Allemang | REVISE/FOR (invariant) | REVISE/FOR (reuse) |
| Davis (DA) | WITHDRAW¹ | WITHDRAW¹ |
| **Tally** | **REVISE 4–0** | **REVISE 4–0** |

¹ Queen Guizzardi concurring. Davis WITHDREW the bare-"keep partial" push to the converged REVISE; corpus-wide rigidity-vector population REJECTED unanimously.

### DA scorecard (Davis)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **WITHDRAW** (to the converged REVISE) | gate already green; checker-totality risk is *latent* (rigidity already derived from one axis); cure is the cheap consistency gate, not the 31-vector re-type |
| Q2 | **WITHDRAW** | reuse-not-mint; gated/derivation-driven scope |

**Held dissent (non-blocking):** the rigidity projection stays **edge-participant-scoped** — never authored on a class in no intra-`opda:` subsumption edge; ships **green-or-nothing**. **Re-open trigger:** a rigidity vector authored on an edgeless class (symmetry-for-completeness), OR the rule shipped as ODR prose without a consuming gate → flat REJECT.

### Per-question count

Q1 4–0 (REVISE) · Q2 4–0 (REVISE). Unanimous; corpus-wide re-typing (option A) lost 0–4.

## Discussion transcript

Full deliberation preserved in `docs/ontology/odr/council/working/session-049/{davis,guarino,allemang-b}.md` (committed, not deleted). Key exchange: Guarino's `CreditRiskAssessment ⊐ RiskAssessment ⊐ AssessorRole` growth-frontier counterexample → Davis's edge-targeted-gate bounding → Allemang's emitter hand-table find (the cure), converging the three on the derivation-complete REVISE.
