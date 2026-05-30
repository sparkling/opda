---
status: accepted
date: 2026-05-30
tags: [ontology, skos, bounded-context, generator, emission, shacl-af, profiles]
supersedes: []
depends-on: [ODR-0019, ADR-0007, ADR-0008, ADR-0010, ADR-0011, ADR-0013]
implements: [ODR-0020]
---

# Bounded-Context Scheme Emission

> **Implementation status — 2026-05-30: EXECUTED (S022-final design; green).** `emitters/contexts.py` → `opda-contexts.ttl` emits `opda:BoundedContextScheme` + the six industry `skos:Concept`s (each `skos:inScheme` + `skos:topConceptOf` + `skos:prefLabel` + `skos:definition` + `opda:hasSteward` + `dct:source`) + the `opda:consumesFrom` annotation property (`rdfs:subPropertyOf prov:wasInfluencedBy`). Per the S022-final design, **no** `opda:servesContext` / `opda:overlaysContext` / `opda:definedInContext` predicate is emitted, and **no** dormant CONSTRUCT/cross-check shape ships — membership is a documented on-demand query held as a reviewable constant in `contexts.py` (never materialised). Foundation `owl:versionInfo` bumped; wired into the `emit` umbrella + byte-identity CI + an `emit-contexts` CLI command. F1 firewall + "no retired predicates" structural tests green. The `profiles.py:250` defect is moot (the predicate is gone).

## Context and Problem Statement

[ODR-0020](../ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md) ratified the bounded-context model: one flat `opda:BoundedContextScheme` of the six industry contexts; upstream authorities as `opda:Organisation` reached by `opda:consumesFrom`; spanning concerns derived, not declared; and a four-bucket term→context mapping **derived** from the profiles. None of it is emitted. This ADR is the implementation — how the generator (`opda-gen`, [ADR-0007](./ADR-0007-ontology-generator-specification.md) / [ADR-0008](./ADR-0008-generator-implementation-infrastructure.md)) produces it deterministically.

Three facts make this more than "emit some triples":

1. **No emitter exists.** The six contexts, the scheme, and the predicates (`opda:servesContext`, `opda:consumesFrom`, `opda:definedInContext`) are absent from every TTL.
2. **`opda:overlaysContext` is mis-targeted.** `tools/opda-gen/src/opda_gen/emitters/profiles.py:250` hardcodes the profile-LAYER IRI `<https://w3id.org/opda/profiles/foundation>` as the object of `opda:overlaysContext`. The ODR-0020 derivation reads `overlaysContext` to discover a term's context — so a profile-layer object yields nothing mappable. This is a bug fix and the precondition for derivation.
3. **Only one profile is emitted.** `baspi5.ttl` is the sole profile in `source/03-standards/ontology/profiles/`; the other forms (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29…) are not yet generated. The full term→context map therefore cannot be complete until those profile emitters land; this ADR delivers the scheme, the corrected wiring for the profiles that exist, and the (dormant) derivation, and records the remaining profiles as downstream work.

The emission must satisfy the generator-first determinism + byte-identity CI of [ADR-0007 §6a](./ADR-0007-ontology-generator-specification.md) and must ship the derivation **dormant** per [ODR-0019](../ontology/odr/ODR-0019-bounded-context-representation.md) Rule 8.

## Decision Drivers

- **Realise ODR-0020 deterministically** — the scheme + concepts are generator output, never hand-edited ([ADR-0007 §6a](./ADR-0007-ontology-generator-specification.md)).
- **Single source of truth = the profiles** — `opda:servesContext` is derived, not authored (ODR-0020 Rule 5).
- **Dormant gate** — the derivation rule ships off until a named term-grain consumer ([ODR-0019](../ontology/odr/ODR-0019-bounded-context-representation.md) Rule 8).
- **No regression** — existing 23 TTLs stay byte-identical except the intended `baspi5.ttl` overlaysContext fix and the foundation version bump.
- **House style** — mirror `emitters/vocabularies.py` ([ADR-0010](./ADR-0010-skos-vocabulary-emission.md)): a dedicated module emitting a dedicated TTL via the canonical serialiser.

## Considered Options

- **Option A — new `emitters/contexts.py` → `opda-contexts.ttl` (CHOSEN).** A dedicated module emits the scheme + the six concepts + the three annotation-property declarations, beside `vocabularies.py`; `profiles.py` gains a `CONTEXT_OF` overlay→context map and re-points `overlaysContext`; the dormant SHACL-AF CONSTRUCT lands in `emitters/shapes.py`.
- **Option B — fold contexts into `vocabularies.py` / `opda-vocabularies.ttl`.** Rejected: bounded contexts are not value vocabularies (they carry the DDD context map, not enum members); per-module file discipline ([ADR-0011](./ADR-0011-module-tbox-emission.md)) keeps concerns in separate artefacts.
- **Option C — hand-author `opda-contexts.ttl`.** Rejected: violates generator-first ([ADR-0007](./ADR-0007-ontology-generator-specification.md)); the `DO NOT HAND-EDIT` headers and byte-identity CI forbid it.

## Decision Outcome

Chosen option: **Option A**, because it mirrors the ratified `vocabularies.py` substrate pattern, keeps the context scheme in its own deterministically-regenerated artefact, and isolates the `profiles.py` bug fix from the new emission. Work items:

1. **`emitters/contexts.py` → `opda-contexts.ttl`.** Emit `opda:BoundedContextScheme a skos:ConceptScheme` + the six `skos:Concept`s (`opda:EstateAgencyContext`, `opda:ConveyancingContext`, `opda:MortgageLendingContext`, `opda:SurveyingContext`, `opda:PropertyDataServicesContext`, `opda:PropertyTechnologyContext`), each `skos:inScheme` + `skos:topConceptOf` + `skos:prefLabel` + `skos:definition` + `opda:hasSteward` (Literal, from the `/modelling/bounded-contexts` table). Wire the new module under `owl:imports` from the foundation per [ADR-0011](./ADR-0011-module-tbox-emission.md).
2. **Declare the predicates.** `opda:servesContext`, `opda:consumesFrom`, `opda:definedInContext` as `owl:AnnotationProperty` (membership/provenance, not logical typing) with A9 metadata, in `opda-contexts.ttl` (or the annotations graph per three-graph separation).
3. **Fix `profiles.py:250`.** Add `CONTEXT_OF = {"baspi5": OPDA.EstateAgencyContext, "ta6": OPDA.ConveyancingContext, …}` (all overlays) and emit `vctx opda:overlaysContext CONTEXT_OF[overlay_id]`; retain the profile-layer link under a distinct `opda:profileLayer` predicate if still required by [ODR-0010](../ontology/odr/ODR-0010-overlay-profile-mechanism.md). For now this corrects `baspi5.ttl` (→ `opda:EstateAgencyContext`); the map is ready for the other profiles as they are emitted.
4. **Dormant derivation rule.** Author the SHACL-AF `CONSTRUCT { ?term opda:servesContext ?ctx } WHERE { ?vc opda:overlaysContext ?ctx ; opda:requires ?term . FILTER(STRSTARTS(STR(?term), STR(opda:))) }` in `emitters/shapes.py`, emitted to `opda-shapes.ttl` but **excluded from the active validation set** (dormant) per [ODR-0017](../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md) + ODR-0019 Rule 8.
5. **Regenerate + version.** Bump `foundation.ttl` `owl:versionInfo` for the new emitted artefact (the scheme rides the foundation `owl:versionIRI` — no per-scheme version); regenerate; confirm byte-identity on second run.

### Consequences

* Good, because the bounded-context scheme becomes machine-readable and regenerable, closing the gap ODR-0019/0020 opened; the `/modelling/bounded-contexts` prose finally has a TTL counterpart.
* Good, because the `opda:overlaysContext` bug fix makes the ODR-0020 derivation possible at all — before this, the only context edge in the graph pointed at a layer, not a context.
* Good, because membership stays a derived view (no hand-authored `servesContext`), so it cannot drift from the profiles.
* Bad, because the term→context map is incomplete until the five unwritten form-profile emitters (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29…) land — this ADR delivers the scheme + the wiring + one corrected profile, not the full mapping. The remaining profile emitters are downstream work (their own ADR or the descriptive-layer backlog).
* Bad, because a new emitted artefact + foundation version bump touches the byte-identity baseline; the CI baseline must be re-pinned in the same commit.
* Neutral, because upstream authorities and spanning concerns need no new emission (they reuse `opda:Organisation`/`prov:Agent` and ODR-0006/0007); only `opda:consumesFrom` is newly declared.
* Neutral, because the derivation ships dormant — no behaviour change for current consumers until the Rule 8 gate is opened.

### Confirmation

- **Byte-identity CI** ([ADR-0007 §6a](./ADR-0007-ontology-generator-specification.md)): second regeneration produces identical bytes; baseline re-pinned.
- **Structural tests** (`tools/opda-gen/tests/`): `opda-contexts.ttl` declares exactly one `skos:ConceptScheme` and six `skos:Concept`s, each `skos:topConceptOf` the scheme; the three annotation properties are declared; no domain term carries `skos:inScheme opda:BoundedContextScheme` (the ODR-0020 Rule 5 firewall).
- **Bug-fix test**: `baspi5.ttl` emits `opda:overlaysContext opda:EstateAgencyContext` (not the `profiles/foundation` layer IRI).
- **Dormancy test**: the SHACL-AF CONSTRUCT parses and is present in `opda-shapes.ttl` but is excluded from the active validation profile (fires no result on the 15 exemplars).
- **`odr-review` / CI guard**: no upstream authority is typed `skos:Concept`; no hand-authored `opda:servesContext` triple exists in source TTL.

## Amendment — Council Session 021 (2026-05-30; pending OPDA WG ratification)

[Session 021](../ontology/odr/council/session-021-bounded-context-implementation-plan.md) (9-voice Full Council; 9–0 hybrid verdict) revises this ADR's authority model and scope. The governance directive (one-go delivery, full coverage, no gates) places these changes in the **same delivery** as the original five work-items — ADR-0028 and ADR-0029 are executed alongside, not sequenced behind.

1. **Authority inversion (work-item 2 reframed).** `opda:definedInContext` is the **authoritative** home predicate, **generated from each term's `dct:source` provenance** (data-dictionary originating-form), default descriptive → foundation/shared-kernel, residue via ODR-0008 §Q1a's register — *not* hand-authored, *not* homonym-gated (per the ODR-0019 Rule 8 S021 carve-out). `opda:servesContext` is **derived/advisory** (the existing CONSTRUCT, work-item 4). Each of the three predicate declarations additionally carries `rdfs:isDefinedBy` → ODR-0019/0020 + `dct:source`.
2. **Cross-check shape (new, dormant).** Author in `emitters/shapes.py` → `opda-shapes.ttl` a `sh:Warning` SHACL-AF shape that flags any term whose derived `opda:servesContext` set has no authored `opda:definedInContext` backing (a profile requires a term in a context the ontology has not claimed — a placement-review flag, never a redefinition). `implements: ODR-0017`; severity ∈ {Info, Warning}; shipped excluded from the active set.
3. **Total-cover CI + firewall guards (new — ODR-0020 Rule 5 S021).** Add F2 (no `opda:Organisation` typed a context `skos:Concept`), F3 (no hand-authored `opda:servesContext` in source TTL), and the **total-cover** assertion (every owned domain term has `definedInContext` OR `consumesFrom` OR is on the D2 scaffolding allow-list) to §Confirmation, alongside the existing F1 firewall test.
4. **House-style deltas pinned.** The context scheme's emission test pins: (i) every concept carries `skos:topConceptOf` (flat scheme — already work-item 1); (ii) the scheme is kept **out** of the ODR-0011 §8a `ufoCategory` value-vocabulary lint (it is a perspectival facet, none of the seven value categories — governed by ODR-0019/0020); fire the §8a eighth-category re-open trigger only if tooling later demands an explicit triple.
5. **Scope under the one-go directive.** The "incomplete until the unwritten form-profile emitters land" limitation (Consequences, 4th bullet) **no longer applies as a staged limitation**: ADR-0029 emits **all** profiles and ADR-0028 the **full** 935-leaf descriptive walk + the generated home-pass in the same delivery. The CI baseline is re-pinned once for the complete delivery. No ADR-0005 §G "deferred remainder" row is created — nothing is deferred. (`opda:servesContext` CONSTRUCT activation vs the active validation set remains governed by ODR-0019 Rule 8; delivering it active is a one-line ODR-0019 amendment folded into the same delivery if the WG lifts dormancy.)

## Amendment — Council Session 022 (2026-05-30; SUPERSEDES the Session 021 amendment above; pending OPDA WG ratification)

[Session 022](../ontology/odr/council/session-022-form-shacl-profile-convention.md) (Queen Baker; DA Davis; 6–0) reviewed this ADR against published convention and **reversed the bespoke parts** of the S021 amendment. The emission **shrinks**:

1. **`opda:definedInContext` is NOT declared or emitted — retired.** It reinvents three published standards. Home = `rdfs:isDefinedBy` → owning module (concern; emit mechanically) + `dct:source` (provenance; already emitted) + `dct:subject` → context concept (community-ownership; **authored-or-absent, gated, none today**). The S021 "authority inversion / generated home" item is withdrawn.
2. **No cross-check shape, no total-cover CI, no F2/F3** — they policed a stored `servesContext` + an authored home that S022 deletes. **F1 firewall retained.**
3. **`opda:servesContext` = a dormant SHACL-AF rule, NEVER materialised** (run on demand; activates only on a named term-grain consumer, ODR-0019 Rule 8).
4. **`opda:overlaysContext` is DROPPED** (not re-pointed, not replaced) — the work-item 3 `CONTEXT_OF`→`…Context` plan is **withdrawn**. Per governance directive (2026-05-30 — *"the SHACL overlay IS the form; no profile-object/PROF layer"*): the form↔base link is structural (the shapes' `sh:targetClass` on the `opda:` base — ODR-0010); the form↔community link is one standard triple on the form graph (`dct:subject`/`dct:publisher` → its context concept). **No `prof:Profile`, no `prof:isProfileOf`, no spike.** `opda:ValidationContext` stays exactly as ODR-0010 defines it (not re-typed, nothing layered on). This **moots** the `profiles.py:250` bug.
5. **`opda:requires` dropped** (redundant — the shapes' `sh:path`/`sh:minCount` set already enumerates it).
6. **KEEP (S022 6–0):** the `emitters/contexts.py` SKOS scheme + 6 concepts (work-item 1), `opda:consumesFrom`, per-shape `dct:source`. A form is a **DCAP**; the constraint table a **DCTAP**; `profiles.py` already runs the TAP→SHACL step.

Work-item 1 (scheme) stands. Work-items 2–4 are revised per the above; the byte-identity discipline (5) stands. See [session-022 §Disposition].

## More Information

- **Realises**: [ODR-0020 — Bounded-Context Scheme and Mapping](../ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md) (the decision); refines [ODR-0019](../ontology/odr/ODR-0019-bounded-context-representation.md) (the pattern + Rule 8 gate).
- **Generator framework**: [ADR-0007](./ADR-0007-ontology-generator-specification.md) (deterministic emission), [ADR-0008](./ADR-0008-generator-implementation-infrastructure.md) (infrastructure — `implements`), [ADR-0010](./ADR-0010-skos-vocabulary-emission.md) (the SKOS substrate this mirrors), [ADR-0011](./ADR-0011-module-tbox-emission.md) (module emission + `owl:imports` wiring), [ADR-0013](./ADR-0013-overlay-profile-emission.md) (the profile emitter being corrected).
- **Files touched**: `tools/opda-gen/src/opda_gen/emitters/contexts.py` (new); `…/emitters/profiles.py:250` (overlaysContext fix + `CONTEXT_OF`); `…/emitters/shapes.py` (dormant CONSTRUCT); `source/03-standards/ontology/opda-contexts.ttl` (new, generated); `…/profiles/baspi5.ttl` (regenerated); `…/foundation.ttl` (versionInfo).
- **Council provenance**: [ODR session-020](../ontology/odr/council/session-020-bounded-context-scheme-and-mapping.md).
- **Implementation-planning follow-on**: [ODR session-021 — Bounded-Context Implementation Plan](../ontology/odr/council/session-021-bounded-context-implementation-plan.md) (2026-05-30). Proposes **revising this ADR** to: declare `opda:definedInContext` **authoritative** (generated-from-provenance) and `opda:servesContext` **derived/advisory**; add a dormant **cross-check shape** (`sh:Warning` when a derived `servesContext` has no authored `definedInContext` backing); add a **total-cover CI** assertion (every domain term has `definedInContext` OR `consumesFrom` OR is on the scaffolding allow-list); pin two house-style deltas (`skos:topConceptOf` on every concept; keep the context scheme out of the ODR-0011 §8a `ufoCategory` value-lint). The two downstream builds below are promoted to **ADR-0028** (descriptive walk + generated home-pass) and **ADR-0029** (`ProfileSpec` refactor + 14-profile rollout). **Revision pending OPDA WG ratification.**
- **Downstream**: the unwritten form-profile emitters (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29) complete the term→context map as each lands — tracked by **ADR-0029** per session-021.
