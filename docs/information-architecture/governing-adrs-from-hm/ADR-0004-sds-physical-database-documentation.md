---
status: accepted
date: 2026-03-12
tags:
- documentation
---

# SDS Physical Database Documentation

## Context and Problem Statement

The SDS PostgreSQL database implements the SDS ontology (72 OWL classes) as 70 tables in the `dbo` schema (authoritative master data) and 63 tables in the `hapi` schema (read-only API projection). The logical model is documented in `docs/manual/sds/` (ADR-0033), but no reference documentation exists for the physical database model.

Database engineers, integration developers, and DBAs who work with the SQL schema need documentation that explains table relationships, constraint philosophy, temporal patterns, and the exception filter pattern — concepts that cannot be derived from the schema alone.

## Decision Drivers

* Engineers need table-level reference documentation with relationship context and business rules
* The dbo/hapi dual-schema architecture requires explicit documentation of differences and when to use each
* The exception filter pattern (17 of 70 tables) is a core structural pattern that needs dedicated explanation
* Three temporal patterns coexist (season-based, date-based, weekly) — engineers need to know which applies where
* The physical model documentation must cross-reference the logical model manual without duplicating it
* Mermaid ER diagrams make table relationships immediately visible

## Considered Options

* Multi-file modular documentation — per-domain chapters, ER diagrams, and cross-linked TOC
* Single monolithic schema reference — covering all 70 dbo tables
* Auto-generated documentation — from `database-schema.dbo.yaml`
* Annotated YAML schema — with inline documentation in the existing schema files

## Decision Outcome

Chosen option: "Multi-file modular documentation" in `docs/manual/sds/model/physical/database/`, because it mirrors the logical model's modular approach (ADR-0033), enables per-domain ER diagrams, keeps files manageable, and allows independent reading.

### Consequences

* Good, because it mirrors logical model's domain structure for familiarity (parallel numbering 02-08)
* Good, because two per-table templates keep documentation proportional to table complexity
* Good, because Mermaid erDiagrams render in GitHub, VS Code, and export to PNG
* Good, because ontology-to-table mapping in overview chapter provides logical↔physical bridge
* Good, because alphabetical table index in index.md enables direct lookup
* Good, because no content duplication from logical model — physical docs are a lean reference
* Bad, because there are 10 files to maintain when schema changes (mitigated: schema changes are infrequent, YAML source enables diffing)
* Bad, because Calendar and Organization chapters are thin placeholders (mitigated: structural consistency with logical model is more valuable than chapter-length uniformity)

### Confirmation

Compliance with this decision is confirmed when:

* All 10 files created in `docs/manual/sds/model/physical/database/`
* `index.md` includes alphabetical table index and links to every chapter
* All 70 dbo tables documented in at least one domain chapter
* All 2 hapi-only tables documented in chapter 10
* Domain chapters (02, 03, 06, 07, 08) have at least one Mermaid erDiagram
* erDiagrams export cleanly via /mermaid-export skill
* Cross-references between physical and logical model chapters resolve
* Ontology-to-table mapping in 01-overview.md covers key classes and tables

## Pros and Cons of the Options

### Multi-file modular documentation

* Good, because it matches logical model approach, enables per-domain diagrams
* Good, because of self-contained chapters and multiple navigation pathways
* Good, because of cross-linking between physical and logical documentation
* Bad, because of 10 files to maintain

### Single monolithic reference

* Good, because everything is in one place
* Bad, because 70 tables = ~3000+ lines, unreadable for targeted lookup
* Bad, because a single ER diagram would be illegible

### Auto-generated documentation

* Good, because it is always in sync with schema YAML
* Bad, because it loses business context, relationship narratives, and design rationale
* Bad, because it cannot explain "why" behind constraint philosophy or temporal patterns

### Annotated YAML schema

* Good, because of minimal additional files
* Bad, because YAML is not a documentation format — no diagrams, no navigation, no cross-references
* Bad, because it mixes reference data (schema facts) with explanatory content

## More Information

* [SDS Logical Model Manual](../../manual/sds/index.md)
* [ADR-0033: Logical Model Documentation](ADR-ADR-ADR-0033-sds-data-model-documentation.md)
* [dbo Schema Reference](../../sds/database-schema.dbo.yaml)
* [hapi Schema Reference](../../sds/database-schema.hapi.yaml)
* [Expert Hive Session 49](../ontology/odr/council/session-49-sds-database-documentation.md)
* [MADR Template](https://adr.github.io/madr/)

## Document Structure (10 files, per Session 49)

```
docs/manual/sds/model/physical/database/
  index.md                    # TOC, alphabetical table index (70 entries),
                              #   cross-domain FK dependency table,
                              #   junction table inventory
  01-overview.md              # Physical model architecture: engine, dual-schema,
                              #   naming conventions, common patterns,
                              #   cross-domain FK overview, ontology mapping
  02-country.md               # Country tables (8)
  03-market.md                # Market tables (13)
  04-calendar.md              # Calendar tables (placeholder — no dedicated tables)
  05-organization.md          # Organization tables (placeholder — embedded columns)
  06-currency.md              # Currency tables (12)
  07-customs.md               # Customs, trade, and VAT tables (~30)
  08-delivery.md              # Delivery tables (3)
  09-admin.md                 # Admin/publishing tables (4)
  10-hapi-comparison.md       # dbo vs hapi comparison
```

## Per-Table Templates (Session 49 amendment)

**Entity table template (6 sections):**
1. Header block — table name, description, ontology class, ontological level, row magnitude
2. Columns — name, type, nullable, default, notes
3. Keys and Constraints — PKs, unique constraints, check constraints with plain-English explanations
4. Foreign Keys — outbound FKs with links; inbound "Referenced by" list
5. Indexes — name, columns, type, purpose
6. Notes — audit columns, temporal pattern, junction table explanation

**Junction table template (3 sections):**
1. Header block — description, ontological level (Junction), row magnitude
2. Columns — name, type, nullable
3. Keys and Foreign Keys — composite PK, FKs to both sides

Decision rule: tables with 3+ non-FK, non-temporal, non-audit columns use the entity template; all others use the junction template.

## Three Navigation Pathways (Session 49 amendment)

| Goal | Entry Point | Path |
|------|------------|------|
| "Understand the database" | [Overview](model/physical/database/01-overview.md) | -> Domain chapters |
| "Query a domain" | Domain chapter (02-09) | -> Table reference + Common Queries |
| "Look up a table" | [Alphabetical index](model/physical/database/index.md#alphabetical-table-index) | -> Domain chapter via back-link |

## Diagram Strategy (Session 49 amendment)

1. **Per-domain erDiagram** — entity tables with key columns, junction tables as connectors (max ~15 per diagram)
2. **Architecture overview erDiagram** — hub tables only (~15-20), domain grouping
3. **Exception filter pattern diagram** — abstract pattern, reused by reference in customs/trade/VAT
4. **dbo→hapi flowchart** — publication pipeline in the comparison chapter
5. **Two-level approach** — hub-and-spoke overview at chapter top, detailed diagram with all tables below

## Conventions

- Domain chapters document dbo exclusively; hapi differences are in chapter 10
- Each chapter is self-contained with business context (not just a schema dump)
- Cross-references use relative Markdown links: `[hmcountry](02-country.md#hmcountry)`
- Column tables include type, nullable, default, and constraint summary
- Temporal behavior (season/date/weekly) documented for every table
- Data classification (MasterData/ReferenceData) noted for entity tables
- "Logical Model" callout at top of each domain chapter with link to `../../<chapter>.md`

## Maintenance

- **Source of truth:** `docs/sds/database-schema.dbo.yaml` and `docs/sds/database-schema.hapi.yaml`
- **Update triggers:** any DDL change to dbo or hapi schema, new table addition, constraint modification
- **Review cadence:** alongside quarterly ontology reviews (ADR-0033)

## Expert Hive Review (Session 49)

See `docs/ontology/odr/council/session-49-sds-database-documentation.md` for full council session report.

Key amendments (10-0 unless noted):
1. Domain-based grouping mirroring the logical model, 10 files (10-0, Baker withdrew dependency-tier)
2. Domain chapters document dbo exclusively; dedicated dbo/hapi comparison chapter (10-0)
3. Two per-table templates: entity (6 sections) and junction (3 sections) (10-0)
4. Mermaid erDiagram per domain, cross-domain flowchart overview (10-0 ER, 8-0-2 flowchart)
5. Cross-link physical-to-logical from day one; defer reverse links (10-0 cross-link, 6-4 defer)
6. Ontological level annotation per table as header field (9-1, Baker dissents)
7. Row magnitude instead of exact counts (9-1)
8. Alphabetical table index in index.md (8-2, Baker/Davis prefer standalone)
9. Cross-domain FK dependency table in overview (10-0)
10. No content duplication from logical model (10-0)
