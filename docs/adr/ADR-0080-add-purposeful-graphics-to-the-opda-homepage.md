---
status: accepted
date: 2026-08-30
updated: 2026-09-01
tags: [website, homepage, design-system, brand, accessibility, avif, infographic, ai, presentation]
supersedes: []
amends: [ADR-0073, ADR-0074]
depends-on: [ADR-0064, ADR-0065, ADR-0073, ADR-0074, ADR-0078]
implements: [DESIGN.md, public/images/home/method-loop-light.avif, public/images/home/method-loop-dark.avif, src/pages/index.astro, src/components/BrandHeading.astro, src/components/SiteFooter.astro, src/components/home/MethodFlowFigure.astro, src/components/home/KickoffFeature.astro, src/styles/working-group-campaign.css, src/styles/working-group-campaign-responsive.css, public/ui/design/public.css]
---

# Add purposeful graphics to the OPDA homepage

## Context and Problem Statement

ADR-0073 established the OPDA ink-and-amber visual system and ADR-0074 made `/`
the sole Knowledge Base homepage, organised around the six canonical destinations.
The resulting page is accurate and direct, but its hero and destination cards do
most of the visual work. It gives little prominence to the working-group kick-off
presentation and does not show, at a glance, how industry evidence
becomes governed shared meaning.

The design contract also drifted from the source. It still required a separate
programme-status strip even though that strip had been removed from the page. A
redesign must resolve that contradiction explicitly, preserve the accepted
information architecture and status language, and add visual interest without
introducing decorative complexity, misleading maturity claims or presentation-deck
styles into the shared application shell.

The operator delegated the visual-composition proposal to native Fable at maximum
effort. That delegation is visual only. Fable has no authority over standards,
programme facts, governance, routes, publication or deployment.

## Decision Drivers

- Make the homepage more distinctive while keeping it fast, static and legible.
- Give the working-group kick-off presentation a prominent route.
- Explain the programme method to non-technical readers without ontology jargon.
- Preserve the canonical six-destination order and the root's no-global-header rule.
- Introduce the six working-group domains without turning the hero into technical documentation.
- Reuse official assets and shared tokens without redrawing the OPDA identity.
- Meet keyboard, reflow, forced-colour, reduced-motion and print expectations.
- Keep publication and deployment outside this local source decision.

## Considered Options

- **Retain the text hero and six cards only.** Rejected because it does not answer the
  request for a stronger visual story or make the presentation prominent.
- **Add Three.js, parallax or an animated background.** Rejected because motion and a
  rendering runtime add accessibility, performance and maintenance costs without
  improving the programme explanation.
- **Embed the deck or use a homepage screenshot.** Rejected because an iframe would
  leak an isolated visual system into the shell and a screenshot would become stale.
- **Use a static branded composition with a process figure and editorial feature
  (chosen).** This adds purposeful graphics while preserving semantic HTML, direct
  links, shared tokens and the deck's isolation.

## Decision Outcome

The root homepage uses this editorial sequence:

1. A split deep-ink hero with the shared OPDA icon-and-name heading, `/join`'s full-width
   campaign background and centred 92rem content grid, the same panel composition,
   SPDTF, Programme and working-group actions, and a compact working-group domain register.
2. A static AI-assisted modelling loop showing source material, model extraction,
   candidate publication and working-group review, with feedback returning to the
   next pass and consensus leading to a draft standard.
3. A prominent working-group kick-off feature linking directly to
   `/presentation/working-group-kickoff`.
4. The unchanged canonical directory for Programme, Governance, Semantic modelling,
   SPDTF Development, Working groups and Resources, in that order.
5. A bounded participation call to action linking to `/join`.
6. The shared `SiteFooter`.

The root hero reuses the recruitment campaign's `.wg-campaign-hero` and
`.wg-hero-journey` styles rather than approximating them. This keeps the radial/diagonal
background effect, lower amber highlight, responsive breakpoints, semantic icon-list
component and panel surface identical across the two routes. The adjacent text remains
the accessible label and source of meaning. The shared padding
calculation keeps the content grid within 92rem while the campaign background remains
full width. The homepage retains its headline and brand line, uses a concise active-voice
proposition, and adds a direct working-group action to the existing SPDTF and Programme
actions. Its small hero label identifies the Smart Property Data Trust Framework. The
right-hand panel lists the six working-group domains with short descriptions.

The method figure follows the working-group kick-off presentation and
ADR-0065 rather than imposing an arbitrary stage count. People provide authorised
material once as the initial evidence base. The repeating cycle then contains the three
parts shown in the presentation: AI-assisted modelling extracts, compares and drafts;
OPDA publishes a candidate model and ontology; and working-group members challenge and
improve it. Feedback and new evidence begin the next modelling pass. A separate
consensus exit leads to a stable working-group draft, which is explicitly not yet
ratified or adopted.

The checked-in light and dark method assets are a reviewed Gemini 3 Pro Image
composition rather than a client-side diagram runtime. The two variants preserve the
same words, geometry and transition directions while applying the OPDA light and dark
palette. The title and closing authority statement are cropped from the raster because
the page owns them as live heading and caption text. Both images are stored as compact
2752 by 1216 AVIF assets; the component loads only the active wide-screen theme.
The image is displayed within a centred 84rem maximum measure without changing or
regenerating either source asset.
Equivalent semantic HTML describes the complete process and becomes the visible
treatment at narrow widths, in forced-colour mode and in print. The visible guardrail
states that AI may extract, compare and draft while people decide what is true, resolve
disagreement and approve status changes.

The presentation feature is an editorial preview, not an embedded presentation. Its
small, isolated poster treatment may use the deck's forest, cream and amber
palette inside `KickoffFeature.astro`; it does not import the deck's CSS, JavaScript,
fonts, layout rules or browser chrome. The feature is not a seventh global destination.

Homepage-specific adaptations remain scoped to the root page and its two components;
the hero deliberately consumes the shared recruitment-campaign rules named above.
They use the shared OPDA spacing, type and semantic tokens, except for the bounded
deck-preview palette above. The redesign introduces no canvas, WebGL, Three.js,
parallax, autoplay, animated gradient or ambient motion.

The former separate programme-status strip and the later hero status panel are replaced
by the working-group domain register. Detailed maturity, authority and adoption status
remain available through the SPDTF Development action and governed route metadata rather
than competing with the homepage's primary proposition.

### Consequences

- Good, because the first page now explains both what SPDTF is and how participation
  turns evidence into shared meaning.
- Good, because the working-group presentation becomes a prominent editorial route
  without becoming a navigation peer or contaminating the shared design system.
- Good, because compact static AVIF assets and CSS composition provide visual character
  without a diagram runtime or motion dependency.
- Good, because the homepage now says plainly that AI accelerates extraction and
  drafting while preserving human authority over meaning and status.
- Good, because the hero now previews the domains that make the programme tangible.
- Bad, because detailed authority and maturity status now sit behind the SPDTF route
  rather than appearing directly in the hero.
- Bad, because the homepage now has more authored composition and therefore needs
  responsive, accessibility, visual and print regression coverage.
- Neutral, because the six canonical destinations, their order and their routes do
  not change.
- Neutral, because this decision changes repository source only and authorises no
  build, publication, deployment or external-site mutation.

### Confirmation

- The accepted composition is present in `src/pages/index.astro` and the two bounded
  homepage components named in `implements`.
- `DESIGN.md`, ADR-0073 and ADR-0074 record the same homepage sequence, motif exception
  and integrated status treatment.
- The official icon remains unchanged in the shared icon-and-name heading; the generic
  presentation feature links to the existing local deck and imports none of its runtime assets.
- The method figure's labels and authority boundary agree with the modelling loop and
  AI limitations in the working-group presentation and ADR-0065.
- The two Gemini-generated AVIF assets contain identical wording, geometry and arrow
  directions; the rendered homepage loads no image-generation or diagram runtime.
- The light and dark assets were generated with `gemini-3-pro-image` on 31 August 2026,
  recoloured through the same multi-turn interaction, visually reviewed, cropped to
  defer heading and caption text to HTML, and encoded to AVIF without adding an OPDA
  identity mark.
- The generation instructions fixed the five-node source, preparation, publication,
  review and draft flow; required revision to return from review to preparation and
  consensus to exit toward the draft; prohibited wording or geometry changes; and
  constrained the visual treatment to flat OPDA theme colours without shadows, glow,
  texture, decoration or a reconstructed brand mark.
- Fable's read-only review of the initial composition found three material defects;
  those corrections to print colour, heading hierarchy, SVG naming and poster
  legibility remain. The later shared-hero amendment has not been re-reviewed by Fable.
- The local Astro development response returns the amended homepage with the shared
  campaign width, background and responsive styles loaded; this is not a release gate.
- Static source and rendered-page review may be recorded while this ADR is accepted.
- `make test` passes all 258 checks and the CI-equivalent `make build-data` produces
  all 2,645 static pages after the 1 September campaign amendments. The ADR remains
  `accepted`, not `implemented`, until its remaining responsive, accessibility,
  visual and print confirmation work is complete.
- Publication requires separate operator authority; this ADR does not grant it.

## Amendments

- **2026-08-30 — align the root hero with the recruitment campaign.** At the operator's
  direction, the root hero now reuses `/join`'s static background effect and two-column
  panel composition while retaining the homepage's existing content. Its full-width
  background contains a centred 92rem content grid through the shared campaign padding
  rule. This replaces the initially accepted decorative icon backdrop. The initial
  `Programme status` eyebrow occupied the same role as `/join`'s `What you
  can contribute` eyebrow; the later domains amendment below supersedes that panel.
- **2026-08-30 — converge the hero and page surface.** The root now uses the campaign
  hero's actual structure and numbered-list component rather than legacy homepage
  classes that approximated them. A direct working-group action joins the existing
  SPDTF and Programme actions. Below the hero, one design-system page surface replaces
  alternating section bands; bounded cards and graphics retain their own contrast.
- **2026-08-30 — identify the framework in the hero label.** The small hero label now
  reads `Smart Property Data Trust Framework`; the headline and routing remain unchanged.
  The later domains amendment below supersedes the status facts.
- **2026-08-30 — sharpen the proposition and surface the domains.** The hero lede now
  uses active voice and the full names of the Open Property Data Association and Smart
  Property Data Trust Framework, stating that industry organisations are developing the
  framework to support the Government’s Smart Data programme and improve property
  information sharing. The right-hand panel replaces the status snapshot with the six
  working-group domains. The Common boundary and candidate DBT Smart Data context are
  deliberately excluded because they are not working groups. Its visible label is
  `Working Group`, and its single-column register reuses the same numbered process
  structure and base visual language as the `/join` hero. A homepage modifier keeps the
  domain type compact and readable, adds measured row spacing, widens the desktop panel
  to limit wrapping, removes the register's final bottom rule, and translates the panel
  down for visible space above its top edge. The hero uses the shared site content width,
  so the panel's right edge aligns with the page margin at every viewport. On the desktop
  two-column layout, the actions use compact padding, a generous gap and a single row;
  they return to the standard wrapped treatment when the hero stacks. Detailed programme
  status remains on the linked Smart Property Data Trust Framework pages rather than
  being repeated in the marketing hero. The method, featured presentation, route cards
  and contribution section share the hero's responsive content frame, rather than adding
  their own nested horizontal inset. The shared footer changes surface, text and wordmark
  for the selected theme.
- **2026-08-30 — share the organisation heading and strengthen the method figure.**
  The hero now consumes the design system's icon-and-name heading instead of owning
  its typography locally. The four repeated SVG boxes are replaced by a responsive
  semantic infographic rather than retained as four assumed stages.
- **2026-08-30 — derive the method from the working-group presentation.** The final
  figure uses the presentation's resource, AI-assisted drafting, published-candidate
  and human-review loop. Feedback returns to the next pass until consensus; only then
  does a separate outcome identify the stable draft standard. AntV Infographic
  generates theme-specific static SVGs offline, while semantic HTML, mobile prose,
  local typography and explicit human-authority wording remain part of the page.
- **2026-08-31 — replace the provisional AntV export with reviewed Gemini variants.**
  At the operator's direction, the method figure now uses separately generated OPDA
  light and dark AVIF assets. Both retain the accepted process and exact transition
  directions. The component fetches only the active theme above 64rem and uses the full
  semantic ordered process at narrower widths, in forced colours and in print. The
  former AntV generator, dependency and SVG exports are removed. This amendment changes
  the rendering method, not the accepted content, authority boundary or page sequence.
- **2026-08-31 — expose theme selection and reduce the method image measure.** The root
  hero now places the existing design-system light/dark control in a separate overlay
  layer at its top-right edge, outside the hero grid's layout flow.
  The generated method image is centred at a maximum displayed width of 84rem; its
  intrinsic dimensions and both reviewed Gemini assets remain unchanged.
- **2026-08-31 — give the root hero full theme parity.** The campaign composition now
  uses the design system's white and warm-neutral surfaces, ink text, violet emphasis
  and light control states when light mode is selected. Dark mode retains the accepted
  deep-ink treatment; content, geometry and routes do not change.
- **2026-08-31 — generalise the featured kick-off.** The canonical 24-slide deck and
  homepage feature now introduce any of the six domain working groups. Finance and
  Banking remains visible as one peer context, while the route, isolated visual-system
  boundary, controls and homepage feature composition remain unchanged.
- **2026-08-31 — give the presentation preview theme parity.** The homepage’s
  CSS-built kick-off poster now uses the shared page surface in both themes, reserving
  its theme variation for the poster itself; it remains an editorial preview rather
  than an imported deck runtime or generated image asset.
- **2026-08-31 — consolidate homepage section headings.** The method, presentation,
  directory and participation sections now use the shared design-system section-heading
  hierarchy rather than independently sized eyebrows and local heading spacing.
- **2026-09-01 — replace ordinal markers with semantic icons.** The homepage domain
  register and matching recruitment panel now use tree-shaken `@lucide/astro` icons
  chosen for each domain or action. The adjacent text remains authoritative, and the
  reinforcing icons stay hidden from assistive technology.
- **2026-09-01 — align the campaign heading row.** This supersedes the 31 August
  top-right overlay placement. Both public campaign heroes now place the shared
  icon-and-name heading and theme control on one content-width row, with the control
  aligned to the right edge and a shared responsive gap below. Panel icons, item text
  and the homepage domain-row spacing use the same campaign component rules.

## More Information

- [ADR-0073 — Adopt the OPDA brand and replace the website design system](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
- [ADR-0074 — Organise the site around SPDTF and the PDTF schema](./ADR-0074-organise-site-around-spdtf-and-pdtf-schema.md)
- [ADR-0078 — Create a standalone working-group recruitment campaign](./ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md)
- [OPDA Design System](../../DESIGN.md)
