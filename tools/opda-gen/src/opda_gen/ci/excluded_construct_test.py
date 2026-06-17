"""
Module excluded_construct_test.

Realises:
- ADR-0049 task 4 + ODR-0033 §R2/§R5/§Confirmation — the corpus-wide
  excluded-construct gate. The structural enforcement of the ODR-0030-adopted
  permitted/excluded OWL-construct table, re-keyed to OPDA's frozen 7-rule
  closure (ODR-0025 §R1). Council session-050 Q3a: adopt the construct table +
  an excluded-construct CI meta-shape, with the IFP rule the FP/IFP carve-out
  (ADR-0049 Q2 / ODR-0033 §R4) and `owl:unionOf` kept excluded (the Q1 payoff —
  the corpus stays boolean-constructor-free; the disjunction form is repeated
  `rdfs:domain`, ODR-0033 §R5).

What this gate adds over `ci-object-property-coverage`
======================================================
`object_property_coverage_test` limb (b3) catches `owl:FunctionalProperty` /
`owl:InverseFunctionalProperty` authored **on an object property only**. This
gate GENERALISES that limb to the FULL excluded set, CORPUS-WIDE: it fails if
ANY excluded construct appears anywhere in the class graph, on any subject
(class, property, individual, or blank node), not just on object properties.
The two gates are complementary — the coverage gate carries the relationship-
layer-specific context (the SHACL-dual + convention-note duals); this gate is
the blanket drift-protection arming the construct table.

The excluded set (ODR-0033, re-keyed to OPDA's frozen closure)
==============================================================
EXCLUDED entirely (never authored — neither inferred nor documentary):
  owl:InverseFunctionalProperty, owl:Restriction, owl:unionOf,
  owl:intersectionOf, owl:complementOf, the OWL cardinality restrictions
  (owl:cardinality / owl:minCardinality / owl:maxCardinality and their
  qualified forms owl:qualifiedCardinality / owl:minQualifiedCardinality /
  owl:maxQualifiedCardinality), owl:oneOf, owl:hasKey, owl:disjointUnionOf.

NOT in the excluded set (documentary-only band, larger than hm's — these are
authored as documentary AI-signal but NEVER entailed, ODR-0033 §R1/§R2):
  rdfs:domain, rdfs:range, owl:disjointWith (scoped — checked by the ADR-0035
  consistency gate, not inferred), owl:equivalentClass, owl:equivalentProperty,
  owl:FunctionalProperty (narrow hand-curated world-fact only, ODR-0033 §R4).
`owl:FunctionalProperty` is therefore NOT failed corpus-wide here (a hand-
curated singleton marker is admissible); the object-property carve-out for FP is
enforced narrowly by `object_property_coverage_test` limb (b3).

Detection discipline — axiom usage, never a string mention
==========================================================
An excluded construct is detected ONLY as a real triple component: either a
PREDICATE (`?s owl:unionOf ?o`, `?s owl:hasKey ?o`, the cardinality predicates)
or the OBJECT of an `rdf:type` axiom (`?s a owl:Restriction`,
`?s a owl:InverseFunctionalProperty`). It is NEVER detected as a substring of an
annotation literal — the corpus documents the convention in prose
(`skos:editorialNote "... owl:unionOf is NOT used ..."`), and a string literal is
an object Literal, never a predicate or a typed-as URIRef, so reading the parsed
RDF graph (not grepping text) excludes those mentions by construction.

The corpus has ZERO excluded constructs today (verified) → this gate PASSES and
arms drift protection. A synthetic `owl:unionOf` / `owl:Restriction` / `owl:hasKey`
MUST fail (positive control); the clean corpus passes (negative control).

Boundary: test/CI infrastructure only. Reads the class-graph TTLs via rdflib;
mints no IRIs, emits no TTL, re-pins no byte-identity. `check_no_excluded_constructs`
is pure + unit-testable on a hand-built rdflib graph without the live corpus.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, URIRef
from rdflib.namespace import OWL, RDF


# The class-graph TTLs that make up OPDA's TBox (foundation + 6 per-module +
# the two SKOS graphs). Mirrors `three_graph_test.run_all`'s `reasoned_g` union
# (the ODR-0029 reasoned union) so the gate covers exactly the corpus class
# graph — every file an excluded-construct axiom could hide in. Shapes /
# annotation graphs are excluded (they carry no OWL class axioms by the
# three-graph contract, ODR-0004 §3a).
_CLASS_GRAPH_FILES: tuple[str, ...] = (
    "opda-classes.ttl",
    "opda-property.ttl",
    "opda-agent.ttl",
    "opda-transaction.ttl",
    "opda-claim.ttl",
    "opda-governance.ttl",
    "opda-descriptive.ttl",
    "opda-vocabularies.ttl",
    "opda-contexts.ttl",
    "foundation.ttl",
)


# Excluded constructs that appear as a PREDICATE in a real triple. Keyed by the
# OWL/RDF term; the value is the human label used in the violation string.
_EXCLUDED_PREDICATES: dict[URIRef, str] = {
    OWL.unionOf: "owl:unionOf",
    OWL.intersectionOf: "owl:intersectionOf",
    OWL.complementOf: "owl:complementOf",
    OWL.oneOf: "owl:oneOf",
    OWL.hasKey: "owl:hasKey",
    OWL.disjointUnionOf: "owl:disjointUnionOf",
    OWL.cardinality: "owl:cardinality",
    OWL.minCardinality: "owl:minCardinality",
    OWL.maxCardinality: "owl:maxCardinality",
    OWL.qualifiedCardinality: "owl:qualifiedCardinality",
    OWL.minQualifiedCardinality: "owl:minQualifiedCardinality",
    OWL.maxQualifiedCardinality: "owl:maxQualifiedCardinality",
}


# Excluded constructs that appear as the OBJECT of an `rdf:type` axiom.
# `owl:FunctionalProperty` is deliberately ABSENT — a narrow hand-curated
# world-fact singleton is admissible (ODR-0033 §R4); its object-property
# carve-out is enforced by `object_property_coverage_test` limb (b3).
_EXCLUDED_TYPES: dict[URIRef, str] = {
    OWL.InverseFunctionalProperty: "owl:InverseFunctionalProperty",
    OWL.Restriction: "owl:Restriction",
}


def check_no_excluded_constructs(class_graph: Graph) -> list[str]:
    """Fail if any ODR-0033-excluded OWL construct appears in the class graph.

    Returns a list of violation strings (empty == PASS). Each excluded
    construct is detected as a real triple component — a predicate, or the
    object of an `rdf:type` axiom — never as a substring of an annotation
    literal (the parsed graph excludes prose mentions by construction).
    """
    violations: list[str] = []

    # Predicate-form excluded constructs (`?s owl:unionOf ?o`, cardinality, etc.).
    for pred, label in _EXCLUDED_PREDICATES.items():
        for s, _p, _o in class_graph.triples((None, pred, None)):
            violations.append(
                f"excluded OWL construct {label} authored on {s.n3()} "
                f"(ODR-0033 — corpus must be free of excluded constructs)"
            )

    # rdf:type-form excluded constructs (`?s a owl:Restriction`, `a owl:IFP`).
    for cls, label in _EXCLUDED_TYPES.items():
        for s, _p, _o in class_graph.triples((None, RDF.type, cls)):
            violations.append(
                f"excluded OWL construct {label} authored on {s.n3()} "
                f"(ODR-0033 — corpus must be free of excluded constructs)"
            )

    return violations


def load_class_graph(ontology_dir: Path) -> tuple[Graph, list[str]]:
    """Merge the class-graph TTLs in ``ontology_dir`` into one rdflib Graph.

    Returns ``(graph, missing)`` where ``missing`` lists any class-graph file
    that was absent (tolerated — a thin/partial corpus is reported, not crashed).
    """
    g = Graph()
    missing: list[str] = []
    for name in _CLASS_GRAPH_FILES:
        path = ontology_dir / name
        if path.exists():
            g.parse(str(path), format="turtle")
        else:
            missing.append(name)
    return g, missing


def run_all(ontology_dir: Path) -> list[str]:
    """Run the corpus-wide excluded-construct gate over an emission directory.

    Returns a flat list of violation strings (empty == PASS). A missing
    foundation file (`opda-classes.ttl`) is reported as a violation so the
    caller knows the corpus is incomplete; the two SKOS graphs are optional.
    """
    out: list[str] = []
    graph, missing = load_class_graph(ontology_dir)
    # Only `opda-classes.ttl` is load-bearing for "corpus present"; vocabularies
    # / contexts are optional (thin Phase-3 corpora may omit them).
    if "opda-classes.ttl" in missing:
        out.append(f"missing file: {ontology_dir / 'opda-classes.ttl'}")
    out.extend(check_no_excluded_constructs(graph))
    return out
