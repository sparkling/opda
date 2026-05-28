---
status: proposed
date: 2026-05-28
tags: [logical-model, agent]
---

# Agent module

Substantial Agents (Person, Organisation), the anti-rigid Roles they play (Buyer, Seller, Proprietor), the Relator that mediates Property ownership (Proprietorship), and the lifecycle event that mutates Person identity (NameChangeEvent).

## Entity inventory

| Entity | UFO meta-category | Notes |
|---|---|---|
| [Buyer](./buyer.md) | RoleMixin | Cross-sortal — borne by Person OR Organisation; founded by Transaction |
| [NameChangeEvent](./name-change-event.md) | Event particular | Reified Person name-change event; identity PERSISTS |
| [Organisation](./organisation.md) | Substance Kind | FIBO LegalEntity pattern; subclass of `org:Organization` |
| [Person](./person.md) | Substance Kind | Natural person; PII anchor under DPV co-annotation |
| [Proprietor](./proprietor.md) | Role | Sortal — borne by Person (with named sub-Role for Organisation); founded by Proprietorship |
| [Proprietorship](./proprietorship.md) | Relator | Mediates Property + Proprietor against a RegisteredTitle |
| [Seller](./seller.md) | RoleMixin | Cross-sortal — borne by Person OR Organisation; founded by Transaction |

## Enumerations bound by this module

| Scheme | Used by attribute | Closed/Open |
|---|---|---|
| [OwnerTypeScheme](./enumerations/owner-type-scheme.md) | `Proprietor.ownerType` | Closed (2 members) |
| [ParticipantStatusScheme](./enumerations/participant-status-scheme.md) | Participant lifecycle (overlay profiles) | Closed (4 members) |
| [RoleScheme](./enumerations/role-scheme.md) | `RoleMixin.role` notation surface | Closed (11 members) |
| [SellersCapacityScheme](./enumerations/sellers-capacity-scheme.md) | `Seller.hasAssertedCapacity` | Closed (5 members) |

The agent module also reuses [`YesNoScheme`](../property/enumerations/yes-no-scheme.md) for the `Seller.hasOthersAged17OrOver` attribute.

## ER diagram

![agent-module--entity-relationship-diagram](diagrams/README/agent-module--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Agent Module — Entity-Relationship Diagram
    accDescr: Agent module entities (Person, Organisation as Substance Kinds; Buyer, Seller, Proprietor as Roles; Proprietorship as Relator) plus NameChangeEvent and Claim link.

    Seller }o--|| Person : "borneBy"
    Seller }o--|| Organisation : "borneBy"
    Buyer }o--|| Person : "borneBy"
    Buyer }o--|| Organisation : "borneBy"
    Proprietorship }o--|| RegisteredTitle : "bindsTitle"
    Proprietorship ||--o{ Proprietor : "founds"
    Proprietor }o--|| Person : "borneBy"
    Proprietor }o--|| Organisation : "borneBy (sub-Role)"
    NameChangeEvent }o--|| Person : "prov:wasAssociatedWith"
    Seller ||--o{ Claim : "hasEvidencedAuthority"
```

</details>

Source file: [`../diagrams/agent-er.mmd`](../diagrams/agent-er.mmd).

## Class hierarchy

OWL/RDFS subclass relationships. Person and Organisation are Substance Kinds (Organisation subclasses `org:Organization`). Buyer, Seller, Proprietor specialise foundation Role and RoleMixin meta-classes. Proprietorship specialises Relator. NameChangeEvent specialises `prov:Activity`.

![agent-module--class-hierarchy](diagrams/README/agent-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Agent Module — Class Hierarchy
    accDescr: OWL/RDFS subclass relationships — Person and Organisation as substantial Kinds, Buyer and Seller as RoleMixins, Proprietor as Role, Proprietorship as Relator, NameChangeEvent as PROV-O Activity.

    class orgOrganization["org:Organization"]
    class Role
    class RoleMixin
    class Relator
    class provActivity["prov:Activity"]

    class Person {
        hasAssertedCapacity
        hasSpecialCategoryData
    }
    class Organisation {
        hasAssertedCapacity
    }
    class Buyer {
        role
    }
    class Seller {
        hasAssertedCapacity
        hasOthersAged17OrOver
        role
    }
    class Proprietor {
        ownerType
        role
    }
    class Proprietorship {
        joint-tenancy discriminator
    }
    class NameChangeEvent {
        prov:atTime
    }

    orgOrganization <|-- Organisation
    RoleMixin <|-- Buyer
    RoleMixin <|-- Seller
    Role <|-- Proprietor
    Relator <|-- Proprietorship
    provActivity <|-- NameChangeEvent
```

</details>

## Identity-key summary

![agent-module--identity-key-summary](diagrams/README/agent-module--identity-key-summary.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Agent Module — Identity-Key Summary
    accDescr: Identity Criterion key surfaces for the seven agent-module entities — FIBO multi-identifier bundle for Person and Organisation, parasitic identity for Buyer/Seller/Proprietor Roles, Relator-tuple for Proprietorship, PROV-O tuple for NameChangeEvent.

    classDef icCell fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef entityCell fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    PersonE[Person]:::entityCell -->|"IC"| PIC["FIBO multi-identifier bundle<br/>NI + passport + driving-licence<br/>+ name + DoB"]:::icCell
    OrganisationE[Organisation]:::entityCell -->|"IC"| OIC["registration-record bundle<br/>LEI + Companies House CRN"]:::icCell
    BuyerE[Buyer]:::entityCell -->|"IC"| BIC["bearer-identity +<br/>founding Transaction<br/>(parasitic, NEVER keyed)"]:::icCell
    SellerE[Seller]:::entityCell -->|"IC"| SIC["bearer-identity +<br/>founding Transaction<br/>(parasitic, NEVER keyed)"]:::icCell
    ProprietorE[Proprietor]:::entityCell -->|"IC"| PrIC["bearer-identity +<br/>founding Proprietorship<br/>(parasitic, NEVER keyed)"]:::icCell
    ProprietorshipE[Proprietorship]:::entityCell -->|"IC"| PsIC["(RegisteredTitle,<br/>Persons-set)"]:::icCell
    NameChangeEventE[NameChangeEvent]:::entityCell -->|"IC"| NCIC["(Person,<br/>prov-timestamp)"]:::icCell
```

</details>
