# ODR 0014 — Vocabulary Catalogue Amendments

- **Status:** Proposed (planning stub — **amends [ODR-0002](./0002-ontology-language-adoption.md)**)
- **Date:** 2026-05-20
- **Phase:** Amendment (independent — can land immediately)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q2)

## Scope

Records the changes Council Session 001 made to the ODR-0002 vocabulary catalogue while scoping the PDTF-ontology work. When accepted, ODR-0002's tiering tables are updated and ODR-0002 gains a "Superseded in part by ODR-0014" note on the affected rows.

## Amendments

| Vocabulary | ODR-0002 said | Session 001 decision | Rationale |
|---|---|---|---|
| **OWL-Time** | Conditional, "use only where bitemporal/interval semantics genuinely needed" — and the PDTF brief initially **excluded** it | **ADOPT (Conditional), in scope for this programme** | Adopting PROV-O's `prov:atTime` (an instant) while proprietorship, lease terms, and claim-validity *intervals* go unmodelled is incoherent (Guizzardi/Gandon). ≈6-3 over an "await concrete consumer" dissent (Allemang/Davis). |
| **DCAT 3** | Conditional | **Confirmed Conditional** (Davis wanted Core; Baker held Conditional) | Ontology-as-published-dataset + reference data; near-zero marginal cost over `dct:`. Not Core — no catalogue task this round. |
| **SSSOM / SEMAPV** | Conditional ("pair with semapv for the process side") | **Deferred** for internal overlay refs; use `dct:source` to form-question IRIs now | SSSOM earns its place mapping to *external* vocabularies (FIBO, INSPIRE); for single-source internal refs it is machinery without a target (Gandon/Knublauch). Cagle dissent recorded (≈5-4). |
| **ODRL** | Conditional, "restrict to access-control layers" | **Vocabulary adopted; policy-authoring deferred** to Phase 2 | ODRL `Policy`/`Permission` bite only on *instances*, which this round forbids — an ODRL TBox alone asserts nothing (Guarino's contradiction). |
| **DPV family** | Conditional | **Phase-1 annotation adopted; broader TBox vocab is a live question** | See ODR-0012 (Pandit's recorded dissent on lawful-basis/consent/purpose class vocabulary). |
| **Dublin Core** | Core ("administrative metadata") | **Reclassified rationale: "commons substrate"** | DCAT/PROV-O/SKOS/VANN all already depend on `dct:` (Baker). No tier change — strengthened justification. |
| **BBO, ArchiMate** | Conditional/Defer | **Out for this programme** | No process- or capability-modelling task. Unanimous. |

## New open questions raised (not adopted)

- **OBO RO** — Kendall proposed adding it for transitive part-of (flat→block→estate); Davis rejected (biology-flavoured; use `dct:isPartOf`). No consensus — left open.
- **FOAF / W3C org ontology** — Guarino: `prov:Agent` is too thin for the person/organisation participant model. Decide in ODR-0006.

## Deliverables (when fleshed out)

Edits to ODR-0002's Core/Conditional/Defer tables; OWL-Time moved into active scope with its adoption pattern; the OBO-RO and FOAF questions tracked for their owning ODRs.
