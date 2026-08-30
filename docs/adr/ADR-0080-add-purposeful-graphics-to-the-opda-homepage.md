---
status: accepted
date: 2026-08-30
updated: 2026-08-30
tags: [website, homepage, design-system, brand, accessibility, svg, presentation]
supersedes: []
amends: [ADR-0073, ADR-0074]
depends-on: [ADR-0064, ADR-0073, ADR-0074, ADR-0078]
implements: [DESIGN.md, src/pages/index.astro, src/components/home/MethodFlowFigure.astro, src/components/home/KickoffFeature.astro, tests/e2e/smoke.spec.mjs]
---

# Add purposeful graphics to the OPDA homepage

## Context and Problem Statement

ADR-0073 established the OPDA ink-and-amber visual system and ADR-0074 made `/`
the sole Knowledge Base homepage, organised around the six canonical destinations.
The resulting page is accurate and direct, but its hero and destination cards do
most of the visual work. It gives little prominence to the Finance and Banking
working-group presentation and does not show, at a glance, how industry evidence
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
- Give the restored Finance and Banking kick-off presentation a prominent route.
- Explain the programme method to non-technical readers without ontology jargon.
- Preserve the canonical six-destination order and the root's no-global-header rule.
- Keep maturity, authority and non-adoption status visible in the first viewport.
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

1. A split deep-ink hero with the official OPDA brand line, a low-contrast official
   icon backdrop, primary SPDTF and Programme actions, and integrated status facts.
2. A static four-stage figure showing evidence and expertise, working-group review,
   a governed candidate, and shared property information.
3. A prominent Finance and Banking kick-off feature linking directly to
   `/presentation/working-group-kickoff`.
4. The unchanged canonical directory for Programme, Governance, Semantic modelling,
   SPDTF Development, Working groups and Resources, in that order.
5. A bounded participation call to action linking to `/join`.
6. The shared `SiteFooter`.

The official yellow icon may appear once as an oversized, cropped background image in
the hero. It remains byte-for-byte unchanged, decorative, hidden from assistive
technology and absent in forced-colour and print modes. It is not a redraw or a new
recurring identity motif.

The method figure is a static authored SVG with a title, description and visible prose
equivalent. It has separate wide and stacked geometries so labels remain readable
without horizontal scrolling. Connectors are axis-aligned, the governed-candidate
stage is the only amber focal signal, and no information depends on animation or
colour alone.

The presentation feature is an editorial preview, not an embedded presentation. Its
small, isolated poster treatment may use the restored deck's forest, cream and amber
palette inside `KickoffFeature.astro`; it does not import the deck's CSS, JavaScript,
fonts, layout rules or browser chrome. The feature is not a seventh global destination.

Homepage composition styles remain scoped to the root page and its two components.
They consume the shared OPDA spacing, type and semantic tokens, except for the bounded
deck-preview palette above. The redesign introduces no canvas, WebGL, Three.js,
parallax, autoplay, animated gradient or ambient motion.

The former separate programme-status strip is replaced by the hero's visible status
facts. This resolves the design/source drift while retaining the status requirement;
it does not remove or weaken it.

### Consequences

- Good, because the first page now explains both what SPDTF is and how participation
  turns evidence into shared meaning.
- Good, because the working-group presentation becomes a prominent editorial route
  without becoming a navigation peer or contaminating the shared design system.
- Good, because static SVG and CSS geometry provide visual character without a new
  client runtime or motion dependency.
- Good, because authority and maturity stay explicit within the hero.
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
- The official icon is referenced as an unchanged decorative asset; the presentation
  feature links to the existing local deck and imports none of its runtime assets.
- Fable's read-only implementation review found three material defects; the source now
  corrects mobile brand alignment, print colour fallbacks and section-heading hierarchy,
  together with its SVG-name and poster-legibility refinements.
- Static source and rendered-page review may be recorded while this ADR is accepted.
- At the operator's instruction, tests and builds have not been run for this change.
  The ADR must remain `accepted`, not `implemented`, until the relevant contract,
  responsive, accessibility, visual, print and build gates are authorised and pass.
- Publication and deployment remain explicitly unauthorised.

## More Information

- [ADR-0073 — Adopt the OPDA brand and replace the website design system](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
- [ADR-0074 — Organise the site around SPDTF and the PDTF schema](./ADR-0074-organise-site-around-spdtf-and-pdtf-schema.md)
- [ADR-0078 — Create a standalone working-group recruitment campaign](./ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md)
- [OPDA Design System](../../DESIGN.md)
