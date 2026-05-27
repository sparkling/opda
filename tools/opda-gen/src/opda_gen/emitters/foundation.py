"""
Module foundation.

Realises (interface only at ADR-0008):
- ADR-0008 §"CLI design" — `emit-foundation` subcommand surface.
- ADR-0009 — foundation.ttl emission (header + class skeleton). ADR-0008
  ships the stub; ADR-0009 fills in the body.

This emitter currently exposes a minimal `emit(output)` that constructs a
header-only graph and writes it via the canonical serialiser. The header is
deterministic so the byte-identity test fixture can exercise the full
pipeline (canonical serialiser + blank nodes + ordering) end-to-end before
ADR-0009 lands.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF

from opda_gen.serialiser.canonical import to_canonical_turtle


OPDA = Namespace("https://w3id.org/opda/#")
VANN = Namespace("http://purl.org/vocab/vann/")


def build_stub_graph() -> Graph:
    """Construct a deterministic stub foundation graph.

    Used by `test_byte_identity.py` to exercise the canonical pipeline before
    ADR-0009 lands. NOT the real foundation.ttl emission — that is
    ADR-0009's deliverable.
    """
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("dct", DCTERMS)
    g.bind("owl", OWL)
    g.bind("vann", VANN)
    onto = URIRef("https://w3id.org/opda/")
    g.add((onto, RDF.type, OWL.Ontology))
    g.add((onto, DCTERMS.title, Literal("OPDA Foundation (stub)", lang="en")))
    g.add((onto, VANN.preferredNamespacePrefix, Literal("opda")))
    g.add((onto, VANN.preferredNamespaceUri, Literal(str(OPDA))))
    return g


def emit(output_dir: Path) -> Path:
    """Stub emission. Writes a minimal header-only foundation.ttl.

    ADR-0009 will replace this with the full header + class skeleton per
    ODR-0004 §Rules.4 ontology-header contract.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "foundation.ttl"
    out_path.write_bytes(to_canonical_turtle(build_stub_graph()))
    return out_path
