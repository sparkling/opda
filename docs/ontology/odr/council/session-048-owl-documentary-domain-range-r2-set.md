# Council Session 048 — OWL-as-documentary-signal: domain/range form + the R2-excluded set (Full Council)

> **Supersession note.** Q1's verdict (`owl:unionOf`, 3–1) is **SUPERSEDED by [session-050](./session-050-adopt-semantic-modelling-owl-coverage.md) Q1** (the directing-authority decision to adopt semantic-modelling's coverage → repeated-`rdfs:domain` "any-of"). **Q2 and Q3 SURVIVE and were re-affirmed by session-050.** This record stands as the deliberation that produced the Q2/Q3 doctrine and surfaced the pivotal Hendler withdrawal.

- **Date:** 2026-06-17
- **Records:** → ADR-0049. Supersedes nothing; superseded on Q1 by session-050.
- **Queen:** Elisa Kendall (FIBO — author OWL for documentation + SHACL for validation)
- **Devil's Advocate:** Kurt Cagle (SHACL-first — "author documentary OWL you never reason over is redundant ceremony; the signal + the constraint both live better in SHACL")
- **Panel:** Jim Hendler (OWL formal semantics — the "everything-becomes-a-Person" premise under correction); Dean Allemang (pragmatic RDF / simplicity); Fabien Gandon (standards-conformance / OWL adherence)
- **Voices:** 5 (Queen Kendall concurring) across 4 teammates (cagle, hendler, allemang, gandon).
- **`consensus-mode`:** `agent-fan-out` (Agent Teams cross-talk via SendMessage, team `council-048`; working files mirrored)
- **Format:** Full Council (~4 runs)
- **Input:** ADR-0049; the rework handover; session-047 (the precedent re-opened); ODR-0025/0026/0029. Working files: `working/session-048/{cagle,hendler,allemang-a,gandon}.md`.

## Context

ADR-0049's domain/range fix raised three questions about authoring OWL as documentary AI-signal: the *form* for disjoint domains/ranges (Q1), and how far to extend authoring across the R2-excluded set — property characteristics (Q2) and disjointness (Q3). The panel adopted, as governing discipline, **the per-construct test: author an R2-set construct as documentary signal only where its published W3C semantics AGREE with OPDA's enforced behaviour** ("engineering-act = ontological-act"), gated by OPDA's session-035 rule (drop the axiom where a safe evaluable substitute carries the signal).

## Question 1 — Disjunction form (SUPERSEDED by session-050)

**(a) repeated `rdfs:domain` "any-of" dead 0–4; (b) `owl:unionOf` 3–1.**

**Hendler / Gandon / Allemang:** (a) is unsound — multiple `rdfs:domain` is the standards **conjunction** (RDFS 1.1 §3.2 "instances of ALL the classes"; verified against the live REC), the negation of the disjunctive intent, likely unsatisfiable; a documentary axiom meaning the opposite of intent is worse than silence. (b) `owl:unionOf` is the standards-correct union, justified because ADR-0049's external-DL-legibility driver is ruled in-scope (ODR-0026 §R2). **Cagle (DA):** REJECT (b) — it would be the corpus's first boolean class constructor; prefer (c) SHACL-only / omit-now. **Allemang** moved opening-(a) → (b) on the RDFS §3.2 point (his own SWWO Ch.7 the citation against himself).

**SUPERSEDED:** session-050 (on the hm-coverage adoption) chose hm ODR-0014's repeated-`rdfs:domain` "any-of" + a CI-gated documentation convention — boolean-constructor-free, cross-project-consistent. The "any-of" reading is disarmed by ADR-0035 (the closure never evaluates domain/range), which this panel did not weigh because hm ODR-0014 was not in its brief.

**Pivotal (carried forward):** Hendler **withdrew the "everything-becomes-a-Person" premise** (the session-047 error) as applied to OPDA — it assumed RDFS `rdfs2`/`rdfs3` are live; they are provably excluded (ODR-0025 §R1/R2; ADR-0035 zero-triple proof). "Authored-but-never-evaluated domain/range is sound by construction." This is the doctrinal foundation for the whole rework.

## Question 2 — Author Functional/InverseFunctional as documentary signal?

**AGAINST authoring FP/IFP — 4–0.** IFP out entirely; FP no general documentary layer (SHACL `sh:maxCount 1` is the home; a hand-curated `owl:FunctionalProperty` on genuine world-fact singletons admissible only if the modal marker is wanted). **Decisive:** IFP's entire model-theoretic content (OWL 2 §2.3.5) is `owl:sameAs` on a shared value — the merge OPDA bans (ODR-0005 §R5, ODR-0017 §R6, ODR-0025 §R2); even a *true* IFP publishes "shared key ⇒ same individual," which OPDA's bounded-context identity holds false. **Reason recorded (Hendler/Gandon, verbatim):** NOT "unsound for OPDA" (inert under the closure — that would re-commit the session-047 reflex), but the **two-prong session-035 test** — (i) redundant with a complete safe substitute (`sh:maxCount 1` / `dash:uniqueValueForClass`, verified ODR-0026 §R3, 8–0–0), AND (ii) a published assertion OPDA holds false. Hendler moved opening-FOR-scoped → AGAINST. `dash:uniqueValueForClass` flags the collision instead of fusing.

## Question 3 — Author `owl:disjointWith` under a scoping rule?

**FOR-scoped 3–1** (Cagle conditional-WITHDRAW → effectively 4–0 admissible, no held dissent). Author pairwise `owl:disjointWith` + SHACL `sh:not`/`sh:xone` dual, **rigid Kinds only, NEVER anti-rigid Roles** (Seller/Buyer exclusivity is transaction-scoped SHACL, session-047 Q4), **pairwise not `owl:AllDisjointClasses`** (no rule consumes the list). `owl:disjointWith`'s standard meaning *is* the ADR-0035 negative consistency gate OPDA already runs — published semantics agree with enforcement (passes the engineering-act test where IFP fails it); authoring *arms* the currently-vacuous gate. **Cagle (DA)** conceded the hazard overstatement (ADR-0035 gate is a local pairwise COUNT, not global ex-falso), the engineering-act test, and the named-union-class capability; held only a doctrinal-home / cost-discipline residual (non-blocking) — retired in session-050.

## Synthesis (Queen — Kendall)

The proposition's "authoring documentary OWL is free" framing did not survive intact, and that is the point: **the R2 set is not one bucket — decide per-construct on whether published semantics agree with OPDA's behaviour.** Domain/range agrees (authored — form deferred to session-050); `owl:disjointWith` agrees (authored, scoped); FP/IFP *contradict* OPDA's identity doctrine (not authored — SHACL is the home). Hendler's withdrawal of the "everything-becomes-a-Person" premise is the foundation that makes documentary domain/range sound. Routed to ADR-0049; Q1 form re-opened and settled by session-050.

## Tally appendix

| Voice | Q1 | Q2 | Q3 |
|---|---|---|---|
| Hendler | FOR (b) | AGAINST FP/IFP | FOR-scoped |
| Allemang | FOR (b) | AGAINST FP/IFP | FOR-scoped |
| Gandon | FOR (b) | AGAINST FP/IFP | FOR-scoped |
| Cagle (DA) | AGAINST (b)¹ | AGAINST FP/IFP | conditional-WITHDRAW² |
| **Panel tally** | **(a) 0–4; (b) 3–1** | **0–4 author / 4–0 carve-out** | **3–1 FOR-scoped** |

¹ prefers (c) omit-now; (a) dead unanimously. ² cost-discipline/doctrinal-home residual, non-blocking; retired in session-050. Queen Kendall concurring on Q2/Q3; Q1 superseded.

### DA scorecard (Cagle)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **PARTIAL-WITHDRAW + HOLD** | dropped the (a)-comment fallback on Allemang's shibboleth catch; HOLD omit-now over (b) → **moot under session-050** (no `owl:unionOf` authored) |
| Q2 | **WITHDRAW into convergence** | his opening AGAINST became the panel position (Hendler flipped FOR→AGAINST) |
| Q3 | **conditional-WITHDRAW** | conceded hazard-overstatement + engineering-act test + named-union-class capability; residual doctrinal-home/cost-discipline → **retired in session-050** (verified gate consumes the axiom) |

**No held-as-live dissent** after session-050 reconciliation.

### Per-question count

Q1 superseded · Q2 4–0 (carve-out) · Q3 3–1 (→ effectively 4–0 admissible).

## Discussion transcript

Full deliberation (openings → verbatim SendMessage exchanges → finals) preserved in `docs/ontology/odr/council/working/session-048/{cagle,hendler,allemang-a,gandon}.md` (committed, not deleted).
