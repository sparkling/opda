---
status: accepted
date: 2026-08-14
updated: 2026-08-27
tags: [engagement, recruitment, linkedin, trade-bodies, working-groups, signup, campaign, measurement]
supersedes: []
depends-on: [ADR-0063, ADR-0065, ADR-0069]
implements: [ADR-0069]
---

# Recruit later bounded-context groups through a coordinated public campaign

## Context and Problem Statement

Finance and Banking began with a private participant roster. OPDA does not have equivalent lists
for Conveyancing, Estate Agency, Surveying and Valuation, Property Data Services or Property
Technology. ADR-0069 therefore establishes a public expression-of-interest page on the OPDA site.

A form alone will not recruit a representative group. People first need to understand what OPDA
is building, why their domain knowledge matters, what participation involves and what it does not
require. OPDA also needs trusted trade and professional bodies to help the opportunity reach
practitioners who may not follow OPDA directly.

The campaign must avoid turning recruitment into indiscriminate bulk email, paid audience
targeting or implied endorsement. It must send every interested person to one canonical signup
journey and leave acceptance and Microsoft onboarding to human review.

## Decision Drivers

- Recruit practitioners and subject-matter experts beyond OPDA's existing network.
- Give each later bounded context a fair opportunity to attract relevant expertise.
- Explain the programme in accessible, non-technical language before requesting personal data.
- Use one authoritative signup route and one expression-of-interest register.
- Ask trade bodies to share the opportunity without requesting or importing their member lists.
- Measure qualified participation and context coverage rather than vanity engagement.
- Keep public recruitment separate from roster-based invitations such as the Technology Working
  Group.

## Considered Options

- **Option A — Wait for private lists.** Delay each group until OPDA receives a complete roster.
- **Option B — LinkedIn only.** Publish one social post and rely on OPDA's existing reach.
- **Option C — Bulk prospecting.** Assemble or buy contact lists and email individuals directly.
- **Option D — Coordinated public recruitment.** Combine a canonical campaign page, organic
  LinkedIn publishing and selective outreach to relevant trade and professional bodies.

## Decision Outcome

Chosen option: **D — coordinated public recruitment through LinkedIn, trade-body outreach and the
OPDA signup page**.

The campaign recruits expressions of interest for five later property bounded contexts:

1. Conveyancing;
2. Estate Agency;
3. Surveying and Valuation;
4. Property Data Services; and
5. Property Technology.

Finance and Banking remains available on the signup form for people who discover the public page,
but it is not the target of this campaign. DBT Smart Data and the Interoperability Working Group
are not promoted as additional property bounded contexts. The cross-cutting Technology Working
Group uses an approved roster and direct invitation rather than this public campaign.

### 1. Campaign proposition

The campaign leads with the sector problem: property information is repeatedly re-entered,
translated and interpreted as it crosses organisational and system boundaries. OPDA is creating
the **Smart Property Data Trust Framework**, a governed family of connected domain models that
preserves useful domain meaning while making exchange clearer and more reliable.

The participation promise is evidence-led:

- practitioners share authorised forms, standards, schemas, definitions, guidance and examples;
- subject-matter experts explain language, rules, exceptions and real-world practice;
- OPDA uses human-directed, AI-assisted modelling to produce reviewable candidates; and
- working-group participants review, challenge and improve those candidates.

Participants are not being asked to understand ontologies, adopt AI or have technical knowledge.
AI does not decide meaning or approve a standard. The campaign must not promise automatic
membership, immediate Microsoft access, voting rights, accreditation, endorsement, publication
of source material or a release date.

### 2. Canonical signup journey

Every post and outreach message links to:

`https://opda.org.uk/working-groups/join`

The public page is the campaign landing page as well as the form. It uses the OPDA design system
to explain the programme proposition, human review, participation boundary, domain handoffs and
modelling method before asking a visitor to register at the bottom of the page. Its detailed,
natural-height property-information comparison uses brief, optional reveal effects. The
comparison has no pinned or scroll-driven state: every domain meaning is visible in the document.
The enhanced form requires successful JavaScript initialisation; without it,
campaign and privacy content remain readable and a safe human-managed email registration
alternative is provided.

Registration is an expression of interest. It is stored in the AWS-hosted register decided by
ADR-0069 and reviewed by a human. It does not automatically create an Entra guest, Team
membership, SharePoint folder or standards role. Generic-provider addresses may register and may
later participate in Teams; only SharePoint source-intake access requires an approved company-
domain account.

### 3. LinkedIn campaign

OPDA publishes the maintained organic post from its own LinkedIn account. The post:

- names the five target contexts;
- asks for practitioners, subject-matter experts, professional bodies, product/data specialists
  and technology providers;
- describes several concrete contribution modes;
- sets the non-technical and human-review expectations; and
- uses the unchanged canonical signup URL.

OPDA does not use paid targeting or upload a contact list for this campaign. Follow-up posts may
focus on one or more under-represented contexts, answer recurring questions, show a reviewable
artefact or provide a closing reminder. Each post must preserve the same scope and signup
expectations rather than invent a new funnel.

### 4. Trade and professional body outreach

OPDA contacts selected organisations individually through an official organisation-level email
address or contact form. The request is to share the public opportunity with a relevant network;
it is not a request for member data.

The vetted register contains primary and secondary routes across all five contexts. The first
outreach wave should contact one primary organisation per context. Further organisations are
used to address an observed coverage gap, not simply to maximise volume. Listing, contacting or
sharing the opportunity does not imply endorsement, partnership or agreement with OPDA.

Messages use the approved HTML or plain-text template and context parameters. Email is sent
individually from `smartdata@openpropdata.org.uk` through Postmark with open and link tracking
disabled, or the same approved text is used in an official contact form. Every send, response and
approved follow-up is recorded. No contact is made merely because an organisation appears in the
research register.

### 5. Campaign sequence

1. **Prepare.** Validate the public page, privacy notice, form storage and human review queue.
2. **Launch.** Publish the main LinkedIn post with the canonical signup link.
3. **Amplify.** Contact one primary trade or professional body in each context.
4. **Observe.** Review qualified registrations by context, organisation type and practical
   perspective; do not infer quality from impressions alone.
5. **Fill gaps.** Publish context-specific follow-ups and contact a secondary body only where
   coverage is weak.
6. **Close a cohort.** State a review date when one is needed, review expressions of interest and
   send onboarding only after approval.
7. **Learn.** Record which messages and referral routes produced useful, representative
   participation before the next working-group campaign.

This sequence is a campaign plan, not permission to publish a post or send an email. Each external
action still requires the user's explicit instruction at the time of execution.

### 6. Measures

The primary measures are:

- qualified expressions of interest per target context;
- representation across practitioner, professional, public-interest, data, product and
  implementation perspectives;
- number and diversity of participating organisations;
- context gaps that remain after the first wave;
- referrals attributable to trade-body and LinkedIn routes where available; and
- conversion from reviewed expression of interest to accepted participant.

Impressions, reactions and raw form volume are diagnostic only. They do not prove representation,
domain expertise or campaign success. OPDA does not use tracking pixels in the trade-body email.

### 7. Content and privacy controls

- Use plain language and describe familiar outputs such as schemas, forms and documentation.
- Do not imply W3C, government, trade-body or participant endorsement.
- Do not scrape, buy, infer or request personal contact lists.
- Collect only the fields approved by ADR-0069 and show the privacy notice at collection.
- Do not accept evidence files through the signup form or ingest recruitment data into modelling.
- Keep candidate status, human authority and the difference between signup and acceptance clear.
- Preserve keyboard access, responsive layout, no-JavaScript readability and reduced-motion
  behavior on the campaign page.

### Consequences

- Good, because recruitment is not limited to OPDA's existing followers or unavailable rosters.
- Good, because every route leads to one explanation, form and review boundary.
- Good, because trade bodies can amplify the opportunity without disclosing member data.
- Good, because context-level measures expose representation gaps before onboarding.
- Bad, because OPDA must monitor responses and representation across several channels.
- Bad, because organic distribution may be uneven and require context-specific follow-up.
- Neutral, because a large signup volume is not itself success; human review remains necessary.

### Confirmation

This ADR is accepted as the campaign operating plan. The campaign page, LinkedIn copy, outreach
register, templates and parameter set exist in the repository. No LinkedIn post or trade-body
outreach is recorded as sent by this ADR.

Before launch:

- the signup and privacy routes must be publicly reachable and the submission path validated;
- all links and context labels in the campaign assets must resolve to the canonical page;
- the five target contexts must match ADR-0063 and the public form allowlist;
- the human review owner and response process must be ready;
- the first trade-body wave must contain at most one primary organisation per context; and
- the exact LinkedIn post and outbound emails must receive explicit approval.

After each wave, the campaign register records date, route, response and coverage outcome. Changes
to target contexts, collected fields, automated onboarding or data use require an ADR amendment.

## Amendments

- **2026-08-27 — adversarial campaign review.** The sticky handoff sequence was
  disproportionate to its information and created a dead-scroll band when its visual was hidden.
  It is replaced by a compact static comparison containing every prior term, definition, domain
  scope and explanation. Registration now precedes the detailed domain comparison and supporting
  modelling narrative. The campaign scope, selectable groups, collected fields and human decision
  boundary are unchanged.

- **2026-08-16 — OPDA design-system adoption.** ADR-0073 removes parallax and
  constrains the remaining reveal feedback to the shared 120–200ms motion
  contract. Campaign content, signup behaviour and governance are unchanged.

## More Information

- [ADR-0063 — domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — AI-assisted evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [ADR-0069 — public working-group recruitment and signup](./ADR-0069-public-working-group-recruitment-and-signup.md)
- [Approved LinkedIn copy](../recruitment/2026-08-bounded-context-working-group-linkedin.md)
- [Trade and professional body outreach register](../recruitment/2026-08-bounded-context-trade-body-outreach.md)
- [Outreach parameter set](../recruitment/2026-08-bounded-context-outreach-parameters.json)
- [Trade-body outreach template, HTML](../templates/bounded-context-trade-body-outreach-email.html)
- [Trade-body outreach template, plain text](../templates/bounded-context-trade-body-outreach-email.txt)
