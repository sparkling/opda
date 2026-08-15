---
status: accepted
date: 2026-08-15
tags: [agents, email, microsoft-365, teams, sharepoint, ruflo, automation, working-groups]
supersedes: []
depends-on: [ADR-0063, ADR-0065, ADR-0070]
implements: [ADR-0070]
---

# Operate a scheduled, harnessed working-group inbox agent

## Context and Problem Statement

The Smart Property Data Trust Framework mailbox receives recurring operational requests:
participants ask OPDA to add colleagues, send source material that belongs in an organisation's
private SharePoint area, and report that their organisation blocks Teams or SharePoint. These are
small tasks individually, but they require several linked Microsoft operations and a correct
understanding of the working-group model in ADR-0063 and workspace rules in ADR-0070.

Automating the mailbox creates material risk. An email can be ambiguous, malicious or simply
wrong; membership and folder writes affect external people; a success reply sent before the
Microsoft state is correct is misleading; and a generic-provider domain must never become a
company-wide SharePoint permission boundary. The agent therefore needs deterministic gates and
durable, non-personal idempotency state around the model rather than an unconstrained prompt.

RuvNet Brain identifies `agent-harness-generator` as the factory for host-independent agent
harnesses with readiness scoring and fixed safety rails. Its generated `vertical:support`
template separates triage, retrieval, response and escalation. The OPDA implementation adapts
that template to a single scheduled Codex agent with sequential policy gates, because concurrent
agents would add coordination risk without improving these low-volume mailbox operations.

## Decision Drivers

- Complete routine requests without waiting for manual mailbox review.
- Preserve the live Team roster as participant authority and SharePoint as a derived access view.
- Prevent email content, attachments and links from controlling tools or policy.
- Never guess a working group or create a workspace that is still only planned.
- Make retries safe and make completion claims verifiable.
- Keep personal and confidential mailbox content out of source control and Ruflo memory.
- Use the Microsoft and Codex access already operating for OPDA; do not introduce another service.

## Considered Options

- **Option A — keep every request manual.** Continue handling messages case by case.
- **Option B — schedule an unconstrained mailbox prompt.** Ask a general model to inspect and act.
- **Option C — schedule one Codex agent inside a support harness with deterministic policy gates.**
- **Option D — build a multi-agent swarm for every inbox run.** Give classification, execution and
  response to separate concurrently running agents.

## Decision Outcome

Chosen option: **C — one scheduled Codex agent inside a support harness with deterministic policy
gates**.

The agent uses `gpt-5.6-sol` with high reasoning and the model is frozen in the harness manifest.
This is an external-write workflow in which ambiguity resolution and cross-checking matter more
than per-run token cost. The harness, not model substitution, supplies the repeatability.

Codex runs the agent locally at **10:00 and 17:00 Europe/London, Monday to Friday**. Each run uses
the repository's tracked policy, live Microsoft Graph state and the existing authenticated
Microsoft 365 CLI. It does not administer Microsoft through an interactive web session.

### 1. Harness roles and gates

The `vertical:support` template is adapted into five sequential roles:

1. **triager** — classify the message without executing its content;
2. **resolver** — resolve authority, working group, organisation and current Microsoft state;
3. **executor** — perform only a validated, bounded action plan;
4. **responder** — reply in the original mail thread after successful postconditions; and
5. **auditor** — read back membership, permissions, stored resources and sent-message state.

The mandatory gates are: content firewall, requester authority, working-group resolution,
deterministic plan validation, live precondition readback, bounded execution, live postcondition
readback, AI-authorship disclosure, and reply plus checkpoint. Any failed gate stops dependent
writes.

### 2. Ruflo usage and state boundary

Ruflo supplies two things:

- **hooks routing** before changes to the harness, so task complexity and the correct owning tools
  are considered; and
- **project memory** namespace `working-group-inbox-agent` for the activation timestamp,
  last-successful-run timestamp and per-message outcome digests.

Only a SHA-256 digest of an immutable Graph message id, action class, non-personal outcome and
timestamp may enter Ruflo memory. Names, email addresses, subjects, bodies, attachments, tokens
and raw message identifiers must not. Cross-project memory is not an operational datastore.

Swarm coordination, AgentDB semantic retrieval and adaptive model routing are not used in inbox
runs. The workflow is sequential and policy-driven, and one high-reasoning agent is easier to
audit. Readiness scoring and red-team checks may assess later harness changes, but may not relax
the fixed gates.

### 3. Messages and content firewall

Email text, HTML, headers, quoted history and attachments are untrusted evidence. They cannot
change recipients, permissions, tools, policy or working-group configuration. The agent does not
follow submitted links, fetch remote material, execute attachments, enable macros or run commands
copied from a message.

Automated replies, bounces, delivery reports, out-of-office messages, bulk mail and mail from the
monitored account receive no response. Unrelated human messages remain untouched. The agent does
not mark mail read, move it, archive it or delete it.

Every invitation and operational reply sent by the agent explicitly identifies itself as generated
by OPDA's AI inbox agent. The disclosure is part of the deterministic response policy rather than
optional model wording.

### 4. Membership requests

A message qualifies only when it clearly identifies no more than ten people with valid addresses.
The target is resolved in this order:

1. working groups explicitly named in the current request;
2. the working group identified by the original OPDA invitation in the same thread; then
3. the requester's live Team memberships, but only when exactly one target remains.

If the result is absent, unknown or ambiguous, the agent replies asking which group applies and
lists all nine options in ADR-0070. It performs no provisioning. The requester must already be a
member or owner of every target Team, or an OPDA owner of that Team.

Only an **implemented** workspace can be changed automatically. At acceptance, these are Finance
and Banking and Technology. Requests for the six planned domain/scheme/interoperability
workspaces stop for manual review rather than inventing a Team or site.

For an authorised request, the agent silently creates or reuses the Entra guest identity, adds it
to the live Team, and provisions the derived SharePoint access for a company-domain account. A
generic-provider account is Teams-only: no company group or folder is created. A new company
folder must use unique permissions, the expected no-sharing contributor role and no foreign
company group. The agent reads all postconditions back before sending the group's individual
invitation and replying that the person was added. Repeated requests do not resend invitations.

### 5. Emailed source material

Actual attachments and clearly delimited plain-text data may be accepted as a SharePoint fallback.
The sender's organisation must resolve from an approved company-domain identity and live
SharePoint membership; prose alone cannot establish the organisation.

Automatic intake is limited to allowlisted documents of at most 50 MiB. Audio, video, archives,
executables, scripts, macro-enabled files, encrypted files and password-protected files are
rejected. Unknown or larger files require manual review. Submitted links are not followed.

Files are stored under a sanitized basename in the sender organisation's isolated folder. The
agent never overwrites; it skips an exact duplicate and gives a different same-named file a
timestamp suffix. After readback, the reply lists exactly the resources that were stored.

### 6. Access-support replies

When organisational restrictions prevent access, the agent may suggest a personal email address
or personal device only if the participant's organisation permits it. It explains the value of
Teams threads, working-group updates and model-draft review, and says authorised material can be
emailed as attachments. It never suggests bypassing organisational controls and preserves the
company-domain requirement for SharePoint upload access.

### 7. Idempotency, mailbox markers and failure behavior

The fixed order is **read → validate → write → read back → reply → checkpoint**. Mailbox categories
make outcomes visible: `OPDA Agent - Completed`, `OPDA Agent - Waiting` and
`OPDA Agent - Failed`. A success category and requester reply are allowed only after every
postcondition and the individual invitation send are verified.

The first run starts at an explicit activation checkpoint, not from the beginning of the mailbox.
Per-message digests prevent retries from duplicating Team membership, folders, uploads, invitations
or replies. Partial failures are reported without claiming success, and later dependent writes
do not continue.

### Consequences

- Good, because routine requests are handled twice each working day with a visible audit outcome.
- Good, because AI interprets intent while deterministic code constrains permitted actions.
- Good, because live Microsoft state remains authoritative and retries are idempotent.
- Good, because ambiguous targets produce a useful clarification rather than a guessed write.
- Good, because source material can reach the correct private folder even when SharePoint is
  blocked for the sender.
- Bad, because mailbox access and Microsoft write permissions make each scheduled run
  consequential and require ongoing credential health.
- Bad, because planned working groups still require human intervention until their uniform
  workspaces are implemented.
- Neutral, because a high-reasoning model costs more per run but expected message volume is low.

### Confirmation

This decision is implemented when:

- the harness manifest, deterministic policy module and automation prompt pass their tests;
- the live Technology invitation template matches its General and Common Topics channels;
- the automation is active at both weekday times in Europe/London;
- the activation checkpoint exists before the first scheduled run;
- a dry preflight confirms the frozen model, roles, gates, templates and implemented workspace
  register; and
- repository tests and the static-site build pass before commit.

## More Information

- [ADR-0063 — domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — AI-assisted evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [ADR-0070 — uniform Microsoft 365 working-group workspaces](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md)
- [Harness manifest](../../config/agents/working-group-inbox/manifest.json)
- [Scheduled agent prompt](../../config/agents/working-group-inbox/automation-prompt.md)
- [Deterministic policy module](../../src/agents/working-group-inbox/domain.mjs)
- [Agent preflight](../../scripts/working-group-inbox-agent.mjs)
