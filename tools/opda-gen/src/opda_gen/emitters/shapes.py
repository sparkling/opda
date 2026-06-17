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
from opda_gen.namespaces import OPDA, OPDA_SCHEME, OPDA_SHAPE
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces -----------------------------------------------------------
# OPDA (terms), OPDA_SHAPE (shape nodes), OPDA_SCHEME (SKOS) come from the SoT.
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
_ODR_0005_S6A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-6a")
_ODR_0005_RULE_5 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-Rule-5")
_ODR_0005_RULE_6 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-Rule-6")
_ODR_0005_S2A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-2a")
_ODR_0005_S3B = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3b")
_ODR_0005_S3C = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3c")
_ODR_0006_Q1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q1")
_ODR_0006_Q2 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q2")
_ODR_0006_Q3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q3")
_ODR_0006_Q4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q4")
_ODR_0007_Q1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q1")
_ODR_0007_Q5 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q5")
_ODR_0007_Q6 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q6")
_ODR_0008_Q4A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q4a")
_ODR_0008_Q5A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q5a")
_ODR_0008D_RULE_1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008d/section-Rule-1")
_ODR_0008D_RULE_3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008d/section-Rule-3")
_ODR_0022_S4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0022/section-Rules-4")
# ODR-0024 R11 (council session-028 Q5) — the SHACL constraints the domain-less
# URI properties (opda:mediaUrl / opda:url) need (sh:datatype xsd:anyURI + a URI
# sh:pattern) so they are constrained somewhere, plus the acyclicity guard on
# the self-referential opda:hasSubAssessment.
_ODR_0024_R3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0024/section-Rules-R3")
_ODR_0024_R6 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0024/section-Rules-R6")
_ODR_0024_R10 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0024/section-Rules-R10")
_ODR_0031_R3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0031/section-R3")
_ADR_0046 = URIRef("https://opda.org.uk/pdtf/harness/adr/ADR-0046")
_ODR_0024_R11 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0024/section-Rules-R11")
_ODR_0009_Q1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1")
_ODR_0009_Q7 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q7")
_ODR_0010_Q6 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0010/section-Q6")
_ODR_0010_RULE_IN = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0010/section-Rule-sh-in")
_ODR_0010_RULE_FLOOR = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0010/section-Rule-violation-floor"
)
_ODR_0011_S5A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0011/section-5a")
_ODR_0012_PHASE1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Phase-1")
_ODR_0012_Q3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Q3")
_ODR_0012_Q5 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Q5")
_ODR_0013_Q1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0013/section-Q1")
_ODR_0015_S3A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-3a")
_ODR_0015_S4A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-4a")
_ODR_0017_S1A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0017/section-1a")
_ODR_0017_S2A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0017/section-2a")
# ODR-0029 R3 — domain/range-as-SHACL-constraint layer (the inference/validation
# boundary: rdfs:domain / rdfs:range are VALIDATED closed-world, never inferred).
_ODR_0029_R3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0029/section-Rules-R3")


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
         URIRef("https://opda.org.uk/pdtf/")),
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
    node_kind: URIRef | None = None,
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
        dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-XXXX/section-Yy> .
    ```

    `min_count` defaults to 0 because the shapes target Substance Kinds
    whose identity-key emission is contingent (per ODR-0005 §6a UPRN is
    a contingent administrative identifier; its presence is checked
    when present, but absence is handled by the SHACL-AF succession
    rule not the identity-key shape).

    When `node_kind` is provided, `sh:nodeKind` is emitted instead of
    `sh:datatype` — used for identity-key predicates that are now
    ObjectProperty (Council-046 Q3b IRI flip).
    """
    pshape = BNode()
    g.add((shape_iri, RDF.type, SH.NodeShape))
    g.add((shape_iri, SH.targetClass, target_class))
    g.add((shape_iri, SH.property, pshape))
    g.add((shape_iri, DCTERMS.source, source_iri))
    g.add((pshape, SH.path, identity_predicate))
    if node_kind is not None:
        g.add((pshape, SH.nodeKind, node_kind))
    else:
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


# --- ODR-0029 R3: domain/range-as-SHACL-constraint layer -----------------
def _domain_range_pairs() -> tuple[list[tuple[URIRef, URIRef]], list[tuple[URIRef, URIRef]]]:
    """Collect (predicate, class) pairs for every `rdfs:domain` and every
    *class-valued* `rdfs:range` across the six module TBoxes.

    Built in-memory from the module `build_graph()` builders (no disk read —
    deterministic, byte-identity-safe). `rdfs:range` pairs are filtered to
    CLASS objects only: `xsd:*` / `rdfs:Literal` datatype ranges are constrained
    by `sh:datatype` elsewhere, not by this `sh:class` layer (ODR-0029 R3 names
    the `sh:class C` dual — for a class C, not a datatype). Returns
    `(domain_pairs, range_pairs)`, each sorted by (predicate, class) for
    deterministic emission.
    """
    from opda_gen.emitters.modules import MODULE_REGISTRY

    merged = Graph()
    for _name, mod in sorted(MODULE_REGISTRY.items()):
        merged += mod.build_graph()

    xsd_ns = str(XSD)
    rdfs_literal = str(RDFS.Literal)

    domain_pairs: list[tuple[URIRef, URIRef]] = []
    for pred, cls in merged.subject_objects(RDFS.domain):
        if isinstance(pred, URIRef) and isinstance(cls, URIRef):
            domain_pairs.append((pred, cls))

    range_pairs: list[tuple[URIRef, URIRef]] = []
    for pred, cls in merged.subject_objects(RDFS.range):
        if not (isinstance(pred, URIRef) and isinstance(cls, URIRef)):
            continue
        c = str(cls)
        if c.startswith(xsd_ns) or c == rdfs_literal:
            continue  # datatype range — constrained by sh:datatype, not sh:class
        range_pairs.append((pred, cls))

    domain_pairs.sort(key=lambda pc: (str(pc[0]), str(pc[1])))
    range_pairs.sort(key=lambda pc: (str(pc[0]), str(pc[1])))
    return domain_pairs, range_pairs


def build_domain_range_constraint_shapes(g: Graph) -> None:
    """Extend `g` in place with the ODR-0029 R3 domain/range-as-SHACL layer.

    The inference/validation boundary (ODR-0029 R1): `rdfs:domain`/`rdfs:range`
    are **validated** closed-world ("are the subjects/objects of this predicate
    instances of C?"), never **inferred** (the Safe-Group closure excludes them,
    ODR-0025 §R2/§R7 — inferring them would mis-type multi-domain subjects and
    re-introduce the EPCCertificate false positive). This closes that blind spot
    without unsound entailment:

    - for every `<pred> rdfs:domain C`:
        `<pred>DomainShape a sh:NodeShape ; sh:targetSubjectsOf <pred> ;
         sh:class C ; sh:severity sh:Violation`
    - for every class-valued `<pred> rdfs:range C`:
        `<pred>RangeShape a sh:NodeShape ; sh:targetObjectsOf <pred> ;
         sh:class C ; sh:severity sh:Violation`

    Severity `sh:Violation` per ODR-0013 §Q1 (a predicate used off its declared
    domain/range is a structural type error, not an optional-attribute gap) and
    ODR-0029 R3 §Confirmation ("flag a predicate used off-domain as a
    violation"). `dct:source` → ODR-0029 R3. Deterministic: pairs sorted by
    (predicate, class).
    """
    _bind_common(g)
    domain_pairs, range_pairs = _domain_range_pairs()

    def _local(iri: URIRef) -> str:
        return str(iri).rsplit("#", 1)[-1].rsplit("/", 1)[-1]

    for pred, cls in domain_pairs:
        shape_iri = OPDA_SHAPE[f"{_local(pred)}DomainShape"]
        g.add((shape_iri, RDF.type, SH.NodeShape))
        g.add((shape_iri, SH.targetSubjectsOf, pred))
        g.add((shape_iri, SH["class"], cls))
        g.add((shape_iri, SH.severity, SH.Violation))
        g.add((shape_iri, DCTERMS.source, _ODR_0029_R3))
        g.add((shape_iri, SH.message, Literal(
            f"opda:{_local(pred)} is used off its declared rdfs:domain: every "
            f"subject of opda:{_local(pred)} MUST be an instance of "
            f"{_local(cls)} (ODR-0029 R3 — rdfs:domain validated closed-world, "
            "not inferred).",
            lang="en",
        )))

    for pred, cls in range_pairs:
        shape_iri = OPDA_SHAPE[f"{_local(pred)}RangeShape"]
        g.add((shape_iri, RDF.type, SH.NodeShape))
        g.add((shape_iri, SH.targetObjectsOf, pred))
        g.add((shape_iri, SH["class"], cls))
        g.add((shape_iri, SH.severity, SH.Violation))
        g.add((shape_iri, DCTERMS.source, _ODR_0029_R3))
        g.add((shape_iri, SH.message, Literal(
            f"opda:{_local(pred)} has an object outside its declared "
            f"rdfs:range: every object of opda:{_local(pred)} MUST be an "
            f"instance of {_local(cls)} (ODR-0029 R3 — rdfs:range validated "
            "closed-world, not inferred).",
            lang="en",
        )))


# --- Foundation meta-shapes (called by foundation.build_shapes_graph) ----
def build_ufo_category_value_shape(g: Graph) -> None:
    """Extend `g` in place with the ODR-0031 R3 `opda:ufoCategory` value guard.

    A **tag-level editorial meta-shape**: every subject bearing `opda:ufoCategory`
    MUST carry a value drawn from the nine UFO meta-categories (the
    `opda:UFOCategoryScheme` notations). It governs the *facet value-space* only —
    it does NOT key any constraint on instance object-level structure (no instance
    bears `opda:ufoCategory`; only `owl:Class` TBox subjects do, in the annotation
    graph), so it stays the permitted "tag-level editorial guard" of ODR-0031 R3
    and never fires the ODR-0030 Rule 1 quarantine trigger on instance data. The
    nine values are sourced from `emitters.ufo_categories.UFO_CATEGORY_CONCEPTS`
    so the guard and the scheme cannot drift. `sh:Violation` per ODR-0013 §Q1.
    """
    from opda_gen.emitters.ufo_categories import UFO_CATEGORY_CONCEPTS

    shape_iri = OPDA_SHAPE["UFOCategoryValue_MetaShape"]
    g.add((shape_iri, RDF.type, SH.NodeShape))
    g.add((shape_iri, SH.targetSubjectsOf, OPDA.ufoCategory))
    pshape = BNode()
    g.add((shape_iri, SH["property"], pshape))
    g.add((pshape, SH.path, OPDA.ufoCategory))
    in_list = BNode()
    Collection(g, in_list, [Literal(v) for v in sorted(UFO_CATEGORY_CONCEPTS)])
    g.add((pshape, SH["in"], in_list))
    g.add((pshape, SH.severity, SH.Violation))
    g.add((pshape, SH.message, Literal(
        "opda:ufoCategory MUST be one of the nine UFO meta-categories "
        "(the opda:UFOCategoryScheme notations) — ODR-0031 R3 tag-level "
        "editorial guard on the facet value-space.",
        lang="en",
    )))
    g.add((shape_iri, OPDA.metaShapeJustification, Literal(
        "ODR-0031 R3: a tag-level editorial guard on opda:ufoCategory's own "
        "value-space (the nine UFO categories). A meta-shape over the "
        "annotation-graph facet; it does NOT key any constraint on tagged "
        "instances' object-level structure, so the ODR-0030 Rule 1 quarantine "
        "holds and the facet stays inert on the wire.",
        lang="en",
    )))
    g.add((shape_iri, DCTERMS.source, _ODR_0031_R3))


def build_ontoclean_tbox_meta_shape(g: Graph) -> None:
    """Extend `g` in place with the ADR-0046 TBox OntoClean meta-shape.

    Emits the canonical OntoClean self-consistency check as a SHACL
    `sh:Violation` meta-shape (the ODR-0031 R3 tag-guard pattern):

    - **Rigid subclassing −R** (the primary check): every type tagged
      `opda:ontoCleanRigidity "rigid"` MUST NOT be `rdfs:subClassOf` any
      type tagged `opda:ontoCleanRigidity "anti-rigid"`. An anti-rigid type
      cannot subsume a rigid one (Guarino & Welty 2009 §3: a rigid sortal's
      necessity cannot be inherited through a contingent anti-rigid
      supertype — `Person ⊑ Student` is forbidden, `Student ⊑ Person` valid).

    Targeting: `sh:targetSubjectsOf opda:ontoCleanRigidity` — selects TBox
    class subjects bearing a rigidity tag. The SPARQL `sh:select` query
    runs over the TBox + annotation graph (the editorial pass — NEVER the
    instance-validation union). No `sh:targetClass`/`sh:path` on instance
    data: this shape validates the *meta-level* (ADR-0046 §change 3;
    ODR-0031 R3 tag-guard pattern; quarantine intact).

    Carries `opda:metaShapeJustification` (required by the
    MetaShapeOverShapeGraph meta-shape for sh:Violation elevation — ODR-0017
    §2a). `dct:source` → ADR-0046. ADR-0046 atomicity rule: this shape
    MUST ship in the same change as the per-type tags in `ufo_categories.py`.
    """
    shape_iri = OPDA_SHAPE["OntoCleanAntiRigidSubclassing_MetaShape"]
    sparql_node = BNode()
    g.add((shape_iri, RDF.type, SH.NodeShape))
    # sh:targetSubjectsOf targets the TBox subjects bearing the rigidity tag.
    # No sh:targetClass (would target instances); no sh:path on instance data.
    g.add((shape_iri, SH.targetSubjectsOf, OPDA.ontoCleanRigidity))
    g.add((shape_iri, SH.sparql, sparql_node))
    g.add((shape_iri, SH.severity, SH.Violation))
    g.add((shape_iri, SH.message, Literal(
        "OntoClean violation: a rigid (+R) type is rdfs:subClassOf an "
        "anti-rigid (−R) type. An anti-rigid type cannot subsume a rigid one "
        "(Guarino & Welty 2009 §3 — a rigid sortal's necessity cannot be "
        "inherited through a contingent anti-rigid supertype; `Person ⊑ "
        "Student` is forbidden, `Student ⊑ Person` is valid). ADR-0046 TBox "
        "OntoClean meta-shape.",
        lang="en",
    )))
    g.add((shape_iri, OPDA.metaShapeJustification, Literal(
        "ADR-0046 §change 3 (TBox OntoClean meta-shape; ODR-0031 R3 "
        "tag-guard pattern): this canonical check 'every rigid (+R) type "
        "that is nonetheless rdfs:subClassOf an anti-rigid (−R) type' is the "
        "sole consumer that makes the per-type opda:ontoCleanRigidity tags "
        "non-decorative (session-042 atomicity rule). Runs over the TBox + "
        "annotation graph only; NEVER the instance-validation union. "
        "sh:Violation because a +R-subclass-of-−R subsumption is a structural "
        "soundness failure of the OntoClean lattice, not an optional advisory.",
        lang="en",
    )))
    g.add((shape_iri, DCTERMS.source, _ADR_0046))
    # SPARQL select over the TBox (run by the CI gate against class+annotation
    # graph only — ADR-0046 §change 4; never the instance-validation union).
    g.add((sparql_node, SH.select, Literal(
        "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
        "SELECT $this ?superClass WHERE {\n"
        "  $this opda:ontoCleanRigidity \"rigid\" .\n"
        "  $this rdfs:subClassOf ?superClass .\n"
        "  ?superClass opda:ontoCleanRigidity \"anti-rigid\" .\n"
        "}"
    )))


def build_ontoclean_identity_tbox_meta_shape(g: Graph) -> None:
    """Extend `g` in place with the ADR-0046 ±I TBox OntoClean meta-shape.

    The identity-criterion (±I) sibling of the rigidity (±R) meta-shape — the
    canonical OntoClean IC-compatibility check as a SHACL `sh:Violation`
    meta-shape (the ODR-0031 R3 tag-guard pattern):

    - **Incompatible-IC subsumption** (the check): a type that **supplies its
      own** identity criterion (`opda:ontoCleanIdentity "supplies-IC"`) MUST
      NOT be `rdfs:subClassOf` another type that ALSO supplies its own IC
      (`"supplies-IC"`). Two independent own-identity suppliers carry
      *distinct* identity criteria; a subsumption between them would force the
      subclass to bear two mutually-incompatible own-ICs on the same instances
      — exactly the OntoClean prohibition (Guarino & Welty 2009 §3: an identity
      criterion is inherited down a subsumption chain and a subtype cannot
      supply a second, incompatible one; a sortal cannot subsume a different
      sortal). The `carries-IC ⊑ supplies-IC` direction (e.g.
      `Transaction ⊑ Relator`) is VALID — the subclass *inherits* the super's
      supplied IC rather than asserting a rival one — and `no-own-IC ⊑ *`
      (Roles/RoleMixins, which borrow identity from a bearer) is likewise
      compatible. So the sole incompatible pairing is `supplies-IC ⊑
      supplies-IC`, mirroring the ±R shape's sole `rigid ⊑ anti-rigid`.

    Targeting: `sh:targetSubjectsOf opda:ontoCleanIdentity` — selects TBox
    class subjects bearing an identity tag. The SPARQL `sh:select` query runs
    over the TBox + annotation graph (the editorial pass — NEVER the
    instance-validation union). No `sh:targetClass`/`sh:path` on instance
    data: this shape validates the *meta-level* (ADR-0046 §change 3;
    ODR-0031 R3 tag-guard pattern; quarantine intact).

    Carries `opda:metaShapeJustification` (required by the
    MetaShapeOverShapeGraph meta-shape for sh:Violation elevation — ODR-0017
    §2a). `dct:source` → ADR-0046. ADR-0046 atomicity rule: this shape MUST
    ship in the same change as the per-type tags in `ufo_categories.py`.
    """
    shape_iri = OPDA_SHAPE["OntoCleanIncompatibleIdentitySubclassing_MetaShape"]
    sparql_node = BNode()
    g.add((shape_iri, RDF.type, SH.NodeShape))
    # sh:targetSubjectsOf targets the TBox subjects bearing the identity tag.
    # No sh:targetClass (would target instances); no sh:path on instance data.
    g.add((shape_iri, SH.targetSubjectsOf, OPDA.ontoCleanIdentity))
    g.add((shape_iri, SH.sparql, sparql_node))
    g.add((shape_iri, SH.severity, SH.Violation))
    g.add((shape_iri, SH.message, Literal(
        "OntoClean violation: a type that supplies its own identity criterion "
        "(+I, 'supplies-IC') is rdfs:subClassOf another type that also "
        "supplies its own identity criterion. Two independent own-identity "
        "suppliers carry distinct, incompatible identity criteria — a "
        "subsumption between them would force the subclass to bear two rival "
        "own-ICs (Guarino & Welty 2009 §3 — a sortal cannot subsume a "
        "different sortal; 'carries-IC ⊑ supplies-IC' is the valid "
        "IC-inheritance direction). ADR-0046 ±I TBox OntoClean meta-shape.",
        lang="en",
    )))
    g.add((shape_iri, OPDA.metaShapeJustification, Literal(
        "ADR-0046 §change 3 (±I TBox OntoClean meta-shape; ODR-0031 R3 "
        "tag-guard pattern): this canonical check 'every supplies-IC (+I) type "
        "that is nonetheless rdfs:subClassOf another supplies-IC (+I) type' is "
        "the sole consumer that makes the per-type opda:ontoCleanIdentity tags "
        "non-decorative (session-042 atomicity rule; addresses Baker's held "
        "'no-decoration' dissent on the ±I tags). Runs over the TBox + "
        "annotation graph only; NEVER the instance-validation union. "
        "sh:Violation because two colliding own-identity criteria on one "
        "subclass is a structural soundness failure of the OntoClean lattice, "
        "not an optional advisory.",
        lang="en",
    )))
    g.add((shape_iri, DCTERMS.source, _ADR_0046))
    # SPARQL select over the TBox (run by the CI gate against class+annotation
    # graph only — ADR-0046 §change 4; never the instance-validation union).
    g.add((sparql_node, SH.select, Literal(
        "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
        "SELECT $this ?superClass WHERE {\n"
        "  $this opda:ontoCleanIdentity \"supplies-IC\" .\n"
        "  $this rdfs:subClassOf ?superClass .\n"
        "  ?superClass opda:ontoCleanIdentity \"supplies-IC\" .\n"
        "}"
    )))


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
    g.add((OPDA_SHAPE.NoIdentityOverride_MetaShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.NoIdentityOverride_MetaShape, SH.targetClass, SH.NodeShape))
    g.add((OPDA_SHAPE.NoIdentityOverride_MetaShape, SH.sparql, sparql_node))
    g.add((OPDA_SHAPE.NoIdentityOverride_MetaShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.NoIdentityOverride_MetaShape, SH.message, Literal(
        "Profile shape attempts to override identity-key of Substance "
        "Kind; identity properties cannot be removed by overlays "
        "(ODR-0010 §Q6 three-rule interface contract).",
        lang="en",
    )))
    g.add((OPDA_SHAPE.NoIdentityOverride_MetaShape, OPDA.metaShapeJustification,
           Literal(
               "ODR-0013 §Q1 Category 3: profile cannot override identity-"
               "key; this meta-shape enforces the three-rule interface "
               "contract per ODR-0010 §Q6.",
               lang="en",
           )))
    g.add((OPDA_SHAPE.NoIdentityOverride_MetaShape, DCTERMS.source, _ODR_0010_Q6))
    g.add((sparql_node, SH.select, Literal(
        "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
        "PREFIX sh: <http://www.w3.org/ns/shacl#>\n"
        "SELECT ?profileShape WHERE {\n"
        "  ?profileShape sh:targetClass ?kind .\n"
        "  ?kind opda:identityKey ?key .\n"
        "  ?profileShape sh:property [ sh:path ?key ; sh:maxCount 0 ] .\n"
        "}"
    )))

    # --- Three-rule interface contract: sh:in semantics meta-shape ------
    sparql_in = BNode()
    g.add((OPDA_SHAPE.ShInSemantics_MetaShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.ShInSemantics_MetaShape, SH.targetClass, SH.NodeShape))
    g.add((OPDA_SHAPE.ShInSemantics_MetaShape, SH.sparql, sparql_in))
    g.add((OPDA_SHAPE.ShInSemantics_MetaShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.ShInSemantics_MetaShape, SH.message, Literal(
        "Overlay profile sh:in constraint must union into the base "
        "SKOS scheme members (ODR-0010 three-rule interface contract, "
        "Rule 1).",
        lang="en",
    )))
    g.add((OPDA_SHAPE.ShInSemantics_MetaShape, OPDA.metaShapeJustification,
           Literal(
               "ODR-0010 three-rule interface contract Rule 1: overlay "
               "sh:in MUST be a subset of base sh:in (which itself unions "
               "into the SKOS scheme members per ODR-0011).",
               lang="en",
           )))
    g.add((OPDA_SHAPE.ShInSemantics_MetaShape, DCTERMS.source, _ODR_0010_RULE_IN))
    g.add((sparql_in, SH.select, Literal(
        "PREFIX sh: <http://www.w3.org/ns/shacl#>\n"
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
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
    g.add((OPDA_SHAPE.ShViolationFloor_MetaShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.ShViolationFloor_MetaShape, SH.targetClass, SH.NodeShape))
    g.add((OPDA_SHAPE.ShViolationFloor_MetaShape, SH.sparql, sparql_floor))
    g.add((OPDA_SHAPE.ShViolationFloor_MetaShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.ShViolationFloor_MetaShape, SH.message, Literal(
        "Overlay profile attempts to downgrade a base sh:Violation "
        "severity; ODR-0010 three-rule interface contract Rule 2 "
        "establishes a Violation floor that overlays cannot weaken.",
        lang="en",
    )))
    g.add((OPDA_SHAPE.ShViolationFloor_MetaShape, OPDA.metaShapeJustification,
           Literal(
               "ODR-0010 three-rule interface contract Rule 2: no overlay "
               "shape may set sh:severity to sh:Warning or sh:Info on a "
               "property where the base shape declared sh:Violation.",
               lang="en",
           )))
    g.add((OPDA_SHAPE.ShViolationFloor_MetaShape, DCTERMS.source, _ODR_0010_RULE_FLOOR))
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
    g.add((OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape, SH.targetClass, SH.NodeShape))
    g.add((OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape, SH.sparql, sparql_meta))
    g.add((OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape, SH.message, Literal(
        "Meta-shape over shape-graph using sh:Violation severity requires "
        "explicit opda:metaShapeJustification (ODR-0017 §2a amendment).",
        lang="en",
    )))
    g.add((OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape,
           OPDA.metaShapeJustification, Literal(
               "ODR-0013 §Q1 Category 5 + ODR-0017 §2a: meta-shapes "
               "targeting sh:NodeShape using sh:Violation severity must "
               "justify their elevation above the ODR-0017 sh:Info default.",
               lang="en",
           )))
    g.add((OPDA_SHAPE.MetaShapeOverShapeGraphMetaShape, DCTERMS.source, _ODR_0017_S2A))
    g.add((sparql_meta, SH.select, Literal(
        "PREFIX sh: <http://www.w3.org/ns/shacl#>\n"
        "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
        shape_iri=OPDA_SHAPE.PIIWithoutDPVCoAnnotationRule,
        target_class=OWL.Class,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
        shape_iri=OPDA_SHAPE.DeprecationChainRule,
        target_class=SKOS.Concept,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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

    # --- ADR-0046: TBox OntoClean meta-shapes (the seventh + eighth CI gates'
    # shapes) — the ±R rigidity limb and the ±I identity limb. Both atomic with
    # the per-type tags in ufo_categories.py: they ship in the same change or
    # neither ships (session-042 atomicity rule / ADR-0046 §Atomic).
    build_ontoclean_tbox_meta_shape(g)
    build_ontoclean_identity_tbox_meta_shape(g)


# --- Per-module shape builders -------------------------------------------
def build_property_shapes() -> Graph:
    """Emit per-Kind identity + IC breach shapes for the Property module
    plus SHACL-AF rules: UPRNSuccessionRule, INSPIRESuccessionRule.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/property-shapes")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Property Shapes",
    ):
        g.add(t)

    # --- Cat 1: identity-key shapes -------------------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA_SHAPE.PropertyIdentityKeyShape,
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
        shape_iri=OPDA_SHAPE.LegalEstateIdentityKeyShape,
        target_class=OPDA.LegalEstate,
        identity_predicate=OPDA.tenureKind,
        datatype=XSD.string,
        node_kind=SH.IRI,
        message=(
            "LegalEstate identity surface: tenureKind (Freehold / "
            "Leasehold / Commonhold) MUST be a single concept IRI "
            "when present. The full rights-bundle IC per ODR-0005 §3b "
            "is enforced by the registered-title binding via "
            "opda:recordsEstate."
        ),
        source_iri=_ODR_0005_S3B,
    )
    _add_identity_key_shape(
        g,
        shape_iri=OPDA_SHAPE.AddressIdentityKeyShape,
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
            "https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-Rule-6"
        ),
    )

    # --- Cat 2: IC breach shape — opda:identifiesSameProperty -----------
    _add_ic_breach_shape(
        g,
        shape_iri=OPDA_SHAPE.PropertyICBreachShape,
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
        shape_iri=OPDA_SHAPE.UPRNSuccessionRule,
        target_class=OPDA.Property,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
        shape_iri=OPDA_SHAPE.INSPIRESuccessionRule,
        target_class=OPDA.Address,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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

    # --- opda:hasAddress bearer-typing: Property∪Person∪Organisation ---------
    # Council session-047 Q6: opda:hasAddress was bearer-extended to
    # Person/Organisation by DROPPING its Property-only rdfs:domain (a single
    # rdfs:domain opda:Property would entail every addressed Person/Organisation
    # is a Property — Hendler). This shape REPLACES the auto-derived
    # opda:hasAddressDomainShape (build_domain_range_constraint_shapes, ODR-0029
    # R3) that disappears with the dropped rdfs:domain: it pins the bearer to the
    # Property∪Person∪Organisation union in SHACL sh:or. rdfs:range opda:Address
    # is retained, so its auto-derived opda:hasAddressRangeShape still holds the
    # co-domain. The opda:Address class/IC is NOT re-settled (RESIDUE-PENDING
    # ODR-0015 Mode-vs-Resource). sh:Violation per ODR-0013 §Q1.
    # The sh:or is on the NODE SHAPE itself (focus = the SUBJECT/bearer, reached
    # via sh:targetSubjectsOf), NOT nested in a sh:property[sh:path] — a
    # path-scoped sh:or would constrain the VALUE nodes (the Address objects),
    # firing a false-positive on every well-typed Property bearer. This is the
    # rangeless-focus idiom, mirroring opda:RelatorSpineSubjectShape.
    g.add((OPDA_SHAPE.HasAddressBearerShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.HasAddressBearerShape, SH.targetSubjectsOf, OPDA.hasAddress))
    g.add((OPDA_SHAPE.HasAddressBearerShape, SH["or"],
           _sh_class_or(g, [OPDA.Property, OPDA.Person, OPDA.Organisation])))
    g.add((OPDA_SHAPE.HasAddressBearerShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.HasAddressBearerShape, DCTERMS.source, _ODR_0015_S3A))
    g.add((OPDA_SHAPE.HasAddressBearerShape, SH.message, Literal(
        "opda:hasAddress is borne by an opda:Property, opda:Person OR "
        "opda:Organisation. Bearer disjunction in sh:or, not an rdfs:domain "
        "(which would entail every addressed Person is a Property — Hendler; "
        "Council session-047 Q6). Replaces the dropped Property-only "
        "rdfs:domain's auto-derived domain shape; rdfs:range opda:Address "
        "kept. The Address class/IC stays ODR-0015-pending.",
        lang="en",
    )))

    return g


def build_agent_shapes() -> Graph:
    """Per-Kind identity shapes for the Agent module + SHACL-AF rules:
    IdentifierSuccessionRule (ODR-0006 Q1); CapacityAuthorityMatchRule
    (ODR-0006 Q4).
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/agent-shapes")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Agent Shapes",
    ):
        g.add(t)

    # --- Cat 1: Person identity-key ------------------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA_SHAPE.PersonIdentityKeyShape,
        target_class=OPDA.Person,
        identity_predicate=OPDA.hasAssertedCapacity,
        datatype=XSD.string,
        node_kind=SH.IRI,
        message=(
            "Person identity-key surface: hasAssertedCapacity MUST be a "
            "single concept IRI when present. The full Person IC "
            "per ODR-0006 §Q1 is borne by the identifier-bundle (NI "
            "number / passport / driving-licence); succession is tracked "
            "by the IdentifierSuccessionRule SHACL-AF rule below."
        ),
        source_iri=_ODR_0006_Q1,
    )

    # --- Cat 1: Organisation identity-key ------------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA_SHAPE.OrganisationIdentityKeyShape,
        target_class=OPDA.Organisation,
        identity_predicate=OPDA.hasAssertedCapacity,
        datatype=XSD.string,
        node_kind=SH.IRI,
        message=(
            "Organisation identity-key surface: hasAssertedCapacity MUST "
            "be a single concept IRI when present. Full IC per "
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
    g.add((OPDA_SHAPE.SpecialCategoryPIIWithoutLawfulBasisShape,
           RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.targetClass, OPDA.Person))
    g.add((OPDA_SHAPE.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.message, Literal(
        "Special-category PII (GDPR Article 10) MUST have an associated "
        "dpv:hasLegalBasis triple. ODR-0012 Phase 1 + ODR-0013 §Q1 "
        "Category 4: lawful-basis-elevated PII is a Violation-tier breach.",
        lang="en",
    )))
    g.add((OPDA_SHAPE.SpecialCategoryPIIWithoutLawfulBasisShape,
           DCTERMS.source, _ODR_0012_Q3))
    g.add((OPDA_SHAPE.SpecialCategoryPIIWithoutLawfulBasisShape,
           SH.sparql, sparql_node))
    g.add((sparql_node, SH.select, Literal(
        "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
        shape_iri=OPDA_SHAPE.IdentifierSuccessionRule,
        target_class=OPDA.Person,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
        shape_iri=OPDA_SHAPE.CapacityAuthorityMatchRule,
        target_class=OPDA.Person,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
        g, OPDA_SHAPE.OwnerTypeValueShape, OPDA.ownerType, "OwnerTypeScheme",
        _ODR_0024_R6,
    )

    # --- Relator-spine mediation: a Proprietorship mediates ≥2 Roles -----
    # Council session-045 Q2 / 046: the Relator's existential mediation is a
    # genuine relation (Guizzardi 2005 Ch.4 §4.4 — a Relator binds ≥2 bearers),
    # asserted design-time + enforced closed-world here, NEVER reasoned
    # (ODR-0029/0031). Satisfied by proprietorship-relator-multi-proprietor.ttl
    # (one Proprietorship mediating two Proprietor roles).
    # sh:class opda:Proprietor (Council session-047 Q5 / Decision detail):
    # type-pins opda:mediates' co-domain in SHACL — mediates is rangeless in OWL
    # (the "design-time, NEVER reasoned" relator spine, ODR-0029/0030/0031, comment
    # preserved in agent.py), so the gate's "rangeless-AND-shapeless" check is
    # satisfied by this sh:class (the gate's first real catch: mediates shipped
    # range-unpinned in BOTH OWL and SHACL).
    _med_p = BNode()
    g.add((OPDA_SHAPE.ProprietorshipMediationShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.ProprietorshipMediationShape, SH.targetClass, OPDA.Proprietorship))
    g.add((OPDA_SHAPE.ProprietorshipMediationShape, SH.property, _med_p))
    g.add((OPDA_SHAPE.ProprietorshipMediationShape, DCTERMS.source, _ODR_0006_Q3))
    g.add((_med_p, SH.path, OPDA.mediates))
    g.add((_med_p, SH.minCount, Literal(2)))
    g.add((_med_p, SH["class"], OPDA.Proprietor))
    g.add((_med_p, SH.severity, SH.Violation))
    g.add((_med_p, SH.message, Literal(
        "A Proprietorship Relator MUST mediate ≥2 Proprietor roles "
        "(opda:mediates, sh:minCount 2; sh:class opda:Proprietor) — a relator "
        "that binds fewer than two bearers is not a relator (UFO Guizzardi 2005 "
        "Ch.4 §4.4; ODR-0006 §Q3). Design-time + SHACL-validated, never reasoned.",
        lang="en",
    )))

    # --- Relator-spine type-pinning: opda:founds co-domain + subject-guard ---
    # Council session-047 Q5: opda:founds and opda:mediates are type-pinned in
    # SHACL sh:class, NOT rdfs:domain/rdfs:range, preserving their shipped
    # "Design-time, NEVER reasoned" commitment (ODR-0029/0030/0031). mediates'
    # co-domain is pinned on ProprietorshipMediationShape above; founds' is
    # pinned here (Relator → Role). A SHACL subject-guard confines BOTH
    # predicates' SUBJECTS to opda:Relator, so the relator entailment is
    # conservative-by-construction (Davis's refinement) rather than by good
    # behaviour. sh:Violation per ODR-0013 §Q1 (a relator-spine edge off a
    # non-relator/non-role node is a structural type error).
    # The value-type union goes DIRECTLY on the node shape (focus = the founds
    # OBJECT, reached via sh:targetObjectsOf), NOT nested in a sh:property[sh:path
    # opda:founds] — a path-scoped constraint re-traverses opda:founds FROM the
    # object (which has no outgoing founds), so it is vacuously satisfied and
    # enforces nothing (the focus-vs-value-node trap; cf. HasParticipantRangeShape
    # / RolePlaySubjectShape which pin on the node). founds ranges over a Role
    # (Proprietor) OR a RoleMixin (Seller/Buyer) — siblings, neither a subclass of
    # the other — so the union is sh:or[Role, RoleMixin], not sh:class opda:Role
    # (which would falsely reject a Transaction→Seller/Buyer founding edge).
    g.add((OPDA_SHAPE.FoundsRangeShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.FoundsRangeShape, SH.targetObjectsOf, OPDA.founds))
    g.add((OPDA_SHAPE.FoundsRangeShape, SH["or"],
           _sh_class_or(g, [OPDA.Role, OPDA.RoleMixin])))
    g.add((OPDA_SHAPE.FoundsRangeShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.FoundsRangeShape, DCTERMS.source, _ODR_0006_Q3))
    g.add((OPDA_SHAPE.FoundsRangeShape, SH.message, Literal(
        "opda:founds is the Relator → Role founding spine: every object of "
        "opda:founds MUST be an opda:Role (Proprietor) OR an opda:RoleMixin "
        "(Seller/Buyer) — Council session-047 Q5, founds type-pinned in SHACL "
        "(sh:or on the focus node), not rdfs:range, preserving its "
        "'NEVER reasoned' commitment; ODR-0006 §Q3 / ODR-0029.",
        lang="en",
    )))

    # Subject-guard for the relator spine — founds + mediates subjects MUST be
    # opda:Relator (one shape carrying both sh:targetSubjectsOf declarations).
    _spine_subj = BNode()
    g.add((OPDA_SHAPE.RelatorSpineSubjectShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.RelatorSpineSubjectShape, SH.targetSubjectsOf, OPDA.founds))
    g.add((OPDA_SHAPE.RelatorSpineSubjectShape, SH.targetSubjectsOf, OPDA.mediates))
    g.add((OPDA_SHAPE.RelatorSpineSubjectShape, SH["class"], OPDA.Relator))
    g.add((OPDA_SHAPE.RelatorSpineSubjectShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.RelatorSpineSubjectShape, DCTERMS.source, _ODR_0006_Q3))
    g.add((OPDA_SHAPE.RelatorSpineSubjectShape, SH.message, Literal(
        "opda:founds / opda:mediates are the Relator spine: every SUBJECT of "
        "either MUST be an opda:Relator (Council session-047 Q5 subject-guard "
        "— makes the relator entailment conservative-by-construction; ODR-0006 "
        "§Q3). Design-time + SHACL-validated, never reasoned.",
        lang="en",
    )))

    # --- Role-play bearer shapes: opda:playedBy (Council session-047 Q4) -----
    # opda:playedBy is OPTIONAL / distinct-node-only (NO sh:minCount — a co-typed
    # role with no distinct bearer node is conformant; never forces a vacuous
    # self-edge). Its bearer co-domain Person∪Organisation is pinned in SHACL
    # sh:or, NOT an rdfs:range union (which would entail every bearer is a Person
    # — Hendler). RolePlayShape pins the co-domain for ALL playedBy objects
    # (sh:targetSubjectsOf); SellerShape / BuyerShape carry the ODR-0006 §SHACL
    # SellerShape pattern keyed on the role class (sh:targetClass + sh:path). All
    # OPTIONAL. sh:Violation per ODR-0013 §Q1.
    _bearer_classes = [OPDA.Person, OPDA.Organisation]

    _rp_p = BNode()
    g.add((OPDA_SHAPE.RolePlayShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.RolePlayShape, SH.targetSubjectsOf, OPDA.playedBy))
    g.add((OPDA_SHAPE.RolePlayShape, SH.property, _rp_p))
    g.add((OPDA_SHAPE.RolePlayShape, DCTERMS.source, _ODR_0006_Q2))
    g.add((_rp_p, SH.path, OPDA.playedBy))
    g.add((_rp_p, SH["or"], _sh_class_or(g, _bearer_classes)))
    g.add((_rp_p, SH.severity, SH.Violation))
    g.add((_rp_p, SH.message, Literal(
        "opda:playedBy MUST point at an opda:Person OR an opda:Organisation "
        "(the role bearer). Bearer disjunction in sh:or, not an rdfs:range "
        "union (Council session-047 Q4/Q5; ODR-0006 §SHACL). OPTIONAL / "
        "distinct-node-only — emitted only where the role qua-individual is a "
        "node distinct from its bearer; never a self-edge.",
        lang="en",
    )))

    # opda:playedBy SUBJECT-typing: the role-instance is an opda:Role (Proprietor)
    # OR an opda:RoleMixin (Seller/Buyer) — sibling role meta-classes (ODR-0006
    # §Q2). opda:playedBy carries NO rdfs:domain (opda:Role alone is not
    # universally true — it excludes Seller/Buyer), so the subject union is pinned
    # HERE in SHACL sh:or (focus = the subject via sh:targetSubjectsOf). Replaces
    # the auto-derived opda:playedByDomainShape that the dropped rdfs:domain would
    # have produced. sh:Violation per ODR-0013 §Q1.
    g.add((OPDA_SHAPE.RolePlaySubjectShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.RolePlaySubjectShape, SH.targetSubjectsOf, OPDA.playedBy))
    g.add((OPDA_SHAPE.RolePlaySubjectShape, SH["or"],
           _sh_class_or(g, [OPDA.Role, OPDA.RoleMixin])))
    g.add((OPDA_SHAPE.RolePlaySubjectShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.RolePlaySubjectShape, DCTERMS.source, _ODR_0006_Q2))
    g.add((OPDA_SHAPE.RolePlaySubjectShape, SH.message, Literal(
        "The subject of opda:playedBy MUST be an opda:Role (e.g. Proprietor) OR "
        "an opda:RoleMixin (e.g. Seller/Buyer) — only role-instances are "
        "played-by (Council session-047 Q4). Subject union in sh:or, not a "
        "non-universal rdfs:domain opda:Role (which would falsely exclude the "
        "RoleMixin roles).",
        lang="en",
    )))

    for _role_cls, _role_shape in (
        (OPDA.Seller, OPDA_SHAPE.SellerShape),
        (OPDA.Buyer, OPDA_SHAPE.BuyerShape),
    ):
        _role_p = BNode()
        g.add((_role_shape, RDF.type, SH.NodeShape))
        g.add((_role_shape, SH.targetClass, _role_cls))
        g.add((_role_shape, SH.property, _role_p))
        g.add((_role_shape, DCTERMS.source, _ODR_0006_Q2))
        g.add((_role_p, SH.path, OPDA.playedBy))
        g.add((_role_p, SH["or"], _sh_class_or(g, _bearer_classes)))
        g.add((_role_p, SH.severity, SH.Violation))
        g.add((_role_p, SH.message, Literal(
            f"An opda:{_role_cls.split('/')[-1]} role, where it names a distinct "
            "bearer node via opda:playedBy, MUST be played by an opda:Person OR "
            "an opda:Organisation (ODR-0006 §SHACL role-play shape; Council "
            "session-047 Q4). OPTIONAL — co-typed roles with no distinct bearer "
            "node are conformant (no sh:minCount, never a self-edge).",
            lang="en",
        )))

    # opda:plays co-domain: opda:Role (Proprietor) OR opda:RoleMixin
    # (Seller/Buyer) — the inverse of opda:playedBy's subject union. opda:plays
    # carries NO rdfs:domain/rdfs:range (a union rdfs:range would re-introduce the
    # everything-becomes-an-X anti-pattern; the bearer subject is typed by the
    # opda:playedBy shapes via the inverse) — so its co-domain is type-pinned HERE
    # in SHACL sh:or, else it would be rangeless-AND-shapeless (the ADR-0048 §4
    # limb (a) defect). Mirrors opda:FoundsRangeShape's co-domain pinning.
    # sh:Violation per ODR-0013 §Q1.
    # sh:or DIRECTLY on the node shape (focus = the plays OBJECT, via
    # sh:targetObjectsOf) — NOT nested in a sh:property[sh:path opda:plays], which
    # would re-traverse opda:plays from the object (a Role, which has no outgoing
    # plays) and so enforce nothing (the vacuous focus-vs-value-node trap; mirrors
    # the FoundsRangeShape fix and HasParticipantRangeShape's node-level pinning).
    g.add((OPDA_SHAPE.PlaysRangeShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.PlaysRangeShape, SH.targetObjectsOf, OPDA.plays))
    g.add((OPDA_SHAPE.PlaysRangeShape, SH["or"],
           _sh_class_or(g, [OPDA.Role, OPDA.RoleMixin])))
    g.add((OPDA_SHAPE.PlaysRangeShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.PlaysRangeShape, DCTERMS.source, _ODR_0006_Q2))
    g.add((OPDA_SHAPE.PlaysRangeShape, SH.message, Literal(
        "opda:plays (inverse of opda:playedBy) MUST point at an opda:Role "
        "(Proprietor) OR an opda:RoleMixin (Seller/Buyer): the role a "
        "Person/Organisation bearer plays (Council session-047 Q4). Co-domain "
        "union in sh:or on the focus node (opda:plays has no rdfs:range to avoid "
        "the union-entailment anti-pattern); the bearer subject is typed by the "
        "opda:playedBy shapes via the inverse.",
        lang="en",
    )))

    return g


def build_transaction_shapes() -> Graph:
    """Transaction-Relator IC shape + LeaseTermSuccession + MilestoneVariance
    SHACL-AF rules.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/transaction-shapes")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Transaction Shapes",
    ):
        g.add(t)

    # --- Cat 1: Transaction identity-key (the founding-event tuple) ------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA_SHAPE.TransactionIdentityKeyShape,
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
        shape_iri=OPDA_SHAPE.MilestoneIdentityKeyShape,
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
        shape_iri=OPDA_SHAPE.LeaseTermSuccessionRule,
        target_class=OPDA.LeaseTerm,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
        shape_iri=OPDA_SHAPE.MilestoneVarianceRule,
        target_class=OPDA.Milestone,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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

    # --- opda:hasParticipant co-domain: Seller∪Buyer (Council session-047) ---
    # opda:hasParticipant carries rdfs:domain opda:Transaction (universally true,
    # no never-reasoned commitment — asserted in transaction.py) but NO
    # rdfs:range: the Seller∪Buyer co-domain is pinned here in SHACL sh:or, not
    # an rdfs:range union (which would entail every participant is a Seller —
    # Hendler / Council Q5). sh:Violation per ODR-0013 §Q1.
    # The sh:or is on the NODE SHAPE itself (focus = the participant OBJECT,
    # reached via sh:targetObjectsOf), NOT nested in a sh:property[sh:path] — a
    # path-scoped sh:or would look for the participant's OWN hasParticipant
    # values (a wrong double-hop). Mirrors opda:FoundsRangeShape's co-domain
    # pinning but with a class disjunction.
    g.add((OPDA_SHAPE.HasParticipantRangeShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.HasParticipantRangeShape, SH.targetObjectsOf,
           OPDA.hasParticipant))
    g.add((OPDA_SHAPE.HasParticipantRangeShape, SH["or"],
           _sh_class_or(g, [OPDA.Seller, OPDA.Buyer])))
    g.add((OPDA_SHAPE.HasParticipantRangeShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.HasParticipantRangeShape, DCTERMS.source, _ODR_0007_Q1))
    g.add((OPDA_SHAPE.HasParticipantRangeShape, SH.message, Literal(
        "opda:hasParticipant MUST point at an opda:Seller OR an opda:Buyer "
        "(the parties to the transaction). Co-domain disjunction in sh:or, not "
        "an rdfs:range union (Council session-047 Q5; ODR-0007). The navigable "
        "parties-of-transaction edge; distinct from the opda:founds "
        "design-time relator spine.",
        lang="en",
    )))

    return g


def build_claim_shapes() -> Graph:
    """Claim identity + provenance + VerificationActivitySuccession rules."""
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/claim-shapes")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Claim Shapes",
    ):
        g.add(t)

    # --- Cat 1: Claim identity-key (digest hash) -------------------------
    _add_identity_key_shape(
        g,
        shape_iri=OPDA_SHAPE.ClaimIdentityKeyShape,
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
        shape_iri=OPDA_SHAPE.EvidenceIdentityKeyShape,
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

    # --- Council session-035: evidence-KIND facet value-space ----------
    # opda:evidenceType (the OIDC4IDA kind discriminator that replaced the
    # retired short-name owl:equivalentClass aliases) wired to
    # opda:EvidenceMethodScheme via the sh:targetSubjectsOf idiom — the
    # opda:ownerType precedent (ODR-0024 R6); entailment-free, holds standalone.
    _add_enum_value_shape(
        g, OPDA_SHAPE.EvidenceTypeValueShape, OPDA.evidenceType,
        "EvidenceMethodScheme", _ODR_0009_Q1,
    )

    # --- Council session-036: per-kind obligations, VALUE-KEYED ----------
    # opda:EvidenceFacetShape (the name ODR-0009/ADR-0012 promised) keys the
    # per-kind obligation on the opda:evidenceType VALUE, NOT sh:targetClass —
    # entailment-free, and it fires on a vouch recorded by value where a
    # subclass-targeted shape would silently pass (Knublauch + DA Guizzardi;
    # session-036 §Q3: "classification for per-kind obligations; class-
    # consultation only for inter-layer coherence"). Vouch ⇒ opda:attestedBy a
    # prov:Agent, as the material implication ¬(type=Vouch) ∨ attestedBy≥1
    # (SHACL Core sh:or/sh:not, ODR-0013 §discriminated-oneOf).
    _nv = BNode(); _nv_p = BNode()
    g.add((_nv, SH.property, _nv_p))
    g.add((_nv_p, SH.path, OPDA.evidenceType))
    g.add((_nv_p, SH.hasValue, Literal("Vouch")))
    _not_vouch = BNode()
    g.add((_not_vouch, SH["not"], _nv))
    _has_att = BNode(); _att_p = BNode()
    g.add((_has_att, SH.property, _att_p))
    g.add((_att_p, SH.path, OPDA.attestedBy))
    g.add((_att_p, SH.minCount, Literal(1)))
    g.add((_att_p, SH["class"], PROV.Agent))
    _or_list = BNode()
    Collection(g, _or_list, [_not_vouch, _has_att])
    g.add((OPDA_SHAPE.EvidenceFacetShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.EvidenceFacetShape, SH.targetSubjectsOf, OPDA.evidenceType))
    g.add((OPDA_SHAPE.EvidenceFacetShape, SH["or"], _or_list))
    g.add((OPDA_SHAPE.EvidenceFacetShape, SH.severity, SH.Violation))
    g.add((OPDA_SHAPE.EvidenceFacetShape, DCTERMS.source, _ODR_0009_Q1))
    g.add((OPDA_SHAPE.EvidenceFacetShape, SH.message, Literal(
        "Evidence with opda:evidenceType 'Vouch' MUST carry opda:attestedBy a "
        "prov:Agent (a vouch is an Agent-founded attestation). Value-keyed, "
        "entailment-free (Council session-036).",
        lang="en",
    )))

    # --- Council session-036's class↔value coherence shapes: RETIRED -----
    # ODR-0027 §R6 retired the …Evidence subclasses (evidence-kind is now the
    # coded opda:evidenceType classification, not a subclass tree). With no
    # subclasses to cohere against, the opda:*CoherenceShape family is dropped;
    # enforcement rests on the value-keyed opda:EvidenceTypeValueShape (value-
    # space gate) + opda:EvidenceFacetShape (per-kind obligations), both
    # sh:targetSubjectsOf opda:evidenceType — entailment-free and subclass-free.

    # --- Cat 2: Unprovenanced Claim shape (per ODR-0013 §Q1 + ODR-0009) -
    # ODR-0013 §Severity tiering: an unprovenanced Claim (no
    # prov:wasDerivedFrom and no explicit unverified marker) is a
    # Violation-tier breach. This shape enforces presence of one or the
    # other.
    pshape = BNode()
    g.add((OPDA_SHAPE.UnprovenancedClaimShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.UnprovenancedClaimShape, SH.targetClass, OPDA.Claim))
    g.add((OPDA_SHAPE.UnprovenancedClaimShape, SH.property, pshape))
    g.add((OPDA_SHAPE.UnprovenancedClaimShape, DCTERMS.source, _ODR_0009_Q1))
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
        shape_iri=OPDA_SHAPE.PROVOClaimsRule,
        target_class=OPDA.Claim,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
        shape_iri=OPDA_SHAPE.VerificationActivitySuccessionRule,
        target_class=OPDA.VerificationActivity,
        sparql_construct=(
            "PREFIX opda: <https://opda.org.uk/pdtf/>\n"
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
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/governance-shapes")
    for t in _module_shapes_header(
        module_iri=module_iri, title="OPDA Governance Shapes",
    ):
        g.add(t)

    # --- Cat 1: DPVMappingRecord identity-key ---------------------------
    # A DPVMappingRecord MUST target a Kind class (Cat 1: identity surface).
    pshape = BNode()
    g.add((OPDA_SHAPE.DPVMappingRecordIdentityKeyShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.DPVMappingRecordIdentityKeyShape,
           SH.targetClass, OPDA.DPVMappingRecord))
    g.add((OPDA_SHAPE.DPVMappingRecordIdentityKeyShape, SH.property, pshape))
    g.add((OPDA_SHAPE.DPVMappingRecordIdentityKeyShape,
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


def _scheme_member_uris(scheme_local: str) -> list[URIRef]:
    """Return concept URIs for any SKOS scheme by local name (Council-046 Q3b).

    Generic sibling of _peril_concept_uris / _currency_concept_uris — used by
    _add_enum_value_shape after the sh:in flip from literal notations to IRIs.
    """
    from opda_gen.emitters.vocabularies import _all_schemes

    for scheme in _all_schemes():
        if scheme.local_name == scheme_local:
            return [scheme.member_uri(m) for m in scheme.members]
    raise ValueError(f"scheme not found: {scheme_local}")


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


def _sh_class_or(g: Graph, classes: list[URIRef]) -> BNode:
    """Build a SHACL `sh:or` disjunction of `[ sh:class C ]` node shapes and
    return the list BNode (the object for an `sh:or` triple).

    The Council session-047 bearer-disjunction carrier (ODR-0032 §R1 / ODR-0013):
    a multi-bearer/multi-range object property pins its co-domain to a UNION of
    classes via `sh:or ([sh:class A][sh:class B]…)`, NOT an `rdfs:range`
    `owl:unionOf` — an `rdfs:range` union would *entail* every object is an A
    (Hendler's everything-becomes-an-A anti-pattern; rdfs:range infers, it does
    not constrain). Order is preserved as given (deterministic byte-identity);
    callers pass the disjuncts in a fixed, documented order.
    """
    disjuncts: list[BNode] = []
    for cls in classes:
        d = BNode()
        g.add((d, SH["class"], cls))
        disjuncts.append(d)
    or_list = BNode()
    Collection(g, or_list, disjuncts)
    return or_list


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
    local = str(prop).rsplit("/", 1)[-1]
    g.add((shape_iri, RDF.type, SH.NodeShape))
    g.add((shape_iri, SH.targetSubjectsOf, prop))
    g.add((shape_iri, DCTERMS.source, source))
    p = BNode()
    g.add((shape_iri, SH.property, p))
    g.add((p, SH.path, prop))
    g.add((p, SH.nodeKind, SH.IRI))
    g.add((p, SH.maxCount, Literal(1)))
    _add_in_iri_list(g, p, _scheme_member_uris(scheme_local))
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
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/descriptive-shapes")
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
        shape_iri = OPDA_SHAPE[f"{str(cls).rsplit('/', 1)[-1]}IdentityKeyShape"]
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
        shape_iri = OPDA_SHAPE[f"{str(cls).rsplit('/', 1)[-1]}InternalStructureShape"]
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
    g.add((OPDA_SHAPE.RiskAssessmentShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.RiskAssessmentShape, SH.targetClass, OPDA.RiskAssessment))
    g.add((OPDA_SHAPE.RiskAssessmentShape, DCTERMS.source, _ODR_0008D_RULE_1))

    # (1) opda:peril — sh:in the 12 PerilScheme concepts.
    p_peril = BNode()
    g.add((OPDA_SHAPE.RiskAssessmentShape, SH.property, p_peril))
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
    # Council-046 Q3b: flip to concept IRIs (matches ObjectProperty retype).
    p_ri = BNode()
    g.add((OPDA_SHAPE.RiskAssessmentShape, SH.property, p_ri))
    g.add((p_ri, SH.path, OPDA.riskIndicator))
    g.add((p_ri, SH.maxCount, Literal(1)))
    g.add((p_ri, SH.nodeKind, SH.IRI))
    _add_in_iri_list(g, p_ri, _scheme_member_uris("YesNoNotKnownScheme"))
    g.add((p_ri, SH.severity, SH.Violation))
    g.add((p_ri, SH.message, Literal(
        "RiskAssessment opda:riskIndicator MUST be one of the "
        "opda:YesNoNotKnownScheme values (No / Not known / Yes; ODR-0008d "
        "Rule 1c / Rule 4).",
        lang="en",
    )))

    # (3) opda:actionAlertRating — sh:in the ActionAlertRatingScheme (1..5).
    p_aar = BNode()
    g.add((OPDA_SHAPE.RiskAssessmentShape, SH.property, p_aar))
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
    g.add((OPDA_SHAPE.RiskAssessmentShape, SH.property, p_detail))
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
    g.add((OPDA_SHAPE.RiskAssessmentShape, SH.property, p_attr))
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
    g.add((OPDA_SHAPE.RiskAssessmentShape, SH.property, p_sub))
    g.add((p_sub, SH.path, OPDA.hasSubAssessment))
    g.add((p_sub, SH.node, OPDA_SHAPE.RiskAssessmentShape))
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
    g.add((OPDA_SHAPE.FixturesListShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.FixturesListShape, SH.targetClass, OPDA.Transaction))
    g.add((OPDA_SHAPE.FixturesListShape, DCTERMS.source, _ODR_0022_S4))
    # Tie the controlled item vocabulary (FixtureItemScheme) without minting
    # an item-reference predicate or a FixtureItem class.
    g.add((OPDA_SHAPE.FixturesListShape, DCTERMS.references, OPDA_SCHEME.FixtureItemScheme))
    g.add((OPDA_SHAPE.FixturesListShape, RDFS.comment, Literal(
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
    # Council-046 Q3b: flip to concept IRIs (matches ObjectProperty retype).
    p_incl = BNode()
    g.add((OPDA_SHAPE.FixturesListShape, SH.property, p_incl))
    g.add((p_incl, SH.path, OPDA.inclusionStatus))
    g.add((p_incl, SH.nodeKind, SH.IRI))
    _add_in_iri_list(g, p_incl, _scheme_member_uris("InclusionStatusScheme"))
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
    g.add((OPDA_SHAPE.FixturesListShape, SH.property, p_price))
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
    g.add((OPDA_SHAPE.FixturesListShape, SH.property, p_comment))
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
        (OPDA_SHAPE.MediaUrlShape, OPDA.mediaUrl, "media URL"),
        (OPDA_SHAPE.UrlShape, OPDA.url, "URL"),
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
            f"opda:{str(prop).rsplit('/', 1)[-1]} ({ref_label}) MUST be a "
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
    g.add((OPDA_SHAPE.MonetaryAmountShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.MonetaryAmountShape, SH.targetClass, OPDA.MonetaryAmount))
    g.add((OPDA_SHAPE.MonetaryAmountShape, DCTERMS.source, _ODR_0024_R3))

    p_amount = BNode()
    g.add((OPDA_SHAPE.MonetaryAmountShape, SH.property, p_amount))
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
    g.add((OPDA_SHAPE.MonetaryAmountShape, SH.property, p_currency))
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
        (OPDA_SHAPE.ConstructionTypeValueShape, OPDA.constructionType,
         "ConstructionTypeScheme"),
        (OPDA_SHAPE.PriceQualifierValueShape, OPDA.priceQualifier,
         "PriceQualifierScheme"),
        (OPDA_SHAPE.TransportTypeValueShape, OPDA.transportType,
         "TransportTypeScheme"),
        (OPDA_SHAPE.BroadbandConnectionValueShape, OPDA.typeOfConnection,
         "BroadbandConnectionTypeScheme"),
        (OPDA_SHAPE.OfstedRatingValueShape, OPDA.ofstedRating, "OfstedRatingScheme"),
        (OPDA_SHAPE.MarketingTenureValueShape, OPDA.marketingTenure,
         "TenureKindScheme"),
    ):
        _add_enum_value_shape(g, shape_iri, prop, scheme_local, _ODR_0024_R6)

    # --- ODR-0024 R10 / session-030: the opda:RoomDimension value structure --
    # An anonymous by-value structure (the opda:MonetaryAmount precedent): a
    # KEYLESS node shape (length/width xsd:decimal, roomName xsd:string), NO
    # identity key (it has no IC — individuated by value; roomName is non-rigid
    # and never a key), NO base sh:minCount (per-form cardinality lives in the
    # overlay profile, ODR-0010 §Q7a).
    g.add((OPDA_SHAPE.RoomDimensionShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.RoomDimensionShape, SH.targetClass, OPDA.RoomDimension))
    g.add((OPDA_SHAPE.RoomDimensionShape, DCTERMS.source, _ODR_0024_R10))
    for _rd_path, _rd_dt, _rd_ref in (
        (OPDA.length, XSD.decimal, "length (metres)"),
        (OPDA.width, XSD.decimal, "width (metres)"),
        (OPDA.roomName, XSD.string, "roomName (non-rigid label)"),
    ):
        p_rd = BNode()
        g.add((OPDA_SHAPE.RoomDimensionShape, SH.property, p_rd))
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
        "https://opda.org.uk/pdtf/harness/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0012-shacl-and-dpv-annotation-emission",
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
