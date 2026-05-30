# Council Session 027 (R4) — Fixtures Inclusion-as-Transaction-Mode (Author-only)

- **Date:** 2026-05-30
- **Records:** ODR-0023 R4 — confirm `opda:inclusionStatus` is a **Mode/Relator of the sale transaction**, not a Quality of `opda:Property`. Confirms [ODR-0022](../ODR-0022-descriptive-layer-import-strategy.md) §4; unblocks Category-D emission. **No new ODR** (a confirmation; the commitment realises ODR-0007).
- **Queen:** Author-only (the convening Queen). **DA / Panel:** none. **`consensus-mode`:** `none` (main-thread). **Format:** Author-only (~1 run — the cheapest tier, per the ODR-0023 convening config). **No hive-mind, no team.**

## Context

ODR-0022 §4 asserted (S023, not separately deliberated) that a fixtures-checklist item's **inclusion** ("Included / Excluded / None") is a **Mode/Relator of the sale**, not a datatype Quality of the brick-and-mortar `opda:Property`. R4 confirms this as the ratified basis before the Category-D `FixtureItemScheme` + `opda:inclusionStatus` are emitted, so the inclusion property is not mis-attached. This is a `pattern`-grade commitment that *leans on* ODR-0007 (transaction Relator); it has no credible split (the S023 panel — Kendall + Guizzardi — already established it), so Author-only is the correct tier (ODR-0001 §Format tiers: "recording a decision the methodology or precedent has already settled").

## Decision (confirmed)

**`opda:inclusionStatus` is a property of a transaction-scoped fixtures list, ranging over the `Included/Excluded/None` SKOS value-scheme — a UFO Mode/Relator mediating the *sale transaction* (ODR-0007), NOT a Quality of `opda:Property`.** The decisive test (ODR-0022 §4, restated): *the same boiler is "included" in one sale and absent from the next* — inclusion has no rigid bearer in the brick-and-mortar; it exists only relative to a transaction. Therefore:

1. The **fixture item** (`boilerImmersionHeater`, …) is an Object → a `skos:Concept` in `opda:FixtureItemScheme` (Category D; already emitted as a candidate, 89 items).
2. **Inclusion** is `opda:inclusionStatus` on a **transaction-scoped fixtures-list node** (ODR-0007 territory), `sh:in` the `opda:InclusionScheme` (`Included/Excluded/None`), never `rdfs:domain opda:Property`.
3. `opda:price` reuses a `MonetaryAmount` pattern; `opda:comment` is `opda:disclosureDetail`-grade.

## A9 note

Inclusion-as-Relator is `pattern` content; its full UFO Relator discharge (the sale-transaction Relator binding buyer/seller/property/fixtures) is **owned by ODR-0007** (Transactions & Lifecycle). This session confirms the *binding* (inclusion → transaction, not property) and routes the Relator's identity criterion to ODR-0007; it mints no new TBox term beyond `opda:inclusionStatus` on the transaction-scoped list.

## Consequences

- **Category-D emission is unblocked** (ODR-0022): the generator may now wire `opda:inclusionStatus` to a transaction-scoped fixtures list (not `opda:Property`), over the already-emitted `FixtureItemScheme` + `InclusionScheme`.
- ODR-0023 R4 is **struck** (confirmed). ODR-0022 §4 stands; the build (ADR-0030) gains the inclusion-Mode attachment target.
- A one-line pointer may be added to ODR-0007 (`opda:inclusionStatus` is a sale-transaction Mode); deferred to the next ODR-0007 touch.
