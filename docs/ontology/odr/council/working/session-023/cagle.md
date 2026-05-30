# Session 023 — Kurt Cagle (working position)

**Role:** Council member, OPDA Linked Data Council (ODR-0001). Full Council; agent-fan-out.
**Lens:** SHACL-first practitioner. Most of what a form schema calls a "property" is, on inspection, an **instance** (reference data) or an **enumeration** (concept scheme); a handful are genuine TBox attributes. Form ergonomics is transport, not ontology — flatten it (I argued exactly this at OPDA S008 Q3, recorded in [ODR-0008 §Context]: *"that nesting is form ergonomics, not ontology — flatten it"*).
**Sources I cite:** *The Cagle Report* / "The Ontologist" (SHACL-as-modelling-control-layer practitioner writing); W3C SHACL Recommendation 2017 (Knublauch & Kontokostas) Core + SHACL-AF; W3C SKOS Reference 2009 (Miles & Bechhofer) §§3, 4; my SHACL operationalisation already adopted into [ODR-0011 §1a/§7a]; the DBpedia 2017 mapping-maintenance lesson (typed-output discipline, ODR-0011 §8a).

**One framing the whole position turns on.** Allemang's S021 case ("scaling 23 → 900 is 39× the same loop, not 39× the deliberation") proves the walk is *cheap to emit*. It does **not** prove the walk is *correct to emit*. A path that recurs 269 times (`details`) is not a concept that recurs 269 times — it is **one** slot filled 269 times. The S021 walk mistakes **cardinality of occurrence** for **cardinality of concept**. The build pass (S023-EVIDENCE §D) proved this empirically: naive last-segment naming collapses 1,521 distinct leaves into ~351 *colliding* IRIs — because the leaves were never 1,521 concepts. They are ~181 concepts (Cat G) plus structure. Mint the 181; model the rest as what it is.

---

## Q1 — Diagnosis: conceptual richness, or form-ergonomics + repeated micro-structure?

It is repeated micro-structure, decisively, and the evidence is not close. Of 1,493 annotated true leaves, the final segment collapses to **337 distinct names**, **241 of which occur exactly once**, and **56% (840/1,493) are one of ~16 generic recurring tails** (`details`×269, `price`×99, `comments`×96, `isIncludedExcludedOrNone`×89, `attachments`×82) — S023-EVIDENCE §B. The project's own `audit.json` already classifies these as "reusable patterns" and records `yesNo` is "referenced **1,135 times. Not 1,135 unique concepts.**" That is the diagnosis in the corpus's own words.

PDTF's granularity is **correct-for-a-form-transport and wrong-altitude-for-a-TBox** — not "poor modelling." A JSON form needs `boilerImmersionHeater.price` and `radiatorsWallHeaters.price` as distinct addressable slots because a form is a *layout*; every cell needs a coordinate. A TBox needs `opda:price` **once**, plus a controlled list that says *which item* a given price is about. Conflating the two is the category error SHACL exists to prevent: SHACL (W3C SHACL Rec §2, the shapes-vs-data separation) is precisely the layer where per-form *shape* lives, leaving the vocabulary lean. The form's 99 `price` paths are 99 **shape targets**, not 99 **properties**.

This is the same defect [ODR-0008] already named and ratified a cure for — "in the schema these facts dangle off `propertyPack` with no first-class subject … *flatten it*." S023 is not re-litigating that; it is asking whether "flatten" was ever supposed to mean "mint one flat IRI per leaf." It was not: ODR-0008's "declare-once" reconciles the *same attribute across overlays*, never *every base leaf sharing a final segment* (ADR-0028's deferral note states this verbatim).

**Vote: FOR** (the proposition's diagnosis — repeated micro-structure, wrong altitude, not conceptual richness).

## Q2 — The category taxonomy A–G: right decision-cut? UFO leaning per category.

The A–G cut is the right decision-cut because each category routes to a **different realizing record** — and routing-by-realization is exactly what prevents the 900-IRI mistake. One refinement and the UFO leanings:

- **A — Disclosure/free-text tails (~407).** UFO: not a Quality at all — it is `rdfs:comment`-grade annotation *about an instance*. One reusable `opda:disclosureDetail` annotation property (range `xsd:string`), reused everywhere. The per-question identity lives in the **shape's `sh:targetClass`/`sh:path` context**, not a minted property. **Do not** mint 269 `*Details` datatype properties.
- **B — Evidence/attachment envelope.** UFO: Object (Document). **Reuse [ODR-0009] Evidence + PROV-O** — `opda:DocumentEvidence rdfs:subClassOf prov:Entity` already exists; ~3 props. Zero new descriptive properties.
- **C — Reused status enums (378 leaves → 54 value-sets).** UFO: **Quale-in-Region** (already the ODR-0011 §8a verdict for `builtForm`/`councilTaxBand`-class schemes). 54 `skos:ConceptScheme`s, each reused by **one** shared property.
- **D — Checklist items (~315 = 89 items × 3).** UFO: the *items* are Objects/individuals (reference data); the *facts about them* are Qualities. **A `FixtureItem` SKOS scheme of ~89 concepts + ~3 shared properties.** Detail in Q5.
- **E — Repeated report/result (~200 = one structure × ~24 datasets).** UFO: Object + Quality, prov-bearing. **One `opda:SearchResult`/`RiskAssessment` node-shape (~6 props) over one small class + a peril/dataset SKOS scheme.** Detail in Q4.
- **F — Identity/address/geo (~133).** Settled elsewhere — reuse [ODR-0015] (Address), [ODR-0006] (Agents); geo deferred. No action here.
- **G — Genuine descriptive attributes (352 instances → 181 distinct names).** UFO: Quality / Quale-in-Region / Mode, **per leaf** — this is the one category where per-leaf UFO adjudication earns its cost, because here the leaf *is* the concept.

**One boundary refinement (concede to Q2's invitation):** the A/G boundary must be drawn at *"does the leaf name a fact, or a place to write prose about a fact?"* `councilTaxBand` names a fact → G. `councilTaxBand**Details**` names a prose slot → A. Mechanically: a leaf whose final segment ∈ {`details`,`comments`,`summary`,`additionalInformation`} routes to A regardless of parent; everything in the §C-table's "G" name-list routes to G. This keeps the cut deterministic and lint-checkable (the [ODR-0011 §8a] typed-output / `odr-review` discipline applies unchanged).

**Vote: FOR** (A–G is the correct decision-cut; route by realizing record).

## Q3 — Whole or part? (the core decision)

**Import by category. Reject the 1:1 mechanical walk.** This is the load-bearing vote and I am the strongest FOR.

Three independent reasons, each named:

1. **The 1:1 walk is unsound, not merely expensive — the build proved it.** ADR-0028's own deferral note (2026-05-30, Henrik): "No leaf→term mapping exists … naive naming collides catastrophically … 1,521 distinct leaves into ~351 colliding properties … the IRIs are permanent and unreversible." You cannot mechanically emit 900 sound IRIs from a corpus that yields 351 collisions. The walk *as specified* (S021/ADR-0028 work-item 1, "for every annotated leaf emit `opda:<leafLocalName>`") **does not have a correct output**. That settles it before cost even enters.

2. **Category import is *less* work in the expensive operation.** "Evaluate 935 leaves with the WG" → "ratify ~5 structural treatments + curate ~181 G-leaves" — an ~80% reduction (S023-EVIDENCE §C headline). The structural treatments (A,B,C,D,E,F) are *already-ratified ODRs* (0009, 0011, 0015, 0006) applied mechanically; only G is novel per-leaf WG work.

3. **Category import is *more* queryable.** 900 flat datatype properties give you 900 disjoint predicates — `?p opda:boilerImmersionHeaterPrice ?v` and you cannot ask "every fixture price over £500" without a UNION of 89 predicates. The collapsed form — `?item opda:fixtureInclusion ?status ; opda:price ?v` — answers it in one BGP. SHACL/SPARQL reward shared predicates over a small class; they punish predicate sprawl. This is the SHACL-as-control-layer thesis (*The Cagle Report*): the shape carries structure so the vocabulary stays answerable.

**My one caution, conceded to Kendall/Davis up front:** collapsing **must preserve `dct:source`** on every collapsed instance, or a leaf becomes un-addressable. This is non-negotiable and it is *already* how [ODR-0008 §Sourcing] and [ODR-0004 §7a] work — the per-overlay `dct:source` references attach to the single property. Collapse the *property*; never drop the *provenance path*. With that preserved, nothing is lost (Q6 carries the proof).

**Vote: FOR** (import by category; per-leaf only for G).

## Q4 — Recurring micro-patterns A, B, E: reusable patterns vs per-leaf properties?

Reusable patterns, all three — and two of three are *zero new modelling* because the ODR already exists.

- **A (disclosure tail).** **One** `opda:disclosureDetail` (annotation, `xsd:string`). The 269 `details` leaves are the same free-text slot 269 times (S023-EVIDENCE §B.3). Per-question identity = the shape target. Per W3C SHACL Rec §2: the question "which disclosure is this?" is answered by *which node-shape's data you are in*, not by a distinct predicate. Minting `isListedDetails`, `sprayFoamInsulationDetails`, … ×269 would be 269 predicates that never co-occur and never need to be told apart at the vocabulary level.
- **B (evidence envelope).** **Reuse [ODR-0009] directly.** `opda:DocumentEvidence rdfs:subClassOf prov:Entity`, the verification `prov:used` it, `prov:wasDerivedFrom` on the claim. The 82 `attachments` arrays are instances of one envelope. New properties: **0**.
- **E (search/risk result).** **One `opda:SearchResult` (or `RiskAssessment`) node-shape, ~6 properties** (`riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution`) over one small class, **+ a peril/dataset `skos:ConceptScheme`** (flooding, radon, coal-mining, … ≈24 concepts). The ~200 leaves are *one structure × 24 datasets, recursively nested* (S023-EVIDENCE §B.2). The dataset identity (`flooding` vs `radon`) is a **concept in the scheme**, attached as `opda:peril`/`dct:subject` on the result instance — **not** 24 parallel copies of six properties. This is prov-bearing (each result `prov:wasGeneratedBy` a search activity), which is why it reuses the [ODR-0009] PROV-O backbone rather than inventing one.

Against per-leaf datatype properties for A/B/E: it would emit ~600+ IRIs that are, definitionally, the **same six-or-fewer slots** re-coordinatised per form cell. That is form ergonomics promoted to TBox — the exact error.

**Vote: FOR** (reusable property/class patterns; reuse ODR-0009 for B and E's prov spine).

## Q5 — Checklist + enums (D, C): the mechanism in full.

This is where the "instances-not-properties / enums-not-properties" thesis is sharpest. Both collapse, and I'll give Davis the dereference mechanism here so Q6's cross-talk can lean on it.

**D — Fixtures & fittings (~315 leaves = 89 items × 3 fields).** This is **reference data**, full stop. The ~89 chattels (`boilerImmersionHeater`, `radiatorsWallHeaters`, `nightStorageHeaters`, …) are a **controlled list of items** — they become ~89 `skos:Concept`s in an `opda:FixtureItemScheme` (W3C SKOS Reference §3: a controlled vocabulary needs a `ConceptScheme`; each concept carries `skos:prefLabel` + `dct:source` to its leaf path). The *property* is **one** `opda:fixtureInclusion` (Quality, range = the `(Excluded,Included,None)` scheme), plus `opda:comment` and `opda:price` — **3 shared properties, not 89×3 = 267 datatype properties.** A fixture line is then an instance:

```turtle
[] a opda:FixtureLine ;
   opda:fixtureItem opda:fixture/boilerImmersionHeater ;   # the SKOS concept
   opda:fixtureInclusion opda:inclusion/Included ;
   opda:price "350.00"^^xsd:decimal ;
   dct:source <…/baspi5.json#…/basicFittings/boilerImmersionHeater/price> .
```

The item-identity moved from the **predicate** (`boilerImmersionHeaterPrice`) to a **value** (`opda:fixtureItem opda:fixture/boilerImmersionHeater`). That is the whole move, and it is the one I have argued for in every form-to-ontology engagement: *a closed list of things is data, not schema.*

**C — Reused status enums (378 leaves → 54 value-sets).** Already decided by [ODR-0011]: each value-set is a `skos:ConceptScheme`, reused by **one** shared property. `(Excluded,Included,None)`×89, `(Attached,To follow)`×79, `(No,Yes)`×77 — these are **54 schemes**, not 378 properties, and emphatically not 378 × |members| individuals. The `(No,Yes)` set bound to `opda:yesNo` covers all 1,135 `yesNo` references with one predicate + one 2-concept scheme. Per ODR-0011 §7a (my own adopted amendment): `xsd:string` + `sh:in` over the scheme's concept URIs; **no** per-scheme custom datatypes unless a downstream consumer demands `sh:datatype` dispatch.

Against the alternatives: a `FixtureItem` *class* with 89 subclasses (one per chattel) would conscript a reasoner to police a hand-curated list — "machinery without a purpose," the exact OWL-enumerated-class anti-pattern [ODR-0011 §Alternatives] already rejected. And 315 datatype properties is the predicate-sprawl Q3(3) showed is *less* queryable. SKOS-scheme-of-items + 3 props is strictly less work and strictly more answerable.

**Vote: FOR** (D → FixtureItem SKOS scheme + 3 shared props as reference data; C → 54 ODR-0011 SKOS schemes with shared reused properties).

## Q6 — Coverage, round-trip, residual scope (Davis's crux).

Yes — category import satisfies BASPI5 round-trip **and** consumer queries without 1:1 leaves, **because the two things Davis fears losing live in two layers the strategy explicitly preserves.**

**(a) Consumer addressability — `dct:source` + the instance path.** A consumer asking "give me `boilerImmersionHeater.price`" is asking an **instance** question (what is the price of *this* fixture in *this* pack?), and instance questions are answered by instance data, not by the existence of a bespoke predicate. The path survives verbatim on `dct:source`; the SPARQL is one pattern:

```sparql
SELECT ?price WHERE {
  ?line opda:fixtureItem  opda:fixture/boilerImmersionHeater ;
        opda:price        ?price .
}
```

The predicate `opda:boilerImmersionHeaterPrice` never existed and is not missed — the *concept* (`opda:fixture/boilerImmersionHeater`) and the *fact* (`opda:price`) are both first-class and dereferenceable. **More** addressable, not less: the SKOS concept `opda:fixture/boilerImmersionHeater` has a URI, a `prefLabel`, a definition, and `dct:source` — a flat datatype property would have given the *predicate* a URI but left the *item* as an opaque path-fragment.

**(b) BASPI5 round-trip / form regeneration — the SHACL profile layer (ODR-0008 §Q7a).** The 31 forms regenerate from **SHACL overlay profiles** (ODR-0010), not from the vocabulary's predicate inventory. The profile is *where per-form structure was always supposed to live* — ODR-0008 §Cross-context-reconciliation: "per-form required/enum variation is expressed as SHACL property shapes in the overlay profiles, **not as duplicate datatype properties**." A form cell `basicFittings.boilerImmersionHeater.price` regenerates from a profile property-shape `sh:path (opda:fixtureItem opda:fixture/boilerImmersionHeater opda:price)` — SHACL property paths (W3C SHACL Rec §2.3) express exactly this nested addressing over collapsed predicates. The round-trip is a **shape** concern; collapsing the **vocabulary** leaves it intact.

So the 1:1 walk's *only* claimed advantage over category import — "a predicate per leaf guarantees round-trip + addressability" — is false: the predicate-per-leaf carries *neither* better than the path-on-`dct:source` + profile-shape pair does, and it costs 900 unreversible IRIs and 351 collisions to not-deliver it.

**Residual WG-curation scope: Category G, ~181 distinct names — and that is the right bounded target.** It is bounded (a named list, S023-EVIDENCE §C row G), it is genuinely conceptual (each leaf *is* a Quality/Mode, so per-leaf UFO adjudication earns its cost), and it is ~12% of the naive 1,493 — an order of magnitude inside what S021 scoped. Everything outside G is *ratify-a-treatment-once*, not *evaluate-a-leaf*.

**One concession to Davis (completeness-as-a-gate, his held-as-live dissent):** the totality CI must be *re-specified*, not dropped. ADR-0028's "count(annotated leaves) == count(emitted datatype properties) + count(class promotions)" assumed the 1:1 walk. Under category import it becomes: **every annotated leaf is accounted for by exactly one treatment** — emitted-as-G-property, OR carried-by-a-pattern (A/B/E), OR mapped-to-a-scheme-member (C/D), OR reused-upstream (F) — *zero unaccounted leaves*. That preserves Davis's "no silent omissions" gate exactly; it just counts *coverage by treatment* instead of *coverage by minted predicate*. I'd make that CI a blocker, same severity as today.

**Vote: FOR** (round-trip + addressability hold via `dct:source` + SHACL-profile paths; G ~181 is the right residual; re-specify totality CI as coverage-by-treatment).

---

## Cross-talk

**@Davis (DA) — your crux: "can you still dereference `boilerImmersionHeater.price` after you collapse?"**

Yes, and I want to answer it with the mechanism, not a slogan, because this is the legitimate heart of your dissent and it deserves the precise reply.

Your question contains a hidden type-error, and naming it is the whole answer: `boilerImmersionHeater.price` is **not a property** — it is an **instance coordinate** (the price of *this item* in *this pack*). You are asking an ABox question and worrying that collapsing the TBox loses it. It does not, because the ABox question is answered by ABox data:

- The **item** `boilerImmersionHeater` becomes a dereferenceable `skos:Concept` — `opda:fixture/boilerImmersionHeater`, with `prefLabel`, definition, `dct:source`. *More* dereferenceable than today: under the 1:1 walk the item is a fragment buried in a predicate string (`opda:boilerImmersionHeaterPrice`) with no URI of its own; under collapse it is a first-class resolvable concept.
- The **price** is `opda:price` on the fixture-line instance — and the line carries `dct:source <…/basicFittings/boilerImmersionHeater/price>`, so your exact JSON-pointer is preserved as data and round-trips.
- Your query is *simpler*, not harder: `?line opda:fixtureItem opda:fixture/boilerImmersionHeater ; opda:price ?p` — one BGP. The thing you could **not** do under 900 flat predicates — "every fixture priced over £500" — you *can* do under collapse, in one pattern, because the price predicate is shared.

So: you lose **nothing** you can name, and you gain (i) the item as a governable URI, (ii) cross-item queries, (iii) ~720 fewer permanent IRIs that the build pass proved can't even be minted without collision.

**Where I concede ground to you, explicitly** — and I think this closes the gap between us:

1. **`dct:source` is load-bearing and non-negotiable.** If a single collapsed instance drops its provenance path, your "un-addressable leaf" objection lands and I'm wrong. So I'd make `dct:source`-on-every-collapsed-instance a **SHACL `sh:minCount 1` Violation** (W3C SHACL Rec §2 — a constraint, not a hope). With that shape green, your addressability gate is *mechanically guaranteed*, not asserted.
2. **Your completeness gate stays — re-specified.** I am not asking you to drop "no silent omissions." I'm asking you to count it as *coverage-by-treatment* (every leaf → exactly one of: G-property / pattern / scheme-member / upstream-reuse) instead of *coverage-by-predicate*. Same blocker, same severity. If a leaf is accounted for by **no** treatment, CI fails — identical teeth to ADR-0028's totality assertion.
3. **BASPI5 round-trip is your MVP gate and it must stay green.** It does, in the **profile layer** — ODR-0008 §Q7a put per-form structure on the SHACL overlay *by ratified decision*; a profile property-shape with a SHACL property path (`opda:fixtureItem … opda:price`) regenerates your form cell from collapsed predicates. If a BASPI5 round-trip query genuinely needs a predicate the collapse removed, *that* is the trigger to promote it into G — demand-driven, your `Building`/`Room` precedent (held-as-live from S008) exactly.

The disagreement between us is narrower than it looks. You want a guarantee that nothing becomes un-addressable and every form still regenerates. I want the vocabulary lean enough to be queryable and sound enough to actually emit. **`dct:source` (Violation-enforced) + the SHACL-profile layer + a coverage-by-treatment CI give you your guarantee and me my lean vocabulary at the same time.** The only thing we both have to give up is the 1:1 predicate — and the build pass already proved that one can't be minted soundly regardless. We're not trading my position against yours; we're both trading against an option that doesn't have a correct output.
