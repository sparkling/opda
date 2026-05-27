"""
Module governance.

Realises:
- ADR-0011 §"Per-module detail — opda-governance.ttl" —
  opda:DPVMappingRecord class + per-Kind mapping instances per ODR-0018
  §Rule 4 (PersonDPVMapping, OrganisationDPVMapping, ClaimDPVMapping
  emitted minimum) + opda:SpecialCategoryScheme (Baker S012 Q3); DPV
  reference-not-import.
- ADR-0007 §"A9 per-kind discipline output" — every class carries the
  per-kind triple set.
- ODR-0012 §Rules — DPV reference-not-import (Kendall + ODR-0002
  pattern); class-level baseline + variant-conditional refinement
  pattern is consumed here as mapping tables (the actual DPV co-annotation
  triples land in opda-annotations.ttl via ADR-0012).
- ODR-0018 §Rule 4 — class-level baseline declarations + variant-
  conditional refinement mapping tables. This module emits the mapping
  *records* (data-bearing structures); ADR-0012 emits the *annotation
  triples* from the records into opda-annotations.ttl.

Reference-not-import discipline: this module does NOT add
`owl:imports <https://w3id.org/dpv/pd>`; it cites DPV terms via
`dct:source` and `opda:baselineCategory` references. Three-graph CI
test verifies the absence of any DPV import.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD


OPDA = Namespace("https://w3id.org/opda/#")
DPV = Namespace("https://w3id.org/dpv#")
DPV_PD = Namespace("https://w3id.org/dpv/pd#")


_ODR_0012_PHASE1 = URIRef(
    "https://w3id.org/opda/odr/ODR-0012#section-Phase-1"
)
_ODR_0012_EVIDENCE = URIRef(
    "https://w3id.org/opda/odr/ODR-0012#section-evidence-co-annotation"
)
_ODR_0018_RULE4 = URIRef(
    "https://w3id.org/opda/odr/ODR-0018#section-Rule4"
)
_ODR_0018_3A = URIRef(
    "https://w3id.org/opda/odr/ODR-0018#section-3a"
)
_GDPR_ART_10 = URIRef("https://gdpr-info.eu/art-10-gdpr/")


CLASSES = (
    OPDA.DPVMappingRecord,
    OPDA.SpecialCategoryScheme,
)

OBJECT_PROPERTIES = (
    OPDA.baselineCategory,
    OPDA.targetsKind,
)

DATATYPE_PROPERTIES = ()

# Per-Kind DPV mapping records emitted as named individuals.
MAPPING_RECORDS = (
    OPDA.PersonDPVMapping,
    OPDA.OrganisationDPVMapping,
    OPDA.ClaimDPVMapping,
)


def build_graph() -> Graph:
    """Build the Governance module class + mapping-record graph."""
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("owl", OWL)
    g.bind("rdfs", RDFS)
    g.bind("skos", SKOS)
    g.bind("dct", DCTERMS)
    g.bind("xsd", XSD)
    g.bind("dpv", DPV)
    g.bind("dpv-pd", DPV_PD)

    # --- Module ontology header — NO owl:imports of DPV ------------------
    module_iri = URIRef("https://w3id.org/opda/governance/")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title,
           Literal("OPDA Governance Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/0.3.0/")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/governance/0.3.0/")))
    # Reference-not-import: dct:references documents the related DPV
    # vocabulary without importing it (per ODR-0012 + ODR-0018 §Rule 4).
    g.add((module_iri, DCTERMS.references, URIRef("https://w3id.org/dpv/pd")))

    # --- opda:DPVMappingRecord — UFO Information Particular -------------
    g.add((OPDA.DPVMappingRecord, RDF.type, OWL.Class))
    g.add((OPDA.DPVMappingRecord, RDFS.label,
           Literal("DPV Mapping Record", lang="en")))
    g.add((OPDA.DPVMappingRecord, RDFS.comment, Literal(
        "Mapping record from an OPDA Kind class to its DPV baseline "
        "personal-data category and optional variant-conditional "
        "refinements. UFO Information Particular. Per ODR-0018 §Rule 4 + "
        "ODR-0012 §Evidence co-annotation, ODR-0012 is the authoring "
        "authority — this module emits the mapping records; ADR-0012 "
        "emits the resulting DPV co-annotation triples into "
        "opda-annotations.ttl (three-graph separation).",
        lang="en",
    )))
    g.add((OPDA.DPVMappingRecord, SKOS.scopeNote, Literal(
        "UFO: Information Particular (Guizzardi 2005 Ch. 4 §4.7). "
        "Mapping-record-as-resource pattern per ODR-0018 §3a.",
        lang="en",
    )))
    g.add((OPDA.DPVMappingRecord, DCTERMS.source, _ODR_0018_RULE4))

    # --- opda:SpecialCategoryScheme — SKOS scheme stub (Baker S012 Q3) --
    g.add((OPDA.SpecialCategoryScheme, RDF.type, OWL.Class))
    g.add((OPDA.SpecialCategoryScheme, RDFS.subClassOf, SKOS.ConceptScheme))
    g.add((OPDA.SpecialCategoryScheme, RDFS.label,
           Literal("Article 10 Special Category Personal Data Scheme", lang="en")))
    g.add((OPDA.SpecialCategoryScheme, RDFS.comment, Literal(
        "GDPR Article 10 / DPA 2018 special-category personal-data "
        "scheme — flags PII categories with elevated lawful-basis "
        "discipline (caution-or-conviction; AML-result; etc.). Per S012 "
        "Q3 (Baker) the scheme structure is class-declared here; the "
        "scheme instance + members emit via ADR-0010 SKOS substrate when "
        "downstream demand materialises. Currently a class declaration "
        "only — member emission deferred per ODR-0011 §Operational "
        "specifications (no S012 Q3 enum currently scoped).",
        lang="en",
    )))
    g.add((OPDA.SpecialCategoryScheme, SKOS.scopeNote, Literal(
        "Subclass of skos:ConceptScheme (W3C SKOS REC §3.1). Members "
        "enumerated per GDPR Article 10 special-category list when "
        "ADR-0010 scope-expansion activates the scheme.",
        lang="en",
    )))
    g.add((OPDA.SpecialCategoryScheme, DCTERMS.source, _GDPR_ART_10))

    # --- ObjectProperty: opda:targetsKind -------------------------------
    g.add((OPDA.targetsKind, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.targetsKind, RDFS.domain, OPDA.DPVMappingRecord))
    g.add((OPDA.targetsKind, RDFS.range, OWL.Class))
    g.add((OPDA.targetsKind, RDFS.label,
           Literal("targets kind", lang="en")))
    g.add((OPDA.targetsKind, RDFS.comment, Literal(
        "DPV mapping record → OPDA Kind class. The Kind is the class "
        "whose instances bear the personal-data category named by "
        "opda:baselineCategory (with optional variant refinements).",
        lang="en",
    )))
    g.add((OPDA.targetsKind, DCTERMS.source, _ODR_0018_RULE4))

    # --- ObjectProperty: opda:baselineCategory --------------------------
    g.add((OPDA.baselineCategory, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.baselineCategory, RDFS.domain, OPDA.DPVMappingRecord))
    g.add((OPDA.baselineCategory, RDFS.label,
           Literal("baseline category", lang="en")))
    g.add((OPDA.baselineCategory, RDFS.comment, Literal(
        "Reference to a DPV-PD category that all instances of the target "
        "Kind bear by default. Per ODR-0018 §Rule 1, every PII-bearing "
        "Kind declares its baseline. Per ODR-0012 §Reference-not-import + "
        "ODR-0018 §Rule 4, the DPV URI is cited but DPV is NOT imported.",
        lang="en",
    )))
    g.add((OPDA.baselineCategory, DCTERMS.source, _ODR_0018_RULE4))

    # --- Per-Kind mapping records (named individuals) -------------------
    # Each emits the (Kind, baselineCategory, dct:source) triple set.

    g.add((OPDA.PersonDPVMapping, RDF.type, OPDA.DPVMappingRecord))
    g.add((OPDA.PersonDPVMapping, RDFS.label,
           Literal("Person DPV mapping", lang="en")))
    g.add((OPDA.PersonDPVMapping, OPDA.targetsKind, OPDA.Person))
    g.add((OPDA.PersonDPVMapping, OPDA.baselineCategory,
           URIRef("https://w3id.org/dpv/pd#Name")))
    g.add((OPDA.PersonDPVMapping, DCTERMS.source, _ODR_0018_RULE4))

    g.add((OPDA.OrganisationDPVMapping, RDF.type, OPDA.DPVMappingRecord))
    g.add((OPDA.OrganisationDPVMapping, RDFS.label,
           Literal("Organisation DPV mapping", lang="en")))
    g.add((OPDA.OrganisationDPVMapping, OPDA.targetsKind, OPDA.Organisation))
    # Organisations are not personal data subjects themselves; the
    # mapping records the absence of a baseline PII category but
    # surfaces the Kind so ADR-0012 emission knows to NOT emit DPV
    # triples for Organisation by default. dct:source cites the ODR
    # section that enumerates the no-PII case (ODR-0012 Evidence
    # co-annotation discusses voucher-as-data-subject; Organisation
    # qua-Org is not a data subject).
    g.add((OPDA.OrganisationDPVMapping, DCTERMS.source, _ODR_0012_EVIDENCE))

    g.add((OPDA.ClaimDPVMapping, RDF.type, OPDA.DPVMappingRecord))
    g.add((OPDA.ClaimDPVMapping, RDFS.label,
           Literal("Claim DPV mapping", lang="en")))
    g.add((OPDA.ClaimDPVMapping, OPDA.targetsKind, OPDA.Claim))
    g.add((OPDA.ClaimDPVMapping, OPDA.baselineCategory,
           URIRef("https://w3id.org/dpv/pd#OfficialID")))
    g.add((OPDA.ClaimDPVMapping, DCTERMS.source, _ODR_0018_RULE4))

    return g
