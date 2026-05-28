---
entityUri: opda:LeaseTerm
kind: entity
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: logical
title: Lease Term
---

# Lease Term

## Summary

OWL-Time `ProperInterval` representing a leasehold term. Carries `time:hasBeginning` + `time:hasDurationDescription` (or `time:hasEnd`) per S007 Q5. [Information particular; UFO Information particular bounding a leasehold tenure perdurant]. Belongs to a leasehold [LegalEstate](./legal-estate.md). Modified by [LeaseExtensionEvent](./lease-extension-event.md) on statutory extension — extension produces a successor LeaseTerm with a `prov:wasDerivedFrom` chain.
[Concept tier →](../../concept/property/lease-term.md)

## Attributes

This entity declares no module-local datatype properties beyond those inherited from `time:ProperInterval` (`time:hasBeginning`, `time:hasEnd`, `time:hasDurationDescription`). These OWL-Time predicates are platform-agnostic and not re-emitted at the Logical tier.

## Relationships

This entity declares no module-local object properties. Inbound predicates: `LegalEstate.leaseTerm`; `LeaseExtensionEvent` produces a successor via PROV-O.

## Identity key

Identity key = `(LegalEstate, time:hasBeginning, time:hasEnd)` or `(LegalEstate, time:hasBeginning, time:hasDurationDescription)`. A LeaseTerm is parasitic on its parent LegalEstate; on lease extension a successor LeaseTerm is minted via `prov:wasDerivedFrom`. Cross-reference: Concept-tier [LeaseTerm narrative](../../concept/property/lease-term.md).

## Constraints

No SHACL Violation/Warning shapes emitted on LeaseTerm at this tier — the OWL-Time interval shape constraints are inherited from the upstream W3C Time Ontology recommendation.

## Derived attributes

| Attribute | Derived from | Rule summary | Severity |
|---|---|---|---|
| `hasLeaseTermSuccessionStatus` | `prov:wasDerivedFrom` chain to predecessor LeaseTerm | `extended-from-predecessor` when a prior LeaseTerm is named via prov; `primary-term` otherwise | `Info` |

## ER diagram

![leaseterm--entity-relationship-diagram](diagrams/lease-term/leaseterm--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: LeaseTerm — Entity-Relationship Diagram
    accDescr: Direct-neighbour view of LeaseTerm — bounded by LegalEstate, succeeded by LeaseExtensionEvent, and chained via PROV-O wasDerivedFrom to its predecessor.

    LegalEstate ||--o| LeaseTerm : "leaseTerm"
    LeaseExtensionEvent }o--|| LeaseTerm : "produces successor"
    LeaseTerm }o--|| LeaseTerm : "prov:wasDerivedFrom"
```

</details>

## Lifecycle state-transition diagram

LeaseTerm is parasitic on its parent LegalEstate. Each LeaseExtensionEvent mints a successor LeaseTerm via `prov:wasDerivedFrom`, forming a PROV chain of predecessor → successor terms.

![leaseterm--lifecycle-state-transition-diagram](diagrams/lease-term/leaseterm--lifecycle-state-transition-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
stateDiagram-v2
    accTitle: LeaseTerm — Lifecycle State-Transition Diagram
    accDescr: LeaseTerm lifecycle — primary term minted on lease grant, successor terms minted on LeaseExtensionEvent forming a PROV-O lineage chain.

    [*] --> Primary : lease grant
    Primary --> Successor : LeaseExtensionEvent<br/>prov:wasDerivedFrom
    Successor --> Successor : further extension<br/>(chain continues)
    Primary --> Expired : term reached time:hasEnd
    Successor --> Expired : term reached time:hasEnd
    Expired --> [*]
```

</details>

## Source ODR + ADR

- [ODR-0007 — Transaction lifecycle](../../../ontology/odr/ODR-0007-transaction-lifecycle.md), §Q5 LeaseTerm
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md) — implementation
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md) — derived-attribute rule
