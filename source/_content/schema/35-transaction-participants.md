---
page: 35
slot: 35
title: Transaction & participants
voice: reference-prose-with-opinion
regions:
  intro: |
    A PDTF transaction starts with **who's involved**. Participants are people
    and organisations attached to a transaction with a role (seller, buyer,
    estate agent, conveyancer, surveyor, lender), an identity, a contact
    surface, and — for sellers — a *capacity* explaining their authority to
    convey (legal owner, personal representative, attorney, mortgagee in
    possession).
  why_this_exists: |
    Every other Schema page hangs off this one. A claim about the property
    has no meaning without an asserter; an evidence document has no force
    without an issuer; a milestone has no actor without a participant. The
    aggregate cohesion test holds because all of these leaves share a single
    lifecycle (created at instruction, updated through the transaction,
    closed at completion) and a single root authority (the PDTF-compliant
    software platform that owns the user account).
  pull_quote: "Every claim, every signature, every milestone in the transaction is anchored to a participant — this page maps the anchor."
  gap_notes: |
    Capacity is a string enum, not a graph of authorities. An executor's
    grant of probate, an attorney's power of attorney, a mortgagee's
    repossession order — all collapse to a single `sellersCapacity` value,
    with attachments. A future revision should split asserted-capacity from
    evidenced-authority.
  er_diagram: |
    erDiagram
      TRANSACTION    ||--o{ PARTICIPANT  : "involves"
      PARTICIPANT    ||--|| NAME         : "named by"
      PARTICIPANT    ||--o| ADDRESS      : "contactable at"
      PARTICIPANT    ||--o| VERIFICATION : "verified by"
      VERIFICATION   ||--o{ REPORT       : "identity + AML checks"
      PARTICIPANT    ||--o| CAPACITY     : "if seller, with capacity"

      TRANSACTION {
        string transactionId   "UUID for the transaction"
        object externalIds
        string status
      }
      PARTICIPANT {
        string dateOfBirth
        string phone
        string email
        string organisation
        string organisationReference
        object externalIds
        string participantStatus
        string role            "Seller · Buyer · Agent · Conveyancer · Surveyor · Lender"
      }
      NAME {
        string title
        string firstName
        string middleName
        string lastName
        string maidenName
        string preferredName
      }
      ADDRESS {
        string buildingNumber
        string buildingName
        string subBuilding
        string street
        string line1
        string line2
        string line3
        string town
        string postcode
        string homeNation
        string countryCode
      }
      VERIFICATION {
        string identityResult
        string antiMoneyLaunderingResult
      }
      REPORT {
        string reportName
        string result
        string details
      }
      CAPACITY {
        string capacity                "Legal owner · PR for deceased · Attorney · Mortgagee · Other"
        string sellersCapacityDetails
        string attachments             "→ Evidence & documents (page 48)"
      }
  er_caption: |
    Full reference: every schema path owned by this page surfaces in the
    diagram. Transaction- and participant-level fields are inlined on
    their respective entities; nested groups (name, address, verification
    reports, seller capacity) become their own boxes. Capacity is the
    gating fact for whether a participant can convey, and the only one
    that routinely requires attached evidence (page 48).
mentioned_but_not_owned:
  - "address (canonical home page 37 for property address; this page owns participant address)"
---
