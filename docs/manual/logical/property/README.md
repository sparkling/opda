---
status: proposed
date: 2026-05-28
tags: [logical-model, property]
---

# Property module

The physical Property, its socially-recognised Address(es), the legal rights-bundle (LegalEstate) vested in it, the HMLR record (RegisteredTitle) documenting that estate, and the lifecycle events that mutate them (LeaseExtensionEvent, UPRNSuccessionEvent). This is OPDA's structural spine — all other modules attach to it.

## Entity inventory

| Entity | UFO meta-category | Identity criterion |
|---|---|---|
| [Address](./address.md) | Substance Kind | Authority-record persistence across cosmetic re-format and authority succession |
| [LeaseExtensionEvent](./lease-extension-event.md) | Event particular | Reified statutory lease extension event |
| [LeaseTerm](./lease-term.md) | Information particular | OWL-Time ProperInterval bounding a leasehold tenure |
| [LegalEstate](./legal-estate.md) | Substance Kind | Rights-bundle persistence through grant / transfer / registration / discharge |
| [Property](./property.md) | Substance Kind | Spatial-material continuity (Kendall + Davis legal-record-discontinuity-override hybrid) |
| [RegisteredTitle](./registered-title.md) | Substance Kind (informational) | Title-number lineage + reified registry-event history |
| [UPRNSuccessionEvent](./uprn-succession-event.md) | Event particular | Reified administrative UPRN re-numbering event |

## Enumerations bound by this module

| Scheme | Used by attribute | Closed/Open |
|---|---|---|
| [AddressVariantScheme](./enumerations/address-variant-scheme.md) | `Address.addressVariant` | Closed (4 members) |
| [BuiltFormScheme](./enumerations/built-form-scheme.md) | `Property.builtForm` | Closed (5 members) |
| [CentralHeatingFuelTypeScheme](./enumerations/central-heating-fuel-type-scheme.md) | `Property.centralHeatingFuelType` | Closed (6 members) |
| [CouncilTaxBandSchemeEW](./enumerations/council-tax-band-scheme-ew.md) | Council-tax attributes (E&W) | Closed (8 members) |
| [CouncilTaxBandSchemeScotland](./enumerations/council-tax-band-scheme-scotland.md) | Council-tax attributes (Scotland) | Closed (9 members) |
| [CurrentEnergyRatingScheme](./enumerations/current-energy-rating-scheme.md) | `Property.currentEnergyRating` | Closed (7 members) |
| [HeatingTypeScheme](./enumerations/heating-type-scheme.md) | `Property.heatingType` | Closed (4 members) |
| [OffMainsDrainageSystemTypeScheme](./enumerations/off-mains-drainage-system-type-scheme.md) | `Property.offMainsDrainageSystemType` | Closed (6 members) |
| [OwnershipTypeScheme](./enumerations/ownership-type-scheme.md) | `LegalEstate.ownershipType` | Closed (4 members) |
| [PropertyTypeScheme](./enumerations/property-type-scheme.md) | `Property.propertyType` | Closed (6 members) |
| [TenureKindScheme](./enumerations/tenure-kind-scheme.md) | `LegalEstate.tenureKind` | Closed (3 members) |
| [YesNoScheme](./enumerations/yes-no-scheme.md) | Many Yes/No discriminators | Closed (2 members) |
| [YesNoNotApplicableScheme](./enumerations/yes-no-not-applicable-scheme.md) | BASPI5 conditional questions | Closed (3 members) |
| [YesNoNotKnownScheme](./enumerations/yes-no-not-known-scheme.md) | BASPI5 not-known-admissible questions | Closed (3 members) |
| [YesNoNotRequiredScheme](./enumerations/yes-no-not-required-scheme.md) | BASPI5 not-required-admissible questions | Closed (3 members) |

## ER diagram

![property-module--entity-relationship-diagram](diagrams/README/property-module--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Property Module — Entity-Relationship Diagram
    accDescr: Property module entities (Property, Address, LegalEstate, RegisteredTitle, LeaseTerm) and lifecycle events (LeaseExtensionEvent, UPRNSuccessionEvent) with intra-module relationships.

    Property ||--o{ Address : "hasAddress"
    Property }o--o| LegalEstate : "vests"
    Property }o--o{ RegisteredTitle : "identifiedBy"
    RegisteredTitle ||--|| LegalEstate : "recordsEstate"
    RegisteredTitle }o--|| Property : "identifiesSameProperty"
    LegalEstate }o--|| Property : "identifiesSameProperty"
    LegalEstate ||--o| LeaseTerm : "leaseTerm"
    LeaseExtensionEvent }o--|| LegalEstate : "extends"
    LeaseExtensionEvent }o--|| LeaseTerm : "produces successor"
    UPRNSuccessionEvent }o--|| Property : "succeeds (PROV-O wasDerivedFrom)"
```

</details>

Source file: [`../diagrams/property-er.mmd`](../diagrams/property-er.mmd).

## Class hierarchy

OWL/RDFS subclass relationships in the property module. Property, LegalEstate, and Address are Substance Kinds at root level. Address inherits from `vcard:Address`. Events specialise the foundation `Event particular` shape via PROV-O Activity.

![property-module--class-hierarchy](diagrams/README/property-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Property Module — Class Hierarchy
    accDescr: OWL/RDFS subclass relationships in the property module — Property as Substance Kind, Address subclasses vcard:Address, LegalEstate carries tenure, RegisteredTitle records Estate, lifecycle Events as PROV-O Activities.

    class vcardAddress["vcard:Address"]
    class provActivity["prov:Activity"]
    class timeProperInterval["time:ProperInterval"]

    class Property {
        hasUPRN
        propertyType
        builtForm
        currentEnergyRating
        + many Yes/No discriminators
    }
    class Address {
        addressVariant : AddressVariantScheme
    }
    class LegalEstate {
        tenureKind : TenureKindScheme
        ownershipType
        isGroundRentPayable
    }
    class RegisteredTitle {
        title-number lineage
    }
    class LeaseTerm {
        OWL-Time bounded interval
    }
    class LeaseExtensionEvent {
        prov:atTime
    }
    class UPRNSuccessionEvent {
        prov:atTime
    }

    vcardAddress <|-- Address
    timeProperInterval <|-- LeaseTerm
    provActivity <|-- LeaseExtensionEvent
    provActivity <|-- UPRNSuccessionEvent
```

</details>

## Identity-key summary

![property-module--identity-key-summary](diagrams/README/property-module--identity-key-summary.png)

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
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Property Module — Identity-Key Summary
    accDescr: Identity Criterion key surfaces for the seven property-module entities — spatial-material continuity for Property, variant + authority-record for Address, rights-bundle for LegalEstate, title-lineage for RegisteredTitle, OWL-Time pair for LeaseTerm, PROV-O tuples for the two Events.

    classDef icCell fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef entityCell fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    PropertyE[Property]:::entityCell -->|"IC"| PIC["spatial-material continuity<br/>Kendall + Davis hybrid<br/>(hasUPRN is contingent)"]:::icCell
    AddressE[Address]:::entityCell -->|"IC"| AIC["addressVariant +<br/>authority-record-id"]:::icCell
    LegalEstateE[LegalEstate]:::entityCell -->|"IC"| LEIC["rights-bundle persistence<br/>(tenureKind surface)"]:::icCell
    RegisteredTitleE[RegisteredTitle]:::entityCell -->|"IC"| RTIC["title-number lineage +<br/>registry-event history"]:::icCell
    LeaseTermE[LeaseTerm]:::entityCell -->|"IC"| LTIC["(LegalEstate,<br/>time:hasBeginning,<br/>time:hasEnd)"]:::icCell
    LeaseExtensionEventE[LeaseExtensionEvent]:::entityCell -->|"IC"| LEEIC["(LegalEstate,<br/>prov-timestamp)"]:::icCell
    UPRNSuccessionEventE[UPRNSuccessionEvent]:::entityCell -->|"IC"| USEIC["(Property,<br/>prov-timestamp)"]:::icCell
```

</details>
