"""
Module blank_nodes.

Realises:
- ADR-0007 §"Deterministic emission rules" #4 — blank nodes skolemised by
  SHA-256 hash of their canonical N-Triples representation (recursive for
  nested blanks). Prefix `_:b<hex-digest-first-12-chars>`.
- ODR-0004 §6a #1 — deterministic emission ordering applies to blank-node
  identifiers as well as triple positions.
- ADR-0008 §"Repository structure" — `serialiser/blank_nodes.py` per layout.

Determinism contract:
  - Two structurally-identical blank-node sub-graphs (same predicates and
    objects, with any nested blanks recursively-identical) MUST produce the
    same skolem.
  - Two structurally-distinct sub-graphs MUST produce different skolems.
"""

from __future__ import annotations

import hashlib

from rdflib import BNode, Graph, URIRef
from rdflib.term import Literal


_DIGEST_HEX_CHARS = 12


def _format_literal(lit: Literal) -> str:
    """Canonical N-Triples literal serialisation: quoted, datatype-tagged,
    language-tagged. Mirrors rdflib's n3() for literals, but locked to the
    canonical form so behaviour is stable across rdflib versions."""
    value = str(lit).replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
    out = f"\"{value}\""
    if lit.language:
        return f"{out}@{lit.language}"
    if lit.datatype:
        return f"{out}^^<{lit.datatype}>"
    return out


def _canonical_object_for_hash(obj, graph: Graph, depth: int = 0) -> str:
    """Return the canonical serialisation of `obj` for hashing.

    For a nested BNode, recursively skolemise its sub-graph. Recursion bottoms
    out at non-blank terms. Depth cap prevents pathological self-referential
    blanks (extremely rare in well-formed RDF) from looping forever.
    """
    if isinstance(obj, BNode):
        if depth > 32:
            # Pathological cycle; return a stable placeholder so two-equal
            # cycles still hash identically.
            return "_:cycle"
        return f"_:b{_skolem_for(obj, graph, depth=depth + 1)}"
    if isinstance(obj, URIRef):
        return f"<{obj}>"
    return _format_literal(obj)


def _skolem_for(node: BNode, graph: Graph, depth: int = 0) -> str:
    """Compute the SHA-256 digest of the canonical N-Triples representation of
    `node`'s outgoing triples (p, o) tuples, joined newline-delimited and
    sorted lexicographically.

    Returns the first `_DIGEST_HEX_CHARS` hex characters of the digest.
    """
    parts: list[str] = []
    for pred, obj in graph.predicate_objects(node):
        pred_str = f"<{pred}>" if isinstance(pred, URIRef) else str(pred)
        obj_str = _canonical_object_for_hash(obj, graph, depth=depth)
        parts.append(f"{pred_str} {obj_str} .")
    canonical = "\n".join(sorted(parts))
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return digest[:_DIGEST_HEX_CHARS]


def skolemise(graph: Graph) -> dict[BNode, str]:
    """Return a dict mapping every BNode in `graph` to its skolem string
    (the `_:b<hex>` form, without the prefix).

    The returned strings are stable across runs and across rdflib internals.
    """
    out: dict[BNode, str] = {}
    for node in set(graph.all_nodes()):
        if isinstance(node, BNode):
            out[node] = _skolem_for(node, graph)
    return out


def skolem_label(skolem_hex: str) -> str:
    """Format a skolem hex into the canonical `_:b<hex>` label."""
    return f"_:b{skolem_hex}"
