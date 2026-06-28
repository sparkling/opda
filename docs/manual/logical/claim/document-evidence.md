---
entityUri: opda:DocumentEvidence
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: logical
title: Document Evidence
---

# Document Evidence

## Summary

Document-evidence subtype — paper or scanned artefacts issued by an authoritative source (e.g. grant of probate by HMCTS). [Substance Kind (informational); PROV-O Entity]. eIDAS Substantial-tier assurance for court-issued instruments. Equivalent class: [Document](./document.md) (short-name used by exemplars).
[Concept tier →](../../concept/claim/document-evidence.md)

## Attributes

Inherits `digest` from [Evidence](./evidence.md). Declares no additional subtype-specific datatype properties at this tier.

## Relationships

This entity declares no module-local object properties beyond those inherited from `Evidence`.

## Identity key

Identity key = `digest` (inherited from Evidence). Per-Evidence-instance, content-addressable.

## Constraints

Inherits `EvidenceIdentityKeyShape` constraint on `digest` from Evidence. No additional non-cardinality constraints emitted at this tier.

## Derived attributes

None.

## ER diagram

![documentevidence--entity-relationship-diagram](diagrams/document-evidence/documentevidence--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: DocumentEvidence — Entity-Relationship Diagram
    accDescr: Direct-neighbour view of DocumentEvidence — Evidence subtype with Document short-name alias and Claim supportedBy.

    Evidence ||--o| DocumentEvidence : "subtype"
    DocumentEvidence ||--|| Document : "owl:equivalentClass"
    Claim }o--o{ DocumentEvidence : "supportedBy"
```

</details>

## Source ODR + ADR

- [ODR-0009 — Claims + Evidence + Verification](/modelling/odr/odr-0009), §Q1 + Rule 5 three-subtype discipline
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — implementation
