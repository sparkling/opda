---
status: proposed
date: 2026-05-28
tags: [physical-ontology, transaction, module]
---

# Transaction module

The Transaction module emits 3 OWL classes: 1 Relator (Transaction), 1 Event particular (Milestone), and 1 Aggregate (TransactionChain).

## Files

| File | Role | Source |
|---|---|---|
| `opda-transaction.ttl` | 3 OWL classes + 2 DatatypeProperties + 1 ObjectProperty | [opda-transaction.ttl](../../../../source/03-standards/ontology/opda-transaction.ttl) |
| `opda-transaction-shapes.ttl` | 2 identity-key + 2 SHACL-AF rules | [opda-transaction-shapes.ttl](../../../../source/03-standards/ontology/opda-transaction-shapes.ttl) |
| `opda-transaction-annotations.ttl` | Header-only (no class-level baseline) | [opda-transaction-annotations.ttl](../../../../source/03-standards/ontology/opda-transaction-annotations.ttl) |

## Ontology header

```turtle
<https://w3id.org/opda/transaction/>
    rdf:type owl:Ontology ;
    dct:title "OPDA Transaction Module"@en ;
    owl:imports <https://w3id.org/opda/1.0.0/>, <https://w3id.org/opda/vocabularies/> ;
    owl:versionIRI <https://w3id.org/opda/transaction/1.0.0/> .
```

## Import chain

- `<https://w3id.org/opda/1.0.0/>` — foundation (Relator meta-class)
- `<https://w3id.org/opda/vocabularies/>` — SKOS schemes (MilestoneKind, TransactionStatus)

External vocabularies referenced (not imported):
- `prov:Activity` — superclass of `opda:Milestone`; pattern for `opda:Transaction` lifecycle

## Classes (3)

| Class | UFO category | Cardinality cap |
|---|---|---|
| `opda:Milestone` | Event particular (PROV-O Activity) | Hybrid instant/interval (S007 Q2) |
| `opda:Transaction` | Relator (FIBO Arrangement precedent) | 5-tuple IC |
| `opda:TransactionChain` | Aggregate | chain-length cap: `sh:maxInclusive 7` (CLC data) |

See [`classes.md`](./classes.md) for per-class blocks.

## Module class hierarchy

![transaction-module--class-hierarchy](diagrams/README/transaction-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Transaction module — class hierarchy
    accDescr: Three OWL classes. Milestone subclasses prov:Activity. Transaction subclasses opda:Relator (foundation UFO meta-class). TransactionChain is an Aggregate (no subclass).

    class provActivity["prov_Activity (external)"]
    class Relator["opda_Relator (foundation)"]

    class Milestone["opda_Milestone"] {
        owl_Class
        UFO Event particular
    }
    class Transaction["opda_Transaction"] {
        owl_Class
        UFO Relator
        FIBO Arrangement precedent
    }
    class TransactionChain["opda_TransactionChain"] {
        owl_Class
        UFO Aggregate
        sh_maxInclusive 7
    }

    provActivity <|-- Milestone : rdfs_subClassOf
    Relator <|-- Transaction : rdfs_subClassOf
```

</details>

## Module shape-target graph

![transaction-shapes-and-their-target-classes](diagrams/README/transaction-shapes-and-their-target-classes.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E8F5E9", "primaryTextColor": "#1B5E20", "primaryBorderColor": "#2E7D32", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Transaction shapes and their target classes
    accDescr: Two identity-key shapes plus two SHACL-AF rules. Shapes target Milestone, Transaction, and LeaseTerm (from the Property module — shape lives here because it pairs with MilestoneVarianceRule per ODR-0007 Q5).

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix sh: <http://www.w3.org/ns/shacl#>

    classDef shape fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,stroke-dasharray:5 5,color:#1B5E20
    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef rule fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B

    S1[opda:MilestoneIdentityKeyShape]:::shape
    S2[opda:TransactionIdentityKeyShape]:::shape
    R1[opda:LeaseTermSuccessionRule]:::rule
    R2[opda:MilestoneVarianceRule]:::rule

    C1[opda:Milestone]:::cls
    C2[opda:Transaction]:::cls
    C3[opda:LeaseTerm]:::cls

    S1 -->|sh:targetClass| C1
    S2 -->|sh:targetClass| C2
    R1 -->|sh:targetClass| C3
    R2 -->|sh:targetClass| C1
```

</details>

## Module DPV co-annotation graph

![transaction-module--dpv-co-annotations-header-only](diagrams/README/transaction-module--dpv-co-annotations-header-only.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E0F2F1", "primaryTextColor": "#004D40", "primaryBorderColor": "#00695C", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Transaction module — DPV co-annotations (header-only)
    accDescr: No class-level DPV baselines in the Transaction module. PII flows through participating Person and Organisation roles (Agent module) and through the Property side (Property module). The header documents the cross-module routing.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix dpv-pd: <https://w3id.org/dpv/pd#>

    classDef note fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238
    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef pii fill:#E0F2F1,stroke:#00695C,stroke-width:2px,color:#004D40

    T[opda:Transaction<br/>no class-level baseline]:::note
    M[opda:Milestone<br/>no class-level baseline]:::note
    TC[opda:TransactionChain<br/>no class-level baseline]:::note

    APers[opda:Person — agent module]:::pii
    AOrg[opda:Organisation — agent module]:::pii
    PAddr[opda:Property / Address — property module]:::pii

    T -.->|PII via participants| APers
    T -.->|PII via participants| AOrg
    T -.->|PII via subject Property| PAddr
    M -.->|inherits routing| T
    TC -.->|inherits routing| T
```

</details>

## SHACL shapes (4 + 2 rules)

| Shape | Severity | Category |
|---|---|---|
| `opda:MilestoneIdentityKeyShape` | Violation | Cat 1 |
| `opda:TransactionIdentityKeyShape` | Violation | Cat 1 |
| `opda:LeaseTermSuccessionRule` | Info | SHACL-AF |
| `opda:MilestoneVarianceRule` | Info | SHACL-AF (with dynamic variance status) |

See [`shapes.md`](./shapes.md) for per-shape blocks.

## DPV annotations

Header-only. Transactions, Milestones, and TransactionChains are UFO Relators and event particulars — they are not personal data themselves. PII flows through participating Person / Organisation roles (see [`agent/annotations.md`](../agent/annotations.md)) and through the Property side (see [`property/annotations.md`](../property/annotations.md)).

See [`annotations.md`](./annotations.md).

## Source ODR + ADR

- [ODR-0007 — Transactions and lifecycle](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ODR-0017 — SHACL-AF quality rules pattern](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
