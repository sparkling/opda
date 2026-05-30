# Session 023 — Gandon + Hendler (web-architecture / RDF pair)

**Panel role:** the URI-economy and web-architecture voice. We test the proposition against two
questions a Linked Data architect asks of *any* vocabulary: *which of these strings is a resource
someone will genuinely dereference or link to?* and *how little formal machinery carries the
domain?* Our verdict is shaped by one fact in the evidence the other panellists may underweight:
the `opda:` namespace is **`https://w3id.org/opda/#`** (`foundation.ttl`) — a **w3id.org permanent
redirect**. Every minted leaf is therefore not a private label but a *published, permanent,
community-promised identifier*. That raises the bar for minting and makes the S021 walk a
web-architecture commitment, not an internal emission detail.

We mark `[Gandon]` / `[Hendler]` only where we differ; otherwise the position is joint.

---

## Q1 — Diagnosis: conceptual richness, or form-ergonomics + repeated micro-structure?

It is **overwhelmingly form-ergonomics and repeated micro-structure**, not conceptual richness —
*and* PDTF's granularity is correct-for-a-form-transport but wrong-altitude-for-a-TBox. These are
not in tension; they are the same observation from two layers.

The Linked Data principles (Berners-Lee, *Linked Data*, 2006) say *use URIs as names for things* and
*make them dereferenceable so people can look up those names*. The operative word is **things**. A
JSON path like `…basicFittings.boilerImmersionHeater.price` is not a *thing*; it is the £-cell of one
row of one checklist on one form (S023-EVIDENCE §B: `price` recurs in 99 distinct leaves, `details`
in 269, `comments` in 96). The schema is doing exactly what a transport schema should — giving every
form cell a stable JSON pointer so a UI can bind to it. That is form-ergonomics, and it is *good*
JSON design. It is simply not ontology: RDF 1.1 Concepts (W3C Rec, §1.1, §3.1) defines an IRI as
denoting *a resource in the world*, and the world does not contain 269 distinct "please-give-details"
resources — it contains **one** disclosure-elaboration relation, instantiated 269 times by 269
different subjects.

So the "explosion" is an artefact of counting *paths* (cells) where one should count *predicates*
(relations). S023-EVIDENCE §B confirms the arithmetic of this directly: 1,493 annotated leaves
collapse to **337 distinct final segments**, of which 241 occur once and ~16 generic tails cover 56%
of all leaves; `yesNo` is "referenced 1,135 times — *not 1,135 unique concepts*" (the project's own
`audit.json`). Conceptual richness would show as *many distinct names each used once meaningfully*;
what we actually see is *few names used thousands of times* (structure) plus *a long tail of
genuine-but-modest descriptive facts* (Category G). "A Little Semantics Goes a Long Way" (Hendler,
2003) names the failure mode precisely: mistaking the *volume* of a data source for the *semantics*
it carries. 935 flat properties would add bytes and IRIs; they would not add a single inference,
constraint, or link a consumer could not already make from ~181 real predicates plus the schemes.

`[Hendler]` One caution so we are not misread as dismissing the data: "wrong altitude for a TBox"
is *not* "the schema is bad." PDTF is a fine **interaction/transport** model. The error would be
*lifting it verbatim* — projecting a form's row-and-cell ergonomics into permanent web identifiers.
The fix is altitude, not blame.

**Vote:** FOR (the proposition's diagnosis — form-ergonomics + repeated micro-structure, wrong
TBox altitude).

---

## Q2 — The category taxonomy A–G as the decision-cut

The A–G cut is **the right decision-cut**, because it sorts leaves by *the only question that
governs minting*: **will a consumer dereference or link to this as a thing?** That is the
web-architecture question, and A–G is essentially a partition by answer:

- **A (disclosure tails), B (evidence envelope), C (status enums), D (checklist items), E (result
  structures)** — *no consumer links to the leaf*; they link to the **pattern** (a property), the
  **scheme** (a concept), or the **class** (a result/document). These earn URIs at the
  *pattern/scheme/class* grain, not the *leaf* grain.
- **F (address/contact/geo)** — already minted upstream; reuse, do not re-mint (the cardinal Linked
  Data sin is minting a second URI for a thing that already has one — *SWWO* 3rd ed., the
  reconciliation chapters).
- **G (genuine descriptive facts)** — *consumers do link to these* (`councilTaxBand`, `builtForm`,
  `currentEnergyRating`). These earn a permanent `opda:` IRI each.

On the **UFO meta-category leaning** per category, we defer to Guizzardi/Pandit for the formal
realizing-record routing and offer only the web-architecture-relevant collapse: A is `rdfs:comment`-
grade prose (no quality structure worth a quale-region), C/D/G value-spaces are **Quale-in-Region
over a SKOS scheme** (the scheme *is* the region — ODR-0011 already says so), B/E are **Objects**
(Document, SearchResult) because they bear `prov:wasGeneratedBy` and a lifecycle (ODR-0008 §Q4a's
own promotion test), and F is settled elsewhere. The one boundary we want sharpened in Q2 is
**D-vs-G**: a fixture chattel (`boilerImmersionHeater`) is a *member of a controlled list* (a
`skos:Concept` in a fixtures scheme), **not** a descriptive Quality of the Property — so it belongs
in D (scheme), not G (per-leaf property). Keeping that boundary crisp is what stops D's 315 leaves
leaking into the curated G pass.

**Vote:** FOR (A–G is the right decision-cut; route per UFO leaning as above).

---

## Q3 — Whole or part? (the core decision)

**Import by category. AGAINST the S021 1:1 mechanical walk.** This is the question our seat exists
to answer, and the answer follows directly from the namespace being `w3id.org` permanent.

Three web-architecture arguments, each with a named source:

1. **A URI is for a resource you genuinely want to refer to** (Gandon's formulation of the Linked
   Data naming discipline; RDF 1.1 Concepts §3.1 — an IRI *denotes a resource*). ~900 of the ~935
   leaves are not resources anyone refers to; they are cells. Minting a permanent w3id IRI for a
   cell is minting a name for a non-thing. The build pass (S023-EVIDENCE §D) demonstrated the
   concrete failure: naive last-segment naming collapses 1,521 distinct leaves into ~351 *colliding*
   permanent IRIs — i.e. the mechanical walk cannot even *produce* 935 well-formed names without
   hand-disambiguation, at which point it is not mechanical and the "90%-mechanical" premise
   (ADR-0028, S021) is simply false.

2. **Permanence makes mis-minting unreversible** (S023-EVIDENCE §D: "the ~900 IRIs would be
   permanent and unreversible"; w3id.org's social contract is *cool URIs don't change*,
   Berners-Lee, *Cool URIs*, 1998). A flat-property scheme auto-derived from a form tree bakes the
   *form's shape* into the *permanent web identity layer*. When the form changes (and TA6/BASPI
   forms change), you are left with permanent IRIs named after a transport artefact that no longer
   exists. You cannot retract a w3id IRI without breaking every consumer who linked to it. So the
   cost of mis-minting is not "a messy TBox"; it is "a permanent public liability." Mint few, mint
   deliberately.

3. **"A Little Semantics Goes a Long Way"** (Hendler, 2003): the lean TBox *carries the same domain*.
   ~181 G-predicates + ~5 structural patterns + the ODR-0011 SKOS schemes + the ODR-0009 evidence
   classes let a consumer ask every question the 935-leaf version answers — *because the answers live
   in the schemes and the instance data, not in the predicate count*. Adding the other ~754 flat
   properties buys zero additional inference or constraint. By Occam-for-vocabularies, the bytes are
   pure liability.

`[Gandon]` The honest counter to record: 1:1 import is *operationally simpler to generate* (one
loop). But "simpler to emit once" must lose to "simpler to live with forever" when the artefact is
permanent. The walk trades a one-time generator convenience for a permanent maintenance and
naming-collision burden. That is the wrong trade for a `w3id.org` namespace.

**Vote:** AGAINST the 1:1 walk / **FOR** category-based import.

---

## Q4 — Recurring micro-patterns (A, B, E)

**Model each as a reusable pattern (property / class), not per-leaf datatype properties.** This is
the case where "one URI per concept" pays off most visibly.

- **A — disclosure tail (~407 leaves).** **One** reusable annotation predicate (e.g.
  `opda:disclosureDetail`, range `xsd:string`), attached to whatever subject the question is about,
  with the specific question carried by `dct:source` to the form path. RDF 1.1 Concepts §3.4: a
  literal-valued property *relates a subject to a value*; the subject already disambiguates "details
  of *what*." 269 `opda:…Details` IRIs would be 269 names for one relation — exactly the synonym
  proliferation *SWWO* (3rd ed.) teaches you to reconcile away. `[Hendler]` This is genuinely
  `rdfs:comment`-grade; do not over-formalise a prose slot into a typed quality.

- **B — evidence/attachment envelope.** **Reuse ODR-0009 Evidence + PROV-O** (~3 properties on a
  Document/evidence node). An attachment is an Object that *was generated by* an activity and *has a*
  filename/mediatype — PROV-O (W3C Rec) and ODR-0009 already model this. Minting per-leaf
  `attachments`/`fileName` datatype properties would re-describe, per form, a structure the platform
  already has one URI for.

- **E — search/risk-result structure (~200 leaves).** **One `opda:SearchResult` /
  `opda:RiskAssessment` class** with ~6 properties (`riskIndicator`, `actionAlertRating`, `result`,
  `summary`, `recommendations`, `datasetAttribution`), instantiated per dataset, with the *peril/
  dataset* identified by a **SKOS scheme** member (flooding, radon, coal…). S023-EVIDENCE §B
  confirms this is literally "one result structure × ~24 datasets, recursively nested." Per-leaf
  import would mint the same six predicate-names ~24 times. The class earns ~6 permanent IRIs; the
  datasets earn scheme-concept IRIs; the ~200 leaves earn none. This is also the *more powerful*
  model: a consumer can ask "give me every dataset whose `actionAlertRating` is High" across all
  perils uniformly — impossible if each peril is its own flat predicate set.

**Vote:** FOR (reusable pattern/class for A, B, E; reuse ODR-0009 + PROV-O for B).

---

## Q5 — Checklist + enums (D, C)

**D — fixtures (~315 leaves / 89 items): a SKOS scheme of fixture *items* + ~3 shared properties
(`inclusionStatus`, `comment`, `price`).** **C — the 54 enum value-sets: ODR-0011 SKOS schemes with
one shared reused property per value-space.** FOR both; AGAINST 315 / 378 datatype properties.

ODR-0011 (accepted S011) already decided the enum question: *"a mechanical rewrite to bare strings is
wrong… each enum becomes a SKOS concept scheme"* — because a controlled vocabulary needs a
*dereferenceable URI, a governable label, and a definition* per value. The fixtures checklist is the
same shape one level up: 89 chattels are a **controlled list of items**, i.e. a SKOS scheme whose
members are `boilerImmersionHeater`, `radiatorsWallHeaters`, …, each a `skos:Concept` you *can*
dereference and link to — and then *three* properties (`inclusionStatus` ranging over the
`(Excluded,Included,None)` scheme, `comment`, `price`) carry every chattel's data. That is **~3
permanent property IRIs + 89 scheme-concept IRIs**, versus **315 flat datatype properties** that
would each have to be named past the §D collision problem.

The web-architecture clincher: S023-EVIDENCE §B reports **809 leaf names appear in ≥2 schemas; 393
in ≥3** — and the *enums* reduce 378 leaves to **54 value-sets**. Cross-schema redundancy at that
scale is *exactly* the problem Linked Data solves with **one URI per concept** (the reconciliation
core of *SWWO*). Minting per-form/per-leaf properties would *re-create* the redundancy in the
permanent IRI layer that the schemes are there to eliminate. One scheme, reused everywhere, is the
whole point.

`[Gandon]` Concede the boundary to Davis here: the *value-space* `(Excluded,Included,None)` is one
scheme reused 89×; do not accidentally mint 89 *copies* of it. One scheme, referenced by one shared
`inclusionStatus` predicate, target-restricted per form via SHACL `sh:in` (ODR-0008 §Q7a enum-union
clause already specifies exactly this).

**Vote:** FOR (D → fixtures-items SKOS scheme + 3 props; C → ODR-0011 SKOS schemes + shared reused
property per value-space).

---

## Q6 — Coverage, round-trip & residual scope (Davis's crux)

**Category import still satisfies BASPI5 round-trip and consumer queries without 1:1 leaves — and
Category G (~181 distinct names) is the right bounded per-leaf target.** FOR the proposition;
this is the question where we *most* want to be precise, because Davis's completeness concern is
legitimate and the answer must be mechanism, not assertion.

**Round-trip is not a TBox-predicate-count property; it is an instance-addressing + profile-shape
property.** Two mechanisms, both already ratified, carry it:

1. **Instance addressing via path + `dct:source`** (ODR-0008 §Q3a: per-property + per-overlay
   `dct:source` array; ADR-0028's retained `dct:source` emission). A consumer who asks for
   `boilerImmersionHeater.price` is answered by *the instance triple* `(thisFixture, opda:price,
   1200)` where `thisFixture` is the `boilerImmersionHeater` scheme-concept — the form path is
   recoverable from `dct:source`. RDF 1.1 Concepts §1.2: *the data is the instance graph*; the TBox
   names relations, it does not need a distinct predicate per addressable cell. The cell is addressed
   by *(subject, predicate)* = *(fixture-item, price)*, which the scheme+3-props model supplies
   exactly.

2. **Per-form structure via SHACL profiles** (ODR-0008 §Q7a; ODR-0010 overlay profiles). BASPI5's
   *shape* — which fields, in which order, required or not — lives in the profile shape, not in the
   base predicate set. ODR-0008 §Q7a already pushed *all* per-form variation to the profile layer and
   added three CI tests asserting base TBox carries no `sh:minCount`. So "regenerate the 31 forms" is
   a *profile-replay* operation over a lean base — which is the architecture ODR-0008 was *designed*
   to produce. The walk would not improve round-trip; it would just duplicate, in the base, structure
   the profiles already own.

**Therefore the answer to Davis's two sub-tests is yes:** (a) BASPI5 round-trips because the profile
shape + instance graph reconstruct it; (b) the specific-leaf query is answered by the
*(scheme-concept, shared-property)* instance triple. *Neither requires 935 base predicates.* The
load-bearing caveat — and this is our genuine agreement with Davis — is that **the scheme-concept
inventory must be complete**: every fixture chattel, every peril/dataset, every enum value must be a
minted `skos:Concept`, or the round-trip *does* lose a cell. Collapsing leaves is safe **only because
the things consumers address are re-homed as scheme members and class instances, which keep their own
URIs.** Category import is not "mint less and lose addressability"; it is "mint at the *right grain*
so addressability is preserved with ~5× fewer permanent IRIs."

**Residual WG scope:** **Category G — ~181 distinct names — is the right bounded per-leaf target**,
and our one *expansion* on the proposition (this is our Davis-aligned check against
*over*-collapsing): G must be **generous at its edges**. If a leaf is *plausibly* a thing a consumer
will link to and ask about as a first-class Property fact, it belongs in G even if it superficially
looks like a tail. Under-minting a genuine concept is as much a web-architecture error as
over-minting a cell — "a URI is for a resource you genuinely want to refer to" cuts *both* ways. So:
curate the ~181; and treat the A/D/G and E/G boundaries as *erring toward G* when a leaf is genuinely
dereference-worthy. That keeps the expensive WG pass bounded (~181, not 935) *without* amputating a
real concept.

**Vote:** FOR (category import satisfies round-trip + queries via path/`dct:source` + SHACL profiles;
Category G ≈181 is the right bounded target, kept generous at its edges).

---

## Cross-talk

**@Davis (DA).** We agree with you more than the tally will suggest, and we want the agreement on
record precisely so the disagreement is narrow.

**Where we agree.** Your crux — *completeness-as-a-gate* — is correct, and a careless collapse would
fail it. A URI **is** good for a thing a consumer refers to; that is the whole basis of our Q6
position. And your "answer a consumer who asks for `boilerImmersionHeater.price`" test is exactly the
test we hold the category model to. We also adopt your check explicitly: Category G must be
**generous**, and the round-trip is safe **only if** every addressed cell is re-homed as a minted
scheme-concept or class instance that keeps its URI. If the scheme inventory is incomplete, you are
right and we are wrong. So we are *with* you on the gate.

**Where we differ — and it is one word: "every."** Your S021 dissent treats *every leaf* as a thing
a consumer refers to, and so demands a flat predicate per leaf as the completeness guarantee. We say:
**the thing the consumer refers to is the fixture-item, the peril, the enum value, the
Property-fact — not the path-cell.** `boilerImmersionHeater.price` is answered by *(the
`boilerImmersionHeater` concept, the shared `price` property)* — a *(subject, predicate)* pair that
preserves full addressability with **one** `price` predicate, not 99. Round-trip is carried by the
instance graph + `dct:source` + the SHACL profile (ODR-0008 §Q3a/§Q7a — *your own* ratified
mechanisms), not by predicate multiplicity. So completeness does **not** require 1:1 leaves; it
requires a complete *scheme/class inventory* plus complete *profile shapes*. That is a gate we can
both hold — and it is satisfiable with ~181 predicates instead of ~900 permanent w3id IRIs.

The build pass settles the operational half of it in your favour-of-caution direction anyway: the
1:1 walk *cannot* be done mechanically (1,521 leaves → ~351 colliding IRIs, S023-EVIDENCE §D), so the
choice was never "clean 1:1 vs lossy collapse." It is "hand-disambiguate 900 permanent names" vs
"curate ~181 and let schemes + profiles carry the rest." On completeness *and* on web-architecture
hygiene, the second wins — and it still passes your gate.
