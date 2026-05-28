---
status: accepted
date: 2026-03-29
tags:
- website
supersedes: []
depends-on:
- ADR-0080
- ADR-0059
- ADR-0082
implements: []
---

# Concept Model Diagrams

## Context and Problem Statement

Bounded context detail pages (ADR-0080) show stat cards and cross-domain mappings, but provide no visual overview of the domain model within each boundary. Users who want to understand the class hierarchy and object property relationships in a bounded context must navigate individually to each concept page.

A concept model diagram — showing classes as nodes, subClassOf as inheritance edges, and object properties as labeled relationship edges — is the standard way to communicate domain structure at a glance.

Related: ADR-0080 (bounded context detail pages), ADR-0059 (detail page IA), ADR-0082 (mapping card layout).

## Decision Drivers

* Domain modelling practitioners expect a visual class diagram on any boundary/package overview page
* Diagrams must be generated from live SPARQL data, not hand-drawn, to stay in sync with the ontology
* Nodes must be interactive (clickable to concept/property detail pages) since this is a navigation tool, not just a picture
* Must work within the existing Astro SSG architecture without a build-time rendering dependency

## Considered Options

* Mermaid + ELK layout, client-side rendering via CDN — chosen
* Build-time SVG rendering (mmdc) — adds `@mermaid-js/mermaid-cli` build dependency
* Pure HTML/CSS/SVG diagram — would require implementing a graph layout algorithm
* D3.js force-directed graph — over-engineered, non-deterministic results
* Pre-rendered static images — can't be clickable, go stale, not generated from live data

## Decision Outcome

Chosen option: "Mermaid + ELK layout, client-side rendering via CDN", because it provides interactive clickable nodes, supports complex graph layouts (90+ nodes per context), avoids build-time dependencies, and stays in sync with live SPARQL data.

A "Concept Model" section is added to each bounded context detail page, positioned between the Browse stat cards and the Cross-Domain Mappings section.

### Diagram Content

| Element | Representation | Clickable |
|---------|---------------|-----------|
| OWL classes | Rounded rectangle nodes, purple (Cagle class colour) | Yes — links to `/concepts/{ctx}/{localName}` |
| rdfs:subClassOf | Dotted arrow from child to parent, labelled "is a" | No |
| Object properties (sh:class) | Solid labelled arrow between classes | No — but listed below diagram with links |
| Cross-context targets | Blue node (Cagle instance colour), dashed border | Yes — links to target concept |
| Subject areas | Mermaid subgraphs grouping classes | No |

### Technical Approach

1. Hand-crafted Mermaid diagrams generated using the diagramming skill, one per bounded context (SDS, PF), stored as static string literals in `ConceptModelDiagram.astro`
2. ELK layout engine for complex graph layout (90+ nodes per context)
3. Client-side rendering via Mermaid ESM CDN module (`mermaid@11`), lazy-loaded with IntersectionObserver
4. `securityLevel: 'loose'` enables clickable nodes (Mermaid `click` directive)
5. Cagle semantic palette — purple (`#E1BEE7`/`#6A1B9A`) for classes, blue (`#B3E5FC`/`#0277BD`) dashed for cross-context refs

### Component

New `ConceptModelDiagram.astro` component containing static Mermaid diagram strings per bounded context, Mermaid CDN lazy-loading via IntersectionObserver, and click directives for all class nodes.

### Placement on Page

```
Hero (name, badge, definition, namespace)
Browse stat cards (concepts, properties, vocabularies)
── Concept Model ──────────────────────      ← NEW
   [Mermaid diagram with clickable nodes]
   Properties: prop1 · prop2 · prop3 ...     ← clickable links
── Cross-Domain Mappings ──────────────
   [mapping cards]
── Comments ───────────────────────────
```

### Consequences

* Good, because users get an immediate visual overview of each bounded context's domain model
* Good, because clickable nodes provide fast navigation to concept and property detail pages
* Good, because the diagram stays in sync with the ontology — regenerated on every build from SPARQL
* Good, because there are no build-time dependencies — Mermaid is loaded from CDN client-side
* Bad, because first page load includes Mermaid CDN fetch (~150KB gzipped) — mitigated by browser caching
* Bad, because very large bounded contexts (100+ classes) produce dense diagrams — mitigated by subject area grouping and ELK layout
* Neutral, because Mermaid CDN is a third-party dependency — widely used, well-maintained, version-pinned

## Pros and Cons of the Options

### Mermaid + ELK layout, client-side rendering via CDN

* Good, because interactive clickable nodes
* Good, because no build-time dependencies
* Good, because diagram stays in sync with SPARQL data
* Bad, because adds ~150KB Mermaid fetch on first load

### Build-time SVG rendering (mmdc)

* Bad, because requires installing `@mermaid-js/mermaid-cli` as a build dependency
* Bad, because adds complexity to the build pipeline for a feature used on 3-4 pages

### Pure HTML/CSS/SVG diagram

* Bad, because would require implementing a graph layout algorithm
* Good, because Mermaid+ELK solves layout out of the box (so this option provides no benefit)

### D3.js force-directed graph

* Bad, because over-engineered for a static concept model
* Bad, because force layout produces different results on each render — not deterministic

### Pre-rendered static images

* Bad, because can't be clickable
* Bad, because go stale immediately
* Bad, because not generated from live data

## Implementation

| Change | File | Notes |
|--------|------|-------|
| New component | `src/website/src/components/ConceptModelDiagram.astro` | Mermaid code generation + CDN loading + property links |
| Add diagram section | `src/website/src/pages/boundaries/[context].astro` | Simplified component placement — passes only `context` prop, no SPARQL queries |
| ADR | `docs/adr/ADR-ADR-ADR-0083-concept-model-diagrams.md` | This document |

## Amendments

*None yet.*
