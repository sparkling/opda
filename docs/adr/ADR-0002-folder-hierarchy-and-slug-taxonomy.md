---
status: accepted
date: 2026-05-18
tags: [information-architecture, urls, navigation, astro]
supersedes: []
depends-on: [ADR-0001]
implements: []
---

# Folder hierarchy and slug taxonomy

## Context and Problem Statement

The Knowledge Base has **158 published pages**, all living flat under `src/pages/pages/` with numeric filename prefixes (`01-uk-initiative.astro`, `24-data-stewardship.astro`, `38b3-title-oc-owners.astro`).

The prefix `NN-` serves three roles simultaneously:

1. **Filename uniqueness** — slugs alone are unique enough.
2. **Sidebar ordering** — pages sort lexicographically; `site.js` references them by `file: '24-data-stewardship.html'`.
3. **Insertion-slot management** — gaps (16→20, 28→30, 49→50) preserve room for later pages.

URLs follow the filename: `/pages/24-data-stewardship.html`.

[ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) reached "Open question #1 — governance-section renumber" because slotting in Wave 2 pages (DQ, Security, overlay attachments) forces renaming existing files and updating all internal links. The renumber recurs every time content evolves. The handover (2026-05-18) flagged a related symptom: the 14→30 prev/next chain is broken because page numbers, prev/next, and sidebar ordering are all hand-coded into individual page frontmatter.

Specific failures of the numbered-prefix convention:

- **URLs coupled to ordering.** Renumbering breaks external citations.
- **Subpage sprawl.** The title-deeds region runs `38a, 38b1–b7, 38c, 38d, 38e1–e8c, 38f1–f5, 38g` — letters and decimals because integers ran out.
- **No semantic info in URLs.** `/pages/13-data-dictionary.html` — the `13` means nothing to a reader.
- **Contributor cognitive tax.** Every new page draft asks "which number? which gap?". Every single time.
- **Brittle prev/next chains.** Hand-coded `prev` / `next` per page; breaks when order shifts.

What is already right is the taxonomy. `public/ui/site.js` already encodes a thoughtful 8-section taxonomy (Strategy · Governance · Engagement · Modelling · Schema · Implementation · Adoption · Library). The folder hierarchy and URL structure should *mirror* it — not invent a parallel taxonomy alongside numbered filenames.

## Decision Drivers

1. **URL stability.** External citations should not break when content evolves.
2. **Semantic URLs.** `/governance/data-stewardship` carries more meaning than `/pages/24-data-stewardship.html`.
3. **Cheap reordering.** Moving a page in the sidebar should be one config change, not N file renames.
4. **No more renumbering projects.** Solve the root cause once.
5. **Minimal disruption to contributors.** The existing taxonomy is good; don't reinvent it.
6. **Reversible.** If this is wrong, going back must not be catastrophic.

## Considered Options

* **A — Do nothing; renumber as planned.** The pre-existing "full renumber all 158 pages" decision from [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md). Solves the immediate Wave 2 problem; defers the structural issue. Renumbering will be required again every content evolution.
* **B — Decouple URL from filename (Astro slug override).** Keep numbered filenames; configure Astro to expose `/governance/data-stewardship` regardless of filename. Partial win — URLs become stable, but numbered filenames remain (still produces subpage sprawl, still requires contributor number-discipline). Defers the deeper problem.
* **C — Drop numbers, mirror section taxonomy in folder hierarchy (chosen).** Migrate all 158 pages to a folder structure mirroring `site.js` SECTIONS. Numbers gone entirely; ordering controlled solely by `site.js` SECTIONS array order. `site.js` becomes the single source of truth for sidebar order and prev/next chains.

## Decision Outcome

Chosen option: **C — Drop numbers, mirror section taxonomy in folder hierarchy**, because numbered filenames are themselves the problem, not just their use as URLs. The subpage sprawl, contributor tax, and chain-break recurrence persist under option B. C addresses the root cause.

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
2. **Section landing pages move into the folder as `index.astro`.** `src/pages/governance.astro` → `src/pages/governance/index.astro`.
3. **Within a section, default to flat.** Pages live directly in the section folder. Only nest into sub-folders where the conceptual hierarchy genuinely has depth (schema's title/lease/managed tree).
4. **Sub-folder structure mirrors `site.js` group nesting.** Schema currently has `Property > Legal estate & title > Title > OC summary > [pages]`. That becomes `schema/legal-estate/title/oc-summary/oc-owners.astro` etc.
5. **Section overview / landing is always `index.astro`.**

### Slug naming rules

1. **Lowercase, hyphenated.** Existing convention; no change.
2. **No number prefixes.** `24-data-stewardship.astro` → `data-stewardship.astro`.
3. **Drop section prefix where redundant.** The section is in the URL path, so `governance-data-stewardship` collapses to `data-stewardship`. Section context is implicit from the folder.
4. **Slugs unique within folder, not globally.** Different folders can have the same leaf slug if it makes sense (e.g. both `governance/overview.astro` and `schema/overview.astro` could coexist; resolved by folder context).
5. **Section overview slug is the section name itself.** `/governance/` resolves to `src/pages/governance/index.astro`; there's no `/governance/governance` or `/governance/overview`.

### Worked examples — current page → new location

| Current | New file | New URL |
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

1. **Drop the `/pages/` prefix entirely.** Astro's file-based routing turns `src/pages/governance/data-stewardship.astro` into the URL `/governance/data-stewardship` (with `build.format: 'directory'`). The `/pages/` segment in the old URLs was a historical artefact from the pre-Astro flat structure.
2. **Bare-slug URLs.** `astro.config.mjs` sets `build.format: 'directory'`. URLs become `/governance/data-stewardship` (no `.html`, no trailing slash). Cloudflare canonicalises trailing-slash variants. See §"Vote and Dissent" resolved #1.
3. **No redirects.** Old `/pages/NN-…html` URLs hard-404 after migration. Pre-deploy task: scan and update OPDA-controlled materials per [`docs/external-materials-audit-checklist.md`](../external-materials-audit-checklist.md). See §"Vote and Dissent" newly-resolved #2.

### Migration plan

Single-shot migration; not page-by-page (too much intermediate broken state).

1. **Decide on `.html` suffix vs trailing-slash.** One config change in `astro.config.mjs`.
2. **Build the mapping table.** Script walks `site.js` SECTIONS and produces `old_path → new_path → old_url → new_url`. One row per page.
3. **Move files.** `git mv` each page; preserve git blame history.
4. **Move section landings.** `git mv src/pages/governance.astro src/pages/governance/index.astro`. Same for the other 7.
5. **Rewrite `site.js`.** Replace `file: '24-data-stewardship.html'` with the new path form. Auto-derived from the mapping table.
6. **Strip prev/next frontmatter.** Each page removes its `PageFooter prev={...} next={...}` props; `PageFooter` reads from `site.js` at runtime.
7. **Rewrite cross-references.** `sed` script across all pages: `<a href="14-business-glossary.html">` → `<a href="/modelling/business-glossary">`.
8. **Build and verify.** `npm run build` produces the new structure. Spot-check sample URLs (old → 404; new resolves; cross-references work).
9. **Deploy.** Cloudflare Pages picks up the new structure on push.

Estimated effort at the time of decision: 4–8 hours. Actual cost was shared with [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) (single atomic commit per §"Vote and Dissent" newly-resolved #1).

### Consequences

* Good, because URLs are stable forever — page reordering, content evolution, new pages — none touch URLs.
* Good, because the renumbering decision retires permanently.
* Good, because cleaner contributor experience — new pages get a folder and slug; no number-allocation game.
* Good, because semantic URLs — `/governance/data-stewardship` communicates content position.
* Good, because single source of truth — `site.js` SECTIONS controls order; chain-break bugs structurally eliminated.
* Good, because better SEO and citation behaviour — slug URLs index better; external links cite the slug.
* Bad, because migration cost is real — 158 file moves, hundreds of cross-reference rewrites, `site.js` rebuild.
* Bad, because schema section deep nesting — `schema/legal-estate/title/oc-summary/oc-owners` is a long URL. Acceptable trade-off; the conceptual depth is real and folder depth makes it discoverable.
* Bad, because external citations break — existing citations (in OPDA briefings, member-firm docs, regulator submissions, Google search results) point to `/pages/NN-…html` and now 404 (no redirects per §"Vote and Dissent" newly-resolved #2).
* Bad, because reversibility cost — going back requires reversing the migration. The mapping table makes this scriptable, but it's a project, not a quick undo.
* Neutral, because the 8-section taxonomy, page content, build pipeline beyond config tweaks, and reader-facing presentation (sidebar, header nav, breadcrumbs) do not change.

### Confirmation

Shipped 2026-05-18 jointly with [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) in a single atomic commit. Verifiable by:

- `src/pages/` tree mirrors the 8-section taxonomy (no `pages/` subdirectory; section folders exist).
- `astro.config.mjs` has `build.format: 'directory'` (see [`astro.config.mjs`](../../astro.config.mjs) — the file comments reference this ADR).
- `npm run build` succeeds; smoke-check any new URL (`/governance/data-stewardship`) returns 200; any old URL (`/pages/24-data-stewardship.html`) returns 404.
- `src/lib/site.ts` is the typed source-of-truth for sidebar ordering (no hand-coded prev/next anywhere under `src/pages/`).

## More Information

### References

- [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) — surfaced this question via its "Open question #1: governance-section renumber".
- [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) — sibling ADR; expanded migration to include the Astro templating refactor.
- `public/ui/site.js` lines 13–312 — historical SECTIONS taxonomy (the keep-this-as-the-source; now `src/lib/site.ts`).
- `astro.config.mjs` — `build.format` setting (now `'directory'` per §"Vote and Dissent" resolved #1).
- `HANDOVER-2026-05-18-governance.md` — flagged the 14→30 chain break as a symptom of the broader pattern.

## Amendments

- **2026-05-18 — Renumbered + relocated.** Previously `source/00-deliverables/governance/information-architecture/0001-folder-hierarchy-and-slug-taxonomy.md` (was numbered 0001 within its own folder). ADR numbering is now global across `docs/adr/`.
- **2026-05-25 — Refactored to canonical MADR 4.x format.** Bullet-list metadata moved to YAML frontmatter; status changed from "IMPLEMENTED 2026-05-18" to `accepted` (the closest enum value) with the implementation date recorded in `### Confirmation`. Filename gained the `ADR-` prefix per the `ruflo-adr` `adr-create` skill. Substance unchanged.

## Vote and Dissent

### Resolved during review (2026-05-18)

The six open questions in the first draft were walked through and decided. Outcomes recorded here so the next reader doesn't re-litigate.

1. **`.html` suffix vs trailing slash vs bare slug.** *Resolved: bare slug.* URLs become `/governance/data-stewardship` (no `.html`, no trailing slash). `astro.config.mjs` sets `build.format: 'directory'`. Cloudflare canonicalises trailing-slash variants. What Stripe / MDN / React.dev use.

2. **Section landing page URL.** *Resolved: implicit `/governance`* (Astro `index.astro` convention). Section name is the URL; landing lives at `src/pages/governance/index.astro`. Matches Astro convention and modern docs sites.

3. **Cross-section reference items (glossary, project-roadmap, design-system).** *Resolved: mixed by role.* `glossary` at top-level `/glossary` (cross-section utility); `project-roadmap` folded into Strategy at `/strategy/project-roadmap` (drops the dual-home); `design-system` at top-level `/design-system` (developer infra).

4. **Schema section deep nesting.** *Resolved: keep deep nesting up to 5 levels.* Folder hierarchy mirrors the conceptual hierarchy of the title/lease/managed tree. Long URLs but semantic; what Stripe API docs and similar deep references do.

5. **Page IDs in `site.js`.** *Resolved by [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md).* `site.js` becomes `site.ts`; `id` field is dropped entirely; Layout introspects `Astro.url.pathname` and matches against SECTIONS automatically. No `page=` prop needed on individual pages. See [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) §"Data layer" and §"Page authoring after the refactor".

6. **Migration window.** *Open at the time of original drafting — addressed in "Newly resolved" below.*

### Newly resolved during review (2026-05-18)

The three newly-surfaced questions were walked through and decided.

1. **Migration commit strategy.** *Resolved: single atomic commit.* OPDA doesn't use PRs (direct commits to main). Everything staged, one `git commit`, one push, one Cloudflare deploy. Site flips from old to new in one go; trivial revert via `git revert HEAD`. Mid-migration broken state avoided entirely.

2. **`_redirects` policy.** *Resolved: no redirects.* Old `/pages/NN-…html` URLs will 404 after migration. External citations and bookmarks break. Trade-off accepted in exchange for simpler migration and cleaner production state.

3. **External citations audit.** *Resolved: yes, as pre-deploy task.* Because there are no redirects, OPDA-controlled materials pointing to old URLs will hard-break. Pre-deploy step: scan briefings, member-firm comms, openpropdata.org.uk, propdata.org.uk, and other OPDA-owned channels for `/pages/NN-…html` references and update directly. See [`docs/external-materials-audit-checklist.md`](../external-materials-audit-checklist.md).
