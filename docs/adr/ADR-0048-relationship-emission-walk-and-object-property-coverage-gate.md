---
status: proposed
date: 2026-06-17
tags: [ontology, generator, object-properties, relationships, ci-gate]
supersedes: []
depends-on: [ODR-0032, ODR-0006, ODR-0007, ADR-0032, ADR-0011]
implements: []
---

# Relationship-emission walk + object-property coverage gate

## Context and Problem Statement

[ODR-0032](../ontology/odr/ODR-0032-relationship-layer-object-properties.md) ratified the ontology's **relationship layer** — the inter-entity OWL object properties ODR-0006/0007 specified — and a relationship-completeness criterion (every inter-entity association reified as an `owl:ObjectProperty` with `rdfs:domain` + `rdfs:range`). The generator does not implement it. Today `opda-gen` (`emitters/modules/agent.py`, `transaction.py`) emits the relator-spine properties `opda:founds`/`opda:mediates` as **rangeless `owl:ObjectProperty` stubs** ("design-time, never reasoned") and never emits `opda:playedBy`/`opda:plays`, the `opda:SellerShape` role-play SHACL shape, the structured `opda:Name` class, `opda:Person`/`opda:Organisation` → `opda:Address`, `Transaction` → participant/property, or the chain predicates `opda:dependsOnTransaction`/`opda:chainMembers`. The corpus therefore has only **7** class→class object properties; ~30 classes are unconnected.

Crucially, the omission was never caught because the only completeness gate over the corpus — `ci-category-g-coverage` (ADR-0032) — measures **descriptive datatype-leaf** coverage, not object properties. The descriptive layer got a walk *and* a gate; the relationship layer got neither.

This ADR is the engineering that realises ODR-0032: a relationship-emission pass in the generator, a new CI gate over the object-property layer, and the regeneration that re-emits the corpus. It is the object-property analogue of how [ADR-0031](./ADR-0031-category-g-curated-walk-execution-plan.md)/[ADR-0032](./ADR-0032-category-g-walk-emission-and-coverage-gate.md) realised ODR-0022 for the datatype layer.

## Decision Drivers

* **Parity with the descriptive layer** — that layer is walked and gated; the relationship layer must be too, or it silently regresses.
* **Generated, not hand-edited** — every TTL header says `DO NOT HAND-EDIT`; the fix MUST live in the emitters + be regenerated, not patched into the corpus.
* **Determinism / byte-identity** — the corpus is byte-identity-pinned; new triples must be emitted deterministically and re-pinned (TTLs, `ontology-model.json`, graph, exemplar expected-reports).
* **Separation of graphs** — object properties land in the class graph; the role-play/relator constraints land in the shapes graph (ODR-0013), never conflated.
* **No new modelling debate** — the *what* is settled by ODR-0032 §Rules; this ADR is purely *how*.

## Considered Options

* **Option A (chosen) — Emitter relationship-pass + `ci-object-property-coverage` gate + regenerate.** Implement the ODR-0032 R2 inventory in the module emitters with domain+range and the SHACL shapes; add a CI gate that fails on rangeless object properties and unreified associations; re-emit and re-pin.
* **Option B — Hand-edit the TTL corpus to add the properties.** Rejected: the corpus is generator output (`DO NOT HAND-EDIT`); a hand-edit breaks byte-identity on the next emit and is immediately overwritten.
* **Option C — Emit the properties but add no gate.** Rejected: repeats the original failure mode — without a coverage gate the relationship layer drifts again the moment a new module is added.
* **Option D — Express the relationships only as SHACL shapes, not OWL object properties.** Rejected per ODR-0032 Option D: SHACL constrains, the object property is the navigable data; a `sh:path` to an undeclared predicate is not an edge.

## Decision Outcome

Chosen option: **"Option A — emitter relationship-pass + coverage gate + regeneration"**, because it fixes the underlying cause (the emitters never produced the layer; nothing gated it) rather than patching individual properties, and brings the relationship layer to parity with the gated descriptive layer.

### Consequences

* Good, because the agent/transaction/role classes become connected and the model answers the domain's competency questions (parties-of-transaction, plays-role, has-address, binds-title).
* Good, because `ci-object-property-coverage` makes relationship completeness a counted, enforced invariant — the failure can't silently recur.
* Bad, because it is a large byte-identity-affecting regeneration (new object properties + SHACL shapes across `opda-{agent,transaction,property,descriptive}*.ttl`, regenerated `ontology-model.json` + graph + exemplar expected-reports) and requires a generator version bump.
* Bad, because new SHACL role-play/relator shapes may surface conformance violations in existing diagnostic exemplars that must be reconciled.
* Neutral, because the participant *attribute* backlog (`phone`/`email`/structured `name`/`verification`) is explicitly out of scope (ODR-0032) — this changes only the object-property layer.

### Confirmation

* The new `opda-gen ci-object-property-coverage` gate passes (and is wired into `make ci` + the three-graph CI surface + the AWS deploy gates).
* Byte-identity holds after re-pin (`make verify-ontology`), repo-root `tests/baspi5_round_trip/` passes, and `emit-exemplar-reports` is byte-identical.
* The diagnostic exemplars gain participant-relationship facets that validate against the new role-play/relator shapes.
* Post-regeneration, a count of class→class object properties rises from 7 to cover the **GATED** ODR-0032 §R2 inventory; every `owl:ObjectProperty` is type-pinned in OWL **or** SHACL (none rangeless-AND-shapeless), `rdfs:domain`/`rdfs:range` appears only on single-domain edges with no never-reasoned commitment (`founds`/`mediates` are SHACL-typed), and each GATED edge has a passing worked competency query (Council session-047).

## Implementation Plan

Phased; each phase regenerates + keeps gates green before the next.

1. **Relator spine made functional.** In `emitters/modules/agent.py`/`transaction.py`, **type-pin `opda:founds` (Relator → Role) and `opda:mediates` (Proprietorship → Proprietor) in SHACL `sh:class`, NOT in `rdfs:domain`/`rdfs:range`** (Council [session-047](../ontology/odr/council/session-047-relationship-layer-object-properties.md)): add `sh:class opda:Proprietor` to the existing `ProprietorshipMediationShape` (`opda-agent-shapes.ttl:59`, today range-unpinned — `sh:minCount 2` only), a Relator→Role `sh:class` shape for `founds`, and a SHACL subject-guard confining their subjects to the relator kinds (conservative-by-construction). **Keep** their `"Design-time, NEVER reasoned"` `rdfs:comment`s (ODR-0029/0030/0031) — no `rdfs:range` is added, so the comment stays true. (Asserting `rdfs:domain`+`rdfs:range` on `founds`/`mediates` is a deferred optional future decision, electable only by deleting those comments + overriding ODR-0029/0030/0031 — out of scope here.) Emit `opda:playedBy`/`opda:plays` (Role → Person/Organisation) as an **OPTIONAL, distinct-node-only** edge (never a self-edge; bearer disjunction in the `opda:SellerShape`/role-play SHACL `sh:or ([sh:class Person][sh:class Organisation])`, ODR-0013 — **not** an `rdfs:range`/`owl:unionOf`); emit `opda:hasRegisteredTitle` (Proprietorship → RegisteredTitle) with `rdfs:domain`+`rdfs:range` (single-domain, no never-reasoned commitment).
2. **Kind-layer joins (Council session-047 revised).** Do **NOT** mint an `opda:Name` class: emit `opda:hasName` as a structured **datatype/value** path (no `rdfs:domain`; component structure + bearer-typing in a SHACL `NameShape`). A *dependent* `opda:Name` node is promoted only on a named consumer that dereferences to it — not met today (`opda:NameChangeEvent` points at the `Person` with string-literal names). Extend the `opda:hasAddress` **predicate** to Person/Organisation by **dropping its `Property`-only `rdfs:domain`** (bearer-typing → SHACL; keep `rdfs:range opda:Address`); do **NOT** manufacture or re-settle the `opda:Address` class/IC — Mode-vs-Resource is ODR-0015's open question, so Address stays RESIDUE-PENDING.
3. **Transaction joins + chain.** Emit `opda:hasParticipant` (Transaction → Seller/Buyer), `opda:concernsProperty` (Transaction → Property), and the chain predicates `opda:dependsOnTransaction` (Transaction → Transaction) + `opda:chainMembers` (TransactionChain → Transaction) — currently described only in comments — with the existing chain-length SHACL (`sh:maxInclusive 7`, ADR-0012).
4. **The gate (Council session-047 rule — replaces the absolute domain+range mandate).** Add `opda_gen/ci/object_property_coverage_test.py` + `opda-gen ci-object-property-coverage`: FAIL on (a) any `owl:ObjectProperty` that is **rangeless AND shapeless** (no `rdfs:range` *and* no SHACL `sh:class`/`sh:node` value-type shape) — **not** on rangelessness per se; (b) any `rdfs:domain`/`rdfs:range` that is **not universally true** (catches a single `rdfs:domain opda:Person` on a multi-bearer predicate like `hasName`/`hasAddress`/`playedBy`); (c) any **GATED** ODR-0032 §R2 association lacking **one worked SPARQL competency query** that traverses it; (d) any residue-register entry (RESIDUE-PENDING / DEFERRED / VALUE-SLOT) with an empty/"TODO" disposition. Keep the class-graph dead-edge check **separate** from the shapes-graph bearer check (ODR-0013 open/closed-world guard). Wire into the three-graph CI + `make ci` + `deploy-aws.yml`.
5. **Regenerate + re-pin.** `opda-gen emit` → re-pin byte-identity (24 TTLs + shapes); `emit-exemplar-reports` → re-pin expected-reports; regenerate `src/data/ontology-model.json` + `public/data/ontology-graph-elements.json` (deploy artefacts, per ADR-0044); bump `opda_gen.__version__` and the affected modules' `owl:versionIRI`; verify `make ci` + repo-root pytest + a clean `build:data`.

## More Information

* **Realises:** [ODR-0032](../ontology/odr/ODR-0032-relationship-layer-object-properties.md) (the relationship-layer modelling decision + §R2 object-property inventory + the relationship-completeness criterion).
* **Designed-but-unbuilt source:** [ODR-0006](../ontology/odr/ODR-0006-agents-and-roles.md) (`playedBy`, role-play SHACL, `opda:Name`, Address joins), [ODR-0007](../ontology/odr/ODR-0007-transactions-and-lifecycle.md) (participant/chain joins).
* **Engineering precedent:** [ADR-0031](./ADR-0031-category-g-curated-walk-execution-plan.md) + [ADR-0032](./ADR-0032-category-g-walk-emission-and-coverage-gate.md) (the descriptive-layer walk + `ci-category-g-coverage` this mirrors); [ADR-0011](./ADR-0011-module-tbox-emission.md) (module TBox emission — where the new triples are produced).
* **SHACL home:** [ODR-0013](../ontology/odr/ODR-0013-shacl-validation-and-severity.md) (shapes graph separate from the class graph).
* **Evidence of the gap:** `source/03-standards/ontology/opda-agent.ttl` (`opda:founds`/`opda:mediates` rangeless; no `playedBy`); corpus-wide 7 class→class object properties; `ci-category-g-coverage` covers datatype leaves only.
* **Shaped by Council [session-047](../ontology/odr/council/session-047-relationship-layer-object-properties.md)** (2026-06-17): endpoint-IC §R1 + three-bucket gate-checked residue register (GATED / VALUE-SLOT / PENDING-upstream-IC); type-pinned-OWL-or-SHACL gate (replaces the absolute domain+range mandate) + per-edge worked query + two-graph separation; `opda:Name` emitted as a datatype/SHACL value not a class; `playedBy` optional/distinct-node; `hasAddress` predicate-only (Address class PENDING ODR-0015); `founds`/`mediates` type-pinned in SHACL `sh:class` (preserving "never reasoned"). **Full convergence — no held-as-live dissent;** asserting `rdfs:domain`+`rdfs:range` on `founds`/`mediates` is a recorded deferred option (overrides ODR-0029/0030/0031).
* Status `proposed`; the operator ratifies before implementation.
