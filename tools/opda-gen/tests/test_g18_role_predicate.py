"""
Test g18 role predicate.

Realises:
- ADR-0014 G18 closure — `opda:role` is declared as an
  `owl:DatatypeProperty` in `opda-agent.ttl` with domain
  `opda:RoleMixin` and range `xsd:string` so DASH editors and
  SPARQL queries have a real TBox surface for the BASPI5 profile's
  `sh:path opda:role` constraints. The role-bearing pattern remains
  encoded by opda:Seller / opda:Buyer / opda:Proprietor sub-classes
  of opda:RoleMixin per ODR-0006 §Q2; this predicate exposes the
  notation without overriding the typed encoding.

These tests check the declaration is present, well-formed, and that
its dct:source resolves to ODR-0006 §Q2 (the Role layer ratifying
clause).
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, Literal, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, XSD

from opda_gen.emitters.classes import emit_module


OPDA_ROLE = URIRef("https://w3id.org/opda/#role")
OPDA_ROLE_MIXIN = URIRef("https://w3id.org/opda/#RoleMixin")


def _agent_graph(tmp_path: Path) -> Graph:
    """Emit the opda-agent.ttl and return its parsed graph."""
    emit_module("agent", tmp_path)
    g = Graph()
    g.parse(tmp_path / "opda-agent.ttl", format="turtle")
    return g


def test_opda_role_declared_as_datatype_property(tmp_path: Path) -> None:
    g = _agent_graph(tmp_path)
    assert (OPDA_ROLE, RDF.type, OWL.DatatypeProperty) in g, (
        "opda:role missing owl:DatatypeProperty typing"
    )


def test_opda_role_domain_is_role_mixin(tmp_path: Path) -> None:
    g = _agent_graph(tmp_path)
    domains = list(g.objects(OPDA_ROLE, RDFS.domain))
    assert OPDA_ROLE_MIXIN in domains, (
        f"opda:role rdfs:domain MUST include opda:RoleMixin; got {domains}"
    )


def test_opda_role_range_is_xsd_string(tmp_path: Path) -> None:
    g = _agent_graph(tmp_path)
    ranges = list(g.objects(OPDA_ROLE, RDFS.range))
    assert XSD.string in ranges, (
        f"opda:role rdfs:range MUST include xsd:string; got {ranges}"
    )


def test_opda_role_carries_label_comment(tmp_path: Path) -> None:
    g = _agent_graph(tmp_path)
    labels = list(g.objects(OPDA_ROLE, RDFS.label))
    comments = list(g.objects(OPDA_ROLE, RDFS.comment))
    assert any(isinstance(l, Literal) and l.language == "en"
               for l in labels), "rdfs:label @en missing"
    assert any(isinstance(c, Literal) and c.language == "en"
               for c in comments), "rdfs:comment @en missing"


def test_opda_role_dct_source_resolves_to_odr_0006(tmp_path: Path) -> None:
    """Per ADR-0007 §A9 + ODR-0006 §Q2 (Role layer)."""
    g = _agent_graph(tmp_path)
    sources = list(g.objects(OPDA_ROLE, DCTERMS.source))
    assert sources, "opda:role missing dct:source"
    source_uris = {str(s) for s in sources}
    assert any("ODR-0006" in s for s in source_uris), (
        f"dct:source MUST resolve to ODR-0006 §Q2 (Role layer); "
        f"got {source_uris}"
    )
