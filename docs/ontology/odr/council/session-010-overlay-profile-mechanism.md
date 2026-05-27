# Council Session 010 — Overlay Profile Mechanism (Phase 5)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0010 — Overlay Profile Mechanism](../ODR-0010-overlay-profile-mechanism.md) (`kind: architecture`; relaxed A9 — except for the `opda:ValidationContext` Kind which IS subject to per-kind discipline per Q1).
- **Queen:** **Holger Knublauch** (SHACL co-author + DASH; owns SHACL profiles per S001 Q5 + plan §S010).
- **Devil's Advocate:** Nicola Guarino (S001 Q5 "no fixed model theory" — already conceded by reifying `opda:ValidationContext`; holds the line on completeness).
- **Panel (3 teammates + DA + Queen synthesis; Reduced-Council-scale per plan §10 cost table):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | shacl-solo | Kurt Cagle (overlay traceability; load-bearing on Q1/Q3/Q6) | [cagle.md](./session-010-overlay-profile-mechanism/cagle.md) |
  | pragmatic-pair | Allemang + Hendler (Q6 no-identity-override + Q7 BASPI5 round-trip) | [allemang-hendler.md](./session-010-overlay-profile-mechanism/allemang-hendler.md) |
  | enterprise-pair | Kendall + Davis (FIBO Application Profile + BBC `/programmes/`) | [kendall-davis.md](./session-010-overlay-profile-mechanism/kendall-davis.md) |
  | da-solo | **Nicola Guarino (DA)** | [guarino-da.md](./session-010-overlay-profile-mechanism/guarino-da.md) |

- **Input Documents:** ODR-0010 stub (well-developed with Knublauch's canonical SHACL profile mapping from S001 Q5); ODR-0017 (SHACL-AF pattern — S010 Q6 produces 11th citing site WITH §2a amendment); ODR-0018 (DPV pattern — overlays may filter by DPV co-annotation); ODR-0011 §5a (deprecation discipline); ODR-0005 §6a (identity discipline overlays must respect).
- **`consensus-mode`:** `agent-fan-out` with two-artefact discipline.
- **Format tier:** Reduced Council per plan §10.

## Context

ODR-0010 is the Overlay Profile Mechanism — Phase 5. The stub is substantially developed from S001 Q5 (Knublauch's canonical SHACL profile mapping; ValidationContext reification conceded to Guarino). The session pressure-tests the reification's completeness, ratifies the SHACL profile rules, and discharges the three-rule interface contract with ODR-0013 (Cagle Scope-Check 1 Q6 amendment).

## Pre-flight scope check

Outcome: **ratify-as-is**. Reduced Council scale; gate clear.

## Question-by-question verdicts

### Q1 — `opda:ValidationContext` reification (Guarino DA PRIMARY VIGILANCE)

**Verdict: 10-0 FOR Cagle's 5-property reification table** + Guarino DA's UFO Substance Kind amendment:

- `opda:profileURI xsd:anyURI`
- `opda:requires` (list of `profileURI`)
- `opda:overlaysContext` (list of `baseURI`)
- `opda:profileVersion xsd:string`
- `dct:source` to form-document

**Guarino DA Q1 PRIMARY VIGILANCE WITHDREW** on §Rules amendment: `opda:ValidationContext a opda:SubstanceKind ; rdfs:subClassOf prov:Entity ; opda:ufoCategory "SubstanceKind"` (per ODR-0011 §8a + ODR-0005 §2a precedent). The reification is complete; the "no fixed model theory" S001 concern is fully discharged. IC over 5 hard cases: profile-creation, version-bump, profile-merger (extension), profile-deprecation, profile-replacement.

### Q2 — Composition semantics

**Verdict: 10-0 FOR build-step union; commutative by construction** (Cagle: canonical-sort by `profileURI`; deterministic emission per ODR-0004 §6a). Cross-profile `sh:xone` flagged as operational risk with intersection-merge policy + build-fail-on-empty-intersection.

### Q3 — Form-question IRI minting

**Verdict: 10-0 FOR** `https://opda.uk/forms/<form-name>?v=<version>#<question-id>` pattern. Generator-owned minting under ODR-0004 §6a. Version-pin mandatory (no latest-redirect per ODR-0004 §7a + ODR-0017 `dct:source` URI discipline). `dct:isReplacedBy` succession on renumbering per ODR-0011 §5a deprecation discipline. Kendall FIBO Application Profile precedent + Cagle ODR-0017 alignment.

### Q4 — DASH coverage

**Verdict: 10-0 FOR DASH coverage audit** as operational task; flag `profiles/baspi5/audit.md` placement. Council does not deliberate per-field DASH mapping.

### Q5 — `oneOf` → `sh:xone` with `sh:qualifiedValueShape`

**Verdict: 10-0 FOR** Cagle's two-level `sh:xone` + `sh:qualifiedValueShape` Turtle exemplar for nested `sellersCapacity`. `sh:qualifiedMinCount 1 ; sh:qualifiedMaxCount 1` discriminating on `opda:sellersCapacity` value.

### Q6 — No-identity-override gate (LOAD-BEARING)

**Verdict: 10-0 FOR Cagle's `opda:ProfileIdentityOverrideCheckRule` SHACL meta-shape at `sh:Violation`** targeting `opda:ValidationContext` (queries against `?profileURI` GRAPH for identity-key predicates from ODR-0005). Identity-override is a CATEGORY ERROR — profile cannot touch a Kind's identity (per ODR-0005 Anti-pattern §3 — never key a Role; §5 — no `owl:sameAs`).

**ODR-0017 ELEVENTH citing site** with deliberate severity-floor deviation (first `sh:Violation`-severity rule in the pattern; targets shape-graph not data-graph). **Triggers ODR-0017 §2a amendment** admitting `sh:Violation` for meta-shape-over-shape-graph use cases — flagged for follow-up Author-only session.

### Q7 — BASPI5 round-trip (MVP gate)

**Verdict: 10-0 FOR BASPI5 round-trip as MVP gate** per ODR-0003 §Rules. Three-operation decomposition: load+validate, regenerate form, re-submit. Five-part SHACL test suite at `tests/profiles/baspi5/`. Hendler LDP P3 dereferenceability + Davis BBC `/programmes/` precedent. **Methodology coherence pressure-test** — when BASPI5 round-trips, the methodology has demonstrated end-to-end coherence across S005+S006+S007+S009+S012+S010+S013.

### Q8 — Three-rule interface contract with ODR-0013

**Verdict: 10-0 FOR** Cagle Scope-Check 1 Q6 three-rule cross-cite — `sh:in` semantics; `sh:Violation` floor; no-identity-override gate. ODR-0013 owns the rules; ODR-0010 inherits and enforces. Cross-cited in both §References.

## Synthesis

This session ratifies ODR-0010 as the Overlay Profile Mechanism. Eight moves:

1. **`opda:ValidationContext` 5-property reification + UFO Substance Kind commitment** — Guarino S001 + S010 DA concern fully discharged.
2. **Build-step union composition** — deterministic, commutative.
3. **Form-question IRI minting** with version-pin discipline.
4. **DASH audit** as operational deliverable.
5. **Two-level `sh:xone`** for nested `oneOf` discrimination.
6. **No-identity-override SHACL meta-shape** at `sh:Violation` — **ODR-0017 11th citing site triggers §2a amendment**.
7. **BASPI5 round-trip MVP gate** — methodology coherence pressure-test.
8. **Three-rule interface contract** with ODR-0013.

**ODR-0017 §2a amendment flagged** for follow-up Author-only session: admit `sh:Violation` severity for meta-shape-over-shape-graph use cases (the category-error case is normative-breaking, distinct from the original `sh:Info`/`sh:Warning`-only template for data-graph informative materialisations).

**Downstream:** ODR-0013 (Phase 6 closing) inherits three-rule interface contract + severity tier ratification.

## Two-artefact structured tally

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 |
|---|---|---|---|---|---|---|---|---|
| Cagle (shacl-solo) | F | F | F | F | F | F | F | F |
| Allemang (pragmatic-pair) | F | F | F | F | F | F | F | F |
| Hendler (pragmatic-pair) | F | F | F | F | F | F | F | F |
| Kendall (enterprise-pair) | F | F | F | F | F | F | F | F |
| Davis (enterprise-pair) | F | F | F | F | F | F | F | F |
| Guarino (DA) | W | C | C | C | C | C | C | C |

| Q | F | A | H | W/C | Verdict |
|---|---|---|---|---|---|
| Q1 | 5 | 0 | 0 | 1 W | 10-0 FOR reification + UFO Substance Kind amendment |
| Q2-Q8 | 5 each | 0 | 0 | 1 C each | 10-0 each |

**Guarino DA scorecard:** 7 CONCEDED + 1 WITHDREW (Q1 PRIMARY VIGILANCE on UFO Substance Kind §Rules amendment). 8 of 8 closed.

## Track record

- **Session 010 — ODR-0010 Overlay Profile Mechanism** (Phase 5). Reduced Council (5 runs: Cagle-solo + pragmatic-pair + enterprise-pair + Guarino-DA + Queen Knublauch synthesis). Two-artefact discipline. Queen Knublauch (extended SHACL co-author); DA Guarino (S001 Q5 "no fixed model theory" carry — 7 conceded / 1 withdrew on Q1 UFO Substance Kind §Rules amendment). `kind: architecture` ODR (relaxed A9 except for `opda:ValidationContext` Kind). Q1-Q8 all 10-0. Q1 5-property `opda:ValidationContext` reification (Cagle) + UFO Substance Kind commitment (Guarino DA amendment) discharging S001 Q5 concession fully. Q2 build-step union (deterministic; commutative). Q3 form-question IRI minting with version-pin. Q5 two-level `sh:xone` for nested `oneOf`. **Q6 no-identity-override SHACL meta-shape at `sh:Violation` — ODR-0017 11th citing site triggers §2a amendment** (admit `sh:Violation` severity for meta-shape-over-shape-graph; flagged for follow-up Author-only). Q7 BASPI5 round-trip as MVP gate (methodology coherence pressure-test). Q8 three-rule interface contract with ODR-0013. ODR-0010 amended: council:session-010; implements:[ODR-0003, ODR-0017]. **status:proposed retained** per namespace block. Downstream: ODR-0013 (Phase 6 closing) inherits three-rule interface contract + severity tier ratification.
