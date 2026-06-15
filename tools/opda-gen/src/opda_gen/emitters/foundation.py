"""
Module foundation.

Realises:
- ADR-0009 §"foundation.ttl — ontology header" — `vann:`-headed ontology
  with `owl:versionIRI`, `dct:` metadata, `sh:declare` prefix node.
- ADR-0009 §"opda-classes.ttl — initial class graph" — the two foundation
  classes (`opda:DiagnosticExemplar`, `opda:GeneratorRun`) emitted with the
  ADR-0007 §"A9 per-kind discipline output" triple set (`dct:source` +
  `skos:scopeNote` + `rdfs:comment`).
- ADR-0011 — foundation expansion to three additional UFO meta-classes
  used cross-module: `opda:RoleMixin`, `opda:Role`, `opda:Relator`. These
  belong here (foundation) rather than in any single module file because
  they are referenced by `opda-agent.ttl` (Seller, Buyer, Proprietor,
  Proprietorship), `opda-transaction.ttl` (Transaction-as-Relator), and
  the cross-cutting UFO discipline. The classes carry full A9 per-kind
  discipline citing UFO source (Guizzardi 2005 Ch. 4) and the ratifying
  ODR section (ODR-0006 §Q2/§Q3).
- ADR-0012 — foundation `opda-shapes.ttl` extension with cross-cutting
  meta-shapes: NoIdentityOverride (Cat 3 per ODR-0013); ShInSemantics +
  ShViolationFloor (three-rule interface contract per ODR-0010);
  MetaShapeOverShapeGraph (Cat 5 per ODR-0017 §2a amendment);
  PIIWithoutDPVCoAnnotationRule (SHACL-AF rule per ODR-0012 §Q5 +
  ODR-0017); DeprecationChainRule (SHACL-AF rule per ODR-0011 §5a +
  ODR-0017). Per-module shapes live in `opda-<module>-shapes.ttl`.
- ADR-0012 — foundation `opda-annotations.ttl` remains header-only;
  the six foundation classes (DiagnosticExemplar, GeneratorRun,
  RoleMixin, Role, Relator, ValidationContext) are not PII-bearing.
- ADR-0014 G14 closure — `opda:hasSpecialCategoryData` declared as
  foundation `owl:DatatypeProperty` so the Cat 4
  `SpecialCategoryPIIWithoutLawfulBasisShape` (in
  opda-agent-shapes.ttl) has a real predicate target. Engineering
  placeholder per ADR-0005 §G14 — Council Author-only session via
  S012 Q3 may rename or refine; this declaration preserves the route
  via skos:scopeNote without blocking the Cat 4 shape's mechanical
  operation.
- ADR-0014 G17 closure — generator-comment header text refers to
  "six foundation classes" (was "five"); ValidationContext was added
  by ADR-0013 and this file's `extra_lines` for opda-classes.ttl
  now lists all six.
- ADR-0009 §"opda-shapes.ttl — initial shapes graph" — header-only graph
  pointing at the class-graph version IRI via `opda:targetsClassGraph`
  (now extended by ADR-0012).
- ADR-0009 §"opda-annotations.ttl — initial annotations graph" — header-only
  graph pointing at the class-graph version IRI (remains header-only
  per ADR-0012 because foundation classes have no DPV regime).
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
from opda_gen.namespaces import OPDA, OPDA_GRAPH, release_iri
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces -----------------------------------------------------------
VANN = Namespace("http://purl.org/vocab/vann/")
SH = Namespace("http://www.w3.org/ns/shacl#")


# --- Constants pinned by ADR-0009 + ADR-0010 + ADR-0011 + ADR-0012 -------
_ONTOLOGY_IRI = URIRef("https://opda.org.uk/pdtf/")
# `owl:versionIRI` is the CLASS-GRAPH identity; it advances when the
# class-graph content materially extends (new owl:Class declarations or
# property declarations), NOT when shapes / annotations / SKOS substrate
# is added or extended. ADR-0009 pinned 0.1.0 (foundation only).
# ADR-0010 introduces the SKOS substrate at its own version IRI (the
# foundation class-graph IRI did not move). ADR-0011 added six per-module
# TBoxes plus three UFO meta-classes folded into the foundation class
# graph — that *was* a substantive class-graph extension, hence the bump
# to 0.3.0. ADR-0012 adds shape graphs + annotation graphs + foundation
# meta-shapes but does NOT extend the class graph; the class-graph IRI
# stayed at 0.3.0. ADR-0013 added opda:ValidationContext — bump to 0.4.0.
# ADR-0014 adds opda:hasSpecialCategoryData (foundation DatatypeProperty
# per G14) and crosses the MVP gate — bumps to 1.0.0 marking the v1 release
# of the OPDA ontology. The generator package version
# (`opda_gen.__version__`) tracks the toolchain's emitter capabilities;
# 1.0.0 here marks the MVP-gate release per ODR-0003 §Programme
# retirement criterion.
# ADR-0006: version is OUT of the IRI path. `owl:versionIRI` now points at a
# harness release snapshot (`…/pdtf/harness/release/1.0.0/`); the version
# label itself is carried by `owl:versionInfo`.
_RELEASE_IRI = release_iri("1.0.0")
# ADR-0006: named graphs are logical groupings under `…/pdtf/graph/` (the
# foundation shapes + annotations graphs).
_SHAPES_GRAPH_IRI = OPDA_GRAPH["shapes"]
_ANNOTATIONS_GRAPH_IRI = OPDA_GRAPH["annotations"]
_OPDA_NS_LITERAL = Literal("https://opda.org.uk/pdtf/", datatype=XSD.anyURI)
_LICENSE_IRI = URIRef("https://creativecommons.org/publicdomain/zero/1.0/")
# ADR-0009 fixes the dct:issued at the date of first emission.
_ISSUED_DATE = "2026-05-27"
# The dct:modified + generator-header "at <date>" is also pinned for
# byte-identity CI. It updates only when a future ADR materially mutates the
# foundation content; until then, this constant is the source of truth for
# "when did the foundation TTLs last substantively change". Override via
# the `emission_date` kwarg of `emit_foundation()` for ad-hoc tests; CI
# MUST regenerate with this pinned default so the diff is zero.
_FOUNDATION_LAST_MODIFIED = "2026-05-30"  # ADR-0026 owl:versionInfo bump (bounded-context scheme)
# The generator-comment header's "# Source commit:" line is pinned to a
# sentinel string per ADR-0009 (not the live HEAD SHA). Rationale: the live
# SHA changes on every unrelated commit and would break byte-identity CI.
# The sentinel tells human readers which ADR ratified this content; the
# live SHA at the time of any specific regeneration is recoverable via
# `git log -- source/03-standards/ontology/foundation.ttl`. The constant
# advances when a future ADR materially mutates the foundation content.
# ADR-0011 adds three UFO meta-classes (RoleMixin / Role / Relator) to
# the foundation class graph plus bumps the foundation `owl:versionIRI`,
# both substantive foundation mutations warranting the sentinel bump.
_FOUNDATION_SOURCE_COMMIT = "pinned-by-ADR-0026"
# Generator-version label per ADR-0009 §"foundation.ttl — ontology header" line 73.
_GENERATOR_VERSION_LABEL = f"opda-gen-{__version__}"
# Version-info string tracks the ADR responsible for the most recent
# substantive substrate addition. ADR-0009 set "foundation skeleton";
# ADR-0010 extended to "foundation + SKOS vocabularies"; ADR-0011 adds
# the three UFO meta-classes and unblocks per-module emission.
_VERSION_INFO = (
    f"{__version__} — foundation + SKOS vocabularies + UFO meta-classes "
    "+ module shapes + DPV annotations + overlay profiles + "
    "ValidationContext + hasSpecialCategoryData + bounded-context scheme "
    "(ADR-0009 + ADR-0010 + ADR-0011 + ADR-0012 + ADR-0013 + ADR-0014 "
    "+ ADR-0026)"
)

# dct:source URIs — every emitted class cites its ratified ODR section.
_ODR_0004_SECTION_8A = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0004/section-8a-diagnostic-exemplars"
)
_ODR_0004_SECTION_6A = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0004/section-6a-generator-first"
)
# ADR-0011 — UFO meta-classes ratified by ODR-0006 §Q2 (RoleMixin / Role
# layer) and §Q3 (Relator layer).
_ODR_0006_SECTION_Q2 = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q2"
)
_ODR_0006_SECTION_Q3 = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q3"
)
# ADR-0014 G14 — Cat 4 placeholder predicate routes to S012 Q3.
_ODR_0012_SECTION_Q5 = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Q5"
)
# ADR-0005 §G D3 — opda:isPIIBearing routes to the Phase-1 PII floor
# (ODR-0012 §Q5 PII co-annotation rule + ODR-0018 §Rule 1 baseline).
_ODR_0018_SECTION_RULE1 = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule1"
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
        "https://opda.org.uk/pdtf/harness/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0026-bounded-context-scheme-emission",
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
    - ``<https://opda.org.uk/pdtf/>`` — `owl:Ontology` with dct/vann/owl
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
    g.add((_ONTOLOGY_IRI, OWL.versionIRI, _RELEASE_IRI))
    g.add((_ONTOLOGY_IRI, OWL.versionInfo, Literal(_VERSION_INFO)))
    g.add((_ONTOLOGY_IRI, OPDA.generatorVersion, Literal(_GENERATOR_VERSION_LABEL)))

    # sh:declare blank-node binding the opda prefix per ADR-0009 lines 74-77.
    declare_node = BNode()
    g.add((_ONTOLOGY_IRI, SH.declare, declare_node))
    g.add((declare_node, SH.prefix, Literal("opda")))
    g.add((declare_node, SH.namespace, _OPDA_NS_LITERAL))
    return g


def build_classes_graph() -> Graph:
    """Build the OWL class graph per ADR-0009/0011/0013/0014.

    Six classes after ADR-0013 (ValidationContext); two DatatypeProperties
    after ADR-0014 (hasSpecialCategoryData) + ADR-0005 §G D3 (isPIIBearing):

    - `opda:DiagnosticExemplar`, `opda:GeneratorRun` — foundation (ADR-0009).
    - `opda:RoleMixin`, `opda:Role`, `opda:Relator` — UFO meta-classes
      referenced by every per-module TBox (ADR-0011 + ODR-0006 §Q2/§Q3).
    - `opda:ValidationContext` — profile reification per ODR-0010 §Q1
      (ADR-0013).
    - `opda:hasSpecialCategoryData` — Cat 4 SHACL shape target predicate
      (ADR-0014 G14; Council S012 Q3 routing preserved).
    - `opda:isPIIBearing` — Phase-1 PII-floor target predicate
      (ADR-0005 §G D3; PIIWithoutDPVCoAnnotationRule target).

    Each emitted with the ADR-0007 §"A9 per-kind discipline output"
    triple set: `rdf:type owl:{Class|DatatypeProperty}` + `rdfs:label`
    + `rdfs:comment` + `skos:scopeNote` + `dct:source`.
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

    # --- ADR-0011 — UFO meta-classes folded into the foundation ----------
    # These three classes are referenced cross-module (Seller / Buyer as
    # RoleMixin; Proprietor as Role; Transaction / Proprietorship as
    # Relator). They land here so per-module TBoxes can subclass them
    # uniformly without each module re-declaring the UFO meta-vocabulary.

    g.add((OPDA.RoleMixin, RDF.type, OWL.Class))
    g.add((OPDA.RoleMixin, RDFS.label, Literal("Role Mixin", lang="en")))
    g.add((OPDA.RoleMixin, RDFS.comment, Literal(
        "UFO RoleMixin — anti-rigid, cross-sortal role pattern. An "
        "instance of a RoleMixin is borne by a bearer drawn from more "
        "than one substantial Kind (e.g. Seller may be borne by Person OR "
        "Organisation). Distinguished from `opda:Role` (which is sortal "
        "— borne by a single Kind). Per ODR-0006 §Q2 Role layer.",
        lang="en",
    )))
    g.add((OPDA.RoleMixin, SKOS.scopeNote, Literal(
        "UFO: RoleMixin (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, "
        "externally founded, cross-sortal). DOLCE: Role qua Universal "
        "without sortal commitment (Masolo et al. 2003 D18 §4.5).",
        lang="en",
    )))
    g.add((OPDA.RoleMixin, DCTERMS.source, _ODR_0006_SECTION_Q2))

    g.add((OPDA.Role, RDF.type, OWL.Class))
    g.add((OPDA.Role, RDFS.label, Literal("Role", lang="en")))
    g.add((OPDA.Role, RDFS.comment, Literal(
        "UFO Role — anti-rigid, sortal role. An instance of a Role is "
        "borne by a bearer drawn from a single substantial Kind (e.g. "
        "Proprietor is borne by a Person — or by an Organisation under a "
        "named specialisation, but never simultaneously). A Role NEVER "
        "supplies its own identity; it borrows identity from its bearer "
        "(ODR-0005 Anti-pattern §3 — never key a Role). Per ODR-0006 §Q2.",
        lang="en",
    )))
    g.add((OPDA.Role, SKOS.scopeNote, Literal(
        "UFO: Role (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, externally "
        "founded, sortal). Distinguished from RoleMixin by sortal "
        "commitment to a single Kind.",
        lang="en",
    )))
    g.add((OPDA.Role, DCTERMS.source, _ODR_0006_SECTION_Q2))

    g.add((OPDA.Relator, RDF.type, OWL.Class))
    g.add((OPDA.Relator, RDFS.label, Literal("Relator", lang="en")))
    g.add((OPDA.Relator, RDFS.comment, Literal(
        "UFO Relator — a relational endurant that mediates two or more "
        "bearers and is founded by an external event. The Relator carries "
        "its own identity (the (mediated-bearers, founding-event) tuple) "
        "and bears properties that don't belong to any single mediated "
        "Kind. OPDA Relators in scope: opda:Transaction (founds Seller / "
        "Buyer RoleMixins per ODR-0007 §Q1); opda:Proprietorship (binds "
        "Proprietor Roles to a RegisteredTitle per ODR-0006 §Q3).",
        lang="en",
    )))
    g.add((OPDA.Relator, SKOS.scopeNote, Literal(
        "UFO: Relator (Guizzardi 2005 Ch. 4 §4.4 — relational endurant; "
        "founded by an event; mediates two or more bearers). DOLCE: "
        "Relation as Universal (Masolo et al. 2003 D18 §4.6).",
        lang="en",
    )))
    g.add((OPDA.Relator, DCTERMS.source, _ODR_0006_SECTION_Q3))

    # --- ADR-0013 — opda:ValidationContext (UFO Substance Kind) ---------
    # Per ODR-0010 §Q1 (Guarino's accepted withdrawal condition): a
    # profile is reified as a first-class opda:ValidationContext node so
    # `sh:minCount 1` is a constraint of a named context — "required
    # under the BASPI5 profile" — not a free-floating axiom. ADR-0013
    # emits the per-profile reified node; this declaration provides the
    # owl:Class typing the reified nodes assert.
    g.add((OPDA.ValidationContext, RDF.type, OWL.Class))
    g.add((OPDA.ValidationContext, RDFS.label,
           Literal("Validation Context", lang="en")))
    g.add((OPDA.ValidationContext, RDFS.comment, Literal(
        "Reification of an overlay-profile validation context per "
        "ODR-0010 §Q1 (Guarino withdrawal condition). Each instance "
        "carries five properties: opda:profileURI, opda:requires, "
        "opda:overlaysContext, opda:sourcedFrom, opda:formVersion. "
        "Anchors per-profile cardinality/enum constraints in a named "
        "context — converting conditionality from 'required (depending)' "
        "to 'required relative to a named, dereferenceable context'. "
        "ADR-0013 emits per-profile instances under "
        "<https://opda.org.uk/pdtf/Baspi5ValidationContext> etc.",
        lang="en",
    )))
    g.add((OPDA.ValidationContext, SKOS.scopeNote, Literal(
        "UFO: Substance Kind (informational). Reifies a SHACL profile as "
        "a first-class subject so its constraints have determinate model "
        "theory (Guarino's withdrawal condition discharged at S010).",
        lang="en",
    )))
    g.add((OPDA.ValidationContext, DCTERMS.source,
           URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0010/section-Q1")))

    # --- ADR-0014 G14 — opda:hasSpecialCategoryData (Cat 4 target) -------
    # The Cat 4 SHACL shape `SpecialCategoryPIIWithoutLawfulBasisShape`
    # in `opda-agent-shapes.ttl` targets `opda:Person` and tests for
    # `opda:hasSpecialCategoryData true` paired with `dpv:hasLegalBasis`
    # minCount. Without this declaration the predicate has no TBox
    # surface for downstream tooling (DASH editors, SPARQL query
    # planners) even though SHACL operates on triples without prior
    # declaration. Engineering placeholder per ADR-0005 §G14 —
    # Council S012 Q3 ratification (the canonical predicate name)
    # may rename or refine; the `skos:scopeNote` preserves the route.
    g.add((OPDA.hasSpecialCategoryData, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.hasSpecialCategoryData, RDFS.range, XSD.boolean))
    g.add((OPDA.hasSpecialCategoryData, RDFS.label,
           Literal("has special-category data", lang="en")))
    g.add((OPDA.hasSpecialCategoryData, RDFS.comment, Literal(
        "Flag indicating that a record carries GDPR Article 9 / 10 "
        "special-category personal data (race, religion, health, sex "
        "life, sexual orientation, political opinion, trade-union "
        "membership, biometric/genetic data, criminal convictions). "
        "Domain unconstrained at foundation scope so the predicate may "
        "be borne by Person records (the typical case targeted by the "
        "Cat 4 SHACL shape in opda-agent-shapes.ttl) or by any other "
        "Kind that carries article-9/10 data downstream. Engineering "
        "placeholder pending S012 Q3 Council ratification of the "
        "canonical predicate name.",
        lang="en",
    )))
    g.add((OPDA.hasSpecialCategoryData, SKOS.scopeNote, Literal(
        "Placeholder predicate — Cat 4 SHACL shape "
        "(SpecialCategoryPIIWithoutLawfulBasisShape) targets this "
        "predicate per ADR-0012. Council Author-only session via "
        "S012 Q3 may rename or refine the canonical name; ADR-0012 "
        "shape updates in lockstep. Until then, this declaration "
        "gives the Cat 4 shape a real TBox-level target.",
        lang="en",
    )))
    g.add((OPDA.hasSpecialCategoryData, DCTERMS.source,
           _ODR_0012_SECTION_Q5))

    # --- ADR-0005 §G D3 — opda:isPIIBearing (Phase-1 PII-floor target) ----
    # The cross-cutting SHACL-AF rule `PIIWithoutDPVCoAnnotationRule` (in
    # opda-shapes.ttl) targets `owl:Class` and flags any class marked
    # `opda:isPIIBearing true` that lacks a class-level
    # `dpv-pd:hasPersonalDataCategory` co-annotation. Without this
    # declaration the predicate has no TBox surface; without an emitter
    # asserting it on the baseline PII Kinds the rule has no target and the
    # Phase-1 PII floor is a no-op. This declaration + the
    # `opda-*-annotations.ttl` emission (ODR-0018 §Rule 1 baseline Kinds)
    # together activate the floor. Mirrors opda:hasSpecialCategoryData.
    g.add((OPDA.isPIIBearing, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.isPIIBearing, RDFS.range, XSD.boolean))
    g.add((OPDA.isPIIBearing, RDFS.label,
           Literal("is PII bearing", lang="en")))
    g.add((OPDA.isPIIBearing, RDFS.comment, Literal(
        "Flag marking a class as a bearer of personally identifiable "
        "information under the ODR-0012 Phase-1 floor. A class asserted "
        "opda:isPIIBearing true is in scope for the Phase-1 "
        "PII-co-annotation discipline (ODR-0018 §Rule 1): it MUST carry a "
        "class-level dpv-pd:hasPersonalDataCategory baseline in "
        "opda-<module>-annotations.ttl. The cross-cutting SHACL-AF rule "
        "PIIWithoutDPVCoAnnotationRule flags any opda:isPIIBearing true "
        "class lacking that co-annotation as a sh:Warning breach. Range "
        "xsd:boolean; emitted true on exactly the baseline PII-bearing "
        "Kinds (Person, Property, Address, RegisteredTitle, Claim, "
        "EPCCertificate) — Organisation is intentionally unmarked "
        "(ODR-0006 §Q6: not a data subject).",
        lang="en",
    )))
    g.add((OPDA.isPIIBearing, SKOS.scopeNote, Literal(
        "Phase-1 PII-floor target predicate — the SHACL-AF rule "
        "PIIWithoutDPVCoAnnotationRule (opda-shapes.ttl) checks for "
        "opda:isPIIBearing true classes without a "
        "dpv-pd:hasPersonalDataCategory co-annotation. Asserted in the "
        "annotation graph (ODR-0018 §Rule 1) on the baseline PII Kinds so "
        "the rule's target set is non-empty and the floor is enforced.",
        lang="en",
    )))
    g.add((OPDA.isPIIBearing, DCTERMS.source, _ODR_0018_SECTION_RULE1))

    # ADR-0044 Phase 5c — structured opda:ufoCategory facet on the foundation
    # classes (DiagnosticExemplar, GeneratorRun, RoleMixin, Role, Relator,
    # ValidationContext); DatatypeProperties are untouched (owl:Class only).
    from opda_gen.emitters.ufo_categories import annotate_ufo_categories
    annotate_ufo_categories(g)
    return g


def build_shapes_graph() -> Graph:
    """Build the foundation SHACL shapes graph.

    Per ADR-0009: ontology header declaring `opda:targetsClassGraph`.
    Per ADR-0012: five foundation-level meta-shapes added:

    - `opda:NoIdentityOverride_MetaShape` (Category 3 per ODR-0013 §Q1
      + ODR-0010 §Q6) — verifies no overlay profile shape can remove
      the identity-key property of a Substance Kind.
    - `opda:ShInSemantics_MetaShape` (three-rule interface contract,
      first rule per ODR-0010) — verifies overlay `sh:in` constraints
      union into base SKOS scheme (encoded as SPARQL-based skeleton).
    - `opda:ShViolationFloor_MetaShape` (three-rule interface contract,
      second rule per ODR-0010) — verifies no overlay downgrades a
      base `sh:Violation` severity.
    - `opda:MetaShapeOverShapeGraphMetaShape` (Category 5 per
      ODR-0013 §Q1 + ODR-0017 §2a amendment) — verifies any
      meta-shape over the shape-graph using `sh:Violation` severity
      carries explicit `opda:metaShapeJustification`.
    - `opda:PIIWithoutDPVCoAnnotationRule` (SHACL-AF rule per
      ODR-0017 + ODR-0012 §Q5) — non-blocking quality rule flagging
      any class marked `opda:isPIIBearing true` that lacks a
      `dpv-pd:hasPersonalDataCategory` co-annotation in the annotation
      graph.
    - `opda:DeprecationChainRule` (SHACL-AF rule per ODR-0011 §5a +
      ODR-0017 §1a citing site #2) — non-blocking quality rule
      materialising the deprecation chain for any SKOS Concept marked
      `owl:deprecated true`.

    Per ODR-0029 R3: the domain/range-as-SHACL-constraint layer — a
    `sh:targetSubjectsOf <pred> ; sh:class C` node shape for every
    `rdfs:domain C` and the `sh:targetObjectsOf` dual for every class-valued
    `rdfs:range C`. This VALIDATES (closed-world) the domain/range the
    Safe-Group entailment deliberately does NOT infer (ODR-0025 §R2/§R7) — the
    inference/validation boundary.

    The cross-module shapes (per-Kind identity / IC breach / etc.)
    land in the per-module `opda-<module>-shapes.ttl` files via
    `opda_gen.emitters.shapes`. This foundation file holds the
    cross-cutting meta-shapes + the ODR-0029 R3 domain/range layer.
    """
    g = Graph()
    _bind_common(g)
    g.bind("dct", DCTERMS)
    g.add((_SHAPES_GRAPH_IRI, RDF.type, OWL.Ontology))
    g.add((_SHAPES_GRAPH_IRI, DCTERMS.title, Literal(
        "OPDA SHACL Shapes Graph", lang="en"
    )))
    g.add((_SHAPES_GRAPH_IRI, OPDA.targetsClassGraph, _ONTOLOGY_IRI))

    # Lazy import to keep the foundation builder dependency-free at
    # import time (the shapes builder lives in a sibling module).
    from opda_gen.emitters.shapes import (
        build_domain_range_constraint_shapes,
        build_foundation_meta_shapes,
    )

    build_foundation_meta_shapes(g)
    # ODR-0029 R3: the domain/range-as-SHACL-constraint layer (validates the
    # rdfs:domain/range the Safe-Group closure deliberately does NOT infer).
    build_domain_range_constraint_shapes(g)
    return g


def build_annotations_graph() -> Graph:
    """Build the foundation advisory annotations graph.

    Per ADR-0009 + ADR-0012: header-only. The six foundation classes
    (DiagnosticExemplar, GeneratorRun, RoleMixin, Role, Relator,
    ValidationContext) are NOT PII-bearing — none carry a DPV
    co-annotation. The opda:hasSpecialCategoryData property added by
    ADR-0014 G14 is a Cat 4 shape target predicate; its DPV
    co-annotation lands on the bearing class (opda:Person) in
    opda-agent-annotations.ttl, not here.

    No `sh:*`/`opda:aiHint`/`opda:uiHint`/`opda:exampleValue` triples;
    no DPV triples (the foundation classes carry no PII regime); only
    the ontology header declaring `opda:targetsClassGraph
    <https://opda.org.uk/pdtf/harness/release/1.0.0/>` (post-ADR-0014 G14 + MVP-gate
    version bump).
    """
    g = Graph()
    _bind_common(g)
    g.add((_ANNOTATIONS_GRAPH_IRI, RDF.type, OWL.Ontology))
    g.add((_ANNOTATIONS_GRAPH_IRI, DCTERMS.title, Literal(
        "OPDA Advisory Annotations Graph", lang="en"
    )))
    g.add((_ANNOTATIONS_GRAPH_IRI, OPDA.targetsClassGraph, _ONTOLOGY_IRI))
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
                "Six foundation classes: two per ADR-0009 (DiagnosticExemplar,",
                "GeneratorRun); three UFO meta-classes per ADR-0011 (RoleMixin,",
                "Role, Relator — referenced cross-module); ValidationContext per",
                "ADR-0013 (ODR-0010 §Q1 profile reification). Plus two",
                "DatatypeProperties: opda:hasSpecialCategoryData (ADR-0014 G14;",
                "Cat 4 SHACL shape target; S012 Q3 Council ratification preserves",
                "the rename route) and opda:isPIIBearing (ADR-0005 §G D3; the",
                "Phase-1 PII-floor target for PIIWithoutDPVCoAnnotationRule).",
                "Per-module classes land in opda-<module>.ttl via ADR-0011.",
            ],
            build_classes_graph(),
        ),
        (
            SHAPES_FILENAME,
            "OPDA SHACL shapes graph (foundation + cross-cutting meta-shapes)",
            [
                "Per-module Cat 1/2 shapes + SHACL-AF rules live in",
                "opda-<module>-shapes.ttl. This file carries the five",
                "foundation meta-shapes per ADR-0012:",
                "NoIdentityOverride (Cat 3, ODR-0010 §Q6);",
                "ShInSemantics + ShViolationFloor (three-rule interface",
                "contract per ODR-0010); MetaShapeOverShapeGraph (Cat 5,",
                "ODR-0017 §2a); plus two cross-cutting SHACL-AF rules:",
                "PIIWithoutDPVCoAnnotationRule (ODR-0012 §Q5);",
                "DeprecationChainRule (ODR-0011 §5a; ODR-0017 §1a).",
                "MUST NOT contain owl:Class or owl:imports triples",
                "(ODR-0004 §3a three-graph separation).",
            ],
            build_shapes_graph(),
        ),
        (
            ANNOTATIONS_FILENAME,
            "OPDA advisory annotations graph (foundation header)",
            [
                "Header-only per ADR-0012: the six foundation classes",
                "(DiagnosticExemplar, GeneratorRun, RoleMixin, Role,",
                "Relator, ValidationContext) are not PII-bearing — no DPV",
                "co-annotation baseline applies. Per-module DPV annotations",
                "live in opda-<module>-annotations.ttl.",
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
