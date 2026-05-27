"""
Test g14 special category predicate.

Realises:
- ADR-0014 G14 closure — `opda:hasSpecialCategoryData` is declared as
  an `owl:DatatypeProperty` in the foundation class graph so the
  Cat 4 SHACL shape `SpecialCategoryPIIWithoutLawfulBasisShape` (in
  `opda-agent-shapes.ttl`) has a real TBox-level target predicate.
- ADR-0005 §G14 — the closure preserves the Council route to S012 Q3
  via skos:scopeNote; the declaration does not pre-empt ratification.

These tests check the declaration is present, well-formed, and that
its dct:source resolves to ODR-0012 §Q5 (the original Cat 4 shape's
ratifying clause).
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, Literal, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

from opda_gen.emitters.foundation import emit_foundation


OPDA = URIRef("https://w3id.org/opda/#")
HAS_SCD = URIRef("https://w3id.org/opda/#hasSpecialCategoryData")


def _classes_graph(tmp_path: Path) -> Graph:
    """Emit the foundation TTLs and return the parsed class graph."""
    written = emit_foundation(tmp_path)
    classes_path = next(
        p for p in written.keys() if p.name == "opda-classes.ttl"
    )
    g = Graph()
    g.parse(classes_path, format="turtle")
    return g


def test_has_special_category_data_declared_as_datatype_property(
    tmp_path: Path,
) -> None:
    g = _classes_graph(tmp_path)
    assert (HAS_SCD, RDF.type, OWL.DatatypeProperty) in g, (
        "opda:hasSpecialCategoryData missing owl:DatatypeProperty typing"
    )


def test_has_special_category_data_range_is_boolean(tmp_path: Path) -> None:
    g = _classes_graph(tmp_path)
    ranges = list(g.objects(HAS_SCD, RDFS.range))
    assert XSD.boolean in ranges, (
        f"opda:hasSpecialCategoryData range MUST include xsd:boolean; "
        f"got {ranges}"
    )


def test_has_special_category_data_carries_label_comment_scopenote(
    tmp_path: Path,
) -> None:
    g = _classes_graph(tmp_path)
    labels = list(g.objects(HAS_SCD, RDFS.label))
    comments = list(g.objects(HAS_SCD, RDFS.comment))
    notes = list(g.objects(HAS_SCD, SKOS.scopeNote))
    assert any(isinstance(l, Literal) and l.language == "en"
               for l in labels), "rdfs:label @en missing"
    assert any(isinstance(c, Literal) and c.language == "en"
               for c in comments), "rdfs:comment @en missing"
    assert any(isinstance(n, Literal) and n.language == "en"
               for n in notes), "skos:scopeNote @en missing"
    # The scope-note must preserve the Council route per ADR-0005 §G14.
    note_text = " ".join(str(n) for n in notes)
    assert "S012 Q3" in note_text, (
        "skos:scopeNote MUST preserve the S012 Q3 Council ratification route"
    )


def test_has_special_category_data_dct_source_resolves_to_odr_0012(
    tmp_path: Path,
) -> None:
    """Per ADR-0007 §A9 every minted term cites a ratified ODR section."""
    g = _classes_graph(tmp_path)
    sources = list(g.objects(HAS_SCD, DCTERMS.source))
    assert sources, "opda:hasSpecialCategoryData missing dct:source"
    source_uris = {str(s) for s in sources}
    assert any("ODR-0012" in s for s in source_uris), (
        f"dct:source MUST resolve to ODR-0012 §Q5 (Cat 4 ratifying "
        f"clause); got {source_uris}"
    )
