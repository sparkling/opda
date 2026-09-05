---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0038, ODR-0041, ODR-0059, ODR-0060, ODR-0064]
implements: []
---

# Boundaries follow accountable language

## Context and Problem Statement

Organisational domains, source systems and topical classifications can all be useful views, but none alone establishes a semantic boundary. A bounded context exists where a coherent language can be governed.

This is an OPDA method decision adapted from source record 0040 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Give every source system its own permanent semantic context.
- Assume every organisational domain already shares a language.
- Use the language-and-authority criterion and record provisional harmonisation explicitly.

## Decision Outcome

Use a domain-level context when its terms have a shared governed meaning or active reconciliation authority. Retain separate contexts when meanings are irreconcilable and no such authority exists.

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

### Language criterion

Ask whether practitioners can use a term without adding a system qualifier. If yes, one context is plausible. If no, ask whether an accountable group is actively constructing a shared language. Record unresolved differences while that work proceeds; do not claim harmonisation is complete.

### Flat ownership

Context namespaces are peers. Do not nest system namespaces inside a context or encode an organisational hierarchy into identity. Subject areas are intrinsic topical classifications and governance tiers describe control; both are separate from namespace ownership.

### Onboarding

Inventory source concepts independently as working evidence; compare definitions, granularity, cardinality and lifecycle; resolve within-context differences using kinds, roles and phases; assign topical classification; review cross-context touchpoints; then define scoped shapes. Source extraction is evidence gathering, not automatic adoption.

### Source discovery metadata

Record discovery/maintenance systems as optional, potentially multi-valued provenance at class or instance level. This does not confer semantic ownership. Literal names and system IRIs must follow the local applicability profile; ambiguous mixed forms need an explicit waiver until a governed identifier model is adopted.

Do not copy that discovery-system property onto every domain property. Its source
context follows the class that introduces the property, using applicability and
shape targets to identify that class. Add a newly contributing system to the
class-level provenance; use an editorial note for an exceptional property case.
The mixed class/instance subject and literal/IRI value forms require both the
subject and value waivers, reviewed when the uses are split or a common system
object model is adopted.

### Shared material and demotion

Shared elements require actual cross-context use and compatible meaning. If shared use disappears, development material can move with updated references; published material needs deprecation, replacement guidance and a migration window of at least one release cycle, with removal after consumer migration.

### Strategic and term mappings

The adopted strategic context-map record represents map scope, relationship kind and direction. Individual SKOS/SSSOM mappings remain distinct and link to that relationship only where applicable. A strategic label is not a substitute for term-level correspondence evidence.

### Identity gate

A business-key match cannot override differing identity criteria. Apply ODR-0059 before equivalence or shared promotion. An organisational reorganisation does not by itself require a semantic namespace migration.

## More Information

- [ODR-0038](ODR-0038-bounded-context-autonomy.md) — related local method decision.
- [ODR-0041](ODR-0041-role-view-modeling-pattern.md) — related local method decision.
- [ODR-0059](ODR-0059-cross-context-identity-criterion-protocol.md) — related local method decision.
- [ODR-0060](ODR-0060-data-domain-vs-subject-area-vs-bounded-context.md) — related local method decision.
- [ODR-0064](ODR-0064-sparql-queryable-ddd-context-maps.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
