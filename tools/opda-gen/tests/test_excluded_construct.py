"""
Tests for the ADR-0049 task 4 corpus-wide excluded-construct gate
(`opda_gen.ci.excluded_construct_test`).

Realises:
- ADR-0049 task 4 + ODR-0033 §R2/§R5 — the excluded-construct meta-shape.

Positive controls: a synthetic `owl:unionOf` / `owl:Restriction` / `owl:hasKey`
(and the rest of the excluded set) MUST fail. Negative controls: a clean class
graph passes, and — crucially — a documentary PROSE mention of an excluded
construct inside an annotation literal (the convention note "owl:unionOf is NOT
used") does NOT trip the gate. An integration test asserts the committed corpus
is excluded-construct-free (the gate PASSES today and arms drift protection).
"""

from __future__ import annotations

from pathlib import Path

import pytest
from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.namespace import OWL, RDF, RDFS, SKOS

from opda_gen.ci.excluded_construct_test import (
    check_no_excluded_constructs,
    run_all,
)


OPDA = Namespace("https://opda.org.uk/pdtf/")


def _clean_class_graph() -> Graph:
    """A minimal valid class graph: a class + a property with permitted
    documentary axioms only (rdfs:domain/range, owl:disjointWith)."""
    g = Graph()
    g.add((OPDA.Person, RDF.type, OWL.Class))
    g.add((OPDA.Person, RDFS.label, Literal("Person", lang="en")))
    g.add((OPDA.Organisation, RDF.type, OWL.Class))
    # owl:disjointWith is PERMITTED (documentary-only band) — must NOT fail.
    g.add((OPDA.Person, OWL.disjointWith, OPDA.Organisation))
    g.add((OPDA.hasAddress, RDF.type, OWL.ObjectProperty))
    # rdfs:domain / rdfs:range are PERMITTED documentary axioms — must NOT fail.
    g.add((OPDA.hasAddress, RDFS.domain, OPDA.Person))
    g.add((OPDA.hasAddress, RDFS.range, OPDA.Address))
    return g


def test_clean_class_graph_passes() -> None:
    assert check_no_excluded_constructs(_clean_class_graph()) == []


def test_owl_functionalproperty_is_permitted() -> None:
    """owl:FunctionalProperty is NOT in the corpus-wide excluded set (a narrow
    hand-curated singleton marker is admissible, ODR-0033 §R4)."""
    g = _clean_class_graph()
    g.add((OPDA.someSingleton, RDF.type, OWL.FunctionalProperty))
    assert check_no_excluded_constructs(g) == []


def test_owl_equivalentclass_is_permitted() -> None:
    """owl:equivalentClass / owl:equivalentProperty are documentary-only, not
    excluded corpus-wide (ODR-0033)."""
    g = _clean_class_graph()
    g.add((OPDA.Person, OWL.equivalentClass, OPDA.NaturalPerson))
    g.add((OPDA.hasAddress, OWL.equivalentProperty, OPDA.address))
    assert check_no_excluded_constructs(g) == []


# --- positive controls: each excluded construct MUST fail ---


def test_owl_unionof_fails() -> None:
    g = _clean_class_graph()
    bnode = BNode()
    g.add((OPDA.Party, RDF.type, OWL.Class))
    g.add((OPDA.Party, OWL.unionOf, bnode))
    violations = check_no_excluded_constructs(g)
    assert len(violations) == 1
    assert "owl:unionOf" in violations[0]


def test_owl_restriction_fails() -> None:
    g = _clean_class_graph()
    restriction = BNode()
    g.add((restriction, RDF.type, OWL.Restriction))
    violations = check_no_excluded_constructs(g)
    assert len(violations) == 1
    assert "owl:Restriction" in violations[0]


def test_owl_haskey_fails() -> None:
    g = _clean_class_graph()
    keylist = BNode()
    g.add((OPDA.Person, OWL.hasKey, keylist))
    violations = check_no_excluded_constructs(g)
    assert len(violations) == 1
    assert "owl:hasKey" in violations[0]


def test_owl_inversefunctionalproperty_fails() -> None:
    g = _clean_class_graph()
    g.add((OPDA.uprn, RDF.type, OWL.InverseFunctionalProperty))
    violations = check_no_excluded_constructs(g)
    assert len(violations) == 1
    assert "owl:InverseFunctionalProperty" in violations[0]


def test_owl_cardinality_restrictions_fail() -> None:
    g = _clean_class_graph()
    r = BNode()
    g.add((r, OWL.minCardinality, Literal(1)))
    g.add((r, OWL.maxCardinality, Literal(1)))
    g.add((r, OWL.qualifiedCardinality, Literal(1)))
    violations = check_no_excluded_constructs(g)
    assert len(violations) == 3
    joined = " ".join(violations)
    assert "owl:minCardinality" in joined
    assert "owl:maxCardinality" in joined
    assert "owl:qualifiedCardinality" in joined


def test_owl_intersection_complement_oneof_disjointunion_fail() -> None:
    g = _clean_class_graph()
    g.add((OPDA.A, OWL.intersectionOf, BNode()))
    g.add((OPDA.B, OWL.complementOf, OPDA.C))
    g.add((OPDA.D, OWL.oneOf, BNode()))
    g.add((OPDA.E, OWL.disjointUnionOf, BNode()))
    violations = check_no_excluded_constructs(g)
    assert len(violations) == 4
    joined = " ".join(violations)
    for label in (
        "owl:intersectionOf",
        "owl:complementOf",
        "owl:oneOf",
        "owl:disjointUnionOf",
    ):
        assert label in joined


# --- negative control: a PROSE mention in an annotation literal must NOT trip ---


def test_prose_mention_of_excluded_construct_does_not_fail() -> None:
    """The corpus documents the convention in annotation literals ("owl:unionOf
    is NOT used"). A string literal is an object Literal, never a predicate or a
    typed-as URIRef, so reading the parsed graph excludes prose mentions by
    construction. This is the exact shape that lives in the committed corpus."""
    g = _clean_class_graph()
    g.add(
        (
            OPDA.someProperty,
            SKOS.editorialNote,
            Literal(
                "SHACL sh:or is the authoritative disjunction; owl:unionOf is "
                "NOT used (excluded construct, ODR-0030). No owl:Restriction, "
                "owl:hasKey, or owl:oneOf either.",
                lang="en",
            ),
        )
    )
    g.add(
        (
            OPDA.someProperty,
            RDFS.comment,
            Literal("Authored as AI-signal; owl:InverseFunctionalProperty out.", lang="en"),
        )
    )
    assert check_no_excluded_constructs(g) == []


# --- run_all over a temp dir ---


def test_run_all_reports_missing_foundation(tmp_path: Path) -> None:
    violations = run_all(tmp_path)
    assert any("missing file" in v and "opda-classes.ttl" in v for v in violations)


def test_run_all_clean_tmp_corpus_passes(tmp_path: Path) -> None:
    _clean_class_graph().serialize(
        destination=str(tmp_path / "opda-classes.ttl"), format="turtle"
    )
    assert run_all(tmp_path) == []


def test_run_all_detects_excluded_in_tmp_corpus(tmp_path: Path) -> None:
    g = _clean_class_graph()
    g.add((OPDA.Party, OWL.unionOf, BNode()))
    g.serialize(destination=str(tmp_path / "opda-classes.ttl"), format="turtle")
    violations = run_all(tmp_path)
    assert any("owl:unionOf" in v for v in violations)


# --- integration: the committed corpus is excluded-construct-free ---


def test_committed_corpus_is_excluded_construct_free() -> None:
    """The live corpus PASSES the gate today — zero excluded constructs — which
    is what arms drift protection (ADR-0049 task 4: clean corpus → check passes)."""
    from opda_gen.cli import _default_ontology_dir

    ontology_dir = _default_ontology_dir()
    if not list(ontology_dir.glob("*.ttl")):
        pytest.skip("committed ontology corpus absent")
    assert run_all(ontology_dir) == []
