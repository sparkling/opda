---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0040, ODR-0036, ODR-0048]
implements: []
---

# SKOS enumerations with SHACL closure

## Context and Problem Statement

Working groups need to maintain defined choices without encoding each change as an OWL class expression. The vocabulary’s meanings and a particular submission’s allowed values are separate concerns.

This is an OPDA method decision adapted from source record 0016 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Use owl:oneOf closed class expressions.
- Use unorganised named individuals.
- Use SKOS concept schemes and explicit SHACL membership constraints.

## Decision Outcome

Represent governed enumerations using SKOS ConceptScheme and Concept resources. Enforce the allowed set with sh:in, and coordinate the scheme and validation changes.

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

### Meaningful values

Every concept has scheme membership, a preferred label and exactly one applicable definition. Flat enumeration values are top concepts; hierarchical taxonomy members have their proper broader/top relationships. Use alternative labels for recognised synonyms rather than duplicate concepts.

### Closure

Use sh:in when the list is closed. SKOS membership alone does not impose closed-world membership, and adding a concept to a scheme does not automatically authorise it in an existing delivery profile.

### Coordinated changes

Changing an allowed enumeration updates the vocabulary and the corresponding constraint list in the same reviewed change. Validate that all listed values exist and that the intended allowed set matches its scheme/profile. An intentionally narrower profile must say so.

### Open taxonomies

A taxonomy may be structurally designed before all members are populated. Label closed enumerations and open schemes accurately. Do not impose sh:in on open populations or describe a structural taxonomy as a complete list.

### Ownership and identifiers

Use stable ontology vocabulary identifiers for ontology-owned values and per-scheme prefixes for readable Turtle. A rename of a label must not change identity. Context-specific schemes remain context-owned unless promotion into shared material is separately justified.

### Typing boundary

Domain enumeration values follow the dual-typing rule in ODR-0040. Infrastructure classification facets remain exempt. Do not use owl:oneOf for this selected modelling profile.

## More Information

- [ODR-0040](ODR-0040-enumeration-modeling-pattern.md) — related local method decision.
- [ODR-0036](ODR-0036-multi-faceted-classification-framework.md) — related local method decision.
- [ODR-0048](ODR-0048-cat2-vocabulary-taxonomy-pipeline-adoption.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
