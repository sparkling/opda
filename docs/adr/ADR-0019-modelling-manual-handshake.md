---
status: proposed
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

*TBD by implementing session per programme plan §7.* Expected outcome: **option C (per-page decision)** because the modelling section's content is heterogeneous — some pages are pure editorial (standards-stack, bounded-contexts narrative), some are summaries of TTL content (data-dictionary, business-glossary, ontology, shacl-shapes) that the manual now covers comprehensively.

The implementing session decides per page:
- **Replace** (modelling page becomes a redirect to its manual counterpart) — for pure summaries of TTL content
- **Cross-link** (both pages exist; bidirectional "see also" + clear delineation of what each covers) — for pages with editorial framing the manual lacks
- **Keep standalone** (no manual analogue) — for pages with no TTL counterpart

### Consequences

*TBD by implementing session.*

### Confirmation

*TBD by implementing session.* Programme-wide gates apply.

Specific to this ADR:

1. Per-page decision table committed at `docs/plan/manual-astro-integration.md` appendix
2. Cross-tier link sweep: every modelling page that survives has a "see also: manual" call-out; every manual tier landing has a "see also: modelling-section editorial" call-out where relevant
3. Redirects in place for replaced modelling pages (Astro `redirect` config or `<meta http-equiv="refresh">` per existing site convention)
4. Link-check (existing CI or one-shot via `lychee` / `linkinator`) passes — no broken `/modelling/*` URLs
5. Validation report at `docs/adr/validation/ADR-0019-validation-report.md`

## More Information

* **Programme plan:** [`docs/plan/manual-astro-integration.md`](../plan/manual-astro-integration.md)
* **Architectural decision (anchor):** [ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md)
* **Existing modelling section source:** `src/pages/modelling/*.astro` + `src/lib/site.ts:137-...`
* **Site-architecture predecessor:** [ADR-0003 — Idiomatic Astro refactor](./ADR-0003-idiomatic-astro-refactor.md)
* **Cross-link convention precedent:** PageMeta + Breadcrumbs components already support cross-references; the handshake leverages those, not new primitives
