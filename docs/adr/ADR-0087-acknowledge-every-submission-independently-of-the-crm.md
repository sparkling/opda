---
status: accepted
date: 2026-09-16
tags: [aws, hubspot, postmark, signup, participants, recruitment, observability, proportionality]
supersedes: []
amends: [ADR-0079, ADR-0084]
depends-on: [ADR-0040, ADR-0084]
implements: []
---

# Acknowledge every submission independently of the CRM

## Context and Problem Statement

ADR-0084 §4 made the applicant's acknowledgement an outcome of the CRM sync: the worker
emailed the applicant only once the HubSpot operation reached a terminal state whose reason
was in an "acknowledged" set. That coupling was wrong, and it failed in production.

Live evidence on 2026-09-16, cross-referencing the intake table against `opda-participants`:

| Registration | Submitted | CRM outcome | Acknowledgements | Delay |
|---|---|---|---|---|
| `7292174a` | 09-09 01:09 | `pending-applicant-created` | 0 of 2 | — |
| `cc62872b` | 09-09 18:12 | `repeat-application` | 0 of 2 | — |
| `c3377503` | 09-15 15:15 | `existing-contact` | 0 of 1 | — |
| `d954a0a9` | 09-15 16:30 | `repeat-application` | 0 of 1 | — |
| `60dbfd09` | 09-15 21:48 | `pending-applicant-created` | 2 of 2 | 366 s |
| `a23a2537` | 09-15 23:56 | `repeat-application-reviewed` | 1 of 1 | 1140 s |

Four of six applicants received nothing. The two that did waited six and nineteen minutes.

The six-minute delay has a specific cause. At 21:48:45 the sync function failed at
construction with `Invalid acknowledgement: pin contains an unsupported field` — a template
pin defect in the **email** path — and that failure blocked the **CRM contact creation** for
six minutes, because one function held both jobs and built both clients eagerly. The safety
machinery for the non-critical path took down the critical one.

An audit of the same surface found three further defects:

- The CRM throttles — one automatic creation or task per email per 24 hours, 100 new contacts
  per day — were written to protect HubSpot, but because the acknowledgement was downstream of
  them they also withheld receipts for up to twelve hours, or permanently when no contact could
  be resolved.
- Every `AlarmTopicArn` parameter in every stack was supplied by nothing. All eight deployed
  CloudWatch alarms had zero alarm actions: a dead-letter queue would have alerted no one.
- `opda-public-submission-events`, the shared fan-out queue from ADR-0084 §4.2, had no consumer
  at all. Every submission and newsletter event accumulated in it unread until retention
  dropped it (oldest message 16.7 hours and rising when measured).

## Decision Drivers

The person who filled in the form is owed a reply, and that obligation does not depend on
what a CRM makes of them. Keep independent concerns in independent failure domains. Prefer the
smallest state vocabulary that some consumer actually reads. Do not deploy monitoring that
cannot reach anyone.

## Considered Options

- **Keep one worker, reorder it.** Acknowledge before syncing, in the same function. Fixes the
  ordering but keeps one credential set, one deploy and one blast radius: an email-template
  defect would still be able to stop a CRM write.
- **Acknowledge from the public request handler.** Fastest possible, but it puts an external
  provider in the request path that ADR-0084 §4.1 deliberately keeps free of one, and a send
  before persistence cannot be made idempotent.
- **A second consumer on the existing submission topic.** Chosen.

## Decision Outcome

**The acknowledgement is a property of the submission, not an outcome of the CRM.**

`config/aws/acknowledgement` is its own Lambda, on its own SNS-filtered queue and dead-letter
queue, with its own IAM role, its own alarms and its own deploy. It holds the Postmark
credential; the CRM bridge no longer does. It cannot reach HubSpot: it imports no CRM client
and has no bridge credential, and a test asserts both.

It sends once per requested working group whenever four conditions hold, all of them properties
of the submission itself: the intake record is live and unexpired, its privacy-notice version is
the reviewed one, no suppression record exists for the registration or the email, and every
requested group is real. Nothing else is consulted. A CRM match, throttle, daily budget, outage
or unresolvable contact can delay a staff review task; none of them can delay or withhold a
receipt. This replaces the `ACKNOWLEDGED_REASONS` gate in ADR-0084 §4.4, and supersedes the
2026-09-16 amendment there that tied a repeat application's acknowledgement to its review task.

`/join` now says a confirmation email follows for each chosen group, because one always does.

### 1. What each worker owns

| Worker | Owns | Credential | May fail for |
|---|---|---|---|
| `opda-application-acknowledgement` | The receipt, one per group | Postmark, read-only | Minutes. Alarms at 15. |
| `opda-hubspot-signup-sync` | The CRM contact or review task | HubSpot bridge | Hours. Throttles are its own. |

Both subscribe the same `working-group-interest.received.v1` event from the shared topic with
their own filtered queue. Neither can see the other's records: the acknowledgement role can
write only `SYNC#ACK#*` and read only `SYNC#SUPPRESS#*`.

### 2. Durable send records

One record per `(registration, working group)` at `SYNC#ACK#<registrationId>#<groupId>`, written
**before** the POST so a crash cannot produce a second copy. A record is resumable only while it
is `sending` (a 120-second lease) or `retry` (a provider asked us to come back, so the request was
refused and never dispatched). Every other value is settled and is never sent again, including
the pre-2026-09-16 outcome states `accepted`, `rejected`, `suppressed` and `unknown`, which
remain valid stored data. A send whose outcome is unknown settles as `done`/`outcome-unknown`
rather than repeating: a dispatched email cannot be recalled.

### 3. Sync state vocabulary

The CRM sync had four states across two records and eleven terminal reasons. Exactly one
consumer reads any of it — `hubspot-approval` asks whether a claim is `synced` — so the
vocabulary collapses to what that question needs:

- `SYNC#APPLICATION#<id>`: **`synced`** (we created this contact) or **`closed`** (we did not,
  and `reason` says why). The previous `quarantined` and `suppressed` were never distinguished
  by any consumer, and `quarantined` misdescribed the ordinary case of an applicant the CRM
  already knew. The `pending` state is removed: a record now exists only once there is a
  decision, so its existence is the whole idempotency guard. Staff work from the HubSpot task,
  never from this column.
- `SYNC#EMAIL#<emailDigest>`: the per-email mutex and the home of the canonical participant
  reference. `open`, `creating`, `reviewing` and `retry` are each load-bearing and keep their
  leases; `held` is renamed `open` because nothing was being withheld.
- `pending-applicant-created` is renamed `contact-created`.

Removed as write-only, read by nothing: `sourceFormVersion`, `sourceOptionSetVersion`,
`adapterOptionSetVersion`, `sourceExpiresAt`, `lastSuccessfulSyncAt` (a duplicate of
`updatedAt`) and `reviewKey` (derivable from the `emailHash` on the same record).

### 4. Digests

- `emailDigest` is retained as a **key normaliser** — fixed length, lower-cased, no delimiter
  collisions — and is documented as such. It is not a confidentiality control: the address is
  stored in the intake record and on CRM mappings in the same table.
- `evidenceDigest` and the `source-changed` outcome are **removed**. They guarded a mutation no
  code path can produce: the intake record is written once under `attribute_not_exists`, the
  stream publisher drops `MODIFY` for registrations, and nothing writes `deletedAt` or
  `erasedAt`. The `authorizeCreation` transaction already pins `createdAt` and `status` at the
  moment of creation, which is the guarantee that actually mattered.
- The webhook `receiptId` is **removed**. It was computed, transmitted, validated and discarded;
  replayed hints are safe by design because the worker re-reads live state for every contact.
- Postmark template fingerprints are **retained** — they stop an edited template being sent —
  but they now fail only the send. This is the defect that took the CRM down.

The intake record keeps its single-valued `status: received` attribute deliberately: it is the
consent evidence, it is load-bearing in the `authorizeCreation` condition, and changing that
record is not worth the migration risk for one redundant attribute.

### 5. Operational alerting

`config/aws/operations-stack.yaml` creates `opda-operations-alarms` and exports its ARN. Every
service stack imports it, so no stack may declare an alarm destination that nothing supplies.

Two destinations, both operator-owned repository variables, both confirmed once by SNS email:

- **`OPDA_OPERATIONS_ALARM_TEAMS_CHANNEL`** — the email address of the **Incidents** channel in
  the private *OPDA management team*, created 2026-09-16. Every alarm posts there and Teams
  mobile pushes it, which is what reaches a person at 03:00. Verified the same day: a test
  notification published to the topic appeared in the channel **6 seconds** later.
- **`OPDA_OPERATIONS_ALARM_EMAIL`** — `smartdata@openpropdata.org.uk`, for the record and for
  anyone not in Teams.

SMS was considered and rejected on 2026-09-16, not on cost but on capability: the account is
in the SNS SMS sandbox with no origination identity, so it cannot deliver an SMS at all —
`CreateSMSSandboxPhoneNumber` fails with "No origination entities available to send". A
subscription would have been a destination that discards every message, the defect this ADR
exists to remove. Enabling it would need a registered UK sender ID, production SMS access
and a spend-limit increase; a Teams channel needs none of that and pushes to the same phone.

The unconsumed `opda-public-submission-events` queue and its subscription are removed. The
boundary publishes; consumers own their queues. The publisher keeps its own failure queue for
stream batches it could not place on the topic.

### 6. Consequences

Acknowledgement latency becomes seconds and is bounded by SQS delivery, not by HubSpot. An
email defect can no longer stop a CRM write, and a CRM defect can no longer stop an email. Two
functions exist where one did, each with a smaller role. Four applicants who were dropped
before this change are re-queued by clearing their send records, which the durable
`SYNC#ACK#*` design makes safe.

The cost is a second deployed function and a second queue to watch. That is proportionate: the
first one, watched by nobody, silently failed four of six applicants.
