---
status: proposed
date: 2026-05-30
tags: [ontology, generator, descriptive-layer, declare-once, bounded-context, home-pass, emission]
supersedes: []
depends-on: [ADR-0007, ADR-0026, ODR-0008, ODR-0019, ODR-0020]
implements: []
---

# Descriptive-Layer Walk Emission and Generated Home-Pass

> **Amendment — Council Session 022 (2026-05-30; 6–0; pending OPDA WG ratification).** A convention-review council revised the "home-pass" of this ADR. **`opda:definedInContext` is RETIRED** (it reinvents `rdfs:isDefinedBy` + `dct:source` + `dct:subject`). Work-item 4 ("generated `opda:definedInContext` home-pass") becomes a **trivial `rdfs:isDefinedBy → owning module` emission** (the generator already knows each term's module) plus the already-emitted `dct:source`; community-ownership, if ever needed, is `dct:subject` → a context concept — **gated, none today, and NEVER generated from `dct:source`** (the brittle S021 mapping is dropped). The total-cover CI (Confirmation) reduces to "every term carries `rdfs:isDefinedBy`." **The 935-leaf datatype-property walk (work-items 1–3, 5, 6) is UNAFFECTED** — it stays on its own merits. Per-leaf `opda:requires` (work-item 3) is **dropped as redundant** (the shapes' `sh:path`/`sh:minCount` set already enumerates required terms). See [session-022 §Disposition](../ontology/odr/council/session-022-form-shacl-profile-convention.md).

> **Implementation status — 2026-05-30: DEFERRED to a curated pass (not executed).** Attempting the walk against the data dictionary established that **it is not the ~90%-mechanical projection this ADR (and S021) assumed**, and emitting it mechanically would be unsound:
> - **No leaf→term mapping exists.** `source/00-deliverables/semantic-models/{mappings,ontology,shapes}/` are empty; nothing references `opda:`. The existing ~23 descriptive datatype properties in `opda-property.ttl` were each **hand-curated** (semantic short names like `builtForm`/`hasUPRN`, hand-assigned `rdfs:domain` Property vs LegalEstate vs Address, comments citing UFO category + scheme + form anchor). There is no mechanical name/domain derivation to extend.
> - **Naive naming collides catastrophically.** Of **1,521** annotated base leaves, only **250** have a unique final path-segment — `details` recurs in 269 distinct leaves, `price` in 99, `comments` in 96. Last-segment naming would collapse 1,521 distinct attributes into ~351 colliding properties. "Declare-once" (ODR-0008) reconciles the *same* attribute across *overlays*, **not** every base leaf sharing a final segment.
> - **The IRIs are permanent.** ~900 `opda:` datatype-property IRIs are published, stable identifiers; an auto-derived scheme cannot be cleanly reversed.
>
> **Decision (Henrik, 2026-05-30):** defer the walk to a **curated pass with the WG** rather than auto-emit. The BASPI5 slice stands. This supersedes the "~90% mechanical / one-go" framing of work-items 1–2 above for the non-BASPI5 remainder; the `rdfs:isDefinedBy` home-pass and the totality CI are deferred with it. Downstream effect: [ADR-0029](./ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md)'s 30 non-BASPI5 profiles are emitted **thin** (header + community tag) because they have no term-grain `opda:` properties to constrain until this walk lands.

> **Amendment — Council Session 023 (2026-05-30; re-scoped by [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md); pending OPDA WG ratification).** ODR-0022 (Descriptive-Layer Import Strategy & Property Categorisation) **re-scopes the deferred walk** — it does not reverse the deferral. The "not-mechanical / curated-WG-pass" finding above stands in full; ODR-0022 *narrows what the curated pass emits*. The walk's target is no longer the ~935-leaf flat emission of work-items 1–3, 5, 6, but **Category G (~181 distinct genuine descriptive concepts) plus the regulatory-salience allow-list** carved from Categories A/E (ODR-0022 §Rules.1 + §Rules.3). The remaining ~750 leaves are routed to category treatments (collapse-to-pattern / reuse-upstream / SKOS-scheme / class-promotion) realised in other records — **not** minted as flat datatype properties (ODR-0022 §Rules.6 anti-patterns). The bounded, gated walk emits under three enforceable gates (ODR-0022 §Rules.2): **G1 path-aware binning** (so `priceInformation.price` lands in G and `fixturesAndFittings.*.price` in D — last-segment naming is forbidden), **G2 schema-leaf-path `dct:source`** (point provenance at the form-question leaf path, never at the deciding ODR), and **G3 coverage-by-test** (a BASPI5 round-trip on the collapsed TBox + a worked per-leaf SPARQL retrieval, in place of asserting totality). Net effect on this ADR: work-item 1's range shrinks from ~900 to ~181 + the allow-list; the totality CI of §Confirmation is replaced by ODR-0022 G3; and the C/D SKOS schemes + the E class become emitter targets alongside the narrowed walk. Cite [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) §Decision/§Rules + [session-023](../ontology/odr/council/session-023-descriptive-layer-import-strategy.md).

## Context and Problem Statement

[ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md) ratified **declare-once-reconcile-overlays**: every descriptive property is declared **once** in the TBox on `opda:Property`/`opda:LegalEstate`, sourced from a data-dictionary leaf, with per-form variation pushed onto the SHACL overlay profiles. The discipline was ratified; the **mechanical walk was never executed**. Verified state: `source/03-standards/ontology/opda-descriptive.ttl` is a **5-class stub with 0 datatype properties**; only the BASPI5 slice (17 Property/LegalEstate + 2 Agent datatype properties, [ADR-0005](./ADR-0005-deferred-work-register.md) §G11) ever landed. Of ~1,556 unique data-dictionary leaves, **935 are annotated** — and these descriptive leaves are the bulk of the schema→ontology coverage gap.

[Council Session 021](../ontology/odr/council/session-021-bounded-context-implementation-plan.md) (2026-05-30) established two things that make this ADR necessary now: (1) Allemang's finding that the walk is **~90 % pure mechanical projection** from the data dictionary — *"scaling 23 → ~900 is not 39× the deliberation; it is 39× the same loop"* — so it is mechanical-and-ready, not "demand-deferred"; and (2) the **generated home-pass**: each descriptive term's bounded-context *home* (`opda:definedInContext`) is fixed by the `dct:source` provenance the leaf already carries at mint time, so it is captured **in the same generator pass**, not as a follow-on. The directing governance ruled **one-go, full coverage, no staging** — so the full walk + the home-pass land together, superseding ADR-0005 §G11's demand-deferral framing for the non-BASPI5 remainder.

## Decision Drivers

- **Generator-first determinism** — emission is byte-identical and regenerable ([ADR-0007 §6a](./ADR-0007-ontology-generator-specification.md)); the walk is the same deterministic single-pass that emitted the BASPI5 slice, ranging over more leaves.
- **Model the data you have** — emit the content the dictionary supplies (label, comment, `dct:source`, defaulted range); **do not invent** `rdfs:range` precision, property hierarchies, or sub-structure the dictionary does not give (ODR-0008 §Q6a flat-default; the held-as-live `Building`/`Room` deferral).
- **Home is provenance, captured at mint time** — `opda:definedInContext` is generated from each leaf's `dct:source`, not hand-authored (ODR-0019 Rule 8 S021 carve-out; ODR-0020 ownership layer).
- **No silent omissions** — every annotated leaf emits, or is a ratified class promotion; the totality is CI-asserted (ADR-0005 §G11's tightened closure, generalised).
- **One delivery** — the full walk, not a slice; executed with [ADR-0029](./ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) and the [ADR-0026](./ADR-0026-bounded-context-scheme-emission.md) scheme emission.

## Considered Options

- **Option A — full mechanical walk + generated home-pass, in one deterministic pass (CHOSEN).** Extend the G11 emitter from 23 to the full annotated-leaf set; emit per-leaf `opda:requires`; generate `opda:definedInContext` from `dct:source`; reconcile spanning leaves via ODR-0008 §Q1a's existing register.
- **Option B — per-leaf hand-curation of ranges + hierarchy.** Rejected: violates model-the-data-you-have and ODR-0008 §Q6a flat-default; 900 hand-curations is the drift trap; range-tightening is demand-driven refinement, not blocker.
- **Option C — keep the non-BASPI5 remainder demand-deferred** (ADR-0005 §G11 framing). Rejected by the S021 governance directive (one-go, full coverage).

## Decision Outcome

Chosen option: **Option A.** Work items (all in the single delivery):

1. **Datatype-property emission (the walk).** For every annotated leaf, deterministically emit `opda:<leafLocalName> a owl:DatatypeProperty` with `rdfs:label` + `rdfs:comment` (dictionary), `rdfs:domain` (`opda:Property` / `opda:LegalEstate` per ODR-0008 §Q5a placement), `rdfs:range` (dictionary type, **default `xsd:string`**), `dct:source` (form-question IRI per [ODR-0004](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) §7a). **Flat** — no `rdfs:subPropertyOf` (ODR-0008 §Q6a). ~900 properties.
2. **Class-promotion pass (ODR-0008 §Q4a three-criterion test).** The ratified five (`Survey`, `EPCCertificate`, `Search`, `Valuation`, `Comparable`) are present; apply the test mechanically to the remaining `object`-typed leaves. `Building`/`Room` stay deferred (Davis S008 held-as-live) unless a BASPI5 round-trip query exercises sub-Property reasoning.
3. **Per-leaf `opda:requires` emission.** Into each form's `opda:ValidationContext`, driven by the dictionary's per-overlay columns — upgrading the [ODR-0020](../ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md) derivation from class-grain (the current 7-class BASPI5 `requires`) to **term-grain**.
4. **Generated `opda:definedInContext` home-pass.** Per term, from `dct:source` provenance: single-source → that overlay's industry context; `propertyPack`-level / multi-source → **foundation/shared-kernel home (D1)**; authority-sourced → `opda:consumesFrom` an `opda:Organisation` (bucket C); infrastructural → **D2 scaffolding allow-list**. Ambiguous residue → ODR-0008 §Q1a reconciliation register (reuse, do not invent a parallel register).
5. **Reconciliation register.** Spanning-leaf detection by SHACL shape-target convergence (ODR-0008 §Q1a); per-leaf register entries record the reconciliation outcome.
6. **Determinism + version.** Alphabetised emission, SHA-256 blank-node skolemisation, LF/no-BOM/final-newline; bump `foundation.ttl` `owl:versionInfo`; re-pin the byte-identity baseline once for the delivery.

### Consequences

* Good, because it closes the schema→ontology coverage gap — the ~3 %-of-descriptive-discipline state becomes full; the descriptive layer finally exists.
* Good, because the home-pass is captured at mint time from provenance the leaf already carries — no separate hand-authoring chore, no drift (ODR-0019 Rule 8 S021 carve-out).
* Good, because the term-grain `requires` makes the ODR-0020 `servesContext` derivation meaningful (it was class-grain only).
* Bad, because ~900 new properties is a large byte-identity baseline change; re-pinned once, for the complete delivery.
* Neutral, because restraint (no invented ranges/hierarchies/sub-structure) leaves demand-driven refinement (SHACL `sh:datatype` tightening in a profile; `subPropertyOf` on a named-consumer query) as future opportunistic work — not a regression, the honest "model the data you have" line.

### Confirmation

- **Byte-identity CI** ([ADR-0007 §6a](./ADR-0007-ontology-generator-specification.md)): second regeneration identical; baseline re-pinned.
- **Totality assertion** (generalises G11's tightened closure): count(annotated leaves) == count(emitted datatype properties) + count(ratified class promotions); **zero silent omissions**.
- **Flat-default test**: `ASK { ?p a opda:DescriptiveProperty . ?p rdfs:subPropertyOf ?q }` → FALSE in base emission (ODR-0008 §Q6a).
- **Range-restraint check**: no hand-curated non-`xsd:string` range in this pass beyond what the dictionary supplies.
- **Total-cover CI** (ODR-0020 Rule 5 S021): every emitted term has `opda:definedInContext` OR `opda:consumesFrom` OR is on the D2 scaffolding allow-list.
- **Home-provenance test**: every `opda:definedInContext` traces to a `dct:source` (generated, not hand-authored); no `definedInContext` without a provenance basis.

## More Information

- **Realises**: [ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md) (the 935-leaf declare-once walk + Q1a/Q4a/Q5a/Q6a disciplines); the home-pass realises [ODR-0019](../ontology/odr/ODR-0019-bounded-context-representation.md) Rule 5/8 + [ODR-0020](../ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md) ownership layer.
- **Council provenance**: [ODR session-021 — Bounded-Context Implementation Plan](../ontology/odr/council/session-021-bounded-context-implementation-plan.md) (Allemang's mechanical-walk-now case; Guizzardi/Evans-Vernon's home-from-provenance; governance one-go directive).
- **Generator framework**: [ADR-0007](./ADR-0007-ontology-generator-specification.md) (deterministic emission), [ADR-0026](./ADR-0026-bounded-context-scheme-emission.md) (the scheme + predicates this co-delivers with).
- **Co-delivered with**: [ADR-0029](./ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) (the profiles that `require` these terms).
- **Files touched**: `tools/opda-gen/src/opda_gen/emitters/{descriptive,property,agent}.py` (walk); `…/emitters/profiles.py` (per-leaf `requires`); `…/emitters/contexts.py` or the annotations graph (`definedInContext` home-pass); `source/03-standards/ontology/opda-descriptive.ttl` + `opda-property.ttl` (regenerated, ~900 properties); the reconciliation register artefact.
- **Supersedes framing**: ADR-0005 §G11's "remaining ~44 leaves demand-deferred" / "the rest land per downstream demand" — the S021 governance directive replaces demand-deferral with full one-go emission.
