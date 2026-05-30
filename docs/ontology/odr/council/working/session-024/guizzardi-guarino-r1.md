# Session 024 (R1) — Joint Position: Giancarlo Guizzardi & Nicola Guarino

**Foundational-ontology pair.** One joint voice; where we differ, marked `[Guizzardi]` / `[Guarino]`. Sources cited by name per ODR-0001 §Citation grounding. This council **discharges A9** for the Authority-Retrieved Artefact family: a UFO meta-category + an identity criterion (IC) for **every** class — the five already-ratified (`opda:Search`, `opda:Survey`, `opda:EPCCertificate`, `opda:Valuation`, `opda:Comparable`) and the new `opda:RiskAssessment`.

**Standing sources we apply throughout:**

- **Guizzardi 2005**, *Ontological Foundations for Conceptual Modeling with Applications* (UFO), Ch. 4 — Substance Kind / Subkind / Role / Phase / Relator / Mode / **Quality (Universal) / Quality Region & Quale / Object**. The load-bearing axiom this council turns on: **"Qualities inhere in their bearers and are individuated by them"** — a Quality has *no* identity of its own; it borrows it from the substance it inheres in.
- **Guarino & Welty 2002/2009**, *OntoClean* — the meta-property discipline: **R**igidity, **I**dentity criterion (IC), **U**nity. The IC test is the instrument that separates a genuine **Object with its own identity** from a **value-keyed datum** that has none. This is the exact instrument that answers Cagle.
- **Masolo et al. 2003**, *WonderWeb Deliverable D18 (DOLCE)* — §4.2 Non-Physical Endurant / Non-Physical Object; §4.3 Quality / Quality Region / Quale (the metric-banded value space).
- **Guizzardi et al. 2021**, *gUFO* (a lightweight implementation of UFO) — `gufo:Object` / the treatment of **information artefacts as non-physical Objects** with their own identity, distinct from the Qualities they bear. This is what corrects the current emission (below).

**Prior OPDA rulings that already apply us (we extend; we do not re-open):**

- **ODR-0011 §8a** — the seven-category UFO framework, with a **named eighth-category trigger** (Author-only amendment, dual `dct:source`). It binds value-spaces (`builtForm`, `currentEnergyRating`, `councilTaxBand` → **Quale-in-Region**). We invoke this for the peril scheme and for `riskIndicator`/`actionAlertRating`, and we **fire the eighth-category trigger** for the class itself (below).
- **ODR-0008 §Q4a** — the three-criterion class-promotion test (authority-retrieved provenance / distinct lifecycle / distinct PII regime). The five classes were promoted under it; `RiskAssessment` satisfies it on two criteria.
- **ODR-0008 §Q2a(b)** — the named spawn-rule: *"authority-retrieved-artefact provenance loss → spawn ODR-0008d."* This council **is** that spawn discharging.
- **ODR-0009** — the PROV-O backbone (`prov:Entity` / `prov:Activity` / `prov:wasGeneratedBy` / `prov:wasDerivedFrom`); the evidence envelope is already `prov:Entity` subclasses. We hang the whole family off it.
- **ODR-0005 §2a** — the precedent for stating UFO/DOLCE category + **IC over named hard cases** per class. We follow that artefact discipline exactly.
- **S023 (this pair, Q1/Q4)** — we ruled E (the search/risk result) is **"Object (information artefact, prov-bearing) + Qualities (`riskIndicator` = Quale-in-Region)"** and that it fires §Q2a(b). R1 is us **making that ruling load-bearing and discharging its A9.**

All structural figures are from **S024-EVIDENCE** and were **recomputed by us** against `data-dictionary-canonical.json` (8,458 entries). Where the recomputation sharpens the evidence, we say so.

---

## Verified data (we recomputed; cite S024-EVIDENCE)

We reproduced S024-EVIDENCE's central count and it holds **exactly**, and tighter than stated:

- **24 parents bear `actionAlertRating`**, and — sharper than the evidence — **all 24 bear the full six-field block** (`riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution`). Not "≈"; a *perfectly uniform* micro-structure.
- The 24 = **12 environmental perils × 2 levels**: each peril's own `*Risk` block **plus** its `riskSubcategories[]` block. The 12 perils confirmed: flooding, coalMining, nonCoalMining, radon, groundStability, contaminatedLand, coastalErosion, climate, energy, infrastructure, planning, transportation.
- `riskSubcategories` recurs as **exactly 12 leaves** (one per peril), each `[]`-arrayed and bearing the *same* six-field block as its parent. The recursion is real and uniform.
- One **degenerate** 25th parent — `otherEnvironmental` — bears only `{riskIndicator, summary}`. It is a stub, not a full result; it instances the class with two of six Qualities populated. (This matters for Q4's unity answer.)
- `localSearches` subtree = 652 leaves; `valuationComparisonData` subtree = 33 leaves (CON29-style and Comparable/Valuation evidence respectively).

**The ontological reading of this count.** A single information-artefact structure, **instantiated 24 times by a difference in one value (the peril)**. That sentence is, in advance, the answer to Q1 (it is a *class*, not a datatype), Q2 (the peril is a *value*, a Quale, not a subclass), and Q3/Q6 (one class, the peril scheme the discriminator). The uniformity is not incidental — it is the **diagnostic signature of an instantiated universal**: 24 instances of one Type, individuated by a Quale, is *precisely* what UFO predicts you should model as one Object-class + one Quality over a Quality Region (Guizzardi 2005 Ch. 4), and *not* as 24 flat predicate-sets nor 12 subclasses.

---

## The substantive correction this council must make (before any vote)

The five existing classes are emitted today (`opda-descriptive.ttl`) as:

> `skos:scopeNote "UFO: Substance Kind, informational …"` ; `rdfs:subClassOf prov:Entity`.

**"Substance Kind (informational)" is the wrong UFO meta-category, and `RiskAssessment` must not inherit it.** We say this plainly because getting it right is *exactly* what defeats Cagle's attack and what A9 exists to force.

A **Substance Kind** (Guizzardi 2005 Ch. 4 §4.2) is a **rigid, sortal, existentially-independent** universal whose instances are *substances* — they depend on **no other individual** for their existence (a Person, a Dog, a Property). A survey **report**, an EPC, a search result, a risk assessment is **not** existentially independent: it is an **information artefact** that is *existentially dependent on the activity that generated it* and *carries propositional content about a subject*. In UFO/DOLCE terms it is a **Non-Physical Object / Information Object** (DOLCE §4.2 Non-Physical Endurant; gUFO `gufo:Object` as an information artefact), **not** a Substance Kind. Labelling a report a "Substance Kind" is the same category slip as calling a *photograph* a substance: it conflates the **artefact** (which has its own identity, lifecycle, and provenance) with the **substance-Kind** schema slot.

This is not pedantry — it is **load-bearing for the IC**, and therefore for Cagle:

- A **Substance Kind** supplies its **own** intrinsic IC (you identify a Person by personal-identity criteria). If `RiskAssessment` were a Substance Kind, Cagle's challenge — *"where is its independent identity? it's just a value-keyed datum"* — would have **no answer**, because a bare value-bundle has no intrinsic Substance identity. Cagle would **win**.
- An **Information Object** supplies an **extrinsic, relational IC**: it is identified by the **generating activity + the dataset/source + the subject it is about + the time it was generated** (Guizzardi 2005 on existentially-dependent endurants; PROV-O `prov:wasGeneratedBy` as the formal hook). That is a *real, checkable, non-bundle* identity — and it is **exactly the four-part IC** we assign below. Cagle's "value-keyed datum" reduction **fails** against it, because two RiskAssessments with *identical six-field values* are **distinct objects** if they were generated by distinct activities (a re-run), and *the same object* across two transactions that both cite it — which a value-keyed datum could never express.

**Recommendation (normative for this ODR-0008d):** emit the family as **UFO Information Object** (DOLCE Non-Physical Object; gUFO Object-as-information-artefact), `rdfs:subClassOf prov:Entity` (retained — correct and orthogonal), and **retro-correct the five existing scopeNotes** from "Substance Kind, informational" to "**Information Object (information artefact); DOLCE Non-Physical Object**." `[Guarino]` I would accept "informational endurant" as a tolerable shorthand *only* if the scopeNote also states the extrinsic IC explicitly; "Substance Kind" must go, because it asserts intrinsic identity the artefact does not have. `[Guizzardi]` Agreed; and note the corpus **already** has the right vocabulary one line away — `opda:GeneratorRun` is correctly typed `"UFO: Information Particular"`, and `opda:DiagnosticExemplar` `"Informational endurant"`. The descriptive emission simply did not inherit the foundation's own discipline. We are aligning it.

---

## Q1 — `RiskAssessment` as a class? + its identity criterion

**It is a genuine class — an Information Object — and we give its IC.** Alternative (d) (a structured datatype on `Search`) is **rejected** on the IC test.

A structured datatype (literal) is, by RDF semantics, **identified by its value**: two `xsd`-typed structured literals with equal components are *the same literal*. That is precisely what a RiskAssessment **is not**:

- **Re-run distinctness.** A flood RiskAssessment run by Groundsure in January and **re-run** in June — *with the same `riskIndicator` value "Low"* — are **two distinct assessments** (different `prov:wasGeneratedBy`, different generation time, the June one possibly `prov:wasRevisionOf` the January one for supersession). A datatype literal **cannot** tell them apart; they would collapse to one literal. An Object **can**: distinct activities → distinct objects.
- **Shared-reference identity.** A lender's mortgage offer condition (S023) and a conveyancer's report **both cite the same** coal-mining assessment. That is **co-reference to one Object** — `?offer dct:requires ?ra . ?report prov:wasDerivedFrom ?ra` — which only a node with **identity** supports. A literal cannot be the shared referent of two independent statements *as the same thing*.
- **Lifecycle.** It is *ordered → returned → superseded/withdrawn* (the §Q4a (b) criterion). Lifecycle states are states **of an endurant that persists through change** (Guizzardi 2005 Ch. 4 — only endurants have phases). A literal has no lifecycle; it is timeless.

**The IC we assign `opda:RiskAssessment` (four-part, extrinsic — A9 discharge):**

> Two `opda:RiskAssessment` individuals are **the same** iff they agree on the tuple **⟨ generating activity (`prov:wasGeneratedBy` → the search/data-provider run), source dataset (`opda:peril` / dataset concept + `datasetAttribution`), subject property (`prov:wasGeneratedBy` … about `opda:Property`), generation time (`prov:generatedAtTime`) ⟩**. Identity is **grounded in the activity, not in the result values.** Equal six-field values are **necessary for nothing** and **sufficient for nothing**; the provenance tuple is the criterion.

**IC test over the hard cases (the A9 requirement):**

| Hard case | Verdict under the IC | Why a datatype/value-bundle fails |
|---|---|---|
| Re-run, same "Low" indicator | **Two** RiskAssessments (distinct activity + time) | literal collapses them to one |
| Two transactions cite one coal-mining search | **One** RiskAssessment, co-referenced | a literal cannot be a shared referent *as the same thing* |
| Supersession (June revises January) | **Two**, linked `prov:wasRevisionOf` | no revision relation between literals |
| `otherEnvironmental` stub (2 of 6 fields) | **One** RiskAssessment, partially populated | a "structured datatype" with 4 missing components is ill-typed; an Object with optional Qualities is fine |
| Corrected re-issue, same activity ID | **One** object, two states | value-bundle has no notion of "same thing, corrected" |

`[Guarino]` This is the **OntoClean rigidity** confirmation, stated as a meta-property: `RiskAssessment` is a **rigid sortal** (`+R +I`) — an assessment cannot cease to be an assessment and persist; and it **supplies a (relational) IC** via the provenance tuple. It therefore *passes* the test to be a Type. `details`/`comments` (S023 Category A) **fail** `+I` and are correctly *not* classes. The line between them is exactly the IC, which is the whole point of the instrument.

`[Guizzardi]` And the **existential-dependence tell** seals it against alternative (d): a RiskAssessment is *generically existentially dependent* on a generating Activity (Guizzardi 2005 — informational artefacts depend on the events that produce them). Existential dependence on an external individual is the signature of an **endurant with relational identity**, never of a **value**. A datatype literal depends on nothing. So (d) does not merely lose query power — it **mis-types the ontological category**.

**Vote Q1: FOR** — `opda:RiskAssessment` is a class (UFO **Information Object**), with the four-part provenance-grounded IC above. Reject (d).

---

## Q2 — The peril/dataset axis: SKOS scheme vs subclasses vs string

**A first-class 12-member SKOS scheme of dereferenceable concepts. Reject 12 subclasses (alternative c); reject the opaque string.** The peril is a **Quale** (a value), not a Kind.

The decisive UFO test, stated as a question (Guizzardi 2005 Ch. 4): **does "flood" vs "coal-mining" differ in IDENTITY, or only in a Quality VALUE?** A subclass (alternative c) is warranted **only** when the discriminator is a **rigid sortal distinction** — when `FloodRisk` instances and `CoalMiningRisk` instances obey **different identity criteria** or carry **different essential properties/structure**. They do not:

- We verified the structure is **byte-uniform**: all 24 parents carry the **identical six fields**. `FloodRisk` and `CoalMiningRisk` have the **same IC** (the four-part provenance tuple above), the **same Qualities**, the **same lifecycle**. The *only* thing that varies is **which peril** — a value in a value-space.
- Therefore the peril is a **Quale-in-Region** (ODR-0011 §8a — the same category as `builtForm`, `councilTaxBand`): a value drawn from a controlled region, **borne by** the RiskAssessment Object (`opda:peril` → the peril `skos:Concept`). It is data, not schema.
- **12 subclasses would assert 12 identity criteria that are all the same criterion.** That is the OntoClean **"subkind without a differentiating principle"** anti-pattern (Guarino & Welty 2002) — multiplying rigid Types where one Type + one Quality suffices. It conscripts a reasoner to police a hand-curated list of perils (the OWL-enumerated-subclass anti-pattern ODR-0011 §Alternatives already rejected), it cannot grow without a TBox edit (a new peril = a new class = a new release), and it **fractures the cross-peril query**: "give me every dataset whose `actionAlertRating` is High across all perils" becomes a 12-way `UNION` instead of one BGP `?ra opda:actionAlertRating ?r ; opda:peril ?p`.
- The **opaque string** fails the *other* direction: S023 established a lender's offer condition **names** the coal-mining search, so the axis must be **dereferenceable and queryable** — a `skos:Concept` with `skos:prefLabel` + `dct:source` to the CON29/provider definition, not a bare token a consumer must string-match.

**The peril SKOS scheme is the Quality Region.** Per ODR-0011 §8a this is a **Quale-in-Region** scheme: `opda:perilScheme a skos:ConceptScheme ; opda:ufoCategory "Quale-in-Region"`, dual `dct:source` (the relevant search standard + ODR-0011). The 12 concepts are the region's points; `opda:peril` is the Quality predicate whose value is a Quale in that region. `riskIndicator` and `actionAlertRating` are **also** Quale-in-Region (over their own rating scales — Low/Medium/High / Action-alert bands), borne by the same Object. This is three Qualities over three regions, all inhering in one Information Object.

`[Guarino]` One guard: the peril concepts must carry **`dct:source` to the governing search standard / provider definition**, not merely to the schema leaf (Kendall's S023 traceability gate G2, which we endorse) — so "coalMining" dereferences to *what a coal-mining search legally is*, the thing a lender's condition actually relies on.

**Vote Q2: FOR** the 12-member SKOS scheme (Quale-in-Region). **Against** 12 subclasses (alternative c) and the opaque string.

---

## Q3 — One family class or two? (environmental-search vs CON29 local-authority)

**One class: `opda:RiskAssessment`.** Two classes would, again, assert an identity distinction that is not there.

The competency test (Guizzardi 2005 — *do they share an IC and a structure?*): environmental-search results (flood, radon, coal) and CON29 local-authority results (`localSearches`, 652 leaves) are **both** authority-retrieved Information Objects with the **same four-part provenance IC**, the **same lifecycle** (ordered/returned/superseded), and — where they carry a risk verdict — the **same Quality structure**. What differs is the **issuing authority** (a data provider vs the local authority) and the **dataset** — and *issuing authority + dataset are already Qualities/relations on the Object* (`prov:wasGeneratedBy → the issuer`; `opda:peril`/dataset concept). A difference that is **already captured by a borne Quality is not a ground for a new Kind** (this is the core OntoClean economy: do not subclass on a property value).

So: **one `opda:RiskAssessment` Information Object**, discriminated by (i) its **peril/dataset Quale** (Q2 scheme) and (ii) its **issuer** (`prov:wasGeneratedBy` Agent, ODR-0006/0009). CON29 local-authority results are RiskAssessments whose dataset concept is a CON29 enquiry and whose issuer is the local authority. This keeps the cross-source query uniform ("every authority-retrieved result, High alert, for property X") and lets the scheme grow without TBox churn.

`[Guizzardi]` The relationship to the **already-ratified `opda:Search`** must be stated, or we leave a gap: `opda:Search` is the **authority-retrieval *act/order*** (the instrument a consumer orders — CON29R, LLC1), and **`opda:RiskAssessment` is a *result-bearing content artefact*** that a Search `prov:generated`. They are **not** the same Object and **not** rivals: `?search prov:generated ?riskAssessment`. This is the cleanest reading of the corpus — `opda:Search`'s own scopeNote already says "Local-authority or environmental search result (CON29R, LLC1…)", which is doing double duty (the order *and* its result). R1 should split that duty: **`Search` = the retrieval; `RiskAssessment` = the per-peril result it yields.** That is *one* RiskAssessment class, related to *one* Search class, not two RiskAssessment classes.

**Vote Q3: FOR** one `opda:RiskAssessment` (discriminated by peril-Quale + issuer), generated-by `opda:Search`. **Against** two classes.

---

## Q4 — The `riskSubcategories[]` recursion: self-referential vs flat list

**Self-referential `opda:RiskAssessment` bearing sub-`RiskAssessment`s via a mereological part-of, NOT a flat sub-result list.** The data is genuinely recursive and the parts are genuine Objects.

We verified: each of the 12 perils carries a `riskSubcategories[]` whose members bear **the identical six-field block**. A sub-result is therefore **the same kind of thing** as its parent — same IC, same Qualities, same lifecycle. UFO/DOLCE **mereology** (Guizzardi 2005 Ch. 4; DOLCE part-of) says: when a whole and its parts are instances of the *same* Object-Kind and the parts have their *own* identity, model **part-of over the Kind**, reflexively — not a degenerate "list of literals."

- A flood sub-assessment (e.g. *river* vs *surface-water* flooding under the flood peril) **has its own** `riskIndicator`, its own `datasetAttribution`, its own provenance — i.e. its **own four-part IC**. It is an Object in its own right. A flat datatype list throws that identity away (and re-creates the value-bundle problem one level down).
- So: `opda:RiskAssessment opda:hasSubAssessment opda:RiskAssessment` (a `dct:hasPart`-shaped, **transitive, irreflexive** part-of; an `owl:ObjectProperty`, not a containment of literals). A consumer can then dereference *"the surface-water sub-result of the flood assessment for property X"* — the exact granularity an AVM needs — which a flat list buries.

**Unity (the OntoClean U the recursion forces us to state).** `[Guarino]` The **whole** RiskAssessment's unity is **functional/relational**, not summative: it is one assessment *because one activity generated it as a unit*, even though its parts have their own ICs. This is standard for information artefacts (a report is one report though its sections are individually citable). We therefore add a **unity note** to the IC: the *whole* is unified by its single `prov:wasGeneratedBy`; the *parts* are unified each by their own. The `otherEnvironmental` stub (2-of-6 fields, no subcategories) is then unproblematic — it is a **leaf** RiskAssessment with no parts and some Qualities unpopulated; optional Qualities on an Object are fine (a structured datatype with 4 missing fields would be ill-formed — another mark against (d)).

**Vote Q4: FOR** self-referential `opda:hasSubAssessment` part-of (sub-results are first-class RiskAssessment Objects). **Against** a flat sub-result list.

---

## Q5 — Provenance + IC for the family, and the five existing classes' internals

**Hang the whole family off ODR-0009 PROV-O (`prov:wasGeneratedBy`), as §Q4a requires, and state UFO category + IC per class.** All six are **Information Objects** (the §"substantive correction" above), `rdfs:subClassOf prov:Entity`, each with an **issuer + reference + date** IC.

**Provenance backbone (per ODR-0009, reused — mint no new provenance primitives):**

- `opda:RiskAssessment rdfs:subClassOf prov:Entity` ; each instance `prov:wasGeneratedBy` a search/provider `prov:Activity` (the `opda:Search` order), `prov:wasAttributedTo` the issuer `prov:Agent` (Groundsure / Landmark / Coal Authority / local authority — ODR-0006), `prov:generatedAtTime` the assessment date, `prov:wasDerivedFrom` the dataset. Supersession via `prov:wasRevisionOf`. This is **identical machinery** to ODR-0009's claim/evidence spine; we add **zero** provenance terms (only the domain Qualities `opda:peril`, `opda:riskIndicator`, `opda:actionAlertRating` + the part-of `opda:hasSubAssessment`).

**Per-class UFO category + IC (A9 discharge — the table this council owes):**

| Class | UFO meta-category | Identity Criterion (extrinsic — issuer + reference + date) | Named hard case |
|---|---|---|---|
| **`opda:RiskAssessment`** *(new)* | **Information Object** (DOLCE Non-Physical Object; gUFO Object/artefact) | ⟨ generating activity, source dataset/peril, subject property, generation time ⟩ — §Q1 four-part tuple | re-run same value → two; co-cited → one; revision → `prov:wasRevisionOf` |
| `opda:Search` | **Information Object** *(the retrieval act's record)* | ⟨ issuing authority, search-type (CON29R/LLC1/…), order/return reference, return date ⟩ | re-order; superseded return; **generates** RiskAssessment(s) |
| `opda:Survey` | **Information Object** | ⟨ surveying professional/firm, instruction reference, report date ⟩ | re-survey; supersession; withdrawal *(already in its scopeNote)* |
| `opda:EPCCertificate` | **Information Object** | ⟨ DESNZ register, RRN (certificate reference number), lodgement date ⟩ — IC keyed on the **RRN**, not the property | re-assessment within 10-yr validity → new RRN → distinct certificate |
| `opda:Valuation` | **Information Object** | ⟨ RICS valuer/AVM provider, instruction reference, valuation date ⟩ | re-valuation; instructed→delivered→superseded |
| `opda:Comparable` | **Information Object** | ⟨ source register (Land Registry PPD / VOA), transaction reference, sale/let date ⟩ | same property re-sold → distinct Comparable; supports `prov:wasInformedBy` into Valuation |

Every IC here is **extrinsic and provenance-grounded** — `issuer + reference + date`, formalised by `prov:wasGeneratedBy` + a `dct:identifier`/reference + `prov:generatedAtTime`. This is the single discipline that (a) discharges A9 uniformly, (b) **defeats Cagle's value-bundle reduction for all six** (none is identified by its content values; each by its provenance), and (c) corrects the "Substance Kind" mis-type in one stroke. `[Guizzardi]` The EPC IC is worth stating explicitly because it is the sharpest: an EPC is identified by its **RRN**, a register-issued reference — *not* by the property and *not* by the energy band; two EPCs on one property (re-assessment) are two certificates with two RRNs and the same band. That is the Information-Object IC in its purest form, and it is unanswerable as a "value-keyed datum."

**The five classes' *internal* property structure** (the §Q4a follow-through this R1 must deliver, beyond the bare class + identity-key shape they have today): each gains its **borne Qualities** as `owl:DatatypeProperty`/`owl:ObjectProperty` on the class, sourced per leaf — e.g. `Survey` bears its survey-type (Quale-in-Region over a RICS survey-level scheme), date, surveyor; `EPCCertificate` bears RRN, `currentEnergyRating` (the existing Quale-in-Region), lodgement/expiry dates; `Valuation` bears amount (reuse the `MonetaryAmount` pattern S023 named — do **not** mint per-figure properties), basis, date; `Comparable` bears sale price (same `MonetaryAmount`), sale date, address (reuse ODR-0015). The **identity-key SHACL shape stays** (`prov:wasGeneratedBy minCount 1` — it is the operational projection of the extrinsic IC), and gains the per-class reference shape (RRN for EPC, etc.). Detailed per-leaf binding is the curated-G walk's job (ODR-0008 §Q5a); R1 fixes the **categories and ICs**, which is A9's scope.

**Vote Q5: FOR** — PROV-O backbone per ODR-0009; all six are Information Objects with extrinsic issuer+reference+date ICs (table above); retro-correct the five scopeNotes off "Substance Kind."

---

## Q6 — The four-way (Kendall's (a)–(d)): which wins, on what criterion?

**(b) — one `RiskAssessment` class + peril SKOS scheme — wins, on the identity-criterion criterion.** We rank all four by the *one* question that governs minting (Guizzardi 2005; Guarino & Welty 2002): **does the thing have its own identity, and at what grain?**

| Alt | What it claims ontologically | IC verdict | Disposition |
|---|---|---|---|
| **(a) Flat datatype-bag** on `Search` | the six fields are **Qualities of the Search**, no result-Object | **Wrong:** loses the per-peril Object's identity *and* the cross-peril uniformity; the result has its own provenance the Search does not | **Reject** |
| **(c) 12 per-peril subclasses** | flood vs coal differ in **Kind/IC** | **Wrong:** they share one IC + one structure (verified byte-uniform); subclassing on a Quality value is the OntoClean sub-kind-without-principle anti-pattern | **Reject** |
| **(d) structured datatype** on `Search` | the result is a **value** (literal) | **Wrong (category error):** a value is identified by its components; the result is identified by its **activity** — re-run/co-reference/lifecycle all break a literal (§Q1) | **Reject** |
| **(b) class + peril scheme** | the result is an **Information Object** bearing a **peril Quale** | **Correct:** Object carries the extrinsic provenance IC; peril is a Quale-in-Region value; uniform structure = one Type, varying value = one Quality | **ADOPT** |

The criterion is **not** query convenience (though (b) also wins there — one BGP vs 12-way UNION, growable scheme vs TBox churn). It is **ontological correctness under the IC test**: (b) is the *only* option whose ontological claim matches what the thing **is** — an authority-generated information artefact with relational identity, bearing a peril value. (a) and (d) deny it identity it has; (c) grants it identity-multiplication it does not have. (b) grants exactly the identity it has, at exactly the grain it has it.

`[Guarino]` Put as the OntoClean summary: **(b) respects `+R +I` at the artefact level and `Quale` at the peril level.** (a)/(d) violate `+I` (deny the artefact its IC); (c) violates economy (manufactures rigid Kinds where a Quality value suffices). The instrument decides it; this is what OntoClean is *for*.

**Vote Q6: FOR (b)** — class + peril SKOS scheme — on the identity-criterion criterion.

---

## Engagement with Cagle (DA) — the IC test answers "value-keyed datum, not a class"

Cagle's S023 reading routes E to **"one `SearchResult`/`RiskAssessment` node-shape (~6 props) over one small class + a peril scheme"** — and crucially, in his Category-A treatment, he holds that recurring slots are **value-keyed data, not classes** (`disclosureDetail` is *one property, identity in the shape target*, never a minted entity). The crux the convening note names is: **does the same logic dissolve `RiskAssessment` into a value-keyed datum?**

**No — and the IC test is the precise discriminator, drawing the line exactly where Cagle himself draws it for `details`.** Cagle is *right* that `details`/`comments` are value-keyed and class-less: they **fail `+I`** (no identity criterion; identity parasitic on the parent question). We agree and co-signed it at S023. But `RiskAssessment` is on the **other side of that very line**, and the test shows it:

1. **The re-run test.** Two `details` strings with the same text *are* the same datum (Cagle is right to collapse them). Two RiskAssessments with the same `riskIndicator` "Low" are **not** the same — distinct `prov:wasGeneratedBy`, distinct time, possibly `prov:wasRevisionOf`. **`details` collapses on value; `RiskAssessment` does not.** That is `−I` vs `+I` made operational. Cagle's own collapse-on-value rule, *applied honestly*, keeps `details` a datum **and** promotes `RiskAssessment` to a class — because they answer the collapse test oppositely.
2. **The shared-referent test.** A lender's offer condition and a conveyancer's report **co-reference one** coal-mining assessment *as the same thing*. A value-keyed datum cannot be the shared referent of two independent assertions *as one individual* — co-reference **requires** identity. (No two consumers ever need to co-refer to "the same `details` string as the same thing"; they refer to *their* question's slot.)
3. **The lifecycle test.** `RiskAssessment` is *ordered→returned→superseded* — phases of a **persisting endurant** (Guizzardi 2005 — only endurants have phases). `details` has no lifecycle; it is a timeless value. §Q4a (b) (distinct lifecycle) is satisfied by one and not the other.

So Cagle's instinct is *correct for A and correct for E* — and the **two land in different places** precisely because the IC test puts them there. We expect Cagle to **concur** (his S023 vote was FOR the class; his attack is the *useful* one — it forces the IC to be stated, which is exactly A9's demand). Where we **extend** Cagle: he typed E as "Object + Quality" loosely; we make it **Information Object with a four-part extrinsic IC** and **correct the "Substance Kind" mis-type** — without which his own "node-shape over a small class" has a class whose identity is unspecified, i.e. exactly the gap his "value-keyed datum" probe exploits. The IC closes it. **The shape (`~6 props`) is Cagle's; the identity (the provenance tuple) is ours; together they are a class that survives his attack.**

One concession **to** Cagle, recorded: the six fields are emitted as **one node-shape's properties over one class**, *not* 24×6 flat predicates — his anti-sprawl thesis is right and we vote with it. We disagree only with any reading that the class is *therefore* dispensable: the shape needs a **subject with identity** to target, and that subject is an Information Object, not a literal.

---

## FINAL — per-question votes

- **Q1: FOR** — `RiskAssessment` is a class (UFO **Information Object**); IC = ⟨activity, dataset, subject, time⟩; reject datatype (d).
- **Q2: FOR** — 12-member peril **SKOS scheme** (Quale-in-Region); reject 12 subclasses (c) and opaque string.
- **Q3: FOR** — **one** `RiskAssessment` (discriminated by peril-Quale + issuer), generated-by `opda:Search`; reject two classes.
- **Q4: FOR** — **self-referential** `opda:hasSubAssessment` part-of (sub-results are first-class RiskAssessments); reject flat list.
- **Q5: FOR** — PROV-O backbone per ODR-0009; **all six are Information Objects** with extrinsic issuer+reference+date ICs; retro-correct the five "Substance Kind" scopeNotes.
- **Q6: FOR (b)** — class + peril scheme — on the **identity-criterion** criterion; (a)/(c)/(d) each mis-state the ontology.
