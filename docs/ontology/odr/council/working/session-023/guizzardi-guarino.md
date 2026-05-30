# Session 023 — Joint Position: Giancarlo Guizzardi & Nicola Guarino

**Foundational-ontology pair.** One joint voice; where we differ, marked `[Guizzardi]` / `[Guarino]`. Sources cited by name per ODR-0001 §Citation grounding.

**Standing sources we apply throughout:**

- **Guizzardi 2005**, *Ontological Foundations for Conceptual Modeling with Applications*, Ch. 4 — the UFO taxonomy: Substance Kind / Subkind / Role / Phase / Relator / Mode / Quality (with Quality Universals inhering in their bearers) / Quality Region & Quale / Object. **"Qualities inhere in their bearers"** is the load-bearing axiom for this session.
- **Guarino & Welty 2002/2009**, *OntoClean* — the meta-property discipline: **R**igidity, **I**dentity criterion (IC), **U**nity. The IC test is the instrument that separates a real Quality from a form slot.
- **Masolo et al. 2003**, *WonderWeb Deliverable D18 (DOLCE)* §4.3 — Quality / Quality Region / Quale; the metric-banded value space.
- **Guizzardi & Wagner 2010** — action/method modelling, for the disclosure-procedure read.

**Prior OPDA rulings that already apply us (we extend, we do not re-open):**

- **ODR-0011 §8a** — the seven-category UFO framework. It already binds `builtForm`, `currentEnergyRating`, `councilTaxBand`, `ownershipType` as **Quale-in-Region**; `tenureKind` as **Substance Kind label**; `addressVariant` as **Quality Value**. It carries a **named eighth-category trigger** (Author-only amendment with dual `dct:source`).
- **ODR-0008 §Q5a** — the per-leaf datatype-vs-SKOS binding table: the Quale-in-Region row, the `tenureKind` Substance-Kind-label row, the `priceQualifier`/`marketingTenure` **Mode / Quality Value** row.
- **ODR-0009** — the evidence/attachment envelope is already `prov:Entity` subclasses (Objects): `opda:DocumentEvidence` etc. The §80% PROV-O backbone.
- **ODR-0008 §Q2a** — the spawn-rule: split ODR-0008 by **UFO axis** (Allemang `property-qualities`; Guizzardi/Pandit `property-modes`; Kendall `legal-estate-attributes`) when the distinctions become operationally load-bearing.

All structural figures below are from **S023-EVIDENCE** and reproduced against `data-dictionary-canonical.json` (8,458 entries). Where we recomputed, we say so.

---

## Q1 — Diagnosis: conceptual richness, or form-ergonomics + repeated micro-structure?

It is **form-ergonomics and repeated micro-structure**, with a small genuinely-conceptual residue. This is not a value judgement on PDTF; it is a **levels-of-abstraction** observation, and confusing the two levels is precisely the error OntoClean was built to catch.

PDTF is a **form-transport schema**: a faithful serialisation of ~31 transaction forms. At *that* altitude its granularity is correct — a form needs a distinct slot for "please give details" under each question, a distinct `price` cell per fixture row. But a **TBox is an account of what exists in the domain and how it is identified** (Guizzardi 2005 Ch. 3–4). The two altitudes have **different identity criteria**, and that is the whole of the diagnosis:

- **The 272 `details` slots are one thing repeated 272 times, not 272 things.** A free-text "elaborate in prose" tail has **no identity criterion of its own** (Guarino & Welty 2002 — an item without an IC is not a sortal, not a Type worth minting). Its identity is entirely parasitic on the *question* it hangs off. `isListed.details` and `sprayFoamInsulation.details` are the *same* slot-kind, individuated only by parent. Minting 272 TBox properties asserts 272 identity criteria that do not exist in the domain.
- **The 86 fixture items × 3 fields (`{isIncludedExcludedOrNone, comments, price}` — reproduced: `boilerImmersionHeater` is one of 86 chattel parents, each with exactly that triple) are a controlled list × a fixed micro-structure**, not 258 distinct property-facts.
- The genuine residue — `builtForm`, `yearOfBuild`, `currentEnergyRating`, `councilTaxBand`, `tenureKind`, `centralHeatingFuelType` — **does** carry domain identity criteria: each is a Quality (or Quality-value / Substance-Kind label) that **inheres in the Property or the LegalEstate** and is individuated by it (Guizzardi 2005 Ch. 4). ODR-0008 §Q5a already minted exactly these.

So: **not "PDTF is poor modelling."** PDTF is *right for a form and wrong-altitude for a TBox.* The 1:1 walk imports form structure as though form-slot recurrence were domain-concept recurrence — a **type/role and a level-of-abstraction confusion** simultaneously. The leaf "explosion" is the schema's *transport ergonomics* showing through; ~88% of it dissolves the moment you ask the OntoClean question "what is the identity criterion of this thing?"

`[Guarino]` Sharpen it as a sortal test. A TBox property worth minting must denote either (a) a **Quality Universal** whose instances are individuated by their bearer, or (b) a relational/Mode universal with its own IC. `details`/`comments`/`summary`/`price`-as-a-cell satisfy **neither**: they are *attributes of form-interaction*, not of the Property. Reifying them is a textbook **"is-a-role-vs-is-a-type" + non-sortal** error.

`[Guizzardi]` And note the **anti-rigidity tell**: whether `boilerImmersionHeater` is "included in the sale" is **contingent and externally-grounded** (it depends on a *Relator* — the sale agreement — not on the boiler). A genuine Quality of the Property (its `builtForm`) is **rigid**: the Property cannot cease to have a built form and remain that Property. The fixtures-checklist flunks the rigidity test for "Quality of the Property." That single observation is Q5's answer in advance.

**Vote: FOR** — the diagnosis is form-ergonomics + repeated micro-structure; only Category G is conceptual richness.

---

## Q2 — The category taxonomy & per-category UFO meta-category

Categories A–G are the **right decision-cut**, because the cut is *exactly the OntoClean axis*: it partitions leaves by **what kind of thing (if any) they denote and how it is identified**, which is what determines the realising record. We assign a UFO meta-category per category — this is the "route to the right realising record" the brief asks for, and it is consistent with ODR-0011 §8a and ODR-0008 §Q5a:

| Cat | What it denotes | **UFO meta-category** | Realising record |
|---|---|---|---|
| **A** Disclosure / free-text tails (`details`,`comments`,`summary`) | a textual qualifier with **no domain identity** | **Not a domain entity** — `rdfs:comment`-grade annotation. At most a *qua-text Quality of the disclosure speech-act*, never of the Property. | **one** reusable annotation property (`opda:disclosureDetail`) |
| **B** Evidence / attachment envelope | a document / information artefact | **Object** (endurant artefact; `prov:Entity`) | **reuse ODR-0009** `opda:DocumentEvidence` + PROV-O |
| **C** Reused status enums | a value in a banded value-space | **Quale-in-Region** | **ODR-0011 §8a** SKOS scheme; shared property per value-space |
| **D** Checklist items (fixtures/chattels) | a *member of a controlled list of Objects* | **Object / individual** (the chattel); its inclusion-in-sale is a **Relator** | **SKOS scheme of fixture items** + ~3 props (`inclusionStatus`/`comment`/`price`); reference data |
| **E** Repeated report/result structures | an information artefact bearing measured qualities | **Object (information artefact, prov-bearing) + Qualities** (`riskIndicator` as Quale-in-Region) | **a `SearchResult`/`RiskAssessment` class** (~6 props) + peril/dataset scheme |
| **F** Identity / address / geo sub-fields | already-modelled endurants/qualities | settled — **Object/Quality, upstream** | **reuse ODR-0015 / ODR-0006** |
| **G** Genuine descriptive attributes | a fact that **inheres in** the Property / LegalEstate | **Quality / Quale-in-Region / Substance-Kind label / Mode** (per leaf) | **curated per-leaf walk** (the one expensive pass) |

Two boundary refinements we insist on:

1. **A is *below* the TBox, not a thin Quality.** The evidence flirts with "Quality/qua-text." We reject the flirtation: a free-text disclosure tail has **no Quality Universal** (there is no quality *space* it ranges over — Masolo et al. 2003 D18 §4.3 requires a quale to sit in a region; prose does not). `opda:disclosureDetail` is an **annotation property**, the boundary OntoClean draws between "what the model is about" and "commentary on the model."
2. **D's UFO category is the decisive split and it is *Object*, not *Quality*** — see Q5. The chattel is an Object; "included in the sale" is a **Relator** (a sale agreement) connecting that Object to the transaction. Modelling it as a Quality *of the Property* is the category error.

`[Guizzardi]` E deserves one nuance: the `SearchResult`/`RiskAssessment` is an **Object that is an information artefact** (a *descriptive* particular about the world, in DOLCE's information-object sense), and the `riskIndicator`/`actionAlertRating` it carries **are** Qualities — but Qualities *of the assessment*, with a Quale in a banded region (so they route to ODR-0011 §8a Quale-in-Region for the bands). One class + a peril scheme captures *both* the artefact identity and the measured qualities; 200 datatype properties capture **neither**.

**Vote: FOR** — A–G is the correct decision-cut; UFO meta-category per category as tabled (A = sub-TBox annotation, B/D/E = Object±Relator/Quality, C = Quale-in-Region, G = per-leaf Quality family).

---

## Q3 — Whole or part? (the core decision)

**Import by category. AGAINST the 1:1 mechanical 935-leaf walk.**

The 1:1 walk **manufactures identity criteria that do not exist in the domain.** Of ~1,493 annotated leaves, ~88% denote no domain entity with its own IC (A: ~407 textual qualifiers; C: 54 value-spaces wearing 378 masks; D: 86 Objects × 3; B/F: already-modelled). Minting ~900 `owl:DatatypeProperty`s asserts ~900 distinct attribute-universals — a TBox-level claim that the domain has ~900 independently-identified property-facts. **It does not.** It has ~181 (Category G) plus a handful of reusable structures. Importing the rest 1:1 is not "completeness"; it is **populating the TBox with the schema's transport scaffolding** and calling scaffolding ontology.

The build-pass evidence (S023-EVIDENCE §D; ADR-0028 deferral note) is the empirical confirmation of the OntoClean prediction: naive last-segment naming **collapses 1,521 distinct leaves into ~351 colliding IRIs** *because the leaves were never 351 distinct concepts in the first place* — the collisions are the form-slot recurrence reasserting itself. You cannot mechanically name what has no distinct identity. The build pass discovered, the hard way, what the IC test states a priori.

And the cost asymmetry is decisive *for the expensive operation specifically*: per-leaf WG evaluation is the scarce resource. Spending it on 935 leaves of which ~754 have no IC is **39× the same loop on scaffolding** (to invert Allemang's S021 phrase): the loop that *matters* — "what Quality is this, what does it inhere in, what is its quale-region" — only has content for the ~181 G-leaves. Category import **reserves the expensive pass for the leaves that can actually consume it.**

**Vote: FOR the proposition (category-based import); AGAINST the 1:1 walk.**

---

## Q4 — Recurring micro-patterns (A, B, E)

Each is a **pattern, not a per-leaf property family** — because each denotes a single repeated structure, and a structure has *one* identity, instantiated many times.

- **A — disclosure tail → one annotation property.** The 272 `details` / 96 `comments` / `summary` slots are one `opda:disclosureDetail` (and the parenthetical `attachments` route to B). The *question* they elaborate is the entity (often itself a Category-G fact or a yes/no Quale); the prose tail is annotation **on the claim about that entity**. `[Guizzardi]` Read through Guizzardi & Wagner 2010, a disclosure is a *speech-act / assertion event*; its free text is a property of the **assertion**, captured at ODR-0009's claim layer, not a Quality of the Property. **Zero new Property datatype properties.**
- **B — evidence/attachment envelope → reuse ODR-0009.** This is **already decided**. `attachments` (94 occurrences, base) is a pointer to a document/information **Object** = `prov:Entity` subclass (`opda:DocumentEvidence` and siblings), with PROV-O carrying derivation. Minting per-question attachment properties would **fork the provenance backbone ODR-0009 ratified** — a direct regression. ~3 reused properties (or none beyond ODR-0009).
- **E — search/risk result → a `RiskAssessment`/`SearchResult` class.** The six fields (`riskIndicator, actionAlertRating, result, summary, recommendations, datasetAttribution` — reproduced: 25 each, repeated per dataset, recursively under `riskSubcategories[]`) are the **facets of one information-artefact universal**, instantiated ~24 times (once per peril/dataset). That is the **textbook case for a class with an identity criterion** (the assessment, identified by `(peril, subject-property, run)`) + a SKOS **peril/dataset scheme** for the ~24 datasets + the Quale-in-Region bands for `riskIndicator`/`actionAlertRating`. ~6 properties on **one** class, reused across all datasets, with `datasetAttribution` → `prov:wasGeneratedBy` (ODR-0009; ODR-0008 §Q2a(b) is the named spawn-trigger if provenance load grows — *this is its case*). **~200 datatype properties → one class + one scheme.**

**Vote: FOR** — A = one annotation property; B = reuse ODR-0009; E = one prov-bearing class + peril scheme. Each grounded in an existing ratified pattern, not invented here.

---

## Q5 — Checklist + enums (D, C) — the decisive OntoClean call

**This is the call that determines whether D is reference-data-Objects or 315 datatype properties. It is the former.**

**D — fixtures & fittings.** Apply the IC test to `boilerImmersionHeater` (reproduced: one of **86** chattel parents, each `{isIncludedExcludedOrNone, comments, price}`):

> *Is `boilerImmersionHeater` a **Quality of the Property**?* A Quality **inheres in** its bearer and is individuated by it (Guizzardi 2005 Ch. 4). Does "boiler immersion heater" inhere in the Property? **No.** A boiler is a **distinct endurant Object** — a chattel — that may be *physically located at* or *sold with* the Property, but is **not a quality the Property bears.** It has its own identity criterion (it is a manufactured artefact; it can be removed, replaced, sold separately, carried to another house). It survives the Property and the Property survives it. **It fails the inherence test.** Therefore it is **not** a datatype property of `opda:Property`.

So what *is* the structure?

- The **86 item names** (`boilerImmersionHeater`, `carpets`, `burglarAlarm`, …) are **individuals in a controlled list** of chattel kinds → a **SKOS `ConceptScheme` of fixture items** (reference data; cf. ODR-0011 §8a's reference-data treatment).
- **`isIncludedExcludedOrNone`** is the load-bearing fact, and it is a **Relator**, not a Quality: it asserts a relationship — *this chattel is included in / excluded from this sale* — grounded in the **sale agreement** (a Relator connecting Chattel × Transaction × Parties; Guizzardi 2005 Ch. 4 on Relators and the *mediation* of relational properties). Its value space (`Excluded/Included/None`) is a **Quale-in-Region** → ODR-0011 §8a, shared across all 86 items.
- **`comments`** → Category A (`opda:disclosureDetail`). **`price`** → one `opda:fixturePrice` Quality of the *inclusion Relator* (it is the consideration for *that chattel in this sale*), not 99 separate properties.

Result: **~315 leaves → one SKOS item-scheme + ~3 shared properties (`inclusionStatus`, `comment`, `price`) hung off a `FixtureInclusion` Relator.** Minting 315 datatype properties would assert that the Property has 315 qualities named after household objects — the **paradigm category error OntoClean exists to prevent** (treating Objects as Qualities of another Object). `[Guarino]` This is structurally identical to the classic "modelling the *passengers* as attributes of the *flight*" anti-pattern: the passenger (chattel) is a participant, the participation (inclusion) is the Relator, and the Relator — not the Property — bears the relational qualities.

`[Guizzardi]` One concession to Davis in advance: a *consumer asking "is the boiler included?"* is fully served — it is a SPARQL hop `?sale opda:includesFixture [ skos:exactMatch :boilerImmersionHeater ; opda:inclusionStatus :Included ; opda:fixturePrice ?p ]`. **More** addressable than 315 opaque datatype properties, because the chattel is now a first-class referent you can ask *about* (its kind, its scheme, cross-item queries), not a flat string buried in a property name.

**C — the 54 enum value-sets.** Straightforward and already ruled: 378 enum-bearing leaves carry only **54 distinct value-spaces** → **ODR-0011 §8a SKOS schemes**, one **shared, reused** property per value-space (the `(No,Yes)`×77, `(Excluded,Included,None)`×89 collapses). Each value-space is a **Quale-in-Region** (Masolo et al. 2003 D18 §4.3): the scheme *is* the banded region; each member is a quale. Minting a fresh enum property per leaf would mint 378 copies of 54 regions — 324 redundant assertions of identical value-spaces.

**Vote: FOR** — D = SKOS item-scheme + ~3 props on a `FixtureInclusion` Relator (the chattels are Objects, NOT Qualities of the Property); C = 54 ODR-0011 §8a Quale-in-Region schemes with shared reused properties.

---

## Q6 — Coverage, round-trip & residual scope (Davis's crux)

**Category-based import satisfies BASPI5 round-trip and consumer queries without 1:1 leaves. Vote FOR — with one named safeguard.**

Davis is right to make completeness a gate; he is wrong to think 1:1 datatype properties are what satisfies it. **Round-trip fidelity is an instance-layer + profile-layer property, not a TBox-cardinality property** — and the corpus already provides both carriers:

1. **Per-form structure lives in the SHACL profile, not the TBox.** ODR-0008 §Q7a *already* pushes per-form required/enum variation onto SHACL profiles (ODR-0010). A profile shape enumerates exactly which terms a given form needs, in what shape — that is what regenerates the 31 forms. The TBox supplies the *vocabulary*; the profile supplies the *form*. Collapsing redundant TBox properties **does not touch** the profile layer that does the round-tripping.
2. **Instance addressing is carried by `dct:source` + the JSON path**, not by IRI proliferation. ODR-0009's claims are *already* keyed by JSON-pointer back into the transaction (ODR-0009 §Provenance). `boilerImmersionHeater.price` is addressable as a path/`dct:source`, and now *additionally* as a typed `(fixture-item, inclusion-relator, price)` triple. **Nothing is lost; addressability increases.**
3. **The Category-G ~181 are the genuine round-trip-critical descriptives**, and they are imported per-leaf, in full. The collapsed categories are the *non*-descriptive scaffolding whose round-trip is handled by the profile + path, exactly because they were never domain concepts.

**The one safeguard we name (concession to DA):** make completeness a **verifiable gate, not an assumption**. Adopt a **round-trip CI assertion** — *every BASPI5 (and, as profiles land, every form) leaf must be regenerable from {TBox term ∪ SKOS scheme member ∪ profile shape ∪ `dct:source` path}* — the generalisation of ADR-0028's "every term carries `rdfs:isDefinedBy`" totality CI, lifted from term-presence to **leaf-coverage**. If a leaf cannot be regenerated from the four carriers, that is a real gap — and *then*, and only then, it earns a TBox term. This turns Davis's dissent into the **acceptance test for the collapse**, which is where it belongs.

**Residual WG-curation scope: Category G, ~181 distinct names — yes, this is the right bounded target,** with two riders:

- **Bound it by the eighth-category discipline.** Each of the ~181 routes to a UFO meta-category via ODR-0011 §8a / ODR-0008 §Q5a (Quality / Quale-in-Region / Substance-Kind label / Mode). If a G-leaf fits **none** of the seven categories, it triggers the **named eighth-category Author-amendment** (ODR-0011 §8a) — not a silent flat datatype property. This keeps the curated pass *disciplined*, not just *smaller*.
- **Fire ODR-0008 §Q2a(a) when the axis crystallises.** As the ~181 are curated, the Quality / Mode / Substance-Kind-label distinctions become load-bearing — that is the literal spawn-trigger for ODR-0008a/b/c (Allemang `property-qualities`, Guizzardi/Pandit `property-modes`, Kendall `legal-estate-attributes`). The residual pass is **where the spawn-rule fires**, and Category E (prov-bearing results) is the named trigger for §Q2a(b)/ODR-0008d.

**Vote: FOR** — category import preserves round-trip + addressability via profile + `dct:source`; adopt the leaf-coverage round-trip CI as the gate; residual = Category G (~181), bounded by the §8a eighth-category discipline and the §Q2a spawn-rule.

---

## Cross-talk — engaging Davis (DA)

**Davis, your completeness-gate is correct and we are adopting it — but as a *test on instances*, not a *cardinality floor on the TBox*. Here is the precise disagreement.**

Your standing dissent (S023-EVIDENCE §D) has two limbs. We concede the first and reject the second's *implementation*:

1. **"A collapsed TBox may fail to regenerate all 31 forms (BASPI5 round-trip)."** — **Granted as a risk; denied as an argument for 1:1 leaves.** Round-trip is satisfied by the **profile shape + `dct:source` path**, which ODR-0008 §Q7a already designates as the home of per-form structure. The TBox was *never* the round-trip carrier — even today only 17+2 BASPI5 datatype properties exist and the round-trip story rests on the profile, not on 900 properties (which don't exist yet). So 1:1 import cannot be *necessary* for a round-trip that already routes through a different layer. **What we owe you is proof, and we've named it:** the **leaf-coverage round-trip CI** (Q6) — generalising your own ADR-0028 totality CI from "every term has `rdfs:isDefinedBy`" to "every form-leaf is regenerable from term ∪ scheme ∪ shape ∪ path." Make collapse *pass that gate* and your first limb is satisfied **by construction**.

2. **"A consumer asking for `boilerImmersionHeater.price` must be answerable."** — **Fully answerable, and *better* answerable.** Under collapse it is `?sale opda:includesFixture [skos:exactMatch :boilerImmersionHeater; opda:fixturePrice ?p]` — a typed, joinable query against a **first-class chattel referent**. Under your 1:1 scheme it is an opaque datatype property whose *name* is the only handle — you cannot ask "all included fixtures over £500," "all chattels of kind X," or "which items recur across forms," because the chattel was never a referent. **Your addressability requirement is an argument *for* our model, not against it.**

**The crux, stated as a thesis you can attack:** *Form structure has no domain identity criterion (Guarino & Welty 2002), therefore form-slot recurrence is not domain-concept recurrence, therefore the round-trip obligation is discharged at the layer that owns form structure — the SHACL profile and the instance path — not at the TBox.* The TBox owes the domain its **~181 real Qualities** (rigid, bearer-inhering — Guizzardi 2005 Ch. 4) and the **structural universals** (FixtureInclusion Relator, RiskAssessment artefact, the 54 Quale-regions). It does **not** owe the domain 754 reified form-slots, because **those slots are not in the domain.**

`[Guarino]` Davis, put concretely: if you can state the **identity criterion** of `sprayFoamInsulation.details` *that is not "the text the user typed under that question"* — i.e. a criterion grounded in the Property, not the form interaction — we will mint it. We predict you cannot, for ~754 of the 935, and that prediction is **testable leaf-by-leaf**. The IC test is not our opinion against your completeness; it is the **discriminator** that tells us *which* leaves your completeness-gate is actually about (the ~181) and which are scaffolding the profile already covers.

`[Guizzardi]` And the conciliatory close: your gate and our IC are **the same instrument pointed at two layers.** Your CI verifies *nothing regenerable is lost*; our IC verifies *nothing identity-less is minted.* Run **both** and the result is provably complete **and** ontologically clean — which is the only state ODR-0001's citation-grounded methodology should accept. We are not overruling the completeness-gate; we are telling you **where it binds.**
