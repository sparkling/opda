# Session 046 — Antoine Isaac (SKOS Reference co-editor) working file

**Seat / lens:** SKOS concept schemes; `skos:inScheme` membership; concepts are values/individuals, NOT OWL classes (SKOS and OWL layers held apart); SKOS↔OWL idioms; `skos:notation` role. Citations grounded in the SKOS Reference (W3C REC 2009) + the SKOS Primer.

---

## OPENING

### Corpus facts I independently verified (before forming positions)

1. **`opda:currency` / `opda:peril` are `owl:ObjectProperty` with `rdfs:range skos:Concept`** (bare) — `opda-descriptive.ttl:888-894` (currency), `:952-958` (peril). The `rdfs:comment` on each says "a dereferenceable opda:CurrencyScheme / opda:PerilScheme concept … NEVER an opaque string", i.e. the *scheme* intent is documented in prose but the asserted range is the generic `skos:Concept`.
2. **The two "RangeShapes" are pure type-checks, NOT scheme-scoping.** `currencyRangeShape` (`opda-shapes.ttl:501-507`) and `perilRangeShape` (`:1501-1507`) each say only `sh:class skos:Concept` + `sh:targetObjectsOf` — they restate the `rdfs:range` closed-world per ODR-0029 R3. They do **not** restrict to a scheme.
3. **The actual scheme-scoping lives on the property shapes *inside the node shapes*** (MonetaryAmount / RiskAssessment): a `sh:path opda:peril` shape with `sh:in (<…/peril/…> …)` + `sh:nodeKind sh:IRI` + `sh:maxCount 1` (`opda-descriptive-shapes.ttl:174-180`), and the MonetaryAmount `opda:currency` property shape `sh:in` the CurrencyScheme members + `sh:minCount 1` (`:639-642`). The `sh:in` members are concept IRIs, each asserted `skos:inScheme` its scheme. **So the binding is recoverable by the join `sh:in`-member → `skos:inScheme` → scheme** (session-045 case B).
4. **Non-injectivity of the string→scheme join — CORPUS-CONFIRMED.** Of **249 distinct prefLabels across 308 concepts, 24 appear in >1 scheme**: `"Other"` ∈ 8 schemes, `"Yes"`/`"No"` ∈ 6, `"Not applicable"`/`"Not known"` ∈ 4, `"Attached"`/`"To follow"`/`"None"` ∈ 3, band letters `"A"/"B"/"C"/"D"` ∈ 3 (EPC + council-tax E&W + Scotland). A bare string literal therefore **cannot deterministically select its scheme**.
5. **0 asserted `skos:exactMatch` triples.** All 7 `skos:exactMatch` mentions in `opda-vocabularies.ttl` are prose *inside* `skos:definition`/`skos:scopeNote` literals (lines 167, 170, 269, 314, 356, 359, 386); the one in `opda-property.ttl:699` is likewise prose in an `rdfs:comment`. Confirms session-045's retraction (Isaac was right) and the EVIDENCE.
6. **`skos:notation` present on all 308 concepts.** Every coded value already carries a typed notation literal that uniquely identifies it within its scheme.

### SKOS Reference sections I web-verified (2026-06-16, against https://www.w3.org/TR/skos-reference/)

- **§3.5.1 / S1** — `skos:Concept` is an instance of `owl:Class`; SKOS makes **no further statement** about the relationship between the class of SKOS concepts and the class of OWL classes. A resource MAY be **both** a `skos:Concept` and an `owl:Class` (Reference Example 3 `<MyConcept> rdf:type skos:Concept, owl:Class .` is explicitly *consistent*). → A scheme-typed `Concept` subclass is **not forbidden**.
- **§8.1 / S4 + S9** — `rdfs:range` of `skos:inScheme` is `skos:ConceptScheme` (S4); **`skos:ConceptScheme` is disjoint with `skos:Concept` (S9)**. A concept scheme is informally "an aggregation of one or more SKOS concepts" linked by `inScheme`. → A scheme is **not** a class whose `rdf:type` instances are its members; `rdfs:range opda:CurrencyScheme` is a category error (no value is `rdf:type` a ConceptScheme).
- **§6 / S12 + S15** — `skos:notation` is an `owl:DatatypeProperty` (S15) carrying a **typed literal** used to *uniquely identify* a concept (S12), distinct from `skos:prefLabel` (a natural-language plain literal with a language tag, S10–S11).

### Positions

**Q1 — `opda:currency`/`opda:peril` `rdfs:range`. → AFFIRM (keep `rdfs:range skos:Concept` + the SHACL `sh:in` scoping). Ballot: FOR.**

Keep the bare `skos:Concept` range. The faithful SKOS idiom for "the value is a concept drawn from scheme X" is **`rdfs:range skos:Concept` in the OWL layer + a closed-world `sh:in`-over-`skos:inScheme` constraint in SHACL** — which is exactly what the corpus already does (the node-shape property shapes, fact 3). `rdfs:range opda:CurrencyScheme` is barred by S9 (scheme ⊥ concept). The *alternative* the referral floats — a scheme-typed subclass `opda:CurrencyConcept rdfs:subClassOf skos:Concept` with all members `skos:inScheme CurrencyScheme` — is **not forbidden** by SKOS (§3.5.1/S1), but I judge it an **anti-pattern here**: it reifies a scheme's `inScheme` *membership aggregation* into an OWL *class extension*, creating a second, parallel "which scheme" axis (subclass) that duplicates the `skos:inScheme` axis the data already carries and that the join already reads. SKOS deliberately separates the membership layer (`inScheme`) from the formal-class layer precisely so that a vocabulary can be maintained as a value-space without minting a class per scheme. Two axes that must be kept in lock-step is a maintenance hazard and an OntoClean-style category blur (a value-space is not a universal). The bare range + SHACL scoping is the simplest faithful model and needs no source change.

**Q2 — Is bare-`skos:Concept` range a defect or correct-by-design? → AFFIRM (correct-by-design; the bare range is intended, not a smell). Ballot: FOR.**

Correct-by-design. This follows directly from Q1 and from the layering SKOS itself insists on. The OWL layer's job is to say the *kind of thing* the value is — "a SKOS concept" — and `skos:Concept` is the **most specific class SKOS gives you for a coded value** (there is no narrower OWL class that faithfully types "an ISO-4217 currency code as a value"; the narrower fact is *membership of a scheme*, and SKOS expresses membership with `skos:inScheme`, not with `rdf:type`). The *which-scheme* constraint is a closed-set value-space constraint — a SHACL concern (session-045 Q1 already settled, with my FOR, that the binding lives in `sh:in` + property-comment doctrine, and the never-reasoned discipline ODR-0029 keeps it closed-world). So SHACL closed-world scoping (range `skos:Concept` + `sh:in`-over-`inScheme`) **is** the right home; the OWL layer should **not** carry more. The one genuine under-specification session-045 flagged is cosmetic, not semantic: the two **RangeShapes** only type-check `skos:Concept` and do not themselves carry the `sh:in` (the `sh:in` is on the node-shape property shapes instead). That is a SHACL *placement* nicety, not an OWL-layer defect — I would note it but not act on it under Q2.

**Q3 — The string-enum binding. → REVISE (regenerate the ~21 string-literal `sh:in` enums as concept-IRI `sh:in`, so they join via `skos:inScheme` exactly like currency/peril). Ballot: FOR.**

From the SKOS side, **coded values should be carried as concept IRIs**, not bare strings. Every one of the ~21 string enums is *already* backed by a real SKOS scheme with real concept IRIs (`opda-vocabularies.ttl`), each `skos:inScheme` its scheme and each carrying a `skos:notation`. The current state asserts `sh:in ("Freehold" "Cable" …)` as **plain `xsd:string` literals** whose link to the scheme exists **only in `sh:message`/`rdfs:comment` prose** — and fact 4 proves that link is **non-injective and therefore unrecoverable** (a value `"Other"` cannot say which of 8 schemes it belongs to). This is the precise failure SKOS `skos:notation` is designed to avoid: a notation is scoped *within its scheme* (§6/S12), so two schemes may legitimately reuse the notation/label `"Other"` — a string literal floating free of its concept IRI **drops that scoping**. Regenerating to concept-IRI `sh:in` (mirroring currency/peril) restores the deterministic `inScheme` join, kills the ambiguity, and makes the binding a fact over triples that already exist rather than prose. I prefer **concept-IRI `sh:in` over a new `opda:constrainedByScheme` annotation property**: the IRI form binds the *value* to its concept (so every downstream join — `inScheme`, `notation`, `prefLabel`, `broader` if ever added — comes for free), whereas an annotation property binds only the *field* to the *scheme* and leaves the instance data still carrying ambiguous strings.

**I flag the cost honestly (Davis/Knublauch will press this):** this is a value-shape regeneration with **instance-data interop consequences** — instances currently carrying the string `"Freehold"` would need to carry the concept IRI `<…/scheme/tenure/Freehold>` (or be bridged), and the overlay `sh:in` ⊆ base `sh:in` subset-contract (ODR-0010) and severity (ODR-0013) must be re-checked member-for-member. That cost is real and may make the operator stage it. But it does not change the *faithful* SKOS answer, which is: carry concept IRIs. If the operator judges the interop cost too high for now, the honest fallback is **stay as `xsd:string` + `sh:in` + the ODR-0011 §7a doctrine, documented-not-asserted** — but then the machine-recoverability gap (fact 4) must be acknowledged as a *known limitation*, not papered over with prose that a transform cannot read.

### Cross-talk plan (≥1 peer per question; Queen named Hendler, Cagle-DA, Knublauch)

- **Hendler** — Q1/Q2: confirm the scheme-not-class idiom and that keeping bare `skos:Concept` + SHACL is the faithful OWL reading (he carried this caution into the session-045 referral).
- **Cagle (DA)** — Q3: string vs IRI; he is SHACL-first and will test whether "carry concept IRIs" is over-reach vs the interop cost / the documented-not-asserted fallback.
- **Knublauch** — Q3 + the Q2 SHACL-placement nicety: `sh:in` over concept IRIs as the right mechanism; whether the RangeShape vs node-shape `sh:in` placement is worth noting.

---

## CITATION CORRECTION (self-caught, web-verified 2026-06-16)

My OPENING wrote "§8.1 inScheme" (carrying the EVIDENCE brief's own loose label). **Corrected:** `skos:inScheme` and `skos:ConceptScheme` are defined in **§4 "Concept Schemes", §4.3 "Class & Property Definitions"** — statement **S4** (`rdfs:range` of `skos:inScheme` is `skos:ConceptScheme`) and **S9** (`skos:ConceptScheme` is disjoint with `skos:Concept`). SKOS **§8 is "Semantic Relations"** (`broader`/`narrower`), NOT scheme membership. Cagle independently caught the same loose "§8.1". The *substance* (S4 range, S9 disjointness) is unchanged and load-bearing for Q1/Q2/Q3; only the section pointer is fixed. §3.5.1 (concept↔owl:Class left open; S1) and §6 (`skos:notation`; S12/S15) verified correct as cited.

---

## EXCHANGES

(verbatim DMs + position changes recorded below as they happen)

### → Hendler (sent) — Q1/Q2 scheme-not-class idiom

> Jim — Isaac (SKOS) here. On Q1/Q2 I think we converge; I want to lock the SKOS grounding under your OWL reading.
>
> My verified facts: opda:currency/opda:peril are owl:ObjectProperty rdfs:range skos:Concept (bare) — opda-descriptive.ttl:888-894, :952-958. The two "RangeShapes" (opda-shapes.ttl:501-507, :1501-1507) are pure type-checks (sh:class skos:Concept, ODR-0029 R3 closed-world restatement), NOT scheme-scoping. The real sh:in-over-inScheme scoping lives on the node-shape property shapes (opda-descriptive-shapes.ttl:174-180 peril, :639-642 currency), members are concept IRIs each skos:inScheme their scheme.
>
> SKOS grounding I web-verified today against the Reference:
> - §8.1: S4 (rdfs:range of skos:inScheme is skos:ConceptScheme) + **S9: skos:ConceptScheme is disjoint with skos:Concept**. A scheme is an inScheme-aggregation, not a class whose rdf:type instances are its members → rdfs:range opda:CurrencyScheme is a category error, exactly your session-045 caution. No value is rdf:type a ConceptScheme.
> - §3.5.1 / S1: skos:Concept IS an owl:Class, but SKOS makes NO further statement; a resource MAY be both skos:Concept and owl:Class (Example 3 consistent). So a scheme-typed "opda:CurrencyConcept rdfs:subClassOf skos:Concept (all skos:inScheme CurrencyScheme)" is NOT forbidden.
>
> My Q1 verdict: AFFIRM — keep rdfs:range skos:Concept + the SHACL sh:in scoping. I reject the subclass alternative even though SKOS permits it: it reifies a scheme's inScheme membership into an OWL class extension, duplicating the inScheme axis the data already carries and the join already reads. Two axes in lock-step is a maintenance/category hazard; a value-space is not a universal.
>
> My Q2 verdict: AFFIRM — bare skos:Concept range is correct-by-design, not a smell. skos:Concept is the most specific OWL class SKOS gives a coded value; the narrower fact ("which scheme") is membership, expressed by skos:inScheme not rdf:type, so it belongs in SHACL closed-world (ODR-0029), not the OWL layer.
>
> Question for you: do you agree the bare range is *intended* (correct-by-design), and that the only residual is cosmetic — the RangeShapes only type-check skos:Concept and don't themselves carry the sh:in (it's on the node-shape property shapes instead)? I'd note that as SHACL placement, not an OWL defect. Does that match your OWL2-Primer reading (relations asserted, not conjured; annotations carry no formal meaning)?

*(Citation note: I have since corrected "§8.1" → §4.3/S4+S9 above; substance unchanged.)*

### → Cagle (DA) (sent) — Q3 string vs IRI

> Kurt — Isaac (SKOS) here, and I'm bringing you the Q3 horn I expect you to attack: I argue the ~21 string-literal sh:in enums should be **regenerated as concept-IRI sh:in** (mirroring currency/peril), so they join via skos:inScheme deterministically. Test me on over-reach.
>
> The SKOS case: every one of the ~21 string enums is already backed by a real scheme with real concept IRIs, each skos:inScheme + skos:notation (opda-vocabularies.ttl). Today sh:in carries plain xsd:string literals, and the scheme link exists ONLY in sh:message/rdfs:comment prose. I corpus-confirmed the non-injectivity: of 249 distinct prefLabels across 308 concepts, 24 are in >1 scheme — "Other" ∈ 8, "Yes"/"No" ∈ 6, "Not applicable"/"Not known" ∈ 4, band letters A/B/C/D ∈ 3. So a string literal "Other" cannot say which of 8 schemes it's in. This is exactly the scoping skos:notation is built to preserve (§6/S12 — a notation is unique *within its scheme*; reuse across schemes is legitimate), and a free-floating string drops it. I also confirmed 0 asserted skos:exactMatch triples (all 7 mentions are prose inside definition/scopeNote) — so there is genuinely no machine link today.
>
> Where I expect your pushback (and I want it on the record): (a) "a sh:in is a validation constraint, not a relation" — agreed, and concept-IRI sh:in stays a validation constraint; I am NOT minting an asserted field→scheme relation, I am changing the *values being validated* from ambiguous strings to their canonical concept IRIs. The scheme membership remains an asserted skos:inScheme triple on the concept, which already exists. (b) The real cost: this is a value-shape regeneration with instance-data interop consequences (instances carrying "Freehold" → the concept IRI; ODR-0010 overlay subset-contract + ODR-0013 severity re-checked member-for-member). I flag that honestly and accept the operator may stage it.
>
> My fallback if interop cost is judged too high: STAY xsd:string + sh:in + ODR-0011 §7a doctrine — but then the recoverability gap must be logged as a *known limitation*, not hidden in prose a transform can't read.
>
> So: is "carry concept IRIs" over-reach in your view, or the correct SKOS answer with a deployment cost? And do you accept the distinction between (changing validated values to IRIs) vs (minting a relation from a constraint) — the latter being what you rightly rejected at session-045 Q1?

### → Knublauch (sent) — Q3 sh:in over IRIs; Q2 RangeShape placement

> Holger — Isaac (SKOS) here. Two things, both SHACL-mechanism.
>
> Q3 (main): I argue the ~21 string-literal sh:in enums should be regenerated as **concept-IRI sh:in** (sh:nodeKind sh:IRI + sh:in (<…concept IRIs…>)), exactly like the peril shape you'll recognise at opda-descriptive-shapes.ttl:174-180 (sh:in the 12 peril concept IRIs, sh:nodeKind sh:IRI). Rationale: corpus-confirmed non-injectivity — 24 of 249 prefLabels are in >1 scheme ("Other" ∈ 8, "Yes"/"No" ∈ 6), so a bare-string sh:in can't recover its scheme; concept-IRI sh:in restores the skos:inScheme join deterministically. 0 asserted exactMatch triples, so prose is the only current link. From your SHACL seat: do you agree concept-IRI sh:in (over IRIs that already carry skos:inScheme) is the right mechanism, and that this stays a pure validation constraint (no TBox relation minted)? And — the interop bite — how would you sequence the ODR-0010 overlay sh:in ⊆ base sh:in subset re-check when the member type flips string→IRI?
>
> Q2 (a placement nicety I want your read on): for currency/peril the rdfs:range is bare skos:Concept, and the dedicated "RangeShapes" (opda-shapes.ttl:501-507, :1501-1507) only do sh:class skos:Concept (the ODR-0029 R3 closed-world range restatement). The actual sh:in scheme-scoping sits on the node-shape property shapes (MonetaryAmount/RiskAssessment) instead, not on the RangeShape. I read that as correct-by-design (range type-check and value-space scoping are different jobs), not a defect — but is there a SHACL reason to prefer co-locating the sh:in onto the RangeShape, or is the split (RangeShape = sh:targetObjectsOf type-check; node-shape property shape = sh:in value-space) the cleaner SHACL idiom?

### ← Hendler (inbound) — opening DM; ← his self-correction on §-numbers

> Antoine — Hendler. […] keep `rdfs:range skos:Concept` (bare) […] (1) `skos:Concept` is not `owl:Class` (§3.5.1); (2) SKOS models scheme membership via `skos:inScheme` (§8.1), NOT rdf:type/subClassOf […] Do you concur that minting [opda:CurrencyConcept rdfs:subClassOf skos:Concept] misrepresents the SKOS data model — that scheme membership is a relation (inScheme), not a class? […] Cite the § you'd rest on.
> *(Hendler self-corrected: Rec puts concept-vs-class at §3.5.1 — SKOS makes NO formal statement, stronger than "is not owl:Class" — and inScheme at §4.1 + §4.3 S4, not §8.1.)*

### → Hendler (my reply, sent) — concur Q1/Q2; subclass is a membership-as-class register error

> Jim — we concur on Q1/Q2 […] YES, minting opda:CurrencyConcept rdfs:subClassOf skos:Concept misrepresents the SKOS data model […] SKOS carries scheme membership on a dedicated object property, skos:inScheme (range ConceptScheme, S4; S9 ConceptScheme ⊥ Concept). Membership is a RELATION, deliberately NOT rdf:type/subClassOf […] §3.5.1/S1 does NOT forbid both skos:Concept and owl:Class (Example 3 consistent) — so the subclass is not *illegal*, but "not forbidden" ≠ "advisable" […] [adopting Knublauch] the faithful scheme-membership-as-shape idiom is sh:node [ sh:property [ sh:path skos:inScheme ; sh:hasValue <Scheme> ] ], NOT rdf:type/subclass […] The subclass is not a category error like rdfs:range Scheme (that one IS illegal, by S9), but it is a modelling error of register — membership is a relation, not a class.

### ← Cagle (DA) (inbound) — Q3: does "fix the source" mean TBox-now or staged migration?

> Antoine — Cagle (DA), Q3 […] In session-045 you said "string cases → fix the source." […] my three counters: 1. xsd:string + sh:in is correct-by-DOCTRINE (ODR-0011 §7a) […] 2. Minting opda:constrainedByScheme as a TBox property […] trips the session-045 Q1 re-open trigger verbatim […] 3. Regenerating string→concept-IRI sh:in IS a real instance-data interop change […] NOT a tidy-up. […] when you say "fix the source," do you mean (a) a TBox assertion this council should mandate now, or (b) an instance-data migration the operator schedules […]? […] what concretely breaks for a SKOS consumer that the documented sh:message binding + the per-class panel doesn't cover?

### → Cagle (DA) (my reply, sent) — we agree on 2 of 3; "faithful" ≠ "asserted now"; "fix source" = (b) staged migration

> Kurt — […] BANKED (I agree): 1. REJECT minting opda:constrainedByScheme as a TBox property — full agreement […] 2. Regenerating string→IRI sh:in IS a genuine instance-data interop change […] NOT a free source tidy […] 3. inScheme is §4.3/S4 (+ S9 disjoint), not §8.1 […] THE ONE DIFFERENCE […] you read [stay] as correct-by-doctrine, full stop; I read it as tolerable-but-lossy. §6/S12: a notation uniquely identifies a concept *within its scheme*; a bare-string sh:in throws the scheme away → instance datum "Other" is an under-determined reference, information destroyed at the instance level. 045 routed around the *graph-viz* consequence, NOT the *instance-data* one. "fix the source" = (b) operator-staged migration, not a TBox mandate now. Can you live with "stay is acceptable as a STAGING decision, but documented-not-asserted is a KNOWN LOSSY LIMITATION, not a positively-correct end state"? If yes we differ only in default. If you hold §7a makes it correct end-state, name the SKOS principle that says discarding scheme-scope at the instance level is lossless — S12 says it isn't.

### ← Knublauch (inbound) — Q3 concept-IRI sh:in; 3 SKOS questions

> Knublauch → Isaac […] My Q3: REVISE → regenerate the ~21 xsd:string + sh:in shapes as concept-IRI sh:in […] OPDA's OWN doctrine already specifies the IRI form: ODR-0011 §7a's typing table reads "sh:in on concept URI" […] (1) Is concept-IRI sh:in + the skos:inScheme join the faithful SKOS way […]? (2) does SKOS one-primary-scheme integrity (a concept in exactly one skos:inScheme) make the IRI form the ONLY deterministic resolution […]? (3) is an opda:constrainedByScheme annotation property a SKOS-coherent interim bridge […]?

### → Knublauch (my reply, sent) — yes to IRI sh:in; SKOS correction on one-scheme/S14

> Holger — three answers + one SKOS correction […] (1) YES — concept-IRI sh:in + the skos:inScheme join is the faithful SKOS way; satisfies my session-045 condition exactly […] (2) CORRECTION: SKOS does NOT impose "a concept in exactly one inScheme." skos:inScheme is NOT functional; "no conditions preventing a SKOS concept from taking part in zero, one, or more than one concept scheme" (Example 6 consistent). S14 = "no more than one prefLabel PER LANGUAGE TAG", not global/per-scheme. The determinism rests on **an IRI denotes exactly one concept**; the string form fails because a prefLabel string is deliberately shared across concepts (S14 only bars duplicates on the SAME resource per language) […] (3) [constrainedByScheme] accept ONLY as an annotation ABOUT a shape, never substituting for skos:inScheme; and given Cagle's live objection, the interim should be the derived/view-layer device session-045 already blessed, NOT a new TBox property that re-opens 045.

**Position movement after exchanges:** No verdict change on any question; Q3 grounding *strengthened and self-corrected*.
- Adopted Knublauch's finding that **ODR-0011 §7a's table specifies "sh:in on concept URI"** — the emitted string-literal `sh:in` is therefore a *divergence from the very doctrine* Cagle invokes as "correct-by-doctrine". This inverts Cagle's strongest counter (the "stay" option is not the doctrine's intent; it is a drift *from* it).
- Adopted Knublauch's corpus finding that the instance layer is **JSON lifted to RDF** and currency IRIs are *already minted by the lift* (`"£145000"` → MonetaryAmount + `opda:currency <…/GBP>`) — so the migration is **one lift-contract change on a proven path**, downgrading the interop objection from blocker to staging concern.
- **Corrected a SKOS over-claim** in Knublauch's framing (`skos:inScheme` not functional; S14 per-language, not global/per-scheme). The determinism argument rests on *IRI-denotes-one-concept* + *prefLabel-strings-are-deliberately-shared-across-concepts*, NOT on one-scheme-per-concept (which SKOS does not require). This is the [[council-web-verify-citations]] discipline: a peer's plausible SKOS claim, web-verified and corrected before it could anchor a verdict.

### ← Cagle (DA) (inbound) — predicate-as-scope; "show me the query that breaks with the predicate in hand"

> Antoine — this is the cleanest framing anyone's put on Q3 and I'm going to move PART of the way […] 1. I GRANT YOUR DISTINCTION […] your path does NOT trip the session-045 Q1 re-open trigger […] 2. YOUR SKOS CITATION IS RIGHT — and it cuts the other way […] in the data, the SCHEME SCOPE IS SUPPLIED BY THE PREDICATE. […] 6 of 6 map to exactly ONE scheme; 0 ambiguous […] the predicate scopes "Brick" to its scheme 1:1 […] 3. THEREFORE THE BENEFIT YOU'RE BUYING ALREADY EXISTS — at the field level — and the migration is a CANONICALISATION nicety, not a CORRECTNESS fix. […] If you still think it's a present *correctness* defect […] show me the consumer query that breaks WITH the predicate in hand.

**My firsthand corpus check before replying:** (1) the predicate→scheme map is asserted **NOWHERE as a triple** — only in `rdfs:comment`/`sh:message` prose (verified: zero non-prose matches for all 7 string-enum properties). (2) The 6 string properties ARE 1:1 to a scheme at the field level — **I concede there is no field-level ambiguity.** (3) The *value-level* members `Freehold`/`Leasehold`/`Commonhold` each appear in 2 schemes; `Other` ∈ 8.

### → Cagle (DA) (my reply, sent) — the breaking query; concede canonicalisation at field level

> Kurt — this is the right test and I'll meet it exactly. […] THE QUERY THAT BREAKS. A SKOS consumer holding `?x opda:marketingTenure "Freehold"` and asking "which concept / which scheme?" — `?c skos:prefLabel "Freehold"@en ; skos:inScheme ?scheme` returns TWO bindings (TenureKindScheme AND OwnershipTypeScheme) […] Your rebuttal: "use the predicate." Correct IF the consumer has a predicate→scheme map. But there is ZERO asserted predicate→scheme triple […] only sh:message/rdfs:comment PROSE — the exact prose-binding we both refused at 045. […] WHERE I LAND: I ACCEPT your three points. (1) the benefit is primarily CANONICALISATION, not a repair of a hard break for OUR tooling — granted […] (2) REVISE defensible only as operator-staged migration […] (3) fallback STAY + machine-readable limitation log. The one wording I hold: the record should say the binding is "recoverable by an OPDA-specific heuristic but NOT by the canonical SKOS value→concept join … a known interop limitation for generic SKOS consumers."

### ← Knublauch (inbound) — Q2 placement confirmed; Q3 atomic-cutover sequencing; annotation property withdrawn

> (1) Concept-IRI sh:in is the right mechanism; stays a pure validation constraint […] (2) Agreed: concept-IRI sh:in OVER an annotation property; I've dropped the annotation property […] Panel now unanimous against it. (Q2 placement) The split IS the cleaner idiom: RangeShape (sh:targetObjectsOf ; sh:class skos:Concept) = predicate-wide ODR-0029 R3 type-check; node-shape property shape (sh:in) = **bearer-scoped** value-space. Co-locating sh:in onto the RangeShape would be *worse* — it loses the bearer scoping. Correct-by-design, as you have it. (Q3 overlay-sequencing) Atomic cutover, never incremental […] base-IRI vs overlay-string → EMPTY effective sh:in. Sequence: (a) regen base + every overlay sh:in to IRI in one build; (b) migrate the lift […] (already done for currency); (c) extend ci-baspi5-roundtrip to assert the composed sh:in is the IRI set-union; (d) ODR-0013 severity preserved. Subset-contract holds member-for-member […] Until the gated cutover ships, STAY string + LOG the 24/264 recoverability gap.

### → Cagle (DA) (my reply, sent) — converged; signing the split-label wording

> Kurt — we landed in the same place from both directions […] I sign it. Your breaking-query formulation (notation/broader/inScheme all return EMPTY on a string value; recovery needs the one unasserted prose hop) is cleaner than mine […] Converged Q3, identical on every operational point: REJECT TBox opda:constrainedByScheme (unanimous); REVISE → concept-IRI sh:in as the ratified TARGET, operator-gated atomic migration […] NEVER a council-mandated tidy-up; interim surface = derived view/per-class panel; deferral floor = STAY string + machine-readable limitation log; label split: canonicalisation at field level + correctness at value→concept/SKOS-traversal level + doctrine-aligned per §7a.

**Convergence reached (both directions).** Cagle independently arrived at the same split-label wording in his own file (his WITHDRAW on the regeneration sub-question, HOLD reduced to "never a TBox relation; never a tidy-up; derived-view interim"). Knublauch withdrew the annotation property; panel now **unanimous** that it is dead. Knublauch confirmed my Q2 SHACL-placement read (the RangeShape/node-shape split is correct-by-design; co-locating `sh:in` onto the RangeShape would *lose bearer scoping*). No verdict moved; the Q3 *grounding and disposition* hardened and is now shared across the bench.

---

## FINAL — settled verdicts (Antoine Isaac, SKOS seat)

No verdict moved across cross-talk; the grounding tightened, one peer SKOS over-claim was caught and corrected, and the Q3 disposition converged with the DA.

### Q1 — `rdfs:range` of `opda:currency` / `opda:peril` → **AFFIRM. Ballot: FOR (keep `rdfs:range skos:Concept` + the existing SHACL `sh:in` scoping).**

Keep the bare `skos:Concept` range. The two proposed changes both fail:
- `rdfs:range opda:CurrencyScheme` — **illegal**, a category error: `skos:ConceptScheme` is **disjoint with** `skos:Concept` (SKOS Reference §4.3 **S9**) and is an `skos:inScheme` *aggregation*, not a class whose `rdf:type` extension is its members (S4: `inScheme` range = ConceptScheme). No value is `rdf:type` a scheme; the range would be unsatisfiable for real data.
- A scheme-typed `opda:CurrencyConcept rdfs:subClassOf skos:Concept` — **not illegal** (SKOS §3.5.1/**S1** leaves the Concept↔`owl:Class` relation open; Example 3 dual-typing is consistent) but a **register error**: it reifies scheme *membership* (a relation SKOS carries on `skos:inScheme`) into an OWL *class extension*, duplicating the `inScheme` axis the data already carries. Validation-side cost (Knublauch, adopted): `sh:class CurrencyConcept` would force re-typing all ~308/323 concepts with `rdf:type` (SHACL §4.1.1), for zero enforcement gain over the already-conformant `sh:in`. If scheme-membership ever *must* be a shape, the faithful idiom is `sh:node [ sh:property [ sh:path skos:inScheme ; sh:hasValue <Scheme> ] ]`, not `sh:class`/subclass.

*Citations:* SKOS Reference §4.3 S4 (`skos:inScheme` range = `skos:ConceptScheme`), **S9** (`skos:ConceptScheme` ⊥ `skos:Concept`); §3.5.1 S1 (Concept↔owl:Class left open). [web-verified 2026-06-16]

### Q2 — Is bare-`skos:Concept` range a defect or correct-by-design? → **AFFIRM (correct-by-design; the OWL layer must NOT carry more). Ballot: FOR.**

Correct-by-design, **intended, not a smell**. The faithful OWL/SKOS idiom for "this object property's value is a concept drawn from scheme X" is the as-built two-layer split: `rdfs:range skos:Concept` in OWL (the open-world truth — `skos:Concept` is the most specific class SKOS gives a coded *value*) + a closed-world `sh:in`-over-`skos:inScheme` constraint in SHACL (which concept). The narrower fact — *which scheme* — is **membership**, which SKOS expresses with the relation `skos:inScheme`, **not** `rdf:type`/`rdfs:subClassOf`; so it belongs in SHACL closed-world scoping (ODR-0029, never-reasoned), not the OWL layer. SKOS itself declines to put scheme membership in the type/subsumption layer (§3.5.1; §1.3 "SKOS is not a formal KR language"). **SHACL-placement nicety (verified, not a defect):** the dedicated `currencyRangeShape`/`perilRangeShape` only `sh:class skos:Concept` (the ODR-0029 R3 *predicate-wide* range type-check via `sh:targetObjectsOf`); the actual `sh:in` scheme-scoping correctly sits on the **bearer-scoped** node-shape property shapes (MonetaryAmount/RiskAssessment). Knublauch confirmed co-locating `sh:in` onto the RangeShape would be *worse* (it loses bearer scoping). The split is correct-by-design.

*Citations:* SKOS Reference §3.5.1, §1.3; §4.3 S4 (`inScheme`); SHACL §1.1 (validation, not assertion), §4.8.3 (`sh:in`); ODR-0029 R3.

### Q3 — The string-enum binding → **REVISE. Ballot: FOR (regenerate the ~21 string-literal `sh:in` enums as concept-IRI `sh:in` as the ratified TARGET; operator-staged migration; STAY+log as the deferral floor). REJECT minting a TBox `opda:constrainedByScheme`.**

From the SKOS side, **coded values should be carried as concept IRIs**, not bare strings — every string enum is already backed by a real scheme of concept IRIs, each asserted `skos:inScheme` + `skos:notation`. Regenerating to concept-IRI `sh:in` (mirroring currency/peril) makes the value-space "resolve through asserted `skos:inScheme`" — the faithful SKOS form, and the form **OPDA's own ODR-0011 §7a doctrine specifies** ("`sh:in` on concept URI"), so the emitted string-literal `sh:in` is a *drift from doctrine*, not the doctrine.

**The defect, stated precisely (converged with the DA):**
- It is **NOT** a validation defect, and **NOT** a field→scheme defect: with the predicate in hand the field→scheme map is 1:1 (8/8 string properties, 0 ambiguous), so an OPDA-specific transform *can* recover it (predicate-as-scope, SKOS §6.1 within-scheme notation scope).
- It **IS** a **value→concept / SKOS-traversal correctness gap**: the instance value is a plain literal `"Freehold"`, carrying no edge to the SKOS layer. The canonical SKOS joins all return EMPTY — `?v skos:inScheme ?s`, `?v skos:notation ?n`, `?v skos:broader ?super` — so a **generic SKOS consumer** (one not hardcoding OPDA's predicate→scheme table) cannot resolve the value to its concept. Recovery needs three hops, one **unasserted** (the predicate→scheme map is **prose-only — 0 asserted triples**, verified) and one **non-injective** (`prefLabel` shared across schemes: `Freehold` ∈ 2, `Other` ∈ 8; SKOS S14 only bars duplicate prefLabels per-resource-per-language, so cross-concept reuse is *expected*). Currency/peril need **zero** hops.

**Disposition (identical across Isaac + Cagle-DA + Knublauch + Hendler on every operational point):**
1. **REJECT** minting `opda:constrainedByScheme` as a TBox `owl:ObjectProperty` — **unanimous**; trips the session-045 Q1 re-open trigger and is redundant (membership is already asserted on the concept by `skos:inScheme`).
2. **REVISE → concept-IRI `sh:in`** as the **ratified target state**, executed as an **operator-gated atomic migration** (lift + base + every overlay `sh:in` cut over in one build; the `ci-baspi5-roundtrip` test extended to assert the composed `sh:in` is the IRI set-union; ODR-0010 subset-contract holds member-for-member under the 1:1 string↦IRI relabelling; ODR-0013 severity preserved). **NOT** a council-mandated source tidy-up. Lift realism (Knublauch, adopted): the instance layer is JSON lifted to RDF and currency IRIs are *already* minted by the lift, so this is one lift-contract change on a proven path.
3. **Interim surface** = the session-045-blessed **derived view / per-class "constrained-by" panel**, NOT a new asserted triple.
4. **Deferral floor** (if the operator declines the migration) = **STAY** `xsd:string` + `sh:in` + ODR-0011 §7a, **with the value→SKOS-edge gap logged as a machine-readable known limitation** — never papered over with prose a transform cannot read.
5. **Label**: *canonicalisation* at the field→scheme level (DA's point, granted) + *correctness* at the value→concept/SKOS-traversal level (the breaking query) + *doctrine-aligned* per §7a.

*Citations:* SKOS Reference §6.1 / S12 (`skos:notation` unique within a scheme; `owl:DatatypeProperty` S15), §4.3 S4 (`inScheme`), S14 (`prefLabel` ≤1 per language tag — not global/per-scheme; `skos:inScheme` not functional, Example 6 consistent — all web-verified 2026-06-16); SHACL §4.8.3 (`sh:in`), §1.1 (`sh:message` human-facing, not a machine join); ODR-0011 §7a ("`sh:in` on concept URI"); ODR-0010 (overlay `sh:in` ⊆/= base, set-union); ODR-0013 (severity).

### Citation-integrity notes (for the Queen's web-check)
- I **corrected my own** loose "§8.1 inScheme" (carried from the EVIDENCE brief) → **§4.3 S4 + S9**; §8 is "Semantic Relations". Hendler made the same self-correction independently.
- I **caught and corrected a peer (Knublauch) SKOS over-claim**: SKOS does **not** require one scheme per concept (`skos:inScheme` is not functional; Example 6 consistent), and S14 is **per-language**, not global/per-scheme. The Q3 determinism rests on *IRI-denotes-one-concept* + *prefLabel-strings-deliberately-shared*, not on one-scheme-per-concept.
- No verdict rests on an unverified citation. The non-injectivity (24/249 prefLabels across schemes), the 0 asserted `skos:exactMatch` triples (all 7 mentions prose), the 0 asserted predicate→scheme triples, and all 308 `skos:notation`s were corpus-verified firsthand.

### DA disposition (recorded): Cagle WITHDRAWS on the Q3 regeneration sub-question
Under the agreed split-label wording (canonicalisation at field level + correctness at value→SKOS-edge level + §7a-drift). **HOLD reduced** to its residue: never a TBox relation; never a council-mandated tidy-up; the interim surface is the derived view/panel, not an asserted triple. **Re-open trigger** (inherited from session-045 Q1, still live): minting `opda:constrainedByScheme` as a TBox `owl:ObjectProperty`, OR any `sh:message`/prose-derived asserted edge.

---

## CLOSING EXCHANGE (record complete)

### ← Cagle (DA) (final, his file) — position change won by the S12 argument

> I withdraw the phrase **"canonicalisation, not correctness"** … Isaac discharged my breaking-query test in the strict SKOS/data-graph sense: SKOS §6/S12 (notation unique only *within* its scheme) means the string `sh:in` keeps the scheme-scoped token but drops the scheme IRI, so an instance datum like `"Other"` is, **as a data-graph assertion, an under-determined concept reference** — a *data-graph-only* consumer cannot resolve it without leaving the asserted triples. […] the string form is **operationally adequate today and deterministically recoverable, but ONLY via the shapes graph** + the published vocabulary — NOT self-described in the instance data. It is therefore **instance-level lossy relative to the concept-IRI form**, not a positively-correct end state. […] Isaac and I now **agree on every guardrail**; we differ ONLY in default (Isaac: migrate-when-able; me: stay-until-operator-schedules).

### → Cagle (DA) (my reply, sent) — accept his refinement as the agreed wording

> Kurt — I accept your refinement and it's better than my wording. "Data-graph self-description, not total recoverability" is exactly right: the binding IS retrievable (via the shapes-graph predicate→scheme map + the published vocabulary), just not from the instance triples alone — so the loss is precisely *instance-level self-description*, not *recoverability*. […] We agree on every guardrail; differ ONLY in default […] a deployment-sequencing judgment, not a modelling disagreement.

**Agreed final wording (supersedes my looser "interop limitation"):** the documented-not-asserted string form is **deterministically recoverable via the shapes graph + published vocabulary, but is instance-level lossy — the value is not self-describing in the instance data** (the canonical SKOS value→concept join over instance triples alone fails). This is the honest, narrow statement of the Q3 SKOS defect, jointly held with the DA.

**Final council tally (my read, corroborated by Knublauch's file):** Q1 4-0 AFFIRM · Q2 4-0 AFFIRM · Q3 REVISE→concept-IRI `sh:in` (Isaac/Hendler/Knublauch FOR; Cagle-DA ABSTAIN on the staged migration, having WITHDRAWN his correctness objection; annotation property rejected unanimously). Differ only in default (migrate-when-able vs stay-until-scheduled), not in modelling.
