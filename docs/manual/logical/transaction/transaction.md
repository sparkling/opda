# Transaction

## Summary

Property-transaction Relator — the mediating endurant that founds [Seller](../agent/seller.md) and [Buyer](../agent/buyer.md) RoleMixins. [Relator; UFO Relator]. FIBO Arrangement precedent. Identity criterion = 5-tuple `(LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage, founding-event)`. Hard cases per S007 Q1: party-substitution, estate-change, transaction-id reissuance, chain-link-break, aborted-transaction. Carries `transactionId` via `dct:identifier` and external-system refs via `externalIds`.
[Concept tier →](../../concept/transaction/transaction.md)

## Attributes

| Attribute | Type | Cardinality | Required | Identity-bearing | Description |
|---|---|---|---|---|---|
| `occurredAtTime` | `dateTime` | `0..1` | N | Y | Actual completion instant of the founding event (PROV-O `prov:atTime` alias) |

## Relationships

| Predicate | Target entity | Cardinality | Inverse | Description |
|---|---|---|---|---|
| `hasChainPosition` | `TransactionChain` | `0..1` | `chainMembers` | Join from a Transaction to its TransactionChain (S007 Q4 Aggregate side); mirror of `TransactionChain.chainMembers` |

Inbound predicates: founds Seller / Buyer Roles via the Relator pattern; concerns LegalEstate (cross-module).

## Identity key

Identity key = `(LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage, founding-event)` 5-tuple per ODR-0007 §Q1. The surface identity-key element is `occurredAtTime` (the founding-event timestamp). Cross-reference: Concept-tier [Transaction IC narrative](../../concept/transaction/transaction.md#identity-criterion).

## Constraints

- `occurredAtTime` MUST be a single `dateTime` value when present (`Violation`, `TransactionIdentityKeyShape`)

## Derived attributes

None at this tier (the Milestone variance derived attribute lives on `Milestone`, not on the parent Transaction).

## ER diagram

![transaction--entity-relationship-diagram](diagrams/transaction/transaction--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Transaction — Entity-Relationship Diagram
    accDescr: Direct-neighbour view of Transaction Relator — hasMilestone Milestones, founds Seller and Buyer Roles, optional TransactionChain position, concerns LegalEstate.

    Transaction ||--o{ Milestone : "hasMilestone"
    Transaction ||--o{ Seller : "founds"
    Transaction ||--o{ Buyer : "founds"
    Transaction }o--o| TransactionChain : "hasChainPosition"
    Transaction }o--o{ LegalEstate : "concerns"
```

</details>

## Lifecycle state-transition diagram

Transaction status follows the canonical five-phase sale lifecycle per ODR-0007 §Q3 (TransactionStatusScheme). The broader 9-value data-dictionary `status` enum maps to these five via `prov:wasDerivedFrom`.

![transaction--lifecycle-state-transition-diagram](diagrams/transaction/transaction--lifecycle-state-transition-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
stateDiagram-v2
    accTitle: Transaction — Lifecycle State-Transition Diagram
    accDescr: Transaction lifecycle in five canonical phases — Listed, Offered, Accepted, Exchanged, Completed — corresponding to MilestoneKind events (instruction, offerAccepted, exchange, completion).

    [*] --> Listed : Milestone instruction
    Listed --> Offered : offer received
    Offered --> Accepted : Milestone offerAccepted
    Offered --> Listed : offer withdrawn (back to market)
    Accepted --> Exchanged : Milestone exchange
    Accepted --> Listed : transaction aborted<br/>(back to market)
    Exchanged --> Completed : Milestone completion
    Completed --> [*]
```

</details>

## Source ODR + ADR

- [ODR-0007 — Transaction lifecycle](../../../ontology/odr/ODR-0007-transaction-lifecycle.md), §Q1 Transaction-as-Relator; §Q2 Milestone hybrid typing; §Q4 Chain dual modelling
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md) — implementation
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md) — shapes
