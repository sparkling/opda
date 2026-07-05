"""End-to-end tests for the PDTF -> OPDA RML mapping.

Green-when-not-yet-wired: every test is skipped until the mapping, the
provenance index, and the test instances exist (same skipif idiom as
tools/opda-gen/tests/test_baspi5_roundtrip.py). Once wired:

* soundness    -- each conformant instance (01/02/03) -> SHACL CONFORMS
* completeness -- each conformant instance -> 0 layer-1 leaves dropped
* monetary     -- 03 (multi-participant) yields an opda:MonetaryAmount node
* negative     -- 04 -> the SPECIFIC Baspi5_SellersCapacityShape Violation
"""

from __future__ import annotations

import importlib.util
import subprocess
import sys
from pathlib import Path

import pytest


def _repo_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "source" / "03-standards" / "rml").exists():
            return parent
    raise RuntimeError("repo root not found")


ROOT = _repo_root()
RML = ROOT / "source" / "03-standards" / "rml"
HARNESS = RML / "harness"

MAPPING = RML / "mapping" / "opda-pdtf.rml.ttl"
INDEX = RML / "provenance-index.json"
TESTDATA = RML / "testdata"
CONFORMANT = TESTDATA / "01-conformant-full.json"
MINIMAL = TESTDATA / "02-minimal.json"
MULTI = TESTDATA / "03-multi-participant.json"
NEGATIVE = TESTDATA / "04-negative-invalid.json"
VERIFIED_CLAIMS = TESTDATA / "verified-claims-01.json"
VALIDATE_SH = HARNESS / "validate_shacl.sh"
SHAPES = ROOT / "public" / "ontology" / "artefacts" / "opda-shapes-merged.ttl"
# The negative fixture (PoA seller, no evidenced authority) only trips the
# BASPI5 profile shape, which is NOT in opda-shapes-merged.ttl.
BASPI5_SHAPES = ROOT / "source" / "03-standards" / "ontology" / "profiles" / "baspi5.ttl"

# The one shape file 04 must fail (sh:NodeShape / sh:targetClass opda:Seller /
# sh:xone / sh:severity sh:Violation), per testdata/MANIFEST.md.
SELLERS_CAPACITY_SHAPE = "https://opda.org.uk/pdtf/shape/Baspi5_SellersCapacityShape"

# The three soundness/completeness fixtures (01 is required by pytestmark;
# 02/03 are per-parameter skipped if a given file is absent).
CONFORMANT_INSTANCES = {
    "01-conformant-full": CONFORMANT,
    "02-minimal": MINIMAL,
    "03-multi-participant": MULTI,
}


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


pytestmark = pytest.mark.skipif(
    not (MAPPING.exists() and INDEX.exists() and CONFORMANT.exists()),
    reason="RML mapping, provenance index, or conformant test instance not yet emitted",
)


@pytest.fixture(scope="module")
def run_mapping():
    return _load("run_mapping", HARNESS / "run_mapping.py")


@pytest.fixture(scope="module")
def check_completeness():
    return _load("check_completeness", HARNESS / "check_completeness.py")


def _validate(data: Path, *extra_shapes: Path):
    return subprocess.run(
        ["bash", str(VALIDATE_SH), str(data), *(str(s) for s in extra_shapes)],
        capture_output=True,
        text=True,
    )


def _materialise(run_mapping, instance: Path, out: Path):
    assert run_mapping.run(MAPPING, instance, out) == 0
    assert out.exists() and out.stat().st_size > 0


@pytest.mark.parametrize("name", list(CONFORMANT_INSTANCES))
def test_instance_is_sound(run_mapping, tmp_path, name):
    """Soundness: each conformant instance validates cleanly against the merged
    shapes (files 01/02/03; DoD scope is merged shapes only)."""
    instance = CONFORMANT_INSTANCES[name]
    if not instance.exists():
        pytest.skip(f"{name} not emitted")
    out = tmp_path / f"{name}.nt"
    _materialise(run_mapping, instance, out)

    result = _validate(out)
    assert result.returncode == 0, (
        f"{name} must CONFORM; report:\n{result.stdout}\n{result.stderr}"
    )
    assert "CONFORMS" in result.stdout


@pytest.mark.parametrize("name", list(CONFORMANT_INSTANCES))
def test_instance_is_layer1_complete(run_mapping, check_completeness, tmp_path, name):
    """Completeness: each conformant instance drops 0 layer-1 leaves."""
    instance = CONFORMANT_INSTANCES[name]
    if not instance.exists():
        pytest.skip(f"{name} not emitted")
    out = tmp_path / f"{name}.nt"
    _materialise(run_mapping, instance, out)

    rc = check_completeness.main(
        [
            "--instance", str(instance),
            "--index", str(INDEX),
            "--triples", str(out),
            "--out-dir", str(tmp_path),
        ]
    )
    assert rc == 0, f"{name} must have 0 layer-1 leaves dropped"


def test_monetary_amount_construction(run_mapping, tmp_path):
    """The MonetaryAmount value-node construction (CONTRACT trap): a monetary
    leaf must map to an opda:MonetaryAmount node carrying opda:amount
    (xsd:decimal) + opda:currency, NOT a bare decimal.

    Validated on 01, whose layer-1 monetary leaves (annualGroundRent /
    annualServiceCharge / sharedOwnershipRent) genuinely produce these nodes.
    (The headline propertyPack.priceInformation.price is a documented GAP with
    no dct:source predicate -- 'bind-only-what-exists' -- so it is deliberately
    NOT asserted here.)
    """
    import rdflib

    out = tmp_path / "conformant.nt"
    _materialise(run_mapping, CONFORMANT, out)

    graph = rdflib.Graph()
    graph.parse(str(out), format="nt")
    opda = rdflib.Namespace("https://opda.org.uk/pdtf/")
    xsd_decimal = rdflib.URIRef("http://www.w3.org/2001/XMLSchema#decimal")

    well_formed = [
        node
        for node in graph.subjects(rdflib.RDF.type, opda.MonetaryAmount)
        if any(
            isinstance(a, rdflib.Literal) and a.datatype == xsd_decimal
            for a in graph.objects(node, opda.amount)
        )
        and any(graph.objects(node, opda.currency))
    ]
    assert well_formed, (
        "01 must yield >=1 opda:MonetaryAmount node with opda:amount "
        "(xsd:decimal) + opda:currency; none well-formed in the output."
    )


@pytest.mark.skipif(
    not (NEGATIVE.exists() and BASPI5_SHAPES.exists()),
    reason="negative test instance or BASPI5 profile shapes not yet emitted",
)
def test_negative_reports_sellers_capacity_violation(run_mapping, tmp_path):
    """The negative fixture must trip THE specific defect: a
    sh:Violation ValidationResult whose sh:sourceShape is
    Baspi5_SellersCapacityShape (B1.3 / B1.3.2). A generic 'some violation'
    is NOT sufficient -- 04 also fires unrelated value-shape violations that
    the conformant output shares, so we pin the exact shape.

    RED until B1's mapping emits the opda:Seller + opda:hasAssertedCapacity
    surface that gives the xone a target.
    """
    import rdflib
    from rdflib.namespace import RDF

    out = tmp_path / "negative.nt"
    _materialise(run_mapping, NEGATIVE, out)

    result = _validate(out, BASPI5_SHAPES)
    assert result.returncode == 1, (
        "negative fixture must produce SHACL violation(s) against merged + "
        "BASPI5 shapes; if this CONFORMS, check the mapping emitted the "
        f"opda:Seller / hasAssertedCapacity target triples.\nstdout:\n{result.stdout}"
    )

    sh = rdflib.Namespace("http://www.w3.org/ns/shacl#")
    shape = rdflib.URIRef(SELLERS_CAPACITY_SHAPE)
    report = rdflib.Graph()
    report.parse(data=result.stdout, format="turtle")

    matches = [
        r
        for r in report.subjects(RDF.type, sh.ValidationResult)
        if (r, sh.resultSeverity, sh.Violation) in report
        and (r, sh.sourceShape, shape) in report
    ]
    violation_shapes = sorted(
        {
            str(o)
            for r in report.subjects(RDF.type, sh.ValidationResult)
            for o in report.objects(r, sh.sourceShape)
        }
    )
    assert matches, (
        "expected a sh:Violation sourced from Baspi5_SellersCapacityShape; "
        f"violation sourceShapes were: {violation_shapes}. If the shape is "
        "absent, the mapping likely did not emit the Seller/capacity surface."
    )


@pytest.mark.skipif(
    not VERIFIED_CLAIMS.exists(),
    reason="verified-claims-01.json fixture not yet emitted",
)
def test_verified_claims_evidence_second_source(run_mapping, tmp_path):
    """M36: a second logical source (VERIFIED_CLAIMS.json) traces the real,
    separate OIDC4IDA-shaped verifiedClaims schema (correlated to a
    transaction via transactionId), closing opda:evidenceType / opda:digest /
    opda:attestedBy / opda:Verifier — confirmed 2026-07-05 as real, structured
    PDTF data, not out of scope as an earlier pass concluded."""
    import rdflib

    out = tmp_path / "verified-claims.nt"
    assert run_mapping.run(MAPPING, CONFORMANT, out, VERIFIED_CLAIMS) == 0
    assert out.exists() and out.stat().st_size > 0

    result = _validate(out)
    assert result.returncode == 0, (
        f"must CONFORM with verifiedClaims evidence present; report:\n"
        f"{result.stdout}\n{result.stderr}"
    )

    g = rdflib.Graph()
    g.parse(str(out), format="nt")
    OPDA = rdflib.Namespace("https://opda.org.uk/pdtf/")
    evidence = rdflib.URIRef(
        "https://opda.org.uk/pdtf/harness/data/evidence/LnRdGiBUkLbnuNJ89p4CEj"
    )
    assert (
        evidence,
        OPDA.evidenceType,
        rdflib.URIRef("https://opda.org.uk/pdtf/scheme/evidenceMethod/Vouch"),
    ) in g
    assert (
        evidence,
        OPDA.digest,
        rdflib.Literal(
            "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        ),
    ) in g
    voucher = rdflib.URIRef(
        "https://opda.org.uk/pdtf/harness/data/person/voucher-Priya%20Nandakumar"
    )
    assert (evidence, OPDA.attestedBy, voucher) in g
    verifier_org = rdflib.URIRef(
        "https://opda.org.uk/pdtf/harness/data/org/verifier-"
        "OPDA%20Identity%20Checks%20Ltd"
    )
    from rdflib.namespace import RDF, PROV

    assert (verifier_org, RDF.type, OPDA.Verifier) in g
    assert (verifier_org, RDF.type, PROV.Organization) in g
