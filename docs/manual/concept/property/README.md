# Property

The Property module is the Identity-Criterion crux of OPDA. It distinguishes:

- the **physical Property** (a house, a flat — bricks and mortar);
- the **Legal Estate** vested in it (the rights bundle — Freehold, Leasehold, Commonhold);
- the **Registered Title** that documents the Legal Estate at HMLR;
- the **Address** that locates the Property (in any of several authority-issued forms: title, marketing, INSPIRE).

These four are routinely conflated in property data. OPDA keeps them separate because they have *different* Identity Criteria: a Property can persist while its Title is closed and reopened; a Title can persist through a Lease Extension that mutates (but does not break) the Legal Estate; an Address can change without the Property changing.

This module also contains two reified lifecycle events — **Lease Extension Event** and **UPRN Succession Event** — that record administrative changes which, importantly, do *not* break the underlying Property or Legal Estate identity.

## Entities

- [Address](./address.md) — an authority-issued locator for a Property
- [Lease Extension Event](./lease-extension-event.md) — a statutory lease-extension event that mutates a leasehold's term without breaking its identity
- [Lease Term](./lease-term.md) — the time interval bounding a leasehold tenure
- [Legal Estate](./legal-estate.md) — the bundle of legal rights vested in a Property
- [Property](./property.md) — the physical residential property
- [Registered Title](./registered-title.md) — the HMLR title-register record documenting a Legal Estate

## Module-internal relationships

The Property quartet (Property — LegalEstate — RegisteredTitle — Address) and the two reified identity-preserving lifecycle events:

![property-module-internal-relationships](diagrams/README/property-module-internal-relationships.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Property module internal relationships
    accDescr: Property at the centre; LegalEstate vested in it; RegisteredTitle documenting the LegalEstate; Address locating the Property; Lease Term and Lease Extension Event for leasehold lifecycle; UPRN Succession Event preserving Property identity across administrative re-numbering.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    %% Property quartet
    Property["Property<br/>(spatial-material continuant)"]:::cls
    Address["Address<br/>(authority locator)"]:::cls
    LegalEstate["LegalEstate<br/>(rights bundle)"]:::cls
    RegisteredTitle["RegisteredTitle<br/>(HMLR record)"]:::cls

    %% Leasehold lifecycle
    LeaseTerm["LeaseTerm<br/>(time interval)"]:::cls
    LeaseExtensionEvent["LeaseExtensionEvent<br/>(reified)"]:::cls

    %% UPRN lifecycle
    UPRNSuccessionEvent["UPRNSuccessionEvent<br/>(reified)"]:::cls

    %% Cross-module
    Proprietorship["Proprietorship<br/>(agent module)"]:::ext
    Transaction["Transaction<br/>(transaction module)"]:::ext

    %% Core quartet
    Property -->|"hasAddress (1..*)"| Address
    Property -->|"hasLegalEstate (1..*)"| LegalEstate
    LegalEstate -->|"documentedBy"| RegisteredTitle
    RegisteredTitle -->|"identifiesPropertyOf"| Property

    %% Leasehold subtype
    LegalEstate -->|"leaseTerm (if leasehold)"| LeaseTerm
    LeaseExtensionEvent -->|"extends"| LegalEstate
    LeaseExtensionEvent -->|"produces successor"| LeaseTerm
    LeaseExtensionEvent -->|"updates"| RegisteredTitle

    %% UPRN succession
    UPRNSuccessionEvent -->|"re-numbers"| Property
    UPRNSuccessionEvent -->|"accompanies"| Address

    %% Cross-module touch points (faded)
    Proprietorship -.->|"binds"| RegisteredTitle
    Transaction -.->|"conveys"| LegalEstate
```

</details>

## Lifecycle: Property identity-criterion decision flow

Walk the four mutually-exclusive outcomes for a candidate Property record:

![property-identity-criterion-decision-flow](diagrams/README/property-identity-criterion-decision-flow.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TD
    accTitle: Property Identity-Criterion decision flow
    accDescr: Decision tree resolving whether two Property records refer to the same Property — spatial-material continuity check first, then legal-record override; outcomes are persist, succeed, subdivide, merge, or distinct Property.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef errorState fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C

    Start(["Two candidate<br/>Property records"]):::cls
    Q1{"Same spatial-material<br/>continuant<br/>(same bricks)?"}:::cls
    Q2{"Legal-record evidence<br/>of replacement<br/>(demolition cert,<br/>new title)?"}:::cls
    Q3{"Subdivision or merger<br/>recorded?"}:::cls

    Persist(["SAME Property<br/>(identity persists)"]):::success
    Override(["NEW Property<br/>(legal-record override)"]):::warning
    Split(["Subdivision or Merger<br/>(see hard cases)"]):::warning
    Distinct(["DIFFERENT Property"]):::errorState

    Start --> Q1
    Q1 -->|"Yes"| Q2
    Q1 -->|"No"| Q3
    Q2 -->|"No"| Persist
    Q2 -->|"Yes"| Override
    Q3 -->|"Yes"| Split
    Q3 -->|"No"| Distinct
```

</details>

## Lifecycle: Registered Title lineage

How a Registered Title's identity moves through registry events without taking the underlying Legal Estate with it:

![registered-title-lifecycle](diagrams/README/registered-title-lifecycle.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
stateDiagram-v2
    accTitle: Registered Title lifecycle
    accDescr: First registration opens a Title; closure ends a Title; merger and reissuance produce successor Titles with explicit predecessor lineage; the underlying Legal Estate may persist across all of these.

    [*] --> FirstRegistration : new HMLR title number

    FirstRegistration --> Active : title number assigned

    Active --> Active : routine update<br/>(no lineage break)
    Active --> Reissued : reissue on corrupt-plan<br/>or admin replacement
    Active --> Merged : merged into another Title
    Active --> Closed : closure (e.g. on amalgamation)
    Active --> Transferred : moved between<br/>district registries

    Reissued --> Active : successor Title<br/>linked to predecessor
    Transferred --> Active : same Title, new register

    Merged --> [*] : Title ceases;<br/>LegalEstate may persist
    Closed --> [*] : Title ceases;<br/>LegalEstate may persist
```

</details>
