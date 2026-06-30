---
status: proposed
date: 2026-06-30
tags: [ontology, visualization, mermaid, class-diagram, cross-section, subclassof, accessibility, astro]
supersedes: []
depends-on: [ADR-0043, ADR-0044, ADR-0048, ODR-0027, ODR-0034]
implements: [ODR-0034]
---

# Cross-section class-diagram links + the `rdfs:subClassOf` render layer

## Context and Problem Statement

The per-section class diagrams on `/ontology/classes` (`src/pages/ontology/classes.astro`, `sectionDiagram()`; authored Mermaid fed by the committed `src/data/ontology-model.json`, ADR-0043/0044) draw a class graph for each bounded-context module. A 2026-06-30 review found two legibility defects:

1. **Cross-section links were one-directional and unlabelled.** `sectionDiagram()` walked only each class's `outgoing` object properties. A class whose only edges *cross a section boundary* (e.g. `EPCCertificate`, `MonetaryAmount`, `RoomDimension`, `Address`, the Person/Org→Address joins) therefore rendered **isolated within its own section**, and the foreign classes it linked to appeared as plain `:::external` nodes with no indication of which section they belong to.

2. **`rdfs:subClassOf` is never drawn — and the model never extracts it.** The diagrams (and the interactive `/ontology/graph`, ADR-0047) draw only object-property edges. `ClassEntry` (`src/lib/ontology-model.ts`) has no `subClassOf` field and `scripts/ontology-model.mjs` issues no subClassOf query. Consequently **18 of 40 classes render as disconnected nodes** — most of them perdurant events (`rdfs:subClassOf prov:Activity`), Information Objects (`rdfs:subClassOf prov:Entity`), or `time:ProperInterval` — whose genuine connective tissue is *subsumption to an external upper class*, which the diagram hides. Council [session-051](../ontology/odr/council/session-051-relationship-residue-completion.md) Q6 ruled 7–0 that this is a **rendering** defect, not a modelling one.

This ADR records the diagram engineering: the cross-section link change (shipped) and the `rdfs:subClassOf` render layer (decided, pending).

## Decision Drivers

* **Tell the truth about connectivity.** A class that *is* connected (cross-section, or by subsumption) must not read as an orphan.
* **Theming convention (ADR-0043).** `public/ui/client.js` owns the Mermaid palette (`cagleClassDefs`); pages author bare `:::name`, never hardcoded `classDef`/`%%init%%` (dark-mode + CVD safety).
* **Documentary, never entailed (ODR-0026/0029; ADR-0035).** Drawing `rdfs:subClassOf` (incl. external `prov:`/`time:` supers) is description; it must not imply a modelling commitment OPDA doesn't hold, and is consistent with ODR-0027 *classification-over-inheritance* (which forbids *building* coded-facet subclass trees, not *depicting* the few authored super-edges — Cagle, session-051 Q6).
* **No model/drift-gate disruption for the shipped part; a clean model extension for the new part.**

## Considered Options

* **Option A (chosen) — Bidirectional cross-section links with a dashed `:::xsection` node style (shipped), plus a muted/optional `rdfs:subClassOf` layer extracted into the model and rendered distinctly (pending).**
* **Option B — Mint object properties to "connect" the orphans.** Rejected by session-051 (Davis: "do not mint OWL to satisfy a renderer"); the orphans' relations are either PROV-native, value-slots, or RESIDUE-PENDING (ODR-0034).
* **Option C — Leave the diagrams as-is and explain the orphans in prose.** Rejected: the disconnection misrepresents 18/40 classes at a glance.

## Decision Outcome

Chosen option **A**, in two parts.

### Part 1 — Cross-section links (As-built, shipped 2026-06-30)

`sectionDiagram()` now walks **both** `outgoing` and `incoming` object properties, so a cross-section link is drawn in **both** endpoints' sections. A class owned by another section renders as a **`:::xsection`** node — a new palette entry in `public/ui/client.js` `cagleClassDefs` (dark + light, `stroke-dasharray`) giving a **dashed border + muted blue-grey fill** — with its owning **"(Section name)"** on a second line (`Name<br/>(Section)`), and the connector itself is dashed (`-.->`). In-section edges stay solid (`-->`). This is purely presentational — no TTL/model change — so the byte-identity, doc-drift, and graph-drift gates are unaffected.

**Verified:** `make build` (1635 pages, exit 0) emits 25 `:::xsection` nodes + 25 `(Section)` sublabels; `make test` 29/29; browser render of the Foundation section confirms the dashed "(Agents & roles)" `Proprietor`/`Person`/`Organisation` nodes via dashed `mediates`/`founds`/`plays`/`playedBy` connectors, no Mermaid parse errors. Effect: every **non-orphan** class now shows ≥1 edge in its own section (de-orphans the section-local-only classes — `EPCCertificate`, `MonetaryAmount`, `RoomDimension`, `Address`, …). The 18 *global* orphans (zero object-property edges anywhere) are unaffected — they are addressed by Part 2.

### Part 2 — `rdfs:subClassOf` render layer (decided session-051 Q6, 7–0 FOR; pending)

1. **Extract `subClassOf` into the model.** Add a `SELECT ?c ?super` query to `scripts/ontology-model.mjs`; store per class a `superClasses: [{ id, localName, external: bool, ns }]` field (external = non-`opda:` super such as `prov:Activity`, `prov:Entity`, `time:ProperInterval`, `vcard:Address`, `org:Organization`, `skos:ConceptScheme`). Regenerate the committed `ontology-model.json` (needs `make serve-data`); the model-drift gate (`make ci-ontology-model`) re-pins it.
2. **Render a distinct, muted, optional/toggleable hierarchy layer.** `isA` edges drawn separately from association edges (e.g. open-arrow `-.->|isA|` to a muted super-node, or a dedicated edge style), de-emphasised; external supers as a distinct node class. This groups the orphan events under `prov:Activity` and Information Objects under `prov:Entity` — resolving the bulk of the "18 disconnected" honestly. ODR-0027-consistent (depiction, not a subclass-tree commitment); documentary, never entailed.
3. **Residual orphans after Part 2** are the foundation scaffolding (`GeneratorRun`, `DiagnosticExemplar`, `ValidationContext` — intentionally standalone, ADR-0009) and the reference-not-import governance classes (`DPVMappingRecord`, `SpecialCategoryScheme`) — documented as intended, not defects.

### Consequences

* Good, because cross-section relationships are now visible in every section, and (Part 2) subsumption connectivity dissolves most orphans without minting edges.
* Good, because the `:::xsection` style + `(Section)` sublabel make context boundaries explicit and reuse the central palette (no second theme).
* Bad (Part 2), because extracting `subClassOf` extends the committed model schema and re-pins `ontology-model.json` + the graph elements (a build-time regeneration, model-drift gate).
* Neutral, because Part 1 shipped with zero model/gate impact.

### Confirmation

Part 1: `make build` + `make test` green; in-browser render verified (no console errors). Part 2 (on implementation): the model carries `superClasses`; `make ci-ontology-model` and `make ci-ontology-graph` re-pin clean; the diagrams render the muted `isA` layer with dark-mode parity; the orphan count drops to the documented residual (foundation scaffolding + reference-not-import governance).

## More Information

* **Diagram tooling / theming:** [ADR-0043](./ADR-0043-ontology-graph-diagram-tooling.md) (`cagleClassDefs` palette convention; authored Mermaid for sub-graphs), [ADR-0047](./ADR-0047-ontology-graph-engine-bakeoff.md) (the interactive graph, same model source).
* **Model:** [ADR-0044](./ADR-0044-ontology-as-web-pages-dereferenceable-entity-detail-pages.md) (`ontology-model.json` extraction); the `subClassOf` field is a new extraction.
* **Modelling rationale:** [ODR-0034](../ontology/odr/ODR-0034-relationship-residue-completion.md) + [session-051](../ontology/odr/council/session-051-relationship-residue-completion.md) Q6 (render, don't mint); [ODR-0027](../ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md) (depiction ≠ subclass-tree commitment); [ODR-0026](../ontology/odr/ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md) (documentary-not-entailed).
* **Shipped files (Part 1):** `src/pages/ontology/classes.astro` (`sectionDiagram` bidirectional + `:::xsection`), `public/ui/client.js` (`xsection` palette, dark + light).
