---
status: proposed
date: 2026-05-28
tags: [logical-model, foundation]
---

# Foundation module

Cross-cutting entities used by every other module: the three UFO meta-classes (Role, RoleMixin, Relator); the validation-context reification used by overlay profiles; the generator-run provenance unit used by CI byte-identity checks; and the diagnostic exemplar entity used by the A9 per-kind discipline.

## Entity inventory

| Entity | UFO meta-category | Purpose |
|---|---|---|
| [DiagnosticExemplar](./diagnostic-exemplar.md) | Substance Kind (informational) | Named hard case exposing one IC-bearing surface to a Council session |
| [GeneratorRun](./generator-run.md) | Information particular | Provenance unit for byte-identity CI; one record per opda-gen execution |
| [Relator](./relator.md) | Meta-class (UFO Relator) | Relational endurant mediating two or more bearers; founded by an event |
| [Role](./role.md) | Meta-class (UFO Role) | Anti-rigid, sortal role borne by a single substantial Kind |
| [RoleMixin](./role-mixin.md) | Meta-class (UFO RoleMixin) | Anti-rigid, cross-sortal role pattern borne by more than one Kind |
| [ValidationContext](./validation-context.md) | Substance Kind (informational) | Reified overlay-profile context per ODR-0010 §Q1 |

The foundation module also declares one DatatypeProperty whose domain is intentionally unconstrained (so any Kind may bear it):

- `opda:hasSpecialCategoryData` — flag indicating GDPR Article 9/10 special-category personal data. Range: `boolean`. Targeted by the `SpecialCategoryPIIWithoutLawfulBasisShape` SHACL shape in the [agent module](../agent/person.md#constraints).

This module has no SKOS enumerations of its own; downstream modules import the foundation graph and bind their attributes to schemes in [`../property/enumerations/`](../property/enumerations/), [`../agent/enumerations/`](../agent/enumerations/), etc.

## ER diagram

The foundation classes are largely standalone — they are meta-classes referenced by per-module Kinds rather than peers in entity-relationship networks. The diagram below shows the meta-class subclass spine (which downstream Roles and Relators specialise).

![foundation-module--entity-relationship-diagram](diagrams/README/foundation-module--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Foundation Module — Entity-Relationship Diagram
    accDescr: Six foundation entities (UFO meta-classes Role/RoleMixin/Relator, plus ValidationContext, GeneratorRun, DiagnosticExemplar) and their specialisation links to downstream module Kinds.

    Role ||--o{ Proprietor : "specialised by"
    RoleMixin ||--o{ Seller : "specialised by"
    RoleMixin ||--o{ Buyer : "specialised by"
    Relator ||--o{ Transaction : "specialised by"
    Relator ||--o{ Proprietorship : "specialised by"
    ValidationContext ||--o{ BASPI5Profile : "reifies (per overlay)"
    GeneratorRun ||--o{ EmittedArtefact : "produces (per opda-gen run)"
    DiagnosticExemplar }o--o{ Property : "exemplifies"
    DiagnosticExemplar }o--o{ LegalEstate : "exemplifies"
```

</details>

Source file: [`../diagrams/foundation-er.mmd`](../diagrams/foundation-er.mmd).

## Class hierarchy

The foundation module's OWL/RDFS subclass relationships. Meta-classes (Role, RoleMixin, Relator) are specialised by concrete Kinds across downstream modules. ValidationContext, GeneratorRun, DiagnosticExemplar are class-level declarations without their own subclass hierarchy.

![foundation-module--class-hierarchy](diagrams/README/foundation-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Foundation Module — Class Hierarchy
    accDescr: OWL/RDFS subclass relationships in the foundation module. Three meta-classes (Role, RoleMixin, Relator) are specialised by concrete downstream module entities.

    class Role {
        meta-class
        sortal anti-rigid role
        borneBy : single Kind
    }
    class RoleMixin {
        meta-class
        cross-sortal anti-rigid
        borneBy : multiple Kinds
    }
    class Relator {
        meta-class
        relational endurant
        mediates : 2..* bearers
    }
    class ValidationContext {
        profileURI : uri
        requires : Class
        sourcedFrom : uri
        formVersion : string
    }
    class GeneratorRun {
        generatorVersion : string
        sourceCommit : string
        emittedAt : dateTime
    }
    class DiagnosticExemplar {
        named hard case
        inline Turtle content
    }
    class Proprietor {
        ownerType
        role
    }
    class Seller {
        hasAssertedCapacity
        hasOthersAged17OrOver
        role
    }
    class Buyer {
        role
    }
    class Transaction {
        occurredAtTime
    }
    class Proprietorship {
        joint-tenancy discriminator
    }

    Role <|-- Proprietor
    RoleMixin <|-- Seller
    RoleMixin <|-- Buyer
    Relator <|-- Transaction
    Relator <|-- Proprietorship
```

</details>

## Identity-key summary

Foundation entities are mostly identity-less meta-classes; concrete entity IC surfaces are summarised below.

![foundation-module--identity-key-summary](diagrams/README/foundation-module--identity-key-summary.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Foundation Module — Identity-Key Summary
    accDescr: Identity Criterion key surfaces for the six foundation entities. Meta-classes (Role, RoleMixin, Relator) carry no IC of their own; concrete entities each have one identity-bearing attribute or tuple.

    classDef icCell fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef entityCell fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    RoleE[Role]:::entityCell -->|"IC"| RoleIC["no IC at meta-class<br/>parasitic via bearer + Relator"]:::icCell
    RoleMixinE[RoleMixin]:::entityCell -->|"IC"| RMIC["no IC at meta-class<br/>parasitic via bearer + Relator"]:::icCell
    RelatorE[Relator]:::entityCell -->|"IC"| RelIC["(mediated-bearers-set,<br/>founding-event)"]:::icCell
    ValidationContextE[ValidationContext]:::entityCell -->|"IC"| VCIC["profileURI"]:::icCell
    GeneratorRunE[GeneratorRun]:::entityCell -->|"IC"| GRIC["generatorVersion + sourceCommit"]:::icCell
    DiagnosticExemplarE[DiagnosticExemplar]:::entityCell -->|"IC"| DEIC["exemplar name<br/>(URI fragment)"]:::icCell
```

</details>
