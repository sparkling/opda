# Council Session 045 — Shared Brief & Evidence

**Read this first.** It is the shared brief for every panellist. Form your positions from your own published methodology, grounded in citations (§Citation discipline below).

## Proposition

Resolve three standing observations about the OPDA ontology's web presentation — the interactive graph at `/ontology/graph` (8-engine bake-off, ADR-0043/0047) and the `/ontology/classes` index — by deciding what, if anything, to change in (a) the **graph extractor** (`scripts/ontology-graph.mjs`), (b) the **model extractor** (`scripts/ontology-model.mjs`), and (c) the **ontology itself**, versus what is **correct-by-doctrine** and should be left as-is or merely re-presented.

The three observations (operator, looking at the live graph + classes page):

1. **A huge amount of unconnected entities.**
2. **A very small amount of entities.**
3. **The graph conflates layers** — domain model, SHACL, SKOS, gUFO — onto one canvas.

A prior viz change already landed (facets became a *filter*, colour now encodes node *type*, edgeless externals hidden under filtering). That addressed the colour-noise symptom of #3 only. This council is about the **substance**: the disconnection (#1), the thinness (#2), and the deeper layer-conflation (#3).

## Empirical findings (verified against the committed artefacts)

Graph default view = **40 owl:Class nodes + 28 object-property edges**. SKOS toggle adds **49 skos:ConceptScheme + 323 skos:Concept + 323 `inScheme` edges**. Model totals: 40 classes, 30 object properties, **225 datatype properties**, **325 SHACL shapes**, 323 concepts, 49 schemes.

- **#1 disconnection:** Only **15 of 40 classes** touch an object-property edge → **25 orphan classes** (Person, Buyer, Organisation, Relator, Role, RoleMixin, Proprietor, Seller, Evidence-roles, etc.). ~16 of the 28 edges are spokes into **MonetaryAmount** (every price/fee/rent attribute, per ODR-0024). The SKOS layer has **0 `skos:broader` edges in the source** → 49 disconnected scheme-stars. **No edge type connects the OWL layer to the SKOS layer**: `usesSchemes` is empty on all 40 classes, and the only two object properties reaching vocabularies (`currency→Concept`, `peril→Concept`) point at a bare generic `Concept`.
- **The model has NO `rdfs:subClassOf`** (deliberate — "rigid classes, facets not subclass trees", ODR-0011 / session-036). gUFO typing is the **string facet** `opda:ufoCategory`, not an edge.
- **#2 thinness:** 40 classes by doctrine. The mass lives in 225 datatype properties + 325 SHACL shapes + 323 concepts — none surfaced as graph structure. Shapes appear only as a boolean `hasShape` ring; datatype properties are dropped entirely.
- **#3 conflation:** the extractor unions `owl:Class`, `skos:ConceptScheme`, `skos:Concept`, `external` targets, plus gUFO categories, on one untyped node-link canvas; SKOS = ~90% of nodes. There is no `layer` facet distinguishing T-Box OWL / SKOS vocabulary / SHACL shapes.
- **The crux for #1:** coded values bind to vocabularies via **SHACL `sh:in` enumerations (25–27 property shapes)**, NOT via `rdfs:range → SomeScheme`. The model extractor's `usesSchemes` logic only checks `rdfs:range ∈ schemes`, so it never matches → the class↔vocabulary linkage is present in the SHACL layer but invisible to the graph.

## The four questions (give a verdict on EACH: AFFIRM / REVISE / REJECT + FOR/AGAINST/ABSTAIN ballot)

**Q1 — The class→vocabulary bridge.** Should the extractor recover and draw **class→SKOS-scheme edges from the SHACL `sh:in` enumerations** (and the `→Concept` ranges), connecting the OWL layer to the SKOS layer? Is surfacing a `sh:in` constraint as a class→scheme *relation* faithful to the semantics, or a category error (a SHACL constraint is not an ontological relation)? If REVISE: what predicate/þshape should carry it (e.g. a derived `opda:usesScheme`)?

**Q2 — The unconnected classes / honesty of the disconnection.** 25/40 classes float because there is no `rdfs:subClassOf` and gUFO typing is a string facet. Is this disconnection a **faithful reflection of a deliberately rigid, identity-criterion-driven model** that should be left as-is — or should additional *real* relations (relator-mediation, rdf:type-to-gUFO-category) be surfaced as edges so the role/relator classes connect?

**Q3 — Layer separation vs one canvas.** Should `owl:Class` / `skos:Concept(Scheme)` / `sh:NodeShape` / gUFO categories be **explicitly separated into toggleable, grouped layers** (an `opda:layer`-style view dimension) — or is a single unified node-link graph the **wrong instrument** for a multi-layer KG, such that SKOS should be shown as a tree/sunburst and OWL as a class diagram, *separately*?

**Q4 — Surfacing the mass / "too few entities".** The 40 classes are deliberately few (coded values are SKOS, not subclasses). The mass is 225 datatype properties + 325 shapes + 323 concepts, none on the graph. Should datatype properties and/or shapes be **surfaced** (nodes / edges / node badges), or kept off as attributes — and is "40 classes" a **defect to fix or correct-by-doctrine to communicate better**?

## Input documents (read as needed)

- `scripts/ontology-graph.mjs` — the graph-element extractor (the transform under review).
- `scripts/ontology-model.mjs` — the SPARQL model extractor (the `usesSchemes` / `sh:in` gap; ~lines 270–290).
- `src/data/ontology-model.json` — the committed model (classes, objectProperties, datatypeProperties, shapes, concepts, schemes).
- `public/data/ontology-graph-elements.json` — the committed graph elements (`counts` block has the node/edge tallies).
- `public/ontology/artefacts/opda-shapes-merged.ttl` — the SHACL shapes (grep `sh:in`).
- `src/pages/ontology/graph.astro`, `src/pages/ontology/classes.astro` — the pages observed.

## Prior related records (engage these — they carry the "by-doctrine" arguments)

- **ODR-0011** — `opda:ufoCategory` as a structured facet (§8a): gUFO meta-category is a value, not a subclass.
- **session-036 / "classification over inheritance"** — kind-axes ship as facets (`sh:in` via `sh:targetSubjectsOf`), NO subclass trees; promote to subclass only on a *distinct* identity criterion or property.
- **ODR-0015** — Address / property identity criteria (the IC-over-hard-cases discipline).
- **ODR-0024** — monetary amounts modelled as an object property to a `MonetaryAmount` value class (the source of the MonetaryAmount hub).
- **ADR-0043 / ADR-0047** — the graph tooling / 8-engine bake-off (the artefact under observation).

## Constraints

- Deploy freeze: `main` is held (ahead of origin); this council shapes a *proposal*, the operator ratifies adoption. Nothing ships from this session without the operator's word.
- Determinism: the graph extractor is drift-gated (`make ci-ontology-graph`); any change must stay a pure, byte-deterministic transform.
- The viz layer (engine JS) is browser-tested, not CI-gated; the **data layer** (extractors) is gated.

## Citation discipline (load-bearing)

Every position MUST cite a source meeting the methodology §Citation grounding standard: a named W3C/OMG spec + section (e.g. "SHACL Core §4.6.1 `sh:in`"; "SKOS Reference §8 `skos:inScheme`"); a book you (co-)authored + chapter (e.g. "*Semantic Web for the Working Ontologist* 3rd ed. Ch. 10"); a peer-reviewed paper (e.g. "Guizzardi 2005, *Ontological Foundations…*"); a deployment you led (e.g. "BBC `/programmes` ontology"); or a maintained OSS project + named convention. **No anonymous "best practice".** An ungrounded position is not counted toward the vote. The Queen web-verifies external citations (a prior session wrongly called a real paper fabricated — citations are checked, not assumed).

## Cross-talk + output (mandatory)

- **Team:** `council-045`. Use `SendMessage` to engage **at least one** peer per question you have a view on — agree, refine, or rebut (parallel monologues are not a deliberation). Reach especially across the SHACL↔SKOS↔identity↔pragmatic divides.
- **Working file (permanent transcript):** write `docs/ontology/odr/council/working/session-045/<your-id>.md` AS YOU GO — OPENING (per-question position + ballot + grounded citation), then EXCHANGES (every DM you send mirrored **verbatim**, plus any position change a peer caused), then FINAL (settled per-question verdict). Do NOT only summarise — the working file is the posterity record; the lead sees only one-line DM summaries live.
- **Return** to the Queen: your per-question verdicts (AFFIRM/REVISE/REJECT + FOR/AGAINST/ABSTAIN), each with its one-line grounded citation, and (DA only) your explicit WITHDRAW/HOLD disposition + named re-open trigger per contested question.
