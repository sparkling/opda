---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0037, ODR-0039, ODR-0044, ODR-0050]
implements: []
---

# A bounded OWL surface with explicit validation

## Context and Problem Statement

Ontology axioms, delivery constraints and computed facts answer different questions. Treating all OWL as harmless documentation or all constraints as logical axioms makes the resulting model misleading.

This is an OPDA method decision adapted from source record 0030 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Remove most semantic axioms.
- Use unrestricted OWL reasoning and restrictions.
- Publish a bounded semantic vocabulary, validate with SHACL and select materialisation separately.

## Decision Outcome

OWL and RDFS statements retain standard semantics. Permit a bounded construct surface and select its runtime materialisation explicitly. SHACL is the primary closed-world validation layer; rules derive facts.

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

### Permitted surface

Permit classes and typed properties, subclass/subproperty declarations, truthful domain/range, inverse properties, functional and inverse-functional declarations, transitive and symmetric characteristics, pairwise/all-class disjointness, governed equivalence declarations and deprecation. Permission to express a construct is not permission to materialise all its consequences.

### Excluded surface

Exclude owl:Restriction, Boolean class constructors unionOf/intersectionOf/complementOf, OWL cardinality restrictions, oneOf, hasKey and disjointUnionOf. Use SHACL for delivery constraints, SKOS plus sh:in for closed enumerations, and disjointness plus a scoped sh:xone where exhaustive alternatives are required.

### Processing boundary

Only the selected Safe Group is eligible for materialisation. Domain/range inference, functionality-driven identity merging and equivalence propagation are not included. They remain semantic commitments in any published statement, so disabling processing never makes a false axiom acceptable.

### Applicability and alignment

Apply ODR-0037’s exclusive per-side contract. Never use repeated RDFS values as alternatives. Cross-context correspondence uses SKOS and mapping records; paired subclass statements are not a safe workaround for forbidden cross-context equivalence.

### Module declaration

Each ontology header must explain the selected profile: standard semantic commitments, exact enabled rules, and the distinction between validation and derivation. It must not imply an implemented runtime that a candidate has not demonstrated.

### Verification

A semantic lint profile must detect excluded constructs and incompatible property kinds. A package-specific receipt must name the actual processor/ruleset and selected graph scope. Queries over mappings must distinguish asserted from inferred statements to avoid duplicate entailment paths.

### Amendment precedence

The later rule-materialisation adoption supersedes the earlier no-derivation stance. The 28/30 August applicability correction supersedes any claim that disabled reasoning permits alternative-domain RDFS encodings.

## More Information

- [ODR-0037](ODR-0037-domain-range-as-documentation.md) — related local method decision.
- [ODR-0039](ODR-0039-skos-for-enumerations.md) — related local method decision.
- [ODR-0044](ODR-0044-shacl-rules-and-owl-inferencing.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
