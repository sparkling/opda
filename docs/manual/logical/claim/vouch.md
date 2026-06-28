---
entityUri: opda:Vouch
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: logical
title: Vouch
---

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

![vouch--entity-relationship-diagram](diagrams/vouch/vouch--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Vouch — Entity-Relationship Diagram
    accDescr: Short-name alias view — Vouch is owl:equivalentClass of VouchEvidence.

    VouchEvidence ||--|| Vouch : "owl:equivalentClass"
```

</details>

## Source ODR + ADR

- [ODR-0009 — Claims + Evidence + Verification](/modelling/odr/odr-0009), §Q1 + ADR-0011 short-name alias pattern (option b)
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — implementation
