---
status: accepted
date: 2026-09-05
tags: [modelling-method, foundational-analysis, interoperability]
supersedes: []
amends: []
depends-on: [ODR-0043, ODR-0044, ODR-0059, ODR-0061, ODR-0062]
implements: []
---

# Foundational analysis without external upper-ontology subsumption

## Context and Problem Statement

Foundational analysis helps practitioners distinguish identity, roles, dependence
and unity. It does not follow that every domain class should inherit from an
external upper-ontology class. Such inheritance introduces semantic commitments
that the domain has not necessarily made. The selected bounded OWL and SHACL method
needs an explicit boundary between analytical discipline and imported axioms.

## Considered Options

- Use foundational analysis without grounding domain classes by external subsumption.
- Subclass domain concepts under UFO or gUFO.
- Subclass them under BFO, DOLCE or GIST.

## Decision Outcome

Choose analysis without external-upper-ontology subsumption. Preserve meanings
through explicit definitions, reviewed correspondences and local validation, using
the selected vocabulary profiles. This is a positive modelling policy, not a claim
that foundational ontologies are generally unsuitable.

### Consequences

- Good, because domain owners do not silently inherit unreviewed restrictions.
- Good, because foundational quality questions remain accessible without requiring
  contributors to understand an imported class hierarchy.
- Bad, because the method deliberately forgoes that form of foundational inference.
- Neutral, because analytical annotations and reviewed SKOS bridges remain possible.

### Confirmation

Implementation requires a check for prohibited external superclass assertions,
evidence for the selected analytical checks and reviewed correspondence records.
No OPDA candidate conformance, imported foundation or runtime reasoner is asserted
by adopting this record.

## Rules

### R1: No external upper-ontology superclass

Domain classes MUST NOT use `rdfs:subClassOf` to ground themselves in external
UFO, gUFO, BFO, DOLCE or GIST classes. Foundational distinctions may inform
definitions, scope notes and analytical classifications; they must not be smuggled
in as imported axioms. This rule does not prohibit legitimate local subclass
relationships under [ODR-0041](ODR-0041-role-view-modeling-pattern.md).

The concern-organising method in
[ODR-0062](ODR-0062-organising-architecture-co-equal-axes-and-register.md) and the
OntoClean checks in [ODR-0061](ODR-0061-ontoclean-four-axis-shape-buildout.md)
remain required. “Do not import” does not mean “do not analyse”.

### R2: Positive vocabulary and validation boundary

Reuse the selected SKOS, PROV-O, Dublin Core and Schema.org terms where their
semantics fit, and express local delivery constraints in SHACL. Standard vocabulary
semantics remain in force: an unevaluated subclass assertion is not semantically
inert. The selected Safe Group can propagate hierarchy memberships; a richer
consistency checker may expose contradictions from added axioms. Do not claim that
the Safe Group executes every upper-ontology restriction merely because those
restrictions exist.

The source record additionally anchors architecture-description concepts in
ISO/IEC/IEEE 42010. Architecture modelling is outside this OPDA selection, so this
adaptation neither introduces that layer nor claims its implementation. It retains
the no-subsumption principle for the domain-modelling scope actually adopted.

### R3: Correspondence instead of grounding

When a real integration requires relating a local concept to upper-ontology-based
data, use a justified SKOS correspondence such as `closeMatch` or `broadMatch`, not
an external superclass assertion. Apply
[ODR-0059](ODR-0059-cross-context-identity-criterion-protocol.md) and the mapping
evidence profile. A SKOS bridge does not itself prove the entire graph consistent
or erase the mapped terms' meanings; it avoids asserting the prohibited inheritance.

### Scope preservation

Analytical typing or a separately justified inert classification scaffold is not
external subsumption. This record does not automatically adopt any particular
upstream scaffold, enterprise architecture vocabulary or build-time DL lane.
It changes no underlying third-party standard and mints no foundation namespace.

## More Information

- Source-method record: ODR-0118, revision `67174057e6384b79d0b28b7736fe70a66e112895`.

## Amendments

- **2026-09-05 — OPDA adaptation.** Retains the general no-subsumption boundary
  and analytical discipline. Explicitly excludes the source's architecture layer
  and deployment claims, and avoids repeating the overbroad claim that a bounded
  runtime necessarily evaluates all imported restrictions.
