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
mentioned_but_not_owned:
  - "sellersCapacity (canonical home page 35)"
  - "titleNumber (canonical home page 38)"
---
