# Davis (DA): Devil's Advocate position on Hive-Mind Adoption

> **Role.** Devil's Advocate, OPDA Scope-Check 2 — should the Council adopt
> `mcp__ruflo__hive-mind_*` (init / consensus / vote / typed memory /
> persistence / broadcast / Byzantine fault tolerance) for some Council
> session types, or stay on Agent fan-out + Queen synthesis?
>
> **Lens.** BBC `/programmes/` publication-at-scale; data.gov.uk linked-data
> cookbook discipline; UK-Gov vocabulary WGs; Talis platform-engineering
> watchwords on operational complexity.
>
> **Brief.** Don't add machinery to solve a problem you don't yet have.

## Methodological frame

Same posture I brought to Scope-Check 1: **operational simplicity is a
feature of a publish-first programme**. The question here: do we adopt a
*coordination protocol* whose ceremony pays every session, in exchange
for properties (Byzantine fault tolerance, programmatic consensus,
persistent typed memory) whose value is *speculative* because the failure
modes they address haven't appeared in the two completed sessions?

Two priors:

1. **BBC `/programmes/`.** One TTL, one shapes graph, one URI policy, one
   editor-and-reviewer pair per change, one commit log. The decisions
   that mattered — `po:Brand` ⊥ `po:Series` ⊥ `po:Episode` — were
   ratified in the *same* lightweight process as label tightening.
   **The protocol scaled by staying readable.**
2. **data.gov.uk cookbook.** Where UK-Gov teams added consensus
   protocols, work slowed *and* the audit trail got worse — structured
   outputs crowded out the prose that captured reasoning. The cookbook
   ended up recommending minutes-style records with named voters.

That's the **reference class**. If hive-mind is right for OPDA, it
should be right despite these priors, not in ignorance of them.

## Q1 — Session-type fitness — for which session types does hive-mind add measurable value?

### Attack

The question presupposes some session type benefits. I dispute it.
Two sessions completed, two transcripts approved, an amended plan
defensible to a real WG. Agent fan-out produced both. The right
question is not "which sessions does hive-mind help?" but **"what
failure of the current pattern does hive-mind fix?"** — and the panel
has not named one.

Candidate high-stakes sessions:

- **009.** Pandit's Scope-Check 1 dissent produced a *refinement*
  (authorship → 0012). Plan A4 is **prose**, not a vote. Byzantine
  consensus would produce "8-1 keep separate"; the refinement isn't a
  tally.
- **014.** Hendler's permanence dissent: named, preserved in plan §9
  risks. The pattern handles permanent dissent that loses a vote.
- **005 (prospective).** Guarino's withdrawal condition is three
  commitments exemplar-validated — a **test-passes-or-fails gate**, not
  a consensus problem. Hive-mind doesn't validate exemplars.

### Evidence

- `session-001-pdtf-schema-to-ontology.md`: twelve experts, six
  teammates, seven questions, dissents recorded, ODRs 0002–0014
  spawned. Audit trail intact.
- `scope-check-1-programme.md`: nine experts, six teammates, eight
  questions, DA scorecard explicit.
- Working files in git. **Persistence is the filesystem.**

### Counter-proposal

Don't enumerate session types where hive-mind *might* help. Enumerate
**named operational failures** of the current pattern. The
steel-mannable candidates (vote tampering, cross-session memory loss,
synthesis bias) each have a cheaper countermeasure (git diff; grep;
the DA role). None are real failures of the two completed sessions.

### Vote

**DISSENT — no session type yet justifies hive-mind.** Keep Agent
fan-out as the default across all three formats. Revisit only if a
named failure surfaces.

---

## Q2 — Byzantine consensus — useful for OPDA's failure modes, or solving the wrong problem?

### Attack

Byzantine fault tolerance was invented for distributed systems where
nodes may *lie* — produce wrong outputs indistinguishable from honest
ones, with no human oversight. *f* < *n*/3 tolerance via super-majority.

**OPDA Council panellists are not Byzantine nodes.** They are named
experts whose dissents are the load-bearing output. Pandit's
authorship-routing refinement; Hendler's permanence dissent; Guarino's
IC gate — these are *signal*. ODR-0001 rule 5: "Record dissenting
positions verbatim." A Byzantine protocol would treat Pandit's lone
refining voice as a *fault* and suppress it. **That's the inversion of
what the Council exists to do.**

### Evidence

- **Scope-Check 1 Q5.** Eight "keep separate"; Pandit "keep separate
  **and** move authorship to 012." Byzantine output commits "keep
  separate" and discards the refinement. Queen synthesis captured both;
  the refinement became plan A4.
- **Scope-Check 1 Q4.** Hendler "keep both permanently"; eight "retire."
  Byzantine output: "retire." Queen synthesis: retirement *and*
  Hendler's dissent preserved in §9 risks. **Vote tallies erase
  dissent; transcripts preserve it.**
- **BBC `po:Episode` / `po:Version` deliberation.** Meeting, chair
  writes the verdict, dissents (including mine, which lost) preserved
  in the minute. No Byzantine consensus — the dissent was the most
  valuable output.
- **LOD precedent.** DBpedia, GeoNames, MusicBrainz, Wikidata — none
  use Byzantine consensus for vocabulary work. RFCs, mailing-list
  votes, named editors, prose.

### Counter-proposal

If anywhere, limit to **gate sessions with binary
test-passes-or-fails outcomes** (session-005; session-015). Even
there I'm sceptical — the gate is "exemplars validate or they don't,"
not "majority agrees they validate." Every other session type:
Byzantine is the wrong tool.

### Vote

**DISSENT — strong.** Byzantine consensus solves a problem OPDA does
not have by suppressing the signal the Council exists to preserve.

---

## Q3 — Narrative vs programmatic synthesis — what does hive-mind destroy that ODR-0001 values?

### Attack

ODR-0001 §"Session protocol" rule 6 names the Queen's synthesis as the
authoritative output, including **"rationale citing publications"** —
prose. It is the Queen reading Allemang's "different mechanisms"
against Hendler's "different URI graphs" and synthesising a verdict
that honours both. It is Pandit's authorship refinement landing as an
amendment because the Queen saw it was tighter than the binary vote.
Programmatic synthesis cannot do this. A vote tally is a derivative
output — *after* the synthesis, *for* downstream audit. A hive-mind
that elevates votes to the primary output flattens the deliberation
into its least informative summary.

### Evidence

- **Scope-Check 1 synthesis.** Prose. Names the DA scorecard, A1–A9
  amendments with justifications, and the Gandon-Guizzardi methodology
  gap routed to ODR-0001. **No vote tally output produces A9.**
- **Session 001 Q4 (Guarino's IC gate).** Queen synthesised Guarino's
  withdrawal condition into three concrete commitments and routed them
  to session-005. Prose routing, not consensus output.
- **BBC.** Our most valuable ontology decisions live in
  `dev.bbc.co.uk/blogs/...` posts — prose with named voters,
  reasoning, dissent. Still read ten years on. Vote tallies from the
  same era are forgotten.

### Counter-proposal

Narrative synthesis is **non-negotiable**. If hive-mind is adopted at
all (I'll oppose at Q6), it must be *additive* — votes alongside the
Queen's prose, never as replacement. The Queen retains authority to
override programmatic consensus where her synthesis surfaces a tighter
refinement, a load-bearing dissent, or a methodology gap. **The
Queen's pen is the protocol.**

### Vote

**DISSENT.** Narrative synthesis with vote tallies *inside* the prose
is the discipline that's working.

---

## Q4 — Persistence and resumability — necessary or noise?

### Attack

Hive-mind's typed memory is the most defensible part of the proposal —
I'll acknowledge honestly. **But it is not necessary.** Git provides
persistence; checkpointing is one `git commit` away; cross-session
memory is one `grep` away.

The 009 → 012 amendment loop is the case for persistence: Pandit's
session-001 dissent persists into Scope-Check 1 Q5 and becomes plan
A4. That persistence is *the filesystem*. Transcripts versioned,
working files versioned, plan versioned. **Git is the persistence
layer.** Hive-mind's typed memory becomes interesting only if queries
are typed (`{type: refinement, target: 0009}`). They aren't — they're
human ("find Pandit's DPV authorship dissent") and the answers are
markdown.

### Evidence

- **001 → Scope-Check 1 flow.** Human reading and synthesis. Queen's
  input documents named the source.
- **Reference class.** Every BBC / UK-Gov / data.gov.uk vocabulary
  programme used version control as the persistence layer. None needed
  a typed memory layer.
- **Concession.** If OPDA runs ten more sessions and cross-session
  reference burden grows, a typed index might pay. Future bridge.
  YAGNI.

### Counter-proposal

If burden grows, build an index post-hoc: `cross-references.md`
listing dissents, refinements, routing — maintained by the Queen at
session close, ~10 minutes per session, a markdown table. Same pattern
the data.gov.uk cookbook recommends.

### Vote

**CONDITIONALLY OK on persistence value; DISSENT on hive-mind as the
mechanism.** Git + a cross-references markdown delivers the narrow
real value. Hive-mind's typed memory delivers more than we need.

---

## Q5 — Cost-benefit — does ceremony pay for itself?

### Attack

Ceremony is paid every session; benefits are speculative and
concentrated in a few hypothetical high-stakes sessions.

**Costs:** `hive-mind_init` config surface; vote-as-tool-call overhead;
opaque state outside git (audit trail bifurcates); ODR-0001 amendment
debt; Queen/DA skill cost (currently the protocol is "write a markdown
file").

**Benefits:** programmatic vote tallies (already in markdown — net
zero); Byzantine fault tolerance (wrong problem per Q2 — net zero or
negative); persistence (git provides it per Q4 — net small);
broadcast/multi-process (Queen runs last, reads working files — not
needed).

### Evidence

- **Talis watchword.** Building data.gov.uk's publication platform:
  "every protocol addition must be justified by a named incident." We
  resisted speculative additions and shipped.
- **BBC ontology team.** Twelve people; one editor-and-reviewer per
  change; minutes per meeting; CHANGELOG per release. No consensus
  protocol. One of the most-cited public-sector ontologies in the world.
- **OPDA's two sessions.** Defensible outputs at low cost. Agent
  fan-out is the cheapest protocol satisfying ODR-0001's seven
  session-protocol rules. Cheaper violates; more elaborate pays for
  ceremony.

### Counter-proposal

Adoption rule: **adopt hive-mind for a session-type if and only if a
prior session of that type produced a specific, named failure
hive-mind would have prevented.** Today: zero incidents. Therefore
zero adoption. If session-005 (the IC gate) identifies a specific
Agent-fan-out failure, reconsider then.

### Vote

**DISSENT — ceremony pays every session; benefits speculative and
small.**

---

## Q6 — Wholesale, selective, or none?

### Attack

Three options: wholesale (every session), selective (some session
types), or none (Agent fan-out remains the default). My
recommendation: **none**.

The **selective** option is the tempting "compromise" — I'll attack it
directly. Selective adoption produces *two* protocols the Council must
maintain: two documentations, two training burdens, two audit-trail
shapes. Marginal cost of two protocols exceeds either one.
**Selective is the worst option, not the moderate one.**

The **wholesale** option: zero session has produced an incident
justifying hive-mind. Protocol expansion without exposed problem.
Reject.

The **none** option: Agent fan-out produced 001 and Scope-Check 1.
Both passed. Audit trails clear. Working.

### Evidence

- BBC `/programmes/` shipped on a single-protocol governance model.
- data.gov.uk cookbook recommends prose minutes + named voters.
- UK-Gov linked-data WGs ran in shared docs with votes in minutes.
- LOD community (DBpedia, GeoNames, MusicBrainz, Wikidata) never
  adopted Byzantine consensus for vocabulary work.
- OPDA's two completed sessions used Agent fan-out and produced
  defensible outputs.

Programmes that added consensus protocols slowed and produced worse
audit trails. Programmes that kept the protocol simple shipped.

### Counter-proposal

Adopt **none** wholesale. One narrow conditional exception:

- If session-005 (Guarino IC gate) surfaces a clearly-named Agent
  fan-out failure — a teammate file silently revised after Queen
  synthesis; a Queen mis-reading caught only post-commit;
  cross-session dissent retrieval taking >5 minutes — re-convene
  Scope-Check 2b and reconsider for that session-type only.
- Until then, Agent fan-out is the default. The existing ADR-0115
  carve-out (`hive-mind_spawn` "only when the queen needs explicit
  byzantine voting") **permits** adoption where a named need exists.
  No named need exists.

### Vote

**DISSENT against wholesale, DISSENT against selective.** Recommend
**NONE**; conditional re-opening only on a named operational failure.
Status quo (Agent fan-out + Queen narrative synthesis) is the
methodology that's working.

---

## Withdrawal conditions

The Council methodology rewards a DA who states, per question, what
would change their mind. I owe the panel this.

| Q | What would withdraw my dissent |
|---|--------------------------------|
| **Q1** | A panellist names a *specific* session-001 or Scope-Check 1 failure (not a hypothetical) that Agent fan-out produced and that hive-mind would have prevented. Pointer to the artefact (the broken transcript, the missed dissent, the duplicated decision) required. |
| **Q2** | A panellist demonstrates that OPDA Council panellists might in fact behave like Byzantine nodes (produce systematically mis-leading outputs the Queen can't catch in synthesis). I will accept this if a real example surfaces — but the example must be from the actual session corpus, not theoretical. |
| **Q3** | A panellist demonstrates that programmatic consensus output is *more* informative than the Queen's narrative synthesis on a specific completed-session question. Pointer to the better synthesis required — produced via hive-mind on the same input. |
| **Q4** | A panellist demonstrates that git-as-persistence has produced a concrete failure (e.g. a past dissent that took >15 minutes to re-locate; a routing decision lost between sessions). The 009 → 012 loop is *not* such a failure — it's the system working. |
| **Q5** | A panellist costs the ceremony honestly (estimated minutes per session for init, tool invocations, opaque-state management, documentation overhead) and shows benefits exceed costs on a per-session basis. Hand-waving on benefits will not withdraw. |
| **Q6** | A panellist shows that the selective option is in fact *cheaper* than maintaining one protocol — i.e. that two-protocol overhead is less than single-protocol overhead at OPDA's session volume. I doubt this can be shown, but the evidence would be a per-session minute-count for both options. |

If none of these withdrawal conditions are met during deliberation,
my dissents stand. The Queen, as in Scope-Check 1, retains authority
to synthesise around them — but the dissents are signal, not noise.

---

*Davis, DA, OPDA Scope-Check 2. Position: hive-mind adoption fails the
BBC `/programmes/`, data.gov.uk, and LOD-community reference classes.
No named operational failure of Agent fan-out has been demonstrated.
Status quo is the proven protocol.*
