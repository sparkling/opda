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
