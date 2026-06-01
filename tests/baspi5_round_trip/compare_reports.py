"""
Module compare_reports.

Realises:
- ADR-0014 §"CI integration" lines 222-228 — semantic-equivalence
  comparator for SHACL `sh:ValidationReport` Turtle files.
  Blank-node renames between validation runs are tolerated; the
  comparison key is the (focusNode, sourceShape, resultPath,
  resultSeverity, resultMessage) tuple per sh:result.

Usage (as a CLI):
  python tests/baspi5_round_trip/compare_reports.py <actual.ttl> <expected.ttl>

Exit code: 0 = equivalent; 1 = differs.
"""

from __future__ import annotations

import sys
from pathlib import Path

from rdflib import Graph, URIRef
from rdflib.namespace import RDF


SH = URIRef("http://www.w3.org/ns/shacl#")


def _result_tuples(g: Graph) -> list[tuple]:
    """Extract canonicalised (focusNode, sourceShape, resultPath,
    severity, message) tuples from a sh:ValidationReport graph.

    Blank-node IRIs are replaced with `BNODE` so the comparator is
    insensitive to rdflib's BNode minting (the same logical violation
    surfaces with a different blank label on each validation run).
    """
    SH_NS = "http://www.w3.org/ns/shacl#"
    out: list[tuple] = []
    for result in g.subjects(RDF.type, URIRef(SH_NS + "ValidationResult")):
        def _val(predicate: str) -> str:
            objs = list(g.objects(result, URIRef(SH_NS + predicate)))
            if not objs:
                return ""
            o = objs[0]
            # Replace blank-node identifiers with a stable sentinel;
            # we don't care about their per-run IDs, only that one
            # exists.
            return "BNODE" if str(o).startswith("N") and " " not in str(o) \
                and len(str(o)) < 60 and not str(o).startswith("http") \
                else str(o)
        out.append((
            _val("focusNode"),
            _val("resultPath"),
            _val("resultSeverity"),
            _val("sourceConstraintComponent"),
            _val("resultMessage"),
        ))
    return sorted(out)


def _conforms(g: Graph) -> bool:
    """Return the sh:conforms boolean from a report graph."""
    SH_NS = "http://www.w3.org/ns/shacl#"
    for report in g.subjects(RDF.type, URIRef(SH_NS + "ValidationReport")):
        for c in g.objects(report, URIRef(SH_NS + "conforms")):
            return str(c).lower() == "true"
    return True  # no report node → conforms true by absence-of-result


def reports_equivalent(actual: Graph, expected: Graph) -> tuple[bool, str]:
    """Return (equivalent, diagnostic_message)."""
    a_conforms = _conforms(actual)
    e_conforms = _conforms(expected)
    if a_conforms != e_conforms:
        return False, (
            f"sh:conforms differs: actual={a_conforms} "
            f"expected={e_conforms}"
        )
    a_results = _result_tuples(actual)
    e_results = _result_tuples(expected)
    if a_results != e_results:
        return False, (
            f"sh:result set differs:\n"
            f"  actual ({len(a_results)} results): {a_results}\n"
            f"  expected ({len(e_results)} results): {e_results}"
        )
    return True, "equivalent"


def main() -> int:  # pragma: no cover - CLI dispatch
    if len(sys.argv) != 3:
        print(
            "usage: compare_reports.py <actual.ttl> <expected.ttl>",
            file=sys.stderr,
        )
        return 2
    actual = Graph()
    actual.parse(Path(sys.argv[1]), format="turtle")
    expected = Graph()
    expected.parse(Path(sys.argv[2]), format="turtle")
    ok, msg = reports_equivalent(actual, expected)
    print(msg)
    return 0 if ok else 1


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
