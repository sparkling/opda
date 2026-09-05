---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0046, ODR-0039, ODR-0040, ODR-0051, ODR-0052]
implements: []
---

# Vocabulary and taxonomy from evidence

## Context and Problem Statement

Code enumerations, editorial taxonomies and open reference populations can all supply vocabulary evidence. They must retain their different completeness and naming semantics when proposed through the website or a builder.

This is an OPDA method decision adapted from source record 0071b at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Treat every discovered list as closed.
- Create a separate generated vocabulary model.
- Apply ordinary SKOS rules with conservative closure and human reconciliation.

## Decision Outcome

Use the same SKOS concept and scheme model for authored and generated proposals. Preserve closure, hierarchy and documentation explicitly; cross-context reconciliation belongs to mapping review.

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

### Closure evidence

A genuine programming-language enumeration can support a closed scheme. A runtime-maintained taxonomy supports an open scheme. When closure is not established, default to open-ended. Do not infer closure from a sample file containing only a few values.

### Value exclusions

For bitfield enumerations, model primitive values rather than every composite combination. Exclude technical sentinels such as Unknown, NotSet and Undefined where they express missing knowledge rather than a domain concept; represent optionality with the appropriate validation. A genuinely defined domain absence value needs an explicit semantic justification.

### Hierarchy

Assert skos:broader in the child-to-parent direction. The selected rules may derive narrower and broaderTransitive. Do not confuse conceptual hierarchy with subclass inheritance, physical containment or temporal adjacency. Source stereotypes provide evidence, not a replacement for checking meaning.

### Typing

Closed domain concepts follow ODR-0040 dual typing and sh:in. Open taxonomy concepts remain skos:Concept without invented domain enumeration typing; open reference constraints require the applicable class. Classification facets retain their exemption.

### Documentation

Use notation for source codes/backing values, altLabel for recognised alternative display terms, a reviewed definition for meaning and scopeNote for explanatory context. Retain the full source documentation as evidence; an automatically extracted first sentence remains a proposed definition until reviewed.

### No unnecessary constructs

Do not emit skos:Collection merely because a source container exists. It is a curation construct requiring an intended use. Preferred labels, definitions, scheme membership and top-concept links must be complete for the selected scheme profile.

### Ownership and history

Vocabulary stewards approve value changes. Store change provenance under the provenance concern. Mapping candidates between schemes must not become formal assertions automatically.

## More Information

- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0039](ODR-0039-skos-for-enumerations.md) — related local method decision.
- [ODR-0040](ODR-0040-enumeration-modeling-pattern.md) — related local method decision.
- [ODR-0051](ODR-0051-cat8-cross-domain-mappings-pipeline-adoption.md) — related local method decision.
- [ODR-0052](ODR-0052-cat9-extraction-provenance-prov-o-adoption.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
