# Council Session 039 — Entailment regime smell + the EPC-certificate "modelling error"

- **Date:** 2026-06-14
- **Records:** Adjudicates an operator suspicion that OPDA's bespoke entailment subset (ODR-0025/0026, ADR-0035, `config/opda-owl-rl-safe.rules`) masks modelling errors and should be reconsidered, and that the EPC-certificate domain mismatch (ODR-0028 R3) is a modelling error. Routes amendments to **ODR-0025** (§R1 naming), **ODR-0028** (R3 wording), **ADR-0035** (reframe as minimal/dormant), **ADR-0014** (round-trip inference flag), a **new pattern ODR** (domain/range-as-SHACL-constraint), and code/config (rename ruleset; fix the dangling shape).
- **Queen / synthesis:** **Dean Allemang** (working-ontologist pragmatism; "how much inference do you actually need"). **Devil's Advocate:** **Jim Hendler** (genuinely opposed — defends materialised inference; "query-the-asserted abandons the point of OWL; fix with *more* principled reasoning, not less"). **Panel:** Giancarlo Guizzardi (UFO — the EPC modelling locus), Holger Knublauch (SHACL — constraint-vs-inference boundary), Kurt Cagle (operational — does the closure earn its keep), Pascal Hitzler (OWL 2 profiles — is it a legitimate fragment).
- **Voices:** 6 across 6 teammates.
- **`consensus-mode`:** `agent-fan-out` (parallel `Task` spawn; file-based positions; Queen-composed synthesis). No hive-mind — no question's verdict is *conditional* on another's; output is advisory dispositions, not a typed object for tooling.
- **Format:** Full Council (6 runs).
- **Input:** `config/opda-owl-rl-safe.rules`; `scripts/fuseki-load.mjs::materializeEntailments` (~136–266); `tools/opda-gen/src/opda_gen/ci/inference_closure_test.py`; ODR-0025 (§R1/R2/R3/R7), ODR-0026 (R1/R2/R3 + session-035 amendment), ODR-0027 (classification-over-inheritance), ODR-0028 (R3); ADR-0035, ADR-0014; `profiles/baspi5.ttl` (Baspi5_EPCCertificateShape, Baspi5_PropertyShape); `opda-property.ttl` (currentEnergyRating, hasEPCCertificate); `opda-descriptive.ttl` (EPCCertificate).
- **Outcome:** **REVISE** — the operator's suspicion is *directionally vindicated but re-located*. The **model is already correct** (do not re-home the rating); the entailment subset is **logically sound** (keep it) but **mislabelled** (rename: it is not OWL 2 RL) and **over-framed** (only 1 of 7 rules ever fires — reframe as minimal/dormant + keep the negative gate); the real fixes are a **SHACL domain-as-constraint layer**, the **round-trip `inference="rdfs"` flag**, a **dangling empty shape**, and **ODR-0028 R3's imprecise wording**. Per-question: Q1 REVISE (3-3, locus corrected), Q2 REJECT-the-smell / REVISE-the-name (3 REJECT / 3 REVISE), Q3 REVISE→SHRINK (4 shrink / 2 keep-as-is / 0 drop), Q4 AFFIRM domain-range-as-SHACL (6-0). DA **WITHDRAWN** (the mechanism is kept, not amputated — his red line) + **CONCEDED** the rename.

## Context + the pre-flight finding

The operator, on discovering the closure adds **0 triples** over the schema, suspected a modelling error and an inference smell, and stated a principle: *"model it right and query the stated/asserted model; don't add entailment where it isn't needed; the entailment script adopts no OWL standard fully — it is its own subset."* All three observations are factually correct and were the pre-flight grounding:

- **The subset is not OWL 2 RL.** `config/opda-owl-rl-safe.rules` enables **7 rules** (subClassOf/subPropertyOf transitivity; subPropertyOf value-propagation; subClassOf type-propagation; owl:inverseOf ×2; owl:SymmetricProperty; owl:TransitiveProperty) and **deliberately excludes** rdfs:domain, rdfs:range, functional/inverse-functional, equivalentClass/Property (ODR-0025 §R2; "model-but-don't-evaluate" ODR-0026). It is a proper *subset* of RL's rule set.
- **The closure is empirically near-empty.** Verified against `ci/inference_closure_test.py` (the gate's own docstring) and a live grep: **only rule 4 (subClassOf type-propagation) ever fires**; the model declares zero inverse/transitive/symmetric/disjoint and the hierarchy is flat (no A⊑B⊑C — ODR-0027 classification-over-inheritance). Schema closure = **0 triples**; with the exemplars = **30**, all one-hop foreign-root type assertions (`?inst a prov:Entity`) recoverable by a property-path query.
- **The EPC facts, verified in the emitted artefact:** `opda:currentEnergyRating rdfs:domain opda:Property` (a UFO Quale-in-Region; opda-property.ttl:205); `opda:EPCCertificate` is a UFO **Information Object** / prov:Entity (ODR-0008d Rule 3); the rating and the `opda:hasEPCCertificate` join **both sit on `Baspi5_PropertyShape`** (targetClass opda:Property); and **`Baspi5_EPCCertificateShape` is a bare `sh:targetClass opda:EPCCertificate` with ZERO `sh:property`** (it constrains nothing). The Queen verified this directly: the cross-trip only materialises under a *full* `inference="rdfs"` validator (the ADR-0014 round-trip flag), never in OPDA's committed Safe-Group closure.

This last finding is decisive: **ODR-0028 R3's claim that the shape "binds the rating onto the certificate" is imprecise about the emitted artefact.** The emitted SHACL is correct; the live exposure is the round-trip's RDFS flag plus a dangling empty shape.

## Proposition P

"OPDA's bespoke 7-rule entailment subset masks modelling errors and should be reconsidered; OPDA should *model it right and query the stated/asserted model, and not add entailment where it isn't needed* — shrinking or dropping the materialised closure and fixing the EPC defect in the model."

## Questions + verdicts

- **Q1 — Is the EPC binding a genuine modelling error to fix, and where?** **REVISE. AFFIRM 3 (Hendler, Cagle, Hitzler) / REVISE 3 (Allemang, Guizzardi, Knublauch) / REJECT 0.** Substantive unanimity: it *is* a real issue to fix — but **not in the core model** (which is UFO-correct), so the proposition's "modelling error" framing is re-located. The live defects are (a) the **ADR-0014 round-trip `inference="rdfs"`** flag (the only thing that actually trips it), (b) the **dangling empty `Baspi5_EPCCertificateShape`** (an attractor inviting a future mis-binding), and (c) **ODR-0028 R3's wording**. **Do NOT re-home `currentEnergyRating` onto the certificate** (that would *introduce* the representation-vs-represented conflation Guizzardi names) and **do NOT add a Property-side `recordsRating`**.
- **Q2 — Is the bespoke domain/range-excluding subset a smell masking errors?** **REJECT (the logic) / REVISE (the name). REJECT 3 (Hendler, Guizzardi, Cagle) / REVISE-rename 3 (Allemang, Knublauch, Hitzler) / AFFIRM-it-smells 0.** The fragment is **sound** — Hitzler decisive: removing rules from a sound rule set can only reduce *completeness*, never introduce a false entailment; the EPC `⊑Property` triple it declines to compute would be a *correct* RL entailment of a *mis-asserted* model. The subset does not *mask* the error so much as *decline to surface* it (which is why Q4's SHACL layer is needed). **But the NAME is a conformance misnomer:** `opda-owl-rl-safe` / "OWL 2 RL Safe Group" asserts a W3C-profile conformance a 7-rule subset does not meet, and "safe" dresses a master-data *policy* as an RL *soundness* property. Rename + honest header.
- **Q3 — Adopt "model right + query asserted; shrink/drop the closure (adds ~0)"?** **REVISE → SHRINK. SHRINK 4 (Allemang, Guizzardi, Knublauch, Cagle) / keep-as-is 2 (Hendler, Hitzler) / drop 0.** Nobody supports a full drop. "Model it right" — already done. "Query the asserted model" — **AFFIRMED as the operating principle** (the graph is sound asserted; hierarchy admission via `rdf:type/rdfs:subClassOf*` property paths). "Shrink/drop the closure" → **shrink, don't drop**: keep the rules + the **negative consistency gate** (no `owl:sameAs`, no spurious `EPCCertificate ⊑ Property`) as the highest-value asset, retain the 6 currently-vacuous rules as **dormant carriers** that switch on when a real construct lands, and **stop advertising a reasoning layer the model never exercises** (reframe ADR-0035 as "declared entailment *boundary*, currently exercised by one rule").
- **Q4 — Does excluding domain/range leave a blind spot; should domain/range be SHACL constraints?** **AFFIRM (unanimous). AFFIRM 6 / 0 / 0.** Domain/range belong on the **validation** side of the line, not the inference side. Knublauch's centerpiece: a generic **domain-as-constraint meta-shape** — for every domained predicate emit `sh:targetSubjectsOf <pred> ; sh:class <domain> ; sh:severity sh:Violation` (and the `sh:targetObjectsOf`→`sh:class` range dual) — carrying the *exact* semantics of `rdfs:domain` but evaluated closed-world ("are they?") instead of generatively ("therefore they are"). This **closes the §R2 blind spot** (the EPC mismatch is currently neither inferred nor validated) **without re-admitting unsound inference**.

## Dialectic

**The forensic correction reframed the whole session (Guizzardi, Queen-verified).** The operator's "modelling error" is real as a *danger* but wrong as to *locus*. Guizzardi's UFO reading is exact: the energy band A–G is a **Quale** whose bearer is the dwelling (`opda:Property`); `opda:EPCCertificate` is an **Information Object** that *records* that band *about* the property — representation, not inherence. The core ontology already gets this right (Quale on Property; certificate reached via the `hasEPCCertificate` join). And the *emitted profile* gets it right too: the rating sits on `Baspi5_PropertyShape`, and `Baspi5_EPCCertificateShape` is **empty**. So there is no conflation in the artefacts — only a *latent attractor* (the empty shape) and a *validator misconfiguration* (full RDFS in the round-trip). Re-homing the rating, as a naïve "fix the model" reading would do, would **create** the very error the proposition fears.

**Soundness vs completeness — the smell is the label, not the logic (Hitzler, decisive on Q2).** "Conforms to no OWL 2 profile" is a category error dressed as a critique: RL is an *upper bound on safety*, and OPDA took a sound *sub*-set. Excluding rules cannot make the closure unsound — only RL-incomplete. The defect is that `opda-owl-rl-safe` claims RL conformance a 7-rule fragment cannot honour: a consumer who knows the profile will assume domain/range and equality entailments hold and write asserted-model queries that are silently wrong. Fix the name (Hitzler's preferred `opda-rdfs-plus` — "RDFS-Plus", notably *Allemang & Hendler's own* term), state SOUND-but-INTENTIONALLY-INCOMPLETE in conformance terms, change zero materialised triples.

**Does the closure earn its keep? (Cagle, the SHRINK pivot).** From the gate's own source: 6 of 7 rules pass vacuously; only subClassOf type-propagation fires; 0 triples on the schema, 30 trivially-recoverable on the exemplars; the model is "a deliberate one-level star" (ODR-0027), and "a forward-chaining materialiser over a one-level star is a fixpoint loop that does one useful pass and halts." *As inference* it does not earn its keep — a property path recovers what it emits. But the **declared boundary + its negative CI gate** (no `sameAs`, no `EPCCertificate ⊑ Property`) earns its keep independent of the positive count. Hence SHRINK, not drop: keep the contract and the gate; shrink the *engine's framing*; query-time default. Cagle anchored this in precedent — session-035 retired three `owl:equivalentClass` aliases for safe `skos:` facets "because a correct model beat an inert axiom" (ODR-0026 R3); this applies the same move one level up.

**The constructive synthesis — infer vs validate, correctly partitioned (Knublauch).** "`rdfs:domain` was never meant to be an inference rule; it is a constraint masquerading as one." The bright line the whole council converged on: **infer the relations whose closure the author *wants* materialised (hierarchy, inverse, transitivity); validate the constraints the author wants *checked* (domain, range, cardinality, identity keys).** OPDA's §R2 exclusion already pulls domain/range out of inference; the missing half is putting them back as SHACL. The domain-as-constraint meta-shape *is* "SHACL eats OWL" in one shape — same semantic content as `rdfs:domain`, opposite epistemics.

**The DA, and why he withdrew (Hendler).** Hendler's strongest argument — *"'query the asserted model' does not eliminate entailment; it relocates it, unsound and ungoverned, into every consumer's SPARQL, and removes the only stage at which OPDA can guarantee a reasoner-independent answer"* — is **correct, and the council honoured it** by adopting SHRINK (keep the closure as a dormant, governed contract) rather than the drop the proposition flirted with. Nothing is amputated: the 7 rules stay, the negative gate stays, the generative rules wait dormant for the first real transitive construct. What Hendler *lost*: his "fix with more inference" prescription (re-enabling `prp-dom` would *materialise* `EPCCertificate a Property` and cascade violations against innocent data — Knublauch and Hitzler both showed inference here *propagates* the bug rather than catching it), and his "no reframe needed" (the honest rename + minimal-framing carry). His disposition: **WITHDRAWN** on keep-the-mechanism (condition met — nothing dropped) and **CONCEDED** the rename (Hitzler offered Hendler's own "RDFS-Plus"). **Re-open trigger:** if anyone proposes *deleting* the rules/gate (vs keeping dormant) or re-admitting domain/range/`sameAs` as *entailment*, Hendler re-opens.

## Dispositions

The model stands; the fixes are at the edges. All `status: proposed` — the operator ratifies adoption.

1. **Add a SHACL domain/range-as-constraint layer (Q4 — the centerpiece).** Generator pass: for every `rdfs:domain C` predicate emit `sh:targetSubjectsOf <pred> ; sh:class C` (+ `sh:targetObjectsOf`→`sh:class` for ranges), `sh:severity` per ODR-0013. Closes the §R2 blind spot. **Route: a new pattern ODR**, realised in `opda-shapes.ttl` (ODR-0004 §3a). Net for the EPC case: a misplaced rating now fires a loud `sh:Violation` instead of being silently uncaught.
2. **Fix the ADR-0014 round-trip inference flag.** Replace pyshacl `inference="rdfs"` with validation against the **materialised Safe-Group closure** (the round-trip's regime must equal OPDA's declared regime, never wider). This deletes the EPC false positive at its actual source. **Route: ADR-0014 amendment** (+ ADR-0036 §Confirmation).
3. **Resolve the dangling `Baspi5_EPCCertificateShape`.** Either remove it, or populate it with **certificate-intrinsic** constraints only (issue date, authority reference, the ODR-0008d IC tuple) — **never** `currentEnergyRating`. Regenerate (no hand-edit). **Route: emitter fix; close ODR-0028 R3.**
4. **Rename the ruleset (Q2).** `config/opda-owl-rl-safe.rules` → e.g. `opda-rdfs-plus.rules` ("RDFS-Plus: sound, RL-incomplete; NOT an OWL 2 RL reasoner"); header states SOUND-but-INTENTIONALLY-INCOMPLETE in conformance terms; keep "model-but-don't-evaluate" verbatim. **Route: ODR-0025 §R1 prose amendment** ("OWL 2 RL-safe" → "sound, RL-incomplete RDFS-Plus fragment") + config rename + the loader's reference. Zero materialised-triple change (re-run `ci-inference-closure` for byte-identity).
5. **Reframe the materialiser as minimal/dormant (Q3 — SHRINK).** Keep the 7 rules + the negative consistency gate; make query-time property paths the default for hierarchy admission; document that only subClassOf type-propagation fires and the rest are dormant carriers. **Route: ADR-0035 narrative amendment** + the inference doc.
6. **Correct ODR-0028 R3's wording (Q1).** The emitted SHACL does **not** bind the rating onto the certificate (the cert shape is empty; the rating is on `Baspi5_PropertyShape`); the exposure is the round-trip's full-RDFS flag + the dangling shape. **Route: ODR-0028 R3 re-scope.**
7. **Do NOT:** re-home `currentEnergyRating`; add a Property/certificate-side `recordsRating`; re-enable domain/range/`sameAs` as entailment; delete the closure.

**Held-as-live dissent (Hendler):** keep-the-mechanism is WITHDRAWN (met by SHRINK). Re-open trigger: any proposal to *delete* the rules/negative gate or to re-admit domain/range/functional/equivalence as *entailment* (not constraint).

**Feedback to ADR-0041 (doc plan):** the "two renderings per tool (entailed/non-entailed)" is now near-moot for the TBox reference — entailed == non-entailed on the schema (0 delta) and +30 trivially-recoverable triples on instance data. And B3 is downgraded: the EPC issue is *not* a model error blocking `/ontology`; it is the four edge-fixes above. Update ADR-0041 accordingly once these are ratified.

## Tally appendix

### Per-voice verdicts

| Voice | Role | Q1 EPC-error | Q2 subset-smell | Q3 shrink/drop | Q4 domain→SHACL |
|---|---|---|---|---|---|
| Allemang | Queen | REVISE | REVISE (rename) | REVISE→SHRINK | AFFIRM |
| Hendler | DA | AFFIRM (narrow) | REJECT | REJECT (keep) | AFFIRM |
| Guizzardi | panel | REVISE | REJECT | REVISE | AFFIRM |
| Knublauch | panel | REVISE | REVISE | REVISE | AFFIRM |
| Cagle | panel | AFFIRM | REJECT (+relabel) | REVISE→SHRINK | AFFIRM |
| Hitzler | panel | AFFIRM | REVISE (rename) | REJECT (keep) | AFFIRM |

### Per-question count

| Q | Count | Verdict |
|---|---|---|
| Q1 EPC a modelling error | AFFIRM 3 / REVISE 3 / REJECT 0 | **REVISE** — real but re-located (not the core model) |
| Q2 subset a smell | REJECT 3 / REVISE 3 / AFFIRM 0 | **REJECT the logic / REVISE the name** (sound but mislabelled) |
| Q3 shrink/drop closure | SHRINK 4 / keep-as-is 2 / drop 0 | **REVISE → SHRINK** (keep contract+gate; query-time default) |
| Q4 domain/range as SHACL | AFFIRM 6 / 0 / 0 | **AFFIRM** (unanimous — the centerpiece fix) |

### DA scorecard (Hendler)

| Q | Vote | Disposition |
|---|---|---|
| Q1 | AFFIRM | aligned (conceded it's a fix) |
| Q2 | REJECT | logic-defense upheld; **CONCEDED** the rename |
| Q3 | REJECT (keep) | **WITHDRAWN** — SHRINK keeps the mechanism + gate (his red line met); honest-reframe adopted over "no reframe" |
| Q4 | AFFIRM | aligned (constraint, not re-enabled inference) |

### Pre-flight checklist

Named experts ✓ · Queen + DA named ✓ · DA genuinely opposed (Hendler defends materialised inference vs "minimise/query-asserted") ✓ · DA withdrew/conceded on every contested Q ✓ · `N-M-K` tallies ✓ · citations grounded (dangling shape Queen-verified; gate docstring confirms 1-of-7 fires; soundness/completeness per OWL 2 Profiles) ✓ · one-message parallel spawn ✓ (two batches, fully parallel) · consensus-mode + tier declared ✓
