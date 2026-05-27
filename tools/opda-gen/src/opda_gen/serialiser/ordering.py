"""
Module ordering.

Realises:
- ADR-0007 §"Deterministic emission rules" #1 (prefix ordering),
  #2 (term-type ordering), #3 (within-term triple ordering).
- ODR-0004 §6a #1 — canonical emission ordering as the byte-identity contract.

Pure functions; no I/O. Used by `canonical.py`.
"""

from __future__ import annotations

from rdflib import URIRef
from rdflib.namespace import OWL, RDF, RDFS, SKOS


# --- Term-type ordering --------------------------------------------------
# Per ADR-0007 §"Deterministic emission rules" #2:
#   owl:Ontology → owl:Class → owl:DatatypeProperty → owl:ObjectProperty →
#   sh:NodeShape → sh:PropertyShape → skos:ConceptScheme → skos:Concept → other.
#
# `skos:ConceptScheme` is inserted before `skos:Concept` so that ADR-0010
# vocabulary emissions place each scheme's header above its member concept
# blocks (otherwise members would appear before their owning scheme, since
# unknown types sort after Concept and would also alphabetically interleave).
SH = "http://www.w3.org/ns/shacl#"
TERM_TYPE_ORDER: list[URIRef | str] = [
    OWL.Ontology,
    OWL.Class,
    OWL.DatatypeProperty,
    OWL.ObjectProperty,
    URIRef(f"{SH}NodeShape"),
    URIRef(f"{SH}PropertyShape"),
    SKOS.ConceptScheme,
    SKOS.Concept,
]


def type_rank(type_iri: URIRef | None) -> int:
    """Return a sort-key for a term's primary `rdf:type`.

    Unknown / missing types sort *after* the canonical taxonomy so they appear
    deterministically last but never break the emission.
    """
    if type_iri is None:
        return len(TERM_TYPE_ORDER) + 1
    for i, known in enumerate(TERM_TYPE_ORDER):
        if str(type_iri) == str(known):
            return i
    return len(TERM_TYPE_ORDER)


# --- Within-term predicate ordering --------------------------------------
# Per ADR-0007 §"Deterministic emission rules" #3:
#   1. rdf:type (always first)
#   2. rdfs:label / skos:prefLabel
#   3. rdfs:comment / skos:definition
#   4. dct:source
#   5. predicate-lexicographic
#
# ADR-0010 SKOS member blocks read most naturally when `skos:inScheme` follows
# `skos:prefLabel` (so the reader sees what the concept is + which scheme it
# belongs to before any definition body). `skos:notation` follows `dct:source`
# (it is a machine-coded fingerprint of the member, less important to a human
# reader than the scheme membership + the citation).
DCT_SOURCE = "http://purl.org/dc/terms/source"
PREDICATE_PRIORITY: dict[str, int] = {
    str(RDF.type): 0,
    str(RDFS.label): 1,
    str(SKOS.prefLabel): 1,
    str(RDFS.comment): 2,
    str(SKOS.definition): 2,
    DCT_SOURCE: 3,
}


def predicate_rank(pred_iri: str) -> tuple[int, str]:
    """Return a sort-key `(tier, iri)` for the within-term predicate order."""
    return PREDICATE_PRIORITY.get(pred_iri, 4), pred_iri


# --- Prefix ordering -----------------------------------------------------
# Per ADR-0007 §"Deterministic emission rules" #1: alphabetised by prefix.
def sort_prefixes(prefixes: list[tuple[str, str]]) -> list[tuple[str, str]]:
    """Sort `(prefix, namespace_iri)` pairs alphabetically by prefix."""
    return sorted(prefixes, key=lambda pair: pair[0])
