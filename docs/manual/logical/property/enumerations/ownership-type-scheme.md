---
entityUri: opda:OwnershipTypeScheme
kind: scheme
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: logical
title: OwnershipTypeScheme
---

# OwnershipTypeScheme

## Summary

Classification of a legal estate's ownership structure (Freehold, Leasehold, Commonhold, Other). [UFO Quale-in-Region / DOLCE Quality-Region]. NTS2 four-value canonical set used as authority. Steward: Kendall (LegalEstate steward per S008 Q2).
[Concept tier — LegalEstate →](../../../concept/property/legal-estate.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `Commonhold` | Commonhold | Freehold ownership of a unit within a commonhold development, with shared ownership of common parts | OPDA data dictionary |
| `Freehold` | Freehold | Outright ownership of the property and the land it sits on | OPDA data dictionary |
| `Leasehold` | Leasehold | Ownership of the property for a fixed period under a lease from the freeholder | OPDA data dictionary |
| `Other` | Other | Ownership type falling outside the standard categories | OPDA data dictionary |

## Cardinality discipline

Bound by [`LegalEstate.ownershipType`](../legal-estate.md#attributes) (`0..1`, optional). Distinct from `TenureKindScheme` (which is a Substance Kind label binding via `skos:exactMatch` to OWL sub-classes) — this scheme is a Quale-in-Region classifier. Closed scheme.

## Concept hierarchy

![ownershiptypescheme--concept-hierarchy](diagrams/ownership-type-scheme/ownershiptypescheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: OwnershipTypeScheme — Concept Hierarchy
    accDescr: Four Quale-in-Region members of OwnershipTypeScheme — Commonhold, Freehold, Leasehold, Other.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[OwnershipTypeScheme]:::scheme
    Commonhold[Commonhold]:::member
    Freehold[Freehold]:::member
    Leasehold[Leasehold]:::member
    Other[Other]:::member

    S --> Commonhold
    S --> Freehold
    S --> Leasehold
    S --> Other
```

</details>

## Source ODR + ADR

- [ODR-0011 — Enumeration vocabularies](/modelling/odr/odr-0011), §8a UFO meta-category
- [ADR-0010 — SKOS vocabulary emission](/modelling/adr/adr-0010) — implementation
