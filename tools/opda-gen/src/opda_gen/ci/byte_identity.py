"""
Module byte_identity.

Realises:
- ODR-0004 §6a #3 — byte-identity CI test. Build pipeline regenerates,
  byte-compares against committed TTL, fails on any byte difference.
- ADR-0007 §"Byte-identity CI test" — operationalises ODR-0004 §6a #3 as a
  GitHub Actions step.
- ADR-0008 §"CI workflow" — invoked by `opda-gen ci-byte-identity`.
- ADR-0009 §"Confirmation" #2 — first ADR to commit real reference TTLs;
  this comparator runs against the foundation corpus (foundation.ttl +
  opda-classes.ttl + opda-shapes.ttl + opda-annotations.ttl) as the
  byte-identity gate.
- ADR-0010 §"Confirmation" #2 — vocabularies file added to the
  byte-identity gate alongside the four foundation TTLs.
- ADR-0011 §"Confirmation" #2 — six module TTLs (opda-property /
  agent / transaction / claim / governance / descriptive) added to the
  byte-identity gate.
- ADR-0012 §"Confirmation" #2 — twelve new TTLs (six per-module shapes +
  six per-module annotations) added to the byte-identity gate.

This module provides a `run()` function that compares a freshly-regenerated
directory against a committed reference directory and returns a list of
violations (empty == PASS).
"""

from __future__ import annotations

import tempfile
from pathlib import Path

from opda_gen.emitters.annotations import emit_annotations
from opda_gen.emitters.classes import emit_all_modules
from opda_gen.emitters.foundation import emit_foundation
from opda_gen.emitters.shapes import emit_shapes
from opda_gen.emitters.vocabularies import emit_vocabularies


def run(reference_dir: Path) -> list[str]:
    """Regenerate the full corpus + diff against the reference dir.

    Returns a list of violation strings (empty == PASS). Per ADR-0007
    §"Byte-identity CI test", a non-empty list fails the CI run.

    Per ADR-0009 + ADR-0010 + ADR-0011 + ADR-0012, the regeneration emits
    23 files (foundation 4 + vocabularies 1 + module classes 6 + module
    shapes 6 + module annotations 6); the diff is a per-file byte-
    comparison. A missing reference is itself a violation.
    """
    violations: list[str] = []
    with tempfile.TemporaryDirectory() as tmp:
        out_dir = Path(tmp)
        emit_foundation(out_dir)
        emit_vocabularies(out_dir)
        emit_all_modules(out_dir)
        emit_shapes(out_dir)
        emit_annotations(out_dir)
        for emitted in sorted(out_dir.iterdir()):
            ref = reference_dir / emitted.name
            if not ref.exists():
                violations.append(f"reference is missing: {ref}")
                continue
            if emitted.read_bytes() != ref.read_bytes():
                violations.append(
                    f"byte mismatch: {emitted.name} differs from reference"
                )
    return violations
