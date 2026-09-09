---
status: accepted
date: 2026-09-09
updated: 2026-09-09
tags: [hubspot, participants, working-groups, postmark, email, microsoft-365, teams, sharepoint, approval]
supersedes: []
amends: [ADR-0070, ADR-0071, ADR-0084]
depends-on: [ADR-0069, ADR-0072]
implements: [ADR-0070, ADR-0084]
---

# Follow each domain approval with Microsoft access and its own Postmark invitation

## Context and Problem Statement

OPDA already has recruitment and invitation decisions. They describe different activities,
not one interchangeable email campaign:

| Activity | Governing record | Purpose and current boundary |
|---|---|---|
| Finance and Banking roster invitations | Proposed ADR-0065 and the August Postmark rollout plan | Individually authorised historical waves, using each recipient's Microsoft invitation. These are not a reusable send population. |
| Public recruitment and trade-body outreach | Accepted ADR-0071 | Invite expressions of interest through `/join`; no automatic membership or marketing-list import. |
| Microsoft workspace provisioning and invitations | Accepted ADR-0070 | A private Team and separate organisation-isolated source-intake site per group; provision and verify before sending. |
| Bounded inbox assistance | Accepted ADR-0072 | Act on authorised email requests with verified postconditions and an explicit AI-inbox-agent disclosure. |
| Signup and website approval | Accepted ADR-0084 | HubSpot holds staff review decisions; AWS enforces eligibility and Cognito authenticates participants. |

The live Postmark account inspected on 8 September contains the Finance and Banking invitation
and the earlier working-group interest verification template. The verification email belongs to
the earlier pre-review flow; it is not an approval invitation. The Finance template contains
Finance-specific Microsoft links, so sending it unchanged to every group would be incorrect.

On 8 September the operator requested invitations and Microsoft access after a contact-wide
approval of its selected groups, plus SharePoint setup for every new approved company domain.
That version 1 policy was implemented and verified; its dated evidence remains below.
On 9 September the operator **replaced blanket group approval with independent approval for
each domain**, requiring one domain-customised email based on the original invitation for each
approved group. Selecting multiple groups is not approval for all of them.

This extends the approval follow-up. It does not reinterpret public form submission, the frozen
historical HubSpot import, a newsletter subscription or a CRM seat as Microsoft access authority.
It concerns participation administration, not SPDTF trust-framework or standards authority.

## Decision Drivers

- Let staff approve or withdraw each person's domains independently in HubSpot.
- Preserve reviewed scope and distinguish requested interests from effective access.
- Reuse the original invitation's layout and detailed guidance, with domain-specific content.
- Provision new organisation areas safely instead of depending on a hand-built folder list.
- Keep website access independent of Microsoft provisioning delays or email delivery.
- Use a small, durable follow-up suitable for fewer than 1,000 participants, not a new CRM.
- Make withdrawal, retries and partial completion explicit without sending duplicate invitations.

## Considered Options

- **Keep a separate manual roster and send step for every applicant.** Safe when carefully
  operated, but duplicates the decision staff have just made and leaves several lists to reconcile.
- **Use HubSpot marketing automation for everything.** The inspected Free Tools account does not
  provide the required unattended Microsoft provisioning; a marketing email is not authentication.
- **Do every external action inside the approval webhook.** Couples immediate website access to
  slow Microsoft operations, retries and ambiguous email outcomes.
- **Use one durable follow-up for each trusted domain approval (chosen).** Recompute website
  eligibility separately; prepare that domain's Microsoft access and send its own invitation.

## Decision Outcome

### 1. Independent human approval for each domain

Staff review the person, organisation relationship and requested interest, then set that
domain's review dropdown to **Approved**. This authorises only that domain and its invitation.
For example, approval for Finance and Banking does not approve Conveyancing. Two independently
approved groups produce two separate emails; pending or rejected groups receive neither grants
nor an approval invitation. The action does not authorise historical campaign resends.

The versioned schema and template contracts use these exact names:

| Domain ID | Staff-owned HubSpot property | Version 2 Postmark alias | Template ID |
|---|---|---|---|
| `finance-and-banking` | `opda_review_finance_and_banking` | `finance-and-banking-approval-invitation-v2` | `46444294` |
| `conveyancing` | `opda_review_conveyancing` | `conveyancing-approval-invitation-v2` | `46444295` |
| `estate-agency` | `opda_review_estate_agency` | `estate-agency-approval-invitation-v2` | `46444297` |
| `surveying-and-valuation` | `opda_review_surveying_and_valuation` | `surveying-and-valuation-approval-invitation-v2` | `46444274` |
| `property-data-services` | `opda_review_property_data_services` | `property-data-services-approval-invitation-v2` | `46444261` |
| `property-technology` | `opda_review_property_technology` | `property-technology-approval-invitation-v2` | `46444262` |

Each dropdown has Pending (`received`), Under review, Approved, Rejected and Withdrawn.
Clearing it also removes that domain's approval. `opda_requested_working_groups` remains
interests only. Global `opda_review_status=approved` can clear an account review hold but
does not approve any domain. Global Under review, Rejected or Withdrawn blocks account access;
the integration's initial Received marker neither approves a domain nor places a review hold.

Record the HubSpot actor/time, immutable participant binding, decision ID, **domain version**
and single-domain approved snapshot. Fetch current property history; approval requires a
matching, attributable `CRM_UI` edit after `DOMAIN_REVIEW_CUTOVER`, with that domain requested
at the decision time. Imports, forms, integrations and later interest edits cannot grant access.
Missing, contradictory or unsupported evidence fails closed for that domain. Property Technology
is never mapped to the separate cross-cutting Technology Working Group.

The 2026-09-09 read-only preflight reported eight remaining custom-property slots: overall
limit 10/usage 2, contact-property limit 1,000/usage 11, with 403 active definitions. All six
dropdowns were then created in OPDA participation and read back compatible, with no missing
fields or blockers and two slots remaining. Definition counts are not quota usage. No field
retirement, paid upgrade or runtime permission expansion was needed.

The frozen import remains an explicit website-only entitlement, not 1,001 Microsoft invitations.
Ordinary migration preserves only matching, explicitly approved pre-cutover frozen scopes
after the bound version 1 operation is explicitly complete. Never infer domains from today's
interests or replay old mail. Unresolved invitation effects must not delay access removal:

- A global/account hold disables website access immediately and retains the version 1 path
  for account-wide, receipt-owned cleanup. Preserve the original unresolved operation reference.
- A partial withdrawal may seed **denial-only** version 2 state from a valid matching frozen
  prior approved scope. Withdraw only the named domain, preserve other prior approvals, and
  invalidate further execution of the old combined job. Create no new grants or invitations.
- If that prior scope is missing or invalid, fail closed into the legacy account hold and
  owned-grant cleanup; never reconstruct approved scope from requested interests.

Keep `domainMigrationPending` until the original participant-bound outcome is explicitly
settled as complete. Missing, pending, cancelled, attention or unknown-send outcomes are not
completion. Further denials continue during this hold; new grants remain blocked. Settlement
must reconcile evidence, never resend ambiguous mail merely to complete the ledger. Global
holds revoke preserved website-only eligibility too.

### 2. Durable follow-up without delaying website access

Persist each domain's reviewed snapshot and follow-up atomically with the effective approval.
The reference-only work item contains an opaque operation ID, not contact details or invitation
URLs. A separate bounded worker performs external effects; the approval webhook does not wait.

Reuse the AWS participant register, a dedicated queue and its dead-letter handling. Keep one
onboarding worker with narrow access to the required Microsoft and Postmark credentials, rather
than a general integration platform. Reconciliation repairs a committed operation whose queue
notification was interrupted. Do not replay the public-submission queue or historical wave files.

Before every grant or send, recheck that domain's current AWS decision, identity binding and
account eligibility. Bind version 2 operations to participant, domain, immutable decision ID
and domain version, not another domain's changing state or a contact-wide invitation key.
Refreshing an unchanged approval does not resend. A later approval for a different domain
does not supersede this domain's pending invitation. Hold one participant-wide lease while
updating shared identity/ownership receipts; preserve independent per-domain operation snapshots.
Interrupted work resumes from verified receipts. Pending or review-required is never called ready.

One approved domain can enable website eligibility under ADR-0084, subject to enrolment and
account holds. Microsoft and email follow asynchronously. Their outages must not undo valid
website eligibility or grant withdrawn access. Other domain approvals remain independent.

### 3. Prepare Microsoft resources before declaring access ready

Follow ADR-0070's private Team and **separate** SharePoint source-intake pattern for every group.
Resource creation is explicit administration. Ordinary applicant approvals may provision members
and organisation areas inside a verified group workspace; they cannot invent new Teams or sites.

Silently create or reuse the correctly bound Entra guest. Use `sendInvitationMessage: false`
and keep group welcome emails disabled. Reuse accepted identities without resetting redemption.
Microsoft documents both custom delivery of the returned invitation URL and the separate guest
redemption step. [Microsoft Graph invitations](https://learn.microsoft.com/en-us/graph/api/invitation-post?view=graph-rest-1.0)

For every approved group:

1. Verify the configured private Team, standalone intake site and ownership baseline.
2. Add ordinary Team membership, never owner or administrator membership.
3. For an approved company-domain identity, idempotently create or reuse its canonical company
   group and folder in **Incoming Source Material / By Organisation**.
4. Break folder inheritance and assign only the expected company contributor group and authorised
   OPDA administrators/processors. Contributors cannot manage permissions or share material.
5. Give the participant the necessary organisation-index and matching contributor membership.
6. Read back the Team membership, folder identity and isolation before recording readiness.

New company domains are part of the same follow-up, not a later manual folder-creation task.
Domain syntax alone is not proof of company authority: the human review must approve the
organisation/domain relationship, and aliases must be explicitly recorded. Personal or generic
email providers receive Teams-only access, with no provider-wide company group or folder.
Do not change tenant-wide sharing policy, enable anonymous links or expose one company's files
to another to make provisioning succeed.

The unattended Microsoft identity must be independently provisioned and authorised. Prefer
resource-scoped grants for the configured Teams and intake sites where supported. Selected
SharePoint permissions require explicit assignment to the intended resources; consent alone
does not grant site access. Never transfer an operator's interactive refresh session into AWS
or silently substitute tenant-wide directory write authority.
[Microsoft selected permissions](https://learn.microsoft.com/en-us/graph/permissions-selected-overview)

App-only guest membership needs a deliberate implementation choice: the direct Teams add-member
API does not support adding guests with application permissions. Microsoft 365 group membership
is an alternative, but group-to-Teams synchronisation can take 24 hours or more and depends on
desktop-client activity. Keep the operation pending until actual Team membership is observed;
never promise immediate Microsoft access from the group write alone.
[Teams guest restriction](https://learn.microsoft.com/en-us/graph/api/team-post-members?view=graph-rest-1.0),
[membership synchronisation](https://learn.microsoft.com/en-us/graph/teams-create-group-and-team)

SharePoint CSOM/REST app-only operations require certificate authentication. The operator's
delegated CLI session is useful for explicit administration, but it is not an unattended service
credential. [SharePoint app-only authentication](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/security-apponly-azuread)

The dedicated `OPDA Participation Onboarding` service application uses Microsoft Graph
`User.Read.All`, `User.Invite.All`, `GroupMember.ReadWrite.All`, `TeamMember.Read.All` and
`Team.ReadBasic.All`. Its SharePoint-resource `Sites.Selected` permission has explicit
`fullcontrol` assignments on the six domain intake sites only. It has no tenant-wide
SharePoint, directory-write, user-write or Team-owner-write permission. The final two Graph
read permissions verify actual Team state rather than assuming group synchronisation.
The certificate and a separate receipt-encryption key are held in AWS Secrets Manager.
Rotate the certificate before its expiry; preserve the separate encryption key while existing
receipts require recovery. Encrypt the private receipt payload with authenticated encryption
bound to its participant, so redemption URLs are not plaintext in DynamoDB or retained recovery
copies. Follow ADR-0084's native PITR boundary; onboarding does not require a separate S3 backup
service, which the operator removed from scope on 2026-09-09.

### 4. One original-style Postmark invitation per approved domain

Use six separate version 2 aliases from section 1, with subjects **Your invitation to the
[Domain] Working Group**. Compile them from one shared original-invitation HTML/plain-text
layout and a reviewed six-domain content registry. Retain the original 680-pixel table shell,
CID logo, colours, typography, illustrated section headings and full detailed contribution,
source-material, thread-first discussion and privacy guidance. Customise the domain explanation,
relevant evidence examples and discussion topics; do not reduce them to generic group cards.

Preserve original Finance template `45998430` and historical combined version 1 template
`46437816` unchanged. The combined alias `working-group-approval-invitation` and its content
pin remain for historical evidence and reconciliation, not new version 2 invitations.

Each domain email contains:

- the participant's name, the one approved domain and its relevant contribution guidance;
- one recipient-specific Microsoft redemption link only when redemption is needed;
- that domain's verified Team link and private source-folder link, or clear Teams-only
  guidance for a generic-provider account;
- a separate fixed first-party website sign-in link explaining the email-code login;
- the existing guidance about contributions, thread-first discussion and authorised material; and
- the support address and Postmark unsubscribe control.

Send only after that domain's required Microsoft postconditions are verified or have a deliberate
Teams-only outcome; another domain can remain pending. Do not promise a pending company folder.
The original Finance channel links are retained; the other domains use their registered Team
links and explicitly labelled discussion topics, not invented channel names or unverified URLs.
Keep redemption URLs out of HubSpot, logs, queue messages, public documents and reusable template
source. Validate destinations against the fixed Microsoft tenant and workspace registry; names
and text are escaped, not accepted as arbitrary HTML.

Use the existing Postmark `broadcast` stream. Check its suppressions immediately before sending;
an unavailable check blocks the send. Do not remove a suppression or use a different stream to
bypass it. Set `TrackLinks: None` and `TrackOpens: false` on these messages. The shared server
must also have forced open tracking disabled: Postmark's server-wide `TrackOpens: true`
overrides a message's explicit false value. Read back the pinned live server and its tracking
settings before claiming a send. Keep historical wave messages' explicit `TrackOpens: true`
unchanged; they retain their existing behaviour without requiring a forced server default.
Keep the same templates, stream and suppressions rather than migrating recipients to another
server. [Postmark per-message tracking](https://postmarkapp.com/developer/user-guide/tracking-opens/tracking-opens-per-email),
[Postmark templates API](https://postmarkapp.com/developer/api/templates-api)

Deduplicate by participant, domain, immutable approval decision and domain version; pin the exact
template ID, alias, subject and HTML/text fingerprint. Require exactly one matching domain in
the payload and reconciliation metadata. A template edit does not resend. Record attempted,
provider-accepted, failed or unknown delivery outcomes. If a send times out ambiguously, reconcile
provider activity before retrying; do not claim exactly-once delivery from a local flag.
Provider acceptance and an open event are not proof of inbox placement or Microsoft redemption.

ADR-0072's AI-inbox-agent disclosure applies to that agent. This deterministic approval worker
must not falsely claim an AI agent wrote or reviewed the invitation.

### 5. Withdrawal, reapproval and communication preferences

Withdrawing a domain removes only that person's approval, owned Microsoft grants and unsent
mail for that domain. Other approved domains retain access and pending invitations. Website
eligibility and its session version remain unchanged while another approved domain or an
explicit preserved legacy website entitlement remains. Loss of the last eligible basis, or a
global hold, removes website eligibility, invalidates sessions and disables/signs out Cognito.
The open-tab check updates the UI, not the security boundary; delivered data cannot be recalled.

Withdrawal also cancels unsent onboarding messages and queues removal of grants recorded as
owned by this approval workflow. Remove membership references only, never the Entra user,
organisation folder or source material. Preserve other approved participants and unrelated
manual grants; if a pre-existing grant prevents complete Microsoft removal, report that fact
for explicit review rather than claiming access has gone. Microsoft propagation is not instant.

The withdrawal path is:

1. Staff change the relevant domain's review from **Approved** to **Withdrawn**. Pending,
   Under review, Rejected or clearing the domain field also removes that domain's approval.
2. AWS records its decision/domain version first and recomputes website eligibility. Only loss
   of website eligibility increments the session access version and disables/signs out Cognito.
   Global review holds, contact removal, erasure, expiry and independent security holds deny all.
3. The committed domain decision creates an opaque withdrawal operation. Cancel only that
   domain's unsent invitations before cleanup; dispatched email cannot be recalled.
4. Read the participant-bound ownership receipts. Remove owned SharePoint contributor and index
   memberships first, then owned Microsoft 365 group membership references. Never delete an
   identity, company folder, source document or another participant's access.
5. Read back removal. Keep Microsoft propagation pending and retry through the existing
   15-minute outbox relay; do not exhaust short queue retries while waiting for normal Teams
   synchronisation. Ambiguous writes, manual grants and policy drift require explicit review.
6. A fresh human approval for that domain after its latest withdrawal/hold may restore it and
   send its own invitation. Clearing a global hold alone restores no domains. Repeated holds
   must retain a fresh denial boundary, never let an older approval reactivate access. Stale jobs
   cannot override current decisions. Reuse verified identities/folders and retain manual grants.

Cleanup uses immutable identity and permission references, not a fresh lookup by mutable email.
Retained ownership evidence allows cleanup after the public profile is erased. Authenticated
receipt encryption remains recoverable independently of the Microsoft certificate lifetime.

Email unsubscribe does not revoke membership. Participation approval is not consent to receive
marketing campaigns. Recruitment outreach, newsletters, Cognito codes and Microsoft onboarding
remain distinct purposes with their own recipients and controls.

### Consequences

- Good, because each domain decision is attributable and drives only its own access and invitation.
- Good, because new company folders and permissions are verified before an invitation promises them.
- Good, because current Postmark assets and Microsoft boundaries are reused without a new CRM.
- Bad, because external provisioning can be partially complete and needs durable retries and review.
- Bad, because unattended Microsoft access requires explicit credential and resource-permission setup.
- Neutral, because website access can be ready before Microsoft onboarding or mail delivery.

### Confirmation

**Version 2 is accepted and implemented locally, but is not live at this amendment.**
`DOMAIN_REVIEW_CUTOVER` remains unset, the six new webhook subscriptions are not enabled,
and the domain-review policy is not deployed. All six properties were created through the
existing OPDA Chrome profile and independently read back compatible by API. All remain blank;
no participant approval was edited. The old global field description is intentionally unchanged
until cutover, so it continues to describe live version 1 behaviour.

On 2026-09-09, all six version 2 templates passed Postmark parsing/rendering validation and
were created on server `20188829`. Readback verified byte-exact HTML/text against the compiled
content pins; their IDs are listed in section 1 and pinned in `settings.mjs`. No email was
sent by this preparation, and neither original Finance nor combined version 1 content changed.
Template provisioning alone does not activate domain approval or prove end-to-end delivery.

Activation requires deploying the version 2 policy, enabling the six signed webhook subscriptions
and setting a prospective UTC `DOMAIN_REVIEW_CUTOVER`, with fresh schema and template-pin checks.
Before enabling it, reconcile historical operations; verify completed frozen-scope migration
and denial-only migration during unresolved effects, preserving explicit website entitlements
without new grants or historical resends. Unresolved legacy mail cannot postpone revocation.
Then prove separate approval, two-domain delivery, partial withdrawal, last-domain denial,
global holds and stale/replayed events. Record version 2 deployment/readback independently;
none of the historical evidence below establishes version 2 production readiness.

#### Historical version 1 rollout and live evidence, 2026-09-09

The contact-wide Microsoft/email follow-up became live on 2026-09-09, alongside website
approval and revocation under ADR-0084. The following dated evidence describes that earlier
combined-invitation policy, not the newly accepted individual-domain policy or a backfill.
During initial workspace provisioning on 2026-09-09, the five
missing domain Teams and separate intake sites passed configuration and ACL readback under
ADR-0070. That preparation added no applicants or company folders and sent no invitations.

The combined HTML/plain-text templates and pure payload builder are deployed, with
11 tests covering all six configured workspaces, conditional redemption, URL validation and
tracking settings. Postmark's validation API accepted subject, HTML and text in six synthetic
rendering cases: mixed, all-folder and Teams-only access, each with and without redemption.
On 2026-09-09 the new live Postmark template was created and read back as template `46437816`
on server `20188829`. Its HTML/plain-text fingerprint is pinned by the service; neither earlier
template was changed and no message was sent by template creation. The live recipient test is
recorded separately below.

The dedicated Microsoft service application and certificate are provisioned. App-only reads
succeeded on all six configured sites and private Teams; the unselected cross-cutting
Technology intake returned HTTP 403. Finance's member-sharing setting was aligned with the
five new sites. No participant memberships, company folders or guest invitations were changed.
The initial certificate expires on 2027-03-07. Its temporary local private-key copy was removed
after the Secrets Manager copy was verified. No delegated refresh session was transferred.

Approval-time group snapshots, atomic reference-only outbox records, cancellation/withdrawal
work, a certificate-authenticated API boundary, encrypted receipt storage and the Microsoft,
SharePoint and Postmark adapters are deployed and tested. The consumer covers
guarded provisioning, withdrawal, reapproval, erased-profile cleanup, stale jobs and ambiguous
email outcomes. Its dedicated queue and narrowly scoped role are defined in CloudFormation;
the deployment package copies only the runtime dependencies and CID logo.
The packaged runtime also passed read-only assembly against the actual service secrets:
participant-bound receipt encryption round-tripped, all six private Teams and typed membership
reads succeeded, member sharing remained disabled on each intake site, and the live Postmark
template matched its pin. No participant record, membership or invitation was changed by this check.

Automatic grants default to disabled. CI requires both `OPDA_ONBOARDING_ENABLED=true` and a
prospective UTC `OPDA_ONBOARDING_CUTOVER` in `YYYY-MM-DDTHH:mm:ssZ` form to begin new onboarding.
For controlled verification before general activation, `OPDA_ONBOARDING_CANARY_EMAIL_HASH`
may identify one explicitly authorised recipient by the lowercase SHA-256 of their normalised
email. It is empty by default and cannot bypass approval, snapshot or current-eligibility checks.
Malformed configuration fails closed. Managed withdrawal remains enabled independently of both
activation switches.

The dedicated worker and infrastructure were deployed on 2026-09-09 through successful CI runs
`34296804034` and `34296804326`. The recipient-limited verification switch was subsequently
deployed from commit `17d385f145ae1426fefd45910eb0d2c58e13e888` through infrastructure run
`34297885445`; AWS readback confirmed an active, successfully updated worker with general
onboarding disabled. Deployment is not proof of completed end-to-end onboarding.

The controlled recipient test then created two organisation areas inside the existing intake
sites, preserving ADR-0070's workspace and permission pattern. A repeated readback exposed a
verifier defect: SharePoint had added built-in Limited Access beside the parent's existing
administrator and processor roles. The verifier now accepts that navigation-only role at the
organisation index while still requiring the exact effective role, rejecting duplicates and
additional effective grants, and leaving company-folder ACL checks unchanged. No existing site
or permission was replaced to make the check pass. This follows Microsoft's documented
[automatic Limited Access behaviour](https://learn.microsoft.com/en-us/sharepoint/understanding-permission-levels).
The regression was reproduced before the fix; all 34 focused SharePoint tests then passed.
The correction was deployed from `fe54166b873259c1bec409e42efcf8ab183deb04` through
successful infrastructure run `34345211765`; the deployed verifier matched the committed bytes.
The controlled recipient subsequently completed real website login, withdrawal and reapproval.
Withdrawal invalidated the open website session, disabled Cognito and removed both workflow-owned
Microsoft memberships; reapproval restored them and reused the existing company folders. Unrelated
Finance membership and source material were preserved. One combined invitation was delivered,
but Postmark reported open tracking enabled despite the per-message false value. The documented
server override exposed a missing server-settings preflight, now covered by a reproduced regression
test. The server's forced open-tracking default was then disabled; all other server settings,
all three templates and the suppression list were unchanged. Historical wave payloads still
explicitly enable open tracking.

The tracking safeguard was deployed from `304322810fff1f0329edd2fd2222634c7cadc763` through
successful infrastructure run `34346862468` and site run `34346862604`. A fresh, trusted
reapproval restored the same two Teams and isolated organisation folders. Postmark reported
one invitation for that decision, with `TrackOpens: false`, `TrackLinks: None`, both selected
groups in HTML and plain text, and a delivered-to-recipient-server event. Provider activity
reconciliation accepted that exact message. No historical campaign was resent.

General activation completed through successful infrastructure run `34347405213`. AWS readback
confirmed an active, successfully updated worker, `ONBOARDING_ENABLED=true`, an empty canary
restriction, and deployed Postmark/SharePoint source bytes matching the tested commit. The
approval cutoff remains `2026-09-09T01:07:12Z`; the frozen historical import is excluded. The
onboarding queue and dead-letter queue were empty at verification. The test participant finishes
approved and active, with Cognito enabled and the requested Microsoft access restored.

Validation passed 672 of 673 Node tests, with one deliberate skip, the 19-case IA audit and a
2,737-page static build. Live verification covered all six service/workspace boundaries and the
authorised two-group company-domain signup, approval, login, withdrawal and reapproval case.
Teams propagation was observed before re-notifying the same durable operation during the test;
normal pending work uses the scheduled relay. Generic-provider Teams-only handling, new-guest
redemption, suppression failures, ambiguous sends and race cases have synthetic/contract coverage;
they are not represented as additional live recipient tests. Delivery evidence is not proof of
inbox placement, readership or acceptance of a previously unredeemed Microsoft invitation.

Keep dated runtime evidence and opaque receipts in the private operational register. Amend this
confirmation after version 2 deployment and readback; accepted policy is not proof it is live.

## More Information

- [ADR-0065 — Finance and Banking evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [ADR-0069 — public recruitment and signup](./ADR-0069-public-working-group-recruitment-and-signup.md)
- [ADR-0070 — uniform Microsoft workspaces](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md)
- [ADR-0071 — public recruitment campaign](./ADR-0071-bounded-context-recruitment-campaign.md)
- [ADR-0072 — bounded inbox operations](./ADR-0072-scheduled-working-group-inbox-agent.md)
- [ADR-0084 — HubSpot signup and Cognito](./ADR-0084-integrate-hubspot-with-signup-and-cognito.md)
- [Historical Postmark invitation rollout](https://github.com/sparkling/opda/blob/main/docs/plan/2026-08-postmark-working-group-invitation-rollout.md)
- [Historical combined v1 invitation, HTML](https://github.com/sparkling/opda/blob/main/docs/templates/working-group-approval-invitation-email.html)
- [Historical combined v1 invitation, plain text](https://github.com/sparkling/opda/blob/main/docs/templates/working-group-approval-invitation-email.txt)
- [Shared original-style v2 invitation, HTML](https://github.com/sparkling/opda/blob/main/docs/templates/domain-working-group-approval-invitation-email.html)
- [Shared original-style v2 invitation, plain text](https://github.com/sparkling/opda/blob/main/docs/templates/domain-working-group-approval-invitation-email.txt)
- Six-domain content/compiler: `src/approval-onboarding/domain-templates.mjs`; payload boundary: `invitation.mjs`.
- Property contract: `config/aws/hubspot-participation/properties.mjs` (`DOMAIN_REVIEW_PROPERTIES`); policy/outbox: `config/aws/hubspot-approval/domain-onboarding.mjs`.
