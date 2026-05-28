---
status: proposed
date: 2026-05-28
tags: [physical-ontology, claim, module]
---

# Claim module

The Claim module emits 11 OWL classes covering verifiable claims (`Claim`), evidence subtypes (`DocumentEvidence`, `ElectronicRecordEvidence`, `VouchEvidence`), short-name aliases (`Document`, `ElectronicRecord`, `Vouch`), the verification activity (`VerificationActivity`), the trust framework citation (`TrustFramework`), and the assurance level quality (`AssuranceLevel`).

## Files

| File | Role | Source |
|---|---|---|
| `opda-claim.ttl` | 11 OWL classes + DatatypeProperty + 2 ObjectProperties | [opda-claim.ttl](../../../../source/03-standards/ontology/opda-claim.ttl) |
| `opda-claim-shapes.ttl` | 2 identity-key + 1 IC-breach + 2 SHACL-AF rules | [opda-claim-shapes.ttl](../../../../source/03-standards/ontology/opda-claim-shapes.ttl) |
| `opda-claim-annotations.ttl` | DPV class-level + 3 evidence refinements | [opda-claim-annotations.ttl](../../../../source/03-standards/ontology/opda-claim-annotations.ttl) |

## Ontology header

```turtle
<https://w3id.org/opda/claim/>
    rdf:type owl:Ontology ;
    dct:title "OPDA Claim Module"@en ;
    owl:imports <https://w3id.org/opda/1.0.0/>, <https://w3id.org/opda/vocabularies/> ;
    owl:versionIRI <https://w3id.org/opda/claim/1.0.0/> .
```

## Import chain

- `<https://w3id.org/opda/1.0.0/>` — foundation
- `<https://w3id.org/opda/vocabularies/>` — SKOS schemes (AssuranceLevel, EvidenceMethod)

External vocabularies referenced (not imported):
- `prov:Entity`, `prov:Activity`, `prov:Agent` — PROV-O alignment (S009 Rule 1 — 80%-PROV-O mapping)

## Classes (11)

| Class | UFO category | PROV-O parent |
|---|---|---|
| `opda:AssuranceLevel` | Quale-in-Region | (none — Quality Value) |
| `opda:Claim` | Information particular | `prov:Entity` |
| `opda:Document` | Substance Kind (alias) | (equivalent to `opda:DocumentEvidence`) |
| `opda:DocumentEvidence` | Substance Kind | subclass of `opda:Evidence` |
| `opda:ElectronicRecord` | Substance Kind (alias) | (equivalent to `opda:ElectronicRecordEvidence`) |
| `opda:ElectronicRecordEvidence` | Substance Kind | subclass of `opda:Evidence` |
| `opda:Evidence` | Substance Kind | `prov:Entity` |
| `opda:TrustFramework` | Information Particular | (cited via `dct:conformsTo`) |
| `opda:VerificationActivity` | Event particular | `prov:Activity` |
| `opda:Vouch` | Substance Kind (alias) | (equivalent to `opda:VouchEvidence`) |
| `opda:VouchEvidence` | Substance Kind | subclass of `opda:Evidence` |

Equivalent-class aliases (`Document` ↔ `DocumentEvidence`, etc.) retained for exemplar compatibility per ADR-0011 within-engineering option (b).

See [`classes.md`](./classes.md) for per-class blocks.

## Module class hierarchy

![claim-module--class-hierarchy](diagrams/README/claim-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Claim module — class hierarchy
    accDescr: Eleven OWL classes. Claim and Evidence subtype prov:Entity. VerificationActivity subtypes prov:Activity. Three evidence subtypes (Document, ElectronicRecord, Vouch) with owl:equivalentClass short-name aliases.

    class provEntity["prov_Entity (external)"]
    class provActivity["prov_Activity (external)"]

    class Claim["opda_Claim"] {
        owl_Class
        Information particular
    }
    class Evidence["opda_Evidence"] {
        owl_Class
        Substance Kind
    }
    class DocumentEvidence["opda_DocumentEvidence"] {
        owl_Class
        eIDAS Substantial
    }
    class ElectronicRecordEvidence["opda_ElectronicRecordEvidence"] {
        owl_Class
        eIDAS Substantial
    }
    class VouchEvidence["opda_VouchEvidence"] {
        owl_Class
        eIDAS Low
    }
    class Document["opda_Document (alias)"]
    class ElectronicRecord["opda_ElectronicRecord (alias)"]
    class Vouch["opda_Vouch (alias)"]
    class VerificationActivity["opda_VerificationActivity"] {
        owl_Class
        Event particular
    }
    class TrustFramework["opda_TrustFramework"] {
        owl_Class
        Information Particular
    }
    class AssuranceLevel["opda_AssuranceLevel"] {
        owl_Class
        Quale-in-Region
    }

    provEntity <|-- Claim : rdfs_subClassOf
    provEntity <|-- Evidence : rdfs_subClassOf
    provActivity <|-- VerificationActivity : rdfs_subClassOf
    Evidence <|-- DocumentEvidence : rdfs_subClassOf
    Evidence <|-- ElectronicRecordEvidence : rdfs_subClassOf
    Evidence <|-- VouchEvidence : rdfs_subClassOf
    DocumentEvidence <|.. Document : owl_equivalentClass
    ElectronicRecordEvidence <|.. ElectronicRecord : owl_equivalentClass
    VouchEvidence <|.. Vouch : owl_equivalentClass
```

</details>

## Module shape-target graph

![claim-shapes-and-their-target-classes](diagrams/README/claim-shapes-and-their-target-classes.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E8F5E9", "primaryTextColor": "#1B5E20", "primaryBorderColor": "#2E7D32", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Claim shapes and their target classes
    accDescr: Five SHACL shapes targeting Claim, Evidence, and VerificationActivity. Identity-key shapes are Cat 1; the UnprovenancedClaimShape is Cat 2; two SHACL-AF rules emit derived predicates at Info severity.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix sh: <http://www.w3.org/ns/shacl#>

    classDef shape fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,stroke-dasharray:5 5,color:#1B5E20
    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef rule fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B

    S1[opda:ClaimIdentityKeyShape]:::shape
    S2[opda:EvidenceIdentityKeyShape]:::shape
    S3[opda:UnprovenancedClaimShape]:::shape
    R1[opda:PROVOClaimsRule]:::rule
    R2[opda:VerificationActivitySuccessionRule]:::rule

    C1[opda:Claim]:::cls
    C2[opda:Evidence]:::cls
    C3[opda:VerificationActivity]:::cls

    S1 -->|sh:targetClass| C1
    S2 -->|sh:targetClass| C2
    S3 -->|sh:targetClass| C1
    R1 -->|sh:targetClass| C1
    R2 -->|sh:targetClass| C3
```

</details>

## Module DPV co-annotation graph

![claim-module--dpv-personal-data-co-annotations](diagrams/README/claim-module--dpv-personal-data-co-annotations.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E0F2F1", "primaryTextColor": "#004D40", "primaryBorderColor": "#00695C", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Claim module — DPV personal-data co-annotations
    accDescr: Claim carries dpv-pd:OfficialID baseline. Three evidence-variant refinements scope lawful basis: DocumentEvidence to PublicTask, ElectronicRecordEvidence to LegitimateInterest, VouchEvidence to Consent.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix dpv-pd: <https://w3id.org/dpv/pd#>
    %% @prefix dpv: <https://w3id.org/dpv#>

    classDef pii fill:#E0F2F1,stroke:#00695C,stroke-width:2px,color:#004D40
    classDef dpv fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef refinement fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#BF360C

    C[opda:Claim]:::pii
    D[opda:DocumentEvidence]:::pii
    E[opda:ElectronicRecordEvidence]:::pii
    V[opda:VouchEvidence]:::pii

    OID[dpv-pd:OfficialID]:::dpv
    PT[dpv:PublicTask]:::dpv
    LI[dpv:LegitimateInterest]:::dpv
    CO[dpv:Consent]:::dpv

    C -->|dpv-pd:hasPersonalDataCategory| OID

    R1[DocumentEvidenceRefinement]:::refinement
    R2[ElectronicRecordEvidenceRefinement]:::refinement
    R3[VouchEvidenceRefinement]:::refinement

    R1 -->|opda:targetsKind| D
    R1 -->|opda:lawfulBasis| PT
    R2 -->|opda:targetsKind| E
    R2 -->|opda:lawfulBasis| LI
    R3 -->|opda:targetsKind| V
    R3 -->|opda:lawfulBasis| CO
```

</details>

## SHACL shapes (5 + 2 rules)

| Shape | Severity | Category |
|---|---|---|
| `opda:ClaimIdentityKeyShape` | Violation | Cat 1 |
| `opda:EvidenceIdentityKeyShape` | Violation | Cat 1 |
| `opda:UnprovenancedClaimShape` | Violation | Cat 2 |
| `opda:PROVOClaimsRule` | Info | SHACL-AF |
| `opda:VerificationActivitySuccessionRule` | Info | SHACL-AF |

See [`shapes.md`](./shapes.md) for per-shape blocks.

## DPV annotations

Class-level + 3 evidence refinements. See [`annotations.md`](./annotations.md).

## Source ODR + ADR

- [ODR-0009 — Claims, evidence and provenance](../../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)
- [ODR-0013 — SHACL validation and severity](../../../ontology/odr/ODR-0013-shacl-validation-and-severity.md)
- [ODR-0017 — SHACL-AF quality rules pattern](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ODR-0018 — DPV co-annotation pattern](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
