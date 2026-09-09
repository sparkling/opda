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

# Follow approved participation with Microsoft access and one Postmark invitation

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

On 8 September the operator explicitly requested that approved applicants receive the invitation
and Microsoft access, confirmed that **Approved approves every working group currently selected
on the contact**, and required SharePoint setup for every new approved company domain. The same
operator requires website access and existing sessions to be withdrawn when approval is withdrawn.

This extends the approval follow-up. It does not reinterpret public form submission, the frozen
historical HubSpot import, a newsletter subscription or a CRM seat as Microsoft access authority.
It concerns participation administration, not SPDTF trust-framework or standards authority.

## Decision Drivers

- Let staff make one explicit participation decision in HubSpot.
- Preserve the reviewed group selection and the distinction between requested and effective access.
- Reuse Postmark's established invitation branding and suppression handling.
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
- **Use one durable follow-up after the trusted approval (chosen).** Retain the narrow website
  approval path; prepare Microsoft access and send one verified, recipient-specific invitation.

## Decision Outcome

### 1. One human decision, distinct effects

The staff operator reviews the contact, organisation and selected groups, then sets
`opda_review_status` to `approved`. That manual action authorises ordinary participation in the
selected groups and one associated onboarding invitation under this policy. It is the explicit
send approval for this prospective flow; it does not authorise historical campaign resends.

The trusted decision records the HubSpot actor and timestamp, participant binding, immutable
decision ID and canonical selected-group snapshot. Resolve the selection as it stood at the
decision timestamp from property history; do not simply copy a later mutable CRM value.
Missing, conflicting or unsupported selection history requires Microsoft-onboarding review.
It must not invent an approved group or silently alter the website decision.

The six eligible selection IDs are:

- `finance-and-banking`;
- `conveyancing`;
- `estate-agency`;
- `surveying-and-valuation`;
- `property-data-services`; and
- `property-technology`.

Property Technology is never mapped to the cross-cutting Technology Working Group. Later edits
to requested groups cannot expand an earlier approval; staff must make a new explicit review
decision. An empty selection grants no group access and sends no working-group invitation.

The existing one-time import remains website-only. It is not a queue of 1,001 Microsoft
invitations. A new activation checkpoint limits this follow-up to new trusted decisions after
activation; any historical backfill needs a separately reviewed population and explicit authority.

### 2. Durable follow-up without delaying website access

Persist the reviewed snapshot and a follow-up record atomically with the effective approval.
The reference-only work item contains an opaque operation ID, not contact details or invitation
URLs. A separate bounded worker performs external effects; the approval webhook does not wait.

Reuse the AWS participant register, a dedicated queue and its dead-letter handling. Keep one
onboarding worker with narrow access to the required Microsoft and Postmark credentials, rather
than a general integration platform. Reconciliation repairs a committed operation whose queue
notification was interrupted. Do not replay the public-submission queue or historical wave files.

Before every grant or send, recheck the current AWS decision, identity binding and active state.
An operation for an older decision may not grant access or send an invitation. Store per-step
receipts so an interrupted run resumes from verified state, not from optimistic completion.
Partial completion is visible as pending or requiring attention; it is never reported as ready.

Website eligibility can become effective immediately through ADR-0084. Microsoft access and
email follow asynchronously. A Microsoft or Postmark outage must not undo an otherwise valid
website approval or grant access that has been withdrawn.

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
bound to its participant, so redemption URLs are not plaintext in DynamoDB or its S3 exports.

### 4. One combined Postmark invitation

Use a new versioned template alias, `working-group-approval-invitation`, with subject
**Your OPDA working-group access is ready**. Preserve the reviewed Finance invitation's visual
shell, CID logo and equivalent HTML/plain-text content. Do not overwrite either existing live
template or replace historical campaign content with a different workflow.

The combined email contains:

- the approved participant's name and the frozen group list;
- one recipient-specific Microsoft redemption link only when redemption is needed;
- verified Team links and the corresponding private source-folder links, or clear Teams-only
  guidance for a generic-provider account;
- a separate fixed first-party website sign-in link explaining the email-code login;
- the existing guidance about contributions, thread-first discussion and authorised material; and
- the support address and Postmark unsubscribe control.

Send only after every required Microsoft postcondition is verified or has a deliberate
Teams-only outcome. Do not send a success invitation while a company folder is pending.
Keep redemption URLs out of HubSpot, logs, queue messages, public documents and reusable template
source. Validate destinations against the fixed Microsoft tenant and workspace registry; names
and text are escaped, not accepted as arbitrary HTML.

Use the existing Postmark `broadcast` stream. Check its suppressions immediately before sending;
an unavailable check blocks the send. Do not remove a suppression or use a different stream to
bypass it. Set `TrackLinks: None` and `TrackOpens: false` on these messages without changing the
historical wave or server defaults. Postmark supports template models and per-message tracking
settings. [Postmark templates API](https://postmarkapp.com/developer/api/templates-api)

Deduplicate by participant, immutable approval decision and group-set digest; pin the template
version in the operation. A template edit does not trigger another invitation. Record attempted,
provider-accepted, failed or unknown delivery outcomes. If a send times out ambiguously, reconcile
provider activity before retrying; do not claim exactly-once delivery from a local flag.
Provider acceptance and an open event are not proof of inbox placement or Microsoft redemption.

ADR-0072's AI-inbox-agent disclosure applies to that agent. This deterministic approval worker
must not falsely claim an AI agent wrote or reviewed the invitation.

### 5. Withdrawal, reapproval and communication preferences

ADR-0084 immediately removes website eligibility, invalidates existing session versions and
disables Cognito access. Its open-tab check updates the visible sign-in state; it is not the
security boundary. Previously delivered information cannot be recalled.

Withdrawal also cancels unsent onboarding messages and queues removal of grants recorded as
owned by this approval workflow. Remove membership references only, never the Entra user,
organisation folder or source material. Preserve other approved participants and unrelated
manual grants; if a pre-existing grant prevents complete Microsoft removal, report that fact
for explicit review rather than claiming access has gone. Microsoft propagation is not instant.

The withdrawal path is:

1. Staff change the HubSpot review status from **Approved** to **Withdrawn**. Other loss of
   eligibility, including rejection, suspension or contact removal, follows the same deny path.
2. AWS records the new decision and access version first. Protected requests reject the former
   session immediately; Cognito is disabled and globally signed out through the existing worker.
3. The same committed decision creates an opaque withdrawal operation. Cancel unsent invitation
   work before attempting Microsoft cleanup. An email already dispatched cannot be recalled.
4. Read the participant-bound ownership receipts. Remove owned SharePoint contributor and index
   memberships first, then owned Microsoft 365 group membership references. Never delete an
   identity, company folder, source document or another participant's access.
5. Read back removal. Keep Microsoft propagation pending and retry through the existing
   15-minute outbox relay; do not exhaust short queue retries while waiting for normal Teams
   synchronisation. Ambiguous writes, manual grants and policy drift require explicit review.
6. A later, fresh human approval may restore the newly selected access. Older grant and withdrawal
   jobs cannot override it. Reuse verified identities and folders; independently re-added manual
   memberships remain manual rather than becoming workflow-owned.

Cleanup uses immutable identity and permission references, not a fresh lookup by mutable email.
Retained ownership evidence allows cleanup after the public profile is erased. Authenticated
receipt encryption remains recoverable independently of the Microsoft certificate lifetime.

Email unsubscribe does not revoke membership. Participation approval is not consent to receive
marketing campaigns. Recruitment outreach, newsletters, Cognito codes and Microsoft onboarding
remain distinct purposes with their own recipients and controls.

### Consequences

- Good, because the staff decision and its selected groups are preserved once and drive follow-up.
- Good, because new company folders and permissions are verified before an invitation promises them.
- Good, because current Postmark assets and Microsoft boundaries are reused without a new CRM.
- Bad, because external provisioning can be partially complete and needs durable retries and review.
- Bad, because unattended Microsoft access requires explicit credential and resource-permission setup.
- Neutral, because website access can be ready before Microsoft onboarding or mail delivery.

### Confirmation

The operator's policy decisions are accepted. **The new Microsoft/email follow-up is not yet
live.** Website approval and revocation are already live under ADR-0084. On 2026-09-09 the five
missing domain Teams and separate intake sites passed configuration and ACL readback under
ADR-0070. No applicants or company folders were added and no invitations were sent.

The combined HTML/plain-text templates and pure payload builder are implemented locally, with
11 tests covering all six configured workspaces, conditional redemption, URL validation and
tracking settings. Postmark's validation API accepted subject, HTML and text in six synthetic
rendering cases: mixed, all-folder and Teams-only access, each with and without redemption.
On 2026-09-09 the new live Postmark template was created and read back as template `46437816`
on server `20188829`. Its HTML/plain-text fingerprint is pinned by the service; neither earlier
template was changed and no message was sent. This is not an end-to-end onboarding test.

The dedicated Microsoft service application and certificate are provisioned. App-only reads
succeeded on all six configured sites and private Teams; the unselected cross-cutting
Technology intake returned HTTP 403. Finance's member-sharing setting was aligned with the
five new sites. No participant memberships, company folders or guest invitations were changed.
The initial certificate expires on 2027-03-07. Its temporary local private-key copy was removed
after the Secrets Manager copy was verified. No delegated refresh session was transferred.

Approval-time group snapshots, atomic reference-only outbox records, cancellation/withdrawal
work, a certificate-authenticated API boundary, encrypted receipt storage and the Microsoft,
SharePoint and Postmark adapters are implemented and tested locally. The consumer now covers
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
The invitation and general activation remain pending completion of the live test.

Before activating automatic follow-up, verify:

- all six domain workspaces and each role-limited service credential;
- snapshot reconstruction, activation cutoff, outbox atomicity and historical-import exclusion;
- duplicate/reordered events, withdrawal races and non-revival after reapproval;
- a new approved company-domain folder's isolation and a generic-provider Teams-only case;
- the two rendered email formats, suppression handling and ambiguous-send recovery; and
- a controlled, explicitly authorised end-to-end recipient test without broadcasting to old contacts.

Keep dated runtime evidence and opaque receipts in the private operational register. Amend this
confirmation after deployment and readback; accepted policy is not proof of a live integration.

## More Information

- [ADR-0065 — Finance and Banking evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [ADR-0069 — public recruitment and signup](./ADR-0069-public-working-group-recruitment-and-signup.md)
- [ADR-0070 — uniform Microsoft workspaces](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md)
- [ADR-0071 — public recruitment campaign](./ADR-0071-bounded-context-recruitment-campaign.md)
- [ADR-0072 — bounded inbox operations](./ADR-0072-scheduled-working-group-inbox-agent.md)
- [ADR-0084 — HubSpot signup and Cognito](./ADR-0084-integrate-hubspot-with-signup-and-cognito.md)
- [Historical Postmark invitation rollout](https://github.com/sparkling/opda/blob/main/docs/plan/2026-08-postmark-working-group-invitation-rollout.md)
- [Combined approval invitation, HTML source](https://github.com/sparkling/opda/blob/main/docs/templates/working-group-approval-invitation-email.html)
- [Combined approval invitation, plain-text source](https://github.com/sparkling/opda/blob/main/docs/templates/working-group-approval-invitation-email.txt)
- Pure invitation model and payload boundary: `src/approval-onboarding/invitation.mjs`.
