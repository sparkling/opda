"""
UFO meta-category facet — `opda:ufoCategory` + `opda:UFOCategoryScheme`.

**ODR-0031 / council session-041 (realised by ADR-0045).** The
`opda:ufoCategory` facet is an INERT, annotation-graph-only documentary
annotation. This module emits the WHOLE facet block into the foundation
annotation graph (`opda-annotations.ttl`), via
`foundation.build_annotations_graph()`:

  1. the `opda:ufoCategory` **`owl:AnnotationProperty`** declaration — retyped
     from `owl:DatatypeProperty` (ADR-0045). OWL 2 §10.1: annotation properties
     carry no model-theoretic consequence, so inertness is *intrinsic to the
     term*, not contingent on the ODR-0029 shallow regime;
  2. one `opda:ufoCategory` **string** tag per `owl:Class` (the 9-term UFO
     endurant/perdurant axis) — the value stays a literal keyed to the
     concept's `skos:notation` (ODR-0031 R1 string range; the resource is the
     mapping anchor);
  3. `opda:UFOCategoryScheme` — a SKOS ConceptScheme of 9 category concepts,
     each bearing its OntoClean signature (`skos:definition`), a
     `skos:notation` matching the string tag, and a `skos:closeMatch` to the
     gUFO IRI where one exists.

**Why here, not in the class graph.** ADR-0044 Phase 5c declared the predicate
`owl:DatatypeProperty` and asserted the tags inline in the reasoned class graphs
— breaching ODR-0030 Rule 1 ("annotation-graph-only; retention lapses if
breached") and firing Cagle's session-040 re-open trigger (i). ADR-0045
relocates the whole block here and adds a sixth three-graph CI gate forbidding
the advisory-predicate family in the classes graph.

**Red line (ODR-0031 R2).** The `skos:closeMatch`→gUFO edges are
referenced-not-imported and NEVER reasoned over: `gufo:Kind` carries
`rdfs:subClassOf` axioms and ODR-0029 closes over `rdfs:subClassOf`, so an
alignment edge in a reasoned graph would re-import contested metaphysics. The
scheme lives only in the annotation graph; no `owl:imports gufo:`.

**Register-deference scheme axis.** The ODR-0011 §8a scheme-level tags
("Quale-in-Region" etc.) are NO LONGER carried on `opda:ufoCategory`
(ODR-0030 Rule 2 — register-deference, not UFO categorial work); see
`emitters/vocabularies.py`.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

OPDA = Namespace("https://opda.org.uk/pdtf/")
# gUFO (Almeida, Guizzardi, Sales & Fonseca) — referenced (reference-not-import);
# bound only on the annotation graph this module writes to.
GUFO = Namespace("http://purl.org/nemo/gufo#")

_ODR_0011_8A = OPDA["harness/odr/ODR-0011/section-8a"]
_ODR_0031 = OPDA["harness/odr/ODR-0031"]


# class local-name -> UFO meta-category string (the inert facet value).
UFO_CATEGORY: dict[str, str] = {
    # Substance Kinds — rigid sortals supplying their own identity criterion.
    "Address": "Substance Kind",
    "LegalEstate": "Substance Kind",
    "NearbyFacility": "Substance Kind",
    "Organisation": "Substance Kind",
    "Person": "Substance Kind",
    "Property": "Substance Kind",
    "RegisteredTitle": "Substance Kind",
    "DiagnosticExemplar": "Substance Kind",
    "ValidationContext": "Substance Kind",
    # Information Objects — informational artefacts.
    "AttachedDocument": "Information Object",
    "Claim": "Information Object",
    "Comparable": "Information Object",
    "DPVMappingRecord": "Information Object",
    "EPCCertificate": "Information Object",
    "GeneratorRun": "Information Object",
    "LeaseTerm": "Information Object",
    "RiskAssessment": "Information Object",
    "Search": "Information Object",
    "Survey": "Information Object",
    "TrustFramework": "Information Object",
    "Valuation": "Information Object",
    # Events — perdurants.
    "LeaseExtensionEvent": "Event",
    "Milestone": "Event",
    "NameChangeEvent": "Event",
    "UPRNSuccessionEvent": "Event",
    "VerificationActivity": "Event",
    # Relators — relational endurants mediating two or more bearers.
    "Proprietorship": "Relator",
    "Relator": "Relator",
    "Transaction": "Relator",
    # RoleMixins — anti-rigid, externally founded, cross-sortal roles.
    "Buyer": "RoleMixin",
    "Evidence": "RoleMixin",
    "RoleMixin": "RoleMixin",
    "Seller": "RoleMixin",
    # Roles — anti-rigid, sortal roles.
    "Proprietor": "Role",
    "Role": "Role",
    # Qualities and quality-value structures.
    "AssuranceLevel": "Quality",
    "MonetaryAmount": "Quality Value",
    "RoomDimension": "Quality Value",
    # Collectives — aggregates of endurants.
    "TransactionChain": "Collective",
    # opda:SpecialCategoryScheme — a SKOS ConceptScheme container, not UFO-typed.
}


# category string -> (concept local-name, gUFO local-name | None, OntoClean
# signature definition). The concept is the dereferenceable anchor that carries
# the gUFO alignment + the OntoClean signature; the class tag stays a plain
# string keyed to the concept's skos:notation (ODR-0031 R1). gUFO local-name is
# None where no faithful gUFO endurant type exists (Information Object is a
# domain/IAO notion; Quality Value is a quale-in-region structure, not a class).
UFO_CATEGORY_CONCEPTS: dict[str, tuple[str, str | None, str]] = {
    "Substance Kind": (
        "SubstanceKindCategory", "Kind",
        "A rigid sortal (OntoClean +R, +O) that supplies its own principle of "
        "identity — instances are necessarily of this type, and it carries an "
        "identity criterion its instances inherit.",
    ),
    "Information Object": (
        "InformationObjectCategory", None,
        "An informational artefact / information content entity (documentary). "
        "An OPDA domain category rather than a core UFO endurant universal — "
        "cf. IAO information content entity (ODR-0030 Rule 4 crosswalk).",
    ),
    "Event": (
        "EventCategory", "Event",
        "A perdurant (occurrent): an entity that unfolds in time and has "
        "temporal parts.",
    ),
    "Relator": (
        "RelatorCategory", "Relator",
        "A relational endurant founded by an event, mediating two or more "
        "bearers (OntoClean +R, +I, +D). The relational-reification primitive "
        "(ODR-0030): it owns the relation's aggregation/modal attributes.",
    ),
    "RoleMixin": (
        "RoleMixinCategory", "RoleMixin",
        "An anti-rigid, externally-founded, dispersive (cross-sortal) role "
        "(OntoClean −R, +D) that spans more than one Kind.",
    ),
    "Role": (
        "RoleCategory", "Role",
        "An anti-rigid, externally-founded sortal role played by a single Kind "
        "(OntoClean −R, +D).",
    ),
    "Quality": (
        "QualityCategory", "Quality",
        "An individualised quality inhering in an endurant. Descends from "
        "DOLCE's Quality (Masolo et al., WonderWeb D18, 2003).",
    ),
    "Quality Value": (
        "QualityValueCategory", None,
        "The value of a quality — its position (Quale) in a quality region / "
        "space. Descends from DOLCE's Quale-in-Region (Masolo et al., "
        "WonderWeb D18, 2003).",
    ),
    "Collective": (
        "CollectiveCategory", "Collection",
        "An aggregate of endurants with uniform membership (cf. "
        "gufo:Collection).",
    ),
}


_DECL_COMMENT = (
    "The UFO foundational meta-category of an ontology class — one of "
    "Substance Kind / Information Object / Event / Relator / RoleMixin / Role / "
    "Quality / Quality Value / Collective. A documentary annotation "
    "(owl:AnnotationProperty — no logical axioms, OWL 2 §10.1): it records the "
    "design-time foundational commitment without entailing anything (the "
    "classification doctrine keeps kinds as facets, not subclass trees — "
    "ODR-0027). The category resource (opda:UFOCategoryScheme) carries the gUFO "
    "alignment and the OntoClean signature; this predicate carries the inert "
    "string tag, keyed to the concept's skos:notation (ODR-0031)."
)

_DECL_SCOPE_NOTE = (
    "UFO-informed, not UFO-grounded — the wire format reasons with nothing "
    "UFO-shaped (ODR-0030 Rule 7). (i) The categories are UFO's (Guizzardi "
    "2005). (ii) UFO's quality categories (Quality, Quality Value) descend from "
    "DOLCE's Quality / Quale / Region (Masolo et al., WonderWeb D18, 2003). "
    "(iii) The majority of OPDA's quality-tagged properties fall under that "
    "DOLCE-derived apparatus. Annotation-graph-only and referenced-not-imported "
    "to gUFO; never reasoned over (ODR-0031 R2; ODR-0030 Rule 1)."
)

_SCHEME = OPDA.UFOCategoryScheme


def emit_ufo_category_annotations(graph: Graph) -> None:
    """Emit the whole `opda:ufoCategory` facet into ``graph``.

    ``graph`` is the foundation annotation graph (`opda-annotations.ttl`).
    Adds the `owl:AnnotationProperty` declaration, the per-class string tags,
    and the `opda:UFOCategoryScheme` concept anchors. Mutates ``graph`` in
    place. ODR-0031 / ADR-0045.
    """
    graph.bind("gufo", GUFO)

    # (1) Declaration — owl:AnnotationProperty (inert by OWL 2 §10.1).
    graph.add((OPDA.ufoCategory, RDF.type, OWL.AnnotationProperty))
    graph.add((OPDA.ufoCategory, RDFS.range, XSD.string))
    graph.add((OPDA.ufoCategory, RDFS.label, Literal("UFO category", lang="en")))
    graph.add((OPDA.ufoCategory, RDFS.comment, Literal(_DECL_COMMENT, lang="en")))
    graph.add((OPDA.ufoCategory, SKOS.scopeNote, Literal(_DECL_SCOPE_NOTE, lang="en")))
    graph.add((OPDA.ufoCategory, DCTERMS.source, _ODR_0011_8A))
    graph.add((OPDA.ufoCategory, DCTERMS.source, _ODR_0031))

    # (2) Per-class inert string tags (the 9-term UFO endurant/perdurant axis).
    for local, category in UFO_CATEGORY.items():
        graph.add((OPDA[local], OPDA.ufoCategory, Literal(category)))

    # (3) opda:UFOCategoryScheme — the dereferenceable category anchors that
    # bear the gUFO alignment + OntoClean signature (ODR-0031 R1).
    graph.add((_SCHEME, RDF.type, SKOS.ConceptScheme))
    graph.add((_SCHEME, DCTERMS.title, Literal("UFO Category Scheme", lang="en")))
    graph.add((_SCHEME, SKOS.prefLabel, Literal("UFO Category Scheme", lang="en")))
    graph.add((_SCHEME, SKOS.definition, Literal(
        "The nine UFO foundational meta-categories OPDA classifies its classes "
        "under. Each concept carries its OntoClean signature and a "
        "skos:closeMatch to the corresponding gUFO type where one exists. "
        "Referenced-not-imported; never reasoned over (ODR-0031 R2).",
        lang="en",
    )))
    graph.add((_SCHEME, DCTERMS.source, _ODR_0031))
    for category, (cname, gufo_local, definition) in UFO_CATEGORY_CONCEPTS.items():
        concept = OPDA[cname]
        graph.add((concept, RDF.type, SKOS.Concept))
        graph.add((concept, SKOS.inScheme, _SCHEME))
        graph.add((concept, SKOS.prefLabel, Literal(category, lang="en")))
        graph.add((concept, SKOS.notation, Literal(category)))
        graph.add((concept, SKOS.definition, Literal(definition, lang="en")))
        if gufo_local is not None:
            graph.add((concept, SKOS.closeMatch, GUFO[gufo_local]))
        graph.add((concept, DCTERMS.source, _ODR_0031))
