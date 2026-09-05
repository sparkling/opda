---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0036, ODR-0046, ODR-0047, ODR-0050, ODR-0054, ODR-0055]
implements: []
---

# Govern classification metadata independently

## Context and Problem Statement

A model’s classification system should remain stable while new classes are proposed. Generated content must not create extra facets or silently assign business meaning from source folder names.

This is an OPDA method decision adapted from source record 0071e at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Generate classifications directly from code paths.
- Relax requirements for extracted classes.
- Use the governed facet system with draft proposals and human assignment.

## Decision Outcome

Apply the same classification vocabulary and constraints to all applicable classes. Generated suggestions are advisory, and publication completeness is assessed against an explicit profile.

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

### Scheme purpose

Retain the seven independent facet questions of ODR-0036. Classifications describe model elements and can drive review requirements; they are not the organisations or domain entities being classified. Filter infrastructure/non-domain resources before applying domain-class requirements.

### Closure roles

Distinguish Closed, OpenEnded and Classification scheme roles. Closed values require a decision amendment to extend; OpenEnded values can grow under normal stewardship; Classification is an editorial taxonomy whose members may express mandatory or recommended metadata policy. It bundles extensibility and policy role for convenience, not as an ontological primitive.

### Scope of policy

Classification metadata may describe mandatory/recommended properties, but this does not adopt the excluded governance-ontology category or its generator. Any local policy consumer requires an explicit implementation decision. Retired source layer schemes and organisation-specific readiness schemes are not copied as active OPDA vocabularies.

### Human assignment

A builder must not assert subject area from a module path. It may record an editorial candidate with provenance and an explicitly advisory confidence. Governance and regulatory assignments require human judgement; extraction defaults are provisional and cannot establish a legal or governance conclusion.

### Draft gate

Keep incomplete classifications in a draft scope, with violations forming the review queue. Do not lower validation severity based on the origin of a class. Promotion requires the selected publication profile to be satisfied.

### Cardinality reconciliation

The base facet pattern makes value-chain position optional, whereas the source generated-publication profile requires all seven facets assigned. Preserve that distinction explicitly: a generated package claiming that stricter profile must meet it. Do not silently convert the base optional cardinality into a universal requirement or silently weaken the stricter profile.

### Corrected suggested values

Where the stereotype heuristic is applicable, entity volatility is SlowlyChanging, never an undefined Moderate value; value object is Static and event Volatile. Source defaults Local governance and None regulatory relevance are draft suggestions requiring review, not permission to bypass the publication decision.

### Classification versus confidentiality

Data classification distinguishes master/reference/transactional/analytical information. Confidentiality and privacy belong to the sensitivity concern. A sensitivity chip in a UI does not create an eighth facet.

## More Information

- [ODR-0036](ODR-0036-multi-faceted-classification-framework.md) — related local method decision.
- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0047](ODR-0047-cat1-domain-structure-pipeline-adoption.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.
- [ODR-0054](ODR-0054-cat11-access-control-data-sensitivity-adoption.md) — related local method decision.
- [ODR-0055](ODR-0055-dublin-core-cat5-annotation.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
