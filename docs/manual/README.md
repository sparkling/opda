---
title: OPDA ontology — manual
status: generated
date: 2026-05-28
---

# OPDA ontology — manual

Four-tier presentation of the OPDA ontology model. Each tier targets a distinct audience and presents the same underlying data model at a different level of abstraction. The tiers are linked by stable per-entity URIs so a reader can traverse from business narrative to deployed Turtle without losing the thread.

This manual is generated from the 24 emitted TTL files at `source/03-standards/ontology/` per the information-architecture blueprint at [`docs/information-architecture/`](../information-architecture/). The blueprint specifies *how* each tier is laid out; this manual is the populated output.

## Tier index

| Tier | Audience | What it answers | Entry point | Files |
|---|---|---|---|---|
| **Concept** | Property-industry SMEs (surveyors, conveyancers, lenders, government data leads, regulators) | *"What does an OPDA Property mean, and why does Identity Criterion matter?"* — business-language narrative, hard cases, IC. No jargon. | [`concept/`](./concept/index.md) | 50 |
| **Logical** | Data engineers, solution architects, integration architects, technical product managers | *"What typed attributes does Property have, and how does it relate to Address, LegalEstate, Transaction?"* — ER diagrams, typed attribute tables, cardinalities. Platform-independent. | [`logical/`](./logical/index.md) | 81 |
| **Physical — deployment / database** | Triplestore operators, SPARQL consumers, ontology integrators, devops | *"Which named graph holds `opda:Property`, what derived consumer profiles include it, and how do I fetch it from `w3id.org/opda/Property`?"* — deployment topology, named-graph layout, content-negotiation, CI gates. | [`physical-database/`](./physical-database/index.md) | 15 |
| **Physical — ontology** | Ontology engineers, SHACL implementers, SPARQL consumers, regulators interpreting machine-readable artefacts | *"Which Turtle file emits `opda:Property`, what SHACL shapes constrain it, and what `dct:source` URIs trace its definition?"* — OWL / SHACL / SKOS / Turtle verbatim. | [`physical-ontology/`](./physical-ontology/index.md) | 74 |

**Total: 220 markdown files** across the four tiers, plus this index and [`VALIDATION-REPORT.md`](./VALIDATION-REPORT.md).

## How to navigate

- **Start by audience.** Pick the tier that matches your role from the table above. Each tier's `index.md` lists every entity + scheme + exemplar in that tier with one-line descriptions.
- **Follow an entity across tiers.** Every entity has a stable file path that mirrors across Concept + Logical + Physical-Ontology tiers: `<tier>/<module>/<entity>.md`. From any entity page, the cross-tier links at the bottom take you to its presentation in the other tiers.
- **Trace from URI back to docs.** Every `opda:<EntityName>` URI in the source TTLs carries a `dct:source` URI that resolves into the Concept tier — the canonical narrative for that entity.

## Module organisation

The ontology is organised into seven modules (foundation + six bounded contexts). The same module structure mirrors across all four tiers:

| Module | Scope | Source TTL |
|---|---|---|
| **Foundation** | DiagnosticExemplar, GeneratorRun, RoleMixin, Role, Relator, ValidationContext + the `opda:hasSpecialCategoryData` placeholder DatatypeProperty | `opda-classes.ttl` |
| **Property** | Property, LegalEstate, RegisteredTitle, Address, the events that change them | `opda-property.ttl` |
| **Agent** | Person, Organisation, Roles (Seller, Buyer, Proprietor, etc.) | `opda-agent.ttl` |
| **Transaction** | Transaction, Milestone, LeaseTerm, TransactionChain | `opda-transaction.ttl` |
| **Claim** | Claim, Evidence (Document / Electronic-Record / Vouch), VerificationActivity, AssuranceLevel, TrustFramework | `opda-claim.ttl` |
| **Governance** | DPV mapping tables (linking OPDA Kinds to UK GDPR personal-data categories per ODR-0018) | `opda-governance.ttl` |
| **Descriptive** | Survey, EPCCertificate, Search, Valuation, Comparable — descriptive attachments to a Property | `opda-descriptive.ttl` |

Plus 23 SKOS Concept Schemes in `opda-vocabularies.ttl` and the BASPI5 overlay profile at `profiles/baspi5.ttl`.

## Source of truth

This manual is **generated** from the source TTLs only — not authored by hand:

| Tier | Generated from |
|---|---|
| Concept | `opda-<module>.ttl` `rdfs:comment` ("IC:" + "Hard cases:" verbatim per A9 per-kind discipline; [ADR-0007](../adr/ADR-0007-ontology-generator-specification.md)) |
| Logical | `opda-<module>.ttl` + `opda-<module>-shapes.ttl` (cardinalities from `sh:minCount`/`sh:maxCount`) + `opda-vocabularies.ttl` |
| Physical — database | source TTLs' `owl:Ontology` headers (named graph IRIs) + composer plan + CI workflow YAML |
| Physical — ontology | the 24 TTLs verbatim + 15 exemplar pairs + 30 expected-report files |

The ODR corpus (`docs/ontology/odr/`) is **not** a content source — only a link target via `dct:source` URIs. The PDTF JSON Schemas (`source/03-standards/schemas/`) are upstream Council input and don't appear at all. See [`docs/information-architecture/README.md` §"Source of truth"](../information-architecture/README.md#source-of-truth-for-documentation-generation) for the full discipline.

## Provenance

- **IA blueprint:** [`docs/information-architecture/`](../information-architecture/) — accepted 2026-05-28
- **Generation date:** 2026-05-28
- **Ontology version:** `opda-gen-1.0.0` (programme retired 2026-05-28 per [ODR-0003 §"Programme retirement criterion"](../ontology/odr/ODR-0003-pdtf-ontology-programme.md))
- **Validation status:** PASS-WITH-FOLLOW-UPS (all 4 items closed inline at commit `b93deb2`); see [`VALIDATION-REPORT.md`](./VALIDATION-REPORT.md)
- **Worker commits:** `6328d03` (Concept) · `0c3619d` (Logical) · `fbf8d85` (Physical-DB) · `4c16c58` (Physical-Ontology) · `b93deb2` (remediation)

## Local HTML export

HTML renders of each tier are generated locally by `node ~/.claude/tools/markdown-export/convert.js docs/manual/**/*.md --format=html` and land under per-directory `export/html/` folders (gitignored — rebuild on demand). For PDF, add `--format=both` or `--format=pdf`.
