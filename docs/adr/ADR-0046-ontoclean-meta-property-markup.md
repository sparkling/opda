---
status: proposed
date: 2026-06-15
tags: [ontology, ontoclean, meta-properties, rigidity, identity, annotation-property, shacl-meta-shape, ci-gate, three-graph-quarantine, byte-identity]
supersedes: []
depends-on: [ODR-0031, ADR-0045, ODR-0027, ODR-0011, ODR-0004]
implements: []
---

# OntoClean meta-property markup — conditional, gated on the canonical-check CI meta-shape

## Context and Problem Statement

[ODR-0031](../ontology/odr/ODR-0031-ufocategory-upper-ontology-representation.md) §R7(a) left one item as a held **3–3 split**: should OPDA mark up the OntoClean meta-properties (rigidity ±R, identity ±I, dependence ±D, unity ±U) as a structured, annotation-graph-only `owl:AnnotationProperty` vocabulary per type? [ADR-0045](ADR-0045-ufocategory-quarantine-restoration-gufo-scheme-sixth-gate.md) scoped it out and routed it to a follow-up Reduced Council. Council **[session-042](../ontology/odr/council/session-042-ontoclean-meta-property-markup.md)** (Queen Kendall; DA Baker — withdrawn; Guarino, Allemang) **resolved it as conditional adoption.** This ADR is its engineering realisation — and it is **conditional**: nothing is emitted unless the operator ratifies the gate.

The deliberation collapsed the 3–3 onto a single condition once a corpus fact was verified: the OntoClean signature **already ships per-category** in ADR-0045's `opda:UFOCategoryScheme` `skos:definition`s (`RelatorCategory` "(+R, +I, +D)", `SubstanceKindCategory` "(+R, +O)", `RoleCategory`/`RoleMixinCategory` "(−R, +D)" — 4 of 9; prose, per-category, no unity). So the question was never "prose vs structure" — it was "**also structure it per-*type*, for a machine**." And the Working-Ontologist / DCMI answer is identical: *you mark up what a machine reads.* Today **no CI gate, SPARQL query, or endpoint reads per-type ±R/±I/±D/±U** (verified: eight gates, none OntoClean) — so absent a consumer the tags are decoration. **Shipping the canonical-check gate is the act that creates the consumer.**

## Decision Drivers

* **The gate is the condition, not an enhancement** (all four voices, session-042). Ungated tags are latent decoration that no consumer exercises — the metadata FIBO/DCMI reject and the over-modelling *SWWO* Ch. 12 forbids.
* **Atomicity.** The tags and the gate that consumes them ship in the same commit or neither — the session-042 "gate + tags adopt together" disposition (echoing session-041's "relocate AND gate, atomically").
* **Soundness vs over-modelling.** A *partial* vector false-greens a completeness check (Guarino); a *blanket* vector tags ~30 classes whose category was never in question (Allemang). The scope that is both sound and disciplined is **the subsumption lattice the check ranges over + its contrast set** (Kendall).
* **Truthfulness of the value set.** ±R/±I moved OPDA bytes (the ODR-0011 §8a cascade is stated in ±R/±I terms); ±D is largely carried by the Relator/`founds` topology; **±U has adjudicated nothing** — asserting it per type would claim a judgement the process never made (Baker + Allemang). So **±R/±I floor, ±D where a Relator decision turned on it, never ±U.**
* **Quarantine intact.** The gate is the ODR-0031 R3 tag-guard pattern: TBox-only, validates the meta-level, **never instance-keyed** — so it cannot re-fire the ODR-0030 Rule 1 quarantine trigger.

## Considered Options

* **Option A (chosen) — Conditional, gated, scoped markup.** Emit the scoped ±R/±I (+conditional ±D) per-type `owl:AnnotationProperty` tags **and** the TBox OntoClean meta-shape that consumes them, atomically; a seventh CI gate; a byte-identity re-pin.
* **Option B — Blanket full-quartet on every class.** Rejected (session-042 Q2): over-models (~30 unread vectors), and ±U over-claims a judgement never made.
* **Option C — Prose-only / reject.** The *no-gate fallback*: if the operator declines the gate, keep the per-category `skos:definition` signatures + the ODRs as the record. This is the disposition **by default** until the gate is ratified.
* **Option D — Extend ADR-0045.** Rejected (Kendall + Allemang): ADR-0045 is a clean landed record with a byte-identity re-pin; a fresh concern belongs in a new ADR (this one).

## Decision Outcome

Chosen option: **"Option A — conditional, gated, scoped markup"**, because session-042 converged that the meta-property markup earns its place *only* when a machine reads it, and the only honest way to ship the tags is to ship — in the same change-set — the gate that consumes them. **If the operator does not ratify the gate, Option C (prose-only) stands and nothing is emitted.**

The change-set (on ratification):

| # | Change | Target |
|---|---|---|
| 1 | Emit `opda:ontoCleanRigidity` (+ `opda:ontoCleanIdentity`; `opda:ontoCleanDependence` where a Relator decision turned on it) as `owl:AnnotationProperty`, **SKOS-`sh:in`-governed** value sets (e.g. rigidity ∈ {`rigid`, `anti-rigid`, `semi-rigid`, `non-rigid`}; identity ∈ {`supplies-IC`, `carries-IC`, `no-own-IC`}), **per type**, in `opda-annotations.ttl`. **Never `opda:ontoCleanUnity`.** | `emitters/ufo_categories.py` (the annotation-graph emission point) |
| 2 | **Scope** the tags to the subsumption lattice the check ranges over + its contrast set (the `tenureKind`/`VouchEvidence`/`RiskAssessment`/evidence family + the Kinds they sit under), not blanket-every-class, not only the contested leaves; omit a tag where the value is already inherited `category → scheme → signature` | same |
| 3 | Emit the **TBox OntoClean meta-shape** — the canonical check *"every −R type that is nonetheless `rdfs:subClassOf` something"* + IC-incompatible subsumption — as a `sh:Violation` meta-shape (the ODR-0031 R3 tag-guard pattern: `sh:targetSubjectsOf`/SPARQL over the TBox, **never** `sh:targetClass`/`sh:path` on instance data), with `opda:metaShapeJustification` | `emitters/shapes.py` |
| 4 | Add a **seventh CI check** running the meta-shape over the class+annotation graph (the editorial pass; never the instance-validation union) | `ci/three_graph_test.py` (or a sibling) + tests |
| 5 | **Re-pin byte-identity**; all gates green | corpus re-emit |
| **Atomic** | **(1)+(3) ship in the same commit or neither** — tags without the consuming gate are decoration | — |

### Consequences

* Good, because OPDA's load-bearing OntoClean judgement becomes **auditable and re-derivable** — the canonical self-consistency check (a query no current artefact can run) ships as a green/red gate, and the per-type premise that produced each subclass-vs-facet verdict becomes queryable data, not unfalsifiable prose.
* Good, because it is **separability insurance** (Guarino): the OntoClean reasoning survives even if the UFO *vocabulary* is ever retired (the Devil's Advocate's own held Option-D exit), as structured data rather than evaporating prose.
* Good, because the quarantine holds: `owl:AnnotationProperty` + TBox-only meta-shape + the (existing) sixth gate mean nothing UFO/OntoClean-shaped reaches the reasoner or the instance validator.
* Bad (accepted), because it is real build surface (a seventh gate + per-type tags) for an audit of a small, flat lattice; justified **only** by the gate that exercises it — which is why the atomic rule is load-bearing.
* Neutral, because **scope** is the one tension session-042 left bounded (Guarino full-vector-all-40 vs Allemang ±R/±I-<10): this ADR fixes it at the checked lattice + contrast set, ±R/±I floor, to be finalised against the actual subsumption edges at implementation.

### Confirmation

* The seventh CI check runs the canonical OntoClean meta-shape over the TBox and is **green**; the existing six three-graph gates + byte-identity stay green.
* The `opda:ontoCleanRigidity`/`Identity`/`Dependence` tags resolve **only** in `opda-annotations.ttl` (`owl:AnnotationProperty`; never in the classes/shapes graphs; never instance-keyed); **no `opda:ontoCleanUnity`** is emitted.
* The canonical query *"`SELECT ?sub ?super WHERE { ?sub rdfs:subClassOf ?super . ?super opda:ontoCleanRigidity 'anti-rigid' }`"* (an anti-rigid type subsuming anything) returns **empty** against the corpus.
* **Atomic gate-or-nothing:** CI fails if the tags are present without the consuming meta-shape. Status `proposed`; **the operator ratifies adoption and decides whether to ship the gate** — absent that, Option C (prose-only) stands.

## More Information

* **Council provenance:** [session-042](../ontology/odr/council/session-042-ontoclean-meta-property-markup.md) (Reduced Council; the 3–3 convergence onto the gate condition; Baker WITHDRAWN; the verified "signature already ships per-category" + "no consumer today" findings).
* **Resolves:** [ODR-0031](../ontology/odr/ODR-0031-ufocategory-upper-ontology-representation.md) §R7(a) (the held 3–3, now conditional adoption).
* **Depends on:** [ADR-0045](ADR-0045-ufocategory-quarantine-restoration-gufo-scheme-sixth-gate.md) (the `UFOCategoryScheme` anchor + the sixth-gate / R3 tag-guard pattern this gate reuses); [ODR-0027](../ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md) (the OntoClean cascade the meta-properties are the input to); ODR-0011 §8a; ODR-0004 §3a.
* **External:** Guarino & Welty, "An Overview of OntoClean" (*Handbook on Ontologies* 2nd ed., 2009, §3); Allemang, Hendler & Gandon, *Semantic Web for the Working Ontologist* 3rd ed. (2020), Ch. 12–13; DCMI Abstract Model + the dumb-down/one-to-one principles; W3C SHACL §4.6.

## Vote and Dissent

Inherits the [session-042](../ontology/odr/council/session-042-ontoclean-meta-property-markup.md) verdict — converged **conditional adoption** (Q1 4–0 gated · Q2 REVISE 4–0 scoped · Q3 4–0 gate-as-precondition · Q4 4–0 conditional). **DA Baker WITHDRAWN** on the gate condition (his withdrawal condition — "the canonical check ships as a running CI gate" — is exactly this ADR's atomic rule). **Held-as-live dissent (Baker):** if the tags ever ship **without** the running gate (markup-as-decoration), revert to **REJECT** (DCMI one-to-one + dumb-down). **Re-open / REJECT-path trigger:** if the operator declines the gate, the disposition is REJECT-for-now — the per-category `skos:definition` signatures + the ODRs are the record — re-opening when a named consumer (a CI gate, an external reuse partner, or a second OntoClean check) needs the per-type vector as queryable data. **Scope bound:** Guarino (full vector / all ~40) vs Allemang (±R/±I / <10) — fixed here at the checked lattice + contrast set, ±R/±I floor. Status `proposed`; operator ratifies.
