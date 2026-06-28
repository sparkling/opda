# Overlay-profile deployment

Overlay profiles are per-form SHACL profile graphs that compose over the foundation + module TBox + base shapes per [ODR-0010](../../../ontology/odr/). Each overlay (BASPI5, TA6, NTS, LPE1, CON29R, etc.) defines per-form cardinality, enum subsets, and DASH UI rendering. The MVP gate per [ADR-0014](/modelling/adr/adr-0014) targets **BASPI5 only**; other overlays follow once the BASPI5 round-trip pattern is proven.

## Overlay catalogue

| Overlay | Status | Source profile TTL | Round-trip harness | ADR |
|---|---|---|---|---|
| [BASPI5](./baspi5.md) | deployed (MVP gate) | `source/03-standards/ontology/profiles/baspi5.ttl` | `tests/baspi5_round_trip/` | [ADR-0013](/modelling/adr/adr-0013) + [ADR-0014](/modelling/adr/adr-0014) |
| TA6 | not yet emitted | pending | pending | [ADR-0013](/modelling/adr/adr-0013) §"Overlay catalogue (initial)" Phase 2 |
| TA7 | not yet emitted | pending | pending | ADR-0013 Phase 2 |
| TA10 | not yet emitted | pending | pending | ADR-0013 Phase 2 |
| NTS | not yet emitted | pending | pending | ADR-0013 Phase 2 |
| NTS2 | not yet emitted | pending | pending | ADR-0013 Phase 3 |
| CON29R | not yet emitted | pending | pending | ADR-0013 Phase 3 |
| CON29DW | not yet emitted | pending | pending | ADR-0013 Phase 3 |
| LLC1 | not yet emitted | pending | pending | ADR-0013 Phase 3 |
| LPE1 | not yet emitted | pending | pending | ADR-0013 Phase 3 |
| FME1 | not yet emitted | pending | pending | ADR-0013 Phase 3 |
| OC1 | not yet emitted | pending | pending | ADR-0013 Phase 3 |
| PIQ | not yet emitted | pending | pending | ADR-0013 Phase 3 |
| RDS | not yet emitted | pending | pending | ADR-0013 Phase 3 |

## Per-overlay deployment pattern

Each deployable overlay emits as a single TTL file under `source/03-standards/ontology/profiles/<overlay>.ttl`. Composition is **build-step graph-union** (per [ODR-0010 §Q1](../../../ontology/odr/)), NOT entailment: the generator composer concatenates the overlay's shape graph with the foundation + module TBox + base shapes, leaving inference to the consumer's reasoner / validator.

The three-rule interface contract ([ADR-0013](/modelling/adr/adr-0013)) governs every overlay:

1. **`sh:in` semantics** — overlay enum subsets are subset-of-foundation, never overlap-of-foundation.
2. **`sh:Violation` floor** — overlay severity is `sh:Violation` minimum; warnings cannot weaken foundation violations.
3. **No identity-override** — overlays MUST NOT redefine identity-key shapes already declared by the foundation (the Cat 3 NoIdentityOverride meta-shape catches this at CI time).

The contract is CI-enforced by `opda-gen ci-profile-contract`; see [operations/round-trip-ci.md](../operations/round-trip-ci.md).

## Source ADR

- [ADR-0013 — Overlay profile emission](/modelling/adr/adr-0013) — per-overlay emission template + three-rule interface contract.
- [ADR-0014 — BASPI5 round-trip MVP harness](/modelling/adr/adr-0014) — three-layer harness that gates MVP closure.
