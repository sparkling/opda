# Vouch

## Summary

Short-name alias for [VouchEvidence](./vouch-evidence.md) retained for exemplar compatibility. [Substance Kind (informational; alias)]. `owl:equivalentClass` binding ensures one OWL identity.
[Concept tier →](../../concept/claim/vouch.md)

## Attributes

Inherits all attributes from `VouchEvidence` via `owl:equivalentClass` binding.

## Relationships

Inherits all relationships from `VouchEvidence` via `owl:equivalentClass` binding (including `attestedBy`).

## Identity key

Same identity as `VouchEvidence`.

## Constraints

Inherits all constraints from `VouchEvidence`.

## Derived attributes

None.

## ER diagram

```mermaid
erDiagram
    VouchEvidence ||--|| Vouch : "owl:equivalentClass"
```

## Source ODR + ADR

- [ODR-0009 — Claims + Evidence + Verification](../../../ontology/odr/ODR-0009-claims-evidence-verification.md), §Q1 + ADR-0011 short-name alias pattern (option b)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md) — implementation
