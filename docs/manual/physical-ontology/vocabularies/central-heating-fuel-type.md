---
status: proposed
date: 2026-05-28
tags: [physical-ontology, vocabularies, skos, heating]
---

# opda:CentralHeatingFuelTypeScheme

## Summary

Classification of the fuel used by a Property's central heating system. UFO Quale-in-Region. See also: [Concept tier](../../concept/property/property.md) | [Logical tier](../../logical/property/property.md).

## Scheme header

```turtle
opda:CentralHeatingFuelTypeScheme
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Central Heating Fuel Type"@en ;
    skos:definition "Classification of the fuel used by a Property's central heating system."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-8a-ufo-meta-category> ;
    dct:title "Property central-heating fuel type"@en ;
    skos:scopeNote "UFO: Quale-in-Region (Guizzardi 2005 Ch. 4). DOLCE: Quality-Region (Masolo D18 §4.3)."@en ;
    opda:hasSteward "Allemang (property-qualities sub-module steward per S008 Q2)"@en ;
    opda:ufoCategory "Quale-in-Region" .
```

## Members

| URI | prefLabel | notation |
|---|---|---|
| `opda:centralHeatingFuelType/Biomass` | "Biomass" | Biomass |
| `opda:centralHeatingFuelType/Electricity` | "Electricity" | Electricity |
| `opda:centralHeatingFuelType/LPG` | "LPG" | LPG |
| `opda:centralHeatingFuelType/Mains-gas` | "Mains gas" | Mains gas |
| `opda:centralHeatingFuelType/Oil` | "Oil" | Oil |
| `opda:centralHeatingFuelType/Other` | "Other" | Other |

### Member Turtle

```turtle
<https://w3id.org/opda/#centralHeatingFuelType/Biomass>
    rdf:type skos:Concept ;
    skos:prefLabel "Biomass"@en ;
    skos:definition "Combustible biological material (e.g. wood pellets)."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.centralHeatingFuelType.Biomass> ;
    skos:inScheme opda:CentralHeatingFuelTypeScheme ;
    skos:notation "Biomass" .

<https://w3id.org/opda/#centralHeatingFuelType/Electricity>
    rdf:type skos:Concept ;
    skos:prefLabel "Electricity"@en ;
    skos:definition "Electrical heating supplied via the mains electricity network."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.centralHeatingFuelType.Electricity> ;
    skos:inScheme opda:CentralHeatingFuelTypeScheme ;
    skos:notation "Electricity" .

<https://w3id.org/opda/#centralHeatingFuelType/LPG>
    rdf:type skos:Concept ;
    skos:prefLabel "LPG"@en ;
    skos:definition "Liquefied Petroleum Gas stored on-site for combustion."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.centralHeatingFuelType.LPG> ;
    skos:inScheme opda:CentralHeatingFuelTypeScheme ;
    skos:notation "LPG" .

<https://w3id.org/opda/#centralHeatingFuelType/Mains-gas>
    rdf:type skos:Concept ;
    skos:prefLabel "Mains gas"@en ;
    skos:definition "Natural gas supplied via the mains gas network."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.centralHeatingFuelType.Mains%20gas> ;
    skos:inScheme opda:CentralHeatingFuelTypeScheme ;
    skos:notation "Mains gas" .

<https://w3id.org/opda/#centralHeatingFuelType/Oil>
    rdf:type skos:Concept ;
    skos:prefLabel "Oil"@en ;
    skos:definition "Heating oil stored on-site for combustion."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.centralHeatingFuelType.Oil> ;
    skos:inScheme opda:CentralHeatingFuelTypeScheme ;
    skos:notation "Oil" .

<https://w3id.org/opda/#centralHeatingFuelType/Other>
    rdf:type skos:Concept ;
    skos:prefLabel "Other"@en ;
    skos:definition "Fuel type falling outside the standard categories."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.centralHeatingFuelType.Other> ;
    skos:inScheme opda:CentralHeatingFuelTypeScheme ;
    skos:notation "Other" .
```

## Scheme membership graph

![opdacentralheatingfueltypescheme-membership-graph](diagrams/central-heating-fuel-type/opdacentralheatingfueltypescheme-membership-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: false
    nodePlacementStrategy: BRANDES_KOEPF
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: opda:CentralHeatingFuelTypeScheme membership graph
    accDescr: 6 skos:Concept members bound to the scheme via skos:inScheme.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix skos: <http://www.w3.org/2004/02/skos/core#>

    classDef scheme fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef concept fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    S[opda:CentralHeatingFuelTypeScheme]:::scheme
    C1[opda:centralHeatingFuelType/Biomass]:::concept
    C2[opda:centralHeatingFuelType/Electricity]:::concept
    C3[opda:centralHeatingFuelType/LPG]:::concept
    C4[opda:centralHeatingFuelType/Mains-gas]:::concept
    C5[opda:centralHeatingFuelType/Oil]:::concept
    C6[opda:centralHeatingFuelType/Other]:::concept

    C1 -->|skos:inScheme| S
    C2 -->|skos:inScheme| S
    C3 -->|skos:inScheme| S
    C4 -->|skos:inScheme| S
    C5 -->|skos:inScheme| S
    C6 -->|skos:inScheme| S
```

</details>

## Referenced by

- `opda:Baspi5_PropertyShape` (overlay via `_:bd798d7258a49` — full scheme list)

## Source ODR + ADR

- [ODR-0011 §8a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0010](../../../adr/ADR-0010-skos-vocabulary-emission.md)
