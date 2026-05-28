---
status: proposed
date: 2026-05-28
tags: [information-architecture, logical-model, documentation]
supersedes: []
depends-on: []
implements: []
---

# IA spec — Logical-tier presentation

This document specifies how the **Logical-tier presentation** of OPDA's ontology model is laid out. It is a *blueprint*: the actual Logical-tier docs that follow this spec are a separate deliverable.

## Audience

Data engineers, solution architects, integration architects, technical product managers. Comfortable with entity-relationship modelling; reads UML or Mermaid ER diagrams fluently; does not need (and does not want) RDF / SHACL / SKOS syntax at this tier.

## Purpose

Show the **entity-relationship structure** of OPDA's data model in platform-independent form: typed attributes with cardinalities, named relationships with cardinality, identity keys, enumeration constraints, derivation rules — without committing to RDF, JSON, or SQL. Reader should be able to evaluate the model's shape and dependencies before deciding which physical encoding to consume.

## File layout

```
docs/manual/logical/
├── README.md                       Tier overview + reading order
├── index.md                        Module catalogue + entity index + master ER diagram
├── <module>/
│   ├── README.md                   Module-level entity inventory + module ER diagram
│   ├── <entity>.md                 One file per Logical entity
│   └── enumerations/
│       └── <scheme>.md             One file per SKOS scheme (Logical view)
└── diagrams/
    ├── master-er.mmd               Cross-module ER diagram
    └── <module>-er.mmd             Per-module ER diagrams
```

- One file per Logical entity, mirroring Concept-tier layout for traceability.
- Enumerations split out into their own subdirectory because they're typed attributes' value sets and warrant separate treatment.

## Per-entity section shape (mandatory)

1. **`# <Entity name>`** — H1 matches the Concept-tier file name exactly.
2. **`## Summary`** — one paragraph linking back to Concept (`[Concept tier →](../../concept/<module>/<entity>.md)`); names the UFO Kind in technical brackets (e.g. "Substance Kind; held UFO meta-category"). Logical tier may use the 7-category UFO vocabulary; Concept tier may not.
3. **`## Attributes`** — typed table:

   | Attribute | Type | Cardinality | Required | Identity-bearing | Description |
   |---|---|---|---|---|---|
   | `<name>` | `<type>` | `<lo>..<hi>` | Y/N | Y/N | <one-line> |

   - `Type` is platform-independent: `string`, `integer`, `boolean`, `date`, `dateTime`, `decimal`, `uri`, `EnumScheme:<SchemeName>`, `Ref:<EntityName>`. No `xsd:` prefixes; no SQL types; no `sh:datatype`.
   - `Cardinality` uses `0..1`, `1..1`, `0..*`, `1..*`.
   - `Required` is Y when cardinality lower bound is 1.
   - `Identity-bearing` is Y when the attribute participates in the Identity Criterion (the Logical-tier rendering of the Concept-tier IC).
4. **`## Relationships`** — typed table:

   | Predicate | Target entity | Cardinality | Inverse | Description |
   |---|---|---|---|---|
   | `<predicate-name>` | `<EntityName>` | `<lo>..<hi>` | `<inverse-predicate>` | <one-line> |

   - Predicate names are Logical-tier names; the Physical-Ontology tier may pick different URIs.
   - `Inverse` is the named inverse relationship if any (empty otherwise).
5. **`## Identity key`** — the typed shape of the entity's Identity Criterion. Names the attributes / relationships that, together, identify a unique instance. Cross-references the Concept tier IC narrative.
6. **`## Constraints`** — non-cardinality business rules: value-range bounds, format patterns, mutually-exclusive attribute groups, conditional cardinalities. One bullet per constraint; cross-references the SHACL severity tier (`Violation` / `Warning` / `Info`) where applicable so the Physical-Ontology tier knows what to emit.
7. **`## Derived attributes`** — attributes computed from other attributes via a rule (SHACL-AF in the Physical-Ontology tier). Table:

   | Attribute | Derived from | Rule summary | Severity |
   |---|---|---|---|
   | `<name>` | `<source attrs/rels>` | <one-line> | `Info` / `Warning` |
8. **`## ER diagram`** — Mermaid `erDiagram` block showing the entity + its directly-related entities + cardinalities. Per-module ER diagrams live in `docs/manual/logical/diagrams/<module>-er.mmd` and may be referenced rather than inlined.
9. **`## Source ODR + ADR`** — links to the ratifying ODR and any implementation ADR (typically ADR-0011 for module entities).

## Per-enumeration section shape (mandatory)

1. **`# <SchemeName>`** — H1.
2. **`## Summary`** — one paragraph; links to Concept (`[Concept tier →]`); names the UFO meta-category (one of the 7 per [ODR-0011 §8a](../ontology/odr/ODR-0011-enumeration-vocabularies.md)).
3. **`## Members`** — table:

   | Notation | Label | Definition | Source |
   |---|---|---|---|
   | `<notation>` | `<prefLabel>` | <definition> | <`dct:source` IRI or "this scheme" if internal> |
4. **`## Cardinality discipline`** — links to `## Constraints` of any entity that binds an attribute to this scheme. Open/closed flag (whether overlays may subset or extend).
5. **`## Source ODR + ADR`** — typically ADR-0010 + the scheme's per-scheme ODR if any.

## Diagram conventions

- Mermaid `erDiagram` only at this tier — no plain `flowchart` (those belong in the Concept tier) and no UML class diagrams (over-specified for the audience).
- Master ER diagram at `docs/manual/logical/diagrams/master-er.mmd` shows all cross-module relationships at a glance.
- Per-module ER diagrams at `docs/manual/logical/diagrams/<module>-er.mmd` show within-module relationships in depth.
- Diagram entities use Logical-tier names; predicate labels use Logical-tier predicate names.

## Voice and style

- Technical but platform-independent. UFO category names are allowed and encouraged (they earn the reader's trust); UFO is *not* introduced or explained at this tier (that's `docs/manual/concept/foundation/ufo-categories.md`).
- Tables over prose where structure permits. Bullet lists for constraints. Mermaid for relationships.
- Active voice for relationships ("Property has Address", not "Address is had by Property"); inverse relationships listed in the inverse column.
- No code samples. No JSON snippets. No Turtle snippets. Cross-link to the relevant Physical tier for those.

## Cross-tier traceability

- File-path mapping: `<concept-tier>/property/property.md` ↔ `<logical-tier>/property/property.md`. Same `<module>/<entity>.md` shape across tiers.
- Per-attribute mapping: every Logical-tier attribute row must be traceable to a Physical-Ontology tier `owl:DatatypeProperty` or `owl:ObjectProperty` (the Physical-Ontology tier provides the URI). The reverse (every TBox property has a Logical attribute) is also enforced.
- Per-relationship mapping: every Logical-tier predicate name maps to one `owl:ObjectProperty` URI in the Physical-Ontology tier.
- Per-enumeration mapping: every Logical-tier scheme maps to one `skos:ConceptScheme` URI in the Physical-Ontology tier; every member row maps to one `skos:Concept` URI.
- Cross-tier consistency CI: a planned tool walks the four tiers and asserts the mappings are 1:1 (with explicit `out-of-scope` annotations for entities that exist in one tier but not another).

## Out of scope for this tier

- Business-language narrative — see [`concept-model-ia.md`](./concept-model-ia.md).
- JSON paths, BASPI5 overlay bindings, wire-format field names — see [`physical-database-ia.md`](./physical-database-ia.md).
- OWL / SHACL / SKOS / Turtle syntax — see [`physical-ontology-ia.md`](./physical-ontology-ia.md).

## Worked-template excerpt (one entity, schematic)

```markdown
# <EntityName>

## Summary

<One paragraph linking to Concept tier and naming the UFO meta-category in
technical brackets. Example: "[Concept tier →](../../concept/<module>/<entity>.md).
UFO Substance Kind; persists through changes to its content via succession
events.">

## Attributes

| Attribute | Type | Cardinality | Required | Identity-bearing | Description |
|---|---|---|---|---|---|
| `<name>` | `string` | `0..1` | N | N | <…> |
| `<name>` | `EnumScheme:<Scheme>` | `1..1` | Y | N | <…> |

## Relationships

| Predicate | Target entity | Cardinality | Inverse | Description |
|---|---|---|---|---|
| `<predicate>` | `<TargetEntity>` | `0..*` | `<inverse>` | <…> |

## Identity key

<Typed shape of the IC: e.g. "Identity key = `<attr-A>` + `<rel-B>`. Stability through
<events> via PROV-O lifecycle reification.">

## Constraints

- <constraint, severity tier in brackets>
- …

## Derived attributes

| Attribute | Derived from | Rule summary | Severity |
|---|---|---|---|
| `<name>` | `<source>` | <…> | `Info` |

## ER diagram

```mermaid
erDiagram
    <EntityName> ||--o{ <RelatedA> : "<predicate>"
    <EntityName> }o--|| <RelatedB> : "<predicate>"
```

## Source ODR + ADR

- [ODR-NNNN — <Title>](../../../docs/ontology/odr/ODR-NNNN-<slug>.md), Council Session NNN
- [ADR-0011 — Module TBox emission](../../../docs/adr/ADR-0011-module-tbox-emission.md) — implementation
```

## Generation discipline

Logical-tier files generate from:

- `docs/ontology/odr/*.md` — for entity inventory, ICs, hard cases (cross-checked against Concept-tier files)
- `source/03-standards/ontology/opda-<module>.ttl` — for the canonical attribute set (each `owl:DatatypeProperty` / `owl:ObjectProperty` becomes one row)
- `source/03-standards/ontology/opda-<module>-shapes.ttl` — for cardinalities (`sh:minCount` / `sh:maxCount` → `cardinality` column)
- `source/03-standards/ontology/opda-vocabularies.ttl` — for enumeration members + per-scheme metadata

Mechanical generation should produce a complete first draft from these inputs; review confirms naming and constraint-prose voice.
