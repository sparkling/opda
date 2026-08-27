---
status: accepted
date: 2026-08-12
updated: 2026-08-27
tags: [engagement, recruitment, working-groups, linkedin, trade-bodies, professional-bodies, signup, privacy, security, aws]
supersedes: []
depends-on: [ADR-0038, ADR-0040, ADR-0063, ADR-0065]
implements: [ADR-0065]
---

# Recruit later bounded-context working groups through a public campaign and simple sign-up

> **Change note — 2026-08-27:** An adversarial review replaced the oversized sticky
> handoff sequence with a natural-height comparison that keeps every domain meaning, moved the
> registration journey ahead of supporting modelling detail, and retained every approved field
> and contribution option. The form now fails safely without JavaScript: it cannot fall back to a
> query-string submission, it exposes an email alternative, and client enhancement validates the
> exact accepted response, times out stalled requests and associates errors with their controls.
>
> **Change note — 2026-08-27:** The join journey moved from `/working-groups/join/**` to
> `/spdtf/working-groups/join/**`, beneath its canonical Working groups owner. The old routes are
> absent without redirects, rewrites, aliases or duplicate pages. Join and privacy now use the
> shared `Layout`, breadcrumb, section navigation, global header and footer; the same-origin API,
> campaign information, form fields, review boundaries and submission behaviour are unchanged.
>
> **Change note — 2026-08-21:** The shared application header now carries a persistent
> “Join a working group” action to the unchanged canonical signup route. This adds a
> discovery path only; form scope, review, storage and access boundaries are unchanged.
>
> **Change note — 2026-08-14:** ADR-0071 now records the campaign operating plan, including
> LinkedIn publishing, selective trade-body outreach, sequencing and measures. This ADR remains
> the authority for campaign scope, the public signup experience, storage and review boundaries.
>
> **Change note — 2026-08-13:** Before the first publication, the sign-up design was simplified
> to match the operating need: accept a short form and store it for human review. The undeployed
> email-verification, Postmark, WAF, custom-origin and secret-management components were removed.
> The public form was subsequently extended to include Finance and Banking, while the social and
> trade-body recruitment campaign remains focused on the five groups without existing rosters.

## Context and Problem Statement

The Finance and Banking Working Group began from a private roster supplied by OPDA. Equivalent
contact lists do not exist for Conveyancing, Estate Agency, Surveying and Valuation, Property
Data Services or Property Technology. ADR-0065 therefore calls for social-media recruitment and
an explicit sign-up for those later groups.

The campaign must explain the programme before asking someone to register. It needs a public,
branded route that shows why connected domain models matter, how people contribute, and that
technical or ontology knowledge is not required.

The existing Astro site is statically built into a private S3 origin and delivered by CloudFront.
A submitted form therefore needs a very small runtime boundary. Registration is an expression of
interest, not automatic OPDA membership, standards authority, Teams access or SharePoint access.

## Decision Drivers

- Reach practitioners beyond the existing Finance and Banking roster.
- Explain the work in non-technical language before asking people to register.
- Keep the form short enough to complete from a LinkedIn visit.
- Store responses in one authoritative place rather than parallel spreadsheets and lists.
- Keep acceptance, onboarding and Microsoft access subject to human review.
- Minimise personal data and explain its use at the point of collection.
- Reuse the existing AWS hosting and CI/CD architecture.
- Keep the solution proportional to a simple expression-of-interest form.

## Considered Options

- **Option A — Private email lists.** Wait for OPDA to obtain a roster for every context.
- **Option B — Third-party hosted form.** Link to Microsoft Forms, Typeform or similar.
- **Option C — Email sign-up.** Ask interested people to send an unstructured email.
- **Option D — Simple OPDA-hosted form.** Add a public form to the existing Astro site and store
  each valid submission through API Gateway, Lambda and DynamoDB.

## Decision Outcome

Chosen option: **D — a simple OPDA-hosted form on the existing AWS site**.

### 1. Campaign scope and message

The campaign combines a LinkedIn post with selective, one-to-one outreach to relevant UK trade
and professional bodies. Both routes link to the same public page and recruit expressions of
interest for exactly five later bounded-context groups:

1. Conveyancing;
2. Estate Agency;
3. Surveying and Valuation;
4. Property Data Services; and
5. Property Technology.

Finance and Banking continues through its existing participant process, but people may also
register interest in that group through the public form. DBT Smart Data and the Interoperability
Working Group are not advertised as additional property bounded contexts.

The campaign explains that OPDA is creating the **Smart Property Data Trust Framework** as a
governed family of connected domain models. People may contribute later by sharing authorised
source material, explaining domain language and rules, reviewing model candidates, testing
familiar outputs and challenging drafts.

Participants are not being asked to understand ontologies, adopt AI or have technical knowledge.
The campaign must not promise immediate access, membership, accreditation, voting rights,
endorsement, publication of material or a release date.

The approved LinkedIn copy is maintained in
[`docs/recruitment/2026-08-bounded-context-working-group-linkedin.md`](../recruitment/2026-08-bounded-context-working-group-linkedin.md).

Trade-body outreach asks an organisation to share the public opportunity with its network. OPDA
does not request a member list, infer endorsement, bulk-add people or grant access through this
route. Messages are sent individually to an official organisation-level contact or contact form.
The maintained outreach assets are:

- [`docs/recruitment/2026-08-bounded-context-trade-body-outreach.md`](../recruitment/2026-08-bounded-context-trade-body-outreach.md);
- [`docs/templates/bounded-context-trade-body-outreach-email.html`](../templates/bounded-context-trade-body-outreach-email.html)
  and its [plain-text alternative](../templates/bounded-context-trade-body-outreach-email.txt); and
- [`docs/recruitment/2026-08-bounded-context-outreach-parameters.json`](../recruitment/2026-08-bounded-context-outreach-parameters.json).

### 2. Public sign-up experience

The canonical public route moved from `/working-groups/join` to `/spdtf/working-groups/join`, with
the privacy notice under the same new prefix. The former routes are removed without compatibility
routing. Only the canonical route family and the unchanged same-origin submission API are public; ontology,
evidence and existing knowledge-base routes remain protected.

The page explains the six selectable domain groups, the kinds of contribution OPDA needs and the
sequence:

1. the person registers their interest;
2. OPDA reviews the expression of interest; and
3. if accepted, OPDA sends onboarding and access separately.

The form collects only:

- full name;
- email address;
- organisation;
- role or area of expertise;
- one or more of the six groups, or `Not sure — help me choose`;
- one or more contribution preferences; and
- an optional, length-limited note about relevant experience or perspective.

It does not collect telephone numbers, addresses, social profiles, demographic or special-
category data, property or customer data, evidence files, or links to evidence. A required
acknowledgement makes clear that this is an expression of interest and permits OPDA to contact
the person about selected groups. There is no newsletter or marketing consent.

### 3. Review and access

A human acting for OPDA reviews every expression of interest. The public service does not create
Entra guests, add Team members, create SharePoint groups or folders, send invitations, or assign
standards decision rights.

Generic-provider addresses are permitted at sign-up and may later be invited to Teams. The
company-domain restriction applies only if SharePoint evidence access is later provisioned.

### 4. Hosting and storage

The existing AWS architecture in ADR-0038 and ADR-0040 is extended only as follows:

- the static Astro campaign page and privacy notice remain in S3 behind CloudFront;
- a cache-disabled CloudFront behaviour for `/api/working-group-interest*` targets an Amazon API
  Gateway HTTP API in `eu-west-2`;
- one small Node.js Lambda accepts `POST /api/working-group-interest`; and
- one encrypted, on-demand DynamoDB table in `eu-west-2` stores each expression of interest.

Each accepted request receives a generated registration identifier. The table stores the form
fields, status `received`, timestamps and active privacy-notice version. Request bodies, email
addresses, raw IP addresses and user-agent strings must not be written to application logs.

### 5. Boundary validation and basic abuse controls

The Lambda accepts JSON only, enforces a 16 KB body limit, rejects unknown fields, HTML, control
characters, invalid email syntax, excessive lengths and values outside the explicit group and
contribution allowlists. A hidden honeypot and minimum plausible completion time discard obvious
automated submissions without storing them. API Gateway applies a low route throttle, Lambda has
bounded concurrency, and the table is on-demand.

This design intentionally has no email verification, confirmation route, Postmark call, WAF,
custom API hostname or runtime secret. These can be reconsidered if observed abuse or an operating
requirement justifies them.

### 6. Privacy and retention

The form links to `/spdtf/working-groups/join/privacy`, which names OPDA as controller, explains the
recruitment and administration purposes, lists the information collected and AWS/Microsoft
service relationships, states retention and provides `smartdata@openpropdata.org.uk` for rights
requests.

Expressions of interest that are declined, withdrawn or not progressed are retained for no more
than six months. Accepted participant records are retained for the working group's duration plus
12 months unless a separately documented legal obligation applies. DynamoDB TTL is enabled for
the initial six-month period; accepted records require a deliberate retention update in the later
operating process.

The optional note warns against confidential, personal, customer, property-transaction or
special-category information. Registration data is operational recruitment data and must not
enter the AI evidence or ontology-building corpus.

### Consequences

- Good, because later groups can recruit beyond unavailable email rosters.
- Good, because the public explanation and form use the OPDA domain and design system.
- Good, because one encrypted register replaces parallel spreadsheets and exports.
- Good, because the runtime has one route, one write operation and no secret or email dependency.
- Good, because human review remains the acceptance and access boundary.
- Bad, because OPDA still owns a small public runtime and a personal-data register.
- Bad, because an unverified address can be mistyped or deliberately submitted by another person.
- Neutral, because obvious automation is filtered but determined abuse may require stronger
  controls later.

### Confirmation

This decision is confirmed when:

- the campaign names only the five later contexts, while the form also accepts Finance and
  Banking, and links to the canonical public route;
- trade-body outreach uses approved assets and never requests a member list;
- anonymous visitors can access both canonical join/privacy routes while unrelated protected
  routes still require authentication and both former URLs reach an unrewritten origin 404;
- the service exposes one POST route and stores one validated record per accepted submission;
- automated tests cover invalid fields, oversized bodies, honeypot/timing submissions and storage
  failure;
- DynamoDB is encrypted, on-demand, TTL-enabled and the Lambda can only write to its table;
- no Teams or SharePoint access is provisioned by the public service;
- keyboard and reduced-motion behavior remains usable; without JavaScript, all explanatory and
  privacy content remains readable, personal data cannot fall into a GET request, and a
  human-managed email registration alternative is shown;
- `make test` and `make build-data` pass; and
- infrastructure and static pages deploy through the existing CI-only AWS workflows.

## Pros and Cons of the Options

### Option A — Private email lists

- Good, because it reuses the Finance and Banking process.
- Bad, because OPDA lacks the five required rosters.

### Option B — Third-party hosted form

- Good, because it is quick to publish.
- Bad, because it adds a provider and fragments the participant record.

### Option C — Email sign-up

- Good, because it needs no application runtime.
- Bad, because unstructured messages require manual transcription and create inconsistent records.

### Option D — Simple OPDA-hosted form

- Good, because it gives one branded journey and one authoritative register.
- Bad, because OPDA owns the small runtime, privacy and retention process.

## More Information

- [ADR-0038](./ADR-0038-hosting-auth-and-comments-architecture-aws.md) establishes the private S3,
  CloudFront and Lambda@Edge architecture extended by this narrow public surface.
- [ADR-0040](./ADR-0040-aws-hosting-ci-cd-pipeline.md) requires publication through GitHub Actions
  and AWS OIDC rather than operator credentials.
- [ADR-0063](./ADR-0063-domain-led-bounded-context-working-groups.md) defines the working groups.
- [ADR-0065](./ADR-0065-ai-assisted-evidence-to-model-workflow.md) decides that later groups use
  public recruitment and explicit sign-up.
- [ADR-0071](./ADR-0071-bounded-context-recruitment-campaign.md) defines the coordinated campaign
  operating plan and links the maintained LinkedIn and trade-body assets.
- [AWS HTTP API throttling](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-throttling.html)
- [DynamoDB encryption at rest](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/EncryptionAtRest.html)
- [DynamoDB time to live](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- [ICO Guide to UK GDPR](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)
