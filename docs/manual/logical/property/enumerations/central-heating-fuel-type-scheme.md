---
entityUri: opda:CentralHeatingFuelTypeScheme
kind: scheme
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: logical
title: CentralHeatingFuelTypeScheme
---

# CentralHeatingFuelTypeScheme

## Summary

Classification of the fuel used by a Property's central heating system. [UFO Quale-in-Region / DOLCE Quality-Region]. Steward: Allemang (property-qualities sub-module steward per S008 Q2).
[Concept tier — Property →](../../../concept/property/property.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `Biomass` | Biomass | Combustible biological material (e.g. wood pellets) | OPDA data dictionary |
| `Electricity` | Electricity | Electrical heating supplied via the mains electricity network | OPDA data dictionary |
| `LPG` | LPG | Liquefied Petroleum Gas stored on-site for combustion | OPDA data dictionary |
| `Mains gas` | Mains gas | Natural gas supplied via the mains gas network | OPDA data dictionary |
| `Oil` | Oil | Heating oil stored on-site for combustion | OPDA data dictionary |
| `Other` | Other | Fuel type falling outside the standard categories | OPDA data dictionary |

## Cardinality discipline

Bound by [`Property.centralHeatingFuelType`](../property.md#attributes) (`0..1`, optional). Closed scheme — overlays may subset but may NOT extend.

## Concept hierarchy

![centralheatingfueltypescheme--concept-hierarchy](diagrams/central-heating-fuel-type-scheme/centralheatingfueltypescheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: CentralHeatingFuelTypeScheme — Concept Hierarchy
    accDescr: Six Quale-in-Region members of CentralHeatingFuelTypeScheme — Biomass, Electricity, LPG, Mains gas, Oil, Other.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[CentralHeatingFuelTypeScheme]:::scheme
    Biomass[Biomass]:::member
    Electricity[Electricity]:::member
    LPG[LPG]:::member
    MainsGas[Mains gas]:::member
    Oil[Oil]:::member
    Other[Other]:::member

    S --> Biomass
    S --> Electricity
    S --> LPG
    S --> MainsGas
    S --> Oil
    S --> Other
```

</details>

## Source ODR + ADR

- [ODR-0011 — Enumeration vocabularies](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md), §8a UFO meta-category
- [ADR-0010 — SKOS vocabulary emission](../../../adr/ADR-0010-skos-vocabulary-emission.md) — implementation
