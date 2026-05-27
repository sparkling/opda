# Council Session 008 — ODR-0008 Property Descriptive Attributes

- **Date:** 2026-05-27
- **Record under review:** [ODR-0008 — Property Descriptive Attributes](../ODR-0008-property-descriptive-attributes.md)
- **Queen / Moderator:** Dean Allemang (pragmatic working-ontologist; "Semantic Web for the Working Ontologist" 3rd ed.; generator-first DA discipline from S005)
- **Devil's Advocate:** Kurt Cagle (The Ontologist; SHACL practitioner; AI-RDF integration; "distinctions earn their keep when a SHACL shape treats two cases differently")
- **Panel:**

| Teammate | Voices | Working-file |
|---|---|---|
| `allemang-hendler` (Queen + pragmatic) | Dean Allemang (Queen); Jim Hendler (W3C/RPI) | [`working/session-008/allemang-hendler.md`](./working/session-008/allemang-hendler.md) |
| `cagle-da` (DA solo) | Kurt Cagle | [`working/session-008/cagle-da.md`](./working/session-008/cagle-da.md) |
| `kendall-davis` (enterprise + publish-first) | Elisa Kendall (OMG/FIBO); Ian Davis (BBC/UK Gov) | [`working/session-008/kendall-davis.md`](./working/session-008/kendall-davis.md) |
| `guizzardi-baker` (UFO + governance) | Giancarlo Guizzardi (NEMO/UFO); Tom Baker (DCMI) | [`working/session-008/guizzardi-baker.md`](./working/session-008/guizzardi-baker.md) |
| `knublauch-pandit-extended` (SHACL + DPV extended) | Holger Knublauch (TopBraid/SHACL); Harshvardhan Pandit (DPV CG chair) | [`working/session-008/knublauch-pandit.md`](./working/session-008/knublauch-pandit.md) |

10 voices across 5 teammates + 1 DA + Queen synthesis. Two-artefact discipline applied (narrative + structured tally below).

- **Input Documents:**
  - [ODR-0008 stub](../ODR-0008-property-descriptive-attributes.md) — 935-annotated-leaf descriptive layer; declare-once-reconcile-overlays cure
  - [ODR-0005 §2a/3a/3b/3c](../ODR-0005-property-land-identity-crux.md) — 3-class commitment (Property + LegalEstate + RegisteredTitle)
  - [ODR-0011 §8a](../ODR-0011-enumeration-vocabularies.md) — seven-category UFO framework
  - [ODR-0004 §6a + §7a + §3a](../ODR-0004-pdtf-ontology-foundation.md) — generator-first; term-sourcing precedence; three-graph separation
  - [ODR-0010 §Q1 + §Q6](../ODR-0010-overlay-profile-mechanism.md) — overlay profile composition; no-identity-override
  - [ODR-0013 §Q1 + §Q7](../ODR-0013-shacl-validation-and-severity.md) — severity tiers; three-rule interface contract
  - [ODR-0017](../ODR-0017-shacl-af-quality-rules-pattern.md) — SHACL-AF non-blocking quality rules
  - [ODR-0018](../ODR-0018-dpv-class-level-coannotation-pattern.md) — DPV class-level co-annotation pattern
  - [Follow-up plan §S008](../../../plan/council-followup-sessions.md) — question list
  - `source/00-deliverables/semantic-models/data-dictionary.md` — 1,557 unique leaves; 935 annotated; 16 canonical schemas
- **`consensus-mode`:** `none` (standard Agent fan-out per Scope-Check 2 B2/B3 retirement)
- **Format tier:** **Full Council.** S008 ratifies the **mapping discipline** for the 935-leaf-to-class walk — the rules, not the mechanical mapping itself. The mapping execution is implementation-downstream.

## Context

ODR-0008 has been DEFERRED through the original 14-session plan per S005 §8a (Kendall+Davis joint amendment) pending the 3-class crystallisation. The 3-class commitment is now operationally crystallised across S006/S007/S009/S010/S013 (all ratified); the namespace block is cleared via S003b + ADR-0006. S008 can now ratify the **discipline** that governs how the 935 annotated descriptive leaves attach to the 3-class TBox.

This Full Council ratifies the rules of mapping (what counts as a spanning leaf; how to cite the source; when to promote to a Class; how datatype-vs-SKOS resolves; how overlay variation handles off to ODR-0010) — NOT the 935-leaf walk itself. The walk is implementation work that follows once the generator (ADR-0007) emits the foundation.ttl + per-module .ttl files.

The session inherits substantial substrate: S005's 3-class IC; S011's seven-category UFO framework + Quale-in-Region; S006's Person/Org Kinds (for occupier/proprietor PII handoff); S009's PROV-O backbone (for Survey/EPC/Search provenance); S010's three-rule SHACL interface contract; S012's DPV class-level co-annotation discipline; S013's severity framework.

## Pre-flight scope check

Outcome: **ratify-as-is**. Stub coherent; substrate ratified; S005 cardinality deferral cleared. Author-only is insufficient (5 of 7 questions have credible split potential — sub-module shape, citation grain, SKOS scope, hierarchy admission, overlay-handoff boundary); Full Council is the right tier.

## Question-by-question verdicts

### Q1 — Spanning-leaf threshold N

**Verdict: 10-0 FOR — reject arithmetic threshold N; adopt mechanical-default with consumer-query reconciliation trigger + SHACL shape-target detection + Pandit's PII discovery hook.**

Convergence across teammates against the "spanning count ≥N" framing as the wrong cut:

- **Allemang + Hendler** propose N=2 as the operational floor BUT with the semantically-same-text discipline (per-leaf adjudication when dictionary text diverges).
- **Guizzardi + Baker** reject N entirely: the ontological cut is intrinsic-Quality-of-Property vs Mode-particularising-Relator. Frequency is sorting-aid, not the cut.
- **Knublauch + Pandit** reject N: SHACL shape-target convergence detects spanning leaves directly (`?shape sh:targetClass opda:Property ; sh:path ?p` grouped by `?p`); N drops out.
- **Kendall + Davis** unanimously FOR N=2 with hybrid framing (publish-first cardinality + FIBO modular merge).
- **Cagle DA PRIMARY ATTACK WITHDREW** on adoption of the mechanical-default + consumer-query-trigger + reconciliation register.

**Operational synthesis (lands in ODR-0008 §Operational specifications):**

1. **Mechanical default.** Every annotated leaf emits one `opda:` datatype property per leaf-name + JSON-Schema signature (generator-first per ODR-0004 §6a).
2. **SHACL shape-target detection.** Spanning-leaf detection is operational, not threshold-driven: query the shapes graph for shape-target convergence on a property path; spanning leaves are the converged paths.
3. **Consumer-query reconciliation trigger.** Reconciliation deliberation fires ONLY when (a) two distinct leaf names with different signatures are claimed by a named consumer query as the same ontology property, OR (b) a query produces a wrong answer-set under the mechanical default.
4. **Reconciliation register.** Per-leaf reconciliation outcomes recorded in a register with the triggering query (Cagle's amendment; operational durable artefact).
5. **Pandit's PII discovery hook.** Every new spanning-leaf candidate fires a SHACL-AF rule (ODR-0017 pattern) checking PII-shape; raises `sh:Warning` if reconciling ≥2 overlays without DPV co-annotation per ODR-0018 §3a.

Cagle's HELD-AS-LIVE dissent (re-open if a fixed N is set without consumer-query-trigger override) is **satisfied by the mechanical-default + register adoption** — withdrawn.

### Q2 — Sub-module split

**Verdict: 10-0 FOR — monolithic-for-now with two named spawn-triggers** (UFO meta-category crystallisation; authority-retrieved-artefact provenance loss).

- **Allemang (Queen) + Davis (publish-first)**: monolithic this session; split-trigger named per Allemang's "rules are one set of rules, not five".
- **Guizzardi + Baker**: three sub-modules by UFO meta-category (Quality / Mode / Substance-Kind-label); each requires a named steward.
- **Cagle DA**: spawn-trigger candidate for Survey/EPC/Search/Title-Plan provenance loss.
- **Knublauch + Pandit**: single descriptive module organised by `sh:targetClass`; sub-modules only when a Kind crystallises (per Q4). Governance layer excluded (ODR-0012/0018 separation).
- **Kendall**: FOR four-way split (Kendall's named four-way candidate from Scope-Check 1 Q2) — **held-as-live dissent** with named re-open trigger: "if encumbrances surface a distinct attachment to `opda:LegalEstate` rather than `opda:Property` (per Kendall's decisive S008 Scope-Check candidate)".

**Operational synthesis:**

ODR-0008 stays monolithic as one ratified module ODR. Spawn-rule fires on EITHER:

- **UFO meta-category crystallisation** (Guizzardi+Baker amendment): when ≥1 sub-module's leaf-set populates such that Quality / Mode / Substance-Kind-label distinctions are operationally load-bearing for consumer queries, spawn ODR-0008a/b/c per the three sub-modules with named stewards (Allemang on `property-qualities`; Guizzardi/Pandit on `property-modes`; Kendall on `legal-estate-attributes`).
- **Authority-retrieved-artefact provenance loss** (Cagle amendment): when Survey/EPC/Search/Title-Plan cannot be modelled as flat datatype property bags without losing `prov:wasGeneratedBy` chains, spawn ODR-0008d "Authority-Retrieved Artefacts" with `implements: [ODR-0007, ODR-0017]`.

Kendall's four-way held-as-live remains the alternative spawn axis; convened in 18 months or on encumbrance-cardinality-evidence trigger.

### Q3 — Data dictionary citation grain

**Verdict: 10-0 FOR — per-property `dct:source` per ODR-0004 §7a, with array-of-overlay-sources for spanning leaves; section-level NOT adopted but tracked as a Cagle-held-as-live for clustered-section cases.**

- **Knublauch (operational authority)**, Allemang, Hendler, Guizzardi, Baker, Kendall, Pandit: per-property `dct:source` is the load-bearing grain per ODR-0004 §7a precedent. Pandit adds: per-property grain MUST cover DPV co-annotations too (regulator-text `dct:source` per ODR-0018 §6).
- **Cagle DA + Davis**: HELD-AS-LIVE for the section-level-with-leaf-anchor option as an opt-in for clustered sections (≥3 contiguous leaves mapping to contiguous property block).
- **Spanning leaves**: per-property + array-of-overlay-sources (Baker + Allemang convergence).

**Operational synthesis:**

1. **Per-property `dct:source` as the canonical grain** — every emitted `opda:` datatype property carries `dct:source` to its canonical data-dictionary leaf path with version-pinned URL (per ODR-0004 §7a).
2. **Array-of-overlay-sources for spanning leaves** — for leaves spanning multiple overlays, the single `opda:` property carries an *array* of `dct:source` triples (one per overlay leaf-path). Lossless audit in both directions.
3. **DPV `dct:source` parallel discipline** — when a property carries `dpv-pd:hasPersonalDataCategory` per ODR-0018, the DPV co-annotation also carries `dct:source` to the DPV regulator text.
4. **Round-trip equivalence SPARQL test** — for spanning leaves, the consuming-overlay's set of `dct:source` triples MUST equal the per-overlay sources retrievable via the data dictionary's spanning-leaf cross-context table.

Cagle's HELD-AS-LIVE section-level opt-in is **preserved with named re-open trigger**: "if per-leaf verbosity becomes an operational maintenance burden in the generator (>100 `dct:source` lines per module .ttl), revisit section-level with leaf-anchors". 18-month review.

### Q4 — Granularity floor (datatype vs structured value vs Class)

**Verdict: 10-0 FOR — three-criterion class-promotion test (provenance OR lifecycle OR PII-regime distinct); named Class promotions: Survey, EPC, Search, Valuation, Comparable. Building / Room: Davis held-as-live (no current consumer query); Kendall + Guizzardi support; convene on first BASPI5 round-trip evidence.**

- **Cagle DA** proposed the three-criterion test (provenance OR lifecycle OR PII-regime distinct); Allemang's "earns its keep" discipline applies.
- **Guizzardi + Baker**: UFO Kind/IC + DCMI prefLabel-bearing-substructure dual test → Building / Room / Survey / Search / Valuation / Comparable as Classes.
- **Allemang + Hendler**: structured-datatype default + lifecycle-query graduation discriminator.
- **Kendall**: FOR Building / Room as Kinds (FIBO precedent); **Davis HELD-AS-LIVE AGAINST** Building / Room (no current consumer query exercises Building/Room reasoning beyond Property aggregation).
- **Knublauch**: shapes-graph cuts along `sh:targetClass`; class-promotion fires the SHACL sub-Kind shape graph; **Pandit**: Survey / Search / Encumbrance carry concentrated PII regimes → class-promotion enables ODR-0018 class-level co-annotation.

**Operational synthesis:**

1. **Three-criterion class-promotion test:**
   - (a) Authority-retrieved provenance (`prov:wasGeneratedBy` chain to a regulator-issued or professional-issued activity), OR
   - (b) Distinct lifecycle (issued / superseded / re-issued / withdrawn), OR
   - (c) Distinct PII regime per ODR-0018 (surveyor-PII + survey-subject-PII; assessor-PII + EPC-Register-published-PII; etc.).
2. **Definite Class promotions (criteria all three or any single fires unanimously):** `opda:Survey`, `opda:EPCCertificate`, `opda:Search`, `opda:Valuation`, `opda:Comparable`. Each promoted Class carries `implements: [ODR-0007, ODR-0017, ODR-0018]` retrofit when ratified at downstream sub-module sessions.
3. **Conditional Class promotions (Davis held-as-live):** `opda:Building`, `opda:Room`. Convene at first named BASPI5 round-trip query exercising Building / Room reasoning beyond Property aggregation; 18-month review per Davis's S005 Q5 dissent precedent.
4. **Datatype default**: every other leaf stays as `owl:DatatypeProperty` (no class-mint).

Cagle DA **CONCEDED** on adoption of the three-criterion test with definite promotions named.

### Q5 — Datatype vs SKOS (per-attribute application of ODR-0011 §8a)

**Verdict: 10-0 FOR — ODR-0011 §8a-named schemes as SKOS; non-§8a one-shot enums stay `xsd:string + sh:in`; burden of SKOS promotion on the proposer per leaf.**

- **Cagle DA**: HELD on "everything category-like is SKOS"; PROPOSAL: §8a-gate + stay-as-datatype default + per-leaf SKOS-promotion proposal discipline (burden on proposer).
- **Guizzardi + Baker**: per-scheme UFO category per ODR-0011 §8a inherited; `xsd:string + sh:pattern` for lexical-only one-shot; plain `xsd:string` for free text.
- **Knublauch + Pandit**: special-category Article-10 vocabularies (caution-or-conviction; AML outcomes) MUST be SKOS with explicit dpv-pd tags per ODR-0018 (Pandit's S012 Q3 carry).
- **Kendall**: FOR all category-likes as SKOS (~40 schemes); **HELD-AS-LIVE** for SKOS expansion beyond §8a — convene if SKOS demand crystallises in module sessions.
- **Davis**: FOR §8a-named only (~5 schemes); aligns with Cagle's stay-as-datatype default.
- **Allemang + Hendler**: FOR SKOS per §8a uniformly; agree to Cagle's burden-on-proposer for non-§8a.

**Operational synthesis (lands as a per-leaf binding table in ODR-0008 §Operational specifications):**

| ODR-0008 leaf | UFO category (ODR-0011 §8a) | SHACL modelling |
|---|---|---|
| `currentEnergyRating` (A-G) | Quale-in-Region | SKOS scheme; Quality of `opda:Property` |
| `councilTaxBand` (A-I) | Quale-in-Region | SKOS scheme; Quality of `opda:Property` |
| `builtForm` (Detached / Semi-/etc.) | Quale-in-Region | SKOS scheme; Quality of `opda:Property` |
| `ownershipType` (Freehold / Leasehold / Commonhold) | Quale-in-Region | SKOS scheme; Quality of `opda:LegalEstate` |
| `tenureKind` (Freehold / Leasehold / Commonhold) | Substance Kind label | SKOS scheme; sub-Kind via `skos:exactMatch` |
| `centralHeatingFuelType` | Quale-in-Region | SKOS scheme; open-extension via "Other" |
| `priceQualifier`, `marketingTenure` | Mode / Quality Value | SKOS scheme; Quality Value of listing Relator (S007 territory) |
| **Non-§8a one-shot enums** (e.g. `yesNoNotKnown`, internal `mediaType` flags) | (not §8a-listed) | **`owl:DatatypeProperty` with `sh:in`** — no SKOS scheme |

Kendall's HELD-AS-LIVE dissent (SKOS for all ~40 candidate schemes) preserved with 18-month re-open trigger: "convene if downstream consumer queries exercise SKOS-vocabulary machinery on currently-non-§8a-named enums".

### Q6 — Sub-property hierarchies

**Verdict: 10-0 FOR — flat-default; no general `rdfs:subPropertyOf`. Hierarchy admission requires named consumer query + reasoner-independence test. Kendall's `opda:hasUtilityConnection` parent: HELD-AS-LIVE.**

- **Cagle DA** proposed: flat-default + named-consumer-query trigger + reasoner-independence test.
- **Allemang + Hendler**: FOR flat — no `rdfs:subPropertyOf` this round.
- **Guizzardi + Baker**: conservative — only genuine part-whole / specialisation; SKOS broader/narrower for value-spaces.
- **Knublauch**: SHACL `sh:property` constraint argument — `opda:utility` parent enables one shape over all utility variants. **Conceded** on Cagle's reasoner-independence test.
- **Pandit**: hierarchies risk silent PII leakage if a parent class auto-inherits PII-bearing children's tags.
- **Kendall**: FOR `opda:hasUtilityConnection` parent (FIBO operational pattern); **HELD-AS-LIVE** with named re-open trigger: "convene if a SHACL profile is forced to UNION across all utility-children predicates, indicating parent-property would simplify the shape".
- **Davis**: AGAINST search/encumbrance parent — flat sibling predicates with scope notes.

**Operational synthesis:**

1. **Flat default** — every descriptive datatype property is `owl:DatatypeProperty` with no `rdfs:subPropertyOf` in the initial emission.
2. **Hierarchy admission trigger** — named consumer query asking for parent-level entailment, with the query text reviewable in the proposing session's synthesis.
3. **Reasoner-independence test** — the hierarchy MUST produce the same answer-set under (a) entailment-on AND (b) entailment-off (consumer UNIONs over named children). If they differ, the hierarchy is decorative under (b); most SPARQL consumers run (b).
4. **SKOS broader/narrower** for value-spaces (`fttp skos:broader fibre`) per ODR-0011 §Rules — distinguished from `rdfs:subPropertyOf` between predicates.

Kendall's HELD-AS-LIVE on `opda:hasUtilityConnection` parent preserved; re-open at first SHACL profile forced to UNION across utility-children.

### Q7 — Overlay-form variation (handoff to ODR-0010)

**Verdict: 10-0 CONFIRM handoff to ODR-0010 + Cagle's three-boundary-clause amendment + three SHACL CI tests.**

- **All teammates**: FOR confirming the handoff — base TBox carries one `opda:` property per spanning leaf; per-form `sh:minCount`/`sh:in` variation lives in ODR-0010 profile shapes.
- **Cagle DA PRIMARY VIGILANCE**: three boundary clauses must be added explicitly to ODR-0008:
  1. **Base-cardinality clause**: base TBox carries `0..*` for every descriptive property; per-form `sh:minCount` lives in ODR-0010 profile shapes.
  2. **Enum union clause**: spanning leaves with differing per-overlay enum sets — base SKOS scheme carries the union of all overlay members; per-form `sh:in` restriction lives in ODR-0010 (per Cagle's Scope-Check 1 Q6 three-rule interface contract; `sh:in` semantics merged at build-time).
  3. **Advisory annotations clause**: form-ergonomic guidance lives in annotation graph (`opda-annotations.ttl`), NOT in base TBox or profile shapes (Cagle's S001 Q5 win re-instantiated).
- **Knublauch (operational SHACL authority, S010 Queen)**: concurs — his three-rule interface contract from S010 Q8 + S013 Q7 applies here (`sh:in` semantics; `sh:Violation` floor; no-identity-override gate).

**Operational synthesis (lands in ODR-0008 §Operational specifications and §Enforcement):**

Three boundary clauses + three SHACL CI tests per Cagle:

1. **Base-cardinality CI test**: `ASK { ?p a opda:DescriptiveProperty . ?p sh:minCount ?n . FILTER (?n > 0) }` returns FALSE in base `opda-shapes.ttl` (per-form `sh:minCount` is profile-only).
2. **Profile-`sh:in`-merge CI test**: for each spanning leaf, the union of per-profile `sh:in` members equals the SKOS scheme's `skos:Concept` set.
3. **Annotation-graph isolation CI test**: `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` returns FALSE (per ODR-0004 §3a; re-affirms ODR-0013 §Q1 + S001 Q5).

**Cross-cite**: ODR-0008 §References MUST cite ODR-0010 + ODR-0013 on the three-rule interface contract (Cagle's Scope-Check 1 Q6 amendment; load-bearing for the overlay-variation handoff).

## Two-artefact structured tally (per ODR-0001 §Two-artefact discipline)

### Vote tally

| Question | Vote | Held-as-live dissents / vigilance |
|---|---|---|
| Q1 — Spanning-leaf threshold N | 10-0 FOR mechanical-default + register + SHACL detection + PII hook | Cagle PRIMARY ATTACK WITHDRAWN on adoption |
| Q2 — Sub-module split | 10-0 FOR monolithic-with-spawn-triggers | Kendall HELD-AS-LIVE on four-way alternative (18-month or encumbrance-cardinality trigger) |
| Q3 — Citation grain | 10-0 FOR per-property + per-overlay array | Cagle HELD-AS-LIVE on section-level opt-in (18-month review) |
| Q4 — Granularity floor | 10-0 FOR three-criterion test + named promotions | Davis HELD-AS-LIVE AGAINST Building/Room class-promotion (named consumer-query re-open) |
| Q5 — Datatype vs SKOS | 10-0 FOR §8a-gate + stay-as-datatype default | Kendall HELD-AS-LIVE for SKOS expansion beyond §8a (18-month trigger) |
| Q6 — Sub-property hierarchies | 10-0 FOR flat-default + reasoner-independence test | Kendall HELD-AS-LIVE on `opda:hasUtilityConnection` parent (UNION-forcing trigger) |
| Q7 — Overlay handoff | 10-0 CONFIRM + three boundary clauses + three CI tests | Cagle PRIMARY VIGILANCE — re-open at S010 if boundary leaks |

### DA scorecard

| Cagle DA position | Withdrawal status | Trigger |
|---|---|---|
| Q1 PRIMARY ATTACK on threshold N | WITHDRAWN | Mechanical-default + register + SHACL detection adopted |
| Q2 LIGHT ATTACK on sub-module spawn-trigger naming | WITHDRAWN | Authority-retrieved spawn-trigger named in §Consequences |
| Q3 ATTACK on per-leaf verbosity | HELD-AS-LIVE | Section-level opt-in for clustered cases — 18-month review |
| Q4 LIGHT ATTACK on class-promotion criterion | CONCEDED | Three-criterion test adopted with candidates named |
| Q5 ATTACK on SKOS over-promotion | WITHDRAWN | §8a-gate + stay-as-datatype default + burden-on-proposer adopted |
| Q6 ATTACK on hierarchy authoring | WITHDRAWN | Flat-default + named-query trigger + reasoner-independence test adopted |
| Q7 VIGILANCE on overlay-handoff boundary | PRIMARY VIGILANCE | Three boundary clauses + three CI tests adopted in ODR-0008; vigilance carries to S010 |

Cagle DA scorecard: **6 WITHDRAWN/CONCEDED + 1 HELD-AS-LIVE (Q3) + 1 PRIMARY VIGILANCE (Q7)**.

### `kind: pattern` A9 discipline check

ODR-0008 §Operational specifications MUST land (per A9 §Per-kind discipline):

- **UFO/DOLCE meta-category**: per-leaf binding table from Q5 declares each scheme's category (Quale-in-Region, Mode, Substance Kind label, Quality Value).
- **IC over named hard cases**: each promoted Class (Survey, EPC, Search, Valuation, Comparable) carries IC discipline per ODR-0005 §3b precedent (rights-bundle persistence pattern adapted to artefact lifecycle); hard cases named (re-issue, supersession, withdrawal, regulator-republication).
- **Artefact realisation**: generator (ADR-0007) emits per-leaf binding table as `dct:source` + `skos:scopeNote` on each minted class.

A9 discharge: **YES** — ODR-0008 is the seventh `kind: pattern` ODR to discharge under A9 (after 0005/0006/0007/0009/0011/0015 + this).

## Synthesis

ODR-0008 §Decision retained — "Declare-once-reconcile-overlays" — with substantive amendments:

1. **§Operational specifications — Spanning-leaf detection (Q1)**: mechanical-default emission + SHACL shape-target detection + consumer-query reconciliation trigger + reconciliation register + Pandit's PII discovery hook.
2. **§Operational specifications — Sub-module structure (Q2)**: monolithic; spawn-triggers named (UFO meta-category crystallisation; authority-retrieved-artefact provenance loss); Kendall four-way alternative held-as-live.
3. **§Operational specifications — Citation grain (Q3)**: per-property `dct:source` + per-overlay array for spanning leaves + round-trip-equivalence SPARQL test; section-level opt-in deferred.
4. **§Operational specifications — Class-promotion test (Q4)**: three-criterion test; Survey / EPC / Search / Valuation / Comparable as definite Class promotions; Building / Room held conditional.
5. **§Operational specifications — Per-leaf binding table (Q5)**: ODR-0011 §8a-named schemes as SKOS; non-§8a one-shot enums as `xsd:string + sh:in`; burden-on-proposer for SKOS expansion.
6. **§Operational specifications — Hierarchy admission (Q6)**: flat-default; named-consumer-query trigger + reasoner-independence test for any `rdfs:subPropertyOf` admission; SKOS broader/narrower for value-spaces.
7. **§Operational specifications — Overlay handoff (Q7)**: three boundary clauses (base 0..* cardinality; SKOS-union enum; advisory annotations to annotation graph) + three SHACL CI tests; cross-cite ODR-0010 + ODR-0013 three-rule interface contract.

ODR-0008 retrofit `implements: [ODR-0003, ODR-0007, ODR-0011, ODR-0017, ODR-0018]` (ADR-0007 generator dependency); `depends-on:` extends to ODR-0006/0007/0009/0010/0011/0012/0013/0015/0017/0018 (full TBox substrate now ratified).

**`status: proposed → accepted`** with `council: session-008` set. (The namespace block is cleared; the cardinality deferral is cleared; A9 discipline discharged.)

Downstream: **ODR-0008 is the seventh and final `kind: pattern` ODR** of the original 14-session plan to ratify. The plan is now **fully Council-cleared** at the ratification level. Remaining work: implementation programme (ADR-0007 generator → foundation.ttl + module .ttl emission → SHACL shapes → expected-report.ttl pairings → BASPI5 round-trip MVP gate); S016 stays deferred-until-trigger; Phase-3.5 audit ratified at Author-only (session-phase-3.5-audit).

## References

- **Anchor stub:** [ODR-0008](../ODR-0008-property-descriptive-attributes.md).
- **Substrate ODRs cited:** [ODR-0004](../ODR-0004-pdtf-ontology-foundation.md) §3a/§6a/§7a; [ODR-0005](../ODR-0005-property-land-identity-crux.md) §2a/§3a/§3b/§3c; [ODR-0006](../ODR-0006-agents-and-roles.md) Q1 Person/Org IC; [ODR-0007](../ODR-0007-transactions-and-lifecycle.md) Q1 Transaction Relator; [ODR-0009](../ODR-0009-claims-evidence-provenance.md) Q1-Q3 PROV-O backbone; [ODR-0010](../ODR-0010-overlay-profile-mechanism.md) §Q1/§Q6 + three-rule interface contract; [ODR-0011](../ODR-0011-enumeration-vocabularies.md) §8a seven-category UFO framework; [ODR-0012](../ODR-0012-data-governance-layer.md) §Phase 1 + §Q5 SHACL-AF; [ODR-0013](../ODR-0013-shacl-validation-and-severity.md) §Q1 severity + §Q7 interface; [ODR-0017](../ODR-0017-shacl-af-quality-rules-pattern.md) non-blocking quality rules pattern; [ODR-0018](../ODR-0018-dpv-class-level-coannotation-pattern.md) DPV class-level co-annotation.
- **ADR cross-corpus:** [ADR-0007 — Ontology generator specification](../../../adr/ADR-0007-ontology-generator-specification.md). ODR-0008 implementation depends on ADR-0007's emission discipline.
- **Working files (per-teammate positions):** `working/session-008/allemang-hendler.md`, `cagle-da.md`, `kendall-davis.md`, `guizzardi-baker.md`, `knublauch-pandit.md`.
- **Plan provenance:** [Council follow-up plan §S008](../../../plan/council-followup-sessions.md).
- **Data dictionary:** `source/00-deliverables/semantic-models/data-dictionary.md` — 1,557 unique leaves; 935 annotated. Per-leaf reconciliation walk is implementation-downstream of this Council ratification.
- **Adoption record update:** Track-record row appended to [adoption.md §Track Record](./adoption.md#track-record).
- **External published sources cited per teammate positions:** Allemang & Hendler *Semantic Web for the Working Ontologist* 3rd ed. Ch. 6/13/14; Hendler & Berners-Lee *Semantic Web Primer* 2nd ed. Ch. 5; Berners-Lee 2006 Linked Data Principles; Guizzardi 2005 *Ontological Foundations for Conceptual Modeling with Applications* Ch. 4 + §6.2; Masolo et al. 2003 *WonderWeb Library D18* §4.2/§4.3; SKOS Recommendation 2009; DCMI Singapore Framework 2008; Baker et al. 2013 *DCMI Usage Board Process and Tools*; Pandit & Polleres 2019 *DPV documentation* §Property-design; Bennett 2013 *FIBO*; Guarino & Welty 2002 *OntoClean*; Kendall & McGuinness 2019; Sheridan & Tennison 2010 *data.gov.uk cookbook*; Raimond et al. 2010 *BBC /programmes/*; Cagle, *The Ontologist* essays + *Working Ontologist* DA discipline; Hellmann et al. 2017 DBpedia release notes; W3C SHACL Recommendation §4 + SHACL-AF; DASH `dash:uniqueValueForClass`.
