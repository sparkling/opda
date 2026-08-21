---
status: implemented
date: 2026-08-16
updated: 2026-08-21
tags: [design-system, brand, website, accessibility, css, governance, presentation]
supersedes: [ADR-0025]
depends-on: [ADR-0064]
implements: [DESIGN.md, public/ui, src/layouts/Layout.astro, src/layouts/PublicWorkingGroupLayout.astro, src/components/Header.astro, src/pages/index.astro, src/pages/home.astro, src/pages/design-system.astro, src/styles/v2.css, src/styles/presentations, docs/design-system-site, playwright.config.mjs, tests/e2e, scripts/crawl-routes.mjs, scripts/check-schema-reproducibility.mjs, .github/workflows/deploy-aws.yml]
---

# Adopt the OPDA brand and replace the website design system

## Context and problem statement

The Knowledge Base shipped a cream, terracotta, Fraunces and Inter interface
developed before the current OPDA brand resources were available. ADR-0025 made
that implementation operationally canonical so Tailwind Preflight could not
silently override it. The decision solved a cascade defect, but its visual premise
is no longer correct.

The operator has now explicitly authorised a coherent replacement for this
opda.org.uk application. The replacement must use all supplied brand evidence,
complete the decisions that evidence omits, rewrite the shared website shell and
home page, and provide both a normative `DESIGN.md` and a separate local
presentation website. Other production websites remain outside this decision.
Publication and deployment are separate actions.

## Evidence and authority

Evidence is classified so observation cannot silently become brand policy:

1. **Authoritative supplied evidence** — Ben Kansy's Q3 2026 guide and the three
   original vector assets attached to his 23 July 2026 email.
2. **Observed evidence** — openpropdata.org.uk, the current opda.org.uk app, the
   legacy PDTF developer site and historical OPDA material. These reveal useful
   patterns and defects but cannot override the supplied guide or vectors.
3. **Derived system decisions** — the accessible semantic colours, type scale,
   spacing, components, data visualisation, responsive behaviour, motion and
   governance needed to make the sparse guide usable as a complete web system.
   For this exercise, the operator delegated visual-design authority for this
   derived layer to Fable 5 at maximum effort and adopts the resulting contract
   through this decision. That delegation is bounded to visual-design derivation:
   Fable has no standards, content, governance, deployment or publication
   authority. The decisions are captured in `DESIGN.md` and tested in
   implementation.

The guide file inspected for this decision has SHA-256
`874df798afb3b51c3c0d1bca692073dc6173288fa3d59a1311ed92ae19356817`.
The canonical repository assets are:

| Asset | SHA-256 |
|---|---|
| `opda-wordmark-dark.svg` | `91f10f8481a2caab8700fdb540489004777a246348644e126eca7a4e3b9efb8f` |
| `opda-wordmark-white.svg` | `18bc8957fdd84342de4acc9284dd574a2604ecfcc5bdba5e26099e02168de97a` |
| `opda-icon-yellow.svg` | `e547e3a8fc9f4f9b0195b1dc4fae3deb71a70c5a24a634e4f7fc356c6488ab81` |

## Decision drivers

- Express the supplied OPDA identity rather than a third-party-inspired aesthetic.
- Work equally well for public narrative, standards status, provenance, diagrams,
  schema tables, code and dense data-browser controls.
- Meet WCAG 2.2 AA interaction and contrast expectations, including keyboard,
  zoom/reflow, forced colours and reduced motion.
- Keep status and provenance semantics independent of decorative brand colour.
- Make evidence, implementation and governance traceable without freezing future
  improvements.
- Preserve working routes and domain content while changing the shared visual
  system coherently.

## Decision outcome

Adopt the Q3 2026 guide and supplied vectors for this application and complete them
through the derived OPDA web system specified in `DESIGN.md`.

On 19 August 2026 the implemented layout contract was clarified after rendered-page
review: each composition has one outer width authority. Nested text measures were
removed from prose descendants, heroes, cards, callouts, campaign pages and the
presentation; tables, diagrams, media and controls retain bounded sizing where their
interaction requires it.

On 20 August 2026 the shared documentation track was set to a single 1600px maximum.
The former narrow 66ch prose measure and page-specific width exceptions were removed,
so every page uses the same outer content-width authority, including comments and
previous/next navigation.

On 21 August 2026 the shared prose rhythm and table hierarchy were clarified after
rendered-page review: lists receive tokenised separation above and below, while
column headers, first-column body cells and zebra rows use three distinct semantic
surfaces in both colour themes. Every first-column body cell uses regular weight on a
quiet warm-neutral tint; neutral zebra striping begins at column two. The light-theme
column header uses the softer violet-grey `neutral-600` surface with white text rather
than the near-black brand ink surface.

### Brand conflict resolution

The SVG-embedded colours (`#131224`, `#FEC82F`, `#FEC92B`, white) are immutable
asset colours. The guide values (`#2C273B`, `#231F2F`, `#FEC92B`, `#FAC238`,
white and off-white) are interface palette values. Components never recolour an
official logo to make those values match.

### Bounded contexts

The system has six ownership boundaries:

1. **Brand foundations** — supplied assets, colours, typography and imagery rules.
2. **Interface primitives** — semantic tokens, controls, states and interaction.
3. **Knowledge patterns** — long-form content, evidence, provenance and decisions.
4. **Data and semantic display** — tables, filters, schema, diagrams and statuses.
5. **Presentation** — a standalone one-page catalogue derived from the same
   contract; it is not a second product implementation.
6. **Governance and release** — evidence tiers, ownership, change review, tests and
   version history.

### Source hierarchy

`DESIGN.md` is the normative human contract. `public/ui/design-tokens.css` is its
machine-readable token projection. `public/ui/design-system.css` is a small facade
over reviewable modules in `public/ui/design/`. Astro components consume those
files; neither the presentation site nor historical `design/` material is an
independent source of truth.

Tailwind Preflight remains enabled for adopted TailwindPlus controls. The OPDA
modules remain unlayered for the current cascade boundary and explicitly restore
the element defaults they rely on. This is an implementation decision that can be
revisited with tests; it is not a claim that the design system cannot change.

### Accessibility contract

All interactive targets are at least 44 by 44 CSS pixels. Focus is visible and is
not encoded by yellow alone. Status uses text and, where helpful, icon or pattern in
addition to colour. Normal text and controls meet AA contrast. Pages reflow at
320 CSS pixels and 400% zoom; tables provide labelled overflow when genuinely
two-dimensional. Motion has a no-motion equivalent. Keyboard, forced-colour and
screen-reader behaviour are release gates, not recommendations.

### Scope and publication boundary

This decision changes only repository source for opda.org.uk. It does not change or
deploy openpropdata.org.uk, smartpropdata.org.uk or any legacy PDTF site. It does
not approve standards content, promote candidate models, alter URLs or authorise a
production deployment. Existing status/provenance governance remains in force.

On 16 August 2026 the operator separately authorised public publication of the
standalone design-system presentation through OpenAI Sites. That publication is a
review artefact only and does not authorise deployment of the opda.org.uk
application or mutation of any other production site.

## Considered options

- **Keep the previous design.** Rejected because it contradicts supplied OPDA brand
  evidence and Ben's explicit direction.
- **Copy openpropdata.org.uk.** Rejected because it is observational, applies the
  typography inconsistently and contains accessibility defects.
- **Implement only the sparse guide.** Rejected because the guide does not define
  the semantics or components required by this application.
- **Adopt the guide and complete it as a governed web system (chosen).** This uses
  evidence where available and records derived decisions where it is not.

## Consequences

- Good: the website becomes visibly OPDA and uses the supplied official assets.
- Good: one contract serves narrative, governance and highly technical interfaces.
- Good: evidence and derivation are explicit, so future brand decisions can replace
  individual choices without archaeology.
- Good: the presentation is useful for review without duplicating the product.
- Cost: shared CSS and shell changes require broad rendered-page regression testing.
- Cost: documentary photography remains unavailable until rights and provenance are
  recorded; abstract brand geometry must carry the initial hero treatment.

## Confirmation

- Contract tests verify official asset geometry, supplied palette values, derived
  token roles, presentation coverage and removal of obsolete lock language.
- `make test` passes all 117 JavaScript contract and behaviour tests.
- The CI-equivalent `make build-data` emits 2,554 pages successfully.
- The emitted-site crawl resolves all internal application assets and navigation
  across 3,435 HTML documents and 5,234 emitted files, with zero unresolved
  resources and zero unlinked routes. Ontology resources whose canonical IDs differ
  only by case are checked exactly on Linux CI and identified explicitly on
  case-insensitive development filesystems.
- The 48-test Chromium release matrix passes: 18 axe route-family checks with zero
  tagged WCAG findings, 18 reviewed desktop/mobile light/dark visual baselines,
  eight keyboard/behaviour smoke tests, and four 320px/400%-equivalent reflow,
  forced-colour and descendant reduced-motion checks.
- Five schema reproducibility tests and the deterministic strict generated-page
  drift check pass with zero errors and zero warnings. Its canonical
  `SOURCE_DATE_EPOCH` and tracked offline input projections run in local CI, pull
  requests and the deployment workflow.
- Pull requests execute the full build, crawl, browser, accessibility and model
  gates; AWS credentials, upload and invalidation remain deployment-only steps.
- The standalone review artefact may be published through OpenAI Sites under the
  operator's separate 16 August 2026 authorisation; no application deployment or
  external production-site mutation occurs.

## Relationship to earlier decisions

ADR-0025 is superseded. Its useful cascade analysis is retained here, but its visual
authority and historical source hierarchy no longer apply. ADR-0064 is amended by
the operator's 16 August 2026 authorisation for a coherent site-wide visual-system
replacement; its content-status, provenance and modelling-migration gates remain.
