---
entityUri: opda:Organisation
kind: entity
module: agent
sourceTtl: source/03-standards/ontology/opda-agent.ttl
tier: concept
title: Organisation
---

# Organisation

An Organisation is a corporate or unincorporated body party to a property transaction — a limited company, an LLP, a charity, a trust, a public body. Organisations can be Sellers, Buyers, Proprietors, and Conveyancers.

## Why it matters

A non-trivial share of UK residential transactions involves an Organisation on at least one side — buy-to-let landlords as limited companies, housing associations, family trusts, executors of estates, charities receiving bequests. The model must treat an Organisation as a first-class party (with its own multi-identifier IC) and let the same transactional roles (Seller / Buyer / Proprietor) be borne by either kind of party. This is why those roles are Role Mixins (cross-Kind), not plain Roles.

If you are an integrator implementing AML/KYC for corporate parties, this is the entity whose IC governs your dedup.

## Hard cases

- **Merger.** Two companies merge into one. Per Kendall's S005 Q4 framing, the merger produces a *new* Organisation individual with a `prov:wasDerivedFrom` chain to the predecessors — not a continuation of either predecessor.
- **Demerger.** One company demerges into two. Two new Organisations, each with a derivation chain to the predecessor.
- **Dissolution.** An Organisation dissolves. The record persists as a ceased-entity record; it does not vanish from the audit trail.
- **Multi-jurisdiction identifiers.** One Organisation carries a UK Companies House Registration Number (CRN), a Legal Entity Identifier (LEI), and potentially other jurisdiction-issued IDs. The IC accommodates multiple identifiers for one Kind — FIBO LegalEntity pattern.

## Identity Criterion

Two records refer to the same Organisation if they describe the same legal entity via **a FIBO LegalEntity-style multi-identifier match** (CRN, LEI, jurisdiction-specific IDs). A merger or demerger produces a *new* Organisation linked via provenance chain — never collapsed onto either predecessor. See the [Logical tier →](../../logical/agent/organisation.md) for the typed structure.

### IC walk-through: merger / demerger / dissolution

Per S005 Q4, neither merger nor demerger continues an existing Organisation — both produce *new* Organisations linked by provenance:

![organisation-ic-merger-and-demerger-decision-flow](diagrams/organisation/organisation-ic-merger-and-demerger-decision-flow.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TD
    accTitle: Organisation IC merger and demerger decision flow
    accDescr: Decision tree for Organisation identity across structural change — merger produces a new Organisation with prov:wasDerivedFrom links to predecessors; demerger produces multiple new Organisations linked back to the predecessor; dissolution preserves the record as ceased.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef errorState fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C

    Start(["Structural event<br/>on Organisation"]):::cls
    Q1{"Merger<br/>(N companies → 1)?"}:::cls
    Q2{"Demerger<br/>(1 company → N)?"}:::cls
    Q3{"Dissolution?"}:::cls

    NewMerged(["NEW Organisation;<br/>predecessors linked via<br/>prov:wasDerivedFrom"]):::warning
    NewDemerged(["N NEW Organisations;<br/>each linked to predecessor<br/>via prov:wasDerivedFrom"]):::warning
    Ceased(["Organisation persists<br/>as CEASED record"]):::errorState
    Persists(["Organisation persists<br/>(routine update)"]):::success

    Start --> Q1
    Q1 -->|"Yes"| NewMerged
    Q1 -->|"No"| Q2
    Q2 -->|"Yes"| NewDemerged
    Q2 -->|"No"| Q3
    Q3 -->|"Yes"| Ceased
    Q3 -->|"No"| Persists
```

</details>

## Related Kinds

- [Person](./person.md) — the other party Kind that can bear transactional roles
- [Proprietor](./proprietor.md) — the Role an Organisation can bear (under a named specialisation) when registered as owner
- [Seller](./seller.md) — the Role Mixin an Organisation can bear when disposing of a Property
- [Buyer](./buyer.md) — the Role Mixin an Organisation can bear when acquiring a Property

### Related-Kinds graph

![organisation-related-kinds-neighbourhood-graph](diagrams/organisation/organisation-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Organisation related-Kinds neighbourhood graph
    accDescr: Organisation as the corporate alternative bearer for the three transactional roles — Seller, Buyer, Proprietor — mirroring Person; structural events handled by prov:wasDerivedFrom chains.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    Organisation["Organisation"]:::centre
    Person["Person"]:::cls
    Seller["Seller"]:::cls
    Buyer["Buyer"]:::cls
    Proprietor["Proprietor<br/>(specialisation)"]:::cls

    Seller -->|"borneBy"| Organisation
    Buyer -->|"borneBy"| Organisation
    Proprietor -->|"borneBy (specialisation)"| Organisation
    Organisation -.->|"alternative bearer to"| Person
```

</details>

## Source ODR

[ODR-0006 — Agents and roles §Q6](/modelling/odr/odr-0006)
