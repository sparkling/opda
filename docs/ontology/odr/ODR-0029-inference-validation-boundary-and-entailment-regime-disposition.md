---
status: accepted
date: 2026-06-14
kind: architecture
tags: [entailment, inference, validation, shacl, domain-range, rdfs-plus, frozen-rules, council-039]
scope:
  - pdtf-v3:propertyPack.energyEfficiency.certificate.currentEnergyRating
council: session-039
supersedes: []
depends-on: [ODR-0004, ODR-0013, ODR-0025, ODR-0026, ODR-0027, ODR-0028, ADR-0014, ADR-0035]
implements: []
---

# Inference/Validation Boundary and the Entailment-Regime Disposition

## Context and Problem Statement

A review of OPDA's load-time entailment (the bespoke 7-rule subset of `config/opda-rdfs-plus.rules`, then named `config/opda-owl-rl-safe.rules`; ODR-0025/0026, ADR-0035) raised three suspicions: that the subset is non-standard and "smells", that it masks modelling errors, and specifically that the EPC-certificate domain mismatch (ODR-0028 R3) is a modelling error that the closure papers over by excluding `rdfs:domain`/`range`. Empirically the closure adds **0 triples** over the schema (only `rdfs:subClassOf` type-propagation can fire; the model is flat by doctrine — ODR-0027), which sharpened the question of whether the materialisation layer earns its keep.

Council [session-039](council/session-039-entailment-regime-and-epc-modelling.md) (Full Council; Queen Allemang, DA Hendler; Guizzardi, Knublauch, Cagle, Hitzler) adjudicated it. The forensic finding, verified against the emitted artefacts, re-located the problem: the **core model is correct** and the **emitted SHACL is correct**, so the issue is neither the model nor the entailment rules — it is a missing validation layer plus three edge defects. This ODR records the resulting boundary doctrine and disposition; the operator ratifies, with one standing constraint: **the entailment rules' logic is frozen** (renaming/re-documenting is permitted; adding, removing, or editing rule bodies — including re-admitting `domain`/`range` as entailment — is not).

## Decision Drivers

* The asserted model is sound with or without the closure; correctness must live in *modelling* + *validation*, not in entailment (ODR-0027 facets-not-subclasses; the closure is minimal by design).
* Excluding `rdfs:domain`/`range` from inference is correct (materialising types from predicate use is unsound for master data — ODR-0025 §R2), but leaves a blind spot: domain mismatches are currently neither inferred nor validated.
* The entailment rules are stable, audited, and adopted from established prior art (see §More Information) — their *logic* is not to be churned.
* Honesty of naming: the ruleset is a sound but RL-incomplete fragment, not OWL 2 RL.

## Considered Options

* **Option A (chosen) — Freeze the rule logic; add SHACL domain/range constraints; fix the EPC defect at its real edges; query the asserted model.** Keep the 7 rules' logic untouched (rename/re-document for honesty is fine); put `domain`/`range` on the validation side as SHACL; correct the round-trip validator and the dangling shape.
* **Option B — Modify the entailment rules (e.g. re-enable `domain`/`range`, or add rules to surface the EPC case).** Rejected: re-enabling `domain` *materialises* `EPCCertificate ⊑ Property` and cascades violations against innocent data — inference would *propagate* the bug, not catch it (Knublauch/Hitzler). Also forbidden by operator constraint (no rule-logic changes).
* **Option C — Drop/shrink the materialised closure.** Rejected: "query the asserted model" is right, but *deleting* the closure relocates entailment, unsound and ungoverned, into every consumer's SPARQL and removes the negative consistency gate (Hendler). Keep it (minimal/dormant), do not delete it.
* **Option D — Re-home `currentEnergyRating` onto the certificate (or add a Property-side `recordsRating`).** Rejected: the rating is a Quale borne by the Property; the certificate is an Information Object that *records* it. Re-homing would *introduce* the representation-vs-represented conflation, not cure it (Guizzardi).

## Decision Outcome

Chosen option: "Option A", because the model and the emitted SHACL are already correct; the only genuine gap is that `domain`/`range` constraints aren't *validated*, and the only live EPC exposure is a validator misconfiguration plus a dangling shape — none of which requires touching the entailment rule logic.

The **inference/validation boundary** is the governing principle: **infer the relations whose closure the author wants materialised** (subclass/subproperty hierarchy, inverse, symmetric, transitive — the 7 frozen rules); **validate the constraints the author wants checked** (`domain`, `range`, cardinality, datatype, identity keys — SHACL). `domain`/`range` sit on the validation side; RDFS only ever put them on the wrong side.

The entailment regime stands, understood as **minimal/dormant**: only `rdfs:subClassOf` type-propagation currently fires (0 triples on the schema, ~30 trivially-recoverable on instance data); the other six rules are dormant carriers that activate when a real construct lands; the **negative consistency gate** (no `owl:sameAs`, no spurious `EPCCertificate ⊑ Property`) is retained as the high-value asset. The **rule logic is frozen**; the ruleset may be **renamed/re-documented** honestly (it is a sound, RL-incomplete RDFS-Plus fragment, *not* an OWL 2 RL reasoner).

### Consequences

* Good, because correctness moves to where it belongs — explicit modelling + SHACL validation — and a misplaced `domain` predicate now fails loudly instead of being silently uncaught.
* Good, because the entailment rules are untouched: zero materialised-triple change, `ci-inference-closure` stays byte-identical, and the audited negative gate is preserved.
* Good, because the naming stops over-claiming OWL 2 RL conformance (a consumer can no longer assume domain/range/equality entailments hold).
* Neutral, because the closure remains a near-no-op today; it is kept as governed insurance, not for current output.
* Bad, because it adds a generated SHACL constraint layer (new emitter surface) and requires correcting two records and one profile shape.

### Confirmation

* The SHACL `domain`/`range`-as-constraint shapes flag a predicate used off-domain as a violation (the EPC mismatch, were it ever re-introduced, fails the gate).
* The ADR-0014 round-trip validates against the materialised Safe-Group closure, not full `inference="rdfs"`; the EPC false positive no longer arises.
* `ci-inference-closure` is byte-identical before/after (rule logic unchanged — only the filename/header/prose differ).
* ODR-0028 R3 wording is corrected to match the emitted artefacts.

## Rules

### R1 — The inference/validation boundary

Infer (materialise) only the relations whose closure is wanted: `rdfs:subClassOf`/`subPropertyOf` transitivity + propagation, `owl:inverseOf`, `owl:SymmetricProperty`, `owl:TransitiveProperty` (the 7 frozen rules, ODR-0025 §R1). Validate (SHACL, never infer): `rdfs:domain`, `rdfs:range`, cardinality, datatype, identity/keys. Re-admitting `domain`/`range`/`sameAs`/functional/equivalence as *entailment* is prohibited (ODR-0025 §R2; unsound for master data).

### R2 — Frozen rule logic (operator constraint)

The entailment rule *logic* (rule bodies, the enabled/excluded set, closure behaviour) is **not to be modified**. Renaming the ruleset file, rewriting its header, and amending the descriptive prose of ODR-0025 §R1 / ADR-0035 for honesty are **permitted** (they change no entailment). `ci-inference-closure` byte-identity is the guard that no logic changed.

### R3 — `domain`/`range`-as-SHACL-constraint pattern

For every property carrying `rdfs:domain C`, emit a node shape `sh:targetSubjectsOf <pred> ; sh:class C ; sh:severity <per ODR-0013>`; for `rdfs:range C`, the `sh:targetObjectsOf <pred> ; sh:class C` dual. This carries the exact semantics of `rdfs:domain`/`range` evaluated closed-world ("are they?") instead of generatively ("therefore they are"), closing the ODR-0025 §R2 blind spot without unsound inference. Realised in `opda-shapes.ttl` (ODR-0004 §3a).

### R4 — The EPC disposition (model is correct; fix the edges)

`opda:currentEnergyRating` (`rdfs:domain opda:Property`, a UFO Quale-in-Region) and `opda:EPCCertificate` (UFO Information Object / `prov:Entity`, ODR-0008d Rule 3) are **modelled correctly**; the emitted `Baspi5_PropertyShape` correctly carries the rating and the `opda:hasEPCCertificate` join. Do **not** re-home the rating; do **not** add a `recordsRating`. The fixes: (a) the round-trip validator → Safe-Group closure not full RDFS (ADR-0014); (b) the **dangling** `Baspi5_EPCCertificateShape` (a bare `sh:targetClass` with no `sh:property`) → remove it or populate it with certificate-intrinsic constraints only (issue date, authority reference, the ODR-0008d IC tuple), never the Property rating; (c) correct ODR-0028 R3's wording (the emitted SHACL does not bind the rating onto the certificate; the exposure is the validator flag + the dangling shape).

### R5 — Honest naming

The ruleset is a **sound, RL-incomplete fragment** (removing rules from a sound set reduces completeness, never soundness). It is **not** an OWL 2 RL reasoner and its output is **not** the OWL 2 RL closure. Rename/re-document accordingly (e.g. "RDFS-Plus") with a header stating SOUND-but-INTENTIONALLY-INCOMPLETE; keep "model-but-don't-evaluate" (ODR-0026 R2). No rule-logic change.

## More Information

* Ratifying deliberation: [Council session-039](council/session-039-entailment-regime-and-epc-modelling.md) — verdicts Q1 REVISE (EPC error real but re-located), Q2 REJECT-logic/REVISE-name, Q3 SHRINK (keep, don't drop), Q4 AFFIRM (domain/range as SHACL). DA Hendler WITHDRAWN (mechanism kept) + CONCEDED rename.
* Records this disposition amends: [ADR-0035](../../adr/ADR-0035-load-time-owl-rl-safe-inference-materialisation.md) (reframe minimal/dormant + honest naming + frozen-logic note), [ODR-0028](ODR-0028-descriptive-layer-completeness-reconciliation.md) R3 (wording correction), [ADR-0014](../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md) (round-trip inference flag), [ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R1 (naming prose).
* Model facts: `opda-property.ttl` (`currentEnergyRating` domain `Property`; `hasEPCCertificate` join), `opda-descriptive.ttl` (`EPCCertificate` as Information Object), `profiles/baspi5.ttl` (`Baspi5_PropertyShape` owns the rating; `Baspi5_EPCCertificateShape` empty); inference impl `scripts/fuseki-load.mjs` + `config/opda-rdfs-plus.rules`; classification doctrine [ODR-0027](ODR-0027-classification-roles-inheritance-skos-doctrine.md).
* Consolidating doctrine: [ODR-0033](ODR-0033-owl-axioms-as-documentary-ai-signal-doctrine.md) — the §R1 inference/validation boundary is one of the fragments it gathers into the single "author OWL/RDFS axioms as documentary AI-signal, never entailed" statement.
* Prior art: the entailment ruleset is adopted from a sibling project's ratified safe-rule lineage (`~/source/hm/semantic-modelling`, council sessions 103–105; `config/hm-owl-rl-safe.rules`), recorded in [ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) / [ODR-0026](ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md) §More-Information.
