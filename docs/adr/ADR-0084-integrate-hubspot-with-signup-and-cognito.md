---
status: proposed
date: 2026-09-08
tags: [aws, hubspot, cognito, identity, participants, recruitment, crm, privacy, backup, proportionality]
supersedes: []
amends: [ADR-0038, ADR-0069, ADR-0079]
depends-on: [ADR-0040, ADR-0070, ADR-0083]
implements: []
---

# Integrate HubSpot with working-group signup and Cognito authentication

## Context and Problem Statement

OPDA needs a CRM for fewer than 1,000 website participants, retaining join data,
human approval, completed enrolment and active/inactive state. Participants need
website accounts, not CRM seats. Discovering an existing HubSpot account changes
the build-versus-buy decision. This replaces ADR-0084's **uncommitted bespoke-CRM
draft**, not an accepted decision or deployed service.

The repository already implements anonymous `/join` submissions in encrypted,
on-demand DynamoDB in `eu-west-2`. A reference-only DynamoDB Streams/SNS/SQS
boundary follows persistence. The public handler does not create accounts.
The current website session service and Artalk SSO use **Auth0**, not Cognito,
with a separate commenter email allowlist. Therefore adopting Cognito is an
authentication migration, not simply configuring an existing Cognito connector.

The existing HubSpot account was inspected on 2026-09-08: Free Tools, five of
five Core seats allocated, and 1,001 contacts. Two existing contact properties
were identified: `membership_type` and `relationship_type`. The account's exact
legacy contact and custom-property ceilings remain **unverified**. These account
observations are not inferred from the limits of today's new Free offering.

This concerns participant administration, not SPDTF trust implementation,
standards authority or Microsoft access. It authorises no live provisioning,
personal-data transfer, invitations, subscription purchase or login cutover.

## Decision Drivers

- Use HubSpot's existing contact management rather than build a second CRM.
- Allow member actions only after human approval and verified account setup.
- Keep public documentation and registration independent of login and HubSpot.
- Preserve every join choice and its provenance without inventing consent.
- Avoid expensive HubSpot tiers solely for automation or authentication.
- Keep AWS state small, recoverable to private S3, and proportionate to traffic.

## Considered Options

- **HubSpot memberships as website authentication.** Appropriate for eligible
  HubSpot-hosted private content, not the existing public Astro/AWS site.
- **Cognito with HubSpot as a live login-status lookup.** Avoids a local access
  register, but couples sign-in to CRM availability, editable fields and API limits.
- **HubSpot and an AWS register with existing Auth0.** A viable lower-migration
  option. Cognito is selected to meet the requested AWS identity direction, not
  because HubSpot requires it; retain Auth0 until the safe cutover is ready.
- **HubSpot CRM plus an AWS eligibility register and Cognito (chosen).** Reuses
  CRM screens while retaining a small, enforceable website access boundary.
- **Custom AWS CRM plus Cognito.** Technically possible, but duplicates contact
  management, notes, tasks, searching and filtering already available in HubSpot.

## Decision Outcome

Use **HubSpot for CRM, Cognito for authentication, and DynamoDB for website
eligibility**. Implement a narrow signup/synchronisation bridge and access-action
page, not a custom CRM. HubSpot is not called during ordinary participant login
or protected requests. Its outage must not break the public site or revoke an
otherwise eligible person's access merely because CRM synchronisation is late.

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
| HubSpot Contacts | Staff-maintained contact details, requested participation, contribution preferences and CRM notes/tasks | Verified login identity or effective access permissions |
| New AWS participant register | Stable participant ID, application links, trusted decisions, approved groups, enrolment, active flag, identity binding, grants, audit and sync operations | Passwords, a second editable CRM directory, or a property-data model |
| Cognito user pool | Credentials, verified identity attributes, MFA and authentication | Application evidence, CRM notes or approval inferred from an email address |

The AWS register also holds a labelled last-observed CRM profile and its revision
for administration/recovery. This is a projection, not bidirectional ownership.
Decisions reference their application/values; CRM edits cannot rewrite that evidence.

Use immutable random participant IDs, separate registration IDs and a verified
`issuer + sub` identity binding. Store the HubSpot portal/contact mapping in AWS;
neither email nor a CRM field is a security identifier. Reserve canonical email
and subject bindings with conditional writes/transactions at trusted review and
enrolment. An eventually consistent search index is not a uniqueness check.
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
| Review outcome | **New:** `opda_review_status` | `enumeration` / `select`; AWS-owned snapshot: `received`, `under_review`, `approved`, `rejected`, `withdrawn`. |
| Account setup | **New:** `opda_enrolment_status` | `enumeration` / `select`; AWS-owned snapshot: `not_invited`, `invited`, `complete`, `expired`. |
| Enabled flag | **New:** `opda_active` | `bool` / `booleancheckbox`; AWS-owned snapshot, initially `false`; not sufficient for login by itself. |
| `acknowledgement`, `privacyNoticeVersion` | AWS evidence, visible through the restricted application/access page | Keep the boolean and exact notice version with server receipt time; not a HubSpot marketing subscription. |
| `website`, `startedAt` | **Do not synchronise or retain** | Honeypot and transient client timer, not a company website or application timestamp. |

HubSpot's default contact properties distinguish company-name text from associated
Company records. Its properties API supports the listed types and multi-choice
values. Put the full-name field prominently in the CRM view beside the contact
link; do not misuse First name to improve display. Keep existing first/last names.
Pin/test the adapter API version and verify each portal's default metadata.
[Default contact properties](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties),
[Properties API](https://developers.hubspot.com/docs/api-reference/latest/crm/properties/guide)

Preserve `membership_type` (Associate, Founding Member) and `relationship_type`
(Member, Partner, Stakeholder, Journalist, Other). Do not repurpose either, the
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
custom-property slot; the managed access-page link carries an opaque reference.
AWS additionally retains all source registration IDs, form/option-set version,
receipt/decision/invitation/completion timestamps, approved group IDs, actor and
reason, suspension state, verified email/subject evidence, `accessVersion`, retention basis/deadline,
sync errors and last successful sync time. Not every audit field needs a CRM
property. Show approved groups and live access on the restricted action page;
add a CRM approved-groups field later only if staff filtering warrants it.

Legacy records already contain trimmed/lowercased email and trimmed text, not
the raw input bytes. `createdAt` is epoch milliseconds and `expiresAt` seconds.
They lack a separate form/option-set version and exact checkbox-click time.
Preserve what exists; record unknown historic values rather than invent them.

Eight new fields plus the two identified existing properties would total ten
**only if a full property inventory confirms no others**. Confirm actual legacy
capacity first; ten slots would leave no spare custom fields. Optional later
fields require another capacity decision. If insufficient, present the smallest paid
upgrade for approval; do not delete existing fields, hide the schema in notes,
or silently buy a subscription. This ADR does not assume Free capacity.

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
5. Staff work with contacts in HubSpot. Trusted access actions update AWS and an
   outbound sync marker atomically. A worker projects the confirmed result back
   to HubSpot; no database-plus-API dual write is represented as one transaction.

An automatically allocated pending participant reference identifies a record,
not a proven person. It cannot activate anything. Before approval, resolve
duplicate applicants and reserve the canonical identity keys in AWS.

Deduplicate incoming events and source registrations, and bound concurrent
operations per participant/contact. Use stable operation IDs and conditional
versions. An ambiguous contact-create timeout must reconcile before retrying
creation. An email match, contact merge or copied access-page link must not
merge website identities. Pause ambiguous mappings for human resolution; no
automatic alias transfer, identity re-binding or invitation resend.

Run hourly reconciliation over pending operations and mapped CRM profiles;
include an intake completeness/retention sweep in its daily run. Event-driven
signup normally arrives sooner; CRM freshness target is one hour, not a guarantee.
Alert on dead letters, credential/configuration failures and work pending over a day.
Respect `429` and `Retry-After`, back off with jitter, and retain failed work for
safe replay. Expired/erased records must not be recreated by replay or backfill.

Use per-field ownership, not timestamp-based last-write-wins. Do not overwrite
HubSpot-owned profile edits with AWS snapshots. For AWS-owned status fields,
reconcile from the current AWS record; CRM edits to those mirrors never become
commands. Display live state and last-confirmed CRM sync time on the action
page. Describe HubSpot status properties explicitly as delayed snapshots.

No HubSpot workflows, incoming webhooks or app cards are required for version
one. Polling is acceptable for CRM freshness **because it is not the revocation
mechanism**. A later webhook may improve latency, but must validate its supported
signature and tenant and only request reconciliation, not grant access.

### 5. Human approval and the small access-action surface

Use HubSpot's contact list, views, notes and tasks for CRM work. Provide only a
restricted `/admin/participant-access` page and associated API for review,
approval/rejection, approved groups, invitation, suspension/reactivation and
identity correction. Link it from an OPDA-managed contact note using an opaque
reference, never email, an invitation code or a bearer credential in the URL.
Following a link authorises nothing; the server resolves and checks every target.

The action page displays the original application separately from current CRM
values. It must show the latest effective state, pending operations and reasons
for ineligibility. Confirm sensitive actions and return the committed AWS result,
distinguishing invitation requested/sent from delivered or account setup complete.
Rejections and requests for more information are human communications; they must
not trigger unrequested automatic messages to an unverified address.

| Actor | Authority |
|---|---|
| Ordinary participant | Their own eligible member actions; no CRM or access administration. |
| HubSpot editor | CRM profile work under HubSpot permissions; no implied AWS access grant. |
| AWS `participant-manager` | Review/invite/suspend ordinary participants through the action API; no administrative grants or privileged-user changes. |
| AWS `access-admin` | Manage grants, privileged users and identity corrections under step-up; no self-promotion or first-user-wins rule. |

Neither administrative role may approve, invite, reactivate, rebind or grant
access to its own identity. Identity correction first suspends/revokes the old
binding, then requires verified re-enrolment, not a direct CRM email replacement.

Bootstrap the operator-designated administrator through an audited AWS procedure
and verified Cognito binding. Keep the supplied administrator email in private
deployment inputs, not this ADR, a public allowlist or frontend code. Retain
MFA-protected break-glass recovery and prevent accidental removal of the last
active administrator. HubSpot users should have named accounts and MFA; sharing
a CRM login must not conceal the actor for a website approval.

Authorise both the action HTML and API before disclosing data, including direct
origin access. Use no-store responses, strict input validation, CSRF/Origin
checks, optimistic versions and atomic decision/audit writes. The actor's current
grant/version must still hold when a privileged mutation commits. Require staff
TOTP MFA and fresh server-verified step-up for access administrators/managers.
Prove first-login and recovery challenges in a spike; MFA configuration or a JWT
alone is insufficient. Use strict CSP, no third-party admin scripts and assess
residual same-origin XSS. MFA is optional for ordinary participants.
[Cognito MFA behaviour](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html)

Even HubSpot's paid property restrictions are explicitly not a complete security
measure. Consequently, an editable `approved` or `active` value, webhook app
signature, workflow or user-entered approver name is not a trusted human decision.
[HubSpot property-access limitations](https://knowledge.hubspot.com/properties/restrict-view-edit-access-for-properties)

### 6. Cognito enrolment, eligibility and revocation

The server-side eligibility predicate is:

`approved AND enrolmentComplete AND active AND NOT suspended AND verifiedBoundIdentity`

| Stage | Website access |
|---|---|
| Received / under review | Public pages only; no Cognito account created by submission. |
| Approved, not enrolled | Explicit invitation and restricted account setup only. |
| Enrolled and active | Permitted member actions, subject to current grants. |
| Rejected / withdrawn / expired / inactive | No member actions, including with an old session. |

Disable Cognito self-service signup. Reviewers confirm the intended person's
address before approval. Provision with `AdminCreateUser` + `SUPPRESS`, record
the subject binding, then explicitly invite using `AdminCreateUser` + `RESEND`
and `DesiredDeliveryMediums=[EMAIL]`. Cognito's configured SES-backed invitation
template carries its newly generated temporary password; OPDA does not store it.
Set the pool temporary-password and invitation validity to seven days. Resend
reissues the credential/window; an ambiguous send requires operator resolution,
not a blind retry. Verify SES sending readiness before enablement. Recheck approval
before sending, never force-transfer aliases, and disable withdrawn orphan accounts.
Do not mark email verified merely because staff approved it or sent an invitation.
[AdminCreateUser](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html)

Invitees may establish credentials and prove control of the bound email before
they are fully eligible. Give this ceremony an enrolment-only session whose
fixed endpoint allowlist exposes no member/admin data. Complete onboarding only
after verified email, required account acknowledgements and an idempotent backend
completion transaction which rechecks approval and absence of suspension.
Record suspension with actor/time/reason separately from `active=false`, which
also describes a valid invitee. Suspension blocks enrolment/completion; clearing
it requires an authorised decision and never bypasses incomplete enrolment.
Invitations expire; resending is an explicit action. Password reset is not
approval, reactivation or completed participant onboarding.

Do not rely on Cognito post-confirmation to enrol admin-created accounts, or on
pre-authentication as the only access check: the former does not cover this
account-creation path and the latter does not run on session renewal.
[Post-confirmation trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-confirmation.html),
[Pre-authentication trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-authentication.html)

Use one confidential Cognito Essentials client and managed login with Authorization
Code + PKCE, state and nonce checks. Keep tokens server-side; issue an opaque `Secure`,
`HttpOnly`, `SameSite=Lax`, `__Host-` session cookie. Verify token signature,
issuer, client/audience, token use and expiry. Use a separate short-lived DynamoDB
session table; rotate sessions on login/completion and enforce expiry in code.
Never expose provider tokens through `/_auth/me`. Allow only local return paths.

Every protected action checks the current participant/grant record with a strong
read and compares the session access version. Deny missing, unreadable,
inconsistent or expired state. Commit `active=false` and increment the version
before confirming suspension; then disable Cognito, globally sign out and
invalidate sessions with durable retries. A Cognito failure does not restore
access. Reactivation does not revive old sessions. Already-delivered data cannot
be recalled, and a read authorised before suspension may finish.

AWS documents that ordinary signature/expiry JWT validation can accept revoked
tokens. API Gateway JWT checks, stale Cognito groups and CRM polling therefore
cannot replace the live eligibility check.
[Cognito token revocation](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html)

### 7. Integration credentials and least privilege

Use two single-account private apps with static auth: a read/write CRM bridge
and read-only snapshot app. Verify current-platform installation entitlements;
use a supported legacy private app only if necessary and available. No Marketplace
distribution or OAuth callback service is needed. CLI personal keys and MCP are
developer tooling, **not** production credentials.

Keep app tokens in AWS Secrets Manager, separate from Cognito/client secrets,
with explicit creation approval, rotation and revoke/recovery instructions. No
secrets in static JS, builds, Git, queues, prompts or logs. Start with contact
read/write and schema-read scopes; verify the minimum endpoint scopes for the
small OPDA note/task operations. Property creation uses a separate one-time
bootstrap credential with schema-write permission, not permanent runtime rights.
No marketing-send, website-publish, broad export or unrelated-object permissions.

The public form role remains write-only to intake. The CRM bridge can read
in-scope applications and synchronise profiles but cannot approve,
activate, change grants or administer Cognito. The access service alone can
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
Withdrawal suspends access through the trusted command; deleting a CRM contact
alone is not a documented access-revocation mechanism.

Keep intake PITR at seven days; enable 35-day PITR on the new participant table.
Export intake and participant records daily at a native point in time to a
separate private, encrypted, versioned S3 bucket. Check completed manifests, not
just successful start requests; a live paginated Scan is not a consistent backup.
Exclude sessions and credentials. Retain recovery objects and noncurrent
versions for 35 days;
restrict deletion/restore roles and prevent public/build-role access.
[DynamoDB export](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)

Also take a daily scoped HubSpot API snapshot of mapped OPDA contacts, required
property definitions/options, OPDA-managed notes/tasks and essential associations.
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

Use the existing region/serverless services, small participant/session stores,
sync consumer, action backend and scheduled maintenance. No custom CRM, SQL server,
VPC/NAT, Redis, workflow engine, always-on workers or multi-region deployment.

Free/Starter privately distributed apps currently allow 100 requests per ten
seconds per app and 250,000 per day shared by the account; design well below
these and honour stricter endpoint limits. No paid workflow tier is needed.
[HubSpot API limits](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines)

For fewer than 1,000 direct Cognito MAUs, Essentials' published 10,000-MAU
direct/social allowance is relevant; federation terms differ. Price Secrets
Manager, logging, PITR/exports, encryption, email and alarms in London before
deployment. Target low tens of US dollars/month incremental, not a quote. Verify
all editing-seat and renewal costs before a HubSpot upgrade.
[Cognito pricing](https://aws.amazon.com/cognito/pricing/)

Deliver in independent, verified slices:

1. Confirm legacy CRM capacities, all existing property definitions, named
   administrators, privacy/retention wording and scoped app access. Provision
   fields idempotently, rejecting incompatible existing definitions/options.
2. Implement receipt-preserving AWS-to-HubSpot sync with synthetic data first;
   reconcile existing applications without auto-approving any contact or roster.
3. Add the AWS register and action page; prove approval, invitation, email
   verification, enrolment, staff MFA, suspension and backup recovery in a spike.
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

- Good, because staff use an existing CRM instead of a second bespoke application.
- Good, because credentials, original evidence, CRM profiles and access decisions have explicit owners.
- Good, because CRM outages or status edits cannot silently determine website access.
- Good, because the minimal field set preserves every submitted choice without assuming a paid tier.
- Bad, because a small security-sensitive bridge, identity migration and recovery process remain OPDA responsibilities.
- Bad, because CRM status snapshots can lag and staff must use the trusted action page for effective changes.
- Neutral, because HubSpot capacity/processing approval must be verified and Microsoft access remains separately governed.

### Confirmation

**Proposed, not implemented or deployed.** Before enabling the integration:

- Confirm lossless field/option mapping, no honeypot/timer CRM data and no invented historical evidence.
- Exercise duplicates, contact merges, ambiguous timeouts, out-of-order events,
  retries, `429`, erased records and queue isolation using synthetic records.
- Prove pending/incomplete/inactive users and stale sessions cannot perform
  member actions, including direct Artalk/API requests and password resets.
- Prove CRM edits, professional roles/groups, ownership and HubSpot admin status cannot grant AWS access.
- Verify exact-target admin authorisation, CSRF, actor revocation, MFA/step-up,
  safe invitation retries and public-site independence from both providers.
- Restore a completed S3 snapshot in quarantine, including withdrawal/erasure,
  duplicate identity and pool-loss cases; do not restore active sessions.
- Check no personal data/secrets reach builds, public archives or logs. Apply
  focused unit/contract tests and one end-to-end synthetic journey, not new
  whole-site release gates. Record capacity, cost and recovery ownership.

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
Review is not OPDA acceptance. Ruflo MCP returned `Transport closed`; memory/graph
registration is pending, without CLI fallback.
