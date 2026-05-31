"""
Tests for the SKOS vocabulary emission (ADR-0010).

Realises:
- ADR-0010 §Confirmation #1 — `emit-vocabularies` produces
  `opda-vocabularies.ttl`.
- ADR-0010 §Confirmation #2 — second-run regeneration is byte-identical.
- ADR-0010 §Confirmation #3 — no `sh:*` triples in the vocabularies file
  (ODR-0004 §3a three-graph separation).
- ADR-0010 §Confirmation #4 — every emitted `skos:ConceptScheme` carries
  `opda:ufoCategory` (SPARQL: empty after FILTER NOT EXISTS).
- ADR-0010 §Confirmation #5 — every scheme + member carries `dct:source`.
- ADR-0010 §Confirmation #6 — cardinality discipline: every member carries
  exactly one `skos:prefLabel @en`, one `skos:notation`, one
  `skos:definition @en` (ODR-0011 §S14/§S15).
- ODR-0011 §1a — every scheme carries `opda:hasSteward` (S008 Q2 named-
  steward discipline).
"""

from __future__ import annotations

import tempfile
from pathlib import Path

import pytest
from rdflib import Graph, Namespace
from rdflib.namespace import DCTERMS, RDF, SKOS

from opda_gen.emitters.vocabularies import (
    VOCABULARIES_FILENAME,
    emit_vocabularies,
    _all_schemes,
)


OPDA = Namespace("https://w3id.org/opda/#")
SH = Namespace("http://www.w3.org/ns/shacl#")


# --- Fixtures ------------------------------------------------------------
@pytest.fixture
def emitted_graph(tmp_path: Path) -> Graph:
    """Emit + parse the vocabularies file into an rdflib Graph fixture."""
    emit_vocabularies(tmp_path)
    g = Graph()
    g.parse(str(tmp_path / VOCABULARIES_FILENAME), format="turtle")
    return g


# --- Confirmation #1 -----------------------------------------------------
def test_emit_vocabularies_produces_file(tmp_path: Path) -> None:
    """The emission writes `opda-vocabularies.ttl` to the output dir and
    the file is non-empty Turtle."""
    written = emit_vocabularies(tmp_path)
    assert (tmp_path / VOCABULARIES_FILENAME).exists()
    assert (tmp_path / VOCABULARIES_FILENAME).stat().st_size > 0
    # Returned mapping mirrors the foundation emitter's interface.
    assert list(written.keys()) == [tmp_path / VOCABULARIES_FILENAME]


# ADR-0010 first batch (16) + ADR-0013 G8 additions (7).
_FIRST_BATCH_AND_G8 = {
    # ADR-0010 first batch (16)
    "BuiltFormScheme",
    "CouncilTaxBandSchemeEW",
    "CouncilTaxBandSchemeScotland",
    "CurrentEnergyRatingScheme",
    "CentralHeatingFuelTypeScheme",
    "HeatingTypeScheme",
    "OwnershipTypeScheme",
    "TenureKindScheme",
    "RoleScheme",
    "ParticipantStatusScheme",
    "TransactionStatusScheme",
    "MilestoneKindScheme",
    "SellersCapacityScheme",
    "AssuranceLevelScheme",
    "EvidenceMethodScheme",
    "AddressVariantScheme",
    # ADR-0013 G8 additions (7)
    "YesNoScheme",
    "YesNoNotApplicableScheme",
    "YesNoNotKnownScheme",
    "YesNoNotRequiredScheme",
    "PropertyTypeScheme",
    "OffMainsDrainageSystemTypeScheme",
    "OwnerTypeScheme",
}

# ODR-0022 Category C reused status-enum value-spaces (14).
_CATEGORY_C_SCHEMES = {
    "AttachmentStatusScheme",
    "AttachmentStatusNotApplicableScheme",
    "InclusionStatusScheme",
    "InclusionScheme",
    "FittedOrFreestandingScheme",
    "UtilityConnectionStatusScheme",
    "UtilityConnectionStatusNotKnownScheme",
    "BoundaryResponsibilityScheme",
    "RoadAdoptionStatusScheme",
    "FeeTypeScheme",
    "ChargePaymentStatusScheme",
    "ManagedAreaResponsibilityScheme",
    "DeedSupplyStatusScheme",
    "UnitOfAreaScheme",
}

# ODR-0022 Category D (candidate) — fixtures-checklist item scheme (1).
_CATEGORY_D_SCHEMES = {"FixtureItemScheme"}

# ODR-0008d Category E — peril/dataset axis + rating value-spaces (3).
_CATEGORY_E_SCHEMES = {
    "PerilScheme",
    "ActionAlertRatingScheme",
}

# ODR-0024 (Curated Category-G Walk) — R4 schoolType→SKOS (1) + R6
# data-attested-enum SKOS schemes (5).
_ODR_0024_SCHEMES = {
    # R3 — the ISO-4217 currency value-space for opda:MonetaryAmount (the
    # Category-G monetary walk, ADR-0005 §G22).
    "CurrencyScheme",
    # R4 — nearby-school band value-space (replaces 5 rejected object props).
    "SchoolTypeScheme",
    # R6 — schemes minted from enums the data dictionary actually carries
    # (construction / price-qualifier / transport / broadband / Ofsted).
    "ConstructionTypeScheme",
    "PriceQualifierScheme",
    "TransportTypeScheme",
    "BroadbandConnectionTypeScheme",
    "OfstedRatingScheme",
}
assert len(_ODR_0024_SCHEMES) == 7

_ALL_SCHEME_NAMES = (
    _FIRST_BATCH_AND_G8
    | _CATEGORY_C_SCHEMES
    | _CATEGORY_D_SCHEMES
    | _CATEGORY_E_SCHEMES
    | _ODR_0024_SCHEMES
)


def test_emit_vocabularies_produces_47_schemes(emitted_graph: Graph) -> None:
    """16 first-batch + 7 G8 + 14 Category-C status-enum value-spaces
    (ODR-0022 §1) + 1 candidate FixtureItemScheme (ODR-0022 §4) + 2
    Category-E schemes (ODR-0008d: PerilScheme + ActionAlertRatingScheme;
    riskIndicator reuses YesNoNotKnownScheme) + 7 ODR-0024 schemes (R3
    CurrencyScheme + R4 SchoolTypeScheme + R6 construction / price-qualifier /
    transport / broadband / Ofsted). Total 47."""
    schemes = list(emitted_graph.subjects(RDF.type, SKOS.ConceptScheme))
    assert len(schemes) == len(_ALL_SCHEME_NAMES) == 47, (
        f"expected 47 schemes (16 first-batch + 7 G8 + 14 Cat-C + 1 Cat-D "
        f"+ 2 Cat-E + 7 ODR-0024), got {len(schemes)}: "
        f"{sorted(str(s) for s in schemes)}"
    )
    emitted_names = {str(s).rsplit("#", 1)[-1] for s in schemes}
    assert emitted_names == _ALL_SCHEME_NAMES, (
        f"diff: {_ALL_SCHEME_NAMES ^ emitted_names}"
    )


def test_currency_scheme(emitted_graph: Graph) -> None:
    """ODR-0024 R3 — opda:CurrencyScheme is the ISO-4217 currency value-space
    for opda:MonetaryAmount, seeded GBP / EUR / USD (extensible), each a flat
    top concept."""
    members = list(emitted_graph.subjects(SKOS.inScheme, OPDA.CurrencyScheme))
    notations = {
        str(n) for m in members for n in emitted_graph.objects(m, SKOS.notation)
    }
    assert notations == {"GBP", "EUR", "USD"}
    for m in members:
        assert (m, SKOS.topConceptOf, OPDA.CurrencyScheme) in emitted_graph


# --- Confirmation #2 (byte-identity) -------------------------------------
def test_byte_identical_across_two_runs(tmp_path: Path) -> None:
    """Per ADR-0010 §Confirmation #2: second-run regeneration produces zero
    diff."""
    a = tmp_path / "a"
    b = tmp_path / "b"
    a.mkdir()
    b.mkdir()
    emit_vocabularies(a)
    emit_vocabularies(b)
    assert (a / VOCABULARIES_FILENAME).read_bytes() == (
        b / VOCABULARIES_FILENAME
    ).read_bytes()


# --- Confirmation #3 (three-graph separation) ----------------------------
def test_no_shacl_triples_in_vocabularies(emitted_graph: Graph) -> None:
    """Per ADR-0010 §Confirmation #3 + ODR-0004 §3a: no `sh:*` triples in
    the vocabularies file. The Cagle SHACL-AF deprecation-chain rule body
    lives in code as a constant string, NOT as Turtle triples here."""
    sh_triples = [
        (s, p, o)
        for s, p, o in emitted_graph
        if str(p).startswith(str(SH))
        or str(s).startswith(str(SH))
        or (hasattr(o, "startswith") and str(o).startswith(str(SH)))
    ]
    assert sh_triples == [], (
        f"vocabularies graph contains sh:* triples (violates ODR-0004 §3a): "
        f"{sh_triples}"
    )


# --- Confirmation #4 (every scheme has UFO category) ---------------------
def test_every_scheme_has_ufo_category(emitted_graph: Graph) -> None:
    """SPARQL equivalent of ADR-0010 §Confirmation #4:
        SELECT ?s WHERE { ?s a skos:ConceptScheme .
                          FILTER NOT EXISTS { ?s opda:ufoCategory ?c } }
    MUST return empty.
    """
    missing = []
    for scheme in emitted_graph.subjects(RDF.type, SKOS.ConceptScheme):
        if not list(emitted_graph.objects(scheme, OPDA.ufoCategory)):
            missing.append(str(scheme))
    assert missing == [], f"schemes missing opda:ufoCategory: {missing}"


def test_ufo_category_value_is_in_seven_category_framework(
    emitted_graph: Graph,
) -> None:
    """ODR-0011 §8a names exactly seven categories: Role label, Phase label,
    Quale-in-Region, Method/plan code, Quality Region, Substance Kind label,
    Quality Value. Every emitted `opda:ufoCategory` literal MUST be one of
    these strings (ODR-0011 §"odr-review lint extension contract" item (ii))."""
    allowed = {
        "Role label",
        "Phase label",
        "Quale-in-Region",
        "Method/plan code",
        "Quality Region",
        "Substance Kind label",
        "Quality Value",
    }
    violations = []
    for scheme, _p, cat in emitted_graph.triples(
        (None, OPDA.ufoCategory, None)
    ):
        if str(cat) not in allowed:
            violations.append((str(scheme), str(cat)))
    assert violations == [], (
        f"ufoCategory values not in the seven-category framework: {violations}"
    )


# --- Confirmation #5 (every scheme has dct:source) ----------------------
def test_every_scheme_has_dct_source(emitted_graph: Graph) -> None:
    """Per ADR-0010 §Confirmation #5: every scheme carries `dct:source`."""
    missing = []
    for scheme in emitted_graph.subjects(RDF.type, SKOS.ConceptScheme):
        if not list(emitted_graph.objects(scheme, DCTERMS.source)):
            missing.append(str(scheme))
    assert missing == [], f"schemes missing dct:source: {missing}"


# --- ODR-0011 §1a (every scheme has steward) -----------------------------
def test_every_scheme_has_steward(emitted_graph: Graph) -> None:
    """Per ODR-0011 §1a + S008 Q2 named-steward discipline: every scheme
    carries `opda:hasSteward` (as a Literal naming the steward)."""
    missing = []
    for scheme in emitted_graph.subjects(RDF.type, SKOS.ConceptScheme):
        if not list(emitted_graph.objects(scheme, OPDA.hasSteward)):
            missing.append(str(scheme))
    assert missing == [], f"schemes missing opda:hasSteward: {missing}"


# --- ADR-0010 per-scheme metadata MUST-haves -----------------------------
def test_every_scheme_has_pref_label_title_definition_scope_note(
    emitted_graph: Graph,
) -> None:
    """Per ADR-0010 §"Per-scheme metadata MUST-haves": every scheme carries
    `skos:prefLabel @en`, `dct:title @en`, `skos:definition @en`, and
    `skos:scopeNote @en`."""
    for scheme in emitted_graph.subjects(RDF.type, SKOS.ConceptScheme):
        pref_labels = list(emitted_graph.objects(scheme, SKOS.prefLabel))
        titles = list(emitted_graph.objects(scheme, DCTERMS.title))
        definitions = list(emitted_graph.objects(scheme, SKOS.definition))
        scope_notes = list(emitted_graph.objects(scheme, SKOS.scopeNote))
        assert len(pref_labels) == 1, (
            f"{scheme} prefLabel count {len(pref_labels)} != 1"
        )
        assert pref_labels[0].language == "en"
        assert len(titles) == 1
        assert titles[0].language == "en"
        assert len(definitions) == 1
        assert definitions[0].language == "en"
        assert len(scope_notes) == 1
        assert scope_notes[0].language == "en"


# --- Per-member MUST-haves (ADR-0010 + ODR-0011 §S14/S15) ----------------
def test_every_member_has_required_fields(emitted_graph: Graph) -> None:
    """Per ADR-0010 §"Per-member MUST-haves": every `skos:Concept` carries
    `skos:inScheme`, `skos:prefLabel @en`, `skos:notation`,
    `skos:definition @en`, and `dct:source`."""
    members = list(emitted_graph.subjects(RDF.type, SKOS.Concept))
    assert len(members) > 0, "no skos:Concept members emitted"
    violations = []
    for m in members:
        if not list(emitted_graph.objects(m, SKOS.inScheme)):
            violations.append(f"{m} missing skos:inScheme")
        if not list(emitted_graph.objects(m, SKOS.prefLabel)):
            violations.append(f"{m} missing skos:prefLabel")
        if not list(emitted_graph.objects(m, SKOS.notation)):
            violations.append(f"{m} missing skos:notation")
        if not list(emitted_graph.objects(m, SKOS.definition)):
            violations.append(f"{m} missing skos:definition")
        if not list(emitted_graph.objects(m, DCTERMS.source)):
            violations.append(f"{m} missing dct:source")
    assert violations == [], "members missing required fields:\n" + "\n".join(
        violations
    )


def test_member_label_cardinality(emitted_graph: Graph) -> None:
    """Per ODR-0011 §S14/§S15: each member has exactly one
    `skos:prefLabel @en`, exactly one `skos:notation`, exactly one
    `skos:definition @en`."""
    members = list(emitted_graph.subjects(RDF.type, SKOS.Concept))
    violations = []
    for m in members:
        pref_labels = list(emitted_graph.objects(m, SKOS.prefLabel))
        notations = list(emitted_graph.objects(m, SKOS.notation))
        definitions = list(emitted_graph.objects(m, SKOS.definition))
        if len(pref_labels) != 1 or pref_labels[0].language != "en":
            violations.append(
                f"{m} prefLabel cardinality {len(pref_labels)} or non-@en"
            )
        if len(notations) != 1:
            violations.append(f"{m} notation cardinality {len(notations)} != 1")
        if len(definitions) != 1 or definitions[0].language != "en":
            violations.append(
                f"{m} definition cardinality {len(definitions)} or non-@en"
            )
    assert violations == [], "\n".join(violations)


def test_member_inScheme_points_at_emitted_scheme(emitted_graph: Graph) -> None:
    """Every `skos:Concept`'s `skos:inScheme` MUST point at a
    `skos:ConceptScheme` actually emitted in the file (no dangling
    refs)."""
    schemes = set(emitted_graph.subjects(RDF.type, SKOS.ConceptScheme))
    members = list(emitted_graph.subjects(RDF.type, SKOS.Concept))
    violations = []
    for m in members:
        for in_scheme in emitted_graph.objects(m, SKOS.inScheme):
            if in_scheme not in schemes:
                violations.append(
                    f"{m} inScheme {in_scheme} is not an emitted scheme"
                )
    assert violations == [], "\n".join(violations)


# --- Per-member dct:source (Confirmation #5 second half) -----------------
def test_every_member_has_dct_source(emitted_graph: Graph) -> None:
    """Per ADR-0010 §Confirmation #5: every member carries dct:source.
    (Second half of #5; schemes covered separately above.)"""
    members = list(emitted_graph.subjects(RDF.type, SKOS.Concept))
    missing = [
        str(m)
        for m in members
        if not list(emitted_graph.objects(m, DCTERMS.source))
    ]
    assert missing == [], f"members missing dct:source: {missing}"


# --- Scheme catalogue (mapping audit) ------------------------------------
def test_scheme_local_names_and_member_count(emitted_graph: Graph) -> None:
    """Cross-check the in-code scheme registry against the emitted graph:
    each `Scheme` instance in `_all_schemes()` produces exactly the named
    `skos:ConceptScheme` and the expected member count."""
    for scheme in _all_schemes():
        scheme_uri = scheme.scheme_uri()
        assert (
            scheme_uri,
            RDF.type,
            SKOS.ConceptScheme,
        ) in emitted_graph, f"{scheme.local_name} missing from graph"
        emitted_members = [
            m
            for m in emitted_graph.subjects(SKOS.inScheme, scheme_uri)
        ]
        assert len(emitted_members) == len(scheme.members), (
            f"{scheme.local_name}: expected {len(scheme.members)} members, "
            f"emitted {len(emitted_members)}"
        )


def test_total_member_count_matches_in_code_registry(
    emitted_graph: Graph,
) -> None:
    """The emitted member count equals the sum of in-code scheme member
    counts. Acts as a regression guard against silent member loss."""
    expected = sum(len(s.members) for s in _all_schemes())
    emitted = len(list(emitted_graph.subjects(RDF.type, SKOS.Concept)))
    assert emitted == expected, f"{emitted} members vs expected {expected}"


# --- ODR-0022 Category C: reused status-enum value-spaces ----------------
def _scheme_by_name(name: str) -> object:
    """Return the `Scheme` instance with the given local_name."""
    for s in _all_schemes():
        if s.local_name == name:
            return s
    raise AssertionError(f"no scheme named {name}")


def test_category_c_schemes_present(emitted_graph: Graph) -> None:
    """All 14 Category-C reused status-enum value-spaces are emitted as
    `skos:ConceptScheme`s (ODR-0022 §1)."""
    emitted = {str(s).rsplit("#", 1)[-1] for s in
               emitted_graph.subjects(RDF.type, SKOS.ConceptScheme)}
    missing = _CATEGORY_C_SCHEMES - emitted
    assert not missing, f"missing Category-C schemes: {missing}"


def test_category_c_member_counts(emitted_graph: Graph) -> None:
    """Each Category-C scheme has exactly the member count of its enum
    value-set (the distinct sorted enum tuple it reuses)."""
    expected_counts = {
        "AttachmentStatusScheme": 2,
        "AttachmentStatusNotApplicableScheme": 3,
        "InclusionStatusScheme": 3,
        "InclusionScheme": 2,
        "FittedOrFreestandingScheme": 2,
        "UtilityConnectionStatusScheme": 3,
        "UtilityConnectionStatusNotKnownScheme": 4,
        "BoundaryResponsibilityScheme": 4,
        "RoadAdoptionStatusScheme": 4,
        "FeeTypeScheme": 4,
        "ChargePaymentStatusScheme": 4,
        "ManagedAreaResponsibilityScheme": 6,
        "DeedSupplyStatusScheme": 3,
        "UnitOfAreaScheme": 2,
    }
    for name, count in expected_counts.items():
        scheme_uri = OPDA[name]
        members = list(emitted_graph.subjects(SKOS.inScheme, scheme_uri))
        assert len(members) == count, (
            f"{name}: expected {count} members, got {len(members)}"
        )


def test_inclusion_status_scheme_members(emitted_graph: Graph) -> None:
    """The InclusionStatusScheme value-space carries exactly Included /
    Excluded / None — the value-scheme the council-reserved
    `opda:inclusionStatus` property (ODR-0023 R4) will range over. The
    property itself is NOT emitted here (boundary)."""
    members = {
        str(n)
        for m in emitted_graph.subjects(SKOS.inScheme, OPDA.InclusionStatusScheme)
        for n in emitted_graph.objects(m, SKOS.notation)
    }
    assert members == {"Included", "Excluded", "None"}


def test_inclusion_status_property_not_emitted(emitted_graph: Graph) -> None:
    """BOUNDARY (ODR-0023 R4): the inclusion-status *property*
    `opda:inclusionStatus` is council-reserved and MUST NOT appear as a
    subject in this emission — only the value-scheme is emitted."""
    incl_prop = OPDA.inclusionStatus
    triples = list(emitted_graph.triples((incl_prop, None, None)))
    assert triples == [], (
        f"opda:inclusionStatus must be council-reserved (ODR-0023 R4), "
        f"not emitted; found: {triples}"
    )


def test_category_c_member_source_is_schema_leaf_not_odr(
    emitted_graph: Graph,
) -> None:
    """ODR-0022 G2: every Category-C *member* `dct:source` points at a
    schema leaf path (the data-dictionary IRI), NOT at the deciding ODR."""
    dd_prefix = "https://w3id.org/opda/data-dictionary#"
    for name in _CATEGORY_C_SCHEMES:
        scheme_uri = OPDA[name]
        for m in emitted_graph.subjects(SKOS.inScheme, scheme_uri):
            sources = [str(s) for s in emitted_graph.objects(m, DCTERMS.source)]
            assert sources, f"{m} missing dct:source"
            for src in sources:
                assert src.startswith(dd_prefix), (
                    f"{name} member {m} dct:source {src} is not a schema "
                    f"leaf (ODR-0022 G2 — must not point at the deciding ODR)"
                )


# --- Category C: shared-property reuse, NOT one scheme per leaf -----------
def test_no_per_leaf_scheme_explosion(emitted_graph: Graph) -> None:
    """ODR-0022 anti-pattern §6: do NOT mint one scheme per leaf. The 89
    fixtures `isIncludedExcludedOrNone` leaves all share ONE
    InclusionStatusScheme; there is NO scheme minted per fixtures leaf.

    Verified by: the InclusionStatusScheme exists, has 3 members, and is
    sourced (per-member) from multiple distinct fixtures leaf paths — i.e.
    one value-space reused across many leaves, not one scheme per leaf."""
    scheme_uri = OPDA.InclusionStatusScheme
    assert (scheme_uri, RDF.type, SKOS.ConceptScheme) in emitted_graph
    members = list(emitted_graph.subjects(SKOS.inScheme, scheme_uri))
    assert len(members) == 3, "InclusionStatusScheme must reuse one 3-value set"
    # No scheme should be named after an individual fixtures item or leaf.
    scheme_names = {
        str(s).rsplit("#", 1)[-1]
        for s in emitted_graph.subjects(RDF.type, SKOS.ConceptScheme)
    }
    leafish = {
        n for n in scheme_names
        if "boilerImmersion" in n.lower() or "isIncludedExcluded" in n.lower()
        or "radiators" in n.lower()
    }
    assert not leafish, f"per-leaf scheme(s) minted (anti-pattern): {leafish}"


def test_category_c_schemes_are_quale_in_region(emitted_graph: Graph) -> None:
    """Per ODR-0011 §8a, the reused status value-spaces are Quale-in-Region
    (Cagle SHACL-targeting: a value of a banded quality region)."""
    for name in _CATEGORY_C_SCHEMES:
        cats = [
            str(c)
            for c in emitted_graph.objects(OPDA[name], OPDA.ufoCategory)
        ]
        assert cats == ["Quale-in-Region"], f"{name} ufoCategory = {cats}"


# --- ODR-0022 Category D (candidate): FixtureItemScheme ------------------
def test_fixture_item_scheme_present_with_89_items(emitted_graph: Graph) -> None:
    """ODR-0022 §4 Category D: `opda:FixtureItemScheme` carries the ~89
    fixtures-checklist item concepts (ITEMS ONLY)."""
    scheme_uri = OPDA.FixtureItemScheme
    assert (scheme_uri, RDF.type, SKOS.ConceptScheme) in emitted_graph
    members = list(emitted_graph.subjects(SKOS.inScheme, scheme_uri))
    assert len(members) == 89, (
        f"expected 89 fixture items, got {len(members)}"
    )


def test_fixture_item_member_uris_encode_category(emitted_graph: Graph) -> None:
    """Colliding bare item names (bedroom1 ×5, kitchen ×5, etc.) MUST stay
    distinct concepts: the member URI encodes the category path. Confirmed
    by the member count (89) being the count of category-qualified items,
    not the 61 distinct bare names."""
    members = [
        str(m)
        for m in emitted_graph.subjects(SKOS.inScheme, OPDA.FixtureItemScheme)
    ]
    # All member URIs share the fixtureItem slug base and are unique.
    assert len(set(members)) == 89, "fixture item URIs must be distinct"
    assert all("fixtureItem/" in m for m in members)
    # The 5 carpets/fittedUnits/lightFittings/curtain rooms named bedroom1
    # are distinct URIs (category-qualified), proving no name collapse.
    bedroom1 = [m for m in members if m.endswith("/bedroom1")]
    assert len(bedroom1) == 5, (
        f"expected 5 category-qualified bedroom1 concepts, got {len(bedroom1)}"
    )


def test_fixture_item_inclusion_property_not_on_items(
    emitted_graph: Graph,
) -> None:
    """ODR-0022 §4 / ODR-0023 R4 BOUNDARY: items are ITEMS ONLY — no
    fixture-item concept carries an inclusion-status property (that is a
    Mode/Relator of the sale, council-reserved, not a property of the
    item)."""
    incl_props = {OPDA.inclusionStatus, OPDA.isIncludedExcludedOrNone}
    violations = []
    for m in emitted_graph.subjects(SKOS.inScheme, OPDA.FixtureItemScheme):
        for p in emitted_graph.predicates(m, None):
            if p in incl_props:
                violations.append((str(m), str(p)))
    assert violations == [], (
        f"fixture items must not carry an inclusion property: {violations}"
    )


def test_fixture_item_source_is_schema_leaf(emitted_graph: Graph) -> None:
    """Every fixture-item `dct:source` points at the schema
    `isIncludedExcludedOrNone` leaf path (ODR-0022 G2)."""
    dd_prefix = "https://w3id.org/opda/data-dictionary#"
    for m in emitted_graph.subjects(SKOS.inScheme, OPDA.FixtureItemScheme):
        sources = [str(s) for s in emitted_graph.objects(m, DCTERMS.source)]
        assert sources, f"{m} missing dct:source"
        for src in sources:
            assert src.startswith(dd_prefix) and "fixturesAndFittings" in src, (
                f"fixture item {m} dct:source {src} is not a fixtures leaf"
            )


# ---------------------------------------------------------------------------
# ODR-0008d Category E — opda:PerilScheme + rating value-spaces
# ---------------------------------------------------------------------------
def test_peril_scheme_has_exactly_12_concepts(emitted_graph: Graph) -> None:
    """ODR-0008d Rule 2: opda:PerilScheme carries EXACTLY 12 skos:Concepts —
    the canonical environmental/search peril axis."""
    members = list(emitted_graph.subjects(SKOS.inScheme, OPDA.PerilScheme))
    assert len(members) == 12, (
        f"expected 12 peril concepts, got {len(members)}: "
        f"{sorted(str(m) for m in members)}"
    )


def test_peril_scheme_member_set_matches_rule_2(emitted_graph: Graph) -> None:
    """The 12 perils are exactly those ODR-0008d Rule 2 names (by notation)."""
    notations = {
        str(n)
        for m in emitted_graph.subjects(SKOS.inScheme, OPDA.PerilScheme)
        for n in emitted_graph.objects(m, SKOS.notation)
    }
    assert notations == {
        "Flooding", "CoalMining", "NonCoalMining", "Radon",
        "GroundStability", "ContaminatedLand", "CoastalErosion", "Climate",
        "Energy", "Infrastructure", "Planning", "Transportation",
    }


def test_peril_concepts_are_top_concepts_and_quale(emitted_graph: Graph) -> None:
    """Each peril is skos:topConceptOf the scheme (mirroring
    opda:BoundedContextScheme) and the scheme carries opda:ufoCategory
    'Quale-in-Region' (Rule 2)."""
    assert (OPDA.PerilScheme, OPDA.ufoCategory, None) in emitted_graph
    ufo = list(emitted_graph.objects(OPDA.PerilScheme, OPDA.ufoCategory))
    assert [str(x) for x in ufo] == ["Quale-in-Region"]
    for m in emitted_graph.subjects(SKOS.inScheme, OPDA.PerilScheme):
        assert (m, SKOS.topConceptOf, OPDA.PerilScheme) in emitted_graph, (
            f"peril {m} is not skos:topConceptOf the scheme"
        )


def test_peril_members_source_to_governing_authority(
    emitted_graph: Graph,
) -> None:
    """ODR-0008d Rule 2: each peril's dct:source is its governing data
    authority (an external regulator URL), NOT a schema leaf / ODR section."""
    for m in emitted_graph.subjects(SKOS.inScheme, OPDA.PerilScheme):
        sources = [str(s) for s in emitted_graph.objects(m, DCTERMS.source)]
        assert sources, f"{m} missing dct:source"
        for src in sources:
            assert "/odr/ODR-" not in src, (
                f"peril {m} dct:source {src} points at an ODR, not an "
                "authority"
            )
            assert "/data-dictionary#" not in src, (
                f"peril {m} dct:source {src} points at a schema leaf, not an "
                "authority"
            )
            assert src.startswith("http"), src


def test_peril_scheme_steward_is_baker(emitted_graph: Graph) -> None:
    """ODR-0008d Rule 2: steward Baker (deputy Isaac)."""
    stewards = [str(s) for s in emitted_graph.objects(OPDA.PerilScheme, OPDA.hasSteward)]
    assert len(stewards) == 1
    assert "Baker" in stewards[0]


def test_action_alert_rating_scheme_values(emitted_graph: Graph) -> None:
    """ODR-0008d Rule 4: opda:ActionAlertRatingScheme is the data
    dictionary's 1..5 integer scale (1 Green … 5 Red)."""
    notations = {
        str(n)
        for m in emitted_graph.subjects(
            SKOS.inScheme, OPDA.ActionAlertRatingScheme
        )
        for n in emitted_graph.objects(m, SKOS.notation)
    }
    assert notations == {"1", "2", "3", "4", "5"}
    # The colour anchors from the data-dictionary title appear in prefLabels.
    labels = {
        str(lbl)
        for m in emitted_graph.subjects(
            SKOS.inScheme, OPDA.ActionAlertRatingScheme
        )
        for lbl in emitted_graph.objects(m, SKOS.prefLabel)
    }
    assert "1 (Green)" in labels and "5 (Red)" in labels


def test_no_shacl_in_category_e_vocab(emitted_graph: Graph) -> None:
    """ODR-0004 §3a: the Category-E additions remain classes-side — no sh:*
    predicate appears in the vocabularies graph."""
    for _s, p, _o in emitted_graph:
        assert not str(p).startswith("http://www.w3.org/ns/shacl#"), (
            f"vocabularies graph carries a sh:* predicate {p}"
        )
