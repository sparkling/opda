# Ontology-documentation bake-off — comparison & M6 scorecard

ADR-0041 §Amendments rev 4, M6. Operator's inspection aid. **M6 decider = the
operator, on inspection** — this rubric structures that inspection and the
per-layer pick; it does not itself decide. Tie-break: toward the tool needing
**least custom post-processing for fidelity**.

- **Date:** 2026-06-14
- **Inputs:** `opda-merged.ttl` (asserted TBox, OWL+SKOS — 40 owl:Class, 30
  object + 226 datatype props, 1 annotation prop, 48 skos:ConceptScheme, 314
  skos:Concept, 14 owl:Ontology), `opda-shapes-merged.ttl` (SHACL),
  `opda-merged-entailed.ttl` (Safe-Group closure == asserted on the schema;
  0-delta over the TBox per ODR-0029 / Council session-039 — so a **single**
  rendering per tool for the TBox is correct; entailed≡non-entailed here).
- **Coverage layers (ADR-0041 matrix):** OWL terms · SKOS · SHACL ·
  overlay-profiles + gap register · round-trip exemplars · three-graph
  separation · governance / ODR–ADR / lineage · known-issues register.
- **Scale:** **Full** / **Partial** / **None** per layer, plus per-tool
  **fidelity** and **integration cost** notes.

## Scorecard

| Tool | OWL terms | SKOS | SHACL | Profiles + gap | Exemplars | Three-graph | Governance / lineage | Known-issues |
|---|---|---|---|---|---|---|---|---|
| **pyLODE** | **Full** | Partial | **None** | None | None | None | Partial | None |
| **WIDOCO** | **Full** | Partial | **None** | None | None | None | Partial | None |
| **SHACL Play!** | Partial | None | **Full** | Partial | None | None | Partial | None |
| **Ontospy** | **Full** | **Full** | **None** | None | None | None | Partial | None |
| **LODE** (≡ Widoco-embedded) | **Full** | Partial | **None** | None | None | None | Partial | None |
| **Skosmos** | None | **Full** | None | None | None | None | None | None |
| **custom `opda-gen` + LLM** | (reuses above) | (reuses above) | (reuses above) | **Full** | **Full** | **Full** | **Full** | **Full** |

> "Partial" governance for the OWL/SHACL tools = they render `dct:source` /
> `rdfs:comment` provenance **values** that happen to be present on terms
> (e.g. Widoco shows "…BASPI5 question. Bound to opda:YesNo" in comments; 9
> `dct:source` hits; SHACL Play! 11), but **none** of them render the
> ODR/ADR/council *lineage* as a structured governance layer. The
> profiles/exemplars/three-graph/known-issues columns are **None** for every
> off-the-shelf tool — proven by inspection (no tool emits the 31 overlay
> profiles, the 1095-leaf GAP register, the 17 round-trip exemplars, the
> three named graphs, or a dated known-issues register). This is the empirical
> basis for the custom layer (see `custom/README.md`).

## Per-tool detail

### pyLODE — `pylode/index.html` (942 KB, single file) · RENDERED

- **Profile:** default `ontpub`. Sections: Metadata · Classes · Object
  Properties · Datatype Properties · Annotation Properties · Namespaces ·
  Legend. 266 `opda:` term refs; EPCCertificate documented.
- **OWL = Full**, single navigable page, anchors = local names. Best
  single-file OWL term reference (matches ADR-0041 expectation).
- **SKOS = Partial:** concept *values* appear inline (533 "vocabular" refs)
  but there is **no browsable Concept-Scheme section** — only one "Concept
  Scheme" heading. Schemes are folded into the term reference, not navigable.
- **SHACL = None** (no shapes section; the OWL generators skip SHACL).
- **Fidelity: high.** **0 blank nodes.** No asserted-vs-entailed confusion
  (single TBox; 0-delta closure). SHACL simply absent, not misrepresented.
- **Integration cost: low.** One self-contained HTML file, deterministic,
  `pip`/CLI — trivially re-runnable in a byte-identity-vendored gate.

### WIDOCO — `widoco/doc/index-en.html` (1.8 MB) + WebVOWL + provenance · RENDERED

- 32-file bundle: term reference (`doc/index-en.html`), **embedded WebVOWL**
  visualisation (`doc/webvowl/`, 925 KB VOWL graph), W3C PROV-O **provenance
  page** (`doc/provenance/provenance-en.html`), schema.org metadata, light/dark
  CSS, RDF-a, and `.ttl/.owl/.nt/.jsonld` serialisations of the ontology.
- **Note:** output lands under `widoco/doc/` (Widoco's fixed layout), not
  directly in `widoco/`. Entry point: `widoco/doc/index-en.html`.
- **OWL = Full** — richest *publishable* shell: 78 class refs, object/data/
  annotation property tables, named individuals, dark mode, metadata block.
- **SKOS = Partial:** ConceptScheme (98) / Concept (78) refs surface as named
  individuals/annotations, but no dedicated scheme browser.
- **SHACL = None** — confirmed `sh:property` = 0. Shapes graph not consumed.
- **Embedded LODE:** Widoco's cross-reference *is* an updated LODE renderer →
  this **is** the LODE baseline (see `lode/README.md`).
- **Fidelity: high**, but BASPI/profile/exemplar strings appear only inside
  `rdfs:comment` text — **not** structured profile/gap docs (do not over-credit).
- **Integration cost: medium.** Multi-file bundle with its own CSS/JS; theming
  into Astro means either iframing or extracting the cross-reference section.
  PlantUML section diagrams need a `dot` binary (graphviz) absent here —
  non-fatal, the HTML is complete without them.

### SHACL Play! (Sparna) — `shaclplay/index.html` (212 KB, single file) · RENDERED

- `doc` subcommand, `-i opda-shapes-merged.ttl -w opda-merged.ttl -l en`.
  **194 shape mentions, 957 `opda:` term refs, 37 constraint tables.**
- **SHACL = Full — the only tool that documents SHACL.** Node/property shapes
  rendered as readable constraint tables (targets, datatypes, cardinalities,
  `sh:in`, severity).
- **Fidelity: highest where it counts — 0 blank nodes.** SHACL constraints are
  normally a forest of blank nodes; SHACL Play! resolves them into named,
  tabular rows (the exact fidelity win ADR-0041 §Option C demands). `-w` lets
  shape→class labels resolve against the OWL.
- **SHACL = Full, but OWL = Partial** (it documents shapes, surfacing classes
  only as shape targets, not the full OWL axiomatisation) and **SKOS = None**.
  **Profiles = Partial:** the overlay-profile *shapes* are in the shapes graph,
  so they render as shapes — but the *gap register* and thin-vs-bound doctrine
  are not produced.
- **Integration cost: low–medium.** Single deterministic HTML, CLI/jar,
  vendorable. The optional UML diagrams need graphviz `dot` (absent → those
  diagrams skipped; harmless, content complete). Version-pin + semantic-diff
  per the gate's tier (ii).

### Ontospy — `ontospy/index.html` + 795 entity pages (multi-page) · RENDERED

- `gendocs --type 2` (HTML multi-page). **796 files: 49 class + 257 property +
  314 concept pages + index.** 611 entity links from the index; "Concepts ("
  nav section present.
- **OWL = Full** and **SKOS = Full** — the **only** OWL-family tool that gives
  SKOS concepts **first-class browsable pages** (one per concept), beating
  pyLODE's folded-in treatment on the SKOS layer.
- **SHACL = None.**
- **Fidelity: high (0 blank nodes), with two caveats from this run:**
  1. **The `-i` (individuals) flag crashes** Ontospy 2.1.1 on rdflib 7.x
     (`TypeError: 'method' object is not iterable` in
     `browser_individualinfo.html` — `each.instance_of` is a method). Run
     **without** `-i`; SKOS concepts still get pages (they are typed
     resources), so the loss is only true OWL named-individuals.
  2. **"Pygmentize Failed"** warnings → RDF code snippets render **without**
     syntax highlighting (cosmetic; pages are complete and correct).
- **Compatibility finding (real):** Ontospy 2.1.1 imports the removed
  `SafeConfigParser` and is documented as broken on Python ≥3.12 — **confirmed
  by provisioning Python 3.11.7 (`uv venv --python 3.11`)**, where it loads and
  runs. On 3.13 it would not import. So Ontospy is **available only via a
  pinned 3.11 interpreter** — an integration-cost tax.
- **Integration cost: medium–high.** 796-file tree (heavier to vendor + gate
  than a single file), Bootstrap theme, **and** a non-default Python 3.11
  toolchain. The template + pygments bugs mean it needs the most custom
  post-processing for a clean result — relevant to the M6 tie-break.

### LODE — `lode/README.md` (represented via Widoco) · DOCUMENTED, NOT STOOD UP

- LODE is a **web service over a dereferenceable ontology URL**; the OPDA TTL
  is not hosted, and ADR-0041 B2 says don't stand up the servlet. **Widoco
  embeds an updated LODE renderer**, so the LODE rendering already exists as
  `widoco/doc/index-en.html` — the **comparison baseline** (the DA's own tool).
- Coverage therefore **equals Widoco's** (OWL Full, SKOS Partial, everything
  else None). README documents the one-URL recipe once the TTL is hosted.
- **Integration cost: high for nil gain** over Widoco as a standalone surface.

### Skosmos — `skosmos/README.md` + `skosmos/schemes.html` · DOCUMENTED + STATIC FALLBACK

- **Live PHP server over a SPARQL endpoint** — not a static generator. Per
  ADR-0041 B2 (localhost + link-out) it is **not** stood up in this run; the
  README gives the **exact `docker run natlibfi/skosmos` launch command**
  against the local Fuseki (`http://localhost:3031/opda/sparql`), a `config.ttl`
  sketch, and a proposed `make skosmos` target.
- **Static fallback shipped:** `skosmos/schemes.html` — all **47 named SKOS
  concept schemes** with prefLabels + in-scheme concept counts (308 concepts),
  generated live from the TTL. An inventory, not a thesaurus.
- **SKOS = Full** when live (scheme tree, broader/narrower, alt-labels, search,
  multilingual); **None** for every other layer.
- **Integration cost: highest** — live server, cannot be captured into the
  static deploy; localhost-link contract only.

### custom `opda-gen` + LLM — `custom/README.md` · INTEGRATION TARGET, NOT A SILO

- Not a standalone renderer. It is the **woven `/ontology` section** that
  combines the off-the-shelf renderings (where they win) + custom `opda-gen`
  scripts (for the layers no tool covers) + LLM prose (conceptual/rationale).
- **The only approach scoring Full on profiles+gap, exemplars, three-graph,
  governance/lineage, and known-issues** — the five columns that are **None**
  across every off-the-shelf tool. This is ADR-0041's expected-and-now-proven
  result: no single tool suffices; the adopted artefact composes all three
  methods, guarded by the two-tier doc-drift CI gate.

## Bottom line (for the operator's per-layer pick)

| Layer | Strongest tool(s) | Why |
|---|---|---|
| OWL term reference | **pyLODE** (single-file) or **Widoco** (publishable shell + WebVOWL + provenance) | both Full, 0 blank nodes, deterministic, low-cost |
| SKOS schemes | **Skosmos** (live, Full) → **Ontospy** (static, Full, browsable) → **pyLODE/Widoco** (Partial) | Skosmos best when the local stack runs; Ontospy is the best *static* SKOS |
| SHACL shapes / profiles | **SHACL Play!** (only option; Full; 0 blank nodes) | the sole tool that documents SHACL at all |
| Profiles + gap · exemplars · three-graph · governance lineage · known-issues | **custom `opda-gen` + LLM** (only option) | every off-the-shelf tool is None here |
| Diagram / visual | **Widoco** (embedded WebVOWL) | the only embedded interactive visualisation |

**Fidelity ranking:** SHACL Play! and pyLODE are cleanest (single file, 0 blank
nodes, no post-processing). Widoco is clean but multi-file. Ontospy needs the
most post-processing (Python 3.11 pin + `-i` crash + pygments warnings) — so on
the M6 tie-break ("least custom post-processing for fidelity") Ontospy ranks
last among the working OWL tools despite its Full SKOS coverage.

**No off-the-shelf tool covers the OPDA-specific layers** — confirmed by
inspection. The composed reference (off-the-shelf where they win + custom
`opda-gen` + LLM prose), guarded by the two-tier doc-drift gate, is the
configuration the matrix points to. Final per-layer adoption is the operator's
call on inspection (M6).
