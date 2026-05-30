# Session 023 — Ian Davis, Devil's Advocate — Working Position

**Role:** Devil's Advocate (linked-data deployment at scale; BBC `/programmes/` and `/music`, 2009, `bbc.co.uk/ontologies/po`; UK-Gov / data.gov.uk publishing cookbook; ex-Talis). Publish-first: *Linked Data is about **publishing** the data you have, not re-modelling it into something tidier.*
**Methodology:** ODR-0001 §Roles — I ATTACK the proposition and find what collapsing the leaves breaks. Per ODR-0001 I MUST, per question, state a **withdrawal condition** and declare **WITHDRAW** or **HOLD**. I expect to lose votes; I lose them honestly.
**Standing dissent carried in:** *completeness-as-a-gate* (S021, held-as-live) — a collapsed TBox must still (a) regenerate all 31 forms (BASPI5 round-trip = the MVP gate) and (b) answer a consumer who dereferences a specific leaf such as `boilerImmersionHeater.price`. This session is where that dissent is tested.

> **My one-sentence brief:** I am not here to defend the mechanical 935-leaf walk — the build pass (ADR-0028 §14) already proved it unsound, and I accept that. I am here to make the proposition *prove* that "collapse most, curate ~181" preserves **coverage** — round-trip fidelity and per-leaf consumer addressability — by `dct:source`/path + SHACL profiles, and not merely **assert** it. Where it proves it, I withdraw. Where coverage is unproven, I hold.

---

## Verified state I checked myself (not taken on trust)

| Claim I needed to test | Verified? | What I found |
|---|---|---|
| The instance path discriminates collapsed leaves | ✅ | In the canonical dict every leaf carries a distinct `path`: `propertyPack.fixturesAndFittings.basicFittings.boilerImmersionHeater.price` ≠ `…radiatorsWallHeaters.price` ≠ `propertyPack.priceInformation.price`. Collapsing the **property** to one `opda:price` does NOT erase the **instance** discriminator — *if* the path is preserved and the profile `sh:path` walks it. (This both helps and hurts the proposition; see Q3/Q6.) |
| The headline sale price sits in the SAME last-segment bucket as chattel prices | ✅ | `propertyPack.priceInformation.price` (the genuine asking/sale price — a Category-**G** lender-critical fact) shares the final segment `price` with **89 fixtures-checklist chattel prices** (Category D). Naive last-segment binning swallows a G concept into D. **This is mis-binning made concrete.** (S023-EVIDENCE §B/§C; canonical dict.) |
| Today's BASPI5 profile addresses each leaf by a NAMED `opda:` property | ✅ | `baspi5.ttl` property shapes carry `sh:path opda:hasSprayFoamInstalled`, `sh:path opda:currentEnergyRating`, `sh:path opda:soldWithVacantPossession`, `sh:path opda:isSharedOwnership` — one dereferenceable TBox IRI per leaf, with `dct:source` to the form anchor (`baspi5#A1.8.4.1` etc.). The round-trip works **today** because the term IS the address. |
| ODR-0008's round-trip test recovers WHAT, and from WHAT | ✅ | ODR-0008 §Operational specs line 68: "Round-trip equivalence SPARQL test verifies the **per-property + per-overlay `dct:source` array** recovers the data-dictionary **cross-context table**." The test's substrate is *per-property* provenance. Collapse the properties and the per-property array is no longer per-property. **This is my Q6 crux, in the proposition's own cited authority.** |
| Category G is genuinely ~181 distinct names | ⚠️ partial | The G exemplars resolve to distinct, already-semantic paths (`builtForm`, `yearOfBuild`, `currentEnergyRating`, `councilTaxBand`, `numberOfFloors`, `centralHeatingFuelType`). But `tenureKind` — named in the EVIDENCE G-list — **does not exist** in the canonical dict under that name. The "181" is a *projection of a binning decision not yet made*, not a counted set. (Q2/Q6.) |
| Enum→SKOS is already ratified law | ✅ | ODR-0011 §Decision: each JSON enum → a `skos:ConceptScheme`. Category C is not a new proposal; it is **executing** ODR-0011. I have no standing to attack C on principle. (Q5.) |

These cut two ways, and I report them honestly: the instance path **survives** collapse (weakening my pure-addressability alarm), but the round-trip test's **per-property substrate does not** (sharpening my coverage alarm), and the boundary between G and D is **a decision that can silently lose a concept** (the mis-binning alarm is real and concrete).

---

## Q1 — Diagnosis: conceptual richness, or form-ergonomics + repeated micro-structure?

### Attack
I will **not** pretend the 1,493 leaves are 1,493 concepts — the evidence is overwhelming that they are not (840/1,493 = 56% are ~16 generic recurring tails; `yesNo` referenced 1,135×; 378 enum leaves → 54 value-sets; 809 names span ≥2 schemas). Anyone arguing "conceptual richness" loses to `audit.json`'s own numbers. So I concede the *factual* half of Q1 outright.

What I attack is the **rhetorical slide** from "repeated micro-structure" to "**poor modelling**, therefore safe to drop." Those are different claims. My BBC `/programmes/` deployment (Davis, 2009) is the counter-case: the Programmes Ontology has `po:Episode`, `po:Brood`, `po:Version`, `po:Broadcast` — structurally *repetitive* (every brand repeats the same episode/version/broadcast shape), and a tidy-minded modeller would have said "that's just transport structure, collapse it to a generic `po:item` with a path." We did **not**, because a consumer dereferencing `/programmes/b006q2x0/episodes` needs *that brand's episodes addressable as episodes*, not reconstructable by parsing a path. **Repetition of structure is not evidence the structure is valueless** — it is evidence the structure is *regular*, which is a reason to generate it uniformly, not a licence to erase it.

So the honest diagnosis is the proposition's **second** framing, not its first: PDTF granularity is **"correct-for-a-form-transport, wrong-altitude-for-a-TBox."** That framing I can sign. The "poor modelling" framing I attack, because it is the premise that licenses dropping addressability in Q3/Q6 without proving it is recoverable.

### Vote
**FOR** the diagnosis *as* "form-ergonomics + repeated micro-structure at the wrong altitude for a TBox." **AGAINST** any reading that the leaves are "poor modelling" such that their *instance-level addressability* is disposable. The grain is wrong for the TBox; that does not make the grain wrong for the *publication*.

### Withdrawal condition
I have effectively already withdrawn the "conceptual richness" reading — the numbers killed it and I concede it. **On the residual hold** (that "wrong altitude" must not be read as "drop addressability"): I withdraw entirely once Q3/Q6 demonstrate the path-based instance addressing is *preserved and tested*. **HOLD** — but a narrow, almost-conceded hold: it binds only as a flag carried into Q3/Q6, not as opposition to the diagnosis itself.

### Citation
BBC Programmes Ontology (`po:`), Davis/BBC 2009 — regular repeated structure published at grain, not collapsed. S023-EVIDENCE §B (`audit.json`: 56% generic tails; `yesNo` ×1,135). The "5★ Linked Open Data" pragmatism (publish what you have at its grain).

---

## Q2 — The category taxonomy A–G: right decision-cut? UFO leaning per category?

### Attack — the bin boundaries are where the information loss hides
The taxonomy A–G is a **reasonable engineering cut** and I will not pretend otherwise — routing 56% generic tails away from per-leaf WG evaluation is sound triage. But "Category G is only 181" is an **assertion about a binning that has not been performed**, and I verified one crack already: the EVIDENCE G-list names `tenureKind`, which **is not in the canonical dict** under that name. If the canonical list of "the genuine concepts" contains a name that does not exist, then "181 distinct names" is a *projection*, not a *count* — and a projection can mis-bin in **both** directions:

1. **A real concept binned DOWN into structure (the dangerous direction).** `propertyPack.priceInformation.price` is the asking/sale price — the single most lender- and valuer-relevant number in the pack. It shares the final segment `price` with 89 fixtures chattel prices. If Category D's treatment ("one `price`-grade property, reference data") is applied by last-segment, **the headline price is swallowed into a chattel checklist.** That is not a hypothetical — it is what the EVIDENCE's own "price ×99" row invites if the binning is mechanical. Mis-binning a G concept into D is **unreversible** once IRIs are minted (permanent IRIs — ADR-0028 §14: "the ~900 IRIs would be permanent and unreversible").

2. **Who decides?** The EVIDENCE says G is "the real per-Property facts ODR-0008 envisaged" — but the *decider* of "real vs structure" is exactly the expensive WG judgment the proposition is trying to economize. There is a circularity: we save WG effort by pre-deciding which leaves don't need WG effort, but that pre-decision IS the WG judgment for the leaves it excludes. The triage is only as safe as the binning rule, and **no binning rule has been exhibited** — only counts.

On **UFO leanings** (Q2's secondary ask): I have no quarrel with the per-category UFO routing as *engineering shorthand* (A≈Quality/qua-text; C≈Quale-in-Region; E≈Object+Quality prov-bearing). But I flag that UFO category is precisely what determines whether a leaf is "mere structure" — a `riskIndicator` leaning **Quale-in-Region** (a value in a quality space a consumer compares across datasets) is *more* addressable-critical than the taxonomy's "one class, six props" treatment implies (Q4).

### Vote
**ABSTAIN** on the taxonomy as a triage frame (it is reasonable and I will not block it), **AGAINST** ratifying the **boundaries** A↔D↔G as settled until a **binning rule** (not a count) is exhibited and the `priceInformation.price`-class mis-bin is explicitly excluded. The cut is fine; the *placement of leaves into the cut* is unproven.

### Withdrawal condition
I **WITHDRAW** the moment the proposition exhibits (a) an explicit binning rule that is **path-aware, not last-segment** (so `priceInformation.price` lands in G and `boilerImmersionHeater.price` lands in D **by rule**, demonstrably), and (b) a reconciled, *counted* G set (no phantom `tenureKind`-style entries). Until a rule replaces the assertion, **HOLD** on the boundaries.

### Citation
S023-EVIDENCE §C (the A–G table; "price ×99"; "181 distinct names"). ADR-0028 §14 (naive last-segment "would collapse 1,521 distinct attributes into ~351 colliding properties… permanent and unreversible") — the proposition's own corpus says last-segment binning is catastrophic; therefore the binning rule must be *more* than last-segment, and must be shown. Canonical dict (`tenureKind` absent; `priceInformation.price` co-segmented with chattels).

---

## Q3 — Whole or part? (the core decision)

### Attack — collapse shifts the address from a dereferenceable IRI to a path a consumer must parse
This is where publish-first bites hardest, so let me state the strongest version of my own case and then the strongest concession.

**The attack.** Today, a consumer who wants "was spray foam installed?" dereferences `opda:hasSprayFoamInstalled` — a TBox IRI with a label, a definition, a `dct:source`, a range. That is 4★→5★ linked data: *the term is the address.* Under category collapse, Category A maps ~407 disclosure tails to **one** `opda:disclosureDetail`. Now the consumer who wants the spray-foam disclosure text cannot dereference a term for it — there is no `opda:sprayFoamDetail`. They must instead (i) know the **instance path** `propertyPack.buildInformation.….sprayFoamInsulation.details`, and (ii) parse JSON-pointer structure to find it. **The address moved from the ontology (dereferenceable, documented, stable) to the form-transport path (structural, undocumented-as-concept, and exactly the `propertyPack` nesting ODR-0008 §Defect-1 called "form ergonomics, not ontology").** Publish-first's asymmetry (UK-Gov cookbook; my data.gov.uk work): **the cost of *under*-modelling — a term a consumer needed that you collapsed away — typically exceeds the cost of *over*-modelling**, because the over-modelled term sits there harmlessly while the under-modelled one forces every consumer to re-derive structure you already knew. Collapsing 407→1 optimizes the *producer's* TBox-curation cost and externalizes a parsing cost onto *every consumer, forever*.

**The concession I am forced to make (and do, honestly).** I verified that the instance **path survives** collapse: `boilerImmersionHeater.price` and `priceInformation.price` remain distinct *as instance paths* even when the property is one IRI. So the data is **not destroyed** — it is **re-addressed**. A consumer *can* still reach `boilerImmersionHeater.price` by path + the property's `dct:source` array. This means my S021 alarm — "a collapsed TBox cannot answer `boilerImmersionHeater.price`" — is **too strong as stated**: it *can*, via path. What it **cannot** do is answer it by **dereferencing a term**, which is the linked-data affordance I actually care about. So I narrow the attack from "information is lost" (false — I withdraw that) to "**addressability is demoted from term-grain to path-grain**" (true, and that is a real publish-first regression, not a fatal one).

**Where that leaves the vote.** This is genuinely a *part* answer, and I move toward Cagle/Knublauch's "collapse most" on A, B, C, F — provided the demotion is **bounded to the categories where the leaf genuinely is not a concept**, and Category G's genuine concepts keep **term-grain** addressing. The fight is not "whole vs part"; it is **where the part-line falls**, which is Q2's binning rule again.

### Vote
**FOR** category-based import (collapse A/B/C/F to patterns/schemes/upstream; per-leaf only G) **AGAINST** the mechanical 1:1 walk — *conditional* on (a) Category G retaining one dereferenceable `opda:` term per concept (term-grain addressing preserved where it matters), and (b) the collapsed categories preserving the **instance path** on the data so path-grain addressing is not *also* lost. I reject 1:1 (the build pass already killed it). I reject *unbounded* collapse that demotes G to path-grain.

### Withdrawal condition
I **WITHDRAW** my opposition to collapsing A/B/C/F the instant Q6 demonstrates the BASPI5 round-trip passes on the collapsed TBox **and** a worked query retrieves `boilerImmersionHeater.price` by path. I **HOLD** specifically against collapsing **Category G**, or against any collapse that does not preserve the instance path on the published data (path-grain is the floor; term-grain is for G).

### Citation
`baspi5.ttl` (`sh:path opda:hasSprayFoamInstalled` — term-as-address today). ODR-0008 §Defect-1 ("that nesting is form ergonomics, not ontology — flatten it" — Cagle) — collapse re-exposes exactly that nesting as the consumer's only address. UK-Gov / data.gov.uk publishing cookbook + 5★ LOD (under-modelling asymmetry; term-grain is the linked-data affordance). Verified: instance paths survive collapse (canonical dict).

---

## Q4 — Recurring micro-patterns (A disclosure tail, B evidence envelope, E search/risk result)

### Attack
**B (evidence envelope) — I concede fully.** Reusing ODR-0009's Evidence + PROV-O for attachments is not just acceptable, it is *correct*: ODR-0009 §Decision already models the assurance envelope as `prov:Entity` subclasses + a few local terms, and the attachment leaves are instances of that envelope, not new concepts. No attack. **WITHDRAW.**

**A (disclosure tail) — concede the collapse, hold the addressing.** One `opda:disclosureDetail` for 269 `details` tails is right *as a TBox economy* — they are the same free-text slot. My only hold is the Q3 one: the *which-disclosure* discriminator must live on the instance path and be recoverable. If `isListed.details`, `sprayFoamInsulation.details`, `buildingSafety.details` all become `opda:disclosureDetail` with the parent question carried as the `sh:path` prefix / `dct:source`, addressing survives. If the parent is *dropped*, the 269 disclosures become an undifferentiated bag — that I attack. **Narrow HOLD on discriminator preservation.**

**E (search/risk result) — this is where I press hardest in Q4.** The EVIDENCE treats the six fields (`riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution`) × ~24 datasets as "one `SearchResult`/`RiskAssessment` class + a peril scheme." A class is *better* than 200 datatype properties — I grant that. But the fixtures-checklist £-prices and the search-result `riskIndicator`s **ARE the data consumers come for** (S023-EVIDENCE attack-line 3). A lender's automated valuation model dereferences "the flood `riskIndicator` for *this* property" — and under a single `SearchResult` class, that `riskIndicator` is addressable **only if** the peril/dataset (flooding vs ground-stability vs radon) is a first-class, dereferenceable discriminator (the peril scheme), not a buried instance literal. My attack: **the class treatment must not demote the per-peril `riskIndicator` from a queryable, dereferenceable position to "a string field on a generic result object you must filter by a dataset name."** That is the same term-grain→path-grain demotion as Q3, and for `riskIndicator` it matters *more* because it is a decision-bearing value, not free-text prose.

### Vote
**FOR** B (reuse ODR-0009 Evidence/PROV-O) — unreserved. **FOR** A and E as classes/patterns **AGAINST** per-leaf datatype properties — *conditional* on the discriminator (A: parent question; E: peril/dataset scheme) being a **dereferenceable, queryable** part, not a buried literal.

### Withdrawal condition
**B: WITHDRAW** now (ODR-0009 settles it). **A: WITHDRAW** once the disclosure parent-question is shown preserved as path/`dct:source`. **E: HOLD** until a worked SPARQL query retrieves "flood `riskIndicator` for property X" against the `SearchResult` class + peril scheme — i.e. the peril is a real scheme concept, not a string. On that query passing, **WITHDRAW**.

### Citation
ODR-0009 §Decision + §PROV-O backbone (`opda:DocumentEvidence` etc. — the envelope already exists; B is reuse). S023-EVIDENCE §B-pattern-2 ("one result structure × ~24 datasets, recursively nested") + attack-line 3 (`riskIndicator`s are data consumers want). BBC `/programmes/` — a `po:Broadcast`'s discriminating facets are dereferenceable, not buried in a generic item.

---

## Q5 — Checklist (D) + enums (C)

### Attack
**C (enums → SKOS) — no standing to attack; it is ratified law.** ODR-0011 §Decision already mandates each enum → `skos:ConceptScheme` with shared reused properties. The EVIDENCE's "54 value-sets → ODR-0011 SKOS schemes" is *executing* an accepted ODR, not proposing. I **WITHDRAW** any objection — attacking C would be attacking ODR-0011, which is closed. (My only footnote: the *shared property* per value-space must still carry `dct:source` so the round-trip recovers which form-question used which enum — but that is Q6, not a C-specific objection.)

**D (fixtures, ~315 = 89 items × 3) — the sharpest concrete hold.** "A SKOS scheme of fixture items + 3 props (`inclusionStatus`, `comment`, `price`), reference data" is elegant and I *want* to sign it. The hold: a fixtures checklist is **not** mere reference data to a consumer — a buyer's solicitor and a lender's surveyor query *per-item inclusion and per-item price*: "is the boiler included, and at what price?" Under "89 items in a SKOS scheme + 3 shared props on the instance," that question is answerable **iff** the fixture item (`boilerImmersionHeater`) is a dereferenceable `skos:Concept` AND the instance binds `inclusionStatus`/`price` *to that concept* recoverably. If the scheme is just labels and the price floats on a generic instance keyed by path, we are back to path-grain (acceptable for chattels — I concede chattels are lower-stakes than G) — **but** the EVIDENCE's own attack-line 3 flags the fixtures £-prices as "data consumers want," and I verified `priceInformation.price` (the headline price, **not** a chattel) is one segment away. So D's hold is really Q2's mis-bin guard wearing a checklist costume: **keep the genuine price out of D, and make the chattel item a dereferenceable concept so per-item price/inclusion is recoverable.**

### Vote
**C: FOR** (executing ODR-0011 — withdraw any objection). **D: FOR** the SKOS-scheme + 3-props treatment **AGAINST** 315 datatype properties — *conditional* on (a) `priceInformation.price` excluded from D (it is G), and (b) fixture items being dereferenceable concepts so per-item inclusion/price is queryable.

### Withdrawal condition
**C: WITHDRAWN** (ratified). **D: WITHDRAW** once the binning rule excludes the headline price from D (Q2 condition) and a worked query returns "boiler: included, £X" against the fixture-item scheme. Until then, **HOLD** narrowly on D's two conditions.

### Citation
ODR-0011 §Decision (enum → `skos:ConceptScheme` — C is closed). S023-EVIDENCE §B-pattern-1 (fixtures = 89 items × 3 fields) + attack-line 3 (£-prices are data consumers want). Canonical dict (`priceInformation.price` co-segmented with 89 chattel prices — the D/G boundary risk).

---

## Q6 — Coverage, round-trip & residual scope (my crux)

### Attack — does the round-trip pass on a collapsed TBox, and what is the *real* residual?
This is the question my whole role exists to press, so I press it on the proposition's **own cited authority**, not on generic best-practice.

**The round-trip test, as ODR-0008 actually defines it, is endangered by collapse.** ODR-0008 §Operational specs (line 68, verbatim): the round-trip equivalence SPARQL test "verifies the **per-property + per-overlay `dct:source` array** recovers the data-dictionary cross-context table." Read it carefully: the test's *substrate* is **per-property** provenance — each `opda:` property carries an array of `dct:source` triples, one per overlay leaf-path, and the test reconstructs the cross-context table from those arrays. Now collapse 407 disclosure tails into one `opda:disclosureDetail`. The `dct:source` array on that single property is no longer "the per-overlay sources of *one concept*"; it is "the sources of **407 different questions**." Recovering *which form-question* a given value answers from a 407-deep undifferentiated `dct:source` array on a shared property is **not** what the test does — the test assumes one property ≈ one reconciled concept (ODR-0008 §Q1a "declare-once reconciles the *same* attribute across *overlays*, **not** every base leaf sharing a final segment" — ADR-0028 §14 states this explicitly). **Collapse beyond reconciliation breaks the test's stated mechanism.** The proposition's defense — "path/`dct:source` instance-addressing + SHACL-profile per-form structure (ODR-0008 §Q7a)" — is *plausible* but it is a **different round-trip than the one ODR-0008 specifies**: it recovers the form by walking the SHACL profile's `sh:path` set + the instance, not by the per-property `dct:source` array. That may well work — but it is **unproven**, and ODR-0008's existing CI test does not exercise it. **I demand the proposition exhibit a passing round-trip on a collapsed TBox before "coverage is preserved" is asserted.**

**The two coverage obligations, restated as falsifiable tests (my S021 dissent, made concrete):**
1. **Round-trip (regenerate all 31 forms).** A SHACL profile whose `sh:property` shapes carry `sh:path` + `dct:source` + `sh:order`/`sh:group` (DASH, ODR-0010 §Q4) can regenerate a form **even if** the underlying property is collapsed — *because the profile, not the TBox term, carries the form structure* (ODR-0008 §Q7a pushes per-form variation to the profile). **I concede this is architecturally sound.** What I do not concede is that it is *demonstrated*. The BASPI5 profile today regenerates BASPI5 from **named per-leaf terms**; nobody has regenerated a form from a *collapsed* term set. **Test, don't assert.**
2. **Per-leaf consumer query.** Demonstrated by Q3: the instance path survives, so `boilerImmersionHeater.price` is answerable by path. **I concede this is preserved at path-grain.** The residual loss is term-grain dereferenceability for the *collapsed* categories — acceptable for A/C/D/F, **not** acceptable for G.

**The residual WG scope — is G (~181) the right bounded target?** Mostly yes, and this is the proposition's strongest move: turning "evaluate 935" into "ratify ~5 treatments + curate ~181" is a genuine ~80% reduction in the expensive operation, and I *support* bounding the WG pass. **But "181" is not yet a counted set** (I found phantom `tenureKind`; the count is a projection of an unmade binning). So the residual scope is "**~181, pending a path-aware binning that excludes the mis-bins**" — bounded in *shape*, not yet in *membership*. The right target is correct; the *contents* must be reconciled before the IRIs are minted, because (ADR-0028 §14) they are permanent.

### Vote
**FOR** category-based import preserving coverage via `dct:source`/path + SHACL profiles, **AGAINST** asserting that coverage is preserved **without a passing round-trip test on the collapsed TBox**. I support bounding the WG pass to Category G as the right *shape* of residual scope. I oppose ratifying "coverage preserved" as a *claim* in place of a *test*.

### Withdrawal condition
I **WITHDRAW** my standing completeness-as-a-gate dissent — in full, on the record — the moment **both** hold:
1. A **BASPI5 round-trip test passes on the collapsed TBox** (regenerates BASPI5 from category-collapsed terms + the SHACL profile), and
2. A **worked SPARQL query retrieves a specific collapsed leaf** (`boilerImmersionHeater.price`) **by path**, and a **Category-G leaf** (`currentEnergyRating`) **by dereferenceable term**.

On those two artefacts, coverage is *proven*, not *claimed*, and my S021 dissent is satisfied and I drop it. Until both exist, I **HOLD** — not against the strategy, but against recording "coverage preserved" as ratified fact. (This is a test-not-assertion hold, the mildest possible form: I am asking the proposition to *pass its own gate*, ODR-0008's round-trip, on the new shape.)

### Citation
ODR-0008 §Operational specs line 68 (round-trip test substrate = **per-property** `dct:source` array — the mechanism collapse endangers) + §Q7a (per-form variation lives in the SHACL profile — the architectural basis the proposition relies on, sound but untested-for-collapse). ADR-0028 §14 ("declare-once reconciles the same attribute across overlays, **not** every base leaf sharing a final segment"; permanent unreversible IRIs). My S021 held dissent (completeness-as-a-gate). BBC `/programmes/` round-trip discipline — the view regenerates from the published grain, proven by exercise, not asserted.

---

## Cross-talk

### To Cagle & Knublauch ("flatten it / shapes not TBox") — I concede the spine, I hold the gate

You will argue, as you did at S021 on membership and now on the descriptive layer: the per-form structure belongs in the **SHACL profile** (a closed-world validation artefact), not multiplied into the **TBox** as ~900 datatype properties; SHACL `sh:path` + DASH `sh:group`/`sh:order` carries form regeneration; the TBox holds *concepts*, the shapes hold *structure*. **I concede this is right, and it is the same rule/constraint separation you grounded in SHACL-AF §2 at S021** (a CONSTRUCT/profile is a projection, not a source of truth). Your "flatten it" on A, B, C, F **persuades me** — and I record the movement: my S021 claim "a collapsed TBox cannot answer `boilerImmersionHeater.price`" was **too strong**, because I had not verified that the instance path survives collapse. It does. **I withdraw that specific claim.** The profile's `sh:path` walking the JSON structure is exactly your TopBraid "shapes reference the model, never constitute it," and it is sound.

**Where I hold against you — two places, both about *proof*, not *principle*:**

1. **You assert the profile regenerates the form; ODR-0008's CI test does not yet exercise that on a collapsed TBox.** At S021 you yourself insisted (rightly) that the BASPI5 builder refactor "must emit `baspi5.ttl` byte-for-byte identical — the regression gate that proves the generalisation is behaviour-preserving." Apply your own discipline here: a collapse that changes the TBox term set must **prove** the round-trip is behaviour-preserving by a passing test, not by the architectural argument that it *should* be. Give me the green round-trip on the collapsed terms and I withdraw Q6 entirely. This is your own byte-identity gate, pointed at the descriptive layer.

2. **The TBox/shapes line is not "all structure to shapes" — Category G's genuine concepts (`currentEnergyRating`, `councilTaxBand`, `builtForm`) must stay term-grain in the TBox.** You agree (your whole point is *concepts* live in the TBox). So our only residual gap is **where the line falls** — which is Q2's binning rule. I am not asking you to keep 900 properties; I am asking that the ~181 you'd *also* keep be selected by a **path-aware rule** that demonstrably puts `priceInformation.price` in G and `boilerImmersionHeater.price` in D. Exhibit that rule and we have **zero daylight**.

**Net with Cagle/Knublauch:** I move from "completeness-as-a-gate blocks collapse" to "**collapse is right for A/B/C/D/E/F; the gate is now two tests + one binning rule, not a veto.**" That is a real withdrawal of position, recorded honestly — you persuaded me on the architecture; I hold only until the architecture is *exercised*, which is your own standard.

### To the proposition (for the Queen) — what I am NOT contesting
So the record is clean: I do **not** contest (a) the mechanical 1:1 walk is dead — the build pass killed it and I agree; (b) enums→SKOS (C) — ODR-0011 ratified it; (c) evidence→ODR-0009 (B) — settled; (d) bounding the WG pass to ~G in *shape* — I support it. My live contribution is **three guards**, not a counter-proposal: a **path-aware binning rule** (Q2), a **passing round-trip on the collapsed TBox** (Q6.1), and a **worked per-leaf query** (Q6.2/Q3). Pass those and I have no dissent left to carry.

---

## Scorecard — votes + WITHDRAW/HOLD

| Q | Vote | Withdraw / Hold | Named withdrawal condition |
|---|---|---|---|
| **Q1 Diagnosis** | **FOR** "form-ergonomics, wrong TBox altitude"; **AGAINST** "poor modelling ⇒ drop addressability" | conceded "richness"; **HOLD** (narrow) on "wrong altitude ≠ drop addressing" | Withdraws into Q3/Q6; binds only as a flag, not opposition to the diagnosis. |
| **Q2 Taxonomy A–G** | **ABSTAIN** on triage frame; **AGAINST** boundaries-as-settled | **HOLD** on the bin boundaries | A **path-aware binning rule** (not last-segment) + a *counted* G set (no phantom `tenureKind`); `priceInformation.price`→G by rule. |
| **Q3 Whole/part** | **FOR** collapse A/C/F (+B,E,D per Q4/Q5); **AGAINST** 1:1 walk AND **AGAINST** collapsing G | withdrew "info is lost" (path survives); **HOLD** vs collapsing G / losing instance path | Round-trip passes on collapsed TBox **and** `boilerImmersionHeater.price` retrievable by path → withdraw vs A/C/F; G stays term-grain. |
| **Q4 A/B/E patterns** | **B FOR** (reuse ODR-0009); **A/E FOR** as patterns vs per-leaf | **B WITHDRAW**; **A** narrow hold (parent discriminator); **E HOLD** (`riskIndicator` addressing) | A: parent question preserved as path/`dct:source`. E: worked query "flood `riskIndicator` for property X" against `SearchResult` + peril scheme. |
| **Q5 C/D** | **C FOR** (executing ODR-0011); **D FOR** scheme+3-props vs 315 props | **C WITHDRAWN** (ratified); **D HOLD** (2 conditions) | D: headline price excluded from D (Q2 rule) + "boiler: included, £X" query passes against fixture-item scheme. |
| **Q6 Coverage/round-trip (crux)** | **FOR** coverage-via-`dct:source`/path+profiles; **AGAINST** asserting coverage without a test; **FOR** bounding WG to ~G in shape | **HOLD** — test-not-assertion (mildest form) | (1) BASPI5 round-trip passes on the **collapsed** TBox; (2) worked query: collapsed leaf by **path** + G leaf by **term**. Both ⇒ I drop my S021 completeness dissent in full. |

## The line I hold (one sentence)
**I withdraw the mechanical-walk fight and concede collapse for A/B/C/D/E/F — but I HOLD, in the mildest possible form, that "coverage is preserved" must be a *passing round-trip on the collapsed TBox* + a *worked per-leaf query*, not an assertion, and that the ~181 Category-G set must be chosen by a *path-aware binning rule* that demonstrably keeps `priceInformation.price` (G) out of the chattel bucket (D) before any permanent IRI is minted.**
