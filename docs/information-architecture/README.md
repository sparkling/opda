# Information Architecture

Schema definitions, API specifications, and SPARQL queries that define how ontology metadata is structured, served, and queried for the ontology website.

## Contents

| Directory | Description |
|-----------|-------------|
| `openAPI/` | OpenAPI 3.1 specification for the domain model REST API (ADR-0006) |
| `schemas/` | JSON Schema (2020-12) and XSD definitions for 13 domain entities (ADR-0005) |
| `sparql/` | GRLC-decorated SPARQL queries mapping API endpoints to the triplestore (ADR-0007) |

## Governing Decisions

- [ADR-0002](../adr/ADR-ADR-0002-ontology-website-information-model.md) -- Information model and page types
- [ADR-0005](../adr/ADR-ADR-0005-domain-model-schemas.md) -- Schema format decisions
- [ADR-0006](../adr/ADR-ADR-0006-domain-model-openapi.md) -- API design
- [ADR-0007](../adr/ADR-0007-sparql-grlc-api-implementation.md) -- SPARQL query layer

## Namespace

`https://hm.com/ns/ia/`
