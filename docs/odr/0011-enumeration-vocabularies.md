# ODR 0011 — Enumeration Vocabularies

- **Status:** Proposed (planning stub)
- **Date:** 2026-05-20
- **Phase:** Cross-cutting (sibling of Foundation — many modules depend on it)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q5; Baker/Knublauch/Pandit)
- **Dependencies:** ODR-0004

## Scope

Convert the JSON Schema's many `enum` lists into **SKOS concept schemes** rather than OWL classes or bare string literals — so they are governable as controlled vocabularies without dragging in OWL semantics (Baker, Knublauch). This is a cross-cutting register every module draws on.

Indicative schemes (non-exhaustive — enumerated during drafting):

- **Roles & capacity** — participant role, `sellersCapacity` (Legal Owner / Personal Representative / Attorney / Mortgagee in Possession).
- **Tenure & legal** — tenure type, restriction type, charge type.
- **Built form** — property type, built form, internal-area units, price qualifier.
- **Energy & utilities** — EPC band (A–G), fuel type, heating distribution, broadband technology.
- **Encumbrances** — council-tax band (A–H, + I for Wales), tenancy type, guarantee type.
- **Searches** — school type, transport type, healthcare type, planning status.
- **Provenance/assurance** — evidence type, verification-method code, `opda:assuranceLevel` (→ ODR-0009).
- **Governance** — DPV personal-data categories, processing-purpose taxonomy (→ ODR-0012).

## Conventions

- Each scheme is a `skos:ConceptScheme`; members `skos:inScheme`; `skos:prefLabel` (with language tag), `skos:notation` for the canonical code, `skos:definition`.
- CLOSED vs OPEN-ENDED schemes flagged (closed enums get a SHACL `sh:in` over the members in ODR-0013; open-ended ones don't).
- Where an enum drives a form control, the scheme is the source for DASH `dash:EnumSelectEditor` (ODR-0010/0013).

## Vocabularies

SKOS, Core (`dct:` on schemes per the commons-substrate decision).

## Open questions

- Which enums are genuinely closed (SHACL-enforced) vs open-ended (extensible without ODR churn) — per-enum call during drafting.
- Reuse of external schemes where they exist (e.g. council-tax bands) vs minting `opda:` schemes.

## Deliverables (when fleshed out)

One TTL per scheme (or a consolidated `vocabularies.ttl`); the closed/open-ended register; cross-links to the modules and SHACL/DASH consumers.
