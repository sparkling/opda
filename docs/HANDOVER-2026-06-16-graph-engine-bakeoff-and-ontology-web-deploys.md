# Handover — ontology-graph engine bake-off (8 engines, tabs) + the outstanding-issues deploy + link/nav cleanup (2026-06-16)

**Author:** Henrik (with Claude). **Scope:** one long session that (1) cleared the prior handover's "outstanding issues" — shipped the **ADR-0043 interactive Cytoscape graph**, the **`/ontology/category` index**, and the **Phase-8 external-URL sweep**, then **ratified 5 of the 6 proposed governance records** and **deployed** them to AWS; (2) **removed the dead `propdata.org.uk` + (retired) `openpropdata.org.uk` hyperlinks** and added **Interactive graph** + **UFO categories** to the sidebar nav (deployed); and (3) built a **multi-engine graph "bake-off"** on `/ontology/graph` — **8 graph engines as switchable Tailwind tabs** rendering the same model — recorded in **ADR-0047**. **Status: `main` is `ahead 2` of `origin` — the bake-off (`145222a`) + the Tailwind-tabs fix (`961011e`) are committed LOCALLY and NOT pushed (operator said "don't deploy until I tell you"). Everything before that (`f12d36c`…`22c7bf2`) is pushed and live on AWS.**

> Continues [HANDOVER-2026-06-15 — foundational-ontology validation + CI gate hardening](./HANDOVER-2026-06-15-foundational-ontology-validation-and-ci-gate-hardening.md), whose open items ("push, build-data, operator ratification, deferred Cytoscape graph / external-URL sweep / category page") this session closed.

---

## TL;DR

The prior session's deferred list got cleared and deployed, then the graph page was turned into an **engine bake-off**: every scored finalist from the ADR-0043 research report renders the **same** committed `elements.json` in its own tab, so the Cytoscape pick can be judged in situ. **8 engines, all browser-verified:** Cytoscape, D3 (d3-force), vis-network, force-graph, G6 (AntV), Sigma + Graphology, Mermaid, Graphviz (DOT). Built with a **swarm** (2 research + 6 implementation agents). The bake-off + ADR-0047 + a tabs-styling fix are **committed locally, held for deploy**.

## What shipped — PUSHED + LIVE on AWS (`origin/main` = `22c7bf2`)

| Commit | What | Deploy |
|---|---|---|
| `f12d36c` | **feat: ADR-0043 interactive Cytoscape graph** at `/ontology/graph` (`scripts/ontology-graph.mjs` → committed deterministic `public/data/ontology-graph-elements.json`, drift-gated by `make ci-ontology-graph`; client island lazy-loads from jsdelivr); the **`/ontology/category`** UFO-meta-category index; the **Phase-8 external-URL sweep** (`scripts/check-external-links.mjs` + `make check-links-external`, report-only/opt-in). | ✅ AWS |
| `babdbda` | **docs: ratify 5 records** `proposed → accepted` — ODR-0030, ODR-0031, ADR-0043, ADR-0044, ADR-0045 (each with a dated ratification note). | ✅ AWS |
| `22c7bf2` | **chore: drop `propdata.org.uk` + `openpropdata.org.uk` hyperlinks** (header nav removed; governance-page in-prose links de-linked, citation text kept) + **add `Interactive graph` + `UFO categories` to the Ontology sidebar nav** (`src/lib/site.ts`). | ✅ AWS (run 27583841617) |

## What shipped — LOCAL ONLY, HELD FOR DEPLOY (`main` ahead 2)

| Commit | What |
|---|---|
| `145222a` | **feat: multi-engine graph bake-off (ADR-0047)** — `/ontology/graph` is now a tabbed bake-off. Pluggable adapter contract (`public/ui/graph-engines/_shared.js`); orchestrator (`public/ui/ontology-graph.js`) owns the tab bar + shared chrome (SKOS toggle, layout select, info panel, legend, theme observer) and delegates to the active self-registering engine. 8 engine modules under `public/ui/graph-engines/`. Plus **ADR-0047**. |
| `961011e` | **fix: visible Tailwind tabs** — the tabs weren't reading as tabs (see "MUST know" #2). Moved JS-targeted `og-*` styles to `is:global`; restyled as Tailwind tabs using the site token convention with the `aria-selected:` active variant; added a "Graph engine — click a tab to switch" label. |

## The bake-off (ADR-0047) — detail

**Eight engines, each a self-registering module that renders the same `/data/ontology-graph-elements.json` (40 classes + 28 object-property edges by default; +49 schemes +323 concepts behind the SKOS toggle), each lazy-loading its library from a CDN `/+esm` URL verified 200-OK:**

| Tab | Library (pinned) | Kind |
|---|---|---|
| Cytoscape.js | cytoscape@3.30.2 + cytoscape-fcose@2.2.0 | interactive (reference adapter; fcose/breadthfirst/concentric layouts) |
| D3 (d3-force) | d3-force/selection/zoom/drag@3.0.0 | interactive (SVG; **added per operator request**) |
| vis-network | vis-network@10.1.0 + vis-data@8.0.4 | interactive |
| force-graph | force-graph@1.51.4 | interactive (2D canvas) |
| G6 (AntV) | @antv/g6@5.1.1 | interactive (built-in dark themes) |
| Sigma + Graphology | sigma@3.0.3 + graphology@0.26.0 + graphology-layout-forceatlas2@0.10.1 | interactive (WebGL) |
| Mermaid | mermaid@11 + @mermaid-js/layout-elk | diagram (`flowchart LR`+ELK of the **OWL backbone only** — hairballs past ~40 nodes; via the `/diagramming` 17-LINKED-DATA pattern) |
| Graphviz (DOT) | @hpcc-js/wasm-graphviz@1 | diagram (DOT generated from the model, rendered to SVG **in-browser** via WASM — no Graphviz binary in the build) |

- **Comunica** was investigated per the operator's ask: it has **no built-in visualisation** (SPARQL engine; tables/bindings only). It's a *build-time* `SPARQL→{nodes,edges}` option, not a tab.
- **WebVOWL / SKOS Play!** can't read the auth-gated corpus → documented as **external links** on the page, not live tabs.
- **Architecture:** the adapter contract is in `public/ui/graph-engines/_shared.js` (`mount(container, data, opts) → handle{setTheme,setSkos,reset,destroy}`). Engines register on `window.opdaGraphEngines`; the page lists them as `<script>` tags; the orchestrator builds tabs from the registry. UFO meta-category = node fill (Okabe–Ito CVD-safe palette), shared across all engines.
- **3 real bugs found by browser-testing and fixed:** vis-network's `DataSet` lives in `vis-data` not `vis-network`; G6 & Sigma threw on duplicate class-pair edges (multiple object properties share a source→target — fixed via explicit edge ids / `Graph({multi:true})`); G6's `await graph.render()` never resolves and was blocking the handle return (fire-and-don't-await).

## Governance ratification status

`proposed → accepted` this session (deployed): **ODR-0030, ODR-0031, ADR-0043, ADR-0044, ADR-0045**. Basis: session-044 validation (decision unchanged) + shipped engineering; ADR-0043's own landing condition (extractor + Cytoscape page + green data-layer gate) is now met. **ADR-0046 (OntoClean meta-property markup) deliberately NOT ratified** — it's a *conditional* operator decision (ship the atomic CI gate vs prose-only, against DA Baker's live REJECT-if-ungated dissent) whose gate is **unbuilt**; it stays `proposed`. **ADR-0047 (the bake-off)** is `accepted` in its frontmatter but is in the **unpushed** commit.

## ⚠ Things a reader MUST know

1. **`main` is ahead 2, NOT pushed — the bake-off is held.** The operator said "don't deploy until I tell you." Pushing → AWS deploy ([[opda-deploys-via-ci-only]], [[opda-aws-migration-state]]). Everything through `22c7bf2` is already live; `145222a` + `961011e` are not.
2. **Astro scopes `<style>`; JS-created DOM does NOT get the scope attribute.** The bake-off tabs are built by `ontology-graph.js` at runtime, so the scoped `.og-tab` rules silently never matched them — the tabs rendered as plain caption text ("I only see cytoscape"). Fix: the `og-*` rules live in a **`<style is:global>`** block (all `og-`-namespaced, leak-safe). **Any new JS-created element on this page must be styled globally or with Tailwind utilities, never scoped `<style>`.**
3. **Tailwind v4, no config file.** `src/styles/global.css` holds the config via `@source` directives — notably **`@source "../../public/ui/*.js"`**, so utility classes used in `public/ui/ontology-graph.js` ARE scanned and emitted. `public/ui/tailwind.built.css` is **gitignored** and regenerated by `pnpm run css` (which runs inside `pnpm run build` / `build:data`), so the tab utilities ship to prod automatically — don't commit the built CSS.
4. **The graph data layer is gated, the engines are not.** `make ci-ontology-graph` (`node scripts/ontology-graph.mjs --check`) is wired into `make ci` and guards `public/data/ontology-graph-elements.json`. The engine modules are static client JS (no gate); validation is browser-testing. `build:data` regenerates `elements.json` in step 3.6.
5. **CDN `/+esm` is fragile — verify before adding an engine.** `cytoscape-dagre`'s dagre@0.8.5 `/+esm` is broken (graphlib `Graph` undefined) → we use built-in breadthfirst. Every engine's CDN URL in ADR-0047 was individually web-verified.
6. **`make ci` needs the opda-gen venv on PATH** ([[opda-make-ci-needs-venv-path]]): `PATH="$PWD/tools/opda-gen/.venv/bin:$PATH" make ci`.
7. **External-link finding (report-only):** `propdata.org.uk` → 404 (dead; its links were removed). Academic/ISO hosts (ACM, ScienceDirect, ISO, SAGE) return 403 to the bot checker but are reachable in a browser — candidates for the `check-external-links.mjs` SKIP list if `--strict` is ever wired in.

## What's left / open

1. **Push the 2 held commits** when the operator gives the word → deploys the bake-off + tabs fix.
2. **ADR-0046** — operator decision: ship the OntoClean meta-property markup + atomic CI gate (additional emitter work), or keep prose-only (Option C). Until decided it stays `proposed`.
3. **Bake-off polish ideas** (none blocking): force-graph/G6 initial zoom-to-fit (nodes settle low in the canvas); whether Mermaid should show more than the OWL backbone; per-engine layout controls beyond Cytoscape.
4. **Broader-thread deferred (pre-existing):** ADR-0043's static rdf2dot/D2 gated in-prose figures; SKOS Play!/WebVOWL only viable if a public export is published.

## Key pointers

- **Bake-off page:** `src/pages/ontology/graph.astro`; orchestrator `public/ui/ontology-graph.js`; engines `public/ui/graph-engines/{_shared,cytoscape,d3,vis-network,force-graph,g6,sigma,mermaid,dot}.js`.
- **Data + gate:** `scripts/ontology-graph.mjs` → `public/data/ontology-graph-elements.json`; gate `make ci-ontology-graph`; build regen in `scripts/build-with-data.mjs` step 3.6.
- **ADRs:** `docs/adr/ADR-0043-…`, `docs/adr/ADR-0047-ontology-graph-engine-bakeoff.md`; research report `docs/ontology/research/graph-diagram-tooling.md` (the scorecard the tabs make empirical).
- **Nav:** `src/lib/site.ts` (Ontology → "Browse the model" group).
- **Review locally:** `make dev` → `http://localhost:4330/ontology/graph` (graph page needs only the committed JSON; no triplestore). Full deploy build: `make build-data` (JDK 17+).
- **Skills used:** `/ruflo-swarm:swarm` (CLI init + Agent-tool fan-out) and `/diagramming` (`17-LINKED-DATA-GUIDE.md` for Mermaid, `19-DOT-GRAPHVIZ-GUIDE.md` for the DOT tab).

## Memory

New: [[opda-make-ci-needs-venv-path]] (added this session). Reinforced: [[opda-deploys-via-ci-only]], [[opda-aws-migration-state]], [[opda-work-directly-on-main]], [[opda-diagram-theming-convention]], [[council-web-verify-citations]] (the per-engine CDN URLs were web-verified the same way).

## State

`main` = `961011e`, **ahead 2 of `origin/main` (`22c7bf2`)** — local, NOT pushed. Working tree clean. Through `22c7bf2` is **live on AWS** (deploy runs green; opda.org.uk behind Auth0). `make ci` green; `build:data` green (1510 pages); `/ontology` + `/pdtf` link sweep 0 dangling/0 orphan. The bake-off's 8 engines are browser-verified (render + theme + SKOS toggle + tab switching). Open: push (held), ADR-0046 decision.
