# Council Session 024 (R1) — Authority-Retrieved Artefacts

- **Date:** 2026-05-30
- **Record produced:** [ODR-0008d — Authority-Retrieved Artefacts](../ODR-0008d-authority-retrieved-artefacts.md) (spawned per [ODR-0008](../ODR-0008-property-descriptive-attributes.md) §Q2a(b); fired by [ODR-0022](../ODR-0022-descriptive-layer-import-strategy.md) Category E; tracked as R1 in [ODR-0023](../ODR-0023-descriptive-layer-follow-on-council-roadmap.md)).
- **Queen:** Elisa Kendall (FIBO; owns the §Q2a four-way)
- **Devil's Advocate:** Kurt Cagle (SHACL-first / "structured value, not a class" — genuinely opposed to promotion)
- **Panel:** Giancarlo Guizzardi + Nicola Guarino (UFO/OntoClean) · Luc Moreau (PROV-O, ODR-0009) · Holger Knublauch (SHACL) · Tom Baker + Antoine Isaac (SKOS/vocabulary)
- **Voices:** 8 (Kendall, Cagle, Guizzardi, Guarino, Moreau, Knublauch, Baker, Isaac) across 5 teammates.
- **`consensus-mode`:** `agent-fan-out` (Agent Teams + `SendMessage`; **no hive-mind** per the ODR-0023 convening config). Format tier: **Full Council (lean)**.
- **Input:** [`working/session-024/EVIDENCE.md`](./working/session-024/EVIDENCE.md) (S024-EVIDENCE); `opda-descriptive.ttl`/`opda-descriptive-shapes.ttl` (the 5 emitted bare classes); ODR-0008/0009/0011/0022.

---

## Context

R1 of the ODR-0023 roadmap — the one ready council (its §Q2a(b) trigger fired by ODR-0022 Category E). The search/environmental result is a six-field block recurring across **exactly 24 parents = 12 perils × 2** (verified by three panellists against `data-dictionary-canonical.json`; all 24 bear the full block — byte-uniform). The five §Q4a classes ship as bare classes + identity-key shapes; `opda:RiskAssessment` and a peril scheme do not exist. The proposition (S024-EVIDENCE): mint `opda:RiskAssessment` + a 12-member peril SKOS scheme, give the five classes internals, hang the family off PROV-O, discharge A9. Kendall's four-way (a flat-bag / b class+scheme / c per-peril subclasses / d reuse-Search) frames the vote.

## Question 1 — `opda:RiskAssessment` as a class?

**7–1 FOR a distinct class (Information Object, ⊑ `prov:Entity`); Cagle DA holds for a structured datum on `Search` (alt d).**

Guizzardi & Guarino supplied the decisive identity criterion: `RiskAssessment` is a **UFO Information Object** with a **relational, provenance-grounded IC** — ⟨generating activity, peril, subject, generation time⟩ — "identity grounded in the ACTIVITY, not the result values." Their OntoClean instrument resolves the whole question: *"`details` collapses on value (−I, a datum); `RiskAssessment` does not (+I, a class) — same instrument, opposite verdicts."* Moreau grounded it in PROV-O: each artefact `prov:wasGeneratedBy` an authority's activity, `prov:wasAttributedTo` the provider — "a flattened result loses the `prov:wasGeneratedBy` graph, which in a regulated transaction is the artefact's whole point (a lender must know WHO issued the coal-mining search and WHEN)." Knublauch: "strike the provenance and we flatten it; the provenance is there, so we promote it." Baker & Isaac confirmed §Q4a passes on both criteria (authority provenance + lifecycle).

**Cagle (DA)** held for **alternative (d)**: by OntoClean carries-identity (+I), "a type supplying no identity beyond a discriminating value is not a sortal Kind"; he found `opda:riskIndicator` already ships as a flat datatype property and `opda:Search`'s scopeNote already covers CON29/environmental/coal-mining. His single withdrawal trigger: *state an IC independent of (i) the peril value and (ii) the parent Search's lifecycle.* The panel's answer (Rule 1(b)): the **re-run** case — a re-run search is a new `RiskAssessment` by activity + `generatedAtTime`, independent of both.

**Vote Q1: 7–1–0 FOR** (Cagle held for d).

## Question 2 — the peril/dataset axis

**8–0 FOR a 12-member `opda:PerilScheme` SKOS scheme — Cagle withdrew on this.** Baker & Isaac: a delimited value-space is a `skos:ConceptScheme`, not 12 OWL subclasses (SKOS Reference §3) and not a string — "a lender's mortgage condition *names* the coal-mining search," so the peril must be a dereferenceable concept. Design: 12 concepts mirroring `opda:BoundedContextScheme`, each `dct:source`-d to its governing authority (EA, Coal Authority, UKHSA/BGS, DESNZ, local authority), `skos:narrower` to sub-perils, steward Baker. Knublauch: the peril is a `sh:property` `sh:in` the scheme. **Cagle WITHDREW** — "concede the scheme; rider: value axis, never `rdfs:subClassOf`."

**Vote Q2: 8–0–0 FOR.**

## Question 3 — one family class or two?

**7–1 FOR one `RiskAssessment` for both environmental and CON29 results.** Moreau: "env-search vs CON29 differ only on the `prov:wasAttributedTo` Agent." Baker & Isaac: "a second class needs a named §Q6a CON29-specific-property query; none attested." Cagle WITHDREW on "two" (agreeing one), HELD on "home = `Search`" (his alt-d).

**Vote Q3: 7–1–0 FOR one class.**

## Question 4 — the `riskSubcategories[]` recursion

**6–1 FOR self-referential `opda:hasSubAssessment` (part-of); Cagle holds flat; a mechanism nuance recorded.** Guizzardi/Guarino, Knublauch, Moreau: self-referential (`sh:node opda:RiskAssessment`; sub-results are first-class `RiskAssessment`s). Baker & Isaac distinguished two axes — the **peril taxonomy** uses `skos:narrower` (within `PerilScheme`), the **result recursion** uses `opda:hasSubAssessment` — adopted as Rule 4. Cagle HELD flat ("one nesting level; SHACL recursion under-specified"); Knublauch answered with SHACL §4.8.1 (`sh:node` self-reference is well-defined).

**Vote Q4: 6–1–1 FOR self-referential** (Cagle against; Baker/Isaac's `skos:narrower` folded in as the orthogonal peril axis).

## Question 5 — PROV-O + IC + the five classes' internals

**8–0 FOR, with a normative meta-category correction.** Unanimous: hang the family off ODR-0009 PROV-O; `datasetAttribution` **≡ `prov:wasAttributedTo`** (reuse, don't mint — Moreau); each class IC = ⟨issuing authority, reference, date⟩. Guizzardi & Guarino raised the **normative correction**: the five emitted classes are typed "Substance Kind (informational)" — *wrong* for an information artefact; **retro-correct all five to "Information Object."** Moreau's as-built finding: the classes already ship `rdfs:subClassOf prov:Entity` with a `wasGeneratedBy` `sh:Violation` shape — ODR-0008d extends that exact pattern to the sixth class.

**Vote Q5: 8–0–0 FOR** (+ Information-Object retro-correction).

## Question 6 — the four-way

**7–1 FOR (b) class + peril scheme.** (a) models an Object's Qualities as the Object; (c) is OWL over-classification (the byte-uniform six-field block = one Type varying by one Quale, not 12 sortals); (d) loses the per-result provenance lifecycle. Cagle FOR (d), HELD.

**Vote Q6: 7–1–0 FOR (b).**

## Synthesis (Queen — Kendall)

The council lands **7–1 (Q2/Q5 unanimous) FOR option (b)**: `opda:RiskAssessment` as a **UFO Information Object** (⊑ `prov:Entity`; IC = ⟨activity, peril, subject, generation-time⟩) + a 12-member `opda:PerilScheme` SKOS scheme, the five classes given internals and **retro-corrected to Information Object**, the whole family on the ODR-0009 PROV-O backbone. → **ODR-0008d** (`kind: pattern`, A9 discharged inline). The four-way resolves to (b) on the identity-criterion criterion: the perils differ by a Quality value (→ a scheme + `sh:in`), the result bears a provenance lifecycle (→ a class), and one class serves both populations.

**Cagle's DA dissent is the load-bearing tension and is recorded held-as-live.** His OntoClean attack is correct in form — and the panel met it in form: the **re-run** hard case supplies an IC independent of the peril value *and* the parent Search (a re-run is a new artefact by activity+time). Guizzardi & Guarino's "same instrument, opposite verdicts to `details`" is the decisive answer. The dissent rides as a **re-open trigger**: if real data shows no `RiskAssessment` ever has a lifecycle independent of its parent `Search`, collapse to (d). Q2 (scheme), Q5 (PROV-O), Q3 (one class) are unanimous and unaffected.

Two as-built findings sharpened the verdict (both verified): the five classes already subclass `prov:Entity` with a `wasGeneratedBy` Violation shape (so R1 extends, not invents); and `opda:riskIndicator` already ships as a flat property on `opda:Property` (Cagle's evidence — folded into Rule 1(c): the six fields are property-shapes on the one class, not on Property).

**Downstream:** ODR-0008d unblocks ODR-0022 Category E emission; ODR-0023 R1 struck. Status `proposed`; WG ratifies.

## Tally appendix

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 |
|---|---|---|---|---|---|---|
| Kendall (Queen) | FOR | FOR | FOR | FOR | FOR | FOR(b) |
| Guizzardi | FOR | FOR | FOR | FOR | FOR | FOR(b) |
| Guarino | FOR | FOR | FOR | FOR | FOR | FOR(b) |
| Moreau | FOR | FOR | FOR | FOR | FOR | FOR(b) |
| Knublauch | FOR | FOR | FOR | FOR | FOR | FOR(b) |
| Baker | FOR | FOR | FOR | FOR¹ | FOR | FOR(b) |
| Isaac | FOR | FOR | FOR | FOR¹ | FOR | FOR(b) |
| Cagle (DA) | AGAINST² | FOR | AGAINST² | AGAINST | FOR | FOR(d)² |
| **Tally** | **7-1-0** | **8-0-0** | **7-1-0** | **6-1-1** | **8-0-0** | **7-1-0** |

¹ Baker/Isaac Q4: `skos:narrower` for the peril taxonomy (orthogonal to `hasSubAssessment` for result recursion — both adopted).
² Cagle held for alternative (d) (reuse `Search`).

### DA scorecard (Cagle)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **HELD** (alt d) | state an IC independent of peril value + parent Search lifecycle → **met by Rule 1(b) re-run case** (Queen) |
| Q2 | **WITHDRAWN** | conceded the 12-peril SKOS scheme (rider: never `rdfs:subClassOf`) |
| Q3 | partial: WITHDREW "two", **HELD** "home=Search" | same as Q1 |
| Q4 | **HELD** (flat) | SHACL recursion under-specified → answered by SHACL §4.8.1 (Knublauch) |
| Q5 | **WITHDRAWN** (PROV hook + internals) / held "provenance≠class" | same as Q1 |
| Q6 | **HELD** (d) | single trigger collapses Q1/Q4/Q6 |

**Held-as-live dissent:** Cagle for alternative (d). **Re-open trigger:** real data showing no `RiskAssessment` has a lifecycle independent of its parent `Search` (no re-run/supersession) → collapse to (d). Recorded in ODR-0008d §Held dissent + §Alternatives.

### Per-question count
Q1 7-1-0 · Q2 8-0-0 · Q3 7-1-0 · Q4 6-1-1 · Q5 8-0-0 · Q6 7-1-0. No question below 6 FOR.
