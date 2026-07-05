"""
Test ODR-0008 §Q7a base-cardinality clause.

Realises:
- ODR-0008 §Operational specifications Q7a, three-boundary-clause /
  three-CI-test discipline. Test 1 of 3: "`ASK { ?p a
  opda:DescriptiveProperty . ?p sh:minCount ?n . FILTER (?n > 0) }` returns
  FALSE in base `opda-shapes.ttl`" — the base TBox/shapes graph carries
  `0..*` cardinality for every descriptive property; per-form `sh:minCount`
  variation is reserved for the ODR-0010 overlay profile shapes.
- The `opda:DescriptiveProperty` meta-class declared in
  `emitters/foundation.py::build_classes_graph` and applied to the genuine
  ODR-0008 descriptive datatype properties in
  `emitters/modules/property.py` and `emitters/modules/descriptive.py`
  (see each module's `DESCRIPTIVE_PROPERTIES` tuple for scope/exclusion
  rationale).

Query note: the ODR-0008 §Q7a prose gives the ASK query as
`?p a opda:DescriptiveProperty . ?p sh:minCount ?n .` — a direct triple on
the property resource itself. This corpus's SHACL shapes never encode
`sh:minCount` that way; every `sh:minCount` here lives on a `sh:PropertyShape`
(usually a blank node) that reaches the property via `sh:path`. A literal
implementation of the ODR's ASK text would therefore be permanently and
vacuously FALSE — it would never fire even if a real regression added a
base-level `sh:minCount` on a descriptive property via the corpus's actual
SHACL idiom. `_MINCOUNT_ASK` below joins through `sh:path` so the test has
real teeth; `test_ask_query_has_teeth` proves this by round-tripping the
query against clean, zeroed, and corrupted synthetic graphs.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import BNode, Graph, Literal, Namespace
from rdflib.namespace import RDF, XSD

from opda_gen.emitters.foundation import emit_foundation
from opda_gen.emitters.modules import descriptive as descriptive_module
from opda_gen.emitters.modules import property as property_module


OPDA = Namespace("https://opda.org.uk/pdtf/")
SH = Namespace("http://www.w3.org/ns/shacl#")
DESCRIPTIVE_PROPERTY = OPDA.DescriptiveProperty

# Shape-path-aware form of the ODR-0008 §Q7a Test 1 ASK query — see the
# module docstring for why the literal `?p sh:minCount ?n` text would be
# vacuous against this corpus's actual SHACL PropertyShape encoding.
_MINCOUNT_ASK = """
PREFIX opda: <https://opda.org.uk/pdtf/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
ASK {
    ?p a opda:DescriptiveProperty .
    ?shape sh:path ?p ; sh:minCount ?n .
    FILTER (?n > 0)
}
"""


def _base_corpus_graph(tmp_path: Path) -> Graph:
    """Load opda-classes.ttl + opda-shapes.ttl + the property/descriptive
    module graphs — the base (non-overlay) TBox + shapes surface Q7a Test 1
    targets. Overlay profile shapes (source/.../ontology/profiles/*.ttl,
    ODR-0010) are deliberately excluded: they are where per-form
    `sh:minCount` is SUPPOSED to live."""
    written = emit_foundation(tmp_path)
    g = Graph()
    for path in written:
        if path.name in ("opda-classes.ttl", "opda-shapes.ttl"):
            g.parse(path, format="turtle")
    g += property_module.build_graph()
    g += descriptive_module.build_graph()
    return g


def test_descriptive_property_population_is_non_empty(tmp_path: Path) -> None:
    """The test population MUST be non-empty, or Test 1 passing below would
    be a vacuous no-op rather than a real assertion."""
    g = _base_corpus_graph(tmp_path)
    members = set(g.subjects(RDF.type, DESCRIPTIVE_PROPERTY))
    assert len(members) >= 100, (
        f"expected a substantial opda:DescriptiveProperty population "
        f"(property.py + descriptive.py combined); got {len(members)}"
    )


def test_q7a_test1_no_base_mincount_on_descriptive_property(
    tmp_path: Path,
) -> None:
    """ODR-0008 §Q7a Test 1: the ASK query MUST return False against the
    real, combined base corpus (no descriptive property carries a base
    `sh:minCount`)."""
    g = _base_corpus_graph(tmp_path)
    assert bool(g.query(_MINCOUNT_ASK)) is False, (
        "a descriptive property carries a base sh:minCount — per-form "
        "cardinality MUST live only in the ODR-0010 overlay profile shapes"
    )


def test_ask_query_has_teeth() -> None:
    """Prove `_MINCOUNT_ASK` isn't vacuously False for a trivial reason
    (e.g. a namespace mismatch): it MUST flip to True on a synthetic graph
    that reproduces the real base-cardinality regression, and stay False on
    graphs that don't."""
    # Clean: a DescriptiveProperty with no shape at all.
    g_clean = Graph()
    g_clean.add((OPDA.foo, RDF.type, DESCRIPTIVE_PROPERTY))
    assert bool(g_clean.query(_MINCOUNT_ASK)) is False

    # Zeroed: a PropertyShape reaching the property with sh:minCount 0 (the
    # FILTER (?n > 0) MUST exclude this).
    g_zero = Graph()
    g_zero.add((OPDA.foo, RDF.type, DESCRIPTIVE_PROPERTY))
    shape_zero = BNode()
    g_zero.add((shape_zero, SH.path, OPDA.foo))
    g_zero.add((shape_zero, SH.minCount, Literal(0, datatype=XSD.integer)))
    assert bool(g_zero.query(_MINCOUNT_ASK)) is False

    # Non-descriptive: a plain property (not opda:DescriptiveProperty) with
    # a real base sh:minCount 1 MUST NOT trip the query — it is out of
    # Q7a's scope.
    g_other = Graph()
    g_other.add((OPDA.bar, RDF.type, OPDA.SomeOtherKindOfProperty))
    shape_other = BNode()
    g_other.add((shape_other, SH.path, OPDA.bar))
    g_other.add(
        (shape_other, SH.minCount, Literal(1, datatype=XSD.integer))
    )
    assert bool(g_other.query(_MINCOUNT_ASK)) is False

    # Corrupted: a DescriptiveProperty reached by a PropertyShape carrying
    # sh:minCount 1 — the real regression Test 1 exists to catch. MUST
    # flip the ASK to True.
    g_bad = Graph()
    g_bad.add((OPDA.foo, RDF.type, DESCRIPTIVE_PROPERTY))
    shape_bad = BNode()
    g_bad.add((shape_bad, SH.path, OPDA.foo))
    g_bad.add((shape_bad, SH.minCount, Literal(1, datatype=XSD.integer)))
    assert bool(g_bad.query(_MINCOUNT_ASK)) is True
