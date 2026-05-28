# SPARQL Queries for the Domain Model API

Implementation of ADR-0007. Each `.rq` file in `queries/` maps to one endpoint
from the ADR-0006 OpenAPI specification (`docs/information.architecture/openAPI/domain-model-api.yaml`).
GRLC converts these decorated SPARQL files into a REST API.

## Directory Layout

```
sparql/
  context.jsonld                  Shared JSON-LD @context for all API responses
  README.md                      This file
  queries/
    dashboard.rq                 GET /dashboard
    list-concepts.rq             GET /concepts
    list-concepts-count.rq       Companion count query
    get-concept.rq               GET /concepts/{context}/{localName}
    list-properties.rq           GET /properties
    list-properties-count.rq     Companion count query
    get-property.rq              GET /properties/{context}/{localName}
    list-enumerations.rq         GET /enumerations
    list-enumerations-count.rq   Companion count query
    get-enumeration.rq           GET /enumerations/{context}/{schemeName}
    list-subject-areas.rq        GET /subject-areas
    get-subject-area.rq          GET /subject-areas/{subjectName}
    list-mappings.rq             GET /mappings
    list-mappings-count.rq       Companion count query
    get-mapping.rq               GET /mappings/{id}
    list-modules.rq              GET /modules
    list-modules-count.rq        Companion count query
    get-module.rq                GET /modules/{context}/{moduleName}
    list-classification-facets.rq  GET /classification-facets
```

## Query Conventions

### Two Query Forms

| Endpoint type | SPARQL form | Purpose |
|---------------|-------------|---------|
| Listing       | SELECT      | Tabular results with OFFSET/LIMIT pagination |
| Detail        | CONSTRUCT   | RDF graph serialised as JSON-LD |

### GRLC Decorators

Every `.rq` file starts with GRLC decorator comments (`#+` prefix):

| Decorator       | Purpose                        | Example                              |
|-----------------|--------------------------------|--------------------------------------|
| `#+ summary:`   | OpenAPI operation summary      | `#+ summary: List all concepts`      |
| `#+ description:` | Longer operation description | `#+ description: Returns paginated...`|
| `#+ endpoint:`  | URL path                       | `#+ endpoint: /api/v1/concepts`      |
| `#+ method:`    | HTTP method                    | `#+ method: GET`                     |
| `#+ pagination:` | Default page size             | `#+ pagination: 20`                  |
| `#+ enumerate:` | Allowed values for parameters  | See below                            |
| `#+ tags:`      | OpenAPI tag grouping           | `#+ tags:\n#+   - Concepts`          |
| `#+ mime:`      | Response content type          | `#+ mime: application/ld+json`       |

### Parameter Binding

GRLC binds query parameters to SPARQL variables prefixed with `?_` and
suffixed with `_iri`. For example, the `context` query parameter becomes
`?_context_iri` in the query.

Filter parameters use `FILTER(!BOUND(?_param_iri) || ...)` so they are
optional -- the query returns all results when the parameter is absent.

### IRI Resolution

Detail endpoints resolve path parameters to full IRIs using
`BIND(IRI(CONCAT(...)))`:

```sparql
BIND(IF(?_context_iri = "SDS",
        IRI(CONCAT("https://hm.com/ns/sds/", ?_localName_iri)),
     IF(?_context_iri = "PF",
        IRI(CONCAT("https://hm.com/ns/pf/", ?_localName_iri)),
        IRI(CONCAT("https://hm.com/ns/common/", ?_localName_iri))))
     AS ?concept)
```

### Context Detection

The `context` field (SDS, PF, Common) is derived from the entity IRI
namespace using `STRSTARTS`:

```sparql
BIND(IF(STRSTARTS(STR(?uri), "https://hm.com/ns/sds/"), "SDS",
     IF(STRSTARTS(STR(?uri), "https://hm.com/ns/pf/"), "PF",
     "Common")) AS ?context)
```

### Count Companions

Every listing query has a companion `*-count.rq` that runs the same
`WHERE` clause with `SELECT (COUNT(*) AS ?total)`. The middleware
issues the listing query and its count companion in parallel, then
assembles the response with `totalCount` and `totalPages`.

### Full-Text Search

Full-text search requires triplestore-specific extensions. The queries
include a portable `REGEX` fallback and a `# TRIPLESTORE-SPECIFIC:`
comment block showing how to adapt for:

- **Jena text index:** `?uri text:query ?_search_iri`
- **Virtuoso:** `FILTER(bif:contains(?name, ?_search_iri))`
- **GraphDB:** `?uri luc:myIndex ?_search_iri`

## Namespaces

All queries use these standard prefixes:

```sparql
PREFIX owl:    <http://www.w3.org/2002/07/owl#>
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos:   <http://www.w3.org/2004/02/skos/core#>
PREFIX sh:     <http://www.w3.org/ns/shacl#>
PREFIX dash:   <http://datashapes.org/dash#>
PREFIX hm:     <https://hm.com/ns/>
PREFIX sds:    <https://hm.com/ns/sds/>
PREFIX pf:     <https://hm.com/ns/pf/>
PREFIX common: <https://hm.com/ns/common/>
PREFIX ia:     <https://hm.com/ns/ia/>
```

The `ia:` namespace is used only in CONSTRUCT templates to shape
responses to match the ADR-0006 JSON-LD schema.

## JSON-LD Context

The shared `context.jsonld` provides the `@context` object that the
middleware injects into all API responses. It maps IA terms (like
`ia:name`, `ia:context`, `ia:subjectArea`) to short JSON property names.

Non-semantic clients can consume responses as plain JSON and ignore the
`@context`.

## Triplestore Setup

### 1. Choose a SPARQL 1.1 triplestore

Any compliant triplestore works. Recommended options:

| Triplestore   | Notes                                    |
|---------------|------------------------------------------|
| Apache Jena Fuseki | Open source, Java, supports text index |
| Oxigraph      | Open source, Rust, lightweight           |
| GraphDB Free  | Free tier, built-in text search          |
| Blazegraph    | Open source, mature                      |

### 2. Load the ontology

Load all Turtle files from `src/ontology/` into the triplestore's
default graph:

```bash
# Example with Jena Fuseki
# Create dataset
curl -X POST http://localhost:3030/$/datasets \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "dbName=hm-ontology&dbType=tdb2"

# Load SDS modules
for f in src/ontology/sds/*.ttl; do
  curl -X POST http://localhost:3030/hm-ontology/data \
    -H "Content-Type: text/turtle" \
    --data-binary @"$f"
done

# Load PF modules
for f in src/ontology/pf/*.ttl; do
  curl -X POST http://localhost:3030/hm-ontology/data \
    -H "Content-Type: text/turtle" \
    --data-binary @"$f"
done

# Load common files
for f in src/ontology/common/*.ttl; do
  curl -X POST http://localhost:3030/hm-ontology/data \
    -H "Content-Type: text/turtle" \
    --data-binary @"$f"
done
```

### 3. Install GRLC

```bash
pip install grlc
# or
docker run -p 8088:8088 clariah/grlc
```

### 4. Configure GRLC

Point GRLC at the query directory and the triplestore:

```bash
grlc serve \
  --sparql-endpoint http://localhost:3030/hm-ontology/sparql \
  --query-dir docs/information.architecture/sparql/queries
```

GRLC auto-generates Swagger documentation at its root URL.

## Running Queries Manually

Test any query directly against the triplestore:

```bash
# SELECT query (list)
curl -X POST http://localhost:3030/hm-ontology/sparql \
  -H "Accept: application/sparql-results+json" \
  -H "Content-Type: application/sparql-query" \
  --data-binary @docs/information.architecture/sparql/queries/list-concepts.rq

# CONSTRUCT query (detail, with parameter substitution)
# Replace ?_context_iri and ?_localName_iri with literal values first
sed 's/?_context_iri/"SDS"/g; s/?_localName_iri/"Country"/g' \
  docs/information.architecture/sparql/queries/get-concept.rq | \
  curl -X POST http://localhost:3030/hm-ontology/sparql \
    -H "Accept: application/ld+json" \
    -H "Content-Type: application/sparql-query" \
    --data-binary @-
```

## Middleware

A thin middleware layer (reverse proxy or API gateway plugin) wraps
GRLC responses in the ADR-0006 envelope. It handles:

1. Injecting the `@context` from `context.jsonld`
2. Adding pagination fields (`totalCount`, `page`, `pageSize`, `totalPages`)
   by issuing the companion `*-count.rq` query in parallel
3. Constructing HATEOAS `_links` (`self`, `first`, `last`, `next`, `prev`)
4. Wrapping results in the `@type`-d collection envelope

## Related Documents

- [ADR-0007: SPARQL Implementation via GRLC](../../adr/ADR-0007-sparql-grlc-api-implementation.md)
- [ADR-0006: OpenAPI Definitions](../../adr/ADR-0006-domain-model-openapi.md)
- [OpenAPI Spec](../openAPI/domain-model-api.yaml)
