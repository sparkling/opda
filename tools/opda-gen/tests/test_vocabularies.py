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


def test_emit_vocabularies_produces_16_schemes(emitted_graph: Graph) -> None:
    """Per ADR-0010 §"Scheme catalogue (initial first batch)" — exactly the
    16 named first-batch schemes appear (15 ADR rows + the Scottish
    CouncilTaxBand variant called out separately in the body of the row)."""
    schemes = list(emitted_graph.subjects(RDF.type, SKOS.ConceptScheme))
    assert len(schemes) == 16, (
        f"expected 16 schemes (ADR-0010 first batch), got {len(schemes)}: "
        f"{sorted(str(s) for s in schemes)}"
    )
    # Spot-check each of the 16 named schemes appears.
    named = {
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
    }
    emitted_names = {str(s).rsplit("#", 1)[-1] for s in schemes}
    assert emitted_names == named, f"diff: {named ^ emitted_names}"


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
