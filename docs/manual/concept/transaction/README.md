# Transaction

The Transaction module covers the Transaction Relator itself, the Milestones that mark its lifecycle, and the Transaction Chain that aggregates dependent Transactions.

A Transaction is *not* a property of any one party — it is a relational entity in its own right, founded by an event (typically offer acceptance), binding Seller(s) + Buyer(s) + the Legal Estate concerned. Its lifecycle is recorded as a sequence of Milestones (instruction, offer accepted, exchange, completion, registration), each with planned-vs-actual variance.

Transaction Chains are aggregates of dependent Transactions linked by the typical buyer-also-seller overlap that characterises UK residential chains.

## Entities

- [Milestone](./milestone.md) — a point or interval in the Transaction lifecycle
- [Transaction](./transaction.md) — a residential-property transaction binding Sellers + Buyers + Legal Estate
- [Transaction Chain](./transaction-chain.md) — an aggregate of dependent Transactions

## Module-internal relationships

How the Transaction Relator binds its founded Roles, accrues Milestones, and aggregates into Chains:

![transaction-module-internal-relationships](diagrams/README/transaction-module-internal-relationships.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Transaction module internal relationships
    accDescr: Transaction binds Seller and Buyer Role-Mixins founded by the same offer-acceptance event; conveys a LegalEstate; accrues Milestones across its lifecycle; aggregates into a TransactionChain via buyer-also-seller overlap.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef rel fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    %% Transaction module
    Transaction["Transaction<br/>(Relator)"]:::rel
    Milestone["Milestone<br/>(instant or interval)"]:::cls
    Chain["TransactionChain<br/>(aggregate)"]:::cls

    %% Cross-module
    LegalEstate["LegalEstate<br/>(property module)"]:::ext
    Seller["Seller<br/>(agent module)"]:::ext
    Buyer["Buyer<br/>(agent module)"]:::ext
    Person["Person<br/>(agent module)"]:::ext
    Claim["Claim<br/>(claim module)"]:::ext

    %% Transaction-internal
    Transaction -->|"hasMilestone (1..*)"| Milestone
    Transaction -->|"memberOf (0..1)"| Chain
    Chain -->|"hasMember (1..*)"| Transaction

    %% Cross-module
    Transaction -->|"conveys"| LegalEstate
    Transaction -->|"founds (1..*)"| Seller
    Transaction -->|"founds (1..*)"| Buyer

    %% Chain link
    Seller -.->|"borneBy"| Person
    Buyer -.->|"borneBy"| Person
    Buyer -.->|"buyer-also-seller<br/>overlap in next link"| Seller

    %% Claim attachment
    Seller -.->|"asserts authority via"| Claim
    Buyer -.->|"asserts affordability via"| Claim
```

</details>

## Lifecycle: Transaction milestone state-transitions

The canonical milestone sequence through a UK residential transaction, with re-planning loops:

![transaction-milestone-lifecycle](diagrams/README/transaction-milestone-lifecycle.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
stateDiagram-v2
    accTitle: Transaction milestone lifecycle
    accDescr: Transaction lifecycle as a sequence of milestones — instruction, offer accepted (founding event), exchange, completion, registration — with re-planning loops on delay and an aborted-transaction termination state.

    [*] --> Instructed : instruction milestone

    Instructed --> OfferAccepted : offer-acceptance event<br/>(founds Transaction)
    OfferAccepted --> Exchanged : contracts exchanged

    Exchanged --> Exchanged : re-planning<br/>(planned vs actual variance)
    Exchanged --> Completed : completion-process<br/>(interval milestone)

    Completed --> Registered : HMLR registration

    %% Termination paths
    OfferAccepted --> Aborted : offer withdrawn<br/>pre-exchange
    Exchanged --> Aborted : exchange unwound<br/>(rare)
    Aborted --> [*] : record persists<br/>(audit trail)

    Registered --> [*] : Transaction complete
```

</details>

## Lifecycle: Transaction chain link-break decision

What happens to a TransactionChain when a member link aborts:

![transaction-chain-link-break-decision-flow](diagrams/README/transaction-chain-link-break-decision-flow.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TD
    accTitle: Transaction chain link-break decision flow
    accDescr: Decision tree for a Chain member that aborts mid-flow — buy-side completes independently or whole link terminates; Chain re-forms around the break as two shorter independent chains or shrinks to one.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef errorState fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C

    Break(["Chain member<br/>aborts mid-flow"]):::cls
    Q1{"Buyer-also-seller<br/>withdraws?"}:::cls
    Q2{"Buy-side<br/>completes<br/>independently?"}:::cls

    LinkAlive(["Transaction persists<br/>(buy-side only)"]):::success
    LinkDead(["Transaction terminates<br/>(aborted-status)"]):::errorState
    Reform(["Chain re-forms as<br/>two shorter chains"]):::warning
    Shrink(["Chain shrinks by one"]):::warning

    Break --> Q1
    Q1 -->|"Yes"| Q2
    Q1 -->|"No"| LinkDead
    Q2 -->|"Yes"| LinkAlive
    Q2 -->|"No"| LinkDead
    LinkAlive --> Reform
    LinkDead --> Shrink
```

</details>
