# OPDA Physical-Database Tier

This is the **Physical-Database tier** view of OPDA's ontology — written for triplestore operators, SPARQL endpoint consumers, downstream ontology integrators, devops engineers running the deployment, and JSON-LD client developers. It describes the **deployed/served form** of the ontology: which named graphs hold which TTLs, what load order produces a coherent graph, how derived consumer profiles compose, and how HTTP requests to `https://opda.org.uk/pdtf/<resource>` resolve to TTL / JSON-LD / RDF/XML representations.

If you have ever asked questions like:

- "Which named graph do I load to validate a BASPI5 submission?"
- "What's the difference between `opda-validation.ttl` and `opda-ui.ttl`?"
- "How does the build-step composer assemble the derived consumer profiles?"
- "What does `Accept: text/turtle` against `https://opda.org.uk/pdtf/Property` return?"
- "Which CI gate blocks a commit that introduces drift in expected SHACL reports?"

then this tier is for you. It is operational, not deliberative — the Physical-Ontology tier owns the source TTLs; this tier owns the deployment.

OPDA's ontology deploys as **24 source TTLs** (foundation + vocabularies + six module-TBoxes + six module-shapes + six module-annotations + meta-shapes + meta-annotations) plus **one overlay profile** (BASPI5). The deployment exposes these as named graphs under the persistent `https://opda.org.uk/pdtf/*` namespace via the W3C PICG redirect ratified by [ADR-0006](/modelling/adr/adr-0006).

A build-step composer ([ADR-0013](/modelling/adr/adr-0013)) projects the 24 source TTLs into **three derived consumer profiles** — `opda-validation.ttl`, `opda-ui.ttl`, `opda-inference.ttl` — and the deployment serves each via HTTP content negotiation.

## See also: Modelling section

The [PDTF overlays](/modelling/overlays) and [JSON-LD mappings](/modelling/jsonld-mappings) pages in the Modelling section cover the schema-layer artefacts that correspond to what is deployed here. The PDTF overlays page catalogues the 34 JSON Schema overlay files whose per-overlay ontology profiles are deployed as named graphs from this tier. The JSON-LD mappings page covers the authoring of the `@context` files that underpin the content-negotiation responses this tier serves.

## Reading order

1. Start with this tier overview — deployment topology + named-graph catalogue at a glance (below).
2. Read **[named-graphs.md](./named-graphs.md)** — per-named-graph layout, load order, triple counts, version IRIs.
3. Read **[derived-profiles/README.md](./derived-profiles/README.md)** — three consumer profiles (`opda-validation`, `opda-ui`, `opda-inference`) the build-step composer assembles from per-module TTLs.
4. Read **[content-negotiation/README.md](./content-negotiation/README.md)** — Accept-header routing to TTL / JSON-LD / RDF/XML / HTML per resource.
5. Read **[overlay-deployment/README.md](./overlay-deployment/README.md)** — overlay profile deployment, starting with BASPI5 (the MVP gate).
6. Read **[operations/byte-identity-ci.md](./operations/byte-identity-ci.md)**, **[operations/three-graph-ci.md](./operations/three-graph-ci.md)**, **[operations/round-trip-ci.md](./operations/round-trip-ci.md)** — the three CI gates the deployment depends on.

For "what's deployed for this module" queries, the **[modules/](./modules/)** subdirectory carries a per-module deployment view (foundation + 6 business modules). Use it when you have a module name in hand and want to chase its source TTLs, named graphs, derived-profile membership, overlay bindings, and content-negotiation entry points in one place.

## Master deployment topology

<img src="diagrams/index/master-deployment-topology.png" alt="OPDA master deployment topology" width="90%">

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
    accTitle: OPDA master deployment topology
    accDescr: Shows the 24 source TTLs plus BASPI5 overlay flowing through the build-step composer to three derived consumer profiles, then via content-negotiation SPARQL endpoint to validator UI reasoner overlay consumers.

    classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef service fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef user fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C

    subgraph SRC["Source TTLs — source/03-standards/ontology/"]
        F["foundation.ttl<br/>opda-classes.ttl<br/>opda-shapes.ttl<br/>opda-annotations.ttl"]:::infra
        V["opda-vocabularies.ttl<br/>23 SKOS schemes"]:::infra
        MT["opda-MODULE.ttl × 6<br/>property agent transaction<br/>claim governance descriptive"]:::infra
        MS["opda-MODULE-shapes.ttl × 6"]:::infra
        MA["opda-MODULE-annotations.ttl × 6"]:::infra
        B["profiles/baspi5.ttl<br/>overlay"]:::infra
    end

    subgraph CMP["Build-step composer"]
        C["opda-gen compose<br/>ADR-0013"]:::process
    end

    subgraph DRV["Derived consumer profiles"]
        DV["opda-validation.ttl<br/>classes + shapes"]:::data
        DU["opda-ui.ttl<br/>classes + shapes + annotations"]:::data
        DI["opda-inference.ttl<br/>classes only"]:::data
    end

    subgraph EP["Endpoint — opda.org.uk/pdtf/*"]
        EPHTTP["HTTP content negotiation<br/>TTL JSON-LD RDF/XML HTML"]:::service
        EPSP["SPARQL endpoint<br/>per named graph"]:::service
    end

    subgraph CON["Consumers"]
        U1["pyshacl / TopBraid<br/>SHACL validators"]:::user
        U2["DASH UI<br/>JSON-LD UI clients"]:::user
        U3["HermiT / Pellet<br/>OWL reasoners"]:::user
        U4["BASPI5 overlay<br/>round-trip harness"]:::user
        U5["Concept-tier site<br/>HTML readers"]:::user
    end

    F --> C
    V --> C
    MT --> C
    MS --> C
    MA --> C

    C --> DV
    C --> DU
    C --> DI

    DV --> EPHTTP
    DU --> EPHTTP
    DI --> EPHTTP
    B --> EPHTTP

    F --> EPSP
    V --> EPSP
    MT --> EPSP
    MS --> EPSP
    MA --> EPSP
    B --> EPSP

    EPHTTP --> U1
    EPHTTP --> U2
    EPHTTP --> U3
    EPHTTP --> U4
    EPHTTP --> U5
    EPSP --> U1
    EPSP --> U2
    EPSP --> U3
```

</details>

## CI gates pipeline

<img src="diagrams/index/ci-gates-pipeline.png" alt="CI gates pipeline" width="90%">

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
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1F5FE", "primaryTextColor": "#01579B", "primaryBorderColor": "#0277BD", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: OPDA CI gates pipeline
    accDescr: Shows the four-stage CI gate sequence with pass-fail branches and the GitHub Actions workflow files that run each stage.

    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef error fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C
    classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1

    START(["push or PR to main"]):::infra

    G1["ci-byte-identity<br/>opda-gen emit + diff -rq"]:::process
    G2["ci-three-graph<br/>5-part separation"]:::process
    G3["ci-profile-contract<br/>3-rule interface"]:::process
    G4["baspi5-round-trip<br/>27 pytest cases"]:::process

    WF1[/"ontology-byte-identity.yml"/]:::infra
    WF2[/"baspi5-round-trip.yml"/]:::infra

    PASS(["green merge"]):::success
    FAIL1(["BLOCK: emitter regressed"]):::error
    FAIL2(["BLOCK: separation violation"]):::error
    FAIL3(["BLOCK: overlay broke contract"]):::error
    FAIL4(["BLOCK: round-trip failed"]):::error

    START --> WF1
    WF1 --> G1
    G1 -->|PASS| G2
    G1 -->|FAIL| FAIL1
    G2 -->|PASS| G3
    G2 -->|FAIL| FAIL2
    G3 -->|PASS| WF2
    G3 -->|FAIL| FAIL3
    WF2 --> G4
    G4 -->|PASS| PASS
    G4 -->|FAIL| FAIL4
```

</details>

## Named-graph catalogue

The 25 named graphs the deployment exposes, grouped by role. Triple counts measured against the committed TTLs at HEAD; see [named-graphs.md](./named-graphs.md) for per-graph load order + version IRIs.

### Foundation graphs

| Named graph IRI | Source TTL | Triples |
|---|---|---|
| `https://opda.org.uk/pdtf/` (default graph) | `foundation.ttl` | 15 |
| *(no ontology IRI — class graph)* | `opda-classes.ttl` | 36 |
| `https://opda.org.uk/pdtf/graph/shapes` | `opda-shapes.ttl` | 51 |
| `https://opda.org.uk/pdtf/graph/annotations` | `opda-annotations.ttl` | 3 |

### Vocabulary graph

| Named graph IRI | Source TTL | Triples |
|---|---|---|
| *(no ontology IRI — SKOS scheme aggregate)* | `opda-vocabularies.ttl` | 873 |

### Module-TBox graphs

| Named graph IRI | Source TTL | Triples |
|---|---|---|
| `https://opda.org.uk/pdtf/graph/property` | `opda-property.ttl` | 199 |
| `https://opda.org.uk/pdtf/graph/agent` | `opda-agent.ttl` | 77 |
| `https://opda.org.uk/pdtf/graph/transaction` | `opda-transaction.ttl` | 39 |
| `https://opda.org.uk/pdtf/graph/claim` | `opda-claim.ttl` | 86 |
| `https://opda.org.uk/pdtf/graph/governance` | `opda-governance.ttl` | 42 |
| `https://opda.org.uk/pdtf/graph/descriptive` | `opda-descriptive.ttl` | 35 |

### Module-shape graphs

| Named graph IRI | Source TTL | Triples |
|---|---|---|
| `https://opda.org.uk/pdtf/graph/property-shapes` | `opda-property-shapes.ttl` | 54 |
| `https://opda.org.uk/pdtf/graph/agent-shapes` | `opda-agent-shapes.ttl` | 44 |
| `https://opda.org.uk/pdtf/graph/transaction-shapes` | `opda-transaction-shapes.ttl` | 37 |
| `https://opda.org.uk/pdtf/graph/claim-shapes` | `opda-claim-shapes.ttl` | 45 |
| `https://opda.org.uk/pdtf/graph/governance-shapes` | `opda-governance-shapes.ttl` | 13 |
| `https://opda.org.uk/pdtf/graph/descriptive-shapes` | `opda-descriptive-shapes.ttl` | 27 |

### Module-annotation graphs

| Named graph IRI | Source TTL | Triples |
|---|---|---|
| `https://opda.org.uk/pdtf/graph/property-annotations` | `opda-property-annotations.ttl` | 31 |
| `https://opda.org.uk/pdtf/graph/agent-annotations` | `opda-agent-annotations.ttl` | 22 |
| `https://opda.org.uk/pdtf/graph/transaction-annotations` | `opda-transaction-annotations.ttl` | 6 |
| `https://opda.org.uk/pdtf/graph/claim-annotations` | `opda-claim-annotations.ttl` | 27 |
| `https://opda.org.uk/pdtf/graph/governance-annotations` | `opda-governance-annotations.ttl` | 6 |
| `https://opda.org.uk/pdtf/graph/descriptive-annotations` | `opda-descriptive-annotations.ttl` | 14 |

### Overlay-profile graph

| Named graph IRI | Source TTL | Triples |
|---|---|---|
| `https://opda.org.uk/pdtf/shape/profiles/baspi5` | `profiles/baspi5.ttl` | 488 |

**Corpus total: 2 273 triples across 25 named graphs** (24 source TTLs + 1 overlay profile).

## Derived consumer profiles

The composer projects the source TTLs into three deployable consumer profiles. The directory `source/03-standards/ontology/derived/` does not yet exist (composer body activation pending per [ADR-0013](/modelling/adr/adr-0013)); each profile below documents the planned composition.

| Profile | Composition | Audience | Artefact path |
|---|---|---|---|
| [opda-validation](./derived-profiles/opda-validation.md) | classes ⊕ shapes | pyshacl / TopBraid SHACL consumers | `source/03-standards/ontology/derived/opda-validation.ttl` |
| [opda-ui](./derived-profiles/opda-ui.md) | classes ⊕ shapes ⊕ annotations | DASH form rendering, JSON-LD UI clients | `source/03-standards/ontology/derived/opda-ui.ttl` |
| [opda-inference](./derived-profiles/opda-inference.md) | classes alone | OWL 2 reasoners (HermiT, Pellet) | `source/03-standards/ontology/derived/opda-inference.ttl` |

## Per-module breakdown

For "what's deployed for this module" queries, see the per-module pages under [modules/](./modules/). Each page shows source TTL(s), named-graph declarations, derived-profile membership, overlay bindings, and content-negotiation entry points for one module, with a per-module deployment-graph diagram.

| Module | Page |
|---|---|
| Foundation | [modules/foundation.md](./modules/foundation.md) |
| Property | [modules/property.md](./modules/property.md) |
| Agent | [modules/agent.md](./modules/agent.md) |
| Transaction | [modules/transaction.md](./modules/transaction.md) |
| Claim | [modules/claim.md](./modules/claim.md) |
| Governance | [modules/governance.md](./modules/governance.md) |
| Descriptive | [modules/descriptive.md](./modules/descriptive.md) |

## CI gates

Three CI gates protect the deployment from drift. See [operations/](./operations/) for full details.

| Gate | Workflow | Command |
|---|---|---|
| [Byte-identity](./operations/byte-identity-ci.md) | `.github/workflows/ontology-byte-identity.yml` | `opda-gen ci-byte-identity` |
| [Three-graph separation](./operations/three-graph-ci.md) | `.github/workflows/ontology-byte-identity.yml` (job: `Three-graph CI test`) | `opda-gen ci-three-graph` |
| [Round-trip MVP](./operations/round-trip-ci.md) | `.github/workflows/baspi5-round-trip.yml` | `opda-gen ci-profile-contract` + `pytest tests/baspi5_round_trip` |

## What is *not* in this tier

- **Business narrative — Identity Criterion, Hard Cases** — see [Concept tier](../concept/).
- **Typed attributes, cardinalities, ER diagrams** — see [Logical tier](../logical/).
- **OWL / SHACL / SKOS Turtle source-tree layout, per-class blocks** — see [Physical-Ontology tier](../physical-ontology/).
- **PDTF JSON Schemas** at `source/03-standards/schemas/` — those were upstream Council programme input, NOT deployment output. They are documented in the nested schemas repo and are deliberately out of scope for the four-tier documentation here.

## Provenance

This documentation is generated from:

- The 24 emitted TTL files at `source/03-standards/ontology/` (`foundation.ttl`, `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`, `opda-vocabularies.ttl`, six `opda-<module>.ttl`, six `opda-<module>-shapes.ttl`, six `opda-<module>-annotations.ttl`)
- The BASPI5 overlay profile at `source/03-standards/ontology/profiles/baspi5.ttl`
- The build-step composer stub at `tools/opda-gen/src/opda_gen/composer.py` (activation pending per [ADR-0013](/modelling/adr/adr-0013))
- The two CI workflows at `.github/workflows/ontology-byte-identity.yml` and `.github/workflows/baspi5-round-trip.yml`
- The round-trip MVP harness at `tests/baspi5_round_trip/`

The `source/03-standards/ontology/derived/` directory does **not yet exist** in the repository. This tier documents the three derived profiles per [ADR-0013 §"Module pluralism"](/modelling/adr/adr-0013) as their specification — each profile file is marked "spec only; composer activation pending" until the composer body lands.
