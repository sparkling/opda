"""
Tests for the candidate-G walk coverage gate (ADR-0031 work-items 2 & 5).

Realises:
- ADR-0031 — the curated Category-G walk's honest completion gate: every
  candidate-G leaf is minted as an `opda:` term or collapsed into a shared
  property; uncovered leaves are reported, not silently omitted.

The pure `build_coverage_report` logic is asserted unconditionally; the
integration test over the committed corpus skips when the (gitignored)
canonical data dictionary is absent, so a CI checkout without it does not
false-fail.
"""

from __future__ import annotations

import pytest

from opda_gen.ci.category_g_coverage_test import (
    CoverageReport,
    build_coverage_report,
    candidate_g_names,
    emitted_opda_local_names,
    run,
)


# --- build_coverage_report: the coverage classification ------------------
def test_minted_leaf_is_covered() -> None:
    """A candidate-G name matched by an emitted opda: local name is minted."""
    report = build_coverage_report(("bedrooms", "bathrooms"), {"bedrooms", "bathrooms"})
    assert report.minted == {"bedrooms", "bathrooms"}
    assert report.covered == 2
    assert report.uncovered == set()
    assert report.is_complete


def test_uncovered_leaf_is_reported_not_dropped() -> None:
    """A name neither minted nor collapsed is uncovered (the walk's TODO) and
    surfaces as a violation — never silently absorbed."""
    report = build_coverage_report(("bedrooms", "adHocExpenses"), {"bedrooms"})
    assert report.minted == {"bedrooms"}
    assert report.uncovered == {"adHocExpenses"}
    assert not report.is_complete
    assert any("adHocExpenses" in v for v in report.violations)


def test_collapsed_leaf_with_emitted_target_is_covered(monkeypatch) -> None:
    """A collapse disposition counts as covered when its target term exists."""
    import opda_gen.ci.category_g_coverage_test as mod

    monkeypatch.setattr(mod, "COLLAPSED", {"description": "disclosureDetail"})
    report = mod.build_coverage_report(
        ("bedrooms", "description"), {"bedrooms", "disclosureDetail"}
    )
    assert report.collapsed == {"description": "disclosureDetail"}
    assert report.covered == 2
    assert report.uncovered == set()
    assert report.broken_collapse == {}
    assert report.is_complete


def test_collapse_to_missing_target_is_a_violation(monkeypatch) -> None:
    """A collapse whose target is not emitted is a broken disposition — caught,
    not counted as honest coverage."""
    import opda_gen.ci.category_g_coverage_test as mod

    monkeypatch.setattr(mod, "COLLAPSED", {"amount": "price"})
    report = mod.build_coverage_report(("amount",), set())  # opda:price absent
    assert report.broken_collapse == {"amount": "price"}
    assert not report.is_complete
    assert any("broken disposition" in v for v in report.violations)


def test_unavailable_when_names_none() -> None:
    """No data dictionary -> available=False (the caller skips, not fails)."""
    report = build_coverage_report(None, {"bedrooms"})
    assert report.available is False
    assert not report.is_complete


# --- integration over the committed corpus (skips without the data dict) -
def test_run_on_committed_corpus_accounts_for_every_candidate_g_leaf() -> None:
    """Every candidate-G name partitions into exactly one of
    minted / collapsed / uncovered — no leaf lost, none double-counted — and
    the broken-collapse set is empty (no disposition points at a missing term).

    Skips when the canonical data dictionary is gitignored-absent (CI). Does
    NOT pin the covered count, which climbs as the walk lands."""
    if candidate_g_names() is None:
        pytest.skip("canonical data dictionary absent (gitignored) — local-only gate")

    report = run(_committed_ontology_dir())
    assert report.available
    # ODR-0024 R5: the structural C-vs-G rule raised the honest candidate-G set
    # from 188 to 239 (the newly-surfaced enum-bearing substantive attributes
    # are uncovered — a separate follow-on walk, reported not silently dropped).
    assert report.candidate_total == 239, "categoriser candidate-G set changed size"
    names = set(candidate_g_names())
    partition = report.minted | set(report.collapsed) | report.uncovered
    assert partition == names, "every candidate-G leaf must be accounted for exactly once"
    assert not (report.minted & set(report.collapsed))
    assert report.broken_collapse == {}, (
        f"a collapse disposition points at a non-emitted term: {report.broken_collapse}"
    )


def _committed_ontology_dir():
    from opda_gen.cli import _default_ontology_dir

    return _default_ontology_dir()
