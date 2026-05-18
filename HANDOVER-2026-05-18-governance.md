# Handover — Governance pages 24 / 25 / 26

**Date:** 2026-05-18
**Commits:** `dfcdb08` (pages) + `b4cbad3` (sidebar) on `main`
**Branch:** `main`, pushed to `github.com:sparkling/opda.git`

## TL;DR

Three new draft pages added to the **Governance** section under "OPDA's own rules":

- `24-data-stewardship.html` — roles, RACI, decision rights, voting
- `25-meetings-and-feedback.html` — cadence, feedback channels, consultation
- `26-stakeholder-engagement.html` — members, non-members, regulators, gov, consumers

All three are **Draft** status, ratification-pending. They are grounded in primary sources (Articles of Association 2026, Constitution 2026, Code of Conduct 2026, `governance.md`) and DPMSG / OPDA meeting transcripts and emails. Build clean: 162 pages, no errors.

## Why these pages exist

OPDA is rewriting its model and standard. The user asked for governance and procedures around **stakeholder engagement** and implementing **data management and data governance**, DCAM-style: data stewards, voting, decision-making, meeting cadence, feedback handling, change incorporation. The practical operating-governance machinery.

The existing governance section documented the *what* (rules exist, change pathway exists, conformance exists). These three pages fill in the *who-decides-what-when* and *how-stakeholders-participate*.

## Files changed

| File | Change | Lines |
|---|---|---|
| `src/pages/pages/24-data-stewardship.astro` | New | ~500 |
| `src/pages/pages/25-meetings-and-feedback.astro` | New | ~520 |
| `src/pages/pages/26-stakeholder-engagement.astro` | New | ~500 |
| `src/pages/governance.astro` | +3 cards in OPDA's own rules + 3 status table rows | +18 |
| `src/pages/pages/23-risk-liability.astro` | Footer `next` → 24-data-stewardship | +1/-1 |
| `src/pages/pages/30-concept-taxonomy.astro` | Footer `prev` → 26-stakeholder-engagement (was 14-business-glossary) | +1/-1 |
| `public/ui/site.js` | +3 sidebar entries under "OPDA's own rules" | +6/-3 |

## Key design decisions

These came out of an iterative review where the user walked through each candidate decision one by one. Most got grounded in actual corpus evidence after an initial speculative draft.

### Page 24 — Data stewardship & decision rights

1. **Domain Data Stewards = one per bounded context** (6 total: Estate Agency, Conveyancing, Mortgage Lending, Surveying, Property Data Services, Property Technology). Each PDTF overlay belongs to exactly one bounded context, so 6 stewards collectively cover every published schema artefact.
2. **Surveying steward seat is structurally unfillable today** — Survey Shack is Associate-tier only; eligibility rules require Founder or Certified. Flagged in a `callout--warn` at the top of §domainStewards.
3. **Stewards do not hold EC voting seats**; attend EC on a topic-based basis (Chair invites when their context is on the agenda). Three distinct individuals per context: 2 EC voting reps + 1 Domain Data Steward.
4. **EC = 12 voting seats, 2 per bounded context** — matches DAMA-DMBOK Council size range (8-15) and the Code of Conduct §EC. Observers do not count toward this figure.
5. **Steward eligibility deferred to nominating firm** — OPDA does not gate on individual years or qualifications. The member firm certifies the candidate's sector authority. Mirrors how Companies House lets firms pick their own directors.
6. **Public consultation window = 4 weeks for breaking, calibrated up later** (see page 25 below).
7. **Dissent record = mandatory vote split (Art 16) + voluntary 200-word position** (publish-on-submit). Light-touch for unanimous decisions; dissent only appears when someone has one to record.

### Page 25 — Meeting cadence & feedback channels

1. **Volunteer-paced tiered SLAs** — Bug 5d/20d, Clarification 10d/20d, Proposal 15d/40d, Breaking 15d / consultation window. Seasonal-flex clause for member-firm year-ends. Calibrated to volunteers with full-time day jobs at member firms.
2. **6-week breaking-change consultation window** (was 4 weeks in the first draft); 3-week non-breaking. Final comment deadline T-14 (was T-7) — gives OPDA 2 weeks to answer responses before merge.
3. **EC topic-flagging convention** — Chair publishes draft agenda 14 working days ahead; confirmed steward-attendance list 7 working days ahead.
4. **Regulator WG** — quarterly standing + ad-hoc on breaking changes.
5. **Decision log** — `source/04-governance-bodies/decisions/YYYY/MM/decision-NNN.md`; 10-year retention per Articles art. 16.
6. **Consultation portal = Artalk-on-Astro-pages** (Quora-style: page is the question, thread is the answers). Same toolchain operational on the semantic-modelling sister site at `~/source/hm/semantic-modelling`.
7. **Publication policy** — public by default + opt-out anonymisation request (Engagement WG decides per request).
8. **Comms & PR WG** — Monthly (R-practice, chaired by Claire B, stood up Jan 2026, fully cited).

### Page 26 — Stakeholder engagement

1. **5 engagement modes** (Members / Non-member firms / Regulators / Government / Consumers) — kept at top level rather than compressing to 4.
2. **FCA engagement = OPDA participating in FCA's forums** (PRISM Task Force sub-groups, FCA Accelerator + Sandbox, bilateral discussions) — *not* FCA at OPDA's Technical WG. The earlier "standing observer seats" proposal was wrong-shaped.
3. **ICO = nominal regulator, no operational channel today**. Largest single regulator-engagement gap. Proposed: initial outreach via Engagement WG to ICO Data Sharing Code team.
4. **Which? = named consumer partner** per 25 Sep 2025 steering action on Maria Harris: *"ensure we have a strong consumer voice throughout the project including Which? and the FCA"*.
5. **Government engagement = existing briefings folder** at `source/02-policy-and-positioning/briefings-to-government/` (OPDA Briefing Pack, Select Committee Inquiry Response). Proposed cadence: annual government brief alongside AGM with structured "asks" section.
6. **Devolved nations engagement is active**, not aspirational. Registers of Scotland + Northern Ireland invited to DPMSG Steering Group + Sandbox in Feb 2026. Welsh Revenue Authority on T&I steering group recipient list (Apr 2026). Reframed from "gap" to "formalisation gap".
7. **Annual Engagement Review** (not quarterly KPI dashboard) — mirrors Accreditation Scheme §Annual Review pattern, qualitative-led with quantitative evidence where measurement is cheap.

## Open questions remaining

Items deliberately not yet resolved on the pages — for EC / GA / future ratification.

### Page 24 open questions

1. Steward selection process — EC appointment vs membership election vs sector-WG nomination
2. Steward compensation — voluntary vs paid stipend
3. Removal procedure when a steward's firm exits OPDA membership
4. Vacant-context handling (Surveying today) — stay vacant / merge with adjacent / external advisor
5. Liaison cadence with external industry stewards
6. Voting rights for stewards at Technical WG meetings reviewing their own context

### Page 25 open questions

1. Cadence for Policy WG (folder empty; remit needs defining before cadence)
2. Async vs synchronous default for Technical WG
3. Decision-log retention extension — apply Articles art. 16 10y rule to all WG decisions or just EC/Board

### Page 26 open questions

1. Standing observer seats for FCA / ICO — depends on those regulators agreeing
2. Additional consumer-advocacy bodies beyond Which?
3. Complaints channel toolchain (likely Artalk with private mode)
4. Devolved-nations formalisation (named sub-group? bilateral workstreams?)
5. Insurance industry — who initiates ABI engagement?
6. Lettings as a separate bounded context — tied to membership growth

## Evidence base — primary sources actually used

The pages are heavily cited. Key sources to know about:

**Constitutional / organisational:**
- `source/01-organisation/constitution-and-policies/Articles of Association 2026.pdf` — 17 pages, arts. 1-42
- `source/01-organisation/constitution-and-policies/OPDA Constitution 2026.pdf` — 6 pages
- `source/01-organisation/constitution-and-policies/Code of Conduct 2026.pdf` — 3 pages
- `source/01-organisation/constitution-and-policies/Conflict of interest register.xlsx` — existing artefact, extended in proposed COI machinery
- `source/01-organisation/accreditation/*.docx` — Accreditation Policy / Scheme / Non-Compliant Member Policy

**Technical governance:**
- `source/03-standards/trust-framework/docs/governance.md` — defines GA/Issuer/Holder/Verifier/TRO roles + the 4 operational functions + the 8-step SOP
- `source/03-standards/trust-framework/docs/release-version-register.md` — Stakeholder Version Register file

**Government-facing:**
- `source/02-policy-and-positioning/briefings-to-government/OPDA Briefing Pack.pdf`
- `source/02-policy-and-positioning/briefings-to-government/OPDA Select Committee Inquiry Response.docx`
- `source/02-policy-and-positioning/strategic-papers/DPMSG roadmap.pdf`

**Transcripts and emails (the rich evidence base):**
- `source/04-governance-bodies/steering-group/meetings/transcripts/*.vtt` — DPMSG Trust & Interoperability Steering Group (Nov 2025 onwards) — FCA PRISM mentions, Scotland + NI registers invitation, FCA bilateral discussions
- `source/04-governance-bodies/steering-group/materials/*/DPMSG Trust & Interoperability Steering Group.eml` — monthly steering-group emails (recipient lists tell us who is engaged); the 25 Sep 2025 launch email contains the Which? + FCA consumer-voice action
- `source/04-governance-bodies/working-groups/engagement/transcripts/*.vtt` — OPDA all-member update calls (Feb-May 2026) — Comms & PR WG cadence, Welsh "move Wales" initiative

**The Comms & PR WG folder contents** (referenced on page 25's cadence table):
- `source/04-governance-bodies/working-groups/comms-pr/DRAFT Data Trust Framework comms plan.docx`
- `source/04-governance-bodies/working-groups/comms-pr/DPMSG-Data-Standards-Interoperability-Report-Spring-2025-FINAL-1-1.pdf`
- `source/04-governance-bodies/working-groups/comms-pr/data_standards_for_smart_data.pdf`

## Known issues / gotchas

1. **`14-business-glossary.astro` still has `next=30-concept-taxonomy.html`** but 30's `prev` is now 26 (was 14). This is a pre-existing structural inconsistency (the chain 14→30→14 was already half-broken — 14 forward-linked to 30 but 30 only acknowledged one prev). The new chain is 26→30→26 in the Governance section; 14's forward link to 30 in the Modelling section is now unmatched. Fix is a one-line edit on 14 (point next at 30a or wherever the Modelling section's forward chain wants to go) OR a one-line edit on 30 (acknowledge both upstream chains somehow — but PageFooter only supports one prev).

2. **`src/pages/pages/21-change-management.astro` has an uncommitted modification** (adds `size="small"` and `size="medium"` to two Diagram captions). It predates this session — your call whether to commit it separately or revert.

3. **`scripts/__pycache__/` and `.pyc` files are untracked** — Python bytecode cruft. Worth adding to `.gitignore`.

4. **Diagrams render client-side via Astro** — no `mermaid-export` PNG step needed before commit (saved as a memory entry: `~/.claude/projects/-Users-henrik-source-opda/memory/opda-no-mermaid-export.md`).

5. **EC "12 seats vs 5 minimum" reconciliation** — page 24 §ecVoting reads the Articles art. 18(1) "Chair + minimum 5 voting member-firm representatives" and the CoC's "12 seats" as compatible: 5+chair=6 is the legal floor, 12 voting seats is the operating size structured as 2-per-context. Observers do not count toward either figure.

6. **Surveying steward seat structural problem** — flagged in three places on page 24. The Executive Committee will need to either recruit a Surveying firm to Founder/Certified tier, relax eligibility rules for under-represented contexts, or deputise an external advisor (e.g., RICS representative).

## Where to find the pages

| Where | URL / path |
|---|---|
| Source files | `src/pages/pages/24-data-stewardship.astro`, `25-meetings-and-feedback.astro`, `26-stakeholder-engagement.astro` |
| Built HTML | `dist/pages/24-data-stewardship.html` etc |
| Local dev (after `./dev.sh`) | `http://localhost:4330/pages/24-data-stewardship.html` etc |
| Production (Cloudflare Pages) | `https://opda-kb.pages.dev/pages/24-data-stewardship.html` etc |
| Landing page nav | `/governance.html` → "OPDA's own rules" card group |
| Sidebar nav | "OPDA's own rules" group in the Governance section sidebar |
| Footer chain | 22 → 23 → 24 → 25 → 26 → 30 |

## Suggested next steps

1. **EC ratification**: walk the EC through the proposed structures (steward role, 12-seat EC composition, RACI, voting mechanics, SLA framework). Each open-question item is a candidate for EC decision.
2. **Recruit a Surveying member firm** — unblocks the structurally-unfillable steward seat. Survey Shack upgrading from Associate to Certified is the most likely path.
3. **Initial ICO outreach** — Engagement WG writes the introductory letter to the ICO Data Sharing Code team.
4. **Formalise the FCA engagement** — page 26 §regulatorsProposed proposes a published page listing FCA channels (PRISM sub-groups, Accelerator coordination, bilateral sandbox sessions), OPDA reps, and cadence. Lifts the relationship out of meeting notes into a citable artefact.
5. **Formalise devolved-nations engagement** — Scotland / NI registers + WRA already engaged; decide on named sub-group vs bilateral workstreams.
6. **Stand up the consultation portal** — first MAJOR consultation triggers the Artalk-on-Astro-page deployment. Configuration mode (public default + opt-out) needs setting up in the Artalk admin.
7. **Operationalise the decision log** — create `source/04-governance-bodies/decisions/` directory; write the first few entries to validate the schema.

## How the review was conducted

For future reference: each page was drafted, then walked through a per-check review. The discipline that emerged after a couple of speculative-first drafts:

> Search the source before proposing.

Repeatedly, what looked like a gap or a green-field decision turned out to have real corpus evidence — Comms & PR WG was already operational with a known chair, Artalk was already running on the sister site, FCA engagement was already ongoing via PRISM, Which? was already named as the consumer voice in a steering action, devolved-nations engagement was already active. The review found these via `grep` of transcripts, emails, and folder contents that the initial draft had glossed over.

Worth carrying that discipline into future drafting — for any "we should do X" or "this is a gap" claim, check the corpus first.

---

*Drafted by Claude Opus 4.7 with Henrik Pettersen, 2026-05-18.*
