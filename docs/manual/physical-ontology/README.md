---
status: proposed
date: 2026-05-28
tags: [physical-ontology, owl, shacl, skos, turtle, documentation]
---

# Physical-Ontology tier

Audience: ontology engineers, SHACL implementers, SPARQL consumers, RDF tool authors, regulators interpreting machine-readable artefacts. Fluent in OWL / SHACL / SKOS / Turtle.

This tier documents the OWL / SHACL / SKOS Turtle artefacts that OPDA's generator emits. Every claim here is backed by a Turtle block copied verbatim from a source TTL at `source/03-standards/ontology/`.

## Ontology version pin

| Field | Value |
|---|---|
| `dct:title` | "OPDA — Open Property Data Association Ontology"@en |
| `dct:creator` | "OPDA Linked Data Council" |
| `dct:issued` | `2026-05-27` |
| `dct:modified` | `2026-05-28` |
| `dct:license` | <https://creativecommons.org/publicdomain/zero/1.0/> |
| `owl:versionIRI` | <https://w3id.org/opda/1.0.0/> |
| `owl:versionInfo` | "1.0.0 — foundation + SKOS vocabularies + UFO meta-classes + module shapes + DPV annotations + overlay profiles + ValidationContext + hasSpecialCategoryData" |
| `vann:preferredNamespacePrefix` | `opda` |
| `vann:preferredNamespaceUri` | `https://w3id.org/opda/#` |
| Generator version | `opda-gen-1.0.0` |

Source: [`foundation.ttl`](../../../source/03-standards/ontology/foundation.ttl).

## Load order

Per ADR-0011 (module TBox emission) + ADR-0010 (SKOS vocabulary emission) + ADR-0013 (overlay profile emission), consumers loading the full ontology should follow this order so `owl:imports` resolves:

1. `foundation.ttl` — ontology header (`<https://w3id.org/opda/>`, `owl:versionIRI <https://w3id.org/opda/1.0.0/>`)
2. `opda-classes.ttl` — foundation class graph (6 classes + `opda:hasSpecialCategoryData`)
3. `opda-vocabularies.ttl` — 23 SKOS concept schemes (137 concepts)
4. `opda-<module>.ttl` × 6 (per-module class graphs):
   - `opda-property.ttl` (imports `<https://w3id.org/opda/1.0.0/>` + `<https://w3id.org/opda/vocabularies/>`)
   - `opda-agent.ttl`
   - `opda-transaction.ttl`
   - `opda-claim.ttl`
   - `opda-descriptive.ttl`
   - `opda-governance.ttl`
5. `opda-shapes.ttl` — foundation meta-shapes + cross-cutting SHACL-AF rules
6. `opda-<module>-shapes.ttl` × 6 — per-module SHACL shapes (Cat 1/2 identity-key, IC-breach, succession rules)
7. `opda-annotations.ttl` — foundation annotations (header-only)
8. `opda-<module>-annotations.ttl` × 6 — DPV co-annotations
9. `profiles/baspi5.ttl` — BASPI5 overlay profile (imports `<https://w3id.org/opda/1.0.0/>` + `<https://w3id.org/opda/vocabularies/>`)

Profiles are loaded after the base ontology + shapes; they compose without modifying upstream graphs.

## Tier overview

![physical-ontology-tier-file-layout-and-owlimports-chain](diagrams/README/physical-ontology-tier-file-layout-and-owlimports-chain.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: false
    nodePlacementStrategy: BRANDES_KOEPF
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Physical-Ontology tier file layout and owl:imports chain
    accDescr: Shows the 24 source TTL files organised by category (foundation, classes, shapes, annotations, vocabularies, profiles, exemplars) and the owl:imports chain that joins them. Foundation + vocabularies are the import roots; per-module class graphs import both; profiles compose over the base.

    %% @prefix opda: <https://w3id.org/opda/#>

    classDef foundation fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef classes fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef shapes fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef annotations fill:#FFF9C4,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef vocab fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef profile fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#BF360C
    classDef exemplar fill:#D7CCC8,stroke:#5D4037,stroke-width:2px,color:#3E2723

    subgraph FoundationGroup["Foundation"]
        F1[foundation.ttl<br/>ontology header]:::foundation
        F2[opda-classes.ttl<br/>6 classes]:::foundation
        F3[opda-shapes.ttl<br/>5 meta-shapes + 2 rules]:::foundation
        F4[opda-annotations.ttl<br/>header-only]:::foundation
    end

    subgraph Vocab["SKOS substrate"]
        V1[opda-vocabularies.ttl<br/>23 schemes / 137 concepts]:::vocab
    end

    subgraph Modules["Per-module graphs (×6)"]
        M1[opda-property.ttl]:::classes
        M2[opda-agent.ttl]:::classes
        M3[opda-transaction.ttl]:::classes
        M4[opda-claim.ttl]:::classes
        M5[opda-descriptive.ttl]:::classes
        M6[opda-governance.ttl]:::classes

        S1[opda-property-shapes.ttl]:::shapes
        S2[opda-agent-shapes.ttl]:::shapes
        S3[opda-transaction-shapes.ttl]:::shapes
        S4[opda-claim-shapes.ttl]:::shapes
        S5[opda-descriptive-shapes.ttl]:::shapes
        S6[opda-governance-shapes.ttl]:::shapes

        A1[opda-property-annotations.ttl]:::annotations
        A2[opda-agent-annotations.ttl]:::annotations
        A3[opda-transaction-annotations.ttl]:::annotations
        A4[opda-claim-annotations.ttl]:::annotations
        A5[opda-descriptive-annotations.ttl]:::annotations
        A6[opda-governance-annotations.ttl]:::annotations
    end

    subgraph Overlay["Overlay profile"]
        P1[profiles/baspi5.ttl]:::profile
    end

    Ex1[exemplars/<br/>15 diagnostic + 15 expected reports]:::exemplar

    F1 -->|owl:versionIRI| F2
    F2 -->|targeted by| F3
    F1 -.->|cited by| F4

    F1 -->|owl:imports| M1
    F1 -->|owl:imports| M2
    F1 -->|owl:imports| M3
    F1 -->|owl:imports| M4
    F1 -->|owl:imports| M5
    F1 -->|owl:imports| M6

    V1 -->|owl:imports| M1
    V1 -->|owl:imports| M2
    V1 -->|owl:imports| M3
    V1 -->|owl:imports| M4
    V1 -->|owl:imports| M5
    V1 -->|owl:imports| M6

    M1 -.->|targeted by| S1
    M2 -.->|targeted by| S2
    M3 -.->|targeted by| S3
    M4 -.->|targeted by| S4
    M5 -.->|targeted by| S5
    M6 -.->|targeted by| S6

    M1 -.->|annotated by| A1
    M2 -.->|annotated by| A2
    M3 -.->|annotated by| A3
    M4 -.->|annotated by| A4
    M5 -.->|annotated by| A5
    M6 -.->|annotated by| A6

    F1 -->|owl:imports| P1
    V1 -->|owl:imports| P1

    M1 -.->|exemplified by| Ex1
    M2 -.->|exemplified by| Ex1
```

</details>

## File layout

```
docs/manual/physical-ontology/
├── README.md                       Tier overview (this file)
├── index.md                        Class + property + scheme catalogue
├── three-graph-separation.md       Per ODR-0004 §3a — discipline + 5-part CI test
├── severity-tiers.md               Per ODR-0013 §Q1 — 4-tier framework + 5 sh:Violation categories
├── shacl-af-rules.md               Per ODR-0017 — 11 non-blocking quality rules + citing sites
├── foundation/                     6 foundation classes + 5 meta-shapes + 2 SHACL-AF rules
├── property/                       7 classes + 6 shapes + 2 SHACL-AF rules
├── agent/                          7 classes + 5 shapes + 2 SHACL-AF rules
├── transaction/                    3 classes + 4 shapes + 2 SHACL-AF rules
├── claim/                          10 classes + 5 shapes + 2 SHACL-AF rules
├── descriptive/                    5 classes + 5 shapes
├── governance/                     2 classes + 1 shape
├── vocabularies/                   23 SKOS schemes (137 concepts)
├── profiles/                       BASPI5 overlay (3-rule interface contract)
└── exemplars/                      15 diagnostic exemplars + 15 paired expected reports
```

## Three-graph separation

Every module emits three files (classes / shapes / annotations) with strict isolation. See [`three-graph-separation.md`](./three-graph-separation.md) for the discipline + the 5-part CI test.

CRITICAL — content authors MUST NOT:

- Add `sh:*` or DPV triples to `opda-<module>.ttl` (classes file)
- Add `owl:Class` or `owl:imports` to `opda-<module>-shapes.ttl` (shapes file)
- Add `sh:*` or `owl:Class` to `opda-<module>-annotations.ttl` (annotations file)

CI-enforced by `opda-gen ci-three-graph` (ODR-0004 §3a).

## Severity tiers

Per ODR-0013 §Q1, every shape carries explicit `sh:severity`. See [`severity-tiers.md`](./severity-tiers.md) for the 4-tier framework + the 5 `sh:Violation` subcategories + each emitted shape grouped by severity.

## SHACL-AF rules

11 non-blocking quality rules per ODR-0017 §1a. See [`shacl-af-rules.md`](./shacl-af-rules.md) for the citing sites + each rule.

## Cross-tier mapping

| Tier | File path convention |
|---|---|
| Concept | `docs/manual/concept/<module>/<entity>.md` |
| Logical | `docs/manual/logical/<module>/<entity>.md` |
| Physical-DB | `docs/manual/physical-database/<module>/<entity>.md` |
| **Physical-Ontology** | `docs/manual/physical-ontology/<module>/classes.md#<entity>` |

Physical-Ontology consolidates per-class blocks into one `classes.md` per module rather than per-entity files (because Turtle blocks are short and the section structure is uniform).

## Source ADR + ODR

- [ADR-0007 — Ontology generator specification](../../adr/ADR-0007-ontology-generator-specification.md)
- [ADR-0008 — Generator implementation infrastructure](../../adr/ADR-0008-generator-implementation-infrastructure.md)
- [ADR-0010 — SKOS vocabulary emission](../../adr/ADR-0010-skos-vocabulary-emission.md)
- [ADR-0011 — Module TBox emission](../../adr/ADR-0011-module-tbox-emission.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
- [ADR-0013 — Overlay profile emission](../../adr/ADR-0013-overlay-profile-emission.md)
- [ADR-0014 — BASPI5 round-trip MVP harness](../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md)
- [ODR-0004 — PDTF ontology foundation](../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) (3a three-graph separation)
- [ODR-0010 — Overlay profile mechanism](../../ontology/odr/ODR-0010-overlay-profile-mechanism.md) (three-rule interface contract)
- [ODR-0011 — Enumeration vocabularies](../../ontology/odr/ODR-0011-enumeration-vocabularies.md) (7-category UFO framework)
- [ODR-0013 — SHACL validation and severity](../../ontology/odr/ODR-0013-shacl-validation-and-severity.md) (4-tier severity framework)
- [ODR-0017 — SHACL-AF quality rules pattern](../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md) (11 citing sites)
