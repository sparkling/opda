# Gandon + Guizzardi — formal-pair on S013

*Joint pair voice. **Neither is Queen for this session** — Queen is Knublauch (extended SHACL — owns the shapes-graph mechanism, severity tiering, DASH rendering, drift-check discipline; his S001 Q5 ownership crystallises here) and DA is Cagle (aiHint exile S001 Q5 carry — defends advisory-annotation placement; pushes back on graph-separation purism where LLM consumability suffers). The pair is panel teammate, layered: Guizzardi-led on the severity-tier IC question (Q1 — the load-bearing axiological discipline) and the three-rule interface contract with ODR-0010 (Q7 — load-bearing for the methodology); Gandon-led on the W3C/artefact questions (Q2 constraint-mapping completeness; Q4 annotation-graph contents per W3C SHACL Recommendation §6 advisory-extension semantics; Q5 `sh:ValidationReport` consumption; Q6 profile-interaction). Q3 (DASH UI per-form audit) is operational deliverable, flag-and-pass. The pair concedes most questions; Q1 + Q7 are where we hold load-bearing depth.*

## Stance summary

ODR-0013 is `kind: architecture` (not `kind: pattern`) — the third `kind: architecture` discharge after ODR-0001 (methodology), ODR-0003 (programme anchor), ODR-0004 (foundation), ODR-0012 (governance layer). Pattern records (ODR-0017 SHACL-AF non-blocking rules; ODR-0018 DPV class-level co-annotations) discharge A9 §Per-kind discipline inline; ODR-0013 authors the *system* (severity-tier framework + constraint-mapping completeness + annotation-graph discipline + reporting surface) the patterns implement. This is the closing Phase 6 session — every prior phase's SHACL emission lands here; the severity-tier framework MUST cover the patterns' citing sites without reauthoring them.

What S013 must add: (a) four-tier severity framework with assignment criteria (Q1 — load-bearing); (b) complete JSON Schema → SHACL constraint-mapping table inheriting ODR-0013 stub §Rules table (Q2 — concede; stub table is complete); (c) DASH UI per-form audit as operational deliverable (Q3 — concede; flag for next /loop); (d) annotation graph contents discipline per ODR-0004 §3a CI tests (Q4 — concede; aiHint exile preserved per S001 Q5); (e) `sh:ValidationReport` consumption surface for conveyancer tooling + LLM consumers (Q5 — concede; ODR-0017 §3a machine-consumability inherited); (f) profile vs base-shapes composition discipline (Q6 — concede; ODR-0010 three-rule mechanism inherited); (g) three-rule interface contract cross-cited in both `## References` (Q7 — load-bearing; ODR-0013 OWNS the rules, ODR-0010 inherits/enforces). **ODR-0017 §2a amendment IS triggered by S010 Q6 (drift-from-data-graph-to-shape-graph admits sh:Violation for identity-override category error).**

The depth questions we own: Q1 (severity-tier assignment criteria — Guizzardi-led on the regulatory-weight discipline + the IC over named hard cases; Gandon-led on W3C SHACL Core §6.5 severity grounding); Q7 (three-rule interface contract — joint, methodology-load-bearing for ODR-0010/ODR-0013 co-evolution).

What is at stake for the methodology if S013 settles wrong: ODR-0013 is the *closing* gate for Phase 6. If Q1 admits `sh:Violation` for optional-attribute gaps, the rarest+most-damaging-error principle collapses; if Q4 admits aiHint inline in the shapes graph, Cagle's S001 Q5 exile is reversed and Cagle's preference becomes the default (Cagle dissents recorded as ≈7-2; we honour the prior vote); if Q7 leaves the three-rule contract uncross-cited, ODR-0010 + ODR-0013 drift apart and the overlay-profile mechanism + shapes-graph mechanism lose their joint enforcement. The three load-bearing points are non-negotiable for the pair.

## Per-question positions

### Q1 — Severity tiers: assignment criteria (LOAD-BEARING)

**Guizzardi (lead).** **FOR four-tier severity framework with strict assignment criteria — `sh:Violation` RESERVED for identity-key missing / IC breach / no-identity-override gate / special-category-PII without lawful-basis.** Severity tracks **regulatory weight**, not schema nesting depth, per the stub §Rules and the W3C SHACL Core §6.5 severity semantics.

**The four-tier framework (extending stub §Rules three-tier).**

| Tier | Assignment criterion | Citing-site source |
|---|---|---|
| **`sh:Violation`** (FLOOR — regulatory-breaking) | (a) identity-key missing on a Kind that requires one (UPRN/equivalent for Property; title-number for RegisteredTitle; founding-Relator absence on Role instances); (b) IC breach over a named hard case from a `kind: pattern` ODR; (c) no-identity-override gate (an overlay touching a Kind's identity criterion — ODR-0010 §Rules clause Q6 enforcement); (d) special-category-PII (Article 10) without lawful-basis annotation (ODR-0012 Q3 Cagle territory + ODR-0018 §3a); (e) meta-shape-over-shape-graph drift (S010 Q6 — ODR-0017 §2a amendment) | ODR-0005 §3c IC; ODR-0006 Person identifier predicates; ODR-0010 §Rules clause Q6; ODR-0012 §Rules sensitivity gate; ODR-0017 §2a (this session's amendment) |
| **`sh:Warning`** (profile/optional/sensitivity) | (a) missing profile/disclosure constraints that overlays add but base does not; (b) sensitivity-marker gaps on personal-data (non-special-category); (c) un-annotated PII predicate (Q5 of S012 — 10th ODR-0017 citing site) | ODR-0012 §Rules sensitivity gate; ODR-0017 §2a `sh:Warning` row (deprecation-without-substantive-succession) |
| **`sh:Info`** (informational lifecycle / succession) | (a) UPRN succession chain materialised (ODR-0005 §6a); (b) concept deprecation chain with substantive successor (ODR-0011 §5a); (c) INSPIRE Identifier / OS AddressBase succession (ODR-0015 §4a); (d) PROV-O Activity reification for evidence chain (ODR-0009 §6 when ratified) | ODR-0017 §2a `sh:Info` row (substantive succession recorded) |
| **(no severity — annotation-graph metadata)** | DPV co-annotations (ODR-0018) live in `opda-annotations.ttl`; they do NOT enter `sh:ValidationReport` — they are advisory class-level metadata read by LLM consumers and DPV-aware tooling | ODR-0018 §3a CI tests |

**IC over named hard cases (per A9 (b) discipline for `kind: architecture`).** A `sh:Violation` shape `v₁` at time `t₁` and a candidate-individual shape `v₂` at time `t₂ > t₁` are the same severity-tier individual iff (i) their assignment criterion is in the floor set above; (ii) their `sh:targetClass` is the same OR refined under SKOS-broader; (iii) the regulatory weight is preserved or strengthened. Five hard cases:

1. **Identity-key shape extends to cover new Kind.** Same individual (refinement preserves identity).
2. **`sh:Violation` reassigned to `sh:Warning`.** NEW individual; the assignment criterion has weakened below the floor — `prov:wasDerivedFrom` to predecessor; flagged as severity-tier regression.
3. **Special-category-PII gate adds Article-10 subcategory.** Same individual; refinement of regulatory weight is preserved.
4. **No-identity-override gate moves from ODR-0010 to ODR-0013.** Same individual; the gate's targeting changes graph-location but criterion remains; `dct:isReplacedBy` in ODR-0010's gate clause; `prov:wasGeneratedBy` in ODR-0013's authoring.
5. **ODR-0017 §2a amendment — meta-shape-over-shape-graph admission.** Same individual under the FLOOR criterion; S010 Q6 surfaced the drift case where a shape's `sh:in` over the shapes graph (NOT data graph) breaks ODR-0010's no-identity-override gate by *redefining* what counts as identity in a derived profile. The amendment admits `sh:Violation` for THIS specific case; the pattern's original §2a table (which restricted to `sh:Info` / `sh:Warning`) is extended, not violated — drift-from-data-graph (informative) ≠ drift-over-shape-graph (normative-breaking).

**The principle (Guizzardi).** The rarest, most-damaging error (identity loss; regulatory breach) MUST be the loudest; the routine omission MUST be the quietest. Reviewers reject `sh:Violation` on optional-attribute gaps; reviewers reject `sh:Warning` on identity-key missing.

**Pair vote on Q1.**

- **Guizzardi (lead) vote: FOR four-tier severity framework + five hard-case IC discipline + ODR-0017 §2a amendment admitting `sh:Violation` for meta-shape-over-shape-graph drift.**
- **Gandon vote: FOR same** + W3C grounding: SHACL Core §6.5 admits Violation/Warning/Info as the canonical three severities; the four-tier extension adds the annotation-graph-no-severity row as ODR-0004 §3a discipline (not a SHACL severity per se, but a graph-separation discipline). Conformant per §6.5.

---

### Q2 — Constraint mapping completeness (JSON Schema → SHACL)

**Gandon (lead).** **CONCEDE — stub §Rules constraint-mapping table is complete.** The seven-row table covers `required`, `enum`, `type`/`format`, `minimum`/`maximum`, `oneOf` (discriminated), array cardinality, canonical key. No additions needed for Phase-1 deliverable. Add row for **schema `pattern` regex** (already mentioned in stub for `format: email` but admissible per W3C SHACL Core §4.6.3 `sh:pattern`).

The mapping is exhaustive across JSON Schema Draft-07 constructs the PDTF v3 uses (per stub §Context: 8,458 property-path entries; 935 base-schema leaves). The data-dictionary recorded leaf types ground `sh:datatype` directly; the table is operational, not contested.

**One amendment.** Add explicit `format`-regex row to keep `sh:pattern` enforcement traceable:

| JSON Schema | SHACL | Source |
|---|---|---|
| `pattern` (regex on string leaf) | `sh:pattern` | data dictionary regex column (e.g. `emailAddress` `^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$` ICO-aligned) |

**Pair vote on Q2.**

- **Gandon (lead) vote: CONCEDE; stub table complete; add `pattern` regex row.**
- **Guizzardi vote: CONCEDE.**

---

### Q3 — DASH UI coverage (per-form audit)

**Gandon (lead).** **CONCEDE — DASH UI per-form audit is operational deliverable, flag-and-pass.** Per stub §Rules DASH rendering clause + ODR-0010 §Rules clause 5, every BASPI/TA6/NTS/CON29R overlay shape must carry `dash:propertyRole`/`viewer`/`editor`, `sh:order`, `sh:group`, `dash:EnumSelectEditor` for `sh:in`-driven enums.

The per-form audit verifies (i) every property shape in `profiles/<formId>.ttl` has `dash:viewer` or `dash:editor`; (ii) every enum-bearing leaf has `dash:EnumSelectEditor`; (iii) `sh:order` is monotonic within each `sh:group`; (iv) the rendered form matches the form-question chain via `dct:source`. The BASPI5 vertical slice (ODR-0010 Q7 MVP) is the canonical regression site.

**Flagged for next /loop fire.** The audit script is an `odr-review` lint extension candidate; the lint reads each profile shapes graph and validates DASH coverage; CI fails on un-resolved gaps. Per ODR-0004 §Consequences `odr-review` extension backlog.

**Pair vote on Q3.**

- **Gandon (lead) vote: CONCEDE; flag DASH per-form audit as operational deliverable + `odr-review` lint extension candidate.**
- **Guizzardi vote: CONCEDE.**

---

### Q4 — Annotation graph contents (Cagle aiHint exile carry)

**Gandon (lead).** **CONCEDE per Cagle's S001 Q5 aiHint exile vote (≈7-2).** Advisory annotation predicates only in `opda-annotations.ttl`; NO `sh:` triples in annotation graph; NO `owl:Class`/`rdfs:Class` declarations with reasoning impact. Per ODR-0004 §3a three-graph separation + ODR-0018 §3a CI tests.

**The annotation-graph contents (admissible).**

| Predicate family | Admissibility | Source |
|---|---|---|
| `opda:aiHint`, `opda:llmGuidance`, `opda:consumerNote` | YES (advisory) | ODR-0013 stub §Rules + Cagle S001 Q5 |
| `dpv-pd:hasPersonalDataCategory`, `dpv:hasLawfulBasis` co-annotations | YES (advisory governance metadata) | ODR-0018 §3a |
| `dct:source`, `dct:isReplacedBy`, `prov:wasDerivedFrom` (advisory provenance) | YES | ODR-0004 §3a + ODR-0011 §5a |
| `skos:scopeNote`, `skos:historyNote` (advisory SKOS metadata) | YES | ODR-0011 §1a/§5a |
| `sh:property`, `sh:NodeShape`, `sh:targetClass` (SHACL constraints) | NO (shapes graph only) | ODR-0004 §3a CI test 1 |
| `owl:Class`, `owl:ObjectProperty`, `rdfs:subClassOf` with reasoning impact | NO (class graph only) | ODR-0004 §3a CI test 2 |
| `sh:rule` SHACL-AF rule (lives in shapes graph) | NO (in `opda-shapes.ttl` per ODR-0017 §1a) | ODR-0017 §1a |

**Cagle DA anticipated push-back.** Cagle's recorded S001 Q5 dissent prefers inline `opda:aiHint` in the shapes graph for LLM-consumer ergonomics. Engagement: Hellmann et al. (DBpedia 2017) LLM-fallback failure-mode rebuttal (per ODR-0011 §5a + ODR-0018 §Alternatives) — structured RDF in the annotation graph keyed to shape IRIs is mechanically-parseable by LLM consumers via the `sh:ValidationReport`'s `sh:focusNode` → annotation-graph lookup pattern. The exile is not anti-LLM; it is the discipline that makes LLM consumption mechanical rather than heuristic.

**Pair vote on Q4.**

- **Gandon (lead) vote: CONCEDE; aiHint exile preserved per Cagle S001 Q5 (≈7-2 vote); annotation-graph contents per ODR-0004 §3a + ODR-0018 §3a CI tests.**
- **Guizzardi vote: CONCEDE.**

---

### Q5 — Reporting surface: `sh:ValidationReport` consumption

**Gandon (lead).** **CONCEDE — `sh:ValidationReport` is the canonical consumption surface; ODR-0017 §3a machine-consumability discipline inherits.** Two consumer families: (a) conveyancer tooling — `sh:resultSeverity` drives UI urgency tier; `sh:focusNode` drives entity-link; `sh:resultPath` drives field-level highlight; `sh:resultMessage` is user-facing error text in template form (not paragraph-wrapped natural language); (b) LLM consumers per ODR-0017 §3a Hellmann et al. DBpedia 2017 rebuttal — `sh:resultMessage` literals parsed mechanically; annotation-graph DPV co-annotations queried in parallel via `sh:focusNode` lookup.

**Pair vote on Q5.** **Gandon (lead) + Guizzardi: CONCEDE.**

---

### Q6 — Profile interaction: overlay profiles vs base shapes

**Gandon (lead).** **CONCEDE per Knublauch S010 §1a composition discipline + ODR-0010 three-rule mechanism + Cagle Scope-Check 1 Q6 cross-cite (the three rules below).** Profiles add `sh:minCount 1` shapes; profiles may raise severity ONLY upward (cannot weaken below floor); profile cannot touch identity (ODR-0010 §Rules clause Q6 enforcement).

**The three rules (Cagle Scope-Check 1 Q6 cross-cite — load-bearing for Q7).**

| Rule | Mechanism | Owning ODR |
|---|---|---|
| **`sh:in` semantics merged at build** | Profile + base `sh:in` member sets set-unioned at build time; build-step replacement, not entailment; two stacked `sh:in`s forbidden (conjunctive intersection = opposite of union intent) | ODR-0010 §Rules clause 2 |
| **`sh:Violation` floor** | Profile MAY raise severity upward; MAY NOT weaken below ODR-0013 §1a floor (regulatory-weight invariant) | ODR-0013 §1a (this session) |
| **No-identity-override gate** | Profile MAY NOT restate or alter ODR-0005 identity criterion; structural check on profile graphs; `sh:Violation` per Q1 floor | ODR-0010 + ODR-0013 §1a (floor enforcement) |

A loaded profile yields a graph that both validates AND generates the form (ODR-0010 §Rules clause 5 DASH rendering); regression guard is the build-step set-union test (ODR-0010 §Consequences clause 2).

**Pair vote on Q6.** **Gandon (lead) + Guizzardi: CONCEDE.**

---

### Q7 — Three-rule interface contract with ODR-0010 (LOAD-BEARING)

**Gandon + Guizzardi (joint).** **FOR three-rule interface contract cross-cited in both `## References` — ODR-0013 OWNS the rules; ODR-0010 §Rules clause 8 INHERITS and ENFORCES.** Methodology-load-bearing: the contract names the interface seam between profile mechanism (ODR-0010) and shape semantics (ODR-0013); without explicit cross-citation, the two ODRs drift apart and the overlay composition discipline loses its joint enforcement.

**The three rules (load-bearing — owned by ODR-0013, inherited by ODR-0010).**

1. **`sh:in` semantics merged at build** — ODR-0010 §Rules clause 2 authors the merge mechanism; ODR-0013 §References cites ODR-0010 for the mechanism; ODR-0013 enforces no-stacked-`sh:in` via build-step regression test.
2. **`sh:Violation` floor** — ODR-0013 §Rules §1a four-tier framework authors the floor; ODR-0010 §Rules new clause 8 enforces ("profile MAY raise severity above floor; profile MAY NOT weaken below floor"); ODR-0010 §References cites ODR-0013 §1a.
3. **No-identity-override gate** — ODR-0010 §Rules "No-identity-override gate" clause authors the structural gate; ODR-0013 §Rules §1a floor inherits ("identity-override is `sh:Violation` per the floor"); both ODRs cross-cite.

**The cross-cite mechanism (per ODR-0001 §Self-amendment process).** Both ODRs amend in the **same author-only session** following S013 close (or within S013 itself as Queen Knublauch synthesises). The cross-citations land:

- ODR-0010 §References adds: "**Three-rule interface contract with ODR-0013 (S013 Q7)** — clause 2 `sh:in` merge mechanism + clause 8 (new) `sh:Violation` floor enforcement + No-identity-override gate; ODR-0013 §1a four-tier framework is the floor source."
- ODR-0013 §References adds: "**Three-rule interface contract with ODR-0010 (S013 Q7)** — §1a four-tier framework is owned here; ODR-0010 §Rules clause 2 (`sh:in` merge) + new clause 8 (`sh:Violation` floor enforcement) + No-identity-override gate are the inheritance sites."

**ODR-0017 §2a amendment IS triggered by S010 Q6 — landed in §Rules.** The amendment text (per ODR-0017 §2a three-tier severity decision rule):

| Rule fires | Severity (ORIGINAL) | Severity (S013 AMENDMENT) | Use case |
|---|---|---|---|
| Quality state with substantive succession | `sh:Info` | `sh:Info` (unchanged) | UPRN/INSPIRE/deprecation succession |
| Quality state without substantive succession | `sh:Warning` | `sh:Warning` (unchanged) | Orphan UPRN; retirement-without-successor |
| **Meta-shape-over-shape-graph drift (identity-override category error)** | (table did not admit) | **`sh:Violation`** | **S010 Q6 — overlay profile redefines what counts as identity in derived shapes graph; drift-over-shape-graph (normative-breaking) ≠ drift-over-data-graph (informative)** |

The amendment is **mechanical**: the original §2a table restricted to `sh:Info` / `sh:Warning` because the pattern's instances were *data-graph* drift cases (succession, deprecation — informative). S010 Q6 surfaced the *shape-graph* drift case (overlay redefines identity in the shapes graph — normative-breaking, breaks ODR-0010 no-identity-override gate). The amendment admits `sh:Violation` for THIS specific case; the pattern remains intact; the amendment IS the pattern's pressure-test passing.

**Pair vote on Q7.**

- **Gandon + Guizzardi joint vote: FOR three-rule interface contract cross-cited in both `## References` + ODR-0017 §2a amendment admitting `sh:Violation` for meta-shape-over-shape-graph drift + amendment landed via author-only session immediately after S013 close.**

---

## Cross-cutting concerns

**`kind: architecture` discharge.** ODR-0013 is the fifth architectural discharge (after ODR-0001/0003/0004/0012). The four-tier severity framework + constraint-mapping table + annotation-graph discipline + reporting surface are the *system* the patterns implement; pattern ODRs (ODR-0005/0006/0009/0010/0011/0015/0017/0018) discharge A9 inline, ODR-0013 does NOT — it authors the floor every pattern's SHACL emission obeys. **Three-graph separation honoured** per ODR-0004 §3a + ODR-0018 §3a CI tests: SHACL constraints + SHACL-AF rules in `opda-shapes.ttl`; advisory metadata + DPV co-annotations in `opda-annotations.ttl`; OWL/RDFS declarations in `opda-classes.ttl`. The `(no severity)` row of the four-tier framework encodes the discipline: DPV co-annotations do NOT enter `sh:ValidationReport`. **Reference-not-import (Kendall DA inheritance from ODR-0012)** — SHACL/DASH URIs cited; no `owl:imports` of full vocabularies; only curated constructs referenced.

---

## DA anticipation — Kurt Cagle (aiHint exile S001 carry; LLM consumability)

Cagle's recorded S001 Q5 dissent (≈7-2 against Cagle's inline-aiHint preference) carries; published methodology (DBpedia 2017 LLM-fallback rebuttal) frames the pressure points.

**Line 1 (Q4 — aiHint inline in shapes graph for LLM-consumer ergonomics).** Engagement: structured RDF in annotation graph + `sh:focusNode` lookup IS mechanically parseable per ODR-0017 §3a. **Anticipated: Cagle withdraws on mechanism; records dissent on cost** (extra query hop vs inline triple); ≈7-2 vote preserved.

**Line 2 (Q1 — Article-10 special-category should escalate to `sh:Violation` per S012 Q3 routing).** Engagement: four-tier framework's `sh:Violation` row (d) explicitly admits "special-category-PII (Article 10) without lawful-basis annotation" — Cagle's escalation IS accommodated. **Anticipated: Cagle concurs.**

**Line 3 (Q5 — richer assertion structure than `sh:resultMessage` template literals).** Engagement: ODR-0017 §3a specifies the template form; richer structure (JSON-LD; `sh:detail`) admissible but Phase-2 territory (ODR-0016 surface). **Anticipated: Cagle defers richer-structure to Phase-2.**

**No dissent expected on:** Q2 (mapping completeness — uncontested); Q3 (operational); Q6 (three-rule mechanism settled); Q7 (cross-cite mechanism IS the contract).

---

## References

- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. CTIT PhD Series 05-74. Ch. 4 (UFO Substance Kind / Quality — Q1 IC grounding).
- Knublauch, H., Kontokostas, D., eds. (2017). *Shapes Constraint Language (SHACL)*. W3C Recommendation. §4 Core Constraints (Q2); §5 SPARQL Constraints (Q5); §6.5 Severity (Q1 four-tier grounding); §4.6.3 `sh:pattern` (Q2 regex row).
- Knublauch, H. et al. (2018). *DASH Data Shapes Vocabulary*. TopQuadrant. (Q3 grounding.)
- Hellmann, S. et al. (2017). *DBpedia 2017 — LLM fallback failure modes on `rdfs:comment`*. (Q4/Q5 mechanical-parseability grounding.)
- ODR-0001 §A9 — ODR-0013 is the **fifth `kind: architecture` discharge** (after ODR-0001/0003/0004/0012).
- ODR-0004 §3a (three-graph separation; CI tests); §6a (deterministic emission); §7a (term-sourcing precedence).
- ODR-0005 §3c (RegisteredTitle IC — Q1 floor source); §6a (UPRN succession `sh:Info` — ODR-0017 first citing site).
- ODR-0010 §Rules clauses 2/5 + No-identity-override gate (**Q6 + Q7 load-bearing** — three-rule interface contract co-owning ODR); §Consequences clause 2 (stacked-`sh:in` regression guard).
- ODR-0011 §5a (concept deprecation `sh:Info`/`sh:Warning` — Q4 annotation-graph pattern source); §8a (seven-category UFO framework — Q1 severity-tier criteria grounding).
- ODR-0012 §Rules sensitivity gate (Q3 Cagle routing to S013 → Q1 (d) floor row); Phase 6 closing escalation per S012 Q3.
- ODR-0015 §4a (INSPIRE/AddressBase succession — ODR-0017 third citing site).
- ODR-0017 (SHACL-AF non-blocking data-quality rules pattern) — **load-bearing for Q7 (§2a amendment) + Q5 (§3a machine-consumability) + Q1 (severity tiers)**. §2a AMENDED in this session to admit `sh:Violation` for meta-shape-over-shape-graph drift (S010 Q6 trigger).
- ODR-0018 (DPV class-level co-annotation pattern) — Q1 floor (d) special-category-PII row + Q4 annotation-graph CI tests; the `(no severity)` framework row encodes DPV-co-annotations-do-NOT-enter-report discipline.
- Scope-Check 1 Q6 (three-rule cross-cite between ODR-0010 and ODR-0013 — Cagle authored the original three-rule framing; Q7 load-bearing methodology decision).
- S001 Q5 (overlays → SHACL severity + aiHint exile ≈7-2 vote preserved per Q4); S010 Q6 (meta-shape-over-shape-graph drift case — ODR-0017 §2a amendment trigger); S012 Q3 (Article-10 escalation routing to Q1 (d) floor).
- S013 plan §S013 (Queen Knublauch extended SHACL; DA Cagle aiHint exile S001 carry; Phase 6 closing).
