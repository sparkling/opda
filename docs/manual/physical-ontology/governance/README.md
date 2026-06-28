---
status: proposed
date: 2026-05-28
tags: [physical-ontology, governance, module]
---

# Governance module

The Governance module emits 2 OWL classes (DPVMappingRecord meta-record class + SpecialCategoryScheme placeholder) and 3 `opda:DPVMappingRecord` instances (Claim / Organisation / Person mappings).

## Files

| File | Role | Source |
|---|---|---|
| `opda-governance.ttl` | 2 OWL classes + 2 ObjectProperties + 3 DPVMappingRecord instances | [opda-governance.ttl](../../../../source/03-standards/ontology/opda-governance.ttl) |
| `opda-governance-shapes.ttl` | 1 identity-key shape | [opda-governance-shapes.ttl](../../../../source/03-standards/ontology/opda-governance-shapes.ttl) |
| `opda-governance-annotations.ttl` | Header-only (meta-records carry no DPV baseline) | [opda-governance-annotations.ttl](../../../../source/03-standards/ontology/opda-governance-annotations.ttl) |

## Ontology header

```turtle
<https://opda.org.uk/pdtf/graph/governance>
    rdf:type owl:Ontology ;
    dct:references <https://w3id.org/dpv/pd> ;
    dct:title "OPDA Governance Module"@en ;
    owl:imports <https://opda.org.uk/pdtf/harness/release/1.0.0/>, <https://opda.org.uk/pdtf/scheme/> ;
    owl:versionIRI <https://opda.org.uk/pdtf/harness/release/governance/1.0.0/> .
```

## Import chain

- `<https://opda.org.uk/pdtf/harness/release/1.0.0/>` — foundation
- `<https://opda.org.uk/pdtf/scheme/>` — SKOS substrate

External vocabularies referenced (not imported):
- `dpv-pd:` — cited via `dct:references` on the module header + per-instance `opda:baselineCategory` triples
- `skos:ConceptScheme` — `opda:SpecialCategoryScheme rdfs:subClassOf skos:ConceptScheme`

## Classes (2)

| Class | Role |
|---|---|
| `opda:DPVMappingRecord` | Meta-record class declaring DPV baseline + variant refinements for a Kind |
| `opda:SpecialCategoryScheme` | Class declaration for GDPR Art 10 special-category scheme (members deferred per ODR-0011) |

See [`classes.md`](./classes.md) for per-class blocks.

## Module class hierarchy

![governance-module--class-hierarchy](diagrams/README/governance-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Governance module — class hierarchy
    accDescr: Two OWL classes. DPVMappingRecord is the meta-record class. SpecialCategoryScheme subclasses skos:ConceptScheme. Three DPVMappingRecord instances shown (Claim, Organisation, Person).

    class skosConceptScheme["skos_ConceptScheme (external)"]

    class DPVMappingRecord["opda_DPVMappingRecord"] {
        owl_Class
        Information Particular
        opda_baselineCategory
        opda_targetsKind
    }
    class SpecialCategoryScheme["opda_SpecialCategoryScheme"] {
        owl_Class
        GDPR Art 10
        Members deferred
    }

    class ClaimDPVMapping["opda_ClaimDPVMapping (instance)"]
    class OrgDPVMapping["opda_OrganisationDPVMapping (instance)"]
    class PersonDPVMapping["opda_PersonDPVMapping (instance)"]

    skosConceptScheme <|-- SpecialCategoryScheme : rdfs_subClassOf
    DPVMappingRecord <.. ClaimDPVMapping : rdf_type
    DPVMappingRecord <.. OrgDPVMapping : rdf_type
    DPVMappingRecord <.. PersonDPVMapping : rdf_type
```

</details>

## Module shape-target graph

![governance-shape-and-its-target-class](diagrams/README/governance-shape-and-its-target-class.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E8F5E9", "primaryTextColor": "#1B5E20", "primaryBorderColor": "#2E7D32", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Governance shape and its target class
    accDescr: Single identity-key shape — DPVMappingRecordIdentityKeyShape — targets DPVMappingRecord meta-records and enforces a single targetsKind binding per record.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix sh: <http://www.w3.org/ns/shacl#>

    classDef shape fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,stroke-dasharray:5 5,color:#1B5E20
    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    S1[opda:DPVMappingRecordIdentityKeyShape]:::shape
    C1[opda:DPVMappingRecord]:::cls

    S1 -->|sh:targetClass| C1
```

</details>

## Module DPV co-annotation graph

![governance-module--dpv-co-annotations-header-only](diagrams/README/governance-module--dpv-co-annotations-header-only.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E0F2F1", "primaryTextColor": "#004D40", "primaryBorderColor": "#00695C", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Governance module — DPV co-annotations (header-only)
    accDescr: Governance classes are meta-records — they declare the DPV regime; they themselves carry no DPV class-level baseline. The three DPVMappingRecord instances bind Kinds (Claim, Organisation, Person) to DPV categories.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix dpv-pd: <https://w3id.org/dpv/pd#>

    classDef note fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238
    classDef record fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#BF360C
    classDef kind fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef dpv fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F

    Meta1[opda:DPVMappingRecord<br/>meta-class — no baseline]:::note
    Meta2[opda:SpecialCategoryScheme<br/>meta-class — no baseline]:::note

    R1[ClaimDPVMapping]:::record
    R2[OrganisationDPVMapping]:::record
    R3[PersonDPVMapping]:::record

    KClaim[opda:Claim — claim module]:::kind
    KOrg[opda:Organisation — agent module]:::kind
    KPerson[opda:Person — agent module]:::kind

    DOID[dpv-pd:OfficialID]:::dpv
    DName[dpv-pd:Name]:::dpv

    R1 -->|opda:targetsKind| KClaim
    R1 -->|opda:baselineCategory| DOID
    R2 -->|opda:targetsKind| KOrg
    R3 -->|opda:targetsKind| KPerson
    R3 -->|opda:baselineCategory| DName
```

</details>

## SHACL shapes (1)

| Shape | Severity | Category |
|---|---|---|
| `opda:DPVMappingRecordIdentityKeyShape` | Violation | Cat 1 |

See [`shapes.md`](./shapes.md) for per-shape blocks.

## DPV annotations

Header-only. Governance classes (`DPVMappingRecord`, `SpecialCategoryScheme`) are meta-records declaring the DPV regime; they themselves carry no DPV class-level baseline. See [`annotations.md`](./annotations.md).

## Source ODR + ADR

- [ODR-0012 — SHACL + DPV annotation emission](/modelling/odr/odr-0012)
- [ODR-0018 — DPV co-annotation pattern](/modelling/odr/odr-0018)
- [ODR-0011 — Enumeration vocabularies (SpecialCategoryScheme deferral)](/modelling/odr/odr-0011)
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011)
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012)
