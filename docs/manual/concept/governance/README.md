# Governance

The Governance module contains the records that link OPDA Kinds to data-protection categories — specifically, the DPV (Data Privacy Vocabulary) mapping records that pair each PII-bearing Kind with its baseline personal-data category under GDPR, and the Special Category Scheme for elevated-discipline categories under GDPR Article 10.

DPV is *referenced* but not *imported* by OPDA — the mapping records cite DPV URIs as link targets, leaving DPV's own governance to its own working group. This module is the authoring authority for those mappings; the actual co-annotation triples are emitted by ADR-0012 into the annotations graph.

## Entities

- [DPV Mapping Record](./dpv-mapping-record.md) — mapping from an OPDA Kind to its baseline personal-data category
- [Special Category Scheme](./special-category-scheme.md) — GDPR Article 10 / DPA 2018 special-category personal-data scheme

## Module-internal relationships

How the two governance Kinds link OPDA's PII-bearing Kinds out to the external DPV vocabulary and to GDPR Article 10 special-category controls:

![governance-module-internal-relationships](diagrams/README/governance-module-internal-relationships.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Governance module internal relationships
    accDescr: DPV Mapping Records anchor each PII-bearing OPDA Kind to its baseline DPV personal-data category; Special Category Scheme flags Article 10 elevated-discipline PII; external DPV ontology is referenced not imported.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17

    %% Governance module
    DPVMapping["DPVMappingRecord"]:::cls
    SpecialCategoryScheme["SpecialCategoryScheme<br/>(GDPR Art. 10)"]:::warning

    %% PII-bearing Kinds (other modules)
    Person["Person<br/>(agent module)"]:::ext
    Organisation["Organisation<br/>(agent module)"]:::ext
    Claim["Claim<br/>(claim module)"]:::ext
    EPC["EPC Certificate<br/>(descriptive module)"]:::ext

    %% External DPV
    DPVPersonalData["dpv-pd:* categories<br/>(external; referenced)"]:::ext

    %% Mapping authority
    DPVMapping -->|"targets (1)"| Person
    DPVMapping -->|"targets (1)"| Organisation
    DPVMapping -->|"targets (1)"| Claim
    DPVMapping -->|"targets (1)"| EPC
    DPVMapping -->|"cites baseline category"| DPVPersonalData

    %% Article 10 linkage
    SpecialCategoryScheme -->|"flags Article 10 PII on"| Person
    DPVMapping -.->|"may reference"| SpecialCategoryScheme
```

</details>
