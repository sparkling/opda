---
title: OPDA-listed audit partners — candidate list
purpose: Scaffold of candidate auditing firms that the Engagement WG can review and approach before any member firm claims an evidence-tier score of 5 or 6 against the Accreditation Directory.
source: ADR-0005 register items C4 and F1; ADR-0004 §Q1 (Audit-partner provisional names)
owner: Engagement WG
status: Draft scaffold · partner names PROVISIONAL · WG to validate
last_updated: 2026-05-18
---

# OPDA-listed audit partners — candidate list

## Why this list exists

The Accreditation Directory (ADR-0004) scores member firms across three dimensions: **Engagement · Process · Evidence**. Scores 5 and 6 on the Evidence dimension require evidence verified by an **OPDA-listed audit partner** — a firm whose audit reports OPDA recognises as sufficient corroboration of the member's capability claims.

ADR-0005 item C4 makes this a hard dependency: *"Before any firm claims an evidence-tier score 5–6"* the audit-partner list must exist. Without the list, those scores are unclaimable.

ADR-0004 §Q1 deferred the actual selection: *"Initial list likely Big 4 + property-data specialists (KPMG, Deloitte, BDO + Hometrack / Land Insight / etc.). Out of scope for this register beyond noting the dependency."*

This document is the scaffold the Engagement WG works from when that dependency comes due.

## Selection criteria

A candidate audit partner should satisfy:

1. **Audit credibility** — established practice with published methodology, ICAEW or equivalent professional body membership, prior public-sector or financial-sector audit experience.
2. **Property-data domain understanding** — either a dedicated property-data team OR willingness to engage with the PDTF schema and overlays.
3. **No structural conflict** with the OPDA member they audit (not the member's primary accountant, not in the same group, etc.).
4. **Capacity to act at OPDA's cadence** — quarterly publishing rhythm; turnaround time acceptable to member firms.
5. **Willingness to publish** their methodology (Engagement WG to provide template) so OPDA members can predict what auditors will examine.

## Candidate partners — PROVISIONAL

This list is a **scaffold for the Engagement WG to populate and validate**. Inclusion below is not endorsement — it reflects ADR-0004's working hypothesis. All names MUST be reviewed by the WG and approached individually before listing in the Accreditation Directory.

### Big 4 audit firms

| Candidate | Why provisionally listed | Notes |
|---|---|---|
| KPMG | Named in ADR-0004 §Q1; has a UK property-data practice | First approach by Engagement WG lead |
| Deloitte | Named in ADR-0004 §Q1; existing relationships across UK property sector | — |
| BDO | Named in ADR-0004 §Q1; smaller than Big 3 but with a strong UK mid-market property practice | Mid-market fit may align better with OPDA member-firm scale than the Big 3 |
| PwC | Not in ADR-0004 §Q1 — add if WG decides to canvass all Big 4 | Conflict check: PwC is a recurring HMLR adviser, may need scope carve-outs |
| EY | Not in ADR-0004 §Q1 — same Big-4 question as PwC | — |

### Property-data specialists

| Candidate | Why provisionally listed | Notes |
|---|---|---|
| Hometrack | Named in ADR-0004 §Q1; AVM provider with property-data audit experience | Already in OPDA orbit via valuation overlays |
| Land Insight | Named in ADR-0004 §Q1; site-specific property data | — |
| Land Registry (HMLR) | Not in ADR-0004 §Q1 — but the authoritative source for title data; could be a verifier rather than auditor | Different role; flag and discuss with WG |

### Other categories the WG should consider

- **RICS-affiliated auditors** for capability claims involving valuation data (PIQ overlay)
- **CLC/SRA-affiliated auditors** for conveyancing-claim audits (TA6/TA7/TA10/LPE1 overlays)
- **ICO-recognised auditors** for data-protection capability claims

## Workflow for adding a partner to the published list

1. Engagement WG identifies candidate via this brief or industry lead.
2. Brief candidate on the OPDA-listed-partner role and the Accreditation Directory.
3. Conduct due diligence per the criteria above (especially independence and methodology).
4. Negotiate scope of work and capacity commitment.
5. Add to a candidate-stage register (not yet publicly listed).
6. Pilot with a single member firm seeking an evidence-tier 5 or 6 score.
7. After successful pilot, promote to publicly listed partner in `src/data/accreditation/audit-partners.json` (file does not yet exist; create when first partner is promoted).
8. Recurring annual review by EC.

## Sign-off

- Engagement WG produces ≥3 promoted partners (≥1 Big-4-class, ≥1 property-data specialist, ≥1 sector-specific) before any member firm seeks an evidence-tier 5 or 6 score.
- Each partner has signed an agreement covering scope, methodology, independence, and listing rights.
- ADR-0004 §Q1 marked closed by the Engagement WG.

## References

- [ADR-0004](../adr/0004-accreditation-directory.md) — Accreditation Directory spec, including evidence-tier definitions
- [ADR-0005](../adr/0005-deferred-work-register.md) items C4 and F1 — register entries this list operationalises
- [`/governance/accreditation-directory`](../../src/pages/governance/accreditation-directory.astro) — Directory page (Wave 2 stub)
