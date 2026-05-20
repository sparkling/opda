# ODR 0007 — Transactions & Lifecycle

- **Status:** Proposed (planning stub)
- **Date:** 2026-05-20
- **Phase:** Module (blocked by ODR-0005 gate)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q2, Q3)
- **Dependencies:** ODR-0004, ODR-0005, ODR-0006, ODR-0011

## Scope

The transaction envelope and its temporal/process spine — the "verb half" of the model (Kendall).

- **`opda:Transaction`** — the **Relator** that founds the Seller/Buyer roles (Guizzardi). `transactionId`, `externalIds`, `status`.
- **`opda:Chain`, `opda:OnwardPurchase`** — chain linkage.
- **Milestones & status** — modelled as states (SKOS scheme → ODR-0011) with **OWL-Time** for the temporal facts.
- **`opda:Proprietorship`, `opda:Conveyance`** — the Relators that found Proprietor / transfer roles (cross-ref ODR-0006).

## Why OWL-Time is here

Session 001 Q2 adopted OWL-Time (Conditional) specifically because the lifecycle is interval-valued: proprietorship holds *during* an interval; lease terms (`startYearOfLease`/`lengthOfLeaseInYears`), `lastDemandPeriod {from,to}`, official-copy dates. Guizzardi/Gandon's decisive point: adopting PROV-O's `prov:atTime` (an instant) while these intervals go unmodelled is incoherent. Use `time:Interval`/`time:Instant`/`time:hasBeginning`; reserve Allen-interval relations for where genuinely needed.

## Vocabularies

Core, **OWL-Time** (intervals/instants), SKOS (status/milestone schemes → ODR-0011), PROV-O (lifecycle transitions cross-link → ODR-0009).

## Open questions

- Status as a state machine — single scheme across roles or per-role? (carried from the participants analysis)
- Boundary with ODR-0009: a milestone *transition* is both a lifecycle fact (here) and a provenance `prov:Activity` (there) — define the seam.

## Deliverables (when fleshed out)

`transactions-lifecycle.ttl`; status/milestone SKOS schemes (→ ODR-0011); OWL-Time usage pattern note.
