---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0046, ODR-0049, ODR-0041, ODR-0059]
implements: []
---

# Independent classification facets

## Context and Problem Statement

OPDA needs to describe what a model element is about, what kind of information it carries, how it changes and how it is governed. A single subject tree cannot answer all these questions without mixing meanings. Working-group ownership is particularly unsuitable as a substitute for intrinsic subject matter.

This is an OPDA method decision adapted from source record 0010 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Classify everything through one subject hierarchy.
- Use a small set of independent, governed classification facets.

## Decision Outcome

Adopt orthogonal classification facets backed by SKOS schemes, with explicit applicability and cardinality. Classification describes model elements; it does not define their identity, subsumption or ownership.

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

### Seven questions

Retain the seven analytical facets: subject area, data classification, lifecycle stage, governance tier, volatility, regulatory relevance and value-chain position. They answer, respectively, what the element is about, what kind of information it carries, when it participates, how tightly it is governed, how often it changes, which obligations are relevant and where it contributes. OPDA must govern property-sector values; the originating organisation’s populated taxonomy is not adopted.

### Cardinality and scheme membership

For an applicable class, subject area, data classification, lifecycle stage, governance tier and volatility are single-valued and required. Regulatory relevance is required and may contain several values, including an explicitly defined none-applicable value. Value-chain position is optional and may contain several values. Every value must belong to the correct scheme. Applicability exceptions require a recorded rationale rather than silently missing annotations.

### Vocabulary contracts

Use locally governed annotation properties with SKOS concept values. Give concepts a preferred label, notation and definition. A facet namespace must disambiguate values without repeating the class or scheme name in every local identifier. Do not manufacture OWL classes for infrastructure facet values: that creates recursive classification obligations.

### Independent axes

A subject area describes intrinsic aboutness, independently of organisational arrangement. Finance-related information does not cease to be financial when used by conveyancing. Avoid catch-all branches. Empty prospective subdivisions may be justified by a designed taxonomy; existing branches and prospective structure need different evidence.

### Identity and correspondence

Classify roles and phases without turning their bearer relationship into subclass inheritance. Cross-context mappings remain independently reviewed assertions. A shared label or business key does not establish identity, and a classification facet never authorises a merge.

### Example

A valuation report can be classified by subject, information type, lifecycle and sensitivity-relevant obligations while belonging to a surveying context. These classifications do not make the report identical to the building it describes. The example proposes no approved vocabulary values.

## More Information

- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0049](ODR-0049-cat5-classification-metadata-pipeline-adoption.md) — related local method decision.
- [ODR-0041](ODR-0041-role-view-modeling-pattern.md) — related local method decision.
- [ODR-0059](ODR-0059-cross-context-identity-criterion-protocol.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
