---
status: accepted
date: 2026-08-12
tags: [engagement, recruitment, working-groups, linkedin, signup, privacy, security, aws, postmark]
supersedes: []
depends-on: [ADR-0038, ADR-0040, ADR-0063, ADR-0065]
implements: [ADR-0065]
---

# Recruit later bounded-context working groups through a public campaign and verified sign-up

## Context and Problem Statement

The Finance and Banking Working Group began from a private roster supplied by OPDA. That
roster cannot be reused as the recruitment model for the other bounded contexts: OPDA does
not hold equivalent contact lists for Conveyancing, Estate Agency, Surveying and Valuation,
Property Data Services or Property Technology.

ADR-0065 therefore says that later working groups will use social-media recruitment and an
explicit sign-up. It does not decide what OPDA will say publicly, what sign-up means, which
information is necessary, how an address is verified, where the records live, or how an open
campaign can coexist with invitation-only Teams and SharePoint spaces.

The current Astro site is statically built into a private S3 origin and delivered by CloudFront.
The apex and a small set of assets are public; most routes are protected by Lambda@Edge. A
public form therefore needs both a deliberately public website surface and a small runtime
submission service. It must not expose Postmark credentials in the browser, create a second
uncontrolled participant list, automatically provision Microsoft access, or turn evidence
intake into a public file-upload surface.

The public campaign is an invitation to **register interest**, not a claim that every registrant
has become an OPDA member, represents their employer, joins a standards decision body, or will
receive access automatically.

## Decision Drivers

- Reach practitioners and subject-matter experts beyond the Finance and Banking roster.
- Explain the work in non-technical language and make several forms of contribution visible.
- Keep the form short enough to complete from a LinkedIn visit.
- Preserve one authoritative recruitment register rather than maintaining spreadsheets,
  SharePoint lists and provider-specific contact lists in parallel.
- Verify ownership of the supplied email address before OPDA reviews a registration.
- Keep working-group access invitation-only and subject to human review.
- Minimise personal data and give privacy information at the point of collection.
- Allow a personal or generic-provider address to register and participate in Teams while
  retaining the existing company-domain rule for later SharePoint evidence access.
- Reuse the accepted AWS hosting and CI/CD architecture and the existing verified Postmark
  sender domain.
- Protect a public endpoint from automated abuse without placing credentials in the browser.

## Considered Options

- **Option A — Recruit only through privately assembled email lists.** Wait until OPDA obtains a
  roster for each context and repeat the Finance and Banking invitation process.
- **Option B — Use a third-party hosted form.** Link LinkedIn to Microsoft Forms, Typeform or a
  similar service, then export responses into the OPDA operating process.
- **Option C — Use email as the sign-up mechanism.** Ask interested people to email the OPDA
  mailbox with their details and preferred context.
- **Option D — Add a public, verified sign-up service to the OPDA AWS site.** Publish the campaign
  and form on the OPDA domain, verify addresses through Postmark, and store registrations in one
  access-controlled register for human review.

## Decision Outcome

Chosen option: **D — add a public, verified sign-up service to the OPDA AWS site**.

### 1. Campaign scope and message

The first campaign is a LinkedIn post linking to the OPDA sign-up page. It recruits expressions
of interest for exactly five bounded-context groups:

1. Conveyancing;
2. Estate Agency;
3. Surveying and Valuation;
4. Property Data Services; and
5. Property Technology.

Finance and Banking continues through its existing participant process. DBT Smart Data and the
Interoperability Working Group are not advertised as additional property bounded contexts in
this campaign.

The campaign explains that OPDA is creating the **Smart Property Data Trust Framework** as a
governed family of connected domain models. It seeks practitioners, subject-matter experts,
professional bodies, data and product specialists, and technology providers. People may
contribute by sharing authorised source material later, explaining domain language and rules,
reviewing model candidates, testing familiar outputs, and challenging drafts.

The campaign must say that participants are not being asked to understand ontologies, adopt AI,
or have technical knowledge. It must not promise immediate access, membership, accreditation,
voting rights, endorsement, publication of a person's material, or a release date.

The maintained campaign copy lives in
[`docs/recruitment/2026-08-bounded-context-working-group-linkedin.md`](../recruitment/2026-08-bounded-context-working-group-linkedin.md).

### 2. Public sign-up experience

The canonical public route is `/working-groups/join`, with confirmation and privacy information
under the same prefix. Only that prefix and the same-origin submission API become public; the
ontology, evidence corpus and existing knowledge-base routes remain protected.

The page describes the five groups, what participants can contribute, and the sequence:

1. register interest;
2. verify the supplied email address;
3. OPDA reviews the registration; and
4. if accepted, OPDA sends working-group onboarding and access separately.

The form collects only:

- full name;
- email address;
- organisation;
- role or area of expertise;
- one or more of the five working groups, or `Not sure — help me choose`;
- one or more contribution preferences; and
- an optional, length-limited note about relevant experience or perspective.

It does not collect telephone numbers, postal addresses, social-media profiles, demographic or
special-category data, property or customer data, evidence files, or links to evidence. A
required acknowledgement makes clear that this is an expression of interest and permits OPDA to
contact the person about the selected groups. There is no bundled newsletter or marketing
consent.

### 3. Identity, review and Microsoft access

The address must be verified with a one-time link before the registration enters the review
queue. Loading a link does not mutate state because mail-security scanners may follow links:
the confirmation page requires an explicit human action that sends `POST` to the confirmation
endpoint.

Verification is not acceptance. A human acting for OPDA reviews every verified registration.
The public service does not create Entra guests, add Team members, create SharePoint groups or
folders, send working-group invitations, or assign standards decision rights.

Generic-provider addresses are permitted at sign-up and may later be invited to Teams. The
company-domain restriction applies only if SharePoint evidence access is later provisioned.

### 4. Hosting and authoritative register

The existing AWS architecture in ADR-0038 and ADR-0040 is extended as follows:

- static Astro pages remain in S3 and are delivered through CloudFront;
- a cache-disabled CloudFront behaviour for `/api/working-group-interest*` targets an Amazon API
  Gateway HTTP API in `eu-west-2`;
- one Node.js Lambda handles `POST` registration and confirmation operations;
- one encrypted, on-demand DynamoDB table in `eu-west-2` is the authoritative recruitment
  register; and
- Postmark sends one-to-one transactional verification messages from
  `smartdata@openpropdata.org.uk` without open or link tracking.

The table is keyed by an HMAC of the normalised email address rather than the address itself. It
stores the supplied fields, selected contexts, status, timestamps, the active privacy-notice
version, a hash of the opaque verification token, expiry time and Postmark message identifier.
It does not store the Turnstile token, raw IP address or user-agent string. Request bodies and
email addresses must never be written to application logs.

The status lifecycle is `pending-email-verification` → `verified` → `reviewed` → `accepted` or
`declined`, with later `invited` and `withdrawn` states available to the operating process.

### 5. Boundary validation and abuse protection

The Lambda accepts JSON only and enforces a small request-body limit. It rejects unknown fields,
HTML, control characters, invalid email syntax, values beyond declared lengths and working-group
or contribution values outside explicit allowlists. Conditional writes make repeats idempotent,
and responses do not reveal whether an email address is already registered.

The public form uses a honeypot, a minimum plausible completion time, route-level API Gateway
throttling and Cloudflare Turnstile in managed mode. Turnstile is independent of Cloudflare
hosting and is valid behind AWS CloudFront. The Lambda must validate each short-lived,
single-use token through Siteverify and check the expected hostname and action. The Turnstile
secret, email-HMAC secret and the Postmark server token are stored as one
JSON value in an AWS Systems Manager Parameter Store `SecureString`; the browser receives only
the public Turnstile site key. The Lambda role receives only the specific DynamoDB item
operations and parameter read it needs. No runtime credential is committed to this repository
or copied from the local operator keychain.

### 6. Privacy, retention and participant control

The form includes a concise collection notice and links to a dedicated public notice at
`/working-groups/join/privacy`. It names OPDA as controller, explains the recruitment and
working-group administration purposes, identifies the categories collected and the AWS,
Postmark and later Microsoft service relationships, describes international-transfer safeguards,
states the retention periods and provides `smartdata@openpropdata.org.uk` for access, correction,
withdrawal and deletion requests. It also links to the association's general privacy policy.

Unverified registrations expire after 30 days. Verified registrations that are declined,
withdrawn or not progressed are deleted after six months. Accepted participant contact records
are retained for the working group's duration plus 12 months, unless a separately documented
legal obligation applies. DynamoDB TTL is enabled, but the application treats an expired record
as unavailable immediately because physical TTL deletion is asynchronous.

The free-text field warns against including confidential, personal, customer, property-
transaction or special-category information. Sign-up data is operational recruitment data and
must not enter the AI evidence or ontology-building corpus.

### Consequences

- Good, because later groups can recruit beyond an unavailable email roster while retaining a
  clear human approval boundary.
- Good, because the public explanation and form live on the OPDA domain and use the site's design
  system rather than presenting an unrelated form-provider experience.
- Good, because a single encrypted register replaces parallel participant spreadsheets and
  exports.
- Good, because address verification, Turnstile, strict validation, throttling and idempotency
  reduce spam and accidental duplicates without requiring an expensive always-on service.
- Good, because personal email addresses are not incorrectly excluded from Teams participation;
  the company-domain restriction remains scoped to SharePoint evidence access.
- Bad, because a public form adds runtime infrastructure, personal-data handling, secrets and an
  operational review queue to a predominantly static site.
- Bad, because confirmation adds one step before review and may reduce completion compared with
  an unverified form.
- Neutral, because registration does not automate Microsoft provisioning; OPDA still performs
  the acceptance and invitation steps deliberately.
- Neutral, because Turnstile introduces Cloudflare as an abuse-control subprocessor while the
  application and records remain hosted on AWS.

### Confirmation

This decision is confirmed when:

- the exact campaign copy names only the five intended contexts and links to the canonical public
  route;
- anonymous `GET` requests can access the sign-up, confirmation and privacy routes while an
  unrelated knowledge-base route still redirects to authentication;
- registration and confirmation accept only valid allowlisted payloads and never mutate through
  `GET`;
- automated tests cover invalid fields, oversize bodies, honeypot and timing failures, duplicate
  registrations, invalid/replayed/expired tokens, Turnstile rejection and Postmark failure;
- an address cannot reach `verified` without a successful human `POST` confirmation;
- no test or production log contains submitted personal data, tokens or request bodies;
- the DynamoDB table is encrypted, uses TTL, and the Lambda role is limited to the declared table
  and secrets;
- no Teams or SharePoint access is provisioned by the public service;
- keyboard-only and screen-reader checks pass and the interface respects reduced-motion and
  high-contrast preferences;
- `make test` and `make build` pass; and
- the infrastructure and static site deploy through the existing CI-only AWS workflows.

## Pros and Cons of the Options

### Option A — Private email lists

- Good, because it reuses the Finance and Banking delivery process.
- Bad, because OPDA does not have the five required rosters and assembling them would delay and
  narrow recruitment.

### Option B — Third-party hosted form

- Good, because it is quick to publish and provides a ready-made response interface.
- Bad, because it adds a provider and export workflow, fragments the participant record, and
  cannot enforce the complete verification and review boundary without further integration.

### Option C — Email sign-up

- Good, because it needs no application runtime.
- Bad, because unstructured messages create manual transcription, inconsistent fields,
  duplicate records and weak campaign attribution.

### Option D — OPDA-hosted verified sign-up

- Good, because it gives one branded, accessible and testable journey with an authoritative
  register and explicit lifecycle.
- Bad, because OPDA owns the runtime, security, privacy and retention controls.

## More Information

- [ADR-0038](./ADR-0038-hosting-auth-and-comments-architecture-aws.md) establishes the private
  S3, CloudFront and Lambda@Edge architecture that this decision extends with a narrow public
  surface.
- [ADR-0040](./ADR-0040-aws-hosting-ci-cd-pipeline.md) requires infrastructure and site
  publication through GitHub Actions and AWS OIDC rather than operator credentials.
- [ADR-0063](./ADR-0063-domain-led-bounded-context-working-groups.md) defines the working-group
  and bounded-context structure advertised here.
- [ADR-0065](./ADR-0065-ai-assisted-evidence-to-model-workflow.md) decides that later groups use
  social-media recruitment and explicit sign-up; this ADR implements that recruitment boundary.
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [AWS HTTP API throttling](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-throttling.html)
- [DynamoDB encryption at rest](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/EncryptionAtRest.html)
- [DynamoDB time to live](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- [Postmark sending with the API](https://postmarkapp.com/developer/user-guide/send-email-with-api)
- [ICO Guide to UK GDPR](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)
- [Working-group email verification template](../templates/working-group-interest-verification-email.html)
- [Plain-text working-group email verification template](../templates/working-group-interest-verification-email.txt)
