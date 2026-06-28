---
status: accepted
date: 2026-05-28
tags: [website, ontology, sparql, fuseki, grlc, build-pipeline, content-generation]
supersedes: []
depends-on: [ADR-0011, ADR-0015, ADR-0016]
implements: []
---

# Generate manual entity pages from the ontology via Fuseki + a GRLC SPARQL API at build time

## Context and Problem Statement

[ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md) / [ADR-0016](./ADR-0016-manual-content-collection-wiring.md) integrated the 4-tier manual as Astro content collections sourced from the `docs/manual/` markdown tree. Entity pages (concept / logical / physical-ontology) render the markdown **body** through thin per-kind wrappers (`EntityPage.astro` slots `<Content />`). This works as a renderer but has three structural problems:

1. **Lossy, not data-driven.** The structured facts about an entity — typed attributes + cardinalities, relationships, UFO meta-category, SHACL constraints, SKOS classification, `dct:source`, cross-tier identity — live in the 24 ontology TTLs at `source/03-standards/ontology/` (per [ADR-0011](./ADR-0011-module-tbox-emission.md)). The manual markdown is a *derived, flattened projection* of that graph. The page can only show what the generator baked into prose/tables at emission time.
2. **No coherent cross-tier URL scheme.** The four tiers are organised differently (concept/logical = per-entity; physical-database = per-module; physical-ontology = per-module split into `classes`/`shapes`/`annotations`). Author-written relative `.md` cross-links (now build-rewritten to routes) cannot express a uniform per-entity identity across tiers, so naive cross-tier links to the physical tiers 404. There is no single key (the `opda:` URI) driving "where does this entity live in each tier".
3. **Dormant components.** `AttributeTable`, `TurtleBlock`, `SchemeMembersTable`, `ShapeBlock` shipped in ADR-0017 but are unwired (G17) precisely because there is no structured data feeding them — only markdown prose.

The H&M `semantic-modelling` project (`~/source/hm`) solves the equivalent problem with a proven pipeline ("ADR-7 GRLC-based implementation"):

- **Jena Fuseki** (`stain/jena-fuseki`) loads the ontology TTLs into a triplestore (`docker-compose.yml`, dataset `hm`).
- A **GRLC-style SPARQL→REST API** (`src/api`): a custom Node/Express engine (`lib/grlc-engine.js` + `lib/grlc-handler.js`) reads `.rq` query files decorated with `#+` comments (`endpoint:`, `method:`, `mime:`, `entailment:`) and generates route handlers. The `.rq` files are `CONSTRUCT` queries returning JSON-LD; path params bind via `?_param_iri` placeholders. Deps are minimal (`express` + `js-yaml`; SPARQL is sent to Fuseki over HTTP).
- A build pipeline (`Makefile` → `make build`) loads the data, brings the API up, and the **Astro site (`src/website`) queries the API at build time** to generate data-driven static pages.

This ADR decides whether — and how — opda adopts that pattern, **scoped to the entity pages** (and structurally-similar per-entity pages such as SKOS schemes and diagnostic exemplars), so those pages are generated directly from the ontology with full structural fidelity and a coherent URI-keyed cross-tier scheme.

## Decision Drivers

* **Single source of truth.** Entity pages should derive from the ontology TTLs, not from a lossy markdown projection that drifts and must be re-authored.
* **Structural fidelity.** Surface graph-shaped data — typed attributes, cardinalities, relations, UFO/DOLCE category, SHACL shapes, classification, `dct:source` — that is awkward to carry faithfully in flat markdown. Wires the dormant ADR-0017 components (G17).
* **Coherent cross-tier URL scheme.** A stable per-entity identity (the `opda:<LocalName>` URI) must map to a known URL in each tier so cross-tier links resolve only where pages exist.
* **Regenerability.** Ontology changes → rebuild → pages update; zero markdown re-authoring. Consistent with the IA "source of truth" discipline.
* **Proven precedent.** hm's GRLC + Fuseki + build-time generation is a working reference to copy, reducing design risk and giving a reusable `.rq` query catalogue.
* **Static-deploy constraint.** opda ships static HTML to Cloudflare Pages ([ADR-0003](./ADR-0003-idiomatic-astro-refactor.md), ADR-0015). Fuseki + the API must be **build-time-only** (ephemeral, in CI/local); production ships only static pages — no runtime triplestore or API.
* **Scope discipline.** Only entity-class-backed pages move to this pipeline. Tier/module READMEs, cross-cutting topics, and IA pages stay markdown-driven per ADR-0016.

## Considered Options

* **A — Keep markdown content collections + the `.md`→route link rewriter.** Status quo plus the just-landed build-time link rewriter. Shallow (markdown-passthrough) pages; no structured data; cross-tier scheme still broken for the physical tiers.
* **B — Copy hm's pipeline (chosen).** Build-time Jena Fuseki loads the opda TTLs; a GRLC-style SPARQL→REST API (custom engine + opda `.rq` `CONSTRUCT` queries) serves structured entity JSON-LD; an Astro entity template fetches the API in `getStaticPaths` and emits one static page per entity. Production ships only `dist/`.
* **C — Query Fuseki directly from Astro at build (no API layer).** Astro `getStaticPaths`/loaders issue SPARQL straight to Fuseki. Fewer moving parts, but loses the reusable decorator-driven `.rq` catalogue + JSON-LD contract, and forecloses serving the same data to a live endpoint later.
* **D — Precompute a static JSON dataset via a one-shot SPARQL batch at build (no live Fuseki/API).** e.g. extend `opda-gen` to emit `data/entities.json` from the TTLs. No services at all, but reimplements query logic outside the SPARQL/GRLC convention and diverges from hm's reference.

## Decision Outcome

Chosen option: **B — copy hm's Fuseki + GRLC SPARQL-API + build-time static-generation pipeline, scoped to entity pages**, because it keeps the ontology as the single source of truth, gives entity pages full structural fidelity with a coherent URI-keyed cross-tier scheme, and — by running Fuseki and the API as **build-time-only** services — preserves opda's static-deploy model. The GRLC API layer is retained over option C's direct-Fuseki access so opda inherits hm's reusable `.rq` query catalogue and JSON-LD contract; the same API is then a stepping stone toward the live `opda.org.uk/pdtf/<Entity>` dereference target ([ADR-0006](./ADR-0006-uri-strategy-and-dereferencing.md)) without a redesign.

This ADR is the **architectural anchor**; the engineering work likely sequences into sub-ADRs (Fuseki + load; GRLC engine + opda `.rq` queries; entity template + URL scheme; build-pipeline wiring), mirroring the ADR-0015 programme. The implementing session confirms that decomposition.

### Implementation sketch

*Indicative; the implementing session owns the detail.*

* **Triplestore** — `docker-compose.yml` with `stain/jena-fuseki`, dataset `opda`, build-time only (not deployed).
* **Load** — a make/npm target loads the 24 TTLs (+ entailment closure if a tier needs it) into Fuseki, mirroring hm's `load-ontology` / `fuseki-load`.
* **API** — port hm's `src/api` GRLC engine (`grlc-engine.js`, `grlc-handler.js`, conneg/caching middleware); author opda `.rq` `CONSTRUCT` queries (`get-entity-core`, `-attributes`, `-relations`, `-shapes`, `cross-tier-locations`) namespaced to `opda:` and the project's actual predicates.
* **URL scheme** — per-entity identity = `opda:<LocalName>`. Routes resolve to each tier's real structure: concept/logical → `/manual/<tier>/<module>/<entity>`; physical-ontology → `/manual/physical-ontology/<module>/classes#<entity>`; physical-database → `/manual/physical-database/modules/<module>#<entity>`. A `cross-tier-locations` query yields the "where does this entity appear" map so links only point where a page exists.
* **Template** — an Astro entity template whose `getStaticPaths` queries the API (build-time) for the entity list + per-entity structured data, rendering through the existing manual components (`EntityHeader`, `AttributeTable`, `TurtleBlock`, `ShapeBlock`, `CrossTierLinks`) — closing G17.
* **Build wiring** — pipeline: start Fuseki → load TTLs → start API → `astro build` (queries API) → tear down services. Cloudflare deploy (`deploy.yml`) ships only `dist/`.

### CI integration — build-exclusive, ephemeral Fuseki + API

The build-time services run **only inside the GitHub Actions deploy job**
(`deploy.yml`, ubuntu-latest → Cloudflare Pages) and are never exposed:

* The job brings the stack up on the runner — Docker `stain/jena-fuseki` via
  `docker compose` (matching the local `build:data` orchestration), loads the 23
  TTLs, starts `src/api/server.js` on `localhost`, runs `astro build` (querying
  the localhost API), then tears the services down. In practice the deploy step
  becomes `npm run build:data` (plus a `src/api` dependency install).
* **Exclusivity:** Fuseki (3031) and the API (3000) bind to `localhost` on the
  ephemeral runner — no published port, no ingress, runner destroyed at job end.
  Only `dist/` (static HTML) uploads to Cloudflare Pages; production never runs,
  reaches, or exposes the API or triplestore. Satisfies §Confirmation #4.
* **Data freshness:** entity pages derive from the ontology, so the `deploy.yml`
  `paths:` filter must additionally trigger on `source/03-standards/ontology/**`,
  `src/api/**`, `scripts/**`, and `docker-compose.yml` — a TTL or query change
  rebuilds + redeploys the pages.
* **Local parity:** the same `npm run build:data` runs on a dev machine and in CI
  (Docker on both), so "works locally" ⇒ "works in CI".

Wired into `deploy.yml` once the local `build:data` pipeline is verified
end-to-end (Phase 2). Until then production keeps deploying the existing static
pages unchanged.

### Separate tasks (independent of the RDF pipeline)

Tactical render/UX fixes that need no triplestore. Recorded here per request; they
neither block nor are blocked by the Fuseki/GRLC entity-page work.

**1. Report generator emits static HTML for embedded meta-markdown, served as the page.**

Editorial meta-pages that embed an existing markdown document MUST serve
**generator-produced static HTML** — NOT a `.md` link through the dev-only
`/resource?path=…` viewer (which never ships to production). A build-time
report generator (the `opda-report-generator` Astro integration,
`src/integrations/generate-report-html.mjs`, on the `astro:config:setup` hook so
it fires for `astro dev`/`astro build` incl. the Cloudflare deploy) converts the
markdown to a static HTML fragment under `src/generated/`; the page serves it via
`set:html`. Shared registry: `src/lib/generated-reports.mjs`. Mirrors hm's
`export-entailed.ts` integration pattern.

* `/manual/validation-report` — `docs/manual/VALIDATION-REPORT.md` → `src/generated/validation-report.html`. **Done.**
* `/manual/information-architecture` + `/manual/information-architecture/{overview,concept-model,logical-model,physical-database,physical-ontology}` — the five `docs/information-architecture/*.md` docs → `src/generated/ia-*.html`, served by the `[spec]` dynamic route; the landing table links to those routes; intra-IA `.md` cross-links are rewritten to routes by the generator. **Done.** (ADR/ODR cross-corpus `.md` links inside the IA docs remain unresolved — same out-of-scope class as the manual's ODR links; the ADR/ODR corpus is not served as site routes.)

**2. Table of contents on overview pages.**

The section/tier overview pages — `/manual`, the four tier landings
(`/manual/concept`, `/manual/logical`, `/manual/physical-database`,
`/manual/physical-ontology`), and the per-module landings — SHOULD carry an
on-this-page table of contents so the long overview pages are navigable. **To do.**
A layout/component addition: `public/ui/client.js` already exposes a `renderToc()`
hook (called from `init()`), so this is likely wiring the expected markup / an
opt-in on the overview templates rather than new machinery. Independent of the
RDF pipeline.

### Consequences

* Good, because entity pages become true, regenerable projections of the ontology — change a TTL, rebuild, the page updates with zero markdown edits.
* Good, because graph-shaped data (typed attributes, relations, SHACL, classification, UFO category) finally surfaces, wiring the four dormant ADR-0017 components (closes G17).
* Good, because a single `opda:` URI keys a coherent cross-tier scheme, so cross-tier links resolve only where a page actually exists.
* Good, because reusing hm's GRLC engine + `.rq`/JSON-LD convention cuts design risk and yields an API reusable for the future `w3id.org` dereference (ADR-0006).
* Bad, because it introduces Jena Fuseki (Java/Docker) + a Node API as **build-time** dependencies — heavier local/CI builds than pure Astro. Mitigation: services are build-time-only; production stays static HTML.
* Bad, because `/manual/` temporarily carries two rendering paths (markdown-driven READMEs/cross-cutting/exemplars vs RDF-driven entities). Mitigation: scoped + documented; the per-kind route dispatcher already branches cleanly.
* Bad, because it partially diverges from ADR-0016's "every page is a markdown content-collection entry" for entity-class pages. Mitigation: only entity-class pages move to RDF; ADR-0016 otherwise stands (nav, non-entity pages, the collection).
* Neutral, because the build-time `.md`→route link rewriter still serves the markdown-driven pages; the two approaches coexist.
* Neutral, because CI build time grows by the Fuseki spin-up + load; acceptable per the ADR-0015 risk table (static builds scale; the cost is build-only).

### Confirmation

The ADR is honoured when:

1. `docker compose up fuseki` (build context) loads the 24 TTLs and the SPARQL endpoint answers a smoke query.
2. The GRLC API serves the opda entity `.rq` endpoints as JSON-LD, at parity with hm's engine behaviour.
3. `astro build` (with Fuseki + API up) emits one static HTML page per entity at the URI-keyed routes; `npx serve dist` renders them with the structured sections (attributes / relations / shapes / classification), not raw markdown.
4. The production deploy (`deploy.yml`) ships only `dist/` — no Fuseki or API process at runtime; a deployed entity page is fully static.
5. Cross-tier links on a sample entity resolve in every tier where a page exists, and are absent (not 404 links) where one does not.
6. Sub-ADR validation reports (per the programme decomposition) land under `docs/adr/validation/` mirroring the ADR-0015 programme discipline.

## Pros and Cons of the Options

### A — Keep markdown collections + link rewriter

* Good, because it is the least work and already partly done (link rewriter landed).
* Good, because the build stays pure-Astro (no Fuseki/API dependency).
* Bad, because pages remain lossy markdown-passthrough — no structured ontology data.
* Bad, because the cross-tier URL problem is unsolved for the physical tiers.

### B — hm's Fuseki + GRLC API + build-time generation

* Good, because ontology-as-source-of-truth, full structural fidelity, coherent cross-tier scheme.
* Good, because it copies a proven reference and yields a reusable SPARQL API.
* Bad, because it adds build-time Java/Docker + Node-API dependencies and build complexity.

### C — Direct Fuseki-from-Astro at build

* Good, because simpler than B (drops the API layer); still data-driven.
* Bad, because it loses the reusable `.rq` catalogue + JSON-LD contract and the path to a live ADR-0006 endpoint; SPARQL gets embedded in Astro loaders.

### D — Precomputed static JSON (no services)

* Good, because zero runtime/build services — pure file generation, simplest CI.
* Bad, because it reimplements query logic outside SPARQL/GRLC, diverging from hm and duplicating the generator; weaker fidelity to the graph.

## Data inventory — what the manual renders from RDF

This inventory scopes the SPARQL `.rq` catalogue the pipeline must produce. Each
manual content element is marked **RDF** (generated from a SPARQL query over the
ontology graph), **Hybrid** (RDF data + a generated artefact such as a laid-out
diagram), or **Editorial** (not present in the ontology — stays markdown per
ADR-0016). Only **RDF** + the RDF half of **Hybrid** move to this pipeline.

### Concept tier — entity pages (SME narrative)

| Element | RDF source | Verdict |
|---|---|---|
| Title / label | `skos:prefLabel` / `rdfs:label` | RDF |
| Summary · "Why it matters" | `rdfs:comment` (A9 narrative) | RDF |
| Identity Criterion | `rdfs:comment` `IC:` verbatim (A9) | RDF |
| Hard cases | `rdfs:comment` `Hard cases:` verbatim (A9) | RDF |
| UFO / DOLCE meta-category | `skos:scopeNote` | RDF |
| Module breadcrumb | `rdfs:isDefinedBy` / source TTL | RDF |
| Cross-tier links | `opda:` URI → per-tier location map (SPARQL) | RDF |
| Source ODR / ADR refs | `dct:source` | RDF |
| IC walk-through diagram | hard-cases narrative (RDF) → generated layout | Hybrid |

### Logical tier — entity pages (engineer ER view)

| Element | RDF source | Verdict |
|---|---|---|
| Summary + UFO/DOLCE + IC | `rdfs:comment` + `skos:scopeNote` | RDF |
| Attributes table — name | `owl:DatatypeProperty` with `rdfs:domain` = class | RDF |
| Attributes table — type | `rdfs:range` (incl. `skos:ConceptScheme` enum ranges) | RDF |
| Attributes table — cardinality / required | SHACL `sh:minCount` / `sh:maxCount` | RDF |
| Attributes table — identity-bearing | identity-bearing annotation | RDF |
| Attributes table — description | property `rdfs:comment` | RDF |
| Relationships table | `owl:ObjectProperty` + `rdfs:domain/range` + `sh:class` + `owl:inverseOf` + `rdfs:comment` | RDF |
| Identity key | IC annotation / `rdfs:comment` + the IC SHACL shape | RDF |
| Constraints | SHACL `sh:message` / `sh:severity` / shape name | RDF |
| Derived attributes | SHACL-AF `sh:rule` | RDF |
| ER diagram | relationships (domain/range/card, RDF) → generated layout | Hybrid |
| Lifecycle state-transition diagram | hard-case transitions (editorial) | Editorial |
| Source ODR / ADR | `dct:source` | RDF |

### Physical-ontology tier — RDF/SHACL/SKOS engineer view

| Page | RDF source | Verdict |
|---|---|---|
| `classes` (Turtle verbatim) | the `owl:Class` blocks — serialise from the graph | RDF |
| `shapes` (SHACL) | `sh:NodeShape` / `sh:PropertyShape` blocks | RDF |
| `annotations` (DPV) | DPV mapping / annotation triples | RDF |
| `vocabularies/*` (SKOS scheme) | `skos:ConceptScheme` + members (`skos:notation`/`prefLabel`/`broader`) | RDF |
| `exemplars/*` | exemplar instance graph + expected SHACL report | RDF |
| three-graph-separation · severity-tiers · shacl-af-rules | architecture explainers | Editorial |

### Physical-database tier — operator deployment view

| Page | RDF source | Verdict |
|---|---|---|
| named-graphs (which graph holds `opda:X`) | `owl:Ontology` header / named-graph IRIs | RDF |
| per-module deployment views | module → class membership | Hybrid (membership RDF + topology config) |
| derived-profiles (validation / ui / inference) | profile membership (RDF) + composer plan (config) | Hybrid |
| content-negotiation (jsonld-context) | the JSON-LD `@context` | Hybrid |
| operations / CI gates | CI workflow YAML | Editorial |

### Non-entity manual pages (stay markdown — ADR-0016)

| Page | Verdict | Note |
|---|---|---|
| Tier READMEs (audience routing, reading order) | Editorial | entity-list within is RDF-derivable (Hybrid) |
| Module READMEs (overview + entity list) | Hybrid | the entity list is a SPARQL `list-entities-in-module` |
| Umbrella README · IA spec pages · validation report | Editorial | meta/structural — no ontology source |

**Net scope for the `.rq` catalogue:** per-entity core (label / comment / scopeNote / classification / dct:source), per-entity attributes (owl + SHACL join), per-entity relationships (owl + inverse + sh:class), per-entity constraints + derived rules (SHACL / SHACL-AF), per-scheme members (SKOS), per-exemplar graph, the cross-tier location map (URI → existing routes per tier), named-graph metadata, and module membership lists. Editorial pages and CI/deployment-config pages remain markdown.

## More Information

* **Reference implementation:** `~/source/hm/semantic-modelling` — `docker-compose.yml` (Fuseki + `api` services), `src/api/` (GRLC engine `lib/grlc-engine.js` + `lib/grlc-handler.js`, `queries/*.rq`, `middleware/`), `Makefile` (`load-ontology`, `fuseki-load`, `website`, `rebuild`), `src/website/` (Astro build-time API consumption). hm describes this as its "ADR-7 GRLC-based implementation".
* **GRLC convention:** SPARQL queries in `.rq` files with `#+` decorator comments (`endpoint` / `method` / `mime` / `entailment`) map to REST routes returning JSON-LD — https://grlc.io.
* **Entity content source:** the 24 emitted TTLs at `source/03-standards/ontology/` (per [ADR-0011](./ADR-0011-module-tbox-emission.md)); each `owl:Class` carries `rdfs:comment` (IC + hard cases), `skos:scopeNote` (UFO/DOLCE), `dct:source`, with SHACL shapes + SKOS classification alongside.
* **Predecessor / dependency ADRs:** [ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md) (manual integration anchor — this ADR changes the *entity-page* rendering mechanism it chose, but ADR-0015's navigation, collection, and non-entity pages stand); [ADR-0016](./ADR-0016-manual-content-collection-wiring.md) (collection + per-tier routes this extends); [ADR-0011](./ADR-0011-module-tbox-emission.md) (entity RDF source).
* **Forward link:** the build-time SPARQL API is a stepping stone toward the live `opda.org.uk/pdtf/<EntityLocalName>` content-negotiated dereference ([ADR-0006](./ADR-0006-uri-strategy-and-dereferencing.md)) — out of scope here (this ADR is build-time-only), but the `.rq` catalogue + JSON-LD contract are designed to be reusable there.
* **Amendment (2026-06-01, ADR-0035):** `scripts/fuseki-load.mjs` (this ADR's loader) gained a `materializeEntailments()` step — the OWL-RL-safe load-time closure (ODR-0025/0026) materialised into `https://opda.org.uk/pdtf/graph/inferred/entailment` via a SPARQL-`INSERT` fixpoint over Jena's union-graph, plus a post-load `owl:disjointWith` consistency gate. **Status: wired into the loader but NOT yet run against a live Fuseki** — `build-with-data.mjs` (which invokes it) is Docker/CI-only and has not executed this session; `docker-compose.yml` still pins `stain/jena-fuseki:latest` (ADR-0036 calls for a Jena 6.1.0 image) and no `ci-inference-closure` gate exists yet. Follow-up: pin the image, run the pipeline end-to-end, add the closure gate.
* **Out of scope:** the full hm site (modelling / governance / dashboard pages); the hm `chat` + `nginx web` services; non-entity manual pages (tier/module READMEs, cross-cutting topics, IA — stay markdown per ADR-0016); runtime triplestore/API in production.
