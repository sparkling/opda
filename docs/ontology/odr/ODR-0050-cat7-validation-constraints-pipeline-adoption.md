---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0042, ODR-0043, ODR-0044, ODR-0046, ODR-0052, ODR-0053, ODR-0054]
implements: []
---

# One validation framework for authored and generated models

## Context and Problem Statement

Constraints from source evidence and constraints from domain expertise must meet in a predictable validation layer. Interface annotations and publication workflow are separate from the constraints themselves.

This is an OPDA method decision adapted from source record 0071g at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Build a special validator for generated content.
- Conflate validation, form appearance and approval.
- Apply a single SHACL profile with explicit severity and separate rule execution.

## Decision Outcome

Use SHACL for the normative constraint layer, with a declared processor and feature profile. Authoring provenance does not change what a constraint means.

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

### Constraint composition

Combine justified structural and semantic constraints explicitly. SHACL constraints are conjunctive; contradictory requirements can make a shape unsatisfiable and must be detected rather than assumed impossible. Source storage restrictions are not domain constraints.

### Severity

Use Violation for structural failures, Warning for governance/documentation review and Info for suggestions. The owning shape must carry the intended severity so engine results preserve it. Any escalation from advisory to blocking needs an explicit migration rule.

### ShapeClass and separate targets

The target method supports inline property constraints on dual-typed ShapeClass/OWL resources, plus independent NodeShapes for cross-cutting or external vocabulary targets. Flat per-class validation and modest composition follow ODR-0042. A shape resource can also carry semantic metadata without making that metadata a constraint.

### Meta-validation

Validate the shape declarations and builder output as well as domain instances. Require coherent NodeShape, PropertyShape and ConstraintComponent declarations; check documentation and ontology ownership of typed declarations. Targets must detect missing required properties, not select only resources that already possess them.

### Presentation

DASH editor/viewer hints, grouping, display ordering and form appearance are presentation. They do not validate data and are not generated automatically from extraction. Only explicitly needed DASH constraint components belong to the validation profile; DASH is not a W3C standard.

### Rules

Separate SHACL rule materialisation from constraint results. A package must identify any SHACL 1.2/advanced feature and prove processor support. The documentation’s target feature name is not a processor conformance receipt.

### Concern-specific precedence

The provenance record’s later deferred-shape decisions override older lists saying completeness and reified-provenance shapes must already exist. Likewise temporal and sensitivity records own their current scoped validation surfaces. Do not copy historical source counts as OPDA coverage.

### Readiness

Publication readiness is a workflow over validation and human review. It is not a new universal shape or evidence that all selected categories are implemented. Validation can establish structural compliance, not the truth of professional evidence.

## More Information

- [ODR-0042](ODR-0042-property-distribution-across-ontological-levels.md) — related local method decision.
- [ODR-0043](ODR-0043-owl-as-documentation-framework.md) — related local method decision.
- [ODR-0044](ODR-0044-shacl-rules-and-owl-inferencing.md) — related local method decision.
- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0052](ODR-0052-cat9-extraction-provenance-prov-o-adoption.md) — related local method decision.
- [ODR-0053](ODR-0053-cat10-temporal-state-history-adoption.md) — related local method decision.
- [ODR-0054](ODR-0054-cat11-access-control-data-sensitivity-adoption.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
