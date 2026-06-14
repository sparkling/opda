"""
Tests for ADR-0012 SHACL shape emission.

Realises:
- ADR-0012 §Confirmation #1 — `opda-gen emit-shapes` produces six
  `*-shapes.ttl` files (one per module).
- ADR-0012 §Confirmation #2 — byte-identity per file (second-run
  regeneration produces zero diff).
- ADR-0012 §Confirmation #3 — three-graph isolation verified: no
  owl:Class triples in any shapes file; no DPV co-annotations in any
  shapes file; no DPV owl:imports anywhere.
- ADR-0012 §Confirmation #4 — every shape carries explicit `sh:severity`.
- ADR-0012 §Confirmation #5 — five `sh:Violation` categories emit
  (Cat 1 identity-key; Cat 2 IC breach; Cat 3 NoIdentityOverride; Cat
  4 special-category PII; Cat 5 meta-shape-over-shape-graph).
- ADR-0012 §Confirmation #6 — three-rule interface contract emitted as
  meta-shapes in foundation `opda-shapes.ttl`.
- ADR-0012 §"SHACL-AF rule emission" — 11 citing sites emit by URI.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

import pytest
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import OWL, RDF, RDFS


OPDA = Namespace("https://opda.org.uk/pdtf/")
OPDA_SCHEME = Namespace("https://opda.org.uk/pdtf/scheme/")
OPDA_SHAPE = Namespace("https://opda.org.uk/pdtf/shape/")
SH = Namespace("http://www.w3.org/ns/shacl#")
DPV_PD = Namespace("https://w3id.org/dpv/pd#")


MODULE_NAMES = (
    "property",
    "agent",
    "transaction",
    "claim",
    "governance",
    "descriptive",
)

# The 11 SHACL-AF citing sites per ADR-0012 §"SHACL-AF rule emission".
SHACL_AF_CITING_SITES = (
    ("UPRNSuccessionRule", "property"),
    ("DeprecationChainRule", "foundation"),
    ("INSPIRESuccessionRule", "property"),
    ("PROVOClaimsRule", "claim"),
    ("IdentifierSuccessionRule", "agent"),
    ("CapacityAuthorityMatchRule", "agent"),
    ("LeaseTermSuccessionRule", "transaction"),
    ("MilestoneVarianceRule", "transaction"),
    ("VerificationActivitySuccessionRule", "claim"),
    ("PIIWithoutDPVCoAnnotationRule", "foundation"),
    ("NoIdentityOverride_MetaShape", "foundation"),
)


@pytest.fixture(scope="module")
def emitted_shapes(
    tmp_path_factory: pytest.TempPathFactory,
) -> dict[str, Path]:
    """Emit foundation + all six module shapes into a single tmp dir.
    Returns {module-name: file-path} for the six per-module files;
    foundation is at the key "foundation"."""
    tmp = tmp_path_factory.mktemp("shapes-ttls")
    from opda_gen.emitters.foundation import emit_foundation
    from opda_gen.emitters.shapes import emit_shapes

    emit_foundation(tmp)
    emit_shapes(tmp)
    out = {"foundation": tmp / "opda-shapes.ttl"}
    for name in MODULE_NAMES:
        out[name] = tmp / f"opda-{name}-shapes.ttl"
    return out


# ---------------------------------------------------------------------------
# §Confirmation #1 — all six modules emit shape files
# ---------------------------------------------------------------------------
def test_all_six_module_shape_files_emit(
    emitted_shapes: dict[str, Path]
) -> None:
    for name in MODULE_NAMES:
        path = emitted_shapes[name]
        assert path.exists(), f"shapes module {name} did not emit at {path}"
        g = Graph()
        g.parse(str(path), format="turtle")
        assert len(g) > 0, f"shapes module {name} parsed empty"
        # Each per-module file must have at least one sh:NodeShape.
        assert list(g.subjects(RDF.type, SH.NodeShape)), (
            f"shapes module {name} has no sh:NodeShape declarations"
        )


def test_foundation_shapes_extended_with_meta_shapes(
    emitted_shapes: dict[str, Path]
) -> None:
    """Per ADR-0012, foundation opda-shapes.ttl now carries the five
    meta-shapes + two SHACL-AF rules (PIIWithoutDPVCoAnnotation and
    DeprecationChain). Verify all are present."""
    g = Graph()
    g.parse(str(emitted_shapes["foundation"]), format="turtle")
    expected = {
        OPDA_SHAPE.NoIdentityOverride_MetaShape,
        OPDA_SHAPE.ShInSemantics_MetaShape,
        OPDA_SHAPE.ShViolationFloor_MetaShape,
        OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape,
        OPDA_SHAPE.PIIWithoutDPVCoAnnotationRule,
        OPDA_SHAPE.DeprecationChainRule,
    }
    nodes = set(g.subjects(RDF.type, SH.NodeShape))
    missing = expected - nodes
    assert not missing, f"missing foundation meta-shapes: {missing}"


# ---------------------------------------------------------------------------
# §Confirmation #2 — byte-identity per file
# ---------------------------------------------------------------------------
def test_shape_files_byte_identical_across_runs() -> None:
    from opda_gen.emitters.shapes import emit_shapes

    with tempfile.TemporaryDirectory() as a_dir, tempfile.TemporaryDirectory() as b_dir:
        a = Path(a_dir)
        b = Path(b_dir)
        emit_shapes(a)
        emit_shapes(b)
        a_files = sorted(p.name for p in a.iterdir())
        b_files = sorted(p.name for p in b.iterdir())
        assert a_files == b_files
        for name in a_files:
            assert (a / name).read_bytes() == (b / name).read_bytes(), (
                f"byte mismatch on second run: {name}"
            )


# ---------------------------------------------------------------------------
# §Confirmation #3 — three-graph isolation: no owl:Class triples in shapes
# ---------------------------------------------------------------------------
def test_no_owl_class_triples_in_shapes(
    emitted_shapes: dict[str, Path]
) -> None:
    for name, path in emitted_shapes.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        class_subjects = list(g.subjects(RDF.type, OWL.Class))
        assert not class_subjects, (
            f"shapes file {name} contains owl:Class subjects: {class_subjects}"
        )


def test_no_dpv_triples_in_shapes(
    emitted_shapes: dict[str, Path]
) -> None:
    """Per ADR-0012 §Confirmation #3 + ODR-0018 §3a CI test 1: no DPV
    predicates in any shapes file (DPV co-annotations live in
    annotation files only)."""
    for name, path in emitted_shapes.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        for s, p, o in g:
            assert not str(p).startswith("https://w3id.org/dpv/pd"), (
                f"shapes file {name} contains DPV predicate {p}"
            )


def test_no_dpv_owl_imports_anywhere(
    emitted_shapes: dict[str, Path]
) -> None:
    """Reference-not-import per Kendall S012 condition + ODR-0018 §Rule 3."""
    for name, path in emitted_shapes.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        for s, _, o in g.triples((None, OWL.imports, None)):
            assert not str(o).startswith("https://w3id.org/dpv"), (
                f"shapes file {name} imports DPV via owl:imports {o}"
            )


# ---------------------------------------------------------------------------
# §Confirmation #4 — every shape carries explicit sh:severity
# ---------------------------------------------------------------------------
def test_every_node_shape_or_inner_property_has_severity(
    emitted_shapes: dict[str, Path]
) -> None:
    """Every sh:NodeShape (or its inner sh:property/sh:sparql/sh:rule
    blank node) carries an explicit sh:severity. Per ADR-0012 §Confirmation
    #4: severity is property of the shape, not implicit."""
    for name, path in emitted_shapes.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        node_shapes = list(g.subjects(RDF.type, SH.NodeShape))
        for shape in node_shapes:
            # Severity may be on the NodeShape directly OR on each of its
            # sh:property / sh:sparql / sh:rule blank-node objects.
            direct_sev = list(g.objects(shape, SH.severity))
            if direct_sev:
                continue
            # Otherwise verify each property/sparql/rule child has one.
            children = (
                list(g.objects(shape, SH.property))
                + list(g.objects(shape, SH.sparql))
                + list(g.objects(shape, SH.rule))
            )
            assert children, (
                f"shape {shape} in {name} has no sh:severity and no "
                f"sh:property/sh:sparql/sh:rule children"
            )
            # Rule children are typed as sh:SPARQLRule and inherit severity
            # via the parent NodeShape pattern; in the AF pattern used by
            # ADR-0012, the severity is on the NodeShape. So accept either
            # direct severity OR child severity.
            for child in children:
                child_sev = list(g.objects(child, SH.severity))
                # If neither parent nor child carries severity, fail.
                # (We've already established parent has no severity.)
                # Empty child severity is acceptable iff the child is a
                # sh:SPARQLRule and severity is on the parent (the AF
                # pattern). Since parent has no severity in this branch,
                # the only valid case is property/sparql with explicit
                # severity child.
                if not child_sev:
                    # Strictly fail — every shape must carry severity
                    # somewhere reachable from the NodeShape.
                    raise AssertionError(
                        f"shape {shape} in {name} carries no sh:severity "
                        "on the NodeShape OR on its child "
                        f"{child}; ADR-0012 §Confirmation #4 violated."
                    )


# ---------------------------------------------------------------------------
# §Confirmation #5 — five sh:Violation categories all present
# ---------------------------------------------------------------------------
def test_cat1_identity_key_shapes_present(
    emitted_shapes: dict[str, Path]
) -> None:
    """Cat 1: identity-key missing/wrong-type — per-Kind shapes."""
    g_all = Graph()
    for path in emitted_shapes.values():
        g_all.parse(str(path), format="turtle")
    # Expect at least Property, LegalEstate, Person, Organisation,
    # Transaction, Claim identity-key shapes.
    expected = {
        OPDA_SHAPE.PropertyIdentityKeyShape,
        OPDA_SHAPE.LegalEstateIdentityKeyShape,
        OPDA_SHAPE.PersonIdentityKeyShape,
        OPDA_SHAPE.OrganisationIdentityKeyShape,
        OPDA_SHAPE.TransactionIdentityKeyShape,
        OPDA_SHAPE.ClaimIdentityKeyShape,
    }
    nodes = set(g_all.subjects(RDF.type, SH.NodeShape))
    missing = expected - nodes
    assert not missing, f"missing Cat 1 identity-key shapes: {missing}"


def test_cat2_ic_breach_shape_present(
    emitted_shapes: dict[str, Path]
) -> None:
    """Cat 2: IC breach / anti-pattern detection — at minimum
    PropertyICBreachShape (covers the opda:identifiesSameProperty
    anti-pattern per ODR-0005 Rule 5)."""
    g = Graph()
    g.parse(str(emitted_shapes["property"]), format="turtle")
    assert (OPDA_SHAPE.PropertyICBreachShape, RDF.type, SH.NodeShape) in g


def test_cat3_no_identity_override_meta_shape_present(
    emitted_shapes: dict[str, Path]
) -> None:
    """Cat 3: no-identity-override — foundation meta-shape per
    ODR-0010 §Q6."""
    g = Graph()
    g.parse(str(emitted_shapes["foundation"]), format="turtle")
    assert (
        OPDA_SHAPE.NoIdentityOverride_MetaShape, RDF.type, SH.NodeShape
    ) in g
    # Verify severity is sh:Violation
    sev = list(g.objects(OPDA_SHAPE.NoIdentityOverride_MetaShape, SH.severity))
    assert SH.Violation in sev


def test_cat4_special_category_pii_shape_present(
    emitted_shapes: dict[str, Path]
) -> None:
    """Cat 4: special-category PII without lawful basis — agent module."""
    g = Graph()
    g.parse(str(emitted_shapes["agent"]), format="turtle")
    assert (
        OPDA_SHAPE.SpecialCategoryPIIWithoutLawfulBasisShape,
        RDF.type, SH.NodeShape,
    ) in g


def test_cat5_meta_shape_over_shape_graph_present(
    emitted_shapes: dict[str, Path]
) -> None:
    """Cat 5: meta-shape-over-shape-graph drift — foundation."""
    g = Graph()
    g.parse(str(emitted_shapes["foundation"]), format="turtle")
    assert (
        OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape, RDF.type, SH.NodeShape
    ) in g
    sev = list(g.objects(OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape, SH.severity))
    assert SH.Violation in sev


# ---------------------------------------------------------------------------
# §Confirmation #6 — three-rule interface contract emitted as meta-shapes
# ---------------------------------------------------------------------------
def test_three_rule_interface_contract_meta_shapes_present(
    emitted_shapes: dict[str, Path]
) -> None:
    g = Graph()
    g.parse(str(emitted_shapes["foundation"]), format="turtle")
    rules = (
        OPDA_SHAPE.NoIdentityOverride_MetaShape,    # Rule 3 (no-identity-override)
        OPDA_SHAPE.ShInSemantics_MetaShape,         # Rule 1 (sh:in semantics)
        OPDA_SHAPE.ShViolationFloor_MetaShape,      # Rule 2 (sh:Violation floor)
    )
    for r in rules:
        assert (r, RDF.type, SH.NodeShape) in g, (
            f"three-rule interface contract meta-shape missing: {r}"
        )


# ---------------------------------------------------------------------------
# §"SHACL-AF rule emission" — 11 citing sites all emit by URI
# ---------------------------------------------------------------------------
def test_eleven_shacl_af_citing_sites_all_emit(
    emitted_shapes: dict[str, Path]
) -> None:
    """All 11 SHACL-AF citing sites enumerated in ADR-0012 §"SHACL-AF
    rule emission" must emit as sh:NodeShape declarations somewhere in
    the corpus."""
    all_shapes: set[URIRef] = set()
    for path in emitted_shapes.values():
        g = Graph()
        g.parse(str(path), format="turtle")
        all_shapes.update(g.subjects(RDF.type, SH.NodeShape))

    expected_iris = {
        OPDA_SHAPE[local_name] for local_name, _ in SHACL_AF_CITING_SITES
    }
    missing = expected_iris - all_shapes
    assert not missing, (
        f"missing SHACL-AF citing sites: {sorted(str(u) for u in missing)}"
    )


# ---------------------------------------------------------------------------
# §"SHACL-AF rule emission" — PIIWithoutDPVCoAnnotationRule is sh:Warning
# ---------------------------------------------------------------------------
def test_pii_rule_is_warning_severity(
    emitted_shapes: dict[str, Path]
) -> None:
    g = Graph()
    g.parse(str(emitted_shapes["foundation"]), format="turtle")
    sev = list(g.objects(OPDA_SHAPE.PIIWithoutDPVCoAnnotationRule, SH.severity))
    assert SH.Warning in sev, (
        "PIIWithoutDPVCoAnnotationRule must be sh:Warning per ADR-0012 "
        "§SHACL-AF rule emission (silent PII leakage is high-impact)"
    )


def test_uprn_succession_rule_is_info_severity(
    emitted_shapes: dict[str, Path]
) -> None:
    g = Graph()
    g.parse(str(emitted_shapes["property"]), format="turtle")
    sev = list(g.objects(OPDA_SHAPE.UPRNSuccessionRule, SH.severity))
    assert SH.Info in sev, (
        "UPRNSuccessionRule must be sh:Info per ODR-0017 §1a "
        "(substantive-succession case)"
    )


# ---------------------------------------------------------------------------
# Provenance — every shape carries dct:source
# ---------------------------------------------------------------------------
def test_every_shape_carries_dct_source(
    emitted_shapes: dict[str, Path]
) -> None:
    from rdflib.namespace import DCTERMS
    for name, path in emitted_shapes.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        for shape in g.subjects(RDF.type, SH.NodeShape):
            sources = list(g.objects(shape, DCTERMS.source))
            assert sources, (
                f"shape {shape} in {name} has no dct:source citation"
            )


# ---------------------------------------------------------------------------
# CLI smoke test — emit-shapes with --module restricts to one file
# ---------------------------------------------------------------------------
def test_emit_shapes_single_module() -> None:
    from opda_gen.emitters.shapes import emit_shapes

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        written = emit_shapes(out, module="property")
        assert len(written) == 1
        only = next(iter(written))
        assert only.name == "opda-property-shapes.ttl"


def test_emit_shapes_invalid_module_raises() -> None:
    from opda_gen.emitters.shapes import emit_shapes

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        with pytest.raises(ValueError, match="unknown shapes module"):
            emit_shapes(out, module="nonexistent")


# ---------------------------------------------------------------------------
# D1 (ADR-0005 §G) — SpecialCategoryPIIWithoutLawfulBasisShape binds CORE
# dpv: (https://w3id.org/dpv#) for dpv:hasLegalBasis, NOT dpv-pd:.
# ---------------------------------------------------------------------------
def test_special_category_shape_binds_core_dpv_for_lawful_basis(
    emitted_shapes: dict[str, Path]
) -> None:
    """ADR-0005 §G D1: the Cat 4 shape's sh:select SPARQL must PREFIX-bind
    `dpv:` to the CORE DPV namespace (https://w3id.org/dpv#) so that
    `dpv:hasLegalBasis` resolves to the real predicate
    `https://w3id.org/dpv#hasLegalBasis` — NOT the non-existent
    `https://w3id.org/dpv/pd#hasLegalBasis` the prior dpv/pd# binding
    produced (which made the lone lawful-basis Violation gate a no-op)."""
    g = Graph()
    g.parse(str(emitted_shapes["agent"]), format="turtle")
    selects = [
        str(sel)
        for sparql in g.objects(
            OPDA_SHAPE.SpecialCategoryPIIWithoutLawfulBasisShape, SH.sparql
        )
        for sel in g.objects(sparql, SH.select)
    ]
    assert len(selects) == 1, (
        "expected exactly one sh:select on the Cat 4 shape; got "
        f"{len(selects)}"
    )
    select = selects[0]
    assert "PREFIX dpv: <https://w3id.org/dpv#>" in select, (
        "Cat 4 shape must bind CORE dpv: (https://w3id.org/dpv#) per "
        f"ADR-0005 §G D1; got SPARQL:\n{select}"
    )
    assert "PREFIX dpv: <https://w3id.org/dpv/pd#>" not in select, (
        "Cat 4 shape must NOT bind dpv: to the dpv/pd# namespace "
        "(ADR-0005 §G D1 — lawful basis is CORE DPV, not personal-data "
        f"categories); got SPARQL:\n{select}"
    )
    # Query still references dpv:hasLegalBasis (logic unchanged).
    assert "dpv:hasLegalBasis" in select, (
        "Cat 4 shape SPARQL must still query dpv:hasLegalBasis "
        "(only the prefix binding changed)"
    )


# --- ODR-0029 R3: domain/range-as-SHACL-constraint layer -----------------
def test_domain_range_layer_emitted_in_foundation_shapes() -> None:
    """ODR-0029 R3: the foundation shapes graph carries a domain shape
    (`sh:targetSubjectsOf <pred> ; sh:class C ; sh:severity sh:Violation`) for
    every `rdfs:domain` and a range dual for every class-valued `rdfs:range`.

    Spot-checks the EPC case the disposition names: opda:currentEnergyRating
    (rdfs:domain opda:Property) gets a targetSubjectsOf/sh:class opda:Property
    Violation shape; opda:hasEPCCertificate (rdfs:range opda:EPCCertificate)
    gets a targetObjectsOf/sh:class opda:EPCCertificate dual."""
    from opda_gen.emitters.foundation import build_shapes_graph

    g = build_shapes_graph()

    dom_shape = OPDA_SHAPE.currentEnergyRatingDomainShape
    assert (dom_shape, RDF.type, SH.NodeShape) in g
    assert (dom_shape, SH.targetSubjectsOf, OPDA.currentEnergyRating) in g
    assert (dom_shape, SH["class"], OPDA.Property) in g
    assert (dom_shape, SH.severity, SH.Violation) in g

    rng_shape = OPDA_SHAPE.hasEPCCertificateRangeShape
    assert (rng_shape, RDF.type, SH.NodeShape) in g
    assert (rng_shape, SH.targetObjectsOf, OPDA.hasEPCCertificate) in g
    assert (rng_shape, SH["class"], OPDA.EPCCertificate) in g
    assert (rng_shape, SH.severity, SH.Violation) in g

    # The layer is substantial — every rdfs:domain becomes a domain shape.
    domain_shapes = [
        s for s in g.subjects(SH.targetSubjectsOf, None)
        if str(s).endswith("DomainShape")
    ]
    assert len(domain_shapes) >= 200, (
        f"expected the full domain layer (>=200 shapes); got {len(domain_shapes)}"
    )


def test_planted_off_domain_triple_raises_violation() -> None:
    """ODR-0029 R3 §Confirmation: a predicate used off its declared domain is
    flagged as a SHACL violation. Plant `opda:currentEnergyRating` on a node
    typed `opda:EPCCertificate` (NOT `opda:Property`) — the EPC mismatch the
    disposition guards — and assert the Jena SHACL report flags it, citing
    `currentEnergyRatingDomainShape`. (Domain/range are VALIDATED here, never
    inferred — the Safe-Group closure excludes them, ODR-0025 §R2/§R7.)"""
    from opda_gen.emitters.foundation import build_shapes_graph
    from opda_gen.jena_shacl import validate

    shapes = build_shapes_graph()

    # An EPCCertificate node carrying a Property-domain predicate — the exact
    # off-domain misuse ODR-0029 R3 must catch.
    data = Graph()
    bad = URIRef("urn:test:epc-1")
    data.add((bad, RDF.type, OPDA.EPCCertificate))
    data.add((bad, OPDA.currentEnergyRating, Literal("C")))

    conforms, report = validate(shapes, data)
    assert not conforms, (
        "planted off-domain triple (currentEnergyRating on an EPCCertificate, "
        "not a Property) MUST NOT conform — ODR-0029 R3 domain validation"
    )
    # The violation traces to the currentEnergyRating domain shape.
    source_shapes = {str(o) for o in report.objects(None, SH.sourceShape)}
    assert str(OPDA_SHAPE.currentEnergyRatingDomainShape) in source_shapes, (
        "the violation must cite currentEnergyRatingDomainShape; got "
        f"{source_shapes}"
    )
    # And it is Violation-severity (ODR-0013 §Q1 — a type error, not a gap).
    severities = {str(o) for o in report.objects(None, SH.resultSeverity)}
    assert str(SH.Violation) in severities, (
        f"off-domain breach must be sh:Violation; got {severities}"
    )
