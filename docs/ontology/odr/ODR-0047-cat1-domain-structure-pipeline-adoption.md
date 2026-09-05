---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0046, ODR-0037, ODR-0041, ODR-0042, ODR-0043, ODR-0049, ODR-0050, ODR-0061, ODR-0062, ODR-0063]
implements: []
---

# Domain structure uses one modelling standard

## Context and Problem Statement

Human-authored classes and machine-proposed classes must be judged against the same semantics. Extracting a source structure does not establish that its inheritance, identity or terminology is suitable for the property model.

This is an OPDA method decision adapted from source record 0071a at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Give generated classes weaker modelling requirements.
- Automatically publish extracted structures.
- Apply the same structural rules and retain proposals in a draft scope until reviewed.

## Decision Outcome

Domain structure comprises the adopted OWL/RDFS assertions, governed by the local construct, identity and property-placement decisions. Generated content gains no special semantic exemption.

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

### Proposal boundary

A builder proposes classes, properties and structural relations. They become adopted domain content only after human review and the applicable governance decision. Confidence qualifies evidence, not the meaning of a subclass axiom.

### Structural rules

Apply the bounded OWL profile, truthful property applicability, kind/role/phase distinctions, introducing-class placement and identity protocol. A mistaken subclass can propagate to many instances under selected inference; source inheritance is never accepted merely because it compiles.

### Draft classification

A builder may suggest data classification, lifecycle and volatility from explicit source stereotypes. The source profile maps entity to master/slowly-changing, value object to reference/static, and event to transactional/volatile, with runtime lifecycle for operational code. These are scoped extraction conventions requiring applicability review, not universal truths about every entity or value object.

### Human classification

Subject area, governance tier, regulatory relevance and value-chain position require domain judgement. Do not invent Unknown or Unassigned concepts to pass a gate. Incomplete proposals stay in a draft graph with visible editorial status and validation results.

### Shapes and metadata

The selected target builder profile uses dual-typed sh:ShapeClass and owl:Class resources with inline property constraints. Emit justified structural datatype, required/nullable cardinality and semantic pattern constraints; do not copy storage-layout restrictions. Preserve source documentation as reviewable descriptions and proposed definitions. UI editor/viewer/group choices remain human curation.

### Category boundary

OWL assertions belong to domain structure; inline constraints belong to validation even on the same resource. Labels, facets and confidence retain their own concerns. Removing constraints must not change the RDF identity of a class.

### Analytical typing

Foundational typing is an analytical classification, not inherited external class ancestry. Historical source scheme arrangements do not override the later local organising and no-subsumption records. Require the selected canonical analytical vocabulary before claiming builder conformance.

## More Information

- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0037](ODR-0037-domain-range-as-documentation.md) — related local method decision.
- [ODR-0041](ODR-0041-role-view-modeling-pattern.md) — related local method decision.
- [ODR-0042](ODR-0042-property-distribution-across-ontological-levels.md) — related local method decision.
- [ODR-0043](ODR-0043-owl-as-documentation-framework.md) — related local method decision.
- [ODR-0049](ODR-0049-cat5-classification-metadata-pipeline-adoption.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.
- [ODR-0061](ODR-0061-ontoclean-four-axis-shape-buildout.md) — related local method decision.
- [ODR-0062](ODR-0062-organising-architecture-co-equal-axes-and-register.md) — related local method decision.
- [ODR-0063](ODR-0063-no-foundational-grounding-by-subsumption.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
