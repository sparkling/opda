# Session 024 (R1) — Authority-Retrieved Artefacts — Tom Baker + Antoine Isaac (vocabulary + SKOS pair)

**Roles.** Baker — DCMI Terms; the Singapore Framework (Nilsson, Baker, Johnston, DCMI 2008); DCMI Usage-Board *reuse-before-mint* discipline. Isaac — *SKOS Reference* (Miles & Bechhofer eds., W3C Rec 2009), authoritative voice for **§3 concept schemes**, **§8 semantic relations**, **§9 mappings**. **One joint position.** OPDA weights Baker.

**The lens, stated once, up front.** The **peril/dataset axis is a SKOS concept scheme** — `opda:PerilScheme`, twelve `skos:Concept`s (Flooding, CoalMining, NonCoalMining, Radon, GroundStability, ContaminatedLand, CoastalErosion, Climate, Energy, Infrastructure, Planning, Transportation), each bearing `skos:prefLabel`/`skos:definition`/`dct:source` to its governing data authority and a named **steward**. A delimited, governed value-space whose members a lender *names* ("order the coal-mining search") is, by **SKOS Reference §3** (Isaac), a **concept scheme**, not a class hierarchy: §3 fixes `skos:Concept`/`skos:ConceptScheme`/`skos:inScheme`/`skos:topConceptOf` precisely so that a controlled list of "units of thought… abstract entities which are independent of the terms used to label them" gets dereferenceable URIs *without* asserting OWL membership-reasoning over a hand-curated set. This is the **same construct OPDA already ratified twice** — `opda:BoundedContextScheme` (`opda-contexts.ttl`, ODR-0020) and the 23 enum schemes (ODR-0011) — so the peril scheme is **house style, not a new dependency**.

**Verified state I rely on (read the code + data, not the brief).**

- **The bounded-context scheme is the exact template I extend.** `source/03-standards/ontology/opda-contexts.ttl:19-77`: `opda:BoundedContextScheme a skos:ConceptScheme` with six `skos:Concept`s, each carrying `skos:prefLabel` + `skos:definition` + `dct:source <…/ODR-0020#section-decision>` + `skos:inScheme` + `skos:topConceptOf` + **`opda:hasSteward`**. `opda:PerilScheme` is this, member-for-member, with twelve concepts.
- **`opda:hasSteward` already exists and is emitted across the corpus** — `opda-contexts.ttl` (six contexts) and `opda-vocabularies.ttl` (every value-scheme: lines 26, 36, 46…2392). I (Baker) am **already named steward** of the VOA/SAA/DESNZ vocabularies — `opda-vocabularies.ttl:106,116,126` (`"Baker (regulator-cited per ODR-0011 §4a; VOA/SAA/DESNZ-governed)"`). The peril datasets are the same kind of regulator-cited reference data, on the same axis I already steward.
- **The five §Q4a classes are emitted as bare `prov:Entity` subclasses** — `opda-descriptive.ttl:25-63` (`opda:Comparable`, `opda:EPCCertificate`, `opda:Search`, `opda:Survey`, `opda:Valuation`), each `rdfs:subClassOf prov:Entity`, each `dct:source <…/ODR-0008#section-Q4a>`, each with a `skos:scopeNote` UFO category. `opda:RiskAssessment` does **not** exist; there is **no** peril scheme.
- **The data confirms the design exactly** (PDTF v3 schema, `pdtf-transaction-v3.json`): **12** `riskSubcategories` (one per peril); **24** `actionAlertRating` + **24** `datasetAttribution` (= 12 perils × 2 = the peril + its subcategory) — precisely the S024-EVIDENCE "six-field block × 24 parents." Each peril nests a `*Risk` block (`flooding.floodRisk`/`historicalFlooding`/`floodDefences`; `coalMining.riskIndicator`; `radon.radonRisk`/`radonTest`/`remedialMeasuresOnConstruction`; `contaminatedLand.contaminatedLandNotice`/`entry`…) — these are the **`skos:narrower`** sub-perils inside each top concept.
- **S023 already decided the architecture (11–0).** Session-023 Q4 (`session-023…md:76,80,82,84`): E → "one `opda:SearchResult`/`opda:RiskAssessment` class (~6 props) + a peril/dataset SKOS scheme, hung off ODR-0009 provenance." Kendall's hardening, verbatim: *"flatten the shape (6 fields → 6 props); do NOT collapse the peril axis (24 datasets → opaque string) — that is the granularity a lender's offer condition names."* Davis's (DA) exact requirement: the `riskIndicator` *"is addressable only if the peril/dataset is a first-class, dereferenceable discriminator, not a buried instance literal."* **R1 discharges S023's held condition** — the worked SPARQL query "flood `riskIndicator` for property X."
- **ODR-0008 §Q5a already binds the SKOS-vs-string discipline.** `ODR-0008…md:76`: "ODR-0011 §8a-named schemes become SKOS concept schemes; non-§8a one-shot enums stay `xsd:string + sh:in`. **Burden of SKOS promotion on the proposer per leaf.**" This session **discharges that burden for the peril axis** — and the `tenureKind` row of that table (`skos:exactMatch`, *"NEVER `owl:sameAs`"*) is the precedent that forbids the 12-subclasses alternative.
- **ODR-0011 §1a is the steward rule I invoke.** `ODR-0011…md:94-96`: "every controlled vocabulary needs a `skos:ConceptScheme`… Each scheme declares its **steward** via `dct:creator`/`dct:publisher` (Baker DCMI Usage Board discipline — one named expert with deputy per FIBO precedent)." §8a adds `opda:ufoCategory` per scheme with **dual `dct:source`** (upstream UFO + `<ODR-0011>`).

**Two citations carried throughout** (ODR-0001 §Citation grounding):

> **(Isaac)** *"A concept scheme is a set of concepts, optionally including statements about semantic relationships between those concepts… Thesauri, classification schemes, subject heading lists, taxonomies… and other types of controlled vocabulary are all examples of concept schemes."* — **SKOS Reference (W3C Rec 2009) §3** (`skos:ConceptScheme`, `skos:inScheme`, `skos:topConceptOf`). §8 supplies `skos:broader`/`skos:narrower`/`skos:related` for intra-scheme structure; §9 supplies `skos:exactMatch`/`closeMatch`/`broadMatch` for cross-scheme mapping.

> **(Baker)** The **Singapore Framework** (Nilsson, Baker, Johnston, DCMI 2008) and **Coyle & Baker, *Guidelines for Dublin Core Application Profiles* (DCMI 2009)** fix the *reuse-before-mint* rule: terms are **declared once** in their owning namespace and **reused** elsewhere; a value-space is recorded as a **vocabulary encoding scheme** (SKOS), and a profile/shape **constrains** which members may be used (`sh:in`) — it never re-mints the value-space as classes.

---

## Q1 — `RiskAssessment` as a class?

**Vote: FOR** — mint `opda:RiskAssessment` as a first-class `prov:Entity` subclass (UFO: Object / information-artefact, prov-bearing), **AGAINST** folding it into a structured datatype on `Search` (alternative d). Named convention: **ODR-0008 §Q4a three-criterion class-promotion test**; **PROV-O Rec §3.2** (Entity); **Kendall & McGuinness, *Ontology Development 101* Ch. 5** (SKOS for controlled value-sets, OWL classes for things with identity criteria and behaviour, per the S023 ruling).

**Argument.** A `RiskAssessment` passes the §Q4a test on **two independent criteria**, the same two that already promoted its five siblings (`opda-descriptive.ttl`):

1. **(a) Authority-retrieved provenance.** A per-peril result is *produced by a search provider / data authority* — Groundsure, Landmark, the Coal Authority, the Environment Agency — so it bears a `prov:wasGeneratedBy` chain to a regulator-/provider-issued activity. That is criterion (a) verbatim.
2. **(b) Distinct lifecycle.** A search result is *ordered → returned → superseded / re-run* — criterion (b) verbatim (identical to the lifecycle clause on `opda:Search`, `opda-descriptive.ttl:44`).

A structured datatype (alt d) **cannot bear `prov:wasGeneratedBy`** — PROV-O qualifies *Entities*, not literal values (ODR-0009's PROV-O backbone is the whole point: the result is a derived entity in a derivation graph). Burying the six fields in a datatype on `Search` would put a prov-bearing artefact where provenance cannot attach — the exact category error §Q4a exists to prevent. This is **Isaac/Baker agreeing with Cagle (DA)**: the peril axis is reference data (a scheme) *either way*, but **a prov-bearing result earns a class** — a datatype cannot carry the who/when/from-what the result demonstrably has.

**Identity criterion (the §Q4a IC).** Two `RiskAssessment` instances are the **same** iff they share **(peril concept × `prov:wasGeneratedBy` activity × `prov:generatedAtTime`)** — i.e. *this peril, assessed by this provider-run, at this issuance instant*. Hard cases, named: **re-run** (same peril, new provider activity → new instance, prior `dct:isReplacedBy`-superseded); **two providers, one peril** (distinct activities → distinct instances of the *same* peril concept); **provider correction/reissue** (new `prov:wasGeneratedBy`, supersedes). The peril concept is a **discriminator within** the IC, never the identity itself — which is exactly why it is a *value* (a `skos:Concept` the instance points at), not the instance's *type*.

**ADJUDICATION Q1.** `opda:RiskAssessment a owl:Class ; rdfs:subClassOf prov:Entity` — the sixth member of the authority-retrieved family, promoted on the same two §Q4a criteria as the existing five. IC = (peril × generating-activity × generation-time). **FOR.**

**Vote: FOR.**

---

## Q2 — the peril/dataset axis (the decisive question for our lens)

**Vote: FOR a first-class 12-member `skos:ConceptScheme` (`opda:PerilScheme`, dereferenceable concepts); AGAINST 12 OWL subclasses (alternative c); AGAINST an opaque string.** Named convention: **SKOS Reference §3** (Isaac — a delimited value-space is a concept scheme, not a class hierarchy); **ODR-0008 §Q5a** (proposer discharges the SKOS-promotion burden); **ODR-0011 §1a/§8a** (every controlled vocabulary is a `skos:ConceptScheme` + steward); the live precedent **`opda:BoundedContextScheme`** (`opda-contexts.ttl`).

**Argument — three things, in order of force.**

**(1) SKOS Reference §3 is decisive against the 12-subclasses alternative (c).** The twelve perils are a **delimited, governed value-space** — a controlled list of hazard domains a search authority reports against. SKOS Reference §3 (Isaac) exists *precisely* for this: "units of thought… independent of the terms used to label them," organised into a `skos:ConceptScheme`. Modelling them as **12 OWL subclasses of `RiskAssessment`** is the anti-pattern SKOS was designed to retire — it (i) drags OWL subsumption-reasoning over a hand-curated enumeration that has no logical class structure (Flooding is not *logically* a subkind of "risk-assessment-hood" — it is a *subject* the assessment is *about*); (ii) makes the value-space **closed under the open-world assumption in the wrong way** (adding a 13th peril becomes a TBox edit + reasoner re-run, not a `skos:Concept` insertion); and (iii) repeats the error ODR-0008 §Q5a's `tenureKind` row already forbids — *"sub-Kind via `skos:exactMatch`; **NEVER `owl:sameAs`**"* — i.e. OPDA has **already ruled** that even genuine sub-*Kinds* bind to OWL via SKOS mapping, not class-identity. *A fortiori* a peril, which is a **subject/aboutness** of the result, not a sub-Kind of it, must be a `skos:Concept`. The Object/Mode discipline from S023 is the same cut: the peril is what the assessment is *about* (a concept it references), the way the fixture-item is an Object the inclusion-Mode references.

**(2) The peril must be a *dereferenceable concept*, never a string — Davis's (DA) S023 requirement, now discharged.** A lender's offer condition *names* "the coal-mining search"; an AVM *dereferences* "the flood `riskIndicator` for **this** property." That is addressable **iff** the peril is a first-class URI — `opda:peril/Flooding`, `opda:peril/CoalMining` — that the `RiskAssessment` points at via a property (call it `opda:assessesPeril → skos:Concept`). As an **opaque string** the axis is unqueryable across perils and unjoinable to the governing authority; as a **concept** it is both. The worked query (S023's E-withdrawal condition, discharged here):

```sparql
# "the flood riskIndicator for property X" — works ONLY because the peril is a dereferenceable concept
SELECT ?indicator ?actionAlert WHERE {
  ?ra a opda:RiskAssessment ;
      opda:assessesPeril opda:peril/Flooding ;   # ← the peril is a URI, not "Flooding" the literal
      prov:wasDerivedFrom*/^opda:hasRiskAssessment <property/X> ;
      opda:riskIndicator ?indicator ;
      opda:actionAlertRating ?actionAlert .
}
```

and the cross-peril query that S023's Gandon/Hendler called *"more powerful"*:

```sparql
# "every dataset whose actionAlertRating is High, across ALL perils uniformly"
SELECT ?property ?peril ?rating WHERE {
  ?ra a opda:RiskAssessment ;
      opda:assessesPeril ?peril ;            # ranges over the 12 concepts
      opda:actionAlertRating "High" ;
      opda:actionAlertRating ?rating .
  ?peril skos:inScheme opda:PerilScheme .
  ?property opda:hasRiskAssessment ?ra .
}
```

Neither is expressible if the peril is a literal buried in a flat per-peril predicate set.

**(3) `datasetAttribution` is per-concept provenance — the steward hook.** Each of the 24 `datasetAttribution` leaves names the **governing data authority** for that peril/dataset. That maps to **`dct:source` on the `skos:Concept`** (the authority's published dataset IRI) — exactly as each `BoundedContextScheme` concept carries `dct:source <…/ODR-0020#section-decision>`. Per-instance dataset provenance (which provider returned *this* result) rides the PROV-O backbone (`prov:wasAttributedTo` the provider Agent, Q5); per-*concept* governance rides `dct:source` + the steward.

**The peril scheme design (one statement, mirroring `opda:BoundedContextScheme`):**

```turtle
opda:PerilScheme a skos:ConceptScheme ;
    rdfs:label "PDTF Search Peril / Dataset Axis"@en ;
    skos:definition "The twelve hazard/search domains an authority-retrieved RiskAssessment is assessed against; the dereferenceable discriminator a lender's offer condition names (S023 Kendall; ODR-0008 §Q2a(b))."@en ;
    opda:ufoCategory "Quale-in-Region" ;                       # ODR-0011 §8a — each peril is a hazard-domain region; riskIndicator/actionAlertRating are quale values within it
    dct:source <https://w3id.org/opda/odr/ODR-0024#section-decision> ,
               <https://...masolo-2003-d18-4.3> ;             # dual dct:source per §8a (UFO/DOLCE + Council-authored)
    dct:creator "Baker (peril/dataset scheme steward — regulator-cited reference data per ODR-0011 §4a)" ;
    opda:hasSteward "Baker (deputy: Isaac for SKOS structure) — per-concept dct:source to the governing data authority (Environment Agency / Coal Authority / DESNZ / local authority / Groundsure / Landmark)"@en .

opda:peril/Flooding a skos:Concept ;
    skos:prefLabel "Flooding"@en ;
    skos:definition "Risk of flooding from rivers, sea, surface water, groundwater or reservoirs."@en ;
    skos:inScheme opda:PerilScheme ; skos:topConceptOf opda:PerilScheme ;
    dct:source <https://www.gov.uk/...environment-agency-flood-risk> ;      # ← the datasetAttribution authority
    skos:narrower opda:peril/Flooding-Historical , opda:peril/Flooding-Defences .   # the riskSubcategories (Q4)
# … CoalMining (dct:source → Coal Authority), Radon (→ UKHSA/BGS), ContaminatedLand (→ LA/EA), … ×12
```

**ADJUDICATION Q2.** A 12-member `skos:ConceptScheme` — dereferenceable concepts, each `dct:source`'d to its governing authority, stewarded — is the **only** option that (i) is what SKOS §3 is *for*, (ii) satisfies Davis's addressability requirement, (iii) matches the two precedents OPDA already ships, and (iv) makes the result queryable per-peril *and* cross-peril. **12 subclasses fails SKOS §3 and ODR-0008 §Q5a; a string fails addressability.** **FOR the scheme.**

**Vote: FOR.**

---

## Q3 — one family class or two? (engaging Cagle DA)

**Vote: FOR ONE `RiskAssessment` class + ONE peril scheme; the environmental-search and CON29/local-authority results are two *result populations of the same class*, discriminated by peril concept and by provenance — not two classes.** (Re-open to a second class **only** on a named consumer query exercising a CON29-specific property the environmental result lacks.) Named convention: **ODR-0008 §Q6a hierarchy-admission discipline** (a subclass earns its place only on a named parent-entailment query + reasoner-independence); **the one-scheme-many-populations pattern of `opda:BoundedContextScheme`**.

**Argument — and the precise point of agreement-then-divergence with Cagle (DA).** We **agree with Cagle** on the load-bearing fact: the **peril axis is reference data (a scheme)**, and the CON29/local-authority results **map to the same scheme** — `localSearches` (185 CON29-style leaves, per S024-EVIDENCE) report against perils drawn from the *same* twelve-member value-space (flooding, contaminated land, planning, transportation…). So **one scheme covers both** result families: the dispute is **not** about the scheme.

Where we engage Cagle is the *result*: he presses whether the CON29 result is a **distinct class**. Our ruling: **the scheme makes the result queryable either way** (that is Cagle's own point — the discriminator is the peril concept + the provenance, both first-class), **but a prov-bearing result earns a class on the §Q4a criteria — and CON29 and environmental results share those criteria** (both authority-retrieved; both ordered→returned→superseded). They differ only in **which authority** (`prov:wasAttributedTo` the local authority vs Groundsure/Landmark) and **which perils** they cover — and *both* of those differences are **already carried** by the peril concept's `dct:source` + the instance's PROV agent. A second class would have to justify itself under §Q6a by a **CON29-specific property** that the environmental result genuinely lacks *and* a named query needing parent-level entailment over it. **No such property is attested today** (the six-field block is identical across both, per S024-EVIDENCE), so a second class is **decorative under entailment-off SPARQL** (§Q6a's reasoner-independence test: `UNION` over {EnvResult, CON29Result} must differ from the entailed `RiskAssessment` answer-set — it does not). One class, two `dct:source`-discriminated populations, is the minimal idiomatic shape; it mirrors `opda:BoundedContextScheme`, where *one* scheme serves six communities without minting six membership classes.

**ADJUDICATION Q3.** **ONE `RiskAssessment`** (both populations), **ONE `PerilScheme`** (both result families map to it). CON29-vs-environmental is a **provenance + peril-coverage** distinction the existing terms already carry — not a class boundary, until a named §Q6a query forces one. **FOR one class.**

**Vote: FOR (one class).**

---

## Q4 — the `riskSubcategories[]` recursion

**Vote: FOR modelling sub-perils as `skos:narrower` *within the scheme* (the recursion lives on the concept axis), with a *flat* sub-result list of `RiskAssessment` instances each pointing at its sub-peril concept; AGAINST a self-referential `RiskAssessment`-bears-`RiskAssessment` datatype recursion.** Named convention: **SKOS Reference §8** (Isaac — `skos:broader`/`skos:narrower` are the standard intra-scheme hierarchy; §8.6.3 they are **NOT transitive** by default, `skos:broaderTransitive` is the transitive super-property); **ODR-0008 §Q6a** (predicate hierarchy admitted only on named entailment query — distinguished there explicitly from "SKOS broader/narrower for value-spaces").

**Argument.** The data shows the recursion is **on the peril axis, not the result structure**: each of the 12 perils has exactly one `riskSubcategories` entry (12 total), and the sub-blocks (`flooding.historicalFlooding`/`floodDefences`; `radon.radonTest`/`remedialMeasures…`; `contaminatedLand.entry`/`contaminatedLandNotice`) are **finer-grained perils** within the parent peril. The right home for "Flooding has sub-peril Historical-Flooding" is **`skos:narrower`** between two `skos:Concept`s — exactly what SKOS §8 is for — *not* a result-bearing-results datatype tree. Concretely:

- **Concept axis (the hierarchy):** `opda:peril/Flooding skos:narrower opda:peril/Flooding-Historical`. This puts the parent/child structure where SKOS §8 puts it, queryable with `skos:broader+`/`skos:broaderTransitive` when a consumer wants roll-up — and **§8.6.3's non-transitivity default protects us**: a consumer gets transitive closure *only* by asking for `skos:broaderTransitive`, never by accident (the §Q6a reasoner-independence concern, handled by SKOS's own design).
- **Result axis (flat):** a parent `RiskAssessment` (peril = Flooding) and its sub-results are **sibling instances** in a flat list, each `opda:assessesPeril` its own concept (Flooding, Flooding-Historical, Flooding-Defences). The "sub-result" relation is **derivable** from the concepts' `skos:narrower` edge — no second structural predicate, no self-referential datatype. This is the §Q6a discipline applied: don't mint a `RiskAssessment→RiskAssessment` containment predicate when the hierarchy is already carried by `skos:narrower` on the value-space the instances reference.

A **self-referential `RiskAssessment`** (a result literally nesting sub-result *datatypes*) would (i) re-encode, on the result, a hierarchy that belongs on the concept scheme (duplication — DCMI one-fact-one-home); (ii) lose the dereferenceable sub-peril URI a consumer queries; and (iii) make "all flood-family results" a recursive datatype-walk instead of a one-hop `skos:narrower` SPARQL. **The recursion is real, but it is a *concept* recursion (`skos:narrower`), not a *result* recursion.**

**ADJUDICATION Q4.** Sub-perils = **`skos:narrower` within `opda:PerilScheme`** (SKOS §8, non-transitive by default per §8.6.3); the sub-results are a **flat list of `RiskAssessment` instances** each referencing its sub-peril concept; the parent/child link is **read off the scheme**, not re-stored on the result. **AGAINST** self-referential `RiskAssessment`. **FOR** flat-results-over-a-`skos:narrower`-scheme.

**Vote: FOR (flat results; `skos:narrower` carries the recursion).**

---

## Q5 — provenance + IC + the five existing classes' internals

**Vote: FOR hanging the whole family off the ODR-0009 PROV-O backbone (`prov:wasGeneratedBy` the search/authority activity) per §Q4a; FOR the UFO categories + ICs below.** Named convention: **ODR-0009 PROV-O backbone** (Claim/Evidence/Verification → `prov:Entity`/`Activity`/`Agent`); **PROV-O Rec §3.2** (Entity); the **`skos:scopeNote` UFO-category house style** already on the five classes (`opda-descriptive.ttl`).

**Argument — the provenance hook (one pattern, the whole family).** Per ODR-0009's backbone and §Q4a's criterion (a), every authority-retrieved artefact is a **`prov:Entity` generated by the authority/provider activity**:

```turtle
opda:RiskAssessment rdfs:subClassOf prov:Entity .          # joins the family
<risk-assessment/…> a opda:RiskAssessment ;
    opda:assessesPeril opda:peril/Flooding ;               # ← the Q2 concept (dereferenceable discriminator)
    prov:wasGeneratedBy <activity/groundsure-search-run-…> ;# the search/authority activity (§Q4a (a))
    prov:wasAttributedTo <agent/Groundsure> ;              # the provider Organisation (per-instance dataset provenance)
    prov:generatedAtTime "…"^^xsd:dateTime ;               # IC component
    opda:riskIndicator … ; opda:actionAlertRating … ;      # the 6-field block (flat, S023 Kendall)
    opda:result … ; opda:summary … ; opda:recommendations … .
```

This is the **boring continuation** of ODR-0009 — `RiskAssessment` is to a search-run what `opda:DocumentEvidence`/`opda:ElectronicRecordEvidence` are to a verification: an Entity in a derivation graph, `prov:wasInformedBy`-chainable where one search feeds another. **No new provenance predicates** — the backbone already carries who (`prov:wasAttributedTo` the provider), what-process (`prov:wasGeneratedBy` the search activity), when (`prov:generatedAtTime`).

**UFO meta-category + IC for each class** (discharging A9 (a)+(b); the five existing classes already carry a `skos:scopeNote` — this *states the IC* §Q4a left implicit):

| Class | UFO meta-category | Identity criterion (over named hard cases) |
|---|---|---|
| **`opda:RiskAssessment`** *(new)* | **Object / information artefact** (Guizzardi 2005 Ch. 4); `prov:Entity` | **(peril concept × generating activity × `prov:generatedAtTime`)**. Hard cases: re-run (new activity → new instance, prior `dct:isReplacedBy`); two providers one peril (distinct activities → distinct instances of *same* concept); reissue/correction (new `prov:wasGeneratedBy`, supersedes). |
| **`opda:Search`** | Substance Kind, informational; `prov:Entity` | the **local-authority/provider issuance chain** (`prov:wasGeneratedBy` → LA/provider activity) × order-instant. Hard cases: re-order; partial return; supersession (ordered/returned/superseded — already on the class, `opda-descriptive.ttl:44`). |
| **`opda:Survey`** | Substance Kind, informational; `prov:Entity` | **professional-issued activity** (`prov:wasGeneratedBy` → surveyor's report-issuance) × issue-instant. Hard cases: re-survey; supersession; withdrawal; re-issue (already named on the class, `:52`). |
| **`opda:EPCCertificate`** | Substance Kind, informational; `prov:Entity` | the **DESNZ-register assessment activity** × lodgement-instant (the register entry's RRN). Hard cases: re-assessment supersedes (10-yr validity); register correction. Distinct PII regime (criterion (c), ODR-0018). |
| **`opda:Valuation`** | Substance Kind, informational; `prov:Entity` | the **RICS-regulated (or AVM) valuation activity** × delivery-instant. Hard cases: instructed/delivered/superseded; re-valuation; desktop-vs-physical re-issue. |
| **`opda:Comparable`** | Substance Kind, informational; `prov:Entity` | the **Land-Registry/VOA-sourced record** it derives from (`prov:wasDerivedFrom` the PPD/VOA datum) — IC inherited from the underlying market-data record, not minted afresh. Hard cases: same sale cited by two valuations (one Comparable, two `prov:wasInformedBy`); PPD correction. |

The five existing classes keep their `skos:scopeNote` UFO statements verbatim; R1 **adds the IC sentence** each §Q4a promotion deferred, and **adds the property internals** (the six-field block on `RiskAssessment`; `prov:wasGeneratedBy` + the type-specific facets on the five).

**ADJUDICATION Q5.** Whole family `rdfs:subClassOf prov:Entity`, generated by the authority/provider activity per ODR-0009 + §Q4a (a); UFO category + IC stated per class as above. **FOR.**

**Vote: FOR.**

---

## Q6 — the four-way (Kendall's (a)–(d))

**Vote: FOR (b) — `RiskAssessment` class + peril SKOS scheme — on the criterion of *prov-bearing-addressability*; AGAINST (a) flat datatype-bag, (c) 12 subclasses, (d) reuse `Search` as a datatype.** Named convention: **ODR-0008 §Q4a (promotion) + §Q5a (SKOS-vs-string) + §Q6a (hierarchy admission)** — all three of OPDA's *own* ratified mechanisms point the same way; **SKOS Reference §3** (the axis is a scheme); **S023 Q4 (11–0)** already chose (b).

**The criterion that selects (b), and rejects the other three:**

- **(a) Flat datatype-bag** — six datatype properties on `Search`, no `RiskAssessment`. **Fails on two counts:** (i) loses the per-peril uniformity + cross-peril query (S023's "more powerful" property) — the six fields become 24× duplicated flat predicates; (ii) the result still cannot bear `prov:wasGeneratedBy` (it is not an Entity). **Rejected.**
- **(c) Per-peril 12 subclasses** — `FloodRisk`…`TransportationRisk` ⊑ `RiskAssessment`. **Fails SKOS §3 and ODR-0008 §Q5a** (Q2 argument): a delimited value-space is a *scheme*, not a class hierarchy; the `tenureKind` precedent forbids OWL-class-identity over enumerated value-spaces (`skos:exactMatch`, NEVER `owl:sameAs`); and the peril is a *subject/aboutness* of the result, not a sub-Kind of it. Adding a 13th peril must be a `skos:Concept` insert, not a TBox+reasoner change. **Rejected.**
- **(d) Reuse `Search` as a structured datatype** — fold the result into `Search`. **Fails §Q4a** (Q1 argument): a prov-bearing artefact buried in a datatype cannot carry `prov:wasGeneratedBy`; it puts the result where provenance cannot attach. **Rejected.**
- **(b) `RiskAssessment` class + peril SKOS scheme** — **wins on `prov-bearing-addressability`:** the result is an Entity (carries provenance + lifecycle, §Q4a (a)+(b)); the peril is a dereferenceable concept (addressable per-peril *and* cross-peril, Davis's requirement); the six-field shape is flat (Kendall's "flatten the shape, not the axis"); the sub-perils are `skos:narrower` (Q4). It is **the S023-favoured shape (11–0)**, it matches the **two live OPDA precedents** (`BoundedContextScheme`, the 23 enum schemes), and it is **what all three of ODR-0008's own §Q4a/§Q5a/§Q6a mechanisms independently select.** **Chosen.**

**ADJUDICATION Q6.** **(b)**, on **prov-bearing-addressability** — the single criterion that simultaneously demands a class (for provenance) and a scheme (for addressability), which only (b) supplies. **FOR (b).**

**Vote: FOR (b).**

---

## Settled position (one line per question)

- **Q1: FOR** — mint `opda:RiskAssessment ⊑ prov:Entity` (§Q4a (a)+(b)); IC = (peril × generating-activity × generation-time); a prov-bearing result earns a class, a datatype can't bear `prov:wasGeneratedBy`.
- **Q2: FOR** — a 12-member `skos:ConceptScheme` (`opda:PerilScheme`), dereferenceable concepts, each `dct:source`'d to its governing authority + stewarded; **NOT** 12 subclasses (fails SKOS §3 + §Q5a), **NOT** a string (fails addressability). Discharges Davis's worked query.
- **Q3: FOR one class** — one `RiskAssessment`, one `PerilScheme`; CON29 and environmental results are two `dct:source`-discriminated populations of the same class (§Q6a: no second class without a named CON29-specific-property query).
- **Q4: FOR** — sub-perils = `skos:narrower` within the scheme (SKOS §8, non-transitive default §8.6.3); flat list of sub-result instances each referencing its sub-peril concept; **AGAINST** self-referential `RiskAssessment`.
- **Q5: FOR** — whole family `⊑ prov:Entity`, generated by the authority/provider activity (ODR-0009 backbone, no new provenance predicates); UFO category + IC stated per class (the six existing/new classes).
- **Q6: FOR (b)** — `RiskAssessment` class + peril scheme wins on *prov-bearing-addressability*; (a)/(c)/(d) each fail one of {provenance, addressability, §Q5a}. S023 Q4 (11–0) and all three ODR-0008 mechanisms concur.

**Headline.** The peril/dataset axis is a **SKOS concept scheme** (SKOS Reference §3), not 12 OWL subclasses and not a string: twelve dereferenceable `skos:Concept`s, each `dct:source`'d to its governing authority and stewarded by Baker (deputy Isaac), `skos:narrower` carrying the sub-peril recursion — and a single prov-bearing `opda:RiskAssessment ⊑ prov:Entity` whose `prov:wasGeneratedBy` chain *earns* it a class while the scheme makes its `riskIndicator` addressable per-peril and cross-peril. This is the S023-favoured shape (11–0), it mirrors `opda:BoundedContextScheme` member-for-member, and it is what ODR-0008's own §Q4a/§Q5a/§Q6a mechanisms independently select.
