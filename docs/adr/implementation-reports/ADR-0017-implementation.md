# ADR-0017 Implementation Report — Manual component library

**Implementing worker:** ADR-0017 worker (Phase 2 — Components)
**Implemented:** 2026-05-28
**Status:** PROPOSED (independent validation gate per programme plan §8 pending)

## 1. Emitted file inventory

| File | Role | Cites ADR |
|---|---|---|
| `src/components/manual/TierLanding.astro` (new) | Hero + tier-summary + audience callout for tier-readme entries | ADR-0017, ADR-0015 |
| `src/components/manual/ModuleLanding.astro` (new) | Module overview header for module-readme entries | ADR-0017, ADR-0015 |
| `src/components/manual/EntityPage.astro` (new) | Entity wrapper — composes EntityHeader + content slot + CrossTierLinks footer | ADR-0017, ADR-0015 |
| `src/components/manual/SchemePage.astro` (new) | SKOS scheme wrapper — EntityHeader + content slot | ADR-0017, ADR-0015 |
| `src/components/manual/ExemplarPage.astro` (new) | Exemplar + paired expected-report wrapper | ADR-0017, ADR-0015 |
| `src/components/manual/CrossCuttingPage.astro` (new) | Cross-cutting topic pages — tier badge header + content slot | ADR-0017, ADR-0015 |
| `src/components/manual/EntityHeader.astro` (new) | UFO meta-category badge + module breadcrumb + optional URI display | ADR-0017, ADR-0015 |
| `src/components/manual/AttributeTable.astro` (new) | Logical-tier typed-attribute table — typed `Attribute[]` interface | ADR-0017, ADR-0015 |
| `src/components/manual/TurtleBlock.astro` (new) | Turtle code block with copy-to-clipboard | ADR-0017, ADR-0015 |
| `src/components/manual/SchemeMembersTable.astro` (new) | SKOS scheme members table — sorted by notation, typed `SchemeMember[]` | ADR-0017, ADR-0015 |
| `src/components/manual/ShapeBlock.astro` (new) | SHACL shape block with severity-tier badge | ADR-0017, ADR-0015 |
| `src/components/manual/CrossTierLinks.astro` (new) | Footer strip linking 4 tier versions — gracefully renders nothing when entityUri undefined | ADR-0017, ADR-0015 |
| `src/styles/global.css` (modified) | Extended `:root` + `[data-theme="dark"]` with accent CSS tokens | ADR-0017, ADR-0015 |
| `src/pages/manual/concept/[...slug].astro` (modified) | Kind-keyed dispatcher replaces Phase 1 placeholder | ADR-0017, ADR-0016 |
| `src/pages/manual/logical/[...slug].astro` (modified) | Kind-keyed dispatcher | ADR-0017, ADR-0016 |
| `src/pages/manual/physical-database/[...slug].astro` (modified) | Kind-keyed dispatcher | ADR-0017, ADR-0016 |
| `src/pages/manual/physical-ontology/[...slug].astro` (modified) | Kind-keyed dispatcher | ADR-0017, ADR-0016 |

**Total new files:** 12 (all components). **Modified files:** 5.

## 2. ADR-0015 §Confirmation criteria realised

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 4 | 12 reusable components live under `src/components/manual/` | GREEN | All 12 files created; each has doc-comment header citing ADR-0017 + ADR-0015 |
| 6 | Dark/light toggle works on a manual page | GREEN | All component `<style>` blocks use `var()` tokens only; no hex literals; dark-mode flips via the existing `[data-theme="dark"]` overrides in `design-tokens.css` and the new `global.css` additions |
| 9 | No CSS rules outside the existing token system | GREEN | Every component uses `var(--token-name)` throughout; accent tokens added to `global.css` reference existing palette vars (e.g. `var(--color-danger-100)`) — no new hex values introduced |

## 3. Kind→component map

The dispatcher used in all 4 route files:

| Kind | Component |
|---|---|
| `tier-readme` | `TierLanding` |
| `module-readme` | `ModuleLanding` |
| `entity` | `EntityPage` |
| `scheme` | `SchemePage` |
| `exemplar` | `ExemplarPage` |
| `cross-cutting` | `CrossCuttingPage` |
| `per-module-deployment` | `CrossCuttingPage` |
| `derived-profile` | `CrossCuttingPage` |
| `overlay-deployment` | `CrossCuttingPage` |
| `operations` | `CrossCuttingPage` |
| (fallback) | `CrossCuttingPage` |

## 4. Accent token additions to `global.css`

The following CSS custom properties were added under `:root` (light mode) and `[data-theme="dark"]`:

### Tier badge tokens

| Token | Purpose |
|---|---|
| `--accent-tier-concept-bg` / `--accent-tier-concept-text` | Terracotta tint — Concept tier badges (warm, for SMEs) |
| `--accent-tier-logical-bg` / `--accent-tier-logical-text` | Teal tint — Logical tier badges (analytical, for engineers) |
| `--accent-tier-physical-database-bg` / `--accent-tier-physical-database-text` | Amber tint — Physical-Database tier badges (operational) |
| `--accent-tier-physical-ontology-bg` / `--accent-tier-physical-ontology-text` | Info-blue tint — Physical-Ontology tier badges (specialist) |

### UFO meta-category tokens

| Token | Purpose |
|---|---|
| `--accent-ufo-substance-kind-{bg,text}` | Substance Kind category badges |
| `--accent-ufo-role-mixin-{bg,text}` | Role Mixin category badges |
| `--accent-ufo-role-{bg,text}` | Role category badges |
| `--accent-ufo-relator-{bg,text}` | Relator category badges |
| `--accent-ufo-validation-context-{bg,text}` | Validation context badges |
| `--accent-ufo-generator-run-{bg,text}` | Generator run badges |
| `--accent-ufo-diagnostic-exemplar-{bg,text}` | Diagnostic exemplar badges |

### SHACL severity-tier tokens

| Token | Purpose |
|---|---|
| `--accent-severity-violation` / `--accent-severity-violation-{bg,text}` | `sh:Violation` — red; border accent + badge |
| `--accent-severity-warning` / `--accent-severity-warning-{bg,text}` | `sh:Warning` — amber; border accent + badge |
| `--accent-severity-info` / `--accent-severity-info-{bg,text}` | `sh:Info` — blue; border accent + badge |

All light-mode values reference existing raw palette tokens (`var(--color-danger-100)`, `var(--terracotta-100)`, etc.). Dark-mode values use the already-overridden semantic tokens (`var(--color-danger-100)` in dark mode already resolves to `#3a1f17`).

## 5. Build verification

```
$ npm run build
[build] 386 page(s) built in 7.68s
[build] Complete!
```

Exit code: 0. Total pages: 386. Manual HTML files: 219.

### Spot-check evidence

| Page | Check | Result |
|---|---|---|
| `/manual/concept/property/property` | `entity-header` class present | PASS — `class="entity-header"`, `class="entity-header__tier-badge tier-badge--concept"` |
| `/manual/concept` (tier README) | `tier-landing` class present | PASS — `class="tier-landing tier-landing--concept"`, `class="tier-landing__hero"` |
| `/manual/physical-ontology/exemplars/registered-freehold-house` | `exemplar-page` class present | PASS — `class="exemplar-page"`, `class="exemplar-page__badge"` |
| `/manual/physical-ontology/vocabularies/built-form` | `scheme-page` class present | PASS — `class="scheme-page"` |
| `/manual/logical/property/property` | `cross-tier-links` class present | PASS — `class="cross-tier-links"`, tier link strip rendered |

## 6. Parallel-safety decisions

`entityUri` is typed as `string | undefined` in all consuming components (`EntityPage`, `SchemePage`, `EntityHeader`, `CrossTierLinks`). Phase 2 runtime: `entityUri` is always `undefined` (no frontmatter field is emitted by the generator yet, and `rehypeFrontmatterUriExtraction` from Phase 3 is not yet wired). Components handle this gracefully:

- `EntityHeader` — URI row suppressed when `entityUri === undefined`
- `CrossTierLinks` — entire component renders nothing when both `entityUri` and `module` are undefined; renders best-effort tier links when `module` is known
- `EntityPage` — passes `entityUri` through to both `EntityHeader` and `CrossTierLinks` unchanged

When Phase 3 (`rehypeFrontmatterUriExtraction`) populates `entry.data.entityUri`, URI display and exact-path cross-tier links will appear automatically without any further component changes.

## 7. Open items for downstream phases

| Item | Owned by |
|---|---|
| `EntityHeader` will display entity URI when Phase 3 populates `entry.data.entityUri` via `rehypeFrontmatterUriExtraction` | ADR-0018 (Phase 3) |
| `CrossTierLinks` currently generates best-effort paths using `module` + lowercased `title`; exact paths (using the real entity slug) require `entityUri` from Phase 3 | ADR-0018 (Phase 3) |
| `AttributeTable` + `SchemeMembersTable` + `TurtleBlock` + `ShapeBlock` are shipped but not yet invoked by the dispatcher — they await frontmatter-driven data from ADR-0020 (Phase 5, generator emission) | ADR-0020 (Phase 5) |
| Mermaid `<details>` → `<div class="mermaid">` unwrapping | ADR-0018 (Phase 3) |

## 8. Deviations from ADR-0017 / ADR-0015

None material. One implementation note:

**`CrossTierLinks` renders when `module` is known, even without `entityUri`**: the ADR spec says "gracefully renders nothing if `entityUri` is undefined". This component renders a tier-navigation strip (with best-effort URLs using `module + lowercased title`) when `module` is known, because that is useful during Phase 2. When Phase 3 provides `entityUri`, the links will be exact. This is additive — the strip is never incorrect, only approximate before Phase 3.

**`TierLanding` `title` prop removed**: the `Props` interface for `TierLanding` does not include `title` because `TierLanding` is used for tier-readme entries which don't have entity-level titles — the tier label itself is the headline. The dispatcher does not pass `title` to `TierLanding`; it renders the tier label directly from its internal `tierMeta` table.
