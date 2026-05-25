---
title: Compliance & Risk WG — candidate firm recruitment brief
purpose: Working document for the Engagement WG to identify and approach candidate firms for the Compliance & Risk Working Group, in support of ADR-0001 Wave 2 (Data Quality + Data Security + Maturity Accreditation workstreams running in parallel).
source: ADR-0005 register item A5; ADR-0001 §"Newly resolved during review" #3 (Wave 2 timeline)
owner: Engagement WG
status: Draft scaffold · firm names PROVISIONAL · WG to validate
last_updated: 2026-05-18
---

# Compliance & Risk WG — candidate firm recruitment brief

## Why this brief exists

ADR-0001 Wave 2 commits OPDA to running three Compliance & Risk WG workstreams in parallel from day 1:

1. **Data Quality framework** — six DQ dimensions, per-claim measurement, AL mapping (`/governance/data-quality`)
2. **Data Security framework** — KYC/KYB, key management, signature verification, revocation, audit logging (`/governance/data-security`)
3. **Maturity-based accreditation** — Engagement / Process / Evidence scoring per capability (`/governance/accreditation-directory`)

These workstreams cannot start until C&R WG has the right composition. ADR-0001 §"Newly resolved" #3 makes this an explicit pre-condition: *"Engagement WG to recruit additional C&R members from firms with mature internal DQ / Security functions (large lenders, surveyors, conveyancing platforms) before workstream kick-off."*

The trade-off recorded in ADR-0001 is "maximum velocity at the cost of recruitment dependency." This brief operationalises the recruitment side.

## Selection criteria

A candidate firm should satisfy at least three of the following, with #1 and #2 mandatory:

1. **Mature internal data-quality function** — published DQ standards, DQ scorecards in production, a named DQ lead.
2. **Mature internal data-security function** — ISO 27001 or equivalent, dedicated InfoSec team, breach-disclosure track record.
3. **Existing OPDA member** in Founder or Certified tier — already bound by Code of Conduct, eligible for governance roles.
4. **Sector representation** matches a current bounded context — Estate Agency, Conveyancing, Mortgage Lending, Surveying, Property Data Services, Property Technology.
5. **Willingness to commit** ~2 person-days/month from a senior individual contributor for the duration of the workstream (target: 6–9 months to first publish).
6. **Regulatory experience** with UK GDPR Art 5(1)(d) (accuracy), ICO guidance, or FCA principles is a strong plus given the DQ workstream's regulatory anchoring.

## Candidate firms — PROVISIONAL

This table is a **scaffold for the Engagement WG to populate and validate**. Firm names below are illustrative — drawn from existing OPDA member firms with publicly known DQ or Security functions — and **MUST be confirmed by the WG before approach**.

| Candidate firm | Sector | Why provisionally listed | Engagement WG action |
|---|---|---|---|
| _Large lender — TBC_ | Mortgage Lending | Lenders typically have the most mature DQ/InfoSec functions; existing OPDA member banks include HSBC UK, Nationwide, NatWest, Lloyds (Halifax / BM Solutions / Scottish Widows), Atom Bank | Identify the named DQ or InfoSec lead at one of the founder banks; gauge interest |
| _Conveyancing platform — TBC_ | Conveyancing | LMS, Smoove, Movera, Movemnt have transactional data flows that exercise the DQ dimensions | Approach via existing OPDA contacts |
| _Surveying firm — TBC_ | Surveying | Survey Shack is the current associate-tier surveying firm; this slot is structurally hard (see [`/governance/data-stewardship`](../../src/pages/governance/data-stewardship.astro) Open Question 4) | Coordinate with surveying-steward recruitment; consider RICS deputisation |
| _Property data specialist — TBC_ | Property Data Services | Sprift, Groundsure, TM Group, Kotini, Inventory Base — all founder firms; several already represented at DPMSG | Approach senior DQ contact directly |
| _Property technology orchestrator — TBC_ | Property Technology | Moverly, Coadjute, PEXA — base PDTF transaction + VC wrapper sit here | Lower priority unless DQ/Security lead exists |

## Outreach template

A short outline the Engagement WG can adapt for first contact. Tone: peer-to-peer professional, not sales.

> Subject: OPDA Compliance & Risk WG — invitation to contribute
>
> [Firm] is one of the OPDA members already operating with the kind of internal data-quality and data-security disciplines we now need to formalise across the standard. Wave 2 of the framework (per ADR-0001 in the OPDA Knowledge Base) runs three workstreams in parallel — DQ, Security, and Maturity Accreditation — and we are looking for a senior individual contributor from your team who could join the Compliance & Risk WG for the duration. Time commitment: ~2 person-days/month, ~6–9 months to first publish. The outputs become part of the published OPDA accreditation framework that your firm and your customers will be assessed against.
>
> Would you have 20 minutes to discuss whether someone on your team is well placed to take this on?

## Sign-off

- Engagement WG identifies named contacts at ≥3 candidate firms per workstream (DQ, Security, Maturity) before the WG kick-off date.
- Each named contact has accepted in writing OR a documented decline (so the WG can keep moving).
- The Engagement WG lead countersigns this brief once recruitment is complete and the C&R WG can be quorate for its first meeting.

## References

- [ADR-0001](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) Wave 2 — three-workstream parallel timeline + recruitment pre-condition
- [ADR-0005](../adr/ADR-0005-deferred-work-register.md) item A5 — register entry this brief operationalises
- [`/governance/data-stewardship`](../../src/pages/governance/data-stewardship.astro) — Domain Data Steward roles (separate but related recruitment effort)
