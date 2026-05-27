---
status: proposed
date: 2026-05-20
kind: pattern
tags: [property, attributes, data-dictionary, module]
scope: [pdtf-v3:propertyPack]
council: session-001
supersedes: []
depends-on: [ODR-0004, ODR-0005]
implements: [ODR-0003]
---

# Property Descriptive Attributes

## Context

The descriptive layer is where PDTF v3 volume lives: of 1,556 unique leaves in `pdtf-transaction.json` (935 annotated), the great majority describe a property (built form, condition, valuation, EPC/energy, utilities, searches, encumbrances, completion). All hang off a deeply nested `propertyPack` mega-tree, and the same descriptive families recur across every form overlay (baspi5 318, rds 196, piq 184, ta6 178, nts2 160, lpe1 136, …).

Two defects bite. First, **attachment**: in the schema these facts dangle off `propertyPack` with no first-class subject — the ontology has no Property class to attach them to (ODR-0005 defect; Cagle Q3: "that nesting is form ergonomics, not ontology — flatten it"). Second, **cross-context reconciliation**: spanning leaves recur across overlays — `propertyPack` ×18, `energyEfficiency`/`heating`/`typeOfConstruction`/`listingAndConservation` ×9, `mainsWater`/`drainage`/`electricity` ×9–10 — and must reconcile to one ontology property, not mint per-form synonyms.

Council Session 001 (Q3) resolved to partition by **ontological concern**. This ODR is the **Property descriptive attributes** module under that partition — a Phase-1 module gated by ODR-0005's identity crux, which MAY later split into sub-modules (built-form / energy / searches / encumbrances) once volume is understood.

## Decision

Adopt **Declare-once-reconcile-overlays**: flatten the `propertyPack` tree; declare each descriptive property **once** as an `opda:` datatype property on the Property/Title class, sourced from the canonical data-dictionary leaf with `dct:source` + `rdfs:comment`; reconcile spanning leaves so all overlay occurrences map to that single property; push per-form required/enum variation onto the SHACL overlay profiles (ODR-0010). Chosen because it is the only option that attaches descriptive facts to real classes, collapses each spanning leaf to one term, and keeps per-form variation in the profile layer where Q3 and Q5 placed it.

## Rules

**Attachment** — Descriptive properties attach to `opda:Property` and the legal-estate classes from ODR-0005 (and to intermediate built-form classes such as Building/Room where the fact is about a sub-part). Never to a `propertyPack` blank node.

**Data dictionary as the leaf inventory** — The descriptive datatype properties are enumerated from the data dictionary. Indicative families and source leaves:

- **Built form** — `buildInformation`, `typeOfConstruction`/`constructionType`, `builtForm` (`Detached | Semi-detached | Mid-terrace | End-terrace | Other`), `yearOfBuild`, `numberOfFloors`, `internalArea`/`area`/`units`, `bedrooms`/`bathrooms`/`receptions`, `residentialPropertyFeatures`, `rooms`/`roomDimensions`.
- **Condition** — `surveys`, `subsidenceOrStructuralFault`, `dampProofingTreatment`, `buildingSafety`/`buildingSafetyAct`, `dangerousCladdingOrDefects`, `japaneseKnotweed`.
- **Valuation & price** — `valuations`/`value`, `price`/`listPrice`/`priceQualifier`, `propertyPricing`/`estimatedPrice`/`rentalEstimate`/`yield`, `valuationComparisonData`.
- **Energy / EPC** — `energyEfficiency`, `currentEnergyRating` (EPC band `A`–`G`), `energy`/`energyRisk`, `solarPanels`, `greenDealLoan`.
- **Utilities & connectivity** — `heating`/`heatingType`/`centralHeatingFuelType`, `electricity`/`mainsElectricity`, `water`/`mainsWater`/`waterAndDrainage`/`drainage`, `connectivity`/`broadband`/`mobilePhone`/`typeOfConnection`, meter leaves (`mpan`/`mprn`/`electricityMeter`/`gasMeter`).
- **Local context (searches)** — `localSearches`/`localAuthoritySearches` (CON29R), `localLandCharges` (LLC1), `environmentalIssues`, `floodRisk`/`flooding`, `radon`/`radonRisk`, `coalMining`, `localAuthority`, `nearbyFacilities`/`schools`/`transport`/`healthCare`, `planning`/`planningApplication`.
- **Encumbrances** — `councilTax`/`councilTaxBand`, `groundRent`/`serviceCharge`, `buildingsInsurance`/`insurance`, `guaranteesWarrantiesAndIndemnityInsurances`, `rightsAndInformalArrangements`/`publicRightOfWay`, `occupiers`/`lettingInformation`, `listingAndConservation`/`isListed`.
- **Completion & moving** — `completionAndMoving`, `fixturesAndFittings`/`itemsToInclude`/`itemsToRemove`, `moveRestrictionDates`, `confirmationOfAccuracyByOwners`.

**Sourcing convention** — Each descriptive `opda:` datatype property is sourced from a data-dictionary leaf, carries `dct:source` to its canonical schema leaf path (the form-question IRI of Q5's mapping rule) and `rdfs:comment` from the dictionary's description text, per the convention defined in ODR-0004.

**Cross-context reconciliation** — Spanning leaves the data dictionary flags (`propertyPack` ×18, `energyEfficiency` ×9, `heating` ×9, `typeOfConstruction` ×9, `listingAndConservation` ×9, `mainsWater`/`drainage`/`electricity` ×9–10) each reconcile to **one** ontology property. The differing per-overlay `dct:source` references attach to the single property; per-form required/enum variation is expressed as SHACL property shapes in the overlay profiles (ODR-0010), not as duplicate datatype properties.

**Generated, then deliberated** — The mechanical leaf → datatype-property mapping is generated from the data dictionary (Allemang's generator-first rule, Q1). Deliberation is reserved for genuinely ambiguous reconciliations and for which `object`-typed leaves become intermediate classes (Building, Room, Survey, Search) versus structured datatypes.

**Enforcement** — SHACL shapes (ODR-0013) constrain numeric descriptive properties to plausible ranges and string-formatted ones to their patterns; the overlay profiles (ODR-0010) carry per-form `sh:minCount`/`sh:in` variation for reconciled spanning properties. Cross-context reconciliation is verified by checking that each data-dictionary spanning leaf maps to exactly one `opda:` property with all overlay occurrences resolving to it. The module is validated against the descriptive facets of the diagnostic exemplars (ODR-0005): the same property described through two different overlays must populate the *same* ontology properties.

**Gate** — This module's TBox is not frozen until ODR-0005 clears its identity-criterion gate; descriptive properties attach to the Property/Title classes the crux defines.

**Delegated** — Descriptive enumerations (built-form, property-type, units, EPC band, council-tax band, tenancy type) are SKOS concept schemes owned by ODR-0011, not resolved here.

## Alternatives

- **Mirror the JSON tree (per-form duplicate properties)** — emit a separate property for each form's copy of a spanning leaf. Fatal flaw: reproduces the `propertyPack` form-ergonomics nesting as ontology and fractures spanning concepts into per-form synonyms — the exact defect Q3 rejected.

## Consequences

- Descriptive facts attach to `opda:Property`/legal-estate classes from ODR-0005; the `propertyPack`-blank-node defect is eliminated.
- Each spanning leaf collapses to a single ontology property; the ontology gets one term per concept instead of per-form synonyms.
- Every property carries `dct:source` + `rdfs:comment` from the dictionary, supporting the BASPI round-trip (loaded profile validates data *and* regenerates the form).
- The mechanical leaf-to-property mapping is generated from the dictionary; scarce deliberation is reserved for ambiguous reconciliations.
- Reconciling ~935 annotated base leaves (plus overlay-specific leaves) is high-volume work; cross-overlay synonymy must be adjudicated leaf by leaf to avoid over- or under-merging.
- The module is gated by ODR-0005 and cannot freeze its TBox until the crux settles.
- Per-form required/enum variation MUST be authored as SHACL profile shapes (ODR-0010); descriptive enumerations MUST be authored as SKOS schemes (ODR-0011).

## References

- **Target versions**: RDF 1.2 and SHACL 1.2, per the Core-tier pin in [ODR-0002](./ODR-0002-ontology-language-adoption.md).
- **Vocabularies**: Core (OWL/RDFS/XSD); SHACL for numeric ranges and format patterns (→ ODR-0013); SKOS for the descriptive enumerations (→ ODR-0011); DASH for form-rendering UI (→ ODR-0013); PROV-O for authority-retrieval provenance (EPC Register, HMLR, search providers → ODR-0009).
- **Out of scope** (deferred per ODR-0002): QUDT for units (kWh, m², W·m⁻²·K⁻¹) — carry `xsd:decimal` + SKOS-typed units; GeoSPARQL geometry (title plans, search polygons, `titleExtents`/`chargeExtent` stringified GeoJSON) — deferred.
- **Data dictionary**: `source/00-deliverables/semantic-models/data-dictionary.md` — `pdtf-transaction.json` base (1,556 unique leaves, 935 annotated) plus per-form overlays (baspi5 318, rds 196, piq 184, ta6 178, nts2 160, lpe1 136, …). The cross-context table is the authority for which leaves span overlays.
- **Open questions**: whether to split into sub-module ODRs (built-form / energy / searches / encumbrances) once volume is understood — deferred to drafting; the defect/condition taxonomy (RICS classification) and EWS1 / Building Safety Act modelling — UK-specific, WG input required.
- **Deliverables**: `property-attributes.ttl` (likely multiple files under one module namespace); the descriptive SKOS schemes (→ ODR-0011); authority-provenance patterns (→ ODR-0009); the generated leaf → datatype-property mapping with `dct:source`/`rdfs:comment` from the data dictionary.
- **Related**: anchor [ODR-0003](./ODR-0003-pdtf-ontology-programme.md); foundation [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md); gating crux [ODR-0005](./ODR-0005-property-land-identity-crux.md); agents & roles [ODR-0006](./ODR-0006-agents-and-roles.md); transactions & lifecycle [ODR-0007](./ODR-0007-transactions-and-lifecycle.md); provenance [ODR-0009](./ODR-0009-claims-evidence-provenance.md); overlay profiles [ODR-0010](./ODR-0010-overlay-profile-mechanism.md); enumerations [ODR-0011](./ODR-0011-enumeration-vocabularies.md); validation [ODR-0013](./ODR-0013-shacl-validation-and-severity.md).
- **Council**: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q3 (partition by concern; flatten `propertyPack`).
