"""
Module exemplar_reports.

Realises:
- ADR-0014 §"Exemplar regression layer" lines 101-150 — emits the
  paired `<exemplar>-expected-report.ttl` for each diagnostic exemplar
  by running Apache Jena SHACL (ADR-0036/0037) against the foundation +
  module shape graph and serialising the resulting `sh:ValidationReport`
  via the canonical serialiser per ADR-0007.
- ODR-0004 §8a — diagnostic exemplar pairing: every exemplar TTL pairs
  with an expected-report.ttl that CI regression compares actual vs
  expected on every push.

Output: one `<exemplar-stem>-expected-report.ttl` per exemplar, sibling
to the source exemplar in `source/03-standards/ontology/exemplars/`.
"""

from __future__ import annotations

import re
from pathlib import Path

from rdflib import BNode, Graph, Literal, URIRef
from rdflib.namespace import DCTERMS, RDF

from opda_gen import __version__
from opda_gen.jena_shacl import validate as jena_validate
from opda_gen.serialiser.canonical import to_canonical_turtle


OPDA = URIRef("https://opda.org.uk/pdtf/")
SH = URIRef("http://www.w3.org/ns/shacl#")


# Per ADR-0014 §"Exemplar regression layer": validation runs against
# the foundation + 6 per-module shape graph + class graphs needed for
# sh:targetClass resolution (NOT the BASPI5 overlay — exemplars are
# foundation-level fixtures).
_CLASS_TTLS = (
    "foundation.ttl",
    "opda-classes.ttl",
    "opda-vocabularies.ttl",
    "opda-property.ttl",
    "opda-agent.ttl",
    "opda-transaction.ttl",
    "opda-claim.ttl",
    "opda-governance.ttl",
    "opda-descriptive.ttl",
)
_SHAPE_TTLS = (
    "opda-shapes.ttl",
    "opda-property-shapes.ttl",
    "opda-agent-shapes.ttl",
    "opda-transaction-shapes.ttl",
    "opda-claim-shapes.ttl",
    "opda-governance-shapes.ttl",
    "opda-descriptive-shapes.ttl",
)


def _ontology_root() -> Path:
    """Resolve the canonical ontology directory."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "source" / "03-standards").exists():
            return parent / "source" / "03-standards" / "ontology"
    raise RuntimeError("could not resolve OPDA repo root")


def _build_merged_shapes_graph(ontology_dir: Path) -> Graph:
    """Load foundation + 6 per-module shape graphs + the class graphs
    needed for sh:targetClass resolution."""
    g = Graph()
    for rel in (*_CLASS_TTLS, *_SHAPE_TTLS):
        path = ontology_dir / rel
        g.parse(path, format="turtle")
    return g


def _normalise_report(report_graph: Graph) -> Graph:
    """Strip the SHACL engine's blank-node IDs to make the report stable
    across runs. Each blank-node subject is replaced with a deterministic
    IRI minted from its (focusNode, resultPath, sourceConstraintComponent,
    resultSeverity, resultMessage) tuple so the result-set is in the same
    place every run regardless of the engine's internal BNode minting.
    """
    SH_NS = "http://www.w3.org/ns/shacl#"
    out = Graph()
    out.bind("sh", URIRef(SH_NS))
    out.bind("opda", OPDA)
    out.bind("dct", DCTERMS)

    # Map BNode → stable skolem URI based on triple content.
    skolems: dict[BNode, URIRef] = {}
    for bn in {s for s in report_graph.subjects() if isinstance(s, BNode)}:
        if (bn, RDF.type, URIRef(SH_NS + "ValidationReport")) in report_graph:
            label = "report"
        elif (bn, RDF.type, URIRef(SH_NS + "ValidationResult")) in report_graph:
            # Build deterministic key
            def _val(p: str) -> str:
                objs = list(report_graph.objects(bn, URIRef(SH_NS + p)))
                if not objs:
                    return ""
                o = objs[0]
                if isinstance(o, BNode):
                    return "BNODE"
                return str(o)
            key = "|".join((
                _val("focusNode"),
                _val("resultPath"),
                _val("resultSeverity"),
                _val("sourceConstraintComponent"),
                _val("resultMessage"),
            ))
            import hashlib
            label = "result-" + hashlib.sha1(key.encode()).hexdigest()[:12]
        else:
            # Inline shapes (sh:sourceShape blank nodes etc.) — strip
            # them; we only retain the publicly-defined surface.
            continue
        skolems[bn] = URIRef(f"https://opda.org.uk/pdtf/harness/data/exemplar-reports/{label}")

    # Predicates we keep in the report — drop sh:sourceShape because the
    # engine serialises the inline shape definition with non-stable
    # blank-node sub-graphs; the (focusNode, path, message) tuple is
    # what matters for regression.
    KEEP = {
        URIRef(SH_NS + "conforms"),
        URIRef(SH_NS + "result"),
        URIRef(SH_NS + "focusNode"),
        URIRef(SH_NS + "resultPath"),
        URIRef(SH_NS + "resultSeverity"),
        URIRef(SH_NS + "sourceConstraintComponent"),
        URIRef(SH_NS + "resultMessage"),
        URIRef(SH_NS + "value"),
        RDF.type,
    }

    for s, p, o in report_graph:
        if p not in KEEP:
            continue
        # Translate subject
        if isinstance(s, BNode):
            if s not in skolems:
                continue
            new_s = skolems[s]
        else:
            new_s = s
        # Translate object — keep URIRef objects, drop BNode objects
        # except the sh:result list link which we re-emit as IRIs
        if isinstance(o, BNode):
            if o not in skolems:
                continue
            new_o = skolems[o]
        else:
            new_o = o
        out.add((new_s, p, new_o))

    return out


def _ratifying_anchor(exemplar_stem: str) -> URIRef:
    """Return the ratifying anchor URI for an exemplar (per ADR-0014
    §"Exemplar regression layer" lines 119-150 — `dct:source` resolves
    back to the exemplar by name).
    """
    return URIRef(
        f"https://opda.org.uk/pdtf/harness/data/exemplar/{exemplar_stem}"
    )


def _comment_header(filename: str) -> str:
    """Build the generator-comment block prepended to every expected
    report TTL. Pinned constants per ADR-0009 §G6 convention so
    byte-identity holds across regenerations.
    """
    lines = [
        f"# {filename} — paired SHACL validation report",
        f"# Generated by opda-gen {__version__}; DO NOT HAND-EDIT.",
        "# Specification: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0014-baspi5-round-trip-mvp-harness",
        "# Ratifying ODR: ODR-0004 §8a (diagnostic exemplar pairing).",
        "# Comparison is semantic-equivalence (focusNode, resultPath, "
        "severity, constraint, message) per "
        "tests/baspi5_round_trip/compare_reports.py.",
        "",
    ]
    return "\n".join(lines) + "\n"


def _exemplar_files(exemplars_dir: Path) -> list[Path]:
    """Return the sorted list of exemplar source TTLs (excluding
    expected-report files)."""
    out = []
    for path in sorted(exemplars_dir.glob("*.ttl")):
        if path.name.endswith("-expected-report.ttl"):
            continue
        out.append(path)
    return out


def emit_exemplar_reports(
    ontology_dir: Path | None = None,
) -> dict[Path, str]:
    """Emit `<exemplar-stem>-expected-report.ttl` for each diagnostic
    exemplar.

    Returns a dict mapping written `Path` → Turtle content (utf-8 str)
    matching the foundation/vocabularies emitter interface.

    Each report:
    - Validates the exemplar against the foundation + 6 per-module
      shape graph via Apache Jena SHACL (ADR-0036/0037).
    - Normalises blank-node identifiers to deterministic skolem URIs
      so the report is byte-identical across regenerations.
    - Carries the generator-comment header per ADR-0009 §G6.
    """
    ontology_dir = ontology_dir or _ontology_root()
    exemplars_dir = ontology_dir / "exemplars"
    shapes_graph = _build_merged_shapes_graph(ontology_dir)

    written: dict[Path, str] = {}
    for exemplar_path in _exemplar_files(exemplars_dir):
        _conforms, report_graph = jena_validate(shapes_graph, exemplar_path)

        normalised = _normalise_report(report_graph)

        # Attach a header `dct:source` linking the report to the
        # exemplar's ratifying anchor per ADR-0014 §"Exemplar
        # regression layer" lines 119-130.
        report_subjects = [
            s for s in normalised.subjects(
                RDF.type, URIRef("http://www.w3.org/ns/shacl#ValidationReport"),
            )
        ]
        for rs in report_subjects:
            normalised.add((
                rs, DCTERMS.source,
                _ratifying_anchor(exemplar_path.stem),
            ))

        body = to_canonical_turtle(normalised).decode("utf-8")
        filename = f"{exemplar_path.stem}-expected-report.ttl"
        content = _comment_header(filename) + body
        out_path = exemplars_dir / filename
        out_path.write_text(content, encoding="utf-8", newline="")
        written[out_path] = content

    return written


def validate_exemplar(
    exemplar_path: Path,
    ontology_dir: Path | None = None,
) -> tuple[bool, str]:
    """Run Apache Jena SHACL against an exemplar; compare to the paired
    `<stem>-expected-report.ttl`. Returns (ok, diagnostic-message).
    """
    ontology_dir = ontology_dir or _ontology_root()
    expected_path = exemplar_path.with_name(
        f"{exemplar_path.stem}-expected-report.ttl",
    )
    if not expected_path.exists():
        return False, f"no expected report at {expected_path}"

    shapes_graph = _build_merged_shapes_graph(ontology_dir)
    _conforms, report_graph = jena_validate(shapes_graph, exemplar_path)
    actual = _normalise_report(report_graph)

    expected = Graph()
    expected.parse(expected_path, format="turtle")

    # Import the comparator (lives in the test harness so the
    # generator and the test harness use the same equivalence
    # definition).
    import sys
    repo_root = ontology_dir.parents[2]
    sys.path.insert(0, str(repo_root))
    try:
        from tests.baspi5_round_trip.compare_reports import (
            reports_equivalent,
        )
    finally:
        sys.path.pop(0)

    return reports_equivalent(actual, expected)
