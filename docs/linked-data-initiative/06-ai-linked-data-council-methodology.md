# The AI "Linked Data Council" Methodology

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.

## TL;DR

- ✅ Every non-trivial modelling decision in the OPDA ontology was adjudicated by a **simulated dialectic expert panel** — AI agents each role-playing a real, named linked-data authority (Allemang, Hendler, Guizzardi, Cagle, Baker, Davis, Gandon, Kendall, Guarino…), arguing **only from that authority's actual published positions** (a W3C spec + section, a named book + chapter, a documented deployment). The methodology is written down and self-governing: [`docs/ontology/odr/ODR-0001-linked-data-council-methodology.md`](../ontology/odr/ODR-0001-linked-data-council-methodology.md).
- ✅ Citations are **load-bearing, not decorative**: the Queen verifies each one during synthesis, and *unverifiable positions don't count toward the vote*. Every session has a **Devil's Advocate** whose published methodology genuinely opposes the proposition and who **must explicitly withdraw or hold dissent on every contested question** — silent agreement is a methodology violation.
- ✅ The output of a session is a citable **Ontology Decision Record (ODR)** plus a full transcript with **`N-M-K` vote tallies** (for/against/abstain), verbatim dissent, and named **re-open triggers**. ~37 sessions are on record ([`docs/ontology/odr/council/adoption.md`](../ontology/odr/council/adoption.md)); 28 ODRs resulted.
- ✅ A strict **ODR-vs-ADR boundary** (the "DCAP discipline") keeps *modelling* decisions (identity, roles, Relators → ODRs) separate from *engineering* decisions (URIs, pipelines, CI → ADRs), enforced per `kind` in frontmatter. The method even **notices when it repeats itself**: a stated artefact-identity test extracts a thrice-reused convention into its own `pattern` ODR (ODR-0017, ODR-0018).
- 🟡 Sessions are indexed into **AgentDB / ReasoningBank** (ADR-0027) for recall, provenance traversal, and learning — built internally for the council process; not yet an end-user product. The apparatus is **dialled to the stakes** — a format tier (Full / Reduced / Author-only) and a consensus-mode chosen by a structural rule, defaulting to the *minimum* coordination the verdict's shape needs.
- ✅ The honest governance story is **"AI proposes, human disposes"**: a human *directing authority* can override the Council on greenfield grounds, and did — keeping slash URIs against a 5-2 council recommendation for hash (session-037), and authoring ODR-0027 with no panel at all.

---

## 1. Why a council at all

Translating a 37,000-line JSON Schema into a formal ontology is not a transcription job; it is a sequence of contested modelling judgements. JSON Schema names slots; an ontology must say *which things have stable identity*, *what is rigid vs anti-rigid*, *which fields carry special-category personal data*, and *which W3C pattern* (OWL vs SKOS vs SHACL; RDF reification vs RDF-star) applies. As [ODR-0001 §Context](../ontology/odr/ODR-0001-linked-data-council-methodology.md) puts it: "an OWL purist may overlook tooling gaps; a pragmatist may miss formal pitfalls; a standards expert may not account for the domain's existing data shape." No single perspective covers all of them.

The usual answers are weak. Consulting real experts is slow and non-reproducible. Generic "best-practice" appeals produce rationale a future maintainer cannot interrogate. The Council's design goal was a review process that is **authority-grounded, reproducible, and self-documenting** — and whose verdicts can be *re-opened* on stated conditions rather than silently revisited.

The methodology is **portable** (it was developed across two programmes — an H&M semantic-modelling programme and OPDA — and published as a project-agnostic instruction set), and **self-amending** (ODR-0001 amends only through its own Council protocol, applying the methodology to itself). It has done so at least four times; see §6.

> **Important framing — it is the *Council Hive* specifically.** ODR-0001 §Pattern lineage is explicit that this is one of four canonical hive-mind patterns (the dialectic one). The three siblings — a non-dialectic propose-vote-resolve Consensus Hive, an Implementation Hive, a Review Hive — are *out of scope*. "Use the Council methodology" for a non-dialectic decision is a misapplication.

## 2. What a council session is (ODR-0001) ✅

A session is a **simulated dialectic expert panel**. Each panellist is an AI agent that role-plays a named authority and argues **only from that authority's actual published positions**. The defining constraints, all from [ODR-0001 §Rules](../ontology/odr/ODR-0001-linked-data-council-methodology.md):

**Citation grounding (the rigour keystone).** Every expert position MUST cite a source meeting a fixed standard — a W3C Recommendation/Working Draft/Note *with section number* (e.g. "SHACL Core §6.5"); an OMG/FIBO release with a term identifier; a named book the expert authored *with chapter/page* (e.g. "*Semantic Web for the Working Ontologist* 3rd ed., Ch. 7"); a peer-reviewed paper they wrote; or a documented deployment they led (e.g. "BBC `/programmes/` ontology, deployed 2009"). **Not** acceptable: anonymous "best practice", general claims with no named source, citations to sections that cannot be cross-referenced, blog posts without a stable URL, or a citation *attributed to* an expert they did not actually author.

> **The verification gate.** "The Queen verifies each citation during synthesis; positions whose citations cannot be verified are not counted toward the vote." ODR-0001 even specifies the recorded form of a failed check: *"Hendler cited a position attributed to ____, citation could not be verified within session — position not counted toward vote."* This single rule is what separates the Council from a panel of confident-sounding LLMs: an argument with no traceable source carries **zero** weight in the tally.

**Roles per session** (ODR-0001 §Roles):

- **Queen / Moderator** — one named expert who frames the questions, sequences deliberation, calls the votes, and writes the synthesis. The Queen still votes. Crucially, *"the Queen composes; the Queen does not fabricate"*: every quotation in the synthesis MUST trace to actual content in the corresponding `working/session-N/<teammate>.md` file. Composition (weaving cross-expert discussion together) is legitimate; inventing a sentence and attributing it to an expert is *"a methodology violation and grounds for invalidating the session."*
- **Devil's Advocate (DA)** — one named expert whose job is to attack the proposal. The **DA-selection criterion is load-bearing**: the DA's *published methodology* must be **genuinely opposed** to the proposition's framing, "not merely orthogonal… The strongest DA is the one whose work has *publicly contradicted* a load-bearing premise of the proposition." The DA **MUST explicitly withdraw or hold on every contested question** — recorded verbatim either as a withdrawal ("Cagle DA withdrew on Q5, accepting the ValidationContext reification") or as held dissent with a stated re-open condition. *"Silent DA alignment is a methodology violation."*
- **Panel** — the remaining experts. They **must cross-talk** — agree, refine, or withdraw against each other — not opine in parallel. ODR-0001 §Session protocol rule 5: cross-references like *"Allemang's framing is right but I'd push further — …"* are "the hallmark of a real deliberation." This is now carried by direct agent-to-agent `SendMessage` over Agent Teams (the recommended default transport since the 2026-05-30 self-amendment); queen-composed, where workers never talk, is the *exceptional* fallback because it forgoes the dialectic.

### The standing panel of 9 ✅

The canonical roster ([ODR-0001 §Standing Panel](../ontology/odr/ODR-0001-linked-data-council-methodology.md)). Their published positions are stable and domain-agnostic; OPDA may *weight* some more heavily (below) but the roster is fixed.

| Expert | Affiliation | Stance they argue from |
|---|---|---|
| **Dean Allemang** | *Working Ontologist* | Pragmatic RDF modelling; enterprise KG practice; "consumer-query evidence before structural commitment" |
| **Jim Hendler** | W3C / RPI | OWL formal semantics, web architecture |
| **Elisa Kendall** | OMG / EDM Council | Enterprise ontology patterns, FIBO methodology |
| **Kurt Cagle** | *The Ontologist* | SHACL practitioner, taxonomy design, AI integration |
| **Fabien Gandon** | W3C / Inria | RDF/RDFS/OWL standards, linked-data principles, httpRange-14 |
| **Tom Baker** | Dublin Core | Namespace design, metadata standards, vocabulary governance |
| **Ian Davis** | BBC / UK-Gov | Linked-data deployment at scale; publish-first / scope-discipline |
| **Giancarlo Guizzardi** | NEMO / UniLu | Foundational ontology (Kind/Role/Phase), UFO, OntoUML |
| **Nicola Guarino** | ISTC-CNR | Formal ontology theory, identity criteria, DOLCE, OntoClean |

**Extended guests** are added only when a question genuinely turns on their expertise (ODR-0001 §Extended Panel; "do not pad the panel for show"): **Holger Knublauch** (SHACL), **Antoine Isaac / Alistair Miles** (SKOS), **Harshvardhan Pandit** (DPV), **Luc Moreau** (PROV-O), **Renato Iannella** (ODRL), **Manu Sporny / Drummond Reed** (VC/DID), plus Evans/Vernon (bounded contexts) and Ranganathan/ISO 25964 (faceted classification).

**OPDA's project weighting** ([`adoption.md` §Project Weighting](../ontology/odr/council/adoption.md)): **Ian Davis** and **Tom Baker** carry extra weight — UK-government linked-data conventions and DCMI vocabulary-governance practice are directly relevant to a public-interest property-data programme — and OPDA *pre-elects* Knublauch, Isaac/Miles, Pandit, Iannella, Moreau and Sporny/Reed as routinely-applicable guests because the programme genuinely turns on SHACL, SKOS, DPV, ODRL, PROV-O and VC/DID.

### What gets a session — and what doesn't ✅

A method that convened on everything would be theatre; ODR-0001 is deliberately bounded on both sides. **Warrants a Council** ([§When to use](../ontology/odr/ODR-0001-linked-data-council-methodology.md)): URI/namespace/serialisation decisions; competing W3C patterns (OWL vs SKOS vs SHACL; reification vs RDF-star); identity-criterion (foundational-ontology) questions; bounded-context boundaries; mapping conventions to external standards (FIBO, DPV, INSPIRE, GeoSPARQL); vocabulary-catalogue admission or retirement; cross-cutting coherence reviews. OPDA extends this with domain categories — PDTF schema boundaries, the overlay-profile↔severity boundary, eIDAS/OIDC4IDA/VC interop, UK-Gov data-sharing alignment, and anything touching the property-identity family.

**Explicitly does NOT warrant a Council** ([§When NOT to use](../ontology/odr/ODR-0001-linked-data-council-methodology.md)): routine class/property additions that fit an established pattern; SHACL shapes that follow an existing template; editorial fixes (typos, label tightening); working-group procedural matters ("those belong in the WG minutes, not the Council"); and — importantly — **stakeholder consultation**, which "is the role of the adopting project's real-world governance, not a simulated panel." The Council is a *design-deliberation instrument*; padding its agenda "dilutes the methodology and risks Council theatre." This boundary is itself enforced at the pre-flight scope check, whose **retire** verdict marks a wrongly-routed proposition `rejected` with a pointer to the right forum.

## 3. The ratification flow ✅

[ODR-0001 §Session Protocol](../ontology/odr/ODR-0001-linked-data-council-methodology.md) defines a fixed lifecycle from proposition to record:

1. **Pre-flight scope check** (Queen, ~5 min). Is this the right *unit* of decision? Three outcomes: **ratify-as-is**, **re-scope** (too narrow → fold in; too broad → split), or **retire** (wrong corpus, or precedent already settled it → mark `rejected` with a pointer). Substantive findings escalate to a **meta-Council**.
2. **Convene** with a context block: the questions (3–8 is the working range; more signals the scope should split), the input documents with paths, prior related ODRs, and constraints. The block declares the **format tier** (Full Council ≈ 8 runs / Reduced ≈ 3–4 / Author-only ≈ 1) and the **`consensus-mode`**.
3. **One-message parallel spawn** of the panel. Sequential spawning "serialises needlessly and is a methodology violation" — fan-out is a barrier on the slowest teammate, not the sum.
4. **Per-question deliberation**: named citations, mandatory cross-talk, and a **per-question `N-M-K` vote** (in-favour / against / abstain — three exact integers; approximate tallies admitted *only* when a panellist explicitly abstains on a sub-question, with the reason recorded). Dissent is recorded verbatim with its reason.
5. **Queen synthesis**: a **narrative verdict** plus a machine-consumable **tally appendix** (the "two-artefact discipline", now unconditional for Full + Reduced Council). The governing rule: *"Where narrative and tally disagree, narrative wins."*
6. **Produce or amend the ODR** — a new record or an in-place amendment, cited from the record's `council:` frontmatter field.

A **worker-failure protocol** keeps the panel honest under flaky infrastructure: if a teammate doesn't return within the time budget, the Queen records the gap explicitly, may retry once with lineage tracking (`<id>-retry-1`), and otherwise marks the position `unrecorded` with a default `abstain` — "Failed teammates do NOT silently change the panel composition."

### One session, end to end ✅

To make the protocol concrete rather than abstract, here is a single session — [session-005, the identity crux](../ontology/odr/council/session-005-property-land-identity-crux.md) — traced through the lifecycle as the transcript actually records it:

1. **Proposition.** Discharge ODR-0005 (the property/estate/title identity split) to `kind: pattern` standard. The pre-flight check ratifies it as-is and notes the A9 per-kind discipline applies: `## Rules` MUST state UFO/DOLCE category + IC over named hard cases + artefact realisation.
2. **Convening block** (the session frontmatter). **Queen:** Nicola Guarino — chairing *the very gate he set* in Session 001 Q4, where his DA dissent was withdrawable only if three conditions were met (DOLCE category committed, IC over hard cases, UPRN status settled, all exemplar-validated). **DA:** Dean Allemang, named because "his published methodology is the strongest credible opposition to foundational-ontology-purity over-modelling" — his attack demands *consumer-query evidence* for any structural commitment. **Panel** (8 voices over 6 teammates): a `formal-pair` (Gandon + Guizzardi), an `enterprise-pair` (Kendall + Davis), `hendler-solo`, a `governance-pair` (Baker + Pandit), `shacl-solo` (Cagle), `da-solo` (Allemang). `consensus-mode: hive-mind/byzantine` (the B2 pilot), Format: Full Council.
3. **Input documents are pinned with paths** — the ODR-0005 stub, the A9 amendment, ODR-0004 (the namespace block this inherits), the Session-001 transcript, the three diagnostic exemplars (`registered-freehold-house.ttl`, `unregistered-pre-first-registration-house.ttl`, `flat-with-split-uprn.ttl`), and the foundational citations the panel will argue from (Guizzardi 2005; DOLCE WonderWeb D18; OntoClean; HMLR Practice Guides PG 1/16/40; OS AddressBase Plus).
4. **One-message parallel spawn** of the six teammates; each writes a position file under `working/session-005-property-land-identity-crux/<teammate>.md`, citing only its expert's published positions.
5. **Per-question deliberation** with cross-talk and `N-M-K` votes: Q1 (Endurant + Substance Kind) 9-0; Q2 (spatial-material IC) 9-0; Q3 (distinct ICs for LegalEstate vs RegisteredTitle) 9-0; Q4 (UPRN as contingent identifier) 9-0; **Q5 (2-vs-3 class) 6-2-1** with Davis's and Cagle's 2-class positions held-as-live; Q6–Q8 carry. Each amendment a panellist wins (Baker's `dct:source`-to-DOLCE binding; Cagle's machine-readable `subClassOf`; the SHACL-AF succession rule) is recorded against its author.
6. **Synthesis + tally appendix.** Guarino writes the narrative verdict (3-class commitment, UPRN as contingent identifier, no `owl:sameAs`), the structured per-voice tally, and the DA scorecard marking Allemang WITHDRAWN on the named hard cases. His own Session-001 Q4 dissent is recorded **WITHDRAWN** — the gate he set is discharged.
7. **Record updated.** ODR-0005 §Decision is rewritten for 3 classes; new §Operational-specifications subsections discharge A9 inline; `council: session-005` is set; `status` stays `proposed` because the inherited ODR-0004 namespace block has not yet cleared. Downstream ODR-0006/0007/0015 are unblocked; ODR-0008 is explicitly deferred on cardinality.

Every step above is auditable from the transcript and the working files — which is the whole point: a future maintainer (or a regulator) can reconstruct not just *what* was decided but *who argued what, from which citation, and what would re-open it*.

## 4. The ODR-vs-ADR boundary — the DCAP discipline ✅

The Council enforces a clean separation of *what changes when you say it differently*:

- **Modelling decisions → ODRs** (`docs/ontology/odr/`) — ontological commitments about what kinds of entities exist, their identity criteria, their Roles/Phases/Relators/Modes/Qualities. These are *language-independent*: the same commitment survives re-encoding in OWL, OntoUML, or prose.
- **Engineering decisions → ADRs** (`docs/adr/`) — URI policy, namespace topology, graph separation, build pipelines, indexing, validation-severity schemes. These are *language-coupled*: change the representation and the decision changes.

The boundary is the DCAP `kind` enum, **made normative** by amendment A9 ([ODR-0001 §What an ODR records](../ontology/odr/ODR-0001-linked-data-council-methodology.md)). For `kind: pattern` and `kind: mapping`, the ODR's `## Rules` **MUST** state, for every class or scheme it commits to:

- **(a) a UFO/DOLCE meta-category** (Substance Kind / Role / Phase / Relator / Mode / Quality Region / Abstract), citing Guizzardi 2005 Ch. 4 or DOLCE WonderWeb D18;
- **(b) an identity criterion stated over named hard cases** — *"the IC is the test of the meta-category commitment; without it, the commitment is decorative"*;
- **(c) the artefact realisation** (URI minting, shape-graph location, SHACL/DASH machinery).

For `kind: methodology | architecture | programme`, (a) and (b) are **relaxed** — these are constitutively about artefact/process/organisation. (ODR-0001 itself is the `kind: methodology` exemplar that correctly declares no UFO category.) This is enforced two ways: a planned **`odr-review` lint** (warning on `status: proposed`, **blocker on `status: accepted`**) and the **pre-flight scope check**, where a `kind: architecture` record whose load-bearing content is actually a Relator declaration is grounds for re-scope.

A9 also defines an **artefact-identity test** for *extracting* shared patterns: when an `architecture` ODR's rule is cited by *another* `architecture` ODR (cross-borrowing), that is the signal to promote the rule to a `pattern` ODR. This actually fired in practice — the SHACL-AF non-blocking-quality-rules pattern reached four citing sites (ODR-0005 §6a, ODR-0009, ODR-0015 §4a, ODR-0011 §5a) and was extracted to **ODR-0017**; the DPV class-level co-annotation pattern likewise reached four sites and became **ODR-0018** ([`adoption.md` Pending log](../ontology/odr/council/adoption.md)).

## 5. The track record — five worked examples ✅

The full ledger is [`docs/ontology/odr/council/adoption.md` §Track Record](../ontology/odr/council/adoption.md). Five examples show the methodology is rigorous, not hand-wavy.

### Example A — the identity crux discharged under dissent (session-005)

ODR-0005 was *"the gate the entire OPDA ontology programme is serialised behind"*: PDTF conflated the physical property, the legal estate, and the registered title into one implicit entity with no identity criterion (a UPRN floating across four leaf paths with zero joins). [Session 005](../ontology/odr/council/session-005-property-land-identity-crux.md) was the first `kind: pattern` ODR to discharge under the A9 per-kind discipline — *and a pressure-test of A9 itself* ("if the discipline cannot be discharged on the most demanding ODR in the corpus, the amendment is operationally weaker than the Council intended").

- **Queen:** Nicola Guarino (DOLCE/OntoClean) — convening the gate *he himself set* with a withdrawable DA dissent back in Session 001 Q4.
- **DA:** Dean Allemang, selected precisely because his pragmatic "demand consumer-query evidence for any structural commitment" is the strongest credible opposition to foundational-ontology over-modelling.
- **Outcome:** seven of eight questions landed 9-0; the load-bearing one — **2-class vs 3-class** — landed **6-2-1 FOR the 3-class split**, with Davis's 2-class position (`RegisteredTitle ⊑ LegalEstate`, upgradeable on round-trip evidence) and Cagle's 2-class-with-commonhold-trigger preserved as **held-as-live dissent**, not steamrolled. Allemang (DA) withdrew on Pandit's PII-regime-discriminable hard case and the first-registration lifecycle event. UPRN was committed as a **contingent identifier (not the IC)**, enforced by SHACL/DASH rather than `owl:sameAs`.

This is the methodology working as designed: a real split, a real tally, named dissent with a named re-open trigger, and an IC stated over three named exemplars (`registered-freehold-house`, `unregistered-pre-first-registration-house`, `flat-with-split-uprn`).

### Example B — the Devil's Advocate's case *becomes* the verdict (session-029)

A standing risk in any panel is a DA who loses gracefully every time (theatre). [Session 029](../ontology/odr/council/session-029-r2-ufo-axis-load-bearing.md) is the counter-evidence. The proposition: now the curated Category-G walk had landed, is the UFO-axis module split (ODR-0008a/b/c) operationally load-bearing? DA Ian Davis argued *no*. The panel voted **0-6-0** against the proposition on Q1–Q4 — **DA Davis's case sustained, no withdrawal condition met**. The decisive finding was empirical: the walk had typed leaves by *bearer Kind* (`rdfs:domain`), not by UFO meta-category, so "the presupposed UFO-typed partition was never built", and `priceQualifier`/`ownershipType` fail OntoClean disjointness for a module boundary (Guarino: rigid *typing* ≠ a sound *partition backbone*). Result: ODR-0008 stays monolithic; **nothing minted**. A methodology where the DA can win — and where the verdict is to *not* build something — is one with teeth.

### Example C — held-as-live dissent with a dated re-open trigger (session-006)

[Session 006](../ontology/odr/council/session-006-agents-and-roles.md) (Agents & Roles) ratified Person/Organisation as Substance Kinds and the Seller/Buyer **RoleMixins** founded by the Transaction relator (anti-rigidity — *a Seller is not a kind of Person*). Six questions landed 10-0; one — **`opda:Organisation rdfs:subClassOf org:Organization`** — landed **9-1**, with Allemang (DA) holding a live dissent **and a named 18-month re-open trigger**: *"downgrade to a `dct:source` reference if no consumer exercises Org-Ontology machinery beyond class declaration."* The dissent is not a footnote; it is an actionable future obligation. (ADR-0027, §6, is what makes such triggers *queryable* rather than buried in prose.)

### Example D — a pattern earns its own record (ODR-0017, the artefact-identity test in action)

This is the §4 artefact-identity test running for real rather than in the abstract. Across sessions 005, 009, 015 and 011, four different ODRs independently reached for the *same* device — a SHACL-AF (SPARQL-based) non-blocking data-quality rule to materialise succession/deprecation chains: ODR-0005 §6a (UPRN succession), ODR-0009 (claims), ODR-0015 §4a (INSPIRE succession), ODR-0011 §5a (deprecation chains) ([`adoption.md` Pending log](../ontology/odr/council/adoption.md)). On the **fourth citing site** the A9 spawn-rule fired: the rule passed the three-part test (re-instantiable to a not-yet-cited artefact; load-bearing ontological content), so it was **extracted** to [**ODR-0017** — SHACL-AF Non-Blocking Data-Quality Rules Pattern](../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md) (`kind: pattern`), and the four originating records retrofit `implements: [ODR-0003, ODR-0017]` in frontmatter. The pattern then kept paying off as the corpus grew: session-006 Q4's `opda:CapacityAuthorityMatchRule` ([session-006](../ontology/odr/council/session-006-agents-and-roles.md)) was logged as the **sixth citing site**, and ODR-0017's own §IC consistency check confirmed the new use is "the same individual under §5a Rule 1 — rule extension preserves identity." The lesson for a skeptic: the methodology does not just record decisions, it *notices when it is repeating itself* and abstracts — and the abstraction is governed by a stated, checkable test, not taste. (The DPV class-level co-annotation pattern → **ODR-0018** is the twin case, also at four citing sites.)

### Example E — when *not* to switch substrate (scope-check-2, a meta-Council on the method itself)

The Council also deliberates *its own machinery*. [Scope-Check 2](../ontology/odr/council/scope-check-2-hive-vs-swarm.md) (a Reduced Council meta-Council, Queen Kendall, DA Davis) asked whether the planned ratification sessions should adopt **hive-mind consensus** or stay on plain **Agent fan-out** — "deliberating the methodology using the methodology", which the transcript notes is "appropriately self-applicative". The vote was **5-1 SELECTIVE**, and the value is in *why* each voice picked a different boundary (it is the clearest worked statement of the §6 consensus-mode selection rule):

- **Gandon + Allemang** — adopt a stronger substrate only for **cross-conditional** sessions where the verdict on one question changes whether later questions even make sense (Gandon's SPARQL-federation test: *"does the queen need to know two panellists' positions are mutually inconsistent before synthesising?"* — S002 catalogue: no; S005 identity crux: yes). → S005, S015.
- **Cagle + Knublauch** — adopt it only where the verdict is a **typed, machine-readable contract** consumed by downstream tooling (Cagle: ODR-0011 Q8's per-scheme UFO category, "typed verdict, downstream-consumed, retire-safe"). → S011 Q8.
- **Kendall (Queen)** — REJECT for six of seven session shapes (gate/substrate/module/cross-cutting/overlay/author-only), because each "resolves by examining ontological reality, not by aggregating votes" (the FIBO governance test).
- **Davis (DA)** — held **DISSENT** outright, on the published-first principle: the proposition is wrong-framed because it asks *"where might hive-mind help?"* rather than *"what failure of the current pattern does it fix?"* — "Zero failures named. Two transcripts approved." A dissent that *the default is fine* is exactly the kind of result a rubber-stamp panel never produces.

This is why exactly two pilots (S005 byzantine, S011 Q8 typed-output) ran rather than a wholesale switch — and why, once the two-artefact tally discipline was shown to add value, it was promoted to a *default* and the pilot labels retired (§6), instead of mandating the heavier consensus substrate everywhere.

> Across the corpus the discipline holds visibly: 7 of 7 `kind: pattern` ODRs discharged cleanly under A9; DA scorecards record per-question WITHDRAWN / HELD / CONCEDED with verbatim conditions; and meta-Councils (scope-checks) produce lettered amendments (A1–A9, B1–B8) rather than new records — e.g. [scope-check-1](../ontology/odr/council/scope-check-1-programme.md) returned 8-1 APPROVE with nine amendments that reshaped the whole programme cut.

## 6. AgentDB / ReasoningBank — making the deliberation queryable 🟡

A session is *not* an ODR — it is an *input* that links to one or more ODRs, and `odr-index` deliberately does not index sessions. [ADR-0027](../adr/ADR-0027-council-session-indexing-in-agentdb.md) closes the three capabilities that separation leaves unserved, indexing each session as an **auxiliary entry keyed on session id** (never an `odr/*` record) across four complementary stores:

| Mechanism | Store | Answers |
|---|---|---|
| **Recall** | `memory_store` namespace `council-sessions` | *"What has the Council already argued about namespaces?"* — semantic search **before** convening (a step the protocol expects). The indexed value is the load-bearing future-conditional content: verdict + named re-open triggers + held-as-live dissents + panel. |
| **Provenance** | `agentdb_causal-edge` | *"Which session produced this rule, and what else did it feed?"* — `session-NNN —deliberated→ odr/ODR-NNNN` and the inverse, a one-hop traversal instead of a grep. |
| **Learning** | ReasoningBank (`agentdb_reflexion-store` / `sona_trajectory_store`) | *"Which argument / DA-challenge patterns tend to win?"* — one position→challenge→vote trajectory per session, tagged with the verdict and DA outcomes, for pattern distillation. |
| **Enumeration** | `agentdb_hierarchical-store` tier `episodic` | files each session under `council/*` alongside `odr/*`/`adr/*`. *Honestly recorded as largely redundant* with recall + git — "the one place where complete and non-redundant conflict", included only for total coverage. |

The headline benefit: ODR-0001's **re-open triggers and held-as-live dissents become queryable**, so a proposed change can be checked against recorded triggers *before* acting — making the deferral discipline operational, the ontology-side parallel to the [ADR-0005](../adr/ADR-0005-deferred-work-register.md) deferred-work register. The honest caveat (ADR-0027 §Consequences): *"the ReasoningBank layer only pays off at scale"* — it is built for the council process, not yet a published end-user product. The source of truth remains the session markdown; all four stores are derived and idempotently rebuildable.

The methodology has also piloted genuine multi-agent **consensus substrates**: session-005 ran a `hive-mind/byzantine` "structural vote acknowledgement" pilot (B2) and session-011 Q8 a `hive-mind/typed-output` pilot (B3), both feeding the EXPAND verdict that made the two-artefact tally discipline unconditional ([ODR-0001 §Two-artefact discipline](../ontology/odr/ODR-0001-linked-data-council-methodology.md)). Self-amendment is real: ODR-0001 has amended itself at least four times (portability refactor; five hive-mind-advanced rules; four more; and the cross-talk-transport promotion of `SendMessage`), each logged in `adoption.md`.

### How a session is dialled in — format tier × consensus-mode ✅

Two orthogonal knobs are declared in every session's frontmatter, and the methodology specifies *exactly* when each value applies — so a session is reproducible, not improvised ([ODR-0001 §Format tiers, §Consensus-mode framework](../ontology/odr/ODR-0001-linked-data-council-methodology.md)).

**Format tier** sizes the apparatus to the stakes: **Full Council** (Queen + DA + 6 panel, ~8 runs) for a substantive decision with a credible split; **Reduced Council** (Queen + DA + 1–2 panel, ~3–4 runs) for an amendment on a narrow axis; **Author-only** (~1 run, no panel) for recording a decision precedent already settled. The default is Full Council; deviations are justified inline.

**Consensus-mode** picks the coordination/voting substrate. The selection rule is *structural*, and §6 Example E is the live illustration of it: use the heavier machinery only when the verdict's *shape* demands it.

| `consensus-mode` | Picked when | Example in the corpus |
|---|---|---|
| **`agent-fan-out`** (default) | Votes on each question are *independent* — the verdict reduces to a tally of standalone positions. The vast majority of sessions. | Most sessions, incl. the catalogue/enumeration ones (S002) where "catalogue rows are independent" |
| **`hive-mind/byzantine`** | A verdict on one question is *conditional* on another (multi-condition withdrawals); **structural vote acknowledgement** matters. | **S005** (the identity crux — Guarino's three-condition DA withdrawal makes Q-verdicts interdependent) |
| **`hive-mind/typed-output`** | The verdict is a **structured object consumed by downstream tooling** (a generator, linter, or retriever) — "the tally is data, not decoration." | **S011 Q8** (the per-scheme UFO meta-category, inherited by S006/S007/S008/S009/S012) |
| `hive-mind/weighted` · `quorum` · `raft` · `gossip` · `crdt` | Leader-authoritative · stated-strictness threshold · term-ordered supersession · dropout-tolerant · re-broadcast-safe convergence, respectively. | Available as operational tools; selected per session shape |
| **`none`** | Author-only session; no panel to coordinate. | The ODR-0027 directing-authority decision (§7) |

The honest history here is that byzantine and typed-output started as *labelled pilots* (B2/B3). Once all three pilot sites showed the structured tally caught dissent a narrative reading would have buried, the **two-artefact discipline became the unconditional default** for Full + Reduced Council *regardless* of consensus-mode, and the pilot labels were retired — the cheaper, durable win (a machine-readable tally appendix in every transcript) was kept, without forcing the heavier consensus substrate onto sessions that do not need it. That is the methodology preferring the *minimum* coordination that the verdict's shape requires.

### The capacity-vs-authority seam — where the method meets the RBAC model ✅

One session output is worth singling out because it is where the Council's discipline produced the load-bearing seam in the authorisation model (the subject of [`05-authorisation-roles-and-rbac.md`](./05-authorisation-roles-and-rbac.md) — read there for the full role/authority treatment; here is only *how the Council arrived at it*). [Session 006](../ontology/odr/council/session-006-agents-and-roles.md) **Q4** ratified, **10-0**, a deliberate split of two predicates PDTF had collapsed into free text:

- **`opda:assertedCapacity`** — the *sales-side claim* (SKOS-typed per ODR-0011 §8a), e.g. "selling as executor";
- **`opda:evidencedAuthority`** — the *conveyancing-side* link to actual evidence (a `prov:wasAttributedTo` edge to an `opda:Claim` — probate, power of attorney) per ODR-0009.

What makes this a *Council* result rather than a lone modeller's preference is the grounding: the **load-bearing voices were the bounded-context experts** (Evans + Vernon), who argued the split is a **"non-negotiable bounded-context seam"** between the Sales context (capacity asserted on the Seller) and the Conveyancing context (authority evidenced on a verification Activity), citing *Domain-Driven Design* (Evans 2003, Ch. 14 "Maintaining Model Integrity") and Vernon 2013, Ch. 2. Pandit layered DPV lawful-basis discrimination onto the `evidencedAuthority` link (regulated-profession → public-task; statutory → legal-obligation; private grant → consent), and a `RegulatedCapacityRequiresEvidence` SHACL rule at `sh:Warning` flags the gap between *asserted* and *evidenced* — itself a citing site of the ODR-0017 pattern from Example D. The methodology turned "who is allowed to sell this property, and on what evidence?" from a free-text field into a typed, validated, provenance-backed seam — adjudicated, with the cross-context argument on the record.

## 7. "AI proposes, human disposes" — the directing-authority override ✅

The most honest part of the governance story is that **the Council does not have the last word**. ODR-0001 is emphatic: *"Council verdicts shape proposals; the project's governance shapes adoption… records MUST NOT treat a Council verdict as ratification."* OPDA's real-world chain is Council proposal → Working Group → Modelling Sub-Committee → AGM ([`adoption.md` §Real-world Governance Handoff](../ontology/odr/council/adoption.md)). On greenfield grounds, a human **directing authority** can override the panel outright. Three documented cases:

1. **Hash vs slash URIs (session-037 Q2).** After cross-talk, a four-voice majority — Gandon (Cool URIs/httpRange-14) + Baker (W3C Best-Practice Recipes) + Pandit (DPV principal author) + Davis (DA) — converged **5-2 to *revert to hash*** on the decisive ground that the slash override *fails its own governing test* (ODR-0004's reopening trigger of "≥1,000 terms OR a named per-term-content-negotiation consumer" — both unmet at ~147 terms). The transcript records the override plainly: *"this contradicts the directing-authority no-hash directive; operator ratifies."* The human kept slash. The dissent is preserved; the decision is the human's. ([session-037](../ontology/odr/council/session-037-url-scheme.md).)
2. **One-go full descriptive coverage (session-021).** Davis (DA) held "completeness-as-a-gate" as live dissent (re-open: a named consumer query the BASPI5 slice can't answer). It was *"OVERRULED by directing-governance directive: ONE-GO delivery, full coverage, NO gates / staging / deferral"* — the authority mandated complete descriptive coverage against the council's staged instinct. ([session-021](../ontology/odr/council/session-021-bounded-context-implementation-plan.md).)
3. **A whole doctrine adopted with no panel (ODR-0027).** [ODR-0027](../ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md) — the "classification over inheritance / roles never subclass a Kind / every enum is a SKOS scheme" doctrine — was a **directing-authority decision recorded with no council session at all** (`consensus-mode: none`, no panel). It even **supersedes** a prior council disposition (session-036's keep-the-subclasses outcome for evidence types). This is the clearest statement of the boundary: the Council is a deliberation instrument; the human owner is the authority.

This is not a flaw to hide; it is the design. The Council buys *auditable, authority-grounded rationale and recorded dissent*; the human buys the right to make a greenfield call and have the disagreement on the record.

### Why this maps onto a standards body ✅

For an audience that *is* a standards association, the most useful framing is that the Council is not a substitute for OPDA's real governance — it is the **deliberation layer that feeds it**. The two-stage status discipline is visible throughout the track record: a record a Council ratifies is set `council: session-NNN` but stays **`status: proposed`** until the Working Group / Modelling Sub-Committee draft-adopts it, and reaches **`accepted`** only after AGM ratification ([`adoption.md` §Real-world Governance Handoff](../ontology/odr/council/adoption.md)). Several ODRs sat at `proposed` for exactly this reason — e.g. the whole `depends-on: [ODR-0004]` chain (13 ODRs) was held `proposed` until the WG ratified the namespace string in [session-003b](../ontology/odr/council/session-003b-namespace-wg-decision.md), then flipped to `accepted` in one sweep. So the chain a standards reviewer recognises — *proposal → committee → ratification* — is preserved exactly; the Council simply makes the *proposal* stage rigorous, named, and citable instead of a Slack thread. The AI panel does the homework (the citations, the dissent, the hard-case ICs); the humans keep the authority. That is the division a property-data standards body should want.

## Built vs planned

| Capability | Status | Evidence |
|---|---|---|
| Council methodology, written + self-governing | ✅ | [ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md) |
| ~37 sessions on record; 28 ODRs produced | ✅ | [`adoption.md`](../ontology/odr/council/adoption.md); `docs/ontology/odr/` |
| Citation-grounding + Queen verification (unverifiable = no vote) | ✅ | ODR-0001 §Citation grounding |
| Devil's Advocate with mandatory withdraw-or-hold | ✅ | ODR-0001 §Roles; sessions 005/006/029/037 |
| `N-M-K` tallies + verbatim dissent + re-open triggers | ✅ | every Full/Reduced session transcript |
| ODR-vs-ADR boundary, normative per `kind` (A9) | ✅ | ODR-0001 §What an ODR records |
| Pattern extraction by artefact-identity test | ✅ | ODR-0017, ODR-0018 (4 citing sites each) |
| Format tier × consensus-mode selection (structural rule) | ✅ | ODR-0001 §Format tiers / §Consensus-mode; scope-check-2 |
| End-to-end session auditability (convening → vote → record) | ✅ | session-005 + its `working/` position files |
| Capacity-vs-authority RBAC seam adjudicated by Council | ✅ | session-006 Q4 (10-0); see `05-authorisation-roles-and-rbac.md` |
| Self-amendment (≥4 times) | ✅ | `adoption.md` (ODR-0001 amendments 1–4) |
| Directing-authority override ("AI proposes, human disposes") | ✅ | sessions 021/037; ODR-0027 |
| AgentDB recall + provenance edges + episodic tier | 🟡 | ADR-0027 (built for the council process) |
| ReasoningBank learning (which arguments win) | 🟡 | ADR-0027 — "only pays off at scale" |
| Hive-mind consensus substrate (byzantine/typed-output) | 🟡 | piloted at S005/S011; tally discipline now default |
| Triggers/dissents as an end-user-queryable product | 🔵 | ADR-0027 §Consequences (internal today) |

## Talking points for the quarterly tech review

- **"The AI didn't free-style the ontology."** Every contested modelling decision went through a named-expert dialectic where an argument with no traceable W3C-spec / book / deployment citation counts for **zero** — and a mandatory Devil's Advocate has to either withdraw or put dissent on the record. That is the difference between *an ontology an LLM asserted* and *an ontology that was adjudicated*.
- **It produced a citable audit trail, not a black box.** ~37 sessions and 28 Ontology Decision Records, each with vote tallies, verbatim dissent, and dated re-open triggers. Anyone — a lender's data lead, HM Land Registry, a conveyancer — can read *why* the property was split into three classes, and what evidence would re-open the question.
- **The DA is not theatre.** Show session-029: the Devil's Advocate *won* 0-6-0 and the verdict was to **not** build a module split — the methodology can talk the project out of over-modelling.
- **Honest governance: AI proposes, human disposes.** The human owner overrode a 5-2 council recommendation on URIs and authored a whole doctrine (ODR-0027) with no panel. The Council informs the decision; it doesn't make it. This is a feature for a *standards body* audience — it maps onto Council → WG → Sub-Committee → AGM.
- **It's a reusable governance asset.** The methodology is portable (two programmes already) and self-amending — it improves itself through its own protocol, and the deliberations are being indexed for recall and learning (ADR-0027). It is infrastructure OPDA can keep using as the standard evolves.
- **Caveat to keep honest:** the AgentDB/ReasoningBank layer is built for the *internal* council process today, not yet a published end-user product — and its learning value materialises at scale.

## Source files

- **Methodology:** [`docs/ontology/odr/ODR-0001-linked-data-council-methodology.md`](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — the full protocol: roles, citation grounding, format tiers, consensus-mode framework, the A9 per-kind discipline, self-amendment.
- **Track record (the evidence ledger):** [`docs/ontology/odr/council/adoption.md`](../ontology/odr/council/adoption.md) — every session with one-line verdicts, votes, dissents, and the OPDA adoption hooks (project weighting, governance handoff).
- **AgentDB / ReasoningBank indexing:** [`docs/adr/ADR-0027-council-session-indexing-in-agentdb.md`](../adr/ADR-0027-council-session-indexing-in-agentdb.md).
- **Worked-example transcripts:** [session-005 (identity crux, 6-2-1; the end-to-end walk)](../ontology/odr/council/session-005-property-land-identity-crux.md) · [session-006 (held-as-live + 18-month trigger; the Q4 capacity/authority seam)](../ontology/odr/council/session-006-agents-and-roles.md) · [session-029 (DA's case becomes the verdict, 0-6-0)](../ontology/odr/council/session-029-r2-ufo-axis-load-bearing.md) · [session-037 (directing-authority hash/slash override, 5-2)](../ontology/odr/council/session-037-url-scheme.md) · [scope-check-1 (meta-Council, 8-1)](../ontology/odr/council/scope-check-1-programme.md) · [scope-check-2 (hive-vs-fan-out, 5-1)](../ontology/odr/council/scope-check-2-hive-vs-swarm.md).
- **Directing-authority decision (no panel):** [`docs/ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md`](../ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md).
- **Pattern-extraction outputs:** [ODR-0017 (SHACL-AF quality rules)](../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md) · [ODR-0018 (DPV class-level co-annotation)](../ontology/odr/ODR-0018-dpv-class-level-coannotation-pattern.md).
- **Sibling facet (read alongside):** [`05-authorisation-roles-and-rbac.md`](./05-authorisation-roles-and-rbac.md) — the role/capacity/authority model this methodology produced; §6 here covers only *how the Council arrived at it*.
- **Backbone references:** [`_research-synthesis.md` §3](./_research-synthesis.md) · [`_fact-sheet.md`](./_fact-sheet.md) (the "directing authority" pattern + governance numbers).
