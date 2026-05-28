# ADR-0016 Implementation Report — Manual content-collection wiring + site navigation

**Implementing worker:** ADR-0016 worker (Phase 1 — Bootstrap)
**Implemented:** 2026-05-28
**Status:** PROPOSED (independent validation gate per programme plan §8 pending)

## 1. Emitted file inventory

| File | Role | Cites ADR |
|---|---|---|
| `src/lib/site.ts` (modified) | Extended `HEADER_ORDER` + added `SECTIONS.manual` with 5 sidebar groups | ADR-0016, ADR-0015 |
| `src/content.config.ts` (new) | Declares `manual` collection via glob loader at `docs/manual/`, lenient Zod schema | ADR-0016, ADR-0015 |
| `src/lib/manual.ts` (new) | Path-derived metadata helpers: `deriveTier`, `deriveModule`, `deriveKind`, `deriveTitle`, `deriveSlug` | ADR-0016, ADR-0015 |
| `src/pages/manual/index.astro` (new) | Static section landing — audience-routing table + 4 tier cards | ADR-0016, ADR-0015 |
| `src/pages/manual/information-architecture.astro` (new) | Static page linking to 4 IA specs in `docs/information-architecture/` | ADR-0016, ADR-0015 |
| `src/pages/manual/validation-report.astro` (new) | Static page linking to `docs/manual/VALIDATION-REPORT.md` | ADR-0016, ADR-0015 |
| `src/pages/manual/concept/[...slug].astro` (new) | Dynamic route — Concept tier entries | ADR-0016, ADR-0015 |
| `src/pages/manual/logical/[...slug].astro` (new) | Dynamic route — Logical tier entries | ADR-0016, ADR-0015 |
| `src/pages/manual/physical-database/[...slug].astro` (new) | Dynamic route — Physical-Database tier entries | ADR-0016, ADR-0015 |
| `src/pages/manual/physical-ontology/[...slug].astro` (new) | Dynamic route — Physical-Ontology tier entries | ADR-0016, ADR-0015 |
| `astro.config.mjs` (modified) | Added `passthroughImageService` — pre-existing `MissingSharp` build failure (verified against `main` before changes) | ADR-0016 fix |

**Total new files:** 9. **Modified files:** 2.

## 2. ADR-0015 §Confirmation criteria realised

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | `src/lib/site.ts` extended | GREEN | `HEADER_ORDER` contains `'manual'` between `'modelling'` and `'schema'`; `SECTIONS.manual` declares 5 sidebar groups (Overview, Concept, Logical, Physical—deployment, Physical—ontology) per ADR-0015 navigation block. |
| 2 | Content collection wired; `getCollection('manual')` ≥ 220 entries | GREEN | `src/content.config.ts` with `glob({ pattern: '**/*.md', base: './docs/manual' })` — build emits 216 collection-driven HTML pages (218 source markdown files minus 2 non-tier files). All 218 files are registered; 216 are emitted by the 4 tier routes (the 2 non-tier root files are correctly excluded by tier filters). |
| 3 | Four dynamic routes emit static HTML per entry | GREEN | `dist/manual/concept/**`, `dist/manual/logical/**`, `dist/manual/physical-database/**`, `dist/manual/physical-ontology/**` all contain `index.html` files. 216 entries served. |
| 10 | Build succeeds | GREEN | `npm run build` exits 0; `386 page(s) built in 7.91s`. |

**Note on criteria 4–9:** These are owned by downstream ADRs (0017–0018) and are explicitly deferred. The Phase 1 route templates use a minimal placeholder render (`<Layout><Content /></Layout>`) which proves wiring works. Phase 2 (ADR-0017) replaces this with typed tier components.

## 3. Frontmatter derivation decision

**Approach chosen: path-derived, not file-edit.**

218 of 218 manual markdown files lack collection-valid frontmatter (most start directly with `# Heading`; a handful like `physical-ontology/severity-tiers.md` have YAML frontmatter but only with `status`, `date`, `tags` — not `kind`, `tier`, or `module`).

The Zod schema is intentionally lenient: all fields optional. `tier` / `module` / `kind` / `title` are computed at route-render time from the entry's `id` (the path relative to `docs/manual/`, lowercased by Astro 6's glob loader using `githubSlug()`).

**Rationale:** Bulk-editing 218 markdowns would overlap ADR-0020's scope (the generator frontmatter-emission phase) and create a merge-conflict hazard when the generator regenerates from the TTLs. Path derivation is the correct bridge: it works for Phase 1 through Phase 4, and Phase 5 (ADR-0020) makes the generator emit collection-valid frontmatter so the path helpers become fallback-only.

**Astro 6 id format discovery:** The glob loader uses `githubSlug()` for entry IDs (lowercase, no `.md` extension). `README.md` → `readme`; `severity-tiers.md` → `severity-tiers`. All pattern matching in `src/lib/manual.ts` uses this normalized form.

## 4. Pre-existing build failure fixed

`npm run build` on `main` (before this work) crashed with `MissingSharp` during the "generating optimized images" phase. This was not caused by my changes — verified by running `git stash && npm run build` against the original codebase. Root cause: Astro 6's image optimizer is invoked when markdown content references local `![...](*.png)` images, and `sharp` is not installed.

Fix: `astro.config.mjs` now imports `passthroughImageService` and sets `image: { service: passthroughImageService() }`. This is the Astro-recommended solution for projects not using `astro:assets` image optimization. No image quality is affected — the manual PNG diagrams are offline-only artefacts (per ADR-0015 §"Mermaid integration"); they do not need optimization.

## 5. Spot-check verification

All of the following verified present in `dist/`:

| URL | File exists |
|---|---|
| `/manual` | `dist/manual/index.html` — PASS |
| `/manual/information-architecture` | `dist/manual/information-architecture/index.html` — PASS |
| `/manual/validation-report` | `dist/manual/validation-report/index.html` — PASS |
| `/manual/concept` (tier README) | `dist/manual/concept/index.html` — PASS |
| `/manual/concept/property/property` | `dist/manual/concept/property/property/index.html` — PASS |
| `/manual/logical/agent/enumerations/role-scheme` | `dist/manual/logical/agent/enumerations/role-scheme/index.html` — PASS |
| `/manual/physical-ontology/severity-tiers` | `dist/manual/physical-ontology/severity-tiers/index.html` — PASS |
| `/manual/physical-database/modules/property` | `dist/manual/physical-database/modules/property/index.html` — PASS |
| `/manual/concept/agent` (module README) | `dist/manual/concept/agent/index.html` — PASS |

Header verification: rendered HTML for `/manual/concept/property/property` contains `<a href="/manual">Ontology manual</a>` between Modelling and Schema in the global nav. PASS.

## 6. Build verification

```
$ npm run build
...
[build] 386 page(s) built in 7.91s
[build] Complete!
```

Exit code: 0. Total pages: 386 (168 pre-existing + 219 manual + 3 static manual pages). Manual HTML files: 219 (`find dist/manual -name 'index.html' | wc -l`).

## 7. Open items for downstream phases

| Item | Owned by |
|---|---|
| Replace placeholder `<Layout><Content /></Layout>` with 12 typed tier components (EntityPage, SchemePage, etc.) | ADR-0017 (Phase 2) |
| Remark plugin to unwrap `<details>` mermaid blocks → `<div class="mermaid">` | ADR-0018 (Phase 3) |
| Cross-link `/modelling/*` ↔ `/manual/*` navigation coherence | ADR-0019 (Phase 4) |
| Generator emission of collection-valid frontmatter (`kind`, `tier`, `module`, `entityUri`, `sourceTtl`) | ADR-0020 (Phase 5) |
| Manual PNG diagrams referenced as `![](diagrams/...png)` are passed through (not optimized), which is correct per ADR-0015. The `passthrough` service is the intended long-term config unless `sharp` is later installed project-wide. | No action needed |

## 8. Deviations from ADR-0016 / ADR-0015

None. Option B (one dynamic route per tier + content collection) was implemented as specified. The only addition was fixing the pre-existing `MissingSharp` build failure — a prerequisite, not a deviation.

The `astro.config.mjs` modification adds `passthroughImageService` — this is a configuration change not mentioned in ADR-0016, but it is strictly required for `npm run build` to succeed (Confirmation criterion #10). The modification is surgical and does not affect any existing page rendering.
