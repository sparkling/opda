---
status: accepted
date: 2026-06-16
tags: [ontology, visualization, graph-diagram, bake-off, cytoscape, d3, g6, sigma, vis-network, force-graph, mermaid, graphviz, astro, ci-gate]
supersedes: []
depends-on: [ADR-0043, ADR-0044, ADR-0041, ODR-0004]
implements: []
---

# Ontology graph-engine in-situ bake-off — every scored finalist as a switchable tab

## Context and Problem Statement

[ADR-0043](ADR-0043-ontology-graph-diagram-tooling.md) chose **Cytoscape.js** as the ontology-graph engine from a **paper** scorecard — a link-validated study of ~25 tools scored against a weighted rubric ([`docs/ontology/research/graph-diagram-tooling.md`](../ontology/research/graph-diagram-tooling.md)). That decision was sound on the evidence, and the Cytoscape page shipped and was ratified. But a scorecard is a prediction; the directing authority asked to **test the finalists in situ** — render the *real* OPDA corpus through each candidate engine and judge them empirically, side by side, rather than trusting the rubric alone.

The natural form is a **bake-off page**: every scored finalist rendering the **same** committed model (`/data/ontology-graph-elements.json` — 40 classes + 28 object properties as the OWL backbone, 49 schemes + 323 concepts behind a SKOS toggle) as a **switchable tab** on `/ontology/graph`. Whoever opens the page can flip between Cytoscape, D3, vis-network, force-graph, G6, Sigma, Mermaid and Graphviz on identical data, theme, and controls, and see for themselves.

The same hard constraints as ADR-0043 apply: **server-less static site** (engines lazy-load from the jsdelivr CDN as ESM — no runtime server, no bundler step); **centralised theming** (the Cagle CSS dark-mode tokens, re-applied on the `data-theme` flip — engines must not ship a fixed palette); **one semantic colour encoding** (UFO meta-category as node fill, via the CVD-safe Okabe–Ito palette); and the model is the **already-committed, CI-gated** `elements.json` (no new build artefact, no new gate).

## Decision Drivers

* **Empirical validation of ADR-0043** — see the chosen engine beside its rivals on the actual corpus, not just on the rubric.
* **Same-model fairness** — every engine reads the one committed `elements.json`; differences are the engine's, not the data's.
* **Server-less + themed** — each engine lazy-loads from the CDN and is driven from the shared CSS tokens (re-themed on dark-mode flip), exactly like the incumbent.
* **Pluggability** — adding or retiring an engine must be cheap: a self-registering module, no churn to the page or the others.
* **No new gate / no new artefact** — reuse the committed, drift-gated `elements.json`; the page stays pure SSG.

## Considered Options

* **Option A (chosen) — Multi-engine tabbed bake-off with a pluggable adapter contract.** `/ontology/graph` becomes a tabbed page; a stable engine-adapter contract (`public/ui/graph-engines/_shared.js`) lets each engine be an independent, self-registering module; an orchestrator owns the shared chrome (tab bar, SKOS toggle, layout select, info panel, legend, theme observer) and delegates rendering to the active engine.
* **Option B — Keep the single Cytoscape page (ADR-0043 as-is).** No comparison; the pick stays a paper decision.
* **Option C — Static comparison (screenshots / a prose write-up).** A doc with rendered images of each engine. Cheap, but not interactive and rots the moment the corpus changes.
* **Option D — External demos / links only.** Point at each library's own demo. Zero in-situ value (not our data).

## Decision Outcome

Chosen option: **A — the multi-engine tabbed bake-off**, because it is the only option that validates ADR-0043 *empirically on the real model* while honouring the server-less / themed / single-artefact constraints. The pluggable contract keeps the cost of "one more engine" to a single ~100-line module.

**Engines implemented as tabs** (each a module under `public/ui/graph-engines/`, lazy-loading its library from a **CDN `/+esm` URL verified 200-OK 2026-06-16**):

| Tab | Library (verified) | Kind | Notes |
|---|---|---|---|
| **Cytoscape.js** | `cytoscape@3.30.2` + `cytoscape-fcose@2.2.0` | interactive | ADR-0043 pick; reference adapter; fcose / breadthfirst / concentric layouts. `cytoscape-dagre` deliberately avoided (dagre@0.8.5 `/+esm` is broken — graphlib `Graph` undefined); hierarchy uses built-in breadthfirst. |
| **D3 (d3-force)** | `d3-force/d3-selection/d3-zoom/d3-drag @3.0.0` | interactive | SVG render (right call at ~415 nodes); the DIY end of the rubric — total control, hand-rolled. **Added at the directing authority's request.** |
| **vis-network** | `vis-network@10.1.0` | interactive | Simplest API; reactive DataSet makes re-theme trivial. |
| **force-graph** | `force-graph@1.51.4` | interactive | Vasturiano 2D canvas; accessor-based theming. |
| **G6 (AntV)** | `@antv/g6@5.1.1` | interactive | Batteries-included; built-in light/dark themes + d3-force layout; heaviest bundle (lazy-loaded). |
| **Sigma + Graphology** | `sigma@3.0.3` + `graphology@0.26.0` (+ forceatlas2 layout) | interactive | WebGL; most assembly (graph build + separate layout); headroom for far larger graphs. |
| **Mermaid** | `mermaid@11` + `@mermaid-js/layout-elk` | diagram | Generated `flowchart LR` + ELK of the **OWL class backbone only** (Mermaid hairballs past ~40 nodes; SKOS omitted), authored via the `/diagramming` skill's linked-data + styling guides. |
| **Graphviz (DOT)** | `@hpcc-js/wasm` (Graphviz compiled to WASM) | diagram | Deterministic DOT generated from the model, rendered to SVG **in-browser** (no Graphviz binary in the build), per the `/diagramming` DOT guide. |

**Comunica — investigated, not a tab.** The directing authority asked whether Comunica has built-in visualisation. **It does not** (web-verified 2026-06-16): Comunica is a SPARQL query engine; its browser tooling (the Comunica Web Client) renders results as tables / bindings / downloadable result serialisations only — never a node-link diagram. Comunica's role here is the *optional build-time* `SPARQL→{nodes,edges}` step (an alternative to the N3.js parse) that could *produce* `elements.json`; it is not an engine in the bake-off.

**WebVOWL / SKOS Play! — external links, not live tabs.** Both are external services that would need a *public* OWL/SKOS URL to read; the OPDA corpus sits behind the site's edge auth and they cannot reach it. They remain documented external complements (as ADR-0043 framed them), linked from the page, not embedded.

### Consequences

* Good, because the ADR-0043 pick is now testable on the real corpus next to every rival, on identical data + theme + controls — the rubric is validated, not just asserted.
* Good, because the pluggable contract makes engines cheap to add/retire (one self-registering module; the orchestrator and the other engines are untouched).
* Good, because every engine reads the one committed, drift-gated `elements.json` — no new artefact, no new CI gate, page stays pure SSG.
* Good, because each engine's CDN `/+esm` URL was individually web-verified, pre-empting another `cytoscape-dagre`-style runtime break.
* Bad, because eight client-side graph libraries are now referenced (each lazy-loaded only when its tab is opened, so no cost until used) — more moving parts than the single-engine page.
* Bad, because the non-Cytoscape engines theme via **JS options, not CSS** — dark-mode re-theming re-pushes colour values per engine on the `data-theme` flip rather than swapping a stylesheet (handled in each adapter's `setTheme`).
* Neutral, because the diagram tabs (Mermaid, Graphviz) show the **OWL backbone** primarily — they are representations of the model's shape, not the interactive whole-graph explorers.

### Confirmation

* Each tab renders the model, honours the dark-mode toggle, and the SKOS-layer toggle (where applicable), with no console errors — browser-verified on `/ontology/graph`.
* No new CI gate: the data layer is already guarded by `make ci-ontology-graph` (`scripts/ontology-graph.mjs --check`); the page is SSG and adds only static assets.
* The engine-adapter contract is documented in `public/ui/graph-engines/_shared.js`; engines self-register on `window.opdaGraphEngines` and are driven by the orchestrator `public/ui/ontology-graph.js`.

## More Information

- **Extends:** [ADR-0043](ADR-0043-ontology-graph-diagram-tooling.md) (the engine pick this bake-off validates) and its research report [`docs/ontology/research/graph-diagram-tooling.md`](../ontology/research/graph-diagram-tooling.md) (the scorecard the tabs make empirical).
- **The model + its gate:** [ADR-0044](ADR-0044-ontology-as-web-pages-dereferenceable-entity-detail-pages.md) (`ontology-model.json` → `scripts/ontology-graph.mjs` → committed `public/data/ontology-graph-elements.json`, drift-gated by `make ci-ontology-graph`).
- **Diagram authoring:** the `/diagramming` skill — `17-LINKED-DATA-GUIDE.md` (RDF → Mermaid `flowchart LR` + ELK) and `19-DOT-GRAPHVIZ-GUIDE.md` (ontology → DOT) shaped the Mermaid and Graphviz tabs.
- **The engines:** `public/ui/graph-engines/{_shared,cytoscape,d3,vis-network,force-graph,g6,sigma,mermaid,dot}.js`; the orchestrator `public/ui/ontology-graph.js`; the page `src/pages/ontology/graph.astro`.
- **Verified CDN modules (all `/+esm`, 200-OK 2026-06-16):** cytoscape@3.30.2 · cytoscape-fcose@2.2.0 · d3-force/d3-selection/d3-zoom/d3-drag@3.0.0 · vis-network@10.1.0 · force-graph@1.51.4 · @antv/g6@5.1.1 · sigma@3.0.3 · graphology@0.26.0 · mermaid@11 · @hpcc-js/wasm.
