---
page: 38
slot: 38
title: Legal estate & title
voice: reference-prose-with-opinion
regions:
  intro: |
    The legal estate is what's being conveyed: title number, tenure
    (freehold / leasehold / commonhold), proprietors, leases (with all
    their terms), restrictive covenants, charges, easements, and the
    statutory notices that affect the title. The root authority is HM
    Land Registry — most leaves here are evidence-flavoured, sealed in
    the Official Copy.
  why_this_exists: |
    Title is its own aggregate because HMLR is its own authority. Re-issue
    of the title (a new official copy) invalidates every leaf below it
    simultaneously. The seller's TA6 declarations about ownership are a
    *separate* aggregate — same conceptual entity (the property), different
    seal. We keep the leaves where the seal lives.
  pull_quote: "Title is HMLR's word, with HMLR's lifecycle, validated against HMLR's register — the seal closes here."
  gap_notes: |
    The Official Copy is an evidence document, but the schema exposes it
    as a deeply nested object structure rather than as an attached PDF
    with a signed hash. Today every leaf under `ocSummaryData` and
    `ocRegisterData` could be transcribed inaccurately and the schema
    has no way to detect the mismatch. A future revision should attach
    the original sealed document alongside the parsed structure.
  er_diagram: |
    erDiagram
      TITLE       ||--|| OC_SUMMARY     : "summarised by"
      TITLE       ||--o| OC_FULL        : "extracted into"
      OC_SUMMARY  ||--o{ PROPRIETOR     : "registered to"
      OC_SUMMARY  ||--o| LEASE          : "subject to (if leasehold)"
      OC_SUMMARY  ||--o{ CHARGE         : "charged by"
      OC_SUMMARY  ||--o{ RESTRICTION    : "restricted by"
      OC_SUMMARY  ||--o{ NOTICE         : "noted by"
      LEASE       ||--|| GROUND_RENT    : "obliges"
      LEASE       ||--|| SERVICE_CHARGE : "obliges"
      CHARGE      ||--o| LENDER         : "in favour of"
      TITLE {
        string  titleNumber "HMLR identifier"
        string  tenure      "Freehold · Leasehold · Commonhold"
      }
      LEASE {
        date    leaseStart
        integer leaseTermYears
        date    leaseEnd
      }
      CHARGE {
        date   chargeDate
        string chargor
      }
  er_caption: |
    Internal mechanics: a Title carries a sealed Official Copy with
    proprietors, leases, charges, restrictions and notices. Leasehold
    titles additionally carry ground rent and service charge schedules.
    All of these flow from one HMLR seal and re-issue together.
mentioned_but_not_owned:
  - "councilTax (canonical home page 47)"
  - "sellersCapacity (canonical home page 35)"
---
