---
entityUri: opda:AddressVariantScheme
kind: scheme
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: logical
title: AddressVariantScheme
---

# AddressVariantScheme

## Summary

Quality Values for the variant under which an Address is presented (`marketing`, `title`, `inspire`, `postal`). Each variant particularises an underlying Address Substance Kind per ODR-0015 §Q1. [UFO Quality Value]. Steward: Guizzardi (S015 Q1).
[Concept tier — Address →](../../../concept/property/address.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `inspire` | inspire | INSPIRE Directive variant — the regulated postal address structure published by INSPIRE-aligned registers (administrative boundary alignment) | [ODR-0015 §2a](/modelling/odr/odr-0015) |
| `marketing` | marketing | Marketing-presentation variant (estate-agent advertising format; typically de-formalised street name + town) | [ODR-0015 §2a](/modelling/odr/odr-0015) |
| `postal` | postal | Royal Mail PAF-formatted variant (the address as recognised by Royal Mail's Postcode Address File) | [ODR-0015 §2a](/modelling/odr/odr-0015) |
| `title` | title | HM Land Registry registered-title variant (the address as recorded against the title at HMLR) | [ODR-0015 §2a](/modelling/odr/odr-0015) |

## Cardinality discipline

Bound by [`Address.addressVariant`](../address.md#attributes) (`1..1`, identity-bearing). Closed scheme — overlays may subset (e.g. BASPI5 may restrict to {`marketing`, `title`} for sales-context Address payloads) but may NOT extend beyond the four members ratified at S015 Q1.

## Concept hierarchy

![addressvariantscheme--concept-hierarchy](diagrams/address-variant-scheme/addressvariantscheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: AddressVariantScheme — Concept Hierarchy
    accDescr: Four Quality Value members of AddressVariantScheme — inspire, marketing, postal, title.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[AddressVariantScheme]:::scheme
    inspire[inspire]:::member
    marketing[marketing]:::member
    postal[postal]:::member
    title[title]:::member

    S --> inspire
    S --> marketing
    S --> postal
    S --> title
```

</details>

## Source ODR + ADR

- [ODR-0015 — Address](/modelling/odr/odr-0015), §2a Address variant
- [ADR-0010 — SKOS vocabulary emission](/modelling/adr/adr-0010) — implementation
