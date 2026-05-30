# Session 024 (R1) — Moreau — Authority-Retrieved Artefacts as the paradigm PROV case

**Author:** Luc Moreau (PROV-O co-editor; Queen of ODR-0009, S009). **Round:** R1. **Lens:** the authority-retrieved artefact family is the textbook `prov:Entity` ← `prov:Activity` ← `prov:Agent` triangle. **Cites:** S024-EVIDENCE; W3C PROV-O Recommendation (Lebo, Sahoo, McGuinness eds., 2013); [ODR-0009](../../ODR-0009-claims-evidence-provenance.md) (PROV-O backbone); [ODR-0008 §Q4a](../../ODR-0008-property-descriptive-attributes.md); [ODR-0017](../../ODR-0017-shacl-af-quality-rules-pattern.md) (succession materialisation).

---

## The frame: this family is not *like* a PROV case — it *is* one

S024-EVIDENCE line 14 states the operative fact: these artefacts are **authority-retrieved** — "produced by a search provider / data authority (Groundsure, Landmark, the Coal Authority, the local authority), so each bears provenance (who/when) + a lifecycle (issued / superseded / re-run)." That sentence is a verbatim instantiation of the PROV-DM core. A `Search`, a `RiskAssessment`, a `Survey`, an `EPCCertificate` is a **`prov:Entity`** that **`prov:wasGeneratedBy`** a search/assessment/inspection **`prov:Activity`**, **`prov:wasAttributedTo`** a provider **`prov:Agent`** (Groundsure, the Coal Authority, the DESNZ-accredited EPC assessor), bears `prov:generatedAtTime` (the issue date), and — on re-run — **`prov:wasDerivedFrom`** the prior artefact.

The as-built TTL already commits to this. `opda-descriptive.ttl` emits all five §Q4a classes as `rdfs:subClassOf prov:Entity`, and `opda-descriptive-shapes.ttl` carries a **`sh:Violation`-severity** shape: *"Class-promoted descriptive Kind MUST carry `prov:wasGeneratedBy` to its issuing activity per ODR-0008 §Q4a … (authority-retrieved provenance is the IC discriminator for class-promotion)."* The council is not debating whether to wire PROV in — it is **already wired and already normative-blocking**. R1's job is to extend that exact backbone to `RiskAssessment` and to discharge the meta-categories. I argue we do so by **reuse, not minting**.

This is the direct fulfilment of ODR-0008 §Q4a criterion (a): *"authority-retrieved provenance (`prov:wasGeneratedBy` chain to regulator-issued or professional-issued activity)."* It is also exactly the spawn-trigger §Q2a(b) named: *"when Survey/EPC/Search/Title-Plan cannot be flat datatype bags without losing `prov:wasGeneratedBy`, spawn ODR-0008d."* We are here because the provenance graph is load-bearing. The whole point of this session is that you **cannot** flatten it.

---

## Engaging Cagle (DA) up front: the flatten loses the graph, and the graph is the regulated artefact

Cagle's standing move (S024-EVIDENCE alternative (d), and his S008 line) is *"that's a structured datum on Search — flatten it."* I answer this once, structurally, and then apply it per-question.

A `prov:Entity` flattened into a literal **loses its generation edge**. The moment `RiskAssessment` becomes an `xsd:string`-shaped blob hung on `Search`, you can no longer ask: *who* produced this coal-mining result, *when*, *from which prior survey was it derived*, and *against which `prov:Plan` (the CON29M procedure)*. Those are not decorative metadata — in a regulated conveyancing transaction they are **the** questions a lender's solicitor must answer. A lender accepting a mortgage offer conditioned on a coal-mining search is making a regulated reliance decision on **who issued it and when**; PROV's `prov:wasAttributedTo` + `prov:generatedAtTime` are the bytes that carry that. Flatten them and you have destroyed the audit trail that is the artefact's reason for existing.

This is precisely the PROV-O design rationale: PROV exists because **a value without its derivation history is not trustworthy data**. Cagle's "structured datum" is the failure mode PROV was standardised to prevent. The prov-bearing lifecycle (issued / superseded / re-run) is not a reason to keep it a datatype — **it is the reason it is a class**. A datatype has no lifecycle; only an Entity can be `prov:wasDerivedFrom` another.

I concede Cagle's narrower point and fold it in (Q4 below): not *every* leaf in the result block needs to be an Entity. The six-field result *cells* (`riskIndicator`, `actionAlertRating`) are datatype properties **on** the `RiskAssessment` Entity. The discipline is: **the artefact is the Entity; its readings are its literals.** That is the standard PROV granularity call, and it is where Cagle is right and where he overreaches if pushed further.

---

## Per-question positions

### Q1 — `RiskAssessment` as a class? IC?

**Position: FOR a distinct `opda:RiskAssessment` class, `rdfs:subClassOf prov:Entity`** (matching the five siblings exactly), against alternative (d)'s structured-datatype-on-`Search`.

**Why (PROV-O):** A per-peril result that `prov:wasGeneratedBy` a per-peril assessment activity (the Groundsure/Landmark environmental search run), `prov:wasAttributedTo` the data authority, and on re-run `prov:wasDerivedFrom` the prior assessment, satisfies §Q4a criterion (a) **and** (b) (distinct lifecycle) on the nose. The W3C PROV-O Recommendation §3.2 defines `prov:Entity` as *"a physical, digital, conceptual, or other kind of thing with some fixed aspects"* — a coal-mining risk result with a fixed issue date and a fixed authority is the paradigm digital Entity.

**Identity criterion (the named hard cases):** A `RiskAssessment` is identified by the **`(generating Activity, peril Concept, generatedAtTime)` triple** — i.e. *this dataset's reading of this peril, produced by this assessment run at this instant*. Two readings of flood risk for the same property at different dates are **distinct Entities** linked by `prov:wasDerivedFrom` (the re-run case), not one mutable record. This is the ODR-0009 discipline ("the *verified* claim … is a derived entity") applied to the search domain, and it reuses ODR-0017's succession-materialisation pattern (a SHACL-AF `sh:Info` rule on the `prov:wasDerivedFrom` chain) rather than minting a bespoke `previousAssessment` predicate. UFO category: **Substance Kind, informational** — identical to the framing already emitted for `Survey`/`Search` in `opda-descriptive.ttl` (`skos:scopeNote "UFO: Substance Kind, informational"`).

**Vote: FOR.**

### Q2 — the peril/dataset axis: SKOS scheme vs subclasses vs string

**Position: FOR a first-class 12-member SKOS concept scheme of dereferenceable `skos:Concept` perils; AGAINST 12 OWL subclasses (alt c); AGAINST an opaque string.**

**Why (PROV-O):** PROV does not model the *subject* of an assessment — it models its generation. The peril (flooding, coalMining, radon, …) is the **value-space axis** along which one `RiskAssessment` Entity is parameterised, not a sub-kind of Entity. In PROV terms the peril is best read as the `prov:Plan`/topic the generating Activity addressed, and the natural OPDA home for a value-space is a SKOS scheme (ODR-0009 §"Vocabulary delegation" routes exactly this kind of axis to SKOS via ODR-0011). S024-EVIDENCE Q2 records the consumer query that settles it: *"a lender's offer condition **names** the coal-mining search — the axis must be queryable."* A `skos:Concept` with a stable IRI is queryable and dereferenceable; 12 OWL subclasses bloat the TBox and force reasoner-dependent UNION queries (the §Q6a reasoner-independence test in ODR-0008 would flag them as decorative); an opaque string is unqueryable. The 24-parent / 12-peril uniformity in S024-EVIDENCE line 11 is precisely *one shape × twelve values* — that is a scheme, not twelve schemas.

**Vote: FOR** (SKOS scheme).

### Q3 — one family class or two (environmental-search vs CON29 local-authority)?

**Position: FOR one `RiskAssessment` class spanning both**, discriminated by the peril/dataset Concept (Q2) and by the generating `prov:Activity`/Agent — not two classes.

**Why (PROV-O):** Both the environmental-search result and the CON29 local-authority result are the **same PROV shape**: an Entity generated by an authority's assessment activity, attributed to that authority, carrying a six-field reading and an issue date. The thing that differs — Groundsure vs the local authority, environmental peril vs CON29 enquiry — is the **`prov:wasAttributedTo` Agent and the peril Concept**, both of which are *properties/links* of the Entity, not grounds for a second class. PROV-O's whole economy is that you distinguish provenance by **edges to Agents/Activities**, not by proliferating Entity types. Minting `LocalAuthoritySearchResult` alongside `EnvironmentalRiskAssessment` would duplicate the entire six-field structure and split cross-peril queries — the exact ODR-0008 §Q3 "per-form synonyms" defect. One class; the authority distinction lives on the attribution edge.

**Vote: FOR** (one class).

### Q4 — the `riskSubcategories[]` recursion: self-referential or flat sub-result list?

**Position: FOR a self-referential `RiskAssessment`** — a parent assessment bears sub-assessments, each itself a `RiskAssessment` — modelled via **`prov:wasDerivedFrom` / `prov:hadMember`** rather than a flat opaque list. *This is where I grant Cagle his cell-level flatten.*

**Why (PROV-O):** S024-EVIDENCE line 11 establishes the recursion is **real and uniform**: the six-field block recurs across "12 environmental perils × 2 (the peril + its `riskSubcategories[]`)." A sub-result (e.g. surface-coal-mining *within* coalMining) is itself an authority-issued reading with the same six fields and the same provenance — so it is the **same Entity shape one level down**. PROV-O models exactly this with collection/derivation: the parent `RiskAssessment` `prov:hadMember` (PROV-O collections) its sub-`RiskAssessment`s, **or** each sub-result `prov:wasDerivedFrom` the parent's source data. Self-reference reuses the one class and keeps cross-level queries uniform.

**The Cagle concession lives here:** the *six result cells themselves* (`riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`) are **datatype properties on** the `RiskAssessment` Entity — NOT child Entities. The recursion is over *assessments*, not over *fields*. So: Entity for the assessment and its sub-assessments (they have provenance + lifecycle); literals for the readings (they do not). That is the correct PROV granularity and it answers Cagle's "don't over-reify" instinct precisely.

**Vote: FOR** (self-referential, via `prov:hadMember`/`prov:wasDerivedFrom`; cells as literals).

### Q5 — provenance + IC + the five existing classes' internals

**Position: FOR hanging the whole family off the ODR-0009 PROV-O backbone via `prov:wasGeneratedBy`, REUSING existing terms — and in particular `datasetAttribution` IS `prov:wasAttributedTo`; do NOT mint a parallel predicate.**

**Why (PROV-O) — the wiring, per class:**

- **`opda:RiskAssessment`** — `rdfs:subClassOf prov:Entity`; `prov:wasGeneratedBy` the assessment Activity; `prov:wasAttributedTo` the data authority Agent; `prov:generatedAtTime` = issue date; `prov:wasDerivedFrom` the prior on re-run. UFO: Substance Kind, informational. IC: `(Activity, peril, generatedAtTime)` triple (Q1).
- **`opda:Search`** — already emitted `subClassOf prov:Entity`; IC = the local-authority issuance chain (CON29R/LLC1), `prov:wasGeneratedBy` the search-order Activity, `prov:wasAttributedTo` the local authority. Lifecycle ordered/returned/superseded = PROV derivation. (As-built `skos:scopeNote` confirms.)
- **`opda:Survey`** — `subClassOf prov:Entity`; IC = `prov:wasGeneratedBy` chain to the professional-issued inspection Activity (RICS surveyor as `prov:Agent`); supersession/withdrawal = `prov:wasDerivedFrom` + ODR-0017 deprecation rule.
- **`opda:EPCCertificate`** — `subClassOf prov:Entity`; IC = DESNZ-register issuance; `prov:wasGeneratedBy` the accredited assessor's Activity, `prov:wasAttributedTo` the assessor (`prov:Agent`); 10-year validity + supersession-on-reassessment = `prov:wasDerivedFrom`.
- **`opda:Valuation`** — `subClassOf prov:Entity`; IC = RICS-regulated (or AVM) valuation Activity; `prov:wasGeneratedBy` it, `prov:wasAttributedTo` the valuer; instructed/delivered/superseded lifecycle.
- **`opda:Comparable`** — `subClassOf prov:Entity`; IC = Land-Registry/VOA-sourced datum; **`prov:wasInformedBy`** is the load-bearing edge here (already in its `rdfs:comment`): the Valuation activity `prov:wasInformedBy` the activity that produced the Comparables. This is the one place the *Activity-to-Activity* edge, not just generation, carries the weight.

**The `datasetAttribution` ruling (critical, per my brief):** the six-field block's sixth field, `datasetAttribution`, **is `prov:wasAttributedTo`** (or its qualified form `prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole`, exactly as ODR-0009 §"Qualified attribution" already established for verifiers). It names *who produced the dataset*. We **reuse** it — we do **not** mint `opda:datasetAttribution` as a bespoke datatype property. Minting a parallel attribution predicate would fork the provenance graph off the shared standard and defeat the entire ODR-0009 reuse driver ("the only option that places the derivation graph on a shared, dereferenceable standard"). Where the dataset provider warrants a richer description (licence, currency), `prov:wasAttributedTo` points at a `prov:Organization` carrying `dct:` descriptive metadata — again reuse, per ODR-0009 §References.

This also keeps the family **inside** ODR-0009's already-ratified `~80%`/five-exceptions boundary: the generation/attribution/derivation skeleton is native PROV; only a genuinely non-PROV residue (e.g. a search provider's access token or digest, if present) would route to the assurance layer's local terms. No new bespoke terms are needed for the provenance skeleton itself.

**Vote: FOR.**

### Q6 — the four-way (a flat-bag / b class+SKOS / c subclasses / d reuse-Search): which wins, on what criterion?

**Position: FOR (b) — `RiskAssessment` class + peril SKOS scheme — on the criterion of *provenance-graph preservation*.**

**Why (PROV-O):** Rank the four against the one question that matters in a regulated domain — *does it preserve the `prov:wasGeneratedBy` / `prov:wasAttributedTo` / `prov:wasDerivedFrom` graph?*

- **(a) flat datatype-bag on `Search`** — loses per-peril provenance and the re-run derivation edge; the six fields become attributeless literals with no generation history. **Fails the criterion.**
- **(d) reuse `Search` as a structured datatype** — Cagle's option; same failure as (a). The result block, demoted to a literal, can no longer be `prov:wasGeneratedBy` its own per-peril activity. **Fails the criterion.** (And it conflates two distinct Entities — the *Search order* and the *per-peril RiskAssessment* it returned — which have different issue dates and can be re-run independently.)
- **(c) 12 OWL subclasses** — *preserves* provenance but at the cost of TBox bloat and reasoner-dependent queries; the peril axis is better a value-space (Q2). **Passes the criterion but loses on parsimony/queryability.**
- **(b) class + SKOS scheme** — preserves the full PROV graph (each `RiskAssessment` Entity carries its own generation/attribution/derivation edges) **and** keeps the peril axis queryable as dereferenceable Concepts. **Passes the criterion and wins on parsimony + queryability.**

(b) is the S023-favoured shape and it is the one consistent with the already-emitted `subClassOf prov:Entity` + `sh:Violation` `prov:wasGeneratedBy` shape. It needs no retrofit of the five siblings — it extends their exact pattern to a sixth.

**Vote: FOR (b).**

---

## Headline

The authority-retrieved family is the paradigm PROV case: a `RiskAssessment` (and each of the five ratified siblings) is a `prov:Entity` that `prov:wasGeneratedBy` an authority's assessment Activity and `prov:wasAttributedTo` that authority — `datasetAttribution` **is** `prov:wasAttributedTo`, reuse it; the prov-bearing lifecycle is precisely why these are classes and not Cagle's flattened literals.
