---
status: proposed
date: 2026-05-28
tags: [logical-model, descriptive]
---

# Descriptive module

Class-promoted descriptive Kinds: Survey, Valuation, EPCCertificate, Search, Comparable. Each is class-promoted per S008 Q4 three-criterion test: authority-retrieved provenance, distinct lifecycle, distinct PII regime (where applicable).

## Entity inventory

| Entity | UFO meta-category | Notes |
|---|---|---|
| [Comparable](./comparable.md) | Substance Kind (informational) | Land Registry / VOA-sourced comparable-sale or comparable-rental record |
| [EPCCertificate](./epc-certificate.md) | Substance Kind (informational) | DESNZ-governed Energy Performance Certificate; 10-year validity; address + owner-identifiable PII |
| [Search](./search.md) | Substance Kind (informational) | Local-authority or environmental search result (CON29R / LLC1 etc.) |
| [Survey](./survey.md) | Substance Kind (informational) | Authority-retrieved professional survey report |
| [Valuation](./valuation.md) | Substance Kind (informational) | RICS-regulated professional or automated-model valuation output |

## Enumerations bound by this module

None directly bound at the core-tier scope. Descriptive Kinds bind enumeration schemes (e.g. `CouncilTaxBandSchemeEW`) at the overlay-profile level rather than via core-tier datatype properties.

## ER diagram

![descriptive-module--entity-relationship-diagram](diagrams/README/descriptive-module--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Descriptive Module — Entity-Relationship Diagram
    accDescr: Five class-promoted descriptive Kinds (Survey, Valuation, EPCCertificate, Search, Comparable) and their PROV-O activity provenance + Property concern relationships.

    Survey }o--|| Property : "concerns"
    Valuation }o--|| Property : "concerns"
    EPCCertificate }o--|| Property : "concerns"
    Search }o--|| Property : "concerns"
    Comparable }o--|| Valuation : "supports (prov:wasInformedBy)"
    Survey }o--|| Activity : "prov:wasGeneratedBy"
    Valuation }o--|| Activity : "prov:wasGeneratedBy"
    EPCCertificate }o--|| Activity : "prov:wasGeneratedBy"
    Search }o--|| Activity : "prov:wasGeneratedBy"
    Comparable }o--|| Activity : "prov:wasGeneratedBy"
```

</details>

Source file: [`../diagrams/descriptive-er.mmd`](../diagrams/descriptive-er.mmd).

## Class hierarchy

OWL/RDFS subclass relationships. All five descriptive Kinds specialise `prov:Entity` and carry PROV-O attribution to their issuing Activity.

![descriptive-module--class-hierarchy](diagrams/README/descriptive-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Descriptive Module — Class Hierarchy
    accDescr: OWL/RDFS subclass relationships — five class-promoted descriptive Kinds (Survey, Valuation, EPCCertificate, Search, Comparable) all specialise PROV-O Entity.

    class provEntity["prov:Entity"]

    class Survey {
        prov:wasGeneratedBy
        concerns Property
    }
    class Valuation {
        prov:wasGeneratedBy
        concerns Property
        prov:wasInformedBy Comparable
    }
    class EPCCertificate {
        prov:wasGeneratedBy
        concerns Property
        DESNZ-governed
    }
    class Search {
        prov:wasGeneratedBy
        concerns Property
        local-authority issued
    }
    class Comparable {
        prov:wasGeneratedBy
        supports Valuation
    }

    provEntity <|-- Survey
    provEntity <|-- Valuation
    provEntity <|-- EPCCertificate
    provEntity <|-- Search
    provEntity <|-- Comparable
```

</details>

## Identity-key summary

![descriptive-module--identity-key-summary](diagrams/README/descriptive-module--identity-key-summary.png)

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
    accTitle: Descriptive Module — Identity-Key Summary
    accDescr: Identity Criterion key surfaces for the five descriptive-module entities — all keyed on prov:wasGeneratedBy to the issuing Activity per the S008 Q4 three-criterion test.

    classDef icCell fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef entityCell fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    SurveyE[Survey]:::entityCell -->|"IC"| SIC["prov:wasGeneratedBy<br/>(surveyor, timestamp,<br/>professional-registration)"]:::icCell
    ValuationE[Valuation]:::entityCell -->|"IC"| VIC["prov:wasGeneratedBy<br/>(valuer, timestamp,<br/>RICS-registration)"]:::icCell
    EPCCertificateE[EPCCertificate]:::entityCell -->|"IC"| EIC["prov:wasGeneratedBy<br/>(DESNZ-certificate-number,<br/>assessment-timestamp)"]:::icCell
    SearchE[Search]:::entityCell -->|"IC"| SeIC["prov:wasGeneratedBy<br/>(issuing-authority,<br/>search-reference, order-timestamp)"]:::icCell
    ComparableE[Comparable]:::entityCell -->|"IC"| CIC["prov:wasGeneratedBy<br/>(source-register,<br/>comparator-record-id,<br/>extraction-timestamp)"]:::icCell
```

</details>
