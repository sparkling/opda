"""
Test exemplar regression.

Realises:
- ADR-0014 §"Exemplar regression layer" lines 101-150 + §Confirmation
  #4 — every diagnostic exemplar in
  `source/03-standards/ontology/exemplars/` pairs with an
  `<stem>-expected-report.ttl` recording the
  `sh:ValidationReport` pyshacl produces when the exemplar is
  validated against the foundation + module shape graph. CI
  regression catches any TBox/shape change that breaks an
  exemplar's validation outcome.
- ODR-0004 §8a — diagnostic exemplar pairing discipline.

For each exemplar:
1. Validate via pyshacl against the foundation + module shape graph.
2. Normalise pyshacl's blank-node IDs via `_normalise_report`.
3. Compare to the committed `<stem>-expected-report.ttl`.
4. PASS = semantically equivalent (same focusNode/resultPath/severity
   tuples); FAIL = drift.

The test is parametrised over the 15 exemplars and reports per-
exemplar PASS/FAIL so the matrix CI job at
`.github/workflows/baspi5-round-trip.yml` surfaces a precise
failure target.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from rdflib import Graph

from .compare_reports import reports_equivalent
from .conftest import EXEMPLARS_DIR


# ---------------------------------------------------------------------------
# Exemplar discovery — parametrise over the 15 canonical exemplars.
# ---------------------------------------------------------------------------
_EXEMPLAR_STEMS = sorted(
    p.stem for p in EXEMPLARS_DIR.glob("*.ttl")
    if not p.stem.endswith("-expected-report")
)


@pytest.mark.parametrize("exemplar_stem", _EXEMPLAR_STEMS)
def test_exemplar_validation_matches_expected_report(
    exemplar_stem: str,
    shapes_only_graph: Graph,
) -> None:
    """For each exemplar: pyshacl(exemplar, shapes) ≡ committed
    expected-report.ttl (semantic equivalence per
    compare_reports.reports_equivalent).
    """
    from opda_gen.emitters.exemplar_reports import _normalise_report
    from pyshacl import validate

    exemplar_path = EXEMPLARS_DIR / f"{exemplar_stem}.ttl"
    expected_path = EXEMPLARS_DIR / f"{exemplar_stem}-expected-report.ttl"
    assert expected_path.exists(), (
        f"missing expected report for {exemplar_stem}: {expected_path}"
    )

    data = Graph()
    data.parse(exemplar_path, format="turtle")

    _conforms, report_graph, _text = validate(
        data,
        shacl_graph=shapes_only_graph,
        inference="rdfs",
        advanced=True,
        debug=False,
    )
    actual = _normalise_report(report_graph)
    expected = Graph()
    expected.parse(expected_path, format="turtle")

    ok, msg = reports_equivalent(actual, expected)
    assert ok, f"{exemplar_stem} validation regressed: {msg}"


def test_exemplar_count_is_fifteen() -> None:
    """Confirm we have exactly the 15 canonical exemplars (per ADR-0014
    §"CI integration" matrix + ODR-0004 §8a ratified set)."""
    assert len(_EXEMPLAR_STEMS) == 15, (
        f"expected 15 canonical exemplars, found {len(_EXEMPLAR_STEMS)}: "
        f"{_EXEMPLAR_STEMS}"
    )


def test_every_exemplar_has_expected_report_pairing() -> None:
    """ODR-0004 §8a pairing discipline: every `.ttl` exemplar carries
    a sibling `-expected-report.ttl`."""
    missing = [
        s for s in _EXEMPLAR_STEMS
        if not (EXEMPLARS_DIR / f"{s}-expected-report.ttl").exists()
    ]
    assert not missing, f"exemplars missing expected-report.ttl: {missing}"
