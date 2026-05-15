# Claude Design — OPDA Knowledge Base setup brief

Paste-ready content for the **Set up your design system** form at
[claude.ai/design](https://claude.ai/design) → **Design systems** tab → *New
design system*. Once saved, this design system becomes selectable in the
*Design system* dropdown on every new prototype.

This brief covers only the fields available in the form as of this session
(no "Link code on GitHub" option present in the user's UI). If that option
appears later, the value to paste is `https://github.com/sparkling/opda`.

---

## Field 1 — Company name and blurb (or name of design system)

```
OPDA Knowledge Base — Claude visual language

OPDA (Open Property Data Association) Knowledge Base, the documentation hub for the linked-data evolution of the UK Property Data Trust Framework. Static HTML + vanilla JS site for government, finance, banking, estate-agent and surveying stakeholders. Applying a warm-canvas, terracotta-accent, slab-serif editorial system (Claude-inspired, inspired-by only — not Anthropic's identity).
```

---

## Field 2 — Link code from your computer

**Drag this folder:**

```
~/source/opda/docs/
```

That folder is the entire site: 12 top-level HTML pages, 41 topic pages under
`pages/`, the CSS tokens (`ui/design-tokens.css`), the component CSS
(`ui/design-system.css`), and the chrome JS. Skipping the repo root keeps
Python scripts, the gitignored 500 MB `source/` archive, and the data
bundles out of the upload.

If `docs/` is still too large for Claude Design, fall back to:

```
~/source/opda/docs/ui/          ← tokens + components only
+ a handful of pages: index.html, design-system.html, modelling.html
```

That subset gives the model the design language plus three canonical page
shapes (landing, component catalog, section landing).

---

## Field 3 — Upload a .fig file

**Skip.** No Figma source exists for this project.

---

## Field 4 — Add fonts, logos and assets

**Upload these 10 font files** from `~/source/opda/docs/ui/fonts/` (already
downloaded, ~228 KB total, all SIL Open Font License, free to ship):

```
Fraunces-400.woff2          ← display serif, regular
Fraunces-400-italic.woff2   ← display serif, regular italic
Fraunces-600.woff2          ← display serif, semibold
Fraunces-700.woff2          ← display serif, bold
Inter-400.woff2             ← body sans
Inter-500.woff2             ← body sans, medium
Inter-600.woff2             ← body sans, semibold
Inter-700.woff2             ← body sans, bold
JetBrainsMono-400.woff2     ← monospace, regular
JetBrainsMono-700.woff2     ← monospace, bold
```

These are the open substitutes for Anthropic's licensed faces:

- **Fraunces** replaces Tiempos Headline / Copernicus (slab-serif display).
  Closer in voice than Charter or PT Serif.
- **Inter** replaces Styrene (humanist sans body). Already in the live site's
  `--font-sans` fallback chain.
- **JetBrains Mono** for code blocks.

`NOTICE.md` in the same folder records the OFL provenance — keep it alongside
the files when uploading so the license terms travel with the deliverable.

**Do not upload the Anthropic radial-spike mark or any Anthropic typography.**
Trademark belongs to Anthropic. This is inspired-by only.

**Optional:** if you have an OPDA brand mark anywhere on disk, drop it here.
None exists in the repo today.

---

## Field 5 — Any other notes?

This is the highest-value field on the page. Paste this verbatim:

```
Visual language is defined in DESIGN.md at the repo root. Core tokens:
canvas #faf9f5 (cream), surface-card #efe9de, primary #cc785c (terracotta),
primary-active #a9583e, ink #141413, body #3d3d3a, muted #6c6a64,
surface-dark #181715, accent-teal #5db8a6, accent-amber #e8a55a.

Type stack (open substitutes for Anthropic's licensed faces — uploaded as
font files in this design system):
- Display serif: Fraunces (weights 400 / 600 / 700, plus 400 italic)
- Body sans: Inter (weights 400 / 500 / 600 / 700)
- Mono: JetBrains Mono (weights 400 / 700)
Do NOT specify Tiempos Headline / Copernicus / Styrene in CSS — those are
licensed Klim faces and cannot ship.

This is a RESTYLE, not a redesign — preserve page structure, hero copy,
card grids, callouts, pills, data tables. Component class hooks that must
keep working: .home-hero, .home-section-card, .card, .card-grid, .callout
(+ --note/--key/--warn/--success/--danger), .pill (+ --brand/--accent/--info),
.cta, .lead, .muted, .prose, .data-browser, .overlay-catalogue, .enum-pill,
.mermaid, .diagram.

CSS tokens live in docs/ui/design-tokens.css (light + dark). Token names to
preserve: --color-brand-{50..900}, --color-ink-{0..900},
--color-accent-{100,500,700}, --color-{success,info,warning,danger}-{100,500,700},
--color-surface(-alt/-tint), --color-text(-muted), --color-link(-hover),
--font-{sans,serif,mono}, --text-{xs..5xl}, --space-{1..12},
--radius-{sm..xl}, --shadow-{sm..lg}. Dark mode has three activations:
:root[data-theme="dark"], @media (prefers-color-scheme: dark), and implicit
light :root. Keep all three.

Hard constraints:
- No Anthropic logo, wordmark, or radial-spike mark. Inspired-by only.
- Use the uploaded OFL fonts only — no Tiempos / Copernicus / Styrene.
- No framework introduction (no Tailwind, no React, no CSS-in-JS).
- No HTML or JS structural changes — restyle CSS only.

Stakeholder context: UK government, lenders, conveyancers, surveyors, HMLR.
Tone is editorial-authoritative, not playful.
```

---

## After you save

1. Go back to **Prototype** (left panel).
2. **Project name:** `OPDA Knowledge Base — Claude restyle`.
3. **Design system:** pick the entry you just created (not "Domain Model
   Browser Design System").
4. Keep **High fidelity** selected.
5. Click **Create**.

### First prompt to paste into the new project

```
Recreate the OPDA Knowledge Base in this design system. The live site is
at https://opda-kb.pages.dev/ — start with the homepage (/), then the seven
section landings (Strategy, Governance, Engagement, Modelling, Implementation,
Adoption, Library), then the data-dictionary topic page at
/pages/13-data-dictionary.html.

Preserve the page structure, hero copy, card grids, callouts, pills, tables
and component types — only restyle. No Anthropic logo or wordmark. Output
high-fidelity prototype screens, light and dark.
```

If Claude Design can't fetch the live URL directly from inside the prototype
project, screenshot each canonical page and drag the PNGs in — it works fine
from screenshots and will infer the structure.

---

## Bringing the result back to the repo

Claude Design outputs prototype screens, not CSS. When you're happy with the
look:

1. Export the prototype as PNGs (or share the project URL).
2. Drop them in the Cowork chat with me.
3. I'll translate the visual decisions into a minimal diff against
   `docs/ui/design-tokens.css` and the targeted bits of
   `docs/ui/design-system.css`.
4. `./deploy.sh` ships it to `opda-kb.pages.dev`.

---

## Pages to cover (whole site, for reference)

12 top-level pages and 41 topic pages — all served from `docs/`. Token-level
edits should cascade across all of them.

**Top-level:** `index.html`, `strategy.html`, `governance.html`,
`engagement.html`, `modelling.html`, `implementation.html`, `adoption.html`,
`library.html`, `design-system.html`, `resource.html`, `schema.html`,
`_template.html`.

**Topic pages under `docs/pages/`:** `01-uk-initiative`, `02-legislation`,
`03-departments`, `04-steering-forums`, `05-sandbox`, `06-standards-stack`,
`07-toip-governance`, `08-strategic-alignment`, `09-project-roadmap`,
`10-glossary`, `11-opda-members`, `12-bounded-contexts`, `13-data-dictionary`,
`14-business-glossary`, `16-overlays`, `20-conformance-scheme`,
`21-change-management`, `22-lifecycle-versioning`, `23-risk-liability`,
`30-concept-taxonomy`, `31-ontology`, `32-shacl-shapes`, `33-jsonld-mappings`,
`34-physical-architecture`, `40-engagement-overview`, `41-meetings-decisions`,
`42-working-groups`, `43-video-library`, `44-transcripts`,
`50-adoption-overview`, `51-member-implementations`,
`52-smart-data-challenge`, `53-hmlr-llc`, `54-sandbox-pilots`,
`60-implementation-overview`, `61-quickstart`, `62-schema-composition`,
`63-validation`, `64-verified-claims`, `70-strategy-overview`,
`71-programme-phases`, `72-industrial-strategy`, `80-library-overview`,
`81-document-archive`, `82-transcript-archive`, `83-external-references`.

The three highest-value pages to verify visually in Claude Design's output:

- `index.html` — home hero + seven-section card grid
- `design-system.html` — visual catalog (every component lives here)
- `pages/13-data-dictionary.html` — `data-browser` interactive table
