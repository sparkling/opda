---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0047, ODR-0048, ODR-0049, ODR-0050, ODR-0051, ODR-0052, ODR-0053, ODR-0054, ODR-0062]
implements: []
---

# Eight selected modelling concerns

## Context and Problem Statement

A framework needs explicit boundaries so that modelling does not expand whenever another vocabulary becomes available. OPDA selects the concerns required for its property-data method from a broader fourteen-category source framework.

This is an OPDA method decision adapted from source record 0071 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Add vocabularies without a concern model.
- Adopt all fourteen categories wholesale.
- Adopt eight concerns and use explicit criteria for any further extension.

## Decision Outcome

Adopt source category identifiers 1, 2, 5, 7, 8, 9, 10 and 11 as scope labels. Their local authority is the associated OPDA ODR; the labels do not imply adoption of omitted categories or the source implementation.

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

### Selected concerns

1 domain structure: classes, properties and identity; 2 vocabulary and taxonomy: concepts, schemes and labels; 5 classification metadata: independent facets; 7 validation and constraints: SHACL and selected rules; 8 cross-domain mappings: qualified term and strategic relations; 9 provenance and quality: attribution, derivation and confidence; 10 temporal state and history: validity and change; 11 sensitivity and policy: classification and conditional policy.

### Explicit exclusions

Process modelling, service/enterprise architecture, governance/compliance ontology, capability/intent, source mappings and data-product ontology are not adopted. They correspond to source categories 3, 4, 6, 12, 13 and 14. OPDA governance and operational integration still exist, but are not thereby ontology categories in this method.

### Admission criteria

A new concern must demonstrate a distinct domain of discourse, an independent information lifecycle and a separable useful query surface, plus an identifiable external authority or clear ontological-level distinctness. These are evidence requirements, not boxes satisfied by naming an expert or listing a namespace.

### Proportionality

Every package assesses all selected concerns. Reuse an existing artefact or record justified non-applicability; eight concerns do not require eight ontologies, files, teams or pipeline stages. Category boundaries describe meaning rather than dictate storage.

### Two facets, not stacked layers

Content stratum and coupling are separate analytical descriptions. Domain structure and vocabulary are material/peer; classification is meta/peer; validation normative/peer; provenance provenance/cross-cutting; temporal material/cross-cutting; sensitivity normative/cross-cutting. Mapping is a relational concern with cross-cutting coupling and no imposed content stratum. These labels do not determine class identity.

### Triple-level boundaries

One resource may carry domain assertions, constraints, provenance and display annotations. Classify the assertions by their function rather than force the entire resource into one category. Presentation is a cross-cutting concern, not a validation category.

### Research before expansion

Before introducing a new vocabulary or modelling concern, document the competency question, alternatives, canonical terms, local profile, semantic consequences and verification requirements. A vocabulary’s existence is not evidence that OPDA needs it.

### Precedence

The local children establish the selected concern contracts. Later scoped records qualify earlier general rules, especially applicability, mapping provenance, state adjacency and external foundational inheritance. Source category histories and retired schemes are not carried into the local active model.

## More Information

- [ODR-0047](ODR-0047-cat1-domain-structure-pipeline-adoption.md) — related local method decision.
- [ODR-0048](ODR-0048-cat2-vocabulary-taxonomy-pipeline-adoption.md) — related local method decision.
- [ODR-0049](ODR-0049-cat5-classification-metadata-pipeline-adoption.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.
- [ODR-0051](ODR-0051-cat8-cross-domain-mappings-pipeline-adoption.md) — related local method decision.
- [ODR-0052](ODR-0052-cat9-extraction-provenance-prov-o-adoption.md) — related local method decision.
- [ODR-0053](ODR-0053-cat10-temporal-state-history-adoption.md) — related local method decision.
- [ODR-0054](ODR-0054-cat11-access-control-data-sensitivity-adoption.md) — related local method decision.
- [ODR-0062](ODR-0062-organising-architecture-co-equal-axes-and-register.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
