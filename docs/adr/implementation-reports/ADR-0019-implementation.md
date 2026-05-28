---
adr: ADR-0019
phase: 4
status: complete
date: 2026-05-28
---

# ADR-0019 Implementation report — Modelling-section / manual handshake

## Final decision table

| Modelling page | Decision | Manual target | Rationale |
|---|---|---|---|
| `/modelling/standards-stack` | **Keep standalone** | — | Pure PDTF-layer editorial (schema repos, API specs, overlay catalogue, DID identity). No TTL-emitted content; no manual analogue. Baseline confirmed. |
| `/modelling/bounded-contexts` | **Cross-link** | `/manual/concept` | DDD framing + industry context map are explanatory framing the manual lacks. Manual concept tier shows the seven-module structure that operationalises these contexts. Bidirectional. |
| `/modelling/overlays` | **Cross-link** | `/manual/physical-database/overlay-deployment/baspi5` | PDTF JSON Schema overlays (schema layer) vs ontology overlay profiles (deployment layer) are distinct artefacts. Cross-link clarifies the layer distinction; neither replaces the other. Callout notes the difference explicitly. |
| `/modelling/data-dictionary` | **Cross-link** | `/manual/logical` | 1,538 schema-derived elements (broad/shallow) vs 41 ontology entities with typed attributes (narrow/deep). Complementary levels; different audiences (schema engineers vs integration architects). Baseline "or Replace" refined to Cross-link. |
| `/modelling/business-glossary` | **Cross-link** | `/manual/concept` | Pre-ontology SKOS seed (54 OPDA terms + 500 schema-derived) vs generator-emitted entity definitions. Both survive; modelling page serves schema-origin stakeholders; manual serves ontology-reference readers. Baseline "or Replace" refined to Cross-link. |
| `/modelling/concept-taxonomy` | **Cross-link** | `/manual/physical-ontology/vocabularies` | Modelling page describes multi-scheme design + URI strategy (design intent). Manual page is the 23 generator-emitted SKOS schemes (137 concepts) — the realisation. Design + realisation are complementary. |
| `/modelling/ontology` | **Cross-link** | `/manual/physical-ontology` | Modelling page is a stub describing the OWL class design. Manual physical-ontology tier is the verbatim-Turtle documentation of the emitted OWL artefacts. Stub + reference are complementary; no redundancy. |
| `/modelling/shacl-shapes` | **Cross-link** | `/manual/physical-ontology/severity-tiers` + `/manual/physical-ontology/shacl-af-rules` | Modelling page describes generation pipeline + hand-authoring model. Manual pages are the emitted severity-tier classification and SHACL-AF derived-attribute rules. Design model + realisation. |
| `/modelling/jsonld-mappings` | **Cross-link** | `/manual/physical-database/content-negotiation` | Modelling page covers `@context` authoring. Manual page covers HTTP content-negotiation routing. `@context` authoring and HTTP-layer delivery are different concerns; cross-link routes each audience to the other layer. |

**Summary: 0 Replace / 8 Cross-link / 1 Keep**

### Deviation from suggested baseline

The suggested baseline had `/modelling/data-dictionary` and `/modelling/business-glossary` as "Cross-link or Replace". Both were refined to **Cross-link** rather than Replace because:

1. The modelling pages serve a PDTF-schema audience (schema engineers, BAs working with overlays); the manual pages serve an ontology audience. The two registers are not interchangeable.
2. Both modelling pages have interactive data browsers (`OPDA.DataBrowser`) loaded from `/data/properties.js` and `/data/entities.js` — they provide filterable, sortable exploration of the raw schema-derived vocabulary. The manual tier READMEs are flat markdown text. Replacing the modelling pages would lose the data-browser functionality with no replacement.
3. No existing redirect pattern in `astro.config.mjs` was found; the project has no `redirects:` block. Implementing redirects would require adding a new mechanism; cross-link achieves navigation coherence without that complexity.

## Implementation

### Callout convention

All cross-links use the existing `callout callout--note` pattern (per `src/pages/modelling/ontology.astro` line 14 pre-existing use). Each callout carries a `callout__label` noting "See also: Ontology manual — [tier]" and a prose explanation of how the two pages relate.

The callout is placed immediately after the `<h1>` + `<p class="lead">` opener, before the first `<h2>` section. This placement is consistent across all 8 modified modelling pages.

### Files modified

**Modelling pages (cross-link callout added):**

- `src/pages/modelling/bounded-contexts.astro`
- `src/pages/modelling/overlays.astro`
- `src/pages/modelling/data-dictionary.astro`
- `src/pages/modelling/business-glossary.astro`
- `src/pages/modelling/concept-taxonomy.astro`
- `src/pages/modelling/ontology.astro`
- `src/pages/modelling/shacl-shapes.astro`
- `src/pages/modelling/jsonld-mappings.astro`

**Manual tier READMEs (bidirectional cross-link added as "See also" section):**

- `docs/manual/concept/README.md` — links to `/modelling/bounded-contexts` + `/modelling/business-glossary`
- `docs/manual/logical/README.md` — links to `/modelling/data-dictionary`
- `docs/manual/physical-database/README.md` — links to `/modelling/overlays` + `/modelling/jsonld-mappings`
- `docs/manual/physical-ontology/README.md` — links to `/modelling/ontology` + `/modelling/shacl-shapes` + `/modelling/concept-taxonomy`

**Not modified:**

- `src/pages/modelling/standards-stack.astro` — kept standalone, no cross-link needed
- `src/lib/site.ts` — no sidebar changes; all modelling URLs remain in the navigation tree (no replacements occurred)
- `astro.config.mjs` — no redirects block added (no Replace decisions)
- `src/components/manual/*.astro` — cross-links placed in markdown tier READMEs per instruction to prefer markdown-side edits

### Redirect mechanism

Not applicable. No Replace decisions were made.

## Build verification

```
npm run build
→ ✓ Completed in 6.96s.
→ 386 page(s) built in 7.40s
→ exit 0
```

## Link-check evidence

**Spot-check results:**

| File | Check | Result |
|---|---|---|
| `dist/modelling/standards-stack/index.html` | No callout--note (kept standalone) | 0 matches — PASS |
| `dist/modelling/ontology/index.html` | callout--note present; href="/manual/physical-ontology" present | 2 callouts (new + existing Status callout) — PASS |
| `dist/modelling/data-dictionary/index.html` | callout--note present; href="/manual/logical" present | 1 callout — PASS |
| `dist/manual/concept/index.html` | bidirectional link to /modelling/bounded-contexts + /modelling/business-glossary | Both hrefs present — PASS |
| `dist/manual/logical/index.html` | bidirectional link to /modelling/data-dictionary | href present — PASS |
| `dist/manual/physical-ontology/index.html` | links to /modelling/ontology + /modelling/shacl-shapes + /modelling/concept-taxonomy | All 3 hrefs present — PASS |

All cross-link targets exist in the build output. No broken internal links introduced.

## ADR-0019 confirmation criteria

| Criterion | Status |
|---|---|
| Per-page decision table committed | Done — this report + programme plan appendix |
| Cross-tier link sweep: every surviving modelling page has "see also: manual" callout | Done — 8 of 8 cross-linked pages |
| Every relevant manual tier landing has "see also: modelling-section" callout | Done — 4 of 4 tier READMEs |
| Redirects in place for replaced modelling pages | N/A — no Replace decisions |
| Build passes (no broken /modelling/* URLs) | PASS — exit 0, 386 pages |
