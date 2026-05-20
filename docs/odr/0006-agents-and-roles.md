# ODR 0006 — Agents & Roles

- **Status:** Proposed (planning stub)
- **Date:** 2026-05-20
- **Phase:** Module (blocked by ODR-0005 gate)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q3, Q4)
- **Dependencies:** ODR-0004, ODR-0005, ODR-0011 (role/capacity enums)

## Scope

The people and organisations attached to a transaction, modelled with correct UFO categories (Guizzardi) rather than the schema's flat `participants[]` + `role` enum.

- **`opda:Person`, `opda:Organisation`** — substance **Kinds** (rigid, identity-supplying).
- **`opda:Seller`, `opda:Buyer`** — **RoleMixins**, because the role is played by a Person *or* an Organisation (`participants[].organisation`; register `privateIndividual` vs `organization`), each specialised by a sortal role (`PersonSeller`, `OrganisationSeller`) that carries identity. Founded by the `opda:Transaction` relator.
- **`opda:Proprietor`, `opda:Conveyancer`, `opda:EstateAgent`, `opda:Surveyor`, `opda:Lender`, `opda:Insurer`** — **Roles** (anti-rigid, externally dependent), founded by the relevant Relator (Proprietor by a `opda:Proprietorship`).
- **`opda:Name`, `opda:Address`** structured types (Address shared with ODR-0005/0008 — confirm single class).
- **Capacity → split** (page 35's flagged gap): `opda:assertedCapacity` (SKOS) vs `opda:evidencedAuthority` (→ ODR-0009 evidence). The founding grant (probate, POA) is the missing Relator.

## Vocabularies

Core, SKOS (role/capacity enums → ODR-0011), PROV-O (verification cross-link → ODR-0009), DPV (PII annotation → ODR-0012). **OWL-Time** if role-tenure intervals are modelled here.

## Open questions

- **FOAF vs `prov:Agent` vs org-ontology** (Guarino, Q2): `prov:Agent` is deliberately thin (no person/org distinction, no name structure). Decide whether to reuse FOAF / W3C org ontology for the Kind layer, keeping `prov:Agent` only for the provenance role.
- Rigid Kind vs RoleMixin boundary cases — confirm against ODR-0005's category commitments.

## Deliverables (when fleshed out)

`agents-roles.ttl`; Role/Capacity/Status SKOS schemes (→ ODR-0011); DPV PII annotations (→ ODR-0012).
