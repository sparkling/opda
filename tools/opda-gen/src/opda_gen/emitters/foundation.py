"""
Module foundation.

Realises:
- ADR-0009 §"foundation.ttl — ontology header" — `vann:`-headed ontology
  with `owl:versionIRI`, `dct:` metadata, `sh:declare` prefix node.
- ADR-0009 §"opda-classes.ttl — initial class graph" — the two foundation
  classes (`opda:DiagnosticExemplar`, `opda:GeneratorRun`) emitted with the
  ADR-0007 §"A9 per-kind discipline output" triple set (`dct:source` +
  `skos:scopeNote` + `rdfs:comment`).
- ADR-0009 §"opda-shapes.ttl — initial shapes graph" — header-only graph
  pointing at the class-graph version IRI via `opda:targetsClassGraph`.
- ADR-0009 §"opda-annotations.ttl — initial annotations graph" — header-only
  graph pointing at the class-graph version IRI.
- ADR-0007 §"Deterministic emission rules" — every emitted file is produced
  by the canonical serialiser; rdflib's own Turtle writer is NOT used.
- ADR-0007 §"A9 per-kind discipline output" — class blocks emit the
  per-kind triple set with `dct:source` resolving to a ratified ODR section.
- ADR-0008 §"CLI design" — the `emit-foundation` subcommand invokes this
  module's `emit_foundation()` entry point.
- ODR-0004 §3a (three-graph separation) — three source graphs are emitted
  in parallel even though shapes + annotations are header-only; downstream
  ADR-0012 fills the bodies without create-or-replace.
- ODR-0004 §6a (deterministic emission + byte-identity CI) — output is
  produced by the canonical serialiser; second-run regeneration produces
  byte-identical bytes.
- ODR-0004 §7a (term-sourcing) — every minted class carries `dct:source` to
  its ratified ODR-0004 section URL.
- ODR-0004 §8a (diagnostic exemplars) — `opda:DiagnosticExemplar` is
  defined here so the 15 existing exemplars in `source/03-standards/
  ontology/exemplars/` resolve their `a opda:DiagnosticExemplar` typing.

Pipeline:
  1. Build header (rdflib) → serialise via `to_canonical_turtle` →
     prepend generator-comment block.
  2. Build class graph → serialise → prepend generator-comment block.
  3. Build shapes graph (header-only) → serialise → prepend generator-comment
     block.
  4. Build annotations graph (header-only) → serialise → prepend
     generator-comment block.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

from opda_gen import __version__
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces -----------------------------------------------------------
OPDA = Namespace("https://w3id.org/opda/#")
VANN = Namespace("http://purl.org/vocab/vann/")
SH = Namespace("http://www.w3.org/ns/shacl#")


# --- Constants pinned by ADR-0009 + ADR-0010 -----------------------------
_ONTOLOGY_IRI = URIRef("https://w3id.org/opda/")
# `owl:versionIRI` advances when the generator version bumps and the
# emitted substrate materially extends. ADR-0009 pinned 0.1.0 (foundation
# only). ADR-0010 introduces the SKOS substrate (16 ConceptSchemes), which
# is a substantive addition to the corpus; the version IRI moves to 0.2.0
# in lockstep with `opda_gen.__version__`.
_VERSION_IRI = URIRef("https://w3id.org/opda/0.2.0/")
_SHAPES_GRAPH_IRI = URIRef("https://w3id.org/opda/shapes")
_ANNOTATIONS_GRAPH_IRI = URIRef("https://w3id.org/opda/annotations")
_OPDA_NS_LITERAL = Literal("https://w3id.org/opda/#", datatype=XSD.anyURI)
_LICENSE_IRI = URIRef("https://creativecommons.org/publicdomain/zero/1.0/")
# ADR-0009 fixes the dct:issued at the date of first emission.
_ISSUED_DATE = "2026-05-27"
# The dct:modified + generator-header "at <date>" is also pinned for
# byte-identity CI. It updates only when a future ADR materially mutates the
# foundation content; until then, this constant is the source of truth for
# "when did the foundation TTLs last substantively change". Override via
# the `emission_date` kwarg of `emit_foundation()` for ad-hoc tests; CI
# MUST regenerate with this pinned default so the diff is zero.
_FOUNDATION_LAST_MODIFIED = "2026-05-27"
# The generator-comment header's "# Source commit:" line is pinned to a
# sentinel string per ADR-0009 (not the live HEAD SHA). Rationale: the live
# SHA changes on every unrelated commit and would break byte-identity CI.
# The sentinel tells human readers which ADR ratified this content; the
# live SHA at the time of any specific regeneration is recoverable via
# `git log -- source/03-standards/ontology/foundation.ttl`. The constant
# advances when a future ADR materially mutates the foundation content
# (e.g. ADR-0011 module emissions will bump this to "pinned-by-ADR-0011").
_FOUNDATION_SOURCE_COMMIT = "pinned-by-ADR-0009"
# Generator-version label per ADR-0009 §"foundation.ttl — ontology header" line 73.
_GENERATOR_VERSION_LABEL = f"opda-gen-{__version__}"
# Version-info string tracks the ADR responsible for the most recent
# substantive substrate addition. ADR-0009 set "foundation skeleton";
# ADR-0010 extends to "foundation + SKOS vocabularies".
_VERSION_INFO = f"{__version__} — foundation + SKOS vocabularies (ADR-0009 + ADR-0010)"

# dct:source URIs — every emitted class cites its ratified ODR section.
_ODR_0004_SECTION_8A = URIRef(
    "https://w3id.org/opda/odr/ODR-0004#section-8a-diagnostic-exemplars"
)
_ODR_0004_SECTION_6A = URIRef(
    "https://w3id.org/opda/odr/ODR-0004#section-6a-generator-first"
)

# Output file names.
FOUNDATION_FILENAME = "foundation.ttl"
CLASSES_FILENAME = "opda-classes.ttl"
SHAPES_FILENAME = "opda-shapes.ttl"
ANNOTATIONS_FILENAME = "opda-annotations.ttl"


def _comment_header(
    filename: str,
    *,
    title: str,
    emission_date: str,
    git_sha: str,
    extra_lines: list[str] | None = None,
) -> str:
    """Build the generator-comment block prepended to every emitted TTL.

    Per ADR-0009 §"foundation.ttl — ontology header" lines 44-50, the block
    cites generator version, source commit, ADR backlinks, and a
    DO-NOT-HAND-EDIT warning. ``extra_lines`` lets per-graph callers append
    a one-line explanatory note (e.g. "Module shapes intentionally empty").
    """
    lines = [
        f"# {filename} — {title}",
        f"# Generated by opda-gen {__version__} at {emission_date}; "
        f"DO NOT HAND-EDIT.",
        "# Specification: "
        "https://openpropdata.org.uk/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://openpropdata.org.uk/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://openpropdata.org.uk/adr/ADR-0009-foundation-ttl-emission",
        f"# Generator version: {_GENERATOR_VERSION_LABEL}",
        f"# Source commit: {git_sha}",
    ]
    if extra_lines:
        for line in extra_lines:
            lines.append(f"# {line}")
    lines.append("")  # blank line before Turtle content
    return "\n".join(lines) + "\n"


# --- Graph builders ------------------------------------------------------
def _bind_common(graph: Graph) -> None:
    """Bind the prefixes named in ADR-0009 templates.

    The canonical serialiser filters out prefixes whose namespace isn't
    referenced by the graph, so it's safe to bind broadly here; only the
    truly-referenced prefixes will appear in the output.
    """
    graph.bind("opda", OPDA)
    graph.bind("owl", OWL)
    graph.bind("rdfs", RDFS)
    graph.bind("dct", DCTERMS)
    graph.bind("vann", VANN)
    graph.bind("sh", SH)
    graph.bind("xsd", XSD)
    graph.bind("skos", SKOS)


def build_foundation_graph(emission_date: str) -> Graph:
    """Build the foundation ontology-header graph per ADR-0009 §"foundation.ttl".

    Subjects:
    - ``<https://w3id.org/opda/>`` — `owl:Ontology` with dct/vann/owl
      metadata and an `sh:declare` blank-node pointer.
    - one anonymous BNode declaring the opda prefix via `sh:prefix` +
      `sh:namespace`.
    """
    g = Graph()
    _bind_common(g)

    g.add((_ONTOLOGY_IRI, RDF.type, OWL.Ontology))
    g.add((_ONTOLOGY_IRI, DCTERMS.title, Literal(
        "OPDA — Open Property Data Association Ontology", lang="en"
    )))
    g.add((_ONTOLOGY_IRI, DCTERMS.description, Literal(
        "Linked-data ontology for UK residential property transaction data; "
        "the Trust Framework's machine-readable vocabulary.",
        lang="en",
    )))
    g.add((_ONTOLOGY_IRI, DCTERMS.creator, Literal("OPDA Linked Data Council")))
    g.add((_ONTOLOGY_IRI, DCTERMS.issued, Literal(_ISSUED_DATE, datatype=XSD.date)))
    g.add((_ONTOLOGY_IRI, DCTERMS.modified, Literal(emission_date, datatype=XSD.date)))
    g.add((_ONTOLOGY_IRI, DCTERMS.license, _LICENSE_IRI))
    g.add((_ONTOLOGY_IRI, VANN.preferredNamespacePrefix, Literal("opda")))
    g.add((_ONTOLOGY_IRI, VANN.preferredNamespaceUri, _OPDA_NS_LITERAL))
    g.add((_ONTOLOGY_IRI, OWL.versionIRI, _VERSION_IRI))
    g.add((_ONTOLOGY_IRI, OWL.versionInfo, Literal(_VERSION_INFO)))
    g.add((_ONTOLOGY_IRI, OPDA.generatorVersion, Literal(_GENERATOR_VERSION_LABEL)))

    # sh:declare blank-node binding the opda prefix per ADR-0009 lines 74-77.
    declare_node = BNode()
    g.add((_ONTOLOGY_IRI, SH.declare, declare_node))
    g.add((declare_node, SH.prefix, Literal("opda")))
    g.add((declare_node, SH.namespace, _OPDA_NS_LITERAL))
    return g


def build_classes_graph() -> Graph:
    """Build the initial OWL class graph per ADR-0009 §"opda-classes.ttl".

    Two classes — `opda:DiagnosticExemplar` and `opda:GeneratorRun` — each
    emitted with the ADR-0007 §"A9 per-kind discipline output" triple set:
    `rdf:type owl:Class` + `rdfs:label` + `rdfs:comment` + `skos:scopeNote`
    + `dct:source`.
    """
    g = Graph()
    _bind_common(g)

    # --- opda:DiagnosticExemplar (per ADR-0009 lines 94-101) -------------
    g.add((OPDA.DiagnosticExemplar, RDF.type, OWL.Class))
    g.add((OPDA.DiagnosticExemplar, RDFS.label, Literal(
        "Diagnostic Exemplar", lang="en"
    )))
    g.add((OPDA.DiagnosticExemplar, RDFS.comment, Literal(
        "Informational endurant. IC: the named hard case — minimal Turtle "
        "exposing one IC-bearing surface as input to a Council session's "
        "identity-criterion validation. Hard cases: registered freehold "
        "house; unregistered house pre-first-registration; flat with split "
        "UPRN.",
        lang="en",
    )))
    g.add((OPDA.DiagnosticExemplar, SKOS.scopeNote, Literal(
        "DOLCE: NonPhysicalEndurant. UFO: Substance Kind (informational).",
        lang="en",
    )))
    g.add((OPDA.DiagnosticExemplar, DCTERMS.source, _ODR_0004_SECTION_8A))

    # --- opda:GeneratorRun (cites ODR-0004 §6a) --------------------------
    # Author note per ADR-0009 brief: comment + scopeNote authored here,
    # citing ODR-0004 §6a (generator-first; provenance of emission).
    g.add((OPDA.GeneratorRun, RDF.type, OWL.Class))
    g.add((OPDA.GeneratorRun, RDFS.label, Literal(
        "Generator Run", lang="en"
    )))
    g.add((OPDA.GeneratorRun, RDFS.comment, Literal(
        "Information particular. IC: a single execution of the opda-gen "
        "pipeline that produced a specific set of emitted TTL artefacts. "
        "Carries the generator version (opda-gen-<semver>), the source "
        "commit SHA, and the emission timestamp. Per ODR-0004 §6a, every "
        "emission is reproducible from the recorded (version, commit) "
        "pair.",
        lang="en",
    )))
    g.add((OPDA.GeneratorRun, SKOS.scopeNote, Literal(
        "UFO: Information Particular. Provenance unit for byte-identity CI; "
        "instances are minted by the build pipeline, not by hand.",
        lang="en",
    )))
    g.add((OPDA.GeneratorRun, DCTERMS.source, _ODR_0004_SECTION_6A))

    return g


def build_shapes_graph() -> Graph:
    """Build the header-only SHACL shapes graph per ADR-0009 §"opda-shapes.ttl".

    No `sh:NodeShape`/`sh:PropertyShape` triples; only the ontology header
    declaring `opda:targetsClassGraph <https://w3id.org/opda/0.1.0/>`. Module
    shapes are appended by ADR-0012 emissions.
    """
    g = Graph()
    _bind_common(g)
    g.add((_SHAPES_GRAPH_IRI, RDF.type, OWL.Ontology))
    g.add((_SHAPES_GRAPH_IRI, DCTERMS.title, Literal(
        "OPDA SHACL Shapes Graph", lang="en"
    )))
    g.add((_SHAPES_GRAPH_IRI, OPDA.targetsClassGraph, _VERSION_IRI))
    return g


def build_annotations_graph() -> Graph:
    """Build the header-only advisory annotations graph per ADR-0009
    §"opda-annotations.ttl".

    No `sh:*`/`opda:aiHint`/`opda:uiHint`/`opda:exampleValue` triples; only
    the ontology header declaring `opda:targetsClassGraph
    <https://w3id.org/opda/0.1.0/>`. Module annotations (DPV co-annotation;
    LLM hints; UI hints) are appended by ADR-0012 emissions.
    """
    g = Graph()
    _bind_common(g)
    g.add((_ANNOTATIONS_GRAPH_IRI, RDF.type, OWL.Ontology))
    g.add((_ANNOTATIONS_GRAPH_IRI, DCTERMS.title, Literal(
        "OPDA Advisory Annotations Graph", lang="en"
    )))
    g.add((_ANNOTATIONS_GRAPH_IRI, OPDA.targetsClassGraph, _VERSION_IRI))
    return g


# --- Public API ----------------------------------------------------------
def emit_foundation(
    output_dir: Path,
    *,
    emission_date: str | None = None,
    git_sha: str | None = None,
) -> dict[Path, str]:
    """Emit the four foundation TTL files into ``output_dir``.

    Returns a dict mapping written ``Path`` → Turtle content (utf-8 str).
    The dict is the byte-for-byte content of each written file, so callers
    (tests, CI) can inspect emitted content without re-reading from disk.

    ``emission_date`` and ``git_sha`` default to the pinned constants
    (``_FOUNDATION_LAST_MODIFIED`` / ``_FOUNDATION_SOURCE_COMMIT``) per
    ADR-0009. They MUST stay pinned for byte-identity CI to pass; the
    constants advance when a future ADR materially mutates the foundation
    content. Override them in tests to exercise alternate values.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = emission_date or _FOUNDATION_LAST_MODIFIED
    sha_str = git_sha or _FOUNDATION_SOURCE_COMMIT

    builders: list[tuple[str, str, list[str] | None, Graph]] = [
        (
            FOUNDATION_FILENAME,
            "OPDA ontology foundation",
            None,
            build_foundation_graph(date_str),
        ),
        (
            CLASSES_FILENAME,
            "OPDA OWL/RDFS class graph (foundation)",
            [
                "Two foundation classes per ADR-0009 §opda-classes.ttl;",
                "per-module classes land via ADR-0011.",
            ],
            build_classes_graph(),
        ),
        (
            SHAPES_FILENAME,
            "OPDA SHACL shapes graph (foundation skeleton)",
            [
                "Module shapes intentionally empty here; appended by",
                "per-module emission via ADR-0012.",
                "MUST NOT contain owl:Class or owl:imports triples",
                "(ODR-0004 §3a three-graph separation).",
            ],
            build_shapes_graph(),
        ),
        (
            ANNOTATIONS_FILENAME,
            "OPDA advisory annotations graph (foundation skeleton)",
            [
                "Module annotations (DPV co-annotation per ODR-0018; LLM hints;",
                "UI hints) land via ADR-0012 and downstream module ADRs.",
                "MUST NOT contain sh:* or owl:Class triples",
                "(ODR-0004 §3a three-graph separation).",
            ],
            build_annotations_graph(),
        ),
    ]

    written: dict[Path, str] = {}
    for filename, title, extra, graph in builders:
        header = _comment_header(
            filename,
            title=title,
            emission_date=date_str,
            git_sha=sha_str,
            extra_lines=extra,
        )
        body = to_canonical_turtle(graph).decode("utf-8")
        content = header + body
        out_path = output_dir / filename
        out_path.write_text(content, encoding="utf-8", newline="")
        written[out_path] = content
    return written
