"""
Tests for the ADR-0035 §Confirmation ci-inference-closure gate.

Realises:
- ADR-0035 §Confirmation — the inference-closure gate is exercised here on
  the real corpus (PASS, non-empty, subclass propagation present) plus
  negative regressions for each R2 exclusion and the consistency check.
- ODR-0025 §R1/§R2 — the enabled/excluded rule split is what the negative
  tests pin.

The positive test runs against the committed ontology + exemplars. The
negative tests build a minimal in-memory Dataset, materialise, and inject a
violating triple (or a triggering construct) to prove each clause detects it.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Dataset, URIRef

import opda_gen.ci.inference_closure_test as m


def _ontology_dir() -> Path:
    here = Path(m.__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "source" / "03-standards").exists():
            return parent / "source" / "03-standards" / "ontology"
    raise RuntimeError("could not resolve OPDA repo root")


# --- Positive: the real corpus passes and is non-vacuous ---------------------
def test_real_corpus_passes() -> None:
    assert m.run(_ontology_dir()) == []


def test_real_corpus_inferred_graph_non_empty() -> None:
    ds, missing = m._load_asserted(_ontology_dir())
    assert missing == []
    n = m.materialise(ds)
    assert n > 0, "subclass type-propagation should produce inferred triples"


def test_real_corpus_subclass_propagation_present() -> None:
    ds, _ = m._load_asserted(_ontology_dir())
    m.materialise(ds)
    inf = f"GRAPH <{m.ENTAILMENT_GRAPH}>"
    propagated = m._q_count(
        ds,
        f"{inf} {{ ?v rdf:type ?super }} "
        "GRAPH ?ga { ?v rdf:type ?sub } GRAPH ?gb { ?sub rdfs:subClassOf ?super } "
        "FILTER(?sub != ?super)",
    )
    assert propagated > 0


# --- Negative: each R2 exclusion / consistency clause is detected ------------
def _minimal_dataset() -> Dataset:
    """A tiny TBox+ABox that fires subclass type-propagation: Sub ⊑ Super,
    inst a Sub. Loaded into named graphs like the gate expects."""
    ds = Dataset()
    g = ds.graph(URIRef("urn:test:tbox"))
    g.parse(
        data="""
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix ex: <urn:ex:> .
        ex:Sub rdfs:subClassOf ex:Super .
        """,
        format="turtle",
    )
    a = ds.graph(URIRef("urn:test:abox"))
    a.parse(
        data="""
        @prefix ex: <urn:ex:> .
        ex:inst a ex:Sub .
        """,
        format="turtle",
    )
    return ds


def _run_checks_on(ds: Dataset) -> list[str]:
    """Re-run the gate's clause checks on a prepared dataset (mirrors
    run() but skips the file-loading step)."""
    m.materialise(ds)
    violations: list[str] = []
    inf = f"GRAPH <{m.ENTAILMENT_GRAPH}>"
    if m._q_count(ds, f"{inf} {{ ?s ?p ?o }}") == 0:
        violations.append("empty")
    if m._q_count(ds, "GRAPH ?g { ?s owl:sameAs ?o }") > 0:
        violations.append("sameAs")
    if m._q_count(
        ds,
        f"{inf} {{ <https://w3id.org/opda/#EPCCertificate> "
        f"rdf:type <https://w3id.org/opda/#Property> }}",
    ) > 0:
        violations.append("epc")
    if m._q_count(
        ds,
        "GRAPH ?g1 { ?c1 owl:disjointWith ?c2 } "
        "GRAPH ?g2 { ?x rdf:type ?c1 } GRAPH ?g3 { ?x rdf:type ?c2 } "
        "FILTER(?c1 != ?c2)",
    ) > 0:
        violations.append("disjoint")
    return violations


def test_detects_sameas() -> None:
    ds = _minimal_dataset()
    ds.graph(URIRef("urn:test:abox")).parse(
        data="@prefix ex: <urn:ex:> . @prefix owl: <http://www.w3.org/2002/07/owl#> . "
        "ex:a owl:sameAs ex:b .",
        format="turtle",
    )
    assert "sameAs" in _run_checks_on(ds)


def test_detects_spurious_epc_property() -> None:
    # materialise() DROPs+rebuilds the inferred graph, so plant the spurious
    # triple AFTER materialising and assert the R7 regression query catches it.
    ds = _minimal_dataset()
    m.materialise(ds)
    ds.graph(URIRef(m.ENTAILMENT_GRAPH)).parse(
        data="<https://w3id.org/opda/#EPCCertificate> "
        "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> "
        "<https://w3id.org/opda/#Property> .",
        format="turtle",
    )
    inf = f"GRAPH <{m.ENTAILMENT_GRAPH}>"
    epc = m._q_count(
        ds,
        f"{inf} {{ <https://w3id.org/opda/#EPCCertificate> "
        f"rdf:type <https://w3id.org/opda/#Property> }}",
    )
    assert epc > 0


def test_detects_disjointness_violation() -> None:
    ds = _minimal_dataset()
    ds.graph(URIRef("urn:test:tbox")).parse(
        data="@prefix ex: <urn:ex:> . @prefix owl: <http://www.w3.org/2002/07/owl#> . "
        "ex:Cat owl:disjointWith ex:Dog .",
        format="turtle",
    )
    ds.graph(URIRef("urn:test:abox")).parse(
        data="@prefix ex: <urn:ex:> . ex:pet a ex:Cat, ex:Dog .",
        format="turtle",
    )
    assert "disjoint" in _run_checks_on(ds)


def test_inverse_guard_closes_both_directions() -> None:
    """When the model DOES declare and use owl:inverseOf, the gate's
    conditional guard must see both directions materialised (i.e. produce
    no violation)."""
    ds = Dataset()
    ds.graph(URIRef("urn:test:tbox")).parse(
        data="@prefix ex: <urn:ex:> . @prefix owl: <http://www.w3.org/2002/07/owl#> . "
        "ex:parentOf owl:inverseOf ex:childOf .",
        format="turtle",
    )
    ds.graph(URIRef("urn:test:abox")).parse(
        data="@prefix ex: <urn:ex:> . ex:alice ex:parentOf ex:bob .",
        format="turtle",
    )
    m.materialise(ds)
    inf = f"GRAPH <{m.ENTAILMENT_GRAPH}>"
    # The inverse (bob childOf alice) must be in the inferred graph.
    closed = m._q_count(
        ds, f"{inf} {{ <urn:ex:bob> <urn:ex:childOf> <urn:ex:alice> }}"
    )
    assert closed == 1


def test_transitive_guard_chain_closes() -> None:
    """When the model DOES declare a transitive property with a chain, the
    closure must produce the shortcut triple."""
    ds = Dataset()
    ds.graph(URIRef("urn:test:tbox")).parse(
        data="@prefix ex: <urn:ex:> . @prefix owl: <http://www.w3.org/2002/07/owl#> . "
        "ex:ancestorOf a owl:TransitiveProperty .",
        format="turtle",
    )
    ds.graph(URIRef("urn:test:abox")).parse(
        data="@prefix ex: <urn:ex:> . ex:a ex:ancestorOf ex:b . ex:b ex:ancestorOf ex:c .",
        format="turtle",
    )
    m.materialise(ds)
    inf = f"GRAPH <{m.ENTAILMENT_GRAPH}>"
    closed = m._q_count(
        ds, f"{inf} {{ <urn:ex:a> <urn:ex:ancestorOf> <urn:ex:c> }}"
    )
    assert closed == 1
