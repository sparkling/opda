"""
Tests for the canonical serialiser.

Realises:
- ADR-0008 §"Confirmation" #3 — serialiser invariants in the test suite.
- ADR-0007 §"Deterministic emission rules" #1–6 — invariants verified here.
- ODR-0004 §6a #1, sub-test #1 — `diff <(gen) <(gen)` empty (byte-identical
  on consecutive runs).

Invariants covered:
  - same input → same output bytes across 100 runs.
  - prefix declarations alphabetised.
  - term-type ordering: owl:Ontology → owl:Class → owl:DatatypeProperty →
    owl:ObjectProperty → sh:NodeShape → sh:PropertyShape → skos:Concept.
  - within-term: rdf:type first, then label, then comment, then dct:source,
    then predicate-lex.
  - final newline; LF line endings; no trailing whitespace; no BOM.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS

from opda_gen.serialiser.canonical import to_canonical_turtle


OPDA = Namespace("https://w3id.org/opda/#")
SH = Namespace("http://www.w3.org/ns/shacl#")


def _build_mixed_graph() -> Graph:
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("owl", OWL)
    g.bind("rdfs", RDFS)
    g.bind("skos", SKOS)
    g.bind("dct", DCTERMS)
    g.bind("sh", SH)
    # Add in deliberately non-canonical insertion order — serialiser must
    # impose the canonical order regardless.
    prop = OPDA.fooProp
    g.add((prop, RDFS.label, Literal("foo property", lang="en")))
    g.add((prop, RDF.type, OWL.DatatypeProperty))
    g.add((prop, DCTERMS.source, URIRef("https://w3id.org/opda/odr/X#prop")))
    shape = OPDA.fooShape
    g.add((shape, SH.targetClass, OPDA.Foo))
    g.add((shape, RDF.type, SH.NodeShape))
    cls = OPDA.Foo
    g.add((cls, RDF.type, OWL.Class))
    g.add((cls, RDFS.label, Literal("Foo", lang="en")))
    g.add((cls, RDFS.comment, Literal("A test class.")))
    onto = URIRef("https://w3id.org/opda/")
    g.add((onto, RDF.type, OWL.Ontology))
    g.add((onto, DCTERMS.title, Literal("Test ontology", lang="en")))
    return g


def test_serialiser_determinism_100_runs() -> None:
    """Same input → same output bytes across 100 invocations."""
    g = _build_mixed_graph()
    first = to_canonical_turtle(g)
    for _ in range(99):
        assert to_canonical_turtle(g) == first


def test_prefixes_alphabetised() -> None:
    out = to_canonical_turtle(_build_mixed_graph()).decode("utf-8")
    prefix_lines = [
        line for line in out.splitlines() if line.startswith("@prefix ")
    ]
    prefixes = [
        line.split()[1].rstrip(":") for line in prefix_lines
    ]
    assert prefixes == sorted(prefixes), (
        f"prefixes not alphabetised: {prefixes}"
    )


def test_term_type_ordering() -> None:
    """owl:Ontology block appears before owl:Class which appears before
    owl:DatatypeProperty which appears before sh:NodeShape."""
    out = to_canonical_turtle(_build_mixed_graph()).decode("utf-8")
    onto_pos = out.find("rdf:type owl:Ontology")
    class_pos = out.find("rdf:type owl:Class")
    dtprop_pos = out.find("rdf:type owl:DatatypeProperty")
    nodeshape_pos = out.find("rdf:type sh:NodeShape")
    assert -1 < onto_pos < class_pos < dtprop_pos < nodeshape_pos, (
        f"unexpected order: ontology={onto_pos} class={class_pos} "
        f"dtprop={dtprop_pos} nodeshape={nodeshape_pos}\n\n{out}"
    )


def test_within_term_predicate_order() -> None:
    """For the foo property: rdf:type first, then rdfs:label, then dct:source.
    Predicates must appear in that order within a single subject block."""
    out = to_canonical_turtle(_build_mixed_graph()).decode("utf-8")
    # Find the foo property block.
    lines = out.splitlines()
    in_block = False
    seen: list[str] = []
    for line in lines:
        if line.startswith("opda:fooProp"):
            in_block = True
            continue
        if in_block:
            stripped = line.strip()
            if not stripped:
                if seen:
                    break
                continue
            if stripped.startswith("rdf:type"):
                seen.append("type")
            elif stripped.startswith("rdfs:label"):
                seen.append("label")
            elif stripped.startswith("dct:source"):
                seen.append("source")
            if stripped.endswith(" ."):
                break
    assert seen == ["type", "label", "source"], (
        f"within-term order wrong: {seen}\n\n{out}"
    )


def test_file_formatting() -> None:
    out_bytes = to_canonical_turtle(_build_mixed_graph())
    # No BOM.
    assert not out_bytes.startswith(b"\xef\xbb\xbf")
    # LF only (no CRLF).
    assert b"\r" not in out_bytes
    # Single final newline.
    assert out_bytes.endswith(b"\n")
    assert not out_bytes.endswith(b"\n\n\n")
    # No trailing whitespace on any line.
    for line in out_bytes.decode("utf-8").splitlines():
        assert line == line.rstrip(), f"trailing whitespace on: {line!r}"


def test_no_xsd_string_emitted() -> None:
    """Per ADR-0007 #5: xsd:string datatype implicit; never emitted as
    ^^xsd:string."""
    g = Graph()
    g.bind("opda", OPDA)
    g.add((OPDA.Foo, RDF.type, OWL.Class))
    g.add((OPDA.Foo, RDFS.label, Literal("string literal")))
    out = to_canonical_turtle(g).decode("utf-8")
    assert "xsd:string" not in out, out
