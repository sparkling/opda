---
status: implemented
date: 2026-08-16
updated: 2026-09-01
tags: [design-system, brand, website, accessibility, css, governance, presentation]
supersedes: [ADR-0025]
depends-on: [ADR-0064]
implements: [DESIGN.md, public/ui, src/layouts/Layout.astro, src/layouts/StandalonePublicLayout.astro, src/components/BrandHeading.astro, src/components/Header.astro, src/components/SiteFooter.astro, src/components/campaign, src/pages/index.astro, src/pages/join, src/pages/accessibility.astro, src/pages/design-system.astro, src/styles/property-pack.css, docs/design-system-site, playwright.config.mjs, tests/e2e, scripts/crawl-routes.mjs, scripts/check-schema-reproducibility.mjs, .github/workflows/deploy-aws.yml]
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
review: each shared-site composition has one outer width authority. Nested text
measures were removed from prose descendants, heroes, cards, callouts and campaign
pages; tables, diagrams, media and controls retain bounded sizing where their
interaction requires it. This rule does not govern the independently authored
working-group kick-off deck, whose slide compositions use deliberate local measures.

On 20 August 2026 the shared documentation track was set to a single 1600px maximum.
The former narrow 66ch prose measure and page-specific width exceptions were removed,
so every page uses the same outer content-width authority, including comments and
previous/next navigation.

On 21 August 2026 the shared prose rhythm and table hierarchy were clarified after
rendered-page review: lists receive tokenised separation above and below, while
column headers, first-column body cells and zebra rows use three distinct semantic
surfaces in both colour themes. Every first-column body cell uses regular weight on a
quiet warm-neutral tint; neutral zebra striping begins at column two. The column
header uses deep brand ink with white text in light mode and the corresponding
dark surface tint in dark mode. The responsive table contract was also changed
from intrinsic-width scrolling to wrap-first columns.
Shared tables now fit their content track, wrap ordinary and technical cell content,
and do not add focusable horizontal-scroll viewports. They use automatic table layout so
column proportions follow their content rather than an equal-width allocation. Standalone
URI, IRI, URN and CURIE identifiers use unboxed monospace text while ordinary inline code
retains its code surface. Visible caption bars are
removed while semantic captions remain visually hidden for assistive technology.

On 23 August 2026 the shared card contract was clarified after the Property Pack
work-package review. Cards now use a quiet structural top rule, explicit content
hierarchy, optional scope notes, aligned comparison facts and a distinct action row.
Linked cards remain one keyboard-focusable target with no nested controls; their
grids auto-fit the content track and stack at narrow widths. The live design-system
page and standalone review presentation carry the same specimen.

On 23 August 2026 ADR-0074 replaced only the public-home editorial composition. The
former schema-progression hero and four-part overview became an SPDTF-centred,
six-destination audience directory sourced from the canonical IA registry. It reuses
the implemented public shell and linked-card primitives, so this does not reopen the
brand or component decision. Fresh homepage unit and release-gate evidence is required;
the historical confirmation below does not validate this editorial revision.

On 24 August 2026 the operator chose the new root homepage as the sole public
knowledge-base landing. The former `/home` page is retired without a redirect,
rewrite, alias or duplicate route. The root therefore carries the full homepage
composition described in `DESIGN.md`; this is an information-architecture route
consolidation under ADR-0074, not a second visual-system decision.

Later on 24 August 2026 the separate public working-group shell was retired. The
join and privacy routes now use the same `Layout` and global `Header` as ordinary
knowledge-base pages, with their campaign composition retained inside the common
main region. A single `SiteFooter` component supplies the identical organisation
footer to the root landing and every ordinary `Layout` route. The full-screen
presentation remains an intentionally isolated, non-site-chrome experience.

On 30 August 2026 the Finance and Banking working-group deck was restored directly
from Git revision `3ef98fd`, the last completed version before the shared design-system
rewrite. The rewrite had incorrectly treated that finished presentation as an
unfinished shared-site surface and removed its purpose-built composition. The deck at
`/presentation/working-group-kickoff` therefore owns its local visual tokens and layout;
the separate `docs/design-system-site/` review artefact remains the presentation of
this design system.

On 30 August 2026 ADR-0080 added a bounded graphical composition for `/`: a
static official-icon backdrop, an accessible AI-assisted modelling loop and an
editorial link to the working-group kick-off deck. The loop follows the deck's
resource, candidate and human-review method, with the consensus-gated draft outcome
outside the repeating cycle. Shared brand and accessibility authority, and the deck's
isolated local visual system, remain unchanged. Publication is not authorised.

Later the same day, the operator amended ADR-0080 so the root hero reuses `/join`'s
full-width static radial/diagonal background, centred 92rem content grid and panel
composition. The final convergence uses the campaign's actual numbered-list structure,
adds a direct working-group action and gives the content below the hero one continuous
design-system surface. This replaces the root's decorative icon backdrop without
changing its shared icon-and-name heading, working-group domain register, tokens or
publication boundary.

The same amendment adds a shared icon-and-name organisation heading. It keeps the
official yellow icon unchanged, presents the full name as live DM Sans text, and
defines light, inverse, responsive, forced-colour and print treatments in the design
system rather than in the homepage. The live reference and standalone review site
carry matching light- and dark-surface specimens.

On 31 August 2026 the restored deck&rsquo;s session content was generalised for all six
domain working groups. Its 24-slide structure, fragment identifiers, controls and
Conveyancing demonstration remain. Finance and Banking is now one peer context rather
than the deck&rsquo;s default; the original session plan and source material remain historical
evidence. The deck retains its isolated visual-system boundary and established identity,
with local composition changes made only where the generalised content requires them.

Later on 31 August 2026, the deck&rsquo;s graph slide was redrawn as one connected
network with one shared Property node, and its adjacent reassurance was clarified
to say that participants do not need to understand ontologies.

On 27 August 2026 the remaining working-group wrapper exception was removed. The
join and privacy routes now inherit the standard main padding, article wrapper and
breadcrumb from `Layout`; they remain registered standalone surfaces, so no left-hand
section navigation or previous/next sequence is introduced. All campaign and form
content remains inside that shared wrapper.

Later on 27 August 2026 an adversarial review removed the campaign's remaining
scroll-driven story geometry and viewport-negative full-bleed margin. The handoff
narrative is now a natural-height, two-column comparison that becomes one column on
small screens; its complete meaning remains visible without interaction. Optional
reveal feedback still follows the shared motion and reduced-motion contract.

Later on 27 August 2026 the primary-action token was made explicitly black on amber.
The shared `.btn` and `.cta` primitives consume that token in their default and hover
states; page-level campaign styles do not override it.

ADR-0078 subsequently establishes one intentional public-service shell exception for
`/join`, `/join/privacy` and `/accessibility`. `StandalonePublicLayout.astro` consumes
the same official assets, semantic tokens, typography, controls, focus states and form
primitives as the Knowledge Base, but omits its global header, section navigation,
breadcrumb, table of contents and previous/next sequence. The shell supplies a minimal
masthead and footer; campaign-specific composition, recruitment-group-card and public-
statement patterns are documented in `DESIGN.md` and the live design-system projection.

Later on 27 August 2026 an SME-focused review removed the semantic constellation and
the evidence-to-candidate explainer from the public recruitment journey. The campaign
now uses plain working-group cards, programme context and practical participation copy;
ontology and mapping detail remains in the Knowledge Base. This is a content hierarchy
change within the standalone shell and shared token contract, not a new visual system.

On 25 August 2026 the expanded documentation header was aligned to the shared content
axis: its first destination follows the content gutter, and the left rail no longer repeats
its accessible section name as visible copy. Site search now consumes canonical destination ownership, provides one
destination filter, ranks multi-word matches, exposes authority metadata in compact
rows, and reinitialises after client-side page transitions. The normative contract,
tokens, shared components and tests were updated together.

On 1 September 2026 the desktop documentation header became a three-row composition. The primary linked
“Open Property Data Association” title includes a bottom-aligned yellow icon; the smaller “Smart Property
Data Framework” subheading sits above the horizontal global destination tabs. Utility controls remain anchored
at the top right; the previous standalone logo cell was removed. This does not alter either the left section rail
or the right page-contents rail.

The final desktop masthead refinement expands the header to 160px and adds deliberate space around the
framework subheading. A shared `.brand-lockup` primitive now owns icon scale (`0.89em`), icon-to-text gap
(`0.45em`), baseline alignment and surface-aware colour, so the header no longer carries local corrections.
The compact header remains 64px. The divider below the global tabs follows the content width, the first tab
has no extra left inset, breadcrumbs regain balanced vertical spacing, and the pre-title metadata strip is
suppressed entirely so the breadcrumb leads directly into the page title.
`Layout.astro` now owns the sole page-level `Breadcrumbs.astro` renderer. Property Pack, ontology detail,
ADR, ODR and verification pages no longer carry alternate breadcrumb markup or local breadcrumb CSS;
qualified document titles may supply a concise `breadcrumbTitle`. In-content schema-object locations and
resource-folder paths retain their distinct location semantics.
Property Pack candidate status now uses a 44px information disclosure aligned with the page H1 rather than
a full-width warning bar above it. Its non-modal flyout preserves the complete authority, validation and
six-stage lifecycle record, uses the shared colour and focus tokens, closes with Escape or an explicit control,
and returns focus after keyboard dismissal. The flyout title remains outside the generated page contents list.
The documentation body now centres the complete content-and-rails shell at its combined maximum width.
On wide viewports, surplus space therefore remains outside the shell rather than separating either
navigation panel from the content it describes. Collapsed panels remain within their reserved rail tracks,
so the shell measure, article geometry and header alignment do not change with disclosure state.

On 1 September 2026 the diagram-frame contract was consolidated. `GraphDiagram.astro`
and adopted bare Mermaid now consume one shared shell template and one bundled Mermaid
renderer. Ontology sources may explicitly declare datatype-property, object-property
and inheritance layers; the shared toolbar then exposes three independent pressed-state
controls with dark-mode, forced-colour, keyboard and unavailable-layer treatments.
Ordinary Mermaid remains unchanged and receives no inferred semantic controls.

Later on 1 September 2026, `SiteFooter.astro` became the single organisation footer for
the root landing, every `Layout` route and the standalone public-service family. It
retains the signature rule while providing privacy and accessibility exits, a centred linked OPDA
lock-up to the Association website, and the linked Sparkling Ideas credit. The standalone join
hero adds the existing transparent button variant for its OPDA return control; the
full-screen working-group deck remains outside shared site furniture.

Later on 1 September 2026, the documentation-shell rail contract was clarified: the section
navigation and page-contents rail use the same 240px desktop width and alternate surface, with
matching labelled utility bands. The bands use uppercase mono labels, structural dividers and double
chevrons so they cannot be confused with selected navigation rows. Collapsing either rail creates a
full-height 44px labelled spine anchored to the content-facing edge of its reserved 240px track. The grid
tracks and header offsets remain fixed, preventing the article from moving or resizing. The visible label supplies the accessible name and the state remains in
`aria-expanded`. The mobile drawer and inline page-contents patterns retain their established geometry
and disclosure behaviour.
Desktop opening and closing animate the panel width while the menu content fades and translates slightly
towards its outer edge. Menu links become inert as soon as closing begins, and horizontal clipping prevents
transient overflow during either direction. The shared 200ms motion token governs both directions, and
reduced-motion mode reduces the transition to an effectively instant state change.

A subsequent 1 September refinement supersedes the timing and breadcrumb details above. Both desktop rails
remain anchored to their content-facing edge and combine the shared 200ms and 120ms tokens into a more legible
320ms disclosure; reduced-motion remains effectively instant. The framework subheading moves to the next shared
type step. The desktop header utilities end flush with the physical right edge, sit 16px from the top and use a
borderless theme control, while the 44px working-group action ends on the content-right axis. Page breadcrumbs retain
linked ancestors only, bottom-align each complete item, optically align link-coloured decorative chevrons to the label baseline and reduce their lower inset because the adjacent H1 already
identifies the current page. The Property Pack candidate control
uses a shared Lucide `MessageCircle` outline with an italic information glyph in a borderless 44px target, avoiding a misleading approval symbol or a
second visible enclosure. The global navigation row and divider retain their original 44px geometry and position. The working-group
action remains fully visible and aligned with the destination labels; it returns to normal flow in the compact disclosure. Pages without navigable
breadcrumb ancestors render no breadcrumb region and remove the article's duplicate upper inset. The desktop masthead reserves sixteen pixels above the organisation title without increasing the header height; the framework subheading's lower inset is reduced by eight pixels instead.
The working-group action uses the shared outlined-on-dark button component. The shared navigation container controls its vertical spacing, without CTA-specific margin, translate or transform offsets; header CSS does not override the component's colour, border, typography, padding or interaction states.

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
files; neither the design-system presentation in `docs/design-system-site/` nor
historical `design/` material is an independent source of truth. The separate
working-group kick-off deck is outside this shared visual-system contract.

Tailwind Preflight remains enabled for adopted TailwindPlus controls. The OPDA
modules remain unlayered for the current cascade boundary and explicitly restore
the element defaults they rely on. This is an implementation decision that can be
revisited with tests; it is not a claim that the design system cannot change.

### Accessibility contract

All interactive targets are at least 44 by 44 CSS pixels. Focus is visible and is
not encoded by yellow alone. Status uses text and, where helpful, icon or pattern in
addition to colour. Normal text and controls meet AA contrast. Pages reflow at
320 CSS pixels and 400% zoom; table columns wrap within the content track without
horizontal scrolling. Motion has a no-motion equivalent. Keyboard, forced-colour
and screen-reader behaviour are release gates, not recommendations.

### Scope and publication boundary

This decision changes only repository source for opda.org.uk. It does not change or
deploy openpropdata.org.uk, smartpropdata.org.uk or any legacy PDTF site. It does
not approve standards content, promote candidate models, alter stable standards or
external URLs, or authorise a production deployment. The explicitly governed `/home`
retirement under ADR-0074 is the bounded exception for the duplicate homepage route.
Existing status/provenance governance remains in force.

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

The receipts below predate the 30 August restoration and do not validate the restored
working-group deck. Its retained keyboard, responsive, accessibility and visual
behaviour requires a fresh local validation receipt when testing is authorised.

- Contract tests verify official asset geometry, supplied palette values, derived
  token roles, presentation coverage and removal of obsolete lock language.
- `make test` passes the JavaScript contract and behaviour suite.
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
