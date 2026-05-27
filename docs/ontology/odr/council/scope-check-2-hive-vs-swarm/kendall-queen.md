# Kendall (Queen): Position on Hive-Mind vs Agent Fan-out

## Methodological frame

I review the hive-mind-vs-fan-out question from FIBO programme
governance and EDM Council practice, with the Allemang/Hendler/Schneider
*Ontology Engineering* lens specifically on Ch. 11 (governance,
versioning, change management) and Ch. 5 (reuse — by reference, not by
duplication).

Three anchors orient the position:

1. **FIBO governance separates content authority from machinery.** FIBO's
   ratification protocol (Modelling Team review → FCT Editorial Review →
   FCT Public Review → OMG technology process) is *process-explicit*: the
   gate criteria, the dissent-recording discipline, and the supersession
   semantics are written down and reviewable. But the *machinery* — who
   keeps the spreadsheet, how votes are tallied, whether email or a
   tracker carries the audit trail — is *deliberately* not load-bearing.
   FIBO has migrated tooling several times (email → Confluence → Jira →
   GitHub PRs) without re-ratifying any decision. The lesson: **the
   epistemic protocol is the methodology; the substrate is replaceable
   infrastructure**.
2. **EDM Council practice: machinery follows the panel, not the other
   way round.** Council sessions convene named experts whose stable
   published positions are the ground truth. Machinery that *reifies*
   those positions into a typed structure (per-question vote rows, role
   labels, dissent flags) is welcome; machinery that *constrains* what
   a panel can say (programmatic consensus strategies, fault-tolerance
   thresholds, broadcast protocols built for hostile actors) is a
   category error. The Council's failure mode is not Byzantine
   adversaries — it is *silent rubber-stamping* and *missing dissent
   capture*.
3. ***Ontology Engineering* Ch. 11 governance test.** Can a maintainer
   six months from now read the audit trail and reconstruct (a) what
   was decided, (b) why, (c) who dissented, (d) what would change the
   verdict? If yes, the machinery is sufficient. If the audit requires
   replaying a programmatic consensus run, the machinery has accreted
   theatre at the cost of legibility.

Against those three anchors, hive-mind primitives are **selectively
useful** — for one specific session shape — and **categorically wrong**
for the rest. Position by question follows.

---

## Q1 — For which session types does hive-mind add measurable value?

### Position

**Hive-mind is the wrong primitive for gate sessions, substrate
sessions, module sessions, cross-cutting sessions, and author-only
sessions.** It is **possibly the right primitive for one session shape
only**: the **ODR-0001 amendment session (Amendment A9 — Gandon-
Guizzardi methodology gap)**. Even there, the case is conditional.

Mapping the planned sessions:

| Session shape | Sessions | Hive-mind value | Reasoning |
|---|---|---|---|
| **Gate** | 004 Foundation, 005 IC, 015 Address | **None.** Gate sessions stand or fall on *exemplar pass* (Guarino's withdrawal condition: Endurant commit + IC over hard cases + UPRN status). The verdict is a *check against ontological reality*, not a vote-aggregation problem. Programmatic consensus adds machinery to a question that resolves by examining whether three diagnostic exemplars survive the proposed cure. The fan-out pattern with narrative synthesis already captures this. | Per ODR-0005 gate clearance — a vote of `8-0` on Q3 means nothing if the exemplar fails the IC. |
| **Substrate** | 011 SKOS | **None.** Substrate sessions establish criteria that downstream modules consume. The criteria themselves are deliberable — but the deliberation is *expert-grounded* (Isaac/Miles SKOS reference, Gandon SKOS-vs-OWL conditions), not voting-machinery-grounded. The two-pass option (substrate then audit) already handles the failure mode (insufficient module context) without requiring persistent state. | Per §5 trade-off — running 011 once up front avoids three module re-litigations; the discipline is *sequencing*, not Byzantine fault tolerance. |
| **Module** | 006 Agents, 007 Transactions, 008 Property attrs | **None.** Module sessions are the bread-and-butter of the programme — each ratifies a TBox slice (Person/Org Kinds; Transaction Relator; descriptive attribute shape). The session's contract is the *blueprint* in §4 (input docs + questions + verdict shape). Hive-mind machinery would not improve any of: question framing (Queen's job), per-expert position grounding (citation discipline), DA push-back capture (recorded-dissent discipline), or downstream-ODR amendment (Queen synthesis). | Eight Council sessions ran the H&M ontology programme using essentially the same fan-out pattern without losing any auditability. |
| **Cross-cutting (Claims/Governance loop)** | 009 Claims, 012 Governance | **None.** The 009→012 tight loop with right-to-amend is the strongest candidate where *persistent state* would seem to help. But the actual mechanism — `## Supersession scope:` on 0009's slice authored from 012 — is **DCAP-canonical** and trivially version-controlled in git. The amendment is *a textual amendment to a ratified ODR*, not a programmatic vote re-tally. Persistence buys nothing git doesn't already provide. | Per §4 routing — 012 owns DPV co-annotation authorship; 009 carries a one-paragraph pointer. The supersession is a *prose amendment*, not a re-run of a consensus protocol. |
| **Overlay/Validation** | 010 Overlay, 013 SHACL | **None.** Same logic as module sessions, with the additional discipline of the three-rule interface contract (Cagle). Cross-citation between 0010 and 0013 is enforceable by `odr-review` lint, not by a programmatic broadcast protocol. | Per §4.1 shared-question routing — interface contract is required `## References` content; lint catches the seam leak. |
| **Author-only** | 003 anchor | **None.** Author-only sessions have *no panel*. Spinning up a hive-mind for an author-only session would be hive-mind theatre. | Per §1 format tiers — author-only is ~1 agent run total. |
| **ODR-0001 amendment (A9)** | The Gandon-Guizzardi methodology-gap session (separate from the 12 planned sessions; routed to ODR-0001 amendment queue) | **Possibly yes — conditional.** A9 is the *one* session in the queue where the question is genuinely *meta* — "does an ODR record an artefact-engineering decision (Gandon) or an ontological commitment (Guizzardi)?". The deliberation will revisit *every prior verdict* under whichever reading prevails. The case for hive-mind: explicit Byzantine voting *might* help capture per-question disagreement at a granularity prose synthesis blurs, and persistent state *might* help the amendment loop (A9 → ODR-0001 ratification → cascade back through 0002-0015) survive multi-session resumption. The case against: A9 is still ultimately a *citation-grounded methodological choice*, and the synthesis discipline (which side wins; what convergent definition is adopted) is exactly what the Queen pattern delivers. | See Q6 — recommendation conditional on a pilot. |

### Reasoning (FIBO / EDM Council)

FIBO's governance taxonomy distinguishes **content decisions**
(ontological commitments — "is `Counterparty` a Role or a Kind?") from
**process decisions** (governance machinery — "do we tally votes by
email or in Jira?"). FIBO has *never* used Byzantine consensus or
formal fault-tolerance for either. The FIBO Modelling Team operates by
**deliberation + Editorial Review escalation**, with dissent captured
in issue threads. The substrate has migrated three times in ten years
without re-ratification — because the *protocol* is the methodology,
not the substrate.

The EDM Council's *Practical Guide to Implementing FIBO* is explicit:
modelling decisions are recorded with **citation grounding** (FIBO
spec paragraph; W3C Rec; OMG specification document), **named author
attribution** (who proposed; who dissented), and **versioned
supersession** (which decision this replaces). Those three disciplines
are *exactly* what ODR-0001's fan-out pattern delivers — and what the
synthesis-prose-with-vote-tallies preserves. Programmatic consensus
output replaces *prose synthesis* with a *structured vote record*; it
does not improve the citation grounding (still requires the expert to
ground in published methodology), the named attribution (already
named-expert by ODR-0001), or the supersession (already DCAP-canonical
via `## Supersession scope:`).

The *Working Ontologist* Ch. 11 audit-trail test: a maintainer six
months from now reads `session-001-pdtf-schema-to-ontology.md` and can
reconstruct Q5 (Knublauch's SHACL profiles verdict), Q6 (Moreau's
PROV-O coverage), Q7 (Cagle's `aiHint` exile) by reading the **prose
synthesis** with vote tallies inline. A programmatic vote dump
without the synthesis prose would *lose* the deliberation — Allemang's
push-back on Guarino, Hendler's URI-graph framing, Knublauch's
profile composition rule. Hive-mind output preserves the *votes*; the
synthesis prose preserves the *deliberation*. The deliberation is
load-bearing.

### Vote

**Wholesale adoption: REJECT.**
**Selective adoption (A9 only): CONDITIONAL — pilot first.**
**For sessions 002-015: REJECT.**

---

## Q2 — Byzantine consensus: does the Council's failure mode benefit from f<n/3 fault tolerance?

### Position

**No. The Council's failure mode is categorically different from
the failure mode Byzantine consensus addresses.**

Byzantine fault tolerance models the *adversarial* failure mode: some
fraction of nodes are actively faulty (lying, sending contradictory
messages, attempting to disrupt consensus). The protocol guarantees
liveness and safety provided f<n/3 nodes are faulty. This is a
genuine engineering achievement for *distributed-systems* problems
(blockchain consensus, distributed databases tolerating malicious
participants).

The OPDA Council's failure modes are:

1. **Silent rubber-stamping** — panel agrees on autopilot without
   genuine engagement. Mitigation: the Devil's Advocate role + the
   "no silent vote-padding" rule + Hendler's principle that experts
   must *discuss with each other*, not just opine in parallel.
2. **Missing dissent capture** — Guarino's IC objection or Knublauch's
   SHACL profile objection gets soft-pedalled in synthesis. Mitigation:
   per-question dissent recorded verbatim with reason; DA withdrawal
   recorded explicitly.
3. **Panel padding** — generic-expert framings dilute the citation
   grounding. Mitigation: ODR-0001 § "Always use named experts; never
   generic role titles."
4. **Wrong-stub deliberation** — running a session on a stub that's
   the wrong unit of decision. Mitigation: pre-flight scope check
   (§11) + escalation to programme-level Scope-Check (precedent set).

None of these are Byzantine. The Council does not face *adversarial*
panellists trying to corrupt the verdict. It faces panellists with
*genuine dissent* (Guarino's IC objection in Session 001 was not
adversarial — it was correct, and the session honoured it by gating
ODR-0005). Treating Guarino's withdrawal condition as a Byzantine
fault would be a category error.

### Reasoning (FIBO / EDM Council practice)

FIBO has run for fifteen years without consensus protocol. The
ratification chain (Modelling Team → FCT Editorial → FCT Public →
OMG) is *consensus by deliberation* — a panel reads, comments, and
either approves, requests changes, or escalates dissent. The failure
modes that have surfaced (overscoped releases; under-tested
implementations; vendor lock-in concerns) have *all* been governance-
process failures, not consensus-protocol failures. Byzantine
machinery would not have caught any of them.

The EDM Council *Data Capability Assessment Model* (DCAM) — closer
to OPDA's DCAP profile — likewise specifies *deliberation discipline*
(stakeholder engagement, traceability, evidence grounding), not
*voting machinery*. The discipline is recorded in playbooks; the
voting is by show of hands or email poll.

### Vote

**Byzantine consensus: REJECT for all session types.** The Council
panellists are not adversarial; the failure mode is silent
rubber-stamping (addressed by DA + named-expert discipline), not
hostile actors.

---

## Q3 — Narrative synthesis vs programmatic consensus output: does hive-mind preserve or destroy the narrative?

### Position

**Hive-mind's programmatic output destroys the narrative *if it
replaces* the synthesis. It is neutral or mildly helpful *if it runs
alongside* the synthesis.**

ODR-0001 §"Synthesis report" specifies what the Queen produces:

> per-expert positions (or pointers to where they appear above),
> vote tallies per question, dissent records and withdrawals, the
> recommended approach, rationale citing publications, agreed
> amendments to the proposal, and whether any existing ODR needs
> revision or supersession.

Four of those seven items are **prose-shaped**: "rationale citing
publications", "agreed amendments to the proposal", "recommended
approach", and "whether any existing ODR needs revision". You cannot
reduce "Guarino's withdrawal condition is three commitments: Endurant
commit, IC over hard cases, UPRN status — all exemplar-validated" to
a structured vote field. The shape of the proposition is **a
synthesis sentence**, not a tally row.

Hive-mind machinery would impose `mcp__ruflo__hive-mind_consensus`
on every question — producing a structured `{question, vote_tally,
quorum_met, byzantine_safe, dissent_recorded}` output. That output
is **subset of** what the prose synthesis already captures, and
**stripped of** the synthesis-sentence shape that makes the
deliberation reconstructable.

Two routes:

1. **Replace synthesis with hive-mind output.** Destroys the
   methodology. ODR-0001's audit-trail discipline collapses.
2. **Run hive-mind alongside synthesis.** Hive-mind output becomes
   a *structured index* into the prose synthesis. Not harmful, but
   also not load-bearing — the prose already cites the vote tally
   inline. The structured index is *duplicate* infrastructure.

### Reasoning (Ontology Engineering Ch. 11)

OE Ch. 11 §"Documentation as Governance" makes the point directly:
ontology governance documentation must be *legible at the point of
need*. A maintainer reading the session transcript wants to know
*why* the verdict landed where it did — the citation grounding, the
push-back, the withdrawal moment. A tally row tells them *what* the
verdict was; the prose tells them *why*. Both are useful; the prose
is irreplaceable.

FIBO's published Editorial Review minutes are prose. The vote
outcomes are summarised in a table at the foot; the deliberation
is the body. This is exactly ODR-0001's shape — and it's the shape
that has worked for FIBO's seventy-plus ratified ontology modules.

### Vote

**Programmatic consensus output: REJECT as replacement.** **REJECT
as parallel** (duplicate infrastructure; no clear value). **The
prose synthesis stays load-bearing.**

---

## Q4 — Persistence and resumability: would persistent hive-mind state help the 009→012 amendment loop and the deferred S016 activation?

### Position

**No. Git is the persistence layer. The working-file directory plus
the ratified ODR + transcript is the resumable state.**

The 009→012 amendment loop is **already resumable** without hive-mind
persistence:

- Session 009 produces ODR-0009 (ratified) + transcript.
- Session 012 reads ODR-0009 + transcript + its own input docs.
- If 012's deliberation surfaces a tighter DPV co-annotation
  pattern, the Queen of 012 writes a `## Supersession scope:`
  amendment to 0009 in the same commit as ODR-0012's ratification.
- The amendment cycle closes in git.

A hive-mind persistent state would add: a typed memory store
recording the consensus output of 009, queryable from 012's session.
But ODR-0009's `## Rules` *is already* that record — in prose, with
citations. The Queen of 012 reads `## Rules`, not a typed memory
store.

S016 activation is the same logic. The activation triggers are
*specified in 002 and 009* (cred:/did: prefixes admitted, VC-side
decisions surfaced). When a trigger fires, the Queen of 016 reads
the upstream ODR + transcript and runs the session. No persistent
hive-mind state required.

### Reasoning (FIBO governance)

FIBO ratification has run sessions years apart (initial FIBO BE
release 2014; FIBO Production Release 2018; FIBO Quick Start
adoption 2021). The substrate that linked them was *the published
ontology* — git repository, OMG specification documents,
Confluence pages. No persistent voting state. The Editorial Team
of 2021 read the 2018 publication + commentary and proceeded. This
is exactly the OPDA Council shape.

Persistent state is load-bearing in *distributed-systems* contexts
where state must survive process restart without re-deriving from
authoritative sources. The OPDA Council's authoritative source is
the ratified ODR. There is no parallel state to lose.

### Vote

**Persistent hive-mind state: REJECT.** **Git + ODR + transcript is
the persistence layer.**

---

## Q5 — Cost-benefit: does the additional ceremony pay for itself?

### Position

**No, with one conditional exception (A9).** The marginal cost of
hive-mind ceremony is *non-trivial* (per-session init, consensus-
strategy declaration, queenType setting, broadcast protocol
configuration, memory schema, persistence boundary), and the
marginal benefit is *zero or negative* for every session shape
except possibly A9.

The cost side:

- Per-session: ~10-30 minutes of additional convening work
  (init parameters; consensus-strategy selection; queenType
  decision; memory schema). At 12 sessions, that's 2-6 hours of
  pure overhead.
- Conversation-window: hive-mind tool calls add token cost to
  every session. Conservatively 5-10% of the Queen's window.
- Authoring discipline: every Queen now needs to understand
  *both* the prose synthesis discipline *and* the hive-mind
  protocol. Doubles the cognitive surface.
- Maintainability: future Queens reading prior transcripts must
  understand *which* hive-mind run produced *which* verdict — an
  audit trail that branches between prose and tool calls.

The benefit side:

- Auditable vote rows: **already provided** by ODR-0001's `N-M-K`
  tally convention.
- Recorded dissent: **already provided** by ODR-0001's dissent-
  verbatim discipline.
- DA withdrawal capture: **already provided** by ODR-0001's
  explicit "Cagle DA withdrew" convention.
- Cross-session amendment: **already provided** by DCAP's
  `## Supersession scope:`.
- Resumability: **already provided** by git.

What hive-mind uniquely provides:

- *Byzantine fault tolerance*: not a failure mode the Council faces
  (Q2).
- *Programmatic broadcast*: would replace per-Queen synthesis with
  protocol-driven cross-teammate signalling. Destroys the
  citation-grounded deliberation Hendler called for.
- *Persistent typed memory*: duplicates git.

Net: cost is real; benefit is zero or negative. **The ceremony
duplicates work the Queen already does** — and does it less
auditably (tool-call output is harder to inspect than prose).

### Reasoning (EDM Council Practical Guide §"Cost of Governance")

The EDM Council Practical Guide is explicit that governance
machinery should be *no heavier than the decision requires*. For
high-stakes domain decisions (FIBO module ratification), the
machinery is full FCT review; for editorial fixes, the machinery
is a single editor + version bump. The principle generalises: **the
machinery is calibrated to the decision's stakes, not to a
theoretical maximum auditability**.

ODR-0001's fan-out pattern already sits at the *right* point on
the calibration curve for OPDA's 12 ratification sessions: heavy
enough to capture deliberation, named-expert grounding, and
DA-withdrawal; light enough to fit one session per conversation
turn. Hive-mind pushes the machinery past the calibration point —
not for measurable audit benefit, but for ceremonial completeness.

### Vote

**Cost-benefit: REJECT wholesale.** Hive-mind adds cost without
proportional benefit for any of the 12 planned sessions.

---

## Q6 — Wholesale, selective, or none?

### Position

**SELECTIVE — and the selection is one session only: the ODR-0001
Amendment A9 (Gandon-Guizzardi methodology-gap session).** Even
there, **pilot first**.

The case for A9 specifically:

1. A9 is *meta-Council* on the methodology itself. The verdict
   re-reads every prior session under a chosen methodological
   commitment (Gandon: ODRs record artefact-engineering decisions;
   Guizzardi: ODRs record ontological commitments). The stakes
   are higher than any module session.
2. The amendment loop is genuinely cross-session: A9 → ODR-0001
   ratification → cascade back through 0002-0015. Persistent state
   *might* help track which prior verdicts need re-examination
   under the chosen reading.
3. The panel composition is itself disputable (do we need a
   second-order Devil's Advocate? does the standing panel cover
   the meta-question?). Programmatic Queen-type setting (strategic
   vs adaptive) *might* surface that.

The case against A9:

1. A9 is still ultimately *citation-grounded* (does FIBO record
   artefact-engineering or ontological commitments? does DCAM?
   does OE Ch. 11?). The synthesis discipline is what produces
   the answer.
2. Piloting hive-mind for one session sets a precedent that
   pressure later sessions toward the same machinery. The
   selective recommendation must be **explicitly time-bounded**:
   A9 *only*, with no rolling adoption.

**Pilot conditions.** If hive-mind is piloted for A9:

- **Run the prose synthesis in parallel** (not replaced). The
  ODR-0001 §"Synthesis report" discipline stays the canonical
  record; hive-mind output is supplementary.
- **Adoption of hive-mind output is contingent on demonstrating**
  that it captures something the prose synthesis cannot — a
  specific per-question disagreement pattern, a specific
  cross-session amendment that prose synthesis would have missed.
- **If the pilot demonstrates no measurable benefit**, drop
  hive-mind. Do not roll forward to subsequent sessions on
  ceremonial grounds.

### Vote

**SELECTIVE — A9 pilot only, time-bounded, with prose synthesis
running in parallel.**

---

## Synthesis priority

**The most load-bearing question is Q3** (narrative synthesis vs
programmatic consensus output). If hive-mind output *replaces* the
prose synthesis, ODR-0001's audit discipline collapses; if it runs
alongside, the cost-benefit fails (Q5). The other questions (gate-
session fit, Byzantine relevance, persistence) all reduce to Q3 in
practice — they ask whether some specific session shape *needs*
machinery that bypasses the synthesis-prose discipline. The answer
is uniformly no, with A9 as the one conditional exception.

**If forced to commit one session to hive-mind first, it is A9**
(the ODR-0001 amendment on the Gandon-Guizzardi methodology gap).
A9 is the only session where the question is genuinely *meta-
methodological* and where the machinery might surface a per-
question disagreement pattern that prose synthesis would smooth
over. Pilot conditions (parallel prose synthesis; time-bounded;
benefit-demonstration before rolling forward) apply.

**For sessions 002-015 — the 12 planned ratification sessions —
no hive-mind.** The fan-out pattern with Queen synthesis is the
calibrated machinery for these decisions. Hive-mind machinery is
ceremonially heavier without being epistemically richer.

**The methodology decision belongs to ODR-0001's amendment queue,
not to per-session improvisation.** If the WG (or the Council)
decides that the fan-out pattern needs replacement, that decision
itself is an ODR-0001 amendment — and it should be ratified under
the existing fan-out pattern before any session adopts the
replacement. Self-application of the methodology to its own
amendment is the FIBO governance discipline.
