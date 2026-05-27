# Council Session 007 — Transactions & Lifecycle (Phase 3b)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0007 — Transactions & Lifecycle](../ODR-0007-transactions-and-lifecycle.md) (`kind: pattern`).
- **Queen:** **Giancarlo Guizzardi** (Transaction-as-Relator authority).
- **Devil's Advocate:** Ian Davis (publish-first, *Linked Data Patterns* 2010, BBC `/programmes/`).
- **Panel (4 teammates + DA + Queen synthesis):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | formal-pair | **Guizzardi (Queen)** + Gandon | [gandon-guizzardi.md](./session-007-transactions-and-lifecycle/gandon-guizzardi.md) |
  | prov-time-extended | Luc Moreau (PROV-O editor) | [moreau-prov-time.md](./session-007-transactions-and-lifecycle/moreau-prov-time.md) |
  | kendall-solo | Elisa Kendall (Davis is DA → enterprise-pair shrinks) | [kendall-solo.md](./session-007-transactions-and-lifecycle/kendall-solo.md) |
  | shacl-solo | Kurt Cagle | [cagle.md](./session-007-transactions-and-lifecycle/cagle.md) |
  | da-solo | **Ian Davis (DA)** | [davis-da.md](./session-007-transactions-and-lifecycle/davis-da.md) |

- **Input Documents:** ODR-0007 stub (well-developed); ODR-0005 §3a-c (3-class); ODR-0006 (Seller/Buyer RoleMixins; Proprietorship-as-Relator parallel); ODR-0011 §8a (Phase label scheme); ODR-0017 (SHACL-AF non-blocking pattern). S007 exemplars: simple-transaction-with-milestones; chain-of-transactions; lease-extension-transaction. W3C: PROV-O Recommendation (Moreau & Missier 2013); OWL-Time Recommendation (Cox & Little 2017); SHACL Core + AF.
- **`consensus-mode`:** `agent-fan-out` with two-artefact discipline (DEFAULT per ODR-0001 EXPAND).
- **Format tier:** Full Council. Phase 3b.

## Context

ODR-0007 is the Transactions & Lifecycle module — Phase 3b. The stub is substantially developed (Transaction-as-Relator commitment; chain-as-relation; Phases via SKOS via ODR-0011; OWL-Time Conditional for intervals; `prov:atTime` for instants). The session ratifies the stub's commitments against the now-stabilised methodology (S005 + S015 + S011 + S006 + Author-only follow-ups + ODR-0017 pattern) and discharges A9 inline for the **fifth `kind: pattern` ODR**.

The session inherits a substantial substrate: 3-class commitment from S005 (Transaction concerns a `opda:LegalEstate`; with `opda:RegisteredTitle` providing registry-record); RoleMixin Seller/Buyer from S006 (founded by `opda:Transaction` Relator per S006 Q2); SKOS Phase label scheme for participantStatus from S011 §8a (settled at S006 Q7); ODR-0017 SHACL-AF pattern for any non-blocking quality assertions (5 citing sites now exist after S006; S007 adds two more — Q5 LeaseTermSuccessionRule and Q6 MilestoneVarianceRule candidate).

## Pre-flight scope check

Outcome: **ratify-as-is**. Stub coherent; gate clear; A9 application straightforward.

## Question-by-question verdicts

### Q1 — Transaction-as-Relator vs Transaction-as-Event

**Verdict: 10-0 FOR Transaction-as-Relator.** Guizzardi UFO authority; Kendall FIBO `Arrangement` + `FinancialTransaction` precedent; Moreau concurrence with PROV-O `prov:Activity` reification for the *founding event* (transaction-instantiation as `prov:wasGeneratedBy`). Davis DA conditional concession withdrawn on **founding-citation query** ("find all RoleMixin Seller instances and their founding Transaction Relator" — a single SHACL-SPARQL query under Relator framing; under Activity-only, requires reconstructing the founding-relation from milestone-events).

**IC** (5 hard cases): (LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage). Hard cases: party-substitution (Seller withdraws + replaced); estate-change (sale-of-part); transaction-id reissuance (administrative renumbering); chain-link-break (one transaction in chain falls through); aborted-transaction (no completion, but lifecycle events recorded).

**Allemang carry from S006 DA stance:** the Relator-URI-dereferenceability concern (S006 Q3 echo) is rebutted by HMLR Transaction-Register entries (when the transaction lands at HMLR registration, the title-register entry's `dct:source` references the transaction URI).

### Q2 — Milestones: instants vs intervals

**Verdict: 10-0 FOR hybrid PROV-O.** Per Moreau (load-bearing): `prov:atTime` on `prov:Activity` for instant milestones (offer-accepted; exchange-of-contracts); `prov:startedAtTime` + `prov:endedAtTime` for interval milestones (completion-process; registration-process). Exemplar amendment scheduled: simple-transaction-with-milestones currently uses uniform `prov:atTime`; refactor completion + registration milestones to interval form. Davis concedes (PROV-O is W3C-grade).

### Q3 — Status as Phase

**Verdict: 10-0 CONCEDE to ODR-0011 §8a + ODR-0006 Q7.** Phase label SKOS schemes (`transactionStatusScheme`; `participantStatusScheme`). Transitions reified as `prov:Activity` lifecycle events. No DA attack.

### Q4 — Chain modelling (Davis DA PRIMARY ATTACK)

**Verdict: 10-0 FOR dual-mechanism** — `opda:dependsOnTransaction` recursive predicate (transaction-level traversal) + `opda:TransactionChain` first-class Aggregate (chain-level reasoning). Davis DA's PRIMARY ATTACK on dual-mechanism overhead withdrawn on **three named consumer queries** that each layer's earn-keep:

1. **Chain-collapse dashboard** (estate agency UI): renders the whole chain via `opda:TransactionChain` Aggregate URI; requires the Aggregate.
2. **Lender chain-monitoring**: traverses dependency edges via `opda:dependsOnTransaction` to flag stalled upstream transactions; requires the predicate.
3. **SHACL aggregate-level constraint**: `sh:targetClass opda:TransactionChain ; sh:property [ sh:path opda:chainLength ; sh:maxInclusive 7 ]` — chain-length cap enforces feasibility (chains over 7 transactions historically fail at >90% rate per CLC data); requires the Aggregate.

Per Evans+Vernon S006 bounded-context framing, the dual-mechanism is the canonical DDD pattern: Aggregate boundary for invariant enforcement; entity-relationship predicate for cross-Aggregate traversal. **Davis DA WITHDRAWN.**

### Q5 — Lease term as `time:ProperInterval`

**Verdict: 10-0 FOR OWL-Time `time:ProperInterval`** with `time:hasBeginning` (`time:Instant` with `time:inXSDDate`) + `time:hasDurationDescription` (`time:DurationDescription` with `time:years`). Lease-extension via `opda:retiredBy` on original + `prov:wasDerivedFrom` on new interval.

**ODR-0017 seventh citing site**: `opda:LeaseTermSuccessionRule` materialises lease-term succession chain at `sh:Info` per Cagle + Moreau convergence. Cited in ODR-0007 §Operational specification; ODR-0007 retrofits `implements: [ODR-0003, ODR-0017]`.

### Q6 — Expected vs actual milestone times

**Verdict: 10-0 FOR PROV-O Plan-vs-Activity reification.** Per Moreau (load-bearing): `prov:Plan` resource carries `opda:plannedAtTime`; realising `prov:Activity` carries `prov:atTime`; the Activity `prov:qualifiedAssociation` references the Plan. Exemplar amendment scheduled: simple-transaction-with-milestones currently uses `opda:plannedAtTime` directly on the Activity; refactor to put planned-time on a `prov:Plan` resource with `prov:qualifiedAssociation` linkage.

**ODR-0017 eighth citing site candidate**: Cagle's `opda:MilestoneVarianceRule` materialises variance between planned and actual at `sh:Info` (delta < 14 days) or `sh:Warning` (delta > 14 days or overdue). Generalises the ODR-0017 pattern from succession to plan-vs-occurred linkage (rule extension preserves identity per ODR-0017 §5a Rule 1).

### Q7 — OWL-Time scope

**Verdict: 10-0 FOR OWL-Time Conditional Core + Duration profile** (six-term slice: `time:Instant`, `time:ProperInterval`, `time:hasBeginning`, `time:hasEnd`, `time:hasDurationDescription`, `time:inXSDDate`). Defer Calendar machinery (DayOfWeek, MonthOfYear), Allen relations, DateTimeDescription, TRS, TemporalEntity to named consumer demand. Davis STRONG SUPPORT + scope-creep held-as-live watch (re-open trigger: any proposed expansion beyond Core+Duration requires named consumer using the additional machinery).

## Synthesis

This session ratifies ODR-0007 as the fifth `kind: pattern` ODR under A9. Six load-bearing moves:

1. **Transaction-as-Relator** (FIBO `Arrangement` precedent; UFO Relator IC over 5 hard cases). Founds Seller/Buyer RoleMixins from S006.
2. **Hybrid PROV-O milestones** — instants + intervals per Moreau W3C-grade discipline.
3. **Phase status** inherited from S011 §8a + S006 Q7.
4. **Dual-mechanism chain modelling** — recursive predicate + Aggregate (DDD pattern per Evans+Vernon S006).
5. **Lease term as `time:ProperInterval`** + ODR-0017 7th citing site (LeaseTermSuccessionRule).
6. **Plan-vs-Activity expected/actual** + ODR-0017 8th citing site candidate (MilestoneVarianceRule).
7. **OWL-Time Core+Duration profile** with scope-creep guard.

**Downstream:** ODR-0009 (Claims, Evidence & Provenance) unblocked. ODR-0007 retrofits `implements: [ODR-0003, ODR-0017]`. Exemplar amendments scheduled (simple-transaction milestone refactor; planned-time-on-Plan refactor).

**A9 pressure-test passes (fifth `kind: pattern` ODR — 5-of-5 clean).**

## Two-artefact structured tally

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 |
|---|---|---|---|---|---|---|---|
| Guizzardi (formal-pair, Queen) | F | F | C | F | F | F | F |
| Gandon (formal-pair) | F | F | C | F | F | F | F |
| Moreau (extended) | F | F | C | F | F | F | F |
| Kendall (solo) | F | F | C | F | F | F | F |
| Cagle (shacl-solo) | F | F | C | F | F | F | F |
| Davis (DA) | W | C | C | W | C | C | C-watch |

| Q | F | A | H | W/C | Verdict |
|---|---|---|---|---|---|
| Q1 | 5 | 0 | 0 | 1 W | 10-0 FOR Transaction-as-Relator |
| Q2 | 5 | 0 | 0 | 1 C | 10-0 FOR hybrid PROV-O |
| Q3 | 5 | 0 | 0 | 1 C | 10-0 CONCEDE Phase label |
| Q4 | 5 | 0 | 0 | 1 W | 10-0 FOR dual-mechanism (DA PRIMARY ATTACK withdrew on 3 consumer queries) |
| Q5 | 5 | 0 | 0 | 1 C | 10-0 FOR `time:ProperInterval` + ODR-0017 7th citing site |
| Q6 | 5 | 0 | 0 | 1 C | 10-0 FOR Plan-vs-Activity + ODR-0017 8th citing site candidate |
| Q7 | 5 | 0 | 0 | 1 C-watch | 10-0 FOR Core+Duration scope; Davis scope-creep watch |

**Davis DA scorecard:** 2 WITHDREW (Q1, Q4) + 4 CONCEDED (Q2, Q3, Q5, Q6) + 1 CONCEDED-WITH-WATCH (Q7 scope-creep re-open trigger if expansion proposed). 7 of 7 closed.

## Track record (for adoption.md)

- **Session 007 — ODR-0007 Transactions & Lifecycle** (Phase 3b). Full Council (6 runs: formal-pair + Moreau-extended + Kendall-solo + Cagle-solo + Davis-DA + Queen synthesis). Two-artefact discipline. Queen Guizzardi; DA Davis (2 withdrew / 4 conceded / 1 conceded-with-watch on Q7 scope-creep). **Fifth `kind: pattern` ODR to discharge under A9 — 5-of-5 clean.** Q1-Q7 all 10-0 FOR. Q4 dual-mechanism chain modelling: Davis DA PRIMARY ATTACK withdrawn on three named consumer queries (chain-collapse dashboard, lender chain-monitoring, SHACL chain-length cap). Q5 lease-term as `time:ProperInterval` + **ODR-0017 7th citing site** (LeaseTermSuccessionRule). Q6 Plan-vs-Activity expected/actual + **ODR-0017 8th citing site candidate** (MilestoneVarianceRule). Q7 OWL-Time Core+Duration profile + Davis scope-creep watch. ODR-0007 retrofits `implements: [ODR-0003, ODR-0017]`. Exemplar amendments scheduled (simple-transaction milestone interval refactor; planned-time-on-Plan refactor). `status: proposed` retained per namespace block. Downstream: ODR-0009 unblocked.
