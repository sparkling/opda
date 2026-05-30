# Session 024 (R1) — Authority-Retrieved Artefacts — Shared Evidence

**Council:** R1 of the ODR-0023 roadmap. Produces **ODR-0008d — Authority-Retrieved Artefacts** (spawned per ODR-0008 §Q2a(b); fired by ODR-0022 Category E). `agent-fan-out`; Full-lean; Queen Kendall. Cite this as **S024-EVIDENCE**.

## Proposition

> Model the **Authority-Retrieved Artefact family**: give the five already-ratified classes (`opda:Search`, `opda:Survey`, `opda:EPCCertificate`, `opda:Valuation`, `opda:Comparable` — emitted today as *bare classes* with identity-key SHACL shapes) their **internal property structure**; mint the **new `opda:RiskAssessment` class** for the per-peril search/environmental result; and mint a **first-class peril/dataset SKOS scheme**. Hang the family off ODR-0009 PROV-O (`prov:wasGeneratedBy` the search/authority provider). Discharge each class's A9 UFO meta-category + identity criterion.

## Verified data (reproducible from `data-dictionary-canonical.json` + `opda-descriptive*.ttl`)

- The **six-field result block** — `riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution` — recurs across **exactly 24 parents = 12 environmental perils × 2** (the peril + its `riskSubcategories[]`): flooding, coalMining, nonCoalMining, radon, groundStability, contaminatedLand, coastalErosion, climate, energy, infrastructure, planning, transportation.
- Plus `localSearches` (185 annotated leaves — CON29-style local-authority results) and `valuationComparisonData` (23 leaves — the Comparable/Valuation evidence).
- The **five §Q4a classes are already emitted** as bare classes + identity-key shapes; `opda:RiskAssessment` does **not** exist; there is **no peril SKOS scheme** yet.
- These are **authority-retrieved**: produced by a search provider / data authority (Groundsure, Landmark, the Coal Authority, the local authority), so each bears provenance (who/when) + a lifecycle (issued / superseded / re-run) — the two criteria ODR-0008 §Q4a uses for class promotion.

## Kendall's four-way (held-as-live from S008 §Q2a) — the structural alternatives to adjudicate

1. **(a) Flat datatype-bag** — the six fields as flat datatype properties on `opda:Search` (no `RiskAssessment` class). Loses the per-peril uniformity + cross-peril query.
2. **(b) `RiskAssessment` class + peril SKOS scheme** — one class (~6 props) instantiated per peril, the peril a dereferenceable `skos:Concept`. (The S023-favoured shape.)
3. **(c) Per-peril subclasses** — `FloodRisk`, `CoalMiningRisk`, … as 12 OWL subclasses of a `RiskAssessment` parent.
4. **(d) Reuse `opda:Search`** — fold the result structure into the existing `Search` class as a structured datatype, no new `RiskAssessment`.

## Questions (vote FOR/AGAINST/ABSTAIN per question; tally N-M-K)

- **Q1 — `RiskAssessment` as a class?** Distinct `opda:RiskAssessment` class (UFO: Object / information-artefact, prov-bearing) vs a structured datatype on `Search` (alternative d). What is its identity criterion?
- **Q2 — the peril/dataset axis.** A first-class **12-member SKOS scheme** (dereferenceable concepts) vs 12 OWL subclasses (alternative c) vs an opaque string. (S023: a lender's offer condition *names* the coal-mining search — the axis must be queryable.)
- **Q3 — one family class or two?** One `RiskAssessment` for both environmental-search and local-authority (CON29) results, or two distinct classes?
- **Q4 — the `riskSubcategories[]` recursion.** Self-referential `RiskAssessment` (a result bearing sub-results), or a flat sub-result list?
- **Q5 — provenance + IC + the five existing classes' internals.** Hang the family off ODR-0009 PROV-O (`prov:wasGeneratedBy`) per §Q4a; state the UFO category + IC for `RiskAssessment` and for `Search`/`Survey`/`EPCCertificate`/`Valuation`/`Comparable`.
- **Q6 — the four-way.** Which of Kendall's (a)–(d) wins, and on what criterion?

Citation discipline: ODR-0001 §Citation grounding (named source per position).
