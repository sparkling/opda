# Kendall — Solo (FIBO) position on S007

## Stance summary

Davis is DA this session, so the enterprise-pair shrinks to me alone. My load is **DEPTH on Q4 (chain modelling via FIBO Arrangement patterns)** and **DEPTH on Q1 (Transaction-as-Relator framing under FIBO precedent)**, with Q5/Q6/Q7 brief concurrences and Q2/Q3 conceded to the formal-pair (Gandon-Guizzardi) and to S011 §8a respectively.

The FIBO precedent carries cleanly: `fibo-fnd-arr-arr:Arrangement` is the canonical relational-endurant construct for financial / legal contexts (entities whose existence depends on the parties they bind); `fibo-fbc-fct-fse:FinancialTransaction` is a sibling pattern (financial transactions modelled as relational endurants linking counterparties via roles). OPDA's `opda:Transaction` inherits this framing — UFO Relator at the meta-category layer; FIBO Arrangement at the precedent-citation layer. The two compose: Guizzardi 2005 Ch. 7 §Relator supplies the meta-category, FIBO supplies the load-bearing financial-domain instantiation, and the ODR-0006 §Decision RoleMixin-founded-by-Transaction commitment ratified at S006 is the upstream consumer.

For Q4 my position is the substantive depth call: **BOTH chain modelling mechanisms — Aggregate (`opda:TransactionChain`) AND dependency-predicate (`opda:dependsOnTransaction`).** FIBO `Arrangement` provides the precedent for both directions: deal-bundle Aggregate via `fibo-fnd-rel-rel:isMemberOf` (chain-level reasoning over the bundle), and inter-Arrangement dependency-predicate (transaction-level traversal across the directed-acyclic dependency graph). Davis as DA will press parsimony — "fewer URIs; one mechanism not both" — and I read that as the wrong instinct on a consumer-query case. The consumer needs both abstractions; the FIBO precedent already settled this in the financial-derivatives chain domain; OPDA inherits.

## Per-question positions

### Q1 — Transaction as financial/legal Relator (DEPTH)

**AGREE — Transaction-as-Relator per ODR-0007 §Decision.** The FIBO precedent is exact: `fibo-fnd-arr-arr:Arrangement` (FIBO Foundations §Arrangement) is the canonical relational-endurant construct in financial / legal contexts. An Arrangement is an entity whose existence depends on the parties it binds (a contract, a deal, a financial transaction, a legal grant); its identity criterion is the (parties, terms, founding-event) tuple; it has no independent identity beyond the parties it mediates. This is precisely UFO's Relator construct (Guizzardi 2005 Ch. 7) instantiated for the financial / legal domain.

`fibo-fbc-fct-fse:FinancialTransaction` is the sibling pattern that matters here: FIBO commits FinancialTransaction as a sub-Arrangement that links counterparties (buyer + seller; lender + borrower; party + counter-party) via roles played by `LegalPerson` or `NaturalPerson` (which compose with ODR-0006's Person/Organisation Kind layer). The roles are RoleMixins per FIBO Ch. 13 (Allemang & Hendler 2020 *Working Ontologist* 3rd ed.); the FinancialTransaction is the relational endurant that founds them. OPDA's `opda:Transaction` inherits this directly:

- **Relational endurant** (UFO Relator) — `opda:Transaction` is not an event or activity; it persists across the marketing-to-completion window as an enduring relation between Seller, Buyer, LegalEstate and the bundle of evidence/claims that compose it.
- **Founds the RoleMixins** — `opda:Seller`, `opda:Buyer` as ratified at S006 §Decision are RoleMixins; their `ufo:foundedBy opda:Transaction` triple per the §Turtle stubs S006 carries is the FIBO Arrangement-founds-PartyInRole pattern.
- **IC over (parties, property/title, founding-event)** — the Transaction's identity is the tuple of (Seller-role, Buyer-role, LegalEstate, Transaction-instantiation-event). Two transactions are the same iff their tuples are equal; this is the FIBO Arrangement IC pattern S005 Q4 ratified for `opda:Property` (UPRN multi-identifier set) generalised to relational endurants.

**Lifecycle-event-on-Relator vs Activity distinction.** Crucial point Davis will likely press: a milestone (`offer-accepted`, `exchange`, `completion`) is a `prov:Activity` REIFYING a lifecycle event ON the Relator — NOT the Relator itself. The Transaction Relator persists across these events; the events transition the Relator through Phases (per S011 §8a). The lease-extension-transaction.ttl exemplar instantiates this exactly: the extension `prov:Activity` is a lifecycle event applied to an existing leasehold LegalEstate; the Transaction Relator persists; the LegalEstate's lease-term interval is revised (`prov:wasDerivedFrom`); the RegisteredTitle records the registry-event. FIBO models this with `fibo-fnd-dt-oc:DatedTransition` events on Arrangements; OPDA inherits via PROV-O `prov:Activity` reification (per ODR-0009).

**Engagement with Davis DA.** Davis will likely press a publish-first test: "show me a SPARQL query that fails under datatype-property Transaction (the schema shape) but passes under Relator-Transaction." The query is: *find all RoleMixins whose `ufo:foundedBy` traces to a Transaction whose milestones include `exchange` but not `completion` (i.e. transactions stuck post-exchange).* Under the schema shape (`opda:Transaction` with `status`/`milestone` datatype properties only), the founding citation has nowhere to attach — RoleMixins are unfounded; the S006 Decision's `ufo:foundedBy opda:Transaction` triple has no Relator to point at. Under the Relator framing, the query traverses RoleMixin → foundedBy → Transaction → Milestone-Activity → Phase. This is FIBO Ch. 13's exact pattern; the foundation citation is load-bearing.

**Vote: AGREE — Transaction-as-Relator per ODR-0007 §Decision, FIBO `Arrangement` + `FinancialTransaction` precedent. IC over (parties, property/title, founding-event) tuple. Lifecycle events as `prov:Activity` reifications on the persistent Relator; Phase transitions per S011 §8a.**

### Q4 — Chain modelling via FIBO patterns (DEPTH — load-bearing position)

**AGREE BOTH MECHANISMS — `opda:TransactionChain` Aggregate (FIBO Arrangement-membership pattern) AND `opda:dependsOnTransaction` dependency-predicate (FIBO inter-Arrangement dependency pattern).** This is the substantive depth call for the session.

**FIBO precedent for chain modelling.** A financial-deal chain is modelled in FIBO as a network of related Arrangements. Two complementary mechanisms compose:

1. **Aggregate** — the chain itself is an Arrangement (FIBO `fibo-fnd-arr-arr:Arrangement` instantiated as a deal-bundle). Member transactions are linked via `fibo-fnd-rel-rel:isMemberOf` to the parent Aggregate. The Aggregate carries chain-level metadata (chain status, chain length, terminus type — cash buyer / chain-break). FIBO Securities Issuance (FIBO-SEC) uses this for multi-tranche bond issuance; FIBO Derivatives (FIBO-DER) uses it for multi-leg derivative chains.
2. **Dependency predicate** — direct `fibo-fnd-rel-rel:hasPredecessor` / `hasSuccessor` predicates (or domain-specific specialisations like `fibo-be-le-lei:hasPredecessorLEI`) between Arrangement instances. These are graph edges in the directed-acyclic chain; SPARQL traversal walks them.

The two mechanisms are NOT alternatives; they are complementary abstractions over the same data. FIBO instantiates both because consumer queries need both layers:

- **Aggregate-level queries** — "is the chain stable?", "what is the chain length?", "which transaction is the chain terminus?" The Aggregate is the right URI to dereference; the metadata lives on it.
- **Transaction-level traversal** — "which transactions does T_B depend on transitively?", "if T_C blocks, which upstream transactions cascade?" The predicate edges are the right graph structure; SPARQL property-paths (`opda:dependsOnTransaction+`) walk them.

The chain-of-transactions.ttl exemplar already commits both: `opda-x:chain a opda:TransactionChain` with `opda:chainMembers` (the Aggregate) AND `opda-x:transaction-b opda:dependsOnTransaction opda-x:transaction-a` (the predicate). The exemplar is the proof-by-construction.

**Engagement with Davis DA's parsimony argument.** Davis as DA will likely press: *fewer URIs; one mechanism not both; the Aggregate URI is redundant if the predicate edges fully reconstruct the chain.* My position is that this parsimony reasoning loses against the consumer-query case:

- The Aggregate URI is the dereferenceable handle for chain-level metadata. Without it, chain-status, chain-length, chain-terminus-type have no home — they would have to be inferred from a graph-traversal closure, which is operationally fragile (what counts as "the chain" if a member transaction is cancelled mid-flight?).
- The predicate edges alone are insufficient for the chain-stability consumer query. *"Is this chain stable?"* requires reading a chain-level status, not traversing every member. The conveyancing pipeline reads chain-status to decide whether to advance T_B's milestones; without the Aggregate, the read becomes a multi-hop traversal.
- The FIBO precedent already settled this argument: FIBO commits both because financial-derivatives chains need both abstractions in production. OPDA-derivative reasoning: if FIBO needs both, OPDA needs both — the structural similarity is exact (directed-acyclic dependency graph with chain-level aggregate metadata).

**The "third entity with its own lifecycle" framing carries.** Hendler's S005 Q5 framing — RegisteredTitle as the third entity with its own lifecycle distinct from Property and LegalEstate — applies here mutatis mutandis: TransactionChain is a fourth entity with its own lifecycle distinct from the member Transactions. The chain persists across member-transaction completion; it dissolves when the terminus completes (cash-buyer) or breaks (chain-break event); its lifecycle is governable independently. Davis's BBC `/programmes/` precedent for the publish-first test (Episode-vs-Brand-vs-Series distinct lifecycles at the BBC) maps directly — the chain is the Series-level abstraction, the Transactions are the Episodes.

**Cascading-event consumer case (chain-of-transactions.ttl scopeNote).** The exemplar's Q3 lifecycle-event scenario: a milestone-not-met on T_C cascades up via `opda:dependedOnBy` (the inverse predicate) to T_B and T_A — the linked transactions go on hold. This consumer query is exactly the chain-stability-cascade case that needs BOTH mechanisms: the predicate edges drive the cascade traversal (which transactions are affected?); the Aggregate carries the chain-level "on-hold" status that downstream conveyancing UIs render. Single-mechanism modelling fails this consumer case.

**Vote: AGREE BOTH — `opda:TransactionChain` as Aggregate (FIBO `Arrangement` pattern with `opda:chainMembers` via `isMemberOf`-analogue); `opda:dependsOnTransaction` as inter-Transaction dependency-predicate (FIBO inter-Arrangement dependency pattern). Both modelled; both load-bearing; chain-of-transactions.ttl exemplar discharges. Davis DA parsimony argument loses against the consumer-query case for chain-level reasoning.**

### Q2 — Instants vs intervals (BRIEF — concede to formal-pair Gandon-Guizzardi)

**CONCEDE to Gandon-Guizzardi formal-pair as the OWL-Time DEPTH carriers.** The Q2 hybrid (instants for milestones via `prov:atTime`; intervals for lease-terms / marketing-to-completion windows / lastDemandPeriod via OWL-Time `time:ProperInterval`) is correctly drafted in ODR-0007 §Rules and discharges the S001 Q2 Allemang/Davis dissent (proprietorship/lease intervals were unmodelled under instants-only; the hybrid resolves the incoherence). FIBO does not have a strong opinion on the instants-vs-intervals split — FIBO uses `time:Instant` for transaction-event timestamps and is silent on lifecycle intervals; OWL-Time is the right additional vocabulary.

The simple-transaction-with-milestones.ttl exemplar discharges the instants case (five milestones as `prov:Activity` with `prov:atTime`); the lease-extension-transaction.ttl exemplar discharges the interval case (lease term as `time:ProperInterval` with `time:hasBeginning` + `time:hasDurationDescription`).

**Vote: AGREE hybrid (instants + intervals) per ODR-0007 §Decision and §Rules. Formal-pair owns the depth.**

### Q3 — Phase modelling (BRIEF — conceded to S011 §8a)

**CONCEDED.** Q3 was settled by S011 §8a Phase label scheme (per the per-scheme typed-output table — "Labels for intra-Kind phases a Substance Kind passes through"). `opda:Transaction` status (`proposed | active | exchanged | completed | abandoned`) is a Phase scheme; `participantStatus` (`Proposed | Invited | Active | Removed`) is a Phase scheme; `legalForms` completion-state is a Phase scheme. Phase transitions are `prov:Activity` reifications per S011 §5a discipline (ODR-0009 owns the PROV-O reification pattern).

ODR-0007 §Rules already commits this ("milestones and `participantStatus` as anti-rigid Phases backed by SKOS schemes (ODR-0011)"); S007 inherits without re-deciding.

**Vote: CONCEDED — settled by S011 §8a; ODR-0007 consumes the Phase label scheme via ODR-0011 reference.**

### Q5 — Lease term as OWL-Time interval

**AGREE — FIBO `Tenure` precedent applies; lease term modelled as `time:ProperInterval` with `time:hasBeginning` + `time:hasDurationDescription`.** FIBO `fibo-be-le-cl:CommercialLease` (FIBO Business Entities — Leases module) models commercial-lease tenure as a Time interval; the residential-lease analogue OPDA needs is structurally identical. OWL-Time supplies the interval vocabulary (`time:Interval` with `time:hasBeginning` + `time:hasEnd`, or `time:Interval` with `time:hasBeginning` + `time:hasDurationDescription` for derived-end).

The lease-extension-transaction.ttl exemplar discharges this: the original 99-year lease and the post-extension 189-year lease are two `time:ProperInterval` instances; the extension Activity carries `prov:wasDerivedFrom` from the original to the extended (per S005 §3b Rule 1 estate-transfer precedent applied to lease-term intervals — the LegalEstate persists, the lease-term interval is revised via PROV-O lineage).

**Vote: AGREE — `time:ProperInterval` with `time:hasBeginning` + `time:hasDurationDescription`. FIBO `Tenure` precedent. Lease-term revision via `prov:wasDerivedFrom`.**

### Q6 — Expected-vs-actual milestone times

**AGREE — planned-Schedule has `opda:plannedAtTime`; occurred-Activity has `prov:atTime`. Concur Moreau's S001 Plan-vs-Activity flavour of PROV-O.** FIBO uses a Schedule pattern for expected dates (`fibo-fnd-dt-oc:DatedSchedule`) and a separate Activity timestamp for occurred events; the two are linked via `prov:wasGeneratedBy` (the Plan generates the Schedule; the Activity reifies the executed event). OPDA's `opda:plannedAtTime` on the Milestone Plan + `prov:atTime` on the executed Milestone Activity is the same pattern.

The simple-transaction-with-milestones.ttl exemplar discharges this directly: four of the five milestones carry both `prov:atTime` (the actual completion time) and `opda:plannedAtTime` (the original planned date); the divergence between them is the expected-vs-actual signal that downstream conveyancing UIs surface (e.g. "registration ran 35 days late against plan").

**Vote: AGREE — `opda:plannedAtTime` on Plan; `prov:atTime` on executed Activity; divergence is queryable. Concurs S001 Moreau Plan-vs-Activity PROV-O flavour.**

### Q7 — OWL-Time scope (Core + Duration; defer Calendar)

**AGREE — adopt OWL-Time Core (intervals, instants, before/during/after) + Duration (year/month/day duration descriptions); DEFER Calendar (named calendar systems, week structures, Gregorian-specific reasoning).** The lease-term and lifecycle-interval cases all need Duration vocabulary (`time:DurationDescription` with `time:years`); none need Calendar specifics for the BASPI5 round-trip. The deferral matches the ODR-0002 Conditional adoption discipline — adopt only what's needed; defer the rest until a consumer query demands it.

FIBO uses OWL-Time Core + Duration without Calendar in its Time Pattern annex; OPDA inherits the same scope discipline. If a Phase-3.5 audit session surfaces a Calendar-specific consumer (e.g. UK statutory bank-holiday rules driving completion-date computation), Calendar is admitted at that point via a follow-up amendment.

**Vote: AGREE — OWL-Time Core + Duration; DEFER Calendar. ODR-0014 vocabulary catalogue records the Conditional scope.**

## Engagement with Davis DA on chain-modelling parsimony (Q4)

Davis as DA will press the publish-first test on Q4 — *"show me the SPARQL query that fails under one mechanism but passes under both."* My response is structured:

**The single-Aggregate-no-predicate alternative fails the cascade-traversal query.** Without `opda:dependsOnTransaction` edges, the cascade query *"if T_C blocks, which upstream transactions cascade?"* becomes a multi-hop join over Aggregate membership filtered by chain position — operationally fragile and not SPARQL-property-path-friendly. The predicate edges are SPARQL-property-path-traversable (`?upstream opda:dependsOnTransaction+ ?blocked`); the Aggregate-only form needs procedural composition.

**The single-predicate-no-Aggregate alternative fails the chain-stability-status query.** Without `opda:TransactionChain`, the query *"is this chain stable?"* has no Aggregate URI to dereference — chain-status must be recomputed from member-transaction status via aggregation, which is non-monotonic (a member completes → does the chain status change? aggregate-without-handle has no place to record the answer).

**FIBO settled this in production for financial-derivatives chains.** Multi-leg derivative chains use both abstractions because consumer queries (margin-call computation; cascade-default analysis) need both. The structural parallel to property chains is exact — directed-acyclic dependency graph + chain-level aggregate metadata + cascade events.

**Davis's parsimony instinct is right at the URI-minting layer, wrong at the abstraction-layering layer.** Fewer URIs is good when URIs are decorative; not good when they're load-bearing handles for distinct consumer queries. The Aggregate URI is the handle for chain-level reasoning; the predicate edges are the handles for transaction-level traversal; they're distinct abstractions with distinct consumers.

**Conditional concession.** If Davis names a specific consumer (e.g. *"the BASPI5 round-trip exercises only the predicate edges, never the Aggregate URI"*), I'd downgrade the Aggregate from "load-bearing" to "operationally-elective" — but the chain-of-transactions.ttl exemplar's chain-status field is the counterexample (chain-status has nowhere to attach without the Aggregate). The exemplar is the proof.

## Replies to anticipated objections

- **Davis DA may attack Q1 Transaction-as-Relator as gold-plating** ("the schema shape with datatype properties on `opda:Transaction` would round-trip BASPI5 fine"). Reply: round-trip is not the test of an ontology; the test is whether the RoleMixin founding citation (S006 §Decision `ufo:foundedBy opda:Transaction`) has somewhere to attach. Under the schema shape it doesn't — RoleMixins are unfounded; the S006 commitment becomes vacuous. The Relator framing is forced by the upstream commitment; reversing it requires unwinding S006 Q2, which is not on this session's agenda.

- **Gandon-Guizzardi formal-pair may push deeper on Q1 Relator IC** (e.g. *"is the Transaction's IC the (parties, property, founding-event) tuple, or only the founding-event?"*). Reply: I yield the IC depth to the formal-pair; my FIBO position is that the (parties, property, founding-event) tuple is the FIBO Arrangement IC pattern, which is the right starting point. The formal-pair owns the per-kind A9 (b) discipline discharge for `opda:Transaction` over named hard cases (transaction-abandonment, transaction-restart with new buyer, gazumping mid-marketing).

- **Cagle may press a SHACL-AF rule for chain-cascade materialisation** (a sixth citing site of ODR-0017). Reply: the cascade-status materialisation is a strong candidate — when a downstream transaction blocks, the SHACL-AF rule materialises `chain-blocked` status on the Aggregate at `sh:Info` severity. This is methodology-consistent with the S005 §6a / S011 §5a / S015 §4a / S006 (Org-merger) pattern. I'd support Cagle's depth here without contesting.

- **Davis DA may press parsimony on the OWL-Time adoption** (carryover of the S001 Allemang/Davis dissent). Reply: the lease-extension exemplar and the chain exemplar both surface interval-valued facts that instants-only modelling cannot represent. The lifecycle-interval consumer materialised at S007 (lease-term revision via `prov:wasDerivedFrom`); the S001 Conditional adoption discipline's "consumer materialised" criterion is satisfied; OWL-Time exits Conditional status at S007.

## Solo votes (structured per ODR-0001 §Two-artefact discipline)

| Question | Kendall (solo, FIBO) | Engagement |
|---|---|---|
| Q1 — Transaction as financial/legal Relator | **AGREE** — FIBO `Arrangement` + `FinancialTransaction` precedent; UFO Relator at meta-category; IC = (parties, property/title, founding-event) tuple | DEPTH |
| Q2 — Instants vs intervals | **AGREE** hybrid (instants for milestones; intervals for lifecycle/lease-term) | brief; formal-pair owns |
| Q3 — Phase modelling | **CONCEDED** — settled by S011 §8a Phase label scheme | brief |
| Q4 — Chain modelling | **AGREE BOTH** — `opda:TransactionChain` Aggregate + `opda:dependsOnTransaction` predicate; FIBO precedent for both; chain-of-transactions.ttl exemplar discharges | DEPTH (engaging Davis DA) |
| Q5 — Lease term | **AGREE** — `time:ProperInterval` with `time:hasBeginning` + `time:hasDurationDescription`; FIBO `Tenure` precedent | concur |
| Q6 — Expected-vs-actual | **AGREE** — `opda:plannedAtTime` on Plan + `prov:atTime` on Activity; concurs Moreau S001 Plan-vs-Activity PROV-O flavour | concur |
| Q7 — OWL-Time scope | **AGREE** — Core + Duration; DEFER Calendar | concur |

**Solo summary verdict.** Seven AGREE (five outright, two depth-positioned with Q1/Q4 as load-bearing FIBO precedent discharge); one CONCEDED (Q3 to S011 §8a). All three S007 exemplars (simple-transaction-with-milestones.ttl, chain-of-transactions.ttl, lease-extension-transaction.ttl) pass under the adopted Transaction-Relator + Chain-both-mechanisms + OWL-Time-hybrid framing. Davis DA parsimony engagement recorded on Q4; held-as-live re-open trigger noted (if BASPI5 round-trip exercises only the predicate edges and the Aggregate URI is never dereferenced in 18 months of production use, downgrade the Aggregate from load-bearing to operationally-elective). Q1's Relator framing is forced by the upstream S006 §Decision RoleMixin commitment; reversing it requires reopening S006 Q2, which is out of scope for this session.

**Re-open triggers recorded.** Q4 Aggregate-dereferenceability trigger: if Phase-3.5 module sessions surface zero queries that dereference `opda:TransactionChain` URIs directly (i.e. the consumer-side always traverses from member Transactions), the Aggregate downgrades to in-memory join structure. Q1 Relator IC trigger: if a Phase-3.5 session surfaces a Transaction hard case that the (parties, property/title, founding-event) tuple does not cover (e.g. transaction-by-tender; multi-property-bundle transactions), the IC's tuple composition re-opens for amendment.
