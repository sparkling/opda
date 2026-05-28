---
kind: per-module-deployment
sourceTtl: source/03-standards/ontology/opda-foundation.ttl
tier: physical-database
title: Foundation — deployment view
---

# Foundation — deployment view

The foundation module is the base of every other module. It declares the OPDA namespace, the cross-cutting UFO meta-classes, the foundation meta-shapes (no-identity-override, three-rule interface contract, meta-shape justification), and the header-only annotation graph.

## Source TTL(s)

| File | Role | Physical-Ontology tier |
|---|---|---|
| [`foundation.ttl`](../../../../source/03-standards/ontology/foundation.ttl) | `owl:Ontology` header + metadata (license, creator, versionIRI) | [foundation/README.md](../../physical-ontology/foundation/README.md) |
| [`opda-classes.ttl`](../../../../source/03-standards/ontology/opda-classes.ttl) | 6 foundation classes + `opda:hasSpecialCategoryData` datatype property | [foundation/classes.md](../../physical-ontology/foundation/classes.md) |
| [`opda-shapes.ttl`](../../../../source/03-standards/ontology/opda-shapes.ttl) | 5 foundation meta-shapes + 2 SHACL-AF cross-cutting rules | [foundation/meta-shapes.md](../../physical-ontology/foundation/meta-shapes.md) |
| [`opda-annotations.ttl`](../../../../source/03-standards/ontology/opda-annotations.ttl) | Header-only DPV meta-annotation scaffolding | [foundation/README.md](../../physical-ontology/foundation/README.md) |

## Named graph(s)

| Named graph IRI | Source TTL | Triples | `owl:versionIRI` |
|---|---|---|---|
| `https://w3id.org/opda/` | `foundation.ttl` | 15 | `https://w3id.org/opda/1.0.0/` |
| *(no ontology IRI — class graph)* | `opda-classes.ttl` | 36 | — (rides on foundation versionIRI) |
| `https://w3id.org/opda/shapes` | `opda-shapes.ttl` | 51 | — |
| `https://w3id.org/opda/annotations` | `opda-annotations.ttl` | 3 | — |

**Load order:** foundation graphs have no `owl:imports`. They are loaded first by every consumer. Every per-module TBox graph imports `<https://w3id.org/opda/1.0.0/>` (the foundation versionIRI) as one of its two foundation-substrate imports.

See [named-graphs.md §Foundation graphs](../named-graphs.md#foundation-graphs) for per-graph details.

## Derived-profile membership

| Profile | `foundation.ttl` | `opda-classes.ttl` | `opda-shapes.ttl` | `opda-annotations.ttl` |
|---|---|---|---|---|
| [opda-validation](../derived-profiles/opda-validation.md) | included (all triples) | included (all triples) | included (all triples) | excluded |
| [opda-ui](../derived-profiles/opda-ui.md) | included (all triples) | included (all triples) | included (all triples) | included (all triples) |
| [opda-inference](../derived-profiles/opda-inference.md) | included (header + provenance only; `sh:declare` stripped) | included (class axioms only) | excluded | excluded |

Foundation classes appear in all three profiles because they are the substrate every consumer needs to resolve `sh:targetClass` or run TBox classification. Foundation meta-shapes appear in validation + UI but not inference (reasoner confusion). The annotation graph appears only in UI (DPV is a UI-time concern).

## Overlay bindings

**Every** deployed overlay imports the foundation graph via `owl:imports <https://w3id.org/opda/1.0.0/>`. The BASPI5 overlay is the only overlay currently in production:

- [`profiles/baspi5.ttl`](../../../../source/03-standards/ontology/profiles/baspi5.ttl) imports foundation + uses `opda:ValidationContext` to reify its `opda:Baspi5ValidationContext` instance per ODR-0010 §Q1.

The foundation meta-shapes (Cat 3 NoIdentityOverride, Cat 5 MetaShapeOverShapeGraph, three-rule interface contract `ShInSemantics` + `ShViolationFloor`) constrain every overlay — overlays cannot suppress foundation identity keys or downgrade foundation severity floors. See [overlay-deployment/baspi5.md §Three-rule interface contract status](../overlay-deployment/baspi5.md#three-rule-interface-contract-status).

## Content-negotiation entry points

| Resource path | Resolves to |
|---|---|
| `https://w3id.org/opda/` | foundation default graph (`foundation.ttl`) |
| `https://w3id.org/opda/1.0.0/` | foundation versionIRI snapshot (immutable per release) |
| `https://w3id.org/opda/DiagnosticExemplar` | per-entity dereference into `opda-classes.ttl` |
| `https://w3id.org/opda/GeneratorRun` | per-entity dereference into `opda-classes.ttl` |
| `https://w3id.org/opda/Relator` | per-entity dereference into `opda-classes.ttl` |
| `https://w3id.org/opda/Role` | per-entity dereference into `opda-classes.ttl` |
| `https://w3id.org/opda/RoleMixin` | per-entity dereference into `opda-classes.ttl` |
| `https://w3id.org/opda/ValidationContext` | per-entity dereference into `opda-classes.ttl` |
| `https://w3id.org/opda/hasSpecialCategoryData` | per-entity dereference into `opda-classes.ttl` |
| `https://w3id.org/opda/shapes` | `opda-shapes.ttl` (named-graph endpoint) |
| `https://w3id.org/opda/annotations` | `opda-annotations.ttl` (named-graph endpoint) |

Content-type routing per the [Accept-header matrix](../content-negotiation/README.md#accept-header-routing).

## Deployment graph

<img src="diagrams/foundation/foundation-deployment.png" alt="Foundation module deployment graph" width="90%">

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
    accTitle: Foundation module deployment graph
    accDescr: Shows how foundation TTLs flow through named graphs, derived profiles, overlay bindings, and HTTP entry points.

    classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef service fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef user fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C
    classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1

    subgraph SRC["Source TTLs"]
        F["foundation.ttl<br/>15 triples"]:::data
        Cl["opda-classes.ttl<br/>36 triples"]:::data
        Sh["opda-shapes.ttl<br/>51 triples"]:::data
        An["opda-annotations.ttl<br/>3 triples"]:::data
    end

    subgraph NG["Named graphs"]
        NGF["w3id.org/opda/<br/>versionIRI 1.0.0/"]:::infra
        NGSh["w3id.org/opda/shapes"]:::infra
        NGAn["w3id.org/opda/annotations"]:::infra
    end

    subgraph CMP["Composer"]
        C["opda-gen compose"]:::process
    end

    subgraph DRV["Derived profiles"]
        DV["opda-validation.ttl"]:::data
        DU["opda-ui.ttl"]:::data
        DI["opda-inference.ttl"]:::data
    end

    subgraph OVR["Overlay bindings"]
        B5["profiles/baspi5.ttl<br/>imports foundation"]:::data
    end

    subgraph HTTP["HTTP entry points"]
        H1["w3id.org/opda/"]:::service
        H2["w3id.org/opda/1.0.0/"]:::service
        H3["per-entity dereference<br/>Role / Relator / etc."]:::service
    end

    subgraph CONS["Consumers"]
        U1["SHACL validators"]:::user
        U2["DASH UI"]:::user
        U3["OWL reasoners"]:::user
        U4["Overlay deployments"]:::user
    end

    F --> NGF
    Cl --> NGF
    Sh --> NGSh
    An --> NGAn

    NGF --> C
    NGSh --> C
    NGAn --> C

    C -->|classes + shapes| DV
    C -->|classes + shapes + annotations| DU
    C -->|classes only| DI

    NGF --> B5
    NGSh --> B5

    NGF --> H1
    NGF --> H2
    NGF --> H3

    DV --> U1
    DU --> U2
    DI --> U3
    B5 --> U4
```

</details>

## Cross-tier links

- **Logical tier:** [`docs/manual/logical/foundation/`](../../logical/foundation/) — typed attributes + cardinalities for the foundation classes.
- **Physical-Ontology tier:** [`docs/manual/physical-ontology/foundation/`](../../physical-ontology/foundation/) — Turtle source layout + per-class blocks + meta-shape constraint bodies.
- **Operations:** [byte-identity CI](../operations/byte-identity-ci.md) regenerates the four foundation TTLs; [three-graph CI](../operations/three-graph-ci.md) enforces separation per ODR-0004 §3a.
