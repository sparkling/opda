---
entityUri: opda:RegisteredTitle
kind: entity
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
tier: concept
title: Registered Title
---

# Registered Title

A Registered Title is the **HMLR title-register record** documenting a Legal Estate. It is the registry's representation of the estate, not the estate itself.

## Why it matters

OPDA keeps the Registered Title separate from the Legal Estate it documents because the two evolve on different lifecycles. A Title can be closed and a successor opened while the underlying Legal Estate persists; a Legal Estate can exist before first registration and after closure of the documenting Title. Separating the two lets the model handle every registry lifecycle event (first registration, closure, merger, reissuance) as a registry-side change without dragging the Legal Estate's identity along with it.

If you are a conveyancer or lender investigating "the title number changed — is it the same property?", this is the entity whose IC answers you.

## Hard cases

- **First registration.** A long-existing unregistered estate is registered for the first time — a new Registered Title comes into existence. The Title's identity begins here, even though the Legal Estate it documents is older.
- **Title closure.** A Registered Title is closed (e.g. on amalgamation). The Title's identity ceases; the underlying Legal Estate may persist into a successor Title.
- **Title merger.** Two Registered Titles are merged into one — one Title ceases, the other absorbs (or a fresh successor opens, per registry practice). The IC tracks the lineage explicitly via reified registry events.
- **Transfer between registers.** A Title moves between district registries. The IC distinguishes administrative move (same Title, different register) from reissuance (new Title).
- **Title reissue on corrupt-plan replacement.** HMLR reissues a Title because the original plan was corrupt. The reissue is a successor — a new Title, with a lineage link to the predecessor.

## Identity Criterion

Two records refer to the same Registered Title if they describe the same **title-number lineage** — same HMLR title number, plus the chain of registry events documented against that number. Every lifecycle event (registration, closure, merger, reissuance) is captured as a reified registry activity with an explicit predecessor chain. See the [Logical tier →](../../logical/property/registered-title.md) for the typed structure.

### IC walk-through: registry-event decision flow

How each registry event resolves under the Title IC — same Title, successor Title, or ceased Title:

![registered-title-ic-decision-flow](diagrams/registered-title/registered-title-ic-decision-flow.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TD
    accTitle: Registered Title IC decision flow
    accDescr: Decision tree for Registered Title identity across registry events — first registration starts a Title; reissue and transfer-between-registers preserve identity differently (reissue produces a successor with lineage link; transfer is the same Title in a new register); closure and merger end the Title.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef errorState fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C

    Start(["Registry event<br/>affecting Title"]):::cls
    Q1{"First registration?"}:::cls
    Q2{"Title closure<br/>(amalgamation, etc.)?"}:::cls
    Q3{"Title merger<br/>into another?"}:::cls
    Q4{"Reissue<br/>(corrupt plan, etc.)?"}:::cls
    Q5{"Transfer between<br/>district registries?"}:::cls

    StartTitle(["NEW Title<br/>(identity begins)"]):::success
    Ceases(["Title CEASES<br/>(LegalEstate may persist)"]):::errorState
    Successor(["SUCCESSOR Title<br/>(lineage link to predecessor)"]):::warning
    SameTitle(["SAME Title<br/>(different register)"]):::success
    Update(["Routine update<br/>(no lineage break)"]):::success

    Start --> Q1
    Q1 -->|"Yes"| StartTitle
    Q1 -->|"No"| Q2
    Q2 -->|"Yes"| Ceases
    Q2 -->|"No"| Q3
    Q3 -->|"Yes"| Ceases
    Q3 -->|"No"| Q4
    Q4 -->|"Yes"| Successor
    Q4 -->|"No"| Q5
    Q5 -->|"Yes"| SameTitle
    Q5 -->|"No"| Update
```

</details>

## Related Kinds

- [Legal Estate](./legal-estate.md) — a Registered Title documents a Legal Estate (the canonical join predicate is `recordsEstate`)
- [Property](./property.md) — a Registered Title identifies the Property in which the documented Legal Estate is vested
- [Proprietorship](../agent/proprietorship.md) — binds Proprietors to a Registered Title

### Related-Kinds graph

![registered-title-related-kinds-neighbourhood-graph](diagrams/registered-title/registered-title-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Registered Title related-Kinds neighbourhood graph
    accDescr: One-hop neighbourhood of Registered Title — documents Legal Estate, identifies the Property's Legal Estate vesting, bound by Proprietorship, updated by Lease Extension Event.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    Title["RegisteredTitle"]:::centre
    LegalEstate["LegalEstate"]:::cls
    Property["Property"]:::cls
    Proprietorship["Proprietorship"]:::ext
    LeaseExt["LeaseExtensionEvent"]:::cls

    Title -->|"documents (recordsEstate)"| LegalEstate
    Title -->|"identifies"| Property
    Proprietorship -->|"binds"| Title
    LeaseExt -->|"updates"| Title
```

</details>

## Source ODR

[ODR-0005 — Property/Land identity crux §3c](/modelling/odr/odr-0005)
