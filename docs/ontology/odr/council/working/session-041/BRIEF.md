# Council Session 041 — Brief: how to represent `opda:ufoCategory` and the upper-ontology layer

**Read this whole file before writing your position.** It is the shared convening block. Your
per-question verdicts go in `docs/ontology/odr/council/working/session-041/<your-id>.md`.

## Proposition (the framing under review)

> OPDA should represent `opda:ufoCategory` — and, by extension, the broader upper-ontology /
> modelling-framework layer (UFO, OntoClean, gUFO, the DOLCE quality lineage, the Relator/Role
> spine, UFO-L deontic correlativity, the IAO/BFO reserve) — as **structured, dereferenceable
> resources** rather than free-text literals: mint a *governed* UFO-category controlled vocabulary
> (SKOS concepts with stable `/pdtf` URIs and `skos:exactMatch`/`closeMatch` edges to gUFO IRIs),
> correct the predicate's markup and graph placement, present it as first-class web pages, and
> extend the same structured-markup treatment to other upper-ontology metadata.

This is the **enrichment** framing. It may be right, partly right, or wrong. The Devil's Advocate
(Cagle) argues the thinnest inert representation is correct and enrichment *entrenches* a layer
session-040 called "optional, droppable."

## The four questions

- **Q1 — String literal vs resource (IRI).** Should `opda:ufoCategory`'s VALUE be a plain
  `xsd:string` literal (status quo: `"Substance Kind"`) or a resource/IRI (a SKOS concept such as
  `opda:SubstanceKindCategory` in a `UFOCategoryScheme`; or a direct reference to a gUFO IRI such
  as `gufo:Kind`)? Weigh: dereferenceability, attachable definitions/scopeNotes, gUFO alignment,
  typo-safety, queryability — against simplicity, "inert provenance tag," and scope-discipline.
  Verdict: AFFIRM (resource) / REVISE (state the exact representation) / REJECT (keep string).

- **Q2 — Markup & graph placement.** Given Q1: (a) Is `owl:DatatypeProperty` the right predicate
  typing, or should it be `owl:AnnotationProperty` (formally non-axiomatic — matching the stated
  "documentary annotation, no logical axioms" intent) or `owl:ObjectProperty` (if resource-valued)?
  (b) **Graph placement (load-bearing).** Should the declaration + the per-term tags live in the
  **annotation graph** (`opda-annotations.ttl`) or is the current placement in the **classes/
  reasoned graph** defensible? (c) Should the value-space be a governed SKOS scheme with stable
  URIs, and should a SHACL `sh:in` shape constrain it?

- **Q3 — Web pages / documentation IA.** How should the site present `ufoCategory` and the upper-
  ontology / modelling-framework layer (UFO, OntoClean, gUFO/DOLCE lineage, the Relator spine, the
  UFO-L deontic apparatus, the IAO/BFO reserve)? Per-category pages + a category index? The single
  `/ontology/foundational-ontology` hub (already exists)? Per-term UFO badges? A dereferenceable
  `/pdtf/ufoCategory` term page? How to present the "UFO-informed, not UFO-grounded" honesty
  disposition (ODR-0030 Rule 7)? Must honour ADR-0044 "ontology as web pages" + ODR-0038.

- **Q4 — What else to mark up.** Beyond `ufoCategory`, which other upper-ontology / modelling-
  framework metadata earns *structured* markup vs staying prose? Candidates: OntoClean meta-
  properties (rigidity +R/−R, identity +I/−I, dependence +D/−D); the gUFO `rdf:type` markers
  (ADR-0034, quarantined); the relational-reification primitive / "Relator founds RoleMixin" edges
  (ODR-0030 calls this "the strictly irreducible thing"); UFO-L Hohfeldian Claim-Right↔Duty
  correlativity; the IAO crosswalk (ODR-0030 Rule 4, adopt-now). Which earn markup, which stay
  prose, and under what graph discipline?

## Established facts (verified from the corpus — you may rely on these; verify any you lean on hard)

1. `opda:ufoCategory` is **currently** declared in `foundation.py` as
   `a owl:DatatypeProperty ; rdfs:range xsd:string` — domain-less, `rdfs:label "UFO category"@en`.
   It dereferences at `https://opda.org.uk/pdtf/ufoCategory` (ADR-0044 Phase 5c).
2. It is doing **double duty** on two different value-spaces:
   - **Class axis (Phase 5c, 39/40 classes):** the 9 UFO endurant/perdurant categories —
     `Substance Kind`, `Information Object`, `Event`, `Relator`, `RoleMixin`, `Role`, `Quality`,
     `Quality Value`, `Collective`. (`opda:SpecialCategoryScheme` is intentionally untagged.)
     Source of truth: `tools/opda-gen/src/opda_gen/emitters/ufo_categories.py`.
   - **Scheme axis (ODR-0011 §8a, 47 schemes):** a *different* vocabulary — 35× `"Quale-in-Region"`,
     plus `"Substance Kind label"`(5), `"Quality Value"`(2), `"Phase label"`(2),
     `"Method/plan code"`(2), `"Role label"`(1).
3. **Graph placement:** every `ufoCategory` triple — class tags AND scheme tags — is asserted in the
   **non-annotation** graphs (the per-module class files `opda-classes.ttl`, `opda-agent.ttl`,
   `opda-claim.ttl`, `opda-property.ttl`, `opda-descriptive.ttl`, `opda-governance.ttl`,
   `opda-transaction.ttl`; and `opda-vocabularies.ttl`). The annotation graph
   `opda-annotations.ttl` carries **zero** `ufoCategory` triples.
4. **ODR-0030 / session-040 (2026-06-14, one day before Phase 5c) decided:**
   - **Rule 1 (Scoped retention):** "The gUFO `rdf:type` markers and `opda:ufoCategory` tags remain
     **annotation-graph-only** (ODR-0010 §Q7a, ODR-0004 §3a); the ODR-0029 quarantine is
     load-bearing — **retention lapses if it is breached**."
   - **Rule 2 (Register-deference relabel):** the 35 "Quale-in-Region" scheme tags are closed by an
     external authority (EPC/HMLR/INSPIRE), are **not** UFO doing categorial work, and "must stop
     presenting them as UFO doing categorial work."
   - **Rule 7 (Honesty):** publish "**UFO-informed**", not "UFO-grounded with guarantees"; a
     `skos:scopeNote` on `opda:ufoCategory` must disclose the DOLCE (WonderWeb D18, 2003) lineage of
     the quality categories; flag UFO-C as least-mature.
   - **Cagle (DA) held-as-live dissent**, with three falsifiable **re-open triggers** — trigger (i):
     "the UFO/`ufoCategory` layer is ever made **reasoned-over** (moved out of the annotation-graph
     quarantine into a graph that drives inference or SHACL)." If any trigger fires, Option D
     (retire the UFO *vocabulary*; keep OntoClean-as-judgement + SHACL + SKOS) is revisited.
   - **Knublauch's standing condition:** the AFFIRM is conditional on the gUFO quarantine remaining
     CI-enforced (three-graph separation gate, ODR-0004 §3a).
5. **ODR-0029 entailment regime** is "RDFS-Plus / shallow": only `rdfs:subClassOf` type-propagation
   fires; domain/range are validated in SHACL, not inferred. So a domain-less, range-`xsd:string`
   datatype property entails *nothing* under the active regime — but it is still **physically in the
   reasoned graph**, which is what Rule 1 / trigger (i) speak to.
6. **ODR-0027 (classification-over-inheritance):** kind-axes ship as facets (`sh:in` via
   `sh:targetSubjectsOf`), NOT subclass trees. `ufoCategory` is an annotation facet, not a class
   hierarchy, consistent with this.
7. **ODR-0004 §3a three-graph separation:** OWL classes ⊥ SHACL shapes ⊥ annotations, with CI ASK
   gates. The annotation graph is the designated quarantine for advisory/inert predicates.
8. **gUFO** (Almeida, Guizzardi, Sales & Fonseca) is a "gentle" OWL 2 rendering of UFO with real
   IRIs (`gufo:Kind`, `gufo:Role`, `gufo:RoleMixin`, `gufo:Relator`, `gufo:Event`, `gufo:Quality`,
   etc.). The gUFO authors themselves show full UFO is **not** faithfully expressible in OWL 2 DL.

## Input documents (read what your lens needs)

- ODR-0030: `docs/ontology/odr/ODR-0030-foundational-ontology-choice.md` (the binding prior).
- session-040: `docs/ontology/odr/council/session-040-foundational-ontology-choice.md` (the dialectic).
- The emitter: `tools/opda-gen/src/opda_gen/emitters/ufo_categories.py` + `foundation.py` (lines ~517–550).
- Emitted TTL: `source/03-standards/ontology/opda-classes.ttl` (line ~90 = the declaration) and
  any `opda-*.ttl` for the inline tags; `opda-annotations.ttl` (the quarantine — currently empty of these).
- ADR-0044 (ontology as web pages): `docs/adr/ADR-0044-*` if present; the handover
  `docs/HANDOVER-2026-06-15-ontology-web-pages-phases-2-8-ufocategory-renames.md`.
- Related ODRs: ODR-0011 §8a (enumeration vocabularies), ODR-0027, ODR-0029, ODR-0004 §3a, ODR-0010 §Q7a.

## How to write your position

For EACH of Q1–Q4, give: (1) your verdict — exactly one of **AFFIRM / REVISE / REJECT** — plus your
ballot **FOR / AGAINST / ABSTAIN** on the proposition as framed (if REVISE, state the precise
amendment); (2) rationale with a **grounded citation inline** (a named W3C/OMG spec + section; a
book you (co-)authored + chapter; a peer-reviewed paper; a deployment you led; or a maintained OSS
project + named convention — **no anonymous "best practice"**); (3) **cross-talk** — explicitly
engage at least one named peer's published position (agree, refine, or rebut). Be concise and
specific. The Queen composes the synthesis from your **actual words** and will not put words in
your mouth — so say what you mean.

Citation grounding is load-bearing: an ungrounded position is **not counted** toward the vote.
