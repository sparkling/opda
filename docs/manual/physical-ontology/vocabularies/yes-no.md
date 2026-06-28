---
date: 2026-05-28
entityUri: opda:YesNo
kind: scheme
sourceTtl: source/03-standards/ontology/opda-vocabularies.ttl
status: proposed
tags:
- physical-ontology
- vocabularies
- skos
- yes-no
tier: physical-ontology
title: opda:YesNoScheme
---

# opda:YesNoScheme

## Summary

Binary register for affirmative/negative answers to BASPI5 discriminator questions (Yes / No). Used by ~276 BASPI5 discriminator questions; emitted as a shared scheme per ODR-0011 §1a one-scheme-per-enum discipline.

## Scheme header

```turtle
opda:YesNoScheme
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Yes/No"@en ;
    skos:definition "Binary register for affirmative/negative answers to BASPI5 discriminator questions (Yes / No)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0011/section-1a-scheme-steward> ;
    dct:title "Yes/No binary register"@en ;
    skos:scopeNote "UFO: Quale-in-Region (Guizzardi 2005 Ch. 4). DOLCE: Quality-Region (Masolo D18 §4.3). Used by ~276 BASPI5 discriminator questions; emitted as a shared scheme per ODR-0011 §1a one-scheme-per-enum discipline."@en ;
    opda:hasSteward "Allemang (property-qualities sub-module steward per S008 Q2)"@en ;
    opda:ufoCategory "Quale-in-Region" .
```

## Members

| URI | prefLabel | notation |
|---|---|---|
| `opda:yesNo/No` | "No" | No |
| `opda:yesNo/Yes` | "Yes" | Yes |

### Member Turtle

```turtle
<https://opda.org.uk/pdtf/scheme/yesNo/No>
    rdf:type skos:Concept ;
    skos:prefLabel "No"@en ;
    skos:definition "Negative answer to a binary BASPI5 question."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0011/section-1a-scheme-steward> ;
    skos:inScheme opda:YesNoScheme ;
    skos:notation "No" .

<https://opda.org.uk/pdtf/scheme/yesNo/Yes>
    rdf:type skos:Concept ;
    skos:prefLabel "Yes"@en ;
    skos:definition "Affirmative answer to a binary BASPI5 question."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0011/section-1a-scheme-steward> ;
    skos:inScheme opda:YesNoScheme ;
    skos:notation "Yes" .
```

## Scheme membership graph

![opdayesnoscheme-membership-graph](diagrams/yes-no/opdayesnoscheme-membership-graph.png)

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
    accTitle: opda:YesNoScheme membership graph
    accDescr: 2 skos:Concept members bound to the scheme via skos:inScheme.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix skos: <http://www.w3.org/2004/02/skos/core#>

    classDef scheme fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef concept fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    S[opda:YesNoScheme]:::scheme
    C1[opda:yesNo/No]:::concept
    C2[opda:yesNo/Yes]:::concept

    C1 -->|skos:inScheme| S
    C2 -->|skos:inScheme| S
```

</details>

## Referenced by

This is the most-referenced scheme. Used by every BASPI5 Yes/No discriminator question (e.g. `isInsured`, `hasBeenFlooded`, `hasSmartHomeSystems`, `hasSprayFoamInstalled`, `isSupplyMetered`, `isGroundRentPayable`, `isLocatedOverCommercialPremises`, `soldWithVacantPossession`, `sellerContributesToServiceCharge`, `areBoundariesUniform`, `hasValidGuaranteesOrWarranties`).

Property shapes referencing this scheme (via `_:bbfbbd5886345` Yes/No list):

- `opda:Baspi5_PropertyShape` (multiple bindings — flood / smart-home / spray-foam / insurance / supply-meter / vacant-possession / boundaries-uniform / guarantees / over-commercial-premises)
- `opda:Baspi5_LegalEstateShape` (ground rent / service charge / shared ownership)

## Source ODR + ADR

- [ODR-0011 §1a — one-scheme-per-enum discipline](/modelling/odr/odr-0011)
- [ADR-0010](/modelling/adr/adr-0010)
