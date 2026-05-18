# ADR 0001 — Folder hierarchy and slug taxonomy for OPDA Knowledge Base pages

**Status:** Proposed — all open questions decided 2026-05-18 (§"Resolved during review" and §"Newly resolved during review"); migration bundled with ADR 0002 (idiomatic Astro refactor); ready to implement
**Date:** 2026-05-18
**Authors:** Henrik Pettersen, with Claude Opus 4.7
**Related:**
- [governance/dcam-framework/0001-adoption-decision.md](../dcam-framework/0001-adoption-decision.md) — surfaced this question via "Open question #1: governance-section renumber".
- [0002-idiomatic-astro-refactor.md](./0002-idiomatic-astro-refactor.md) — sibling decision; expands migration to bundle the Astro templating refactor in the same pass.
**Supersedes:** none
**Superseded by:** none

## Context

The Knowledge Base has **158 published pages**, all living flat under `src/pages/pages/` with numeric filename prefixes (`01-uk-initiative.astro`, `24-data-stewardship.astro`, `38b3-title-oc-owners.astro`).

The prefix `NN-` serves three roles simultaneously:

1. **Filename uniqueness** — slugs alone are unique enough.
2. **Sidebar ordering** — pages sort lexicographically; `site.js` references them by `file: '24-data-stewardship.html'`.
3. **Insertion-slot management** — gaps (16→20, 28→30, 49→50) preserve room for later pages.

URLs follow the filename: `/pages/24-data-stewardship.html`.

### Why this is the wrong abstraction

ADR `dcam-framework/0001-adoption-decision.md` reached "Open question #1 — governance-section renumber" because slotting in Wave 2 pages (DQ, Security, overlay attachments) forces renaming existing files and updating all internal links. The renumber recurs every time content evolves. The handover (2026-05-18) flagged a related symptom: the 14→30 prev/next chain is broken because page numbers, prev/next, and sidebar ordering are all hand-coded into individual page frontmatter.

Specific failures of the numbered-prefix convention:

- **URLs coupled to ordering.** Renumbering breaks external citations.
- **Subpage sprawl.** The title-deeds region runs `38a, 38b1–b7, 38c, 38d, 38e1–e8c, 38f1–f5, 38g` — letters and decimals because integers ran out.
- **No semantic info in URLs.** `/pages/13-data-dictionary.html` — the `13` means nothing to a reader.
- **Contributor cognitive tax.** Every new page draft asks "which number? which gap?". Every single time.
- **Brittle prev/next chains.** Hand-coded `prev` / `next` per page; breaks when order shifts.

### What's already right — the taxonomy

`public/ui/site.js` already encodes a thoughtful 8-section taxonomy:

| # | Section | Purpose | Sub-groupings |
|---|---|---|---|
| 1 | **Strategy** | Why | Plans · Wider context |
| 2 | **Governance** | Authority | UK initiative · OPDA org · Standards landscape · OPDA's own rules |
| 3 | **Engagement** | Activity | Activity · Content |
| 4 | **Modelling** | What (conceptual) | Foundations · Vocabulary · Formal semantic layer |
| 5 | **Schema** | What (concrete) | Process · Property (deeply nested) · Pack content · Cross-cutting |
| 6 | **Implementation** | How | Getting started · Working with schemas |
| 7 | **Adoption** | Evidence | Pilots · Programmes |
| 8 | **Library** | Archive | Holdings · External |

This taxonomy is good. It survives every page rewrite. The folder hierarchy and URL structure should *mirror* it — not invent a parallel taxonomy alongside numbered filenames.

## Decision drivers

1. **URL stability.** External citations should not break when content evolves.
2. **Semantic URLs.** `/governance/data-stewardship` carries more meaning than `/pages/24-data-stewardship.html`.
3. **Cheap reordering.** Moving a page in the sidebar should be one config change, not N file renames.
4. **No more renumbering projects.** Solve the root cause once.
5. **Minimal disruption to contributors.** The existing taxonomy is good; don't reinvent it.
6. **Reversible.** If this is wrong, going back must not be catastrophic.

## Considered options

### A — Do nothing; renumber as planned

The pre-existing "full renumber all 158 pages" decision from ADR `dcam-framework/0001-adoption-decision.md`. Solves the immediate Wave 2 problem; defers the structural issue. Renumbering will be required again every content evolution.

### B — Decouple URL from filename (Astro slug override)

Keep numbered filenames; configure Astro to expose `/governance/data-stewardship` regardless of filename. Partial win — URLs become stable, but numbered filenames remain (still produces subpage sprawl, still requires contributor number-discipline). Defers the deeper problem.

### C — Drop numbers, mirror section taxonomy in folder hierarchy (**chosen**)

Migrate all 158 pages to a folder structure mirroring `site.js` SECTIONS. Numbers gone entirely; ordering controlled solely by `site.js` SECTIONS array order. `site.js` becomes the single source of truth for sidebar order and prev/next chains.

**Why C over B:** Numbered filenames are themselves the problem, not just their use as URLs. The subpage sprawl, contributor tax, and chain-break recurrence persist under option B. C addresses the root cause.

## Decision

Adopt option C. The detailed rules follow.

### Folder structure rules

1. **One folder per top-level section.** The 8 sections in `site.js` → 8 folders under `src/pages/`:
   ```
   src/pages/
     strategy/
     governance/
     engagement/
     modelling/
     schema/
     implementation/
     adoption/
     library/
   ```

2. **Section landing pages move into the folder as `index.astro`.**
   `src/pages/governance.astro` → `src/pages/governance/index.astro`.
   URL: `/governance/` (depends on `.html` suffix decision — see Open Q #1).

3. **Within a section, default to flat.** Pages live directly in the section folder. Only nest into sub-folders where the conceptual hierarchy genuinely has depth (schema's title/lease/managed tree).

4. **Sub-folder structure mirrors `site.js` group nesting.** Schema currently has `Property > Legal estate & title > Title > OC summary > [pages]`. That becomes:
   ```
   schema/legal-estate/title/oc-summary/oc-owners.astro
   schema/legal-estate/title/oc-summary/oc-charges.astro
   ...
   ```

5. **Section overview / landing is always `index.astro`.** Whether the section is flat (Implementation) or deeply nested (Schema), the section landing is at `{section}/index.astro`.

### Slug naming rules

1. **Lowercase, hyphenated.** Existing convention; no change.

2. **No number prefixes.** `24-data-stewardship.astro` → `data-stewardship.astro`.

3. **Drop section prefix where redundant.** The section is in the URL path, so `governance-data-stewardship` collapses to `data-stewardship`. Section context is implicit from the folder.

4. **Slugs unique within folder, not globally.** Different folders can have the same leaf slug if it makes sense (e.g. both `governance/overview.astro` and `schema/overview.astro` could coexist; resolved by folder context).

5. **Section overview slug is the section name itself.** `/governance/` resolves to `src/pages/governance/index.astro`; there's no `/governance/governance` or `/governance/overview`.

### Worked examples — current page → new location

| Current | New file | New URL (no `.html` variant) |
|---|---|---|
| `pages/01-uk-initiative.astro` | `governance/uk-initiative.astro` | `/governance/uk-initiative` |
| `pages/13-data-dictionary.astro` | `modelling/data-dictionary.astro` | `/modelling/data-dictionary` |
| `pages/24-data-stewardship.astro` | `governance/data-stewardship.astro` | `/governance/data-stewardship` |
| `pages/35-transaction-participants.astro` | `schema/transaction-participants.astro` | `/schema/transaction-participants` |
| `pages/38b3-title-oc-owners.astro` | `schema/legal-estate/title/oc-summary/oc-owners.astro` | `/schema/legal-estate/title/oc-summary/oc-owners` |
| `pages/39d12-survey-valuation.astro` | `schema/built-form/surveys/valuation.astro` | `/schema/built-form/surveys/valuation` |
| `pages/46a2a-la-planning-building.astro` | `schema/local-context/con29r/searches/planning-building.astro` | `/schema/local-context/con29r/searches/planning-building` |
| `pages/61-quickstart.astro` | `implementation/quickstart.astro` | `/implementation/quickstart` |
| `pages/83-external-references.astro` | `library/external-references.astro` | `/library/external-references` |
| `governance.astro` (section landing) | `governance/index.astro` | `/governance/` |

### Ordering and navigation rules

1. **`site.js` is the single source of truth for sidebar order.** No reliance on filename alphabetic sort.

2. **Prev/next links derived dynamically.** Remove hand-coded `prev` / `next` from page frontmatter; `PageFooter` reads order from a flattened view of `site.js` SECTIONS at runtime. Chain-break bugs become structurally impossible.

3. **Cross-section navigation stays explicit.** A page in Modelling that links to a page in Schema uses a normal `<a>` tag with the new URL; no derivation.

### URL shape rules

1. **Drop the `/pages/` prefix entirely.** Astro's file-based routing turns `src/pages/governance/data-stewardship.astro` into the URL `/governance/data-stewardship.html` (with current `build.format: 'file'`). The `/pages/` segment in current URLs was a historical artefact from the pre-Astro flat structure.

2. **`.html` suffix decision (Open Q #1).** Two options:
   - **Keep `.html`** (current convention): `/governance/data-stewardship.html`. Matches Cloudflare Pages defaults; preserves the current URL feel; no Astro config change.
   - **Drop `.html`** via `build.format: 'directory'`: `/governance/data-stewardship/`. Modern; mirrors most docs sites. Requires Astro config change.

   *Recommendation:* drop `.html`. The structural change is the point; doing it half-way (drop numbers, keep `.html`) leaves an inconsistent feel.

3. **Redirects: 1:1 mapping from every old URL to new URL.** Cloudflare Pages `_redirects` at the project root:
   ```
   /pages/24-data-stewardship.html  /governance/data-stewardship  301
   /pages/13-data-dictionary.html   /modelling/data-dictionary    301
   ...
   ```
   Generated programmatically from the mapping table. Indefinite retention.

## Migration plan

Single-shot migration; not page-by-page (too much intermediate broken state).

1. **Decide on `.html` suffix vs trailing-slash.** One config change in `astro.config.mjs`.
2. **Build the mapping table.** Script walks `site.js` SECTIONS and produces `old_path → new_path → old_url → new_url`. One row per page.
3. **Move files.** `git mv` each page; preserve git blame history.
4. **Move section landings.** `git mv src/pages/governance.astro src/pages/governance/index.astro`. Same for the other 7.
5. **Rewrite `site.js`.** Replace `file: '24-data-stewardship.html'` with the new path form. Auto-derived from the mapping table.
6. **Strip prev/next frontmatter.** Each page removes its `PageFooter prev={...} next={...}` props; `PageFooter` reads from `site.js` at runtime.
7. **Rewrite cross-references.** `sed` script across all pages: `<a href="14-business-glossary.html">` → `<a href="/modelling/business-glossary">`.
8. **Generate `_redirects` file.** From the mapping table.
9. **Build and verify.** `npm run build` produces the new structure. Spot-check sample URLs (old → 301 → new; new resolves; cross-references work).
10. **Deploy.** Cloudflare Pages picks up `_redirects`.

Estimated effort: 4–8 hours of careful scripted work for a single contributor.

## Consequences

### Positive

- **URLs stable forever.** Page reordering, content evolution, new pages — none touch URLs.
- **Renumbering decision retired.** Never recurs.
- **Cleaner contributor experience.** New pages get a folder and slug; no number-allocation game.
- **Semantic URLs.** `/governance/data-stewardship` communicates content position.
- **Single source of truth.** `site.js` SECTIONS controls order; chain-break bugs structurally eliminated.
- **Better SEO and citation behaviour.** Slug URLs index better; external links cite the slug.

### Negative / risk

- **Migration cost.** One-time, but real: 158 file moves, hundreds of cross-reference rewrites, `site.js` rebuild, redirect generation.
- **Schema section deep nesting.** `schema/legal-estate/title/oc-summary/oc-owners` is a long URL. Acceptable trade-off — the conceptual depth is real; folder depth makes it discoverable. Could flatten if undesirable (Open Q #4).
- **External citations.** Existing citations (in OPDA briefings, member-firm docs, regulator submissions, Google search results) point to `/pages/NN-...html`. `_redirects` handles transparently, but anything cached or screenshotted shows the old form.
- **Cloudflare Pages redirect limits.** `_redirects` has a 2,100-line limit on the free tier. 158 redirects fits easily; worth noting if many more pages land.
- **Reversibility cost.** Going back requires reversing the migration. The mapping table makes this scriptable, but it's a project, not a quick undo.

### What does NOT change

- The 8-section taxonomy. `site.js` SECTIONS is already correct.
- Page content. This is purely a structural / URL change.
- Build pipeline beyond config tweaks.
- The reader-facing presentation (sidebar, header nav, breadcrumbs).

## Resolved during review (2026-05-18)

The six open questions in the first draft were walked through and decided. Outcomes recorded here so the next reader doesn't re-litigate.

1. **`.html` suffix vs trailing slash vs bare slug.** *Resolved: bare slug.* URLs become `/governance/data-stewardship` (no `.html`, no trailing slash). `astro.config.mjs` sets `build.format: 'directory'`. Cloudflare `_redirects` canonicalises trailing-slash variants. What Stripe / MDN / React.dev use.

2. **Section landing page URL.** *Resolved: implicit `/governance`* (Astro `index.astro` convention). Section name is the URL; landing lives at `src/pages/governance/index.astro`. Matches Astro convention and modern docs sites.

3. **Cross-section reference items (glossary, project-roadmap, design-system).** *Resolved: mixed by role.* `glossary` at top-level `/glossary` (cross-section utility); `project-roadmap` folded into Strategy at `/strategy/project-roadmap` (drops the dual-home); `design-system` at top-level `/design-system` (developer infra).

4. **Schema section deep nesting.** *Resolved: keep deep nesting up to 5 levels.* Folder hierarchy mirrors the conceptual hierarchy of the title/lease/managed tree. Long URLs but semantic; what Stripe API docs and similar deep references do.

5. **Page IDs in `site.js`.** *Resolved by ADR 0002.* `site.js` becomes `site.ts`; `id` field is dropped entirely; Layout introspects `Astro.url.pathname` and matches against SECTIONS automatically. No `page=` prop needed on individual pages. See ADR 0002 §"Data layer" and §"Page authoring after the refactor".

6. **Migration window.** *Open — see below.* Now applies to the combined ADR 0001 + ADR 0002 migration rather than ADR 0001 alone.

## Newly resolved during review (2026-05-18)

The three newly-surfaced questions above were walked through and decided.

1. **Migration commit strategy.** *Resolved: single atomic commit.* OPDA doesn't use PRs (direct commits to main). Everything staged, one `git commit`, one push, one Cloudflare deploy. Site flips from old to new in one go; trivial revert via `git revert HEAD`. Mid-migration broken state avoided entirely.

2. **`_redirects` policy.** *Resolved: no redirects.* Old `/pages/NN-…html` URLs will 404 after migration. External citations and bookmarks break. Trade-off accepted in exchange for simpler migration and cleaner production state.

3. **External citations audit.** *Resolved: yes, as pre-deploy task.* Because there are no redirects, OPDA-controlled materials pointing to old URLs will hard-break. Pre-deploy step: scan briefings, member-firm comms, openpropdata.org.uk, propdata.org.uk, and other OPDA-owned channels for `/pages/NN-…html` references and update directly.

## References

- ADR `governance/dcam-framework/0001-adoption-decision.md` — surfaced this question via "Open question #1: governance-section renumber".
- [`./0002-idiomatic-astro-refactor.md`](./0002-idiomatic-astro-refactor.md) — sibling ADR; expands migration to include the Astro templating refactor.
- `public/ui/site.js` lines 13–312 — current SECTIONS taxonomy (the keep-this-as-the-source).
- `astro.config.mjs` — `build.format` setting (now `'directory'` per Q1 above).
- `HANDOVER-2026-05-18-governance.md` — flagged the 14→30 chain break as a symptom of the broader pattern.

---

*ADR 0001 — Drafted 2026-05-18 by Henrik Pettersen with Claude Opus 4.7. Not yet ratified.*
