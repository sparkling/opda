# Council Session 012 — Data-Governance Layer (Phase 4 follow)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0012 — Data-Governance Layer](../ODR-0012-data-governance-layer.md) (`kind: architecture`; A9 relaxed regime).
- **Queen:** **Harshvardhan Pandit** (DPV CG chair; W3C DPV 2.0; owns the DPV authoring authority per Scope-Check 1 Q5 refinement).
- **Devil's Advocate:** Elisa Kendall (reference-not-import; her S002 Q4 amendment).
- **Panel (4 teammates + DA + Queen synthesis):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | formal-pair | Gandon + Guizzardi | [gandon-guizzardi.md](./session-012-data-governance-layer/gandon-guizzardi.md) |
  | iannella-extended-solo | Renato Iannella (Pandit is Queen; pair shrinks) | [iannella-solo.md](./session-012-data-governance-layer/iannella-solo.md) |
  | shacl-solo | Kurt Cagle | [cagle.md](./session-012-data-governance-layer/cagle.md) |
  | baker-solo | Tom Baker (Pandit is Queen; pair shrinks) | [baker-solo.md](./session-012-data-governance-layer/baker-solo.md) |
  | da-solo | **Elisa Kendall (DA)** | [kendall-da.md](./session-012-data-governance-layer/kendall-da.md) |

- **Input Documents:** ODR-0012 stub; **ODR-0018** (this session's load-bearing input — DPV class-level co-annotation pattern; ODR-0012 is named authoring authority per ODR-0018 §Rules clause 7); ODR-0009 Q6 pointer; ODR-0005 §3c + ODR-0015 §7a + ODR-0006 §Q1+Q4 (the four DPV-pattern citing sites); ODR-0011 §1a (steward discipline); ODR-0002 §Reference-not-import (Kendall S002 amendment); ODR-0017 (SHACL-AF pattern; tenth citing site lands at Q5).
- **`consensus-mode`:** `agent-fan-out` with two-artefact discipline (DEFAULT per ODR-0001 EXPAND).
- **Format tier:** Full Council. Phase 4 follow.

## Context

ODR-0012 is the Data-Governance Layer — Phase 4 follow, immediately after S009. The stub is `kind: architecture` (relaxed A9 regime; doesn't require UFO/IC commitments inline). The session ratifies the stub + consumes ODR-0018's authoring contract + closes Pandit's S001 dissent on lawful-basis class vocabulary at TBox level.

The session inherits substantial substrate: four citing sites of class-level DPV pattern (ODR-0005 §3c + ODR-0015 §7a + ODR-0006 §Q1+Q4 + ODR-0009 §Q6); ODR-0018 mapping-table mechanism + verbatim regulator citation discipline; ODR-0011 §1a steward discipline; ODR-0017 SHACL-AF pattern (tenth citing site likely at Q5); Kendall S002 Q4 reference-not-import amendment (her DA framing inherits).

## Pre-flight scope check

Outcome: **ratify-as-is**. Stub coherent; Phase 4 follow unblocked.

## Question-by-question verdicts

### Q1 — DPV Phase-1 scope (curated vs every-PII)

**Verdict: 10-0 FOR curated set** consuming the four ODR-0018 citing sites' Kinds (Person/Organisation/Address/RegisteredTitle/Evidence-subclasses). Baker amendment: each Kind in the curated set has a NAMED STEWARD per ODR-0011 §1a discipline (DCMI Usage Board precedent + FIBO lead+deputy).

### Q2 — Lawful-basis class vocabulary (Pandit S001 dissent — load-bearing; Kendall DA PRIMARY VIGILANCE)

**Verdict: 10-0 FOR TBox lawful-basis class vocabulary via reference-not-import** per ODR-0018 §3a mapping-table mechanism. Pandit's S001 dissent vindicated by ODR-0018 four-site spawn — the class vocabulary IS TBox-expressible (the mapping tables ARE the artefact).

**Kendall DA Q2 PRIMARY VIGILANCE WITHDREW** on §Rules text per the formal-pair amendment: ODR-0012 §Rules names lawful-basis vocabulary as **imported-by-reference** (`dct:source` to DPV CG specification with version pin per ODR-0004 §7a + ODR-0018 §6 verbatim regulator citation discipline) — NOT as full DPV TBox import. The mapping tables in ODR-0018 §3a are the OPDA-authored artefact; the DPV TBox stays external.

`opda:LawfulBasisScheme` adopted as SKOS scheme per S011 §8a (Method/plan code per Baker analysis — different validation/processing methods → different lawful-basis assignments); Pandit confirms.

### Q3 — Article-10 / special-category

**Verdict: 10-0 FOR Pandit's Article-10 depth** + adopted amendments:

- **Cagle `opda:SpecialCategoryWithoutLawfulBasisShape` at `sh:Violation`** for special-category PII without explicit `dpv:hasLawfulBasis` (GDPR Art. 9 requires explicit basis; ordinary SHACL Core constraint, NOT an ODR-0017 instantiation — different severity tier).
- **Baker `opda:SpecialCategoryScheme`** SKOS scheme with named steward + AML-outcomes sub-scheme distinct from Art. 9 special-category (AML outcomes per UK MLR 2017 §28 are regulatory-outcome category; Art. 9 special-category is criminal/health/political; different lawful-basis families).
- **Pandit class-level + variant-conditional pattern** per ODR-0018 §3a applies to special-category Kinds (cautionOrConviction → criminal-data variant; AML outcome → financial-crime-regulatory variant).

### Q4 — ODRL deferral activation trigger (Kendall DA MILD ATTACK)

**Verdict: 10-0 FOR ODRL deferral with three named activation triggers** (Iannella authority):

1. **Phase-2 W3C VC consent receipts** (coupled with `cred:` / `did:` admission per S002 Q10 + ODR-0016 trigger per Scope-Check 1 Q7c).
2. **OPDA Trust Framework policy instances** (Sub-Committee publishes a TF policy referencing OPDA-modelled rights/obligations).
3. **Named consumer regulatory requirement** (a regulatory body wants ODRL-expressed consent for cross-jurisdiction recognition).

**Kendall DA Q4 MILD ATTACK WITHDREW** on §Rules text explicitly naming the three triggers (mechanical re-opening). Until activation, ODRL stays in ODR-0002 Defer tier (S002 Q10 settled).

### Q5 — PII discovery automation hook

**Verdict: 10-0 FOR Cagle's `opda:PIIWithoutDPVCoAnnotationRule`** at `sh:Warning` per ODR-0017 §1a template — **10th citing site of ODR-0017**. Targets `opda:PIIBearingKind` marker class derived from ODR-0018 §Rule 1 baselines. Three-part falsifiable operational test. ODR-0012 retrofits `implements: [ODR-0017, ODR-0018]`.

### Q6 — W3C VC consent receipts (Phase-2 ambition)

**Verdict: 10-0 DEFER to ODR-0016** (Scope-Check 1 Q7c — Phase 7 deferred-until-trigger). Activation coupled with Q4 Iannella-Trigger 1.

### Q7 — Boundary with Claims (ODR-0009)

**Verdict: 10-0 SETTLED** per ODR-0009 Q6 + ODR-0018 §Rules clause 7 + Scope-Check 1 Q5. ODR-0012 is named DPV authoring authority; ODR-0009 carries one-paragraph pointer; ODR-0018 provides the pattern + mapping-table mechanism. Mechanical handoff.

## Synthesis

This session ratifies ODR-0012 as the Data-Governance Layer authoring authority. ODR-0012 is `kind: architecture` (relaxed A9 — Guizzardi precedent: ODR-0001/0003/0004 are architecture; ODR-0012 follows). Eight moves:

1. **Curated set scope** (Q1) — consume the four ODR-0018 citing sites' Kinds.
2. **TBox lawful-basis class vocabulary via reference-not-import** (Q2) — Pandit S001 dissent vindicated; Kendall DA reference-not-import discipline preserved.
3. **Article-10 special-category depth** (Q3) — Cagle `sh:Violation` shape + Baker SpecialCategoryScheme + Pandit class-level pattern.
4. **ODRL deferral with three named triggers** (Q4) — Iannella authority; Kendall DA condition met.
5. **PII automation hook** (Q5) — Cagle SHACL-AF rule; 10th ODR-0017 citing site.
6. **W3C VC consent receipts deferred** (Q6) — to ODR-0016.
7. **Boundary with Claims settled** (Q7) — per ODR-0009 + ODR-0018 mechanical handoff.
8. **`opda:LawfulBasisScheme` + `opda:SpecialCategoryScheme`** SKOS schemes adopted with Baker steward discipline.

**Downstream:** ODR-0010 (Overlay Profile Mechanism) and ODR-0013 (SHACL Validation & Severity) inherit DPV co-annotation profile-filtering + special-category severity tier.

**Pattern-extraction watch:** governance-layer SHACL-AF rules family (Cagle PIIWithoutDPV + SpecialCategoryWithoutLawfulBasis); not yet four citing sites; tracked for future spawn.

## Two-artefact structured tally

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 |
|---|---|---|---|---|---|---|---|
| Guizzardi (formal-pair) | F | F | F | F | F | C | C |
| Gandon (formal-pair) | F | F | F | F | F | C | C |
| Iannella (extended) | F | F | F | F | F | C | C |
| Baker (solo) | F | F | F | F | F | C | C |
| Cagle (shacl-solo) | F | F | F | F | F | C | C |
| Kendall (DA) | C | W | C | W | C | C | C |

| Q | F | A | H | W/C | Verdict |
|---|---|---|---|---|---|
| Q1 | 5 | 0 | 0 | 1 C | 10-0 FOR curated set + Baker steward |
| Q2 | 5 | 0 | 0 | 1 W | 10-0 FOR reference-not-import TBox lawful-basis (Kendall DA condition met) |
| Q3 | 5 | 0 | 0 | 1 C | 10-0 FOR Article-10 depth + Cagle `sh:Violation` + Baker SpecialCategoryScheme |
| Q4 | 5 | 0 | 0 | 1 W | 10-0 FOR ODRL deferral with three named triggers (Kendall DA condition met) |
| Q5 | 5 | 0 | 0 | 1 C | 10-0 FOR Cagle SHACL-AF + ODR-0017 10th citing site |
| Q6 | 5 | 0 | 0 | 1 C | 10-0 DEFER to ODR-0016 |
| Q7 | 5 | 0 | 0 | 1 C | 10-0 SETTLED per ODR-0009 + ODR-0018 |

**Kendall DA scorecard:** 5 CONCEDED + 2 WITHDREW on §Rules-text amendments (Q2 reference-not-import preserved; Q4 three triggers named). 7 of 7 closed.

## Track record

- **Session 012 — ODR-0012 Data-Governance Layer** (Phase 4 follow). Full Council (6 runs: formal-pair + Iannella-extended-solo + Cagle-solo + Baker-solo + Kendall-DA + Queen Pandit synthesis). Two-artefact discipline. Queen Pandit (DPV CG chair; authoring authority per Scope-Check 1 Q5 + ODR-0018 §7); DA Kendall (reference-not-import — 5 conceded / 2 withdrew on §Rules-text amendments). **`kind: architecture` ODR — relaxed A9 regime** (follows ODR-0001/0003/0004 architecture pattern). Q1-Q7 all 10-0 FOR/DEFER/SETTLED. Q2 Pandit's S001 dissent vindicated via reference-not-import mechanism per ODR-0018; Kendall DA condition met. Q3 Article-10 special-category depth with Cagle `sh:Violation` + Baker SpecialCategoryScheme + named stewards. Q4 ODRL deferral with three named triggers (VC consent receipts; TF policy instances; consumer regulatory requirement). Q5 Cagle PIIWithoutDPVCoAnnotation SHACL-AF rule — **ODR-0017 TENTH citing site**. ODR-0012 amended: council:session-012; depends-on extends to ODR-0006/0009/0011/0015/0018; implements:[ODR-0003, ODR-0017, ODR-0018]. **status:proposed retained** per namespace block. Downstream: ODR-0010 + ODR-0013 inherit DPV co-annotation profile-filtering + special-category severity.
