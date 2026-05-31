---
status: accepted
date: 2026-05-30
tags: [ontology, generator, shacl, overlay-profiles, profilespec, bounded-context, emission]
supersedes: []
depends-on: [ADR-0007, ADR-0013, ADR-0026, ADR-0028, ODR-0010, ODR-0020]
implements: []
---

# Overlay-Profile Emitter Generalisation and Full Rollout

> **Amendment — Council Session 022 (2026-05-30; 6–0; council-ratified — greenfield, no WG).** A convention-review council **confirmed this `ProfileSpec`/`_build_profile` refactor is idiomatic** — it is exactly a **DCTAP→SHACL** step (the data-dictionary per-overlay table IS a DC Tabular Application Profile). Two revisions: **(a)** drop the `requires` ProfileSpec field + `opda:requires` emission — **redundant** (a SHACL processor enumerates required terms from `sh:path`/`sh:minCount`); **(b)** per governance directive (2026-05-30): **no profile-object / PROF layer** — the SHACL overlay IS the form (ODR-0010, unchanged). Drop `opda:overlaysContext` and the `CONTEXT_OF`→context-concept plan (the `profiles.py:250` bug is moot); the form↔base link is the shapes' `sh:targetClass`, and the form↔community link is one standard `dct:subject`/`dct:publisher` triple on the form graph. **No `prof:Profile`, no `prof:isProfileOf`, no spike; `opda:ValidationContext` stays as ODR-0010 defines it.** The **SHACL shapes, the full-profile rollout, and the byte-identity discipline are unchanged**. See [session-022 §Governance directive](../ontology/odr/council/session-022-form-shacl-profile-convention.md).

> **Implementation status — 2026-05-30: PARTIALLY EXECUTED (sound slice landed; full-fidelity rollout coupled to ADR-0028).** Delivered and green (full `opda-gen` suite + byte-identity + three-graph + profile-contract CI):
> - **S022 correctness on `baspi5.ttl`** — dropped `opda:requires` + the mis-targeted `opda:overlaysContext` (work-item 2); added the one `dct:subject → opda:EstateAgencyContext` community triple; `OVERLAY_COMMUNITY` map for all 31 in-scope overlays. baspi5's `opda:ValidationContext` retained per ODR-0010 (kept `profileURI`/`sourcedFrom`/`formVersion`).
> - **Generic builder (work-item 1, partial)** — `ProfileSpec` + `_build_profile(spec)` added: emits the shared `owl:Ontology` header + the `dct:subject` community tag, delegating SHACL shapes to an optional `shape_builder`. The **header/community scaffolding is now generalized and tested once**.
> - **All 31 profiles emitted (work-item 3)** — `PROFILE_FILENAMES` extended to the 31 in-scope overlays (15 active main + 16 NTS2 extensions); the 3 legacy editions (`baspi4`/`nts`/`ntsl`) asserted absent. Coverage + community-tag tests added and green.
>
> **Two honest gaps** *(status — both resolved/ruled by the Session 034 amendment below: gap (2) is **DONE** — baspi5 routed through `_build_profile`, byte-identical, commit `8753784`; gap (1) is **no longer ADR-0028-coupled** — the descriptive TBox is built (254 emitted `opda:` predicates; Category-G 239/239; the monetary walk executed), so S034 rules it complete by **eager-on-bindable enumeration**)*. As originally written, both were coupled to [ADR-0028](./ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) (deferred):
> 1. The **30 non-BASPI5 profiles are THIN** (header + `dct:subject` community only). Their leaves have no term-grain `opda:` property paths to constrain via `sh:path` until ADR-0028's descriptive-layer walk lands — and that walk was deferred to a curated WG pass (see ADR-0028 implementation note). Each thin profile's `dct:description` + comment header states this inline.
> 2. **baspi5 retains its bespoke `_build_baspi5_profile`** (not yet routed through `_build_profile`). Data-fying its ~30 shapes into a `shape_builder` is an **output-neutral** refactor (baspi5.ttl stays byte-identical) whose payoff — uniform spec-driven shapes — only matters once the other forms have terms to constrain. Deferred with gap (1); the byte-parity regression gate is satisfied trivially (baspi5's builder is untouched).
>
> Net: the form→community map (ODR-0020 Rule 6 half) is now machine-readable for **all 31 forms**; the per-leaf constraint half awaits ADR-0028. Status stays `proposed`.

> **Amendment — Council Session 023 (2026-05-30; re-scoped by [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md); council-ratified — greenfield, no WG).** ODR-0022 makes the thin profiles' constraint half **the carrier of round-trip coverage**, so it constrains how the profiles are completed once the (re-scoped) ADR-0028 walk lands. The per-form overlay profiles — currently emitted **thin** (header + `dct:subject` community only, gap (1) above) — MUST **enumerate each form's leaves** in their `sh:path`/`sh:minCount`/`dct:source` shapes. This per-leaf enumeration is what discharges ODR-0022 gate **G3 (coverage-by-test)**: a BASPI5 round-trip passes on the collapsed TBox only because the profile, not the base TBox, carries the descriptive `sh:minCount` cardinality (the base TBox carries zero descriptive `sh:minCount`, per ODR-0008 §Q7a). Each shape's `dct:source` MUST point at the schema-leaf-path (ODR-0022 G2), not the deciding ODR. Additionally, the emitter targets broaden alongside the re-scoped ADR-0028 walk: the **Category C status-enum SKOS schemes (~54) and the Category D `FixtureItemScheme`** (ODR-0011) and the **Category E `SearchResult`/`RiskAssessment` class** become emitter targets, so per-form `sh:in` restrictions over the C/D schemes and the E class hang off these profiles. Cite [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) §Rules.2 (G2/G3) + §Consequences.

## Context and Problem Statement

[ODR-0010](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) models each PDTF form as a SHACL **overlay profile** — an `opda:ValidationContext` carrying `opda:overlaysContext` + per-leaf `opda:requires`, with per-form `sh:minCount`/`sh:in` constraint variation. [ODR-0020](../ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md)'s term→context derivation reads `overlaysContext` + `requires` off these profiles. Verified state exposes two blockers:

1. **Only one profile is emitted, of 34.** `source/03-standards/ontology/profiles/` holds exactly `baspi5.ttl`. PDTF v3 ships **34 overlay files** (per `/modelling/overlays`): **18 main** in `v3/overlays/*.json` — `baspi5`, `baspi4`†, `nts2`, `nts`†, `ntsl2`, `ntsl`†, `piq`, `ta6`, `ta7`, `ta10`, `lpe1`, `fme1`, `con29R`, `con29DW`, `llc1`, `oc1`, `rds`, `sr24` († = legacy: superseded but still shipped for backward compat) — **plus 16 extension** overlays in `v3/overlays/extensions/*.json` (the NTS2 fragments `as dr er fd hi hs jk la ma mc oa oc sb sf sl tf`, each adding one NTS2 topic to an `nts` 2023 base for staged migration; adopting all 16 ≡ `nts2`). So **1 of 34** is captured in SHACL. **Of the 34, 31 are in scope** (15 active main + 16 extensions); the **3 legacy editions (`baspi4`, `nts`, `ntsl`) are out of scope** — OPDA validates current-edition data only. (`combined.json`/`skeleton.json` at the v3 root are pre-merged/starter artefacts, not overlays.)
2. **No generic composer.** [Council Session 021](../ontology/odr/council/session-021-bounded-context-implementation-plan.md) (Cagle & Knublauch, verified) found `profiles.py`'s `_build_baspi5_profile()` is **~420 lines of hand-coded, BASPI5-specific shape construction**, and `emit_profile` raises `NotImplementedError` for any other overlay. **"The other ~17 profiles" is not a config change — each is currently a bespoke 400-line builder.** Authoring 17 more by hand is the anti-pattern.

Plus the `profiles.py:250` mis-target ([ADR-0026](./ADR-0026-bounded-context-scheme-emission.md) work-item 3): `opda:overlaysContext` points at a profile-LAYER IRI, not a context concept. The directing governance ruled **one-go, full coverage, no staging** — so this ADR delivers the refactor **and all profiles** in the same delivery, not a demand-pulled trickle.

## Decision Drivers

- **Constraint-reuse over hand-authoring** — compose profiles from a declarative spec + shared shape library (TopBraid/TopQuadrant discipline, Knublauch), not N bespoke builders.
- **Behaviour-preserving refactor** — the generalisation MUST emit `baspi5.ttl` **byte-for-byte identical**; that is the regression gate proving it is safe.
- **ODR-0010 canonical mapping** — `required[]`→`sh:minCount`; enum-subset→**merged** `sh:in` (build-step replacement, not stacking); `oneOf`→`sh:xone`; `baspi5Ref`/leaf-ref→`dct:source`; UI→DASH; per ODR-0010 Rules 1–5.
- **Context wiring** — every profile's `overlaysContext` → its industry `…Context` concept via `CONTEXT_OF` (ODR-0020 Rule 6).
- **One delivery, full coverage** — all profiles this delivery; the byte-identity baseline re-pinned once.

## Considered Options

- **Option A — generic `_build_profile(spec: ProfileSpec)` + author all specs (CHOSEN).** Generalise the BASPI5 builder so per-form variation is *input data*; populate one `ProfileSpec` per overlay by walking its overlay JSON; wire `CONTEXT_OF`.
- **Option B — hand-code each profile builder** (extend the status quo). Rejected: ~17 × 400-line bespoke builders is unmaintainable and the smell S021 named; constraint logic is identical across forms — it belongs in data, not code.
- **Option C — emit profiles incrementally / demand-pulled** (Davis's watching-brief). Rejected by the S021 governance directive (one-go, full coverage).

## Decision Outcome

Chosen option: **Option A.** Work items (all in the single delivery, alongside [ADR-0026](./ADR-0026-bounded-context-scheme-emission.md) + [ADR-0028](./ADR-0028-descriptive-layer-walk-and-home-pass-emission.md)):

1. **Extract `_build_profile(spec: ProfileSpec) -> Graph`.** Generalise `_build_baspi5_profile()` so per-form variation is a `ProfileSpec` (dataclass parsed from the overlay JSON), with fields mapping to ODR-0010 Rules:

   | `ProfileSpec` field | ODR-0010 Rule | SHACL output |
   |---|---|---|
   | `required: [path,…]` | Rule 1 | `sh:property [ sh:path … ; sh:minCount 1 ]` |
   | `enum_subset: {path: [members]}` | Rule 2 | single **merged** `sh:in (…)` (build-step replacement; never two `sh:in` on one path) |
   | `oneOf: {discriminator, branches}` | Rule 3 | `sh:xone (…)` with `sh:qualifiedValueShape` |
   | `leaf_refs: {path: anchor}` | Rule 4 | `dct:source <…/forms/<form>#<anchor>>` |
   | `ui: {path: {viewer,editor,order,group}}` | Rule 5 | `dash:viewer`/`dash:editor`/`sh:order`/`sh:group` |
   | `community` | ODR-0020 / governance directive | one `dct:subject` → its context concept, on the form graph's `owl:Ontology` header (no `opda:requires`/`opda:overlaysContext` — shapes enumerate required terms; `sh:targetClass` gives the base) |

2. **Overlay→community map → one `dct:subject` triple per form** (governance directive — *not* `opda:overlaysContext`/PROF). `OVERLAY_COMMUNITY = { baspi5/nts2/ntsl2 + all 16 extensions → EstateAgency; ta6/ta7/ta10/lpe1 → Conveyancing; fme1 → MortgageLending; piq → Surveying; rds/oc1/llc1/con29R/con29DW/sr24 → PropertyDataServices }` (legacy `baspi4`/`nts`/`ntsl` skipped — out of scope; Property Tech owns no overlay — base only). Emit `<formGraph> dct:subject <communityConcept>` on each form's `owl:Ontology` header. The `profiles.py:250` defect is moot (the predicate is gone).
3. **Author profile specs for the full inventory (34 overlays) — no profile left unwritten.** One `ProfileSpec` per overlay JSON, emitting that overlay's SHACL shapes (`sh:minCount`/`sh:in`/`sh:xone` + `dash:` + per-leaf `dct:source`) + its `dct:subject` community triple — **no wrapper node**. Scope, in two tranches:
   - **15 active main** (`v3/overlays/*.json`) in priority order — `ta6 → piq → fme1 → rds → lpe1 → ta7 → ta10 → oc1 → llc1 → con29R → con29DW → sr24 → nts2 → ntsl2` (baspi5 already done). The **3 legacy editions** (`baspi4`, `nts`, `ntsl`) are **OUT OF SCOPE — skipped** (no SHACL profile; OPDA validates current-edition data only). Re-open only if backward-compat validation of a superseded edition is ever required.
   - **16 extension** (`v3/overlays/extensions/*.json`): each NTS2 fragment (`as dr er fd hi hs jk la ma mc oa oc sb sf sl tf`) is a first-class overlay → its own `ProfileSpec`/profile, all in Estate Agency (supports staged NTS 2023→NTS2 migration — a real use case per `/modelling/overlays`).
4. **Contract + determinism gates.** The three-rule interface contract (ODR-0010 §Q8 / [ODR-0013](../ontology/odr/ODR-0013-shacl-validation-and-severity.md)) green on every profile; the enum-union test (ODR-0008 §Q7a: union of per-profile `sh:in` members == the SKOS scheme's concept set); byte-identity re-pinned once for the delivery.

### Consequences

* Good, because it completes the term→context **usage** map — every form contributes its `overlaysContext` + `requires`, so the dormant `opda:servesContext` derivation becomes rich and correct across all six contexts.
* Good, because per-form variation lives in declarative `ProfileSpec` data, not 400-line builders — adding or revising a form is a spec edit, and the constraint logic is tested once.
* Good, because `piq` + `ta6` co-requiring `floodRisk` produces the first real bucket-B spanning (two `servesContext` edges); `oc1`/`llc1`/`con29` exercise bucket-C (`consumesFrom` HMLR/LA), validating the placement method end-to-end.
* Bad, because this is the long pole of the delivery — the refactor + **30 specs** (14 active main [15 − baspi5, already done] + 16 extensions; the 3 legacy editions are out of scope); mitigated by the spec being mechanical (the overlay JSON carries the columns) and by the byte-identity regression gate on `baspi5`. The 16 extensions are small (one topic each). **Target profile set: 31** (15 active main + 16 extensions).
* Neutral, because `opda:servesContext` CONSTRUCT activation vs the active validation set stays governed by [ODR-0019](../ontology/odr/ODR-0019-bounded-context-representation.md) Rule 8 — emitting and running the derivation is in scope; lifting dormancy is a one-line ODR-0019 amendment if the WG chooses.

### Confirmation

- **Refactor regression gate**: `baspi5.ttl` emits **byte-for-byte identical** after the `_build_profile(spec)` refactor (proves behaviour-preservation); existing `test_profiles.py` + `profile_contract_test.py` green.
- **Community-tag test**: every emitted form graph (all 34, modulo the legacy scope decision) carries exactly one `dct:subject` → a `skos:Concept` in `opda:BoundedContextScheme` — no `opda:overlaysContext`/wrapper (governance directive).
- **Coverage test**: a profile exists for every **active** overlay in `v3/overlays/*.json` (15) **and** every fragment in `v3/overlays/extensions/*.json` (16) = **31** — reconciled against the `/modelling/overlays` catalogue; the 3 legacy editions (`baspi4`/`nts`/`ntsl`) are explicitly **excluded** (asserted absent, so they can't be silently re-added or silently forgotten).
- **Three-rule contract** (ODR-0010 §Q8 / ODR-0013): green on every profile.
- **Enum-union test** (ODR-0008 §Q7a): for each spanning leaf, union of per-profile `sh:in` members == the SKOS scheme's `skos:Concept` set.
- **Byte-identity CI** ([ADR-0007 §6a](./ADR-0007-ontology-generator-specification.md)): second regeneration identical across the full profile set; baseline re-pinned once.
- **Derivation richness**: with all profiles emitted, the (dormant) `servesContext` CONSTRUCT yields edges for all six contexts; the cross-check shape (ADR-0026 amendment) fires only `sh:Warning`s, never `sh:Violation`.

## More Information

- **Realises**: [ODR-0010](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) (overlay-profile mechanism — full rollout) + [ODR-0020](../ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md) Rule 6 (the `overlaysContext`→context wiring and `CONTEXT_OF` map).
- **Council provenance**: [ODR session-021](../ontology/odr/council/session-021-bounded-context-implementation-plan.md) (Cagle & Knublauch's `profiles.py` finding + `ProfileSpec` recommendation; build order ta6 → piq → fme1 → rds → lpe1/ta7/ta10 → oc1/llc1/con29; governance one-go directive).
- **Generator framework**: [ADR-0007](./ADR-0007-ontology-generator-specification.md) (determinism); [ADR-0013](./ADR-0013-overlay-profile-emission.md) / [ODR-0013](../ontology/odr/ODR-0013-shacl-validation-and-severity.md) (severity + the three-rule contract); [ADR-0026](./ADR-0026-bounded-context-scheme-emission.md) (`CONTEXT_OF` + `profiles.py:250` fix, shared).
- **Co-delivered with**: [ADR-0028](./ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) (supplies the term-grain `opda:` properties the profiles `require`).
- **Files touched**: `tools/opda-gen/src/opda_gen/emitters/profiles.py` (the `ProfileSpec`/`_build_profile` refactor, `OVERLAY_COMMUNITY` map); `PROFILE_FILENAMES` extended to the **31 in-scope overlays** (15 active main `v3/overlays/*.json` + 16 extension `v3/overlays/extensions/*.json`; the 3 legacy editions excluded); `source/03-standards/ontology/profiles/*.ttl` (all profiles, regenerated — incl. an `extensions/` or flat layout for the 16 fragments); `tests/test_profiles.py` + `tests/baspi5_round_trip/` (regression + per-form contract + the coverage test).
- **Inventory source of truth**: `/modelling/overlays` (`src/pages/modelling/overlays.astro`) — 34 overlay files (18 main + 16 extension), active/legacy status, and the overlay→community map. The plan reconciles against it.
