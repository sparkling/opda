---
status: implemented
date: 2026-08-16
updated: 2026-09-04
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
“Open Property Data Association” title includes the shared bottom-aligned yellow icon; the smaller “Smart Property
Data Framework” subheading sits above the horizontal global destination tabs. Utility controls remain at the right of the organisation-title line; the previous standalone logo cell was removed. This does not alter either the left section rail
or the right page-contents rail.

The final desktop masthead refinement expands the header to 160px and adds deliberate space around the
framework subheading. The shared `BrandHeading.astro` component owns the relative tile and icon scale, proportional gap,
cap-height alignment and surface-aware colour, so the header carries no duplicate lock-up markup or local corrections.
Since 3 September 2026 the mark sits on a yellow property-document card with a violet folded corner on light surfaces and on a raised night card on dark surfaces; the live organisation name is deep with a violet "Association" on light surfaces and yellow with a bright violet "Association" on dark surfaces. This retains
the OPDA brand cue without using low-contrast yellow for the complete light-mode identity.
The compact header remains 64px. The divider below the global tabs follows the content width, the first tab
has no extra left inset, a shared 16px page-header inset positions both breadcrumb and breadcrumb-free pages, breadcrumbs use the shared 32px compact inline-navigation target with no block padding, and the pre-title metadata strip is
suppressed entirely so the breadcrumb leads directly into the page title.
The retired `PageMeta.astro` component and its call sites are deleted, removing the hidden sibling that previously triggered article-flow spacing above the H1.
`Layout.astro` now owns the sole page-level `Breadcrumbs.astro` renderer. Property Pack, ontology detail,
ADR, ODR and verification pages no longer carry alternate breadcrumb markup or local breadcrumb CSS;
qualified document titles may supply a concise `breadcrumbTitle`. A subsequent 3 September refinement gives
the shared shell one 32px page-context row for linked ancestors. When no ancestor exists, the breadcrumb
region and its row are omitted so the page title and all following content move up together. In-content schema-object locations and
resource-folder paths retain their distinct location semantics.
On 4 September 2026 the desktop masthead gained one shared 48px header-start token above the
OPDA identity. Its height increased to 164px by the same delta, so the added breathing room moves
the complete header flow and following page down without compressing or clipping masthead content.
The independent page-content start token is 8px below the masthead, avoiding a second large band above breadcrumbs. Search's `All` scope now exposes the union of
all six current facet groups, while scoped tabs continue to show only meaningful refinements. The
route-derived Page type group was retired because it duplicated Section or Collection rather than
providing a consistently authored, orthogonal taxonomy; schema-3 page-type metadata remains readable
for existing templates and indexes but no longer affects current facet selection, ranking or card labels.
Existing `pagetype` URLs retain their exact filter as a removable legacy chip. Checkbox
rows use a shared 8px vertical group gap. The search-filter collection no longer draws a nested
inner border: the shared section rail remains its single containing boundary.
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

On 2 September 2026 the privacy and accessibility statements adopted the standard
global `Header` used by `/programme`, while explicitly omitting both side rails,
breadcrumbs, comments and previous/next navigation. The standalone `/join` hero
retains its existing campaign header. The shared public-statement pattern uses the
complete `app-main` track with no nested width limits or stacked outer padding.

The same refinement places previous/next navigation above the comments divider and
removes stacked article-to-comments spacing. Articles with comments add no trailing
padding; the comments section owns one `--space-5` gap before its divider.
The previous/next bar also receives a separate full-track divider in its existing
top gap, distinct from the bar's own border. On 2 September 2026 the comments
divider was normalised to 16px on each side of its rule. The previous/next
region now owns explicit before-rule and after-rule spacing roles. Its rule sits
16px above the navigation panel, matching the 16px panel-to-comments-rule gap
below. Bounded content endings retain 16px before the rule; text-led endings use
4px after their final line box because the line box completes the optical gap.
Nested page compositions declare the reusable `.document-flow` role, so this
behaviour does not depend on a route or particular link copy.

The left section navigation now treats hierarchy as navigation rather than a
second disclosure interaction. Folder labels remain links, and navigating to a
folder opens the active trail on the destination page. Recursive lists add one
8px indentation step only. Removing branch buttons, arrows, guide rules, their
44px leading gutters and their client-side persistence prevents deep Property
Pack paths from losing most of the rail to repeated controls. The navigation
itself has an 8px inline inset, and top-level rows add no second inline margin.
The whole-rail collapse control is unchanged because it governs shell state
rather than hierarchy depth. Every parent link uses the leaf-link DM Sans scale
and sentence case with stronger weight and a restrained, theme-aware semantic
colour mixed toward body text; top-level parents also receive a hairline lower
edge. Selection in either theme preserves the item’s existing typography, so a
selected leaf remains regular and a selected parent remains bold; only the
shared active background, foreground and yellow rule are added. This
distinguishes their structural role without consuming vertical space. They have
no open/closed marker.

Later on 1 September 2026, `SiteFooter.astro` became the single organisation footer for
the root landing, every `Layout` route and the standalone public-service family. It
retains the signature rule while presenting one desktop row in source order: the linked Sparkling Ideas credit, a centred linked OPDA
lock-up to the Association website, then the privacy and accessibility exits. The existing expert tagline remains beneath the credit. The complete row moves one text line upward by redistributing 16px of container padding from above to below; individual elements use no vertical transform. The standalone join
hero adds the existing transparent button variant for its OPDA return control; the
full-screen working-group deck remains outside shared site furniture.
The footer's left credit and right links align directly to the shared content edges, removing the former additional 32px inner gutter while retaining the centred OPDA lock-up and minimum narrow-screen inset. The first credit line, OPDA lock-up and footer links share the desktop row while the second credit line is retained.
Privacy and Accessibility use the same muted colour and regular weight as plain
footer text rather than the emphasis reserved for the organisation and delivery credit.
The centred footer identity now renders the reusable `BrandHeading` component in
its compact 14px variant. The component scales its icon and gap relative to that
font size, replacing the footer's duplicate icon, text and dimensional rules. The
header consumes the same component at its mini scale, so the header, homepage,
join page and footer share one icon-and-name implementation.

On 2 September 2026 the global working-group CTA returned to the standard full-height
44px button. The desktop navigation track initially grew to 60px above its unchanged divider;
the CTA aligned to the track's top with 16px clearance below. The former inset
surface and compensating label padding are removed, so no visible height is lost.

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
type step. The desktop header utilities align with the organisation-title line, end at the shared content-right edge and use a
borderless theme control, while the 44px working-group action ends on the content-right axis. Page breadcrumbs retain
linked ancestors below the global destination only, use the shared 32px compact inline-navigation target in normal flow, bottom-align each complete item, optically align link-coloured decorative chevrons to the label baseline and add no block padding because the adjacent H1 already
identifies the current page. Both linked header headings are content-sized rather than row-wide. The Property Pack candidate control
uses a shared Lucide `MessageCircle` outline with an italic information glyph in a borderless 44px target, avoiding a misleading approval symbol or a
second visible enclosure. The global navigation row and divider retain their original 44px geometry and position. The working-group
action remains fully visible and aligned with the destination labels; it returns to normal flow in the compact disclosure. Pages without navigable
breadcrumb ancestors render no breadcrumb region and remove the article's duplicate upper inset. The desktop masthead is 124px high and uses a two-row grid with no negative margins: a content-sized flex identity stack and normal-flow utilities share the first row, while global navigation spans the second. Reducing the identity gap and masthead height together retains the mini organisation lock-up's position while moving the framework heading, navigation track, divider and page shell eight pixels higher.
The grid now lives in a centred `.app-header__inner` track whose maximum width, reserved rail columns and inline gutters are identical to `.app-body`. The header no longer reconstructs those edges with independent viewport-padding arithmetic, so its identity, navigation, utility group and account control align with the article on both sides. The desktop masthead is 152px high: its OPDA lock-up uses the shared 1.375rem step, while the 2.75rem framework heading is deliberately one step larger than the 2.25rem page H1. The compact masthead continues to hide the framework heading and constrains the OPDA lock-up to its existing responsive size.
The working-group action uses the design system's standard yellow primary `.btn` together with its shared inset-surface template. The complete 44px target remains aligned while the yellow surface clears the divider by eight pixels, and the shared template centres its label within that visible surface through internal padding; the header class controls placement only and does not override colour, border, typography, padding or interaction states.
On 2 September 2026 the organisation lock-up became the smaller identifier above the larger framework heading. A shared mini lock-up variant sets one typography scale; the existing relative icon width and gap scale the complete component without header-specific image dimensions.
Both headings link to the site root, and the top-right utility group includes a labelled house icon as a third route home without adding another text action to the global destination row.
The horizontal destination labels use the shared base text size rather than the smaller supporting-text role. The primary working-group action is labelled “Join a working group” and uses the shared compact button variant, which reduces horizontal padding without changing the 44px target height or introducing a header-local button treatment.
The application header, homepage and join page render the same shared `ThemeToggle` component. Its design-system rule provides one borderless, transparent 44px target that inherits the foreground colour of its surface; pages no longer duplicate its SVG or override its border and background locally. The application-header utility group occupies normal grid flow beside the organisation title, while campaign-page controls retain their hero-header placement.
The application header itself now consumes shared theme-aware header tokens. Light mode uses the white surface, deep brand text, neutral navigation and light structural borders; dark mode retains the deep surface, white text and dark structural borders. The identity, navigation, utility icons, account control, hover states and compact disclosure all switch together; the yellow primary action remains unchanged.

The 2–3 September Fable reviews tested dark, yellow and folded property-document tiles for the shared OPDA lock-up. The operator rejected each as a knowledge-base header identity because it either washed out, read as a generic application icon or split the organisation name into multiple colours. Those treatments remain available to the document variant used outside this header but are superseded here.

On 4 September 2026 Fable's paired-header study established the current knowledge-base identity. `BrandHeading`'s paired variant renders the official OPDA house without a tile beside the complete one-colour organisation name; `FrameworkHeading` renders the exact name “Smart Property Data Trust Framework” beside a selectable contact-sheet mark. The OPDA house is `0.9em`; the framework mark remains optically based on `0.72em`; both are bottom aligned and unwrapped. Both shared lock-ups own the same `0.3em` mark-to-label gap, so containers can change scale but cannot diverge their internal spacing. The desktop header uses direct grid rows rather than an overlapping identity wrapper: OPDA and utilities share the first row, an explicit 8px spacer preserves the brand-line relationship, the complete framework lock-up and review selectors share the next row, and navigation occupies the final row. The OPDA line remains bottom-aligned in its row while the framework lock-up and selectors are top-aligned in theirs; smaller type therefore cannot acquire extra space through vertical centring, and the visible inter-heading distance remains fixed as the slider changes. The framework mark remains optically bottom-aligned with its own label. Medium and wide headers promote the OPDA lock-up to the shared 1.75rem step while its house scales proportionally; narrow headers retain the compact size. Petrol and Party Wall are the defaults. Temporary right-aligned theme and icon controls expose the ten reviewed palettes and all 24 numbered Fable archive marks from shared ordered registries. A third sliders-icon control opens five live numeric ranges for paired size, OPDA relative size, space underneath SPDTF, space between the identity lines and space above OPDA. It shares the selector row and the complete control drawer's disclosure button. Space below the framework line translates only the paired identity, preserving the position of selectors, navigation and page content; space above OPDA and space between the identity lines remain real grid dimensions, so their changes resize the header and move the complete page shell. The measured header height is propagated to the shell for sticky navigation rails. The tuning flyout remains attached beneath its trigger and expands down and right. All selector flyouts share generous padding, rounded borders and a lower-right cast shadow. Each icon records its visible artwork width and bottom edge, allowing the shared renderer to scale and bottom-align its artwork inside a fixed Party Wall-sized SVG box until every mark has Party Wall's apparent width and lower edge without distorting individual geometry or changing layout dimensions. A shared optical lift aligns that edge with the visible framework letterforms instead of the display face's descender space. Theme cards preserve the live header's 28:44 typography relationship at half scale; icon cards contain only the normalized icon and its name in the currently selected palette and colour mode. Each theme/icon flyout embeds the other synchronized selector and the same shared heading-layout selector used by the main control row, so palette, icon and geometry can be compared without closing the current inventory. Every duplicate range mirrors its value and applies it to the same identity target; no flyout owns a divergent copy of the adjustment logic. All selector flyouts render on an isolated overlay layer above page content. The selected icon field uses a fixed 7rem width sized for its label, two-digit archive number and disclosure marker, preventing label overflow. Their attached arrows cycle those registries and their selections persist locally. Every dark palette fixes the OPDA mark and name at `#FEC92B`. Navigation may collapse independently at medium widths; only the narrow header and print omit the framework row and review controls. The homepage consumes those same identity and selector components at display scale rather than maintaining a separate organisation lock-up and plain-text framework eyebrow. Its selector group sits immediately above and right-aligned with the Working Group Domains panel. Both the homepage and knowledge-base header include the shared controls. Paired size defaults to 24 and uses a 12–36 range, making 24 its exact 50% midpoint. Astro swaps preserve the current light/dark mode, palette and icon on the incoming document. Persisted sidebar and contents-rail states are restored in the app-body before their elements render; transitions remain disabled for the two initialization frames, eliminating entry-time rail jitter while preserving user-triggered disclosure motion.

The theme inventory subsequently expands to twenty reviewed palettes. Its selector paginates four themes at a time and places one theme on each row, with explicit light and dark previews side by side. Previous and next pagination wrap continuously between the first and last theme pages. Both previews use the shared identity components and inherit the live heading size, relative OPDA size and spacing variables from the adjustment controls. Nested selector dismissal is based on an actual pointer target outside the selector or keyboard focus moving to another focusable control; it does not close on an intermediate null focus target while a card label activates its input. Icon selection therefore updates and remains open even when the icon picker is nested inside the theme flyout. The icon and theme inventories open twelve rem below their triggers, clearing the menu row without moving the heading controls or using a positional transform. These temporary configuration controls are hidden unless the page URL contains a `config` query parameter; while enabled, internal navigation links inherit that parameter so configuration mode survives navigation. Standalone pages and the shared layout content-version the common client script so they cannot retain contradictory interaction code.

The homepage and join page version the shared `public/ui/client.js` asset by its content hash, matching `Layout.astro`. This prevents a long-lived development or deployed browser tab from retaining obsolete selector interactions after the script changes. Icon cards remain active comparison controls: selecting one synchronizes every icon input and the document identity while leaving both the icon flyout and any containing theme flyout open.

The horizontal primary navigation contains the six governed content destinations followed by Search as a cross-site task. Search does not become a seventh content destination or homepage directory card. Its application page reserves the ordinary right contents-rail track without rendering a contents panel, keeping its main content on the same centred axis as other documentation pages while its filter rail remains outside the content track.

The desktop global-navigation actions are one shared right-aligned group. The
standard transparent compact “Become a member” button links to the Association
website immediately before the standard yellow compact “Join a working group”
button. Header CSS controls only their grouping and placement; common button
variants retain visual and interaction ownership.

Breadcrumbs omit the destination already named by global navigation and the
current page already named by the H1. When a destination's linked `Overview` node
owns child pages, however, that node remains a linked breadcrumb ancestor:
“Overview” expresses the lower-level parent relationship without repeating the
global destination label. Breadcrumb-free pages use the same shell inset but do
not reserve an empty breadcrumb row.

Later on 2 September 2026 the documentation rhythm became a direct-child flow contract.
Ordinary `.prose` articles and Property Pack `.v2-doc` pages now make
each following direct block responsible for its block-start separation; preceding
blocks carry no trailing external margin. This removes accumulated card-grid,
table, diagram and callout spacing while allowing those components to occur
anywhere in a section. Standard flow is 12px. An H2 divider owns 24px before
its rule and 16px of CSS padding after it; the heading line box completes the
optical 24px rule-to-letterform gap. Components retain
only their internal spacing. ODR detail pages keep their intentionally distinct
Markdown reading rhythm.

Where a semantic `section` groups multiple documentation blocks, it is the
local flow owner and applies the same contract to its immediate children. This
prevents table-wrapper bottom margins and following subheading margins from
accumulating inside grouped resource registers.

The shared right-hand page navigation now preserves heading hierarchy rather
than flattening it: H2 entries are roots and H3/H4 entries nest beneath their
nearest preceding parent. Participation is explicit through an authored heading
identifier. Component headings, including headings inside cards, are not
promoted into independent subsections or given synthetic anchors.

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
- The 139-test Chromium release matrix passes: representative WCAG 2.2 AA axe
  scans in both themes, 18 reviewed desktop/mobile light/dark visual baselines,
  keyboard and interaction behaviour, and 320px/400%-equivalent reflow,
  forced-colour and reduced-motion checks.
- Visual comparisons retain the shared 0.5% pixel-difference threshold except for
  the live force-directed graph, whose nondeterministic node placement uses a 2%
  threshold while preserving the same viewport, theme and page-shell assertions.
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
