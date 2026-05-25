---
title: "AGM-adjacent EC meeting — Wave 3 review agenda block"
purpose: "Recurring 15-minute agenda item for the EC meeting nearest the AGM; walks each Wave 3 watching brief"
source: "ADR-0005 register item D5; ADR-0001 §Wave 3 + 'Newly resolved' #4"
owner: "Executive Committee (Chair tables; Engagement WG prepares)"
status: "Reusable template · review annually"
last_updated: "2026-05-19"
---

# AGM-adjacent EC meeting — Wave 3 review agenda block

## Context

[ADR-0001](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) Wave 3 commits OPDA to four watching briefs (D1–D4 below) that — unlike Wave 1 vocabulary or Wave 2 gap-filling — have **no firm delivery trigger**. They sit live until either a triggering condition fires (promote to Wave 2 or own ADR), the item rots (close out), or the brief continues another year.

The risk that Wave 3 watching briefs silently rot was flagged during the 2026-05-18 review. The resolution recorded in [ADR-0001 §"Newly resolved" #4](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) was: pair the review with the EC meeting nearest the AGM, as a fixed annual checkpoint. [ADR-0005](../adr/ADR-0005-deferred-work-register.md) register item D5 records that recurring meeting; this template is what the Chair tables.

The review's job is **not** to do the Wave 3 work — it's to *decide whether the work has come due, gone away, or still warrants watching*.

## Cadence

- **Frequency:** once per year.
- **Where:** the EC meeting nearest the AGM (Q1 or Q4 depending on AGM date — per ADR-0001 §"Newly resolved" #4).
- **Duration:** ~15 minutes within the EC meeting.

## Pre-meeting prep (Engagement WG)

Engagement WG owns the prep packet. ***WG decision required:*** confirm Engagement WG (vs. C&R WG or Tech WG) is the right owner — the items span all three.

Seven days before the meeting:

- Produce a one-page summary per Wave 3 item (D1–D4 plus any items added since last review). Each summary covers:
  - Item recap (one paragraph).
  - Triggering condition from ADR-0001 / ADR-0005.
  - Has the trigger fired in the last 12 months? Evidence.
  - Has the item rotted? (E.g. industry has moved on, OPDA's position has changed, regulator has acted.)
  - Recommendation: **promote / continue / abandon / supersede**.
- Circulate the packet to EC members 7 days before the meeting.
- Take questions ahead of the meeting where possible so the 15-min slot is decision-time, not briefing-time.

## In-meeting agenda block (15 min)

| Minutes | What happens | Who |
|---|---|---|
| 0–2 | Chair frames the review — "We have four (or N) Wave 3 items; the question for each is promote / continue / abandon / supersede." | Independent Chair |
| 2–12 | Walk each item in order (D1 / D2 / D3 / D4 / …): summary recap, trigger status, recommendation, vote / accept-by-consensus. | Engagement WG presents; EC decides |
| 12–15 | Decisions recorded in the EC decision log per `governance.md` §6. Any item with a "promote" outcome gets an action: name an owner WG and a deadline for the promoting ADR. | EC secretary |

If discussion overruns on one item, the Chair time-boxes that item and rolls the remainder to a follow-up correspondence vote rather than expanding the slot — Wave 3 review is a checkpoint, not a workstream meeting.

## Decision template per item

Filled out per item during the meeting and copied into the decision log.

| Item | Trigger fired? | Evidence | Decision | Owner of next step |
|---|---|---|---|---|
| D*n* | yes / no / partial | _link to evidence_ | promote / continue / abandon / supersede | _WG or individual_ |

A **promote** decision implies a follow-up: who drafts the promoting ADR, on what timeline. A **supersede** decision implies a link to the superseding artefact. **Continue** and **abandon** are terminal for this review cycle.

## Items currently in scope (as of 2026-05-19)

| Item | One-line recap | ADR-0001 trigger |
|---|---|---|
| **D1** | GARP for OPDA institutional records | Opportunistic |
| **D2** | Storage & Ops retention/disposal guidance for PDTF claims | Trust Registry to production OR consumer-trust narrative needs it |
| **D3** | AI/ML governance over PDTF data (bias/fairness; ICO + EU AI Act alignment) | First member firm publishes a PDTF-trained model OR ICO/EU AI Act guidance solidifies |
| **D4** | Data-product discipline for OPDA's meta-analytics outputs (Directory, Standards Report, Consumer Survey) | Opportunistic |

D5 itself — this recurring review — is **not reviewed**; it is the mechanism by which the others are reviewed. If the review process needs to change (e.g. expand to 30 minutes, move to twice a year), that change is made via a new ADR or amendment to ADR-0005, not at this meeting.

New Wave 3 items added between annual reviews appear in [ADR-0005](../adr/ADR-0005-deferred-work-register.md) §D and join the table above when this template is next used.

## Lifecycle outcomes

Same as [ADR-0005 §Lifecycle](../adr/ADR-0005-deferred-work-register.md). A Wave 3 item leaves the register when:

1. **Promoted to its own ADR** — typical when a triggering condition has fired and substantive work begins.
2. **Completed** — rare for Wave 3 (most items don't ship as a discrete artefact; they roll into broader work).
3. **Abandoned** — explicit close-out with rationale recorded. Stays in ADR-0005 as a "considered and rejected" record.
4. **Superseded** — replaced by a different approach; entry links to the superseding artefact.

An item that **continues** for 12 months without progress gets the "still relevant?" flag at the next year's review per ADR-0005 §Lifecycle.

## Open questions for first run

1. **Prep owner.** Default proposal: Engagement WG drafts the one-pagers. Alternative: rotate among C&R / Tech / Engagement so the WG closest to a given item summarises it. ***WG decision required.***
2. **Decision feedback into ADR-0005.** When the EC decides "promote D2", who updates [ADR-0005](../adr/ADR-0005-deferred-work-register.md) to reflect the new ADR owner — the EC secretary, the Engagement WG prep owner, or whoever drafts the promoting ADR? Propose: EC secretary as part of the decision-log entry. ***WG decision required.***
3. **Threshold for adding new Wave 3 items mid-year.** Can a WG add a Wave 3 item between annual reviews, or only at the review? Permissive (anyone with edit rights) is the lowest-friction; strict (review-only) gives the EC a single read each year. Recommend permissive with the trade-off that the annual review may surface items the EC hasn't previously seen.

## References

- [ADR-0001](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) §Wave 3 — the four watching briefs this template reviews.
- [ADR-0001 §"Newly resolved during review" #4](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) — the resolution that pegs the review to the AGM-adjacent EC meeting.
- [ADR-0005](../adr/ADR-0005-deferred-work-register.md) §D — the register entries this template walks; §Lifecycle — the exit paths.
- `governance.md` §6 — EC decision-log mechanics referenced by the in-meeting agenda.
