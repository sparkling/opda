# Council Session 029 (R2 reconvened) — UFO-Axis Sub-Modules: the Load-Bearing Judgement (Full panel)

- **Date:** 2026-05-31
- **Records:** Discharges [ODR-0023](../ODR-0023-descriptive-layer-follow-on-council-roadmap.md) **R2** — whether to spawn **ODR-0008a `property-qualities` / ODR-0008b `property-modes` / ODR-0008c `legal-estate-attributes`** now that the curated Category-G walk has landed ([ADR-0031](../../adr/ADR-0031-category-g-curated-walk-execution-plan.md) / [ODR-0024](../ODR-0024-curated-category-g-walk-dispositions.md), honest 179/239). Applies the [ODR-0008](../ODR-0008-property-descriptive-attributes.md) §Q2a(a) trigger. **No new ODR** — the verdict is *do not spawn, mint nothing*; it amends ODR-0023 R2 + ODR-0008 §Q2a(a) and re-routes ODR-0024 R4 + Kendall's S008 four-way.
- **Queen:** Dean Allemang (*Semantic Web for the Working Ontologist* 3e; author of the S025 load-bearing criterion; `property-qualities` steward).
- **Devil's Advocate:** Ian Davis (pragmatic linked-data minimalism — do not mint structure without a demonstrated consumer; HELD this dissent at S025).
- **Panel:** Giancarlo Guizzardi (UFO/OntoUML — `property-modes` steward); Nicola Guarino (OntoClean/DOLCE — partition-key rigor); Elisa Kendall (FIBO/ODM — `legal-estate-attributes` steward); Holger Knublauch (SHACL/TopBraid — realisation).
- **Voices:** 6 across 6 teammates.
- **`consensus-mode`:** `agent-fan-out` (no hive-mind). One-message parallel spawn; **file-based positions** (each teammate pre-briefed on the others' anticipated positions for a one-pass dialectic; no Agent-Teams cross-talk transport this session — deliberate, for run robustness). Working files in `working/session-029/`.
- **Format:** Full Council (greenfield first-cut adjudication, no WG gate — the council is the ratifying body). The substantive §Q2a(a) trigger is now testable (S025 ran provisionally under a gate-override and could not test it).
- **Input:** `working/session-029/{davis-da,allemang,guizzardi,guarino,kendall,knublauch}.md`; ODR-0023 R2; session-025; ODR-0024 R1/R4/R5/R12; ODR-0008 §Q2a/§Q5a; the live corpus (`opda-*.ttl`, `ci-category-g-coverage`).

## Context

ODR-0008 is monolithic. Its §Q2a(a) spawn-rule fires on **"UFO meta-category crystallisation — when ≥1 sub-module's leaf-set populates such that Quality / Mode / Substance-Kind-label distinctions are operationally load-bearing, spawn ODR-0008a/b/c by UFO axis"** (stewards Allemang / Guizzardi+Pandit / Kendall). [Session-025](./session-025-ufo-axis-submodules.md) — Reduced, provisional, under a directing-authority gate-override — ratified the 3-axis split **framework** + stewards + a per-axis trigger, **minted nothing**, and deferred the a/b/c spawn because no leaf was UFO-typed. Allemang's ratified criterion of record: *"a sub-module spawns only when a named consumer query needs an entailment that holds for that axis and not the others — turning the axis off must change an answer, else it is decorative and MUST NOT spawn."* Davis (DA) HELD against any minting until the trigger fires over **a counted, UFO-typed leaf-set + a named load-bearing query per axis**.

The gating event (the curated Category-G walk) has now landed. R2 reconvenes to test §Q2a(a) against the actual partition.

**The empirical findings the panel verified (the crux S025 could not reach):**

1. **The walk typed leaves by BEARER Kind (`rdfs:domain`), NOT by UFO meta-category.** Independently verified in the live TTL by Allemang and Guizzardi: there is **no `gufo:`/`ufo:` prefix declared and not one `rdf:type gufo:Quality`/`gufo:Mode` assertion** on any leaf (the lone "UFO" string is one `skos:scopeNote` on `opda:RiskAssessment`). The "UFO-typed leaf partition" that §Q2a(a) and S025 presupposed **was never produced**; what exists is a bearer-domain partition (ODR-0024 R1/R12).
2. **Bearer-domain distribution** of the emitted descriptive/property/agent/transaction properties: `opda:Property` 69 · `opda:LegalEstate` 25 · `opda:Search` 23 · `opda:Transaction` 15 · `opda:NearbyFacility` 8 · `opda:Organisation` 7 · `opda:RiskAssessment` 6 · `opda:Valuation` 5 · `opda:Seller` 5 · `opda:AttachedDocument` 4 · `RegisteredTitle`/`Proprietorship`/`Person`/misc 11.
3. **The 3-axis split reaches at most ~94 of 164 minted leaves** (Property 69 + LegalEstate 25); the other ~70 sit on classes the split does not address (authority-retrieved artefacts → ODR-0008d; agents → ODR-0006; transactions → ODR-0007). Within the 94: the 25 LegalEstate leaves are **already partitioned by `rdfs:domain opda:LegalEstate`**; the 69 Property leaves would need a **fresh per-leaf Quality-vs-Mode gUFO typing pass the walk did not perform**.
4. **The flagship leaves straddle/re-sort.** §Q5a tags `priceQualifier`/`marketingTenure` "**Mode / Quality Value**" (one leaf, two axes); `ownershipType` is a Quale-in-Region with `rdfs:domain opda:LegalEstate` (Allemang's qualities axis and Kendall's legal-estate axis claim the same leaf). Davis's S025 candidate-set-mismatch objection is otherwise **fixed** (ODR-0024 R5 grew candidate-G 188→239; `currentEnergyRating`/`councilTaxBand`/`builtForm` are now in G).

## Question 1 — Is the 3-axis split operationally load-bearing? Does a named consumer query need the entailment as a typed set?

**0–6–0 FOR load-bearing (unanimous REJECT). No spawn warranted on the trigger.**

- **Allemang (Queen):** REJECT. "Turn off a hypothetical `gufo:Quality` typing, re-run the corpus — not one answer changes, because not one query selects `?x a gufo:Quality`." His §Q6a reasoner-independence test at module grain; *real ≠ load-bearing* (Allemang, Hendler & Gandon 2020).
- **Davis (DA):** REJECT. No query tabled in ODR-0023 R2, S025, or ODR-0024; consumers reach `currentEnergyRating`/`groundRent` by predicate and bearer. The spawn "would declare what we cannot derive."
- **Guizzardi:** REJECT-as-met. He can construct the *shape* of a quality-space query ("worse-than-D over an ordered region" — Masolo et al. 2003 *WonderWeb D18*) but constructing ≠ exhibiting; and that entailment is delivered by the **SKOS scheme on the value**, not a module boundary on the property.
- **Guarino:** REJECT. OntoClean corroborates independently: a distinction earns structural status only when it does formal work; even a tabled query could be served by an `rdf:type` filter without a module.
- **Kendall:** REJECT. As the `legal-estate-attributes` steward she will not pretend her own axis needs it — every legal-estate question is answered by predicate-and-bearer (FIBO competency-driven method, Kendall & McGuinness 2019 §4).
- **Knublauch:** REJECT. His specific contribution: **no SHACL validator** needs the typed set either — every form constraint is already a property-shape keyed on the bearer node (ODR-0010 §Rules.1–2); turning a Quality typing off changes no validation report.

**Vote Q1: 0–6–0** (unanimous: not load-bearing; Allemang's S025 criterion fails on its own terms).

## Question 2 — Is UFO meta-category a rigid, stable partition key fit for a permanent w3id.org module boundary?

**0–6–0 FOR (unanimous REJECT as a boundary key). Three voices affirm the distinction is real/rigid as a *typing*; all six deny it is a sound *module-partition key*.**

- **Guarino (the central adjudication):** REJECT — but with the precision the panel needs. Quality and Mode are **not roles**; per DOLCE/UFO both are **rigid (+R)** universals (`currentEnergyRating` cannot be instantiated yet fail to be a quality), so Davis's "anti-rigid" framing taken literally is *too strong* and `gufo:Quality` may be soundly asserted on the clean leaves. **But rigidity of a *typing* is not soundness of a *partition backbone*** (Guarino & Welty 2009): a backbone must carry uniform identity (+I) and unity (+U) and be defined for **every** member with no straddler. `priceQualifier` ("Mode/Quality Value") puts one leaf in two cells (overlap or incomplete cover — either breaks the backbone); `ownershipType` rides two +I principles at once (inhering quality-kind vs bearer Kind) — an identity-criterion conflict. One unclean member voids a backbone. *The distinction earns `rdf:type`; it does not earn a namespace.*
- **Guizzardi:** REJECT. Under UFO a Mode∧Quality straddler is the signature of a **Relator hiding a Quality** (`priceQualifier` inheres in the listing/sale Relator — S007 territory), i.e. a modelling error, not a stable axis member. You cannot mint a rigid namespace around a key whose worked examples re-sort.
- **Allemang (Queen):** REJECT as a boundary key — a key that puts a leaf on the slash between two modules cannot cut a permanent boundary; the stable key is `rdfs:domain`.
- **Kendall:** REJECT as boundary key (AFFIRM only as commentary). FIBO draws boundaries where subject matter is rigid, never where a meta-theory is (Bennett 2013; Kendall & McGuinness 2019 §5.2). Her own steward-leaf (`ownershipType`) lands on the slash.
- **Knublauch:** REJECT. §Q5a fails single-valuedness in its own table; the one machine-checkable single-valued key is `rdfs:domain` — exactly what a SHACL `sh:targetClass` already keys on.
- **Davis (DA):** REJECT. A key whose members re-sort under examination is decorative, not rigid.

**Vote Q2: 0–6–0** (unanimous: not a valid module-partition key. Recorded nuance: Guarino/Guizzardi/Kendall affirm the Quality/Mode distinction is *ontologically real and rigid as a typing* — this is the held-as-live claim, §DA scorecard).

## Question 3 — Module reality: does ODR-0008c collapse to `rdfs:domain`? Do a/b need a typing pass not yet done? What of the ~70 out-of-scope leaves?

**Unanimous on the substance: no module is drawable today.**

- **Kendall (the steward who would own 0008c):** "The module I would own is **not a module**." ODR-0008c **is** `SELECT ?p WHERE { ?p rdfs:domain opda:LegalEstate }` (25 leaves, already partitioned) — a namespace wrapper around a domain filter that already returns the set; ceremony, not modularization. What it actually expresses is her **attachment-class** distinction (S008 Q2), realised by `rdfs:domain`, not the UFO axis.
- **Allemang / Davis / Guarino / Knublauch:** concur — 0008c collapses to the domain filter; ODR-0008a/b cannot be drawn (the 69 Property leaves carry no `gufo:` type — the typing pass was never run); the ~70 non-Property/non-LegalEstate leaves are already routed to ODR-0008d/0006/0007. A backbone sorting **under 60%** of its nominal domain is a partial overlay, not a modularization.
- **Guizzardi:** REVISE — "the three axes are not one object": 0008c is Kendall's attachment-class four-way (a category mistake to label it "Mode/Quality"); a/b are a genuine-but-unbuilt gUFO pass; the ~70 belong elsewhere (and ODR-0008d already typed its artefacts via Information-Object `rdf:type`, not a wall).

**Vote Q3: 0–6–0 FOR "a module is drawable now"** (unanimous: ODR-0008c = a `rdfs:domain` filter, not a module; a/b have no typed leaf-set; ~70 leaves out of axis-scope).

## Question 4 — Disposition: spawn now / defer with a sharpened trigger / reject the UFO-axis split?

**0–6–0 FOR spawn-now (unanimous): keep ODR-0008 monolithic; mint nothing; DEFER a/b on a sharpened conjunctive trigger; STRIKE ODR-0008c from the UFO-axis roadmap.**

- All six: do not spawn. The genuinely useful cut (where one exists) is **bearer Kind / attachment-class** (Kendall's S008 four-way), and it is *already realised losslessly by `rdfs:domain`* — so even it does not warrant a spawn today.
- **Guarino:** sort by a *sortal that carries identity* (bearer Kind), not by inherence-category; conjunct (ii) of the trigger is the OntoClean disjointness/identity gate.
- **Kendall:** formally **retires the expectation that ODR-0008c spawns on the UFO trigger**; her four-way re-opens only on its *original* condition (encumbrance/lease-cardinality), and even then the first remedy is a bearer-Kind promotion under ODR-0005, not a UFO sub-module.

**Queen resolution — the sharpened re-open trigger.** ODR-0008a/b spawn only when **BOTH**:

- **(i) a typed set exists as data** — a per-leaf gUFO typing pass has committed `?x a gufo:Quality` / `gufo:Mode` over the Property descriptive leaf-set, with **straddlers (`priceQualifier`) and re-sorters (`ownershipType`) adjudicated to exactly one cell by a stated rigid rule** (Guarino's identity/disjointness gate; Guizzardi: re-analyse `priceQualifier` as a Quality of the listing Relator); **AND**
- **(ii) the typing bites** — a named consumer query *or* a named SHACL validator (Knublauch) needs an entailment true on one axis and false on another, such that **turning the typing off changes an answer or a validation report** (Allemang's criterion).

**ODR-0008c does NOT spawn on the UFO trigger at all** — it is definitionally `rdfs:domain opda:LegalEstate`; struck from the UFO-axis roadmap. Kendall's attachment-class four-way re-routes to its original S008 Q2 trigger.

**Vote Q4: 0–6–0** (unanimous: do not spawn; monolithic ODR-0008 preserved; conjunctive trigger recorded; 0008c struck from the UFO axis).

## Question 5 — If not spawning, preserve the UFO insight without minting modules?

**6–0–0 FOR a lightweight annotation route (not SHACL, not a module); a recorded minority split on the *mechanism*.**

- **Dominant position (Guizzardi, Guarino, Knublauch, Davis):** preserve via per-property **gUFO `rdf:type`** (`gufo:Quality`/`gufo:Mode`), **gated to uncontested leaves only** (EPC/council-tax/built-form Quale-in-Region), **omitting straddlers (`priceQualifier`) and re-sorters (`ownershipType`)** until a rigid rule adjudicates them — exactly as ODR-0008d typed authority-retrieved artefacts as UFO Information Objects by `rdf:type`, not a module. **Knublauch pins the home:** the separate **annotation graph**, never the shapes graph (ODR-0010 §Q7a CI-test-3: `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` → FALSE), because a `gufo:` type is a classification triple, not a constraint. **Not SHACL** (implies an absent validator; re-incurs the rejected structure cost). `dct:subject` only as a lighter fallback where the type itself is contested.
- **Allemang (more conservative minority on mechanism):** keep it as `skos:scopeNote`/`rdfs:comment` **prose** for now; do **not** assert `gufo:rdf:type` yet (that manufactures the entailment Q1 found no query for). When a typing pass + a biting query arrive, the assertions become load-bearing and *then* we type. Kendall sits between (gated annotation, query-free).

**Queen resolution.** The annotation route is unanimous; the mechanism split is real but narrow and need not be resolved now, because **the gUFO typing pass is itself conjunct (i) of the Q4 trigger** — i.e. asserting `gufo:Quality`/`gufo:Mode` on the leaf-set is the very precondition a future spawn requires. So the **disposition is a single deferred work item**: *a gated gUFO `rdf:type` typing pass over the uncontested Property descriptive leaves, in the annotation graph, omitting the straddlers* — and running it both (a) preserves the insight and (b) builds the typed set without which no honest spawn judgement exists. Until it is commissioned, the insight lives in this record + ODR-0023 R2 + ODR-0008 §Q5a prose (Allemang's floor). It is **not executed in this session** (it is a generator/emitter change for a dedicated work item).

**Vote Q5: 6–0–0** for the annotation route (mechanism: 4 for gated `rdf:type`-now, Allemang for prose-until-trigger, Kendall middle — recorded, not blocking).

## Synthesis (Queen — Allemang)

R2 was gated on the curated walk producing a **UFO-typed leaf partition**, on the theory that only then could §Q2a(a)'s "operationally load-bearing" be judged rather than guessed (S025; ODR-0023 §Findings). The walk landed — and the decisive, unanimous finding is that **it produced a bearer-domain partition, not a UFO one**: there is no `gufo:Quality`/`gufo:Mode` typing anywhere in the emitted corpus (verified live by two independent seats). So the precise input the spawn-rule presupposes still does not exist, and my own S025 criterion — *turning the axis off must change an answer* — **fails on its own terms**: no tabled query and no SHACL validator selects on the meta-type.

The panel divided exactly where an honest panel should: on **Q2**, Guarino and Guizzardi refused Davis's convenient "it's anti-rigid" — the Quality/Mode distinction is *real and rigid as a typing*; Davis overstated. But Guarino supplied the foundational ground Davis only reached pragmatically: **rigidity of a typing is not soundness of a partition backbone** — a backbone needs uniform identity and definedness for *every* member, and `priceQualifier` (two cells) + `ownershipType` (quality-by-type, legal-estate-by-bearer) fail the disjointness and identity gates on the flagship cases. One unclean member voids a backbone. The distinction earns `rdf:type`; it does not earn a namespace. The two stewards whose modules the rule names — Kendall (`legal-estate-attributes`) and I (`property-qualities`) — both **decline to spawn**, and Kendall's is the sharpest finding of the session: **ODR-0008c is not a module, it is `rdfs:domain opda:LegalEstate`** — her attachment-class four-way, already realised, mislabelled as the UFO axis. That conflation is now closed.

**Verdict:** the §Q2a(a) UFO-axis trigger is **judged NOT met**; ODR-0008 stays monolithic; nothing is minted. The framework (S025) stands — the axes are a sound analytic lens — but the spawn is **deferred behind a sharpened conjunctive trigger** (a committed gUFO typing pass *with straddlers adjudicated* **AND** a named query/validator that bites). **ODR-0008c is struck from the UFO-axis roadmap** (it is a domain filter); Kendall's four-way re-routes to its original encumbrance-cardinality trigger. The UFO insight is preserved, not lost, via a gated gUFO `rdf:type` annotation pass — which is also the trigger's first conjunct, so the constructive next step and the re-open precondition are one and the same. This re-affirms the subtractive-programme posture S025 set: *do not mint permanent w3id.org namespaces around an analytic lens that re-sorts under the next reasoner pass.* No new ODR; ODR-0023 R2 + ODR-0008 §Q2a(a) amended; ODR-0024 R4 re-routed.

## Tally appendix

| Voice | Q1 load-bearing | Q2 partition key | Q3 module real now | Q4 disposition | Q5 preserve |
|---|---|---|---|---|---|
| Allemang (Queen) | REJECT | REJECT | no (collapse) | DEFER a/b · strike 0008c | prose-until-trigger¹ |
| Davis (DA) | REJECT | REJECT | no | REJECT-split / DEFER | gUFO `rdf:type`, gated |
| Guizzardi | REJECT | REJECT | REVISE² | REVISE → DEFER | gUFO `rdf:type` (AFFIRM) |
| Guarino | REJECT | REJECT³ | no | REJECT-split / DEFER | gUFO, uncontested only |
| Kendall | REJECT | REJECT³ | no (collapse) | REJECT-split / DEFER | gated annotation |
| Knublauch | REJECT | REJECT | no | REVISE → DEFER · strike 0008c | gUFO in annotation graph |
| **Tally (FOR proposition)** | **0–6–0** | **0–6–0** | **0–6–0** | **0–6–0** | **6–0–0 (annotation route)** |

¹ Allemang: keep as `skos:scopeNote`/`rdfs:comment` prose; assert `gufo:rdf:type` only once a typing pass + biting query arrive (minority on mechanism, not on route).
² Guizzardi "REVISE" on Q3 = "the three axes are not one object" (0008c = attachment-class; a/b unbuilt; ~70 elsewhere) — substantively concurs no module is drawable now.
³ Guarino/Kendall AFFIRM the Quality/Mode distinction is *ontologically real/rigid as a typing* while REJECTing it as a *module-partition key* — the held-as-live claim.

### DA scorecard (Ian Davis)

This is the uncommon case where the **DA's case became the verdict** — the panel converged *with* the opposition, so the "withdrawal/hold against an adopted proposition" mechanism inverts: the pro-spawn proposition was defeated, and Davis's REJECT is **sustained** on every question because none of his stated withdrawal conditions was met by the current evidence.

| Q | DA disposition | Withdrawal condition | Status |
|---|---|---|---|
| Q1 | **REJECT (sustained)** | a reviewable consumer query (SPARQL + named consumer) whose answer-set changes when an axis is turned off | **unmet** — none tabled |
| Q2 | **REJECT (sustained)** | a rigid rule assigning `priceQualifier` + `ownershipType` to exactly one axis each, no straddlers | **unmet** — both still straddle |
| Q3 | **REJECT (sustained)** | for a/b: a committed (not asserted) per-leaf gUFO typing pass over the 69 Property leaves; for c: an entailment `rdfs:domain opda:LegalEstate` does not already license | **unmet** — typing pass not run; c is the domain filter |
| Q4 | **REJECT-split / DEFER** | move to SPAWN iff both conjuncts of the sharpened trigger hold at once | **unmet** — adopted as the verdict's trigger |
| Q5 | **REVISE (annotation)** | SHACL over annotation only once a named validator must enforce the distinction at a data boundary | n/a — annotation route adopted |

**Held-as-live dissent (the pro-spawn case, preserved):** the Quality/Mode/Substance-Kind distinction **is ontologically real and rigid as a typing** (Guizzardi, Guarino, Kendall-as-commentary) and *will* warrant sub-modules once the leaf-set is gUFO-typed and a query needs the entailment. **Re-open trigger:** the Q4 sharpened conjunctive trigger — (i) a committed gUFO typing pass with straddlers adjudicated **AND** (ii) a named query/validator that bites. Recorded in ODR-0023 R2 and ODR-0008 §Q2a(a).

### Per-question count

Q1 0–6–0 · Q2 0–6–0 · Q3 0–6–0 · Q4 0–6–0 · Q5 6–0–0. No question fell below the comfort threshold; the proposition (spawn ODR-0008a/b/c) is defeated unanimously on Q1–Q4, and the constructive alternative (gated gUFO annotation) carries unanimously on Q5.

## A9 note

No `kind: pattern` ODR is produced — the verdict **declines** to mint UFO-axis modules and recommends a deferred annotation pass. The Quality/Mode/Substance-Kind meta-categories, if later asserted as `gufo:rdf:type`, carry their identity criteria via ODR-0008's existing §Q5a per-leaf bindings (Quale-in-Region → SKOS-ranged Quality of `opda:Property`) and the gUFO axioms; **ODR-0008 remains the owner of the descriptive-attribute UFO category + IC**. This session adds only the *spawn-gate refinement* (a `methodology`/`programme`-grade amendment to ODR-0023 R2 + ODR-0008 §Q2a(a)), which A9 relaxes. Should the deferred typing pass run, its `rdf:type` assertions are classification triples (annotation graph), not new bearers, and require no fresh IC.

## Consequences

- **ODR-0008 stays monolithic; nothing minted; no emission, no generator change, no byte-identity re-pin.** The walk's 179/239 coverage and all CI gates are untouched.
- **Amend [ODR-0023](../ODR-0023-descriptive-layer-follow-on-council-roadmap.md) R2:** from "TRIGGER FIRED → may convene" to **"ADJUDICATED (S029): convened; §Q2a(a) judged NOT load-bearing → no spawn; framework affirmed; ODR-0008c struck from the UFO axis; a/b deferred on a sharpened conjunctive trigger."** The R2 row is updated, not struck (the spawn possibility remains, gated).
- **Amend [ODR-0008](../ODR-0008-property-descriptive-attributes.md) §Q2a(a):** record that the (a) UFO-axis arm was tested S029 and not met; state the sharpened conjunctive trigger; note ODR-0008c is removed from the UFO-axis spawn (it is `rdfs:domain opda:LegalEstate`).
- **Re-route [ODR-0024](../ODR-0024-curated-category-g-walk-dispositions.md) R4:** the `opda:School`/`opda:HealthCareFacility` Subkind split's re-open trigger named "*or the ODR-0023 R2 axis review*" — R2 has now reviewed and not spawned, so that arm is **spent**; R4 rides only on "a consumer query needing per-band typing."
- **Kendall's S008 Q2 four-way (attachment-class)** is disentangled from the UFO axis and re-routed to its original **encumbrance/lease-cardinality** trigger; first remedy if it fires is a bearer-Kind promotion under ODR-0005, not a UFO sub-module.
- **New deferred work item (Q5):** a **gated gUFO `rdf:type` typing pass** over the uncontested Property descriptive leaves (EPC/council-tax/built-form Quale-in-Region), in the **annotation graph** (never the shapes graph — ODR-0010 §Q7a), **omitting** the straddlers (`priceQualifier`, `marketingTenure`) and re-sorters (`ownershipType`) pending a rigid adjudication rule. This both preserves the UFO insight and *is* conjunct (i) of the R2 re-open trigger. Logged to ADR-0005 §G (deferred-work register). Not executed this session.
- **No WG-pending tag** — greenfield first-cut, the council is the ratifying body ([[opda-greenfield-no-wg-gate]]).
- **Track-record row** added to [adoption.md](./adoption.md).

## References

- [ODR-0023 R2](../ODR-0023-descriptive-layer-follow-on-council-roadmap.md) — the roadmap row this discharges. [session-025](./session-025-ufo-axis-submodules.md) — the provisional framework ratification this completes.
- [ODR-0008 §Q2a(a)](../ODR-0008-property-descriptive-attributes.md) — the spawn-rule tested. [ODR-0024](../ODR-0024-curated-category-g-walk-dispositions.md) R1/R4/R5/R12 — the walk dispositions + bearer partition + R4 trigger re-routed.
- [ODR-0010 §Q7a](../ODR-0010-overlay-profile-mechanism.md) — the annotation-graph / shapes-graph boundary the Q5 disposition must respect. [ADR-0005 §G](../../adr/ADR-0005-deferred-work-register.md) — where the gUFO typing-pass work item is logged.
- Grounding sources cited: Allemang, Hendler & Gandon, *Semantic Web for the Working Ontologist* (3e, 2020); Guizzardi, *Ontological Foundations for Structural Conceptual Models* (2005) + Almeida et al., gUFO (2019); Guarino & Welty, "An Overview of OntoClean" (2009) + Masolo et al., *WonderWeb D18* (2003); Kendall & McGuinness, *Ontology Engineering* (2019) + FIBO (Bennett 2013); SHACL (W3C Rec 2017, Knublauch & Kontokostas eds.).
- Working positions: `working/session-029/{davis-da,allemang,guizzardi,guarino,kendall,knublauch}.md`.
