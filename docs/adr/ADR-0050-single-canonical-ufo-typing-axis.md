---
status: proposed
date: 2026-06-17
tags: [ontology, ufo, gufo, ontoclean, modelling]
supersedes: []
depends-on: [ADR-0034, ADR-0045, ADR-0046]
implements: []
---

# Single canonical UFO typing axis

> **Status note.** Draft, pending ratification (directing authority = acting ratifier). Council session-049 deliberated this; its verdict — adopt the single-axis *invariant*, NOT a corpus-wide re-typing — matches hm ODR-0100 and stands.

## Context and Problem Statement

OPDA types classes ontologically in a partial, mixed way: gUFO typing gated to a few descriptive Quality leaves (ADR-0034/0045); Roles/Relators via `opda:Role`/`RoleMixin`/`Relator` meta-classes; OntoClean meta-property markup (ADR-0046). The proposition asked: adopt a single canonical UFO typing axis **corpus-wide** to make OntoClean rigidity decidable and "unlock an anti-rigid-subsumption CI gate" — vs keep the gated/partial typing.

Council session-049 found the proposition's **headline was stale and its expensive demand wrong**, and converged (4–0) on a smaller, correct disposition. This matches prior art **hm ODR-0100 (single canonical UFO typing axis)** + ODR-0092 (layer/stereotype SKOS schemes).

## Decision Drivers

* Decidable OntoClean rigidity — the precondition for any anti-rigid-subsumption gate (checker totality, not reasoner decidability).
* Single source of truth — one axis for a class's ontological nature; any second axis a derived view.
* Cost / YAGNI — corpus-wide re-typing manufactures unconsumed axioms (ODR-0101 "a latent liability, not a free asset").
* Honesty — keep the upper-ontology anchor inert (no entailment, no unmet conformance claim).

## Considered Options

* **(A) Corpus-wide rigidity-vector re-typing of all ~41 classes** — REJECTED 4–0 (manufactures ~31 unconsumed axioms; coerces ±R onto non-sortal categories).
* **(B) Keep gated/partial typing, do nothing** — insufficient (leaves the single-valued-ness invariant unstated/unenforced + a real emitter defect, below).
* **(C) Adopt the single-axis *invariant* + gates (hm ODR-0100)** — **CHOSEN.** State the invariant, enforce it, fix the derivation; do NOT re-type.

## Decision Outcome

**REVISE → adopt the single-axis *invariant*, not corpus-wide re-typing** (Council session-049, 4–0; matches hm ODR-0100). Two stale premises were rejected: (i) the anti-rigid-subsumption gate "to unlock" **already ships green** (ADR-0046 checks 8/9, TBox-only); (ii) the single category axis (`opda:ufoCategory`, `owl:AnnotationProperty`, closed `UFOCategoryScheme`) **already exists on 39/40 classes** (`opda:SpecialCategoryScheme`, a `skos:ConceptScheme`, correctly exempt — scope the invariant to *first-order universals*, not "endurants").

**Adopt (all atomic — ships green or not at all):**
1. **State the invariant** — `ufoCategory` is the single canonical typing axis (scoped to first-order universals; scheme/meta artefacts exempt); `ontoCleanRigidity`/`Identity`/`Dependence` are a *derived view* (a function of `ufoCategory`), never an independent assertion; the `gufo:` `rdf:type` alignment (ADR-0034) is a derived view via `skos:closeMatch`, not a second axis.
2. **Axis-consistency meta-shape** over the 8 rigidity-tagged classes — fails CI if a class's rigidity/identity contradicts its `ufoCategory` signature.
3. **Edge-targeted growth-frontier guard** — fails CI when an intra-`opda:` `rdfs:subClassOf` edge has an endpoint lacking a rigidity projection (catches the silent-false-green at edge-authoring time, without pre-typing edgeless classes).

**Recommended (not a soundness precondition):** automate `g(ufoCategory)` to replace the hand-table (fixes the lying docstring; makes single-valued-ness hold by construction). **Reuse `ufoCategory`/`UFOCategoryScheme`; do NOT mint a parallel scheme.**

**Decline:** corpus-wide rigidity-vector population (~31 unread tags); any minted parallel scheme; ±R coercion on non-sortal categories (Information Object, Quality, Quality Value, Collective).

### Consequences

* Good — makes single-valued ontological typing an enforced, prospective invariant (sound for class N+1), at near-zero cost; matches hm ODR-0100.
* Good — surfaces and fixes a real generator defect (below).
* Neutral — the ~31 untyped-for-rigidity classes stay untyped (by design).
* Bad — adds 2–3 CI gates + an emitter change to maintain.

### Confirmation

* The axis-consistency + edge-targeted meta-shapes ship green, atomically, over the tagged set; full `make ci`; byte-identity.

## Council sessions and findings

- **session-049** (Council B — Queen Guizzardi, DA Davis, panel Guarino + Allemang; `working/session-049/`): REVISE 4–0 — adopt the invariant + gates, reject corpus-wide re-typing. The formal core (Guarino): rigidity must denote a *function* `Type → {+R,−R,~R,non-R}`; two unconstrained parallel axes make it a *relation* → the SHACL gate's `−R⋣+R` check becomes ill-typed (checker totality, inside OPDA's gate — not reasoner decidability).
- **VERIFIED BUG (Allemang's find, Guarino+Davis confirmed, Queen re-verified):** `_ONTOCLEAN_TAGS` (`tools/opda-gen/src/opda_gen/emitters/ufo_categories.py:298-315`) is a **hand-maintained 8-row dict** keyed by class local-name; the `_RIGIDITY_COMMENT`/`_IDENTITY_COMMENT` (`:323`/`:334`) **claim** *"Derived from each type's `opda:ufoCategory` signature"* but **nothing computes it**. The 8 values are correct *today* (gate green) — so the docstring is true in extension, false in mechanism: a latent session-047-class defect that bites when a sortal subkind edge is added through an untyped middle class. **Fix:** automate `g(ufoCategory)` (the 9 `UFOCategoryScheme` signatures already hold the table as data) — REQUIRED is the edge-targeted guard; RECOMMENDED is the automation.
- **Empirical anchors (verified at file:line):** ADR-0046 checks 8/9 green (`three_graph_test.py:348`/`:417`); `ufoCategory` on 39/40 classes; `ontoCleanRigidity` on exactly 8 domain classes; only 5 intra-`opda:` `rdfs:subClassOf` edges (lattice flat by ODR-0027; all other supers external).
- **Held dissent — Davis (DA), non-blocking:** the rigidity projection stays **edge-participant-scoped** (never on a class in no intra-`opda:` subsumption edge); ships **green-or-nothing**. Re-open trigger: a rigidity vector authored on an edgeless class, OR the rule shipped as ODR prose without a consuming gate → flat REJECT.

## Outstanding work and open tasks

**ALL DONE (2026-06-17, commits `4589bb3` + the records): implemented, verified, full `make ci` green.** Items 1–7 below all landed — the invariant is stated (this ADR §Decision Outcome); `g(ufoCategory)` replaces the hand-table (values derived, docstring no longer lies; byte-identity held — the emitted 8 tags unchanged, proven by the `.py`-only commit); the axis-consistency check (three-graph check 10) + edge-targeted growth-frontier guard (check 11) ship green with positive controls; `SpecialCategoryScheme` exemption recorded; session-049 record + `adoption.md` row written. The corpus-wide rigidity-vector population stays REJECTED (Davis's edge-participant scope held).

1. **State the single-axis invariant** (scoped to first-order universals) in the doctrine ODR / ADR.
2. **Add the axis-consistency meta-shape** over the 8 tagged classes.
3. **Add the edge-targeted growth-frontier guard** (required for soundness).
4. **Automate `g(ufoCategory)`** in the emitter — replace the `_ONTOCLEAN_TAGS` hand-table (recommended; fixes the lying docstring).
5. Confirm `SpecialCategoryScheme` exemption is recorded (first-order-universals scoping).
6. Proof obligations: gates ship green atomically; byte-identity; full `make ci`.
7. Write the session-049 record + `adoption.md` track-record row.

## More Information

* Working brief: `docs/HANDOVER-2026-06-17-entailment-doctrine-domain-range-as-signal-relationship-layer-rework.md` (Part C5; Part E decision 3).
* Related: ADR-0034 (gUFO typing), ADR-0045 (ufocategory/gUFO scheme), ADR-0046 (OntoClean meta-property markup); ODR-0027 (classification-over-inheritance).
* Prior art adopted (cite here only; strip from normative ODR text): `~/source/hm/semantic-modelling` ODR-0100 (single canonical UFO typing axis), ODR-0092 (layer/stereotype schemes), ODR-0101 (BFO backbone kept inert).

## Amendments

* 2026-06-17 (a) — created in Draft; decision OPEN pending Council B.
* 2026-06-17 (b) — Council B (session-049): REVISE 4–0 → adopt the single-axis invariant + 2 gates + the emitter-derivation fix; REJECT corpus-wide re-typing; matches hm ODR-0100. Davis held dissent (edge-scope, non-blocking) recorded.
