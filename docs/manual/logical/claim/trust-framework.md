---
entityUri: opda:TrustFramework
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: logical
title: Trust Framework
---

# Trust Framework

## Summary

Trust framework citation — a governance regime that scopes claim validity (e.g. the UK Property Data Trust Framework). [Information particular; UFO Information Particular]. Per S009 5-residue mapped to `dct:conformsTo` on the verification activity (NOT a PROV-O primitive). Authoritative within scope per Session 003c Item 3 (OPDA TF authoritative scope).
[Concept tier →](../../concept/claim/trust-framework.md)

## Attributes

This entity declares no module-local datatype properties. The trust-framework's identity is borne by its dereferenceable URI.

## Relationships

This entity declares no module-local object properties. Inbound predicates: [VerificationActivity](./verification-activity.md) cites the TrustFramework via `dct:conformsTo`.

## Identity key

Identity = framework URI. Each TrustFramework is identified by a single dereferenceable URI (e.g. the OPDA TF root URI).

## Constraints

No SHACL Violation/Warning shapes emitted on TrustFramework at this tier.

## Derived attributes

None.

## ER diagram

![trustframework--entity-relationship-diagram](diagrams/trust-framework/trustframework--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: TrustFramework — Entity-Relationship Diagram
    accDescr: TrustFramework citation — referenced by VerificationActivity via dct:conformsTo (the S009 5-residue local term).

    VerificationActivity }o--o| TrustFramework : "dct:conformsTo"
```

</details>

## Source ODR + ADR

- [ODR-0009 — Claims + Evidence + Verification](/modelling/odr/odr-0009), §Q5 TrustFramework
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — implementation
