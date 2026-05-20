# ODR 0013 — SHACL Validation & Severity

- **Status:** Proposed (planning stub)
- **Date:** 2026-05-20
- **Phase:** Cross-cutting
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q4, Q5; Knublauch/Gandon/Guizzardi)
- **Dependencies:** ODR-0004 (graph separation), ODR-0005, ODR-0011

## Scope

How JSON Schema constraints become SHACL, the severity model, and the UI-hint convention. The SHACL **shapes graph is separate** from the OWL class graph (ODR-0004); shapes target classes via `sh:targetClass`.

### Constraint mapping

| JSON Schema | SHACL |
|---|---|
| `required` | `sh:minCount 1` |
| `enum` (closed) | `sh:in` over the SKOS scheme members (ODR-0011) |
| `type` / `format` | `sh:datatype` / `sh:pattern` / `sh:nodeKind` |
| `minimum`/`maximum` | `sh:minInclusive`/`sh:maxInclusive` |
| `oneOf` (discriminated) | `sh:xone` + `sh:qualifiedValueShape` |
| canonical key | `dash:uniqueValueForClass` (ODR-0005) |

**Open-world/closed-world guard** (Gandon): an `owl:minCardinality` and a `sh:minCount` are **not** the same statement; do not author both on one property believing they coincide. Drift check required.

### Severity tiering (Guizzardi)

- **`sh:Violation`** — breach of a Kind's identity contract: a Property with no resolvable UPRN-or-equivalent key, a RegisteredTitle with no title number, a Role instance with no founding Relator (a Proprietor with no Proprietorship; a Seller with no Transaction); an unprovenanced `opda:Claim` with no `prov:wasDerivedFrom` and no explicit "unverified" marker (Moreau).
- **`sh:Warning`** — missing profile/disclosure constraints that overlays add; sensitivity-marker gaps on special-category data (Pandit).
- **`sh:Info`** — absent optional attributes.

The rarest, most damaging error (identity loss) must be the loudest.

### Advisory-annotation convention (Cagle ↔ Knublauch/Gandon, resolved)

`opda:aiHint`-style advisory annotations for LLM consumers do **not** go inline in the shapes graph (a strict processor would carry uninterpretable triples or misread them as constraints). They live in a **separate annotation graph** keyed to shape IRIs. DASH proves extension is fine *as a documented vocabulary*; undocumented terms masquerading as constraints are not. (Cagle's preference for inline hints recorded as dissent.)

## Vocabularies

SHACL, DASH (`dash:propertyRole`/`viewer`/`editor`), Core, SKOS (for `sh:in`).

## Deliverables (when fleshed out)

The constraint-mapping generator spec (feeds Allemang's generator-first policy); the severity-tier rubric; the annotation-graph convention; DASH UI-hint catalogue.
