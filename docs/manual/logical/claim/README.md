---
status: proposed
date: 2026-05-28
tags: [logical-model, claim]
---

# Claim module

Verifiable claims (Claim), the three categories of evidence supporting them (DocumentEvidence, ElectronicRecordEvidence, VouchEvidence with short-name aliases Document, ElectronicRecord, Vouch), the verification activity that produces a verified claim (VerificationActivity), the assurance-level quality judgement (AssuranceLevel), and the trust-framework citation (TrustFramework).

## Entity inventory

| Entity | UFO meta-category | Notes |
|---|---|---|
| [Claim](./claim.md) | Information particular | PROV-O Entity; S009 Q1 80%-PROV-O mapping |
| [Document](./document.md) | Substance Kind (informational; alias) | `owl:equivalentClass` of DocumentEvidence |
| [DocumentEvidence](./document-evidence.md) | Substance Kind (informational) | Paper / scanned artefacts issued by authoritative source |
| [ElectronicRecord](./electronic-record.md) | Substance Kind (informational; alias) | `owl:equivalentClass` of ElectronicRecordEvidence |
| [ElectronicRecordEvidence](./electronic-record-evidence.md) | Substance Kind (informational) | API-retrieved structured records from authoritative source |
| [Evidence](./evidence.md) | Substance Kind (informational) | Generic Evidence supertype; three named subtypes per S009 Rule 5 |
| [TrustFramework](./trust-framework.md) | Information particular | Governance regime that scopes claim validity |
| [VerificationActivity](./verification-activity.md) | Event particular | PROV-O Activity producing a verified claim |
| [Vouch](./vouch.md) | Substance Kind (informational; alias) | `owl:equivalentClass` of VouchEvidence |
| [VouchEvidence](./vouch-evidence.md) | Substance Kind (informational) | Formal attestation by a regulated professional |

## Enumerations bound by this module

| Scheme | Used by attribute | Closed/Open |
|---|---|---|
| [EvidenceMethodScheme](./enumerations/evidence-method-scheme.md) | Evidence-method notation | Closed (3 members per OIDC4IDA) |

## ER diagram

![claim-module--entity-relationship-diagram](diagrams/README/claim-module--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Claim Module — Entity-Relationship Diagram
    accDescr: Claim module entities (Claim, Evidence supertype with three subtypes, three short-name aliases, VerificationActivity, AssuranceLevel, TrustFramework) with intra-module relationships.

    Claim }o--o{ Evidence : "supportedBy / prov:wasDerivedFrom"
    Evidence ||--o| DocumentEvidence : "subtype"
    Evidence ||--o| ElectronicRecordEvidence : "subtype"
    Evidence ||--o| VouchEvidence : "subtype"
    DocumentEvidence ||--|| Document : "owl:equivalentClass"
    ElectronicRecordEvidence ||--|| ElectronicRecord : "owl:equivalentClass"
    VouchEvidence ||--|| Vouch : "owl:equivalentClass"
    VerificationActivity }o--|| Claim : "produces"
    VerificationActivity }o--o| TrustFramework : "dct:conformsTo"
    VouchEvidence }o--|| Person : "attestedBy"
    Claim }o--o{ AssuranceLevel : "assuranceLevel"
```

</details>

Source file: [`../diagrams/claim-er.mmd`](../diagrams/claim-er.mmd).

## Class hierarchy

OWL/RDFS subclass relationships. Claim and Evidence specialise `prov:Entity`. Three Evidence subtypes (DocumentEvidence, ElectronicRecordEvidence, VouchEvidence) each have a short-name `owl:equivalentClass` alias. VerificationActivity specialises `prov:Activity`.

![claim-module--class-hierarchy](diagrams/README/claim-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Claim Module — Class Hierarchy
    accDescr: OWL/RDFS subclass relationships — Claim and Evidence as PROV-O Entity subclasses, three Evidence subtypes with short-name aliases via owl:equivalentClass, VerificationActivity as PROV-O Activity, AssuranceLevel and TrustFramework as Information particulars.

    class provEntity["prov:Entity"]
    class provActivity["prov:Activity"]
    class skosConceptScheme["skos:ConceptScheme"]

    class Claim {
        digest
        hasProvenanceChainStatus (derived)
    }
    class Evidence {
        digest
    }
    class DocumentEvidence
    class ElectronicRecordEvidence
    class VouchEvidence {
        attestedBy : prov:Agent
    }
    class Document {
        alias
    }
    class ElectronicRecord {
        alias
    }
    class Vouch {
        alias
    }
    class VerificationActivity {
        prov:endedAtTime
        hasVerificationSuccessionStatus (derived)
    }
    class AssuranceLevel {
        Quale-in-Region
        Low / Substantial / High / PDTF-Standard
    }
    class TrustFramework {
        framework URI
    }

    provEntity <|-- Claim
    provEntity <|-- Evidence
    Evidence <|-- DocumentEvidence
    Evidence <|-- ElectronicRecordEvidence
    Evidence <|-- VouchEvidence
    DocumentEvidence <|.. Document : equivalentClass
    ElectronicRecordEvidence <|.. ElectronicRecord : equivalentClass
    VouchEvidence <|.. Vouch : equivalentClass
    provActivity <|-- VerificationActivity
```

</details>

## Identity-key summary

![claim-module--identity-key-summary](diagrams/README/claim-module--identity-key-summary.png)

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
    accTitle: Claim Module — Identity-Key Summary
    accDescr: Identity Criterion key surfaces for the eleven claim-module entities — digest-based content-addressable IC for Claim and Evidence subtypes, PROV-O tuple for VerificationActivity, scheme-member for AssuranceLevel, URI for TrustFramework.

    classDef icCell fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef entityCell fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    ClaimE[Claim]:::entityCell -->|"IC"| CIC["digest of<br/>(assertion-content,<br/>evidence-set, attestor)"]:::icCell
    EvidenceE[Evidence]:::entityCell -->|"IC"| EIC["digest (content-addressable)"]:::icCell
    DocumentEvidenceE[DocumentEvidence]:::entityCell -->|"IC"| DEIC["digest (inherited)"]:::icCell
    ElectronicRecordEvidenceE[ElectronicRecordEvidence]:::entityCell -->|"IC"| ERIC["digest (inherited)"]:::icCell
    VouchEvidenceE[VouchEvidence]:::entityCell -->|"IC"| VEIC["digest (inherited)"]:::icCell
    DocumentE[Document]:::entityCell -->|"IC"| DIC["same as DocumentEvidence<br/>(owl:equivalentClass)"]:::icCell
    ElectronicRecordE[ElectronicRecord]:::entityCell -->|"IC"| ERaIC["same as ElectronicRecordEvidence<br/>(owl:equivalentClass)"]:::icCell
    VouchE[Vouch]:::entityCell -->|"IC"| VIC["same as VouchEvidence<br/>(owl:equivalentClass)"]:::icCell
    VerificationActivityE[VerificationActivity]:::entityCell -->|"IC"| VAIC["(Claim, prov-timestamp)"]:::icCell
    AssuranceLevelE[AssuranceLevel]:::entityCell -->|"IC"| ALIC["scheme-member notation<br/>(Low / Substantial /<br/>High / PDTF-Standard)"]:::icCell
    TrustFrameworkE[TrustFramework]:::entityCell -->|"IC"| TFIC["framework URI"]:::icCell
```

</details>
