"""
Module canonical.

Realises:
- ADR-0007 §"Deterministic emission rules" #1-6 — canonical N-Triples →
  Turtle serialiser. Bypasses rdflib's own Turtle serialiser so byte-identity
  is contractually owned by OPDA (not by rdflib's release cadence).
- ADR-0008 §"Repository structure" — `serialiser/canonical.py`, ~150 LOC.
- ODR-0004 §6a #1 — deterministic emission ordering operationalised.
- ODR-0004 §6a #3 — byte-identity CI test contract: this serialiser is what
  the contract is enforced *on*.

Pipeline:
  graph (rdflib) → skolemise blank nodes (`blank_nodes.py`) → group triples
  by subject → sort subjects by (type_rank, iri) → within each subject sort
  predicate-objects per `ordering.predicate_rank` → emit Turtle with locked
  formatting (LF endings, no trailing whitespace, 4-space indent, final
  newline, no BOM, alphabetised prefix declarations).

Tested invariant: same input → identical bytes across 100 runs.
"""

from __future__ import annotations

from collections import defaultdict

from rdflib import BNode, Graph, Literal, URIRef
from rdflib.namespace import RDF, XSD

from opda_gen.serialiser.blank_nodes import skolemise, skolem_label
from opda_gen.serialiser.ordering import (
    predicate_rank,
    sort_prefixes,
    type_rank,
)


_INDENT = "    "  # 4-space indent per ADR-0007 #6
_NEWLINE = "\n"


def _format_uri(uri: URIRef, ns_map: dict[str, str]) -> str:
    """Emit a URI as a prefixed name when a registered prefix matches, else
    as a full <iri>. Longest-namespace-match wins so nested namespaces don't
    collide."""
    uri_str = str(uri)
    best: tuple[str, str] | None = None
    for prefix, ns in ns_map.items():
        if uri_str.startswith(ns):
            local = uri_str[len(ns):]
            if not local:
                continue
            if all(c.isalnum() or c in "_-." for c in local) and not local[0].isdigit():
                if best is None or len(ns) > len(best[1]):
                    best = (f"{prefix}:{local}", ns)
    if best is not None:
        return best[0]
    return f"<{uri_str}>"


def _format_literal(lit: Literal, ns_map: dict[str, str]) -> str:
    """Per ADR-0007 #5: xsd:string datatype implicit (never emit ^^xsd:string);
    @en explicit when present; escape \\n, \\t, \\", \\\\.
    """
    raw = str(lit)
    escaped = (
        raw.replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t")
    )
    out = f"\"{escaped}\""
    if lit.language:
        return f"{out}@{lit.language}"
    if lit.datatype and str(lit.datatype) != str(XSD.string):
        return f"{out}^^{_format_uri(lit.datatype, ns_map)}"
    return out


def _format_object(obj, ns_map: dict[str, str], blanks: dict[BNode, str]) -> str:
    if isinstance(obj, URIRef):
        return _format_uri(obj, ns_map)
    if isinstance(obj, BNode):
        return skolem_label(blanks.get(obj, "00000000")[:12])
    if isinstance(obj, Literal):
        return _format_literal(obj, ns_map)
    return f"<{obj}>"  # defensive; rdflib only emits URI/BNode/Literal


def _primary_type(graph: Graph, subject) -> URIRef | None:
    """Return the first (alphabetised) rdf:type of `subject`, or None."""
    types = sorted([t for t in graph.objects(subject, RDF.type) if isinstance(t, URIRef)],
                   key=str)
    return types[0] if types else None


def _subject_sort_key(graph: Graph, subject, blanks: dict[BNode, str]) -> tuple:
    primary = _primary_type(graph, subject)
    rank = type_rank(primary)
    if isinstance(subject, BNode):
        ident = blanks.get(subject, "")
    else:
        ident = str(subject)
    return (rank, ident)


def to_canonical_turtle(graph: Graph) -> bytes:
    """Serialise `graph` to canonical Turtle bytes.

    LF endings, 4-space indent, alphabetised prefix declarations, no trailing
    whitespace, single final newline, no BOM.
    """
    blanks = skolemise(graph)

    # 1. Prefix declarations, alphabetised (ADR-0007 #1).
    # Only emit prefixes whose namespace is *referenced* by the graph; this
    # avoids the long rdflib auto-bind list polluting the output and makes
    # byte-identity robust against rdflib's internal default-binding table
    # changing between releases.
    referenced_iris: set[str] = set()
    for s, p, o in graph:
        if isinstance(s, URIRef):
            referenced_iris.add(str(s))
        if isinstance(p, URIRef):
            referenced_iris.add(str(p))
        if isinstance(o, URIRef):
            referenced_iris.add(str(o))
        if isinstance(o, Literal) and o.datatype is not None:
            referenced_iris.add(str(o.datatype))

    namespaces: list[tuple[str, str]] = []
    seen_pref: set[str] = set()
    for prefix, ns in graph.namespaces():
        if prefix in seen_pref or not prefix:
            continue
        ns_str = str(ns)
        if not any(iri.startswith(ns_str) for iri in referenced_iris):
            continue
        seen_pref.add(prefix)
        namespaces.append((prefix, ns_str))
    namespaces = sort_prefixes(namespaces)
    ns_map = dict(namespaces)

    lines: list[str] = []
    for prefix, ns in namespaces:
        lines.append(f"@prefix {prefix}: <{ns}> .")
    if namespaces:
        lines.append("")

    # 2. Group triples by subject.
    by_subject: dict = defaultdict(list)
    for s, p, o in graph:
        by_subject[s].append((p, o))

    # 3. Sort subjects by (type_rank, identifier) — ADR-0007 #2.
    subjects = sorted(by_subject.keys(), key=lambda s: _subject_sort_key(graph, s, blanks))

    for idx, subj in enumerate(subjects):
        triples = by_subject[subj]
        # 4. Within-term ordering: predicate_rank, then object lex.
        triples_sorted = sorted(
            triples,
            key=lambda po: (predicate_rank(str(po[0]))[0], str(po[0]), str(po[1])),
        )
        subj_label = (
            skolem_label(blanks.get(subj, "00000000")[:12])
            if isinstance(subj, BNode)
            else _format_uri(subj, ns_map) if isinstance(subj, URIRef) else f"<{subj}>"
        )
        # Group consecutive triples with the same predicate so we can emit
        # the `pred obj1, obj2 ;` shorthand deterministically.
        per_pred: dict = defaultdict(list)
        pred_order: list = []
        for p, o in triples_sorted:
            key = str(p)
            if key not in per_pred:
                pred_order.append(p)
            per_pred[key].append(o)

        lines.append(subj_label)
        last_pred = pred_order[-1] if pred_order else None
        for p in pred_order:
            objects = sorted(per_pred[str(p)], key=lambda o: str(o))
            obj_parts = [_format_object(o, ns_map, blanks) for o in objects]
            objs_joined = ", ".join(obj_parts)
            pred_str = _format_uri(p, ns_map) if isinstance(p, URIRef) else str(p)
            terminator = " ." if p is last_pred else " ;"
            lines.append(f"{_INDENT}{pred_str} {objs_joined}{terminator}")
        if idx < len(subjects) - 1:
            lines.append("")  # one blank line between term blocks per #6.

    # 5. Final newline; LF only; no trailing whitespace.
    text = _NEWLINE.join(line.rstrip() for line in lines)
    if not text.endswith(_NEWLINE):
        text += _NEWLINE
    return text.encode("utf-8")  # no BOM by construction (utf-8 not utf-8-sig).
