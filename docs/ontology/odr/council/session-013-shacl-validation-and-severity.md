# Council Session 013 — SHACL Validation & Severity (Phase 6 CLOSING)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0013 — SHACL Validation & Severity](../ODR-0013-shacl-validation-and-severity.md) (`kind: architecture`; relaxed A9).
- **Queen:** **Holger Knublauch** (SHACL Recommendation co-author + DASH; owns severity tier authorities per S001 Q5 + plan §S013).
- **Devil's Advocate:** Kurt Cagle (S001 Q5 aiHint exile carry — verifies annotation graph operational vindication).
- **Panel (3 teammates + DA + Queen synthesis):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | formal-pair | Gandon + Guizzardi | [gandon-guizzardi.md](./session-013-shacl-validation-and-severity/gandon-guizzardi.md) |
  | pragmatic-pair | Allemang + Hendler | [allemang-hendler.md](./session-013-shacl-validation-and-severity/allemang-hendler.md) |
  | moreau-prov-time-extended | Luc Moreau (PROV-O severity tier) | [moreau-prov-time.md](./session-013-shacl-validation-and-severity/moreau-prov-time.md) |
  | da-solo | **Kurt Cagle (DA)** | [cagle-da.md](./session-013-shacl-validation-and-severity/cagle-da.md) |

- **Input Documents:** ODR-0013 stub; ODR-0010 (3-rule interface contract — cross-cite per Cagle Scope-Check 1 Q6); **ODR-0017 §2a (amendment triggered by S010 Q6 — admit `sh:Violation` for meta-shape-over-shape-graph)**; ODR-0018 (DPV class-level pattern + Pandit S012 Q3 special-category SHACL); every prior session's shape work.
- **`consensus-mode`:** `agent-fan-out` with two-artefact discipline (DEFAULT).
- **Format tier:** Full Council. **Phase 6 — CLOSING SESSION.**

## Context

ODR-0013 is the closing session. It inherits every prior ODR's shape work and ratifies the system-level severity floor, constraint mapping completeness, DASH UI coverage, annotation graph operational vindication (Cagle's S001 Q5 carry), reporting surface, profile/base interaction, and the three-rule interface contract with ODR-0010 (Cagle Scope-Check 1 Q6 amendment).

**Critical incoming amendment:** ODR-0017 §2a (the three-tier severity decision table) is triggered for extension by S010 Q6's `opda:ProfileIdentityOverrideCheckRule` at `sh:Violation` — meta-shape-over-shape-graph drift is normative-breaking, NOT informative. ODR-0013 §Rules lands the §2a amendment text inline as part of the severity-tier ratification.

This is the **fifth `kind: architecture` ODR** to discharge (after ODR-0001/0003/0004/0012/0010). Combined with six `kind: pattern` ODRs (ODR-0005/0015/0011/0006/0007/0009) + three pattern-extraction records (ODR-0017/0018 + ODR-0001 EXPAND amendment), this is the final ODR in the original 14-session plan.

## Pre-flight scope check

Outcome: **ratify-as-is**. Phase 6 closing; all upstream gates cleared.

## Question-by-question verdicts

### Q1 — Severity tiers (LOAD-BEARING with ODR-0017 §2a amendment)

**Verdict: 10-0 FOR four-tier severity framework** + five hard-case IC. `sh:Violation` reserved for FIVE categories:

1. **Identity-key missing** (per ODR-0005 §Rule 3 `dash:uniqueValueForClass`).
2. **IC breach over named hard cases** (per S005 §3a-c, S006 Q1, S007 Q5, S015 §3a, S011 §5a — every `kind: pattern` ODR's IC).
3. **No-identity-override** (per ODR-0010 §Q6 — overlay profile touching identity-key predicates).
4. **Special-category PII without lawful-basis** (per ODR-0012 §Q3 — GDPR Art. 9; Cagle's `opda:SpecialCategoryWithoutLawfulBasisShape`).
5. **Meta-shape-over-shape-graph drift** (per ODR-0010 §Q6 + ODR-0017 §2a NEW amendment — category-error case where the shape graph itself violates a meta-shape constraint).

`sh:Warning` for data-quality findings with re-open triggers (same-variant disagreement; overdue milestones; substantive-redefinition without `prov:wasDerivedFrom` chain).

`sh:Info` for non-blocking informative materialisations (UPRN succession; deprecation chain; PROV-O lineage; lease-term-succession; milestone variance under threshold) — 11 ODR-0017 citing sites all land in this tier.

**ODR-0017 §2a AMENDMENT LANDED INLINE in ODR-0013 §Rules:**

The original §2a three-tier table admitted only `sh:Info` (data-graph state-with-substantive-succession) and `sh:Warning` (data-graph state-without-succession). The NEW row admits `sh:Violation` for **meta-shape-over-shape-graph drift** (category-error case: the shape graph itself violates a meta-shape constraint, e.g. overlay profile touching identity key per ODR-0010 §Q6). Narrowly scoped — data-graph `sh:Violation`-NEVER floor holds for ordinary ODR-0017 SHACL-AF rules. The amendment text lands as ODR-0013 §Rules.7-tier-amended.

### Q2 — Constraint mapping completeness

**Verdict: 10-0 CONCEDE** stub mapping table per Knublauch. JSON Schema → SHACL coverage complete. PROV-O properties (`prov:atTime`, `prov:wasAttributedTo`, `prov:qualifiedAttribution`) get `sh:datatype xsd:dateTime`, `sh:class prov:Agent`, `sh:class prov:Attribution` respectively (Moreau amendment).

### Q3 — DASH UI coverage

**Verdict: 10-0 FOR per-form DASH coverage audit as operational deliverable** (Hendler LDP P3 + Cagle ODR-0017 §3a Hellmann discipline + `odr-review` lint extension for per-shape DASH validation). Audit lands at `profiles/<form>/audit.md` per ODR-0010 §Q4 precedent.

### Q4 — Annotation graph operational vindication (Cagle DA PRIMARY VIGILANCE — his S001 carry)

**Verdict: 10-0 FOR aiHint exile preservation** (Cagle's S001 Q5 win ratified). ODR-0013 §Rules cross-cites ODR-0004 §3a CI tests + names AI-RDF consumer use case verbatim:

> "LLM consumers query annotation graph (`opda-annotations.ttl`) for advisory annotations (`opda:aiHint`, `opda:uiHint`, `opda:exampleValue`, `opda:presentationOrder`). LLM consumers MUST NOT query shapes graph (`opda-shapes.ttl`) for advisory annotations. CI tests per ODR-0004 §3a enforce: (1) no `sh:` triples in annotation graph; (2) no `opda:aiHint` in shapes graph."

**Cagle DA Q4 PRIMARY VIGILANCE WITHDREW** on the cross-cite + AI-RDF use case naming.

### Q5 — Reporting surface (Allemang two-layer)

**Verdict: 10-0 FOR two-layer reporting** — SHACL-native `sh:ValidationReport` as canonical tooling-consumer artefact (LLM consumption per ODR-0017 §3a Hellmann lesson); flattened error-list operational layer for conveyancer UI (deterministic SPARQL CONSTRUCT derivation; generator-emitted; regression-covered). Layer 1 canonical authority; Layer 2 derived view, NOT parallel ontology.

### Q6 — Profile interaction with base shapes

**Verdict: 10-0 FOR Knublauch §1a composition discipline** + ODR-0010 §Q6 no-identity-override gate enforcement. Profiles ADD `sh:minCount 1` (additive); CANNOT WEAKEN below `sh:Violation` floor (Cagle Scope-Check 1 Q6 three-rule contract); CANNOT TOUCH identity-key predicates (ODR-0010 §Q6 meta-shape SHACL `sh:Violation` enforcement). Moreau worked example: BASPI5 × electronic-record-evidence composition preserves base shapes + adds profile-specific constraints.

### Q7 — Three-rule interface contract with ODR-0010 (LOAD-BEARING)

**Verdict: 10-0 FOR cross-cite mechanism** per Cagle Scope-Check 1 Q6 amendment. Three rules:

1. **`sh:in` semantics** — merged at build time per ODR-0010 §1a Rule 2 (build-step replacement, NOT entailment).
2. **`sh:Violation` floor** — profile cannot weaken below floor; this ODR (ODR-0013) OWNS the floor; ODR-0010 §Q6 INHERITS and ENFORCES.
3. **No-identity-override gate** — profile cannot touch a Kind's identity key; ODR-0013 OWNS identity-key list (from ODR-0005); ODR-0010 §Q6 ENFORCES via SHACL meta-shape at `sh:Violation`.

Cross-cited in BOTH ODR-0013 §References AND ODR-0010 §References. Author-only follow-up amendment to ODR-0010 §Q6 + §References will close the loop (flagged).

## Synthesis

This session ratifies ODR-0013 as the Phase 6 CLOSING SESSION. Seven moves:

1. **Four-tier severity framework** with five hard-case `sh:Violation` categories — including the NEW `sh:Violation` for meta-shape-over-shape-graph (ODR-0017 §2a amendment).
2. **Constraint mapping completeness** + PROV-O property typing (Moreau).
3. **DASH per-form audit** as operational deliverable.
4. **AiHint exile operational vindication** — Cagle's S001 Q5 win ratified; cross-cited ODR-0004 §3a CI tests + AI-RDF use case named.
5. **Two-layer reporting** — SHACL-native canonical + flattened conveyancer UI derived.
6. **Profile composition** per Knublauch §1a + ODR-0010 §Q6 no-identity-override enforcement.
7. **Three-rule interface contract cross-cite** with ODR-0010 (Cagle Scope-Check 1 Q6 amendment operationalised).

**ODR-0017 §2a AMENDMENT LANDED INLINE.** New severity tier row admits `sh:Violation` for meta-shape-over-shape-graph drift. Narrowly scoped; data-graph `sh:Violation`-NEVER floor preserved for ordinary citing sites.

**The plan is COMPLETE.** ODR-0013 closes Phase 6. Original 14-session plan: 11 Full+Reduced Councils executed (A9 pre-phase + S002-S015 minus S008-deferred + S016-deferred-until-trigger); 3 Author-only pattern records (ODR-0001 EXPAND, ODR-0017, ODR-0018); ODR-0017 §2a amendment inline; methodology coherence pressure-test passes.

**Outstanding work** (post-S013):

- **S008 Property Descriptive Attributes** — DEFERRED on S005 cardinality crystallisation (Kendall+Davis joint amendment from S005). When the 3-class commitment crystallises into operational leaf-to-class mapping, S008 can convene. The Quale-in-Region framework from ODR-0011 §8a is staged for descriptive schemes.
- **S016 W3C VC/DID Compatibility Layer** — DEFERRED until trigger (Scope-Check 1 Q7c; activated by S009 Q8 VC-side decision OR S012 Phase-2 consent receipts OR named wallet/DID consumer).
- **ODR-0010 §References cross-cite** — Author-only follow-up to update ODR-0010 with the three-rule interface contract reciprocal cite.
- **Phase-3.5 audit session** — Q3 cross-vocabulary mapping (S011 deferral) + SSSOM re-open trigger (S002 Q11). Post-MVP.

**BASPI5 round-trip is the MVP gate** (S010 Q7 + ODR-0003 §Rules). When BASPI5 loads + validates + regenerates form using the now-ratified stack, the methodology has demonstrated end-to-end coherence across all 14 ODRs.

## Two-artefact structured tally

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 |
|---|---|---|---|---|---|---|---|
| Guizzardi (formal-pair) | F | C | F | F | F | F | F |
| Gandon (formal-pair) | F | C | F | F | F | F | F |
| Allemang (pragmatic-pair) | F | C | F | F | F | F | F |
| Hendler (pragmatic-pair) | F | C | F | F | F | F | F |
| Moreau (extended) | F | C | F | F | F | F | F |
| Cagle (DA) | F | C | C | W | F | C | F |

Note: Cagle is DA but takes load-bearing positions on Q1 (severity tier + ODR-0017 amendment), Q4 (his aiHint carry — STRONG SUPPORT after withdrawal), Q5 (SHACL-native canonical), Q7 (his Scope-Check 1 Q6 amendment operationalised). F means he aligns with the verdict; W means his Q4 DA vigilance withdrew on cross-cite.

**Cagle DA scorecard:** 5 conceded + 1 withdrew (Q4 PRIMARY VIGILANCE) + 0 held. 7 of 7 closed.

## Track record

- **Session 013 — ODR-0013 SHACL Validation & Severity** (Phase 6 CLOSING). Full Council (5 runs: formal-pair + pragmatic-pair + Moreau-extended + Cagle-DA + Queen Knublauch synthesis). Two-artefact discipline. Queen Knublauch (extended SHACL co-author); DA Cagle (S001 Q5 aiHint exile carry — 5 conceded / 1 withdrew on Q4 PRIMARY VIGILANCE). **`kind: architecture` ODR (relaxed A9; fifth and final architecture discharge — after ODR-0001/0003/0004/0012/0010).** Q1 10-0 FOR four-tier severity framework with FIVE `sh:Violation` categories (identity-key missing / IC breach / no-identity-override per ODR-0010 Q6 / special-category PII without lawful-basis per ODR-0012 Q3 / **meta-shape-over-shape-graph drift — NEW per ODR-0017 §2a amendment**). **ODR-0017 §2a AMENDMENT LANDED INLINE in ODR-0013 §Rules.** Q2 10-0 CONCEDE mapping table + Moreau PROV-O property typing. Q3 10-0 FOR per-form DASH audit deliverable. **Q4 10-0 FOR aiHint exile operational vindication (Cagle DA PRIMARY VIGILANCE WITHDREW** on cross-cite ODR-0004 §3a CI tests + AI-RDF consumer use case named verbatim). Q5 10-0 FOR two-layer reporting (SHACL-native canonical + Allemang flattened conveyancer UI derived). Q6 10-0 FOR Knublauch §1a composition + ODR-0010 Q6 enforcement. **Q7 10-0 FOR three-rule interface contract cross-cite mechanism** operationalising Cagle Scope-Check 1 Q6 amendment (ODR-0013 owns `sh:Violation` floor + identity-key list; ODR-0010 §Q6 enforces via meta-shape). ODR-0013 retrofit `implements: [ODR-0003, ODR-0017]` + depends-on extends to all prior `kind: pattern` ODRs. **status:proposed retained** per namespace block. **The plan is COMPLETE.** Outstanding: S008 (deferred-on-cardinality); S016 (deferred-until-trigger); ODR-0010 §References cross-cite (Author-only follow-up); Phase-3.5 audit (post-MVP). BASPI5 round-trip is the MVP gate.
