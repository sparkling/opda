---
status: accepted
date: 2026-05-18
tags: [astro, frontend, refactor, typescript]
supersedes: []
depends-on: [ADR-0002]
implements: []
---

# Refactor to idiomatic Astro architecture

## Context and Problem Statement

The Knowledge Base uses Astro for build orchestration and file-based routing but not for what makes Astro distinctive. Concretely:

- `Layout.astro` emits an empty `<div id="app">` with the article slot. The initial HTML has no header, sidebar, or breadcrumbs.
- `public/ui/site.js` (~1,700 lines of vanilla JS) injects all chrome at runtime via `OPDA.init({ page, section })` and string-based HTML concatenation into the DOM.
- `SECTIONS` is a JavaScript literal inside `site.js`, parsed fresh on every page navigation.
- Active state, prev/next links, breadcrumbs, TOC — all computed in the browser, not at build time.

This was an artefact of the 17 May incremental refactor (commit `82cbaf7`) that extracted `Layout` from 158 copy-pasted `.html` files. The work stopped before converting the chrome-injection mechanism. Result: a half-Astro, half-vanilla-JS setup that uses Astro for routing only.

Symptoms of the wrong architecture:

- **FOUC.** Initial paint shows bare content; chrome appears a beat later when JS executes.
- **No SEO benefit from build-time rendering.** Search engines see content but no navigation, no breadcrumbs, no related-page hints.
- **Larger client bundle.** Every page ships 1,700+ lines of vanilla JS to render its chrome.
- **Two sources of truth.** `site.js` says one thing about page identity; `<Layout page="…" />` props say another. They drift.
- **Hard to debug.** The "real" page structure exists only after JS runs.
- **Hard to extend.** Adding a sidebar feature means editing DOM-injection JS rather than composing components.

[ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) commits to touching every page anyway: drop numbers, move into section folders, rewrite prev/next, update cross-references. If we don't fix the templating in the same pass, every page gets touched again later. Doing both at once is meaningfully cheaper than two sequential migrations — the touch-every-page cost is shared.

## Decision Drivers

1. **Use the framework as intended.** Astro is designed for build-time component composition plus islands. Use it that way.
2. **Single source of truth.** SECTIONS as a typed TypeScript module imported by Astro components.
3. **Eliminate FOUC.** Full chrome in initial HTML.
4. **Smaller client bundle.** Ship JS only for things that actually need interactivity.
5. **Easier debugging and extension.** Components, props, typed data.
6. **Co-located with folder migration.** Both touch every page; bundle them.

## Considered Options

* **A — Stop at folder migration.** Do [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md)'s restructure, skip the templating refactor. Cheapest path. Defers the architectural debt; `site.js` stays at ~1,700 lines doing runtime chrome injection forever.
* **B — Idiomatic refactor first, then folder migration.** Touch every page twice (once to swap templating, once to move folders). Lower per-step risk, double the work.
* **C — Bundle both into one coordinated migration (chosen).** The folder restructure and the templating refactor share the same migration mechanic: walk every page, rewrite layout calls, move files. One coordinated commit.

## Decision Outcome

Chosen option: **C — Bundle both into one coordinated migration**, because the per-page touches are the migration cost; doing both in one pass amortises that cost. The risk is concentration (one big change vs two smaller ones) but is mitigated by the new component library being built and tested *before* the page move.

### Target architecture

Follows Astro's documented folder conventions: `src/layouts/` for page shells, `src/components/` for reusable UI, `src/lib/` for TypeScript helpers. `Layout.astro` moves from `src/components/` to `src/layouts/` per the framework convention.

```
src/
  layouts/
    Layout.astro             # page shell — wraps content with full chrome
  components/
    Header.astro             # global header with section nav
    Sidebar.astro            # left rail; takes section + activePath props
    Breadcrumbs.astro        # derived from activePath
    PageFooter.astro         # prev/next derived from site.ts
    TOC.astro                # table of contents (client island)
    Diagram.astro            # already exists
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
    glossary.astro           # /glossary (cross-section reference per ADR-0002 Q3)
    design-system.astro      # /design-system (developer infra)
public/
  ui/
    data-browser.js          # kept — client-side table sort/filter/pagination
    theme.js                 # minimal — theme toggle only
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
| `src/lib/` | TypeScript helpers | Common convention |
| `public/` | Static assets served as-is | Astro core |

`public/ui/site.js` is **deleted**. Its functions become Astro components in `src/components/` and TS helpers in `src/lib/`.

### Component responsibilities

- **`Layout.astro`** — top-level page chrome. Imports Header / Sidebar / Breadcrumbs / PageFooter. Looks up the current page in `site.ts` via `Astro.url.pathname`. Sets active state automatically. Renders full HTML at build time.
- **`Header.astro`** — global navigation. Takes `activeSection` prop derived from URL.
- **`Sidebar.astro`** — section sidebar. Takes `section` and `activePath` props. Renders the section's groups with active-state highlighting.
- **`Breadcrumbs.astro`** — section → group → page chain, derived from `activePath`.
- **`PageFooter.astro`** — prev / next links derived from `site.ts` flattened ordering. No hand-coded chain.
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
- **Data browser.** `public/ui/data-browser.js` stays for client-side table sort / filter / pagination on the data-dictionary and business-glossary pages.
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

### Migration plan

Bundled with [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md)'s folder migration.

1. Confirm URL shape decisions from [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) — bare slugs, `build.format: 'directory'`, mixed reference-item placement, deep schema nesting.
2. Build the mapping table (old path → new path → old URL → new URL). Generated from current `site.js` SECTIONS.
3. Build the new component library — Header, Sidebar, Breadcrumbs, PageFooter, TOC. Test against a handful of representative current pages *before* moving anything. Validates the data layer + components in isolation.
4. Convert `site.js` → `src/lib/site.ts` — typed SECTIONS plus helper functions.
5. Move files to new folder structure (`git mv`). Preserve blame history.
6. Move section landings to `{section}/index.astro`.
7. Rewrite `Layout.astro` — real composition; takes `title` and minimal other props; derives the rest from URL.
8. Update every page — remove `page=`, `section=`, `<PageFooter>` props; replace with single `<Layout title="…">` wrapping content.
9. Delete `public/ui/site.js`. Extract theme toggle to a small inline script.
10. Rewrite cross-references — `sed` across all pages.
11. Verify build — `npm run build` produces the new structure cleanly.
12. Deploy.

Estimated effort at the time of decision: 12–20 hours.

### Consequences

* Good, because full HTML at build time — no FOUC; SEO benefit; faster perceived load.
* Good, because smaller client bundle — ~1,700 lines of vanilla JS replaced by small inline scripts + opt-in `data-browser.js`.
* Good, because single source of truth — `site.ts` is canonical; URL-derived state everywhere.
* Good, because TypeScript catches drift between sections, URLs, titles.
* Good, because easier to extend — new sidebar feature = edit an Astro component, not DOM-injection JS.
* Good, because idiomatic — matches what Astro is for; lower onboarding cost for contributors who know Astro.
* Bad, because bigger migration than folder-only (~12–20 hours vs ~4–8).
* Bad, because the chrome is rebuilt end-to-end — visual regression risk; what looks identical in development may have subtle CSS differences once render moves from runtime to build time.
* Bad, because loss of runtime flexibility — things that were one-line tweaks in `site.js` become Astro component rebuilds. Trade-off worth taking.
* Bad, because per-page interactivity needs explicit opt-in via Astro `client:*` directives. Slightly more deliberate than "just add JS to the page".
* Neutral, because the 8-section taxonomy, page content, [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md)'s folder hierarchy and URL decisions, and feature surfaces (data browser, Mermaid, theme toggle) are unchanged.
* Neutral, because reversibility is low. Once `site.js` is deleted and pages use the new Layout, reverting is essentially redoing the migration in the opposite direction. Mitigation in place: validate the component library against current pages in step 3 before committing to the move.

### Confirmation

Shipped 2026-05-18 jointly with [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) in a single atomic commit. Verifiable by:

- `public/ui/site.js` no longer exists.
- `src/lib/site.ts` is present with typed SECTIONS + helpers (`findPage`, `getPrevNext`, `getActiveSection`, `flatten`).
- `src/layouts/Layout.astro` composes Header / Sidebar / Breadcrumbs / PageFooter at build time.
- `npm run build` produces the new structure cleanly.
- Sample page (`src/pages/governance/data-stewardship.astro`) uses `<Layout title="...">` only — no `page=`, `section=`, or `PageFooter` props.

## More Information

### References

- [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) — sibling decision; one coordinated migration.
- `public/ui/site.js` lines 13–312 — historical SECTIONS data (the source of truth that became `src/lib/site.ts`).
- `src/components/Layout.astro` — historical minimal Layout (the thing that was rewritten; now lives at `src/layouts/Layout.astro`).
- `astro.config.mjs` — build configuration.
- Astro documentation — components, islands, view transitions, file-based routing.

## Amendments

- **2026-05-18 — Renumbered + relocated.** Previously `source/00-deliverables/governance/information-architecture/0002-idiomatic-astro-refactor.md` (was numbered 0002 within its own folder). ADR numbering is now global across `docs/adr/`.
- **2026-05-25 — Refactored to canonical MADR 4.x format.** Bullet-list metadata moved to YAML frontmatter; status changed from "IMPLEMENTED 2026-05-18" to `accepted` (the closest enum value) with the implementation date recorded in `### Confirmation`. Filename gained the `ADR-` prefix per the `ruflo-adr` `adr-create` skill. Substance unchanged.

## Vote and Dissent

### Resolved during review (2026-05-18)

Open questions in the first draft were walked through and decided. Where the question maps to an Astro / TS convention, the convention was adopted ("follow convention" was the explicit instruction).

1. **Component library structure.** *Resolved: follow Astro convention.* Flat `src/components/` for the 7 reusable components; `Layout.astro` moves from `src/components/` to `src/layouts/` per the documented Astro convention for page shells; TypeScript helpers in `src/lib/`. See "Target architecture" above.
2. **Astro view transitions.** *Resolved: enable.* Astro 4+ ships view transitions as a one-line addition (`<ClientRouter />` in Layout). Idiomatic for modern Astro sites and a clean UX improvement; landing during the refactor avoids touching pages twice.
3. **TypeScript strictness.** *Resolved: enable `strict: true`.* Modern TS default; `site.ts` is the first real TS module in the codebase so setting strict from the start avoids retrofitting.
4. **PR strategy.** *Resolved: N/A.* OPDA doesn't use PRs — direct commits to main. Single atomic commit for the migration (everything staged, one `git commit`, one push, one Cloudflare deploy). Site flips from old to new in one go; trivial revert via `git revert HEAD` if needed.
5. **Visual regression testing.** *Resolved: skip.* Not an Astro convention; adds tooling overhead without proportionate value for a solo-dev project. Eyeball spot checks on a sample of representative pages during step 11 of the migration plan.
6. **Per-page custom CSS.** *Resolved: migrate to component-scoped where reasonable, leave `<style is:global>` for genuinely page-specific overrides.* Astro convention is component-scoped styles; global is opt-in for the genuine global concerns (data-browser CSS, page-specific selectors that can't be expressed in component scope).

### Newly surfaced open questions

1. **No redirects (cross-cutting decision).** External citations and bookmarks pointing to old `/pages/NN-…html` URLs will 404 after migration. Decided 2026-05-18: accept the breakage. Pre-deploy task: audit OPDA-controlled materials (briefings, member-firm comms, openpropdata.org.uk) for old URLs to update directly. See [`docs/external-materials-audit-checklist.md`](../external-materials-audit-checklist.md).
2. **`src/lib/` naming.** Some Astro projects use `src/utils/` instead of `src/lib/`. Both are conventional; pick one and stick to it. Default: `src/lib/` (slightly more conventional for "things modules import", less for tiny helpers).
