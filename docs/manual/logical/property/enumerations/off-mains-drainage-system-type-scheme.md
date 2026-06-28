---
entityUri: opda:OffMainsDrainageSystemTypeScheme
kind: scheme
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: logical
title: OffMainsDrainageSystemTypeScheme
---

# OffMainsDrainageSystemTypeScheme

## Summary

Classification of a Property's off-mains drainage system (SuDS / Septic tank / Cesspit / Sewerage treatment plant / Other / Not known). [UFO Quale-in-Region / DOLCE Quality-Region]. Applies only when the Property is not connected to the mains sewerage system. Steward: Allemang (property-qualities sub-module steward per S008 Q2).
[Concept tier — Property →](../../../concept/property/property.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `Cesspit` | Cesspit | On-site cesspit (sealed underground container) collecting foul sewerage for periodic removal | OPDA data dictionary |
| `Not known` | Not known | Off-mains drainage system type is not known to the Seller | OPDA data dictionary |
| `Other` | Other | Drainage type falling outside the standard off-mains categories | OPDA data dictionary |
| `Septic tank` | Septic tank | On-site septic-tank treatment for foul sewerage | OPDA data dictionary |
| `Sewerage treatment plant` | Sewerage treatment plant | On-site sewerage treatment plant treating foul sewerage before discharge | OPDA data dictionary |
| `Sustainable Drainage System` | Sustainable Drainage System | Drainage routed to a SuDS designed to manage surface water close to source | OPDA data dictionary |

## Cardinality discipline

Bound by [`Property.offMainsDrainageSystemType`](../property.md#attributes) (`0..1`, optional; conditional on not-connected-to-mains). Closed scheme — overlays may subset but may NOT extend.

## Concept hierarchy

![offmainsdrainagesystemtypescheme--concept-hierarchy](diagrams/off-mains-drainage-system-type-scheme/offmainsdrainagesystemtypescheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: OffMainsDrainageSystemTypeScheme — Concept Hierarchy
    accDescr: Six Quale-in-Region members of OffMainsDrainageSystemTypeScheme — Cesspit, Not known, Other, Septic tank, Sewerage treatment plant, Sustainable Drainage System.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[OffMainsDrainageSystemTypeScheme]:::scheme
    Cesspit[Cesspit]:::member
    NotKnown["Not known"]:::member
    Other[Other]:::member
    Septic["Septic tank"]:::member
    Treatment["Sewerage treatment plant"]:::member
    SuDS["Sustainable Drainage System"]:::member

    S --> Cesspit
    S --> NotKnown
    S --> Other
    S --> Septic
    S --> Treatment
    S --> SuDS
```

</details>

## Source ODR + ADR

- [ODR-0011 — Enumeration vocabularies](/modelling/odr/odr-0011), §8a UFO meta-category
- [ADR-0010 — SKOS vocabulary emission](/modelling/adr/adr-0010) — implementation
