# ADR-0017 Validation Report — Manual component library (12 components + accent tokens)

**Validation agent:** independent-validator-adr-0017 (per programme plan §8; ODR-0001 §"Roles for every session")
**Validated:** 2026-05-28
**Implementing worker:** ADR-0017 worker
**Cited ADRs:** ADR-0017, ADR-0015 §Confirmation criteria #4, #6, #9; ADR-0016 (Phase 1 predecessor)
**Programme plan:** `docs/plan/manual-astro-integration.md` §8 (programme-wide gates a/b/c/d)
**Note:** Phase 3 (ADR-0018) landed in parallel. This report validates Phase 2 in the combined build.

---

## 1. Verdict

**PASS-WITH-FOLLOW-UPS**

All Phase 2 substantive criteria are met. 12 components are live with correct doc-comment headers, zero hex literals, and proper dark-mode token discipline. The KIND_COMPONENT dispatcher pattern is identical across all 4 route files. Build exits 0 at 386 pages; 219 HTML files under `dist/manual/`; all 5 spot-check component class names confirmed in emitted HTML. The only open items are known, named, and owned by downstream phases.

ADR-0017 advances from `status: implemented` to `status: accepted`. Phase 4 (ADR-0019) and Phase 5 (ADR-0020) are unblocked pending ADR-0018's validation PASS.

---

## 2. Confirmation criteria status (ADR-0015 §Confirmation)

Phase 2 realises criteria #4, #6, #9.

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 4 | 12 reusable components live under `src/components/manual/` | GREEN | `ls src/components/manual/` returns exactly 12 `.astro` files: `AttributeTable`, `CrossCuttingPage`, `CrossTierLinks`, `EntityHeader`, `EntityPage`, `ExemplarPage`, `ModuleLanding`, `SchemeMembersTable`, `SchemePage`, `ShapeBlock`, `TierLanding`, `TurtleBlock`. Every file opens with a doc-comment block citing "ADR-0017 (manual component library) per ADR-0015." verified by direct `head -5` inspection of all 12 files. |
| 6 | Dark/light toggle works on a manual page | GREEN (static inspection; browser toggle not run) | All 12 component `<style>` blocks use `var()` tokens exclusively — `grep '#[0-9a-fA-F]{3,6}'` returns zero matches across all component files. Accent tokens are declared in both `:root` (light) and `[data-theme="dark"]` (dark) blocks of `src/styles/global.css`. Token values reference existing palette vars (`var(--terracotta-100)`, `var(--color-danger-500)`, etc.) — no hex literals in global.css accent section either. Browser toggle test not performed (static build only). |
| 9 | No new design tokens beyond manual-specific accent tokens; all in existing convention | GREEN | 31 new vars in `:root` + 31 matching overrides in `[data-theme="dark"]` = 62 total accent custom properties. All reference existing palette vars from `public/ui/design-tokens.css` (confirmed present). No vars bypass the `[data-theme="dark"]` selector pattern. Component `<style>` blocks introduce zero additional custom property declarations — all component-level CSS uses only existing site tokens and the new accent vars. Worker report cited "32 new vars" — actual `:root` count is 31; this is a documentation inaccuracy in the report, not an implementation defect. |

---

## 3. Programme-wide gates (plan §8)

| Gate | Status | Evidence |
|---|---|---|
| (a) Soundness — every emitted file's doc-comment cites ADR-0017 + ADR-0015 | PASS | All 12 component files verified by direct `head -5`. Every doc-comment reads "Realises ADR-0017 (manual component library) per ADR-0015." |
| (b) Completeness — ADR-0015 §Confirmation #4, #6, #9 realised | PASS | All three criteria confirmed GREEN above. |
| (c) Cross-ADR consistency — downstream ADRs 0018/0019/0020 not foreclosed | PASS | (1) `entityUri` typed as `string | undefined` throughout — Phase 3's `rehypeFrontmatterUriExtraction` populates it with zero component changes needed. (2) `AttributeTable`, `SchemeMembersTable`, `TurtleBlock`, `ShapeBlock` shipped but not yet in the dispatcher — ADR-0020 can wire them via frontmatter data without touching any shipped Phase 2 file. (3) `KIND_COMPONENT` map uses a `?? CrossCuttingPage` fallback — new kind values from future ADRs will not crash the build. (4) `src/pages/modelling/` untouched — ADR-0019 territory clean. (5) Phase 3 files (`src/lib/remark/`, `astro.config.mjs` markdown block, `tests/lib/`) are not imported or modified by Phase 2 components. |
| (d) Validation report — `docs/adr/validation/ADR-0017-validation-report.md` committed by independent agent | PASS | This file. |

---

## 4. Scope discipline check

Phase 2 files are all untracked/modified (not yet committed). Phase 3 changes co-exist in the working tree.

| File | Change | Verdict |
|---|---|---|
| `src/components/manual/*.astro` (12 new files) | New — 12 components with typed Props, scoped `<style>`, doc-comment headers | IN SCOPE — ADR-0017 §3 outputs |
| `src/pages/manual/{concept,logical,physical-database,physical-ontology}/[...slug].astro` | Modified — KIND_COMPONENT dispatcher replaces Phase 1 `<Content />` placeholder | IN SCOPE — ADR-0017 §3 outputs |
| `src/styles/global.css` | Modified — 62 accent CSS custom properties appended under `:root` + `[data-theme="dark"]` | IN SCOPE — ADR-0017 §3 outputs |
| `docs/adr/ADR-0017-manual-component-library.md` | Modified — status `proposed → implemented`; Decision Outcome / Consequences / Confirmation populated | IN SCOPE — expected ADR maintenance |
| `docs/adr/implementation-reports/ADR-0017-implementation.md` | New — worker implementation report | IN SCOPE |

**Phase 3 files — present in working tree but NOT Phase 2's territory:**
- `src/lib/remark/` (new directory — Phase 3, ADR-0018)
- `astro.config.mjs` markdown block additions — Phase 3
- `package.json` — Phase 3
- `tests/lib/` (new — Phase 3)

Confirmed Phase 2 did NOT touch: `src/lib/remark/`, `astro.config.mjs`, `src/content.config.ts`, `src/lib/manual.ts`, `src/lib/site.ts`, `src/pages/modelling/`, `tools/opda-gen/`, `docs/manual/*.md`.

---

## 5. Open items / follow-ups

| ID | Description | Owned by |
|---|---|---|
| G17 | `AttributeTable`, `TurtleBlock`, `SchemeMembersTable`, `ShapeBlock` are implemented and shipped but not yet invoked by the KIND_COMPONENT dispatcher. They wait for frontmatter-driven attribute/shape/Turtle data. Will be wired when ADR-0020 emits the required frontmatter fields. No build breakage; components exist purely as building blocks. | ADR-0020 (Phase 5) |
| G18 | `CrossTierLinks` renders best-effort tier-navigation using `module + lowercased title` when `entityUri` is undefined. Links are approximate (e.g. `/manual/concept/property/property`) but structurally correct for the majority of entities. Exact links require `entityUri` from Phase 3. ADR-0018 validator should confirm URI population causes CrossTierLinks to switch to exact-path mode without further changes. | ADR-0018 §Confirmation |
| G19 | Worker report states "32 new vars" in the accent token count. Actual count in `:root` is 31; `[data-theme="dark"]` repeats all 31. No functional impact; a correction to the implementation report's §4 paragraph is desirable but non-blocking. | Cosmetic — no remediation required |
| G15 | (Carried from ADR-0016) `passthroughImageService` as long-term build posture. ADR-0018 `remarkUnwrapMermaidDetails` strips PNG `<img>` refs; passthrough service remains harmless but inert. ADR-0018 validator to confirm. | ADR-0018 §Confirmation |

---

## 6. Build verification log

**Command:** `npm run build` from `/Users/henrik/source/opda`

**Exit code:** 0

**Key output lines:**
```
[build] output: "static"
[build] mode: "static"
[build] directory: /Users/henrik/source/opda/dist/
[build] ✓ Completed in 7.03s.
[build] 386 page(s) built in 7.35s
[build] Complete!
```

**Manual HTML file count:** `find dist/manual -name 'index.html' | wc -l` → **219**

**Spot-check component class names in emitted HTML (all PASS):**

| Path | Expected class | Confirmed |
|---|---|---|
| `dist/manual/concept/property/property/index.html` | `entity-page`, `entity-header` | PASS — `class="entity-page"`, `class="entity-header"`, `class="entity-header__tier-badge tier-badge--concept"` |
| `dist/manual/concept/index.html` (tier-readme) | `tier-landing tier-landing--concept` | PASS — `class="tier-landing tier-landing--concept"` confirmed |
| `dist/manual/physical-ontology/severity-tiers/index.html` | `cross-cutting-page` | PASS — multiple `cross-cutting-page` class occurrences |
| `dist/manual/physical-ontology/exemplars/lease-extension-transaction/index.html` | `exemplar-page` | PASS — `class="exemplar-page"`, `class="exemplar-page__badge"` |
| `dist/manual/physical-ontology/vocabularies/ownership-type/index.html` | `scheme-page` | PASS — `class="scheme-page"` confirmed |

**`Diagram.astro` unchanged:** `git diff src/components/Diagram.astro` produced no output — confirmed byte-identical to pre-Phase-2 state.

**Errors:** None.

---

## 7. Recommended next action

ADR-0017 moves `status: implemented → accepted` on this commit.

**Phase 4 (ADR-0019) and Phase 5 (ADR-0020) require BOTH ADR-0017 AND ADR-0018 to have PASS verdicts** per programme plan §4 dependency graph. ADR-0017 is now PASS. ADR-0018's independent validation is the remaining gate before Phase 4 + Phase 5 are unblocked.

ADR-0018 validator will find (Phase 3 already landed):
- `src/lib/remark/unwrap-mermaid-details.ts` and `frontmatter-uri-extraction.ts` are present
- `astro.config.mjs` markdown block wires both plugins
- Tests at `tests/lib/` cover the plugins
- The build at 386 pages / exit 0 is the combined Phase 2 + Phase 3 state
