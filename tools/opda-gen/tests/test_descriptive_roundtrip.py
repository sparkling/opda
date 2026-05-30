"""
Tests for the descriptive-layer round-trip CI harness (ODR-0022 §2 gate G3).

Realises:
- ODR-0022 §2 gate **G3 — coverage-by-test**: every form-question leaf is
  the `dct:source` of exactly one profile property-shape `sh:path` (round-trip
  coverage on the *collapsed* TBox), plus a worked per-leaf query retrieving
  a collapsed leaf **by path** and a Category-G leaf **by dereferenceable
  term**.
- Council session-023 (Knublauch/Davis co-signed gate): round-trip is a
  property of the SHACL profile, not of TBox cardinality — so it is tested.
- ADR-0029 §Consequence: the overlay profiles are currently emitted *thin*
  (the descriptive walk + per-form leaf enumeration are deferred to ADR-0028).
  These tests therefore assert the **harness mechanics** unconditionally, and
  the **full-coverage gate** is `xfail`-ed with a reason until emission lands,
  so they pass the existing suite cleanly today.

The structure mirrors the sibling CI tests (`test_profiles.py`,
`test_byte_identity.py`): emit a real corpus into a tmp dir, parse it, and
assert the runner's report.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from rdflib import Graph, Namespace, URIRef

from opda_gen.ci.descriptive_roundtrip_test import (
    BASPI5_FORMS_AUTHORITY,
    build_coverage_report,
    collect_form_leaves,
    collect_property_shape_bindings,
    retrieve_by_path,
    retrieve_by_term,
    run,
)
from opda_gen.emitters.profiles import emit_profile
from opda_gen.emitters.vocabularies import emit_vocabularies


OPDA = Namespace("https://w3id.org/opda/#")


# --- Fixtures ------------------------------------------------------------
@pytest.fixture
def emitted_corpus(tmp_path: Path) -> Path:
    """Emit the BASPI5 profile + the SKOS substrate into a tmp ontology dir.

    This is the minimum corpus the G3 harness needs: one overlay profile
    (the form leaves + property-shape bindings) and the vocabularies file
    (the SKOS schemes the Category-G / collapsed-C term query reaches into).
    """
    emit_profile("baspi5", tmp_path)
    emit_vocabularies(tmp_path)
    return tmp_path


@pytest.fixture
def baspi5_graph(emitted_corpus: Path) -> Graph:
    g = Graph()
    g.parse(str(emitted_corpus / "profiles" / "baspi5.ttl"), format="turtle")
    return g


# --- Harness mechanics (assert unconditionally — these hold today) -------
def test_run_returns_report_with_form_leaves(emitted_corpus: Path) -> None:
    """`run()` loads the profiles and reports a non-empty form-leaf set —
    the round-trip denominator (schema leaf paths under the forms authority)."""
    report = run(emitted_corpus)
    assert report.form_leaves, "expected form-question leaves in the profile"
    for leaf in report.form_leaves:
        assert leaf.startswith(BASPI5_FORMS_AUTHORITY), (
            f"form leaf {leaf} not under the BASPI5 forms authority"
        )


def test_collect_form_leaves_only_form_authority(baspi5_graph: Graph) -> None:
    """`collect_form_leaves` returns only form-question IRIs — NOT the ODR
    section anchors or ADR prov citations that also appear as `dct:source`
    (the G2 'point at the leaf, not the deciding ODR' discipline)."""
    leaves = collect_form_leaves(baspi5_graph)
    assert leaves
    assert all(l.startswith(BASPI5_FORMS_AUTHORITY) for l in leaves)
    # The profile's own ontology dct:source (ADR-0013) must be excluded.
    assert not any("/adr/" in l for l in leaves)
    assert not any("/odr/" in l for l in leaves)


def test_property_shape_bindings_have_path_and_source(
    baspi5_graph: Graph,
) -> None:
    """Every binding `collect_property_shape_bindings` returns carries both an
    `sh:path` and a form-question `dct:source` — the round-trip unit."""
    bindings = collect_property_shape_bindings(baspi5_graph)
    assert bindings, "expected at least one property-shape leaf binding"
    for b in bindings:
        assert b.form_leaf.startswith(BASPI5_FORMS_AUTHORITY)
        assert b.path is not None


def test_report_partitions_every_form_leaf(baspi5_graph: Graph) -> None:
    """The report partitions every form leaf into exactly one of
    addressable / unaddressable / doubly-bound — no leaf lost, none counted
    twice (the residue-register discipline applied to coverage accounting)."""
    report = build_coverage_report(baspi5_graph)
    partitioned = (
        set(report.addressable)
        | report.unaddressable
        | set(report.doubly_bound)
    )
    assert partitioned == report.form_leaves
    # Mutually exclusive.
    assert not (set(report.addressable) & report.unaddressable)
    assert not (set(report.addressable) & set(report.doubly_bound))
    assert not (report.unaddressable & set(report.doubly_bound))


# --- G3 (b): worked per-leaf query mechanism (scaffolding) ---------------
def test_retrieve_by_path_for_an_addressable_leaf(baspi5_graph: Graph) -> None:
    """G3 (b) mechanism (a): a leaf bound by a property shape is retrievable
    BY PATH via `dct:source` → `sh:path`. We assert the mechanism against
    whatever the (thin) profile binds today; once the descriptive walk lands,
    every collapsed leaf is retrieved the same way by its shared path."""
    report = build_coverage_report(baspi5_graph)
    if not report.addressable:
        pytest.skip("no addressable leaves emitted yet (profiles thin)")
    leaf, expected_path = next(iter(report.addressable.items()))
    paths = retrieve_by_path(baspi5_graph, leaf)
    assert expected_path in paths, (
        f"retrieve_by_path({leaf}) did not return its bound path"
    )


def test_retrieve_by_path_empty_for_unbound_leaf(baspi5_graph: Graph) -> None:
    """A form leaf with no property-shape binding returns no path — the
    emitted-thin signal G3 reports, not an error."""
    unbound = URIRef(f"{BASPI5_FORMS_AUTHORITY}#NONEXISTENT.QUESTION")
    assert retrieve_by_path(baspi5_graph, str(unbound)) == []


def test_retrieve_by_term_for_category_g_term(baspi5_graph: Graph) -> None:
    """G3 (b) mechanism (b): a Category-G term is retrieved by its
    DEREFERENCEABLE `opda:` IRI — the property shapes that use it as `sh:path`.

    `opda:currentEnergyRating` is a Category-G / regulatory-salience concept
    (EPC band, DESNZ-governed) already bound in the thin BASPI5 profile, so
    it exercises the term-grain retrieval path today."""
    result = retrieve_by_term(baspi5_graph, OPDA.currentEnergyRating)
    assert result["bound_by"], (
        "expected currentEnergyRating to be used as sh:path by a property "
        "shape (Category-G term-grain addressing)"
    )


# --- G3 (a): the full-coverage gate (xfail until the walk lands) ---------
@pytest.mark.xfail(
    reason=(
        "Profiles emitted thin (ADR-0029): the descriptive walk + per-form "
        "leaf enumeration (ADR-0028 Category-G + salience allow-list) are "
        "deferred to the curated WG pass, so most form leaves are not yet "
        "bound by a property-shape sh:path. G3 full coverage flips to a hard "
        "gate once emission lands."
    ),
    strict=False,
)
def test_full_round_trip_coverage_gate(emitted_corpus: Path) -> None:
    """ODR-0022 §2 G3 (a): every form-question leaf is the `dct:source` of
    exactly one profile property-shape `sh:path`. Expected to xfail today
    (thin emission); becomes a passing hard gate when the walk lands."""
    report = run(emitted_corpus)
    assert report.violations == [], (
        "descriptive round-trip coverage gaps:\n"
        + "\n".join(report.violations)
    )


def test_coverage_report_surfaces_gaps_without_raising(
    emitted_corpus: Path,
) -> None:
    """Until the walk lands the harness must REPORT gaps (not hard-fail the
    suite): `run()` returns cleanly, `is_complete` is False, and `gaps`
    explains why. This is the skip-with-reason contract the team-lead asked
    for — the suite stays green while coverage is incomplete."""
    report = run(emitted_corpus)
    assert not report.is_complete, (
        "harness reports complete coverage — if real, promote "
        "test_full_round_trip_coverage_gate to a non-xfail hard gate"
    )
    assert report.gaps, "expected the harness to surface coverage gaps"
