---
page: 36
slot: 36
title: Chain, milestones & contracts
voice: reference-prose-with-opinion
regions:
  intro: |
    The *process* artefacts of a transaction — its lifecycle state machine,
    the linked transactions ahead and behind it in a chain, and the contract
    documents that settle it. Everything here happens at the transaction
    level, not the property level.
  why_this_exists: |
    A property doesn't have a chain; a transaction does. A property doesn't
    sign contracts; participants in a transaction do. A property persists
    across many transactions; milestones are scoped to one. Putting process
    on a separate page keeps the propertyPack pages focused on attributes of
    the asset, not progress through the sale.
  pull_quote: "Chain, milestones, contracts — three sides of the same fact: this transaction is moving through time."
  gap_notes: |
    Milestone ordering is implicit in the schema (listed → offerAccepted →
    exchange → completion) but isn't expressed as a state machine. A future
    revision should encode valid transitions explicitly — today, a
    completion milestone can appear before an exchange milestone without
    schema-level objection.
  er_diagram: |
    erDiagram
      TRANSACTION ||--o| CHAIN          : "sits in"
      CHAIN       ||--o{ ONWARD_TXN     : "links to"
      TRANSACTION ||--|| MILESTONES     : "tracked by"
      MILESTONES  ||--o{ MILESTONE      : "captures"
      MILESTONE   ||--|| STATUS         : "in state"
      TRANSACTION ||--o{ CONTRACT       : "signed under"
      CONTRACT    ||--o{ SIGNATURE      : "carries"
      CONTRACT    ||--o| COMPLETION     : "settles at"
      MILESTONE {
        string event "listed · offerAccepted · exchange · completion"
        date   expected
        date   actual
      }
      STATUS {
        string value "pending · confirmed · superseded"
      }
  er_caption: |
    Internal mechanics: chain links transactions to upstream and downstream
    deals; milestones track planned and actual dates for each lifecycle
    event; contracts carry signatures and settle at completion. Note that
    completion is both a milestone (the date) and a contract-settling event
    (the artefact) — same fact, two leaves.
mentioned_but_not_owned: []
---
