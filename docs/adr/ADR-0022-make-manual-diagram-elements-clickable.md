---
status: proposed
date: 2026-05-28
tags: [website, diagrams, mermaid, navigation, ux]
supersedes: []
depends-on: [ADR-0015, ADR-0018, ADR-0021]
implements: []
---

# Make manual diagram elements clickable (navigate to entity pages)

## Context and Problem Statement

The manual renders many Mermaid diagrams client-side via `public/ui/client.js`
(mermaid@11 + ELK, theme `base`, `securityLevel: 'loose'`): per-entity ER
diagrams, SKOS scheme-membership graphs, state-transition diagrams, and
flowcharts. Their nodes denote entities / schemes / classes that now have their
own pages — [ADR-0021](./ADR-0021-generate-manual-entity-pages-via-fuseki-grlc-sparql-api.md)
gives every entity a stable route under a coherent cross-tier URL scheme, and the
manual already routes SKOS schemes + exemplars.

But the diagram nodes are inert. A reader looking at Property's ER diagram cannot
click **Address** to jump to the Address page; the diagrams are rich navigation
surfaces going unused. Two facts make this low-cost to fix now: `client.js`
already runs with `securityLevel: 'loose'` (so native Mermaid `click` directives
are enabled), and its header already lists "ER diagram entity click navigation"
as an intended feature — partial scaffolding exists.

This ADR decides how diagram elements become clickable and where they link.

## Decision Drivers

* **Navigability.** Diagrams encode the entity graph; clicking a node to reach
  its page is the natural affordance, and turns every diagram into a site map.
* **Link targets now exist.** ADR-0021 entity pages + `cross-tier.ts` give every
  entity a route; SKOS schemes + exemplars are already routed.
* **Reuse the one loader.** `securityLevel: 'loose'` already enables native click;
  do not fork the Mermaid setup (per ADR-0015 / [ADR-0018](./ADR-0018-manual-remark-rehype-plugins.md)).
* **Cross-diagram-type coverage.** ER, flowchart, class, state, and scheme graphs
  all appear; the approach must cover them or degrade without dead links.
* **Trusted source.** Diagrams are generator-emitted, so click directives /
  handlers act on trusted content — `loose` is acceptable.

## Considered Options

* **A — Generator-emitted native Mermaid `click` directives.** The generator (which knows each node's entity) emits `click <node> "<route>"` in the diagram source. Precise; but native `click` support varies by diagram type (flowchart / class / state support it; `erDiagram` support is historically limited).
* **B — Post-render JS label→route mapping in `client.js`.** After `mermaid.run()`, walk each SVG, match node text to a build-emitted label→route manifest, attach navigation. Works across ALL diagram types incl. ER; needs a manifest + robust label normalisation.
* **C — Hybrid (chosen).** Native `click` directives where the diagram type supports them; post-render JS (extending the existing `client.js` ER-click-nav hook) for ER diagrams and as a general fallback. Both consume one build-emitted route manifest so links resolve only to pages that exist.
* **D — Do nothing / external diagram tool.** Rejected — abandons the navigation affordance.

## Decision Outcome

Chosen option: **C — hybrid**, because no single mechanism covers all the manual's
diagram types: native `click` is precise for flowchart/class/state (and is already
enabled via `securityLevel: 'loose'`), while ER diagrams — the dominant per-entity
diagram — need the post-render JS path that `client.js` already gestures at. A
single build-emitted **label→route manifest** (derived from the ADR-0021 entity
list + `cross-tier.ts`, plus the SKOS-scheme and exemplar routes) feeds both
paths, so a node links only where a page actually exists (no dead links).

### Implementation sketch

* **Manifest** — a build-time map `{ localName/label → route }` from the ADR-0021
  entity list (`/api/entities`) + `cross-tier.ts` + the manual collection
  (schemes, exemplars). Emitted where `client.js` can read it (e.g. a small
  `/manual/diagram-links.json`, or inlined per page).
* **Native** — the diagram generator (`/diagramming` skill / `opda-gen`) emits
  `click <node> "<route>"` for flowchart/class/state nodes that map to a known route.
* **Post-render** — extend the `client.js` post-`mermaid.run()` hook: for each
  rendered SVG, match node text to a manifest key (normalised via the ADR-0021
  slug/PascalCase helpers) and attach navigation (`cursor: pointer` + click →
  `location`). Covers ER + anything lacking native click.
* **Affordance** — clickable nodes get a hover cue (cursor + subtle highlight)
  using existing dark/light tokens.

### Consequences

* Good, because diagrams become navigation — readers traverse the entity graph by clicking, and every diagram doubles as a map.
* Good, because it reuses the existing loader + `securityLevel: 'loose'`; no parallel Mermaid setup (preserves ADR-0015/0018 invariants).
* Good, because the manifest gate means no node ever links to a non-existent page.
* Bad, because ER post-render label→route matching is fuzzy (diagram labels vs `localName`s). Mitigation: normalise via the ADR-0021 `manual.ts` helpers; manifest-gate.
* Bad, because two mechanisms (native + post-render) coexist. Mitigation: both consume one manifest; post-render is the general fallback, native a precision optimisation.
* Neutral, because `securityLevel` is already `'loose'` — no new security posture.

### Confirmation

1. Clicking an entity node in an ER diagram (e.g. **Address** in Property's ER diagram) navigates to `/manual/<tier>/property/address`.
2. Clicking a node in a scheme-membership flowchart navigates to that scheme/concept page.
3. No node links to a non-existent page (manifest-gated; verified by a link-check over emitted `click` targets + manifest entries).
4. Dark/light toggle + ELK layout still render correctly; `client.js` remains the single Mermaid loader (`Diagram.astro` unchanged).

## More Information

* **Link targets + URL scheme:** [ADR-0021](./ADR-0021-generate-manual-entity-pages-via-fuseki-grlc-sparql-api.md) (entity pages, `cross-tier.ts`, `/api/entities`).
* **Mermaid loader (reused):** `public/ui/client.js:228-269` — `securityLevel: 'loose'` (line 268) already enables native `click`; the header lists "ER diagram entity click navigation" as intended.
* **Predecessors:** [ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md) (mermaid integration), [ADR-0018](./ADR-0018-manual-remark-rehype-plugins.md) (mermaid unwrap + loader reuse).
* **Mermaid `click` docs:** https://mermaid.js.org/syntax/flowchart.html#interaction (per-diagram-type interaction support).
