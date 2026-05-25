---
status: proposed
date: 2026-05-20
tags: [programme, anchor, pdtf]
supersedes: []
depends-on: [ONT-0001, ONT-0002]
implements: []
---

# PDTF to Ontology: Programme and Work Breakdown (Anchor)

## Context and Problem Statement

This is the **anchor** for converting the Property Data Trust Framework v3 JSON Schema into a linked-data ontology. It records the programme-level decisions from Council Session 001, sequences the work, and links every work-package ODR. It is **planning only** — each linked ODR is a stub to be fleshed out in its own follow-up session. No ontology is authored here.

The conversion problem is not a mechanical Schema-to-RDF rewrite. The web-app schema section already names the load-bearing defect (the implicit Property entity, page 37): UPRN appears in four leaf paths, address in many, an INSPIRE ID and a title-linked address besides, with zero schema-level joins between them — a missing class with no identity criterion. JSON Schema gives slot-names, not global identifiers, so the genuine modelling question is *which things get URIs*. The mechanical half (named slot → `DatatypeProperty` with `xsd:` range) is generated; Council cycles are reserved for the ambiguous moves (aggregate boundaries, cross-overlay synonymy, `oneOf`-as-subclass-vs-state).

**What is being converted.** The ontology is built from the following inputs:

- **`pdtf-transaction.json`** (37,224 lines, JSON Schema Draft-07) — the base residential-property-transaction model for England & Wales, plus the `verifiedClaims` OIDC4IDA/eIDAS envelope and 10+ deep-merge form overlays (BASPI, TA6/7/10, NTS, LPE1, CON29R/DW, LLC1, FME1).
- **The web-app schema section** (`src/pages/schema/*.astro`, `source/_content/schema/*.md`) — 11 pages, 3,561 leaves walked, 15 overlays cross-referenced, which already names the implicit-Property defect (page 37).
- **The PDTF business glossary** (`source/00-deliverables/semantic-models/business-glossary.md`) — the authoritative term definitions. It merges the OPDA working glossary (54 trust-framework / open-banking terms: `Participant`, `Role`, `Scheme Operator`, `Data Provider`, `Data Recipient`, `TPP`, `Trust Framework`, …), the schema's own `title`/`description` annotations, and the external-standard terms PDTF v2 inherits (W3C VC, DID Core, ToIP). It supplies the authoritative definitions that become `rdfs:label` / `skos:prefLabel` and `skos:definition` on the ontology's classes and concept-scheme members.
- **The PDTF data dictionary** (`source/00-deliverables/semantic-models/data-dictionary.md`) — the leaf inventory. Generated 2026-05-14 from the canonical v3 schemas (16 schemas, `combined.json`/`skeleton.json`/older overlay versions excluded): **1,557 unique leaf property names** across 8,458 path entries; **935 of the base schema's 1,556 leaves carry semantic annotation**; 389 leaf names recur in 3+ schemas (the cross-context vocabulary), 754 are context-specific. It also records the per-form leaf counts that scope each module's surface — `baspi5` 318, `rds` 196, `piq` 184, `ta6` 178, `nts2` 160, `lpe1` 136, `con29R` 125, `ntsl2` 124, `ta7` 98, `ta10` 90, `fme1` 78, `oc1` 68, `con29DW` 34, `sr24` 7, `llc1` 3 — and the enumerations (e.g. the `role` enum on `baspi5.json`: Buyer, Seller's Conveyancer, Prospective Buyer, Buyer's Conveyancer, Estate Agent, Buyer's Agent…) that become SKOS concept schemes.

The glossary and the data dictionary are therefore first-class ontology inputs alongside the schema and the web-app section: the glossary supplies authoritative term definitions (→ labels / SKOS definitions), the data dictionary supplies the leaf inventory and enum members. The term-sourcing convention — how each label and definition carries `dct:source` back to its glossary row or schema leaf path — is defined by [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md), not here.

The convening constraints for Session 001 were: data model only (TBox; no instance-data deliverable); a vocabulary floor of Core + DASH + PROV-O + the data-governance family; BBO and other non-relevant Conditional vocabularies excluded; output a set of work-partitioning ODRs plus this anchor.

## Decision Drivers

* **Re-express, don't replicate** — PDTF v3 is a *requirements artefact*, not a translation target (Kendall). Replicating its defects (Participant-as-class, implicit Property) defeats the purpose.
* **Generator-first** — the mechanical slot→property half is generated, conserving Council deliberation for genuinely ambiguous moves (Allemang).
* **Identity before everything** — nothing downstream is sound until the Property identity criterion is settled (Guarino, Allemang); the crux gates the programme.
* **Time-box and publish** — most of what looks ontological is a missing URL; fix a small set of blocking conceptual defects and publish (Davis).
* **Spike-then-scale** — prove one vertical slice end-to-end before committing to a 15-ODR programme up front (Guarino's strongest Q7 point).

## Considered Options

The programme-shaping question that was genuinely contested is **how to partition the work** (Session 001 Q3):

* **Partition by aggregate page** — mirror the JSON tree and the web-app's 11 schema pages, one module per aggregate. This was option A of the convening brief and the basis of the earlier placeholder ODR stubs.
* **Partition by ontological concern** (chosen) — FIBO-style modules (Agents & Roles / Property & Land / Transactions & Lifecycle / Claims & Evidence & Provenance) reconciled with Guizzardi's UFO Kind / Role / Relator layering, so reused entities (Address) are declared once; Evidence and VerifiedClaims promoted to cross-cutting relations; the OWL class-graph kept separate from the SHACL shapes-graph; a flat published namespace with editorial-only modules.
* **Partition by UFO meta-category alone** — Substance Kinds / Roles & Phases / Relators & Claims (Guizzardi). Subsumed into the chosen option as its layering axis rather than adopted as the sole cut.

## Decision Outcome

Chosen option: **partition by ontological concern**, because mirroring the JSON tree or the web-app pages encodes form ergonomics, not ontological cohesion (Cagle: "that nesting is form ergonomics, not ontology — flatten it"; Guarino: the pages are good didactics grouped by lifecycle and authority, not ontological modules, and Evidence/VerifiedClaims are cross-cutting relations). The chosen partition reconciles Kendall's FIBO concern-modules with Guizzardi's Kind/Role/Relator layering, promotes Evidence + Claims (and Enumerations, Governance, Validation) to cross-cutting status, separates the OWL class-graph from the SHACL shapes-graph (Gandon/Knublauch: open-world and closed-world must not leak), and keeps a flat published namespace with modules as editorial groupings only (Davis: do not put modules in the URLs). **This supersedes the by-aggregate-page breakdown of the earlier placeholder stubs.**

The programme also adopts the following Session 001 decisions, which together constitute the programme's "decision" as an anchor record:

| Q | Decision | Detail |
|---|---|---|
| Q1 | Genuine modelling, generator-assisted | Mechanical slot→property translation is generated; Council time reserved for ambiguous moves. **Diagnostic exemplars admitted** to test identity criteria (non-deliverable — the TBox/ABox split is a deliverable boundary, not a thinking boundary). |
| Q2 | Vocabulary set | Core + DASH + PROV-O (mandatory in claims/milestone layers) + DPV Phase-1 + **OWL-Time (Conditional, newly adopted)** + DCAT (Conditional). ODRL adopted but policy-authoring deferred. SSSOM deferred. BBO/ArchiMate out. → [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md) amends [ONT-0002](./ONT-0002-ontology-language-adoption.md). |
| Q3 | **Partition by ontological concern, NOT by aggregate page** | FIBO-module × UFO-layer reconciliation; Evidence/Claims/Enums/Governance/Validation cross-cutting; OWL class-graph separated from SHACL shapes-graph; flat published namespace, modules editorial-only. |
| Q4 | Property defect → multi-class split; **identity criterion is the gating crux** | Physical Property distinct from the legal/registered thing; SHACL/DASH uniqueness as the primary checkable key; no `owl:sameAs`; Endurant commitment + ICs over hard cases deferred to [ONT-0005](./ONT-0005-property-land-identity-crux.md), exemplar-validated. |
| Q5 | Overlays → SHACL profiles | Reified as `opda:ValidationContext`; composition is a documented build-step graph-union; `dct:source` form-traceability; no overlay overrides identity. → [ONT-0010](./ONT-0010-overlay-profile-mechanism.md). |
| Q6 | verifiedClaims → PROV-O + assurance layer | PROV-O backbone (~80%); eIDAS envelope (trust framework, validation/verification split, crypto digests, assurance level) in a separate `opda:assuranceLevel` / `dct:` / local layer. → [ONT-0009](./ONT-0009-claims-evidence-provenance.md). |
| Q7 | **Spike-then-scale** | URI policy first; identity crux gates everything; prove one BASPI5 vertical slice end-to-end before scaling overlays. |

Sequencing follows Q7: a Foundation/URI-policy spike, then the identity crux (exemplar-gated), then the first modules and the PROV-O claims slice, then one fully-worked BASPI5 SHACL profile. Everything else scales after the crux survives contact with the exemplars. Full positions and vote tallies (with recorded dissents and DA withdrawals) are in the [session transcript](./council/session-001-pdtf-schema-to-ontology.md) and `council/working/`.

### Consequences

* Good, because partitioning by ontological concern declares reused entities (Address, Name, Person, Organisation) once instead of duplicating them per aggregate page, and isolates open-world class semantics from closed-world shape validation.
* Good, because promoting Evidence/Claims/Enumerations/Governance/Validation to cross-cutting status models them as the relations they are, rather than forcing them into module silos.
* Good, because the flat published namespace keeps module structure editorial, so re-grouping concepts later does not break dereferenceable URIs.
* Good, because spike-then-scale front-loads the genuinely hard constructs (identity criteria, `sh:xone`, capacity, DASH editors, `dct:source`) into a single proven vertical slice before the largely-mechanical overlay scale-out.
* Bad, because the identity crux ([ONT-0005](./ONT-0005-property-land-identity-crux.md)) is a hard gate: the module ODRs (0006–0008) cannot be drafted in anger until it clears its exemplar test, so the programme has a single-point dependency early.
* Bad, because the by-aggregate-page placeholder stubs are superseded, and any work already premised on them must be re-cut to the concern partition.
* Neutral, because module boundaries are an editorial convenience; concepts may be regrouped without semantic consequence as understanding matures.
* Neutral, because this anchor records sequencing and cross-links only — each linked ODR owns its own analysis and will record its own consequences when fleshed out.

### Confirmation

The programme's gate is verified by an end-to-end round-trip on a single vertical slice, not by per-ODR sign-off:

- **The identity crux must clear first.** [ONT-0005](./ONT-0005-property-land-identity-crux.md) must (i) commit each property/title entity to a DOLCE category (Endurant), (ii) state an identity criterion over the hard cases (demolition / subdivision / merger / first-registration), and (iii) settle UPRN's status (checkable SHACL/DASH key vs contingent administrative identifier) — all **validated against the diagnostic exemplars** (registered freehold house; unregistered house pre-first-registration; flat whose UPRN was split). No module ODR (0006–0008) is drafted in anger until this clears.
- **MVP round-trip gate.** The minimum-viable subset round-trips one BASPI5 profile: `pdtf-transaction.json` → loaded SHACL profile → rendered BASPI form (via DASH) → validated provenance (PROV-O claims slice). If that round-trips with full `dct:source` traceability, the remaining overlays and modules are largely mechanical and scale after.

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).

**Work breakdown.**

*Phase 0 — Spike (gates the programme):*

- **[ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) — Foundation.** URI/namespace strategy (single `opda:` hash namespace), ontology-header pattern, OWL-graph ⊥ SHACL-graph separation, generator-first policy, diagnostic-exemplar policy, and the term-sourcing / `dct:source` convention drawing on the business glossary and data dictionary.
- **[ONT-0005](./ONT-0005-property-land-identity-crux.md) — Property & Land identity crux.** *The gate.* Class split, DOLCE Endurant commitment, identity criteria over demolition/subdivision/merger/first-registration, UPRN key-vs-contingent-identifier resolution — validated against diagnostic exemplars. **No module ODR is drafted in anger until this clears.**

*Phase 1 — Modules (after the crux clears):*

- **[ONT-0006](./ONT-0006-agents-and-roles.md) — Agents & Roles.** Person/Organisation Kinds; Seller/Buyer RoleMixins; Proprietor Role + Proprietorship Relator; capacity-vs-evidenced-authority; FOAF ruled out (Kind-layer vocabulary now W3C Org vs bespoke `opda:`).
- **[ONT-0007](./ONT-0007-transactions-and-lifecycle.md) — Transactions & Lifecycle.** Transaction relator, milestones, status; OWL-Time intervals.
- **[ONT-0008](./ONT-0008-property-descriptive-attributes.md) — Property descriptive attributes.** Built form, condition, valuation, EPC/energy, utilities, local-context searches, encumbrances/completion — the descriptive leaves hanging off Property/Title.

*Cross-cutting (drafted alongside, after ≥1 module exists):*

- **[ONT-0009](./ONT-0009-claims-evidence-provenance.md) — Claims, Evidence & Provenance.** PROV-O backbone + assurance layer.
- **[ONT-0010](./ONT-0010-overlay-profile-mechanism.md) — Overlay Profile Mechanism.** SHACL profiles, `opda:ValidationContext`, `dct:source` traceability, DASH rendering.
- **[ONT-0011](./ONT-0011-enumeration-vocabularies.md) — Enumeration Vocabularies.** JSON enums → SKOS concept schemes.
- **[ONT-0012](./ONT-0012-data-governance-layer.md) — Data-Governance Layer.** DPV Phase-1 annotation (+ Pandit's recorded dissent), ODRL deferred.
- **[ONT-0013](./ONT-0013-shacl-validation-and-severity.md) — SHACL Validation & Severity.** Constraint mapping, severity tiering, DASH UI, annotation-graph separation.

*Amendment:*

- **[ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md) — Vocabulary catalogue amendments** (amends [ONT-0002](./ONT-0002-ontology-language-adoption.md)): OWL-Time IN, DCAT Conditional, SSSOM deferred, ODRL policies deferred; OBO RO open, FOAF ruled out.

**Dependency graph.**

```
                    ONT-0004 Foundation
                          │
                          ▼
              ONT-0005 Property identity CRUX ◀── diagnostic exemplars (Q1)
                          │  (GATE — must clear before Phase 1)
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ONT-0006          ONT-0007          ONT-0008
   Agents&Roles      Transactions      Property attrs
        └─────────────────┼─────────────────┘
                          ▼
   Cross-cutting (need ≥1 module):
   ONT-0009 Claims/Provenance · ONT-0010 Overlay profiles ·
   ONT-0011 Enumerations · ONT-0012 Data governance · ONT-0013 SHACL/severity

   ONT-0014 Vocabulary amendments — independent, can land immediately (amends ONT-0002)
```

**Minimum viable subset.** Foundation (0004) → Property identity crux (0005, exemplar-gated) → Agents & Roles (0006) + Claims/Provenance (0009) → **one fully-worked BASPI5 SHACL profile** (0010). If that round-trips (JSON → profile → rendered form → validated provenance), the remaining overlays and modules are largely mechanical and scale after. The intra-MVP ordering places the PROV-O claims/assurance backbone before the profile scale-out (Gandon: provenance is foundational to a *trust* framework and higher integrity-risk than a form overlay).

**Status discipline.** This anchor is updated as work-package ODRs move proposed → accepted → implemented. It is the single place to see programme state. Individual ODRs own their own analysis; this file owns the sequencing and the cross-links.

**Related.** Council methodology [ONT-0001](./ONT-0001-linked-data-council-methodology.md); vocabulary catalogue [ONT-0002](./ONT-0002-ontology-language-adoption.md); deliberation provenance [session-001](./council/session-001-pdtf-schema-to-ontology.md).

## Vote and Dissent

The programme decisions inherit Council Session 001's per-question verdicts. The full transcript, per-expert positions, and tallies live in [session-001](./council/session-001-pdtf-schema-to-ontology.md); this is the compact summary.

- **Q1 (genuine modelling)** — 11-0-1 → consensus after amendment. Guarino dissented ("data model only, no instance data" is a category error — an identity criterion is untestable without exemplars), then **withdrew** once diagnostic exemplars were admitted.
- **Q3 (partition)** — consensus against the by-aggregate-page partition; partition by ontological concern, with the module-vs-flat-URL sub-divergence resolved as editorial-modules / flat-URLs.
- **Q4 (identity crux)** — diagnosis 12-0; the cure converges on a multi-class split but the identity-criterion question is **explicitly deferred, not closed** — it becomes [ONT-0005](./ONT-0005-property-land-identity-crux.md)'s gating requirement, on which Guarino's withdrawal is conditional.

**Devil's-Advocate scorecard (Guarino).** Guarino voted DISAGREE on all seven questions with named withdrawal conditions — a 0/7 starting scorecard by design:

- **Withdrawn** on Q1 (diagnostic exemplars admitted), Q5 (profile reified as `opda:ValidationContext`), and Q6 (assurance layer separated from PROV-O).
- **Held / deferred-to-crux** on Q4 — the identity-criterion condition is now [ONT-0005](./ONT-0005-property-land-identity-crux.md)'s gating requirement, and Guarino withdraws *iff* it commits each entity to a DOLCE category, states ICs over the hard cases, and settles UPRN's status, all exemplar-validated.
- **Substantially conceded by the panel** on Q2 (the ODRL "TBox-alone-asserts-nothing" contradiction → policies deferred; the OWL-Time exclusion → reversed) and Q3 (Evidence/Claims → cross-cutting).
- **Q7** spike-then-scale adopted, echoing Guarino's strongest Q7 point.

Six of seven objections were converted into amendments that strengthened the proposal — the Devil's-Advocate role functioning as designed, not theatre.
