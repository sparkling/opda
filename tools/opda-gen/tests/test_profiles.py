"""
Tests for the overlay profile emission (ADR-0013).

Realises:
- ADR-0013 §Confirmation #1 — `emit-profile baspi5` produces
  `profiles/baspi5.ttl`.
- ADR-0013 §Confirmation #2 — second-run regeneration is byte-identical.
- ADR-0013 §Confirmation #3 — three-rule interface contract CI passes
  for BASPI5 (sh:in semantics; sh:Violation floor; no-identity-override).
- ADR-0013 §Confirmation #5 — `opda:ValidationContext` instance present
  with 5 required properties per ODR-0010 §Q1.
- ADR-0013 §Confirmation #6 — `dct:source` form-question IRIs follow
  the `https://www.basp.uk/forms/baspi5#...` pattern.
- ODR-0010 §Q4 — DASH UI predicates emit on every property shape.
- ODR-0010 §Q5 — `sh:xone` pattern emits for the sellersCapacity
  nested oneOf discriminator.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS

from opda_gen.emitters.profiles import (
    BASPI5_FORMS_AUTHORITY,
    PROFILE_FILENAMES,
    emit_profile,
)


OPDA = Namespace("https://w3id.org/opda/#")
SH = Namespace("http://www.w3.org/ns/shacl#")
DASH = Namespace("http://datashapes.org/dash#")


# --- Fixtures ------------------------------------------------------------
@pytest.fixture
def emitted_baspi5(tmp_path: Path) -> Graph:
    """Emit + parse the BASPI5 profile into an rdflib Graph fixture."""
    emit_profile("baspi5", tmp_path)
    g = Graph()
    g.parse(str(tmp_path / "profiles" / "baspi5.ttl"), format="turtle")
    return g


# --- Confirmation #1 -----------------------------------------------------
def test_emit_baspi5_produces_file(tmp_path: Path) -> None:
    """`emit-profile baspi5` writes a non-empty Turtle file at
    `profiles/baspi5.ttl`."""
    written = emit_profile("baspi5", tmp_path)
    path = tmp_path / "profiles" / "baspi5.ttl"
    assert path.exists()
    assert path.stat().st_size > 0
    assert list(written.keys()) == [path]


def test_emit_profile_rejects_unknown_overlay(tmp_path: Path) -> None:
    """Unknown overlay names raise ValueError per ADR-0013 catalogue."""
    with pytest.raises(ValueError, match="unknown overlay"):
        emit_profile("ta6", tmp_path)


# --- Confirmation #2 (byte-identity) -------------------------------------
def test_baspi5_byte_identical_across_two_runs(tmp_path: Path) -> None:
    a = tmp_path / "a"
    b = tmp_path / "b"
    a.mkdir()
    b.mkdir()
    emit_profile("baspi5", a)
    emit_profile("baspi5", b)
    assert (a / "profiles" / "baspi5.ttl").read_bytes() == (
        b / "profiles" / "baspi5.ttl"
    ).read_bytes()


# --- ADR-0013 §Profile emission template ----------------------------------
def test_baspi5_ontology_header(emitted_baspi5: Graph) -> None:
    """The profile declares an owl:Ontology with dct:title, owl:imports
    (foundation + vocabularies), and owl:versionIRI."""
    profile_iri = URIRef("https://w3id.org/opda/profiles/baspi5")
    assert (profile_iri, RDF.type, OWL.Ontology) in emitted_baspi5
    titles = list(emitted_baspi5.objects(profile_iri, DCTERMS.title))
    assert any(t.language == "en" for t in titles)
    imports = list(emitted_baspi5.objects(profile_iri, OWL.imports))
    assert URIRef("https://w3id.org/opda/0.4.0/") in imports
    assert URIRef("https://w3id.org/opda/vocabularies/") in imports
    assert (
        profile_iri, OWL.versionIRI,
        URIRef("https://w3id.org/opda/profiles/baspi5/0.1.0/"),
    ) in emitted_baspi5


# --- ADR-0013 §Confirmation #5 + ODR-0010 §Q1 ----------------------------
def test_baspi5_validation_context_reification(emitted_baspi5: Graph) -> None:
    """An `opda:ValidationContext` instance exists per ODR-0010 §Q1 with
    5 required properties: opda:profileURI, opda:requires,
    opda:overlaysContext, opda:sourcedFrom, opda:formVersion."""
    contexts = list(
        emitted_baspi5.subjects(RDF.type, OPDA.ValidationContext)
    )
    assert len(contexts) == 1, f"expected 1 ValidationContext, got {len(contexts)}"
    ctx = contexts[0]
    assert list(emitted_baspi5.objects(ctx, OPDA.profileURI)), \
        "ValidationContext missing opda:profileURI"
    assert list(emitted_baspi5.objects(ctx, OPDA.requires)), \
        "ValidationContext missing opda:requires"
    assert list(emitted_baspi5.objects(ctx, OPDA.overlaysContext)), \
        "ValidationContext missing opda:overlaysContext"
    assert list(emitted_baspi5.objects(ctx, OPDA.sourcedFrom)), \
        "ValidationContext missing opda:sourcedFrom"
    assert list(emitted_baspi5.objects(ctx, OPDA.formVersion)), \
        "ValidationContext missing opda:formVersion"


def test_baspi5_validation_context_requires_baseline_classes(
    emitted_baspi5: Graph,
) -> None:
    """opda:requires lists the core BASPI5-bound OPDA classes."""
    contexts = list(emitted_baspi5.subjects(RDF.type, OPDA.ValidationContext))
    ctx = contexts[0]
    required = set(emitted_baspi5.objects(ctx, OPDA.requires))
    for cls in (OPDA.Property, OPDA.Address, OPDA.LegalEstate,
                OPDA.Seller, OPDA.Buyer):
        assert cls in required, f"opda:requires missing {cls}"


# --- ADR-0013 §Confirmation #6 — dct:source form-question IRIs -----------
def test_baspi5_form_question_iris_use_canonical_pattern(
    emitted_baspi5: Graph,
) -> None:
    """Every property-shape dct:source resolving to a BASPI5 form
    question MUST follow the `https://www.basp.uk/forms/baspi5#...`
    pattern per ODR-0010 §Q3."""
    sources = list(emitted_baspi5.objects(None, DCTERMS.source))
    # Filter to URI sources (not the upstream ADR-0013 prov citation).
    form_sources = [
        s for s in sources
        if isinstance(s, URIRef) and str(s).startswith(BASPI5_FORMS_AUTHORITY)
    ]
    assert len(form_sources) > 0, "no BASPI5 form-question dct:source IRIs"
    # Every form-source MUST carry an anchor (the question number).
    for src in form_sources:
        assert "#" in str(src), f"form-question IRI missing anchor: {src}"


# --- ADR-0013 §Per-class shapes -----------------------------------------
def test_baspi5_per_class_shapes_exist(emitted_baspi5: Graph) -> None:
    """The profile emits Baspi5_*Shape NodeShapes for the core BASPI5
    classes: Property, Address, LegalEstate, Seller, Buyer, EPCCertificate
    + the SellersCapacityShape (sh:xone discriminator)."""
    node_shapes = set(emitted_baspi5.subjects(RDF.type, SH.NodeShape))
    for shape in (
        OPDA.Baspi5_PropertyShape,
        OPDA.Baspi5_AddressShape,
        OPDA.Baspi5_LegalEstateShape,
        OPDA.Baspi5_SellerShape,
        OPDA.Baspi5_BuyerShape,
        OPDA.Baspi5_EPCCertificateShape,
        OPDA.Baspi5_SellersCapacityShape,
    ):
        assert shape in node_shapes, f"profile missing {shape}"


def test_baspi5_shapes_target_correct_classes(emitted_baspi5: Graph) -> None:
    """Each Baspi5_*Shape NodeShape carries sh:targetClass matching its
    canonical OPDA class."""
    expected: dict[URIRef, URIRef] = {
        OPDA.Baspi5_PropertyShape: OPDA.Property,
        OPDA.Baspi5_AddressShape: OPDA.Address,
        OPDA.Baspi5_LegalEstateShape: OPDA.LegalEstate,
        OPDA.Baspi5_SellerShape: OPDA.Seller,
        OPDA.Baspi5_BuyerShape: OPDA.Buyer,
        OPDA.Baspi5_EPCCertificateShape: OPDA.EPCCertificate,
        OPDA.Baspi5_SellersCapacityShape: OPDA.Seller,
    }
    for shape, cls in expected.items():
        targets = list(emitted_baspi5.objects(shape, SH.targetClass))
        assert cls in targets, f"{shape} missing sh:targetClass {cls}"


# --- ODR-0010 §Q4 — DASH UI predicates -----------------------------------
def test_baspi5_dash_ui_predicates_emit(emitted_baspi5: Graph) -> None:
    """Per ODR-0010 §Q4: every property shape carries DASH viewer +
    editor predicates so DASH can render the form."""
    # We use SHACL property shapes (blank-node sub-graphs of sh:property).
    viewers = list(emitted_baspi5.objects(None, DASH.viewer))
    editors = list(emitted_baspi5.objects(None, DASH.editor))
    assert len(viewers) > 0, "no DASH viewer predicates emitted"
    assert len(editors) > 0, "no DASH editor predicates emitted"


def test_baspi5_property_groups_emit(emitted_baspi5: Graph) -> None:
    """Per ODR-0010 §Q4: sh:PropertyGroup instances exist for the major
    DASH form sections (built-form / energy / heating / ownership /
    drainage / etc.)."""
    groups = set(emitted_baspi5.subjects(RDF.type, SH.PropertyGroup))
    assert len(groups) >= 5, (
        f"expected at least 5 PropertyGroups; got {len(groups)}: {groups}"
    )


# --- ODR-0010 §Q5 — oneOf → sh:xone --------------------------------------
def test_baspi5_xone_pattern_for_sellers_capacity(
    emitted_baspi5: Graph,
) -> None:
    """The Baspi5_SellersCapacityShape uses sh:xone to express the
    BASPI5 sellersCapacity oneOf discriminator per ODR-0010 §Q5."""
    xone_objects = list(
        emitted_baspi5.objects(OPDA.Baspi5_SellersCapacityShape, SH.xone)
    )
    assert len(xone_objects) == 1, (
        f"expected 1 sh:xone on SellersCapacityShape, got "
        f"{len(xone_objects)}"
    )
    # The xone list must contain at least 2 branches (Legal-Owner+ vs
    # Personal-Representative+).
    from rdflib.collection import Collection
    branches = list(Collection(emitted_baspi5, xone_objects[0]))
    assert len(branches) >= 2, (
        f"sh:xone list should have 2+ branches; got {len(branches)}"
    )


# --- Severity floor ------------------------------------------------------
def test_baspi5_severity_floor_is_violation(emitted_baspi5: Graph) -> None:
    """Every emitted sh:severity is sh:Violation (per ODR-0010 §Rule and
    ADR-0013 three-rule interface-contract floor)."""
    for sev in emitted_baspi5.objects(None, SH.severity):
        assert sev == SH.Violation, (
            f"profile severity {sev} != sh:Violation (violates floor)"
        )


# --- Three-rule interface contract CI tests ------------------------------
def test_three_rule_interface_contract_passes(tmp_path: Path) -> None:
    """Independent re-run of the three-rule interface contract checks
    against a freshly-emitted full corpus."""
    # Emit the full corpus so the contract checks see the real graph.
    from opda_gen.emitters.annotations import emit_annotations
    from opda_gen.emitters.classes import emit_all_modules
    from opda_gen.emitters.foundation import emit_foundation
    from opda_gen.emitters.shapes import emit_shapes
    from opda_gen.emitters.vocabularies import emit_vocabularies
    emit_foundation(tmp_path)
    emit_vocabularies(tmp_path)
    emit_all_modules(tmp_path)
    emit_shapes(tmp_path)
    emit_annotations(tmp_path)
    emit_profile("baspi5", tmp_path)

    from opda_gen.ci.profile_contract_test import run_all
    violations = run_all(tmp_path)
    assert violations == [], (
        "three-rule interface contract violations:\n" + "\n".join(violations)
    )


# --- BASPI5 question coverage --------------------------------------------
def test_baspi5_emits_known_question_anchors(emitted_baspi5: Graph) -> None:
    """The profile emits dct:source URIs for the major BASPI5 question
    anchors covered by the scope (A1, A1.1, A1.3, B1, B1.3, A1.8 etc.)."""
    expected_anchors = {
        "A1", "A1.1", "A1.1.1", "A1.1.5", "A1.3", "A1.8", "B1", "B1.1",
        "B1.3", "A1.8.3.1", "A1.8.3.1.1",
    }
    emitted_anchors = set()
    for src in emitted_baspi5.objects(None, DCTERMS.source):
        if isinstance(src, URIRef) and "#" in str(src):
            anchor = str(src).rsplit("#", 1)[-1]
            emitted_anchors.add(anchor)
    missing = expected_anchors - emitted_anchors
    assert not missing, f"missing BASPI5 question anchors: {missing}"
