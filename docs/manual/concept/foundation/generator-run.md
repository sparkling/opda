# Generator Run

A Generator Run is a single execution of OPDA's `opda-gen` build pipeline that produced a specific set of emitted ontology files.

## Why it matters

OPDA's ontology is *generated*, not hand-edited. Every Turtle file you read at `source/03-standards/ontology/` was emitted by a specific run of the generator, from a specific source commit, with a specific generator version. Generator Run records make that provenance auditable — if a downstream consumer reports a regression, you can trace the broken emission back to the (version, commit) pair that produced it and reproduce it byte-for-byte.

If you are a triplestore operator, a CI engineer, or an auditor investigating "where did this triple come from?", you want the Generator Run record for the emission you are looking at.

## Hard cases

- **Regenerated emission.** The same source commit run through the same generator version on a different machine should produce byte-identical output. The Generator Run record exists so any divergence is detectable, not assumed away.
- **Generator-version bump.** A new generator version may legitimately change emitted output (new annotations, fixed bugs). The Generator Run record makes the version explicit so consumers can decide whether to refresh.
- **Source-commit reissue.** A force-push to the source repo would invalidate every Generator Run that pointed at the old SHA. The model assumes immutable commit history and the operational policy enforces it.

## Identity Criterion

Each Generator Run is identified by the **(generator version, source commit SHA, emission timestamp)** triple. Two runs are the same run only if all three match. See the [Logical tier →](../../logical/foundation/generator-run.md) for the field-level shape.

## Related Kinds

- [Diagnostic Exemplar](./diagnostic-exemplar.md) — exemplars are emitted alongside the ontology TTLs by the same Generator Run
- [Validation Context](./validation-context.md) — overlay profiles are emitted by the same pipeline and tagged with the Run that produced them

## Source ODR

[ODR-0004 — PDTF ontology foundation §6a (generator-first)](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
