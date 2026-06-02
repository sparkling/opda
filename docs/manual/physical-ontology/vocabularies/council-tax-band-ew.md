---
date: 2026-05-28
entityUri: opda:CouncilTaxBandEw
kind: scheme
sourceTtl: source/03-standards/ontology/opda-vocabularies.ttl
status: proposed
tags:
- physical-ontology
- vocabularies
- skos
- council-tax
tier: physical-ontology
title: opda:CouncilTaxBandSchemeEW
---

# opda:CouncilTaxBandSchemeEW

## Summary

Valuation Office Agency banding for England & Wales (Bands A–H) assigned to each domestic property for council tax calculation.

## Scheme header

```turtle
opda:CouncilTaxBandSchemeEW
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Council Tax Band (England & Wales)"@en ;
    skos:definition "Valuation Office Agency banding for England & Wales (Bands A–H) assigned to each domestic property for council tax calculation."@en ;
    dct:source <https://www.gov.uk/council-tax-bands> ;
    dct:title "Council Tax Band — Valuation Office Agency banding (England & Wales)"@en ;
    skos:scopeNote "UFO: Quale-in-Region (Guizzardi 2005 Ch. 4). DOLCE: Quality-Region (Masolo D18 §4.3). Verbatim source: VOA council-tax bands published at https://www.gov.uk/council-tax-bands."@en ;
    opda:hasSteward "Baker (regulator-cited per ODR-0011 §4a; VOA-governed)"@en ;
    opda:ufoCategory "Quale-in-Region" .
```

## Members

| URI | prefLabel | notation |
|---|---|---|
| `opda:councilTaxBandEW/A` | "A" | A |
| `opda:councilTaxBandEW/B` | "B" | B |
| `opda:councilTaxBandEW/C` | "C" | C |
| `opda:councilTaxBandEW/D` | "D" | D |
| `opda:councilTaxBandEW/E` | "E" | E |
| `opda:councilTaxBandEW/F` | "F" | F |
| `opda:councilTaxBandEW/G` | "G" | G |
| `opda:councilTaxBandEW/H` | "H" | H |

### Member Turtle (8 bands; identical structure — sample)

```turtle
<https://opda.org.uk/pdtf/scheme/councilTaxBandEW/A>
    rdf:type skos:Concept ;
    skos:prefLabel "A"@en ;
    skos:definition "Council tax band A as defined by the Valuation Office Agency for properties in England & Wales."@en ;
    dct:source <https://www.gov.uk/council-tax-bands> ;
    skos:inScheme opda:CouncilTaxBandSchemeEW ;
    skos:notation "A" .

# Bands B-H follow the same pattern.
# See source: opda-vocabularies.ttl lines 401-463.
```

Full per-member Turtle: [`opda-vocabularies.ttl` lines 401–463](../../../../source/03-standards/ontology/opda-vocabularies.ttl).

## Scheme membership graph

![opdacounciltaxbandschemeew-membership-graph](diagrams/council-tax-band-ew/opdacounciltaxbandschemeew-membership-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: opda:CouncilTaxBandSchemeEW membership graph
    accDescr: 8 skos:Concept members bound to the scheme via skos:inScheme.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix skos: <http://www.w3.org/2004/02/skos/core#>

    classDef scheme fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef concept fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    S[opda:CouncilTaxBandSchemeEW]:::scheme
    C1[opda:councilTaxBandEW/A]:::concept
    C2[opda:councilTaxBandEW/B]:::concept
    C3[opda:councilTaxBandEW/C]:::concept
    C4[opda:councilTaxBandEW/D]:::concept
    C5[opda:councilTaxBandEW/E]:::concept
    C6[opda:councilTaxBandEW/F]:::concept
    C7[opda:councilTaxBandEW/G]:::concept
    C8[opda:councilTaxBandEW/H]:::concept

    C1 -->|skos:inScheme| S
    C2 -->|skos:inScheme| S
    C3 -->|skos:inScheme| S
    C4 -->|skos:inScheme| S
    C5 -->|skos:inScheme| S
    C6 -->|skos:inScheme| S
    C7 -->|skos:inScheme| S
    C8 -->|skos:inScheme| S
```

</details>

## Referenced by

- Per-overlay profile bindings (BASPI5 does not surface council tax band in MVP; future GovTech / lender overlays)

## Source ODR + ADR

- [ODR-0011 §4a — regulator-citation discipline](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0010](../../../adr/ADR-0010-skos-vocabulary-emission.md)
