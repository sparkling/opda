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
| [AssuranceLevel](./assurance-level.md) | Quale-in-Region | eIDAS Level of Assurance (Low / Substantial / High); backed by AssuranceLevelScheme |
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
| [AssuranceLevelScheme](./enumerations/assurance-level-scheme.md) | AssuranceLevel members | Closed (4 members — eIDAS + PDTF-Standard) |
| [EvidenceMethodScheme](./enumerations/evidence-method-scheme.md) | Evidence-method notation | Closed (3 members per OIDC4IDA) |

## ER diagram

```mermaid
erDiagram
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

Source file: [`../diagrams/claim-er.mmd`](../diagrams/claim-er.mmd).
