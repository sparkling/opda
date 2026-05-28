---
status: accepted
date: 2026-05-28
tags: [website, navigation, content-strategy, deprecation]
supersedes: []
depends-on: [ADR-0003, ADR-0015, ADR-0016, ADR-0017]
implements: []
---

# Modelling-section / manual handshake

## Context and Problem Statement

[ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md) places the new `manual` section in `HEADER_ORDER` between `modelling` and `schema`. The existing `modelling` section (per `src/lib/site.ts:137-...`) carries pages that overlap conceptually with the new manual:

| Existing `/modelling/<page>` | Manual analogue (potential) |
|---|---|
| `/modelling/concept-taxonomy` | Concept tier overview + module READMEs |
| `/modelling/data-dictionary` | Logical tier attribute tables |
| `/modelling/business-glossary` | Concept tier per-entity definitions |
| `/modelling/bounded-contexts` | Module organisation (foundation + 6 modules) |
| `/modelling/jsonld-mappings` | Physical-Database tier content-negotiation |
| `/modelling/ontology` | Physical-Ontology tier overview |
| `/modelling/overlays` | Physical-Database overlay-deployment + BASPI5 profile |
| `/modelling/shacl-shapes` | Physical-Ontology severity tiers + per-module shapes |
| `/modelling/standards-stack` | (no manual analogue — keeps standalone) |

If the manual ships without a handshake decision, the site has duplicated content surfaces + a confused information architecture. This ADR decides what survives, what cross-links, and what deprecates.

Per the [implementation programme plan §4](../plan/manual-astro-integration.md), this is **Phase 4** — gated on Phase 1 (ADR-0016) + Phase 2 (ADR-0017) so the manual is visible before deciding how to relate the modelling pages to it.

Not a sub-claim of ADR-0015 §Confirmation — orthogonal but necessary for navigation coherence.

## Decision Drivers

* No broken links — existing `/modelling/*` URLs are public; deprecation must redirect or land on a useful replacement.
* The modelling pages are hand-authored Astro (per ADR-0003); the manual is collection-driven (per ADR-0015). The two are different authoring models — pick one or run both.
* The manual content is generator-emitted from TTLs; the modelling pages predate the ontology programme and were hand-curated. Some modelling-page content (standards-stack narrative, bounded-context rationale) is editorial framing that doesn't live in any TTL.
* SEO + external links — `/modelling/*` URLs may be cited externally; outright deletion creates 404s.
* Editorial voice — the manual is reference-style; the modelling pages are explanatory. The site may need both registers.

## Considered Options

* **A — Replace 9 modelling pages with the manual** — remove `/modelling/*`, add redirects, surface manual content at `/manual/*`. Simplest IA; risks losing editorial framing the modelling pages provide.
* **B — Cross-link only** — keep both; add prominent "see also: manual tier-X" callouts on each modelling page + "see also: modelling-section overview" on each manual tier landing. Preserves editorial voice + audience routing.
* **C — Mix: replace some, cross-link others** — e.g. replace `/modelling/data-dictionary` (now generator-emitted) but keep `/modelling/standards-stack` (editorial framing without a TTL counterpart). Per-page decision.
* **D — Deprecate modelling section entirely** — remove from `HEADER_ORDER`; redirect everything to manual. Loses standalone editorial pages.

## Decision Outcome

Chosen option: **C — Mix per-page decision**. All 9 pages were assessed; the outcome is **0 Replace / 8 Cross-link / 1 Keep standalone**.

| Page | Decision | Manual target |
|---|---|---|
| `/modelling/standards-stack` | Keep standalone | — |
| `/modelling/bounded-contexts` | Cross-link | `/manual/concept` |
| `/modelling/overlays` | Cross-link | `/manual/physical-database/overlay-deployment/baspi5` |
| `/modelling/data-dictionary` | Cross-link | `/manual/logical` |
| `/modelling/business-glossary` | Cross-link | `/manual/concept` |
| `/modelling/concept-taxonomy` | Cross-link | `/manual/physical-ontology/vocabularies` |
| `/modelling/ontology` | Cross-link | `/manual/physical-ontology` |
| `/modelling/shacl-shapes` | Cross-link | `/manual/physical-ontology/severity-tiers` + `/manual/physical-ontology/shacl-af-rules` |
| `/modelling/jsonld-mappings` | Cross-link | `/manual/physical-database/content-negotiation` |

No Replace decisions were made. The key finding: even the pages that look like TTL-content summaries (data-dictionary, business-glossary) serve a PDTF-schema audience with interactive data browsers (`OPDA.DataBrowser`) that have no equivalent in the manual. Cross-link routes each audience to the complementary register without destroying either.

Cross-links are bidirectional: each modelling page gains a `callout callout--note` "See also: Ontology manual" callout; each of the four relevant manual tier READMEs gains a "See also: Modelling section" prose block.

### Consequences

- Good, because both editorial registers (PDTF-schema narrative and ontology reference) survive and serve different audiences without confusion — the callouts make the distinction clear.
- Good, because no redirects were needed — no `astro.config.mjs` changes; no new mechanism introduced.
- Good, because the interactive data browsers on `/modelling/data-dictionary` and `/modelling/business-glossary` are preserved; they have no manual equivalent.
- Good, because `src/lib/site.ts` is unchanged — all modelling URLs remain in the sidebar navigation tree.
- Neutral, because the modelling "stub" pages (ontology, shacl-shapes, jsonld-mappings, concept-taxonomy) remain stubs with cross-links pointing to the manual's realised content — this is appropriate: the stubs describe design intent; the manual documents the outcome.

### Confirmation

Specific to this ADR:

1. Per-page decision table committed at `docs/plan/manual-astro-integration.md` appendix — done
2. Cross-tier link sweep: every modelling page that survives has a "see also: manual" callout (8/8); every relevant manual tier landing has a "see also: modelling-section editorial" block (4/4) — done
3. Redirects in place for replaced modelling pages — N/A (no Replace decisions)
4. `npm run build` passes — exit 0, 386 pages, no broken `/modelling/*` URLs — done
5. Implementation report at `docs/adr/implementation-reports/ADR-0019-implementation.md` — done
6. Validation report at `docs/adr/validation/ADR-0019-validation-report.md` — pending (Queen gates validation)

## More Information

* **Programme plan:** [`docs/plan/manual-astro-integration.md`](../plan/manual-astro-integration.md)
* **Architectural decision (anchor):** [ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md)
* **Existing modelling section source:** `src/pages/modelling/*.astro` + `src/lib/site.ts:137-...`
* **Site-architecture predecessor:** [ADR-0003 — Idiomatic Astro refactor](./ADR-0003-idiomatic-astro-refactor.md)
* **Cross-link convention precedent:** PageMeta + Breadcrumbs components already support cross-references; the handshake leverages those, not new primitives
