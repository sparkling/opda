---
status: proposed
date: 2026-05-28
tags: [website, documentation, integration, content-collections, dark-mode, mermaid]
supersedes: []
depends-on: [ADR-0002, ADR-0003, ADR-0007, ADR-0011]
implements: []
---

# Integrate 4-tier ontology manual into the Astro site

## Context and Problem Statement

The OPDA ontology model is now documented as a 4-tier presentation in `docs/manual/` (228 markdown files + 239 PNG diagrams, all generated from the 24 emitted TTLs per the IA blueprint at `docs/information-architecture/`). The content is currently consumable only via the local HTML export at `docs/manual/_export/` — it is not published to the Astro site at openpropdata.org.uk and not reachable from the production navigation.

The Astro site (per [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md)) is the public delivery channel for OPDA content. It carries:

- 8 top sections per `src/lib/site.ts` (strategy / governance / engagement / modelling / schema / implementation / adoption / library), each with sidebar groups + items declared in TypeScript
- A single `Layout.astro` + ~9 named components (`Diagram`, `Sidebar`, `SidebarItem`, `Header`, `Breadcrumbs`, `PageMeta`, `PageFooter`, `AuthButton`, `Comments`)
- A `data-theme="dark"` attribute-driven token system (NOT `prefers-color-scheme`) — light/dark switched via a top-bar toggle; CSS custom-variant rewires `dark` to `[data-theme="dark"]`
- Mermaid loaded client-side at `public/ui/client.js:228+` (mermaid@11 + `@mermaid-js/layout-elk@0` from CDN, theme `'base'` with `themeVars` per `design/mermaid-theme.js`)
- `Diagram.astro` wrapper component with `size` + `caption` props; mermaid source goes in the slot
- All pages are individual `.astro` files; **no Astro content collections in use yet** — every page is hand-written

The manual material does not fit one-page-per-file at the Astro layer:

- ~41 entities × 3 tiers (Concept + Logical + Physical-Ontology) = ~123 entity files
- 23 SKOS schemes × 2 tiers (Logical enumerations + Physical-Ontology vocabularies) = 46 scheme files
- 15 exemplars × 1 tier (Physical-Ontology) = 15 exemplar files
- 7 modules × 4 tiers = 28 module README pages
- 4 tier READMEs + cross-cutting topic pages (three-graph-separation, severity-tiers, shacl-af-rules, etc.) — ~15 pages
- Total ~227 documentation pages to integrate

Hand-authoring 227 Astro pages would defeat the IA's generation discipline (the manual is meant to be regenerated from the TTLs when the ontology changes — per `docs/information-architecture/README.md` §"Source of truth"). Static `.astro` files per entity break that.

This ADR decides:

1. **Navigation scheme** for surfacing the manual in the public site
2. **Which pages are JSON-driven content collections** vs **which remain static `.astro` authored pages**
3. **How the existing design system + Mermaid + dark/light handling extends** to the new section without duplication

## Decision Drivers

* **Regenerability.** The manual is generated from the TTLs; integrating it shouldn't lock the content into hand-authored `.astro` files that drift from the source.
* **Audience routing.** The umbrella README's tier-table maps audience → tier. The site navigation should mirror that mapping so a visiting surveyor / data engineer / SPARQL consumer lands on the right tier directly.
* **Design coherence.** Existing site has a settled visual language (header / breadcrumbs / sidebar / footer + design tokens + dark/light toggle). The manual must reuse it, not introduce a parallel theme.
* **Mermaid discipline.** Diagrams already render client-side via `public/ui/client.js` + `Diagram.astro`. Manual pages must use the same loader and the same `themeVars` for dark/light coherence — no per-tier mermaid setup, no inline `<script>` mermaid initialisation.
* **`src/lib/site.ts` as single navigation source.** Per [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md), navigation lives in typed TS, not in markdown frontmatter or filesystem walks. The manual integration must extend `site.ts` consistently.
* **No `.astro` files per entity.** Authoring (or regenerating) 41 × 3 = 123 entity `.astro` files is bad ergonomics + bad re-gen story.
* **Content lives in `docs/`, route lives in `src/pages/`.** Per the project structure (`docs/manual/` is the canonical content surface; `src/pages/` is the routing surface). Integration must respect that boundary — Astro reads from `docs/manual/` at build time; nothing in `docs/manual/` becomes the Astro route by accident.

## Considered Options

* **Option A — Hand-author 227 `.astro` files** mirroring the manual structure (one `.astro` per `.md`). Maximum control; zero regenerability; defeats the manual's generation discipline.
* **Option B — Astro content collections sourced from `docs/manual/`** using Zod-validated frontmatter + dynamic-route `[...slug].astro` templates per tier. Per-entity / per-scheme / per-exemplar pages render from markdown + frontmatter. Tier READMEs + IA spec pages + cross-cutting topics are also content-collection entries (single mechanism). Reusable per-tier components (`EntityCard`, `AttributeTable`, `TurtleBlock`, `SchemeMembershipTable`, `ShapeBlock`, `ExemplarReport`) consume the collection data. Single navigation declared in `src/lib/site.ts` extended with a `manual` section.
* **Option C — External docs site (Docusaurus / mkdocs)** at a sub-domain (manual.openpropdata.org.uk). Off-loads the integration entirely. Loses design coherence; duplicates deployment; breaks single-site UX.
* **Option D — Render the manual at build time into the existing `_build/` then iframe-embed in `src/pages/manual/`**. Worst of both — opaque to Astro; no SEO; broken dark-mode coordination.

## Decision Outcome

Chosen option: **B — Astro content collections sourced from `docs/manual/`, with reusable Zod-typed templates per tier + extended `site.ts` navigation + existing components for layout / theme / Mermaid**, because it preserves the regenerability discipline (manual MD is canonical; Astro renders), keeps the design system + dark/light + Mermaid loaders unified, and bounds new authoring to ~12 reusable components + 4 dynamic-route templates instead of 227 hand-authored pages.

### Navigation scheme

`src/lib/site.ts` gains a new `manual` section in `HEADER_ORDER` between `modelling` and `schema`:

```typescript
// HEADER_ORDER updated
export const HEADER_ORDER = [
  'strategy', 'governance', 'engagement',
  'modelling', 'manual', 'schema',           // 'manual' added between modelling + schema
  'implementation', 'adoption', 'library',
] as const;

// SECTIONS.manual added
manual: {
  key: 'manual',
  title: 'Ontology manual',
  summary: 'Four-tier presentation of the OPDA ontology model — concept narrative for SMEs, logical entity-relationship view for engineers, physical deployment topology for triplestore operators, and physical-ontology Turtle for ontology engineers.',
  groups: [
    {
      heading: 'Overview',
      items: [
        { url: '/manual',                       title: 'Section overview' },
        { url: '/manual/information-architecture', title: 'Information architecture' },
        { url: '/manual/validation-report',     title: 'Validation report' },
      ],
    },
    {
      heading: 'Concept tier — for SMEs',
      items: [
        { url: '/manual/concept',               title: 'Tier overview' },
        { url: '/manual/concept/foundation',    title: 'Foundation' },
        { url: '/manual/concept/property',      title: 'Property' },
        { url: '/manual/concept/agent',         title: 'Agent' },
        { url: '/manual/concept/transaction',   title: 'Transaction' },
        { url: '/manual/concept/claim',         title: 'Claim' },
        { url: '/manual/concept/governance',    title: 'Governance' },
        { url: '/manual/concept/descriptive',   title: 'Descriptive' },
      ],
    },
    {
      heading: 'Logical tier — for engineers',
      items: [
        { url: '/manual/logical',               title: 'Tier overview' },
        // (7 module entries, same shape as Concept)
      ],
    },
    {
      heading: 'Physical — deployment',
      items: [
        { url: '/manual/physical-database',                          title: 'Tier overview' },
        { url: '/manual/physical-database/named-graphs',             title: 'Named graphs' },
        { url: '/manual/physical-database/derived-profiles',         title: 'Derived profiles' },
        { url: '/manual/physical-database/content-negotiation',      title: 'Content negotiation' },
        { url: '/manual/physical-database/overlay-deployment/baspi5', title: 'BASPI5 deployment' },
        { url: '/manual/physical-database/operations',               title: 'CI gates' },
        { url: '/manual/physical-database/modules',                  title: 'Per-module deployment views' },
      ],
    },
    {
      heading: 'Physical — ontology',
      items: [
        { url: '/manual/physical-ontology',                       title: 'Tier overview' },
        { url: '/manual/physical-ontology/three-graph-separation', title: 'Three-graph separation' },
        { url: '/manual/physical-ontology/severity-tiers',         title: 'Severity tiers' },
        { url: '/manual/physical-ontology/shacl-af-rules',         title: 'SHACL-AF rules' },
        { url: '/manual/physical-ontology/vocabularies',           title: 'SKOS schemes' },
        { url: '/manual/physical-ontology/profiles/baspi5',        title: 'BASPI5 profile' },
        { url: '/manual/physical-ontology/exemplars',              title: 'Diagnostic exemplars' },
        // (7 module entries below)
      ],
    },
  ],
},
```

The sidebar's heading-group structure surfaces audience routing inline: a reader landing on `/manual` sees the four tiers grouped under audience labels, picks theirs, and drops into the matching tier. Per-module entries within each tier match the `docs/manual/<tier>/<module>/` directory structure.

Header order placement (between `modelling` and `schema`) reflects the manual's purpose: it bridges the modelling-process content (governance, ODR corpus discussion) and the schema-detail content (PDTF JSON schemas, overlay forms).

### JSON-driven content collections (the regenerable bulk)

`src/content/manual/` is a new content collection rooted at the existing `docs/manual/` markdown tree. The collection config (`src/content.config.ts`) declares Zod schemas for the entry types:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseFields = {
  tier: z.enum(['concept', 'logical', 'physical-database', 'physical-ontology']),
  module: z.enum(['foundation', 'property', 'agent', 'transaction', 'claim', 'governance', 'descriptive']).optional(),
  title: z.string(),
  entityUri: z.string().url().optional(),   // opda:<EntityName> URI when applicable
  sourceTtl: z.string().optional(),         // 'source/03-standards/ontology/opda-property.ttl'
  sourceOdr: z.string().optional(),         // dct:source link target
};

const manualEntries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../../docs/manual' }),
  schema: z.object({
    ...baseFields,
    kind: z.enum([
      'tier-readme',
      'module-readme',
      'entity',
      'scheme',
      'exemplar',
      'cross-cutting',      // three-graph-separation.md, severity-tiers.md, shacl-af-rules.md, etc.
      'per-module-deployment',  // physical-database/modules/<module>.md
      'derived-profile',
      'overlay-deployment',
      'operations',
    ]),
  }),
});

export const collections = { manual: manualEntries };
```

Per-tier dynamic-route templates render the entries:

```
src/pages/manual/
├── index.astro                              # Static — section landing
├── information-architecture.astro           # Static — links to IA spec PDFs/HTML
├── validation-report.astro                  # Static — embeds VALIDATION-REPORT.md
├── concept/
│   └── [...slug].astro                      # Dynamic — getStaticPaths from concept entries
├── logical/
│   └── [...slug].astro                      # Dynamic — getStaticPaths from logical entries
├── physical-database/
│   └── [...slug].astro                      # Dynamic
└── physical-ontology/
    └── [...slug].astro                      # Dynamic
```

Each `[...slug].astro` switches on `entry.data.kind` to pick the right tier-component:

```astro
---
import Layout from '@/layouts/Layout.astro';
import { getCollection, render } from 'astro:content';
import EntityPage from '@/components/manual/EntityPage.astro';
import SchemePage from '@/components/manual/SchemePage.astro';
import ExemplarPage from '@/components/manual/ExemplarPage.astro';
import ModuleReadmePage from '@/components/manual/ModuleReadmePage.astro';
import TierReadmePage from '@/components/manual/TierReadmePage.astro';
import CrossCuttingPage from '@/components/manual/CrossCuttingPage.astro';

export async function getStaticPaths() {
  const entries = await getCollection('manual', e => e.id.startsWith('concept/'));
  return entries.map(e => ({ params: { slug: e.id.replace(/^concept\//, '').replace(/\.md$/, '') }, props: { entry: e } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const tierComponents = {
  entity: EntityPage, scheme: SchemePage, exemplar: ExemplarPage,
  'tier-readme': TierReadmePage, 'module-readme': ModuleReadmePage,
  'cross-cutting': CrossCuttingPage,
};
const TierComponent = tierComponents[entry.data.kind];
---
<Layout title={entry.data.title}>
  <TierComponent entry={entry}>
    <Content />
  </TierComponent>
</Layout>
```

This is the JSON-driven mechanism: **227 entries, ~12 reusable templates, 4 dynamic routes**. When the ontology regenerates and `docs/manual/` is re-emitted, Astro picks up the new content automatically at the next build.

### Static authoring (the non-regenerable shell)

Five files stay as hand-authored Astro pages:

| Page | Why static |
|---|---|
| `src/pages/manual/index.astro` | Section landing — audience-routing copy + tier-cards. Not derived from the manual content; hand-authored editorial. |
| `src/pages/manual/information-architecture.astro` | Surfaces the 4 IA-spec docs from `docs/information-architecture/` with explanatory framing. The IA specs themselves are markdown but their landing page is curated. |
| `src/pages/manual/validation-report.astro` | Embeds `docs/manual/VALIDATION-REPORT.md` with surrounding context. |
| `src/components/manual/*.astro` | The 12 reusable per-kind templates (EntityPage, SchemePage, etc.) — hand-authored UI. |
| `src/lib/site.ts` (the `manual` section block) | Navigation source of truth. |

### Reusable components

12 new components under `src/components/manual/`. Each composes existing primitives (`Diagram`, `Breadcrumbs`, `PageMeta`) — no design tokens or themes invented.

| Component | Role |
|---|---|
| `TierLanding.astro` | Hero + tier-summary + audience callout (Concept "for SMEs"; Logical "for engineers"; etc.) |
| `ModuleLanding.astro` | Module overview header (used by `module-readme` kind) |
| `EntityPage.astro` | Concept / Logical / Physical-Ontology entity wrapper — pulls in the `<Content />` slot then renders cross-tier links + source-URI footer |
| `SchemePage.astro` | SKOS scheme wrapper — `<Content />` + members table component |
| `ExemplarPage.astro` | Exemplar + paired expected-report wrapper |
| `CrossCuttingPage.astro` | Three-graph-separation / severity-tiers / shacl-af-rules pages — content + linked-tier callouts |
| `EntityHeader.astro` | UFO meta-category badge + module breadcrumb + cross-tier link strip |
| `AttributeTable.astro` | Logical-tier typed-attribute table (consumes table data extracted at build time from frontmatter) |
| `TurtleBlock.astro` | Physical-Ontology Turtle code-block with copy-to-clipboard + namespace-resolver tooltip |
| `SchemeMembersTable.astro` | SKOS scheme members table with sortable notation column |
| `ShapeBlock.astro` | SHACL shape block with severity-tier badge + targeted-class link |
| `CrossTierLinks.astro` | Footer strip linking Concept ↔ Logical ↔ Physical-Ontology versions of the same entity |

### Design-system reuse

- **No new tokens.** All colours / spacing / typography use the existing CSS custom properties from `src/styles/global.css` (which already powers `[data-theme="dark"]` switching).
- **No new layout.** All manual pages render via `Layout.astro` — same header / sidebar / footer / breadcrumbs as the rest of the site.
- **Manual-specific accents (UFO meta-category badge colours, severity-tier badge colours) defined as CSS custom properties** under `:root` with dark-mode variants under `[data-theme="dark"]` — extending the existing token system, not bypassing it.

### Mermaid integration

The 239 PNGs at `docs/manual/<tier>/diagrams/<doc>/<name>.png` are local-export artefacts produced for offline browsing of the markdown. **They are NOT shipped to the Astro site.** Instead, the manual's mermaid source (already preserved in `<details>` blocks per the `/diagramming` skill's post-export contract) renders **client-side at view time** via the existing `public/ui/client.js` loader, identical to how every other site page handles Mermaid.

Concrete consequences:

- Source markdown's `<details><summary>Mermaid Source</summary>\n\`\`\`mermaid\n...\n\`\`\`\n</details>` blocks → at Astro build time, the markdown processor unwraps the `<details>` source and emits `<div class="mermaid">...</div>` blocks (or `<pre class="mermaid">` per the existing site convention). The PNG `<img>` references in the .md are stripped at build (or wrapped in a `<noscript>` fallback).
- The existing `public/ui/client.js:228-269` mermaid loader handles initialisation: detects `.mermaid` blocks, loads `mermaid@11` + `@mermaid-js/layout-elk@0` from CDN, applies `themeVars` from `design/mermaid-theme.js`.
- **Dark/light**: the existing `client.js` mermaid setup already reads `themeVars` per the active `data-theme`; toggling the site theme re-runs `mermaid.run()` with the new theme variables and diagrams re-render in-place. **No additional dark-mode wiring needed** for the manual — it inherits.
- The `Diagram.astro` component's `size` + `caption` props remain the canonical authoring path for new diagrams elsewhere on the site; the manual content uses bare `<div class="mermaid">` because its source is generator-emitted (not hand-authored).

ELK layout flows through naturally — any mermaid block in the manual content whose YAML frontmatter has `config: layout: elk` gets the ELK plugin (already loaded by `client.js:233`).

### Build-time markdown processor

Astro's built-in markdown processor (remark/rehype) handles the manual `.md` content. Two custom remark/rehype plugins:

1. **`remarkUnwrapMermaidDetails`** — finds `<details><summary>Mermaid Source</summary>\n\`\`\`mermaid\n…\n\`\`\`\n</details>` blocks, replaces the entire `<details>` with `<div class="mermaid">…</div>`. The `<img>` reference immediately above is stripped (PNG is offline-only).
2. **`rehypeFrontmatterUriExtraction`** — for `entity` / `scheme` / `exemplar` kinds, extracts the OPDA URI from the markdown body (e.g. first `opda:<EntityName>` H3 in Physical-Ontology classes.md sections) and adds it to the entry's frontmatter as `entityUri`. Enables cross-tier link generation without re-parsing markdown at render time.

Both plugins live at `src/lib/remark/` and are wired in `astro.config.mjs`.

### URL convention

Per [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md): bare slugs, no `.html`, no trailing slash. Manual URLs:

| Source markdown | Astro URL |
|---|---|
| `docs/manual/README.md` | `/manual` |
| `docs/manual/concept/README.md` | `/manual/concept` |
| `docs/manual/concept/property/property.md` | `/manual/concept/property/property` |
| `docs/manual/logical/agent/enumerations/role-scheme.md` | `/manual/logical/agent/enumerations/role-scheme` |
| `docs/manual/physical-ontology/vocabularies/built-form-scheme.md` | `/manual/physical-ontology/vocabularies/built-form-scheme` |
| `docs/manual/physical-database/modules/property.md` | `/manual/physical-database/modules/property` |

The `[...slug].astro` template per tier consumes the path-after-tier as `slug`. Astro emits the static HTML at build time.

### Consequences

* Good, because regenerability is preserved — when the ontology TTLs change and the manual regenerates, Astro picks up the new markdown automatically at next build; zero `.astro` file edits.
* Good, because design coherence is preserved — manual pages render through `Layout.astro` with the same header / sidebar / breadcrumbs / footer; same `data-theme="dark"` token system; same Mermaid loader.
* Good, because reusable components bound the new authoring effort — 12 Astro components serve 227 content entries; per-tier visual variants live in templates, not duplicated in content.
* Good, because the navigation extends the existing single-source `src/lib/site.ts` discipline; no parallel navigation system; no filesystem-walked sidebar.
* Good, because Mermaid + ELK + dark-mode coordination comes for free — the manual reuses `public/ui/client.js`; no per-section mermaid setup.
* Good, because the 239 generated PNGs stay offline-only — they're for the local export at `docs/manual/_export/`, never shipped to the site. The Astro build emits live-rendered Mermaid instead, which respects dark-mode toggling and ELK layout dynamically.
* Bad, because Astro content collections + dynamic routes are new to this project — no existing template to copy; first content-collection usage in the repo. Mitigation: collection definition is ~30 lines; per-tier `[...slug].astro` ~50 lines; the bulk of complexity is in the 12 reusable components, which are conventional Astro.
* Bad, because the two custom remark/rehype plugins (`remarkUnwrapMermaidDetails`, `rehypeFrontmatterUriExtraction`) add build-time complexity. Mitigation: both plugins are <50 lines; tested via standard remark-test pattern; failure modes are visible at build time (broken markdown → build fails).
* Bad, because `docs/manual/` content needs frontmatter (`kind:` + optional `tier:`/`module:`/`entityUri:`/`sourceTtl:`) for Zod validation. The generator must emit frontmatter alongside content. Mitigation: the 4 worker scripts already emit frontmatter; small extension to add the new fields, then regenerate.
* Neutral, because shipped HTML is build-time-static — no SSR, no API calls. SEO + caching behave identically to the rest of the Astro site.

### Confirmation

The ADR is honoured when ALL of these hold:

1. **`src/lib/site.ts` extended** — `manual` section appears in `HEADER_ORDER` between `modelling` and `schema`; `SECTIONS.manual` declares the per-tier groups.
2. **Content collection wired** — `src/content.config.ts` defines `manualEntries` with the Zod schema; `getCollection('manual')` returns ≥220 entries.
3. **Four dynamic routes emit** — `src/pages/manual/{concept,logical,physical-database,physical-ontology}/[...slug].astro` each `getStaticPaths` from their tier's entries; `astro build` produces a static `.html` per entry.
4. **12 reusable components live under `src/components/manual/`** and consume entry data + slot the `<Content />` from markdown.
5. **`Diagram.astro` is unchanged** — no parallel mermaid setup for the manual; the existing loader handles every manual page's diagrams.
6. **Dark/light toggle works on a manual page** — manually verify by opening `/manual/concept/property/property`, toggling the theme, confirming mermaid diagrams re-render with the dark theme variables.
7. **ELK-laid-out diagrams render correctly** — any `config: layout: elk` block in the manual's `<div class="mermaid">` output renders via the ELK plugin client-side.
8. **No `docs/manual/_export/` files referenced from `src/`** — the local PNG export is offline-only; the Astro site renders Mermaid live.
9. **No new design tokens** — accent CSS custom properties for UFO meta-category / severity-tier badges all defined under `:root` + `[data-theme="dark"]` per the existing convention.
10. **Build succeeds** — `npm run build` emits ~220 manual pages alongside the existing 158 site pages with zero errors.

Manual confirmation test: `npm run build && npx serve dist && open http://localhost:3000/manual/concept/property/property` — verifies the page renders, the sidebar shows the manual section, the breadcrumb path is correct, the master-entity diagram renders (mermaid + ELK), the dark-mode toggle works.

## More Information

* **Predecessor ADRs:** [ADR-0003 — Idiomatic Astro refactor](./ADR-0003-idiomatic-astro-refactor.md) (site architecture); [ADR-0002 — Folder hierarchy + slug taxonomy](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) (URL convention); [ADR-0007 — Ontology generator specification](./ADR-0007-ontology-generator-specification.md) (the regenerator); [ADR-0011 — Module TBox emission](./ADR-0011-module-tbox-emission.md) (source of entity content).
* **IA blueprint:** [`docs/information-architecture/`](../information-architecture/) — defines the 4 tier structures the integration mirrors.
* **Content source:** [`docs/manual/README.md`](../manual/README.md) — the canonical 228-markdown content surface this ADR integrates.
* **Mermaid + ELK loader:** `public/ui/client.js:228-269` — existing initialisation reused as-is.
* **Theme tokens:** `src/styles/global.css` + `public/ui/design-system.css` — `data-theme="dark"` attribute-driven; extended for manual-specific accent tokens, never bypassed.
* **Astro content collections docs:** https://docs.astro.build/en/guides/content-collections/ (Zod schema definition + dynamic route patterns the implementation follows).
* **Out of scope:**
  - Authoring the 227 manual content entries (already done — they live in `docs/manual/`).
  - PDF export from the site (the local `_export/` workflow handles offline PDF; the Astro site is HTML-only).
  - Per-overlay route templates for TA6 / NTS / LPE1 etc. (defer until those overlay profiles emit; ADR-0013 Phase-2/3 work).
  - JSON-LD HTTP content negotiation for `https://w3id.org/opda/<EntityLocalName>` URI dereference (separate deployment-layer work; the manual page is the HTML landing target for those redirects but the redirect setup itself is in ADR-0006).
  - Migrating the existing `src/pages/modelling/` content into content collections (out of scope; modelling pages stay hand-authored).
