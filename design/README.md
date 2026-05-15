# OPDA Knowledge Base — Design System

A warm-canvas, terracotta-accent, slab-serif editorial visual language for the
**Open Property Data Association** documentation site. The system is a *restyle*
of the existing PDTF Knowledge Base — every class hook (`.home-hero`,
`.callout--key`, `.pill--brand`, `.data-browser`, `.enum-pill`, the lot) keeps
working. Markup, JS structure, and page IDs are unchanged; only the CSS layer
is new.

> **Inspired-by, not derived-from.** The aesthetic borrows from Anthropic's
> Claude marketing surface — cream canvas, terracotta accent, editorial slab
> serif headings — but ships zero Anthropic logos, wordmarks, radial-spike
> marks, or licensed typefaces. The OPDA wordmark is set in Fraunces; no icon
> or symbol is ever paired with it.

## What this is for

A static HTML / vanilla JS docs site serving four overlapping audiences:

- **UK government** (MHCLG, DSIT, DBT, HMLR, NTSELAT, FCA, ICO)
- **Lenders & mortgage administrators**
- **Conveyancers & surveyors**
- **Estate agents & proptech firms**

Tone is editorial-authoritative. Treat every page like a policy document with
opinions: opinions are typeset in serif italic; facts are typeset in sans;
schema fragments are typeset in mono.

## Sources

- **GitHub** — [`sparkling/opda`](https://github.com/sparkling/opda) (the
  Knowledge Base codebase: Astro 4, vanilla JS, Mermaid, JSON Crack). The
  upstream design system that this project restyles lives under
  [`docs/ui/design-system.css`](https://github.com/sparkling/opda/blob/main/docs/ui/design-system.css)
  and [`docs/ui/design-tokens.css`](https://github.com/sparkling/opda/blob/main/docs/ui/design-tokens.css).
- **Related** — [`Property-Data-Trust-Framework/schemas`](https://github.com/Property-Data-Trust-Framework/schemas)
  (PDTF schemas + overlays), [`Property-Data-Trust-Framework/web`](https://github.com/Property-Data-Trust-Framework/web)
  (propdata.org.uk informational site), [`Property-Data-Trust-Framework/api`](https://github.com/Property-Data-Trust-Framework/api).
- **Live site** — [opda-kb.pages.dev](https://opda-kb.pages.dev).

If you'd like to dig deeper, the repos above hold every page, schema overlay,
and Mermaid diagram source the production site builds from. The four
representative pages in `ui_kits/opda-knowledge-base/` cover every distinct
layout pattern.

## Index

| File                                  | Purpose                                |
|---------------------------------------|----------------------------------------|
| `README.md`                           | This file                              |
| `SKILL.md`                            | Agent-skill entry point                |
| `colors_and_type.css`                 | Tokens + `@font-face` declarations     |
| `design-system.css`                   | Components, layout, prose, chrome      |
| `fonts/`                              | Bundled woff2 — Fraunces, Inter, JBM   |
| `preview/`                            | 19 Design-System-tab specimen cards    |
| `ui_kits/opda-knowledge-base/`        | Four high-fi page recreations          |

## Design-system specimens (`preview/`)

- **Colors** — `colors-terracotta.html`, `colors-neutrals.html`, `colors-semantic.html`
- **Type** — `type-display.html`, `type-scale.html`, `type-editorial.html`, `type-mono.html`
- **Spacing** — `spacing-scale.html`, `radii.html`, `elevation.html`
- **Components** — `components-buttons.html`, `-pills.html`, `-callouts.html`,
  `-card.html`, `-section-card.html`, `-inputs.html`, `-table.html`, `-header.html`
- **Brand** — `brand-wordmark.html`

Each is a small standalone HTML file that loads `colors_and_type.css` (or the
full `design-system.css` for component specimens). They're what populates the
Design System tab.

## CONTENT FUNDAMENTALS

The OPDA voice is **editorial-authoritative**: an op-ed editor's tone, not a
product-marketer's tone. Pages are framed as artefacts in an evidence chain,
not as features in a brochure.

### Voice rules

- **Plain English over jargon.** When a domain term is unavoidable (TA6, BASPI,
  SHACL, ToIP), introduce it once, then use the acronym. Glossary lives at
  `pages/10-glossary.html` and is linked from the footer.
- **No "we / our".** The site speaks *about* OPDA, not *as* OPDA. Use "OPDA",
  "members", "the Sandbox" — never "we". Exception: governance documents
  attributed to a committee may use "we" in scope of that committee.
- **Address the reader as "you" sparingly,** mostly in implementation guides
  ("install `@pdtf/schemas`", "validate against the composed schema"). Never in
  governance prose.
- **Past tense for facts, present for state, future-conditional for plans.**
  "DPMSG was constituted in 2024 with 14 founding members" / "OPDA hosts six
  working groups" / "Phase 2 would require a published conformance scheme".
- **Numbers as numerals from 10 up.** "13 founding members", "8,458 schema
  properties", "554 SKOS concepts". Spell out under ten in body prose unless
  it's a measurement.
- **British English.** "Modelling", "behaviour", "organisation". Two
  exceptions: file paths and code identifiers stay literal ("modeling.ts" if
  that's the file).
- **Title case for page titles, sentence case for everything below H1.**
  "Trust Framework Sandbox" (H1) → "How members prove they meet the standard"
  (H3).

### Hard "no"s

- **No emoji.** Anywhere. The tone is policy-paper. Bullet markers, list
  bullets, and pill chips carry visual rhythm.
- **No exclamation marks** outside of recovered third-party quotations.
- **No casual qualifiers.** Strike "amazing", "powerful", "robust", "best-in-
  class", "next-generation".
- **No first-person plural marketing voice** ("we believe", "we're excited to").

### Examples (lifted from the live copy)

> Two workstreams: **Governance** — UK initiative context (DPMSG, DMCC Act
> 2024, Smart Data scheme), Trust Over IP model, conformance, change
> management, lifecycle, risk. **Modelling** — PDTF schemas + overlays,
> bounded contexts, data dictionary (8,458 properties), business glossary
> (554 SKOS concepts), ontology, SHACL, JSON-LD mappings.

> Note: a ~500 MB `source/` directory of cloned upstream repos, transcripts,
> and reference PDFs is kept locally but excluded from git. The deployed site
> doesn't need it — `docs/data/resources/` already bundles the JSON files the
> resource viewer reaches for.

Note the moves: factual frame, parenthetical citations, exact counts,
explanatory parentheses, and an "exception" clause that proves the rule was
considered. That's the voice.

### Pull quotes

The `--key` callout and the `<blockquote>` element are the same idea in two
weights. Use them for the load-bearing claim on a long page. One per page.

## VISUAL FOUNDATIONS

### Colors

- **Canvas** is warm cream `#faf9f5` — never `#ffffff`. The whole page sits on
  one continuous warm field; cards do not introduce a brighter fill, they sit
  on the canvas with a hairline border.
- **Surface-card** `#efe9de` is a *recessed* tint — used for the diagram
  frame, the data-browser toolbar, and the table-header strip. Cards
  themselves stay canvas-coloured.
- **Terracotta `#cc785c`** is the **only** brand accent. It marks: links, the
  active sidebar item, the CTA button, hover borders, and one rule on each
  section card. Avoid using it as a fill on anything bigger than a button.
- **Ink `#141413`** for display headings only. Body copy uses `#3d3d3a`
  (graphite). Captions use `#6c6a64` (stone). Deprecated text uses `#a8a39a`
  (bone). The grey scale carries warmth at every step.
- **Teal `#5db8a6` and amber `#e8a55a`** are editorial second accents, used in
  callouts (success / warn) and as the two non-terracotta section gradients
  on the home page (Engagement, Modelling).
- **Dark mode** is espresso `#181715`, not slate. Terracotta stays as the
  single accent.

### Type

- **Fraunces** — serif display + section heads. Old-style with a slab-leaning
  high-contrast 700-weight cut; substitutes cleanly for licensed Tiempos /
  Copernicus without trespassing on the Anthropic identity.
- **Inter** — sans body, UI text, and all H3 / H4. 400 / 500 / 600 / 700.
- **JetBrains Mono** — code, schema paths, enum chips, eyebrow microcopy.

Tracking: −0.022em on display, −0.012em on H2/H3, +0.08em (with uppercase) on
eyebrow and meta labels. Body line-height 1.6.

### Backgrounds

- **No imagery in chrome.** No hero photos, no full-bleed images, no patterns
  or textures. The cream canvas is the design.
- **One warm radial glow** in the section-page hero — a 360 px terracotta
  radial fading into transparent, top-right. The only background gradient in
  the system.
- **Dark code blocks** sit on the espresso panel (`#181715`) for both modes,
  for contrast against the cream prose.

### Borders & shadows

- **Hairlines, not shadows, at rest.** Every card sits on a 1 px `#e6dfd0`
  border with `box-shadow: none`.
- **Shadow appears only on hover** (`--shadow-md`: a soft warm shadow with a
  long, low-opacity drop). Tab focus uses a 3 px terracotta-tinted ring at
  18 % opacity.
- **Shadow stack** is three steps (`--shadow-sm/md/lg`), all warm-tinted
  (rgba 20,20,19 — the ink colour at low alpha), never cool.

### Corner radii

Editorial = restrained. The whole system tops out at 8 px.

| Token         | Use                              |
|---------------|----------------------------------|
| `--radius-sm` 3 px | Pills, code chips, enum pills |
| `--radius-md` 4 px | Buttons, inputs, callouts     |
| `--radius-lg` 6 px | Cards, data-browser frame     |
| `--radius-xl` 8 px | Hero, large panels             |

Pill chips are *not* pill-shaped (no `border-radius: 999px`). They use 3 px
with uppercase tracking — they read as label tags, not as soft buttons.

### Layout

- **Article width** caps at 44 rem for prose, 78 rem for `prose.wide` (overview
  pages with card grids).
- **Three-column shell** when the right-rail TOC is present:
  sidebar (18 rem) · main · TOC (16 rem). Below 1280 px the TOC drops.
- **Sticky header** at 4 rem, dark espresso. Sticky sidebar full-height on
  desktop. Mobile collapses to a drawer.

### Hover, focus, press

- **Hover** — link colour deepens from terracotta-500 → 700, underline appears
  with a 3 px offset. Cards swap border to terracotta-400 and lift with
  `shadow-md`; no transform. Buttons darken the fill to terracotta-700.
- **Focus-visible** — 2 px terracotta outline at 2 px offset on `theme-toggle`,
  `resource-link`. Inputs use a 3 px ring at 18 % opacity instead of an
  outline.
- **Active / pressed** — buttons get `translateY(1px)`. No scale-down.

### Motion

- Restrained. `--ease: cubic-bezier(0.32, 0.72, 0, 1)`. Durations capped at
  240 ms.
- No bounce. No spring. No looping animation. Diagrams fade in once on
  Mermaid render and then settle.

### Transparency & blur

- **Used twice.** The diagram lightbox overlay (0.9 black backdrop) and the
  modal close-button (0.6 black pill). Nowhere else.
- No frosted glass, no backdrop-filter on chrome. The header is opaque
  espresso, not a translucent overlay.

### Cards

Every card variant follows the same recipe:

- 1 px hairline `#e6dfd0` border, 6 px corners, canvas-coloured fill.
- Pill chip top-left, serif H3, sans body, optional arrow-on-hover bottom-
  right.
- Hover → terracotta-400 border + `shadow-md`. No transform on resting cards
  (the home section-cards are the one exception — they nudge -2 px on hover
  to read as bigger calls-to-action).

### Imagery character

If photography ever ships (it doesn't yet — placeholder only), it should be
warm-toned, daylight, with light grain. No cool blues, no high-saturation
brand photography, no isolated-on-white product shots. Documentary tone.

## ICONOGRAPHY

The site is **deliberately icon-light**. Editorial chrome avoids the
"feature card with leading icon" pattern entirely. Where iconography appears,
it is:

- **Inline Unicode chevrons and arrows** for navigation affordances. The
  card-arrow is a bare `→` (U+2192) in `var(--terracotta-500)`. The CTA
  buttons use the same. The footer prev/next pair use `←` and `→`. Sort
  indicators in tables use `↑` `↓` `↕`.
- **Inline SVG** for the two theme-toggle glyphs (sun, moon — 16 × 16 stroked
  at 2 px). These are the *only* SVG icons in the design.
- **Status pills + callout labels** carry the role that icons would carry in a
  more typical product UI. "Built", "Stub", "Live", "Note", "Key finding" do
  the lifting.
- **Mermaid diagrams** for any structural or relational drawing. The system
  styles Mermaid via the `.diagram` wrapper and the dark-mode classDef
  remaps.

### What we do NOT use

- **No emoji.** Anywhere. The closest the system gets is the status check
  glyphs `✅ ⏳` lifted in the upstream `governance.html` status table — and
  we deliberately swapped them for `pill--success` / `pill--warn` chips in
  this kit.
- **No icon font.** No Font Awesome, Material Icons, Lucide, Heroicons. The
  bundle stays font-only (Fraunces, Inter, JetBrains Mono).
- **No SVG icon set.** If a future page needs domain icons (a key, a deed,
  a house outline), we'd add them as bespoke SVGs to `assets/` with a usage
  rule — but the current design ships without them on purpose.

### Logos / brand marks

- The **OPDA wordmark** is text — Fraunces 700, tracking −0.022em. Set on
  cream in light mode and on espresso in the header / dark mode. The
  sub-label "Knowledge base" sits beside it at 400 weight, muted.
- **No icon companion** for the wordmark. No radial-spike, no leaf, no
  abstract mark. Inspired-by-Claude only, never derived-from.

## Hard constraints (recap)

- No Anthropic logo, wordmark, or radial-spike mark.
- No licensed typefaces (Tiempos, Copernicus, Söhne).
- No framework introduction (no Tailwind, no React, no CSS-in-JS).
- No HTML / JS structural changes to the existing pages — restyle CSS only.
- Three dark-mode activations preserved: `:root[data-theme=dark]`,
  `prefers-color-scheme:dark`, and the implicit light `:root`.

## Using this in a page

Same import as the upstream system — drop in the CSS and every existing class
hook reads the new tokens:

```html
<link rel="stylesheet" href="design-system.css">
```

If you want the tokens alone (e.g. for a one-off marketing surface):

```html
<link rel="stylesheet" href="colors_and_type.css">
```

The component CSS depends on the tokens. Loading `design-system.css` imports
both.
