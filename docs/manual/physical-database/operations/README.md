# Operations — CI gates

The committed ontology corpus is guarded at commit time by three CI gates that run in the GitHub Actions workflows (mirrored locally by `make ci-ontology`). Each gate protects a different invariant of the emitted artefacts under `source/03-standards/ontology/`: byte-for-byte reproducibility, the class / shape / annotation graph separation contract, and the BASPI5 round-trip MVP closure. A failure in any gate blocks the commit.

## The gates

| Gate | What it guarantees | ADR / ODR |
|---|---|---|
| [Byte-identity CI gate](./byte-identity-ci.md) | The committed TTLs (plus the BASPI5 overlay profile) are **bit-for-bit reproducible** from source via the canonical serialiser — a second `opda-gen emit` run is `diff`-identical to the committed corpus. | [ADR-0013](/modelling/adr/adr-0013) |
| [Three-graph CI gate](./three-graph-ci.md) | The **five-part class / shape / annotation separation contract** holds across the corpus — classes, shapes, and annotations live in distinct graphs, enforced by five SHACL-AF queries. | [ODR-0004 §3a](/modelling/odr/odr-0004) |
| [Round-trip MVP CI gate](./round-trip-ci.md) | The **MVP gate**: BASPI5 instance data validates against the BASPI5 overlay + foundation + module shape graphs with no false positives or negatives across the 15 diagnostic exemplars. | [ODR-0010 §Q7](../../../ontology/odr/) · [ODR-0003](../../../ontology/odr/) |

## Source ADR

- [ADR-0013 — Overlay profile emission](/modelling/adr/adr-0013) — canonical emission + byte-identity reproducibility.
- [ADR-0014 — BASPI5 round-trip MVP harness](/modelling/adr/adr-0014) — the three-layer harness that gates MVP closure.
