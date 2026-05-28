---
status: accepted
date: 2026-03-18
tags:
- documentation
depends-on:
- ADR-0033
- ADR-0034
---

# Logical Model Documentation Layer

## Context and Problem Statement

The SDS data model documentation follows a 3-tier architecture:

1. **Concept Model** (`docs/manual/sds/model/concept/`) — business-oriented, non-technical descriptions of what the data means and why it is structured as it is. Written for domain SMEs and business stakeholders.
2. **Logical Model** (`docs/manual/sds/model/logical/`) — normalized entity-relationship view showing typed attributes, relationships with cardinality, and platform-independent business rules. Written for data engineers and architects. **This tier did not exist.**
3. **Physical Model** (`docs/manual/sds/model/physical/`) — implementation-specific documentation covering OWL/SHACL Turtle syntax, database DDL (PostgreSQL), and SKOS enumeration schemes. Written for ontology engineers and DBAs.

The gap between concept and physical creates friction for data engineers who need to understand the entity-relationship structure without reading Turtle files, and for architects evaluating cross-module dependencies without navigating implementation details.

## Decision Drivers

* Data engineers need typed attribute inventories and ER diagrams without OWL/SHACL/SQL specifics
* Architects need cross-module dependency maps at the logical level
* The logical model must be platform-independent: no xsd: prefixes, no SQL DDL, no SHACL constructs
* Entity naming and attribute typing must trace back to OWL classes and SHACL constraints in the physical model
* Module organization must mirror the concept model for navigational consistency
* ER diagrams must use standard Mermaid erDiagram syntax for tooling compatibility

## Considered Options

* Option A — Create logical model documentation in `docs/manual/sds/model/logical/` mirroring the module structure of concept and physical tiers

## Decision Outcome

Chosen option: "Option A — Create logical model documentation in `docs/manual/sds/model/logical/`", because it fills the missing middle tier between concept and physical, gives data engineers and architects a platform-independent reference, and mirrors the module organisation of the existing tiers for navigational consistency.

```
docs/manual/sds/model/logical/
  index.md                      # Hub page with module overview diagram
  overview.md                   # Conventions, notation, 3-tier positioning
  country.md                    # Country module (11 entities)
  market.md                     # Market module (9 entities)
  calendar.md                   # Calendar module (14 entities)
  organization.md               # Organization module (14 entities)
  currency.md                   # Currency module (11 entities)
  customs.md                    # Customs + Delivery module (15 entities)
  market-temporal.md            # Market temporal assignments (9 entities)
  exceptions.md                 # Trade exceptions (8 entities)
  cross-module-dependencies.md  # Cross-module relationship inventory
```

### Per-Module Page Template

Each module page follows this structure:

1. **Breadcrumb** and module scope summary
2. **Mermaid erDiagram** showing all entities, typed attributes, and relationships with cardinality
3. **Entity reference** sections: purpose, key attributes, business rules
4. **Cross-module relationships** listing with source/target/cardinality

### Attribute Type Conventions

Platform-independent types used in the logical model:

| Logical type | Maps to (physical) |
|-------------|-------------------|
| `string` | xsd:string, varchar |
| `integer` | xsd:integer, int4 |
| `decimal` | xsd:decimal, numeric |
| `boolean` | xsd:boolean, bool |
| `date` | xsd:date, date |
| `dateTime` | xsd:dateTime, timestamp |

### Cardinality Notation

| Notation | Meaning |
|----------|---------|
| `1..1` | Exactly one (mandatory) |
| `0..1` | Zero or one (optional) |
| `0..*` | Zero or more |
| `1..*` | One or more |

### Applicability

This documentation architecture applies to both SDS and PF ontologies. The PF logical model will follow the same structure when created.

### Consequences

* Good, because it bridges the gap between business-oriented concept model and implementation-specific physical model
* Good, because the logical model is platform-independent — usable by teams working with any storage technology
* Good, because ER diagrams provide immediate visual understanding of entity relationships
* Good, because module organization mirrors the concept model for navigational consistency
* Good, because Mermaid erDiagram syntax is widely supported by documentation tooling
* Bad, because manual sync is required when ontology modules change. (Mitigated: each page references its source module.)
* Bad, because there are 11 files to maintain. (Mitigated: module structure is stable.)

## More Information

* [SDS Concept Model](../manual/sds/model/concept/index.md)
* [SDS Physical Ontology Model](../manual/sds/model/physical/ontology/index.md)
* [ADR-0033: SDS Data Model Documentation](ADR-ADR-ADR-0033-sds-data-model-documentation.md)
* [ADR-0034: SDS Physical Ontology Documentation](ADR-ADR-ADR-0034-sds-physical-ontology-documentation.md)
