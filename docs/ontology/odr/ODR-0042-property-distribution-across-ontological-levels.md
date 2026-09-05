---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0037, ODR-0041, ODR-0050, ODR-0053, ODR-0058]
implements: []
---

# Place properties at the level that introduces their meaning

## Context and Problem Statement

Identity-carrying attributes, role-dependent permissions and phase-dependent assessments belong at different analytical levels. A shape inheritance tree can obscure those distinctions, especially when roles are not represented as subclasses.

This is an OPDA method decision adapted from source record 0026 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Hoist properties onto the most general bearer class.
- Inherit long chains of validation shapes.
- Document introducing-class applicability with flat per-class shapes and explicit qualified relationships.

## Decision Outcome

Place each property at the most specific class that introduces its meaning, and make validation target that meaning explicitly. Qualify relationships only when they carry facts of their own.

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

### Applicability

A kind introduces intrinsic properties; a subkind adds permanent specialisation; a role introduces relationally contingent properties; a phase introduces lifecycle-specific properties. Each property side follows ODR-0037: truthful RDFS, alternative inclusion hints or a governed waiver.

### Flat shapes

Give every applicable class its own NodeShape and target, including sparse roles. Do not simulate sh:extends or build deep chains of shape inheritance. Compose genuinely cross-cutting constraints with sh:node after repeated use justifies it; the default extraction threshold is ten classes, with recorded evidence-based exceptions for substantial identical bundles.

### Sparse roles

A role remains a type even when it has few attributes. Its distinctive meaning can be expressed through relationships. Do not replace it with a SKOS concept solely to reduce field count.

### Potential and actual participation

Use explicit multi-valued relationships for eligible roles and played roles, rather than a separate boolean property for each role. Eligibility and current participation have different semantics and must remain independently expressible.

### Qualified relations

A relation carrying dates, context, evidence or exceptions needs a qualified resource. A simple join with no additional meaning can stay a direct object property. Do not reify every association. Temporal qualified assertions use the adopted RDF 1.2 reifier vocabulary where a triple is being reified; a domain relationship object and an RDF reifier are not automatically interchangeable.

### Properties and characteristics

Declare inverse, functional or hierarchy characteristics on the property itself. Their standard meanings persist. Validation of cardinality remains explicit, and characteristics do not spread automatically through role annotations.

### Example

A buyer’s offer-related property belongs to the buyer role; an enduring party identifier belongs to the bearer. A time-bounded appointment with its own evidence warrants a qualified record. These illustrations do not create OPDA ontology terms.

## More Information

- [ODR-0037](ODR-0037-domain-range-as-documentation.md) — related local method decision.
- [ODR-0041](ODR-0041-role-view-modeling-pattern.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.
- [ODR-0053](ODR-0053-cat10-temporal-state-history-adoption.md) — related local method decision.
- [ODR-0058](ODR-0058-cat8-reification-rdf12-triple-terms.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
