"""
Tests for the ADR-0049 decision-4 annotation-coverage gates
(`opda_gen.ci.description_coverage_test`): ci-description-coverage
(`skos:definition`@en) and ci-isDefinedBy (`rdfs:isDefinedBy` → `owl:Ontology`).

Realises:
- ADR-0049 decision 4 — warning-first → violation coverage gates.

The pure `build_*_report` helpers are exercised on hand-built graphs: a fully
covered graph reports `is_complete` (the warning→violation flip); a partial
graph reports the precise gap list. An integration test pins the current
committed-corpus coverage numbers (both gates are at 0% today → warning+gaps).
"""

from __future__ import annotations

import pytest
from rdflib import Graph, Literal, Namespace
from rdflib.namespace import OWL, RDF, RDFS, SKOS

from opda_gen.ci.description_coverage_test import (
    build_description_report,
    build_isdefinedby_report,
)


OPDA = Namespace("https://opda.org.uk/pdtf/")
ONT = Namespace("https://opda.org.uk/pdtf/graph/")


def _term_graph(*, with_definition: bool, with_isdefinedby: bool) -> Graph:
    """A class + a property; optionally annotated with skos:definition@en and
    rdfs:isDefinedBy → an owl:Ontology."""
    g = Graph()
    g.add((ONT.agent, RDF.type, OWL.Ontology))
    for term, ttype in ((OPDA.Person, OWL.Class), (OPDA.hasAddress, OWL.ObjectProperty)):
        g.add((term, RDF.type, ttype))
        g.add((term, RDFS.label, Literal("label", lang="en")))
        if with_definition:
            g.add((term, SKOS.definition, Literal("A definition.", lang="en")))
        if with_isdefinedby:
            g.add((term, RDFS.isDefinedBy, ONT.agent))
    return g


# --- ci-description-coverage ---


def test_description_full_coverage_is_complete() -> None:
    report = build_description_report(
        _term_graph(with_definition=True, with_isdefinedby=False)
    )
    assert report.total == 2
    assert report.covered == 2
    assert report.gaps == ()
    assert report.is_complete


def test_description_gap_lists_uncovered_terms() -> None:
    g = _term_graph(with_definition=False, with_isdefinedby=False)
    report = build_description_report(g)
    assert report.total == 2
    assert report.covered == 0
    assert not report.is_complete
    assert set(report.gaps) == {"opda:Person", "opda:hasAddress"}


def test_description_non_en_definition_is_a_gap() -> None:
    """A skos:definition without @en does not count (hm ODR-0042 is @en-keyed)."""
    g = Graph()
    g.add((OPDA.Person, RDF.type, OWL.Class))
    g.add((OPDA.Person, SKOS.definition, Literal("Sans langue")))  # no @en
    report = build_description_report(g)
    assert report.covered == 0
    assert report.gaps == ("opda:Person",)


def test_description_counts_all_property_kinds() -> None:
    g = Graph()
    g.add((OPDA.C, RDF.type, OWL.Class))
    g.add((OPDA.op, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.dp, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.ap, RDF.type, OWL.AnnotationProperty))
    report = build_description_report(g)
    assert report.total == 4  # 1 class + 3 property kinds


# --- ci-isDefinedBy ---


def test_isdefinedby_full_coverage_is_complete() -> None:
    report = build_isdefinedby_report(
        _term_graph(with_definition=False, with_isdefinedby=True)
    )
    assert report.total == 2
    assert report.covered == 2
    assert report.is_complete


def test_isdefinedby_requires_target_typed_ontology() -> None:
    """rdfs:isDefinedBy pointing at a subject NOT typed owl:Ontology is a gap."""
    g = Graph()
    g.add((OPDA.Person, RDF.type, OWL.Class))
    g.add((OPDA.Person, RDFS.isDefinedBy, OPDA.NotAnOntology))  # target untyped
    report = build_isdefinedby_report(g)
    assert report.covered == 0
    assert report.gaps == ("opda:Person",)


def test_isdefinedby_gap_lists_uncovered_terms() -> None:
    report = build_isdefinedby_report(
        _term_graph(with_definition=True, with_isdefinedby=False)
    )
    assert report.covered == 0
    assert set(report.gaps) == {"opda:Person", "opda:hasAddress"}


# --- integration: pin the current committed-corpus coverage numbers ---


def test_committed_corpus_coverage_baseline() -> None:
    """Both decision-4 gates are at 0% in the committed corpus today (the corpus
    uses rdfs:comment@en + skos:scopeNote@en, not skos:definition@en, and
    carries no rdfs:isDefinedBy). They therefore ship as warning+gaps; this test
    pins that baseline so a future emitter backfill (which would change the TTL)
    is a deliberate, visible move that updates this assertion."""
    from opda_gen.ci.description_coverage_test import (
        run_description_coverage,
        run_isdefinedby,
    )
    from opda_gen.cli import _default_ontology_dir

    ontology_dir = _default_ontology_dir()
    if not list(ontology_dir.glob("*.ttl")):
        pytest.skip("committed ontology corpus absent")

    desc = run_description_coverage(ontology_dir)
    idb = run_isdefinedby(ontology_dir)
    assert desc is not None and idb is not None
    # Warning-first today: gaps remain, so neither is complete.
    assert not desc.is_complete
    assert not idb.is_complete
    # Every term is a gap (0% coverage) — the corpus has not adopted these
    # annotation patterns yet. (Bound as <= total, not pinned to an exact count,
    # so adding a term with a definition doesn't spuriously fail this gate.)
    assert desc.covered == 0
    assert idb.covered == 0
    assert desc.total > 0 and idb.total > 0
