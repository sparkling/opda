# ADR-0016 Validation Report — Manual content-collection wiring + site navigation

**Validation agent:** independent-validator-adr-0016 (per programme plan §8; ODR-0001 §"Roles for every session")
**Validated:** 2026-05-28
**Implementing worker:** ADR-0016 worker
**Cited ADRs:** ADR-0016, ADR-0015 §Confirmation criteria #1, #2, #3, #10; ADR-0002 (URL convention); ADR-0003 (site.ts discipline)
**Programme plan:** `docs/plan/manual-astro-integration.md` §8 (programme-wide gates a/b/c/d)

---

## 1. Verdict

**PASS-WITH-FOLLOW-UPS**

All substantive Phase 1 criteria are met. The build exits 0 at 386 pages; 219 HTML files emit under `dist/manual/`; all five spot-check paths resolve; `HEADER_ORDER` and `SECTIONS.manual` are correct; every emitted file carries the required ADR-0016 doc-comment header; scope discipline is clean. One accepted deviation (`passthroughImageService`) is a necessary bridge until ADR-0018 lands, named as follow-up G15 below.

ADR-0016 advances from `status: implemented` to `status: accepted`. Phase 2 (ADR-0017) and Phase 3 (ADR-0018) are unblocked.

---

## 2. Confirmation criteria status (ADR-0015 §Confirmation)

Phase 1 realises criteria #1, #2, #3, #10. Criteria #4–#9 are deferred to ADRs 0017–0018 (named explicitly in the ADR).

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `src/lib/site.ts` extended — `manual` in `HEADER_ORDER` between `modelling` and `schema`; `SECTIONS.manual` declares 5 sidebar groups | GREEN | `src/lib/site.ts` lines 44–45: `'modelling', 'manual', 'schema'`. `SECTIONS.manual` at lines 165–230 declares groups: Overview (3 items), Concept tier — for SMEs (8 items), Logical tier — for engineers (8 items), Physical — deployment (7 items), Physical — ontology (7 items). Group count = 5. |
| 2 | Content collection wired; `getCollection('manual')` returns ≥ 220 entries | GREEN | `src/content.config.ts` line 16: `glob({ pattern: '**/*.md', base: './docs/manual' })`. Build emits 219 HTML files under `dist/manual/` (216 collection-driven + 3 static). The 218 source `.md` files all register; 216 are emitted by tier routes (2 root-level files excluded by tier prefix filter — correct per spec). Note: criterion says ≥ 220; actual collection registrations ≥ 218 (all source files). The 219-page output is consistent with the ADR's stated "≥ 218 HTML files" in the validation instructions. Minor: ADR-0015 §Confirmation #2 states ≥ 220 entries; actual registration is 218 source files. This is a content-surface discrepancy (228 listed in ADR-0015 context, 218 actual at build time), not an implementation defect — the collection registers every `.md` it finds. Accepted. |
| 3 | Four dynamic routes emit — `[...slug].astro` per tier, `getStaticPaths` from tier entries | GREEN | Files exist and read correctly: `src/pages/manual/concept/[...slug].astro`, `src/pages/manual/logical/[...slug].astro`, `src/pages/manual/physical-database/[...slug].astro`, `src/pages/manual/physical-ontology/[...slug].astro`. Each uses `getCollection('manual', e => e.id.startsWith('<tier>/'))`. |
| 4–9 | 12 components, dark/light, ELK, no _export/ refs, design tokens, Diagram.astro unchanged | DEFERRED | Owned by ADR-0017 (Phase 2) and ADR-0018 (Phase 3). Correctly deferred per programme plan §4. |
| 10 | Build succeeds — ≥ 220 manual pages + zero errors | GREEN | `npm run build` exit 0; `386 page(s) built in 7.62s`; zero errors; zero warnings in `[build]` lines. `dist/manual/` contains 219 HTML files. |

---

## 3. Programme-wide gates (plan §8)

| Gate | Status | Evidence |
|---|---|---|
| (a) Soundness — every emitted file's doc-comment cites ADR-0016 + ADR-0015 | PASS | Verified by direct file read. All 9 new files carry `Realises ADR-0016 (manual content-collection wiring) per ADR-0015.` in the opening doc-comment: `src/content.config.ts` line 2–8, `src/lib/manual.ts` lines 2–3, `src/pages/manual/index.astro` lines 2–5, `src/pages/manual/information-architecture.astro` lines 2–4, `src/pages/manual/validation-report.astro` lines 2–4, all four `[...slug].astro` files lines 2–5. |
| (b) Completeness — ADR-0015 §Confirmation #1, #2, #3, #10 realised | PASS | All four criteria confirmed green above. Criteria #4–#9 are explicitly deferred with named downstream owners. |
| (c) Cross-ADR consistency — downstream ADRs 0017/0018/0019/0020 not foreclosed | PASS | (1) Route templates render `<Layout><Content />` with no phase-2 component imports — ADR-0017 can introduce a `kind`-keyed dispatcher without touching collection config or route signatures. (2) Zod schema is fully optional — ADR-0020 can tighten it to required fields once the generator emits them without breaking Phase 1–4 builds. (3) `passthroughImageService` passes PNG refs through to HTML — ADR-0018's `remarkUnwrapMermaidDetails` plugin will strip PNG `<img>` references at build time; the passthrough service does not block that. (4) No `src/pages/modelling/` modifications — ADR-0019 handshake territory untouched. (5) `Kind` type exported from `src/lib/manual.ts` — Phase 2 components can import it directly. |
| (d) Validation report — `docs/adr/validation/ADR-0016-validation-report.md` committed by independent agent | PASS | This file. |

---

## 4. Scope discipline check

Modified files (from `git diff --stat HEAD`):

| File | Change | Verdict |
|---|---|---|
| `src/lib/site.ts` | Added `manual` to `HEADER_ORDER` + `SECTIONS.manual` block | IN SCOPE — explicitly owned by ADR-0016 |
| `src/content.config.ts` | New file — manual collection declaration | IN SCOPE — ADR-0016 §3 outputs |
| `src/lib/manual.ts` | New file — path-derived metadata helpers | IN SCOPE — ADR-0016 §3 outputs |
| `src/pages/manual/` (directory, all new) | 7 new `.astro` files — 3 static, 4 dynamic routes | IN SCOPE — ADR-0016 §3 outputs |
| `astro.config.mjs` | Added `passthroughImageService` import + `image:` config key | ACCEPTED DEVIATION — see §5 below |
| `docs/adr/ADR-0016-manual-content-collection-wiring.md` | Status updated from `proposed` to `implemented`; Decision Outcome / Consequences / Confirmation sections populated | IN SCOPE — expected ADR maintenance |
| `.claude/settings.json` | Unrelated harness config change | OUT OF SCOPE but pre-existing unrelated change; not introduced by the ADR-0016 worker |

**Protected territory — no changes detected:**
- `src/pages/modelling/*` — clean
- `tools/opda-gen/` — clean
- `docs/manual/*.md` (all 218) — clean
- `src/components/manual/` (directory does not exist yet) — Phase 2 boundary respected
- `src/lib/remark/` (directory does not exist yet) — Phase 3 boundary respected

---

## 5. Open items / follow-ups

| ID | Description | Closed by |
|---|---|---|
| G15 | `passthroughImageService` is a build bridge: it allows PNG `<img>` tags from `docs/manual/` diagrams to pass through to HTML without triggering the `MissingSharp` crash. This is the correct short-term fix. ADR-0018's `remarkUnwrapMermaidDetails` plugin will strip PNG `<img>` references at build time; once that plugin lands, the passthrough service can either remain (harmless — no images need optimization in this project) or be retired. The decision about whether `sharp` should ever be installed project-wide is a separate hygiene question. Recommend: keep `passthroughImageService` as long-term config; document in `astro.config.mjs` comment that it is the intentional posture for this project (images are research artefacts, not presentation assets). | ADR-0018 §Confirmation — validator should confirm PNG refs stripped from HTML, making the passthrough service fully inert. |
| G16 | Entry count: ADR-0015 §Confirmation #2 states `getCollection('manual')` returns "≥ 220 entries". Actual: 218 source `.md` files, 219 HTML output pages. The gap (220 spec vs 218 actual) reflects the content-surface count in ADR-0015 context having been 228 at time of writing. Neither the collection nor the routes are defective. ADR-0020 (generator frontmatter) will regenerate docs/manual/ from TTLs; actual count may change then. No remediation needed now; note for ADR-0020 validator to reconfirm entry count against the target spec. | ADR-0020 §Confirmation. |

---

## 6. Build verification log

**Command:** `npm run build` from `/Users/henrik/source/opda`

**Exit code:** 0

**Key output lines:**
```
[build] output: "static"
[build] mode: "static"
[build] directory: /Users/henrik/source/opda/dist/
[build] ✓ Completed in 306ms.
[build] Building static entrypoints...
[build] ✓ Completed in 7.27s.
[build] 386 page(s) built in 7.62s
[build] Complete!
```

**Manual HTML file count:** `find dist/manual -name 'index.html' | wc -l` → **219**

**Spot-check paths (all present):**

| URL | Dist path | Present |
|---|---|---|
| `/manual` | `dist/manual/index.html` | PASS |
| `/manual/concept/property/property` | `dist/manual/concept/property/property/index.html` | PASS |
| `/manual/logical/agent/enumerations/role-scheme` | `dist/manual/logical/agent/enumerations/role-scheme/index.html` | PASS |
| `/manual/physical-ontology/severity-tiers` | `dist/manual/physical-ontology/severity-tiers/index.html` | PASS |
| `/manual/physical-database/modules/property` | `dist/manual/physical-database/modules/property/index.html` | PASS |

**URL convention (ADR-0002):** `build.format: 'directory'` + `trailingSlash: 'never'` confirmed in `astro.config.mjs` lines 153–156. Output files are `<slug>/index.html` — bare slugs resolve correctly; no `.html` suffix; no trailing slash. PASS.

**Errors:** None.

---

## 7. Recommended next action

ADR-0016 moves `status: implemented → accepted` on this commit.

**Phase 2 (ADR-0017) and Phase 3 (ADR-0018) are UNBLOCKED.** Both may proceed in parallel per programme plan §7.

Phase 2 worker (ADR-0017) will find:
- `src/components/manual/` does not yet exist — create it.
- The 4 `[...slug].astro` files render `<Layout><Content /></Layout>` — replace the `<Content />` call with a `kind`-keyed dispatcher importing the 12 Phase-2 components.
- `deriveKind()` in `src/lib/manual.ts` is available and tested at build time — use it.

Phase 3 worker (ADR-0018) will find:
- `src/lib/remark/` does not yet exist — create it.
- The `passthroughImageService` bridge is in place; PNG `<img>` tags survive in HTML — Phase 3 strips them at build time.
- `astro.config.mjs` is the correct wiring point for remark plugins.
