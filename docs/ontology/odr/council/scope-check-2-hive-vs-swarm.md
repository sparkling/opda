# Council Scope-Check 2 — Hive-Mind vs Agent Fan-Out

- **Date:** 2026-05-26
- **Convened by:** OPDA semantic-modelling lead
- **Format:** ODR-0001 Linked Data Council with Devil's Advocate (Reduced Council; meta-methodology scope-check)
- **Queen / Moderator:** Elisa Kendall (OMG / EDM Council)
- **Devil's Advocate:** Ian Davis (BBC / UK Government linked-data; ex-Talis)
- **Method:** 6 expert voices across 4 teammates (agent-team pattern, same as Session 001 and Scope-Check 1 — appropriately self-applicative: deliberating *the methodology* using *the methodology*). Working files: `working/scope-check-2-hive-vs-swarm/<teammate>.md`.

## Panel (6 voices, 4 teammates)

| Teammate | Experts | Lens |
|---|---|---|
| kendall-queen | **Elisa Kendall (Queen)** | FIBO governance; epistemic protocol vs substrate |
| davis-da | **Ian Davis (DA)** | Publish-first; "name the failure first" |
| gandon-allemang | Fabien Gandon; Dean Allemang | W3C consensus practice + working-ontologist reader-economy |
| cagle-knublauch | Kurt Cagle; Holger Knublauch | Operational SHACL governance with stakeholders |

## Input documents

- ODR-0001 (methodology), the plan (`docs/plan/council-followup-sessions.md`).
- Scope-Check 1 transcript (`scope-check-1-programme.md`) — the precedent for meta-methodology Council.
- `mcp__ruflo__hive-mind_*` tool surface: init (raft / byzantine / gossip / crdt / quorum / weighted strategies; queenType strategic / tactical / adaptive); programmatic `hive-mind_consensus`; typed `hive-mind_memory`; persistence across processes; Byzantine fault tolerance (f<n/3); broadcast protocol.
- CLAUDE.md ADR-0115 carve-out: "Use `mcp__ruflo__hive-mind_spawn` only when the queen needs explicit byzantine voting".

## Context

Sessions 001 and Scope-Check 1 used **Agent fan-out** — named teammates spawned via Claude's Agent tool with `run_in_background: true`; each writes a position file in its own context window; Queen reads working files and writes a narrative synthesis with vote tallies, DA withdrawals, and recorded dissents inline. The pattern produced two transcripts Henrik has approved and an amended programme cut defensible to a future Working Group.

The plan's §1 currently says "use `hive-mind_spawn` only when the queen needs explicit byzantine voting; otherwise the agent-team pattern from session-001 is sufficient" (ADR-0115 carve-out). This scope-check tests whether that carve-out is correctly calibrated — should the 12 planned ratification sessions adopt hive-mind for some session shapes, or stay on Agent fan-out throughout?

Six questions, full panel.

---

## Q1 — For which session types does hive-mind add measurable value?

**Kendall (Queen):** REJECT for gate / substrate / module / cross-cutting / overlay / author-only — six of seven shapes. CONDITIONAL only for the ODR-0001 amendment session (Amendment A9 — Gandon-Guizzardi methodology gap), and even there pilot-first. Mapping every planned session against the FIBO governance test ("does the verdict resolve by examining ontological reality, or by aggregating votes?"), gate sessions (004/005/015) resolve by exemplar pass; substrate (011) by expert-grounded criteria; module (006/007/008) by per-Kind decision; cross-cutting (009/012) by amendable prose. None benefit from Byzantine aggregation.

**Davis (DA): DISSENT.** The question is wrong-framed — it asks "where might hive-mind help?" rather than "what failure of the current pattern does it fix?". Zero failures named. Two transcripts approved. Agent fan-out is the proven protocol. Revisit only if a named operational failure surfaces.

**Allemang:** Selective by *deliberation shape*. Agent fan-out works for *enumeration-shaped* sessions (S002 catalogue rows independent; S008 declare-once attribute reconciliation; S013 per-shape severity assignment). Hive-mind has potential value only for *cross-conditional* sessions where the verdict on one question changes whether subsequent questions even make sense — **S005 (identity crux — Guarino's three-condition withdrawal)** and **S015 (Address — UFO category cascades to S006/S008)**. S013 demoted from the candidate list because severity tiering is enumeration once 010↔013 verification runs separately.

**Gandon:** Same shape, framed as SPARQL federation. Agent fan-out is `SERVICE`-parallel — independent sub-queries union'd by the queen. Hive-mind is federation with shared bindings — sub-queries pass intermediate state, vote on consistency. Fitness test: *does the queen need to know two panellists' positions are mutually inconsistent before synthesising?* S002 catalogue: no. S005 IC: yes. Same list as Allemang.

**Cagle:** Selective by *downstream consumption*. The single session shape where hive-mind earns a place: **substrate sessions whose verdicts produce typed, machine-readable contract assertions consumed by downstream tooling**. ODR-0011 Q8 (UFO meta-category per scheme) is the natural probe — typed verdict (one of four categories per scheme), downstream-consumed (006/007/008/009/012 inherit per-scheme category), retire-safe.

**Knublauch:** Concurring with Cagle. SHACL WG itself uses named editors + narrative resolution + per-issue github votes — closer to Agent fan-out than hive-mind. The case for hive-mind is contract-level decisions where a tally drives downstream SHACL processing — severity tiering (ODR-0013) is the strongest example, but the *narrative justification* (audit trail a regulator wants) is the per-expert position-file content, not the vote tally. ODR-0011 Q8 is the lower-risk probe.

**Vote: 5-1 SELECTIVE adoption with disagreement on which session.** Three distinct rationales surface:
- **Cross-conditional voting** — S005, S015 (Gandon, Allemang).
- **Typed downstream consumption** — S011 Q8 (Cagle, Knublauch).
- **Meta-methodological** — A9 (Kendall, conditional pilot only).

Davis (DA) holds DISSENT pending a named operational failure.

**Verdict.** SELECTIVE adoption. The three rationales are complementary criteria — a session satisfying any one is a candidate. Recommend piloting **one session per rationale** to test which produces measurable benefit; expand only after demonstrated value.

---

## Q2 — Byzantine consensus: useful for OPDA's failure modes?

**Kendall (Queen):** REJECT for all session types. Byzantine fault tolerance models *adversarial* nodes (lying, sending contradictory messages). The Council's failure modes are categorically different — silent rubber-stamping (mitigated by DA + no-vote-padding); missing dissent capture (mitigated by per-question verbatim dissent); panel padding (mitigated by named-expert discipline); wrong-stub deliberation (mitigated by pre-flight scope check). None are Byzantine.

**Davis (DA): DISSENT, strong.** Byzantine consensus would *invert* what the Council exists to do. Pandit's session-001 DPV dissent; Hendler's 0014-permanence dissent; Guarino's IC gate — these are *signal*, not faults to tolerate. Byzantine output flattens "8-1 keep separate + Pandit's authorship refinement" into "keep separate" and discards the refinement. *The dissent is the most valuable output*. BBC `po:Episode` deliberation, LOD community (DBpedia/GeoNames/MusicBrainz/Wikidata) — none use Byzantine consensus for vocabulary work. RFCs and named editors instead.

**Gandon:** REFRAME. Byzantine fault tolerance in its strict f<n/3 sense is *not the relevant property*. The relevant property is **structural vote acknowledgement** — the same protocol *as a side-effect* guarantees that every named expert's position is registered against every question, with no silent gaps and with explicit handling of positions outside the ballot. For S005 Q4 (UPRN status), if Hendler floats a third position outside the binary ballot, the protocol surfaces the abstention; narrative would have done the same if the Queen noticed.

**Allemang:** Concur with Gandon's reframe. f<n/3 is overkill for a 9-voice panel where every voice is a Claude-spawned teammate. The acknowledgement guarantee matters for gate sessions; structural protocol gives it for free. For independent-vote sessions, `odr-review` lint of the working/ directory does the same job cheaper.

**Cagle:** Byzantine consensus answers the wrong question. The trust problem in Council is *citation grounding* — every position must ground in published methodology. ODR-0001 §"Session protocol" Rule 3 already enforces that, and `odr-review` lints it. Byzantine protocols cannot enforce citation grounding; linting can.

**Knublauch:** Concurring. Council runs in one machine, one process, one transcript. No network partition; no offline voter. If a teammate fails to produce a position file, the Queen sees the gap immediately. The failure surface Byzantine machinery is built for does not exist. Byzantine consensus matters in distributed *trust frameworks* (multi-party VC issuance — ODR-0016's eventual world), not in Council deliberation.

**Vote: 6-0 REJECT Byzantine consensus as the relevant property.** Gandon's reframe carries — **structural vote acknowledgement** is the worth-paying-for side-effect for cross-conditional sessions; pure f<n/3 fault tolerance is the wrong framing for Council's failure modes.

---

## Q3 — Narrative synthesis vs programmatic consensus output: what does hive-mind preserve / destroy?

**Kendall (Queen):** Hive-mind's programmatic output **destroys the narrative if it replaces** the synthesis; **neutral or mildly helpful if it runs alongside**. ODR-0001 §"Synthesis report" specifies a prose synthesis with structured tallies *embedded inside it* — "rationale citing publications", "agreed amendments to the proposal", "recommended approach". Four of seven items are prose-shaped. A vote tally is a subset, stripped of the synthesis-sentence shape that makes the deliberation reconstructable.

**Davis (DA): DISSENT.** Narrative synthesis is non-negotiable. ODR-0001 Rule 6 names "rationale citing publications" — prose. Scope-Check 1 A9 (the methodology-gap amendment) was produced by Queen synthesis, *not* a vote tally. **A9 cannot be generated by any vote count.** The Queen's pen is the protocol. Hive-mind that elevates votes to primary output flattens deliberation into its least informative summary.

**Allemang:** Narrative is load-bearing. Maintainers eighteen months from now read transcripts to reconstruct *why* the panel landed where it did. A tally without rationale is a tombstone. *But*: where two artefacts coexist (narrative + tally appendix), the temptation is for the Queen to *defer to the tally* on close questions — Davis's Q4 partial-withdrawal nuance is exactly what a tally rounds off.

**Gandon:** W3C consensus practice is *both* — meeting minutes (narrative) AND resolution table (structured tally). Two artefacts, one transcript. Hive-mind's `hive-mind_consensus` output is **additive**, not substitutive. If adopted: **narrative-primary, tally-additive appendix.** Where they disagree, the narrative wins.

**Cagle:** The programmatic-tally surface creates **gravitational pull toward synthesis-as-tally**. Default behaviours of consensus protocols tend toward generating a structured verdict object *instead of* writing prose. Adoption must be preceded by an ODR-0001 amendment explicitly stating that programmatic tallies are one row of the synthesis table, not the synthesis.

**Knublauch:** TopBraid customer practice: the tally is the easy part. The *reason* a property got assigned `sh:Violation` rather than `sh:Warning` is the audit trail a regulator asks for. Hive-mind preserves narrative *if the queen is instructed to preserve it*; destroys it if the queen substitutes. The per-expert position file requirement must remain non-negotiable.

**Vote: 6-0 narrative-primary, tally-additive (if at all).** Davis dissents that even additive is too much; the other 5 accept additive *conditional on an ODR-0001 amendment* naming the discipline. **The ODR-0001 amendment is a hard prerequisite — 6 of 6 voices require it before any session uses hive-mind.**

---

## Q4 — Persistence and resumability: necessary or noise?

**Kendall (Queen):** REJECT. Git is the persistence layer. The 009→012 amendment loop is already resumable: 012 reads 009's transcript + ratified ODR + plan §4.1, writes `## Supersession scope:` in the same commit. S016 deferred-activation: triggers specified in 002 and 009 prose; Queen reads when trigger fires. No persistent hive-mind state required.

**Davis (DA):** CONDITIONALLY OK on persistence *value*; DISSENT on hive-mind as the *mechanism*. Persistence value is real (the 009→012 loop, S016 deferred trigger). Mechanism is wrong — git + a `cross-references.md` markdown maintained by the Queen at session close delivers the narrow real value cheaply. Typed memory in a vendor-specific MCP store is more than needed.

**Allemang:** Markdown wins on the *Working Ontologist* legibility-from-disk test. Maintainer eighteen months from now opens `docs/plan/council-followup-sessions.md` §4.1 and reads the routing table. She doesn't need `hive-mind_memory.query(...)`. She doesn't need the MCP server running. Markdown passes the reconstruction test; typed memory in vendor-specific storage fails.

**Gandon:** **SPLIT — adopt `hive-mind_memory` for cross-session state on the S009→S012 amendment loop and S016 deferred-activation triggers.** W3C-style structured cross-meeting state is canonical; minutes are derivative. The seam (plan §4.1 row + ODR `## References` + `odr-review` lint) is *three artefacts* the maintainer composes mentally. Typed memory composes them into one. Cost is MCP dependency; benefit is the seam cannot diverge silently.

**Cagle:** Git suffices. OPDA sessions are one work-day from convening to synthesis. The whole transcript is in git; the per-position files are in git; the ODR amendments are in git. Two sources of truth (git + typed memory) is one too many.

**Knublauch:** Persistence helps multi-day sessions — but **the right layer is ODR-0003 (programme anchor), not the Council**. ODR-0003's `## Rules` table is already the work-breakdown anchor; if cross-session queryable state is needed as the 14-session arc progresses, that's where it goes. AgentDB-backed persistence would be a parallel implementation of what ODR-0003 already does in prose.

**Vote: 5-1 markdown/git over hive-mind_memory.** Gandon alone for typed memory; the 5 converge on git+markdown as sufficient. *But* the operational conclusion converges across all 6: persistence is a *programme concern* (ODR-0003), not a *Council concern*.

**Asymmetric-cost argument carries (Allemang).** Markdown → typed memory later is cheap; typed memory → markdown later is expensive (vendor unwinding). Default to markdown; revisit only if a markdown lint failure surfaces.

---

## Q5 — Cost-benefit: does the ceremony pay for itself?

**Kendall (Queen):** REJECT wholesale; CONDITIONAL exception for A9. Costs are real: ~10-30 minutes per-session convening overhead; 5-10% token cost; doubled cognitive surface for Queens; bifurcated audit trail for future maintainers. Benefits already provided: vote tallies (`N-M-K` convention); recorded dissent (verbatim); DA withdrawal (explicit convention); cross-session amendment (DCAP `## Supersession scope:`); resumability (git). What hive-mind uniquely provides — Byzantine FT (wrong problem), programmatic broadcast (destroys deliberation), typed memory (duplicates git) — adds nothing for the 12 planned sessions.

**Davis (DA): DISSENT.** Ceremony pays every session; benefits speculative and small. Talis watchword on building data.gov.uk: "every protocol addition must be justified by a named incident." Today: zero incidents. Therefore zero adoption. Hand-waving on benefits will not withdraw.

**Allemang:** Cost rule: ceremony is roughly fixed per session; deliberation scales with question count × voice count × conditional-dependency. Hive-mind pays off when deliberation cost > 5× ceremony cost. **S002 (8 catalogue rows × independent): doesn't pay. S005 (8 questions × 9 voices × conditional withdrawal): pays.** Second cost surfaced: learnability — two protocols mean maintainer learns two methodologies. Selective adoption already accepts this cost.

**Gandon:** Amortised cost. ODR-0001 amendment paid once; per-session ceremony paid n times. Selective recommendation captures this — paying for the gate sessions only. Hidden cost flagged: hive-mind introduces a new failure mode — the consensus protocol returns a tally that the queen's narrative would have rendered as a more nuanced verdict. The Q3 amendment (narrative-primary, tally-additive) must be airtight.

**Cagle:** Every protocol pays a ceremony tax. The agent-fan-out's tax (6-8 agent runs per Full Council + position-file discipline + Queen synthesis) has paid for itself. Hive-mind tax adds consensus-strategy selection, typed memory schema, persistence layer, programmatic vote API. Two are per-session decisions — choice surface costs time. The tax pays only for ODR-0011 substrate use; not for general adoption.

**Knublauch:** TopBraid customer pattern: shared editing with named tracked changes works for 95% of cases; formal consensus pays its tax when (a) panel size >6 genuinely-disagreeing voters, or (b) verdict is *contractual* (regulator-facing assertion). OPDA Council has ≥6 voters per Full Council, but voters are named simulated experts, not stakeholders with veto power. The contractual case is ODR-0013 severity tier — even there, narrative justification (the audit trail a regulator wants) is the per-expert position file content, not the vote tally.

**Vote: 6-0 cost-benefit fails wholesale; selective only on named pilot sessions.** Three voices specifically identify gate sessions (S005, S015 — Gandon/Allemang) and substrate sessions (S011 Q8 — Cagle/Knublauch) as the narrow band where tax pays.

---

## Q6 — Wholesale, selective, or none?

**Kendall (Queen):** SELECTIVE — and the selection is one session only: the ODR-0001 Amendment A9 (Gandon-Guizzardi methodology gap). Pilot first, time-bounded, prose synthesis parallel. If pilot demonstrates measurable benefit, consider extending; if not, drop. **Do not roll forward to subsequent sessions on ceremonial grounds.**

**Davis (DA):** NONE wholesale. Selective is the worst option, not the moderate one — two protocols cost more than one (two documentations, two training burdens, two audit-trail shapes). Marginal cost of two protocols exceeds either one. **Recommend none.** Conditional re-opening only on a named operational failure of Agent fan-out — a teammate file silently revised after Queen synthesis; a Queen mis-reading caught only post-commit; cross-session dissent retrieval taking >5 minutes. Until then, status quo.

**Allemang:** SELECTIVE — named sessions: **S005 (identity crux — conditional withdrawal pattern)** and **S015 (Address — UFO category cascades to S006/S008)**. **Conditional S010↔S013 interface-contract verification** if the three-rule cross-cite reveals divergence on first pass. Everything else stays Agent fan-out. ODR-0001 amendment is non-negotiable.

**Gandon:** Concurring with Allemang. Add: the programmatic vote output from those sessions is itself a candidate for SPARQL-queryable state if serialised as RDF. The ADR-0115 carve-out today reads as *permission* ("use only when needed"); the amendment should re-cast it as *requirement* for the named sessions ("S005, S015, conditional S010↔013 MUST use hive-mind/byzantine; others MUST use Agent fan-out unless documented deviation"). Permission is a slippery slope toward Council theatre.

**Cagle:** SELECTIVE — single-session probe at **ODR-0011 Q8 (UFO meta-category per scheme)**. Typed verdict; downstream-consumed; retire-safe. If the probe demonstrates the verdict object survives in downstream tooling (generator emits `opda:ufoCategory` triples; `odr-review` lints scheme-category coherence), extend to ODR-0013. If it stalls or produces unreadable synthesis, retire.

**Knublauch:** Concurring with Cagle. **One operational guardrail:** hive-mind adoption requires an amendment to ODR-0001 §"Session document conventions" specifying that per-expert position files remain non-negotiable; programmatic tally is one cell in the synthesis, not the synthesis; Queen still writes prose; DA still attacks and withdraws explicitly. Without that amendment, protocol drift toward tally-substitution is hard to fight in the moment.

**Vote: 5-1 SELECTIVE; 1 NONE.** Davis (DA) holds NONE. Five voices select with disagreement on which session(s):

| Recommended pilot | Voices | Rationale |
|---|---|---|
| **S005 (Identity crux)** | Gandon, Allemang | Cross-conditional voting — Guarino's three-condition withdrawal pattern |
| **S015 (Address)** | Gandon, Allemang | Cross-conditional voting — UFO category cascades to S006/S008 |
| **S011 Q8 (UFO meta-category per scheme)** | Cagle, Knublauch | Typed downstream consumption — generator-consumable verdict |
| **A9 (ODR-0001 amendment)** | Kendall | Meta-methodological — self-applicative test |
| **S010↔S013 interface verification** | Gandon, Allemang (conditional) | Only if three-rule cross-cite reveals divergence |

---

## Synthesis (Queen Kendall)

**Headline verdict.**

**5-1 SELECTIVE with three concurring rationales and one DA dissent.** Davis attacks 5 of 6 questions and withdraws conditional on Q4 only; his dissents on Q1, Q3, Q5, Q6 are recorded as live, not silenced. The five other voices converge on selective adoption but split on which session(s) to pilot.

**Devil's Advocate scorecard.**

Davis dissented on Q1 (no session-type fitness named), Q2 (Byzantine wrong problem — *aligned with panel reframe*), Q3 (narrative non-negotiable — *aligned with panel*), Q4 (conditional on value, dissent on mechanism — *partial alignment*), Q5 (ceremony pays every session, benefits speculative), Q6 (NONE wholesale; selective is worst, not moderate). Of 6 dissents:

- Q2 aligned with panel reframe (Byzantine → acknowledgement).
- Q3 aligned with panel (narrative-primary).
- Q4 partially aligned (persistence value real; mechanism wrong).
- Q1, Q5, Q6 held against panel.

Three concurrences out of six is a strong DA outcome — the methodology is healthier for his attacks. His Q1/Q5/Q6 holds set the **withdrawal condition**: pilots must demonstrate *measurable benefit on a specific failure case*, not just structural appeal.

**Universal agreements (6-0).**

1. **REJECT wholesale adoption.** No session shape benefits universally; the cost-benefit fails outside a narrow band.
2. **REJECT Byzantine consensus as the framing.** Reframe to **structural vote acknowledgement** (Gandon/Allemang) — the worth-paying-for side-effect for cross-conditional sessions; f<n/3 fault tolerance is the wrong property.
3. **MANDATE ODR-0001 amendment** before any pilot. Non-negotiable. The amendment must specify:
   - Two-artefact discipline: narrative synthesis primary, structured tally additive appendix.
   - Per-expert position-file requirement non-negotiable.
   - Per-session `consensus-mode` frontmatter declaration.
   - The named-session *requirement* (not permission) for hive-mind on pilot sessions.
4. **PRESERVE prose synthesis.** Where tally and narrative disagree, narrative wins.
5. **Persistence is a programme concern, not a Council concern.** ODR-0003's `## Rules` is the right home for cross-session queryable state; markdown + lint suffices today.

**The selective-adoption split.**

The panel converges on selective adoption but cannot agree on which session(s) to pilot. Three distinct rationales:

| Rationale | Session(s) | Voices | What it tests |
|---|---|---|---|
| **Cross-conditional voting** — structural vote acknowledgement matters because Q-N's verdict depends on Q-M's | S005 (Identity crux); S015 (Address) | Gandon, Allemang | Does explicit acknowledgement catch conditional-withdrawal mis-reads that prose would miss? |
| **Typed downstream consumption** — verdict produces a structured object the generator consumes | S011 Q8 (UFO meta-category per scheme) | Cagle, Knublauch | Does a typed verdict enable downstream tooling that prose synthesis cannot? |
| **Meta-methodological** — verdict re-reads every prior session under a chosen reading | A9 (ODR-0001 methodology amendment) | Kendall | Does programmatic Queen-type setting surface a per-question disagreement pattern? |
| **Interface-contract verification (conditional)** | S010↔S013 | Gandon, Allemang | Only if three-rule cross-cite reveals divergence |

These are **complementary criteria**, not contradictory. A session satisfying any one is a candidate. The natural resolution: **pilot the two strongest-supported rationales in parallel**, evaluate against Davis's withdrawal conditions, and extend only if demonstrated.

**Recommended pilots (Queen synthesis).**

| Pilot | Format | Rationale tested | Retire-trigger |
|---|---|---|---|
| **S005 (Identity crux gate)** | Full Council, `consensus-mode: hive-mind/byzantine` | Cross-conditional voting — Guarino's three-condition withdrawal | If structural acknowledgement adds nothing beyond what `odr-review` lint already catches |
| **S011 Q8 (UFO meta-category per scheme)** | One question within Full Council, `consensus-mode: hive-mind/typed-output` | Typed downstream consumption — generator-consumable verdict | If the typed verdict surface is consumed only by humans (no actual downstream tooling reads it within MVP) |

A9 (Kendall's choice) is *not* the pilot — A9 is the **prerequisite ODR-0001 amendment session** that admits hive-mind into the methodology before pilots run. A9 runs as Author-only / Reduced Council in Agent fan-out (self-applicative test of the existing protocol on the methodology amendment that admits the new protocol).

S015 (Gandon/Allemang's second choice) is deferred to a post-pilot evaluation — if S005's hive-mind pilot demonstrates value, S015 inherits the same `consensus-mode`; if S005 fails, S015 stays Agent fan-out.

S010↔S013 verification is conditional per the original proposal — only fires if the three-rule cross-cite reveals divergence.

**Davis's withdrawal conditions — operational reframing.**

Pilots are *experiments testing hypotheses*, not premature solutions. Each pilot has a specific hypothesis tied to a Davis withdrawal condition:

- **S005 pilot:** Does structural vote acknowledgement catch a Pandit-style refinement (Scope-Check 1 Q5) or a Hendler-style permanence dissent (Q4) that narrative would have missed? If yes, Davis withdraws on Q1; if no, hive-mind retires.
- **S011 Q8 pilot:** Does the typed verdict object enable downstream tooling consumption (generator, lint) that prose cannot? If yes, Davis withdraws on Q5; if no, hive-mind retires.

**Agreed amendments.**

| # | Amendment | Justification | Affects |
|---|---|---|---|
| **B1** | **Run A9 first as Agent fan-out** to amend ODR-0001 with the two-artefact discipline and `consensus-mode` declaration. | 6-0 amendment-required-before-pilot. | ODR-0001 (new sub-section in §"Session document conventions"); plan §1 (ADR-0115 carve-out re-cast from permission to requirement for pilot sessions). |
| **B2** | **Pilot S005 (Identity crux gate) with `consensus-mode: hive-mind/byzantine`.** Prose synthesis parallel (narrative-primary, tally-additive). Hypothesis: structural vote acknowledgement catches cross-conditional patterns prose would miss. | Gandon/Allemang vote + cross-conditional rationale; addresses Davis Q1 withdrawal condition. | Plan §4 Session 005 blueprint (add `consensus-mode` field); plan §5 (note pilot session). |
| **B3** | **Pilot S011 Q8 (UFO meta-category per scheme) with `consensus-mode: hive-mind/typed-output`.** Single question, not full session. Hypothesis: typed verdict enables downstream tooling. | Cagle/Knublauch vote + typed-downstream rationale; addresses Davis Q5 withdrawal condition. | Plan §4 Session 011 blueprint (Q8 sub-mode); plan §5 (note pilot question). |
| **B4** | **Defer S015, S010↔S013 verification, and wholesale rollout to post-pilot evaluation.** Decisions land only after S005 + S011 Q8 retire or extend. | Panel split on these; pre-empting violates Davis's "name the failure" discipline. | Plan §5.1 (post-MVP path note). |
| **B5** | **REJECT Byzantine consensus as the framing programme-wide.** Reframe to structural vote acknowledgement; ODR-0001 amendment carries this clarification. | 6-0. | ODR-0001 amendment; plan §1 carve-out. |
| **B6** | **Persistence stays markdown.** Allemang's asymmetric-cost argument carries. Revisit only if `odr-review` lint produces a silent seam divergence in practice. | 5-1 (Gandon for typed memory; 5 for markdown); convergent operational conclusion: persistence is ODR-0003's concern. | None (default position; document in plan §9 risks). |
| **B7** | **Davis's Q1/Q5/Q6 dissents recorded in plan §9 risks** as live. Hendler-shaped: ceremony-paid-every-session vs benefits-specuative-only is a permanent methodological tension that must be re-evaluated at every pilot retire-or-extend decision. | Davis DA scorecard. | Plan §9 risks (new row). |
| **B8** | **Pilot evaluation criteria** — explicit in ODR-0001 amendment: after each pilot session, the Queen writes a one-page evaluation noting whether the consensus-mode added value, with retire-or-extend decision. | Panel agrees pilots must be retire-safe. | ODR-0001 amendment; plan §8 execution checklist. |

**Net effect on the plan and ODR-0001.**

- **ODR-0001 amendment (A9, runs first, Agent fan-out)**: adds `consensus-mode` to session document conventions; admits hive-mind for *named pilot sessions only*; reframes Byzantine → structural vote acknowledgement; reserves judgment on wholesale adoption.
- **Plan amendment**: §4 Session 005 and Session 011 blueprints gain `consensus-mode` declaration; §5 sequencing notes pilot status; §9 risks gain Davis's held dissents (Q1/Q5/Q6); §11 pre-flight checklist references pilot evaluation criteria.
- **Programme cost**: A9 runs as small Reduced Council session (~3 agent runs); pilots add ~10-30 minutes of ceremony each (per Q5 estimate). Net cost increment: small.

**Methodology gap from Scope-Check 1 (A9) status.**

A9 surfaces the Gandon-Guizzardi gap (artefact-engineering vs ontological commitment). This scope-check (Scope-Check 2) surfaces a *parallel* methodology gap: **how does the Council methodology pilot new mechanisms without committing to them?** The two gaps share a shape — both are about the methodology's own self-amendment process. Both route through ODR-0001 amendment queue. The A9 session can carry both questions if convened that way; alternatively, A9 and "consensus-mode framework" run as two amendments to ODR-0001 in the same Author-only / Reduced Council session.

**Whether ODR-0003 needs revision.**

Yes — work-breakdown table gains a pilot indicator on S005 and S011; cost table notes hive-mind ceremony cost where applicable; dependency graph unchanged.

**Closing position.**

The Council methodology has produced two transcripts and a defensible programme amendment using Agent fan-out. The case for switching wholesale fails on 6 of 6 questions. The case for adopting selectively succeeds on 5 of 6 questions, but the panel cannot agree on which session(s) to pilot — three distinct rationales (cross-conditional voting; typed downstream consumption; meta-methodological) point at four different candidate sessions.

**The path forward is to pilot two sessions** representing the two strongest-supported rationales (Cross-conditional → S005; Typed downstream → S011 Q8), gated by an ODR-0001 amendment that protects narrative discipline and per-expert position-file requirements. Each pilot has a specific hypothesis tied to a Davis withdrawal condition; retire-safe if the hypothesis fails.

Davis's dissent on selective ("two protocols cost more than one") is the strongest held objection. The mitigation: **two pilots is the *evaluation budget*, not the *adoption commitment*.** If neither demonstrates measurable benefit, both retire and the methodology stays Agent fan-out throughout. The cost of running two pilots is bounded; the cost of *not* testing is permanent methodological speculation.

Hive-mind earned its conditional place in OPDA Council methodology through this deliberation. It has not earned wholesale adoption, and it may not earn adoption at all. Two pilots will tell us which.

---

*Transcript compiled by Elisa Kendall (Queen), Scope-Check 2, 2026-05-26.*
*All 6 voting voices participated across 4 teammates. Devil's Advocate (Davis) attacked 5 of 6 questions; aligned with panel on Q2 reframe and Q3 narrative-primary; partial alignment Q4; held on Q1, Q5, Q6 — recorded as live in plan §9 risks.*
*Selective-adoption split surfaced: Gandon/Allemang for S005/S015; Cagle/Knublauch for S011 Q8; Kendall for A9. Resolution: two pilots (S005 + S011 Q8) testing distinct rationales.*
*Persistence: Allemang's asymmetric-cost argument carries; markdown + lint default; revisit only on silent seam divergence.*
*ODR-0001 amendment (A9) is the hard prerequisite — runs first as Author-only/Reduced Council in Agent fan-out, before either pilot.*
*Next action: ratify B1 (ODR-0001 amendment), then run S005 pilot under `consensus-mode: hive-mind/byzantine` and S011 Q8 pilot under `consensus-mode: hive-mind/typed-output`. Each pilot's retire-or-extend decision lands at session close.*
