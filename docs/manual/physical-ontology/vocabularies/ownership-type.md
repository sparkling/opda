---
date: 2026-05-28
entityUri: opda:OwnershipType
kind: scheme
sourceTtl: source/03-standards/ontology/opda-vocabularies.ttl
status: proposed
tags:
- physical-ontology
- vocabularies
- skos
- ownership-type
tier: physical-ontology
title: opda:OwnershipTypeScheme
---

# opda:OwnershipTypeScheme

## Summary

Classification of a legal estate's ownership structure (Freehold, Leasehold, Commonhold, Other). See also: [Concept tier](../../concept/property/legal-estate.md).

## Scheme header

```turtle
opda:OwnershipTypeScheme
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Ownership Type"@en ;
    skos:definition "Classification of a legal estate's ownership structure (Freehold, Leasehold, Commonhold, Other)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-8a-ufo-meta-category> ;
    dct:title "Legal-estate ownership type"@en ;
    skos:scopeNote "UFO: Quale-in-Region (Guizzardi 2005 Ch. 4). DOLCE: Quality-Region (Masolo D18 §4.3). NTS2 four-value canonical set used as authority (per data dictionary)."@en ;
    opda:hasSteward "Kendall (LegalEstate steward per S008 Q2)"@en ;
    opda:ufoCategory "Quale-in-Region" .
```

## Members

| URI | prefLabel | notation |
|---|---|---|
| `opda:ownershipType/Commonhold` | "Commonhold" | Commonhold |
| `opda:ownershipType/Freehold` | "Freehold" | Freehold |
| `opda:ownershipType/Leasehold` | "Leasehold" | Leasehold |
| `opda:ownershipType/Other` | "Other" | Other |

### Member Turtle

```turtle
<https://w3id.org/opda/#ownershipType/Commonhold>
    rdf:type skos:Concept ;
    skos:prefLabel "Commonhold"@en ;
    skos:definition "Freehold ownership of a unit within a commonhold development, with shared ownership of common parts."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.ownership.ownershipsToBeTransferred[].ownershipType.Commonhold> ;
    skos:inScheme opda:OwnershipTypeScheme ;
    skos:notation "Commonhold" .

<https://w3id.org/opda/#ownershipType/Freehold>
    rdf:type skos:Concept ;
    skos:prefLabel "Freehold"@en ;
    skos:definition "Outright ownership of the property and the land it sits on."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.ownership.ownershipsToBeTransferred[].ownershipType.Freehold> ;
    skos:inScheme opda:OwnershipTypeScheme ;
    skos:notation "Freehold" .

<https://w3id.org/opda/#ownershipType/Leasehold>
    rdf:type skos:Concept ;
    skos:prefLabel "Leasehold"@en ;
    skos:definition "Ownership of the property for a fixed period under a lease from the freeholder."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.ownership.ownershipsToBeTransferred[].ownershipType.Leasehold> ;
    skos:inScheme opda:OwnershipTypeScheme ;
    skos:notation "Leasehold" .

<https://w3id.org/opda/#ownershipType/Other>
    rdf:type skos:Concept ;
    skos:prefLabel "Other"@en ;
    skos:definition "Ownership type falling outside the standard categories."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#propertyPack.ownership.ownershipsToBeTransferred[].ownershipType.Other> ;
    skos:inScheme opda:OwnershipTypeScheme ;
    skos:notation "Other" .
```

## Scheme membership graph

![opdaownershiptypescheme-membership-graph](diagrams/ownership-type/opdaownershiptypescheme-membership-graph.png)

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
    accTitle: opda:OwnershipTypeScheme membership graph
    accDescr: 4 skos:Concept members bound to the scheme via skos:inScheme.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix skos: <http://www.w3.org/2004/02/skos/core#>

    classDef scheme fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef concept fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    S[opda:OwnershipTypeScheme]:::scheme
    C1[opda:ownershipType/Commonhold]:::concept
    C2[opda:ownershipType/Freehold]:::concept
    C3[opda:ownershipType/Leasehold]:::concept
    C4[opda:ownershipType/Other]:::concept

    C1 -->|skos:inScheme| S
    C2 -->|skos:inScheme| S
    C3 -->|skos:inScheme| S
    C4 -->|skos:inScheme| S
```

</details>

## Referenced by

- `opda:Baspi5_LegalEstateShape` (overlay via `_:b76a31b3e9782` — full scheme; required cardinality)

## Source ODR + ADR

- [ODR-0011 §8a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0010](../../../adr/ADR-0010-skos-vocabulary-emission.md)
