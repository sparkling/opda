---
kind: derived-profile
tier: physical-database
title: opda-inference
---

# opda-inference

**Status: optional export only; NOT opda's inference path (ODR-0025 §R6, 2026-06-01).** opda's inference is the load-time **OWL-RL-safe closure** materialised into `https://opda.org.uk/pdtf/graph/inferred/entailment` at Jena load time (ODR-0025/0026; ADR-0035; `scripts/fuseki-load.mjs`). Full OWL-DL classification is **out of scope** (ODR-0025 §Decision). This classes-alone projection is retained only as an *optional* export for third-party DL tooling that wants to run its own classifier; opda's pipeline never builds or consumes it for reasoning. The DL-reasoner framing below is preserved for that optional-export audience.

## Summary

`opda-inference.ttl` is an optional classes-alone export for external OWL 2 reasoners (HermiT, Pellet, Konclude) running classical-logic TBox classification — **opda itself does not run these** (ODR-0025). Reasoners need pure ontology axioms — `owl:Class`, `rdfs:subClassOf`, `owl:DatatypeProperty`, `owl:ObjectProperty`, `owl:disjointWith` etc. — and are confused by SHACL shapes (which look like class definitions but aren't) and slowed by DPV annotations (which contribute no inferences). This profile is the classes-alone projection.

## Composition recipe

<img src="diagrams/opda-inference/composition-recipe.png" alt="opda-inference composition recipe" width="70%">

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#FFF8E1", "primaryTextColor": "#E65100", "primaryBorderColor": "#F57F17", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: opda-inference composition recipe
    accDescr: Shows the source TTLs the composer projects into opda-inference - classes only, no shapes or annotations.

    classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B

    foundation["foundation.ttl"]:::data
    classes["opda-classes.ttl"]:::data
    vocabularies["opda-vocabularies.ttl"]:::data
    modules["opda-MODULE.ttl × 6"]:::data
    composer["opda-gen compose"]:::process
    output["opda-inference.ttl<br/>classes alone"]:::data
    foundation --> composer
    classes --> composer
    vocabularies --> composer
    modules --> composer
    composer --> output
```

</details>

## Included graphs

| Source graph | Projection rule |
|---|---|
| `foundation.ttl` | `owl:Ontology` header + provenance triples (license, creator, versionIRI) only; `sh:declare` stripped |
| `opda-classes.ttl` | `owl:Class`, `owl:DatatypeProperty`, `owl:ObjectProperty`, `rdfs:subClassOf`, `rdfs:domain`, `rdfs:range`, `owl:equivalentClass`, `owl:disjointWith`, `rdfs:label`, `rdfs:comment`, `skos:scopeNote` |
| `opda-vocabularies.ttl` | `skos:ConceptScheme`, `skos:Concept`, `skos:inScheme`, `skos:broader`, `skos:narrower`, `skos:related`, `skos:prefLabel`, `skos:definition` — SKOS is OWL-compatible; reasoners treat it as a class hierarchy |
| `opda-property.ttl` | same projection as `opda-classes.ttl` |
| `opda-agent.ttl` | same |
| `opda-transaction.ttl` | same |
| `opda-claim.ttl` | same |
| `opda-governance.ttl` | same |
| `opda-descriptive.ttl` | same |

## Excluded

- `opda-shapes.ttl` and `opda-<module>-shapes.ttl` × 6 — SHACL shapes confuse OWL 2 reasoners. `sh:NodeShape` looks like an `owl:Class` to a reasoner but carries no classical-logic semantics; including shapes either causes false-positive classifications or runtime errors depending on reasoner strictness.
- `opda-annotations.ttl` and `opda-<module>-annotations.ttl` × 6 — DPV `dct:references` triples contribute nothing to classification; their inclusion would balloon ABox size for no inference benefit.
- `profiles/baspi5.ttl` and other overlay profiles — overlay profiles are shape graphs (excluded for the same reason as `opda-<module>-shapes.ttl`).

## Deployment artefact

- **Path:** `source/03-standards/ontology/derived/opda-inference.ttl`
- **Content-type:** `text/turtle`
- **Size:** to be measured after composer activation
- **sha256:** to be computed after composer activation
- **Status:** directory does not yet exist; composer body pending

## Source ADR

- [ADR-0013 — Overlay profile emission](../../../adr/ADR-0013-overlay-profile-emission.md) §"Module pluralism".
- [ODR-0004 — PDTF ontology foundation](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) §3a — three-graph separation invariant (classes / shapes / annotations); this profile takes only the classes column.
