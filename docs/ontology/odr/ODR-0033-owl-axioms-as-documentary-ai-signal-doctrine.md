---
status: proposed
date: 2026-06-17
kind: architecture
tags: [entailment, owl, rdfs, shacl, documentation-axioms, domain-range, ai-signal, doctrine]
scope: []
council: session-050
supersedes: []
depends-on: [ODR-0005, ODR-0025, ODR-0026, ODR-0027, ODR-0029]
implements: []
---

# OWL/RDFS axioms as documentary AI-signal — the consolidated doctrine

## Context and Problem Statement

OPDA's entailment regime runs **only** a frozen 7-rule RDFS-Plus load-time closure ([ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R1) and excludes `rdfs:domain`/`rdfs:range` and the rest of the "R2-excluded set" (`owl:FunctionalProperty`/`InverseFunctionalProperty`, `owl:equivalentClass`/`equivalentProperty`, `owl:Restriction`/`unionOf`/`intersectionOf`/`complementOf`/cardinality/`oneOf`/`hasKey`) from inference. Yet OPDA continues to **author** many of those constructs — `rdfs:domain`/`range` on ~750 datatype properties, scoped `owl:disjointWith`, property characteristics — as documentation and machine-legible signal of modeller intent. The positive principle that reconciles "author it but never infer from it" was stated only in fragments scattered across [ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R2, [ODR-0026](ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md) §R2, [ODR-0027](ODR-0027-classification-roles-inheritance-skos-doctrine.md) §R5, and [ODR-0029](ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) §R1.

That fragmentation had a concrete cost. Council session-047 (implemented in ADR-0048) re-derived `rdfs:domain`/`range` from **standard** OWL/RDFS entailment semantics — the "everything-becomes-a-Person" trap — concluded the relationship-layer object properties (`founds`/`mediates`/`playedBy`/`plays`/`hasAddress`) must therefore drop documentary domain/range and pin types in SHACL only, and made those edges invisible to the class-graph model derivation. That reasoning is wrong under OPDA's own regime: OPDA opted out of standard OWL/RDFS entailment, so reasoning *about OPDA* from those semantics yields false conclusions. The session-047/048 records were later corrected on exactly this point. The recurring nature of the error (two independent council passes fell into it) is the warrant for stating the doctrine **once**, as a single citable record, rather than leaving it implicit across four ODRs.

This ODR is the consolidating doctrinal home. It states the positive principle, the per-construct admission test, the standing corollary, and the one carve-out (FP/IFP), and cross-references the four source ODRs whose fragments it gathers. It changes **no** decision in those records — each retains its own normative rules; this record names the shared doctrine they all instantiate.

## Decision Drivers

* **Doctrine consistency.** The regime already excludes domain/range and the R2 set from inference; authoring them is therefore safe by construction, and the ~750 datatype properties already do it. The principle should be stated, not re-litigated per construct.
* **AI/LLM signal.** OWL/RDFS axioms are machine-legible documentation of modeller intent — an LLM or external tool reading the TBox should see the author's typing/disjointness/characteristic intent, even though OPDA's own pipeline never reasons over it.
* **Standards-legibility.** Author W3C-legible axioms even though OPDA never reasons — a third-party DL tool may evaluate them independently, out of OPDA's load-time scope.
* **Proof obligation, not trust.** Whatever is authored MUST NOT change the closure — the ADR-0035 zero-domain/range-triple consistency test is the formal proof that "model-but-don't-evaluate" holds.
* **A bounded admission test, not a blanket licence.** Authoring-as-signal is admissible only where the construct's published W3C semantics *agree* with OPDA's enforced behaviour; where they disagree (notably IFP), authoring publishes a proposition OPDA holds false.

## Considered Options

* **Option A (chosen) — State one consolidated doctrine: author OWL/RDFS axioms as documentary AI-signal, never entailed; admit each R2-set construct only where its W3C semantics agree with OPDA's enforced behaviour; carve out FP/IFP.** A single citable record; the four source ODRs keep their rules and cite this as their shared principle.
* **Option B — Leave the principle fragmented across ODR-0025 §R2 / 0026 §R2 / 0027 §R5 / 0029 §R1.** Rejected: the fragmentation is exactly what let session-047/048 re-derive domain/range from standard OWL semantics twice; there is no single statement to cite against the error.
* **Option C — State the doctrine as "author everything OWL, validate in SHACL" with no per-construct test.** Rejected: a blanket licence would admit `owl:InverseFunctionalProperty`, whose published semantics assert the negation of [ODR-0005](ODR-0005-property-land-identity-crux.md)'s bounded-context-identity ruling. The admission test (engineering-act = ontological-act) is load-bearing, not decoration.
* **Option D — Drop the documentary axioms and express everything in SHACL only.** Rejected: loses the documentary / AI-signal value and the standards-legibility of the TBox; the ~750 datatype properties already carry both the axiom and the SHACL dual without harm.

## Decision Outcome

Chosen option: **"Option A — state one consolidated doctrine"**, because the principle is uniform across every R2-set construct, the cost of leaving it implicit is a demonstrated, recurring reasoning error, and a single record gives every future modeller and council one statement to cite.

**The doctrine.** OPDA authors OWL/RDFS axioms — `rdfs:domain`/`range`, property characteristics, `owl:disjointWith`, disjunctions — as **documentary, AI-legible signal of modeller intent; they are NEVER entailed.** The only inference is the frozen 7-rule RDFS-Plus load-time closure ([ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R1). Everything else is authored for documentation / AI-signal **AND** validated via SHACL ([ODR-0029](ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) §R1/§R3), never reasoned.

**Per-construct discipline (the admission test).** Author an R2-set construct as documentary signal **only where its published W3C semantics AGREE with OPDA's enforced behaviour** — "engineering-act = ontological-act." Where the W3C reading of the axiom matches what OPDA's SHACL actually does, the axiom is honest documentary signal (domain/range *agrees* with the `sh:class`/`sh:or` act → in). Where it disagrees, authoring it would publish a proposition OPDA holds false (IFP *disagrees* → out).

**Standing corollary.** Do **NOT** reason about OPDA from standard W3C OWL/RDFS entailment semantics. OPDA opted out of those semantics for everything outside the 7 frozen rules; a conclusion derived by applying standard OWL/RDFS inference to OPDA's TBox (e.g. "multiple `rdfs:domain` ⇒ every subject is the intersection of all domains," or "an IFP merges co-referents") is unsound *as a statement about OPDA*, regardless of its correctness as a statement about standard OWL. This corollary is the explicit guard against the session-047/048 error.

**The FP/IFP carve-out (session-050).** `owl:InverseFunctionalProperty` and a general `owl:FunctionalProperty` documentary layer are **NOT authored** — the single place OPDA's local constraint overrides authoring-as-signal, and it does so *by the admission test itself*. A published IFP asserts the **negation** of [ODR-0005](ODR-0005-property-land-identity-crux.md)'s bounded-context-identity ruling: its W3C meaning (OWL 2 §2.3.5) promotes a contingent identifier to a constitutive global identity criterion ("shared value ⇒ `owl:sameAs` everywhere"), the inverse of OPDA's ruling — an OntoClean rigidity-clash. Uniqueness lives in SHACL: `dash:uniqueValueForClass`, scoped **within** each identity-bearing sortal, **never cross-sortal** (a cross-sortal key is IFP in SHACL clothing — it would fire on legitimate UPRN co-reference across the Property Kinds). A narrow hand-curated `owl:FunctionalProperty` on a genuine world-fact singleton is admissible only if the modal marker is explicitly wanted — not a blanket pass.

**Disjunction form.** A multi-bearer ("any-of") domain is expressed as **repeated `rdfs:domain`** read as a disjunction (the `domainIncludes`-in-RDFS idiom) under a CI-gated module-header convention note + per-property `rdfs:comment`, with the authoritative per-class disjunction in SHACL `sh:or` — **NOT** `owl:unionOf` (an excluded boolean class constructor; a union of disjoint sortals would reify a non-sortal carrying no identity criterion). This keeps the corpus boolean-constructor-free.

### Consequences

* Good, because the doctrine is stated once and applies uniformly; future modellers and councils cite this record instead of re-deriving the principle per construct.
* Good, because the standing corollary is an explicit, citable guard against the recurring "reason from standard OWL semantics" error that cost two council passes.
* Neutral, because nothing changes at inference time: the closure still adds ZERO domain/range triples (the ADR-0035 test is the proof obligation), and the four source ODRs keep every decision and rule unchanged — this record consolidates, it does not supersede.
* Bad (accepted), because authoring documentary axioms is a standing maintenance commitment, and the admission test plus the FP/IFP carve-out must be enforced by CI (the excluded-construct meta-shape and the object-property-coverage gate).

### Confirmation

* The ADR-0035 zero-domain/range-triple consistency test passes: the load-time closure materialises no `domain`/`range`/equivalence/`sameAs` triple — the formal proof that authored documentary axioms are never entailed.
* The excluded-construct CI meta-shape fails on any authored `owl:InverseFunctionalProperty` (and on `owl:unionOf`), enforcing the carve-out and the disjunction form.
* The relationship-layer `ci-object-property-coverage` gate requires the documentary domain/range + matching SHACL dual for disjunction predicates.

## Rules

### R1 — Author OWL/RDFS axioms as documentary AI-signal; never entail them

OWL/RDFS axioms outside the 7 frozen rules — `rdfs:domain`, `rdfs:range`, property characteristics, `owl:disjointWith`, disjunctions — are **first-class modelling vocabulary** authored wherever they carry information (human documentation, machine-legible signal of modeller intent, input for external DL tooling). The load-time closure ([ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R1) evaluates **none** of them. They are authored for documentation/AI-signal **AND** validated via SHACL ([ODR-0029](ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) §R1/§R3), never reasoned. This is the consolidated statement of the "model-but-don't-evaluate" principle previously fragmented across [ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R2, [ODR-0026](ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md) §R2, [ODR-0027](ODR-0027-classification-roles-inheritance-skos-doctrine.md) §R5, and [ODR-0029](ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) §R1.

### R2 — The per-construct admission test (engineering-act = ontological-act)

Author an R2-set construct as documentary signal **only where its published W3C semantics agree with OPDA's enforced (SHACL) behaviour.** The test is applied per construct, not blanket:

- `rdfs:domain`/`rdfs:range` — **in.** The closed-world SHACL reading ("are the subjects of `<pred>` of class C?", [ODR-0029](ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) §R3) agrees with the documentary intent; the generative W3C reading is never run, so the disagreement never materialises (proven by the ADR-0035 test).
- `owl:disjointWith` — **in, scoped.** Authored only between rigid sortals with their own, *incompatible* identity criteria where a real misclassification hazard occurs; the authored pairwise axiom feeds a real consistency gate. (Scope and the three-part bar are governed by ADR-0049 / session-050; this record states only the admission principle.)
- `owl:InverseFunctionalProperty` / general `owl:FunctionalProperty` — **out** (R4). The W3C semantics disagree with OPDA's enforced behaviour.

The asymmetry is principled, not ad-hoc: the same test admits domain/range (agrees) and excludes IFP (disagrees).

### R3 — Standing corollary: do not reason about OPDA from standard W3C OWL/RDFS entailment

A conclusion reached by applying standard OWL/RDFS inference to OPDA's authored TBox is **unsound as a statement about OPDA**. OPDA's only entailment is the 7 frozen rules; every other construct is authored-but-unevaluated. Specifically: authored multiple `rdfs:domain` do **not** intersect-type their subjects; an authored characteristic does **not** fire its W3C inference; an authored disjunction does **not** classify. The correct reading of any such axiom in OPDA is "documentary signal, validated in SHACL." This corollary exists because two independent council passes (session-047, session-048) derived `rdfs:domain`/`range` behaviour from standard OWL semantics and reached a wrong disposition that had to be corrected.

### R4 — The FP/IFP carve-out

Do **NOT** author `owl:InverseFunctionalProperty` (out entirely) or a general `owl:FunctionalProperty` documentary layer. The home for uniqueness is SHACL: `sh:maxCount 1` and `dash:uniqueValueForClass`, scoped **within** each identity-bearing sortal and **never cross-sortal**. A narrow hand-curated `owl:FunctionalProperty` on a genuine world-fact singleton is admissible only when the modal marker is explicitly wanted.

**Binding ground (for permanence):** a published IFP asserts the negation of [ODR-0005](ODR-0005-property-land-identity-crux.md)'s bounded-context-identity ruling — it promotes a contingent identifier (a UFO Quality) to a constitutive global identity criterion. This is the *binding* reason; redundancy-with-the-safe-SHACL-substitute (the session-035 drop-redundant-axiom rule, [ODR-0026](ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md) §R3) is corroborating only. The carve-out re-opens **only** if [ODR-0005](ODR-0005-property-land-identity-crux.md) is itself overturned; it is not re-openable by a modelling-economy argument.

### R5 — Disjunction form: repeated `rdfs:domain`, never `owl:unionOf`

A multi-bearer ("any-of") domain is authored as **repeated `rdfs:domain`** read as a disjunction (the `domainIncludes`-in-RDFS idiom), under a CI-gated module-header convention note and a per-property `rdfs:comment`, with the authoritative per-class disjunction carried in SHACL `sh:or`. `owl:unionOf` is **not** used — it is an excluded boolean class constructor, and a union of mutually disjoint sortals reifies a non-sortal that carries no identity criterion. This keeps the corpus boolean-constructor-free.

### R6 — Permitted/excluded OWL-construct table (re-keyed to OPDA's frozen closure)

This is the per-construct disposition for every OWL/RDFS modelling construct OPDA may encounter — the ODR-0030-adopted construct table from the sibling `semantic-modelling` corpus, **re-keyed to OPDA's frozen 7-rule closure** ([ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R1). OPDA's **documentary-only band is LARGER than hm's**: hm runs disjointness (and more) as inference, whereas OPDA *validates* disjointness via SHACL + the ADR-0035 consistency gate and infers it never. Three bands:

**Permitted + inferred** (the 7-rule closure, [ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R1 — the *only* constructs OPDA reasons over):

| Construct | Closure rule |
|---|---|
| `rdfs:subClassOf` | transitivity + type-propagation |
| `rdfs:subPropertyOf` | transitivity + value-propagation |
| `owl:inverseOf` | inverse materialisation |
| `owl:TransitiveProperty` | transitive closure |
| `owl:SymmetricProperty` | symmetric materialisation |

**Permitted + documentary-only (authored as AI-signal, NEVER inferred — R1/R2):**

| Construct | Where it lives / how it is checked |
|---|---|
| `rdfs:domain` | documentary; closed-world SHACL `sh:class`/`sh:or` (R2 — agrees) |
| `rdfs:range` | documentary; closed-world SHACL `sh:class`/`sh:or` (R2 — agrees) |
| `owl:disjointWith` | scoped (R2/§Confirmation); checked by the ADR-0035 consistency gate, **not** inferred; `Person`/`Organisation` alone now (ADR-0049 / session-050) |
| `owl:equivalentClass` | documentary only |
| `owl:equivalentProperty` | documentary only |
| `owl:FunctionalProperty` | narrow **hand-curated world-fact singleton only** (R4); no general documentary layer — the home for uniqueness is SHACL `sh:maxCount 1` / `dash:uniqueValueForClass` |

**Excluded entirely (never authored — neither inferred nor documentary):**

| Construct | Excluded because |
|---|---|
| `owl:InverseFunctionalProperty` | asserts the negation of [ODR-0005](ODR-0005-property-land-identity-crux.md)'s bounded-context-identity ruling (R4) |
| `owl:Restriction` | OWL class-expression constructor; not in the closure |
| `owl:unionOf` | boolean class constructor; the disjunction form is repeated `rdfs:domain` (R5) |
| `owl:intersectionOf` | boolean class constructor |
| `owl:complementOf` | boolean class constructor |
| `owl:cardinality` / `owl:minCardinality` / `owl:maxCardinality` / `owl:qualifiedCardinality` / `owl:minQualifiedCardinality` / `owl:maxQualifiedCardinality` | OWL cardinality restrictions; counting is SHACL `sh:minCount`/`sh:maxCount` |
| `owl:oneOf` | enumeration class constructor; enumerations are SKOS `skos:Concept` + SHACL `sh:in` |
| `owl:hasKey` | a key is IFP-adjacent; identity is bounded-context per [ODR-0005](ODR-0005-property-land-identity-crux.md) |
| `owl:disjointUnionOf` | combines `unionOf` + disjointness, both handled above |

**CI enforcement.** The **excluded** band is enforced corpus-wide by the `ci-excluded-construct` meta-shape gate (ADR-0049 task 4): it fails if ANY excluded construct appears anywhere in the class graph, detected as a real triple component (a predicate, or the object of an `rdf:type` axiom) — never as a substring of an annotation literal, so this record's own prose mentions of e.g. `owl:unionOf` do not trip it. This generalises the FP/IFP limb (b3) of the `ci-object-property-coverage` gate (which catches FP/IFP on object properties only) to the full excluded set, corpus-wide. The corpus has **zero** excluded constructs today, so the gate passes and arms drift protection. `owl:FunctionalProperty` is **not** failed corpus-wide (a hand-curated singleton is admissible, R4); its object-property carve-out is enforced narrowly by `ci-object-property-coverage` limb (b3).

## More Information

- **Consolidates (these records keep their decisions; this names their shared doctrine):**
  - [ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R1 (the frozen 7-rule closure — the *only* inference) and §R2 (the excluded set — non-evaluation, not a prohibition on authoring).
  - [ODR-0026](ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md) §R2 (model-but-don't-evaluate) and §R3 (drop the redundant axiom where a safe evaluable substitute carries the signal — the session-035 corroborating ground for R4).
  - [ODR-0027](ODR-0027-classification-roles-inheritance-skos-doctrine.md) §R5 (`rdfs:domain`/`range` are documentation; SHACL enforces, value-keyed).
  - [ODR-0029](ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) §R1 (the inference/validation boundary), §R2 (frozen rule logic), §R3 (`domain`/`range`-as-SHACL-constraint).
- **Identity ground for the carve-out:** [ODR-0005](ODR-0005-property-land-identity-crux.md) §R5 (bounded-context identity; no `owl:sameAs`) — the binding reason IFP is excluded.
- **Engineering realisation:** ADR-0049 (the per-construct adoption, relationship-layer correction, and the excluded-construct + coverage gates); [ODR-0032](ODR-0032-relationship-layer-object-properties.md) §R1/§R2 (the relationship-layer correction this doctrine motivated); ADR-0035 (the zero-domain/range-triple proof obligation).
- **Council deliberation:** [session-048](council/session-048-owl-documentary-domain-range-r2-set.md) (the per-construct admission test; the withdrawal of the "everything-becomes-a-Person" premise as applied to OPDA) and [session-050](council/session-050-adopt-semantic-modelling-owl-coverage.md) (5–0; the FP/IFP carve-out and its ODR-0005-binding ground; the disjunction form).
- **Prior art (project-neutral statement of the idioms above):** the `domainIncludes`-in-RDFS idiom for "any-of" domains is mainstream prior art (schema.org `domainIncludes`, DCMI, FIBO declares domain/range and enforces via SHACL); the multiple-`rdfs:domain`-is-conjunction reading is RDFS 1.1 §3.2; the IFP→`owl:sameAs` semantics are OWL 2 §2.3.5; annotation properties carry no model-theoretic consequence per OWL 2 §10.1. The sibling `semantic-modelling` corpus is the prior-art source from which OPDA adopted this OWL coverage (see ADR-0049 §More Information for the per-construct adoption map).
