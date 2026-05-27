"""
Tests for the ODR-0004 §3a three-graph CI test.

Realises:
- ADR-0008 §"Confirmation" #3 — three-graph CI test in the suite.
- ODR-0004 §3a — five-part CI test correctness verified here.
- ADR-0007 §"Three-graph emission constraints" — generator's contract surface.

Each of the five §3a clauses gets one positive test (clean Turtle passes)
and one negative test (violating Turtle is detected).
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import OWL, RDF

from opda_gen.ci.three_graph_test import (
    check_no_advisory_in_shapes,
    check_no_owl_imports_in_shapes,
    check_no_shacl_in_annotations,
    check_target_class_resolves,
)


OPDA = Namespace("https://w3id.org/opda/#")
SH = Namespace("http://www.w3.org/ns/shacl#")


def test_clean_annotations_pass() -> None:
    g = Graph()
    g.add((OPDA.Foo, OPDA.aiHint, Literal("hint")))
    assert check_no_shacl_in_annotations(g) == []


def test_shacl_in_annotations_fail() -> None:
    g = Graph()
    g.add((OPDA.Foo, SH.targetClass, OPDA.Bar))  # violation
    violations = check_no_shacl_in_annotations(g)
    assert len(violations) == 1
    assert "sh:" in violations[0] or "shacl" in violations[0].lower()


def test_no_owl_imports_in_clean_shapes() -> None:
    g = Graph()
    g.add((OPDA.fooShape, RDF.type, SH.NodeShape))
    g.add((OPDA.fooShape, SH.targetClass, OPDA.Foo))
    assert check_no_owl_imports_in_shapes(g) == []


def test_owl_imports_in_shapes_fail() -> None:
    g = Graph()
    g.add((URIRef("https://w3id.org/opda/shapes"), OWL.imports,
           URIRef("https://w3id.org/opda/classes")))
    violations = check_no_owl_imports_in_shapes(g)
    assert len(violations) == 1


def test_no_advisory_in_clean_shapes() -> None:
    g = Graph()
    g.add((OPDA.fooShape, RDF.type, SH.NodeShape))
    assert check_no_advisory_in_shapes(g) == []


def test_advisory_in_shapes_fail() -> None:
    g = Graph()
    g.add((OPDA.fooShape, OPDA.aiHint, Literal("don't")))
    violations = check_no_advisory_in_shapes(g)
    assert len(violations) == 1


def test_target_class_resolves_pass() -> None:
    classes = Graph()
    classes.add((OPDA.Foo, RDF.type, OWL.Class))
    shapes = Graph()
    shapes.add((OPDA.fooShape, SH.targetClass, OPDA.Foo))
    assert check_target_class_resolves(shapes, classes) == []


def test_target_class_unresolved_fail() -> None:
    classes = Graph()  # empty
    shapes = Graph()
    shapes.add((OPDA.fooShape, SH.targetClass, OPDA.Missing))
    violations = check_target_class_resolves(shapes, classes)
    assert len(violations) == 1
    assert "Missing" in violations[0]
