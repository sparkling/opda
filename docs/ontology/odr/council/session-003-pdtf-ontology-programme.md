# Council Session 003 — Programme phasing & shared-question routing (ODR-0003 anchor)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0003 — PDTF to Ontology: Programme and Work Breakdown](../ODR-0003-pdtf-ontology-programme.md)
- **Queen / Moderator:** Elisa Kendall (OMG / EDM Council — FIBO methodology; continuity from Session 001 and Scope-Check 1)
- **Devil's Advocate:** None convened (Author-only tier per ODR-0001 §Format tiers). Ian Davis remains nominated as DA for any Session 003b amendment that follows a substantive sequencing surprise from Session 002.
- **Panel:** None (Author-only).
- **Input Documents:**
  - [ODR-0003 — PDTF to Ontology: Programme and Work Breakdown](../ODR-0003-pdtf-ontology-programme.md) (the anchor).
  - [Council follow-up sessions plan](../../../plan/council-followup-sessions.md) §5 (sequencing and gates), §4.1 (shared-question routing), §5.1 (MVP fast-path), §8 (execution checklist), §11 (pre-flight scope-check candidates).
  - [Council Session 001 — PDTF Schema to Ontology](./session-001-pdtf-schema-to-ontology.md) — the inaugural transcript whose Q1–Q7 verdicts produced ODR-0003 and its linked stubs.
  - [Scope-Check 1 — Programme cut](./scope-check-1-programme.md) — eight amendments A1–A9 (retire ODR-0014; spawn ODR-0015; name deferred ODR-0016; DPV co-annotation authoring moved to 0012; 0011 UFO meta-category per scheme; 0010↔0013 three-rule cross-cite; defer 0008 split; six termination signals; Gandon-Guizzardi methodology gap routed to Session A9).
  - [Scope-Check 2 — Hive-mind vs Agent fan-out](./scope-check-2-hive-vs-swarm.md) — eight amendments B1–B8 (consensus-mode framework; S005 hive-mind/byzantine pilot; S011 Q8 hive-mind/typed-output pilot; B5 reframe of Byzantine to structural vote acknowledgement; markdown persistence default; Davis Q1/Q5/Q6 held dissents).
  - [OPDA adoption record](./adoption.md) §Track Record.
- **`consensus-mode`:** `none` (Author-only — no panel to coordinate).
- **Format tier:** **Author-only.** Per the [follow-up plan §4 Session 003 blueprint](../../../plan/council-followup-sessions.md#session-003--odr-0003-pdtf--ontology-programme-anchor): "ODR-0003's substantive content was ratified by session-001. This session records the phasing this plan adopts (§5) plus the shared-question routing (§4.1) into ODR-0003's `## Rules`. No fresh deliberation is expected; no panel split is plausible." Items below are recorded with source citations, not deliberated.

## Context

ODR-0003 is the programme anchor. Its `## Decision` ("partition by ontological concern; spike-then-scale") and Q1–Q7 `## Rules` table are ratified by [Session 001](./session-001-pdtf-schema-to-ontology.md). What is still unrecorded — and what this session lands — is the *operational* layer above the anchor: the canonical phase ordering of the 13 follow-up sessions, the routing of questions that surface in more than one session, the named alternative to the default sequence (the MVP fast-path), the programme-retirement criterion, and the bidirectional-update discipline by which each ratifying session keeps the anchor and the adoption record in step.

The [follow-up plan](../../../plan/council-followup-sessions.md) §1 names this session the source of truth for sequencing (plan §5) and shared-question routing (plan §4.1); ODR-0003 imports those choices so the anchor and the plan stay coherent. Per the plan's authority clause: "If a substantive re-cut surfaces during implementation, it lands as an amendment to *both* this plan and ODR-0003 in the same commit. Sessions do not unilaterally re-sequence — the plan's phase order is binding until amended."

This session is the precondition for Session 002 (Phase 0, full Council on the vocabulary catalogue): 002 must run against a published, frozen phase sequence so its catalogue verdicts cannot drift the downstream phasing.

## Pre-flight scope check

Per ODR-0001 §Pre-flight scope check and follow-up plan §11. Outcome: **ratify-as-is**.

- The proposition is coherent — recording §5/§4.1 phasing into the anchor's `## Rules` is a single coherent decision, scoped to ODR-0003.
- No retire signal — Scope-Check 1 confirmed the cut (8-1 APPROVE); the anchor's `## Decision` stands.
- No re-scope signal — the items below all land in ODR-0003; none belong in a different corpus or sibling record.
- The Author-only tier is justified: the items are all sourced from existing ratified records (plan §§4, 4.1, 5, 5.1; Scope-Check 1; Session 001). No fresh deliberation is claimed; no panel split is plausible. (Per ODR-0001 §Format tiers: "Recording a decision the methodology or precedent has already settled; sequencing/index work; no panel split expected.")

## Items recorded (not deliberated)

Each item below is a recorded ratification of a choice already made in the cited source. The corresponding ODR-0003 `## Rules` amendment is summarised in the §Synthesis closing section.

### Item 1 — Phase ordering

The canonical phase sequence is [follow-up plan §5](../../../plan/council-followup-sessions.md#5-sequencing-and-gates). ODR-0003's `## Rules` cite §5 as the authority; the session table within the plan is not reproduced inside ODR-0003 (single source of truth). Per the plan's authority clause, the phase order is **binding until amended**; a session cannot unilaterally re-sequence. Substantive re-cuts land as a joint amendment to both the plan and ODR-0003 in one commit.

**Phase summary** (cited from plan §5; full detail lives there):

- **Pre-Phase** — Session A9 (Gandon-Guizzardi methodology gap; Reduced Council; recommended before S005 but not strictly blocking).
- **Phase 0** — Sequential `S003 (author-only) → S002 (Full Council)`. S003 first so S002 commits to a published sequence; ~~S014 RETIRED~~ (folded into S002's `## Change log` per Scope-Check 1 Q4).
- **Phase 1** — S004 (Foundation — gate).
- **Phase 2** — S005 (Identity crux — gate). **Pilot for `consensus-mode: hive-mind/byzantine`** (Scope-Check 2 B2).
- **Phase 2.5** — S011 (SKOS substrate; may parallel with S005). **Q8 only is a pilot for `consensus-mode: hive-mind/typed-output`** (Scope-Check 2 B3); Q1–Q7 remain Agent fan-out.
- **Phase 2.6** — S015 (Address & Geography — Reduced Council; new gate per Scope-Check 1 Q7a; gates S006 and S008).
- **Phase 3a** — S006 (Agents — feeds S007/S008/S009/S012).
- **Phase 3b** — S007 ∥ S008 (parallel after S006).
- **Phase 4** — S009 → S012 (Claims → Governance; S012 owns DPV co-annotation authoring; S009 carries one-paragraph pointer per Scope-Check 1 Q5).
- **Phase 5** — S010 (Overlay profiles; consumes ratified TBox).
- **Phase 6** — S013 (SHACL validation — closing).
- **Phase 7** — S016 (W3C VC/DID — **deferred**; activates only on trigger per Scope-Check 1 Q7c).

**Source:** [plan §5](../../../plan/council-followup-sessions.md#5-sequencing-and-gates).

### Item 2 — Default sequence vs MVP fast-path

The default sequence (plan §5; 13 active sessions plus deferred S016) and the **MVP fast-path** (plan §5.1; eight sessions to reach the BASPI5 round-trip handoff) are **named alternative options** the OPDA Working Group chooses between at the start of Phase 1. ODR-0003's `## Rules` "Minimum viable subset" subsection already names the subset; this session names the fast-path as a *first-class option*, not a fallback.

Switching after Phase 1 starts is expensive and discouraged. This session (S003) is the recorded place where the choice is logged. **Choice for OPDA: not yet recorded** — the WG has not yet selected; both options remain open until Phase 1 convenes. A Session 003b (Author-only) records the WG's choice when made.

**Source:** [plan §5.1 MVP fast-path option](../../../plan/council-followup-sessions.md#51-mvp-fast-path-option); ODR-0003's current "Minimum viable subset" already names BASPI5.

### Item 3 — Identity-crux gate check (exemplar pass)

The Session 005 gate-pass condition is the conjunction of [ODR-0005](../ODR-0005-property-land-identity-crux.md)'s three conditions, all validated against the diagnostic exemplars admitted under Q1 of Session 001:

1. Each property/title entity committed to a DOLCE category (Endurant) with a named sub-kind.
2. Identity criterion stated over the hard cases (demolition / subdivision / merger / first-registration / title closure / register transfer).
3. UPRN status settled (checkable SHACL/DASH key that degrades gracefully vs. contingent administrative identifier under PROV succession).

The three exemplars per plan §4 Session 005 input documents: (i) registered freehold house; (ii) unregistered house pre-first-registration; (iii) flat whose UPRN was split. All three must survive the proposed cure without a violation report the IC can't justify. The exemplars themselves are authored between Sessions 004 and 005 (per plan §10 "Between-session activity") — without them, S005 cannot run.

If S005 fails on any of the three conditions, modules S006–S008 do not spawn until remediation; S005's `## Synthesis` carries the remediation plan per plan §9 risk row.

**Source:** [ODR-0003 §Rules "Gate conditions (enforcement)"](../ODR-0003-pdtf-ontology-programme.md); [plan §4 Session 005 blueprint](../../../plan/council-followup-sessions.md#session-005--odr-0005-property--land-identity-crux-gate-pilot--consensus-mode-hive-mindbyzantine-per-scope-check-2-b2); [Session 001 Q4 transcript](./session-001-pdtf-schema-to-ontology.md).

### Item 4 — Module count

Post-Scope-Check 1, the active programme is **three modules + five cross-cutting + one substrate + one new gate + one deferred** = **11 active ODRs** (plus retired ODR-0014). Specifically:

- **Three modules** (Phase 3a/3b): ODR-0006 (Agents & Roles), ODR-0007 (Transactions & Lifecycle), ODR-0008 (Property descriptive attributes).
- **Five cross-cutting**: ODR-0009 (Claims/Provenance), ODR-0010 (Overlay profiles), ODR-0011 (Enumerations — promoted to substrate phase 2.5), ODR-0012 (Data Governance), ODR-0013 (SHACL Validation).
- **One substrate** (Phase 0): ODR-0002 (Vocabulary catalogue — absorbing former ODR-0014 amendments per Scope-Check 1 Q4).
- **One new gate** (Phase 2.6): ODR-0015 (Address & Geography — spawned by Scope-Check 1 Q7a). **Address class location is no longer routed through Session 006 (Q5);** Session 015 owns it and gates Sessions 006 and 008. (Plan §4 Session 003 item 4 reads "Address class location deferred to session 006 (Q5)" — that phrasing is superseded by Scope-Check 1 Q7a; recorded here for traceability.)
- **One deferred** (Phase 7): ODR-0016 (W3C VC/DID — named per Scope-Check 1 Q7c; does not run until trigger).
- **One retired**: ~~ODR-0014~~ (vocabulary catalogue amendments — retired by Scope-Check 1 Q4; folded into ODR-0002's `## Change log`; retained as historical anchor).

ODR-0001 (methodology) is `accepted` and amends through its own self-amendment process; ODR-0003 (this anchor) is the programme-level frame and is updated by the queen of each ratifying session (per Item 6).

**Source:** [plan §1 Scope-Check history](../../../plan/council-followup-sessions.md#1-scope-and-method); [Scope-Check 1 transcript](./scope-check-1-programme.md) Q4, Q7a, Q7c.

### Item 5 — Programme retirement criterion

The programme retires when **both** hold:

1. The MVP round-trip closes (`pdtf-transaction.json` → loaded SHACL profile → rendered BASPI form via DASH → validated transaction with `dct:source` traceability — termination signal 1 per plan §5; the implementation milestone proving the minimum subset of ODRs is coherent enough for real Turtle production).
2. Every linked ODR (the active 11 plus retired ODR-0014's historical anchor; ODR-0016 only if its trigger has fired) is `accepted`.

The four steady-state-discipline termination signals (3–6 per plan §5) are *cumulative checks evaluated at session close*; they are not retirement conditions but ongoing quality gates whose violation routes back to ODR-0001 amendment queue.

Once retired, ODR-0003 becomes a historical anchor; subsequent linked-data modelling work in OPDA produces fresh ODRs without revisiting this programme's sequencing.

**Source:** [plan §5 termination signals](../../../plan/council-followup-sessions.md#5-sequencing-and-gates); [ODR-0003 §Rules "Minimum viable subset" + "Gate conditions"](../ODR-0003-pdtf-ontology-programme.md).

### Item 6 — Status discipline

The queen of the session that ratifies an ODR (moves its `status` from `proposed` to `accepted`) is responsible for **three** bidirectional updates in the same commit as the session transcript and the ODR amendment:

1. **ODR-0003's `## Rules` work-breakdown index** — flip the relevant Phase entry's status pointer (if the entry currently reads `proposed`, update to `accepted` once the gate clears; for modules with downstream consequences, note any cascading effects).
2. **The OPDA adoption record's [§Track Record](./adoption.md#track-record) table** — add the session row (date, session ID, format, Queen, DA, subject, one-line verdict).
3. **The session transcript and ODR cross-references** — verify the ODR's `## References` section links the transcript; verify the transcript header links the ODR; run `odr-review` to lint.

If a session amends the methodology (ODR-0001) itself, the amendment lands inside ODR-0001's own `## Rules` per ODR-0001 §Self-amendment process and the track-record row records the Author-only self-amendment (precedent: three 2026-05-27 ODR-0001 self-amendments already in the track record).

Pilot sessions (S005, S011 Q8) carry an additional artefact per plan §8: a one-page **retire-or-extend evaluation** in the transcript noting whether `consensus-mode: hive-mind/*` added value relative to Agent fan-out. The evaluation outcome (RETIRE / EXTEND CAUTIOUSLY / EXPAND) is recorded in the track-record row's verdict column.

**Source:** [plan §1 Output per session](../../../plan/council-followup-sessions.md#1-scope-and-method); [plan §8 Execution checklist](../../../plan/council-followup-sessions.md#8-execution-checklist-per-session); [ODR-0001 §Adoption hooks §Track Record](../ODR-0001-linked-data-council-methodology.md#adoption-hooks-per-project-slots).

### Item 7 — Shared-question routing

Several questions surface in more than one session. Per [plan §4.1](../../../plan/council-followup-sessions.md#41-shared-questions-across-sessions), each shared question is **owned** by one session; downstream sessions inherit. If a downstream session genuinely needs to deviate, it records the deviation as a `## Supersession scope:` amendment on the owning ODR's `## Rules` and the amendment flows back. Routing failures (two sessions both producing a verdict on the same shared question) are a defect; the later session's verdict is invalid pending an explicit amendment cycle.

The routing table is maintained in **plan §4.1** as the single source of truth; ODR-0003 cites it. Cited entries below are summary pointers only, not authoritative:

- **`Phase` apparatus** — owner Session 006 (Q7); inherits Session 007 (Q3).
- **ODRL deferral trigger** — owner Session 002 (formerly ODR-0014; now folded); inherits Session 012 (Q4).
- **SSSOM re-open trigger** — owner Session 002; inherits Session 011 (Q3).
- **OWL-Time scope and depth** — owner Session 002 (disposition) → Session 007 (Q7 profile depth); inherits Sessions 005 (Property duration), 009 (PROV-O interval / instant).
- **SKOS scheme membership criteria** — owner Session 011 (substrate); inherits Sessions 006, 007, 008, 009, 012.
- **SKOS scheme UFO meta-category per scheme** — owner Session 011 (Q8 — pilot for `hive-mind/typed-output`); inherits Sessions 006, 007, 008, 009, 012.
- **Address class location** — owner Session 015 (NEW gate per Scope-Check 1 Q7a); inherits Sessions 006, 008, 009, 012. **Supersedes the prior Session 006 (Q5) routing.**
- **Datatype-vs-SKOS for category-like attributes** — owner Session 011 (general criterion) → Session 008 (per-attribute application).
- **DPV co-annotation pattern** on evidence — owner Session 012 (per Scope-Check 1 Q5 refinement); Session 009 carries one-paragraph pointer. Inherits Sessions 010, 013.
- **SHACL interface contract (three rules)** — cross-cite both Sessions 010 and 013 per Scope-Check 1 Q6 (Cagle): `sh:in` semantics; `sh:Violation` floor; no-identity-override gate.
- **W3C VC / DID activation** — owner Session 002 (admits `cred:` / `did:` prefixes); owner ODR-0016 / Session 016 (binding deliberation; deferred). Inherits Sessions 009 (Q8 defers into 016), 012 (consent receipts), 010 (signed VC profile shapes).

**Source:** [plan §4.1 Shared questions across sessions](../../../plan/council-followup-sessions.md#41-shared-questions-across-sessions).

## Synthesis

This Author-only session records seven items into the operational frame around ODR-0003 — phasing (Item 1), default-vs-fast-path option (Item 2), identity-crux gate check (Item 3), module count (Item 4), retirement criterion (Item 5), status discipline (Item 6), and shared-question routing (Item 7). No item is freshly deliberated; every item cites either the [follow-up plan](../../../plan/council-followup-sessions.md), [Session 001](./session-001-pdtf-schema-to-ontology.md), [Scope-Check 1](./scope-check-1-programme.md), or [Scope-Check 2](./scope-check-2-hive-vs-swarm.md).

The downstream-record impact is bounded: **ODR-0003 alone** is amended (adding a "Phase ordering authority", "Default sequence and MVP fast-path", "Programme retirement criterion", "Status discipline (bidirectional update protocol)", and "Shared-question routing" subsection block inside `## Rules`). The amendment sets `status: accepted` and `council: session-003`. No other ODR is touched.

**Author-only tier honoured.** No DA was convened; no panel teammate produced a position file; no votes were tallied. Per ODR-0001 §Format tiers, this is appropriate: every item is plan-derived. Per ODR-0001 §Self-amendment process, the corresponding tier for methodology amendment is also Author-only; this session uses the analogous tier for ODR-0003 amendment (which is *not* the methodology itself, but ODR-0001 §Format tiers extends naturally to record-level amendments).

**Bidirectional links updated** in the same commit as this transcript:

- ODR-0003 frontmatter: `status: proposed` → `accepted`; `council: session-001` → `session-003` (current ratification provenance).
- ODR-0003 `## Rules`: new subsections per items above.
- ODR-0003 `## References`: this transcript added.
- OPDA adoption record `§Track Record`: new row for this session.

**Termination-signal evaluation** (per plan §5 signals 3–6, cumulative at session close):

- Signal 3 (no duplicate constraint authoring) — N/A (no ontology constraints authored by this session).
- Signal 4 (≤3-ODR consumer-query traversal) — N/A (no query target).
- Signal 5 (ODR-0003 diff stops moving after Phase 1 closes) — early to evaluate; the diff *is* moving (this session amends ODR-0003), which is expected pre-Phase 1.
- Signal 6 (PII never accretes silently) — N/A (no PII surfaces touched).

**Pilot retire-or-extend evaluation:** N/A — this session is not a pilot (`consensus-mode: none`).

**Open items for Session 003b** (Author-only follow-up, if triggered):

- WG selection between default sequence and MVP fast-path (Item 2) — to be recorded when made.
- Any catalogue-driven sequencing surprise from Session 002 — recorded in 003b per [plan §5 Phase 0](../../../plan/council-followup-sessions.md#5-sequencing-and-gates).

## References

- [ODR-0003 — PDTF to Ontology: Programme and Work Breakdown](../ODR-0003-pdtf-ontology-programme.md) (the record amended by this session).
- [ODR-0001 — Linked Data Council: Review Methodology](../ODR-0001-linked-data-council-methodology.md) §Format tiers (Author-only criterion); §Session document conventions; §Self-amendment process; §Adoption hooks (track-record obligation).
- [Council follow-up sessions plan](../../../plan/council-followup-sessions.md) — operational source for §5 phasing, §4.1 routing, §5.1 fast-path, §8 execution checklist, §11 pre-flight scope-check candidates.
- [Council Session 001 — PDTF Schema to Ontology](./session-001-pdtf-schema-to-ontology.md) — Q1–Q7 verdicts that produced ODR-0003 and the linked stubs.
- [Scope-Check 1 — Programme cut](./scope-check-1-programme.md) — amendments A1–A9 underpinning Items 4, 6, 7.
- [Scope-Check 2 — Hive-mind vs Agent fan-out](./scope-check-2-hive-vs-swarm.md) — amendments B1–B8 underpinning the Phase 2 / Phase 2.5 pilot annotations in Item 1.
- [OPDA adoption record §Track Record](./adoption.md#track-record) — updated by this session.
