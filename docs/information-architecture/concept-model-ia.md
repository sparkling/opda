---
status: proposed
date: 2026-05-28
tags: [information-architecture, concept-model, documentation]
supersedes: []
depends-on: []
implements: []
---

# IA spec — Concept-tier presentation

This document specifies how the **Concept-tier presentation** of OPDA's ontology model is laid out. It is a *blueprint*: the actual Concept-tier docs that follow this spec are a separate deliverable.

## Audience

Property-industry SMEs: surveyors, conveyancers, lenders, estate agents, government data leads, regulators, Council members evaluating modelling proposals. Fluent in property transactions; may not be technical; never needs to read Turtle or JSON to use this tier.

## Purpose

Explain **what each business object means** and **why it is identified the way it is**. Identity Criterion (IC) is the load-bearing concept and must surface in business language without losing rigour.

## File layout

```
docs/manual/concept/
├── README.md                       Tier overview + reading order + module catalogue + entity index
├── <module>/
│   ├── README.md                   Module-level narrative + entity list
│   └── <entity>.md                 One file per Concept entity
└── diagrams/
    └── <topic>.mmd                 Mermaid source for tier-specific diagrams
```

- One file per Concept entity (no multi-entity files; per-entity URIs are stable anchors for cross-tier traceability).
- Module subdirectories mirror OPDA's six modules per [ADR-0011 §"Per-module detail"](../adr/ADR-0011-module-tbox-emission.md): `property/`, `agent/`, `transaction/`, `claim/`, `governance/`, `descriptive/`. Foundation entities (RoleMixin, Role, Relator, ValidationContext, DiagnosticExemplar, GeneratorRun, hasSpecialCategoryData) live under `foundation/`.

## Per-entity section shape (mandatory)

Every entity file is structured as follows. Section order is fixed; section presence is mandatory; section content depth varies by entity importance.

1. **`# <Entity name>`** — H1, in business language (e.g. `# Property`, not `# opda:Property`).
2. **One-sentence definition** — plain English; no UFO / DOLCE / Substance Kind vocabulary.
3. **`## Why it matters`** — what this entity is for; which audience needs it.
4. **`## Hard cases`** — 2–5 named hard cases the Identity Criterion must handle. Hard cases are where naive intuition breaks; they earn the IC its keep. List with bold name + one-sentence explanation each.
5. **`## Identity Criterion`** — what makes two records refer to the same entity instance. Stated in business language; cross-references the Logical tier for typed details via `[Logical tier →](../logical/<module>/<entity>.md)`.
6. **`## Related Kinds`** — bullet list of entities elsewhere in the model that this one connects to. Each bullet links to the related entity's Concept-tier file.
7. **`## Source ODR`** — link to the ratifying Council session ODR file in `docs/ontology/odr/`. Provides traceability back to the modelling decision.

Optional sections (where they help):
- **`## Cross-tier links`** — explicit links to the Logical, Physical-DB, and Physical-Ontology presentations of the same entity. If omitted, those links are derived from the entity's URI per the cross-tier traceability convention below.

## Diagram conventions

- Mermaid `flowchart` or `graph` only. Never UML class diagrams (those live in the Logical tier).
- Diagrams illustrate **lifecycle** or **relationships**, not types or cardinalities.
- Diagram source under `docs/manual/concept/diagrams/<topic>.mmd`; embedded via `{% include 'diagrams/<topic>.mmd' %}` or equivalent for the chosen renderer. Per project convention, Mermaid renders client-side via Astro; no PNG export step.

## Voice and style

- Second-person where it helps; otherwise neutral business prose.
- No jargon that hasn't been introduced. UFO / DOLCE / RoleMixin / Substance Kind are explicitly **out of scope** at this tier; if a concept needs them to explain, the explanation belongs in the Logical tier with a forward-link from here.
- Hard cases are named (e.g. "demolition", "subdivision", "first-registration"), not described abstractly. The named-hard-case discipline mirrors [ODR-0001 §"What an ODR records"](../ontology/odr/ODR-0001-linked-data-council-methodology.md).

## Cross-tier traceability

Every entity has a stable URI in OPDA's ontology namespace (`https://opda.org.uk/pdtf/<EntityLocalName>`). The Concept-tier file's location encodes that URI:

- URL: `/docs/manual/concept/<module>/<entity>.md`
- Anchor pattern: `#<entity-name-lowercase>` (the H1 anchor)
- Logical tier resolves URI → `/docs/manual/logical/<module>/<entity>.md`
- Physical-DB tier resolves URI → JSON path table
- Physical-Ontology tier's `dct:source` URI points at the Concept-tier anchor

The Concept tier is the **canonical narrative**; the other tiers cite it via this URI mapping. When the ontology emits a Class with `dct:source <https://openpropdata.org.uk/manual/concept/property/property#property>`, the URL must resolve to the Concept-tier entity file's H1.

**Scope clarification: Kinds, not Schemes.** The Concept tier publishes per-Kind narrative pages (one file per `owl:Class`) and intentionally does NOT publish per-scheme pages. SKOS schemes are documented at the Logical tier (one file per scheme under `logical/<module>/enumerations/<scheme>.md`) and at the Physical-Ontology tier (one file per scheme under `physical-ontology/vocabularies/<scheme>.md`). The Concept tier narrates a scheme's *meaning* indirectly through the using-entity's `## Hard cases` and `## Identity Criterion` discussion — never via a per-scheme file.

## Out of scope for this tier

- Typed attributes and cardinalities — see [`logical-model-ia.md`](./logical-model-ia.md).
- Deployment topology, named-graph layout, derived consumer profiles, content negotiation — see [`physical-database-ia.md`](./physical-database-ia.md).
- OWL classes, SHACL shapes, SKOS schemes, Turtle syntax — see [`physical-ontology-ia.md`](./physical-ontology-ia.md).

## Worked-template excerpt (one entity, schematic)

Used by content authors to bootstrap a Concept file. NOT to be checked in as actual content; replace with real OPDA prose at generation time.

```markdown
# <EntityName>

<One-sentence plain-English definition.>

## Why it matters

<What this entity is for; which audience cares.>

## Hard cases

- **<case name>.** <One-sentence explanation of why naive intuition breaks.>
- **<case name>.** <…>

## Identity Criterion

<Business-language statement of what makes two records the same entity instance.
Cross-link to logical tier for typed details: [Logical tier →](../logical/<module>/<entity>.md).>

## Related Kinds

- [<RelatedEntity>](./<related-entity>.md) — <one-line relationship summary>
- …

## Source ODR

[ODR-NNNN — <Title>](../../../docs/ontology/odr/ODR-NNNN-<slug>.md), Council Session NNN.
```

## Generation discipline

Concept-tier files generate mechanically from the source TTLs. The A9 per-kind discipline (per [ADR-0007 §"A9 per-kind discipline output"](../adr/ADR-0007-ontology-generator-specification.md)) was designed so each emitted class carries everything this tier needs:

| Concept-tier section | Source in `opda-<module>.ttl` |
|---|---|
| H1 entity name | `rdfs:label @en` |
| One-sentence definition | first sentence of `rdfs:comment @en` |
| Hard cases | "Hard cases:" enumeration within `rdfs:comment @en` |
| Identity Criterion | "IC:" clause within `rdfs:comment @en` |
| Related Kinds | derived from `rdfs:domain` / `rdfs:range` triples + foreign-key `opda:ObjectProperty` references |
| Source ODR link | `dct:source` URI (resolves to the ratifying ODR anchor; used as a link target only — the ODR text itself is **not** read) |
| UFO category context (footnote-only) | `skos:scopeNote @en` |

The generator walks each `opda-<module>.ttl`, paraphrases the `rdfs:comment` from technical voice into business voice (the only manual review step), and emits one Markdown file per `owl:Class`. **The ODR corpus is not a source** — it is the audit trail behind the modelling decisions; the TTL embeds the outcome via A9. The PDTF JSON Schemas are upstream Council input, not a source for documentation.
