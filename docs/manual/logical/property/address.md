---
entityUri: opda:Address
kind: entity
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: logical
title: Address
---

# Address

## Summary

Socially-recognised locator constructed by an authority (Royal Mail / OS AddressBase / HMLR / INSPIRE) and persisting as a record-entity in that authority's stewardship. [Substance Kind; UFO Substance Kind / DOLCE NonPhysicalEndurant — Searle 1995 institutional fact grounding]. Identity criterion holds over five hard cases per ODR-0015 §3a: cosmetic re-format, authority-internal succession, cross-variant identity-claim never collapses, Property-side change, INSPIRE-only locatedness. Subclass of `vcard:Address` for structural compatibility with vCard consumers.
[Concept tier →](../../concept/property/address.md)

## Attributes

| Attribute | Type | Cardinality | Required | Identity-bearing | Description |
|---|---|---|---|---|---|
| `addressVariant` | `EnumScheme:AddressVariantScheme` | `1..1` | Y | Y | Required tag naming the authority and lifecycle for this Address instance (`title` / `marketing` / `inspire` / `postal`) |

Additional structural attributes (street / locality / postcode / etc.) are inherited from the `vcard:Address` superclass and are not re-emitted at this tier.

## Relationships

This entity declares no module-local object properties. Inbound predicates: `Property.hasAddress`.

## Identity key

Identity key = `addressVariant` + authority-record identifier (within the variant's authority lifecycle). Per ODR-0015 Rule 6 the variant is the typed surface that determines the authority context against which the rest of the address record is interpreted. Cross-variant identity-claims are forbidden: a title-variant Address and an inspire-variant Address may co-refer to the same physical Property but they are distinct Address individuals. Cross-reference: Concept-tier [Address IC narrative](../../concept/property/address.md#identity-criterion).

## Constraints

- `addressVariant` MUST be a single `string` value drawn from `AddressVariantScheme` (`Violation`, `AddressIdentityKeyShape`)
- An Address is NOT a UFO Mode (S015 Q1 commitment — distinct from Property modes / Property qualities)

## Derived attributes

| Attribute | Derived from | Rule summary | Severity |
|---|---|---|---|
| `hasINSPIRESuccessionStatus` | `addressVariant = "inspire"` + `prov:wasDerivedFrom` chain | `inspire-re-issued` when a prior inspire-variant Address is named via prov; `inspire-primary` otherwise | `Info` |

## ER diagram

![address--entity-relationship-diagram](diagrams/address/address--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Address — Entity-Relationship Diagram
    accDescr: Direct-neighbour view of Address — Property hasAddress join with optional PROV-O wasDerivedFrom chain within the same address variant.

    Property ||--o{ Address : "hasAddress"
    Address }o--|| Address : "prov:wasDerivedFrom (within variant)"
```

</details>

## Source ODR + ADR

- [ODR-0015 — Address](/modelling/odr/odr-0015), §2a Address IC; §Rule 6 variant discipline
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — implementation
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012) — shapes
