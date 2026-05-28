# Transaction

A Transaction is the **binding** that links Sellers, Buyers, and the Legal Estate being conveyed, founded by a transaction-starting event (typically offer acceptance). It is a Relator — a thing-in-its-own-right with its own identity and properties.

## Why it matters

A residential property transaction is not a property of the Property, nor of the Seller, nor of the Buyer — it is a *binding* that connects all three and carries its own properties (transaction-id, founding event, status, milestones). OPDA models it as a Relator so the binding can be queried, validated, and traced through party-substitutions, estate-changes, and chain-rearrangements without conflating it with any of the parties.

If you are a conveyancer, lender, or transaction-management platform asking "which transaction is this, and is it the same one after the substitution?", this is the entity whose IC answers you.

## Hard cases

- **Party-substitution.** A Buyer drops out; another Buyer steps in. The Transaction's IC persists (founding event unchanged); only the bearer of the Buyer Role Mixin changes.
- **Estate-change.** The Sellers offer a Freehold; mid-transaction it becomes a long Leasehold (e.g. a freehold strip is reserved). The Legal Estate changes; under the IC this is treated as a continuation only if the founding event still holds.
- **Transaction-id reissuance.** A transaction management system re-issues an id mid-flow. The IC tracks lineage explicitly — re-issued ids do not produce a new Transaction, they extend the predecessor's id-lineage.
- **Chain-link-break.** A buyer-also-seller withdraws from a chain. Their Transaction may persist (if the buy-side completes independently) or terminate (aborted-transaction). The Chain re-forms around the break.
- **Aborted-transaction.** Offer accepted then abandoned without exchange. The Transaction record persists as an aborted-status record; the IC does not erase it from the audit trail.

## Identity Criterion

A Transaction is identified by its **5-tuple**: (Legal Estate concerned, Sellers-set, Buyers-set, transaction-id-lineage, founding event). Two records refer to the same Transaction only if all five components match — party-substitutions handled via founding-event persistence; id-reissuance handled via lineage chain. See the [Logical tier →](../../logical/transaction/transaction.md) for the typed structure.

### IC walk-through: party-substitution vs estate-change vs id-reissuance

How each hard case resolves under the 5-tuple IC — the founding event is the gating component:

![transaction-ic-5-tuple-decision-flow](diagrams/transaction/transaction-ic-5-tuple-decision-flow.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TD
    accTitle: Transaction IC 5-tuple decision flow
    accDescr: Decision tree for Transaction identity — founding event must persist; party-substitution preserves identity (only the role bearer changes); estate-change preserves identity if founding event still holds; id-reissuance preserves identity via lineage; aborted transactions persist as aborted-status records.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef errorState fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C

    Start(["Event affecting<br/>Transaction"]):::cls
    Q1{"Founding event<br/>(offer acceptance)<br/>still holds?"}:::cls
    Q2{"Party substitution<br/>(role bearer changes)?"}:::cls
    Q3{"Estate change<br/>(Freehold ↔ long Leasehold)?"}:::cls
    Q4{"Transaction-id<br/>reissuance?"}:::cls
    Q5{"Aborted pre-exchange?"}:::cls

    Persists(["SAME Transaction<br/>(role bearer changes,<br/>IC preserved)"]):::success
    SameEstate(["SAME Transaction<br/>(estate-change accommodated<br/>under same founding event)"]):::success
    SameID(["SAME Transaction<br/>(lineage chain<br/>preserves identity)"]):::success
    Aborted(["Transaction persists<br/>as ABORTED-status record"]):::warning
    NewTx(["NEW Transaction<br/>(founding event fails)"]):::errorState

    Start --> Q1
    Q1 -->|"No"| NewTx
    Q1 -->|"Yes"| Q2
    Q2 -->|"Yes"| Persists
    Q2 -->|"No"| Q3
    Q3 -->|"Yes"| SameEstate
    Q3 -->|"No"| Q4
    Q4 -->|"Yes"| SameID
    Q4 -->|"No"| Q5
    Q5 -->|"Yes"| Aborted
    Q5 -->|"No"| Persists
```

</details>

## Related Kinds

- [Relator](../foundation/relator.md) — Transaction is the canonical OPDA Relator alongside Proprietorship
- [Seller](../agent/seller.md) — Role Mixin founded by a Transaction
- [Buyer](../agent/buyer.md) — Role Mixin founded by a Transaction
- [Legal Estate](../property/legal-estate.md) — the rights bundle being conveyed
- [Milestone](./milestone.md) — the lifecycle markers within a Transaction
- [Transaction Chain](./transaction-chain.md) — aggregates of dependent Transactions

### Related-Kinds graph

![transaction-related-kinds-neighbourhood-graph](diagrams/transaction/transaction-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Transaction related-Kinds neighbourhood graph
    accDescr: Transaction as the canonical OPDA Relator binding Seller and Buyer Role-Mixins, conveying a LegalEstate, accruing Milestones, and aggregating into a Transaction Chain.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    Transaction["Transaction<br/>(Relator)"]:::centre
    Seller["Seller"]:::cls
    Buyer["Buyer"]:::cls
    LegalEstate["LegalEstate"]:::cls
    Milestone["Milestone"]:::cls
    Chain["TransactionChain"]:::cls
    Relator["Relator<br/>(pattern)"]:::ext

    Transaction -->|"founds"| Seller
    Transaction -->|"founds"| Buyer
    Transaction -->|"conveys"| LegalEstate
    Transaction -->|"hasMilestone"| Milestone
    Transaction -->|"memberOf"| Chain
    Transaction -.->|"specialises"| Relator
```

</details>

## Source ODR

[ODR-0007 — Transactions and lifecycle §Q1](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
