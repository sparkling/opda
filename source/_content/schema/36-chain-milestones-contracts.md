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
  diagrams:
    - type: state
      source: |
        stateDiagram-v2
          [*]              --> Listed
          Listed           --> OfferAccepted: "offer received & accepted"
          OfferAccepted    --> Searches: "conveyancing starts"
          Searches         --> Enquiries: "searches returned"
          Enquiries        --> ContractDrafted: "enquiries resolved"
          ContractDrafted  --> Exchanged: "contracts exchanged"
          Exchanged        --> Completed: "completion day"
          Completed        --> [*]
          OfferAccepted    --> Withdrawn: "fall-through"
          Searches         --> Withdrawn
          Enquiries        --> Withdrawn
          Withdrawn        --> [*]
      caption: |
        Milestone state machine, implicit in the schema today. Valid
        transitions are documented here in prose but not enforced by SHACL
        — the schema permits a Completed milestone before an Exchanged one,
        which is a real defect this diagram makes visible.
    - type: gantt
      source: |
        gantt
          title  Typical UK residential transaction timeline (12 weeks)
          dateFormat YYYY-MM-DD
          axisFormat %b %d
          section Listing
          Listed                       :done,    a1, 2026-01-06, 14d
          section Offer & memo
          Offer accepted               :active,  a2, 2026-01-20, 5d
          Memorandum of sale           :         a3, after a2, 3d
          section Conveyancing
          Searches ordered             :         a4, after a3, 21d
          Mortgage offer               :         a5, after a3, 28d
          Enquiries raised & answered  :         a6, after a4, 14d
          section Contract
          Contract drafted             :         a7, after a6, 7d
          Exchange                     :crit,    a8, after a7, 1d
          Completion                   :crit,    a9, after a8, 14d
      caption: |
        Indicative timeline. The schema records dates per milestone
        (`expected` vs `actual`) but does not encode dependencies. This
        Gantt shows the typical 12-week shape — exchange and completion
        are the critical path.
mentioned_but_not_owned: []
---
