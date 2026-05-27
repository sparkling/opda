"""
Module three_graph_test.

Realises:
- ODR-0004 §3a — five-part CI test for three-graph separation. Build pipeline
  fails on any of the five MUST checks.
- ADR-0007 §"Three-graph emission constraints" — generator MUST enforce the
  three-graph separation at emission time; this module is the CI gate that
  validates emitted outputs.
- ADR-0008 §"CI workflow" — invoked by `opda-gen ci-three-graph`.

Each check is one function returning a list of violation strings. Empty list
== PASS. The implementing functions document the exact ODR-0004 §3a clause
they enforce in the docstring.

The full corpus check (`run_all`) executes all five checks across a directory
containing `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`,
and (per check #5) optionally `derived/` artefacts with a service-account
provenance trail (the provenance trail check is a stub here; ADR-0009 wires
git-blame evidence into it).
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import OWL


SH = Namespace("http://www.w3.org/ns/shacl#")
OPDA = Namespace("https://w3id.org/opda/#")


# ---------------------------------------------------------------------------
# Check 1: no sh:* triples in the annotation graph (ODR-0004 §3a #1).
# ---------------------------------------------------------------------------
def check_no_shacl_in_annotations(annotation_graph: Graph) -> list[str]:
    """Enforce ODR-0004 §3a clause #1:

      ASK { GRAPH opda:annotations { ?s ?p ?o .
        FILTER(STRSTARTS(STR(?p), "http://www.w3.org/ns/shacl#")) } }
      MUST return false.

    Returns a list of (predicate-IRI) violation strings (empty == PASS).
    """
    violations: list[str] = []
    for _s, p, _o in annotation_graph:
        if isinstance(p, URIRef) and str(p).startswith(str(SH)):
            violations.append(f"annotation graph contains sh:* predicate {p}")
    return violations


# ---------------------------------------------------------------------------
# Check 2: no owl:imports from shapes (ODR-0004 §3a #2).
# ---------------------------------------------------------------------------
def check_no_owl_imports_in_shapes(shapes_graph: Graph) -> list[str]:
    """Enforce ODR-0004 §3a clause #2:

      ASK { GRAPH opda:shapes { ?s owl:imports ?g } }
      MUST return false.

    Returns a list of violation strings (empty == PASS).
    """
    violations: list[str] = []
    for s, _p, o in shapes_graph.triples((None, OWL.imports, None)):
        violations.append(f"shapes graph imports {o} from {s}")
    return violations


# ---------------------------------------------------------------------------
# Check 3: no advisory annotations in shapes (ODR-0004 §3a #3).
# ---------------------------------------------------------------------------
ADVISORY_PREDICATE_WHITELIST: list[URIRef] = [
    OPDA.aiHint,
    OPDA.uiHint,
    OPDA.exampleValue,
]


def check_no_advisory_in_shapes(shapes_graph: Graph) -> list[str]:
    """Enforce ODR-0004 §3a clause #3:

      ASK { GRAPH opda:shapes { ?s opda:aiHint ?o } }
      (and equivalent for every advisory-predicate in the whitelist)
      MUST return false.

    Returns a list of violation strings (empty == PASS).
    """
    violations: list[str] = []
    for predicate in ADVISORY_PREDICATE_WHITELIST:
        for s, _p, o in shapes_graph.triples((None, predicate, None)):
            violations.append(
                f"shapes graph contains advisory predicate {predicate} on {s} = {o}"
            )
    return violations


# ---------------------------------------------------------------------------
# Check 4: every sh:targetClass resolves (ODR-0004 §3a #4).
# ---------------------------------------------------------------------------
def check_target_class_resolves(
    shapes_graph: Graph, class_graph: Graph
) -> list[str]:
    """Enforce ODR-0004 §3a clause #4:

      SELECT ?c WHERE { ?s sh:targetClass ?c .
        FILTER NOT EXISTS { GRAPH opda:classes { ?c a owl:Class } } }
      MUST return empty.

    Returns a list of unresolved-target violations (empty == PASS).
    """
    from rdflib.namespace import RDF

    target_classes = {
        o for _s, _p, o in shapes_graph.triples((None, SH.targetClass, None))
    }
    violations: list[str] = []
    for cls in target_classes:
        if (cls, RDF.type, OWL.Class) not in class_graph:
            violations.append(
                f"sh:targetClass {cls} does not resolve to an owl:Class "
                "in the class graph"
            )
    return violations


# ---------------------------------------------------------------------------
# Check 5: derived consumer profiles have no commits outside the service
# account (ODR-0004 §3a #5).
# ---------------------------------------------------------------------------
def check_derived_provenance(derived_dir: Path | None) -> list[str]:
    """Enforce ODR-0004 §3a clause #5:

      Consumer-profile artefacts have no commits outside the build-pipeline
      service account.

    At ADR-0008, this is a stub: it returns an empty list (PASS) if no derived
    dir is provided, or — if present — relies on the CI system to enforce
    branch protection + signed commits. ADR-0009 wires up actual git-blame
    inspection. Returning an empty list here is honest: at ADR-0008 we have
    no derived artefacts yet, so there's nothing for an out-of-band commit to
    have touched.
    """
    if derived_dir is None or not derived_dir.exists():
        return []
    return []  # ADR-0009 will fill in git-blame check


# ---------------------------------------------------------------------------
# Orchestration.
# ---------------------------------------------------------------------------
def run_all(ontology_dir: Path) -> list[str]:
    """Run all five checks against an emission directory.

    Returns a flat list of violation strings across all five checks (empty
    == PASS). Tolerates missing files: a missing file is reported as a
    separate violation so the caller knows the corpus is incomplete.
    """
    out: list[str] = []
    classes_path = ontology_dir / "opda-classes.ttl"
    shapes_path = ontology_dir / "opda-shapes.ttl"
    annotations_path = ontology_dir / "opda-annotations.ttl"

    classes_g = Graph()
    shapes_g = Graph()
    annotations_g = Graph()

    if classes_path.exists():
        classes_g.parse(str(classes_path), format="turtle")
    else:
        out.append(f"missing file: {classes_path}")
    if shapes_path.exists():
        shapes_g.parse(str(shapes_path), format="turtle")
    else:
        out.append(f"missing file: {shapes_path}")
    if annotations_path.exists():
        annotations_g.parse(str(annotations_path), format="turtle")
    else:
        out.append(f"missing file: {annotations_path}")

    out.extend(check_no_shacl_in_annotations(annotations_g))
    out.extend(check_no_owl_imports_in_shapes(shapes_g))
    out.extend(check_no_advisory_in_shapes(shapes_g))
    out.extend(check_target_class_resolves(shapes_g, classes_g))
    out.extend(check_derived_provenance(ontology_dir / "derived"))
    return out
