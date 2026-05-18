# ADR 0002 — Refactor to idiomatic Astro architecture

**Status:** Proposed — six review points decided 2026-05-18 (§"Resolved during review"); design ready to implement
**Date:** 2026-05-18
**Authors:** Henrik Pettersen, with Claude Opus 4.7
**Related:** [0001-folder-hierarchy-and-slug-taxonomy.md](./0001-folder-hierarchy-and-slug-taxonomy.md) — sibling decision; one coordinated migration
**Supersedes:** none
**Superseded by:** none

## Context

The Knowledge Base uses Astro for build orchestration and file-based routing but not for what makes Astro distinctive. Concretely:

- `Layout.astro` emits an empty `<div id="app">` with the article slot. The initial HTML has no header, sidebar, or breadcrumbs.
- `public/ui/site.js` (~1,700 lines of vanilla JS) injects all chrome at runtime via `OPDA.init({ page, section })` and string-based HTML concatenation into the DOM.
- `SECTIONS` is a JavaScript literal inside `site.js`, parsed fresh on every page navigation.
- Active state, prev/next links, breadcrumbs, TOC — all computed in the browser, not at build time.

This was an artefact of the 17 May incremental refactor (commit `82cbaf7`) that extracted `Layout` from 158 copy-pasted `.html` files. The work stopped before converting the chrome-injection mechanism. Result: a half-Astro, half-vanilla-JS setup that uses Astro for routing only.

### Why this is the wrong architecture

- **FOUC.** Initial paint shows bare content; chrome appears a beat later when JS executes.
- **No SEO benefit from build-time rendering.** Search engines see content but no navigation, no breadcrumbs, no related-page hints.
- **Larger client bundle.** Every page ships 1,700+ lines of vanilla JS to render its chrome.
- **Two sources of truth.** `site.js` says one thing about page identity; `<Layout page="…" />` props say another. They drift.
- **Hard to debug.** The "real" page structure exists only after JS runs.
- **Hard to extend.** Adding a sidebar feature means editing DOM-injection JS rather than composing components.

### Why decide now

ADR 0001 (folder hierarchy) commits to touching every page anyway: drop numbers, move into section folders, rewrite prev/next, update cross-references. If we don't fix the templating in the same pass, every page gets touched again later. Doing both at once is meaningfully cheaper than two sequential migrations — the touch-every-page cost is shared.

## Decision drivers

1. **Use the framework as intended.** Astro is designed for build-time component composition plus islands. Use it that way.
2. **Single source of truth.** SECTIONS as a typed TypeScript module imported by Astro components.
3. **Eliminate FOUC.** Full chrome in initial HTML.
4. **Smaller client bundle.** Ship JS only for things that actually need interactivity.
5. **Easier debugging and extension.** Components, props, typed data.
6. **Co-located with folder migration.** Both touch every page; bundle them.

## Considered options

### A — Stop at folder migration

Do ADR 0001's restructure, skip the templating refactor. Cheapest path. Defers the architectural debt; site.js stays at ~1,700 lines doing runtime chrome injection forever.

### B — Idiomatic refactor first, then folder migration

Touch every page twice — once to swap templating, once to move folders. Lower per-step risk, double the work.

### C — Bundle both into one coordinated migration (**chosen**)

The folder restructure and the templating refactor share the same migration mechanic: walk every page, rewrite layout calls, move files, generate redirects. One coordinated PR (or PR series).

**Why C over B:** the per-page touches are the migration cost. Doing both in one pass amortises that cost. The risk is concentration — one big PR vs two smaller ones — but is mitigated by the new component library being built and tested *before* the page move (step 3 below).

## Decision

Adopt option C. Refactor to idiomatic Astro at the same time as the folder migration.

### What the target architecture looks like

Follows Astro's documented folder conventions: `src/layouts/` for page shells, `src/components/` for reusable UI, `src/lib/` for TypeScript helpers. `Layout.astro` moves from its current home in `src/components/` to `src/layouts/` per the framework convention.

```
src/
  layouts/
    Layout.astro             # page shell — wraps content with full chrome
                             # (Astro convention: src/layouts/ for page shells)
  components/
    Header.astro             # global header with section nav
    Sidebar.astro            # left rail; takes section + activePath props
    Breadcrumbs.astro        # derived from activePath
    PageFooter.astro         # prev/next derived from site.ts
    TOC.astro                # table of contents (client island)
    Diagram.astro             # already exists
    PageMeta.astro           # already exists
  lib/
    site.ts                  # typed SECTIONS data + helpers
                             # (findPage, getPrevNext, getActiveSection, ...)
  pages/
    index.astro              # /
    governance/
      index.astro            # /governance
      data-stewardship.astro # /governance/data-stewardship
      …
    modelling/
      …
    schema/
      legal-estate/
        title/
          oc-summary/
            oc-owners.astro
            …
    glossary.astro           # /glossary (top-level reference per ADR 0001 Q3)
    design-system.astro      # /design-system (top-level reference)
public/
  ui/
    data-browser.js          # kept — client-side table sort/filter/pagination
    theme.js                 # minimal — theme toggle only (extracted from site.js)
  data/
    properties.js            # kept
    entities.js              # kept
```

Conventional Astro folder roles:

| Folder | Role | Source |
|---|---|---|
| `src/pages/` | File-based routing | Astro core feature |
| `src/layouts/` | Page shells (Layout components) | Astro-documented convention |
| `src/components/` | Reusable UI components | Astro-documented convention |
| `src/lib/` | TypeScript helpers (not Astro-specific) | Common convention |
| `public/` | Static assets served as-is | Astro core |

`public/ui/site.js` is **deleted**. Its functions become Astro components in `src/components/` and TS helpers in `src/lib/`.

### Component responsibilities

- **`Layout.astro`** — top-level page chrome. Imports Header / Sidebar / Breadcrumbs / PageFooter. Looks up the current page in `site.ts` via `Astro.url.pathname`. Sets active state automatically. Renders full HTML at build time.
- **`Header.astro`** — global navigation. Takes `activeSection` prop derived from URL.
- **`Sidebar.astro`** — section sidebar. Takes `section` and `activePath` props. Renders the section's groups with active-state highlighting.
- **`Breadcrumbs.astro`** — section → group → page chain, derived from `activePath`.
- **`PageFooter.astro`** — prev / next links derived from site.ts flattened ordering. No hand-coded chain.
- **`TOC.astro`** — page-heading TOC. Loaded as a client island (`client:load` or `client:visible`) because it depends on the rendered DOM.

### Data layer — `src/lib/site.ts`

```ts
export type Item = {
  url: string;          // canonical URL path (matches Astro.url.pathname)
  title: string;
  children?: Item[];    // nested items (schema deep hierarchy)
};

export type Group = {
  heading: string;
  items: Item[];
};

export type Section = {
  key: string;          // e.g. 'governance'
  title: string;        // 'Governance'
  summary: string;
  groups: Group[];
};

export const SECTIONS: Record<string, Section> = { /* … */ };

// Helpers used by components:
export function findPage(path: string):
  { section: Section; group?: Group; item: Item } | null;

export function getPrevNext(path: string):
  { prev?: Item; next?: Item };

export function getActiveSection(path: string): string | null;

export function flatten(section: Section): Item[];
```

Typed; importable by any Astro component or TS file. No runtime parsing of `site.js`.

### Client JS — minimal, opted-in

- **Theme toggle.** Inline `<script>` in the document head, ~30 lines. Reads URL `?theme=` param, falls back to `localStorage`, applies `data-theme` to `<html>`. Runs before paint to avoid flash.
- **Data browser.** `public/ui/data-browser.js` stays for client-side table sort / filter / pagination on the data-dictionary and business-glossary pages. Mounted by per-page inline scripts (as today, post-fix) or via Astro `client:visible` islands.
- **TOC.** Astro component with `client:load` directive — needs rendered DOM to extract headings.
- **Mermaid.** Diagram component already handles initialisation; unchanged.

Everything else (sidebar render, header render, breadcrumbs, prev/next computation, section active state) moves to build time.

### Page authoring after the refactor

```astro
---
// src/pages/governance/data-stewardship.astro
import Layout from '@/layouts/Layout.astro';
---
<Layout title="Data stewardship & decision rights">
  <h1>Data stewardship</h1>
  <!-- content -->
</Layout>
```

That's it. No `page=` prop, no `section=`, no `<PageFooter>` call (Layout includes it). Layout derives everything from `Astro.url.pathname`.

## Migration plan

Bundled with ADR 0001's folder migration. Adjusted ordering:

1. **Confirm URL shape decisions from ADR 0001** — bare slugs, `build.format: 'directory'`, mixed reference-item placement, deep schema nesting.
2. **Build the mapping table** (old path → new path → old URL → new URL). Generated from current `site.js` SECTIONS.
3. **Build the new component library** — Header, Sidebar, Breadcrumbs, PageFooter, TOC. Test against a handful of representative current pages *before* moving anything. Validates the data layer + components in isolation.
4. **Convert `site.js` → `src/lib/site.ts`** — typed SECTIONS plus helper functions. Validated by the component test render in step 3.
5. **Move files** to new folder structure (`git mv`). Preserve blame history.
6. **Move section landings** to `{section}/index.astro`.
7. **Rewrite `Layout.astro`** — real composition; takes `title` and minimal other props; derives the rest from URL.
8. **Update every page** — remove `page=`, `section=`, `<PageFooter>` props; replace with single `<Layout title="…">` wrapping content.
9. **Delete `public/ui/site.js`**. Extract theme toggle to a small inline script.
10. **Rewrite cross-references** — `sed` across all pages: `<a href="14-business-glossary.html">` → `<a href="/modelling/business-glossary">`.
11. **Generate `_redirects` file** (Cloudflare Pages) from the mapping table.
12. **Verify build** — `npm run build` produces the new structure cleanly. Spot-check sample URLs (old → 301 → new; new resolves; cross-references work; theme toggle persists; data tables hydrate).
13. **Deploy.** Cloudflare Pages picks up `_redirects`.

Estimated effort: **12-20 hours** of careful work. Most of it scriptable (file moves, sed cross-references, redirect generation, page-template substitution); the component library, Layout rewrite, and site.ts data layer are the hand-craft parts.

## Consequences

### Positive

- **Full HTML at build time.** No FOUC; SEO benefit; faster perceived load.
- **Smaller client bundle.** ~1,700 lines of vanilla JS → small inline scripts + opt-in `data-browser.js`.
- **Single source of truth.** `site.ts` is canonical; URL-derived state everywhere.
- **Typed.** TypeScript catches drift between sections, URLs, titles.
- **Easier to extend.** New sidebar feature = edit an Astro component, not DOM-injection JS.
- **Idiomatic.** Matches what Astro is for; lower onboarding cost for contributors who know Astro.

### Negative / risk

- **Bigger migration than folder-only.** ~12-20 hours vs ~4-8.
- **Touches the chrome.** Header, sidebar, breadcrumbs all rebuilt. Visual regression risk — what looks identical in development may have subtle CSS differences once render moves from runtime to build time.
- **Loss of runtime flexibility.** Things that were one-line tweaks in `site.js` become Astro component rebuilds. Trade-off worth taking.
- **Per-page interactivity needs explicit opt-in.** Astro `client:*` directives or page-specific script tags. Slightly more deliberate than "just add JS to the page".

### What does NOT change

- The 8-section taxonomy. `site.ts` contains the same SECTIONS data, just typed.
- Page content. Markdown / HTML in pages stays.
- ADR 0001's folder hierarchy decision. Still valid.
- ADR 0001's URL shape decisions (Q1-Q4 answers). Still valid.
- Data browser, Mermaid, theme toggle as features. Just delivered differently.

### Reversibility

Low. Once `site.js` is deleted and pages use the new Layout, reverting is essentially redoing the migration in the opposite direction. Mitigation: validate the component library against current pages in step 3 before committing to the move.

## Resolved during review (2026-05-18)

Open questions in the first draft were walked through and decided. Where the question maps to an Astro / TS convention, the convention was adopted ("follow convention" was the explicit instruction).

1. **Component library structure.** *Resolved: follow Astro convention.* Flat `src/components/` for the 7 reusable components; `Layout.astro` moves from `src/components/` to `src/layouts/` per the documented Astro convention for page shells; TypeScript helpers in `src/lib/`. See "What the target architecture looks like" above.

2. **Astro view transitions.** *Resolved: enable.* Astro 4+ ships view transitions as a one-line addition (`<ClientRouter />` in Layout). Idiomatic for modern Astro sites and a clean UX improvement; landing during the refactor avoids touching pages twice.

3. **TypeScript strictness.** *Resolved: enable `strict: true`.* Modern TS default; `site.ts` is the first real TS module in the codebase so setting strict from the start avoids retrofitting.

4. **PR strategy.** *Resolved: N/A.* OPDA doesn't use PRs — direct commits to main. Single atomic commit for the migration (everything staged, one `git commit`, one push, one Cloudflare deploy). Site flips from old to new in one go; trivial revert via `git revert HEAD` if needed.

5. **Visual regression testing.** *Resolved: skip.* Not an Astro convention; adds tooling overhead without proportionate value for a solo-dev project. Eyeball spot checks on a sample of representative pages during step 12 of the migration plan.

6. **Per-page custom CSS.** *Resolved: migrate to component-scoped where reasonable, leave `<style is:global>` for genuinely page-specific overrides.* Astro convention is component-scoped styles; global is opt-in for the genuine global concerns (data-browser CSS, page-specific selectors that can't be expressed in component scope).

## Newly surfaced open questions

1. **No redirects (cross-cutting decision).** External citations and bookmarks pointing to old `/pages/NN-…html` URLs will 404 after migration. Decided 2026-05-18: accept the breakage. Pre-deploy task: audit OPDA-controlled materials (briefings, member-firm comms, openpropdata.org.uk) for old URLs to update directly.

2. **`src/lib/` naming.** Some Astro projects use `src/utils/` instead of `src/lib/`. Both are conventional; pick one and stick to it. Default: `src/lib/` (slightly more conventional for "things modules import", less for tiny helpers).

## References

- [`./0001-folder-hierarchy-and-slug-taxonomy.md`](./0001-folder-hierarchy-and-slug-taxonomy.md) — sibling decision; one coordinated migration.
- `public/ui/site.js` lines 13-312 — current SECTIONS data (the source of truth that becomes `site.ts`).
- `src/components/Layout.astro` — current minimal Layout (the thing being rewritten).
- `astro.config.mjs` — build configuration.
- Astro documentation — components, islands, view transitions, file-based routing.

---

*ADR 0002 — Drafted 2026-05-18 by Henrik Pettersen with Claude Opus 4.7. Not yet ratified.*
