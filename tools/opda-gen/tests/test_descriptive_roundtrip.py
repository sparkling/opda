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
- ADR-0031: the BASPI5 overlay round-trip is closed — BASPI5 (the one
  non-thin profile) binds every form-question leaf it references by exactly
  one property-shape `sh:path`. These tests assert the **harness mechanics**
  unconditionally AND the **BASPI5 profile round-trip** as a hard passing
  assertion (the xfail marker was flipped to lock in that profile's round-trip
  totality). NOTE: this is a property of the emitted SHACL profile, NOT a claim
  that the full candidate-G walk has landed — TBox candidate-G emission
  coverage is tracked separately by the `ci-category-g-coverage` gate.

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


def test_schema_sanctioned_shared_ref_is_addressable_not_doubly_bound(
    baspi5_graph: Graph,
) -> None:
    """baspi5.json assigns ref `A1.1.5` to BOTH propertyPack.uprn and
    propertyPack.address.postcode. The honest dct:source is the real ref
    `A1.1.5` (the G19 acceptance gate forbids a fabricated `A1.1.5.uprn`),
    so it binds two sh:paths on two node shapes. G3 must treat this as
    addressable multi-entity coverage — NOT an over-binding violation — and
    both paths must stay recoverable by `retrieve_by_path`. Locks the
    resolution of the G19-vs-G3 conflict (ADR-0014 G19 / ODR-0022 §2 G3)."""
    report = build_coverage_report(baspi5_graph)
    ref = f"{BASPI5_FORMS_AUTHORITY}#A1.1.5"
    assert ref in report.addressable, (
        f"{ref} should be addressable (schema-sanctioned shared ref)"
    )
    assert ref not in report.doubly_bound, (
        f"{ref} must not be flagged doubly-bound — it mirrors baspi5.json's "
        "own one-ref-two-leaves structure"
    )
    paths = {str(p) for p in retrieve_by_path(baspi5_graph, ref)}
    assert {
        "https://w3id.org/opda/#hasUPRN",
        "http://www.w3.org/2006/vcard/ns#postal-code",
    } <= paths, f"both uprn + postcode paths must be recoverable; got {paths}"
    # The fabricated disambiguator must not reappear (G19).
    assert f"{BASPI5_FORMS_AUTHORITY}#A1.1.5.uprn" not in collect_form_leaves(
        baspi5_graph
    )


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


# --- G3 (a): the BASPI5 profile round-trip gate (HARD) -------------------
# Per ADR-0031 the xfail marker was flipped to a normal passing assertion once
# the BASPI5 overlay (the one non-thin profile) closed its round-trip: every
# BASPI5 form-question leaf is now sourced by exactly one profile
# property-shape sh:path, with no over-binding and no G2 traceability gap.
# This is a round-trip totality lock-in for the EMITTED PROFILES — it fails the
# suite if a future change re-introduces an unaddressable / doubly-bound leaf
# or an untraceable shape. It is NOT a measure of candidate-G TBox emission
# coverage (that is the `ci-category-g-coverage` gate) — most candidate-G
# leaves can still be unemitted while this passes.
def test_full_round_trip_coverage_gate(emitted_corpus: Path) -> None:
    """ODR-0022 §2 G3 (a): every form-question leaf is the `dct:source` of
    exactly one profile property-shape `sh:path` (no leaf unaddressable, none
    doubly-bound, every path-bearing shape traceable to a schema leaf). A
    passing hard gate since the BASPI5 profile round-trip was closed (the one
    non-thin overlay); full candidate-G walk coverage is tracked by
    ci-category-g-coverage."""
    report = run(emitted_corpus)
    assert report.violations == [], (
        "descriptive round-trip coverage gaps:\n"
        + "\n".join(report.violations)
    )


def test_baspi5_round_trip_coverage_is_complete(
    emitted_corpus: Path,
) -> None:
    """The BASPI5 profile round-trip lock-in: now the BASPI5 overlay (the one
    non-thin profile) has closed its round-trip, `run()` returns cleanly,
    `is_complete` is True, and there are no residual gaps. (Was the inverse
    "surface gaps without raising" tracker while the profiles were emitted
    thin.) This asserts the emitted SHACL profile round-trips — NOT that the
    full candidate-G walk has landed (see ci-category-g-coverage)."""
    report = run(emitted_corpus)
    assert report.is_complete, (
        "harness no longer reports complete coverage — the round-trip "
        "totality regressed; inspect report.violations / report.gaps"
    )
    assert not report.gaps, f"unexpected residual coverage gaps: {report.gaps}"
    assert report.addressable, "expected addressable form-question leaves"
