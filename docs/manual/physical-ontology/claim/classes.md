---
date: 2026-05-28
entityUri: opda:Classes
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
status: proposed
tags:
- physical-ontology
- claim
- classes
- owl
tier: physical-ontology
title: Claim classes
---

# Claim classes

Eleven OWL classes emitted by `opda-gen` into `opda-claim.ttl`.

## Classes

### opda:assuranceLevel — REMOVED

Removed 2026-07-05 (RML gap-closing session): confirmed zero basis anywhere
in the PDTF v3 schema family (no field ever carries an eIDAS Level of
Assurance value). No longer part of the active ontology. See ODR-0009's
own removal amendment for the governance record.

### opda:Claim

```turtle
opda:Claim
    rdf:type owl:Class ;
    rdfs:label "Claim"@en ;
    rdfs:comment "Verifiable claim entity. UFO Information particular; PROV-O Entity. Per S009 Q1 80%-PROV-O mapping. Hard cases: contested assertion (multiple verifications with divergent verdicts); multi-method verification (electronic-record + vouch corroboration); assurance-level downgrade (vouch-only evidence caps at eIDAS Low)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    rdfs:subClassOf prov:Entity ;
    skos:scopeNote "UFO: Information particular (Guizzardi 2005 Ch. 4 §4.7). PROV-O: Entity (W3C PROV-O REC §3.2). The verified claim (claim plus verification bundle) is a derived entity per S009 Rule 1."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "UFO: Information particular. PROV-O: Entity." | Guizzardi 2005 / W3C PROV-O |
| `rdfs:comment @en` | "Verifiable claim entity. Per S009 Q1 80%-PROV-O mapping." | ODR-0009 §Q1 |

#### Targeting shapes

- [`opda:ClaimIdentityKeyShape`](./shapes.md#opdaclaimidentitykeyshape) — Cat 1 (Violation)
- [`opda:UnprovenancedClaimShape`](./shapes.md#opdaunprovenancedclaimshape) — Cat 2 (Violation)
- [`opda:PROVOClaimsRule`](./shapes.md#opdaprovoclaimsrule) — SHACL-AF (Info)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Entity`

#### Cross-tier links

- [Concept tier →](../../concept/claim/claim.md)
- [Logical tier →](../../logical/claim/claim.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)

### opda:Document

```turtle
opda:Document
    rdf:type owl:Class ;
    rdfs:label "Document"@en ;
    rdfs:comment "Alias for opda:DocumentEvidence retained for exemplar compatibility (the diagnostic exemplar set uses the short name). owl:equivalentClass binding ensures one OWL identity; downstream shapes + annotations target the long name (DocumentEvidence) for clarity."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    skos:scopeNote "Short-name alias for opda:DocumentEvidence per ADR-0011 within-engineering option (b) — owl:equivalentClass binding preserves OWL identity without renaming exemplars."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "Short-name alias per ADR-0011 within-engineering option (b)." | ADR-0011 |
| `rdfs:comment @en` | "Alias for opda:DocumentEvidence retained for exemplar compatibility." | ADR-0011 |

#### Subclass / equivalent-class relationships

- `owl:equivalentClass opda:DocumentEvidence` (declared on `opda:DocumentEvidence` side)

#### Cross-tier links

- [Concept tier →](../../concept/claim/document.md) (alias for DocumentEvidence)

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ADR-0011 — within-engineering alias option (b)](/modelling/adr/adr-0011)

### opda:DocumentEvidence

```turtle
opda:DocumentEvidence
    rdf:type owl:Class ;
    rdfs:label "Document Evidence"@en ;
    rdfs:comment "Document-evidence subtype — paper or scanned artefacts issued by authoritative source (e.g. grant of probate by HMCTS). eIDAS Substantial-tier assurance for court-issued instruments. Equivalent class: opda:Document (short-name used by exemplars)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    rdfs:subClassOf opda:Evidence ;
    owl:equivalentClass opda:Document ;
    skos:scopeNote "PROV-O: Entity (W3C PROV-O REC §3.2). OIDC4IDA / eIDAS document-evidence category (S009 Rule 5)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "PROV-O: Entity. OIDC4IDA / eIDAS document-evidence category." | W3C PROV-O / OIDC4IDA |
| `rdfs:comment @en` | "Document-evidence subtype — paper or scanned artefacts. eIDAS Substantial-tier for court-issued instruments." | ODR-0009 §Q1 |

#### Targeting shapes

Inherited from [`opda:EvidenceIdentityKeyShape`](./shapes.md#opdaevidenceidentitykeyshape) via `sh:targetClass opda:Evidence` (Cat 1 — Violation).

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf opda:Evidence`
- `owl:equivalentClass opda:Document`

#### Cross-tier links

- [Concept tier →](../../concept/claim/document-evidence.md)
- [Logical tier →](../../logical/claim/document-evidence.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)

### opda:ElectronicRecord

```turtle
opda:ElectronicRecord
    rdf:type owl:Class ;
    rdfs:label "Electronic Record"@en ;
    rdfs:comment "Alias for opda:ElectronicRecordEvidence retained for exemplar compatibility. owl:equivalentClass binding ensures one OWL identity; downstream shapes + annotations target the long name."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    skos:scopeNote "Short-name alias for opda:ElectronicRecordEvidence per ADR-0011 within-engineering option (b)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "Short-name alias for opda:ElectronicRecordEvidence per ADR-0011 within-engineering option (b)." | ADR-0011 |
| `rdfs:comment @en` | "Alias for opda:ElectronicRecordEvidence retained for exemplar compatibility." | ADR-0011 |

#### Subclass / equivalent-class relationships

- `owl:equivalentClass opda:ElectronicRecordEvidence` (declared on `opda:ElectronicRecordEvidence` side)

#### Cross-tier links

- [Concept tier →](../../concept/claim/electronic-record.md)

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)

### opda:ElectronicRecordEvidence

```turtle
opda:ElectronicRecordEvidence
    rdf:type owl:Class ;
    rdfs:label "Electronic Record Evidence"@en ;
    rdfs:comment "Electronic-record evidence subtype — API-retrieved structured records from authoritative source (e.g. HMRC tax-record API). eIDAS Substantial-tier assurance via real-time API verification. Equivalent class: opda:ElectronicRecord (short-name used by exemplars)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    rdfs:subClassOf opda:Evidence ;
    owl:equivalentClass opda:ElectronicRecord ;
    skos:scopeNote "PROV-O: Entity (W3C PROV-O REC §3.2). OIDC4IDA electronic-record evidence category (S009 Rule 5)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "PROV-O: Entity. OIDC4IDA electronic-record evidence category." | W3C PROV-O / OIDC4IDA |
| `rdfs:comment @en` | "Electronic-record evidence subtype — API-retrieved structured records. eIDAS Substantial-tier." | ODR-0009 §Q1 |

#### Targeting shapes

Inherited from [`opda:EvidenceIdentityKeyShape`](./shapes.md#opdaevidenceidentitykeyshape) via `sh:targetClass opda:Evidence`.

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf opda:Evidence`
- `owl:equivalentClass opda:ElectronicRecord`

#### Cross-tier links

- [Concept tier →](../../concept/claim/electronic-record-evidence.md)
- [Logical tier →](../../logical/claim/electronic-record-evidence.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)

### opda:Evidence

```turtle
opda:Evidence
    rdf:type owl:Class ;
    rdfs:label "Evidence"@en ;
    rdfs:comment "Generic evidence supertype. PROV-O Entity. Three named subtypes per S009 Rule 5 (do NOT collapse): DocumentEvidence (paper or scanned artefacts); ElectronicRecordEvidence (API-retrieved structured records); VouchEvidence (formal attestations by regulated professionals). Each subtype carries type-specific facets; SHACL sh:xone dispatches on subtype at validation time (ADR-0012 emits the shape)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    rdfs:subClassOf prov:Entity ;
    skos:scopeNote "PROV-O: Entity (W3C PROV-O REC §3.2). The three subtypes correspond to OIDC4IDA / eIDAS evidence categories (S009 Rule 5)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "PROV-O: Entity. Three subtypes correspond to OIDC4IDA / eIDAS evidence categories." | W3C PROV-O / OIDC4IDA |
| `rdfs:comment @en` | "Generic evidence supertype. Three named subtypes per S009 Rule 5 (do NOT collapse)." | ODR-0009 §Q1 |

#### Targeting shapes

- [`opda:EvidenceIdentityKeyShape`](./shapes.md#opdaevidenceidentitykeyshape) — Cat 1 (Violation)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Entity`
- Superclass of `opda:DocumentEvidence`, `opda:ElectronicRecordEvidence`, `opda:VouchEvidence`

#### Cross-tier links

- [Concept tier →](../../concept/claim/evidence.md)
- [Logical tier →](../../logical/claim/evidence.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0009 §Q1 + Rule 5](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)

### opda:TrustFramework

```turtle
opda:TrustFramework
    rdf:type owl:Class ;
    rdfs:label "Trust Framework"@en ;
    rdfs:comment "Trust framework citation — a governance regime that scopes claim validity (e.g. the UK Property Data Trust Framework). Per S009 5-residue mapped to dct:conformsTo on the verification activity (NOT a PROV-O primitive). Authoritative within scope per Session 003c Item 3 (OPDA TF authoritative scope)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q5> ;
    skos:scopeNote "UFO: Information Particular (governance regime as informational artefact). dct:conformsTo binding per S009 Rule 5 (PROV-O residue)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q5>` | [ODR-0009 §Q5](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "UFO: Information Particular. dct:conformsTo binding per S009 Rule 5." | Guizzardi 2005 / S009 Rule 5 |
| `rdfs:comment @en` | "Trust framework citation — governance regime scoping claim validity. PDTF authoritative." | ODR-0009 §Q5 |

#### Targeting shapes

None directly (citation pattern; `dct:conformsTo` carries the binding).

#### Cross-tier links

- [Concept tier →](../../concept/claim/trust-framework.md)
- [Logical tier →](../../logical/claim/trust-framework.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0009 §Q5](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)

### opda:VerificationActivity

```turtle
opda:VerificationActivity
    rdf:type owl:Class ;
    rdfs:label "Verification Activity"@en ;
    rdfs:comment "Verification activity recording the production of a verified claim from evidence. PROV-O Activity. The OIDC4IDA single 'time' is the completion instant → prov:endedAtTime. Uses qualified form prov:qualifiedAttribution → prov:Attribution with prov:hadRole so validation_method / verification_method are not discarded."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    rdfs:subClassOf prov:Activity ;
    skos:scopeNote "PROV-O: Activity (W3C PROV-O REC §3.2). UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "PROV-O: Activity. UFO: Event particular." | W3C PROV-O / Guizzardi 2005 |
| `rdfs:comment @en` | "Verification activity recording production of a verified claim from evidence. Qualified form for method preservation." | ODR-0009 §Q1 + §Q2 |

#### Targeting shapes

- [`opda:VerificationActivitySuccessionRule`](./shapes.md#opdaverificationactivitysuccessionrule) — SHACL-AF (Info)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Activity`

#### Cross-tier links

- [Concept tier →](../../concept/claim/verification-activity.md)
- [Logical tier →](../../logical/claim/verification-activity.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0009 §Q1 + §Q2 + §Q7](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)

### opda:Vouch

```turtle
opda:Vouch
    rdf:type owl:Class ;
    rdfs:label "Vouch"@en ;
    rdfs:comment "Alias for opda:VouchEvidence retained for exemplar compatibility. owl:equivalentClass binding ensures one OWL identity."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    skos:scopeNote "Short-name alias for opda:VouchEvidence per ADR-0011 within-engineering option (b)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "Short-name alias for opda:VouchEvidence per ADR-0011 within-engineering option (b)." | ADR-0011 |
| `rdfs:comment @en` | "Alias for opda:VouchEvidence retained for exemplar compatibility." | ADR-0011 |

#### Subclass / equivalent-class relationships

- `owl:equivalentClass opda:VouchEvidence` (declared on `opda:VouchEvidence` side)

#### Cross-tier links

- [Concept tier →](../../concept/claim/vouch.md)

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)

### opda:VouchEvidence

```turtle
opda:VouchEvidence
    rdf:type owl:Class ;
    rdfs:label "Vouch Evidence"@en ;
    rdfs:comment "Vouch evidence subtype — formal attestation by a regulated professional (e.g. SRA-licensed solicitor). Qualitatively weaker than document or electronic-record evidence; eIDAS Low assurance regardless of voucher quality (Q3 SKOS scheme). The vouch is prov:wasAttributedTo an Agent — an attestation, not a document derivation. Equivalent class: opda:Vouch."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    rdfs:subClassOf opda:Evidence ;
    owl:equivalentClass opda:Vouch ;
    skos:scopeNote "PROV-O: Entity (W3C PROV-O REC §3.2). OIDC4IDA / eIDAS vouch-evidence category (S009 Rule 5). Vouch is prov:wasAttributedTo an Agent — an attestation, not a document."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1>` | [ODR-0009 §Q1](/modelling/odr/odr-0009) |
| `skos:scopeNote @en` | "PROV-O: Entity. OIDC4IDA / eIDAS vouch-evidence category. Vouch is prov:wasAttributedTo an Agent." | W3C PROV-O / OIDC4IDA |
| `rdfs:comment @en` | "Vouch evidence subtype — formal attestation by regulated professional. eIDAS Low regardless of voucher quality." | ODR-0009 §Q1 + §Q3 |

#### Targeting shapes

Inherited from [`opda:EvidenceIdentityKeyShape`](./shapes.md#opdaevidenceidentitykeyshape) via `sh:targetClass opda:Evidence`.

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf opda:Evidence`
- `owl:equivalentClass opda:Vouch`

#### Cross-tier links

- [Concept tier →](../../concept/claim/vouch-evidence.md)
- [Logical tier →](../../logical/claim/vouch-evidence.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0009 §Q1 + §Q3](/modelling/odr/odr-0009)
- [ADR-0011](/modelling/adr/adr-0011)
