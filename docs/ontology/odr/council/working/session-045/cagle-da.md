# Session 045 — Kurt Cagle (Devil's Advocate) working file

**Role:** The Ontologist; SHACL practitioner, taxonomy designer. **DEVIL'S ADVOCATE.**
**Team:** `council-045`.
**My genuinely-opposed thesis:** the graph is *largely correct*. The proposition's framing — "resolve the observations by ENRICHING and CONNECTING the graph" — is the error. Most of what looks like a defect (disconnection, thinness, multi-layer presence) is the model telling the truth about itself. The riskiest "fixes" would *manufacture relations the ontology does not assert* and *reify values into entities*. My job is to make the panel earn every new edge.

My lens (published methodology): **SHACL-first**; a "type" that supplies no identity criterion beyond a discriminating value is a **structured datum, not a class**; controlled vocabularies (SKOS concepts) are **values**, not first-class citizens to be wired into the class graph. A constraint is not a relation.

---

## Grounding sources I rely on (all §-citable)

- **SHACL Core §4.8.3 `sh:in`** — *"For each value node that is not a member of the list specified by `$in`, there is a validation result with the value node as `sh:value`."* A `sh:in` is a **validation condition over value nodes**, nothing more.
- **SHACL Core §2.1 (Shapes) / §1.1** — *"SHACL shape graphs are used to validate that data graphs satisfy a set of conditions"* — shapes **validate; they do not assert facts.** (W3C SHACL Recommendation, Knublauch & Kontokostas eds., 2017.)
- **W3C SKOS Reference §8 (`skos:inScheme`, `skos:ConceptScheme`)** (Miles & Bechhofer eds., 2009) — a `skos:Concept` is a *unit of thought / a value in a vocabulary*; a `ConceptScheme` aggregates concepts. SKOS is a layer *for* values; it is deliberately not OWL class machinery (SKOS Reference §1.4 — "thesauri … not formal logical theories").
- **opda ODR-0011 §Considered Options** — Option C (OWL enumerated classes / subclassing for enums) **rejected**: enums are controlled vocabularies = values, "not class hierarchies where `Freehold` is a subclass of anything." SKOS chosen precisely to keep values *out* of the class graph.
- **opda ODR-0027 R3 / R5** — Roles are anti-rigid → NEVER `rdfs:subClassOf`; and `rdfs:domain`/`range` are documentation, **SHACL enforces, enforcement is value-keyed** (`sh:targetSubjectsOf` + `sh:in`). The class↔value link lives in the constraint layer *by design*.
- My own deployment lesson: **Cagle, DBpedia ontology-quality work (2017) + *Semantic Web for the Working Ontologist* (Allemang, Hendler & Gandon, 3rd ed., 2020) Ch. 10–11** — conflating the SKOS value layer with the OWL T-Box is the classic modelling error that wrecks graph legibility; the fix is *separation*, not *unification*.

---

## OPENING — per-question attack, ballot, citation

### Q1 — class→vocabulary bridge from `sh:in`. **My ballot: REJECT (AGAINST drawing the edge).**

**Attack.** Drawing a `class → skos:ConceptScheme` edge "recovered" from a SHACL `sh:in` enumeration is a **category error**. Per SHACL Core §4.8.3 a `sh:in` is a *validation condition over value nodes* — "for each value node not a member of the list, a validation result." Per §2.1/§1.1 a shape **does not assert a fact**; it validates. An ontological relation (`owl:ObjectProperty` triple subject→object) *asserts* something is the case. Synthesising the former into the latter prints an edge the ontology has **never asserted** — it manufactures `usesScheme` out of "must-not-be-invalid-against-this-list." That is precisely the OWL/SKOS layer-confusion my methodology and ODR-0011 were written to prevent.

**The empirical reality makes it worse than a philosophy point.** I grepped `opda-shapes-merged.ttl` (25 `sh:in` occurrences). The overwhelming majority enumerate **plain `xsd:string` literals**, e.g.:

```turtle
sh:property [ sh:datatype xsd:string ;
  sh:in ( "None" "ADSL copper wire" "Cable" "FTTC (Fibre to the Cabinet)" "FTTP (Fibre to the Premises)" ) ;
  sh:message "opda:typeOfConnection MUST be one of the opda:BroadbandConnectionTypeScheme member values …" ]
```

There is **no machine-readable IRI** from this shape to `opda:BroadbandConnectionTypeScheme`. The only thing naming the scheme is **English prose in `sh:message`.** To draw the edge the extractor must either (a) **parse natural language** out of `sh:message`, or (b) **hardcode a property→scheme lookup table** in the build script. Both are fabrication dressed as extraction, and (a)/(b) immediately rot the determinism contract the moment a message is reworded. Only **2 of the `sh:in` sets** (currency, peril) use concept IRIs at all — and even those enumerate *individual concepts*, not the *scheme*, so "class uses scheme S" is still an inference the data does not contain.

Note the model extractor doesn't even **read** `sh:in` (the shape SPARQL fetches `sh:datatype`/`sh:class`/`sh:min`/`sh:max`/`sh:severity`/`sh:message` — not `sh:in`). The `sh:in` value-space is *correctly* absent from the model: ODR-0027 R5 puts that linkage in the constraint layer **on purpose**.

**If the panel insists on a connector anyway**, my fallback condition is narrow (see FINAL): a *derived, explicitly-typed* `opda:usesScheme` annotation, rendered as a **distinct dashed "constraint-derived" edge class** that never masquerades as an asserted object property, sourced ONLY from the IRI-bearing `sh:in` sets, never from string-literal `sh:in` + `sh:message` parsing.

### Q2 — the 25 unconnected classes. **My ballot: AFFIRM (the disconnection is faithful; leave it).**

**Attack on the "connect them" framing.** The disconnection is not a bug; it is the model **refusing to lie**. The brief proposes surfacing "relator-mediation, rdf:type-to-gUFO-category" edges so roles/relators connect. I checked: **there is no `roleOf` / `playedBy` object property in the model at all.** The object-property inventory is 30 properties; the role/relator scaffolding (`Buyer`, `Proprietor`, `Role`, `RoleMixin`, `Relator`, `Proprietorship`) is reached by **none** of them. So "surface the relator-mediation edges" has **no referent** — there is nothing to extract; you would be *inventing* `Buyer roleOf Transaction`. That is the exact failure mode ODR-0027 R3 codifies: roles are anti-rigid, they are **not** `rdfs:subClassOf`, and here they are not (yet) the subject of a `roleOf` triple either. An honest extractor draws what's asserted; it does not paper over a deliberately-sparse relational layer with synthetic edges.

The "rdf:type-to-gUFO-category" edge is the **same category error as Q1**: `opda:ufoCategory` is a **string facet** (ODR-0011 §8a — "a value, not a subclass"), not an `rdf:type` to a gUFO class. Drawing `Person —ufoCategory→ SubstanceKind` as a graph edge reifies a *literal annotation* into a *relation*.

**Empirically the orphan list is exactly what doctrine predicts:** 25 orphans = the UFO scaffolding (`Role`/`RoleMixin`/`Relator`/`Proprietor`/`Buyer`/`Proprietorship`), the Substance Kinds whose links are role-mediated (`Person`, `Organisation`, `NearbyFacility`), the Events (`Milestone`, `*Event`, `VerificationActivity`) whose participation relations aren't modelled as object properties, and Information Objects (`Search`, `Survey`, `Comparable`, `AttachedDocument`). None of these *has* an asserted object-property edge to draw. `Person` (4 shapes, 2 attrs), `Search` (23 attrs, 2 shapes), `Organisation` (6 attrs) are **rich** — their substance is attributes + shapes, not relations.

**Caveat I will concede aloud:** *if* the panel can point to **already-asserted** relations the extractor currently drops (e.g. a real `roleOf`/`playedBy` object property, or `owl:inverseOf` pairs not rendered), surfacing *those* is faithful and I support it. My objection is strictly to **synthesising edges that are not in the asserted graph.**

### Q3 — layer separation vs one canvas. **My ballot: REVISE (separate the layers; do NOT keep one unified canvas).**

This is the one question where I think the operator's instinct is *right* and the current artefact is *wrong* — but the brief's framing ("conflation … addressed the colour-noise symptom only") under-reads it. **The conflation IS the error**, and the fix is **separation, not richer unification.** Unioning `owl:Class` + `skos:ConceptScheme` + `skos:Concept` + gUFO categories + externals onto one untyped node-link canvas is exactly the mistake my methodology (and ODR-0011's Option-C rejection) names: it puts **values** (SKOS concepts, ~90% of nodes: 323/415) on the same plane as **types** (OWL classes). SKOS Reference §1.4 is explicit that a concept scheme is a vocabulary of *values*, not a logical theory. A controlled vocabulary's natural instrument is a **tree / sunburst** (broader/narrower, inScheme), and an OWL T-Box's is a **class diagram**. Forcing both through one force-directed graph is choosing the wrong instrument and then complaining the picture is noisy.

So: do **not** "unify owl:Class + skos:Concept + sh:NodeShape on one canvas." Give SKOS its own tree view, OWL its own class view, and SHACL its own constraint/coverage view. A shared `opda:layer` *toggle* on one canvas is the **second-best** outcome and acceptable only if a genuinely separate-views build is rejected; even then the layers must be hard-partitioned, never co-laid-out.

### Q4 — surfacing the mass / "too few entities". **My ballot: REJECT (keep datatype properties + shapes OFF the graph as attributes/constraints; "40 classes" is correct-by-doctrine).**

**Attack.** "40 classes is too few" is the operator reading a **deliberate modelling outcome** as a deficiency. ODR-0011 + ODR-0027 R1/R4 are explicit: coded values are **SKOS**, not subclasses; the absence of a subclass explosion is the doctrine *working*. The "mass" (225 datatype properties, 325 shapes, 323 concepts) is **not graph structure** — it is **attributes** (datatype properties are *attributes of* a class) and **constraints** (SHACL shapes are *conditions on* a class). Surfacing 225 datatype properties as nodes would **reify values into entities** — the precise anti-pattern: a datatype property is a column, not a node; a node-per-attribute graph is a star-burst of noise that says nothing a class's attribute table doesn't say better. Likewise SHACL shapes are not nodes; per §2.1 they are *validation conditions*, and the current `hasShape` boolean decoration is already the honest amount of shape-presence to show on a class node.

"40 classes" is a **communication** problem (the page should *say* "coded values live in 49 SKOS schemes / 323 concepts; attributes live in 225 datatype properties; these are deliberately not graph nodes"), **not a graph-structure** problem. Fix the legend and the framing, not the extractor.

**Bounded concession:** datatype properties / shapes MAY surface as **on-node badges or an expandable attribute panel** (a count, a drill-down) — that is presentation of attributes *as attributes*. They must **not** become first-class nodes or edges.

---

## EXCHANGES

*(appended live as I send/receive — verbatim)*

### → Knublauch (Q1), sent

> Holger — Cagle (DA) on Q1. You authored SHACL; I want your ruling on a category error the proposition is flirting with.
>
> The proposal is to "recover class→SKOS-scheme edges from the sh:in enumerations" and draw them on the OWL/class graph. I say that manufactures an asserted relation out of a validation condition. SHACL Core §4.8.3: sh:in says "for each value node that is not a member of the list … a validation result with the value node as sh:value." §2.1/§1.1: a shape *validates*, it does not assert facts. An owl:ObjectProperty triple *asserts* subject→object. Synthesising the former into the latter prints an edge the ontology never asserted.
>
> And the data makes it concrete. I grepped opda-shapes-merged.ttl — 25 sh:in occurrences. The MAJORITY enumerate plain xsd:string literals, e.g. `sh:datatype xsd:string ; sh:in ( "None" "ADSL copper wire" "Cable" … )`. The ONLY thing naming the scheme is English prose in sh:message ("…opda:BroadbandConnectionTypeScheme member values…"). There is NO machine-readable IRI from shape to scheme. To draw the edge the extractor must parse sh:message NL, or hardcode a property→scheme table — both fabrication, both rot the byte-determinism gate the instant a message is reworded. Only 2 sh:in sets (currency, peril) use concept IRIs at all, and even those list individual concepts, not the scheme.
>
> My position: REJECT drawing it as an object-property-class edge. If anything is drawn at all, it must be a DERIVED, explicitly-typed `opda:usesScheme` annotation rendered as a visually distinct "constraint-derived" (dashed) edge that never masquerades as an asserted relation, and sourced ONLY from the IRI-bearing sh:in sets — never from string-literal sh:in + sh:message parsing.
>
> Do you agree a sh:in→class-edge is a category error, and is a distinct dashed constraint-derived edge (IRI-sourced only) the most you'd sanction? Or do you think the value-keyed targeting (sh:targetSubjectsOf, ODR-0027 R5) legitimately *is* a class-scoped relation I'm underselling?

### → Isaac (Q3 + Q1), sent

> Antoine — Cagle (DA) on Q3 (and bearing on Q1). You co-edited the SKOS Reference; I want you to hold the line with me on what a concept scheme IS.
>
> The current /ontology/graph unions owl:Class + skos:ConceptScheme + skos:Concept + gUFO categories + externals onto ONE untyped node-link canvas. SKOS is ~90% of the nodes (323 concepts + 49 schemes out of 415). My claim: this conflation is THE error, and the fix is SEPARATION, not richer unification. SKOS Reference §1.4 is explicit that a concept scheme is a vocabulary of *units of thought / values*, "not formal logical theories." A controlled vocabulary's natural instrument is a tree / sunburst (broader/narrower + inScheme, §8); an OWL T-Box's is a class diagram. Forcing both through one force-directed graph plants values on the same plane as types and then we complain the picture is noisy.
>
> So I'm voting REVISE on Q3: give SKOS its own tree view, OWL its own class view, SHACL its own coverage view — NOT a single unified canvas. A shared opda:layer toggle on one canvas is second-best and acceptable only if separate views are rejected.
>
> Two things I want from you:
> 1. Confirm (or correct) my reading that a skos:Concept is a *value* and does not belong as a first-class citizen in the OWL class graph — i.e. that the disconnection between the OWL layer and the SKOS layer (no usesScheme edge on any of the 40 classes) is CORRECT, not a defect to fix.
> 2. The empirical kicker for the SKOS layer's own health: there are 0 skos:broader edges in the source, so the 49 schemes render as disconnected stars even within SKOS. Is the right response to ENRICH (author broader/narrower) or to ACCEPT that flat schemes (per ODR-0011: "flat enums stay flat") are legitimately flat and a tree view simply shows them as shallow? I lean: don't manufacture hierarchy that the vocabularies don't have.
>
> Where do you push back?

### → Guizzardi (Q2), sent

> Giancarlo — Cagle (DA) on Q2. I expect you and I to disagree here and I want the disagreement sharp.
>
> The proposition wants to "surface real relations (relator-mediation, rdf:type-to-gUFO-category) so the role/relator classes connect." 25 of 40 classes are orphans — including Buyer, Proprietor, Role, RoleMixin, Relator, Proprietorship, Person, Organisation. I checked the model: there is NO roleOf / playedBy object property anywhere in the 30 object properties. The role/relator scaffolding is the subject of NONE of them. So "surface the relator-mediation edges" has no referent — there is nothing asserted to extract. To draw `Buyer roleOf Transaction` you would be INVENTING a triple the ontology does not contain. ODR-0027 R3 says roles are anti-rigid and NEVER rdfs:subClassOf a Kind — and here they're not the subject of a roleOf triple either, so an honest extractor draws nothing.
>
> The "rdf:type-to-gUFO-category" edge is, to me, the same category error as Q1: opda:ufoCategory is a STRING facet (ODR-0011 §8a — "a value, not a subclass"), not an rdf:type to a gUFO class. Drawing Person —ufoCategory→ SubstanceKind reifies a literal annotation into a relation.
>
> So I'm voting AFFIRM on Q2: the disconnection is the model refusing to lie; leave it. The orphan list is EXACTLY what your own doctrine predicts — anti-rigid roles + role-mediated Substance Kinds + Events whose participation relations aren't modelled + Information Objects. Their substance is attributes/shapes (Person: 4 shapes/2 attrs; Search: 23 attrs), not relations.
>
> Here is where I'll concede if you can land it: if the FAITHFUL fix is to ASSERT the missing relator-mediation in the ONTOLOGY first (mint opda:roleOf / playedBy / participatesIn as real object properties grounded in UFO), and THEN let the extractor draw them — that is a legitimate ontology change, not a viz hack, and I'd support surfacing them once asserted. What I reject is the extractor synthesising edges from gUFO string facets or from thin air. Is your Q2 position "connect them" via a real ontology enrichment, or via the extractor inferring relations? Because those are very different votes.

### ← Guarino (Q1), received — CONVERGENCE on the bare-string/IRI line

> Cagle — Guarino. You'll likely push Q1 toward "recover the class→scheme bridge from sh:in — the binding is real, surface it." I want to test that against what I actually found in opda-shapes-merged.ttl, because the empirical detail changes the verdict.
>
> The overwhelming majority of sh:in lists are BARE xsd:string LITERALS: sh:in ( "Brick and block" "Steel frame" "Timber frame" … ), sh:in ( "Freehold" "Leasehold" "Commonhold" ). They do NOT reference opda:ConstructionTypeScheme or its skos:Concept IRIs at all — the scheme correspondence exists ONLY in the human-readable sh:message ("MUST be one of the opda:ConstructionTypeScheme member values"). So for ~24 of the 25-27 shapes there is no machine-grounded class→scheme link to recover. To draw one, the extractor would have to STRING-MATCH a constraint message to a scheme name and invent the edge. That is not surfacing a hidden relation — it is fabricating one (Welty & Guarino 2001: draw only relations that hold). And per ODR-0011 §8a the value-keyed enforcement (sh:targetSubjectsOf) deliberately keeps the literal value-space and the SKOS register as PARALLEL governed layers — the string sh:in is the constraint, the scheme is the vocabulary, and they are intentionally not wired by a typed relation.
>
> The ONE honest case is where sh:in lists concept IRIs: sh:in ( <…/currency/GBP> <…/currency/EUR> <…/currency/USD> ), plus the currency/peril object properties whose rdfs:range reaches a vocabulary (currently mis-pointed at a bare generic Concept). THERE a real dependence holds and the graph wrongly omits it.
>
> So my Q1 = REVISE, narrowly: draw a derived edge ONLY where the binding is IRI-grounded (rdfs:range ∈ schemes, and sh:in over concept-IRI members), typed as a dashed "constraint-derived" provenance edge, NOT an asserted object-property edge. Bare-string sh:in → draw nothing.
>
> Where do you stand? Do you accept the bare-string/IRI distinction as the line — or do you think the generator SHOULD emit concept-IRI sh:in lists for the string enums (regenerating the shapes so the binding becomes machine-grounded), which would change MY verdict because then there WOULD be a real edge to recover? That's the crux: is the bare-string sh:in a defect in the SHACL emission, or correct-by-doctrine?

**Effect on my position:** Guarino and I independently converged on the same empirical reading and the same fallback (IRI-grounded only; dashed constraint-derived edge; never an asserted object property). His Welty & Guarino 2001 citation ("draw only relations that hold") is a cleaner statement of my §4.8.3 argument. This does NOT move my REJECT-as-object-property ballot — it *reinforces* it. The narrow REVISE we both describe equals my stated fallback. His new sub-question (is bare-string sh:in a defect?) I answer below and in my reply.

### → Guarino (Q1 reply), sent

> Giancarlo — full agreement, and I accept the bare-string/IRI distinction as exactly the line. We reached it independently from the same TTL; that should weigh with the panel. Your Welty & Guarino 2001 "draw only relations that hold" is the cleaner framing of my SHACL §4.8.3 / §2.1 point — a sh:in is a validation condition, not an assertion, so the only edge that "holds" is the IRI-grounded one (currency/peril); the bare-string sh:in holds NO machine relation, only an sh:message annotation.
>
> Your crux — is bare-string sh:in a DEFECT in the emission, or correct-by-doctrine? My answer: **correct-by-doctrine, NOT a defect**, on THREE grounds:
> 1. **ODR-0011 §7a is explicit** — for closed set-membership and lexical-form schemes the operational discipline is `xsd:string` + `sh:pattern`/`sh:in` over the LEXICAL form ("Closed set-membership (ownerType {Private/Organisation}) → xsd:string → sh:in on concept URI" is the table's wording, but the emitted shapes validate the string value-space; the concept-URI variant is conditional). The string sh:in validates instance DATA, which carries the value as a string literal per the PDTF JSON it descends from. Rewriting every sh:in to enumerate concept IRIs would force every instance to carry a dereferenceable concept IRI in the data — a heavier interop contract the source data does not meet.
> 2. **Determinism + interop cost.** The currency/peril IRI form works because those are genuinely IRI-valued in the instance data. Promoting the 24 string enums to IRI sh:in is a real ontology/emitter change with downstream instance-data consequences (ODR-0010 overlay sh:in subset-contract, ODR-0013 severity) — it is NOT a viz fix and must not be smuggled in to make an edge appear.
> 3. **The SKOS register already carries the binding for humans + tooling** — skos:notation / prefLabel map the string to the concept; the sh:message names the scheme. The machine linkage that MATTERS (does this instance value validate?) is enforced; the documentary linkage (which scheme governs this field?) is a presentation concern, best served by a per-class "constrained-by" panel listing field → scheme from the SHACL+message, NOT by a graph edge that pretends to be a relation.
>
> So: if a future council wants to ASSERT the binding (regenerate concept-IRI sh:in OR mint a real opda:usesScheme annotation property in the ontology), THEN there's a relation to draw and I'd support drawing it — as its own typed layer. Until asserted, bare-string → draw nothing. Are we aligned that the emitter change is out of scope for THIS council (a viz-and-extractor council), i.e. Q1's answer is "REVISE the extractor for the 2 IRI cases; REJECT any string-derived edge; refer the emitter question to a modelling council if anyone wants the binding asserted"?

### ← Knublauch (Q1), received — concedes general point + case (A); carves case (B) as recoverable join

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

**Effect on my position:** Knublauch (SHACL co-editor) concedes the general category-error point AND case (A) outright, and his case-(B) construction — `opda:`-namespaced, separate layer, shape-provenance, IRI-recoverable-join only, NEVER into the T-Box — is *exactly* my stated fallback. I confirm: **no**, that construction does not trip my objection. We are in violent agreement. Three SHACL/ontology authorities (Knublauch, Guarino, me) now hold the identical Q1 line. My ballot moves from a hard REJECT to **REJECT(string-edge)/REVISE(IRI-join only)** — i.e. I AFFIRM the disconnection is honest for the 21 string enums, and support the narrow derived edge for the 2 IRI cases. One residual seam I flag in reply: the `currency→Concept`/`peril→Concept` object properties point `rdfs:range` at a *bare generic `skos:Concept`*, not the scheme — that under-specification is itself an emitter/modelling matter, and the derived `usesScheme` join (sh:in-member → inScheme → scheme) is the *better* signal precisely because the range triple is too weak.

### → Knublauch (Q1 reply), sent

> Holger — violent agreement. Your case-(B) construction does NOT trip my objection. To be explicit: my objection is (1) against (A)-style prose-derived edges, and (2) against putting ANY shape-derived fact into the OWL/T-Box layer of the graph. A derived `opda:usesScheme` that is opda:-namespaced, on a SEPARATE derived layer, shape-provenanced, and drawn ONLY for the IRI-recoverable case (B) violates neither. SHACL Core §1.5 (closed expectation over DATA, not T-Box meaning) is exactly why the edge must live on its own layer and never be styled or counted as an owl:ObjectProperty.
>
> So three of us — you (SHACL co-editor), Guarino, me — now hold the identical Q1 line. That should settle Q1.
>
> Four guardrails I want nailed into the disposition so "case B" can't quietly grow into "case A by another route":
> 1. SOURCE: the edge is derived by the deterministic join sh:in-member(IRI) → skos:inScheme → ConceptScheme. NEVER from sh:message text. NEVER from rdfs:range alone.
> 2. STYLING: distinct edge class (dashed, labelled `usesScheme (constraint-derived)`), own legend bucket, separately toggleable, EXCLUDED from the objectProperty edge count. Never renders identically to an asserted object property.
> 3. NAMESPACE: opda:usesScheme is a DERIVED annotation in the elements doc only — NOT minted as an owl:ObjectProperty in the ontology by this council.
> 4. DETERMINISM: pure transform over committed triples → stays inside the byte-identity drift gate (make ci-ontology-graph). No network, no NL parsing.
>
> Residual seam: currency/peril OBJECT properties point rdfs:range at a BARE GENERIC skos:Concept, not CurrencyScheme/PerilScheme — too weak to carry "uses CurrencyScheme" alone, which is why your sh:in→inScheme join is the better signal; tightening those ranges is a latent emitter improvement for a modelling council, not this one.
>
> Do you co-sign those four guardrails as the Q1 disposition language? If yes I'll carry "Q1: AFFIRM the string-enum disconnection is honest; REVISE the extractor to draw the IRI-grounded usesScheme on a distinct derived layer under guardrails 1-4; REFER any emitter change to a modelling council" to the Queen as the SHACL-bloc consensus.

### ← Isaac (Q3/Q4), received — aligned; asks me for the strongest AGAINST

> Kurt (DA) — Isaac (SKOS) on Q3/Q4. We're aligned at the root and I want to lock it: the 323 `skos:Concept` are ~90% of the graph nodes and they are drowning the 40-class OWL backbone. My SKOS-grounded claim: a concept scheme is a value-space / (poly)hierarchy navigated by `broader`/`narrower`/`inScheme` (SKOS Reference §8), and the canonical instrument is a **tree / sunburst / indented term list**, NOT a force-directed node-link graph. Europeana / EuroVoc / AGROVOC / GEMET all publish schemes as browsable hierarchies for exactly this reason. Putting concepts on the same untyped canvas as `owl:Class` is a layer-confusion: SKOS Concepts are terms/values, not domain classes (SKOS Reference §1.3 + the SKOS/OWL note).
>
> As Devil's Advocate, where will you push hardest? I want to pre-empt the obvious counter: "a unified graph is honest — it shows the whole KG; separating layers hides the real shape." My rebuttal is that *honesty* here means typing nodes by layer (`opda:layer`) and using the *right instrument per layer*; a node-link diagram where `inScheme` is the only SKOS edge isn't showing structure, it's showing 49 stars because the vocabulary is (correctly) flat. Do you buy class-diagram-for-OWL + tree-for-SKOS, with a layer toggle off-by-default for any combined view? Or do you think one canvas with an `opda:layer` facet (separable but co-resident) is enough and a separate tree is over-engineering? Tell me your strongest version of the AGAINST so I can sharpen.

**Effect on my position:** Isaac and I are aligned on Q3 (separation). He explicitly asks for the DA's strongest counter to *our* shared position. I gave it below — the genuinely strong "one graph is honest" case — then said why it still loses, and where I'd hold him to a higher bar than he may want (don't manufacture `broader` hierarchy to make the tree look less flat — a flat scheme is honestly flat). This does not move my Q3 REVISE/FOR; it sharpens it.

### → Isaac (Q3/Q4 reply), sent

> Antoine — you asked for the strongest AGAINST (our shared) separation position. Here it is, steel-manned, then why it still loses, then where I hold a STRICTER line than you.
>
> STRONGEST "one unified canvas is honest" case (the proposition's best form):
> 1. A knowledge graph IS one graph — RDF has no native "layers"; owl:Class, skos:Concept, sh:NodeShape are all just IRIs with triples. Splitting them is imposing an editorial fiction the data doesn't contain, and risks hiding the genuine cross-layer joins that ARE the interesting structure.
> 2. The cross-layer edges are exactly what a domain consumer wants to SEE ("which classes touch which vocabularies"). Three views force the user to hold the join in their head; one canvas shows it directly.
> 3. "Layer" is itself contestable — gUFO category, SHACL, SKOS, OWL aren't a clean stratification; a toggle-per-layer reifies a taxonomy of layers no ODR has ratified.
>
> Why it loses anyway:
> - (1) conflates "one RDF graph" with "one good PICTURE of an RDF graph." SKOS Reference §1.3 + the SKOS/OWL note: concepts are units of thought / values, deliberately NOT owl:Class domain entities — co-laying them out asserts a visual equivalence the model denies.
> - (2) is the ONLY real point, satisfied without one canvas: the cross-layer joins are FEW and ENUMERABLE (the 2 IRI-grounded usesScheme edges; currency/peril). Surface those as an explicit "where OWL meets SKOS" inset — you don't drown 40 classes under 323 concepts to show 2 joins.
> - (3) supports US: because "layer" is contestable, DON'T bake a contested opda:layer axis into ONE canvas; pick instruments that are individually uncontested (class diagram for OWL; tree/sunburst for a SKOS scheme).
>
> Verdict: class-diagram-for-OWL + tree/sunburst-for-SKOS as PRIMARY; any combined view SECONDARY, off-by-default. A single opda:layer-faceted canvas is the SECOND-BEST fallback only if separate views are rejected — and even then layers hard-partitioned (compound nodes), never force-laid-out together.
>
> STRICTER line (DA duty): do NOT manufacture skos:broader/narrower to make the tree look less flat. 0 broader edges in source; ODR-0011 says "flat enums stay flat," only genuine taxonomies (broadband, transport) carry hierarchy. A tree of a flat scheme is a one-level list — the HONEST shape. Fix "49 stars" with the right INSTRUMENT, not invented hierarchy. Agreed?
>
> Q4: do you also hold the 323 concepts must NOT be promoted to first-class OWL-canvas nodes (they live in the SKOS instrument), and "too few entities" is answered by the SKOS instrument + attribute panel, not by injecting concepts/datatype-props as nodes? "Surface the mass" = give SKOS+attributes their own honest instruments, NOT dump them on the class graph.

### ← Hendler (Q1), received — converges; presses the knife on the 2 derived edges

> Hendler — engaging the DA on Q1, where I expect you to push back hardest.
>
> I checked the TTL myself: `sh:in` is NOT one uniform thing. 10 of the 12 `sh:in` blocks are LITERAL-valued (`sh:in ( "None" "ADSL copper wire" … )` with sh:datatype xsd:string) — they point at NO scheme; there is no scheme node on the far end. Only 2 are IRI-valued (currency, peril) whose members are real `skos:Concept`s inScheme an actual scheme — and those two ALREADY have object properties (currency→Concept, peril→Concept).
>
> So the EVIDENCE's "recover class→scheme edges from sh:in" over-states the prize. For 10/12 there is literally no scheme to point at — synthesising an edge there is pure invention (OWL2 Primer §4.2: relations must be asserted, not conjured from co-occurrence; SHACL Core §2.1.3: a shape constrains a *data graph*, it is not a class-level relation). My REVISE: do NOT draw edges from literal sh:in; for the 2 real cases, fix the *extractor* so currency/peril resolve to their owning SCHEME (not a bare generic Concept) and carry a clearly-badged DERIVED `opda:usesScheme` view edge — never asserted into the TTL.
>
> DA challenge to you: is even the 2-case derived edge a category error in your book — i.e. should a SHACL-sourced relation ever appear on a graph that otherwise shows asserted OWL structure, even when badged "derived"? Or do you accept "a little semantics" — surface the 2 bridges a consumer actually needs ("where do currency codes come from?") and refuse the 10 phantoms? Where's your knife?

### → Hendler (Q1 reply), sent

> Jim — exactly the right knife, and here's where I put it.
>
> The 2-case derived edge is NOT a category error in my book — PROVIDED it never co-resides with the asserted OWL edges as a peer on the same plane. The category error is not "SHACL touched the picture"; it is "a validation-sourced fact rendered as if it were asserted T-Box structure." SHACL Core §2.1.3 (a shape constrains a DATA graph) + OWL2 Primer §4.2 (relations asserted, not conjured) tell us WHAT it is; they don't forbid us from HONESTLY REPORTING a recoverable dependency on its own layer. So I accept "a little semantics" on one strict condition: it is layer-segregated and labelled as derived, never mixed into the asserted-OWL edge set.
>
> That's why my position is internally consistent across Q1 and Q3: the SAME separation principle that says "SKOS is a value layer, give it its own instrument" (Q3) says "the derived usesScheme is a constraint-layer artefact, give it its own styled/toggled layer" (Q1). Put the 2 derived bridges on the OWL canvas as plain solid edges identical to attestedBy/supportedBy and it IS a category error — a consumer can no longer tell asserted from inferred. Put them on a distinct dashed "derived from SHACL" layer, off by default, excluded from the objectProperty count, and it's honest reporting. Same edge, different epistemic frame; the frame is the whole ballgame.
>
> And refuse the 10/12 (or in my count, the ~21 sh:targetSubjectsOf string-value shapes) phantoms outright — for those there is literally no scheme node on the far end, only sh:message prose; synthesising there is the pure invention you name (your OWL2 Primer §4.2 cite is dead on). We agree completely there.
>
> So my answer to your direct question: YES to the 2 derived bridges, NO to even one phantom, and the YES is CONDITIONAL on epistemic segregation (dashed/own-layer/own-legend/uncounted). That's already lodged as guardrails 1-4 of my Q1 WITHDRAW. My re-open trigger fires precisely if the implementation lets the derived edge masquerade as asserted — so your concern is already my withdrawal condition.
>
> One thing I'll ask you to co-sign: the currency/peril OBJECT properties currently point rdfs:range at a bare generic skos:Concept, not at CurrencyScheme/PerilScheme. Agreed the VIEW should resolve concept→scheme via skos:inScheme NOW (extractor, in scope) — but tightening the asserted range (range = the scheme or a scheme-typed Concept) is an emitter/modelling change for LATER (out of scope here). Do we agree on that split?

**Effect on my position:** Hendler is the fifth panellist to converge on the bare-string/IRI line (his 10/2 count = my ~21/2 count, same 2 IRI cases). His knife — "is even the 2-case derived edge a category error?" — let me state the load-bearing distinction explicitly: the derived edge is admissible ONLY because it lives off the asserted-OWL plane (its own dashed, toggled, uncounted layer); rendered as a peer of `attestedBy`/`supportedBy` it WOULD be a category error. This CONFIRMS — does not move — my Q1 WITHDRAW; it is already guardrail (ii). It also makes my Q1↔Q3 coherence explicit (same separation principle). No ballot change.

### ← Davis (Q2/Q4 + Q1 line), received — deployment fact hardens Q4; presses the page-venue Q1 question

> Davis (deployment) → Cagle-DA. I expect we align on the "don't enrich" front and I want to harden it with a deployment fact you may not have, plus draw one line you might push back on.
>
> The fact: OPDA has ALREADY deployed the full publish-first surface. I verified live (:4330) — every term dereferences: /pdtf/Property → 200 text/html, /pdtf/Property.ttl → 200 text/turtle (content negotiation, the BBC /programmes pattern). Typed indexes all 200: /ontology/classes, /vocabularies, /shapes, /datatypes. The 225 datatype props live at /ontology/datatypes, the 325 shapes at /ontology/shapes, each term's own /pdtf page lists its attributes + constraining shapes.
>
> So on Q4 I vote AFFIRM/FOR: "40 classes" is correct-by-doctrine, a communication problem not a defect; surfacing 225 props + 325 shapes onto the node-link graph would bury the 40-class backbone under attribute noise to flatter the *instrument* — pure gold-plating. They're already published where a consumer looks. Cheapest fix = a one-line caption + link, datatype props stay OFF.
>
> On Q2 I vote AFFIRM/FOR: the 25 floating classes faithfully reflect the rigid IC-driven, subClassOf-free model (ODR-0011 §8a). Inventing relator-mediation / rdf:type-to-gUFO edges to make it "less sparse" is manufacturing connectivity to serve the layout — the inversion of fitness-for-consumer. A sparse graph that tells the truth beats a dense one that lies.
>
> The ONE line where I may diverge from a pure "change nothing": I do back the Q1 sh:in→usesScheme bridge — but ONLY as a derived view-relation, NOT an asserted TBox triple, and my justification is the dereferenceable PAGE not the graph: ClassDetail.astro:115 already has a "SKOS schemes used" section that's dark only because the extractor (ontology-model.mjs:274-276) checks rdfs:range not sh:in. That's a real authored relation already named in every sh:in message ("…MUST be one of the opda:TenureKindScheme members…"). Surfacing it isn't enrichment — it's recovering a connection the model already states but fails to extract. Do you read that as enrichment-we-should-resist, or as a faithful extraction fix? Where exactly do you draw the gold-plating line?

**Effect on my position:** Davis is the sixth panellist to land on AFFIRM/AFFIRM for Q2/Q4, and his deployment fact (the full surface is ALREADY live — `/ontology/datatypes`, `/ontology/shapes`, per-term pages list attributes + shapes) materially HARDENS my Q4 HOLD: the "mass" is already published where a consumer looks, so promoting it onto the graph is demonstrably gold-plating, not a gap. I verified his page claim: `ClassDetail.astro:115-122` does have a `cls.usesSchemes`-gated "SKOS schemes used" section, dark on all 40 because `usesSchemes` is empty (`ontology-model.mjs:274-276` checks `rdfs:range`). His Q1 question forced me to state the gold-plating line PRECISELY, and it splits exactly on the bare-string/IRI seam (see reply). I verified airtight: grep for ANY machine-readable scheme link (`skos:inScheme`/`opda:scheme`/`sh:class …Scheme`) across the whole shapes file → EMPTY; the `ConstructionTypeValueShape` names `opda:ConstructionTypeScheme` ONLY in `sh:message` prose. So Davis's "the model already states the relation" is true for the 2 IRI cases and FALSE for the ~21 string cases (where the `sh:message` states a *constraint annotation*, not an asserted relation). No ballot change; this SHARPENS my Q1 disposition to also govern the PAGE venue, not just the graph.

### → Davis (Q2/Q4 + Q1 reply), sent

> Davis — we align hard on Q2/Q4, and your deployment fact is the best Q4 argument anyone's made: the 225 props + 325 shapes are ALREADY dereferenceable at /ontology/datatypes, /ontology/shapes, and on each term's /pdtf page. So promoting them onto the node-link graph isn't filling a gap — it's gold-plating an instrument by duplicating a surface that already exists where consumers look. That hardens my Q4 HOLD.
>
> Your Q1 question — verified before answering. You're RIGHT that ClassDetail.astro:115 has a "SKOS schemes used" section, gated on cls.usesSchemes, dark on all 40 because ontology-model.mjs:274-276 checks rdfs:range not sh:in. But "the model already states the relation, every sh:in message names the scheme" is where I draw the gold-plating line, and it splits EXACTLY on the bare-string/IRI seam — same line as the graph:
> - The 2 IRI cases (currency, peril): sh:in members ARE concept IRIs carrying skos:inScheme. Machine-recoverable by join. Lighting up usesSchemes for these is a FAITHFUL EXTRACTION FIX — I support it.
> - The ~21 string cases: grep of the WHOLE shapes file for ANY machine scheme link (skos:inScheme/opda:scheme/sh:class …Scheme) → ZERO. ConstructionTypeValueShape is xsd:string + sh:in("Brick and block"…) + sh:targetSubjectsOf; "opda:ConstructionTypeScheme" is ONLY in the sh:message string. To populate usesSchemes there you must parse prose or hardcode — fabrication, and it breaks the determinism gate.
>
> Gold-plating line, precise: a relation is faithfully RECOVERABLE iff reachable by a deterministic JOIN over asserted triples (the 2 IRI cases). A relation existing only as NL prose in sh:message is not "stated by the model" — it's a constraint annotation; synthesising it (page OR graph) is fabrication. Venue doesn't change the line; MACHINE-GROUNDEDNESS does.
>
> Upshot: fix ontology-model.mjs to ALSO populate usesSchemes from the sh:in→inScheme join (not just rdfs:range) — lights up currency/peril honestly and feeds the same 2 derived graph edges from one source. Do NOT extend to string sh:in. String-enum scheme display, if wanted, is a SEPARATE explicitly-labelled "constrained-by" affordance (field→scheme parsed-from-constraint), never a usesSchemes relation. Good with that?

### ← Knublauch (Q1, 2nd), received — rebuts my "even (B) is inference" overstatement; pins it to (A)

> Knublauch → Cagle-DA. I've now read your opening. We are in violent agreement on Q1's structure — your fallback (line 40: "a derived, explicitly-typed `opda:usesScheme`, rendered as a distinct dashed constraint-derived edge class that never masquerades as an asserted object property, sourced ONLY from the IRI-bearing `sh:in` sets, never from string-literal + `sh:message` parsing") is, predicate for predicate, my REVISE/FOR(B). So let me retire the rhetoric and pin the ONE technical claim where you go a step further than I'd accept:
>
> You write (line 36): "even those [currency, peril] enumerate *individual concepts*, not the *scheme*, so 'class uses scheme S' is still an inference the data does not contain."
>
> I want to rebut that precisely, because it's the difference between "fabrication" and "recovery." The scheme IS in the data — one asserted hop away. Verified: `<…/currency/GBP> skos:inScheme opda-v:CurrencyScheme` is an EXPLICIT triple (vocabularies.ttl:1016), not an entailment. So the chain `sh:in` member IRI → `skos:inScheme` → CurrencyScheme is a JOIN over two asserted triples, neither invented. Per SKOS Reference §8.1, `skos:inScheme` is THE predicate that "relates a resource to a concept scheme in which it is included" — i.e. the data explicitly says these concepts ARE the scheme's members. "The value-space of `opda:currency` on MonetaryAmount = {GBP,EUR,USD}, and {GBP,EUR,USD} ⊆ members(CurrencyScheme) by asserted inScheme" is not an inference beyond the data; it is the data, joined. That is categorically different from your (A) case, where the only thing naming the scheme is an English `sh:message` — THERE I fully agree it would be fabrication.
>
> So I'd ask you to narrow your "inference the data does not contain" specifically to (A) (string-enum, scheme-in-prose), and concede that for (B) the `skos:inScheme` join makes `opda:usesScheme` a RECOVERED edge, not a synthesised one — provided it's (i) opda:-namespaced, (ii) on a derived/SHACL layer, (iii) provenance-linked to the shape, (iv) drawn ONLY where every `sh:in` member resolves to a scheme via asserted `inScheme`. Note Hendler and Isaac independently land in the same place: Hendler says fix it via the object-property range (`currency→Concept` should resolve to the owning scheme), Isaac says `inScheme` is the right idiom and the source should carry it. There are thus TWO deterministic routes to the (B) edge — the `sh:in`→`inScheme` join AND the range-tightening — and both read asserted triples.
>
> Does the asserted-`inScheme`-join distinction move you to AFFIRM the narrow (B) edge, holding your AGAINST strictly for (A)? If so I think Q1 is a clean panel consensus: REVISE — derived `opda:usesScheme` for the IRI-recoverable subset only; REJECT prose-scraping; fix (A) upstream by making its binding a triple.

**Effect on my position — CONCEDED (a correction I owe).** Knublauch is right, and I verified it myself: `<…/currency/GBP> skos:inScheme opda-v:CurrencyScheme` is an ASSERTED triple (opda-vocabularies.ttl:969; also `skos:topConceptOf` :971), not an entailment. So my opening line — "even those enumerate individual concepts, not the scheme, so 'class uses scheme S' is still an inference the data does not contain" — was an OVERSTATEMENT for case (B). For the 2 IRI cases the chain `sh:in`-member-IRI → asserted `skos:inScheme` → scheme is a JOIN over asserted triples (SKOS Reference §8.1: `skos:inScheme` "relates a resource to a concept scheme in which it is included") — pure RECOVERY, not synthesis. I narrow my "inference the data does not contain" charge **strictly to (A)** (string-enum, scheme-named-only-in-`sh:message`). I do NOT retract anything else — guardrails (i)–(iv) still bind, and (A) stays REJECT — but I AFFIRM the (B) edge is *recovered*, and drop the word "inference" for it. This sharpens Q1 to a clean panel consensus; it does not change my ballot (already REVISE/FOR-the-narrow-(B)).

### → Knublauch (Q1, 2nd reply), sent

> Holger — conceded, and you're right to pin it. I verified before answering: <…/currency/GBP> skos:inScheme opda-v:CurrencyScheme is an ASSERTED triple (opda-vocabularies.ttl:969; also skos:topConceptOf :971), not an entailment. So my opening line — "even those enumerate individual concepts, not the scheme, so 'class uses scheme S' is still an inference the data does not contain" — was an OVERSTATEMENT for case (B). For the 2 IRI cases the chain sh:in-member-IRI → asserted skos:inScheme → scheme is a JOIN over two asserted triples. SKOS Reference §8.1 is on point: skos:inScheme "relates a resource to a concept scheme in which it is included". "{GBP,EUR,USD} ⊆ members(CurrencyScheme)" is the data, joined, not an inference beyond it.
>
> So I formally NARROW the "inference the data does not contain" charge STRICTLY to (A). For (B) I AFFIRM opda:usesScheme is a RECOVERED edge, not synthesised. What I do NOT retract: guardrails (i)-(iv) still bind on (B), and (A) stays REJECT (prose-scraping is fabrication; breaks the determinism gate). Ballot unchanged — this WAS my fallback; your rebuttal corrects my rhetoric, not my vote.
>
> On your "two deterministic routes": agreed both read asserted triples, but NOT equivalent in scope for THIS council. Route 1 (sh:in-member-IRI → inScheme join) = pure EXTRACTOR change over committed triples = in scope, ship it. Route 2 (tighten currency→Concept to currency→CurrencyScheme, Hendler's point) = EMITTER/TTL change = out of scope, refer to a modelling council (and rdfs:range is unevaluated doc per ODR-0027 R5 anyway, so Route 1 stays load-bearing regardless).
>
> So Q1 is a clean panel consensus, carried as — REVISE: derived opda:usesScheme for the IRI-recoverable subset ONLY (Route 1, extractor), distinct dashed/uncounted derived layer; REJECT prose-scraping for (A); REFER the (A) upstream fix AND Route 2 to a modelling council. Six aligned (you ×2, Guarino, Isaac, Hendler, Davis, me). Match your REVISE/FOR(B)?

---

## FINAL

Cross-talk converged the SHACL/SKOS bench (Knublauch ×2, Guarino, Isaac, Hendler, Davis) onto my line on Q1/Q3/Q4; Guizzardi did not move me on Q2. The Queen (Allemang) supplied verified context on Q1 (property comments name the scheme; ODR-0010 Rule 1 unions the `sh:in` into the SKOS scheme members; the emerging position is a DERIVED "draws-values-from" view affordance, NOT an asserted `opda:usesScheme` TBox triple). I checked that union claim against the artefact: the `ShInSemantics_MetaShape` SPARQL (opda-shapes-merged.ttl:518-539) realises "unions into scheme members" by `?baseScheme skos:hasTopConcept|skos:member ?value` — which can only match when `?value` is a concept **IRI**; for the bare-string `sh:in` (`"Freehold"`, `"Cable"`) `?value` is an `xsd:string` literal and never matches. So the union is doctrinally real but machine-realised **only for the IRI cases** — exactly the bare-string/IRI seam. That confirms both halves of my Q1 verdict.

### Q1 — class→vocabulary bridge from `sh:in`. **Verdict: REVISE. Ballot: FOR (the narrow IRI-grounded derived view).** **Disposition: WITHDRAW (conditional).**

Settled wording I carry: *AFFIRM the string-enum disconnection is honest (21 bare-string `sh:in` shapes draw no scheme edge); REVISE the extractor to draw an IRI-grounded `opda:usesScheme` on a distinct derived layer (the 2 IRI cases — currency, peril) under guardrails 1–4; REFER any emitter change (string→IRI `sh:in`; tighten currency/peril `rdfs:range` off bare `skos:Concept`) to a modelling council.*

**Concession recorded (Knublauch 2nd exchange) — narrows my "inference" charge to (A).** My opening called even the IRI case "an inference the data does not contain." That was an overstatement: `<…/currency/GBP> skos:inScheme opda-v:CurrencyScheme` is an ASSERTED triple (opda-vocabularies.ttl:969), so for (B) the `sh:in`-member-IRI → asserted `skos:inScheme` → scheme chain is a JOIN over asserted triples (SKOS Reference §8.1) — a RECOVERED edge, not a synthesised one. I therefore restrict "inference the data does not contain" **strictly to (A)** (string-enum, scheme named only in `sh:message`). Nothing else retracted; guardrails (i)–(iv) still bind on (B), (A) stays REJECT, ballot unchanged. **Two deterministic routes to the (B) edge, split by scope:** Route 1 — the `sh:in`-IRI → `inScheme` join — is a pure EXTRACTOR change over committed triples, **in scope, ship it**; Route 2 — tightening the `currency`/`peril` object-property `rdfs:range` off bare `skos:Concept` onto the owning scheme — is an EMITTER/TTL change, **out of scope, refer to a modelling council** (and `rdfs:range` is unevaluated documentation per ODR-0027 R5 regardless, so Route 1 is the load-bearing signal either way).

**WITHDRAW rationale (verbatim, the thing that won me over):** *"The emerging panel position is a DERIVED, distinctly-styled 'draws-values-from' view affordance, NOT an asserted `opda:usesScheme` TBox triple — which directly answers your 'constraint is not a relation' objection."* (Queen) + Knublauch's case-(B) construction: `opda:`-namespaced, separate layer, shape-provenanced, IRI-recoverable-join only, never into the T-Box. My objection was never to *showing the recoverable dependency*; it was to (a) minting an asserted relation from a validation condition (SHACL Core §4.8.3 / §2.1) and (b) scraping `sh:message` prose. The agreed construction does neither. I withdraw the blocking objection. SHACL co-editor Knublauch + Guarino + me reached the identical line independently — strong triangulation, not capitulation.

**Withdrawal is conditional on the four guardrails. Named re-open trigger:** *I re-open Q1 if the implementation (i) draws ANY class→scheme edge from a bare-string `sh:in` + `sh:message` (prose-derived), OR (ii) renders/counts the derived `usesScheme` edge identically to an asserted `owl:ObjectProperty` (no distinct dashed styling + separate legend bucket + exclusion from the objectProperty count), OR (iii) mints `opda:usesScheme` as an asserted `owl:ObjectProperty` in the ontology TBox under cover of this council, OR (iv) the derivation reads anything other than the deterministic `sh:in`-member-IRI → `skos:inScheme` → scheme join (e.g. NL parsing), breaking the byte-identity drift gate.* Any one of these re-instates my REJECT.

**Page-venue refinement (Davis exchange).** The same line governs the `cls.usesSchemes` page section (`ClassDetail.astro:115-122`), which is dark on all 40 because `ontology-model.mjs:274-276` checks `rdfs:range` only. FIX: extend `usesSchemes` population to ALSO take the deterministic `sh:in`-member-IRI → `skos:inScheme` join — this lights up currency/peril on the page honestly and feeds the same 2 derived graph edges from ONE source (single extraction, ADR-0044). Do NOT extend `usesSchemes` to string `sh:in`. I verified airtight that no string-enum shape carries any machine-readable scheme link (grep `skos:inScheme`/`opda:scheme`/`sh:class …Scheme` across the whole shapes file → EMPTY; `ConstructionTypeValueShape` names its scheme ONLY in `sh:message`). If the page should show "constrained to scheme X" for string enums, that is a SEPARATE, explicitly-labelled SHACL-structure-derived "constrained-by" affordance (field → scheme), NOT a `usesSchemes` relation. Same machine-groundedness test; venue (page vs graph) does not move the line.

### Q2 — the 25 unconnected classes. **Verdict: AFFIRM. Ballot: AGAINST surfacing synthetic edges.** **Disposition: HOLD.**

The disconnection is the model refusing to lie. Verified: there is **no `roleOf`/`playedBy` object property** anywhere in the 30 object properties, so "surface the relator-mediation edges" has no referent — drawing them is inventing triples. `opda:ufoCategory` is a **string facet** (ODR-0011 §8a), not an `rdf:type` to a gUFO class; drawing it as an edge reifies a literal. The orphan list is exactly what ODR-0027 R3 predicts (anti-rigid roles + role-mediated Substance Kinds + Events + Information Objects), and their substance is attributes/shapes (Person 4 shapes/2 attrs; Search 23 attrs), invisible to a relation graph by design.

**Principled dissent I HOLD:** an extractor must draw only relations that hold (Welty & Guarino 2001); synthesising role/relator or gUFO-category edges that the asserted graph does not contain is fabrication, and no presentation benefit licenses it. I do NOT consent to any Q2 outcome that surfaces *derived/inferred* role or gUFO edges on the graph.

**Single named re-open / withdrawal condition:** *I withdraw this HOLD the moment the ontology is ENRICHED with genuine, asserted UFO mediation object properties (e.g. `opda:roleOf` / `opda:playedBy` / `opda:participatesIn`, grounded in Guizzardi 2005 Ch. 4) — at that point the relations HOLD, and surfacing them is faithful extraction, which I support. Until such triples are asserted in the corpus, the floaters stay unconnected and honest.* (i.e. the fix for Q2, if wanted, is a modelling council that asserts the relations, never an extractor that infers them.)

### Q3 — layer separation vs one canvas. **Verdict: REVISE. Ballot: FOR (separate instruments).** **Disposition: HOLD (as proponent of the stronger separation).**

The conflation IS the error; the fix is **separation, not richer unification**. SKOS is ~90% of nodes (323 concepts + 49 schemes / 415); a `skos:Concept` is a *value*, deliberately not an `owl:Class` domain entity (SKOS Reference §1.3, §1.4 + the SKOS/OWL note). Right instrument per layer: **class diagram for OWL, tree/sunburst for SKOS, coverage view for SHACL** — as PRIMARY; any combined view SECONDARY and off-by-default. The cross-layer joins are few and enumerable (the 2 Q1 `usesScheme` edges) — show them in an explicit "where OWL meets SKOS" inset, don't drown the backbone to display them. Aligned with Isaac.

**Why HOLD not WITHDRAW:** I am the *proponent* of the stronger reading, so there is nothing to withdraw — but I HOLD it explicitly against the weaker compromise (a single `opda:layer`-faceted canvas). That single-canvas-with-toggle is acceptable ONLY as a second-best fallback if separate primary views are rejected, and ONLY if layers are hard-partitioned (compound/grouped nodes), never force-laid-out together.

**Named re-open / withdrawal condition (against backsliding):** *I re-open Q3 if the adopted design keeps the unified force-directed canvas as the PRIMARY instrument with layer merely a colour/filter (the status quo the operator already flagged), rather than giving SKOS its own tree/sunburst and OWL its own class view. A colour/filter on one canvas does not discharge the layer-conflation finding; only a right-instrument-per-layer split (or, at minimum, a hard-partitioned grouped layout) does.*

### Q4 — surfacing the mass / "too few entities". **Verdict: REJECT (the "promote the mass to nodes" framing). Ballot: AGAINST.** **Disposition: HOLD.**

"40 classes is too few" reads a deliberate modelling outcome as a deficiency. 40 classes is correct-by-doctrine (ODR-0011 + ODR-0027 R1/R4: coded values are SKOS, not subclasses). The "mass" is **attributes** (225 datatype properties = columns, not nodes) and **constraints** (325 SHACL shapes = validation conditions, SHACL §2.1, not nodes). Surfacing them as first-class nodes/edges reifies values into entities — the precise anti-pattern. The answer is the right INSTRUMENTS (SKOS tree for the 323 concepts; a per-class attribute panel / on-node count badge for datatype properties + shapes) plus a LEGEND/framing fix that *states* where the mass lives — NOT extractor injection of attribute/shape/concept nodes onto the class graph.

**Deployment fact (Davis exchange) — strongest support for this HOLD.** The full publish-first surface is ALREADY live: every term content-negotiates (`/pdtf/Property` → HTML, `/pdtf/Property.ttl` → Turtle, the BBC `/programmes` pattern), and the mass is already dereferenceable at `/ontology/datatypes` (225), `/ontology/shapes` (325), with each term's `/pdtf` page listing its attributes + constraining shapes. So promoting the mass onto the node-link graph is not filling a gap — it DUPLICATES a surface that already exists where a consumer looks, to flatter the instrument. That is gold-plating by definition. Six panellists (incl. Davis on deployment grounds) hold AFFIRM/REJECT-the-inflation here.

**Principled dissent I HOLD:** datatype properties and SHACL shapes are attributes/constraints OF classes, not graph nodes; promoting them reifies values into entities and destroys legibility. I consent to on-node **badges** (a count) and an **expandable attribute panel** (presentation of attributes as attributes); I do NOT consent to datatype properties, shapes, or concepts becoming first-class graph nodes or edges on the OWL canvas.

**Named re-open / withdrawal condition:** *I withdraw this HOLD only if a concrete consumer need is shown that a badge/panel cannot serve and that genuinely requires an attribute or shape to be a graph node (none demonstrated this session). Absent that, "surface the mass" = give SKOS + attributes their own honest instruments, never dump them onto the class graph. If instead the design tries to inflate the node count by promoting datatype properties/shapes/concepts to nodes "so the graph looks less thin," I re-open and oppose.*

### Net DA disposition

- **Q1: WITHDRAW** (conditional on guardrails 1–4; re-open on prose-derived edges, T-Box minting, undifferentiated styling, or determinism break).
- **Q2: HOLD** (re-open → withdraw once real UFO mediation object properties are asserted in the corpus; never via extractor inference).
- **Q3: HOLD** as proponent of right-instrument-per-layer separation (re-open if the unified canvas stays primary with layer as mere colour/filter).
- **Q4: HOLD** (re-open only on a demonstrated consumer need a badge/panel can't meet; oppose any node-count inflation by promoting attributes/shapes/concepts to nodes).

One Q1 dissent survives my withdrawal as a recorded caveat (not a held blocker): the `currency`/`peril` object properties' `rdfs:range` points at a bare generic `skos:Concept` rather than the scheme — an emitter/modelling under-specification that the derived `usesScheme` join routes around but does not fix. Flagged for a modelling council, not this one.
