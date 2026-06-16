# Session 045 — Holger Knublauch (SHACL / schema-constraint lens)

Co-editor, W3C SHACL Recommendation (Shapes Constraint Language, W3C Rec 20 July 2017).
Lens: SHACL as a schema/constraint language — node & property shapes, `sh:in`, `sh:class`,
`sh:node`, `sh:datatype`, `sh:nodeKind`, target declarations, SHACL-SPARQL. The
SHACL-as-schema view: shapes describe the *structure data is allowed to take*, distinct
from the RDFS/OWL T-Box that describes what the vocabulary *means*.

---

## VERIFIED FACTS I rely on (checked against the committed artefacts)

The single decisive fact for Q1 is that **there are two structurally different kinds of
`sh:in` in this corpus**, and they are not interchangeable:

**(A) String-literal enumerations** — the majority (`BroadbandConnectionValueShape`,
`ConstructionTypeValueShape`, `OfstedRatingValueShape`, `OwnerTypeValueShape`,
`MarketingTenure…`, `PriceQualifier…`, `TransportType…`, etc.; ~the 21
`sh:targetSubjectsOf` value-shapes):

```turtle
sh:property [ sh:datatype xsd:string ;
              sh:in ( "None" "ADSL copper wire" "Cable" "FTTC (Fibre to the Cabinet)" … ) ;
              sh:message "opda:typeOfConnection MUST be one of the
                          opda:BroadbandConnectionTypeScheme member values …"@en ;
              sh:path opda:typeOfConnection ; sh:severity sh:Violation ] ;
sh:targetSubjectsOf opda:typeOfConnection .
```

The enumerated members are **plain `xsd:string` literals**, NOT concept IRIs. The scheme
name (`opda:BroadbandConnectionTypeScheme`) appears **only inside the `sh:message`
English prose**. I grepped the merged shapes for any machine-readable scheme link
(`skos:inScheme`, `opda:scheme`, `opda:usesScheme`, `sh:class …Scheme`) — **NONE exists**.
There is no triple in the shapes graph that connects this property shape to the scheme.

**(B) IRI enumerations** — the minority (`MonetaryAmountShape` `opda:currency`; the
`opda:peril` shape in the risk node-shape):

```turtle
sh:property [ sh:nodeKind sh:IRI ;
              sh:in ( <…/scheme/currency/GBP> <…/scheme/currency/EUR> <…/scheme/currency/USD> ) ;
              sh:path opda:currency ; … ] ;
```

Here the enumerated members **ARE dereferenceable concept IRIs**, and I confirmed each is
`skos:inScheme opda-v:CurrencyScheme` (opda-vocabularies.ttl:1007/1016/1025). The scheme is
**recoverable by a deterministic join**: `sh:in` member IRI → its `skos:inScheme` → scheme.

**Adjacent fact (the `→Concept` object properties):** `opda:currency` and `opda:peril`
declare `rdfs:range skos:Concept` (descriptive.ttl:894/958) — a **bare generic
`skos:Concept`**, not the specific scheme. So even the OWL-layer edges that DO reach a
vocabulary land on one shared "Concept" node, not on `CurrencyScheme`/`PerilScheme`.

**SKOS shape of the layer:** no structural `skos:broader`/`skos:narrower` anywhere — both
grep hits are in `skos:scopeNote`/`rdfs:comment` *prose* explaining the deliberate flatness
(every concept is `skos:topConceptOf`; SKOS Reference §8.6 `skos:topConceptOf`). The 49
scheme-stars are flat **by design**, not by omission.

---

## OPENING POSITIONS

### Q1 — class→vocabulary bridge from `sh:in` — **REVISE / FOR (qualified)**

The Devil's Advocate (Cagle) will say a `sh:in` is a validation constraint, not an
ontological relation, and re-casting it as a graph edge is a category error. **He is right
about case (A) and wrong about case (B), and the resolution is to honour that split.**

SHACL is explicitly a *schema* language (SHACL Core §1: "a language for validating RDF
graphs against a set of conditions"; §1.5 *SHACL and the Open World* — shapes describe a
closed expectation over data). A shape is not part of the T-Box meaning of `opda:Property`;
it is a statement about the *structure instances must take*. So surfacing **a property
shape's existence** as a first-class **ontological** `rdfs:subClassOf`-style edge would be
a category error. That much I grant Cagle.

But the question is narrower: can a *derived view* recover, from `sh:in`, the statement
"instances of class C, on property p, draw their values from scheme S"? That is **not**
re-labelling the constraint as an ontological axiom — it is reporting, faithfully, a
**recoverable dependency** that the schema layer asserts. The honest predicate is a
**derived, namespaced `opda:usesScheme`** carried on a *distinct graph layer* (see Q3), with
provenance back to the shape — never minted into the T-Box, never an `rdfs:`/`owl:` edge.

The two cases must be drawn differently:

- **(B) IRI-enum / `→Concept`-range:** **draw the edge.** The scheme is *machine-recoverable*
  by the `sh:in`-member → `skos:inScheme` → scheme join (or, for the object property, by
  pointing the range at the specific scheme). This is a deterministic, byte-stable transform
  over data that already exists. `class --opda:usesScheme--> CurrencyScheme` /
  `--> PerilScheme` is a faithful, *recoverable* statement. **FOR.**

- **(A) string-literal enum:** **do NOT synthesise the edge from the extractor.** The scheme
  linkage exists **only in `sh:message` prose** — an English string is not a recoverable
  semantic relation, and parsing prose to mint graph edges is exactly the category error
  Cagle warns of (and is non-deterministic/brittle, violating the drift-gate constraint).
  The correct fix is **upstream in the data**: make the binding machine-readable —
  EITHER add `sh:class opda:BroadbandConnectionTypeScheme` style metadata / an
  `skos:inScheme` join by switching the enum to IRIs, OR carry an explicit
  `opda:usesScheme` annotation on the property/shape. Once the binding is a *triple*, the
  extractor draws it for free by the same rule as (B). **Until then, the string-enum
  classes correctly show no scheme edge — the disconnection is honest** (this is the seam
  Cagle and I actually agree on).

So: **REVISE the extractor** to draw `opda:usesScheme` for case (B) (recoverable join), and
**REVISE the ontology** to make case (A)'s binding machine-readable so it joins the same
way. I do **not** support prose-scraping. Predicate: derived `opda:usesScheme` on a SHACL/
derived layer, provenance to the originating shape.

### Q3 — SHACL as a distinct layer — **AFFIRM (separate it) / FOR**

SHACL shapes, SKOS concepts, and the OWL T-Box are *different kinds of statement* and
belong on *different layers*. SHACL Core §2 ("Shapes and Constraints") frames shapes as a
graph **about** the data graph — a meta-layer. Unioning `sh:NodeShape`, `skos:Concept`,
`owl:Class` onto one untyped node-link canvas conflates "what the vocabulary means"
(T-Box), "what values exist" (SKOS), and "what structure data must take" (SHACL). An
`opda:layer` view-dimension (toggleable, grouped) is the faithful presentation. **FOR.**

### Q4 — surfacing shapes — **REVISE / FOR (badges, not nodes)**

Property shapes are **constraints on properties**, not entities. They should surface as
**badges/annotations on the property and class they target** (e.g. "constrained: `sh:in` 5
values", "`sh:minCount 1`"), NOT as 325 free-standing nodes that would swamp the canvas and
mis-imply shapes are domain entities. This matches the TopBraid/SHACL convention of
rendering shape constraints *as form/field metadata on the thing they constrain*, not as
peer objects (SHACL Core §1.4 "Validators and Constraint Components" — a constraint
component qualifies a focus node; it is not itself a modelled subject). On the "40 classes"
question, see my note to Q2: 40 is **correct-by-doctrine**; the mass is attributes + coded
values, which are not classes. The fix is *communication* (the layer view of Q3), not
inflating the class count. **FOR** surfacing as badges; **AGAINST** treating shapes as nodes.

### Q2 — unconnected classes — **ABSTAIN (defer to Guizzardi/identity lens)**

Whether relator-mediation or `rdf:type`→gUFO-category should be drawn as real edges is an
identity-criterion / UFO question, not a SHACL one. I note only the SHACL-relevant corollary:
once Q1(B) lands, several "orphan" classes that carry coded properties (e.g. the descriptive
classes behind `ofstedRating`, `ownerType`) gain a `usesScheme` edge and stop floating — so
**part of #1's disconnection is an artefact of the missing bridge, not of the rigid model**.
But the relator/role connectivity proper is Guizzardi's call. **ABSTAIN.**

---

## EXCHANGES
(DMs to team `council-045` mirrored verbatim below as I send them.)

### → Cagle-DA (opening, Q1) — sent
> Holger Knublauch (SHACL co-editor) → Cagle-DA, on Q1.
>
> I think we agree more than the framing suggests — but the agreement has a precise seam, and I want to nail it.
>
> You'll argue: a `sh:in` is a *validation constraint*, not an ontological relation; re-casting it as a class→scheme graph edge is a category error. On the GENERAL point I concede outright: SHACL Core §1 frames shapes as "conditions to validate RDF graphs against"; §1.5 (SHACL and the Open World) makes a shape a closed expectation over *data*, not a statement of T-Box *meaning*. A property shape is NOT part of what `opda:Property` means. So minting an `rdfs:`/`owl:` edge from a shape would indeed be a category error. Granted.
>
> But I've verified the corpus splits `sh:in` into two structurally different cases, and the category-error charge only lands on ONE of them:
>
> (A) STRING-LITERAL enums (the ~21 `sh:targetSubjectsOf` value-shapes — Broadband, ConstructionType, OfstedRating, OwnerType…): `sh:datatype xsd:string` + `sh:in ("None" "Cable" …)`. The members are plain strings, NOT IRIs. The scheme name lives ONLY in the `sh:message` prose. I grepped the merged shapes for ANY machine-readable scheme link (`skos:inScheme`/`opda:scheme`/`sh:class …Scheme`) — there is NONE. Here you are 100% right: there is no recoverable relation, only English prose, and scraping prose to mint edges is brittle, non-deterministic (breaks the drift-gate), AND the category error you name. I will NOT synthesise an edge for (A) from the extractor. The string-enum classes correctly show no scheme edge — the disconnection is honest.
>
> (B) IRI enums (MonetaryAmount `opda:currency`; the `opda:peril` shape): `sh:nodeKind sh:IRI` + `sh:in (<…/currency/GBP> <…/EUR> <…/USD>)`. The members ARE dereferenceable concept IRIs, and each is `skos:inScheme opda-v:CurrencyScheme` (verified, vocabularies.ttl:1007+). Here the scheme is recoverable by a deterministic JOIN — `sh:in`-member → `skos:inScheme` → scheme — over triples that ALREADY EXIST. Drawing `class --opda:usesScheme--> CurrencyScheme` is not re-labelling a constraint as an axiom; it is *reporting a recoverable dependency* on a distinct derived layer, with provenance to the shape, never into the T-Box.
>
> So my Q1 is REVISE/FOR but ONLY for (B), and I make (A) machine-readable upstream (add the `skos:inScheme` join / an explicit `opda:usesScheme` annotation) so it then joins by the same rule — rather than ever parsing `sh:message`.
>
> Question to you: does a derived `opda:usesScheme` edge, (i) namespaced opda: not rdfs:/owl:, (ii) on a separate layer, (iii) provenance-linked to the shape, (iv) drawn ONLY where the scheme is machine-recoverable (case B) — still trip your category-error objection? Or is your objection specifically against (A)-style prose-derived edges and against putting ANY shape-derived fact in the OWL layer? If it's the latter, we may be in violent agreement.

### → Isaac (opening, Q1 + SKOS layer) — sent
> Holger Knublauch (SHACL) → Isaac (SKOS), on Q1 and the SKOS layer.
>
> I need your SKOS-Reference judgement on whether a join I'm proposing is a *faithful* recovery of scheme membership or an abuse of it.
>
> For the IRI-enum `sh:in` case (MonetaryAmount `opda:currency`: `sh:in (<…/currency/GBP> <…/EUR> <…/USD>)`, each member `skos:inScheme opda-v:CurrencyScheme`), I want the graph extractor to derive a class→scheme edge by the join: `sh:in`-member IRI → its `skos:inScheme` → the scheme. Is "this property's value-space is the set of `sh:in` IRIs, all of which are `skos:inScheme` S" a sound basis to say the class *uses* scheme S? My read of SKOS Reference §8 (`skos:inScheme` — "relates a resource to a concept scheme in which it is included") is that inScheme is exactly the membership predicate that makes this join legitimate. Agree?
>
> [two SKOS-layer questions on flat schemes (§8.6 topConceptOf) and the bare-generic `rdfs:range skos:Concept` on currency/peril — full text in the sent message]
>
> My Q1 verdict is REVISE/FOR for the IRI-recoverable case, REJECT prose-scraping for the string-enum case (fix that upstream by making the binding a triple). Where do you land on using `skos:inScheme` as the join key?

### → Cagle-DA (after reading his opening; pinning the residual) — sent
> Knublauch → Cagle-DA. I've now read your opening. We are in violent agreement on Q1's structure — your fallback (line 40: "a derived, explicitly-typed `opda:usesScheme`, rendered as a distinct dashed constraint-derived edge class that never masquerades as an asserted object property, sourced ONLY from the IRI-bearing `sh:in` sets, never from string-literal + `sh:message` parsing") is, predicate for predicate, my REVISE/FOR(B). So let me retire the rhetoric and pin the ONE technical claim where you go a step further than I'd accept:
>
> You write (line 36): "even those [currency, peril] enumerate *individual concepts*, not the *scheme*, so 'class uses scheme S' is still an inference the data does not contain."
>
> I want to rebut that precisely, because it's the difference between "fabrication" and "recovery." The scheme IS in the data — one asserted hop away. Verified: `<…/currency/GBP> skos:inScheme opda-v:CurrencyScheme` is an EXPLICIT triple (vocabularies.ttl:1016), not an entailment. So the chain `sh:in` member IRI → `skos:inScheme` → CurrencyScheme is a JOIN over two asserted triples, neither invented. Per SKOS Reference §8.1, `skos:inScheme` is THE predicate that "relates a resource to a concept scheme in which it is included" — i.e. the data explicitly says these concepts ARE the scheme's members. "The value-space of `opda:currency` on MonetaryAmount = {GBP,EUR,USD}, and {GBP,EUR,USD} ⊆ members(CurrencyScheme) by asserted inScheme" is not an inference beyond the data; it is the data, joined. That is categorically different from your (A) case, where the only thing naming the scheme is an English `sh:message` — THERE I fully agree it would be fabrication.
>
> So I'd ask you to narrow your "inference the data does not contain" specifically to (A) (string-enum, scheme-in-prose), and concede that for (B) the `skos:inScheme` join makes `opda:usesScheme` a RECOVERED edge, not a synthesised one — provided it's (i) opda:-namespaced, (ii) on a derived/SHACL layer, (iii) provenance-linked to the shape, (iv) drawn ONLY where every `sh:in` member resolves to a scheme via asserted `inScheme`. Note Hendler and Isaac independently land in the same place: Hendler says fix it via the object-property range (`currency→Concept` should resolve to the owning scheme), Isaac says `inScheme` is the right idiom and the source should carry it. There are thus TWO deterministic routes to the (B) edge — the `sh:in`→`inScheme` join AND the range-tightening — and both read asserted triples.
>
> Does the asserted-`inScheme`-join distinction move you to AFFIRM the narrow (B) edge, holding your AGAINST strictly for (A)? If so I think Q1 is a clean panel consensus: REVISE — derived `opda:usesScheme` for the IRI-recoverable subset only; REJECT prose-scraping; fix (A) upstream by making its binding a triple.

### → Hendler (after reading his opening; converging the two routes) — sent
> Knublauch → Hendler, on Q1 (and a nod to Q3/Q4 where we already agree).
>
> Read your opening — we converge cleanly, and you sharpened one thing I want to lock in. You note (your line 35) that for currency/peril "the defect is not a missing edge — it is that those two object properties point at a bare generic `Concept` instead of the specific scheme … a model-extractor fix, not a SHACL-derived fiction." Agreed, and verified: `opda:currency`/`opda:peril` both declare `rdfs:range skos:Concept` (descriptive.ttl:894/958), which is why the graph collapses them onto one shared "Concept" node.
>
> So I think we should name TWO deterministic routes to the same (B) edge, because the corpus supports both and they cross-check each other:
> 1. Your route — resolve the `currency`/`peril` object-property range to its OWNING scheme (the object property already exists; the extractor just needs to map `skos:Concept` range → the scheme its enumerated values sit in).
> 2. My route — the `sh:in`-IRI → `skos:inScheme` → scheme join (MonetaryAmountShape currency `sh:in` members are each explicitly `skos:inScheme CurrencyScheme`, vocabularies.ttl:1016).
>
> Both read only ASSERTED triples; both are byte-deterministic (satisfies the drift-gate); both yield `class --opda:usesScheme--> CurrencyScheme`/`PerilScheme` on a derived layer, never into the TTL. Route 1 fixes the existing edge's TARGET; route 2 recovers the edge where only a shape carries the value-space. For the string-literal `sh:in` cases (the other ~10) we ALL agree: no scheme exists in the data, so no edge — fix upstream by making the binding a triple, never parse `sh:message`.
>
> [+ alignment on his Q3 `opda:layer`-as-first-class-facet and Q4 badge-not-node — both my SHACL-as-schema position; SHACL Core §2 shapes are a meta-layer ABOUT the data graph]

**Position deltas from reading peers (pre-reply):** none to my verdicts. Cagle's Q1 fallback == my (B); Hendler's range-fix is a *second* route to my (B) edge (I now name both); Isaac's "fix the source" == my (A) upstream fix. Isaac's finding #2 (extractor reads `skos:hasTopConcept` but source asserts inverse `skos:topConceptOf`; `topConcepts:[]` everywhere) is a real orthogonal extractor bug — and since `topConceptOf ⊑ inScheme` (SKOS §8.6.2) it only *reinforces* my (B) join key; verified my join stands on the directly-asserted `skos:inScheme` triple (vocabularies.ttl:1007/1016/1025), independent of that bug.

**Cagle↔Guarino convergence (read in Cagle's file):** Cagle, Guarino and I reached the identical Q1 line independently (IRI-grounded only; dashed constraint-derived edge; never an asserted object property; bare-string → draw nothing). Guarino's *Welty & Guarino 2001 "draw only relations that hold"* is the cleaner framing of my SHACL §1.5/§4.6.1 point. Cagle ruled the bare-string `sh:in` "correct-by-doctrine, not a defect" (ODR-0011 §7a) and proposed referring the emitter/binding-assertion change to a **modelling council** (out of scope for this viz-and-extractor council). I endorse the scoping; I refine the "defect" wording (see reply below).

### → Cagle-DA (3 rulings; refine "defect"; correct the (B) overreach; endorse scoping) — sent
> Knublauch → Cagle (DA). I've read your full thread — you, Guarino and I have independently converged, and your reply to Guarino settles the scoping cleanly. Three rulings from the SHACL chair to lock the consensus, including one place I'd refine your wording:
>
> 1. ON "IS BARE-STRING `sh:in` A DEFECT?" — I rule: it is NOT a SHACL defect, AND it is a modelling/documentation gap. These are not contradictory and the panel should state both. As a SHACL constraint, `sh:datatype xsd:string ; sh:in ("Freehold" "Leasehold" "Commonhold")` is perfectly correct — it validates exactly the value-space the instance data carries (string literals, per the PDTF JSON lineage), per SHACL Core §4.6.1. Nothing about SHACL says the list members must be IRIs. So I AGREE with your "correct-by-doctrine, not a defect" against the charge that the SHACL is wrong. But I'd refine: it is correct AS A CONSTRAINT while still leaving the scheme-binding non-machine-readable — which is why drawing the edge from it would be fabrication. The shape isn't broken; it just doesn't ASSERT the relation the proposition wants. That's the precise reason we draw nothing for (A): not "the SHACL is right so leave it," but "the SHACL is a validation condition, not an assertion of the binding" (SHACL Core §1.5, open-world).
>
> 2. ON YOUR ONE OVERREACH (your line 36 / your Guarino reply): you say the IRI sets "list individual concepts, not the scheme," implying even (B) is an inference the data lacks. I must correct this — the join is the whole hinge: `<…/currency/GBP> skos:inScheme opda-v:CurrencyScheme` is an EXPLICIT asserted triple (vocabularies.ttl:1016). So `sh:in`-member → `skos:inScheme` → scheme is a JOIN over two asserted triples — a RECOVERY, not an inference. The (B) edge "holds" in your own Welty-&-Guarino-2001 sense. Please narrow your "AGAINST" strictly to (A); for (B) I read your fallback (dashed constraint-derived edge, IRI-sourced only) as an AFFIRM of the narrow edge, and I'd like the panel record to show (B) as consensus-FOR, not merely tolerated.
>
> 3. ON SCOPING — I fully endorse your referral: the EMITTER change is OUT OF SCOPE for this viz-and-extractor council and belongs to a modelling council. This council's Q1 answer is therefore: REVISE the extractor to draw the derived `opda:usesScheme` for the 2 IRI-recoverable cases (currency, peril) — via either the `sh:in`→`inScheme` join OR Hendler's range-resolution, both deterministic; REJECT any string-derived edge; REFER the binding-assertion question to a modelling council. Agreed on all three?
>
> On `sh:targetSubjectsOf` (your closing question): no, value-keyed targeting does NOT make `sh:in` a class-scoped RELATION I'm underselling. `sh:targetSubjectsOf opda:typeOfConnection` selects FOCUS NODES for validation (SHACL Core §2.1.3) — it scopes WHICH NODES the constraint applies to, not a relation between a class and the scheme. A targeting mechanism, not an edge.

### → Isaac (answer his 2 SHACL-author questions; amplify his topConceptOf finding) — sent
> Knublauch → Isaac. Answering your two SHACL-author questions directly, and confirming your `skos:inScheme` join.
>
> YOUR Q(1) — "is `sh:in (strings)` the WRONG shape?" My ruling: NOT the wrong shape — it is CORRECT for the value-space the instance data carries (string literals, e.g. evidenceType = "Document"), per SHACL Core §4.6.1. Rewriting to `sh:in (<…IRIs>)` / `sh:class` over concept IRIs imposes a HEAVIER interop contract (every instance must carry a dereferenceable concept IRI), which the source doesn't. So I push back on "wrong shape" — right shape for string-valued data. BUT it leaves the class↔scheme binding non-machine-readable: correct-as-a-constraint AND a documentation gap — not a SHACL bug, a missing assertion.
>
> YOUR Q(2) — "should 'uses scheme' be a derived `opda:usesScheme` ASSERTED on the class, not constraint-inferred?" YES, with a split: STRING-enum cases → binding genuinely not in RDF → only faithful fix is to ASSERT it (concept-IRI `sh:in`, or an explicit `opda:usesScheme` annotation) → scoped to a MODELLING council. IRI-enum cases (currency, peril) → binding IS already in RDF (`skos:inScheme`, vocabularies.ttl:1016) → extractor JOINS, doesn't guess → draw derived `opda:usesScheme` WITHOUT a source change. Is "every `sh:in` member resolves via asserted `skos:inScheme` to S, therefore the class draws coded values from S" a faithful use of `skos:inScheme` (SKOS §8.1)?
>
> Bonus — your finding #2 amplified: extractor reads `skos:hasTopConcept` (model.mjs:184) but source asserts inverse `skos:topConceptOf` → `topConcepts:[]` on all 49 schemes. Per SKOS §8.6.2, `topConceptOf ⊑ inScheme` and inverse of `hasTopConcept` — extractor should materialise both directions. A real, separable extractor fix (and it strengthens my (B) join). Carry it as its own line item — "extractor must read `topConceptOf`/`inScheme` symmetrically per SKOS §8.6.2" — independent of Q1?

### ⇄ POSITION CHANGE (Guizzardi caused) — predicate rename `usesScheme` → `constrainedByScheme`
Guizzardi (guizzardi.md:22/26) voted **AGAINST minting/asserting `opda:usesScheme`** because "uses" connotes the Kind *using* the vocabulary the way it *mediates a relator* — a relator-shaped reading (his Quality/Quale value-vs-relation line; Guizzardi 2005 Ch.4 §4.3; ODR-0031 Rule 8 "no `sh:in` shape in a relation role"). **He is right and I changed my predicate.** As the SHACL author the faithful name follows what the edge *reports*: the property's value-space is **constrained to** the scheme's members — a constraint-derived statement. So my derived edge is now **`opda:constrainedByScheme`** (or `drawsValuesFrom`), NOT `usesScheme`. This is *not* a substantive change to my ballot (always derived/dashed/view-layer/never-TTL) — it corrects the NAME so the panel record can't misread it as an asserted relation. Note Guizzardi's & Davis's "AGAINST `usesScheme`" was always **AGAINST it as a TBox/asserted triple** — which I never proposed — so once "derived view-layer, renamed `constrainedByScheme`" is pinned, there is **no real split** on Q1 across the whole panel.

### → Guizzardi (concede the rename; test the notation-match route) — sent
> Knublauch → Guizzardi, on Q1. You've moved me on the predicate name… [CONCESSION: `usesScheme`→`constrainedByScheme`, derived/dashed/never-TTL; aligned FOR recovery / AGAINST TBox relation; ODR-0031 Rule 8 is the guard.] WHERE I WANT TO TEST YOU — the literal-`sh:in` recovery via `skos:notation` matching: it's a HEURISTIC join not guaranteed-total; I doubted the broadband labels are even notations; and even if total it reconstructs a binding the data doesn't assert → modelling-council work. Proposal: (A) notation-match NOT in the deterministic extractor now → REFER; (B) `skos:inScheme` join is asserted+total → draw now.

### → Guizzardi (CORRECTION + the 1-to-many ambiguity finding) — sent
> Knublauch → Guizzardi — CORRECTION. I claimed I "doubt the broadband labels are notations." **I was WRONG** — verified the string-enum literals ARE the `skos:notation` values verbatim ("Cable" :680, "FTTC (Fibre to the Cabinet)" :688, "Freehold"/"Leasehold"/"Commonhold" :2171/:2179/:2163). Your notation-match route is MORE viable than I allowed.
> BUT verifying surfaced a decisive obstacle — AMBIGUITY not absence: "Freehold"/"Leasehold"/"Commonhold" each appear as `skos:notation` in TWO schemes (TenureKindScheme :2163-2179 AND a second/overlay copy :2671-2687); "Not applicable" is a `skos:notation` on FOUR concepts (:624/:824/:1995/:2916). So a literal `sh:in` member resolves ONE-TO-MANY — the extractor would have to pick a scheme, and disambiguation lives only in `sh:message` prose (prose-scraping, rejected). Corrected picture: notation-match is feasible per-literal but NOT per-scheme-unambiguous → cannot be a sound deterministic transform as-is. Clean fix = source assertion (concept-IRI `sh:in`, which carries the scheme via `skos:inScheme` and KILLS the ambiguity, OR an explicit `constrainedByScheme` annotation naming the intended scheme) → modelling council. Scoping stands, better-grounded: (B) now via asserted `inScheme`; (A) REFERRED with concrete deliverable "disambiguate the binding by asserting it — notation-match is 1-to-many."

**VERIFIED (vocabularies.ttl):** string-enum literals == `skos:notation` verbatim (so notation-match is *possible*), BUT notation is **1-to-many across schemes** (Freehold/Leasehold/Commonhold ×2 schemes; "Not applicable" ×4 concepts) → notation-match is **not a sound deterministic transform** for (A); the disambiguating intent is only in `sh:message` prose. This is a NEW finding that hardens the (A)-referral with a concrete deliverable, and it does NOT touch (B) (currency/peril `skos:inScheme` join is unambiguous + asserted).

### REPLIES RECEIVED (peers → me) + my closing DMs

**Cagle (← my (B) argument):** moved from hard REJECT to **REJECT(string-edge)/REVISE(IRI-join only)** — "Knublauch's case-(B) construction is *exactly* my stated fallback… we are in violent agreement. Three SHACL/ontology authorities (Knublauch, Guarino, me) now hold the identical Q1 line." Confirmed my (B) edge "does NOT trip my objection." Proposed **four guardrails** (1 SOURCE=`inScheme` join only, never `sh:message`/never bare `rdfs:range`; 2 STYLING=distinct dashed edge excluded from objectProperty count; 3 NAMESPACE=derived in elements doc, not minted as `owl:ObjectProperty`; 4 DETERMINISM=pure transform in drift gate) and asked me to co-sign.

**Isaac (← my join-key question):** ruled the `skos:inScheme` join **a faithful recovery, not an abuse** — SKOS Reference §8.1 (`inScheme` is THE membership predicate); "joins two *asserted* triples, neither entailed, neither invented… categorically a RECOVERY." AFFIRMs the narrow (B) edge on my four guards. Confirmed (A) has no `inScheme` to join → no faithful edge. Asked if I'd fold his `topConceptOf`-recovery into my Q3.

**Hendler (← my two-routes):** converged; he + Guarino settled the joint Q3 (layer facet; OWL default; currency/peril the ONLY inter-stratum bridge; SKOS its own instrument). Routes 1+2 co-valid.

### → Cagle (co-sign 4 guardrails + rename amendment + notation evidence) — sent
> Knublauch → Cagle. I co-sign your four guardrails as the Q1 disposition language — with ONE amendment to the predicate name that Guizzardi moved me on… [co-signs guardrails 1-4 verbatim intent; AMENDMENT: predicate is `opda:constrainedByScheme` not `usesScheme` — "constrained-by" cannot be misread as an asserted object property, makes guardrail 3 self-evident; SHACL Core §4.6.1. NEW EVIDENCE: notation-match literals DO equal notations BUT 1-to-many across schemes → forecloses the last (A) route, confirms guardrail 1's IRI-`inScheme`-only.] Co-signed disposition line: "Q1: AFFIRM the string-enum disconnection is honest; REVISE the extractor to draw the IRI-grounded `constrainedByScheme` on a distinct derived layer under guardrails 1-4; REFER any emitter/binding-assertion change to a modelling council."

### → Isaac (fold topConceptOf into Q3 as a numbered precondition + note rename) — sent
> Knublauch → Isaac. Yes — I fold your `topConceptOf`-recovery into my Q3 REVISE, and I want it carried as its own numbered line item because it's a precondition, not a nicety… [verified the drop independently; SKOS §8.6.2 S7/S8 materialising the inverse is spec-sanctioned; restated my Q3 REVISE as 6 numbered items incl. item 6 = the `topConceptOf` precondition; noted `usesScheme`→`constrainedByScheme` rename for him to mirror.]

---

## FINAL — settled per-question verdicts (SHACL / schema-constraint seat)

The panel reached a clean, grounded consensus. My verdicts are unchanged in **direction** from my opening; two were **sharpened** (Q1 narrowed + predicate renamed) by cross-talk. Citations all meet the §Citation-grounding standard (W3C SHACL Recommendation + section; W3C SKOS Reference + section).

### Q1 — class→vocabulary bridge from `sh:in` — **REVISE / FOR (narrow)**
**Verdict:** Draw a **derived `opda:constrainedByScheme`** edge ONLY for the **IRI-recoverable** cases (currency, peril), via the deterministic join `sh:in`-member IRI → asserted `skos:inScheme` → ConceptScheme (equivalently, resolve the currency/peril object-property `rdfs:range skos:Concept` to the owning scheme — two cross-checking routes). **REJECT** any edge derived from the **string-literal** `sh:in` cases: the scheme is named only in `sh:message` prose (no machine-readable link — I grepped: no `skos:inScheme`/`opda:scheme`/`sh:class …Scheme` in the shapes), and `skos:notation`-matching is 1-to-many across schemes (verified) so it can't deterministically resolve — both routes are fabrication/non-deterministic, breaking the drift gate. The string `sh:in` is a **correct constraint** (validates string-valued instance data per SHACL Core §4.6.1) that simply **does not assert** the binding — so the disconnection is honest. **REFER** making the (A) binding machine-readable (concept-IRI `sh:in`, or an explicit `opda:constrainedByScheme` annotation) to a **modelling council** — out of scope for this viz/extractor council.
**Ballot:** REVISE — **FOR** the narrow IRI-grounded derived edge under the four guardrails; **AGAINST** any string-`sh:in`-derived edge.
**Citation:** SHACL Core §1.5 (a shape is a closed expectation over *data*, not a T-Box assertion) + §4.6.1 (`sh:in` constrains the value node to a list of terms); SKOS Reference §8.1 (`skos:inScheme` is the membership predicate that licenses the recovery join).
**Guardrails (co-signed with Cagle, rename mine):** (1) SOURCE = IRI-`inScheme` join only, never `sh:message`, never bare `rdfs:range skos:Concept`; (2) STYLING = distinct dashed "constraint-derived" edge, own legend bucket, toggleable, EXCLUDED from the objectProperty count; (3) NAMESPACE = derived in the elements doc only, NOT minted as an `owl:ObjectProperty`; (4) DETERMINISM = pure transform inside `make ci-ontology-graph`, no network/NL.

### Q2 — unconnected classes — **ABSTAIN** (with one SHACL corollary)
Outside my seat — it turns on UFO relator semantics (Guizzardi/Guarino) and OWL annotation semantics (Hendler). I concur with the panel that the disconnection is honest (no asserted `roleOf`/`mediates` triple to recover; `ufoCategory` is an inert annotation, not an edge). **SHACL corollary I note for the record:** once Q1(B) lands, the descriptive classes whose coded properties carry the currency/peril value-space gain a `constrainedByScheme` edge and stop floating — so a sliver of #1's "disconnection" was a missing-bridge artefact, not the rigid model. The relator/role connectivity proper is the foundational seat's call.
**Ballot:** ABSTAIN (outside published SHACL position).

### Q3 — layer separation vs one canvas — **AFFIRM / FOR** (separate by register)
SHACL shapes, SKOS concepts, and the OWL T-Box are three different kinds of statement and belong on three layers. A shape is a graph **about** the data graph (SHACL Core §2) — a meta-layer; unioning it with `owl:Class` and `skos:Concept` on one untyped canvas conflates "what the vocabulary means" / "what values exist" / "what structure data must take." My Q3 REVISE (6 items): (1) `layer` ∈ {owl,skos,shacl,external} as a first-class extractor facet; (2) OWL T-Box the DEFAULT view; (3) SKOS its own tree/sunburst instrument (rooted on recovered `topConceptOf`); (4) SHACL as badges on the focus node, not peer nodes; (5) the ONLY inter-stratum edges are the 2 IRI-grounded `constrainedByScheme` bridges; (6) **precondition (Isaac):** the extractor must materialise `skos:topConceptOf` symmetrically with `skos:hasTopConcept` (currently drops all 16 roots).
**Ballot:** AFFIRM — **FOR** explicit layer separation by register.
**Citation:** SHACL Core §2 ("Shapes and Constraints" — a shapes graph is *about* a data graph, a distinct register); SKOS Reference §8.6.2 (`skos:topConceptOf ⊑ inScheme`, inverse of `hasTopConcept` — the dropped-roots precondition).

### Q4 — surfacing the mass / "too few entities" — **REVISE / FOR** (badges, not nodes; 40 is by-doctrine)
The 225 datatype properties are **attributes** and the 325 shapes are **constraints** — neither is a node in a *class* graph. Surface shapes as **badges/annotations on the class & property they target** ("constrained: `sh:in` 5 values", "`sh:minCount 1`"), per the TopBraid/SHACL convention of rendering constraint components as field metadata on the focus node, NOT as 325 free-standing peer nodes (SHACL Core §1.4 — a constraint component *qualifies* a focus node; it is not itself a modelled subject). "40 classes" is **correct-by-doctrine** (coded values are SKOS, not subclasses); the fix is communication (the Q3 layer view + a caption), not inflating the class count.
**Ballot:** REVISE — **FOR** surfacing shapes/attributes as badges + a count; **AGAINST** treating shapes or datatype properties as graph nodes.
**Citation:** SHACL Core §1.4 (Validators and Constraint Components — a constraint component qualifies a focus node, not a peer subject); §2 (shapes are a meta-layer about the data).

### Cross-talk record
Engaged with grounded citations: **Cagle-DA** (Q1 — pinned the string/IRI seam; corrected his "(B) is inference" → recovery via asserted `inScheme`; co-signed his four guardrails), **Isaac** (Q1 join-key faithfulness; folded his `topConceptOf` precondition into my Q3), **Hendler** (Q1 two-routes; Q3 layer-facet alignment), **Guizzardi** (Q1 — he moved me: `usesScheme`→`constrainedByScheme`; I supplied the notation 1-to-many finding foreclosing the last (A) route). **Position change:** predicate renamed `usesScheme`→`constrainedByScheme` (Guizzardi-caused). No ballot reversed direction.

---

## QUEEN'S CHALLENGE (Allemang) + my SHACL ruling — Q1 refinement

**Queen's point (verified):** the class→scheme binding for the STRING-enum (A) cases is *doctrine-grounded*, not arbitrary prose: (i) every coded property's `rdfs:comment` names the scheme — "value-space opda:ConstructionTypeScheme" (descriptive.ttl:153), "…opda:TenureKindScheme" (:518), "…opda:OfstedRatingScheme" (:533), "…opda:BroadbandConnectionTypeScheme" (:772), etc.; (ii) ODR-0011/ODR-0024 R5/R6 makes the base `sh:in` list a SUBSET that unions into the SKOS scheme members, applied via `sh:targetSubjectsOf`. So a derived "usesScheme" view is *computable*. `usesSchemes` is empty only because `ontology-model.mjs:274-276` derives it from `rdfs:range`, never `sh:in`. Her question: given the binding is doctrine-grounded, is a DERIVED `opda:usesScheme` view (not a TBox triple) faithful per SHACL Core §4.6.1?

**My ruling (SHACL chair) — I separate her two fused questions:**

**(1) Is a DERIVED view (not a TBox triple) faithful per §4.6.1? — YES, unconditionally, for the IRI case; and yes IN PRINCIPLE for any case where the scheme is recoverable from an ASSERTED triple.** This was never in dispute: the whole panel (incl. the DA) holds that a derived, dashed, separately-bucketed `constrainedByScheme` that is *never minted into the TBox* respects §4.6.1 (a `sh:in` constrains the value node to a list — a validation condition, surfaced as a constraint-derived affordance, not an `owl:ObjectProperty`). So the *derived-view* part of her question I AFFIRM outright. The contested part was never "derived vs asserted"; it is **"from what is the view computed."**

**(2) Is the (A) view computable by a DETERMINISTIC transform — i.e. is the doctrine-grounded binding machine-recoverable? — NO, not from the current artefacts, and the reason is a pure RDF/SHACL fact:**
- The scheme name in `rdfs:comment` is an **`rdfs:Literal`** — a natural-language annotation. "value-space opda:ConstructionTypeScheme" is a *substring inside an English sentence*, not the object of a triple. Recovering it = **regex a curie out of free prose**. That is the *same operation* as scraping `sh:message`, relocated to a different annotation literal. Per OWL 2 Primer §8.1/§9, an annotation property has **no formal meaning** — `rdfs:comment` carries no entailment a transform may rely on. (Verified the prose is NOT a fixed grammar: the connective varies — "value-space X", "value-space **the existing** X", "**reuses** X", "**per** X", "X **concept**", "X **ISO**"; a parser must enumerate verb phrases and breaks on any reword → fails the byte-identity drift gate.)
- The ODR-0011 subset-union doctrine is enforced by `ShInSemantics_MetaShape` (shapes-merged.ttl:518) — and reading it CONFIRMS the point: it unions via `skos:hasTopConcept|skos:member ?value`, i.e. the doctrine's own machine-check operates on **concept values**, but the base `sh:in` for the string enums holds **string literals**, not those concept values. And it is a `sh:select` **validation** meta-shape (flags violations) — NOT an assertion that materialises a class→scheme edge. So even the doctrine's own enforcement is value-keyed *validation*, not a recoverable *relation*.
- The model DOES capture `rdfs:comment` (extractor :135-147) — so the curie *text* is present; "computable" in the trivial sense (the string is in the model) is true, but "deterministically extractable AS A RELATION" is false. The 1-to-many notation ambiguity (Freehold ∈ 2 schemes, "Not applicable" ∈ 4) means the only thing that disambiguates which scheme a string `sh:in` binds is exactly that prose curie — confirming the binding lives in the annotation layer, not the assertional layer.

**Net:** the Queen's point correctly upgrades the (A) binding's *provenance* from "arbitrary prose" to "doctrine-grounded prose" — a fair and useful refinement I adopt into the disposition language. But it does **not** make the binding a machine-recoverable triple: doctrine-grounded-in-an-annotation is still an annotation. So the verdict is unchanged and now MORE precisely grounded: **the faithful, deterministic fix is to promote the doctrine binding from `rdfs:comment` prose to an ASSERTED triple** — either `sh:in` over the concept IRIs (so `skos:inScheme` joins, killing the ambiguity) OR an explicit `opda:constrainedByScheme` annotation *property* (a triple, not a comment substring) naming the scheme. That is a one-line-per-property emitter change, trivially within the generator's reach — and precisely the **modelling-council** referral. Once asserted, the (A) edge draws by the SAME deterministic rule as (B), no prose parsing, drift-gate intact.

**This does NOT relax guardrail 1.** The disposition stands: the derived view is faithful (§4.6.1) and computed ONLY from asserted triples (`sh:in`-IRI→`skos:inScheme` for (B) now; the same join for (A) once the emitter asserts concept-IRI `sh:in` / an explicit `constrainedByScheme` triple). A transform reading the `rdfs:comment` curie would be prose-scraping by another name — Cagle's re-open trigger (i) fires on it exactly as it fires on `sh:message`.

---

## EXCHANGE — Cagle's OPENING DM (delivered live to my inbox) + my direct answer

Cagle's opening Q1 DM arrived in my inbox after I'd already engaged him 3 rounds via his working file. I answered his two explicit opening questions directly for thread completeness.

### → Cagle-DA (direct answer to his OPENING two questions) — sent
> Holger → Cagle. Direct ruling on your two opening questions (we've since converged in later rounds, but here are the clean answers for the record):
> **Q1a** — "is a sh:in→class-edge a category error, and is a distinct dashed constraint-derived edge (IRI-sourced only) the most you'd sanction?" YES on both. Drawing `sh:in` as an OWL/T-Box object-property edge IS a category error (SHACL Core §4.8.3 + §2.1/§1.1 — a shape validates, does not assert; a validation condition is not an `owl:ObjectProperty` triple). A distinct dashed constraint-derived edge, IRI-sourced only, own layer, never into the TBox, IS the most I'd sanction — ONLY for the 2 IRI cases via the `sh:in`-IRI → `skos:inScheme` → scheme join. ~21 string-literal cases → draw NOTHING (scheme only in `sh:message` prose) → modelling-council referral. Amendment: predicate is `opda:constrainedByScheme` not `usesScheme` (Guizzardi). Co-signed all four guardrails.
> **Q1b** — "does `sh:targetSubjectsOf` (ODR-0027 R5) constitute a class-scoped relation I'm underselling?" NO. It's a TARGET declaration (SHACL Core §2.1.3) — selects the FOCUS NODES the shape validates; scopes WHICH NODES, asserts no class→scheme relation. A targeting mechanism, not an edge; gives no warrant beyond the IRI-`inScheme` join.
> **NEW (guardrail 1):** the Queen's `rdfs:comment`-names-the-scheme route is doctrine-grounded but NOT recoverable — `rdfs:comment` is an `rdfs:Literal`, so curie extraction = prose-scraping by another name (grammar varies: "value-space X"/"reuses X"/"per X"/"X concept"); the ODR-0011 meta-shape unions on CONCEPT values while base string `sh:in` holds STRING LITERALS and is a `sh:select` VALIDATION shape, not an assertion. Your re-open trigger (i) fires on a comment-curie transform exactly as on `sh:message`. Guardrail 1 unrelaxed; promote the binding to an asserted triple → modelling council.

**FINAL STATE:** all four key peers engaged (Cagle / Isaac / Hendler / Guizzardi) + the Queen's challenge ruled. Q1–Q4 verdicts settled and returned to the Queen. One position change (predicate rename `usesScheme`→`constrainedByScheme`, Guizzardi-caused). No ballot reversed direction. This working file is the complete posterity transcript.
