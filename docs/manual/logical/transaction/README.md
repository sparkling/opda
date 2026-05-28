---
status: proposed
date: 2026-05-28
tags: [logical-model, transaction]
---

# Transaction module

The Transaction Relator (which founds Buyer and Seller Roles), its lifecycle Milestones (instruction / offer-accepted / exchange / completion / registration), and the TransactionChain aggregate that groups dependent Transactions linked by buyer-also-seller participant overlap.

## Entity inventory

| Entity | UFO meta-category | Notes |
|---|---|---|
| [Milestone](./milestone.md) | Event particular | PROV-O Activity; hybrid instant/interval typing per S007 Q2 |
| [Transaction](./transaction.md) | Relator | FIBO Arrangement precedent; founds Seller + Buyer Roles |
| [TransactionChain](./transaction-chain.md) | Aggregate | Recursive predicate + Chain-with-members dual modelling per S007 Q4 |

## Enumerations bound by this module

| Scheme | Used by attribute | Closed/Open |
|---|---|---|
| [MilestoneKindScheme](./enumerations/milestone-kind-scheme.md) | Milestone kind notation | Closed (5 members) |
| [TransactionStatusScheme](./enumerations/transaction-status-scheme.md) | Transaction lifecycle phase | Closed (5 members) |

## ER diagram

![transaction-module--entity-relationship-diagram](diagrams/README/transaction-module--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Transaction Module — Entity-Relationship Diagram
    accDescr: Transaction Relator, lifecycle Milestones, and TransactionChain aggregate with intra-module relationships and cross-module ties to Seller, Buyer, and LegalEstate.

    Transaction ||--o{ Milestone : "hasMilestone"
    Transaction ||--o{ Seller : "founds"
    Transaction ||--o{ Buyer : "founds"
    Transaction }o--o| TransactionChain : "hasChainPosition"
    TransactionChain ||--o{ Transaction : "chainMembers"
    Transaction }o--o{ LegalEstate : "concerns"
    Milestone }o--o| Plan : "qualifiedAssociation hadPlan (plannedAtTime)"
```

</details>

Source file: [`../diagrams/transaction-er.mmd`](../diagrams/transaction-er.mmd).

## Class hierarchy

OWL/RDFS subclass relationships. Transaction specialises foundation Relator. Milestone specialises `prov:Activity`. TransactionChain is an Aggregate.

![transaction-module--class-hierarchy](diagrams/README/transaction-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Transaction Module — Class Hierarchy
    accDescr: OWL/RDFS subclass relationships — Transaction as Relator subclass, Milestone as PROV-O Activity, TransactionChain as Aggregate, plus FIBO Arrangement precedent for Transaction.

    class Relator
    class provActivity["prov:Activity"]
    class fiboArrangement["fibo-fnd-agr:Arrangement"]

    class Transaction {
        occurredAtTime
        hasChainPosition
        founds Seller and Buyer
        concerns LegalEstate
    }
    class Milestone {
        occurredAtTime
        plannedAtTime
        hasVarianceStatus (derived)
        hasVarianceDays (derived)
    }
    class TransactionChain {
        chainMembers : 1..*
        chain-length cap 7
        chain-status (derived)
    }

    Relator <|-- Transaction
    fiboArrangement <|.. Transaction : precedent
    provActivity <|-- Milestone
```

</details>

## Identity-key summary

![transaction-module--identity-key-summary](diagrams/README/transaction-module--identity-key-summary.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Transaction Module — Identity-Key Summary
    accDescr: Identity Criterion key surfaces for the three transaction-module entities — 5-tuple Relator IC for Transaction, MilestoneKind tuple for Milestone, unordered member set for TransactionChain.

    classDef icCell fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef entityCell fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    TransactionE[Transaction]:::entityCell -->|"IC"| TIC["5-tuple:<br/>(LegalEstate-concerned,<br/>Sellers-set, Buyers-set,<br/>transaction-id-lineage,<br/>founding-event)"]:::icCell
    MilestoneE[Milestone]:::entityCell -->|"IC"| MIC["(Transaction, MilestoneKind)"]:::icCell
    TransactionChainE[TransactionChain]:::entityCell -->|"IC"| CIC["unordered set of<br/>Transaction members"]:::icCell
```

</details>
