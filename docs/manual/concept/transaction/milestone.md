---
entityUri: opda:Milestone
kind: entity
module: transaction
sourceTtl: source/03-standards/ontology/opda-transaction.ttl
tier: concept
title: Milestone
---

# Milestone

A Milestone is a point — or an interval — in a Transaction's lifecycle: instruction, offer accepted, exchange, completion, registration, and the processes between them.

## Why it matters

Milestones are how a Transaction's progress is observable. They carry timestamps (planned and actual), associated parties, and a variance gap that tells you whether a transaction is on track. Some Milestones are instants (offer accepted at 14:32 on this date); others are intervals (completion-process started at X, ended at Y). OPDA distinguishes both — instants and intervals — so consumers can ask "when did this happen?" and "how long did it take?" with the right answer in each case.

If you are running a transaction-management platform or feeding a regulator dashboard with on-time performance metrics, these are the entities you read.

## Hard cases

- **Instant vs interval Milestone.** Offer-acceptance is an instant (one timestamp); the completion-process is an interval (start + end). The model captures both shapes — naive timestamp-only modelling discards the interval data.
- **Planned vs actual variance.** Every Milestone has both a planned timestamp (on a companion Plan) and an actual timestamp (on the Activity). The variance feeds regulator-grade on-time performance reports.
- **Re-planned Milestone.** A delayed exchange triggers a re-planning. The planned timestamp updates; the actual timestamp does not exist yet. The variance is computed against the *current* plan.

## Identity Criterion

A Milestone is identified by its **(Transaction, Milestone-kind, occurrence)** triple — the Transaction it belongs to, the kind of Milestone (instruction, offer accepted, exchange, completion, registration, etc.), and the occurrence index if the Milestone can recur. See the [Logical tier →](../../logical/transaction/milestone.md) for the typed structure (instant vs interval distinction, planned/actual timestamps, variance derivation).

## Related Kinds

- [Transaction](./transaction.md) — Milestones belong to a Transaction

### Related-Kinds graph

![milestone-related-kinds-neighbourhood-graph](diagrams/milestone/milestone-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Milestone related-Kinds neighbourhood graph
    accDescr: Milestone as a point or interval in a Transaction lifecycle, with planned and actual timestamps and a derived variance feeding regulator-grade on-time performance reports.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    Milestone["Milestone<br/>(instant or interval)"]:::centre
    Transaction["Transaction"]:::cls
    Planned["Planned timestamp"]:::cls
    Actual["Actual timestamp"]:::cls
    Variance["Variance<br/>(derived)"]:::cls

    Transaction -->|"hasMilestone"| Milestone
    Milestone -->|"planned"| Planned
    Milestone -->|"actual"| Actual
    Variance -.->|"derived from planned vs actual"| Milestone
```

</details>

## Source ODR

[ODR-0007 — Transactions and lifecycle §Q2](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
