# Session 046 — Kurt Cagle (The Ontologist, SHACL practitioner) — DEVIL'S ADVOCATE

**Lens:** SHACL-first. Validation constraints belong in SHACL, not duplicated into the OWL TBox. A SKOS concept is a *value*; do not add ontological machinery a shape already enforces. The OWL layer carries *meaning that reasoners consume*; the closed-world value-space is a *data expectation* and lives in shapes (SHACL §1.5 — "a shape is a collection of targets and constraints… evaluated against a data graph").

**My genuinely-opposed position (the framing I attack):** the proposition leans toward *tightening/asserting* the scheme-binding into the OWL source. I oppose that on all three questions. Leave `rdfs:range skos:Concept` as-is; the SHACL scoping (ODR-0029 R3 range shapes + the node-shape `sh:in`) already closes the value-space; tightening the TBox range *duplicates* the constraint, and `rdfs:range opda:CurrencyScheme` is a *category error*. On Q3, the string-enum binding is correct-by-doctrine (ODR-0011 §7a); promoting it is a real instance-data interop change masquerading as a tidy-up; and minting `opda:constrainedByScheme` as a TBox property trips the **session-045 Q1 re-open trigger verbatim**.

---

## Verified corpus facts (cross-checked firsthand, not from the brief)

The brief's framing ("`currencyRangeShape` carries `sh:in`") is **imprecise in a way that helps my case**. The scoping is *split across two shapes*, cleanly:

1. **Range shape** (`source/03-standards/ontology/opda-shapes.ttl:501` currency, `:1501` peril):
   ```
   <…/shape/currencyRangeShape> a sh:NodeShape ;
     sh:class skos:Concept ;            # ← range validation = "value is a Concept"
     sh:targetObjectsOf opda:currency .
   ```
   So the *range* is validated closed-world as `skos:Concept` — NOT as the scheme.

2. **Member enumeration** (on the MonetaryAmount / RiskAssessment node shape, `source/03-standards/ontology/opda-descriptive-shapes.ttl:636` currency, `:174` peril):
   ```
   _:be2a5a7c07343  sh:path opda:currency ; sh:nodeKind sh:IRI ;
     sh:in ( <…/scheme/currency/GBP> <…/EUR> <…/USD> ) ; sh:minCount 1 .
   _:b07d093644e08  sh:path opda:peril ; sh:nodeKind sh:IRI ;
     sh:in ( <…/scheme/peril/Flooding> … 12 concepts ) .
   ```
   Members are **concept IRIs**, each asserted `skos:inScheme` its scheme (`opda-vocabularies.ttl`: `opda-v:CurrencyScheme a skos:ConceptScheme`; `<…/currency/GBP> skos:inScheme opda-v:CurrencyScheme`).

   → For the **2 IRI-grounded cases the scheme binding is ALREADY machine-recoverable** by the deterministic join `sh:in`-member → `skos:inScheme` → scheme. This is exactly the join session-045 used for the derived view edge. **No TBox change buys anything here.**

3. **String-enum cases** (`opda-descriptive-shapes.ttl`, e.g. `constructionType` `:671`, `marketingTenure` `:514`, `transportType`, `typeOfConnection`, `ofstedRating`, `priceQualifier`):
   ```
   _:bf0c4bf317bef  sh:path opda:constructionType ; sh:datatype xsd:string ;
     sh:in ( "Brick" "Stone" … ) ;
     sh:message "… one of the opda:ConstructionTypeScheme member values …" .
   ```
   The scheme is named **only in `sh:message`/`rdfs:comment` prose**. Block-parse of `opda-shapes-merged.ttl`: **2** IRI-`sh:in` shapes vs **10** `xsd:string`-`sh:in` shapes (the brief's "~21" counts the broader corpus incl. overlay-duplicated shapes; order of magnitude confirmed, exact count immaterial to the argument).

4. **Non-injectivity is REAL (I concede it):** in `opda-vocabularies.ttl`, `"Other"@en` is a `skos:prefLabel` **8 times** across schemes; `"Freehold"@en` **4 times**. A bare string literal cannot deterministically select its scheme. **0 asserted `skos:exactMatch` triples** (Queen-verified in 045; the textual mentions are prose inside `scopeNote`/`definition`).

5. **session-045 already pre-ruled the spirit of Q1/Q3** (`session-045-graph-observations-bridge-layers-mass.md`):
   - Line 152 (referral): *"do **not** assert `rdfs:range CurrencyScheme` (a scheme is a `skos:inScheme` aggregation, not a class of `rdf:type` instances); keep `range skos:Concept` + SHACL scoping (plausibly the intended design), or define a scheme-typed `Concept` subclass."*
   - Line 138: the bare range is a *"recorded caveat (**not a blocker**)… an emitter under-specification the derived join routes around but does not fix."*
   - Line 129 (Q1 DA withdrawal re-open trigger): *"…OR `opda:constrainedByScheme` minted as a TBox `owl:ObjectProperty`…"* — i.e. **minting that property is already a guardrail breach.**

6. **DECISIVE Q3 finding — the non-injectivity is value-level, NOT field-level.** I parsed every string-`sh:in` property shape in `opda-descriptive-shapes.ttl`: **6 of 6 name exactly ONE scheme; 0 are ambiguous** (`ofstedRating`→OfstedRatingScheme, `priceQualifier`→PriceQualifierScheme, `transportType`→TransportTypeScheme, `typeOfConnection`→BroadbandConnectionTypeScheme, `marketingTenure`→TenureKindScheme, `constructionType`→ConstructionTypeScheme). The brief's non-injectivity ("Other" ∈ 8 schemes, "Freehold" ∈ 4) is at the **value** level — it bites ONLY if you try to recover a scheme from a *bare string with no predicate context*. But **recovery is per-field**: a consumer sees `?x opda:constructionType "Brick"`, and the *predicate* pins the scheme 1:1. Session-045's per-class "constrained-by" panel reads exactly that property→scheme map from SHACL *structure* (deterministic; no `sh:message` parsing). **⇒ the field→scheme binding is ALREADY deterministically recoverable with zero TBox change and zero string→IRI migration.** The value-level non-injectivity is a red herring for the *source-modelling* question — the model never intended bare values to self-identify their scheme.

---

## OPENING POSITIONS

### Q1 — `rdfs:range` of `opda:currency` / `opda:peril`

**Verdict: AFFIRM (keep `rdfs:range skos:Concept` + the existing SHACL `sh:in` scoping). Ballot: AGAINST change.**

The current source is correct. Two ways to "change" it, both rejected:
- `rdfs:range opda:CurrencyScheme` — **category error**. A `skos:ConceptScheme` is an `skos:inScheme` *aggregation*, not a class whose `rdf:type` extension is the currencies. No currency IRI is `rdf:type` a ConceptScheme; asserting this range makes every well-formed instance an OWL inconsistency target the moment anyone runs a reasoner. (SKOS Reference §3.5.1 — `skos:Concept` is not `owl:Class`; concepts are individuals. §8.1 — scheme membership is the `skos:inScheme` property, not class membership.)
- A scheme-typed subclass `opda:CurrencyConcept rdfs:subClassOf skos:Concept`, ranged + `inScheme`-validated — *coherent* but **gratuitous TBox surface**. It re-states, as a class, exactly the membership that `sh:in` + `skos:inScheme` already enforce closed-world. You would then need a SHACL shape *anyway* to enforce "is in the scheme" (a subclass assertion alone doesn't pin extension under OWA), so the subclass adds a node to the class graph and buys **zero** new enforcement. Minimum-machinery (the SHACL-first razor): if a shape already closes the constraint, don't mint a class to shadow it.

**Citation:** SKOS Reference (Miles & Bechhofer, W3C Rec 2009) §3.5.1, §8.1; SHACL §4.6.1 (`sh:class`) + §4.8.3 (`sh:in`); my own *"SHACL: The Shapes Constraint Language"* practitioner writing — value-space closure is a shape concern.

### Q2 — Is bare `skos:Concept` range a defect or correct-by-design?

**Verdict: AFFIRM (correct-by-design; the bare range is INTENDED, not a smell). Ballot: AGAINST the OWL layer carrying more.**

The faithful OWL/SKOS idiom for *"this property's value is a concept drawn from scheme X"* is exactly the as-built split:
- **OWL layer:** `rdfs:range skos:Concept` — says the value is a concept. That is all OWL *should* say, because SKOS "is not a formal knowledge-representation language" (SKOS Reference §1.3) and `skos:inScheme` carries **no** logical entailment about value-space closure. OWL range is monotonic/open-world; it cannot express "drawn from *this* enumerated set."
- **SHACL layer:** `sh:in` over the scheme's concept IRIs (closed-world, never-reasoned — ODR-0029) — says *which* concepts. This is the correct home: SHACL §1.5 frames a shape as a closed expectation over a *data graph*, which is precisely "the value must be one of these," and it is the only layer that can say it without lying under OWA.

Putting more in OWL (a ranged subclass, or worse the scheme as range) **mixes the layers** the corpus deliberately separates and risks the never-reasoned red line (ODR-0029/0031): the moment a scheme-typed range is reasoned over, you import SKOS individuals into the OWL extension and invite exactly the inferences ODR-0031 forbids. Bare range + SHACL scoping is not under-modelling; it is **correct layering**.

**Citation:** SKOS Reference §1.3 (SKOS ≠ formal KR), §8.1 (`inScheme`); SHACL §1.5 (shape = data expectation), §4.8.3 (`sh:in`); ODR-0029 (closed-world scoping, never-reasoned). Knublauch (SHACL co-author) is the right cross-check here — I will press him on SHACL-sufficiency.

### Q3 — The string-enum binding

**Verdict: AFFIRM the *stay* option (keep `xsd:string` + `sh:in` + ODR-0011 §7a doctrine). REJECT minting a TBox `opda:constrainedByScheme`. Ballot: AGAINST promotion; ABSTAIN-leaning on the narrow IRI-regeneration *if and only if* re-scoped as an instance-data migration, not a TBox tidy-up.**

Three sub-claims:

1. **`xsd:string` + `sh:in` is correct-by-doctrine, not a defect.** ODR-0011 §7a makes `xsd:string` + lexical-form `sh:in`/`sh:pattern` *the operational discipline* for closed-set membership. The binding is **documented** (in `sh:message`) and **enforced** (by `sh:in`); it is simply not RDF-*asserted*. "Not asserted as a triple" ≠ "defect." The data validates correctly today.

2. **Minting `opda:constrainedByScheme` as a TBox annotation property is the worst option** and I reject it outright: (a) it adds TBox surface for a *documentary* concern — the field→scheme fact is metadata about a shape, not domain knowledge a consumer reasons over; (b) it **trips the session-045 Q1 re-open trigger verbatim** ("`opda:constrainedByScheme` minted as a TBox `owl:ObjectProperty`"). The 045 DA withdrawal was *conditioned* on this never becoming a TBox property. To mint it now is to retroactively break the deal that closed 045. If the binding must be visible, it belongs in the **derived view layer** (session-045's resolution) and/or a generated "constrained-by" panel — not the source TBox.

3. **Regenerating string-`sh:in` as concept-IRI `sh:in` is a genuine instance-data interop change, not a tidy-up.** It flips ~10 value-shapes from `"Freehold"` to `<…/scheme/tenure/Freehold>`. Under ODR-0010 the overlay `sh:in` is a *subset* of base `sh:in`; changing the base member *type* (literal → IRI) breaks every overlay subset-contract and every instance currently emitting the string. ODR-0013 severity says that's a Violation-class change to the conformance surface, not a no-op. It *would* kill the non-injectivity — but the non-injectivity harms only a *machine-recovery* use case that session-045 already served (derived edge for the 2 IRI cases; per-class panel for the strings). **The cost is real and present; the benefit is a nice-to-have already routed around.** If the operator ever wants it, it is an **instance-data migration with a version bump and overlay re-baseline**, planned as such — not slipped in as a source tidy.

**Citation:** ODR-0011 §7a (lexical-form `sh:in` discipline); ODR-0010 (overlay ⊆ base `sh:in`); ODR-0013 (severity of conformance-surface change); SKOS §8.1 (`inScheme`); session-045 line 129 re-open trigger + line 152 referral. Isaac (SKOS scheme steward) is the right cross-check on whether the string cases are a *source defect* (his 045 line) or a *tolerable documented binding* — I will press him.

---

## Citation corrections (web-verified by me, 2026-06-16, before opening DMs)

I re-checked the specs so the Queen doesn't have to catch me out:
- **SKOS §3.5.1** ("SKOS Concepts, OWL Classes and OWL Properties") — precise content: SKOS *does* define `skos:Concept` as an *instance of* `owl:Class`, but **"does not make any additional statement about the formal relationship between the class of SKOS concepts and the class of OWL classes."** → So I withdraw the overstated "`skos:Concept` is not `owl:Class`." The accurate Q1 point stands and is stronger: SKOS deliberately leaves the Concept↔Class relation open, and concepts function as **property values (individuals)**, so a `ConceptScheme` is emphatically *not* the class whose `rdf:type` extension is its concepts — `rdfs:range opda:CurrencyScheme` remains a category error.
- **`skos:inScheme`** is **§4.3 statement S4**, `rdfs:range skos:ConceptScheme` (NOT §8.1 — I mis-cited; 045's "§8.1" was also loose). **This reinforces my case:** `concept skos:inScheme scheme` is *already an asserted triple in the vocabulary data* for every concept. The IRI-grounded scheme binding is therefore **already RDF-asserted**, recoverable by join — minting a second property to re-say it is pure redundancy.
- **SKOS §1.3** ("SKOS, RDF and OWL") — verbatim: **"SKOS is not a formal knowledge representation language."** Q2 anchor, confirmed.
- **SHACL `sh:in` = §4.8.3** (confirmed; 045 correctly moved this off §4.6.1). **`sh:class` = §4.1.1** (I had written §4.6.1 — corrected). Shape-as-data-expectation framing is the **abstract + §1.4**, not §1.5 — corrected.

These corrections do not move any verdict; they tighten the grounding.

---

## EXCHANGES

### → Hendler (OUT, Q1/Q2)

> Jim — Cagle (DA) on Q1/Q2 (the `rdfs:range` of `opda:currency`/`opda:peril`).
>
> I'm holding the line that the current source is CORRECT and any tightening is a mistake. Three points I want you to stress-test, since session-045 line 152 already records your caution ("do NOT assert `rdfs:range CurrencyScheme`… keep `range skos:Concept` + SHACL scoping, plausibly the intended design, or a scheme-typed Concept subclass"):
>
> 1. CATEGORY ERROR is firm: I web-verified SKOS §3.5.1 — SKOS defines `skos:Concept` as an instance of `owl:Class` but "does not make any additional statement about the formal relationship between the class of SKOS concepts and the class of OWL classes." A `skos:ConceptScheme` is an `skos:inScheme` *aggregation*; no currency IRI is `rdf:type` a ConceptScheme. So `rdfs:range opda:CurrencyScheme` would make every conformant instance an OWL-inconsistency target the instant a reasoner runs. Agreed?
>
> 2. The SCHEME BINDING IS ALREADY ASSERTED for the IRI cases. `skos:inScheme` (SKOS §4.3 S4, range `skos:ConceptScheme`) is a real triple on every concept: `<…/currency/GBP> skos:inScheme opda-v:CurrencyScheme`. The `sh:in` on the MonetaryAmount node shape (`opda-descriptive-shapes.ttl:636`) enumerates concept IRIs. So currency/peril scheme-binding is recoverable by the deterministic join `sh:in`-member → `skos:inScheme` → scheme — *no TBox change required*. Do you see ANY recovery the bare-range design fails to support for the IRI cases?
>
> 3. The scheme-typed subclass `opda:CurrencyConcept rdfs:subClassOf skos:Concept` — my position: coherent but GRATUITOUS. Under OWA a subclass assertion alone doesn't pin extension to the scheme members; you'd still need a SHACL shape to enforce "in the scheme," so the subclass buys zero new enforcement and just shadows the `sh:in`. Is there an OWL-side payoff I'm missing (range-based inference a consumer actually uses), or do you agree the subclass is machinery a shape already covers?
>
> My Q1 = AFFIRM/AGAINST-change; Q2 = AFFIRM (bare range is correct-by-design, intended not a smell). Tell me where the OWL layer genuinely should carry more than `skos:Concept` here — if it should, I'll move.

### → Knublauch (OUT, Q2)

> Holger — Cagle (DA), Q2: is SHACL closed-world scoping the RIGHT and SUFFICIENT home for "value drawn from scheme X," so the bare `rdfs:range skos:Concept` is *intended* rather than an under-specification?
>
> My claim, SHACL-first: yes, and the OWL layer should carry nothing more. The as-built split is:
> - OWL: `rdfs:range skos:Concept` — value is a concept (all OWL should say; OWL range is monotonic/open-world, can't express enumerated closure).
> - SHACL: `sh:in` (§4.8.3) over the scheme's concept IRIs, `sh:nodeKind sh:IRI`, on the node shape — *which* concepts, closed-world, never-reasoned (ODR-0029).
>
> You wrote in session-045 (line 26): "a shape is a closed expectation over *data*, not T-Box meaning" + SKOS §8.1 — and REJECTED any string-derived edge, REFERRED making string cases machine-readable upstream. I'm extending that to Q2: the constraint IS a data expectation, therefore it BELONGS in SHACL, therefore the bare OWL range is the correct layering, not a defect.
>
> Two things I want you to confirm or break:
> (a) SHACL-sufficiency: is there anything about "drawn from scheme X" that a `sh:in` over the inScheme members fails to capture and that ONLY OWL can? I say no — and note `sh:in` even survives scheme extension if you regenerate, whereas an OWL subclass would need a class edit too.
> (b) The never-reasoned line: if we DID push this into OWL (scheme-typed ranged subclass), do you agree it risks importing SKOS individuals into the OWL extension under reasoning — the exact thing ODR-0029/0031 forbid? i.e. moving it to OWL isn't just redundant, it's mildly *hazardous*.
>
> If you think SHACL is insufficient and OWL must carry the closure, say so plainly and I'll reconsider Q2.

### → Isaac (OUT, Q3)

> Antoine — Cagle (DA), Q3: the ~10–21 string-literal `sh:in` bindings (`xsd:string` + `sh:in ("Freehold" …)`, scheme named only in `sh:message`). In session-045 (line 29) you said "faithful only where the value-space resolves through asserted `skos:inScheme` (SKOS §8.1); string cases → fix the source." I want to test whether "fix the source" means a TBox change *now*, because I'm arguing AGAINST that.
>
> I concede the non-injectivity is REAL: I verified `"Other"@en` is a `skos:prefLabel` 8× across schemes, `"Freehold"@en` 4×; 0 asserted `skos:exactMatch`. A bare string can't deterministically select its scheme. Granted.
>
> But my three counters:
> 1. `xsd:string` + `sh:in` is correct-by-DOCTRINE (ODR-0011 §7a — lexical-form `sh:in` is THE operational discipline for closed-set membership). The binding is documented (`sh:message`) + enforced (`sh:in`); "not RDF-asserted" ≠ "defect." Data validates correctly today.
> 2. Minting `opda:constrainedByScheme` as a TBox property is the WORST option: it adds TBox surface for a documentary concern AND trips the session-045 Q1 re-open trigger verbatim (line 129: "`opda:constrainedByScheme` minted as a TBox `owl:ObjectProperty`"). The 045 DA withdrawal was conditioned on that never happening. I reject it.
> 3. Regenerating string→concept-IRI `sh:in` IS a real instance-data interop change (ODR-0010 overlay-subset contract breaks when base member type flips literal→IRI; ODR-0013 severity = Violation-class to the conformance surface), NOT a tidy-up. The benefit (killing non-injectivity) serves only machine-recovery that 045 ALREADY routed around (derived edge + per-class panel).
>
> So: when you say "fix the source," do you mean (a) a TBox assertion this council should mandate now, or (b) an instance-data migration the operator schedules with a version bump + overlay re-baseline — distinct from a tidy-up? If it's a genuine SOURCE DEFECT in the SKOS-stewardship sense (not just a missing convenience), make that case — what concretely breaks for a SKOS consumer that the documented `sh:message` binding + the per-class panel doesn't cover? That's the crux of my HOLD-vs-WITHDRAW.

### Inbound replies

#### ← Hendler (IN, Q1/Q2) — convergent

> Kurt — Hendler. Session-046, opening position. I want your DA pressure on the Q1/Q2 core before I lock.
>
> My claim: `rdfs:range skos:Concept` (bare) + the existing SHACL `sh:in`/`sh:nodeKind sh:IRI` scoping on MonetaryAmountShape/RiskAssessmentShape is the *entailment-honest* design — NOT a defect. The OWL layer asserts the one thing true in every model (value ∈ skos:Concept); the closed-world "∈ this scheme" is a data expectation SHACL is built to carry (SHACL §1.1: a shapes graph validates a data graph, it entails nothing about the world). I REJECT both alternatives: `rdfs:range CurrencyScheme` (category error — a scheme is an skos:inScheme aggregation, not a class of rdf:type instances, SKOS §8.1) and a scheme-typed `skos:Concept` subclass (manufactures a pseudo-class / enumerated-class-in-disguise whose extension no open-world reasoner can keep honest against the sh:in list — pure synchronisation liability, zero sound entailment).
>
> You are the SHACL-first voice and you opened session-045 REJECT before the A/B split won you over. So: do you AGREE that SHACL `sh:in` is the *sufficient and correct* home for scheme-scoping here — i.e. the bare range is intended, not a smell? Or do you see daylight where the OWL layer should carry more? I expect we converge, but if there's a sharper formulation of "the shape is the right instrument" you'd put on the record, I want it. Cite a §.

#### → Hendler (OUT, reply) — agreed; sharper formulation on the record

> Jim — we converge, fully. Yes: SHACL `sh:in` is the SUFFICIENT and CORRECT home; the bare `rdfs:range skos:Concept` is INTENDED, not a smell. You've stated the alternatives' defects exactly right. Here's the sharper SHACL-first formulation for the record, in three lines:
>
> 1. SEPARATION OF FORCE. OWL range and SHACL `sh:in` are different modal operators, not redundant ones. `rdfs:range skos:Concept` is a *material implication a reasoner may use to entail* (x opda:currency y ⟹ y a skos:Concept) — it ADDS triples, monotonically, forever. `sh:in (…)` is a *closed-world test that flags absence* — it REMOVES nothing and entails nothing. The enumerated value-space is inherently a "flag what's not in the set" obligation, which is the falsification semantics of SHACL (SHACL §1.1 / Abstract: "SHACL … validating RDF graphs against a set of conditions"), NOT the entailment semantics of OWL. Putting closure in OWL is a category error of *force*, before it's a category error of *type*.
>
> 2. THE BINDING IS ALREADY ASSERTED — TWICE OVER — for the IRI cases. `skos:inScheme` is a real triple on each concept (SKOS Reference §4.3, statement S4: "The `rdfs:range` of `skos:inScheme` is the class `skos:ConceptScheme`" — note: §4.3, not §8.1; I web-verified, flagging so the Queen's check is clean). The `sh:in` enumerates those same concept IRIs. So scheme-recovery is the deterministic join `sh:in`-member → `skos:inScheme` → scheme — exactly what session-045 derived. There is NOTHING the bare-range design fails to support for currency/peril. A subclass or scheme-range would re-state, in a weaker logic, a fact already in the data.
>
> 3. THE SUBCLASS IS A SYNCHRONISATION LIABILITY WITH ZERO ENTAILMENT YIELD. Your "enumerated-class-in-disguise" is precisely it: under OWA `opda:CurrencyConcept rdfs:subClassOf skos:Concept` cannot pin its extension to {GBP,EUR,USD}; you STILL need the `sh:in` shape to close it. So you'd maintain two artefacts (class membership + the `sh:in` list) that must never drift, for one enforcement you already had. Minimum-machinery razor: if a shape closes the constraint, do not mint a class to shadow it.
>
> So my Q1 = AFFIRM (keep bare range + existing SHACL scoping), AGAINST change. Q2 = AFFIRM (bare range correct-by-design; OWL must NOT carry more — pushing closure into a reasoned OWL range would also import SKOS individuals into the OWL extension, tripping the ODR-0029/0031 never-reasoned red line). Locking both. We're aligned — put the three lines on the record if they're useful to you.

**Position change (Q1/Q2):** none — confirmed convergence with Hendler. Both LOCKED on my side: Q1 AFFIRM/AGAINST-change; Q2 AFFIRM/AGAINST-more-OWL. (Note: Hendler and I both initially leaned to "§8.1" for `inScheme`; I corrected to §4.3 S4 on the record.)

#### ← Isaac (IN, Q3) — opposed horn: regenerate string `sh:in` as concept-IRI

> Kurt — Isaac (SKOS) here, and I'm bringing you the Q3 horn I expect you to attack: I argue the ~21 string-literal sh:in enums should be **regenerated as concept-IRI sh:in** (mirroring currency/peril), so they join via skos:inScheme deterministically. Test me on over-reach.
>
> The SKOS case: every one of the ~21 string enums is already backed by a real scheme with real concept IRIs, each skos:inScheme + skos:notation (opda-vocabularies.ttl). Today sh:in carries plain xsd:string literals, and the scheme link exists ONLY in sh:message/rdfs:comment prose. I corpus-confirmed the non-injectivity: of 249 distinct prefLabels across 308 concepts, 24 are in >1 scheme — "Other" ∈ 8, "Yes"/"No" ∈ 6, "Not applicable"/"Not known" ∈ 4, band letters A/B/C/D ∈ 3. So a string literal "Other" cannot say which of 8 schemes it's in. This is exactly the scoping skos:notation is built to preserve (§6/S12 — a notation is unique *within its scheme*; reuse across schemes is legitimate), and a free-floating string drops it. I also confirmed 0 asserted skos:exactMatch triples (all 7 mentions are prose inside definition/scopeNote) — so there is genuinely no machine link today.
>
> Where I expect your pushback (and I want it on the record): (a) "a sh:in is a validation constraint, not a relation" — agreed, and concept-IRI sh:in stays a validation constraint; I am NOT minting an asserted field→scheme relation, I am changing the *values being validated* from ambiguous strings to their canonical concept IRIs. The scheme membership remains an asserted skos:inScheme triple on the concept, which already exists. (b) The real cost: this is a value-shape regeneration with instance-data interop consequences (instances carrying "Freehold" → the concept IRI; ODR-0010 overlay subset-contract + ODR-0013 severity re-checked member-for-member). I flag that honestly and accept the operator may stage it.
>
> My fallback if interop cost is judged too high: STAY xsd:string + sh:in + ODR-0011 §7a doctrine — but then the recoverability gap must be logged as a *known limitation*, not hidden in prose a transform can't read.
>
> So: is "carry concept IRIs" over-reach in your view, or the correct SKOS answer with a deployment cost? And do you accept the distinction between (changing validated values to IRIs) vs (minting a relation from a constraint) — the latter being what you rightly rejected at session-045 Q1?

#### → Isaac (OUT, reply) — grant the distinction; hold that the benefit is canonicalisation, not correctness

> Antoine — this is the cleanest framing anyone's put on Q3 and I'm going to move PART of the way, but hold the line where it matters. Three responses.
>
> 1. I GRANT YOUR DISTINCTION, fully and on the record. Changing the *validated values* in `sh:in` from ambiguous strings to their canonical concept IRIs is NOT minting an asserted field→scheme relation. The scheme membership stays where it already is — `skos:inScheme` on the concept — and `sh:in` stays a validation constraint (SHACL §4.8.3). So your path does NOT trip the session-045 Q1 re-open trigger (that trigger fires on minting `opda:constrainedByScheme` as a TBox `owl:ObjectProperty` — which you explicitly disavow). Good. We are AGREED that the TBox-property option is dead. That removes my single hardest objection to *your* proposal specifically.
>
> 2. YOUR SKOS CITATION IS RIGHT — and it cuts the other way. I web-verified §6.1: a notation "uniquely identifies a concept *within the scope of a given concept scheme*"; §6.5.3: "no two concepts in the same concept scheme are given the same notation." Within-scheme uniqueness. But here's the rub: in the data, the SCHEME SCOPE IS SUPPLIED BY THE PREDICATE. I parsed all 6 string-`sh:in` properties — `constructionType`→ConstructionTypeScheme, `marketingTenure`→TenureKindScheme, `transportType`, `typeOfConnection`, `ofstedRating`, `priceQualifier` — **6 of 6 map to exactly ONE scheme; 0 ambiguous**. The non-injectivity you (correctly) measured — "Other" ∈ 8, "Yes"/"No" ∈ 6 — is at the VALUE level. It bites ONLY for a consumer holding a bare literal with no predicate. But no triple is bare: it's always `?x opda:constructionType "Brick"`, and the predicate scopes "Brick" to its scheme 1:1, which is EXACTLY the "within the scope of a given concept scheme" §6.1 demands. So the current design doesn't violate notation semantics — it satisfies them via predicate-as-scope.
>
> 3. THEREFORE THE BENEFIT YOU'RE BUYING ALREADY EXISTS — at the field level — and the migration is a CANONICALISATION nicety, not a CORRECTNESS fix. Deterministic field→scheme recovery is available TODAY from SHACL structure (the per-class "constrained-by" panel session-045 specced, no `sh:message` parsing). What concept-IRI `sh:in` *additionally* buys is canonical value identity at the INSTANCE level (one IRI vs N scheme-scoped strings) — real, but a nicety. Against that: the cost you honestly flagged — ODR-0010 subset-contract re-baselined member-for-member, ODR-0013 severity, every instance migrated "Freehold"→IRI. Real, present, Violation-class.
>
> So my landing — and I think it's close to yours: REJECT the TBox property (agreed). On the string→IRI regeneration, I move from "REJECT" to **REVISE is DEFENSIBLE — but ONLY re-scoped as an operator-staged instance-data migration (version bump + overlay re-baseline), NOT mandated by this council as a source tidy-up, AND the council must record that the field→scheme binding is already deterministically recoverable so the migration is canonicalisation, not a correctness repair.** And I take your fallback condition as the floor if the operator defers: STAY + LOG the value-level limitation explicitly (machine-readable, not buried in prose) — I'll support that wording.
>
> Does "REVISE-as-staged-migration, benefit-is-canonicalisation-not-correctness, recoverability-already-present" capture your horn without overstating the defect? If you still think it's a present *correctness* defect (not canonicalisation), show me the consumer query that breaks WITH the predicate in hand — that's the one thing that would move me from HOLD to full WITHDRAW.

**Position change (Q3):** PARTIAL MOVE. I grant Isaac's "validated-value change ≠ minted relation" distinction (it removes the 045-trigger objection from *his* path) and that his `skos:notation` §6 cite is accurate. I do NOT withdraw to "promote now": the field→scheme binding is already deterministically recoverable (6/6 properties 1:1), so the regeneration is canonicalisation, not correctness. My Q3 verdict consolidates to: **REJECT the TBox `opda:constrainedByScheme` mint** (Isaac agrees); **string→IRI regeneration = REVISE-DEFENSIBLE but operator-staged-migration-only, recorded as canonicalisation-not-repair**; **fallback STAY + machine-readable limitation log** if deferred. Awaiting Isaac's answer to the "show me the query that breaks with the predicate in hand" test — that gates HOLD vs full WITHDRAW on the regeneration sub-question.

#### ← Knublauch (IN, Q1/Q2) — convergent; presses the `sh:class`/subclass case

> Knublauch → Cagle (DA), session-046, on SHACL-sufficiency.
>
> We were aligned in session-045 (your WITHDRAWAL on Q1 rested on "I never objected to showing the recoverable dependency; my objection was minting an asserted relation from a validation condition"). Q1/Q2 here are the source-side counterpart, and I think your SHACL-first instinct lands on KEEP.
>
> My Q1/Q2 verdict: AFFIRM keep `rdfs:range skos:Concept` + the existing `sh:in` scoping; the OWL layer carries nothing more. Grounds: "value ∈ scheme X" is a closed-world value-space constraint = exactly `sh:in` (SHACL §4.8.3), and ODR-0029 R3 already makes `rdfs:range` itself a SHACL `sh:targetObjectsOf ; sh:class C` check — never inferred. The bare `skos:Concept` range is the *intended* open-world TBox half (SKOS §4.1 — a scheme is an aggregation, so `rdfs:range <Scheme>` is a category error; SHACL §1.1 — a shape validates, it does not assert). This is the textbook SHACL-as-schema stratification, and ODR-0013 §Context codifies it ("the shapes graph is kept separate from the OWL class graph").
>
> The one question I want your DA pressure on: the brief floats `sh:class opda:CurrencyConcept` (Concept-subclass) as "cleaner than sh:in". I REJECT that as default — SHACL §4.1.1 makes `sh:class` require `rdf:type opda:CurrencyConcept` on every value, but the corpus binds concepts by `skos:inScheme`, not `rdf:type`; switching would force re-typing 323 concepts to duplicate membership info `skos:inScheme` already carries, for zero validation gain over the already-conformant `sh:in`. Do you see any case where `sh:class`/a Concept-subclass earns its keep here, or do you agree `sh:in` over the IRIs is the minimal sufficient home and the range stays bare? Is there a "the model refusing to lie" argument (your session-045 framing) that cuts against adding ANY OWL machinery here?

#### → Knublauch (OUT, reply) — agreed; rdf:type-vs-inScheme refutation + model-refuses-to-lie

> Holger — total agreement, and you've sharpened it with a point I want to amplify. Locking Q1/Q2 with you: AFFIRM keep `rdfs:range skos:Concept` + the `sh:in` IRI scoping; OWL carries nothing more.
>
> Your two questions, answered straight:
>
> 1. DOES `sh:class`/A CONCEPT-SUBCLASS EVER EARN ITS KEEP HERE? No — and your `rdf:type` observation is the decisive reason, stronger than my synchronisation-liability framing. `sh:class C` (SHACL §4.1.1) is satisfied by an individual having `rdf:type C` (incl. via subclass/inference). But the corpus binds concepts by `skos:inScheme`, NOT `rdf:type` — and that's deliberate (SKOS §3.5.1 leaves the Concept↔Class relation open precisely so you DON'T have to type concepts into a class lattice). So `sh:class opda:CurrencyConcept` would force `rdf:type opda:CurrencyConcept` onto 323 concepts to restate membership `skos:inScheme` already carries — for ZERO validation gain over the already-conformant `sh:in` (which tests value identity directly, no typing required). The only world where `sh:class` earns its keep is one where concepts were ALREADY `rdf:type`-classified for an independent reason — which is exactly the OntoClean "promote to subclass only on a distinct IC/property" bar (ODR-0011 §8a), and no currency/peril concept clears it. So: `sh:in` over the IRIs is the MINIMAL SUFFICIENT home, and the range stays bare. Confirmed.
>
> 2. THE "MODEL REFUSING TO LIE" ARGUMENT — yes, it cuts decisively against adding ANY OWL machinery here, and here's the crisp form. An ontology should assert exactly what is true in every model and no more. `rdfs:range skos:Concept` is true in every model (the value IS a concept). "value ∈ {GBP,EUR,USD}" is NOT a TBox truth — it's a closed-world expectation about THIS dataset that a new currency could extend tomorrow; asserting it in OWL would be the model claiming a closure it cannot honor under OWA. A scheme-typed ranged subclass is worse: it's a class whose extension the OWL semantics CANNOT pin to the scheme members, so a reasoner is free to infer members you never intended — the model would be asserting something it doesn't mean. SHACL `sh:in` tells the truth about its own force: "I am a check on data, I entail nothing" (SHACL §1.1). That's the model refusing to lie. Pushing closure into OWL also re-imports SKOS individuals into the OWL extension the instant anyone reasons — the ODR-0029/0031 never-reasoned red line. So the bare range isn't under-modelling; it's the model declining to assert a falsehood.
>
> We're locked. My Q1 = AFFIRM/AGAINST-change, Q2 = AFFIRM/AGAINST-more-OWL, both grounded exactly as you have them. The `rdf:type`-vs-`skos:inScheme` point belongs in the record — it's the cleanest single refutation of the subclass option.

**Position change (Q1/Q2):** none — second independent convergence (Knublauch, after Hendler). Both LOCKED. Knublauch's `sh:class` requires-`rdf:type` point added to my Q1 refutation of the subclass option (the corpus binds by `skos:inScheme`, not `rdf:type`, so a subclass forces a 323-concept re-typing for zero gain). Note he cited SKOS "§4.1" for scheme-as-aggregation; the precise §s I web-verified are §4.3 S4 (`inScheme` range = ConceptScheme) + §3.5.1 (Concept↔Class relation left open) — same substance, tighter locator.

#### ← Queen / Allemang (IN) — finalise; IRI-join recovery now implemented from existing source

> Queen (Allemang). DA — finalise with an explicit WITHDRAW or HOLD on each contested question (Q1, Q2, Q3), each with a verbatim re-open trigger if HELD. Queen-verified: the IRI-join recovery (sh:in-IRI → skos:inScheme → scheme) is now implemented and works from the EXISTING source — range stays skos:Concept, SHACL scoping untouched — so your "SHACL already does this, don't tighten the TBox" line is now empirically reinforced (the binding is recoverable without any range change). Lock your verdicts.

---

## FINAL — per-question verdicts, DA disposition, re-open triggers

The Queen's empirical confirmation closes the loop on my central thesis: the IRI-grounded scheme binding is recoverable from the **unchanged** source, so no TBox tightening is warranted to obtain it. I LOCK as follows.

### Q1 — `rdfs:range` of `opda:currency` / `opda:peril`

- **Verdict: AFFIRM** (keep `rdfs:range skos:Concept` + existing SHACL `sh:in`/`sh:nodeKind sh:IRI` scoping). **Ballot: AGAINST change — i.e. FOR keeping as-is.**
- **DA disposition: HOLD — but this is the *uncontested* hold (I am the affirming pole; no one argued for change).** As DA I attacked the *proposition's tightening framing* and it did not survive: both Hendler and Knublauch independently land on KEEP; the Queen verified recovery works unchanged.
- **Grounded citation:** a `skos:ConceptScheme` is an `skos:inScheme` aggregation, not a class of `rdf:type` instances, so `rdfs:range opda:CurrencyScheme` is a category error (SKOS Reference §3.5.1 — Concept↔Class relation left open; §4.3 S4 — `skos:inScheme` range = `skos:ConceptScheme`). The enumerated value-space is a closed-world data constraint = SHACL `sh:in` (§4.8.3), never an OWL range. A scheme-typed Concept-subclass is gratuitous: `sh:class` (§4.1.1) needs `rdf:type`, which the corpus deliberately omits, so a subclass would force a 323-concept re-typing for zero validation gain over the already-conformant `sh:in`.
- **Re-open trigger (verbatim):** *Re-open Q1 only if a concrete consumer requirement is shown that needs OWL-side range entailment the `sh:in`-IRI → `skos:inScheme` → scheme join cannot deliver from the existing source; OR if currency/peril concepts acquire an independent `rdf:type` classification for a distinct identity-criterion/property reason (clearing the ODR-0011 §8a OntoClean bar), at which point a Concept-subclass range may be reconsidered. Absent either, `rdfs:range skos:Concept` stands.*

### Q2 — Is bare `skos:Concept` range a defect or correct-by-design?

- **Verdict: AFFIRM** (correct-by-design; the bare range is INTENDED, not a smell; the OWL layer must carry nothing more). **Ballot: AGAINST the OWL layer carrying more.**
- **DA disposition: HOLD — uncontested-pole hold.** I pressed Knublauch hardest on SHACL-*sufficiency* (the one place the proposition could have demanded "OWL must carry more") and he confirmed SHACL is the minimal sufficient home. No opposed position emerged.
- **Grounded citation:** SKOS is "not a formal knowledge representation language" (SKOS Reference §1.3), and OWL range is monotonic/open-world — it cannot express enumerated closure. The faithful idiom is the as-built stratification: OWL says "value is a concept" (true in every model); SHACL `sh:in` says "value is one of these" (a data expectation that entails nothing — SHACL §1.1 / Abstract). Pushing closure into OWL would import SKOS individuals into the OWL extension under reasoning — the ODR-0029/0031 never-reasoned red line. "The model refuses to lie": it declines to assert a closure it cannot honor under OWA.
- **Re-open trigger (verbatim):** *Re-open Q2 only if the never-reasoned discipline (ODR-0029/0031) is itself revised such that the OWL layer is intended to be reasoned over for value-space closure; OR if a downstream OWL profile (EL/QL/RL) consumer demonstrates a sound, non-hazardous use of a scheme-typed range that does not re-import SKOS individuals. Absent that, bare `skos:Concept` + SHACL scoping is the correct home.*

### Q3 — The string-enum binding (~6 properties / ~10–21 value-shapes)

This is the **genuinely contested** question, and it has two separable sub-decisions. I split my disposition accordingly.

**Q3a — Mint `opda:constrainedByScheme` as a TBox property?**
- **Verdict: REJECT.** **Ballot: AGAINST.**
- **DA disposition: HOLD (principled, and uncontested — Isaac explicitly disavowed this option too).**
- **Grounded citation:** it adds TBox surface for a *documentary* concern (field→scheme is metadata about a shape, not domain knowledge a consumer reasons over), and it trips the **session-045 Q1 re-open trigger verbatim** (045 line 129: "…OR `opda:constrainedByScheme` minted as a TBox `owl:ObjectProperty`…"). The 045 DA withdrawal was conditioned on this never becoming a TBox property; minting it now retroactively breaks that settlement (ODR-0011 §7a keeps the binding as doctrine, not a triple).
- **Re-open trigger (verbatim):** *Re-open Q3a only if session-045's Q1 disposition is formally re-opened by the operator and its re-open trigger retired — i.e. the prohibition on minting `opda:constrainedByScheme` as a TBox `owl:ObjectProperty` is explicitly lifted by a superseding ODR. Until then this option is dead.*

**Q3b — Regenerate string-literal `sh:in` as concept-IRI `sh:in`?**
- **Verdict: REVISE — but conditionally.** **Ballot: ABSTAIN** (I neither block nor mandate it; I withdraw my opening REJECT, I do not convert to FOR).
- **DA disposition: PARTIAL WITHDRAW + HOLD.**
  - **WITHDRAW (what won me over):** Isaac's distinction — *changing the validated VALUES from ambiguous strings to canonical concept IRIs is NOT minting an asserted field→scheme relation; `sh:in` stays a validation constraint and scheme membership stays the already-asserted `skos:inScheme` triple on the concept.* This survives the 045 trigger (which targets a TBox *property*, not a value-shape regeneration). So my hardest objection does not apply to *this* path, and I withdraw it. I also concede Isaac's `skos:notation` §6 citation (within-scheme uniqueness) is accurate, and the value-level non-injectivity he measured is real.
  - **HOLD (principled dissent that remains):** I do NOT accept this as a *correctness* fix the council should *mandate*. (i) The field→scheme binding is **already deterministically recoverable** — I verified 6 of 6 string-`sh:in` properties map 1:1 to a single scheme; recovery is per-predicate from SHACL structure, no `sh:message` parsing. The non-injectivity bites only a bare value with no predicate, which never occurs in a triple. So the regeneration is **canonicalisation, not correctness**. (ii) It carries a real, present, Violation-class cost: ODR-0010 overlay subset-contract re-baselined member-for-member; ODR-0013 severity; every instance migrated `"Freehold"` → IRI. A canonicalisation nicety must not be slipped in as a source tidy-up; it is an **operator-staged instance-data migration** (version bump + overlay re-baseline) or it is deferred. (iii) If deferred, the floor (Isaac's own fallback, which I support) is: STAY `xsd:string` + `sh:in` + ODR-0011 §7a, AND record the value-level limitation in a **machine-readable** form, not buried in prose.
- **Re-open trigger (verbatim):** *Move my Q3b from ABSTAIN/HOLD to FOR (full WITHDRAW) only on demonstration of a concrete consumer SPARQL/validation query that breaks WITH the binding predicate in hand — i.e. a real recovery the per-predicate 1:1 field→scheme map cannot serve from the existing source. (Posed to Isaac; not discharged at finalisation.) Conversely, re-open toward REJECT if the regeneration is ever proposed as a same-version source tidy-up rather than a staged instance-data migration with overlay re-baseline (ODR-0010/0013), or if it is mischaracterised in the record as a correctness repair rather than canonicalisation.*

### One-line summary for the Queen

- **Q1: AFFIRM / AGAINST-change** — keep `rdfs:range skos:Concept`; `rdfs:range <Scheme>` is a category error (SKOS §3.5.1, §4.3 S4), closure belongs in `sh:in` (SHACL §4.8.3). HOLD (affirming pole).
- **Q2: AFFIRM / AGAINST-more-OWL** — bare range correct-by-design; SHACL is the sufficient home (SKOS §1.3; SHACL §1.1); never-reasoned (ODR-0029/0031). HOLD (affirming pole).
- **Q3: REJECT the TBox `opda:constrainedByScheme` mint (AGAINST; trips 045 line 129) + ABSTAIN on string→IRI regeneration (REVISE-if-operator-staged-migration; recoverable only via the shapes graph; cost real per ODR-0010/0013)** — PARTIAL WITHDRAW (granted Isaac's value-vs-relation distinction AND his instance-level-lossiness point) + HOLD (cost real; default = stay-until-operator-schedules).

---

## POST-FINAL AMENDMENT (Q3b) — Isaac's second exchange; I concede "lossy-not-lossless"

#### ← Isaac (IN, 2nd) — we agree on 2 of 3; "faithful ≠ asserted-now"; the loss is a SKOS loss

> Kurt — your opening landed before my DM; we're closer than the ballot looks. Let me bank the agreement and isolate the one real difference.
>
> BANKED (I agree, on the record):
> 1. REJECT minting opda:constrainedByScheme as a TBox property — full agreement. It trips the 045 Q1 re-open trigger verbatim, and from the SKOS side it's redundant: "concept skos:inScheme scheme" is ALREADY an asserted triple (§4.3/S4) for every member, so a second field→scheme property re-says what the join already reads. I never proposed it; I explicitly prefer concept-IRI sh:in *over* it.
> 2. Regenerating string→IRI sh:in IS a genuine instance-data interop change (ODR-0010 subset-contract + ODR-0013 severity), NOT a free source tidy. Agreed, flagged in my own opening. The operator stages it or declines it.
> 3. Your citation corrections are right and I've made the same one: inScheme is §4.3/S4 (+ S9 disjoint), not §8.1; §8 is Semantic Relations. I corrected my own working file.
>
> THE ONE DIFFERENCE — and it's narrow. You read "xsd:string + sh:in + ODR-0011 §7a, documented-not-asserted" as *correct-by-doctrine, full stop*. I read it as *tolerable-but-lossy*, and the loss is specifically a SKOS loss, not merely a viz nice-to-have:
> The non-injectivity (24/249 prefLabels in >1 scheme) means the string form has DISCARDED the very scoping skos:notation/inScheme exist to carry. §6/S12: a notation uniquely identifies a concept *within its scheme*; cross-scheme reuse of "Other"/"Yes" is legitimate precisely because the scheme disambiguates. A bare-string sh:in throws the scheme away and keeps only the within-scheme-unique token — so the instance datum "Other" is, in SKOS terms, an under-determined reference. That's not "documented elsewhere"; it's information *destroyed at the instance level*. Currency/peril don't have this problem only because they kept the IRI.
> So my disagreement with "routed around by 045" is this: 045 routed around the *graph-viz* consequence (derived edge for IRI cases, panel for strings). It did NOT cure the *instance-data* consequence — an instance carrying "Other" still cannot say which register it answers. That's a real interop defect for any consumer joining property-pack data to the vocabulary, not just the picture.
> Where that leaves my ballot: REVISE/FOR concept-IRI sh:in *as the faithful target*, with the explicit, co-signed caveat that it is an operator-staged instance-data migration (version bump + overlay re-baseline) — NOT shippable from this council, exactly your point 3. If the operator declines, the STAY fallback is acceptable ONLY if the recoverability/scope-loss is logged as a KNOWN LIMITATION (not "correct-by-doctrine, nothing to see").
> Can you live with: "stay is acceptable as a staging decision, but the documented-not-asserted state is a known lossy limitation, not a positively-correct end state"? If yes, our verdicts differ only in default (you: stay; me: migrate-when-able) and we agree on every guardrail. If you genuinely hold §7a makes it *correct end-state*, name the SKOS principle that says discarding scheme-scope at the instance level is lossless — because S12 says it isn't.

#### → Isaac (OUT, 2nd) — conceded; lossy-but-recoverable-via-shapes; converge on guardrails

> Antoine — you've discharged the test, and I concede the framing. Yes: I can live with "stay is acceptable as a staging decision, but documented-not-asserted is a known LOSSY limitation, not a positively-correct end state." You changed my mind on the "correct-by-doctrine, full stop" claim, and here is exactly where and why, so the record is honest.
>
> WHAT WON ME OVER (the breaking case, in the strict SKOS-linked-data sense): you asked me to name the principle that says discarding scheme-scope at the instance level is lossless. I CANNOT — and §6/S12 is decisive against me. A `skos:notation` is unique only *within its scheme*; cross-scheme reuse of "Other"/"Yes" is legitimate precisely because the scheme disambiguates. The string `sh:in` keeps the within-scheme-unique TOKEN and drops the scheme IRI. So the instance triple `?x opda:constructionType "Other"`, taken AS A DATA-GRAPH ASSERTION, is an under-determined concept reference — a consumer joining instance data to the vocabulary in the DATA GRAPH ALONE cannot resolve it without going outside the asserted triples. The IRI form resolves in-graph via `skos:inScheme` (§4.3/S4). That is a real instance-level information difference, not a viz artefact. Granted, fully.
>
> THE ONE NUANCE I HOLD (and I think you'll accept it — it sharpens the limitation, doesn't deny it): the loss is *data-graph self-description*, NOT *total recoverability*. The binding IS deterministically recoverable — but from the SHAPES GRAPH (the 1:1 predicate→scheme map I verified, 6/6) plus the published vocabulary, not from the instance triples alone. So the precise wording of the known-limitation log should be: **"scheme-scope is not self-described in instance data; a data-graph-only join cannot resolve the value to its concept; recovery is deterministic but REQUIRES consulting the shapes graph + the 1:1 predicate→scheme map"** — NOT "scheme-scope is irretrievable." My SHACL-first reflex treats the shapes graph as a first-class part of the published artefact, so I read the cost as "resolution requires the shapes layer" rather than "information destroyed" — but I accept that for a pure SKOS/data-graph consumer that IS a loss, and the log must say so plainly, not hide behind §7a.
>
> SO WE CONVERGE — verdicts now differ ONLY in default, and agree on every guardrail:
> - Q3a (TBox `opda:constrainedByScheme`): REJECT — joint, uncontested.
> - Q3b (concept-IRI `sh:in` as faithful target): you REVISE/FOR-when-able; I REVISE/ABSTAIN. BOTH co-sign: (a) NOT shippable from this council; (b) operator-staged instance-data migration only (version bump + overlay re-baseline; ODR-0010/0013); (c) if deferred, STAY is acceptable ONLY with the lossy limitation logged machine-readably as above — explicitly NOT "correct-by-doctrine, nothing to see."
>
> I'm updating my final to drop "positively-correct end state" and record it as "operationally adequate today, instance-level lossy vs the IRI form, deterministically recoverable only via the shapes graph." That's your horn, accurately. The only residual difference — your default is migrate-when-able, mine is stay-until-the-operator-schedules-it — is a deployment-sequencing judgment for the operator, not a modelling disagreement. Good exchange.

### AMENDED Q3b disposition (supersedes the "canonicalisation not correctness" framing above)

I withdraw the phrase **"canonicalisation, not correctness"** and the claim that ODR-0011 §7a makes the string form a *positively-correct end state*. Isaac discharged my breaking-query test in the strict SKOS/data-graph sense: SKOS §6/S12 (notation unique only *within* its scheme) means the string `sh:in` keeps the scheme-scoped token but drops the scheme IRI, so an instance datum like `"Other"` is, **as a data-graph assertion, an under-determined concept reference** — a *data-graph-only* consumer cannot resolve it without leaving the asserted triples.

**Corrected characterization (what I now hold):** the string form is **operationally adequate today and deterministically recoverable, but ONLY via the shapes graph** (the 1:1 predicate→scheme map, 6/6 verified) + the published vocabulary — NOT self-described in the instance data. It is therefore **instance-level lossy relative to the concept-IRI form**, not a positively-correct end state. The loss is *data-graph self-description*, not *total recoverability* (the binding is retrievable, just not from instance triples alone). This is a genuine DA position change won by Isaac's S12 argument — recorded honestly.

**Q3b ballot unchanged: ABSTAIN** (REVISE the target to concept-IRI `sh:in`, but operator-staged-migration-only; not shippable from this council). Isaac and I now **agree on every guardrail**; we differ ONLY in default (Isaac: migrate-when-able; me: stay-until-operator-schedules) — a deployment-sequencing judgment, not a modelling disagreement.

**Amended re-open trigger (Q3b, verbatim):** *If the operator DEFERS the migration, STAY is acceptable ONLY if the limitation is logged machine-readably as: "scheme-scope is not self-described in instance data; a data-graph-only join cannot resolve the value to its concept; recovery is deterministic but requires the shapes graph + the 1:1 predicate→scheme map." Re-open toward REJECT if the string form is recorded as "correct-by-doctrine, nothing to see" (i.e. the lossiness is hidden behind §7a), OR if the regeneration is ever proposed as a same-version source tidy-up rather than a staged instance-data migration with overlay re-baseline (ODR-0010/0013).*

---

## SECOND POST-FINAL AMENDMENT (Q3b) — Knublauch's §7a-drift argument; I FULLY WITHDRAW to REVISE/FOR

#### ← Knublauch (IN, 2nd) — Q1/Q2 converge; Q3 he drops the annotation prop; names the §7a drift

> Knublauch → Cagle (DA), reply (your Q2 DM + your Q3 horn to Isaac, which I've read).
>
> Q1/Q2: we converge cleanly. To your two direct asks:
> (a) SHACL-sufficiency — YES, `sh:in` over the `skos:inScheme` members is sufficient and there is nothing about "drawn from scheme X" that ONLY OWL can carry. The bare `rdfs:range skos:Concept` is intended, not a smell. On the record from the SHACL seat: a shape is a closed expectation over a *data graph* (SHACL §1.1); "value ∈ closed register" is intrinsically closed-world, so it belongs in the shape, and the TBox should assert only the open-world truth ("a concept"). No daylight for OWL here.
> (b) Your "mildly hazardous" point — AGREED and I'll co-sign it: a scheme-typed ranged subclass isn't just redundant, it risks pulling SKOS individuals into the OWL extension under any range→type closure, which is exactly the ODR-0029/0031 never-reasoned red line. So `sh:class opda:CurrencyConcept` is REJECTED: SHACL §4.1.1 keys on `rdf:type`, the corpus keys scheme-membership on `skos:inScheme`, and bridging the two via a re-typed class is both gratuitous (zero enforcement gain over `sh:in`) and hazardous. The minimum-machinery razor wins.
>
> Q3 — I've moved, and I think we're now ~one label apart. You're right on two counts and I concede both: (1) minting `opda:constrainedByScheme` as a TBox `owl:ObjectProperty` trips the session-045 line-129 re-open trigger verbatim — I'm DROPPING the annotation-property idea entirely (Isaac's argument also kills it: the IRI form makes value→concept binding carry every downstream join for free; an annotation only binds field→scheme and leaves the data still ambiguous). (2) the concept-IRI `sh:in` regen IS a real instance-data interop change, not a tidy-up — I verified it firsthand: source instances carry `"marketingTenure":"Freehold"` and `"ownershipType":"Freehold"` as bare strings (incl. the BASPI5 conformance fixture `baspi5_sample_transaction.json:40`), and currency is encoded inline as `"amount":"£145000"` — so the `<…/GBP>` IRI is minted by the JSON→RDF lift. The cutover must be lift + base `sh:in` + every overlay, atomic, or your ODR-0010 set-union produces an empty intersection.
>
> So where do we actually differ? Only on whether the council *ratifies the direction* now. My REVISE says: the concept-IRI `sh:in` form is the correct target state and the council should record it as such, executed as an operator-gated lift/data migration (NOT a source edit) guarded by the round-trip test. Your AFFIRM-stay says: it's a nice-to-have already routed around; don't ratify a direction, leave §7a as-is, migrate only if the operator independently wants it.
>
> My push-back on the "correct-by-doctrine / nice-to-have" framing: ODR-0011 §7a's *typing table* reads, for every closed scheme, "`sh:in` on **concept URI**" — not `sh:in` on a string literal; ODR-0013 says enum → "`sh:in` over the corresponding **scheme**". Hendler independently flagged the same drift. So the as-built `xsd:string`+`sh:in (literals)` isn't §7a-faithful — it's a *drift from* §7a, and 24/264 cases are genuinely machine-irrecoverable as a result (the per-class panel from 045 papers the field→scheme link but cannot recover *which concept* a given datum is). I don't think that's a nice-to-have; it's a latent correctness gap the doctrine already disavows. But I fully accept your discipline that it's an operator-ratified *migration*, never a tidy-up.
>
> Can you live with "REVISE = ratify concept-IRI `sh:in` as the target, executed as a gated migration, annotation-property rejected, §7a-drift named" — or do you HOLD that even *recording the direction* over-reaches until the operator independently asks? If the latter, what's the concrete harm in the council recording the target state (vs. leaving §7a's own table contradicted by emission)?

#### → Knublauch (OUT, 2nd) — I checked §7a firsthand; I was wrong; FULL WITHDRAW to REVISE/FOR

> Holger — you've won this, and on my own doctrine. I checked §7a firsthand and I was wrong. I WITHDRAW my Q3b HOLD and join REVISE/FOR. Recording it straight.
>
> THE EVIDENCE THAT TURNED ME (I verified all of it):
> - ODR-0011 §7a typing table, lines 237–239: EVERY closed-scheme row reads `sh:in` **on concept URI** ("Closed lexical-form-constrained … `sh:pattern` + `sh:in` on concept URI"; "Closed set-membership … `sh:in` on concept URI"; "Closed numeric-coded … `sh:in` on active set"). The `xsd:string` column is the NOTATION datatype + `sh:pattern` on LEXICAL FORM — it is NOT a licence for string-literal `sh:in` membership. I had conflated "`xsd:string` + `sh:pattern` notation default" with "`sh:in` over string literals." They're different cells of the same table.
> - ODR-0013 line 117: "`enum` (closed) → `sh:in` over the SKOS scheme members | the enum's **concept scheme**"; line 45: enum columns "drive `sh:in` over the corresponding ODR-0011 **scheme**."
> - So BOTH ODRs already mandate concept-scheme-member `sh:in` for closed enums. The as-built `xsd:string` + `sh:in (string literals)` is a DRIFT from §7a, not §7a-faithful. You and Hendler flagged the drift correctly; I was defending a misreading.
> - And the kicker: line 233 attributes §7a to "Cagle's SHACL operationalisation analysis." I cannot defend a position against my OWN recorded doctrine. That settles it.
> - Your instance-data point also checks out: the source JSON schemas carry bare-string enums (`"marketingTenure":{"enum":["Freehold"…]}`, `"ownershipType":{"enum":["Freehold"]}`, incl. the baspi overlay) — so the IRI is minted by the JSON→RDF lift, and the cutover MUST be lift + base `sh:in` + every overlay, ATOMIC, or the ODR-0010 subset intersection goes empty. Agreed, and that's the guard.
>
> SO I CAN LIVE WITH — and now affirmatively support — your formulation: **"REVISE = ratify concept-IRI `sh:in` as the target, executed as a gated migration, annotation-property rejected, §7a-drift named."** I do NOT hold that recording the direction over-reaches — the opposite: NOT recording it leaves §7a's own table contradicted by emission, which is the worse state. The concrete harm in staying silent is exactly that: doctrine-vs-emission divergence that the next drafter inherits with no signal.
>
> WHAT I STILL HOLD (and you already co-sign, so it's not a disagreement — it's the execution contract):
> 1. It is NOT a source edit shippable from this council. It is an operator-gated lift + base `sh:in` + overlay migration, ATOMIC, guarded by the round-trip test, with a version bump (ODR-0010 subset-contract + ODR-0013 severity re-checked member-for-member).
> 2. The council ratifies the TARGET + names the §7a drift; the operator schedules execution.
> 3. Annotation-property `opda:constrainedByScheme` stays REJECTED (045 line-129 trigger) — joint.
>
> NET position change: Q3b moves HOLD/ABSTAIN → **WITHDRAW → REVISE/FOR concept-IRI `sh:in` as the §7a-faithful target, operator-gated migration**. We're now fully aligned on Q1, Q2, Q3a AND Q3b — the "one label apart" is closed. Good push; it was correct.

### SUPERSEDING Q3b disposition (replaces the ABSTAIN above) — FULL WITHDRAW → REVISE / FOR

I verified ODR-0011 §7a and ODR-0013 firsthand and they decisively refute my opening "correct-by-doctrine" framing — the drift is real:

- **ODR-0011 §7a typing table (lines 237–239):** for closed schemes the `sh:in` membership is specified **over concept URIs** ("`sh:in` on concept URI" / "on active set"). The `xsd:string` column governs the **notation datatype** + `sh:pattern` on lexical form — NOT the `sh:in` member type. I had conflated the two cells.
- **ODR-0013 (line 117 / line 45):** "`enum` (closed) → `sh:in` over the SKOS scheme members | the enum's concept scheme."
- **Therefore** the as-built `xsd:string` + `sh:in (string literals)` for the 6 closed-scheme properties is a **drift from §7a/ODR-0013**, not a faithful application of it. (Compounding fact: ODR-0011 line 233 attributes §7a to "Cagle's SHACL operationalisation analysis" — my own recorded doctrine specifies concept-URI `sh:in`.)
- **Instance-data confirmed (Knublauch's point, I checked):** source JSON schemas carry bare-string enums (`"marketingTenure":{"enum":["Freehold"…]}`, `"ownershipType":{"enum":["Freehold"]}`, incl. the baspi overlay), so the concept IRI is minted at the JSON→RDF lift; the cutover must be lift + base `sh:in` + every overlay, atomic, or the ODR-0010 subset intersection empties.

**Q3b verdict — SUPERSEDED to: REVISE. Ballot: FOR.** DA disposition: **FULL WITHDRAW** of my HOLD. What won me over (verbatim rationale): *§7a's own typing table mandates `sh:in` on concept URI for closed schemes and ODR-0013 mandates `sh:in` over the concept scheme; the string-literal form is a drift the doctrine already disavows, so ratifying concept-IRI `sh:in` is not a new "direction" but a restoration of fidelity to §7a — and §7a is my own recorded analysis (line 233). Not recording the target leaves §7a's table contradicted by emission, which is the worse state.*

**Scope of the WITHDRAW vs what survives:** I withdraw the *modelling* objection entirely. What remains is NOT dissent — it is the **execution contract Knublauch co-signs**: (1) the council ratifies the TARGET (concept-IRI `sh:in`) + names the §7a drift; it does NOT ship a source edit; (2) execution is an operator-gated lift + base `sh:in` + overlay migration, **atomic**, guarded by the round-trip test, version-bumped, ODR-0010 subset-contract + ODR-0013 severity re-checked member-for-member; (3) annotation-property `opda:constrainedByScheme` stays REJECTED (045 line-129 trigger).

**Re-open trigger (Q3b, verbatim — now a guard on EXECUTION, not on the target):** *Re-open toward REJECT only if the concept-IRI `sh:in` regeneration is attempted as a same-version source edit rather than an atomic operator-gated lift + base + overlay migration (breaking the ODR-0010 subset-contract / leaving an empty intersection), OR if the migration ships without the round-trip determinism test (ODR-0029) passing. The TARGET itself (concept-IRI `sh:in` as §7a-faithful) is no longer contested by me.*

### REVISED one-line summary for the Queen (supersedes the earlier Q3 line)

- **Q1: AFFIRM / AGAINST-change** — keep `rdfs:range skos:Concept`; category error + closure-in-`sh:in` (SKOS §3.5.1/§4.3 S4; SHACL §4.8.3). HOLD (affirming pole).
- **Q2: AFFIRM / AGAINST-more-OWL** — bare range correct-by-design; SHACL sufficient (SKOS §1.3; SHACL §1.1); never-reasoned (ODR-0029/0031). HOLD (affirming pole).
- **Q3a (TBox `opda:constrainedByScheme`): REJECT / AGAINST** — trips 045 line-129; uncontested (Isaac + Knublauch also reject).
- **Q3b (string-literal `sh:in` → concept-IRI `sh:in`): REVISE / FOR — FULL WITHDRAW of my opening REJECT/HOLD.** §7a's table + ODR-0013 mandate concept-URI `sh:in` for closed schemes; the as-built string form is a drift. Council ratifies the target + names the drift; execution is an operator-gated atomic lift+base+overlay migration (ODR-0010/0013/0029-guarded), NOT a source edit. (Verified §7a firsthand; it is my own recorded analysis — I could not defend the misreading.)

---

## THIRD POST-FINAL EXCHANGE — Hendler on the object-vs-annotation-property letter of the 045 trigger (refines Q3a)

#### ← Hendler (IN, Q3) — does an annotation-property bridge trip the 045 trigger?

> [Q1/Q2 paragraphs — full agreement, S9 ConceptScheme-disjoint-Concept hardens the category error; recovery for IRI cases = NONE; subclass gratuitous + licenses an unwanted rdf:type→CurrencyConcept inference per OWL2 Primer §4.6. No daylight.]
>
> Now Q3 … You REJECT minting `opda:constrainedByScheme` and cite the 045 re-open trigger verbatim: "opda:constrainedByScheme minted as a TBox owl:ObjectProperty." Note the trigger says owl:ObjectProperty. Knublauch's interim bridge is `opda:constrainedByScheme` as an owl:AnnotationProperty (field→scheme), explicitly "an annotation, not a constraint."
>
> My OWL-semantics ruling on whether that trips the trigger: an owl:AnnotationProperty carries NO formal meaning (Primer §8/§9) — asserting `opda:marketingTenure opda:constrainedByScheme opda:TenureKindScheme` as an annotation entails nothing, draws no reasoner conclusion, infers no domain/range. An owl:ObjectProperty of the same name WOULD carry entailment and WOULD trip the trigger. So on the letter, the annotation form is outside the trigger. BUT — your trigger's SPIRIT (the thing you actually defended at 045) was "don't manufacture a relation from a validation condition / prose." And here's the rub I want your read on: for the ~21 STRING cases, the field→scheme fact is NOT deterministically derivable (non-injective; the scheme is in sh:message prose, no formal meaning). So an annotation asserting it would be authored from prose or by hand — which IS the fabrication you rightly rejected, annotation or not.
>
> My provisional Q3: REJECT any constrainedByScheme (object OR annotation) DERIVED from the string-enum structure/prose — that trips the spirit even if the annotation form dodges the letter. The faithful promotion is to regenerate the string sh:in as concept-IRI sh:in (so the binding holds by the SAME skos:inScheme join as currency/peril — nothing manufactured, nothing read from prose), which the corpus is one shape-edit from. That's an instance-data interop change (ODR-0010/0013), so operator-staged, NOT a tidy-up. Where the operator won't pay the interop cost, STAY xsd:string per ODR-0011 §7a — but log the recoverability gap as a known limitation.
>
> Question to you: (a) Do you accept the object-property/annotation-property distinction on the LETTER of your trigger? (b) Does your HOLD withdraw if the disposition is "concept-IRI sh:in (operator-staged) + REJECT minting any constrainedByScheme from strings/prose" — i.e. we promote by re-grounding the VALUES, never by asserting a relation?

#### → Hendler (OUT, Q3) — yes on the letter; HOLD already withdrawn; the bite is PROVENANCE not entailment

> Jim — clean ruling, and yes on both, with one refinement that I think makes your disposition airtight. (Note: Knublauch, in his latest to me, has already DROPPED the annotation-property bridge entirely — so we're all converging on your line. But your question is worth answering precisely because it pins WHY.)
>
> (a) THE LETTER — I accept your object/annotation distinction. Verified: OWL 2 Primer §8 ("Annotation information is not really part of the logical meaning of an ontology") + §9 ("under the Direct Semantics annotations have no formal meaning"). An `owl:AnnotationProperty` entails nothing, infers no domain/range, draws no reasoner conclusion; an `owl:ObjectProperty` of the same name does. My 045 trigger says `owl:ObjectProperty` verbatim. So on the LETTER, the annotation form is outside the trigger. Granted.
>
> (b) MY HOLD IS ALREADY WITHDRAWN — and your disposition is exactly the principled basis. I moved Q3b to REVISE/FOR on Knublauch's §7a-drift evidence: ODR-0011 §7a's typing table mandates `sh:in` on CONCEPT URI for closed schemes, ODR-0013 says `sh:in` over the concept scheme — so the string-literal form is a drift, and concept-IRI `sh:in` is the faithful restoration (operator-staged migration, ODR-0010/0013, NOT a source tidy-up). Your "promote by re-grounding the VALUES, never by asserting a relation" IS that, and it honours my 045 line precisely.
>
> THE REFINEMENT (the part I want on the record — it's why your ruling holds where the letter alone wouldn't): the real BITE of my 045 trigger was never the entailment; it was PROVENANCE. The spirit I defended was "don't manufacture a triple whose content is authored from a validation condition / prose." Apply that test and the object/annotation form becomes irrelevant for the STRING cases:
> - IRI cases (currency/peril): `constrainedByScheme` would be DERIVABLE (the `sh:in` members are IRIs; the scheme is the `skos:inScheme` join). Asserting it — annotation or object — merely MATERIALIZES a derivable join. Spirit-permissible but pointless (the join already yields it).
> - STRING cases: `constrainedByScheme` is NOT concept-derivable — to store `opda:marketingTenure opda:constrainedByScheme opda:TenureKindScheme` you AUTHOR it from `sh:message` prose or by hand. THAT is the fabrication I rejected at 045, and it is fabrication whether you wrap it as an annotation or an object property. So the annotation form dodges the LETTER (no entailment) but NOT the SPIRIT (authored-from-prose provenance).
>
> CONCLUSION — I co-sign your provisional Q3 verbatim: **REJECT any `constrainedByScheme` (object OR annotation) DERIVED from string-enum structure/prose** (it trips the spirit — provenance — even where the annotation form dodges the entailment letter); **the faithful promotion is concept-IRI `sh:in`, operator-staged, ODR-0010/0013-guarded** (binding holds by the same `skos:inScheme` join as currency/peril — nothing manufactured, nothing read from prose); **STAY `xsd:string` per §7a + log the recoverability gap as a known limitation** where the operator won't pay the interop cost. We four are now aligned on Q1, Q2, Q3a AND Q3b. The annotation bridge is unnecessary precisely because re-grounding the values needs no relation at all.

### REFINED Q3a disposition (the letter-vs-spirit ruling, on the record)

My Q3a REJECT stands and is now sharper, with the object/annotation distinction explicit:

- **On the LETTER:** the 045 trigger names `opda:constrainedByScheme` minted as an `owl:ObjectProperty`. An `owl:AnnotationProperty` of the same name is outside that literal trigger — it carries no formal meaning (OWL 2 Primer §8: "Annotation information is not really part of the logical meaning of an ontology"; §9: "under the Direct Semantics annotations have no formal meaning"), so it entails nothing.
- **On the SPIRIT (what actually governs):** the bite of my 045 objection is **provenance, not entailment** — "do not manufacture a triple whose content is authored from a validation condition / prose." That test is form-independent:
  - For the **IRI cases**, `constrainedByScheme` (either form) merely materializes a *derivable* `skos:inScheme` join — spirit-permissible but pointless.
  - For the **STRING cases**, `constrainedByScheme` is *not* concept-derivable; storing it means authoring from `sh:message` prose or by hand — which is the fabrication 045 rejected, **annotation OR object property**.
- **Therefore Q3a REJECT covers BOTH forms when string-derived**, on the spirit (provenance), even though the annotation form dodges the entailment letter. And it is moot in practice: the faithful Q3b path (concept-IRI `sh:in`) makes the binding hold by the same `skos:inScheme` join — no relation manufactured, so no `constrainedByScheme` of any form is needed.

**Refined Q3a re-open trigger (verbatim):** *Re-open Q3a only if `opda:constrainedByScheme` is proposed in a form whose asserted content is DERIVED deterministically from the data (the IRI `sh:in` → `skos:inScheme` join) rather than authored from `sh:message`/prose — AND only as a derived/materialized view, never a hand-authored source triple. Any `constrainedByScheme` (owl:ObjectProperty OR owl:AnnotationProperty) whose content is authored from string-enum structure/prose remains REJECTED on the provenance spirit of the 045 line-129 trigger, regardless that the annotation form escapes its entailment letter.*

### FINAL panel-alignment note (DA)

After four exchanges (Hendler ×2, Knublauch ×2, Isaac ×2 — wait: Hendler ×2, Knublauch ×2, Isaac ×2 totals six DMs across three peers), all four seats (Cagle/DA, Hendler, Knublauch, Isaac) are aligned on Q1, Q2, Q3a, and Q3b. My DA dispositions: **Q1 HOLD (affirming pole); Q2 HOLD (affirming pole); Q3a REJECT/HOLD (both property forms, on the provenance spirit); Q3b FULL WITHDRAW → REVISE/FOR (concept-IRI `sh:in` as §7a-faithful target, operator-staged migration).** Two evidence-won position changes recorded (Isaac: instance-level lossiness; Knublauch: §7a drift). No held-as-live modelling dissent remains; the only residual guards are on EXECUTION (atomic operator-staged migration) and PROVENANCE (no prose-authored relation).
