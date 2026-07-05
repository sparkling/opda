---
entityUri: opda:Property
kind: entity
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: concept
title: Property
---

# Property

A Property is the physical residential property — the bricks-and-mortar object: a house, a flat, a bungalow, a maisonette.

## Why it matters

Property is the anchor of the entire OPDA model. Every Legal Estate is vested in a Property; every Registered Title documents a Property; every Transaction concerns a Property. If two records disagree on whether they describe the same Property, every downstream relationship inherits that disagreement.

OPDA's Property Identity Criterion is hybrid by design: it tracks **spatial-material continuity** (the bricks remain) but allows **legal-record discontinuity** to override (the registry record shows replacement, even if the bricks are the same). This is the conscious choice that lets OPDA handle real-world hard cases without forcing a one-rule-fits-all answer.

If you are a surveyor, conveyancer, or lender asking "is this the same Property after the works?", this is the entity whose IC answers you.

## Hard cases

- **Demolition.** A house is demolished and a new one built on the same footprint. Spatial continuity is broken; the new Property is a different Property even though the footprint is the same.
- **Subdivision.** One house is split into two flats. One Property becomes two — none of the three are identical to one another.
- **Merger.** Two adjoining flats are knocked into one. Two Properties become one — none of the three are identical to one another.
- **Replacement.** A house is partially demolished and rebuilt. Spatial-material continuity is contested; the legal-record-discontinuity override (registry evidence of a new title) is what tips the IC.
- **First registration.** A long-existing unregistered house enters the HMLR register for the first time. The Property's identity does not begin at first registration — the IC accommodates the absence of registry evidence prior to that point.
- **Flat with split UPRN.** One physical flat receives two UPRNs from OS AddressBase. The IC chooses: one Property bearing two address records, not two Properties.

## Identity Criterion

Two Property records refer to the same Property if they describe the same **spatial-material continuant** — the same bricks-and-mortar object — *unless* legal-record evidence (a registry replacement, a demolition certificate) overrides the spatial reading. The override is the IC's response to "the bricks look the same but the legal record says otherwise". See the [Logical tier →](../../logical/property/property.md) for the typed structure.

### IC walk-through: per hard case

How each named hard case resolves under the IC:

![property-ic-walk-through-per-hard-case](diagrams/property/property-ic-walk-through-per-hard-case.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Property IC walk-through per hard case
    accDescr: Six named hard cases map to one of three outcomes — Property identity persists, identity breaks (new Property), or splits into multiple Properties — by combining the spatial-material and legal-record evidence.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef errorState fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C

    Demolition["Demolition<br/>(new build, same footprint)"]:::cls
    Subdivision["Subdivision<br/>(one becomes two)"]:::cls
    Merger["Merger<br/>(two become one)"]:::cls
    Replacement["Replacement<br/>(partial rebuild)"]:::cls
    FirstReg["First registration<br/>(unregistered → HMLR)"]:::cls
    SplitUPRN["Split UPRN<br/>(one flat, two UPRNs)"]:::cls

    Persists(["Property persists"]):::success
    NewProperty(["NEW Property"]):::errorState
    Splits(["Splits / merges"]):::warning

    Demolition --> NewProperty
    Replacement --> NewProperty
    Subdivision --> Splits
    Merger --> Splits
    FirstReg --> Persists
    SplitUPRN --> Persists
```

</details>

## Related Kinds

- [Address](./address.md) — a Property has one or more Addresses (title / marketing / INSPIRE variants)
- [Legal Estate](./legal-estate.md) — a Property has one or more Legal Estates vested in it
- [Registered Title](./registered-title.md) — a Property may be documented by one or more Registered Titles
- [Transaction](../transaction/transaction.md) — every Transaction concerns a Property

### Related-Kinds graph

![property-related-kinds-neighbourhood-graph](diagrams/property/property-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Property related-Kinds neighbourhood graph
    accDescr: One-hop neighbourhood of Property — direct connections to Address, Legal Estate, Registered Title, UPRN Succession Event, and Transaction.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    Property["Property"]:::centre
    Address["Address"]:::cls
    LegalEstate["LegalEstate"]:::cls
    RegisteredTitle["RegisteredTitle"]:::cls
    UPRNSucc["UPRNSuccessionEvent"]:::cls
    Transaction["Transaction"]:::ext

    Property -->|"hasAddress"| Address
    Property -->|"hasLegalEstate"| LegalEstate
    Property -->|"documentedBy"| RegisteredTitle
    UPRNSucc -->|"re-numbers"| Property
    Transaction -->|"concerns"| Property
```

</details>

## Source ODR

[ODR-0005 — Property/Land identity crux §2a](/modelling/odr/odr-0005)
