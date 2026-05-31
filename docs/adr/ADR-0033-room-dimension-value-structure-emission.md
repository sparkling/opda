---
status: accepted
date: 2026-05-31
tags: [descriptive-layer, category-g, room-dimension, value-structure, opda-gen]
supersedes: []
depends-on: [ODR-0024, ODR-0023, ODR-0005]
implements: [ADR-0030, ADR-0031]
---

# Room-Dimension Value-Structure Emission

## Context and Problem Statement

The curated Category-G walk ([ADR-0031](./ADR-0031-category-g-curated-walk-execution-plan.md)) left three leaves uncovered after the monetary ([ADR-0005](./ADR-0005-deferred-work-register.md) §G22) and R5 (§G23) walks: `length`, `width`, `roomName` at `propertyPack.buildInformation.roomDimensions.rooms[]` — a **repeating group** — held as the `opda:Room` / `opda:Building` class-promotion question ([ODR-0023](../ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) R3 / [ODR-0024](../ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md) R10 / ODR-0008 §Q4a). Council **[session-030](../ontology/odr/council/session-030-room-building-modelling.md)** (Full panel, 8 voices, directing-authority override of the held trigger) ruled — on the merits, no gate — that **neither `opda:Room` nor `opda:Building` is promoted to a class** (Room has no data-realisable identity criterion — `roomName` is non-rigid, no positional token in source; `opda:Building`'s +O IC via the [ODR-0005](../ontology/odr/ODR-0005-property-land-identity-crux.md) §3a-4 "Replacement" witness is genuine but **latent/unexercised**), and that the room data is modelled as an **anonymous by-value structure** (ODR-0024 R10). This ADR is the **engineering record** for emitting that model. It carries the *implementation*; the *modelling decision* is owned by ODR-0024 R10 (session-030).

## Decision Drivers

* ODR-0024 R10 / session-030 — the modelling verdict: no Room/Building Kind; an anonymous by-value `opda:RoomDimension` structure on `opda:Property`.
* The `opda:MonetaryAmount` by-value precedent (ODR-0024 R3 / §G22) — a structured value with no identity criterion and no key, reused as a range; `opda:RoomDimension` mirrors it.
* The **repeating-group co-variance**: each `rooms[]` row binds one `length` to one `width` to one `roomName` — flat single-valued properties on `opda:Property` would scramble the pairing, so a *structure* is required (but not an *endurant*).
* Reuse-before-mint: `length`/`width` carry no unit token in source and `opda:area` already ships as a bare `xsd:decimal` with no wired unit scheme — so **no `opda:UnitOfLengthScheme`** (metres by `rdfs:comment`).
* [ODR-0010](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) §Q7a — annotations stay out of the shapes graph; per-form cardinality lives in the overlay, so the base shape carries no `sh:minCount`.
* ADR-0028 totality / the `ci-category-g-coverage` gate — the three leaves must be covered to complete the curated Category-G walk.

## Considered Options

* **Anonymous by-value `opda:RoomDimension` structure** — a keyless value class (no IC) on `opda:Property`, bearing `length`/`width`/`roomName`; the `opda:MonetaryAmount` pattern.
* **Flat datatype properties on `opda:Property`** — `opda:length`/`opda:width`/`opda:roomName` directly on the Property; rejected (8 voices) — scrambles the repeating-group co-variance (which length pairs with which width/name).
* **Mint `opda:Room` / `opda:Building` classes** — rejected (session-030: 8–0 no Room class, 7–1 no Building-now) — no data-realisable IC; Building's IC genuine but latent → an inert empty Kind.

## Decision Outcome

Chosen option: **the anonymous by-value `opda:RoomDimension` structure**, because it is the only model that holds the `rooms[]` co-variance without asserting a class whose identity the data cannot realise — and it reuses the ratified `opda:MonetaryAmount` value-structure pattern. Emitted via the [ADR-0030](./ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) generator (no hand-edited TTL):

* `opda:RoomDimension` — `owl:Class`, an anonymous by-value quality-value structure (no IC, no key, individuated by value; `dct:source` ODR-0024 R10).
* `opda:length`, `opda:width` — `owl:DatatypeProperty`, `rdfs:domain opda:RoomDimension`, `rdfs:range xsd:decimal` (metres by `rdfs:comment`; no unit scheme).
* `opda:roomName` — `owl:DatatypeProperty`, `rdfs:domain opda:RoomDimension`, `rdfs:range xsd:string` — a **non-rigid label, never a key**.
* `opda:hasRoomDimension` — `owl:ObjectProperty`, `rdfs:domain opda:Property`, `rdfs:range opda:RoomDimension` (0..*, characterisation **not** parthood; not transitive).
* `opda:RoomDimensionShape` — a **keyless** SHACL node shape (`length`/`width` `sh:datatype xsd:decimal`, `roomName` `sh:datatype xsd:string`, `sh:maxCount 1` each; **no** `sh:minCount`, **no** identity key — the value structure has no IC).
* **NOT emitted:** `opda:Room`, `opda:Building`, any part-of/mereology relation, any transitivity, any `opda:UnitOfLengthScheme`, any identity key.

### Consequences

* Good, because it closes the curated Category-G walk at **239/239** (224 minted, 15 collapsed, 0 uncovered) — the last 3 leaves covered without minting an inert Kind.
* Good, because it incurs no identity-criterion or key debt (the structure is individuated by value) and reuses the established `opda:MonetaryAmount` pattern (ODR-0024 R3).
* Good, because it re-homes losslessly onto a future `opda:Room`/`opda:Building` if an *identity fact* ever earns the Kind (a value structure makes no instance-identity claim to retract).
* Neutral, because `opda:Room`/`opda:Building` class promotion stays held-as-live on an identity-fact trigger (not a calendar gate): a built structure shared across Properties / re-identified across dated surveys (Building); a stable room positional/structural token + a re-identifying query (Room).
* Neutral, because two held minorities are recorded (session-030): a thin bearer `opda:Building` (Kendall, 1/8) and an `opda:UnitOfLengthScheme` (Guizzardi/Davis/Guarino, 3/8) — re-open on their respective identity facts.
* Bad, because room data is not individually re-identifiable across surveys — accepted: no tabled consumer query needs it, and BASPI5 carries no room token (the condition whose arrival would itself reverse the decision).

### Confirmation

* `ci-category-g-coverage` reports **239/239** (0 uncovered) — the totality gate for the curated Category-G walk.
* `ci-byte-identity`, `ci-three-graph`, `ci-dup-declaration`, `ci-profile-contract`, `ci-descriptive-roundtrip` all green; **266** pytest pass; byte-deterministic (no re-pin beyond the new emission).
* `tests/test_descriptive.py::test_room_dimension_emitted` asserts the class, the three by-value fields (domain `opda:RoomDimension`, correct datatypes), the `opda:hasRoomDimension` attachment, that `opda:Room`/`opda:Building` are NOT emitted as classes, and that the structure carries no `owl:hasKey`.
* `tests/test_descriptive.py::test_risk_assessment_in_class_catalogue` pins the module class catalogue at 9 (incl. `opda:RoomDimension`; excl. `opda:Room`/`opda:Building`).

## More Information

* **Modelling decision (owner):** [ODR-0024](../ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md) R10 + Council [session-030](../ontology/odr/council/session-030-room-building-modelling.md) (the 8-voice deliberation + per-question tally + DA scorecard).
* **Roadmap:** [ODR-0023](../ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) R3 (struck — resolved by session-030); the held promotion path.
* **Deferred-work register:** [ADR-0005](./ADR-0005-deferred-work-register.md) §G24 (this work item, now executed).
* **Reused pattern:** the `opda:MonetaryAmount` by-value structure ([ODR-0024](../ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md) R3, emitted under ADR-0005 §G22); the `opda:area` no-unit-scheme precedent (the basis for declining `opda:UnitOfLengthScheme`).
* **Generator + gates:** [ADR-0030](./ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) (the emission subsystem this realises); [ADR-0032](./ADR-0032-category-g-walk-emission-and-coverage-gate.md) (the coverage gate that confirms 239/239).
* **AgentDB registration** of this ADR is pending an `adr-index` run (the `ruflo` MCP is disconnected this session); the file + frontmatter edges are authoritative.
