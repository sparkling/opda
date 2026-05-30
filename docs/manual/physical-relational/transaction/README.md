---
status: proposed
date: 2026-05-29
tags: [physical-relational, transaction, postgresql]
---

# Transaction module — relational schema

`transaction` is a reified UFO Relator — the conveyancing relationship that founds the buyer and seller roles and concerns one or more legal estates. `milestone` rows are append-only lifecycle events; `transaction_chain` aggregates linked transactions.

## Tables

| Table | Realises | Kind | Key relationships |
|---|---|---|---|
| `transaction` | Transaction | relator | founds `seller` / `buyer`; FK → `transaction_chain` (`0..1`) |
| `transaction_legal_estate` | concerns `M:N` | junction | `transaction` × `legal_estate` |
| `milestone` | Milestone | event | FK → `transaction`; `UNIQUE(transaction_id, milestone_kind)` |
| `transaction_chain` | TransactionChain | aggregate | members via `transaction.transaction_chain_id` |

## Entity-relationship diagram

```mermaid
erDiagram
    accTitle: Transaction module — entity-relationship diagram
    accDescr: transaction as a reified relator with milestones, concerning legal estates via a junction, positioned in a transaction_chain. The buyer and seller roles it founds live in the agent module.

    transaction {
        uuid transaction_id PK
        text uri UK
        timestamptz occurred_at_time
        uuid transaction_chain_id FK
    }
    transaction_legal_estate {
        uuid transaction_id PK,FK
        uuid legal_estate_id PK,FK
    }
    milestone {
        uuid milestone_id PK
        text uri UK
        uuid transaction_id FK
        text milestone_kind FK
        timestamptz occurred_at_time
        timestamptz planned_at_time
    }
    transaction_chain {
        uuid transaction_chain_id PK
        text uri UK
    }

    transaction_chain ||--o{ transaction : "chain members"
    transaction ||--o{ milestone : "has milestone"
    transaction ||--o{ transaction_legal_estate : "concerns"
    legal_estate ||--o{ transaction_legal_estate : "concerned by"
```

## Lookup tables

| Lookup | Bound by | Members |
|---|---|---|
| `milestone_kind` | `milestone.milestone_kind` | 5 |
| `transaction_status` | overlay profiles | 5 |

## Mapping notes

- **Transaction is a reified Relator**, not a pair of foreign keys. Its identity is the 5-tuple `(LegalEstate-concerned, Sellers, Buyers, transaction-id lineage, founding event)`. Buyers and sellers attach as `seller` / `buyer` rows (agent module) whose `transaction_id` points back here; `concerns` is many-to-many via `transaction_legal_estate`.
- **`milestone` identity** is `(Transaction, MilestoneKind)` — `UNIQUE(transaction_id, milestone_kind)`. The derived `hasVarianceDays` (`occurred_at_time − planned_at_time`) is computed, not stored.
- **The `≤ 7` chain-member cap and chain-status are overlay-level SHACL rules**, documented rather than enforced as base-table constraints. Membership is the inverse foreign key `transaction.transaction_chain_id`. (`legal_estate` lives in the property module.)

## Cross-tier

Logical tier: [transaction module](../../logical/transaction/).
