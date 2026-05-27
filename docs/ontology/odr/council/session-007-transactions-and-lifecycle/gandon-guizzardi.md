# Gandon + Guizzardi — formal-pair on S007

*Joint pair voice. **Guizzardi is Queen** for this session per plan §S007 ("Queen: Giancarlo Guizzardi (Transaction-as-Relator authority); DA: Ernie Davis"). The pair writes Guizzardi-led on UFO-load-bearing questions (Q1 Transaction-as-Relator vs Event, Q3 Phase confirmation, Q4 recursive Relator + Aggregate, Q6 expected-vs-actual PROV-O flavour) and Gandon-led on the W3C/artefact questions (Q2 instants-vs-intervals reconciliation, Q5 OWL-Time lease term, Q7 OWL-Time profile scope). The pair is joint throughout — this session is the fifth `kind: pattern` ODR to discharge under A9 §Per-kind discipline (b), and the first to commit OWL-Time machinery substantively to the corpus per the S002 Conditional adoption. The methodology pressure: ODR-0007 inherits the 3-class crux from ODR-0005, the RoleMixin/Role discipline from ODR-0006, the Phase label scheme from ODR-0011 §8a, and the SHACL-AF rule pattern from ODR-0017. The work is to compose, not to invent.*

## Stance summary

ODR-0007 is `kind: pattern` (the fifth `kind: pattern` ODR after ODR-0005, ODR-0015, ODR-0011, ODR-0006). The stub is well-developed: §Decision commits to **Transaction-as-Relator + Phases + OWL-Time Conditional intervals**; §Rules names `opda:Transaction` as the UFO Relator founding ODR-0006's Seller/Buyer RoleMixins, `opda:Chain` as a relation between Transactions, milestones and `participantStatus` as anti-rigid Phases, OWL-Time intervals for lifecycle/tenure facts, and `prov:atTime` retained for genuine instants. Freeze gates: ODR-0005 cleared (S005 ratified 2026-05-27); single-scheme-vs-per-role status (deferred to follow-up).

What S007 must add to clear A9 §Per-kind discipline (b): (a) UFO/DOLCE meta-category commitments for `opda:Transaction` (Relator), `opda:Milestone` (Activity / `prov:Activity`), `opda:LeaseTerm` (Quality Region — OWL-Time interval), `opda:TransactionChain` (Aggregate per Evans+Vernon S006 framing); (b) IC over named hard cases for the Transaction Relator (Relator identity under chain recursion, lease-extension, lifecycle phase transitions); (c) artefact realisation via SHACL shapes + OWL-Time interval well-formedness + (the **sixth+ citing site** of ODR-0017's SHACL-AF pattern — succession of historical lease-term intervals). The three exemplars (simple-transaction-with-milestones, chain-of-transactions, lease-extension-transaction) are the gate test; the chain exemplar in particular exercises Q4's dual-mechanism modelling which the Council must ratify or collapse.

The depth questions we own: Q1 (Transaction-as-Relator vs Event — Guizzardi-led; stub-committed; pressure-tested against chain recursion); Q2 (milestones-as-instants + intervals-as-intervals — Gandon-led W3C reconciliation); Q3 (Phase label confirmation — settled by ODR-0011 §8a; brief); Q4 (chain modelling — Guizzardi-led; canonical recursive Relator + first-class TransactionChain Aggregate); Q5 (lease term — Gandon-led; `time:ProperInterval` + `time:hasDurationDescription`); Q6 (expected-vs-actual — Guizzardi-led; PROV-O planned-vs-occurred flavour); Q7 (OWL-Time profile scope — Gandon-led; Conditional admission). The methodology pressure-test: this is the **first session where multiple OWL-Time terms enter the operational corpus** at scale (S002 Q7 Conditional admission was carry, not concrete authoring). Q7 commits the profile slice.

What is at stake if S007 settles wrong: ODR-0007 binds together every transaction-bearing layer downstream (ODR-0008 descriptive attributes inheriting lifecycle context; ODR-0009 PROV-O claims attached to milestones; ODR-0012 DPV PII tags on participant lifecycle events; ODR-0013 SHACL shapes for interval well-formedness). If the Transaction-as-Relator framing collapses under chain recursion, RoleMixins from ODR-0006 are unfounded; if OWL-Time profile creep happens, the Conditional discipline (S002 Q7) fails its first concrete test; if expected-vs-actual is conflated, every regulatory audit query for milestone-slippage analysis breaks. The Davis DA "publish-first / minimal modelling" pressure is real and well-targeted (see DA anticipation below).

## Per-question positions

### Q1 — Transaction-as-Relator vs Transaction-as-Event

**Guizzardi (lead, Queen).** **FOR Transaction-as-Relator** — stub-committed; canonical UFO 2005 Ch. 4 + UFO 2015 framing. The pressure-test from the chain-of-transactions exemplar does not refute the Relator framing — it requires recursive Relator modelling (Q4), which is admissible under UFO without category change.

**The Relator framing.** Per Guizzardi 2005 Ch. 4 §Relator: a Relator is a truthmaker for a material relation among multiple entities; itself an individual with its own identity; mediates Role instances; the Roles borrow identity from their bearers. A `opda:Transaction` is the truthmaker for the conveyancing material relation among (LegalEstate, Seller-set, Buyer-set, transaction-id-lineage). It is **NOT** a `prov:Activity` (Event-in-time) because:

- A Transaction *persists* across the lifecycle window from instruction to registration (months; sometimes years for chains). An Event is temporally bounded *as an entity* — it has a temporal extent and ceases to exist outside it. A Transaction *has* a temporal lifecycle but it *is* a relational endurant, not a perdurant. (Per Masolo et al. 2003 D18 §4.5 — Perdurant vs Endurant.)
- A Transaction founds RoleMixins (ODR-0006). Per UFO, only Relators found RoleMixins (Events / Activities do not). If `opda:Transaction` were an Activity, the ODR-0006 Seller/Buyer RoleMixins would be unfounded — re-creating the schema's original defect.
- A Transaction's *milestones* are the Activities (Events). The Relator hosts the milestones; the milestones are reified `prov:Activity` instances per the simple-transaction-with-milestones exemplar. The distinction is sharp.

**The Relator IC.** Per A9 §Per-kind discipline (b), the IC over named hard cases:

IC = **(LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage) tuple persistence under PROV-O succession over chain/lifecycle changes.**

Five hard cases (matching the structure used in ODR-0005 §3a/3b/3c — five rules per IC):

1. **Participant addition.** A new participant joins the Transaction (additional buyer; co-purchaser added late) → same Relator (same Estate, Buyers-set extended; the Set is the persistent identity element, not its elements). Recorded via `prov:wasRevisionOf` on the Relator's `participants[]` lineage.
2. **Participant withdrawal.** A buyer withdraws (failed mortgage; cold feet) → same Relator if the transaction continues with a replacement buyer; new Relator if the transaction fails and a new transaction starts. The S011 §8a Phase label `participantStatus` carries the per-participant lifecycle; the Relator persists through participant turnover so long as the conveyance continues against the same Estate.
3. **Chain dependency change.** A chain link breaks (T_B's dependent T_A collapses) → the dependent Relator (T_B) survives but enters a `held` Phase; the Relator does not cease. Recovery: T_B re-binds to a new T_A (new dependency); Relator persists; the dependency edge is on the Aggregate (Q4), not on the Relator's identity.
4. **Lease extension.** An existing leasehold's term is extended (lease-extension-transaction exemplar) → a NEW Relator for the extension Transaction; the underlying LegalEstate persists per ODR-0005 §3b Rule 1. The extension Transaction is a SECOND Transaction over the same Estate; it is `prov:wasInformedBy` the original purchase Transaction.
5. **Transaction cancellation.** A Transaction is withdrawn (sale falls through pre-exchange; either party walks) → Relator ceases; `prov:wasInvalidatedBy` a `opda:TransactionCancellationEvent`. The LegalEstate persists; the RoleMixins (Seller/Buyer borne in this Transaction) cease per their RoleMixin anti-rigidity.

**Authoritative source for the Transaction IC** (cited via `dct:source` per ODR-0004 §7a): UK Law Society *Conveyancing Quality Scheme — Core Practice Management Standards* (transaction lifecycle and identity discipline); HMLR *Practice Guide 21 — Registration of dispositions of registered land* (transaction-as-disposition discipline); Searle 1995 *The Construction of Social Reality* (transaction-as-social-object).

**Why not Event/Activity.** A single-class collapse to `prov:Activity` would force the entire conveyancing lifecycle into one Activity reification — losing the Relator's role-founding property + flattening milestone-as-sub-Activity into milestone-as-temporal-segment. The Allemang carry from S006 Q3 (RDF reification minimisation) does not apply here: the Relator is **not** an RDF reification; it is a UFO truthmaker with its own identity. The reification minimisation concern targets RDF statement-about-statement reification, not UFO Relator individuals.

**Gandon.** Concur. W3C-side grounding:

- **The Transaction Relator's URI** is `opda:Transaction` (CamelCase Sortal-equivalent — Relators are individuals with their own URIs per ODR-0006 §Proprietorship Relator precedent).
- **Cross-link to `prov:Agent`** (per ODR-0006 Kind layer): a Transaction `prov:wasAssociatedWith` each participant's bearer (Person/Organisation) qua Agent in the PROV-O backbone. The Relator-vs-Activity distinction is preserved: the Relator hosts the participants; the milestones (Activities) carry the `prov:wasAssociatedWith` triples to the participants.
- **PROV-O succession for Relator lifecycle**: the five hard cases above each map to a `prov:Activity` reification. This is the same discipline as ODR-0006 Q3 Proprietorship Relator succession; ODR-0007 cites `implements: [ODR-0017]` and re-instantiates the §1a template (sixth+ citing site).

**Pair vote on Q1.**

- **Guizzardi (Queen) vote: FOR Transaction-as-Relator + (LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage) IC + PROV-O succession over five hard cases + role-founding intact + chain recursion handled at Q4 without category change.**
- **Gandon vote: FOR same** — Relator URI in `opda:` hash namespace; PROV-O backbone cross-link via `prov:wasAssociatedWith` on milestone Activities; ODR-0017 SHACL-AF pattern citing site.

### Q2 — Milestones: instants vs intervals

**Gandon (lead).** **FOR hybrid — instants as `prov:atTime` on reified `prov:Activity` Milestones; intervals as OWL-Time `time:ProperInterval` for tenure/marketing/listing.** The W3C-side reconciliation of session-001's Q2 framing (PROV-O `prov:atTime` instants; reversed ≈6-3 to admit OWL-Time intervals).

**The hybrid pattern.** Per the simple-transaction-with-milestones exemplar:

- **Each milestone is a `prov:Activity` reification** with `prov:atTime` carrying the *occurred* instant (xsd:dateTime). Five canonical milestones per the exemplar: instruction, offerAccepted, exchange, completion, registration. Each is a sub-Activity within the Transaction's lifecycle scope.
- **The Transaction-level lifecycle interval** (marketing window from listing to completion; tenure interval; lease term) is modelled as a `time:ProperInterval` with `time:hasBeginning` / `time:hasEnd` (closed intervals) or `time:hasBeginning` + `time:hasDurationDescription` (open intervals — see Q5 for lease term).

**Why both, not one or the other.** The S001 Q2 reversal (≈6-3 FOR OWL-Time over instants-only) settled this in principle; ODR-0007 settles it operationally. PROV-O's `prov:atTime` is well-defined for instants but PROV-O *deliberately* lacks interval vocabulary (Moreau & Missier 2013 §1 — PROV-O is "minimal"; interval-bearing entities are out of scope per design). OWL-Time provides the interval machinery; PROV-O provides the instant + the Activity-reification backbone. They are complementary, not competing.

**Operational placement.** Per ODR-0004 §3a three-graph separation:

- **`prov:atTime` instants** sit on `prov:Activity` reifications in the data graph (e.g. `opda-instances.ttl` for instance data; per-Transaction graphs for partitioned data).
- **`time:ProperInterval` intervals** sit on the bearer (LegalEstate carrying its tenure interval; lease carrying its lease term; Transaction carrying its marketing-window interval) in the same data graph.
- **SHACL shapes** for interval well-formedness (ODR-0013 territory) sit in `opda-shapes.ttl`.

**Guizzardi.** Concur. UFO grounding:

- **A milestone Activity is a UFO Perdurant** (Event/Activity) per Masolo et al. 2003 D18 §4.5 — temporal extent IS the milestone's identity. `prov:atTime` is the canonical Perdurant timestamp.
- **A tenure/marketing/listing interval is a UFO Quality Region** per ODR-0011 §8a — the interval IS the quality region in temporal space the Substance Kind (LegalEstate / Transaction) is qualified by. `time:ProperInterval` is the canonical Quality Region in temporal space.
- The UFO seven-category framework (Quale-in-Region vs Quality Region) operates naturally on temporal quale: a specific date is a Quale-in-Region (a point in the temporal region); an interval is a Quality Region. Q2 is the temporal-Quale parallel of the Q8 Quale-in-Region/Quality-Region distinction.

**Pair vote on Q2.**

- **Gandon (lead) vote: FOR hybrid — milestones as `prov:Activity` with `prov:atTime` instants; tenure/marketing/listing/lease-term as OWL-Time `time:ProperInterval`. Both coexist; placement per ODR-0004 §3a; SHACL well-formedness per ODR-0013.**
- **Guizzardi (Queen) vote: FOR same** — Perdurant timestamps via `prov:atTime`; Quality Region intervals via `time:ProperInterval`; the seven-category framework operates naturally on temporal Quale.

### Q3 — Status as Phase

**Guizzardi (Queen, lead).** **SETTLED by ODR-0011 §8a + ODR-0006 Q7.** Brief confirmation only — `participantStatus` is classified as Phase label in the seven-category UFO framework (S011 Q8 4-0 typed-output verdict 2026-05-27); S006 Q7 confirmed the operationalisation; S007 inherits.

**The Phase framing operationalises here for the Transaction-level status AND the participant-level status.** Two SKOS schemes (per ODR-0011 §1a):

- **`opda:transactionStatusScheme`** — Phase labels for the Transaction Relator (e.g. "instructed", "marketing", "underOffer", "exchanged", "completed", "registered", "cancelled", "held"). The simple-transaction-with-milestones exemplar uses "completed"; the chain-of-transactions exemplar uses "active".
- **`opda:participantStatusScheme`** — Phase labels for participant role-play (e.g. "active", "withdrawn", "completed", "deceased"). Per S006 Q7 carry.

Both schemes carry `opda:ufoCategory "PhaseLabel"` per ODR-0011 §8a; both members are `skos:Concept` instances; both schemes drive SHACL `sh:in` (closed schemes) per ODR-0013.

**Status transitions are reified `prov:Activity` lifecycle events.** Per ODR-0006 Q7 precedent + the simple-transaction-with-milestones exemplar's milestone reifications. ODR-0007 commits to the discipline mechanically.

**Gandon.** Concur. Brief.

**Pair vote on Q3.**

- **Guizzardi (Queen) vote: FOR `transactionStatus` AND `participantStatus` as Phase labels per ODR-0011 §8a + ODR-0006 Q7 (both settled) + reified lifecycle events + ODR-0017 SHACL-AF pattern at `sh:Info`.**
- **Gandon vote: FOR same** — two SKOS schemes; per ODR-0011 §1a steward declaration; SHACL `sh:in` for closed scheme discipline.

### Q4 — Chain modelling

**Guizzardi (lead, Queen).** **FOR recursive Relator predicate (`opda:dependsOnTransaction`) as canonical; first-class `opda:TransactionChain` resource as convenience Aggregate.** Both modelling layers; Council ratifies both. The chain-of-transactions exemplar models BOTH side-by-side; both earn their keep.

**The canonical layer — recursive Relator predicate.** A chain link `T_B → T_A` is a property of `T_B` (the dependent Transaction); the link IS the dependency. Per the chain-of-transactions exemplar Turtle:

```turtle
opda-x:transaction-b opda:dependsOnTransaction opda-x:transaction-a .
opda-x:transaction-c opda:dependsOnTransaction opda-x:transaction-b .
```

This is operationally complete for the most common chain queries:

- **Find the predecessor**: `?txn opda:dependsOnTransaction ?predecessor`.
- **Find the chain root**: SPARQL property-path traversal `?txn opda:dependsOnTransaction* ?root . FILTER NOT EXISTS { ?root opda:dependsOnTransaction ?_ }`.
- **Find dependent Transactions**: inverse traversal via `?txn ^opda:dependsOnTransaction ?dependent`.

**The convenience layer — first-class TransactionChain Aggregate.** Per the chain-of-transactions exemplar's `opda:TransactionChain` resource:

```turtle
opda-x:chain a opda:TransactionChain ;
    opda:chainMembers opda-x:transaction-a , opda-x:transaction-b , opda-x:transaction-c ;
    opda:chainStatus "active" ; opda:chainLength 3 .
```

The Aggregate IS a real, dereferenceable entity — per the Evans+Vernon Aggregate framing carried from S006: an Aggregate is "a cluster of associated objects that are treated as a unit for the purpose of data changes". The TransactionChain is the unit consumers (lender chain monitoring; chain-cascade-failure analysis; chain-collapse risk dashboards) operate on; the recursive Relator predicate is the granular substrate.

**Why both.** Modelling the chain ONLY at the recursive-predicate layer pushes every chain-level query into SPARQL property-path traversal — operationally fine for triplestore-aware consumers, fatal for SHACL shape authoring (`sh:property` paths over property-paths are awkward; aggregate-level constraints like `chainLength <= 7` require reification). The Aggregate layer materialises the chain-level data the consumer needs without forcing every query through traversal.

Modelling the chain ONLY at the Aggregate layer **loses the role-founding link** between adjacent Transactions: Person X is the buyer in T_A AND the seller in T_B; the chain edge is THE structural link making X a multi-role-bearer; the recursive predicate captures it locally. The Aggregate is derived; the predicate is fundamental.

The dual-mechanism is canonical, not redundant. (Allemang DA push-back anticipated — see DA section below for the "does the Aggregate earn its keep" engagement.)

**The Aggregate IC.** Per A9 §Per-kind discipline (b):

IC = **(set-of-member-Transactions) tuple persistence under chain-edge changes.**

Five hard cases:

1. **Chain link added.** A new Transaction joins the chain (mid-chain new member) → same TransactionChain individual; the Set is extended; `prov:wasRevisionOf`.
2. **Chain link removed.** A Transaction leaves the chain (sale fails; cash buyer breaks the chain into two) → if the chain splits, two new TransactionChains; the original `prov:wasInvalidatedBy` and `prov:wasDerivedFrom` to both successors.
3. **Chain head replaced.** The terminal Transaction is replaced (cash buyer becomes mortgage buyer; chain extends) → same Chain; new terminal member; `prov:wasRevisionOf`.
4. **Chain collapse.** All but one Transaction in the chain are withdrawn → single-Transaction Chain (degenerate Aggregate); or Chain ceases (if convention is Chain length ≥ 2).
5. **Chain merger.** Two parallel Chains merge (rare; cross-chain dependency) → new Chain; `prov:wasDerivedFrom` chains to both predecessors.

**Aggregate IC operational test:** SHACL shape on `opda:TransactionChain`:

```turtle
opda:TransactionChainShape a sh:NodeShape ;
    sh:targetClass opda:TransactionChain ;
    sh:property [ sh:path opda:chainMembers ; sh:minCount 2 ; sh:class opda:Transaction ] ;
    sh:property [ sh:path opda:chainLength ; sh:datatype xsd:positiveInteger ] .
```

**Gandon.** Concur. W3C-side grounding:

- **Recursive predicates are RDF-native** — no impedance with W3C standards; SPARQL property-paths are W3C Rec.
- **First-class Aggregate resource is standard pattern** — analogous to W3C Org Ontology's `org:OrganizationalCollaboration` (collection of `org:Organization`s pursuing a shared goal). The pattern is widely deployed and not Aggregate-novel.
- **The dual-mechanism cost** is two predicates on `opda:Transaction` (`opda:dependsOnTransaction`) AND one resource class (`opda:TransactionChain`) with a membership predicate (`opda:chainMembers`). Cost is bounded; benefit per the Q4 lead analysis is substantive.

**Pair vote on Q4.**

- **Guizzardi (Queen) vote: FOR recursive Relator predicate (`opda:dependsOnTransaction`) as canonical + first-class `opda:TransactionChain` Aggregate resource as convenience aggregation + Aggregate IC over five hard cases + SHACL shapes per stub-extension + ODR-0017 SHACL-AF pattern citing site for Chain succession.**
- **Gandon vote: FOR same + RDF-native recursive predicate + W3C Org Ontology Aggregate parallel + dual-mechanism cost bounded.**

### Q5 — Lease term

**Gandon (lead).** **FOR `time:ProperInterval` with `time:hasBeginning` + `time:hasDurationDescription`.** Per the lease-extension-transaction exemplar Turtle. ODR-0017 SHACL-AF rule for lease-extension-event as **seventh+ citing site** (historical interval superseded via `prov:wasDerivedFrom`).

**The lease term pattern.** From the exemplar:

```turtle
opda-x:lease-term-current
    a time:ProperInterval , opda:LeaseTerm ;
    time:hasBeginning [ time:inXSDDate "2007-01-01"^^xsd:date ] ;
    time:hasDurationDescription [ time:years 189 ] ;
    prov:wasDerivedFrom opda-x:lease-term-original .
```

**Why `time:ProperInterval` over plain `time:Interval`.** Per OWL-Time Recommendation §4 — `time:ProperInterval` is the subclass of `time:Interval` whose beginning and end are distinct (non-degenerate). A lease term with a 1-day duration would be a degenerate Interval (technically a `time:Instant`); proper leases are multi-year, so `time:ProperInterval` is the load-bearing subclass. SHACL constraint:

```turtle
opda:LeaseTermShape a sh:NodeShape ;
    sh:targetClass opda:LeaseTerm ;
    sh:class time:ProperInterval ;
    sh:property [ sh:path time:hasBeginning ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [
        sh:path time:hasDurationDescription ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:message "Lease terms are durational; explicit end-instant is admissible but durationDescription is canonical."
    ] .
```

**`time:hasDurationDescription` over `time:hasEnd`.** Per the conveyancing reality: leases are quoted in "99 years from 2007-01-01" form, not "from 2007-01-01 to 2106-01-01" form. The duration-form is the regulator-published form (HMLR title register; lease deed) — verbatim citation discipline applies (ODR-0011 §4a). The end-instant is *derivable* from beginning + duration; OWL-Time's `time:durationDescription` (with `time:years`, `time:months`, `time:days` sub-fields) carries the regulator form natively. Generator may compute the end-instant on demand; the canonical authored form is duration.

**Lease extension as succession.** Per the exemplar's `opda:lease-term-original` + `opda:lease-term-current` pattern:

- The ORIGINAL interval persists as a historical record (auditable; dereferenceable).
- The CURRENT interval is the active lease term.
- `prov:wasDerivedFrom` chains current to original.
- `opda:retiredBy` on the original points to the `opda:LeaseExtensionEvent` Activity that superseded it.

**ODR-0017 SHACL-AF rule for lease-term succession** (the seventh+ citing site):

```turtle
opda:LeaseTermSuccessionRule a sh:NodeShape ;
    sh:targetClass opda:LeaseTerm ;
    sh:sparql [
        sh:select """
            SELECT $this ?currentTerm ?priorTerm WHERE {
                $this prov:wasDerivedFrom ?priorTerm .
                ?priorTerm a opda:LeaseTerm .
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "LeaseTerm {$this} succeeds prior term {?priorTerm} (lease extension or variation)."
    ] .
```

The rule fires `sh:Info` per ODR-0017 §2a three-tier severity: succession is correct behaviour (lease extensions are statutory under LRHUDA 1993); informative materialisation, not violation.

**Guizzardi.** Concur. UFO grounding:

- **A lease term is a Quality Region in temporal space** (per ODR-0011 §8a Quality Region category — `opda:assuranceLevel` precedent; `opda:LeaseTerm` parallel). The Quality Region IS the interval; the LegalEstate qualified by the lease term has its `opda:leaseTerm` predicate range = `opda:LeaseTerm`.
- **Lease extension as Substance Kind continuity + Quality Region succession** — per ODR-0005 §3b Rule 1 (estate-transfer preserves estate identity), the LegalEstate (leasehold) persists through extension; its Quality (lease term) is succeeded. The pattern is parallel to UPRN-as-Quality on Property (ODR-0005 §6a) — Quality may succeed without Substance identity changing.

**Pair vote on Q5.**

- **Gandon (lead) vote: FOR `time:ProperInterval` + `time:hasBeginning` + `time:hasDurationDescription` (regulator-verbatim form) + SHACL well-formedness shape + lease-extension via `prov:wasDerivedFrom` + ODR-0017 SHACL-AF rule (seventh+ citing site) at `sh:Info`.**
- **Guizzardi (Queen) vote: FOR same** — Quality Region in temporal space; Substance Kind continuity + Quality succession per ODR-0005 §3b/§6a precedent.

### Q6 — Expected vs actual milestone times

**Guizzardi (lead, Queen).** **FOR PROV-O planned-vs-occurred flavour — `opda:plannedAtTime` on a Plan; `prov:atTime` on the realising Activity. NOT duplicate properties.**

**The PROV-O Plan-vs-Activity discipline.** Per PROV-O Recommendation §3 (Moreau & Missier 2013): a `prov:Plan` is "an entity that represents a set of actions or steps intended by one or more agents to achieve some goals". An Activity *realises* a Plan; the Plan exists independently of its realisation. The Plan carries the *planned-at* time; the Activity carries the *occurred-at* time. The two are distinct entities with distinct lifecycles.

**Operationalised for ODR-0007.** Per the simple-transaction-with-milestones exemplar:

```turtle
opda-x:milestone-exchange
    a prov:Activity , opda:Milestone ;
    opda:milestoneKind "exchange" ;
    prov:atTime "2024-06-18T14:00:00Z"^^xsd:dateTime ;          # OCCURRED
    opda:plannedAtTime "2024-06-15T00:00:00Z"^^xsd:dateTime ;   # PLANNED
    opda:partOfTransaction opda-x:transaction .
```

**Why not duplicate properties.** A duplicate-property approach (e.g. `opda:expectedTime` + `opda:actualTime` on the milestone) collapses the Plan-vs-Activity distinction:

- The Plan is *itself* an entity. It can be revised (the plan changes — a new milestone date is forecast). It can be authored by a different Agent than the realising Activity (the solicitor plans; the buyer/seller and lender realise). It can persist after the Activity completes (audit trail; regulator query "what was the original plan and why did slippage occur").
- A duplicate-property approach has no Plan entity; the planned-at time becomes a literal attached to the Activity. Plan revisions cannot be tracked; Plan authorship cannot be attributed; Plan persistence is opaque.

**The Plan as a UFO entity.** Per ODR-0011 §8a Method/plan code category: a Plan is a procedural entity authorising/prefiguring an Activity. The Plan IS a Method/plan-code-typed thing. The Activity realises the Plan. The Plan's `opda:plannedAtTime` is the planned timestamp; the Activity's `prov:atTime` is the occurred timestamp.

**Operational compromise (exemplar shortcut).** The simple-transaction-with-milestones exemplar puts `opda:plannedAtTime` directly on the milestone Activity (not on a separate Plan entity) — an authoring shortcut. The position file commits to the **canonical form**: `opda:plannedAtTime` on a `prov:Plan` reified entity:

```turtle
opda-x:milestone-exchange-plan
    a prov:Plan , opda:MilestonePlan ;
    opda:plannedAtTime "2024-06-15T00:00:00Z"^^xsd:dateTime ;
    opda:plansMilestoneKind "exchange" ;
    opda:plannedFor opda-x:transaction .

opda-x:milestone-exchange
    a prov:Activity , opda:Milestone ;
    opda:milestoneKind "exchange" ;
    prov:atTime "2024-06-18T14:00:00Z"^^xsd:dateTime ;
    prov:wasAssociatedWith [ a prov:Association ; prov:hadPlan opda-x:milestone-exchange-plan ] ;
    opda:partOfTransaction opda-x:transaction .
```

The exemplar's shortcut is admissible for IC-only test files; the canonical generator output reifies the Plan. The position permits both, with the canonical form load-bearing for production data.

**Slippage analysis.** A regulatory audit query "find milestones where exchange occurred more than 14 days after the plan" runs over the canonical form mechanically:

```sparql
SELECT ?activity ?planned ?actual (?actual - ?planned AS ?slippage) WHERE {
    ?activity a opda:Milestone ; opda:milestoneKind "exchange" ;
              prov:atTime ?actual ;
              prov:wasAssociatedWith/prov:hadPlan/opda:plannedAtTime ?planned .
    FILTER ((?actual - ?planned) > "P14D"^^xsd:duration)
}
```

The query is impossible with duplicate-property approach if the Plan was revised mid-flight (only the final planned time is visible). The canonical form lets the auditor read the Plan's revision history via `prov:wasRevisionOf` chains.

**Gandon.** Concur. W3C-side grounding:

- **PROV-O Plan-vs-Activity is well-specified.** Recommendation status; widely deployed (governmental open-data; scientific provenance).
- **The Plan entity earns its keep** when there is non-trivial planning machinery (multi-stakeholder; revisable; auditable). UK conveyancing has both — the Plan is non-trivial; the Plan IS the conveyancer's case plan for the Transaction.

**Pair vote on Q6.**

- **Guizzardi (Queen) vote: FOR PROV-O Plan-vs-Activity flavour — `opda:plannedAtTime` on a reified `prov:Plan` (canonical) + `prov:atTime` on the realising `prov:Activity` (milestone). NOT duplicate properties on the Activity. Exemplar shortcut admissible for IC-only test data; canonical form for production.**
- **Gandon vote: FOR same** — PROV-O Recommendation specification; slippage-analysis query mechanically discharges; Plan entity earns its keep per UK conveyancing complexity.

### Q7 — OWL-Time scope

**Gandon (lead).** **FOR OWL-Time Conditional profile — admit `time:Instant`, `time:ProperInterval`, `time:hasBeginning`, `time:hasEnd`, `time:hasDurationDescription`, `time:inXSDDate`; defer remaining OWL-Time machinery (Allen-interval relations; `time:DateTimeDescription`; `time:TRS` time reference systems; `time:TemporalEntity` polymorphism) to demand.** S002 Q7 Conditional carry; ODR-0007 commits the profile slice.

**The Conditional profile slice.** Per S002's Conditional admission discipline (one of four conditions per ODR-0002 §Conditional → Core promotion) — ODR-0007 is the first OPDA module to cite OWL-Time substantively. The profile pin per ODR-0002 §Profile-pin rule chain: ODR-0007 proposes; ODR-0014 records; ODR-0013 enforces.

**Six terms in the profile slice:**

| Term | Use in ODR-0007 | Sourced in stub/exemplar |
|---|---|---|
| `time:Instant` | (implicit — `prov:atTime` provides; no explicit `time:Instant` URI needed) | Stub §Rules; simple-transaction exemplar |
| `time:ProperInterval` | Lease term; tenure interval; marketing-window interval | Lease-extension exemplar (`opda:lease-term-current`) |
| `time:hasBeginning` | Lease term start; tenure start; marketing window start | Lease-extension exemplar |
| `time:hasEnd` | (Conditional within profile — used only when end-instant is canonical, e.g. tenure determination) | Stub §Rules — "use `time:hasBeginning`/`time:hasEnd`/`time:hasDuration`" |
| `time:hasDurationDescription` | Lease term duration ("99 years"); tenure-by-term duration | Lease-extension exemplar |
| `time:inXSDDate` (+ `time:inXSDDateTime`) | Wrapping xsd:date / xsd:dateTime values into OWL-Time terms | Lease-extension exemplar |

**Deferred OWL-Time machinery (NOT in profile slice):**

- **Allen-interval relations** (`time:intervalBefore`, `time:intervalDuring`, `time:intervalEquals`, etc.) — admitted per stub §Rules: "Reserve Allen-interval relations for where temporal ordering is genuinely asserted, not as decoration." ODR-0007 does NOT bake Allen relations into shapes; consumers MAY add Allen-interval relations on instance data when the temporal ordering is load-bearing; SHACL does NOT enforce.
- **`time:DateTimeDescription`** (structured year/month/day/timeZone/dayOfWeek/dayOfYear decomposition) — admit when downstream consumer demands calendar-arithmetic (no current consumer); defer.
- **`time:TRS` time reference systems** — defer; UK conveyancing assumes Gregorian/UTC (no TRS pluralism needed at MVP).
- **`time:TemporalEntity` polymorphism** — defer; `time:ProperInterval` and `time:Instant` cover the use cases; the abstract `time:TemporalEntity` superclass is not load-bearing.

**S002 Q7 four-condition status check (per ODR-0002 §Conditional → Core promotion):**

| Condition | Status for ODR-0007 |
|---|---|
| 1. Named consumer | ✓ — ODR-0007 cites OWL-Time in §Rules; lease-extension exemplar uses `time:ProperInterval` substantively. |
| 2. Layer count ≥ 3 | Pending — ODR-0007 is the first concrete consumer; ODR-0005 (tenure interval future), ODR-0008 (descriptive interval attributes future), ODR-0009 (claim validity intervals future) anticipated but not authored. **Stays Conditional** per the count not yet met. |
| 3. SHACL gate published | ODR-0007 §Rules commits ODR-0013 to publish SHACL well-formedness shapes for `time:ProperInterval`; gate is *proposed*, not yet published. |
| 4. Failure-mode test | ✓ — the lease-extension-transaction exemplar IS the failure-mode test (remove OWL-Time; the lease term cannot be modelled cleanly; succession breaks). |

**Verdict on Conditional → Core promotion.** Stays Conditional. Two of four conditions held; promotion deferred to a future session when ODR-0005/0008/0009 authoring catches up.

**The Davis DA pressure on Conditional admission.** Anticipated: "Q7 is profile creep — six OWL-Time terms enter the corpus before any consumer materialises the queries that need them. Let the consumer demand the terms; don't pin the profile pre-emptively." Engagement: the lease-extension-transaction exemplar IS the materialised consumer (regulator audit + LRHUDA 1993 statutory compliance + HMLR title-register integration). Six terms is the minimum-viable profile; expanding the profile requires named demand per the S002 discipline.

**Guizzardi.** Concur. UFO grounding:

- **The six-term profile slice matches the UFO temporal-Quale framework** — `time:Instant` (Quale-in-Region), `time:ProperInterval` (Quality Region), `time:hasBeginning`/`time:hasEnd` (Region boundary predicates), `time:hasDurationDescription` (Region characterisation), `time:inXSDDate` (Region-to-xsd lexical anchor). No UFO category outside the seven-category framework needs additional OWL-Time machinery.

**Pair vote on Q7.**

- **Gandon (lead) vote: FOR OWL-Time Conditional profile slice of 6 terms (`time:Instant` + `time:ProperInterval` + `time:hasBeginning` + `time:hasEnd` + `time:hasDurationDescription` + `time:inXSDDate`) + deferred machinery (Allen relations on instance demand only; DateTimeDescription/TRS/TemporalEntity deferred) + Conditional → Core promotion not yet triggered (layer count + SHACL gate pending).**
- **Guizzardi (Queen) vote: FOR same** — six-term profile matches UFO temporal-Quale framework exactly; no UFO-driven need for further machinery at MVP.

## Cross-cutting concerns

**Thread 1: A9 per-kind discipline contract (fifth `kind: pattern` ODR to discharge).** ODR-0005 first; ODR-0015 second; ODR-0011 third; ODR-0006 fourth; ODR-0007 fifth. The A9 discipline (a) UFO/DOLCE meta-category + (b) IC over named hard cases + (c) artefact realisation continues to operate. The Q1-Q4-Q6 work produces a §Operational specifications section in ODR-0007 with subsections 2a (UFO category per class: Transaction Relator + Milestone Activity + LeaseTerm Quality Region + TransactionChain Aggregate), 3a (Transaction Relator IC over five hard cases), 3b (TransactionChain Aggregate IC over five hard cases), 5a (lease-term well-formedness + succession), 6a (PROV-O Plan-vs-Activity discipline), 7a (OWL-Time profile slice).

**Thread 2: ODR-0017 SHACL-AF pattern multiple new citing sites in one session.** Transaction Relator succession (Q1 five hard cases); TransactionChain Aggregate succession (Q4 five hard cases); LeaseTerm succession (Q5 lease-extension); transactionStatus + participantStatus transitions (Q3 inherited from ODR-0006 Q7). The pattern is now extremely dense; the methodology should monitor for sub-pattern extraction (e.g. "Relator succession" sub-pattern of ODR-0017?) — flagged for future session, not blocking.

**Thread 3: OWL-Time first substantive consumer.** ODR-0007 is the FIRST OPDA module to cite OWL-Time substantively (S002 Q7 Conditional carry; ODR-0014 catalogue entry; no prior consumer). The profile slice is the operational test of the S002 Conditional discipline. If the slice is too narrow, downstream sessions will demand expansion (e.g. ODR-0009 claims demanding Allen-interval relations to assert "claim-validity interval intervalDuring transaction-window"); if too broad, the Conditional discipline degrades. Six terms is the conservative-but-load-bearing minimum.

**Thread 4: Davis DA "publish-first / minimal modelling" pressure.** Anticipated across Q1 (Transaction Relator vs simpler `prov:Activity`), Q4 (TransactionChain Aggregate "does it earn its keep"), Q6 (Plan-vs-Activity reification "is it gold-plating"), Q7 (six OWL-Time terms "profile creep"). See DA anticipation section below for engagement.

**Thread 5: The W3C alignment story.** Q1 Transaction Relator aligns with UFO 2005 Ch. 4 + ODR-0006 Proprietorship Relator precedent; Q2 hybrid aligns with PROV-O + OWL-Time complementarity (S001 Q2 reversal); Q3 Phase confirms ODR-0011 §8a + ODR-0006 Q7; Q4 dual-mechanism aligns with W3C Org `org:OrganizationalCollaboration` Aggregate parallel + RDF-native recursive predicates; Q5 lease term aligns with OWL-Time Recommendation §4 + HMLR title-register verbatim form; Q6 PROV-O Plan-vs-Activity aligns with PROV-O Recommendation §3 + ODR-0011 §8a Method/plan code framework; Q7 Conditional profile slice aligns with S002 four-condition discipline + ODR-0002 §Profile-pin rule chain.

## DA anticipation — Ernie Davis (publish-first push-back)

Davis's published methodology favours minimal-modelling, publish-first iteration, named consumer-driven term admission, and is sceptical of upfront ontological commitments that lack materialised downstream demand. Three anticipated opposition lines.

### Line 1: Transaction-as-Relator vs Transaction-as-Activity (minimal modelling pressure on Q1)

**Anticipated Davis position.** "Q1's Relator framing is the kind of upfront UFO commitment I push back against. A `prov:Activity` for the Transaction would be operationally complete for 80% of the queries — milestones as sub-Activities; participants as `prov:wasAssociatedWith`; lifecycle as a duration. Show me a consumer query where treating Transaction as Activity fails — and where the failure is not a contrived UFO-academic example."

**Engagement.** The consumer query is **the ODR-0006 RoleMixin-founding query**: "given a Seller, name the founding Relator." If Transaction is a `prov:Activity`, the query has no answer in UFO terms — Activities don't found RoleMixins per Guizzardi 2005 Ch. 4. The ODR-0006 Seller/Buyer RoleMixins become unfounded. Re-creating the schema defect (anti-rigid Role without founding Relator) is the failure mode.

The withdrawal condition: a downstream consumer query that requires the Relator-vs-Activity distinction. The ODR-0006 founding-Relator citation IS the query (a SPARQL query over the agents-and-roles ontology asking "given role X, name founding Relator R"). Davis is expected to engage; we expect withdrawal on Q1 with the founding-Relator query condition met.

### Line 2: TransactionChain Aggregate — does the resource earn its keep (Q4)

**Anticipated Davis position.** "Q4's dual-mechanism is the textbook over-modelling. The recursive predicate `opda:dependsOnTransaction` covers every chain query I can think of. The first-class `opda:TransactionChain` Aggregate adds a resource type, a membership predicate, an Aggregate IC, an Aggregate SHACL shape, and an Aggregate succession rule — five additional pieces of machinery — for what? Show me the consumer query that fails with predicate-only modelling and succeeds with the Aggregate, and explain why SPARQL property-path traversal isn't the right tool for the chain-level queries."

**Engagement.** Davis is right on the cost analysis; the question is what the cost buys. Three consumer queries genuinely require the Aggregate:

1. **Chain-collapse risk dashboard.** "List all chains where any member's `transactionStatus` is `held`." With predicate-only modelling: complex traversal-then-aggregate query; computationally expensive at chain scale (UK property market has chains of 6+ members regularly). With Aggregate: direct query on `opda:TransactionChain` filtering by member status (the Aggregate caches the chain identity).
2. **Lender chain monitoring.** "For each chain that includes a Transaction my borrower is party to, alert when chain length changes." With predicate-only: requires recomputing chain length on every transaction edit. With Aggregate: the `chainLength` predicate is updated mechanically when membership changes; the alert triggers on Aggregate edit.
3. **SHACL aggregate-level constraints.** "Chain length must not exceed 7" (regulatory cap; not currently statutory but proposed in HMLR consultation). With predicate-only: SHACL cannot constrain the chain length without traversing — `sh:property` paths over property-paths are awkward and SHACL Core does NOT support recursive paths in shapes. With Aggregate: `sh:maxInclusive` on `opda:chainLength` directly.

The withdrawal condition: three downstream consumer queries that require the Aggregate. The three above are real (chain-collapse dashboards exist commercially; lender chain monitoring is FCA-regulated; HMLR consultation on chain caps is documented). Davis is expected to engage; we expect withdrawal on Q4 with the three-query condition met.

### Line 3: Plan-vs-Activity reification is gold-plating (Q6)

**Anticipated Davis position.** "Q6's `prov:Plan` reification is academic. Real conveyancing tooling tracks 'planned date' + 'actual date' as two fields on a row. Show me the consumer query that requires the Plan-as-entity — and explain why duplicate properties on the Activity (`opda:plannedAtTime` + `prov:atTime`) cannot capture the same information."

**Engagement.** The consumer query is **plan revision history**: "find milestones where the planned date was revised before the actual date, and the revision was more than 7 days from the original plan." With duplicate properties: only the FINAL planned date is on the Activity; the original plan is lost. With Plan reification: `prov:wasRevisionOf` chains the Plan revisions; the query traces the revision history mechanically.

The query matters operationally: regulatory audits ask "did the conveyancer reset the milestone date to avoid breaching the SRA target?" — answerable only with Plan revision history. The Plan is non-trivial; UK conveyancing case-plan revision IS the working ontologist's domain.

The withdrawal condition: a consumer query that requires Plan revision history. The audit-query example above IS the consumer; SRA-regulated conveyancers face this audit query in practice. Davis is expected to engage; we expect withdrawal on Q6 with the audit-query condition met.

### Lines we expect Davis to hold (held-as-live dissent candidates)

- **Q7 OWL-Time profile creep dissent.** Davis's publish-first methodology favours admitting OWL-Time terms one-at-a-time per named demand, not committing a six-term slice upfront. Even with the four-condition check pending (layer count + SHACL gate not yet met), the slice ratification preempts future per-term consumer demand. **Expected held-as-live dissent**: "if 12 months produce zero further OWL-Time consumers beyond ODR-0007, demote the slice; admit individual terms per concrete demand only." Re-open trigger named.
- **Q2 hybrid acceptable but instant-only might have been viable.** Davis may engage on the S001 Q2 reversal (instant-only originally was the framing; OWL-Time interval admission was ≈6-3) — but the lease-extension exemplar materialises the interval consumer, so we expect convergence.

## References

- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. CTIT PhD Series 05-74. Ch. 4 (UFO Substance Kind, Role, RoleMixin, Phase, Relator).
- Guizzardi, G. et al. (2015). *Towards Ontological Foundations for Conceptual Modeling: The Unified Foundational Ontology (UFO) Story*. Applied Ontology 10(3-4).
- Masolo, C., Borgo, S., Gangemi, A., Guarino, N., Oltramari, A. (2003). *The WonderWeb Library of Foundational Ontologies*. D18 §4.5 (DOLCE Perdurant vs Endurant); §4.3 (DOLCE Quality / Quality Region).
- Searle, J. (1995). *The Construction of Social Reality* (transaction-as-social-object).
- Moreau, L., Missier, P., eds. (2013). *PROV-O: The PROV Ontology*. W3C Recommendation. §3 (`prov:Plan`, `prov:Activity`, `prov:wasAssociatedWith`, `prov:hadPlan`, `prov:wasRevisionOf`); §1 (deliberate minimality — no interval vocabulary).
- Cox, S., Little, C., eds. (2020). *Time Ontology in OWL*. W3C Recommendation. §4 (`time:ProperInterval`, `time:hasBeginning`, `time:hasEnd`, `time:hasDurationDescription`, `time:inXSDDate`); §5 (Allen-interval relations — deferred).
- Knublauch, H., Kontokostas, D., eds. (2017). *SHACL Recommendation*. §4 (Core constraints); §5.2.6 (SPARQL-based constraints).
- Evans, E. (2003). *Domain-Driven Design* (Aggregate boundary discipline); Vernon, V. (2013). *Implementing Domain-Driven Design* (Aggregate cluster-as-unit framing).
- Reynolds, D., Bouquet, P., eds. (2014). *The Organization Ontology*. W3C Recommendation (`org:OrganizationalCollaboration` Aggregate parallel).
- Allemang, D., Hendler, J., Gandon, F. (2020). *Semantic Web for the Working Ontologist*, 3rd ed. Ch. 7 (RDF reification); Ch. 8 (Minimal modeling); Ch. 12 (Beyond OWL).
- HMLR *Practice Guide 21 — Registration of dispositions of registered land*; UK Law Society *Conveyancing Quality Scheme — Core Practice Management Standards*; *Leasehold Reform, Housing and Urban Development Act 1993* (statutory lease extension).
- ODR-0001 §What an ODR records (per-kind discipline) — A9 amendment 2026-05-27. ODR-0007 is the fifth `kind: pattern` to discharge under it.
- ODR-0004 §Rule 2 (layer-segregated naming); §3a (three-graph separation); §6a (deterministic emission); §7a (term-sourcing five-line precedence); §8a (exemplar harness).
- ODR-0005 §2a (3-class UFO Substance Kinds); §3b (LegalEstate IC — Rule 1 estate-transfer preserves identity; Rule 4 charges-and-easements don't change identity); §3c (RegisteredTitle IC); §6a (UPRN-as-Quality-with-PROV-succession precedent).
- ODR-0006 §Rules (Seller/Buyer RoleMixins; Proprietorship Relator); Q3 Proprietorship-as-Relator precedent; Q7 Phase-label confirmation.
- ODR-0011 §1a (SKOS scheme + steward); §4a (regulator-verbatim citation); §5a (three-case lifecycle); §8a (seven-category UFO framework — Phase label, Method/plan code, Quality Region all used here).
- ODR-0015 §2a (Address Quality Value precedent — analogous to LeaseTerm Quality Region).
- ODR-0017 (SHACL-AF non-blocking data-quality rules pattern) — sixth+ citing site for Transaction Relator + TransactionChain + LeaseTerm succession.
- ODR-0002 §Conditional → Core promotion (four-condition check for OWL-Time); §Profile-pin rule chain.
- Diagnostic exemplars: `source/03-standards/ontology/exemplars/simple-transaction-with-milestones.ttl`, `chain-of-transactions.ttl`, `lease-extension-transaction.ttl` — the three lifecycle/chain/extension tests the Q1-Q4-Q5-Q6 verdicts discharge.
- S001 Q2 (OWL-Time admission ≈6-3 over instants-only); S001 Q3 (partition by concern); S001 Q4 (3-class deferred to S005); S002 Q7 (OWL-Time Conditional admission); S005 Q5 (3-class commitment); S006 Q3 Proprietorship Relator; S006 Q7 Phase label; S011 Q8 seven-category UFO framework.
