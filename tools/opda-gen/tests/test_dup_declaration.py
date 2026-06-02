"""
Tests for the cross-module duplicate-declaration CI gate.

Realises:
- ODR-0004 §3a (sibling gate) — every `opda:` term is declared in exactly
  one module TTL; correctness verified here.
- ADR-0011 §"Module emission template" — the per-module TBoxes partition the
  OPDA term space.

Motivating regression: `opda:riskIndicator` was once declared in BOTH
`opda-property.ttl` (owl:DatatypeProperty, rdfs:domain opda:Property) and
`opda-descriptive.ttl` (a Quale on opda:RiskAssessment) with conflicting
rdfs:domain, and slipped past byte-identity + three-graph CI. The synthetic-
duplicate test below reproduces the shape of that defect; the clean-corpus
tests assert the live corpus is now single-declared.

Structure mirrors test_three_graph.py: a positive (clean passes) and a
negative (violating is detected) unit test on the check functions, plus
integration tests over both a freshly-emitted corpus and the real committed
ontology directory.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import OWL, RDF, RDFS, SKOS

from opda_gen.ci.dup_declaration_test import (
    check_cross_module_duplicates,
    declared_opda_terms,
    run_all,
)


OPDA = Namespace("https://opda.org.uk/pdtf/")
OPDA_SCHEME = Namespace("https://opda.org.uk/pdtf/scheme/")
OPDA_SHAPE = Namespace("https://opda.org.uk/pdtf/shape/")
SH = Namespace("http://www.w3.org/ns/shacl#")


# --- declared_opda_terms: declarations vs references ----------------------
def test_declared_opda_terms_collects_subject_of_counted_type() -> None:
    g = Graph()
    g.add((OPDA.Foo, RDF.type, OWL.Class))
    g.add((OPDA.bar, RDF.type, OWL.DatatypeProperty))
    declared = declared_opda_terms(g)
    assert set(declared) == {OPDA.Foo, OPDA.bar}
    assert declared[OPDA.Foo] == {OWL.Class}


def test_declared_opda_terms_ignores_references() -> None:
    """A term used only as an object, or in rdfs:domain / sh:path, is a
    *reference* — not a declaration — and must not be collected.
    """
    g = Graph()
    # opda:Property appears only as an rdfs:domain object here.
    g.add((OPDA.bar, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.bar, RDFS.domain, OPDA.Property))
    g.add((OPDA.bar, RDFS.range, OPDA.SomeRange))
    # opda:fooShape references opda:Foo via sh:path / sh:targetClass.
    g.add((OPDA_SHAPE.fooShape, SH.path, OPDA.Foo))
    g.add((OPDA_SHAPE.fooShape, SH.targetClass, OPDA.Foo))
    declared = declared_opda_terms(g)
    assert set(declared) == {OPDA.bar}
    assert OPDA.Property not in declared
    assert OPDA.Foo not in declared
    assert OPDA.SomeRange not in declared


def test_declared_opda_terms_excludes_owl_ontology_header() -> None:
    """The module's own ontology IRI (typed owl:Ontology) is the module
    header, not a term declaration — it must not be collected.
    """
    g = Graph()
    g.add((OPDA[""], RDF.type, OWL.Ontology))
    g.add((OPDA.Foo, RDF.type, OWL.Class))
    declared = declared_opda_terms(g)
    assert set(declared) == {OPDA.Foo}


def test_declared_opda_terms_scopes_to_opda_namespace() -> None:
    """Only `opda:` subjects count — an externally-namespaced subject typed
    in our corpus is out of scope for this gate.
    """
    g = Graph()
    g.add((URIRef("https://w3id.org/dpv#Concept"), RDF.type, SKOS.Concept))
    g.add((OPDA_SCHEME.localScheme, RDF.type, SKOS.ConceptScheme))
    declared = declared_opda_terms(g)
    assert set(declared) == {OPDA_SCHEME.localScheme}


# --- check_cross_module_duplicates: the invariant -------------------------
def test_clean_corpus_no_duplicates_passes() -> None:
    """Each opda: term declared in exactly one module → PASS."""
    mod_a = {OPDA.Foo: {OWL.Class}}
    mod_b = {OPDA.bar: {OWL.DatatypeProperty}}
    assert check_cross_module_duplicates(
        {"opda-a.ttl": mod_a, "opda-b.ttl": mod_b}
    ) == []


def test_synthetic_duplicate_declaration_fails() -> None:
    """Regression guard: reproduces the shape of the opda:riskIndicator
    defect — the same opda: term typed owl:DatatypeProperty in two modules.
    The check must FAIL and name the term and both modules.
    """
    # opda:foo stands in for opda:riskIndicator: declared in two modules.
    mod_property = {OPDA.foo: {OWL.DatatypeProperty}}
    mod_descriptive = {OPDA.foo: {OWL.DatatypeProperty}}
    violations = check_cross_module_duplicates(
        {
            "opda-property.ttl": mod_property,
            "opda-descriptive.ttl": mod_descriptive,
        }
    )
    assert len(violations) == 1
    assert str(OPDA.foo) in violations[0]
    assert "opda-property.ttl" in violations[0]
    assert "opda-descriptive.ttl" in violations[0]


def test_synthetic_duplicate_via_real_graphs_fails() -> None:
    """End-to-end on two small in-memory rdflib graphs: opda:foo is typed
    owl:DatatypeProperty in both. Mirrors the riskIndicator case (which had
    conflicting rdfs:domain across opda-property.ttl and opda-descriptive.ttl).
    """
    g_property = Graph()
    g_property.add((OPDA.foo, RDF.type, OWL.DatatypeProperty))
    g_property.add((OPDA.foo, RDFS.domain, OPDA.Property))  # conflicting domain

    g_descriptive = Graph()
    g_descriptive.add((OPDA.foo, RDF.type, OWL.DatatypeProperty))
    g_descriptive.add(
        (OPDA.foo, RDFS.domain, OPDA.RiskAssessment)  # conflicting domain
    )

    violations = check_cross_module_duplicates(
        {
            "opda-property.ttl": declared_opda_terms(g_property),
            "opda-descriptive.ttl": declared_opda_terms(g_descriptive),
        }
    )
    assert len(violations) == 1
    assert str(OPDA.foo) in violations[0]


def test_distinct_terms_per_module_pass() -> None:
    """A term referenced (rdfs:domain / sh:path) in another module but
    declared in only one must not be flagged — exercises the reference/
    declaration distinction end-to-end through the graph layer.
    """
    g_property = Graph()
    g_property.add((OPDA.someProp, RDF.type, OWL.DatatypeProperty))
    g_property.add((OPDA.someProp, RDFS.domain, OPDA.Property))

    g_descriptive = Graph()
    # Re-uses opda:someProp only as an sh:path reference — NOT a declaration.
    g_descriptive.add((OPDA.shape, SH.path, OPDA.someProp))
    g_descriptive.add((OPDA.RiskAssessment, RDF.type, OWL.Class))

    assert check_cross_module_duplicates(
        {
            "opda-property.ttl": declared_opda_terms(g_property),
            "opda-descriptive.ttl": declared_opda_terms(g_descriptive),
        }
    ) == []


# --- run_all over emitted + committed corpora -----------------------------
def test_run_all_clean_on_freshly_emitted_corpus(tmp_path: Path) -> None:
    """The check PASSES on a freshly-emitted corpus (hermetic, emitter-driven
    — mirrors how test_byte_identity seeds its fixture)."""
    from opda_gen.emitters.annotations import emit_annotations
    from opda_gen.emitters.classes import emit_all_modules
    from opda_gen.emitters.contexts import emit_contexts
    from opda_gen.emitters.foundation import emit_foundation
    from opda_gen.emitters.shapes import emit_shapes
    from opda_gen.emitters.vocabularies import emit_vocabularies

    emit_foundation(tmp_path)
    emit_vocabularies(tmp_path)
    emit_contexts(tmp_path)
    emit_all_modules(tmp_path)
    emit_shapes(tmp_path)
    emit_annotations(tmp_path)

    violations = run_all(tmp_path)
    assert violations == [], (
        f"freshly-emitted corpus should have no duplicate declarations, "
        f"got: {violations}"
    )


def test_run_all_clean_on_committed_corpus() -> None:
    """The check PASSES on the real committed source/03-standards/ontology/
    corpus (the riskIndicator duplicate is already fixed).

    Per the brief: if this does NOT pass, a real latent duplicate exists —
    the gate must surface it, not be weakened. The assertion message prints
    any duplicate so the failure is self-documenting.
    """
    from opda_gen.cli import _default_ontology_dir

    ontology_dir = _default_ontology_dir()
    violations = run_all(ontology_dir)
    assert violations == [], (
        "committed corpus has cross-module duplicate declaration(s) — "
        f"investigate before weakening the gate: {violations}"
    )
