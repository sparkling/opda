---
status: proposed
date: 2026-05-29
tags: [physical-relational, descriptive, postgresql]
---

# Descriptive module — relational schema

Five class-promoted PROV-O Entities — `survey`, `valuation`, `epc_certificate`, `search`, `comparable` — each `concerns` a property and is identified by its issuing activity. They declare no module-local facets at this tier (price, surveyor, energy band, etc. live in overlay profiles), so the tables are intentionally thin: a surrogate key, the `uri`, the `concerns` foreign key, and the `prov:wasGeneratedBy` activity anchor.

## Tables

| Table | Realises | concerns | Identity anchor |
|---|---|---|---|
| `survey` | Survey | `property` | `was_generated_by_activity_uri` |
| `valuation` | Valuation | `property` | `was_generated_by_activity_uri` |
| `epc_certificate` | EPCCertificate | `property` | `was_generated_by_activity_uri` |
| `search` | Search | `property` | `was_generated_by_activity_uri` |
| `comparable` | Comparable | — | `was_generated_by_activity_uri` |
| `valuation_comparable` | wasInformedBy `M:N` | junction | `valuation` × `comparable` |

## Entity-relationship diagram

```mermaid
erDiagram
    accTitle: Descriptive module — entity-relationship diagram
    accDescr: survey, valuation, epc_certificate and search each concern a property; comparable supports a valuation via the valuation_comparable junction.

    survey {
        uuid survey_id PK
        text uri UK
        uuid property_id FK
        text was_generated_by_activity_uri
    }
    valuation {
        uuid valuation_id PK
        text uri UK
        uuid property_id FK
        text was_generated_by_activity_uri
    }
    epc_certificate {
        uuid epc_certificate_id PK
        text uri UK
        uuid property_id FK
        text was_generated_by_activity_uri
    }
    search {
        uuid search_id PK
        text uri UK
        uuid property_id FK
        text was_generated_by_activity_uri
    }
    comparable {
        uuid comparable_id PK
        text uri UK
        text was_generated_by_activity_uri
    }
    valuation_comparable {
        uuid valuation_id PK,FK
        uuid comparable_id PK,FK
    }

    survey }o--|| property : "concerns"
    valuation }o--|| property : "concerns"
    epc_certificate }o--|| property : "concerns"
    search }o--|| property : "concerns"
    valuation ||--o{ valuation_comparable : "informed by"
    comparable ||--o{ valuation_comparable : "supports"
```

## Mapping notes

- **Identity is the issuing activity.** Each descriptive Kind's identity depends on its `prov:wasGeneratedBy` activity (surveyor + timestamp + registration, etc.), so `was_generated_by_activity_uri` is `NOT NULL`. The activity itself is stored as an IRI literal rather than promoted to an invented `activity` table.
- **No invented facets.** Survey price, valuer, EPC band and similar fields are overlay-profile concerns and are not declared at this tier, so they are not columns here.
- **`comparable` supports `valuation`** through the `valuation_comparable` junction (`prov:wasInformedBy`), a many-to-many relationship. (`property` lives in the property module.)

## Cross-tier

Logical tier: [descriptive module](../../logical/descriptive/).
