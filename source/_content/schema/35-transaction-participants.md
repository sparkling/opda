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
      PARTICIPANT    ||--|| IDENTITY     : "has"
      PARTICIPANT    ||--o{ ADDRESS      : "contactable at"
      PARTICIPANT    ||--|| ROLE         : "acts as"
      PARTICIPANT    ||--o| CAPACITY     : "if seller, with capacity"
      CAPACITY       ||--o{ ATTACHMENT   : "evidenced by"
      ROLE {
        string value "Seller · Buyer · Agent · Conveyancer · Surveyor · Lender"
      }
      CAPACITY {
        string value "Legal owner · PR for deceased · Attorney · Mortgagee · Other"
      }
      IDENTITY {
        string firstName
        string lastName
        date   dateOfBirth
      }
  er_caption: |
    Internal mechanics: each participant carries identity, address, role and
    optionally a seller capacity. Capacity is the gating fact for whether a
    party can convey — and the only participant attribute that routinely
    requires evidence (grant of probate, power of attorney).
mentioned_but_not_owned:
  - "address (canonical home page 37 for property address; this page owns participant address)"
---
