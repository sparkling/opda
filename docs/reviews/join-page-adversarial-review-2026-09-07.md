# Join page: goals, audience and adversarial review

Date: 7 September 2026. Review baseline: `a56502011226590e8271eeb30bdca1ac0a6ea4c9`.
Branch: `review/join-page-adversarial`. Scope: local report and recommendations only.
Source citations below refer to that baseline, not subsequent product changes.

## Executive judgement

`/join` is a recruitment and qualification journey, not an association-membership
page, a technical introduction or an automatic-access service. Its strongest features
are the practical invitation, non-technical reassurance, six understandable group
choices and explicit limits on authority and access. Preserve those foundations.

The highest-priority source-level risk is that a visitor's clock can cause success
without a stored registration. The clearest audience-facing defect is the request for
an “Organisational email address” despite a policy allowing personal-provider addresses.
Improve server-error recovery and explain conditional review/onboarding before submission.
These findings do not establish observed production losses or conversion rates.

## Governing decisions

| Decision | Status at baseline | Date / updated | Authority for this review |
|---|---|---|---|
| [ADR-0063](../adr/ADR-0063-domain-led-bounded-context-working-groups.md#L1) | accepted | 19 July / 5 September 2026 | Domain groups, practitioner ownership and bounded scopes |
| [ADR-0069](../adr/ADR-0069-public-working-group-recruitment-and-signup.md#L1) | accepted | 12 August / 3 September 2026 | Recruitment scope; form, privacy, storage and human-review boundary |
| [ADR-0071](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L1) | accepted | 14 August / 27 August 2026 | Campaign audiences, channels, promises, sequence and measures |
| [ADR-0073](../adr/ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md#L1) | implemented | 16 August / 7 September 2026 | Shared brand, controls and accessibility contract |
| [ADR-0078](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L1) | accepted | 27 August / 6 September 2026 | Canonical standalone campaign and latest narrative/composition decisions |
| [ADR-0079](../adr/ADR-0079-make-the-site-public-and-retire-the-edge-authentication-gate.md#L1) | accepted | 27 August / 1 September 2026 | Public reading and registration, independently authenticated comments |

Later explicit amendments govern conflicting older descriptions. ADR-0078 preserves
ADR-0069's service contract and ADR-0071's campaign scope while changing the public
composition ([ADR-0078:455](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L455)).
Its status remains **accepted**; this review neither promotes it to implemented nor
claims that all its confirmation conditions have been evidenced.

ADR-0065 is a supporting **proposed** workflow, not an independently accepted basis
for new recruitment obligations ([ADR-0065:1](../adr/ADR-0065-ai-assisted-evidence-to-model-workflow.md#L1)).

## Goals, audience and conversion

The page has five jobs:

1. Recruit relevant expertise beyond existing rosters through one trustworthy public route.
2. Explain how professional judgement can improve an in-development SPDTF, in familiar language.
3. Help visitors identify suitable groups and contribution types without needing data expertise.
4. Collect a short, purpose-limited expression of interest for human review and separate onboarding.
5. Support representative participation, not merely accumulate submissions or social engagement.

These goals follow [ADR-0069:77](../adr/ADR-0069-public-working-group-recruitment-and-signup.md#L77),
[ADR-0071:28](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L28) and
[ADR-0078:282](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L282).

The **five actively recruited groups** are Conveyancing, Estate Agency, Surveying
and Valuation, Property Data Services and Property Technology. **Finance and Banking
is the sixth public form option**, continuing an existing participant process; it is
not a target of this campaign. Showing all six on the page is intentional, not scope drift
([ADR-0071:52](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L52),
[ADR-0078:296](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L296)).

Primary audiences are practitioners and subject-matter experts in those domains,
including commercial operators, professional bodies, product/data specialists and
technology providers. Consumer, accessibility, regulatory and wider public-interest
perspectives also belong. Technical, ontology and AI expertise are not prerequisites
([ADR-0071:74](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L74),
[ADR-0071:106](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L106),
[ADR-0078:287](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L287)).

The roster-invited, cross-cutting **Technology Working Group is not Property Technology**.
DBT Smart Data and Interoperability are also not additional public property-domain
choices ([ADR-0071:60](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L60),
[ADR-0063:104](../adr/ADR-0063-domain-led-bounded-context-working-groups.md#L104)).

The primary conversion is an informed, relevant expression of interest that reaches
the register for review. Acceptance, membership, Microsoft access and standards rights
are separate decisions. Measure qualified expressions by target context, diversity
of organisations and perspectives, remaining coverage gaps and reviewed-to-accepted
conversion—not raw success screens ([ADR-0071:154](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L154)).

## Ranked findings and improvements

### 1. High: plausible users can receive success without a stored registration

**Source-proven conditional risk; no incidence measured.** The client records its own
`Date.now()` ([client:67](../../src/scripts/working-group-join.ts#L67)); the server subtracts
that value from its clock and requires at least three seconds
([domain:117](../../config/aws/working-group-interest/domain.mjs#L117)). A sufficiently
ahead client clock therefore produces an implausible elapsed time even after normal use.
The handler returns the ordinary `201 received` without storing in that case
([handler:120](../../config/aws/working-group-interest/index.mjs#L120)); the client then
shows success ([client:219](../../src/scripts/working-group-join.ts#L219)).

The bot-decoy response itself is deliberate ([ADR-0069:220](../adr/ADR-0069-public-working-group-recruitment-and-signup.md#L220)).
Investigate a bounded, clock-skew-tolerant implementation and regression coverage that
preserve abuse controls. Do not infer real recruitment loss or a general service outage
from this source-level scenario.

### 2. High: the email label sends a false eligibility signal

**Confirmed content/contract mismatch.** The form labels the required field
“Organisational email address” and also requires an organisation, without guidance
for independent contributors ([form:70](../../src/components/campaign/WorkingGroupInterestForm.astro#L70)).
ADR-0069 explicitly permits generic-provider addresses; only later SharePoint evidence
access has a company-domain condition ([ADR-0069:187](../adr/ADR-0069-public-working-group-recruitment-and-signup.md#L187)).
The backend does not enforce an organisational email domain
([domain:73](../../config/aws/working-group-interest/domain.mjs#L73)).

Use “Email address”. Obtain approved wording for how self-employed, independent or
unaffiliated contributors should describe their capacity. This is not evidence that
the backend rejects personal addresses. Do not silently make approved fields optional
or broaden eligibility beyond the programme owner's decision.

### 3. Medium: server validation cannot tell the visitor what to correct

**Confirmed error-path gap.** The API returns structured field errors for validation
failures ([handler:117](../../config/aws/working-group-interest/index.mjs#L117)), including
a reload instruction for a stale privacy-notice version
([domain:92](../../config/aws/working-group-interest/domain.mjs#L92)). The client throws
for every non-201 response before reading that JSON and presents generic retry text
([client:219](../../src/scripts/working-group-join.ts#L219),
[client:229](../../src/scripts/working-group-join.ts#L229)).
The checked-in privacy versions match: a stale version is a future/cache-skew recovery
scenario, not a current version-mismatch incident.

Add a safe, allowlisted mapping of server validation errors to controls and the summary;
distinguish stale-version recovery from retryable transport/service failure. Keep exact
success validation, timeout handling and entered values. No failed submission was made
as part of this review.

### 4. Medium: explain the full next-step sequence before asking for submission

**Confirmed information-placement gap.** The form mentions review/administration near
the top and “not automatic membership or access” in its acknowledgement. The complete
review → conditional contact → separate onboarding explanation is in the initially
hidden success section ([form:20](../../src/components/campaign/WorkingGroupInterestForm.astro#L20),
[form:137](../../src/components/campaign/WorkingGroupInterestForm.astro#L137),
[form:153](../../src/components/campaign/WorkingGroupInterestForm.astro#L153)). ADR-0069
expects the page to explain this sequence ([ADR-0069:159](../adr/ADR-0069-public-working-group-recruitment-and-signup.md#L159)).

Put a concise next-step sentence beside the form before submission, retaining the
conditional outcome. Do not invent response deadlines, guaranteed acceptance or access.
The existing fragments mean this is not a claim that human review is entirely undisclosed.

### 5. Medium: test practical understanding and commitment, not only persuasion

**Usability hypothesis and owner question.** The programme's full name is already
visible through [CampaignIdentity:41](../../src/components/campaign/CampaignIdentity.astro#L41)
and [FrameworkHeading:16](../../src/components/FrameworkHeading.astro#L16). The issue is
whether a first-time visitor understands the specific practical work behind the broad
invitation ([page:84](../../src/pages/join/index.astro#L84)). Participation cards explain
definitions, review and testing, but the page supplies no meeting cadence or expected
effort; “two or three minutes” describes registration only
([data:39](../../src/data/working-group-campaign.ts#L39),
[form:17](../../src/components/campaign/WorkingGroupInterestForm.astro#L17)).

The five grids contain 21 cards: four motives, three policy points, six groups, four
participation steps and four evidence points. Six contribution entries follow and also
appear in the form ([data:26](../../src/data/working-group-campaign.ts#L26),
[data:110](../../src/data/working-group-campaign.ts#L110),
[form:105](../../src/components/campaign/WorkingGroupInterestForm.astro#L105)). Real practice,
commercial impact, public interest and usefulness recur. Repetition may help scanning;
neither its harm nor a conversion benefit from shortening is measured. Give each section
a distinct question and test mobile skimming while preserving seven chapters and the final form.

Consider one concrete, authorised example of a participant contribution and its useful
output. Confirm any effort, format or timing statement with the operating owner; where
not agreed, say what will be arranged after review. Do not restore an ontology lesson or
the expressly removed “Before you commit” container
([ADR-0078:170](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L170)).

### 6. Medium: make the working-group card action predictable

**Discoverability hypothesis, not an accessibility failure finding.** Each card has a
native link with a visually hidden accessible name; activating it selects a checkbox and
follows `#register` ([grid:34](../../src/components/campaign/CampaignCardGrid.astro#L34),
[campaign script:6](../../src/scripts/working-group-campaign.ts#L6)). The visible introduction
does not explain this preselection-and-jump behaviour ([page:163](../../src/pages/join/index.astro#L163)).

Consider an instruction above the grid: choosing a card selects that group in the form;
nothing is submitted until registration. Verify comprehension with representative users.
Do not re-add the visible card action labels explicitly removed by the 6 September
amendment ([ADR-0078:112](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L112)).

### 7. Low: reconcile contradictory active ADR clauses

**Confirmed documentation drift, not an instruction to revert current UI.**

- ADR-0071 still describes five chapters, contextual lenses and the evidence-to-candidate
  loop ([ADR-0071:90](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L90)), whereas
  ADR-0078 specifies seven SME-first chapters and ordinary group cards
  ([ADR-0078:282](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L282)).
- ADR-0069 says all three public-service pages omit the Knowledge Base header
  ([ADR-0069:154](../adr/ADR-0069-public-working-group-recruitment-and-signup.md#L154));
  ADR-0078's confirmation list repeats this
  ([ADR-0078:434](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L434)).
  Its 2 September amendment and current decision explicitly put privacy/accessibility in
  the global-header Layout ([ADR-0078:204](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L204),
  [ADR-0078:248](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L248)).

Update active descriptions and confirmation criteria to reflect the later amendments,
preserving historical notes. Do not change decision statuses or reinstate superseded UI.

## Operating questions and decisions to preserve

ADR-0071 requires a ready review owner and response process before campaign launch
([ADR-0071:196](../adr/ADR-0071-bounded-context-recruitment-campaign.md#L196)). This source
review does not establish that those arrangements exist or are absent. Confirm them.
ADR-0069 records a buffered integration queue with no downstream email consumer
([ADR-0069:13](../adr/ADR-0069-public-working-group-recruitment-and-signup.md#L13)). Automatic
confirmation email is not a promised feature. Any receipt/timing explanation should
match the current operating process, not create an unapproved email system or SLA.

Preserve the six choices, separate commercial/public-interest options, mandatory group
selection, approved fields, privacy purpose and human-review boundary. Preserve the
standalone campaign, bottom form, safe email alternative, normal scrolling and bounded AI
reference. The full name is present; no redesign is needed to “restore” it. Illustrations,
mode-aware surfaces, two expanded group paragraphs, hidden whole-card links and removal
of the standalone status callout are explicit recent decisions, not accidental drift
([ADR-0078:103](../adr/ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md#L103)).

Policy wording keeps property-specific arrangements prospective
([page:142](../../src/pages/join/index.astro#L142)); participation expressly confers no
standards authority, membership, access or vote ([page:234](../../src/pages/join/index.astro#L234)).
No finding asserts government endorsement, proven conversion loss or verified WCAG failure.

## Review method and recommended order

Two native Astra Max reviewers independently examined ADR/source and audience/UX concerns,
then cross-critiqued findings with a coordinating integration owner. They were registered
in Ruflo swarm `swarm-1788796249080-tnbd7g`; the ledger did not itself execute the reviews.
The ADR-review skill informed amendment precedence and the distinction between contract
drift and discretionary design suggestions. No vote counts or consensus scores are claimed.

Evidence is repository source at the stated baseline, not screenshots, production-form
submissions, measured performance, user research or a fresh accessibility certification.
The report changes no page, API, ADR, navigation or publication. No tests were run for it.

Prioritise success integrity and eligibility wording, then error recovery and pre-submit
expectations. Confirm operating commitments before adding promises. Validate card comprehension
and practical understanding before editorial restructuring; reconcile ADR contradictions
without undoing the latest authorised design. All implementation and publication remain
separate decisions.
