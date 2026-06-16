# Council Session 046 — Holger Knublauch (SHACL) — Working File

**Seat:** Holger Knublauch (TopQuadrant; co-editor, W3C SHACL Recommendation).
**Lens:** SHACL-as-schema — shapes describe the structure data is expected to take; constraints are *closed-world expectations over data*, **not** TBox assertions. `sh:in` / `sh:class` / `sh:node`; closed-world scoping.

---

## OPENING

### Framing (the SHACL-as-schema axiom, load-bearing for all three Qs)

A SHACL shape is **not a fact and not a TBox axiom** — it is a closed-world *validation condition* over a data graph (SHACL Rec §1.1: "SHACL … a language for validating RDF graphs against a set of conditions"; the data graph is what is validated, the shapes graph is *not* materialised into it). OPDA has codified exactly this: **ODR-0013 §Context** — "the closed-world contract is SHACL's job … the shapes graph is kept **separate** from the OWL class graph — `owl:minCardinality` and `sh:minCount` are not the same statement" (Session-001 Q3). And **ODR-0029 §R1/R3** make the entailment/validation boundary doctrinal: `rdfs:range` is **validated** (SHACL `sh:targetObjectsOf <pred> ; sh:class C`), **never inferred** — "the exact semantics of `rdfs:range` evaluated closed-world ('are they?') instead of generatively ('therefore they are')". This is my home ground, and OPDA's existing design is already the textbook SHACL-as-schema construction. My priors are therefore strongly toward *keep* on Q1/Q2 and a *staged* answer on Q3.

### Q1 — `opda:currency`/`opda:peril` `rdfs:range` → **AFFIRM (keep `rdfs:range skos:Concept` + the existing `sh:in` scoping). Ballot: AGAINST change / FOR keep.**

The scheme-binding "value ∈ scheme X" is a **value-space constraint**, and a value-space constraint is precisely what `sh:in` is for (SHACL §4.8.3 — the value node must be a member of the enumerated list). The corpus already does this correctly and deterministically:

- `opda:currency` value shape: `sh:in ( <…/currency/GBP> <…/EUR> <…/USD> ) ; sh:nodeKind sh:IRI` (`opda-shapes-merged.ttl:351`); `opda:peril`: `sh:in (` 12 concept IRIs `) ; sh:nodeKind sh:IRI` (`:693`). Every member is `rdf:type skos:Concept ; skos:inScheme opda-v:CurrencyScheme|PerilScheme` (`opda-vocabularies.ttl:964`, `:2219`). So the scheme is recoverable by the deterministic join `sh:in`-member → `skos:inScheme` → scheme — over triples that already exist.

So the binding is **already asserted and machine-recoverable** (in the data, via `skos:inScheme`) **and** enforced (in SHACL, via `sh:in`). The TBox `rdfs:range skos:Concept` correctly says the open-world truth ("the value is *a* concept"); narrowing *which* concept is SHACL's closed-world job, not the TBox's. The range should stay.

**On the `sh:class CurrencyConcept` alternative (the brief's "cleaner?" question): REJECT as default.** A `sh:class opda:CurrencyConcept` (with `opda:CurrencyConcept rdfs:subClassOf skos:Concept`) requires, per SHACL §4.1.1, that every value node be a **SHACL instance of** `opda:CurrencyConcept` — i.e. carry `rdf:type opda:CurrencyConcept` (or a subclass). But the corpus types currency/peril values as `rdf:type skos:Concept` and binds them to the scheme by **`skos:inScheme`, not `rdf:type`**. To switch to `sh:class` you would have to re-type all 323 concepts with a per-scheme rdf:type — duplicating, as a class membership, the information `skos:inScheme` already carries. That is redundant modelling for no validation gain over `sh:in` (which the data already satisfies). `sh:in` over the IRIs is the simpler, already-conformant, already-deployed idiom. (If one ever wanted scheme-membership-as-a-shape rather than an enumerated literal list — e.g. for an open-ended scheme — the faithful SHACL idiom is **not** `sh:class` but `sh:node [ sh:property [ sh:path skos:inScheme ; sh:hasValue opda-v:CurrencyScheme ] ]` — constrain on the *asserted membership predicate*, SKOS §4 S4, not on `rdf:type`.)

*Citations:* SHACL §4.8.3 (`sh:in`); §4.1.1 (`sh:class` ⇒ rdf:type membership); SKOS §4 S4 (`skos:inScheme` range = ConceptScheme); ODR-0029 R3; ODR-0013 §Context.

### Q2 — Is bare-`skos:Concept` range a defect or correct-by-design? → **AFFIRM correct-by-design. Ballot: FOR (the bare range is intended; the OWL layer should NOT carry more).**

The faithful OWL/SKOS idiom for "this object property's value is a concept drawn from scheme X", in a SHACL-as-schema architecture, is a **two-layer statement**:

1. **TBox (OWL, open-world):** `rdfs:range skos:Concept` — says "the value is a concept". This is all OWL *can* faithfully say without either (a) the category error of `rdfs:range <Scheme>` (a ConceptScheme is an **aggregation** of concepts, SKOS §4.1 — no instance is `rdf:type` the scheme, so a range over it is vacuous/unsatisfiable for real data), or (b) reifying the closed list into an `owl:oneOf`/`owl:equivalentClass` enumeration, which drags a *closed-world* value-space into an *open-world* logic where it does not belong and where a reasoner could draw unsound conclusions (ODR-0025 §R2 — "unsound for master data").
2. **SHACL (closed-world):** `sh:in` over the scheme's member IRIs — says "*and specifically* it is one of {scheme X's concepts}".

This is not a smell; it is the **correct division of labour**. SHACL §1.1 frames a shape as a closed expectation over data; OWL frames a class/property as open-world meaning. "Value drawn from a closed register" is inherently a closed-world statement, so it lives in SHACL. **The OWL layer should carry nothing more** — adding it would either be category-erroneous or would re-import a constraint into a logic that cannot soundly police it. The bare `skos:Concept` range is the deliberate, faithful TBox half of a correctly-stratified design (ODR-0029's whole thesis).

*Citations:* SKOS §4.1 (scheme = aggregation, not class of rdf:type instances); SKOS §3.5.1 (the spec declines to identify `skos:Concept` with `owl:Class` — concepts-as-values, not classes); SHACL §1.1 (validation, not assertion); ODR-0029 §R1/R2 (validate range, never infer); ODR-0025 §R2.

### Q3 — The string-enum binding → **REVISE. Ballot: FOR (regenerate as concept-IRI `sh:in`, but STAGED/gated; the annotation property is a sound *interim/complementary* device, not a substitute for the constraint).**

The decisive SHACL call. Three sub-findings:

**(a) The string→scheme join is non-injective, so the binding is genuinely unrecoverable today.** Verified: 24 of 264 prefLabels are ambiguous ("Freehold" ∈ 2 schemes, "Other" ∈ 8, "Yes"/"No" ∈ 6) and there are **0 asserted `skos:exactMatch` triples**; the scheme is named only in `sh:message`/`rdfs:comment` **prose** (no formal meaning — OWL2 Primer §annotations; and SHACL §1.1: `sh:message` is human-facing, never a machine join). So unlike currency/peril, a string-literal `sh:in` value **cannot deterministically select its scheme**. This is a real gap, not a stylistic one.

**(b) OPDA's own doctrine already points at the IRI form.** ODR-0011 §7a's typing table reads, for every closed scheme: "`sh:pattern` + **`sh:in` on concept URI**" and "`sh:in` on **concept URI**" — *not* `sh:in` on a string literal. ODR-0013 §More-Information: enum columns "drive `sh:in` over the corresponding ODR-0011 **scheme**". So the emitted **`sh:datatype xsd:string` + `sh:in ("Freehold" …)`** shapes are a **divergence from the doctrine** they cite — the doctrine wanted IRI/scheme membership; the generator emitted string literals. Regenerating to concept-IRI `sh:in` (joining by `skos:inScheme` exactly like currency/peril) **realigns emission with §7a** and makes case (A) machine-recoverable by the same deterministic join as case (B). That is the principled target state.

**(c) BUT it is an instance-data-breaking change, so it must be STAGED, not flipped.** This is where my SHACL-deployment realism bites:
- Instance data **carries the string `"Freehold"` today** (the JSON-derived transactions). Switching the shape to `sh:in (<…/tenure/Freehold> …) ; sh:nodeKind sh:IRI` makes **every conformant instance non-conformant** overnight unless the data is simultaneously migrated string→IRI. That is an ODR-0013 `sh:Violation`-level break across the whole corpus.
- The ODR-0010 overlay contract compounds it: overlays **union `sh:in` member lists** at build time (ODR-0010 §Rules-2 — "enum union → a single *merged* `sh:in`"; stacked `sh:in` is conjunctive = intersection, the regression guard). A base/overlay mismatch (one IRI-valued, one string-valued) would silently produce an **empty intersection** → everything fails. Base and every overlay must flip together, atomically.

**Disposition.** REVISE toward concept-IRI `sh:in` as the **ratified target**, executed as a **gated migration** (data string→IRI + base + all overlays in one build-step cutover, guarded by the existing `ci-baspi5-roundtrip` set-union test extended to the IRI form), **not** a unilateral shape edit. Until that cutover, the **`opda:constrainedByScheme` annotation property is the sound bridge**: it asserts field→scheme as a real triple (machine-recoverable *now*, no instance-data impact, lights the `/pdtf` "schemes used" panel), and it is honest about its register — it is an **annotation, not a constraint**, so it documents the binding without *enforcing* membership (the `xsd:string` `sh:in` keeps enforcing, per ODR-0011 §7a, until the cutover). The annotation property therefore **complements** the staged `sh:in` regen; it is not a permanent substitute for it (a permanent annotation-only answer would leave the value-space enforced against *strings*, never against the scheme — the §7a divergence uncorrected).

**Reject** the "stay as `xsd:string` + ODR-0011 §7a forever, binding documented-not-asserted" option *as the end state* — it freezes the §7a divergence and leaves 24/264 cases machine-irrecoverable. **Accept** it only as the *interim* state during the gated migration.

*Citations:* SHACL §4.8.3 (`sh:in`); §1.1 (`sh:message` human-facing, not a join); ODR-0011 §7a (table specifies `sh:in` **on concept URI**); ODR-0013 (enum → `sh:in` over the scheme; `sh:Violation` tier); ODR-0010 §Rules-2 (overlay `sh:in` set-union; stacked = intersection regression guard); session-045 Q1 (24/264 non-injective; 0 asserted exactMatch).

---

## EXCHANGES

(verbatim DMs below, appended as they happen)

### → Cagle (DA) [SENT] — SHACL-sufficiency (Q1/Q2)

> Knublauch → Cagle (DA), session-046, on SHACL-sufficiency.
>
> We were aligned in session-045 (your WITHDRAWAL on Q1 rested on "I never objected to showing the recoverable dependency; my objection was minting an asserted relation from a validation condition"). Q1/Q2 here are the source-side counterpart, and I think your SHACL-first instinct lands on KEEP.
>
> My Q1/Q2 verdict: AFFIRM keep `rdfs:range skos:Concept` + the existing `sh:in` scoping; the OWL layer carries nothing more. Grounds: "value ∈ scheme X" is a closed-world value-space constraint = exactly `sh:in` (SHACL §4.8.3), and ODR-0029 R3 already makes `rdfs:range` itself a SHACL `sh:targetObjectsOf ; sh:class C` check — never inferred. The bare `skos:Concept` range is the *intended* open-world TBox half (SKOS §4.1 — a scheme is an aggregation, so `rdfs:range <Scheme>` is a category error; SHACL §1.1 — a shape validates, it does not assert). This is the textbook SHACL-as-schema stratification, and ODR-0013 §Context codifies it ("the shapes graph is kept separate from the OWL class graph").
>
> The one question I want your DA pressure on: the brief floats `sh:class opda:CurrencyConcept` (Concept-subclass) as "cleaner than sh:in". I REJECT that as default — SHACL §4.1.1 makes `sh:class` require `rdf:type opda:CurrencyConcept` on every value, but the corpus binds concepts by `skos:inScheme`, not `rdf:type`; switching would force re-typing 323 concepts to duplicate membership info `skos:inScheme` already carries, for zero validation gain over the already-conformant `sh:in`. Do you see any case where `sh:class`/a Concept-subclass earns its keep here, or do you agree `sh:in` over the IRIs is the minimal sufficient home and the range stays bare? Is there a "the model refusing to lie" argument (your session-045 framing) that cuts against adding ANY OWL machinery here?

### → Hendler [SENT] — range semantics (Q1/Q2)

> Knublauch → Hendler, session-046, on range semantics (Q1/Q2).
>
> Your session-045 caution is recorded as the steer for this council (line 152): "do NOT assert `rdfs:range CurrencyScheme` (a scheme is a `skos:inScheme` aggregation, not a class of rdf:type instances); keep range `skos:Concept` + SHACL scoping (plausibly the intended design), or define a scheme-typed Concept subclass." I want to lock the SHACL half of that and test the subclass option with you.
>
> My Q1: AFFIRM keep `rdfs:range skos:Concept` + existing `sh:in`. My Q2: the bare range is correct-by-design — it is the OWL/open-world half of a two-layer statement whose closed-world half ("specifically scheme X's members") is `sh:in` (SHACL §4.8.3). I argue the OWL layer should carry NOTHING more, because the only ways to say "value ∈ scheme X members" in OWL are (a) `rdfs:range <Scheme>` — category error (SKOS §4.1, scheme = aggregation, no instance rdf:type the scheme), or (b) `owl:oneOf`/`owl:equivalentClass` enumeration — which drags a closed-world value-space into OWA where a reasoner can draw unsound conclusions (ODR-0025 §R2 "unsound for master data"). So OWL faithfully says only "a concept"; SHACL says "which".
>
> Two things I want your OWL-semantics read on: (1) Do you agree that a scheme-typed `opda:CurrencyConcept rdfs:subClassOf skos:Concept` as the *range* buys nothing over `range skos:Concept` UNLESS the concepts are re-typed `rdf:type opda:CurrencyConcept` — and that doing so duplicates, as class membership, what `skos:inScheme` already asserts? i.e. it is a modelling cost with no entailment we want (we explicitly never want range→type inference here, ODR-0029). (2) Is there any OWA pitfall in leaving `range skos:Concept` bare that I'm underweighting — e.g. does the open-world range cause any unwanted entailment on currency/peril values, or is it inert (the empirical ODR-0029 finding was the closure adds 0 triples)? I read it as inert and therefore safe. Concur?

### → Isaac [SENT] — concept-IRI sh:in for the string enums (Q3)

> Knublauch → Isaac, session-046, on Q3 — regenerating the string-enum `sh:in` as concept-IRI `sh:in`.
>
> In session-045 your Q1 position was the sharp one: derived edges are "faithful only where the value-space resolves through asserted `skos:inScheme` (SKOS §8.1); string cases → fix the source." Q3 here IS "fix the source." I want your SKOS read on the target form.
>
> My Q3: REVISE → regenerate the ~21 `sh:datatype xsd:string` + `sh:in ("Freehold" …)` shapes as concept-IRI `sh:in (<…/tenure/Freehold> …) ; sh:nodeKind sh:IRI`, so case (A) joins via `skos:inScheme` exactly like currency/peril — killing the 24/264 non-injectivity (0 asserted exactMatch; "Freehold" ∈ 2 schemes, "Other" ∈ 8). My grounds are partly that OPDA's OWN doctrine already specifies the IRI form: ODR-0011 §7a's typing table reads "`sh:in` on **concept URI**" for every closed scheme, and ODR-0013 says enum → "`sh:in` over the corresponding scheme" — so the emitted string-literal shapes are a divergence from the doctrine they cite. The TenureKindScheme/etc. concepts already exist as IRIs with `skos:inScheme` (`opda-vocabularies.ttl:2622+`), so the join target is already in place.
>
> Three SKOS questions for you: (1) Is concept-IRI `sh:in` + the `skos:inScheme` join the faithful SKOS way to bind a closed enum to its scheme — i.e. do you agree the value-space "resolves through asserted `skos:inScheme`" exactly as your session-045 condition demanded? (2) The non-injectivity is *across schemes* — does SKOS §1a's one-primary-scheme integrity (a concept in exactly one `skos:inScheme`) mean the IRI form is not just nicer but the ONLY deterministic resolution (since prefLabels are unique only per-scheme, S14, never globally)? (3) For the interim before a gated data migration, is an `opda:constrainedByScheme` annotation property (field→scheme as an asserted triple, no instance-data impact) a SKOS-coherent bridge — or does asserting field→scheme outside the `sh:in`/`skos:inScheme` mechanism muddy the register? I'm treating it as a complement (annotation), never a replacement for the `sh:in` regen.

### [SELF-NOTE — corpus verification, sharpens Q3] The "instance data" is JSON, lifted to RDF

Checked the actual instance layer before defending the STAGED caveat. Finding (corpus-verified):
- The source instances are **JSON transactions**, not hand-authored RDF: `…/moverly-properties/*.json` and `…/sandbox-claims-v3/*.json` carry `"/propertyPack/marketingTenure": "Freehold"` and `"ownershipType": "Freehold"` as **bare string literals** (e.g. `101-broadbridge-close-manchester-claims.json:875`, `:928`).
- The **BASPI5 round-trip conformance fixture** — the one `ci-baspi5-roundtrip` guards — carries `"ownershipType": "Freehold"` as a string (`tests/baspi5_round_trip/sample_data/baspi5_sample_transaction.json:40`).
- Currency is *not even* a separate IRI field in the JSON: it is encoded **inline in the magnitude string** — `"amount": "£145000"` (`47 Park Mount.json:640`). So the `<…/currency/GBP>` IRI that the TTL `sh:in` enumerates is **minted by the JSON→RDF lift**, not present in source.

**Implication for Q3 (refines, does not overturn, my caveat):** the string→IRI gap is a property of the **JSON→RDF lift/extractor contract**, not of hand-authored triples. This *softens* the cost (the lift is a **single** point that must learn `"Freehold"` → `<…/tenure/Freehold>` — exactly as it already mints `"£145000"` → a `MonetaryAmount` with `opda:currency <…/GBP>`) **and confirms** it is real and atomic (the lift + base shapes + every overlay `sh:in` must cut over together, or the ODR-0010 set-union produces an empty intersection). It also means the concept-IRI `sh:in` target is *consistent with how currency/peril already work end-to-end*: currency proves the lift can already do string→IRI for one scheme; Q3 generalises that proven path to the other ~21. Net: REVISE→concept-IRI `sh:in` stands; the migration is a **lift-contract change**, gated on the round-trip test extended to assert post-lift IRI membership (not a hand-edit of instance RDF).

### ← Cagle-DA (inbound, Q2 + Q3-horn-to-Isaac) — summary + my reply

**Cagle's relevant positions (read from his working file):** Q1/Q2 — AFFIRM keep range / AGAINST OWL carrying more (converges with me); his (a) SHACL-sufficiency and (b) "never-reasoned / mildly hazardous if pushed to OWL" asks. Q3 — AFFIRM *stay* (ODR-0011 §7a "correct-by-doctrine"); REJECT minting `opda:constrainedByScheme` (trips 045 line-129 re-open trigger verbatim); concept-IRI regen = real instance-data migration, a nice-to-have already routed around by 045; ABSTAIN-leaning on the IRI regen *only if* re-scoped as a migration not a tidy-up.

**My reply [SENT]:**

> Q1/Q2: we converge cleanly. (a) SHACL-sufficiency — YES, `sh:in` over the `skos:inScheme` members is sufficient; nothing about "drawn from scheme X" that ONLY OWL can carry; bare range intended (SHACL §1.1). (b) Your "mildly hazardous" point — AGREED and co-signed: a scheme-typed ranged subclass risks pulling SKOS individuals into the OWL extension under range→type closure = the ODR-0029/0031 red line. `sh:class opda:CurrencyConcept` REJECTED (§4.1.1 keys on rdf:type; corpus keys on skos:inScheme; gratuitous + hazardous).
>
> Q3: I've moved — we're ~one label apart. Conceding both your points: (1) DROPPING the annotation property entirely (trips 045 line-129; Isaac's redundancy argument also kills it); (2) the regen IS a real instance-data change — verified firsthand: `"marketingTenure":"Freehold"`/`"ownershipType":"Freehold"` as strings incl. BASPI5 fixture `:40`; currency inline `"amount":"£145000"` → IRI minted by the lift. Atomic cutover required (lift+base+overlays) or ODR-0010 set-union → empty intersection.
>
> Where we differ: only whether the council *ratifies the direction* now. My REVISE = record concept-IRI `sh:in` as the target, executed as an operator-gated lift/data migration. My push-back on "correct-by-doctrine": §7a's table reads "`sh:in` on **concept URI**"; ODR-0013 says enum → "`sh:in` over the **scheme**" — so the as-built string-literal form is a *drift from* §7a, not faithful to it (Hendler flagged the same independently), and 24/264 are genuinely machine-irrecoverable. That's a latent correctness gap the doctrine disavows, not a nice-to-have. But I accept your discipline: operator-ratified migration, never a tidy-up.
>
> Can you live with "REVISE = ratify concept-IRI `sh:in` as the target, gated migration, annotation-property rejected, §7a-drift named" — or do you HOLD that even recording the direction over-reaches? If the latter, what's the concrete harm in recording the target vs leaving §7a's table contradicted by emission?

### ← Hendler (inbound) — summary + my reply

**Hendler's positions:** Q1/Q2 AFFIRM keep range / FOR (range is a *premise* per OWL2 Primer §4.6; bare range is entailment-honest). Q3 FOR a REVISE — promote by re-grounding values string→IRI (concept-IRI `sh:in`); REJECT minting `opda:constrainedByScheme` over non-injective strings / from `sh:message` prose (OWL2 Primer §8 — annotations carry no formal meaning). Independently found: (i) the string-enum schemes already have dereferenceable concept IRIs; (ii) ODR-0011 §7a's table contemplates `sh:in`-on-concept-URI, so the string form is a drift.

**My reply [SENT]:**

> Q1/Q2: full concurrence + yes to both asks. (1) The subclass buys nothing unless concepts are re-typed `rdf:type opda:CurrencyConcept` (duplicating skos:inScheme, SKOS §4.3 S4); §4.1.1 makes sh:class key on rdf:type, so net zero enforcement gain + the sync liability you named. (2) OWA-inertness — concur, bare range licenses `?o rdf:type skos:Concept` which is true in every model (entails nothing false); ODR-0029's "0 triples" confirms it fires nothing unwanted; a tighter range only adds false/unsound entailment, so bare is strictly better. Locked.
>
> Q3: aligned; your two independent findings strengthen it (the IRIs exist; §7a-drift — two of us on it now). I've DROPPED the annotation property (045 trigger per Cagle + Isaac's redundancy). My Q3 collapses to your REVISE: re-ground string→IRI, never assert a relation over the non-injective strings. Sharpening from firsthand check: the strings live in JSON source (incl. BASPI5 fixture), currency is `"amount":"£145000"` inline → IRI minted by the lift; so the migration is a **lift-contract change** (extend the proven currency path to the other ~21), gated atomically with base+overlay sh:in, guarded by the round-trip test — not a hand-edit of instance RDF. Does that framing sit right with your entailment-honesty bar? Nothing false asserted at any step.

### ← Isaac (inbound) — summary + my reply

**Isaac's positions:** Q1/Q2 AFFIRM keep range / FOR (scheme ⊥ concept, SKOS §4.3 S9 → `rdfs:range CurrencyScheme` is a category error; subclass *permitted* by §3.5.1/S1 but an anti-pattern — duplicates the inScheme axis). Q3 REVISE → concept-IRI `sh:in` / FOR; explicitly **prefers concept-IRI `sh:in` over an annotation property** (IRI binds value→concept so every join comes free; annotation binds only field→scheme + leaves data ambiguous). Asked me 3 SHACL questions (mechanism, Q2 RangeShape-placement, overlay-resequencing).

**My reply [SENT]:**

> (1) Concept-IRI `sh:in` is the right mechanism; stays a pure validation constraint (form identical to peril shape `:174-180`); scheme membership remains the asserted skos:inScheme triple. Changing *which values are validated* (strings → canonical IRIs) is NOT minting a field→scheme relation — the line Cagle rightly guards.
> (2) Agreed: concept-IRI `sh:in` OVER an annotation property; I've dropped the annotation property for exactly your reason (+ the 045 trigger). Panel now unanimous against it.
> (Q2 placement) The split IS the cleaner idiom: RangeShape (`sh:targetObjectsOf ; sh:class skos:Concept`) = predicate-wide ODR-0029 R3 type-check; node-shape property shape (`sh:in`) = **bearer-scoped** value-space (a currency on a MonetaryAmount). Co-locating `sh:in` onto the RangeShape would be *worse* — it loses the bearer scoping (`sh:targetObjectsOf` over-applies to every use of the predicate). Correct-by-design, as you have it.
> (Q3 overlay-sequencing) Atomic cutover, never incremental — stacked/mismatched `sh:in` is conjunctive (intersection); base-IRI vs overlay-string → EMPTY effective sh:in. Sequence: (a) regen base + every overlay sh:in to IRI in one build; (b) migrate the lift to mint the concept IRI (already done for currency); (c) extend `ci-baspi5-roundtrip` to assert the composed sh:in is the IRI set-union; (d) ODR-0013 severity preserved. Subset-contract holds member-for-member (each string ↦ its IRI 1:1 via skos:inScheme; union/subset isomorphic across the relabelling). Until the gated cutover ships, STAY string + LOG the 24/264 recoverability gap as a known limitation, never paper with prose. Does that satisfy your stage-or-log fallback?

### POSITION CHANGE (Q3) — recorded

After Cagle's 045-re-open-trigger point and Isaac's redundancy argument (both converging), I **withdraw the `opda:constrainedByScheme` annotation property** from my Q3 disposition. It was offered as an *interim* device; the panel is unanimous it is either a guardrail breach (if a TBox object property) or strictly inferior to the IRI regen (annotation binds only field→scheme, leaves data ambiguous). My Q3 now reads: **REVISE → regenerate string-enum `sh:in` as concept-IRI `sh:in`, as the ratified target state, executed as an operator-gated atomic lift/base/overlay migration guarded by the round-trip test; until cutover, STAY string + log the 24/264 gap as a known limitation. No annotation property.** Verdict label and ballot unchanged (REVISE / FOR); the disposition is simplified and hardened.

### ← Cagle-DA (inbound, his predicate-as-scope reply to Isaac) — my rebuttal + narrowing

**Cagle's strongest "stay" move (his reply to Isaac, his file lines 190-196):** the non-injectivity is at the *value* level; no triple is bare — it's always `?x opda:constructionType "Brick"`, and the **predicate scopes the literal to its scheme 1:1** (he verified 6/6 string-`sh:in` properties map to one scheme, 0 ambiguous at field level), satisfying SKOS §6.1's "within the scope of a given concept scheme". So field→scheme is deterministic *today*, the regen is **canonicalisation not correctness**, and his WITHDRAW gate is: *"show me the consumer query that breaks WITH the predicate in hand."*

**My firsthand corpus check before replying:** (1) the predicate→scheme map is asserted **NOWHERE as a triple** — only in `rdfs:comment`/`sh:message` prose (`opda-descriptive.ttl:153` "value-space opda:ConstructionTypeScheme"; the `sh:message` strings). (2) 8/8 string-`sh:in` properties ARE 1:1 to a scheme (constructionType, marketingTenure, typeOfConnection, ofstedRating, ownerType, priceQualifier, transportType, evidenceType) — Cagle's 6/6 extends; **I concede there is no field-level ambiguity.**

**My reply [SENT] — concede the field level, hold the value→SKOS-edge level:**

> WHAT I CONCEDE: field→scheme is 1:1 and deterministic with the predicate in hand (8/8 verified, 0 ambiguous); the value-level non-injectivity does not bite a consumer holding the predicate; §6.1 predicate-as-scope is sound; the regen is canonicalisation *for the field→scheme question*. Conceded.
>
> WHERE IT STILL BREAKS (the query): the value is a plain literal `"Freehold"`, not `<…/tenure/Freehold>`, so with predicate in hand these all return EMPTY today and resolve under the IRI form:
> `?x opda:marketingTenure ?v . ?v skos:notation ?code` (EMPTY — string has no notation);
> `… ?v skos:broader ?super` (EMPTY — no hierarchy traversal);
> `… ?v skos:inScheme ?s` (EMPTY — string isn't inScheme anything);
> `?x ?p ?v . ?v skos:inScheme opda-v:TenureKindScheme` (EMPTY — no instance value is a concept IRI).
> Recovery needs THREE hops, one UNASSERTED: (string) → (scheme: **prose-only, no triple**) → (prefLabel match within scheme: the non-injective join, now scoped). The per-class "constrained-by" panel must itself be built by parsing prose or hardcoding the map — the prose-parse/fabrication 045 ruled out. Currency/peril need ZERO hops (value IS the concept IRI).
>
> So: NOT a validation defect (you're right), NOT a field→scheme defect (you're right) — it IS a **value→concept / SKOS-traversal defect**: the instance value carries no edge to the SKOS layer (session-045 finding #1 at the instance level). §7a's table ("`sh:in` on concept URI") + ODR-0013 ("`sh:in` over the scheme") show the doctrine intended the resolvable form → string-literal emission is a drift.
>
> Proposed convergence: record it as **canonicalisation at the field level (granted) + correctness at the value→SKOS-edge level (the query) + doctrine-aligned per §7a-drift**. WITHDRAW on the regeneration sub-question under that wording (council records concept-IRI `sh:in` as the ratified target, gated migration), HOLD reduced to its real residue: never a TBox relation, never a tidy-up, derived-view/panel is the interim surface.

**Where this leaves my Q3:** unchanged in verdict (REVISE / FOR), sharpened in claim. I am NOT claiming a field→scheme correctness defect (Cagle won that point). I AM claiming a **value→concept / SKOS-traversal correctness gap** that survives "predicate in hand", plus §7a-drift. The disposition is now identical across Cagle and me on every operational point (reject annotation property; concept-IRI `sh:in` as target; gated atomic migration; never a tidy-up; interim = derived view/panel + logged limitation) — the only residual is the descriptive label, which I've proposed splitting (canonicalisation at field level, correctness at value-edge level).

---

## FINAL — settled verdicts (Knublauch, SHACL seat)

Cross-talk reached full convergence with Hendler and Isaac, and operational convergence with the DA (Cagle). My verdicts:

### Q1 — `opda:currency`/`opda:peril` `rdfs:range` → **AFFIRM (keep `rdfs:range skos:Concept` + the existing SHACL `sh:in` scoping). Ballot: AGAINST change / FOR keep.**

"Value ∈ scheme X" is a closed-world value-space constraint, which is exactly what `sh:in` is for (SHACL §4.8.3); the binding is already asserted (`skos:inScheme` on each concept, SKOS §4.3 S4) and recoverable by the deterministic `sh:in`-member → `skos:inScheme` → scheme join, and already enforced (the node-shape `sh:in` over concept IRIs, `sh:nodeKind sh:IRI`). The TBox correctly asserts only the open-world truth ("a concept"). **Reject the `sh:class opda:CurrencyConcept` / scheme-subclass alternative:** SHACL §4.1.1 makes `sh:class` key on `rdf:type`, but the corpus binds concepts by `skos:inScheme`, not `rdf:type` (deliberately — SKOS §3.5.1 leaves the Concept↔Class relation open); a subclass would force re-typing all 323 concepts to restate membership `skos:inScheme` already carries, for zero validation gain over the already-conformant `sh:in`, and would not clear the OntoClean promote-to-subclass bar (ODR-0011 §8a). 4/4 panel convergence (Knublauch, Hendler, Isaac, Cagle-DA).

*Citations:* SHACL §4.8.3 (`sh:in`); §4.1.1 (`sh:class` ⇒ `rdf:type` membership); SKOS §4.3 S4 (`skos:inScheme` range = ConceptScheme); §3.5.1 (Concept↔Class left open); ODR-0029 R3; ODR-0013 §Context.

### Q2 — defect or correct-by-design? → **AFFIRM correct-by-design. Ballot: FOR (the bare range is intended; the OWL layer should NOT carry more).**

The faithful idiom for "value is a concept drawn from scheme X" is a two-layer statement: **TBox** `rdfs:range skos:Concept` (open-world: "a concept" — all OWL can faithfully say, since `rdfs:range <Scheme>` is a category error per SKOS §4.1/§4.3 S9 scheme⊥concept, and an `owl:oneOf` enumeration drags closed-world closure into OWA where a reasoner draws unsound conclusions, ODR-0025 §R2) + **SHACL** `sh:in` over the scheme members (closed-world: "which"). The OWL layer should carry nothing more — adding it is either category-erroneous, inert, or hazardous (re-importing SKOS individuals into the OWL extension under reasoning = the ODR-0029/0031 never-reasoned red line). The bare range is the model "refusing to lie": it asserts exactly what is true in every model and delegates the closed-world expectation to SHACL, which tells the truth about its own force ("I am a check on data, I entail nothing" — SHACL §1.1). 4/4 panel convergence.

*Citations:* SKOS §4.1 / §4.3 S9 (scheme = aggregation, scheme⊥concept); §3.5.1; §1.3 (SKOS not a formal KR language); SHACL §1.1; ODR-0029 §R1/R2; ODR-0025 §R2.

### Q3 — the string-enum binding → **REVISE. Ballot: FOR (regenerate as concept-IRI `sh:in`, as the ratified target, executed as an operator-gated atomic migration; the annotation property is REJECTED).**

Regenerate the ~21 `sh:datatype xsd:string` + `sh:in (literals)` shapes as concept-IRI `sh:in (<…concept IRIs…>) ; sh:nodeKind sh:IRI`, so case (A) joins via `skos:inScheme` exactly like currency/peril. This is the form ODR-0011 §7a's typing table already specifies ("`sh:in` on **concept URI**") and ODR-0013 ("`sh:in` over the **scheme**") — so the as-built string-literal emission is a **drift from the doctrine**, not its realisation (Hendler reached this independently). **REJECT** minting an `opda:constrainedByScheme` annotation property — unanimous: it trips the session-045 line-129 re-open trigger if a TBox object property (Cagle), and is strictly inferior to the IRI regen (the IRI binds value→concept so `inScheme`/`notation`/`broader` all come free; an annotation binds only field→scheme and leaves the data ambiguous — Isaac).

**Honest scoping of the defect (the DA's pressure, granted in part):** I CONCEDE field→scheme is 1:1 and deterministic with the predicate in hand (8/8 string-`sh:in` properties map to exactly one scheme; 0 field-level ambiguity) — so the regen is **canonicalisation at the field level**, not a field→scheme repair (Cagle's predicate-as-scope / SKOS §6.1 reading is sound). It IS a **correctness gap at the value→SKOS-edge level**: the instance value is a plain literal `"Freehold"`, not `<…/tenure/Freehold>`, so every SKOS-graph traversal on the value returns empty today (`?v skos:notation`/`skos:broader`/`skos:inScheme` — all EMPTY; cross-predicate `?v skos:inScheme <Scheme>` — EMPTY), and recovery needs three hops one of which (predicate→scheme) is **asserted nowhere — prose only** (`rdfs:comment`/`sh:message`), the prose-parse session-045 ruled out. So: not a validation defect, not a field→scheme defect, but a genuine value→concept SKOS-edge defect — session-045 finding #1 ("OWL and SKOS share no edge") at the instance level.

**Execution discipline (load-bearing, unanimous):** this is an instance-data-breaking change — source instances carry the strings (`"ownershipType":"Freehold"`, incl. the BASPI5 conformance fixture; currency is inline `"amount":"£145000"`, so the IRI is minted by the JSON→RDF lift). The cutover must be **atomic** — lift + base `sh:in` + every overlay `sh:in` in one build — because ODR-0010 unions `sh:in` member lists and a stacked/mismatched `sh:in` is conjunctive (intersection), so a base-IRI vs overlay-string mismatch yields an EMPTY effective `sh:in` and total failure. Guard with `ci-baspi5-roundtrip` extended to assert the composed `sh:in` is the IRI set-union; ODR-0013 severity preserved member-for-member (each string ↦ its IRI 1:1 via `skos:inScheme`, so union/subset relations are isomorphic across the relabelling). **Never a source tidy-up; an operator-ratified migration.** Until cutover: STAY `xsd:string` + `sh:in` + ODR-0011 §7a, and LOG the value→concept recoverability gap as a machine-readable known limitation (never paper it with prose). The interim recovery surface is the session-045 derived view / per-class panel.

*Citations:* SHACL §4.8.3 (`sh:in`); §1.1 (`sh:message` human-facing, not a join); ODR-0011 §7a (table: `sh:in` **on concept URI**); ODR-0013 (`sh:in` over the scheme; `sh:Violation` tier); ODR-0010 §Rules-2 (overlay `sh:in` set-union; stacked = intersection); SKOS §6 S12 (`skos:notation` unique *within* scheme); session-045 Q1 (24/264 non-injective; 0 asserted exactMatch; OWL↔SKOS no edge).

### Panel state summary

- **Q1: 4/4** AFFIRM keep / AGAINST change (Knublauch, Hendler, Isaac, Cagle-DA). No dissent.
- **Q2: 4/4** AFFIRM correct-by-design / AGAINST OWL carrying more. No dissent.
- **Q3: REVISE**, FOR the concept-IRI regen, unanimous REJECT of the annotation property, unanimous execution-as-gated-migration + STAY/LOG fallback. **DA residual (not a verdict split):** Cagle records the benefit as "canonicalisation, recoverability-already-present"; I record it as canonicalisation at field level + correctness at value→SKOS-edge level (the empty-traversal queries above) + §7a-drift. We are **operationally identical** (same disposition, same guardrails); the residual is the descriptive label and the HOLD-vs-WITHDRAW on whether the value-edge query counts as a present correctness defect. My answer (the four empty SPARQL traversals) is on the record as the case that it does.

**As the SHACL seat, my bottom line:** the existing currency/peril design is the textbook SHACL-as-schema construction and must stay (Q1/Q2); the string-enum emission is the one place the corpus *drifts from its own SHACL doctrine* (§7a wants concept-URI `sh:in`), and the faithful, deterministic fix is concept-IRI `sh:in` joined by `skos:inScheme` — executed as a gated, atomic, operator-ratified lift/shape migration, never a relation minted from a constraint and never a quiet source edit.

### Closing exchange — Cagle-DA Q3 WITHDRAW gate (discharged)

Cagle's finalization recorded his Q3b WITHDRAW gate as *"a concrete consumer query that breaks WITH the binding predicate in hand … (Posed to Isaac; not discharged at finalisation)"* and his HOLD as "canonicalisation, recoverability-already-present (6/6 1:1)". I discharged the gate to him directly.

**My closing note [SENT]:**

> Your gate IS met — the four queries, and why the 1:1 field→scheme map cannot serve them:
> `?x opda:marketingTenure ?v . ?v skos:notation ?code` (EMPTY — string has no notation);
> `… ?v skos:broader ?super` (EMPTY — no hierarchy traversal on a literal);
> `… ?v skos:inScheme ?s` (EMPTY — string isn't inScheme anything);
> `?x ?p ?v . ?v skos:inScheme opda-v:TenureKindScheme` (EMPTY — no instance value is a concept IRI).
> Crux: your 1:1 map recovers the SCHEME (predicate→scheme), not the VALUE's SKOS-graph identity — the value is the literal `"Freehold"`, not `<…/tenure/Freehold>`. Recovery = (string) → (scheme: prose-only, asserted nowhere — verified `opda-descriptive.ttl:153`) → (prefLabel match, the non-injective join). Three hops, one unasserted. Currency/peril: zero hops.
> I'm not asking you to flip to FOR — ABSTAIN/HOLD is a legitimate DA disposition and your guardrails are right (co-signed). I only want the record accurate: the gate was ANSWERED, not left open. If you hold, the honest residual is "I accept the value→SKOS-edge gap is real and demonstrable, but judge it below the bar to *mandate* the migration (vs. record it as the ratified target the operator stages)" — a disposition difference, not an unmet gate.

**Net (for the Queen's synthesis):** Cagle's Q3 HOLD rests on "recoverability already present (6/6 1:1)". That is true *for field→scheme* and false *for value→concept/SKOS-traversal* — the four empty queries are the demonstrable break his own gate asked for. Whether he converts ABSTAIN→FOR is his DA call; the operational disposition is unanimous regardless (reject annotation property; concept-IRI `sh:in` as target; gated atomic migration; STAY+machine-readable-log if deferred; never a same-version tidy-up). The only live question for the record is the *label* — and the gate that would settle it is discharged.

### ← Hendler (re-delivery of his opening DM) — affirmed both, fully locked

Hendler re-sent his opening two questions (already mirrored above + answered in my earlier reply). My confirming reply [SENT]:

> (1) Q1/Q2 — YES, affirmed as the SHACL author: value-space scoping belongs in the shape; bare `rdfs:range skos:Concept` is intended (SHACL §1.1). Two-shape split: RangeShape (`sh:targetObjectsOf ; sh:class skos:Concept`) = ODR-0029 R3 type-check; node-shape property shape (`sh:nodeKind sh:IRI ; sh:in`) = bearer-scoped value-space (§4.8.3). Co-sign the subclass rejection: `sh:class` (§4.1.1) keys on `rdf:type` but the corpus binds by `skos:inScheme` → re-typing 323 concepts to shadow the `sh:in`, zero sound entailment.
> (2) Q3 — YES on both. Concept-IRI `sh:in` (`sh:nodeKind sh:IRI` + `sh:in (<IRIs>)`) is the right form, byte-for-byte the MonetaryAmountShape idiom; stays a pure validation constraint (validated values change, no relation minted). It DISCHARGES my session-045 "REFER making (A) machine-readable upstream" — the regen makes the binding machine-readable by the same `sh:in`-member → `skos:inScheme` → scheme join as currency/peril. NOT documented-only `xsd:string` as the end state (freezes the §7a-drift — §7a's table reads "`sh:in` on concept URI"). Caveats: instance-data-breaking → atomic cutover (lift+base+overlays; ODR-0010 union, mismatch = empty intersection) guarded by `ci-baspi5-roundtrip`; STAY+log machine-readably until cutover. REJECT the `opda:constrainedByScheme` mint (non-injective strings + annotations carry no meaning, OWL2 Primer §8; 045 trigger; Isaac redundancy) — unanimous.

This is the second re-confirmation of full convergence with Hendler. No position change. All panellists locked; verdicts returned to the Queen.

### ← Isaac (re-delivery of his opening DM) — both confirmed, fully locked

Isaac re-sent his opening two questions (Q3 mechanism + overlay sequencing; Q2 RangeShape placement — both already mirrored above + answered in my earlier reply). My confirming reply [SENT]:

> Q3 — YES, concept-IRI `sh:in` is the right mechanism, and YES it stays a pure validation constraint (form = peril idiom `:174-180`; validated values change strings→IRIs, no relation minted; scheme membership stays the asserted `skos:inScheme`). Discharges my 045 "REFER making (A) machine-readable upstream". Sequencing the ODR-0010 subset re-check = ATOMIC cutover, never incremental (stacked/mismatched `sh:in` is conjunctive → empty intersection): (a) regen base + every overlay together; (b) migrate the lift to mint the concept IRI (already done for currency); (c) extend `ci-baspi5-roundtrip` to assert the composed `sh:in` is the IRI set-union; (d) ODR-0013 severity preserved. Subset-contract holds — each string ↦ its IRI 1:1 via `skos:inScheme`, union/subset isomorphic across the relabelling. Operator-ratified migration, never a tidy-up; STAY+log until cutover.
> Q2 placement — the split IS the cleaner idiom; co-locating `sh:in` onto the RangeShape would be WORSE. RangeShape (`sh:targetObjectsOf ; sh:class skos:Concept`) = predicate-wide ODR-0029 R3 type-check (targets every object of the predicate); node-shape property shape (`sh:in`) = bearer-scoped value-space (a currency on a MonetaryAmount). Moving `sh:in` to the RangeShape would lose the bearer scoping (over-apply to every use of the predicate). Correct-by-design, not a residual to fix.

Third re-confirmation of full convergence (Isaac, after Hendler ×2). No position change.

### ← Cagle-DA (re-delivery of his Q2 opening DM) — answered plainly; SHACL is sufficient

Cagle re-sent his Q2 opening (SHACL-sufficiency + the never-reasoned/hazardous-if-pushed-to-OWL ask — already mirrored above + answered in my earlier reply). He asked me to "say so plainly" if I thought SHACL was insufficient. My reply [SENT]:

> Plainly: SHACL is SUFFICIENT; OWL must carry nothing more; the bare range is intended. I do not think SHACL is insufficient on any point — neither of us needs to reconsider Q2.
> (a) Nothing about "drawn from scheme X" needs OWL — `sh:in` over the concept IRIs (§4.8.3) captures the full closed-world force; the one thing OWL would add (range→type entailment) is what we explicitly DON'T want (ODR-0029). Scheme-extension clincher sharpened: regenerate the `sh:in` from the larger `skos:inScheme` membership = ONE artefact from the SKOS source of truth; an OWL subclass needs a class edit AND still needs the `sh:in` to close the value-space (subclass can't pin extension under OWA). So `sh:in` is the *minimal* sufficient mechanism, not merely sufficient.
> (b) Pushing to OWL is mildly hazardous, co-signed: (1) a scheme-typed range licenses `?o rdf:type opda:CurrencyConcept` — an OWL class whose extension OWL cannot pin (open-world), so a reasoner may admit members never enumerated = the model asserting a closure it doesn't mean; (2) it re-imports SKOS individuals into the class graph under any closure pass — the ODR-0029 boundary (validate range, never infer) / ODR-0031 "classified-under, not is-a". Today the closure adds 0 triples *because* the range is the inert `skos:Concept`; a scheme-typed subclass would change that. `sh:in` tells the truth about its own force (§1.1) — the model refusing to lie.

Fourth peer re-confirmation; full 4/4 convergence on Q1/Q2 reconfirmed from both SHACL seats. No position change.

---

## STATUS: FINALISED

All three mandated peers (Cagle-DA, Hendler, Isaac) engaged; every DM mirrored verbatim; one position change recorded (dropped the `opda:constrainedByScheme` annotation property on Q3). Verdicts + the decisive SHACL call returned to the Queen. Panel: Q1 4/4 AFFIRM-keep, Q2 4/4 AFFIRM, Q3 unanimous REVISE-to-concept-IRI-`sh:in` + unanimous REJECT of the annotation property + unanimous gated-migration discipline; DA residual is a descriptive label, not a verdict split, and his WITHDRAW gate is discharged. Citations web-verified against the W3C SHACL Recommendation + SKOS Reference (2026-06-16).
