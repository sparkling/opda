---
status: proposed
date: 2026-05-20
tags: [shacl, validation, severity, dash, data-dictionary]
supersedes: []
depends-on: [ONT-0004, ONT-0005]
implements: [ONT-0003]
---

# SHACL Validation & Severity

## Context and Problem Statement

The PDTF v3 schemas are, at bottom, a constraint language: `required` arrays, `enum` lists, `type`/`format` declarations, `minimum`/`maximum` bounds, and `oneOf` discriminations across 8,458 property-path entries, of which 935 base-schema leaves carry semantic annotation (type and description) in the data dictionary. Re-expressing the ontology as an OWL/RDFS class model alone discards all of this — OWL is open-world and says nothing about which properties a conforming document *must* carry, what datatype a value *must* have, or how many times a property *may* appear. The closed-world contract between the ontology and consuming applications is SHACL's job, and Council Session 001 (Q3) was emphatic that the **shapes graph is kept separate from the OWL class graph** (Gandon/Knublauch): an `owl:minCardinality` and a `sh:minCount` are not the same statement, and the open-world/closed-world distinction must not leak between graphs.

Three problems sit on top of the mechanical constraint mapping. First, **not every violation is equal**: a `Property` with no resolvable identity key is a catastrophic, rare error; an absent optional attribute is routine. A flat pass/fail validation buries the loudest error a regulator cares about under a hundred trivial ones. Second, the schemas drive forms — the same shapes that validate a transaction should generate the BASPI/TA6 form that collects it, which means DASH rendering hints (Q5). Third, Cagle wants advisory LLM-consumer annotations (`opda:aiHint`) inline in the shapes, and Knublauch/Gandon refuse any invented term that a strict SHACL processor could misread as a constraint — a dispute that Q5 resolved by exiling advisory annotations to a **separate annotation graph** (the third graph in the class ⊥ shapes ⊥ annotation separation).

The question: how do JSON-Schema constraints become SHACL shapes whose datatypes and cardinalities are grounded in the data dictionary; how is violation severity tiered so the rarest, most damaging error is the loudest; and how are form-rendering hints and advisory annotations kept in their proper graphs without leaking into the constraint contract?

## Decision Drivers

* **Class graph ⊥ shapes graph ⊥ annotation graph** (Gandon/Knublauch, Q3/Q5) — open-world OWL and closed-world SHACL must not leak; advisory hints are a third graph again, keyed to shape IRIs.
* **The 935 annotated base-schema leaves are the constraint source** — `sh:datatype`, `sh:minCount`/`sh:maxCount`, and `sh:in` are derived from the data dictionary's recorded type, requiredness, and enum columns, not invented; provenance via `dct:source` to the canonical leaf path (ONT-0004 convention).
* **Severity tracks regulatory weight, not schema position** (Guizzardi) — the rarest, most damaging error (identity loss) must be the loudest; routine optional-attribute gaps must be the quietest.
* **One graph validates and renders** (Knublauch, Q5) — DASH hints on the same shapes that validate let a loaded profile both check a transaction and generate its form, with full `dct:source` traceability.
* **No invented term may masquerade as a constraint** (Knublauch/Gandon, Q5) — advisory `aiHint`-style annotations live outside the shapes graph; DASH is acceptable *because* it is a documented vocabulary, undocumented terms are not.
* **Identity contracts are gated by the crux** (ONT-0005) — the identity-key shapes depend on ONT-0005 settling the key mechanism (`dash:uniqueValueForClass` primary, `owl:hasKey` secondary); this ODR consumes that decision, it does not make it.

## Considered Options

* **OWL cardinality only, no SHACL** — express requiredness and cardinality as `owl:minCardinality`/`owl:someValuesFrom` on the classes. Rejected by the open-world nature of OWL: a missing required property is not a contradiction under OWL semantics, so nothing is *validated*; it also collapses the class/shapes separation Q3 mandated.
* **Flat SHACL with default severity** — map every constraint to a shape, all at the default `sh:Violation`. Validates correctly, but buries the identity-loss error among trivial optional-gap reports, defeating the regulator's need to see the catastrophic error first.
* **Severity-tiered SHACL in a separate shapes graph, with DASH rendering and a separate annotation graph** (chosen) — constraints map to shapes in a graph distinct from the class graph; severity is tiered (`sh:Violation`/`sh:Warning`/`sh:Info`) by regulatory weight; DASH hints drive form generation on the same shapes; advisory annotations live in a third, separate annotation graph keyed to shape IRIs.

## Decision Outcome

Chosen option: **severity-tiered SHACL in a separate shapes graph, with DASH rendering and a separate annotation graph**, because it is the only option that actually validates the closed-world contract (which OWL cannot), surfaces the rarest and most damaging error loudest (which flat severity cannot), and keeps form-hints and advisory annotations in their proper graphs without letting any invented term masquerade as a constraint.

**Constraint mapping** — the JSON-Schema constructs map to SHACL as follows, with datatypes and cardinalities grounded in the data dictionary:

| JSON Schema | SHACL | Source |
|---|---|---|
| `required` | `sh:minCount 1` | data dictionary requiredness on the leaf |
| `enum` (closed) | `sh:in` over the SKOS scheme members ([ONT-0011](./ONT-0011-enumeration-vocabularies.md)) | the enum's concept scheme |
| `type` / `format` | `sh:datatype` / `sh:pattern` / `sh:nodeKind` | data dictionary recorded type (`string`, `integer`, `number`, `boolean`, `string (date)`, `string (date-time)`, `string (email)`) |
| `minimum` / `maximum` | `sh:minInclusive` / `sh:maxInclusive` | data dictionary bounds |
| `oneOf` (discriminated) | `sh:xone` + `sh:qualifiedValueShape` on the discriminator | the `oneOf` branch + its discriminator leaf |
| array cardinality | `sh:minCount` / `sh:maxCount` | data dictionary array bounds |
| canonical key | `dash:uniqueValueForClass` (primary), `owl:hasKey` (secondary) | [ONT-0005](./ONT-0005-property-land-identity-crux.md) key decision |

The recorded leaf types ground `sh:datatype` directly — `dateOfBirth` → `sh:datatype xsd:date`, `accountNumber` (recorded `integer`) → `xsd:integer`, `annualGroundRent` (recorded `number`) → `xsd:decimal`, `emailAddress` (recorded `string (email)`) → `xsd:string` with `sh:pattern`/`sh:nodeKind`. Each property shape carries `dct:source` to its canonical leaf path (e.g. `…/pdtf-transaction.json#…/dateOfBirth`) per the [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) provenance convention; this ODR applies that convention, it does not re-define it.

**Open-world/closed-world guard** (Gandon): an `owl:minCardinality` in the class graph and a `sh:minCount` in the shapes graph are **not the same statement** and must not be authored on one property in the belief that they coincide. A drift check is required to catch the two falling out of step.

**Severity tiering** (Guizzardi) — severity tracks regulatory weight, not schema nesting:

- **`sh:Violation`** — breach of a Kind's identity contract: a `Property` with no resolvable UPRN-or-equivalent key, a `RegisteredTitle` with no title number, a Role instance with no founding Relator (a `Proprietor` with no `Proprietorship`; a `Seller` with no `Transaction`); an unprovenanced `opda:Claim` with no `prov:wasDerivedFrom` and no explicit "unverified" marker (Moreau, [ONT-0009](./ONT-0009-claims-evidence-provenance.md)).
- **`sh:Warning`** — missing profile/disclosure constraints that overlays add; sensitivity-marker gaps on special-category or personal data (Pandit, [ONT-0012](./ONT-0012-data-governance-layer.md) sensitivity gate).
- **`sh:Info`** — absent optional attributes.

The principle: the rarest, most damaging error (identity loss) must be the loudest; the routine omission must be the quietest.

**DASH rendering** — `dash:propertyRole`/`viewer`/`editor`, `sh:order`/`sh:group`, and `dash:EnumSelectEditor` (fed by the [ONT-0011](./ONT-0011-enumeration-vocabularies.md) schemes) reproduce the form on the same shapes that validate, so a loaded profile both validates a transaction and generates the form that collects it, with full `dct:source` traceability — the canonical round-trip (Q5; see [ONT-0010](./ONT-0010-overlay-profile-mechanism.md)).

**Annotation-graph separation** (Cagle ↔ Knublauch/Gandon, resolved) — advisory `opda:aiHint`-style annotations for LLM consumers do **not** go inline in the shapes graph (a strict processor would carry uninterpretable triples or misread them as constraints). They live in a **separate annotation graph keyed to shape IRIs**, consistent with the Q3 class ⊥ shapes ⊥ annotation separation and the overlay annotation-graph convention in [ONT-0010](./ONT-0010-overlay-profile-mechanism.md). DASH proves extension is fine *as a documented vocabulary*; an undocumented term masquerading as a constraint is not. Cagle's preference for inline hints is recorded as dissent (≈7-2).

### Consequences

* Good, because the closed-world contract is actually validated — `sh:minCount`, `sh:datatype`, and `sh:in` enforce requiredness, type, and value-domain that open-world OWL cannot, with each shape traceable via `dct:source` to its canonical leaf.
* Good, because severity tiering surfaces the rarest, most damaging error (identity loss) loudest and routine omissions quietest, so a regulator sees the catastrophic breach first rather than buried under optional-attribute noise.
* Good, because grounding `sh:datatype`/`sh:minCount`/`sh:maxCount` in the data dictionary's recorded types and bounds makes the shapes derivable rather than hand-authored — feeding Allemang's generator-first policy ([ONT-0004](./ONT-0004-pdtf-ontology-foundation.md)).
* Good, because one shapes graph validates and renders, so a loaded profile round-trips JSON → profile → rendered form + validated document with full provenance.
* Bad, because the class graph and shapes graph can drift (an `owl:minCardinality` and a `sh:minCount` diverging silently), so a drift check is a standing maintenance cost the open-world/closed-world guard imposes.
* Neutral, because advisory `aiHint` annotations are exiled to a separate annotation graph rather than refused outright — Cagle's inline preference is recorded as dissent, not adopted.

### Confirmation

- Shapes are validated with a SHACL processor (pySHACL or TopBraid) against the diagnostic exemplars ([ONT-0005](./ONT-0005-property-land-identity-crux.md)): a registered freehold house, an unregistered house pre-first-registration, and a flat whose UPRN was split must each produce the *expected* validation report — including a `sh:Violation` for the identity-key breach on the unregistered/split cases.
- Severity assignment is confirmed by a rubric: every `sh:Violation` shape is checked to guard a Kind's identity contract or an unprovenanced claim; no optional-attribute gap is permitted to carry `sh:Violation`.
- The class/shapes separation is confirmed structurally — the shapes graph and class graph are distinct named graphs ([ONT-0004](./ONT-0004-pdtf-ontology-foundation.md)); the drift check confirms no property carries both an `owl:` cardinality and a SHACL count authored as equivalent.
- The annotation-graph convention is confirmed by the **absence** of any `opda:aiHint` (or other undocumented advisory term) inside the shapes graph — advisory triples resolve only in the separate annotation graph keyed to shape IRIs.
- The BASPI5 vertical slice (Q7 MVP) round-trips: its profile shapes validate a transaction *and* generate the BASPI form with `dct:source` traceability.

## Pros and Cons of the Options

### OWL cardinality only, no SHACL

* Good, because it keeps everything in one OWL graph with no second formalism.
* Bad, because OWL is open-world: a missing required property is not a contradiction, so nothing is actually validated, and it collapses the class/shapes separation Q3 mandated.

### Flat SHACL with default severity

* Good, because it is the simplest faithful mapping of the JSON constraints and validates the closed-world contract correctly.
* Bad, because every finding is `sh:Violation`, so the catastrophic identity-loss error is buried among trivial optional-gap reports — the regulator's most important signal is the hardest to see.

### Severity-tiered SHACL + separate shapes graph + DASH + annotation graph

* Good, because it validates the closed-world contract, tiers severity by regulatory weight, renders forms from the same shapes, and keeps advisory annotations from masquerading as constraints.
* Good, because datatypes and cardinalities are grounded in the data dictionary, making the shapes generable and traceable.
* Bad, because the class/shapes separation imposes a standing drift-check cost between the two graphs.

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Vocabularies**: SHACL (`sh:minCount`/`sh:maxCount`/`sh:datatype`/`sh:in`/`sh:xone`/`sh:qualifiedValueShape`/severity); DASH (`dash:propertyRole`/`viewer`/`editor`/`uniqueValueForClass`/`EnumSelectEditor`); Core; SKOS (for `sh:in` over the [ONT-0011](./ONT-0011-enumeration-vocabularies.md) schemes). Catalogue status per [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Data dictionary as input** (key input): the 935 annotated base-schema leaves in `data-dictionary.md` / `data-dictionary-canonical.json` are the constraint source — recorded leaf **types** (`string`, `integer`, `number`, `boolean`, `string (date)`, `string (date-time)`, `string (email)`, `object`, `array`) drive `sh:datatype`/`sh:nodeKind`; requiredness drives `sh:minCount`; array bounds drive `sh:minCount`/`sh:maxCount`; `enum` columns drive `sh:in` over the corresponding [ONT-0011](./ONT-0011-enumeration-vocabularies.md) scheme. Each property shape carries `dct:source` to its canonical leaf path per the [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) convention.
- **Deliverables (when fleshed out)**: the constraint-mapping generator spec (feeds Allemang's generator-first policy); the severity-tier rubric; the open-world/closed-world drift check; the annotation-graph convention; the DASH UI-hint catalogue.
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); foundation [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) (graph separation, generator + provenance convention); identity-key source [ONT-0005](./ONT-0005-property-land-identity-crux.md) (`dash:uniqueValueForClass` primary, `owl:hasKey` secondary); `sh:in` scheme source [ONT-0011](./ONT-0011-enumeration-vocabularies.md); sensitivity-gate source [ONT-0012](./ONT-0012-data-governance-layer.md); overlay profiles + annotation-graph + ValidationContext [ONT-0010](./ONT-0010-overlay-profile-mechanism.md); unprovenanced-claim violation [ONT-0009](./ONT-0009-claims-evidence-provenance.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q4 (identity-key mechanism), Q5 (overlays → SHACL, severity, aiHint resolution; Knublauch/Gandon/Guizzardi).

## Vote and Dissent

This cross-cutting ODR records no vote of its own — it is a planning record to be fleshed out in its own follow-up session. The Council Session 001 positions it inherits:

- **Q5 overlays → SHACL profiles** — confirmed unanimous on the core mapping (Knublauch); composition is a documented build-step graph-union, not an OWL entailment (Gandon).
- **Q4 identity-key mechanism** — `dash:uniqueValueForClass` primary and checkable (degrades gracefully when UPRN is absent); `owl:hasKey` secondary; **no `owl:sameAs`** to join identifier surfaces (unanimous). The identity contract is the `sh:Violation` tier's anchor.
- **Q5 severity tiering** (Guizzardi) — identity-contract breaches are `sh:Violation`; disclosure/sensitivity gaps are `sh:Warning`; optional-attribute gaps are `sh:Info`.
- **Q5 aiHint dispute (Cagle ↔ Knublauch/Gandon)** — advisory annotations exiled to a separate annotation graph keyed to shape IRIs; Knublauch/Gandon prevail, **Cagle dissent recorded (≈7-2)**.
- **Q5 open-world/closed-world guard** (Gandon) — an `owl:minCardinality` and a `sh:minCount` are not the same statement; a drift check is required.
