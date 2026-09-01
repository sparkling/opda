# OPDA Design System

Version 1.1 · adopted 16 August 2026 · updated 1 September 2026 · scope: opda.org.uk application and its
standalone design-system presentation.

This is the normative human contract for OPDA's web interface. It supersedes the
earlier cream, terracotta and third-party-inspired system. ADR-0073 records the
adoption decision; `public/ui/design-tokens.css` is the machine-readable token
projection; `public/ui/design-system.css` imports the live implementation modules.

## 1. Creative direction

OPDA is an **ink-and-amber data publication**: sharp, bordered, photographic and
light by default, with the confidence of a standards body and the precision of a
technical reference.

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

For this exercise, the operator delegated visual-design authority for the
derived layer to Fable 5 at maximum effort and adopted the resulting contract.
That delegation does not give Fable standards, content, governance or
publication authority.

## 2. Evidence model

### Authoritative supplied evidence

Ben Kansy's 23 July 2026 email supplied `OPDA Brand Guidelines Q3 2026.pdf` and
`OPDA Vector Logos.zip`.

The guide defines:

- Roboto Slab for titles and H1.
- DM Sans for body, H2–H4 and captions.
- darks `#2C273B` and `#231F2F`.
- yellows `#FEC92B` and `#FAC238`.
- white `#FFFFFF` and off-white `#F9F9F9`.
- documentary collaboration and residential-property photography with dark
  overlays.

The source SVGs define their own embedded colours and geometry. The repository
copies and hashes are recorded in `public/ui/brand/manifest.json`.

### Observed evidence

openpropdata.org.uk demonstrates the purple/yellow direction, official mark and
people/property photography, but applies the type system inconsistently and has
accessibility defects. The current opda.org.uk app demonstrates content density and
specialist controls. The legacy PDTF developer guide contributes useful guide/code/
table structure. The proposed SmartPropData domain was unreachable when inspected.
None of these observations overrides the supplied guide or vectors.

### Derived decisions

Everything below that the guide did not define—semantic colours, type scale,
spacing, layout, states, data visualisation, responsive behaviour, accessibility,
motion and governance—is a recorded design-system decision rather than invented
brand evidence.

## 3. Brand assets

Use only the supplied files:

| Role | File | Surface |
|---|---|---|
| Dark wordmark | `/ui/brand/opda-wordmark-dark.svg` | white or off-white |
| White wordmark | `/ui/brand/opda-wordmark-white.svg` | dark ink |
| Yellow icon | `/ui/brand/opda-icon-yellow.svg` | dark or decorative context |

Asset colour conflict is resolved by scope: `#131224`, `#FEC82F` and `#FEC92B`
inside the SVGs are logo-specific values; the guide values are interface tokens.
Never override an official asset's fills, normalise it during build or reconstruct
the mark. A changed source asset creates a new manifest version and hash.

Provide clear space of at least the icon-stem width around the wordmark. Keep the
wordmark horizontal, uncropped and at least 128 CSS pixels wide. The icon may be a
decorative motif but never substitutes for the named organisation where identity
would otherwise be ambiguous.

Icon-and-live-text identity uses the shared `.brand-lockup` primitive. Its icon width
is `0.89em` and its icon-to-text gap is `0.45em`, so both scale with the consuming
title rather than becoming independent pixel values. The icon is baseline-aligned
with the live text. Dark-surface lock-ups use `brand-yellow`; light-surface lock-ups
use `brand-deep`. Components must not add transforms or local colour overrides.

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

Yellow on white is approximately 1.5:1 and cannot carry text, focus, icons, borders
or status meaning alone. Dark ink on yellow is approximately 9.3:1.

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

First-column cells use regular weight. These surfaces are structural roles rather
than status colours, and their borders and table semantics retain the distinction
when custom colours are unavailable.

Light-theme column headers use white on deep brand ink (`14.38:1`); dark mode
uses the corresponding dark surface tint.

### Links and focus

Links are `#5B51D8`; hover is `#4A41BE`; visited is `#6D3E91`. Prose links are
underlined. Focus on light uses a two-colour ring: 2px dark ink outside 2px yellow.
On dark surfaces the yellow is outside and deep ink inside. Never suppress outline
without this replacement.

Placeholder text uses the dedicated accessible placeholder token: `#625D72` on
light surfaces and `#A5A1B2` on dark surfaces. Disabled text and controls retain
`#817C90`; do not reuse disabled styling for placeholders or helper text.

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

Sequential data runs `#F1F0F4` to `#2C273B`. Diverging data runs `#6C5BD4` to
`#C77F00` through `#F1F0F4`. Charts must remain understandable in grayscale.

### Dark mode

Dark mode uses `#131224` base, `#231F2F` raised, `#3A3550` borders, `#F9F9F9`
text, `#A5A1B2` secondary text and `#A9A0FF` links. Yellow is unchanged. Every
component state must have a dark equivalent; light remains the default.

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

The outer layout container is the sole owner of content measure. Every documentation
article uses the available content track up to a 1600px maximum. Headings, leads,
paragraphs, lists, quotations, callouts, cards and section copy fill their parent and
must not add another `max-width`.
This documentation rule does not apply to the independently authored full-screen
working-group kick-off deck, whose slide layouts use deliberate local measures.
Lists have a small tokenised gap above and below, separating them from both their
introductory copy and the content that follows.
Figures, tables, diagrams, media and intrinsically sized controls retain their own
containment rules. Tables and statistics use `font-variant-numeric: tabular-nums`.
Do not introduce arbitrary type sizes.
Fallback fonts are loading and resilience fallbacks only. They must preserve the
same display/body/mono roles, remain readable while web fonts swap, and must not
reintroduce the superseded Fraunces/Inter prototype system as a live alternative.

## 6. Space, shape and elevation

Spacing tokens are 2, 4, 8, 12, 16, 24, 32, 48, 64 and 96px. Components align to
the 4px base except optical type adjustments.

Cards, tables, images and heroes use zero radius. Buttons, fields and badges use
2px. Code blocks and dialogs may use 4px; 4px is the ceiling.

Elevation is border-first:

- L0: 1px `#E3E1E9`.
- L1: `0 1px 2px rgb(19 18 36 / 10%)` for sticky chrome.
- L2: `0 8px 24px rgb(19 18 36 / 16%)` for menus and dialogs only.

## 7. Layout and responsive behaviour

The page grid has 12 columns and a 1600px maximum. Until that maximum is reached,
the content uses a 16px operational gutter; beyond it, the content track is centred
and the resulting outer space grows evenly.

At 1200px and above, the documentation shell is a 240px left navigation rail,
a flexible content track, and an optional 240px on-page rail. The two rails share one
width token so they hug their navigation content without changing width between pages. The content track is
the width authority: descendants do not stack narrower character or pixel measures.
The comments section and previous/next navigation use the same centred 1600px content
track; previous/next navigation is enclosed by a 1px border.
Below 1200px the on-page rail becomes an in-content disclosure. Below 960px the
left navigation is an off-canvas dialog with focus containment, Escape and focus
return. At 640px cards, toolbars and component state boards become one column.

Tables fit the available content track rather than creating a horizontal scrollbar.
They use automatic table layout so column proportions follow their content instead of
being allocated equally. Column headings and body cells wrap normally; long identifiers,
paths, IRIs and hashes use `overflow-wrap: anywhere`. Standalone URI, IRI, URN and CURIE
identifiers use unboxed monospace text; ordinary inline code retains its code surface.
Visible caption bars are omitted; a semantic caption may
remain visually hidden for assistive technology while the nearest section heading gives
visible context. Tables retain scoped headers, row identity and sorting semantics at every
width. Pages must reflow at 320px and 400% zoom without page-level or table-level
horizontal scrolling.

At 1536px (96rem) and below, the six-destination global site navigation is a
non-modal disclosure anchored to the compact 64px header. Above that boundary every primary
destination must fit without clipping or hidden horizontal overflow. The disclosure
button owns `aria-controls` and `aria-expanded`; the closed panel is both hidden and
inert. Escape and link activation close it, and Escape returns focus to the trigger.
This is distinct from the below-960px section navigation, which is a modal off-canvas
dialog with background inertness and focus containment.

In forced-colour mode, system colours replace authored fills. Current/selected
states retain a border or outline as well as text, status and callout roles retain
their labels and structural borders, and controls, tables and diagrams remain
bounded with `ButtonText`, `CanvasText`, `FieldText` and `Highlight`.

## 8. Application shell and homepage

The desktop header is 160px, `#131224`, and has three rows: the primary linked “Open Property Data Association”
title with a bottom-aligned yellow icon, the smaller “Smart Property Data Framework” subheading, then the global
destination tabs. The title, subheading and first global-navigation label follow the main content gutter and centred
maximum-width axis; the utility icons remain at the physical top right. There is no separate top-left logo cell in this
shell. The title lock-up consumes the shared relative icon, gap, alignment and colour contract and gives the
subheading its own vertical breathing room.
Navigation is DM Sans; the current item has a 4px amber
underline and `aria-current`. At 96rem and below, the header returns to its compact 64px disclosure
pattern. A skip link is the first focusable element.
The quiet divider below the global tabs spans the content track only, and the first tab has no additional
left inset. Breadcrumbs have balanced spacing above and below. No metadata strip or repeated category
appears between the breadcrumbs and the H1; the breadcrumb leads directly into the page title.
The `#F9F9F9` sidebar keeps the current section in its accessible name without repeating it visibly.
The footer has a 4px yellow top rule. `SiteFooter.astro` renders once outside article content and
navigation rails on the root landing, every route using the shared `Layout`, and the standalone
public-service family. It carries privacy and accessibility exits, a centred linked OPDA icon-and-name
lock-up to the Association website, plus the linked Sparkling Ideas credit.

At desktop rail widths, the section navigation and page-contents rail share one width and alternate
surface. Their collapse controls are full-bleed utility bands, not navigation rows: “In this section” on
the left and “On this page” on the right use compact uppercase mono labels, quiet dividers and double
chevrons. A collapsed rail becomes a full-height 44px labelled spine and its grid track contracts with it,
so the article reflows into the released width and the header follows the new content edge. The visible label is the control's
accessible name; no selected-page tint, amber marker or `aria-current` treatment is used.

`/` is the sole OPDA Knowledge Base homepage. It uses an SPDTF-centred hero, a static method figure,
a featured working-group presentation, the six-destination audience/task directory, a participation
action and the footer. The directory comes from the canonical global-navigation registry and uses the
shared linked-card contract. The root has no separate top navigation bar: the brand sits in the hero
and the directory supplies the primary routes. The PDTF schema remains discoverable only within
SPDTF's attributed inputs, not as a hero, status item, primary action or peer destination.

Destination-card titles use the theme-aware interactive violet (`color-link`) so they remain visually
distinct from their section heading while signalling that the whole card is a linked destination.

Its sequence is:

1. Theme-aware split hero using `/join`'s full-width radial/diagonal composition, centred 92rem grid,
   shared icon-and-name heading, short Slab headline, three actions and working-group domain register.
   It uses deep ink in dark mode and white/warm-neutral surfaces in light mode without structural change.
2. Static, accessible AI-assisted modelling loop with source material, a published candidate,
   returning feedback and a consensus-gated draft-standard outcome.
3. Prominent editorial link to the working-group kick-off deck.
4. Six linked entry cards, in the accepted order, for Programme, Governance, Semantic
   modelling, SPDTF Development, Working groups and Resources.
5. Bounded participation call to action.
6. Theme-aware shared footer.

`/home` is retired without a redirect, rewrite alias or duplicate page. All internal
homepage links use `/`.

No floating screenshots, generic illustration clutter or ungoverned synthetic imagery. The generated method
infographic is the bounded exception defined below. The presentation feature is an editorial tile, not an embed.

`/join`, `/join/privacy` and `/accessibility` form one standalone public-service
family. They use the official wordmark, tokens, type, buttons, fields, focus and
status primitives without the Knowledge Base header, rail, breadcrumb, contents or
previous/next furniture. Public statements retain a minimal masthead; `/join` instead
places the linked organisation heading, transparent OPDA return control and theme control on one
content-width hero row. The same shared footer repeats the public-service exits. The join campaign uses seven
natural chapters from the practical invitation and reasons to participate through
programme context, contribution, trust and the full theme-aware form. Technical modelling detail stays in the
Knowledge Base. The campaign never uses parallax, pinned scrolling, delayed reveals
or interaction-gated meaning.

## 9. Components

Every interactive component provides default, hover, active, focus and disabled
states, plus loading/error/success where asynchronous work occurs and dark parity.

- **Buttons:** primary yellow/black, outlined secondary, ghost, and danger red/white;
  minimum height 44px; pressed state translates inward by 1px.
- **Inputs/selects:** 2px radius, 1px strong-neutral border, explicit label and help;
  error adds danger border, icon and message.
- **Tabs:** semantic tablist, arrow-key operation and yellow-underlined selection.
- **Breadcrumbs:** ordered navigation with a non-linked current item. Use DM Sans
  500 at the base 16px role with a 24px line-height; links have a 44px target.
  They sit flush between the header and article without added outer spacing.
- **Header action:** one yellow primary action may sit at the utility end of the
  application header; it uses a short verb-led label and remains available in the
  compact navigation disclosure.
- **Header utilities:** familiar single-purpose destinations may use 20px icons in 44px targets, with an accessible name and tooltip; icons never replace the CTA label.
- **Organisation heading:** the unchanged yellow icon plus the full organisation name in one unbroken line of live DM Sans text; use strong ink on light and the inverse treatment on dark.
- **Section heading:** a shared optional uppercase DM Sans eyebrow, display H2 and optional lead.
  Use it for distinct subjects; do not recreate local eyebrow scales or heading spacing.
- **Sidebar disclosure:** linked folder rows in a task-oriented hierarchy use a quiet
  tinted surface, structural border and bold label so they are distinct from leaf
  links. A separate 44px disclosure button expands each branch; its label opens the page.
- **Status badge:** icon, complete text label and tint; never a bare dot.
- **Campaign panel list:** use large, restrained semantic icons with an adjacent title and description; icons reinforce rather than replace text and are hidden from assistive technology.
- **Provenance chip:** Roboto Mono source and timestamp; links to evidence when
  available.
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
- **Public statement:** dated, single-purpose privacy or accessibility content in a
  consistent heading/content grid; targets and limitations are stated without
  unevidenced compliance claims.
- **Feedback states:** skeleton, labelled loading, empty-state explanation, error
  recovery and non-obscuring toast.

## 10. Knowledge and data patterns

A standards page begins with status, owner, version and last-reviewed metadata,
then summary, normative content, examples, provenance and related implementation.
Draft, candidate, adopted, deprecated and superseded states use explicit words and
icons, not palette substitutions.

An evidence panel identifies source type, title, publisher, date, retrieved date,
location, confidence and whether the statement is quoted, inferred or proposed.

A data browser keeps search, filters, result count and reset action in one labelled
toolbar. Applied filters remain visible as removable controls. Sorting, pagination,
loading, empty and error states announce changes without moving keyboard focus.

Site search uses the same labelled field, select and reset primitives without becoming
a separate search platform. One query field and one canonical-destination filter write
shareable URL parameters. Multi-word matches are ranked deterministically by title,
alias and summary relevance, then shown in a compact ordered list. Every row names its
canonical destination, work area, authority and maturity. Result counts and empty states
are announced without moving focus; clearing search returns focus to the query field.
The search lifecycle reinitialises after client-side page transitions.

A governance decision distinguishes proposal, review, disposition and adopted
outcome. Publication never implies ratification.

## 11. Imagery, motif and motion

Photography shows real people collaborating and real residential property. Record
rights, source, consent where relevant, focal point and alt-text decision before use.
Apply `#131224` overlays at 55–70% when text sits on an image and verify the final
crop. Decorative partner marks receive an equivalent text list.

Generative imagery is not used in the OPDA identity. The supplied AI poster is
removed. The sole recurring decorative motif is a 4px amber rule used for headlines,
active navigation and footer structure; it does not imitate or redraw the logo. The
root homepage and `/join` intentionally share one static radial/diagonal campaign-hero
background treatment. The method figure and presentation tile carry editorial meaning
and are not recurring identity motifs.

Motion lasts 120–200ms, uses ease-out for entry and ease-in for exit, and changes
only opacity or transform. There is no parallax, autoplay carousel, animated
gradient or looping ambient movement. Reduced motion removes transforms and reduces
non-essential transitions to effectively instant.
These shared-system motion rules do not replace the working-group deck's self-contained
motion contract.

Campaign handoff comparisons use ordinary document flow and natural-height cards.
They never pin a visual while requiring readers to traverse forced-height panels.
If optional reveal feedback is unavailable or reduced motion is requested, every
term, definition, scope and explanation remains visible in its final position.

## 12. Standalone presentation

The local presentation in `docs/design-system-site/` is a review artefact, not a
duplicate application. A fixed deep-ink rail numbers chapters in amber Roboto Mono:

01 Overview · 02 Foundations · 03 Brand · 04 Components · 05 Data display ·
06 Motion · 07 Patterns · 08 Accessibility · 09 Governance · 10 Implementation.

Each chapter opens with an ink band and oversized Slab numeral, then a white specimen
surface. Foundations includes computed contrast beside swatches; Components shows
all states and dark parity; Data includes categorical, sequential, diverging and
grayscale specimens; Implementation shows the actual CSS custom properties. On
mobile the rail becomes an accessible dialog-style drawer.

## 13. Governance and acceptance

Changes identify their evidence tier and update the contract, tokens, presentation
and tests together. Supplied assets and guide values change only when newer source
evidence is recorded. Derived decisions may evolve through an ADR or proportionate
review; the system is designed to change without losing provenance.

Every live route belongs to one explicit visual family:

| Family | Routes/pattern | Owner |
|---|---|---|
| Public entry | `/` | hero/status, method figure, presentation feature, canonical directory, join action and shared `SiteFooter` |
| Knowledge base | prose, governance and catalogue routes | shared `Layout` shell and `SiteFooter` |
| Data and V2 | data browser, validation and V2 reference routes | shared tokens plus dense data patterns |
| Schema/manual | generated schema, ontology and manual reference routes | shared shell plus labelled table/diagram patterns |
| Public service | `/join`, `/join/privacy`, `/accessibility` | minimal `StandalonePublicLayout`, shared `SiteFooter`, five-chapter campaign, public statements and safely enhanced form |
| Working groups | workspaces and member guidance | standard shared `Layout`, left section navigation and Knowledge Base footer |
| Presentation | working-group kickoff deck | isolated, self-contained full-screen presentation using its original local visual tokens; no site chrome |

Release validation runs against the built artefact before any deployment: source
contract tests, deterministic schema checks, a built-route asset and
application-navigation crawl, and
Playwright smoke, keyboard, responsive, axe and visual-diff suites. The rendered
matrix includes every route family at desktop light and mobile dark, plus explicit
forced-colour and reduced-motion checks.

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

The replacement does not use the earlier Fraunces/Inter, cream/terracotta visual
language; generic government-blue chrome; 12–16px SaaS card radii; pill-shaped
buttons; glassmorphism; stacked decorative shadows; colour-only status dots;
unlabelled icon-only controls; centred marketing heroes with floating product shots;
or synthetic brand imagery.

DESIGN AUTHORITY SIGN-OFF — Fable 5 · max effort
