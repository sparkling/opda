# ODR 0008 — Property Descriptive Attributes

- **Status:** Proposed (planning stub)
- **Date:** 2026-05-20
- **Phase:** Module (blocked by ODR-0005 gate)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q3)
- **Dependencies:** ODR-0004, ODR-0005, ODR-0011

## Scope

The descriptive facts hanging off `opda:Property` / the legal estate. This consolidates what the JSON Schema and web app spread across several aggregate pages (built form, condition, valuation, utilities/energy, local-context searches, encumbrances/completion) into **one module by ontological concern** — per Session 001 Q3's rejection of the by-aggregate partition. It MAY be split into sub-modules when fleshed out, but is planned as one unit so the shared `Property`/`Address`/`Document` references are declared once (Cagle: "flatten the propertyPack mega-tree; that nesting is form ergonomics, not ontology").

Indicative class groups (all attach to Property/Title, not to a `propertyPack` blank node):

- **Built form** — Building, InternalArea, Room, ResidentialFeatures.
- **Condition** — Survey, Defect, CladdingDeclaration (EWS1).
- **Valuation & price** — Valuation, Price, price qualifier.
- **Utilities & energy** — Heating, Electricity/Water supply, Connectivity, Meter, EnergyPerformanceCertificate.
- **Local context** — Search (CON29R/DW, LLC1, environmental, planning), LocalAuthority, NearbyFacility (School/Transport/HealthCare).
- **Encumbrances & completion** — CouncilTax, BuildingsInsurance, Guarantee, Occupier, Letting, CompletionStatement, Apportionment.

## Vocabularies

Core, SHACL (numeric ranges, format patterns), SKOS (built-form, property-type, units, EPC-band, council-tax-band, tenancy-type, etc. → ODR-0011), DASH (UI), PROV-O (authority retrievals — EPC Register, HMLR, search providers → ODR-0009).

## Out of scope

- QUDT for units (kWh, m², W·m⁻²·K⁻¹) — deferred per ODR-0002; carry `xsd:decimal` + SKOS-typed units.
- GeoSPARQL geometry (title plans, search polygons) — deferred (not in Session 001 vocabulary set).

## Open questions

- Whether to split into sub-module ODRs (built-form / energy / searches / encumbrances) once volume is understood — defer to drafting.
- Defect/condition taxonomy (RICS classification), EWS1 / Building Safety Act modelling — UK-specific, WG input.

## Deliverables (when fleshed out)

`property-attributes.ttl` (likely multiple files under one module namespace); the descriptive SKOS schemes (→ ODR-0011); authority-provenance patterns (→ ODR-0009).
