---
status: accepted
date: 2026-05-31
tags: [descriptive-layer, gufo, ufo-typing, annotation-graph, opda-gen]
supersedes: []
depends-on: [ODR-0008, ODR-0023, ODR-0024, ODR-0010]
implements: [ADR-0012, ADR-0030]
---

# Gated gUFO `rdf:type` Property-Typing Pass

## Context and Problem Statement

Council **[session-029](../ontology/odr/council/session-029-r2-ufo-axis-load-bearing.md)** (Full panel) judged the ODR-0008 §Q2a(a) UFO-axis spawn trigger **NOT met** (Q1–Q4 each 0–6–0) and declined to mint `ODR-0008a/b/c`: the curated walk typed leaves by **bearer Kind (`rdfs:domain`), not UFO meta-category**, and the flagship leaves fail OntoClean as a partition backbone (`priceQualifier` straddles Mode/Quality; `ownershipType` rides two identity principles — Guarino). But the panel **unanimously affirmed (Q5, 6–0–0)** that the Quality/Mode distinction is *ontologically real and rigid **as a typing*** (Guizzardi, Guarino, Knublauch, Davis) and ruled it should be **preserved via a per-property gUFO `rdf:type` annotation** — *"the distinction earns `rdf:type`; it does not earn a namespace."* Verified live, **no `gufo:` prefix and not one `rdf:type gufo:Quality`/`gufo:Mode` triple exists in the corpus today** — the typing pass was never run. This work item is logged at [ADR-0005](./ADR-0005-deferred-work-register.md) §G25 (queued from session-029 Q5); running it is **conjunct (i)** of the [ODR-0023](../ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) R2 re-open trigger. This ADR is the **engineering record** for the emission; the *modelling decision* and the per-leaf identity criterion remain owned by [ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md) §Q5a (session-029 §"No new ODR").

## Decision Drivers

* session-029 Q5 (6–0–0) — the ratified disposition: a gated gUFO `rdf:type` typing pass over the **uncontested** Property descriptive leaves, preserving the insight without a namespace.
* [ODR-0010](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) §Q7a — Knublauch's pin: the typing is a **classification triple, not a constraint**, so it lives in the **annotation graph, never the shapes graph** (CI-test-3: `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` → FALSE). **Not SHACL** (no validator exists; that re-incurs the rejected structure cost).
* **Uncontested-only** — type the clean Quale-in-Region leaves; **omit** the straddlers (`priceQualifier`, `marketingTenure`) and the re-sorter (`ownershipType`) until a rigid rule adjudicates each to exactly one cell (Guarino's identity/disjointness gate). `tenureKind` is a **Substance-Kind label**, not a Quality/Mode — also omitted.
* **Classification, not axiom** — the `rdf:type` is an advisory UFO meta-category marker on the attribute, quarantined to the annotation graph so no reasoner reads the datatype property as a quality *individual*; the bearer's identity criterion stays ODR-0008 §Q5a's. No new bearer, no fresh IC (session-029 line 134).
* **Reversible / subtractive posture** (S025/S029) — assert a `rdf:type` over a w3id namespace; do not mint permanent modules around an analytic lens that re-sorts under the next reasoner pass.

## Considered Options

* **Per-property `rdf:type gufo:Quality` in the annotation graph** — the dominant position (Guizzardi/Guarino/Knublauch/Davis); exactly as the verdict frames it.
* **`skos:scopeNote` / `rdfs:comment` prose only** — Allemang's conservative minority on *mechanism* (not route): keep prose until a typing pass + a biting query arrive, lest the assertion manufacture an entailment no query needs. Recorded, non-blocking.
* **SHACL over the annotation, or a UFO sub-module namespace (`ODR-0008a/b/c`)** — rejected by session-029 (no validator; partition backbone fails OntoClean on the straddlers).

## Decision Outcome

Chosen option: **per-property `rdf:type gufo:Quality` in the descriptive annotation graph**, gated to the uncontested leaves — the unanimous Q5 route. Emitted via the [ADR-0030](./ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) generator (no hand-edited TTL), extending the [ADR-0012](./ADR-0012-shacl-and-dpv-annotation-emission.md) annotation emitter (`emitters/annotations.py::build_descriptive_annotations`):

* **Prefix** — declare `gufo: <http://purl.org/nemo/gufo#>`, bound **only** in `opda-descriptive-annotations.ttl` (the other five annotation files are byte-unchanged).
* **Typed leaves (5)** — `gufo:Quality` `rdf:type` on every §Q5a **Quale-in-Region** leaf on `opda:Property`: `opda:currentEnergyRating` (EPC), `opda:councilTaxBand` (council-tax), `opda:builtForm` (built-form), `opda:centralHeatingFuelType`, `opda:heatingType`. Each also carries `dct:source <…/ODR-0008#section-Q5a>`.
* **Omitted (adjudicated-pending / out-of-category)** — `opda:ownershipType` (re-sorter: quality-by-type vs legal-estate-by-bearer); `opda:priceQualifier`, `opda:marketingTenure` (Mode/Quality straddlers — and descriptive-layer, not core Property); `opda:tenureKind` (Substance-Kind label). A module-level `rdfs:comment` records the inclusion rule + the omissions + the advisory (non-axiom) reading.
* **Home discipline** — the triples land in `opda-descriptive-annotations.ttl` (the advisory annotation graph), **never** in `opda-classes.ttl`, `opda-inference.ttl`, or any `*-shapes.ttl`. No `gufo:Quality` is *declared* as an `owl:Class` here (it is referenced, reference-not-import, like DPV).
* **NOT emitted:** any `gufo:Mode` (no uncontested Mode leaf exists — the Modes are the omitted straddlers); any SHACL; any `ODR-0008a/b/c` namespace; any `owl:imports <…/gufo>`.

### Consequences

* Good, because it **preserves the UFO Quality insight** the panel affirmed, as a queryable `rdf:type`, without minting the rejected modules.
* Good, because it **builds conjunct (i)** of the ODR-0023 R2 re-open trigger — a future honest spawn judgement now has a typed leaf-set to test a biting query against (conjunct (ii)).
* Good, because it incurs **no namespace, no IC, no key debt** and is **reversible** (a classification triple in the advisory graph retracts cleanly; re-homes onto a sub-module if one is ever earned).
* Neutral, because the **straddlers/re-sorter stay untyped** by design — adjudicating `priceQualifier` (Guizzardi: a Quality of the listing Relator) / `ownershipType` to one cell is a separate, named follow-on, not blocked here.
* Neutral, because **Allemang's prose-until-a-biting-query minority is recorded** — if the typing is later judged to manufacture an unused entailment, it is annotation-graph-isolated and removable without touching classes/shapes.
* Bad (accepted), because asserting `rdf:type gufo:Quality` on a datatype *property* is a deliberate lightweight abbreviation of "this attribute is of the Quality meta-category", not a literal claim that the property is a quality particular — mitigated by the annotation-graph quarantine + the module `rdfs:comment` that states the reading.

### Confirmation

* `tests/test_annotations.py::test_descriptive_gufo_quality_typing` asserts the 5 leaves carry `(leaf, rdf:type, gufo:Quality)` + `dct:source` ODR-0008 §Q5a, and that the 4 omitted leaves do **not**.
* `ci-three-graph` (`check_no_shacl_in_annotations`) stays green — the typing uses `rdf:type`/`dct:source`, no `sh:*`; `test_no_owl_class_triples_in_annotations` stays green (no `?s a owl:Class`).
* `ci-byte-identity` re-pins **only** `opda-descriptive-annotations.ttl` (the other five annotation files + all class/shape graphs are byte-unchanged); `test_annotation_files_byte_identical_across_runs` confirms determinism.
* `ci-category-g-coverage` unchanged at **239/239** (this is a typing annotation, not a new leaf); full `opda-gen` pytest suite green.

## More Information

* **Modelling decision + IC owner:** [ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md) §Q5a (per-leaf Quale-in-Region bindings) + §Q2a(a) (the spawn-gate refinement); Council [session-029](../ontology/odr/council/session-029-r2-ufo-axis-load-bearing.md) Q5 (the 6–0–0 disposition + DA scorecard + the held-as-live pro-spawn dissent).
* **Scheduling + scope:** Council [session-029](../ontology/odr/council/session-029-r2-ufo-axis-load-bearing.md) Q5 (the 6–0–0 disposition) + [ADR-0005](./ADR-0005-deferred-work-register.md) §G25 (the queued work item — pure-additive and sound, executed here); [ODR-0023](../ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) R2 (conjunct (i) of the re-open trigger).
* **Graph-boundary contract:** [ODR-0010](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) §Q7a (annotation-vs-shapes graph); [ODR-0004](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) §3a (three-graph separation).
* **Deferred-work register:** [ADR-0005](./ADR-0005-deferred-work-register.md) §G25 (this work item, now executed).
* **Generator:** [ADR-0012](./ADR-0012-shacl-and-dpv-annotation-emission.md) (the annotation emitter this extends); [ADR-0030](./ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) (the descriptive emission subsystem).
* **gUFO vocabulary:** Almeida, Guizzardi et al., *gUFO: A Lightweight Implementation of UFO* (NEMO, 2019), `http://purl.org/nemo/gufo#`.
* **AgentDB registration** of this ADR is pending an `adr-index` run (the `ruflo` MCP is disconnected this session); the file + frontmatter edges are authoritative.
