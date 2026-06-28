---
date: 2026-05-28
entityUri: opda:YesNoNotApplicable
kind: scheme
sourceTtl: source/03-standards/ontology/opda-vocabularies.ttl
status: proposed
tags:
- physical-ontology
- vocabularies
- skos
- yes-no
tier: physical-ontology
title: opda:YesNoNotApplicableScheme
---

# opda:YesNoNotApplicableScheme

## Summary

Mode label register for BASPI5 questions admitting non-applicable as a third option (Yes / No / Not applicable).

## Scheme header

```turtle
opda:YesNoNotApplicableScheme
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Yes/No/Not applicable"@en ;
    skos:definition "Mode label register for BASPI5 questions admitting non-applicable as a third option (Yes / No / Not applicable)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0011/section-1a-scheme-steward> ;
    dct:title "Yes/No/Not applicable mode label register"@en ;
    skos:scopeNote "UFO: Quale-in-Region (Guizzardi 2005 Ch. 4). Mode register for BASPI5 form questions; the 'Not applicable' member captures absence-of-context rather than negative answer."@en ;
    opda:hasSteward "Allemang (property-qualities sub-module steward per S008 Q2)"@en ;
    opda:ufoCategory "Quale-in-Region" .
```

## Members

| URI | prefLabel | notation |
|---|---|---|
| `opda:yesNoNotApplicable/No` | "No" | No |
| `opda:yesNoNotApplicable/Not-applicable` | "Not applicable" | Not applicable |
| `opda:yesNoNotApplicable/Yes` | "Yes" | Yes |

### Member Turtle

```turtle
<https://opda.org.uk/pdtf/scheme/yesNoNotApplicable/No>
    rdf:type skos:Concept ;
    skos:prefLabel "No"@en ;
    skos:definition "Negative answer."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0011/section-1a-scheme-steward> ;
    skos:inScheme opda:YesNoNotApplicableScheme ;
    skos:notation "No" .

<https://opda.org.uk/pdtf/scheme/yesNoNotApplicable/Not-applicable>
    rdf:type skos:Concept ;
    skos:prefLabel "Not applicable"@en ;
    skos:definition "Question does not apply in this context."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0011/section-1a-scheme-steward> ;
    skos:inScheme opda:YesNoNotApplicableScheme ;
    skos:notation "Not applicable" .

<https://opda.org.uk/pdtf/scheme/yesNoNotApplicable/Yes>
    rdf:type skos:Concept ;
    skos:prefLabel "Yes"@en ;
    skos:definition "Affirmative answer."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0011/section-1a-scheme-steward> ;
    skos:inScheme opda:YesNoNotApplicableScheme ;
    skos:notation "Yes" .
```

## Scheme membership graph

![opdayesnonotapplicablescheme-membership-graph](diagrams/yes-no-not-applicable/opdayesnonotapplicablescheme-membership-graph.png)

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
    accTitle: opda:YesNoNotApplicableScheme membership graph
    accDescr: 3 skos:Concept members bound to the scheme via skos:inScheme.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix skos: <http://www.w3.org/2004/02/skos/core#>

    classDef scheme fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef concept fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    S[opda:YesNoNotApplicableScheme]:::scheme
    C1[opda:yesNoNotApplicable/No]:::concept
    C2[opda:yesNoNotApplicable/Not-applicable]:::concept
    C3[opda:yesNoNotApplicable/Yes]:::concept

    C1 -->|skos:inScheme| S
    C2 -->|skos:inScheme| S
    C3 -->|skos:inScheme| S
```

</details>

## Referenced by

- Per-overlay profile bindings for context-conditional BASPI5 questions

## Source ODR + ADR

- [ODR-0011 §1a](/modelling/odr/odr-0011)
- [ADR-0010](/modelling/adr/adr-0010)
