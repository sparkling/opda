---
kind: per-module-deployment
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: physical-database
title: Claim — deployment view
---

# Claim — deployment view

The Claim module covers Claim, three Evidence subtypes (Document, ElectronicRecord, Vouch), VerificationActivity, AssuranceLevel, and TrustFramework. It is the trust-and-evidence substrate of OPDA — every other module's data ultimately rests on Claims with attached Evidence and a measurable AssuranceLevel.

## Source TTL(s)

| File | Role | Physical-Ontology tier |
|---|---|---|
| [`opda-claim.ttl`](../../../../source/03-standards/ontology/opda-claim.ttl) | TBox: Claim, Document/ElectronicRecord/Vouch Evidence, VerificationActivity, AssuranceLevel, TrustFramework | [claim/classes.md](../../physical-ontology/claim/classes.md) |
| [`opda-claim-shapes.ttl`](../../../../source/03-standards/ontology/opda-claim-shapes.ttl) | Identity-key + IC-breach shapes for Claim, Evidence, VerificationActivity | [claim/shapes.md](../../physical-ontology/claim/shapes.md) |
| [`opda-claim-annotations.ttl`](../../../../source/03-standards/ontology/opda-claim-annotations.ttl) | DPV baseline (evidence may carry PII; provenance) | [claim/annotations.md](../../physical-ontology/claim/annotations.md) |

## Named graph(s)

| Named graph IRI | Source TTL | Triples | `owl:versionIRI` |
|---|---|---|---|
| `https://opda.org.uk/pdtf/graph/claim` | `opda-claim.ttl` | 86 | `https://opda.org.uk/pdtf/harness/release/claim/1.0.0/` |
| `https://opda.org.uk/pdtf/graph/claim-shapes` | `opda-claim-shapes.ttl` | 45 | — |
| `https://opda.org.uk/pdtf/graph/claim-annotations` | `opda-claim-annotations.ttl` | 27 | — |

**Load order:** TBox graph imports foundation + vocabularies. Claim is the second-largest business module by triple count (158 across three TTLs) after Property.

## Derived-profile membership

| Profile | `opda-claim.ttl` | `opda-claim-shapes.ttl` | `opda-claim-annotations.ttl` |
|---|---|---|---|
| [opda-validation](../derived-profiles/opda-validation.md) | included (classes + properties + subClassOf + labels) | included (all triples) | excluded |
| [opda-ui](../derived-profiles/opda-ui.md) | included (all triples) | included (all triples) | included (all triples) |
| [opda-inference](../derived-profiles/opda-inference.md) | included (classical-logic axioms only) | excluded | excluded |

## Overlay bindings

**No overlay currently targets Claim classes directly.** BASPI5's Property + Address + LegalEstate shapes reference Claim transitively (any BASPI5 field that requires evidence — e.g. EPC certificate proof — points at `opda:Claim` via `opda:hasEvidence`), but no `Baspi5_ClaimShape` exists.

A future Land Registry conveyancing overlay or trust-framework-specific overlay (e.g. DIATF Trust Mark scheme) would be the natural first overlay to target `opda:VerificationActivity` and `opda:AssuranceLevel` directly.

## Content-negotiation entry points

| Resource path | Resolves to |
|---|---|
| `https://opda.org.uk/pdtf/graph/claim` | claim module TBox |
| `https://opda.org.uk/pdtf/harness/release/claim/1.0.0/` | claim versionIRI snapshot |
| `https://opda.org.uk/pdtf/graph/claim-shapes` | claim shape graph |
| `https://opda.org.uk/pdtf/graph/claim-annotations` | claim annotation graph |
| `https://opda.org.uk/pdtf/Claim` | per-entity dereference |
| `https://opda.org.uk/pdtf/Evidence` | per-entity dereference (Evidence supertype) |
| `https://opda.org.uk/pdtf/Document` | per-entity dereference |
| `https://opda.org.uk/pdtf/ElectronicRecord` | per-entity dereference |
| `https://opda.org.uk/pdtf/Vouch` | per-entity dereference |
| `https://opda.org.uk/pdtf/VerificationActivity` | per-entity dereference |
| `https://opda.org.uk/pdtf/AssuranceLevel` | per-entity dereference |
| `https://opda.org.uk/pdtf/TrustFramework` | per-entity dereference |

## Deployment graph

<img src="diagrams/claim/claim-deployment.png" alt="Claim module deployment graph" width="90%">

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
    accTitle: Claim module deployment graph
    accDescr: Shows how Claim TTLs flow through named graphs, derived profiles, and HTTP entry points. No overlay binds Claim directly.

    classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef service fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef user fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C
    classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef external fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    subgraph SRC["Source TTLs"]
        T["opda-claim.ttl<br/>86 triples"]:::data
        S["opda-claim-shapes.ttl<br/>45 triples"]:::data
        A["opda-claim-annotations.ttl<br/>27 triples"]:::data
    end

    subgraph NG["Named graphs"]
        NGT["opda.org.uk/pdtf/graph/claim<br/>versionIRI 1.0.0/"]:::infra
        NGS["opda.org.uk/pdtf/graph/claim-shapes"]:::infra
        NGA["opda.org.uk/pdtf/graph/claim-annotations"]:::infra
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
        OBN["No direct overlay binding<br/>(future: DIATF / Land Registry)"]:::external
    end

    subgraph HTTP["HTTP entry points"]
        H1["opda.org.uk/pdtf/graph/claim"]:::service
        H2["opda.org.uk/pdtf/Claim"]:::service
        H3["opda.org.uk/pdtf/Evidence"]:::service
        H4["opda.org.uk/pdtf/VerificationActivity"]:::service
        H5["opda.org.uk/pdtf/AssuranceLevel"]:::service
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
    NGT --> H5

    DV --> U1
    DU --> U2
    DI --> U3
```

</details>

## Cross-tier links

- **Logical tier:** [`docs/manual/logical/claim/`](../../logical/claim/) — typed attributes + ER diagrams for Claim, Evidence subtypes, AssuranceLevel.
- **Physical-Ontology tier:** [`docs/manual/physical-ontology/claim/`](../../physical-ontology/claim/) — Turtle source layout + per-class blocks.
- **Operations:** [round-trip CI](../operations/round-trip-ci.md) validates Claim exemplars (claim-with-document-evidence, claim-with-electronic-record-evidence, claim-with-vouch-evidence).
