# Council Scope-Check 1 — Are ODR-0002 … ODR-0014 the Right Cut?

- **Date:** 2026-05-26
- **Convened by:** OPDA semantic-modelling lead
- **Format:** ODR-0001 Linked Data Council with Devil's Advocate
- **Queen / Moderator:** Elisa Kendall (OMG / EDM Council — FIBO methodology lead)
- **Devil's Advocate:** Ian Davis (BBC / UK Government linked-data; ex-Talis)
- **Method:** 9 expert voices across 6 teammates (one agent-team teammate per position file, own context window). Queen synthesised. This is a **meta-Council** session — its subject is the *plan* operationalising ODR-0002…ODR-0014, not any single ODR's content. Output: amendments to the plan (`docs/plan/council-followup-sessions.md`) and recommended spawns/retirements in the ODR corpus.

## Panel (9 voices, 6 teammates)

| Teammate | Experts | Lens |
|---|---|---|
| kendall-queen | **Elisa Kendall (Queen)** | FIBO modular methodology; programme-level partitioning |
| davis-da | **Ian Davis (DA)** | Publish-first / time-box; "do we need 13 ODRs at all?" |
| allemang-hendler | Dean Allemang; Jim Hendler | Pragmatic RDF + W3C web architecture |
| gandon-guizzardi | Fabien Gandon; Giancarlo Guizzardi | URI-graph cleanness + UFO meta-category cleanness |
| cagle | Kurt Cagle | Operational SHACL collapse; AI-RDF consumer pragmatism |
| baker-pandit | Tom Baker; Harshvardhan Pandit | Vocabulary catalogue governance + DPV/data governance |

Working files: `working/scope-check-programme/<teammate>.md` (this directory).

## Input documents

- ODR-0001 (methodology); ODR-0002…ODR-0014 (the 13 stubs under review)
- Council Session 001 transcript
- Plan: `docs/plan/council-followup-sessions.md` — operationalises the 13 stubs

## Context

The plan (1,168 lines) attaches one Council session to each of ODR-0002 through ODR-0014. Critique-point 8 from the plan's review asks: *are the stubs themselves the right unit of decision?* Running 12 sessions to ratify the wrong stubs wastes the budget. This scope-check session is the pre-flight (§11 of the plan) elevated to programme level: convene a Council on whether the 13-ODR cut is sound before running 13 sessions ratifying it.

Eight questions framed by the Queen, answered by all panellists.

---

## Q1 — Is the 13-ODR cut right? Granularity check

**Kendall (Queen):** APPROVE the count as the right order of magnitude. 13 ODRs is *modest* for the scope (1,556 base leaves, 935 annotated, 15 overlays, three-graph separation, PROV-O + DPV + SHACL + DASH). FIBO BE decomposes into ~30 modules; OPDA's surface sits in the same order. The risk is **under-cutting specific entities** (Address), not over-cutting.

**Davis (DA):** **DISSENT.** Roughly twice the records the work needs. Session 001 actually decided seven things; expansion to 13 is forensic archaeology. Counter-proposal: compress to 5–7 records anchored on consumer-facing deliverables. *"At the BBC we covered Brand → Broadcast → Version with one ontology, one shapes graph, one URI policy."*

**Allemang:** Right number, mostly right cuts. Eleven of 13 satisfy the *Working Ontologist* test (partition by questions answered in one sitting). Doubts: 0008 size (Q2), 0009/0012 boundary (Q5), 0002/0014 (Q4). Net: keep 13.

**Hendler:** Stronger version — each ODR corresponds to a distinct URI-graph commitment. Where two graphs collapse to one, the cut is wrong; otherwise stands. Keep 13.

**Gandon:** Endorse. The cut respects the OWL ⊥ SHACL ⊥ annotation graph seam. Single reservation: 0010 and 0013 both work the shapes graph (returns at Q6).

**Guizzardi:** Mostly category-clean but under-articulated on the Qualities-vs-Phases-vs-Modes axis inside 0008. Endorse 13; flag 0008's internal discipline.

**Cagle:** 13 is the floor. +1 (0008 split along leaf-vs-structured-value) +2 (Address + Generator) = net 15. Five- or eight-ODR programmes carry 800–1500 lines per ODR — reviewability fails.

**Baker:** Mostly yes, with one collapse. 13 → 12 after sessions 002/014 (retire 0014).

**Pandit:** Ratify. The 009/011/012 cluster carries the heaviest cross-cutting load; co-annotation pattern is currently described in both 0009 and 0012 (duplication signal).

**Vote: 8-1 APPROVE the cut (with named adjustments). Davis lone DA dissent.** Programme stands as the working scope.

---

## Q2 — ODR-0008 sub-module split

**Kendall (Queen):** **SPLIT four ways.** 935 leaves is past the *Ontology Engineering* Ch. 9 single-engineer line. The four families (built-form / energy & utilities / searches / encumbrances) have **different attachment classes and different evidence shapes**. Decisive reason: encumbrances attach to `opda:LegalEstate`, not `opda:Property` — ODR-0005's multi-class split is erased if all four share one module.

**Davis (DA):** **DISSENT** on the split. 935 leaves is answered by generation, not partition. ODR-0004 already commits generator-first; splitting governance of a single declare-once-reconcile-overlays decision into four threads is the wrong move. *"BBC `/programmes/` descriptive attributes — Genre, Format, Series, Schedule, iPlayer — one record, one TTL."*

**Allemang:** No split. Volume is real but the modelling pattern is uniform. Split at the TTL artefact level (`property-built-form.ttl`, etc.), not the ODR level.

**Hendler:** No split. All four families attach to the same Property/Title URI graph. One graph, one ODR.

**Gandon:** Defer. Splitting now buys nothing the flat namespace doesn't give us. Split only when one sub-module acquires a distinct external alignment (energy → QUDT+SSN; encumbrances → FIBO).

**Guizzardi:** Defer. The candidate sub-modules carve different UFO meta-categories (built-form → Qualities + intermediate Kinds; condition → Phases; valuation → Modes; encumbrances → Relators). The split is category-clean in principle, but premature without volume work.

**Cagle:** **SPLIT** — but not Kendall's four-way. Split along the **shape-authorship boundary**: leaf datatype properties (one ODR) vs structured value objects (Survey, EPC, Search Report — another ODR). "Survey-as-Kind" justifies the split.

**Baker:** Hold; revisit after session-008.

**Pandit:** Hold. PII density (occupier names, AML, `cautionOrConviction`) sits between 0006 and 0008's encumbrances — sub-dividing makes the governance handoff harder.

**Vote: 2-7 SPLIT.** Kendall and Cagle vote SPLIT (for different splits); 7 panellists defer or hold. **Verdict: defer the split.** Record both proposed splits (Kendall's four-way attachment-class split; Cagle's leaf-vs-structured-value split) as candidates for a post-MVP re-cut. Trigger per Gandon+Guizzardi: a real ontological joint (distinct external alignment OR clear category line) must surface in session-008's drafting before splitting.

---

## Q3 — ODR-0008 vs ODR-0011: combine descriptive attrs + enumerations?

**Kendall (Queen):** **APPROVE current cut — keep separate.** ODR-0011 is cross-cutting: serves 0006 (role enums), 0007 (`participantStatus`, `legalForms`), 0008 (built-form, EPC, council-tax band), 0009 (evidence-type, assurance-level), 0012 (DPV PII categories). Folding into 0008 orphans four other consumers.

**Davis (DA):** **DISSENT** on keeping 0011 separate. Six shared questions between two records is a smell. Withdraw if Q1 carries (5–7-record cut absorbs 0011).

**Allemang:** Keep separate. Different mechanisms, different consumers. The handoff is clean: 0008 cites 0011 via `sh:in` or SKOS-typed values.

**Hendler:** Keep separate. SKOS scheme URIs and descriptive-property URIs are *separate URI graphs* with different governance cycles (schemes accept new members without ontology version bumping; predicates don't).

**Gandon:** Keep separate. `rdfs:isDefinedBy` test: 0008 mints OWL property declarations, 0011 mints SKOS schemes. Two namespaces, two consumers.

**Guizzardi:** Keep separate, **with a sub-finding**: SKOS concepts in 0011 are not all the same kind of thing — some are Qualia in a Quality Region (EPC band), some are Role labels, some are Phase labels, some are method/plan codes. **ODR-0011's `## Rules` should require each scheme to declare its UFO meta-category** in a downstream amendment.

**Cagle:** Keep separate. Different shape-graph layers (vocabulary graph vs constraint graph), different reviewer cohorts, different external consumers.

**Baker:** Keep separate. DCMI / DCAT-style application-profile discipline.

**Pandit:** Keep separate. 0011 hosts the purpose taxonomy and PD-category register consumed by 009/012/006; folding orphans those.

**Vote: 8-1 KEEP separate.** Davis DA dissent recorded; withdrawal conditional on Q1. **Guizzardi's sub-finding adopted: ODR-0011 carries a per-scheme UFO meta-category declaration.**

---

## Q4 — ODR-0002 vs ODR-0014: retire 0014?

**Kendall (Queen):** **RETIRE ODR-0014.** It exists only because Session 001 produced amendments out of band. The plan now runs 002 *before* 014 in Phase 0; S002 can absorb Session 001's row changes directly with per-row `dct:source`. Amendment-ODR is not a FIBO convention. Saves ~6 agent runs.

**Davis (DA):** **DISSENT — retire.** Strong. Both records are `proposed`; amending a draft is double-bookkeeping. Edit 0002 in place with a changelog. *"W3C's own discipline: a CR has Errata; a WD does not."*

**Allemang:** Closest call. Don't retire NOW; retire in a future consolidation that re-issues 0002+0014 as catalogue-v2.

**Hendler:** **Keep both permanently.** Catalogue tiering decisions are governance acts with named voters. Collapse loses "when did OWL-Time get promoted, and on whose dissent?" Pattern: W3C REC + ERRATA + REC-revision.

**Gandon:** Retire once the catalogue stabilises. The supersession mechanism (0014 carries `supersedes: [ODR-0002]` as partial supersession inside `## Rules`) is operationally novel; cost-of-novel-pattern is an argument for collapsing.

**Guizzardi:** Retire — later than Gandon. The Session 001 changes are *reasoned* (OWL-Time IN because PROV-O instants need OWL-Time intervals — an incoherence argument). Reasoning belongs in the catalogue, not in a separate amendment record.

**Cagle:** Retire post-MVP, not now. The partial-supersession pattern 0014 carries is the only honest record of *why* the catalogue moved; flattening now flattens provenance.

**Baker:** **RETIRE now** (Baker's call as catalogue owner). DCMI hygiene: a vocabulary catalogue is a single record; amendments are a change log inside, not a parallel record. DCTERMS does not have one record per term and another per amendment.

**Pandit:** Concurring with Baker. No governance objection.

**Vote: 7-1-1 retire (timing varies).** Hendler the lone "keep permanently" (recorded as live dissent — Hendler weights audit-trail; majority weights reader-economy). Allemang abstains on *now* but agrees on *eventually*. Davis (DA) aligns with majority on retirement — a partial DA withdrawal. **Verdict: RETIRE ODR-0014 now**; fold rows into ODR-0002's `## Rules` as `## Change log`; mark ODR-0014 `superseded` with `## Decision Outcome` pointing at the change log. **Hendler's dissent on permanence preserved in plan §9 risks.**

---

## Q5 — ODR-0009 vs ODR-0012: combine Claims + Governance?

**Kendall (Queen):** **APPROVE current cut — keep separate.** PROV-O and DPV answer different questions. A claim with no DPV annotation is *under-governed*; a claim with no PROV-O chain is *unverified*. Different defects, different audits, different owning experts, different downstream consumers. Folding produces a 600-line ODR with two heads.

**Davis (DA):** **DISSENT — combine.** The plan's §6 forward-supersession mechanism (012 amends a slice of 009) exists *because* the cut is wrong. Two records, one decision, an elaborate cross-reference machine. Withdraw if §6 is documented as a transitional bridge with post-MVP consolidation.

**Allemang:** Keep separate. Two different vocabularies, two design centres (causality vs regulatory tagging), two expert communities.

**Hendler:** Keep separate. Two URI graphs, two governance acts. DPV shifts with regulatory weather (UK AI Act, eIDAS revisions); PROV-O backbone doesn't.

**Gandon:** Keep separate. PROV-O is a provenance graph; DPV is a governance overlay. Two canonical W3C namespaces. Combining either privileges one canonical vocabulary or mints `opda:` shadows of one.

**Guizzardi:** Keep separate, sharper reason. PROV-O models process and derivation (occurrents); DPV models regulatory-and-rights status (classification-and-policy). Different ontological commitments.

**Cagle:** Keep separate. Authoring two ODRs against the same node (an evidence entity) in one Council session is the cross-cutting-amendment-in-one-transcript mess DCAP forbids. The §6 supersession-scope mechanism is the right collapse-substitute.

**Baker:** Concurring.

**Pandit:** **Keep separate.** DPV is not a Claims annotation — it is a primary TBox concern. **Refinement: move co-annotation authoring to 0012; 0009 cites.** Authoritative listing in 0012 (one paragraph pointer in 0009). Lawful-basis / consent / purpose class vocabulary (Pandit's session-001 dissent) must live in 0012; in 0009 it gets buried under PROV-O mechanics.

**Vote: 8-1 KEEP separate.** Davis DA dissent recorded; withdrawal partial (his §6-as-transitional-bridge condition is addressed by Cagle's framing). **Pandit's refinement adopted: co-annotation authoring authority moves to ODR-0012; ODR-0009 carries a one-paragraph pointer.**

---

## Q6 — ODR-0010 vs ODR-0013: combine Overlay Profiles + SHACL Severity?

**Kendall (Queen):** **APPROVE current cut — keep separate.** Both SHACL-shaped on the surface but answer different load-bearing questions: 0010 is **mechanism** (overlay → profile graph; `opda:ValidationContext`); 0013 is **policy** (severity tiering; class ⊥ shapes ⊥ annotation graph). FIBO Production-vs-Development reasoning profiles is the analogue.

**Davis (DA):** **DISSENT — combine.** Same shapes graph, same severity scheme, same DASH. Session 001 settled both in Q5. The plan places 013 as the closing session consuming every prior ratified shape inventory — that's a clue: 013 is a synthesis, not an independent decision. Withdraw if merged post-MVP.

**Allemang:** Keep separate with mild reservation. 0013 owns base-TBox shapes; 0010 owns overlay profile shapes. Different artefacts, different authoring processes. *The `opda:ValidationContext` reification is the seam — both insist it stays load-bearing.*

**Hendler:** Keep separate. 0010's profile graphs are named, dereferenceable views with their own URI lifecycle; 0013's base shapes graph is *the* validation graph for unprofiled transactions.

**Gandon:** **COMBINE.** From the SHACL 1.2 standpoint, 0010 and 0013 are the same artefact — a shapes graph, its profile slices, severity assignments, DASH UI annotations. The no-identity-override gate, the annotation-graph split, the `ValidationContext` reification — these are *one decision* about how the shapes graph is structured.

**Guizzardi:** Keep separate. `opda:ValidationContext` reification (0010) is a Relator-class decision — what a profile *is*. Severity tiering (0013) is a regulatory-weight decision — what a violation report should look like. Two ontological commitments expressible in SHACL but distinct in their ontology.

**Cagle:** **Keep separate at the ODR level, with explicit interface contract.** Cagle's three-rule cross-cut (recorded for the plan):

| Cross-cut concern | 0010 says | 0013 says |
|---|---|---|
| `sh:in` semantics | merged at build time | applied to closed schemes |
| `sh:Violation` floor | profile cannot add a Violation not already in base | identity-contract breaches only |
| No-identity-override gate | profile cannot touch a Kind's key | identity keys are base |

If these three rules are explicit in both ODRs' `## References` cross-cite, the seam is honest. If they live in one and are silently inherited by the other, the seam leaks.

**Baker:** Keep separate.

**Pandit:** Keep separate. The DPV sensitivity gate fires from 0013, not 0010 — folding would scatter the governance severity gate.

**Vote: 7-2 KEEP separate.** Davis + Gandon dissent (different reasons — Davis on Council-theatre; Gandon on URI-graph cleanness as one shapes graph = one ODR). **Verdict: keep separate.** Cagle's three-rule interface contract adopted as cross-cite requirement (plan §4.1 routing extension).

**Methodology gap surfaced.** Gandon-vs-Guizzardi divergence on Q6 reveals a deeper question: **what does an ODR record — an *artefact-engineering* decision (Gandon) or an *ontological commitment* (Guizzardi)?** ODR-0001/DCAP have not chosen between these readings. Under Gandon's reading, 0010+0013 → one ODR. Under Guizzardi's reading, they stay two. DCAP currently reads as Guizzardi's, but the read is implicit. **This is the live methodology gap exposed by this scope-check.** Routed back to ODR-0001 amendment queue.

---

## Q7 — Missing ODRs

Three candidate gaps. Three different verdicts.

### 7a. Address & Geography

**Kendall (Queen):** **SPAWN ODR-0015 — MANDATORY.** Address is referenced by 0005, 0006, 0008 and declared by none. FIBO Places is the controlling precedent (Place / Address / Region declared in `FND/Places`, referenced from every consumer). Plan §4.1 punts Address to S006 Q5 — that's the wrong forum. Spawn ODR-0015 between 005 and 006, before 006 makes participant-address commitments.

**Davis (DA):** Withdraw-conditional. Address-in-Foundation (0004-extended) acceptable as alternative; same recognition that Address needs explicit ownership.

**Allemang:** Strong agree. ODR-0015 (Address & Geography), gated after 0005, before 0006/0008. Covers: Address class structure, INSPIRE Identifier relation, UPRN's status as a geographic identifier distinct from its Property-key role.

**Hendler:** Strong agree. Address is the *most reused* URI subject in PDTF. Routing to a module-internal 006 decision is the URI-persistence failure W3C TAG warns about. Add Geography too (geoX/geoY, INSPIRE polygons, GeoSPARQL).

**Gandon:** Mint ODR-0015 before 006/008 freeze. Settles: structured datatype vs `opda:Address` class vs external alignment; spanning leaves; GeoSPARQL deferral home.

**Guizzardi:** Deserves its own ODR. *Is `opda:Address` a Kind, a Quale, or a Mode?* The three are not equivalent — they give different answers on multi-address properties (marketing-vs-title address), and the plan doesn't name which category it sits in.

**Cagle:** Add now (Reduced Council acceptable). Consumed by 0006, 0007, 0008, 0009, 0012 — five consumers deserves its own ODR.

**Baker:** Flag as possible spawn from session-006; commit when the decision is made.

**Pandit:** Concurring; addresses are PII (UK-GDPR Art 4(1)).

**Vote: 8-1 SPAWN ODR-0015 (Address & Geography).** Baker softer (flag-not-commit). **Verdict: spawn ODR-0015. Gate after 0005, before 0006 and 0008. Reduced Council acceptable; Queen TBD (Guizzardi if UFO-category framing is decisive; Gandon if URI-architecture framing is decisive — Reduced-Council convening block resolves).**

### 7b. Generator policy

**Kendall (Queen):** FLAG; non-blocking. Generator policy is Rule 6 of ODR-0004. If implementation surfaces non-trivial decisions, spawn a follow-up. Non-blocking now.

**Davis (DA):** Withdraw-conditional. Either own record OR code-with-tests in 0004.

**Allemang, Hendler, Gandon, Guizzardi:** Fold into 0004; no new ODR.

**Cagle:** **SPAWN ODR-0016 (Generator) — yes, add now.** ODR-0004 carries the policy in two lines; the actual generator (input format, run location, version-control entry, regression tests) is a programme commitment 0004 cannot fully carry. If the generator is wrong, 935 properties are wrong.

**Baker:** Inside 0004; spawn-if-bite.

**Pandit:** (silent).

**Vote: ~6-1-1 KEEP in 0004.** Cagle the lone spawn-now. **Verdict: keep generator policy inside ODR-0004. Spawn ODR-0015b (Generator Policy) if session-004 finds it bites.** Watch session-004 Q5.

### 7c. W3C VC / DID

**Kendall (Queen):** FLAG; spawn after S012 if S009 Q8 reveals decisions. Non-blocking for Phase 1.

**Davis (DA):** **ADD a VC/DID Interop record** — more important than at least three of the currently proposed records. *"EU eIDAS 2.0 wallet, gov.uk OneLogin, W3C VCDM 2.0 are the consumers of any PDTF Trust Framework. Missing the interop record is missing the use case."*

**Allemang:** Name **ODR-0016 (W3C VC / DID alignment)** as a deferred follow-up, activated when wallet consumer or DID-method instance data lands.

**Hendler:** Strong yes, named in advance. Each binding (`cred:VerifiableCredential`, `did:web`/`did:key`, JSON-LD contexts) is a URI-graph decision deserving its own ODR.

**Gandon:** Mint ODR-0016 when 009 reaches `accepted`. Too early before then, but the question is real.

**Guizzardi:** Agree future ODR. **Appends a Truth-Maker question:** what *makes true* a Verifiable Credential? PROV-O names a derivation; the VC names a cryptographic signature; the assurance level names a regulatory judgement. Three truth-makers, one Claim — an ontology question currently inside 0009 too tightly.

**Cagle:** Defer; already routed via 0009 Q8.

**Baker:** Catalogue-admit `cred:` and `did:` in session-002 (post-retire).

**Pandit:** **SPAWN ODR-0015 (W3C VC / DID Compatibility Layer) — Phase 4.5.** *"A Trust Framework that does not cite VC/DID first-class produces an ontology wallet implementors cannot consume, defeating the Trust Framework part of Property Data Trust Framework."* Run after 0009, before 0012.

**Vote: 8-1 NAME the VC/DID work (timing varies).** Two strong spawn-now (Davis + Pandit); six "name-but-defer." Cagle the lone "no spawn at all" (already-routed). **Verdict: NAME ODR-0016 (W3C VC / DID Compatibility Layer) as deferred-named. Activation trigger: session-009 Q8 reveals genuine VC-side decisions, OR Pandit's Phase 4.5 ambition (consent receipts) lands.** Catalogue-admit `cred:` and `did:` prefixes in session-002. Truth-Maker question (Guizzardi) carried as a Q on the future ODR-0016 session.

---

## Q8 — What signals the cut is right?

Each panellist proposed signals; the panel converged on "the cut absorbs change well." Different vocabularies, same test.

**Kendall (Queen):** Three FIBO tests — *One home, one identity* (every load-bearing entity has exactly one declaring ODR — today fails for Address, fix via Q7a); *Reference, not import* (canonical URIs, no `owl:imports` — passes today); *MVP exercises every module* (today partially fails on 0007, 0008, 0012 — tighten MVP criterion OR name post-MVP modules explicitly).

**Davis (DA):** Five operational signals — BASPI5 round-trip works; second consumer joins data without asking; ODR-0003 diff stops moving; new PII field is a five-minute decision; sessions stop spawning sessions.

**Allemang:** Three *Working Ontologist* signals — each session produces a verdict writable in one sitting; a downstream consumer can name the ODR owning its question; supersession trail stays readable (≤2 layers).

**Hendler:** Three W3C-architecture signals — each ODR has a stable, dereferenceable URI set surviving supersession of other ODRs; ODR cross-references form an acyclic graph; a new consumer's query reads ≤3 ODRs.

**Gandon:** Four URI-graph signals — every minted URI resolves to exactly one ODR; open/closed-world stay in separate graphs; flat namespace stays flat; BASPI5 round-trip closes.

**Guizzardi:** Four UFO-category signals — every Endurant has an IC surviving exemplars; every Role is founded by an explicit Relator; every SKOS scheme declares its UFO meta-category; the Property class survives the Endurant-vs-Process challenge.

**Cagle:** Five operational signals — no ODR authors a constraint another ODR also authors; every shape graph builds standalone; each `## Rules` fits one Council session (~700 lines, ~12 rules); LLM-summarisation needs ≤2 cross-refs (0010 currently needs 7 — inevitable shape of overlay work); DA withdrawal condition statable in 1-2 sentences.

**Baker:** Three catalogue signals — no record cross-references another for normative authority on the same decision (Q5 fix makes green); catalogue lives in one place (Q4 retire makes green); new vocabulary admission has exactly one route.

**Pandit:** Two governance signals — PII never accretes silently (DPV tag follows the property); Trust Framework citation is honoured (Q7c spawn makes green).

**Vote: no split.** Verdict: **adopt the convergent signal set.** Six tests, in priority order, that must hold simultaneously for the cut to be ratified:

1. **BASPI5 round-trip closes** (Davis, Gandon, Kendall Test 3).
2. **Property exemplars validate** at ODR-0005's gate (Guizzardi).
3. **No ODR authors a constraint another ODR also authors** (Cagle).
4. **A new consumer's query reads ≤3 ODRs** (Hendler).
5. **ODR-0003 diff stops moving** after Phase 1 (Davis, Allemang).
6. **PII never accretes silently** — DPV tag follows the property across modules (Pandit).

Tests 1–2 are the operational gates; 3–6 are the steady-state discipline.

---

## Synthesis (Queen Kendall)

**Headline verdict on the 13-ODR cut.**

**8-1 APPROVE with named amendments.** Davis's DA position — that 13 is twice the records the work needs — does not carry, but the four classes of waste he names (duplicate authorship, cross-record amendment machinery, missing consumer-facing records, default-sequence over MVP-first) each map to a real amendment the panel adopts.

**Devil's Advocate scorecard.**

Davis dissented on 6 of 8 questions. Of those:

- **Q4 (retire 0014)**: panel agreed; **Davis aligned with majority** (a partial DA withdrawal — direction agreed, timing varies).
- **Q7a (Address)**: panel agreed Address needs explicit ownership; **Davis withdraws conditional** (his Address-in-Foundation alternative not adopted but the explicit-ownership concern is honoured).
- **Q7c (VC/DID)**: panel agreed VC/DID work must be named; **Davis withdraws conditional** (his "more important than three current records" framing not formally adopted but the named-spawn is).
- **Q1, Q3, Q5, Q6, Q8**: panel held against Davis. **Held dissents recorded in plan §9 risks**:
  - Q1: 13-ODR count vs ≤7 — held. Plan retains 13 (net 14 after spawns/retire).
  - Q3: fold 0011 into 0008 — held. 0011 stays separate.
  - Q5: combine 0009/0012 — held. Separate, with Pandit's authorship-routing refinement.
  - Q6: combine 0010/0013 — held. Separate, with Cagle's three-rule interface contract.
  - Q8: fast-path as default — held. §5.1 fast-path remains as named alternative; default sequence stands.

This is the DA functioning as designed — strong attacks, three partial withdrawals, four dissents held with the panel honestly engaging each.

**Agreed amendments to the plan.**

| # | Amendment | Justification | Affects |
|---|---|---|---|
| **A1** | **Retire ODR-0014.** Fold rows into ODR-0002's `## Rules` as `## Change log`. Mark ODR-0014 `superseded` with `## Decision Outcome` pointing at the change log. | Q4 vote 7-1-1. Hendler dissent on permanence preserved in plan §9 risks (every governance act stays — recorded but not blocking). | Plan §4 (delete Session 014 blueprint or replace with a one-paragraph note on the absorption mechanic in Session 002); plan §5 (remove S014 from Phase 0 — sequence becomes 003 → 002); plan §10 cost table (drop ~3 agent runs). |
| **A2** | **Spawn ODR-0015 (Address & Geography).** Gate after ODR-0005, before ODR-0006 and ODR-0008. Reduced Council acceptable. Queen TBD. | Q7a vote 8-1. Closes Test 1 of Q8 ("one home, one identity") — currently fails for Address. | Plan §4 (add Session blueprint for 015); plan §5 (insert as new Phase 2.6 between IC gate and Agents); plan §4.1 (remove "Address class location" from shared-question table — now owned by 015). |
| **A3** | **Name deferred ODR-0016 (W3C VC / DID Compatibility Layer).** Placeholder stub created with `status: proposed` (or `status: deferred` if DCAP admits it); activation trigger: session-009 Q8 surfaces real VC-side decisions OR Pandit's Phase-2 consent-receipt ambition lands. Catalogue-admit `cred:` (W3C VCDM 2.0) and `did:` (DID Core) prefixes in session-002. | Q7c vote 8-1. Trust Framework citation honoured (Test 6 / Pandit's signal). | Plan §4 (add Session 016 placeholder blueprint); plan §5 (Phase 7 — deferred, after 013); ODR-0002 (admit `cred:` and `did:` per Baker's catalogue note). |
| **A4** | **Move DPV co-annotation authorship to ODR-0012.** ODR-0009 carries a one-paragraph pointer. Keep the `## Supersession scope:` hook (plan §5 Phase 4) as the amendment mechanism — but the *first authoring* is in 0012, not 0009 with 0012-amends-it. | Q5 Pandit refinement (8-1 keep separate; refinement adopted). | Plan §4.1 (update "DPV co-annotation pattern" row — owner becomes 012, 009 cites); per-session blueprints for 009 and 012 (adjust input documents and questions). |
| **A5** | **ODR-0011 substrate session must declare UFO meta-category per scheme** (Quale-in-Region / Role label / Phase label / method-plan code). | Q3 Guizzardi sub-finding adopted as session-011 amendment. | Per-session blueprint for 011 (add as new question); plan §4.1 (route per-scheme UFO category as shared question with 006, 007). |
| **A6** | **Cagle's three-rule interface contract between ODR-0010 and ODR-0013.** Both ODRs' `## References` must explicitly cite: `sh:in` semantics; `sh:Violation` floor; no-identity-override gate. | Q6 verdict 7-2 keep separate; Cagle's interface-contract proposal adopted as the cross-cite requirement that operationalises the split. | Plan §4.1 (add row for the three-rule cross-cut); per-session blueprints for 010 and 013 (cite each other on the three rules). |
| **A7** | **Defer 0008 split.** Record both candidate splits (Kendall's four-way by attachment class; Cagle's leaf-vs-structured-value) as post-MVP re-cut candidates with named triggers (distinct external alignment OR clear UFO category line). | Q2 verdict 2-7 against immediate split. | Plan §11 pre-flight scope-check candidates (already names 0008 — tighten to record both candidate splits and the triggers). |
| **A8** | **Tighten MVP success criterion.** Adopt the six convergent termination signals from Q8. The default sequence's MVP gate (BASPI5 round-trip) now ALSO requires: exemplars validate; no duplicate constraint authoring; ≤3-ODR-traversal for the first non-Council consumer query; ODR-0003 diff stops moving in two consecutive sessions; PII silently-accretion test green. | Q8 convergence. Addresses Kendall Test 3 partial failure. | Plan §5 (gate clearance check); plan §10 (per-session checklist gains "Test 3 / 5 / 6 honoured" rows where applicable). |
| **A9** | **Route the Gandon-Guizzardi methodology gap to ODR-0001.** The "ODR records published artefact (Gandon) vs ODR records ontological commitment (Guizzardi)" divergence is currently implicit. ODR-0001 (Council methodology) and DCAP should name the choice. Until they do, default to the Guizzardi reading (DCAP's current implicit posture). | Q6 surfaced this gap. | New entry on ODR-0001 amendment queue (separate from this scope-check; would convene its own session). |

**Net programme shape after amendments.**

- Retire ODR-0014 (−1).
- Spawn ODR-0015 Address & Geography (+1).
- Name deferred ODR-0016 W3C VC / DID (+1, deferred).
- Total: **14 active ODRs** (15 if Phase-2 W3C VC ODR-0016 activates), down from 13 + 0014 + Phase-2-ambiguity. Net change is small in count, large in coherence.

**Downstream impact on the plan.**

The plan (`docs/plan/council-followup-sessions.md`) needs surgical edits, not a re-write:

- §4: amend Session 002 blueprint (now absorbs Session 014); delete or replace Session 014 blueprint; add Session 015 (Address) and Session 016 (VC/DID, deferred) blueprints; tighten Session 009 and Session 012 blueprints per A4; tighten Session 011 blueprint per A5; tighten Sessions 010/013 cross-cite per A6.
- §4.1: update shared-question routing per A4 (DPV co-annotation owner changes to 012), A5 (UFO meta-category per scheme), A6 (Cagle's three-rule cross-cut).
- §5: revise Phase 0 to drop S014; add Phase 2.6 (S015 Address); add Phase 7 (deferred S016 VC/DID); update dependency graph and the cost table (saving ~3 runs from S014 retire; adding ~5 from S015 Reduced + S016 Reduced).
- §9 risks: add Hendler's recorded dissent on 0014 permanence; add the Gandon-Guizzardi methodology gap.
- §11 pre-flight: tighten 0008 candidate splits + triggers per A7.

**Whether ODR-0001 needs revision.**

Indirectly, yes. The Gandon-Guizzardi divergence on Q6 reveals a methodology gap in ODR-0001 (and in DCAP): what does an ODR *record* — an artefact-engineering decision, or an ontological commitment? ODR-0001 implicitly favours the latter (DCAP's normative reading), but the choice is not explicit. **A12** routes this back to an ODR-0001 amendment queue, to be deliberated separately. Not blocking for the present scope-check.

**Whether ODR-0003 needs revision.**

Yes — ODR-0003's `## Rules` work-breakdown table (the 11 linked ODR rows) is updated per A1 (delete 0014 row), A2 (add 0015 row), A3 (add deferred 0016 row). Dependency graph updated per A2.

**Closing position.**

The 13-ODR cut is approximately right. Davis's "five-to-seven records" framing is the strongest credible challenge and it does not carry on the panel — but four of his specific moves (retire 0014, name Address, name VC/DID, tighten MVP criterion) become amendments. The plan executes the corrected cut: **14 active ODRs (15 with deferred 0016); session count drops by 1 net** (Session 014 retired; Sessions 015 + 016 added — but 016 is deferred so doesn't run in Phase 1). The corrected cut closes the Address gap, honours the Trust Framework citation, separates governance authorship cleanly (012 owns DPV), and inherits the Gandon-Guizzardi methodology question as work for ODR-0001.

The cut has earned its 14 ODRs. Run the corrected plan.

---

*Transcript compiled by Elisa Kendall (Queen), Scope-Check 1, 2026-05-26.*
*All 9 voting experts participated across 6 teammates. Devil's Advocate (Davis) attacked 6 of 8 questions; withdrew partial on Q4, Q7a, Q7c; held on Q1, Q3, Q5, Q6, Q8. Hendler dissent on 0014 permanence preserved.*
*Methodology gap (Gandon-vs-Guizzardi on Q6) surfaced and routed to ODR-0001 amendment queue.*
*Next action: apply A1–A8 to the plan; route A9 to ODR-0001 owners. Author follow-up session-002b (author-only) to record the catalogue-admission of `cred:` and `did:` prefixes if A3 activates.*
