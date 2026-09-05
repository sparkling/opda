---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0042, ODR-0045, ODR-0059, ODR-0061, ODR-0063]
implements: []
---

# Kinds, roles and phases

## Context and Problem Statement

A party may act as buyer and seller in different relationships, and a dwelling may pass through lifecycle states while remaining the same thing. Neither occurrence justifies treating every category as a permanent subtype.

This is an OPDA method decision adapted from source record 0025 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Use subclass inheritance for all categories.
- Use role annotations for every specialisation.
- Distinguish kinds and subkinds, roles and phases explicitly.

## Decision Outcome

Use rdfs:subClassOf for genuine permanent subkinds, and governed local roleOf and phaseOf annotations for class-level role and phase relationships. Analyse identity before selecting the encoding.

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

### Kinds and subkinds

A kind supplies the relevant identity criterion. A subkind is a rigid restriction of that kind that retains its identity criterion. Evidence that a category is permanent and intrinsic must support subclass placement; a database table name is insufficient.

### Roles

A role depends on relational context and is anti-rigid: a bearer may stop playing it without ceasing to exist. Several roles may apply simultaneously. Point roleOf at the bearer type; do not create chains of role-of-role declarations where a direct bearer expresses the meaning.

### Phases

A phase is an anti-rigid category associated with intrinsic change over time. A phase does not create a new individual merely because a state changes. phaseOf is a class-level modelling annotation, not an instance state-transition record.

### Identity and keys

Roles inherit the bearer’s identity rather than introduce independent identity keys. Identifier properties may differ by introducing level, but a database key is evidence and not the identity criterion itself. Apply the separate cross-context identity protocol.

### Participation

Distinguish the annotation describing a role class from an instance-level relationship recording actual participation. Use domain verbs for participation, and model time, context or other qualifiers where needed. Eligibility to play a role is separate from currently playing it.

### Evidence and exceptions

Do not derive ontology classes from master/gatekeeper tables mechanically. A boolean flag alone is not sufficient evidence for a meaningful role, although additional role-specific facts or relationships may justify one. Recheck apparent roles for rigid characteristics or genuinely different identity.

### Within-context reconciliation

Resolve system-specific views through these distinctions when they belong to one governed language. Do not preserve accidental system boundaries as distinct semantic namespaces or use SKOS mappings to evade that reconciliation.

## More Information

- [ODR-0042](ODR-0042-property-distribution-across-ontological-levels.md) — related local method decision.
- [ODR-0045](ODR-0045-bounded-context-boundary-criteria.md) — related local method decision.
- [ODR-0059](ODR-0059-cross-context-identity-criterion-protocol.md) — related local method decision.
- [ODR-0061](ODR-0061-ontoclean-four-axis-shape-buildout.md) — related local method decision.
- [ODR-0063](ODR-0063-no-foundational-grounding-by-subsumption.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
