---
page: 47
slot: 47
title: Encumbrances & completion
voice: full-opinionated
regions:
  intro: |
    Some facts about a property aren't really about the building — they're
    about what binds it. Council tax bands. Insurance. Guarantees and
    warranties. Outstanding obligations to occupiers. Letting information.
    The completion statement that resolves everything at exchange of money.
    These leaves cohere because they all *terminate* at completion — they
    accumulate during the conveyancing phase and either discharge, transfer,
    or apportion when the keys change hands.
  why_this_exists: |
    Council tax has its canonical home here for the same reason. It looks
    like a property attribute (it shows up on listings, on TA6, on the
    search pack), but its *terminating* fact — the apportionment between
    seller and buyer — is a completion artefact. The band is just the
    input. The apportionment is the leaf that has to be right, and it can
    only be right at one moment, on one document, signed by both sides.
    That's a page-47 fact.
  pull_quote: "Completion is the moment encumbrances either follow the property or die with the seller — every leaf on this page settles in that moment."
  gap_notes: |
    Completion-statement totals are derivations, but the schema doesn't
    carry the formulas. A buyer's solicitor reading the statement can't
    verify the arithmetic against the schema — they have to compute it
    independently. SHACL or PROV-O could close this gap; today it's an
    honest defect.
  er_diagram: |
    erDiagram
      PROPERTY        ||--o| COUNCIL_TAX        : "banded as"
      PROPERTY        ||--o{ INSURANCE          : "covered by"
      PROPERTY        ||--o{ GUARANTEE          : "warranted by"
      PROPERTY        ||--o{ OCCUPIER           : "occupied by"
      PROPERTY        ||--o| LETTING            : "let under"
      TRANSACTION     ||--|| COMPLETION         : "settles via"
      COUNCIL_TAX     ||--|| APPORTIONMENT      : "split at completion"
      INSURANCE       ||--o| ATTACHMENT         : "evidenced by"
      GUARANTEE       ||--o| ATTACHMENT         : "evidenced by"
      LETTING         ||--o{ TENANT             : "for"
      COMPLETION      ||--o{ APPORTIONMENT      : "itemises"
      COMPLETION      ||--|| MONEY_FLOW         : "settles"
      COUNCIL_TAX {
        string band "A · B · C · D · E · F · G · H · I"
        integer annualCharge
      }
      APPORTIONMENT {
        integer daysOwed
        integer amount
        date    completionDate
      }
  er_caption: |
    Internal mechanics: each encumbrance lives on the property and resolves
    at completion. Council tax is the cleanest example: the band is
    declarative, the apportionment is derivative, the completion statement
    is the artefact that closes both.
  diagrams:
    - type: flowchart
      source: |
        flowchart TB
          classDef input fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
          classDef derive fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#BF360C
          classDef result fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

          A[Council tax band<br/>Declared]:::input --> F[Annual charge<br/>£ × band × LA]:::derive
          B[Completion date<br/>Agreed]:::input --> G[Days in year<br/>before completion]:::derive
          C[Service charge<br/>schedule]:::input --> H[Period attributable<br/>to seller]:::derive
          D[Ground rent<br/>schedule]:::input --> H
          F --> X[Seller's share<br/>days × daily-rate]:::derive
          G --> X
          F --> Y[Buyer's share<br/>days × daily-rate]:::derive
          G --> Y
          H --> Z[Apportionment<br/>line items]:::result
          X --> Z
          Y --> Z
          Z --> S[Completion statement<br/>total]:::result
      caption: |
        Apportionment math: declared inputs (band, completion date,
        schedule) feed deterministic derivations (daily-rate × days);
        the derivations sum into completion-statement line items. The
        schema captures the inputs and outputs but not the formulas —
        a SHACL constraint could enforce the arithmetic.
    - type: gantt
      source: |
        gantt
          title  Completion-day money flow
          dateFormat HH:mm
          axisFormat %H:%M
          section Morning
          Buyer's funds in solicitor account     :crit,    a1, 09:00, 30m
          Mortgage drawdown to solicitor         :         a2, 09:30, 30m
          section Midday
          Funds transferred to seller solicitor  :crit,    a3, 12:00, 30m
          Apportionment received                 :         a4, 12:00, 60m
          Title transfer (TR1) signed            :         a5, 12:30, 15m
          section Afternoon
          Keys released                          :milestone, m1, 13:30, 0
          AP1 lodged with HMLR                   :         a6, 14:00, 60m
          Discharge of charge (DS1)              :         a7, 14:00, 60m
      caption: |
        Completion day timeline. Apportionment, transfer, key release
        and registration all converge in a four-hour window. The
        schema captures most artefacts (TR1, AP1, DS1) but the
        money-flow timestamps are typically tracked outside it.
mentioned_but_not_owned:
  - "sellersCapacity (canonical home page 35)"
  - "titleNumber (canonical home page 38)"
---
