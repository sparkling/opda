# Descriptive

The Descriptive module covers the authority-issued artefacts that ride alongside a Property in a transaction: surveys, valuations, EPC certificates, searches, and the comparables that support a valuation.

Each of these was *promoted from a flat attribute bag to a first-class Kind* by the Council's S008 Q4 three-criterion test: authority-issued provenance chain; distinct lifecycle (issued / superseded / withdrawn); distinct PII regime or distinct downstream consumer treatment. Anything that fails any one criterion stays as a flat attribute on the Property; anything that satisfies all three lives here.

## Entities

- [Comparable](./comparable.md) — comparable-sale or comparable-rental supporting a Valuation
- [EPC Certificate](./epc-certificate.md) — DESNZ-governed Energy Performance Certificate
- [Search](./search.md) — local-authority or environmental search result
- [Survey](./survey.md) — professional property survey report
- [Valuation](./valuation.md) — RICS-regulated or automated-model property valuation

## Module-internal relationships

The five descriptive Kinds, each riding alongside a Property with its own authority chain and lifecycle; Valuation cites Comparables; Survey often informs Valuation:

![descriptive-module-internal-relationships](diagrams/README/descriptive-module-internal-relationships.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Descriptive module internal relationships
    accDescr: EPC, Survey, Valuation, Search, and Comparable as the five first-class authority-issued descriptive Kinds concerning a Property; Valuation cites Comparables; Survey informs Valuation; each has its own DESNZ/RICS/Land-Registry/VOA authority chain.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    %% Descriptive Kinds
    EPC["EPC Certificate<br/>(DESNZ)"]:::cls
    Survey["Survey<br/>(RICS surveyor)"]:::cls
    Valuation["Valuation<br/>(RICS or AVM)"]:::cls
    Search["Search<br/>(CON29R / LLC1 / etc.)"]:::cls
    Comparable["Comparable<br/>(Land Registry / VOA)"]:::cls

    %% Cross-module
    Property["Property<br/>(property module)"]:::ext

    %% Property-ride-alongs
    EPC -->|"concerns"| Property
    Survey -->|"concerns"| Property
    Valuation -->|"concerns"| Property
    Search -->|"concerns"| Property

    %% Valuation evidence chain
    Valuation -->|"cites (0..*)"| Comparable
    Comparable -->|"sourced from"| Property
    Survey -.->|"informs (often)"| Valuation
```

</details>

## Lifecycle: Descriptive-artefact issued-superseded-withdrawn

The shared lifecycle pattern across all five descriptive Kinds — each authority issues, may supersede on re-issue, may withdraw:

![descriptive-artefact-lifecycle](diagrams/README/descriptive-artefact-lifecycle.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
stateDiagram-v2
    accTitle: Descriptive artefact lifecycle
    accDescr: Shared issued-superseded-withdrawn lifecycle pattern across EPC, Survey, Valuation, Search, and Comparable — each persists in the audit trail with provenance links to predecessors and successors.

    [*] --> Instructed : ordered or<br/>commissioned

    Instructed --> Issued : authority returns artefact
    Issued --> Current : in-validity-window

    Current --> Current : routine consumption<br/>(no lineage change)
    Current --> Superseded : fresh issuance<br/>by same authority
    Current --> Withdrawn : authority withdraws<br/>(governance, error)
    Current --> Expired : validity-window<br/>elapses (e.g. EPC 10y)

    Superseded --> [*] : record persists,<br/>successor linked
    Withdrawn --> [*] : record persists,<br/>annotation flag set
    Expired --> [*] : record persists,<br/>status flag set
```

</details>
