---
status: accepted
date: 2026-08-27
updated: 2026-09-02
tags: [working-groups, recruitment, campaign, signup, design-system, accessibility, routing]
supersedes: []
depends-on: [ADR-0038, ADR-0069, ADR-0071, ADR-0073, ADR-0079]
implements: [src/layouts/StandalonePublicLayout.astro, src/components/SiteFooter.astro, src/components/campaign, src/data/working-group-campaign.ts, src/pages/join, src/pages/accessibility.astro, src/styles/standalone-public.css]
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

The standalone working-group presentation at `/presentation/working-group-kickoff`,
first authored for Finance and Banking, demonstrates a stronger editorial hierarchy:
large display typography, one principal idea at a time, immediate reassurance and a
clear working-group promise. It is a presentation, however, not a suitable public
signup journey. Its technical modelling story, 24-slide sequence, fixed viewport,
presenter controls and deliberate empty space must not be copied into the campaign
page.

OPDA therefore needs a standalone campaign surface that combines the
presentation's narrative confidence with the existing signup page's complete form,
privacy and accessibility contract. Its recruitment story must start with the
industry problem and the value of professional judgement, not with OPDA's modelling
method.

## Decision drivers

- Give public recruitment one short, memorable and trustworthy canonical URL.
- Let the campaign use the full viewport without inheriting documentation chrome.
- Recruit subject-matter experts and industry practitioners in familiar language.
- Explain the wider programme, its 2030 direction and SPDTF's in-development status.
- Make the value of professional judgement and practical participation explicit.
- Keep the route focused on participation and human authority rather than on OPDA's
  tooling or the use of AI.
- Preserve the approved form fields, validation, privacy notice, storage and human
  review boundary from ADR-0069.
- Preserve the campaign scope, promises and prohibited implications from ADR-0071.
- Remain visibly OPDA and consume the governed design tokens from ADR-0073 without
  requiring every campaign composition to look like a documentation component.
- Provide keyboard, reduced-motion and forced-colour support for every material part
  of the journey.
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

Amended on 27 August 2026: the public narrative is now SME-first, the semantic
constellation is replaced by practical working-group cards, and the signup form
follows the active light or dark theme without changing its service contract.

Amended on 28 August 2026: the campaign leads with the practical reasons that
commercial operators, professionals, technologists and public-interest contributors
would take part. Government policy and the legislative pathway provide a bounded
"why now" context: they make the window to influence emerging property arrangements
credible, but they are not the campaign's sole proposition. The page must distinguish
the Data (Use and Access) Act 2025's general Smart Data framework from prospective
property-specific arrangements, and must continue to state that SPDTF is an industry
programme in development—not a government-approved or adopted statutory scheme.

Refined on 30 August 2026: the hero retains its two-column campaign composition and
presents its three influence points as a compact vertical sequence. The no-expertise
message is primary reassurance rather than fine print, and every campaign section uses
the hero's shared content axis.

Amended on 31 August 2026: the canonical presentation was generalised for every domain
working group while retaining its isolated visual-system boundary and established
identity. The recruitment campaign may continue to draw on its tested narrative patterns,
but neither surface becomes the other&rsquo;s content or design authority.

Amended on 1 September 2026: `/join` now omits the standalone statement masthead and
uses the same content-width hero header as the homepage, with its linked icon-and-name
heading on the left and the design-system theme control on the right. The influence
panel replaces ordinal markers with larger tree-shaken Lucide icons while its text
remains the accessible source of meaning. Shared panel type, spacing and the gap below
the organisation heading are governed by the campaign styles used on both routes.

Amended on 2 September 2026: the privacy and accessibility statements now use the
same global `Header` component as `/programme`, with both side rails, breadcrumbs,
comments and previous/next navigation explicitly omitted. The complete global menu
remains visible but does not highlight a current Knowledge Base destination. The recruitment route
remains standalone with its existing campaign hero header. This removes the legacy
statement-only masthead while preserving the focused signup journey and shared footer.
The standard `app-main` track is the sole width authority for both statements: their
article, title, lead and content sections add no nested width or maximum-width, and
the former two-column statement grid is replaced by full-track document flow.
The wrapper also adds no vertical padding; the standard `app-main` spacing provides
the sole top and footer clearance so those gaps do not stack.

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

### 2. Public-service shells

The `/join` route does not use the Knowledge Base `Layout` or inherit its global
header, section navigation, breadcrumb, table of contents, previous/next navigation
or article wrapper. The `/join/privacy` and `/accessibility` statements use the
standard Knowledge Base `Layout` and global `Header`, but set the shell to omit both
side rails, breadcrumbs, comments and previous/next navigation.

The public-service route family supplies only the orientation and escape routes
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

This is not a separate brand or design system. Both shells consume the official
assets, semantic tokens, typography, controls, focus states and form primitives
governed by ADR-0073. Campaign-specific spatial and editorial components must be
added to the design-system documentation when implemented.

On 1 September 2026 the standalone shell adopted the shared `SiteFooter` rather than
maintaining a campaign-specific duplicate. It preserves the required privacy,
accessibility and organisation exits while adding the linked delivery credit. The join
hero also adds the design-system ghost button as a transparent OPDA return control beside
the theme control; this retains the minimal public-service shell without introducing
Knowledge Base furniture.

### 3. Narrative structure

The campaign uses seven naturally flowing chapters rather than a long card sequence
or a slide deck:

1. **The practical invitation.** The opening makes the case for shaping the
   information, guidance and services that the visitor's sector may work with.
2. **Why people participate.** A concise editorial grid names commercial viability,
   workable professional practice, interoperable implementation and public-interest
   safeguards as distinct, legitimate motivations.
3. **Why now.** A compact policy chapter explains that government is pursuing
   home-buying reform and wider Smart Data policy, while property-specific
   arrangements remain prospective. It makes the opportunity to influence the
   practical detail clear without implying a settled mandate.
4. **Where experience matters.** Six plain working-group cards show who each group is
   for, while a cross-cutting invitation welcomes commercial, consumer, accessibility,
   regulatory and public-interest perspectives.
5. **What participation can influence.** A short sequence explains how participants
   define important realities, review proposals, challenge weak assumptions and test
   practical results.
6. **Boundaries and trust.** The page explains human review, authorised sharing and
   the limits of participation and standards authority.
7. **Register your interest.** The complete form is the final, visually distinct
   destination.

The page states that participants do not need data-modelling or technical expertise.
Ontology, graph, mapping and internal candidate-lifecycle detail belongs in the
Knowledge Base, not in the primary recruitment narrative. The page must not promise
automatic membership, Microsoft access, voting rights, accreditation, endorsement,
publication or standards authority.

### 4. Working-group choices

The six selectable working groups are presented as ordinary semantic cards using
their public label and practical scope. Each card can carry its group selection to
the registration form, but the form remains independently understandable and
operable and its HTML inputs remain authoritative.

The campaign does not use invented domain definitions, candidate mappings, a common-
boundary diagram or ontology terminology to explain the groups. Those details can be
linked from the Knowledge Base for visitors who want them; they are not a prerequisite
for deciding whether to participate.

### 5. Motion and interaction

The complete recruitment story is visible without client-side reveal logic. Motion
is limited to existing design-system control feedback and must not delay or hide
content. Reduced-motion preferences receive an equivalent static experience.

The page must not use scroll hijacking, a custom cursor, autoplay background video,
decorative parallax, pinned scrollytelling or viewport-height empty bands. Visitors
read by scrolling normally and may reach the form without completing an interaction.

### 6. Evidence and public claims

The page may show participating organisations, quotations or claims about real
modelling outcomes only when their authority, wording and publication rights are
recorded. It must not invent social proof or imply endorsement from a participant,
trade body, government body or standards organisation.

The public story centres the industry problem, the value of professional judgement
and the working groups. AI is mentioned once as a bounded drafting aid; it is not the
campaign's proposition and cannot make a draft official.

### 7. Registration and privacy

The registration form remains at the bottom of the page and retains every field,
choice, acknowledgement and validation rule approved by ADR-0069. JavaScript is
required for registration; this ADR does not require the campaign or form to operate
when JavaScript is unavailable.

The campaign may provide a persistent “Register your interest” control and carry a
context selection into the form. It must not hide required information in an opaque
multi-step wizard, submit data before the visitor activates the form or change the
meaning of registration.

The form area follows the active light or dark theme using semantic surface, text,
border, focus and status tokens. Its control, validation, focus and error states must
meet the design-system and WCAG contracts in both themes.

### 8. Performance and resilience

The semantic HTML proposition, reassurance and primary action render without an
optional spatial or canvas dependency.

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

The complete proposition, group explanations, participation process, trust boundary,
privacy link and form remain usable when motion is disabled.

## Consequences

### Positive

- Public recruitment gains one short and memorable canonical URL.
- The campaign can establish a stronger hierarchy without compromising the
  Knowledge Base shell used by standards and governance documentation.
- The campaign speaks to practitioners in familiar language and keeps technical
  modelling detail in the Knowledge Base.
- The working-group presentation contributes proven language and interaction patterns
  without becoming the public funnel.
- The existing form, privacy, storage and human decision boundary remain intact.
- The design remains OPDA-specific while allowing a more ambitious campaign
  composition.

### Negative

- OPDA must maintain a small standalone shell in addition to the Knowledge Base
  layout.
- Campaign-specific components require their own responsive, accessibility and
  performance testing.
- Removing the former route without a redirect will intentionally break any existing
  external links to it.

### Neutral

- This decision does not change the six selectable property-domain groups, campaign
  target audiences, form fields, API, storage, retention or onboarding process.
- It does not approve any quotation, logo, participant claim or draft as SPDTF
  standards content.
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
- every working-group choice and form control is usable by keyboard, touch and pointer;
- the page contains the seven decided narrative chapters and no scroll-driven reveal
  sequence;
- the complete page remains understandable with motion disabled;
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
- The generic working-group presentation remains an isolated presentation surface and
  a source of tested narrative patterns. It is not the canonical recruitment page or
  a second design-system authority.
