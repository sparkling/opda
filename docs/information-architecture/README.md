---
status: proposed
date: 2026-05-28
tags: [information-architecture, documentation, governance]
supersedes: []
depends-on: []
implements: []
---

# OPDA ontology-model documentation — information architecture

This directory specifies **how** OPDA's ontology model is documented. The ontology model itself (the 24 emitted TTL files at `source/03-standards/ontology/`, the 23 SKOS schemes, the 40 minted classes, the BASPI5 profile) lives elsewhere; the artefacts under this directory specify the *structure* of the docs that describe it.

## Four documentation outputs

OPDA's ontology model is documented as four tiers. Each tier has its own audience, its own conventions, and its own IA spec in this directory.

| Tier | Audience | What it shows | IA spec |
|---|---|---|---|
| **Concept** | Property-industry SMEs (surveyors, conveyancers, lenders, government data leads) | What each business object *means* and *why*; non-technical narrative + diagrams | [`concept-model-ia.md`](./concept-model-ia.md) |
| **Logical** | Data engineers, solution architects, integrators | Entity-relationship view: typed attributes + cardinalities + relationships, platform-independent | [`logical-model-ia.md`](./logical-model-ia.md) |
| **Physical — deployment / database** | Triplestore operators, SPARQL consumers, ontology integrators, devops | Named-graph layout, derived consumer profiles, content-negotiation, BASPI5 overlay composition, CI gates — the deployed/served form of the ontology at `w3id.org/opda/` | [`physical-database-ia.md`](./physical-database-ia.md) |
| **Physical — ontology** | Ontology engineers, SHACL implementers, SPARQL consumers, regulators | OWL/SHACL/SKOS Turtle layout: per-module classes, three-graph separation, severity tiers, SHACL-AF rules, overlay profiles | [`physical-ontology-ia.md`](./physical-ontology-ia.md) |

The four tiers are **linked but independent**. A reader of the Concept tier never needs to read Turtle; a reader of the Physical-Ontology tier should be able to trace any class back to the Concept-tier narrative via `dct:source` URIs.

## Why four tiers

OPDA's stakeholders span business and engineering audiences with overlapping but distinct needs:

- **Concept tier** answers *"what does an OPDA Property mean, and why does Identity-Criterion (IC) matter?"* — narrative-first, no jargon.
- **Logical tier** answers *"what attributes does a Property have, and how does it relate to Address, LegalEstate, Transaction?"* — schema-shape without commitment to RDF, JSON-LD, or any particular serialisation.
- **Physical-DB tier** answers *"which named graph holds `opda:Property`, what derived consumer profiles include it, and how do I fetch it from `w3id.org/opda/Property` via content negotiation?"* — deployment + serving navigation.
- **Physical-Ontology tier** answers *"which Turtle file emits `opda:Property`, what SHACL shapes constrain it, and what `dct:source` URIs trace its definition?"* — RDF / SHACL / SKOS specifics in source-tree form.

Skipping a tier produces predictable friction: SMEs reading Turtle, engineers reading marketing prose, devops guessing at named-graph layout from OWL declarations. The four tiers de-couple those audiences without losing traceability.

## Cross-tier traceability requirement

Every entity in every tier MUST carry a stable URI that resolves across all four tiers. The Physical-Ontology tier uses Turtle's `dct:source` URI; the Concept / Logical / Physical-DB tiers carry the equivalent URI in their own format conventions (per the per-tier IA specs).

Concretely: anyone reading the Concept-tier description of "Property" should be able to follow a URI to the Logical-tier entity row, then to the Physical-DB JSON path, then to the Physical-Ontology TTL block — without name collisions, without orphaned references.

The four IA specs each define how that URI surfaces in their tier.

## Source of truth for documentation generation

Every tier generates from **the emitted ontology** at `source/03-standards/ontology/` (the 24 TTLs + the 15 paired exemplars + the BASPI5 profile). The A9 per-kind discipline (per [ADR-0007 §"A9 per-kind discipline output"](../adr/ADR-0007-ontology-generator-specification.md)) was designed precisely so the TTL is self-sufficient: every `owl:Class` carries `rdfs:comment` (IC + hard cases verbatim) + `skos:scopeNote` (UFO/DOLCE citation) + `dct:source` (audit-trail pointer).

Two things explicitly **not** documentation sources:

- **The ODR corpus** (`docs/ontology/odr/`) — it is the Council deliberation audit trail. The ontology embeds the outcome via A9; the ODR explains why the Council ratified that outcome. Documentation generation uses `dct:source` URIs as *link targets only*, never as content sources.
- **The PDTF JSON Schemas** (`source/03-standards/schemas/`) — they were upstream input to the Council programme, not output to be documented in the 4-tier scheme. They have their own documentation in the nested schemas repo.

## Governance

This IA spec governs the **documentation** of OPDA's ontology model, not the ontology model itself. The model is governed by the ontology-implementation programme:

- [ADR-0007 — Ontology generator specification](../adr/ADR-0007-ontology-generator-specification.md)
- [ADR-0008 through ADR-0014](../adr/) — the 7-ADR implementation programme that emitted the current ontology
- [ODR-0001 — Linked Data Council methodology](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — governs modelling decisions
- [ODR-0011 — Enumeration vocabularies](../ontology/odr/ODR-0011-enumeration-vocabularies.md) — 7-category UFO meta-vocabulary that the Concept + Logical tiers must surface

When this IA spec lands as accepted, the per-tier docs themselves become the next deliverable: the IA tells *how* the generator should emit them; the generator extension is a small `docs-gen` mode on top of `opda-gen`, not a separate authoring workstream.

## File inventory

```
docs/information-architecture/
├── README.md                       This file
├── concept-model-ia.md             Concept-tier IA spec
├── logical-model-ia.md             Logical-tier IA spec
├── physical-database-ia.md         Physical (JSON/database) tier IA spec
└── physical-ontology-ia.md         Physical (ontology) tier IA spec
```

## Provenance

Authored 2026-05-28 in OPDA's namespace and Council idiom. The four-tier pattern is a common documentation convention in industrial data-modelling practice; the IA specs here are OPDA-native and reference only OPDA's accepted ADRs / ratified ODRs.
