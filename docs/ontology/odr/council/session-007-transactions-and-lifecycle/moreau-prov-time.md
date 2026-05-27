# Luc Moreau — `prov-time` extended-panel teammate on S007

*Extended-panel teammate per plan §S007 ("Teammates: default + `prov-time` (Moreau, extended)"). I am the PROV-O Recommendation editor (Moreau & Missier eds. 2013) and the load-bearing voice on PROV-O / OWL-Time intersection — which is exactly what Q2, Q5, Q6, Q7 demand. Q1, Q3, Q4 I treat briefly; my load-bearing positions are on the four temporal questions.*

## Stance summary

ODR-0007 is `kind: pattern`. Three vocabularies converge here: **PROV-O** (the verification/claims backbone, owned authoritatively in ODR-0009 — but the milestone-as-activity reification touches this session); **OWL-Time** (Cox & Little 2017 W3C Recommendation — the interval vocabulary PROV-O deliberately lacks); and the **UFO Relator / Phase machinery** Guizzardi brings as Queen. My job is to ensure (a) milestones use the right PROV-O reification — instant or interval — *per milestone kind*, not uniformly; (b) the lease-term ProperInterval shape in the lease-extension exemplar is the canonical Q5 shape and connects cleanly to PROV-O succession; (c) the expected-vs-actual flavour invokes the well-formed `prov:Plan` apparatus, not an ad-hoc duplicate predicate; (d) the OWL-Time scope decision (Q7) names a *profile* — Core + Duration — and defers Calendar machinery until a consumer query surfaces.

What S007 must add to clear A9 §Per-kind discipline (b) on the temporal axis: (i) per-milestone instant-vs-interval categorisation (the three S007 exemplars test the discharge); (ii) the lease-term `time:ProperInterval` artefact realisation with PROV-O succession on extension (sixth or seventh `implements: ODR-0017` site materialising lease-term succession at `sh:Info`); (iii) the planned-vs-occurred `prov:Plan` linkage refinement on the exemplar pattern; (iv) the OWL-Time module set adopted (Core + Duration) recorded in ODR-0014's retired-into-ODR-0002 §Change log.

The depth questions I own: **Q2** (Milestones — instants vs intervals — PROV-O reification choice per milestone kind); **Q5** (Lease term as OWL-Time `time:ProperInterval` + PROV-O succession on extension, plus the new ODR-0017 citing site); **Q6** (Expected-vs-actual — the well-formed `prov:Plan` + `prov:Activity` apparatus, refining the exemplar's `opda:plannedAtTime` shorthand); **Q7** (OWL-Time scope — adopt Core + Duration; defer Calendar machinery). I take Q1/Q3/Q4 briefly, concurring with the formal-pair (Gandon+Guizzardi).

## Per-question positions

### Q2 — Milestones: instants vs intervals (load-bearing)

**Position: per-milestone choice, NOT uniform.** The PDTF v3 milestone set is not categorially uniform — some milestones are genuine *instants* (the act of accepting an offer; the moment of registration entry); others are *intervals* with substantive duration (the legal-completion process; the registration process from lodgement to entry). The session-001 Q2 verdict adopted OWL-Time *Conditional* precisely to enable per-milestone discrimination — uniform `prov:atTime` reproduces the Q2 incoherence ODR-0007 §Decision is supposed to resolve.

**The PROV-O reification choices** (per Moreau & Missier eds. 2013, *PROV-O Recommendation* §3 + §4):

1. **Instant milestones** — `prov:Activity` with `prov:atTime` (the W3C-recommended pattern for instantaneous activities). The Activity is a 1-tuple in time. Exemplar pattern:

   ```turtle
   opda-x:milestone-offer-accepted
       a prov:Activity , opda:Milestone ;
       opda:milestoneKind "offerAccepted" ;
       prov:atTime "2024-05-02T16:30:00Z"^^xsd:dateTime .
   ```

   This matches the `simple-transaction-with-milestones.ttl` exemplar's treatment of `instruction`, `offerAccepted`, `exchange`. Each of these *is* an instant — the offer is accepted at the moment of acceptance, not over a duration. PROV-O `prov:atTime` is the correct vocabulary.

2. **Interval milestones** — `prov:Activity` with `prov:startedAtTime` + `prov:endedAtTime`. The Activity has substantive duration. Two exemplar milestones genuinely fall here:

   - **Completion process.** The legal-completion process (TA10 / TA13 forms; solicitor coordination; funds transfer through CHAPS; key release) runs over hours-to-a-day. Modelling it as a single `prov:atTime` instant erases the audit-trail granularity that ODR-0009 (claims/evidence) will want.
   - **Registration process.** HMLR registration is *lodged* at one time and *entered* at another, often weeks apart. The `prov:startedAtTime` (lodgement) + `prov:endedAtTime` (entry) shape is the well-formed reification.

   ```turtle
   opda-x:milestone-completion-process
       a prov:Activity , opda:Milestone ;
       opda:milestoneKind "completion" ;
       prov:startedAtTime "2024-07-12T09:00:00Z"^^xsd:dateTime ;
       prov:endedAtTime   "2024-07-12T16:30:00Z"^^xsd:dateTime .
   ```

**Exemplar amendment scheduled.** The `simple-transaction-with-milestones.ttl` exemplar uses `prov:atTime` uniformly across all five milestones. This is a simplification; under the per-milestone discrimination above, `completion` and `registration` should switch to `prov:startedAtTime` + `prov:endedAtTime`. Scope-noted for next author-only follow-up — non-blocking on Q2 verdict.

**Allen-interval relations are NOT decoration.** Inherits ODR-0007 §Rules Rule 4 ("Reserve Allen-interval relations for where temporal ordering is genuinely asserted") — `time:intervalDuring` between exchange and completion-process is meaningful (exchange-instant occurs within marketing-to-completion interval); `time:intervalBefore` between instruction and offer-accepted is *not* asserted because the ordering is already implied by the `prov:atTime` values. Use Allen relations only when the ordering is *not* derivable from the temporal stamps.

**Vote: FOR per-milestone instant-vs-interval discrimination via PROV-O `prov:atTime` (instant) and `prov:startedAtTime`/`prov:endedAtTime` (interval). Exemplar amendment scheduled for author-only follow-up.**

### Q5 — Lease term as `time:ProperInterval` (load-bearing)

**Position: `time:ProperInterval` with `time:hasBeginning` + `time:hasDurationDescription`; PROV-O succession on extension; new ODR-0017 citing site.**

The `lease-extension-transaction.ttl` exemplar already states the canonical shape — my role is to ratify it and route the SHACL-AF rule materialisation:

```turtle
opda-x:lease-term-current
    a time:ProperInterval , opda:LeaseTerm ;
    time:hasBeginning [ time:inXSDDate "2007-01-01"^^xsd:date ] ;
    time:hasDurationDescription [ time:years 189 ] ;
    prov:wasDerivedFrom opda-x:lease-term-original .

opda-x:lease-term-original
    a time:ProperInterval , opda:LeaseTerm ;
    time:hasBeginning [ time:inXSDDate "2007-01-01"^^xsd:date ] ;
    time:hasDurationDescription [ time:years 99 ] ;
    opda:retiredBy opda-x:extension-activity .
```

The shape is correct per Cox & Little 2017 *Time Ontology in OWL* §4 (intervals): a `time:ProperInterval` is an Interval with non-zero duration; `time:hasBeginning` returns a `time:Instant`; `time:hasDurationDescription` returns a `time:DurationDescription` with calendar-aware fields. The PDTF v3 `startYearOfLease` + `lengthOfLeaseInYears` schema leaves map directly to `time:inXSDDate` (on the beginning Instant) + `time:years` (on the DurationDescription).

**The lease-extension event** is where PROV-O succession enters. When a leasehold is extended (statutory LRHUDA 1993 case in the exemplar):

- The **original lease-term interval** receives `opda:retiredBy` pointing to the extension event. The interval ceases to be the *current* term but remains in the graph as a historical interval (matches ODR-0005 §3c RegisteredTitle title-closure discipline — closed titles retain identity).
- The **new lease-term interval** is a new individual with `prov:wasDerivedFrom` pointing to the original. The new interval is `time:ProperInterval` with the extended duration (189 years = 99 original + 90 extension in the exemplar).
- The **LegalEstate itself persists** — per ODR-0005 §3b Rule 1/Rule 4 (estate transfer / charges-and-easements don't change identity). The lease-term interval is a Quality of the LegalEstate; the Quality changes; the bearer persists. Hendler's S005 Q5 "lease extension consumer-fails" case is discharged exactly here.

**ODR-0017 — seventh citing site.** This is the **seventh `implements: ODR-0017` site** materialising lease-term-extension chain at `sh:Info` severity. The rule:

```turtle
opda:LeaseTermSuccessionRule a sh:NodeShape ;
    sh:targetClass opda:LeaseTerm ;
    sh:sparql [
        sh:select """
            SELECT $this ?currentDuration ?priorTerm ?priorDuration WHERE {
                $this time:hasDurationDescription/time:years ?currentDuration .
                OPTIONAL {
                    $this prov:wasDerivedFrom ?priorTerm .
                    ?priorTerm time:hasDurationDescription/time:years ?priorDuration .
                }
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "LeaseTerm {$this} duration {?currentDuration} years; derived from {?priorTerm} ({?priorDuration} years)"
    ] .
```

ODR-0007 §Rules `implements: [ODR-0017]` adds itself; ODR-0017 §Consequences "Four-site `implements:` retrofitting" extends to include ODR-0007 as the seventh citing site (the running count: ODR-0005 §6a UPRN; ODR-0011 §5a deprecation; ODR-0015 §4a INSPIRE; ODR-0009 anticipated; ODR-0006 §Q1 Person-ID succession; ODR-0006 §Q1 Organisation-CRN succession; ODR-0007 lease-term succession — seventh).

**Vote: FOR `time:ProperInterval` + `time:hasBeginning` + `time:hasDurationDescription` per the lease-extension exemplar shape; PROV-O succession via `prov:wasDerivedFrom` + `opda:retiredBy`; seventh citing site of ODR-0017 SHACL-AF pattern.**

### Q6 — `expected` vs `actual` milestone times (load-bearing)

**Position: well-formed PROV-O `prov:Plan` + `prov:Activity` apparatus — refining the exemplar's `opda:plannedAtTime` shorthand.**

The `simple-transaction-with-milestones.ttl` exemplar uses `opda:plannedAtTime` on the Activity directly:

```turtle
opda-x:milestone-offer-accepted
    a prov:Activity , opda:Milestone ;
    prov:atTime         "2024-05-02T16:30:00Z"^^xsd:dateTime ;   # actual
    opda:plannedAtTime  "2024-04-25T00:00:00Z"^^xsd:dateTime .   # expected
```

This is a workable shorthand, **but the PROV-O Recommendation §6.6 (Plans)** offers a more semantically precise pattern that I recommend as the canonical S007 shape:

- A `prov:Plan` is a *separate resource* representing the prefigured (expected) activity. The Plan carries `opda:plannedAtTime` (the expected time).
- The `prov:Activity` carries `prov:atTime` (the actual time).
- The Activity links to the Plan via `prov:qualifiedAssociation` → `prov:Association` → `prov:hadPlan`. This is the W3C-recommended apparatus.
- Alternatively, `prov:wasInformedBy` between the executed Activity and a Plan-as-Activity (more lightweight) is admissible where the full qualified-association reification is overkill.

```turtle
opda-x:milestone-offer-accepted-plan
    a prov:Plan ;
    opda:plannedAtTime "2024-04-25T00:00:00Z"^^xsd:dateTime ;
    opda:planFor opda-x:transaction ;
    opda:milestoneKind "offerAccepted" .

opda-x:milestone-offer-accepted
    a prov:Activity , opda:Milestone ;
    prov:atTime "2024-05-02T16:30:00Z"^^xsd:dateTime ;
    opda:milestoneKind "offerAccepted" ;
    prov:qualifiedAssociation [
        a prov:Association ;
        prov:hadPlan opda-x:milestone-offer-accepted-plan
    ] .
```

**Why this matters.** The Activity-only shorthand conflates the *plan* (a deontic / intentional object — what was supposed to happen) with the *Activity* (a perdurant — what did happen). Under reasoning, a downstream consumer that queries "all activities planned-but-not-executed" (e.g. a transaction-progress dashboard tracking missed milestones) cannot distinguish the two in the shorthand form. The `prov:Plan` resource gives that consumer a dereferenceable target.

**Exemplar amendment scheduled (non-blocking).** Amend `simple-transaction-with-milestones.ttl` to lift each `opda:plannedAtTime` into a separate `prov:Plan` resource linked via `prov:qualifiedAssociation`. Flagged as author-only follow-up.

**Vote: FOR PROV-O `prov:Plan` resource + `prov:qualifiedAssociation` apparatus as canonical S007 shape; current exemplar shorthand admissible as transitional simplification; exemplar amendment scheduled.**

### Q7 — OWL-Time scope (load-bearing)

**Position: Adopt Core + Duration modules; defer Calendar machinery; record in ODR-0002 §Change log (where ODR-0014 retired).**

OWL-Time is modular by design (Cox & Little 2017 §1.2 — Time Ontology in OWL §Conformance). The three module-strata:

1. **Core** — `time:Instant`, `time:Interval`, `time:ProperInterval`, `time:before`, `time:after`, `time:hasBeginning`, `time:hasEnd`, `time:inside`, `time:inXSDDate`, `time:inXSDDateTime`. **Essential for S007.** Every Q2/Q5 commitment depends on Core.

2. **Duration** — `time:Duration`, `time:DurationDescription`, `time:years`, `time:months`, `time:days`, `time:hours`, `time:minutes`, `time:seconds`, `time:hasDurationDescription`. **Essential for Q5 lease term** (`lengthOfLeaseInYears` → `time:years` is direct). Also needed for `lastDemandPeriod` durations.

3. **Calendar machinery** — `time:DayOfWeek`, `time:MonthOfYear`, `time:January`, `time:February`, …, `time:TemporalUnit`. **NOT needed for S007.** Calendar-aware queries (e.g. "all completions on Mondays") are not in the consumer-query set; adopting them adds vocabulary surface without proven user.

**Adoption**: **Core + Duration** modules adopted; **Calendar deferred** until a consumer query surfaces that needs day-of-week / month-of-year discrimination. The deferral is recorded as a re-open trigger.

**Vote: FOR Core + Duration adoption; AGAINST Calendar adoption (deferred-until-trigger); ODR-0002 §Change log records the module-set commitment (ODR-0014 retired-into-ODR-0002 already per Scope-Check 1 A1).**

## Q1, Q3, Q4 — brief concurrences

### Q1 — Transaction-as-Relator vs Transaction-as-Event

**Concur with Guizzardi (Queen).** UFO Relator framing is the load-bearing UFO 2005 Ch. 4 commitment. Transaction relates Seller-RoleMixin + Buyer-RoleMixin + LegalEstate-concerned (three-place relation). The chain-of-transactions recursion is handled at Q4 (recursive Relator predicate). I have no PROV-O / OWL-Time stake in Q1 — concede entirely to the formal-pair.

**Vote: FOR Transaction-as-Relator.**

### Q3 — Status as a Phase

**Concede to S011 §8a Phase-label scheme.** S011 settled the Phase apparatus already (`participantStatus` = Phase label per §8a's seven-category UFO framework; ODR-0007 status follows the same discipline). No PROV-O / OWL-Time intersection; brief confirmation only.

**Vote: FOR Phase apparatus per S011 §8a; SKOS Phase-label scheme; consistent with S006 Q7 (same question across the two sessions).**

### Q4 — Chain modelling

**Concur with recursive Relator predicate (`opda:dependsOnTransaction`) as canonical; `opda:TransactionChain` as Aggregate-boundary convenience.** The `chain-of-transactions.ttl` exemplar shows the shape: each Transaction carries `opda:dependsOnTransaction` to the predecessor; the `opda:TransactionChain` resource lists members (`opda:chainMembers`) as a denormalised first-class entity for chain-status derivation.

**One PROV-O note** (the only place my voice adds value to Q4): chain dependencies can *also* be modelled via `prov:wasInformedBy` between Transactions — one transaction's completion *informs* the next (the buyer's funds become available; the seller's funds become reinvestable). This is the PROV-O view: chain coherence as information-flow between Activities. It is **complementary** to the recursive-Relator view, not competing:

- `opda:dependsOnTransaction` — the **Aggregate-boundary** view (Domain-Driven Design discipline; ODR-0007 Aggregate semantics). Read as: "this transaction's lifecycle is coupled to that one".
- `prov:wasInformedBy` — the **information-flow** view (PROV-O Activity-to-Activity dependency). Read as: "this transaction's completion was conditioned on that one's outcome".

Both can be present; tooling consumes either depending on query. The recursive-Relator predicate is *canonical* (the schema-mapping target); the PROV-O `prov:wasInformedBy` is *available* (for PROV-O consumers wanting Activity-graph traversal).

**Vote: FOR recursive Relator predicate canonical; `opda:TransactionChain` as convenience Aggregate; PROV-O `prov:wasInformedBy` available as complementary view.**

## Engagement with Davis DA (publish-first concern)

Davis is DA on S007 with the brief "keep it minimal — publish-first". The concern lands on PROV-O complexity: my Q6 `prov:Plan` apparatus recommendation adds a separate resource (the Plan) and a qualified-association reification — more triples per milestone than the `opda:plannedAtTime` shorthand. Davis's voice is the right one to challenge this.

**My response.** Three points:

1. **The shorthand is admissible as transitional.** I am NOT proposing the `prov:Plan` apparatus as a freeze-gate requirement. The exemplar's `opda:plannedAtTime` shorthand is workable for Phase-3b ratification; the canonical shape is recorded as the *target* for when downstream consumers (Q6's transaction-progress dashboard case) surface the need. Davis's publish-first stance is preserved.

2. **The seventh ODR-0017 site is not new machinery.** The lease-term succession SHACL-AF rule (Q5) re-instantiates a pattern already extracted in ODR-0017; it is not a *new* discipline being added at S007. Davis's "publish-first" critique applies to invention, not to re-instantiation.

3. **Calendar deferral demonstrates restraint.** My Q7 vote AGAINST Calendar adoption is the publish-first principle in action — OWL-Time is modular precisely so this kind of restraint is available. We adopt only the modules consumer queries demand.

Davis's substantive objections are valid where I am inventing (Q6 Plan apparatus); they are not where I am applying existing discipline (Q5 ODR-0017 re-instantiation; Q7 module restraint). I expect Davis to withdraw on Q5 and Q7 and hold-as-live on Q6.

## Cross-references

- **ODR-0009 (Claims, Evidence & Provenance, Phase 4).** I am Queen of S009 per plan §S009. The PROV-O backbone authoritatively lives there; S007's milestone-as-Activity reification is a *forward reference* into ODR-0009's discipline. S009 must consume the S007 verdict (milestone Activities are the substrate ODR-0009 attaches `prov:wasAssociatedWith` Agent and `prov:used` Evidence onto).

- **ODR-0017 (SHACL-AF non-blocking quality rules).** Seventh citing site per Q5 (`opda:LeaseTermSuccessionRule`). The retrofit pending list in ODR-0017 §Consequences gains ODR-0007 as the seventh site.

- **ODR-0014 / ODR-0002 §Change log.** The OWL-Time module-set commitment (Q7) lands here. ODR-0014 was retired-into-ODR-0002 per Scope-Check 1 A1; the OWL-Time `Conditional` status (session-001 Q2 verdict) is upgraded to `Adopted (Core + Duration)` with this session.

- **ODR-0005 §3b/§3c.** Hendler's lease-extension "consumer-fails" case (S005 Q5) is *substantively discharged* by Q5 — the lease-term Quality changes; the LegalEstate persists; the RegisteredTitle records the registry-event. The three-class commitment was load-bearing for stating Q5 cleanly.

- **Cox & Little 2017 *Time Ontology in OWL* Recommendation.** Authoritative source for Q2/Q5/Q7. `dct:source` on the OWL-Time-using terms resolves here.

- **Moreau & Missier 2013 *PROV-O Recommendation* §3 (entities/activities/agents), §4 (qualified associations), §6.6 (plans).** Authoritative source for Q2/Q6. `dct:source` on the PROV-O-using terms resolves here.
