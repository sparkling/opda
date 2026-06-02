"""
Tests for the canonical serialiser.

Realises:
- ADR-0008 §"Confirmation" #3 — serialiser invariants in the test suite.
- ADR-0009 follow-up G2 — Literal-lexical-value prefix-filter scan; added
  here so the foundation header's `sh:namespace "..."^^xsd:anyURI` doesn't
  silently drop the opda prefix from a header-only graph.
- ADR-0009 follow-up G7 (closed by ADR-0010 worker) — prefix-filter edge
  case for URLs embedded inside `skos:scopeNote @en` Literals (ADR-0010
  regulator-cited schemes hold gov.uk URLs in their scope-notes; the
  scan MUST NOT bind a `gov.uk` prefix because that namespace is not bound
  on the graph). Two regression tests below cement the contract.
- ADR-0007 §"Deterministic emission rules" #1–6 — invariants verified here.
- ODR-0004 §6a #1, sub-test #1 — `diff <(gen) <(gen)` empty (byte-identical
  on consecutive runs).

Invariants covered:
  - same input → same output bytes across 100 runs.
  - prefix declarations alphabetised.
  - term-type ordering: owl:Ontology → owl:Class → owl:DatatypeProperty →
    owl:ObjectProperty → sh:NodeShape → sh:PropertyShape →
    skos:ConceptScheme → skos:Concept.
  - within-term: rdf:type first, then label, then comment, then dct:source,
    then predicate-lex.
  - final newline; LF line endings; no trailing whitespace; no BOM.
  - Literal-IRI lexical values trigger prefix retention (G2 follow-up).
  - Literal-IRI lexical values for unbound namespaces DO NOT bind a new
    prefix (G7 follow-up — closes ADR-0005 §G G7).
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS

from opda_gen.serialiser.canonical import to_canonical_turtle


OPDA = Namespace("https://opda.org.uk/pdtf/")
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


def test_literal_iri_lexical_value_retains_prefix() -> None:
    """G2 follow-up: Literal lexical values that start with http/https
    contribute to the referenced-IRI set so the canonical serialiser
    retains the bound prefix.

    Scenario: an ontology header with `sh:namespace "https://opda.org.uk/pdtf/"
    ^^xsd:anyURI` is the ONLY reference to the opda namespace string. Before
    G2, the opda prefix would be filtered out because the URIRef set
    contained `https://w3id.org/opda/` (no trailing `#`) which does not
    `startswith("https://opda.org.uk/pdtf/")`. After G2, the literal's lexical
    value joins the referenced-IRI set and the opda prefix survives.
    """
    from rdflib.namespace import XSD as _XSD

    g = Graph()
    # Bind opda but DON'T use any opda-prefixed URIRef — only the literal
    # carries the namespace string.
    g.bind("opda", OPDA)
    g.bind("sh", SH)
    g.bind("xsd", _XSD)
    onto = URIRef("https://w3id.org/opda/")
    g.add((onto, RDF.type, OWL.Ontology))
    g.add((onto, SH.namespace, Literal(
        "https://opda.org.uk/pdtf/", datatype=_XSD.anyURI
    )))
    out = to_canonical_turtle(g).decode("utf-8")
    # The opda prefix MUST appear in the output because the literal lexical
    # value referenced its namespace.
    assert "@prefix opda:" in out, (
        "opda prefix was filtered out despite Literal-IRI reference:\n" + out
    )


def test_non_iri_literals_do_not_pollute_prefix_set() -> None:
    """G2 follow-up regression: a plain string Literal that does NOT start
    with http/https MUST NOT trigger spurious prefix retention.

    Scenario: a label like `"opda"` (no scheme prefix) should not cause any
    extra prefix to be retained — the Literal-scan only activates for
    http/https-prefixed lexical values.
    """
    g = Graph()
    g.bind("opda", OPDA)  # bound but not referenced
    g.bind("owl", OWL)
    onto = URIRef("https://example.invalid/o")
    g.add((onto, RDF.type, OWL.Ontology))
    g.add((onto, RDFS.label, Literal("opda")))  # plain string, not an IRI
    g.bind("rdfs", RDFS)
    out = to_canonical_turtle(g).decode("utf-8")
    # opda namespace is not referenced by anything; the plain "opda" string
    # must not get treated as an IRI-shaped value.
    assert "@prefix opda:" not in out, (
        "plain string literal incorrectly triggered prefix retention:\n" + out
    )


# --- G7 follow-up: URLs embedded in @en-language Literals ----------------
def test_literal_url_inside_scope_note_does_not_bind_new_prefix() -> None:
    """G7 follow-up (closes ADR-0005 §G G7).

    Scenario: ADR-0010 regulator-cited schemes carry sentences like
    `"... published at https://www.gov.uk/council-tax-bands."@en` in their
    `skos:scopeNote`. The G2 prefix-filter scan retains a bound prefix
    when the prefix's namespace IS referenced anywhere in the graph.
    `gov.uk` is not bound (the graph never registered a `gov-uk` prefix),
    so the scan MUST NOT invent a new binding.

    The contract: only prefixes ALREADY BOUND on the graph are eligible
    for retention; the Literal-IRI scan widens the *reference set* but
    never the *binding set*. This test confirms that contract by
    asserting no `@prefix` line points at any gov.uk-rooted namespace.
    """
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("skos", SKOS)
    scheme = URIRef("https://opda.org.uk/pdtf/TestScheme")
    g.add((scheme, RDF.type, URIRef("http://www.w3.org/2004/02/skos/core#ConceptScheme")))
    g.add((scheme, SKOS.scopeNote, Literal(
        "Verbatim source: VOA council-tax bands published at "
        "https://www.gov.uk/council-tax-bands.",
        lang="en",
    )))
    out = to_canonical_turtle(g).decode("utf-8")
    for line in out.splitlines():
        if line.startswith("@prefix "):
            assert "gov.uk" not in line, (
                f"unbound gov.uk namespace bound by Literal scan: {line!r}"
            )
        # And the opda prefix MUST appear (the scheme IRI references it).
    assert "@prefix opda:" in out


def test_literal_url_lexical_value_does_not_bind_unbound_namespace() -> None:
    """G7 follow-up — second negative case.

    Scenario variant: a Literal whose lexical value IS exactly a URL
    (no surrounding prose) in a namespace that no prefix is bound to.
    The scan adds the URL to the referenced-IRI set, but no bound
    prefix matches it (gov.uk is not bound), so no `@prefix gov.uk:`
    appears in output.
    """
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("skos", SKOS)
    scheme = URIRef("https://opda.org.uk/pdtf/OtherScheme")
    g.add((scheme, RDF.type, URIRef("http://www.w3.org/2004/02/skos/core#ConceptScheme")))
    # Literal lexical value is just the URL — the most aggressive case.
    g.add((scheme, DCTERMS.source, Literal("https://www.gov.uk/council-tax-bands")))
    out = to_canonical_turtle(g).decode("utf-8")
    # No bound prefix for gov.uk; the literal-IRI scan must not invent one.
    for line in out.splitlines():
        if line.startswith("@prefix "):
            assert "gov.uk" not in line, (
                f"G7: unbound gov.uk literal triggered prefix binding: {line!r}"
            )
    # The opda prefix MUST still appear (the scheme IRI references it).
    assert "@prefix opda:" in out


# --- G12 follow-up: multi-object blank-node sort uses skolem hex ---------
def test_multi_object_blank_node_list_byte_identical_across_runs() -> None:
    """G12 follow-up (closes ADR-0005 §G G12).

    Scenario: a single subject carries multiple `sh:property` object
    BNodes. Before G12, the multi-object sort used rdflib's internal
    BNode label (non-deterministic across runs), so the emitted list
    order would flicker. After G12, the sort uses the skolem hex from
    the blank-node hasher, which is deterministic by construction.

    This test builds a graph with 3 distinct blank-node objects on one
    predicate and asserts byte-identity across 5 fresh `Graph()`
    constructions. Each construction creates new rdflib BNode labels
    (different internal IDs) but the same skolem hex sequence (because
    the sub-graph contents are identical), so the canonical output
    MUST be byte-identical.
    """
    from rdflib import BNode as _BN

    def _build() -> Graph:
        g = Graph()
        g.bind("opda", OPDA)
        g.bind("sh", SH)
        shape = OPDA.MultiObjectShape
        g.add((shape, RDF.type, SH.NodeShape))
        for label in ["alpha", "beta", "gamma"]:
            # We use a fresh BNode per Graph construction so the rdflib
            # internal labels differ between iterations; the skolem hex
            # (derived from sub-graph contents) is what makes the sort
            # deterministic.
            prop = _BN()
            g.add((shape, SH.property, prop))
            g.add((prop, SH.path, URIRef(f"https://opda.org.uk/pdtf/{label}Path")))
            g.add((prop, SH.minCount, Literal(1)))
        return g

    outputs = [to_canonical_turtle(_build()) for _ in range(5)]
    assert all(o == outputs[0] for o in outputs), (
        "multi-object blank-node sort produced non-deterministic output:\n"
        + "\n--\n".join(out.decode("utf-8") for out in outputs)
    )
