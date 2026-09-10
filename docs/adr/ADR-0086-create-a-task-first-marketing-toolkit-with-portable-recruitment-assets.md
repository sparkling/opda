---
status: accepted
date: 2026-09-10
updated: 2026-09-10
tags: [marketing, recruitment, information-architecture, email, linkedin, content, portability, accessibility]
supersedes: []
amends: [ADR-0069, ADR-0071]
depends-on: [ADR-0073, ADR-0078, ADR-0079, ADR-0083, ADR-0085]
implements: []
---

# Create a task-first Marketing toolkit with portable recruitment assets

## Context and Problem Statement

OPDA has a canonical working-group recruitment journey at `/join`, an organic
LinkedIn campaign and individual trade-body outreach. Its maintained material is
spread across repository documents, parameter files, email templates and a
facilitator presentation. Those sources are not an immediately usable toolkit for
someone helping OPDA reach practitioners.

The primary task is concrete: OPDA's chief executive, Maria, asks an interest group,
trade body or professional organisation to email its members or post on LinkedIn.
The organisation needs a finished member-facing invitation, not just OPDA's request
that it share a link. OPDA also publishes from its own LinkedIn account. These are
different speakers, recipients and actions; one generic block of copy cannot safely
stand in for all three.

The operator has requested an implemented top-level **Marketing** page and menu,
including rich HTML email templates with images inside the email. The operator has
also clarified the intended launch policy: the website, including Marketing, will
be publicly readable when it goes public; only per-page discussions stay locked.
That future policy is not an instruction to remove the current development gate.

## Decision Drivers

- Let an organisation share a complete, credible invitation with minimal editing.
- Distinguish OPDA's request, an organisation's invitation to members and each
  organisation's own LinkedIn voice.
- Give Marketing an explicit top-level home organised by tasks, not file formats.
- Keep one content authority across previews, copy controls and downloadable packs.
- Make email imagery portable without depending on access to the developing site.
- Reuse governed OPDA brand assets, domain labels and participation boundaries.
- Preserve the current development protection and the future public-reading target.
- Prepare reusable assets without sending, posting, importing contacts or granting access.

## Considered Options

- **A — Link to existing repository files.** Preserves source material but makes
  recipients assemble and adapt the campaign themselves.
- **B — Add a generic asset library under Resources.** Makes files discoverable but
  hides the requested top-level task and leaves the sender/audience distinction unclear.
- **C — Create a task-first Marketing toolkit from one registry (chosen).** Gives
  each task the right voice and generates portable assets from shared content.
- **D — Build a campaign-sending application.** Adds recipient data, provider state
  and dispatch authority that this task neither needs nor authorises.

## Decision Outcome

Choose **C**. This is an accepted implementation decision, not a record of completed
tests, deployment, public launch or campaign dispatch.

### 1. Route, navigation and task ownership

`/marketing` is a top-level content destination named **Marketing** in the existing
global menu. The route and its children have explicit ownership, content status and
search treatment in the shared information-architecture contracts. Marketing is not
filed under Resources, made a child of `/join`, or used as a second signup journey.

Use the existing documentation page template, global header, contents rail and
brand foundations. `MarketingLayout` is a thin composition over `Layout`, not a
second page grid or spacing system. The six task destinations are:

| Task | Outcome |
|---|---|
| Invite someone | OPDA asks an organisation to share the opportunity; a direct personal invitation is separately labelled if supplied. |
| Share with members | An organisation obtains a ready member-facing email and supporting share pack. |
| LinkedIn | Separate copy and graphics for OPDA's own account and an organisation's account. |
| Presentations | A short portable recruitment presentation and one-page introduction, distinct from the longer working-group facilitation deck. |
| Employer support | A prospective contributor can explain the opportunity and ask their employer for support. |
| Brand | Governed OPDA marks, supporting imagery and concise reuse guidance. |

The primary journey connects the first two tasks: prepare the OPDA request, choose
the relevant domain insert, then give the organisation a complete member-sharing
pack. Show audience and speaker before the copy or download controls. Formats are
choices within a task, not the page's primary information architecture.

The 10 September navigation amendment separates three axes: **By task** contains
the six actions; **By audience** has a searchable landing at `/marketing/packs`;
and **By broadcaster** starts at `/marketing/broadcasters`. The latter distinguishes
authorised OPDA representatives, organisations and interest groups, and individual
supporters. Broadcaster pages curate links to the existing material in the right
voice; they do not create duplicate assets or new permissions. Audience packs are
not children of the member-email task. General pack cards open the pack overview;
task-specific cards may explicitly link to a relevant section. One shared
section-navigation registry owns breadcrumbs, current location and previous/next
navigation; search uses the same broadcaster registry.

The accompanying design-system review removes Marketing-only typography, cards,
button overrides and article-flow rules. Page titles, reading measure and section
spacing come from `Layout` and the editorial stylesheet. `DestinationCards`,
`CampaignSectionHeading` in its compact document role, `Callout` and
`CampaignThemeImage` supply existing presentation components. Shared `Button` and
`ActionGroup` components own website action markup and wrapping/spacing; button
appearance remains in the common `.btn` CSS. Copy controls and preview containment
are the only toolkit-specific UI styling. Standalone email and campaign artefacts
remain self-contained, with their email-compatible styling unchanged.

Ordinary prose-link states, including visited colours, must exclude shared buttons
and button-role links. A button retains the foreground belonging to its semantic
variant in both themes; visited history must not turn yellow actions into text links.

### 2. One canonical content registry

`src/data/marketing/packs.mjs` is the selected canonical registry and exports seven
packs: `general` for cross-domain use and one for each of the six domain IDs below.
It composes editorial domain inserts and campaign status from
`src/data/marketing/domains.mjs`. Together these modules own the new toolkit's
asset identities, task, speaker, audience, domain,
subject or title, body, call to action, imagery, version/provenance and available
formats. Shared campaign propositions and domain inserts are composed rather than
manually copied into parallel editable templates.

The page, full email previews, plain-text copy controls and downloadable HTML, TXT,
EML and packs consume the same registry. Generated files are outputs, not competing
content authorities. Generation is deterministic and has a drift check. Invalid
asset IDs, domain IDs, paths, URLs or header values fail at the generation boundary;
text is escaped for its output context.

`scripts/marketing/build-assets.mjs` generates each pack beneath
`public/marketing/<pack-id>/`; its `--check` mode verifies the outputs without
rewriting them. The selected output contract is:

- `email/member.{html,txt,eml}` and `email/opda.{html,txt,eml}`;
- `email/personal.{html,txt,eml}` for a separately voiced personal invitation;
- three numbered standalone `linkedin/<voice>-<number>-<post-id>.{html,txt}`
  documents per voice, each containing only that post;
- retained `linkedin/{opda,partner}.{html,txt}` aggregate export URLs for compatibility,
  not used as the website's individual-post previews;
- `newsletter/{short,long}.{html,txt,eml}`;
- `email/employer.{html,txt,eml}` in the general pack;
- audience-specific `images/contribution-infographic.{svg,png}`;
- `one-pager.html` and `slides.html`;
- local `images/` and `manifest.json`; and
- `<pack-id>-campaign-pack.zip`, containing the portable sharing material.

The filename `partner.txt` identifies the organisation-voice variant; it is not a
claim that the sharing organisation has an OPDA partnership.

The site build runs `marketing:check`: it verifies registry and source-image
digests, committed output bytes and the focused Marketing contracts using Node
only. `make marketing-build` regenerates changed image derivatives and packs with
local ffmpeg and the pinned Sharp rasterizer; CI does not call an image-generation service. Plain-text
copy controls, TXT downloads and MIME text parts call the same pure renderer.

Use the six stable group IDs already accepted by the signup service:
`finance-and-banking`, `conveyancing`, `estate-agency`, `surveying-and-valuation`,
`property-data-services` and `property-technology`. Six available inserts do not
silently change ADR-0071's campaign wave: the five later groups remain its target,
and Finance and Banking is an explicitly labelled existing-group variant.

The earlier LinkedIn document, outreach register, parameter file and trade-body
templates remain preserved historical sources. They are not overwritten or treated
as an automatically approved send population. The new registry is authoritative
for the new toolkit assets; changes to campaign scope still require a decision.

### 3. Separate voices and participation promises

The **OPDA-to-organisation** message asks an official organisation-level contact to
share the supplied opportunity by member email or LinkedIn. It never requests a
member list or implies that the organisation already endorses OPDA. Personalised
sender details and an optional chief-executive signature are editable preparation
fields, not evidence that Maria has sent or individually approved a message.

The **organisation-to-members** email addresses members directly, explains why
their experience matters, describes practical contributions and sends an interested
person to `https://opda.org.uk/join`. It must already read as the invitation members
will receive, not as OPDA asking those members to circulate a request.

The **OPDA LinkedIn** variant speaks for OPDA's own account. The **organisation
LinkedIn** variant shares OPDA's opportunity from that organisation's perspective;
it does not claim to be OPDA or imply partnership. Employer-support copy speaks
from the prospective contributor's perspective and makes no invented commitment
about meeting schedules, time requirements or employer approval.

All variants preserve non-technical reassurance, authorised sharing and human
review. Registration is an expression of interest, not automatic OPDA membership,
Microsoft access, standards authority, accreditation, voting rights or marketing
consent. Do not invent deadlines, endorsements, participant quotations, release
dates or a settled government mandate. Reuse the existing approved proposition
without turning the toolkit into a new policy explainer.

### 4. Portable rich email, not an image link masquerading as an email

Provide a complete visual HTML preview, downloadable HTML, a plain-text alternative
and an unsent `.eml` draft for each email variant. The visible preview represents the
same content and imagery as the downloadable draft; a screenshot alone is not a
template. The member email includes purposeful campaign imagery within its body.

Rich previews are the primary content on the actual toolkit pages, not merely
links beside visible text-only substitutes. `MarketingPreview.astro` owns the
script-disabled, lazy-loaded preview and download actions. `MarketingCopy.astro`
places optional copy controls behind a closed **View plain text** disclosure.
The same treatment covers member, OPDA, personal, employer and newsletter messages.
Only allowlisted, generated, script-free documents may be embedded. The marketing
pages use the shared `ActionGroup` spacing so buttons do not collide with nearby content.
Repeated download and preview actions include the material title in their accessible
names. A post's primary upload asset leads its action group; generic HTML and
plain-text alternatives remain secondary.

The EML uses a MIME multipart structure with plain text and HTML alternatives and
inline image parts referenced by `cid:`. Include the actual encoded image bytes,
correct media types, unique content IDs and inline dispositions. Every referenced
content ID resolves to exactly one image part. Required images must not depend on
remote loading, an authenticated OPDA URL, tracking infrastructure or a data-URI
assumption about email-client support. Use email-compatible image formats and
bounded dimensions/byte sizes; the branding and message remain understandable when
an email client hides images.

Standalone browser-preview HTML is self-contained, including its image bytes, and
must open offline without fetching site styles, images or scripts. The EML remains
the portable email format. Explain the difference between downloading an EML draft,
copying plain text and copying formatted HTML: browser clipboard behaviour does
not prove that an email client retained inline attachments. Use conservative email
layout, inline styles, meaningful alternative text and readable text links rather
than website scripts, external fonts or CSS-only essential content.

Downloads remain unsent, with no default recipients, prefilled personal From
identity, dispatch integration, tracking pixel or tracked redirect. Provide clear
instructions to review speaker, sender, organisation placeholders, domain, links
and recipient scope before use. Never
prepopulate fabricated recipients, credentials or a private workspace invitation.
Header generation rejects CR/LF injection; generated names and paths are allowlisted.

### 5. Presentations, one-page material, social graphics and brand

Supply short, portable recruitment material and social graphics using the same
proposition, domain inserts and OPDA assets. These must work outside the website;
they cannot merely link to the longer facilitator deck or rely on its interactive
runtime. Clearly label the purpose and format of each download. Preserve the
existing working-group presentation as a separate facilitation surface.

The initial short deck is an offline HTML presentation with speaker notes, not a
PPTX. The overview is printable HTML, not a pre-rendered PDF. Both are labelled
honestly and generated from the canonical registry. A later native presentation
format may be added when the supported authoring runtime and verification are
available; do not substitute a renamed file or an unverified conversion.
Slides use the available width until speaker notes are requested. Notes and edit
controls expose their toggle state. Copying slide text excludes speaker notes, and
an edited download preserves content changes while resetting transient UI modes.

Reuse authorised marks, but give each illustration placement its own concept and
composition under the 10 September amendment to ADR-0073. Record exact purpose,
technique, prompts, dimensions, theme pairing and source provenance; retain older
artwork as archives. Previews and downloads of the same campaign faithfully show
that campaign's artwork; this is not permission to reuse it as decoration elsewhere.
An organisation may identify itself in its own message but the toolkit does not
invent co-branding rights, display unapproved logos or imply endorsement. All
essential explanations remain text, not rasterised words alone.

LinkedIn receives distinct OPDA and organisation voices. Each post is presented in
its own labelled section, with one rich preview, matching downloads and one optional
plain-text disclosure. Never put several posts inside one visible preview followed
by detached copy buttons. Shared `src/data/marketing/previews.mjs` defines each
post's asset identity and the exact embed allowlist for the website and its checks.
The campaign includes illustration and an audience-specific contribution infographic.
HTML is the portable review document, not a format pasted into a LinkedIn feed.
Provide JPEG and PNG assets suitable for upload and editable SVG alongside optional
per-post text. The infographic shows authorised practitioner evidence informing
working-group review and the draft specification, not automatic adoption or approval.
An upload-image preview contains the same artwork as its download. Suggested image
descriptions are visible beside the relevant post and share the artwork's canonical
description; posts without an upload image state that explicitly.
The portable email/graphic typography deliberately uses the existing invitation's
Georgia/Arial fallback stacks; it does not claim exact web-font rendering in clients.

The toolkit uses static compositions and deliberate interaction. No autoplay,
decorative continuous rendering, new tracking service or campaign-management
backend is introduced. Copy feedback and progressive enhancement remain bounded,
keyboard-operable and compatible with reduced motion; readable content and ordinary
download links do not depend on JavaScript.

### 6. Operational email reference gallery

The separate `/marketing/operational-emails` subsection shows what participants
can expect from the website-owned approval and access-change services. It is not
a campaign pack or an invitation for others to forward. Its finite catalogue has
one company-folder and one Teams-only invitation sample for each domain, one
withdrawal sample for each domain, and one website-sign-in-disabled sample.
Each sample has its own page, rich preview and clearly labelled subject. The
shared site navigation and search include this subsection under **Service emails**.

Generate the samples from ADR-0085's existing pure domain invitation and withdrawal
compilers and their original HTML/text shells, not copied or restyled wording.
The offline generator substitutes a fictional name, resolves the appropriate
conditional access branch, embeds the existing logo, removes comments and disables
every link. Reject unresolved slots, unknown sample identities, active content and
remote assets. Standalone samples carry a visible sample notice so their purpose
survives an HTML download. They have no dispatch facility or recipient population.
The normal build checks generated bytes against the current canonical templates.

Provider-owned authentication and Microsoft invitation messages are outside this
gallery. Showing the current repository-pinned service templates is not a claim
that a provider template was freshly read back, an email was sent, or that access
has been granted. This amendment does not change ADR-0085's automation or copy.

### 7. Current protection, future public launch and external actions

**Current development state:** ADR-0079's 9 September amendment continues to
protect the site. Marketing pages, previews, search entries, images and downloads
inherit that protection. Do not add a Marketing, join, download or asset exception,
weaken the gate, or publish packs through a separate public host to circumvent it.
Normal verified deployment may activate Marketing within the protected site; it
does not establish public reachability or launch the recruitment campaign.

**Future public launch target:** all website pages, including Marketing and its
reusable assets, are open to read when the owner launches the public website. Only
per-page discussions remain authenticated under their own service boundary. Do not
design permanent Marketing-only membership or role restrictions. The actual access
cutover remains a separately authorised, tested deployment; this task does not
execute it. A public sharing campaign cannot be described as ready to launch while
its canonical `/join` destination is inaccessible to the intended recipients.

**External actions:** preparing, copying or downloading an asset does not authorise
sending an email, creating an external provider draft, posting on LinkedIn,
importing contacts or granting membership. Each dispatch or publication action
requires its own explicit instruction, as in ADR-0071. Approval invitations,
withdrawal messages, newsletters and recruitment remain separate purposes; none of
ADR-0085's live automation or historical send records is changed by this toolkit.

## Consequences

- Good, because organisations receive a member-ready message, not an editing task.
- Good, because OPDA and organisation voices remain explicit across channels.
- Good, because one registry prevents preview, copy and download drift.
- Good, because CID drafts carry their imagery without depending on website access.
- Bad, because portable email needs its own MIME, image-size and client-compatibility
  checks; a browser preview alone is insufficient evidence.
- Neutral, because toolkit availability is distinct from public launch, dispatch,
  membership approval and standards authority.

## Confirmation

Implementation must establish all of the following before it is represented as
complete. No execution evidence is claimed by accepting this ADR.

- `/marketing` is discoverable as a global destination, has the correct active
  menu/route/search ownership, and presents the six tasks without moving `/join`.
- The primary OPDA request leads to a complete organisation-to-members pack; OPDA
  and organisation LinkedIn variants are separate and all six domain inserts work.
- Registry-driven preview, copy, text, HTML, EML and pack contents agree on voice,
  domain, participation boundaries, imagery and canonical signup links.
- Automated checks parse MIME, decode the inline images, resolve content IDs,
  reject header/path/URL injection and detect missing or stale generated assets.
- Downloads are usable without a sending account or a live website session after
  download; sender/organisation placeholders and no-dispatch status are explicit.
- Email rendering checks distinguish structural evidence, browser-preview evidence
  and any observed email-client behaviour; no untested client guarantee is claimed.
- Keyboard, narrow-screen, reduced-motion and no-JavaScript content/download checks
  cover the task journey; static assets introduce no continuous rendering workload.
- The short presentation, one-page introduction and social graphics are genuinely
  portable outputs, not placeholder links to future work.
- `make test`, `make build`, generated-output drift checks and the relevant IA/release
  contracts pass before the scoped commit and CI-only deployment.
- Release evidence identifies the deployed commit and verifies the Marketing route
  and representative downloads through the current protected boundary. Public
  availability, future launch and actual campaign sends are reported separately.

## More Information

- [ADR-0069 — recruitment and signup](./ADR-0069-public-working-group-recruitment-and-signup.md)
- [ADR-0071 — coordinated recruitment campaign](./ADR-0071-bounded-context-recruitment-campaign.md)
- [ADR-0073 — OPDA brand and design system](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
- [ADR-0078 — canonical standalone join journey](./ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md)
- [ADR-0079 — historical public access and current development protection](./ADR-0079-make-the-site-public-and-retire-the-edge-authentication-gate.md)
- [ADR-0083 — proportionate release validation](./ADR-0083-rebuild-proportionate-risk-based-ci-cd.md)
- [ADR-0085 — separately governed approval invitations](./ADR-0085-approval-driven-working-group-onboarding-and-invitations.md)
