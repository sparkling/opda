# Session 023 — Shared Evidence Pack (verified, reproducible)

**For:** every Council teammate. Deliberate over THESE numbers — they are computed from the canonical corpus and reproducible. Do not re-derive divergent figures; if you spot-check, use `source/00-deliverables/semantic-models/data-dictionary-canonical.json` (8,458 entries, 16 canonical schemas). Cite this pack as "S023-EVIDENCE".

## The proposition under review

> **Adopt a category-based descriptive-layer import strategy.** Classify the base PDTF descriptive leaves into a small set of **property categories**; for each category decide a modelling *treatment* (collapse-to-pattern / map-to-SKOS-scheme / promote-to-class / reuse-upstream / curate-per-leaf); **reserve expensive per-leaf WG evaluation for the one category that is genuinely conceptual (Category G)**; and do **NOT** import the ~935/1,493 leaves 1:1 as flat `owl:DatatypeProperty`s (the S021 "mechanical 935-leaf walk").

This revisits the S021 verdict (execute the mechanical 935-leaf walk) and the ADR-0028 framing (≈90% mechanical) in light of what the leaves actually are. ODR-0008 (`Declare-once-reconcile-overlays`, accepted S008) is the standing pattern; this session decides the *granularity and import strategy* under it.

## A. The corpus (canonical, deduplicated — `audit.json`)

- **16** canonical v3 schemas. Base = `pdtf-transaction.json`. (Excluded by the May-2026 audit: `combined`, `skeleton`, and superseded `baspi4`/`nts`/`ntsl`.)
- Base `pdtf-transaction`: **4,795** path entries → **3,595 true leaves** (a "true leaf" = a path that is not a parent of any other path) → **1,493 annotated true leaves** (carry a `title`).
- **1,557** unique leaf *names* across all schemas; **885** unique *annotated* leaf names in the base. (`data-dictionary.md` headline reports "1,556 unique leaves; **935** with semantic annotation" from the prior extraction; canonical recomputation gives 885 — same order, same story. "935" is the figure in circulation.)
- Only **164** base leaves carry a free-text `description`; **2,183** carry a `title`. **The business glossary does NOT define the descriptive properties** — it is 54 OPDA trust-framework/API terms + 554 SKOS concepts skewed to identity/VC/DID. Semantic meaning of `builtForm`, `councilTaxBand` etc. lives in the schema `title` (short) — rarely a real definition.

## B. The leaf explosion is repeated micro-structure, not concepts

Among the **1,493 annotated true leaves**, the final path-segment collapses to **337 distinct names**; **241 occur exactly once**. The top segments are generic:

| final segment | count | what it is |
|---|---|---|
| `details` | 269 | free-text "please give details" tail of a yes/no question |
| `price` | 99 | the £ field of a fixtures-checklist item |
| `comments` | 96 | free-text comment tail |
| `isIncludedExcludedOrNone` | 89 | fixtures-checklist inclusion status |
| `attachments` | 82 | evidence-envelope (usually an array) |
| `summary`,`riskIndicator`,`actionAlertRating`,`result`,`recommendations`,`datasetAttribution` | ~24 each | the six fields of a **search/risk-dataset result**, repeated per dataset |
| `line1/line2/town/postcode` | 17 each | address sub-fields |

**56% of annotated leaves (840/1,493) are one of ~16 generic recurring tail segments.** The project's own `audit.json` already filters these as "reusable patterns": `attachments, comments, description, details, isIncludedExcludedOrNone, supportingDocuments, yesNo, …` — and records `yesNo` is "referenced **1,135 times**. Not 1,135 unique concepts."

**Enums:** 378 annotated leaves carry an enum, but only **54 distinct value-sets**. Top reused: `(Excluded,Included,None)`×89, `(Attached,To follow)`×79, `(No,Yes)`×77, `(Attached,Not applicable,To follow)`×37, `(Fitted,Freestanding)`×11.

**Cross-schema redundancy:** **809** leaf names appear in ≥2 of the 16 schemas; **393** in ≥3. (`yesNo`×12, `details`×11, `address`×10, `mainsWater`/`drainage`/`water`×8.) This is the spanning-leaf reconciliation ODR-0008 already flagged.

### Three confirmed structural patterns (sampled from raw paths)

1. **Fixtures & fittings = a flat chattel checklist (315 annotated leaves).** `…basicFittings.boilerImmersionHeater.{isIncludedExcludedOrNone, comments, price}`, `…radiatorsWallHeaters.{…}`, `…nightStorageHeaters.{…}` — **~89 chattel items, each repeating the same 3 fields.** Not 315 concepts: it is a *controlled list of items* × 3 fields.
2. **Searches / environmental = a repeated risk-dataset result (≈164 leaves under `environmentalIssues`, more under `localSearches`).** `…flooding.floodRisk.{riskIndicator, actionAlertRating, result, summary, recommendations, datasetAttribution}` then the same six again under `…riskSubcategories[]`. **One result structure × ~24 datasets**, recursively nested.
3. **Disclosure pattern (80 parent nodes).** A question + a generic `details` (and often `attachments`) tail: `isListed.{details, attachments}`, `sprayFoamInsulation.{details, attachments}`, `buildingSafety.{details, attachments, workToBeDone, …}`. The 269 `details` are the *same* free-text slot, 269 times.

## C. The proposed category taxonomy (the cut to debate)

Counts are of the 1,493 annotated true leaves (approximate; boundaries are what Q2 debates).

| Cat | Name | ~leaves | What it really is | Proposed treatment | UFO leaning (debate in Q2) |
|---|---|---|---|---|---|
| **A** | Disclosure / free-text tails (`details`,`comments`,`summary`) | ~407 (27%) | one generic "elaborate in prose" slot per question | **one** reusable annotation property (e.g. `opda:disclosureDetail`), NOT per-question | Quality/qua-text, or just `rdfs:comment`-grade |
| **B** | Evidence / attachment envelope (`attachments`,`fileName`,doc metadata) | small as scalar leaves (arrays/enums absorb most) | a generic document/evidence envelope | **reuse ODR-0009 Evidence + PROV-O**; ~3 props | Object (Document) |
| **C** | Reused status enums (Yes/No, Included/Excluded/None, Attached/To-follow) | 378 → **54 value-sets** | reused enumerated value-spaces | **ODR-0011 SKOS schemes**; one shared property per value-space | Quale-in-Region |
| **D** | Checklist items (fixtures & fittings chattels) | ~315 (89 items×3) | a controlled list of *items* | **SKOS scheme of fixture items + ~3 props** (`inclusionStatus`,`comment`,`price`); reference data | Object/individual, or Quality |
| **E** | Repeated report/result structures (search/risk datasets) | ~200 | one result class × ~24 datasets | **a `SearchResult`/`RiskAssessment` class (~6 props) + a peril/dataset scheme** | Object + Quality, prov-bearing |
| **F** | Identity / address / contact / geo sub-fields (`line1`,`postcode`,`email`,`lat`,`lng`) | ~133 (9%) | already modelled upstream | **reuse ODR-0015 (Address), ODR-0006 (Agents); geo deferred** | — (settled elsewhere) |
| **G** | **Genuine descriptive attributes** (`builtForm`,`yearOfBuild`,`currentEnergyRating`,`councilTaxBand`,`numberOfFloors`,`tenureKind`,`centralHeatingFuelType`…) | **352 instances → 181 distinct names** | the real per-Property/LegalEstate facts ODR-0008 envisaged | **the curated per-leaf walk** — the only category warranting per-leaf WG evaluation | Quality / Quale-in-Region / Mode (per leaf) |

**Headline:** of ~1,493 annotated leaves, **only ~181 distinct names (~12%) are genuine descriptive concepts** (Category G). The other ~88% are structure, enums, reference-data, or already-modelled. Category-based import collapses "evaluate 935 leaves" → "**ratify ~5 structural treatments + curate ~181 G-leaves**" — an ~80% reduction in the expensive operation.

## D. Why this matters (the tension for the panel)

- **S021** (Queen Kendall, DA Davis) verdict: *execute the mechanical 935-leaf walk* — every annotated leaf → one flat `owl:DatatypeProperty`. **ADR-0028** assumed it ~90% mechanical.
- The **build pass (2026-05-30)** found it is **not** mechanical: no leaf→term map exists; the existing ~23 descriptive properties were hand-curated; naive last-segment naming collapses 1,521 distinct leaves into ~351 *colliding permanent IRIs*; the ~900 IRIs would be permanent and unreversible. Henrik deferred P2 to "a curated WG pass."
- **This session asks the prior question the build exposed:** before curating, *what should be imported at all, and at what granularity?* Is wholesale 1:1 import even the right target, or does the category structure say "collapse most, curate few"?
- **Davis's standing dissent (DA, held-as-live from S021):** *completeness-as-a-gate* — a collapsed TBox may fail to (a) regenerate all 31 forms (BASPI5 round-trip, the MVP gate) or (b) answer a consumer who asks for a specific leaf (e.g. `boilerImmersionHeater.price`). The category strategy must answer: does collapsing lose round-trip fidelity or consumer addressability? (Counter: the `dct:source`/path carries instance addressing; SHACL profiles carry per-form structure; ODR-0008 §Q7a already pushes per-form variation to the profile layer.)

## E. The six questions (vote FOR/AGAINST/ABSTAIN the proposition facet; tally N-M-K)

- **Q1 — Diagnosis.** Is the leaf explosion *conceptual richness* or *form-ergonomics + repeated micro-structure*? Is PDTF's granularity "poor modelling," or correct-for-a-form-transport but wrong-altitude-for-a-TBox?
- **Q2 — The category taxonomy.** Are categories A–G the right decision-cut for import? Refine boundaries; state the UFO meta-category leaning per category (so each routes to the right realizing record).
- **Q3 — Whole or part? (the core decision).** Import all annotated leaves 1:1 as flat datatype properties (S021 mechanical walk), OR import by category (collapse A–F to patterns/schemes/classes/upstream-reuse; per-leaf only G)?
- **Q4 — Recurring micro-patterns (A, B, E).** How to model the disclosure tail, the evidence/attachment envelope, and the search/risk-result structure — reusable property/class patterns (reuse ODR-0009 Evidence; a `RiskAssessment`/`SearchResult` class) vs per-leaf datatype properties?
- **Q5 — Checklist + enums (D, C).** Fixtures & fittings (~315 leaves / 89 items): reference-data SKOS scheme + ~3 props, a `FixtureItem` class, or 315 datatype properties? And the 54 enum value-sets → ODR-0011 SKOS schemes with shared reused properties?
- **Q6 — Coverage, round-trip & residual scope (Davis's crux).** Does category-based import still satisfy BASPI5 round-trip + consumer queries WITHOUT 1:1 leaves, given path/`dct:source` instance-addressing + SHACL-profile per-form structure (ODR-0008 §Q7a)? And what is the residual WG-curation scope — is Category G (~181 distinct names) the right, bounded per-leaf target?

## F. Citation discipline (ODR-0001 §Citation grounding)

Ground every position in a **named** source: a W3C Rec/Note + section; an OMG/FIBO doc; a book you authored + chapter; a peer-reviewed paper; or a documented deployment you led. "Best practice" without a named source does not count. The Queen verifies during synthesis.
