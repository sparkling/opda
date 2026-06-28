---
entityUri: opda:HeatingTypeScheme
kind: scheme
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: logical
title: HeatingTypeScheme
---

# HeatingTypeScheme

## Summary

Classification of a Property's overall heating-system arrangement (central, communal, room-only, or none). [UFO Quale-in-Region / DOLCE Quality-Region]. Steward: Allemang (property-qualities sub-module steward per S008 Q2).
[Concept tier — Property →](../../../concept/property/property.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `Central heating` | Central heating | Whole-property heating distributed from a single central source | OPDA data dictionary |
| `Communal heating system` | Communal heating system | Heating shared between multiple dwellings (e.g. district heating) | OPDA data dictionary |
| `None` | None | No installed heating system | OPDA data dictionary |
| `Room heaters only` | Room heaters only | Heating provided by per-room appliances rather than a central system | OPDA data dictionary |

## Cardinality discipline

Bound by [`Property.heatingType`](../property.md#attributes) (`0..1`, optional). Closed scheme — overlays may subset but may NOT extend.

## Concept hierarchy

![heatingtypescheme--concept-hierarchy](diagrams/heating-type-scheme/heatingtypescheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: HeatingTypeScheme — Concept Hierarchy
    accDescr: Four Quale-in-Region members of HeatingTypeScheme — Central heating, Communal heating system, None, Room heaters only.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[HeatingTypeScheme]:::scheme
    Central["Central heating"]:::member
    Communal["Communal heating system"]:::member
    None["None"]:::member
    RoomHeaters["Room heaters only"]:::member

    S --> Central
    S --> Communal
    S --> None
    S --> RoomHeaters
```

</details>

## Source ODR + ADR

- [ODR-0011 — Enumeration vocabularies](/modelling/odr/odr-0011), §8a UFO meta-category
- [ADR-0010 — SKOS vocabulary emission](/modelling/adr/adr-0010) — implementation
