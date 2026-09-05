---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0043, ODR-0044, ODR-0042]
implements: []
---

# Property applicability and standard RDFS semantics

## Context and Problem Statement

Properties often apply to more than one intended subject or value type. Repeating RDFS domains or ranges means intersection, not alternatives. Disabling an inference engine cannot change the published graph’s meaning.

This is an OPDA method decision adapted from source record 0014 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Leave property applicability unspecified.
- Treat repeated RDFS declarations as alternatives.
- Separate truthful entailments, inclusion hints and validation, with governed exceptional waivers.

## Decision Outcome

Every governed RDF property must document both subject and value applicability. On each side choose exactly one complete mechanism family: a truthful single RDFS IRI, meaningful Schema.org inclusion hints, or a governed waiver.

### Consequences

- Good, because the selected rules provide an explicit contract for reviewing property-model proposals.
- Good, because local decision links make the applicable method available with the website.
- Bad, because authors and implementers must maintain the distinctions and evidence described below.
- Neutral, because accepting this method does not establish conformance of an existing candidate or runtime.

### Confirmation

Implementation pending. This record is accepted as the selected modelling method.
No source validation result, completed checklist, council vote or delivered artefact is
transferred as evidence that OPDA has implemented it.

- [ ] Identify the local ontology/profile artefacts that implement each applicable rule.
- [ ] Record positive and negative conformance evidence against the selected package.
- [ ] Review domain examples and any introduced vocabulary with the responsible working group.
- [ ] Record exclusions, conditional activations and remaining implementation gaps explicitly.

## Rules

### R1 — Truthful RDFS

Allow at most one distinct rdfs:domain IRI and one distinct rdfs:range IRI per governed property. Each must hold for every use. They are entailments, not validation constraints. Blank-node Boolean class expressions are outside the selected profile.

### R2 — Alternatives

Use schema:domainIncludes and schema:rangeIncludes for intended alternatives. These are documentation hints, not entailment or validation. Using their canonical IRIs does not require owl:imports.

### R3 — Closed-world constraints

SHACL owns required types, cardinalities, datatypes, conditional branches and per-target differences. Generated documentation must distinguish RDFS commitments, inclusion hints and SHACL constraints.

### R4 — Property kind

Do not make a datatype property a subproperty of an object property, or the reverse. Imported vocabulary commitments remain relevant to local specialisations even when a local runtime does not materialise them.

### R5 — Complete and exclusive coverage

The contract applies to declared owl:ObjectProperty, owl:DatatypeProperty, owl:AnnotationProperty and rdf:Property resources in governed modules. Decide subject and value sides separately. Never mix RDFS and Schema.org on one side, or either with a waiver. Definitions, property uses, SHACL paths, targets and node kinds do not substitute for applicability documentation.

### R6 — Waivers

A waiver is exactly one non-blank English literal identifying an accepted local ODR and waiver code, the property and side, why no truthful non-trivial RDFS or useful inclusion hint exists, and a review trigger. Use the form ODR-NNNN/WA-CODE — rationale. Generic owl:Thing, rdfs:Resource or unbounded literal ranges are not useful substitutes. A future local waiver vocabulary needs its own governed declaration; this record does not mint it.

### Scoped exception cases

Cross-cutting confidence may span generated resources and reifiers; line numbers may span resources and evidence anchors. Discovery-system metadata may occur at class and instance level, with literal names or IRIs. These are identified waiver cases for their owning local records, not a blanket exemption for all provenance properties.

### Preserved amendment

This adopts the 28 August correction of repeated-domain semantics and the 30 August complete, exclusive two-sided contract. No earlier union convention is retained.

## More Information

- [ODR-0043](ODR-0043-owl-as-documentation-framework.md) — related local method decision.
- [ODR-0044](ODR-0044-shacl-rules-and-owl-inferencing.md) — related local method decision.
- [ODR-0042](ODR-0042-property-distribution-across-ontological-levels.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
