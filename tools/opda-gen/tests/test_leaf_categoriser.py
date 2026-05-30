"""
Tests for the path-aware leaf categoriser (ODR-0022 §2 gate G1).

Covers:
- The G1 acceptance case: `propertyPack.priceInformation.price` → G and
  `propertyPack.fixturesAndFittings.*.price` → D (a name-only rule would
  mis-bin the headline asking price into the chattel bucket).
- The §3 regulatory-salience carve-out: regulator-named generic tails → G.
- Category-count sanity over the real canonical corpus, including the
  ODR-0022 §1 projection that the candidate Category-G set is ~181 names.
- The residue register: every residue leaf is a G leaf, recorded not dropped.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from opda_gen.inputs.leaf_categoriser import (
    categorise,
    categorise_all,
    load_records,
    report_to_dict,
)

_DATA = (
    Path(__file__).resolve().parents[3]
    / "source"
    / "00-deliverables"
    / "semantic-models"
    / "data-dictionary-canonical.json"
)


# --------------------------------------------------------------------------
# Gate G1 — the path-aware acceptance case (the reason the rule exists).
# --------------------------------------------------------------------------


def test_g1_headline_price_is_category_g():
    """The headline asking price bins to G — a name-only rule mis-bins it."""
    assert categorise("propertyPack.priceInformation.price", has_enum=False) == "G"


def test_g1_fixtures_price_is_category_d():
    """A chattel price under fixtures bins to D, not G."""
    assert (
        categorise(
            "propertyPack.fixturesAndFittings.kitchen.boiler.price", has_enum=False
        )
        == "D"
    )


def test_g1_two_prices_split_by_path_not_name():
    """The same final segment `price` splits G vs D on its full path."""
    headline = categorise("propertyPack.priceInformation.price", has_enum=False)
    chattel = categorise(
        "propertyPack.fixturesAndFittings.bathroom.towelRail.price", has_enum=False
    )
    assert (headline, chattel) == ("G", "D")


def test_g1_on_real_corpus_all_fixtures_prices_are_d():
    """Over the live corpus: every `fixturesAndFittings.*.price` is D."""
    report = categorise_all(load_records(_DATA))
    fixtures_prices = [
        lf
        for lf in report.leaves
        if lf.leaf_path.endswith(".price") and "fixturesAndFittings" in lf.leaf_path
    ]
    assert fixtures_prices, "expected fixtures price leaves in the corpus"
    assert all(lf.category == "D" for lf in fixtures_prices)
    headline = [
        lf for lf in report.leaves if lf.leaf_path == "propertyPack.priceInformation.price"
    ]
    assert headline and headline[0].category == "G"


# --------------------------------------------------------------------------
# §3 regulatory-salience carve-out.
# --------------------------------------------------------------------------


@pytest.mark.parametrize(
    "path",
    [
        "propertyPack.buildingSafety.details",
        "propertyPack.environmentalIssues.flooding.floodRisk.details",
        "propertyPack.specialistIssues.japaneseKnotweed.details",
        "propertyPack.councilTax.details",
    ],
)
def test_salience_regulator_named_generic_tail_is_g(path):
    """A `details` tail under a regulator-named question is curated as G."""
    assert categorise(path, has_enum=False) == "G"


def test_salience_plain_disclosure_detail_stays_a():
    """A `details` tail with no regulator-named ancestor stays in A."""
    assert (
        categorise("propertyPack.notices.someOrdinaryNotice.details", has_enum=False)
        == "A"
    )


def test_salience_does_not_override_fixtures():
    """The §4 fixtures rule is more specific than the salience carve-out."""
    assert (
        categorise(
            "propertyPack.fixturesAndFittings.kitchen.boiler.details", has_enum=False
        )
        == "D"
    )


# --------------------------------------------------------------------------
# Category routing — the structural rules.
# --------------------------------------------------------------------------


def test_attachment_tail_is_b():
    assert categorise("propertyPack.buildingSafety.attachments", has_enum=False) == "B"


def test_search_result_field_in_container_is_e():
    assert (
        categorise(
            "propertyPack.localSearches.coalMining.riskIndicator", has_enum=False
        )
        == "E"
    )


def test_search_field_outside_container_is_not_e():
    """`summary` outside a search/environmental container is not pulled to E."""
    assert categorise("propertyPack.buildInformation.summary", has_enum=False) != "E"


def test_address_subfield_is_f():
    assert categorise("participants[].address.postcode", has_enum=False) == "F"


def test_enum_with_no_structural_signal_is_c():
    assert categorise("propertyPack.heating.someStatus", has_enum=True) == "C"


def test_genuine_descriptive_default_is_g():
    assert categorise("propertyPack.buildInformation.yearOfBuild", has_enum=False) == "G"


@pytest.mark.parametrize(
    "path",
    [
        "propertyPack.energyEfficiency.certificate.currentEnergyRating",
        "propertyPack.councilTax.councilTaxBand",
        "propertyPack.buildInformation.building.builtForm",
        "propertyPack.buildInformation.building.ownershipType",
        "propertyPack.heating.centralHeatingFuelType",
        "propertyPack.heating.heatingType",
    ],
)
def test_enum_bearing_quale_attr_is_g_not_c(path):
    """ODR-0022 §1 / ODR-0008 §Q5a: a genuine Property/estate attribute is G
    even when it carries an enum (the enum becomes its SKOS range) — the
    corrected ADR-0030 §G1 defect (S025) that over-captured these into C."""
    assert categorise(path, has_enum=True) == "G"


# --------------------------------------------------------------------------
# Corpus-level sanity (counts, candidate-G size, residue discipline).
# --------------------------------------------------------------------------


def test_every_annotated_leaf_binned_to_exactly_one_category():
    report = categorise_all(load_records(_DATA))
    total = sum(report.counts.values())
    assert total == len(report.leaves)
    assert set(report.counts) == set("ABCDEFG")
    assert all(lf.category in "ABCDEFG" for lf in report.leaves)


def test_annotated_base_leaf_total_matches_evidence_pack():
    """1,493 annotated true base leaves (S023-EVIDENCE §A)."""
    report = categorise_all(load_records(_DATA))
    assert sum(report.counts.values()) == 1493


def test_candidate_g_distinct_names_near_181():
    """ODR-0022 §1 projection: ~181 genuine descriptive concepts."""
    report = categorise_all(load_records(_DATA))
    assert 160 <= len(report.candidate_g_names) <= 200


def test_residue_leaves_are_all_category_g_and_recorded():
    """Residue (§5) is a flagged subset of G — recorded, never dropped."""
    report = categorise_all(load_records(_DATA))
    assert all(lf.category == "G" for lf in report.residue)
    assert all(lf.is_residue for lf in report.residue)
    # Every residue leaf is present in the full assignment (no silent loss).
    leaf_paths = {lf.leaf_path for lf in report.leaves}
    assert all(lf.leaf_path in leaf_paths for lf in report.residue)


def test_flagship_quale_attrs_are_g_in_corpus():
    """S025 defect fix over the live corpus: the enum-bearing flagship Quale
    attributes land in G, never C."""
    report = categorise_all(load_records(_DATA))
    by_name: dict[str, set[str]] = {}
    for lf in report.leaves:
        by_name.setdefault(lf.name, set()).add(lf.category)
    for nm in ("currentEnergyRating", "councilTaxBand", "builtForm"):
        cats = by_name.get(nm, set())
        assert cats and "G" in cats and "C" not in cats, (nm, cats)


def test_report_dict_is_deterministic_and_sorted():
    records = load_records(_DATA)
    first = report_to_dict(categorise_all(records))
    second = report_to_dict(categorise_all(records))
    assert first == second
    assert first["candidate_g"]["names"] == sorted(first["candidate_g"]["names"])
    paths = [row["leaf_path"] for row in first["assignment"]]
    assert paths == sorted(paths)
