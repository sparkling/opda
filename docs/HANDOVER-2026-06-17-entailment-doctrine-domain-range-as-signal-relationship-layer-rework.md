# Handover — OPDA modelling, inference & OWL-adherence rework (2026-06-17, for a fresh session via `/ruflo-swarm:swarm`)

> **Scope of this brief — expanded.** It began as a narrow correction (relationship-layer object properties wrongly stripped of `rdfs:domain`/`rdfs:range` in session-047 / ADR-0048). The directing authority then widened it: *"expand the instructions, to include all aspects of modelling and inference, and owl adherence. See the semantic-modelling project for more guidance on how to model."* So this is now the brief for a **full modelling + inference + OWL-adherence pass** over the OPDA ontology, with the **`~/source/hm/semantic-modelling`** project as the prior-art source for "how to model." The original domain/range defect is **Part B** below; it remains the concrete trigger, but it is one item in a larger discipline.
>
> **Prior-art boundary.** `hm/semantic-modelling` is *prior art, not a dependency*. Cite it in this brief and in OPDA records' *§More Information* only. **The doctrine text lifted into OPDA ODR/ADRs must stand alone — strip every `hm`/`semantic-modelling`/`sds`/`pf`/`ONT-` reference from the normative text** (ODR-0027 R5 currently violates this — it says "hm ODR-0014"; fix in-pass).

## Provenance — what THIS session produced (so the next session can trust/extend it)

Run under `/ruflo-swarm:swarm` (`swarm-1781438175004-w28125`, hierarchical/specialized). **Correct swarm-orchestration chain learned the hard way this session:** `swarm_init` (coordinate) → `agent_spawn` (register workers) → `coordination_orchestrate` (record the plan; **does NOT execute** — `executor:none`) → **Claude Code Task tool (executes the registered roles)**. The first three were skipped on the first attempt (freelance Task agents beside an idle swarm); corrected.

- **Phase 1 — research fan-out (4 agents):** (A) OWL-as-documentation doctrine; (B) inference regime + inference/validation boundary; (C) how-to-model patterns + UFO/BFO layering; (D) OPDA coverage + gap map.
- **Phase 2 — adversarial verification (2 registered reviewer roles):** every load-bearing claim re-checked at `file:line`. **It caught two real overstatements** (see *Verification caveats*), so treat the un-verified deeper claims with the same suspicion — re-check at `file:line` before acting. (This is the session-047 lesson repeated: I verified gates but not the rendered artefact and missed a vacuous SHACL shape; *do not trust "green" or an agent's summary*.)

---

## TL;DR — the one doctrine OPDA is missing (gap #15, the root cause)

OPDA has the *mechanism* (frozen closure, SHACL validation, the "model-but-don't-evaluate" rule) but has **never stated the doctrine positively in one place**. It is scattered across ODR-0025 §R2, ODR-0026 §R2, ODR-0027 §R5, ODR-0029 §R1 — which is *why* session-047 was able to re-derive domain/range from standard OWL semantics and reach the wrong answer. **Write the positive doctrine once** (new doctrine ODR, or a strengthened ODR-0026/0029), in these terms:

> **OPDA authors OWL/RDFS axioms as documentary, AI-legible signal of modeller intent. They are NEVER entailed.** The *only* inference is the frozen 7-rule RDFS-Plus load-time closure (ODR-0025 §R1). Everything else — `rdfs:domain`/`rdfs:range`, cardinality, datatype, disjointness, identity, keys, equivalence, unions — is **authored for documentation/AI-signal and VALIDATED via SHACL**, never reasoned. **Corollary (the meta-rule): do not reason about OPDA from standard W3C OWL/RDFS entailment semantics** — OPDA has explicitly opted out of them. "OWL describes the domain; SHACL validates the data; declaring both is not duplication — it is two layers of meaning."

Everything below is the application of that one doctrine across the model.

---

## Part A — Inference regime & the inference/validation boundary  *(OPDA: largely COVERED — tighten + lift two rulings)*

**A1. The frozen safe-rule set is correct and aligned with prior art.** OPDA's 7-rule RDFS-Plus closure (ODR-0025 §R1: subClassOf transitivity + type-propagation, subPropertyOf transitivity + value-propagation, `owl:inverseOf` both directions, `owl:TransitiveProperty`, `owl:SymmetricProperty`) is byte-for-byte the prior art's "Safe Group" (verified: `config/hm-owl-rl-safe.rules:18-43` enables exactly these; `:49-67` comment out `rdfs2`/`rdfs3` domain/range, Functional, InverseFunctional, equivalentClass, equivalentProperty as `# EXCLUDED`). **Action:** none to the rule logic (frozen, ODR-0029 §R2) — but state in the doctrine ODR that the freeze covers *the 7 inference rules*, NOT the authoring of documentary axioms (the closure ignores those anyway; the handover made this point, the ODRs don't).

**A2. The boundary is direction-of-effect: inference *creates* triples, validation *checks* them — never mix; keep them in separate files.** This is the whole boundary in one sentence (prior art: ODR-0036 Normative Rule 2 *"SHACL Rules materialize, constraints validate… Never mix"*). OPDA states it (ODR-0029 §R1) — keep, and make the file-separation explicit (`*.ttl` structure+validation vs any future `*-rules.ttl` materialisation).

**A3. Materialise once at load into a derived graph; prove zero domain/range triples.** OPDA does this (`ADR-0035`, `materializeEntailments()` SPARQL-INSERT fixpoint). The **proof obligation** that "authored-but-not-evaluated" holds is the consistency test at `ADR-0035:55-57` and `:153-156` (the EPC cross-trip guard: no `opda:EPCCertificate rdf:type opda:Property` ever appears). **Action:** after Part B adds documentary domain/range, **re-run this test and confirm the closure still adds ZERO domain/range-derived triples.** This is the single most important regression gate for the whole rework.

**A4. The "enabled-if-present vs advised-against-authoring" nuance — make it explicit.** The closure *enables* `owl:SymmetricProperty` (and Transitive), but the rule body is guarded on `?p rdf:type owl:SymmetricProperty`, so it is **inert unless something is typed that way** — and OPDA currently types nothing Symmetric/Transitive (only one `owl:inverseOf` pair exists). Prior art has the identical situation and *never spells it out*; OPDA should, so the next author understands "the rule is a dormant safe-capability, not a mandate to author the characteristic." (Verified: `hm-owl-rl-safe.rules:37` enables `owl-sym` while ODR-0054 §R6 says "do NOT declare" it.)

**A5. Lift two rulings that currently live only in council records (gap #14).**
- **"Query the asserted model"** (session-039 Q3) — the operating principle for consumers, never lifted into an ODR rule. Lift it: queries default to the asserted graph; use `rdf:type/rdfs:subClassOf*` property paths for hierarchy, `DISTINCT`/`FILTER NOT EXISTS` to suppress closure duplicates from symmetric/inverse/transitive chains.
- **Entailment-aware SPARQL** — adopt the prior art's pattern (partition asserted vs inferred named graphs; every saved query declares `asserted-only` vs `full`; avoid bare property-path alternation over the union graph). Prior art: ODR-0058.

---

## Part B — OWL-as-documentation: domain/range, characteristics, disjointness  *(the trigger defect + its siblings — gaps #2, #3, #4, #9, #15)*

**B1. The concrete defect (gap #2) — confirmed at file:line.** The ~750 datatype properties correctly carry **both** `rdfs:domain` and `rdfs:range` *and* emit the SHACL dual (ODR-0029 §R3 pattern). But the relationship-layer object properties were hand-split in session-047 and are inconsistent (verified):

| Object property | Currently carries | File:line | Fix |
|---|---|---|---|
| `founds` | neither | `opda-agent.ttl:192-196` | author documentary domain+range |
| `mediates` | neither | `opda-agent.ttl:222-226` | author documentary domain+range |
| `playedBy` | neither (disjoint bearer) | `opda-agent.ttl:236-242` | **fork decision** (Part E-1) |
| `plays` | neither (disjoint bearer) | `opda-agent.ttl:244-250` | **fork decision** (Part E-1) |
| `hasAddress` | range only | `opda-property.ttl:704-709` | restore documentary domain (**fork** — disjoint bearer) |
| `hasParticipant` | domain only | `opda-transaction.ttl:191-196` | range is disjoint (Seller∪Buyer) → **fork**; keep domain |
| `concernsProperty` | both ✓ | `opda-transaction.ttl:175-181` | already correct — leave |
| `hasRegisteredTitle` | both ✓ | `opda-agent.ttl:214-220` | already correct — leave |

The **single-class** cases (`founds`, `mediates`, and the already-correct two) are uncontroversial: author plain `rdfs:domain`/`rdfs:range` exactly like the datatype properties. The fork only bites the **genuine disjunctions** (`playedBy`/`plays` bearer = Role∪RoleMixin → Person∪Organisation; `hasParticipant` co-domain = Seller∪Buyer; `hasAddress` bearer = Property∪Person∪Organisation).

**B2. The disjoint-domain/range fork (Part E-1) — the headline modelling decision.** Three forms, all "not evaluated" under OPDA's closure, but with different OWL-adherence postures:

- **(A) repeated `rdfs:domain` triples, read "any-of"** (prior art ODR-0014 *"Multiple rdfs:domain declarations read as 'any of these classes' (informative union)"* `:23,63`; literal repetition `:122-128`). Plus SHACL `sh:or`. **No boolean class constructor.** *Con:* under standard RDFS, multiple `rdfs:domain` is *intersection*, so the "any-of" reading is a documentation convention valid only because OPDA never evaluates it — must be declared in a file/`rdfs:comment` header.
- **(B) `owl:unionOf`** (the old handover's nuance): `rdfs:domain [ owl:unionOf (…) ]` + SHACL `sh:or`. *Pro:* this is the **OWL-correct** union form — an external DL tool reads it right. *Con:* `owl:unionOf` is on the prior art's **excluded** list (`ODR-0030:82-87`, *"Boolean class constructors require reasoning"*); it would be the **first** boolean constructor / anonymous class expression in OPDA (corpus has **zero**), complicating TTL, diagrams, and `ontology-model.json`.
- **(C) omit, SHACL-only** — the current defect; rejected (loses the documentary/AI signal — the entire point).

**Recommendation to council:** lean **(A)** — it is consistent with the doctrine OPDA is replicating, keeps the corpus boolean-constructor-free, and an LLM reads `rdfs:domain opda:Role, opda:RoleMixin` as "either" naturally. **But** because the directing authority's ask explicitly names *"owl adherence,"* note honestly that **(B) is the standards-correct union** and the only form that survives an external reasoner; if external-DL fidelity is weighted above doctrine-consistency, (B) wins. This is a genuine values trade — route it (Part E). Whichever wins, the per-class enforcement stays in SHACL `sh:or` regardless.

**B3. Property characteristics as AI-signal (gap #4 — near-ABSENT in OPDA).** OPDA authors only one `owl:inverseOf` pair and *zero* Functional/InverseFunctional/Symmetric/Transitive. Prior art (ODR-0054) authors them as documentation: **Functional / InverseFunctional** = documentary-only (a full reasoner would infer `owl:sameAs` — rationale lives in `ODR-0030:68-69` + the rules file, *not* ODR-0054); **inverseOf / subPropertyOf** = materialised via SPARQL CONSTRUCT (OPDA already materialises inverseOf in the closure); **Symmetric / Asymmetric / Reflexive / Irreflexive / propertyChainAxiom** = *do not declare* (no documentation value — note prior art's R6 lists **five**, not three). **Action:** decide (Part E-2) whether OPDA should author Functional/InverseFunctional as documentary AI-signal on the properties where single-valuedness / identifying-value is an ontological fact (IDs, codes) — the same "author + SHACL `sh:maxCount`/`dash:uniqueValueForClass`, never delete the SHACL because OWL 'says the same thing'" rule.

**B4. Disjointness as documentary axiom (gap #9 — ABSENT as axioms).** OPDA has zero `owl:disjointWith` but *checks* disjointness via the ADR-0035 negative consistency gate. Prior art authors it **twice**: `owl:disjointWith`/`AllDisjointClasses` (documentary) + SHACL `sh:not`/`sh:xone` (enforcement), under a 3-condition scoping rule (structural signal + context-independent exclusivity + real data-quality stakes), and **never** between anti-rigid roles that share a bearer's identity (ODR-0028b). **Caveat from verification:** prior art *lists* `AllDisjointClasses` as enabled but **no rule actually consumes the list** — only pairwise `disjointWith` fires; don't assume list-expansion. **Action:** decide whether to author documentary disjointness for OPDA's genuinely-disjoint kinds (Part E-2).

**B5. Govern the OWL surface by an explicit permitted/excluded list + a CI meta-shape** (prior art ODR-0030). OPDA's ODR-0025 §R2 already enumerates the excluded set; **promote it to an enforced gate**: a SHACL/SPARQL meta-shape that fails CI if an excluded construct (`owl:Restriction`, `owl:unionOf`/`intersectionOf`/`complementOf` unless the fork chooses (B), cardinality, `owl:oneOf`, `owl:hasKey`) appears where it shouldn't, plus a per-module header note declaring the documentary-only mode.

---

## Part C — How to model: the modelling discipline  *(gaps #5–#12 — mostly PARTIAL)*

For each: the **project-neutral principle to lift**, OPDA's **current status**, and the **action**. (Prior-art citations are for the next session to lift framings; strip them from OPDA's normative text.)

**C1. Classify on orthogonal facets; subtype only for identity.** *(OPDA: COVERED — ODR-0027/S036.)* Reserve `rdfs:subClassOf` for permanent subkinds sharing the parent's identity criterion; everything else is a classification facet (coded `isMemberOf`/SKOS). Confirm alignment with prior art ODR-0010 (orthogonality / stability / decision-driving tests; the "one axis holds a disproportionate share = conflated questions" smell). **Action:** cross-link, no change expected.

**C2. Enumeration values are data, not schema — SKOS, never `owl:oneOf`.** *(OPDA: COVERED — ODR-0011.)* Closed sets: dual-type `skos:Concept` + domain class, validate `sh:in`; open-ended references: validate `sh:class`, don't dual-type; adding a value is a one-triple data edit. Prior art ODR-0016/0023. `currentEnergyRating` (`opda-property.ttl:696-702`) is the **correct** exemplar of this (object property → `rdfs:range skos:Concept` + `sh:in` over the band scheme) — *not* an anomaly. **Action:** confirm the closed-vs-open distinction is stated; align.

**C3. Roles / RoleMixin / Phase vs SubKind — distinguish by relationship to identity.** *(OPDA: PARTIAL — has Role/RoleMixin/Relator meta-classes; the decision procedure isn't doctrine.)* Prior art ODR-0025: three questions — simultaneous multiple categories → **Role** (anti-rigid, shares bearer's identity & key; annotate, never `rdfs:subClassOf`); permanent inherent subcategory → **SubKind** (`rdfs:subClassOf`); lifecycle transition → **Phase**. Model "can-play" (potentiality) separately from "is-playing" (actuality). Directly governs OPDA's `playedBy`/`plays`/Role/RoleMixin. **Action:** state the procedure as doctrine; verify the relationship layer obeys it (it largely does — the `playedBy` comments already invoke the bearer-disjunction reasoning).

**C4. Property distribution + flat SHACL shapes.** *(OPDA: PARTIAL.)* Declare each property on the most specific class that introduces it; a role-specific property belongs on the role, never hoisted to the Kind. Keep SHACL shapes **flat — one shape per class, no inheritance** (SHACL has no `sh:extends`; simulated inheritance is undebuggable); factor a shared shape (`sh:node`) only when a constraint recurs across many classes. Prior art ODR-0026. **Action:** adopt as a stated rule; audit for hoisted properties.

**C5. Upper-ontology layering — one canonical typing axis, kept inert.** *(OPDA: PARTIAL — gap #7; gUFO gated to 5 descriptive Quality leaves per ADR-0034; Roles/Relators typed via meta-classes; most classes untyped.)* Prior art: **one** canonical ontological-type axis per class (ODR-0100; a second axis must be a *derived view*, else rigidity is undecidable and OntoClean gates can't run); stratify fine sortals `skos:broader` up to a small coarse upper-category set kept **inert** (ODR-0101 — import no upper-ontology axioms, reason over nothing, claim no conformance you don't meet; *"an unconsumed axiom is a latent liability, not a free asset"*); layer + stereotype vocabularies are closed SKOS schemes with falsifiable membership tests (ODR-0092). **Action (Part E-3):** decide whether OPDA adopts a single canonical UFO typing axis across the whole ontology, or keeps the current gated/partial typing. Likely homes: OPDA ODR-0030/0031 (foundational-ontology choice) — out of scope this session, flag for a dedicated pass.

**C6. Cross-context identity — criterion, not similarity; ban `owl:sameAs`.** *(OPDA: PARTIAL — gap #8; per-class ICs in prose, `owl:sameAs` prohibited per ODR-0005, bounded-context scheme exists, but no machine-readable IC convention.)* Prior art ODR-0098: sameness is decided by a shared identity criterion (a join key is *evidence*, never identity); ordered gates; the mapping predicate (`skos:exactMatch`/`broadMatch`/`closeMatch`/keep-separate) is read off the link key's logical shape, never a threshold; `owl:sameAs` banned as cross-context identity; every verdict a retractable SSSOM record. **Action:** decide whether to add a machine-readable IC-annotation convention (a possible `opda:identityCriterion`); check against existing ADR-0046 (ontoclean-meta-property-markup, not read this session).

**C7. Datatype fidelity — document the `xsd` type, enforce in SHACL, admit only domain truths.** *(OPDA: PARTIAL — gap #10; `rdfs:range xsd:*` broadly present, but far fewer `sh:datatype` constraints; no stated policy.)* Prior art ODR-0037: `rdfs:range xsd:*` documents; `sh:datatype` + refinements (`sh:pattern`, `sh:minInclusive`…) enforce; admit a constraint only if it states a domain truth (percentage caps, identity regexes) not a storage artefact (varchar widths, decimal precision, DEFAULT-driven not-null); preserve load-bearing string semantics (leading zeros). **Action:** state whether every `rdfs:range xsd:T` should get a paired `sh:datatype xsd:T` (the datatype analogue of ODR-0029 §R3); currently it does not.

**C8. Annotation / description mandates — layered, with `skos:definition` cardinality-1, gated.** *(OPDA: PARTIAL — strong de-facto coverage (label/comment/definition/source) but unmandated, ungated.)* Prior art ODR-0011/0042: separate `rdfs:label` (display) / `rdfs:comment` (short hint) / `skos:definition` (SME-approved meaning) / `skos:scopeNote`+`editorialNote` (guidance) / SHACL `sh:*` (UI); `skos:definition` mandatory on every class **and property**, CI-gated warning-first then violation; *"comment = what it is; definition = what it means"*; never derive display labels from URIs. Drives RAG/AI grounding and prevents definition→classification drift. **Action:** decide whether to mandate + gate (a `ci-description-coverage` gate).

**C9. Naming, ontology-identity, term-binding.** *(OPDA: PARTIAL — gap #12; conventions followed, not documented.)* Prior art: display labels are noun phrases — strip `has`/`is`/`get` to the local name only (ODR-0049); an ontology's identity is its **IRI, never its file path** — file layout is free and IRI-preserving (ODR-0097); bind every declared term to its ontology with `rdfs:isDefinedBy`, enforced by one meta-shape, warning-first (ODR-0091). **Action:** consolidate OPDA's naming/identity conventions into one record (or the doctrine ODR); decide on a `rdfs:isDefinedBy` binding gate.

---

## Part D — The concrete rework (implementation tasks for the next session)

1. **Author documentary domain/range on the relationship-layer object properties** (Part B-1 table) — plain `rdfs:domain`/`rdfs:range` for single-class cases; the **fork decision** form for the disjunctions; **keep all existing SHACL `sh:or`/`sh:class` constraints** (ODR-0029 §R3). Reverse the now-incorrect `playedBy`/`plays`/`hasAddress` "would entail / anti-pattern" comments.
2. **`hasAddress`:** restore documentary domain (disjoint bearer → fork form); keep `rdfs:range opda:Address`; **reconcile with the `profiles.py` D4 silent-loss fix across 31 forms** (`ADR-0048:82`) — reverting the domain drop interacts with that fix; don't just revert.
3. **`ontology-model.mjs` SHACL-derivation block** (`scripts/ontology-model.mjs:207-248`): once documentary domain/range exist, the model derivation sees the edges natively → **decide keep-as-belt-and-braces vs revert** (don't leave it as the silent primary path undecided). Update its comment either way.
4. **Reconcile the `ci-object-property-coverage` gate** (`tools/opda-gen/src/opda_gen/ci/object_property_coverage_test.py`; rule at `ADR-0048:61`): relax "type-pinned in OWL **OR** SHACL" → "documentary domain/range authored **AND** SHACL constraint present," since the entailment fear is void.
5. **Records to amend:** session-047 §Q5 (amendment recording the corrected premise); ODR-0032 §R1/§R2/§Decision-detail (`:71` "MUST NOT be authored" is the line that contradicts ODR-0026 §R2); ADR-0048 §1/§As-built; ODR-0025/0026/**0027 (R5 — fix the `hm` ref)**/0029; ODR-0008 §Q6a (reasoner-independence test — re-read against the now-defined closure, `ODR-0025:45`).
6. **Create:** (a) the **positive doctrine record** (new doctrine ODR *or* strengthened ODR-0026/0029 — TL;DR text above) covering the *whole* R2 set, not just domain/range; (b) the **fix-ADR** for the implementation (emit, re-pin byte-identity, regenerate `ontology-model.json` + `ontology-graph-elements.json`).
7. **Proof obligations:** `make verify-ontology` byte-identity; **the ADR-0035 zero-domain/range-triple consistency test** (A3); regenerate the model JSONs via `build:data`; full `make ci`.
8. **Audit for other false-premise deferrals** (`ODR-0032:42` "any other property deferred domain/range to SHACL-only"): check the orphan predicates `opda:concerns`, `opda:partOfTransaction`, `opda:baselineCategory` (`ADR-0048:83,86`).

---

## Part E — Decisions to route (council-grade — do NOT decide silently)

Convene via `/council` (read `docs/ontology/odr/council/adoption.md` + the latest session FIRST; web-verify any external citation yourself — persona panels mis-call post-cutoff refs).

1. **Disjoint-domain/range form: (A) repeated `rdfs:domain` "any-of" + `sh:or`  vs  (B) `owl:unionOf` + `sh:or`.** (Part B-2.) The single most consequential modelling call; "owl adherence" pulls toward (B), doctrine-consistency + boolean-constructor-free pulls toward (A). Recommend (A) tentatively; let the panel weigh external-DL fidelity.
2. **Author the rest of the R2 set as documentary signal?** i.e. Functional/InverseFunctional characteristics (B-3) and `owl:disjointWith` (B-4) — yes/no, and the scoping rule. (They're R2-excluded → model-but-don't-evaluate-eligible, but authoring them is a commitment to maintain.)
3. **Single canonical UFO typing axis** across OPDA (C5) — adopt, or keep the current gated/partial gUFO typing? (Likely a separate dedicated pass — flag, don't force.)
4. **Mandate + gate** `skos:definition` coverage (C8) and `rdfs:isDefinedBy` term-binding (C9)? (Warning-first migration pattern.)

---

## Verification caveats (corrections the Phase-2 adversarial pass caught — do not re-introduce)

- **`currentEnergyRating` is NOT rangeless** — it carries `rdfs:domain opda:Property ; rdfs:range skos:Concept` + `sh:in` (`opda-property.ttl:696-702`). It's the *correct* enum pattern, not an anomaly. (Earlier research said "rangeless ObjectProperty" — wrong.)
- **`hasParticipant` is domain-only** (range deliberately in SHACL `sh:or`), not domain+range; `concernsProperty` and `hasRegisteredTitle` carry both. (Per-property carrier status in the Part B-1 table is the verified truth.)
- **`owl:inverseOf` is two rules** (`owl-inv`/`owl-inv2`), not one bidirectional rule.
- **`owl:AllDisjointClasses` is *listed* enabled but no rule consumes the list** — only pairwise `owl:disjointWith` fires. Don't assume list-expansion.
- **Symmetric "enabled-if-present vs advised-against-authoring"** is real and unstated in prior art — state it in OPDA's doctrine (A4).
- **The "would infer `owl:sameAs`" rationale** for Functional/IFP is in `ODR-0030`/the rules file, not ODR-0054.
- **SHACL domain/range duals concentrate in the consolidated `opda-shapes.ttl`** (248 `sh:targetSubjectsOf` / 63 `sh:targetObjectsOf`), not evenly across `*-shapes.ttl` — don't expect per-module uniformity.

---

## Relevant records

**OPDA — read first (entailment doctrine homes):** `docs/ontology/odr/ODR-0025` (R1 safe group, R2 excluded set, R7 EPC case), `ODR-0026` (R2 model-but-don't-evaluate), `ODR-0027` (R5 — 4th scattered domain/range statement; **has the `hm` ref to strip**), `ODR-0029` (R1 boundary, R3 domain→SHACL pattern, R2 freeze, R5 honest naming); `docs/adr/ADR-0035` (closure + zero-triple test), `ADR-0036` (Jena SHACL 1.2), `ADR-0034` (gUFO typing); council `session-039` (entailment adjudication).

**OPDA — to revisit/fix:** council `session-047` §Q5; `ODR-0032` (§R1 `:71`, §R2, §Decision-detail); `ADR-0048` (§1, §As-built, gate rule `:61`). Corpus: `source/03-standards/ontology/{opda-agent,opda-transaction,opda-property,opda-descriptive}.ttl` + `*-shapes.ttl`. Generator: `tools/opda-gen/src/opda_gen/emitters/modules/{agent,transaction,property}.py`, `emitters/shapes.py`, `emitters/profiles.py` (D4), `ci/object_property_coverage_test.py`; `scripts/ontology-model.mjs:207-248`.

**Prior art (lift framings, then strip refs) — verified citations:** `ODR-0014` domain-range-as-documentation (`:23,63,122-128`); `ODR-0030` owl-as-documentation + excluded list (`:60-88`); `ODR-0036` SHACL-rules-&-OWL-inferencing (boundary rules); `ODR-0054` property-characteristics-for-AI (`:89-113`); `ODR-0011`/`0042` annotation mandates; `ODR-0010` classification facets; `ODR-0016`/`0023` SKOS enumerations; `ODR-0025` role/phase; `ODR-0026` property distribution + flat shapes; `ODR-0028b` disjointness; `ODR-0037` datatype fidelity; `ODR-0049` naming; `ODR-0091` term-binding; `ODR-0092` layer/stereotype schemes; `ODR-0097` IRI-not-files; `ODR-0098` cross-context identity; `ODR-0100` single typing axis; `ODR-0101` BFO inert; `config/hm-owl-rl-safe.rules` (the verbatim safe ruleset); council sessions 103–105 (closure architecture). All under `~/source/hm/semantic-modelling/docs/ontology/...` — **main tree only, never `.claude/worktrees/`**.

---

## Operational reminders

- After any corpus change: `npm run build:data` (JDK 17+) regenerates `src/data/ontology-model.json` + `public/data/ontology-graph-elements.json`; **commit both** (deploy model-drift gate, `deploy-aws.yml`).
- Run CI with the venv on PATH: `PATH="$PWD/tools/opda-gen/.venv/bin:$PATH" make ci`. `make ci` still misses the AWS deploy's triplestore model-drift gate — regen the model JSON via `build:data` after any corpus change.
- **The ADR-0035 zero-domain/range-triple consistency test is the proof obligation** for "authored-but-not-evaluated" — run it after adding documentary domain/range.
- Nothing is pushed; **push to `main` triggers the AWS deploy.** Commit straight to `main` (no feature branches), keep each commit green.
- `make verify-ontology` = byte-identity re-emit/diff; `make ci-ontology` = all opda-gen gates.

## Memory to write (cross-session)

1. **OPDA modelling doctrine (expanded):** OWL/RDFS axioms (`rdfs:domain`/`range`, characteristics, `disjointWith`, unions) are authored as documentary AI-signal and **NEVER entailed**; the only inference is the frozen 7-rule RDFS-Plus closure (ODR-0025 §R1); everything else is validated via SHACL (ODR-0029 §R1/§R3). Never reason about OPDA from standard W3C OWL/RDFS semantics. Links `[[opda-entailment-domain-range-as-signal]]`, `[[opda-ci-gate-topology]]`, `[[opda-greenfield-no-wg-gate]]`.
2. **`/ruflo-swarm:swarm` orchestration mechanics:** the real chain is `swarm_init` → `agent_spawn` (registers) → `coordination_orchestrate` (records only — `executor:none`, does NOT run agents) → **Task tool executes the registered roles**. Spawning Task agents without `agent_spawn`/orchestrate = freelance, not swarm-orchestrated. Link `[[council-run-via-swarm-and-agent-teams]]`.
