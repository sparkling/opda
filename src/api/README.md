# OPDA Ontology API

Build-time GRLC SPARQL→REST API for the OPDA ontology. Implements [ADR-0021](../../docs/adr/ADR-0021-generate-manual-entity-pages-via-fuseki-grlc-sparql-api.md).

Astro's `getStaticPaths` queries this API at build time. Production ships only `dist/` — no Fuseki or API at runtime.

## Quick start

```bash
# 1. Start Fuseki (port 3031 to avoid conflict with local hm Fuseki on 3030)
docker compose up -d fuseki

# 2. Load all 23 opda ontology TTLs
node scripts/fuseki-load.mjs

# 3. Start the API
FUSEKI_ENDPOINT=http://localhost:3031/opda/sparql PORT=3002 node src/api/server.js
```

## Endpoints

### `GET /api/entities`

Returns all `owl:Class` entities across the opda namespace.

**Response shape:**
```json
{
  "@type": "EntityList",
  "totalCount": 41,
  "page": 1,
  "pageSize": 100,
  "totalPages": 1,
  "items": [
    {
      "uri": "https://w3id.org/opda/#Property",
      "localName": "Property",
      "label": "Property",
      "module": "property",
      "tiers": ["concept", "logical", "physical-ontology"]
    }
  ],
  "_links": { "self": { "href": "/api/entities?page=1&pageSize=100" } }
}
```

- `module` — derived from named graph IRI (`https://w3id.org/opda/graph/{module}`)
- `tiers` — `concept` + `logical` always present; `physical-ontology` when a `sh:NodeShape` targets the class

### `GET /api/entities/{tier}/{module}/{localName}`

Returns full structured data for a single entity. Tier is one of `concept`, `logical`, `physical-ontology`.

**Response shape:**
```json
{
  "uri": "https://w3id.org/opda/#Property",
  "localName": "Property",
  "label": "Property",
  "module": "property",
  "tier": "logical",
  "summary": "Physical property. UFO Substance Kind...",
  "scopeNote": "DOLCE: Endurant / PhysicalObject...",
  "dctSource": ["https://w3id.org/opda/odr/ODR-0005#section-2a"],
  "attributes": [
    {
      "localName": "areBoundariesUniform",
      "label": "are boundaries uniform",
      "type": "xsd:string",
      "cardinality": "0..*",
      "required": false,
      "description": "Yes/No discriminator..."
    }
  ],
  "relationships": [
    {
      "predicate": "hasAddress",
      "target": "Address",
      "cardinality": "0..*",
      "inverse": null,
      "description": "..."
    }
  ],
  "constraints": [
    {
      "message": "Property hasUPRN MUST be a single xsd:string...",
      "severity": "sh:Violation",
      "shape": "PropertyIdentityKeyShape"
    }
  ],
  "crossTier": {
    "concept": "/manual/concept/property/Property",
    "logical": "/manual/logical/property/Property",
    "physicalOntology": "/manual/physical-ontology/property/classes#Property",
    "physicalDatabase": null
  }
}
```

**404** → RFC 7807 `application/problem+json`.

### Operational

| Route | Description |
|-------|-------------|
| `GET /health` | Triplestore connectivity check |
| `GET /namespaces` | Prefix→IRI map |
| `GET /sparql?query=...` | Read-only SPARQL pass-through |
| `DELETE /cache` | Flush in-memory response cache |

## Architecture

### GRLC engine

Queries live in `src/api/queries/*.rq`. Each file carries `#+` decorator comments:

```sparql
#+ summary: Short description
#+ endpoint: /api/entities/{tier}/{module}/{localName}
#+ method: GET
#+ querytype: detail
```

The engine (`lib/grlc-engine.js`) reads these files, parses decorators, determines route type (`listing` / `detail` / `aggregate`), and builds Express route configs. The handler factory (`lib/grlc-handler.js`) creates the actual handlers.

**Custom decorator:** `#+ querytype: detail` forces SELECT-based queries to be treated as detail endpoints (GRLC normally uses CONSTRUCT for details).

### Detail query pattern

`get-entity.rq` uses a UNION SELECT with a `?rowType` discriminator:
- `core` — class URI, label, module (from named graph), `rdfs:comment`, `skos:scopeNote`
- `source` — `dct:source` IRIs
- `attribute` — `owl:DatatypeProperty` with `rdfs:domain = this class`, joined to SHACL blank nodes for cardinality
- `relationship` — `owl:ObjectProperty` with `rdfs:domain = this class`, joined to SHACL for cardinality
- `constraint` — `sh:NodeShape` + `sh:property > sh:message` blank-node traversal

`grlc-handler.js::assembleEntityDetail()` groups these rows into the contract shape.

### Named graph module derivation

Each TTL is loaded into a named graph `https://w3id.org/opda/graph/{module}` by `scripts/fuseki-load.mjs`. Example: `opda-property.ttl` → `graph/property`. The SPARQL queries use `GRAPH ?g { ?uri a owl:Class }` and extract the module from the IRI: `REPLACE(STR(?g), "^https://w3id.org/opda/graph/", "")`.

### SHACL blank-node join

The opda SHACL shapes use blank nodes for `sh:property` constraints:
```turtle
opda:PropertyIdentityKeyShape a sh:NodeShape ;
    sh:targetClass opda:Property ;
    sh:property _:bn .
_:bn sh:path opda:hasUPRN ; sh:maxCount 1 ; sh:message "..." .
```

The query joins `sh:property ?propShape` → `?propShape sh:path ?attrProp` to find cardinality for attributes. Each `GRAPH` clause is wrapped separately to handle the cross-graph blank-node traversal.

## opda predicate notes

| SPARQL predicate | Maps to contract field |
|---|---|
| `rdfs:comment` | `summary` |
| `skos:scopeNote` | `scopeNote` |
| `dct:source` | `dctSource[]` |
| `owl:DatatypeProperty` + `rdfs:domain` | `attributes[]` |
| `owl:ObjectProperty` + `rdfs:domain` | `relationships[]` |
| `sh:NodeShape` + `sh:targetClass` + `sh:property > sh:message` | `constraints[]` |
| named graph IRI | `module` |

**No `skos:prefLabel`** — opda uses `rdfs:label "@en"` (not `skos:prefLabel`) for class labels.

**`identifiesSameProperty`** — has no `rdfs:domain` in the TTL so it doesn't appear in `relationships[]`. It surfaces only in `constraints[]` via the `PropertyICBreachShape`.

## Phase-2 gaps

- `module` returns the raw graph suffix (`classes` for `opda-classes.ttl`, `foundation` for `foundation.ttl`); W-WEB needs to normalise these to the 6-module + foundation mapping.
- `physicalDatabase` crossTier link is always `null` — the physical-database deployment view is not yet modelled.
- Multi-value `scopeNote` returns only the first binding (SPARQL row dedup); if needed, promote to an array.
- `dctSource` URIs reference ODR/ADR anchors — W-WEB should render them as links rather than raw URIs.
- No paging on detail results — all UNION rows returned in one request (acceptable for build-time use).
