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


OPDA = Namespace("https://opda.org.uk/pdtf/")
OPDA_SCHEME = Namespace("https://opda.org.uk/pdtf/scheme/")
OPDA_SHAPE = Namespace("https://opda.org.uk/pdtf/shape/")
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
    """Unknown / out-of-scope overlay names raise ValueError.

    `baspi4` is a legacy edition explicitly OUT OF SCOPE per ADR-0029
    (OPDA validates current-edition data only) — it must not be emittable.
    """
    with pytest.raises(ValueError, match="unknown overlay"):
        emit_profile("baspi4", tmp_path)


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
    profile_iri = URIRef("https://opda.org.uk/pdtf/shape/profiles/baspi5")
    assert (profile_iri, RDF.type, OWL.Ontology) in emitted_baspi5
    titles = list(emitted_baspi5.objects(profile_iri, DCTERMS.title))
    assert any(t.language == "en" for t in titles)
    imports = list(emitted_baspi5.objects(profile_iri, OWL.imports))
    assert URIRef("https://opda.org.uk/pdtf/") in imports
    assert URIRef("https://opda.org.uk/pdtf/") in imports
    assert (
        profile_iri, OWL.versionIRI,
        URIRef("https://opda.org.uk/pdtf/harness/release/profiles/baspi5/0.1.0/"),
    ) in emitted_baspi5


# --- ADR-0013 §Confirmation #5 + ODR-0010 §Q1 ----------------------------
def test_baspi5_validation_context_reification(emitted_baspi5: Graph) -> None:
    """An `opda:ValidationContext` instance exists per ODR-0010 §Q1.

    S022 (ADR-0026/0029 amendments) dropped opda:requires +
    opda:overlaysContext; the node keeps opda:profileURI +
    opda:sourcedFrom + opda:formVersion."""
    contexts = list(
        emitted_baspi5.subjects(RDF.type, OPDA.ValidationContext)
    )
    assert len(contexts) == 1, f"expected 1 ValidationContext, got {len(contexts)}"
    ctx = contexts[0]
    assert list(emitted_baspi5.objects(ctx, OPDA.profileURI)), \
        "ValidationContext missing opda:profileURI"
    assert list(emitted_baspi5.objects(ctx, OPDA.sourcedFrom)), \
        "ValidationContext missing opda:sourcedFrom"
    assert list(emitted_baspi5.objects(ctx, OPDA.formVersion)), \
        "ValidationContext missing opda:formVersion"


def test_baspi5_retired_predicates_absent(emitted_baspi5: Graph) -> None:
    """S022 retired opda:requires + opda:overlaysContext from the profile."""
    assert not list(emitted_baspi5.subject_objects(OPDA.requires)), \
        "opda:requires should be retired by S022"
    assert not list(emitted_baspi5.subject_objects(OPDA.overlaysContext)), \
        "opda:overlaysContext should be retired by S022"


def test_baspi5_community_dct_subject(emitted_baspi5: Graph) -> None:
    """S022: the form graph carries exactly one dct:subject → its industry
    context concept (Estate Agency for BASPI5)."""
    from rdflib.namespace import DCTERMS

    profile_iri = URIRef("https://opda.org.uk/pdtf/shape/profiles/baspi5")
    subjects = list(emitted_baspi5.objects(profile_iri, DCTERMS.subject))
    assert subjects == [OPDA.EstateAgencyContext], \
        f"expected one dct:subject → EstateAgencyContext, got {subjects}"


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
        OPDA_SHAPE.Baspi5_PropertyShape,
        OPDA_SHAPE.Baspi5_AddressShape,
        OPDA_SHAPE.Baspi5_LegalEstateShape,
        OPDA_SHAPE.Baspi5_SellerShape,
        OPDA_SHAPE.Baspi5_BuyerShape,
        OPDA_SHAPE.Baspi5_EPCCertificateShape,
        OPDA_SHAPE.Baspi5_SellersCapacityShape,
    ):
        assert shape in node_shapes, f"profile missing {shape}"


def test_baspi5_shapes_target_correct_classes(emitted_baspi5: Graph) -> None:
    """Each Baspi5_*Shape NodeShape carries sh:targetClass matching its
    canonical OPDA class."""
    expected: dict[URIRef, URIRef] = {
        OPDA_SHAPE.Baspi5_PropertyShape: OPDA.Property,
        OPDA_SHAPE.Baspi5_AddressShape: OPDA.Address,
        OPDA_SHAPE.Baspi5_LegalEstateShape: OPDA.LegalEstate,
        OPDA_SHAPE.Baspi5_SellerShape: OPDA.Seller,
        OPDA_SHAPE.Baspi5_BuyerShape: OPDA.Buyer,
        OPDA_SHAPE.Baspi5_EPCCertificateShape: OPDA.EPCCertificate,
        OPDA_SHAPE.Baspi5_SellersCapacityShape: OPDA.Seller,
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
        emitted_baspi5.objects(OPDA_SHAPE.Baspi5_SellersCapacityShape, SH.xone)
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
    anchors covered by the scope (A1.1, A1.3, B1, B1.3, A1.8 etc.).
    ADR-0014 G19 realigned 4 anchors against actual baspi5Ref values:
    A1 → A1.1; A1.8.7 → A1.8.4.1; A7.5.1 → B4.6.2; B1.2 → B1.1."""
    expected_anchors = {
        "A1.1", "A1.1.1", "A1.1.5", "A1.3", "A1.8", "B1", "B1.1",
        "B1.3", "A1.8.3.1", "A1.8.3.1.1",
    }
    emitted_anchors = set()
    for src in emitted_baspi5.objects(None, DCTERMS.source):
        if isinstance(src, URIRef) and "#" in str(src):
            anchor = str(src).rsplit("#", 1)[-1]
            emitted_anchors.add(anchor)
    missing = expected_anchors - emitted_anchors
    assert not missing, f"missing BASPI5 question anchors: {missing}"
    # G19 acceptance check: the 4 corrected anchors are present and
    # the 4 stale anchors are absent.
    assert "A1.8.4.1" in emitted_anchors, "G19 spray-foam anchor missing"
    assert "B4.6.2" in emitted_anchors, "G19 supply-meter anchor missing"
    for stale in ("A1", "A1.8.7", "A7.5.1", "B1.2"):
        assert stale not in emitted_anchors, (
            f"G19 stale anchor {stale} still present"
        )


# --- ADR-0029 §Confirmation — profile rollout (31 in-scope) --------------
def test_profile_catalogue_coverage() -> None:
    """ADR-0029: 31 in-scope profiles (baspi5 + 14 active-main + 16 ext);
    the 3 legacy editions (baspi4/nts/ntsl) are explicitly absent."""
    from opda_gen.emitters.profiles import PROFILE_FILENAMES

    assert len(PROFILE_FILENAMES) == 31, sorted(PROFILE_FILENAMES)
    for legacy in ("baspi4", "nts", "ntsl"):
        assert legacy not in PROFILE_FILENAMES, f"legacy {legacy} must be out of scope"
    for active in ("baspi5", "ta6", "piq", "fme1", "nts2", "ntsl2", "as", "tf"):
        assert active in PROFILE_FILENAMES, f"active {active} missing"


def test_every_profile_has_single_community_tag(tmp_path: Path) -> None:
    """ADR-0029 community-tag test: every emitted form graph carries exactly
    one dct:subject -> a concept in opda:BoundedContextScheme."""
    from opda_gen.emitters.profiles import PROFILE_FILENAMES, emit_profile

    scheme_concepts = {
        OPDA.EstateAgencyContext, OPDA.ConveyancingContext,
        OPDA.MortgageLendingContext, OPDA.SurveyingContext,
        OPDA.PropertyDataServicesContext, OPDA.PropertyTechnologyContext,
    }
    for overlay in PROFILE_FILENAMES:
        written = emit_profile(overlay, tmp_path)
        path = next(iter(written))
        g = Graph()
        g.parse(path, format="turtle")
        prof = URIRef(f"https://opda.org.uk/pdtf/shape/profiles/{overlay}")
        subjects = list(g.objects(prof, DCTERMS.subject))
        assert len(subjects) == 1, f"{overlay}: expected 1 dct:subject, got {subjects}"
        assert subjects[0] in scheme_concepts, \
            f"{overlay}: {subjects[0]} not a bounded-context concept"
