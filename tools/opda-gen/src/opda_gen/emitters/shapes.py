"""
Module shapes.

Realises:
- ADR-0012 — SHACL shapes graph emission. Six per-module shape graphs
  plus foundation-level meta-shapes (three-rule interface contract,
  Cat 3 NoIdentityOverride, Cat 5 MetaShapeOverShapeGraph,
  PIIWithoutDPVCoAnnotationRule, DeprecationChainRule).
- ADR-0008 §"CLI design" — `emit-shapes` subcommand surface.
- ADR-0007 §"Deterministic emission rules" — canonical serialiser handles
  ordering; this module just builds rdflib.Graph instances.
- ADR-0007 §"A9 per-kind discipline output" — every emitted shape carries
  `dct:source` resolving to a ratified ODR section.
- ODR-0010 §three-rule interface contract — `sh:in` semantics; `sh:Violation`
  floor; no-identity-override gate. Realised here as foundation meta-shapes.
- ODR-0013 §Q1 — four-tier severity framework with five `sh:Violation`
  categories: (1) identity-key missing/wrong-type; (2) IC breach
  (anti-pattern detection); (3) no-identity-override (per S010 Q6);
  (4) special-category PII without lawful basis; (5) meta-shape-over-
  shape-graph drift. All five categories emit; see _build_*_shapes for
  per-module Cat 1 + Cat 2 shapes and `build_foundation_meta_shapes` for
  Cat 3 + Cat 4 + Cat 5.
- ODR-0017 — SHACL-AF non-blocking quality rules pattern (11 citing sites
  enumerated in ADR-0012 §"SHACL-AF rule emission"). All 11 emit here.
- ODR-0018 — DPV class-level co-annotation pattern. The DPV co-annotations
  themselves live in `opda-annotations.ttl` (see `annotations.py`); this
  module emits the SHACL-AF rule that flags any PII-bearing class lacking
  a DPV co-annotation.
- ODR-0004 §3a — three-graph separation. Shape graphs MUST NOT carry
  `owl:Class` triples or DPV co-annotations; that contract is enforced
  by `tests/test_shapes.py` and the existing `ci-three-graph` test.

Module structure:

- `emit_shapes(output_dir, *, module=None, emission_date=None)` — public
  API. When `module=None`, emits all six module shape files. When
  `module="property"` (etc.), emits only that module's file. Foundation
  shapes are emitted via the `emit_foundation` path in `foundation.py`;
  this module only handles the per-module shape files.
- `build_<module>_shapes()` — six per-module graph builders.
- `build_foundation_meta_shapes(graph)` — extends a graph in place with
  the five foundation-level meta-shapes + SHACL-AF rules. Called by
  `foundation.build_shapes_graph()`.
- Helper builders for the 11 SHACL-AF citing sites:
  `_build_uprn_succession_rule(g)`, `_build_inspire_succession_rule(g)`,
  `_build_prov_o_claims_rule(g)`, `_build_identifier_succession_rule(g)`,
  `_build_capacity_authority_match_rule(g)`,
  `_build_lease_term_succession_rule(g)`,
  `_build_milestone_variance_rule(g)`,
  `_build_verification_activity_succession_rule(g)`.

Severity discipline (per ODR-0013 + ODR-0017):

- Cat 1 (identity-key) — `sh:Violation`.
- Cat 2 (IC breach / anti-pattern) — `sh:Violation`.
- Cat 3 (no-identity-override) — `sh:Violation` (meta-shape over shape graph).
- Cat 4 (special-category PII without lawful basis) — `sh:Violation`.
- Cat 5 (meta-shape-over-shape-graph drift) — `sh:Violation`.
- SHACL-AF rules — `sh:Info` (with substantive succession) or
  `sh:Warning` (without). `PIIWithoutDPVCoAnnotationRule` is `sh:Warning`
  per ADR-0012 §"SHACL-AF rule emission" (silent PII leakage is high-
  impact even though it's flagged via the AF rule mechanism).
"""

from __future__ import annotations

from pathlib import Path

from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

from opda_gen import __version__
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces -----------------------------------------------------------
OPDA = Namespace("https://w3id.org/opda/#")
SH = Namespace("http://www.w3.org/ns/shacl#")
DPV = Namespace("https://w3id.org/dpv#")
DPV_PD = Namespace("https://w3id.org/dpv/pd#")
PROV = Namespace("http://www.w3.org/ns/prov#")
TIME = Namespace("http://www.w3.org/2006/time#")


# --- Sentinel-pinned constants per the G6 convention ---------------------
# ADR-0014: opda:targetsClassGraph refs bump 0.4.0 → 1.0.0 (post G14).
_SHAPES_LAST_MODIFIED = "2026-05-28"
_SHAPES_SOURCE_COMMIT = "pinned-by-ADR-0014"

# Module ratifying-ODR metadata for per-module shape files.
MODULE_SHAPE_METADATA: dict[str, tuple[str, str, str]] = {
    "property": (
        "opda-property-shapes.ttl",
        "OPDA Property Shapes",
        "ODR-0005 + ODR-0013 + ODR-0015 + ODR-0017 + ODR-0018",
    ),
    "agent": (
        "opda-agent-shapes.ttl",
        "OPDA Agent Shapes",
        "ODR-0006 + ODR-0013 + ODR-0017 + ODR-0018",
    ),
    "transaction": (
        "opda-transaction-shapes.ttl",
        "OPDA Transaction Shapes",
        "ODR-0007 + ODR-0013 + ODR-0017",
    ),
    "claim": (
        "opda-claim-shapes.ttl",
        "OPDA Claim Shapes",
        "ODR-0009 + ODR-0013 + ODR-0017 + ODR-0018",
    ),
    "governance": (
        "opda-governance-shapes.ttl",
        "OPDA Governance Shapes",
        "ODR-0012 + ODR-0013 + ODR-0018",
    ),
    "descriptive": (
        "opda-descriptive-shapes.ttl",
        "OPDA Descriptive Shapes",
        "ODR-0008 + ODR-0013",
    ),
}


# --- dct:source URIs to ODR sections -------------------------------------
_ODR_0005_S6A = URIRef("https://w3id.org/opda/odr/ODR-0005#section-6a")
_ODR_0005_RULE_5 = URIRef("https://w3id.org/opda/odr/ODR-0005#section-Rule-5")
_ODR_0005_RULE_6 = URIRef("https://w3id.org/opda/odr/ODR-0005#section-Rule-6")
_ODR_0005_S2A = URIRef("https://w3id.org/opda/odr/ODR-0005#section-2a")
_ODR_0005_S3B = URIRef("https://w3id.org/opda/odr/ODR-0005#section-3b")
_ODR_0005_S3C = URIRef("https://w3id.org/opda/odr/ODR-0005#section-3c")
_ODR_0006_Q1 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q1")
_ODR_0006_Q2 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q2")
_ODR_0006_Q3 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q3")
_ODR_0006_Q4 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q4")
_ODR_0007_Q1 = URIRef("https://w3id.org/opda/odr/ODR-0007#section-Q1")
_ODR_0007_Q5 = URIRef("https://w3id.org/opda/odr/ODR-0007#section-Q5")
_ODR_0007_Q6 = URIRef("https://w3id.org/opda/odr/ODR-0007#section-Q6")
_ODR_0008_Q4A = URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q4a")
_ODR_0008_Q5A = URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q5a")
_ODR_0008D_RULE_1 = URIRef("https://w3id.org/opda/odr/ODR-0008d#section-Rule-1")
_ODR_0008D_RULE_3 = URIRef("https://w3id.org/opda/odr/ODR-0008d#section-Rule-3")
_ODR_0022_S4 = URIRef("https://w3id.org/opda/odr/ODR-0022#section-Rules-4")
# ODR-0024 R11 (council session-028 Q5) — the SHACL constraints the domain-less
# URI properties (opda:mediaUrl / opda:url) need (sh:datatype xsd:anyURI + a URI
# sh:pattern) so they are constrained somewhere, plus the acyclicity guard on
# the self-referential opda:hasSubAssessment.
_ODR_0024_R3 = URIRef("https://w3id.org/opda/odr/ODR-0024#section-Rules-R3")
_ODR_0024_R6 = URIRef("https://w3id.org/opda/odr/ODR-0024#section-Rules-R6")
_ODR_0024_R10 = URIRef("https://w3id.org/opda/odr/ODR-0024#section-Rules-R10")
_ODR_0024_R11 = URIRef("https://w3id.org/opda/odr/ODR-0024#section-Rules-R11")
_ODR_0009_Q1 = URIRef("https://w3id.org/opda/odr/ODR-0009#section-Q1")
_ODR_0009_Q7 = URIRef("https://w3id.org/opda/odr/ODR-0009#section-Q7")
_ODR_0010_Q6 = URIRef("https://w3id.org/opda/odr/ODR-0010#section-Q6")
_ODR_0010_RULE_IN = URIRef("https://w3id.org/opda/odr/ODR-0010#section-Rule-sh-in")
_ODR_0010_RULE_FLOOR = URIRef(
    "https://w3id.org/opda/odr/ODR-0010#section-Rule-violation-floor"
)
_ODR_0011_S5A = URIRef("https://w3id.org/opda/odr/ODR-0011#section-5a")
_ODR_0012_PHASE1 = URIRef("https://w3id.org/opda/odr/ODR-0012#section-Phase-1")
_ODR_0012_Q3 = URIRef("https://w3id.org/opda/odr/ODR-0012#section-Q3")
_ODR_0012_Q5 = URIRef("https://w3id.org/opda/odr/ODR-0012#section-Q5")
_ODR_0013_Q1 = URIRef("https://w3id.org/opda/odr/ODR-0013#section-Q1")
_ODR_0015_S4A = URIRef("https://w3id.org/opda/odr/ODR-0015#section-4a")
_ODR_0017_S1A = URIRef("https://w3id.org/opda/odr/ODR-0017#section-1a")
_ODR_0017_S2A = URIRef("https://w3id.org/opda/odr/ODR-0017#section-2a")


# --- Common helpers -------------------------------------------------------
def _bind_common(graph: Graph) -> None:
    """Bind the prefixes used by shape graphs."""
    graph.bind("opda", OPDA)
    graph.bind("owl", OWL)
    graph.bind("rdfs", RDFS)
    graph.bind("dct", DCTERMS)
    graph.bind("sh", SH)
    graph.bind("xsd", XSD)
    graph.bind("skos", SKOS)
    graph.bind("dpv", DPV)
    graph.bind("dpv-pd", DPV_PD)
    graph.bind("prov", PROV)
    graph.bind("time", TIME)


def _module_shapes_header(
    *,
    module_iri: URIRef,
    title: str,
) -> list[tuple]:
    """Build the per-module ontology-header triples for a shapes graph.

    Per ADR-0009 §"opda-shapes.ttl" + ADR-0012 §"Per-module shapes",
    each shape file has its own ontology IRI pointing at the foundation
    class-graph IRI via `opda:targetsClassGraph`. The file does NOT
    declare `owl:imports` (per ODR-0004 §3a CI check 2 — shapes graph
    must not import other ontologies; it constrains them externally).
    """
    return [
        (module_iri, RDF.type, OWL.Ontology),
        (module_iri, DCTERMS.title, Literal(title, lang="en")),
        (module_iri, OPDA.targetsClassGraph,
         URIRef("https://w3id.org/opda/1.0.0/")),
    ]


def _add_identity_key_shape(
    g: Graph,
    *,
    shape_iri: URIRef,
    target_class: URIRef,
    identity_predicate: URIRef,
    datatype: URIRef,
    message: str,
    source_iri: URIRef,
    min_count: int = 0,
    max_count: int | None = 1,
) -> None:
    """Emit a Category 1 (identity-key) shape.

    Pattern (per ADR-0012 §"Severity tier framework emission"):

    ```turtle
    opda:<Kind>IdentityKeyShape a sh:NodeShape ;
        sh:targetClass opda:<Kind> ;
        sh:property [
            sh:path opda:hasUPRN ;
            sh:maxCount 1 ;
            sh:datatype xsd:string ;
            sh:severity sh:Violation ;
            sh:message "..."@en ;
        ] ;
        dct:source <https://w3id.org/opda/odr/ODR-XXXX#section-Yy> .
    ```

    `min_count` defaults to 0 because the shapes target Substance Kinds
    whose identity-key emission is contingent (per ODR-0005 §6a UPRN is
    a contingent administrative identifier; its presence is checked
    when present, but absence is handled by the SHACL-AF succession
    rule not the identity-key shape).
    """
    pshape = BNode()
    g.add((shape_iri, RDF.type, SH.NodeShape))
    g.add((shape_iri, SH.targetClass, target_class))
    g.add((shape_iri, SH.property, pshape))
    g.add((shape_iri, DCTERMS.source, source_iri))
    g.add((pshape, SH.path, identity_predicate))
    g.add((pshape, SH.datatype, datatype))
    g.add((pshape, SH.severity, SH.Violation))
    g.add((pshape, SH.message, Literal(message, lang="en")))
    if min_count > 0:
        g.add((pshape, SH.minCount, Literal(min_count)))
    if max_count is not None:
        g.add((pshape, SH.maxCount, Literal(max_count)))


def _add_ic_breach_shape(
    g: Graph,
    *,
    shape_iri: URIRef,
    target_class: URIRef,
    forbidden_via_property: URIRef,
    message: str,
    source_iri: URIRef,
) -> None:
    """Emit a Category 2 (IC breach / anti-pattern) shape.

    Pattern: targets a class; declares that the identifying co-reference
    predicate (the canonical OPDA one, e.g. `opda:identifiesSameProperty`)
    MUST be used as `sh:IRI` (which catches accidental owl:sameAs usage
    on the same node — owl:sameAs would have IRI-only objects too, so
    the practical detection is the *presence* of this predicate as the
    co-reference channel). The shape is a hint to humans + a marker for
    machine tooling that this is the IC-preserving predicate to use.
    """
    pshape = BNode()
    g.add((shape_iri, RDF.type, SH.NodeShape))
    g.add((shape_iri, SH.targetClass, target_class))
    g.add((shape_iri, SH.property, pshape))
    g.add((shape_iri, DCTERMS.source, source_iri))
    g.add((pshape, SH.path, forbidden_via_property))
    g.add((pshape, SH.nodeKind, SH.IRI))
    g.add((pshape, SH.severity, SH.Violation))
    g.add((pshape, SH.message, Literal(message, lang="en")))


def _add_sparql_rule_shape(
    g: Graph,
    *,
    shape_iri: URIRef,
    target_class: URIRef,
    sparql_construct: str,
    severity: URIRef,
    source_iri: URIRef,
    rdfs_comment: str,
) -> None:
    """Emit a SHACL-AF rule shape per ODR-0017 §1a template.

    Pattern:

    ```turtle
    opda:<Name>Rule a sh:NodeShape ;
        sh:targetClass <target> ;
        sh:rule [
            a sh:SPARQLRule ;
            sh:construct "..."
        ] ;
        sh:severity sh:Info ;
        dct:source <ODR-XXXX#section-Y> .
    ```
    """
    rule_node = BNode()
    g.add((shape_iri, RDF.type, SH.NodeShape))
    g.add((shape_iri, SH.targetClass, target_class))
    g.add((shape_iri, SH.rule, rule_node))
    g.add((shape_iri, SH.severity, severity))
    g.add((shape_iri, DCTERMS.source, source_iri))
    g.add((shape_iri, RDFS.comment, Literal(rdfs_comment, lang="en")))
    g.add((rule_node, RDF.type, SH.SPARQLRule))
    g.add((rule_node, SH.construct, Literal(sparql_construct)))


# --- Foundation meta-shapes (called by foundation.build_shapes_graph) ----
def build_foundation_meta_shapes(g: Graph) -> None:
    """Extend `g` in place with the five foundation-level meta-shapes
    + the cross-cutting SHACL-AF rules (DeprecationChain, PII-without-DPV).

    Per ADR-0012 §"Three-rule interface contract enforcement" + §"Severity
    tier framework emission" Categories 3 + 5 + §"SHACL-AF rule emission"
    PII rule + ODR-0011 §5a deprecation rule.
    """
    _bind_common(g)

    # --- Category 3: NoIdentityOverride meta-shape (ODR-0010 §Q6) -------
    sparql_node = BNode()
    g.add((OPDA.NoIdentityOverride_MetaShape, RDF.type, SH.NodeShape))
    g.add((OPDA.NoIdentityOverride_MetaShape, SH.targetClass, SH.NodeShape))
    g.add((OPDA.NoIdentityOverride_MetaShape, SH.sparql, sparql_node))
    g.add((OPDA.NoIdentityOverride_MetaShape, SH.severity, SH.Violation))
    g.add((OPDA.NoIdentityOverride_MetaShape, SH.message, Literal(
        "Profile shape attempts to override identity-key of Substance "
        "Kind; identity properties cannot be removed by overlays "
        "(ODR-0010 §Q6 three-rule interface contract).",
        lang="en",
    )))
    g.add((OPDA.NoIdentityOverride_MetaShape, OPDA.metaShapeJustification,
           Literal(
               "ODR-0013 §Q1 Category 3: profile cannot override identity-"
               "key; this meta-shape enforces the three-rule interface "
               "contract per ODR-0010 §Q6.",
               lang="en",
           )))
    g.add((OPDA.NoIdentityOverride_MetaShape, DCTERMS.source, _ODR_0010_Q6))
    g.add((sparql_node, SH.select, Literal(
        "PREFIX opda: <https://w3id.org/opda/#>\n"
        "PREFIX sh: <http://www.w3.org/ns/shacl#>\n"
        "SELECT ?profileShape WHERE {\n"
        "  ?profileShape sh:targetClass ?kind .\n"
        "  ?kind opda:identityKey ?key .\n"
        "  ?profileShape sh:property [ sh:path ?key ; sh:maxCount 0 ] .\n"
        "}"
    )))

    # --- Three-rule interface contract: sh:in semantics meta-shape ------
    sparql_in = BNode()
    g.add((OPDA.ShInSemantics_MetaShape, RDF.type, SH.NodeShape))
    g.add((OPDA.ShInSemantics_MetaShape, SH.targetClass, SH.NodeShape))
    g.add((OPDA.ShInSemantics_MetaShape, SH.sparql, sparql_in))
    g.add((OPDA.ShInSemantics_MetaShape, SH.severity, SH.Violation))
    g.add((OPDA.ShInSemantics_MetaShape, SH.message, Literal(
        "Overlay profile sh:in constraint must union into the base "
        "SKOS scheme members (ODR-0010 three-rule interface contract, "
        "Rule 1).",
        lang="en",
    )))
    g.add((OPDA.ShInSemantics_MetaShape, OPDA.metaShapeJustification,
           Literal(
               "ODR-0010 three-rule interface contract Rule 1: overlay "
               "sh:in MUST be a subset of base sh:in (which itself unions "
               "into the SKOS scheme members per ODR-0011).",
               lang="en",
           )))
    g.add((OPDA.ShInSemantics_MetaShape, DCTERMS.source, _ODR_0010_RULE_IN))
    g.add((sparql_in, SH.select, Literal(
        "PREFIX sh: <http://www.w3.org/ns/shacl#>\n"
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n"
        "SELECT ?overlayShape ?value WHERE {\n"
        "  ?overlayShape sh:property [\n"
        "    sh:path ?path ;\n"
        "    sh:in/rdf:rest*/rdf:first ?value\n"
        "  ] .\n"
        "  ?baseShape sh:property [\n"
        "    sh:path ?path ;\n"
        "    sh:in/rdf:rest*/rdf:first ?baseValue\n"
        "  ] .\n"
        "  FILTER NOT EXISTS {\n"
        "    ?baseScheme skos:hasTopConcept|skos:member ?value .\n"
        "  }\n"
        "}"
    )))

    # --- Three-rule interface contract: sh:Violation floor meta-shape ---
    sparql_floor = BNode()
    g.add((OPDA.ShViolationFloor_MetaShape, RDF.type, SH.NodeShape))
    g.add((OPDA.ShViolationFloor_MetaShape, SH.targetClass, SH.NodeShape))
    g.add((OPDA.ShViolationFloor_MetaShape, SH.sparql, sparql_floor))
    g.add((OPDA.ShViolationFloor_MetaShape, SH.severity, SH.Violation))
    g.add((OPDA.ShViolationFloor_MetaShape, SH.message, Literal(
        "Overlay profile attempts to downgrade a base sh:Violation "
        "severity; ODR-0010 three-rule interface contract Rule 2 "
        "establishes a Violation floor that overlays cannot weaken.",
        lang="en",
    )))
    g.add((OPDA.ShViolationFloor_MetaShape, OPDA.metaShapeJustification,
           Literal(
               "ODR-0010 three-rule interface contract Rule 2: no overlay "
               "shape may set sh:severity to sh:Warning or sh:Info on a "
               "property where the base shape declared sh:Violation.",
               lang="en",
           )))
    g.add((OPDA.ShViolationFloor_MetaShape, DCTERMS.source, _ODR_0010_RULE_FLOOR))
    g.add((sparql_floor, SH.select, Literal(
        "PREFIX sh: <http://www.w3.org/ns/shacl#>\n"
        "SELECT ?overlayShape ?path WHERE {\n"
        "  ?overlayShape sh:property [\n"
        "    sh:path ?path ;\n"
        "    sh:severity ?overlaySev\n"
        "  ] .\n"
        "  ?baseShape sh:property [\n"
        "    sh:path ?path ;\n"
        "    sh:severity sh:Violation\n"
        "  ] .\n"
        "  FILTER (?overlaySev != sh:Violation)\n"
        "}"
    )))

    # --- Category 5: meta-shape-over-shape-graph drift (ODR-0017 §2a) ---
    sparql_meta = BNode()
    g.add((OPDA.MetaShapeOverShapeGraphMetaShape, RDF.type, SH.NodeShape))
    g.add((OPDA.MetaShapeOverShapeGraphMetaShape, SH.targetClass, SH.NodeShape))
    g.add((OPDA.MetaShapeOverShapeGraphMetaShape, SH.sparql, sparql_meta))
    g.add((OPDA.MetaShapeOverShapeGraphMetaShape, SH.severity, SH.Violation))
    g.add((OPDA.MetaShapeOverShapeGraphMetaShape, SH.message, Literal(
        "Meta-shape over shape-graph using sh:Violation severity requires "
        "explicit opda:metaShapeJustification (ODR-0017 §2a amendment).",
        lang="en",
    )))
    g.add((OPDA.MetaShapeOverShapeGraphMetaShape,
           OPDA.metaShapeJustification, Literal(
               "ODR-0013 §Q1 Category 5 + ODR-0017 §2a: meta-shapes "
               "targeting sh:NodeShape using sh:Violation severity must "
               "justify their elevation above the ODR-0017 sh:Info default.",
               lang="en",
           )))
    g.add((OPDA.MetaShapeOverShapeGraphMetaShape, DCTERMS.source, _ODR_0017_S2A))
    g.add((sparql_meta, SH.select, Literal(
        "PREFIX sh: <http://www.w3.org/ns/shacl#>\n"
        "PREFIX opda: <https://w3id.org/opda/#>\n"
        "SELECT ?shape WHERE {\n"
        "  ?shape sh:targetClass sh:NodeShape .\n"
        "  ?shape sh:severity sh:Violation .\n"
        "  FILTER NOT EXISTS {\n"
        "    ?shape opda:metaShapeJustification ?j .\n"
        "  }\n"
        "}"
    )))

    # --- SHACL-AF rule: PIIWithoutDPVCoAnnotationRule (ODR-0012 §Q5) ----
    # Per ADR-0012 §"SHACL-AF rule emission": severity is sh:Warning
    # (not sh:Info) because silent PII leakage is high-impact.
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.PIIWithoutDPVCoAnnotationRule,
        target_class=OWL.Class,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX dpv-pd: <https://w3id.org/dpv/pd#>\n"
            "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n"
            "CONSTRUCT {\n"
            "  ?class opda:hasPIIWithoutCoAnnotationFlag true .\n"
            "}\n"
            "WHERE {\n"
            "  ?class a owl:Class ;\n"
            "         opda:isPIIBearing true .\n"
            "  FILTER NOT EXISTS {\n"
            "    ?class dpv-pd:hasPersonalDataCategory ?category .\n"
            "  }\n"
            "}"
        ),
        severity=SH.Warning,
        source_iri=_ODR_0012_Q5,
        rdfs_comment=(
            "Meta-rule: any class marked opda:isPIIBearing true that lacks "
            "a dpv-pd:hasPersonalDataCategory annotation in the annotation "
            "graph is flagged as a PII-without-co-annotation breach. "
            "Severity sh:Warning per ADR-0012 §SHACL-AF rule emission "
            "(silent PII leakage is high-impact even though the rule is "
            "SHACL-AF-pattern-shaped)."
        ),
    )

    # --- SHACL-AF rule: DeprecationChainRule (ODR-0011 §5a) -------------
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.DeprecationChainRule,
        target_class=SKOS.Concept,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX dct: <http://purl.org/dc/terms/>\n"
            "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n"
            "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n"
            "CONSTRUCT {\n"
            "  ?concept opda:hasDeprecationStatus ?status .\n"
            "  ?concept opda:hasSuccessor ?successor .\n"
            "}\n"
            "WHERE {\n"
            "  ?concept a skos:Concept ;\n"
            "           owl:deprecated true .\n"
            "  OPTIONAL { ?concept dct:isReplacedBy ?successor }\n"
            "  BIND (IF(BOUND(?successor), \"with-succession\", \"without-succession\") AS ?status)\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0011_S5A,
        rdfs_comment=(
            "Meta-rule per ODR-0011 §5a: materialises the deprecation "
            "chain for any SKOS Concept marked owl:deprecated true. "
            "Severity sh:Info when dct:isReplacedBy is present; the "
            "Three-tier severity decision table in ODR-0017 §2a notes "
            "that deprecation-without-successor escalates to sh:Warning "
            "(handled by the materialised opda:hasDeprecationStatus "
            "value rather than a separate shape)."
        ),
    )


# --- Per-module shape builders -------------------------------------------
def build_property_shapes() -> Graph:
    """Emit per-Kind identity + IC breach shapes for the Property module
    plus SHACL-AF rules: UPRNSuccessionRule, INSPIRESuccessionRule.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://w3id.org/opda/property-shapes/")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Property Shapes",
    ):
        g.add(t)

    # --- Cat 1: identity-key shapes -------------------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.PropertyIdentityKeyShape,
        target_class=OPDA.Property,
        identity_predicate=OPDA.hasUPRN,
        datatype=XSD.string,
        message=(
            "Property hasUPRN, when present, MUST be a single xsd:string "
            "value. Absence is admissible (UPRN is a contingent "
            "administrative identifier per ODR-0005 §6a); succession is "
            "tracked by the UPRNSuccessionRule SHACL-AF rule below."
        ),
        source_iri=_ODR_0005_S6A,
    )
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.LegalEstateIdentityKeyShape,
        target_class=OPDA.LegalEstate,
        identity_predicate=OPDA.tenureKind,
        datatype=XSD.string,
        message=(
            "LegalEstate identity surface: tenureKind (Freehold / "
            "Leasehold / Commonhold) MUST be a single xsd:string value "
            "when present. The full rights-bundle IC per ODR-0005 §3b "
            "is enforced by the registered-title binding via "
            "opda:recordsEstate."
        ),
        source_iri=_ODR_0005_S3B,
    )
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.AddressIdentityKeyShape,
        target_class=OPDA.Address,
        identity_predicate=OPDA.addressVariant,
        datatype=XSD.string,
        message=(
            "Address addressVariant MUST be a single xsd:string value "
            "(one of 'title' | 'marketing' | 'inspire') per ODR-0015 "
            "§Rule 6. Distinguishes the authority lifecycle borne by "
            "the Address instance."
        ),
        source_iri=URIRef(
            "https://w3id.org/opda/odr/ODR-0015#section-Rule-6"
        ),
    )

    # --- Cat 2: IC breach shape — opda:identifiesSameProperty -----------
    _add_ic_breach_shape(
        g,
        shape_iri=OPDA.PropertyICBreachShape,
        target_class=OPDA.Property,
        forbidden_via_property=OPDA.identifiesSameProperty,
        message=(
            "Property co-reference MUST use opda:identifiesSameProperty "
            "(an IRI-valued ObjectProperty); owl:sameAs is forbidden per "
            "ODR-0005 Rule 5 because it propagates identity-collapse "
            "across contexts under reasoning."
        ),
        source_iri=_ODR_0005_RULE_5,
    )

    # --- SHACL-AF rule #1: UPRNSuccessionRule (ODR-0005 §6a) ------------
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.UPRNSuccessionRule,
        target_class=OPDA.Property,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX prov: <http://www.w3.org/ns/prov#>\n"
            "CONSTRUCT {\n"
            "  ?property opda:hasUPRNSuccessionStatus ?status .\n"
            "}\n"
            "WHERE {\n"
            "  ?property a opda:Property ;\n"
            "            opda:hasUPRN ?currentUPRN .\n"
            "  OPTIONAL { ?property prov:wasDerivedFrom ?predecessor .\n"
            "             ?predecessor opda:hasUPRN ?priorUPRN .\n"
            "             FILTER (?currentUPRN != ?priorUPRN) }\n"
            "  BIND (IF(BOUND(?priorUPRN), \"succession-tracked\", \"primary-uprn\") AS ?status)\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0005_S6A,
        rdfs_comment=(
            "UPRN succession rule (ODR-0005 §6a; SHACL-AF citing site #1). "
            "Materialises opda:hasUPRNSuccessionStatus on every Property "
            "with a UPRN: 'succession-tracked' when prov:wasDerivedFrom "
            "names a predecessor with a different UPRN; 'primary-uprn' "
            "otherwise. Per ODR-0017 §1a non-blocking-quality-rule pattern."
        ),
    )

    # --- SHACL-AF rule #3: INSPIRESuccessionRule (ODR-0015 §4a) ---------
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.INSPIRESuccessionRule,
        target_class=OPDA.Address,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX prov: <http://www.w3.org/ns/prov#>\n"
            "CONSTRUCT {\n"
            "  ?address opda:hasINSPIRESuccessionStatus ?status .\n"
            "}\n"
            "WHERE {\n"
            "  ?address a opda:Address ;\n"
            "           opda:addressVariant \"inspire\" .\n"
            "  OPTIONAL { ?address prov:wasDerivedFrom ?prior .\n"
            "             ?prior opda:addressVariant \"inspire\" }\n"
            "  BIND (IF(BOUND(?prior), \"inspire-re-issued\", \"inspire-primary\") AS ?status)\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0015_S4A,
        rdfs_comment=(
            "INSPIRE Identifier / OS AddressBase succession rule "
            "(ODR-0015 §4a; SHACL-AF citing site #3). Materialises "
            "opda:hasINSPIRESuccessionStatus on inspire-variant Address "
            "instances. Per ODR-0017 §1a."
        ),
    )

    return g


def build_agent_shapes() -> Graph:
    """Per-Kind identity shapes for the Agent module + SHACL-AF rules:
    IdentifierSuccessionRule (ODR-0006 Q1); CapacityAuthorityMatchRule
    (ODR-0006 Q4).
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://w3id.org/opda/agent-shapes/")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Agent Shapes",
    ):
        g.add(t)

    # --- Cat 1: Person identity-key ------------------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.PersonIdentityKeyShape,
        target_class=OPDA.Person,
        identity_predicate=OPDA.hasAssertedCapacity,
        datatype=XSD.string,
        message=(
            "Person identity-key surface: hasAssertedCapacity MUST be a "
            "single xsd:string value when present. The full Person IC "
            "per ODR-0006 §Q1 is borne by the identifier-bundle (NI "
            "number / passport / driving-licence); succession is tracked "
            "by the IdentifierSuccessionRule SHACL-AF rule below."
        ),
        source_iri=_ODR_0006_Q1,
    )

    # --- Cat 1: Organisation identity-key ------------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.OrganisationIdentityKeyShape,
        target_class=OPDA.Organisation,
        identity_predicate=OPDA.hasAssertedCapacity,
        datatype=XSD.string,
        message=(
            "Organisation identity-key surface: hasAssertedCapacity MUST "
            "be a single xsd:string value when present. Full IC per "
            "ODR-0006 §Q6 borne by the registration-record (LEI / "
            "Companies House number); subclass relationship to "
            "org:Organization preserves cross-vocabulary identity."
        ),
        source_iri=_ODR_0006_Q4,
    )

    # --- Cat 4: special-category PII without lawful basis (per S012 Q3) -
    # Targets Person; expressed as a SHACL-AF SPARQL constraint because the
    # semantics ("IF Person has opda:hasSpecialCategoryData true THEN
    # Person must have dpv:hasLegalBasis") cannot be expressed cleanly
    # with core SHACL constraint components — sh:property + sh:hasValue
    # would force every Person to carry the predicate. SPARQL constraint
    # fires the violation only on the conditional intersection per
    # ODR-0013 §Q1 Cat 4 intent.
    sparql_node = BNode()
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           RDF.type, SH.NodeShape))
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.targetClass, OPDA.Person))
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.severity, SH.Violation))
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.message, Literal(
        "Special-category PII (GDPR Article 10) MUST have an associated "
        "dpv:hasLegalBasis triple. ODR-0012 Phase 1 + ODR-0013 §Q1 "
        "Category 4: lawful-basis-elevated PII is a Violation-tier breach.",
        lang="en",
    )))
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           DCTERMS.source, _ODR_0012_Q3))
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.sparql, sparql_node))
    g.add((sparql_node, SH.select, Literal(
        "PREFIX opda: <https://w3id.org/opda/#>\n"
        "PREFIX dpv: <https://w3id.org/dpv#>\n"
        "SELECT $this ?path WHERE {\n"
        "  $this opda:hasSpecialCategoryData true .\n"
        "  FILTER NOT EXISTS { $this dpv:hasLegalBasis ?basis }\n"
        "  BIND (opda:hasSpecialCategoryData AS ?path)\n"
        "}",
    )))

    # --- SHACL-AF rule #5: IdentifierSuccessionRule (ODR-0006 Q1) -------
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.IdentifierSuccessionRule,
        target_class=OPDA.Person,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX prov: <http://www.w3.org/ns/prov#>\n"
            "CONSTRUCT {\n"
            "  ?person opda:hasIdentifierSuccessionEvent ?event .\n"
            "}\n"
            "WHERE {\n"
            "  ?person a opda:Person .\n"
            "  ?event a opda:NameChangeEvent ;\n"
            "         prov:wasAssociatedWith ?person .\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0006_Q1,
        rdfs_comment=(
            "Person identifier-succession rule (ODR-0006 §Q1; SHACL-AF "
            "citing site #5). Materialises opda:hasIdentifierSuccession"
            "Event for downstream audit when a NameChangeEvent (or "
            "subclass: passport-renewal, NI-renumbering) names the "
            "Person via prov:wasAssociatedWith. Per ODR-0017 §1a."
        ),
    )

    # --- SHACL-AF rule #6: CapacityAuthorityMatchRule (ODR-0006 Q4) -----
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.CapacityAuthorityMatchRule,
        target_class=OPDA.Person,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "CONSTRUCT {\n"
            "  ?agent opda:hasCapacityAuthorityMatchStatus ?status .\n"
            "}\n"
            "WHERE {\n"
            "  ?agent opda:hasAssertedCapacity ?cap .\n"
            "  OPTIONAL { ?agent opda:hasEvidencedAuthority ?auth }\n"
            "  BIND (IF(BOUND(?auth), \"matched\", \"unevidenced-capacity\") AS ?status)\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0006_Q4,
        rdfs_comment=(
            "Capacity-authority match rule (ODR-0006 §Q4; SHACL-AF citing "
            "site #6). Materialises opda:hasCapacityAuthorityMatchStatus "
            "to surface Persons declaring a capacity (e.g. 'Director', "
            "'Trustee') without an evidenced authority triple. Status "
            "value 'unevidenced-capacity' is a hook for "
            "downstream-tooling escalation per ODR-0017 §2a "
            "without-substantive-succession discipline."
        ),
    )

    # --- ODR-0024 R6: ownerType value-space wiring (closes the §G23 gap) --
    # opda:ownerType (rdfs:domain opda:Proprietor) was emitted as a bare
    # xsd:string with no sh:in — the Proprietor bearer has no overlay profile
    # to carry it (the pre-existing §G23 gap). Wire it to opda:OwnerTypeScheme
    # via sh:targetSubjectsOf so the value-space holds standalone.
    _add_enum_value_shape(
        g, OPDA.OwnerTypeValueShape, OPDA.ownerType, "OwnerTypeScheme",
        _ODR_0024_R6,
    )

    return g


def build_transaction_shapes() -> Graph:
    """Transaction-Relator IC shape + LeaseTermSuccession + MilestoneVariance
    SHACL-AF rules.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://w3id.org/opda/transaction-shapes/")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Transaction Shapes",
    ):
        g.add(t)

    # --- Cat 1: Transaction identity-key (the founding-event tuple) ------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.TransactionIdentityKeyShape,
        target_class=OPDA.Transaction,
        identity_predicate=OPDA.occurredAtTime,
        datatype=XSD.dateTime,
        message=(
            "Transaction identity-key surface: occurredAtTime MUST be a "
            "single xsd:dateTime value when present. The full "
            "Transaction-as-Relator IC per ODR-0007 §Q1 is the (mediated-"
            "bearers, founding-event) tuple; this shape covers the "
            "founding-event timestamp."
        ),
        source_iri=_ODR_0007_Q1,
    )

    # --- Cat 1: Milestone identity-key -----------------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.MilestoneIdentityKeyShape,
        target_class=OPDA.Milestone,
        identity_predicate=OPDA.plannedAtTime,
        datatype=XSD.dateTime,
        message=(
            "Milestone plannedAtTime MUST be a single xsd:dateTime value "
            "when present. The variance against occurredAtTime is "
            "tracked by the MilestoneVarianceRule SHACL-AF rule below."
        ),
        source_iri=_ODR_0007_Q6,
    )

    # --- SHACL-AF rule #7: LeaseTermSuccessionRule (ODR-0007 Q5) --------
    # Targets LeaseTerm which is declared in the property module; we
    # reference it by URI.
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.LeaseTermSuccessionRule,
        target_class=OPDA.LeaseTerm,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX prov: <http://www.w3.org/ns/prov#>\n"
            "PREFIX time: <http://www.w3.org/2006/time#>\n"
            "CONSTRUCT {\n"
            "  ?term opda:hasLeaseTermSuccessionStatus ?status .\n"
            "}\n"
            "WHERE {\n"
            "  ?term a opda:LeaseTerm .\n"
            "  OPTIONAL { ?term prov:wasDerivedFrom ?prior .\n"
            "             ?prior a opda:LeaseTerm }\n"
            "  BIND (IF(BOUND(?prior), \"extended-from-predecessor\", \"primary-term\") AS ?status)\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0007_Q5,
        rdfs_comment=(
            "LeaseTerm succession rule (ODR-0007 §Q5; SHACL-AF citing "
            "site #7). Materialises opda:hasLeaseTermSuccessionStatus: "
            "extended-from-predecessor when the term carries "
            "prov:wasDerivedFrom to another LeaseTerm; primary-term "
            "otherwise. Per ODR-0017 §1a + LeaseExtensionEvent (ODR-0005 "
            "§3b)."
        ),
    )

    # --- SHACL-AF rule #8: MilestoneVarianceRule (ODR-0007 Q6) ----------
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.MilestoneVarianceRule,
        target_class=OPDA.Milestone,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n"
            "CONSTRUCT {\n"
            "  ?milestone opda:hasVarianceStatus ?varianceCategory .\n"
            "  ?milestone opda:hasVarianceDays ?days .\n"
            "}\n"
            "WHERE {\n"
            "  ?milestone a opda:Milestone ;\n"
            "             opda:occurredAtTime ?actual ;\n"
            "             opda:plannedAtTime ?planned .\n"
            "  BIND (xsd:integer((?actual - ?planned) / xsd:dayTimeDuration(\"P1D\")) AS ?days)\n"
            "  BIND (IF(?days < 14, \"info-flagged\", \"warning-flagged\") AS ?varianceCategory)\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0007_Q6,
        rdfs_comment=(
            "Milestone variance rule (ODR-0007 §Q6; SHACL-AF citing site "
            "#8). Dynamic severity per ODR-0007 §Q6: less-than-14-day "
            "slip surfaces as 'info-flagged'; otherwise 'warning-flagged'. "
            "The materialised opda:hasVarianceStatus value is the "
            "consumer's escalation hook; the shape itself stays sh:Info "
            "per ODR-0017 §1a (the rule is informative; consumer tooling "
            "interprets the variance category)."
        ),
    )

    return g


def build_claim_shapes() -> Graph:
    """Claim identity + provenance + VerificationActivitySuccession rules."""
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://w3id.org/opda/claim-shapes/")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Claim Shapes",
    ):
        g.add(t)

    # --- Cat 1: Claim identity-key (digest hash) -------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.ClaimIdentityKeyShape,
        target_class=OPDA.Claim,
        identity_predicate=OPDA.digest,
        datatype=XSD.string,
        message=(
            "Claim digest MUST be a single xsd:string value when present. "
            "The digest hashes the (assertion-content, evidence-set, "
            "attestor) tuple per ODR-0009 §Q1."
        ),
        source_iri=_ODR_0009_Q1,
    )

    # --- Cat 1: Evidence identity-key -----------------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA.EvidenceIdentityKeyShape,
        target_class=OPDA.Evidence,
        identity_predicate=OPDA.digest,
        datatype=XSD.string,
        message=(
            "Evidence digest MUST be a single xsd:string value when "
            "present. Provides content-addressable provenance per "
            "ODR-0009 §Q1."
        ),
        source_iri=_ODR_0009_Q1,
    )

    # --- Cat 2: Unprovenanced Claim shape (per ODR-0013 §Q1 + ODR-0009) -
    # ODR-0013 §Severity tiering: an unprovenanced Claim (no
    # prov:wasDerivedFrom and no explicit unverified marker) is a
    # Violation-tier breach. This shape enforces presence of one or the
    # other.
    pshape = BNode()
    g.add((OPDA.UnprovenancedClaimShape, RDF.type, SH.NodeShape))
    g.add((OPDA.UnprovenancedClaimShape, SH.targetClass, OPDA.Claim))
    g.add((OPDA.UnprovenancedClaimShape, SH.property, pshape))
    g.add((OPDA.UnprovenancedClaimShape, DCTERMS.source, _ODR_0009_Q1))
    g.add((pshape, SH.path, PROV.wasDerivedFrom))
    g.add((pshape, SH.minCount, Literal(1)))
    g.add((pshape, SH.severity, SH.Violation))
    g.add((pshape, SH.message, Literal(
        "Claim MUST carry prov:wasDerivedFrom (or be explicitly marked "
        "unverified per Moreau S009 amendment). ODR-0013 §Severity tiering "
        "Cat 2: unprovenanced Claims are a Violation-tier IC breach.",
        lang="en",
    )))

    # --- SHACL-AF rule #4: PROVOClaimsRule (ODR-0009 Q7) ----------------
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.PROVOClaimsRule,
        target_class=OPDA.Claim,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX prov: <http://www.w3.org/ns/prov#>\n"
            "CONSTRUCT {\n"
            "  ?claim opda:hasProvenanceChainStatus ?status .\n"
            "}\n"
            "WHERE {\n"
            "  ?claim a opda:Claim .\n"
            "  OPTIONAL { ?claim prov:wasDerivedFrom ?source }\n"
            "  OPTIONAL { ?claim prov:wasGeneratedBy ?activity }\n"
            "  BIND (IF(BOUND(?source) || BOUND(?activity), \"chain-present\", \"chain-absent\") AS ?status)\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0009_Q7,
        rdfs_comment=(
            "PROV-O Claims/Evidence rule (ODR-0009 §Q7; SHACL-AF citing "
            "site #4). Materialises opda:hasProvenanceChainStatus to "
            "surface Claims with absent or partial PROV-O chains. Per "
            "ODR-0017 §1a; complements the UnprovenancedClaimShape "
            "(which is a Violation-tier shape; this is informative)."
        ),
    )

    # --- SHACL-AF rule #9: VerificationActivitySuccessionRule (ODR-0009 Q7) -
    _add_sparql_rule_shape(
        g,
        shape_iri=OPDA.VerificationActivitySuccessionRule,
        target_class=OPDA.VerificationActivity,
        sparql_construct=(
            "PREFIX opda: <https://w3id.org/opda/#>\n"
            "PREFIX prov: <http://www.w3.org/ns/prov#>\n"
            "CONSTRUCT {\n"
            "  ?activity opda:hasVerificationSuccessionStatus ?status .\n"
            "}\n"
            "WHERE {\n"
            "  ?activity a opda:VerificationActivity .\n"
            "  OPTIONAL { ?activity prov:wasInformedBy ?prior .\n"
            "             ?prior a opda:VerificationActivity }\n"
            "  BIND (IF(BOUND(?prior), \"re-verified\", \"initial-verification\") AS ?status)\n"
            "}"
        ),
        severity=SH.Info,
        source_iri=_ODR_0009_Q7,
        rdfs_comment=(
            "VerificationActivity succession rule (ODR-0009 §Q7; SHACL-AF "
            "citing site #9). Materialises opda:hasVerificationSuccession"
            "Status to track re-verification chains via prov:wasInformedBy. "
            "Per ODR-0017 §1a."
        ),
    )

    return g


def build_governance_shapes() -> Graph:
    """Governance module shape graph — DPV mapping record validation."""
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://w3id.org/opda/governance-shapes/")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Governance Shapes",
    ):
        g.add(t)

    # --- Cat 1: DPVMappingRecord identity-key ---------------------------
    # A DPVMappingRecord MUST target a Kind class (Cat 1: identity surface).
    pshape = BNode()
    g.add((OPDA.DPVMappingRecordIdentityKeyShape, RDF.type, SH.NodeShape))
    g.add((OPDA.DPVMappingRecordIdentityKeyShape,
           SH.targetClass, OPDA.DPVMappingRecord))
    g.add((OPDA.DPVMappingRecordIdentityKeyShape, SH.property, pshape))
    g.add((OPDA.DPVMappingRecordIdentityKeyShape,
           DCTERMS.source, _ODR_0012_PHASE1))
    g.add((pshape, SH.path, OPDA.targetsKind))
    g.add((pshape, SH.minCount, Literal(1)))
    g.add((pshape, SH.maxCount, Literal(1)))
    g.add((pshape, SH.nodeKind, SH.IRI))
    g.add((pshape, SH.severity, SH.Violation))
    g.add((pshape, SH.message, Literal(
        "DPVMappingRecord MUST target exactly one Kind class via "
        "opda:targetsKind. ODR-0012 Phase 1 governance discipline "
        "(reference-not-import for DPV).",
        lang="en",
    )))

    return g


def _peril_concept_uris() -> list[URIRef]:
    """Return the 12 opda:PerilScheme concept URIs (ODR-0008d Rule 2).

    Pulled from the in-code vocabularies scheme registry so the
    RiskAssessment node shape's `sh:in` over opda:peril stays in lock-step
    with the emitted scheme (no re-parse of the Turtle; pure-emitter
    discipline, mirroring profiles._scheme_members).
    """
    from opda_gen.emitters.vocabularies import _all_schemes

    for scheme in _all_schemes():
        if scheme.local_name == "PerilScheme":
            return [scheme.member_uri(m) for m in scheme.members]
    raise ValueError("PerilScheme not found in vocabularies registry")


def _currency_concept_uris() -> list[URIRef]:
    """Return the opda:CurrencyScheme concept URIs (ODR-0024 R3).

    Pulled from the in-code vocabularies registry so the MonetaryAmount node
    shape's `sh:in` over opda:currency stays in lock-step with the emitted
    scheme (mirrors _peril_concept_uris)."""
    from opda_gen.emitters.vocabularies import _all_schemes

    for scheme in _all_schemes():
        if scheme.local_name == "CurrencyScheme":
            return [scheme.member_uri(m) for m in scheme.members]
    raise ValueError("CurrencyScheme not found in vocabularies registry")


def _scheme_notations(local_name: str) -> list[str]:
    """Return a scheme's member notations (ODR-0008d rating value-spaces /
    the Category-D InclusionStatusScheme), from the in-code registry."""
    from opda_gen.emitters.vocabularies import _all_schemes

    for scheme in _all_schemes():
        if scheme.local_name == local_name:
            return [m.notation for m in scheme.members]
    raise ValueError(f"scheme not found in vocabularies registry: {local_name}")


def _add_in_iri_list(g: Graph, prop: BNode, items: list[URIRef]) -> None:
    """Attach a SHACL `sh:in` RDF list of IRIs to ``prop`` (used for
    opda:peril, whose value-space is the PerilScheme concepts)."""
    rdf_list = BNode()
    g.add((prop, SH["in"], rdf_list))
    Collection(g, rdf_list, list(items))


def _add_in_literal_list(g: Graph, prop: BNode, items: list) -> None:
    """Attach a SHACL `sh:in` RDF list of literals to ``prop`` (used for the
    riskIndicator / actionAlertRating / inclusionStatus value-spaces)."""
    rdf_list = BNode()
    g.add((prop, SH["in"], rdf_list))
    Collection(g, rdf_list, list(items))


def _add_enum_value_shape(
    g: Graph, shape_iri: URIRef, prop: URIRef, scheme_local: str,
    source: URIRef,
) -> None:
    """Wire a datatype enum property to its SKOS scheme value-space (ODR-0024
    R5/R6 scheme wiring, ADR-0005 §G23). A base node shape that
    `sh:in`-restricts the property's values to the scheme's member notations
    via `sh:targetSubjectsOf` — the domain-less idiom (mirrors the mediaUrl /
    url value shapes), so the value-space holds standalone without the bearer's
    base shape OR an overlay profile (this is what closes the ownerType gap:
    opda:Proprietor has no overlay)."""
    local = str(prop).rsplit("#", 1)[-1]
    g.add((shape_iri, RDF.type, SH.NodeShape))
    g.add((shape_iri, SH.targetSubjectsOf, prop))
    g.add((shape_iri, DCTERMS.source, source))
    p = BNode()
    g.add((shape_iri, SH.property, p))
    g.add((p, SH.path, prop))
    g.add((p, SH.datatype, XSD.string))
    g.add((p, SH.maxCount, Literal(1)))
    _add_in_literal_list(
        g, p, [Literal(v) for v in _scheme_notations(scheme_local)]
    )
    g.add((p, SH.severity, SH.Violation))
    g.add((p, SH.message, Literal(
        f"opda:{local} MUST be one of the opda:{scheme_local} member values "
        "(ODR-0024 R5/R6 — a controlled value-space sh:in-restricted via "
        "sh:targetSubjectsOf, holding without an overlay profile).",
        lang="en",
    )))


def build_descriptive_shapes() -> Graph:
    """Descriptive attribute shapes.

    Three families:
    1. The §Q4a provenance identity-key shape for the five class-promoted
       descriptive Information Objects (Survey / EPCCertificate / Search /
       Valuation / Comparable) — unchanged.
    2. ODR-0008d Rule 1c — the `opda:RiskAssessment` node shape (~6 property
       shapes) + Rule 6b — per-class internal-structure node shapes for the
       five existing classes (IC ⟨issuing authority, authority reference,
       issue date⟩).
    3. ODR-0022 §4 / session-027 R4 — the transaction-scoped fixtures-list
       node shape tying opda:FixtureItemScheme + opda:inclusionStatus.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://w3id.org/opda/descriptive-shapes/")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Descriptive Shapes",
    ):
        g.add(t)

    # --- Cat 1: identity-key shapes for the five class-promoted Kinds ---
    # Per ODR-0008 Q4a — Survey, EPCCertificate, Search, Valuation,
    # Comparable are Information Objects (ODR-0008d Rule 3 retro-correction).
    # Each carries a PROV-O Entity-typed identity surface: their
    # rdfs:subClassOf prov:Entity is the surface; here we check presence of
    # the prov:wasGeneratedBy chain — the IC discriminator for class-
    # promotion.
    for cls in (
        OPDA.Survey, OPDA.EPCCertificate, OPDA.Search,
        OPDA.Valuation, OPDA.Comparable,
    ):
        shape_iri = URIRef(f"{str(cls)}IdentityKeyShape")
        pshape = BNode()
        g.add((shape_iri, RDF.type, SH.NodeShape))
        g.add((shape_iri, SH.targetClass, cls))
        g.add((shape_iri, SH.property, pshape))
        g.add((shape_iri, DCTERMS.source, _ODR_0008_Q4A))
        g.add((pshape, SH.path, PROV.wasGeneratedBy))
        g.add((pshape, SH.minCount, Literal(1)))
        g.add((pshape, SH.severity, SH.Violation))
        g.add((pshape, SH.message, Literal(
            "Class-promoted descriptive Information Object MUST carry "
            "prov:wasGeneratedBy to its issuing activity per ODR-0008 "
            "§Q4a three-criterion test (authority-retrieved provenance "
            "is the IC discriminator for class-promotion).",
            lang="en",
        )))

    # --- Rule 6b: per-class internal-structure node shapes --------------
    # ODR-0008d Rule 3 — each of the five Information Objects has IC
    # ⟨issuing authority, authority reference/number, issue date⟩ (extrinsic,
    # provenance-grounded). Realised as per-class node shapes: issuing
    # authority → prov:wasAttributedTo (sh:IRI); authority reference/number →
    # opda:disclosureDetail-grade xsd:string; issue date →
    # prov:generatedAtTime (xsd:dateTime). Severity sh:Info (the IC is
    # advisory internal structure, not a Violation-tier identity-key — that
    # floor is the prov:wasGeneratedBy shape above).
    for cls, ref_label in (
        (OPDA.Survey, "survey"),
        (OPDA.EPCCertificate, "EPC certificate"),
        (OPDA.Search, "search"),
        (OPDA.Valuation, "valuation"),
        (OPDA.Comparable, "comparable record"),
    ):
        shape_iri = URIRef(f"{str(cls)}InternalStructureShape")
        g.add((shape_iri, RDF.type, SH.NodeShape))
        g.add((shape_iri, SH.targetClass, cls))
        g.add((shape_iri, DCTERMS.source, _ODR_0008D_RULE_3))
        # issuing authority — prov:wasAttributedTo (an Agent IRI)
        p_auth = BNode()
        g.add((shape_iri, SH.property, p_auth))
        g.add((p_auth, SH.path, PROV.wasAttributedTo))
        g.add((p_auth, SH.nodeKind, SH.IRI))
        g.add((p_auth, SH.severity, SH.Info))
        g.add((p_auth, SH.message, Literal(
            f"The {ref_label}'s issuing authority SHOULD be named via "
            "prov:wasAttributedTo (IC component 1 of 3 — issuing authority; "
            "ODR-0008d Rule 3).",
            lang="en",
        )))
        # authority reference / number — a disclosureDetail-grade string
        p_ref = BNode()
        g.add((shape_iri, SH.property, p_ref))
        g.add((p_ref, SH.path, OPDA.disclosureDetail))
        g.add((p_ref, SH.datatype, XSD.string))
        g.add((p_ref, SH.severity, SH.Info))
        g.add((p_ref, SH.message, Literal(
            f"The {ref_label}'s authority reference / number SHOULD be "
            "recorded (IC component 2 of 3 — authority reference; ODR-0008d "
            "Rule 3), carried by opda:disclosureDetail with an instance-level "
            "dct:source to the reference question.",
            lang="en",
        )))
        # issue date — prov:generatedAtTime
        p_date = BNode()
        g.add((shape_iri, SH.property, p_date))
        g.add((p_date, SH.path, PROV.generatedAtTime))
        g.add((p_date, SH.datatype, XSD.dateTime))
        g.add((p_date, SH.maxCount, Literal(1)))
        g.add((p_date, SH.severity, SH.Info))
        g.add((p_date, SH.message, Literal(
            f"The {ref_label}'s issue date SHOULD be named via "
            "prov:generatedAtTime (IC component 3 of 3 — issue date; "
            "ODR-0008d Rule 3).",
            lang="en",
        )))

    # --- Rule 1c: the opda:RiskAssessment node shape (~6 property shapes) -
    g.add((OPDA.RiskAssessmentShape, RDF.type, SH.NodeShape))
    g.add((OPDA.RiskAssessmentShape, SH.targetClass, OPDA.RiskAssessment))
    g.add((OPDA.RiskAssessmentShape, DCTERMS.source, _ODR_0008D_RULE_1))

    # (1) opda:peril — sh:in the 12 PerilScheme concepts.
    p_peril = BNode()
    g.add((OPDA.RiskAssessmentShape, SH.property, p_peril))
    g.add((p_peril, SH.path, OPDA.peril))
    g.add((p_peril, SH.maxCount, Literal(1)))
    g.add((p_peril, SH.nodeKind, SH.IRI))
    _add_in_iri_list(g, p_peril, _peril_concept_uris())
    g.add((p_peril, SH.severity, SH.Violation))
    g.add((p_peril, SH.message, Literal(
        "RiskAssessment opda:peril MUST be one of the 12 opda:PerilScheme "
        "concepts (a dereferenceable peril, never an opaque string; "
        "ODR-0008d Rule 1c / Rule 2).",
        lang="en",
    )))

    # (2) opda:riskIndicator — sh:in the YesNoNotKnownScheme value-space.
    # riskIndicator's value-space {No, Not known, Yes} IS YesNoNotKnownScheme;
    # it reuses that scheme rather than minting a duplicate (ODR-0022 Cat C).
    p_ri = BNode()
    g.add((OPDA.RiskAssessmentShape, SH.property, p_ri))
    g.add((p_ri, SH.path, OPDA.riskIndicator))
    g.add((p_ri, SH.maxCount, Literal(1)))
    _add_in_literal_list(
        g, p_ri,
        [Literal(v) for v in _scheme_notations("YesNoNotKnownScheme")],
    )
    g.add((p_ri, SH.severity, SH.Violation))
    g.add((p_ri, SH.message, Literal(
        "RiskAssessment opda:riskIndicator MUST be one of the "
        "opda:YesNoNotKnownScheme values (No / Not known / Yes; ODR-0008d "
        "Rule 1c / Rule 4).",
        lang="en",
    )))

    # (3) opda:actionAlertRating — sh:in the ActionAlertRatingScheme (1..5).
    p_aar = BNode()
    g.add((OPDA.RiskAssessmentShape, SH.property, p_aar))
    g.add((p_aar, SH.path, OPDA.actionAlertRating))
    g.add((p_aar, SH.maxCount, Literal(1)))
    _add_in_literal_list(
        g, p_aar,
        [Literal(int(v), datatype=XSD.integer)
         for v in _scheme_notations("ActionAlertRatingScheme")],
    )
    g.add((p_aar, SH.severity, SH.Violation))
    g.add((p_aar, SH.message, Literal(
        "RiskAssessment opda:actionAlertRating MUST be one of the "
        "opda:ActionAlertRatingScheme levels (integer 1–5, 1 Green … 5 Red; "
        "ODR-0008d Rule 1c / Rule 4).",
        lang="en",
    )))

    # (4) result / summary / recommendations — opda:disclosureDetail-grade
    # strings (Rule 1c). Collapsed to the ONE reusable disclosure property
    # (ODR-0022 Category A); the specific field is carried by the instance-
    # level dct:source, never a per-field property.
    p_detail = BNode()
    g.add((OPDA.RiskAssessmentShape, SH.property, p_detail))
    g.add((p_detail, SH.path, OPDA.disclosureDetail))
    g.add((p_detail, SH.datatype, XSD.string))
    g.add((p_detail, SH.severity, SH.Info))
    g.add((p_detail, SH.message, Literal(
        "RiskAssessment result / summary / recommendations are "
        "opda:disclosureDetail-grade strings (ODR-0008d Rule 1c); the "
        "specific field is carried by the instance-level dct:source, never "
        "a per-field property (ODR-0022 §Rules.6).",
        lang="en",
    )))

    # (5) prov:wasAttributedTo — datasetAttribution (Rule 1c / Rule 5:
    # datasetAttribution ≡ prov:wasAttributedTo; reuse, do NOT mint).
    p_attr = BNode()
    g.add((OPDA.RiskAssessmentShape, SH.property, p_attr))
    g.add((p_attr, SH.path, PROV.wasAttributedTo))
    g.add((p_attr, SH.nodeKind, SH.IRI))
    g.add((p_attr, SH.severity, SH.Info))
    g.add((p_attr, SH.message, Literal(
        "RiskAssessment datasetAttribution REUSES prov:wasAttributedTo "
        "(ODR-0008d Rule 5 — the dataset's licensing/copyright Agent; "
        "opda:datasetAttribution is NEVER minted).",
        lang="en",
    )))

    # (6) opda:hasSubAssessment — recursion via sh:node opda:RiskAssessment
    # for riskSubcategories[] (Rule 1c / Rule 4). A sub-result is itself a
    # leaf RiskAssessment validated by this same shape.
    p_sub = BNode()
    g.add((OPDA.RiskAssessmentShape, SH.property, p_sub))
    g.add((p_sub, SH.path, OPDA.hasSubAssessment))
    g.add((p_sub, SH.node, OPDA.RiskAssessmentShape))
    g.add((p_sub, SH.severity, SH.Violation))
    # ODR-0024 R11: acyclicity guard. Core SHACL cannot express "the
    # opda:hasSubAssessment graph is a tree" (no transitive-closure test in a
    # core property shape), so the guard is (a) sh:maxCount on each step is left
    # OPEN (a result legitimately carries many sub-results) but (b) the
    # self-reference is bounded by this documented acyclicity requirement: a
    # RiskAssessment MUST NOT be its own (transitive) sub-assessment. A
    # validator enforcing it needs a SHACL-AF closure rule (deferred — flagged
    # here, not minted, to avoid a speculative AF rule); the note records the
    # constraint so the recursion is not read as permitting cycles.
    g.add((p_sub, SH.message, Literal(
        "Each opda:hasSubAssessment (a riskSubcategories[] entry) MUST "
        "itself satisfy the RiskAssessment shape — the self-referential "
        "result recursion via sh:node (ODR-0008d Rule 1c / Rule 4). "
        "ACYCLICITY (ODR-0024 R11): the sub-assessment graph MUST be acyclic "
        "— a RiskAssessment MUST NOT be its own transitive sub-assessment "
        "(core SHACL cannot test transitive closure; a SHACL-AF closure rule "
        "is the enforcement vehicle, deferred).",
        lang="en",
    )))

    # --- ODR-0022 §4 / S027 R4: transaction-scoped fixtures-list shape ---
    # The inclusion of a fixtures item is a Mode/Relator of the SALE
    # TRANSACTION (NOT a Quality of opda:Property), so the fixtures-list
    # shape is transaction-scoped — sh:targetClass opda:Transaction. It ties
    # opda:FixtureItemScheme (the item vocabulary) to opda:inclusionStatus
    # (sh:in Included/Excluded/None) + opda:price + opda:disclosureDetail
    # (the A-grade comment). NO FixtureItem class is minted (ODR-0022 §4 —
    # promotion only on a named §Q4a query; none attested).
    g.add((OPDA.FixturesListShape, RDF.type, SH.NodeShape))
    g.add((OPDA.FixturesListShape, SH.targetClass, OPDA.Transaction))
    g.add((OPDA.FixturesListShape, DCTERMS.source, _ODR_0022_S4))
    # Tie the controlled item vocabulary (FixtureItemScheme) without minting
    # an item-reference predicate or a FixtureItem class.
    g.add((OPDA.FixturesListShape, DCTERMS.references, OPDA.FixtureItemScheme))
    g.add((OPDA.FixturesListShape, RDFS.comment, Literal(
        "Transaction-scoped fixtures-and-fittings list (ODR-0022 §4 / "
        "session-027 R4). The fixtures items are the opda:FixtureItemScheme "
        "concepts (referenced via dct:references); each item's inclusion in "
        "THIS sale is opda:inclusionStatus — a Mode/Relator of the sale "
        "transaction, NOT a Quality of opda:Property. price + comment "
        "(opda:disclosureDetail) accompany the inclusion. NO FixtureItem "
        "class is minted.",
        lang="en",
    )))
    # opda:inclusionStatus — sh:in the InclusionStatusScheme value-space.
    p_incl = BNode()
    g.add((OPDA.FixturesListShape, SH.property, p_incl))
    g.add((p_incl, SH.path, OPDA.inclusionStatus))
    _add_in_literal_list(
        g, p_incl,
        [Literal(v) for v in _scheme_notations("InclusionStatusScheme")],
    )
    g.add((p_incl, SH.severity, SH.Violation))
    g.add((p_incl, SH.message, Literal(
        "Fixtures-item opda:inclusionStatus MUST be one of the "
        "opda:InclusionStatusScheme values (Excluded / Included / None) — a "
        "sale-transaction Mode, never a Quality of opda:Property (ODR-0022 "
        "§4 / session-027 R4).",
        lang="en",
    )))
    # opda:price — a shared monetary-amount (xsd:decimal).
    p_price = BNode()
    g.add((OPDA.FixturesListShape, SH.property, p_price))
    g.add((p_price, SH.path, OPDA.price))
    g.add((p_price, SH.datatype, XSD.decimal))
    g.add((p_price, SH.severity, SH.Info))
    g.add((p_price, SH.message, Literal(
        "Fixtures-item opda:price is the shared monetary-amount property "
        "(one property reused across all items; ODR-0022 §4 — never one "
        "price property per item).",
        lang="en",
    )))
    # opda:disclosureDetail — the A-grade fixtures comment.
    p_comment = BNode()
    g.add((OPDA.FixturesListShape, SH.property, p_comment))
    g.add((p_comment, SH.path, OPDA.disclosureDetail))
    g.add((p_comment, SH.datatype, XSD.string))
    g.add((p_comment, SH.severity, SH.Info))
    g.add((p_comment, SH.message, Literal(
        "Fixtures-item comment reuses opda:disclosureDetail (A-grade; "
        "ODR-0022 §4) — never a per-item comment property.",
        lang="en",
    )))

    # --- ODR-0024 R11: domain-less URI properties (mediaUrl / url) ------
    # opda:mediaUrl and opda:url are intentionally rdfs:domain-less (genuinely
    # cross-artefact references; forcing a bearer would assert false inherence —
    # ODR-0024 R11 / session-028 Q5). They were therefore unconstrained
    # anywhere. Each gets a node shape targeting the SUBJECTS of the property
    # (sh:targetSubjectsOf — the domain-less idiom; no sh:targetClass) carrying
    # sh:datatype xsd:anyURI + a URI sh:pattern, so the value is constrained to
    # a well-formed http(s) URI even without a bearer class. (The data
    # dictionary's mediaUrl / url leaves are web URLs — image / floorplan /
    # contract-template / planning-permission-page links.)
    _uri_pattern = "^https?://"
    for shape_iri, prop, ref_label in (
        (OPDA.MediaUrlShape, OPDA.mediaUrl, "media URL"),
        (OPDA.UrlShape, OPDA.url, "URL"),
    ):
        g.add((shape_iri, RDF.type, SH.NodeShape))
        g.add((shape_iri, SH.targetSubjectsOf, prop))
        g.add((shape_iri, DCTERMS.source, _ODR_0024_R11))
        p_uri = BNode()
        g.add((shape_iri, SH.property, p_uri))
        g.add((p_uri, SH.path, prop))
        g.add((p_uri, SH.datatype, XSD.anyURI))
        g.add((p_uri, SH.pattern, Literal(_uri_pattern)))
        g.add((p_uri, SH.severity, SH.Violation))
        g.add((p_uri, SH.message, Literal(
            f"opda:{str(prop).rsplit('#', 1)[-1]} ({ref_label}) MUST be a "
            "well-formed http(s) URI (sh:datatype xsd:anyURI + URI "
            "sh:pattern). The property is rdfs:domain-less (cross-artefact "
            "reference; ODR-0024 R11 / session-028 Q5) — this shape "
            "constrains its value-space via sh:targetSubjectsOf rather than a "
            "bearer class.",
            lang="en",
        )))

    # --- ODR-0024 R3: the opda:MonetaryAmount value-structure node shape -
    # The monetary walk (ADR-0005 §G22). A MonetaryAmount is a by-value
    # structure: a magnitude (opda:amount, xsd:decimal) in a currency
    # (opda:currency, an opda:CurrencyScheme ISO-4217 concept). Both are
    # required (sh:minCount 1) and single-valued — currency is "never absent
    # on the value type" (session-028 Q3); the overlay profile supplies GBP as
    # the default. currency is sh:in-restricted to the CurrencyScheme concepts
    # (a dereferenceable code, never an opaque string — as opda:peril is to
    # PerilScheme).
    g.add((OPDA.MonetaryAmountShape, RDF.type, SH.NodeShape))
    g.add((OPDA.MonetaryAmountShape, SH.targetClass, OPDA.MonetaryAmount))
    g.add((OPDA.MonetaryAmountShape, DCTERMS.source, _ODR_0024_R3))

    p_amount = BNode()
    g.add((OPDA.MonetaryAmountShape, SH.property, p_amount))
    g.add((p_amount, SH.path, OPDA.amount))
    g.add((p_amount, SH.datatype, XSD.decimal))
    g.add((p_amount, SH.minCount, Literal(1)))
    g.add((p_amount, SH.maxCount, Literal(1)))
    g.add((p_amount, SH.severity, SH.Violation))
    g.add((p_amount, SH.message, Literal(
        "opda:MonetaryAmount MUST carry exactly one opda:amount magnitude "
        "(xsd:decimal) — the numeric dimension of the value structure "
        "(ODR-0024 R3).",
        lang="en",
    )))

    p_currency = BNode()
    g.add((OPDA.MonetaryAmountShape, SH.property, p_currency))
    g.add((p_currency, SH.path, OPDA.currency))
    g.add((p_currency, SH.nodeKind, SH.IRI))
    g.add((p_currency, SH.minCount, Literal(1)))
    g.add((p_currency, SH.maxCount, Literal(1)))
    _add_in_iri_list(g, p_currency, _currency_concept_uris())
    g.add((p_currency, SH.severity, SH.Violation))
    g.add((p_currency, SH.message, Literal(
        "opda:MonetaryAmount MUST carry exactly one opda:currency, one of the "
        "opda:CurrencyScheme concepts (a dereferenceable ISO-4217 code, never "
        "an opaque string; never absent on the value type — ODR-0024 R3). The "
        "overlay profile supplies GBP as the default.",
        lang="en",
    )))

    # --- ODR-0024 R5/R6: enum value-space wiring (the §G23 scheme wiring) -
    # The six R6-surfaced enum properties (+ marketingTenure over the existing
    # opda:TenureKindScheme, reuse-before-mint) are sh:in-restricted to their
    # SKOS scheme member notations via sh:targetSubjectsOf — realising the
    # "wire the minted schemes to their consuming properties" step at base-shape
    # level, so the value-space holds without an overlay (ADR-0005 §G23).
    for shape_iri, prop, scheme_local in (
        (OPDA.ConstructionTypeValueShape, OPDA.constructionType,
         "ConstructionTypeScheme"),
        (OPDA.PriceQualifierValueShape, OPDA.priceQualifier,
         "PriceQualifierScheme"),
        (OPDA.TransportTypeValueShape, OPDA.transportType,
         "TransportTypeScheme"),
        (OPDA.BroadbandConnectionValueShape, OPDA.typeOfConnection,
         "BroadbandConnectionTypeScheme"),
        (OPDA.OfstedRatingValueShape, OPDA.ofstedRating, "OfstedRatingScheme"),
        (OPDA.MarketingTenureValueShape, OPDA.marketingTenure,
         "TenureKindScheme"),
    ):
        _add_enum_value_shape(g, shape_iri, prop, scheme_local, _ODR_0024_R6)

    # --- ODR-0024 R10 / session-030: the opda:RoomDimension value structure --
    # An anonymous by-value structure (the opda:MonetaryAmount precedent): a
    # KEYLESS node shape (length/width xsd:decimal, roomName xsd:string), NO
    # identity key (it has no IC — individuated by value; roomName is non-rigid
    # and never a key), NO base sh:minCount (per-form cardinality lives in the
    # overlay profile, ODR-0010 §Q7a).
    g.add((OPDA.RoomDimensionShape, RDF.type, SH.NodeShape))
    g.add((OPDA.RoomDimensionShape, SH.targetClass, OPDA.RoomDimension))
    g.add((OPDA.RoomDimensionShape, DCTERMS.source, _ODR_0024_R10))
    for _rd_path, _rd_dt, _rd_ref in (
        (OPDA.length, XSD.decimal, "length (metres)"),
        (OPDA.width, XSD.decimal, "width (metres)"),
        (OPDA.roomName, XSD.string, "roomName (non-rigid label)"),
    ):
        p_rd = BNode()
        g.add((OPDA.RoomDimensionShape, SH.property, p_rd))
        g.add((p_rd, SH.path, _rd_path))
        g.add((p_rd, SH.datatype, _rd_dt))
        g.add((p_rd, SH.maxCount, Literal(1)))
        g.add((p_rd, SH.severity, SH.Violation))
        g.add((p_rd, SH.message, Literal(
            f"opda:RoomDimension {_rd_ref} is a single-valued by-value field "
            "(ODR-0024 R10 / session-030); the structure carries NO identity "
            "key (it is individuated by value, the opda:MonetaryAmount pattern) "
            "and opda:roomName is non-rigid — never a key.",
            lang="en",
        )))

    return g


# --- Module-registry dispatcher -----------------------------------------
SHAPES_MODULE_REGISTRY: dict[str, callable] = {
    "property": build_property_shapes,
    "agent": build_agent_shapes,
    "transaction": build_transaction_shapes,
    "claim": build_claim_shapes,
    "governance": build_governance_shapes,
    "descriptive": build_descriptive_shapes,
}


# --- Public API: emit_shapes ---------------------------------------------
def _comment_header(
    *,
    filename: str,
    title: str,
    ratifying_odrs: str,
    emission_date: str,
    git_sha: str,
) -> str:
    """Build the generator-comment block prepended to every shapes TTL."""
    lines = [
        f"# {filename} — {title}",
        f"# Generated by opda-gen {__version__} at {emission_date}; "
        f"DO NOT HAND-EDIT.",
        "# Specification: "
        "https://openpropdata.org.uk/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://openpropdata.org.uk/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://openpropdata.org.uk/adr/ADR-0012-shacl-and-dpv-annotation-emission",
        f"# Ratifying ODR(s): {ratifying_odrs}",
        f"# Generator version: opda-gen-{__version__}",
        f"# Source commit: {git_sha}",
        "# MUST NOT contain owl:Class or owl:imports triples",
        "# (ODR-0004 §3a three-graph separation).",
        "",
    ]
    return "\n".join(lines) + "\n"


def emit_shapes(
    output_dir: Path,
    *,
    module: str | None = None,
    emission_date: str | None = None,
    git_sha: str | None = None,
) -> dict[Path, str]:
    """Emit per-module SHACL shape TTLs into ``output_dir``.

    When ``module`` is None, emits all six per-module shape files
    (property / agent / transaction / claim / governance / descriptive).
    When ``module="property"`` (etc.), emits only that module's shape
    file. The foundation shapes graph (`opda-shapes.ttl`) is emitted
    via `opda_gen.emitters.foundation.emit_foundation()`, not here.

    Returns a dict mapping written Path → Turtle content (utf-8 str) so
    callers (tests, CI) can inspect emitted content without re-reading
    from disk.

    Raises ValueError if ``module`` is not one of the six known names.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = emission_date or _SHAPES_LAST_MODIFIED
    sha_str = git_sha or _SHAPES_SOURCE_COMMIT

    if module is not None:
        if module not in SHAPES_MODULE_REGISTRY:
            valid = ", ".join(sorted(SHAPES_MODULE_REGISTRY))
            raise ValueError(
                f"unknown shapes module {module!r}; valid: {valid}"
            )
        names = [module]
    else:
        names = ["property", "agent", "transaction", "claim",
                 "governance", "descriptive"]

    written: dict[Path, str] = {}
    for name in names:
        builder = SHAPES_MODULE_REGISTRY[name]
        filename, title, ratifying_odrs = MODULE_SHAPE_METADATA[name]
        graph = builder()
        header = _comment_header(
            filename=filename,
            title=title,
            ratifying_odrs=ratifying_odrs,
            emission_date=date_str,
            git_sha=sha_str,
        )
        body = to_canonical_turtle(graph).decode("utf-8")
        content = header + body
        out_path = output_dir / filename
        out_path.write_text(content, encoding="utf-8", newline="")
        written[out_path] = content
    return written


# --- Legacy stub kept for backward compat with any pre-ADR-0012 caller ---
def emit(output_dir: Path) -> dict[Path, str]:
    """Backward-compatible alias for `emit_shapes(output_dir)`."""
    return emit_shapes(output_dir)
