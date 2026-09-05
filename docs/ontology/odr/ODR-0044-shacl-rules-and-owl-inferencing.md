---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0043, ODR-0050, ODR-0063]
implements: []
---

# Selective materialisation and SHACL rules

## Context and Problem Statement

A model can derive useful navigation and computed values without enabling every inference rule. The configured processor must match the declared method and preserve the distinction between supplied and derived information.

This is an OPDA method decision adapted from source record 0036 at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- No materialisation.
- A default unrestricted reasoner profile.
- A versioned selective ruleset plus separate SHACL rule artefacts.

## Decision Outcome

Adopt a declared Safe Group for selected entailments and SHACL-AF TripleRule/SPARQLRule for explicit derivation. Keep rule files separate from constraints and make execution evidence part of a package’s implementation claim.

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

### Selected entailments

Include subclass type propagation, subproperty propagation, inverse links, transitive closure, symmetry and disjointness consistency checks. Both directions of an inverse must be handled. Disjointness detects an inconsistency rather than inventing a correcting type.

The seven selected constructs are `rdfs:subClassOf`, `rdfs:subPropertyOf`,
`owl:inverseOf`, `owl:TransitiveProperty`, `owl:SymmetricProperty`,
`owl:AllDisjointClasses` and `owl:disjointWith`. The last two express distinct
forms of the same consistency concern; the seven-construct count must not be
mistaken for seven unrelated algorithms.

### Excluded execution

Do not enable domain/range type materialisation, functionality/inverse-functionality identity merging, or equivalentClass/equivalentProperty propagation. Do not load a vendor default RDFS/OWL profile that silently adds excluded rules. Version the precise executable ruleset.

### Rule layer

TripleRule provides explicit triple templates; SPARQLRule provides CONSTRUCT-based computation. Keep derivation apart from validation constraints and user actions. Rule adoption does not adopt every SHACL-AF feature. Disabling a rule layer must be possible without rewriting the ontology.

### Origin of results

Distinguish assertions from derived facts using graph separation or provenance. Record which inputs, rule version and execution produced a value. A generated display label is derived presentation, not an independently observed fact.

### Cross-context hazard

Two opposite subclass statements create the propagation of equivalence under this very ruleset. Prohibit that workaround across contexts. Use the qualified SKOS mapping profile. Genuine within-context identity or migration requires explicit review, never an assumed exception.

### External vocabularies

Single-direction external vocabulary reuse requires an applicable profile and truthful semantics. It does not override the later prohibition on domain-class inheritance from external upper ontologies. Direct canonical term reuse is separately governed.

### Entailment-aware queries

SKOS subproperty and symmetry entailments may expose several paths to the same correspondence. Queries needing asserted relations must select the assertion graph or explicitly filter entailment duplicates. Do not interpret duplicate query paths as independently curated evidence.

### Implementation evidence

Require positive and negative examples for enabled and excluded rules, with processor version and graph scope. Passing constraints alone does not prove rules ran. An empty rule set does not count as implementation of the selected profile.

## More Information

- [ODR-0043](ODR-0043-owl-as-documentation-framework.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.
- [ODR-0063](ODR-0063-no-foundational-grounding-by-subsumption.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
