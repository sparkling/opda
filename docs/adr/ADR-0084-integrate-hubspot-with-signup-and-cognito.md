---
status: accepted
date: 2026-09-08
updated: 2026-09-09
tags: [aws, hubspot, cognito, identity, participants, recruitment, crm, privacy, proportionality]
supersedes: []
amends: [ADR-0038, ADR-0069, ADR-0079]
depends-on: [ADR-0040, ADR-0070, ADR-0083]
implements: []
---

# Integrate HubSpot with working-group signup and Cognito authentication
## Context and Problem Statement

OPDA needs a CRM for roughly 1,000 participants, retaining join data, human approval, completed enrolment
and active/inactive state. Participants need website accounts, not CRM seats. The existing HubSpot account
replaces ADR-0084's **uncommitted bespoke-CRM draft**, not an accepted decision or deployed service.

Anonymous `/join` submissions already use encrypted, on-demand DynamoDB in `eu-west-2`,
followed by reference-only DynamoDB Streams/SNS/SQS events. The public handler creates no accounts.
Website sessions and Artalk SSO initially used **Auth0** with a commenter email allowlist;
adopting Cognito is an authentication migration, not configuring an existing connector.

The 2026-09-08 inspection found Free Tools, five of five Core seats allocated and 1,001 contacts.
API inventory found `linkedin_account`, `membership_type` and `relationship_type`.
Property quotas are a live preflight, not inferred from the plan name or definition count;
the 2026-09-09 capacity readback for the per-domain amendment is recorded below.

This governs website access, not SPDTF trust or standards authority; ADR-0085 governs Microsoft/email follow-up.
On 2026-09-08 the operator authorised implementation, live website sign-in, and a
one-time approval of existing HubSpot contacts. Brief cutover downtime is acceptable.
The frozen migration includes contacts created by 18:26:22 UTC that day; it does
not automatically approve future contacts, establish marketing consent or grant
website administration. All 1,001 current contacts passed the primary-email preflight.

The operator subsequently requested approval directly in HubSpot. This amendment
replaces the proposed bespoke ordinary-participant action page with manual CRM
review decisions, authenticated webhooks and AWS enforcement. It does not grant CRM
editors website administration or make anonymous CRM writes trusted approvals.
On 2026-09-09 the operator replaced blanket group approval with **independent approval
for each domain**, and one original-style invitation per approved domain under ADR-0085.

## Decision Drivers

Reuse the CRM; require approval and verified identity; keep public reading and signup independent;
preserve collection evidence without inventing consent; avoid paid tiers and disproportionate costs.

## Considered Options

- **HubSpot memberships as website authentication.** Appropriate for eligible
  HubSpot-hosted private content, not the existing public Astro/AWS site.
- **Cognito with HubSpot as a live login-status lookup.** Avoids a local access
  register, but couples sign-in to CRM availability, editable fields and API limits.
- **HubSpot and an AWS register with existing Auth0.** A viable lower-migration
  option. Cognito is selected to meet the requested AWS identity direction, not
  because HubSpot requires it. A clean cutover is preferred to parallel providers.
- **HubSpot CRM plus an AWS eligibility register and Cognito (chosen).** Reuses CRM screens with a small, enforceable website access boundary.
- **Custom AWS CRM plus Cognito.** Possible, but duplicates contact management, notes, tasks, searching and filtering already available in HubSpot.

## Decision Outcome

Use **HubSpot for CRM, Cognito for authentication, and DynamoDB for website eligibility**.
Implement narrow signup and approval bridges, not a custom CRM or ordinary-approval page.
HubSpot is not called during participant login or protected requests. Its outage must not break
the public site or revoke eligible access merely because CRM synchronisation is late.

### 1. What integrating authentication with HubSpot actually means

| Integration | What it authenticates | OPDA decision |
|---|---|---|
| HubSpot app authentication | A server integration accessing the HubSpot API | Required for the CRM bridge, not participant login. |
| HubSpot staff sign-in or SSO | Staff using the HubSpot product | Keep separate; a HubSpot seat or Super Admin status grants no website administration rights. |
| HubSpot content memberships | Visitors accessing eligible HubSpot-hosted private content | Not adopted; no website migration or paid membership feature is needed. |
| Cognito OIDC sign-in | A person's identity presented to the OPDA website | Adopt, with separate server-side eligibility checks. |

HubSpot documents static app authentication for one authorised account and OAuth
for multi-account integrations. Its OAuth installation flow authorises CRM API
access; it is not a general participant identity-provider flow. HubSpot also
offers content memberships on qualifying Content/Service Professional or
Enterprise subscriptions. **Our architectural conclusion** is to integrate
contact and lifecycle data, not replace Cognito with HubSpot authentication.
[HubSpot app authentication](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/overview),
[HubSpot memberships](https://knowledge.hubspot.com/website-pages/require-member-registration-to-access-private-content)

### 2. Four responsibilities, with explicit field ownership

| System | Owns | Does not own |
|---|---|---|
| Existing AWS intake table | Validated original submissions, collection evidence and initial retention | Credentials, approvals or grants from anonymous input |
| HubSpot Contacts | Staff-maintained contact details, requested participation, contribution preferences, manual ordinary-participant review decisions and CRM notes/tasks | Verified login identity, administrative grants or effective AWS access state |
| New AWS participant register | Stable participant ID, application links, trusted decisions, approved groups, enrolment, active flag, identity binding, grants, audit and sync operations | Passwords, a second editable CRM directory, or a property-data model |
| Cognito user pool | Credentials, verified identity attributes, MFA and authentication | Application evidence, CRM notes or approval inferred from an email address |

The AWS register holds a labelled last-observed CRM profile/revision for recovery, not
bidirectional ownership. Decisions reference application evidence that CRM edits cannot rewrite.

Use immutable random participant IDs, separate registration IDs and a verified `issuer + sub`
binding. Store the HubSpot portal/contact mapping in AWS; neither email nor a CRM field is a security
identifier. Reserve canonical email/subject bindings with conditional transactions at trusted
review/enrolment. An eventually consistent search index is not a uniqueness check.
[DynamoDB transactions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html)

### 3. Join fields and the minimal HubSpot property set

Keep the current form and existing eight OPDA fields; add six independent domain-review
dropdowns in the **OPDA participation** group, as listed in ADR-0085. Reuse verified standard
properties. An initially created contact is an unverified applicant, not an approved member.

| Join input / record | HubSpot destination | Type and ownership |
|---|---|---|
| `fullName` | Existing `opda_full_name` | `string` / `text`; preserve the complete name without guessing a first/last-name split. Staff may maintain it after review. |
| `email` | Existing `email` | Contact address; changes are not changes to the verified Cognito binding. |
| `organisation` | Existing `company` | Contact-level company name; do not create/merge Company records by name alone. |
| `role` | Existing `opda_role_or_expertise` | `string` / `text`; broader than Job title, preserving the form's professional-role/expertise meaning; never an application permission. |
| `workingGroups` | `opda_requested_working_groups` | `enumeration` / `checkbox`; requested interests only. Each domain needs its own trusted approval under ADR-0085; this field never grants access. |
| `contributions` | Existing `opda_contribution_preferences` | `enumeration` / `checkbox`; all six current choices. |
| `relevantPerspective` | Existing `opda_relevant_perspective` | `string` / `textarea`; retain the 600-character limit and existing privacy warning. |
| Account-wide review | `opda_review_status` | `enumeration` / `select`; `received`, `under_review`, `approved`, `rejected`, `withdrawn`. Approved can clear a review hold but never approves domains; Under review, Rejected and Withdrawn block account access. |
| Individual domain review | Six configured `opda_review_*` fields in ADR-0085 | `enumeration` / `select`; Pending (`received`), Under review, Approved, Rejected, Withdrawn. Once v2 is activated, a trusted manual approval grants only that domain; clearing it removes that domain's approval. |
| Account setup | Existing `opda_enrolment_status` | `enumeration` / `select`; AWS-owned snapshot: `not_invited`, `invited`, `complete`, `expired`. |
| Enabled flag | Existing `opda_active` | `bool` / `booleancheckbox`; AWS-owned snapshot; pending applicants are disabled, the approved migration is enabled but unenrolled. Not sufficient for login by itself. |
| `acknowledgement`, `privacyNoticeVersion` | Restricted AWS collection evidence | Keep the boolean and exact notice version with server receipt time; not a HubSpot marketing subscription. |
| `website`, `startedAt` | **Do not synchronise or retain** | Honeypot and transient client timer, not a company website or application timestamp. |

HubSpot's default contact properties distinguish company-name text from associated
Company records. Its properties API supports the listed types and multi-choice
values. Put the full-name field prominently in the CRM view beside the contact
link; do not misuse First name to improve display. Keep existing first/last names.
Pin/test the adapter API version and verify each portal's default metadata.
[Default contact properties](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties),
[Properties API](https://developers.hubspot.com/docs/api-reference/latest/crm/properties/guide)

Preserve `linkedin_account`, `membership_type` (Associate, Founding Member) and `relationship_type`
(Member, Partner, Stakeholder, Journalist, Other). Do not repurpose these, the
sales Lifecycle stage, Lead status, email subscription status or Contact owner
as approval or website access. Do not classify every applicant as an OPDA member.

Use the stable values from `working-group-interest/domain.mjs`:

| Field | Independent allowed choices |
|---|---|
| `workingGroups` | `finance-and-banking`, `conveyancing`, `estate-agency`, `surveying-and-valuation`, `property-data-services`, `property-technology` |
| `contributions` | `share-source-material`, `explain-domain-language-and-rules`, `review-model-candidates`, `test-schemas-and-integrations`, `represent-commercial-interests`, `represent-public-interests` |

Preserve labels and IDs in a versioned option manifest. Encode multi-select
sets as semicolon-separated values with deterministic ordering; replace the
reviewed set deliberately, rather than accidentally appending stale choices.
Unknown values must fail validation and become a review issue, not disappear.

AWS retains the participant/contact mapping without another custom property or a credential
in a CRM link. It also retains source registration IDs, form/option-set version, per-domain
decision IDs/versions, actors, reasons and invitation/completion receipts; approved domain IDs;
suspension and verified email/subject evidence; `accessVersion`, retention deadlines and sync
errors. Domain decisions and privileged grants are separate. The six staff-review properties
are not editable mirrors of effective AWS grants; active/enrolment remain AWS-owned projections.

Legacy records already contain trimmed/lowercased email and trimmed text, not
the raw input bytes. `createdAt` is epoch milliseconds and `expiresAt` seconds.
They lack a separate form/option-set version and exact checkbox-click time.
Preserve what exists; record unknown historic values rather than invent them.

The eight initial fields were created and read back on 2026-09-08. On 2026-09-09 a fresh
read-only preflight found 403 active definitions: overall custom-property limit 10, usage 2;
contact-property limit 1,000, usage 11; conservative remaining slots **8**. All six domain
dropdowns were then created in OPDA participation and read back compatible; two slots remain.
Definition counts are not quota usage or contact limits; no retirement or upgrade was needed.
Recheck before further additions. [Limits API](https://developers.hubspot.com/docs/api-reference/legacy/crm/limits-tracking/guide)

### 4. Reliable signup synchronisation without changing the receipt contract

1. The existing public Lambda validates and stores the application in AWS. It
   returns the existing generic `received` receipt after persistence, including
   the existing honeypot decoy. HubSpot availability is not in this request path.
2. Subscribe one **dedicated filtered SQS queue** to the existing SNS topic for
   `working-group-interest.received.v1`, with a bounded retry/dead-letter path.
   Leave the existing shared integration queue and newsletter events untouched;
   do not make unrelated consumers compete for messages from the same queue.
3. A small Lambda reads the referenced application, checks retention/deletion
   state and records a durable idempotent sync operation. It creates the initial
   applicant contact or flags a potential existing-contact match for review.
4. For an existing contact, maintain one open review task per normalised email;
   do not overwrite its name, email, preferences, status, identity or permissions
   from anonymous input. Human resolution may associate the application and
   adopt selected profile values. Repeats remain AWS evidence under that task,
   not additional CRM objects. Permit at most one automatic CRM creation/task
   per email in 24 hours and 100 new contacts/day. Excess stays in the AWS review
   backlog; operators may adjust the limit without losing intake or auto-approving.
5. Staff approve each requested domain independently in HubSpot. The separate approval
   worker atomically records its scope, actor, domain version and follow-up, recomputes
   website eligibility, then projects active/enrolment. External effects have durable
   retry state; no database-plus-API dual write is represented as one transaction.

An automatically allocated pending participant reference identifies a record, not a proven person.
It cannot activate anything. Resolve duplicates and reserve canonical AWS identity keys before approval.

Deduplicate incoming events and source registrations, and bound concurrent
operations per participant/contact. Use stable operation IDs and conditional
versions. An ambiguous contact-create timeout must reconcile before retrying
creation. An email match, contact merge or copied access-page link must not
merge website identities. Pause ambiguous mappings for human resolution; no
automatic alias transfer, identity re-binding or invitation resend.

Run approval/profile reconciliation every 15 minutes as recovery for missed webhooks.
Event-driven changes normally arrive sooner; latency is not guaranteed during an
outage. The separate daily intake completeness/retention sweep remains a delivery item.
Alert on dead letters, credential/configuration failures and work pending over a day.
Respect `429` and `Retry-After`, back off with jitter, and retain failed work for
safe replay. Expired/erased records must not be recreated by replay or backfill.

Use per-field ownership, not timestamp-based last-write-wins. Never project AWS
snapshots over staff-owned profiles or review decisions. Only active/enrolment are
AWS-owned status mirrors; editing those mirrors does not change access.

### 5. Human approval in HubSpot, with event-driven AWS enforcement

Staff use the **individual domain's review dropdown → Approved** after reviewing that
requested interest. One approved domain enables ordinary email-code sign-in; another domain
is not implied. Global Approved alone grants none. A domain withdrawal leaves other approved
domains intact; loss of the last domain removes website access. Historical website-only
import approval is no exception to this rule. Global holds override domain approvals. Initial integration-owned
Received is neither approval nor a hold. Enrolment still requires mailbox proof at sign-in.

The existing legacy private app supports property-change webhooks. Configure its
HTTPS target and subscriptions in HubSpot's private-app UI, not the public-app API.
Watch all six domain-review properties, global review, email, deletion/privacy deletion, merge and restore events.
The receiver prefers v3 HMAC over the pinned HTTPS URL, method, raw body and fresh
timestamp; an invalid v3 never falls back to v1. Legacy-only v1 remains supported.
It pins portal/app IDs and durably enqueues bounded contact-ID hints before replying.
It has no participant-table or Cognito permissions. The signing secret is separate
from the contact API token in Secrets Manager. No secrets or contact values enter queue payloads or logs.
[Private-app webhooks](https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview), [Signature validation](https://developers.hubspot.com/docs/apps/legacy-apps/authentication/validating-requests)

The signature authenticates the app, not the approver. A separate worker fetches
the current contact and review/email/requested-interest histories. Domain approval requires a
current `CRM_UI` review entry with HubSpot-recorded user ID and matching current
value after `DOMAIN_REVIEW_CUTOVER`. Imports, forms, workflows, integrations and a
user-entered approver name cannot approve. The contact's email must predate its
first approval. Invalid or contradictory recent review history cannot grant access.
[Property history](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/guide),
[Change sources](https://knowledge.hubspot.com/properties/hubspots-change-sources)

Trust authorised HubSpot contact editors for **ordinary** participant approval, using named staff
accounts and MFA for attribution. HubSpot property restrictions alone are not a security boundary.
Administrative grants and identity correction remain separate, audited AWS operations under operator
authority and step-up; CRM never grants them.
[Property-access limitations](https://knowledge.hubspot.com/properties/restrict-view-edit-access-for-properties)

Delivery can be duplicate, delayed or out of order; legacy v1 has no timestamp
protection. Treat every event, including timestamp-checked v3, as a fresh-read hint, not a
command. Conditional decision versions and an atomic audit prevent old approvals
from restoring withdrawn access. One worker serialises provider effects, SQS retries
failures, and 15-minute complete-inventory reconciliation repairs missed events.
[Webhook delivery semantics](https://developers.hubspot.com/docs/api-reference/legacy/webhooks/guide)

Never adopt an existing Cognito account by matching email. Reserve the immutable
participant/contact/email binding before suppressed provisioning, create its AWS
record inactive, reread the CRM decision, then activate transactionally. Check
source expiry/deletion and suppressions before initial activation. Contact deletion
or identity ambiguity suspends an existing mapping; restores and merges cannot
transfer identity or replay an old approval. Independent AWS security suspensions,
erasure and expiry cannot be cleared by CRM approval. Retain frozen import evidence, but require
an actual approved domain for CRM-managed website access; never invent grants or invitations. ADR-0085
permits denial-only migration from matched prior approved scopes while legacy effects remain
unresolved: withdrawals continue, new grants await explicit completion, and no mail is replayed.
The six non-CRM legacy approvals are not revoked merely because they are absent from HubSpot.

### 6. Cognito enrolment, eligibility and revocation

The server-side eligibility predicate is:

`approvedDomain AND enrolmentComplete AND active AND NOT suspended AND verifiedBoundIdentity`

| Stage | Website access |
|---|---|
| No approved domain | Public pages only; no Cognito account created by submission. |
| Eligible, not enrolled | User-requested email code and restricted account setup only. |
| Enrolled and active | Permitted member actions, subject to current grants. |
| Last domain withdrawn, global hold, expired or inactive | No member actions, including with an old session. |

Disable Cognito self-service signup. Provision approved contacts using
`AdminCreateUser` + `SUPPRESS`, without a temporary password or `email_verified`.
Use Essentials managed login with email one-time passwords. Cognito also requires
`PASSWORD` in the allowed factors, but imported users receive no password. The client
must list required `email` as writable; the pool keeps it immutable after creation.
There is no bulk invitation wave: each person requests a code when signing in.
The successful code verifies ownership; staff approval is not email verification.
An immutable import participant identifier prevents a retry adopting somebody
else's existing Cognito account. Never force-transfer aliases or silently rebind
changed CRM addresses. Retain source snapshot, operator decision and import results
in private versioned S3. A durable DynamoDB marker pins the exact object version
and byte digest; missing evidence fails closed and cannot recapture a later list.
Migration evidence remains outside the legacy recovery copies' 35-day lifecycle. Conditional email
claims and subject writes make retries resumable.
[AdminCreateUser](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html)

Complete ordinary participant onboarding at the first verified email-code callback,
using a transaction that rechecks approval, active state, identity binding and
absence of suspension, records mailbox proof and completes enrolment. The approved
migration starts enabled but unenrolled; login never changes the active flag.
No extra agreement, group membership or marketing consent is inferred. Suspension
has its own actor/time/reason; clearing it requires an authorised decision and
never bypasses incomplete enrolment. Inactive users cannot complete enrolment.
[Email-code ownership verification](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html)

Do not rely on Cognito post-confirmation to enrol admin-created accounts, or on
pre-authentication as the only access check: the former does not cover this
account-creation path and the latter does not run on session renewal.
[Post-confirmation trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-confirmation.html),
[Pre-authentication trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-authentication.html)

Use one public Cognito Essentials client and managed login with Authorization
Code + PKCE, state and nonce checks; no client secret is needed. Keep tokens server-side; issue an opaque `Secure`,
`HttpOnly`, `SameSite=Lax`, `__Host-` session cookie. Verify token signature,
issuer, client/audience, token use and expiry. Use a separate short-lived DynamoDB
session table; rotate sessions on login/completion and enforce expiry in code.
Never expose provider tokens through `/_auth/me`. Allow only local return paths.

Every protected action checks the current participant/grant record with a strong
read and compares the session access version. Deny missing, unreadable,
inconsistent or expired state. A domain-local change preserves other domain approvals and
does not churn their sessions. When website eligibility is lost, commit `active=false`
and increment the version before confirming suspension; then disable Cognito, globally sign out and
invalidate sessions with durable retries. A Cognito failure does not restore
access. Reactivation cannot revive old sessions. Visible signed-in tabs recheck every 15 seconds
and on return to the page; this updates the UI, not the security boundary. Delivered data cannot be recalled.

AWS documents that ordinary signature/expiry JWT validation can accept revoked
tokens. API Gateway JWT checks, stale Cognito groups and CRM polling therefore
cannot replace the live eligibility check.
[Cognito token revocation](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html)

### 7. Integration credentials and least privilege

Use single-account private apps with static auth, held in AWS Secrets Manager.
After exporting its logs on 2026-09-08, the temporary schema app was deleted and
token revocation verified. Its secret has a seven-day recovery window. The bridge
and all eight properties remain verified. CLI personal keys and MCP are developer
tooling, **not** production credentials; no Marketplace distribution is needed.

Keep app tokens in AWS Secrets Manager, separate from Cognito/client secrets,
with explicit creation approval, rotation and revoke/recovery instructions. No
secrets in static JS, builds, Git, queues, prompts or logs. Start with contact
read/write and schema-read scopes; verify the minimum endpoint scopes for the
small OPDA note/task operations. Property creation uses a separate one-time
bootstrap credential with schema-write permission, not permanent runtime rights.
No marketing-send, website-publish, broad export or unrelated-object permissions.
The bootstrap reads quota through the bridge without adding contact access to the schema token.
Verify portal/app IDs and exact scopes, including implicit `oauth`, before each operation.

The public form role remains write-only to intake. The CRM bridge can read in-scope applications
and synchronise profiles but cannot approve, activate, change grants or administer Cognito.
Only the isolated approval service changes eligibility and provisions identities.
Separate eligibility/audit from projection/sync keys and enforce the write prohibition in IAM.
The bridge never writes either existing membership/relationship property.
Restrict the token to the expected portal, while recognising contact
API scopes are not record-level isolation: the adapter must enforce the mapped
OPDA subset and protect the token as a portal-wide contact-data capability.

### 8. Privacy and native data recovery

Before live transfer, update and version the join privacy notice for HubSpot as
a processor, confirm the account's hosting/transfer terms and review integrations,
AI/enrichment and access/export settings. Keep old notices with old submissions;
confirm a lawful basis for importing existing applicants rather than fabricating
new acknowledgement. Registration is not marketing consent. Preserve existing
opt-outs/subscriptions; do not enrol applicants into campaigns. Where supported,
new OPDA contacts are non-marketing. Do not change unrelated CRM contacts.
[HubSpot processing terms](https://legal.hubspot.com/dpa),
[Hosting and transfers](https://knowledge.hubspot.com/account-security/hubspot-cloud-infrastructure-and-data-hosting-frequently-asked-questions)

Apply ADR-0069 retention across AWS and the OPDA CRM projection: unprogressed,
rejected or withdrawn interest up to six months; accepted administration for the
group's duration plus 12 months unless a documented obligation applies. Update
accepted-record expiry before activation. Enforce expiry in reads/jobs; DynamoDB
TTL is asynchronous. For a shared contact with another legitimate OPDA purpose,
remove participation fields/notes when due rather than deleting unrelated data.
The daily sweep uses AWS retention deadlines and durable suppression records to
drive CRM removal; the existing publisher intentionally ignores TTL removals.
Domain withdrawal is scoped; last-domain loss or global denial is reconciled into AWS suspension. Revocation is
effective after AWS commits it, not synchronously with the CRM click; API outages
can delay this. Urgent security suspension uses the independent AWS access boundary.

Keep native DynamoDB PITR at seven days for intake and 35 days for the participant table.
Do not run scheduled table exports or scoped HubSpot snapshots to S3. Retire the dedicated
backup Lambda, its role, daily export and hourly verification schedules, alarms and runtime.
There is no application-managed CRM backup or combined AWS/CRM recovery-point commitment.
HubSpot-only profile changes are not protected by DynamoDB PITR. This deliberately removes
the maintenance burden of a separate backup service for this low-traffic integration.

Preserve the existing private, encrypted, versioned S3 bucket and its access policy: it also
holds the frozen, version-pinned migration evidence required by section 6. Removing the
backup feature does not delete existing objects or change retention. Historical `recovery/`
objects retain their 35-day lifecycle; `migration/` evidence is outside that lifecycle.
Keeping this evidence is not an active S3 backup service or a new export schedule.

Any native restore is an explicit operator action into quarantine. Apply subsequent erasures,
withdrawals and suspensions, reconcile identity bindings and require fresh sessions before
returning restored records to use. Uncertain access stays inactive; a restore must not
resurrect removed participation data. Keep the required deletion/suppression evidence through
the applicable recovery and residual-retention windows, then expire it too.

DynamoDB recovery does not restore Cognito credentials or recreate original subjects. Pool
loss requires fresh credential/MFA enrolment and reviewed identity bindings; never
bulk-reactivate restored users or administrative grants.
[Cognito profile-export limitations](https://docs.aws.amazon.com/solutions/latest/cognito-user-profiles-export-reference-architecture/guidance-components.html)

### 9. Cost, delivery and acceptance boundary

Use regional serverless participant/session stores, isolated signup/approval consumers
and scheduled maintenance. No custom CRM, SQL, VPC/NAT, Redis or workflow engine.

Free/Starter private apps allow 100 requests per ten seconds per app and 250,000
per account daily. Stay below these and stricter endpoint limits; no paid workflow tier is needed.
[HubSpot API limits](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines)

For roughly 1,000 direct Cognito MAUs, Essentials' published 10,000-MAU
direct/social allowance is relevant; federation terms differ. Price Secrets
Manager, logging, native PITR, encryption, email and alarms in London before
deployment. Target low tens of US dollars/month incremental, not a quote. Verify
all editing-seat and renewal costs before a HubSpot upgrade.
[Cognito pricing](https://aws.amazon.com/cognito/pricing/)

Live inspection found SES in its sandbox with no verified sender. Cognito's default
delivery is independent of that sandbox but limited to 50 messages daily; never
describe it as unlimited or ready for a simultaneous 1,001-person launch. Higher
volume requires verified SES production delivery. Test real code delivery before cutover.
[Cognito email quotas](https://docs.aws.amazon.com/cognito/latest/developerguide/quotas.html)

Deliver in independent, verified slices:

1. Confirm legacy CRM capacities, all existing property definitions, named
   administrators, privacy/retention wording and scoped app access. Provision
   fields idempotently, rejecting incompatible existing definitions/options.
2. Implement receipt-preserving AWS-to-HubSpot sync with synthetic data first;
   reconcile new applications without automatic approval. The explicitly approved
   existing-contact snapshot is the bounded exception, not a standing CRM rule.
3. Add the AWS register and signed approval webhooks; prove manual approval,
   email verification, enrolment, suspension and safe retries.
4. Migrate sessions and **Artalk** together: proxy authenticated comment actions
   through the OPDA session backend, checking AWS eligibility on every action.
   The fork accepts only short-lived server-to-server assertions from that proxy
   for writes, with signature, audience, expiry, request binding and replay checks. Remove
   public IdP token exchange and direct user-token writes. Map participant IDs
   to reviewed existing author IDs, never auto-merge by email. Invalidate old
   Artalk signing/session keys and clear legacy browser token storage at cutover.
   Keep anonymous reading; leave member comments off until this boundary is proven.
5. Deploy only with explicit authority, then retire the Auth0/allowlist bypass.
   Rollback may preserve public reading, not restore an unsafe access path.

### Consequences

Staff retain their CRM; OPDA owns identity integration and native recovery, not a separate S3 backup service.
CRM projections may lag; approval, trusted access, HubSpot capacity and Microsoft access remain separately governed.

### Confirmation

**S3 backup retirement, 2026-09-09:** the repository removes the dedicated backup runtime and
nested stack, including its schedules and alarms. DynamoDB PITR, the retained evidence bucket
and one-off import contracts remain unchanged. Deployment is required to remove the live
scheduled resources; this code change alone does not establish their removal in AWS.

**Version 2 runtime readback, 2026-09-09:** the active approval Lambda uses
`DOMAIN_REVIEW_CUTOVER=2026-09-09T14:35:15Z`. Six domain properties and pinned invitation
templates exist. The subsequent strict last-group rule and withdrawal notices require their
own deployment and timed live verification; template creation alone does not prove delivery.

**Historical v1 verification, 2026-09-08:** signup sync, contact-wide review webhooks and
Cognito endpoints were live; CI deployed `803c5d33`, with both approval Lambdas matching it.

- Imported 1,001 HubSpot contacts and preserved six allowlist approvals: 1,007 mapped accounts,
  enabled but initially unenrolled. No passwords, bulk invitations, admin grants or verification
  shortcuts. Both approval sources are pinned in S3; all 1,001 CRM status mirrors were projected.
- A live synthetic signup verified ten mapped fields, pending/inactive status and no Cognito account.
  Manual HubSpot approval enabled access in 1.8 seconds; withdrawal disabled it in 1.4 seconds,
  using actual signed HubSpot notifications. The test contact was archived, intake removed and replay
  suppressed; the disabled account/audit remain. Tests cover retries, signatures, expiry and denial.
- Login presented the Cognito email-code challenge and unauthenticated sessions returned 401.
  The callback was not yet tested at that inspection; successful real sign-in on 2026-09-09
  is recorded in ADR-0085. The session Lambda no longer had Auth0 configuration.
- Historical S3 recovery point from the now-retired feature, 2026-09-08 19:56:51 UTC: 3,023 register items covering 1,007 accounts,
  empty intake, 1,001 CRM profiles and 16 definitions. Counts/digests passed; no sessions or credentials.

Outstanding: timed withdrawal-notice verification, privileged access/MFA procedures, retention sweeps and authenticated comment writes. Comments remain public read-only.

## More Information

- [ADR-0038](./ADR-0038-hosting-auth-and-comments-architecture-aws.md): existing Auth0 and Artalk architecture, amended only at migration.
- [ADR-0040](./ADR-0040-aws-hosting-ci-cd-pipeline.md): infrastructure-as-code and authorised CI delivery.
- [ADR-0069](./ADR-0069-public-working-group-recruitment-and-signup.md): collection, reference events, human review and retention.
- [ADR-0070](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md) and [ADR-0085](./ADR-0085-approval-driven-working-group-onboarding-and-invitations.md): Microsoft workspace permissions and approval-triggered invitations.
- [ADR-0079](./ADR-0079-make-the-site-public-and-retire-the-edge-authentication-gate.md): public documentation and path-scoped sessions.
- [ADR-0083](./ADR-0083-rebuild-proportionate-risk-based-ci-cd.md): proportional validation.
- Code evidence: `config/aws/working-group-interest/{domain,index}.mjs`, `working-group-interest-stack.yaml`, `submission-events/index.mjs`, `auth-session/index.mjs`, and `src/components/Comments.astro`.

## Vote and Dissent

Native Astra Ultra and Fable 5.1 findings informed identity, invitation, abuse, retention and migration.
Separate review/enrolment/active fields are retained over Fable's consolidation suggestion; capacity is a preflight condition.
The operator authorised implementation and bounded contact approval; decisions and live checks are recorded in Ruflo MCP.
