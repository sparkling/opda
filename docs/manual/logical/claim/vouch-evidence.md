---
entityUri: opda:VouchEvidence
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: logical
title: Vouch Evidence
---

# Vouch Evidence

## Summary

Vouch evidence subtype — formal attestation by a regulated professional (e.g. SRA-licensed solicitor). [Substance Kind (informational); PROV-O Entity]. Qualitatively weaker than document or electronic-record evidence; eIDAS Low assurance regardless of voucher quality. The vouch is `prov:wasAttributedTo` an Agent — an attestation, not a document derivation. Equivalent class: [Vouch](./vouch.md).
[Concept tier →](../../concept/claim/vouch-evidence.md)

## Attributes

Inherits `digest` from [Evidence](./evidence.md). Declares no additional subtype-specific datatype properties at this tier.

## Relationships

| Predicate | Target entity | Cardinality | Inverse | Description |
|---|---|---|---|---|
| `attestedBy` | `prov:Agent` (typically Person) | `1..1` | — | Vouch → Agent attestation join (mirror of `prov:wasAttributedTo` for vouch-specific use). The voucher's role is captured via `prov:qualifiedAttribution` → `prov:Attribution` → `prov:hadRole` per S009 Q2 qualified-form discipline |

## Identity key

Identity key = `digest` (inherited from Evidence). Content-addressable.

## Constraints

Inherits `EvidenceIdentityKeyShape` constraint on `digest` from Evidence. No additional non-cardinality constraints emitted at this tier.

## Derived attributes

None.

## ER diagram

![vouchevidence--entity-relationship-diagram](diagrams/vouch-evidence/vouchevidence--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: VouchEvidence — Entity-Relationship Diagram
    accDescr: Direct-neighbour view of VouchEvidence — Evidence subtype with Vouch short-name alias, Claim supportedBy, attestedBy a Person (typically a regulated professional).

    Evidence ||--o| VouchEvidence : "subtype"
    VouchEvidence ||--|| Vouch : "owl:equivalentClass"
    VouchEvidence }o--|| Person : "attestedBy"
    Claim }o--o{ VouchEvidence : "supportedBy"
```

</details>

## Source ODR + ADR

- [ODR-0009 — Claims + Evidence + Verification](/modelling/odr/odr-0009), §Q1 + §Q2 qualified-form; Rule 5 three-subtype discipline
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — implementation
