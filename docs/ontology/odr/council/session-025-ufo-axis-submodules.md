# Council Session 025 (R2) — UFO-Axis Sub-Modules (provisional)

- **Date:** 2026-05-30
- **Records:** ODR-0023 R2 (the spawn of **ODR-0008a/b/c** by UFO axis — `property-qualities` / `property-modes` / `legal-estate-attributes`). **No new ODR produced** (verdict: ratify framework, mint nothing).
- **Queen:** Giancarlo Guizzardi (acting) / synthesis by the convening Queen. **DA:** Ian Davis. **Panel:** Dean Allemang (`property-qualities` steward).
- **Voices:** 3 (Allemang, Davis, Queen). **`consensus-mode`:** `agent-fan-out` (no hive-mind). **Format:** Reduced Council.
- **⚠ Provisional — directing-authority gate-override.** R2 is normally GATED on the curated Category-G walk (§Q2a(a)). It was convened under the "run all 4" directive; the **override discharges the *convening* gate, not the substantive §Q2a(a) trigger** (Davis, recorded).

## Context

R2 asks whether to split the Category-G descriptive properties into three UFO-axis sub-modules (ODR-0008 §Q2a(a), naming stewards Allemang/Guizzardi+Pandit/Kendall). The blocker: the curated G walk has not run — only the **~182-name candidate set** exists (ODR-0022/ADR-0030 `descriptive-category-binning.json`), with **no Quality/Mode/Kind partition computed**. So the question is *framework vs instantiation*.

## Verdict — ratify the framework, defer the spawn, mint nothing (2 voices aligned; Davis held on the substantive trigger)

**Allemang** (steward): "FOR the three-axis split *framework* + stewards + a per-axis trigger; defer the a/b/c spawn." His criterion (the §Q6a reasoner-independence test lifted to modules): *"a sub-module spawns only when a named consumer query needs an entailment that holds for that axis and not the others — turning the axis off must change an answer, else it is decorative and MUST NOT spawn."* With zero leaves classified, "the a/b/c spawn would declare what we cannot derive."

**Davis (DA):** AGAINST minting on all three questions, HELD. "The trigger has NOT fired and the data R2 exists to partition does not exist." Affirmative landing: **ratify the framework (3 axes + 3 stewards + per-axis trigger); mint NOTHING.** Per-axis withdrawal condition: a counted UFO-typed leaf-set + a named load-bearing query for that axis.

**Verdict:** **ratify the split framework + criterion + stewards; emit nothing; the ODR-0008a/b/c spawn stays gated** on the curated G walk. This re-affirms ODR-0023's own finding ("running R2 before the G walk would be guessing") and the subtractive programme posture. **Votes:** Q1 (split-framework) FOR-framework / Davis HELD-against-mint; Q2 (per-axis trigger) FOR; Q3 (now vs framework-only) FOR framework-only. Recorded `2-0-0` on *framework*, with Davis's substantive **held-as-live** dissent against any *minting* until the §Q2a(a) trigger fires.

### Load-bearing finding — a binning-rule defect (Davis, verified by the Queen)

Davis, grounding his "the data doesn't exist" attack against `descriptive-category-binning.json`, surfaced a real **G1 binning defect**: the categoriser (`leaf_categoriser.py:225 — if has_enum: → C`) routes **every** enum-bearing leaf to Category C, so the flagship **Quale-in-Region descriptive concepts** — `currentEnergyRating` (EPC band A–G), `councilTaxBand` (A–I), `builtForm`, `tenureKind` — are **mis-routed to C** when ODR-0008 §Q5a makes them **Category G properties whose *range* is a SKOS scheme** ("Quale-in-Region → SKOS scheme; **Quality of `opda:Property`**"). The candidate-G count (182) therefore **undercounts G** (the property-specific Quale attributes are missing) and over-counts C. **Fix required** (ODR-0022 §1 + ADR-0030 §G1): a leaf is Category **G** when it is a genuine Property/estate attribute *even if it carries an enum* — the enum becomes its SKOS *range* (C is for the *reused status* value-spaces — Yes/No, Included/Excluded/None — not for property-specific Quale value-spaces). Routed to ODR-0022/ADR-0030 as a binning-rule correction; the WG curation of G inherits the corrected set.

## Consequences

- ODR-0023 R2 stays **GATED** (framework now ratified; the a/b/c spawn awaits the curated G walk). The roadmap row is updated, not struck.
- **Binning fix** logged against ODR-0022 §1 / ADR-0030 §G1 (enum-bearing Quale attributes are G, not C) — re-run `categorise-leaves` after the fix; the 182 figure is provisional.
- **Resolved (2026-05-30, post-session):** the binning fix is applied — the §Q5a Quale attributes (`currentEnergyRating`, `councilTaxBand`, `builtForm`, `ownershipType`, `centralHeatingFuelType`, `heatingType`) route to **G** before the `has_enum → C` fallback; `categorise-leaves` re-run → candidate-G **182 → 188** (C 159 → 153); full suite + CI green. Davis's substantive §Q2a(a) hold (R2 stays gated on the curated G walk) is unaffected.
- No emission, no new record. Davis's §Q2a(a) substantive hold preserved.
