"""
Tests for the bounded-context scheme emitter (ADR-0026; ODR-0019/0020).

Realises ADR-0026 §Confirmation structural tests:
- exactly one skos:ConceptScheme + six skos:Concepts;
- every concept skos:topConceptOf the scheme (flat);
- opda:consumesFrom declared as owl:AnnotationProperty
  (rdfs:subPropertyOf prov:wasInfluencedBy);
- the ODR-0020 Rule 5 firewall (F1): no subject other than the six
  contexts is skos:inScheme opda:BoundedContextScheme;
- S022-final: NO opda:servesContext / opda:overlaysContext /
  opda:definedInContext predicate appears in the emitted graph.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from rdflib import Graph, Namespace
from rdflib.namespace import OWL, RDF, RDFS, SKOS

from opda_gen.emitters.contexts import CONTEXTS_FILENAME, emit_contexts

OPDA = Namespace("https://opda.org.uk/pdtf/")
PROV = Namespace("http://www.w3.org/ns/prov#")
SCHEME = OPDA.BoundedContextScheme

EXPECTED_CONTEXTS = {
    OPDA.EstateAgencyContext,
    OPDA.ConveyancingContext,
    OPDA.MortgageLendingContext,
    OPDA.SurveyingContext,
    OPDA.PropertyDataServicesContext,
    OPDA.PropertyTechnologyContext,
}


@pytest.fixture()
def graph(tmp_path: Path) -> Graph:
    written = emit_contexts(tmp_path)
    out = tmp_path / CONTEXTS_FILENAME
    assert out in written
    g = Graph()
    g.parse(out, format="turtle")
    return g


def test_exactly_one_scheme(graph: Graph) -> None:
    schemes = list(graph.subjects(RDF.type, SKOS.ConceptScheme))
    assert schemes == [SCHEME]


def test_six_concepts(graph: Graph) -> None:
    concepts = set(graph.subjects(RDF.type, SKOS.Concept))
    assert concepts == EXPECTED_CONTEXTS


def test_every_concept_is_top_concept(graph: Graph) -> None:
    for ctx in EXPECTED_CONTEXTS:
        assert (ctx, SKOS.inScheme, SCHEME) in graph
        assert (ctx, SKOS.topConceptOf, SCHEME) in graph
        assert (ctx, SKOS.prefLabel, None) in graph
        assert (ctx, SKOS.definition, None) in graph
        assert (ctx, OPDA.hasSteward, None) in graph


def test_consumes_from_declared(graph: Graph) -> None:
    assert (OPDA.consumesFrom, RDF.type, OWL.AnnotationProperty) in graph
    assert (OPDA.consumesFrom, RDFS.subPropertyOf, PROV.wasInfluencedBy) in graph


def test_f1_firewall_no_domain_term_in_scheme(graph: Graph) -> None:
    """ODR-0020 Rule 5 firewall: only the six contexts are inScheme."""
    members = set(graph.subjects(SKOS.inScheme, SCHEME))
    assert members == EXPECTED_CONTEXTS


def test_no_retired_predicates(graph: Graph) -> None:
    """S022 retired servesContext / overlaysContext / definedInContext."""
    for retired in (OPDA.servesContext, OPDA.overlaysContext,
                    OPDA.definedInContext):
        assert retired not in set(graph.predicates())
        assert (retired, None, None) not in graph
        assert (None, None, retired) not in graph


def test_byte_identical_second_run(tmp_path: Path) -> None:
    first = emit_contexts(tmp_path)[tmp_path / CONTEXTS_FILENAME]
    second = emit_contexts(tmp_path)[tmp_path / CONTEXTS_FILENAME]
    assert first == second
