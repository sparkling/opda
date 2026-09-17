---
status: proposed
date: 2026-09-16
tags: [microsoft-365, teams, bot-framework, hubspot, approval, participants, working-groups, security, aws]
supersedes: []
amends: [ADR-0085]
depends-on: [ADR-0084, ADR-0085, ADR-0087]
implements: []
---

# Approve working-group domains from a Teams card

## Context and Problem Statement

ADR-0085 §1 gives approval one control surface: a member of staff opens the contact in HubSpot
and sets that domain's review dropdown. The approval worker trusts only property history whose
`sourceType` is `CRM_UI`; a value written by any integration is an untrusted change that holds
the domain until a fresh human edit clears it. That boundary is deliberate and it works.

It also means nobody learns about a new signup unless they go looking in the CRM, and the
decision itself takes a browser, a login and a search. The operator asked for two things on
2026-09-16: a notification of every new signup where the team already works, in Teams, and the
ability to approve or reject each requested group from that notification.

The notification is a property of the submission, exactly as the acknowledgement is (ADR-0087):
the applicant filled in the form, so the reviewers hear about it. The approval is a change to
the authority boundary in ADR-0085 and needs its own record, its own threat model and a flag.

## Decision Drivers

Notify without touching the approval boundary. Add a second approval authority only with an
identity at least as strong as a HubSpot login, a per-decision record at least as attributable
as CRM history, and a single seam in the existing worker rather than a parallel path. Keep the
buttons visible from day one so the interface is exercised, but make the flag the only thing
that turns a click into a grant. Everything that can fail closed does.

## Considered Options

- **An incoming webhook or Workflows connector.** Posts text, cannot authenticate a click,
  and the classic connectors are retired. Notification only, and not chosen even for that.
- **A bot that writes approvals straight into the participant store.** Duplicates the worker's
  transition, hold and revocation logic and creates a second writer of `CRM#` records.
- **A bot whose decisions the existing worker corroborates.** The bot writes a durable decision
  record that only its role may write, mirrors the value to HubSpot, and hints the worker
  through the queue the webhook already uses. The worker treats a mirrored value as trusted
  only while a matching record exists. Chosen.

## Decision Outcome

**Teams is a second authority for domain review decisions, behind a flag that is off, and the
approval worker remains the only writer of grants.**

### 1. The notification path

`config/aws/teams-approvals/notifier.mjs` is a second consumer of the submission topic on its
own filtered queue, dead-letter queue, role and alarms, deployed by the top-level stack
`config/aws/teams-approvals-stack.yaml`. For every live `working-group-interest.received.v1`
event it posts one Adaptive Card into the **Signups** channel
(`19:bd69ce445a4a4493854168e8e2c9ffc7@thread.tacv2`) of the OPDA management team, created on
2026-09-16 through Microsoft Graph.

The card shows the applicant's name, organisation, role, email, requested groups, perspective
and submission time, links to the HubSpot record when the CRM sync has settled (it waits up
to ten minutes for that, then links to a search), and carries an Approve and a Reject button
for each requested group. Every button is an `Action.Execute` universal action whose only data
is the registration id and the domain id. A durable `TEAMS#SIGNUP#<registrationId>` record is
written before the post, so a redelivery cannot post twice and an interrupted post is retried
once before it is settled as unknown.

The role can read the intake record, the CRM link and the recorded connector URL, write only
`TEAMS#SIGNUP#*`, and read the bot credential. It holds no CRM credential.

### 2. What is trusted

A click reaches `config/aws/teams-approvals/messages.mjs` through an HTTP API. Nothing in the
request is read as fact before the Bot Framework JWT passes: RS256, audience equal to the bot's
app id, issuer either the Bot Connector or the OPDA tenant, key fetched from the published
well-known set and endorsed for the `msteams` channel, expiry and not-before within five
minutes of skew, and the token's `serviceurl` claim equal to the activity's. The activity must
also name this bot as recipient, this tenant, and a service URL on `smba.trafficmanager.net`.

After that, `from.aadObjectId` is the clicker's verified Entra identity. The clicker is
authorised only if they are a transitive member of the approver group, a stack parameter that
defaults to the management team's own group (`11be8af8-bb86-4258-bd73-fb3dd3db2654`), checked
live through Graph with the bot's single `GroupMember.Read.All` permission.

The decision is then checked against the applicant's own request (the domain must be one they
asked for) and against the CRM's current state (the contact must exist, carry the same email,
and list that domain in its interests, which is the evidence ADR-0085 §1 demands). Only then:

1. A `TEAMS#REVIEW#<contactId>#<domainId>` record is written with the outcome, time, actor
   object id and display name, the Teams message and conversation ids, and a decision id that
   hashes the identifying fields. Only the messages function's role may write this key.
2. The domain's HubSpot review dropdown is set to the same value as an `INTEGRATION` write.
3. A contact hint enters `opda-hubspot-approvals`, the queue the webhook feeds.
4. The card is replaced in place so every reader sees who decided and when.

The worker seam is `externalDecisions` in `createDomainWorker`, the same per-domain override
the Finance import uses, wired to `config/aws/teams-approvals/decisions.mjs`. That source looks
only at domains whose current value is `approved` or `rejected` **and** whose latest history
entry is an `INTEGRATION` write; every other domain follows ADR-0085 unchanged. For those it
reads the record and reconstitutes a trusted decision only when the record is well formed, its
decision id verifies, its outcome equals the mirrored value, the mirror is not older than the
decision, no other edit follows the decision, and the ADR-0085 approval evidence still holds.
Anything else falls through, and the normal policy denies an integration-sourced value.

A later `CRM_UI` edit therefore always wins: it is the latest entry, so no lookup happens. A
Teams rejection after a Teams approval withdraws through the same transition. The webhook that
fires for the mirrored change re-reads the same state and finds the same decision id, so
nothing is applied twice; no separate loop guard is needed or added.

### 3. Audit

Every decision leaves three records: the `TEAMS#REVIEW` record with the Teams user object id,
display name, message id and conversation id; the worker's `CRM#AUDIT` row whose actor is
`teams:<objectId>` and whose decision id is the record's; and the HubSpot property history
entry that corroborates it. The card itself shows the decision to the whole channel. No CRM
data, applicant data or credential is logged by either function.

### 4. Threat model

| Threat | Control |
|---|---|
| A forged or replayed request to the messaging endpoint | JWT verification against the published keys, audience, issuer, expiry, endorsement and service URL. A refused request touches nothing downstream. |
| A replayed genuine click | The record is keyed by contact and domain; a repeat of the same outcome is idempotent and never mirrors or hints again. A different outcome is a new decision. |
| A forged card or button data | Data carries only ids. The registration, the applicant's own selection and the CRM are all re-read on every click. |
| An unauthorised Teams user | Live group membership through Graph; an empty group id denies everyone. Membership of the channel is not enough. |
| A compromised bot secret | It can post and edit cards and read group membership. It cannot write `TEAMS#REVIEW` (that is the Lambda role, not the secret), cannot reach the CRM, and cannot mint a token the endpoint accepts (those are the connector's keys). Rotate with the command below. |
| An integration write to a review dropdown by anything else | Denied exactly as before: without a matching record the worker holds the domain. |
| A human edit between decision and mirror | The record no longer corroborates; the domain falls to the hold until a fresh human edit. |
| A mirror that fails after the record is written | The record stays unmirrored and inert; the clicker is told and can retry or decide in HubSpot. |
| Applicant-controlled text in the card | Link syntax and control characters are neutralised and lengths bounded; unknown groups are not rendered. |

### 5. The flag

`ApprovalsEnabled` on the stack, from the repository variable `OPDA_TEAMS_APPROVALS_ENABLED`,
defaults to `false`. Off, every button answers "Approval in Teams is not enabled yet. Decide
this group in HubSpot for now." before any lookup, and the messages role has no bridge
credential and no permission to send on the approval queue: the code path cannot be reached
and the permissions do not exist. Turning it on is the acceptance of this record.

The notification path has no flag, but nothing subscribes the queue until `BotAppId` is set,
so no message can queue, age or alarm before the bot exists.

### 6. What only the operator can do

The tenant has no Azure subscription, so no Azure Bot resource can be created from the CLI,
and the Teams Developer Portal API refuses tokens from the Azure CLI. The secret container
`opda/teams/signups-bot` was created out of band on 2026-09-16 with a placeholder, as every
other credential container is: the deploy role deliberately holds no Secrets Manager rights.
These steps are manual:

1. In the Teams Developer Portal, Tools, Bot management, New bot: name it `OPDA Signups`.
   Copy the bot id. Under Configure, set the endpoint address to the stack output
   `MessagingEndpoint`, deployed on 2026-09-16 as
   `https://vokiymmp7h.execute-api.eu-west-2.amazonaws.com/teams/messages`. Under Client
   secrets, add one and copy it.
2. Grant the bot's app registration the Graph application permission `GroupMember.Read.All`
   (role id `98830695-27a2-44f7-8c18-0c3ebc9698f6` on the Graph API
   `00000003-0000-0000-c000-000000000000`) with admin consent:

   ```bash
   az ad app permission add --id <bot id> --api 00000003-0000-0000-c000-000000000000 \
     --api-permissions 98830695-27a2-44f7-8c18-0c3ebc9698f6=Role
   az ad sp create --id <bot id>
   az ad app permission admin-consent --id <bot id>
   ```

3. Store the credential, without writing it to disk:

   ```bash
   AWS_PROFILE=opda aws secretsmanager put-secret-value --region eu-west-2 \
     --secret-id opda/teams/signups-bot \
     --secret-string '{"appId":"<bot id>","tenantId":"143540d4-4fbc-4005-882a-29656cd01a36","clientSecret":"<secret>"}'
   ```

4. Set the repository variable `OPDA_TEAMS_BOT_APP_ID` to the bot id and re-run the
   infrastructure workflow, which subscribes the queue.
5. Build the app package with `OPDA_TEAMS_BOT_APP_ID=<bot id> node scripts/package-teams-app.mjs`
   and add it to the OPDA management team (Teams admin centre, Manage apps, Upload new app,
   then add to the team). The installation event records the connector URL.

### 7. Consequences

Reviewers see every signup where they already work, within seconds of submission, with a
link straight to the record. When the flag is on, a decision is one click with a stronger
identity than a shared CRM login and a richer audit trail than CRM history alone. The worker's
logic, holds and revocations are unchanged; the seam is one optional decision source.

The cost is a bot registration to maintain, one more secret to rotate, two more functions and
a queue to watch, and a corroboration rule that must stay exactly aligned with what the mirror
writes. Until the flag is on, the buttons are a promise, and the card says so when clicked.

## Confirmation

Partly confirmed (2026-09-16). The bot exists (`68ec240d-d059-4300-92dd-20931c7b000c`,
registered in the Teams Developer Portal, `GroupMember.Read.All` consented), the app is in the
organisation catalogue and installed in the OPDA management team, the secret is stored, the
stack carries the bot id and the flag is on. The first real connector request exposed a
protocol detail the synthetic tests could not: the Bot Framework key document lists 219 keys
and the validator capped it at 200, so every request was answered 500 before the signature was
checked (commit `dc83b267` raised the cap and added a stage-only failure trace). After the fix
the installation event was accepted and recorded `serviceUrl =
https://smba.trafficmanager.net/uk/<tenant>/` — the tenant's own region, not the EMEA default —
which is why the notifier posts from the recorded value and the default is not a production
path. An unauthenticated request is refused (`400 Request rejected`).

2026-09-17: a real signup posted its card 45 s after the form submit; a click on Approve
reached the endpoint in 6 s, wrote the `TEAMS#REVIEW` record and the CRM mirror in 10 s, and
the approval worker created the provisioning operation 16 s after the click, with the card
updated in place ("Approved by …"). The onboarding worker then refused that operation for 46
minutes: it validated the audit actor as a HubSpot user id, and a Teams decision records
`teams:<Entra object id>` (commit `c849919b` admits the Teams shape and logs a refused
record's class instead of a bare retry count). Still outstanding: a refused click by a
non-member, and a Teams-approved applicant walked through to Teams membership.

## More Information

- ADR-0085 §1 for the approval evidence this reuses and the hold this preserves.
- ADR-0087 for the second-consumer pattern the notifier follows.
- Bot Framework authentication: https://learn.microsoft.com/azure/bot-service/rest-api/bot-framework-rest-connector-authentication
- Universal actions for Adaptive Cards: https://learn.microsoft.com/microsoftteams/platform/task-modules-and-cards/cards/universal-actions-for-adaptive-cards/overview
