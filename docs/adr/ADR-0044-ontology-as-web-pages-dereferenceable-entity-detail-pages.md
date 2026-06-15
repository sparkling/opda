---
status: proposed
date: 2026-06-14
tags: [ontology, information-architecture, ssg, sparql, dereferenceability, linked-data, detail-pages, shacl, skos, bounded-context, doc-drift-gate]
supersedes: []
depends-on: [ADR-0021, ADR-0041, ADR-0039, ADR-0043, ODR-0004]
implements: []
---

# Ontology as web pages — dereferenceable per-entity detail pages, SPARQL-driven SSG

## Context and Problem Statement

The `/ontology` section is the published, authoritative reference for the OPDA PDTF ontology. Today it is a set of **aggregate index pages** (`classes`, `properties`, `vocabularies`, `shapes`, …) that:

- **parse the TTL with brittle regex** (`fs.readFileSync` + `split(/\n(?=opda:…/)` + `match(/rdfs:comment "…"/)`) — line-fragile, can't follow relationships, can't resolve blank nodes, and silently misses anything the regex doesn't anticipate; and
- **defer all per-term detail to the embedded pyLODE/WIDOCO/Ontospy renderings** (the ADR-0041 "combination principle" — don't rebuild what the tools render).

The consequence: there is **no canonical, native page for any individual class, property, shape, concept, scheme, or bounded context**. A reader who wants "what is `opda:Property`, what links to it, what datatype attributes it carries, which shapes constrain it, which schemes it draws on" gets a row in a table and an iframe to a 1.8 MB tool bundle. Crucially, **the ontology's own IRIs do not dereference**: `https://opda.org.uk/pdtf/Property` is a real, minted identifier (ADR-0039 publishes the model there), but resolving it yields only the bulk `opda-merged.ttl` dump, not a page for that term. The ontology is published as files, not as **web pages**.

Two assets already exist and are under-used:

1. **ADR-0021 built a GRLC SPARQL→REST API** (`src/api/`, queries in `src/api/queries/*.rq`, content-negotiation middleware) and a build-time fetch helper (`src/lib/entity-api.ts`) whose `EntityDetail` contract already carries `attributes[]` (datatype props), `relationships[]` (object props, **with inverse**), `constraints[]` (SHACL message/severity/shape), `dctSource[]`, and cross-tier links. It is queried by the **`/model` presentation tier**, not by `/ontology`.
2. **The project already does SSG per-entity fan-out** — `src/pages/model/**/[...slug].astro` use `getStaticPaths()` to emit one static page per entry, dispatching by kind to `EntityPage` / `SchemePage` / `ExemplarPage` components.

So the mechanism (SSG + SPARQL) exists; it has simply never been pointed at the authoritative `/ontology` reference. And — per the directing authority — **the ontology is small** (~40 classes, ~30 object + ~226 datatype properties, ~314 SKOS concepts / ~48 schemes, ~58 declared SHACL shapes, 7 bounded contexts), so generating a page per resource at build time is cheap and needs no pagination, lazy-loading, or runtime querying.

This ADR settles **how to turn the ontology into dereferenceable web pages**: a canonical SSG page per resource, driven by SPARQL (not regex), showing each resource's incoming and outgoing connections and cross-linking to every related SKOS / SHACL / bounded-context page.

## Decision Drivers

* **Every resource gets a page** — classes, properties, shapes, concepts, schemes, bounded contexts (and the further types enumerated below). No resource is reachable only as a table row or inside a tool iframe.
* **Incoming *and* outgoing connections.** The new, hard requirement: a class page must show what it points to **and what points at it** (inverse / range-of). Regex can't do this; SPARQL can.
* **Dereferenceability ("ontology as web pages").** `https://opda.org.uk/pdtf/{LocalName}` should resolve — HTML for browsers, Turtle for machines — making each IRI a first-class web page (the Linked Data "follow-your-nose" contract).
* **SPARQL as the data source**, not regex — correct, relationship-aware, blank-node-resolving, reusing the ADR-0021 query layer / `EntityDetail` contract.
* **SSG.** Pages are generated at build time via `getStaticPaths`; no runtime server (consistent with the static-CDN deploy).
* **Anti-drift parity** with the corpus — the page data is generated and CI-gated (ODR-0004 §6a), like every other ontology artefact.
* **Link integrity & correctness** — every link (internal cross-link **and** external reference) is validated, and **all errors are fixed**, before publish; a broken link or render error fails the build, not the reader.
* **Simplicity** — the ontology is small; the solution must be the minimal SSG + one SPARQL pass, not a heavy framework.
* **Compose, don't duplicate** — reuse the ADR-0021 contract and the ADR-0043 build-time SPARQL extractor; keep pyLODE/WIDOCO as embedded *extras*, not the per-term reference.

## Considered Options

* **Option A (chosen) — SPARQL-driven SSG per-entity pages, canonical at the dereferenceable IRI.** One build-time SPARQL pass materialises a committed `ontology-model.json` (incoming + outgoing, attributes, constraints, SKOS, contexts); `getStaticPaths` fans it out into a page per resource; the canonical URL is the IRI itself (`/pdtf/{LocalName}`, with a Turtle CBD fragment for `Accept: text/turtle`), and the `/ontology/*` aggregate pages become typed indexes that link to the detail pages. Reuses/extends the ADR-0021 `EntityDetail` contract and composes with the ADR-0043 extractor.
* **Option B — Keep deferring to pyLODE/WIDOCO/Ontospy** (status quo; the ADR-0041 combination principle unchanged). Rejected: the tools render OWL-only term refs (no SKOS browser, no SHACL, no incoming connections, no bounded-context view), aren't themeable, and the IRIs still don't dereference.
* **Option C — Keep regex parsing but add per-entity pages.** Rejected: regex cannot compute incoming relationships, resolve SHACL blank nodes, or follow SKOS hierarchies; it is exactly the fragility this ADR removes.
* **Option D — Live/runtime querying** (client-side SPARQL or an always-on API behind the pages). Rejected: the site is a static CDN deploy with no runtime server; build-time SSG is the established pattern and needs no live endpoint.

## Decision Outcome

Chosen option: **"Option A — SPARQL-driven SSG per-entity pages, canonical at the dereferenceable IRI."** It is the only option that satisfies the driver set: it gives every resource a native page with **incoming and outgoing** connections (SPARQL over the build-time Fuseki / committed TTL), makes the IRIs dereference (HTML + Turtle), runs entirely at build time (SSG, no runtime server), reuses the ADR-0021 contract rather than inventing a new one, and is gated against drift like the rest of the corpus. Given the ontology's small size, this is a modest, bounded build (~720 HTML pages + ~720 Turtle fragments) with no need for runtime infrastructure.

This **revises (does not retire) ADR-0041's combination principle for the native per-term layer**: the native reference now renders per-term detail itself; pyLODE/WIDOCO/Ontospy move from *"the per-term reference"* to *embedded comparison extras* on `/ontology/bake-off`. ADR-0041's section structure, doc-drift gate, and bake-off all survive — see *Supersession scope* below. The graph diagram on each entity page is the ADR-0043 Cytoscape neighbourhood view, fed by the same SPARQL extraction.

### Supersession scope

ADR-0041 is **not** superseded (not listed in `supersedes:`). What changes is one sub-stance: ADR-0041 §"Combination principle" said the per-term class/property reference is *delegated to the OWL tools*. This ADR brings that layer **in-house** (native, SPARQL-driven, themed, cross-linked, dereferenceable). Everything else in ADR-0041 — the 0–17 section outline, the [HAND]/[GEN] split, the doc-drift CI gate, the bake-off and its scorecard — remains in force. The OWL tools remain generated and embedded as extras.

### The page inventory ("ontology as web pages")

Canonical page per resource at the dereferenceable IRI; typed `/ontology/*` indexes link in. Counts are current corpus size.

| # | Page type | Route (typed index → canonical) | ~Count | The directing-authority asks it answers |
|---|---|---|---:|---|
| 1 | **Class** | `/ontology/class/{slug}` → `/pdtf/{LocalName}` | ~40 | **Outgoing** object props (domain→range), **incoming** object props (what points here, via inverse/range-of), **datatype properties** table, governing **SHACL shapes**, **SKOS schemes** used by coded ranges, **bounded context**, subclass/superclass, UFO category, `dct:source`. |
| 2 | **Property** (object + datatype) | `/ontology/property/{slug}` → `/pdtf/{localName}` | ~256 | **Subjects** (domain classes, linked), **Objects** (range class if object prop; **datatype detail** if datatype prop), **inverse** (linked), cardinality, characteristics, constraining **SHACL shapes**, coded **SKOS scheme** if the range is a vocabulary, bounded context, `dct:source`. |
| 3 | **SHACL shape** | `/ontology/shape/{slug}` → `/pdtf/{ShapeName}` | ~58 | Target (class / `targetSubjectsOf`), the constraints **resolved (no blank nodes)** — datatype, cardinality, `sh:in`, severity tier — the property/class it shapes (linked), the overlay profile it belongs to, SHACL-AF rules. |
| 4 | **SKOS concept** | `/ontology/concept/{slug}` → `/pdtf/{conceptId}` | ~314 | prefLabel/altLabels, definition, **scheme** membership (linked), `broader`/`narrower`/`related` (linked), the **properties that range on it**, `dct:source`. |
| 5 | **SKOS scheme** | `/ontology/scheme/{slug}` → `/pdtf/{schemeId}` | ~48 | Concept tree (`hasTopConcept` + broader/narrower), count, the properties whose range is this scheme, link to the SKOS Play! / Skosmos rendering. |
| 6 | **Bounded context** | `/ontology/context/{slug}` → `/pdtf/{contextId}` | 7 | The module's classes / properties / shapes / schemes (all linked), the defining ODR, the module TTL download, a context-level graph diagram. |

### Other individual pages identified (beyond the explicit ask)

| Page type | Route | ~Count | Why we need it |
|---|---|---:|---|
| **Overlay profile** | `/ontology/profile/{slug}` | ~31 | Per form (BASPI5, TA6/7/10, …): its bound shapes, the gap register (thin-vs-bound), the questions it covers. The `profiles` aggregate page already exists — explode it. |
| **Exemplar** | `/ontology/exemplar/{slug}` | ~17 | Per round-trip exemplar: the input data + expected SHACL report. `exemplars.astro` already lists them — give each a page. |
| **UFO meta-category** | `/ontology/category/{slug}` | ~8 | Kind / Role / Relator / Quality / Mode / RoleMixin … — the classification-doctrine facet axis; groups classes by foundational category (the "facets not subclass trees" view). |
| **Namespace / prefix map** | `/ontology/namespaces` | 1 | The prefix table + the ADR-0006 kind-split collision-avoidance rationale, as a resolvable page (currently inlined). |
| **Datatypes** | `/ontology/datatypes` | 1 | The `xsd:` + any custom datatypes the properties use, each with the properties that use it (a small reference, optional). |
| **Entity index / sitemap** | `/ontology/index` (extend §16 glossary) + `sitemap` | 1 | A-Z index of every resource linking to its detail page; a machine sitemap of all dereferenceable IRIs. |
| **Dereference route** | `/pdtf/[name]` (HTML) + `/pdtf/[name].ttl` (CBD) | ~720 | Makes every IRI resolve. **Pure SSG**: the bare IRI serves the HTML page, with `<link rel="alternate" type="text/turtle" href="{name}.ttl">` + download; the `.ttl` is a static Astro endpoint. True `Accept`-header conneg on the bare IRI is an **optional edge enhancement** (CloudFront/Lambda@Edge), not required. This **is** the "ontology as web pages" contract. |

### What every detail page shows (common shell)

A themed Astro page (reusing the design system + dark mode; the ADR-0043 Cytoscape neighbourhood graph): the term's label + IRI (copyable) + `rdfs:comment`; **outgoing** connections; **incoming** connections (the new capability); the type-specific facets above; `dct:source` provenance linked to the ODR/ADR/council lineage; the bounded-context badge; "open in pyLODE/WIDOCO/Skosmos" extras; and **Turtle / JSON-LD download** of that resource's description — **CBD + one hop** (this resource plus a bit about its immediate neighbours — operator decision §Decisions c).

### Generation & routing plan (SSG + SPARQL, minimal)

1. **One build-time SPARQL extraction** (`scripts/ontology-model.mjs`) — runs `CONSTRUCT`/`SELECT` against the **build-time Fuseki + GRLC API** (`npm run build:data`; **required** — operator decision §Decisions b), emitting a committed `src/data/ontology-model.json`: every resource with its **outgoing and incoming** edges (incoming via inverse / `?x ?p thisIRI`), attributes, resolved constraints, SKOS hierarchy, scheme/context membership. The JSON is still materialised + committed (for the doc-drift gate and ADR-0043 sharing) even though the data source is the live triplestore. Extends the ADR-0021 `EntityDetail` contract with an `incoming[]` field. **This is the same extraction ADR-0043 needs for the graph diagrams — author it once, emit both the page model and the `elements.json`.**
2. **SSG routes — pure static (`output: 'static'`, no adapter; confirmed).** `src/pages/ontology/{class,property,shape,concept,scheme,context,profile,exemplar,category}/[slug].astro`, each `getStaticPaths()` over the model JSON (the data is read at build, inside `getStaticPaths` — no runtime query). Plus `src/pages/pdtf/[name].astro` (canonical HTML page, `build.format: 'file'` so the bare IRI resolves without a trailing-slash redirect) and `src/pages/pdtf/[name].ttl.ts` (a **static file endpoint** — `getStaticPaths()` + `GET` → Turtle `Response`, written as `/pdtf/{name}.ttl` at build). No SSR, no adapter, no runtime server.
3. **Components** — `src/components/ontology/` (ClassPage, PropertyPage, ShapePage, ConceptPage, SchemePage, ContextPage), reusing the `/model` `EntityPage`/`SchemePage` patterns where they fit.
4. **Aggregate pages → typed indexes** — rewrite `classes`/`properties`/`shapes`/`vocabularies`/`profiles` to read the model JSON (delete the regex parsers) and link to the detail pages; extend the §16 alphabetical index to link every term.
5. **Cross-linking** — every IRI reference in any page resolves to its detail page (class↔property↔shape↔concept↔scheme↔context).
6. **Doc-drift gate** — `ontology-model.json` is regenerated + diffed in CI (ODR-0004 §6a).
7. **Validate all links & fix all errors (final sweep).** A build-time validator crawls every generated page and checks: (a) **internal links** — every `opda:` IRI reference resolves to an emitted page, no dangling cross-link, no orphan page; (b) **external links** — every off-site URL (specs, ODR/ADR lineage, tool renderings, the ADR-0043 resource set) returns 200 (cached, allow-listed, rate-limited); (c) **render/structure errors** — no empty required section, no unresolved blank node, no malformed Turtle CBD, valid HTML, no broken anchors. **Every error found is fixed**, then the sweep is re-run until clean; CI fails on any remaining error.

### Consequences

* Good, because every ontology resource becomes a real, themed, cross-linked web page — the reference stops being "tables + tool iframes."
* Good, because **incoming connections** are shown for the first time (SPARQL inverse/range-of) — the relational structure is finally navigable both directions.
* Good, because the **IRIs dereference** (HTML + Turtle) — the model is published *as the web of pages it claims to be* (ADR-0039 / Linked Data), not just as bulk files.
* Good, because the regex TTL parsing is retired in favour of SPARQL — correct, relationship-aware, blank-node-resolving, and reusing the ADR-0021 contract.
* Good, because one SPARQL extraction feeds **both** the detail pages and the ADR-0043 graph diagrams — no duplicated data path.
* Good, because the page model is generated + CI-gated, so the new pages inherit the corpus's anti-drift discipline.
* Bad, because it adds ~720 generated pages + a build-time SPARQL step and new components — real engineering, and a longer build (bounded, given the small corpus).
* Bad, because per the operator's build-mode choice (§Decisions b) these pages **require the live Fuseki + GRLC stack** (`build:data`) — plain `make build` and a bare `astro dev` won't render them (they fall back to markdown), so local preview of the entity pages needs `make serve-data`.
* Neutral, because dereferenceability is fully achievable in pure SSG via distinct URLs (HTML page + a static `.ttl` endpoint + `rel="alternate"`); true `Accept`-header content negotiation on the bare IRI is an *optional* edge enhancement (the deploy's CloudFront/Lambda@Edge), not a build-time requirement.
* Neutral, because pyLODE/WIDOCO/Ontospy remain generated and embedded as extras (no work removed, just re-framed from "the reference" to "comparisons").
* Neutral, because URL collisions are avoided by the ADR-0006 kind-split (local names are unique within `opda:`), so a flat `/pdtf/{LocalName}` is safe.

### Confirmation

* **Implementation status (2026-06-15): Phases 1–8 implemented + validated** (`make build-data` green; `status: proposed`, pending operator ratification). Every class / property / shape / concept / scheme resolves to a themed HTML page at `/pdtf/{id}` (+ the 7 bounded-context pages at `/ontology/context/{id}`), each with incoming **and** outgoing connections; the `/pdtf/{id}.ttl` Turtle alternate is riot-valid and carries `rel="alternate"`; the typed `/ontology/*` indexes link in with the brittle regex parsers retired; the model doc-drift gate (`make ci-ontology-model`) and the link-validation sweep (`make check-links`) are wired into the deploy CI. The UFO meta-category is now a structured `opda:ufoCategory` facet on the classes (no longer free-text), driving the `/ontology/category/{slug}` pages (Phase 5). **⚠ Correction (2026-06-15, [session-041](../ontology/odr/council/session-041-ufocategory-upper-ontology-representation.md)):** Phase 5c emitted the `opda:ufoCategory` declaration + tags into the **reasoned/classes** graph, breaching [ODR-0030](../ontology/odr/ODR-0030-foundational-ontology-choice.md) Rule 1 (annotation-graph-only). Corrected by [ADR-0045](ADR-0045-ufocategory-quarantine-restoration-gufo-scheme-sixth-gate.md) + [ODR-0031](../ontology/odr/ODR-0031-ufocategory-upper-ontology-representation.md) (retype `owl:AnnotationProperty`, relocate to `opda-annotations.ttl`, add a sixth three-graph gate).
* Each ontology resource resolves to a page; `getStaticPaths` emits exactly one page per resource in `ontology-model.json` (counts asserted by a build check: pages == model entries).
* **Incoming + outgoing** sections are present and correct on class/property pages (spot-checked against SPARQL: `opda:Property` shows `isVestedIn` outgoing **and** its inverse incoming).
* IRIs dereference (pure SSG): a browser hitting `…/pdtf/Property` gets the HTML page; `…/pdtf/Property.ttl` returns the Turtle CBD; the page carries `<link rel="alternate" type="text/turtle">`. *(If the optional edge layer is enabled, `curl -H "Accept: text/turtle" …/pdtf/Property` returns the CBD directly.)*
* The doc-drift gate diffs `ontology-model.json` against a fresh regeneration.
* **The final link-and-error sweep is clean**: every internal cross-link resolves (no dangling `opda:` link, no orphan page), every external URL returns 200, and there are no render/structure errors — all errors found are fixed and the sweep re-run to green before publish; CI blocks on any failure.
* Operator inspection ratifies publication (status `proposed` → `accepted`).

## Pros and Cons of the Options

### Option A — SPARQL-driven SSG per-entity pages (chosen)

* Good, because it is the only option delivering incoming connections, dereferenceable IRIs, and native cross-linked pages together.
* Good, because it reuses ADR-0021 (API contract) + ADR-0043 (extractor) + the proven `getStaticPaths` pattern — little net-new architecture.
* Bad, because it is the most build-time work (extraction + routes + components + conneg).

### Option B — Keep deferring to pyLODE/WIDOCO/Ontospy

* Good, because zero new work; the renderings already exist.
* Bad, because OWL-only (no SKOS/SHACL/contexts), no incoming connections, unthemeable, and the IRIs still don't dereference — fails every driver.

### Option C — Per-entity pages but keep regex parsing

* Good, because it avoids standing up SPARQL at build.
* Bad, because regex fundamentally cannot compute incoming edges, resolve SHACL blank nodes, or follow SKOS hierarchies — the core requirements are unreachable.

### Option D — Live/runtime querying

* Good, because always fresh, no build-time materialisation.
* Bad, because the deploy is a static CDN with no runtime server; it breaks the hosting model and adds an availability dependency.

## More Information

- **Builds on the SPARQL API + entity contract:** [ADR-0021] (`src/api/`, `src/lib/entity-api.ts`, `src/api/queries/*.rq`).
- **Revises (per *Supersession scope*) the per-term-reference stance of:** [ADR-0041](ADR-0041-ontology-reference-document-generation.md) (the `/ontology` reference composition + doc-drift gate + bake-off).
- **Dereferenceability target / publish location:** [ADR-0039](ADR-0039-linked-data-model-as-pdtf-standards-foundation.md) (the model published at `https://opda.org.uk/pdtf/`).
- **Shared build-time SPARQL extractor + on-page graph diagrams:** [ADR-0043](ADR-0043-ontology-graph-diagram-tooling.md) (Cytoscape neighbourhood views; one extraction feeds both).
- **Anti-drift / byte-identity gate discipline:** ODR-0004 §6a (`make verify-ontology`).
- **IRI scheme:** `opda:` = `https://opda.org.uk/pdtf/` (e.g. `…/pdtf/Property`); local-name uniqueness via the ADR-0006 kind-split.

### Phased plan (lean; the ontology is small)

1. **Model extraction — ✅ DONE (2026-06-15).** `scripts/ontology-model.mjs` queries live Fuseki → committed **deterministic** `src/data/ontology-model.json` (incoming+outgoing, datatype attributes, blank-node-resolved SHACL constraints, SKOS hierarchy, scheme/context membership, `dct:source`); wired into `build:data` step 3.5 + `make ontology-model` / `npm run ontology:model`. Validated against the corpus: 40 classes · 30 obj + 226 data props · 325 shapes · 314 concepts · 48 schemes; byte-identical re-run (gate-ready); `Property` shows both incoming **and** outgoing. Shared with the ADR-0043 `elements.json` (same extraction). *Refinement — ✅ done: the generator now excludes the cross-cutting `shapes`/`vocabularies`/`contexts` graphs so `contexts` is the canonical 7 bounded contexts.*
2. **Class + Property detail pages — ✅ DONE.** `/pdtf/[...name]` catch-all + `ClassDetail`/`PropertyDetail`; incoming **and** outgoing connections, datatype attributes, governing shapes, provenance, cross-links. (`opda:Property` shows both directions.)
3. **Shape + Concept + Scheme + Context pages — ✅ DONE.** Shapes (blank-node-resolved constraints), concepts, schemes on `/pdtf`; the 7 bounded contexts at `/ontology/context/[slug]` (contexts are graph-derived module groupings, not minted term IRIs, so they live under `/ontology`, not `/pdtf`).
4. **Aggregate pages → typed indexes — ✅ DONE.** classes / properties / vocabularies / shapes / glossary read the model and link to `/pdtf`; the brittle regex parsers are retired; the A–Z glossary links all named resources.
5. **Other pages — ✅ DONE.** namespaces, datatypes, per-profile, per-exemplar, and UFO meta-category pages shipped. The UFO category was promoted from documentary free-text (`skos:scopeNote`) to a structured `opda:ufoCategory` facet on every class (mirroring the SKOS schemes; emitter `ufo_categories.py`), so `/ontology/category/{slug}` groups classes soundly without a fragile prose parse — 39/40 classes (`opda:SpecialCategoryScheme` is a SKOS ConceptScheme container, not UFO-typed). Built byte-identically + gate-clean. **⚠ Corrected by [ADR-0045](ADR-0045-ufocategory-quarantine-restoration-gufo-scheme-sixth-gate.md) (session-041):** the facet was emitted into the **classes/reasoned** graph, not the annotation graph — an ODR-0030 Rule 1 breach the three-graph gate did not catch ("gate-clean" was false-clean). ADR-0045 relocates it to `opda-annotations.ttl`, retypes it `owl:AnnotationProperty`, adds the missing sixth CI check, and mints the gUFO-aligned `opda:UFOCategoryScheme`.
6. **Dereferenceability (pure SSG) — ✅ DONE.** `/pdtf/[...name]` HTML + `/pdtf/[...name].ttl` static endpoint + `rel="alternate"`. As-built uses the site-wide `build.format: 'directory'` + `trailingSlash: 'never'` (the bare IRI resolves via `index.html`) rather than `'file'` — no global config change required.
7. **Doc-drift gate — ✅ DONE.** `scripts/ci-ontology-model-drift.mjs` (`make ci-ontology-model`) regenerates + diffs the model; the deploy workflow enforces it with a `git diff` after `build:data`. PASS/FAIL both validated against live Fuseki.
8. **Validate all links & fix all errors — ✅ DONE.** `scripts/check-links.mjs` (`make check-links`, wired into the deploy workflow) crawls `dist/`; the `/ontology` + `/pdtf` surface has **0 dangling links · 0 orphan pages** and all `.ttl` files are riot-valid. Off-scope site links (edge-auth, the resource viewer, `/manual` redirects) are reported, not blocked; live external-URL 200-checking is a separate rate-limited pass.

### Decisions (operator, 2026-06-15)

* **(a) Canonical URL — the IRI *is* the page.** Each resource's canonical page is served at its own IRI path, `/pdtf/{LocalName}` (pure SSG, `build.format: 'file'` so the bare IRI resolves with no trailing-slash bounce; `.ttl` alternate alongside). The typed `/ontology/{type}/{slug}` lists are navigation that links in — not the canonical address. *(Truest Linked-Data dereferenceability.)*
* **(b) Build data — start the triplestore each build.** The model is extracted from the **live build-time Fuseki + GRLC API** (`npm run build:data`), reusing the ADR-0021 stack — not pre-parsed from files via Comunica. Consequence: **`build:data` is required** to generate these pages; plain `make build` (no triplestore) will not produce them, and `astro dev` without the stack degrades to the existing markdown fallback (entity-api.ts). The query result is still materialised to a committed `ontology-model.json` so the doc-drift gate and the ADR-0043 graph share one artefact.
* **(c) Turtle download depth — CBD + one hop.** Each resource's `.ttl` carries its Concise Bounded Description **plus one hop** (a little about its immediate neighbours) — richer for offline exploration, accepting larger files and some repetition across pages.
