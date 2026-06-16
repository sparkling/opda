"""
Test g18 role predicate.

Realises:
- ADR-0014 G18 closure — `opda:roleNotation` is declared in
  `opda-agent.ttl` with domain `opda:RoleMixin` so DASH editors and
  SPARQL queries have a real TBox surface for the BASPI5 profile's
  `sh:path opda:roleNotation` constraints. Council-046 Q3b retyped it
  to `owl:ObjectProperty` / range `skos:Concept` (coded values are
  concept IRIs from opda:RoleScheme, joining via skos:inScheme like
  every other coded property). The role-bearing pattern remains
  encoded by opda:Seller / opda:Buyer / opda:Proprietor sub-classes
  of opda:RoleMixin per ODR-0006 §Q2; this predicate exposes the
  role concept without overriding the typed encoding.

These tests check the declaration is present, well-formed, and that
its dct:source resolves to ODR-0006 §Q2 (the Role layer ratifying
clause).
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, Literal, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS

from opda_gen.emitters.classes import emit_module


OPDA_ROLE = URIRef("https://opda.org.uk/pdtf/roleNotation")
OPDA_ROLE_MIXIN = URIRef("https://opda.org.uk/pdtf/RoleMixin")


def _agent_graph(tmp_path: Path) -> Graph:
    """Emit the opda-agent.ttl and return its parsed graph."""
    emit_module("agent", tmp_path)
    g = Graph()
    g.parse(tmp_path / "opda-agent.ttl", format="turtle")
    return g


def test_opda_role_declared_as_object_property(tmp_path: Path) -> None:
    # Council-046 Q3b: retyped DatatypeProperty(xsd:string) -> ObjectProperty(skos:Concept).
    g = _agent_graph(tmp_path)
    assert (OPDA_ROLE, RDF.type, OWL.ObjectProperty) in g, (
        "opda:roleNotation missing owl:ObjectProperty typing (Council-046 Q3b)"
    )


def test_opda_role_domain_is_role_mixin(tmp_path: Path) -> None:
    g = _agent_graph(tmp_path)
    domains = list(g.objects(OPDA_ROLE, RDFS.domain))
    assert OPDA_ROLE_MIXIN in domains, (
        f"opda:roleNotation rdfs:domain MUST include opda:RoleMixin; got {domains}"
    )


def test_opda_role_range_is_skos_concept(tmp_path: Path) -> None:
    # Council-046 Q3b: range is skos:Concept (concept-IRI coded values).
    g = _agent_graph(tmp_path)
    ranges = list(g.objects(OPDA_ROLE, RDFS.range))
    assert SKOS.Concept in ranges, (
        f"opda:roleNotation rdfs:range MUST include skos:Concept "
        f"(Council-046 Q3b); got {ranges}"
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
    assert sources, "opda:roleNotation missing dct:source"
    source_uris = {str(s) for s in sources}
    assert any("ODR-0006" in s for s in source_uris), (
        f"dct:source MUST resolve to ODR-0006 §Q2 (Role layer); "
        f"got {source_uris}"
    )
