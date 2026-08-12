# Postmark working-group invitation delivery plan

| Field | Value |
|---|---|
| Status | In progress; Waves 2 and 3 scheduled for 2026-08-12 and 2026-08-13 at 10:00 Europe/London |
| Prepared | 2026-08-05 |
| Updated | 2026-08-11 |
| Initial scope | Finance and Banking Working Group |
| Reusable scope | None; later working groups use the ADR-0069 public campaign, selective trade/professional-body outreach and sign-up |

## Governing decision and authority

[ADR-0065](../adr/ADR-0065-ai-assisted-evidence-to-model-workflow.md) is
**Proposed**, last updated 2026-08-11. It separates Microsoft access provisioning
from custom invitation delivery. This plan operationalises the Postmark follow-up part
of ADR-0065; it does not accept the ADR or authorise later waves.

Henrik authorised preparation and delivery of the named 50-recipient Wave 1 on
2026-08-05 and scheduled the named 100-recipient Wave 2 for 10:00 Europe/London on
2026-08-12. The sender binds that authority to the immutable digest produced by the
final dry run. On 2026-08-11 Henrik also authorised the remaining eligible recipients
as Wave 3 at 10:00 Europe/London on 2026-08-13. Because that population depends on Wave
2 and live acceptance and suppression state, its exact digest is generated at the
start of the scheduled job and passed unchanged into execution. A changed population
between those two operations blocks the send. A test, dry run, earlier approval or
approval of another wave is not reusable authority.

## Goal

Deliver a recipient-specific Postmark follow-up to each eligible participant who has
not already accepted, while protecting unique Microsoft redemption
links, preserving unsubscribe choices and providing enough delivery evidence to stop
before a small problem becomes a full-roster problem.

The rollout is complete when:

- the send population has been derived from the existing not-accepted mailing list,
  live Microsoft identity state and Postmark suppressions;
- every selected recipient maps to exactly one email address, one Entra identity and
  one current `login.microsoftonline.com` redemption URL;
- the existing Postmark template renders valid HTML and plain text with the correct
  recipient name and URL;
- SPF, DKIM and DMARC remain aligned for `smartdata@openpropdata.org.uk`;
- each approved wave has a complete per-message receipt and no ambiguous retry state;
- bounces, complaints, unsubscribes and Microsoft invitation acceptances have been
  reconciled before the next wave;
- no recipient is included in more than one Postmark rollout wave; and
- a privacy-safe completion summary records counts and outcomes without publishing
  addresses, tokens or redemption URLs.

## Non-goals

- Sending newsletters, promotional marketing or a model-update campaign.
- Building a general contact-management or mailing-list system.
- Replacing Microsoft Teams or SharePoint access provisioning.
- Treating an open event as proof of inbox placement or enabling click tracking.
- Sending all working-group messages automatically.
- Buying or warming a dedicated IP. This volume uses Postmark's managed shared pool.
- Falling back to a Microsoft 365 bulk send if Postmark or a preflight gate fails.

## Verified current state

The following is the starting state on 2026-08-05:

- The ignored operational roster contains 370 rows. Live Graph records
  370 Team roster members, 370 unique Team identities, 366 SharePoint participants,
  152 isolated organisation folders and four Teams-only generic-provider accounts.
- The ignored invitation manifest contains 370 rows: 369 non-empty, unique redemption
  URLs on `login.microsoftonline.com` and one existing internal member without a
  redemption URL. No URL is duplicated.
- Live Microsoft Graph currently resolves the roster to 60 accepted guests, 309
  pending guests and one internal member.
- Microsoft generated no automatic invitation emails during provisioning.
- OPDA separately sent 367 custom invitations through Microsoft Graph on 2026-07-29;
  the operational ledger records HTTP 202 acceptance for every request. This Postmark
  rollout is intentionally a second delivery attempt because many participants
  reported that the first message was not received. A previous Microsoft message does
  not exclude someone from the Postmark rollout.
- Postmark server `20188829`, **OPDA Working Group Invitations**, is Live.
- Live template `45998430`, alias
  `finance-banking-working-group-invitation`, is active. Its subject is
  “You’re invited to help shape the Smart Property Data Trust Framework”.
- The live HTML is unchanged from the carefully reviewed source template. The
  plain-text counterpart is present and Postmark's template validator accepts the
  HTML, text and subject.
- Server defaults are `TrackOpens: true` and `TrackLinks: None`. Future HTML messages
  include Postmark's open-tracking pixel without rewriting their links.
- Two separately approved Postmark test messages have been sent to Henrik only.
  Postmark recorded successful delivery for both; the later test recorded one open and
  one click while its per-message link tracking was still enabled. Current server and
  Wave 1 settings are opens on and links off.
- Wave 1 contained 50 recipients. Postmark records all 50 as `Sent`, with no bounce,
  complaint or Broadcast suppression recorded when reconciled on 2026-08-11. No open
  event was recorded; open tracking remains an approximate signal rather than proof of
  delivery or readership.
- The ignored not-accepted mailing list was refreshed from live acceptance on
  2026-08-05 and contains the 309 current pending candidates.

Current acceptance, suppression and deliverability state is deliberately not frozen
in this document because it changes. The sender must query it again immediately before
every wave.

## Sources of truth

| Concern | Source of truth | Handling |
|---|---|---|
| Intended participants | Ignored `source/_inbox/finance-banking-working-group/participants.csv` | Canonical roster; never reproduce it in tracked documentation |
| Wave candidate list | Ignored `pending-invitation-mailing-list.csv` | Existing list requested by Henrik; intersect with live pending acceptance before each wave |
| Entra identity and acceptance | Live Microsoft Graph | Re-query before every wave |
| Redemption URL | Ignored `invite-redeem-urls.csv` reconciled with live identity state | Mode `0600`; never log or commit URLs |
| Team and SharePoint provisioning | Microsoft Graph, Microsoft 365 and the ignored validation summary | Read-only validation during email preflight |
| HTML content | [HTML template](../templates/finance-banking-working-group-invitation-email.html) | Existing design remains canonical |
| Plain-text content | [plain-text template](../templates/finance-banking-working-group-invitation-email.txt) | Must stay semantically aligned with HTML |
| Inline brand asset | `docs/templates/assets/opda-email-logo.png` | Attach as CID `opda-logo`; do not use a remote image |
| Unsubscribes, hard bounces and complaints | Postmark Broadcast-stream suppressions | Exclude on every derived send |
| Delivery receipt | Ignored mode-`0600` append-only wave ledger plus Postmark message activity | Store recipient email, wave, Message ID and result privately; no personal data or secrets in tracked files |
| Open indication | Postmark first-open activity | Report separately as an approximate secondary signal, never as proof of delivery or readership |

Generated wave manifests are immutable operational snapshots of the existing mailing
list after live exclusions. They are identified by a SHA-256 digest.

## Action plan

### Phase 0 — preserve and harden the existing template

- **Status:** Completed 2026-08-05
- **Cost:** Low
- **Precondition:** The existing live template and its source HTML are recoverable.
- **Effect:** A multipart template with embedded branding, delivery evidence and
  first-open indication is ready for controlled delivery.

Completed work:

1. Recovered the existing live template rather than creating a replacement.
2. Proved that its HTML matched the repository source apart from transport newline
   normalisation.
3. Added and validated the plain-text counterpart.
4. Updated the same live template without changing its ID, alias, subject or HTML.
5. Enabled server-wide open tracking while keeping link tracking disabled.
6. Confirmed that no message was sent by these configuration changes.

### Phase 1 — reconcile the live baseline

- **Status:** Completed for Wave 2 on 2026-08-11
- **Cost:** Low; read-only external checks
- **Precondition:** Microsoft and Postmark authentication is available.
- **Effect:** One current, explainable candidate population and an immutable baseline
  digest exist without sending mail.

Actions:

1. Re-run the existing access-rollout validation without provisioning or changing
   membership.
2. Query live Entra invitation acceptance and identity aliases. Resolve the 368-versus-
   370 ADR drift by identity ID, not by display name.
3. Start from the existing not-accepted mailing list and exclude:
   - the existing internal member who needs no redemption URL;
   - people whose invitation is already accepted;
   - identities with no current unique redemption URL;
   - Postmark suppressions, including unsubscribes, hard bounces and complaints; and
   - any row whose roster address, Entra identity or invitation target is ambiguous.
4. Treat generic-provider accounts as Teams-only, while still allowing them to receive
   a Teams invitation when they otherwise pass the gates.
5. Validate that every remaining URL is HTTPS, uses the approved Microsoft invitation
   host and appears exactly once.
6. Produce an ignored baseline summary and immutable candidate digest. Report counts
   only in tracked or conversational output.

**QA gate A:** zero duplicate identities, duplicate URLs, missing URLs, unapproved URL
hosts, accepted invitees, suppressed recipients or unresolved aliases. Failure blocks
all later phases.

### Phase 2 — implement the dry-run-first sender

- **Status:** Completed for the Wave 2 approval candidate on 2026-08-11
- **Cost:** Medium; one sender, synthetic tests and an ignored ledger
- **Precondition:** QA gate A passes.
- **Effect:** The exact messages for an approved wave can be rendered, inspected and
  hashed without being sent; an authorised execution can be reconciled safely.

Implement a repository sender with these invariants:

- dry run is the default and performs no Postmark send call;
- execution requires both an explicit `--execute` switch and the exact digest printed
  by the final dry run;
- execution requires Henrik's explicit authority for the named wave; when he
  authorises a future dynamically derived population, the scheduled job may generate
  its digest immediately before execution and must pass that exact digest unchanged;
- the macOS Keychain supplies the Postmark token; tokens never enter command output,
  source, manifests or logs;
- every message uses the existing template alias, the `broadcast` Message Stream,
  `smartdata@openpropdata.org.uk`, the recipient's `display_name` and that recipient's
  own `access_url`;
- the tracked logo is attached inline with CID `opda-logo`;
- `TrackOpens` is true and `TrackLinks` is `None` at message level; the dedicated
  server also enforces open tracking and keeps link tracking disabled;
- one recipient-specific message is constructed per participant, although bounded
  sub-batches may be submitted through Postmark's template batch endpoint;
- every per-message response is inspected because Postmark can return HTTP success
  while an individual batch item has an error;
- an append-only, mode-`0600`, ignored ledger records batch digest, recipient email,
  Postmark Message ID, submission time and result so each wave can be audited;
- ambiguous network outcomes are not retried automatically; they are reconciled
  against Postmark activity first; and
- logs contain counts and opaque IDs, not addresses or redemption URLs.

Tests use synthetic recipients and URLs. They cover the default no-send mode, the exact
digest execution gate, deterministic cross-domain selection, recipient template
variables, CID attachment and open-on/link-off tracking flags. Live dry runs validate
mailing-list uniqueness, Microsoft URL hosts, current acceptance, suppressions and the
active Postmark template and stream.

**QA gate B:** unit tests pass, Postmark validates the live template, a dry run renders
every selected message, the final candidate digest is stable across two clean runs and
the outbound message count remains unchanged.

QA gate B passed for Wave 2 with 63 repository tests and two identical dry runs. The
prepared Wave 2 contains 100 recipients across 100 receiving organisations/domains.

### Phase 3 — final deliverability preflight

- **Status:** Completed for Wave 2 on 2026-08-11
- **Cost:** Low
- **Precondition:** QA gate B passes.
- **Effect:** A named first wave is ready for an approval decision.

Immediately before a wave:

1. Re-query Microsoft acceptance and Postmark suppressions and regenerate the wave.
2. Confirm the Postmark account and server are Live and the sender domain remains
   verified.
3. Confirm the `broadcast` stream uses Postmark unsubscribe handling and that the
   visible `pm:unsubscribe` link remains in both template variants.
4. Confirm SPF, DKIM and DMARC alignment and run Postmark's content/template checks.
5. Confirm open tracking remains enabled and link tracking remains disabled at both
   server and per-message level.
6. Review the rendered HTML and text using a synthetic model; do not send another live
   test unless separately approved.
7. Stratify the first wave across organisations and receiving domains rather than
   concentrating it in one bank or provider.
8. Print the exact recipient count, organisation/domain distribution, exclusions,
   template ID, subject, stream, batch digest and proposed send window without printing
   personal data or URLs.

**QA gate C:** Henrik explicitly approves the named wave and its selection rule.
Execution must also present the exact digest from its final dry run; a changed live
population therefore blocks the send. Without both conditions, stop after the report.

### Phase 4 — staged live rollout

- **Status:** In progress; Wave 1 sent on 2026-08-05; Wave 2 scheduled for 2026-08-12
  and Wave 3 for 2026-08-13, both at 10:00 Europe/London
- **Cost:** Three controlled send windows plus at least two observation intervals
- **Precondition:** QA gate C passes for the specific wave.
- **Effect:** Invitations are delivered gradually, with evidence reviewed before volume
  increases.

The default sequence is:

1. **Wave 1 — 50 recipients.** Prefer broad organisation and receiving-domain coverage
   with no avoidable concentration.
2. **Observe for at least one working day.** Reconcile every Postmark result, bounce,
   complaint, unsubscribe, recipient reply and Microsoft acceptance.
3. **Wave 2 — 100 recipients.** Re-derive the population, issue a new digest and obtain
   new explicit approval.
4. **Observe through the following working-day send window** and repeat the automated
   reconciliation.
5. **Wave 3 — remaining eligible recipients.** Re-derive and digest the population at
   the scheduled start. The 2026-08-11 instruction authorises this selection rule. The
   job still blocks unless Wave 2 has exactly 100 reconciled ledger acceptances, all
   100 Postmark records have settled as `Sent`, there is no spam complaint, the
   hard/policy bounce rate remains below 3%, and the live Wave 3 digest remains
   unchanged between dry run and execution. Suppressed recipients are excluded from
   the remaining mailing list rather than retried.

Wave 1 used digest
`9cb44ffc9c517d34a9bd6092a4d231e144279246e3df4a8b4626e5ed327bb28a`.
Postmark accepted all 50 submissions, returned 50 unique message IDs and subsequently
reported all 50 messages as `Sent`. The private append-only ledger and immutable
snapshot record the exact recipients. These are submission and sending results, not
proof that every receiving mail system placed the message in an inbox.

Wave 2 uses digest
`618bc3fe11894a57f834d306275fa80d41bd2169d0b96ace9db800b03a4285e5`.
It is scheduled as a one-shot local job for 10:00 Europe/London on 2026-08-12. The
sender re-queries Microsoft acceptance and Postmark suppressions at execution time.
Any change to the selected population changes the digest and blocks the send instead
of silently changing the approved audience.

Wave 3 is scheduled as a one-shot local job for 10:00 Europe/London on 2026-08-13. Its
size and digest are intentionally not fixed in advance: it selects every recipient who
remains eligible after Waves 1 and 2, current Microsoft acceptance and current
Postmark suppressions. The private execution log will record only the resulting count
and digest, while the immutable snapshot and append-only ledger retain the exact
operational population.

Prefer a staffed UK working-day window, normally 09:30–11:30 Europe/London, so that
OPDA can investigate blocks and replies the same day. Timing is an operational support
choice, not a claim that a particular hour bypasses spam filtering.

The staged sequence is primarily a domain-reputation and failure-containment measure.
Postmark's shared IP pool is already managed; a dedicated-IP warm-up is neither
available nor appropriate at this volume. Volume increases only after reviewing the
previous wave.

Continue only when:

- there are no identity, URL, template, authentication or idempotency errors;
- there are no spam complaints;
- the hard/policy bounce rate is below 3%, with no concentrated block at a receiving
  organisation;
- all Postmark batch items have a reconciled outcome; and
- replies do not reveal a material expectation, content or access problem.

Any spam complaint, authentication failure, wrong-recipient or wrong-link evidence,
ambiguous duplicate, Postmark account pause, or bounce rate at or above 3% pauses the
rollout. This is deliberately stricter than Postmark's service maximums.

### Phase 5 — reconcile and close

- **Status:** Pending
- **Cost:** Low to medium
- **Precondition:** Every authorised wave has settled or has an explicit exception.
- **Effect:** The Finance and Banking rollout has an auditable result.

Actions:

1. Reconcile the append-only ledger with Postmark activity and Microsoft acceptance.
2. Classify outcomes as delivered-to-server, first-open observed, bounced, blocked,
   suppressed, unsubscribed, accepted or still pending. Do not count an out-of-office
   response as non-delivery, do not equate server acceptance with inbox placement, and
   do not treat the absence or presence of an open event as definitive readership.
3. Contact blocked organisations through an already authorised route only when human
   follow-up is approved; do not blindly resend.
4. Produce a privacy-safe completion report with wave sizes, authentication state,
   delivery, approximate first-open, bounce/complaint/suppression counts and acceptance
   movement.
5. Update ADR-0065's facts, `updated` date and implementation state when OPDA decides
   whether to accept the workflow. The plan and ADR must not retain the 368-versus-370
   discrepancy.
6. Do not generalise this roster-based invitation campaign to later working groups.
   Those groups will recruit through a social-media campaign and an explicit sign-up
   journey rather than an email list OPDA does not possess.

## Risk responses and replanning triggers

| Trigger | Required response |
|---|---|
| Corporate gateway blocks a domain | Pause that domain, inspect the SMTP response, and seek approved mail-administrator allowlisting; do not repeatedly resend |
| Stale or redeemed invitation URL | Remove the recipient from the wave, silently reset or reissue through Microsoft, revalidate identity and generate a new digest |
| Wrong recipient or URL | Stop all sends immediately, preserve evidence, invalidate affected links where possible and prepare a human-reviewed incident response |
| Bounce rate reaches 3% or clusters by provider | Stop volume growth, clean or verify affected rows and resume with a smaller approved wave |
| Any spam complaint | Pause, verify whether recipients expected the message and review content, provenance and list eligibility before replanning |
| Postmark or Microsoft unavailable | Wait and rerun preflight; never substitute Microsoft 365 bulk mail or an unapproved provider |
| Sender code crashes after submission | Query Postmark using recorded batch metadata before deciding whether any item is safe to retry |
| Roster, template or ADR changes | Invalidate existing dry-run digests and regenerate from the new source state |

## Evidence and controls

- [Postmark Templates API](https://postmarkapp.com/developer/api/templates-api)
  documents validation, in-place updates and recipient-specific template batches.
- [Postmark Message Streams API](https://postmarkapp.com/developer/api/message-streams-api)
  defines Broadcast streams and required unsubscribe management.
- [Postmark Suppressions API](https://postmarkapp.com/developer/api/suppressions-api)
  is the live source for unsubscribes, hard bounces and complaints.
- [Postmark open tracking](https://postmarkapp.com/developer/user-guide/tracking-opens)
  defines the tracking pixel and its blocked-image and privacy-proxy limitations.
- [Postmark domain warm-up guidance](https://postmarkapp.com/guides/how-to-warm-up-a-domain)
  supports gradual, evidence-led volume increases; its published troubleshooting
  threshold treats bounce rates above 3% as high.
- [Postmark bounce and complaint guidance](https://postmarkapp.com/support/article/troubleshooting-email-delivery-issues)
  says a healthy bounce rate should be well under 5% and complaints below 0.1%.
- [Microsoft Graph invitation resource](https://learn.microsoft.com/en-us/graph/api/resources/invitation?view=graph-rest-1.0)
  defines the recipient-specific redemption URL used by this workflow.

## Next authorised work

Execute Wave 2 at 10:00 Europe/London on 2026-08-12 if its live preflight reproduces
the approved digest. Execute the remaining eligible Wave 3 at 10:00 Europe/London on
2026-08-13 only if the Wave 2 completion and delivery gates pass. After Wave 3,
reconcile Postmark outcomes, replies and Microsoft acceptances and close the rollout.
