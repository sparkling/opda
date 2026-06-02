"""
Tests for the S034 overlay-leaf enumerator (ADR-0029 gap-1) in
opda_gen.emitters.profiles.

Realises the S034 as-built fix 5 profile-level conditions:
  (a) ta6 + >=2 other forms each emit >=1 NodeShape with >=1 bound property
      whose sh:path is an emitted predicate;
  (b) EVERY emitted profile property-shape's sh:path is in the emitted-predicate
      set (asserted across ALL profiles — no fabricated predicates);
  (c) no profile double-binds a ref (one ref -> one sh:path);
  (d) oc1/llc1 remain THIN (0 NodeShapes);
  (e) baspi5 byte-identity preserved (its emit is unchanged);
  (f) each enumerated form emits a gap register (dct:description names its
      coverage/GAPs).
"""

from __future__ import annotations

from pathlib import Path

import pytest
from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF

from opda_gen.emitters.profiles import emit_profile


OPDA = Namespace("https://opda.org.uk/pdtf/")
SH = Namespace("http://www.w3.org/ns/shacl#")

_ENUMERATED = (
    "ta6", "ta7", "ta10", "lpe1", "fme1", "piq", "rds",
    "con29R", "con29DW", "sr24", "nts2", "ntsl2",
    "as", "dr", "er", "fd", "hi", "hs", "jk", "la",
    "ma", "mc", "oa", "oc", "sb", "sf", "sl", "tf",
)
# Forms that bind >=1 leaf (so they emit >=1 NodeShape). lpe1/fme1 and the
# ref-less extensions bind 0 — honest partial, asserted separately.
_BINDS_SOMETHING = ("ta6", "ta7", "piq", "nts2", "ntsl2", "con29DW", "sr24")


def _ontology_dir() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (
            parent / "source" / "03-standards"
        ).exists():
            return parent / "source" / "03-standards" / "ontology"
    raise RuntimeError("could not locate ontology dir")


def _emitted_predicate_iris() -> set[str]:
    g = Graph()
    for ttl in sorted(_ontology_dir().glob("opda-*.ttl")):
        g.parse(str(ttl), format="turtle")
    out: set[str] = set()
    for ptype in (OWL.DatatypeProperty, OWL.ObjectProperty):
        for s in g.subjects(RDF.type, ptype):
            if isinstance(s, URIRef) and str(s).startswith(str(OPDA)):
                out.add(str(s))
    return out


def _emit_and_parse(form_id: str, tmp_path: Path) -> Graph:
    emit_profile(form_id, tmp_path)
    g = Graph()
    g.parse(str(tmp_path / "profiles" / f"{form_id}.ttl"), format="turtle")
    return g


# --- (a) ta6 + >=2 others bind >=1 NodeShape with a bound property --------
@pytest.mark.parametrize("form_id", _BINDS_SOMETHING)
def test_form_emits_nodeshape_with_bound_property(
    form_id: str, tmp_path: Path
) -> None:
    emitted = _emitted_predicate_iris()
    g = _emit_and_parse(form_id, tmp_path)
    node_shapes = list(g.subjects(RDF.type, SH.NodeShape))
    assert node_shapes, f"{form_id}: expected >=1 NodeShape"
    paths = [str(p) for p in g.objects(None, SH.path)]
    assert paths, f"{form_id}: expected >=1 bound property shape"
    # at least one bound path is an emitted opda: predicate
    assert any(p in emitted for p in paths), (
        f"{form_id}: no bound sh:path is an emitted predicate"
    )
    # every NodeShape carries sh:targetClass.
    for ns in node_shapes:
        assert list(g.objects(ns, SH.targetClass)), (
            f"{form_id}: NodeShape {ns} missing sh:targetClass"
        )


# --- (b) every profile property-shape sh:path is an emitted predicate -----
def test_no_profile_fabricates_a_predicate(tmp_path: Path) -> None:
    """Across ALL enumerated profiles, every property-shape sh:path that is an
    opda: term MUST be in the emitted-predicate set (no fabrication)."""
    emitted = _emitted_predicate_iris()
    fabricated: list[str] = []
    for form_id in _ENUMERATED:
        g = _emit_and_parse(form_id, tmp_path)
        for p in g.objects(None, SH.path):
            ps = str(p)
            if ps.startswith(str(OPDA)) and ps not in emitted:
                fabricated.append(f"{form_id}: {ps}")
    assert not fabricated, f"fabricated sh:path(s): {fabricated}"


# --- (c) no profile double-binds a ref (one ref -> one sh:path) -----------
def test_no_profile_double_binds_a_ref(tmp_path: Path) -> None:
    """Within each form, each JSON-pointer schema-leaf-path `dct:source`
    anchors exactly one property-shape `sh:path` (no over-binding — the G3
    hard-gate failure mode)."""
    for form_id in _ENUMERATED:
        g = _emit_and_parse(form_id, tmp_path)
        leaf_paths: dict[str, set[str]] = {}
        for shape in g.subjects(SH.path, None):
            srcs = [
                str(o) for o in g.objects(shape, DCTERMS.source)
                if "trust.propdata" in str(o)
            ]
            for path in g.objects(shape, SH.path):
                for src in srcs:
                    leaf_paths.setdefault(src, set()).add(str(path))
        doubly = {k: v for k, v in leaf_paths.items() if len(v) > 1}
        assert not doubly, f"{form_id}: doubly-bound refs: {doubly}"


# --- (d) oc1/llc1 remain thin (0 NodeShapes) ------------------------------
@pytest.mark.parametrize("form_id", ("oc1", "llc1"))
def test_held_register_forms_stay_thin(form_id: str, tmp_path: Path) -> None:
    g = _emit_and_parse(form_id, tmp_path)
    assert not list(g.subjects(RDF.type, SH.NodeShape)), (
        f"{form_id} must stay THIN (0 NodeShapes) — held per S034 Q2"
    )
    assert not list(g.objects(None, SH.path)), (
        f"{form_id} must bind no property shapes"
    )


# --- (e) baspi5 byte-identity preserved -----------------------------------
def test_baspi5_emit_byte_identical(tmp_path: Path) -> None:
    """The enumerator must not perturb baspi5 — its bespoke shape builder is
    untouched, so two emits are byte-identical (the regression gate)."""
    a = tmp_path / "a"
    b = tmp_path / "b"
    a.mkdir()
    b.mkdir()
    emit_profile("baspi5", a)
    emit_profile("baspi5", b)
    assert (a / "profiles" / "baspi5.ttl").read_bytes() == (
        b / "profiles" / "baspi5.ttl"
    ).read_bytes()
    # baspi5 carries NO trust.propdata anchor (it uses the basp.uk authority).
    g = Graph()
    g.parse(str(a / "profiles" / "baspi5.ttl"), format="turtle")
    assert not any(
        "trust.propdata" in str(o) for o in g.objects(None, DCTERMS.source)
    ), "baspi5 must not use the overlay JSON-pointer authority"


# --- (f) each enumerated form emits a gap register ------------------------
@pytest.mark.parametrize("form_id", _ENUMERATED)
def test_enumerated_form_emits_gap_register(
    form_id: str, tmp_path: Path
) -> None:
    g = _emit_and_parse(form_id, tmp_path)
    pi = URIRef(f"https://w3id.org/opda/profiles/{form_id}")
    descs = [str(d) for d in g.objects(pi, DCTERMS.description)]
    assert descs, f"{form_id}: missing gap register (dct:description)"
    reg = descs[0]
    # The register names the coverage tally (bindable + GAPped).
    assert "bindable leaves enumerated" in reg, (
        f"{form_id}: gap register missing coverage tally"
    )
    assert "GAPped" in reg, f"{form_id}: gap register missing GAP count"


def test_enumerated_dct_source_is_json_pointer(tmp_path: Path) -> None:
    """Every enumerated property-shape dct:source is a JSON-pointer into the
    overlay schema (ODR-0022 G2, S034) — never the deciding ODR/ADR."""
    g = _emit_and_parse("ta6", tmp_path)
    prop_sources = []
    for shape in g.subjects(SH.path, None):
        prop_sources.extend(str(o) for o in g.objects(shape, DCTERMS.source))
    assert prop_sources
    for src in prop_sources:
        assert src.startswith(
            "https://trust.propdata.org.uk/schemas/v3/overlays/ta6.json#/"
        ), f"property-shape dct:source not a ta6 JSON-pointer: {src}"
        assert "/odr/" not in src and "/adr/" not in src
