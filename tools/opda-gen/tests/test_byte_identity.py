"""
Tests for end-to-end byte-identity on the foundation stub emission.

Realises:
- ADR-0008 §"Confirmation" #3 + #6 — byte-identity test in the suite +
  reproducibility on the foundation stub.
- ADR-0007 §"Byte-identity CI test" sub-test #1 — `diff <(gen) <(gen)`
  returns empty (byte-identical on consecutive runs).
- ODR-0004 §6a #3 — byte-identity CI contract.

Procedure:
  1. Emit foundation stub into tmp dir A.
  2. Emit foundation stub into tmp dir B.
  3. Assert file bytes are identical.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

from opda_gen.emitters.foundation import emit as emit_foundation


def test_foundation_stub_byte_identical_across_runs() -> None:
    with tempfile.TemporaryDirectory() as a_dir, tempfile.TemporaryDirectory() as b_dir:
        a = Path(a_dir)
        b = Path(b_dir)
        emit_foundation(a)
        emit_foundation(b)
        a_files = sorted(a.iterdir())
        b_files = sorted(b.iterdir())
        assert [f.name for f in a_files] == [f.name for f in b_files]
        for af, bf in zip(a_files, b_files):
            assert af.read_bytes() == bf.read_bytes(), (
                f"byte mismatch between two runs: {af.name}"
            )


def test_foundation_stub_emission_is_nonempty() -> None:
    """Sanity: the stub actually emits at least a foundation.ttl with the
    ontology header."""
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        emit_foundation(out)
        target = out / "foundation.ttl"
        assert target.exists()
        content = target.read_bytes()
        assert b"owl:Ontology" in content
        assert content.endswith(b"\n")
        assert b"\r" not in content


def test_byte_identity_runner_reports_match() -> None:
    """The `ci.byte_identity.run` helper reports an empty violation list when
    the reference is regenerated identically."""
    from opda_gen.ci.byte_identity import run

    with tempfile.TemporaryDirectory() as ref_dir:
        ref = Path(ref_dir)
        emit_foundation(ref)
        assert run(ref) == []
