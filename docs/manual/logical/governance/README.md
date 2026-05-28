---
status: proposed
date: 2026-05-28
tags: [logical-model, governance]
---

# Governance module

DPV (Data Privacy Vocabulary) mapping records that bind OPDA Kinds to their baseline personal-data categories, plus the SpecialCategoryScheme class declaration for GDPR Article 10 special-category personal data.

## Entity inventory

| Entity | UFO meta-category | Notes |
|---|---|---|
| [DPVMappingRecord](./dpv-mapping-record.md) | Information particular | Mapping-record-as-resource pattern per ODR-0018 §3a |
| [SpecialCategoryScheme](./special-category-scheme.md) | Information particular (declaration only) | Subclass of `skos:ConceptScheme`; members emit when ADR-0010 scope-expansion activates |

## Enumerations bound by this module

None — the SpecialCategoryScheme is itself a class declaration awaiting member emission; the three concrete `DPVMappingRecord` instances (`ClaimDPVMapping`, `OrganisationDPVMapping`, `PersonDPVMapping`) cite DPV-PD categories directly rather than via an OPDA-internal scheme.

## ER diagram

![governance-module--entity-relationship-diagram](diagrams/README/governance-module--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Governance Module — Entity-Relationship Diagram
    accDescr: DPV mapping records binding OPDA Kinds (Person, Organisation, Claim) to their DPV-PD baseline personal-data categories plus the SpecialCategoryScheme declaration.

    DPVMappingRecord }o--|| Person : "targetsKind (dpv-pd:Name baseline)"
    DPVMappingRecord }o--|| Organisation : "targetsKind"
    DPVMappingRecord }o--|| Claim : "targetsKind (dpv-pd:OfficialID baseline)"
```

</details>

Source file: [`../diagrams/governance-er.mmd`](../diagrams/governance-er.mmd).

## Class hierarchy

OWL/RDFS subclass relationships. DPVMappingRecord is an Information particular at root. SpecialCategoryScheme subclasses `skos:ConceptScheme`. Both reference DPV-PD URIs by citation only (not import).

![governance-module--class-hierarchy](diagrams/README/governance-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Governance Module — Class Hierarchy
    accDescr: OWL/RDFS subclass relationships — DPVMappingRecord as Information particular at root, SpecialCategoryScheme as subclass of skos:ConceptScheme, DPV-PD vocabulary referenced (not imported).

    class skosConceptScheme["skos:ConceptScheme"]
    class dpvpdPersonalDataCategory["dpv-pd:PersonalDataCategory"]

    class DPVMappingRecord {
        targetsKind : owl:Class
        baselineCategory : dpv-pd
    }
    class SpecialCategoryScheme {
        declaration only
        members deferred
    }

    skosConceptScheme <|-- SpecialCategoryScheme
    DPVMappingRecord ..> dpvpdPersonalDataCategory : references
```

</details>

## Identity-key summary

![governance-module--identity-key-summary](diagrams/README/governance-module--identity-key-summary.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Governance Module — Identity-Key Summary
    accDescr: Identity Criterion key surfaces for the two governance-module entities — (targetsKind, baselineCategory) tuple for DPVMappingRecord, no IC for the declaration-only SpecialCategoryScheme.

    classDef icCell fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef entityCell fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    DPVMappingRecordE[DPVMappingRecord]:::entityCell -->|"IC"| DMRIC["(targetsKind,<br/>baselineCategory)"]:::icCell
    SpecialCategorySchemeE[SpecialCategoryScheme]:::entityCell -->|"IC"| SCIC["no IC at this tier<br/>(class declaration only)"]:::icCell
```

</details>
