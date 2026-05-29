---
status: accepted
date: 2026-05-29
tags: [design-system, css, tailwind, build-pipeline, governance, reference]
supersedes: []
depends-on: []
implements: []
---

# The CSS architecture: Claude Design is authoritative; Tailwind is a scoped guest

> **This ADR is the authoritative reference for how the OPDA Knowledge Base design
> system works** — the visual language, the scoping model, how Tailwind sits under
> it, the cascade contract, and the findings + fix from the 2026-05-29 design-system
> review. If CSS behaves unexpectedly, start here.

## Context and Problem Statement

The site has **one** authoritative visual system — "Claude Design", a warm-canvas /
terracotta / Fraunces-serif **editorial** language. It was hand-authored with a hard
brief constraint: **no CSS framework**. Tailwind was later added anyway, in two
un-recorded steps, and its base reset began silently overriding element defaults the
hand-authored system relied on — surfacing as a visible bug (prose list markers
vanished) and a deeper question: *do we have multiple conflicting design systems?*
This ADR answers that, records how the architecture actually works, and fixes it.

## How the design system works (authoritative reference)

### 1. The visual language — "Claude Design"
Warm cream canvas (`#faf9f5`, never white), terracotta (`#cc785c`) as the **only**
brand accent, Fraunces serif display + Inter body + JetBrains Mono, tight radii
(≤8px), hairlines not shadows, editorial-authoritative tone. Specified in
[`DESIGN.md`](../../DESIGN.md), `design/README.md`, `design/SKILL.md`,
`CLAUDE-DESIGN-BRIEF.md`. *"Inspired-by, not derived-from"* Anthropic's Claude
surface — ships zero Anthropic marks/fonts.

### 2. The files that ship (and the source of truth)
| File | Role | Status |
|---|---|---|
| `public/ui/design-system.css` (~2400 ln) | Components, layout, `.prose`, chrome | **LIVE — canonical source of truth** |
| `public/ui/design-tokens.css` (~480 ln) | `--color-*`, `--space-*`, `--terracotta-*`, type scale, light+dark | LIVE (imported by design-system.css) |
| `public/ui/tailwind.built.css` | Tailwind v4 output (theme + Preflight + utilities) | LIVE — generated from `src/styles/global.css`, gitignored |
| `@tailwindplus/elements` (CDN) | TailwindPlus web components (schema toolbar popovers/button-groups) | LIVE |
| `design/design-system.css` (~1257 ln) + `colors_and_type.css` | The original Claude-Design **export** | **FROZEN snapshot** — pre-Tailwind, ~half the size of live; never re-deployed |

**Source of truth: `public/ui/design-system.css`.** The `design/` export has drifted
(it predates the manual section, [ADR-0017](./ADR-0017-manual-component-library.md)
components, dark mode); re-syncing from it would delete ~1150 lines of live styling.
`design/` is a historical reference only — see Rule 4.

### 3. The scoping model — everything is class-scoped, nothing is bare
The design system contains **zero bare-element rules** (no `h1{}`, `ul{}`, `table{}`).
It styles content exclusively through **scoped classes**: `.prose` (57 rules),
`.db-`/`.data-` (81), `.callout` (15), `.card` (8), `.pill` (6), plus chrome
(`.app-header`, `.app-sidebar`, `.toc`). **Why:** the same HTML elements appear in
two contexts that must look *different* — long-form **document content** (richly,
editorially styled) vs **UI chrome/components** (e.g. the sidebar `<ul>` and TOC
`<ul>` are deliberately *unstyled*: `.app-sidebar ul { list-style: none }`). The
scope is the disambiguator; this is the standard opt-in-typography (`prose`) pattern.

### 4. `.prose` — the document-content scope
`.prose` (defined `public/ui/design-system.css:649`) is the editorial reading column
(`max-width: 44rem`; `.prose.wide` widens it) and styles the headings/paragraphs/
lists/tables/code inside an article. **`Layout.astro` wraps every page's content in
`<article class="prose wide">` by default** (`wrapProse=true`), so virtually all
document content is inside `.prose` and fully covered. It is *not* "outside the design
system" — it *is* the design system's content layer.

### 5. The cascade — why Claude Design wins
`public/ui/design-system.css` is **entirely unlayered** (zero `@layer`).
`tailwind.built.css` emits everything in **named layers** (`@layer properties, theme,
base, components, utilities`) — Preflight lives in `@layer base`. Per the CSS cascade,
**unlayered normal declarations always beat layered ones**, regardless of selector
specificity or stylesheet load order. **Therefore Claude Design out-ranks Tailwind's
Preflight, components, and utilities wherever it declares a property** — and the
`<link>` order (design-system.css is in fact loaded *before* tailwind.built.css) is
irrelevant. This is the structural guarantee that makes Claude Design authoritative.

### 6. Tailwind's scoped role
Tailwind v4 is a **guest layer** for: (a) **layout utilities** (`flex`, `gap-*`,
`py-*` — ~600 usages, additive, on containers the design system doesn't style), and
(b) **TailwindPlus components** (`@tailwindplus/elements`: the schema-toolbar
popovers and icon button-groups). **Preflight is enabled** because those components
need it — without it, native `<input>`/`<button>` borders double up with Tailwind's
`inset-ring` ("brutalist" look). Preflight is harmless to Claude Design *because the
design system is unlayered and out-ranks it* — provided the design system declares
every element property it relies on (the contract below).

## Decision Drivers
* Claude Design must be authoritative for the overall look (the brief; the user's frame).
* TailwindPlus components need Preflight; skip-preflight is no longer viable.
* Robustness against silent regressions of this class.
* Minimal complexity — a static docs site, not a component platform.
* Resolve the canonical-vs-live source-of-truth ambiguity.

## Considered Options
* **A — Keep Preflight; design-system stays unlayered + explicitly owns every element default it relies on (chosen).** Preflight stays global/layered (TailwindPlus works). Because unlayered design-system already wins, the only obligation is to declare defaults explicitly. Plus declare the source of truth.
* **B — Wrap `design-system.css` in a late `@layer`.** Rejected: *unnecessary* (unlayered already beats layered) **and harmful** — layering it would make it compete with Tailwind *utilities* by layer order, forcing a 600-usage audit + scattered `!` modifiers.
* **C — Revert to skip-preflight + per-component resets on the toolbar.** Rejected: reintroduces the native border-doubling that motivated enabling Preflight.
* **D — Scope Preflight (`:where(.toolbar)`).** Rejected: Preflight isn't designed to be scoped; maintaining a forked subset across upgrades is fragile.
* **E — Status quo.** Rejected: implicit-default gaps keep silently breaking the system.

## Decision Outcome

Chosen: **A.** Claude Design (`public/ui/design-system.css`, unlayered) is the
**authoritative** system and is already cascade-dominant. Tailwind + TailwindPlus are
a **scoped guest layer** for component polish; **Preflight stays enabled**. The design
system's responsibility is to **explicitly declare every element property it relies
on** rather than inherit a browser default Preflight resets. No `@layer` restructuring,
no load-order change. This closes the governance gap left by `556f340`/`8e9fbed`
(a framework adopted with no ADR).

### Rules (the cascade contract)
1. **Authoritative system.** `public/ui/design-system.css` (+ `design-tokens.css`) is the single source of truth. It is **unlayered** and MUST remain so — that is what makes it out-rank Tailwind's layered Preflight/components/utilities.
2. **Preflight is a guest.** Preflight may zero a browser-native element default **only** where the design system has explicitly re-declared the value. **No element may rely on a browser default that Preflight resets** (`list-style`, heading `font-size`/`weight`/`margin`, `table` `border-collapse`, `hr`, `blockquote` margins, …) unless `design-system.css`/`design-tokens.css` sets it explicitly.
3. **Preflight mode is load-bearing.** `global.css` MUST keep full Preflight (`@import "tailwindcss"`); switching to skip-preflight requires re-fixing the TailwindPlus toolbar and updating this ADR.
4. **`design/` is a frozen snapshot.** The `design/` export is the pre-Tailwind reference; it is **never** re-imported or deployed over `public/ui/`. A header note in the file records this.
5. **Scope everything.** New content/components are styled via a scope (`.prose` or a component class), never via bare-element rules — preserving the document-vs-chrome separation.

### The fix, and the audit (the path forward)
**The one code fix needed — applied** (`public/ui/design-system.css`):
```css
.prose ul { list-style-type: disc; }
.prose ul ul { list-style-type: circle; }
.prose ul ul ul { list-style-type: square; }
.prose ol { list-style-type: decimal; }
```
**Audit of the other theorised casualties — none manifest, no further code fix needed:**

| Element | Audit finding | Action |
|---|---|---|
| `ul`/`ol` markers | the real bug — colour set, type not | **Fixed** (above) |
| `h1–h6`/`table`/`code`/`blockquote` outside `.prose` | **no page renders content outside `.prose`** (zero `wrapProse={false}`); components render in-prose or via `.db-table` | none |
| `hr` | styled nowhere, but **no content uses thematic breaks** (every file = 2 `---` frontmatter only) | add `.prose hr` when first authored |

The remainder of this ADR is **preventive** (the contract) + **governance** (corrected
the inverted `global.css` cascade comment; declared the source of truth) — not
outstanding repairs.

### Consequences
* Good — Claude Design is authoritative *by construction* (unlayered): no `!important`, no layer gymnastics, no load-order dependence.
* Good — TailwindPlus components keep their Preflight baseline; nothing regresses.
* Good — the fix is minimal (declare the defaults; lists done) and the source-of-truth drift is resolved.
* Bad — "don't rely on a browser default Preflight resets" is an invariant contributors must remember. Mitigation: the `global.css` header note + this ADR + the §Rules contract.
* Neutral — Tailwind stays despite the original "no framework" brief; accepted as a deliberate, now-recorded trade for component fidelity (the brief predates the TailwindPlus adoption).

### Confirmation
1. `.prose ul` computes `list-style-type: disc`, nested → `circle`, markers terracotta (verified in-browser, both modes).
2. `tailwind.built.css` Preflight is in `@layer base`; `design-system.css` has zero `@layer` (verified) — design-system wins by being unlayered, independent of load order.
3. Audit confirms no out-of-`.prose` casualties manifest (verified: no `wrapProse={false}`; no `hr` usage; component tables render).

## Session findings — the 2026-05-29 design-system review (the record)

* **Timeline (verified from git):** `f29271f` added Claude Design (hand-authored, no framework) → `556f340` "Add Tailwind v4 alongside the existing design system" (deliberately **skip-preflight**, layout utilities only, *"so Tailwind's reset doesn't clobber .prose / .db-table"*) → `8e9fbed` adopted `@tailwindplus/elements` for the schema toolbar and **enabled full Preflight** (to stop native input/button border-doubling). **No ADR recorded either Tailwind step** — this ADR closes that gap.
* **The bug:** prose lists lost their markers. Cause: `design-system.css` set the marker *colour* (`.prose ul li::marker { color: terracotta }`) but never `list-style-type`, relying on the browser default. Preflight's `ol,ul,menu{list-style:none}` removed that default. *A gap, not a specificity/order conflict.*
* **"Multiple conflicting design systems?"** Not two rival branded systems — **one authoritative editorial system (Claude Design) with Tailwind layered underneath** (against the original brief), conflicting only at Preflight's base-reset layer, plus a stale `design/` export. Resolved by this ADR.
* **`.prose` clarification:** it is the design system's document-content scope (not "outside" it); almost all content is inside it via Layout's default wrap.

## More Information
* **Authoritative system files:** `public/ui/design-system.css` (+ `design-tokens.css`); brief in [`DESIGN.md`](../../DESIGN.md), `design/README.md`, `design/SKILL.md`, `CLAUDE-DESIGN-BRIEF.md`.
* **Tailwind input:** `src/styles/global.css` (`@import "tailwindcss"`, see its header note) → `public/ui/tailwind.built.css` (built by `pnpm run css`).
* **History:** commits `556f340` (Tailwind v4 skip-preflight) → `8e9fbed` (TailwindPlus, full Preflight). Neither had an ADR; this record closes that gap.
* **Related (not superseded):** [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) (Astro architecture), [ADR-0017](./ADR-0017-manual-component-library.md) (component library + accent tokens — cross-reference this ADR for the Preflight boundary).
