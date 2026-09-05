---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0045, ODR-0041, ODR-0056, ODR-0059, ODR-0064]
implements: []
---

# Independent contexts with explicit semantic bridges

## Context and Problem Statement

Conveyancing, lending and surveying may describe overlapping property situations with different responsibilities, evidence and vocabulary. A compulsory universal class loses those differences; completely isolated models leave their relationships implicit.

This is an OPDA method decision adapted from source record 0015 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Share all class definitions through imported modules.
- Keep isolated models without correspondence.
- Keep context-owned definitions and publish reviewed semantic bridges.

## Decision Outcome

Each bounded context owns its classes, properties and enumeration schemes. Maintain independent evolution and explicit cross-context mappings, qualified by the local identity and provenance decisions.

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

### Context ownership

A context’s namespace represents authority over meaning. Do not place another context’s specific classes in it or create mandatory cross-context owl:imports dependency chains. Contexts must be capable of being loaded and validated independently.

### Correspondence

Use reviewed SKOS mapping relations for conceptual correspondence across contexts. exactMatch is transitive and symmetric, closeMatch is weaker, and broadMatch/narrowMatch express directed conceptual hierarchy. Neither shared names nor different attribute counts establish the predicate. Apply the identity protocol and SSSOM qualification.

### Identifiers

Stable business identifiers support joins between independently identified views. They are evidence about correspondence, not self-proving identity criteria. A property name need not be identical in two contexts: record the paired key properties and the authority of the identifier system.

### Intentional duplication and sharing

Locally distinct enumeration schemes can remain separate when their owners and scope differ. Promotion into shared material requires justified identical meaning and the identity/promotion criteria; duplication alone is not sufficient reason. A shared element must have an accountable owner and explicit change process.

### Boundary correction

When systems participate in one governed ubiquitous language, resolve their differences inside that context using kinds, roles and phases. Do not create artificial cross-context mappings solely because evidence came from different systems. Irreconcilable languages with no reconciliation authority can justify separate contexts.

### Prohibited shortcuts

Do not equate context classes with owl:sameAs or use owl:equivalentClass to bypass autonomy. Do not simulate equivalence through paired cross-context subclass assertions. These commitments propagate meaning beyond the mapping’s intended strength.

## More Information

- [ODR-0045](ODR-0045-bounded-context-boundary-criteria.md) — related local method decision.
- [ODR-0041](ODR-0041-role-view-modeling-pattern.md) — related local method decision.
- [ODR-0056](ODR-0056-sssom-cat8-mapping-provenance.md) — related local method decision.
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
