---
status: proposed
date: 2026-05-20
tags: [agents, roles, ufo, foaf, module]
supersedes: []
depends-on: [ONT-0004, ONT-0005, ONT-0011]
implements: [ONT-0003]
---

# Agents & Roles

## Context and Problem Statement

The PDTF v3 base schema models everyone attached to a transaction as a flat `participants[]` array discriminated by a `role` enum, with `participants[].name`, `participants[].address`, `participants[].organisation`, `participants[].dateOfBirth` and `participants[].email` hanging off each entry. The register distinguishes `privateIndividual` from `organization` only as an enum value, not as a type. This is the participant analogue of the implicit-Property defect (ONT-0005): the things that supply identity (a person, an organisation) are conflated with the things that are anti-rigid and externally founded (being a *seller*, a *buyer*, a *conveyancer*). Capacity is a particular casualty — the schema's `sellersCapacity` and the page-35 gap between *asserted* capacity and *evidenced* authority (probate, power of attorney) collapse a founding legal grant into a free-text enum.

Council Session 001 (Q3) rejected partitioning the ontology by aggregate page and resolved to partition by **ontological concern**, reconciling Kendall's FIBO modules with Guizzardi's UFO Kind/Role/Relator layering. This ODR is the **Agents & Roles** module under that partition. It is a Phase-1 module and is **gated by the identity crux** (ONT-0005): it does not start in anger until the crux clears, because Person/Organisation identity criteria and the Address class are shared with the Property work.

The question: how do we re-express `participants[]` + `role` so that identity-supplying entities, the roles they play, and the legal relations that found those roles are each modelled with the correct UFO category — without inventing terms where a standard vocabulary already fits?

## Decision Drivers

* **UFO category correctness** (Guizzardi) — a Kind is rigid and identity-supplying; a Role is anti-rigid and externally founded. Modelling a seller as a subclass of Person is a rigidity error.
* **Declare reused entities once** (Kendall) — `Address` and `Name` are shared with ONT-0005 (Property) and ONT-0008 (descriptive attributes); they must be defined in one place.
* **Capacity vs evidenced authority** — the asserted/evidenced split is the hook into the provenance/evidence layer (ONT-0009); the founding grant (probate, POA) is a missing Relator.
* **Reuse over reinvention** (ODR-0002 adoption pattern) — prefer a standard agent vocabulary to a bespoke `opda:` re-mint, *if* one fits the Kind layer.
* **Ubiquitous-language alignment** — role and capacity terms must align to the business glossary so the ontology speaks the trust-framework's established vocabulary (`Participant`, `Role`, `Scheme Operator`, `Data Provider`/`Data Recipient`).

## Considered Options

* **Keep the schema shape** — one `opda:Participant` class with a `role` datatype property. Faithful to the JSON, but reproduces the defect: no identity criterion, role conflated with bearer.
* **`prov:Agent`-only agent layer** — model every party as a `prov:Agent` subtype. Minimal, provenance-ready.
* **FOAF / W3C Org ontology for the Kind layer + UFO Kind/RoleMixin/Role layering for the role layer** (chosen direction) — Person/Organisation as substance Kinds; Seller/Buyer as RoleMixins; professional parties as Roles founded by Relators; `prov:Agent` retained only for the provenance role. The exact Kind-layer vocabulary (FOAF vs W3C Org vs bespoke) is itself an open question carried into this ODR.

## Decision Outcome

Chosen option: **FOAF/Org Kind layer + UFO Kind/RoleMixin/Role layering**, because it is the only option that places identity where identity actually lives (the person/organisation) while keeping role-play anti-rigid and externally founded, and because it leaves a clean seam to the provenance layer via `prov:Agent`.

- **`opda:Person`, `opda:Organisation`** — substance **Kinds** (rigid, identity-supplying). Identity criteria coordinated with ONT-0005's category commitments.
- **`opda:Seller`, `opda:Buyer`** — **RoleMixins**, because the role is played by a Person *or* an Organisation (`participants[].organisation`; register `privateIndividual` vs `organization`). Each is specialised by a sortal role (`PersonSeller`, `OrganisationSeller`) that carries identity, and founded by the `opda:Transaction` relator (ONT-0007).
- **`opda:Proprietor`, `opda:Conveyancer`, `opda:EstateAgent`, `opda:Surveyor`, `opda:Lender`, `opda:Insurer`** — **Roles** (anti-rigid, externally dependent), each founded by the relevant Relator (Proprietor by an `opda:Proprietorship`).
- **`opda:Name`, `opda:Address`** — structured datatypes, declared **once** here and reused by ONT-0005/0008 (single Address class confirmed).
- **Capacity split** — `opda:assertedCapacity` (SKOS, → ONT-0011) vs `opda:evidencedAuthority` (→ ONT-0009 evidence). The founding grant (probate, POA) is modelled as the missing Relator.
- **`prov:Agent`** is retained only as the provenance role in claim/verification activities (ONT-0009), not as the Kind-layer agent type.

The **FOAF vs `prov:Agent` vs W3C Org ontology** choice for the Kind layer is **deferred to this ODR's own follow-up council session** (Q2 open question): `prov:Agent` is deliberately thin (no person/org distinction, no name structure), so the live question is whether to reuse FOAF / W3C Org for the Kind layer while keeping `prov:Agent` for provenance only.

### Consequences

* Good, because identity-supplying Kinds are separated from anti-rigid Roles, eliminating the rigidity error baked into `participants[] + role`.
* Good, because `Address`/`Name` are declared once and reused, satisfying Kendall's "declare reused entities once" driver.
* Good, because the asserted/evidenced capacity split gives the evidence layer (ONT-0009) a precise attachment point and surfaces the missing founding-grant Relator.
* Bad, because the Kind-layer vocabulary question (FOAF vs Org vs bespoke) is left open, so a second deliberation is required before the module's TBox can be frozen.
* Neutral, because role and capacity enumerations are delegated to ONT-0011 (SKOS concept schemes) rather than resolved here.

### Confirmation

- SHACL shapes (ONT-0013) constrain `opda:Seller`/`opda:Buyer` role-play to a `opda:Person` or `opda:Organisation` bearer, and require an `opda:evidencedAuthority` link where a capacity is asserted in a regulated context.
- The module is validated against the participant facets of the diagnostic exemplars (ONT-0005): a private-individual seller, an organisation seller, a seller acting under power of attorney.
- Role and capacity SKOS concepts (ONT-0011) carry `skos:prefLabel`/`skos:definition` sourced from the business glossary and `dct:source` back to it.
- **Gate**: this module's TBox is not frozen until (a) ONT-0005 clears its identity-criterion gate and (b) the FOAF/Org open question is resolved in council.

## Pros and Cons of the Options

### Keep the schema shape

* Good, because it is a mechanical, low-effort translation faithful to the JSON.
* Bad, because it reproduces the exact defect the conversion exists to fix — no identity criterion, bearer conflated with role.

### `prov:Agent`-only agent layer

* Good, because it is provenance-ready out of the box and needs no external vocabulary.
* Bad, because `prov:Agent` is deliberately thin: no Person/Organisation distinction, no structured `Name` — it cannot carry the Kind layer (Guarino, Q2).

### FOAF/Org Kind layer + UFO layering

* Good, because UFO categories place rigidity and identity correctly and the Relators make founding grants explicit.
* Good, because it reuses a standard agent vocabulary for the Kind layer rather than re-minting under `opda:`.
* Bad, because it defers the FOAF-vs-Org choice and so requires a second council pass before freeze.

## More Information

- **Vocabularies**: Core (OWL/RDFS/XSD); SKOS for role/capacity schemes (→ ONT-0011); PROV-O for the verification cross-link (→ ONT-0009); DPV for PII annotation on Person/contact leaves (→ ONT-0012); OWL-Time if role-tenure intervals are modelled here. Candidate Kind-layer vocabularies under the open question: FOAF, W3C Org ontology.
- **Glossary & data dictionary as inputs**: the role concept scheme (ONT-0011) draws its enumerated members from the data dictionary's `role` enum (`baspi5.json`: Buyer, Seller's Conveyancer, Prospective Buyer, Buyer's Conveyancer, Estate Agent, Buyer's Agent…) and its `skos:definition`/`skos:prefLabel` from the **business glossary** (`Participant`, `Role`, `Scheme Operator`, `Data Provider`, `Data Recipient`, `TPP`). Each concept carries `dct:source` to its glossary row or schema leaf path. See ONT-0004 for the general term-sourcing and provenance convention.
- **Deliverables (when fleshed out)**: `agents-roles.ttl`; Role/Capacity/Status SKOS schemes (→ ONT-0011); DPV PII annotations (→ ONT-0012); SHACL role-play and capacity-evidence shapes (→ ONT-0013).
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); foundation [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md); the gating crux [ONT-0005](./ONT-0005-property-land-identity-crux.md); provenance [ONT-0009](./ONT-0009-claims-evidence-provenance.md); enumerations [ONT-0011](./ONT-0011-enumeration-vocabularies.md); governance [ONT-0012](./ONT-0012-data-governance-layer.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q2 (FOAF open question), Q3 (partition), Q4 (shared Address/identity).

## Vote and Dissent

This module ODR records no vote of its own — it is a planning record to be deliberated in its own follow-up session. The Council Session 001 positions it inherits:

- **Q3 partition** — consensus against the by-aggregate-page partition; partition by ontological concern (UFO/FIBO). Evidence/Claims promoted to cross-cutting.
- **Q2 FOAF** — **open question recorded** (Guarino): `prov:Agent` is too thin for the Kind layer; FOAF vs W3C Org vs bespoke left for this ODR's session.
- No recorded dissent specific to Agents & Roles beyond the open Kind-layer-vocabulary question.
