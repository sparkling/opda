# Davis — Devil's Advocate on S007

## DA framing

The panel will reach for theoretical clean-fits on this question — Guizzardi will press Transaction-as-Relator as the founding move that makes the ODR-0006 RoleMixins coherent; Moreau will press the PROV-O / OWL-Time intersection with care across instants, intervals, planned-vs-actual, and the full OWL-Time apparatus; Cagle will push a lease-term-succession SHACL-AF rule (a seventh citing site of ODR-0017's pattern) and very likely an eighth (milestone-variance rule); Evans+Vernon will name the bounded-context split between the transaction relator and the chain Aggregate. Every position is defensible *in isolation*. My job as DA is to ask the question none of them ask of themselves: **does each modelling commitment have a named consumer query in the BASPI5 round-trip or PDTF v3 consumer set that would fail without it?** That is the discipline of *Linked Data Patterns* (Davis & Dodds 2010) — only mint resources, predicates, and aggregates that earn their keep. The BBC `/programmes/` precedent and the gov.uk publish-first culture (GDS Service Manual 2015) reinforce it: publish-first means publish what the consumer queries against, not what the panel finds theoretically pleasing.

S007's stub adds significant modelling surface on top of S006's Relator layer: Transaction relator + chain dependency + milestone Phases + lease-term `time:ProperInterval` + `lastDemandPeriod` + `moveRestrictionDates` + `expected` vs actual planned-vs-occurred + OWL-Time profile choice + status SKOS scheme. Each commitment is theoretically grounded; together they push the modelling cost up to the point where the next maintainer cannot trace each commitment to a named consumer. That is the failure mode this DA position is built to resist.

The S006 precedent matters: ODR-0006 established the per-question evidentiary bar (each new commitment traces to a named SPARQL query, SHACL validation case, or lifecycle event), conceded RoleMixin-with-named-consumer-required (Allemang's primary attack, held-as-live for 18 months), and routed Org Ontology depth to `dct:source` + `skos:closeMatch` unless full machinery is consumed. S007 inherits that discipline. The DA frame I bring: each new commitment must trace to a consumer query / SHACL case / lifecycle event. *Linked Data Patterns* §"Resource Description" + §"Identifier Patterns": don't mint resources that don't earn their keep. BBC `/programmes/` precedent: every URI is a resource a consumer dereferences, or it's not minted. gov.uk publish-first discipline (GDS Service Manual 2015): publish what the BASPI5 round-trip and PDTF v3 consumers query, not what hypothetical-future modellers might want.

## Per-question DA positions

### Q1 — Transaction-as-Relator vs Transaction-as-Event

**DA position:** CONCEDE in principle — Guizzardi 2005 Ch. 7 §"Relator" + FIBO `fibo-fbc-pas-fpas:FinancialTransaction` precedent + S006's role-founding requirement (Seller/Buyer RoleMixins need a Relator to be coherent) jointly settle the modelling. The Transaction-as-Event alternative collapses the founding-Relator into a `prov:Activity`, which leaves the ODR-0006 RoleMixins unfounded; the PROV-O Activity reification belongs in ODR-0009 as the verification/claims layer, not as the Kind-layer founding relation.

**Mild attack on Transaction URI dereferenceability** — same shape as S006 Q3 Proprietorship-URI concern. The Relator pattern as a TBox commitment is fine; the operational question is whether `<opda:transaction/{uuid}>` is a *dereferenceable* URI in OPDA scope. *Linked Data Patterns* §"Resource Description": URIs earn dereferenceability when a consumer-side request would target the resource directly. The BBC `/programmes/` precedent works because every programme URI is consumed by an EPG, a search index, an iPlayer route — every URI has a named consumer. Does the Transaction Relator have one?

PDTF v3's `transactionId` UUID and `externalIds` already imply a dereferenceable identity (the UUID is the consumer-visible handle in the platform's API; external IDs reach into Land Registry / lender systems). On that evidence the URI does earn its keep — consumers do dereference Transaction independently of Property or Title (a conveyancing pipeline queries the transaction state separately from the property attributes; an AML programme queries the transaction history without re-traversing the property).

**Withdrawal condition:** the panel names a consumer (BASPI5 round-trip step, PDTF v3 API endpoint, conveyancing pipeline query, AML audit trail) that dereferences the Transaction URI independently of Property or Title. If named (and the BASPI5 / PDTF v3 evidence above suggests it will be), CONCEDE outright; if no consumer is named, demote the Relator to an in-memory join structure with `opda:hasTransaction` predicates directly on Property/Title.

**Per-voice vote: CONDITIONAL FOR.** Concede Transaction-as-Relator framing. Mild attack on URI dereferenceability; withdrawal on named consumer dereferencing Transaction independently (BASPI5 / PDTF v3 evidence likely sufficient).

### Q2 — Milestones, instants vs intervals

**DA position:** CONCEDE Moreau's hybrid. PROV-O has the apparatus for genuine instants (`prov:atTime` on milestone-transition Activities in ODR-0009); OWL-Time supplies the interval vocabulary PROV-O lacks (marketing-to-completion window; lease term; `lastDemandPeriod {from, to}`). The two are complementary, not competing.

The S001 Q2 instants-only alternative was reversed (≈6-3) precisely because proprietorship and lease intervals went unmodelled; S007's hybrid is the answer to that reversal. Moreau's PROV-O / OWL-Time intersection authority is W3C-grade — Moreau & Missier 2013 PROV-O Recommendation + OWL-Time Recommendation (Cox & Little 2017) supply the canonical framing.

No DA attack. CONCEDE.

**Per-voice vote: FOR Moreau's PROV-O instants + OWL-Time intervals hybrid.** Concede.

### Q3 — Status as Phase

**DA position:** CONCEDE — S011 §8a settled the Phase label for lifecycle-state values (the seven-category UFO framework places `participantStatus`, milestone status, and chain dependency-status in the Phase category). S006 Q7 confirmed the Phase label at the participant-instance level; S007 inherits both. This question is not re-opened.

No DA attack. CONCEDE.

**Per-voice vote: FOR Phase label inherited from S011 §8a + S006 Q7.** Concede.

### Q4 — Chain modelling (PRIMARY ATTACK)

**DA position (PRIMARY ATTACK):** Strong attack on the dual-mechanism overhead the stub implies. The stub commits to BOTH a recursive `opda:dependsOnTransaction` predicate at the Transaction layer AND (potentially) a first-class `opda:TransactionChain` Aggregate resource at the chain layer. *Linked Data Patterns* §"Resource Description": don't mint resources that don't earn their keep. The BBC `/programmes/` precedent is that every Aggregate (a Brand, a Series) is minted because a consumer dereferences it as a thing — `/programmes/{brand-pid}` is a Brand because the EPG, the search index, and iPlayer all query Brand-level facts that don't reduce to programme-level facts. Does `opda:TransactionChain` have an equivalent consumer? Do consumers query chain-level facts (chain length; chain status; chain bottleneck) that don't reduce to transaction-level facts (per-transaction dependency, per-transaction status)?

**The dual-mechanism risk.** If only the transaction-level `opda:dependsOnTransaction` predicate is consumed (conveyancers traverse "what's the upstream sale my purchase depends on?"), the `opda:TransactionChain` Aggregate is decoration — consumers reach the chain via traversal, never as a first-class resource. If only the chain-level `opda:TransactionChain` is consumed (an AML programme queries "how many chains have 5+ links?"), the transaction-level dependency predicate is redundant — the chain Aggregate's members supply the same information. Maintaining both creates dual sources of truth, dual SHACL shapes, dual validation cost, and the maintainer cannot tell which is authoritative.

**Pick ONE.** *Linked Data Patterns* §"Identifier Patterns": one resource, one mechanism, one consumer query path. The PDTF v3 schema's `chain` + `otherPropertyInChain` + `propertyDependencyType` leaves are flat — the schema itself does not commit to a TransactionChain class. The ontology should not add what the schema doesn't need.

**Withdrawal condition:** the panel names BOTH (a) a specific consumer query that needs chain-level Aggregate reasoning (chain length, chain status, chain-level aggregation that doesn't reduce to per-transaction facts) — e.g. a conveyancer dashboard showing "chains at risk", an AML programme querying chain depth statistics — AND (b) a specific consumer query that needs transaction-level dependency traversal — e.g. a conveyancer pipeline traversing "what is the upstream sale my purchase depends on?". Both must be named with SPARQL or use-case-text reviewable in the synthesis.

If only ONE layer has named consumer queries: pick that layer and drop the other. The BBC `/programmes/` precedent insists on this — Brand and Series are both minted because both are independently dereferenced; if only Brand were dereferenced, Series would be an internal join structure not a resource.

If BOTH layers have named consumer queries: concede both, AND record the consumer queries in `## Consequences` for the 18-month held-as-live trigger — if either layer's named consumer never materialises in production, the layer drops in a subsequent council session.

**Per-voice vote: AGAINST dual-mechanism overhead + withdrawal condition stated.** AGAINST the load-bearing dual-Aggregate-plus-predicate; withdrawal on named consumer queries for BOTH layers (or pick one).

### Q5 — Lease term as `time:ProperInterval`

**DA position:** CONCEDE OWL-Time `time:ProperInterval` with `time:hasBeginning` + `time:hasDurationDescription` derived from `startYearOfLease` + `lengthOfLeaseInYears`. The W3C OWL-Time Recommendation (Cox & Little 2017) supplies the apparatus; the schema's date-pair pattern derives naturally; SHACL well-formedness shapes (delegated to ODR-0013) constrain the derivation.

**Mild attack on OWL-Time profile scope.** The OWL-Time profile (Q7) needs to be tight — don't import the full ontology if we only need a handful of predicates. Cross-reference to Moreau's Core + Duration scope recommendation: admit `time:Instant` / `time:ProperInterval` / `time:Duration` / `time:DurationDescription` + `time:hasBeginning` / `time:hasEnd` / `time:inXSDDate`; defer the calendar/clock machinery (`time:DateTimeDescription`, `time:TRS`, time-zone modelling, Gregorian / Julian / ISO-8601 specialisations) until a named consumer requires it.

**Withdrawal condition (cross-referenced with Q7):** the panel adopts Moreau's Core + Duration scope (5-7 predicates), not the full OWL-Time apparatus. If panel proposes admitting the full ontology, withdrawal condition is a named consumer using the additional machinery.

**Per-voice vote: FOR `time:ProperInterval` lease-term derivation + Moreau's Core + Duration scope.** Concede.

### Q6 — Expected vs actual milestone times

**DA position:** CONCEDE PROV-O Plan-vs-Activity flavour. PROV-O's distinction between `prov:Plan` (the intended activity) and `prov:Activity` (the occurred activity) supplies the canonical framing for `expected` (planned milestone time) vs actual (`started` / `completed` / `soldDate`). The pattern is W3C-grade; Moreau & Missier 2013 PROV-O Recommendation §5 (Plan, Activity, qualified-derivation) supplies the apparatus.

The duplicate-properties alternative (`opda:expectedCompletionDate` + `opda:actualCompletionDate` as parallel `xsd:date` predicates) collapses the planned-vs-occurred distinction into datatype properties, losing the PROV-O attribution surface (no provenance attached to the plan; no agent attached to the planning act). Moreau's discipline is the right call.

No DA attack. CONCEDE.

**Per-voice vote: FOR PROV-O Plan-vs-Activity flavour for expected vs actual.** Concede.

### Q7 — OWL-Time scope

**DA position (STRONG SUPPORT):** Strong support for Moreau's Core + Duration scope — admit `time:Instant` / `time:ProperInterval` / `time:Duration` / `time:DurationDescription` + `time:hasBeginning` / `time:hasEnd` / `time:inXSDDate`; defer calendar/clock machinery (`time:DateTimeDescription`, `time:TRS`, time-zone modelling, named-era specialisations) until a named consumer requires it.

The full OWL-Time ontology is large — Cox & Little 2017 covers temporal positions, durations, intervals, instants, time-zones, calendars, clocks, Julian/Gregorian, named eras, and an Allen-relations subset. PDTF v3's consumer queries against time are narrow: marketing-to-completion windows, lease terms, `lastDemandPeriod`, `moveRestrictionDates`. That is a tiny subset of OWL-Time's full vocabulary.

*Linked Data Patterns* §"Adopting External Standards" (Davis & Dodds 2010): adopt external standards at the depth their consumer queries warrant; subset-with-`dct:source` is the right move when the full machinery is not consumed. The BBC `/programmes/` precedent matters here too — when the BBC adopted vCard for contact metadata, they imported only the predicates the iPlayer / programme-page consumed; they did not import vCard's full apparatus.

**Mild attack on broader inclusion.** No DA attack on Moreau's Core + Duration framing — that scope is publish-first-aligned. The attack is reserved for any expansion beyond Core + Duration without a named consumer.

**Withdrawal condition:** the scope is Moreau's Core + Duration (5-7 predicates above). If anyone proposes admitting additional machinery (calendar systems, time-zone modelling, Allen-relations beyond `time:intervalDuring` / `time:intervalBefore` which the stub already gates on "where temporal ordering is genuinely asserted"), withdrawal condition is a named consumer using the additional machinery.

**Per-voice vote: FOR Moreau's Core + Duration scope.** Concede. Mild attack on scope expansion; withdrawal on named consumer for additional machinery.

## Held-as-live re-open triggers

Two questions are conceded conditionally with re-open triggers:

- **Q4 (dual-mechanism overhead).** Re-open if 18 months / one layer has zero consumer queries in production. Drop the layer with no consumer. The BBC `/programmes/` precedent is mechanical here — Brand exists because Brand is queried; if `opda:TransactionChain` is never queried as an Aggregate (only traversed-through), drop it. Conversely, if `opda:dependsOnTransaction` is never traversed (only consumed at chain-level), drop it.
- **Q7 (OWL-Time scope creep).** Re-open if OWL-Time scope expands beyond Moreau's Core + Duration without a named consumer. Downgrade any added machinery (calendar systems; time-zone modelling; Allen-relations beyond gated `intervalDuring` / `intervalBefore`) to `dct:source` reference only unless a consumer query exercises it.

The re-open triggers are mechanical — the Queen records them in the synthesis with the 18-month timer; the next session that touches ODR-0007 checks the production-query log to determine whether the trigger fires.

## SHACL-AF concern (carryover from Allemang S006)

Cagle's seventh citing site (lease-term-succession SHACL-AF rule — extending leasehold renewals / lease re-grants per ODR-0017's pattern) and potential eighth (milestone-variance rule — flagging when `expected` and actual diverge beyond a threshold) extend the rules-on-rules-on-rules pattern further. My concern aligns with Allemang's S006 carryover stance: each new citing site of ODR-0017 must demonstrate its own named downstream consumer.

ODR-0017 was authored at S011 because four citing sites had crossed the threshold; if a seventh (S007 Q5 lease-term-succession) and eighth (S007 Q6 milestone-variance) arrive at one session without each one demonstrating its own consumer demand, the pattern becomes load-bearing-by-default rather than load-bearing-on-evidence. The S005-S015-S006-S007 trajectory shows the expansion rate accelerating (ODR-0005 §6a UPRN; ODR-0015 §4a INSPIRE; ODR-0011 §5a deprecation; ODR-0009 anticipated; potential S006 fifth; now S007 seventh and eighth) — if the rate continues without consumer demonstration per site, the rules-on-rules pattern becomes the OPDA equivalent of W3C Org Ontology machinery that nobody consumes.

**Withdrawal condition (carryover):** each new citing site of ODR-0017 demonstrates a named downstream consumer (SHACL validator producing a `sh:Info` / `sh:Warning` report a consumer reads; `odr-review` lint extension; LLM tooling per Hellmann et al. DBpedia 2017; audit-trail consumer). If Cagle's lease-term-succession rule names a consumer (leasehold-renewal audit trail; AML programme tracking lease re-grants), the seventh citing site is justified. If milestone-variance rule names a consumer (conveyancer dashboard flagging at-risk transactions; lender risk pipeline), the eighth is justified. If either does not — held-as-live as a methodology concern; the rule does not enter `## Rules` until a consumer is named.

## DA scorecard target

The minimum I will concede the session on: **6 of 7 questions withdrawn outright**, where the 6 are Q1 (concede on Transaction-as-Relator + dereferenceability evidence) + Q2 (concede on PROV-O instants + OWL-Time intervals hybrid) + Q3 (concede on Phase label inherited from S011/S006) + Q5 (concede on `time:ProperInterval` lease-term derivation) + Q6 (concede on PROV-O Plan-vs-Activity flavour) + Q7 (concede on Moreau's Core + Duration scope). The contested question is **Q4 (chain dual-mechanism overhead)**; Q4 must withdraw (by naming consumer queries for BOTH layers, or by picking ONE layer) or hold.

**Negotiable axis breakdown:**

| Q | Negotiable? | Load-bearing? | What concedes me |
|---|---|---|---|
| Q1 | Yes | No | Concede Transaction-as-Relator; mild attack on URI dereferenceability, withdrawal on named consumer dereferencing Transaction independently (BASPI5 / PDTF v3 evidence likely sufficient) |
| Q2 | (already conceded) | — | (PROV-O instants + OWL-Time intervals hybrid) |
| Q3 | (already conceded) | — | (Phase label inherited from S011 §8a + S006 Q7) |
| **Q4** | **Yes, with high evidence bar** | **Yes** | **Named consumer query for BOTH chain-level Aggregate AND transaction-level dependency; if only one layer has named consumers, pick that and drop the other** |
| Q5 | Yes | No | Concede `time:ProperInterval` lease-term derivation; mild attack on OWL-Time profile scope cross-referenced with Q7 |
| Q6 | (already conceded) | — | (PROV-O Plan-vs-Activity flavour) |
| Q7 | Yes | No | Concede Moreau's Core + Duration scope; mild attack on scope expansion, withdrawal on named consumer for additional machinery |

**Held-dissent texts (for the Queen's record if my withdrawal conditions are unmet):**

- **Q4 held:** "Dual-mechanism modelling (recursive `opda:dependsOnTransaction` predicate AND first-class `opda:TransactionChain` Aggregate) creates dual sources of truth, dual SHACL shapes, and dual validation cost. *Linked Data Patterns* §'Resource Description': one resource, one mechanism. BBC `/programmes/` precedent: every Aggregate is minted because a consumer dereferences it as a thing. The PDTF v3 schema's flat `chain` + `otherPropertyInChain` + `propertyDependencyType` leaves do not commit to a TransactionChain class; the ontology should not add what the schema doesn't need. Withdraw on named consumer queries for BOTH layers; pick ONE if only one has named consumers."

- **Q7 held (conditional):** "OWL-Time scope expansion beyond Moreau's Core + Duration (`time:Instant` / `time:ProperInterval` / `time:Duration` / `time:DurationDescription` + `time:hasBeginning` / `time:hasEnd` / `time:inXSDDate`) is unjustified by current PDTF v3 consumer queries. Calendar/clock machinery, time-zone modelling, and named-era specialisations carry cost without a proven user. Withdraw on named consumer query exercising the additional machinery; otherwise scope stays at Core + Duration."

## DA discipline note (for the Queen)

Per ODR-0001 §Roles + §Two-artefact discipline, my withdrawal or hold MUST be explicitly recorded on every contested question. The conditions above are *mechanical* — the Queen reads my position file, checks whether the synthesis adopts each withdrawal condition, and records "Davis DA withdrew on Q[n] on condition met: [verbatim condition]" or "Davis DA held on Q[n]; condition unmet: [verbatim condition]". No vague "Davis DA aligned with majority" — the alignment must trace to the specific condition that was met.

The S006 precedent matters: Allemang conceded RoleMixin only on the held-as-live for 18-months condition (Q2 was held because no named consumer query distinguished RoleMixin from sortal-only); that concession is binding methodology for S007. I do not get to re-open ODR-0006 §RoleMixin from S007; but Allemang's mechanical conditioning of held-as-live is a *precedent* — S007 inherits the discipline that contested questions resolve via 18-month re-open triggers when withdrawal conditions are not fully met at session-close.

The cited authority for every position above: *Linked Data Patterns* (Davis & Dodds 2010), §"Resource Description" + §"Identifier Patterns" + §"Adopting External Standards"; BBC `/programmes/` deployment record (BBC Online iPlayer / EPG / search index consumer surface 2009-2016 — Davis-co-authored URI design); gov.uk publish-first discipline (GDS Service Manual 2015 — publish what the consumer queries, not what the panel finds theoretically pleasing); Cox & Little 2017 W3C OWL-Time Recommendation (the temporal apparatus PDTF v3 needs a tight profile of); Moreau & Missier 2013 W3C PROV-O Recommendation (the Plan-vs-Activity apparatus Q6 inherits). These citations meet ODR-0001 §Citation grounding ("a named book authored by the expert"; "a documented deployment the expert led or co-authored").
