---
status: proposed
date: 2026-06-17
tags: [ontology, owl, shacl, entailment, modelling]
supersedes: []
depends-on: [ODR-0025, ODR-0026, ODR-0029]
implements: []
---

# OWL axioms as documentary AI-signal — domain/range and the R2-excluded set

> **Status note.** Draft, pending ratification. The directing authority is acting ratifier (operator-ratifies; the OPDA WG→Sub-Committee→AGM chain is not a live gate at this stage). Council session-050 (COMPLETE — 5–0 unanimous, no held-as-live dissent) confirmed the hm-coverage adoption per-construct and resolved the FP/IFP carve-out; folded in below.

## Context and Problem Statement

OPDA's entailment regime (ODR-0025 / ODR-0026 / ODR-0029) runs ONLY a frozen 7-rule RDFS-Plus load-time closure and EXCLUDES `rdfs:domain`/`rdfs:range` and the rest of the "R2 set" (`owl:FunctionalProperty`/`InverseFunctionalProperty`, `owl:equivalentClass`/`equivalentProperty`, `owl:Restriction`/`unionOf`/`intersectionOf`/`complementOf`/cardinality/`oneOf`/`hasKey`) from inference. ODR-0026 §R2 ("model-but-don't-evaluate") authors them as documentation, never entailed.

This doctrine was stated only in fragments (ODR-0025 §R2 / ODR-0026 §R2 / ODR-0027 §R5 / ODR-0029 §R1), and the gap had a concrete cost: Council session-047 (implemented in ADR-0048) re-derived `rdfs:domain`/`range` from STANDARD OWL semantics (the "everything-becomes-a-Person" trap) and stripped documentary domain/range off the relationship-layer object properties (`founds`/`mediates`/`playedBy`/`plays`/`hasAddress`), pinning types in SHACL only — even though the ~750 datatype properties correctly carry both `rdfs:domain`/`range` AND the SHACL dual (ODR-0029 §R3). That is doctrinally wrong under OPDA's own regime, and made the relationship edges invisible to the class-graph model derivation (worked around by a SHACL-derivation hack in `scripts/ontology-model.mjs`).

**Prior art is the source of truth for the coverage.** The sibling project `~/source/hm/semantic-modelling` already defines this OWL coverage (ODR-0014 domain/range; ODR-0030 the permitted/excluded construct table; ODR-0054 property characteristics; ODR-0028b disjointness; ODR-0100 single typing axis). **The directing authority has decided OPDA adopts hm's coverage as its baseline** rather than re-deriving it. This ADR (a) states the positive doctrine once, (b) adopts hm's coverage per-construct, (c) corrects the relationship-layer object properties, (d) records decision-4 (annotation + binding gates).

## Decision Drivers

* Doctrine consistency — the regime already excludes domain/range from inference; authoring is safe; the ~750 datatype properties already do it.
* Reuse prior art — adopt hm's already-defined coverage; do not re-derive (cross-project consistency).
* AI/LLM signal — OWL axioms are machine-legible documentation of modeller intent.
* OWL adherence — author standards-legible axioms even though OPDA never reasons.
* Proof obligation — whatever is authored must NOT change the closure (the ADR-0035 zero-domain/range-triple test).

## Considered Options

**Q1 — disjunction form** (decided: adopt hm):
* **(a) repeated `rdfs:domain` "any-of" + SHACL `sh:or`** — hm ODR-0014's form; boolean-constructor-free; the "any-of" reading is a documented convention (valid because OPDA never evaluates domain/range). **CHOSEN (hm-adopted).**
* (b) `owl:unionOf` + `sh:or` — standards-correct union but a boolean class constructor; hm ODR-0030 *excludes* it. The session-048 panel reached (b); **superseded by the directing-authority decision to adopt hm's coverage.**
* (c) SHACL-only — rejected: loses the documentary/AI signal.

**Q2 — property characteristics** (pending session-050): adopt hm ODR-0054 (author Functional/InverseFunctional as documentary signal) WHOLESALE, vs carve out FP/IFP per OPDA's `owl:sameAs` ban (ODR-0005 §R5 / ODR-0017 §R6) + the session-035 drop-redundant-axiom rule (which session-048 found pulls toward SHACL-only / IFP-out).

**Q3 — disjointness** (adopt hm ODR-0028b): author scoped `owl:disjointWith` + SHACL `sh:not`/`sh:xone`.

**Doctrine** (adopt): hm ODR-0030's permitted/excluded construct table + an excluded-construct CI meta-shape, governed per-construct.

**Decision-4** (accepted): mandate + CI-gate `skos:definition` coverage (every class + property) and `rdfs:isDefinedBy` term-binding, warning-first → violation.

## Decision Outcome

**Positive doctrine (accepted):** OPDA authors OWL/RDFS axioms as documentary, AI-legible signal of modeller intent; they are NEVER entailed. The only inference is the frozen 7-rule RDFS-Plus closure (ODR-0025 §R1). Everything else is authored for documentation + VALIDATED via SHACL, never reasoned. **Per-construct discipline (from session-048, adopted): author an R2-set construct as documentary signal only where its published W3C semantics AGREE with OPDA's enforced behaviour** ("engineering-act = ontological-act"). **Corollary: do not reason about OPDA from standard W3C OWL/RDFS entailment semantics.**

**Q1 — DECIDED (directing authority): adopt hm ODR-0014 — repeated `rdfs:domain` "any-of" for the disjunctions** (`playedBy`/`plays`/`hasParticipant`/`hasAddress`); plain `rdfs:domain`/`range` for single-class object properties; (a) repeated-domain over (b) `owl:unionOf`. This **supersedes the session-048 panel's `owl:unionOf` verdict** (the panel reasoned without hm's ODR-0014/0030 in its brief; the directing authority chose cross-project consistency with hm — boolean-constructor-free corpus). The "any-of" reading is documented in a module header + per-property `rdfs:comment`; SHACL `sh:or` keeps 100% enforcement (ODR-0029 §R3); re-run the ADR-0035 zero-triple test.

**Decision-4 — accepted (ratifier, 2026-06-17):** the `skos:definition` + `rdfs:isDefinedBy` coverage gates, warning-first.

**Q2 — RESOLVED (session-050, 5–0): carve out FP/IFP from the hm adoption.** Do NOT author `owl:InverseFunctionalProperty` (out entirely) or `owl:FunctionalProperty` as a general documentary layer; the home is SHACL `sh:maxCount 1` + `dash:uniqueValueForClass`, scoped **within** each identity-bearing sortal, **never cross-sortal** (a cross-sortal key is IFP in SHACL clothing — it would fire on legitimate UPRN co-reference across the 3 Property Kinds). A narrow hand-curated `owl:FunctionalProperty` on genuine world-fact singletons is admissible only if the modal marker is wanted. **Binding reason (for permanence): (ii) a published IFP asserts the *negation* of ODR-0005's 12-0 bounded-context-identity ruling** — it promotes a contingent identifier (UFO Quality) to a constitutive global identity criterion (an OntoClean rigidity-clash); (i) redundancy-with-the-safe-substitute (session-035) is *corroborating only*. Re-open ONLY if ODR-0005 is overturned. This carve-out is the application of the adoption's own engineering-act=ontological-act test (domain/range *agrees* with the SHACL act → in; IFP *disagrees* → out), not a deviation from it.

**Q3 — RESOLVED (session-050, 5–0): adopt hm ODR-0030 table + meta-shape (re-keyed) + ODR-0028b disjointness, with three OPDA tightenings.** (1) The ODR-0030 permitted/excluded construct table is adopted **re-keyed to OPDA's frozen closure** (documentary-only band larger than hm's), and the excluded-construct CI meta-shape **adds a fail-on-`owl:InverseFunctionalProperty` rule** (enforces the Q2 carve-out) while keeping `owl:unionOf` excluded with no carve-out (Q1's payoff — corpus stays boolean-constructor-free). (2) `owl:disjointWith` + SHACL dual, under a **three-part authoring bar: (i) rigid sortals with their own IC, (ii) INCOMPATIBLE ICs — *not* merely distinct, *not* complementary, (iii) a real, occurring misclassification hazard.** **Standing scope = `Person`/`Organisation` ALONE now.** The bar excludes two classes for two *distinct* reasons: **anti-rigid Roles** (no own IC to be incompatible — Seller/Buyer = transaction-scoped SHACL, session-047 Q4; grounded in identity-continuity), AND the **co-referring `Property`/`LegalEstate`/`RegisteredTitle` Kinds** (each has its own IC, but their ICs are *complementary not incompatible* → co-referential via `opda:identifiesSameProperty`, the opposite of disjoint — authoring `disjointWith` between them would wrongly fire on legitimate co-reference). Relator-Kind disjointness (`Transaction`/`Proprietorship`) **deferred** — passes (i)/(ii) but fails (iii) (relators are lifecycle-coupled, share relata) — gated on a named consumer. (3) **Pairwise not `owl:AllDisjointClasses`** — VERIFIED both gates (`scripts/fuseki-load.mjs:277`, `tools/opda-gen/src/opda_gen/ci/inference_closure_test.py:282`) consume authored pairwise `owl:disjointWith` directly (`GRAPH ?g1 { ?c1 owl:disjointWith ?c2 }`); zero authored today (`inference_closure_test.py:37`), so the gate is vacuous and authoring arms it — clearing session-035 condition (i).

### Supersession scope

On acceptance, partially supersedes ADR-0048 §1 (the SHACL-instead-of-OWL typing decision). ADR-0048's relationship-emission walk + `ci-object-property-coverage` gate survive — the gate relaxes from "type-pinned in OWL OR SHACL" to "documentary domain/range authored AND SHACL constraint present." **Requires a parallel ODR amendment to ODR-0032 §R1 and Council session-047 Q5** (an ADR cannot supersede an ODR cross-corpus — that correction is follow-on ODR work).

### Consequences

* Good — the doctrine is stated once and applies uniformly; adopts hm's defined coverage rather than re-deriving it.
* Good — the relationship layer regains documentary domain/range and becomes visible to the model derivation natively (the `ontology-model.mjs` SHACL-derivation hack can then be reverted or kept belt-and-braces — implementation decision T6).
* Neutral — nothing changes at inference time: the closure must still add ZERO domain/range triples (ADR-0035 test is the proof obligation).
* Bad — authoring is a maintenance commitment; the disjointness scope/carve-out must be enforced (gate).

### Confirmation

* ADR-0035 zero-domain/range-triple consistency test passes after authoring.
* `make verify-ontology` byte-identity; full `make ci`; regenerate `ontology-model.json` + `ontology-graph-elements.json` via `build:data`.
* Relaxed `ci-object-property-coverage` gate; new `ci-description-coverage` + `ci-isDefinedBy` gates (decision-4), warning-first.

## Council sessions and findings

- **session-048** (Council A — Queen Kendall, DA Cagle; `working/session-048/`): Q1 (a) dead 4–0; **(b) `owl:unionOf` 3–1 — SUPERSEDED by the hm-coverage adoption (now (a) repeated-domain)**; Q2 AGAINST FP/IFP 4–0; Q3 scoped `disjointWith` 3–1 (DA conditional-withdraw, no held dissent). Pivotal: Hendler **withdrew the "everything-becomes-a-Person" premise** as applied to OPDA (authored-but-never-evaluated is sound by construction). Verified precedents: RDFS 1.1 §3.2 (multiple `rdfs:domain` = conjunction); OWL 2 §2.3.5 (FP/IFP → `sameAs`); ODR-0026 §R3 / session-035 (drop-redundant-axiom-where-safe-substitute, 8–0–0).
- **session-050** (COMPLETE, 5–0 unanimous, no held dissent; Queen Kendall, DA Hendler, panel Allemang/Guarino/Cagle; `working/session-050/`): confirmed the hm-coverage adoption per-construct; **resolved Q2** (carve out FP/IFP — reason (ii) ODR-0005 binding); **refined Q3** (ODR-0030 table re-keyed + meta-shape +IFP-excluded; `disjointWith` `Person`/`Organisation`-alone-now + Relator-deferred + pairwise); **verified** both ADR-0035 gates consume authored pairwise `owl:disjointWith` directly. DA Hendler: Q1/Q2 HOLD (conditions met by the verdicts), Q3/Q4 WITHDRAW. Supersedes session-048 Q1 only (its Q2/Q3 survive, re-affirmed). Record: `docs/ontology/odr/council/session-050-adopt-semantic-modelling-owl-coverage.md`.
- **Held dissents:** Cagle (session-048) Q1 omit-now, Q3 cost-discipline (re-open: a consumer that reads a class-level partition off the axiom and cannot reconstruct it from `sh:xone`+SHACL) — both non-blocking; largely moot under the repeated-domain adoption (no `owl:unionOf`), to be reconciled in session-050.
- **Correction (verified):** `currentEnergyRating` (`opda-property.ttl:696-702`) is NOT rangeless — it carries `rdfs:domain opda:Property ; rdfs:range skos:Concept` + `sh:in`; it is the *correct* object-property→`skos:Concept`+`sh:in` enumeration pattern, not an anomaly. (An earlier research claim was wrong; do not "fix" it.)

## Outstanding work and open tasks

Implementation rework (follow-on; each gated by `make ci` + the ADR-0035 zero-triple proof + byte-identity):

1. ~~**Author documentary domain/range** on the relationship-layer object properties…~~ **DONE (2026-06-17, verified at file:line + independent gate re-run):** emitter changes in `emitters/modules/{agent,transaction,property}.py` — `founds` (`rdfs:domain opda:Relator`; range any-of `Role, RoleMixin`), `mediates` (plain `Proprietorship → Proprietor`), `playedBy`/`plays` (any-of `Role∪RoleMixin ↔ Person∪Organisation`), `hasParticipant` (range any-of `Seller, Buyer`), `hasAddress` (restored domain any-of `Property, Person, Organisation`; range `Address` kept); `concernsProperty`/`hasRegisteredTitle` already had both. SHACL `sh:or` duals retained (authoritative); "never reasoned" comments preserved; the false "NO rdfs:domain / would entail" comments reversed; CI-gated "any-of" `skos:editorialNote` added to all three module headers. **Necessary adjunct:** `emitters/shapes.py` excludes multi-domain predicates from the single-`sh:class` auto-derivation (multiple `sh:class` on one shape = unsatisfiable conjunction) and corrects emitted `sh:message` strings. **Verified:** `make verify-ontology` byte-identical; `make ci-ontology` all gates green; the ADR-0035 zero-domain/range-triple proof holds (31 inferred types, all subclass-derived, 0 leak); 0 real `owl:unionOf`/FP/IFP axioms; `build:data` regenerated the model JSONs (relationship edges now native). Sequencing satisfied (task 8 landed first). NOT committed.
2. **Q2 FP/IFP** — resolve in session-050, then implement (SHACL-only carve-out vs hm-authored).
3. **Scoped `owl:disjointWith`** (Q3) — rigid Kinds only, never anti-rigid Roles, pairwise; keep SHACL dual.
4. **Adopt hm ODR-0030** permitted/excluded construct table + the excluded-construct CI meta-shape as OPDA's OWL-coverage governance.
5. ~~**Reconcile `ci-object-property-coverage`**…~~ **DONE (2026-06-17):** `object_property_coverage_test.py` limb (b) inverted — (b1) a disjunction predicate lacking its SHACL `sh:or` dual fails; (b2) a disjunction predicate present while the module-header convention note is absent fails; (b3) FP/IFP authored on an object property fails (partially realises task 4's excluded-construct check). Old "fail on not-universally-true `rdfs:domain`" removed. Unit tests updated. Green on re-run.
6. **`scripts/ontology-model.mjs:207-248`** SHACL-derivation block — keep-as-belt-and-braces vs revert (decide; update comment either way).
7. **`hasAddress`** — restore documentary domain (`opda-property.ttl:704-709`); reconcile with the `profiles.py` D4 silent-loss fix across 31 forms (`ADR-0048:82`).
8. ~~**ODR-0032 §R1 amendment** (cross-corpus) + Council session-047 Q5 amendment — an ADR cannot supersede an ODR.~~ **DONE (2026-06-17):** ODR-0032 §R1 (the false "MUST NOT be authored" premise corrected), §R2 (session-050 amendment block — founds/mediates documentary domain/range + disjunction any-of + FP/IFP carve-out), §Decision-detail (the "deferred option" framing corrected + taken up), §Confirmation limb (b) inverted, `depends-on: +ODR-0026`; and session-047 Q5 carries a session-050 supersession banner. This **unblocks task 1**.
9. **ODR-0008 §Q6a** reasoner-independence test — re-read against the now-defined closure.
10. ~~**Positive doctrine ODR**…~~ **DONE (2026-06-17, verified):** created **ODR-0033** ("OWL/RDFS axioms as documentary AI-signal — the consolidated doctrine"; `kind: architecture`, `council: session-050`; R1 documentary-not-entailed, R2 engineering-act=ontological-act per-construct test, R3 the no-standard-entailment corollary, R4 the FP/IFP carve-out, R5 the repeated-`rdfs:domain` any-of form). Stripped ALL `hm`/`semantic-modelling` references from the **normative** text of ODR-0025/0026/0027/0029 → relocated to each record's §More Information as prior art (verified: zero hm tokens remain in any pre-§More-Information section; ratified rule bodies + frontmatter byte-identical to HEAD — only citations relocated/neutralised + ODR-0033 cross-refs added).
11. **Proof obligations** — regen the model JSONs (`build:data`, commit both); ADR-0035 zero-triple; byte-identity; full `make ci`.
12. **Write the council session records** (session-048/049/050) + add `adoption.md` track-record rows.

## More Information

* Working brief: `docs/HANDOVER-2026-06-17-entailment-doctrine-domain-range-as-signal-relationship-layer-rework.md`.
* Prior art adopted (cite here only; strip from normative ODR text): `~/source/hm/semantic-modelling` ODR-0014 (domain/range), ODR-0030 (owl-as-documentation + excluded-construct table), ODR-0054 (property characteristics), ODR-0028b (disjointness), ODR-0036 (SHACL-rules-&-OWL-inferencing).
* Verified this session via `/ruflo-swarm:swarm` research + adversarial verification + Council sessions 048/049 (and 050).

## Amendments

* 2026-06-17 (a) — created in Draft; positive doctrine + decision-4 accepted; decisions 1/2 OPEN pending Council A.
* 2026-06-17 (b) — Council A (session-048): Q1 (b) `owl:unionOf` 3–1; Q2 no-FP/IFP 4–0; Q3 scoped `disjointWith` 3–1.
* 2026-06-17 (c) — **directing-authority decision: adopt semantic-modelling's coverage** → Q1 flips to hm ODR-0014 repeated-`rdfs:domain` "any-of", **superseding session-048's `owl:unionOf` verdict**; session-050 convened to confirm consequences + the Q2 FP/IFP reconciliation.
* 2026-06-17 (d) — **Council session-050 (5–0 unanimous, no held dissent):** hm-coverage adoption confirmed per-construct. Q2 resolved (FP/IFP carve-out; reason (ii) ODR-0005-binding, re-open only if ODR-0005 overturned). Q3 resolved (ODR-0030 table re-keyed + meta-shape +IFP-excluded; `owl:disjointWith` `Person`/`Organisation`-alone-now + Relator-deferred + pairwise, gate-consumption verified at `fuseki-load.mjs:277`/`inference_closure_test.py:282`). Q4 consequences confirmed; `founds`/`mediates` authoring sequenced after the ODR-0032 amendment; `ci-object-property-coverage` limb (b) **inverts** (not merely relaxes). Session-048 superseded on Q1 only.
