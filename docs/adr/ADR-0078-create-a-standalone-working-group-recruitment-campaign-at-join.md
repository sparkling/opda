---
status: proposed
date: 2026-08-27
updated: 2026-08-27
tags: [working-groups, recruitment, campaign, signup, design-system, accessibility, routing]
supersedes: []
depends-on: [ADR-0069, ADR-0071, ADR-0073]
implements: []
---

# Create a standalone working-group recruitment campaign at `/join`

## Context and problem statement

ADR-0069 establishes the public working-group expression-of-interest service, its
data boundary, human review, privacy controls and canonical signup journey.
ADR-0071 establishes the coordinated recruitment campaign and the content that
must explain participation before asking for personal data. The implemented page
currently sits at `/spdtf/working-groups/join` inside the Knowledge Base shell.

That placement makes the signup journey discoverable from the Working groups
documentation, but it also subjects a public recruitment campaign to the global
header, section navigation, breadcrumb, article wrapper and documentation rhythm.
The page consequently reads as an unusually polished documentation page rather
than a focused invitation to participate. Its long sequence of similarly styled
cards also gives supporting explanation and the primary action comparable visual
weight.

The standalone Finance and Banking working-group presentation at
`/presentation/working-group-kickoff` demonstrates a stronger editorial hierarchy:
large display typography, one principal idea at a time, immediate reassurance,
interactive contextual lenses, an explicit evidence-to-candidate loop and a clear
working-group promise. It is a presentation, however, not a suitable public signup
journey. Its 24-slide sequence, fixed viewport, presenter controls and deliberate
empty space must not be copied into the campaign page.

OPDA therefore needs a standalone campaign surface that combines the
presentation's narrative confidence with the existing signup page's complete
content, form, privacy and accessibility contract.

## Decision drivers

- Give public recruitment one short, memorable and trustworthy canonical URL.
- Let the campaign use the full viewport without inheriting documentation chrome.
- Explain contextual meaning visually without misrepresenting the common boundary
  or cross-context mappings.
- Keep the route focused on participation and human authority rather than on OPDA's
  tooling or the use of AI.
- Preserve the approved form fields, validation, privacy notice, storage and human
  review boundary from ADR-0069.
- Preserve the campaign scope, promises and prohibited implications from ADR-0071.
- Remain visibly OPDA and consume the governed design tokens from ADR-0073 without
  requiring every campaign composition to look like a documentation component.
- Provide keyboard, reduced-motion, forced-colour and non-WebGL equivalents for
  every material part of the journey.
- Avoid scroll hijacking, pinned empty sequences, decorative parallax and a
  presentation-style requirement to click through the story.
- Meet normal performance expectations despite any optional spatial rendering.

## Considered options

### Option A — Keep the nested Knowledge Base page

Continue to use `/spdtf/working-groups/join` with the global header, section
navigation and documentation wrapper.

This preserves the current information architecture but keeps the public campaign
visually subordinate to documentation and limits its composition.

### Option B — Reuse the Finance and Banking presentation as the signup journey

Add the registration form to the 24-slide presentation and use its fixed-screen
navigation.

This would reuse a strong visual language, but it would turn conversion into a
long, presenter-oriented sequence and create a second copy of recruitment content.

### Option C — Create a standalone editorial campaign at `/join`

Create one naturally scrolling, campaign-specific route that uses OPDA brand
foundations, selected presentation patterns and the existing governed signup form.

### Option D — Create a fully immersive WebGL experience

Build the entire page as a canvas-led, three-dimensional journey.

This would maximise visual novelty but make content, accessibility, resilience,
performance and form conversion subordinate to a rendering technology. It would
also recreate the dead-scroll and over-production risks already removed from the
campaign.

## Decision outcome

Choose **Option C — create a standalone editorial campaign at `/join`**.

This ADR is proposed. It records the intended route, composition and quality
contract; it does not claim that the route exists or authorise publication.

### 1. Canonical route and route ownership

`https://opda.org.uk/join` becomes the sole public working-group recruitment and
expression-of-interest route when this decision is accepted and implemented.

The privacy notice moves with it to `/join/privacy`. The former
`/spdtf/working-groups/join` and `/spdtf/working-groups/join/privacy` routes are
removed without redirects, rewrites, aliases or duplicate pages. All repository
links, campaign assets and calls to action must use the new canonical route.

The unchanged same-origin submission API remains
`POST /api/working-group-interest`. Moving the public pages does not change the API,
stored record, validation, retention, access or human-review boundary established
by ADR-0069.

### 2. Standalone shell

The `/join` route does not use the Knowledge Base `Layout` or inherit its global
header, section navigation, breadcrumb, table of contents, previous/next navigation
or article wrapper.

The campaign supplies only the minimal orientation and escape routes required for
a trustworthy standalone page:

- the official OPDA mark, linked to `/`;
- a discreet way to return to the Knowledge Base;
- a persistent but unobtrusive route to the registration form; and
- a footer containing the privacy, accessibility and organisation links required
  for the public service.

This is not a separate brand or design system. The standalone shell consumes the
official assets, semantic tokens, typography, controls, focus states and form
primitives governed by ADR-0073. Campaign-specific spatial and editorial components
must be added to the design-system documentation when implemented.

### 3. Narrative structure

The campaign uses approximately five naturally flowing chapters rather than the
current long card sequence or a slide deck:

1. **One property, many professional meanings.** A full-viewport opening explains
   the proposition and offers direct routes to participate or understand the work.
2. **Contextual lenses.** An interactive model shows how Finance and Banking,
   Conveyancing, Estate Agency, Surveying and Valuation, Property Data Services and
   Property Technology describe the same property for different purposes.
3. **How participation changes the model.** A continuous evidence, candidate,
   challenge and revision sequence shows what a contribution produces.
4. **Evidence and trust.** Authorised examples, outputs and participant evidence
   substantiate the claims and state the human decision boundary.
5. **Register your interest.** The complete form is the final, visually distinct
   destination.

The page retains the approved reassurance that participants do not need ontology
expertise, graph tools, technical knowledge or AI adoption. It must not promise
automatic membership, Microsoft access, voting rights, accreditation, endorsement,
publication or standards authority.

### 4. Semantic-constellation interaction

The signature visual is a progressively enhanced semantic constellation centred on
one property and the six property-domain contexts.

Selecting a context changes the contextual label, explanation and relevant
working-group information. That selection may preselect the corresponding group in
the registration form, but the form remains independently understandable and
operable. The authoritative form controls remain ordinary HTML inputs.

The visual must represent the modelling method accurately:

- each context owns its local domain meaning;
- the common boundary contains only elements genuinely shared across contexts;
- common elements flow outward from the common boundary to relevant contexts; and
- cross-context concept mappings are a separate concern, shown with dotted SKOS
  mapping relationships rather than arrows implying that contexts interoperate
  through the common boundary.

All contextual labels, explanations and relationships must also exist in semantic
HTML. A canvas, WebGL, Three.js or shader layer may enhance the scene only if a
bounded prototype demonstrates that it communicates these relationships better than
CSS and SVG. The technology is not mandated by this ADR. Any rendering layer is
decorative to assistive technology and has a static SVG or CSS fallback.

### 5. Motion and interaction

The campaign uses at most three recurring motion signatures:

1. contextual response in the semantic constellation;
2. a restrained change of the contextual property label; and
3. short section or process-line reveals.

Motion must respond to focus and touch as well as pointer input. It must stop when
offscreen or when the document is hidden. Reduced-motion preferences receive the
complete static state without delayed or hidden content.

The page must not use scroll hijacking, a custom cursor, autoplay background video,
decorative parallax, pinned scrollytelling or viewport-height empty bands. Visitors
read by scrolling normally and may reach the form without completing an interaction.

### 6. Evidence and public claims

The page may show participating organisations, quotations, modelling outcomes or
worked examples only when their authority, wording and publication rights are
recorded. It must not invent social proof or imply endorsement from a participant,
trade body, government body or standards organisation.

The public story centres the working groups and their human authority. AI may be
described as a human-directed drafting accelerator where relevant, but it is not the
campaign's principal proposition and does not decide domain meaning or approval.

### 7. Registration and privacy

The registration form remains at the bottom of the page and retains every field,
choice, acknowledgement and validation rule approved by ADR-0069. JavaScript is
required for registration; this ADR does not require the campaign or form to operate
when JavaScript is unavailable.

The campaign may provide a persistent “Register your interest” control and carry a
context selection into the form. It must not hide required information in an opaque
multi-step wizard, submit data before the visitor activates the form or change the
meaning of registration.

The form area may use a contrasting light surface when the resulting control,
validation, focus and error states meet the design-system and WCAG contracts.

### 8. Performance and resilience

The semantic HTML proposition, reassurance and primary action render before any
optional visual enhancement. Spatial code and assets are lazy-loaded, paused when
unused and excluded from the critical path.

The implemented page is expected to meet the site's Core Web Vitals and release
gates. A visual enhancement that materially damages loading, interaction, stability,
reflow or battery use must be simplified or removed.

The complete proposition, context explanations, participation process, trust
boundary, privacy link and form remain usable when motion is disabled or WebGL is
unavailable.

## Consequences

### Positive

- Public recruitment gains one short and memorable canonical URL.
- The campaign can establish a stronger hierarchy without compromising the
  Knowledge Base shell used by standards and governance documentation.
- The contextual model becomes an explanatory interaction rather than six repeated
  cards.
- The Finance and Banking presentation contributes proven language and interaction
  patterns without becoming the public funnel.
- The existing form, privacy, storage and human decision boundary remain intact.
- The design remains OPDA-specific while allowing a more ambitious campaign
  composition.

### Negative

- OPDA must maintain a small standalone shell in addition to the Knowledge Base
  layout.
- Campaign-specific components require their own responsive, accessibility and
  performance testing.
- Optional spatial rendering adds implementation and regression risk.
- Removing the former route without a redirect will intentionally break any existing
  external links to it.

### Neutral

- This decision does not change the six selectable property-domain groups, campaign
  target audiences, form fields, API, storage, retention or onboarding process.
- It does not approve any quotation, logo, participant claim or model candidate for
  publication.
- It does not authorise deployment, campaign publication, LinkedIn activity or
  trade-body outreach.

## Confirmation

This ADR can move from proposed to accepted when the operator approves the route,
shell and narrative contract. It can move to implemented only when all of the
following are true:

- `/join` and `/join/privacy` are the only public page routes for the signup journey;
- the former nested routes are absent without compatibility routing;
- all internal campaign and header links use `/join`;
- the page does not render Knowledge Base header, sidebar, breadcrumb, table of
  contents or previous/next furniture;
- the official OPDA mark provides a clear route home and the campaign footer exposes
  the required privacy and accessibility links;
- the contextual interaction preserves local ownership, outward common elements and
  separate dotted SKOS mappings;
- every interactive context and form control is usable by keyboard, touch and pointer;
- the complete page remains understandable with WebGL and motion disabled;
- reduced-motion, forced-colour, 320 CSS-pixel reflow and 400% zoom checks pass;
- the existing form fields, privacy acknowledgement, validation, API contract and
  human review behaviour remain unchanged;
- unauthorised logos, quotations and endorsements are absent;
- `make test` and `make build` pass; and
- ADR-0069, ADR-0071, ADR-0073, `DESIGN.md` and the live design-system documentation
  are reconciled with the implemented route and components in the same change.

## Relationship to other decisions

- [ADR-0069](./ADR-0069-public-working-group-recruitment-and-signup.md) remains the
  authority for signup scope, form data, validation, privacy, storage, retention and
  human review. On implementation, this ADR amends its canonical public page routes,
  presentation layer and prior no-JavaScript requirement.
- [ADR-0071](./ADR-0071-bounded-context-recruitment-campaign.md) remains the authority
  for campaign scope, recruitment channels, public promises and measures. On
  implementation, this ADR amends only its canonical signup URL and campaign-page
  composition.
- [ADR-0073](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
  remains the authority for OPDA brand foundations, semantic tokens, controls and
  accessibility. On implementation, it must record the standalone campaign as an
  intentional shell exception and replace its stale description of the join route.
- The Finance and Banking presentation remains an isolated presentation surface and
  a source of tested narrative patterns. It is not the canonical recruitment page or
  a second design-system authority.
