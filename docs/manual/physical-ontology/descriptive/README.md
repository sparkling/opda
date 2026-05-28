---
status: proposed
date: 2026-05-28
tags: [physical-ontology, descriptive, module]
---

# Descriptive module

The Descriptive module emits 5 OWL classes class-promoted per ODR-0008 §Q4a three-criterion test (authority-retrieved provenance; distinct lifecycle; distinct PII regime). Each is a PROV-O Entity subtype.

## Files

| File | Role | Source |
|---|---|---|
| `opda-descriptive.ttl` | 5 OWL classes | [opda-descriptive.ttl](../../../../source/03-standards/ontology/opda-descriptive.ttl) |
| `opda-descriptive-shapes.ttl` | 5 identity-key shapes (all share the `prov:wasGeneratedBy` property shape) | [opda-descriptive-shapes.ttl](../../../../source/03-standards/ontology/opda-descriptive-shapes.ttl) |
| `opda-descriptive-annotations.ttl` | 1 DPV baseline + 4 transitive no-baselines | [opda-descriptive-annotations.ttl](../../../../source/03-standards/ontology/opda-descriptive-annotations.ttl) |

## Ontology header

```turtle
<https://w3id.org/opda/descriptive/>
    rdf:type owl:Ontology ;
    dct:title "OPDA Descriptive Module"@en ;
    owl:imports <https://w3id.org/opda/1.0.0/>, <https://w3id.org/opda/vocabularies/> ;
    owl:versionIRI <https://w3id.org/opda/descriptive/1.0.0/> .
```

## Import chain

- `<https://w3id.org/opda/1.0.0/>` — foundation
- `<https://w3id.org/opda/vocabularies/>` — SKOS substrate

External vocabularies referenced (not imported):
- `prov:Entity` — superclass of all 5 descriptive classes

## Classes (5)

| Class | Authority | Lifecycle |
|---|---|---|
| `opda:Comparable` | Land Registry / VOA | Live; supports `prov:wasInformedBy` from Valuations |
| `opda:EPCCertificate` | DESNZ register | 10-year validity; supersession on re-assessment |
| `opda:Search` | Local authority (CON29R / LLC1 / environmental) | Ordered / returned / superseded |
| `opda:Survey` | RICS-regulated professional | Issued / superseded / re-issued / withdrawn |
| `opda:Valuation` | RICS Red Book (regulated) | Instructed / delivered / superseded |

See [`classes.md`](./classes.md) for per-class blocks.

## Module class hierarchy

![descriptive-module--class-hierarchy](diagrams/README/descriptive-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Descriptive module — class hierarchy
    accDescr: Five OWL classes, all class-promoted per ODR-0008 Q4a three-criterion test. Each subclasses prov:Entity.

    class provEntity["prov_Entity (external)"]

    class Comparable["opda_Comparable"] {
        owl_Class
        Substance Kind informational
    }
    class EPCCertificate["opda_EPCCertificate"] {
        owl_Class
        Substance Kind informational
    }
    class Search["opda_Search"] {
        owl_Class
        Substance Kind informational
    }
    class Survey["opda_Survey"] {
        owl_Class
        Substance Kind informational
    }
    class Valuation["opda_Valuation"] {
        owl_Class
        Substance Kind informational
    }

    provEntity <|-- Comparable : rdfs_subClassOf
    provEntity <|-- EPCCertificate : rdfs_subClassOf
    provEntity <|-- Search : rdfs_subClassOf
    provEntity <|-- Survey : rdfs_subClassOf
    provEntity <|-- Valuation : rdfs_subClassOf
```

</details>

## Module shape-target graph

![descriptive-shapes-and-their-target-classes](diagrams/README/descriptive-shapes-and-their-target-classes.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E8F5E9", "primaryTextColor": "#1B5E20", "primaryBorderColor": "#2E7D32", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Descriptive shapes and their target classes
    accDescr: Five identity-key shapes — one per class-promoted Kind — sharing the same prov:wasGeneratedBy property-shape blank node. All Cat 1 Violation severity per ODR-0008 Q4a.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix sh: <http://www.w3.org/ns/shacl#>
    %% @prefix prov: <http://www.w3.org/ns/prov#>

    classDef shape fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,stroke-dasharray:5 5,color:#1B5E20
    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef shared fill:#FFF9C4,stroke:#F57F17,stroke-width:2px,color:#E65100

    S1[opda:ComparableIdentityKeyShape]:::shape
    S2[opda:EPCCertificateIdentityKeyShape]:::shape
    S3[opda:SearchIdentityKeyShape]:::shape
    S4[opda:SurveyIdentityKeyShape]:::shape
    S5[opda:ValuationIdentityKeyShape]:::shape

    C1[opda:Comparable]:::cls
    C2[opda:EPCCertificate]:::cls
    C3[opda:Search]:::cls
    C4[opda:Survey]:::cls
    C5[opda:Valuation]:::cls

    PS["shared sh:property<br/>prov:wasGeneratedBy<br/>minCount 1"]:::shared

    S1 -->|sh:targetClass| C1
    S2 -->|sh:targetClass| C2
    S3 -->|sh:targetClass| C3
    S4 -->|sh:targetClass| C4
    S5 -->|sh:targetClass| C5

    S1 -.->|sh:property| PS
    S2 -.->|sh:property| PS
    S3 -.->|sh:property| PS
    S4 -.->|sh:property| PS
    S5 -.->|sh:property| PS
```

</details>

## Module DPV co-annotation graph

![descriptive-module--dpv-personal-data-co-annotations](diagrams/README/descriptive-module--dpv-personal-data-co-annotations.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E0F2F1", "primaryTextColor": "#004D40", "primaryBorderColor": "#00695C", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Descriptive module — DPV personal-data co-annotations
    accDescr: EPCCertificate carries dpv-pd:PostalAddress baseline. The other four classes (Comparable, Search, Survey, Valuation) have no class-level baseline — PII flows transitively via the linked Property.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix dpv-pd: <https://w3id.org/dpv/pd#>

    classDef pii fill:#E0F2F1,stroke:#00695C,stroke-width:2px,color:#004D40
    classDef dpv fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef note fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238
    classDef transitive fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#BF360C

    EPC[opda:EPCCertificate]:::pii
    PA[dpv-pd:PostalAddress]:::dpv
    EPC -->|dpv-pd:hasPersonalDataCategory| PA

    Comp[opda:Comparable<br/>no baseline]:::note
    Sea[opda:Search<br/>no baseline]:::note
    Sur[opda:Survey<br/>no baseline]:::note
    Val[opda:Valuation<br/>no baseline]:::note

    Prop[opda:Property<br/>upstream baseline]:::transitive
    Comp -.->|transitive via linked Property| Prop
    Sea -.->|transitive via linked Property| Prop
    Sur -.->|transitive via linked Property| Prop
    Val -.->|transitive via linked Property| Prop
    Prop -->|dpv-pd:hasPersonalDataCategory| PA
```

</details>

## SHACL shapes (5)

All five shapes share the same `_:b218dcfc815ed` property-shape blank node (the `prov:wasGeneratedBy` discipline). See [`shapes.md`](./shapes.md).

| Shape | Severity | Category |
|---|---|---|
| `opda:ComparableIdentityKeyShape` | Violation | Cat 1 |
| `opda:EPCCertificateIdentityKeyShape` | Violation | Cat 1 |
| `opda:SearchIdentityKeyShape` | Violation | Cat 1 |
| `opda:SurveyIdentityKeyShape` | Violation | Cat 1 |
| `opda:ValuationIdentityKeyShape` | Violation | Cat 1 |

## DPV annotations

EPCCertificate carries `dpv-pd:PostalAddress` baseline (the EPC includes the property address); the four others are no-baseline (PII flows transitively via the linked `opda:Property`). See [`annotations.md`](./annotations.md).

## Source ODR + ADR

- [ODR-0008 §Q4a — Descriptive attributes (three-criterion class-promotion test)](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ODR-0018 — DPV co-annotation pattern](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
