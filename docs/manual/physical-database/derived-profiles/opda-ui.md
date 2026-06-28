---
kind: derived-profile
tier: physical-database
title: opda-ui
---

# opda-ui

**Status: spec only; composer activation pending.** See [README.md](./README.md) §"Activation status".

## Summary

`opda-ui.ttl` serves DASH form-rendering clients and JSON-LD UI consumers that need both validation constraints (`sh:` predicates) AND data-category disclosures (DPV `dct:references` and class-level annotations). It is the union of every class graph, every shape graph, AND every DPV annotation graph — i.e. the maximal information surface for an interactive consumer.

## Composition recipe

<img src="diagrams/opda-ui/composition-recipe.png" alt="opda-ui composition recipe" width="90%">

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
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#FFF8E1", "primaryTextColor": "#E65100", "primaryBorderColor": "#F57F17", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: opda-ui composition recipe
    accDescr: Shows the source TTLs the composer projects into opda-ui, including DPV annotation TTLs that drive UI consent affordances.

    classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B

    foundation["foundation.ttl"]:::data
    classes["opda-classes.ttl"]:::data
    shapesf["opda-shapes.ttl"]:::data
    annf["opda-annotations.ttl"]:::data
    vocabularies["opda-vocabularies.ttl"]:::data
    modules["opda-MODULE.ttl × 6"]:::data
    moduleshapes["opda-MODULE-shapes.ttl × 6"]:::data
    moduleannotations["opda-MODULE-annotations.ttl × 6"]:::data
    composer["opda-gen compose"]:::process
    output["opda-ui.ttl<br/>classes + shapes + annotations"]:::data
    foundation --> composer
    classes --> composer
    shapesf --> composer
    annf --> composer
    vocabularies --> composer
    modules --> composer
    moduleshapes --> composer
    moduleannotations --> composer
    composer --> output
```

</details>

## Included graphs

| Source graph | Projection rule |
|---|---|
| `foundation.ttl` | all triples |
| `opda-classes.ttl` | all triples |
| `opda-shapes.ttl` | all triples |
| `opda-annotations.ttl` | all triples |
| `opda-vocabularies.ttl` | all triples (UI dropdowns / radio enums bind to SKOS schemes) |
| `opda-property.ttl` | all triples (UI needs `rdfs:label` + `rdfs:comment` for form labels + helper text) |
| `opda-agent.ttl` | all triples |
| `opda-transaction.ttl` | all triples |
| `opda-claim.ttl` | all triples |
| `opda-governance.ttl` | all triples |
| `opda-descriptive.ttl` | all triples |
| `opda-property-shapes.ttl` | all triples (DASH UI predicates `dash:viewer`, `dash:editor`, `sh:order`, `sh:group` ride on `sh:property`) |
| `opda-agent-shapes.ttl` | all triples |
| `opda-transaction-shapes.ttl` | all triples |
| `opda-claim-shapes.ttl` | all triples |
| `opda-governance-shapes.ttl` | all triples |
| `opda-descriptive-shapes.ttl` | all triples |
| `opda-property-annotations.ttl` | all triples (DPV baseline categories + variant-conditional refinement maps — drive consent disclosures and PII-handling UI affordances) |
| `opda-agent-annotations.ttl` | all triples |
| `opda-transaction-annotations.ttl` | all triples |
| `opda-claim-annotations.ttl` | all triples |
| `opda-governance-annotations.ttl` | all triples |
| `opda-descriptive-annotations.ttl` | all triples |

## Excluded

- `profiles/baspi5.ttl` and other overlay profiles — overlay UI is opt-in per consumer; consumers loading BASPI5 fetch it separately and the DASH renderer composes the overlay's `dash:viewer`/`dash:editor`/`sh:order`/`sh:group` predicates over the base UI profile.

The exclusion list is short by design: this is the maximal-information derived profile. The only excluded artefacts are overlay-specific (consumer chooses which form to render).

## Deployment artefact

- **Path:** `source/03-standards/ontology/derived/opda-ui.ttl`
- **Content-type:** `text/turtle`
- **Size:** to be measured after composer activation
- **sha256:** to be computed after composer activation
- **Status:** directory does not yet exist; composer body pending

## Source ADR

- [ADR-0013 — Overlay profile emission](/modelling/adr/adr-0013) §"Module pluralism".
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012) — DPV co-annotation surface that this profile exposes to UI consumers.
- [ODR-0010 — Overlay profile mechanism](../../../ontology/odr/) §Q4 — DASH UI predicates ride on shape graphs (consumed by this profile through the per-module shape inclusions).
