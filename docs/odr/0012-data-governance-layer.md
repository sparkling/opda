# ODR 0012 — Data-Governance Layer (DPV)

- **Status:** Proposed (planning stub — contains a live recorded dissent)
- **Date:** 2026-05-20
- **Phase:** Cross-cutting
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q2 — owned by Pandit)
- **Dependencies:** ODR-0004; co-annotates ODR-0006 (participants) and ODR-0009 (evidence)

## Scope

The personal-data governance layer. The PDTF transaction carries names, dates of birth, addresses, phone, email, identity-document and personal numbers, AML results, conveyancer notes, occupier names, and seller-capacity evidence — dense PII and special-category-adjacent data (Pandit). Governance is a **primary concern that shapes the TBox**, not an afterthought.

### Phase 1 — adopt now (TBox annotation, no instances)

- **`dpv:hasPersonalData`** — type classes/properties as personal-data-bearing (e.g. `opda:dateOfBirth`, `opda:email`, `opda:address`).
- **`dpv:hasPersonalDataCategory`** — `dpv-pd:Name`, `dpv-pd:DateOfBirth`, `dpv-pd:Address`, `dpv-pd:EmailAddress`, `dpv-pd:TelephoneNumber`, `dpv-pd:OfficialID` (document/personal numbers).
- **`dpv-legal:` jurisdiction tagging** — UK-GDPR + DPA 2018 as the governing-regime annotation on the relevant module.
- **Special-category flag** — `cautionOrConviction` and AML results are Article-10-adjacent; type at TBox level (`dpv:hasSpecialCategoryPersonalData`).

### Phase 2 — deferred (need instances or policy decisions OPDA has not made)

Lawful basis bound to operations; consent records; ODRL policies; purpose bound to processing events.

### Recorded dissent (Pandit vs the brief — keep live)

Pandit argues the **lawful-basis / consent / purpose *class vocabulary*** (the TBox terms `dpv:hasLegalBasis`, `dpv-gdpr:Consent`, and a purpose taxonomy `opda:IdentityVerification`/`opda:AntiMoneyLaundering`/`opda:ConveyancingDueDiligence`) is **TBox-expressible and wrongly deferred** — defining the vocabulary is a TBox act; only *populating* it is Phase 2. The brief's "no instance data" does not forbid declaring the slots. **This ODR must rule on whether Phase 1 extends to the lawful-basis/purpose class vocabulary, or holds at annotation-only.**

### ODRL

Adopted in the catalogue but **policy-authoring deferred** — Guarino's Session 001 point: ODRL `Policy`/`Permission` bite only on instances, which this round forbids; an ODRL TBox alone asserts nothing.

## Vocabularies

DPV family (`dpv`, `dpv-pd`, `dpv-legal`, `dpv-gdpr`), referenced-not-imported (Kendall); SKOS (PD categories, purpose taxonomy → ODR-0011); ODRL (deferred).

## Deliverables (when fleshed out)

`governance.ttl` (Phase-1 annotations + the lawful-basis/purpose vocabulary if the dissent carries); the PII-module boundary; SHACL sensitivity gate (→ ODR-0013); a standing rule that any new PII-bearing field costs a Council session (Pandit, Q7).
