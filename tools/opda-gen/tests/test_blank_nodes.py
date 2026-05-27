"""
Tests for blank-node skolemisation.

Realises:
- ADR-0008 §"Confirmation" #3 — blank-node determinism test in the suite.
- ADR-0007 §"Deterministic emission rules" #4 — SHA-256 skolemisation
  invariants verified here.
- ODR-0004 §6a #1 — blank nodes skolemised by SHA-256 of canonical N-Triples
  form (recursive for nested blanks).

Invariants:
  - structurally-identical blank-node sub-graphs produce identical skolems.
  - structurally-distinct sub-graphs produce different skolems.
  - skolem labels are prefixed `_:b` with 12 hex chars.
"""

from __future__ import annotations

from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.namespace import RDF

from opda_gen.serialiser.blank_nodes import skolem_label, skolemise


EX = Namespace("https://example.invalid/")


def _build_with_blank(payload_value: str) -> tuple[Graph, BNode]:
    g = Graph()
    g.bind("ex", EX)
    blank = BNode()
    g.add((EX.subject, EX.has, blank))
    g.add((blank, RDF.type, EX.Annotation))
    g.add((blank, EX.value, Literal(payload_value)))
    return g, blank


def test_structurally_identical_blanks_match() -> None:
    g1, b1 = _build_with_blank("hello")
    g2, b2 = _build_with_blank("hello")
    skolems1 = skolemise(g1)
    skolems2 = skolemise(g2)
    assert skolems1[b1] == skolems2[b2]


def test_structurally_distinct_blanks_differ() -> None:
    g1, b1 = _build_with_blank("hello")
    g2, b2 = _build_with_blank("world")
    skolems1 = skolemise(g1)
    skolems2 = skolemise(g2)
    assert skolems1[b1] != skolems2[b2]


def test_skolem_label_format() -> None:
    g, b = _build_with_blank("hello")
    skolems = skolemise(g)
    label = skolem_label(skolems[b])
    assert label.startswith("_:b")
    assert len(label) == len("_:b") + 12
    hex_part = label[len("_:b"):]
    int(hex_part, 16)  # raises ValueError if not hex


def test_nested_blank_recursive_determinism() -> None:
    """A blank that points to another blank still hashes deterministically
    across runs."""
    def build_nested() -> tuple[Graph, BNode, BNode]:
        g = Graph()
        g.bind("ex", EX)
        outer = BNode()
        inner = BNode()
        g.add((EX.subject, EX.has, outer))
        g.add((outer, EX.contains, inner))
        g.add((inner, RDF.type, EX.Leaf))
        g.add((inner, EX.value, Literal(42)))
        return g, outer, inner

    g1, o1, i1 = build_nested()
    g2, o2, i2 = build_nested()
    s1 = skolemise(g1)
    s2 = skolemise(g2)
    assert s1[o1] == s2[o2]
    assert s1[i1] == s2[i2]
