# Domain Model API -- OpenAPI Specification

This directory contains the OpenAPI 3.1 specification for the H&M ontology domain model API. The API serves JSON-LD representations of ontology metadata (OWL classes, SHACL properties, SKOS enumerations) to the ontology website frontend.

## Files

| File | Description |
|------|-------------|
| `domain-model-api.yaml` | OpenAPI 3.1 specification (single file, all schemas inline) |

## Governing Decisions

| Document | Relationship |
|----------|-------------|
| [ADR-0006](../../adr/ADR-0006-domain-model-openapi.md) | Decision record for this API design |
| [ADR-0002](../../adr/ADR-0002-ontology-website-information-model.md) | Information model and page types this API serves |
| [Logical Information Model](../../ontology/information-model-logical.md) | Entity definitions, page compositions, navigation graph |

## Usage

### Validate the spec

```bash
npx @redocly/cli lint domain-model-api.yaml
```

### Generate a mock server

```bash
npx @stoplight/prism-cli mock domain-model-api.yaml
```

### Preview documentation

```bash
npx @redocly/cli preview-docs domain-model-api.yaml
```

### Generate client code

```bash
npx @openapitools/openapi-generator-cli generate \
  -i domain-model-api.yaml \
  -g typescript-fetch \
  -o ../../../src/generated/api-client
```

## Key Design Points

- **GET-only**: All endpoints are read-only
- **JSON-LD**: All responses use `Content-Type: application/ld+json` with a `@context` object
- **Pagination**: Listing endpoints use `page`/`pageSize` with HATEOAS `_links`
- **Errors**: RFC 7807 Problem Details format (`application/problem+json`)
- **Two representations**: Listing endpoints return summaries; detail endpoints return full entities with embedded relations
