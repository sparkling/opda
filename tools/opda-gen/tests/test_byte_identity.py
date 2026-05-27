"""
Tests for end-to-end byte-identity on the foundation + vocabularies emission.

Realises:
- ADR-0008 §"Confirmation" #3 + #6 — byte-identity test in the suite +
  reproducibility on the foundation corpus.
- ADR-0009 §"Confirmation" #2 — second-run regeneration produces zero diff
  against the first.
- ADR-0010 §"Confirmation" #2 — byte-identity gate extended to cover
  `opda-vocabularies.ttl` alongside the foundation TTLs.
- ADR-0007 §"Byte-identity CI test" sub-test #1 — `diff <(gen) <(gen)`
  returns empty (byte-identical on consecutive runs).
- ODR-0004 §6a #3 — byte-identity CI contract.

Procedure:
  1. Emit foundation + vocabularies into tmp dir A.
  2. Emit foundation + vocabularies into tmp dir B.
  3. Assert file bytes are identical (all five files).
"""

from __future__ import annotations

import tempfile
from pathlib import Path

from opda_gen.emitters.foundation import emit_foundation
from opda_gen.emitters.vocabularies import emit_vocabularies


def test_foundation_byte_identical_across_runs() -> None:
    """Per ADR-0009 §Confirmation #2: emitting the foundation twice yields
    byte-identical output across all four files."""
    with tempfile.TemporaryDirectory() as a_dir, tempfile.TemporaryDirectory() as b_dir:
        a = Path(a_dir)
        b = Path(b_dir)
        emit_foundation(a)
        emit_foundation(b)
        a_files = sorted(a.iterdir())
        b_files = sorted(b.iterdir())
        assert [f.name for f in a_files] == [f.name for f in b_files]
        # Per ADR-0009 §Confirmation #1, four files must be emitted.
        assert {f.name for f in a_files} == {
            "foundation.ttl",
            "opda-classes.ttl",
            "opda-shapes.ttl",
            "opda-annotations.ttl",
        }
        for af, bf in zip(a_files, b_files):
            assert af.read_bytes() == bf.read_bytes(), (
                f"byte mismatch between two runs: {af.name}"
            )


def test_foundation_emission_is_nonempty() -> None:
    """Sanity: the emission produces foundation.ttl with the ontology header
    and a class graph with the two foundation classes."""
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        emit_foundation(out)
        foundation = out / "foundation.ttl"
        assert foundation.exists()
        f_content = foundation.read_bytes()
        assert b"owl:Ontology" in f_content
        assert b"vann:preferredNamespacePrefix" in f_content
        assert f_content.endswith(b"\n")
        assert b"\r" not in f_content

        classes = out / "opda-classes.ttl"
        assert classes.exists()
        c_content = classes.read_bytes()
        assert b"opda:DiagnosticExemplar" in c_content
        assert b"opda:GeneratorRun" in c_content
        assert b"dct:source" in c_content


def test_byte_identity_runner_reports_match() -> None:
    """The `ci.byte_identity.run` helper reports an empty violation list when
    the reference is regenerated identically.

    Per ADR-0010 the reference now must include both foundation + vocabularies;
    the runner emits both, so the test fixture seeds both.
    """
    from opda_gen.ci.byte_identity import run

    with tempfile.TemporaryDirectory() as ref_dir:
        ref = Path(ref_dir)
        emit_foundation(ref)
        emit_vocabularies(ref)
        assert run(ref) == []
