# Council Session 050 — Adopt semantic-modelling's OWL coverage as OPDA baseline (Full Council)

- **Date:** 2026-06-17
- **Records:** ADR-0049 (amended — Q2 resolved, Q1 confirmed, Q3 refined); **supersedes session-048 Q1 only** (its Q2/Q3 survive). Council B/session-049 (single-axis) unaffected.
- **Queen:** Elisa Kendall (FIBO methodology — author OWL for documentation + SHACL for validation; the enterprise precedent for the adoption)
- **Devil's Advocate:** Jim Hendler (W3C/RPI — OWL formal semantics; genuinely opposed to adopting hm's repeated-`rdfs:domain` "any-of" as a standards shibboleth, and to wholesale ODR-0054)
- **Panel:** Dean Allemang (pragmatic RDF / reuse-over-mint / `domainIncludes` advocate); Nicola Guarino (ISTC-CNR — identity criteria, OntoClean; the FP/IFP-vs-`sameAs` reconciliation); Kurt Cagle (SHACL-first — the SHACL home + the ODR-0030 meta-shape)
- **Voices:** 5 across 4 teammates.
- **`consensus-mode`:** `agent-fan-out` (Agent Teams cross-talk via SendMessage; working files mirrored to `working/session-050/`)
- **Format:** Full Council (~5 runs)
- **Input:** hm ODR-0014/0030/0054/0028b (the coverage being adopted, MAIN tree); OPDA ODR-0025/0026/0029, ODR-0005/0017 (`owl:sameAs` ban), ODR-0032 + ADR-0048; ADR-0049; `working/session-048/`. Working files: `working/session-050/{hendler,allemang,guarino,cagle}.md`.

## Context

The directing authority (acting ratifier) decided OPDA **adopts** semantic-modelling's already-defined OWL coverage as its baseline, rather than re-deriving it (which session-048 had done, reaching `owl:unionOf` without hm's ODRs in its brief). This council confirms the adoption **per-construct**, resolves the one genuine OPDA-vs-hm tension (FP/IFP vs the `owl:sameAs` ban), and works out the consequences. The governing test, adopted from session-048 and grounded here: **author an R2-set construct as documentary signal only where its published W3C semantics AGREE with OPDA's enforced behaviour** ("engineering-act = ontological-act"), gated additionally by OPDA's session-035 rule (drop the axiom where a safe evaluable substitute carries the signal) and OPDA's *stronger-than-hm* local constraints (frozen 7-rule closure; categorical `owl:sameAs` ban; DASH-keying already chosen).

## Question 1 — Adopt hm ODR-0014 repeated-`rdfs:domain` "any-of"?

**5–0 FOR; DA HOLD (non-blocking, condition met).**

**Kendall (Queen):** FOR — FIBO declares domain/range and enforces via SHACL; the `domainIncludes`-in-RDFS idiom is mainstream prior art, adopt it. **Allemang:** FOR — schema.org `domainIncludes`/DCMI/FIBO are real prior art; the standard RDFS §3.2 conjunction reading is *disarmed by construction* (ADR-0035 proves zero domain/range triples materialise) and the convention is published, not a secret handshake. **Guarino:** FOR — identity-sound *because* never evaluated; *more* identity-correct than `owl:unionOf` (a union of disjoint sortals is a non-sortal carrying no IC, so `unionOf` would reify a pseudo-kind). **Cagle:** FOR — `sh:or` already emitted at `sh:Violation` carries 100% enforcement (ODR-0029 §R3). **Hendler (DA):** HOLD (non-blocking) — multiple `rdfs:domain` *is* the standards conjunction (RDFS 1.1 §3.2), sound only because the frozen closure never evaluates it; legible **only if** the documentation discipline is a CI-gated MUST. The whole panel adopted his rider.

**Binding rider (CI-gated MUST):** (1) module-header `skos:editorialNote` declaring the any-of convention; (2) per-property `rdfs:comment` on each disjunctive property; (3) reverse the false `plays`/`playedBy`/`founds`/`mediates` "would-entail" comments; (4) Cagle's positive lint asserting every multi-domain relationship-layer property has its `sh:or` dual present.

**Vote Q1: 5–0–0** (Hendler HOLD non-blocking, condition met by the rider).

## Question 2 — Adopt hm ODR-0054 (author Functional/IFP) wholesale, or carve out?

**5–0 FOR the carve-out (AGAINST authoring FP/IFP); DA HOLD (blocking, condition satisfied).**

The one place OPDA's stronger local constraint overrides the adopt-hm baseline — and it does so **by the adoption's own engineering-act=ontological-act test**. **IFP out entirely; FP no general documentary layer** (SHACL `sh:maxCount 1` is the home; a narrow hand-curated `owl:FunctionalProperty` on genuine world-fact singletons is admissible only if the council wants the modal marker — not a blanket pass). The identifying-key signal lives in **`dash:uniqueValueForClass`**, scoped **within** each identity-bearing sortal, **never cross-sortal** (a cross-sortal key would fire on legitimate UPRN co-reference across the 3 Property Kinds — IFP in SHACL clothing).

**Guarino (decisive ground):** IFP conflates a contingent *identifier* (UFO Quality) with a constitutive *identity criterion*; its W3C meaning (OWL 2 §2.3.5) promotes the identifier to a global IC ("shared value ⇒ `sameAs` everywhere") — the inverse of ODR-0005's 12-0 bounded-context-identity ruling. Authoring IFP publishes a proposition OPDA holds false; `dash:uniqueValueForClass` (flag-not-fuse) is the ontologically *correct* commitment, not a lesser substitute. **Hendler + Guarino reason-ordering (binding for permanence):** the two grounds are not co-equal — **(ii) "publishes the negation of ODR-0005" is BINDING; (i) "redundant with the safe substitute" (session-035) is corroborating.** The verdict is closed unless ODR-0005 itself is overturned (not re-openable by a modelling-economy argument). **Cagle/Allemang:** session-035 (ODR-0026 §R3, 8–0–0) independently drops the redundant axiom; the asymmetry with Q1 is principled (domain/range *agrees* with the SHACL act → in; IFP *disagrees* → out).

**Vote Q2: 5–0–0** for the carve-out (Hendler HOLD-blocking — the carve-out *is* the condition of sound adoption — satisfied by the verdict).

## Question 3 — Adopt hm ODR-0030 construct table + meta-shape + ODR-0028b disjointness as-is?

**5–0 FOR, adopted with three OPDA-specific tightenings; DA WITHDRAW.**

**Q3a (ODR-0030 table + excluded-construct CI meta-shape):** adopt the structure (reuse hm's SPARQL meta-shape near-verbatim), but **re-key the *Inferencing* column to OPDA's frozen closure** — OPDA's documentary-only band is *larger* than hm's (hm runs disjointness as inference; OPDA validates it). **The meta-shape adds one rule hm's lacks: fail on `owl:InverseFunctionalProperty`** (CI enforcement of the Q2 carve-out; FP flagged documentary-only-hand-curated). Because Q1 adopted repeated-domain (not `owl:unionOf`), **the meta-shape keeps failing `owl:unionOf` with no carve-out** — the corpus stays boolean-constructor-free (a concrete win over session-048).

**Q3b (ODR-0028b disjointness):** adopt the *scoping discipline*, hard-scoped to OPDA's identity model:
- **Three-part authoring bar (Guarino + Hendler, final sharpening):** author `owl:disjointWith` only between **(i)** rigid sortals with their own IC, **(ii)** with *incompatible* ICs (not merely distinct, not complementary), and **(iii)** where misclassification is a real, occurring master-data hazard. The bar excludes two classes for *distinct* reasons: **anti-rigid Roles** fail (i) (no own IC — borrow the bearer's, −I); the **co-referring `Property`/`LegalEstate`/`RegisteredTitle` Kinds** fail (ii) (each +I with its own IC, but *complementary not incompatible* → co-referential via `opda:identifiesSameProperty`, the opposite of disjoint).
- **Standing scope = `Person`/`Organisation` ALONE, now.** Relator-Kind disjointness (`Transaction`/`Proprietorship`) is **DEFERRED** — passes (i)/(ii) but fails (iii) (relators are lifecycle-coupled and share relata → the collision doesn't occur → would be an unconsumed axiom). Admissible-in-principle, gated on a named consumer.
- **NEVER between anti-rigid Roles** sharing a bearer's identity (Seller/Buyer/Proprietor RoleMixins) — grounded **primarily in identity-continuity** (they borrow the bearer's IC, so incompatible-IC can never hold — Guarino & Welty 2002), RoleMixin non-sortality a-fortiori. Seller/Buyer exclusivity is transaction-scoped SHACL (session-047 Q4), never categorial.
- **Pairwise `owl:disjointWith`, NOT `owl:AllDisjointClasses`** — **verified**: both the runtime gate (`fuseki-load.mjs:277`) and the CI test (`inference_closure_test.py:282`) consume authored *pairwise* `owl:disjointWith` directly (`GRAPH ?g1 { ?c1 owl:disjointWith ?c2 }`); no rule walks an `AllDisjointClasses` list, so it would be published-but-unchecked.
- **The verified gate-consumption fact clears session-035 condition (i):** authored `disjointWith` feeds a real, currently-vacuous evaluable check no `sh:not` shape feeds (`inference_closure_test.py:37` confirms zero authored today). This retired Cagle's session-048 cost-discipline residual (twice over: no `owl:unionOf` to cohere with + the gate reads the axiom). `disjointWith` passes the engineering-act=ontological-act test where IFP fails it.

**Vote Q3: 5–0–0** (Cagle's pure-SHACL line noted as a defensible minority, not held).

## Question 4 — Consequences + supersession

**5–0 FOR; DA WITHDRAW with two non-negotiable sequencing flags.**

The relationship layer **regains documentary domain/range** (reverses ADR-0048 §1; the "never reasoned" commitment is *preserved* by ADR-0035, NOT in tension — the session-047 misconception). `ci-object-property-coverage` limb (b) **inverts** for disjunction predicates ("fail unless single-universal OR complete documented any-of WITH matching `sh:or` dual"), not merely relaxes. `scripts/ontology-model.mjs` SHACL-derivation: **keep belt-and-braces** (the `sh:or` remains the authoritative per-class edge source for the disjunctive properties; domain/range alone under-determines them under the any-of convention) with a corrected comment.

**Two sequencing flags (Hendler DA, non-negotiable):** (i) authoring `founds`/`mediates` documentary domain/range is **GATED on the ODR-0032 §R1 + session-047 Q5 amendment first** — an ADR cannot supersede an ODR cross-corpus; (ii) the positive-doctrine consolidation (ODR-0025/0026/0027/0029) + **stripping all hm references from normative text** is ODR-track follow-on. **Standing guardrail:** re-run the ADR-0035 zero-domain/range-triple test after authoring — its passing is the formal proof "model-but-don't-evaluate" holds (it will pass; no R1 rule consumes the authored constructs).

**Supersession:** session-050 supersedes **session-048 Q1 only** (`owl:unionOf` → repeated-`rdfs:domain` "any-of"). Session-048 Q2 (FP/IFP-out 4–0) and Q3 (scoped disjointWith) **survive and are re-affirmed on deeper grounding**.

**Vote Q4: 5–0–0.**

## Synthesis (Queen — Kendall)

OPDA adopts semantic-modelling's OWL coverage as baseline — **broadly and per-construct**, not blindly. Domain/range adopts as hm ODR-0014's `domainIncludes`-in-RDFS idiom (Q1, with the CI-gated convention + the ADR-0035 proof obligation that disarms the RDFS §3.2 conjunction); the ODR-0030 construct table + excluded-construct meta-shape adopt re-keyed to OPDA's frozen closure (Q3a); ODR-0028b disjointness adopts under hard scope — `Person`/`Organisation` alone now, pairwise, never anti-rigid Roles, armed by the verified ADR-0035 gate (Q3b). The **single carve-out** is FP/IFP (Q2): OPDA does **not** adopt hm ODR-0054's author-them, because the published IFP axiom asserts the negation of OPDA's constitutional bounded-context-identity ruling (ODR-0005, 12-0) — *the carve-out is the application of the adoption's own engineering-act=ontological-act test, not a deviation from it*. The decisive moves were Guarino's identifier-vs-identity-criterion grounding (which makes the Q2 verdict permanent, re-openable only by overturning ODR-0005) and the verified fact that the ADR-0035 gate consumes authored pairwise `owl:disjointWith` directly (which makes Q3 disjointness a real consumer, not decoration). No held-as-live dissent on any question; Cagle's pure-SHACL line on Q3 is recorded as a defensible minority. Routed to ADR-0049 (amended) + the ODR-track follow-ons (ODR-0032 §R1 amendment; positive-doctrine consolidation). Status `proposed`; the operator ratifies adoption.

## Tally appendix

| Voice | Q1 | Q2 | Q3 | Q4 |
|---|---|---|---|---|
| Kendall (Queen) | FOR | FOR (carve-out) | FOR | FOR |
| Allemang | FOR | FOR (carve-out) | FOR | FOR |
| Guarino | FOR | FOR (carve-out) | FOR | FOR |
| Cagle | FOR | FOR (carve-out) | FOR¹ | FOR |
| Hendler (DA) | HOLD² | HOLD³ | WITHDRAW | WITHDRAW⁴ |
| **Tally** | **5–0–0** | **5–0–0** | **5–0–0** | **5–0–0** |

¹ Cagle's session-048 pure-SHACL/cost-discipline residual is **formally retired** here (clean AFFIRM, no minority note) — twice over: the `owl:unionOf` coupling evaporated under the hm-adoption, and he code-verified the ADR-0035 gate consumes authored `owl:disjointWith` directly. ² HOLD non-blocking — condition (CI-gated docs discipline) met by the verdict. ³ HOLD blocking — condition (FP/IFP carve-out) satisfied by the verdict. ⁴ WITHDRAW with two sequencing flags (ODR-0032 amendment precedence; doctrine-consolidation ODR-track).

### DA scorecard (Hendler)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **HOLD → CONCURRENCE** | the any-of documentation discipline is a CI-gated MUST → **met by the advocate himself** (the MUST is entailed by the adopt-hm decision — hm ODR-0014 mandates the header note + per-property comment); reverts to HOLD only if a limb is downgraded to SHOULD |
| Q2 | **HOLD (blocking)** | adopt only with the FP/IFP carve-out (IFP out; FP no general layer) → **satisfied**; re-open only if ODR-0005 is overturned |
| Q3 | **WITHDRAW** | carve-outs binding (FP/IFP→excluded; rigid-Kinds-only; pairwise) |
| Q4 | **WITHDRAW** | two sequencing flags: ODR-0032 §R1 amendment precedes `founds`/`mediates` authoring; doctrine consolidation is ODR-track |

**No held-as-live dissent.** Cagle's session-048 Q1/Q3 holds are both retired (Q1 moot under repeated-domain; Q3 retired on the verified gate-consumption fact).

### Per-question count

Q1 5–0–0 · Q2 5–0–0 · Q3 5–0–0 · Q4 5–0–0. Unanimous on all four; lowest FOR count = 5/5.

## Discussion transcript

The full deliberation (opening positions → verbatim SendMessage exchanges → finals) is preserved in `docs/ontology/odr/council/working/session-050/{hendler,allemang,guarino,cagle}.md` (committed, not deleted). Key exchanges: Allemang→Cagle/Guarino (the "does the ADR-0035 gate consume authored `owl:disjointWith`?" challenge that tipped Q3b FOR — verified by the Queen at `fuseki-load.mjs:277` / `inference_closure_test.py:282`); Hendler↔Guarino (the Q2 reason-ordering: (ii) binding / (i) corroborating); Guarino→Allemang (the Q3 positive-scope tightening to `Person`/`Organisation`-alone + Relator-deferred).
