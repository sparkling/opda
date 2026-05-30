# Session 024 (R1) — Holger Knublauch (SHACL / TopBraid EDG)

**Produces ODR-0008d — Authority-Retrieved Artefacts.** `agent-fan-out`; Queen Kendall. OPDA pre-elects me on the strength of my S022 Q2 ruling and the S023 Category-E verdict, both of which this session now operationalises into a ratified record.

**Lens (unchanged from S022/S023, now applied to one class).** Shapes describe what data *looks like*, not what it *is*; the taxonomy/ontology layer owns the model; shapes target it and **never reverse-engineer the model from validation structure** (my S022 Q2 ruling). For S024 that lens has one decisive consequence: the 24 result-parents + `localSearches` are **24+ *targets* of one node shape**, not 24 classes and not 72 properties. The peril axis is a **value in a SKOS scheme reached by `sh:in`**, not a partition of the TBox. This is the EDG order — classification flows *into* validation — and it is exactly what the standing record already decided.

**Grounding — named sources I cite throughout:**

- **W3C SHACL Recommendation** (Knublauch & Kontokostas eds., 2017): **Core §2** (shapes), **§2.1 "Targets"** (`sh:targetClass` — targeting *is* the per-peril association), **§4.6.1** (`sh:in`), **§4.8.1** (`sh:node` — the constraint that wires one node shape onto a property, *including a self-reference*), **§5** (property shapes / `sh:path`), **§2.3** (property paths). The **self-referential node shape** (`sh:node` pointing a property shape at its own enclosing `sh:NodeShape`) is well-formed SHACL Core — recursion is **not prohibited** by the Rec; the spec leaves recursion semantics processor-defined (§3.4.3) and DASH/TopBraid EDG evaluate it by data-graph traversal (the data graph is finite, so traversal terminates). This is the clean realisation of the `riskSubcategories[]` nesting.
- **DASH** (datashapes.org): `dash:editor`/`dash:viewer`, `sh:order`/`sh:group` form metadata — relevant only to the *profile* layer, not to the ODR-0008d base class.
- **TopBraid EDG governance practice**: the taxonomy layer owns the controlled list (here, the peril scheme); shapes target it; **subclassing a controlled list is the EDG over-classification anti-pattern** (the same error ODR-0011 §Alternatives names for `owl:oneOf`/enumerated classes — "conscripts a reasoner to police a hand-curated list, machinery without a purpose").
- **Standing OPDA precedent**: **ODR-0008 §Q4a** (the three-criterion class-promotion test + the five definite promotions + the §Q2a(b) spawn-rule that fired *this* session); **ODR-0009** (Evidence/artefacts as PROV-O subclasses; `prov:wasGeneratedBy`); **ODR-0011 §1a/§4a/§8a** ("one register, three consumers"; regulator-cited `dct:source`; per-scheme UFO category); **ODR-0022 Category E** (the verdict I am now discharging — "one class ~6 props + a first-class peril/dataset SKOS scheme … the peril axis MUST be a dereferenceable scheme concept, never an opaque string") and **ODR-0022 §G3** (coverage-by-test, including "for E, 'flood `riskIndicator` for property X' by peril scheme").

**What is already emitted (verified — the design must slot onto this, not replace it).** `opda-descriptive.ttl` declares the five §Q4a classes as `owl:Class rdfs:subClassOf prov:Entity`, each annotated **UFO Substance Kind (informational)**. `opda-descriptive-shapes.ttl` carries five `…IdentityKeyShape` node shapes, each `sh:targetClass`-ing one class and sharing **one** property shape: `sh:path prov:wasGeneratedBy ; sh:minCount 1 ; sh:severity sh:Violation`, with the message *"authority-retrieved provenance is the IC discriminator for class-promotion."* **That is the load-bearing fact for this whole session: the identity criterion of every Authority-Retrieved Artefact is its provenance chain, enforced by a node shape — not a datatype key.** `opda:RiskAssessment` does not yet exist; there is no peril scheme. My design adds exactly one class, one node shape (on the same identity-key template), and one scheme — nothing else.

---

## Q1 — `RiskAssessment` as a class? (vs structured datatype on `Search`, alt d) + its IC

**Position: a distinct `opda:RiskAssessment` class — UFO Substance Kind (informational), `rdfs:subClassOf prov:Entity` — with the *same* IC the other five carry: `prov:wasGeneratedBy` to its issuing activity.** Alternative (d), a structured datatype on `Search`, fails the very test ODR-0008 §Q4a uses for promotion, and it fails it *in SHACL terms*.

A structured datatype (an RDF literal carrying the six fields, or a blank-node value with no `rdf:type`) **cannot be a `prov:Entity`** and therefore **cannot bear `prov:wasGeneratedBy`** — which is the IC discriminator the emitted `_:b218dcfc815ed` shape enforces at `sh:Violation`. The Coal Authority's coal-mining result, Groundsure's flood result, Landmark's ground-stability result are each **independently generated, independently re-run, independently superseded** — the §Q4a (a)-provenance and (b)-lifecycle criteria, *both* satisfied. A datatype value has no node to hang `prov:wasGeneratedBy`, `prov:generatedAtTime`, or `prov:wasAttributedTo` on; you would be discarding the exact provenance §Q2a(b) spawned this session to preserve. In SHACL Core terms: an artefact whose IC is "the activity that generated it" *must* be a node so a `sh:NodeShape` can target it (Core §2.1) and a property shape can assert `sh:minCount 1` on `prov:wasGeneratedBy` (Core §5). A datatype is unshapeable in that sense — `sh:targetClass` has nothing to target.

**Crucially this is NOT reification-for-its-own-sake** (the dissent Cagle will press, rightly): `RiskAssessment` is not a wrapper minted to give the six fields a home — it is minted because **each instance is an authority-issued artefact with its own provenance and lifecycle**, the identical warrant that promoted `Search`/`Survey`/`EPCCertificate`/`Valuation`/`Comparable`. The node earns its existence from §Q4a, not from the field-count. Were the six fields a provenance-free in-situ annotation, Cagle and I would both flatten them (the Category-A move). They are not; they are `prov:Entity`-grade.

**IC, stated for the record (UFO Substance Kind, informational):** *a `RiskAssessment` is identified by the `prov:Activity` that generated it together with the peril/dataset it assesses* — i.e. `prov:wasGeneratedBy` (the issuing search/authority activity) ⊕ `opda:peril` (the scheme concept). Same shape as the five siblings' IC, with the peril concept as the within-artefact discriminator (one search activity generates many per-peril results).

**Vote Q1: FOR** a distinct `opda:RiskAssessment` class; **AGAINST** alt (d) structured-datatype. *(ODR-0008 §Q4a (a)+(b); ODR-0009 `prov:wasGeneratedBy`; emitted `opda:…IdentityKeyShape` pattern; SHACL Core §2.1, §5.)*

---

## Q2 — The peril/dataset axis: 12-member SKOS scheme vs 12 subclasses (alt c) vs opaque string

**Position: a first-class 12-member peril/dataset SKOS scheme (dereferenceable `skos:Concept`s), reached from `RiskAssessment` by `opda:peril` and constrained by `sh:in` over the scheme members.** This is the idiomatic SHACL realisation; both alternatives are anti-patterns the project has already named.

The **opaque string** fails ODR-0022's explicit instruction ("the peril axis MUST be a dereferenceable scheme concept, never an opaque string") and S023's lender-condition test (a lender's offer condition *names* the coal-mining search — `flooding` vs `coalMining` must be queryable, governable, definable, and carry `dct:source` to the governing authority). A literal has no URI, no `prefLabel`, no `dct:source`.

The **12 subclasses** (alt c — `FloodRisk`, `CoalMiningRisk`, …) is the **EDG over-classification anti-pattern in its purest form**: it encodes a *controlled list of dataset names* as a *partition of the TBox*. It is the exact mistake ODR-0011 §Alternatives rejected for enums ("OWL enumerated classes … conscripts a reasoner to police membership of a hand-curated list — machinery without a purpose"), now committed one level up at the class axis. Twelve subclasses give you twelve disjoint targets: "every peril whose `actionAlertRating` is red" becomes a 12-way `UNION`; adding `wartimeOrdnance` next year is an ontology edit + a reasoner re-run. The peril is **data, not schema** — precisely Cagle's "a closed list of things is data" thesis, which I co-signed at S023 Q5 for fixtures and which applies identically here.

The **SKOS scheme** is what SHACL Core §4.6.1 (`sh:in`) and ODR-0011 §1a ("one register, three consumers") are *for*: one scheme drives the `sh:in` on `opda:peril`, the DASH `dash:EnumSelectEditor`, and human rendering — authored once. The scheme is **closed** (the 12 perils are a regulator-recognised CON29/environmental-search set), so per ODR-0011 it gets a `sh:in` over its members; the concepts carry `dct:source` to the governing authority (Coal Authority, Environment Agency, DESNZ, the local authority) per ODR-0022's regulatory-salience rule. Adding a peril is a scheme edit + `sh:in` regeneration (the §5a discipline, mechanically handled by `opda-gen`), no class change, no reasoner. **A scheme concept is *more* queryable and *more* governable than a subclass** — it has a URI, a label, a definition, a steward, and provenance, where a subclass gives you only a class IRI.

Baker owns the scheme's membership and stewardship (DCMI Usage Board discipline, ODR-0011 §1a `dct:creator`); I own the SHACL realisation. Twelve members per S024-EVIDENCE: flooding, coalMining, nonCoalMining, radon, groundStability, contaminatedLand, coastalErosion, climate, energy, infrastructure, planning, transportation.

**Vote Q2: FOR** the 12-member peril SKOS scheme + `sh:in` on `opda:peril`; **AGAINST** 12 subclasses (alt c); **AGAINST** opaque string. *(ODR-0022 Category E + §G3; ODR-0011 §1a/§4a + §Alternatives; SHACL Core §4.6.1; my S022 Q2 ruling.)*

---

## Q3 — One family class or two? (environmental-search vs local-authority/CON29 results)

**Position: ONE `opda:RiskAssessment` class for both.** The environmental-search result and the CON29 local-authority result are **the same six-field micro-structure** (`riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution`) — S024-EVIDENCE records the block recurring across the 24 environmental parents **and** the 185 `localSearches` leaves. In SHACL terms they are one node shape; the *only* thing that differs is the **value of `opda:peril`/the dataset concept** (`flooding` vs a CON29 enquiry), which is a scheme-membership fact, not a class fact.

Splitting into two classes (`EnvironmentalRiskAssessment` / `LocalAuthorityResult`) would duplicate the same six property shapes under two `sh:targetClass`es to express a distinction that `sh:in` over the scheme already expresses — the over-classification anti-pattern again, at the family level. The discriminator "is this a CON29 enquiry or an environmental peril?" is a **partition of the peril scheme** (a `skos:Collection` or a top-concept grouping — Baker's call), not a partition of the class. One class, one node shape, one scheme with two collections if the WG wants the grouping queryable.

**Caveat I flag for Q5/Davis:** *if* a CON29 result turns out to carry a materially different provenance or lifecycle from an environmental result (different issuing-authority semantics, different supersession rules), that is an §Q4a (b)-lifecycle signal and the WG may later split — demand-driven, the `Building`/`Room` precedent. On the evidence in front of us (identical six-field block, both authority-retrieved, both `prov:wasGeneratedBy` an authority activity) the split is not warranted now and would be premature.

**Vote Q3: FOR** one `opda:RiskAssessment` class for both; the search-vs-CON29 distinction is a peril-scheme grouping, not a second class. *(S024-EVIDENCE; SHACL Core §2.1 targeting; ODR-0011 scheme grouping; ODR-0008 §Q4a (b) as the *only* trigger that would later justify a split.)*

---

## Q4 — The `riskSubcategories[]` recursion: self-referential `RiskAssessment` vs flat list

**Position: self-referential node shape — `opda:RiskAssessment` carries `opda:riskSubcategories` (or `opda:hasSubAssessment`) whose property shape is `sh:node opda:RiskAssessmentShape` (a reference to its own enclosing node shape).** S024-EVIDENCE is explicit: under each peril, "the same six [fields] again under `…riskSubcategories[]`" — a result bearing sub-results, *recursively nested*. This is **the textbook case for a self-referential `sh:node`** and it is clean in SHACL Core.

The mechanism (Core §4.8.1 `sh:node`): a property shape on `opda:riskSubcategories` declares `sh:node opda:RiskAssessmentShape`, where `opda:RiskAssessmentShape` is the very node shape the property shape lives in. The Rec does not forbid this (§3.4.3 leaves recursion semantics processor-defined); DASH/TopBraid EDG evaluate it by **walking the data graph**, which is finite (a flood result has finitely many sub-results), so validation terminates. Each sub-result is a *full* `RiskAssessment` — same six properties, same peril `sh:in`, same `prov:wasGeneratedBy` — so a flood sub-peril (e.g. surface-water vs river flooding) is itself a first-class, provenance-bearing, scheme-tagged assessment. **One node shape covers the parent and every depth of child**; a flat sub-result list would force a second, near-identical shape and lose the uniform recursion.

A flat list (`opda:subResult` ranging over a *different*, shallower structure) would (a) duplicate five of the six properties in a parallel shape, (b) cap nesting at one level when the data nests further, and (c) break the "every result, at any depth, is queryable by peril and provenance" property that §G3's worked query needs. The self-reference is strictly less TBox and strictly more uniform. This is the same `sh:node`-reuse principle I argued at S023 Q4 for the family — here it simply points at *itself*.

**Vote Q4: FOR** self-referential `RiskAssessment` (`sh:node` onto its own node shape for `riskSubcategories[]`); **AGAINST** a flat sub-result list. *(SHACL Core §4.8.1 `sh:node`, §3.4.3 recursion; S024-EVIDENCE recursion finding; DASH/EDG data-graph-traversal evaluation.)*

---

## Q5 — Provenance + IC + the five existing classes' internals

**Position: hang the whole family off ODR-0009 PROV-O via `prov:wasGeneratedBy` (the §Q4a IC discriminator, already emitted as the shared identity-key shape); give each of the six classes the internal property structure §Q4a always intended; state UFO category + IC per class.** This is the substantive deliverable of ODR-0008d — the five classes are emitted today as *bare classes + the one provenance identity-key shape*, with **no internal property structure**; S024 adds it.

**The provenance spine (one move for all six).** Every Authority-Retrieved Artefact is `rdfs:subClassOf prov:Entity` and `prov:wasGeneratedBy` an issuing `prov:Activity` (the EPC assessment, the survey instruction, the search order, the valuation instruction, the comparable-data extraction, the risk-search run). `datasetAttribution` on `RiskAssessment` → `prov:wasAttributedTo` the data authority (Groundsure/Landmark/Coal Authority/local authority). The emitted `_:b218dcfc815ed` shape (`sh:minCount 1` on `prov:wasGeneratedBy`, `sh:Violation`) is **reused verbatim** by a new `opda:RiskAssessmentIdentityKeyShape` — the sixth instance of the identical template. **Zero new provenance machinery; this is pure ODR-0009 reuse**, exactly as ODR-0022 §"ODR-0009 absorbs Category B and E provenance with no new local terms beyond the E class" instructs.

**UFO category + IC, per class (Guarino/Guizzardi own the meta-category; I read it off the emitted annotation and target accordingly — the EDG order):**

| Class | UFO meta-category (as emitted) | Identity criterion (the §Q4a discriminator) |
|---|---|---|
| `opda:Search` | Substance Kind, informational | `prov:wasGeneratedBy` the local-authority/search-provider activity ⊕ the search type (CON29R/LLC1/environmental) |
| `opda:Survey` | Substance Kind, informational | `prov:wasGeneratedBy` the professional-issued survey activity; lifecycle issued/superseded/re-issued/withdrawn |
| `opda:EPCCertificate` | Substance Kind, informational | `prov:wasGeneratedBy` the DESNZ-register assessment; lifecycle 10-yr validity/supersession; distinct PII regime (ODR-0018) |
| `opda:Valuation` | Substance Kind, informational | `prov:wasGeneratedBy` the RICS-regulated/AVM activity; lifecycle instructed/delivered/superseded |
| `opda:Comparable` | Substance Kind, informational | `prov:wasGeneratedBy`/`prov:wasDerivedFrom` LR Price Paid / VOA source; supports `prov:wasInformedBy` from `Valuation` |
| `opda:RiskAssessment` (new) | Substance Kind, informational | `prov:wasGeneratedBy` the risk-search activity ⊕ `opda:peril` (scheme concept) — Q1's IC |

**Internal structure — the boundary I draw (the hinge of my lens).** The internals split exactly on my S022 Q2 ruling: a handful of **semantic anchors go on the class in the TBox**; everything per-form goes on the **ODR-0010/ADR-0029 profile shapes**. For `RiskAssessment`: the six fields are **not six TBox datatype properties times 24** — they are **~6 property shapes in one node shape** (`opda:riskIndicator` → `sh:in` over a rating scheme = Quale-in-Region; `opda:actionAlertRating` → `sh:in`; `opda:result`/`opda:summary`/`opda:recommendations` → `xsd:string`, the `disclosureDetail`-grade prose tails, reused not re-minted; `opda:datasetAttribution` → `prov:wasAttributedTo`), plus `opda:peril` (`sh:in` over the scheme) and `opda:riskSubcategories` (`sh:node` self-reference). For `Survey`/`EPC`/`Valuation`/`Comparable`/`Search`: a *small* set of shared anchors (issue date → `prov:generatedAtTime`; status/lifecycle → a SKOS lifecycle scheme via `sh:in`; the artefact reference/number → an identity datatype) — **the per-form leaf detail stays in the profiles**, per ODR-0008 §Q7a CI-test-1 (base shapes carry zero descriptive `sh:minCount`). I do **not** mint a datatype property per peril per field; the round-trip lives in the profile (Q6/§G3), not the class.

**Vote Q5: FOR** ODR-0009 PROV-O spine (`prov:wasGeneratedBy` reused verbatim as the sixth identity-key shape); UFO Substance-Kind + provenance-IC per the table; internal structure = ~6 property shapes in one node shape for `RiskAssessment` + small shared lifecycle/date/identity anchors for the five, with per-form detail held in the profiles. *(ODR-0009; ODR-0008 §Q4a + §Q7a CI-test-1; emitted `_:b218dcfc815ed`; ODR-0011 §8a UFO; SHACL Core §5/§4.6.1.)*

---

## Q6 — The four-way: which of Kendall's (a)–(d) wins, on what criterion?

**Position: (b) — `RiskAssessment` class + peril SKOS scheme — wins, on the criterion *fewest sound TBox terms that pass the §G3 coverage-by-test round-trip while keeping the peril axis queryable and the provenance preserved*.** I'll rank all four against that criterion, because the brief asks me to confirm (b) is *less* work and *more* queryable than the flat-bag, and the comparison is decisive.

- **(a) Flat datatype-bag** (six fields as flat datatype properties on `Search`) — **rejected.** It is the predicate-sprawl failure I named at S023 Q3: 6 fields × 24+ datasets = **72+ datatype properties** that are, definitionally, the *same six slots* re-coordinatised per peril. It loses cross-peril query ("every red `actionAlertRating`" → a 72-way problem), loses the per-peril uniformity, and — fatally — has **nowhere to hang per-result `prov:wasGeneratedBy`** (the IC), so it fails §Q4a outright. It is also un-recursive: `riskSubcategories[]` has no flat-bag home.
- **(c) 12 subclasses** — **rejected.** Q2's EDG over-classification anti-pattern: it encodes a controlled list as a TBox partition, conscripts a reasoner, and makes "add a peril" an ontology+reasoner event. *More* TBox terms than (b), *less* queryable across perils, and it still needs the six property shapes *per subclass*.
- **(d) Reuse `Search` as a structured datatype** — **rejected.** Q1's failure: a datatype value cannot be a `prov:Entity`, so it cannot bear the `prov:wasGeneratedBy` IC the emitted identity-key shape enforces. It collapses the §Q4a-distinct artefact back into the bag it was promoted out of.
- **(b) one class + peril SKOS scheme + self-referential node shape** — **wins.** It is **one** `owl:Class`, **one** node shape (~6 property shapes), **one** SKOS scheme — replacing 72 properties (a) / 12 subclasses + 72 shapes (c). The peril is `sh:in`-queryable and dereferenceable; the recursion is `sh:node` self-reference; the provenance is the reused identity-key shape; the round-trip is the **S023 G3 mechanism** — coverage is a SHACL-*targeting* fact (a profile property shape `sh:path`-ing the form's per-peril leaf, `dct:source` to the schema path), tested by §G3's worked query "flood `riskIndicator` for property X by peril scheme," *not* a count-of-TBox-properties fact.

**Confirming the brief's two claims, concretely.** *Less work:* one class + one shape + one scheme vs 72 properties — and the structural treatment is *ratified ODR reuse* (ODR-0009 provenance, ODR-0011 scheme), not novel per-leaf work. *More queryable:* "every peril with a red alert across the whole pack" is one BGP over `opda:actionAlertRating` on `?r a opda:RiskAssessment`; under (a) it is a 72-predicate `UNION`. The S023 G3 round-trip mechanism applies unchanged: the 24 result-parents + `localSearches` are SHACL-targeting coverage over the **one** class — `ASK` that every result leaf is the `dct:source` of exactly one profile property shape, the same gate I co-signed with Davis at S023.

**Vote Q6: FOR** (b) — one `RiskAssessment` class + peril SKOS scheme + self-referential node shape — on the criterion *fewest sound TBox terms passing §G3 round-trip with queryable peril + preserved provenance*; **AGAINST** (a), (c), (d). *(Kendall four-way; ODR-0022 §G3 round-trip; SHACL Core §2.1/§4.6.1/§4.8.1; ODR-0008 §Q4a; ODR-0009.)*

---

## The node-shape design (one line, for the record)

```turtle
opda:RiskAssessment a owl:Class ; rdfs:subClassOf prov:Entity .   # UFO Substance Kind (informational); IC = prov:wasGeneratedBy ⊕ opda:peril

opda:RiskAssessmentShape a sh:NodeShape ;
    sh:targetClass opda:RiskAssessment ;
    sh:property [ sh:path prov:wasGeneratedBy ; sh:minCount 1 ; sh:severity sh:Violation ] ;   # the §Q4a IC — reused verbatim from _:b218dcfc815ed
    sh:property [ sh:path opda:peril ; sh:in ( <…12 PerilScheme concepts…> ) ; sh:minCount 1 ] ;
    sh:property [ sh:path opda:riskIndicator ;        sh:in ( … ) ] ;      # Quale-in-Region
    sh:property [ sh:path opda:actionAlertRating ;    sh:in ( … ) ] ;      # Quale-in-Region
    sh:property [ sh:path opda:result ] ;             # xsd:string, disclosureDetail-grade
    sh:property [ sh:path opda:summary ] ;            # xsd:string
    sh:property [ sh:path opda:recommendations ] ;    # xsd:string
    sh:property [ sh:path opda:datasetAttribution ;   sh:node opda:AgentShape ] ;  # → prov:wasAttributedTo
    sh:property [ sh:path opda:riskSubcategories ;    sh:node opda:RiskAssessmentShape ] .  # self-reference — the recursion
```

**One class, one node shape (~6 props + peril + provenance + self-reference), one 12-member peril scheme — targeted per peril, recursive by `sh:node` onto itself, provenance-keyed by the reused §Q4a identity-key shape.**

## Cross-talk — with Cagle (DA)

Kurt — we agree on the verdict and I want to nail down the *one* thing your DA lens is right to police, because it is the difference between a sound `RiskAssessment` and a reified wrapper.

**Your legitimate worry, named:** "is `RiskAssessment` reification-for-its-own-sake — a node minted only to give six fields a parent?" If it were, you would flatten it and you would be right (it would be the Category-A move: prose tails with no concept). **It is not, and the discriminator is provenance, not field-count.** The emitted identity-key shape (`_:b218dcfc815ed`) tells us the IC of every Authority-Retrieved Artefact is `prov:wasGeneratedBy` — and a per-peril risk result *is independently generated, attributed, dated, and superseded* by a data authority. That is `prov:Entity`-grade by the identical §Q4a (a)+(b) test that promoted the five you and I already ratified. The node is not a wrapper for the six fields; the six fields are *properties of an artefact that exists on its own provenance warrant*. Strike the provenance and I flatten it with you; the provenance is there, so we promote it.

**Where the node-shape + peril `sh:in` IS the idiomatic SHACL realisation of "one class" (your thesis, my mechanism):** your "the peril is data, not schema" (S023 Q5, fixtures) is *exactly* my `opda:peril` `sh:in` over the 12-member scheme — the dataset identity moved from the *predicate*/*subclass* to a *value*, the same move you made for `boilerImmersionHeater`. And your "the shape carries structure so the vocabulary stays answerable" (the Cagle Report SHACL-as-control-layer thesis) is *precisely* why the recursion is `sh:node` self-reference and the per-form leaf detail is a profile `sh:path`, not a TBox property: the **one** node shape carries the per-peril, per-depth structure; the **one** class stays lean and queryable. We are not in tension — your DA "don't reify, flatten what's data" and my SHACL "one node shape, target per peril, `sh:in` the scheme, `sh:node` the recursion" are the *same* design seen from the model side and the validation side. The node-shape is what *makes* it one class rather than 72 properties or 12 subclasses — it is the construct that lets a single class be targeted 24+ times. **One class, realised as one node shape over a peril scheme: that is the SHACL idiom for your "one class," and the provenance is what earns the class its node.**
