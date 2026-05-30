# Handover — Descriptive-Layer Import Strategy + Follow-On Councils (2026-05-30)

**Author:** Henrik (with Claude). **Scope:** one session — decided *how* to import the PDTF descriptive layer into the ontology (the prior question the deferred 935-leaf walk exposed), built the sound, gated slice, and ran the four follow-on pattern-councils it spawned. **Status:** **records written + build green; everything uncommitted; one specified code fix outstanding.**

> This is a **different arc** from the three `HANDOVER-2026-05-30-*bounded-context*` docs (that was the prior session's bounded-context/forms build). The deliberation lives in `council/session-023…027`; the decisions in ODR-0022/0023/0008d + ADR-0030.

---

## TL;DR

The deferred "935-leaf descriptive walk" forced a prior question: *before curating, what should be imported at all, and at what granularity?* A Full Council (**S023**) answered: **import by property-category (A–G), not 1:1** — of ~1,493 annotated base leaves only **~12% are genuine descriptive concepts**; the rest are form-ergonomics (reusable patterns, SKOS schemes, reference data, upstream reuse). That strategy is **ODR-0022**, ratified behind three gates (path-aware binning, schema-leaf-path provenance, coverage-by-test). A swarm **built the sound slice green** (216 tests + 3 CI gates), producing a **counted candidate-G set of 182 names** (validating the ~181 estimate). The four follow-on `pattern` decisions were consolidated into a roadmap (**ODR-0023**) and **run in parallel** (R1–R4): **R1 → ODR-0008d** (a new `opda:RiskAssessment` Information Object + peril scheme); R2/R3 ratified frameworks but stayed gated; R4 confirmed the fixtures inclusion-Mode. The engineering lives in **ADR-0030**. **The one open action — a binning defect (enum-bearing Quale concepts mis-routed to C) — has since been fixed and verified (candidate-G 182 → 188; full suite + all four CI gates green); the corrected set is ready for the WG.**

---

## Records written this session

| Record | Kind | What | Status |
|---|---|---|---|
| [ODR-0022](ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) | architecture | **Category-based import strategy** — the A–G taxonomy + per-category treatment + 3 ratification gates (G1/G2/G3) + salience carve-out + residue register | proposed |
| [ODR-0023](ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) | programme | **Follow-on council roadmap** — R1–R4 trigger-gated sessions + per-council convening config (agent-fan-out, **no hive-mind**) | proposed |
| [ODR-0008d](ontology/odr/ODR-0008d-authority-retrieved-artefacts.md) | pattern | **Authority-Retrieved Artefacts** — `opda:RiskAssessment` (Information Object) + 12-member `opda:PerilScheme`; the 5 §Q4a classes retro-corrected to Information Object | proposed |
| [ADR-0030](adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) | (ADR) | **The opda-gen engineering** — path-aware categoriser (G1), category emitters, G2/G3 gates, byte-identity, the in-code boundary holds | proposed |
| Sessions [023](ontology/odr/council/session-023-descriptive-layer-import-strategy.md)/[024](ontology/odr/council/session-024-authority-retrieved-artefacts.md)/[025](ontology/odr/council/session-025-ufo-axis-submodules.md)/[026](ontology/odr/council/session-026-building-room-promotion.md)/[027](ontology/odr/council/session-027-fixtures-inclusion-mode.md) | — | The five Council transcripts (+ working files) | — |

**Amended:** [ODR-0008](ontology/odr/ODR-0008-property-descriptive-attributes.md) §Q2a(b) (ODR-0008d spawned); [ADR-0028](adr/ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) + [ADR-0029](adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) (re-scoped by ODR-0022); [adoption.md](ontology/odr/council/adoption.md) (S023–S027 track-record rows). **AgentDB:** ODR-0022/0023/0008d + ADR-0030 registered (hierarchical + `*-patterns`).

---

## The build (green; sound slice of ODR-0022 via ADR-0030)

A 5-agent swarm built the buildable, non-council, non-irreversible work. **Full `opda-gen` suite 216 pass / 1 xfail; byte-identity + three-graph + profile-contract CI all green** (queen re-pinned once).

| Gate / category | Built | Result |
|---|---|---|
| **G1** path-aware binning | `inputs/leaf_categoriser.py` + `categorise-leaves` CLI | **188 candidate-G names** (182 before the S025 G1 fix; validates ~181); `priceInformation.price`→G, `fixtures.*.price`→D by rule; 16-leaf residue; report at `source/00-deliverables/semantic-models/descriptive-category-binning.json` |
| **G2** schema-leaf-path `dct:source` | `term_sourcing.py`, `descriptive.py` | instance `dct:source` → form-question leaf path (not the deciding ODR) |
| **A** disclosure tail | `descriptive.py` | one `opda:disclosureDetail` emitted |
| **C** status enums | `vocabularies.py` | reused status schemes (YesNo/Inclusion/AttachmentStatus families) |
| **D** (candidate) | `vocabularies.py` | `opda:FixtureItemScheme` — **89 item concepts**; `inclusionStatus` Mode **held** for R4 |
| **G3** coverage CI | `ci/descriptive_roundtrip_test.py` + `ci-descriptive-roundtrip` CLI | reports thin-profile coverage gaps (xfail-clean until the walk lands) |

**Held by decision (NOT built):** Category **E** (RiskAssessment → was R1, now ODR-0008d); D's **`inclusionStatus` Mode** (→ R4, now confirmed); the **188 Category-G permanent IRIs** (→ WG curated pass — the swarm produced the *candidate* set, minted zero G IRIs).

---

## The four follow-on councils (run in parallel; agent-fan-out, no hive-mind)

| # | Verdict | Disposition |
|---|---|---|
| **R1** Authority-Retrieved Artefacts | **7–1 / 8–0 FOR** `opda:RiskAssessment` Information Object (IC ⟨activity, peril, subject, generated-time⟩) + 12-member `opda:PerilScheme`; 5 classes → Information Object; on PROV-O. **Cagle (DA) held-as-live for reuse-`Search`** (re-open trigger: no RiskAssessment ever has a lifecycle independent of its parent Search). | **→ ODR-0008d**; ODR-0023 R1 struck; unblocks ODR-0022 Category E |
| **R2** UFO-axis sub-modules | **Framework + stewards ratified; mint nothing; a/b/c spawn deferred** to the curated G walk (Davis held — §Q2a(a) trigger unfired). | ODR-0023 R2 **stays gated** |
| **R3** Building/Room promotion | **HOLD — deferral, not denial**; IC affirmed genuine (ODR-0005 §3a "Replacement" witness); trigger **sharpened to re-identification**; no held dissent. | ODR-0023 R3 **stays gated** |
| **R4** Fixtures inclusion-Mode | **CONFIRMED** — `opda:inclusionStatus` is a sale-transaction Mode (ODR-0007), not a Property Quality. | ODR-0023 R4 struck; unblocks Category D |

> **Caveat (honest):** R2 and R3 were genuinely **trigger-gated**; they ran under a **directing-authority override** ("run all 4"), recorded as such throughout. The override discharged *convening*, not their substantive triggers — so they ratified frameworks/criteria and the binning catch, but minted nothing. If avoiding spend on speculative councils matters, R2/R3 are the ones to hold until their real triggers fire.

---

## What ODR-0023 + the R1–R4 run unlocked

ODR-0023 turned four scattered spawn-triggers into one citable roadmap, and running it unlocked:

- **Category E emission** *(R1 → ODR-0008d)* — the ~200 search/environmental leaves now have a model (`opda:RiskAssessment` + `opda:PerilScheme`); the five §Q4a classes gain internals + the Substance-Kind→Information-Object correction. ADR-0030's held Category-E emitter target is unblocked.
- **Category D emission** *(R4)* — `opda:inclusionStatus` confirmed as a sale-transaction Mode (ODR-0007), so the already-built `opda:FixtureItemScheme` (89 items) + `inclusionStatus` can wire to a transaction-scoped fixtures list (not `opda:Property`).
- **A ratified R2 framework** — when the curated G walk runs, the 3-axis sub-module split (qualities/modes/legal-estate) has a ratified framework + stewards + a falsifiable load-bearing criterion to apply; only *instantiation* remains, not re-deliberation of the shape.
- **A zero-cost R3 upgrade path** — Building/Room's eventual IC is affirmed genuine (ODR-0005 §3a "Replacement" witness) and the dormant `skos:exactMatch`→subclass binding is preserved, so promotion is a cheap, pre-decided move when a re-identification query arrives.
- **The roadmap + convening config themselves** — ODR-0023 stops the four triggers (previously scattered across ODR-0008 §Q2a/§Q4a + ODR-0022 §4) being re-litigated each revisit, and pins the cheap per-council substrate (agent-fan-out, **no hive-mind**) for running any of them.

**Net:** R1 + R4 unblock real emission (Categories E and D); R2 + R3 bank ratified frameworks for when their triggers fire. The descriptive layer's follow-on `pattern` work is now **2 of 4 discharged, 2 of 4 framework-ratified-and-gated**.

## Why we didn't "do" all four councils (R2/R3 produced no records — by design)

All four were **convened** in parallel — but only **R1 and R4 produced records**, and that is the correct outcome, not an omission:

- **R1 (ready):** its §Q2a(b) trigger had *fired* (ODR-0022 Category E) → it produced **ODR-0008d**.
- **R4 (soft):** a confirmation of an already-settled assertion (ODR-0022 §4) → **author-only**, confirmed; no new record needed (the commitment realises ODR-0007).
- **R2 + R3 (gated):** their **substantive triggers had NOT fired.** They ran *provisionally* under the "run all 4" directing-authority override — but **the override discharges *convening*, not the precondition**:
  - **R2** needs the **curated G walk** (the per-leaf UFO classification) to judge whether the axis split is "operationally load-bearing" (§Q2a(a)). Only the *candidate* set exists today — and it carries the binning defect. Spawning ODR-0008a/b/c now would be "declaring what we cannot derive" (Allemang): minting permanent, possibly-wrong IRIs on a guess.
  - **R3** needs a **named consumer query that *re-identifies* a Building/Room instance** (§Q4a). None exists. Promoting now would mint classes nothing dereferences (Davis + Guarino).
- So R2/R3 **ratified their frameworks/criteria and minted nothing** — the methodology working as intended: the councils declined to commit **permanent identifiers** prematurely (the exact failure ODR-0022's permanence discipline and ODR-0001's trigger gates exist to prevent). "Doing" them fully would have meant minting unsound, unreversible IRIs; **deferring is the sound result**, and the frameworks they ratified make the eventual instantiation cheap. R2 also paid for itself by **catching the G1 binning defect** (below).

## ✅ RESOLVED — the G1 binning defect (fixed 2026-05-30, verified green)

Davis (R2 DA) found, and the Queen verified, a real defect in `leaf_categoriser.py` — **since fixed and verified** (full `opda-gen` suite + all four CI gates green; the categoriser touches no byte-identity surface):

- **Bug:** `leaf_categoriser.py` (`if has_enum: → C`) routes **every** enum-bearing leaf to Category C, so the **flagship Quale-in-Region G attributes** — `currentEnergyRating` (EPC band A–G), `councilTaxBand` (A–I), `builtForm`, `tenureKind` — are mis-routed to **C** when ODR-0022 §1 / ODR-0008 §Q5a make them **Category G** (their value-space is a SKOS *range*, not Category-C membership).
- **Result (fixed):** the **182 candidate-G count undercounted G** (and over-counted C) — **now 188** (C 159 → 153); the six §Q5a Quale attributes (`currentEnergyRating`, `councilTaxBand`, `builtForm`, `ownershipType`, `centralHeatingFuelType`, `heatingType`) now bin to G. `tenureKind` has no leaf record (named only in §Q5a).
- **Fix applied:** a `_G_PROPERTY_QUALE_TAILS` allow-list (the §Q5a-named genuine attributes) routes to **G** *before* the `has_enum → C` fallback, which stays intact for genuine reused-status flags (Yes/No, Included/Excluded/None…). Surgical and grounded in §Q5a — deliberately **not** a reuse-count heuristic (which would wrongly sweep `role`/`title`/`marketingTenure` into G; that stays the WG's per-leaf call). Regression tests added (`test_enum_bearing_quale_attr_is_g_not_c`, `test_flagship_quale_attrs_are_g_in_corpus`).
- **Recorded in:** ODR-0022 §1 (C-vs-G boundary), ADR-0030 (S025 amendment), session-025 — all updated to reflect the correction. The `descriptive-category-binning.json` report is a **gitignored build artifact** (regenerated by `categorise-leaves` from the committed categoriser), so the committable change is `leaf_categoriser.py` + its tests, not the report.

---

## What's deferred / gated (not open questions)

1. **WG ratification** of ODR-0022/0023/0008d + ADR-0030 (`proposed` → accepted via WG → Modelling Sub-Committee). The three gates are the WG's acceptance checklist.
2. **The curated G walk** — the WG curates the (defect-corrected) ~188 candidate-G set into per-leaf `opda:` properties. This is the bulk of the schema→ontology coverage gap; it stays deferred to the WG by design (ODR-0022; the build mints zero G IRIs).
3. **ODR-0023 R2/R3** — gated; frameworks/criteria ratified, spawn/promotion await their real triggers (R2: curated G axes; R3: a re-identification query).
4. **Full Category-E/D emission** — E now has its model (ODR-0008d); D has its Mode (R4); both can emit once the records ratify + the generator wires them (ADR-0030 follow-on).
5. **The ADR `implements` inconsistency** (latent): ADR-0026 uses `implements:[ADR-…]`, ADR-0028/0029/0030 use `implements:[ODR-…]`. ADR-0030 follows its arc-siblings; `/adr-review` across the four would normalize if wanted. Non-blocking.

---

## Next steps (suggested order)

1. **~~Apply the G1 binning fix~~ — DONE** (2026-05-30): fix applied + `categorise-leaves` re-run (candidate-G 182 → 188). The report itself is gitignored (regenerated on build); what commits is the `leaf_categoriser.py` fix + its tests.
2. **Commit** the green build + records (your call — deploys via CI on push to `main`; do not `wrangler pages deploy`).
3. **WG ratification** pass; then the **curated G walk** over the corrected candidate set.
4. **Wire ODR-0008d emission** (the `RiskAssessment` class + `PerilScheme` + the 5 classes' Information-Object correction + internals) and **Category D's inclusion-Mode** — both unblocked.

---

## Key pointers

- **Strategy + the 3 gates:** ODR-0022 (§1 taxonomy, §2 gates, §3 salience). **Engineering:** ADR-0030.
- **Council roadmap + convening config:** ODR-0023 (R1 struck / R4 confirmed / R2-R3 gated; agent-fan-out, no hive-mind — see [[opda-avoid-hive-mind-cost]] memory).
- **R1 verdict:** ODR-0008d (`RiskAssessment` IC; `PerilScheme`; Cagle's held dissent + re-open trigger).
- **Run the generator:** `cd tools/opda-gen && PYTHONPATH=src .venv/bin/python -m opda_gen.cli {emit | categorise-leaves | ci-byte-identity | ci-three-graph | ci-profile-contract | ci-descriptive-roundtrip}`; tests `PYTHONPATH=src .venv/bin/python -m pytest -q`.
- **The counted candidate-G set:** `source/00-deliverables/semantic-models/descriptive-category-binning.json` (**188 distinct names** — the S025 G1 fix is applied; was 182).
- **Methodology:** ODR-0001 (Council) + `adoption.md` (track record, now through S027). Cost note: prefer agent-fan-out over hive-mind.

## Everything is uncommitted

All records, the generator changes, the regenerated TTLs, and the binning report are in the working tree, uncommitted. Records are `proposed` pending WG ratification.
