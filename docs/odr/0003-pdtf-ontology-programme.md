# ODR 0003 — PDTF → Ontology: Programme & Work Breakdown (Anchor)

- **Status:** Proposed
- **Date:** 2026-05-20
- **Type:** Anchor ODR — indexes and sequences the PDTF-ontology work packages
- **Council session:** [session-001](./council/session-001-pdtf-schema-to-ontology.md)
- **Related:** ODR-0001 (Council methodology), ODR-0002 (vocabulary catalogue)

## Purpose

This is the **anchor** for converting the Property Data Trust Framework v3 JSON Schema into a linked-data ontology. It records the programme-level decisions from Council Session 001, sequences the work, and links every work-package ODR. It is **planning only** — each linked ODR is a stub to be fleshed out in its own follow-up session. No ontology is authored here.

## What is being converted

- **`pdtf-transaction.json`** (37,224 lines, JSON Schema Draft-07) — the base residential-property-transaction model for England & Wales, plus the `verifiedClaims` OIDC4IDA/eIDAS envelope and 10+ deep-merge form overlays (BASPI, TA6/7/10, NTS, LPE1, CON29R/DW, LLC1, FME1).
- **The web-app schema section** (`src/pages/schema/*.astro`, `source/_content/schema/*.md`) — 11 pages, 3,561 leaves walked, 15 overlays cross-referenced, which already names the load-bearing defect (the implicit Property entity, page 37).

## Programme decisions (from Session 001)

| Q | Decision | Detail |
|---|---|---|
| Q1 | Genuine modelling, generator-assisted | Mechanical slot→property translation is generated; Council time reserved for ambiguous moves. **Diagnostic exemplars admitted** to test identity criteria (non-deliverable). |
| Q2 | Vocabulary set | Core + DASH + PROV-O (mandatory in claims/milestone layers) + DPV Phase-1 + **OWL-Time (Conditional, newly adopted)** + DCAT (Conditional). ODRL adopted but policy-authoring deferred. SSSOM deferred. BBO/ArchiMate out. → ODR-0014 amends ODR-0002. |
| Q3 | **Partition by ontological concern, NOT by aggregate page** | FIBO-module × UFO-layer reconciliation; Evidence/Claims/Enums/Governance/Validation cross-cutting; OWL class-graph separated from SHACL shapes-graph; flat published namespace, modules editorial-only. |
| Q4 | Property defect → multi-class split; **identity criterion is the gating crux** | Physical Property distinct from the legal/registered thing; SHACL/DASH uniqueness as the primary checkable key; no `owl:sameAs`; Endurant commitment + ICs over hard cases deferred to ODR-0005, exemplar-validated. |
| Q5 | Overlays → SHACL profiles | Reified as `opda:ValidationContext`; composition is a documented build-step graph-union; `dct:source` form-traceability; no overlay overrides identity. |
| Q6 | verifiedClaims → PROV-O + assurance layer | PROV-O backbone (~80%); eIDAS envelope (trust framework, validation/verification split, crypto digests, assurance level) in a separate `opda:assuranceLevel`/`dct:`/local layer. |
| Q7 | **Spike-then-scale** | URI policy first; identity crux gates everything; prove one BASPI5 vertical slice end-to-end before scaling overlays. |

Full positions and vote tallies (with recorded dissents and DA withdrawals) are in the [session transcript](./council/session-001-pdtf-schema-to-ontology.md) and [`council/working/`](./council/working/).

## Work breakdown

### Phase 0 — Spike (gates the programme)

- **[ODR-0004](./0004-pdtf-ontology-foundation.md) — Foundation.** URI/namespace strategy (single `opda:` hash namespace), ontology-header pattern, OWL-graph ⊥ SHACL-graph separation, generator-first policy, diagnostic-exemplar policy.
- **[ODR-0005](./0005-property-land-identity-crux.md) — Property & Land identity crux.** *The gate.* Class split, DOLCE Endurant commitment, identity criteria over demolition/subdivision/merger/first-registration, UPRN key-vs-contingent-identifier resolution — validated against diagnostic exemplars. **No module ODR is drafted in anger until this clears.**

### Phase 1 — Modules (after the crux clears)

- **[ODR-0006](./0006-agents-and-roles.md) — Agents & Roles.** Person/Organisation Kinds; Seller/Buyer RoleMixins; Proprietor Role + Proprietorship Relator; capacity-vs-evidenced-authority; FOAF-vs-`prov:Agent` open question.
- **[ODR-0007](./0007-transactions-and-lifecycle.md) — Transactions & Lifecycle.** Transaction relator, milestones, status; OWL-Time intervals.
- **[ODR-0008](./0008-property-descriptive-attributes.md) — Property descriptive attributes.** Built form, condition, valuation, EPC/energy, utilities, local-context searches, encumbrances/completion — the descriptive leaves hanging off Property/Title.

### Cross-cutting (drafted alongside, after ≥1 module exists)

- **[ODR-0009](./0009-claims-evidence-provenance.md) — Claims, Evidence & Provenance.** PROV-O backbone + assurance layer.
- **[ODR-0010](./0010-overlay-profile-mechanism.md) — Overlay Profile Mechanism.** SHACL profiles, `opda:ValidationContext`, `dct:source` traceability, DASH rendering.
- **[ODR-0011](./0011-enumeration-vocabularies.md) — Enumeration Vocabularies.** JSON enums → SKOS concept schemes.
- **[ODR-0012](./0012-data-governance-layer.md) — Data-Governance Layer.** DPV Phase-1 annotation (+ Pandit's recorded dissent), ODRL deferred.
- **[ODR-0013](./0013-shacl-validation-and-severity.md) — SHACL Validation & Severity.** Constraint mapping, severity tiering, DASH UI, annotation-graph separation.

### Amendment

- **[ODR-0014](./0014-vocabulary-catalogue-amendments.md) — Vocabulary catalogue amendments** (amends ODR-0002): OWL-Time IN, DCAT Conditional, SSSOM deferred, ODRL policies deferred; OBO RO / FOAF open.

## Dependency graph

```
                    ODR-0004 Foundation
                          │
                          ▼
              ODR-0005 Property identity CRUX ◀── diagnostic exemplars (Q1)
                          │  (GATE — must clear before Phase 1)
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ODR-0006          ODR-0007          ODR-0008
   Agents&Roles      Transactions      Property attrs
        └─────────────────┼─────────────────┘
                          ▼
   Cross-cutting (need ≥1 module):
   ODR-0009 Claims/Provenance · ODR-0010 Overlay profiles ·
   ODR-0011 Enumerations · ODR-0012 Data governance · ODR-0013 SHACL/severity

   ODR-0014 Vocabulary amendments — independent, can land immediately (amends ODR-0002)
```

## Minimum viable subset

Foundation (0004) → Property identity crux (0005, exemplar-gated) → Agents & Roles (0006) + Claims/Provenance (0009) → **one fully-worked BASPI5 SHACL profile** (0010). If that round-trips (JSON → profile → rendered form → validated provenance), the remaining overlays and modules are largely mechanical and scale after.

## Status discipline

This anchor is updated as work-package ODRs move Proposed → Accepted → Implemented. It is the single place to see programme state. Individual ODRs own their own analysis; this file owns the sequencing and the cross-links.
