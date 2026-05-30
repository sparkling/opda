# Council Session 026 (R3) — Building/Room Class Promotion (provisional)

- **Date:** 2026-05-30
- **Records:** ODR-0023 R3 (the conditional `opda:Building` / `opda:Room` class promotion, ODR-0008 §Q4a). **No new ODR / no promotion** (verdict: HOLD/defer).
- **Queen:** synthesis by the convening Queen. **DA:** Ian Davis (his S008 §Q4a held-as-live dissent). **Panel:** Nicola Guarino (OntoClean IC).
- **Voices:** 3. **`consensus-mode`:** `agent-fan-out` (no hive-mind). **Format:** Reduced Council.
- **⚠ Provisional — directing-authority gate-override.** R3 is GATED on a named sub-Property consumer query (§Q4a). Convened under the "run all 4" directive; the override discharges convening, not the §Q4a trigger.

## Context

S008 §Q4a promoted five classes and left `opda:Building`/`opda:Room` as **conditional** promotions, to "convene on first named BASPI5 round-trip query exercising sub-Property reasoning" (Davis dissent). No such query exists today. R3 asks: promote now, or hold — and on what criterion.

## Verdict — HOLD/defer; a deferral, not a denial; the trigger sharpened (both voices aligned, no held-as-live dissent)

**Davis (DA):** HOLD. "No consumer dereferences a room or building as a thing; the gate trigger has not fired; the override convened the deliberation, it did not fire the gate." Corpus grounding: Building/Room exist as **zero classes** today; the facts that would attach (`numberOfFloors`/`roomDimensions`/`rooms`) are **not emitted** (the walk is `proposed`, and S023 replaced it with category import); `opda:builtForm` already works as a Quale-in-Region datatype property on `opda:Property` (existence proof form-facts need no class); the upgrade path is **already wired and dormant** (`opda-vocabularies.ttl` `PropertyTypeScheme`→sub-class binding via `skos:exactMatch` "when conditional Building/Room promotions trigger"). "Holding costs nothing; the option is preserved at zero cost."

**Guarino** (IC): AGAINST promote-now; **a deferral, not a denial.** His IC test: *"a part earns a class iff it carries a SEGREGATED identity criterion (unity + persistence that can diverge from Property's spatial-material IC) AND a consumer query re-identifies its instances by that IC."* Conjunct (a) is **MET** — the divergence witness already exists in the corpus (ODR-0005 §3a hard-case 4 "Replacement": a built structure may persist when Property identity changes), so Building/Room carry genuine **+O** ICs, not inherited ones. Conjunct (b) is **NOT met** — "`numberOfFloors`/`roomDimensions` are answered losslessly by datatype properties; nobody re-identifies a Room/Building as an individual." He **sharpened the trigger** so a query that merely *mentions* rooms cannot trip the gate — only one that *re-identifies* them (cross-Property part identity, or within-Property part re-identification over dated surveys).

**Verdict:** **HOLD** — defer Building/Room promotion; affirm the eventual IC is genuine (Replacement witness); interim facts stay structured datatype properties on `opda:Property`; the dormant `skos:exactMatch`→subclass path is preserved at zero cost. **Sharpened firing trigger:** a named, runnable query that *re-identifies* a Room/Building instance (not one that merely mentions it). **Votes:** Q1 (promote now?) AGAINST/HOLD 2-0; Q2 (firing trigger) FOR the sharpened re-identification trigger; Q3 (interim datatype treatment) FOR. **No held-as-live dissent** — Guarino: "I agree with Davis on timing; I go further by naming the witness that proves the eventual IC is genuine. Clean deferral."

## Consequences

- ODR-0023 R3 stays **GATED**, with the trigger **sharpened** (re-identification, not mention) and the IC genuineness **affirmed** (the Replacement witness). The roadmap row is updated, not struck.
- No promotion, no emission. `numberOfFloors`/`roomDimensions`/`rooms` route to ODR-0022 Category G (datatype properties / structured micro-patterns on `opda:Property`), per the standing S023 strategy — NOT class promotion.
- The dormant `PropertyTypeScheme`→subclass binding is the zero-cost re-home path when the sharpened trigger fires.
