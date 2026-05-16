---
page: 39
slot: 39
title: Built form, condition & valuation
voice: reference-prose-with-opinion
regions:
  intro: |
    This aggregate gathers what the building physically *is* (construction,
    age, dimensions), what condition it is in (defects, cladding,
    alterations), what moves with it at completion (fixtures and fittings),
    and what it is worth (surveys and valuations). These leaves share a
    single lifecycle: survey shapes valuation, valuation shapes price,
    price feeds completion. They are read together because they are
    written together.
  why_this_exists: |
    The cohesion test for this page is the survey-to-completion chain.
    A surveyor inspects built form and condition; their findings feed a
    valuation; the valuation supports a price; the agreed price drives
    the contract; the contract pulls the fixtures schedule along with
    it. Splitting these leaves across pages would force every reader
    of a survey defect to chase its price impact to a different aggregate
    and its fixtures consequence to a third. They cohere because they
    fail together: a missed cladding rating mis-prices the asset *and*
    mis-states the contract.
  pull_quote: "Survey shapes valuation, valuation shapes price, price feeds completion — and any leaf in this aggregate that is wrong invalidates every leaf downstream."
  gap_notes: |
    Three honest gaps. First, the cladding model evolved twice between
    2022 and 2024; older records may use pre-EWS1 terminology and need
    re-coding before they validate. Second, the schema does not distinguish
    a RICS-regulated home survey from a seller-completed condition
    questionnaire — both land under `surveys[]` and only the issuing
    role identifies which is which. Third, `fixturesAndFittings` is
    schedule-shaped, not item-shaped: a missing item is indistinguishable
    from an unfilled section.
  er_diagram: |
    erDiagram
      SURVEY     ||--o{ DEFECT       : "lists"
      DEFECT     ||--|| SEVERITY     : "rated as"
      DEFECT     ||--o{ REMEDIATION  : "addressed by"
      REMEDIATION||--o| COST         : "estimated at"
      COST       ||--|| VALUATION    : "feeds into"
      VALUATION  ||--|| ASKING_PRICE : "anchors"
      ASKING_PRICE ||--|| COMPLETION : "settles at"
      SURVEY {
        string surveyType "RICS L2 · L3 · self"
        string regulator
        date   dateOfInspection
      }
      DEFECT {
        string element "fabric · fitting · service"
        string severity "1 · 2 · 3"
        bool   urgentRepair
      }
      REMEDIATION {
        string action
        bool   completed
      }
      VALUATION {
        int    capitalValue
        string confidenceBand
      }
  er_caption: |
    Internal mechanics: a survey lists defects, each rated for severity and
    optionally tied to a remediation action with an estimated cost. The cost
    feeds the valuation, which anchors the asking price and ultimately the
    completion price. This is the cohesion test answered visually — every
    leaf on this page lives somewhere on this chain.
  worked_example: |
    The London flat (12 Riverside Court, Vauxhall, SE11 5RX) reports
    `${london:propertyPack.buildInformation.building.propertyType}` of built
    form `${london:propertyPack.buildInformation.building.builtForm}`,
    built in `${london:propertyPack.buildInformation.yearOfBuild}`, with
    building safety declared as
    `${london:propertyPack.typeOfConstruction.buildingSafety.yesNo}` — the
    EWS1 record carries a B2 rating after partial ACM remediation in
    2022. Its RICS Level 2 survey identifies one defect (rainwater
    goods); the resulting valuation is
    £`${london:propertyPack.valuations[0].capitalValue}` at
    `${london:propertyPack.valuations[0].confidenceBand}` confidence, against
    a marketed price of £`${london:propertyPack.priceInformation.price}`.
    The Manchester semi (47 Acacia Avenue, Didsbury, M20 4XY) reports
    `${semi:propertyPack.buildInformation.building.propertyType}` of built
    form `${semi:propertyPack.buildInformation.building.builtForm}`, built
    in `${semi:propertyPack.buildInformation.yearOfBuild}` and declared as
    structurally altered
    (`${semi:propertyPack.alterationsAndChanges.hasStructuralAlterations.yesNo}`)
    with Building Regulation approval attached. The RICS Level 3
    survey flags Japanese knotweed on the rear boundary, managed under
    a treatment plan; the valuation reports
    £`${semi:propertyPack.valuations[0].capitalValue}` at
    `${semi:propertyPack.valuations[0].confidenceBand}` confidence.
mentioned_but_not_owned:
  - councilTax (canonical home page 47)
  - sellersCapacity (canonical home page 35)
  - epc.currentEnergyRating (canonical home page 40)
  - titleNumber (canonical home page 38)
sub_sections:
  - id: built_form
    title: Built form
  - id: condition
    title: Condition (including cladding)
  - id: fixtures
    title: Fixtures and fittings
  - id: surveys
    title: Surveys
  - id: valuation
    title: Valuation and price
---
