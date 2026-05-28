# Transaction — deployment view

The Transaction module covers the Transaction Relator, Milestones, and TransactionChain. It is the smallest of the six business modules by triple count (82 triples across three TTLs). No overlay currently binds Transaction classes; BASPI5 references Transaction implicitly via Property + Seller + Buyer, but does not target Transaction shapes directly.

## Source TTL(s)

| File | Role | Physical-Ontology tier |
|---|---|---|
| [`opda-transaction.ttl`](../../../../source/03-standards/ontology/opda-transaction.ttl) | TBox: Transaction Relator, Milestone, TransactionChain | [transaction/classes.md](../../physical-ontology/transaction/classes.md) |
| [`opda-transaction-shapes.ttl`](../../../../source/03-standards/ontology/opda-transaction-shapes.ttl) | Identity-key + IC-breach shapes; SHACL-AF chain-overlap detection rule | [transaction/shapes.md](../../physical-ontology/transaction/shapes.md) |
| [`opda-transaction-annotations.ttl`](../../../../source/03-standards/ontology/opda-transaction-annotations.ttl) | DPV baseline (minimal — transactions surface PII via linked Person + Property) | [transaction/annotations.md](../../physical-ontology/transaction/annotations.md) |

## Named graph(s)

| Named graph IRI | Source TTL | Triples | `owl:versionIRI` |
|---|---|---|---|
| `https://w3id.org/opda/transaction/` | `opda-transaction.ttl` | 39 | `https://w3id.org/opda/transaction/1.0.0/` |
| `https://w3id.org/opda/transaction-shapes/` | `opda-transaction-shapes.ttl` | 37 | — |
| `https://w3id.org/opda/transaction-annotations/` | `opda-transaction-annotations.ttl` | 6 | — |

**Load order:** TBox graph imports foundation + vocabularies. Shape graph carries the `ChainOverlapDetectionRule` SHACL-AF rule that flags multi-transaction chains where chain links contradict.

## Derived-profile membership

| Profile | `opda-transaction.ttl` | `opda-transaction-shapes.ttl` | `opda-transaction-annotations.ttl` |
|---|---|---|---|
| [opda-validation](../derived-profiles/opda-validation.md) | included (classes + properties + subClassOf + labels) | included (all triples; the chain-overlap rule fires here) | excluded |
| [opda-ui](../derived-profiles/opda-ui.md) | included (all triples) | included (all triples) | included (all triples) |
| [opda-inference](../derived-profiles/opda-inference.md) | included (classical-logic axioms only) | excluded | excluded |

## Overlay bindings

**No overlay currently targets Transaction classes directly.** BASPI5 covers the property transaction surface via Property + Seller + Buyer; Transaction itself is a relational endurant that the overlay references transitively through `opda:Buyer` and `opda:Seller` participation, not via `sh:targetClass`.

A future overlay (e.g. a Land Registry conveyancing overlay) is the expected first overlay to bind Transaction; tracked in the deferred-work register at [`docs/governance/deferred-work.md`](../../../governance/deferred-work.md).

## Content-negotiation entry points

| Resource path | Resolves to |
|---|---|
| `https://w3id.org/opda/transaction/` | transaction module TBox |
| `https://w3id.org/opda/transaction/1.0.0/` | transaction versionIRI snapshot |
| `https://w3id.org/opda/transaction-shapes/` | transaction shape graph |
| `https://w3id.org/opda/transaction-annotations/` | transaction annotation graph |
| `https://w3id.org/opda/Transaction` | per-entity dereference |
| `https://w3id.org/opda/Milestone` | per-entity dereference |
| `https://w3id.org/opda/TransactionChain` | per-entity dereference |

## Deployment graph

<img src="diagrams/transaction/transaction-deployment.png" alt="Transaction module deployment graph" width="90%">

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
    accTitle: Transaction module deployment graph
    accDescr: Shows how Transaction TTLs flow through named graphs, derived profiles, and HTTP entry points. No overlay binds Transaction directly.

    classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef service fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef user fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C
    classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef external fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    subgraph SRC["Source TTLs"]
        T["opda-transaction.ttl<br/>39 triples"]:::data
        S["opda-transaction-shapes.ttl<br/>37 triples"]:::data
        A["opda-transaction-annotations.ttl<br/>6 triples"]:::data
    end

    subgraph NG["Named graphs"]
        NGT["w3id.org/opda/transaction/<br/>versionIRI 1.0.0/"]:::infra
        NGS["w3id.org/opda/transaction-shapes/"]:::infra
        NGA["w3id.org/opda/transaction-annotations/"]:::infra
    end

    subgraph CMP["Composer"]
        C["opda-gen compose"]:::process
    end

    subgraph DRV["Derived profiles"]
        DV["opda-validation.ttl<br/>ChainOverlapRule fires"]:::data
        DU["opda-ui.ttl"]:::data
        DI["opda-inference.ttl"]:::data
    end

    subgraph OVR["Overlay bindings"]
        OBN["No direct overlay binding<br/>(future: Land Registry overlay)"]:::external
    end

    subgraph HTTP["HTTP entry points"]
        H1["w3id.org/opda/transaction/"]:::service
        H2["w3id.org/opda/Transaction"]:::service
        H3["w3id.org/opda/Milestone"]:::service
        H4["w3id.org/opda/TransactionChain"]:::service
    end

    subgraph CONS["Consumers"]
        U1["SHACL validators"]:::user
        U2["DASH UI"]:::user
        U3["OWL reasoners"]:::user
    end

    T --> NGT
    S --> NGS
    A --> NGA

    NGT --> C
    NGS --> C
    NGA --> C

    C --> DV
    C --> DU
    C --> DI

    NGT -.-> OBN

    NGT --> H1
    NGT --> H2
    NGT --> H3
    NGT --> H4

    DV --> U1
    DU --> U2
    DI --> U3
```

</details>

## Cross-tier links

- **Logical tier:** [`docs/manual/logical/transaction/`](../../logical/transaction/) — typed attributes + ER diagrams for Transaction Relator and TransactionChain.
- **Physical-Ontology tier:** [`docs/manual/physical-ontology/transaction/`](../../physical-ontology/transaction/) — Turtle source layout + per-class blocks + ChainOverlap SHACL-AF rule body.
- **Operations:** [round-trip CI](../operations/round-trip-ci.md) validates Transaction exemplars (simple-transaction-with-milestones, lease-extension-transaction, chain-of-transactions).
