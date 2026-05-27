"""
Module byte_identity.

Realises:
- ODR-0004 §6a #3 — byte-identity CI test. Build pipeline regenerates,
  byte-compares against committed TTL, fails on any byte difference.
- ADR-0007 §"Byte-identity CI test" — operationalises ODR-0004 §6a #3 as a
  GitHub Actions step.
- ADR-0008 §"CI workflow" — invoked by `opda-gen ci-byte-identity`.

This module provides a `run()` function that compares a freshly-regenerated
directory against a committed reference directory and returns a list of
violations (empty == PASS).

ADR-0008 ships the comparator only. ADR-0009 (foundation emission) is the
first ADR to commit real reference TTLs and exercise the full diff. Until
ADR-0009 lands, this comparator is exercised against the foundation stub
emission in `test_byte_identity.py`.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

from opda_gen.emitters.foundation import emit as emit_foundation


def run(reference_dir: Path) -> list[str]:
    """Regenerate the foundation stub + diff against the reference dir.

    Returns a list of violation strings (empty == PASS). Per ADR-0007
    §"Byte-identity CI test", a non-empty list fails the CI run.
    """
    violations: list[str] = []
    with tempfile.TemporaryDirectory() as tmp:
        out_dir = Path(tmp)
        emit_foundation(out_dir)
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
