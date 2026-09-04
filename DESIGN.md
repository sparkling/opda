# OPDA Design System

Version 1.1 · adopted 16 August 2026 · updated 4 September 2026 · scope: opda.org.uk application and its standalone design-system presentation.

This is the normative human contract for OPDA's web interface. It supersedes the earlier cream, terracotta and third-party-inspired system. ADR-0073
records the adoption decision; `public/ui/design-tokens.css` is the machine-readable token projection; `public/ui/design-system.css` imports the live
implementation modules.

## 1. Creative direction

OPDA is an **ink-and-amber data publication**: sharp, bordered, photographic and light by default, with the confidence of a standards body and the
precision of a technical reference.

Five principles govern every surface:

1. **Evidence before decoration.** Source, status and provenance are visible where
   decisions depend on them.
2. **One identity, different densities.** Public narrative and dense schema tools
   share tokens and components without pretending they have the same layout needs.
3. **Amber directs; ink explains.** Yellow calls attention and carries dark text;
   it is not body copy, a status colour or a decorative wash.
4. **Sharp and structural.** Rules, alignment and type create hierarchy. Cards are
   square, elevation is rare and gradients have one controlled use.
5. **Access is part of authority.** Keyboard, contrast, reflow, forced colours and
   reduced motion are release requirements.

For this exercise, the operator delegated visual-design authority for the derived layer to Fable 5 at maximum effort and adopted the resulting
contract. That delegation does not give Fable standards, content, governance or publication authority.

## 2. Evidence model

### Authoritative supplied evidence

Ben Kansy's 23 July 2026 email supplied `OPDA Brand Guidelines Q3 2026.pdf` and `OPDA Vector Logos.zip`.

The guide defines:

- Roboto Slab for titles and H1.
- DM Sans for body, H2–H4 and captions.
- darks `#2C273B` and `#231F2F`.
- yellows `#FEC92B` and `#FAC238`.
- white `#FFFFFF` and off-white `#F9F9F9`.
- documentary collaboration and residential-property photography with dark
  overlays.

The source SVGs define their own embedded colours and geometry. The repository copies and hashes are recorded in `public/ui/brand/manifest.json`.

### Observed evidence

openpropdata.org.uk demonstrates the purple/yellow direction, official mark and people/property photography, but applies the type system
inconsistently and has accessibility defects. The current opda.org.uk app demonstrates content density and specialist controls. The legacy PDTF
developer guide contributes useful guide/code/ table structure. The proposed SmartPropData domain was unreachable when inspected. None of these
observations overrides the supplied guide or vectors.

### Derived decisions

Everything below that the guide did not define—semantic colours, type scale, spacing, layout, states, data visualisation, responsive behaviour,
accessibility, motion and governance—is a recorded design-system decision rather than invented brand evidence.

## 3. Brand assets

Use only the supplied files:

| Role | File | Surface |
|---|---|---|
| Dark wordmark | `/ui/brand/opda-wordmark-dark.svg` | white or off-white |
| White wordmark | `/ui/brand/opda-wordmark-white.svg` | dark ink |
| Yellow icon | `/ui/brand/opda-icon-yellow.svg` | official OPDA house geometry; the paired knowledge-base identity projects its theme colour through this unchanged mask |

Asset colour conflict is resolved by scope: `#131224`, `#FEC82F` and `#FEC92B` inside the SVGs are logo-specific values; the guide values are
interface tokens. Never override an official asset's fills, normalise it during build or reconstruct the mark. A changed source asset creates a new
manifest version and hash.

Provide clear space of at least the icon-stem width around the wordmark. Keep the wordmark horizontal, uncropped and at least 128 CSS pixels wide. The
icon may be a decorative motif but never substitutes for the named organisation where identity would otherwise be ambiguous.

Icon-and-live-text identity uses the shared `BrandHeading.astro` component and `.brand-heading` primitive. Its document variant retains the established property-document card for campaign and footer contexts. The knowledge-base header uses the paired variant: the unboxed official house at `0.9em` and the complete one-colour organisation name form one unwrapped, baseline-aligned lock-up. The adjacent framework lock-up uses the exact name “Smart Property Data Trust Framework” with a `0.72em`, baseline-aligned mark. Party Wall remains the default while the temporary review control can project any recovered contact-sheet mark from the single `header-icons.ts` registry. Both paired lock-ups use the same component-owned compact `0.3em` mark-to-label gap; page containers may scale the lock-ups but must not redefine their internal geometry. Neither paired mark may gain a tile, corner marker, transform or local geometry correction.

## 4. Colour system

### Supplied brand palette

| Token | Value | Use | On-colour |
|---|---:|---|---|
| `brand-ink` | `#2C273B` | dark raised surfaces; ink on yellow | `#FFFFFF` |
| `brand-night` | `#231F2F` | body ink; footer; dark raised surface | `#FFFFFF` |
| `brand-yellow` | `#FEC92B` | primary action; 4px signature rule | `#2C273B` |
| `brand-yellow-active` | `#FAC238` | yellow hover and pressed state only | `#2C273B` |
| `surface-base` | `#FFFFFF` | primary light surface | `#231F2F` |
| `surface-alternate` | `#F9F9F9` | zebra rows, sidebars and asides | `#231F2F` |
| `brand-deep` | `#131224` | header, hero, footer, code and headings | `#FFFFFF` |

Yellow on white is approximately 1.5:1 and cannot carry text, focus, icons, borders or status meaning alone. Dark ink on yellow is approximately
9.3:1.

### Derived neutral ramp

| Token | Value | Use |
|---|---:|---|
| `neutral-100` | `#F1F0F4` | quiet surface |
| `neutral-200` | `#E3E1E9` | default border |
| `neutral-300` | `#CBC8D5` | strong border |
| `neutral-400` | `#A5A1B2` | dark-mode secondary text |
| `neutral-500` | `#817C90` | disabled controls only |
| `neutral-600` | `#625D72` | light-mode secondary text |
| `neutral-700` | `#4A4558` | strong secondary ink |

### Table surfaces

| Role | Light | Dark |
|---|---:|---:|
| Column header | `#2C273B` | `#3A3550` |
| First body column | `#F4F0E4` | `#302C26` |
| Zebra row, columns 2+ | `#F9F9F9` | `#231F2F` |

First-column cells use regular weight. These surfaces are structural roles rather than status colours, and their borders and table semantics retain
the distinction when custom colours are unavailable.

Light-theme column headers use white on deep brand ink (`14.38:1`); dark mode uses the corresponding dark surface tint.

### Links and focus

Links are `#5B51D8`; hover is `#4A41BE`; visited is `#6D3E91`. Prose links are underlined. Focus on light uses a two-colour ring: 2px dark ink outside
2px yellow. On dark surfaces the yellow is outside and deep ink inside. Never suppress outline without this replacement.

Placeholder text uses the dedicated accessible placeholder token: `#625D72` on light surfaces and `#A5A1B2` on dark surfaces. Disabled text and
controls retain `#817C90`; do not reuse disabled styling for placeholders or helper text.

### Semantic status

| State | Foreground | Tint | Dark foreground |
|---|---:|---:|---:|
| Success | `#1E7B4D` | `#E7F4ED` | `#66C28F` |
| Warning | `#8A5A00` | `#FBF1DA` | `#FFB84D` |
| Danger | `#B42318` | `#FBEAE8` | `#FF958A` |
| Info | `#2E5FA3` | `#E9F0FA` | `#7FB5FF` |

Each status combines icon, text label and colour. Brand yellow is never a status.

### Data visualisation

Categorical series use this order and retain direct labels, markers or pattern:

1. violet `#6C5BD4`
2. amber `#C77F00`
3. teal `#0E8478`
4. magenta `#A5317F`
5. slate `#4E6E93`
6. olive `#58810B`
7. rust `#C24E1A`
8. other/mauve-grey `#6E6580`

Sequential data runs `#F1F0F4` to `#2C273B`. Diverging data runs `#6C5BD4` to `#C77F00` through `#F1F0F4`. Charts must remain understandable in
grayscale.

### Dark mode

Dark mode uses `#131224` base, `#231F2F` raised, `#3A3550` borders, `#F9F9F9` text, `#A5A1B2` secondary text and `#A9A0FF` links. Yellow is unchanged.
Every component state must have a dark equivalent; light remains the default.

## 5. Typography

Self-host the three families with `font-display: swap`:

- **Roboto Slab 600–700:** display and H1 only.
- **DM Sans 400–700:** body, H2–H4, labels, controls and captions.
- **Roboto Mono 400–700:** code, sources, timestamps and tabular figures.

| Style | Family/weight | Desktop size/line | Mobile size/line |
|---|---|---:|---:|
| Display | Roboto Slab 600 | 44/52 | 34/42 |
| H1 | Roboto Slab 600 | 36/44 | 30/38 |
| H2 | DM Sans 700 | 28/36 | 28/36 |
| H3 | DM Sans 700 | 22/30 | 22/30 |
| H4 | DM Sans 600 | 18/26 | 18/26 |
| Organisation heading | DM Sans 600 | 36–64/36–64 | 36/36 |
| Lede | DM Sans 400 | 18/28 | 18/28 |
| Body | DM Sans 400 | 16/26 | 16/26 |
| Small/table | DM Sans 400 | 14/22 | 14/22 |
| Caption | DM Sans 500 | 13/18 | 13/18 |
| Overline | DM Sans 700 | 12/16, +0.08em | same |
| Code | Roboto Mono 400 | 14/22 | 14/22 |

The outer layout container is the sole owner of content measure. Every documentation article uses the available content track up to a 1600px maximum.
Headings, leads, paragraphs, lists, quotations, callouts, cards and section copy fill their parent and must not add another `max-width`. This
documentation rule does not apply to the independently authored full-screen working-group kick-off deck, whose slide layouts use deliberate local
measures. Lists have a small tokenised gap above and below, separating them from both their introductory copy and the content that follows. Figures,
tables, diagrams, media and intrinsically sized controls retain their own containment rules. Tables and statistics use `font-variant-numeric:
tabular-nums`. Do not introduce arbitrary type sizes. Fallback fonts are loading and resilience fallbacks only. They must preserve the same
display/body/mono roles, remain readable while web fonts swap, and must not reintroduce the superseded Fraunces/Inter prototype system as a live
alternative.

Documentation flow has one owner. In ordinary `.prose` articles and Property Pack
`.v2-doc` pages, each direct following block owns only its `margin-block-start`;
the preceding block owns no trailing external margin. This makes the gap stable
whether the preceding element is prose, a list, a card grid, a table, a diagram,
a callout or the final element in a section. The standard direct-child gap is
12px. An H2 divider owns 24px before its rule and 16px of CSS padding after it;
the heading line box completes the optical 24px rule-to-letterform gap. H3 and
H4 use their own documented block-start steps. The previous/next region uses
16px from its rule to the navigation panel, matching the panel-to-comments rule
gap below. Bounded content endings also use 16px before the rule. Text-led
endings use 4px after their final line box because the line box itself completes
the optical space. Nested content flows expose the shared `.document-flow` role;
spacing never depends on a route or on the link text.
Components may own internal layout spacing, but must not create separation from
an unknown next sibling. ODR detail pages retain their separately scoped,
Markdown-specific reading rhythm.

When a semantic `section` groups several blocks, it becomes the local flow
owner and applies the same rule to its immediate children. In particular, a
table wrapper must not leave bottom margin before the next subheading: the
following section owns that gap. This preserves the same rhythm for resource
registers and other grouped content without assuming a card grid or table is
the final block.

## 6. Space, shape and elevation

Spacing tokens are 2, 4, 8, 12, 16, 24, 32, 48, 64 and 96px. Components align to the 4px base except optical type adjustments.

Cards, tables, images and heroes use zero radius. Buttons, fields and badges use 2px. Code blocks and dialogs may use 4px; 4px is the ceiling.

Elevation is border-first:

- L0: 1px `#E3E1E9`.
- L1: `0 1px 2px rgb(19 18 36 / 10%)` for sticky chrome.
- L2: `0 8px 24px rgb(19 18 36 / 16%)` for menus and dialogs only.

## 7. Layout and responsive behaviour

The page grid has 12 columns and a 1600px maximum. Until that maximum is reached, the content uses a 16px operational gutter; beyond it, the content
track is centred and the resulting outer space grows evenly.

At 1200px and above, the documentation shell is a 240px left navigation rail, a flexible content track, and an optional 240px on-page rail. The two
rails share one width token. The complete shell is centred at the combined maximum of the content and its visible rails, so surplus viewport space
sits outside the navigation panels rather than between those panels and the content. The content track is the width authority: descendants do not
stack narrower character or pixel measures. The comments section and previous/next navigation use the same centred 1600px content track; previous/next
navigation is enclosed by a 1px border. Below 1200px the on-page rail becomes an in-content disclosure. Below 960px the left navigation is an
off-canvas dialog with focus containment, Escape and focus return. At 640px cards, toolbars and component state boards become one column.

Tables fit the available content track rather than creating a horizontal scrollbar. They use automatic table layout so column proportions follow their content instead of being allocated equally. Column headings and body cells wrap normally; long identifiers, paths, IRIs and hashes use `overflow-wrap: anywhere`. Standalone URI, IRI, URN and CURIE identifiers use unboxed monospace text; ordinary inline code retains its code surface. Visible caption bars are omitted; a semantic caption may remain visually hidden for assistive technology while the nearest section heading gives visible context.
Tables retain scoped headers, row identity and sorting semantics at every width. Pages must reflow at 320px and 400% zoom without page-level or
table-level horizontal scrolling.

At 1536px (96rem) and below, the six-destination global site navigation becomes a non-modal disclosure without independently removing the paired identity. Medium layouts retain both identity lines in a 120px header; at 960px and below the 64px narrow header omits the framework line and selector. Above that
boundary every primary destination must fit without clipping or hidden horizontal overflow. The disclosure button owns `aria-controls` and
`aria-expanded`; the closed panel is both hidden and inert. Escape and link activation close it, and Escape returns focus to the trigger. This is
distinct from the below-960px section navigation, which is a modal off-canvas dialog with background inertness and focus containment.

In forced-colour mode, system colours replace authored fills. Current/selected states retain a border or outline as well as text, status and callout
roles retain their labels and structural borders, and controls, tables and diagrams remain bounded with `ButtonText`, `CanvasText`, `FieldText` and
`Highlight`.

## 8. Application shell and homepage

The desktop header is 176px and theme-aware: light mode uses the white application surface while dark mode uses `#131224`. Its centred inner track is governed by the same maximum width, rail widths and inline gutter as the body shell. A shared 24px desktop header-start token and separate 8px page-content start token control the two independent vertical regions. The header uses explicit grid rows rather than an overlapping identity wrapper: OPDA shares the first row with utilities, an 8px spacer separates it from the SPDTF lock-up and both review selectors in the second content row, and global destination tabs occupy the final row. The first-row heading aligns to the bottom of the utility row; the SPDTF lock-up and review controls align to the top of their shared row. This anchors the second visible line directly after the fixed spacer instead of vertically centring smaller type inside a fixed-height track, preserving the inter-heading distance throughout size-slider changes. The framework mark remains optically bottom-aligned with its own label. Both linked identities end with their visible content rather than stretching across a row; the selectors remain right aligned. In medium and wide headers the OPDA lock-up uses the shared 1.75rem step, with its house scaling proportionally; narrow headers retain the compact treatment.

The default Petrol palette uses olive OPDA and deep petrol framework roles on white, and fixed OPDA yellow `#FEC92B` with blue-petrol framework roles on deep. Three temporary review controls sit together at the right of the framework row. The theme control exposes all ten reviewed palettes—Kiln, Tidewater, Mulberry, Moss, Petrol, Aubergine, Pine, Ledger, Cherry and Harbour—while the icon control exposes all 24 marks in the numbered Fable archive, with Party Wall selected by default. A sliders icon opens the layout-tuning flyout: paired size, OPDA relative size, space underneath SPDTF, space between SPDTF and OPDA, and space above OPDA. Every range displays its live numeric value. Its 20rem tracks and extended ranges support broad visual exploration without sacrificing precise control. The shared tuning flyout remains attached beneath its button and expands down and right on both the homepage and knowledge-base header, clear of the identity to its left. Every mark records the width and bottom edge occupied by its artwork; the shared renderer scales and bottom-aligns the artwork inside a fixed Party Wall-sized SVG box so every icon has the same layout dimensions, apparent width and lower edge without distorting its geometry. A shared optical lift then aligns that lower edge with the visible framework letterforms rather than the display face's descender space. Theme cards preview the complete two-line identity at exactly half the webpage typography—14px OPDA and 22px framework, preserving the live 28:44 relationship. Icon cards instead show only the normalized mark and its name, inheriting the currently selected palette and page colour mode. Each flyout embeds the other synchronized selector so palettes and icons can be compared without closing the current inventory. All flyouts use an isolated overlay layer above document content, with generous internal padding, rounded borders and a lower-right cast shadow. The theme and icon flyouts size to their complete card grids without internal scrolling or clipped labels: four 22rem columns for icons and two 36rem columns for themes. The selected icon field uses a compact fixed 7rem width sized for its label, two-digit archive number and disclosure marker, avoiding truncation without changing the flyout cards. Attached previous and next buttons cycle the same ordered registries; direct selections and arrow changes persist locally. The complete selector drawer can be slid in or out using its adjacent disclosure button. The sliders icon, icon selector, theme selector and disclosure button share one horizontal control row. The controls change only semantic colour roles or framework geometry: the identity names and house mask never change. All flyouts are keyboard operable, close on Escape or selection, close one another when opened, and are omitted with the framework row only in the narrow header and in print.

The larger framework lock-up uses the display face at the shared 2.75rem step, one step larger than the 2.25rem page H1. The homepage reuses the same selector drawer directly above the Working Group Domains panel, right aligned. Both the homepage and knowledge-base header expose the same range control with a live numeric output; it scales their OPDA and framework lines and both icons through one shared identity-size property. The control defaults to 24 and spans 12–36, placing 24 at the exact 50% midpoint. The title, framework and first global-navigation label follow the main content gutter and centred maximum-width axis. The desktop utility controls align with the organisation-title line and finish at the shared content-right edge. A house icon provides an additional labelled home action beside search; both header identities also link home. The six content destinations are followed by a seventh horizontal item for the cross-site Search task; Search does not become a content destination or homepage directory card. The right-aligned action group finishes on the content track's right edge. Its transparent membership action precedes the yellow working-group action, and both use standard full-height 44px buttons with centred labels. The desktop navigation track is 52px high and ends at the unchanged divider. Navigation labels use DM Sans 600 at the base text size; the current item has a 4px amber underline and `aria-current`. At 96rem and below, navigation uses its disclosure; the paired identity remains through medium widths and changes to the compact 64px treatment only at 60rem and below. A skip link is the first focusable element. The light/dark control is one shared Astro component on the application shell, homepage and join page. Its 44px target is borderless, square and transparent in every context; it inherits the surrounding foreground colour while the shared theme state determines which icon is visible. Theme, palette and selected framework icon are copied to the incoming document before Astro view-transition swaps so navigation cannot reset appearance. The quiet divider below the global tabs spans the
content track only, and the first tab has no additional left inset. Breadcrumb ancestors occupy one 32px context row between the global navigation and the page title. When no breadcrumb context exists, the article begins at the shell inset and reserves no empty row, moving the title and complete following flow up. Breadcrumbs add no block padding around their shared 32px compact inline-navigation targets and contain navigable ancestors below the global destination only;
a link-coloured chevron is optically aligned with the label baseline between them. The current page is named by the H1 rather than repeated as an
unlinked terminal crumb. The destination already named by the horizontal navigation is never repeated. No metadata strip or repeated category appears between the breadcrumbs and the H1; the breadcrumb leads directly into the
page title. The retired `PageMeta` component and its call sites are removed, so hidden legacy metadata cannot trigger document-flow sibling spacing above the H1. `Layout.astro`
renders `Breadcrumbs.astro` as the only page-level breadcrumb implementation. Wrappers with qualified document titles supply a concise
`breadcrumbTitle` but never their own breadcrumb markup or CSS. Schema-object locations and resource-folder paths remain separate in-content
navigation with location, rather than page, semantics. Property Pack pages place their candidate-status information control on the H1 row, aligned to
the content track's right edge. A borderless 44px target combines the shared Lucide `MessageCircle` outline with an italic information glyph to
identify explanatory candidate context and opens a non-modal, tokenised flyout containing the complete candidate status, validation boundary and
six-stage lifecycle record formerly shown in a full-width warning disclosure. It exposes expanded state, supports Escape, restores focus when
dismissed from within and does not add its internal title to the page table of contents. The `#F9F9F9` sidebar keeps the current section in its
accessible name without repeating it visibly. The footer has a 4px yellow top rule. `SiteFooter.astro` renders once outside article content and
navigation rails on the root landing, every route using the shared `Layout`, and the standalone public-service family. One desktop row presents “Developed by Sparkling Ideas”, the centred linked OPDA icon-and-name lock-up to the Association website, then the Privacy and Accessibility exits; the existing expert tagline remains beneath the credit. The left-aligned
Sparkling Ideas credit and right-aligned footer links sit directly on the shared content edges; the centred OPDA lock-up remains on the page axis. The complete row moves one text line upward by redistributing 16px of container padding from above to below, preserving the footer’s overall padding without transforming individual elements, and
the footer gutter adds no secondary inner inset at desktop widths. The footer renders the shared icon-and-live-text heading component at its compact
14px scale; its relative `1.35em` tile and proportional gap resize with the text as one unit. Privacy and Accessibility use the same muted colour and regular weight as plain
footer text; organisation and delivery-credit emphasis remain distinct. Previous/next navigation follows the article and precedes the comments
divider. It retains its bordered bar and adds a separate full-track divider above it. The shared region owns distinct before-rule and after-rule
spacing variables: the panel sits 16px from the rule above and the comments rule below. Bounded content endings sit 16px above the upper rule;
text-led endings use 4px of CSS space because their final line box completes the optical gap. When comments are present, the article adds no trailing
padding and the comments section owns its divider, preventing stacked empty space.

At desktop rail widths, the section navigation and page-contents rail share one width and alternate surface. Their collapse controls are full-bleed
utility bands, not navigation rows: “In this section” on the left and “On this page” on the right use compact uppercase mono labels, quiet dividers
and double chevrons. A collapsed rail becomes a full-height 44px labelled spine anchored to the content-facing edge of its reserved 240px track. The
track and corresponding header offset remain fixed, so expanding or collapsing either rail never moves or resizes the middle content. The visible
page-contents tree follows the document heading hierarchy: H2 entries are roots, with H3 and H4 links nested beneath their nearest preceding parent.
Only intentionally anchored structural headings participate; headings inside cards and other components remain content, not independent subsections.
label is the control's accessible name; no selected-page tint, amber marker or `aria-current` treatment is used. Opening and closing ease the panel
width over a deliberate 320ms composite of shared motion tokens while its links fade and move slightly towards the outside edge. Stable inside-edge
anchoring prevents either rail from snapping before the transition starts; reduced-motion mode makes it effectively instant.
Within the left rail, linked folder labels replace per-branch disclosure controls. Navigation opens the active trail, and each nested list adds one
8px indentation step. No arrow, icon gutter or per-depth control column consumes label width.

`/` is the sole OPDA Knowledge Base homepage. It uses an SPDTF-centred hero, a static method figure, a featured working-group presentation, the
six-destination audience/task directory, a participation action and the footer. The directory comes from the canonical global-navigation registry and
uses the shared linked-card contract. The root has no separate top navigation bar: the brand sits in the hero and the directory supplies the primary
routes. The PDTF schema remains discoverable only within SPDTF's attributed inputs, not as a hero, status item, primary action or peer destination.

Destination-card titles use the theme-aware interactive violet (`color-link`) so they remain visually distinct from their section heading while
signalling that the whole card is a linked destination.

Its sequence is:

1. Theme-aware split hero using `/join`'s full-width radial/diagonal composition, centred 92rem grid,
   the same paired OPDA and SPDTF heading components as the application header at display scale, a short Slab headline, three actions and working-group domain register.
   It uses deep ink in dark mode and white/warm-neutral surfaces in light mode without structural change.
2. Static, accessible AI-assisted modelling loop with source material, a published candidate,
   returning feedback and a consensus-gated draft-standard outcome.
3. Prominent editorial link to the working-group kick-off deck.
4. Six linked entry cards, in the accepted order, for Programme, Governance,
   Modelling, Development, Groups and Resources.
5. Bounded participation call to action.
6. Theme-aware shared footer.

`/home` is retired without a redirect, rewrite alias or duplicate page. All internal homepage links use `/`.

No floating screenshots, generic illustration clutter or ungoverned synthetic imagery. The generated method infographic is the bounded exception
defined below. The presentation feature is an editorial tile, not an embed.

`/join`, `/join/privacy` and `/accessibility` form one public-service family. The recruitment campaign remains a standalone composition, with the
linked organisation heading, transparent OPDA return control and theme control on one content-width hero row. Privacy and accessibility use the
standard Knowledge Base `Header` so their global navigation and utilities match `/programme`, but explicitly omit both side rails, breadcrumbs,
comments and previous/next navigation. Their global tabs do not mark a current Knowledge Base destination. All three routes use the same tokens, type,
buttons, fields, focus states and shared footer. The join campaign uses seven natural chapters from the practical invitation and reasons to
participate through programme context, contribution, trust and the full theme-aware form. Technical modelling detail stays in the Knowledge Base. The
campaign never uses parallax, pinned scrolling, delayed reveals or interaction-gated meaning.

## 9. Components

Every interactive component provides default, hover, active, focus and disabled states, plus loading/error/success where asynchronous work occurs and
dark parity.

- **Buttons:** primary yellow/black, outlined secondary, ghost, and danger red/white; minimum height 44px; pressed state translates inward by 1px. The shared compact variant preserves the target height while reducing horizontal padding for space-constrained labelled actions.
- **Inputs/selects:** 2px radius, 1px strong-neutral border, explicit label and help; error adds danger border, icon and message.
- **Tabs:** semantic tablist, arrow-key operation and yellow-underlined selection.
- **Breadcrumbs:** ordered links to navigable ancestors only; the H1 names the current page. Use DM Sans 500 at the base 16px role with a 24px line-height, the shared 32px compact inline-navigation target, no additional block padding and link-coloured decorative chevrons aligned to the label baseline. When no ancestor exists, omit the breadcrumb region and its row so the title and following content move up together. The compact target remains above the WCAG 2.2 minimum while keeping the hierarchy visually connected to the page title; button-sized 44px targets remain reserved for controls.
- **Header actions:** a shared flex group aligns the transparent secondary “Become a member” action immediately before the primary “Join a working group” action at the content-right edge. Both use the shared 44px compact button variants. The 52px desktop navigation track leaves 8px beneath the full visible buttons without an inset surface, clipping or positional override; the compact disclosure keeps the pair right-aligned in normal flow.
- **Header utilities:** familiar single-purpose destinations may use 20px icons in 44px targets, with an accessible name and tooltip. On desktop the group has no trailing inset, ends on the header's physical right edge and retains 16px above it. The theme icon has no visible border or box; icons never replace the CTA label.
- **Organisation heading:** the unchanged yellow icon sits on the theme-aware dark tile beside the full organisation name in one unbroken line of live DM Sans text, with the visible icon and text block bottom-aligned. Use deep ink for the name on light surfaces and yellow for the name on dark. Relative tile and gap units let every scale resize as one component.
- **Section heading:** a shared optional uppercase DM Sans eyebrow, display H2 and optional lead. Use it for distinct subjects; do not recreate local eyebrow scales or heading spacing.
- **Sidebar hierarchy:** folder rows remain linked pages. Every parent uses the leaf-link DM Sans scale and sentence case with stronger weight and a restrained, theme-aware navigation-parent colour mixed toward body text; top-level parents also receive a hairline lower edge. Selection preserves the item’s existing typography in both themes, so a selected leaf remains regular and a selected parent remains bold; only the shared active background, foreground and yellow rule are added. This distinguishes structural roles without icons or additional row height. Navigating to a folder opens its active trail. Indentation alone expresses recursive nesting in 8px steps; branch arrows, open/closed indicators, guide rules and reserved disclosure gutters are not used. The navigation has an 8px outer inline inset and top-level rows add no second inline margin, preserving useful label width.
- **Status badge:** icon, complete text label and tint; never a bare dot.
- **Campaign panel list:** use large, restrained semantic icons with an adjacent title and description; icons reinforce rather than replace text and are hidden from assistive technology.
- **Provenance chip:** Roboto Mono source and timestamp; links to evidence when available.
- **Callout:** note/success/warning/danger with 3px semantic rule, icon and heading.
- **Card:** square, bordered and content-led, with a quiet structural top rule and a
  clear title, explanation and action hierarchy. Optional eyebrows, scope notes and
  aligned fact rows support comparison without turning every card into a dashboard.
  Linked cards use one whole-card target and focus treatment without nested controls;
  grids auto-fit the content track and stack without clipping at narrow widths.
  Destination cards use the shared `h3` title scale, even in their wider three-column
  homepage and Programme grids.
- **Table:** sticky header, `aria-sort`, visible sort arrow and tabular numerals;
  column headers, first-column body cells and zebra rows use three distinct semantic
  surfaces, while interactive rows are at least 44px. Every body-row first cell uses
  regular body weight on a quiet warm-neutral surface; zebra striping starts at column
  two. This tint communicates structure, not status or selection. Two or more repeated records with a
  consistent label and explanation belong in a semantic two-column table, not a
  styled list; ordinary bullets, steps and navigation remain lists.
- **Code/schema block:** deep ink, Roboto Mono, accessible syntax colour, language
  label and copy action.
- **Diagram frame:** one shared GraphDiagram shell and Mermaid renderer own the white surface,
  1px border, numbered caption, theme, pan/zoom and keyboard controls. Every diagram has an
  authored accessible title, description and prose equivalent; overview diagrams stay within
  nine nodes and twelve arrows. Static teaching SVGs never infer links or property kinds from labels. Ontology diagrams opt in through
  explicit source metadata to datatype-property, object-property and inheritance filters; datatype
  fields default hidden while object and inheritance links default visible. Other diagrams are unchanged.
- **Generated process infographic:** use checked-in light and dark images, not a client-side runtime, when a stable public explanation needs specialist composition. Both variants preserve identical
  wording, geometry and direction, use the theme palette, omit identity marks and retain equivalent semantic HTML. Record model and prompt provenance and human review; use an efficient web format. Load only the active
  wide-screen theme, with semantic HTML at narrow widths, forced colours and print. Show cycles and conditional
  exits accurately, and distinguish AI assistance from human decision authority.
- **Recruitment group card:** plain label, practical scope and one action that carries
  the selected group to the signup form. Use a three-column maximum, preserve ordinary
  HTML reading order and do not use modelling terminology to explain audience choices.
- **Public statement:** dated privacy or accessibility content in a full-track flow beneath the standard global header, without side navigation, nested width limits or unevidenced compliance claims.
- **Newsletter subscription:** one reusable form powers a header-triggered native dialog and `/subscribe` fallback. It uses the six canonical working-group choices, explicit consent, a separate privacy notice and its own validated storage boundary. The wide dialog has no arbitrary fixed-height cap and presents choices in three columns where space permits, avoiding an internal scrollbar at ordinary desktop sizes; constrained-height viewports retain safe scrolling. The mail icon remains a normal link until enhancement is ready.
- **Feedback states:** skeleton, labelled loading, empty-state explanation, error recovery and non-obscuring toast.

## 10. Knowledge and data patterns

A standards page begins with status, owner, version and last-reviewed metadata, then summary, normative content, examples, provenance and related
implementation. Draft, candidate, adopted, deprecated and superseded states use explicit words and icons, not palette substitutions.

An evidence panel identifies source type, title, publisher, date, retrieved date, location, confidence and whether the statement is quoted, inferred
or proposed.

A data browser keeps search, filters, result count and reset action in one labelled toolbar. Applied filters remain visible as removable controls.
Sorting, pagination, loading, empty and error states announce changes without moving keyboard focus.

Site search has one authoritative local index, one ranking function and one facet vocabulary (`site-search-model.mjs`). The index is generated from
every emitted page by one HTML extractor, in production from the built site and in development from routes rendered through the live dev server, and
generated templates declare their own facets through `opda:search-*` meta tags. The `/search` route is the shareable
rich-results view: a native GET form whose filter rail contains multi-select content-type checkboxes (ontology resources, decision records, working groups, guides and pages) alongside
facet checkboxes for the six canonical horizontal-navigation sections, collection, resource kind, working group or domain and decision status. All controls write URL parameters, and section labels come directly from the global navigation registry. Page type is not a current facet: corpus evidence showed that its inferred route-family values duplicated Section or Collection rather than forming an independently authored taxonomy. Schema-3 `opda:search-page-type` metadata remains accepted while existing templates and cached indexes migrate, but it does not affect ranking or card labels. Existing `pagetype` URLs retain their exact filter as a removable legacy chip without exposing Page type for new selections. Facet groups appear only in
the scope where they are meaningful; the `All` scope exposes their complete six-group union. The filter collection uses the section rail itself as its sole containing boundary rather than nesting a second border inside it. Checkbox rows use the shared compact control target with an 8px vertical group gap, carry live counts, and sit in a rail beside the results on wide viewports or behind a labelled toggle below it.
Applied filters remain visible as removable chips. Results are square register cards in two columns on desktop, sharing one anatomy (eyebrow, status
pill, title, summary, base-aligned facts) with a variant rule and facts per result type: ontology resources show kind, domain, identifier and
collection; decision records show record number, register, status and date; working-group pages show domain and convening state; other pages show
their current collection or section plus authority and maturity from the IA status registry. Visible counts are separate from
debounced live announcements, URL updates are debounced, and native reset plus explicit zero-result recovery keep the form predictable. The header
link enhances only when ready into a native quick-search dialog with an accessible name but no visible heading, close icon, instructions, legend or
verbose metadata. It loads the same shared index on first use and shows each result's eyebrow and title plus a live link to full search. Command/Control+K and
`/` open it outside editable controls; arrows select, Enter follows, and Escape or the backdrop closes and restores focus. The dialog uses standard
elevation, the four-pixel amber rule, semantic light/dark tokens, forced-colour outlining and reduced-motion timing. Ranking remains deterministic;
the search lifecycle reinitialises after client-side page transitions without collecting or transmitting query history.

A governance decision distinguishes proposal, review, disposition and adopted outcome. Publication never implies ratification.

## 11. Imagery, motif and motion

Photography shows real people collaborating and real residential property. Record rights, source, consent where relevant, focal point and alt-text
decision before use. Apply `#131224` overlays at 55–70% when text sits on an image and verify the final crop. Decorative partner marks receive an
equivalent text list.

Generative imagery is not used in the OPDA identity. The supplied AI poster is removed. The sole recurring decorative motif is a 4px amber rule used
for headlines, active navigation and footer structure; it does not imitate or redraw the logo. The root homepage and `/join` intentionally share one
static radial/diagonal campaign-hero background treatment. The method figure and presentation tile carry editorial meaning and are not recurring
identity motifs.

Motion lasts 120–200ms, uses ease-out for entry and ease-in for exit, and normally changes only opacity or transform. Fixed-track navigation
disclosures may animate their panel width because the reserved grid tracks prevent any surrounding layout movement. There is no parallax, autoplay
carousel, animated gradient or looping ambient movement. Reduced motion removes transforms and reduces non-essential transitions to effectively
instant. These shared-system motion rules do not replace the working-group deck's self-contained motion contract.

Campaign handoff comparisons use ordinary document flow and natural-height cards. They never pin a visual while requiring readers to traverse
forced-height panels. If optional reveal feedback is unavailable or reduced motion is requested, every term, definition, scope and explanation remains
visible in its final position.

## 12. Standalone presentation

The local presentation in `docs/design-system-site/` is a review artefact, not a duplicate application. A fixed deep-ink rail numbers chapters in
amber Roboto Mono:

01 Overview · 02 Foundations · 03 Brand · 04 Components · 05 Data display · 06 Motion · 07 Patterns · 08 Accessibility · 09 Governance · 10
Implementation.

Each chapter opens with an ink band and oversized Slab numeral, then a white specimen surface. Foundations includes computed contrast beside swatches;
Components shows all states and dark parity; Data includes categorical, sequential, diverging and grayscale specimens; Implementation shows the actual
CSS custom properties. On mobile the rail becomes an accessible dialog-style drawer.

## 13. Governance and acceptance

Changes identify their evidence tier and update the contract, tokens, presentation and tests together. Supplied assets and guide values change only
when newer source evidence is recorded. Derived decisions may evolve through an ADR or proportionate review; the system is designed to change without
losing provenance.

Every live route belongs to one explicit visual family:

| Family | Routes/pattern | Owner |
|---|---|---|
| Public entry | `/` | hero/status, method figure, presentation feature, canonical directory, join action and shared `SiteFooter` |
| Knowledge base | prose, governance and catalogue routes | shared `Layout` shell and `SiteFooter` |
| Data and V2 | data browser, validation and V2 reference routes | shared tokens plus dense data patterns |
| Schema/manual | generated schema, ontology and manual reference routes | shared shell plus labelled table/diagram patterns |
| Public service | `/join`, `/join/privacy`, `/accessibility`, `/subscribe/**` | minimal public layouts, shared `SiteFooter`, public statements and safely enhanced forms |
| Groups | workspaces and member guidance | standard shared `Layout`, left section navigation and Knowledge Base footer |
| Presentation | working-group kickoff deck | isolated, self-contained full-screen presentation using its original local visual tokens; no site chrome |

Release validation runs against the built artefact before any deployment: source contract tests, deterministic schema checks, a built-route asset and
application-navigation crawl, and Playwright smoke, keyboard, responsive, axe and visual-diff suites. The rendered matrix includes every route family
at desktop light and mobile dark, plus explicit forced-colour and reduced-motion checks.

Release gates:

1. Text contrast, including placeholders and helper text, is at least 4.5:1
   (3:1 for large text); controls and graphics are at least 3:1.
2. Targets are at least 44×44px except inline prose links.
3. Every interactive element has the two-colour focus treatment.
4. Status has icon, text and colour; charts survive grayscale.
5. Complete keyboard paths exist; no interaction is drag-only.
6. Yellow never renders as text or sole functional boundary on a light surface.
7. Official SVG geometry, embedded colours and hashes survive the build.
8. Motion is at most 200ms and reduced-motion behaviour is equivalent.
9. Only Roboto Slab, DM Sans and Roboto Mono are referenced by the live system.
10. Every image has recorded provenance and an alt/decorative decision; no
    generative identity imagery ships.
11. Every component state has dark-mode parity.
12. Fonts are self-hosted; fallback rendering stays readable, preserves type
    roles and does not cause destructive layout shift.
13. Every route belongs to a declared visual family and the representative browser
    matrix passes without tagged WCAG axe findings, runtime errors, broken
    resources or page-level overflow.
14. The design module graph is content-hashed as one cache version, and mutable CDN
    imports are not part of the shared shell.

## 14. Explicitly rejected

The replacement does not use the earlier Fraunces/Inter, cream/terracotta visual language; generic government-blue chrome; 12–16px SaaS card radii;
pill-shaped buttons; glassmorphism; stacked decorative shadows; colour-only status dots; unlabelled icon-only controls; centred marketing heroes with
floating product shots; or synthetic brand imagery.

DESIGN AUTHORITY SIGN-OFF — Fable 5 · max effort
