---
status: proposed
date: 2026-05-28
tags: [information-architecture, physical-model, ontology, owl, shacl, skos, turtle, documentation]
supersedes: []
depends-on: []
implements: []
---

# IA spec — Physical-tier presentation (ontology)

This document specifies how the **Physical-tier (ontology) presentation** of OPDA's data model is laid out. It is a *blueprint*: the actual Physical-Ontology-tier docs that follow this spec are a separate deliverable.

## What "physical ontology" means for OPDA

The Physical-Ontology tier documents the OWL / SHACL / SKOS Turtle artefacts that OPDA's generator emits. Inputs to this tier:

- `source/03-standards/ontology/foundation.ttl` — ontology header
- `source/03-standards/ontology/opda-classes.ttl` — foundation class graph (6 classes)
- `source/03-standards/ontology/opda-shapes.ttl` — foundation shapes graph (meta-shapes + SHACL-AF rules)
- `source/03-standards/ontology/opda-annotations.ttl` — foundation annotations graph (header-only)
- `source/03-standards/ontology/opda-vocabularies.ttl` — SKOS substrate (23 schemes / 137 concepts)
- `source/03-standards/ontology/opda-<module>.ttl` × 6 — per-module class graphs
- `source/03-standards/ontology/opda-<module>-shapes.ttl` × 6 — per-module SHACL shapes
- `source/03-standards/ontology/opda-<module>-annotations.ttl` × 6 — per-module DPV co-annotations
- `source/03-standards/ontology/profiles/baspi5.ttl` — BASPI5 overlay profile
- `source/03-standards/ontology/exemplars/*.ttl` — 15 diagnostic exemplars + 15 paired expected reports

All emitted by `opda-gen` (per [ADR-0008](../adr/ADR-0008-generator-implementation-infrastructure.md)).

## Audience

Ontology engineers, SHACL implementers, SPARQL consumers, RDF tool authors, regulators interpreting machine-readable artefacts. Fluent in OWL / SHACL / SKOS / Turtle; comfortable reading SHACL-AF SPARQL rules; expects three-graph separation discipline.

## Purpose

Show **the canonical Turtle**, the SHACL constraints that target it, the SKOS schemes it references, and the SHACL-AF rules that derive non-blocking quality flags. Reader should be able to consume the ontology directly: load it into Apache Jena / rdflib / TopBraid; validate instance data via pyshacl; query via SPARQL; build derived inference profiles.

## File layout

```
docs/manual/physical-ontology/
├── README.md                       Tier overview + ontology version pin + load order + class/property/scheme catalogue
├── three-graph-separation.md       The discipline + the 5-part CI test
├── severity-tiers.md               The 4-tier framework + 5 sh:Violation categories
├── shacl-af-rules.md               The 11 non-blocking quality rules + their citing sites
├── <module>/
│   ├── README.md                   Module overview + version-IRI + import chain
│   ├── classes.md                  Per-class blocks (one section per class)
│   ├── shapes.md                   Per-shape blocks (one section per shape)
│   └── annotations.md              DPV co-annotations
├── foundation/
│   ├── README.md                   Foundation overview
│   ├── classes.md                  RoleMixin, Role, Relator, ValidationContext,
│   │                               DiagnosticExemplar, GeneratorRun
│   └── meta-shapes.md              No-identity-override + sh:in semantics +
│                                   sh:Violation floor + meta-shape-over-shape-graph
├── vocabularies/
│   ├── README.md                   Substrate overview + 7-category UFO framework
│   └── <scheme>.md                 One file per SKOS scheme (Physical-Ontology view)
├── profiles/
│   ├── README.md                   Overlay profile catalogue
│   └── baspi5.md                   One file per overlay profile
└── exemplars/
    ├── README.md                   15 diagnostic exemplars + their expected reports
    └── <exemplar>.md               One file per exemplar pair
```

## Per-class section shape (mandatory)

1. **`### <opda:LocalName>`** — H3 (H1 + H2 are used by module-level structure).
2. **Turtle block** — the actual emitted Turtle for this class, fenced as `turtle`. Generator-emitted; do not hand-edit.
3. **`#### A9 per-kind discipline`** — three rows confirming the class satisfies [ADR-0007 §"A9 per-kind discipline output"](../adr/ADR-0007-ontology-generator-specification.md):

   | Triple | Value | Source |
   |---|---|---|
   | `dct:source` | `<...#section-Ya>` | <link to anchor> |
   | `skos:scopeNote @en` | "<UFO + DOLCE citation>" | Guizzardi 2005 / Masolo D18 |
   | `rdfs:comment @en` | "<IC + hard cases>" | ratifying ODR |
4. **`#### Targeting shapes`** — list of `sh:NodeShape` IRIs that `sh:targetClass` this class (links to the per-shape sections).
5. **`#### Subclass / equivalent-class relationships`** — list of `rdfs:subClassOf` / `owl:equivalentClass` triples + their semantic intent.
6. **`#### Cross-tier links`** — links to Concept-tier narrative + Logical-tier attribute table + the Physical-DB tier's `README.md` (deployment overview). The Physical-DB tier is organised by deployment concern (named-graphs, derived-profiles, content-negotiation, overlay-deployment, operations) and has NO per-entity pages by design (per [`physical-database-ia.md`](./physical-database-ia.md)); the `[Physical-Database tier (deployment) →]` link is to the tier README, not to a per-entity page.
7. **`#### Source ODR + ADR`** — ratifying Council session + implementation ADR.

## Per-shape section shape (mandatory)

1. **`### <opda:ShapeName>`** — H3.
2. **Turtle block** — the actual emitted SHACL shape, fenced as `turtle`.
3. **`#### Severity tier`** — one of `sh:Violation` (with subcategory: identity-key / IC-breach / no-identity-override / special-category-PII / meta-shape-over-shape-graph), `sh:Warning`, or `sh:Info`.
4. **`#### Target`** — `sh:targetClass` / `sh:targetObjectsOf` / `sh:sparql` target description.
5. **`#### Validation behaviour`** — what pyshacl produces when this shape fires. Cross-link to the exemplar that demonstrates a positive fire (if any).
6. **`#### Source ODR + ADR`** — typically [ADR-0012](../adr/ADR-0012-shacl-and-dpv-annotation-emission.md) + ratifying ODR.

## Per-SHACL-AF-rule section shape (mandatory)

1. **`### <opda:RuleName>`** — H3.
2. **Turtle block** — the full `sh:rule` declaration with embedded SPARQL.
3. **`#### Derives`** — the materialised predicate the rule emits (e.g. `opda:hasUPRNSuccessionStatus`).
4. **`#### Citing site`** — link to the ODR that names this rule as a citing site (per [ODR-0017](../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md) — 11 sites enumerated).
5. **`#### Severity`** — typically `sh:Info` (non-blocking); `sh:Warning` for PII-related rules per ADR-0012's explicit override.
6. **`#### Source ODR + ADR`** — typically [ADR-0012](../adr/ADR-0012-shacl-and-dpv-annotation-emission.md) + [ODR-0017](../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md) + the citing ODR.

## Per-scheme section shape (mandatory)

1. **`# <opda:SchemeName>`** — H1.
2. **`## Summary`** — paragraph linking to Concept + Logical + Physical-DB tiers.
3. **Turtle block — scheme header** — the `skos:ConceptScheme` declaration with full 7-field per-scheme metadata per [ODR-0011 §1a + §8a](../ontology/odr/ODR-0011-enumeration-vocabularies.md): `skos:prefLabel`, `dct:title`, `skos:definition`, `dct:source`, `opda:ufoCategory`, `skos:scopeNote` (UFO + DOLCE), `opda:hasSteward`.
4. **`## Members`** — table:

   | URI | `skos:prefLabel` | `skos:notation` | `skos:definition` | `dct:source` |
   |---|---|---|---|---|
   | `opda:<scheme>/<Notation>` | "<Label>" | "<notation>" | "<definition>" | `<source URI>` |
5. **Per-member Turtle blocks** — collapsed by default; expand on click. Long enums (>20 members) link to the source TTL rather than inlining.
6. **`## Referenced by`** — list of shapes that `sh:in` this scheme (per-overlay bindings).
7. **`## Source ODR + ADR`** — typically [ADR-0010](../adr/ADR-0010-skos-vocabulary-emission.md) + [ODR-0011](../ontology/odr/ODR-0011-enumeration-vocabularies.md).

## Per-overlay-profile section shape (mandatory)

1. **`# <opda:OverlayProfile>`** — H1.
2. **`## Summary`** — overlay authority + form version + production status.
3. **Turtle block — ontology header** — the profile's `owl:Ontology` declaration with `owl:imports` chain + `owl:versionIRI`.
4. **`## opda:ValidationContext`** — Turtle block + per-property explanation per [ODR-0010 §Q1](../ontology/odr/ODR-0010-overlay-profile-mechanism.md).
5. **`## Per-Kind profile shapes`** — collapsed sections per `opda:<Overlay>_<Kind>Shape` showing `sh:property` blocks + `sh:in` subsets + DASH UI predicates.
6. **`## Three-rule interface contract`** — CI test status: `sh:in` semantics PASS; `sh:Violation` floor PASS; no-identity-override PASS. Links to the `opda-gen ci-profile-contract` CLI command.
7. **`## Source ADR`** — typically [ADR-0013](../adr/ADR-0013-overlay-profile-emission.md).

## Per-exemplar section shape (mandatory)

1. **`# <exemplar-name>`** — H1 (e.g. `# registered-freehold-house`).
2. **`## Summary`** — what hard case the exemplar exercises; cross-link to the Concept-tier entity's `## Hard cases` section.
3. **Exemplar Turtle block** — full contents of `exemplars/<name>.ttl`.
4. **Expected report Turtle block** — full contents of `exemplars/<name>-expected-report.ttl`.
5. **`## SHACL outcome`** — `sh:conforms true` or `sh:conforms false` + which shapes fire (with severity tier).
6. **`## Source ODR + ADR`** — [ODR-0004 §8a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) + [ADR-0014](../adr/ADR-0014-baspi5-round-trip-mvp-harness.md).

## Three-graph separation (must surface in tier README)

Per [ODR-0004 §3a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md): every module emits three files (classes / shapes / annotations) with strict isolation:

| File | MUST contain | MUST NOT contain |
|---|---|---|
| `opda-<module>.ttl` | `owl:Class`, `owl:DatatypeProperty`, `owl:ObjectProperty`, labels, comments | `sh:*` triples, advisory annotations |
| `opda-<module>-shapes.ttl` | `sh:NodeShape`, `sh:PropertyShape`, `sh:targetClass`, `sh:path`, constraints | `owl:Class`, `owl:imports` to DPV |
| `opda-<module>-annotations.ttl` | `dpv-pd:hasPersonalDataCategory`, `opda:aiHint`, `opda:uiHint`, generator notes | `sh:*` triples, `owl:Class` triples |

CI-enforced by 5-part test per ODR-0004 §3a (`opda-gen ci-three-graph`). The Physical-Ontology tier's tier-README documents the discipline + the test and warns content authors against violations.

## Severity tiers (must surface in tier README)

Per [ODR-0013 §Q1](../ontology/odr/ODR-0013-shacl-validation-and-severity.md), every shape carries explicit `sh:severity`. Five `sh:Violation` categories:

1. Identity-key missing / wrong-type
2. IC breach (anti-pattern detection)
3. No-identity-override meta-shape
4. Special-category PII without lawful basis
5. Meta-shape-over-shape-graph drift

Tier README at `docs/manual/physical-ontology/severity-tiers.md` lists each emitted shape grouped by severity + category.

## Diagram conventions

- Module dependency diagrams: Mermaid `flowchart` showing `owl:imports` between modules + foundation + vocabularies.
- Class hierarchy diagrams: Mermaid `classDiagram` with `<<owl:Class>>` stereotypes; shows `rdfs:subClassOf` chains within a module.
- Shape-target diagrams: simple Mermaid `flowchart` showing `Shape → targetClass`.
- No ER diagrams (those live in the Logical tier).

## Voice and style

- Turtle, Turtle, Turtle. Every claim about an emitted artefact is backed by a Turtle block copied verbatim from the source TTL.
- Prose only for the §Summary openers + §Validation behaviour narratives.
- SPARQL blocks for the SHACL-AF rule bodies.
- Cross-link forwards (to Concept tier) for any business-language framing that would otherwise need to be re-explained here.

## Cross-tier traceability

- File-path mapping: `<concept>/<module>/<entity>.md` ↔ `<logical>/<module>/<entity>.md` ↔ `<physical-db>/<module>/<entity>.md` ↔ `<physical-ontology>/<module>/classes.md#<entity>`. Same `<module>` substring; Physical-Ontology consolidates per-class blocks into one `classes.md` per module rather than per-entity files (because Turtle blocks are short and the per-class section structure is uniform).
- Per-class mapping: every `<opda:LocalName>` H3 in Physical-Ontology maps to one entity file in Concept / Logical / Physical-DB. `dct:source` URIs on each class resolve to the Concept-tier file's H1 anchor.
- Per-shape mapping: every shape in Physical-Ontology cites the Logical-tier constraint row it implements.
- Per-scheme mapping: every Physical-Ontology scheme file cites the Logical-tier enumeration file + the Physical-DB-tier `JSON values` table.
- Cross-tier consistency CI: the planned cross-tier walker covers all four tiers' identity mapping.

## Out of scope for this tier

- Business-language narrative — see [`concept-model-ia.md`](./concept-model-ia.md).
- Platform-independent typed attributes — see [`logical-model-ia.md`](./logical-model-ia.md).
- Named-graph layout, derived consumer profiles, content negotiation, BASPI5 deployable composition, CI-gate operations — see [`physical-database-ia.md`](./physical-database-ia.md).
- Generator implementation details — those live in `tools/opda-gen/` source + [ADR-0008](../adr/ADR-0008-generator-implementation-infrastructure.md).

## Worked-template excerpt (one class, schematic)

```markdown
### opda:<LocalName>

```turtle
opda:<LocalName>
    a owl:Class ;
    rdfs:label "<Label>"@en ;
    rdfs:comment "<IC + hard cases>"@en ;
    skos:scopeNote "<UFO + DOLCE citation>"@en ;
    dct:source <https://w3id.org/opda/odr/ODR-NNNN#section-Ya> ;
    .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<URI>` | [<anchor>](…) |
| `skos:scopeNote @en` | "<UFO citation>" | Guizzardi 2005 §<chapter> |
| `rdfs:comment @en` | "<IC>" | [ODR-NNNN §<section>](…) |

#### Targeting shapes

- [`opda:<LocalName>IdentityKeyShape`](./shapes.md#…) — Cat 1
- …

#### Cross-tier links

- [Concept tier →](../../concept/<module>/<entity>.md)
- [Logical tier →](../../logical/<module>/<entity>.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-NNNN — <Title>](../../../docs/ontology/odr/ODR-NNNN-<slug>.md)
- [ADR-0011 — Module TBox emission](../../../docs/adr/ADR-0011-module-tbox-emission.md)
```

## Generation discipline

Physical-Ontology-tier files generate mechanically from the source TTLs:

- Walk each `opda-<module>.ttl` → per-class section per `owl:Class` declaration
- Walk each `opda-<module>-shapes.ttl` → per-shape + per-rule section
- Walk `opda-vocabularies.ttl` → per-scheme file
- Walk each `profiles/<overlay>.ttl` → per-overlay file
- Walk each `exemplars/<name>.ttl` + `<name>-expected-report.ttl` → per-exemplar file

The generation is fully mechanical; reviewer effort is needed only for §Summary openers and §Validation behaviour narratives.
