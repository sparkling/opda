---
status: proposed
date: 2026-05-28
tags: [information-architecture, physical-model, database, json-schema, documentation]
supersedes: []
depends-on: []
implements: []
---

# IA spec — Physical-tier presentation (JSON / database)

This document specifies how the **Physical-tier (JSON / database) presentation** of OPDA's data model is laid out. It is a *blueprint*: the actual Physical-DB-tier docs that follow this spec are a separate deliverable.

## What "physical database" means for OPDA

OPDA does not have a SQL database. The PDTF (Property Data Trust Framework) JSON Schema is the canonical wire format the property industry consumes — submitters generate JSON instances matching the schema, consumers parse those instances, and the schema is the contract between them. For OPDA's documentation purposes, **the PDTF JSON Schema is the physical database**: it is the on-the-wire encoding that integrators bind to.

Inputs to this tier:

- `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json` — base PDTF schema (1,557 leaves)
- `source/03-standards/schemas/src/schemas/v3/overlays/<form>.json` — overlay schemas (BASPI5, TA6, NTS, LPE1, etc.; 10+ overlays)
- `source/00-deliverables/semantic-models/data-dictionary-canonical.json` — 8,458 path entries; the canonical leaf inventory

These are a nested git repo (`source/03-standards/schemas/` per CLAUDE.md). The Physical-DB tier documents but does not own them.

## Audience

API consumers, application developers, exchange-format implementers, integrators wiring property-industry forms to OPDA-aligned systems. Fluent in JSON Schema; familiar with REST and wire-format engineering; does not need RDF / SHACL / SKOS at this tier.

## Purpose

Show **which JSON paths carry which data**, **how overlays bind to BASPI5 / TA6 / NTS / LPE1 form questions**, **which enumerations constrain which fields**, and **how the JSON schema fragment for a given OPDA Kind looks**. Reader should be able to implement a producer or consumer against the schema using only this tier + the PDTF schema files.

## File layout

```
docs/manual/physical-database/
├── README.md                       Tier overview + PDTF version pin + reading order
├── index.md                        Module catalogue + leaf-path inventory by module
├── <module>/
│   ├── README.md                   Module-level path summary
│   ├── <entity>.md                 One file per OPDA entity (mirrors Concept + Logical tiers)
│   └── enumerations/
│       └── <scheme>.md             One file per SKOS scheme (Physical-DB view)
├── overlays/
│   ├── README.md                   Overlay catalogue + handoff discipline
│   ├── baspi5.md                   One file per overlay
│   ├── ta6.md
│   └── …
└── diagrams/
    └── leaf-inventory-by-module.md Tables + sunburst-style visualisations
```

- One file per OPDA entity, mirroring Concept and Logical tiers for cross-tier traceability.
- Overlays get their own subdirectory because their structure is per-form, not per-entity.
- Enumeration files document the JSON-string values (with their canonical scheme membership shown as a back-link to the Logical tier).

## Per-entity section shape (mandatory)

1. **`# <Entity name>`** — H1, matches Concept + Logical tier names.
2. **`## Summary`** — one paragraph linking back to Concept (`[Concept tier →]`) and Logical (`[Logical tier →]`); names the PDTF schema fragment URL.
3. **`## JSON paths`** — table of every PDTF path that carries data for this entity:

   | JSON path | Logical attribute | Type | Cardinality | Required | Enum scheme | Overlay bindings |
   |---|---|---|---|---|---|---|
   | `propertyPack.buildInformation.building.builtForm` | `builtForm` | `string` | `0..1` | N | `BuiltFormScheme` | BASPI5 §B1.3.2 |

   - `JSON path` is the dotted-path notation against the base PDTF schema.
   - `Logical attribute` cites the Logical-tier attribute name (linked).
   - `Type` is the JSON Schema `type` (`string` / `integer` / `boolean` / `array` / `object`).
   - `Cardinality` derives from JSON Schema `required` + array `minItems` / `maxItems`.
   - `Required` is Y when the leaf is in a `required` array AT THE BASE schema level (overlays may add requireds — see §"Overlay bindings").
   - `Enum scheme` cites the SKOS scheme if the leaf has an `enum`.
   - `Overlay bindings` lists each overlay that constrains this leaf, with the form-question anchor (e.g. `BASPI5 §B1.3.2`, `TA6 §3.1`).
4. **`## JSON Schema fragment`** — copy of the relevant `pdtf-transaction.json` substructure for this entity, with `// ←` annotations linking back to OPDA terms. Generated from `pdtf-transaction.json`; do not hand-edit.
5. **`## Sample JSON instance`** — one representative JSON object exercising every required field. Cross-links to the Logical tier's Identity Criterion: shows which fields jointly identify a unique instance.
6. **`## Validation`** — JSON Schema validation command (`ajv validate -s <schema> -d <instance>`); links to the BASPI5 round-trip MVP harness at `tests/baspi5_round_trip/` per [ADR-0014](../adr/ADR-0014-baspi5-round-trip-mvp-harness.md).
7. **`## Source ADR`** — typically [ADR-0011](../adr/ADR-0011-module-tbox-emission.md) (TBox emission) + the per-entity ratifying ODR.

## Per-enumeration section shape (mandatory)

1. **`# <SchemeName>`** — H1, matches Logical-tier name.
2. **`## Summary`** — links to Concept + Logical tiers.
3. **`## JSON values`** — table of valid `enum` values as they appear in PDTF:

   | JSON value | Scheme member URI | Notes |
   |---|---|---|
   | `"Detached"` | `opda:builtForm/Detached` | … |

4. **`## JSON paths that bind this scheme`** — list of PDTF paths where this enum is referenced. Cross-link to the per-entity files for context.
5. **`## Source ADR`** — typically [ADR-0010](../adr/ADR-0010-skos-vocabulary-emission.md).

## Per-overlay section shape (mandatory)

1. **`# <OverlayName>`** — H1 (e.g. `# BASPI5`).
2. **`## Summary`** — one paragraph naming the authority, the form version, and the production status.
3. **`## Overlay context`** — fields lifted from `opda:ValidationContext` per [ODR-0010 §Q1](../ontology/odr/ODR-0010-overlay-profile-mechanism.md): `profileURI`, `requires`, `overlaysContext`, `sourcedFrom`, `formVersion`.
4. **`## Form-question inventory`** — table:

   | Form question | PDTF path | OPDA entity | Cardinality (overlay) | Enum subset | DASH UI group |
   |---|---|---|---|---|---|
   | `B1.3.2` | `propertyPack.buildInformation.building.builtForm` | Property | `1..1` (BASPI5 requires) | full BuiltFormScheme | "Built form" group |

5. **`## Three-rule interface contract checks`** — per [ODR-0010 §Q1 + ODR-0013 §Q1](../ontology/odr/ODR-0013-shacl-validation-and-severity.md): `sh:in` semantics OK; `sh:Violation` floor honoured; no-identity-override gate clear.
6. **`## Round-trip status`** — per [ADR-0014](../adr/ADR-0014-baspi5-round-trip-mvp-harness.md): which exemplars round-trip cleanly, which have known gaps.
7. **`## Source ADR`** — typically [ADR-0013](../adr/ADR-0013-overlay-profile-emission.md).

## Diagram conventions

- Path-inventory visualisations: prefer dense tables over diagrams (the reader is searching, not browsing).
- Overlay binding diagrams: simple two-column layouts (form question → JSON path) rendered as Mermaid `flowchart LR` if a visual helps.
- No ER diagrams here (those live in the Logical tier).

## Voice and style

- Tables, tables, tables. Prose only for the §Summary opener and the §Round-trip status narrative.
- Code blocks with annotated JSON for fragments + samples.
- `// ←` annotation arrows linking JSON Schema fragments back to OPDA terms.
- Form-question anchors use the authority's official numbering (BASPI5: `B1.3.2`; TA6: `3.1`); cross-link to the form's published canonical anchor URL.

## Cross-tier traceability

- File-path mapping: `<concept-tier>/property/property.md` ↔ `<logical-tier>/property/property.md` ↔ `<physical-db-tier>/property/property.md`. Identical `<module>/<entity>.md` shape across tiers.
- Per-path mapping: every JSON path in the §"JSON paths" table cites the Logical attribute row it implements (`[Logical →](../../logical/property/property.md#attributes)`).
- Per-overlay mapping: every form-question row cites the BASPI5 / TA6 / NTS profile shape in the Physical-Ontology tier that emits the corresponding SHACL constraint.
- Cross-tier consistency CI: the planned cross-tier walker (see [`logical-model-ia.md`](./logical-model-ia.md) §"Cross-tier traceability") covers Physical-DB ↔ Logical ↔ Physical-Ontology consistency.

## Out of scope for this tier

- Business-language narrative — see [`concept-model-ia.md`](./concept-model-ia.md).
- Typed attribute inventory at platform-independent level — see [`logical-model-ia.md`](./logical-model-ia.md).
- OWL / SHACL / SKOS / Turtle syntax — see [`physical-ontology-ia.md`](./physical-ontology-ia.md).
- The PDTF schemas themselves (they are documented HERE but owned by the nested git repo at `source/03-standards/schemas/`).

## Worked-template excerpt (one entity, schematic)

```markdown
# <EntityName>

## Summary

<Linking paragraph: [Concept tier →] · [Logical tier →] · PDTF schema fragment at `<path>`.>

## JSON paths

| JSON path | Logical attribute | Type | Cardinality | Required | Enum scheme | Overlay bindings |
|---|---|---|---|---|---|---|
| `<dotted.path>` | `<attr>` | `string` | `0..1` | N | `<Scheme>` | BASPI5 §<anchor>, TA6 §<anchor> |

## JSON Schema fragment

```json
{
  "<entity>": {
    "type": "object",
    "properties": {
      "<attr>": { "type": "string", "enum": ["A", "B", "C"] }  // ← <opda:term>
    }
  }
}
```

## Sample JSON instance

```json
{ "<entity>": { "<attr>": "A" } }
```

## Validation

```bash
ajv validate -s source/03-standards/schemas/.../pdtf-transaction.json -d sample.json
```

## Source ADR

- [ADR-0011 — Module TBox emission](../../../docs/adr/ADR-0011-module-tbox-emission.md)
- [ODR-NNNN — <ratifying ODR>](../../../docs/ontology/odr/ODR-NNNN-<slug>.md)
```

## Generation discipline

Physical-DB-tier files generate from:

- `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json` — base path inventory
- `source/03-standards/schemas/src/schemas/v3/overlays/*.json` — overlay path inventory + form-question anchors (where the source carries `baspi5Ref` / `ta6Ref` markers)
- `source/00-deliverables/semantic-models/data-dictionary-canonical.json` — canonical leaf path + name + source attribution
- `source/03-standards/ontology/profiles/baspi5.ttl` — for overlay context + DASH UI groups + cardinality

Mechanical generation should produce a complete first draft from these inputs; review confirms overlay narrative and round-trip status accuracy.
