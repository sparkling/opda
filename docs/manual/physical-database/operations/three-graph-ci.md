---
kind: operations
tier: physical-database
title: Three-graph CI gate
---

# Three-graph CI gate

The three-graph gate enforces [ODR-0004 §3a](/modelling/odr/odr-0004)'s **five-part class / shape / annotation separation contract** across the committed corpus. The contract says: classes, shapes, and annotations live in different graphs; no graph contains material that belongs to another. The gate runs five SHACL-AF queries against the emitted directory and fails on any violation.

## What the gate enforces

The five separation rules per ODR-0004 §3a:

1. **No `sh:NodeShape` triples in class graphs** — `opda-classes.ttl`, `opda-<module>.ttl` × 6, and `opda-vocabularies.ttl` MUST NOT carry SHACL shape declarations.
2. **No `owl:Class` triples in shape graphs** — `opda-shapes.ttl` and `opda-<module>-shapes.ttl` × 6 MUST NOT carry class declarations.
3. **No `owl:imports` triples in shape graphs** — shape graphs are pure constraint material; imports live in the TBox graphs.
4. **No `dct:references <https://w3id.org/dpv/…>` triples in class graphs** — DPV co-annotation is a reference-not-import concern (per [ADR-0012](/modelling/adr/adr-0012)) confined to `-annotations.ttl` files.
5. **Foundation meta-shapes only in `opda-shapes.ttl`** — Cat 3 NoIdentityOverride, Cat 5 MetaShapeOverShapeGraph, and the three-rule interface contract meta-shapes live in the foundation shape graph; per-module shape graphs carry per-module shapes only.

## Command

```bash
opda-gen ci-three-graph --ontology-dir source/03-standards/ontology
```

Default `--ontology-dir` resolves to `source/03-standards/ontology/` relative to the OPDA repo root (per the `_default_ontology_dir()` walker in `tools/opda-gen/src/opda_gen/cli.py`).

Expected output on success:

```
three-graph CI: PASS (all 5 checks)
```

Expected output on failure (per violation):

```
THREE-GRAPH VIOLATION: <description of which rule and where>
```

Exit code: 0 on PASS, 1 on any violation.

## Workflow definition

The gate runs inside `.github/workflows/ontology-byte-identity.yml` as the `Three-graph CI test` step:

```yaml
- name: Three-graph CI test
  working-directory: tools/opda-gen
  run: opda-gen ci-three-graph --ontology-dir ../../source/03-standards/ontology
```

It runs immediately after `Byte-identity diff` so any byte-identity failure short-circuits before the separation check (an emitter regression often surfaces as a byte-identity violation before it surfaces as a separation violation).

## Implementation

The test body lives in [`tools/opda-gen/src/opda_gen/ci/three_graph_test.py`](../../../../tools/opda-gen/src/opda_gen/ci/three_graph_test.py). It loads each TTL via rdflib, runs five filter queries, and returns a list of violation strings (empty list = PASS).

The CLI wrapper at [`tools/opda-gen/src/opda_gen/cli.py`](../../../../tools/opda-gen/src/opda_gen/cli.py) prints each violation to stderr prefixed with `THREE-GRAPH VIOLATION:` and exits 1.

## Failure mode

A typical violation looks like:

```
THREE-GRAPH VIOLATION: opda-property.ttl contains 3 sh:NodeShape triples (rule 1)
```

Investigation order:

1. Identify the offending triples via `grep -n 'sh:NodeShape' source/03-standards/ontology/opda-property.ttl`.
2. Determine whether the triples should move to `opda-property-shapes.ttl` (correct destination per ODR-0004 §3a) or be removed entirely (if they're spurious).
3. Fix the emitter source — most likely a constraint definition leaked from the shape emitter into the module emitter.
4. Re-emit (`opda-gen emit`), confirm byte-identity, re-run `ci-three-graph`.

The three-graph gate is the ontology-engineering analogue of a "no `import * from "private/internal/sql"`" lint: it preserves the architectural boundary that makes the three derived consumer profiles ([opda-validation](../derived-profiles/opda-validation.md), [opda-ui](../derived-profiles/opda-ui.md), [opda-inference](../derived-profiles/opda-inference.md)) composable.

## Source ODR + ADR

- [ODR-0004 — PDTF ontology foundation](/modelling/odr/odr-0004) §3a — five-part separation contract.
- [ADR-0009 — Foundation TTL emission](/modelling/adr/adr-0009) — initial three-graph gate activation.
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012) — extends the separation contract to per-module shape + annotation graphs.
