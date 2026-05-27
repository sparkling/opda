# Plan — Council Follow-up Sessions for ODR-0002 … ODR-0014

> **Anchor:** [ODR-0003 — PDTF → Ontology: Programme & Work Breakdown](../odr/ODR-0003-pdtf-ontology-programme.md). This plan operationalises the work-breakdown in ODR-0003 §"Work breakdown" by attaching one Council session to each stub it links.
>
> One Linked Data Council session per ODR. Each session is an independent swarm,
> orchestrated under [ODR-0001](../odr/ODR-0001-linked-data-council-methodology.md), with
> a Queen, a Devil's Advocate, named experts in the standing panel (optionally
> augmented from the extended panel), 3–8 questions, and bidirectional linking
> between the ODR and the session transcript.
>
> Session 001 (which produced the present ODR-0003 anchor and its stubs 0004–0014)
> is the precedent. This plan ratifies and fleshes out those stubs through
> sessions 002–014, in dependency order, with explicit gates.

## 1. Scope and method

**What this plan does.** Operationalises the **research and improvement of the OPDA ODR corpus** through Council sessions — convening expert panels to ratify and flesh out each ODR's `## Rules` (the linked-data design decisions: identity criteria, vocabulary tiering, modelling conventions, validation patterns, etc.). Each session produces (a) a transcript with named-expert positions and per-question vote tallies; (b) an amended ODR with `status: accepted`; (c) a track-record row in the adoption record. The output is an *improved set of ODRs*, not implementation artefacts.

**What this plan does NOT do.** It does NOT produce Turtle files, SHACL shape libraries, generator code, JSON-LD contexts, or any other implementation deliverable. **Implementation is handled by a separate ADR programme** — each accepted ODR will trigger one or more implementation ADRs (under `docs/adr/`) that specify how the ratified modelling decision is realised in code and serialisation. The ODR ratification done here *unblocks* implementation; the implementation itself is downstream.

| This plan (Council sessions) | Separate ADR plan (implementation) |
|---|---|
| Ratifies ODR `## Rules` (design decisions) | Produces ADRs that engineer the realisation |
| Output: amended ODRs, transcripts, track record | Output: Turtle files, SHACL shapes, generator code, CI hooks |
| Corpus: `docs/ontology/odr/` | Corpus: `docs/adr/` |
| Authority: ODR-0001 Linked Data Council | Authority: project ADR conventions |
| Cross-corpus boundary per DCAP §"ODR/ADR boundary": ontology-modelling decisions are ODRs; schema-encoding decisions are ADRs |

**Current state.** This is OPDA's execution of the Linked Data Council methodology
(ODR-0001) — the Council Hive pattern, per ODR-0001's pattern lineage. Convened
sessions (Full / Reduced Council + Author-only amendments) live in the
[adoption record's track record](../odr/council/adoption.md#§track-record); that
is the authoritative session log.

### Execution status (2026-05-27 — **PLAN COMPLETE; WG namespace ratified; 13 ODRs accepted**)

**All 14 sessions of the original plan executed + WG namespace ratification + status sweep.** 11 Full+Reduced Council sessions + 3 Author-only pattern records + ODR-0017 §2a amendment landed inline at S013 + Session 003b (WG namespace) + ADR-0006 (engineering realisation). 6 `kind: pattern` ODRs cleanly discharge A9; 5 `kind: architecture` ODRs land. Two-artefact discipline EXPAND threshold satisfied; B2/B3 pilots ratified.

**Namespace block cleared (2026-05-27 via [Session 003b](../odr/council/session-003b-namespace-wg-decision.md) + [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md)):** WG ratified `https://w3id.org/opda/#` (W3C PICG-redirected to `https://openpropdata.org.uk/ontology/`). Status sweep moved 13 ODRs `proposed → accepted` through the `depends-on:[ODR-0004]` chain (ODR-0002/0004/0005/0006/0007/0009/0010/0011/0012/0013/0015/0017/0018). Exemplar bulk-update applied across 14 .ttl files.

**Outstanding (post-plan-complete) — see §"Outstanding work after plan completion" below:** S008 deferred-on-cardinality; S016 deferred-until-trigger; Phase-3.5 audit; w3id.org redirect PR (asynchronous engineering); BASPI5 round-trip MVP demonstration.

---


**Sessions executed this programme cycle** (full detail in [adoption.md §Track Record](../odr/council/adoption.md#track-record); session transcripts under [`docs/ontology/odr/council/`](../odr/council/)):

| Phase | Session | Format | Queen | DA | Outcome |
|---|---|---|---|---|---|
| Pre-Phase | A9 — Gandon-vs-Guizzardi methodology gap | Reduced Council | Kendall | Guarino (withdrew) | 2-1 BOTH-WITH-BOUNDARY at the `kind` enum. ODR-0001 amended with §What an ODR records (per-kind discipline) — for `kind: pattern \| mapping`, MUST state UFO/DOLCE category + IC over named hard cases + artefact realisation; `methodology`/`architecture`/`programme` relaxed. Gandon's artefact identity test adopted as operational supplement for `pattern` extraction. |
| 0 | S003 — ODR-0003 programme anchor | Author-only | Kendall | — | ODR-0003 moves `proposed → accepted` (council: session-003). Phase ordering authority, default-vs-fast-path option, retirement criterion, status-discipline bidirectional-update protocol, shared-question routing all recorded into `## Rules`. |
| 0 | S002 — ODR-0002 vocabulary catalogue (absorbs retired S014) | Full Council | Baker | Cagle (full withdrawal on 12/13 questions; partial on Q2) | 12 questions land 8-1 or 9-0 with operational checks adopted; Q11 OBO RO defers 5-2-2 with Kendall + Guizzardi held-as-live positions routed to ODR-0005. New `## Rules` subsections: Promotion and demotion criteria (four-condition Conditional→Core); Profile-pinning ownership (module-owner-proposes); Reference-not-import (normative) + three-value `adoption-mode` field. New Conditional-table columns (W3C status, Adoption mode, Profile pin). Per-question Change Log rows for Q7-Q13 codifying named-event triggers (OWL-Time demotion; DCAT promotion; SSSOM re-open; ODRL activation; cred/did activation). `status: proposed` retained per Scope-Check 1 Q4 framing. |
| 1 | S004 — ODR-0004 Foundation (Phase 1 gate) | Full Council | Gandon | Knublauch (extended panel; full withdrawal on all 4 primary attacks) | 7 questions × 9-0 with all DA withdrawal conditions met. New §Operational specifications subsections 3a/6a/7a/8a — three-graph source-graphs + derived-consumer-profiles + five-part CI test (Q3); deterministic generator emission + version-pin + byte-identity CI + diff-explosion canary tests (Q5); five-line term-sourcing precedence + conflict-recording protocol + version-IRI pinning (Q4); exemplar `expected-report.ttl` pairing + parent-repo storage discipline (Q6). New `## Consequences` entries on namespace-as-blocker and `w3id.org/opda/` alternative. **ODR-0004 stays `status: proposed`** per Knublauch DA primary demand. |
| 2 | **S005 — ODR-0005 Property & Land Identity Crux (Phase 2 gate; B2 pilot)** | **Full Council; `consensus-mode: hive-mind/byzantine`** | **Guarino** | **Allemang (full withdrawal on all 8 questions)** | **First `kind: pattern` ODR to discharge under A9 per-kind discipline.** Q1 9-0 FOR Endurant + Substance Kind for three classes (Property + LegalEstate + RegisteredTitle); Q2 9-0 FOR spatial-material continuity with Kendall+Davis legal-record-discontinuity-override hybrid; Q3 9-0 FOR distinct ICs (LegalEstate rights-bundle + RegisteredTitle title-number lineage); Q4 9-0 FOR both (SHACL/DASH operational + PROV-O contingent) + Cagle SHACL-AF succession-chain materialisation rule; Q5 **6-2-1 FOR 3-class** (Davis + Cagle held-as-live dissent preserved with named re-open triggers); Q6 9-0 FOR routing Address to ODR-0015 with DPV-pattern-consideration constraint; Q7 9-0 PASS with per-exemplar verdict walkthrough; Q8 9-0 FOR deliberative gate clearance. ODR-0005 amended: §Decision rewritten for 3-class; new §Operational specifications 2a/3a/3b/3c/6a/6b/7a/8a; §Consequences updated for downstream inheritance. **ODR-0005 stays `status: proposed`** per inherited ODR-0004 namespace block; `council: session-005` set. Guarino S001 Q4 dissent WITHDRAWN. Downstream: ODR-0006/0007/0015 unblocked; **ODR-0008 deferred** until cardinality crystallises (Kendall+Davis joint amendment). **B2 pilot verdict: EXTEND CAUTIOUSLY** to S015 + S011 Q8 (three-pilot threshold for EXPAND). |
| 2.5 | **S011 — ODR-0011 Enumeration Vocabularies (Phase 2.5 substrate; B3 pilot Q8)** | **Full Council, substrate mode; `consensus-mode: hive-mind/typed-output` for Q8; two-artefact discipline (third pilot site)** | **Isaac/Miles (extended)** | **Gandon (2 withdrew / 5 conceded; full DA withdrawal)** | **Third `kind: pattern` ODR to discharge under A9 (at the scheme level).** Q1-Q4 + Q6-Q7 unanimous; Q5 4-0 FOR three-case lifecycle discipline (Gandon DA mild attack withdrawn) + Cagle SHACL-AF deprecation-chain rule re-instantiating ODR-0005 §6a (fourth citing site); Q8 (B3 typed-output) 4-0 FOR seven-category UFO framework (4 original Scope-Check 1 Q3 categories + 3 Council-authored extensions: Quality Region, Substance Kind label, Quality Value) with dual `dct:source` (upstream UFO/DOLCE + ODR-0011 SKOS-binding). Q3 cross-vocabulary mapping deferred to Phase-3.5 audit. **status:proposed retained** per namespace block. **B3 pilot third-site EXPAND threshold satisfied** — two-artefact discipline becomes default across remaining sessions; session-level pilot consensus-mode labels (B2/B3) retired. **`pattern`-extraction spawn-rule fires** for SHACL-AF non-blocking-data-quality-rules pattern (fourth citing site reached). |
| 2.6 | **S015 — ODR-0015 Address & Geography (Phase 2.6 gate)** | **Reduced Council; two-artefact discipline (B2-pilot second site)** | **Guizzardi** | **Allemang (5 withdrawn / 3 conceded / 1 held-as-live on Q3)** | **Second `kind: pattern` ODR to discharge under A9.** Q1 3-0 FOR `opda:Address` as UFO Substance Kind / DOLCE NonPhysicalEndurant (**revises S005 Q6 Mode-only stance** on exemplar evidence + external-standards alignment); Allemang DA withdrew on 3 named consumer queries + DPV class-level dispatch SHACL case. Q2 3-0 FOR five-rule IC. Q3 **2-1 FOR class with property shapes**; **Allemang DA held-as-live dissent** with named re-open trigger ("18 months / zero multi-Property-shared-Address cases / no new consumer query"). Q4-Q8 3-0; ODR-0015 amended new §Operational specifications 2a/3a/3b/4a/5a/6a/7a/8a. **status:proposed retained** per namespace block. Downstream ODR-0006 + ODR-0008 unblocked. |
| 3a | **S006 — ODR-0006 Agents & Roles (Phase 3a gate)** | **Full Council** | **Guizzardi** | **Allemang (3 withdrew / 3 conceded / 1 held-as-live on Q6 Org Ontology depth)** | **Fourth `kind: pattern` ODR to discharge under A9.** Q1 10-0 FOR Person/Org as Substance Kinds + FIBO multi-identifier IC + plural-regulator-citation + property-level DPV + Cagle SHACL-AF identifier-succession (**ODR-0017 5th citing site**); Q2 10-0 FOR RoleMixin (DA withdrew on conveyancing-engagement query); Q3 10-0 FOR Proprietorship as UFO Relator (DA withdrew on HMLR open-register dereferenceability); Q4 10-0 FOR two-predicate Capacity/Authority bounded-context seam (Evans+Vernon load-bearing) + Cagle three-tier severity match rule (**ODR-0017 6th citing site candidate**); Q5 10-0 CONCEDE to ODR-0015; **Q6 9-1 FOR `rdfs:subClassOf org:Organization`** with Allemang DA held-as-live + 18-month re-open trigger; Q7 10-0 CONCEDE to ODR-0011 §8a Phase label. ODR-0006 retrofit `implements: [ODR-0003, ODR-0017, ODR-0018]` + depends-on extends to ODR-0015. **status:proposed retained**. |
| 3b | **S007 — ODR-0007 Transactions & Lifecycle (Phase 3b)** | **Full Council** | **Guizzardi** | **Davis (2 withdrew / 4 conceded / 1 conceded-with-watch on Q7 OWL-Time scope-creep)** | **Fifth `kind: pattern` ODR to discharge under A9 — 5-of-5 clean.** Q1 10-0 FOR Transaction-as-Relator (FIBO `Arrangement` precedent); Q2 10-0 FOR hybrid PROV-O instants+intervals; Q3 10-0 CONCEDE Phase label; Q4 10-0 FOR dual-mechanism chain modelling (DA PRIMARY ATTACK withdrew on three named consumer queries); Q5 10-0 FOR lease-term `time:ProperInterval` + **ODR-0017 7th citing site** (LeaseTermSuccessionRule); Q6 10-0 FOR PROV-O Plan-vs-Activity + **ODR-0017 8th citing site candidate** (MilestoneVarianceRule); Q7 10-0 FOR OWL-Time Core+Duration profile. ODR-0007 retrofit `implements: [ODR-0003, ODR-0017]`. **status:proposed retained**. |
| 4 | **S009 — ODR-0009 Claims, Evidence & Provenance (Phase 4 lead)** | **Full Council** | **Moreau (PROV-O editor, extended)** | **Guarino (6 conceded / 2 withdrew on §Rules-text amendments)** | **Sixth `kind: pattern` ODR to discharge under A9 — 6-of-6 clean.** Q1 10-0 CONCEDE 80%/5-residue (Moreau S001 framing ratified); Q2 10-0 FOR qualified attribution; Q3 10-0 FOR Quality Region + DA withdrew on §Rules "PROV-O is derivation; assurance is regulated judgement; not derivable from PROV-O traversal"; Q4 10-0 FOR `opda:digest` + algorithm SKOS scheme + Pandit integrity-vs-signature caveat; Q5 10-0 FOR dual modelling (DA withdrew on `dct:conformsTo` primacy); **Q6 fourth citing site of class-level DPV co-annotation pattern → spawn-rule fires for ODR-0018**; **Q7 ODR-0017 9th citing site** (VerificationActivitySuccessionRule); Q8 10-0 DEFER to ODR-0016. ODR-0009 retrofit `implements: [ODR-0003, ODR-0017, ODR-0018]`. **status:proposed retained**. |
| 4 | **S012 — ODR-0012 Data-Governance Layer (Phase 4 follow)** | **Full Council** | **Pandit (DPV CG chair)** | **Kendall (5 conceded / 2 withdrew on §Rules-text amendments)** | `kind: architecture` ODR (relaxed A9). Q1 10-0 FOR curated set + Baker steward; **Q2 10-0 — Pandit's S001 dissent VINDICATED** via reference-not-import per ODR-0018 (Kendall DA condition met); Q3 10-0 FOR Article-10 special-category depth + Cagle `sh:Violation` SHACL + Baker SpecialCategoryScheme; Q4 10-0 FOR ODRL deferral with **three named activation triggers** (Phase-2 VC; TF policy; consumer regulatory); **Q5 10-0 FOR Cagle PIIWithoutDPVCoAnnotation SHACL-AF rule — ODR-0017 10th citing site**; Q6 10-0 DEFER to ODR-0016; Q7 10-0 SETTLED per ODR-0009 + ODR-0018. ODR-0012 retrofit `implements: [ODR-0003, ODR-0017, ODR-0018]`. **status:proposed retained**. |
| 5 | **S010 — ODR-0010 Overlay Profile Mechanism (Phase 5)** | **Reduced Council** | **Knublauch (SHACL extended)** | **Guarino (7 conceded / 1 withdrew on Q1 UFO Substance Kind §Rules amendment)** | `kind: architecture` ODR. **Q1 10-0 5-property `opda:ValidationContext` reification + UFO Substance Kind commitment** discharging S001 Q5 concession fully. Q2-Q5 10-0. **Q6 no-identity-override SHACL meta-shape at `sh:Violation` — ODR-0017 11th citing site triggers §2a amendment** (admit `sh:Violation` for meta-shape-over-shape-graph; landed inline at S013). Q7 BASPI5 round-trip as MVP gate. Q8 three-rule interface contract with ODR-0013 (Cagle Scope-Check 1 Q6). ODR-0010 retrofit `implements: [ODR-0003, ODR-0017]`. **status:proposed retained**. |
| 6 | **S013 — ODR-0013 SHACL Validation & Severity (Phase 6 CLOSING)** | **Full Council** | **Knublauch (SHACL+DASH extended)** | **Cagle (5 conceded / 1 withdrew on Q4 PRIMARY VIGILANCE)** | **Fifth and final `kind: architecture` discharge** (after ODR-0001/0003/0004/0012/0010). **Q1 10-0 four-tier severity framework with FIVE `sh:Violation` categories** (identity-key missing / IC breach / no-identity-override / special-category PII without lawful-basis / **meta-shape-over-shape-graph drift per ODR-0017 §2a NEW amendment**). **ODR-0017 §2a AMENDMENT LANDED INLINE in ODR-0013 §Rules** (narrow scope; data-graph sh:Violation-NEVER floor preserved). Q2-Q3 CONCEDE. **Q4 Cagle DA PRIMARY VIGILANCE WITHDREW** on aiHint exile cross-cite. Q5 two-layer reporting. Q6 Knublauch composition + ODR-0010 Q6 enforcement. **Q7 three-rule interface contract cross-cite operationalised** (Cagle Scope-Check 1 Q6 amendment). ODR-0013 retrofit `implements: [ODR-0003, ODR-0017]` + depends-on extends to all 11 prior ODRs. **status:proposed retained**. **THE PLAN IS COMPLETE.** |
| Author-only | **ODR-0001 EXPAND amendment** | Author-only | Henrik | — | Records two-artefact discipline (narrative + structured tally + DA scorecard mechanical-check) as DEFAULT across all Full + Reduced Council sessions; B2/B3 session-level consensus-mode labels retired; underlying modes retained as operational tools. §Format tiers / §Session document conventions amended. |
| Author-only | **ODR-0017 SHACL-AF Non-Blocking Data-Quality Rules Pattern spawn** | Author-only | Henrik | — | Spawned per A9 §Artefact identity test fourth-citing-site threshold. UFO Method/plan code + IC over 5 hard cases + Turtle template in `opda-shapes.ttl`. Initial citing sites: ODR-0005 §6a + ODR-0009 §Q7 + ODR-0015 §4a + ODR-0011 §5a. Citing-site count grew to 11 confirmed across S005/0006/0007/0009/0011/0015 + ODR-0010 §Q6 (with §2a amendment landed inline at S013). |
| Author-only | **ODR-0018 DPV Class-Level Co-Annotation Pattern spawn** | Author-only | Henrik | — | Spawned per S009 Q6 fourth-citing-site fire. Class-level `dpv-pd:hasPersonalDataCategory` baseline + variant-conditional refinements via mapping tables consumed by ODR-0012 at generation time. Four citing sites: ODR-0005 §3c + ODR-0015 §7a + ODR-0006 §Q1+Q4 + ODR-0009 §Q6. ODR-0012 is canonical authoring authority (consumed at S012). UFO Quality category. |
| Author-only | **ODR-0010 §References reciprocal cross-cite** | Author-only | Henrik | — | Post-S013 housekeeping. Pair S013 Q7 three-rule interface contract on the ODR-0010 side. ODR-0013 owns rules; ODR-0010 §Q6 inherits and enforces via SHACL meta-shape at `sh:Violation`. |

**Council Phases 1 / 2 / 2.5 / 2.6 / 3a / 3b / 4 / 5 / 6 all cleared AND formally closed.** WG ratified namespace `https://w3id.org/opda/#` on 2026-05-27 via [Session 003b](../odr/council/session-003b-namespace-wg-decision.md) + [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md); 13 downstream ODRs flipped `proposed → accepted` through the `depends-on:[ODR-0004]` chain. Outstanding WG items reduced to versioning scheme + hash-vs-slash reopening trigger (non-blocking).

### Open WG decisions (blockers on `status: accepted`)

These items moved from "pending Council deliberation" to "pending OPDA Working Group decision". Each blocks one or more downstream ratifications.

1. **Namespace string for `opda:`** — WG MUST ratify before ODR-0004 moves `proposed → accepted`. Three candidates ratified at S004 Q7 for WG consideration: `https://opda.uk/ns/` (institutional namespace; 7 voices); **`https://w3id.org/opda/` (operationally-strongest alternative; W3C PICG persistence guarantee — recorded by Knublauch DA primary demand)**; `https://trust.propdata.org.uk/ontology/` (rejected on programme-namespace-coupling grounds; no champion). Downstream module ODRs (S005, S006, S008, S010, S013) carry `depends-on: [ODR-0004]` and inherit the block.
2. **Hash-vs-slash reopening threshold** — WG SHOULD record a concrete reopening trigger ("at scale criterion X, revisit hash-vs-slash"). Suggested: any single ontology file > 1,000 terms in active dereference traffic OR named consumer requests per-term content negotiation. Non-blocking; deferred recordkeeping.
3. **MVP fast-path vs default sequence** (per §5.1) — WG chooses at start of Phase 1. Default sequence presumed unless WG selects fast-path explicitly. Recorded by an Author-only Session 003b when the WG decides.
4. **OPDA Trust Framework vs other regulatory authorities** — S004 Q4 five-line term-sourcing precedence places the OPDA TF as authoritative within scope; other regulatory authorities (FCA, ICO, HMLR, EU eIDAS) are contextual (`skos:scopeNote`). WG SHOULD ratify the OPDA TF's authoritative scope in writing so downstream `pattern` ODRs (S009, S012) inherit a stable precedence.

### Open items routed forward

These items were recorded during execution but routed to a named downstream session for adjudication rather than re-litigated here:

- **OBO RO admission** — S002 Q11 deferred 5-2-2 with named re-open trigger (an OPDA SPARQL query produces a wrong answer under `dct:isPartOf` that `ro:part-of` would correct, OR ODR-0005's IC discipline requires well-founded mereology unreachable via `dct:isPartOf` + `opda:` local predicates). Routed to ODR-0005's IC-discipline session (S005). Kendall + Guizzardi held-as-live positions preserved verbatim.
- **`opda:ValidationContext` reification** (Session 001 Q5 carry; reaffirmed by S004 Q3 Knublauch DA position) — `pattern`-extraction candidate per A9 §Artefact identity test (re-instantiable across SHACL profile artefacts). Routed to ODR-0010 / ODR-0013 ratification sessions (S010 / S013) for extraction decision.
- **Pandit's `dpv-pd` bundled-import divergence** (S002 Q4) — `slice-import` discipline at the catalogue level; module-level decision deferred to ODR-0012 (S012) where the lawful-basis class vocabulary surfaces.
- **Davis Q1/Q5/Q6 held dissents** from Scope-Check 2 (B5 / B6 / B7) — preserved in §9 risks. Pilot retire-or-extend evaluations (B2 = S005 close; B3 = S011 Q8 close) test whether the pilots vindicate Davis's "ceremony pays every session; benefits speculative" position or the panel's selective-adoption verdict.
- **`odr-review` lint updates** — two deferred to next skill release: (i) A9 per-kind discipline check (Lint 4 enhancement — for `kind: pattern | mapping`, verify `## Rules` names UFO/DOLCE category AND IC over named hard cases; warning on `proposed`, blocker on `accepted`); (ii) S004 Q2 URI-shape verification (lint reads `kind: pattern` ODRs' UFO commitments and verifies URI CamelCase form matches layer convention). Both flagged in the respective transcripts.

### Outstanding work after plan completion

All sessions of the original 14-session plan are executed. The items below are the remaining work — none are blocked by Council deliberation; each waits on an external trigger (WG decision, schema-mapping budget, named consumer, or implementation cycle).

#### Council sessions outstanding

| Session | Status | Trigger / blocker | Notes |
|---|---|---|---|
| **S008 — ODR-0008 Property Descriptive Attributes** | **DEFERRED** on cardinality | 935-leaf-to-class mapping work begins (Kendall+Davis S005 Q5+Q8 joint amendment) | 3-class commitment is now operationally crystallised across S006/S007/S009/S010/S013. Quale-in-Region framework from ODR-0011 §8a staged for descriptive schemes (councilTaxBand / currentEnergyRating / builtForm / ownershipType). Substance Kind label scheme staged for tenureKind. May convene when the descriptive-attributes mapping work is scoped. |
| **S016 — ODR-0016 W3C VC / DID Compatibility Layer** | **DEFERRED until trigger** | Per Scope-Check 1 Q7c: S009 Q8 VC-side decision OR S012 Phase-2 consent receipts OR named wallet/DID consumer entering scope | `cred:` / `did:` admitted to ODR-0002 Defer tier with activation pointer here. Format-when-activated: Full Council with `vc-extended` panel (Sporny + Reed). |
| **Phase-3.5 audit session** | Post-MVP | After downstream module work surfaces real cross-vocabulary mapping needs | Q3 cross-vocabulary mapping (S011 deferral) + SSSOM re-open trigger (S002 Q11 — when external mapping work to FIBO / INSPIRE / Land Registry RDF surfaces). Author-only or Reduced Council. |

#### Open WG decisions (block `status: accepted` move; no Council remit)

| Decision | Block scope | Notes |
|---|---|---|
| ~~**`opda:` namespace string**~~ | ~~ALL ratified ODRs hold `status: proposed` until ratified~~ | **RESOLVED 2026-05-27** ([Session 003b](../odr/council/session-003b-namespace-wg-decision.md) + [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md)). WG ratified `https://w3id.org/opda/#` per Knublauch S004 DA primary demand (W3C PICG persistence; DPV precedent). 13 ODRs flipped `proposed → accepted` through `depends-on:[ODR-0004]` chain. |
| **Hash-vs-slash reopening threshold** | Non-blocking | WG SHOULD record concrete reopening trigger (suggested: any single ontology file > 1,000 terms in active dereference traffic OR named consumer requests per-term content negotiation). |
| **MVP fast-path vs default sequence** (per §5.1) | Programme-level | Plan §5 default sequence presumed; WG may select §5.1 fast-path. Author-only Session 003b records the WG decision. With the plan now COMPLETE, this decision is largely moot — default sequence was executed in full. |
| **OPDA Trust Framework authoritative scope** | Downstream `pattern` ODRs (already executed) | S004 §7a precedence places OPDA TF as authoritative within scope; other regulators contextual. WG SHOULD ratify the TF's authoritative scope in writing for the audit trail. Already operationally honored in ODR-0009 Q5 + ODR-0012 Q2. |

#### Implementation milestones outstanding

| Milestone | Status | Reference |
|---|---|---|
| **BASPI5 round-trip MVP demonstration** | Pending implementation | ODR-0003 §Rules MVP gate + ODR-0010 Q7 ratification. When BASPI5 loads + validates + regenerates form using the ratified stack, the methodology has demonstrated end-to-end coherence across all 11 prior ODRs. This is the operational pressure-test for the entire ratification programme. |
| **`opda:` foundation.ttl + module .ttl files emission** | Pending implementation | Generator-first per ODR-0004 §6a; byte-identity CI test per §6a #2. The ratified ODR corpus becomes operational when the generator emits Turtle artefacts. |
| **`expected-report.ttl` exemplar pairings** | Pending implementation | Per ODR-0004 §8a; pairs each diagnostic exemplar with the SHACL validation report it should produce. Lands when SHACL shapes graph crystallises. |
| **Exemplar amendments scheduled at S005/S015/S007** | Pending Author-only | Refactor exemplars 1+2 to manifest LegalEstate (S005 Q7); refactor flat-no-uprn and rural-plot-inspire exemplars to Address resource shape (S015 Q8); refactor simple-transaction-with-milestones to PROV-O Plan-vs-Activity (S007 Q6). Mechanical edits. |
| **`odr-review` lint extensions** | Pending next skill release | (i) A9 per-kind discipline check (Lint 4 enhancement); (ii) S004 Q2 URI-shape verification; (iii) ODR-0017 §1a SHACL-AF template + severity-tier verification; (iv) ODR-0018 §3a DPV co-annotation placement (annotation graph only). |

#### Held-as-live dissents preserved (re-open triggers)

These dissents passed Council ratification with named falsifiable re-open conditions:

| Dissent | Held by | Session | Re-open trigger |
|---|---|---|---|
| 2-class with `RegisteredTitle ⊑ LegalEstate` (upgradeable) | Davis | S005 Q5 | Downstream sessions surface a case where 3-class is operationally net-negative against the BASPI5 round-trip. |
| 2-class with commonhold-spawn-rule | Cagle | S005 Q5 | Commonhold exemplar surfaces → §6 spawn rule fires → ODR-0005a/0005b. |
| Address-as-structured-datatype reverter | Allemang DA | S015 Q3 | 18 months / zero multi-Property-shared-Address cases from PDTF v3 AND no consumer query requires Address-as-resource graph identity beyond S015 Q1. |
| Q6 W3C Org Ontology depth | Allemang DA | S006 Q6 | 18 months / no consumer queries exercise Org Ontology machinery beyond class declaration → downgrade `rdfs:subClassOf` to `dct:source` reference. |
| Q2 RoleMixin distinction (formally withdrawn but recorded) | Allemang DA | S006 Q2 | 18 months / no named consumer query distinguishes RoleMixin from parallel sortal Roles. |
| Q7 OWL-Time scope-creep watch | Davis DA | S007 Q7 | Any proposed expansion beyond Core+Duration requires named consumer using the additional machinery. |
| PROV-O ≠ assurance line | Guarino DA | S009 Q3 | 18 months / downstream ODRs treat PROV-O derivation history as the regulator's assurance judgement → S009 re-opens to tighten §Rules text. |
| Davis Q1/Q5/Q6 from Scope-Check 2 (B5/B6/B7) | Davis | Scope-Check 2 | Preserved in §9 risks. Pilot retire-or-extend evaluations at S005/S011/S015 close vindicated the panel's selective-adoption verdict; Davis's dissent stays methodologically recorded. |
| Hendler on S002 Q4 ODR-0014 retirement | Hendler | Scope-Check 1 Q4 | "Every governance act stays permanently." Routed to ODR-0001 amendment queue (not actioned). |

**Scope.** ODR-0002 … ODR-0016 — fifteen records that emerged from session-001,
Scope-Check 1, and Scope-Check 2 as planning stubs or spawned/named records.
Session-001 itself stays the inaugural transcript;
ODR-0001 (methodology) is `accepted` and is amended only through its own
self-amendment process (§Self-amendment process in ODR-0001).

**Authority.** This plan is the **source of truth for session sequencing**
(§5) and the **shared-question routing** (§4.1). Session 003 (author-only)
records the plan's choices into ODR-0003's `## Rules` so the anchor and
the plan stay coherent. If a substantive re-cut surfaces during
implementation, it lands as an amendment to *both* this plan and ODR-0003
in the same commit. Sessions do not unilaterally re-sequence — the plan's
phase order is binding until amended.

**Project context.** OPDA-specific adoption decisions (panel weighting,
pre-elected extended panel, governance handoff, track record, project-
specific when-to-use additions, council directory path) live in the OPDA
adoption record at
[`docs/ontology/odr/council/adoption.md`](../odr/council/adoption.md).
The methodology itself (ODR-0001) is project-agnostic; the adoption
record is OPDA's specific instantiation.

**Scope-Check history.** Two programme-level meta-Councils have run:

- [Scope-Check 1](../odr/council/scope-check-1-programme.md) (2026-05-26) — programme cut review. 8-1 APPROVE with nine amendments (A1–A9) reflected throughout this plan: retire ODR-0014; spawn ODR-0015; name deferred ODR-0016; DPV co-annotation authorship moved to 0012; ODR-0011 UFO meta-category per scheme; ODR-0010/0013 three-rule cross-cite; defer 0008 split; six termination signals (§5 gate check); Gandon-Guizzardi methodology gap routed to **Session A9** (pending — see Pre-Phase blueprint in §5).
- [Scope-Check 2](../odr/council/scope-check-2-hive-vs-swarm.md) (2026-05-26) — methodology-tooling review (hive-mind vs Agent fan-out). 5-1 SELECTIVE with eight amendments (B1–B8): B1 (consensus-mode framework) landed in ODR-0001 via direct amendment 2026-05-27; B2/B3 pilots unblocked (S005 hive-mind/byzantine; S011 Q8 hive-mind/typed-output); B4 wholesale deferred to post-pilot evaluation; B5 Byzantine framing rejected programme-wide (reframe: structural vote acknowledgement); B6 markdown persistence default; B7 Davis Q1/Q5/Q6 held dissents preserved (§9); B8 retire-or-extend evaluation per pilot at session close.

**Output per session.**

1. A transcript at `docs/ontology/odr/council/session-NNN-<slug>.md` conforming
   to ODR-0001 §"Session document conventions".
2. Per-teammate position files in `docs/ontology/odr/council/working/session-NNN/<teammate>.md`
   (subdirectory per session to avoid the flat-`working/` collision the session-001
   layout would otherwise force after multiple sessions).
3. An amended ODR at `docs/ontology/odr/ODR-NNNN-*.md` with:
   - `status: accepted` (or `superseded` if the session retires the stub in favour
     of a new ODR — see §6 for the spawn-rule),
   - `council: session-NNN` set in frontmatter,
   - `## Rules` fleshed out from the session's verdicts,
   - `## References` linking the session transcript and any spawned ODRs.
4. The session document's track-record row added to ODR-0001's "Track record"
   table.

**ODR template.** Each ODR continues to follow the `odr-create` skill template
(the six-section ODR format spec'd in [DCAP.md](../odr/DCAP.md) — `## Context`,
`## Decision`, `## Rules`, `## Alternatives`, `## Consequences`, `## References`).
Sessions do not change the template; they change the *content* of `## Rules`
and the supporting sections.

**Swarm topology.** Per ODR-0001 §"Roles for every session", a session is a
hive-mind with a queen, a devil's advocate, and the remaining panel. Implementation:
named teammates spawned via Claude's Agent tool (`run_in_background: true`),
each with its own context window and writing one position file. The Queen
runs last and synthesises. This is the same shape as session-001.

```
ToolSearch → load Agent / TaskCreate / SendMessage
TaskCreate per-session task list (queen, DA, 4–6 panel teammates, synthesis)
Agent fan-out → teammates write working/session-NNN/<slug>.md in parallel
Agent (queen) → reads working/, writes session-NNN-*.md + amends the ODR
```

Use `mcp__ruflo__hive-mind_spawn` (ADR-0115 carve-out) **only for the two
pilot sessions ratified by Scope-Check 2 (B2 = S005; B3 = S011 Q8)**; all
other sessions use Agent fan-out. The consensus-mode substrate is ratified
in ODR-0001 (2026-05-27 amendment); pilots are unblocked. The "byzantine
voting" framing in the original carve-out is **superseded by Scope-Check 2
B5** — the relevant property is **structural vote acknowledgement**, not
Byzantine fault tolerance. The amended ODR-0001 carries this clarification;
CLAUDE.md may still say "byzantine voting" until updated separately —
ODR-0001's reading is now canonical.

**Bidirectional linking** is checked by review per ODR-0001 §Session document conventions.

**Session format tiers** (Full Council / Reduced Council / Author-only) are defined in ODR-0001 §Format tiers. Each session below names its tier; track record lives in the [adoption record](../odr/council/adoption.md#§track-record).

**Cross-talk transport.** Default is queen-composed (per ODR-0001 §Cross-talk transport). For the S009→S012 amendment loop (DPV co-annotation supersession-scope), `SendMessage` via Agent Teams is the recommended transport — workers must respond to peer claims before settling. Other sessions use queen-composed unless the convening Queen documents otherwise.

**Substrate operations** (calling convention; sub-queen escalation for hierarchical-mesh) are governed by ODR-0001 §Substrate operations.

**Multi-day sessions.** Default presumption: one-sitting sessions. If a session genuinely spans days, use the resumability mechanism per ODR-0001 §Multi-day sessions and resumability — `hive-mind sessions checkpoint/export/import` + `resume`. Each resume cycle recorded in the synthesis.

## 2. Standing panel and per-session role allocation

The standing 9 (ODR-0001 §"Standing Panel") and the extended-panel guests
(ODR-0001 §"Extended Panel") are the only experts available. **No invented
experts; no generic "a SHACL expert" framings.** Per-session allocation is
chosen to maximise the chance of a genuine split and to put the deepest
expertise nearest the question.

Queen and Devil's Advocate are named explicitly. The DA is chosen to be the
strongest *credible* opponent of the framing the stub currently carries — not
a strawman.

| Session | ODR | Queen | Devil's Advocate | Extended-panel guests |
|---|---|---|---|---|
| 002 | 0002 Vocabulary catalogue | Tom Baker (DC; vocabulary governance) | Kurt Cagle (challenge admission criteria) | — |
| 003 | 0003 Programme & work-breakdown (anchor) | Elisa Kendall (FIBO modular programmes) | Ian Davis (publish-first, scope discipline) | — |
| 004 | 0004 Foundation (URI / graph separation) | Fabien Gandon (RDF standards; namespace) | Holger Knublauch (challenge graph separation in practice) | Knublauch (extended) |
| 005 | 0005 Property identity **CRUX** | **Nicola Guarino** (his outstanding objection from session-001) | Dean Allemang (pragmatic working-ontologist push-back) | Guizzardi (essential) |
| 006 | 0006 Agents & Roles | Giancarlo Guizzardi (UFO Kind/Role/Phase/Relator) | Dean Allemang (challenge UFO over-modelling) | Eric Evans / Vaughn Vernon (capacity boundary) |
| 007 | 0007 Transactions & Lifecycle | Giancarlo Guizzardi (Transaction-as-Relator) | Ian Davis (keep it minimal — publish-first) | Luc Moreau (PROV-O / OWL-Time intersection) |
| 008 | 0008 Property descriptive attributes | Dean Allemang (declare-once-reconcile-overlays) | Kurt Cagle (challenge reconciliation overhead) | — |
| 009 | 0009 Claims, Evidence & Provenance | **Luc Moreau** (PROV-O — owns) | Nicola Guarino (PROV-O ≠ assurance) | Pandit (DPV co-annotation), Iannella (ODRL) |
| 010 | 0010 Overlay Profile Mechanism | **Holger Knublauch** (SHACL profiles — owns) | Nicola Guarino (build-config ≠ ontological status) | Cagle (overlay traceability) |
| 011 | 0011 Enumeration Vocabularies | Antoine Isaac / Alistair Miles (SKOS — extended) | Fabien Gandon (when SKOS-vs-OWL matters) | Isaac/Miles (extended) |
| 012 | 0012 Data-Governance Layer | **Harshvardhan Pandit** (DPV — owns) | Elisa Kendall (reference-not-import; keep TBox lean) | Iannella (ODRL deferral) |
| 013 | 0013 SHACL Validation & Severity | **Holger Knublauch** (SHACL + DASH — owns) | Kurt Cagle (aiHint exile from session-001) | — |
| 014 | 0014 Vocabulary catalogue amendments | Tom Baker (continuity with ODR-0002) | Ian Davis (defer-list discipline) | — |

Where an expert "owns" a topic in session-001 (Knublauch on Q5, Moreau on Q6,
Pandit on DPV), that ownership transfers to the follow-up session's Queen role.

## 3. Teammate composition (agent topology)

Session-001 used six teammates carrying twelve expert voices — pairs/trios
where positions are likely to align on most questions, splitting only where
genuine fault lines surface. Follow-ups inherit the pattern with per-session
adjustments. The default shape is **5–6 teammates per session**.

Default teammate buckets (used unless a session table overrides):

| Teammate | Standing-panel voices |
|---|---|
| `pragmatic-pair` | Dean Allemang; Jim Hendler |
| `enterprise-pair` | Elisa Kendall; Ian Davis |
| `formal-pair` | Fabien Gandon; Giancarlo Guizzardi |
| `governance-pair` | Tom Baker; Harshvardhan Pandit |
| `shacl-solo` | Kurt Cagle (+ Knublauch when extended) |
| `da-solo` | The named Devil's Advocate, alone |

Per-session deviations are recorded in §4. The Queen sits inside whichever
pair carries her standing-panel voice and is marked `(Queen)` in the session
transcript; the DA is always `da-solo` to guarantee her objections are
context-isolated from the rest of the panel.

## 4. Per-session blueprints

Each blueprint is a contract for the session: input documents, questions
(3–8 per ODR-0001), expected verdict shape, and the amendments the session
must produce in the ODR. **Questions are the slot the Queen owns** — she may
refine them before convening — but the listed questions are the minimum that
must be resolved for the ODR to leave `proposed`.

### 4.1 Shared questions across sessions

Several questions surface in more than one session. To avoid two sessions
producing conflicting verdicts on the same underlying decision, each shared
question is *owned* by one session; downstream sessions inherit. If a
downstream session genuinely needs to deviate, it records the deviation as a
`## Supersession scope:` amendment on the owning ODR's `## Rules` and the
amendment flows back.

| Shared question | Owner | Inheriting sessions |
|---|---|---|
| **`Phase` apparatus** — UFO Phase formalism vs SKOS lifecycle scheme | Session 006 (Q7 on `participantStatus`) | Session 007 (Q3 on `status`) |
| **ODRL deferral trigger** — exact event that activates policy authoring | Session 002 (now owns; ODR-0014 retired and folded) | Session 012 (Q4) — inherits the trigger; consumes for governance |
| **SSSOM re-open trigger** — when external mapping work admits SSSOM | Session 002 (now owns; ODR-0014 retired and folded) | Session 011 (Q3 — drops `skos:exactMatch` to external vocabs until reopened) |
| **OWL-Time scope and depth** | Session 002 (sets disposition; ODR-0014 retired) → Session 007 (Q7, sets profile depth for transactions) | Session 005 (Property duration), Session 009 (PROV-O interval / instant boundary) |
| **SKOS scheme membership criteria / cardinality / definition source** | Session 011 (substrate) | Sessions 006, 007, 008, 009, 012 — all consume the criteria |
| **SKOS scheme UFO meta-category per scheme** (Quale-in-Region / Role label / Phase label / method-plan code) | Session 011 (Guizzardi sub-finding adopted by Scope-Check 1 Q3) | Sessions 006, 007, 008, 009, 012 — each consuming module inherits the per-scheme category declaration |
| **Address class location** | **Session 015 (ODR-0015 — Address & Geography)** — new gate spawned per Scope-Check 1 Q7a; no longer routed through 006/008. | Sessions 006, 008, 009, 012 — all consume `opda:Address` from 015. |
| **Datatype-vs-SKOS for category-like attributes** | Session 011 (general criterion) → Session 008 (per-attribute application) | Session 008 (Q5) inherits 011's criterion |
| **DPV co-annotation pattern** on evidence | **Session 012 (owns authoring per Scope-Check 1 Q5 refinement); Session 009 carries a one-paragraph pointer.** Forward-supersession via `## Supersession scope:` retained as amendment mechanism. | Session 010 (verifiedClaims overlay), Session 013 (SHACL severity on PII) |
| **SHACL interface contract** between Overlay Profiles (0010) and Validation Severity (0013) — three rules: `sh:in` semantics; `sh:Violation` floor; no-identity-override gate | **Cross-cite (Scope-Check 1 Q6 Cagle).** Both ODRs' `## References` must explicitly cite the three rules. Either ODR can author a rule; the other inherits via cross-cite. | Sessions 010 and 013 — interface contract is required `## References` content in both ODRs. |
| **W3C VC / DID activation** | **Session 002 admits `cred:` and `did:` prefixes**; **ODR-0016 (Session 016, deferred)** owns binding deliberation. Activation triggers: session-009 Q8 surfaces VC-side decisions OR session-012 Phase-2 consent receipts OR a real wallet/DID consumer arrives. | Session 009 (Q8 defers into 016), Session 012 (consent receipts), Session 010 (signed VC profile shapes). |

Routing failures are a defect — if two sessions both produce a verdict on a
shared question, the later session's verdict is invalid pending an explicit
amendment cycle. The risks table (§9) carries the remediation.

---

### Session 002 — ODR-0002 Vocabulary Catalogue Adoption (now absorbs former Session 014)

**Status of stub.** Survey-grounded three-tier catalogue (Core / Conditional /
Defer) carried over from the H&M programme. ODR-0014 retired by Scope-Check 1
(Q4); its per-vocabulary amendments now land here as `## Change log` rows.

**Queen:** Tom Baker. **DA:** Kurt Cagle. **Teammates:** default buckets.
For the absorbed-amendment questions (was Session 014's `formal-pair` slot),
the existing `formal-pair` teammate (Gandon + Guizzardi) carries the OBO RO
and FOAF deliberation — no extra teammate.

**Input documents.**
- ODR-0002 (the stub).
- H&M `src/` `@prefix` survey (referenced in the stub).
- ODR-0014 (retired; read as historical anchor for Session 001 amendment provenance).
- Session-001 Q2 transcript (every per-vocabulary dispute already deliberated).
- Scope-Check 1 Q4 transcript (the retirement decision; six-row change log spec).
- ODR-0001 §"When to use the Council" — re-grounds admission criteria.

**Questions.**
1. Is **three-tier Core / Conditional / Defer** the right cut, or does the
   catalogue need a fourth tier ("under-review" or "deprecated")?
2. Are the **per-entry metadata fields** (canonical URI, role, adoption
   pattern, profile if any) the minimum sufficient set, or is `version-pin`
   needed too?
3. **Promotion / demotion criteria** — what triggers Conditional → Core, and
   what is the procedure for de-listing?
4. **Reference-not-import discipline** (Kendall's session-001 amendment for DPV)
   — should it generalise to every Conditional entry?
5. **Profile-pinning** — when an external vocabulary is huge (DPV, FIBO), the
   adoption pattern points at a profile slice. Who owns the profile choice?
6. Should the catalogue cite W3C Recommendation date / status per entry
   to harden the "authority-grounded" rule?

**Absorbed from former Session 014** (per Scope-Check 1 Q4 retirement):

7. **OWL-Time** — confirm actively-adopted Conditional disposition (Session 001
   Q2 vote ≈6-3). Record demotion trigger.
8. **DCAT Conditional** — confirm gate condition (catalogue publication).
9. **SSSOM deferred** — record re-open trigger (external mapping work — FIBO /
   INSPIRE / Land Registry RDF). **This session owns the trigger answer;
   ODR-0011 inherits.**
10. **ODRL deferred-policy** — record exact policy-authoring activation trigger.
    **This session owns the trigger answer; ODR-0012 inherits.**
11. **OBO RO** — open in Session 001; ratify decision (adopt / defer / reject).
    *Genuine dispute — `formal-pair` carries the deliberation.*
12. **FOAF** — ruled out programme-wide per Session 001; record the *reason*
    in `## Change log` so the decision is auditable.
13. **`cred:` and `did:` admission** to the Defer tier (Scope-Check 1 Q7c) with
    activation pointer to ODR-0016. Confirm admission and pointer.

**Verdict shape.** Per-question vote `N-M-K`; if any rule below survives, write
into ODR-0002 `## Rules` (catalogue rows + `## Change log`). The absorbed
amendment rows produce one `## Change log` table row each.

---

### Session 003 — ODR-0003 PDTF → Ontology Programme (Anchor)

**Status of stub.** Anchor record summarising session-001's seven Q-verdicts;
work-breakdown and dependency graph already drawn.

**Format: Author-only.** ODR-0003's substantive content was ratified by
session-001. This session records the phasing this plan adopts (§5) plus the
shared-question routing (§4.1) into ODR-0003's `## Rules`. No fresh
deliberation is expected; no panel split is plausible. The Queen drafts the
transcript and the ODR amendment from the plan and session-001's transcript.

**Phase position.** Phase 0, **first**. Locks the phase order before 002 and
014 commit time. If 002 or 014 surface a catalogue-driven sequencing surprise
that requires re-cutting the phase order, a Session 003b (also author-only,
small) records the amendment.

**Queen:** Elisa Kendall (author). **DA:** none required at author-only tier
(Ian Davis remains nominated as the Council DA for any 003b amendment).
**Teammates:** none.

**Input documents.**
- ODR-0003 (the anchor).
- Session-001 transcript.
- ODRs 0004–0014 (the breakdown).
- This plan (`docs/ontology/plan/council-followup-sessions.md`) — the
  phasing the session ratifies.
- Schema sources (`pdtf-transaction.json`, the web-app `schema` section).

**Items recorded (not deliberated).**
1. **Phase ordering** — adopt §5 of this plan as the canonical sequence.
2. **MVP definition** — adopt the BASPI5 vertical slice (already in
   ODR-0003) plus the §5.1 fast-path option as an alternative.
3. **Identity-crux gate check** — exemplar pass per ODR-0005's three
   conditions (Endurant commit + IC over hard cases + UPRN status).
4. **Module count** — three modules + five cross-cutting + one substrate
   (ODR-0011 promoted). Address class location deferred to session 006 (Q5).
5. **Programme retirement** — when the MVP round-trip lands and every
   linked ODR is `accepted`.
6. **Status discipline** — the queen of the session that ratifies an ODR
   updates ODR-0003's index and the ODR-0001 track-record table.

---

### Session 004 — ODR-0004 Foundation (URI policy + graph separation) **[GATE]**

**Status of stub.** Foundation spike: single `opda:` hash namespace, three-graph
separation, vann-headed ontology, generator-first + diagnostic exemplars,
term-sourcing convention.

**Queen:** Fabien Gandon. **DA:** Holger Knublauch (extended) — challenges the
graph-separation discipline from the side of someone who actually ships SHACL
to production. **Teammates:** default + `shacl-extended` (Cagle + Knublauch).

**Input documents.**
- ODR-0004 (the stub).
- Session-001 Q1, Q3, Q7 (URI policy, graph separation, sequencing).
- Business glossary (`source/00-deliverables/semantic-models/business-glossary.md`).
- Data dictionary (`source/00-deliverables/semantic-models/data-dictionary.md`).
- The two open items in the stub: (a) literal namespace string
  (`https://opda.uk/ns/` vs `https://trust.propdata.org.uk/ontology/`),
  (b) versioning scheme. Both are WG-owned but the Council must scope the
  decision-space.

**Questions.**
1. **Hash vs slash** — hash is in the stub; is it right at *this* corpus size?
2. **Layer-segregated naming** — is the proposed Kind/Role/Phase URI-pattern
   useful enough to enforce, or noisy local notation only?
3. **Three-graph separation** — OWL classes ⊥ SHACL shapes ⊥ annotations: what
   is the composition rule? Who imports whom? How does a consumer materialise
   them as one graph for query?
4. **Term-sourcing convention** — when an `rdfs:label` / `skos:definition`
   sources from the glossary AND a data-dictionary leaf, which wins and how
   is the conflict recorded?
5. **Generator-first policy** — what is the generator's input format, where
   does it live, who runs it, and how does its output enter version control?
6. **Diagnostic-exemplar policy** — how many exemplars; how stored; under
   what filename convention; how cited from ODR-0005.
7. **Namespace string and version scheme** — scope (not necessarily decide)
   the WG-owned strings. State the trade-offs the WG will choose between.

**Gate.** ODR-0005 cannot enter session-005 in good conscience until ODR-0004
clears — session-004 verdicts on URI minting, term-sourcing, and the exemplar
policy are the substrate ODR-0005's IC work depends on.

---

### Session 005 — ODR-0005 Property & Land Identity Crux **[GATE]** **[PILOT — `consensus-mode: hive-mind/byzantine` per Scope-Check 2 B2]**

**Status of stub.** Multi-class split (≥2: physical Property + legal Title);
SHACL/DASH uniqueness as the primary checkable key; no `owl:sameAs`; UPRN's
status (key vs contingent identifier) and the IC over hard cases deferred
to *this* session.

**Consensus-mode pilot.** Per Scope-Check 2 amendment B2 (vote 5-1
SELECTIVE), this session runs with `consensus-mode: hive-mind/byzantine`
as a pilot of the **cross-conditional voting** hypothesis. Hypothesis:
structural vote acknowledgement (Gandon's reframe of Byzantine consensus —
the worth-paying-for side-effect, not f<n/3 fault tolerance) catches
Guarino's three-condition withdrawal pattern (Endurant commit + IC over
hard cases + UPRN status, all exemplar-validated) more reliably than
narrative reading of working files. **Two-artefact discipline applies**
(narrative synthesis primary, structured tally appendix — ratified in
ODR-0001 via the 2026-05-27 amendment). **Substrate is in place** (B1
landed); A9 (Gandon-Guizzardi methodology gap) is recommended before this
session but not strictly blocking. Retire-or-extend evaluation written by
the Queen at session close (one page in the transcript). If hypothesis
fails — i.e. acknowledgement adds nothing beyond what `odr-review` lint
already catches — retire `consensus-mode: hive-mind/byzantine` for gate
sessions; revert to Agent fan-out.

**Queen:** **Nicola Guarino** — this is the gate he set in session-001. **DA:**
Dean Allemang (pragmatic push-back: working-ontologist's "show me a consumer
that fails"). **Teammates:** default + `guarino-da`-swapped-for-`allemang-da`;
Guizzardi essential.

**Input documents.**
- ODR-0005 (the stub).
- Session-001 Q4 transcript (the full Guarino objection chain).
- Diagnostic exemplars (per the policy ODR-0004 fixes): registered freehold
  house; unregistered house pre-first-registration; flat whose UPRN was split.
- Land Registry register-of-title structure (citation needed by the Queen).
- INSPIRE Identifier spec.

**Questions.**
1. **Endurant commitment** — both classes (physical Property, LegalEstate /
   RegisteredTitle) committed to DOLCE Endurant? With what sub-kind?
2. **Identity criterion — physical Property** — over demolition, subdivision,
   merger, replacement: what is the IC? (Spatial-material continuity is the
   draft; pressure-test it.)
3. **Identity criterion — LegalEstate / RegisteredTitle** — title-register
   identity is the draft; what happens at title closure, merger, or transfer
   between registers?
4. **UPRN's status** — checkable SHACL/DASH key (degrades gracefully when
   absent) vs contingent administrative identifier (under PROV succession).
   Both? Either-or?
5. **Two- vs three-class split** — Hendler's third-class (`LegalEstate` as
   distinct from `RegisteredTitle`) vs Allemang's two. Decide or defer-with-
   reason.
6. **Address-as-mode-of-presentation** — `marketingAddress`, `titleAddress`,
   `inspireAddress` are not co-identifiers of the property; what are they?
7. **Exemplar pass** — do all three exemplars survive the proposed cure
   without a violation report that the IC can't justify?
8. **Gate clearance check** — is ODR-0005 ready to be `accepted`, and what is
   the consequence for ODRs 0006–0008?

**Verdict shape.** This is the highest-stakes session. Guarino's withdrawal
condition was three commitments (Endurant commit, IC over hard cases, UPRN
status) all exemplar-validated. The session passes iff all three are met.
If it fails on any, the session does *not* spawn module ODR sessions until
remediation.

**Spawn rule.** If the session concludes that Property and Title need
*separate* ODRs to do their IC work justice, spawn ODR-0005a / 0005b (or
allocate new sequential numbers) and supersede ODR-0005 in place.

---

### Session 006 — ODR-0006 Agents & Roles **[GATE for 007/008/009/012]**

**Status of stub.** Person/Org Kinds; Seller/Buyer RoleMixins; Proprietor
Role + Proprietorship Relator; capacity-vs-evidenced-authority.

**Phase position.** Phase 3a — first module to land. Feeds 007 (transaction
agents on milestones, chain proprietors), 008 (Address class reuse), 009
(`prov:wasAssociatedWith` Agent classes), and 012 (DPV PII tags on Person).
Holds the line on the `Phase`-apparatus question (Q7) so 007 Q3 can answer
consistently.

**Queen:** Giancarlo Guizzardi. **DA:** Dean Allemang. **Teammates:** default
+ `bounded-context-extended` (Evans + Vernon — extended-panel) since capacity
sits at the bounded-context seam.

**Input documents.** ODR-0006 (stub); ODR-0005 (identity criteria for Person /
Org reused); ODR-0011 (SKOS scheme criteria for `role`, `sellersCapacity`,
`participantStatus`); session-001 Q3; `participants[]` and `sellersCapacity`
schema slices; ToIP / W3C VC inheritance from the glossary; W3C Org Ontology
spec.

**Questions.**
1. **Person Kind, Organisation Kind** — identity criteria reused from
   ODR-0005's Endurant pattern? Or distinct ICs (date-of-birth + state-issued
   ID for Person; registration number for Organisation)?
2. **RoleMixin vs Role** — UFO RoleMixin for Seller/Buyer (anti-rigid, cross-
   sortal); is the distinction operational or noise at this scale?
3. **Proprietorship Relator** — modelled as a Relator with mediating Role
   instances (Proprietor) for each natural/legal person on title?
4. **Capacity vs Authority** — asserted-capacity (`sellersCapacity` enum) vs
   evidenced-authority (probate, power of attorney) — two properties, one
   property with a status, or a sub-relator?
5. **Address reuse** — `Address` class declared in this module or in a shared
   "Geography & Addressing" sub-module? (Cross-references ODR-0008.)
6. **W3C Org Ontology vs bespoke `opda:Organisation`** — adopt Org, adopt
   subset, or stay bespoke? FOAF is already ruled out programme-wide per
   session-001.
7. **`participantStatus` as a UFO Phase** — does it earn the formal Phase
   apparatus, or stay a simple SKOS scheme?

---

### Session 007 — ODR-0007 Transactions & Lifecycle

**Status of stub.** Transaction relator, milestones, status, OWL-Time intervals.

**Phase position.** Phase 3b — runs after 006 (consumes Agents on milestones,
chain proprietors) and after 014 (consumes OWL-Time disposition). May
parallel with 008.

**Queen:** Giancarlo Guizzardi. **DA:** Ian Davis. **Teammates:** default +
`prov-time` (Moreau, extended).

**Input documents.** ODR-0007 (stub); ODR-0006 (Agent classes consumed on
milestones and chain); ODR-0014 (OWL-Time disposition — Conditional/Defer);
ODR-0011 (SKOS schemes for `status`, `propertyDependencyType`); OWL-Time spec;
session-001 Q2 (OWL-Time adoption); PDTF milestone / chain / lease-term schema
slices.

**Questions.**
1. **Transaction-as-Relator vs Transaction-as-Event** — the stub leans
   Relator; pressure-test against the chain-of-transactions recursion.
2. **Milestones — instants vs intervals** — `prov:atTime` (instant) is in
   session-001; OWL-Time `time:ProperInterval` for proprietorship and lease
   was the coherence argument. Settle the per-milestone choice.
3. **Status as a Phase** — Phase apparatus or SKOS scheme? (Same question as
   ODR-0006 Q7 — must answer consistently across the two sessions.)
4. **Chain modelling** — recursive Relator, list of Transactions, or two
   separate predicates (`opda:dependsOn` / `opda:dependedOnBy`)?
5. **Lease term** — `startYearOfLease` + `lengthOfLeaseInYears` as an
   `time:ProperInterval` with `time:hasBeginning` and `time:hasDurationDescription`?
6. **`expected` vs `actual` milestone times** — provenance flavour (planned-
   activity vs occurred-activity) or duplicate properties?
7. **OWL-Time scope** — adopt the full ontology, a profile, or selectively?

---

### Session 008 — ODR-0008 Property Descriptive Attributes

**Status of stub.** Declare-once-reconcile-overlays — flatten `propertyPack`,
declare each descriptive property once on Property/Title, push per-form
variation into SHACL profiles.

**Phase position.** Phase 3b — runs after 005 (the class to attach attributes
to), 006 (Address class location and reuse), and 011 (SKOS for category-like
attributes). May parallel with 007. NOTE: ODR-0010 (overlay profiles) is now
*downstream* of 008 — session 010 consumes 008's attribute set, not vice
versa; the stub's reverse phrasing is retired.

**Queen:** Dean Allemang. **DA:** Kurt Cagle (challenge the reconciliation
overhead at 935 leaves).

**Input documents.** ODR-0008 (stub); ODR-0005 (Property/Title class to
attach to); ODR-0006 (Address class); ODR-0011 (SKOS scheme criteria for
`builtForm`, `councilTaxBand`, `currentEnergyRating`, `centralHeatingFuelType`,
etc.); data dictionary (1,557 leaves; 8,458 path entries; the spanning-leaf
counts); the `propertyPack` schema tree.

**Questions.**
1. **Spanning-leaf definition** — a leaf appears in ≥N overlays → it
   reconciles to one ontology property. What is N? (Today's counts: 18 / 9 /
   5; the stub doesn't fix a threshold.)
2. **Sub-module split** — should ODR-0008 itself split into
   built-form / energy / utilities / searches / encumbrances? (Volume
   argument vs single-record reuse.)
3. **Data-dictionary as source of truth** — `dct:source` is fixed; what is
   the citation grain (per-leaf, per-property, per-section)?
4. **Granularity floor** — when does a leaf collapse into a structured value
   (e.g. an `Address` instance) vs stay as a datatype property?
5. **Datatype property vs SKOS** — category-like attributes (built form,
   construction type): owl:DatatypeProperty with `xsd:string` + enum → SKOS
   (cross-reference ODR-0011), or stay datatype-typed?
6. **Sub-property hierarchies** — when does `opda:mainsWater` need a parent
   `opda:utility`? Or is flat better at this scale?
7. **Overlay-form variation** — required/enum diff between baspi5 and ta6:
   per-form `sh:PropertyShape` in the profile (ODR-0010) — confirm the
   handoff boundary.

---

### Session 009 — ODR-0009 Claims, Evidence & Provenance

**Status of stub.** PROV-O backbone + separate `opda:assuranceLevel` / `dct:` /
local-terms layer for the eIDAS envelope.

**Phase position.** Phase 4 — runs after 006 (Agent classes for
`prov:wasAssociatedWith`) and 011 (SKOS scheme for `opda:assuranceLevel`).
ODR-0009 lands `accepted` at the end of this session. **DPV co-annotation
authoring is moved to ODR-0012** per Scope-Check 1 Q5 refinement (vote 8-1
keep separate; Pandit's authorship-routing refinement adopted) — ODR-0009
carries a one-paragraph pointer at the DPV co-annotation seam, not the
authoritative listing. The forward-supersession mechanism (`## Supersession
scope:` from 0012 onto 0009) is retained as the amendment vehicle if
ODR-0012's deliberation surfaces material changes; the **first authoring**
lives in 0012, not in 0009-amended-by-012.

**Queen:** **Luc Moreau** (PROV-O, extended-panel). **DA:** Nicola Guarino
(holds the PROV-O ≠ assurance line he conceded in session-001).
**Teammates:** default + `dpv-odrl` (Pandit, Iannella) since governance
co-annotation is in scope.

**Input documents.** ODR-0009 (stub); ODR-0006 (Agent classes); ODR-0011
(`opda:AssuranceLevelScheme` membership criteria); session-001 Q6
transcript; `pdtf-verified-claims.json`; OIDC4IDA / eIDAS specs; PROV-O spec;
W3C VC Data Model; ToIP framework.

**Questions.**
1. **PROV-O coverage** — re-test the 80% / 5-residue split; is the residue
   actually five items, or has Moreau's analysis surfaced more?
2. **Qualified forms** — `prov:qualifiedAttribution` with `prov:hadRole` for
   `validation_method` / `verification_method`. Cardinality and SHACL.
3. **Assurance level vocabulary** — SKOS scheme `opda:AssuranceLevelScheme`
   with eIDAS values (Low/Substantial/High) and PDTF-specific values; who
   owns it?
4. **Cryptographic digest** — local `opda:digest` (no PROV signature notion);
   what algorithm enum; co-existence with W3C Data Integrity?
5. **`trust_framework: "uk_pdtf"`** — `dct:conformsTo` to a `opda:TrustFramework`
   class? Reified as a SKOS concept? Both?
6. **DPV co-annotation seam** — *one-paragraph pointer* to ODR-0012's
   authoritative listing (per Scope-Check 1 Q5). No authoring here; just
   confirm the seam (which evidence subclasses bear PII; the handoff
   protocol).
7. **SHACL-over-PROV** — `if/then`-on-evidence-type via `sh:xone`; concrete
   shapes for document / electronic-record / vouch.
8. **W3C VC interop** — `opda:Claim` as `cred:VerifiableCredential`-compatible?
   **Defers to ODR-0016** (named-deferred per Scope-Check 1 Q7c). This
   session records the question and its scoping, not the binding.

---

### Session 010 — ODR-0010 Overlay Profile Mechanism

**Status of stub.** Overlays = named SHACL profile graphs over a fixed TBox;
composition is a build-step graph-union; profile reified as
`opda:ValidationContext`; DASH rendering; `dct:source` traceability;
no overlay overrides identity.

**Phase position.** Phase 5 — overlays profile a TBox, and the TBox is
ratified only after 006 (Agents), 007 (Transactions), 008 (Property attrs),
009 (Claims). Running 010 before any of those forces speculative profile
shapes against an unratified target. May parallel with 012 only if 012
hasn't surfaced amendments that 010 needs to reflect.

**Queen:** **Holger Knublauch** (extended; he owns SHACL profiles).
**DA:** Nicola Guarino (the "no fixed model theory" objection — already
conceded to in session-001 by reifying ValidationContext; the session must
verify the reification is complete).

**Input documents.** ODR-0010 (stub); **ODR-0006, ODR-0007, ODR-0008, ODR-0009
(the ratified TBox the profiles constrain)**; session-001 Q5; the BASPI5 +
TA6 + NTS overlay JSON sources; SHACL 1.2 spec; DASH spec;
`getTransactionSchema` deep-merge implementation.

**Questions.**
1. **`opda:ValidationContext` reification** — what properties does the class
   carry? (`opda:profileURI`, `opda:requires`, `opda:overlaysContext`?)
2. **Composition semantics** — is profile composition commutative? When does
   order matter (`sh:in` union; merged `oneOf`)? *Cross-cite ODR-0013 on the
   `sh:in` semantics interface rule.*
3. **`dct:source` form-question IRI minting** — pattern is `…/forms/baspi5#B1.3.2`;
   confirm the syntax, who mints, how the page-anchors stay stable across
   form versions.
4. **DASH coverage** — does BASPI5 fully express via `dash:viewer` / `editor` /
   `propertyRole` / `sh:order` / `sh:group`? Audit against the BASPI5 PDF.
5. **`oneOf` → `sh:xone`** — for `sellersCapacity` with nested `oneOf`, is the
   `sh:qualifiedValueShape` pattern complete and idiomatic?
6. **No-identity-override gate** — what is the *check* that a profile hasn't
   touched a Kind's identity / key? (Static rule? Lint? SHACL meta-shape?)
   *Cross-cite ODR-0013 on the no-identity-override gate (rule 3 of Cagle's
   three-rule interface contract).*
7. **Round-trip test** — does loading BASPI5 yield (a) a graph that validates a
   transaction, (b) a graph that re-generates the BASPI form? Demonstrate or
   leave as ODR-0010's confirmation criterion.
8. **Three-rule interface contract** (Scope-Check 1 Q6 / Cagle) — ODR-0010's
   `## References` MUST explicitly cite ODR-0013 on three rules:
   - `sh:in` semantics — merged at build time (0010) applied to closed
     schemes (0013).
   - `sh:Violation` floor — profile cannot add a Violation not already in
     base (0013 owns the floor; 0010 inherits).
   - No-identity-override gate — profile cannot touch a Kind's key (0013
     owns the keys; 0010 enforces the gate).
   If the seam leaks (build-step composition produces surprises), spawn
   ODR-0010b/0013b "SHACL composition semantics" rather than merging.

---

### Session 011 — ODR-0011 Enumeration Vocabularies **[SUBSTRATE for 006/007/008/009/012]** **[Q8 PILOT — `consensus-mode: hive-mind/typed-output` per Scope-Check 2 B3]**

**Status of stub.** Each JSON enum becomes a SKOS concept scheme with
`prefLabel` / `notation` / `definition`; OWL `oneOf` and bare `xsd:string`
both rejected.

**Phase position.** Phase 2.5 — promoted out of cross-cutting because every
module (006/007/008) and Claims (009) and Governance (012) consumes SKOS
scheme criteria. Running 011 once up front avoids three independent
SKOS-re-litigations in module sessions. 011 does not depend on 005's IC and
may run in parallel with 005 if resources allow.

**Two-pass option.** 011 can deliberate the SKOS *shape* (cardinality,
definition source, lifecycle, notation typing — Qs 2, 4, 5, 6, 7) from the
schema alone, but Q1 (scheme membership criteria) and Q3 (cross-vocabulary
mapping) genuinely benefit from module context. The Queen may run 011 in
**substrate mode** (Phase 2.5, Qs 2/4/5/6/7 + a provisional Q1 threshold)
and then re-convene 011 as a **Phase-3.5 audit session** after sessions
006/007/008 ratify, fixing per-scheme decisions and tightening Q1 against
real usage. The audit session lands as ODR-0011 amendments (in-place if
small; spawned ODR-0011b per §6 if the volume justifies). Choose substrate-
only if the Queen judges the modules will adopt the substrate criteria
without dispute; choose two-pass if module Qs reveal genuine SKOS pattern
divergence.

**Queen:** **Antoine Isaac** (or Alistair Miles — SKOS WG, extended).
**DA:** Fabien Gandon (when SKOS-vs-OWL matters; defends formal correctness).

**Input documents.** ODR-0011 (stub); ODR-0014 (SSSOM disposition — affects
Q3 cross-vocabulary mapping); SKOS Reference + Primer; the 160 enum leaves
and their members; the glossary and data dictionary as definition sources;
ISO 25964 SKOS binding.

**Questions.**
1. **Scheme membership criteria** — every JSON enum becomes a scheme, or
   is there a floor (≥3 members; cross-overlay reuse)?
2. **Cardinality** — `prefLabel @en` exactly 1; `notation` exactly 1; `definition` exactly 1?
3. **Cross-vocabulary mapping** — SSSOM/SEMAPV deferred per session-001;
   when does that re-open? Inline `skos:exactMatch` to schema.org /
   Wikidata / Land-Registry codes — admit or defer?
4. **Definition source** — glossary vs data dictionary vs schema annotation;
   how does the per-member definition cite?
5. **Code-list lifecycle** — versioning, deprecation, succession; does a
   member move with `prov:wasDerivedFrom`? Or with `dct:isReplacedBy`?
6. **Namespace** — single `opda:` namespace with scheme-qualified URIs
   (`opda:builtForm/Detached`), or per-scheme namespaces?
7. **Notation typing** — string, or scheme-specific datatype (e.g. EPC band
   `A`–`G`)?
8. **UFO meta-category per scheme** — each scheme MUST declare its UFO
   meta-category in its `## Rules` row (Guizzardi sub-finding adopted by
   Scope-Check 1 Q3). Four candidate categories:
   - **Quale-in-Region** — EPC band `A`–`G`; `councilTaxBand` `A`–`I` —
     values in a banded valuation/efficiency region.
   - **Role label** — `role` (`Buyer`, `Seller's Conveyancer`, `Estate
     Agent`) — RoleMixin/Role labels.
   - **Phase label** — `participantStatus` (`Proposed` / `Invited` /
     `Active` / `Removed`) — phases of a Kind.
   - **Method/plan code** — `sellersCapacity` (`Personal Representative`,
     `Power of Attorney`) — method or plan codes.
   This session ratifies the four-category vocabulary; each scheme's
   category-assignment lands as the consuming module ratifies (006/007/008/
   009/012). Schemes that don't fit a category trigger a re-deliberation
   here.

   **Q8 PILOT — `consensus-mode: hive-mind/typed-output`** per Scope-Check 2
   amendment B3 (vote 5-1 SELECTIVE). Pilot scope: *this question only* (Q8;
   not the full session). Hypothesis: a typed verdict object (one of four
   named categories per scheme) is consumed by downstream tooling — the
   generator emits `opda:ufoCategory` triples; `odr-review` lints
   scheme-category coherence; LLM consumers retrieve the typed assignment.
   **Two-artefact discipline applies** (ratified in ODR-0001 via the
   2026-05-27 amendment). Q1–Q7 of this session remain Agent fan-out.
   **Substrate is in place** (B1 landed); pilot unblocked. Retire-or-extend
   evaluation written by the Queen at session close. If hypothesis fails —
   i.e. typed verdict is consumed only by humans within MVP scope — retire
   `consensus-mode: hive-mind/typed-output` for substrate sessions.

---

### Session 012 — ODR-0012 Data-Governance Layer

**Status of stub.** DPV Phase-1 annotation-only as the floor; lawful-basis /
consent / purpose class vocabulary held open as live dissent (Pandit's);
ODRL adopted in catalogue but policy authoring deferred.

**Phase position.** Phase 4 — runs immediately after 009. **Owns DPV
co-annotation authoring** per Scope-Check 1 Q5 refinement: ODR-0009 carries
a one-paragraph pointer; **the authoritative co-annotation listing lives
here**. The forward-supersession mechanism (`## Supersession scope:` on
ODR-0009's slice) is retained only if 012's deliberation surfaces a tighter
pattern that *changes* 009's pointer text — otherwise no supersession is
needed. ODR-0012 also inherits Session 002's ODRL deferral trigger (per
§4.1; ODR-0014 retired and folded) and consumes 006's Person class for
PII tagging.

**Queen:** **Harshvardhan Pandit** (DPV — owns; his dissent from session-001
is now centre-stage). **DA:** Elisa Kendall (reference-not-import; keep TBox
lean).

**Input documents.** ODR-0012 (stub); **ODR-0009 (Claims/Evidence — the DPV
target; 012 may issue amendments back)**; ODR-0014 (ODRL disposition);
ODR-0006 (Person/Org classes to tag); ODR-0011 (SKOS scheme for DPV PII tags
that get promoted to first-class); session-001 Q2 DPV/ODRL deliberation;
DPV-PD / DPV-LEGAL / DPV-GDPR specs; ODRL spec; Article 10 GDPR; the AML /
identity / occupier / DOB schema surfaces.

**Questions.**
1. **DPV Phase-1 scope** — which properties get DPV tags? (Every PII-bearing
   property, or a curated set?)
2. **Lawful-basis class vocabulary** — Pandit's dissent: is the
   class-vocabulary TBox-expressible *now* without instance data, or does it
   stay deferred?
3. **Article-10 / special-category** — `cautionOrConviction`, AML outcomes:
   how are they tagged, and what is the SHACL severity?
4. **ODRL deferral conditions** — what *activates* policy authoring? (Consent
   instances entering scope? A specific overlay? A regulatory trigger?)
5. **PII discovery** — is there an automation hook that flags new PII-bearing
   properties as they're minted, and refuses to land them without a DPV tag?
6. **W3C VC consent receipts** — does Phase-1 prepare the way, or is that a
   Phase-2 concern entirely?
7. **Boundary with Claims (ODR-0009)** — evidence is dense in PII; how does
   the co-annotation handoff land?

---

### Session 013 — ODR-0013 SHACL Validation & Severity **[CLOSING SESSION]**

**Status of stub.** Severity-tiered SHACL in a separate shapes graph; DASH
rendering; annotation graph for advisory items (Cagle's `aiHint` exile).

**Phase position.** Phase 6 — the closing session. Severity tiers reference
every shape across the programme: 006 Agents shapes, 007 Transaction shapes,
008 descriptive shapes, 009 PROV-O shapes, 010 profile shapes, 011
SKOS-membership shapes, 012 governance shapes. Running 013 earlier would
require speculative severity tiering against unratified shapes.

**Queen:** **Holger Knublauch** (SHACL + DASH — owns; same queen as session
010, deliberately). **DA:** Kurt Cagle (the `aiHint` exile; this session
must verify the annotation graph genuinely serves Cagle's use cases or
re-open the boundary).

**Input documents.** ODR-0013 (stub); **every prior ratified ODR
(006/007/008/009/010/011/012)** for shape inventory; SHACL 1.2 + DASH specs;
session-001 Q5 transcript on `aiHint`; the `required` / `enum` / `type` /
`format` / `minimum` / `maximum` / `oneOf` constraint inventory from the
data dictionary.

**Questions.**
1. **Severity tiers** — `sh:Violation` / `sh:Warning` / `sh:Info`: assignment
   criteria. (Missing identity key → Violation; absent optional → Info; in
   between?)
2. **Constraint mapping completeness** — every JSON Schema constraint has a
   SHACL counterpart? (`format: date-time` → `sh:datatype xsd:dateTime` + `sh:pattern`?)
3. **DASH UI coverage** — every form field has a DASH viewer / editor?
4. **Annotation graph** — what classes / properties live there? (advisory
   AI hints, UI-only rendering hints, presentation order?)
5. **Reporting surface** — `sh:ValidationReport` consumption: who reads it
   and what UX renders it?
6. **Profile interaction** — ODR-0010 profiles vs ODR-0013 base shapes: are
   the layers stackable cleanly, or does the profile override base severity
   in non-obvious ways?
7. **Three-rule interface contract** (Scope-Check 1 Q6 / Cagle) — ODR-0013's
   `## References` MUST explicitly cite ODR-0010 on the three rules:
   `sh:in` semantics; `sh:Violation` floor (this ODR owns); no-identity-
   override gate (this ODR owns identity keys; 0010 enforces the gate).

---

### Session 015 — ODR-0015 Address & Geography **[GATE for 006, 008]**

**Status of stub.** New ODR spawned by Scope-Check 1 (Q7a vote 8-1). Declares
`opda:Address` as a first-class endurant distinct from `opda:Property`;
settles UFO category (Kind/Quale/Mode); INSPIRE Identifier and UPRN-as-
geographic-identifier; GeoSPARQL deferral home. Consumed by 006, 008, 009,
012.

**Format: Reduced Council.** Queen + DA + one panel teammate (the UFO-vs-
URI-architecture pair). The session's load-bearing question is the UFO
meta-category for `opda:Address` (Kind / Quale-in-Region / Mode); other
items (INSPIRE alignment, GeoSPARQL deferral, co-reference SHACL) follow
from that decision.

**Phase position.** **Phase 2.6** — runs after Session 005 (Identity crux)
clears; gates Sessions 006 and 008. May run after Session 011 (substrate)
without harm.

**Queen:** Giancarlo Guizzardi (UFO-category framing is decisive on Q1) OR
Fabien Gandon (if the URI-architecture framing carries — INSPIRE binding,
GeoSPARQL deferral). The convening block resolves; default Guizzardi.

**DA:** Dean Allemang (working-ontologist push-back: "show me a consumer
that fails if `opda:Address` is a structured datatype").

**Teammates (1, joint pair):** `formal-pair` (Gandon + Guizzardi) carries
both Queen and UFO-vs-URI deliberation. Plus `da-solo` (Allemang).

**Input documents.**
- ODR-0015 (the stub).
- ODR-0005 (the IC gate that 0015 inherits — UPRN-as-contingent-identifier pattern).
- ODR-0004 (exemplar policy — required for Q7).
- Scope-Check 1 transcript, Q7a (the spawn deliberation).
- INSPIRE Annex I: Addresses; ISO 19160 (Addressing); OS AddressBase;
  W3C vCard ontology; OGC GeoSPARQL.
- Schema slices: `propertyPack.address`, `propertyPack.titleAddress`,
  `propertyPack.marketingAddress`, `propertyPack.inspireId`,
  `participants.address`, `verifiedClaims.verification.evidence.document.issuer.address`.
- **Diagnostic exemplars** (per ODR-0004 exemplar policy): flat with no
  UPRN (newly converted from one freehold); listed building with title
  address ≠ marketing address; rural plot with INSPIRE Identifier but no
  UPRN.

**Questions.**
1. **UFO meta-category** for `opda:Address` — Kind (substance with its own
   IC), Quale-in-Region (structured datatype, no identity), or Mode
   (particularised property inhering in Property)? The gate question.
2. **Identity criterion** (if Kind) — what is the IC across `titleAddress` vs
   `marketingAddress` vs `inspireId`-linked rows?
3. **Class structure** — structured datatype with line1/line2/postcode/country,
   or class with property shapes?
4. **External alignment** — INSPIRE Identifier as contingent identifier
   (per UPRN pattern); `vcard:Address` for personal-contact use; OS
   AddressBase relations.
5. **GeoSPARQL deferral** — interface (`opda:hasGeometry`); trigger for
   admitting encoded geometries.
6. **Co-reference SHACL shape** — when multiple address surfaces refer to
   the same instance, must agree; disagreement is data-quality finding.
7. **PII tagging handoff** — DPV co-annotation to ODR-0012 (every Address
   bears `dpv-pd:Address`; stricter category depends on Q1).
8. **Exemplar pass** — do all three exemplars survive the cure?

**Verdict shape.** Gate session. Q1 (UFO category) and Q2 (IC) must clear
exemplar validation. If they fail, Sessions 006 and 008 wait for
remediation. Verdict on UFO category cascades into 006/008/009/012's
Address reuse.

---

### Session 016 — ODR-0016 W3C VC / DID Compatibility Layer **[DEFERRED — does not run in Phase 1]**

**Status of stub.** New ODR named (deferred) by Scope-Check 1 (Q7c vote 8-1).
**Does not run** until any of the activation triggers fires:

- Session 009 Q8 surfaces real VC-side decisions that cannot be deferred
  into a follow-up.
- Session 012 ratifies Phase-2 ambition (consent / lawful-basis / purpose
  class vocabulary) — consent receipts are W3C VC-shaped.
- A real wallet / DID consumer enters scope (`gov.uk` OneLogin; EU eIDAS
  2.0 wallet; OPDA-issued credential).

ODR-0002's Defer tier now lists `cred:` (W3C VCDM 2.0) and `did:` (DID
Core) with activation pointer to ODR-0016 (per Scope-Check 1 Q7c).

**Format when activated: Full Council.** Substantive linked-data decision
with credible split between VC purists (binding `opda:Claim` ↔
`cred:VerifiableCredential` fully) and Trust-Framework pragmatists (defer
the binding pending real consumer signal). Extended panel for VC WG voices.

**Phase position.** **Phase 7 — deferred.** No fixed slot; runs when
triggered.

**Queen:** Luc Moreau (continuity with ODR-0009; owns PROV-O ↔ VC
alignment) OR a W3C VC WG voice (Manu Sporny / Drummond Reed — extended
panel) if VC-ecosystem depth dominates the binding deliberation.

**DA:** Harshvardhan Pandit (the strongest credible opponent of an
under-scoped binding — pushes for consent-receipt completeness).

**Teammates (when activated):** default + `vc-extended` (Sporny + Reed —
extended) + `truth-makers` carrying Guizzardi's appended Truth-Maker
question (what *makes true* a Verifiable Credential? PROV-O derivation /
cryptographic signature / regulatory assurance level — three truth-makers,
one Claim).

**Input documents.** ODR-0016 (the stub); ODR-0002 (`cred:`/`did:`
admissions); ODR-0009 (Claims backbone + assurance layer); ODR-0012
(governance context if Phase-2 activates); Scope-Check 1 Q7c transcript;
W3C VC Data Model 2.0; W3C DID Core 1.0; W3C Data Integrity 1.0; W3C VC
Status List 2021; W3C VC Consent Receipt draft; EU eIDAS 2.0; ToIP
framework.

**Questions** (per ODR-0016's `## Rules` placeholder — confirmed at
activation time):

1. Claim binding (`opda:Claim` ↔ `cred:VerifiableCredential`).
2. Issuer/Holder/Verifier role bindings (map ODR-0006 RoleMixins onto VC's roles).
3. DID method commitment (`did:web` / `did:key` / `did:jwk` / custom).
4. Data Integrity signature suites (Ed25519Signature2020, BBS+, ECDSA).
5. Status lists (`StatusList2021`) and OPDA-operated revocation registries.
6. JSON-LD context (`https://opda.uk/contexts/v1` or similar).
7. Truth-maker discipline (Guizzardi appendix).
8. Consent receipts (if Phase-2 / ODR-0012 fires).
9. eIDAS 2.0 / ToIP alignment.

**Verdict shape.** Full Council session when triggered. Until then,
ODR-0016 stays `proposed` and the deferral is the verdict.

---

### ~~Session 014~~ — RETIRED

ODR-0014 is `superseded` per Scope-Check 1 Q4 (7-1-1); per-vocabulary amendments absorbed into Session 002. See Scope-Check 1 transcript Q4; ODR-0014's `## Rules` Supersession scope; ODR-0002's `## Change log`.

## 5. Sequencing and gates

Sequencing is tighter than "Phase 0 / Phase 1 / Phase 2 / Phase 3-parallel"
suggests. Several ODRs feed others: vocabulary tiering decides what later
sessions can import; the anchor ratifies phase order; SKOS scheme criteria
shape every module that has enums; Agents feed Transactions and Property
attrs; Overlays and SHACL severity consume the ratified TBox; Claims and
Governance share a tight DPV co-annotation loop. Phasing reflects those
edges.

**Pre-Phase — Session A9 — Gandon-Guizzardi methodology gap.** ✅ **COMPLETE (2026-05-27).**

- **Subject:** does an ODR record an artefact-engineering decision (Gandon) or an ontological commitment (Guizzardi)?
- **Outcome:** 2-1 BOTH-WITH-BOUNDARY at the `kind` enum. ODR-0001 amended with §What an ODR records (per-kind discipline). For `kind: pattern | mapping`, MUST state UFO/DOLCE meta-category + IC over named hard cases + artefact realisation; `methodology`/`architecture`/`programme` relaxed. Gandon's artefact identity test adopted as operational supplement.
- **Queen:** Kendall. **DA:** Guarino (withdrew on all four conditions met).
- See: [session-a9-gandon-guizzardi-methodology-gap](../odr/council/session-a9-gandon-guizzardi-methodology-gap.md).

**Phase 0 — Anchor + vocabulary substrate (sequential: 003 → 002).** ✅ **COMPLETE (2026-05-27).**

- Session 003 — ODR-0003 anchor. **Author-only.** ✅ Done — see [session-003-pdtf-ontology-programme](../odr/council/session-003-pdtf-ontology-programme.md). ODR-0003 → `accepted` (council: session-003); phase ordering / shared-question routing / fast-path option / retirement criterion / status-discipline protocol recorded.
- Session 002 — ODR-0002 vocabulary catalogue. **Full Council.** ✅ Done — see [session-002-vocabulary-catalogue](../odr/council/session-002-vocabulary-catalogue.md). 12/13 questions land 8-1 or 9-0 with full Cagle DA withdrawal; Q11 OBO RO defers 5-2-2 to ODR-0005. New §Rules subsections: Promotion/demotion criteria, Profile-pinning ownership, Reference-not-import (normative) + `adoption-mode` field. ODR-0002 `status: proposed` retained per Scope-Check 1 Q4 framing.
- ~~Session 014~~ — **RETIRED** by Scope-Check 1 Q4. Does not run.

**Phase 1 — Foundation spike (gate).** ✅ **Council gate cleared AND formally closed (2026-05-27; namespace ratified via Session 003b + ADR-0006).**

- Session 004 — ODR-0004 Foundation. **Full Council.** ✅ Done — see [session-004-pdtf-ontology-foundation](../odr/council/session-004-pdtf-ontology-foundation.md). 7 questions × 9-0 with full Knublauch DA withdrawal on all four primary attacks (Q3 three-graph operational rule; Q4 term-sourcing five-line precedence; Q5 generator byte-identity CI; Q7 namespace-as-blocker). New §Operational specifications subsections 3a/6a/7a/8a. **ODR-0004 stays `status: proposed`** per Knublauch DA primary demand — moves to `accepted` only when OPDA WG ratifies the namespace string. Downstream module ODRs inherit the block.

**Phase 2 — Identity crux (gate). [PILOT — Scope-Check 2 B2]** ✅ **Council gate cleared AND formally closed (2026-05-27; namespace ratified via Session 003b + ADR-0006).**

- Session 005 — ODR-0005 Property identity crux. **Full Council; B2 pilot.** ✅ Done — see [session-005-property-land-identity-crux](../odr/council/session-005-property-land-identity-crux.md). 8 questions: 7 × 9-0 + Q5 6-2-1 FOR 3-class (Davis + Cagle held-as-live dissent preserved); full Allemang DA withdrawal on all 8 questions. New §Operational specifications 2a/3a/3b/3c/6a/6b/7a/8a discharging A9 per-kind discipline. **First `kind: pattern` ODR to discharge under A9** — methodology pressure-test passes. **ODR-0005 stays `status: proposed`** per inherited ODR-0004 namespace block. Guarino S001 Q4 dissent WITHDRAWN. Downstream: ODR-0006/0007/0015 unblocked; **ODR-0008 deferred** until 3-class commitment crystallises. **B2 pilot verdict: EXTEND CAUTIOUSLY** — two-artefact discipline (narrative + structured tally) recommended for S015 + S011 Q8; three-pilot threshold for EXPAND. Pre-S005 between-session prep: three diagnostic exemplars authored per ODR-0004 §8a + parent-repo `.gitignore` allowlist for `source/03-standards/ontology/` (commit 01527e6).

**Phase 2.5 — Enumeration substrate.** ✅ **Council gate cleared AND formally closed (2026-05-27; namespace ratified via Session 003b + ADR-0006).**

- Session 011 — ODR-0011 Enumeration Vocabularies. **Full Council, substrate mode; B3 pilot for Q8 + two-artefact discipline session-wide.** ✅ Done — see [session-011-enumeration-vocabularies](../odr/council/session-011-enumeration-vocabularies.md). 7 questions (Q3 deferred to Phase-3.5 audit). Q1-Q7 4-0 votes; Q8 (B3 typed-output) 4-0 FOR seven-category UFO framework (4 original Scope-Check 1 Q3 categories + 3 Council-authored extensions: Quality Region, Substance Kind label, Quality Value). Full Gandon DA withdrawal (2 withdrew / 5 conceded). New §Operational specifications 1a/2a/4a/5a/7a/8a discharging A9 per-kind discipline at scheme level. **Third `kind: pattern` ODR to discharge under A9.** **ODR-0011 stays `status: proposed`** per inherited ODR-0004 namespace block. Cagle's SHACL-AF deprecation-chain rule re-instantiates ODR-0005 §6a pattern — **fourth citing site reached for SHACL-AF non-blocking-data-quality-rules pattern**; spawn-rule fires for shared `opda-shacl-af-quality-rules` `pattern` ODR. **B3 pilot third-site EXPAND threshold satisfied** — two-artefact discipline becomes default across remaining sessions; ODR-0001 EXPAND amendment flagged for follow-up author-only session.

**Phase 2.6 — Address gate (new — Scope-Check 1 Q7a).** ✅ **Council gate cleared AND formally closed (2026-05-27; namespace ratified via Session 003b + ADR-0006).**

- Session 015 — ODR-0015 Address & Geography. **Reduced Council; two-artefact discipline.** ✅ Done — see [session-015-address-and-geography](../odr/council/session-015-address-and-geography.md). 8 questions: 7 × 3-0 + Q3 2-1 FOR class with property shapes (Allemang DA held-as-live dissent with named re-open trigger). `opda:Address` commits to UFO Substance Kind / DOLCE NonPhysicalEndurant; `opda:addressVariant` as UFO Quality particularising context-of-presentation. **Revises S005 Q6 Mode-only stance** on exemplar evidence + external-standards alignment. New §Operational specifications 2a/3a/3b/4a/5a/6a/7a/8a discharging A9 per-kind discipline. **Second `kind: pattern` ODR to discharge under A9.** **ODR-0015 stays `status: proposed`** per inherited ODR-0004 namespace block. Downstream ODR-0006 + ODR-0008 unblocked at deliberative level (S008 remains deferred on cardinality-from-S005, not on Address-from-S015). **B2 pilot second-site observation supports EXTEND-CAUTIOUSLY recommendation; awaiting S011 Q8 as third site for EXPAND threshold.** Pre-S015 between-session prep: three S015 exemplars authored (commit `b559088`).

**Phase 3a — Agents module (gate for 007, 008, 009).**

- Session 006 — ODR-0006 Agents & Roles. First module to land. Produces
  Person/Organisation Kinds and ICs, the Proprietorship Relator, Address
  class location decision, and W3C-Org-vs-bespoke disposition — all
  consumed by 007 (transaction agents), 008 (Address reuse), 009 (Claims
  `prov:wasAssociatedWith`), 012 (DPV PII on Person).

**Phase 3b — Remaining modules (parallel after 006).**

- Session 007 — ODR-0007 Transactions & Lifecycle. Consumes 006 (agents
  on milestones, chain proprietors) and 014 (OWL-Time disposition).
- Session 008 — ODR-0008 Property descriptive attributes. Consumes 005
  (the class to attach to), 006 (the Address class), and 011 (SKOS for
  category-likes).

**Phase 4 — Claims + Governance (tight loop).**

- Session 009 — ODR-0009 Claims, Evidence & Provenance. Lands first
  (PROV-O backbone + assurance layer + draft DPV co-annotation pattern).
- Session 012 — ODR-0012 Data-Governance Layer. Lands immediately after
  009, with **explicit right to amend 009's DPV co-annotation** if the
  Governance deliberation surfaces a tighter pattern. Both ODRs may
  end up co-amended in a single session-012 transcript — this is allowed
  per §6 (the supersession-scope mechanism extends to back-references).

**Phase 5 — Overlay profiles (consumes ratified TBox).**

- Session 010 — ODR-0010 Overlay Profile Mechanism. Consumes 006/007/008
  (the TBox profiles constrain) and 009 (verifiedClaims overlay shape).

**Phase 6 — Closing session.**

- Session 013 — ODR-0013 SHACL Validation & Severity. Last session;
  consumes every prior ODR's shape work (006 Agents shapes, 007
  Transaction shapes, 008 descriptive shapes, 009 PROV-O shapes, 010
  profile shapes, 011 SKOS-membership shapes, 012 governance shapes,
  015 Address shapes). **Cross-cites ODR-0010 on the three-rule interface
  contract** (Cagle, Scope-Check 1 Q6).

**Phase 7 — Deferred (not running until triggered).**

- Session 016 — ODR-0016 W3C VC / DID Compatibility Layer. **Named per
  Scope-Check 1 Q7c (8-1).** Does not run until: Session 009 Q8 surfaces
  VC-side decisions; OR Session 012 Phase-2 consent receipts land; OR a
  real wallet/DID consumer enters scope. Full Council when triggered.

**Dependency graph (session-numbered)** — updated per Scope-Check 1 (2026-05-26).

```
   Phase 0:   S003 (author-only) ──▶ S002              (anchor → vocab; S014 RETIRED, folded into S002)
                                        │
   Phase 1:                             ▼
                                     S004               (Foundation — gate)
                                        │
   Phase 2:                             ▼
                                     S005               (Identity crux — gate)
                                        │
   Phase 2.5:                           ├──▶ S011       (SKOS substrate;
                                        │                + UFO meta-category per scheme;
                                        │                may parallel with S005)
   Phase 2.6:                           ├──▶ S015       (Address & Geography — NEW gate;
                                        │                must clear before S006/S008)
   Phase 3a:                            ▼
                                     S006               (Agents — feeds 007/008/009)
                                        │
   Phase 3b:                ┌───────────┴───────────┐
                            ▼                       ▼
                          S007                     S008  (Transactions, Property attrs)
                            │                       │
   Phase 4:                 └───────────┬───────────┘
                                        ▼
                                     S009 ───▶ S012     (Claims → Governance;
                                                         S012 OWNS DPV co-annotation authoring;
                                                         S009 carries one-paragraph pointer)
                                        │
   Phase 5:                             ▼
                                     S010               (Overlay profiles)
                                        │                ↕ three-rule cross-cite (Cagle)
                                        ▼               ↕
   Phase 6:                          S013               (SHACL validation — closing)

   Phase 7:                          S016               (W3C VC/DID — DEFERRED; runs only on trigger)

   ~~S014~~ RETIRED — folded into S002's ## Change log per Scope-Check 1 Q4.
```

**Trade-off recorded.** This phasing buys consistency (one SKOS pattern,
one Agent substrate, one Address class, one ratified TBox before overlays)
by losing parallelism in Phase 0 (sequential 003 → 002 instead of three-
wide parallel) and Phase 3 (006 lands before 007/008 instead of all three
parallel). Post-Scope-Check 1, the sequence delivers **12 active sessions**
(was 13 — S014 retired; S015 added; S016 deferred) in roughly 10 sequential
slots (Phase 0 ×2, Phases 1/2/2.5/2.6/3a ×5, Phase 3b ×1 with internal
parallelism, Phase 4 ×2, Phase 5 ×1, Phase 6 ×1, Phase 7 deferred). The
alternative — full parallelism inside each loose phase — risks five classes
of rework: SKOS re-litigation in three module sessions, Agent placeholders
in 007/008, Address re-invention in three modules (closed by S015),
DPV/Claims circular handoff (closed by 012 owning authorship), and severity
tiering speculation in 013.

**Gate clearance check — per-session (the gate is closed unless all three hold).**

1. The session's `## Decision` and `## Rules` resolutions answer every listed
   question, with vote tally `N-M-K` recorded per question. (For author-only
   sessions: every item recorded in `## Rules` cites its source — plan ref,
   session-001 question, or upstream session — and no novel deliberation is
   claimed.)
2. The Devil's Advocate either withdrew on each question or her sustained
   objections are explicitly captured in the ODR's `## Rules` or
   `## Consequences` as *live*, not silenced. (Skipped for author-only.)
3. The ODR's `status` moves `proposed → accepted` AND `council:` is set AND
   the ODR-0001 track-record table has the session row.

If any check fails, the gate is closed; downstream sessions wait.

**Programme-level termination signals (Scope-Check 1 Q8 convergent verdict).**

The cut is right when these six signals hold simultaneously. Tests 1–2 are
the operational gates; 3–6 are the steady-state discipline.

1. **BASPI5 round-trip closes** — JSON → loaded SHACL profile → rendered
   DASH form → validated transaction with `dct:source` traceability
   (Davis, Gandon, Kendall Test 3). The MVP gate.
2. **Property exemplars validate** at ODR-0005's gate (Guizzardi).
3. **No ODR authors a constraint another ODR also authors** (Cagle). Verify
   by grepping produced TTL for duplicate property-shape targets per
   constraint type.
4. **A new consumer's query reads ≤3 ODRs** (Hendler). Test: "EPC-A
   properties with seller acting under POA" should need three records, not
   seven.
5. **ODR-0003 diff stops moving** after Phase 1 closes (Davis, Allemang).
   Two consecutive sessions producing no anchor amendments = stable substrate.
6. **PII never accretes silently** — every new personal-data-bearing
   property triggers ODR-0012's standing-cost review; DPV tag follows the
   property across modules (Pandit).

A pre-flight scope check (§11) is run before every session; tests 3–6 are
evaluated cumulatively at session end. Tests 1–2 are evaluated at the MVP
gate (Phase 5 close).

### 5.1 MVP fast-path option

The default sequence ratifies all ODRs before the implementation ADR programme begins. That's safe but slow. ODR-0003's `## Rules` "Minimum viable subset" calls for a different shape: ratify the *minimum subset of ODRs* needed to unblock the BASPI5 vertical slice in implementation — Foundation → IC → Agents + Claims → Overlay mechanism — then resume the rest of the ratification programme in parallel with (or after) implementation begins on the slice. The **MVP gate is "BASPI5 round-trip demonstrated"** — that's an implementation milestone proving the minimum subset of ODRs is coherent enough to support real Turtle production; the round-trip itself happens in the implementation ADR programme, not here.

The **MVP fast-path** runs only the sessions needed to ratify that slice,
deferring the rest:

```
   S003 (anchor, author-only)
        │
        ▼
   S002 (vocab, full Council — absorbs former S014)
        │
        ▼
   S004 (Foundation — gate)
        │
        ▼
   S005 (Identity crux — gate)
        │
        ▼
   S011-light (SKOS for `role`, `sellersCapacity`, `assuranceLevel` only;
                UFO meta-category for those schemes only)
        │
        ▼
   S015 (Address & Geography — Reduced Council; new gate per Scope-Check 1 Q7a)
        │
        ▼
   S006 (Agents — abridged: defer Q6 W3C Org to the full session;
         Q5 Address now resolved by S015)
        │
        ▼
   S009 (Claims, full Council on PROV-O backbone only — DPV co-annotation
         deferred to the post-MVP S012; VC/DID deferred to S016)
        │
        ▼
   S010-BASPI5 (Overlay mechanism deliberated against the BASPI5 slice
                only; TA6/NTS/etc. deferred; cross-cites S013 on three rules)

   ⟵⟵ Hand off to implementation ADR programme: BASPI5 round-trip target ⟶⟶

   Then resume the rest of the ratification plan in parallel with (or after)
   the implementation slice: S007, S008 (full), S011 (full), S006 (re-open
   Q6), S012, S010 (remaining overlays), S013. S016 (W3C VC/DID) activates
   only on trigger.
```

The fast-path is **eight sessions** to reach the handoff to implementation (vs ~13 for the full ratification programme). Costs: two re-open cycles (S006 Q6 + S011 full) and deferred completeness on 007/008/012/013. Choose this when (a) value-proving is more urgent than completeness, (b) the WG needs a working demonstration before committing to the full programme, or (c) resource constraints make 13 full sessions impractical.

The default sequence (§5) and the fast-path (§5.1) are *named options* the
WG chooses between at the start of Phase 1. Session 003 (anchor) is the
place to record which option is adopted; switching after Phase 1 starts is
expensive and discouraged.

## 6. Spawn / supersession rules

A session **may spawn** a new ODR when:

- The original stub's `## Rules` cannot carry the verdict without exceeding
  the DCAP single-record discipline (the rules-section becomes a programme
  in its own right).
- The session concludes that two genuinely distinct decisions are entangled
  in the stub (e.g. ODR-0005 splitting into Property-IC and Title-IC).

The mechanism:

1. The session transcript names the spawn explicitly ("This session recommends
   spawning ODR-NNNN for X").
2. Create the new ODR via `odr-create` (next free sequential number).
3. The originating ODR moves `status: superseded` and lists the spawned
   ODR(s) in `## Rules` under a `## Supersession scope:` subsection inside
   `## Decision Outcome` (DCAP-canonical phrasing).

A session **may NOT spawn**:

- An ADR (cross-corpus). Schema-encoding decisions that surface in deliberation
  are routed to a parallel ADR record; the ODR session does not create it.

## 7. Working-file convention

Per ODR-0001 §Working-file convention. OPDA's council-directory path is `docs/ontology/odr/council/`; per-teammate files land at `working/session-N/<teammate>.md` for per-record sessions and `working/scope-check-N-<slug>/<teammate>.md` for meta-Councils. Session-001's flat-layout files (`working/allemang-hendler.md`, etc.) are left in place as historical artefact; subsequent sessions follow the subdir convention.

## 8. Execution checklist (per session)

For each session N covering ODR-MMMM:

- [ ] **Pre-flight scope check** (§11). Confirm the stub is the right unit
      of decision. If scope-check fires, escalate to a programme-level
      meta-Council before running the session.
- [ ] **Confirm gate.** The session's Phase prerequisites (per §5) have cleared.
- [ ] **Convene context block.** Queen drafts the session header per
      ODR-0001 §"Session document conventions" (Date, ODR under review,
      Queen, DA, Panel table, Input Documents, Convening constraints).
- [ ] **Spawn teammates.** Agent tool, `run_in_background: true`, one
      message per session containing all teammate spawns + the DA.
      Each teammate writes its position file at
      `working/session-N/<teammate>.md` per §7.
- [ ] **Queen synthesises.** Queen reads `working/session-N/` and writes
      `session-N-<slug>.md` per ODR-0001's body structure (Context, Question N
      sections with per-expert positions + vote, Synthesis section).
- [ ] **Amend the ODR.**
  - Set `status: accepted` (or `superseded` per §6).
  - Set `council: session-NNN`.
  - Flesh out `## Rules`, `## Consequences`, `## References` from the
      session verdicts.
  - Link the transcript from `## References`.
- [ ] **Update bidirectional links.** ODR-0001 track-record row;
      session-transcript header has the ODR link.
- [ ] **Run `odr-review`.** Lint frontmatter, section structure,
      referential integrity.
- [ ] **Run `odr-index`.** Re-index AgentDB graph so superseded /
      depended-on edges propagate.
- [ ] **Evaluate termination signals 3–6** (§5). Cumulative checks: no
      duplicate constraint authoring; ≤3-ODR consumer-query traversal;
      ODR-0003 diff stability; PII silently-accretion test.
- [ ] **(Pilot sessions only — S005, S011 Q8)** **Retire-or-extend
      evaluation.** Per Scope-Check 2 B8 + A9 ratification: the Queen
      writes a one-page evaluation in the transcript noting whether
      `consensus-mode: hive-mind/*` added value relative to Agent
      fan-out. Three outcomes: (a) RETIRE — hypothesis failed; revert
      to Agent fan-out for this session class; (b) EXTEND CAUTIOUSLY —
      hypothesis succeeded; apply to one named follow-up session
      (e.g. S015 inherits from S005; ODR-0013 inherits from S011 Q8);
      (c) EXPAND — hypothesis strongly succeeded; consider wholesale
      adoption (would require a new Scope-Check session, not session-
      level decision). Default presumption: RETIRE unless the
      hypothesis is clearly met.
- [ ] **Commit.** One commit per session: the transcript + working files +
      ODR amendment + index updates.

## 9. Risks and mitigations

Risks classified into three classes: **M** = methodology-level (often routed to ODR-0001 amendment queue); **E** = execution-level (specific to OPDA's session sequence); **S** = substrate / coordination.

| Class | Risk | Mitigation |
|---|---|---|
| **E** | Session 005 (identity crux) fails the gate | ODR-0005 stays `proposed`; modules 006–008 do not spawn sessions; queen produces a remediation plan as part of the failed session's `## Synthesis`. |
| **E** | Session 006 (Agents gate) drifts and blocks 007/008/009/012 | Timebox 006 to one session-cycle; if it overruns, queen splits the unresolved question into a follow-up sub-session (006b) and ratifies the rest. |
| **E** | Session 011 (SKOS substrate) takes a position the modules then dispute | If a module session genuinely needs to break the 011 pattern (e.g. an enum that legitimately wants OWL `oneOf`), the module session records the exception and 011 is amended via a follow-up session. Substrate is normative-by-default, not unbreakable. |
| **E** | Session 009 amendments by session 012 cascade further | 012's right to amend is bounded to *DPV co-annotation*. Changes that touch 011's SKOS pattern or 006's Person Kind require a separate amendment session, not in-line edits to 009. |
| **E** | Two sessions reach conflicting verdicts on a shared question (ODR-0006 Q7 / ODR-0007 Q3 — `participantStatus` / `status` Phase question) | 006 owns the Phase-apparatus question by phase order (it ratifies first); 007 inherits. If 007 genuinely needs to deviate, it records a `## Supersession scope:` entry on 006 and the deviation flows back as an amendment to 006. |
| **E** | A session's question turns out to need OPDA WG input (literal namespace string, versioning scheme, MLR-2017 alignment, AGM ratification timing) | Council does not block on WG-owned answers. Session records the question in the ODR's `## Rules` with the marker `**WG decision pending:**`; ODR moves to `accepted`; when WG returns the answer, an author-only follow-up session fills the stub. |
| **E** | Session 011 (SKOS substrate) lacks module context to deliberate well | 011 may need to run twice: a substrate session (cardinality, definition source, lifecycle) from the schema alone, plus a Phase-3.5 audit session after modules ratify (fixing specific per-scheme decisions). Audit lands as ODR-0011 amendment or spawned ODR-0011b. |
| **S** | Sessions stall on absent named-expert position | Vote `abstain` per ODR-0001 §"No silent vote-padding". Recorded, not faked. |
| **S** | Spawned ODRs explode the count | Session must name the spawn explicitly and justify the split. ODR-0003 anchor + dependency graph updated. |
| **S** | Working-file artefacts become stale when an ODR is later amended | Position files are append-only; transcript is canonical. Amendments create a new session (sub-letter or successor), not edits to old working files. |
| **S** | Gandon's typed-memory minority position (Scope-Check 2 Q4) | Gandon: adopt `hive-mind_memory` for S009→S012 + S016 triggers. Outcome NOT ADOPTED (5-1; Allemang asymmetric-cost wins). Mitigation: revisit only if `odr-review` lint produces a silent seam divergence in practice. Persistence layer for the programme is ODR-0003, not the Council. |
| **M** | Hendler's preserved dissent on ODR-0014 retirement (Scope-Check 1 Q4 vote 7-1-1) | Hendler: "every governance act stays permanently." Recorded as a live methodological position. Implication: future amendment-pattern questions (DCAP) should revisit whether amendment-records are warranted as a class. Routed to ODR-0001 amendment queue. |
| **M** | Gandon-vs-Guizzardi methodology gap (Scope-Check 1 Q6) | "Does an ODR record an artefact-engineering decision (Gandon) or an ontological commitment (Guizzardi)?" DCAP implicitly favours Guizzardi but never says so. Routed to **Session A9** (Pre-Phase). Not blocking for B2/B3 pilots but recommended before S005. Default Guizzardi reading until A9 resolves. |
| **M** | Davis (DA) Q1 held dissent on Scope-Check 2 selective adoption | Davis: "no session type yet justifies hive-mind without a named operational failure." Mitigation: pilots are experiments testing hypotheses with retire-or-extend evaluation. |
| **M** | Davis (DA) Q5 held dissent on ceremony cost | Davis: "ceremony pays every session; benefits speculative." Mitigation: pilots are bounded (~12 incremental agent runs total). If pilots retire, no permanent two-protocol overhead. |
| **M** | Davis (DA) Q6 held dissent — selective is worst, not moderate | Davis: "two protocols cost more than one." Mitigation: pilots are an **evaluation budget, not an adoption commitment**. If pilots fail, methodology returns to single-protocol Agent fan-out — Davis's position vindicated. |

## 10. Execution model

The plan above defines *what* each session decides. This section defines
*how* a session is run — who acts, how long it takes, what happens between
sessions, and what the real cost looks like.

**Roles in practice.**

| Actor | Role | Tool |
|---|---|---|
| **User (Henrik)** | Convenes a session by naming the ODR. Reviews and commits the transcript + ODR amendment. | Conversation |
| **Claude (me) in the conversation** | Acts as the Queen for the session — drafts the convening block, spawns teammates, reads working files, writes the synthesis, applies the ODR amendment, updates the index. | `Agent` (spawn) + `Write`/`Edit` (amend) |
| **Teammates** | Each named expert (or pair) writes its position file in its own context window. Output: one Markdown file per teammate at `working/session-NNN/<teammate>.md`. | `Agent` with `run_in_background: true` |
| **Devil's Advocate** | Always its own teammate (`da-solo`), to keep objections context-isolated. | `Agent` (separate spawn) |

There is no per-session manual orchestration of nine separate human experts.
The Council is *simulated* — that is exactly what ODR-0001 commits to. The
named-expert discipline is preserved by per-teammate prompting (each
teammate is briefed with its expert's published methodology, the input
documents, and the questions), not by routing to real people.

**Session duration.** One Council session is one conversation turn-set. A
Full Council session for a meaty ODR (e.g. ODR-0005) plausibly runs
~30–60 minutes of wall-clock time: ~5 minutes to convene, ~15 minutes of
fan-out (six teammates in parallel), ~10 minutes of Queen synthesis,
~10 minutes of ODR amendment + linting + index update. A Reduced Council is
~half that. Author-only is ~10 minutes.

**Between-session activity.** The plan does not require off-Council
homework, but the WG owns three classes of work that happen between
sessions:

1. **WG-owned answers** — questions the session deliberately defers to the
   working group (literal namespace string, versioning scheme, MLR-2017
   alignment). The session records the question; the WG returns the answer;
   a follow-up author-only mini-session records the WG's decision in the
   ODR's `## Rules`.
2. **Diagnostic exemplars** — ODR-0004 fixes the exemplar policy; the
   exemplars themselves (registered freehold house, etc.) are authored
   between session 004 and session 005, otherwise 005 can't run.
3. **Commit hygiene** — one commit per session: transcript + working files +
   ODR amendment + index updates + ODR-0001 track-record row. The next
   session reads from a clean tree.

**Cost and tractability — the real numbers** (post-Scope-Check 1).

| Tier | Sessions in plan | Teammate runs each | Total runs |
|---|---|---|---|
| Full Council | 002, 004, 005, 006, 007, 008, 009, 011, 012, 013 — **10** | 6 teammates + 1 DA + 1 Queen synthesis = 8 | 80 |
| Reduced Council | 010, 015 — **2** | 1 pair + DA + Queen = 3 | 6 |
| Author-only | 003 — **1** | 1 (Queen only) | 1 |
| ~~Retired~~ | ~~014~~ | retired by Scope-Check 1 Q4 | 0 |
| Deferred | 016 — **1** (does not run in Phase 1) | when triggered: 8 (Full Council) | 0 in Phase 1 |
| **Total** | **13 active sessions in Phase 1** | | **87 agent runs** |

(Session 010 is reduced because the BASPI5 slice in ODR-0010 has already
been pressure-tested in session-001. Session 015 is reduced because the
load-bearing question — UFO category for Address — narrows the panel.)

The net cost is essentially unchanged from the pre-Scope-Check-1 plan
(saves ~3 runs from S014 retire; adds ~3 runs from S015 spawn; S016 is
deferred). The **shape** of the work changes more than the cost: one fewer
catalogue-amendment session, one new gate before the Agents module, one
deferred VC/DID record named forward.

The fast-path (§5.1) drops the totals to ~50 runs to reach the MVP gate,
with the remainder deferred until post-MVP.

**Scope-Check 1 cost (recorded for cost-tracking).** This meta-Council
ran 6 teammates (Queen + DA + 4 panel teammates) = ~7 agent runs plus
synthesis. Programme overhead amortised across 13 ODR ratification sessions.

**Context-window pressure.** Each Queen synthesis reads ~6 working files
(~600–1,200 lines, per session-001 evidence). Plus the input documents
(stub ODR, session-001 transcript slice, schema slice). A Full Council
session's Queen turn plausibly consumes 30k–60k tokens of input before
producing the synthesis. This is well inside Claude's window but is *not
free* — the practical implication is one Queen synthesis per conversation,
not multiple. A single conversation should not try to run more than one
Full Council session.

**Practical scheduling.** Phase 0 (003 author-only + 002 + 014) plausibly
fits in one or two days. Phases 1 → 6 then proceed at roughly one
Full-Council session per working day, with Phase 3b (007 ∥ 008) genuinely
parallel (separate conversations, separate days, or the same day if the
user is willing to run two conversations). Total programme: ~10–14
working days. Fast-path: ~6–8 working days to the MVP gate.

## 11. Pre-flight scope check — OPDA candidates

The scope-check protocol (three outcomes: ratify-as-is / re-scope / retire) is defined in ODR-0001 §Pre-flight scope check. This section names the OPDA-specific candidates the Queen should screen against before convening each session.

**Scope-check precedent:** [Scope-Check 1](../odr/council/scope-check-1-programme.md) and [Scope-Check 2](../odr/council/scope-check-2-hive-vs-swarm.md) were programme-level meta-Councils. Session-level scope checks follow the same shape; substantive findings escalate to a new Scope-Check N record.

**OPDA candidates:**

- **ODR-0008 (descriptive attributes) sub-module split** — Scope-Check 1 Q2
  vote 2-7 *deferred* the split. Two named candidate splits with triggers:
  - **Kendall's four-way split** (built-form / energy & utilities /
    searches / encumbrances) — trigger: encumbrances surface a distinct
    attachment to `opda:LegalEstate` rather than `opda:Property` (per
    Kendall's decisive reason). Splits along UFO meta-category lines per
    Guizzardi.
  - **Cagle's leaf-vs-structured-value split** (datatype properties vs
    Survey / EPC / Search Report as Kinds) — trigger: structured-value
    objects acquire their own PROV-O `prov:wasDerivedFrom` chains and
    SHACL node shapes distinct from the leaf shapes.
  Either trigger fires within Session 008's deliberation → spawn ODR-0008a/b
  per §6 spawn rule.
- ~~ODR-0014 (vocabulary amendments)~~ — **RETIRED** by Scope-Check 1 Q4
  (vote 7-1-1; Hendler dissent on permanence preserved in §9). Folded into
  ODR-0002's `## Change log`.
- **ODR-0010 (overlay profiles)** — the BASPI5 round-trip evidence might
  warrant spawning a sibling ODR for *non-BASPI5* overlays (TA6, NTS, etc.)
  once the round-trip clears.
- **ODR-0015 (Address & Geography)** — UFO category question (Kind / Quale /
  Mode) is gate-shaped; if Session 015 fails to clear, Sessions 006 and 008
  wait. Scope-check trigger: address-as-Kind vs address-as-Quale exemplar
  validation.

The scope check is the cheap defence against ratifying-the-wrong-stub. It
does not replace the session; it precedes it.

## 12. Out of scope for this plan

- **Implementation of the ratified ODRs** — Turtle files, SHACL shape libraries, generator code, JSON-LD contexts, CI hooks, build pipelines. This is the **separate ADR programme** referenced in §1. Each ODR accepted by Council triggers one or more implementation ADRs under `docs/adr/`; the ADR programme has its own plan (not this one). The boundary is the DCAP "ontology-modelling decisions are ODRs; schema-encoding decisions are ADRs" rule.
- **Cross-corpus ADR amendments surfaced during Council sessions** — routed to `adr-create` and tracked under the ADR programme, not this plan.
- **Real-world OPDA governance** (WGs, Sub-Committees, AGM ratification). Per ODR-0001 §Consequences: Council verdicts shape *proposals*; OPDA governance shapes *adoption*. Council sessions produce inputs to that governance; they do not substitute for it. The handoff is declared in the [adoption record §Real-world Governance Handoff](../odr/council/adoption.md).
- **Substrate operations details** — MCP tool internals, hive-mind sub-queen escalation algorithms, persistence backend choices. These are defined in ODR-0001 §Substrate operations + §Config options; the plan invokes them but does not re-specify them.

## References

- Council methodology: [ODR-0001](../odr/ODR-0001-linked-data-council-methodology.md).
- Anchor: [ODR-0003](../odr/ODR-0003-pdtf-ontology-programme.md) — this plan implements its work-breakdown.
- Inaugural session: [session-001](../odr/council/session-001-pdtf-schema-to-ontology.md).
- DCAP profile: [DCAP.md](../odr/DCAP.md).
- ODR template: `odr-create` skill (`/Users/henrik/.claude/skills/odr-create/`).
