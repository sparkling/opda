# Session 023 — Elisa Kendall

**Role:** enterprise-fidelity voice; FIBO / OMG modular-ontology methodology; *Ontology Engineering* (Kendall & McGuinness 2019).
**Stance in one line:** I am FOR category-based import — FIBO does not mint a property per source field — but I gate every collapse behind a **traceability + regulatory-salience test**. A collapse that loses `dct:source` to the schema leaf path, or that flattens a regulator-distinct disclosure into a generic bag, is unacceptable to a regulated lender or conveyancer and I will vote it down.

My discipline, stated once and applied to every question below (so it is auditable, per S023-EVIDENCE §F):

> **FIBO Rule (reference, do not duplicate).** *Ontology Engineering*, Kendall & McGuinness 2019, ch. 3–4, and the EDM Council FIBO process: enterprise terms must be **precise, reusable, traceable**, and authoritative definitions are **referenced**, never re-minted. FIBO carries one `Address` structure, not one address-line property per source form; one `MonetaryAmount`, not a `price` per checklist item. The leaf explosion (S023-EVIDENCE §B: 56% of annotated leaves are ~16 recurring tail segments; `yesNo` referenced 1,135 times) is precisely the duplication FIBO's modelling team exists to *prevent*, not transcribe.

But FIBO's traceability obligation is symmetric and I hold it as hard as the reuse one:

> **Kendall Traceability + Salience Test (my proposed gate; see end).** A leaf may be collapsed into a category pattern **iff** (1) it remains recoverable, in **both directions**, via `dct:source` to its *schema leaf path* (not merely to the ODR), AND (2) it carries **no distinct regulatory meaning** that a lender/conveyancer relies on as a named fact. Leaves that fail (2) — a specific CON29 search result, a Building-Safety-Act disclosure, an EWS1/cladding statement — are **promoted or curated as Category G regardless of a generic segment name**. Generic *shape* (`details`, `comments`) collapses; regulatory *substance* does not, even when it wears a generic tail.

---

## Q1 — Diagnosis: conceptual richness, or form-ergonomics + repeated micro-structure?

**Position.** It is overwhelmingly form-ergonomics and repeated micro-structure — *and* PDTF is not "poorly modelled": it is **correctly modelled for a form-transport, at the wrong altitude for a TBox.** These are two different artefacts with two different fitness functions, and conflating them is the category error this session must name.

This is the exact distinction *Ontology Engineering* (Kendall & McGuinness 2019, ch. 2) draws between a **message/exchange model** (optimised for a transaction wire: every field a form asks, in the order it asks, nested for the UI) and a **reference/domain ontology** (optimised for shared meaning: one term per concept, reusable across exchanges). FIBO lives downstream of dozens of such message schemas (FpML, ISO 20022, regulatory filings) and the FIBO modelling team's *first* job is to map the recurring message micro-structure (a "party" block, an "amount" block) to the *single* reference term — never to transcribe the wire shape into the ontology. S023-EVIDENCE §B is the textbook signature of a message model: `details`×269, `price`×99, `comments`×96, the six-field risk-result repeated ×24 datasets, `yesNo`×1,135. That is not 1,135 concepts; it is one concept instantiated 1,135 times by a form. The OMG modular-ontology methodology I co-developed makes the same cut: ontologies are organised by **concept**, and form/serialisation structure is a *binding* concern, not a modelling concern.

So I reject "PDTF granularity is poor modelling" (it is good *for a form*) **and** I reject "therefore mirror it 1:1 into the TBox" (that is wrong-altitude). The diagnosis licenses category-based import: collapse the message micro-structure to reference patterns; reserve concepts for concepts.

One caveat I will not let pass silently (this is where I diverge from a pure flatten reading): "repeated micro-structure" is a statement about *syntax*, not *regulatory semantics*. `flooding.floodRisk.result` and `coalMining.result` share the segment `result` and the six-field shape — but a lender's mortgage-offer condition may name the *coal-mining* result specifically (CON29M) and the *flood* result specifically (CON29 Con/Env). Identical shape, distinct regulatory salience. The diagnosis is "repeated structure"; it does **not** follow that the instances are interchangeable. That reservation is the seed of my gate and the line I hold against Cagle in Q3–Q4.

**Vote:** FOR (form-ergonomics + repeated micro-structure; PDTF correct-for-transport, wrong-altitude-for-TBox; with a salience reservation).

---

## Q2 — The category taxonomy A–G: right decision-cut? Refine boundaries; UFO leaning per category.

**Position.** A–G is the **right decision-cut for import**, and it is the same move the OMG modular-ontology methodology makes: partition the source by *treatment*, route each partition to the construct that fits, reserve scarce human evaluation for the genuinely conceptual partition. I endorse the taxonomy with **three boundary refinements**, each driven by traceability or salience rather than by counts.

UFO leaning per category (so each routes to the right realizing record — I state these as *leanings* for the modelling team, not ratifications; UFO meta-category crystallisation is ODR-0008 §Q2a's spawn trigger, owned with Guizzardi/Allemang):

| Cat | Kendall leaning | Realizing record |
|---|---|---|
| **A** Disclosure / free-text tails | **Not a UFO endurant at all** — these are *qua-text elaborations of a Mode/Quality already named by the question*. One reusable annotation property (`opda:disclosureDetail`), `rdfs:comment`-grade. | reuse pattern; no class |
| **B** Evidence / attachment envelope | **Object (Document/Evidence)**, prov-bearing | **reuse ODR-0009** Evidence + PROV-O; do **not** re-mint |
| **C** Reused status enums | **Quale-in-Region** (a value drawn from a delimited value-space) | **ODR-0011** SKOS schemes |
| **D** Checklist items (fixtures) | the *item* is an **Object/Kind** (a "boiler", a "radiator") borne by the Property; its inclusion is a **Mode/Relator** of the *transaction* (this sale includes it), not a Quality of the brick-and-mortar | SKOS scheme of items + ~3 props; **see refinement 2** |
| **E** Repeated report/result structures | **Object + Quality**, prov-bearing (a `SearchResult`/`RiskAssessment` is an authority-retrieved Entity) | **promote to class** + peril/dataset scheme; ODR-0009 provenance |
| **F** Identity / address / contact / geo | already an Object elsewhere | **reuse ODR-0015 / ODR-0006**; geo deferred |
| **G** Genuine descriptive attributes | **Quality / Quale-in-Region / Mode, per leaf** | the curated per-leaf walk |

**Refinement 1 — split a salience-bearing slice out of A and E into G (the gate in action).** The boundary between "generic structure" (A, E) and "genuine concept" (G) is **not** the segment name; it is **regulatory salience**. A `details` tail under `sprayFoamInsulation`, `buildingSafety`, or `dangerousCladdingOrDefects` is *not* the same slot as a `details` tail under "are the curtains included" — the former is a named disclosure a lender's valuer and a conveyancer's report-on-title rely on (PII/BSA/EWS1 territory; ODR-0008 §Q4a already promotes on distinct lifecycle / distinct PII regime). My refinement: A collapses by **default**, but a leaf whose *parent question* is on a regulatory-salience allow-list is **carved up to G** even though its tail is generic. Same for E: the result *shape* is one class (good, FIBO reuse), but the **peril/dataset axis** (`flooding` vs `coalMining` vs `groundStability`) is conceptual and must be a first-class SKOS scheme with regulator `dct:source`, not an opaque string — because that axis is what a lender names.

**Refinement 2 — D's UFO split is load-bearing, don't fudge it.** The evidence offers "Object/individual, or Quality." These are not interchangeable. The **fixture item** ("boiler", "fitted wardrobe") is reference data → a SKOS scheme (Object/Kind). The **inclusion status** ("Included/Excluded/None") is *not* a Quality of the Property — it is a **Mode/Relator of the sale transaction** (S007 territory): the same boiler is "included" in one sale and absent from the next. Modelling inclusion as a datatype Quality of `opda:Property` would misattribute a transaction fact to the building. So D = {SKOS item scheme (Object)} + {`opda:inclusionStatus` as a property of a *transaction-scoped fixtures list*, Quale-in-Region over the C-scheme} + {`comment` (A-grade), `price` (a `MonetaryAmount`, reuse not re-mint)}.

**Refinement 3 — name the residue explicitly.** A–F are not exhaustive by construction; some leaves will resist every pattern (a one-off structured object that is neither evidence nor result nor checklist). The taxonomy needs an explicit **"residue → ODR-0008 §Q1a reconciliation register"** bucket so nothing is *silently* dropped — FIBO's process never lets a source field vanish without a recorded disposition. This is also the honest answer to Davis: "collapsed" must mean "recorded as collapsed," never "lost."

**Vote:** FOR (A–G is the right cut; conditioned on refinements 1–3 — salience-carve from A/E into G, D's Object/Mode split, an explicit recorded residue).

---

## Q3 — Whole or part? (the core decision)

**Position.** Import **by category**, not 1:1. This is the single clearest application of the FIBO rule in the whole session, and the build pass has already *proven* the alternative unsound.

The mechanical 1:1 walk (S021) does not merely *risk* duplication — the 2026-05-30 build pass (S023-EVIDENCE §D; build-pass handover line 51) **demonstrated it collapses anyway, accidentally and unrecoverably**: of 1,521 annotated base leaves only 250 have a unique final segment, so last-segment naming would fuse 1,521 distinct attributes into ~351 *colliding* permanent IRIs (`details`×269 → one IRI). So the real choice is **not** "1:1 fidelity vs lossy collapse." It is:

- **mechanical walk** = collapse by *accident*, by string collision, with **no recorded basis** and ~900 permanent unreversible IRIs; or
- **category import** = collapse by *design*, by recorded treatment, with `dct:source` preserved and the conceptual ~181 (G) curated precisely.

Stated that way the mechanical walk is the *strictly worse* collapse on FIBO's own criteria: it duplicates (351 colliding IRIs is neither one-term-per-concept nor faithful-per-leaf — it is the worst of both), it is **not traceable** (which of the 269 `details` is this IRI?), and it freezes the error into stable identifiers. *Ontology Engineering* (ch. 4) is explicit that **identifiers are commitments**; you do not mint 900 permanent IRIs from an auto-derivation you already know collides. Henrik's deferral of ADR-0028's P2 to "a curated WG pass" was the correct call and this session ratifies the *strategy* behind it.

So: collapse A–F to patterns/schemes/classes/upstream-reuse; per-leaf evaluation **only** for G (refined per Q2 to *include* the salience-carved leaves). This is exactly the EDM Council FIBO workflow — Modelling Team triages the mass to reusable patterns, Editorial curates the genuine terms — applied to PDTF.

**The one thing I will not concede to a pure flatten:** "import by category" is *not* "throw the leaves away." Every collapsed leaf must leave a `dct:source` to its schema leaf path in the pattern instance / SHACL profile, and the salience-carved leaves are *added back* as G. Whole-vs-part is "curate few, collapse most **with provenance**" — not "collapse most, full stop."

**Vote:** FOR the proposition (import by category; per-leaf only for G; against the 1:1 mechanical walk).

---

## Q4 — Recurring micro-patterns (A, B, E)

**Position.** Reusable property/class patterns, decisively — and for **B and E, reuse what already exists rather than mint new** (the FIBO non-duplication rule at its sharpest).

- **A — disclosure / free-text tail.** One reusable annotation property, `opda:disclosureDetail` (`rdfs:comment`-grade), attached to the question it elaborates — **not** 269 per-question `opda:somethingDetails`. *Ontology Engineering* ch. 3: free-text elaboration is annotation, not a modelled datatype concept; minting 269 of them is noise that degrades query precision (a consumer searching "the details property" gets 269 false hits). **Salience exception (my gate):** where the tail's parent question is regulator-named (BSA, EWS1, spray-foam, knotweed), the *disclosure itself* is Category G — `opda:disclosureDetail` is still the property, but the **question node is a curated, DPV-co-annotated term** (ODR-0008 §Q4a distinct-PII / distinct-lifecycle promotion), so the audit trail names the regulated fact.

- **B — evidence / attachment envelope.** **Reuse ODR-0009 Evidence + PROV-O. Mint nothing.** This is the cleanest reuse in the session and the exact FIBO discipline: ODR-0009 already defines `opda:DocumentEvidence`/`ElectronicRecordEvidence`/`VouchEvidence rdfs:subClassOf prov:Entity` with `prov:wasDerivedFrom`/`prov:used`. The `attachments`×82 leaves are instances of that envelope, not new properties. Re-minting an `attachments` datatype property per disclosure would *fracture* the provenance graph ODR-0009 deliberately unified — a regression. ~3 reused predicates (`prov:used`, document metadata via `dct:`), zero new local terms.

- **E — search / risk-result structure.** **Promote to a class** — `opda:SearchResult` / `opda:RiskAssessment` (~6 props: `riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution`) — **plus a peril/dataset SKOS scheme**, and hang it off ODR-0009 provenance because these are authority-retrieved (CON29, environmental data providers; `prov:wasGeneratedBy` the search provider). One class × ~24 datasets, not ~200 datatype properties. This satisfies ODR-0008 §Q4a's class-promotion test on **two** independent criteria: authority-retrieved provenance AND distinct lifecycle (a search is issued / superseded / re-run). **My non-negotiable on E:** the *dataset/peril axis is conceptual and salience-bearing* (refinement 1) — `datasetAttribution` and the peril identity must be a first-class scheme with regulator `dct:source`, because that is the granularity a lender's offer condition names ("a satisfactory coal-mining search"). Collapse the *shape* (6 fields → 6 props on one class); **do not** collapse the *peril axis* (24 datasets → opaque string).

**Vote:** FOR (A → one reusable annotation prop + salience-carve; B → reuse ODR-0009, mint nothing; E → promote to class + first-class peril scheme).

---

## Q5 — Checklist + enums (D, C)

**Position.** **Reference-data SKOS scheme + ~3 props for D; ODR-0011 SKOS schemes for C.** 315 datatype properties for fixtures is the duplication FIBO exists to refuse; 315 → {a scheme of ~89 items} + {~3 props} is one-term-per-concept done correctly.

- **D — fixtures & fittings (~315 leaves / 89 items).** A **SKOS scheme of fixture items** (`opda:FixtureItemScheme`: boilerImmersionHeater, radiatorsWallHeaters, nightStorageHeaters, …) is reference data — exactly how FIBO treats a controlled product/instrument list (a scheme, never a property-per-member). Then ~3 properties on a **transaction-scoped fixtures list** (per Q2 refinement 2, because inclusion is a sale Mode, not a Property Quality): `opda:inclusionStatus` (Quale over the C-scheme `Included/Excluded/None`), `opda:comment` (A-grade `opda:disclosureDetail`), `opda:price` (**reuse a `MonetaryAmount` pattern — do not mint 89 `price` datatype properties**; the £ field is one monetary concept, S023-EVIDENCE §B `price`×99). A `FixtureItem` *class* is over-engineering here: the items are an enumerable controlled list with no per-item lifecycle or provenance, so SKOS reference data is the right weight (Kendall & McGuinness 2019, ch. 5 — SKOS for controlled value/reference sets, OWL classes for things with identity criteria and behaviour). I would only promote to a class if a named consumer query needs per-item reasoning — demand-driven, ODR-0008 §Q4a, not now.

- **C — 54 enum value-sets.** **ODR-0011 SKOS schemes, with one shared reused property per value-space** — not per leaf. 378 enum leaves → 54 schemes, and the *shared* property is the point: `Yes/No`×77 is **one** `opda:yesNo`-style binding reused across all 77 sites (ODR-0008 §Q5a already rules `yesNoNotKnown` → `sh:in`, and §Q7a's enum-union clause already carries the union-of-overlay-members at base with per-form `sh:in` in ODR-0010). This is FIBO's value-space discipline exactly: a delimited value-space is a scheme referenced by many properties, never re-enumerated per property. **One salience caveat:** a few enum value-spaces are *regulator-governed* (EPC band A–G is DESNZ-governed — the curated `currentEnergyRating` comment already says so; council-tax band A–I is VOA-governed). These schemes must carry `dct:source` to the **governing authority**, not just to the schema leaf, so the audit trail shows *who governs the value-space* — a lender needs to know the EPC band came from the DESNZ-defined scale, not an arbitrary enum.

**Vote:** FOR (D → SKOS item scheme + ~3 props incl. reused `MonetaryAmount`, transaction-scoped; C → ODR-0011 schemes with shared reused properties; regulator-governed schemes carry authority `dct:source`).

---

## Q6 — Coverage, round-trip & residual scope (Davis's crux)

**Position.** Category-based import **satisfies** BASPI5 round-trip and consumer queries without 1:1 leaves — **provided the traceability discipline is actually enforced**, which is exactly the condition Davis is right to demand and which the *currently curated* properties **do not yet meet**. I take Davis's crux seriously and answer it on the merits rather than waving it away.

**On round-trip (the MVP gate).** ODR-0008 §Q7a already places per-form structure in the SHACL profile layer (ODR-0010): base TBox is `0..*`; the profile's `sh:path`/`sh:minCount`/`sh:in` enumerate and order exactly the leaves a given form needs. So the form is regenerated from {category pattern instances} + {profile shape} + {`dct:source` instance addressing} — the leaf identity survives in the profile + provenance, not in a flat TBox property. This is standard FIBO practice: the reference ontology is *thin and reusable*; the *exchange-specific* shape lives in a profile/SHACL artefact bound to that exchange. Round-trip fidelity is a property of the **profile**, not of TBox cardinality — so collapsing the TBox does **not** cost round-trip, as long as ODR-0029's per-form profiles actually enumerate the form's leaves (today they are emitted *thin* because the walk hasn't landed — so this is a real open dependency, not a solved one).

**On consumer addressability (`boilerImmersionHeater.price`).** Answerable via `dct:source` path addressing + the D-scheme: the consumer asks for the fixtures-list entry whose item is `boilerImmersionHeater` and reads its `inclusionStatus`/`price`. The path is preserved; the query goes through the scheme + transaction-scoped list, not a dedicated `opda:boilerImmersionHeaterPrice` property. Davis is right that this **must be tested** — so my gate makes a round-trip-equivalence SPARQL test (ODR-0008 §Q3a already names one) a *ratification condition*, not an afterthought.

**Where Davis is more-right-than-the-evidence-admits — the traceability gap I must flag.** The evidence pack frames `dct:source` instance-addressing as already solving recoverability. **It does not, in the current artefacts.** The curated properties I inspected (`opda:builtForm`, `opda:currentEnergyRating`, `opda:councilTaxBand`) carry `dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q5a>` — i.e. they point at **the decision record, not the schema leaf path**. That is *provenance of the modelling decision*, not *traceability to the source field*. Under category collapse this is a **fatal** gap: if `opda:disclosureDetail` instances all point to ODR-0008-Q5a, you cannot recover *which question* a given detail elaborated, in *either* direction. **My gate's hard requirement:** every collapsed leaf and every G property must carry `dct:source` to its **actual schema leaf path** (`pdtf-transaction.json#/propertyPack/.../builtForm`), per ODR-0008 §Q3a's per-property + per-overlay *array* of leaf-path triples — exactly the "lossless audit in both directions" §Q3a promises but the current emission does not deliver. Without that, category import *does* lose what Davis fears; with it, it does not. This is the single most important finding I bring to the Queen.

**On residual WG-curation scope.** Category G (~181 distinct names) is the right, bounded per-leaf target — **plus** the salience-carved leaves from A/E (refinement 1). So the residual is "**~181 + a small, named salience allow-list**," not ~935. That is an ~80% reduction in the expensive operation (S023-EVIDENCE §C headline) while *adding back* the regulatory-salient leaves a lender depends on. This is the FIBO Editorial-curation budget: bounded, conceptual, traceable.

**Vote:** FOR — **conditional on the traceability discipline being enforced as a ratification gate** (schema-leaf-path `dct:source` in both directions per §Q3a; round-trip-equivalence SPARQL test; profiles actually enumerating per-form leaves). Without those, I would move to ABSTAIN, because an unenforced collapse *does* lose Davis's recoverability.

---

## Cross-talk

### To Cagle (flatten-it)

We agree on the **structure** and I'll defend you against any "PDTF is just badly modelled" framing — it isn't, it's a message model (Q1), and your S008-Q3 instinct ("that nesting is form ergonomics, not ontology — flatten it") is *correct as a diagnosis*. FIBO flattens message micro-structure to reference terms every day; the six-field result becomes one class, `details`×269 becomes one slot. Where we part: **"flatten the nesting" is not "flatten the regulatory distinctions."** Your flatten correctly removes the `propertyPack` *blank-node nesting* (ODR-0008 already ratified that). It must **not** remove the *peril/dataset axis* in E or the *named-disclosure identity* in A — because flooding-result, coal-mining-result and a Building-Safety-Act disclosure are things a mortgage offer **names**, and a generic `result`/`details` string cannot answer "is there a satisfactory coal-mining search?" That is not ontological fussiness; it is the regulated query a lender actually runs. So: flatten the **shape**, keep the **scheme**. I expect you'll agree the peril axis is a SKOS scheme either way — that *is* a flatten (24 datasets → 1 scheme, not 24 classes); we only differ on whether the axis survives as a *first-class, regulator-sourced* concept (I say yes) or dissolves into a string (I say no).

### To Davis (DA — completeness-as-a-gate)

Your gate is **right** and I am strengthening it, not overruling it. Completeness is not satisfied by "we collapsed it" — it is satisfied by "we collapsed it **and the leaf is recoverable in both directions and the form round-trips**." I bring you a concrete defect that vindicates your worry: the *currently curated* properties point `dct:source` at the **ODR, not the schema leaf** — so today's artefacts would in fact fail your recoverability test under collapse. My traceability gate (schema-leaf-path `dct:source` per ODR-0008 §Q3a, in both directions) is the *operationalisation* of your completeness demand: it makes "no silent loss" a CI-checkable assertion (round-trip-equivalence SPARQL; the §Q3a per-overlay array recovers the cross-context table). Where I'll push back gently: completeness is a property of **{category pattern + SHACL profile + provenance}**, not of **TBox cardinality**. The 31 forms round-trip from the *profile layer* (ODR-0010/0029), where per-form structure was *deliberately placed* by ODR-0008 §Q7a — not from 935 flat datatype properties. So I vote *with* your gate and *against* the inference "therefore keep 1:1 leaves": 1:1 leaves don't *give* you round-trip (the profile does), and as the build pass showed, the mechanical walk **collides** and so fails your recoverability test *worse* than a recorded category collapse does. Hold your line on completeness — I'm handing the Queen the test that makes it enforceable.

---

### Proposed gate (one line, for the Queen)

> **Kendall Traceability + Salience Test:** a leaf may be collapsed into a category pattern **iff** it remains recoverable in both directions via `dct:source` to its *schema leaf path* (ODR-0008 §Q3a per-overlay array — **not** the ODR), **and** it carries no distinct regulatory salience (CON29/search-peril, BSA/EWS1/cladding, regulator-governed value-space); leaves failing either are curated/promoted as Category G regardless of a generic segment name.
