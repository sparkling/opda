---
entityUri: opda:ElectronicRecordEvidence
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: logical
title: Electronic Record Evidence
---

# Electronic Record Evidence

## Summary

Electronic-record evidence subtype — API-retrieved structured records from authoritative source (e.g. HMRC tax-record API). [Substance Kind (informational); PROV-O Entity]. eIDAS Substantial-tier assurance via real-time API verification. Equivalent class: [ElectronicRecord](./electronic-record.md) (short-name used by exemplars).
[Concept tier →](../../concept/claim/electronic-record-evidence.md)

## Attributes

Inherits `digest` from [Evidence](./evidence.md). Declares no additional subtype-specific datatype properties at this tier.

## Relationships

This entity declares no module-local object properties beyond those inherited from `Evidence`.

## Identity key

Identity key = `digest` (inherited from Evidence). Content-addressable.

## Constraints

Inherits `EvidenceIdentityKeyShape` constraint on `digest` from Evidence. No additional non-cardinality constraints emitted at this tier.

## Derived attributes

None.

## ER diagram

![electronicrecordevidence--entity-relationship-diagram](diagrams/electronic-record-evidence/electronicrecordevidence--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: ElectronicRecordEvidence — Entity-Relationship Diagram
    accDescr: Direct-neighbour view of ElectronicRecordEvidence — Evidence subtype with ElectronicRecord short-name alias and Claim supportedBy.

    Evidence ||--o| ElectronicRecordEvidence : "subtype"
    ElectronicRecordEvidence ||--|| ElectronicRecord : "owl:equivalentClass"
    Claim }o--o{ ElectronicRecordEvidence : "supportedBy"
```

</details>

## Source ODR + ADR

- [ODR-0009 — Claims + Evidence + Verification](/modelling/odr/odr-0009), §Q1 + Rule 5 three-subtype discipline
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — implementation
