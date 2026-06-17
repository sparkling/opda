"""
Module description_coverage_test.

Realises:
- ADR-0049 decision 4 (ratified, 2026-06-17) — the two annotation-coverage
  gates, warning-first → violation:
    * ci-description-coverage — every opda: class AND owl:*Property MUST carry a
      `skos:definition`@en (the hm ODR-0042 pattern).
    * ci-isDefinedBy — every declared opda: term MUST carry `rdfs:isDefinedBy`
      pointing at an `owl:Ontology` (the hm ODR-0091 pattern).

Warning-first → violation (ADR-0049 decision 4)
===============================================
Each gate MEASURES current coverage and reports the gap list.

  * If a gate is at 100% coverage it is wired as a HARD gate (`strict=True`
    fails on any gap — drift protection, the term that loses its definition /
    binding fails CI).
  * If a gate has gaps it REPORTS the gap list at WARNING severity and PASSES
    (`strict=True` still exits 0 while gaps remain). It does NOT fail CI, and
    it does NOT backfill the emitter — backfilling the corpus is deferred work
    that would change the TTL and break byte-identity (ADR-0049 §Confirmation).

Both gates are at 0% in the current corpus (the corpus annotates terms with
`rdfs:comment`@en + `skos:scopeNote`@en + `dct:source`, not `skos:definition`@en,
and carries no `rdfs:isDefinedBy`). So BOTH ship as warning+gaps today; the
reported numbers let the operator schedule the emitter backfill. The
warning→violation flip happens automatically once a gate reaches 100% — no code
change needed (`build_report().is_complete` becomes true and `strict` then bites).

What counts as a "term"
=======================
- A **class** is an opda: subject typed `owl:Class`.
- A **property** is an opda: subject typed `owl:ObjectProperty`,
  `owl:DatatypeProperty`, or `owl:AnnotationProperty`.
- A **declared term** (for ci-isDefinedBy) is the union of classes + properties.

`skos:definition` / `rdfs:isDefinedBy` are TBox annotations read from the class
graph (foundation + 6 modules + the two SKOS graphs) — never instance data.

Boundary: test/CI infrastructure only. Reads the class-graph TTLs via rdflib;
mints no IRIs, emits no TTL, re-pins no byte-identity. `build_report` is pure +
unit-testable on a hand-built rdflib graph without the live corpus.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from rdflib import Graph, URIRef
from rdflib.namespace import OWL, RDF, RDFS, SKOS

from opda_gen.ci.excluded_construct_test import load_class_graph


OPDA = URIRef("https://opda.org.uk/pdtf/")

_PROPERTY_TYPES: tuple[URIRef, ...] = (
    OWL.ObjectProperty,
    OWL.DatatypeProperty,
    OWL.AnnotationProperty,
)


def _is_opda(term: object) -> bool:
    return isinstance(term, URIRef) and str(term).startswith(str(OPDA))


def _short(term: URIRef) -> str:
    """Render an opda: term as ``opda:LocalName`` for the gap list."""
    return str(term).replace(str(OPDA), "opda:")


@dataclass(frozen=True)
class CoverageReport:
    """One annotation-coverage gate's result (pure; no I/O).

    `covered` / `total` are the counts; `gaps` is the sorted list of opda:
    short names lacking the annotation. `is_complete` is true iff every term is
    covered (the warning→violation flip).
    """

    label: str
    covered: int
    total: int
    gaps: tuple[str, ...] = field(default_factory=tuple)

    @property
    def is_complete(self) -> bool:
        return self.total > 0 and self.covered == self.total


def _has_definition_en(graph: Graph, subj: URIRef) -> bool:
    """True iff ``subj`` carries at least one `skos:definition` with @en."""
    for obj in graph.objects(subj, SKOS.definition):
        if getattr(obj, "language", None) == "en":
            return True
    return False


def _has_isdefinedby_ontology(graph: Graph, subj: URIRef) -> bool:
    """True iff ``subj`` `rdfs:isDefinedBy` a subject typed `owl:Ontology`."""
    for obj in graph.objects(subj, RDFS.isDefinedBy):
        if (obj, RDF.type, OWL.Ontology) in graph:
            return True
    return False


def _opda_classes(graph: Graph) -> list[URIRef]:
    return sorted(
        {s for s in graph.subjects(RDF.type, OWL.Class) if _is_opda(s)}, key=str
    )


def _opda_properties(graph: Graph) -> list[URIRef]:
    props: set[URIRef] = set()
    for pt in _PROPERTY_TYPES:
        props |= {s for s in graph.subjects(RDF.type, pt) if _is_opda(s)}
    return sorted(props, key=str)


def build_description_report(graph: Graph) -> CoverageReport:
    """ci-description-coverage — `skos:definition`@en on every class + property.

    Pure: classifies a pre-built class graph. Returns the coverage counts and
    the sorted gap list (opda: short names of classes/properties lacking a
    `skos:definition`@en).
    """
    terms = _opda_classes(graph) + _opda_properties(graph)
    covered = [t for t in terms if _has_definition_en(graph, t)]
    gaps = tuple(_short(t) for t in terms if not _has_definition_en(graph, t))
    return CoverageReport(
        label="ci-description-coverage (skos:definition@en)",
        covered=len(covered),
        total=len(terms),
        gaps=gaps,
    )


def build_isdefinedby_report(graph: Graph) -> CoverageReport:
    """ci-isDefinedBy — `rdfs:isDefinedBy` → `owl:Ontology` on every declared term.

    Pure: classifies a pre-built class graph. Returns the coverage counts and
    the sorted gap list (opda: short names of declared terms — classes +
    properties — lacking an `rdfs:isDefinedBy` whose target is an `owl:Ontology`).
    """
    terms = sorted(set(_opda_classes(graph)) | set(_opda_properties(graph)), key=str)
    covered = [t for t in terms if _has_isdefinedby_ontology(graph, t)]
    gaps = tuple(_short(t) for t in terms if not _has_isdefinedby_ontology(graph, t))
    return CoverageReport(
        label="ci-isDefinedBy (rdfs:isDefinedBy → owl:Ontology)",
        covered=len(covered),
        total=len(terms),
        gaps=gaps,
    )


def run_description_coverage(ontology_dir: Path) -> CoverageReport | None:
    """Build the ci-description-coverage report from an emission directory.

    Returns ``None`` when the corpus class graph is absent (`opda-classes.ttl`
    missing) so the caller can print UNAVAILABLE rather than a 0/0 result.
    """
    graph, missing = load_class_graph(ontology_dir)
    if "opda-classes.ttl" in missing:
        return None
    return build_description_report(graph)


def run_isdefinedby(ontology_dir: Path) -> CoverageReport | None:
    """Build the ci-isDefinedBy report from an emission directory.

    Returns ``None`` when the corpus class graph is absent (`opda-classes.ttl`
    missing).
    """
    graph, missing = load_class_graph(ontology_dir)
    if "opda-classes.ttl" in missing:
        return None
    return build_isdefinedby_report(graph)
