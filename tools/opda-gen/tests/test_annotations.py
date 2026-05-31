"""
Tests for ADR-0012 DPV annotation emission.

Realises:
- ADR-0012 §Confirmation #1 — `opda-gen emit-annotations` produces six
  `*-annotations.ttl` files (one per module).
- ADR-0012 §Confirmation #2 — byte-identity per file.
- ADR-0012 §Confirmation #3 — three-graph isolation verified: no
  sh:* triples in any annotations file; no owl:Class triples; no DPV
  owl:imports.
- ADR-0012 §Confirmation #7 — DPV co-annotations validate against
  ODR-0018 §Rule 3a CI test (DPV triples in annotation graph, NOT in
  classes / shapes).
- ODR-0018 §Rule 1 — class-level baseline DPV co-annotations for every
  PII-bearing Kind.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

import pytest
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS


OPDA = Namespace("https://w3id.org/opda/#")
DPV = Namespace("https://w3id.org/dpv#")
DPV_PD = Namespace("https://w3id.org/dpv/pd#")
SH = Namespace("http://www.w3.org/ns/shacl#")
GUFO = Namespace("http://purl.org/nemo/gufo#")
_ODR_0008_Q5A = URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q5a")


MODULE_NAMES = (
    "property",
    "agent",
    "transaction",
    "claim",
    "governance",
    "descriptive",
)


@pytest.fixture(scope="module")
def emitted_annotations(
    tmp_path_factory: pytest.TempPathFactory,
) -> dict[str, Path]:
    """Emit foundation + all six module annotations into a single tmp dir."""
    tmp = tmp_path_factory.mktemp("annotations-ttls")
    from opda_gen.emitters.annotations import emit_annotations
    from opda_gen.emitters.foundation import emit_foundation

    emit_foundation(tmp)
    emit_annotations(tmp)
    out = {"foundation": tmp / "opda-annotations.ttl"}
    for name in MODULE_NAMES:
        out[name] = tmp / f"opda-{name}-annotations.ttl"
    return out


# ---------------------------------------------------------------------------
# §Confirmation #1 — all six module annotation files emit
# ---------------------------------------------------------------------------
def test_all_six_module_annotation_files_emit(
    emitted_annotations: dict[str, Path]
) -> None:
    for name in MODULE_NAMES:
        path = emitted_annotations[name]
        assert path.exists(), (
            f"annotations module {name} did not emit at {path}"
        )
        g = Graph()
        g.parse(str(path), format="turtle")
        assert len(g) > 0, f"annotations module {name} parsed empty"


def test_foundation_annotations_remains_header_only(
    emitted_annotations: dict[str, Path]
) -> None:
    """Per ADR-0012: foundation classes (DiagnosticExemplar, GeneratorRun,
    RoleMixin, Role, Relator) are NOT PII-bearing, so the foundation
    opda-annotations.ttl carries no DPV co-annotation predicate triples."""
    g = Graph()
    g.parse(str(emitted_annotations["foundation"]), format="turtle")
    # No DPV predicates at all.
    for s, p, o in g:
        assert not str(p).startswith("https://w3id.org/dpv"), (
            f"foundation annotations carries unexpected DPV predicate {p}"
        )


# ---------------------------------------------------------------------------
# §Confirmation #2 — byte-identity per file
# ---------------------------------------------------------------------------
def test_annotation_files_byte_identical_across_runs() -> None:
    from opda_gen.emitters.annotations import emit_annotations

    with tempfile.TemporaryDirectory() as a_dir, tempfile.TemporaryDirectory() as b_dir:
        a = Path(a_dir)
        b = Path(b_dir)
        emit_annotations(a)
        emit_annotations(b)
        a_files = sorted(p.name for p in a.iterdir())
        b_files = sorted(p.name for p in b.iterdir())
        assert a_files == b_files
        for name in a_files:
            assert (a / name).read_bytes() == (b / name).read_bytes(), (
                f"byte mismatch on second run: {name}"
            )


# ---------------------------------------------------------------------------
# §Confirmation #3 — three-graph isolation
# ---------------------------------------------------------------------------
def test_no_shacl_in_annotations(
    emitted_annotations: dict[str, Path]
) -> None:
    """Per ODR-0004 §3a CI test 1: no sh:* triples in any annotation file."""
    for name, path in emitted_annotations.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        for s, p, o in g:
            assert not str(p).startswith("http://www.w3.org/ns/shacl#"), (
                f"annotations file {name} contains sh:* predicate {p}"
            )


def test_no_owl_class_triples_in_annotations(
    emitted_annotations: dict[str, Path]
) -> None:
    for name, path in emitted_annotations.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        class_subjects = list(g.subjects(RDF.type, OWL.Class))
        assert not class_subjects, (
            f"annotations file {name} contains owl:Class subjects: "
            f"{class_subjects}"
        )


def test_no_dpv_owl_imports_in_annotations(
    emitted_annotations: dict[str, Path]
) -> None:
    """Reference-not-import for DPV per ODR-0018 §Rule 3 + Kendall S012."""
    for name, path in emitted_annotations.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        for _, _, o in g.triples((None, OWL.imports, None)):
            assert not str(o).startswith("https://w3id.org/dpv"), (
                f"annotations file {name} imports DPV via owl:imports {o}"
            )


# ---------------------------------------------------------------------------
# DPV co-annotation coverage — every expected baseline emits
# ---------------------------------------------------------------------------
def test_property_baseline_dpv_coannotation(
    emitted_annotations: dict[str, Path]
) -> None:
    g = Graph()
    g.parse(str(emitted_annotations["property"]), format="turtle")
    has_pd = URIRef("https://w3id.org/dpv/pd#hasPersonalDataCategory")
    # opda:Property → dpv-pd:PostalAddress baseline.
    expected = (OPDA.Property, has_pd,
                URIRef("https://w3id.org/dpv/pd#PostalAddress"))
    assert expected in g, (
        f"missing Property baseline DPV co-annotation: {expected}"
    )
    # opda:RegisteredTitle → dpv-pd:PublicData (S005 §3c).
    expected2 = (OPDA.RegisteredTitle, has_pd,
                 URIRef("https://w3id.org/dpv/pd#PublicData"))
    assert expected2 in g, (
        f"missing RegisteredTitle baseline DPV co-annotation: {expected2}"
    )


def test_address_variant_refinements_present(
    emitted_annotations: dict[str, Path]
) -> None:
    """Per ODR-0015 §7a + ODR-0018 §3a: three Address variant refinements."""
    g = Graph()
    g.parse(str(emitted_annotations["property"]), format="turtle")
    expected_refinements = (
        OPDA.AddressVariantTitleRefinement,
        OPDA.AddressVariantMarketingRefinement,
        OPDA.AddressVariantInspireRefinement,
    )
    for ref in expected_refinements:
        assert (ref, RDF.type, OPDA.DPVMappingRefinement) in g, (
            f"missing Address variant refinement: {ref}"
        )


def test_person_baseline_dpv_coannotation(
    emitted_annotations: dict[str, Path]
) -> None:
    g = Graph()
    g.parse(str(emitted_annotations["agent"]), format="turtle")
    has_pd = URIRef("https://w3id.org/dpv/pd#hasPersonalDataCategory")
    expected = (OPDA.Person, has_pd,
                URIRef("https://w3id.org/dpv/pd#Name"))
    assert expected in g, (
        f"missing Person baseline DPV co-annotation: {expected}"
    )


def test_organisation_documented_as_not_pii(
    emitted_annotations: dict[str, Path]
) -> None:
    """opda:Organisation has rdfs:comment documenting why no DPV
    baseline applies (sole-trader/individual-director surface yields
    Person co-annotation, not Organisation)."""
    g = Graph()
    g.parse(str(emitted_annotations["agent"]), format="turtle")
    comments = list(g.objects(OPDA.Organisation, RDFS.comment))
    assert comments, (
        "opda:Organisation should have rdfs:comment documenting "
        "the absence of a DPV class-level baseline"
    )
    # The comment text should reference Q6.
    assert any("Q6" in str(c) for c in comments)


def test_claim_baseline_dpv_coannotation(
    emitted_annotations: dict[str, Path]
) -> None:
    g = Graph()
    g.parse(str(emitted_annotations["claim"]), format="turtle")
    has_pd = URIRef("https://w3id.org/dpv/pd#hasPersonalDataCategory")
    expected = (OPDA.Claim, has_pd,
                URIRef("https://w3id.org/dpv/pd#OfficialID"))
    assert expected in g, (
        f"missing Claim baseline DPV co-annotation: {expected}"
    )


def test_evidence_subclass_refinements_present(
    emitted_annotations: dict[str, Path]
) -> None:
    g = Graph()
    g.parse(str(emitted_annotations["claim"]), format="turtle")
    expected_refinements = (
        OPDA.DocumentEvidenceRefinement,
        OPDA.ElectronicRecordEvidenceRefinement,
        OPDA.VouchEvidenceRefinement,
    )
    for ref in expected_refinements:
        assert (ref, RDF.type, OPDA.DPVMappingRefinement) in g, (
            f"missing Evidence variant refinement: {ref}"
        )


def test_transaction_annotations_header_only(
    emitted_annotations: dict[str, Path]
) -> None:
    """Transactions are Relators (events), not PII bearers."""
    g = Graph()
    g.parse(str(emitted_annotations["transaction"]), format="turtle")
    has_pd = URIRef("https://w3id.org/dpv/pd#hasPersonalDataCategory")
    # No baseline triples — only documentation triples on the module IRI.
    for s, p, o in g.triples((None, has_pd, None)):
        raise AssertionError(
            f"transaction annotations should be header-only; found "
            f"unexpected DPV baseline {s} {p} {o}"
        )


def test_governance_annotations_header_only(
    emitted_annotations: dict[str, Path]
) -> None:
    """Governance classes are meta-records, not PII bearers."""
    g = Graph()
    g.parse(str(emitted_annotations["governance"]), format="turtle")
    has_pd = URIRef("https://w3id.org/dpv/pd#hasPersonalDataCategory")
    for s, p, o in g.triples((None, has_pd, None)):
        raise AssertionError(
            f"governance annotations should be header-only; found "
            f"unexpected DPV baseline {s} {p} {o}"
        )


def test_descriptive_epc_baseline(
    emitted_annotations: dict[str, Path]
) -> None:
    g = Graph()
    g.parse(str(emitted_annotations["descriptive"]), format="turtle")
    has_pd = URIRef("https://w3id.org/dpv/pd#hasPersonalDataCategory")
    expected = (OPDA.EPCCertificate, has_pd,
                URIRef("https://w3id.org/dpv/pd#PostalAddress"))
    assert expected in g, (
        f"missing EPCCertificate baseline DPV co-annotation: {expected}"
    )


def test_descriptive_gufo_quality_typing(
    emitted_annotations: dict[str, Path]
) -> None:
    """ADR-0034 / session-029 Q5 (6–0–0): the uncontested Quale-in-Region
    Property descriptive leaves carry rdf:type gufo:Quality + dct:source
    ODR-0008 §Q5a in the descriptive annotation graph; the adjudicated-
    pending straddlers/re-sorter and the Substance-Kind label do NOT, and no
    gufo:Mode is asserted (the Mode leaves are the omitted straddlers)."""
    g = Graph()
    g.parse(str(emitted_annotations["descriptive"]), format="turtle")

    for leaf in ("currentEnergyRating", "councilTaxBand", "builtForm",
                 "centralHeatingFuelType", "heatingType"):
        subj = OPDA[leaf]
        assert (subj, RDF.type, GUFO.Quality) in g, (
            f"missing gufo:Quality typing on opda:{leaf}"
        )
        assert (subj, DCTERMS.source, _ODR_0008_Q5A) in g, (
            f"missing dct:source ODR-0008 §Q5a on opda:{leaf}"
        )

    # Omitted by design (session-029): straddlers + re-sorter + Kind-label.
    for leaf in ("ownershipType", "priceQualifier", "marketingTenure",
                 "tenureKind"):
        assert (OPDA[leaf], RDF.type, GUFO.Quality) not in g, (
            f"opda:{leaf} must NOT be gufo-typed (adjudicated-pending / "
            f"out-of-category)"
        )

    # No uncontested Mode leaf exists, so no gufo:Mode is asserted.
    assert not list(g.subjects(RDF.type, GUFO.Mode)), (
        "no gufo:Mode typing expected (the Mode leaves are omitted straddlers)"
    )


# ---------------------------------------------------------------------------
# §Confirmation #7 — DPV co-annotations NOT in classes graph
# ---------------------------------------------------------------------------
def test_dpv_coannotations_not_in_classes_graph(
    emitted_annotations: dict[str, Path],
    tmp_path: Path,
) -> None:
    """Per ODR-0018 §3a CI test 3: DPV triples MUST NOT appear in any
    classes file. Emit the full module class graph + verify."""
    from opda_gen.emitters.classes import emit_all_modules
    from opda_gen.emitters.foundation import emit_foundation

    emit_foundation(tmp_path)
    emit_all_modules(tmp_path)

    for path in sorted(tmp_path.glob("opda-*.ttl")):
        # Skip the shapes / annotations files for this check.
        if "-shapes" in path.name or "-annotations" in path.name:
            continue
        g = Graph()
        g.parse(str(path), format="turtle")
        for s, p, o in g:
            assert not str(p).startswith("https://w3id.org/dpv"), (
                f"class file {path.name} contains DPV predicate {p}"
            )


# ---------------------------------------------------------------------------
# CLI smoke test — emit-annotations with --module restricts to one file
# ---------------------------------------------------------------------------
def test_emit_annotations_single_module() -> None:
    from opda_gen.emitters.annotations import emit_annotations

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        written = emit_annotations(out, module="agent")
        assert len(written) == 1
        only = next(iter(written))
        assert only.name == "opda-agent-annotations.ttl"


def test_emit_annotations_invalid_module_raises() -> None:
    from opda_gen.emitters.annotations import emit_annotations

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        with pytest.raises(ValueError, match="unknown annotations module"):
            emit_annotations(out, module="nonexistent")


# ---------------------------------------------------------------------------
# Provenance — every annotation carries dct:source somewhere
# ---------------------------------------------------------------------------
def test_every_dpv_baseline_kind_has_dct_source(
    emitted_annotations: dict[str, Path]
) -> None:
    """Each PII-bearing Kind that emits a DPV baseline MUST also emit
    dct:source citing the ratifying ODR section."""
    has_pd = URIRef("https://w3id.org/dpv/pd#hasPersonalDataCategory")
    for name, path in emitted_annotations.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        for kind in {s for s, _, _ in g.triples((None, has_pd, None))}:
            sources = list(g.objects(kind, DCTERMS.source))
            assert sources, (
                f"Kind {kind} in {name} carries DPV baseline but no "
                f"dct:source citation"
            )


# ---------------------------------------------------------------------------
# D2 (ADR-0005 §G) — opda:lawfulBasis objects are ALWAYS core dpv: lawful
# bases, never dpv-pd: PII categories; the email/DOB predicate categories
# attach via dpv-pd:hasPersonalDataCategory, not opda:lawfulBasis.
# ---------------------------------------------------------------------------
_HAS_PD = URIRef("https://w3id.org/dpv/pd#hasPersonalDataCategory")


def test_no_lawful_basis_object_is_a_pd_category(
    emitted_annotations: dict[str, Path]
) -> None:
    """ADR-0005 §G D2: every opda:lawfulBasis object across the corpus
    MUST be a CORE DPV term (https://w3id.org/dpv#…) — a lawful basis —
    and NONE may be in the dpv-pd: namespace (a PII category). The prior
    agent-module bug mis-slotted dpv-pd:EmailAddress / dpv-pd:DateOfBirth
    into opda:lawfulBasis."""
    for name, path in emitted_annotations.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        for _, _, obj in g.triples((None, OPDA.lawfulBasis, None)):
            assert str(obj).startswith("https://w3id.org/dpv#"), (
                f"opda:lawfulBasis object {obj} in {name} is not a core "
                "dpv: lawful basis (ADR-0005 §G D2)"
            )
            assert not str(obj).startswith("https://w3id.org/dpv/pd#"), (
                f"opda:lawfulBasis object {obj} in {name} is a dpv-pd: PII "
                "category, not a lawful basis (ADR-0005 §G D2)"
            )


def test_person_email_dob_categories_are_property_or_class_level(
    emitted_annotations: dict[str, Path]
) -> None:
    """ADR-0005 §G D2: the EmailAddress + DateOfBirth PII categories are
    carried via dpv-pd:hasPersonalDataCategory (the correct ODR-0018
    §Rule 4 co-annotation), NOT via opda:lawfulBasis.

    Reality check (see report): opda:dateOfBirth IS declared on
    opda:Person, so DateOfBirth attaches at the property level
    (opda:dateOfBirth). No email predicate is declared on opda:Person, so
    per the ADR-0005 §G D2 fallback the EmailAddress category is carried
    class-level on opda:Person."""
    g = Graph()
    g.parse(str(emitted_annotations["agent"]), format="turtle")
    dob = URIRef("https://w3id.org/dpv/pd#DateOfBirth")
    email = URIRef("https://w3id.org/dpv/pd#EmailAddress")
    # DateOfBirth — property-level on opda:dateOfBirth.
    assert (OPDA.dateOfBirth, _HAS_PD, dob) in g, (
        "opda:dateOfBirth must carry dpv-pd:hasPersonalDataCategory "
        "dpv-pd:DateOfBirth (ADR-0005 §G D2 property-level co-annotation)"
    )
    # EmailAddress — class-level on opda:Person (no email predicate exists).
    assert (OPDA.Person, _HAS_PD, email) in g, (
        "opda:Person must carry dpv-pd:hasPersonalDataCategory "
        "dpv-pd:EmailAddress class-level (ADR-0005 §G D2 fallback — no "
        "email predicate is declared on Person)"
    )
    # The buggy DPVMappingRefinement records must be gone.
    assert (OPDA.PersonEmailRefinement, RDF.type, OPDA.DPVMappingRefinement) \
        not in g, "PersonEmailRefinement (mis-slotted lawful basis) must be removed"
    assert (
        OPDA.PersonDateOfBirthRefinement, RDF.type, OPDA.DPVMappingRefinement
    ) not in g, (
        "PersonDateOfBirthRefinement (mis-slotted lawful basis) must be removed"
    )


# ---------------------------------------------------------------------------
# D3 (ADR-0005 §G) — opda:isPIIBearing declared at foundation + asserted
# true on exactly the class-level-baseline PII Kinds; the PIIWithout-
# DPVCoAnnotationRule floor is therefore active (non-empty target set).
# ---------------------------------------------------------------------------
def test_is_pii_bearing_declared_at_foundation(tmp_path: Path) -> None:
    """ADR-0005 §G D3(a): opda:isPIIBearing is declared as an
    owl:DatatypeProperty (range xsd:boolean) in opda-classes.ttl."""
    from opda_gen.emitters.foundation import emit_foundation

    emit_foundation(tmp_path)
    g = Graph()
    g.parse(str(tmp_path / "opda-classes.ttl"), format="turtle")
    assert (OPDA.isPIIBearing, RDF.type, OWL.DatatypeProperty) in g, (
        "opda:isPIIBearing must be declared as owl:DatatypeProperty "
        "(ADR-0005 §G D3a)"
    )
    assert (
        OPDA.isPIIBearing,
        RDFS.range,
        URIRef("http://www.w3.org/2001/XMLSchema#boolean"),
    ) in g, "opda:isPIIBearing must have rdfs:range xsd:boolean"


def test_is_pii_bearing_asserted_true_on_baseline_kinds(
    emitted_annotations: dict[str, Path]
) -> None:
    """ADR-0005 §G D3(b): opda:isPIIBearing true is asserted on exactly
    the six class-level-baseline PII Kinds (Person, Property, Address,
    RegisteredTitle, Claim, EPCCertificate); Organisation stays unmarked."""
    g = Graph()
    for path in emitted_annotations.values():
        g.parse(str(path), format="turtle")
    true_lit = Literal(True)
    marked = {
        str(s) for s in g.subjects(OPDA.isPIIBearing, true_lit)
    }
    expected = {
        str(OPDA.Person),
        str(OPDA.Property),
        str(OPDA.Address),
        str(OPDA.RegisteredTitle),
        str(OPDA.Claim),
        str(OPDA.EPCCertificate),
    }
    assert marked == expected, (
        f"opda:isPIIBearing true must be on exactly {sorted(expected)}; "
        f"got {sorted(marked)}"
    )
    # Organisation must NOT be marked (ODR-0006 §Q6 — not a data subject).
    assert (OPDA.Organisation, OPDA.isPIIBearing, true_lit) not in g, (
        "opda:Organisation must NOT carry opda:isPIIBearing true "
        "(ODR-0006 §Q6: not a data subject)"
    )
    # Serialises as a real xsd:boolean literal.
    assert true_lit.datatype == URIRef(
        "http://www.w3.org/2001/XMLSchema#boolean"
    )


def test_pii_floor_active_count_matches_baseline_count(
    emitted_annotations: dict[str, Path]
) -> None:
    """ADR-0005 §G D3 regression guard: the count of classes asserted
    opda:isPIIBearing true equals the count of classes carrying a
    class-level dpv-pd:hasPersonalDataCategory baseline. Because
    PIIWithoutDPVCoAnnotationRule targets opda:isPIIBearing true classes
    lacking that baseline, this equality (and non-zero count) is exactly
    the condition that the Phase-1 PII floor is active — the rule's target
    set is non-empty and every target is in lockstep with a co-annotation."""
    g = Graph()
    for path in emitted_annotations.values():
        g.parse(str(path), format="turtle")
    pii_classes = set(g.subjects(OPDA.isPIIBearing, Literal(True)))
    # Class-level baseline subjects: opda: Kinds (TitleCase) carrying the
    # class-level dpv-pd:hasPersonalDataCategory (exclude property-level
    # co-annotations like opda:dateOfBirth, which are lowercase predicates).
    baseline_classes = {
        s
        for s in g.subjects(_HAS_PD, None)
        if str(s).startswith("https://w3id.org/opda/#")
        and str(s).split("#", 1)[1][:1].isupper()
    }
    assert len(pii_classes) > 0, (
        "the PII floor is a no-op — no class is marked opda:isPIIBearing "
        "true (ADR-0005 §G D3)"
    )
    assert pii_classes == baseline_classes, (
        "opda:isPIIBearing-true classes must equal the class-level DPV "
        f"baseline Kinds; isPIIBearing={sorted(str(s) for s in pii_classes)} "
        f"baseline={sorted(str(s) for s in baseline_classes)}"
    )
