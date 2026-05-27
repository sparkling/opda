# Cagle — Solo position on S007

## Stance summary

ODR-0007 is **Phase 3b lifecycle modelling** and my load is its operational underbelly — how do the Transaction Relator + Milestones + Lease-term intervals actually drive SHACL? My S005 §6a precedent (SHACL-AF rule materialising UPRN succession into the validation report at `sh:Info`) was re-instantiated by Pandit at ODR-0011 §5a (deprecation-chain) and by Guizzardi at ODR-0015 §4a (INSPIRE succession); ODR-0017 then extracted the pattern as a `kind: pattern` ODR ratified 2026-05-27. **S007 brings two further candidate citing sites**: the lease-term-succession chain (Q5, statutory extension under LRHUDA 1993; lease-extension-transaction exemplar) and the expected-vs-actual milestone variance (Q6). If ratified, ODR-0017's citing-site count reaches seven or eight — well past the four-site threshold and into stable pattern territory.

I concur with the ODR-0007 stub's Transaction-as-Relator framing (Q1 — formal-pair territory, Gandon/Guizzardi authority) and with milestone modelling as reified `prov:Activity` (Q2 — Moreau's authority). My contribution is the **SHACL operationalisation that makes the framing checkable**: the two-shape pattern dispatching `InstantMilestone` vs `IntervalMilestone` via `sh:xone`; the OWL-Time `time:ProperInterval` invariant for lease-term well-formedness; the expected-vs-actual SHACL-AF variance rule that fires `sh:Info` (in-tolerance) or `sh:Warning` (overdue / over-threshold). I AGREE BOTH on Q4 (chain modelling — recursive predicate AND aggregate `TransactionChain`; the exemplar already encodes both). I concede Q1, Q3, Q7 to formal-pair / S011 / Moreau.

I expect this session ratifies the lifecycle TBox at the deliberative level. Lease-term-succession (Q5) and expected-vs-actual variance (Q6) become the seventh and eighth citing sites of ODR-0017; the pattern is fully consolidated by S007 close.

## Per-question positions

### Q1 — Transaction-as-Relator vs Transaction-as-Event

Conceded to formal-pair (Gandon + Guizzardi). Authority on UFO Relator commitment sits with Guizzardi; the chain-recursion pressure-test sits with Gandon's W3C semantic-web reasoning. My only operational concern: whichever framing wins, SHACL must be able to target it. A UFO Relator is `sh:targetClass opda:Transaction`; a UFO Event is `sh:targetClass opda:TransactionEvent` (or `prov:Activity` if conflated with milestones). Both are checkable; the Relator framing is **more economical** for the founding-of-Seller/Buyer-Roles discipline ODR-0006 inherits.

The lease-extension-transaction exemplar is the load-bearing case (Hendler S005 Q5 cross-cite — `opda:LeaseExtensionEvent` is BOTH a `prov:Activity` AND an `opda:Transaction`). Under Relator framing, this is a Transaction Relator whose relata include the pre-existing LegalEstate (modified, not minted); under Event framing, this is a Phase change on the LegalEstate. The exemplar already commits to a hybrid (`a prov:Activity , opda:LeaseExtensionEvent , opda:Transaction`); the SHACL operationalisation reads cleanly from either reading.

Vote: DEFER to formal-pair on Relator-vs-Event substantive verdict. FOR exemplar's hybrid typing surviving either verdict.

### Q2 — Milestones: instants vs intervals (DEPTH — SHACL operationalisation)

Concur with stub framing — milestones are reified `prov:Activity` per Moreau (S001 Q2 OWL-Time conditional adoption). My operational addition: **two-shape pattern with `sh:xone` dispatch** so that the validator can distinguish instant milestones (most cases — instruction, offer accepted, exchange, completion, registration) from interval milestones (rare but real — marketing window, contract-period under Scottish missives).

```turtle
opda:InstantMilestoneShape a sh:NodeShape ;
    sh:targetClass opda:Milestone ;
    sh:property [
        sh:path prov:atTime ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:dateTime ;
        sh:severity sh:Violation ;
        sh:message "Instant milestone {$this} must carry exactly one prov:atTime."
    ] .

opda:IntervalMilestoneShape a sh:NodeShape ;
    sh:targetClass opda:IntervalMilestone ;
    sh:property [
        sh:path prov:startedAtTime ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:dateTime
    ] ;
    sh:property [
        sh:path prov:endedAtTime ;
        sh:minCount 0 ; sh:maxCount 1 ;
        sh:datatype xsd:dateTime
    ] ;
    sh:severity sh:Violation ;
    sh:message "Interval milestone {$this} must carry prov:startedAtTime; prov:endedAtTime optional (open-ended interval admissible)." .

opda:MilestoneShape a sh:NodeShape ;
    sh:targetClass opda:Milestone ;
    sh:xone ( opda:InstantMilestoneShape opda:IntervalMilestoneShape ) ;
    sh:severity sh:Violation ;
    sh:message "Milestone {$this} must conform to either instant or interval shape, not both." .
```

`sh:xone` (exclusive-one) discriminates: a node must match exactly one of the two sub-shapes. Mixed forms (e.g. `prov:atTime` together with `prov:startedAtTime`) fail validation — defends against schema-source ambiguity where a milestone is recorded inconsistently across the PDTF leaves.

Per Moreau (`prov-time` teammate authority): `prov:startedAtTime` + `prov:endedAtTime` is the PROV-O interval form; my pattern reuses it directly rather than minting OWL-Time intervals at the milestone layer. OWL-Time intervals are reserved for **lease terms** (Q5) and **lifecycle windows** (the listing-to-completion span as a derived `time:Interval`).

Vote: FOR reified `prov:Activity` milestones (concur with stub + Moreau). FOR two-shape `sh:xone` pattern as the SHACL operationalisation. AGAINST mixing `prov:atTime` and `prov:startedAtTime` on the same milestone instance.

### Q3 — Status as Phase

Conceded to S011 inheritance. The S011 Q8 seven-category UFO framework already commits `participantStatus` to **Phase label** (S011 §8a table); ODR-0007's `status` follows the same framing for transaction-level lifecycle (proposed / active / exchanged / completed). The SKOS scheme lives in ODR-0011; ODR-0007 consumes via `dct:source` chain.

Vote: FOR Phase apparatus inherited from S011 (concur with stub). FOR consistency check with ODR-0006 Q7 (same Phase pattern across both sessions).

### Q4 — Chain modelling (AGREE BOTH — recursive predicate + Aggregate)

The chain-of-transactions exemplar already encodes both candidates (per `opda:dependsOnTransaction` recursive predicate AND `opda:TransactionChain` aggregate). My position: **both serve operational purposes, neither subsumes the other**, and SHACL targets each layer with distinct constraints.

**Recursive predicate (`opda:dependsOnTransaction`)** is for transaction-level dependency. SHACL targets `opda:Transaction`; constraint enforces acyclicity of the dependency graph + permits SPARQL chain traversal:

```turtle
opda:TransactionDependencyShape a sh:NodeShape ;
    sh:targetClass opda:Transaction ;
    sh:property [
        sh:path opda:dependsOnTransaction ;
        sh:nodeKind sh:IRI ;
        sh:class opda:Transaction ;
        sh:severity sh:Violation ;
        sh:message "Transaction {$this} depends on {?value} — must be an opda:Transaction (chain dependency)."
    ] .
```

Acyclicity check is a SHACL-AF rule (recursive SPARQL):

```turtle
opda:NoCyclicChainRule a sh:NodeShape ;
    sh:targetClass opda:Transaction ;
    sh:sparql [
        sh:select """
            SELECT $this WHERE {
                $this opda:dependsOnTransaction+ $this .
            }
        """ ;
        sh:severity sh:Violation ;
        sh:message "Transaction {$this} has a cyclic dependency chain."
    ] .
```

**Aggregate (`opda:TransactionChain`)** is for chain-level constraints — properties that apply to the chain as a whole, not to individual transactions. SHACL targets `opda:TransactionChain`; constraint enforces that all chain members are jointly active-or-blocked (cascading status):

```turtle
opda:ChainCohesionRule a sh:NodeShape ;
    sh:targetClass opda:TransactionChain ;
    sh:sparql [
        sh:select """
            SELECT $this ?blockedTx WHERE {
                $this opda:chainMembers ?blockedTx .
                ?blockedTx opda:status ?status .
                FILTER(?status IN ("blocked", "failed"))
                ?this opda:chainStatus "active" .
            }
        """ ;
        sh:severity sh:Warning ;
        sh:message "Chain {$this} marked active but member {?blockedTx} is blocked/failed; chain status should cascade."
    ] .
```

Without both, the model is operationally incomplete: the recursive predicate enables traversal but cannot express "the whole chain has frozen"; the aggregate expresses chain-level state but loses the dependency-graph topology.

Vote: FOR BOTH `opda:dependsOnTransaction` (recursive predicate) AND `opda:TransactionChain` (aggregate). AGAINST collapsing to either alone. The exemplar's hybrid form survives.

### Q5 — Lease term as OWL-Time interval (DEPTH — ODR-0017 7th citing site)

The lease-extension-transaction exemplar already commits the lease term to `time:ProperInterval` (per OWL-Time spec — `time:ProperInterval` is a `time:Interval` whose beginning and end are distinct). The SHACL operationalisation enforces well-formedness AND opens the seventh citing site for ODR-0017.

**Well-formedness invariant.** A `time:ProperInterval` MUST carry `time:hasBeginning` (an `xsd:date` or `time:Instant`) AND EITHER `time:hasEnd` OR `time:hasDurationDescription`. Without one of the two, the interval is open-ended (no closing bound) — admissible for live leases prior to expiry computation, but flagged for the renderer.

```turtle
opda:LeaseTermProperIntervalShape a sh:NodeShape ;
    sh:targetClass opda:LeaseTerm ;
    sh:property [
        sh:path time:hasBeginning ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Lease term {$this} must carry time:hasBeginning."
    ] ;
    sh:xone (
        [ sh:property [ sh:path time:hasEnd ; sh:minCount 1 ] ]
        [ sh:property [ sh:path time:hasDurationDescription ; sh:minCount 1 ] ]
    ) ;
    sh:severity sh:Warning ;
    sh:message "Lease term {$this} should carry time:hasEnd OR time:hasDurationDescription (open-ended interval admissible at sh:Warning)." .
```

**Lease-term-succession (ODR-0017 seventh citing site).** The lease-extension-transaction exemplar carries `opda-x:lease-term-current prov:wasDerivedFrom opda-x:lease-term-original`. This is the **same shape** as ODR-0005 §6a UPRN succession, ODR-0011 §5a deprecation succession, and ODR-0015 §4a INSPIRE succession — a `prov:wasDerivedFrom` chain on a contingent quality (here, the lease-term interval). The SHACL-AF rule:

```turtle
opda:LeaseTermSuccessionRule a sh:NodeShape ;
    sh:targetClass opda:LeaseTerm ;
    sh:sparql [
        sh:select """
            SELECT $this ?currentTerm ?priorTerm WHERE {
                $this a opda:LeaseTerm .
                OPTIONAL { $this prov:wasDerivedFrom ?priorTerm }
                BIND($this AS ?currentTerm)
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "Lease term {$this} has succession chain: {?currentTerm} ← {?priorTerm} (where defined; LRHUDA 1993 extension typically)."
    ] .
```

Severity `sh:Info` per ODR-0017 §2a three-tier severity decision rule (substantive succession with `prov:wasDerivedFrom` chain present). The exemplar's current term derived from the original term is the canonical case; the historical interval (`opda-x:lease-term-original`) carries `opda:retiredBy` pointing at the extension activity.

**ODR-0017 `implements:` retrofit.** ODR-0007 declares `implements: [ODR-0003, ODR-0017]` in frontmatter; the `## References` section cites ODR-0017 for the SHACL-AF pattern's authoring discipline. This is the **seventh citing site** (after §6a UPRN, §5a deprecation, §4a INSPIRE; the four sites from ODR-0017's `## References` already commit, plus the prospective ODR-0009 PROV-O Claims/Evidence site).

Vote: FOR `time:ProperInterval` well-formedness invariant. FOR `opda:LeaseTermSuccessionRule` as the seventh ODR-0017 citing site. FOR ODR-0007 `implements: ODR-0017` retrofit.

### Q6 — Expected vs actual milestone times (DEPTH — ODR-0017 8th citing site)

The simple-transaction-with-milestones exemplar already commits both `prov:atTime` (actual occurrence) and `opda:plannedAtTime` (expected per the Plan). My push: **variance reporting via SHACL-AF rule** materialising the delta into the validation report at `sh:Info` (in-tolerance) or `sh:Warning` (over-threshold) — the **eighth citing site for ODR-0017**.

**Two-tier severity:**

| Condition | Severity | Operational meaning |
|---|---|---|
| Both `opda:plannedAtTime` and `prov:atTime` present; delta ≤ 14 days | `sh:Info` | Milestone occurred near plan; variance recorded as data |
| Both present; delta > 14 days | `sh:Warning` | Milestone over-threshold; flagged for conveyancer review |
| `opda:plannedAtTime` present; `prov:atTime` absent; planned date in past | `sh:Warning` | Overdue milestone (planned but not yet recorded as occurred) |
| Only `prov:atTime` present (no planning record) | (no rule fires) | Unplanned milestone — admissible (instruction often unplanned) |

```turtle
opda:MilestoneVarianceRule a sh:NodeShape ;
    sh:targetClass opda:Milestone ;
    sh:sparql [
        sh:select """
            SELECT $this ?actual ?planned ?deltaSeconds WHERE {
                $this opda:plannedAtTime ?planned .
                OPTIONAL { $this prov:atTime ?actual }
                BIND( IF(BOUND(?actual),
                         (xsd:double(?actual - ?planned) / 86400.0),
                         (xsd:double(NOW() - ?planned) / 86400.0))
                      AS ?deltaSeconds )
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "Milestone {$this} variance: planned {?planned}, actual {?actual}, delta {?deltaSeconds} days."
    ] .

opda:MilestoneOverdueRule a sh:NodeShape ;
    sh:targetClass opda:Milestone ;
    sh:sparql [
        sh:select """
            SELECT $this ?planned WHERE {
                $this opda:plannedAtTime ?planned .
                FILTER NOT EXISTS { $this prov:atTime ?any }
                FILTER (?planned < NOW())
            }
        """ ;
        sh:severity sh:Warning ;
        sh:message "Milestone {$this} planned at {?planned} is overdue (no prov:atTime recorded; planned date in past)."
    ] .
```

The 14-day variance threshold is a discipline choice — defensible as the typical conveyancer review cadence (week-and-a-half). Configurable per-deployment via SHACL profile; ODR-0010 (Overlay Profile Mechanism) is the natural extension point. ODR-0017 §1a canonical template covers the rule structure; my rules instantiate the template with `opda:plannedAtTime`/`prov:atTime` as the predicates.

**ODR-0017 eighth citing site.** Variance-reporting rule re-instantiates the pattern. The succession-chain motif (`prov:wasDerivedFrom`) is generalised here to **plan-occurred linkage** (`opda:plannedAtTime` ↔ `prov:atTime`) — same SHACL-AF discipline, same `sh:Info`/`sh:Warning` severity tier, same machine-consumability contract per Hellmann et al. (DBpedia 2017). The pattern thus generalises beyond strict succession into **any informative-not-normative-breaking data-quality assertion**.

Vote: FOR `opda:MilestoneVarianceRule` + `opda:MilestoneOverdueRule` as the eighth ODR-0017 citing site. FOR 14-day default threshold (overridable via ODR-0010 profile). FOR `implements: ODR-0017` retrofit (covers Q5 and Q6 jointly).

### Q7 — OWL-Time scope (full / profile / selective)

Conceded to Moreau (`prov-time` teammate authority). The S001 Q2 reversal adopted OWL-Time Conditional ≈6-3; the scope question (full ontology vs profile vs selective import) is downstream of that adoption. My operational position: **selective import** is sufficient for the lifecycle layer — `time:Instant`, `time:Interval`, `time:ProperInterval`, `time:hasBeginning`, `time:hasEnd`, `time:hasDurationDescription`, `time:inXSDDate`. Allen-interval relations (`time:intervalDuring`, `time:intervalBefore`) reserved for genuine ordering assertion per the stub Rule (and Moreau's S007 input).

Vote: DEFER to Moreau on OWL-Time scope verdict. Concur with stub Rule ("Reserve Allen-interval relations for where temporal ordering is genuinely asserted").

## Replies to anticipated objections

### Davis DA — "ODR-0017 was supposed to be a stable pattern, not a sprawl driver"

Anticipated attack: *"You authored ODR-0017 as a four-site pattern-extraction record; in S007 you're proposing two new citing sites (lease-term-succession, milestone-variance). The pattern's `kind: pattern` identity test (A9 §Artefact identity test) is supposed to prevent unbounded re-instantiation. Where does it stop?"*

Reply: The IC over hard cases (ODR-0017 §5a) covers exactly this case — **rule extension** (a SHACL-AF rule's SPARQL body gains new patterns without changing existing patterns) is **same individual** (extension preserves identity). The lease-term-succession rule and the milestone-variance rule are **new individuals**, not extensions of existing rules — different target classes (`opda:LeaseTerm`, `opda:Milestone`), different predicates (`prov:wasDerivedFrom` vs `opda:plannedAtTime`/`prov:atTime`). They re-instantiate the **template** (§1a canonical template), not the same rule. The pattern's `kind: pattern` discipline is precisely to enable this: re-instantiation is cheap; re-deciding the severity discipline is not. Where it stops: when no new domain quality emerges that fits the `sh:Info`/`sh:Warning` non-blocking discipline. S007 brings two more; future sessions may bring further; the pattern absorbs them.

Withdrawal condition (offered): I withdraw the Q6 milestone-variance rule if Davis produces an operational alternative that (a) makes expected-vs-actual variance mechanically queryable; (b) preserves the historical-data tolerance discipline (variance is data, not violation); and (c) does NOT require duplicating SPARQL across each consumer.

### Guizzardi (potential rebuttal on Q4 AGREE BOTH)

Possible attack: *"You collapsed the recursive-predicate-vs-aggregate question into 'both'. The ontology must commit to one. Adopting both is multiplying entities without necessity."*

Reply: The exemplar already commits to both (lines 53-68 of `chain-of-transactions.ttl`). The recursive predicate is the **dependency-graph edge**; the aggregate is the **chain-level Substance Kind**. These are categorically different — an edge is a relation; an aggregate is a kind. SHACL targets each at the correct cardinality and the correct level. Collapsing to predicate-only loses the chain-as-entity (cannot SHACL-target chain-level properties like `opda:chainStatus`); collapsing to aggregate-only loses the dependency-graph topology (cannot SPARQL-traverse the chain). The "AGREE BOTH" verdict is **the minimum sufficient operational commitment**, not multiplication of entities.

## Cross-references

- My Q5 SHACL-AF rule (`opda:LeaseTermSuccessionRule`) re-instantiates ODR-0005 §6a / ODR-0011 §5a / ODR-0015 §4a pattern as the **seventh citing site** for ODR-0017. ODR-0007 `implements: ODR-0017` retrofit lands in this session's frontmatter amendment.
- My Q6 SHACL-AF rules (`opda:MilestoneVarianceRule` + `opda:MilestoneOverdueRule`) re-instantiate the pattern as the **eighth citing site** for ODR-0017. Generalises the pattern from strict-succession to plan-vs-occurred linkage.
- My Q2 two-shape `sh:xone` milestone pattern feeds forward into **ODR-0013** (SHACL Validation & Severity — ratifies `sh:xone` dispatch discipline) and into the **simple-transaction-with-milestones exemplar** validation.
- My Q4 AGREE BOTH chain-modelling verdict feeds forward into the **chain-of-transactions exemplar** validation (chain-cohesion cascade) and into the **`odr-review` lint** (verifies both predicate and aggregate are present per recursive-chain).
- ODR-0017 §5a IC over hard cases (rule-extension same-individual; new-target-class new-individual) governs the seventh/eighth citing-site decision: rules with different target classes are new individuals, NOT extensions of existing rules.
- ODR-0004 §3a (three-graph separation) places my SHACL-AF rules in `opda-shapes.ttl`, NOT `opda-annotations.ttl`. The CI test `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` returns false for all Q5/Q6 rules.
