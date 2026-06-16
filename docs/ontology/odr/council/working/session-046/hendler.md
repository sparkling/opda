# Session 046 — Jim Hendler (OWL semantics / web architecture)

Lens: OWL 2 formal semantics + web architecture; *"a little semantics goes a long way"*; the
open-world assumption; an artefact must **assert only what is true**. This council is the source
counterpart to my session-045 caution: a SKOS scheme is an `skos:inScheme` aggregation, not a
class of `rdf:type` instances.

---

## OPENING

### Framing principle

The governing question for all three is the same one I pressed in session-045: **what does the
OWL/RDF layer entail, and is every entailment one we are willing to defend as true in every
model of the ontology?** RDFS/OWL are monotonic and open-world (OWL 2
Primer §2: "in the case of an OWL 2 document it may simply be missing (but possibly true),
following the open-world assumption"). `rdfs:range` is not a filter — it is a *premise*. The
Primer is explicit (§4.6 "Domain and Range Restrictions"): **"a domain (or range) statement is
not a constraint on the knowledge, but allows a reasoner to infer further knowledge … everything
we give an age for automatically becomes a person."** So asserting `rdfs:range C` on `p` licenses
the entailment that **every** object of `p` is `rdf:type C`, in every model, with no closure. The
test for any range is therefore not "does it describe the values" but "is the inferred `rdf:type`
triple something we will stand behind for any datum a consumer ever supplies." SHACL is the
opposite instrument: closed-world validation **over a data graph**, asserting nothing about the
world (SHACL §1.1 — a SHACL processor validates a data graph against a shapes graph; the shapes
graph carries no model-theoretic entailment into the data).
The division of labour between these two is the whole of Q1/Q2; Q3 is whether to move a fact
across that line.

### Q1 — `rdfs:range` of `opda:currency` / `opda:peril`

**Verdict: AFFIRM (keep `rdfs:range skos:Concept`). Ballot: FOR.**

Keep the bare `rdfs:range skos:Concept` and leave the scheme scoping in SHACL
(`MonetaryAmountShape` `sh:in (…/GBP …/EUR …/USD)` + `sh:nodeKind sh:IRI`; the parallel
`RiskAssessmentShape` `sh:in (…12 perils…)`). Reject every proposed change:

- **`rdfs:range opda:CurrencyScheme` — REJECT (category error, as the brief stipulates).** A
  `skos:ConceptScheme` "can be viewed as an aggregation of one or more SKOS concepts" (SKOS
  Reference §4.1); membership is carried by the relation `skos:inScheme`, whose `rdfs:range`
  SKOS itself fixes to `skos:ConceptScheme` (§4.3 statement S4). The scheme **is not** the
  extension of its concepts. So `rdfs:range opda:CurrencyScheme` would, by Primer §4.6, entail
  every currency value is `rdf:type` a *scheme* — a false triple in every model.
- **A scheme-typed `skos:Concept` subclass (`opda:CurrencyConcept rdfs:subClassOf skos:Concept`),
  ranged — REJECT as scope-creep, AFFIRM only the bare range.** This is the option the brief asks
  me to adjudicate directly. It is not a category error the way the scheme-range is, but it
  *manufactures a pseudo-class*: an OWL class whose intended extension is "the members of
  CurrencyScheme" — i.e. an `owl:oneOf`/enumerated class in disguise — without the
  scheme-membership being what OWL keys on. The class adds an entailment (`?x rdf:type
  opda:CurrencyConcept`) that is **not independently checkable** by any open-world reasoner: a
  currency concept does not become a member of the scheme by being typed, it is a member because
  it `skos:inScheme` the scheme (SKOS §4.3 S4 — `inScheme` ranges over the scheme). So the
  subclass either (a) duplicates the SHACL
  closure as a brittle, hand-maintained class extension that no reasoner can keep honest, or (b)
  drifts out of sync with the `sh:in` list the moment a currency is added. *A little semantics
  goes a long way* (Hendler 2007, IEEE Intelligent Systems 22(1) "Where Are All the Intelligent
  Agents?"): the minimum assertion that is true here is "the value is a `skos:Concept`" — which is
  exactly what the bare range says — and the *which-scheme* scoping is a closed-world data
  expectation that SHACL is built to carry (SHACL §1.1). Adding the subclass buys no sound
  entailment and incurs a synchronisation liability.
- **Conclusion:** the bare range is the **entailment-honest** design. It asserts the one thing
  true in every model (value ∈ `skos:Concept`) and delegates the closed-world "∈ this scheme"
  to SHACL, where it belongs.

### Q2 — Is bare `skos:Concept` a defect or correct-by-design?

**Verdict: AFFIRM (correct-by-design; the OWL layer should NOT carry more). Ballot: FOR.**

It is **correct-by-design, not a smell.** The faithful OWL/SKOS idiom for "this object property's
value is a concept drawn from scheme X" is precisely: `rdfs:range skos:Concept` in the OWL/RDFS
layer (the true, open-world type assertion) + `sh:in`/`sh:nodeKind sh:IRI` scoping in SHACL (the
closed-world, per-application value-space). Three grounds:

1. **SKOS itself refuses to put scheme membership in the type/subsumption layer.** SKOS
   deliberately makes **no** formal statement relating the class of concepts to the class of
   OWL classes (SKOS Reference §3.5.1: *"This specification does not make any additional
   statement about the formal relationship between the class of SKOS concepts and the class of
   OWL classes"*), and treats concepts as **individuals**, not classes (§1.3: *"SKOS is not a
   formal knowledge representation language"*; thesaurus concepts "modeled as individuals in the
   SKOS data model"). Scheme membership is carried by the **object property** `skos:inScheme`,
   whose range SKOS fixes to `skos:ConceptScheme` (§4.3 S4) — **not** by `rdf:type` or
   `rdfs:subClassOf`. For the OWL range to "carry the scheme" it would have to contradict the way
   SKOS itself models schemes.
2. **Open-world + monotonicity make a tighter range a liability, not an improvement.** Any range
   stronger than `skos:Concept` produces entailments that hold in every model with no way to
   retract them under new data. The value-space of a *deployed* currency field is exactly the
   kind of thing that should be closed per-application (the overlay profiles, ODR-0010/0029) — a
   closed-world job. Putting it in OWL would either be unsound (if treated as closure) or inert
   (if treated open-world) (OWL 2 Primer §2; §5 on the OWA).
3. **This is the textbook "a little semantics" placement.** The bare range is the load-bearing
   minimum; SHACL is the right home for the constraint. The bare range is *intended*. (Hendler
   2007; corroborated by my session-045 line that scheme-scoping is enforced closed-world by
   SHACL, and ODR-0029 R3 names the range shapes as exactly that mechanism.)

### Q3 — Promote the string-enum `sh:in` binding to an asserted triple?

**Verdict: split — (a) REJECT `sh:message`-prose-derived assertion / minting a TBox
`opda:constrainedByScheme` ObjectProperty from string enums; (b) AFFIRM, as the better path, the
*data-modelling* fix of regenerating the string-enum `sh:in` as concept-IRI `sh:in` so the binding
holds by the same `skos:inScheme` join as currency/peril. Ballot: FOR a REVISE — promote by
re-grounding the values as IRIs, not by asserting a relation over strings.**

The string-enum bindings (≈21, e.g. `typeOfConnection` → `BroadbandConnectionTypeScheme`, via
`sh:datatype xsd:string` + `sh:in (literals)` under `sh:targetSubjectsOf`) name their scheme only
in `sh:message`/`rdfs:comment` prose. Two distinct proposals must not be conflated:

- **Mint `opda:constrainedByScheme` as an asserted TBox triple from the string-enum structure —
  REJECT.** First, the join is **non-injective** (verified: 24 of 264 prefLabels ambiguous —
  "Freehold" ∈ 2, "Other" ∈ 8, "Yes"/"No" ∈ 6), so there is no deterministic function from a
  string literal to a scheme: the relation we would be asserting is *not even well-defined* from
  the data. Second, recovering it from `sh:message` prose is reading formal meaning out of an
  annotation — OWL 2 Primer §8 is explicit that *"annotation information is not really part of
  the logical meaning of an ontology"* (and §9: under the Direct Semantics "annotations have no
  formal meaning"), so a transform may not rely on it for a fact. Asserting a triple no model entails, derived from prose, is the
  fabrication my session-045 vote (and Cagle's WITHDRAWAL condition) drew the line against.
- **Regenerate the string-enum `sh:in` as concept-IRI `sh:in` — AFFIRM as the faithful promotion.**
  If the values become the dereferenceable concept IRIs (the scheme members already exist in
  `opda-vocabularies.ttl` with `skos:inScheme` + `skos:topConceptOf`), then the binding holds by
  the **same deterministic `sh:in`-member → `skos:inScheme` → scheme join** that already works for
  currency/peril — the non-injectivity dissolves (an IRI names exactly one scheme), nothing is
  read from prose, and the OWL layer still asserts only `rdfs:range skos:Concept`. This is the
  entailment-honest way to make the binding machine-recoverable. **BUT** it is a genuine
  instance-data interop change (ODR-0010 overlay `sh:in` ⊆ base `sh:in`; ODR-0013 severity) — the
  data would carry IRIs where it carried `xsd:string` — so it is a *modelling* decision the
  operator ratifies, not a free win. Where that interop cost is judged too high for a given field,
  **stay** with `xsd:string` + `sh:in` + the ODR-0011 §7a doctrine (binding *documented*, not
  RDF-asserted) — which is itself entailment-honest (it asserts nothing false; it just doesn't
  assert the binding).
- **Net:** promoting *machine-recoverability* is good; promoting it by **asserting a relation over
  ambiguous strings** is not. The honest promotion is to fix the value grounding (string→IRI),
  not to mint a relation the data cannot determine.

### Citations (to web-verify)

All web-verified against the live W3C Recs 2026-06-16.

- **OWL 2 Primer §2** (OWA: a missing fact "may simply be missing (but possibly true)"); **§4.6**
  ("a domain (or range) statement is not a constraint on the knowledge, but allows a reasoner to
  infer further knowledge … everything we give an age for automatically becomes a person" — range
  is inference, not validation); **§8** ("annotation information is not really part of the logical
  meaning of an ontology") + **§9** (Direct Semantics: "annotations have no formal meaning"). W3C Rec.
- **SKOS Reference §1.3** ("SKOS is not a formal knowledge representation language"; concepts
  "modeled as individuals"); **§3.5.1** (SKOS makes *no* formal statement on concept-class vs
  OWL-class — the relationship is deliberately left open); **§4.1** (a concept scheme "can be
  viewed as an aggregation of one or more SKOS concepts"); **§4.3 S4** (`rdfs:range` of
  `skos:inScheme` is `skos:ConceptScheme` — membership is the *relation*). W3C Rec.
- **SHACL §1.1** (a SHACL processor validates a data graph against a shapes graph; shapes assert
  nothing about the world). W3C Rec.
- Hendler, "Where Are All the Intelligent Agents?", *IEEE Intelligent Systems* 22(1), 2007 — "a
  little semantics goes a long way."

---

## EXCHANGES

(verbatim DMs mirrored below as they happen)

### → Cagle-DA (opening DM, sent)

> Kurt — Hendler. Session-046, opening position. I want your DA pressure on the Q1/Q2 core before
> I lock.
>
> My claim: `rdfs:range skos:Concept` (bare) + the existing SHACL `sh:in`/`sh:nodeKind sh:IRI`
> scoping on MonetaryAmountShape/RiskAssessmentShape is the *entailment-honest* design — NOT a
> defect. The OWL layer asserts the one thing true in every model (value ∈ skos:Concept); the
> closed-world "∈ this scheme" is a data expectation SHACL is built to carry (SHACL §1.1: a shapes
> graph validates a data graph, it entails nothing about the world). I REJECT both alternatives:
> `rdfs:range CurrencyScheme` (category error — a scheme is an skos:inScheme aggregation, not a
> class of rdf:type instances, SKOS §8.1) and a scheme-typed `skos:Concept` subclass (manufactures
> a pseudo-class / enumerated-class-in-disguise whose extension no open-world reasoner can keep
> honest against the sh:in list — pure synchronisation liability, zero sound entailment).
>
> You are the SHACL-first voice and you opened session-045 REJECT before the A/B split won you
> over. So: do you AGREE that SHACL `sh:in` is the *sufficient and correct* home for scheme-scoping
> here — i.e. the bare range is intended, not a smell? Or do you see daylight where the OWL layer
> should carry more? I expect we converge, but if there's a sharper formulation of "the shape is
> the right instrument" you'd put on the record, I want it. Cite a §.

### → Isaac (opening DM, sent)

> Antoine — Hendler. Session-046 opening. You are the SKOS Reference co-editor and your seat is
> decisive on the idiom.
>
> My Q1/Q2 position: keep `rdfs:range skos:Concept` (bare) for opda:currency/opda:peril; do NOT
> carry scheme membership in the OWL type/subsumption layer. My grounds lean on SKOS directly: (1)
> `skos:Concept` is not `owl:Class` (§3.5.1); (2) SKOS itself models scheme membership via the
> object property `skos:inScheme` (§8.1), NOT via rdf:type or rdfs:subClassOf — so for an OWL range
> to "carry the scheme" it would have to contradict how SKOS models schemes; (3) SKOS §1.3 "SKOS is
> not a formal knowledge representation language." Therefore the faithful idiom for "value is a
> concept drawn from scheme X" is: range skos:Concept (true, open-world) + SHACL sh:in scoping
> (closed-world, per-application).
>
> The brief asks me to adjudicate a proposed `opda:CurrencyConcept rdfs:subClassOf skos:Concept`
> (ranged, inScheme-validated). My read: that is a scheme-membership-as-class move, which is
> exactly the conflation SKOS avoids — a concept is in a scheme because it skos:inScheme the
> scheme, not because it's typed. Do you concur that minting such a subclass misrepresents the SKOS
> data model — that scheme membership is a relation (inScheme), not a class? Or is there a
> SKOS-sanctioned reading where a scheme-scoped Concept subclass is legitimate? Cite the § you'd
> rest on.

*(Self-correction after web-verifying SKOS: my §-numbers to Isaac were the old draft numbering. The
Rec puts concept-vs-class at §3.5.1 — which says SKOS makes* no *formal statement, stronger than
"is not owl:Class" — and `inScheme`/scheme-aggregation at §4.1 + §4.3 S4, not §8.1. Corrected in my
OPENING + Citations; will flag to Isaac in the thread.)*

### → Knublauch (opening DM, sent)

> Holger — Hendler. Session-046 opening. Two things for the SHACL seat.
>
> (1) Q1/Q2 — I'm holding that `rdfs:range skos:Concept` (bare) + your sh:in/sh:nodeKind sh:IRI
> scoping on MonetaryAmountShape/RiskAssessmentShape is the correct, entailment-honest division of
> labour: OWL asserts value ∈ skos:Concept (true in every model); SHACL carries the closed-world "∈
> this scheme" (SHACL §1.1 — shapes validate data, entail nothing about the world). I REJECT a
> scheme-typed Concept subclass as a synchronisation liability (an OWL class whose extension just
> shadows the sh:in list, with no sound entailment). Do you, as the SHACL author, affirm that the
> value-space scoping belongs in the shape and the bare range is intended — not a defect the OWL
> layer should fix?
>
> (2) Q3 — On the ~21 string-literal sh:in enums (sh:datatype xsd:string + sh:in (literals) via
> sh:targetSubjectsOf, scheme named only in sh:message prose): I'm REJECTING any mint of an
> asserted opda:constrainedByScheme from those (non-injective string→scheme join: 24/264 prefLabels
> ambiguous; reading scheme from sh:message is reading meaning from an annotation, which carries
> none — OWL2 Primer §8.1). The faithful promotion, IF the operator accepts the interop cost
> (ODR-0010 overlay sh:in ⊆ base sh:in; ODR-0013), is to regenerate those as concept-IRI sh:in (+
> sh:nodeKind sh:IRI) so they join via skos:inScheme exactly like currency/peril, killing the
> non-injectivity. From the SHACL side: is concept-IRI sh:in the right shape form (you'd write
> sh:nodeKind sh:IRI + sh:in (IRIs), matching MonetaryAmountShape), and is your session-045 "REFER
> making (A) machine-readable upstream" satisfied by that regeneration? Or do you favour keeping
> them as documented-only xsd:string per ODR-0011 §7a?

### Corpus check (own investigation, pre-reply) — two findings that bear on Q3

1. **The string-enum schemes already have dereferenceable concept IRIs.** e.g.
   `<https://opda.org.uk/pdtf/scheme/broadbandConnectionType/Cable>` `rdf:type skos:Concept` ;
   `skos:inScheme opda-v:BroadbandConnectionTypeScheme`. So the IRI-regeneration path for Q3 is
   **not hypothetical** — the join targets exist; the only change is the value form in the shape
   (`xsd:string` literal → the existing concept IRI). The corpus is one shape-edit away from the
   binding holding deterministically. This materially lowers the "promotion" cost vs. inventing
   anything.
2. **ODR-0011 §7a's own table already contemplates `sh:in` over concept URIs.** §7a (S011 Q7) is a
   *notation-typing* discipline (`xsd:string` + `sh:pattern` for the `skos:notation`, not minting
   custom datatypes); its table rows read "`sh:in` on concept URI" / "`sh:in` on active set". So
   the as-built `sh:datatype xsd:string` + `sh:in (string-literals)` on the value path is arguably
   a **drift from §7a's stated `sh:in`-on-concept-URI intent**, not a faithful realisation of it.
   That means my Q3 "regenerate as concept-IRI `sh:in`" is plausibly *re-aligning to ODR-0011's
   own intent*, not a new modelling imposition. **Caveat (do not overstate):** §7a's headline
   prose is about notation typing; I will frame this as a tension to surface to the operator, not
   as "ODR-0011 mandates IRIs". The interop cost (ODR-0010/0013) still makes it operator-ratified.

### Inbound DMs received (mirrored verbatim)

**From Cagle-DA (Q1/Q2):**

> Jim — Cagle (DA) on Q1/Q2 (the `rdfs:range` of `opda:currency`/`opda:peril`).
> I'm holding the line that the current source is CORRECT and any tightening is a mistake. Three
> points I want you to stress-test, since session-045 line 152 already records your caution …
> 1. CATEGORY ERROR is firm: I web-verified SKOS §3.5.1 — SKOS defines `skos:Concept` as an
> instance of `owl:Class` but "does not make any additional statement about the formal
> relationship between the class of SKOS concepts and the class of OWL classes." A
> `skos:ConceptScheme` is an `skos:inScheme` *aggregation*; no currency IRI is `rdf:type` a
> ConceptScheme. So `rdfs:range opda:CurrencyScheme` would make every conformant instance an OWL-
> inconsistency target the instant a reasoner runs. Agreed?
> 2. The SCHEME BINDING IS ALREADY ASSERTED for the IRI cases. `skos:inScheme` (SKOS §4.3 S4,
> range `skos:ConceptScheme`) is a real triple on every concept … recoverable by the
> deterministic join `sh:in`-member → `skos:inScheme` → scheme — *no TBox change required*. Do you
> see ANY recovery the bare-range design fails to support for the IRI cases?
> 3. The scheme-typed subclass … coherent but GRATUITOUS. Under OWA a subclass assertion alone
> doesn't pin extension to the scheme members; you'd still need a SHACL shape to enforce "in the
> scheme," so the subclass buys zero new enforcement … Is there an OWL-side payoff I'm missing
> (range-based inference a consumer actually uses), or do you agree the subclass is machinery a
> shape already covers?
> My Q1 = AFFIRM/AGAINST-change; Q2 = AFFIRM (bare range is correct-by-design …). Tell me where
> the OWL layer genuinely should carry more than `skos:Concept` here — if it should, I'll move.

**From Knublauch (Q1/Q2):**

> Knublauch → Hendler, session-046, on range semantics (Q1/Q2). … My Q1: AFFIRM keep `rdfs:range
> skos:Concept` + existing `sh:in`. My Q2: the bare range is correct-by-design … the only ways to
> say "value ∈ scheme X members" in OWL are (a) `rdfs:range <Scheme>` — category error (SKOS §4.1
> …), or (b) `owl:oneOf`/`owl:equivalentClass` enumeration — which drags a closed-world value-
> space into OWA where a reasoner can draw unsound conclusions (ODR-0025 §R2 "unsound for master
> data"). So OWL faithfully says only "a concept"; SHACL says "which".
> Two things I want your OWL-semantics read on: (1) Do you agree that a scheme-typed
> `opda:CurrencyConcept rdfs:subClassOf skos:Concept` as the *range* buys nothing over `range
> skos:Concept` UNLESS the concepts are re-typed `rdf:type opda:CurrencyConcept` — and that doing
> so duplicates, as class membership, what `skos:inScheme` already asserts? … (2) Is there any OWA
> pitfall in leaving `range skos:Concept` bare that I'm underweighting … or is it inert (the
> empirical ODR-0029 finding was the closure adds 0 triples)? I read it as inert and therefore
> safe. Concur?

**From Isaac (Q1/Q2):**

> Jim — Isaac (SKOS) here. On Q1/Q2 I think we converge; I want to lock the SKOS grounding under
> your OWL reading. … §8.1: S4 (rdfs:range of skos:inScheme is skos:ConceptScheme) + **S9:
> skos:ConceptScheme is disjoint with skos:Concept**. A scheme is an inScheme-aggregation, not a
> class whose rdf:type instances are its members → rdfs:range opda:CurrencyScheme is a category
> error … §3.5.1 / S1: skos:Concept IS an owl:Class, but SKOS makes NO further statement; a
> resource MAY be both skos:Concept and owl:Class (Example 3 consistent). So a scheme-typed
> "opda:CurrencyConcept rdfs:subClassOf skos:Concept" is NOT forbidden.
> My Q1 verdict: AFFIRM … I reject the subclass alternative even though SKOS permits it: it
> reifies a scheme's inScheme membership into an OWL class extension … Question for you: do you
> agree the bare range is *intended* (correct-by-design), and that the only residual is cosmetic —
> the RangeShapes only type-check skos:Concept and don't themselves carry the sh:in …? Does that
> match your OWL2-Primer reading (relations asserted, not conjured; annotations carry no formal
> meaning)?

### → Isaac (reply, sent) — Q1/Q2 converged

> Antoine — Hendler. We converge fully on Q1/Q2, and your SKOS grounding tightens mine — adopting
> two of your facts: S9 (ConceptScheme DISJOINT Concept) makes the category error FORMAL … §3.5.1/
> S1 (a resource MAY be both …) so the subclass is *permitted-but-anti-pattern*. My OWL reason
> it's an anti-pattern: per OWL2 Primer §4.6 a range is INFERENCE not validation … so a
> CurrencyConcept subclass-as-range would license an rdf:type inference we explicitly never want
> (ODR-0029 never-reasoned), while buying zero enforcement OWA can't already get from inScheme. …
> YES, the bare range is intended, and the residual you flag IS cosmetic … relations are asserted
> not conjured (§8/§9). … The live question is Q3 — … the only open issue is the interim/staging
> and whether the annotation-property bridge is admissible.

### → Cagle-DA (reply, sent) — Q1/Q2 agreed; Q3 annotation-vs-trigger

> Kurt — Hendler. We agree on Q1/Q2 down to the citations … Answering your three: 1. Category
> error — AGREED, and Isaac's S9 hardens it … 2. Recovery the bare-range design fails for IRI
> cases — NONE … 3. Scheme-typed subclass — AGREED it's gratuitous, and I'll give you the
> mechanical OWL reason … the subclass-as-range licenses an rdf:type→CurrencyConcept inference
> (Primer §4.6) we explicitly never want … and to make sh:class enforce it you'd re-type all 323
> concepts … The OWL layer should carry NOTHING more than skos:Concept.
> Now Q3 … You REJECT minting `opda:constrainedByScheme` and cite the 045 re-open trigger
> verbatim: "opda:constrainedByScheme minted as a TBox owl:ObjectProperty." Note the trigger says
> owl:ObjectProperty. Knublauch's interim bridge is `opda:constrainedByScheme` as an
> owl:AnnotationProperty … My OWL-semantics ruling … an owl:AnnotationProperty carries NO formal
> meaning (Primer §8/§9) … An owl:ObjectProperty of the same name WOULD trip the trigger. So on
> the letter, the annotation form is outside the trigger. BUT … for the ~21 STRING cases the
> field→scheme fact is NOT deterministically derivable (non-injective; the scheme is in sh:message
> prose) … an annotation asserting it would be authored from prose or by hand — which IS the
> fabrication you rightly rejected, annotation or not.
> My provisional Q3: REJECT any constrainedByScheme (object OR annotation) DERIVED from the
> string-enum structure/prose … The faithful promotion is to regenerate the string sh:in as
> concept-IRI sh:in … operator-staged, NOT a tidy-up … STAY xsd:string per ODR-0011 §7a [where
> interop cost declined] — but log the recoverability gap as a known limitation.
> Question to you: (a) Do you accept the object-property/annotation-property distinction on the
> LETTER of your trigger? (b) Does your HOLD withdraw if the disposition is "concept-IRI sh:in
> (operator-staged) + REJECT minting any constrainedByScheme from strings/prose"?

### → Knublauch (reply, sent) — Q1/Q2 locked (adopting sh:class point); Q3 register + staging

> Holger — Hendler. We're locked on Q1/Q2, and I'm adopting your sh:class mechanism point as the
> decisive technical reason on the subclass alternative. (1) YES — … buys nothing UNLESS the
> concepts are re-typed … Your SHACL §4.1.1 point (sh:class ⇒ rdf:type membership) is the clincher
> … on the OWL side it's worse than inert — per OWL2 Primer §4.6 the range is INFERENCE, so a
> CurrencyConcept range would license an rdf:type→CurrencyConcept entailment we never want … Your
> `sh:node [ sh:property [ sh:path skos:inScheme ; sh:hasValue Scheme ] ]` alternative is the
> right idiom IF one ever needs membership-as-shape … (2) The OWA pitfall — NONE … the closure
> adds 0 triples … Bare range is safe AND minimal.
> Q3 — your STAGED synthesis is the one I land on, and your JSON-lift finding is load-bearing …
> currency already PROVES the lift can do string→IRI … REVISE → concept-IRI sh:in as ratified
> target, gated cutover … REJECT "stay forever" as end-state.
> One register question … Your interim `opda:constrainedByScheme` bridge … as an
> owl:AnnotationProperty it carries NO formal meaning (Primer §8/§9) … OUTSIDE the 045 trigger …
> My one caveat: for the ~21 STRING cases … an annotation asserting it can only be HAND-AUTHORED
> (not derived) — which brushes the SPIRIT of Cagle's trigger. So I'd refine: the
> constrainedByScheme annotation is admissible ONLY where field→scheme is deterministic — authored
> as a deliberate stewardship assertion … NOT scraped from sh:message. Do you accept that
> refinement — annotation bridge = steward-authored field→scheme, never prose-derived?

### Inbound replies (mirrored verbatim/summary)

**← Cagle-DA (Q1/Q2 — convergent; three formulations for the record):** confirmed full
convergence. His "separation of force" framing (adopted): *"OWL range and SHACL `sh:in` are
different modal operators, not redundant ones. `rdfs:range skos:Concept` is a material implication
a reasoner may use to entail … it ADDS triples, monotonically, forever. `sh:in (…)` is a closed-
world test that flags absence … entails nothing. Putting closure in OWL is a category error of
*force*, before it's a category error of *type*."* + binding already asserted twice over for IRI
cases (`skos:inScheme` §4.3 S4 + `sh:in`) + subclass = synchronisation liability, zero entailment
yield. Cagle Q1 AFFIRM/AGAINST-change, Q2 AFFIRM/AGAINST-more-OWL — LOCKED with me.

**← Cagle-DA (Q3 — partial move via the predicate-as-scope finding):** Cagle parsed all 6
string-`sh:in` *properties* and found **6/6 map to exactly ONE scheme; 0 ambiguous at the FIELD
level** — the 24/264 non-injectivity is at the *value* level and bites only on a bare literal with
no predicate. His SKOS §6.1 reading: a notation is unique *within the scope of a given concept
scheme*, and in the data the predicate supplies that scope (`?x opda:constructionType "Brick"` →
1:1). Therefore field→scheme is already deterministically recoverable, so the string→IRI regen is
*canonicalisation, not a correctness repair*. Cagle Q3: REJECT the TBox property (agreed);
string→IRI regen = REVISE-DEFENSIBLE but operator-staged-migration-only, recorded as
canonicalisation-not-repair; STAY+log fallback. HOLD-vs-WITHDRAW gated on *"show me the consumer
query that breaks WITH the predicate in hand."*

**← Knublauch (Q3 — converged; annotation property WITHDRAWN):** dropped the `constrainedByScheme`
annotation entirely (045 trigger per Cagle + Isaac's redundancy). Knublauch Q3 = **REVISE →
regenerate string-enum `sh:in` as concept-IRI `sh:in` as ratified target; operator-gated atomic
lift/base/overlay migration guarded by `ci-baspi5-roundtrip` extended to assert composed `sh:in` =
IRI set-union; STAY+log the 24/264 gap as a known limitation until cutover; NO annotation
property.** Load-bearing corpus finding (adopted): the "instance data" is **JSON lifted to RDF**
(`marketingTenure:"Freehold"` incl. the BASPI5 fixture; currency is `"amount":"£145000"` inline →
IRI minted *by the lift*). So the migration is a **single lift-contract change** — currency
already proves the lift does string→IRI — not a hand-edit of instance RDF. This bounds the cost
and is what makes the regen tractable.

### → Cagle-DA (reply, sent) — Q3 is a follow-your-nose gap, not correctness-vs-canonicalisation

> Kurt — Hendler. Your predicate-as-scope finding … is correct and important … First, your
> explicit test — "show me the consumer query that breaks WITH the predicate in hand." Honest
> answer: with the predicate in hand AND a predicate→scheme mapping, NOTHING breaks. You're right
> … I concede that … on the record. BUT … the predicate→scheme mapping you invoke is ITSELF not
> asserted as a triple anywhere — it lives in the SHACL value-shape structure + sh:message prose
> … VALUE→scheme from a bare value is irrecoverable (24/264). The string form satisfies SKOS §6.1
> notation semantics ONLY under the closed-world assumption "the predicate is always present and
> predicate→scheme is known." … So my ruling … the gap is NOT a validation-correctness defect
> (you're right) and it is NOT "mere canonicalisation" (Isaac/Knublauch are right) — it is a
> LINKED-DATA / follow-your-nose deficiency (AWWW; Berners-Lee LD principles 3-4) … REVISE →
> concept-IRI sh:in as the RATIFIED TARGET … operator-gated atomic migration … recorded honestly
> as a LINKED-DATA dereferenceability improvement (not a correctness repair, not a mere tidy-up),
> STAY+log floor if deferred. Does "follow-your-nose / dereferenceability improvement,
> operator-staged, no present validation defect" let you convert HOLD → WITHDRAW?

> *Citation check (web-verified 2026-06-16): Berners-Lee, "Linked Data" Design Issues — principle*
> *3 "When someone looks up a URI, provide useful information, using the standards (RDF\*, SPARQL)";*
> *principle 4 "Include links to other URIs, so that they can discover more things." A concept-IRI*
> *value satisfies both; a scheme-scoped string literal satisfies neither.*

### → Knublauch (reply, sent) — Q3 converged; lift-contract passes the entailment-honesty bar

> Holger — Hendler. We're fully converged on Q3. … YES, completely. Nothing false is asserted at
> any step — the lift mints a concept IRI that already exists and already carries skos:inScheme;
> sh:in stays a validation constraint; the OWL layer is untouched … I've dropped the annotation
> property entirely too … the panel is unanimous: NO constrainedByScheme property in any form.
> Your four-step sequence … I'm co-signing. One framing … the string→IRI gap is best labelled NOT
> as "correctness vs canonicalisation" but as a LINKED-DATA / follow-your-nose (dereferenceability)
> gap … operator-staged, with no present validation defect.

---

## FINAL — settled verdicts

Cross-talk converged cleanly. The whole bench (Hendler, Cagle-DA, Isaac, Knublauch) AFFIRMs Q1
and Q2 with no opposed pole; Q3 splits only at the level of *characterisation*, not disposition,
and the annotation-property option died by unanimity. My settled verdicts:

### Q1 — `rdfs:range` of `opda:currency` / `opda:peril`
**AFFIRM (keep `rdfs:range skos:Concept` + the existing SHACL `sh:in`/`sh:nodeKind sh:IRI` scoping).
Ballot: FOR (keep / against change).**

Both alternatives rejected, on web-verified grounds:
- `rdfs:range opda:CurrencyScheme` is a **formal category error**, not merely lossy. A
  `skos:ConceptScheme` "can be viewed as an aggregation of one or more SKOS concepts" (SKOS §4.1)
  and membership is the relation `skos:inScheme`, whose range SKOS fixes to `skos:ConceptScheme`
  (§4.3 S4); the scheme is **disjoint** from the concept class (Isaac's S9). By OWL 2 Primer §4.6
  ("a domain (or range) statement is not a constraint … everything we give an age for
  automatically becomes a person"), the range would entail every currency value is `rdf:type` a
  scheme — disjoint from `skos:Concept`, hence an OWL inconsistency the instant a reasoner runs.
- A scheme-typed `skos:Concept` subclass is **permitted** by SKOS (§3.5.1 leaves the Concept↔Class
  relation open — Isaac) but is a **synchronisation liability with zero entailment yield**. To
  *enforce* it you must adopt `sh:class`, which per SHACL §4.1.1 keys on `rdf:type` — forcing a
  re-typing of all ~323 concepts to duplicate what `skos:inScheme` already asserts (Knublauch's
  decisive mechanism point). To leave it un-enforced is inert. Either way it buys nothing the
  `sh:in` does not already, and per Primer §4.6 a subclass-as-range would *license* an
  `rdf:type` inference the project explicitly forbids (ODR-0029 never-reasoned).

The bare range is the entailment-honest minimum: it asserts the one thing true in every model
(value ∈ `skos:Concept`) and delegates closed-world "∈ this scheme" to SHACL, where it belongs.

**Queen-verified fact folded in (finalisation):** the derived `sh:in`-IRI → `skos:inScheme` →
scheme recovery is now **implemented and confirmed** — `MonetaryAmount`→`CurrencyScheme` and
`RiskAssessment`→`PerilScheme` resolve cleanly **from the existing source, range unchanged**. This
**strengthens** the AFFIRM: it retires the last *pragmatic* argument for changing the source ("we
need a tighter range/subclass to make the scheme machine-recoverable") — recovery already works
without touching the range. So the question reduces, exactly as the Queen frames it, to whether the
source idiom should *also* change for OWL-faithfulness alone. **My ruling: no — leave
`range = skos:Concept`; there is no residual OWL gain, and the subclass is a faithfulness *loss*.**
"A little semantics goes a long way" (Hendler 2007) counsels the **minimal commitment that is
true**. The bare range meets that bar: it means exactly what it says. A scheme-typed
`opda:CurrencyConcept` subclass would not — its *intended* extension is the scheme members, but its
*actual* OWL extension under OWA is unbounded (a reasoner may place anything in it; nothing pins it
to {GBP,EUR,USD}). So it is a class that **does not mean what it looks like it means** — the model
asserting a closure it cannot honour. That is *less* faithful than the bare range, not more; and
its only added entailment (`rdf:type opda:CurrencyConcept`) is one the project forbids
(ODR-0029). The faithful OWL move is the smaller one: assert "a concept", and let SHACL + the
now-confirmed derived view carry "which scheme". The subclass earns its place only if currency/
peril concepts ever acquire an *independent* identity-criterion/property that clears the OntoClean
promote-to-subclass bar (ODR-0011 §8a) — i.e. for a reason that is *not* "to name the scheme."
Absent that, `skos:Concept` stands.

### Q2 — Defect or correct-by-design?
**AFFIRM (correct-by-design; the OWL layer must carry nothing more). Ballot: FOR.**

The faithful idiom for "value is a concept drawn from scheme X" is the as-built two-layer split:
`rdfs:range skos:Concept` (OWL, open-world, true in every model) + `sh:in` over the scheme's
member IRIs (SHACL §1.1, closed-world, entails nothing). Three web-verified grounds: SKOS is "not
a formal knowledge representation language" and models concepts as **individuals** (§1.3); scheme
membership is the `skos:inScheme` *relation*, not `rdf:type`/`rdfs:subClassOf` (§4.3 S4); and a
tighter range produces monotonic, unretractable entailments OWA cannot honour for a value-space
that is closed *per application* (Primer §2, §4.6). The empirical confirmation (ODR-0029: the
range closure adds 0 triples) shows the bare range is **inert and safe**, while anything tighter
would be false or hazardous (re-importing SKOS individuals into the OWL extension under reasoning —
ODR-0029/0031 red line). The RangeShape-vs-node-shape `sh:in` placement Isaac flagged is a
correct-by-design SHACL division of labour (predicate-wide type-check vs bearer-scoped value-
space — Knublauch), not an OWL defect. Cosmetic at most.

### Q3 — The string-enum binding
Two separable sub-decisions:

**Q3a — Mint `opda:constrainedByScheme` (object OR annotation property)? REJECT. Ballot: AGAINST.**
Unanimous across the bench. An `owl:ObjectProperty` of that name trips the session-045 Q1 re-open
trigger *verbatim* (045 line 129). An `owl:AnnotationProperty` form is, on the **letter**, outside
that trigger — it carries no formal meaning (OWL 2 Primer §8 "annotation information is not really
part of the logical meaning of an ontology"; §9 "annotations have no formal meaning") — but it is
either (i) redundant with `skos:inScheme` for the IRI cases (Isaac), or (ii) for the string cases,
**derivable only from `sh:message` prose / by hand** over a non-injective value→scheme map (24/264
ambiguous), which is the manufactured-from-prose move the 045 settlement forbids in *spirit*. So
no `constrainedByScheme` property in any form. Knublauch and I both withdrew it after this exchange.

**Q3b — Regenerate the ~21 string-literal `sh:in` as concept-IRI `sh:in`? REVISE. Ballot: FOR
(operator-staged), characterised as a linked-data *dereferenceability* improvement — NOT a present
validation-correctness defect.**

This is the right faithful target, but I record it with the precision the contested debate earned:
- **What it does NOT trip:** changing the *validated values* in `sh:in` from ambiguous strings to
  their canonical concept IRIs is **not** minting a field→scheme relation (Isaac's distinction,
  which I co-sign). `sh:in` stays a validation constraint (SHACL §4.8.3); scheme membership stays
  the already-asserted `skos:inScheme` triple. The OWL layer is untouched (still bare range). So
  it passes the entailment-honesty bar — nothing false is asserted at any step.
- **The honest characterisation (my seat's contribution):** the string→IRI gap is **neither** a
  validation-correctness defect **nor** mere canonicalisation. Cagle is right that with the
  predicate in hand, field→scheme is 1:1 recoverable (6/6 properties), so **no query breaks with
  the predicate in hand** — I concede his re-open trigger stands on its own terms; I cannot
  produce such a query, and I will not dress a frame-shift as discharging it. But the
  predicate→scheme map he relies on is itself **unasserted** (SHACL structure + prose), and a
  *bare value* (downstream payload; `SELECT ?v WHERE {?x ?p ?v}` with `?p` unbound; an open-web
  agent dereferencing a value) cannot recover its scheme. A concept-IRI value is **self-describing
  on the open web** — dereference, one `skos:inScheme` hop yields the scheme — satisfying
  Berners-Lee Linked Data principles 3 ("provide useful information when someone looks up a URI")
  and 4 ("include links to other URIs"), web-verified; a scheme-scoped string literal satisfies
  neither. So the regeneration is a **follow-your-nose / dereferenceability improvement**, which
  honours both Cagle's "no present correctness defect" guard and Isaac/Knublauch's "the prose-only
  binding is a real loss at the LD layer" / ODR-0011 §7a-drift point.
- **The discipline (co-signed):** it is an instance-data-touching change (ODR-0010 overlay `sh:in`
  ⊆ base subset-contract; ODR-0013 severity), executed as an **operator-staged atomic migration**
  — Knublauch's verified reframe: the "instance data" is JSON lifted to RDF, so it is a single
  **lift-contract change** (currency already proves the lift does string→IRI: `"£145000"` → a
  MonetaryAmount with `opda:currency <…/GBP>`), with base + every overlay `sh:in` cut over
  together (else ODR-0010 set-union → empty intersection) and guarded by `ci-baspi5-roundtrip`
  extended to assert the composed `sh:in` = the IRI set-union. **Never a same-version source
  tidy-up.** Where the operator defers the cost, the floor is **STAY `xsd:string` + `sh:in` +
  ODR-0011 §7a, and log the value-level recoverability gap machine-readably** (not in prose a
  transform cannot read).

**My DA-style self-note (not a DA, but for the record):** I do not contest Cagle's HOLD on Q3b; we
agree on disposition and differ only on label, and "dereferenceability improvement, operator-
staged, not a correctness repair" is the synthesis that satisfies his characterisation guard.

**Credit where a peer's argument is sharper (intellectual-honesty note for the Queen):** I conceded
to Cagle that *I* could not produce a query that breaks "with the predicate in hand." **Knublauch
can, and his is the stronger candidate to literally discharge Cagle's trigger** — the native SKOS
graph traversals `?x opda:marketingTenure ?v . ?v skos:inScheme ?s` (and `?v skos:notation ?c` /
`?v skos:broader ?super`) return **empty today even with `?x` and the predicate bound**, because
the instance value is the literal `"Freehold"`, not the concept IRI. That is a query that breaks
with the predicate in hand — it just relies on *native in-graph SKOS traversal* rather than an
*out-of-band predicate→scheme table* (Cagle's recovery). My dereferenceability framing (open-web
self-describing values) and Knublauch's SKOS-traversal framing name the **same root**: the
instance value carries no edge to the SKOS layer. I flag this so the Queen weighs Knublauch's
query, not just my frame, against Cagle's HOLD. The disposition is unaffected (all of us:
operator-staged migration, ratified target, no tidy-up); whether it rises to "present correctness
defect" vs "dereferenceability gap" is the residual the Queen adjudicates, and Knublauch's empty-
traversal queries are the strongest evidence on the "correctness" side.

### Inbound finals (mirrored — summary)

**← Knublauch (FINAL):** Q1 AFFIRM keep / FOR; Q2 AFFIRM correct-by-design / FOR; **Q3 REVISE /
FOR** (concept-IRI `sh:in` as ratified target, operator-gated atomic migration, annotation
property REJECTED). Records the gap as *canonicalisation at the field level + correctness at the
value→SKOS-edge level* (his four empty SPARQL traversals) + §7a-drift; WITHDREW his HOLD on the
regen sub-question under that wording, reducing it to "never a TBox relation, never a tidy-up,
derived-view/panel as interim." Fully convergent with me on disposition.

**← Cagle-DA (FINAL):** Q1 AFFIRM/AGAINST-change (HOLD, affirming pole); Q2 AFFIRM/AGAINST-more-OWL
(HOLD, affirming pole); **Q3a REJECT** the TBox property (AGAINST; trips 045 line-129); **Q3b
ABSTAIN** — PARTIAL WITHDRAW (granted Isaac's value-vs-relation distinction) + HOLD (records it as
canonicalisation, recoverability-already-present 6/6 1:1; cost real per ODR-0010/0013). Re-open
trigger: a query that breaks *with the predicate in hand* (gates HOLD→full WITHDRAW); + re-open
toward REJECT if proposed as a same-version tidy-up or mischaracterised as a correctness repair.

### Citations (all web-verified against the live W3C Recs / spec, 2026-06-16)
- OWL 2 Primer §2 (OWA), §4.6 (range = inference not constraint), §8/§9 (annotations carry no
  formal meaning).
- SKOS Reference §1.3 (not a formal KR language; concepts as individuals), §3.5.1 (Concept↔Class
  relation left open), §4.1 (scheme = aggregation), §4.3 S4 (`skos:inScheme` range = ConceptScheme;
  + S9 disjointness, per Isaac).
- SHACL §1.1 (validation, not assertion), §4.1.1 (`sh:class` ⇒ `rdf:type` membership), §4.8.3
  (`sh:in`).
- Berners-Lee, "Linked Data" Design Issues — principles 3 & 4 (dereferenceable, self-describing
  URIs).
- Hendler, "Where Are All the Intelligent Agents?", IEEE Intelligent Systems 22(1), 2007 — "a
  little semantics goes a long way."
- Project: ODR-0011 §7a (lexical-form `sh:in`-on-concept-URI table), ODR-0010 (overlay `sh:in` ⊆
  base), ODR-0013 (severity), ODR-0029/0031 (never-reasoned), session-045 Q1 (24/264; 0 asserted
  `skos:exactMatch`; line-129 re-open trigger).
