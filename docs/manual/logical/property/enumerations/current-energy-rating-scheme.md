---
entityUri: opda:CurrentEnergyRatingScheme
kind: scheme
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: logical
title: CurrentEnergyRatingScheme
---

# CurrentEnergyRatingScheme

## Summary

EPC current energy rating banding (A–G) published by DESNZ (Department for Energy Security and Net Zero) for residential properties in England & Wales. [UFO Quale-in-Region / DOLCE Quality-Region]. Verbatim source: DESNZ Energy Performance Certificate guidance. Steward: Baker (regulator-cited per ODR-0011 §4a; DESNZ-governed).
[Concept tier — Property →](../../../concept/property/property.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `A` | A | EPC current energy rating band A as defined by DESNZ | [gov.uk EPC guidance](https://www.gov.uk/government/publications/guide-to-energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings) |
| `B` | B | EPC current energy rating band B as defined by DESNZ | [gov.uk EPC guidance](https://www.gov.uk/government/publications/guide-to-energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings) |
| `C` | C | EPC current energy rating band C as defined by DESNZ | [gov.uk EPC guidance](https://www.gov.uk/government/publications/guide-to-energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings) |
| `D` | D | EPC current energy rating band D as defined by DESNZ | [gov.uk EPC guidance](https://www.gov.uk/government/publications/guide-to-energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings) |
| `E` | E | EPC current energy rating band E as defined by DESNZ | [gov.uk EPC guidance](https://www.gov.uk/government/publications/guide-to-energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings) |
| `F` | F | EPC current energy rating band F as defined by DESNZ | [gov.uk EPC guidance](https://www.gov.uk/government/publications/guide-to-energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings) |
| `G` | G | EPC current energy rating band G as defined by DESNZ | [gov.uk EPC guidance](https://www.gov.uk/government/publications/guide-to-energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings) |

## Cardinality discipline

Bound by [`Property.currentEnergyRating`](../property.md#attributes) (`0..1`, optional). Closed scheme — DESNZ-governed; members track upstream regulator changes only.

## Concept hierarchy

![currentenergyratingscheme--concept-hierarchy](diagrams/current-energy-rating-scheme/currentenergyratingscheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: CurrentEnergyRatingScheme — Concept Hierarchy
    accDescr: Seven Quale-in-Region members of CurrentEnergyRatingScheme — EPC bands A through G as defined by DESNZ.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[CurrentEnergyRatingScheme]:::scheme
    A[A]:::member
    B[B]:::member
    C[C]:::member
    D[D]:::member
    E[E]:::member
    F[F]:::member
    G[G]:::member

    S --> A
    S --> B
    S --> C
    S --> D
    S --> E
    S --> F
    S --> G
```

</details>

## Source ODR + ADR

- [ODR-0011 — Enumeration vocabularies](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md), §4a regulator-citation discipline
- [ADR-0010 — SKOS vocabulary emission](../../../adr/ADR-0010-skos-vocabulary-emission.md) — implementation
