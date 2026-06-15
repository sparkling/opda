# Graph‑diagram tooling for the OPDA ontology — research, scorecard & recommendation

- **Date:** 2026‑06‑14
- **Question:** What is the best tool/library for creating **graph (node‑link) diagrams of the OPDA ontology and of parts of it**?
- **Status:** Research synthesis · operator decides on adoption
- **Relationship to prior work:** This is the focused follow‑up to the ADR‑0041 **documentation** bake‑off (`/ontology/bake-off`, `public/ontology/tools/COMPARISON.md`), whose "Diagram / visual" row was a single line ("WIDOCO embedded WebVOWL"). This report fills that gap properly.
- **Method:** Parallel multi‑stream web research across ~25 tools in 3 categories; **every project/demo URL was fetched and its literal status recorded**; scored against a weighted rubric grounded in the actual OPDA stack.

---

## 1. TL;DR — the recommendation

**There is no single tool that draws the whole ontology *and* curated parts *and* stays themeable, embeddable and CI‑gateable.** As with the doc bake‑off, the right answer is a small composition with one clear primary engine:

| Job | Pick | Why |
|---|---|---|
| **Primary engine — interactive graph of the whole ontology + arbitrary subgraphs** | **🏆 Cytoscape.js** | Only finalist that covers OWL+SKOS+SHACL uniformly, themes to the site's CSS dark‑mode tokens, embeds client‑side with no runtime server, and offers both force (fcose) and hierarchical (dagre/elk) layouts. MIT, 11k★, released 2026‑06‑02. |
| **Curated "parts of the ontology" diagrams (hand‑authored)** | **Keep Mermaid** (incumbent) | Already integrated and themed (Cagle palette + dark mode via `client.js`); ideal for small authored subgraphs. Replacing it would be churn for no gain. |
| **Static, embedded‑in‑prose, byte‑gated diagrams** | **rdf2dot + Graphviz** (or **D2**) | SPARQL‑scoped `CONSTRUCT` → DOT → committed SVG; diffable in the doc‑drift gate exactly like the rest of the corpus. Static only. |
| **SKOS concept‑scheme trees (314 concepts / 48 schemes)** | **SKOS Play!** (optional complement) | Purpose‑built; build‑time CLI reads Fuseki and emits committable tree/sunburst/index pages. |
| **OWL‑only interactive extra** | **Keep WebVOWL via WIDOCO** | Already present for free; superseded by Cytoscape once that lands (WebVOWL can't render the SKOS majority and isn't themeable). |

**Feed Cytoscape from a tiny build‑time step** — parse the committed Turtle with **N3.js** (or run a SPARQL `CONSTRUCT` against the build‑time Fuseki with **Comunica**) → emit `elements` JSON → render in a client island themed from the existing CSS variables.

**Bottom line:** Adopt **Cytoscape.js** as the ontology‑graph engine; keep Mermaid for authored diagrams; add an **rdf2dot/Graphviz (or D2)** static path for gated in‑prose figures. Everything else is either already covered (WebVOWL) or a non‑starter for a server‑less, themeable, CI‑gated static site.

---

## 2. Scope & the constraints that decide it

The OPDA site is the hard filter — most ontology‑viz tools assume a running server, a desktop GUI, or a fixed notation, none of which fit:

- **Static Astro site, client‑side rendered, CDN‑deployed — no application server at runtime.** Anything needing a live SPARQL endpoint or a hosted Java/PHP service at *runtime* is out (Fuseki exists only at **build/serve** time, `make serve-data`, `localhost:3031`).
- **Theming is centralised:** `public/ui/client.js` lazy‑loads Mermaid from CDN and drives it with the **Cagle palette + dark mode** (`data-theme`, WCAG/CVD‑audited; Council 162/163). A new engine must theme from the same CSS tokens, not ship a fixed palette.
- **The project gates generated artefacts** by byte‑identity (re‑emit, diff vs committed corpus). Static, deterministic output is a strong fit; client‑rendered output is gated at the *data* layer instead.
- **The ontology is OWL + SKOS + SHACL** — and ~**314 of its ~610 graph nodes are SKOS concepts**. Any tool that renders "OWL only" (the whole VOWL family) misses the majority of the model.
- **Two distinct graph jobs:** the **whole ontology** (only usable interactively — every tool agrees a static whole‑graph is a hairball) and **parts** (curated or auto‑scoped subgraphs, where static works well).

**Ontology scale (from `opda-merged.ttl`):** 40 `owl:Class`, 30 object + 226 datatype properties, 1 annotation property, 48 `skos:ConceptScheme`, 314 `skos:Concept`, 14 `owl:Ontology`; plus SHACL shapes. ≈610 nodes / ≈600+ edges — comfortable for any modern engine interactively, unreadable as one static image.

---

## 3. Scoring criteria (weighted)

Weights reflect the OPDA constraints above (sum = 100). Each tool scored **0–5** per criterion; weighted total normalised to 100.

| # | Criterion | Weight | What a 5 looks like |
|---|---|---:|---|
| C1 | **Ontology coverage** — whole **and** parts; OWL+SKOS+SHACL | 18 | Renders any subgraph or the whole model, all three vocabularies, uniformly |
| C2 | **Embeddability** — static Astro, no runtime server | 14 | Drops into a client island or a committed SVG; nothing to host |
| C3 | **Theming parity** — Cagle palette + dark mode | 14 | Driven from existing CSS tokens / first‑class dark themes |
| C4 | **Auto‑from‑TTL** — stays in sync, low manual authoring | 12 | Reads Turtle/SPARQL; diagram regenerates from the source of truth |
| C5 | **Determinism / CI‑gateability** | 10 | Deterministic text artefact diffable in the doc‑drift gate |
| C6 | **Interactivity / navigability** | 10 | Zoom, filter, expand, focus — makes the whole‑ontology graph usable |
| C7 | **Scale fit** (~610 nodes) | 8 | Smooth at this size with headroom |
| C8 | **Maintenance & license** | 8 | Active releases, permissive OSS |
| C9 | **Integration cost** (low = high score) | 6 | Minimal new toolchain / little glue |

> Tie‑break (inherited from the ADR‑0041 M6 rubric): prefer the tool needing **least custom post‑processing for fidelity**.

---

## 4. Weighted scorecard (finalists)

Scores 0–5 per criterion; **Total** = weighted, /100. Ranked.

| Tool (role) | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | **Total** |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **🏆 Cytoscape.js** *(interactive engine)* | 5 | 5 | 5 | 4 | 3 | 5 | 5 | 5 | 3 | **91** |
| **G6 (AntV)** *(interactive, batteries‑incl.)* | 5 | 4 | 5 | 4 | 3 | 5 | 4 | 5 | 2 | **86** |
| **force‑graph** *(Vasturiano, interactive)* | 4 | 5 | 3 | 4 | 2 | 4 | 5 | 4 | 5 | **79** |
| **rdf2dot + Graphviz** *(static, gated)* | 4 | 5 | 3 | 5 | 5 | 1 | 3 | 5 | 3 | **77** |
| **vis‑network** *(interactive, simple)* | 4 | 5 | 3 | 4 | 2 | 4 | 4 | 4 | 5 | **77** |
| **D2** *(static, gated, DIY emitter)* | 4 | 5 | 5 | 3 | 5 | 1 | 3 | 4 | 3 | **76** |
| **D3.js (d3‑force)** *(interactive, DIY)* | 4 | 4 | 5 | 4 | 2 | 3 | 4 | 5 | 2 | **76** |
| **Sigma.js + Graphology** *(WebGL)* | 4 | 4 | 3 | 4 | 2 | 4 | 5 | 5 | 2 | **74** |
| **Mermaid** *(incumbent, curated parts)* | 3 | 5 | 5 | 1 | 4 | 2 | 2 | 5 | 5 | **70** |
| **SKOS Play!** *(SKOS‑only complement)* | 2 | 4 | 2 | 5 | 3 | 4 | 4 | 4 | 3 | **66** |
| **WebVOWL** *(via WIDOCO, OWL‑only)* | 2 | 3 | 1 | 4 | 1 | 5 | 2 | 3 | 5 | **54** |

**Reading the table.** Cytoscape.js wins because it is the only tool scoring well on **coverage + theming + embeddability + interactivity simultaneously** — the exact intersection the OPDA stack demands. G6 is a close, legitimate alternative (its only real losses are bundle size and a steeper API). The static‑pipeline tools (**rdf2dot/Graphviz**, **D2**) win the **determinism/CI‑gate** column outright but score 1 on interactivity — which is why they're the *complement* for embedded figures, not the primary whole‑ontology engine. **Mermaid** stays strong on theming/embeddability/integration (it's already wired in) but is capped by no‑auto‑from‑TTL (C4=1) and scale ceilings — correct for curated parts, wrong for the whole graph. **WebVOWL** ranks last despite genuine interactivity: no SKOS, no theming, non‑deterministic, OWL2VOWL unmaintained since 2020.

---

## 5. Recommendation in detail

### 5.1 Primary: **Cytoscape.js** for the ontology graph

> Project: **https://js.cytoscape.org** · Repo: **https://github.com/cytoscape/cytoscape.js** (MIT, 11k★, v3.34.0 · 2026‑06‑02) · Live demo: **https://js.cytoscape.org/demos/colajs-graph/** — *all fetched 200‑OK 2026‑06‑14.*

Why it's the pick, against the rubric:

- **Coverage (C1=5):** graph‑agnostic — a triple is a node‑edge‑node, so OWL classes, properties, *and* the 314 SKOS concepts render through one code path; you choose which subgraph to draw by choosing which triples to load.
- **Theming (C3=5):** Cytoscape's stylesheet is a CSS‑like selector model with presentation fully separated from data — it maps directly onto the existing CSS‑variable dark‑mode tokens, unlike the JS‑options theming of vis‑network/force‑graph or the fixed VOWL palette.
- **Embeddability (C2=5):** a single ES module instantiated against a container in an `astro:page-load` handler; no runtime server. Data is pre‑extracted at build time.
- **Both layout idioms (C6/C1):** `dagre`/`elk` give tidy **class‑hierarchy trees**; `fcose`/`cola` give **force‑directed** exploration of the whole graph. Built‑in traversal/filtering powers "focus on this class and its neighbourhood."
- **Maintenance/license (C8=5):** MIT throughout, ~9.4M npm downloads/week, last release 12 days before this report.

**Cost (C9=3):** a heavier API than vis‑network and a small build step (below); layout engines (`dagre`/`elk`/`fcose`) are separate packages to wire in. One‑time, modest.

**The build step (feed it from the source of truth):**

```
opda Turtle  ──►  [N3.js parse]  ──►  {nodes,edges}  ──►  elements.json  ──►  Cytoscape (client island)
   or                or                                         (committed,        themed via CSS tokens
   Fuseki  ──►  [Comunica CONSTRUCT]  ──────────────►          build‑time)
```

- **N3.js** (MIT, https://github.com/rdfjs/N3.js) — parse the committed `.ttl` directly; a triple maps 1:1 to an edge (subject/object → nodes, predicate → label). ~30 lines, no Fuseki needed. **Simplest, recommended for most views.**
- **Comunica** (`@comunica/query-sparql`, MIT, https://comunica.dev) — when you want SPARQL to *shape* the graph (e.g. a `CONSTRUCT` with `skos:broader+` / `rdfs:subClassOf+` property paths to pre‑compute transitive hierarchies), runnable against build‑time Fuseki **or** the local Turtle.
- **Gate at the data layer:** commit the generated `elements.json` and diff it in CI (deterministic given sorted queries) — the canvas itself isn't byte‑diffable, but the input is.

### 5.2 Keep **Mermaid** for hand‑authored subgraphs

Mermaid stays the right tool for the many small, curated, prose‑adjacent diagrams (`src/components/Diagram.astro`, the `/schema/*` pages). It's already themed and client‑rendered; its `.mmd` source is deterministic and gateable. Don't auto‑generate the whole ontology with it — `maxEdges` (500) / `maxTextSize` (50 000 chars) ceilings and dense‑graph layout make that unreadable, and the only OWL→Mermaid converter (OntoMermaid) is pre‑release and ignores SKOS/SHACL.

### 5.3 Complement: a **static, gated** path — rdf2dot + Graphviz (or D2)

For fixed figures woven into pages that must be diffable in the doc‑drift gate (the project's strong preference for generated artefacts), add a build‑time static path:

- **rdf2dot + Graphviz** — `rdflib` is already the natural Python/RDF dependency; a **SPARQL‑scoped `CONSTRUCT` against Fuseki → DOT → `dot -Tsvg`** yields a committable, CSS‑themeable, byte‑gateable SVG. Don't point stock whole‑graph rdf2dot at the full corpus (hairball) — scope every diagram with a query. Hardening for byte‑identity: pin Graphviz, sort nodes/edges (`ORDER BY`), set explicit IDs, normalise the `Generated by graphviz version …` comment, gate the **DOT text** not the SVG.
  - Project: https://graphviz.org/ · rdf2dot: https://rdflib.readthedocs.io/en/stable/apidocs/rdflib.tools.rdf2dot/ · live RDF→Graphviz demo: https://www.ldf.fi/service/rdf-grapher
- **D2** (alternative) — best‑in‑class **dark themes** and genuinely **byte‑stable SVG** (content‑hashed IDs, embedded fonts) from a build‑time CLI; cost is a DIY Turtle→`.d2` emitter (no RDF converter exists) and pinning version+engine. Project: https://d2lang.com/ · playground: https://play.d2lang.com/

Pick **rdf2dot/Graphviz** if you want to stay in the Python/rdflib/Fuseki lane; pick **D2** if dark‑mode polish and out‑of‑the‑box determinism matter more than reusing rdflib.

### 5.4 Optional: **SKOS Play!** for the concept‑scheme reference

If the 314 concepts / 48 schemes deserve a dedicated visual reference (tree, sunburst, alphabetical/KWIC index), `skos-play-cli` runs at build time against Fuseki and emits committable HTML. It complements — never replaces — the OWL/property graph. Project: https://skos-play.sparna.fr/ · app: https://skos-play.sparna.fr/play/ · CLI: https://github.com/sparna-git/skos-play

### 5.5 What about the WebVOWL you already have?

Keep it as the zero‑effort interactive **OWL‑only** extra (it ships inside the WIDOCO bundle). It is **superseded by Cytoscape** for the stated goal: it can't render the SKOS majority, has a fixed palette with no dark mode, and its layout is non‑deterministic. Don't invest further in it. Live instance: https://service.tib.eu/webvowl/

---

## 6. Appendix A — full tool catalogue (validated)

All URLs fetched 2026‑06‑14; status noted inline. *Live JS‑app* = page returns 200 but renders client‑side (an empty shell to a text fetch) — expected for interactive demos.

### A. OWL/RDF/SKOS‑native tools

**WebVOWL / OWL2VOWL** — interactive VOWL force‑graph; the engine WIDOCO embeds.
- Project: https://github.com/VisualDataWeb/WebVOWL (MIT) · Converter: https://github.com/VisualDataWeb/OWL2VOWL · Demo: https://service.tib.eu/webvowl/ *(live JS‑app, 200)*. Old `vowl.visualdataweb.org` redirects to a dead domain — do not cite.
- Recency: WebVOWL v1.1.7 (2024‑06‑04); OWL2VOWL v0.3.7 (2020‑12‑14, unmaintained).
- **Pros:** standardised notation, genuinely interactive, already present for free. **Cons:** **no SKOS**, no theming/dark mode, non‑deterministic, needs a JVM converter, not CI‑gateable. **Verdict:** OWL‑only extra; superseded by Cytoscape.

**Ontospy** — Python CLI; emits static HTML docs with D3/Sigma viz templates.
- Project: https://github.com/lambdamusic/Ontospy (MIT) · Examples: https://lambdamusic.github.io/ontospy-examples/foafrdf/index.html *(200)*.
- Recency: v2.1.1 (2022‑11‑16, dormant; Python‑3.11 pin needed).
- **Pros:** reads OWL+SKOS directly; self‑contained static HTML; dark Bootswatch themes. **Cons:** node‑link graphs cover **class hierarchy only**; node colours hardcoded (no palette parity without forking); dormant; duplicates existing WIDOCO docs. **Verdict:** marginal; largely redundant.

**Protégé plugins — OntoGraf / OWLViz / SOVA / VOWL plugin** — desktop‑only.
- OntoGraf: https://protegewiki.stanford.edu/wiki/OntoGraf · OWLViz: https://protegewiki.stanford.edu/wiki/OWLViz · SOVA: https://protegewiki.stanford.edu/wiki/SOVA · VOWL plugin: https://github.com/VisualDataWeb/ProtegeVOWL · Protégé: https://protege.stanford.edu/software/ (v5.6.9, current) — *all 200*.
- Recency: OntoGraf/OWLViz frozen ~2016; SOVA ~2019 (Protégé‑4 era); VOWL plugin revived 2026. 
- **Pros:** good ad‑hoc desktop exploration; OWLViz/OntoGraf export SVG/DOT. **Cons:** **desktop‑only, manual export, no theming, not CI‑automatable.** **Verdict:** non‑starter for embedding (at most a one‑off SVG source).

**OWLGrEd** — UML‑style OWL diagrams; auto‑lays‑out a whole ontology.
- Project: https://owlgred.lumii.lv · Online: https://owlgred.lumii.lv/online_visualization *(both 200)*.
- **Pros:** auto whole‑ontology UML straight from OWL; familiar idiom. **Cons:** online renderer is **server‑side**; desktop tool is **Windows‑only**; no theming; degrades at this scale; SKOS/SHACL not first‑class. **Verdict:** poor fit; manual SVG snapshots only.

**LodLive** — jQuery force‑directed LOD browser over a live SPARQL endpoint.
- Project: https://github.com/LodLive/LodLive · Host: http://lodlive.it *(200 but serves a degraded placeholder; HTTPS dead)*.
- **Pros:** pure client‑side; nice "follow‑your‑nose" UX. **Cons:** **requires a runtime SPARQL endpoint the CDN site doesn't have** (hard blocker); unmaintained since 2019; per‑node explorer, not a whole‑graph renderer. **Verdict:** non‑starter.

**GraphDB Visual Graph (Ontotext)** — interactive RDF explorer in the GraphDB Workbench.
- Project: https://www.ontotext.com/products/graphdb/ · Docs: https://graphdb.ontotext.com/documentation/11.3/visualize-and-explore.html *(both 200)*. GraphDB 11.3.3 (2026‑04‑23).
- **Pros:** mature, renders live from loaded data. **Cons:** needs a **running GraphDB server** (a *different* triplestore from Fuseki, license‑gated since 11.0); **no SVG/PNG export** from Visual Graph; embed is an iframe to a live Workbench. **Verdict:** non‑starter (server‑bound; same disqualifier as Stardog/RDF4J Workbench).

**RDF Grapher (Linked Data Finland)** — hosted RDF→Graphviz image service.
- Project: https://www.ldf.fi/service/rdf-grapher *(200, live)*.
- **Pros:** zero‑install paste‑and‑render; Turtle→SVG/PNG. **Cons:** third‑party hosted (unvendorable, non‑reproducible); no styling control; whole‑graph dumps unreadable. **Verdict:** ad‑hoc browser utility; it's the un‑controllable sibling of a self‑hosted rdf2dot.

**rdf2dot / rdflib** — built‑in RDF→DOT in the Python rdflib library. **(Recommended static path — §5.3)**
- Project: https://github.com/RDFLib/rdflib (rdflib 7.6.0 · 2026‑02‑13) · Docs: https://rdflib.readthedocs.io/en/stable/apidocs/rdflib.tools.rdf2dot/ *(both 200)*.
- **Pros:** pure‑Python, pip‑pinnable, build‑time **static SVG**, **CI‑gateable** (diff the DOT), CSS‑themeable inline SVG. **Cons:** stock whole‑graph output is a hairball (needs SPARQL scoping); default styling fixed; adds Python+Graphviz to the build; draws raw triples (no OWL semantics) → wants a bespoke query. **Verdict:** strong build‑time‑SVG fit when scoped.

**SKOS Play! (Sparna)** — SKOS thesaurus renderer/visualizer. **(Recommended SKOS complement — §5.4)**
- Project: https://skos-play.sparna.fr/ · App: https://skos-play.sparna.fr/play/ · Repo/CLI: https://github.com/sparna-git/skos-play *(all 200)*. `master` active 2026‑03‑20 (last tag v0.9.1, 2022).
- **Pros:** best‑in‑class for concept schemes; build‑time CLI reads Fuseki → committable HTML tree/sunburst/index. **Cons:** **SKOS‑only**; no tagged release since 2022; theming is CSS‑retrofit; needs JDK in build. **Verdict:** strong complement, not a general engine.

### B. General‑purpose JS graph libraries (build‑time JSON → client render)

**Cytoscape.js** — see §5.1. **🏆 Primary pick.** https://js.cytoscape.org · MIT · v3.34.0 (2026‑06‑02).

**G6 (AntV)** — batteries‑included graph engine; closest alternative to Cytoscape.
- Project: https://g6.antv.antgroup.com/en · Examples: https://g6.antv.antgroup.com/en/examples · Repo: https://github.com/antvis/G6 *(all 200)*. MIT, ~12.2k★, v5.1.1 (2026‑04‑17).
- **Pros:** built‑in light/dark themes + 20+ palettes; 10+ layouts (force, dagre, radial, combo); minimap/legend/toolbar plugins; multi‑renderer (Canvas/SVG/WebGL). **Cons:** largest bundle/dep tree; broad v5 API learning curve; docs partly China‑centric. **Verdict:** strong alternative if you want turnkey UI chrome; loses to Cytoscape on integration cost + CSS‑token theming.

**force‑graph / 3d‑force‑graph (Vasturiano)** — smallest, simplest force engine.
- Project: https://vasturiano.github.io/force-graph/ · Repo: https://github.com/vasturiano/force-graph · 3D: https://vasturiano.github.io/3d-force-graph/ *(all 200)*. MIT; force‑graph v1.51.4, 3d v1.80.0.
- **Pros:** lowest‑effort API; maps 1:1 to RDF triples; Canvas 2D + WebGL 3D; trivial Astro embed. **Cons:** **force‑only** (no tidy hierarchical layout); **code‑only theming** (no CSS toggle); no built‑in chrome. **Verdict:** excellent if you only need force views and will hand‑wire the palette.

**vis‑network (vis.js)** — easiest turnkey interactive network.
- Project: https://visjs.github.io/vis-network/ · Examples: https://visjs.github.io/vis-network/examples/ · Repo: https://github.com/visjs/vis-network *(all 200)*. Apache‑2.0 OR MIT, ~3.6k★, v10.1.0 (2026‑05‑15).
- **Pros:** simplest API + JSON shape; built‑in clustering; near drop‑in. **Cons:** **JS‑options theming, not CSS** (harder dark‑mode wiring); weaker hierarchical layout; no graph‑analysis primitives. **Verdict:** good lighter‑weight choice; Cytoscape better for CSS theming + class trees.

**D3.js (d3‑force)** — maximum control, maximum hand‑rolling.
- Project: https://d3js.org · Repo: https://github.com/d3/d3 *(both 200)*. ISC, 113k★; d3‑force v3.0.0 (stable/quiescent). Demo: https://observablehq.com/@d3/force-directed-graph *(live JS‑app)*.
- **Pros:** total visual control (matches the Mermaid client‑theming pattern); tiny; ubiquitous. **Cons:** you implement render/zoom/drag/labels yourself (most code); SVG slows past ~1–2k elements. **Verdict:** strong but only if you want bespoke control; Cytoscape gives 80% of it with far less code.

**Sigma.js + Graphology** — WebGL renderer + graph model.
- Project: https://www.sigmajs.org · Repo: https://github.com/jacomyal/sigma.js · Graphology: https://github.com/graphology/graphology *(all 200)*. MIT; Sigma 3.0.3, Graphology v0.26.0.
- **Pros:** WebGL scales to 10k+; turnkey interactions; Graphology gives real subgraph/traversal ops. **Cons:** **two packages + separate layout**; attribute/reducer theming (not CSS); WebGL scale is **overkill for ~610 nodes**. **Verdict:** over‑engineered here.

**Cosmograph / cosmos.gl** — GPU graph renderer.
- Engine (MIT, OpenJS): https://github.com/cosmosgl/graph · Product: https://cosmograph.app *(both 200)*.
- **⚠ License trap:** engine `@cosmograph/cosmos` is **MIT**, but the convenience wrapper `@cosmograph/cosmograph` is **CC‑BY‑NC‑4.0 (non‑commercial)**. **Cons:** built for 100k+ nodes (massive overkill); GPU‑array data model; no CSS theming. **Verdict:** poor fit unless the graph explodes in size — and only via the MIT engine.

**RDF→graph bridges (the build step):** **N3.js** (MIT, https://github.com/rdfjs/N3.js, v2.0.3 · 2026‑03‑07) — recommended Turtle parser; **Comunica** (MIT, https://comunica.dev, v5.2.3 · 2026‑05‑26) — real SPARQL over Fuseki or local TTL. rdflib.js (heavier) and rdf‑ext (extra layer) only if you need JSON‑LD/RDF‑XML or the `Dataset` API. The legacy **d3sparql/d3‑sparql** helpers are stale (2015–2019) and only reshape `SELECT` rows — write the ~30‑line quad→{nodes,edges} mapping yourself.

### C. Diagram‑as‑code / build‑time generators

**Mermaid** — see §5.2 (incumbent, curated parts). https://mermaid.js.org · live editor https://mermaid.live/ · v11.x. OWL→Mermaid converter **OntoMermaid** (https://github.com/floresbakker/OntoMermaid) is pre‑release and OWL‑only (no SKOS/SHACL).

**Graphviz / DOT** — see §5.3. https://graphviz.org/ · v15.0.0 (2026‑05‑23). The mature static‑SVG backend; needs a converter (rdf2dot et al.) to ingest RDF.

**D2 (Terrastruct)** — see §5.3 (static alternative). https://d2lang.com/ · https://play.d2lang.com/ · v0.7.1, MIT (TALA engine proprietary). Strong dark themes + byte‑stable SVG; **no RDF converter exists** (DIY emitter).

**PlantUML** — https://plantuml.com/ · https://www.plantuml.com/plantuml/uml/ · v1.2026.6. Best Turtle converter is **rdfpuml** (https://github.com/VladimirAlexiev/rdf2rml, active) but it drags in **Perl + Graphviz**; Smetana gives determinism. **Verdict:** weak — UML idiom, heavy converter chain, no native RDF.

**nomnoml** — https://nomnoml.com/ · https://github.com/skanaar/nomnoml · v1.7.0. Tiny client‑side UML renderer. **Verdict:** weak — doesn't scale, weak theming, no RDF ingestion; D2 dominates it.

**Other RDF→DOT converters:** `ontology-visualization` (usc‑isi‑i2, more OWL‑aware but stale 2021), `OBOGraphViz` (needs OBO‑JSON), `rdfviz` (niche, stale), `sparql-to-graphviz`/`ONT‑DOT` (thin). All point to the same conclusion: a small **owned SPARQL‑CONSTRUCT→DOT** script beats adopting any thin repo wholesale.

**Doc generators that embed diagrams (not diagrammers):** pyLODE (https://github.com/RDFLib/pyLODE, v3.5.0, SKOS‑aware) and WIDOCO (https://dgarijo.github.io/Widoco/, v1.4.25) — excellent **documentation** tools, but their only diagram path is WebVOWL (non‑deterministic, OWL‑only). Already covered by the ADR‑0041 bake‑off.

---

## 7. Appendix B — non‑starters (one line each)

| Tool | Why it's out for OPDA |
|---|---|
| LodLive | Needs a **runtime** SPARQL endpoint the static site doesn't have; unmaintained. |
| GraphDB Visual Graph | Needs a running (licensed) GraphDB server; no static export. |
| Protégé OntoGraf/OWLViz/SOVA/VOWL | Desktop‑only, manual export, no theming, not CI‑automatable. |
| OWLGrEd | Server‑side online / Windows‑only desktop; unthemeable; scale‑limited. |
| RDF Grapher | Third‑party hosted; unvendorable; no styling control. |
| Cosmograph wrapper | `@cosmograph/cosmograph` is **CC‑BY‑NC** (non‑commercial); 100k‑node overkill. |
| nomnoml / PlantUML | Don't scale / heavy converter chain; no native RDF; dominated by D2 + rdf2dot. |

---

## 8. Appendix C — link‑validation log

Every project/demo link in this report was fetched and returned **200‑OK** (or a documented redirect). The 9 load‑bearing links in the recommendation were re‑validated directly on **2026‑06‑14**:

- ✅ https://js.cytoscape.org — Cytoscape.js docs (MIT, "fully featured graph library")
- ✅ https://js.cytoscape.org/demos/colajs-graph/ — live interactive Cola.js layout demo
- ✅ https://github.com/cytoscape/cytoscape.js — MIT, v3.34.0 (2026‑06‑02)
- ✅ https://mermaid.js.org — Mermaid diagramming tool
- ✅ https://rdflib.readthedocs.io/en/stable/apidocs/rdflib.tools.rdf2dot/ — documents `rdf2dot(g, stream, opts)`
- ✅ https://graphviz.org/ — Graphviz open‑source graph visualization
- ✅ https://d2lang.com/ — confirms adaptive dark mode + SVG/PNG/PDF export
- ✅ https://skos-play.sparna.fr/ — render/validate SKOS vocabularies
- ✅ https://github.com/rdfjs/N3.js — MIT, streaming RDF for JS (788★)

Notes from validation: npm HTML pages 403 to automated fetch (facts sourced from the npm **registry** JSON instead); `vowl.visualdataweb.org` and the LodLive HTTPS host are dead (canonical alternatives cited); Cosmograph's license is split (engine MIT / wrapper CC‑BY‑NC).

---

## 9. Next step (if adopted)

1. Add a build‑time extractor: `scripts/ontology-graph.mjs` — **N3.js** parse of the committed TTL (or **Comunica** `CONSTRUCT` vs Fuseki) → `public/ontology/graph/elements.json` (sorted, committed, CI‑diffed).
2. Add a Cytoscape client island (themed from the existing CSS dark‑mode tokens; `dagre`/`elk` for the class tree, `fcose` for the whole‑graph view) on a new `/ontology/graph` page.
3. Keep Mermaid for authored subgraphs; optionally add the **rdf2dot/Graphviz** static path for gated in‑prose figures and **SKOS Play!** for a concept‑scheme reference.
4. Record the decision as an ODR/ADR (cross‑references ADR‑0041).
