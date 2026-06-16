# Council Session 046 — currency/peril `rdfs:range` + the class↔scheme binding idiom (Reduced Council)

- **Date:** 2026-06-16
- **Records:** No new ODR ratified (the council shapes proposals). **Confirms** the as-built currency/peril design (resolving the session-045 line-138 caveat) and routes a **Q3b operator-staged instance-data migration proposal** (string-literal `sh:in` → concept-IRI `sh:in`). Engages ODR-0011 §7a, ODR-0010, ODR-0013, ODR-0029/0031, ADR-0006, session-045.
- **Queen:** Dean Allemang (*Semantic Web for the Working Ontologist* 3rd ed. — pragmatic, the simplest faithful model; composes + votes).
- **Devil's Advocate:** Kurt Cagle (SHACL-first — "leave `rdfs:range skos:Concept`; SHACL already scopes the value-space; tightening the TBox duplicates the constraint, and a scheme is not a class of instances" — genuinely opposed to the tightening/assert-into-OWL framing).
- **Panel:** Jim Hendler (OWL semantics / OWA / web-architecture) · Antoine Isaac (SKOS Reference co-editor) · Holger Knublauch (SHACL Recommendation co-editor).
- **Voices:** 5 (4 spawned teammates + the Queen seat).
- **`consensus-mode`:** `agent-fan-out`; cross-talk via Agent Teams (`council-046`); DMs mirrored verbatim into `working/session-046/<persona>.md`.
- **Format:** Reduced Council (~5 runs) — a narrow axis (the range of 2 properties + the binding-assertion idiom), referred from session-045.
- **Input:** `working/session-046/EVIDENCE.md`; `source/03-standards/ontology/opda-descriptive{,-shapes}.ttl`, `opda-vocabularies.ttl`; `public/ontology/artefacts/opda-{merged,shapes-merged}.ttl`; session-045.

## Context

Session-045 (viz-and-extractor) recovered a *derived* `opda:constrainedByScheme` view edge for the 2 IRI-grounded coded properties and **referred two source/TBox questions here**: the `rdfs:range` of `opda:currency`/`opda:peril` (today the bare generic `skos:Concept`, scoped by SHACL `currencyRangeShape`/`perilRangeShape` per ODR-0029 R3), and whether the ~21 string-literal `sh:in`→scheme bindings should be promoted to an asserted triple. This council decides the **ontology source**.

**Empirical findings (Queen-verified; agents web-verified their SKOS/SHACL citations and caught two peer errors).** SKOS Reference **S9**: "skos:ConceptScheme is disjoint with skos:Concept"; **S4**: `inScheme` range = ConceptScheme; **S14**: prefLabel uniqueness is *per-language* (so cross-concept prefLabel reuse is expected); `inScheme` is **not functional** (§4.6.1) — all web-verified 2026-06-16. The string→scheme map is **prose-only (0 asserted predicate→scheme triples; 0 asserted `skos:exactMatch`)**; field→scheme is 1:1 with the predicate (each of the 14 schemes is named by exactly one shape — Queen spot-checked), but value-level reuse is non-injective ("Other" ∈ 8 schemes). The instance layer is **JSON lifted to RDF** and currency IRIs are already minted by the lift.

## Question 1 — What should `opda:currency`/`opda:peril` `rdfs:range` be?

**AFFIRM — keep `rdfs:range skos:Concept` + the existing SHACL `sh:in` scoping. 5–0–0 FOR. DA: HELD (affirming pole — the tightening framing did not survive).**

**Cagle (DA):** *"`rdfs:range opda:CurrencyScheme` is a category error (SKOS S9 — Scheme ⊥ Concept; S4 — `inScheme` range = ConceptScheme); enumerated closure is a closed-world data constraint = `sh:in`, never an OWL range; a Concept-subclass would force `rdf:type` onto 323 concepts for zero gain."* Attacked the tightening framing; it did not survive — HELD the affirming pole.
**Hendler:** keep — OWA: *"a tighter range produces monotonic, unretractable entailments OWA cannot honour for a value-space closed per-application; ODR-0029 shows the range closure adds 0 triples — the bare range is inert and safe, anything tighter would be false or hazardous"* (OWL2 Primer §2/§4.6).
**Isaac:** keep — `rdfs:range Scheme` is illegal (S9 disjointness; a scheme is an `inScheme` *aggregation*, S4); a scheme-typed `skos:Concept` subclass is *legal* (§3.5.1 leaves Concept↔Class open) but a **register error** reifying `inScheme` membership into an OWL class extension. *"If scheme-membership ever must be a shape, the faithful idiom is `sh:node [sh:property [sh:path skos:inScheme ; sh:hasValue <Scheme>]]`, not `sh:class`/subclass."*
**Knublauch:** keep — `sh:class` keys on `rdf:type` (SHACL §4.1.1) but the corpus binds by `skos:inScheme`, so a subclass forces re-typing concepts for zero enforcement gain; the binding is already asserted via `inScheme` + enforced via `sh:in`.
**Allemang (Queen):** keep — the `sh:in`-IRI→`inScheme`→scheme recovery (now implemented in the extractor) works from the *unchanged* source; tightening adds instance-data cost for no consumer gain. The bare range + SHACL is the simplest faithful design.

**Vote Q1: 5–0–0** AFFIRM keep `rdfs:range skos:Concept`. **This resolves the session-045 line-138 caveat: the bare range is NOT an under-specification to fix — it is correct-by-design.**

## Question 2 — Is the bare `skos:Concept` range a defect or correct-by-design?

**AFFIRM (correct-by-design; the OWL layer carries no more). 5–0–0 FOR. DA: HELD (affirming pole).**

Unanimous: the faithful idiom is the **as-built two-layer split** — `rdfs:range skos:Concept` in OWL (the open-world truth, "the value is a concept") + a closed-world `sh:in`-over-`skos:inScheme` constraint in SHACL ("which concept"). "Which scheme" is **membership**, which SKOS expresses with the *relation* `skos:inScheme`, not `rdf:type`/`rdfs:subClassOf` — so it belongs in SHACL closed-world scoping (ODR-0029, never-reasoned), not the OWL layer (SKOS §1.3 "not a formal KR language"; SHACL §1.1 a shape validates, entails nothing). **SHACL-placement nicety (Isaac/Knublauch, verified, not a defect):** the `RangeShape`'s `sh:class skos:Concept` is the predicate-wide ODR-0029 R3 type-check (`sh:targetObjectsOf`); the `sh:in` scheme-scoping correctly sits on the **bearer-scoped** node-shape property shapes — co-locating `sh:in` onto the RangeShape would *lose* the bearer scoping. The split is correct-by-design.

**Vote Q2: 5–0–0** AFFIRM correct-by-design.

## Question 3 — The string-enum binding

### Q3a — Mint `opda:constrainedByScheme` (object or annotation property)?

**REJECT — 0–5–0 (unanimous AGAINST minting). DA: led the rejection.**

An `owl:ObjectProperty` of that name trips the **session-045 Q1 re-open trigger verbatim** (line 129). An `owl:AnnotationProperty` form is, on the letter, outside the trigger (OWL2 Primer §8/§9 — annotations carry no formal meaning) but is either redundant with `skos:inScheme` (IRI cases) or, for the string cases, derivable only from `sh:message` prose over a non-injective map — the manufactured-from-prose move the 045 settlement forbids in spirit. **Knublauch and Hendler withdrew it after this exchange; Isaac disavowed it; panel unanimous it is dead.**

### Q3b — Regenerate the ~21 string-literal `sh:in` as concept-IRI `sh:in`?

**REVISE — regenerate to concept-IRI `sh:in` is the ratified TARGET, executed as an operator-gated atomic instance-data migration (NOT a council-mandated tidy-up); deferral floor = STAY + machine-readable limitation log. 5–0–0 FOR (unanimous). DA: FULLY WITHDRAWN (ABSTAIN → REVISE/FOR, on the §7a-drift evidence).**

**The defect, stated precisely (converged across the bench):** it is **not** a validation defect and **not** a field→scheme defect (with the predicate in hand the map is 1:1, recoverable by an OPDA-specific transform). It **is** a **value→concept / SKOS-traversal gap**: the instance value is a plain literal `"Freehold"` carrying no edge to the SKOS layer, so the canonical joins (`?v skos:inScheme ?s`, `skos:notation`, `skos:broader`) return **empty** — a generic SKOS consumer cannot resolve the value to its concept; recovery needs an unasserted, prose-only predicate→scheme hop. Concept-IRI values are **self-describing on the open web** (Berners-Lee LD principles 3 & 4 — Hendler) and are the form **ODR-0011 §7a already specifies** ("`sh:in` on concept URI"), so the emitted string form is a *drift from doctrine*, not the doctrine.

**Isaac:** REVISE/FOR — coded values should be concept IRIs; the §7a-specified form; deferral floor STAY+log.
**Knublauch:** REVISE/FOR — concept-IRI `sh:in` joins via `inScheme` like currency/peril; *correctness* at the value→SKOS-edge level (four empty traversals); execute as an atomic lift+base+overlay cutover guarded by `ci-baspi5-roundtrip`.
**Hendler:** REVISE/FOR — characterised as a **dereferenceability** improvement (not a present validation-correctness defect); operator-staged; the OWL layer untouched (passes entailment-honesty).
**Allemang (Queen):** REVISE/FOR — concept-IRI `sh:in` is the doctrinally-correct end state worth doing as a staged migration; the derived view + the now-implemented `usesSchemes` recovery serve the interim need.
**Cagle (DA):** **REVISE/FOR — FULL WITHDRAW** of his opening REJECT/HOLD, in two evidence-won stages: first conceding (to Isaac) the string form is *instance-level lossy* (scheme-scope not self-described in the data graph), then (to Knublauch) verifying firsthand that **ODR-0011 §7a's typing table mandates `sh:in` on concept URI** and ODR-0013 mandates `sh:in` over the scheme — so the string-literal emission is a *drift the doctrine already disavows*, and concept-IRI `sh:in` is a *restoration of fidelity*, not a new direction. Verbatim rationale: *"§7a is my own recorded analysis (line 233); I could not defend the misreading. Not recording the target leaves §7a's table contradicted by emission — the worse state."*

**Vote Q3b: 5–0–0** REVISE/FOR — **unanimous**. The disposition is identical across all five: concept-IRI `sh:in` is the §7a-faithful target, executed as an operator-gated atomic migration, never a same-version source edit. The only residual is the execution guard (below), co-signed, not dissent.

## Synthesis (Queen — Allemang)

The session-045 referral resolves cleanly and **vindicates the as-built design**: the currency/peril `rdfs:range skos:Concept` is **correct, not an under-specification** (Q1/Q2, 5–0–0) — the two-layer split (OWL says "a concept", SHACL `sh:in` says "which", scheme-membership lives on the `skos:inScheme` relation, never reasoned) is the faithful OWL/SKOS/SHACL division of labour, and tightening the OWL range would be either illegal (a scheme is disjoint with a concept — S9) or hazardous (unretractable entailments OWA cannot honour — ODR-0029/0031). This **closes the session-045 line-138 caveat** and confirms the extractor fix shipped this session: `usesSchemes` is recovered via the `sh:in`-IRI→`inScheme`→scheme join with the range left exactly as-is.

On the string-enum binding the council is equally clear in two directions: **REJECT** minting any `opda:constrainedByScheme` property (it is redundant with `inScheme` or prose-derived — the 045 guardrail holds, unanimous), and **REVISE toward concept-IRI `sh:in`** as the ratified target — because the string form, while operationally adequate and field-level recoverable, is **lossy at the value→concept layer** (a generic SKOS consumer hits empty traversals; the binding is recoverable only via the shapes graph + an unasserted predicate→scheme map) and is a **drift from ODR-0011 §7a's own doctrine**. The decisive moves were the DA's **two evidence-won reversals**: Cagle attacked the "tighten" framing and *won* on Q1/Q2 (no tightening), then **fully withdrew** on Q3b — first conceding to Isaac that the string form is instance-level lossy, then to Knublauch that **§7a's own typing table mandates `sh:in` on concept URI**, so the string emission is a drift and concept-IRI `sh:in` is a restoration of fidelity. His words: §7a is his own recorded analysis — he *"could not defend the misreading."* Q3b thus lands **unanimous (5–0–0)**, with only the execution discipline (operator-gated, never a same-version edit) as a co-signed guard — not dissent.

That disposition is an **operator-gated atomic instance-data migration**, not a council edit: the instance layer is JSON lifted to RDF (currency already proves the lift mints IRIs), so it is one lift-contract change cutting base + every overlay `sh:in` over together (ODR-0010 stacked `sh:in` is conjunctive → empty intersection if mismatched), guarded by `ci-baspi5-roundtrip` extended to assert the composed `sh:in` is the IRI set-union, ODR-0013 severity preserved. **Until the operator schedules it, STAY** `xsd:string`+`sh:in`+§7a **with the value→SKOS-edge gap logged machine-readably** (never papered over as "correct-by-doctrine, nothing to see"), and the interim surface is the session-045 derived view / per-class "constrained-by" panel.

**Citations** Queen-verified (S9 disjointness, S4 inScheme range, S14 per-language prefLabel, inScheme non-functional — web-checked 2026-06-16). Two peer errors were caught *inside* the deliberation: Isaac corrected Knublauch's over-claim that `inScheme` is functional / prefLabel is per-scheme (it is per-language, S14; `inScheme` is not functional, §4.6.1), and both Isaac and Hendler self-corrected a loose "§8.1 inScheme" to §4.3 S4 — the [[council-web-verify-citations]] discipline working as intended.

**Status:** proposed. The operator ratifies. No held dissent — Q3b ended unanimous after two evidence-won DA reversals; the co-signed Q3b execution guard is recorded below.

## Tally appendix

| Voice | Q1 | Q2 | Q3a (mint) | Q3b (regen) |
|---|---|---|---|---|
| Allemang (Queen) | FOR keep | FOR | AGAINST | FOR |
| Hendler | FOR keep | FOR | AGAINST | FOR |
| Isaac | FOR keep | FOR | AGAINST | FOR |
| Knublauch | FOR keep | FOR | AGAINST | FOR |
| Cagle (DA) | FOR keep¹ | FOR¹ | AGAINST | FOR² |
| **Tally** | **5–0–0** | **5–0–0** | **0–5–0** (REJECT mint) | **5–0–0** |

¹ DA HELD the affirming pole — he attacked the tightening framing and it did not survive (independent OWL/SKOS/SHACL convergence on keep).
² DA FULLY WITHDREW (ABSTAIN→FOR) on Knublauch's §7a-drift evidence — ODR-0011 §7a's table mandates `sh:in` on concept URI, so the string form is a drift and the regen is a restoration of fidelity (§7a is Cagle's own recorded analysis). The residual is an execution guard, not dissent.

### DA scorecard (Kurt Cagle)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **HELD** (affirming pole) | Tightening framing rejected. **Re-open:** only if a consumer needs OWL-range entailment the `sh:in`-IRI→`inScheme` join can't deliver, OR currency/peril concepts acquire an independent `rdf:type` classification clearing the ODR-0011 §8a OntoClean bar. |
| Q2 | **HELD** (affirming pole) | **Re-open:** only if ODR-0029/0031 is revised to intend OWL-side reasoning for closure, OR an OWL-profile consumer shows a sound non-hazardous scheme-typed range. |
| Q3a | **CONCEDED → led REJECT** (both forms) | Minting `opda:constrainedByScheme` trips the 045 line-129 trigger; the **REJECT covers both `owl:ObjectProperty` AND `owl:AnnotationProperty`** on the *provenance spirit* — the annotation form escapes the entailment letter (OWL2 Primer §8/§9, no formal meaning) but for string cases its content is authored from `sh:message` prose, the fabrication 045 forbids; moot under Q3b's concept-IRI join. **Re-open only if** a `constrainedByScheme` is proposed whose content is *derived deterministically* (the IRI `sh:in`→`skos:inScheme` join) as a materialized view, never hand-authored from prose. |
| Q3b | **FULLY WITHDRAWN** (ABSTAIN→FOR) | Two-stage reversal won on evidence: Isaac's instance-level-lossiness query, then Knublauch's §7a-drift proof (ODR-0011 §7a mandates `sh:in` on concept URI — Cagle's own recorded analysis; he "could not defend the misreading"). Modelling objection withdrawn entirely. **Residual is a co-signed EXECUTION guard, not dissent. Re-open toward REJECT only** if the regen is attempted as a same-version source edit (breaking the ODR-0010 subset-contract / empty intersection) or ships without the ODR-0029 round-trip determinism test passing. |

**No held dissent.** Q3b ended unanimous (the DA fully withdrew twice, on evidence). What remains is a **co-signed execution guard** (not dissent), to carry into any produced ODR: *concept-IRI `sh:in` regeneration is an operator-gated atomic lift+base+overlay migration — never a same-version source edit, never shipped without the ODR-0029 round-trip determinism test; if deferred, STAY only with the value→SKOS-edge gap logged machine-readably.*

### Per-question count

Q1 **5–0–0** · Q2 **5–0–0** · Q3a **0–5–0** (REJECT mint) · Q3b **5–0–0**. Fully unanimous on every question; **two genuine DA reversals**, both won on evidence (Isaac on instance-level lossiness; Knublauch on the §7a drift), recorded. The only residual is the Q3b execution guard.

## Discussion transcript

Full verbatim deliberation (openings → mirrored DMs → finals) preserved, committed, under `docs/ontology/odr/council/working/session-046/`: `cagle-da.md`, `hendler.md`, `isaac.md`, `knublauch.md` + `EVIDENCE.md`.

## Disposition routing (Step 5)

- **Q1 + Q2 → AFFIRM the as-built design** (`status: proposed`, `council: session-046`): keep `rdfs:range skos:Concept` + SHACL `sh:in` scoping. **Resolves the session-045 line-138 caveat** (the bare range is correct-by-design, not an under-specification). No source change; confirms the `usesSchemes`/`topConceptOf` extractor fixes shipped this session.
- **Q3a → REJECT** minting `opda:constrainedByScheme` in any form.
- **Q3b → REVISE (unanimous, operator-staged):** regenerate string-literal `sh:in` → concept-IRI `sh:in` is the ratified, **§7a-faithful** target (the current string emission is a drift from ODR-0011 §7a / ODR-0013); execute as a gated atomic lift+base+overlay migration (`ci-baspi5-roundtrip` extended; ODR-0010/0013 preserved; ODR-0029 round-trip test). **Deferral floor:** STAY + a machine-readable limitation log of the value→SKOS-edge gap. Interim surface: the session-045 derived view / per-class "constrained-by" panel.
- **Operator handoff:** all proposed; the Q3b migration is the operator's to schedule. The co-signed Q3b execution guard + re-open trigger recorded above (no held dissent — the DA fully withdrew).
