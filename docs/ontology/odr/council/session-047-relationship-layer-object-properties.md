# Council Session 047 — Relationship layer: reify inter-entity associations as OWL object properties (Full Council)

- **Date:** 2026-06-17
- **Records:** [ODR-0032](../ODR-0032-relationship-layer-object-properties.md) (ratification review) + companion [ADR-0048](../../../adr/ADR-0048-relationship-emission-walk-and-object-property-coverage-gate.md). Verdict: **Option A RATIFIED with amendments** (status stays `proposed`; the OPDA WG / Modelling Sub-Committee ratifies adoption).
- **Queen:** Elisa Kendall (OMG/EDM Council; FIBO relationship-as-first-class; frequent Queen).
- **Devil's Advocate:** Ian Davis (BBC `/programmes/` + UK-Gov publish-first / scope-discipline) — genuinely opposed to §R1's *reify-every-association-by-mandate* premise; recorded prior ODR-0007 "defer until a concrete consumer" dissent.
- **Panel:** Dean Allemang (RDF idiom / reuse-vs-mint), Giancarlo Guizzardi (UFO relators/roles/qua-individuals), Nicola Guarino (OntoClean identity criteria), Kurt Cagle (SHACL-first / value-not-class), Jim Hendler (OWL domain/range *entailment*).
- **Voices:** 7 across 7 teammates.
- **`consensus-mode`:** `agent-fan-out` (per-question votes independent; no cross-question vote-conditionality; no downstream typed-output consumer → no hive-mind trigger). Cross-talk transport: **`SendMessage` via Agent Teams** (team `council-047`); swarm bookkeeping via `/ruflo-swarm:swarm` (`swarm-1781438175004`). One opening + a live multi-round rebuttal; every DM mirrored verbatim into `working/session-047/<persona>.md`.
- **Format:** Full Council.
- **Input:** `working/session-047/{kendall,davis,allemang,guizzardi,guarino,cagle,hendler}.md`; ODR-0032; ADR-0048; ODR-0006; ODR-0007; ODR-0022 (the datatype-leaf gate this mirrors); ODR-0013 (shapes graph); ODR-0005 §6b (Address deferral). Convener corpus re-verification at `source/03-standards/ontology/opda-agent.ttl`, `opda-agent-shapes.ttl`, `exemplars/person-with-name-change.ttl`.

## Context

The OPDA ontology gave a *completeness discipline* — a curated walk ([ODR-0022](../ODR-0022-descriptive-layer-import-strategy.md)) plus a CI gate (`ci-category-g-coverage`, 239/239) — to only its **descriptive datatype-leaf** layer. Its **relationship layer** — the inter-entity OWL object properties ODR-0006/0007 designed (`playedBy`/`plays`, `founds`/`foundedBy`, `mediates`, `hasName`+`opda:Name`, `hasAddress` for Person/Org, Transaction→participant/property, chain predicates) — was *designed but never emitted*: corpus-wide only **7** object properties connect two `opda:` classes; ~30 classes have zero. ODR-0032 (Option A) proposes to un-freeze and reify that layer as OWL object properties each carrying `rdfs:domain`+`rdfs:range`, ratify a §R2 inventory + role-play/relator SHACL, and impose a **relationship-completeness criterion** (§R1: reify *every* source inter-entity association, *no collapse*) enforced by a new `ci-object-property-coverage` gate (ADR-0048). It rejects Option B (rangeless/documentary), C (hand-add a few), D (SHACL-only).

The contest the Council adjudicated: is §R1's *reify-everything-by-mandate* the right discipline, or does it over-reify source containment? Is `opda:Name` a class or a value? Are OWL `rdfs:domain/range` the right carrier given their *entailment*? **Outcome: the core proposition was ratified by every seat; the deliberation reshaped its *form* — and, through corpus-grounded cross-talk, fully converged**, with the DA withdrawing every attack after the amendments answered them.

## Question 1 — Framing / un-freeze: settled implementation gap, or fresh modelling?

**6–0–1 FOR (amended). Davis (DA) ABSTAINED on the §R4 wording — condition met by the adopted §R4 record.**

**Kendall (Queen):** AFFIRM/FOR — settled implementation gap; the contested endpoints are decided in the open here, and none touches the *vocabulary* (W3C-Org-vs-bespoke) Kind-layer freeze (Kendall & McGuinness 2019, Ch.3; ODR-0007 freeze gate CLEARED).
**Allemang:** AFFIRM/FOR — the §R2 spine was ratified; only leaf endpoints (Q3/Q6) are fresh; "if 'orthogonal' reads too strong in §R4, 'separable/non-blocking' carries my vote without overclaiming" (*SWWO* 3rd ed., Ch.3).
**Guizzardi:** AFFIRM/FOR — the categories were ratified in ODR-0006/0007; the current rangeless state is *less* coherent than the design (Guizzardi 2005 §4.4).
**Guarino:** REVISE/FOR — gap and un-freeze are real and separable, but reject "no new modelling debate": §R1's "first-class entity" predicate required fresh ontological adjudication (this session supplied it). Record the endpoint test as a Council ruling (OntoClean).
**Cagle:** AFFIRM/FOR — classic shapes-shipped-ahead-of-class gap.
**Hendler:** AFFIRM/FOR — implementation-gap closure for the *existence* of the edges; their axiomatic form is Q2/Q5.
**Davis (DA):** opened AGAINST §R4 as worded ("'already-decided, just emit' is dishonest while §R2 mints `opda:Name`"). **Converged to ABSTAIN:** "once Name is a value-node (Q3), emitting a predicate with `rdfs:domain opda:Person` doesn't decide whether `opda:Person` is bespoke or W3C-Org-aligned; freeze (b) is about the *class* vocabulary, untouched." Residual is thin and reversible — emitting bespoke `opda:hasName`/`hasAddress` *predicates* is a predicate-vocabulary pre-commitment (W3C-Org idiom = `vcard:hasAddress`), cheaply revisited via `owl:equivalentProperty`/rename. **Abstention condition (met):** §R4 records one line that it emits bespoke `opda:` name/address *predicates* against the current Kind layer — a predicate-vocabulary choice that does **not** foreclose the W3C-Org *class* choice, revisitable at the Kind-layer council.

**Vote Q1: 6–0–1** FOR (amended); Davis ABSTAIN, condition met by the §R4 record.

## Question 2 — Completeness criterion §R1 (reify every source association?)

**7–0–0 FOR the rekeyed §R1. The "every containment" form is rejected by all seven; the endpoint-IC form carries unanimously. Davis (DA) WITHDREW in full.**

The decisive move (Guarino's OntoClean test, co-signed Allemang/Cagle, brokered with Kendall/Davis): **rekey §R1 from *source-containment* to *endpoint-identity-criterion*.**

**Guarino (locked wording):** "An association is reified as an `owl:ObjectProperty` (`rdfs:domain`+`rdfs:range`) IFF BOTH endpoints are first-class entities — each carrying its own IC (+I in OntoClean: a sortal/Substance-Kind per ODR-0005, OR a Relator/Role well-founded on such Kinds). A −I endpoint (quality, mode, anti-rigid Phase) is NOT an entity for this purpose; its source 'containment' is a datatype/SKOS value-slot — `DatatypeProperty`/`sh:in`, never an `ObjectProperty`" (Guarino & Welty 2009 §Identity, §Rigidity).
**Allemang:** the symmetric IC test + restore ODR-0022 §G3 **coverage-by-test** — a gated edge must be retrievable by a worked SPARQL query, not merely asserted.
**Kendall (Queen) — three-bucket register (Lock 1):** every source association resolves to exactly one of (i) **GATED** (both +I → typed object property); (ii) **VALUE-SLOT** (−I → datatype/`sh:in`); (iii) **PENDING-upstream-IC** (an endpoint whose IC is owned by an unfinished council → emit the predicate now, defer the range, and the gate is **forbidden from manufacturing a class** to satisfy coverage). The register is gate-checked (empty/"TODO" disposition fails).
**Guizzardi / Cagle / Hendler:** endorse — classify each edge material/characterising/reference (Guizzardi); the gate keys on predicate-declaration + reachability + type-pinning, not class-count (Cagle); "reified-or-disclaimed," not blanket domain+range (Hendler).
**Davis (DA):** opened REJECT (mechanical JSON-containment lift; ODR-0022's *mandate* imported, its §G3 *worked-query discipline* stripped). **WITHDREW in full:** "won by (a) the endpoint-IC rekey killing the over-capture, (b) Allemang folding §G3 coverage-by-test back in as the acceptance test for every emitted edge, with only the speculative chain pair deferred." He flagged the correct nuance: a blanket per-edge defer would strand participant/property edges with obvious consumers — so basic competency edges gate on their retrieving query; only `dependsOnTransaction`/`chainMembers` (pure ODR-0007 comment-ware, no exemplar) defer to the register. "The gate working as designed — the first real application of the coverage-by-test bar."

**Vote Q2: 7–0–0** FOR the rekeyed §R1 = endpoint-IC (both ends +I) + per-edge worked competency query + gate-checked three-bucket residue register (GATED / VALUE-SLOT / PENDING-upstream-IC). Against §R1 *as written*: 0–7.

## Question 3 — `opda:Name`: class or structured value?

**7–0–0 value-now (REVISE). Every seat — including the two opening class-supporters — converged on a structured value; the dependent-class option is bounded and its promote-trigger is corpus-verified NOT to have fired.**

**Framework (unanimous):** `opda:Name` is **not** a free-standing endurant Kind; it has no bearer-independent identity criterion (−I). Emit `opda:hasName` as a **structured datatype value** (components as `owl:DatatypeProperty`, optionally `sh:node`-grouped **with no class identity**); `hasName` carries **no `rdfs:domain`** (bearer-typing in SHACL `sh:or[Person|Organisation]`). It is **not** counted toward §R1 object-property coverage. **Promote** to a dependent `opda:Name` node only on a **named addressability trigger** — a stable referent a value cannot serve (a `NameChangeEvent` whose referent is a Name node, or name-level provenance) — **explicitly NOT entity-resolution** (name-matching is value-comparison that resolves to the *bearer*, the name being evidence).

Movement (the dialectic, recorded): **Hendler** (opened FOR-class) conceded "Name is value-determined, no bearer-independent IC" and ruled the value-node landing *final*, bounding the trigger to exclude entity-resolution. **Cagle** (SHACL `NameShape`) and **Guizzardi** both conceded the class — Guizzardi: "a quality's identity is fixed by its quale+bearer; change a component and you have a *different* name, not the same Name enduring; UFO licenses *structuring* a quality but not *reifying* it as a first-class endurant with an IC." **Guarino** supplied the OntoClean −I ground and traced the corpus. **Davis** held AGAINST the class with three grounds (−I; corpus ships name domain-less by design; ODR-0032's own §Out-of-scope files "structured name" in the backlog, contradicting §R2) → **flips to FOR** the moment §R2 drops the class row (done) → FOR.

**Convener verification (decisive).** Cagle's mid-debate claim that the `NameChangeEvent` promote-trigger is *live → emit a dependent class now* was checked and **does not hold today**: `opda:NameChangeEvent` (opda-agent.ttl:34) is wired so the event `prov:wasAssociatedWith` the **Person** (opda-agent-shapes.ttl:75), and the exemplar carries names as **string literals** (`opda:formerName`/`opda:previousName`, person-with-name-change.ttl:31,40) — no `opda:Name` node is referenced. Guarino independently traced the same triples. → The emitted branch is **value**; the dependent-class branch is a *recorded promote-trigger that has not fired*. (Cagle's "former/previous-name should resolve to `opda:Name` nodes" is a proposed emitter follow-on, not current state.) The peer claim that `opda:name` ships domain-less at `opda-agent.ttl:129`/`132` is plausible and consistent with the string-literal evidence but **I could not confirm the exact declaration line** by grep — recorded as a peer claim, not independently verified.

**Bounded Guizzardi option (Lock 2):** any WG latitude to emit a "dependent quality-node" form must yield a node that is −I and **not a literal `owl:Class`** (existential dependence via inbound `sh:maxCount 1`; no IC) — otherwise a `hasName` edge to an `owl:Class` endpoint would trip the very §R1 gate just rekeyed.

**Vote Q3: 7–0–0** value-now — strike `hasName`+`opda:Name` from the §R2 object-property inventory; `hasName` = datatype/structured-value path (no `rdfs:domain`; structure + bearer-typing in SHACL `NameShape`); bounded, named promote-to-(dependent, no-`owl:Class`)-node trigger; entity-resolution excluded.

## Question 4 — `playedBy`/`plays` vs role co-typing

**7–0–0 FOR emitting `playedBy` as the qua-individual navigable edge — OPTIONAL, distinct-node-only, never a self-edge. Davis (DA) WITHDREW the drift attack.**

**Guizzardi:** co-typing (`?x a Person, Seller`) and `playedBy` are *ontologically distinct* — the role qua-individual (Seller-of-THIS-transaction) is a relationally-dependent particular, not a denormalised copy (Guizzardi 2005 §4.3.2). `playedBy` must be **OPTIONAL** — required (in SHACL) only where bearer and role-instance are distinct nodes; never `?x playedBy ?x`.
**Guarino:** the qua-individual is externally founded and distinct from the rigid bearer (Masolo, Guizzardi, Vieu, Bottazzi, Ferrario, KR 2004); `playedBy` is "the model citizen of the rekeyed gate — the exact opposite of Name" (both endpoints carry ICs).
**Kendall / Allemang / Cagle / Hendler:** AFFIRM — the distinct-node navigable edge; the `sh:path` the ratified SellerShape already names; keep co-typing consistent via SHACL; different entailments, not redundant.
**Davis (DA):** opened AGAINST (drift-prone denormalisation, his session-043 status-string analogy). **WITHDREW without reservation:** "Guizzardi's qua-individual answer — `playedBy` names the role-instance, a *distinct* node, and gives it its one link home; that's normalisation, not a second copy — genuinely defeats my analogy; bearer identity lives in one place, so no drift vector." Common ground: `playedBy` is conditional, not §R1-mandatory. Added a constructive condition: a SHACL guard so the gate doesn't force a vacuous self-edge on co-typed roles.

**Vote Q4: 7–0–0** FOR — emit `playedBy`/`plays` (§R3 stands), **OPTIONAL / distinct-node-only, never a self-edge**, bearer disjunction Person∪Org in SHACL `sh:or` (not an `rdfs:range` union — see Q5).

## Question 5 — OWL object properties vs SHACL-only; the rangeless ban

**7–0–0 FOR the amended gate ("type-pinned in OWL OR SHACL"). Option D (SHACL-only) rejected by all seven; the absolute rangeless ban + blanket domain/range mandate rejected. The one residual — the `founds`/`mediates` carrier — RESOLVED to SHACL typing through corpus-grounded cross-talk; no held-as-live dissent.**

**Settled gate rule** (Hendler, co-signed Cagle/Guizzardi/Davis/Guarino; Queen-adopted): every `owl:ObjectProperty` MUST be a **declared predicate** (Option D's undeclared-predicate framing rejected); its co-domain MUST be **type-pinned by EITHER `rdfs:range` OR a SHACL `sh:class`/`sh:node` value-type shape**; the gate **FAILs on rangeless-AND-shapeless**, **not on rangeless per se**; `rdfs:domain` is asserted **ONLY where the subject-type entailment is universally true**; the gate ALSO fails a *not-universally-true* `rdfs:domain`/`range`. This **replaces** ODR-0032/ADR-0048's "FAIL on any `owl:ObjectProperty` missing `rdfs:domain` or `rdfs:range`." Supporting rulings: **normative MUST-warning** (Hendler) — `rdfs:domain`/`range` are *inferential* (RDF Schema 1.1 §2.3.1/2.3.2): they assign a type, never reject a mis-typed node, and MUST NOT be relied on as validation; the check lives in SHACL. **Two-graph gate separation** — class-graph dead-edge check kept separate from the shapes-graph bearer check (ODR-0013). **Bearer disjunction → SHACL `sh:or`, not `owl:unionOf`** (avoids dual authority; Hendler's worked example: `rdfs:domain opda:Person` on a name/address predicate would entail every name/address-bearing Organisation is a Person — the everything-becomes-a-Person anti-pattern).

**The `founds`/`mediates` carrier — resolved, not held.** Davis opened a HOLD on a genuine, verified contradiction: `opda:founds` (opda-agent.ttl:192) and `opda:mediates` (214) ship the literal comment **"Design-time, NEVER reasoned"** (ODR-0029/0030/0031), yet ADR-0048 §1 would add `rdfs:domain`+`rdfs:range`, making them entail. **Guizzardi then moved** (after Davis's corpus challenge, verified): take **option (b) — type-pin `founds`/`mediates` in SHACL `sh:class`, not OWL**, preserving "never reasoned" and ODR-0029/0030/0031. **Convener verification:** `ProprietorshipMediationShape` (opda-agent-shapes.ttl:59) has `sh:path opda:mediates` + `sh:minCount 2` but **no `sh:class` on the object** — `mediates` is range-unpinned in *both* OWL and SHACL today (exactly what the new gate should catch). The fix: add `sh:class opda:Proprietor` there, a Relator→Role `sh:class` shape for `founds`, and a SHACL subject-guard confining their subjects to the relator kinds (Davis's refinement — making the relator entailment *conservative-by-construction*, not by good behaviour). `rdfs:domain`+`rdfs:range` therefore applies only to single-domain edges with **no** never-reasoned commitment (`concernsProperty`, `hasRegisteredTitle`, and `dependsOnTransaction`/`chainMembers` when they leave deferral). Asserting `rdfs:domain`+`rdfs:range` on `founds`/`mediates` is recorded as a **deferred optional future decision** — a council MAY elect it (the entailment is conservative), but **only by explicitly deleting the "never reasoned" comments and overriding ODR-0029/0030/0031**; it is not ADR-0048's to make. Davis WITHDREW.

**Vote Q5: 7–0–0** FOR the amended gate rule; `founds`/`mediates` type-pinned in SHACL (`sh:class` + subject-guard), "never reasoned" preserved; `rdfs:domain`+`rdfs:range` reserved for the single-domain non-design-time spine; bearer disjunctions in SHACL `sh:or`. No held-as-live dissent.

## Question 6 — `opda:Address` reuse

**7–0–0 FOR reusing the single `opda:Address` + extending the `hasAddress` predicate; the Address class/IC is PENDING-upstream (ODR-0015) — the Q2 disposition-(iii) worked example. Guarino moved ABSTAIN→FOR; Cagle corrected class-now→class-pending.**

**Guarino:** extend the `hasAddress` *predicate* now (ODR-0006 "consume `opda:Address`"); place the Address **class/IC on PENDING** — ODR-0005 §6b explicitly deferred Mode-vs-Resource to ODR-0015 (Mode = −I/no shared IC; Resource = shared IC). The §R1 gate MUST NOT manufacture an `opda:Address` class to satisfy coverage. Moved ABSTAIN→**FOR** on the predicate-extension/class-pending landing.
**Cagle:** opened "class now (UPRN-keyed place has identity)" → **REVISED** after verifying ODR-0005 §6b (his own recorded S005 pre-commitment): "I won't commit a process violation I'd object to from anyone else" — predicate now, class pending ODR-0015. On the merits he still expects ODR-0015 to rule Resource, at which point Address graduates to a gated edge.
**Kendall / Allemang / Guizzardi / Hendler:** FOR — reuse the single class; **drop `hasAddress`'s `Property`-only `rdfs:domain`** (bearer-typing → SHACL; else "every addressed Person is a Property"); range deferred to ODR-0015; never parallel per-type predicates.
**Davis (DA):** FOR — Address passes the endpoint-IC test (reused, not re-minted); the "settle during emission" objection folds into the Q1/Q2 decide-by-rule discipline.

**Vote Q6: 7–0–0** FOR extending `hasAddress` (drop `Property`-only `rdfs:domain` → SHACL bearer-typing; reuse, never re-mint); Address class/IC **PENDING-upstream (ODR-0015)** = Q2 disposition (iii); the gate must not manufacture an `opda:Address` class. The Guarino↔Cagle difference (pending vs Resource-now) is a recorded narrow agreement-on-direction, resolved upstream by ODR-0015.

## Synthesis (Queen — Kendall)

**ODR-0032 Option A is RATIFIED with amendments — and the Council fully converged: no seat rejected the core proposition, and the Devil's Advocate withdrew every attack once the amendments answered them.** This is the strong form of a successful council: Davis's opposition *materially improved* the proposition (it is "strictly better than §R1/ADR-0048 shipped"), and was then satisfied — leaving no held-as-live dissent.

What the deliberation changed:

1. **§R1 rekeyed from source-containment to endpoint-identity-criterion** + a **three-bucket gate-checked residue register** (GATED / VALUE-SLOT / PENDING-upstream-IC) + restored ODR-0022 §G3 **worked-query acceptance test** per edge. Nothing silently dropped; the mechanical JSON-containment lift (the DA's core attack) is killed; parity with ODR-0022 achieved (accounted-for **and** coverage-by-test).

2. **The gate rule = "type-pinned in OWL OR SHACL"** (declared predicate; co-domain by `rdfs:range` *or* SHACL value-type shape; FAIL on rangeless-AND-shapeless; `rdfs:domain` only where universally true; not-universally-true domain/range also fails), with a normative *infer-not-constrain* MUST-warning and two-graph separation. Option D rejected by all seven.

3. **`opda:Name` leaves the relationship inventory** — −I, so a structured datatype value (`hasName` no `rdfs:domain`; structure + bearer-typing in SHACL); promote to a *dependent, non-`owl:Class`* node only on an addressability trigger (entity-resolution explicitly excluded). Corpus-verified that the trigger has not fired (`NameChangeEvent` names the Person, names are string literals).

4. **`playedBy`/`plays` emitted as the qua-individual navigable edge (§R3), OPTIONAL/distinct-node-only.** Guizzardi's grounding defeated the DA's drift attack outright.

5. **`founds`/`mediates` type-pinned in SHACL `sh:class` (not `rdfs:domain`+`rdfs:range`), preserving "never reasoned"** + a SHACL subject-guard (conservative-by-construction). This resolved the only residual split — Guizzardi moved here on corpus evidence (`mediates` is range-unpinned in both graphs today). The OWL-entailment path is a recorded *deferred optional* future decision, electable only by overriding ODR-0029/0030/0031. `rdfs:domain`+`rdfs:range` reserved for the single-domain non-design-time spine (`concernsProperty`, `hasRegisteredTitle`, and the chain pair if un-deferred).

6. **`opda:Address` reused, predicate extended (`rdfs:domain` dropped → SHACL), class/IC PENDING ODR-0015** — the worked example of the Q2 PENDING-upstream bucket; the gate may not manufacture an Address class.

**No held-as-live dissent.** The DA's five carried conditions are all met by the amendments (see scorecard). The one item that could have re-opened — the `founds`/`mediates` carrier — was *resolved* (SHACL typing), with the OWL-entailment alternative recorded as a future option rather than a live dissent.

**Downstream record impact.** Amend **ODR-0032** (§R1 endpoint-IC + three-bucket gate-checked register + worked-query; §R2 strike Name→VALUE-SLOT, `playedBy` optional, `founds`/`mediates` SHACL-typed, `hasAddress` predicate-extend / Address PENDING; §R4 predicate-vocabulary record; §Confirmation = the new gate rule) and **ADR-0048** (Phase 1 `founds`/`mediates` → SHACL `sh:class` + subject-guard, keep "never reasoned"; `playedBy` optional; Name datatype/SHACL not a class; `hasAddress` predicate-only, no manufactured Address class; Phase 4 gate = type-pinned-OWL-or-SHACL + per-edge worked query + two-graph separation). Both stay **`status: proposed`**; the WG / Modelling Sub-Committee ratifies (§Real-world Governance Handoff). `council: session-047` set on both.

## Tally appendix

Ballots are on the **amended** proposition (a REVISE adopted by the synthesis counts FOR).

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 |
|---|---|---|---|---|---|---|
| Kendall (Queen) | FOR | FOR | FOR | FOR | FOR | FOR |
| Allemang | FOR | FOR | FOR | FOR | FOR | FOR |
| Guizzardi | FOR | FOR | FOR | FOR | FOR | FOR |
| Guarino | FOR | FOR | FOR | FOR | FOR | FOR |
| Cagle | FOR | FOR | FOR | FOR | FOR | FOR |
| Hendler | FOR | FOR | FOR | FOR | FOR | FOR |
| Davis (DA) | ABSTAIN¹ | FOR² | FOR³ | FOR⁴ | FOR⁵ | FOR |
| **Tally** | **6–0–1** | **7–0–0** | **7–0–0** | **7–0–0** | **7–0–0** | **7–0–0** |

¹ Davis ABSTAIN (was AGAINST) — condition met by the §R4 predicate-vocabulary record.
² Davis WITHDREW (was AGAINST) — endpoint-IC rekey + §G3 worked-query acceptance test + chain-pair deferral.
³ Davis FOR (was AGAINST) — the §R2 `opda:Name`-class row is dropped (value-node), meeting his condition.
⁴ Davis WITHDREW (was ABSTAIN) — Guizzardi's qua-individual normalisation.
⁵ Davis WITHDREW (was AGAINST) — `founds`/`mediates` type-pinned in SHACL (preserves "never reasoned"); gate = type-pinned-OWL-or-SHACL.

### DA scorecard (Ian Davis)

| Q | Disposition | Condition / what won him |
|---|---|---|
| Q1 | **ABSTAIN** (was AGAINST) | Conceded the class-pre-emption (once Name is a value-node, the predicate doesn't decide the class vocabulary). **Carried condition (met):** §R4 records the bespoke-predicate-vocabulary pre-commitment as logged + reversible. |
| Q2 | **WITHDRAWN** (full) | Endpoint-IC rekey (Guarino/Allemang/Kendall) kills the JSON-containment over-capture; §G3 worked-query restored as the acceptance test; chain-pair deferred. |
| Q3 | **WITHDRAWN** (was AGAINST) | Flips to FOR the moment §R2 drops the `opda:Name`-class row — done (value-node). |
| Q4 | **WITHDRAWN** | "Guizzardi's qua-individual answer genuinely defeats my session-043 drift analogy." `playedBy` conditional, not §R1-mandatory. |
| Q5 | **WITHDRAWN** | Won by the type-pinned-OWL-or-SHACL gate; `founds`/`mediates` resolved to SHACL typing (his option b), preserving "never reasoned." **Carried conditions (met):** SHACL guard confining `founds`/`mediates` subjects to relator kinds; no "never reasoned" comment falsified (no `rdfs:range` added). |
| Q6 | **WITHDRAWN** | Address passes the endpoint-IC test (reused, not re-minted); folds into Q1/Q2. |

**Held-as-live dissent:** none. The Council fully converged. The `founds`/`mediates` OWL-entailment path (`rdfs:domain`+`rdfs:range`) is recorded as a **deferred optional future decision** (electable only by deleting the "never reasoned" comments + overriding ODR-0029/0030/0031), not a live dissent.

### Per-question count

Q1 6–0–1 · Q2 7–0–0 · Q3 7–0–0 · Q4 7–0–0 · Q5 7–0–0 · Q6 7–0–0. Lowest FOR-count: Q1 (6, one DA abstention). No core-proposition rejection on any question; the DA's attacks were all withdrawn after the amendments answered them.

## Discussion transcript

The full deliberation — opening positions, every cross-talk DM mirrored verbatim, position changes, and finals — is preserved per persona in `working/session-047/{kendall,davis,allemang,guizzardi,guarino,cagle,hendler}.md` (committed, not deleted; transcripts double as training material). Genuine, corpus-grounded movement (the value of real cross-talk over a Queen-composed digest):

- **Q2 over-capture → endpoint-IC:** Guarino → Davis (rekey to endpoint-IC); Allemang → Davis (per-edge worked query = faithful §G3 port; defer only the chain pair) → **Davis WITHDREW**.
- **Q3 class → value:** Hendler dropped FOR-class (conceded −I, bounded the trigger to exclude entity-resolution); Guizzardi conceded a quality cannot be reified as an endurant; Cagle's "trigger live" claim **corrected by convener verification** (`NameChangeEvent` names the Person).
- **Q4 drift → withdrawn:** Guizzardi → Davis (qua-individual is a distinct particular, normalisation not denormalisation) → **Davis WITHDREW**.
- **Q5 `founds`/`mediates` → SHACL:** Davis's corpus challenge ("can't add the entailment axiom and keep 'NEVER reasoned'") → **Guizzardi verified and moved** to SHACL `sh:class` typing; convener confirmed `mediates` is range-unpinned in both graphs → the split dissolved.
- **Q6 class-now → class-pending:** Guarino → Cagle (ODR-0005 §6b defers Address to ODR-0015) → **Cagle revised** his own ballot.

## Enforcement checklist

Named experts ✓ · Queen + DA named ✓ · DA genuinely opposed (publish-first vs reify-by-mandate) ✓ · DA explicit disposition on every contested question (all WITHDRAWN/ABSTAIN, conditions recorded) ✓ · `N–M–K` tallies (three integers) ✓ · citations grounded (all genuine pre-cutoff works; no post-cutoff refs) ✓ · **convener re-verified the load-bearing corpus claims at file:line** (`NameChangeEvent` relatum; `founds`/`mediates` "NEVER reasoned"; `mediates` range-unpinned in SHACL; `playedBy` absent) — and recorded one peer claim (`opda:name` line) as *not* independently verified ✓ · one-message parallel spawn into team `council-047` ✓ · `consensus-mode` + format tier declared ✓ · Queen composed, did not fabricate — every quotation traces to a `working/session-047/<persona>.md` file or the persona's returned final ✓ · discussion transcript preserved verbatim in `working/session-047/` ✓ · full convergence recorded honestly (no manufactured dissent; the one residual resolved, the alternative recorded as a deferred option) ✓ · produced records stay `proposed` pending WG ratification ✓.
