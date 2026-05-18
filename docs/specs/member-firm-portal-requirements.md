---
title: "Member-firm portal — requirements stub"
purpose: "Captures open questions for the deferred private detailed view of the Accreditation Directory, available only to member firms + OPDA"
source: "ADR-0005 register item F3; ADR-0004 §Q3 (member-firm portal deferred)"
owner: "Technical WG (build) + EC (scope decisions)"
status: "Stub · no policy decisions · pending first member-firm request"
last_updated: "2026-05-19"
---

# Member-firm portal — requirements stub

## Trigger

This stub activates when **the first member firm requests private detailed views** of the Accreditation Directory. Until then, no work happens. See [ADR-0005 register item F3](../adr/0005-deferred-work-register.md) and the third visibility tier in [ADR-0004 §3](../adr/0004-accreditation-directory.md).

## Why this is a stub

The design space is wide: authentication, authorisation, scope, performance, GDPR, off-platform integration. Making decisions before any firm has asked risks framing the wrong problem — the firms who eventually ask will have constraints we cannot guess. This document captures the **questions the portal must answer**, not the answers.

The Public + Drill-down tiers of the Directory (per ADR-0004 §3) suffice for consumers, regulators, and comparison shoppers. The portal is purely additive.

## Open questions

### Authentication

- did:web-rooted using the member firm's existing accredited issuer DID, or a separate human-facing credential?
- Email magic-link (low friction, weak assurance), OAuth via the firm's IdP (high friction, strong assurance), or both?
- How does authn relate to the EC voting machinery and the COI register? Same identity infrastructure or parallel?
- Should the portal piggyback on whatever authn the Trust Registry administrators already use?

### Authorisation

- Who in a member firm can see what? Whole-firm flat access, role-based (DQ lead vs Security lead vs governance contact), or person-level fine grain?
- Can a firm delegate read access to an external auditor for a defined window?
- Does OPDA staff have read access by default, or only on request with an audit log entry?

### Scope of private view

- Per-capability narrative beyond the public score (the "why we self-rated 4 here" commentary)?
- Audit-partner reports attached to score-5/6 claims, viewable inside the portal?
- Failed VC submissions and the reasons (signature verification failures, schema errors)?
- Comparison to peer firms — anonymised aggregate ("you are in the top quartile for DQ.accuracy"), named pairwise comparison (requires peer consent), or none?
- Historical trend lines for the firm's own scores?

### Performance and audit

- How is access logged — every page view, every API call, just sensitive endpoints?
- Retention of access logs — 12 months, 6 years (UK GDPR maximum for most purposes), forever?
- UK GDPR DSAR implications: when a member firm asks "who looked at our data", does the portal expose the OPDA staff who viewed it?
- What is the SLA — is the portal allowed to be slow if the Directory's quarterly publish is fast?

### Off-platform integration

- Read-only API for firms to pull their own data into their internal dashboards?
- Export to JSON / CSV / PDF, and at what granularity?
- Webhooks for status changes (e.g. a score recalculation, a spot-check finding, a new audit attestation)?

### Failure modes

- A firm leaves OPDA — what happens to their portal access? Immediate revocation or grace period?
- What happens to historical data the firm has already seen but not exported?
- A firm is suspended (Non-Compliant Member Policy) — does the portal show the suspension reason, hide it, or annotate?
- The Trust Registry is down — does the portal degrade gracefully (cached view) or hard-fail?

## Pre-decisions

None. This stub captures questions only. Any decision recorded here would be premature.

## Promotion path

When the first member-firm request arrives, this stub is promoted to its own ADR. The ADR number is the next available at promotion time (not reserved now — reserving numbers ahead of need is its own form of speculation). The promoted ADR draws on the open questions here as its scoping list and resolves whichever ones the first requesting firm actually cares about; the rest can stay open for a future revision.

## References

- [ADR-0004](../adr/0004-accreditation-directory.md) §3 — tiered visibility, third tier (member-firm portal) marked deferred
- [ADR-0004](../adr/0004-accreditation-directory.md) §Open question 3 — member-firm portal trigger
- [ADR-0005](../adr/0005-deferred-work-register.md) item F3 — register entry this stub backs
- Non-Compliant Member Policy — `source/01-organisation/accreditation/Non-Compliant Member Policy - OPDA.docx` (suspension semantics interact with portal access)
