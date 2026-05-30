# Council Session 023 — Descriptive-Layer Import Strategy & Property Categorisation

- **Date:** 2026-05-30
- **Records under review / produced:** produces **[ODR-0022](../ODR-0022-descriptive-layer-import-strategy.md)**; revisits the [Session 021](./session-021-bounded-context-implementation-plan.md) "execute the mechanical 935-leaf walk" verdict and the [ADR-0028](../../../adr/ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) "~90% mechanical" framing; operates under [ODR-0008](../ODR-0008-property-descriptive-attributes.md) (Declare-once-reconcile-overlays), [ODR-0011](../ODR-0011-enumeration-vocabularies.md), [ODR-0009](../ODR-0009-claims-evidence-provenance.md), [ODR-0010](../ODR-0010-overlay-profile-mechanism.md).
- **Queen:** Dean Allemang (*Working Ontologist*; model-the-data-you-have / derive-don't-declare; chaired S008 which authored ODR-0008)
- **Devil's Advocate:** Ian Davis (BBC `/programmes/` · UK-Gov / data.gov.uk publish-first; carried the S021 **completeness-as-a-gate** held dissent — the genuinely opposed methodology here)
- **Panel:** Giancarlo Guizzardi + Nicola Guarino (UFO / OntoClean) · Elisa Kendall (FIBO / OMG modular methodology) · Kurt Cagle (SHACL-first / "flatten the form ergonomics") · Tom Baker + Antoine Isaac (DCMI reuse-before-mint / SKOS Reference) · Holger Knublauch (W3C SHACL / TopBraid EDG) · Fabien Gandon + Jim Hendler (RDF / Linked Data principles / "a little semantics goes a long way")
- **Voices:** 11 (Allemang, Davis, Guizzardi, Guarino, Kendall, Cagle, Baker, Isaac, Knublauch, Gandon, Hendler) across **8 teammates**.
- **Input Documents:** `source/00-deliverables/semantic-models/data-dictionary-canonical.json` (8,458 entries / 16 canonical schemas), `audit.json`, `business-glossary.md`; ODR-0008/0009/0010/0011; ADR-0028/0029; the build-pass handover (`docs/HANDOVER-2026-05-30-bounded-context-build-pass.md`); the shared **[evidence pack](./working/session-023/EVIDENCE.md)** (verified, reproducible counts) cited throughout as **S023-EVIDENCE**.
- **Working files:** `working/session-023/{allemang, davis-da, guizzardi-guarino, kendall, cagle, baker-isaac, knublauch, gandon-hendler}.md` + `EVIDENCE.md`.
- **`consensus-mode`:** `agent-fan-out` (Agent fan-out; cross-talk via SendMessage / Agent Teams team `council-023`; one opening pass + DA rebuttal). Per-question votes are independent positions tallied standalone.
- **Format tier:** Full Council.

---

## Context

The bounded-context build pass (2026-05-30) hit a wall the design had not foreseen: the **935-leaf descriptive walk** that S021 ratified as a "~90% mechanical" emission (one annotated PDTF leaf → one flat `owl:DatatypeProperty`) turned out **not** to be mechanical. There is no leaf→term map; the existing ~23 descriptive properties were hand-curated; naive last-segment naming collapses 1,521 distinct leaves into ~351 *colliding, permanent, unreversible* IRIs. Henrik deferred the walk to "a curated WG pass." This session asks the **prior** question the wall exposed: before curating, *what should be imported at all, and at what granularity?* Is wholesale 1:1 import even the right target?

The convening frame put one proposition to the Council (S023-EVIDENCE §A): **classify the base descriptive leaves into a small set of property categories; for each, decide a modelling treatment (collapse-to-pattern / map-to-SKOS-scheme / promote-to-class / reuse-upstream / curate-per-leaf); reserve expensive per-leaf WG evaluation for the one genuinely conceptual category; and do NOT import the ~935/1,493 leaves 1:1.** Six questions were put (Q1 diagnosis; Q2 the A–G taxonomy; Q3 whole-or-part; Q4 the recurring micro-patterns; Q5 the checklist + enums; Q6 coverage/round-trip + residual scope). Votes tally `N-M-K` by voice (11 voices). DA scorecard and held dissents in the appendix.

The empirical spine the panel deliberated over (all reproducible from the canonical dictionary): of **1,493 annotated true leaves**, **56% (840) are ~16 generic recurring tail-segments** (`details`×269, `price`×99, `comments`×96, `isIncludedExcludedOrNone`×89…); 378 enum leaves carry only **54 distinct value-sets**; **809** leaf names appear in ≥2 of the 16 schemas, **393** in ≥3; the project's own `audit.json` already flags `yesNo` as "referenced 1,135 times — not 1,135 unique concepts." Three structures recur: fixtures = an ~89-item chattel checklist ×3 fields; searches/environmental = one six-field risk-result ×~24 datasets; disclosure = one `details` slot ×269.

---

## Question 1 — Diagnosis: conceptual richness, or form-ergonomics + repeated micro-structure? Is it "poor modelling"?

**Unanimous: it is form-ergonomics + repeated micro-structure — and PDTF is *correct-for-a-form-transport, wrong-altitude-for-a-TBox*, NOT "poorly modelled."**

Allemang (Queen) framed it as a competency-question failure: 935 flat predicates answer no question that ~181 real predicates plus the schemes do not — "the explosion is an artefact of counting *paths* (cells) where one should count *predicates* (relations)." Kendall named the precise distinction from *Ontology Engineering* (Kendall & McGuinness 2019, Ch. 2): a **message/exchange model** (every field a form asks, nested for the UI) versus a **reference/domain ontology** (one term per concept) — "S023-EVIDENCE §B is the textbook signature of a message model… that is not 1,135 concepts; it is one concept instantiated 1,135 times by a form." Gandon & Hendler grounded it in the Linked Data principles (Berners-Lee 2006): "the operative word is *things*… the world does not contain 269 distinct 'please-give-details' resources — it contains **one** disclosure-elaboration relation, instantiated 269 times by 269 different subjects"; Hendler's "A Little Semantics Goes a Long Way" (2003) "names the failure mode precisely: mistaking the *volume* of a data source for the *semantics* it carries." Guizzardi & Guarino put it in OntoClean terms: the ~754 free-text/scaffolding leaves have **no domain identity criterion**, so by Guarino & Welty (2002) they are not sortals worth minting.

Davis (DA) conceded the factual half outright ("anyone arguing 'conceptual richness' loses to `audit.json`'s own numbers") but attacked the **rhetorical slide** from "repeated micro-structure" to "poor modelling, therefore safe to drop addressability." His BBC `/programmes/` deployment is the counter-case: `po:Episode`/`po:Version`/`po:Broadcast` are *structurally repetitive* across every brand, "and a tidy-minded modeller would have said 'that's just transport structure, collapse it'… We did not, because a consumer dereferencing `/programmes/b006q2x0/episodes` needs *that brand's episodes addressable as episodes*, not reconstructable by parsing a path. **Repetition of structure is not evidence the structure is valueless.**" He signed the "wrong-altitude" framing and attacked only the "poor modelling ⇒ disposable" reading — a flag he carried into Q3/Q6 rather than opposition to the diagnosis.

**Vote Q1: 11–0–0** — form-ergonomics + repeated micro-structure at the wrong altitude for a TBox; explicitly **not** "poor modelling" (it is good *form* design). Davis's "wrong-altitude ≠ drop addressability" recorded as a narrow flag into Q3/Q6.

---

## Question 2 — The property-category taxonomy (A–G) as the decision-cut

**10–0–1: A–G is the right decision-cut, refined by salience-carve, the D Object/Mode split, an explicit residue register, and a generous G edge. Davis abstains on the boundaries-as-drawn pending a path-aware binning rule (held).**

The panel converged that A–G sorts leaves by *the one question that governs minting*. Gandon & Hendler: "A (disclosure tails), B (evidence), C (status enums), D (checklist items), E (result structures) — *no consumer links to the leaf*; they link to the **pattern**, the **scheme**, or the **class**. F is already minted upstream; reuse. G — consumers *do* link to these — earn a permanent `opda:` IRI each." The **UFO meta-category leaning per category** (Guizzardi & Guarino, corroborated by Kendall and Gandon/Hendler), which routes each category to its realizing record:

| Cat | UFO meta-category | Realizing record |
|---|---|---|
| **A** disclosure / free-text tails | **not a domain entity** — `rdfs:comment`-grade annotation; no identity criterion | reuse pattern (one annotation property) |
| **B** evidence / attachment envelope | **Object** (Document/Evidence), prov-bearing | **reuse ODR-0009** + PROV-O |
| **C** reused status enums | **Quale-in-Region** | **ODR-0011** SKOS schemes |
| **D** checklist items (fixtures) | the *item* is an **Object/Kind**; its *inclusion* is a **Mode/Relator of the sale transaction** (NOT a Quality of the Property) | SKOS item scheme + ~3 props (ODR-0011 + S007) |
| **E** repeated report/result structures | **Object** (information artefact, prov-bearing) + **Qualities** (`riskIndicator` = Quale-in-Region) | **promote to class** + peril scheme (ODR-0008 §Q2a(b) + ODR-0009) |
| **F** identity / address / contact / geo | Object, settled elsewhere | **reuse ODR-0015 / ODR-0006**; geo deferred |
| **G** genuine descriptive attributes | **Quality / Quale-in-Region / Substance-Kind label / Mode**, per leaf | the curated walk (ODR-0008 §Q5a) |

Three refinements were adopted. **(Kendall) Salience-carve:** the boundary between "generic structure" (A, E) and "genuine concept" (G) is *not* the segment name but **regulatory salience** — "a `details` tail under `sprayFoamInsulation`, `buildingSafety`, or `dangerousCladdingOrDefects` is *not* the same slot as 'are the curtains included'… the former is a named disclosure a lender's valuer relies on." Such leaves carve up to G even with a generic tail. **(Kendall + Guizzardi) D's Object/Mode split is load-bearing:** the fixture item is an Object (SKOS scheme); inclusion is a **Mode/Relator of the transaction**, not a datatype Quality of `opda:Property` ("the same boiler is 'included' in one sale and absent from the next"). **(Kendall) Explicit residue register:** A–F are not exhaustive by construction; a leaf that resists every pattern routes to ODR-0008 §Q1a's reconciliation register — "collapsed must mean *recorded as collapsed*, never *lost*." **(Gandon/Hendler) Generous G edge:** "under-minting a genuine concept is as much a web-architecture error as over-minting a cell — a URI is for a resource you genuinely want to refer to, and that cuts *both* ways." Where a leaf is plausibly dereference-worthy, err toward G.

Davis (DA) attacked the **boundaries**, not the frame: "'Category G is only 181' is an *assertion about a binning that has not been performed*." He verified two cracks himself: the evidence G-list names `tenureKind`, which **is not a literal name in the canonical dict** (so "181" is a *projection*, not a *count*); and — the concrete, dangerous one — **`propertyPack.priceInformation.price` (the headline asking/sale price, the single most lender-relevant number) shares the final segment `price` with 89 fixtures chattel prices**, so a last-segment rule "swallows the headline price into a chattel checklist," and (ADR-0028 §14) the mis-mint is permanent. His withdrawal condition: a **path-aware (not last-segment) binning rule** that demonstrably lands `priceInformation.price` in G and `boilerImmersionHeater.price` in D, plus a *counted* (not projected) G set.

**Vote Q2: 10–0–1** — A–G adopted with the four refinements; Davis **abstains** on the boundaries-as-drawn, **held** dissent: the binning rule (not the count) must be exhibited and must be path-aware before any IRI is minted.

---

## Question 3 — Whole or part? Import 1:1, or by category? (the core decision)

**11–0–0: import by category; the S021 mechanical 1:1 walk is rejected. Davis withdrew his "information is lost" claim; holds only against collapsing Category G.**

Kendall delivered the decisive reframing: the build pass already *proved* the 1:1 alternative unsound, so "the real choice is **not** '1:1 fidelity vs lossy collapse'" — it is **mechanical walk = collapse by *accident*, by string collision, with no recorded basis and ~900 permanent unreversible IRIs** versus **category import = collapse by *design*, by recorded treatment, with `dct:source` preserved and the conceptual ~181 curated precisely.** On FIBO's own criteria (*Ontology Engineering* Ch. 4: "identifiers are commitments") "the mechanical walk is the *strictly worse* collapse: it duplicates (351 colliding IRIs is the worst of both), it is not traceable, and it freezes the error into stable identifiers." Baker & Isaac concurred from DCMI reuse-before-mint and SKOS Reference §3: "900 form-slot IRIs are an ungovernable vocabulary… the 1:1 walk has no efficiency argument left — only a governance argument against it." Gandon & Hendler from web architecture: minting a permanent `w3id.org` IRI for a form cell "is minting a name for a non-thing… permanence makes mis-minting unreversible (*Cool URIs Don't Change*, Berners-Lee 1998)." Knublauch named it the TopBraid-EDG anti-pattern: "building the TBox *out of* the form's validation structure."

Davis (DA) moved substantially. He verified that the **instance path survives collapse** (`boilerImmersionHeater.price` and `priceInformation.price` remain distinct *as paths* even when the property is one IRI), and so **withdrew his S021 claim** that "a collapsed TBox cannot answer `boilerImmersionHeater.price`" as "too strong — it *can*, via path." He narrowed the attack from "information is lost" (withdrawn) to "addressability is demoted from term-grain to path-grain" (true, "a real publish-first regression, not a fatal one"), and held that demotion **must be bounded to categories where the leaf genuinely is not a concept** — Category G keeps term-grain addressing. "The fight is not 'whole vs part'; it is **where the part-line falls**, which is Q2's binning rule again."

**Vote Q3: 11–0–0** — import by category (collapse A–F to patterns/schemes/classes/upstream-reuse; per-leaf only for G); the 1:1 mechanical walk rejected. Davis **FOR**, with held dissent against collapsing G or losing the instance path on published data (path-grain is the floor; term-grain is for G).

---

## Question 4 — The recurring micro-patterns (A disclosure tail, B evidence envelope, E search/risk result)

**11–0–0: model each as a reusable pattern/class, not per-leaf properties. B reuses ODR-0009 (mint nothing); E promotes to a class + peril SKOS scheme. Davis withdrew B; holds E's `riskIndicator` addressability.**

- **A (disclosure tail, ~407 leaves) → one reusable annotation property** `opda:disclosureDetail`, `rdfs:comment`-grade, the specific question carried by `dct:source` + the shape's target. "269 `opda:…Details` IRIs would be 269 names for one relation — the synonym proliferation *SWWO* teaches you to reconcile away" (Gandon/Hendler); "do not over-formalise a prose slot into a typed quality" (Hendler).
- **B (evidence/attachment envelope) → reuse ODR-0009 Evidence + PROV-O; mint nothing.** Kendall: "the cleanest reuse in the session… re-minting an `attachments` datatype property per disclosure would *fracture* the provenance graph ODR-0009 deliberately unified — a regression." Davis: "**WITHDRAW** — ODR-0009 settles it."
- **E (search/risk result, ~200 leaves) → one `opda:SearchResult`/`opda:RiskAssessment` class (~6 props) + a peril/dataset SKOS scheme, hung off ODR-0009 provenance.** This fires ODR-0008 §Q2a(b)'s named spawn trigger (authority-retrieved artefacts) and satisfies the §Q4a class-promotion test on two criteria (authority-retrieved provenance + distinct lifecycle). Gandon/Hendler note it is also *more* powerful: "a consumer can ask 'give me every dataset whose `actionAlertRating` is High' across all perils uniformly — impossible if each peril is its own flat predicate set."

Davis (DA) pressed E hardest: a lender's AVM "dereferences 'the flood `riskIndicator` for *this* property' — and under a single `SearchResult` class, that `riskIndicator` is addressable **only if** the peril/dataset is a first-class, dereferenceable discriminator, not a buried instance literal." Kendall agreed and hardened it into a requirement: "flatten the *shape* (6 fields → 6 props); **do not** collapse the *peril axis* (24 datasets → opaque string) — that is the granularity a lender's offer condition names." Davis's E withdrawal condition: a worked SPARQL query retrieving "flood `riskIndicator` for property X" against the class + peril scheme.

**Vote Q4: 11–0–0** — reusable pattern (A) / reuse (B) / promote-to-class + peril scheme (E). Davis: B **withdrawn**; A narrow-hold (parent-question discriminator preserved); **E held** pending the worked peril query.

---

## Question 5 — The checklist (D, fixtures & fittings) and the enums (C)

**11–0–0: D → a `FixtureItemScheme` (SKOS, ~89 items) + ~3 shared props; C → 54 ODR-0011 SKOS schemes with a shared reused property per value-space. A `FixtureItem` *class* is over-engineering. Davis withdrew C; holds D's headline-price exclusion.**

- **C (54 enum value-sets, 378 leaves)** is **executing ratified law**, not a new proposal: ODR-0011 §Decision already mandates each enum → a `skos:ConceptScheme` with shared reused properties. Cagle: "`opda:yesNo` + a 2-concept scheme covers all 1,135 yesNo refs — not 378 properties." Baker & Isaac (SKOS Reference §3): "minting 378 properties for value-spaces is a category error twice over — it mistakes value-spaces for properties *and* fractures one reused value-space into synonymous slots." Davis: "**WITHDRAWN** — attacking C would be attacking ODR-0011, which is closed."
- **D (fixtures, ~315 leaves / 89 items)** → a **SKOS scheme of fixture items** + **~3 properties on a transaction-scoped fixtures list**: `opda:inclusionStatus` (Quale over the C `Included/Excluded/None` scheme), `opda:comment` (A-grade), `opda:price` (**reuse a `MonetaryAmount` pattern — do not mint 89 `price` properties**). Kendall ruled out a `FixtureItem` *class* as over-engineering: "the items are an enumerable controlled list with no per-item lifecycle or provenance, so SKOS reference data is the right weight (Kendall & McGuinness Ch. 5 — SKOS for controlled value/reference sets, OWL classes for things with identity criteria and behaviour); promote to a class only on a named consumer query, ODR-0008 §Q4a, not now." Cagle's mechanism: "item-identity moves from PREDICATE to VALUE (`opda:fixtureItem` → the concept) + 3 shared props; 89×3=267 datatype-props → 3."

Davis (DA) held D narrowly on two conditions, both Q2's mis-bin guard in checklist costume: **(a)** `priceInformation.price` excluded from D (it is the headline price, G); **(b)** fixture items are dereferenceable concepts so per-item inclusion/price is recoverable. Kendall added that regulator-governed value-spaces (EPC band A–G, council-tax band A–I) must carry `dct:source` to the **governing authority**, not just the schema leaf.

**Vote Q5: 11–0–0** — D → SKOS item scheme + ~3 props (price reuses MonetaryAmount), transaction-scoped; C → ODR-0011 schemes, shared properties; regulator-governed schemes carry authority `dct:source`. Davis: C **withdrawn**; **D held** on the two conditions.

---

## Question 6 — Coverage, round-trip & residual scope (the DA's crux)

**11–0–0 FOR, conditional on two ratification gates: category import satisfies BASPI5 round-trip + consumer queries WITHOUT 1:1 leaves — but coverage must be *enforced and tested*, not asserted. Kendall surfaced a verified traceability defect that makes the gate load-bearing.**

The architectural answer was unanimous and grounded in ODR-0008's *own* ratified mechanisms. Knublauch: "round-trip fidelity is a property of the **profile**, not of TBox cardinality — ODR-0008 §Q7a already places per-form structure in the SHACL profile layer; the base TBox carries *zero* descriptive `sh:minCount` (CI-test-1). The 31 forms regenerate from {category pattern instances} + {profile shape} + {`dct:source`}." Allemang: "coverage ≠ one-property-per-leaf." Gandon/Hendler: "the thing the consumer refers to is the fixture-item, the peril, the enum value, the Property-fact — not the path-cell; `boilerImmersionHeater.price` is answered by *(the concept, the shared `price` property)*, a *(subject, predicate)* pair preserving full addressability with one `price` predicate, not 99." The load-bearing caveat all accepted: **the scheme/class inventory must be complete** — every fixture chattel, every peril, every enum value must be a minted `skos:Concept`, "or the round-trip *does* lose a cell."

**Kendall's verified finding (the most important the session surfaced):** the evidence pack frames `dct:source` instance-addressing as already solving recoverability — *but it does not, in the current artefacts.* The curated properties point `dct:source` at **`https://w3id.org/opda/odr/ODR-0008#section-Q5a`** — i.e. at **the decision record, not the schema leaf path** (confirmed by the Queen against `opda-classes.ttl`: `ODR-0004#section-8a`, `ODR-0006#section-Q3`, `ODR-0010#section-Q1`). "Under category collapse this is a **fatal** gap: if `opda:disclosureDetail` instances all point to ODR-0008-Q5a, you cannot recover *which question* a given detail elaborated, in either direction." Her gate makes schema-leaf-path `dct:source` (ODR-0008 §Q3a's per-overlay array — "lossless audit in both directions," promised but not yet delivered in emission) a **ratification condition**.

Davis (DA) accepted the architecture as **sound but untested**: "the BASPI5 profile today regenerates BASPI5 from *named per-leaf terms*; nobody has regenerated a form from a *collapsed* term set. **Test, don't assert.**" He invoked the panel's own discipline: "at S021 you insisted the builder refactor emit `baspi5.ttl` byte-for-byte identical — apply your own byte-identity gate to the descriptive layer." His S021 dissent is **withdrawn in full** the moment **(1)** a BASPI5 round-trip passes on the *collapsed* TBox, and **(2)** a worked query retrieves a collapsed leaf by path + a Category-G leaf by dereferenceable term.

**Vote Q6: 11–0–0 FOR** — coverage preserved via SHACL profiles (§Q7a) + path/`dct:source`, not 1:1 leaves; Category G (~181 + the salience allow-list) is the right bounded residual. **Conditional on two gates** (Kendall: schema-leaf-path traceability enforced; Davis: coverage proven by test). Without enforcement Kendall would move to ABSTAIN; both conditions are adopted as ratification gates.

---

## Synthesis (Queen — Allemang)

The Council is **near-unanimous (Q1, Q3, Q4, Q5, Q6 all 11–0–0; Q2 10–0–1)**: **import the descriptive layer by category, not leaf-by-leaf.** The S021 "mechanical 935-leaf walk" is set aside — not because completeness does not matter, but because, as the build pass proved and Kendall crystallised, the 1:1 walk is the *strictly worse* collapse: it collides 1,521 leaves into ~351 accidental, provenance-less, permanent IRIs, where category import collapses by *design* with provenance preserved and the genuine ~181 curated precisely. Every voice that could have defended fidelity (Davis, Kendall) instead converted fidelity into *enforceable gates on the collapse*, which is the strongest possible ratification.

**The verdict, in one paragraph.** Of ~1,493 annotated base leaves, ~88% are structure: free-text tails (A), evidence envelopes (B), reused status-enums (C), a chattel checklist (D), repeated search-result micro-structure (E), and address/contact/geo already modelled upstream (F). These do **not** earn permanent `opda:` IRIs at the leaf grain; they collapse to **one annotation property (A), reuse of ODR-0009 (B), ~54 ODR-0011 SKOS schemes (C), one `FixtureItemScheme` + ~3 props (D), one `SearchResult`/`RiskAssessment` class + a peril scheme (E), and upstream reuse (F)** — on the order of **~5 patterns + ~56 schemes + ~2 classes**, replacing ~750 flat properties. Only **Category G — the ~181 genuine descriptive concepts — is curated per-leaf**, plus a small named **regulatory-salience allow-list** carved out of A/E. This turns "evaluate 935 leaves" into "ratify ~5 treatments + curate ~181 + a salience allow-list" — an ~80% reduction in the expensive WG operation, with *more* query power and ~5× fewer permanent IRIs.

**Three ratification gates** (the DA's S021 dissent and Kendall's fidelity discipline, made enforceable — the collapse is ratified *behind* them):

1. **Path-aware binning (G1).** The leaf→category rule MUST be **path-aware, not last-segment** — it must demonstrably place `propertyPack.priceInformation.price` in **G** and `…fixturesAndFittings.*.price` in **D**. The ~181 G-set is a *projection* until the rule is run; it becomes a *counted* set before any IRI is minted (Davis verified one phantom exemplar, `tenureKind`, and one concrete mis-bin, `priceInformation.price`).
2. **Schema-leaf-path traceability (G2).** Every collapsed-category instance and every G property MUST carry `dct:source` to its **schema leaf path** (the form-question IRI, ODR-0008 §Q3a per-overlay array) — **not** to the deciding ODR. The current emission violates this (verified); fixing it is the precondition that makes "collapsed = recorded, never lost" true in both directions.
3. **Coverage-by-test (G3).** "Coverage preserved" is ratified only when **(a)** a BASPI5 round-trip passes on the *collapsed* TBox (the S021 byte-identity discipline pointed at the descriptive layer), and **(b)** a worked SPARQL query retrieves a collapsed leaf by path + a G leaf by dereferenceable term (and, for E, "flood `riskIndicator` for property X" by peril scheme). On G3 passing, Davis withdraws his completeness dissent in full.

**Two further adopted refinements:** the **regulatory-salience carve-out** (a generic-tailed leaf whose parent question is regulator-named — BSA/EWS1/cladding/spray-foam/named CON29 perils — is curated as G regardless of segment name) and the **explicit residue register** (a leaf resisting every pattern routes to ODR-0008 §Q1a, never silently dropped). The **D Object/Mode split** is normative: the fixture *item* is an Object (SKOS scheme); its *inclusion* is a Mode/Relator of the **sale transaction** (S007), not a Quality of `opda:Property`; `price` reuses a `MonetaryAmount` pattern.

**Citation grounding verified.** All voting positions cite named sources meeting ODR-0001 §Citation grounding — *Semantic Web for the Working Ontologist* 3rd ed. (Allemang/Hendler/Gandon); *Ontology Engineering* (Kendall & McGuinness 2019) + the EDM Council FIBO process; Guizzardi 2005 + Guarino & Welty 2002 (OntoClean); SKOS Reference (W3C 2009) + the Singapore Framework (Nilsson/Baker/Johnston 2008); the W3C SHACL Recommendation + TopBraid EDG; the Linked Data principles + *Cool URIs* (Berners-Lee) + Hendler 2003; the BBC `/programmes/` ontology (Davis 2009). Two empirical claims were independently verified by the Queen against the corpus and both held (the `priceInformation.price` mis-bin; the `dct:source`-points-at-ODR traceability gap).

**Downstream record impact:**

- **Produce [ODR-0022 — Descriptive-Layer Import Strategy & Property Categorisation](../ODR-0022-descriptive-layer-import-strategy.md)** (`kind: architecture`; status `proposed` pending WG). It records the A–G taxonomy + per-category treatment + realizing-record routing + the three gates + the salience carve-out + the residue register. Per the Queen's pre-flight scope check, `kind: architecture` is correct: the load-bearing content is *catalogue granularity, work-routing, and acceptance gates* (artefact-engineering, A9 (a)/(b) relaxed); the per-category ontological commitments are discharged in the realizing `pattern` records (G → ODR-0008 §Q5a; C/D-scheme → ODR-0011; B → ODR-0009; **E → fires ODR-0008 §Q2a(b)'s "Authority-Retrieved Artefacts" spawn → a new `pattern` record for `SearchResult`/`RiskAssessment`**).
- **ADR-0028 (descriptive walk) is re-scoped, not executed as written:** its target is **Category G (~181) + the salience allow-list**, emitted under the path-aware binning rule (G1) with schema-leaf-path `dct:source` (G2), gated by G3 — *not* a 935-leaf flat emission. An ADR-0028 amendment (or successor) records this; the walk stays deferred to the curated WG pass, now with a bounded, gated scope.
- **ADR-0029 (overlay-profile emitter):** the per-form profiles must actually **enumerate each form's leaves** in their `sh:path`/`sh:minCount`/`dct:source` shapes (today they are emitted *thin*) — this is what carries round-trip under G3. The C/D SKOS schemes and the E class become emitter targets alongside the G walk.
- **ODR-0008** gains an implementation-note pointer: the §Rules "generated, then deliberated" leaf→property mapping is realized as **category-routed import** per ODR-0022; §Q1a residue register and §Q2a(b) spawn are now load-bearing; §Q3a's schema-leaf-path `dct:source` is a ratification gate (G2), and the current ODR-pointing emission is a known defect to fix.
- **ODR-0011** is the realizing record for C (54 schemes) and the D `FixtureItemScheme`; each scheme names a steward (ODR-0011 pattern); regulator-governed schemes carry authority `dct:source`.

Status `proposed`; adoption flows through the OPDA WG → Modelling Sub-Committee (adoption.md §3). `council: session-023` set on ODR-0022.

---

## Tally appendix (two-artefact discipline)

### Per-voice vote table (11 voices)

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 |
|---|---|---|---|---|---|---|
| Allemang (Queen) | FOR | FOR | FOR | FOR | FOR | FOR |
| Guizzardi | FOR | FOR | FOR | FOR | FOR | FOR |
| Guarino | FOR | FOR | FOR | FOR | FOR | FOR |
| Kendall | FOR | FOR | FOR | FOR | FOR | FOR¹ |
| Cagle | FOR | FOR | FOR | FOR | FOR | FOR |
| Baker | FOR | FOR | FOR | FOR | FOR | FOR |
| Isaac | FOR | FOR | FOR | FOR | FOR | FOR |
| Knublauch | FOR | FOR | FOR | FOR | FOR | FOR |
| Gandon | FOR | FOR | FOR | FOR | FOR | FOR |
| Hendler | FOR | FOR | FOR | FOR | FOR | FOR |
| Davis (DA) | FOR² | ABSTAIN³ | FOR⁴ | FOR⁵ | FOR⁶ | FOR⁷ |
| **Tally (N-M-K)** | **11-0-0** | **10-0-1** | **11-0-0** | **11-0-0** | **11-0-0** | **11-0-0** |

¹ Kendall Q6 FOR **conditional** on the traceability gate (G2) enforced; absent it she moves to ABSTAIN.
² Davis Q1 FOR the "wrong-altitude" framing; AGAINST the "poor modelling ⇒ drop addressability" reading (narrow flag into Q3/Q6).
³ Davis Q2 ABSTAIN on the triage frame; held dissent on the **boundaries** until a path-aware binning rule is exhibited.
⁴ Davis Q3 FOR collapse of A/B/C/D/E/F; held against collapsing **G** / losing the instance path.
⁵ Davis Q4: B withdrawn; A narrow-hold; **E held** (peril addressability).
⁶ Davis Q5: C withdrawn (ratified ODR-0011); **D held** (headline-price exclusion + dereferenceable items).
⁷ Davis Q6 FOR coverage-via-mechanism; held **test-not-assertion** (mildest form) pending G3.

### DA scorecard (Davis) — per-question withdrawal/hold + condition

| Q | Disposition | Named withdrawal condition |
|---|---|---|
| Q1 | **CONCEDED** (richness) + narrow **HOLD** | folds into Q3/Q6; a flag, not opposition to the diagnosis |
| Q2 | **HELD** | a **path-aware** (not last-segment) binning rule + a *counted* G set; `priceInformation.price`→G by rule → **G1** |
| Q3 | **WITHDREW** "info lost" (path survives); **HELD** vs collapsing G | round-trip on collapsed TBox + path query → G stays term-grain |
| Q4 | B **WITHDRAWN** (ODR-0009); A narrow-hold; **E HELD** | E: worked query "flood `riskIndicator` for property X" against `SearchResult` + peril scheme |
| Q5 | C **WITHDRAWN** (ODR-0011); **D HELD** | headline price excluded from D + "boiler: included, £X" query passes |
| Q6 | **HELD** (test-not-assertion, mildest) | **G3**: BASPI5 round-trip passes on collapsed TBox + worked per-leaf query → **drops S021 completeness dissent in full** |

**Held-as-live dissent (recorded, satisfiable):** Davis's S021 *completeness-as-a-gate* dissent is **not overruled** — it is converted into the three ratification gates G1 (path-aware binning), G2 (schema-leaf-path traceability), G3 (coverage-by-test). All three are satisfiable engineering acceptance criteria, not principled permanent dissent; on G1+G2+G3 passing, Davis withdraws in full. **Re-open trigger:** any of the gates failing at emission time, or a named consumer query answerable over flat per-leaf properties but not over the category model (Baker & Isaac predict it never fires).

### Per-question count

- Q1 11-0-0 · Q2 10-0-1 · Q3 11-0-0 · Q4 11-0-0 · Q5 11-0-0 · Q6 11-0-0.
- No question fell below 10 FOR. The single abstention (Davis Q2) is a held dissent on the *binning rule*, adopted as gate G1.
