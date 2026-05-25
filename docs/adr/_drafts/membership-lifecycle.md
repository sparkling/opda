# ADR draft — Membership lifecycle (ex-member handling, suspension, reinstatement)

> **DRAFT — not yet promoted to a numbered ADR.**
> This stub captures open questions for a future Membership Lifecycle ADR. It will be assigned an ADR number (next available after 0005) only when one of the triggers below fires. See [ADR-0005 register item F5](../ADR-0005-deferred-work-register.md).

**Status:** Draft — not yet promoted (no ADR number assigned)
**Date:** 2026-05-19
**Triggers for promotion:** any of
- (a) first member firm departure mid-quarter (forces an answer on the Directory entry)
- (b) first suspension under the [Non-Compliant Member Policy](../../../source/01-organisation/accreditation/Non-Compliant%20Member%20Policy%20-%20OPDA.docx) (forces an answer on the public artefact)
- (c) governance review explicitly requesting a lifecycle ADR

**Source:** [ADR-0005 register item F5](../ADR-0005-deferred-work-register.md); [ADR-0004 §Open question 5](../ADR-0004-accreditation-directory.md); Non-Compliant Member Policy.

## Context

OPDA has accreditation onboarding (the Accreditation Scheme, the Code of Conduct, the Articles of Association §16) and it has the Non-Compliant Member Policy for handling breaches. What it does not have, in published form, is a coherent statement of what happens at the **edges of the membership lifecycle**: a firm leaving mid-quarter, a firm suspended pending investigation, a firm reinstated after remediation.

The questions did not need answers before the Accreditation Directory, because there was no public per-firm artefact to maintain. Now that the Directory ([ADR-0004](../ADR-0004-accreditation-directory.md)) is the public face of "who is a member at what maturity", every lifecycle transition has a Directory consequence.

This is **deferred** because no precedent has triggered any of the open questions — answering them now would be guesswork. The Wave 2 workstreams ([ADR-0001](../ADR-0001-adopt-dcam-dmbok-elements.md) §Wave 2) will surface the first real cases. See [ADR-0005 register item F5](../ADR-0005-deferred-work-register.md).

## Scope

A future Membership Lifecycle ADR would cover:

- **Ex-member directory handling** — what shows in the Accreditation Directory after a firm departs.
- **Suspension semantics** — what changes in the public artefacts when a firm is suspended under the Non-Compliant Member Policy.
- **Reinstatement procedure** — what a previously-departed or previously-suspended firm goes through to rejoin.
- **Data retention obligations** for departing firms holding PDTF claims they have issued or held.
- **Public communication discipline** — when and how OPDA discloses lifecycle events.

It would **not** cover initial onboarding (covered by the Accreditation Scheme) or routine breach handling (covered by the Non-Compliant Member Policy). It fills the gap between those two documents.

## Open questions

### Ex-member directory handling

- Keep the entry with a `"Former member, last data {quarter}"` label, indefinitely or for a defined window?
- Immediate drop-out, on the basis that "the Directory shows current members"?
- Time-limited "mausoleum" view (e.g. 12 months after departure, then removed)?
- Does the answer depend on whether the firm left voluntarily vs was expelled?

### Suspension semantics

- Does suspension **freeze** the Directory entry (last-known scores preserved, no updates accepted)?
- Does it **hide** the entry from the public view?
- Does it **annotate** the entry with a "Suspended pending {reason}" banner?
- What about pending audits — does the audit pipeline continue, pause, or terminate?
- Is suspension public by default, or member-only-visible until expulsion is confirmed?

### Reinstatement

- Full re-onboarding (treat as a new member from scratch)?
- Lightweight restoration with the next quarter's data (treat the absence as a publishing gap)?
- Grandfathered (resume with last-known scores and a fresh quarter on top)?
- Does the right answer differ between "left voluntarily 6 months ago" and "expelled 3 years ago"?

### Data retention

- What must a departing firm do with PDTF claims they hold as a verifier / holder? The data is theirs to retain or dispose; how does that interact with UK GDPR Art 5(1)(e) (storage limitation)?
- What must they do with claims they have **issued** under their accredited issuer DID? Continue to honour revocation requests? Surrender the DID?
- Does OPDA retain the firm's submitted VCs (for the historical Directory) or destroy them on departure?

### Communication discipline

- Public press release for departures, or quiet update to the Directory only?
- Member-only notice via the EC's normal channels?
- Regulator notification — FCA, ICO — under what circumstances?
- Coordination with the firm: does the firm get to draft the public statement, review it, or just be notified?

### Audit-partner relationships

- Do **open audit findings** (per [ADR-0004 §6](../ADR-0004-accreditation-directory.md) evidence requirements) travel with a departing firm — i.e. remain visible as part of their last-known state?
- Does the audit partner have any obligation to OPDA after a firm departs (e.g. respond to a regulator query about the audit)?
- If the departing firm is itself an OPDA-listed audit partner (see [ADR-0005 item C4](../ADR-0005-deferred-work-register.md)), what happens to the audit attestations they have signed for other firms?

## Pre-decisions

None. This stub captures questions only. Recording any answer here would predetermine the future ADR.

## Related ADRs

- [ADR-0001](../ADR-0001-adopt-dcam-dmbok-elements.md) — Wave 2 commits to the Accreditation Directory, which is the surface area for most lifecycle decisions.
- [ADR-0004](../ADR-0004-accreditation-directory.md) — Accreditation Directory spec; §Open question 5 is the seed of this stub.
- [ADR-0005](../ADR-0005-deferred-work-register.md) — register entry F5 is the home of this deferred item.

## References

- [Non-Compliant Member Policy](../../../source/01-organisation/accreditation/Non-Compliant%20Member%20Policy%20-%20OPDA.docx) — current breach-handling procedure; lifecycle ADR extends but does not replace this.
- [Accreditation Scheme](../../../source/01-organisation/accreditation/Open%20Property%20Data%20Association%20%28OPDA%29%20Accreditation%20Scheme.docx) — initial onboarding; lifecycle ADR sits downstream of this.
- [Accreditation Policy](../../../source/01-organisation/accreditation/Accreditation%20Policy%20-%20OPDA.docx) — policy framing for the Scheme.
- Articles of Association 2026, arts. 16 and 18 — membership constitution; lifecycle ADR must remain consistent with these.
- UK GDPR Art 5(1)(e) — storage limitation principle; relevant to data-retention open questions.

---

*Draft stub — drafted 2026-05-19 by Henrik Pettersen with Claude Opus 4.7. Not yet promoted to a numbered ADR.*
