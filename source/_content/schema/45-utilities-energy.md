---
page: 45
slot: 45
title: Utilities & energy
voice: reference-prose-with-opinion
regions:
  intro: |
    What runs into and out of the building: heating, electricity, water,
    drainage, broadband, mobile. Plus the property's energy performance
    certificate (EPC). These leaves cluster because they share **physics**
    — they're all couplings between the property and an external utility
    network — and because they share enumerations (fuel types, meter
    identifiers, service grades).
  why_this_exists: |
    The cohesion test is the meter and the fuel. `heating.centralHeating.fuelType`,
    `electricity.mainsElectricity.electricityMeter.mpan`, and
    `energyEfficiency.certificate.mainFuel` all reference the same physical
    couplings under different leaf paths. Putting these on one page keeps
    the fuel-type duplication visible (a gap to fix) rather than silently
    distributed across the schema.
  pull_quote: "Physics, not labels, makes these leaves one aggregate — every utility has a meter, a fuel, and a supplier."
  gap_notes: |
    `fuelType` appears in at least three branches — heating, EPC,
    fixturesAndFittings.stockOfFuel — with three different enums and no
    cross-reference. The schema admits this; downstream consumers pay for
    it. A unified `pdtf-fuel:Scheme` SKOS code list would resolve it
    without changing leaf paths.
  er_diagram: |
    erDiagram
      PROPERTY    ||--o| HEATING        : "heated by"
      PROPERTY    ||--o| ELECTRICITY    : "supplied with"
      PROPERTY    ||--o| WATER          : "supplied with"
      PROPERTY    ||--o| DRAINAGE       : "drains to"
      PROPERTY    ||--o| CONNECTIVITY   : "connected via"
      PROPERTY    ||--o| EPC            : "rated by"
      HEATING     ||--|| FUEL           : "uses"
      HEATING     ||--o| METER          : "metered by"
      ELECTRICITY ||--o| METER          : "metered by"
      WATER       ||--o| METER          : "metered by"
      EPC         ||--|| RATING         : "graded"
      EPC         ||--o{ RECOMMENDATION : "suggests"
      EPC         ||--|| FUEL           : "primary"
      FUEL {
        string value "Mains gas · Electricity · Oil · LPG · Biomass · Solid fuel"
      }
      RATING {
        string current "A–G"
        string potential "A–G"
        integer score
      }
  er_caption: |
    Internal mechanics: each utility is metered, fuelled, and supplied.
    The EPC sits across the whole property, citing its own fuel reading —
    which is one of three independent expressions of the same fact in the
    schema. The diagram makes the duplication visible.
mentioned_but_not_owned:
  - "councilTax (canonical home page 47)"
---
