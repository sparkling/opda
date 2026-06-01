---
status: accepted
date: 2026-06-01
tags: [shacl, validation, jena, shacl-af, shacl-1-2, ci, pyshacl]
supersedes: []
depends-on: [ODR-0025, ODR-0010, ODR-0013, ODR-0017, ADR-0014, ADR-0035]
implements: []
---

# SHACL 1.2 Validation via Apache Jena

## Context and Problem Statement

opda validates its ontology and round-trip data with **pyshacl** (`==0.25.0`) at SHACL-Core + Advanced-Features level, with `inference="rdfs"`, wired into the BASPI5 round-trip and CI (ADR-0014; the `ci-baspi5-roundtrip` gate and a 15-exemplar matrix). ODR-0002 pins **SHACL 1.2** by name.

The problem: **pyshacl does not support SHACL 1.2.** It tracks SHACL 1.0 plus the 2017 W3C Recommendation, with no roadmap for 1.2. Any SHACL-1.2 construct is therefore *silently skipped* (best case) or *mis-reported* (worst case) — opda has already brushed this edge (ODR-0010 §Rules records the `sellersCapacity` `sh:xone` needing `advanced=True`, and the SHACL-Core-only vacuous-pass risk; handover 2026-06-01 §7). The sibling project (`~/source/hm/semantic-modelling`) hit the same wall and moved validation to **Apache Jena** (`jena-shacl`) — *"pyshacl is NOT supported; it silently skips SHACL 1.2 constraints"* (its ADR-0147). Crucially, Jena SHACL also implements the **SHACL-AF** features opda's ODR-0010/0017 depend on (`sh:rule`, `sh:sparql`), so the move gains 1.2 capability without losing AF. The reach is broader than SHACL: Jena `riot` parses the **RDF 1.2 triple-term syntax** that `rdflib` cannot (ODR-0025 §R5), so standardising on Jena removes opda's last reason to depend on `rdflib` at all. This ADR decides opda's Jena-based validation **and parsing** toolchain and the migration discipline.

## Decision Drivers

* ODR-0002 pins SHACL 1.2 — the validator must actually implement it, not silently skip it.
* ODR-0010 names pyshacl `advanced=True` as the **capability floor** (`sh:xone` discrimination; `sh:rule`/`sh:sparql` at `sh:Info`/`sh:Warning`). Any replacement MUST meet or exceed it, demonstrably.
* ODR-0025 §R3: SHACL validates *triples* (the ADR-0035 R1 closure / asserted graph), not via an OWL reasoner; entailment is ADR-0035's job, kept separate.
* Must not silently regress the existing round-trip/exemplar CI (ADR-0014).
* The validator should align its entailment with ODR-0025 R1 rather than apply broader ad-hoc RDFS (this is what removes the EPCCertificate exposure, ODR-0025 §R7).
* opda standardises on **one** RDF toolchain; it must not retain an `rdflib`/pyshacl dependency that cannot parse RDF 1.2 triple-term syntax and would constrain the data model (ODR-0025 §R5).

## Considered Options

* **A — Apache Jena `jena-shacl` 6.1.0 as opda's SHACL 1.2 validator *and* `riot` as its RDF parser; `rdflib`/pyshacl retired** — validation and parsing move to Jena; removal of the pyshacl path is gated on a demonstrated-parity check, after which `rdflib` is not retained.
* **B — Stay on pyshacl** — keep pyshacl `0.25.0` as the sole validator.
* **C — TopBraid SHACL / DASH (Java)** — a different Java SHACL engine as primary.
* **D — Dual-run pyshacl + Jena permanently** — both validators forever.

## Decision Outcome

Chosen option: **A — Apache Jena `jena-shacl` 6.1.0, with `rdflib`/pyshacl retired (not retained)**, because pyshacl cannot validate SHACL 1.2 (a hard ODR-0002 requirement) and opda has already hit its SHACL-AF edges, while Jena implements both SHACL 1.2 and the SHACL-AF features opda relies on — and `riot` parses the RDF 1.2 triple terms `rdflib` cannot (ODR-0025 §R5).

The pyshacl/`rdflib` path is **retired**, not retained. A parity gate proves Jena reproduces opda's specific AF results (the `sellersCapacity` `sh:xone` non-conformant case; the ODR-0017 `sh:rule`/`sh:sparql` `sh:Info`/`sh:Warning` rules) across the full 15-exemplar matrix — and once it passes, the pyshacl path is **removed**, not kept on as a parse-checker. Retaining `rdflib` would re-introduce the exact dependency that, in the sibling project, forced an RDF-1.2 triple-term downgrade (ODR-0025 §R5); Jena `riot` is opda's parser and `jena-shacl` its validator. The parity gate is the *transition* mechanism — honouring ODR-0010's capability-floor discipline (demonstrate the floor before removing the incumbent), not a licence to keep two toolchains.

### Consequences

* Good, because opda can finally validate the SHACL 1.2 constraints ODR-0002 commits to — no silent skips or vacuous passes.
* Good, because validation and inference become one coherent Jena-stack story: the validator targets the ADR-0035 R1 closure, aligning entailment with ODR-0025 and dissolving the EPCCertificate exposure (§R7).
* Good, because it gains SHACL-AF parity-or-better (`sh:rule`/`sh:sparql`) plus 1.2 features (`sh:ShapeClass` dual-typing, `sh:targetObjectsOf`/`sh:targetSubjectsOf`).
* Bad, because it introduces a JVM/Jena dependency into the validation toolchain (install `jena`/`jena-shacl` 6.1.0) and a Java step in CI.
* Bad, because until the parity gate passes opda dual-runs (pyshacl + Jena) — a *transitional* double cost that ends in a single Jena toolchain, not a retained dual-run.
* Good, because standardising the parser on Jena `riot` (not `rdflib`) unblocks RDF 1.2 triple-term syntax for statement-level annotation (ODR-0025 §R5) and removes opda's `rdflib` dependency; the BASPI5 round-trip harness (ADR-0014) migrates from pyshacl to Jena SHACL.
* Neutral, because the sibling's 3-pass meta/instance SHACL structure is *optional* for opda — adopt it only if opda splits Layer A (inline `sh:ShapeClass`) from Layer B (per-category meta-shapes); opda's current flat shapes need a single `shacl validate` pass.

### Confirmation

* **Parity gate** (precondition to retiring pyshacl validation): for each of the 15 exemplars, Jena and pyshacl agree on `sh:conforms` and on the located violation — in particular the `sellersCapacity` `sh:xone` non-conformant case and the ODR-0017 `Info`/`Warning` rules.
* **1.2-feature smoke test**: a shape using a 1.2-only feature (e.g. `sh:ShapeClass` or `sh:targetObjectsOf`) validates correctly under Jena and is demonstrably skipped by pyshacl — the guard that proves *why* the swap is required.
* The validator runs against the ADR-0035 R1 closure (or the asserted graph), never ad-hoc full RDFS.

> **Implementation note (2026-06-01, as built — transition COMPLETE).** The parity gate passed **17/17 exemplars** (pyshacl ≡ Jena on `sh:conforms`) once a missing `PREFIX rdf:` was added to the `ShInSemantics_MetaShape` SHACL-SPARQL query (strict Jena rejected it; pyshacl had tolerated it). With the floor demonstrated, **pyshacl is removed** — `jena-shacl` 6.1.0 is now opda's sole SHACL engine (`opda_gen.jena_shacl`), the parity machinery (`ci-shacl-parity`) is retired, and the pyshacl dependency is dropped. The dual-run window is closed.
>
> **No Fuseki/Jena _container_.** Apache publishes no Jena 6.x Fuseki Docker image, so — as this ADR already specifies — opda uses the **Apache Jena 6.1.0 binary distribution**, not a container: the `shacl` CLI is resolved from `OPDA_JENA_HOME`/`PATH` or auto-provisioned (downloaded + sha512-verified into `.jena/`), and CI provisions only a JDK (`setup-java@21`). The inference runtime (ADR-0035/0037) likewise runs the local **Fuseki 6.1.0** binary via `config/fuseki-config.ttl`, with Docker dropped from the build path entirely.

## Pros and Cons of the Options

### A — Jena `jena-shacl` 6.1.0 + `riot` (`rdflib`/pyshacl retired)

* Good, because it is the validator that actually implements SHACL 1.2, and it supports SHACL-AF; it shares the Jena stack with ADR-0035 inference.
* Bad, because of the JVM dependency and the transitional dual-run until parity is proven.

### B — Stay on pyshacl

* Good, because zero migration; current CI is unchanged.
* Bad, because it cannot validate SHACL 1.2 — it silently skips 1.2 constraints, violating ODR-0002. This is the known wall.

### C — TopBraid SHACL / DASH

* Good, because a mature Java SHACL engine with DASH support.
* Bad, because heavier/licensing considerations; the sibling uses TopBraid only as a DASH *supplement* to Jena, not as primary — no advantage over Jena for opda's needs.

### D — Dual-run permanently

* Good, because defence-in-depth.
* Bad, because permanent double maintenance and divergence risk; pyshacl still cannot see 1.2 constraints, so it contributes false confidence rather than coverage.

## More Information

- Realises: ODR-0025 §R3 (validation half) and §R5 (Jena parsing toolchain; full RDF 1.2 adoption; no `rdflib` dependency).
- Cross-project: `docs/hm-handoff-rdf-1.2-triple-term-jena-fix.md` — the sibling's `rdflib`-driven RDF-1.2 downgrade and how to reverse it.
- Capability floor that gates retirement: ODR-0010 §Rules (pyshacl `advanced=True` — `sh:xone`, `sh:rule`/`sh:sparql`); handover 2026-06-01 §7.
- Validation contract: ODR-0013 (SHACL validation & severity), ODR-0017 (SHACL-AF non-blocking data-quality rules).
- Migrates: ADR-0014 (BASPI5 round-trip — pyshacl `==0.25.0`, `inference="rdfs"`, `ci-baspi5-roundtrip`, the 15-exemplar matrix).
- Validates against: ADR-0035 (the materialised R1 closure / asserted graph).
- Prior art (replicated): hm `ADR-0147` (Jena SHACL 1.2, 3-pass, "pyshacl does NOT support SHACL 1.2"), hm `ADR-0095`/`ADR-0127` (jena-mapper validate-before-write), hm `scripts/validate-ontology.sh`; Apache Jena `jena-shacl` 6.1.0.
