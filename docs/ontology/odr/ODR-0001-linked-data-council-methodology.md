---
status: accepted
date: 2026-05-27
kind: methodology
tags: [methodology, council, governance, portable]
scope: []
supersedes: []
depends-on: []
implements: []
---

# Linked Data Council: Review Methodology

## Context

Ontology mapping and ontology modelling projects — programmes that translate source data (JSON Schema, relational schemas, XSD, RDF, glossaries, data dictionaries) into a linked-data ontology with namespace strategy, vocabulary selection (SKOS / OWL / SHACL / DCAT / DPV / PROV-O / FIBO), bounded-context boundaries, mapping conventions to external ontologies, classification facets, and validation severity — require balancing formal correctness, pragmatic tooling constraints, industry precedent, and the domain-specific realities of the source data they translate. No single perspective covers all of them: an OWL purist may overlook tooling gaps; a pragmatist may miss formal pitfalls; a standards expert may not account for the domain's existing data shape; an enterprise-architecture expert may not weigh open-data and public-sector linked-data conventions.

A reproducible, multi-perspective review process is needed whose outputs are auditable and citable, and whose verdicts can be revisited as the experts' published positions are stable across sessions. Real-expert consultation is slow and non-reproducible; generic best-practice appeals produce vague rationale future maintainers cannot interrogate. The methodology must be grounded in authority, reproducible, and self-documenting — and it must be **portable across projects** without each adoption rewriting the protocol.

This methodology was developed in two ontology-modelling programmes — the H&M semantic-modelling programme and the OPDA (Open Property Data Association) linked-data programme — and is published here as a general-purpose instruction set. Adopting projects supply their own context via declared adoption hooks (§Adoption); the methodology body itself is project-agnostic.

**Pattern lineage.** This methodology codifies the **Council Hive** pattern — a dialectic review of a proposition by N named experts citing their published methodology, with one Devil's Advocate, producing a verdict with structured transcript. The Council Hive is one of four canonical hive-mind patterns; three siblings (Consensus Decision Hive — propose-vote-resolve with no dialectic; Implementation Hive — coordinated development with consensus checkpoints; Review Hive — multi-perspective code/design review with severity vote) are **out of scope for this methodology**. They share substrate primitives (see §Config options) but follow different protocols and produce different outputs. Practitioners reaching for "use the Council methodology" for a non-dialectic decision are misapplying it; the methodology is the Council Hive specifically.

## Decision

Adopt the **Linked Data Council** — a simulated panel of named linked-data and ontology authorities whose published positions, W3C specifications, books, and deployment experience are used to evaluate ontology-modelling design decisions from multiple perspectives — because it is the only option that simultaneously delivers multi-perspective coverage, authority-grounded rationale, reproducibility, and an auditable record at a cost proportionate to the significance of the decision. A Council verdict shapes a *proposal*; adoption remains the role of the adopting project's real-world governance (the project declares its governance body via §Adoption).

## Rules

These rules define the standing apparatus and per-session protocol of the Linked Data Council. They are project-agnostic; each adopting project supplies its own context via the §Adoption hooks below.

### Standing Panel (9 experts)

The methodology's canonical roster. Their published positions are stable and domain-agnostic; adopting projects MAY weight specific experts more heavily for their domain (declared via §Adoption) but the roster itself is fixed.

| Expert | Affiliation | Perspective |
|--------|-------------|-------------|
| Dean Allemang | *Working Ontologist* | Pragmatic RDF modelling, enterprise KG practice |
| Jim Hendler | W3C / RPI | OWL formal semantics, web architecture |
| Elisa Kendall | OMG / EDM Council | Enterprise ontology patterns, FIBO methodology |
| Kurt Cagle | *The Ontologist* | SHACL practitioner, taxonomy design, AI integration |
| Fabien Gandon | W3C / Inria | RDF/RDFS/OWL standards, linked-data principles |
| Tom Baker | Dublin Core | Namespace design, metadata standards, vocabulary governance |
| Ian Davis | BBC / UK Gov | Linked-data deployment at scale, government data patterns |
| Giancarlo Guizzardi | NEMO / UniLu | Foundational ontology (Kind/Role/Phase), UFO, OntoUML |
| Nicola Guarino | ISTC-CNR | Formal ontology theory, identity criteria, DOLCE |

### Extended Panel (domain-specific guests)

Added when the question genuinely depends on the expertise. Adopting projects MAY pre-elect a subset as routinely-applicable via §Adoption; remaining candidates are case-by-case.

| Expert | When to include |
|--------|-----------------|
| Holger Knublauch (TopQuadrant) | SHACL-specific technical questions |
| Antoine Isaac / Alistair Miles | SKOS-specific (concept schemes, mappings, broader/narrower semantics) |
| Eric Evans / Vaughn Vernon | Bounded-context and domain-modelling questions |
| Zhamak Dehghani | Data ownership and mesh architecture (multi-stakeholder data) |
| Harith Alani / John Domingue | Open-data publishing patterns |
| Ranganathan / ISO 25964 reference | Faceted classification or thesaurus questions |
| Luc Moreau | PROV-O provenance modelling |
| Renato Iannella / Harshvardhan Pandit | ODRL / DPV (consent, policy, data-rights) |
| Manu Sporny / Drummond Reed | W3C VC / DID / Trust Framework interop |

Do not pad the panel for show. If a guest expert has nothing distinctive to add over the standing nine, leave them out.

### Roles for every session

- **Queen / Moderator** — one expert from the standing or extended panel, named explicitly. Frames the questions, sequences the deliberation, calls votes, and writes the synthesis. The Queen still votes.
- **Devil's Advocate (DA)** — one expert, named explicitly. Their job is to attack the proposal: identify procedural violations, missing constraints, logical gaps, alternative interpretations the panel may have skipped. The DA is expected to lose votes and to withdraw objections when persuaded — both are recorded. **The DA MUST explicitly withdraw or hold on every contested question.** No vague "all agreed" closes — the DA either acknowledges the rationale won the argument (recorded verbatim: "Cagle DA withdrew on Q5, accepting the ValidationContext reification") or holds principled dissent (recorded verbatim: "Davis DA holds dissent on Q1; withdrawal condition stated as …"). Silent DA alignment is a methodology violation.
- **Panel** — the remaining experts. Each speaks in turn on each question.

**DA selection criterion (load-bearing).** The DA's *published methodology* MUST be genuinely opposed to the framing the proposition under review carries — not merely orthogonal. The convening block names the opposition explicitly. A DA whose published position aligns with the framing produces theatre; a DA whose published position is on a different axis produces straw arguments. The strongest DA is the one whose work has *publicly contradicted* a load-bearing premise of the proposition.

### Session protocol

1. **Convene with a context block.** State the question(s), the input documents (with paths or URLs), prior related ODRs, and any constraints (deadlines, dependencies). 3–8 questions per session is the working range — more is a sign the scope should be split.
2. **Run pre-flight scope check** (see §Pre-flight scope check). Three outcomes: ratify-as-is / re-scope / retire. If the scope check produces substantive findings, escalate to a meta-Council (see §Meta-Council type) before running the full session.
3. **Always use named experts** from the panel — never generic role titles ("a SHACL expert said…"). Attribution is the discipline that keeps rationale honest.
4. **Each expert must state rationale from their published methodology.** Citations must be grounded per §Citation grounding. If the position can't be grounded in a citation that meets those criteria, it doesn't count.
5. **Experts must discuss with each other**, not just opine in parallel. Share contested points so they can agree, disagree, refine, or withdraw prior dissent. Cross-references between expert positions ("Allemang's framing is right but I'd push further — …" — Hendler) are the hallmark of a real deliberation.
6. **Per-question vote.** Tally as `N-M-K` (in-favour / against / abstain). Three values, exact integers. Approximate tallies (e.g. `≈6-3`) are admitted ONLY when a panellist explicitly abstains on a sub-question or holds a position that falls outside the ballot — the abstention reason is recorded verbatim. Record dissenting positions verbatim, including the reason given. If the DA withdraws an objection during deliberation, record that explicitly ("Cagle DA withdrew"); if the DA aligns with majority on a sub-question, record the partial alignment ("Davis DA aligned with majority on Q4; held dissent on Q1, Q5, Q6").
7. **Synthesis report.** The Queen writes a closing section listing: per-expert positions (or pointers to where they appear above), vote tallies per question, dissent records and withdrawals, the recommended approach, rationale citing publications, agreed amendments to the proposal, and whether any existing record needs revision or supersession. **Two-artefact discipline** applies when the session uses a hive-mind `consensus-mode`: the narrative synthesis is the verdict; programmatic vote tallies (from `hive-mind_consensus`) are an additive appendix. Where narrative and tally disagree, narrative wins.
8. **No silent vote-padding.** If an expert genuinely has nothing distinctive to say, "abstain" is the correct vote — not a fabricated agreement.
9. **The Queen composes; the Queen does not fabricate.** Every expert quotation in the synthesis MUST trace to actual content the named teammate produced in their position file. Composition (the Queen weaving cross-expert discussion between independently-written positions) is legitimate; fabrication (inventing a sentence and attributing it to an expert) is a methodology violation and grounds for invalidating the session. The audit trail is: any maintainer reading the synthesis MUST be able to find the cited content in the corresponding `working/session-N/<teammate>.md` file. If a teammate did not write something, the Queen MUST NOT put it in their mouth.
10. **One-message parallel spawn.** When the substrate primitive supports it (Agent fan-out via Claude's `Agent` tool; `hive-mind_spawn` for hive-mind sessions), the panel MUST be spawned in a single message — parallel fan-out is a synchronisation barrier on the slowest teammate, not on the sum of teammates. Sequential spawning serialises needlessly and is a methodology violation. Author-only sessions are exempt (no panel).
11. **Worker failure protocol.** If a teammate fails to produce a position file within the session's time budget, the Queen records the absence explicitly ("Teammate `gandon-guizzardi` failed to return within 60s of timeout; retry attempted; second attempt returned position file. Final positions reflect retry content.") The Queen MAY retry once (with retry-lineage tracking — original teammate ID + `-retry-1` suffix); MUST NOT silently drop. If retry fails, the absent teammate's position is marked `unrecorded` and their vote is `abstain` by default; the synthesis acknowledges the gap and proceeds. Failed teammates do NOT silently change the panel composition.

### Citation grounding

Every expert position MUST cite a source meeting one of the following standards. The Queen verifies each citation during synthesis; positions whose citations cannot be verified are not counted toward the vote.

**Acceptable sources:**

- A W3C Recommendation, Working Draft, or Note — named spec + section number (e.g. "SHACL Core §6.5").
- An OMG specification or FIBO ontology release — named document + section or term identifier.
- A named book authored by the expert (or co-authored) — book title + chapter or page (e.g. "*Semantic Web for the Working Ontologist* 3rd ed., Ch. 7").
- A peer-reviewed paper authored by the expert — journal/conference + year + title.
- A documented deployment the expert led or co-authored — named project + traceable reference (e.g. "BBC `/programmes/` ontology, deployed 2009, see `bbc.co.uk/ontologies/po`").
- A maintained open-source project the expert is a primary contributor to — repository + named convention or documented decision.

**Not acceptable:**

- Anonymous "best practice" appeals.
- General claims without a named source.
- Citations to chapters or sections that cannot be cross-referenced.
- Blog posts without a verifiable stable URL.
- Citations attributed to an expert but not actually authored by them.

**Verification.** The Queen verifies citation validity during synthesis. Where a teammate's position cites a source the Queen cannot cross-reference within the session's time budget, the citation is flagged and the position weight reduced (recorded explicitly: "Hendler cited a position attributed to ____, citation could not be verified within session — position not counted toward vote").

### What an ODR records (per-kind discipline)

*Amendment A9, adopted by [Session A9](../odr/council/session-a9-gandon-guizzardi-methodology-gap.md) (2026-05-27, Reduced Council, Queen Kendall, DA Guarino — withdrew on all four conditions met). Recorded per the Scope-Check 1 Q6 routing of the Gandon-vs-Guizzardi methodology gap to this self-amendment queue.*

An Ontology Decision Record records one of two kinds of decision:

1. **An ontological commitment** — a declaration about what *kinds* of entities the domain contains, what their identity criteria are, what Roles or Phases they pass through, what Relators bind them, what Modes they bear, what Qualities they particularise. Ontological commitments are language-independent: the same commitment may be encoded in OWL/RDFS/SHACL, in OntoUML, in Common Logic, or in plain prose, but the commitment persists across encodings. Commitments touch identity, rigidity, existential dependence, or Relator structure.
2. **An artefact-engineering decision** — a decision about how to structure, name, govern, sequence, or process the *artefacts* that encode the ontology: URI policies, namespace topology, graph separation, build pipelines, governance workflow, vocabulary catalogue, validation severity schemes, deliverable phasing. Artefact-engineering decisions are language-coupled: changing the representation language would substantively change the decision. They do not touch identity, rigidity, dependence, or Relator structure — they touch encoding, presentation, and process.

The boundary is the existing DCAP `kind` enum, made normative:

| `kind` | Decision category | Load-bearing axis |
|---|---|---|
| `pattern` | **Ontological commitment** | Identity, rigidity, dependence, Relator/Role/Phase/Mode/Quale structure |
| `mapping` | **Ontological commitment** (source→ontology) | Identity preservation across re-expression |
| `architecture` | Artefact-engineering | URI policy, namespace, graph separation, validation severity, build pipelines |
| `methodology` | Artefact-engineering (of governance itself) | Protocol, panel, citation, document conventions |
| `programme` | Artefact-engineering (of workflow) | Sequencing, dependency, work-breakdown, MVP gates |

The DCAP §Frontmatter prose for `pattern` already names "identity criteria, role/view pattern" as constitutive; this amendment makes the implicit discipline normative.

**Per-kind ODR commitment requirements.**

For `kind: pattern` and `kind: mapping`, the ODR's `## Rules` MUST include, for every class or scheme the ODR declares or commits to:

- **(a) A UFO/DOLCE meta-category commitment.** State whether the class is a Substance Kind, a Role (RoleMixin / RoleType / Role-instance), a Phase, a Relator, a Mode, a Quality Region (with Qualia members), or an Abstract. The UFO ontological taxonomy (Guizzardi 2005, *Ontological Foundations for Conceptual Modeling with Applications*, Ch. 4; UFO 2007/2011/2015 lineage) is the canonical reference; equivalent DOLCE commitments (Masolo, Borgo, Gangemi, Guarino, Oltramari 2003, *The WonderWeb Library of Foundational Ontologies*, D18) are acceptable substitutes. BFO is also acceptable with a one-line equivalence note.
- **(b) An identity criterion stated over named hard cases.** State the IC of the class or scheme over at least the hard cases the relevant Council session's panel identified or the adopting project's WG named. The IC is the *test* of the meta-category commitment; without it, the commitment is decorative (precedent: Session 001 Q1 amendment admitted diagnostic exemplars on this exact reasoning).
- **(c) The artefact realisation.** URI minting, shape graph location, SHACL/DASH machinery, namespace, build composition. This remains load-bearing (the artefact is what is published, versioned, and dereferenced per the Linked Data Principles) but is insufficient by itself.

For `kind: methodology`, `kind: architecture`, and `kind: programme`, requirements (a) and (b) are **relaxed**. These ODRs are constitutively about artefact, process, or organisation — they do not commit to what kinds of entities exist in the modelled domain. This methodology (ODR-0001) is the `kind: methodology` exemplar — it does not declare a UFO category or an IC and is correct in not doing so. Where these ODRs incidentally make commitments about modelled-domain entities, those commitments are themselves `pattern`-level content and MUST satisfy (a)–(c) inline or by reference to a `pattern` ODR cited via `depends-on` or `implements`.

**Artefact identity test (operational rule for extracting `pattern` records).**

Where an `architecture` ODR's `## Rules` contains a rule that is cited by another `architecture` ODR (cross-`architecture` rule-borrowing), that is the signal that the rule should have been promoted to a `pattern` ODR. The `pattern` ODR records the convention abstracted from any specific artefact; the realising `architecture` ODRs cite it via `implements`. The test for `pattern` extraction is three-part:

1. **Same dereferenceable resource.** Do the candidate rule's instances share a single URI / `owl:versionIRI` lineage across the citing artefacts?
2. **Same prefix and target topology.** Do they share namespace prefixes and graph-import topology?
3. **Re-instantiability.** Would the rule apply to a *third* artefact not currently cited?

If the answer to (3) is "yes" *and* the rule's content is a load-bearing ontological commitment per requirements (a)–(b) above, extract to a `pattern` record. If the answer to (3) is "no" *or* the content is purely artefact-engineering, leave the rule inside its `architecture` ODR.

**Enforcement.**

- **`odr-review` lint update** (specification to land in the next skill release): for `kind: pattern | mapping` records, verify `## Rules` names (a) a UFO/DOLCE meta-category commitment and (b) at least one identity criterion stated over named hard cases. Warning on `status: proposed`; **blocker on `status: accepted`**. The lint is text-pattern based per DCAP's prose-profile discipline; full SHACL-shape enforcement remains out of scope.
- **Pre-flight scope check** (per §Pre-flight scope check): the Queen confirms the proposition's `kind` matches its load-bearing content per the table above. A mismatch — a record whose declared `kind` is `architecture` but whose load-bearing content is a Relator declaration or an IC — is grounds for re-scope. The Queen recommends extracting the commitment to a `pattern` record.

**Rationale (cited).**

The boundary is grounded in: Guarino 1998, *Formal Ontology and Information Systems*, §3 (the conceptualisation/ontology distinction); Guizzardi 2005 dissertation and the UFO 2007/2011/2015 lineage (the meta-category taxonomy); Masolo, Borgo, Gangemi, Guarino, Oltramari 2003, *The WonderWeb Library of Foundational Ontologies* (DOLCE); Guarino & Welty 2002/2009 (OntoClean meta-properties); Berners-Lee 2006 and Heath & Bizer 2011, Ch. 2 (Linked Data Principles — the artefact-cut side); RDF 1.1 Concepts §1.5 (the resource/dereference framing); the W3C GRDDL Recommendation (Gandon & Hawke, eds., 2007 — engineering act *is* the ontological act, for `kind: architecture`); the Truth-Maker framing (Guizzardi 2018, *ER 2018 Keynote*) — appended to deferred W3C VC / DID work; this corpus's Session 001 Q1 amendment (diagnostic exemplars admitted) as the load-bearing precedent for the IC-over-hard-cases discipline.

### Cross-talk transport

Session-protocol rule 5 requires experts to discuss with each other, not just opine in parallel. Four transport options are available; the Queen picks one per session based on session shape. Listed in order of preference — pick the first whose preconditions are met.

| Transport | When | Notes |
|---|---|---|
| **Queen-composed (default)** | One-round dialectic where workers don't need to *revise* their position after seeing peers. Latency budget tight. | Workers don't see each other at runtime; Queen reads all position files and composes inter-expert discussion in the synthesis. Composition is legitimate only when every quotation traces to actual worker output (§Session protocol rule 9). The canonical pattern. |
| **`SendMessage` via Agent Teams** | Workers must respond to peer claims before settling their final position. Multi-round dialectic. | Spawn workers with `team_name: "<council-id>"`; workers exchange messages via `SendMessage`. The upstream-blessed inter-agent messaging primitive; has hooks (`teammate-idle`, `task-completed`) and lifecycle (`TeamCreate`/`TeamDelete`) wired in. Requires the `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` environment toggle. |
| **Direct MCP `_memory`** | Verdict needs to survive session restart; long-running multi-round; typed-bucket model wanted. | Workers call `mcp__ruflo__hive-mind_memory({action:"set", type:"context", key:"<persona>-pos", value:"..."})` and `({action:"get", key:"<peer>-pos"})`. Typed buckets, atomic under hive store lock, durable persistence. |
| **File-based** (fallback only) | Agent Teams unavailable AND MCP server unreliable AND observability matters more than performance. | Workers write `pos-<name>.md` → barrier sleep → read peers' files → write reactions. Adds wall-clock latency without functional value over the higher-tier transports; demoted. |

Most sessions use queen-composed. `SendMessage` is the next-most-common when peer-revision is in scope. `_memory` and file-based are edge cases.

### Pre-flight scope check

Before convening a session, the Queen runs a 5-minute scope check on the proposition. The check answers one question: *is this proposition the right unit of decision?* Three outcomes:

1. **Ratify-as-is.** The proposition is coherent; the listed questions cover its load-bearing decisions. Proceed with the session.
2. **Re-scope.** The proposition is too narrow (the decision needs more context — fold into a neighbouring record) or too broad (the decision is two independent decisions — recommend a spawn). Record the re-scope recommendation; the session may either proceed with reduced scope or be postponed.
3. **Retire.** The proposition is the wrong unit of decision entirely (the decision belongs in a different corpus, or precedent has already settled it). Mark the record `rejected` with a pointer.

**Escalation.** If the scope check produces substantive findings that would invalidate multiple sessions or affect the programme cut, escalate to a **meta-Council** (see §Meta-Council type) before running any further sessions.

### Format tiers

Not every proposition needs the full nine-expert apparatus. Three tiers:

| Tier | When | Apparatus | Cost (rough) |
|---|---|---|---|
| **Full Council** | Substantive linked-data decision with credible split | Queen + DA + 6 panel teammates writing position files | ~8 agent runs |
| **Reduced Council** | Amendment / ratification-with-targeted-disputes | Queen + DA + 1–2 panel teammates on disputed questions only | ~3–4 agent runs |
| **Author-only** | Recording a decision the methodology or precedent has already settled; sequencing/index work; no panel split expected | Queen drafts the transcript and the record amendment from existing inputs; no fanned-out positions | ~1 agent run |

Format per session is named in the convening block. The default is Full Council; deviations are justified inline.

### Two-artefact discipline (default for Full Council + Reduced Council)

*Added by Author-only amendment recording the EXPAND verdict from S011 (Phase 2.5 substrate; 2026-05-27). Three pilot sites — S005 (Full Council, B2 pilot `hive-mind/byzantine`) + S015 (Reduced Council, two-artefact only) + S011 (Full Council substrate-mode, B3 pilot `hive-mind/typed-output` for Q8) — confirmed that the structured tally captured dissent the narrative reading alone would have buried. The threshold for full adoption is satisfied.*

Every **Full Council** and **Reduced Council** session produces TWO artefacts:

1. **Narrative synthesis (primary).** The Queen's prose transcript per §Session document conventions — the substantive verdict, with each expert's position recorded, the Synthesis section closing the loop.
2. **Structured per-question tally appendix (second artefact).** A machine-consumable per-voice vote table + DA scorecard + per-question count, embedded in the same transcript document. Downstream tooling (`odr-review` lint extensions; audit-trail consumers; LLM retrievers) reads the tally mechanically.

The DA scorecard discipline is mechanical: each DA position file lists per-question withdrawal conditions verbatim; the Queen synthesis marks each as WITHDRAWN (condition met) / HELD (condition unmet; held-as-live with named re-open trigger) / CONCEDED (no attack). No vague "DA aligned with majority" — the alignment traces to specific named conditions per question.

**Pre-EXPAND status (historical).** The tally appendix was previously conditioned on `consensus-mode` being a hive-mind variant (§Session document conventions historical text). The B2 pilot (`hive-mind/byzantine` at S005) and B3 pilot (`hive-mind/typed-output` at S011 Q8) tested the discipline; all three pilot sites observed structured-tally value beyond narrative reading. **The EXPAND verdict makes the two-artefact discipline UNCONDITIONAL for Full + Reduced Council, regardless of consensus-mode.** Author-only sessions do not require the tally appendix (no panel to tally).

**Pilot-label retirement.** Session-level pilot consensus-mode labels (`hive-mind/byzantine` as the B2 pilot's S005 declaration; `hive-mind/typed-output` as the B3 pilot's S011 Q8 declaration) are retired as session-level labels — the discipline is now default, no special-pilot designation needed. The consensus-mode framework table (next subsection) retains the modes themselves as operational tools selected per session shape; what's retired is the *pilot-status* framing.

**Format-by-format requirements:**

| Format | Narrative synthesis | Structured tally | DA scorecard | Held-as-live dissent record |
|---|---|---|---|---|
| Full Council | MUST | MUST | MUST | MUST when DA holds |
| Reduced Council | MUST | MUST | MUST | MUST when DA holds |
| Author-only | MUST | n/a (no panel) | n/a | n/a |

The tally artefact's structure is specified in §Session document conventions (Tally appendix).

### Consensus-mode framework

Each session declares a `consensus-mode` in its frontmatter, selected by applying the criteria below to the session shape. The mode determines which coordination primitive is used.

| `consensus-mode` | Criterion | Substrate |
|---|---|---|
| `agent-fan-out` (default) | Votes on each question are *independent* of votes on other questions; verdict reduces to a tally of standalone positions. | `swarm_init` (bookkeeping) + Claude's `Agent` tool spawning teammates in parallel |
| `hive-mind/byzantine` | Verdict on one question is *conditional* on verdict on another (e.g. multi-condition withdrawals). Structural vote acknowledgement matters. | `hive-mind_init` with `consensus: byzantine`; programmatic `hive-mind_consensus` per question |
| `hive-mind/weighted` | The Queen is the authoritative voice; worker votes are advisory (queen vote ×3). Used for leader-led decisions where pragmatic synthesis dominates. | `hive-mind_init` with `consensus: weighted` |
| `hive-mind/quorum` | Caller-chosen threshold (unanimous / majority / supermajority). Used for governance-grade decisions with stated strictness. | `hive-mind_init` with `consensus: quorum` + `quorumPreset` |
| `hive-mind/raft` | Sequential term-ordered decisions where each supersedes the prior. | `hive-mind_init` with `consensus: raft` |
| `hive-mind/gossip` | Advisory eventual-consistency rounds for small panels; tolerates voter dropouts. | `hive-mind_init` with `consensus: gossip` |
| `hive-mind/crdt` | Re-broadcast safety dominates; out-of-order delivery; mathematical convergence required. | `hive-mind_init` with `consensus: crdt` |
| `hive-mind/typed-output` | Verdict produces a *structured object consumed by downstream tooling* (a generator, a linter, an LLM retriever). The tally is data, not decoration. | `hive-mind_init` with `consensus: quorum` or `weighted`; verdicts persisted as `hive-mind_memory` `type: consensus` |
| `none` | Author-only session; no panel to coordinate. | Single Queen run via the main thread |

Note that the substrate primitives (`swarm` and `hive-mind`) are at the same level of abstraction — a session uses one OR the other, never both wrapped. Hive-mind init *is* a swarm-shaped construct; calling `swarm_init` and `hive-mind_init` together is redundant.

### Config options for the substrate primitives

The methodology specifies these option surfaces explicitly so adoption is reproducible. The ruflo MCP tool names are canonical; other implementations of the same primitives MAY substitute equivalent tools provided the option surface is preserved.

#### Swarm primitive (`mcp__ruflo__swarm_init` and related)

| Option | Type | Values | Default | Notes |
|---|---|---|---|---|
| `topology` | string | `hierarchical` \| `mesh` \| `hierarchical-mesh` \| `ring` \| `star` \| `hybrid` \| `adaptive` | — | Wires agent-visibility surface |
| `strategy` | string | `specialized` \| `balanced` \| `adaptive` | — | How work is allocated across agents |
| `maxAgents` | number | 1–50 | — | Hard cap on agent count |
| `force` | boolean | true / false | false | Force-create even if a matching running swarm exists within reuse TTL |
| `reason` | string | free-text | — | Advisory audit-log entry when `force=true` |
| `config` | object | arbitrary | — | Additional swarm configuration (open-ended; rarely needed) |

Swarm scaling (`mcp__ruflo__swarm_scale`):

| Option | Type | Values | Default | Notes |
|---|---|---|---|---|
| `swarmId` | string (required) | — | — | Target swarm to scale |
| `agents` | number (required) | 1–50 | — | New target agent count |
| `type` | string | agent-type filter | — | Advisory; orchestrators may honour |

Swarm has **no consensus primitive** — coordination is by topology + strategy; decisions are not first-class.

#### Hive-mind primitive — initialisation (`mcp__ruflo__hive-mind_init`)

| Option | Type | Values | Default | Notes |
|---|---|---|---|---|
| `topology` | string | `mesh` \| `hierarchical` \| `ring` \| `star` \| `hierarchical-mesh` \| `adaptive` | — | Six options (no `hybrid` — swarm-only) |
| `consensus` | string | `raft` \| `byzantine` (alias `bft`) \| `gossip` \| `crdt` \| `quorum` \| `weighted` | `raft` | Seven algorithms; selectable per-call too |
| `queenType` | string | `strategic` \| `tactical` \| `adaptive` | — | Architect-first / Dispatcher-first / Mode-switching |
| `queenId` | string | agent ID | — | Initial queen agent identifier |
| `maxAgents` | number | — | — | Worker-agent cap |
| `memoryBackend` | string | `hybrid` \| `sqlite` \| `rvf` | — | Three backends; `hybrid` is canonical |
| `persist` | boolean | — | — | Persist hive state across processes (enables resume) |

#### Hive-mind primitive — spawn (`mcp__ruflo__hive-mind_spawn`)

| Option | Type | Values | Default | Notes |
|---|---|---|---|---|
| `action` | enum | `spawn` \| `retryTask` | `spawn` | Retry uses lineage tracking |
| `count` | number | — | 1 | Number of workers |
| `role` | enum | `worker` \| `specialist` \| `scout` | `worker` | High-level role |
| `agentType` | string | scalar | `worker` | Mutex with `agentTypes` |
| `agentTypes` | enum array | `researcher` \| `coder` \| `analyst` \| `tester` \| `architect` \| `reviewer` \| `optimizer` \| `documenter` \| `specialist` \| `coordinator` \| `monitor` | — | Mixed-type round-robin (11 specialisations) |
| `prefix` | string | — | `hive-worker` | ID prefix |
| `retryOf` | string | original worker ID | — | Retry lineage tracking |

#### Hive-mind primitive — consensus (`mcp__ruflo__hive-mind_consensus`)

| Option | Type | Values | Default | Notes |
|---|---|---|---|---|
| `action` | enum (required) | `propose` \| `vote` \| `status` \| `list` | — | |
| `strategy` | enum | seven values (same as init) | `raft` | Selectable per-proposal; overrides init |
| `quorumPreset` | enum | `unanimous` \| `majority` \| `supermajority` | `majority` | Only used when `strategy: quorum` |
| `timeoutMs` | number | ms | 30000 | Raft re-proposal timeout |
| `roundTimeoutMs` | number | ms | 5000 | Per-round gossip/CRDT timeout |
| `term` | number | — | — | Raft term ordering |
| `crdtSnapshot` | object | `{ votes, approvers, verdict }` | — | Required for CRDT strategy |
| `includeProvenance` | boolean | — | false | Full RankedResult provenance shape |
| `proposalId` | string | — | — | For `vote`/`status` |
| `voterId` | string | — | — | Voting agent ID |
| `vote` | boolean | true=for / false=against | — | |
| `type` | string | proposal type | — | Free-form proposal-type label |
| `value` | any | — | — | Proposal payload |

#### Hive-mind primitive — memory (`mcp__ruflo__hive-mind_memory`)

| Option | Type | Values | Default | Notes |
|---|---|---|---|---|
| `action` | enum (required) | `get` \| `set` \| `delete` \| `list` | — | |
| `type` | enum | `knowledge` \| `context` \| `task` \| `result` \| `error` \| `metric` \| `consensus` \| `system` | — | Eight typed buckets; required for `set` |
| `key` | string | — | — | Memory key |
| `value` | any | — | — | For `set` |
| `ttlMs` | number | ms | per-type default | Override TTL |

**Per-type default TTLs:** `knowledge` permanent · `context` 1h · `task` 30m · `result` permanent · `error` 24h · `metric` 1h · `consensus` permanent · `system` permanent.

### Substrate operations

Two operational rules that govern how the substrate primitives are invoked, independent of which `consensus-mode` is in use:

**Calling convention.** The Queen calls MCP tools directly (`mcp__ruflo__swarm_init({...})`, `mcp__ruflo__hive-mind_init({...})`, `mcp__ruflo__hive-mind_consensus({...})`); sub-agents spawned via `Agent` may also call MCP tools directly (no `ToolSearch` preamble required). Inter-sub-agent messaging uses `SendMessage` with `team_name`-tagged Agent Teams when the cross-talk transport (§Cross-talk transport) is set to `SendMessage`. CLI / shell fallbacks (`npx ... hive-mind spawn --claude`) are reserved for environments where the MCP server is unavailable — they are NOT a viable fallback inside an active session with a running MCP server (lock contention).

**Sub-queen escalation (hierarchical-mesh topologies only).** When a session uses `topology: hierarchical-mesh`, sub-queens may emerge inside sub-hives. If a sub-queen fails (missing summary key >60s; Task error; unresponsive status probe), the escalation policy is data-driven: **promote-worker** if ≥1 healthy worker remains in the sub-hive (longest-lineage worker promoted; sub-hive boundary preserved); **escalate-to-root** if zero healthy workers (subtree marked failed; orphans absorbed into top tier). Recursion cap: 1 nesting level (no sub-sub-queens). Substrate handles this automatically; Queens are aware of the policy but do not implement it.

### Working-file convention

For Full Council and Reduced Council sessions, per-teammate position files live at:

```
<project>/<council-directory>/working/session-NNN/<teammate>.md
```

The `<council-directory>` is project-defined (typically `docs/ontology/odr/council/` or analogous). Working files are append-only; the *transcript* is the canonical record of what was decided. Amendments to a record create a new session (sub-letter or successor), not edits to old working files. Author-only sessions do not produce working files; the Queen writes the transcript directly.

For meta-Council sessions (see §Meta-Council type), the path is:

```
<project>/<council-directory>/working/scope-check-N-<slug>/<teammate>.md
```

### Multi-day sessions and resumability

Most Council sessions complete in one sitting. For deliberations that genuinely span days — a Full Council that pauses overnight while a teammate gathers domain context; a meta-Council whose synthesis spans a working week — the substrate supports session export, import, and resume. Mechanism:

- **`hive-mind sessions checkpoint`** archives the current session state (queen prompt, worker manifest, typed memory) to a gzipped JSON archive at `.claude-flow/hive-mind/sessions/<sessionId>-<timestamp>.json.gz`. Schema versioned (currently v1).
- **`hive-mind sessions export <id> --output <path>`** explicitly exports a session archive.
- **`hive-mind sessions import <path>`** places the archive under a fresh `imported-<ts>-<rand>` sessionId. Does NOT auto-resume.
- **`hive-mind resume <id>`** re-spawns the queen and workers from the archive; queen prompt, queen type, and worker manifest are restored verbatim.

Methodology guidance: prefer one-sitting sessions; use resumability only when wall-clock genuinely exceeds one sitting. Each resume cycle is recorded in the synthesis (date, what was paused, what changed in the interim). Multi-day sessions risk drift — the longer the gap, the more the Queen should re-verify citations and re-state convening assumptions on resume.

Author-only sessions don't use resumability (no panel to checkpoint). Agent-fan-out sessions checkpoint via git (working files are commit-tracked); the hive-mind session-archive mechanism is only used when `consensus-mode` is a hive-mind variant.

### Meta-Council type

Sessions whose subject is the methodology itself, the programme plan, the cut of records, or any other meta-question rather than a specific record under deliberation. Examples: "are these 13 stubs the right unit of decision?", "should the methodology adopt hive-mind consensus for some session types?", "what does an ODR record — an artefact-engineering decision or an ontological commitment?".

**Conventions:**

- **Filename pattern:** `scope-check-N-<slug>.md` (not `session-N-<slug>.md`). The "N" is the sequential meta-Council number, independent of session numbering.
- **Amendment numbering:** Meta-Councils produce amendments labelled with letters — A1, A2, A3, ... (or B1, B2, ... per scope-check) — rather than per-question vote tallies. Per-question tallies are still recorded inside each amendment's rationale.
- **Output:** A set of amendments to existing records (per-project plans, methodology, programme anchor) rather than new records.
- **Track-record entry:** Meta-Councils appear in the adopting project's track record alongside per-record sessions.

### Session document conventions

- **File:** `<project>/<council-directory>/session-NNN-<slug>.md` (per-record sessions) or `scope-check-N-<slug>.md` (meta-Councils) — incrementing numeric ID, descriptive kebab-case slug.
- **Front matter** (after the `# Council Session NNN — Title` heading):
  - Date.
  - Record(s) under review (if any).
  - Queen.
  - Devil's Advocate.
  - Panel (table).
  - Input Documents.
  - `consensus-mode` declaration (one of the values in §Consensus-mode framework).
  - Format tier (Full Council / Reduced Council / Author-only).
- **Body structure:**
  - **Context** — the question and stakes.
  - **Question N** sections, one per question.
    - Inside each: each expert's position as a labelled sub-section or bolded `**Allemang:**` paragraph. The Queen's contribution is marked `**Allemang (Queen):**`; the DA's `**Cagle (DA):**`.
    - **Vote:** `N-M-K` with the tally and (optionally) a one-line summary of the verdict. Approximate tallies admitted only per §Session protocol rule 6.
  - **Synthesis** — Queen's closing summary, amendments, downstream record impact.
  - **Tally appendix** (MUST for Full Council + Reduced Council per §Two-artefact discipline; n/a for Author-only) — the structured per-voice vote table + per-question count + DA scorecard, embedded in the transcript document. Narrative is the verdict; tally is the count. The tally is machine-consumable (downstream tooling reads it as data); the narrative is human-readable (Queen's prose synthesis). When `consensus-mode` is `hive-mind/byzantine` or `hive-mind/typed-output`, the tally also carries the structured-vote output from `hive-mind_consensus` or the typed-verdict object respectively; for `agent-fan-out` sessions, the tally is constructed from each panel teammate's per-question position votes in their working file.

### When to use the Council

General categories of decision that warrant a Council session in any ontology mapping or ontology modelling project:

- URI / namespace / serialization decisions.
- Competing W3C modelling patterns (OWL vs SKOS vs SHACL; RDF reification vs RDF-star; etc.).
- OWL / SHACL / SKOS / PROV-O / DPV / ODRL semantic questions.
- Validating enterprise-scale or government-scale precedent for a modelling pattern.
- Cross-cutting reviews of multiple records for coherence.
- Bounded-context boundaries for the source schemas being modelled.
- Mapping conventions between the project's ontology and external standards (FIBO, schema.org, DPV, INSPIRE, GeoSPARQL, etc.).
- Identity-criterion questions (foundational-ontology commitments).
- Vocabulary catalogue admission, tier movement, or retirement decisions.

Adopting projects MAY extend this list with domain-specific categories via §Adoption.

### When NOT to use the Council

- Routine class / property additions that fit established patterns.
- SHACL shape authoring that follows an existing template.
- Editorial fixes (typos, label tightening, comment additions).
- Working-group procedural matters — those belong in the WG minutes, not the Council.
- Stakeholder consultation — that's the role of the adopting project's real-world governance, not a simulated panel.

The Council is a design-deliberation instrument. It does not substitute for the adopting project's real-world governance. Council verdicts shape *proposals*; the project's governance shapes *adoption*.

### Standing-panel amendment protocol

The standing 9 are treated as stable across the methodology's lifetime, but the methodology admits amendment under specific triggers:

- **Trigger 1: A new publication from a candidate expert materially contradicts a position they have been simulated holding.** Recorded in the candidate's panel entry as a "position update note"; future sessions cite the updated position.
- **Trigger 2: A new expert's published work becomes load-bearing in the field.** Proposed addition to the extended panel via a meta-Council on the methodology. Promotion from extended to standing requires a separate meta-Council with substantive justification (the standing 9 carries a maturity bar that the extended panel does not).
- **Trigger 3: An expert's published positions become broadly outdated.** Removal from the panel via meta-Council; the methodology preserves their prior contributions as historical record but does not simulate their position in new sessions.

Amendments to the panel land as edits to this methodology's `## Rules` (panel tables), recorded with the meta-Council session that authored them. No sibling record.

### Self-amendment process

This methodology document amends only through its own Council protocol — applying the methodology to itself. Three formats acceptable depending on the amendment's scope:

- **Author-only** — when the amendment merely records a precedent the methodology has tacitly settled (e.g. ratifying a convention multiple sessions have used consistently).
- **Reduced Council** — when the amendment is disputed on a narrow axis (1–2 questions, 1 DA, 1 panel pair).
- **Full Council** — when the amendment is substantive (3+ questions, full panel, full DA + panel cross-talk).

Amendments land inside this methodology's own `## Rules` rather than in a sibling supersession record. Partial supersession of a section is recorded inline (with the meta-Council session that authored the change), preserving the prior text in git history rather than via a parallel amendment-record file.

### Adoption hooks (per-project slots)

Each adopting project supplies its own context via these declared slots. The methodology defines the slot shape; the project fills it in. Project adoption MUST be recorded in a sibling adoption record (e.g. `<project>/<council-directory>/adoption.md` or an analogous file) declaring:

- **§Project Weighting** — Which standing-panel experts the project weights more heavily, with a one-line domain justification. Example: "Davis and Baker carry extra weight because UK-government linked-data conventions and metadata-governance practice are directly relevant to a public-interest property-data programme."
- **§Domain-Extended Panel** — Which extended-panel candidates the project pre-elects as routinely-applicable. Other extended-panel candidates remain case-by-case. Example: "Pre-elect Knublauch (SHACL is load-bearing for verifiedClaims), Isaac/Miles (SKOS for enumerations), Iannella/Pandit (DPV for personal data)."
- **§Real-world Governance Handoff** — Which real-world body (Working Group, AGM, Sub-Committee, internal team, equivalent) ratifies Council proposals into adopted decisions. Council verdicts shape proposals; adoption is downstream.
- **§Track Record** — The per-project track-record table listing convened sessions: session ID, question/topic, panel, verdict, output records produced. Lives in the project's adoption record, not in this methodology.
- **§Project-specific when-to-use additions** — Domain-specific categories the project adds to the general when-to-use list. Example: "PDTF schema boundaries; bounded-context boundaries for property-transaction overlays."
- **§Council directory path** — Where the project stores session transcripts and working files. Typically `docs/ontology/odr/council/` or analogous.

The adoption record is a small project-specific artefact (typically 50–150 lines) declaring the above slots. Adopting projects whose adoption record is missing a required slot are non-conforming.

### Enforcement (checked by review)

- Standing panel lists 9 named experts with affiliations.
- Queen and Devil's Advocate roles named explicitly per session.
- DA selection criterion (genuinely opposed published methodology) honoured.
- DA explicitly withdraws or holds on every contested question (§Roles).
- Per-question vote tally uses `N-M-K` convention (three values; approximations admitted only per §Session protocol rule 6).
- Citations grounded per §Citation grounding; Queen verifies during synthesis.
- Queen composes; does not fabricate. Every quotation in the synthesis traces to actual content in the corresponding teammate's `working/session-N/<teammate>.md` file (§Session protocol rule 9).
- Panel spawned in a single message (parallel fan-out, not sequential) for Full Council and Reduced Council sessions (§Session protocol rule 10).
- Worker failure handled per §Session protocol rule 11 — absent teammates recorded explicitly, retry-once with lineage, default-abstain when retry fails.
- Pre-flight scope check run before convening.
- When-to-use / when-not-to-use criteria observed before convening.
- `consensus-mode` declared in session frontmatter; matches the criterion in §Consensus-mode framework.
- Format tier (Full Council / Reduced Council / Author-only) declared.
- Session document follows the path and structure above; front matter present.
- Working-file convention honoured.
- Adopting project supplies all required §Adoption slots; missing slots are non-conforming.

## Alternatives

- **Ad hoc single-perspective review** — one viewpoint per decision; misses cross-cutting concerns no single expertise covers.
- **Open call to real-world experts** — slow, expensive, non-reproducible; real experts are reserved for the adopting project's standing working groups and governance bodies, not per-decision deliberation.
- **Generic "best practice" appeals** — produces vague rationale future maintainers cannot interrogate.
- **Per-project bespoke methodology** — every adopting project reinvents the panel, the protocol, the document conventions; cross-project comparability lost; learning from one project's experience does not transfer.

## Consequences

- Significant linked-data decisions MUST be routed through a Council session per the when-to-use criteria; ad hoc single-perspective decisions on those topics are out of order.
- Routine work MUST NOT trigger a session; padding the agenda dilutes the methodology and risks Council theatre.
- Every Council session produces a transcript at the project's council-directory path, cited from the resulting record's `council:` frontmatter field. Drafters bear the cost of named-expert attribution and citation grounding; positions that cannot be grounded in published methodology meeting §Citation grounding standards do not count.
- The Devil's-Advocate role and recorded dissent are mandatory guards against rubber-stamping; if they consistently fail to produce dissent or withdrawal records, the methodology is being misapplied and must be reviewed.
- Council verdicts are inputs to proposals, not adoption decisions. Adoption flows through the adopting project's real-world governance (declared via §Real-world Governance Handoff); records MUST NOT treat a Council verdict as ratification.
- The panel reflects a Semantic Web / linked-data perspective. For the rare decision predominantly about relational schemas or document stores in a non-linked-data context, the methodology does not apply and a different forum must be used.
- Newcomers can learn the design idiom from session transcripts; transcripts double as training material and MUST be preserved when records supersede each other.
- The methodology is portable across ontology mapping and ontology modelling projects. Adopting projects supply their context via §Adoption hooks; the methodology body itself is not edited per project.
- The methodology is self-amending — substantive changes flow through its own Council protocol per §Self-amendment process. This is a design feature, not a circular dependency: applying the methodology to itself is the strongest test of its coherence.

## References

- **Source methodology**: this methodology is a direct adaptation of the H&M Expert Hive (the source programme is recorded externally as ONT-0021, which lives outside this repository). Panel composition is carried over substantially unchanged because the experts' published positions are domain-agnostic with respect to which ontology-modelling project adopts them.
- **W3C process precedent**: meeting minutes with named-voter resolutions (the consensus-by-deliberation pattern this methodology generalises) — see W3C Process Document §"Decision-making".
- **FIBO/OMG precedent**: Modelling Team review → Editorial Review → Public Review → OMG technology process — the multi-stage ratification pattern this methodology adapts for individual ontology-modelling decisions.
- **DCMI precedent**: vocabulary governance with single-record change logs (the in-place amendment pattern this methodology adopts for catalogue records and for self-amendment).
- **Adopting projects**: each adopting project maintains a sibling adoption record (`<project>/<council-directory>/adoption.md` or analogous) declaring the §Adoption slots. The methodology body itself is not edited per project.
- **Substrate primitives**: the swarm and hive-mind config tables in §Rules name the ruflo MCP tool surface canonically. Alternative implementations of the same primitives MAY substitute equivalent tools provided the option surface is preserved.
