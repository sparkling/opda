"""
UFO meta-category facet — opda:ufoCategory on the OWL classes.

ADR-0044 Phase 5c: each class's UFO meta-category was, until now, documentary
free-text in `skos:scopeNote` / `rdfs:comment` ("UFO: Substance Kind", "UFO
Role", …). This module promotes it to a STRUCTURED annotation — the same
`opda:ufoCategory` predicate the SKOS schemes already carry (see
`emitters/vocabularies.py`) — so the `/ontology/category` pages can group classes
by foundational category without parsing prose.

The category for each class is read from its scopeNote/comment. Plain-literal
value, matching the scheme convention. `opda:SpecialCategoryScheme` is
intentionally absent: it is an owl:Class-typed SKOS ConceptScheme container
(`rdfs:subClassOf skos:ConceptScheme`), not a UFO endurant, so it bears no UFO
meta-category.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace
from rdflib.namespace import OWL, RDF

OPDA = Namespace("https://opda.org.uk/pdtf/")

# class local-name -> UFO meta-category (read from the class scopeNote/comment).
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


def annotate_ufo_categories(graph: Graph) -> None:
    """Add `opda:ufoCategory` to every `owl:Class` in `graph` that has one.

    Mutates `graph` in place (plain-literal value, matching the SKOS-scheme
    convention). Classes absent from `UFO_CATEGORY` are left unannotated.
    """
    for cls in set(graph.subjects(RDF.type, OWL.Class)):
        local = str(cls).rsplit("/", 1)[-1]
        category = UFO_CATEGORY.get(local)
        if category is not None:
            graph.add((cls, OPDA.ufoCategory, Literal(category)))
