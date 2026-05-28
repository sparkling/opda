# Foundation

The Foundation module contains cross-cutting kinds reused across every other OPDA module. Some are infrastructural (Diagnostic Exemplar, Generator Run, Validation Context); others are abstract pattern-bearers (Role, Role Mixin, Relator) that downstream modules specialise.

Read this module first if you want to understand *why* OPDA distinguishes a `Proprietor` (Role) from a `Seller` (Role Mixin) from a `Proprietorship` (Relator), or *what* a Validation Context buys you when a profile says a field is "required (depending)".

## Entities

- [Diagnostic Exemplar](./diagnostic-exemplar.md) — minimal worked-example data exposing one Identity-Criterion-bearing surface for Council validation
- [Generator Run](./generator-run.md) — a single execution of the opda-gen pipeline that produced a specific set of emitted ontology files
- [Relator](./relator.md) — a relational kind that mediates two or more parties and is founded by an external event
- [Role](./role.md) — a role borne by a single underlying Kind
- [Role Mixin](./role-mixin.md) — a role borne by more than one underlying Kind
- [Validation Context](./validation-context.md) — the named overlay profile under which a record was validated

## Module-internal relationships

How the foundation Kinds connect to one another and to the downstream Kinds in other modules:

![foundation-module-internal-relationships](diagrams/README/foundation-module-internal-relationships.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Foundation module internal relationships
    accDescr: Three pattern-bearing Kinds (Role, RoleMixin, Relator) and three infrastructural Kinds (ValidationContext, DiagnosticExemplar, GeneratorRun); arrows show which downstream Kinds specialise each pattern and how build-pipeline records connect.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    %% Foundation Kinds
    Relator["Relator"]:::cls
    Role["Role"]:::cls
    RoleMixin["RoleMixin"]:::cls
    ValidationContext["ValidationContext"]:::cls
    DiagnosticExemplar["DiagnosticExemplar"]:::cls
    GeneratorRun["GeneratorRun"]:::cls

    %% Downstream specialisations (faded — defined in other modules)
    Transaction["Transaction<br/>(specialises Relator)"]:::ext
    Proprietorship["Proprietorship<br/>(specialises Relator)"]:::ext
    Proprietor["Proprietor<br/>(specialises Role)"]:::ext
    Seller["Seller<br/>(specialises RoleMixin)"]:::ext
    Buyer["Buyer<br/>(specialises RoleMixin)"]:::ext

    %% Pattern hierarchy
    Role -->|"bornBy a single Kind"| RoleMixin
    Role -->|"sitsWithin"| Relator
    RoleMixin -->|"sitsWithin"| Relator

    %% Specialisation arrows
    Relator -.->|"specialised by"| Transaction
    Relator -.->|"specialised by"| Proprietorship
    Role -.->|"specialised by"| Proprietor
    RoleMixin -.->|"specialised by"| Seller
    RoleMixin -.->|"specialised by"| Buyer

    %% Infrastructure trio
    GeneratorRun -->|"emits"| ValidationContext
    GeneratorRun -->|"emits"| DiagnosticExemplar
    ValidationContext -->|"validatedAgainst"| DiagnosticExemplar
```

</details>
