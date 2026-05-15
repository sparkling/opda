---
name: opda-design
description: Use this skill to generate well-branded interfaces and assets for the OPDA Knowledge Base — the documentation hub for the Open Property Data Association's linked-data evolution of the UK Property Data Trust Framework. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping doc pages, governance overviews, schema browsers and design-system reference surfaces in the warm-canvas, terracotta-accent, slab-serif editorial style.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available
files. The visual language is a Claude-inspired (but legally distinct) warm-
canvas + terracotta + slab-serif editorial system, with hard constraints on
which type and marks may ship.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy
assets out and create static HTML files for the user to view. Load
`design-system.css` (which imports `colors_and_type.css` and the bundled
woff2 fonts in `fonts/`) and use the existing class hooks:

- Chrome: `.app-header` `.app-sidebar` `.toc` `.app-main` `.app-body`
- Prose: `.prose` `.lead` `.page-meta` `.page-footer`
- Containers: `.card` `.card-grid` `.home-section-card` `.hero`
- Pull-outs: `.callout` (+ `--note/--key/--warn/--success/--danger`)
- Tags: `.pill` (+ `--brand/--info/--success/--warn/--accent`)
- Actions: `.cta` `.btn` `.btn--ghost` `.btn--quiet`
- Data: `.data-browser` `.db-toolbar` `.db-table` `.db-pagination` `.enum-pill`
- Modelling: `.overlay-catalogue`

Reference high-fidelity pages live in `ui_kits/opda-knowledge-base/`:
`index.html`, `governance.html`, `modelling.html`, `design-system.html`. Copy
the patterns from these instead of inventing new layouts — that's the whole
point of the restyle constraint.

Hard rules to never break:
- No Anthropic logos, wordmarks, or radial-spike marks.
- No licensed typefaces (Tiempos, Copernicus, Söhne). Only the three faces
  bundled in `fonts/`: **Fraunces** (serif display), **Inter** (sans),
  **JetBrains Mono** (mono).
- No emoji.
- Tight corner radii (3 / 4 / 6 / 8 px — never pill-shaped except enum chips).
- Cream canvas, never white. Terracotta is the *only* brand accent. Greys
  carry warmth.
- Editorial-authoritative voice: no "we / our", no exclamation marks, British
  spellings, plain English with parenthetical citations.

If the user invokes this skill without any other guidance, ask them what they
want to build or design, ask some questions (what page or surface? what
content? do they want a single page or a flow?), and act as an expert designer
who outputs HTML artifacts — or production CSS — depending on the need.

If working on the production OPDA codebase ([`sparkling/opda`](https://github.com/sparkling/opda)),
the deliverable is a drop-in restyle: copy `colors_and_type.css` and
`design-system.css` into `docs/ui/` (overwriting the existing files), and copy
`fonts/*.woff2` into `docs/ui/fonts/`. All existing HTML keeps working because
the class names did not change.
