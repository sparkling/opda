# Council Session 022 — Form↔SHACL Association, Metadata on SHACL Definitions, and Over-Engineering Check (against Convention)

- **Date:** 2026-05-30
- **Records under review:** [ODR-0010](../ODR-0010-overlay-profile-mechanism.md), [ODR-0019](../ODR-0019-bounded-context-representation.md), [ODR-0020](../ODR-0020-bounded-context-scheme-and-mapping.md); [ADR-0026](../../../adr/ADR-0026-bounded-context-scheme-emission.md), [ADR-0028](../../../adr/ADR-0028-descriptive-layer-walk-and-home-pass-emission.md), [ADR-0029](../../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md); and the [Session 021](./session-021-bounded-context-implementation-plan.md) verdict (partly superseded — see Disposition).
- **Queen:** Tom Baker (Dublin Core Application Profiles / Singapore Framework / DCMI vocabulary governance)
- **Devil's Advocate:** Ian Davis (BBC `/programmes/` · UK-Gov / data.gov.uk · publish-first — anti-over-engineering, "name the standard or delete it")
- **Panel:** Holger Knublauch (W3C SHACL spec + SHACL-AF + DASH + TopBraid EDG) · Fabien Gandon (W3C PROF / DCAT / conneg-by-profile) · Elisa Kendall (FIBO / OMG modular methodology) · Dean Allemang (*Working Ontologist*; derive-don't-declare)
- **Input Documents:** ODR-0008/0010/0011/0017/0019/0020; ADR-0007/0026/0028/0029; `tools/opda-gen/src/opda_gen/emitters/profiles.py`; `source/03-standards/ontology/profiles/baspi5.ttl`; the published conventions cited inline.
- **Working files:** `working/session-022/{baker,knublauch,gandon,kendall,allemang,davis-da}.md`
- **`consensus-mode`:** `agent-fan-out` (swarm bookkeeping + Agent fan-out; cross-talk via **SendMessage / Agent Teams** team `council-022`; one opening + one rebuttal pass)
- **Format tier:** Full Council

---

## Context

The convening architect challenged the prior session (S021): it **reasoned from first principles and may have invented a bespoke design where established linked-data conventions already exist.** The charge — every position must answer **from published convention** (a W3C Rec/Note, a DCMI spec, an OMG/FIBO doc, or a documented deployment); "reasoning it out" without a named convention does not count.

The larger questions: **(1)** what is the convention for associating a *form* with its SHACL definition and the base ontology; **(2)** what metadata legitimately attaches to a SHACL definition; **(3)** is OPDA's bounded-context apparatus (`opda:BoundedContextScheme` + `opda:servesContext` + `opda:definedInContext`) **over-engineering** versus the idiomatic standard?

The triggering observation: a SHACL profile is **first-class authored RDF**, not a lesser "form layer" — so "which context a form is" and "which terms it uses" may already live in the profile, and "which community owns a term" may already be standard provenance/vocabulary-of-origin. If so, the bespoke scheme + two custom predicates reinvent the wheel.

Four questions were put. Votes tally `N-M-K` by voice (6 voices: Queen Baker + 5 panel, DA included). DA scorecard and held dissents in the appendix.

---

## Question 1 — Form↔base association: the convention

**Unanimous: a PDTF form IS an application profile — definitionally — and the idiomatic stack is DCTAP → SHACL → PROF → DCAT. OPDA is ~95% there; the over-engineering is the *wrapper predicates*, not the shapes.**

Baker (Queen) mapped the overlay onto the **DCMI Singapore Framework** (Nilsson, Baker, Johnston 2008) component-for-component and found an exact fit: *"The overlay is a complete, well-formed DCAP… ODR-0010's 'overlays constrain, they do not declare' is verbatim the Singapore Framework's DSP definition."* He noted this is **already OPDA law** — ODR-0002 §Profile-pinning cites the Singapore Framework as ratified precedent (Session 002 Q5, 9–0). Knublauch confirmed from the code: *"`baspi5.ttl` is textbook SHACL Core + DASH… the over-engineering is NOT in the shapes — it's in the `opda:ValidationContext` wrapper and the membership predicates. The architect is substantially right."* His layer boundary, quoted for the record: **"SHACL owns the constraints; PROF owns the description-of-the-profile-as-an-artefact."**

Gandon named the **W3C Profiles Vocabulary (PROF, 2019)** as the machine-readable association: a form is a `prof:Profile` (which *is-a* `dct:Standard` — *"the architect's 'a profile is first-class RDF' is a PROF axiom"*), `prof:isProfileOf` the base, bundling SHACL/DASH/vocabulary as `prof:hasResource`/`prof:ResourceDescriptor` with registry roles. He then closed the stack with **DCTAP** (DC Tabular Application Profiles, DCMI 2022): *"the data-dictionary per-overlay leaf table S021 named as the single source of truth IS a DCTAP in all but name, and `profiles.py` generating `sh:minCount`/`sh:in` IS a TAP→SHACL step"* — so S021's own "dictionary is the source" instinct **has a standard name**, and ADR-0029's `ProfileSpec` refactor is "adopt a DCTAP-shaped spec + run TAP→SHACL."

Two findings sharpened the association predicate:
- **`opda:overlaysContext` is mis-targeted** (`profiles.py:250` → a profile-*layer* IRI). Convention says a profile points at the **base it profiles** — `prof:isProfileOf <opda-foundation>`. Baker's load-bearing correction: S020/ADR-0026's plan to re-point `overlaysContext` at an *industry-context concept* is **convention-wrong for this predicate** — a DCAP is a profile *of a base vocabulary*, **not** "of a community." The community link, if stored at all, is a *separate* predicate (`dct:audience`/`dct:publisher` → the community concept). The `profiles.py:250` bug is **mooted** by the split.
- **`opda:requires` is redundant** (Knublauch, Gandon): a SHACL processor already enumerates required terms from the `sh:path` of every `sh:minCount ≥ 1` shape — `requires` re-states the DSP as a second source of truth. Drop it.

**Vote Q1: 6–0** — a form is a DCAP/profile; adopt **PROF** (`prof:isProfileOf`) for the profile→base association; the SHACL shapes ARE the DSP (idiomatic, keep verbatim); the typed `prof:Profile` node wraps (description only) — *"PROF wraps, doesn't absorb"* (Gandon/Knublauch); `opda:requires` dropped as shapes-redundant. PROF-adoption depth is **gated on a baspi5 PROF-fit spike** (Davis's condition; see scorecard) — Guarino's S010 `ValidationContext` reification *is* `prof:Profile` rediscovered, but the spike proves lossless re-expression before rip-out.

---

## Question 2 — Metadata on a SHACL definition

**Unanimous: reuse standard vocabulary; OPDA is already substantially aligned; the one rule is — a shape carries *constraint + profile* metadata, never *domain-model* metadata.**

Baker enumerated the convention-prescribed set (DCMI Terms + PROF + SHACL): identification (`dct:title`/`rdfs:label`/`skos:definition`), the base it profiles (`prof:isProfileOf`), artefact roles (`prof:hasResource`/`prof:hasRole`), provenance (`dct:source` + `prov:wasAttributedTo` — **already carried per term**, verified `profiles.py`), applicability (`dct:audience`), version (`owl:versionInfo`/`prof:hasToken`), and the constraints themselves (`sh:minCount`/`sh:in`/`sh:xone` = the DSP). Knublauch drew the exclusion sharply: a shape **never** carries the term's *meaning* (→ `rdfs:comment`/`skos:definition` on the term), its *provenance* (→ `dct:source`/`rdfs:isDefinedBy` on the term), or its *conceptual classification* (→ `dct:subject` on the term) — *"shapes describe what things LOOK LIKE, not what they ARE; the taxonomy layer owns classification, shapes validate against it via targeting and NEVER reverse-engineer the partition from validation requirements"* (TopBraid EDG). That last point is decisive for Q3/Q4: deriving classification *out of* validation requirements is the EDG-convention inversion.

**Vote Q2: 6–0** — adopt the DCAP/PROF/DCMI/PROV/SHACL-DASH metadata set; add profile *identification* + `prof:isProfileOf`; keep per-shape `dct:source`; **never** load conceptual ownership / term definitions / identity criteria onto a shape (that is Domain-Model metadata).

---

## Question 3 — "Which context a term belongs to": is `definedInContext` reinventing provenance?

**Split by sub-question. Headline: the SKOS scheme stays, `servesContext`-as-rule stays, and `opda:definedInContext` is RETIRED — it reinvents three published Recs.**

**Q3a — the SKOS scheme: KEEP (6–0).** Baker: *"a `skos:ConceptScheme` of communities-of-practice is idiomatic SKOS… not bespoke; it is the W3C-standard way to do controlled vocabularies"* (SKOS Reference §3). The architect's "bespoke scheme" worry is unfounded *for the scheme*; it mirrors OPDA's 23 value-schemes. Davis **conceded** it: the six context IRIs are the mandatory *targets* a home/community predicate points at, and carry non-derivable steward content.

**Q3b — `servesContext` (which contexts USE a term): KEEP AS A DERIVED RULE, never stored (6–0).** The architect is right that "used-by" is a 2-hop query over the DSPs; materialising it onto the term duplicates the DSP into the domain model — the *"one fact, one home"* violation DCMI forbids (Baker, Bechhofer, Isaac, Miles, *Key choices in the design of SKOS*, 2013) and which S021 already ruled derived. **S021's "servesContext = rule-only, dormant" verdict survives the convention test.** Knublauch + Gandon added: with `requires` dropped and `overlaysContext`→`prof:isProfileOf`, the rule is rebuilt on standard footing (or dispensed with — no named consumer). DA precision guard (recorded): `servesContext` is **not** "subsumed by PROF's chain axiom" (that infers *payload*-conforms-to-base, not term→context); it is unnecessary because the useful conformance half is free and the term→context rest has no consumer.

**Q3c — `opda:definedInContext` (a term's "home"): RETIRE (6–0) — it reinvents provenance/vocabulary-of-origin.** This is the architect's core charge, **upheld three independent ways**:
- **Gandon** — it shadows Rec-grade vocabulary.
- **Kendall (FIBO)** — *"FIBO mints NO context-membership predicate and runs NO business-domain SKOS scheme — it records module-of-definition via the defining ontology + `rdfs:isDefinedBy`"*; the standard sits emitted on **zero** OPDA terms while a bespoke synonym was minted. She **explicitly retracted her S021 chairing**: *"I was wrong to ratify a bespoke home predicate; convention already named it."*
- **Allemang** — the design's own principle: ADR-0028 *generates* `definedInContext` from `dct:source`, making it *"a derived view wearing an authored-fact costume — exactly what the design correctly refuses for `servesContext`."* No standards appeal needed; it's an internal contradiction.

Davis hardened the basis: `definedInContext` bundles **three published Recs**, so its deletion is **unconditional and PROF-independent**:

| Axis bundled into `definedInContext` | Standard predicate | Target | Verified state |
|---|---|---|---|
| module-of-definition (ontological *concern*) | **`rdfs:isDefinedBy`** (RDFS §2.6) | the owning module `owl:Ontology` IRI | emitted on **0** terms today — a real, mechanical gap |
| provenance / source / authority | **`dct:source`** (+ `prov:wasAttributedTo`) | form-question / authority IRI | **already present** per shape |
| community-ownership (DDD home) | **`dct:subject`** (DCMI aboutness) → the community `skos:Concept` | a bounded-context concept | already named by ODR-0019 Rule 3; the predicate `definedInContext` shadowed |

**The home-arrow ruling (Queen Baker, resolving the fork Knublauch/Gandon flagged):** `rdfs:isDefinedBy → a skos:Concept` is a **category mismatch** — `rdfs:isDefinedBy`'s object is "the resource *defining* the subject" (the module ontology that mints/axiomatizes the term), **not** a community/aboutness node. So the three axes use three *different* standard predicates: **`rdfs:isDefinedBy` → the module** (concern); **`dct:source` → the authority** (provenance, present); **`dct:subject` → the community concept** (ownership) — and the last is **gated** (ODR-0019 Rule 8) to the non-derivable residue (genuine homonym / disputed ownership), which is **empty today**. Allemang's verified finding tightens this: OPDA's seven TTL modules partition by *concern* (property/agent/claim/…), **not** by the six industry contexts, so `rdfs:isDefinedBy → module` records concern (correctly) and community-home, where ever wanted, is `dct:subject` — but is itself largely derivable from `servesContext` degree, so **stored community-home is YAGNI today**.

**Vote Q3: scheme 6–0 keep; `servesContext` 6–0 keep-as-rule; `definedInContext` 6–0 retire** (decompose into `rdfs:isDefinedBy` + `dct:source` + gated `dct:subject`). `opda:consumesFrom` survives as the one justified local mint (DDD Conformist relationship — no clean W3C term; anchor `rdfs:subPropertyOf prov:wasInfluencedBy`).

---

## Question 4 — Over-engineering verdict + minimal idiomatic design

**Unanimous: YES — over-engineered in exactly one place (the always-emitted `definedInContext` home-pass) plus the bespoke profile-wrapper predicates. The fix shrinks the design. The SKOS scheme, `servesContext`-as-rule, `consumesFrom`, the DCAP framing, the 935-leaf walk, and the 14-profile rollout are all idiomatic and stay.**

Baker named it precisely: S021 reasoned soundly from DDD/UFO first principles that home ≠ usage, therefore minted an authored home predicate — *"but convention then says the home is already recorded by namespace + owning module + `rdfs:isDefinedBy` and `dct:source`/`prov:` provenance. A predicate that duplicates information `dct:source` already carries, is generated not observed, and serves an empty residue, is textbook YAGNI over-engineering."* The architect's instinct is correct; the architect was *over-broad* in suspecting the scheme + `servesContext` + the DCAP framing — those are idiomatic.

**The minimal idiomatic design (convention-grounded):**

| Concern | Idiomatic answer | Convention |
|---|---|---|
| Form = ? | a **DCAP**; the SHACL shapes are its **DSP** | Singapore Framework |
| Form → base | **`prof:isProfileOf` <base>** (fix `overlaysContext` off the layer IRI) | PROF |
| Form → terms used | the DSP `sh:path` statements — **drop redundant `opda:requires`** | Singapore DSP / SHACL |
| Constraint table → shapes | a **DCTAP**-shaped spec (the `ProfileSpec`) → **TAP→SHACL** | DCTAP (DCMI 2022) |
| Which contexts USE a term | **derived dormant rule** — never stored | one-fact-one-home; ODR-0020 Rule 5 |
| Term home — concern | **`rdfs:isDefinedBy` → owning module** (emit mechanically; 0× today) | RDFS §2.6; FIBO |
| Term source/authority | **`dct:source`** (present) + `prov:wasAttributedTo` | DCMI; PROV-O |
| Term home — community | **`dct:subject` → community concept**, **gated** to non-derivable residue (empty) | DCMI aboutness; ODR-0019 Rule 8 |
| Upstream conformist source | **`opda:consumesFrom` → `opda:Organisation`** | DDD Conformist (justified mint) |
| Community vocabulary | a **`skos:ConceptScheme`** of 6 communities | SKOS Reference |
| Profile delivery (future) | `prof:hasToken` + **conneg-by-profile** (`Accept-Profile`) | W3C conneg Note |

**Net: DELETE `opda:definedInContext` + `opda:requires` + the bespoke profile-wrapper predicates; ADOPT `rdfs:isDefinedBy` + `prof:isProfileOf` (+ DCTAP/PROF framing); KEEP the SKOS scheme, derived `servesContext`, `consumesFrom`, per-shape `dct:source`, the F1 firewall, the 935-leaf walk, and the 14-DCAP rollout; DROP the S021 cross-check shape + total-cover-CI scaffolding + F2/F3 (they policed a derived view that shouldn't be stored).**

**Vote Q4: 6–0** that the design is partially over-engineered and the minimal design above is the convention-grounded target.

---

## Synthesis (Queen Baker)

The architect was **right on the substance and over-broad on the scope.** Tested against published convention, OPDA's form-modelling is ~95% idiomatic: a PDTF form **is** a Dublin Core Application Profile (Singapore Framework), its SHACL shapes **are** the Description Set Profile, its constraint table **is** a DCTAP, and the profile→base link is W3C PROF's `prof:isProfileOf`. The genuine over-engineering is narrow and twofold: **(1)** the bespoke profile-*wrapper* predicates (`opda:overlaysContext` mis-targeted at a layer, `opda:requires` redundant with the shapes, `ValidationContext` a local re-spelling of `prof:Profile`) — replaceable by PROF behind a baspi5 fit-spike; and **(2)** `opda:definedInContext` — which bundles three published Recs (`rdfs:isDefinedBy` + `dct:source` + `dct:subject`) into one coined predicate, is generated from `dct:source` (so carries no new information), and serves an empty residue. It is retired three ways: it shadows a Rec (Gandon), FIBO mints no such thing (Kendall), and it violates the design's own derive-don't-declare (Allemang).

Crucially, this **partly reverses Session 021.** S021's central synthesis — "author a home (`definedInContext`) for every term, generated-from-provenance, un-gate ODR-0019 Rule 8" — does **not** survive the convention test, and the S021 Queen (Kendall) retracted it here. What survives from S021: `servesContext` derived, the scheme authored, `consumesFrom` for upstream, the firewall principle, the walk is mechanical, profiles need a generic composer — all already convention-aligned. The bounded-context work **shrinks**: fewer predicates, a standard import (PROF/DCTAP), one long-unused RDFS predicate (`rdfs:isDefinedBy`) finally wired up.

**Answer to the architect's three questions, plainly:** (1) form↔base association = `prof:isProfileOf` over the base, the SHACL shapes as DSP, the dictionary as DCTAP — all standard. (2) Metadata on a SHACL definition = identification + `prof:isProfileOf` + roles + `dct:source` provenance + `dct:audience` + version + the constraints; **never** conceptual ownership. (3) Were we over-engineering? **Yes — `definedInContext` and the wrapper predicates. Not the scheme, not `servesContext`-as-rule, not `consumesFrom`.**

**Real-world governance handoff:** this verdict is a *proposal* superseding parts of S021; the record amendments and the PROF adoption (spike-gated) require OPDA WG / Modelling Sub-Committee ratification. Records stay `proposed`.

---

## Tally appendix (two-artefact discipline)

### Per-voice vote table

| Voice | Q1 form↔base | Q2 metadata | Q3a scheme | Q3b servesContext | Q3c definedInContext | Q4 over-eng. |
|---|---|---|---|---|---|---|
| Baker (Queen) | FOR DCAP+PROF | FOR std set | KEEP | KEEP (rule) | RETIRE → 3 std preds | YES (1 place) |
| Knublauch | FOR PROF; shapes verbatim; drop `requires` | FOR; no classification on shapes | KEEP | KEEP (dormant rule) | RETIRE → `dct:subject`/`isDefinedBy` | YES (wrapper+membership) |
| Gandon | FOR PROF + DCTAP | FOR PROF/DCAT/DCMI | KEEP | KEEP (rule) | RETIRE → 3 Recs | YES (predicates) |
| Kendall | FOR (PROF + targeting) | FOR `sm:`/`dct:` | KEEP | KEEP (dormant) | RETIRE → `rdfs:isDefinedBy` | PARTIAL |
| Allemang | FOR (keep VC per Guarino; PROF) | FOR std-only | KEEP | KEEP (rule) | RETIRE → derived/`isDefinedBy` | PARTIAL |
| Davis (DA) | FOR PROF (spike-gated) | FOR PROF (spike-gated) | CONCEDE KEEP | CUT → narrowed HOLD | RETIRE (3 Recs, uncond.) | YES |

### Per-question count (6 voices)

| Question | Tally `FOR–AGAINST–ABSTAIN` | Verdict |
|---|---|---|
| Q1 form↔base | **6–0–0** | Form is a DCAP; PROF `prof:isProfileOf` for the association; SHACL shapes = DSP; drop `requires`; PROF depth spike-gated |
| Q2 metadata | **6–0–0** | Standard DCAP/PROF/DCMI/PROV set; never put ownership/definitions on a shape |
| Q3a scheme | **6–0–0** | Keep the SKOS 6-context scheme (idiomatic) |
| Q3b servesContext | **6–0–0** | Keep as derived dormant rule, never stored (Davis narrowed) |
| Q3c definedInContext | **6–0–0** | **Retire** — reinvents `rdfs:isDefinedBy` + `dct:source` + `dct:subject` |
| Q4 over-engineering | **6–0–0** | Partial over-engineering; minimal design shrinks the bespoke surface |

### DA scorecard (Ian Davis) — withdraw / hold per contested question

| Q | DA verdict | Named condition |
|---|---|---|
| Q1 | **HOLD** | Withdraw when a **baspi5 PROF-fit spike** proves lossless re-expression (`formVersion`→`dct:hasVersion`, `sourcedFrom`→`prov:wasAttributedTo`). The honest caveat named: PROF is a 2019 WG **Note**, not a Rec — but it rides DCAT+DCMI (Recs), and the alternative is bespoke (strictly worse). |
| Q2 | **HOLD** | Same spike (PROF `ResourceDescriptor` + roles). |
| Q3c | **WITHDRAWN** | Met unconditionally: `definedInContext` deleted on **three Recs**, PROF-independent. His Q3 win. |
| Q3a (scheme) | **WITHDRAWN (conceded)** | Scheme survives as the mandatory home-target catalogue (re-arm condition: if anyone adds `skos:broader`/tiers or `skos:inScheme` on domain terms, his S020 YAGNI dissent re-arms). |
| Q3b (`servesContext`) | **RECONCILED** (withdrew the cut) | Davis withdrew "cut the rule" → **dormant SHACL-AF rule, never materialised, doesn't run until a named consumer** (Allemang's rule + Knublauch's never-store + Davis's Rule-8 gate, all satisfied at once). The S021 cross-check shape + total-cover-CI + F3 are **deleted** regardless. |
| Q4 | **FOR**; one held-as-live | `servesContext` reconciled (above). **Bundling-everything-one-go held-as-live** (carried from S021, governance-overruled, not withdrawn). |

### Held-as-live dissents (verbatim, per ODR-0001 §Roles)

> **Davis (DA) — `servesContext`: RECONCILED (no longer a held dissent).** In the rebuttal pass Davis withdrew "cut the rule," and the three positions converged: the rule **exists** (Allemang), is **never materialised** into stored triples (Knublauch — a stored view of a rule drifts), and **does not run until a named term-grain consumer** (Davis / ODR-0019 Rule 8). The S021 cross-check `sh:Warning` shape + total-cover-CI + F3 are deleted regardless. The only residue is the standing Rule-8 gate (re-open if a named term→context-usage consumer appears) — which is ordinary YAGNI hygiene, not a live dissent.
>
> **Davis (DA) — one-go bundling, held-as-live (the one genuine live dissent):** carried from S021 (governance-overruled, not withdrawn). Re-open trigger unchanged.

### Notable methodology event

The **S021 Queen (Kendall) retracted her own S021 chairing** of the bespoke home predicate under convention: *"S021's 'author a home for every term via a NEW predicate, generated-from-provenance, un-gated' does NOT survive FIBO convention. I retract the new-predicate + un-gating half… I was wrong to ratify a bespoke home predicate; convention already named it `rdfs:isDefinedBy`."* Recorded per ODR-0001 (the methodology's self-correction working as designed).

---

## Post-deliberation refinements (final rebuttal pass)

The one-rebuttal-pass cross-talk sharpened the verdict on six points; where these differ from the per-question text above, **these govern**:

1. **Q3 home is a THREE-AXIS split, and "module ≠ context" is load-bearing.** OPDA's seven TTL modules partition by **ontological concern** (foundation/agent/claim/transaction/governance/descriptive/property), **not** by the six industry contexts (Allemang, verified; Kendall confirmed against ODR-0020 §Context). So:
   - **concern** → `rdfs:isDefinedBy` → the owning **module** `owl:Ontology` IRI (always emitted; reconstructs the per-module-IRI home OPDA surrendered at ODR-0004; **0× today**). This answers "which file declares it," *not* "which community owns it."
   - **community-ownership** → `dct:subject` → the SKOS **context** concept. The *only* community predicate; `rdfs:isDefinedBy` cannot serve it (category mismatch — its object is a defining document, not a community).
   - **provenance/authority** → `dct:source` (already on every term; verified to point at ODR sections + legislation/EUR-Lex/OIDC, **never** a context — so the three referents provably never collide).
2. **Community-ownership is AUTHORED-OR-ABSENT, NEVER DERIVED (Kendall, load-bearing).** Reading home off `dct:source` (the S021 default) *or* off `servesContext` **degree** (Allemang's interim proposal) both re-commit the OntoClean level-confusion S021 existed to kill — "home is the thing that does *not* move when a form moves." `dct:subject` is emitted only where a steward (or an unambiguous single-source signal) rules; **absent** for the long descriptive tail (absence = shared-kernel/unruled). Never tie-break a "primary context."
3. **`servesContext` is RECONCILED, not cut (Davis withdrew "cut the rule").** The three voices reconcile to **a dormant SHACL-AF rule that is never materialised**: the rule exists (Allemang) + is never stored as triples (Knublauch — a materialised view of a rule drifts) + does not run until a named term-grain consumer (Davis / ODR-0019 Rule 8). The S021 **cross-check `sh:Warning` shape + total-cover-CI + F3** are still **deleted** (they policed the now-deleted authored home). F1 firewall survives (inverted rationale: a domain term is never `skos:inScheme` the scheme — it points *in* via `dct:subject`).
4. **`ValidationContext` is RE-TYPED, not deleted (Gandon reframe + Kendall bridge).** Guarino's S010 truth-maker (a `sh:minCount 1` is "required *relative to* this named context") needs a *named dereferenceable node* — `prof:Profile` *is* that node. So `opda:ValidationContext rdfs:subClassOf prof:Profile` (or `⊑ dct:Standard` if the WG vetoes the 2019 Note status): local type + standard supertype, symmetric with the `rdfs:subPropertyOf` move for `consumesFrom`. Description only; constraints stay 100% in the SHACL shapes.
5. **PROF for the profile layer is the BIGGER change — first-order, not a footnote (Kendall).** Two changes of unequal size: (a) the Q3 home-predicate swap (one predicate out, standards in) — fully converged; (b) **adopting W3C PROF as the canonical form↔base + profile-metadata convention** — `overlaysContext` → `prof:isProfileOf` (→ base) **+** `dct:publisher` (→ community) [it conflated two relations and pointed at neither — *that* is the `profiles.py:250` "bug", now **mooted by deletion**, not fixed]; the 5-predicate `ValidationContext` reification → `prof:Profile` + `prof:hasResource`/`ResourceDescriptor`/`role:validation`. This touches **ODR-0010 (ratified S010), the profile emitter, ADR-0013/0026/0029** — far more surface than the home fix, and is **spike-gated** (a one-page baspi5 PROF-fit spike; PROF rides DCAT+DCMI Recs, but is itself a 2019 WG Note — the honest caveat). Three-for (Kendall/Gandon/Davis), Allemang compatible.
6. **Attribution (Knublauch + Davis, keep the axes distinct):** the bespoke predicates die on the **invention test** (a Rec-grade standard already does the job) — **not** on Davis's YAGNI/homonym count. Davis's "0 genuine homonyms" gates only the **polysemy machinery** (per-context `skos:scopeNote` registries, SKOS-XL, sense registers; ODR-0019 Rule 8) — which S021 correctly keeps gated. Do not frame `definedInContext` as "killed by the gate"; it is **replaced** by standards.

**Two live governance forks (clean YAGNI calls, both kill `definedInContext` regardless):**
- **(i) Community-ownership predicate:** carry `dct:subject` → context for the steward-adjudicated residue [Kendall] vs carry no ownership predicate at all, only concern + provenance + derived usage [Allemang]. Resolves on: *is there a named consumer for hand-authored community-ownership?*
- **(ii) `servesContext`:** keep the bare dormant CONSTRUCT [Kendall/Allemang-reconciled] vs cut even that [Davis's residual lean] — both agree to thin the S021 scaffolding regardless. Effectively reconciled to "dormant, never materialised."

## Disposition — what S022 changes (supersedes parts of S021)

**Overturns** the S021 Q1 6–3 sub-vote ("un-gate `definedInContext`, generate-for-every-term"). **Retains** the rest of S021 (servesContext-derived, scheme, consumesFrom, firewall, mechanical walk, generic profile composer).

| Record | S021 said | S022 says |
|---|---|---|
| **ODR-0019** | Rule 8 split: un-gate `definedInContext` (generated home for every term) | **Withdraw Rule 5's `definedInContext`**; home = `rdfs:isDefinedBy` (module) + `dct:source`; **restore Rule 8 gate in full** for community-home (`dct:subject`, empty residue) |
| **ODR-0020** | Rule 4 authored ownership layer + D1/D2 via `definedInContext` | **Strike the `definedInContext` ownership layer**; keep derived `servesContext` + `consumesFrom`; total-cover CI re-expressed over `rdfs:isDefinedBy` + `consumesFrom` + scaffolding allow-list; **re-point `overlaysContext` at the base via `prof:isProfileOf`, NOT at a context concept** (S020 Rule 6 / `CONTEXT_OF`-to-context was convention-wrong); community link (if stored) = `dct:audience` |
| **ADR-0026** | scheme + `CONTEXT_OF` re-points `overlaysContext` → context concept; cross-check shape; total-cover CI; F2/F3 | scheme **kept**; `overlaysContext` → **base** (`prof:isProfileOf`); **drop** cross-check shape + total-cover-CI scaffolding + F2/F3; keep **F1**; profile node typed `prof:Profile` |
| **ADR-0028** | generated `definedInContext` home-pass over every term | **delete the home-pass**; emit `rdfs:isDefinedBy → owning module` (mechanical); keep `dct:source`. **The 935-leaf datatype-property walk is unaffected** |
| **ADR-0029** | `ProfileSpec` + 14 profiles wired `overlaysContext`→context | **kept**, re-framed as **DCTAP→SHACL**; each profile `prof:isProfileOf <base>` (+ optional `dct:audience` → community); **drop `requires`** (shapes-redundant) |
| **ODR-0010** | overlay = SHACL ValidationContext mechanism | substance survives, re-expressible in **PROF** (profile = `prof:Profile`; `ValidationContext` reification IS `prof:Profile`) behind the baspi5 fit-spike |

**New convention adoptions:** `prof:isProfileOf` + PROF profile typing (spike-gated); `rdfs:isDefinedBy` → module (mechanical, fills a real gap); DCTAP framing for the `ProfileSpec`; `dct:subject` (gated) / `dct:audience` for community; conneg-by-profile (forward-compatible). **Deletions:** `opda:definedInContext`, `opda:requires`, the S021 cross-check shape + total-cover-CI scaffolding + F2/F3. **Survives unchanged:** the SKOS 6-context scheme, `opda:servesContext` (dormant rule), `opda:consumesFrom`, per-shape `dct:source`, F1 firewall, the 935-leaf walk.

---

## Governance directive (2026-05-30, later) — NO profile-object layer; NO PROF; NO spike

After synthesis, the directing programme authority issued a binding correction that **overrides the council's Q1/Q2 PROF adoption** (recorded above as the deliberation; this directive governs the design):

> **"Why are we creating forms? We already established that SHACL establishes the overlays. You are over-engineering the forms again. We don't need spikes."**

The council answered "what *standard* replaces OPDA's bespoke profile wrapper?" with **W3C PROF** — but the prior question is **"do we need a profile-object wrapper at all?"** and the answer is **no**. [ODR-0010](../ODR-0010-overlay-profile-mechanism.md) already established that the **SHACL overlay IS the form**; layering a `prof:Profile` (or any wrapper) on top is the same over-engineering the session set out to remove, standard-branded.

**Binding design (overrides the PROF parts of Q1/Q2/Q4 and the disposition table):**
- **The form layer adds NOTHING.** No `prof:Profile`, no `prof:isProfileOf`, no `prof:hasResource`, no re-typing of `opda:ValidationContext`, no spike. ODR-0010's existing SHACL-overlay mechanism stands **as-is**.
- **Form↔base association** = the shapes' **`sh:targetClass`** on the `opda:` base (structural; Knublauch's "targeting IS the association"). Nothing added.
- **`opda:overlaysContext` DROPPED** (not re-pointed, not replaced) — the `profiles.py:250` bug is **moot**. **`opda:requires` DROPPED** (the shapes enumerate required terms).
- **Form↔community** (which community owns a form) = **one standard triple on the form graph**: `dct:subject` (or `dct:publisher`) → its context concept. Not a wrapper, not a new layer.
- Guarino's S010 truth-maker ("required *relative to* a named context") is satisfied by the **named SHACL graph itself** (`baspi5.ttl` *is* the named context) — no reified node needed beyond what ODR-0010 already has.

**What still stands from the convention research (these are *term*-level and bounded-context-scheme fixes — not 'forms', so not the over-engineering):**
- `opda:definedInContext` **retired** → `rdfs:isDefinedBy` (module) + `dct:source` (provenance, already emitted) + `dct:subject` (community, authored-or-absent, gated).
- `opda:servesContext` = a **derived query, run on demand** (read off the shapes + each form's `dct:subject`/`dct:publisher`); not stored, not a shipped artefact.
- the **SKOS 6-context scheme** (the bounded-context deliverable) and **`opda:consumesFrom`** (upstream Conformist) stand; F1 firewall stands.

**Net:** the form side = the SHACL overlay (ODR-0010), unchanged, plus one `dct:subject` triple per form. The term/scheme side = the SKOS scheme + three standard term annotations + `consumesFrom` + an on-demand query. **Zero new wrapper objects, zero PROF, zero bespoke membership predicates, zero spikes.** This is the leanest reading and the one the directing authority ratified; the ADR-0026/0028/0029 + ODR-0019/0020 records carry it.
