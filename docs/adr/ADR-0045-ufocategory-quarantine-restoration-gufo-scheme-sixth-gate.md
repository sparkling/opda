---
status: proposed
date: 2026-06-15
tags: [ontology, ufo, ufocategory, gufo, ontoclean, annotation-property, three-graph-quarantine, ci-gate, skos, emitter, byte-identity, dolce]
supersedes: []
depends-on: [ODR-0031, ODR-0030, ODR-0004, ADR-0044, ADR-0034]
implements: []
---

# `ufoCategory` quarantine restoration, gUFO-alignment scheme, and the sixth three-graph gate

## Context and Problem Statement

[ODR-0031](../ontology/odr/ODR-0031-ufocategory-upper-ontology-representation.md) (council [session-041](../ontology/odr/council/session-041-ufocategory-upper-ontology-representation.md)) settled the *ontology-modelling* decision for `opda:ufoCategory`: enrich by **reference and disclosure under a restored annotation-graph quarantine**, not by minting into the reasoned graph. This ADR is its **engineering realisation** — the emitter, CI-gate, and presentation changes — and the **correction of [ADR-0044](ADR-0044-ontology-as-web-pages-dereferenceable-entity-detail-pages.md) Phase 5c**, which shipped the defect.

ADR-0044 Phase 5c (2026-06-15) promoted the UFO meta-category to a structured `opda:ufoCategory` facet. Session-041 verified — at file:line, by four voices — that this shipped a breach of the binding prior:

- ADR-0044 Phase 5c declared `opda:ufoCategory a owl:DatatypeProperty ; rdfs:range xsd:string` (`foundation.py:523`, emitted `opda-classes.ttl:90`) and asserted all ~87 per-term tags **inline in the reasoned-union files** (`opda-classes/agent/claim/property/descriptive/governance/transaction.ttl` + `opda-vocabularies.ttl`). `opda-annotations.ttl` carries **zero** `ufoCategory` triples.
- [ODR-0030](../ontology/odr/ODR-0030-foundational-ontology-choice.md) Rule 1 (decided one day earlier) requires these tags to be **annotation-graph-only** ("retention lapses if it is breached"); Cagle's session-040 re-open trigger (i) fires "if the layer is ever made reasoned-over." The placement breach fires it in the committed corpus.
- The three-graph CI gate (`three_graph_test.py`) has **five checks, none of which forbids an advisory predicate in the classes graph** — so the breach ships green, and Knublauch's session-040 standing condition is, for this predicate, unenforced.
- ODR-0030 Rule 7(b)'s three-part DOLCE-lineage disclosure was never shipped on the predicate `scopeNote` (`opda-classes.ttl:96` carries only "promotes … to a structured, queryable facet").
- The predicate does **double duty** across two value-spaces: the 9-term UFO class axis and a register-deference scheme axis (35× `"Quale-in-Region"` etc., ODR-0030 Rule 2), where ungoverned strings have already drifted from ODR-0011 §8a's spec (`"Substance Kind label"` vs `SubstanceKindLabel`).

The engineering question this ADR settles: **how to realise ODR-0031 in the `opda-gen` emitter, the CI gates, and the `/ontology` SSG — restoring the quarantine atomically, minting the gUFO-alignment scheme behind a new gate, and re-pinning byte-identity.**

## Decision Drivers

* **The quarantine restoration is the precondition** for every enrichment step (ODR-0031 R2): the gUFO scheme, the pages, and any future markup all assume the predicate is inert and annotation-graph-resident first.
* **Atomicity** — "relocate AND gate, atomically" (session-041, co-signed Cagle + Guarino): relocating without the new gate just moves the breach; gating without relocating fails the build today.
* **Inertness intrinsic, not contingent** — `owl:AnnotationProperty` carries no model-theoretic consequence under any regime (OWL 2 §10.1), a stronger guarantee than ODR-0029's accidental shallowness.
* **The absolute red line** — no `exactMatch`→gUFO edge may reach a graph the ODR-0029 regime closes over (`rdfs:subClassOf`); `gufo:Kind` carries such axioms, so the alignment is referenced-not-imported, annotation-graph, never reasoned (the `prov:Entity` precedent).
* **Byte-identity discipline** — the relocation moves ~87 triples between files; the byte-identity baseline must be re-pinned with all gates (incl. the new 6th check) green.
* **Read-side projection** — pages must render off either a string or a concept value, so the SSG never forces a modelling choice or entrenches the layer.

## Considered Options

* **Option A (chosen) — Atomic quarantine restoration + gUFO-alignment scheme + 6th gate, in the annotation graph.** Retype + relocate + gate together; mint `opda:UFOCategoryScheme` (referenced-not-imported) behind the gate; split the register axis; ship the disclosure; pages stay read-side projections; re-pin byte-identity.
* **Option B — Retype to `owl:AnnotationProperty` but leave the tags in the class files.** Rejected: typing alone does not satisfy ODR-0030 Rule 1's *placement* requirement; the tags still sit in the graph the regime unions over, so the breach persists and the 6th gate would fail.
* **Option C — Add a `sh:in` shape over the strings in place (no relocation, no scheme).** Rejected: a `ufoCategory` `sh:in` in the instance-validation union puts the predicate *into* SHACL — re-firing trigger (i) a second way — and leaves the declaration in the class graph.
* **Option D — Fold the change into ADR-0044 as a Phase 5d in-place rewrite.** Rejected: the change has distinct council provenance (session-041), corrects a committed phase, and spans the emitter/CI/scheme surface beyond ADR-0044's web-pages scope; a citing-and-correcting record is cleaner than rewriting committed history.

## Decision Outcome

Chosen option: **"Option A — atomic quarantine restoration + gUFO-alignment scheme + 6th gate"**, because it is the only option that satisfies ODR-0030 Rule 1's *placement* requirement (not just typing), enforces it in CI (not on paper), and lands the ODR-0031 enrichment behind the restored quarantine in one coherent, byte-identity-re-pinned change.

The change-set (the answer to "what changes do we need to make"):

| # | Change | Target |
|---|---|---|
| 1 | Retype `opda:ufoCategory` `owl:DatatypeProperty` → **`owl:AnnotationProperty`**; drop `rdfs:range xsd:string` (or retain only under the string-range residual, §R-residual) | `tools/opda-gen/src/opda_gen/emitters/foundation.py` (~L523) |
| 2 | **Relocate the declaration** out of the foundation class graph into the annotation-graph emitter | `foundation.py` → `emitters/annotations.py` |
| 3 | **Relocate all ~87 per-term tags** — `annotate_ufo_categories()` must add to the **annotation** graph, not the class graph (its callers in `emit_module` / `build_classes_graph` route to the `*-annotations.ttl` graph) | `emitters/ufo_categories.py` + callers |
| 4 | **Add CI check 6** to the three-graph gate: `ASK { GRAPH opda:classes { ?s opda:ufoCategory ?o } } → FALSE`, generalised to the advisory-predicate family (no advisory predicate in the classes graph) | `tools/opda-gen/src/opda_gen/ci/three_graph_test.py` + `tests/test_three_graph.py` |
| 5 | **Mint `opda:UFOCategoryScheme`** — 9 `skos:Concept`s, each with `skos:prefLabel`, `skos:notation` (the label, for keying/`sh:in`), `skos:definition` (the OntoClean signature), `skos:exactMatch`/`closeMatch` → gUFO IRI, DOLCE lineage where applicable. Annotation-graph; referenced-not-imported (no `owl:imports gufo:`); behind the 6th gate; never reasoned | `emitters/annotations.py` |
| 6 | **Split the register-deference scheme axis** (35× `"Quale-in-Region"` + the other scheme tags, ODR-0030 Rule 2) off `opda:ufoCategory` to a documentary `skos:scopeNote`/distinct predicate; fix the `SubstanceKindLabel` typo-drift | `emitters/vocabularies.py` (~L2800) |
| 7 | **Ship the ODR-0030 Rule-7(b) disclosure** — the three-part DOLCE/WonderWeb-D18 lineage — on the predicate `scopeNote` and the `/pdtf/ufoCategory` term page | `foundation.py`/`annotations.py` + Astro |
| 8 | **Pages as read-side SPARQL projections** — `/pdtf/ufoCategory`, `/ontology/category/{slug}`, per-term badges render off either a string or a concept value; badges read "classified-under", every upper-ontology surface leads with "UFO-informed, not UFO-grounded" | `src/pages/ontology/category/[slug].astro`, `/pdtf` term page, badge component |
| 9 | **Re-pin byte-identity** — re-emit; the relocation moves ~87 triples between files; re-pin the baseline; all gates green (three-graph incl. check 6, dup-declaration, profile-contract, baspi5-roundtrip, pytest) | `make ci-ontology` |

**Predicate-range residual (operator-decidable, ODR-0031 R1/R7b).** `opda:ufoCategory`'s value is either a **governed `xsd:string` + `sh:in`** (the convergence's recommendation — predicate consumers stay simple, the scheme concept is the mapping anchor) **or** the **concept IRI** (value-promotion). Both are quarantine-equivalent. The `sh:in` guard, if used, is a **tag-only editorial check** over the 9 notations — it must **not** enter the instance-validation SHACL union.

### Consequences

* Good, because ODR-0030 Rule 1 becomes *enforced* (check 6) rather than asserted; the breach cannot silently re-ship, and Cagle's trigger (i) becomes cured rather than fired-and-standing.
* Good, because the categories gain dereferenceable definitions + gUFO `closeMatch` alignment + the DOLCE disclosure, behind the quarantine — the enrichment the operator asked for, with nothing UFO-shaped reaching the reasoner.
* Good, because splitting the register-deference axis retires the double-duty defect and the typo-drift.
* Bad (accepted), because it is a non-trivial emitter refactor + a byte-identity re-pin touching 8+ files, on a layer session-040 called "optional" — justified only while the quarantine + gate hold (Cagle's Option-D revert is otherwise live).
* Neutral, because the **OntoClean meta-property markup** (ODR-0031 R7a, held 3–3) was explicitly **out of scope** here — and [session-042](../ontology/odr/council/session-042-ontoclean-meta-property-markup.md) has since resolved it as **conditional adoption** (mark up iff the canonical-check CI gate ships atomically with the scoped ±R/±I tags), realised in **[ADR-0046](ADR-0046-ontoclean-meta-property-markup.md)** (a new record, not a re-open of this one). This ADR's `opda:UFOCategoryScheme` concepts are the anchor those meta-property tags attach to, and their `skos:definition`s already carry the per-category signature.

### Confirmation

* **Implementation status (2026-06-15): changes 1–9 implemented + gate-validated** (`status: proposed`, pending operator ratification). `ufo_categories.py` rewritten as the single annotation-graph emission point; `foundation.py` / `classes.py` / `vocabularies.py` updated; retyped `owl:AnnotationProperty`; `opda:UFOCategoryScheme` minted (9 concepts, gUFO `closeMatch`, OntoClean definitions); register axis split off; sixth CI gate added (`three_graph_test.py` + tests). Re-emitted: all ~87 `ufoCategory` triples now resolve **only** in `opda-annotations.ttl` (0 in the class/vocab graphs); byte-identity deterministic; `opda-annotations.ttl` riot-valid. Green: full `pytest`, all four `opda-gen` CI gates (incl. the new check 6), `make test`. Web pages updated (honesty verb, "classified-under" badges, retired scheme-`ufoCategory` UI). **Deferred (needs `make build-data` / Fuseki):** regenerating `src/data/ontology-model.json` — the model query is graph-transparent so the class facet already resolves (category pages + badges render off the committed model), but the regen drops the now-unused scheme tags from the JSON and surfaces the new `opda:UFOCategoryScheme` concepts so the category/term pages can render the OntoClean signature + gUFO link.
* **CI check 6** added and green: `ASK { GRAPH opda:classes { ?s opda:ufoCategory ?o } } → FALSE` (and per-module class graphs); the existing five three-graph checks, dup-declaration, profile-contract, and baspi5-roundtrip stay green; `pytest` extended for check 6.
* **Placement:** after re-emission, every `opda:ufoCategory` triple + the declaration resolve only in `opda-annotations.ttl` / `*-annotations.ttl`; `grep -c ufoCategory` on the class/vocab files is 0.
* **Typing + alignment:** `opda:ufoCategory a owl:AnnotationProperty`; the `opda:UFOCategoryScheme` concepts carry `skos:exactMatch`/`closeMatch` to gUFO with **no** `owl:imports gufo:`; no `ufoCategory` triple in the SHACL instance-validation union.
* **Disclosure:** the Rule-7(b) three-part DOLCE disclosure is present on the predicate `scopeNote` + the term page; surfaces read "UFO-informed, not UFO-grounded".
* **Byte-identity** re-pinned; `make ci-ontology` green. Status `proposed`; operator ratifies (jointly with ODR-0031, and the predicate-range residual).

## More Information

* **Realises:** [ODR-0031](../ontology/odr/ODR-0031-ufocategory-upper-ontology-representation.md) (the ontology-modelling decision) — this ADR is its engineering side; the modelling rationale lives there.
* **Council provenance:** [session-041](../ontology/odr/council/session-041-ufocategory-upper-ontology-representation.md) (Full Council; the verified breach finding, the "relocate AND gate, atomically" co-signed disposition, the post-positions convergence, the held 3–3 OntoClean split).
* **Corrects:** [ADR-0044](ADR-0044-ontology-as-web-pages-dereferenceable-entity-detail-pages.md) §Phase 5c — the `ufoCategory` facet placement (reasoned graph) is corrected to the annotation graph here; ADR-0044's web-pages decision otherwise stands.
* **Enforces:** [ODR-0030](../ontology/odr/ODR-0030-foundational-ontology-choice.md) Rule 1 (annotation-graph-only quarantine) + Rule 7(b) (DOLCE disclosure), both found breached in the committed corpus; [ODR-0004](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) §3a (three-graph separation + CI gates); depends on the [ODR-0029](../ontology/odr/ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) entailment boundary and ADR-0034 (the gated gUFO `rdf:type` pass — left as-is; audit clean).
* **External:** OWL 2 Structural Specification (W3C Rec, 2012) §5.5/§10.1; SHACL Core (W3C Rec, 2017) §4.6.1; SKOS Reference (W3C Rec, 2009) §10; Masolo et al., *WonderWeb D18 — DOLCE* (2003); Almeida, Guizzardi, Sales & Fonseca, *gUFO*.

## Follow-ups — CI regression-hardening (Council session-044, 2026-06-15)

The [session-044](../ontology/odr/council/session-044-foundational-ontology-validation.md) validation of the foundational-ontology arc confirmed this ADR's quarantine is **enforced in fact today** (≈40 tags annotation-graph-only, `owl:AnnotationProperty`-inert, all gates green) but found it **under-enforced against regression** on two axes (Knublauch, verified by in-memory injection):

1. **Check 6 scans 8 of the 10 ODR-0029 reasoned-union graphs.** `three_graph_test.py`'s `classes_g` loads `opda-classes.ttl` + the six module TTLs, but **not** `opda-vocabularies.ttl` or `opda-contexts.ttl` — both of which the ODR-0029 closure (`_TBOX_TTLS`) reasons over, and `opda-vocabularies.ttl` is a file the *original* Phase-5c breach reached. A future regression tagging a scheme there would land in the reasoned union and ship green. **Fix:** widen check 6's scanned set to the full reasoned union (add `opda-vocabularies.ttl` + `opda-contexts.ttl`).
2. **No test pins the `opda:ufoCategory` `sh:in` meta-shape out of the instance-validation union.** `UFOCategoryValue_MetaShape` (`opda-shapes.ttl:86`, `sh:targetSubjectsOf opda:ufoCategory`) is correctly a value-space guard today (ODR-0031 R3), but nothing fails CI if a future emitter gives it a `sh:targetClass`/domain-class target — which would re-fire ODR-0030 trigger (i) *into* SHACL undetected. **Fix:** add a TBox-only meta-check that no `ufoCategory` shape acquires a domain-class target.

**Both implemented 2026-06-15** (CI-only — no emitter change, no re-emission needed): check 6's `run_all` now scans the full reasoned union (`reasoned_g` adds `opda-vocabularies.ttl` + `opda-contexts.ttl`), and a new **check 7** (`check_ufocategory_not_instance_keyed`) guards the `sh:in` meta-shape against acquiring a `sh:targetClass`/`sh:targetNode`. Three regression tests added to `tests/test_three_graph.py`; `opda-gen ci-three-graph` is green on the corpus (which was already clean — no false positives). *(Separately, session-044 web-verified the gUFO citation `arXiv:2603.20948` as genuine — the validation personas had wrongly suspected it fabricated; the §External citation here is correct.)*

## Vote and Dissent

This ADR inherits the [session-041](../ontology/odr/council/session-041-ufocategory-upper-ontology-representation.md) verdict (per-question tally Q1 4–2–0 → converged · Q2 5–1–0 → 6–0 on the landing · Q3 5–0–1 · Q4 4–2–0). The engineering change-set above realises the Q1–Q3 dispositions + the Q4 markup triage. **Held / out of scope:** the OntoClean meta-property markup (3–3, routed to a follow-up Reduced Council); the predicate-range residual (operator); Cagle's standing Option-D revert if the quarantine restoration (changes 1–4) is *not* shipped before any enrichment. Status `proposed`; operator ratifies adoption.
