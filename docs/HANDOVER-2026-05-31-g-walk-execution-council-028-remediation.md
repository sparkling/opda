# Handover — Curated Category-G Walk Execution, Council Session 028, and the ODR-0024 Remediation (2026-05-31)

**Author:** Henrik (with Claude). **Scope:** one session continuing the ADR-0031 walk plan — **executed** the curated Category-G descriptive walk, convened **Council Session 028** (full panel), applied the **ODR-0024** remediation, built a reusable **`council`** skill, and re-indexed the ADR/ODR corpus. **Status: 6 commits on `main` (ahead 6 — NOT pushed, NOT deployed); model council-aligned at an honest 179/239; all 6 CI gates green; pytest 262 pass.**

> Continues [HANDOVER-2026-05-31-category-ed-emission-and-curated-g-walk-plan.md](./HANDOVER-2026-05-31-category-ed-emission-and-curated-g-walk-plan.md) (prior session: E/D emission + the ADR-0031 walk *plan*). **This session did the *execution* + the *council review* + the *remediation*.**

---

## TL;DR

The deferred curated Category-G walk (ADR-0031) was **executed** (185/188 candidate-G leaves emitted-or-collapsed, + the `NearbyFacility`/`School`/`HealthCareFacility` bearer classes) — but an over-claim surfaced first (the BASPI5 round-trip gate is *not* a candidate-G coverage gate; conflating them read "walk landed" at 7/188), so two new CI gates were built: **`ci-dup-declaration`** (every `opda:` term in one module — catches the `riskIndicator` cross-module dup) and **`ci-category-g-coverage`** (an *honest, un-gameable* X/239 tracker). The walk was then put to **Council Session 028** — a full panel (Queen Allemang; Guizzardi/Kendall/Cagle; DA Hendler), run as an **agent fan-out** — which returned **two blockers + several revises**, ratified as **[ODR-0024](ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md)** (modelling rules R1–R12) + **[ADR-0032](adr/ADR-0032-category-g-walk-emission-and-coverage-gate.md)** (engineering). The remediation (R3–R11) landed → **honest 179/239** (the council caught a false monetary collapse *and* a categoriser under-count). A **`council` skill** now codifies the Council Hive. The corpus was **re-indexed** (57 records, 544 typed edges; `odr-index` is now format-aligned). The **leftover** (60 uncovered leaves) is captured in **ADR-0005 §G22–G24**.

---

## What shipped — 6 commits on `main` (ahead 6; NOT pushed)

| Commit | What |
|---|---|
| `6edc5f4` | **`ci-dup-declaration` + `ci-category-g-coverage`** CI gates (the dup-declaration gate wired into CI; coverage gate is local-only — gitignored data dictionary) |
| `0ba2cf4` | **BASPI5 G3 round-trip closed** (8 anchor fixes, 30/30) + the **over-claim corrected** ("curated walk has landed" → BASPI5-profile scope) |
| `ce7de50` | the **curated Category-G walk** 185/188 + the `NearbyFacility` bearer classes |
| `a5bc7ac` | the **council records** — `session-028` + `ODR-0024` + `ADR-0032` |
| `37fef4a` | the **ODR-0024 remediation** applied to the emitters (R3–R11) |
| `d54ee43` | **leftover capture** — `ADR-0005 §G22–G24` + outcome cross-refs (ADR-0031, ODR-0008d) |

---

## The leaves map — 179/239 (the honest accounting)

`ci-category-g-coverage`: **164 minted · 15 collapsed · 60 uncovered** of **239** candidate-G leaves.

- **164 MINTED** (real `opda:` properties), by bearer: `Property` 64 · `LegalEstate` 24 · `Search` 23 · `Transaction` 14 · `NearbyFacility` 7 · `Organisation` 7 · `Valuation` 5 · `AttachedDocument` 4 · domain-less (cross-artefact: `name`/`displayName`/`mediaUrl`/`url`/`price`) 5 · Person/Seller/Proprietorship/Proprietor/RegisteredTitle/RiskAssessment 11.
- **15 COLLAPSED**: → `opda:disclosureDetail` (8 free-text) · → `opda:schoolType` (5 school bands) · → `opda:hasUPRN` (`uprn`) · → `opda:hasAddress` (`address`).
- **60 UNCOVERED** = the three named leftover buckets (ADR-0005 §G22–G24): **~19 monetary** + **~38 R5-surfaced** + **3 `opda:Room`**.

**Why "99%→75%" is honest, not a regression:** the old `185/188` had a *padded numerator* (18 monetary leaves falsely collapsed onto the Category-D fixtures `opda:price`) *and* a *clipped denominator* (the categoriser's 7-name allow-list hid ~51 genuine G leaves in Category C). Fixing both (ODR-0024 R3 + R5) revealed the true ~75% — and `minted` actually went **up** 156→164, `vocabularies.ttl` grew +372 lines, `ci-byte-identity` stayed green. The model is larger and more correct; only the gauge got honest.

---

## ⚠ Things a reader MUST know

1. **`ci-category-g-coverage` (TBox coverage) and `ci-descriptive-roundtrip` (BASPI5 SHACL profile round-trip) are ORTHOGONAL.** Conflating them is what produced the over-claim. Coverage is **local-only** (the data dictionary is gitignored, so it reports UNAVAILABLE on a CI checkout). See ADR-0032.
2. **Greenfield, NO Working-Group gate** for this build phase — the **council is the ratifying body** now. Don't mark new work "pending WG ratification." Memory: [[opda-greenfield-no-wg-gate]].
3. **The monetary leaves are DEFERRED, not modelled.** 18 G monetary leaves had been wrongly collapsed onto the *fixtures* `opda:price` (ODR-0022 §1/G1 keeps them distinct). The council withdrew that; they await the **monetary walk** (mint `opda:MonetaryAmount` = magnitude + ISO-4217 currency; distinct per-economic-kind properties; never share the bearer — Guizzardi-required). ADR-0005 §G22 / ODR-0024 R3 / ODR-0008d item-3.
4. **The binning "defect" is a report-scope miscount, not an emitted-artefact defect** — the emitted terms are already correct; R5 fixed the *count* (188→239) without a byte-identity re-pin. Memory: [[opda-binning-report-vs-emitted]].
5. **`odr-index` is now format-aligned** (it whitelists the project DCAP 9-key frontmatter); the old "divergent" warning is retired. Memory: [[opda-odr-format-vs-skills]] (corrected).
6. **The `council` skill is USER-LEVEL** at `~/.claude/skills/council/` (not in the repo) — it codifies the ODR-0001 Council Hive as an agent fan-out (Queen + DA + only the relevant experts; cheapest-adequate tier).
7. **Records MUST be created via `adr-create`/`odr-create` and indexed via `adr-index`/`odr-index`** (user standing rule). Memory: [[opda-odr-format-vs-skills]].

---

## Do we need more councils?

**Not urgently — the leftover modelling is mostly *already decided* by Session 028.** The remaining work is engineering or conditionally-triggered. One genuine next-council candidate:

1. **ODR-0023 R2 (UFO-axis sub-modules) — now UN-GATED; the clearest next council.** R2 ("is the Quality / Mode / Legal-estate axis split *operationally load-bearing*?") was gated on the curated walk producing a UFO-typed leaf partition. The walk has landed (179/239 typed), so R2 can convene. Per ADR-0031 work-item-4: walk → R2 convenes → (if load-bearing) ODR-0008a/b/c spawn. *Captured in:* [ODR-0023](ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md), [ADR-0031](adr/ADR-0031-category-g-curated-walk-execution-plan.md) §"R2 trigger". **(Note: ODR-0023 itself does not yet record that the gate has cleared — a one-line update worth making before convening R2.)**

**No council needed (decided or walk-able):**
2. **Monetary walk (G22)** — DECIDED (Session 028 Q3 / ODR-0024 R3 / ODR-0008d item-3). Execution is engineering; an Author-level confirm at most.
3. **R5-surfaced follow-on (G23)** — walk-able under ODR-0024 R5/R6; a council only if a specific leaf surfaces a contested domain/class.

**Conditional — re-open ONLY if the trigger fires:**
4. **Guizzardi's `School`/`HealthCareFacility` subkind dissent** — re-open trigger: a per-band consumer query, or the R2 axis review. *Captured in:* ODR-0024 R4 + session-028 Q1 (held dissent).
5. **`opda:Room` activation (G24)** — re-open trigger: a named BASPI5 round-trip query exercising sub-Property reasoning. *Captured in:* ADR-0005 §G24 + ODR-0008 §Q4a.
6. **Cagle's `opda:RiskAssessment` alternative-d dissent** (reuse-`Search`) — rides with its session-024 re-open trigger. *Captured in:* ODR-0008d + the prior handover.

**Pre-existing pending (unchanged this session):** A9 (Gandon–Guizzardi gap), B2 (S005 hive-mind/byzantine pilot), B3 (S011 Q8 hive-mind/typed-output pilot). Memory: [[opda-council-methodology-state]].

**Bottom line:** the only council the *current state actively invites* is **ODR-0023 R2** (now un-gated). Everything else is decided, walk-able, or conditionally-triggered — and each is captured in a record (above) and the coverage gate.

---

## What's open / next steps (suggested order)

1. **Push** `main` (ahead 6) → Cloudflare Pages deploy via CI. (Not done — deploys via CI only; no manual `wrangler`.)
2. **The monetary walk** (ADR-0005 §G22) — mint `opda:MonetaryAmount` + the per-economic-kind properties (rules in ODR-0024 R3). The largest, best-scoped chunk.
3. **The R5-surfaced follow-on** (ADR-0005 §G23) — walk the ~38 leaves; **wire the 5 minted SKOS schemes** (`Construction`/`PriceQualifier`/`Transport`/`BroadbandConnection`/`Ofsted`TypeScheme) to consuming property-shapes; close the pre-existing `ownerType` `sh:in` gap (`opda:Proprietor` has no overlay profile).
4. **Convene ODR-0023 R2** (now un-gated) — and first add the one-line "gate cleared" note to ODR-0023.
5. **`opda:Room`** (ADR-0005 §G24) stays held unless its trigger fires.
6. **Optional:** re-run the full `adr-index`/`odr-index` if you want this session's body-prose record edits re-excerpted (the edge graph is already current — those edits changed no frontmatter/edges).

---

## Key pointers

- **The modelling rules:** [ODR-0024](ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md) (R1–R12). **The engineering:** [ADR-0032](adr/ADR-0032-category-g-walk-emission-and-coverage-gate.md). **The deliberation:** [council/session-028](ontology/odr/council/session-028-category-g-walk-review.md). **The leftover register:** [ADR-0005 §G22–G24](adr/ADR-0005-deferred-work-register.md).
- **The two gates:** `cd tools/opda-gen && PYTHONPATH=src .venv/bin/python -m opda_gen.cli {ci-dup-declaration | ci-category-g-coverage [--strict]}`. Coverage is **local-only** (needs the gitignored data dictionary).
- **Run the generator:** `PYTHONPATH=src .venv/bin/python -m opda_gen.cli {emit | categorise-leaves | ci-byte-identity | ci-three-graph | ci-profile-contract | ci-descriptive-roundtrip}`; tests `PYTHONPATH=src .venv/bin/python -m pytest -q`.
- **The `council` skill:** `~/.claude/skills/council/` (user-level) — convene a scoped Council Hive on the next contested decision.
- **Memory touched this session:** [[opda-greenfield-no-wg-gate]] (new), [[opda-odr-format-vs-skills]] (corrected: odr-index aligned + the always-create-via-skill/always-index rules), [[opda-binning-report-vs-emitted]] (agent-saved), `opda-council-s028-grounding` (agent-saved).

## Everything is committed (not pushed)

6 commits on `main` (`d54ee43` is HEAD; ahead of `origin/main` by 6). Working tree clean. **Nothing pushed → nothing deployed.** Model council-aligned at honest 179/239; all 6 CI gates green; pytest 262 pass; byte-deterministic. All records registered + edge-indexed in AgentDB (57 records, 544 edges).
