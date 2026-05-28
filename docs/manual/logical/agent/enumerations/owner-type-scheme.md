# OwnerTypeScheme

## Summary

Substance Kind labels discriminating Private individual (`opda:Person`) from Organisation (`opda:Organisation`) as legal owner. Distinct from `RoleScheme` (transactional role) and `TenureKindScheme` (sub-Kind of LegalEstate). [UFO Substance Kind label]. Each member binds to the corresponding UFO Substance Kind via `skos:exactMatch` (NEVER `owl:sameAs` per ODR-0005 Anti-pattern §5). Steward: Guizzardi (S006 Q1).
[Concept tier — Proprietor →](../../../concept/agent/proprietor.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `Organisation` | Organisation | Legal owner is an organisation (`opda:Organisation` Substance Kind, e.g. company, trust, charity) | OPDA data dictionary |
| `Private individual` | Private individual | Legal owner is a natural person (`opda:Person` Substance Kind) | OPDA data dictionary |

## Cardinality discipline

Bound by [`Proprietor.ownerType`](../proprietor.md#attributes) (`0..1`, optional). Members bind to Substance Kind classes via `skos:exactMatch`. Closed scheme — strict two-member binary discriminating natural-person vs organisational legal ownership.

## Concept hierarchy

![ownertypescheme--concept-hierarchy](diagrams/owner-type-scheme/ownertypescheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: OwnerTypeScheme — Concept Hierarchy
    accDescr: Two Substance Kind label members of OwnerTypeScheme — Organisation, Private individual.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[OwnerTypeScheme]:::scheme
    Org[Organisation]:::member
    Private["Private individual"]:::member

    S --> Org
    S --> Private
```

</details>

## Source ODR + ADR

- [ODR-0011 — Enumeration vocabularies](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md), §8a UFO meta-category
- [ADR-0010 — SKOS vocabulary emission](../../../adr/ADR-0010-skos-vocabulary-emission.md) — implementation
