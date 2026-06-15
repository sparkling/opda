---
status: accepted
date: 2026-06-14
tags: [ontology, visualization, graph-diagram, tooling, cytoscape, mermaid, rdf2dot, bake-off, ci-gate, astro]
supersedes: []
depends-on: [ADR-0041, ADR-0037, ODR-0004]
implements: []
---

# Ontology graph-diagram tooling — interactive engine + authored + static-gated composition

## Context and Problem Statement

The ADR-0041 documentation bake-off settled how to *document* the ontology (term reference, SKOS, SHACL, the custom layers) but left **graph (node-link) diagrams** as a single unexamined line in its coverage matrix ("Diagram / visual → WIDOCO embedded WebVOWL"). The directing authority asked for the best tool/library to create **graph diagrams of the whole ontology and of parts of it**.

This is a distinct problem from documentation, with a hard filter set by the OPDA stack:

- **Static Astro site, client-side rendered, CDN-deployed — no application server at runtime.** Anything needing a live SPARQL endpoint or a hosted Java/PHP service *at runtime* is out (Fuseki exists only at build/serve time, `localhost:3031`).
- **Theming is centralised** in `public/ui/client.js` (Cagle palette + dark mode, WCAG/CVD-audited). A new engine must theme from the same CSS tokens, not ship a fixed palette.
- **Generated artefacts are byte-identity gated** (ODR-0004 §6a / `make verify-ontology`); deterministic, diff-able output is strongly preferred.
- **The model is OWL + SKOS + SHACL**, and ~314 of its ~610 graph nodes are **SKOS concepts** — so any "OWL-only" visualiser (the whole VOWL family) misses the majority of the model.
- **Two distinct jobs:** the **whole ontology** (only usable interactively — a static whole-graph is a hairball at this scale) and **parts** (curated or auto-scoped subgraphs, where static works well).

A focused, link-validated study of ~25 tools across three categories (OWL/RDF-native visualisers; general JS graph libraries; diagram-as-code/build-time generators) was run and scored against a weighted rubric grounded in these constraints. Full detail, the scorecard, per-tool pros/cons, and the validated project+demo links are in the research report: [`docs/ontology/research/graph-diagram-tooling.md`](../ontology/research/graph-diagram-tooling.md). This ADR records the decision that report points to.

## Decision Drivers

* **Coverage** — must draw the whole ontology *and* arbitrary parts, across OWL, SKOS, and SHACL uniformly (not OWL-only).
* **Embeddability** — must work in a server-less static site (client island or committed asset), with data pre-extracted at build time.
* **Theming parity** — must be drivable from the existing Cagle CSS dark-mode tokens, not a fixed notation palette.
* **Auto-from-TTL** — diagrams should regenerate from the source of truth (the committed Turtle / build-time Fuseki), not drift as hand-maintained copies.
* **CI-gateability** — fit the byte-identity / anti-drift discipline where feasible (gate the deterministic text artefact).
* **Interactivity** — the whole-ontology graph is only usable with zoom/filter/focus.
* **Low integration cost & longevity** — active, permissively licensed OSS; minimal new toolchain.

## Considered Options

* **Option A (chosen) — Composed, one primary engine:** adopt **Cytoscape.js** as the interactive ontology-graph engine (fed by a build-time Turtle→`elements` JSON step via **N3.js**, or a SPARQL `CONSTRUCT` via **Comunica** against build-time Fuseki; themed from the CSS tokens); **keep Mermaid** for hand-authored subgraphs; add an **rdf2dot + Graphviz** (or **D2**) static path for gated in-prose figures; **SKOS Play!** optional for the concept-scheme reference; **retain WebVOWL-via-WIDOCO** as a zero-cost OWL-only extra.
* **Option B — Mermaid only** (extend the incumbent to auto-generate everything, including the whole-ontology graph).
* **Option C — WebVOWL / WIDOCO only** (lean entirely on what is already embedded).
* **Option D — Static pipeline only** (rdf2dot/Graphviz or D2 as the sole answer; no interactive engine).
* **Option E — A heavier interactive engine as primary** (G6 / Sigma.js+Graphology instead of Cytoscape.js).

## Decision Outcome

Chosen option: **"Option A — composed, with Cytoscape.js as the primary engine"**, because it is the only configuration that satisfies the full driver set simultaneously. Cytoscape.js is graph-agnostic (so OWL classes, properties, and the 314 SKOS concepts render through one path), its CSS-like stylesheet maps directly onto the existing dark-mode tokens (unlike the JS-options theming of vis-network/force-graph or the fixed VOWL palette), it embeds client-side with no runtime server, and it offers both `dagre`/`elk` (tidy class-hierarchy trees) and `fcose`/`cola` (force exploration). It is MIT, ~11k★, last released 2026-06-02 — the most active, lowest-risk of the finalists. It topped the weighted scorecard (91/100; nearest rival G6 at 86).

No single tool covers every job, so the surrounding composition is deliberate and mirrors the ADR-0041 per-layer pattern: **Mermaid** stays for authored subgraphs (already integrated and themed; replacing it would be churn); a **static rdf2dot/Graphviz (or D2)** path serves fixed, byte-gateable in-prose figures (the project's preferred discipline for generated artefacts); **SKOS Play!** optionally gives the concept schemes a dedicated tree/sunburst reference; and the already-present **WebVOWL** remains a free OWL-only interactive extra, superseded by Cytoscape for the stated goal.

Final adoption is the operator's call on inspection (consistent with the ADR-0041 M6 "operator decides" stance); this ADR is `proposed` until the build-time extractor + Cytoscape page land and the data-layer gate is green.

### Consequences

* Good, because OWL, SKOS, and SHACL all render through one themeable engine — the SKOS majority (314 concepts) is no longer invisible as it is under the VOWL family.
* Good, because the whole-ontology graph becomes genuinely usable (interactive zoom/filter/focus) rather than a static hairball, while scoped subgraphs stay legible.
* Good, because diagrams regenerate from the source of truth — the build-time extractor reads the committed TTL (or Fuseki), so the graph can't drift from the corpus; the generated `elements.json` is committed and CI-diffed (gate at the data layer).
* Good, because theming reuses the existing Cagle CSS dark-mode tokens — no second palette to maintain.
* Good, because the static rdf2dot/Graphviz (or D2) complement gives byte-gateable SVG for figures woven into prose, matching the doc-drift discipline.
* Bad, because it introduces a new client-side dependency (Cytoscape + layout extensions) and a small build step (N3.js/Comunica → JSON) — engineering beyond the incumbent Mermaid.
* Bad, because the interactive canvas itself is not byte-diffable; CI gating shifts to the deterministic JSON input rather than the rendered output.
* Neutral, because the static path adds Python + Graphviz (or the D2 binary) to the build only if/when in-prose gated figures are actually wanted.
* Neutral, because WebVOWL-via-WIDOCO is retained but frozen — kept for free, not invested in.

### Confirmation

* The decision is backed by the weighted scorecard and per-tool, link-validated evidence in [`docs/ontology/research/graph-diagram-tooling.md`](../ontology/research/graph-diagram-tooling.md) (every project/demo URL fetched 200-OK on 2026-06-14; the 9 load-bearing links re-validated directly).
* On adoption, conformance is verified by: a build-time extractor emitting a committed, sorted `elements.json` that CI diffs (data-layer anti-drift, ODR-0004 discipline); the Cytoscape page rendering OWL+SKOS+SHACL and honouring the dark-mode toggle; and any static figures regenerating byte-identically under a pinned Graphviz/D2 (gate the DOT/`.d2` text, not the SVG).
* Operator inspection ratifies publication (status `proposed` → `accepted`).

## Pros and Cons of the Options

### Option A — Composed, Cytoscape.js primary (chosen)

* Good, because it is the only option meeting coverage + theming + embeddability + interactivity at once (scorecard winner, 91/100).
* Good, because each job uses the right tool (interactive engine / authored Mermaid / static-gated SVG / SKOS reference) — the proven ADR-0041 per-layer pattern.
* Bad, because it is the most moving parts of any option (one new engine + one build step + an optional static path).

### Option B — Mermaid only

* Good, because zero new toolchain — already integrated and themed.
* Bad, because Mermaid hits hard scale ceilings (`maxEdges` 500, `maxTextSize` 50 000) and lays out dense graphs poorly — the whole-ontology graph is unreadable.
* Bad, because there is no real TTL→Mermaid pipeline (the only converter, OntoMermaid, is pre-release and ignores SKOS/SHACL) — so "auto-from-TTL" fails. Correct for *authored parts*, wrong as the whole answer.

### Option C — WebVOWL / WIDOCO only

* Good, because it is already embedded for free and is genuinely interactive.
* Bad, because it is **OWL-only** (the 314 SKOS concepts are invisible), has a fixed palette with no dark mode, is non-deterministic, and its OWL2VOWL converter is unmaintained since 2020.

### Option D — Static pipeline only (rdf2dot/Graphviz or D2)

* Good, because it is the most CI-gate-friendly (deterministic DOT/`.d2` → committed SVG) and reads Turtle natively (rdf2dot).
* Bad, because static rendering of the *whole* ontology is a hairball; the whole-graph job genuinely needs interactivity. Adopted as the **complement**, rejected as the sole answer.

### Option E — Heavier interactive engine (G6 / Sigma+Graphology) as primary

* Good, because G6 ships batteries-included (dark themes, 20+ palettes, minimap/legend) and Sigma scales to 10k+ nodes via WebGL.
* Bad, because G6 carries the largest bundle/dependency surface and a steeper API, and its theming is less directly CSS-token-driven than Cytoscape's stylesheet; Sigma's WebGL scale is overkill for ~610 nodes and themes via attributes/reducers, not CSS. G6 is the close runner-up, not the pick.

## More Information

- **Research report (full scorecard, criteria, per-tool detail, validated links):** [`docs/ontology/research/graph-diagram-tooling.md`](../ontology/research/graph-diagram-tooling.md)
- **Prior bake-off this extends:** [ADR-0041](ADR-0041-ontology-reference-document-generation.md) · `/ontology/bake-off` page · `public/ontology/tools/COMPARISON.md`
- **Anti-drift / byte-identity discipline the gating leans on:** ODR-0004 §6a (`make verify-ontology`)
- **Build-time RDF/SPARQL toolchain the extractor uses:** [ADR-0037](ADR-0037-apache-jena-sole-rdf-shacl-sparql-toolchain.md) (Apache Jena / Fuseki)

**Validated resources (all fetched 200-OK, 2026-06-14):**

- Cytoscape.js — https://js.cytoscape.org · repo https://github.com/cytoscape/cytoscape.js (MIT, v3.34.0) · demo https://js.cytoscape.org/demos/colajs-graph/
- Mermaid — https://mermaid.js.org · editor https://mermaid.live/
- rdf2dot (rdflib) — https://rdflib.readthedocs.io/en/stable/apidocs/rdflib.tools.rdf2dot/ · Graphviz https://graphviz.org/
- D2 — https://d2lang.com/ · playground https://play.d2lang.com/
- SKOS Play! — https://skos-play.sparna.fr/ · app https://skos-play.sparna.fr/play/
- N3.js — https://github.com/rdfjs/N3.js (MIT) · Comunica — https://comunica.dev/
- WebVOWL (retained extra) — https://service.tib.eu/webvowl/ · repo https://github.com/VisualDataWeb/WebVOWL
- Runner-up / alternatives — G6 https://g6.antv.antgroup.com/en · force-graph https://github.com/vasturiano/force-graph · vis-network https://visjs.github.io/vis-network/ · D3 https://d3js.org

**Next step (if adopted):** add `scripts/ontology-graph.mjs` (N3.js/Comunica → committed `elements.json`, CI-diffed) and a Cytoscape client island on `/ontology/graph` (themed from the CSS tokens; `dagre`/`elk` for the class tree, `fcose` for the whole graph); keep Mermaid for authored subgraphs; optionally wire the rdf2dot/Graphviz static path and SKOS Play!.

## Amendments

- **2026-06-15 — RATIFIED `proposed` → `accepted` (operator, this session).** The Confirmation condition is now met: the build-time extractor (`scripts/ontology-graph.mjs`) lands a committed, deterministic `public/data/ontology-graph-elements.json` derived **from the committed SPARQL model** (`src/data/ontology-model.json`) — not N3.js/Comunica as the §"Next step" speculated; the model already carries the OWL+SKOS+SHACL data, so the extractor is a pure, Fuseki-free transform — and the data-layer anti-drift gate is green (`make ci-ontology-graph` → `node scripts/ontology-graph.mjs --check`, wired into `make ci`). The Cytoscape island ships at `/ontology/graph` (`src/pages/ontology/graph.astro` + `public/ui/ontology-graph.js`): the engine + `fcose` lazy-load from the jsdelivr CDN client-side (the Mermaid pattern), themed from the CSS dark-mode tokens, with the OWL class backbone shown by default and the SKOS layer (49 schemes + 323 concepts) one toggle away; class colour encodes the `opda:ufoCategory` facet (Okabe–Ito CVD-safe). **Deviation recorded:** `cytoscape-dagre` was dropped (dagre@0.8.5's `/+esm` build is broken — `graphlib.Graph` undefined); the hierarchy layout uses Cytoscape's built-in `breadthfirst`, and `fcose` degrades to the built-in `cose` if its CDN module fails. Mermaid stays for authored subgraphs (composition unchanged); the rdf2dot/Graphviz static path + SKOS Play! remain optional, unadopted complements. Browser-validated render + theme + SKOS toggle + force layout; no console errors.
