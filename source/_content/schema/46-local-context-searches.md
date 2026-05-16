---
page: 46
slot: 46
title: Local context & searches
voice: reference-prose-with-opinion
regions:
  intro: |
    Everything outside the property boundary that affects what's inside it.
    Local authority searches (CON29R, CON29DW), local land charges (LLC1),
    planning history, environmental flags (flood, mining, radon, contamination),
    transport proposals, neighbourhood data. These are returned by external
    authorities — local councils, the Environment Agency, the Coal Authority —
    and arrive as sealed bundles.
  why_this_exists: |
    Each search has the same shape — request → authority → result — and
    the same lifecycle: ordered during the conveyancing phase, returned
    once, sealed thereafter. Putting them together makes the *process* the
    page narrates, and lets the reader see all the gates a sale has to
    pass at once.
  pull_quote: "Local context is what the property does to the council, and what the council does to the property — the searches are the receipts."
  gap_notes: |
    CON29 has 22 standard questions and four optional ones; the schema
    flattens them into named leaves rather than a numbered enquiry array.
    That's reader-friendly but makes round-tripping a fresh CON29 response
    awkward — there's no single key to look up "question 3.2".
  er_diagram: |
    flowchart LR
      classDef src fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
      classDef auth fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
      classDef res fill:#FFF9C4,stroke:#F57F17,stroke-width:2px,color:#E65100

      REQ[Conveyancer<br/>orders search]:::src --> CON29R[CON29R<br/>request]
      REQ --> CON29DW[CON29DW<br/>request]
      REQ --> LLC1[LLC1<br/>request]
      REQ --> ENV[Environmental<br/>request]

      CON29R --> LA[Local authority]:::auth
      CON29DW --> WC[Water company]:::auth
      LLC1 --> LA
      ENV --> EA[Environment Agency<br/>+ Coal Authority<br/>+ BGS]:::auth

      LA --> CON29R_R[Planning<br/>roads<br/>building control<br/>council tax band]:::res
      WC --> CON29DW_R[Drainage map<br/>water supply<br/>sewer adopted?]:::res
      LA --> LLC1_R[Local land charges<br/>conservation<br/>tree orders]:::res
      EA --> ENV_R[Flood risk<br/>contamination<br/>radon<br/>mining]:::res
  er_caption: |
    Internal mechanics: each search is a request to a specific authority
    returning specific data. The flow is causal (a conveyancer orders the
    search; the authority returns sealed data) so a flowchart fits better
    than an erDiagram here.
mentioned_but_not_owned:
  - "councilTax (canonical home page 47; band is mentioned on CON29R)"
---
