---
status: proposed
date: 2026-06-14
tags: [foundational-ontology, ufo, gufo, ontoclean, dolce, bfo, relator, standards-alignment, honesty]
supersedes: []
depends-on: [ODR-0029, ODR-0011, ODR-0027, ODR-0010, ODR-0004, ADR-0034]
implements: []
kind: architecture
scope: []
council: session-040
---

# Foundational-ontology choice: UFO-as-lens, scoped to the Relator spine

## Context and Problem Statement

The OPDA PDTF ontology rests, in part, on Giancarlo Guizzardi's Unified Foundational Ontology (UFO): the seven-category framework is carried as advisory `opda:ufoCategory` SKOS tags (ODR-0011 §8a), a gated set of gUFO `rdf:type gufo:Quality` markers types five descriptive leaves (ADR-0034), and OntoClean's rigidity / identity / dependence tests are the decision procedure for "OWL subclass vs coded SKOS facet" (ODR-0027). A four-stream sourced review (published critiques of UFO/OntoUML/gUFO/OntoClean; BFO and the UFO-vs-BFO debate; DOLCE/SUMO/GFO/gist and the lightweight alternatives; and the meta-question of whether a data-interchange standard should rest on a foundational ontology at all), published as the `/ontology/foundational-ontology` reference page, surfaced a real decision: **should the standard retain UFO, deepen it, switch to BFO, or drop the foundational layer entirely?**

The decision is not whether to *import* a heavyweight foundation — OPDA never has. UFO is used as a restrained design lens: reasoning is shallow (only `rdfs:subClassOf` type-propagation fires; ODR-0029), domain/range are validated as SHACL rather than inferred, and the gUFO annotations are quarantined to the annotation graph (ODR-0010 §Q7a, ODR-0004 §3a), causally inert in the emitted artefact. Two facts sharpen the question: the layer is a **UFO+DOLCE hybrid** (35 of 47 `ufoCategory` tags read "Quale-in-Region", a DOLCE construct), and the strongest published critique is the gUFO authors' own — UFO's modal/mereological apparatus cannot be captured in decidable OWL 2 DL, so constraints belong in SHACL. The live question is therefore: *is a lens you barely materialise worth its conceptual and maintenance tax, and where exactly does it earn its keep?*

## Decision Drivers

* **Domain fit.** A conveyance is a lattice of roles, claims, obligations, evidence and legal estates; UFO-C (social commitments/claims) and UFO-L (Hohfeldian Claim-Right↔Duty, Power↔Subjection) model these as first-class relational endurants. DOLCE lacks a native relator; BFO must reify obligations as directive information entities.
* **Decidability / soundness.** The gUFO authors (Almeida, Guizzardi, Sales & Fonseca, 2026) show UFO is not faithfully expressible in OWL 2 DL — constraints must move to SHACL/SPARQL. This *validates* the existing ODR-0029 architecture and argues against deepening.
* **No measured benefit, real complexity cost.** Bernabé et al. (2023) found no measurable downstream benefit from foundational ontologies in practice; complexity is the universal cost — an argument against any heavyweight commitment.
* **Revealed preference of real standards.** No property/built-environment interchange standard (PDTF, RICS/OSCRE, IFC/EXPRESS — `ifcOWL` being a widely-criticised after-the-fact projection) rests on a foundational ontology; the successful interchange standards (schema.org, FHIR, GS1, ISO 20022) are pragmatic.
* **Anti-overclaim doctrine.** OPDA's own S035/S036 + the ODR-0029 "RDFS-Plus" rename precedent forbid asserting more than the artefact performs.
* **Standardisation gap.** BFO's only decisive advantage is ISO/IEC 21838-2 standing — relevant only to external interoperability credibility, not modelling correctness.

## Considered Options

* **Option A (chosen) — Retain UFO as a design-time lens, scoped to the Relator/Role/RoleMixin spine.** Keep OntoClean as the subclass-vs-facet decision procedure and the gUFO/`ufoCategory` tags as quarantined, inert provenance; relabel the register-deference tags honestly; layer the standards alignment by maturity.
* **Option B — Deepen to a heavyweight OntoUML / full-UFO import.** Rejected: UFO's apparatus is not capturable in decidable OWL 2 DL (gUFO authors, 2026), so deepening buys modelling ceremony and an undecidability problem with no payoff a property-transaction file can cash.
* **Option C — Switch the foundation to BFO.** Rejected *as a switch*: BFO has no native legal/deontic apparatus and must reify a Claim-Right as a directive information entity; its only decisive win (ISO/IEC 21838-2) is captured by the layered Q3 reserve below without abandoning UFO-L's superior domain fit (and Merrill 2010 shows BFO's interoperability benefits do not require its contested realism).
* **Option D — Drop the foundational layer entirely (pragmatic SHACL+SKOS only).** Rejected as the standing decision, but recorded as the Devil's Advocate's held-as-live position: OntoClean is separable from UFO and the *vocabulary* is droppable — but the **Relator category** is categorially load-bearing (OntoClean is a theory of meta-properties and is silent by construction on "the Relator *founds* the RoleMixins"), so the foundation is *optional*, not *harmful*, and is retained pending the re-open triggers.

## Decision Outcome

Chosen option: **"Retain UFO as a design-time lens, scoped to the Relator/Role/RoleMixin spine"**, because that is the precise locus where UFO does categorial work that OntoClean + SHACL + SKOS cannot reconstruct — and it is exactly the relational-endurant layer where UFO-L's Hohfeldian apparatus, the standard's strongest domain-fit asset, also lives.

The council's adjudication (session-040; Queen Allemang, DA Cagle + Guizzardi, Guarino, Knublauch, Smith) was unanimous after a live cross-examination, but it *scoped* the affirmation rather than rubber-stamping it. The honest account of how UFO is used: **OPDA's modelling process is governed by a UFO/OntoClean decision procedure; the artefact carries an inert provenance record of that governance.** UFO is load-bearing only at the Relator/Role spine (≈ a handful of classes — `opda:Proprietorship`/`opda:Transaction` founding `Seller`/`Buyer`). The council's co-signed refinement is sharper: the strictly irreducible thing is the **relational-reification primitive** (reify the relation as a first-class node that owns the relation's aggregation/modal attributes — proven by the placement of `opda:numberOfSellers` on the `Proprietorship` Relator, `opda-agent.ttl:155`, which OntoClean's *monadic* `+R/+I/+D` cannot derive, having no mediation primitive); **UFO's Relator is OPDA's chosen, apt expression of that primitive, not the unique source** (the corpus cites FIBO Arrangement as a co-precedent on `opda:Transaction`); and the **bounded reason UFO earns the choice is the deontic core** — only UFO+UFO-L natively unifies the reification primitive with Hohfeldian Claim-Right↔Duty correlativity, which this Hohfeld-throughout domain (charges, covenants, easements, offer/acceptance) needs, where FIBO supplies the shape but not the correlativity and BFO must reify a claim-right as a directive information entity. So the standing is **necessary-and-bounded, not pervasive-and-grounding**. OntoClean (separable from UFO, predating it) carries the rigidity/identity calls; and the 35 "Quale-in-Region" tags are **register-deference** (an external authority — EPC, HMLR, INSPIRE — closes the value space), *not* UFO doing categorial work, so they drop the UFO byline. The wire format reasons with nothing UFO-shaped, so the published claim is **"UFO-informed", never "UFO-grounded with guarantees."**

### Consequences

* Good, because the standard keeps the one discipline that demonstrably moved emitted bytes (the OntoClean criterion adjudicated `tenureKind`, `VouchEvidence`, and `RiskAssessment`) while shipping only pragmatic SHACL/SKOS/JSON that stands on its own.
* Good, because it commits no contested metaphysics to the reasoner (the gUFO quarantine), so there is no "forked foundation" cost at runtime and the decision is reversible.
* Good, because the honesty dispositions (UFO-informed; the `scopeNote` lineage; UFO-C flagged least-mature) pre-empt the one credibility risk a working standard cannot afford — overclaiming a guarantee the architecture does not provide.
* Good, because the layered Q3 alignment captures BFO's standardisation upside *if and when* it is actually required, without paying alignment-maintenance tax speculatively or abandoning UFO-L's deontic fit.
* Bad (accepted), because the foundation layer can only be described honestly by enumerating its caveats — the DA's standing point that this is "optional, not load-bearing except at the Relator spine" is recorded as live dissent with falsifiable re-open triggers.
* Neutral, because the retention is conditional: it stands only while the gUFO/`ufoCategory` annotations remain quarantined and CI-enforced outside the reasoned union — the moment that is breached, the retention lapses.

### Confirmation

* The gUFO/`ufoCategory` quarantine stays CI-enforced: the three-graph separation gate (`ASK { GRAPH opda:annotations { ?s a sh:NodeShape } } → FALSE`, ODR-0004 §3a) and the ODR-0029 entailment-closure byte-identity gate both remain green; no `gufo:`/`ufoCategory` triple appears in a graph that drives inference or SHACL.
* The honesty dispositions are realised in the artefact: a machine-readable `skos:scopeNote` on `opda:ufoCategory` (the three-part disclosure below), the "UFO-informed" framing in the `/ontology` prose, and a UFO-C maturity flag — verifiable by re-emission under the byte-identity gate.
* The decision is `proposed`; the operator ratifies adoption. The council shapes the proposal, not its adoption.

## Rules

The dispositions routed from session-040 (all `status: proposed`):

1. **Scoped retention.** UFO is retained as a design-time lens **scoped to the Relator/Role/RoleMixin spine**. The gUFO `rdf:type` markers and `opda:ufoCategory` tags remain **annotation-graph-only** (ODR-0010 §Q7a, ODR-0004 §3a); the ODR-0029 quarantine is load-bearing — **retention lapses if it is breached**.
2. **Register-deference relabel.** The `ufoCategory` tags whose value space is closed by an external authority (EPC bands, HMLR tenure/title codes, INSPIRE classes — the 35 "Quale-in-Region" majority) are coded `sh:in` by register-deference, **not** by a UFO/OntoClean judgement; documentation and the `scopeNote` must stop presenting them as UFO doing categorial work.
3. **No deepening (Q2).** Do not import OntoUML or full UFO; the gUFO authors' OWL-2-DL undecidability finding is the technical warrant. Constraints stay in SHACL.
4. **ADOPT-NOW — IAO information-artefact crosswalk (Q3).** A thin, external, **referenced-not-imported** set of `skos:exactMatch`/`closeMatch`/`rdfs:subClassOf` edges from OPDA's document/record family (title registers, EPCs, searches, requisitions, the `AttachedDocument` line) to `obo:IAO` (document / information-content-entity / directive), in the annotation graph, on the `opda:EPCCertificate rdfs:subClassOf prov:Entity` precedent — **never** `owl:imports`, never reasoned over.
5. **HOLD-IN-RESERVE — BFO upper spine + ISO-21838 credential (Q3).** Co-located with the IAO crosswalk (rule 4) in a **single** quarantined annotation-graph file — *one file, two maturity clocks*, the same `prov:Entity` reference-not-import mechanism. Write the crosswalk spec now; instantiate the edges and bank the "ISO/IEC 21838-aligned" credential **only** when a conformance clause exists on an actual contract/tender the bridge satisfies. Interim honest claim is the narrow true one ("OPDA carries deliberate IAO crosswalks"), never the broad inert one.
6. **Deontic core stays UFO-L (Q3).** Hohfeldian Claim-Right↔Duty (charges, covenants, easements, requisitions) remains UFO-L-shaped; the bridge never touches it.
7. **Honesty dispositions (Q4).** (a) Publish **"UFO-informed"**, not "UFO-grounded with guarantees". (b) Add a `skos:scopeNote` on `opda:ufoCategory` stating: (i) the categories are UFO's; (ii) UFO's quality categories descend from DOLCE's Quality / Quale / Region (Masolo et al., WonderWeb D18, 2003); (iii) the majority of OPDA's tagged properties fall under that DOLCE-derived quality apparatus. (c) Flag **UFO-C** (social/intentional/legal) as the least-mature layer wherever the standard leans on it.
8. **Anti-patterns (do NOT).** Move the gUFO/`ufoCategory` annotations into a reasoned graph; import OntoUML or BFO; bank an "ISO-aligned" credential off inert edges; or present the register-deference quality tags as UFO doing categorial work.

## Vote and Dissent

Council **session-040** (Full Council; `agent-fan-out` with live `SendMessage` cross-talk). Per-question tally, all **6-0-0**:

| Q | Verdict |
|---|---|
| Q1 retain UFO-as-lens | **AFFIRM** — scoped to the Relator/Role spine (OntoClean carries rigidity/identity; the 35 quality tags are register-deference) |
| Q2 don't deepen to OntoUML/full-UFO | **AFFIRM** (unanimous) |
| Q3 BFO/IAO alignment | **LAYERED** — ADOPT-NOW IAO crosswalk · HOLD-IN-RESERVE BFO spine + credential · deontic core = UFO-L |
| Q4 honesty (a/b/c) | **AFFIRM** |

**Held-as-live dissent (Cagle, DA).** OntoClean is strictly separable from UFO, so the foundation *vocabulary* is droppable — the layer is **optional, not harmful**. He WITHDREW the REJECT push because net harm could not be shown at ~zero runtime cost; the dissent is recorded as live with three falsifiable **re-open triggers**: (i) the UFO/`ufoCategory` layer is ever made reasoned-over (moved out of the annotation-graph quarantine into a graph that drives inference or SHACL); (ii) the 35/47 DOLCE-under-a-UFO-label mismatch is shown to have caused a downstream modelling error or maintainer miscategorisation; (iii) maintaining the foundation mapping measurably delays or blocks a council decision. If any trigger fires, Option D (retire the UFO vocabulary; keep OntoClean-as-judgement + SHACL + SKOS) is revisited.

**Knublauch's standing condition.** The AFFIRM is conditional on the gUFO quarantine remaining CI-enforced (three-graph separation + the ODR-0029 regime that excludes domain/range and cannot propagate the advisory types).

## More Information

* **Council transcript:** [session-040 — The foundational-ontology choice](council/session-040-foundational-ontology-choice.md) (full per-question dialectic, the OntoClean≠UFO wedge, the Smith↔Guizzardi Q3 settlement, tally + DA scorecard).
* **Enforced + realised by:** [ODR-0031](ODR-0031-ufocategory-upper-ontology-representation.md) + [ADR-0045](../../adr/ADR-0045-ufocategory-quarantine-restoration-gufo-scheme-sixth-gate.md) (council [session-041](council/session-041-ufocategory-upper-ontology-representation.md)) — **Rule 1** (annotation-graph-only) and **Rule 7(b)** (DOLCE disclosure) were found **breached in the committed corpus** by ADR-0044 Phase 5c; ODR-0031/ADR-0045 restore the quarantine, retype `opda:ufoCategory` `owl:AnnotationProperty`, and add a sixth three-graph CI gate so the breach cannot silently re-ship.
* **Reference page:** `/ontology/foundational-ontology` (`src/pages/ontology/foundational-ontology.astro`) — the sourced critique, the alternatives comparison, and the verdict this ODR records.
* **Depends on / scoped by:** [ODR-0029](ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) (the inference/validation boundary + gUFO quarantine), [ODR-0011](ODR-0011-enumeration-vocabularies.md) §8a (the seven-category framework), [ODR-0027](ODR-0027-classification-roles-inheritance-skos-doctrine.md) (classification-over-inheritance), [ODR-0010](ODR-0010-overlay-profile-mechanism.md) §Q7a + [ODR-0004](ODR-0004-pdtf-ontology-foundation.md) §3a (annotation-graph home / three-graph separation); ADR-0034 (the gated gUFO typing pass).
* **External citations:** Almeida, Guizzardi, Sales & Fonseca, *gUFO: A Gentle Foundational Ontology* (2026) — the OWL-2-DL undecidability warrant; Bernabé et al., *Journal of Biomedical Semantics* (2023) — no-measurable-benefit; Merrill, *Applied Ontology* (2010) — BFO's benefits do not require its realism; Griffo, Almeida & Guizzardi — UFO-L legal relations; Masolo et al., WonderWeb D18 (2003) — the DOLCE quality structure.
