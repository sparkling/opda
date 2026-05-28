# Byte-identity CI gate

The byte-identity gate guarantees the 24 committed TTLs at `source/03-standards/ontology/` plus the overlay profile at `source/03-standards/ontology/profiles/baspi5.ttl` are **bit-for-bit reproducible** from the source via the canonical serialiser. A second `opda-gen emit` run produces output that `diff -rq` reports as identical to the committed corpus, or the gate fails and CI blocks the commit.

## What the gate enforces

Per [ADR-0009](../../../adr/ADR-0009-foundation-ttl-emission.md) §Confirmation #2, [ADR-0010](../../../adr/ADR-0010-skos-vocabulary-emission.md) §Confirmation #1, [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md), [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md), [ADR-0013](../../../adr/ADR-0013-overlay-profile-emission.md), and [ADR-0014](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md):

- Every emitter (`emit-foundation`, `emit-vocabularies`, `emit-module`, `emit-shapes`, `emit-annotations`, `emit-profile`) MUST produce byte-identical output on second invocation.
- The umbrella `opda-gen emit` MUST regenerate the full committed corpus byte-for-byte.
- The expected-report TTLs at `source/03-standards/ontology/exemplars/*-expected-report.ttl` MUST regenerate byte-for-byte via `opda-gen emit-exemplar-reports`.

The canonical serialiser ([`tools/opda-gen/src/opda_gen/serialiser/canonical.py`](../../../../tools/opda-gen/src/opda_gen/serialiser/canonical.py)) enforces deterministic blank-node naming, predicate ordering, and prefix declarations per [ADR-0007](../../../adr/ADR-0007-ontology-generator-specification.md) §"Deterministic emission rules".

## Commands

The full subcommand suite the gate exercises:

```bash
# Umbrella regenerator — emits all 24 TTLs + baspi5.ttl
opda-gen emit --output /tmp/ontology

# Per-file gates (validated individually by the workflow)
opda-gen emit-foundation --output /tmp/foundation-only
opda-gen emit-vocabularies --output /tmp/vocabularies-only
opda-gen emit-module property --output /tmp/module-property      # × 6 modules
opda-gen emit-shapes --module property --output /tmp/shapes-property      # × 6
opda-gen emit-annotations --module property --output /tmp/annotations-property  # × 6
opda-gen emit-profile baspi5 --output /tmp/baspi5-only

# Composite byte-identity check
opda-gen ci-byte-identity --reference source/03-standards/ontology
# Expected output: "byte-identity: PASS"

# Expected-report byte-identity (post-ADR-0014)
opda-gen emit-exemplar-reports
git diff --exit-code source/03-standards/ontology/exemplars/*-expected-report.ttl
```

## Workflow definition

The gate lives in `.github/workflows/ontology-byte-identity.yml`, triggered on push + PR to `main`. The relevant steps:

```yaml
- name: Regenerate corpus
  working-directory: tools/opda-gen
  run: opda-gen emit --output /tmp/ontology

- name: Byte-identity diff
  run: diff -rq /tmp/ontology source/03-standards/ontology --exclude=exemplars --exclude=derived
```

The `--exclude=exemplars` flag carves out the exemplar TTLs (their byte-identity is enforced by the separate `Expected-report byte-identity` step at the end of the workflow). The `--exclude=derived` flag carves out the (not-yet-existent) derived consumer profile directory — see [derived-profiles/README.md](../derived-profiles/README.md) §"Activation status".

Per-file gates run after the umbrella to surface per-emitter failures:

```yaml
- name: Regenerate vocabularies only (per-file gate)
  working-directory: tools/opda-gen
  run: opda-gen emit-vocabularies --output /tmp/vocabularies-only

- name: Vocabularies byte-identity
  run: diff -q /tmp/vocabularies-only/opda-vocabularies.ttl source/03-standards/ontology/opda-vocabularies.ttl
```

Per-module loops cover the six modules in one step each:

```yaml
- name: Regenerate each module only (per-file gate)
  working-directory: tools/opda-gen
  run: |
    for mod in property agent transaction claim governance descriptive; do
      opda-gen emit-module "$mod" --output "/tmp/module-$mod"
    done

- name: Modules byte-identity
  run: |
    for mod in property agent transaction claim governance descriptive; do
      diff -q "/tmp/module-$mod/opda-$mod.ttl" "source/03-standards/ontology/opda-$mod.ttl"
    done
```

The BASPI5 profile + interface-contract checks close the byte-identity workflow:

```yaml
- name: Regenerate BASPI5 profile only (per-file gate)
  working-directory: tools/opda-gen
  run: opda-gen emit-profile baspi5 --output /tmp/baspi5-only

- name: BASPI5 profile byte-identity
  run: diff -q /tmp/baspi5-only/profiles/baspi5.ttl source/03-standards/ontology/profiles/baspi5.ttl

- name: Three-rule interface contract CI (ADR-0013)
  working-directory: tools/opda-gen
  run: opda-gen ci-profile-contract --ontology-dir ../../source/03-standards/ontology
```

## Expected output

When the gate passes, the workflow logs read:

```
emitted: /tmp/ontology/foundation.ttl
emitted: /tmp/ontology/opda-annotations.ttl
…
emitted: /tmp/ontology/profiles/baspi5.ttl
Files /tmp/ontology and source/03-standards/ontology are identical
profile contract CI: PASS (all 3 rules)
```

`diff -rq` output is silent on identity; the absence of `Files X and Y differ` lines is the success signal.

## Failure mode

A failing gate looks like:

```
Files /tmp/ontology/opda-property.ttl and source/03-standards/ontology/opda-property.ttl differ
```

This means a recent change to either the emitter or the source-data table broke determinism. Investigation order:

1. **Run `opda-gen emit` locally**, diff the regenerated TTL against the committed one with `diff -u`.
2. If the diff shows reordered triples or blank-node label drift, the canonical serialiser regressed — check `tools/opda-gen/src/opda_gen/serialiser/`.
3. If the diff shows added / removed / reworded triples, the emitter has a non-deterministic data source (e.g. an unsorted `set()` traversal) — fix the data source to be deterministic.
4. If the diff is intentional (new ontology content), commit the regenerated TTLs as the new canonical state.

Never silently regenerate-and-commit without understanding the diff — the byte-identity gate is the only line of defence against silent semantic drift.

## Source ADR

- [ADR-0007 — Ontology generator specification](../../../adr/ADR-0007-ontology-generator-specification.md) §"Deterministic emission rules".
- [ADR-0009 — Foundation TTL emission](../../../adr/ADR-0009-foundation-ttl-emission.md) §Confirmation #2 — second-run byte-identity gate.
- [ADR-0010 — SKOS vocabulary emission](../../../adr/ADR-0010-skos-vocabulary-emission.md) §Confirmation #1 — per-emitter byte-identity contract.
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md), [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md), [ADR-0013](../../../adr/ADR-0013-overlay-profile-emission.md), [ADR-0014](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md) — extend the byte-identity discipline to modules, shapes, annotations, overlays, and expected-report TTLs respectively.
