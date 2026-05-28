---
status: accepted
date: 2026-05-28
tags: [website, content-collections, astro, navigation]
supersedes: []
depends-on: [ADR-0002, ADR-0003, ADR-0015]
implements: [ADR-0015]
---

# Manual content-collection wiring + site navigation

## Context and Problem Statement

[ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md) decides the integration approach (Astro content collections sourced from `docs/manual/`, dynamic-route templates per tier, extended `src/lib/site.ts`). This ADR realises the **bootstrap** — the content collection registers, the navigation surfaces, and the 4 per-tier dynamic routes emit static HTML at build time.

Per the [implementation programme plan §4](../plan/manual-astro-integration.md), this is **Phase 1** — sequential, single worker, must PASS before Phase 2 + Phase 3 can run in parallel.

Realises ADR-0015 `§Confirmation` criteria 1 (`site.ts` extended), 2 (collection wired), 3 (four dynamic routes emit), 10 (build succeeds).

## Decision Drivers

* `src/lib/site.ts` is the single navigation source per [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md). The `manual` section extension must follow the existing `SECTIONS` shape verbatim (key / title / summary / groups[] / items[]).
* Astro content collection config lives at `src/content.config.ts` (Astro 5) or `src/content/config.ts` (Astro 4). The implementing worker pins the project's Astro version + uses the version's spec.
* Each tier gets ONE dynamic route `[...slug].astro` — not per-module subdirectories with their own routes. Tier discrimination via the collection entry's `tier` field; slug catches `<module>/<entity>` or `<module>/enumerations/<scheme>` or any depth.
* Per [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) URL convention: bare slugs, no `.html`, no trailing slash.
* Static pages for section landing + IA-spec landing + validation report — NOT collection-driven (per ADR-0015 "static authoring" inventory).

## Considered Options

* **A — Per-tier static `.astro` route files for every entry** (what the modelling section currently does). Loses regenerability per ADR-0015.
* **B — One dynamic route per tier + content collection** — chosen per ADR-0015 option B.
* **C — One single dynamic route `/manual/[...slug]` + collection-discriminated rendering** — bundles all tiers into one route handler. Pro: less code duplication. Con: per-tier visual variants would have to be wired via if-else in one file; less navigable in source.

## Decision Outcome

**Option B** implemented as specified by ADR-0015. One dynamic `[...slug].astro` route per tier; content collection sourced from `docs/manual/` via Astro 6's `glob` loader; `src/lib/site.ts` extended with `SECTIONS.manual`; three static pages for section landing, IA-spec index, and validation report.

The implementing session also fixed a pre-existing `MissingSharp` build failure (verified against `main` before changes) by adding `passthroughImageService` to `astro.config.mjs` — a prerequisite for Confirmation criterion #10 to be reachable.

### Consequences

* Good — regenerability preserved: 216 collection-driven HTML pages emit from 218 markdown files; next `opda-gen` re-run + `npm run build` picks up changes automatically.
* Good — navigation extended per the existing `site.ts` discipline; no parallel navigation system; sidebar shows the manual section with 5 groups.
* Good — build succeeds: 386 pages in ~8 s; passthrough image service eliminates the pre-existing `MissingSharp` crash without affecting image quality (the diagrams PNGs are offline-only per ADR-0015).
* Neutral — path-derived metadata (tier/kind/title derived from `entry.id`) works for Phases 1–4; ADR-0020 (Phase 5) will extend the generator to emit collection-valid frontmatter making these helpers fallback-only.
* Neutral — Astro 6 glob loader uses `githubSlug()` for IDs (lowercase, no `.md` extension); all helpers in `src/lib/manual.ts` account for this format.

### Confirmation

Programme-wide gates (per [`docs/plan/manual-astro-integration.md` §8](../plan/manual-astro-integration.md)) apply:

- (a) Soundness — every emitted file's doc-comment cites this ADR + ADR-0015 — **PASS**: all 9 new files carry the `Realises ADR-0016 (manual content-collection wiring) per ADR-0015.` doc-comment header.
- (b) Completeness — ADR-0015 §Confirmation 1, 2, 3, 10 realised — **PASS**: see implementation report §2.
- (c) Cross-ADR consistency — downstream ADRs 0017/0018/0019/0020 can build on this output — **PASS**: `src/lib/manual.ts` exports `Kind` type that Phase 2 components consume; dynamic routes render via `<Layout><Content /></Layout>` placeholder that Phase 2 replaces; no `src/pages/modelling/` modifications (ADR-0019 scope); no `tools/opda-gen/` modifications (ADR-0020 scope).
- (d) Validation report — **PENDING**: awaits independent validator at `docs/adr/validation/ADR-0016-validation-report.md`.

Implementation report: [`docs/adr/implementation-reports/ADR-0016-implementation.md`](../implementation-reports/ADR-0016-implementation.md)

## More Information

* **Programme plan:** [`docs/plan/manual-astro-integration.md`](../plan/manual-astro-integration.md) — sequencing, validation discipline, retirement criterion
* **Architectural decision (anchor):** [ADR-0015 §"JSON-driven content collections"](./ADR-0015-integrate-manual-into-astro-site.md)
* **Existing nav source:** [`src/lib/site.ts`](../../src/lib/site.ts) — the file this ADR extends
* **Content surface:** [`docs/manual/README.md`](../manual/README.md) — 228 markdowns ready for collection registration
* **Downstream ADRs:** [ADR-0017](./ADR-0017-manual-component-library.md), [ADR-0018](./ADR-0018-manual-remark-rehype-plugins.md), [ADR-0019](./ADR-0019-modelling-manual-handshake.md), [ADR-0020](./ADR-0020-manual-generator-frontmatter.md)
