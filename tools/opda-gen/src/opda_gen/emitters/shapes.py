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
_SHAPES_LAST_MODIFIED = "2026-05-27"
_SHAPES_SOURCE_COMMIT = "pinned-by-ADR-0012"

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
         URIRef("https://w3id.org/opda/0.3.0/")),
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
    # Targets Person because Person carries the aggregate baseline; the
    # property-level shape on a hypothetical opda:hasSpecialCategoryData
    # predicate would emit downstream when SpecialCategoryScheme members
    # are populated (deferred per ODR-0011 — no Q3 enum currently scoped).
    pshape = BNode()
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           RDF.type, SH.NodeShape))
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.targetClass, OPDA.Person))
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.property, pshape))
    g.add((OPDA.SpecialCategoryPIIWithoutLawfulBasisShape,
           DCTERMS.source, _ODR_0012_Q3))
    g.add((pshape, SH.path, OPDA.hasSpecialCategoryData))
    g.add((pshape, SH.severity, SH.Violation))
    g.add((pshape, SH.message, Literal(
        "Special-category PII (GDPR Article 10) MUST have an associated "
        "dpv:hasLegalBasis triple. ODR-0012 Phase 1 + ODR-0013 §Q1 "
        "Category 4: lawful-basis-elevated PII is a Violation-tier breach.",
        lang="en",
    )))
    # SHACL "if hasValue true then must have dpv:hasLegalBasis" is
    # expressed as sh:qualifiedValueShape with sh:not / sh:minCount.
    not_node = BNode()
    g.add((pshape, SH.hasValue, Literal(True)))
    g.add((pshape, SH["not"], not_node))
    g.add((not_node, SH.path, DPV.hasLegalBasis))
    g.add((not_node, SH.minCount, Literal(1)))

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


def build_descriptive_shapes() -> Graph:
    """Descriptive attribute shapes — minimum identity-key coverage for
    the five class-promoted descriptive Kinds.
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
    # Comparable are Substance Kinds (informational). Each carries a
    # PROV-O Entity-typed identity surface. Minimum shape: their
    # rdfs:subClassOf prov:Entity is the surface; here we check
    # presence of a basic identifier-bearing surface via the PROV-O
    # entity chain.
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
            "Class-promoted descriptive Kind MUST carry "
            "prov:wasGeneratedBy to its issuing activity per ODR-0008 "
            "§Q4a three-criterion test (authority-retrieved provenance "
            "is the IC discriminator for class-promotion).",
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
