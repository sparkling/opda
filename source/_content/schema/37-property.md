---
page: 37
slot: 37
title: Property
voice: full-opinionated
regions:
  intro: |
    Property identity is the schema's most-referenced concept and its
    biggest defect. A physical building, a parcel of land, a flat in a
    block — call it the *property* — is referred to from address, UPRN,
    INSPIRE ID, title-linked address, and several embedded propertyPack
    sub-objects. None of those four identity surfaces is canonical, and the
    schema offers no relation between them. This page names that gap
    explicitly.
  why_this_exists: |
    Four leaves point at the same physical thing and no leaf points at
    those four. UPRN appears in `propertyPack.uprn`, in
    `energyEfficiency.certificate.uprn`, in
    `chain.onwardPurchase[].uprn`, and in
    `valuationComparisonData.propertyDetails[].uprn` — four leaves, one
    physical referent, zero schema-level joins. Address has the same
    problem with extra mess (marketing address vs registered title
    address vs CON29 address). This page reconstructs the implicit
    Property entity from those scattered identity surfaces and flags it
    as a known issue.
  pull_quote: "The Property is the schema's load-bearing entity — and the one it never names."
  gap_notes: |
    The defect is structural, not editorial. Fixing it requires either
    (a) a top-level `property` aggregate with an `id` that the other
    surfaces reference, or (b) a SHACL shape declaring `propertyPack.uprn`
    as the canonical key with the others as foreign keys. Neither has
    been written. Until it is, the page is honest about what it
    documents: the schema as-built, not the schema-as-it-should-be.
  er_diagram: |
    erDiagram
      PROPERTY ||--|| ADDRESS         : "located at"
      PROPERTY ||--o| UPRN            : "identified by"
      PROPERTY ||--o| INSPIRE_ID      : "or by"
      PROPERTY ||--o{ TITLE_LINK      : "registered as"
      PROPERTY ||--|| LOCATION        : "at coordinates"
      PROPERTY ||--|| FEATURES        : "with features"
      ADDRESS {
        string line1
        string line2
        string town
        string postcode
        string countryCode
      }
      UPRN {
        integer value "Unique Property Reference Number"
        string  source "OS · LA"
      }
      LOCATION {
        number latitude
        number longitude
      }
      FEATURES {
        string propertyType
        integer numberOfBedrooms
        integer numberOfBathrooms
      }
  er_caption: |
    The four identity surfaces (Address, UPRN, INSPIRE ID, Title link)
    plus the two attribute surfaces (Location coordinates, Residential
    features) collectively describe the Property. None of these is
    declared canonical in the schema — this diagram is a documentation
    patch over that gap.
mentioned_but_not_owned:
  - "address (London/Manchester examples populate this)"
  - "titleNumber (canonical home page 38)"
---
