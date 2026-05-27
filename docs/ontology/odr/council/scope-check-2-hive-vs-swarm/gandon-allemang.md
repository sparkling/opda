# Scope-Check 2 — Gandon × Allemang on Hive-Mind vs Agent Fan-Out

- **Date:** 2026-05-26
- **Voices:** Fabien Gandon (W3C / Inria; RDF standards; SPARQL Federation; SHACL); Dean Allemang (*Working Ontologist*, 3rd ed. with Kendall; pragmatic RDF deployment).
- **Subject:** Should ODR-0001's Linked Data Council methodology adopt the `mcp__ruflo__hive-mind_*` consensus protocol for some session types instead of the current Agent fan-out?
- **Inputs read:** ODR-0001 (methodology); `docs/plan/council-followup-sessions.md`; scope-check-1 transcript.
- **Status:** Two-voice dialogue. Joint vote where we converge; split where we disagree. We do not constitute a Council — we are two members in scoping conversation. The recommendation here would still need ODR-0001 amendment via a full Council session to ratify.

## Framing

The plan currently encodes the swarm topology as Agent fan-out:

> *Per ODR-0001 §"Roles for every session", a session is a hive-mind with a queen, a devil's advocate, and the remaining panel. Implementation: named teammates spawned via Claude's Agent tool (`run_in_background: true`)…* (plan §1)

And carries a single carve-out for `hive-mind_spawn`:

> *Use `mcp__ruflo__hive-mind_spawn` (ADR-0115 carve-out) only when the queen needs explicit byzantine voting; otherwise the agent-team pattern from session-001 is sufficient.* (plan §1)

The question this scope-check answers is whether that carve-out is correctly calibrated, or whether some session types — Q5 (Property identity crux), Q11 (SKOS substrate), Q13 (closing SHACL severity) — would benefit from the hive-mind's structured consensus output, queen-led typed memory, persistence across processes, and Byzantine fault tolerance.

The hive-mind affordances we are weighing are:

- **Consensus strategies:** raft / byzantine / gossip / crdt / quorum / weighted.
- **Queen types:** strategic / tactical / adaptive.
- **Programmatic voting** via `hive-mind_consensus` (returns a tally, not a narrative).
- **Typed collective memory** via `hive-mind_memory`.
- **Persistence across processes** (resumability across days/sessions).
- **Byzantine fault tolerance**: tolerates f<n/3 dishonest or malfunctioning nodes.

Against the current methodology's load-bearing outputs, which are narrative synthesis, named-expert positions grounded in published methodology, recorded dissent, and per-question `N-M-K` tallies that *appear inside the narrative*, not as a separate artefact.

Two priors we bring to the table:

**Allemang's prior.** Mechanism follows mental-model. If a maintainer reading the synthesis eighteen months later can reconstruct the deliberation, the audit trail is doing its job — whatever the protocol underneath. The Queen's narrative does that; programmatic consensus produces a tally without rationale. *But*: where Queens might in future disagree on whether a vote actually clears a threshold (e.g. is Guarino's withdrawal really conditional, or is it dissent?), programmatic voting removes the ambiguity.

**Gandon's prior.** W3C consensus practice — REC progression, formal objections, working-group votes — produces *both* a narrative (the meeting minutes) AND a structured vote tally (the resolution table). One does not replace the other. If hive-mind's vote table is *additive* to the narrative synthesis, it improves the audit trail; if it *replaces* the narrative, it weakens it.

We approach this from those two grounds, not generic best practice.

---

## Q1 — Session-type fitness

**Allemang:** Start with the question the panel is answering. For ODR-0002 (vocabulary catalogue) the deliberation is *enumeration over a known list* — Core / Conditional / Defer, per vocabulary. Each row is independent. Agent fan-out is correct here: six teammates, parallel context windows, queen reads working/ and writes the synthesis. Hive-mind buys you nothing because there is no *cross-vote interaction* to mediate. Same shape for ODR-0003 (author-only ratification) and ODR-0014's absorbed amendments.

Where hive-mind earns its keep is the *identity crux* (Q5 / Session 005) and the *closing SHACL severity* (Q13 / Session 013). In both, the verdict on one question changes whether subsequent questions even make sense. Guarino's withdrawal condition in session-005 is *three conditions all met* — Endurant commit + IC over hard cases + UPRN status — and the panel is not just voting independently on each; they are voting *conditionally on each other's verdicts*. That is a Byzantine pattern in the colloquial sense: nodes that change their position based on what other nodes have said, with the queen needing to detect inconsistency.

On reflection I would *demote* S013 from this list. S013 is the closing session — it consumes every prior ratified shape and assigns severity tiers. Once 006–012 have closed, severity tiering is a *catalogue* shape decision: per-shape, "is this `sh:Violation` or `sh:Warning` or `sh:Info`?" Each shape's tier is largely independent of the others, modulo Cagle's three-rule interface contract with 010. That contract is the cross-conditional part. If 010↔013 verification is done separately (as we propose below), 013 itself reduces to enumeration. Agent fan-out is sufficient for 013.

**Gandon:** Agree on enumeration vs cross-conditional sessions, but I would frame it as the SPARQL federation analogy. Agent fan-out is **`SERVICE` parallel** — each teammate is a remote endpoint, queries run independently, results union'd by the queen. That works when the sub-queries are independent. Hive-mind is **federation with shared bindings** — sub-queries pass intermediate state, vote on consistency, fail safely if one endpoint is malicious or stale.

The fitness test is: *does the queen need to know that two panellists' positions are mutually inconsistent before she synthesises?* For S002 (catalogue) the answer is no — Allemang's verdict on OWL-Time admission does not constrain Pandit's on DPV. For S005 (identity crux) the answer is yes — if Guarino votes "Endurant met" but Hendler votes "third-class needed", the queen must surface the dependency. Hive-mind's structured vote table makes this visible at the protocol level. Agent fan-out makes the queen reconstruct it from narrative reading.

Concur on demoting S013. The federation analogy is the same: 013's per-shape severity is `UNION` not `JOIN`. The 010↔013 interface-contract verification is a `JOIN` on the three rules and that is where hive-mind earns its keep, not on the severity catalogue itself.

**Joint vote (Q1).** Use Agent fan-out for Author-only and Reduced Council sessions and for enumeration-shaped Full Council sessions (S002, S008, S011 substrate-mode, S013 if it stays severity-tiering-only). Use hive-mind for **cross-conditional gate sessions**: S005 (identity crux), S015 (Address UFO category, since its cascade gates two downstream sessions), and the 010↔013 interface-contract verification if the three-rule cross-cite reveals divergence. **Vote: 2-0 selective adoption, named-session list.**

---

## Q2 — Byzantine consensus relevance

**Gandon:** Byzantine fault tolerance asks: can the system reach a correct verdict when up to f<n/3 nodes are dishonest or malfunctioning? In a real W3C WG, the failure modes are *late comments*, *editorial drift*, *missing context*, *abstention storms*. Not malicious nodes. The Council's failure modes are similar: a panellist's position drifts because the queen mis-summarised an earlier vote; a teammate's context window truncated a load-bearing input; a fan-out call timed out and the queen synthesised from an incomplete panel.

Those are *failure modes hive-mind's Byzantine protocol does address*. Not because anyone is malicious, but because the protocol *forces explicit acknowledgement of each node's vote in the consensus tally*, which catches "this panellist's verdict was never registered" silently. Today the queen catches it (or doesn't) by reading the working/ directory. The Byzantine protocol catches it structurally.

There is also a related guarantee: vote *ordering*. In a SPARQL federation, when sub-queries pass intermediate bindings, the federation engine has to commit to an order of binding evaluation that survives partial endpoint failure. Hive-mind's consensus protocol commits to an order of vote registration that survives a teammate's silent drop-out. The queen knows whether the panel reached quorum *before* she begins synthesis. Today she discovers that by counting working/ files.

**Allemang:** I'll push back gently. The W3C WG analogy is the right shape but the wrong scale. WGs run for years; the Byzantine guarantees pay off because nodes drop out, come back, change their minds. A Council session runs in one sitting and writes a transcript. The failure modes Gandon names — context truncation, missed teammate output — are real but they are *file-system failure modes*, not consensus failure modes. The cure is `odr-review` lint catching the missing teammate's row, not Byzantine voting.

But Gandon is right on one thing: where the cure for "did this vote register" is *structural acknowledgement*, the hive-mind protocol gives you that for free. The cost is a vote tally without rationale (returns to in Q3). My instinct: f<n/3 is overkill for a 9-voice panel where every voice is a teammate Claude is spawning, but the *acknowledgement guarantee* matters for the gate sessions where Guarino-style conditional withdrawal is in play.

A specific scenario where the acknowledgement guarantee earns its keep: Session 005, Question 4 (UPRN status). Guarino votes "checkable SHACL/DASH key, degrades gracefully". Allemang the DA votes "contingent administrative identifier, under PROV succession". Hendler floats a third position — *both, in different graphs*. Without the Byzantine acknowledgement guarantee, the queen reads three working/ files and reconciles in narrative. With it, the protocol surfaces that Hendler's position is *not on the ballot* — the ballot was binary, his position abstains on both options, and the queen must either re-vote with a three-way ballot or record Hendler's abstention explicitly. The narrative would have done this if the queen noticed; the protocol forces her to notice.

**Joint vote (Q2).** Byzantine fault tolerance in its strict sense (f<n/3 over malicious actors) is **not the relevant property** for the Council. The relevant property is **structural vote acknowledgement** — the same protocol *as a side-effect* guarantees that every named expert's position is registered against every question, with no silent gaps and with explicit handling of positions that fall outside the ballot. For sessions where conditional withdrawal is in scope (S005, S015), that side-effect is worth the protocol cost. For sessions where votes are independent (S002, S011 substrate), `odr-review` lint of the working/ directory does the same job cheaper. **Vote: 2-0 — relevant property is acknowledgement, not Byzantine fault tolerance.**

---

## Q3 — Narrative synthesis vs programmatic consensus output

**Allemang:** This is the load-bearing question for ODR-0001. Read the methodology's §"Session protocol" item 6: *"The Queen writes a closing section listing: per-expert positions, vote tallies per question, dissent records and withdrawals, the recommended approach, rationale citing publications, agreed amendments to the proposal, and whether any existing ODR needs revision or supersession."* That is a **narrative** synthesis with structured tallies *embedded inside it*. The narrative is doing the work — eighteen months from now, a maintainer reads it to understand *why* the panel landed where it did. A vote tally without rationale is a tombstone. A tombstone is fine if you already know the story. Eighteen months from now you won't.

The scope-check-1 transcript demonstrates this. Davis dissented on six of eight questions. The transcript records his rationale verbatim per question — "*At the BBC we covered Brand → Broadcast → Version with one ontology, one shapes graph, one URI policy*" (Q1) and "*W3C's own discipline: a CR has Errata; a WD does not*" (Q4). Take those two quotes out and replace them with `Davis: AGAINST`. The vote tally is identical. The maintainer's ability to *reconstruct the deliberation* is destroyed.

**Gandon:** Allemang is correct that the narrative is load-bearing. But he is wrong that the choice is *either-or*. W3C consensus practice is *both* — the meeting minutes are the narrative; the resolution table is the structured tally. Look at the IRC logs from any W3C WG meeting: prose discussion, then `RESOLUTION: …` followed by `+1 from foo, +1 from bar, -1 from baz with comment "needs more analysis"`. Two artefacts. The narrative is for humans reconstructing the deliberation; the resolution table is for automated tooling — for example, REC progression checks, for issue-tracker integration, for the eventual W3C Process audit.

The hive-mind's `hive-mind_consensus` output is *additive*. It does not replace the queen's narrative. It produces a structured vote artefact *alongside* the synthesis. The synthesis stays. The tally is now machine-readable. If we adopt hive-mind selectively, the rule must be: **the queen writes the narrative synthesis as today; the consensus protocol's output is recorded as an appendix to the session transcript, not as a substitute for it.** Two artefacts, one transcript.

**Allemang:** That I can live with. The concern I'd add: when both exist, the queen will be tempted to *defer to the tally* on close questions. The Davis Q4 partial-withdrawal — DA aligns with majority on retirement, with reservations on timing — is the kind of nuance a tally erases by rounding. The rule has to be: where the tally and the queen's reading of the narrative disagree, the *narrative* is the verdict, the tally is the count. Otherwise hive-mind starts to substitute for deliberation.

**Joint vote (Q3).** Adopt the hive-mind consensus output **as an additive appendix** to the queen's narrative synthesis. The narrative remains the verdict; the structured tally is the count. ODR-0001 must be amended to name this two-artefact discipline before any session uses hive-mind. **Vote: 2-0 additive, narrative-primary, ODR-0001 amendment required before deployment.**

---

## Q4 — Persistence and resumability

**Gandon:** This is where I want to push hardest. Look at the shared-question routing in §4.1 of the plan. **S002 owns the SSSOM re-open trigger; S011 inherits.** **S009 carries a one-paragraph pointer to S012's DPV co-annotation listing; the listing is authored in 012.** **The 010↔013 three-rule interface contract is cross-cited both ways.** That is *cross-session state*. Today it lives in markdown — in the plan's §4.1 table, in the per-ODR `## References` lists, in the bidirectional links checked by `odr-review`.

When S012 runs three weeks after S009, what does the queen of S012 *consume* from S009's outcome? She re-reads the S009 transcript. She re-reads the plan §4.1 row. She manually reconstructs the seam. That reconstruction is exactly what `hive-mind_memory` (typed collective memory, persistent across processes) is designed to eliminate. The seam becomes a queryable artefact. The queen of S012 says `hive-mind_memory.query(seam: "dpv-co-annotation", session: "S009")` and gets back the typed state.

For the 009→012 amendment loop (forward-supersession via `## Supersession scope:`), persistence is *especially* load-bearing because the amendment can fire weeks after the parent session closed. Today that's a file-system race — does the plan's §4.1 still match the ODR's frontmatter? `odr-review` catches the divergence but doesn't *prevent* it. Hive-mind's typed memory would *prevent* it because both sessions read from the same state.

**Allemang:** I'm going to disagree on this one. Not because Gandon is wrong about the cost of manual seam-reconstruction — he isn't — but because the *cure* he proposes trades one failure mode for a worse one. File-system markdown is *legible*. A maintainer eighteen months from now opens `docs/plan/council-followup-sessions.md` §4.1 and reads the routing table. She does not need to run `hive-mind_memory.query(...)`. She does not need the ruflo MCP server to be running. She does not need to know that "the canonical seam state lives in `~/.claude/projects/*/memory/MEMORY.md`" or wherever the hive-mind persistence layer parks it.

The *Working Ontologist* test for any infrastructural choice: can the maintainer reconstruct the system from the files on disk, without running the tooling that wrote them? Markdown passes. Typed collective memory in a vendor-specific MCP store fails. The 009→012 amendment loop is *already* recoverable from the file system — the plan's §4.1 row plus the ODR's `## References` plus the `odr-review` lint output. If the seam diverges, the lint fires. That's enough.

Gandon's S016 deferred-activation example is the strongest case for his position, because S016 *won't run* until a trigger fires — months later, possibly different operator, possibly different MCP version. The trigger is recorded in the plan in prose. If hive-mind's typed memory carried that trigger as queryable state, S016's queen could say "is the activation trigger fired?" and get a structured answer. But: she can do the same by reading `docs/plan/council-followup-sessions.md` §"Session 016". Markdown is a queryable artefact too. The query language is `grep`.

**Gandon:** Allemang's *legibility from disk* test is correct as a principle. But the seam he names — plan §4.1 row + ODR `## References` + `odr-review` lint — is *three* artefacts the maintainer composes mentally. Typed memory composes them into one. The cost is the MCP dependency, which I grant. The benefit is *the seam cannot diverge* because there is only one place it lives. Markdown's failure mode is that the three artefacts can disagree silently between lint runs.

I do not want to win this on principle — I want to flag it as the *one place we genuinely disagree*. My weight is on W3C-style structured cross-meeting state (the WG's issue tracker is canonical, not the minutes). Allemang's weight is on file-system clarity. Both are correct framings of the same trade-off.

**Split vote (Q4).** **Gandon: adopt `hive-mind_memory` for cross-session state on the S009→S012 amendment loop and the S016 deferred-activation triggers.** **Allemang: leave cross-session state in markdown (plan §4.1 + ODR `## References` + `odr-review` lint); the file-system reconstruction test wins.** No joint position. ODR-0001 amendment would need to choose. (We note: if hive-mind is adopted selectively per Q1, the typed-memory layer is *available* for the sessions that use it; the question is whether to mandate it for cross-session seams or leave it optional. Allemang's position holds if the markdown lint is reliable; Gandon's position holds if the seam ever silently diverges.)

---

## Q5 — Cost-benefit

**Allemang:** Cost is real. Hive-mind spawn requires the queen to declare consensus strategy (byzantine / weighted / quorum), queen type (strategic / tactical / adaptive), and consensus topology *up front*. That is six new methodology choices ODR-0001 has to specify per session. For a Reduced Council session (S015 Address) with three voices, the ceremony cost is high relative to the deliberation cost. For a Full Council session with nine voices and conditional withdrawal in play (S005 identity crux), the ceremony pays for itself.

The rough cost rule: ceremony cost is roughly fixed per session; deliberation cost scales with question count × voice count × conditional-dependency. Hive-mind pays off when deliberation cost > 5× ceremony cost. For S002 (8 catalogue rows × independent) that is not true. For S005 (8 questions × 9 voices × conditional withdrawal) it is.

There is a second cost I want to surface: *learnability*. ODR-0001 today is one document a maintainer reads to know how a session runs. If the methodology splits into "Agent fan-out sessions" and "hive-mind sessions" with different per-session ceremony, the maintainer has to learn two protocols. The *Working Ontologist* discipline is that infrastructural choices should not multiply protocols visible to the human. The selective adoption in Q1 already accepts this cost; the question is whether the audit-trail benefit on three sessions justifies a permanent two-protocol methodology.

**Gandon:** I would add the *amortised* cost. ODR-0001 amendment to admit hive-mind is paid once. Per-session ceremony is paid n times. The amortised choice is whether the ceremony cost per session is recovered in *audit-trail clarity*. For the gate sessions (S005, S015) it is. For Author-only and Reduced Council it never will be. The selective recommendation in Q1 already captures this — we are not arguing about wholesale adoption.

On Allemang's learnability point: the W3C precedent is *one Process document* that admits multiple deliberation modes — informal discussion, formal vote, formal objection. The maintainer learns one Process; the per-meeting mode is named in the meeting's frontmatter. The two-protocol concern is real but the cure is methodology framing, not protocol uniformity. ODR-0001 names the modes; each session declares which one applies in its frontmatter.

The hidden cost I want to flag: hive-mind introduces a new failure mode — *the consensus protocol returns a tally that the queen's narrative would have rendered as a more nuanced verdict.* The Davis Q4 partial-withdrawal is the prototype. The methodology amendment in Q3 (narrative-primary, tally-additive) addresses this, but the amendment has to be airtight. If the queen ever cites the tally *instead of* writing the narrative, the methodology has decayed.

**Joint vote (Q5).** Ceremony pays for itself on gate sessions (S005, S015) and on the 010↔013 interface-contract verification *if and only if* the cross-cite reveals divergence. Ceremony does not pay for itself on Author-only, Reduced Council (except S015 which we already flagged), enumeration-shaped Full Council (S002, S008, S011 substrate-mode). The ODR-0001 amendment Q3 named is the *minimum* methodology change required before any session uses hive-mind; the two-protocol concern is real but addressable by methodology framing (mode declared in session frontmatter). **Vote: 2-0 selective, gated by methodology amendment.**

---

## Q6 — Wholesale, selective, or none — recommendation

**Allemang:** Selective. Named sessions: **S005** (identity crux — conditional withdrawal pattern), **S015** (Address — UFO category cascades to S006 and S008), and **the 010↔013 interface-contract verification** *if and only if* the three-rule cross-cite (plan §4.1 last row) reveals divergence on first pass. Everything else stays Agent fan-out. No wholesale adoption. No Author-only or Reduced Council sessions.

The ODR-0001 amendment is non-negotiable. The methodology must name the two-artefact discipline (narrative-primary + tally-additive) before any session uses hive-mind. Otherwise the methodology has decayed before deployment.

Operationally: the queen of S005 declares in session frontmatter `consensus-mode: hive-mind/byzantine` (or whichever strategy). The queen of S002 declares `consensus-mode: agent-fan-out`. The methodology lists the strategies admitted per mode and the per-mode minimum apparatus. The session blueprint in plan §4 carries the mode declaration alongside the existing Format tier (Full Council / Reduced / Author-only). Mode and Format are orthogonal axes: Full Council can be Agent fan-out or hive-mind; Reduced Council can only be Agent fan-out (ceremony cost rules out hive-mind below n=6); Author-only is always Agent fan-out (or technically just a single queen run).

**Gandon:** Concur on the session list. I would add that the *programmatic vote output* from those sessions is itself a candidate for SPARQL-queryable state — if hive-mind's consensus output is serialised as RDF, the OPDA semantic-modelling lead can query "which sessions had >2 dissenters on the gate clearance question?" across the whole programme. That is a future affordance, not a Phase-1 requirement, but the selective adoption should preserve the option. The serialisation choice (Turtle in the session transcript appendix? JSON-LD in a sidecar file? Both?) is a question for the ODR-0001 amendment.

I will not push on Q4 (typed memory). Allemang's file-system clarity test holds today; if the markdown lint ever fails silently on a cross-session seam, we revisit.

One operational note: the plan's §1 ADR-0115 carve-out today reads as a *permission* ("use hive-mind only when the queen needs byzantine voting"). The amendment should re-cast it as a *requirement* for the named sessions ("S005, S015, and conditional 010↔013 MUST use hive-mind/byzantine; all other sessions MUST use Agent fan-out unless the queen documents a deviation"). The shift from permission to requirement is what gives the selective adoption its discipline. Permission is a slippery slope toward Council theatre.

**Joint recommendation (Q6).** **Selective adoption — three sessions: S005, S015, and 010↔013 interface verification (conditional).** **No Author-only, Reduced Council (other than S015), or enumeration-shaped Full Council uses hive-mind.** **Mandatory prerequisite: ODR-0001 amendment naming (a) the two-artefact discipline — narrative synthesis primary, structured tally additive appendix; (b) per-session `consensus-mode` frontmatter declaration; (c) the named-session requirement for hive-mind/byzantine on S005, S015, and conditional 010↔013.** **Vote: 2-0 selective, named-session, methodology-amendment-gated.**

---

## Where we agree

1. The current methodology's load-bearing output is the narrative synthesis, not the vote tally. Any protocol change must preserve that. Maintainers eighteen months from now read transcripts to reconstruct *why* the panel landed where it did; a tally without rationale is a tombstone.
2. Byzantine fault tolerance in its strict sense (f<n/3 over malicious actors) is not the relevant property; **structural vote acknowledgement** is. The same protocol gives both as a side-effect, but the property worth paying for is the acknowledgement guarantee, not the fault tolerance.
3. Hive-mind's consensus output is **additive**, not substitutive — both artefacts coexist; the narrative is the verdict, the tally is the count. Where they disagree (Davis-style partial withdrawal), the narrative wins.
4. Wholesale adoption is wrong. Author-only sessions never benefit (no panel to coordinate). Reduced Council below n=6 voices does not benefit (ceremony cost exceeds deliberation cost). Enumeration-shaped Full Council (independent per-row votes) does not benefit (no cross-conditional structure to exploit).
5. The selective list is: **S005 (identity crux — Guarino's three-condition withdrawal pattern), S015 (Address UFO category — cascades to S006/S008), and the 010↔013 interface-contract verification (conditional on the three-rule cross-cite revealing divergence on first pass).** S013 itself stays Agent fan-out — severity tiering is enumeration.
6. ODR-0001 must be amended to name the two-artefact discipline before any session uses hive-mind. The amendment specifies: (a) narrative-primary, tally-additive; (b) per-session `consensus-mode` frontmatter declaration; (c) the named-session *requirement* (not permission) for hive-mind/byzantine on the three sessions. Without the amendment, adoption is premature.
7. The ADR-0115 carve-out in plan §1 ("only when the queen needs explicit byzantine voting") is *under-calibrated* — it gestures at Byzantine voting but does not name when, and it conflates protocol choice with the narrative-vs-tally question. The amendment Q3 names is the cure.
8. The W3C precedent is *one Process document admitting multiple deliberation modes*, not protocol uniformity. The two-protocol concern (Agent fan-out vs hive-mind) is real but addressable by methodology framing: ODR-0001 names the modes; each session declares which one applies. This preserves the *Working Ontologist* discipline that maintainers learn one methodology, not two.

## Where we genuinely disagree

**Q4 — persistence of cross-session state.**

- **Gandon:** Adopt `hive-mind_memory` for the S009→S012 amendment loop and the S016 deferred-activation triggers. W3C-style structured cross-meeting state is canonical; minutes are derivative. Typed collective memory eliminates silent seam divergence between sessions running weeks apart.
- **Allemang:** Leave cross-session state in markdown — plan §4.1 + ODR `## References` + `odr-review` lint. The file-system reconstruction test is the *Working Ontologist* discipline. Typed memory in a vendor-specific MCP store fails legibility-from-disk.

Both positions are honest readings of the same trade-off. We do not converge.

The disagreement is not about whether silent seam divergence is a risk — we agree it is. The disagreement is about *which cure has the lower long-run failure mode*. Gandon weights *the seam never diverges because there is only one place it lives*. Allemang weights *the seam can be reconstructed from files on disk by a maintainer eighteen months from now without running the tooling that wrote it*. Both are correct framings of the same trade-off.

ODR-0001 amendment would need to choose. We would recommend defaulting to Allemang's position (markdown + lint) and revisiting if a cross-session seam divergence surfaces in practice that the lint did not catch. The cost of moving from markdown to typed memory later is moderate; the cost of moving from typed memory back to markdown later is high (because typed memory creates a vendor dependency the maintainer has to unwind). Asymmetric costs favour the defer.

---

## Operational addendum — per-session mode assignment if the recommendation is ratified

If a full Council ratifies the selective recommendation above, the per-session blueprints in plan §4 gain a `consensus-mode` field alongside the existing Format tier. Concrete assignment for the thirteen sessions in plan:

| Session | ODR | Format | `consensus-mode` | Rationale |
|---|---|---|---|---|
| 002 | 0002 Vocabulary catalogue | Full Council | `agent-fan-out` | Enumeration; per-row votes independent. |
| 003 | 0003 Programme anchor | Author-only | `agent-fan-out` | Single queen run; no panel. |
| 004 | 0004 Foundation | Full Council | `agent-fan-out` | URI policy + graph separation are mechanism decisions; votes independent. |
| **005** | **0005 Identity crux** | **Full Council** | **`hive-mind/byzantine`** | **Conditional withdrawal (Guarino three-condition gate); structural vote acknowledgement load-bearing.** |
| 006 | 0006 Agents & Roles | Full Council | `agent-fan-out` | UFO category votes are independent; Phase question (Q7) shared with 007 routes through §4.1, not through protocol. |
| 007 | 0007 Transactions | Full Council | `agent-fan-out` | Same. |
| 008 | 0008 Descriptive attrs | Full Council | `agent-fan-out` | Enumeration-shaped (declare-once-reconcile-overlays); votes independent. |
| 009 | 0009 Claims/Provenance | Full Council | `agent-fan-out` | DPV co-annotation routing handled in §4.1, not protocol. |
| 010 | 0010 Overlay profiles | Full Council | `agent-fan-out` | Profile mechanism votes independent; **interface-contract verification with 013 runs separately, see below.** |
| 011 | 0011 Enumerations | Full Council | `agent-fan-out` | Substrate-mode; SKOS scheme criteria are enumeration. |
| 012 | 0012 Governance | Full Council | `agent-fan-out` | DPV authoring questions independent; Phase-2 ambition deferred to 016 if it activates. |
| 013 | 0013 SHACL severity | Full Council | `agent-fan-out` | Severity per-shape; demoted from hive-mind in Q1. |
| **015** | **0015 Address & Geography** | **Reduced Council** | **`hive-mind/byzantine`** | **UFO category cascades to 006/008; structural acknowledgement load-bearing despite small panel.** |
| 016 | 0016 W3C VC/DID | Full Council (deferred) | TBD at activation | Question-set unknown until trigger fires; mode chosen at session frontmatter. |
| **010↔013 verification** | **(cross-cite check)** | **Reduced Council** | **`hive-mind/byzantine` (conditional)** | **Only if the three-rule cross-cite reveals divergence on first pass; otherwise Agent fan-out suffices.** |

Three sessions in `hive-mind/byzantine`; ten in `agent-fan-out`; one TBD; one conditional. The selective adoption is operationally light — most of the programme runs unchanged.

## Note on standing for the recommendation

Two voices is not a Council. This dialogue surfaces the trade-offs and proposes a position; the position requires a full Council session to ratify before any S005 / S015 / 010↔013 session adopts hive-mind. The natural panel for that session is broader than two — Kendall (methodology lead), Cagle (operational SHACL, has the strongest view on session-protocol cost), Hendler (W3C web architecture, weights URI-graph cleanness of the consensus output), Guarino (whose conditional withdrawal pattern in S005 is the prototype case), and Knublauch (owner of S005's downstream interface). Davis carries the DA seat — his scope-check-1 framing was *do we need 13 ODRs at all*; the parallel framing here is *do we need two protocols at all*. The methodology gap routes to ODR-0001 amendment queue alongside the artefact-engineering-vs-ontological-commitment gap from scope-check-1 Q6.

---

*Two-voice scoping dialogue, not a full Council session. Recommendation: selective adoption of hive-mind on three named sessions (S005, S015, conditional 010↔013), gated by ODR-0001 amendment naming the two-artefact discipline and per-session `consensus-mode` declaration. Split on Q4 (persistence) — default to Allemang's markdown position with revisit-on-failure trigger.*
