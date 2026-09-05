---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0038, ODR-0046, ODR-0056, ODR-0058, ODR-0059, ODR-0064]
implements: []
---

# Human-reviewed mappings between contexts

## Context and Problem Statement

An overlap detector can identify similar labels without knowing whether their identity, scope or intended uses agree. The modelling framework needs a distinct place for correspondence and the decisions behind it.

This is an OPDA method decision adapted from source record 0071h at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Automatically assert mappings from similarity scores.
- Record correspondence only in prose.
- Publish human-reviewed SKOS relations with qualified mapping records and strategic context links.

## Decision Outcome

Maintain mappings as a separate bridge concern. Advisory discovery can propose candidates; only reviewed decisions become formal mapping assertions.

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

### Human decision

A builder must not auto-assert SKOS mapping relations. It may record an editorial reconciliation candidate and its evidence. Confidence never decides whether exactMatch, closeMatch or another relation is justified.

### Standard semantics

Use exactMatch, closeMatch, broadMatch, narrowMatch and relatedMatch according to their standard meanings and the identity protocol. exactMatch is transitive; errors can propagate. broadMatch is conceptual hierarchy, not a substitute for rdfs:subClassOf. Do not add relation types just to populate a menu.

### Qualified verdicts

The later SSSOM/SEMAPV and RDF 1.2 records supersede the original editorial-note/date/source-only provenance pattern. Every accepted cross-context verdict carries the adopted minimal profile, source versions, justification and mapping-set release. Preserve the simple SKOS assertion alongside its named reifier.

### Endpoint integrity

Validate subjects and objects of all admitted mapping predicates as IRIs. Checking only subjects of exactMatch misses other directions and weaker predicates. Mapped resources must exist within the declared source/version scope.

### Asymmetric dependency

Mapping depends on the mapped domain resources; those resources do not need to depend on the mapping package. The bridge connects meanings and does not become a replacement owner of either domain model.

### Strategic layer

Qualified context relationships add map scope, direction and DDD patterns. Link only the exact mapping records applicable to a strategic seam. Strategic agreement does not imply every term in one context maps to every term in the other.

### Identifier systems

Record explicit governed identifier-system objects and context governors. Namespace-based systems require an explicit namespace URI under the selected VANN profile. Exact context-scheme membership and object integrity are SHACL requirements; lexical scope notes are insufficient.

### Decision versus extraction provenance

A mapping’s justification explains the human correspondence decision. Extraction provenance explains how evidence was obtained. Both can coexist, but one cannot substitute for the other.

## More Information

- [ODR-0038](ODR-0038-bounded-context-autonomy.md) — related local method decision.
- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0056](ODR-0056-sssom-cat8-mapping-provenance.md) — related local method decision.
- [ODR-0058](ODR-0058-cat8-reification-rdf12-triple-terms.md) — related local method decision.
- [ODR-0059](ODR-0059-cross-context-identity-criterion-protocol.md) — related local method decision.
- [ODR-0064](ODR-0064-sparql-queryable-ddd-context-maps.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
