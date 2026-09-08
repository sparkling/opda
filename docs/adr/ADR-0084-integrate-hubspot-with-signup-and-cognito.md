---
status: accepted
date: 2026-09-08
tags: [aws, hubspot, cognito, identity, participants, recruitment, crm, privacy, backup, proportionality]
supersedes: []
amends: [ADR-0038, ADR-0069, ADR-0079]
depends-on: [ADR-0040, ADR-0070, ADR-0083]
implements: []
---

# Integrate HubSpot with working-group signup and Cognito authentication
## Context and Problem Statement

OPDA needs a CRM for roughly 1,000 participants, retaining join data, human approval,
completed enrolment and active/inactive state. Participants need website accounts, not CRM seats.
An existing HubSpot account changes the build-versus-buy decision. This replaces ADR-0084's
**uncommitted bespoke-CRM draft**, not an accepted decision or deployed service.

The repository already implements anonymous `/join` submissions in encrypted,
on-demand DynamoDB in `eu-west-2`. A reference-only DynamoDB Streams/SNS/SQS
boundary follows persistence. The public handler does not create accounts.
At the start of this migration, website sessions and Artalk SSO used **Auth0**,
with a separate commenter email allowlist. Therefore adopting Cognito is an
authentication migration, not simply configuring an existing Cognito connector.

The account inspection on 2026-09-08 found Free Tools, five of five Core seats allocated
at that inspection, and 1,001 contacts. API inventory found `linkedin_account`,
`membership_type` and `relationship_type`. The account-wide custom-property limit is 10,
with two used before setup. The legacy contact ceiling remains unverified.

This concerns participant administration, not SPDTF trust, standards authority or Microsoft access.
On 2026-09-08 the operator authorised implementation, live website sign-in, and a
one-time approval of existing HubSpot contacts. Brief cutover downtime is acceptable.
The frozen migration includes contacts created by 18:26:22 UTC that day; it does
not automatically approve future contacts, establish marketing consent or grant
website administration. All 1,001 current contacts passed the primary-email preflight.

The operator subsequently requested approval directly in HubSpot. This amendment
replaces the proposed bespoke ordinary-participant action page with manual CRM
review decisions, authenticated webhooks and AWS enforcement. It does not grant CRM
editors website administration or make anonymous CRM writes trusted approvals.

## Decision Drivers

Reuse the CRM; require approval and verified identity; keep public reading and
signup independent; preserve collection evidence without inventing consent;
avoid paid automation tiers; keep AWS costs and private recovery proportionate.

## Considered Options

- **HubSpot memberships as website authentication.** Appropriate for eligible
  HubSpot-hosted private content, not the existing public Astro/AWS site.
- **Cognito with HubSpot as a live login-status lookup.** Avoids a local access
  register, but couples sign-in to CRM availability, editable fields and API limits.
- **HubSpot and an AWS register with existing Auth0.** A viable lower-migration
  option. Cognito is selected to meet the requested AWS identity direction, not
  because HubSpot requires it. A clean cutover is preferred to parallel providers.
- **HubSpot CRM plus an AWS eligibility register and Cognito (chosen).** Reuses
  CRM screens while retaining a small, enforceable website access boundary.
- **Custom AWS CRM plus Cognito.** Technically possible, but duplicates contact
  management, notes, tasks, searching and filtering already available in HubSpot.

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

Keep the current form. Reuse standard properties after verifying their metadata;
add an **OPDA participation** property group with the eight new fields below.
An initially created contact is an unverified applicant, not an approved member.

| Join input / record | HubSpot destination | Type and ownership |
|---|---|---|
| `fullName` | **New:** `opda_full_name` | `string` / `text`; preserve the complete name without guessing a first/last-name split. Staff may maintain it after review. |
| `email` | Existing `email` | Contact address; changes are not changes to the verified Cognito binding. |
| `organisation` | Existing `company` | Contact-level company name; do not create/merge Company records by name alone. |
| `role` | **New:** `opda_role_or_expertise` | `string` / `text`; broader than Job title, preserving the form's professional-role/expertise meaning; never an application permission. |
| `workingGroups` | **New:** `opda_requested_working_groups` | `enumeration` / `checkbox`; requested groups, not approved groups or Microsoft grants. |
| `contributions` | **New:** `opda_contribution_preferences` | `enumeration` / `checkbox`; all six current choices. |
| `relevantPerspective` | **New:** `opda_relevant_perspective` | `string` / `textarea`; retain the 600-character limit and existing privacy warning. |
| Review outcome | **New:** `opda_review_status` | `enumeration` / `select`; staff-owned decision: `received`, `under_review`, `approved`, `rejected`, `withdrawn`. A current manual edit with recorded CRM actor is required. |
| Account setup | **New:** `opda_enrolment_status` | `enumeration` / `select`; AWS-owned snapshot: `not_invited`, `invited`, `complete`, `expired`. |
| Enabled flag | **New:** `opda_active` | `bool` / `booleancheckbox`; AWS-owned snapshot; pending applicants are disabled, the approved migration is enabled but unenrolled. Not sufficient for login by itself. |
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

AWS retains the participant-to-HubSpot contact mapping without spending another
custom-property slot or putting an access credential in a CRM link.
AWS additionally retains all source registration IDs, form/option-set version,
receipt/decision/invitation/completion timestamps, approved group IDs, actor and
reason, suspension state, verified email/subject evidence, `accessVersion`, retention basis/deadline,
sync errors and last successful sync time. Not every audit field needs a CRM
property. Approved groups and privileged grants remain separately governed;
add a CRM approved-groups field later only if staff filtering warrants it.

Legacy records already contain trimmed/lowercased email and trimmed text, not
the raw input bytes. `createdAt` is epoch milliseconds and `expiresAt` seconds.
They lack a separate form/option-set version and exact checkbox-click time.
Preserve what exists; record unknown historic values rather than invent them.

The complete inventory contained 395 active definitions and three custom-style fields;
the account-wide quota counted two. Contact-specific capacity was 1,000 with three used.
Use the smaller remaining quota, not a hand-count or advertised new-Free limit. Eight
slots were available; all eight fields were created and read back on 2026-09-08.
Recheck capacity for later additions; never remove fields or buy an upgrade implicitly. [Limits API](https://developers.hubspot.com/docs/api-reference/legacy/crm/limits-tracking/guide)

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
5. Staff change Application review status in HubSpot. The separate approval worker
   commits eligibility, actor audit and decision version atomically in AWS, then
   projects active/enrolment status. External effects have durable retry state;
   no database-plus-API dual write is represented as one transaction.

An automatically allocated pending participant reference identifies a record,
not a proven person. It cannot activate anything. Before approval, resolve
duplicate applicants and reserve the canonical identity keys in AWS.

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

Staff use **Application review status → Approved** on the contact. The worker enables
ordinary email-code sign-in. Received, Under review, Rejected or Withdrawn removes
ordinary access. No extra Active checkbox, paid workflow, bulk invitation or bespoke
approval screen is required. Enrolment completes only after mailbox proof at sign-in.

The existing legacy private app supports property-change webhooks. Configure its
HTTPS target and subscriptions in HubSpot's private-app UI, not the public-app API.
Watch review status, email, deletion/privacy deletion, merge and restore events.
The receiver prefers v3 HMAC over the pinned HTTPS URL, method, raw body and fresh
timestamp; an invalid v3 never falls back to v1. Legacy-only v1 remains supported.
It pins portal/app IDs and durably enqueues bounded contact-ID hints before replying.
It has no participant-table or Cognito permissions. The signing secret is separate
from the contact API token in Secrets Manager. No secrets or contact values enter queue payloads or logs.
[Private-app webhooks](https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview), [Signature validation](https://developers.hubspot.com/docs/apps/legacy-apps/authentication/validating-requests)

The signature authenticates the app, not the approver. A separate worker fetches
the current contact and review/email property histories. Approval requires a
current `CRM_UI` review entry with HubSpot-recorded user ID and matching current
value after the review cutover. Imports, forms, workflows, integrations and a
user-entered approver name cannot approve. The contact's email must predate its
first approval. Invalid or contradictory recent review history cannot grant access.
[Property history](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/guide),
[Change sources](https://knowledge.hubspot.com/properties/hubspots-change-sources)

This deliberately trusts authorised HubSpot contact editors for **ordinary**
participant approval. Use named staff accounts and MFA; a shared CRM account cannot
provide individual attribution. HubSpot property restrictions alone are not a
security boundary. Administrative grants and identity correction remain separate,
audited AWS operations under operator authority and step-up; CRM never grants them.
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
erasure and expiry cannot be cleared by CRM approval. Existing frozen imports stay
approved until a new decision; the six non-CRM legacy approvals are not revoked
merely because they are absent from HubSpot.

### 6. Cognito enrolment, eligibility and revocation

The server-side eligibility predicate is:

`approved AND enrolmentComplete AND active AND NOT suspended AND verifiedBoundIdentity`

| Stage | Website access |
|---|---|
| Received / under review | Public pages only; no Cognito account created by submission. |
| Approved, not enrolled | User-requested email code and restricted account setup only. |
| Enrolled and active | Permitted member actions, subject to current grants. |
| Rejected / withdrawn / expired / inactive | No member actions, including with an old session. |

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
Migration evidence does not expire with 35-day recovery copies. Conditional email
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
inconsistent or expired state. Commit `active=false` and increment the version
before confirming suspension; then disable Cognito, globally sign out and
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

The public form role remains write-only to intake. The CRM bridge can read
in-scope applications and synchronise profiles but cannot approve,
activate, change grants or administer Cognito. The isolated approval service alone can
change eligibility and provision identities. Backup roles cannot administer
accounts. Separate eligibility/audit keys from projection/sync keys and enforce
the bridge's write prohibition in IAM, not merely in application code.
The bridge never writes either existing membership/relationship property.
Restrict the token to the expected portal, while recognising contact
API scopes are not record-level isolation: the adapter must enforce the mapped
OPDA subset and protect the token as a portal-wide contact-data capability.

### 8. Privacy, S3 backup and recovery

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
Withdrawal and contact deletion are reconciled into AWS suspension. Revocation is
effective after AWS commits it, not synchronously with the CRM click; API outages
can delay this. Urgent security suspension uses the independent AWS access boundary.

Keep intake PITR at seven days; enable 35-day PITR on the new participant table.
Export intake and participant records daily at a native point in time to a
separate private, encrypted, versioned S3 bucket. Check completed manifests, not
just successful start requests; a live paginated Scan is not a consistent backup.
Exclude sessions and credentials. Retain recovery objects and noncurrent
versions for 35 days;
restrict deletion/restore roles and prevent public/build-role access.
[DynamoDB export](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)

Also take a daily scoped HubSpot API snapshot of mapped OPDA contacts and required
property definitions/options. Notes/tasks and associations require a later extension.
Record start/end times, counts, object IDs, revisions, failures and a completion
manifest. This is a recoverable application snapshot, **not** HubSpot PITR or an
atomic whole-portal backup. Native CRM backup omits associations/activity and is
not the required S3 recovery path.
[HubSpot backup scope](https://knowledge.hubspot.com/object-settings/back-up-crm-data)

Target a completed recovery point within 24 hours, alert at 26 hours and aim to
restore within one working day after operator action; these are not guarantees.
Restore in quarantine, apply subsequent erasures/withdrawals/suspensions, reconcile
IDs and require fresh sessions. Uncertain access stays inactive; replay must not
resurrect removed participation data.

Cognito passwords, MFA secrets and original subjects cannot be recreated from
these exports. Pool loss requires fresh credential/MFA enrolment and reviewed
identity bindings; never bulk-reactivate restored users or administrative grants.
Keep the deletion/suppression evidence needed through the backup residual period
under a documented retention basis, then expire it too.
[Cognito profile-export limitations](https://docs.aws.amazon.com/solutions/latest/cognito-user-profiles-export-reference-architecture/guidance-components.html)

### 9. Cost, delivery and acceptance boundary

Use regional serverless participant/session stores, isolated signup/approval consumers
and scheduled maintenance. No custom CRM, SQL, VPC/NAT, Redis or workflow engine.

Free/Starter private apps allow 100 requests per ten seconds per app and 250,000
per account daily. Stay below these and stricter endpoint limits; no paid workflow tier is needed.
[HubSpot API limits](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines)

For roughly 1,000 direct Cognito MAUs, Essentials' published 10,000-MAU
direct/social allowance is relevant; federation terms differ. Price Secrets
Manager, logging, PITR/exports, encryption, email and alarms in London before
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
   email verification, enrolment, suspension, safe retries and backup recovery.
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

Staff retain their CRM; ownership and approval stay explicit. OPDA owns identity integration and recovery. CRM snapshots may lag;
trusted access actions, HubSpot capacity and Microsoft access remain separately governed.

### Confirmation

**Accepted; signup synchronisation, HubSpot review webhooks and Cognito endpoints live.**
Infrastructure and website CI deployed `803c5d33` on 2026-09-08; both approval Lambdas match its artifact.

- Imported 1,001 HubSpot contacts and preserved six allowlist approvals: 1,007 mapped accounts,
  enabled but initially unenrolled. No passwords, bulk invitations, admin grants or verification
  shortcuts. Both approval sources are pinned in S3; all 1,001 CRM status mirrors were projected.
- A live synthetic signup verified ten mapped fields, pending/inactive status and no Cognito account.
  Manual HubSpot approval enabled access in 1.8 seconds; withdrawal disabled it in 1.4 seconds,
  using actual signed HubSpot notifications. The test contact was archived, intake removed and replay
  suppressed; the disabled account/audit remain. Tests cover retries, signatures, expiry and denial.
- Login presents the Cognito email-code challenge; unauthenticated sessions return 401. The real
  code callback awaits operator completion, so end-to-end sign-in has not passed yet. The session
  Lambda no longer has Auth0 configuration.
- Verified S3 recovery point, 2026-09-08 19:56:51 UTC: 3,023 register items covering 1,007 accounts,
  empty intake, 1,001 CRM profiles and 16 definitions. Counts/digests passed; no sessions or credentials.

Outstanding: operator email-code completion, a quarantine restore drill, privileged access/MFA
procedures, retention sweeps and authenticated comment writes. Comments remain public read-only.

## More Information

- [ADR-0038](./ADR-0038-hosting-auth-and-comments-architecture-aws.md): existing Auth0 and Artalk architecture, amended only at migration.
- [ADR-0040](./ADR-0040-aws-hosting-ci-cd-pipeline.md): infrastructure-as-code and authorised CI delivery.
- [ADR-0069](./ADR-0069-public-working-group-recruitment-and-signup.md): collection, reference events, human review and retention.
- [ADR-0070](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md): separate Microsoft invitations and permissions.
- [ADR-0079](./ADR-0079-make-the-site-public-and-retire-the-edge-authentication-gate.md): public documentation and path-scoped sessions.
- [ADR-0083](./ADR-0083-rebuild-proportionate-risk-based-ci-cd.md): proportional validation.
- Code evidence: `config/aws/working-group-interest/{domain,index}.mjs`, `working-group-interest-stack.yaml`, `submission-events/index.mjs`, `auth-session/index.mjs`, and `src/components/Comments.astro`.

## Vote and Dissent

Native Astra Ultra and Fable 5.1 findings informed the identity, invitation, abuse,
retention and migration decisions. Separate review/enrolment/active fields are
retained over Fable's consolidation suggestion; capacity is a preflight condition.
The operator authorised implementation and bounded contact approval; decisions and live checks are recorded in Ruflo MCP.
