"""
Tests for opda_gen.ci.baspi5_roundtrip_test (ODR-0003 signal 1).

Unit-tests the BASPI5 MVP round-trip harness module: the conformant
exemplar conforms cleanly; the non-conformant exemplar (PoA seller with no
evidenced authority) fails with a B1.3.2-traceable violation; the
render-contract is complete. These are the (a)/(b)/(c) assertions of
ODR-0010 §Rules made executable as a `ci-*` gate (ADR-0014).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from opda_gen.ci import baspi5_roundtrip_test as brt


def _ontology_dir() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "source" / "03-standards").exists():
            return parent / "source" / "03-standards" / "ontology"
    raise RuntimeError("repo root not found")


_OD = _ontology_dir()

pytestmark = pytest.mark.skipif(
    not (_OD / "profiles" / "baspi5.ttl").exists()
    or not (_OD / "exemplars" / "baspi5-transaction-conformant.ttl").exists(),
    reason="baspi5.ttl or transaction exemplars not emitted",
)


@pytest.fixture(scope="module")
def report() -> brt.RoundTripReport:
    return brt.run(_OD)


def test_report_is_available(report):
    assert report.available, report.unavailable_reason


def test_a_conformant_conforms(report):
    """(a) the conformant BASPI5 transaction validates cleanly."""
    assert report.conformant_conforms, (
        "conformant exemplar must conform; violations: "
        f"{report.conformant_violation_messages}"
    )
    assert report.conformant_violation_count == 0


def test_b_nonconformant_fails(report):
    """(b) the non-conformant transaction reports at least one violation."""
    assert not report.nonconformant_conforms
    assert report.nonconformant_violation_count >= 1


def test_b_violation_traces_to_b132(report):
    """(b) the violation traces to form-question B1.3.2 via the
    SellersCapacity xone evidenced-authority branch."""
    assert report.nonconformant_traces_to_b132, (
        "non-conformant violation must trace to B1.3.2; source shapes: "
        f"{report.nonconformant_source_shapes}"
    )
    # The cited source shape is the SellersCapacity xone shape.
    assert any(
        s.endswith("Baspi5_SellersCapacityShape")
        for s in report.nonconformant_source_shapes
    )


def test_c_render_contract_complete(report):
    """(c) every BASPI5 property shape with a form-question dct:source also
    carries a DASH render hint."""
    assert report.render_total > 0
    assert report.render_missing == []
    assert report.render_complete == report.render_total


def test_gate_passes(report):
    """The whole gate passes: no violations across (a)/(b)/(c)."""
    assert report.violations == [], report.violations


def test_b132_constant_resolves_to_form_question():
    """The B1.3.2 trace target is the BASPI5 form-question IRI (the
    dct:source chain resolves to …/forms/baspi5#B1.3.2)."""
    assert str(brt.B132) == "https://www.basp.uk/forms/baspi5#B1.3.2"


def test_run_unavailable_when_inputs_missing(tmp_path):
    """A directory with no profile/exemplars reports UNAVAILABLE rather
    than raising — the gate fails closed via the CLI."""
    report = brt.run(tmp_path)
    assert not report.available
    assert "missing input" in report.unavailable_reason
