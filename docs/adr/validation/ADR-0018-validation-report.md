# ADR-0018 Validation Report — Manual remark + rehype plugins

**Validation agent:** independent-validator-adr-0018 (per programme plan §8; ODR-0001 §"Roles for every session")
**Validated:** 2026-05-28
**Implementing worker:** ADR-0018 worker (Phase 3 — Plumbing)
**Cited ADRs:** ADR-0018, ADR-0015 §Confirmation criteria #5, #7, #8; programme plan §8 gates (a/b/c/d)
**Programme plan:** `docs/plan/manual-astro-integration.md` §8

---

## 1. Verdict

**PASS-WITH-FOLLOW-UPS**

All material Phase 3 criteria are met. Both plugins exist, are correctly wired, and produce the required build output. 20 tests pass with 0 failures. Build exits 0 at 386 pages with a clean cache. Zero `<details><summary>Mermaid Source</summary>` blocks survive in dist; zero PNG diagram `<img>` refs survive; 292 files carry `<div class="mermaid">` blocks; zero `_export/` references in src/ or dist/. The ELK layout directive is preserved verbatim. Two accepted follow-ups are carried to downstream ADRs. One developer-experience caveat (cache-clear on plugin install) is documented in both the impl report and the ADR Consequences section.

ADR-0018 advances from `status: implemented` to `status: accepted`. Phase 4 (ADR-0019) is unblocked (dependent on ADR-0016 + ADR-0017 PASSes; ADR-0017 validation pending separately). Phase 5 (ADR-0020) gates on both ADR-0017 and ADR-0018 PASSes — this PASS satisfies the ADR-0018 half of that gate.

---

## 2. Confirmation criteria status (ADR-0015 §Confirmation)

Phase 3 realises criteria #5, #7, #8. Criteria #1–#4, #6, #9 are owned by Phase 1 (ADR-0016) and Phase 2 (ADR-0017).

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 5 | `Diagram.astro` unchanged — site reuses existing loader; no parallel setup | GREEN | `git diff HEAD -- src/components/Diagram.astro` → 0 lines. `git diff HEAD -- public/ui/client.js` → no Phase 3 modifications. The mermaid client-side loader (lines 228–269 of client.js) is reused without modification, as required. |
| 7 | ELK-laid-out diagrams render correctly via unwrapped `<div class="mermaid">` | GREEN | Spot-check `dist/manual/logical/agent/enumerations/role-scheme/index.html`: contains exactly 1 `<div class="mermaid">` block; 0 `<details>` blocks; 0 `diagrams/*.png` refs. ELK directive (`layout: elk`) preserved verbatim inside the div alongside the full `%%{init:...}%%` directive. `client.js` ELK loader handles it client-side. |
| 8 | No `docs/manual/_export/` references from `src/` or `dist/` | GREEN | `grep -r "docs/manual/_export" src/ dist/ \| wc -l` → 0. |

ADR-0018 plugin-specific confirmation criteria:

| Criterion | Status | Evidence |
|---|---|---|
| `<details><summary>Mermaid Source</summary>` blocks in dist | GREEN | `grep -rl '<details><summary>Mermaid Source</summary>' dist/ \| wc -l` → **0** |
| `<img src="...diagrams/...png">` in dist | GREEN | `grep -rEl 'img.*src="[^"]*diagrams/[^"]*\.png"' dist/ \| wc -l` → **0** |
| `<div class="mermaid">` in dist | GREEN | `grep -rl '<div class="mermaid">' dist/ \| wc -l` → **292** (worker claimed 292 — confirmed) |
| Both plugins wired in `astro.config.mjs` | GREEN | `markdown.remarkPlugins: [remarkUnwrapMermaidDetails]` and `markdown.rehypePlugins: [rehypeFrontmatterUriExtraction]` at lines 154–157. ADR-0016's `image: { service: passthroughImageService() }` still in place at line 151. |
| Tests: 20 pass, 0 failures | GREEN | `npm test` → `# tests 20 # pass 20 # fail 0` (exit 0). |
| `entityUri` limitation for multi-class `classes.md` documented | GREEN | ADR-0018 §Consequences (neutral bullet) and impl report §3 + §8 both document the first-only-heading limitation. Handed to ADR-0020. |
| Cache-clear caveat documented | GREEN | Impl report §2 + §5 document the stale-cache scenario. ADR-0018 §Consequences (neutral bullet) documents it. |

---

## 3. Programme-wide gates (plan §8)

| Gate | Status | Evidence |
|---|---|---|
| (a) Soundness — every emitted code file traces to ADR-0018 + ADR-0015 via doc-comment | PASS | `unwrap-mermaid-details.ts` header: `Realises ADR-0018 per ADR-0015. Build-time unwrapping…`. `frontmatter-uri-extraction.ts` header: `Realises ADR-0018 per ADR-0015. Build-time extraction…`. `astro.config.mjs` comment: `ADR-0018: build-time remark + rehype plugins…`. All four files cite both ADRs. |
| (b) Completeness — ADR-0015 §Confirmation #5, #7, #8 all realised | PASS | All three criteria confirmed green in §2 above. Remaining criteria (#1–#4, #6, #9, #10) remain owned by ADR-0016/0017 as per programme plan §4 table. |
| (c) Cross-ADR consistency — downstream ADRs not foreclosed | PASS | (1) `entityUri` written to `file.data.astro.frontmatter.entityUri` — the Phase 2 ADR-0017 `CrossTierLinks.astro` component can read it via `entry.data.entityUri` or `remarkPluginFrontmatter` without touching the plugin. (2) ADR-0020 can emit per-entry `entityUri` in the markdown YAML frontmatter — the plugin's idempotent check (`if (data.astro.frontmatter.entityUri) return`) means ADR-0020 frontmatter will take precedence without code change. (3) `passthroughImageService` remains in place — now inert (zero PNG refs survive), correct long-term posture per ADR-0016 follow-up G15. |
| (d) Validation report — `docs/adr/validation/ADR-0018-validation-report.md` committed by independent agent | PASS | This file. |

---

## 4. Scope discipline check

The working tree contains changes from both Phase 2 (ADR-0017) and Phase 3 (ADR-0018), which ran in parallel. Phase 3 changes are bounded to:

| File | Change | Verdict |
|---|---|---|
| `src/lib/remark/unwrap-mermaid-details.ts` | New file — remark plugin | IN SCOPE — ADR-0018 §Decision Outcome |
| `src/lib/remark/frontmatter-uri-extraction.ts` | New file — rehype plugin | IN SCOPE — ADR-0018 §Decision Outcome |
| `astro.config.mjs` | Added `markdown:` plugin wiring block + ADR-0018 comment | IN SCOPE — ADR-0018 §Decision Outcome |
| `package.json` | Added `"test"` script | IN SCOPE — ADR-0018 §Decision Drivers (test runner) |
| `tests/lib/remark/unwrap-mermaid-details.test.mjs` | New file — 8 tests | IN SCOPE |
| `tests/lib/remark/frontmatter-uri-extraction.test.mjs` | New file — 12 tests | IN SCOPE |
| `docs/adr/ADR-0018-manual-remark-rehype-plugins.md` | Status updated; Consequences + Confirmation sections populated | IN SCOPE — expected ADR maintenance |
| `docs/adr/implementation-reports/ADR-0018-implementation.md` | New file — implementation report | IN SCOPE |

**Changes attributable to Phase 2 (ADR-0017), not Phase 3:**

| File | Source |
|---|---|
| `src/lib/site.ts` | Phase 2 (accent tokens for manual section) |
| `src/styles/global.css` | Phase 2 (design tokens) |
| `docs/adr/ADR-0016-*.md`, `docs/adr/ADR-0017-*.md` | Phase 1 + Phase 2 status updates |
| `.claude/settings.json` | Pre-existing harness config (same as ADR-0016 report observation) |

**Protected territory — no Phase 3 changes detected:**
- `src/components/manual/*` — clean (Phase 2 territory)
- `src/pages/manual/*` — clean (Phase 1 territory)
- `src/lib/manual.ts` — clean (Phase 1 territory); plugin imports it, does not modify it
- `src/content.config.ts` — clean (Phase 1 territory)
- `docs/manual/*.md` (all 228) — clean
- `tools/opda-gen/*` — clean (Phase 5 territory)
- `src/pages/modelling/*` — clean (Phase 4 territory)

---

## 5. Open items / follow-ups

| ID | Description | Closed by |
|---|---|---|
| G18a | Multi-URI `classes.md` files: `rehypeFrontmatterUriExtraction` extracts only the first `opda:<Name>` heading. Physical-ontology `classes.md` files contain multiple `### opda:ClassName` sections. The plugin's best-effort extraction is correct until per-entry frontmatter is emitted. | ADR-0020 (generator should emit `entityUri` per entry in YAML frontmatter; the plugin's idempotent guard will defer to it automatically). |
| G18b | Cache-clear DX caveat: adding or replacing remark/rehype plugins requires deleting `node_modules/.astro/data-store.json` before the first build. Documented in impl report §2 + §5 and ADR-0018 §Consequences. Could be added as a pre-build CI step (`rm -f node_modules/.astro/data-store.json`) or documented as a one-liner in the project README. | CI tooling (no downstream ADR needed; naming it here for completeness). |
| G18c | `jiti` is used as a test-time TypeScript loader via Astro's transitive dependency — the test files hardcode the absolute path to the pnpm-managed `jiti` binary. This works but is brittle across `pnpm install` runs that change the lockfile hash. Recommend adding `jiti` as an explicit `devDependency` in `package.json` and importing it via the bare specifier. | ADR-0020 worker or next maintenance pass — not blocking. |

---

## 6. Build + test verification log

**Test run:**
```
Command:  npm test  (from /Users/henrik/source/opda)
Exit code: 0
Output:
  # tests 20
  # suites 0
  # pass 20
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 74.854792
```

**Build run (with cache clear):**
```
Command:  rm -f node_modules/.astro/data-store.json && npm run build
Exit code: 0
Key output:
  [build] ✓ Completed in 6.96s.
  [build] 386 page(s) built in 8.20s
  [build] Complete!
```

**Build-output assertions:**

| Assertion | Command | Result |
|---|---|---|
| Zero `<details><summary>Mermaid Source</summary>` in dist | `grep -rl '…' dist/ \| wc -l` | **0** PASS |
| Zero `<img src="…diagrams/…png">` in dist | `grep -rEl '…' dist/ \| wc -l` | **0** PASS |
| 292 files with `<div class="mermaid">` in dist | `grep -rl '…' dist/ \| wc -l` | **292** PASS |
| Zero `_export/` refs in src/ + dist/ | `grep -r "docs/manual/_export" src/ dist/ \| wc -l` | **0** PASS |
| Diagram.astro unchanged | `git diff HEAD -- src/components/Diagram.astro` | **0 lines** PASS |
| ELK directive preserved in spot-check file | `grep -c 'layout: elk' dist/manual/logical/agent/enumerations/role-scheme/index.html` | **1** PASS |

---

## 7. Recommended next action

ADR-0018 moves `status: implemented → accepted` on this commit.

**Phase 5 (ADR-0020) is half-unblocked:** this PASS satisfies the ADR-0018 gate. ADR-0017 validation must also PASS before Phase 5 fully unblocks.

**Phase 4 (ADR-0019) gate:** requires ADR-0016 PASS (already done) + ADR-0017 PASS (pending). Once ADR-0017 validation completes, Phase 4 can proceed.

ADR-0020 worker should note:
- `entityUri` idempotency guard in `rehypeFrontmatterUriExtraction` means generator-emitted frontmatter will take precedence over plugin derivation automatically — no plugin change needed.
- `jiti` hardcoded path in test files (follow-up G18c) is worth fixing when the test suite is next touched.
- Cache-clear caveat (G18b) should be noted in the CI step that runs `npm run build`.
