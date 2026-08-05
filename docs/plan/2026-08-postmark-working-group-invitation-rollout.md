# Postmark working-group invitation delivery plan

| Field | Value |
|---|---|
| Status | Proposed; partially implemented; no bulk send authorised |
| Prepared | 2026-08-05 |
| Updated | 2026-08-05 |
| Initial scope | Finance and Banking Working Group |
| Reusable scope | Later Smart Property Data Trust Framework working groups |

## Governing decision and authority

[ADR-0065](../adr/ADR-0065-ai-assisted-evidence-to-model-workflow.md) is
**Proposed**, last updated 2026-07-29. It separates Microsoft access provisioning
from custom invitation delivery and states that no bulk custom-email send has been
approved. This plan operationalises that invitation-delivery part of ADR-0065; it does
not accept the ADR or authorise a send.

Creating or implementing this plan is **not permission to email anyone**. Every live
wave requires Henrik's explicit approval of that named wave and its immutable batch
digest. A test, dry run, earlier approval or approval of another wave is not reusable
authority.

## Goal

Deliver one expected, recipient-specific working-group invitation to each eligible
participant who has not already accepted, while protecting unique Microsoft redemption
links, preserving unsubscribe choices and providing enough delivery evidence to stop
before a small problem becomes a full-roster problem.

The rollout is complete when:

- the send population has been derived from the canonical roster, live Microsoft
  identity state and Postmark suppressions without maintaining a second mailing list;
- every selected recipient maps to exactly one email address, one Entra identity and
  one current `login.microsoftonline.com` redemption URL;
- the existing Postmark template renders valid HTML and plain text with the correct
  recipient name and URL;
- SPF, DKIM and DMARC remain aligned for `smartdata@openpropdata.org.uk`;
- each approved wave has a complete per-message receipt and no ambiguous retry state;
- bounces, complaints, unsubscribes and Microsoft invitation acceptances have been
  reconciled before the next wave;
- no recipient is sent the same invitation twice; and
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

- The ignored operational roster contains 370 rows. The validation summary records
  370 Team roster members, 370 unique Team identities, 366 SharePoint participants,
  152 isolated organisation folders and four Teams-only generic-provider accounts.
- The ignored invitation manifest contains 370 rows: 369 non-empty, unique redemption
  URLs on `login.microsoftonline.com` and one existing internal member without a
  redemption URL. No URL is duplicated.
- ADR-0065 says the 370 entries represented 368 unique identities on 2026-07-29. The
  newer 2026-08-04 validation summary says 370 unique identities. That is real drift;
  live Microsoft Graph state must resolve it before candidate selection.
- Microsoft generated no automatic invitation emails during provisioning.
- Postmark server `20188829`, **OPDA Working Group Invitations**, is Live.
- Live template `45998430`, alias
  `finance-banking-working-group-invitation`, is active. Its subject is
  “You’re invited to help shape the Smart Property Data Trust Framework”.
- The live HTML is unchanged from the carefully reviewed source template. The
  plain-text counterpart is present and Postmark's template validator accepts the
  HTML, text and subject.
- Server defaults are `TrackOpens: true` and `TrackLinks: None`. Future HTML messages
  include Postmark's open-tracking pixel without rewriting their links.
- Two separately approved test messages have been sent to Henrik only. Both predate
  the enabled server-wide open tracking and are not retroactively tracked. Postmark
  recorded a successful SMTP delivery event for the latest test. No bulk send has
  occurred.

Current acceptance, suppression and deliverability state is deliberately not frozen
in this document because it changes. The sender must query it again immediately before
every wave.

## Sources of truth

| Concern | Source of truth | Handling |
|---|---|---|
| Intended participants | Ignored `source/_inbox/finance-banking-working-group/participants.csv` | Canonical roster; never reproduce it in tracked documentation |
| Entra identity and acceptance | Live Microsoft Graph | Re-query before every wave |
| Redemption URL | Ignored `invite-redeem-urls.csv` reconciled with live identity state | Mode `0600`; never log or commit URLs |
| Team and SharePoint provisioning | Microsoft Graph, Microsoft 365 and the ignored validation summary | Read-only validation during email preflight |
| HTML content | [HTML template](../templates/finance-banking-working-group-invitation-email.html) | Existing design remains canonical |
| Plain-text content | [plain-text template](../templates/finance-banking-working-group-invitation-email.txt) | Must stay semantically aligned with HTML |
| Inline brand asset | `docs/templates/assets/opda-email-logo.png` | Attach as CID `opda-logo`; do not use a remote image |
| Unsubscribes, hard bounces and complaints | Postmark Broadcast-stream suppressions | Exclude on every derived send |
| Delivery receipt | Ignored append-only wave ledger plus Postmark message activity | Store Message IDs and results; no secrets in tracked files |
| Open indication | Postmark first-open activity | Report separately as an approximate secondary signal, never as proof of delivery or readership |

Generated wave manifests are immutable operational snapshots, not separately maintained
mailing lists. They are recreated from the sources above and identified by a SHA-256
digest.

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

- **Status:** Pending
- **Cost:** Low; read-only external checks
- **Precondition:** Microsoft and Postmark authentication is available.
- **Effect:** One current, explainable candidate population and an immutable baseline
  digest exist without sending mail.

Actions:

1. Re-run the existing access-rollout validation without provisioning or changing
   membership.
2. Query live Entra invitation acceptance and identity aliases. Resolve the 368-versus-
   370 ADR drift by identity ID, not by display name.
3. Start from the canonical roster and exclude:
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

- **Status:** Pending
- **Cost:** Medium; one sender, synthetic tests and an ignored ledger
- **Precondition:** QA gate A passes.
- **Effect:** The exact messages for an approved wave can be rendered, inspected and
  hashed without being sent; an authorised execution can be reconciled safely.

Implement a repository sender with these invariants:

- dry run is the default and performs no Postmark send call;
- execution requires both an explicit `--execute` switch and the exact digest printed
  by the final dry run;
- Codex does not invoke execution until Henrik explicitly approves that named digest;
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
- an append-only ignored ledger records batch digest, opaque recipient ID, Postmark
  Message ID, submission time and result;
- ambiguous network outcomes are not retried automatically; they are reconciled
  against Postmark activity first; and
- logs contain counts and opaque IDs, not addresses or redemption URLs.

Tests use synthetic recipients and URLs. They cover roster normalisation, alias and
duplicate rejection, accepted/suppressed exclusion, URL-host allowlisting, template
variables, CID attachment, dry-run no-send behaviour, digest mismatch, per-message
batch errors, open-on/link-off tracking flags, ledger idempotency and crash recovery.

**QA gate B:** unit tests pass, Postmark validates the live template, a dry run renders
every selected message, the final candidate digest is stable across two clean runs and
the outbound message count remains unchanged.

### Phase 3 — final deliverability preflight

- **Status:** Pending
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

**QA gate C:** Henrik explicitly approves the named wave and exact digest. Without that
approval, stop after the report.

### Phase 4 — staged live rollout

- **Status:** Pending and not authorised
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
4. **Observe for at least one working day** and repeat the reconciliation.
5. **Wave 3 — remaining eligible recipients.** Re-derive, digest and obtain a third
   explicit approval. If the remaining population or evidence justifies it, split this
   into smaller waves rather than increasing risk.

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

### Phase 5 — reconcile, close and generalise

- **Status:** Pending
- **Cost:** Low to medium
- **Precondition:** Every authorised wave has settled or has an explicit exception.
- **Effect:** The Finance and Banking rollout has an auditable result and the safe parts
  can be reused for later working groups.

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
6. Generalise the sender through configuration for later working groups only after the
   first rollout is proven. Reuse the Trust Framework-wide Broadcast suppression
   semantics expressed by the template; do not create parallel manually maintained
   unsubscribe lists.

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

The next safe action is to implement Phases 1 and 2 and stop after QA gate B. That work
may read Microsoft and Postmark state but must not call a Postmark send endpoint. Live
delivery begins only after a separate, explicit Wave 1 approval.
