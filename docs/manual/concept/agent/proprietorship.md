# Proprietorship

A Proprietorship is the **binding** that links one or more Proprietors to a Registered Title. It is a Relator: it carries its own properties (joint tenancy vs tenants in common; ownership shares; registration date) that don't belong to any single Proprietor.

## Why it matters

The joint-vs-tenants-in-common question is a property *of the binding*, not of any individual Proprietor. Two co-owners of a Property might be joint tenants today and tenants in common tomorrow (severance changes the binding, not the owners). OPDA puts that discriminator on the Proprietorship Relator precisely so it can be modified, queried, and validated without rewriting either Proprietor's record.

If you are a conveyancer working with joint ownership or HMLR Practice Guide 24 distinctions, this is the entity whose IC matters.

## Hard cases

- **Severance of joint tenancy.** The owners stay the same; the binding type changes from joint tenancy to tenants in common. The Proprietorship's IC accommodates the change without forking either Proprietor or the Title.
- **Addition of a Proprietor.** A second owner is added to the Title. The Proprietorship's IC tracks the (Title, Persons-set) — the set has changed, so this is a *new* Proprietorship binding (with provenance to the predecessor), not a mutation of the existing one.
- **Death of a joint tenant.** Joint tenancy passes by survivorship to the remaining tenant(s). The Proprietorship's IC reflects the new (Title, Persons-set); a Proprietorship with a single remaining tenant is a successor binding.

## Identity Criterion

Two records refer to the same Proprietorship if they describe the same **(Title, Persons-set) tuple** at the same point in the registry record's lineage. A change in the set of Persons — addition, removal, death — produces a successor Proprietorship, linked by a provenance chain to its predecessor. See the [Logical tier →](../../logical/agent/proprietorship.md) for the typed structure.

### IC walk-through: severance vs Persons-set change

The discriminator (joint tenancy vs tenants in common) is a property of the binding, not of any Proprietor; a Persons-set change produces a successor binding:

![proprietorship-ic-decision-flow](diagrams/proprietorship/proprietorship-ic-decision-flow.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TD
    accTitle: Proprietorship IC decision flow
    accDescr: Decision tree for Proprietorship identity — severance of joint tenancy preserves the binding (only the discriminator changes); addition, removal, or death of a Proprietor changes the Persons-set, producing a successor Proprietorship linked by provenance.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17

    Start(["Event affecting<br/>Proprietorship"]):::cls
    Q1{"Persons-set changes<br/>(add / remove / death)?"}:::cls
    Q2{"Severance only<br/>(joint → TIC,<br/>same Persons)?"}:::cls

    Successor(["NEW Proprietorship<br/>(successor binding,<br/>prov-linked)"]):::warning
    SamePerson(["SAME Proprietorship<br/>(discriminator changes,<br/>Persons-set unchanged)"]):::success
    Persists(["SAME Proprietorship<br/>(routine update)"]):::success

    Start --> Q1
    Q1 -->|"Yes"| Successor
    Q1 -->|"No"| Q2
    Q2 -->|"Yes"| SamePerson
    Q2 -->|"No"| Persists
```

</details>

## Related Kinds

- [Relator](../foundation/relator.md) — Proprietorship is the canonical OPDA Relator (alongside Transaction)
- [Proprietor](./proprietor.md) — the Roles bound by a Proprietorship
- [Registered Title](../property/registered-title.md) — the registry-side context

### Related-Kinds graph

![proprietorship-related-kinds-neighbourhood-graph](diagrams/proprietorship/proprietorship-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Proprietorship related-Kinds neighbourhood graph
    accDescr: Proprietorship as the Relator binding one or more Proprietor Roles to a Registered Title; specialises the Relator pattern.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    Proprietorship["Proprietorship<br/>(Relator)"]:::centre
    Proprietor["Proprietor<br/>(1..*)"]:::cls
    Title["RegisteredTitle"]:::cls
    Relator["Relator<br/>(pattern)"]:::ext

    Proprietorship -->|"bears (1..*)"| Proprietor
    Proprietorship -->|"binds"| Title
    Proprietorship -.->|"specialises"| Relator
```

</details>

## Source ODR

[ODR-0006 — Agents and roles §Q3](../../../ontology/odr/ODR-0006-agents-and-roles.md)
