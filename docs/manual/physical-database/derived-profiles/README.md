# Derived consumer profiles

The build-step composer ([ADR-0013](/modelling/adr/adr-0013), [ODR-0004 §3a](/modelling/odr/odr-0004)) projects the 24 source TTLs into **three derived consumer profiles**, each optimised for a specific consumer scenario. Consumers can fetch the per-module source TTLs and compose locally, but most will fetch a derived profile to avoid the load-order and projection-rule logic.

## Activation status

The composer body has not yet been implemented. The current state:

- **`source/03-standards/ontology/derived/` directory does not exist** in the repository.
- The composer stub at `tools/opda-gen/src/opda_gen/composer.py` raises `NotImplementedError("Derived consumer profile composition is realised in ADR-0013 (build-step composition).")` when invoked.
- The `opda-gen compose --output <dir>` CLI subcommand is wired in [`cli.py`](../../../../tools/opda-gen/src/opda_gen/cli.py) but delegates to the stub.

The three profile pages below specify the **planned composition rules** so consumers (and the composer implementer) have an unambiguous spec. Each profile is marked **"spec only; composer activation pending"** until the composer body lands.

## Composition rules at a glance

| Profile | Classes | Shapes | Annotations | Audience |
|---|---|---|---|---|
| [opda-validation](./opda-validation.md) | yes | yes | no | pyshacl / TopBraid SHACL consumers running production validation |
| [opda-ui](./opda-ui.md) | yes | yes | yes | DASH form-rendering clients, JSON-LD UI consumers showing DPV context |
| [opda-inference](./opda-inference.md) | yes | no | no | OWL 2 reasoners (HermiT, Pellet, Konclude) running TBox classification |

The three profiles are **graph-union compositions**, not entailment closures. The composer concatenates source-graph triples and rewrites cross-graph blank-node references; it does NOT materialise inferred triples. Consumers that need entailment run their reasoner over the derived profile.

## Composer pipeline

<img src="diagrams/README/composer-pipeline.png" alt="Composer pipeline" width="90%">

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
    accTitle: Composer pipeline producing three derived consumer profiles
    accDescr: Shows source TTLs flowing into the opda-gen compose step, which projects three derived consumer profiles each with a different projection rule.

    classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B

    subgraph IN["Per-module source TTLs"]
        F["foundation.ttl + opda-classes<br/>+ opda-shapes + opda-annotations"]:::data
        V["opda-vocabularies.ttl"]:::data
        M["opda-MODULE.ttl × 6"]:::data
        S["opda-MODULE-shapes.ttl × 6"]:::data
        A["opda-MODULE-annotations.ttl × 6"]:::data
    end
    C["opda-gen compose"]:::process
    subgraph OUT["Derived profiles"]
        DV["opda-validation.ttl"]:::data
        DU["opda-ui.ttl"]:::data
        DI["opda-inference.ttl"]:::data
    end
    F --> C
    V --> C
    M --> C
    S --> C
    A --> C
    C -->|classes + shapes| DV
    C -->|classes + shapes + annotations| DU
    C -->|classes only| DI
```

</details>

The composer enforces three invariants per [ODR-0004 §3a](/modelling/odr/odr-0004):

1. **No `owl:Class` triples in `opda-validation.ttl`'s shape projection** (three-graph separation preserved across composition).
2. **No `sh:NodeShape` triples in `opda-inference.ttl`** (classes-alone — reasoner input must be pure TBox).
3. **No DPV `dct:references` triples in `opda-validation.ttl`** (DPV is UI-time concern, not validation-time).

The byte-identity CI gate ([operations/byte-identity-ci.md](../operations/byte-identity-ci.md)) extends to derived-profile regeneration once the composer body lands; until then, the `--exclude=derived` flag in the workflow's `diff -rq` step keeps the gate green.

## Why three profiles, not one merged graph?

Per [ADR-0013](/modelling/adr/adr-0013) §"Module pluralism": different consumers have orthogonal needs:

- **SHACL validators** want classes (for `sh:targetClass` resolution) + shapes (for constraints), but DPV annotations would slow validation without contributing constraint logic.
- **DASH UI renderers** want classes + shapes + DPV annotations (the latter drive consent / data-category disclosures in forms).
- **OWL 2 reasoners** want classes alone; SHACL shapes confuse classical-logic reasoners, and DPV annotations are noise.

A single merged graph would force every consumer to filter at load time, defeating the build-step composition purpose. Per-profile derivation moves the filter to build time so deployment serves pre-filtered artefacts.

## Source ADR + ODR

- [ADR-0013 — Overlay profile emission](/modelling/adr/adr-0013) §"Module pluralism".
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012) §"Annotation reference-not-import".
- [ODR-0004 — PDTF ontology foundation](/modelling/odr/odr-0004) §3a five-part separation contract.
