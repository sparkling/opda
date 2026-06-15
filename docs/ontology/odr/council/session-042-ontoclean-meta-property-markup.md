# Council Session 042 (R1) — Should OPDA mark up the OntoClean meta-properties? (Reduced Council)

- **Date:** 2026-06-15
- **Records:** resolves the **ODR-0031 §R7(a) held 3–3 split** (amends ODR-0031); routes the engineering realisation to a new **ADR-0046** (conditional); updates the ADR-0045 deferral note. The session-041 follow-up ADR-0045 explicitly deferred here.
- **Queen:** Elisa Kendall (OMG / EDM Council; FIBO; *Ontology Engineering* 2019 — the neutral swing on a recorded 3–3; "does it serve a named consumer at warranted cost?").
- **Devil's Advocate:** Tom Baker (DCMI — the DCMI Abstract Model + the "dumb-down"/one-to-one principles; genuinely opposed: "don't mint a judgement only the *process* made").
- **Panel:** Nicola Guarino (ISTC-CNR — OntoClean author, the chief proponent), Dean Allemang (*Working Ontologist* — the session-041 AGAINST voice).
- **Voices:** 4 across 4 teammates.
- **`consensus-mode`:** `agent-fan-out` (file-based positions + anticipatory cross-talk; queen-composed synthesis — Agent Teams was mid-teardown from session-041, so live `SendMessage` was not used).
- **Format:** Reduced Council (~4 runs).
- **Input:** `working/session-042/BRIEF.md`; session-041 transcript; ODR-0031 (R7(a) held split); ADR-0045 (deferred this; the UFOCategoryScheme + sixth gate); ODR-0027 (the OntoClean cascade); ODR-0030.

## Context

Session-041 left exactly one item unresolved — a clean **3–3 split** on whether to mark up the OntoClean meta-properties (rigidity ±R, identity ±I, dependence ±D, unity ±U) as a structured, annotation-graph-only `owl:AnnotationProperty` vocabulary per type. **FOR:** Guarino (separability insurance; the canonical −R⊐+R check), Guizzardi, Cagle (DA, withdrawn-conditional). **AGAINST:** Allemang ("ship the knife, not the whetstone"), Baker ("minting them would assert a judgement only the process made"), Gandon. ADR-0045 routed it to this Reduced Council; nothing was emitted.

**The decisive corpus finding (all three panellists verified independently; new since session-041).** The session-041 premise that the meta-properties are "nowhere structured data" is **stale**. ADR-0045 shipped the nine `opda:UFOCategoryScheme` concepts into `opda-annotations.ttl`, and **four of them already carry their OntoClean signature in their `skos:definition`** — `RelatorCategory` "(OntoClean +R, +I, +D)" (`:85`), `SubstanceKindCategory` "(+R, +O)" (`:112`), `RoleCategory`/`RoleMixinCategory` "(−R, +D)" (`:94`/`:103`). It is **per-category** (not per-type), **prose** (not parseable), and **incomplete** (5 of 9 carry no cell; unity ±U appears nowhere). So session-042 is **not** "prose vs structure" — it is "**also structure it per-*type*, for a machine**." This reframing changed the shape of the deliberation and is what let the 3–3 converge.

---

## Question 1 — Mark up at all, or keep prose?

**Converged: conditional-AFFIRM — mark up *iff* the canonical-check CI gate ships atomically with the tags; otherwise keep prose.**

**Guarino:** AFFIRM / FOR. "OPDA ships OntoClean's *output* (the subclass-vs-facet topology) and hides its *input* (the ±R/±I/±D/±U vectors)." The tag is honest provenance of the design judgement the process performed — "like `dct:creator` records the cataloguer's act," not a domain claim (Guarino & Welty, "An Overview of OntoClean," *Handbook on Ontologies* 2nd ed. 2009, §3). The "lie" Baker fears arises only if it is *reasoned*, which the discipline forbids.

**Kendall (Queen):** REVISE / FOR — breaks the tie, on two conditions. By the FIBO tests: (1) **named consumer** — Guarino's OntoClean self-consistency audit is a *real, runnable* check of OPDA's own ODR-0011 §8a / ODR-0027 cascade that the corpus cannot run today; (2) **assert-only-what-you-substantiate** — met head-on: "the per-type vector is substantiated *identically to the verdict OPDA already ships* — the topology is the procedure's conclusion, the vector its recorded premise. You cannot ship the conclusion as queryable data and call the premise 'a judgement only the process made.'" Conditioned on the scope cut (Q2) + the gate shipping atomically (Q3).

**Allemang:** REJECT (keep prose) — **flips to AFFIRM iff Q3 ships a running gate.** "Marking up a standing per-type `opda:ontoCleanRigidity rigid` triple *in addition* is materialising the **derivation** alongside the **conclusion** … the maximal form of the over-modelling error my own chapter names" (*SWWO* 3rd ed., Ch. 12). But he narrows decisively: "the category-level signature *already ships* … my REJECT is specifically against promoting it to a standing per-type predicate vocabulary **absent a reader**. The condition under which I move to AFFIRM is precise: if Q3 demonstrates a named, materialised consumer — a CI gate that actually *runs* the canonical check as green-or-red in the build — then the per-type vector stops being a worksheet and becomes the gate's **input data** … the minimum-model rule no longer forbids it; it requires it" (modelling-for-reuse, *SWWO* Ch. 13).

**Baker (DA):** REJECT (keep prose) / AGAINST — **HOLD**, with a single named withdrawal condition: "I withdraw to FOR the instant the canonical OntoClean −R⊐+R check ships as a running CI gate / SHACL meta-shape over the TBox — that one event creates the named second consumer AND makes the per-type tags its necessary input." Grounded: the DCMI one-to-one principle (the per-category signature already ships → per-type is redundant materialisation in two registers) + the dumb-down principle (describe the resource, not the describer's reasoning). "Short of a shipping consumer, the markup describes only the describer's reasoning."

**Vote Q1: converged conditional-AFFIRM (4–0–0 on the gated disposition).** Every voice accepts "mark up iff the gate ships." On the *ungated/blanket* framing it is REJECT (3 of 4 against). The disagreement was never metaphysics — it was *"does a consumer exist?"*

---

## Question 2 — Exact representation + scope

**REVISE: `owl:AnnotationProperty` ×(±R/±I floor), `sh:in`-governed, hung on `opda:UFOCategoryScheme`, never reasoned/instance-keyed — on the classes the gate's check *ranges over*, not blanket-every-class, and *not* unity ±U.**

**Guarino:** REVISE / FOR — **full vector, every tagged class (~40)**: "a partial vector yields an *unsound completeness-check / false green* — the worst CI failure mode." Narrow fallback if the full vector deadlocks: **rigidity-only** (the sound subset).

**Allemang:** REVISE (conditional) / ABSTAIN-as-framed, FOR-the-narrowest: **±R/±I only** (drop ±D — already carried by the Relator/`founds` topology; drop ±U — "has adjudicated nothing in this corpus … speculative configurability"), on the **< 10 decision-bearing types only** (`tenureKind`, `VouchEvidence`, `RiskAssessment`, the evidence family), and **only where the per-type value is not already inherited `category → scheme → signature`** (the redundancy rule and the scope rule are "the same rule seen twice").

**Kendall (Queen):** REVISE / FOR — between the two: **not blanket** (35 classes of unused vector — over-modelling), **not only the contested leaves** (breaks the audit — a −R⊐+R check needs both the −R subjects *and* the +R types they sit under), but **the decision-turning classes *plus the immediate contrast set the audit ranges over*.**

**Baker (DA):** AGAINST (conditional narrow REVISE only if overridden) — and even then minimal; the existing `skos:definition` already carries the signature where a human needs it.

**Vote Q2: REVISE.** Synthesis adjudication (below): the vector on **the subsumption lattice the gate ranges over + its contrast set** (Kendall's scoping, which makes Guarino's completeness sound *and* honours Allemang's discipline), **±R/±I as the floor** (the §8a cascade is stated in ±R/±I terms; ±D where the Relator decision turned on it), **±U excluded** (never exercised — both Allemang and Baker hold it would over-claim). Guarino's "full-vector / all-40" and Allemang's "±R/±I / <10" are recorded as the bounds.

---

## Question 3 — Does it carry the canonical OntoClean check? (the hinge)

**AFFIRM: ship the canonical check as a TBox-only OntoClean meta-shape CI gate (the ODR-0031 R3 tag-guard pattern — validates the TBox, never instances). This gate is the *precondition* of the whole adoption.**

**Guarino:** AFFIRM / FOR. The named consumers: the **maintainer editing the hierarchy** (internal + certain, fires on every edit) as #1; the Option-D council as #2; an external tool as #3 (speculative, not leaned on).

**Allemang:** REVISE / FOR-gate-as-precondition, AGAINST-markup-without-it. "Verified: `tools/opda-gen/src/opda_gen/ci/` has eight gates and **not one runs the OntoClean check** … latent-consumer is **not** consumer. Ship the TBox meta-shape **or the markup is speculative.**" The cut is the heart of the session: *with* the gate he is FOR; *without* it, "auditable" is satisfied by the `skos:definition` signatures already shipped.

**Baker (DA):** REJECT-as-framed, but this is the **exact** content of his withdrawal condition — "no SPARQL query, no grlc endpoint, no CI gate reads per-type ±R/±I/±D/±U … the check exists only in Guarino's own prose" (verified). Shipping the gate is the one event that flips him.

**Kendall (Queen):** AFFIRM / FOR (conditional) — "**the gate is the *condition* of my Q1 FOR, not an enhancement**: ungated, the tags are latent decoration that no consumer exercises … and I flip to REJECT. The value Guarino promises is the *check*, not the *tags*." Mirrors session-041's own "relocate AND gate, atomically."

**Vote Q3: AFFIRM (4–0).** The gate is unanimously the precondition. Baker's "no consumer exists today" is **true** — which is precisely why the gate must *ship*: shipping it *creates* the consumer and converts the tags from decoration into input.

---

## Question 4 — Disposition + record

**REVISE: conditional adoption. Lift the ODR-0031 R7(a) held split; realise in a new ADR (ADR-0046) where the ±R/±I tags and the consuming TBox meta-shape ship in the same commit or neither ships. If the operator declines the gate → REJECT-for-now with a (now-lower) re-open trigger.**

All four converge that the clean way to retire a 3–3 is to **find the condition that collapses it** (Allemang: "we are not disagreeing about metaphysics; we are disagreeing about whether a consumer exists"). Routing (Kendall + Allemang, against Guarino's "extend ADR-0045"): a **new ADR**, not a re-open of ADR-0045 (which is a clean landed record with a byte-identity re-pin). The new ADR carries (a) the ±R/±I per-type tags on the scoped set; (b) the TBox meta-shape gate that consumes them; (c) a byte-identity re-pin — **(a) and (b) ship together or neither.**

**Vote Q4: REVISE (4–0 conditional).**

---

## Synthesis (Queen — Kendall)

The session-041 3–3 is **resolved by convergence, not by a manufactured majority.** Every voice — the proponent (Guarino), the swing (myself), the minimum-model sceptic (Allemang), and the Devil's Advocate (Baker) — lands on the **same sentence**: *mark up the OntoClean meta-properties if and only if the canonical OntoClean check ships as a running, TBox-only CI gate, atomically with the tags; scope the tags to exactly what that gate reads.* Allemang put it best from the AGAINST bench — "insurance against a loss pays out only if someone files the claim; a `±R` tag that no gate reads is an insurance policy in a drawer." Baker's withdrawal condition, Guarino's Q3, my Q1 condition, and Allemang's AFFIRM-condition are **one condition**.

The reframing that made this possible is the verified finding that the OntoClean signature **already ships per-category** (ADR-0045's `UFOCategoryScheme` definitions). That collapses the metaphysical heat: Baker's "it would *lie*" does not survive for ±R/±I (the signature already ships, truthfully, sourced to ODR-0031) — it narrows to a *redundancy/speculation* objection on the per-type grain, and survives intact only for the **speculative slices** (±D structurally redundant via the `founds` topology; ±U never exercised). That is decisive for **scope**: the adopted markup is **±R/±I (+ ±D where a Relator decision turned on it), never ±U**, on **the subsumption lattice the gate ranges over plus its contrast set** — which makes Guarino's soundness concern (no false green) and Allemang's discipline concern (no unread decoration) the same scope, not opposed ones. Guarino's "full-vector, all ~40" is relaxed (the flat ODR-0027 hierarchy means the checked lattice is far smaller than 40); Allemang's "<10, ±R/±I only" is the floor.

**The verdict.** Adopt **conditionally**: ODR-0031 R7(a) moves from *held-3–3* to *resolved — conditional adoption (scoped + gated)*. The engineering is routed to **ADR-0046** (`status: proposed`, depends-on ADR-0045): the scoped ±R/±I tags **and** the TBox OntoClean meta-shape gate (the R3 tag-guard pattern — TBox-only, instance-data never touched, so it cannot re-fire the ODR-0030 quarantine trigger), a seventh CI check, and a byte-identity re-pin — *(a) and (b) together or neither*. **If the operator declines the gate**, the disposition is **REJECT-for-now**: the category-level `skos:definition` signatures + the ODRs are the record, and the re-open trigger is *lower* than session-041 left it — *re-open when a named consumer (a CI gate, an external reuse partner, or a second OntoClean check) needs the per-type ±R/±I vector as queryable data.* Nothing is emitted until the operator ratifies; the Council shapes the proposal, not its adoption.

---

## Tally appendix

| Voice | Q1 mark-up | Q2 representation/scope | Q3 the gate | Q4 disposition |
|---|---|---|---|---|
| Kendall (Queen) | FOR¹ | FOR (scoped) | FOR¹ | FOR |
| Guarino | FOR | FOR (full vector) | FOR | FOR |
| Allemang | AGAINST² → FOR-iff-gated | ABSTAIN-as-framed / FOR-narrowest | FOR (gate=precondition) | FOR (conditional) |
| Baker (DA) | AGAINST² (**WITHDRAWN** on the gate) | AGAINST² | AGAINST-as-framed (**WITHDRAWN** on the gate) | AGAINST² (**WITHDRAWN**) |
| **Tally (gated disposition)** | **4–0–0** | **REVISE (4–0)** | **4–0–0** | **4–0–0** |

¹ Kendall's FOR is conditional on the scope cut + the gate shipping atomically; ungated she flips to REJECT.
² On the *ungated, blanket-full-quartet-every-class* framing, Allemang + Baker (and Kendall) are AGAINST — that framing is rejected. The 4–0 is on the **converged gated+scoped disposition**.

### DA scorecard (Baker)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **WITHDRAWN** (to FOR) | "the canonical −R⊐+R check ships as a running CI gate / SHACL meta-shape over the TBox" → **met by the adopted disposition** (gate ships atomically with the tags) |
| Q2 | **WITHDRAWN** | scope honoured (the gate's lattice + contrast set; not blanket); the existing envelope (`AnnotationProperty`, sixth gate) reused |
| Q3 | **WITHDRAWN** | the gate *is* the disposition — shipping it is his exact condition |
| Q4 | **WITHDRAWN** | "gate + tags adopt together on the unchanged envelope" → the ADR-0046 atomic-or-neither rule |

**Held-as-live dissent (Baker, DA).** If enrichment ships **without** the running gate (markup-as-decoration), Baker reverts to **REJECT** — "the markup describes only the describer's reasoning" (DCMI one-to-one + dumb-down). **Re-open trigger** (also the REJECT-path trigger if the operator declines the gate): *a named consumer needs the per-type ±R/±I vector as queryable data; until then the per-category `skos:definition` signatures + the ODRs are the record.* Recorded in ODR-0031 §R7(a) (amended) + ADR-0046 §Held dissent.

### Per-question count

Q1 4–0–0 (gated) · Q2 REVISE 4–0 · Q3 4–0–0 · Q4 4–0–0. **No question fell below unanimity on the converged disposition.** The only live tension is **scope** (Guarino full-vector-all-40 vs Allemang ±R/±I-<10), adjudicated to the gate's lattice + contrast set; recorded as the bound for ADR-0046 to fix.
