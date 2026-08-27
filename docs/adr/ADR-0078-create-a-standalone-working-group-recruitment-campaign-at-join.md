---
status: accepted
date: 2026-08-27
updated: 2026-08-27
tags: [working-groups, recruitment, campaign, signup, design-system, accessibility, routing]
supersedes: []
depends-on: [ADR-0038, ADR-0069, ADR-0071, ADR-0073, ADR-0079]
implements: [src/layouts/StandalonePublicLayout.astro, src/components/campaign, src/data/working-group-campaign.ts, src/pages/join, src/pages/accessibility.astro, src/styles/standalone-public.css]
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
- Meet explicit loading, responsiveness and stability thresholds despite any
  optional spatial rendering.

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

This ADR is accepted. It authorises the local route, composition and quality
contract; it does not authorise publication.

### 1. Canonical route and route ownership

`https://opda.org.uk/join` becomes the sole public working-group recruitment and
expression-of-interest route when this decision is accepted and implemented.

The privacy notice moves with it to `/join/privacy`. The former
`/spdtf/working-groups/join` and `/spdtf/working-groups/join/privacy` routes are
removed without redirects, rewrites, aliases or duplicate pages. All repository
links, campaign assets and calls to action must use the new canonical route.

The route change includes the site navigation, route-migration registry, information-
architecture baseline and every route- or path-pinned unit test. Updating those
contracts records the new canonical hierarchy; it does not create compatibility
routing for the former URLs.

`https://opda.org.uk/accessibility` becomes the canonical accessibility statement
for the public site. It is a separate public service page delivered with the
standalone signup journey, not an additional signup route.

The unchanged same-origin submission API remains
`POST /api/working-group-interest`. Moving the public pages does not change the API,
stored record, validation, retention, access or human-review boundary established
by ADR-0069.

Public recruitment must not launch through another exception in the current
authentication allowlist. Launch is sequenced after the separately governed removal
of the site authentication gate, when anonymous access to `/join`, `/join/privacy`,
`/accessibility` and the submission API can be verified directly. This ADR does not
authorise an interim allowlist entry.

### 2. Standalone shell

The `/join`, `/join/privacy` and `/accessibility` routes do not use the Knowledge
Base `Layout` or inherit its global header, section navigation, breadcrumb, table of
contents, previous/next navigation or article wrapper.

The standalone route family supplies only the minimal orientation and escape routes
required for a trustworthy public journey:

- the official OPDA mark, linked to `/`;
- a discreet way to return to the Knowledge Base;
- a persistent but unobtrusive route to the registration form on `/join`;
- a clear route from `/join/privacy` back to the registration page; and
- a footer containing the privacy, accessibility and organisation links required
  for the public service.

The `/accessibility` page states the accessibility target, the scope and method of
testing, known limitations, how to request an alternative format, how to report a
problem, the responsible contact and the statement's preparation and review dates.
It distinguishes an accessibility target from independently verified conformance
and does not claim compliance that has not been evidenced.

This is not a separate brand or design system. The standalone shell consumes the
official assets, semantic tokens, typography, controls, focus states and form
primitives governed by ADR-0073. Campaign-specific spatial and editorial components
must be added to the design-system documentation when implemented.

### 3. Narrative structure

The campaign uses five naturally flowing chapters rather than the current long card
sequence or a slide deck:

1. **One property, many professional meanings.** A full-viewport opening explains
   the proposition and offers direct routes to participate or understand the work.
2. **Contextual lenses.** An interactive model shows how Finance and Banking,
   Conveyancing, Estate Agency, Surveying and Valuation, Property Data Services and
   Property Technology describe the same property for different purposes.
3. **How participation changes the model.** A continuous evidence, candidate,
   challenge and revision sequence shows what a contribution produces.
4. **Evidence and trust.** Authorised real-world evidence and clearly labelled
   illustrative examples substantiate the method and state the human decision boundary.
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
- cross-context concept mappings are a separate concern, shown between concept labels
  with dotted SKOS mapping relationships rather than arrows implying that contexts
  interoperate through the common boundary.

The current reviewed cross-context mapping register is empty, but that does not block
the visual. The campaign may use illustrative or candidate mapping relationships
before they are authorised when each is unmistakably labelled as explanatory rather
than as an approved SPDTF assertion. Illustrative relationships do not enter the
governed mapping register or acquire standards status through publication on this page.

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

Every recurring animation must belong to one of these three signatures; a fourth
recurring motion pattern fails the design review.

Motion must respond to focus and touch as well as pointer input. It must stop when
offscreen or when the document is hidden. Reduced-motion preferences receive the
complete static state without delayed or hidden content.

The page must not use scroll hijacking, a custom cursor, autoplay background video,
decorative parallax, pinned scrollytelling or viewport-height empty bands. Visitors
read by scrolling normally and may reach the form without completing an interaction.

### 6. Evidence and public claims

The page may show participating organisations, quotations or claims about real
modelling outcomes only when their authority, wording and publication rights are
recorded. It must not invent social proof or imply endorsement from a participant,
trade body, government body or standards organisation.

Illustrative worked examples and candidate mappings do not need prior authorisation.
They must be labelled as illustrative, must not be attributed to an organisation or
working group, and must not be described as accepted, reviewed or published SPDTF
content.

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

The production-build performance receipt records the audit tool and version, device
and network profile, and the median of at least three runs against `/join`. The mobile
lab profile passes only with Largest Contentful Paint at or below 2.5 seconds,
Cumulative Layout Shift at or below 0.1 and Total Blocking Time below 200 milliseconds.
These are the published “good” thresholds for
[Core Web Vitals](https://web.dev/articles/vitals) and the corresponding
[lab responsiveness proxy](https://web.dev/articles/tbt).

When sufficient production traffic exists, the 75th percentile must also meet LCP at
or below 2.5 seconds, Interaction to Next Paint at or below 200 milliseconds and CLS
at or below 0.1 on both mobile and desktop. An optional visual enhancement that causes
a failed lab or field threshold is disabled until the threshold is restored.

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
- It does not approve any quotation, logo, participant claim or model candidate as
  SPDTF standards content. Illustrative campaign examples remain non-authoritative.
- It does not authorise deployment, campaign publication, LinkedIn activity or
  trade-body outreach.

## Confirmation

The operator accepted the route, shell and narrative contract by explicitly requesting
its implementation on 27 August 2026. ADR-0069, ADR-0071 and ADR-0073 are amended in
the same decision change. This ADR remains accepted, rather than implemented, until
all of the following are true:

- `/join` and `/join/privacy` are the only public page routes for the signup journey;
- `/accessibility` exists as the canonical public accessibility statement and the
  standalone footer links to it;
- the site authentication gate has been removed through its own accepted decision,
  with no interim join-route allowlist exception, and anonymous access to all three
  public pages and the submission API is verified;
- the former nested routes are absent without compatibility routing;
- all internal campaign and header links use `/join`;
- site navigation, the route-migration registry, the information-architecture
  baseline and all path-pinned signup, infrastructure, design-system and IA tests use
  the new routes;
- `/join`, `/join/privacy` and `/accessibility` do not render the Knowledge Base
  header, sidebar, breadcrumb, table of contents or previous/next furniture;
- the official OPDA mark provides a clear route home, `/join/privacy` provides a clear
  route back to registration, and the campaign footer exposes the required privacy
  and accessibility links;
- the contextual interaction preserves local ownership, outward common elements and
  separate dotted SKOS mappings, with every unreviewed example labelled as illustrative
  rather than as an authorised SPDTF assertion;
- every interactive context and form control is usable by keyboard, touch and pointer;
- the page contains the five decided narrative chapters and no recurring motion
  pattern outside the three named signatures;
- the complete page remains understandable with WebGL and motion disabled;
- reduced-motion, forced-colour, 320 CSS-pixel reflow and 400% zoom checks pass;
- the recorded three-run mobile performance audit meets the LCP, CLS and TBT
  thresholds in this decision;
- the existing form fields, privacy acknowledgement, validation, API contract and
  human review behaviour remain unchanged;
- unauthorised logos, quotations and endorsements are absent;
- `make test` and `make build-data` pass; and
- `DESIGN.md` and the live design-system documentation are reconciled with the
  implemented route and components in the same change.

## Relationship to other decisions

- [ADR-0069](./ADR-0069-public-working-group-recruitment-and-signup.md) remains the
  authority for signup scope, form data, validation, privacy, storage, retention and
  human review. This ADR amends its canonical public page routes, presentation layer
  and prior no-JavaScript requirement.
- [ADR-0071](./ADR-0071-bounded-context-recruitment-campaign.md) remains the authority
  for campaign scope, recruitment channels, public promises and measures. This ADR
  amends only its canonical signup URL and campaign-page composition.
- [ADR-0073](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
  remains the authority for OPDA brand foundations, semantic tokens, controls and
  accessibility. It records the standalone campaign as an intentional shell exception
  and the resulting components are documented in the design system.
- [ADR-0079](./ADR-0079-make-the-site-public-and-retire-the-edge-authentication-gate.md)
  removes the site authentication gate while preserving independent service boundaries;
  this campaign does not add a route exception or interim allowlist.
- The Finance and Banking presentation remains an isolated presentation surface and
  a source of tested narrative patterns. It is not the canonical recruitment page or
  a second design-system authority.
