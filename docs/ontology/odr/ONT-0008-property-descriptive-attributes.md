---
status: proposed
date: 2026-05-20
tags: [property, attributes, data-dictionary, module]
supersedes: []
depends-on: [ONT-0004, ONT-0005]
implements: [ONT-0003]
---

# Property Descriptive Attributes

## Context and Problem Statement

The overwhelming bulk of the PDTF v3 base schema is descriptive: of the **1,556 unique leaves** in `pdtf-transaction.json` (935 carrying a semantic annotation, per the data dictionary), the great majority are facts *about a property* rather than about the transaction or the parties — built form, condition, valuation, energy/EPC, utilities and connectivity, local-context search results, encumbrances, and completion/moving arrangements. These hang in the JSON off a deeply nested `propertyPack` mega-tree, and the same descriptive families recur across every form overlay (per-form leaf counts: baspi5 318, rds 196, piq 184, ta6 178, nts2 160, lpe1 136, …). The descriptive layer is where the conversion's volume lives and where the "missing-class / form-ergonomics" defect bites hardest.

Two problems define this module. First, the **attachment** problem: in the schema these facts dangle off a `propertyPack` object with no first-class subject — they describe a property and its legal estate, but the schema has no Property class to attach them to (the ONT-0005 defect). Cagle's Q3 verdict was blunt: "that nesting is form ergonomics, not ontology — flatten it"; the descriptive leaves must attach to the Property/Title classes from ONT-0005, not to a `propertyPack` blank node. Second, the **cross-context reconciliation** problem: the data dictionary's cross-context table shows that the descriptive vocabulary *spans* overlays — `propertyPack` appears in **18** overlays, `energyEfficiency` in **9**, `heating` in **9**, `typeOfConstruction` in **9**, `listingAndConservation` in **9**, `isListed`/`isConservationArea`/`hasTreePreservationOrder` each in **9**, `mainsWater`/`drainage`/`electricity` each in **9–10**. Each of these spanning leaves is *one concept* asked in many forms, and the ontology must reconcile it to **one** datatype property, not mint a duplicate property per form.

Council Session 001 (Q3) rejected partitioning the ontology by aggregate page and resolved to partition by **ontological concern**, reconciling Kendall's FIBO modules with Guizzardi's UFO Kind/Role/Relator layering. This ODR is the **Property descriptive attributes** module under that partition — deliberately one module so the shared `Property`/`Address`/`Document` references are declared once. It is a Phase-1 module and is **gated by the identity crux** (ONT-0005): every descriptive property attaches to the Property/Title classes whose identity criteria are settled in the crux, so it does not start in anger until the crux clears its exemplar gate. It MAY later split into sub-modules (built-form / energy / searches / encumbrances) once volume is understood.

The question: how do we re-express the descriptive leaf inventory so that facts attach to the Property/Title classes rather than to a `propertyPack` blank node, and so that a leaf appearing across many overlays maps to exactly one ontology property carrying full source traceability?

## Decision Drivers

* **Attachment to real classes** (Cagle, Q3) — descriptive facts must attach to the `opda:Property` / legal-estate classes from ONT-0005, not to the `propertyPack` form-ergonomics nesting.
* **Cross-context reconciliation** (Guarino, Q3) — a leaf that spans overlays (`propertyPack` ×18, `energyEfficiency` ×9, `heating` ×9) is one concept; declaring it once and reconciling the overlays is mandatory, or the ontology fractures into per-form synonyms.
* **Data-dictionary as the leaf inventory** — the descriptive datatype properties are sourced from the data dictionary's enumerated leaves; the dictionary is the authoritative inventory of *which* descriptive facts exist and *what each means* (its description text).
* **Source traceability** (Knublauch/Gandon, Q5) — every descriptive property must carry `dct:source` to its canonical schema leaf path and `rdfs:comment` from the dictionary description, per the convention defined in ONT-0004; this is the round-trip that lets a loaded form profile both validate data and regenerate the form.
* **Generator-first** (Allemang, Q1) — the mechanical half (named leaf → `DatatypeProperty` with an `xsd:` range) should be *generated* from the data dictionary, reserving deliberation for the genuinely ambiguous reconciliations (cross-overlay synonymy, `oneOf`-as-subclass-vs-state).
* **Enumerations delegated** — built-form, property-type, units, EPC band, council-tax band, tenancy type and the rest are SKOS concept schemes owned by ONT-0011, not resolved here.

## Considered Options

* **Mirror the JSON tree (per-form duplicate properties)** — reproduce the `propertyPack` nesting and emit a separate property for each form's copy of a spanning leaf (a `baspi5:energyEfficiency`, an `nts2:energyEfficiency`, …). Faithful to the JSON, but reproduces the form-ergonomics nesting as ontology and fractures spanning concepts into per-form synonyms — the exact defect Q3 rejected.
* **Declare-once-reconcile-overlays** (chosen direction) — flatten the `propertyPack` tree; declare each descriptive property **once** as an `opda:` datatype property on the Property/Title class, sourced from the data-dictionary leaf, carrying `dct:source` to the canonical schema leaf path and `rdfs:comment` from the dictionary description; reconcile the spanning leaves so that all overlay occurrences map to that single property; delegate the per-form required/enum variation to the SHACL overlay profiles (ONT-0010) rather than to duplicate properties.

## Decision Outcome

Chosen option: **Declare-once-reconcile-overlays**, because it is the only option that attaches descriptive facts to real Property/Title classes, collapses each spanning leaf to a single ontology property, and pushes per-form variation onto the SHACL profile layer where it belongs — consistent with Q3's flatten-the-form-ergonomics verdict and Q5's overlays-are-profiles-not-classes resolution.

- **Attachment** — descriptive properties attach to the `opda:Property` and legal-estate classes from ONT-0005 (and to intermediate built-form classes such as Building/Room where the fact is about a sub-part), never to a `propertyPack` blank node.
- **Data dictionary as the leaf inventory** — the descriptive datatype properties are enumerated from the data dictionary. The indicative families and their source leaves:
  - **Built form** — `buildInformation`, `typeOfConstruction`/`constructionType`, `builtForm` (`Detached | Semi-detached | Mid-terrace | End-terrace | Other`), `yearOfBuild`, `numberOfFloors`, `internalArea`/`area`/`units`, `bedrooms`/`bathrooms`/`receptions`, `residentialPropertyFeatures`, `rooms`/`roomDimensions`.
  - **Condition** — `surveys`, `subsidenceOrStructuralFault`, `dampProofingTreatment`, `buildingSafety`/`buildingSafetyAct`, `dangerousCladdingOrDefects`, `japaneseKnotweed`.
  - **Valuation & price** — `valuations`/`value`, `price`/`listPrice`/`priceQualifier`, `propertyPricing`/`estimatedPrice`/`rentalEstimate`/`yield`, `valuationComparisonData`.
  - **Energy / EPC** — `energyEfficiency`, `currentEnergyRating` (EPC band `A`–`G`), `energy`/`energyRisk`, `solarPanels`, `greenDealLoan`.
  - **Utilities & connectivity** — `heating`/`heatingType`/`centralHeatingFuelType`, `electricity`/`mainsElectricity`, `water`/`mainsWater`/`waterAndDrainage`/`drainage`, `connectivity`/`broadband`/`mobilePhone`/`typeOfConnection`, meter leaves (`mpan`/`mprn`/`electricityMeter`/`gasMeter`).
  - **Local context (searches)** — `localSearches`/`localAuthoritySearches` (CON29R), `localLandCharges` (LLC1), `environmentalIssues`, `floodRisk`/`flooding`, `radon`/`radonRisk`, `coalMining`, `localAuthority`, `nearbyFacilities`/`schools`/`transport`/`healthCare`, `planning`/`planningApplication`.
  - **Encumbrances** — `councilTax`/`councilTaxBand`, `groundRent`/`serviceCharge`, `buildingsInsurance`/`insurance`, `guaranteesWarrantiesAndIndemnityInsurances`, `rightsAndInformalArrangements`/`publicRightOfWay`, `occupiers`/`lettingInformation`, `listingAndConservation`/`isListed`.
  - **Completion & moving** — `completionAndMoving`, `fixturesAndFittings`/`itemsToInclude`/`itemsToRemove`, `moveRestrictionDates`, `confirmationOfAccuracyByOwners`.
- **Sourcing convention** — each descriptive `opda:` datatype property is sourced from a data-dictionary leaf, carries `dct:source` to its canonical schema leaf path (the form-question IRI of Q5's mapping rule) and its `rdfs:comment` from the dictionary's description text, per the convention defined in ONT-0004.
- **Cross-context reconciliation** — the spanning leaves the data dictionary flags (`propertyPack` ×18, `energyEfficiency` ×9, `heating` ×9, `typeOfConstruction` ×9, `listingAndConservation` ×9, `mainsWater`/`drainage`/`electricity` ×9–10) are each reconciled to **one** ontology property. The differing per-overlay `dct:source` references attach to the single property; the per-form required/enum variation is expressed as SHACL property shapes in the overlay profiles (ONT-0010), not as duplicate datatype properties.
- **Generated, then deliberated** — the mechanical leaf → datatype-property mapping is generated from the data dictionary (Allemang's generator-first rule); deliberation is reserved for the genuinely ambiguous reconciliations and for which `object`-typed leaves become intermediate classes (Building, Room, Survey, Search) versus structured datatypes.

### Consequences

* Good, because descriptive facts attach to the `opda:Property`/legal-estate classes from ONT-0005, eliminating the `propertyPack`-blank-node form-ergonomics defect that Q3 rejected.
* Good, because each spanning leaf (`propertyPack` ×18, `energyEfficiency`/`heating` ×9) collapses to a single ontology property, so the ontology has one term per concept instead of per-form synonyms.
* Good, because sourcing every property from a data-dictionary leaf with `dct:source` + `rdfs:comment` preserves full form-question traceability and supports the BASPI round-trip (loaded profile validates data *and* regenerates the form).
* Good, because the mechanical leaf-to-property mapping is generated from the dictionary, reserving scarce deliberation for the ambiguous reconciliations.
* Bad, because reconciling ~935 annotated base leaves (plus overlay-specific leaves) is high-volume work; subtle cross-overlay synonymy (leaves that *look* the same but carry different form semantics) risks either over-merging distinct concepts or under-merging genuine duplicates.
* Bad, because the module is gated by ONT-0005 and cannot freeze its TBox until the crux settles which classes the descriptive properties attach to.
* Neutral, because the descriptive enumerations (built-form, EPC band, council-tax band, units, tenancy type) are delegated to ONT-0011 (SKOS), and per-form required/enum variation is delegated to the overlay profiles (ONT-0010), rather than resolved here.

### Confirmation

- SHACL shapes (ONT-0013) constrain numeric descriptive properties to plausible ranges and string-formatted ones to their patterns; the overlay profiles (ONT-0010) carry the per-form `sh:minCount`/`sh:in` variation for the reconciled spanning properties.
- Each descriptive SKOS concept and datatype property (ONT-0011 / this module) carries `rdfs:comment` from the data-dictionary description and `dct:source` to the canonical schema leaf path, verified against the data dictionary, per the term-sourcing convention defined in ONT-0004.
- Cross-context reconciliation is verified by checking that each data-dictionary spanning leaf (`propertyPack`, `energyEfficiency`, `heating`, `typeOfConstruction`, `listingAndConservation`, the water/drainage/electricity family) maps to exactly one `opda:` property, with all overlay occurrences resolving to it.
- The module is validated against the descriptive facets of the diagnostic exemplars (ONT-0005): the same property described through two different overlays must populate the *same* ontology properties (no per-form duplication).
- **Gate**: this module's TBox is not frozen until ONT-0005 clears its identity-criterion gate — the descriptive properties attach to the Property/Title classes the crux defines.

## Pros and Cons of the Options

### Mirror the JSON tree (per-form duplicate properties)

* Good, because it is a mechanical, low-effort translation faithful to the JSON nesting and overlay structure.
* Bad, because it reproduces the `propertyPack` form-ergonomics nesting as ontology — the exact defect Cagle's Q3 verdict ("flatten it") rejected.
* Bad, because it fractures each spanning concept (`energyEfficiency` ×9, `heating` ×9) into per-form synonyms, defeating cross-context interoperability.

### Declare-once-reconcile-overlays

* Good, because it attaches facts to real Property/Title classes and gives one ontology property per concept, with per-form variation pushed to the SHACL profile layer (ONT-0010).
* Good, because the data dictionary supplies both the leaf inventory and the `rdfs:comment` text, and `dct:source` preserves form-question traceability for the round-trip.
* Bad, because reconciling the high-volume descriptive corpus is laborious and cross-overlay synonymy must be adjudicated leaf by leaf to avoid over- or under-merging.

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Vocabularies**: Core (OWL/RDFS/XSD); SHACL for numeric ranges and format patterns (→ ONT-0013); SKOS for built-form, property-type, units, EPC-band, council-tax-band, tenancy-type and the other descriptive schemes (→ ONT-0011); DASH for the form-rendering UI (→ ONT-0013); PROV-O for authority-retrieval provenance (EPC Register, HMLR, search providers → ONT-0009).
- **Out of scope** (deferred per ONT-0002 / outside the Session 001 vocabulary set): QUDT for units (kWh, m², W·m⁻²·K⁻¹) — carry `xsd:decimal` + SKOS-typed units; GeoSPARQL geometry (title plans, search polygons, `titleExtents`/`chargeExtent` stringified GeoJSON) — deferred.
- **Data dictionary as the central input**: the leaf inventory above is drawn from `source/00-deliverables/semantic-models/data-dictionary.md` — `pdtf-transaction.json` base (1,556 unique leaves, 935 annotated) plus the per-form overlays (baspi5 318, rds 196, piq 184, ta6 178, nts2 160, lpe1 136, …). The cross-context table (`propertyPack` ×18, `energyEfficiency`/`heating`/`typeOfConstruction`/`listingAndConservation` ×9, water/drainage/electricity family ×9–10) is the authority for which leaves span overlays and so must reconcile to a single property. Each property carries `dct:source` to its leaf path and `rdfs:comment` from the dictionary description; see ONT-0004 for the general term-sourcing and provenance convention.
- **Open questions**: whether to split into sub-module ODRs (built-form / energy / searches / encumbrances) once volume is understood — deferred to drafting; the defect/condition taxonomy (RICS classification) and EWS1 / Building Safety Act modelling — UK-specific, WG input required.
- **Deliverables (when fleshed out)**: `property-attributes.ttl` (likely multiple files under one module namespace); the descriptive SKOS schemes (→ ONT-0011); authority-provenance patterns (→ ONT-0009); the generated leaf → datatype-property mapping with `dct:source`/`rdfs:comment` from the data dictionary.
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); foundation [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md); the gating crux whose Property/Title classes these attributes attach to [ONT-0005](./ONT-0005-property-land-identity-crux.md); agents & roles [ONT-0006](./ONT-0006-agents-and-roles.md); transactions & lifecycle [ONT-0007](./ONT-0007-transactions-and-lifecycle.md); provenance [ONT-0009](./ONT-0009-claims-evidence-provenance.md); overlay profiles [ONT-0010](./ONT-0010-overlay-profile-mechanism.md); enumerations [ONT-0011](./ONT-0011-enumeration-vocabularies.md); validation [ONT-0013](./ONT-0013-shacl-validation-and-severity.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q3 (partition by concern; flatten `propertyPack`; Evidence/Claims cross-cutting).

## Vote and Dissent

This module ODR records no vote of its own — it is a planning record to be deliberated in its own follow-up session. The Council Session 001 positions it inherits:

- **Q3 partition** — strong consensus against the by-aggregate-page partition; partition by ontological concern (UFO/FIBO). Cagle: "that nesting [`propertyPack`] is form ergonomics, not ontology — flatten it." Guarino: the pages are good didactics, not ontological cohesion. This module is the consolidated "Property descriptive attributes" concern; it MAY split into sub-modules later (editorial only — flat published namespace, modules via `rdfs:isDefinedBy`, per Davis).
- **Q1 generator-first** (Allemang) — the mechanical leaf → datatype-property half is generated from the data dictionary; deliberation is reserved for the ambiguous cross-overlay reconciliations.
- **Q5 overlays-are-profiles** (Knublauch) — per-form required/enum variation for the reconciled spanning properties is expressed as SHACL property shapes in the overlay profiles (ONT-0010), not as duplicate datatype properties.
- No recorded dissent specific to Property descriptive attributes; the high-volume reconciliation work inherits the general spike-then-scale sequencing (Q7) behind the ONT-0005 gate.
