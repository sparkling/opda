---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0039, ODR-0038, ODR-0059]
implements: []
---

# Closed enumerations and open reference populations

## Context and Problem Statement

A controlled choice such as an inspection outcome and a changing population of surveyors have different ownership and completeness. Treating both as fixed lists or both as unrestricted typed resources produces incorrect validation.

This is an OPDA method decision adapted from source record 0023 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- SKOS-only domain values.
- OWL-only values without vocabulary management.
- Dual-typed domain enumeration concepts with closure-specific validation.

## Decision Outcome

Use dual-typed concepts for closed domain enumerations and ordinary typed resources for open populations. Choose sh:in for the former and sh:class for the latter.

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

### Closed domain sets

An ontology-owned domain enumeration member is both skos:Concept and an instance of its domain value class. This is normal RDF multi-typing, not punning. Give it preferred label, definition and scheme membership. Closed values belong to the vocabulary namespace, not the instance-identifier namespace.

### Open populations

An open-ended reference is identified as an instance of its domain class. Do not enumerate every instance in sh:in or require SKOS concept typing merely to validate the reference. Use the relevant sh:class and other scoped constraints.

### Facet exemption

Classification-infrastructure values used by annotation properties do not need stub domain classes. Such stubs would recursively need their own facet annotations. Review the exemption if a facet becomes a domain object property.

### URI composition

A convenience prefix resolves to the scheme’s stable namespace; the local name is the value. Do not include unescaped slash syntax in a Turtle prefixed local name. Separate stable identifiers from changing labels.

### Avoid redundant closure

sh:in provides exact IRI closure. Do not routinely add sh:class as a second closed-set membership check without a separate requirement. A new typed individual not present in the allowed list remains invalid for the closed profile.

### Governance

State closed/open status, owner and version. Shared schemes require proven common meaning; they are not produced just by spotting duplicate labels. Call a closed scheme an enumeration in reader-facing guidance, and do not silently apply that label to open populations.

## More Information

- [ODR-0039](ODR-0039-skos-for-enumerations.md) — related local method decision.
- [ODR-0038](ODR-0038-bounded-context-autonomy.md) — related local method decision.
- [ODR-0059](ODR-0059-cross-context-identity-criterion-protocol.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
