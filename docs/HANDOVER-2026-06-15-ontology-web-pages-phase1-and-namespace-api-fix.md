# Handover — Graph-diagram tooling decision, the "ontology as web pages" ADR + Phase 1, and the namespace API fix (2026-06-15)

**Author:** Henrik (with Claude). **Scope:** one session that (1) researched and decided **graph-diagram tooling** for the ontology (ADR-0043), (2) wrote **ADR-0044 — ontology as dereferenceable web pages** (per-entity SSG detail pages, SPARQL-driven) and resolved its operator decisions, (3) discovered and **fixed the GRLC API namespace** (it was still querying the dead `w3id.org/opda/#`), and (4) **implemented ADR-0044 Phase 1** — the build-time SPARQL extraction → committed `src/data/ontology-model.json`. **Status: ALL CHANGES ARE LOCAL + UNCOMMITTED — nothing committed, pushed, or deployed** (commit-only-when-asked). Working tree also carries pre-existing unrelated edits from before this session. Phase 1 was run + validated against a live Fuseki (`make serve-data` was up).

> Continues [HANDOVER-2026-06-14](./HANDOVER-2026-06-14-ontology-reference-section-councils-and-retirement.md) (the `/ontology` reference section + bake-off) and the [2026-06-02 namespace migration](./HANDOVER-2026-06-02-namespace-migration-executed.md) (whose API-layer gap this session closed).

---

## TL;DR

The `/ontology` reference (ADR-0041) has aggregate index pages but **no per-entity pages** and the IRIs do not dereference. This session set the foundation to fix that: a tooling decision for graph diagrams (**Cytoscape.js**, ADR-0043), a full plan to turn the ontology into **dereferenceable web pages** (**ADR-0044**), and the **Phase 1 extraction** both depend on — one build-time SPARQL pass that materialises a committed, deterministic model of every class/property/shape/concept/scheme with **incoming and outgoing** connections. Along the way: the GRLC API was found querying the **wrong (pre-migration) namespace** and fixed; the residual stale-*scheme* content is tracked in **issue #1**.

---

## What shipped (all uncommitted — working tree)

| Area | Artifact | State |
|---|---|---|
| **Research** | `docs/ontology/research/graph-diagram-tooling.md` — 25 tools scored on a weighted rubric, link-validated; recommendation: Cytoscape.js + composition | new |
| **ADR-0043** | `docs/adr/ADR-0043-ontology-graph-diagram-tooling.md` — graph-diagram engine decision (`proposed`) | new |
| **ADR-0044** | `docs/adr/ADR-0044-ontology-as-web-pages-dereferenceable-entity-detail-pages.md` — per-entity SSG detail pages, SPARQL-driven, dereferenceable IRIs (`proposed`) | new |
| **Phase 1 (ADR-0044)** | `scripts/ontology-model.mjs` (extraction) + `src/data/ontology-model.json` (committed model, ~947 KB) | new |
| **Phase 1 wiring** | `scripts/build-with-data.mjs` (step 3.5), `package.json` (`ontology:model`), `Makefile` (`ontology-model`) | edited |
| **Namespace API fix** | `src/api/{lib/namespace-map.js, lib/grlc-handler.js, server.js, routes/operational.js, queries/*.rq, README.md}` → `https://opda.org.uk/pdtf/` + kind sub-namespaces | edited |
| **Namespace small fixes** | `src/pages/model/index.astro` (prose), `tools/opda-gen/src/opda_gen/term_sourcing.py` (stale comment) | edited |
| **Tracking** | GitHub **issue #1** — remaining stale-scheme content (`public/data/*.js` + 3 `/modelling` pages) | created |
| **AgentDB** | ADR-0043 + ADR-0044 registered (`adr/`, `adr-patterns`, causal edges); `research-synthesis` memory for the graph-tooling study | stored |

> `Makefile` and `package.json` also appear modified for unrelated/pre-existing reasons; my additions are the single `ontology-model` target + `ontology:model` script.

---

## ⚠ Things a reader MUST know

1. **Nothing is committed.** Every file above is a working-tree edit. The tree also has pre-existing unrelated changes (skosmos config, `site.ts`, `bake-off.astro`, the untracked `ADR-0039`/`ODR-0030`/`session-040`/`linked-data-initiative` etc. that predate this session). **Stage selectively when committing.**
2. **The namespace is `https://opda.org.uk/pdtf/`** (ADR-0006 as-built kind-split: terms `/pdtf/`, SKOS `/pdtf/scheme/`, SHACL `/pdtf/shape/`, graphs `/pdtf/graph/<module>`, governance `/pdtf/harness/`). SoT = `tools/opda-gen/src/opda_gen/namespaces.py`. **The GRLC API (`src/api/`) was still on the old `w3id.org/opda/#`** and therefore returned nothing against live data — now fixed. Don't reintroduce w3id.
3. **Phase 1 + the ADR-0044 pages require the live stack.** Operator decision: data comes from Fuseki each build (`make serve-data` / `npm run build:data`). Plain `make build` / bare `astro dev` will NOT have the model — entity pages fall back to markdown (the existing `entity-api.ts` behaviour). To regenerate the model locally: `make serve-data` (in one shell) then `make ontology-model`.
4. **`src/data/ontology-model.json` is deterministic** (byte-identical re-run) → ready for the Phase 7 doc-drift gate. It is the **shared** source for the ADR-0044 detail pages AND the ADR-0043 on-page graphs.
5. **ADR-0043 and ADR-0044 are `proposed`.** Operator ratifies on inspection.
6. **Issue #1 is NOT a host-swap.** `public/data/*.js` + `/modelling/{concept-taxonomy,data-dictionary,jsonld-mappings}` encode a *superseded URL scheme* (`/class/`, `/concept/`, `/context/{ctx}/concept/`, `/enum/`) that predates the flat kind-split. A find-replace would make them authoritative-but-wrong. Fix = correct the `public/data` generator + rewrite the page prose to the flat scheme. Deliberately preserved: historical records, and `ontology/{usage,known-issues}.astro` (they intentionally cite the old namespace).

---

## Decisions made this session (operator, recorded)

- **ADR-0044 (a) canonical URL = the IRI itself** — `/pdtf/{LocalName}` is the page (pure SSG, `build.format: 'file'`, `.ttl` alternate; `Accept`-conneg is an optional CloudFront/Lambda@Edge enhancement, not required).
- **ADR-0044 (b) build data = live Fuseki each build** (`build:data` required; not Comunica-over-files), reusing the ADR-0021 stack; still materialise a committed model for the gate + ADR-0043.
- **ADR-0044 (c) Turtle download = CBD + one hop.**
- **ADR-0043:** Cytoscape.js as the interactive ontology-graph engine (fed by build-time JSON, themed from the CSS dark-mode tokens); keep Mermaid for authored subgraphs; rdf2dot/Graphviz (or D2) as the static, byte-gateable complement; WebVOWL-via-WIDOCO retained as a free OWL-only extra.
- **Namespace:** fix the API now (done); defer the stale-scheme content (issue #1) and proceed to Phase 1.
- **ADR-0044 also gained** a final "validate all links & fix all errors" phase (driver + plan phase 8 + confirmation gate, CI-blocking).

---

## What's left (next session)

1. **Commit** Phase 1 + the namespace API fix + the two ADRs + the research report (stage selectively — the tree is mixed).
2. **ADR-0044 Phase 2** — the class + property **detail routes** (`getStaticPaths` over `ontology-model.json`): incoming/outgoing connections, datatype attributes, constraining shapes, cross-links. Then Phases 3 (shape/concept/scheme/context pages), 4 (aggregate→typed indexes; retire the regex parsing), 5 (profiles/exemplars/UFO-categories/namespaces/datatypes), 6 (dereference route `/pdtf/[name]` + `.ttl`), 7 (doc-drift gate over the model), 8 (link-validation sweep).
3. **Issue #1** — the `public/data` generator + 3 `/modelling` pages stale-scheme rewrite.
4. **Phase 1 refinement** — `contexts` in the model currently includes the cross-cutting `shapes`/`vocabularies`/`contexts` graphs alongside the 7 real bounded contexts; the context *pages* (Phase 3) should filter to the canonical 7 (defined in `opda-contexts.ttl` / ODR-0019/0020).

---

## Key pointers

- **Run Phase 1:** `make serve-data` (shell 1) → `make ontology-model` (shell 2), or it runs automatically as step 3.5 of `npm run build:data`. Endpoint override: `FUSEKI_ENDPOINT`.
- **Model shape:** `src/data/ontology-model.json` → `{ namespace, counts, classes{}, objectProperties{}, datatypeProperties{}, shapes{}, concepts{}, schemes{}, contexts{} }`, each keyed by the path-after-`/pdtf/` id. Classes carry `attributes / outgoing / incoming / shapes / usesSchemes / dctSource`.
- **Contract to extend:** `src/lib/entity-api.ts` `EntityDetail` (the model adds `incoming[]`).
- **Namespace SoT:** `tools/opda-gen/src/opda_gen/namespaces.py`. **API:** `src/api/` (GRLC over Fuseki :3031). **Loader graphs:** `scripts/fuseki-load.mjs` → `…/pdtf/graph/<module>`.
- **Issue:** https://github.com/sparkling/opda/issues/1
- **Counts (current corpus):** 40 classes · 30 object + 226 datatype props · 325 SHACL node shapes · 314 SKOS concepts · 48 schemes.

## Memory

Survivors reinforced: [[opda-work-directly-on-main]], [[opda-deploys-via-ci-only]], [[opda-schemas-nested-repo]]. New fact worth holding: the **canonical namespace is `https://opda.org.uk/pdtf/`** (w3id is dead post-2026-06-02; the API lagged and was fixed this session). Deferred-work register is **ADR-0005 §G** (issue #1 mirrors a register-class item).

## State

Working tree, **uncommitted**, mixed with pre-existing edits. Fuseki/GRLC up via `make serve-data`. ADR-0043 + ADR-0044 `proposed`. Phase 1 done + validated (deterministic; incoming+outgoing populated). Next: commit, then ADR-0044 Phase 2 (class/property detail pages).
