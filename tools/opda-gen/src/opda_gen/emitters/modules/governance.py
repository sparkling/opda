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


OPDA = Namespace("https://opda.org.uk/pdtf/")
DPV = Namespace("https://w3id.org/dpv#")
DPV_PD = Namespace("https://w3id.org/dpv/pd#")


# rdfs:isDefinedBy target — this module's owl:Ontology subject (see the
# module header emitted in build_graph()).
_MODULE_IRI = URIRef("https://opda.org.uk/pdtf/graph/governance")


_ODR_0012_PHASE1 = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Phase-1"
)
_ODR_0012_EVIDENCE = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-evidence-co-annotation"
)
_ODR_0018_RULE4 = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule4"
)
_ODR_0018_3A = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-3a"
)
_GDPR_ART_10 = URIRef("https://gdpr-info.eu/art-10-gdpr/")


CLASSES = (
    OPDA.DPVMappingRecord,
    OPDA.DPVMappingRefinement,
    OPDA.SpecialCategoryScheme,
)

OBJECT_PROPERTIES = (
    OPDA.baselineCategory,
    OPDA.targetsKind,
    OPDA.variantPredicate,
)

DATATYPE_PROPERTIES = (
    OPDA.variantValue,
)

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
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/governance")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title,
           Literal("OPDA Governance Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://opda.org.uk/pdtf/harness/release/governance/1.0.0/")))
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
    g.add((OPDA.DPVMappingRecord, SKOS.definition, Literal(
        "A data-bearing record that maps an OPDA Kind class to its default "
        "DPV personal-data category and any variant-conditional refinements, "
        "from which the data-protection co-annotation triples are emitted.",
        lang="en",
    )))
    g.add((OPDA.DPVMappingRecord, RDFS.isDefinedBy, _MODULE_IRI))

    # --- opda:DPVMappingRefinement — variant-conditional specialisation -
    # Used (annotations.py's _add_dpv_variant_refinement) since ODR-0018 §3a
    # to type refinement instances asserting opda:targetsKind, but never
    # formally declared as a class or related to DPVMappingRecord — a real
    # authoring gap (ODR-0029 R3's closed-world domain check on targetsKind,
    # rdfs:domain opda:DPVMappingRecord, only surfaced it once the RML
    # validation harness started loading ontology-level context). The
    # DPVMappingRecord comment above already describes refinements as part
    # of the same concept ("...and optional variant-conditional
    # refinements"); rdfs:subClassOf makes that relationship real.
    g.add((OPDA.DPVMappingRefinement, RDF.type, OWL.Class))
    g.add((OPDA.DPVMappingRefinement, RDFS.subClassOf, OPDA.DPVMappingRecord))
    g.add((OPDA.DPVMappingRefinement, RDFS.label,
           Literal("DPV Mapping Refinement", lang="en")))
    g.add((OPDA.DPVMappingRefinement, RDFS.comment, Literal(
        "A variant-conditional specialisation of a DPVMappingRecord: "
        "applies when a Kind's variant predicate takes a specific value "
        "(opda:variantPredicate/opda:variantValue), overriding the "
        "baseline lawful basis with its own (opda:lawfulBasis). Per "
        "ODR-0018 §3a's mapping-table pattern.",
        lang="en",
    )))
    g.add((OPDA.DPVMappingRefinement, SKOS.scopeNote, Literal(
        "UFO: Information Particular, specialising DPVMappingRecord "
        "(Guizzardi 2005 Ch. 4 §4.7). Variant-conditional refinement "
        "pattern per ODR-0018 §3a.",
        lang="en",
    )))
    g.add((OPDA.DPVMappingRefinement, SKOS.definition, Literal(
        "A variant-conditional specialisation of a DPV mapping record: "
        "overrides the baseline lawful basis for a Kind when its variant "
        "predicate takes a specific value.",
        lang="en",
    )))
    g.add((OPDA.DPVMappingRefinement, DCTERMS.source, _ODR_0018_RULE4))
    g.add((OPDA.DPVMappingRefinement, RDFS.isDefinedBy, _MODULE_IRI))

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
    g.add((OPDA.SpecialCategoryScheme, SKOS.definition, Literal(
        "A concept scheme enumerating the GDPR Article 10 / DPA 2018 "
        "special-category personal-data classes that attract elevated "
        "lawful-basis discipline.",
        lang="en",
    )))
    g.add((OPDA.SpecialCategoryScheme, RDFS.isDefinedBy, _MODULE_IRI))

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
    g.add((OPDA.targetsKind, SKOS.definition, Literal(
        "Relates a DPV mapping record to the OPDA Kind class whose instances "
        "bear the personal-data category the record assigns.",
        lang="en",
    )))
    g.add((OPDA.targetsKind, RDFS.isDefinedBy, _MODULE_IRI))

    # --- ObjectProperty: opda:variantPredicate --------------------------
    # Sibling of opda:targetsKind on the SAME opda:DPVMappingRefinement
    # subject (annotations.py's _add_dpv_variant_refinement) — real, live
    # data (7 uses) since DPVMappingRefinement was declared, but never
    # itself declared. ODR-0018 §3a's own worked example names this
    # opda:mapsVariantPredicate; the shipped implementation instead uses
    # opda:variantPredicate consistently (established real-usage naming
    # takes precedence, matching this session's opda:Verification ->
    # opda:VerificationActivity precedent).
    g.add((OPDA.variantPredicate, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.variantPredicate, RDFS.domain, OPDA.DPVMappingRefinement))
    g.add((OPDA.variantPredicate, RDFS.range, RDF.Property))
    g.add((OPDA.variantPredicate, RDFS.label,
           Literal("variant predicate", lang="en")))
    g.add((OPDA.variantPredicate, RDFS.comment, Literal(
        "The predicate (e.g. opda:addressVariant) whose value on a Kind "
        "instance selects which refinement of this mapping record applies "
        "(ODR-0018 §3a).",
        lang="en",
    )))
    g.add((OPDA.variantPredicate, DCTERMS.source, _ODR_0018_RULE4))
    g.add((OPDA.variantPredicate, SKOS.definition, Literal(
        "Relates a DPV mapping refinement to the predicate whose value on "
        "a Kind instance selects the refinement.",
        lang="en",
    )))
    g.add((OPDA.variantPredicate, RDFS.isDefinedBy, _MODULE_IRI))

    # --- DatatypeProperty: opda:variantValue -----------------------------
    g.add((OPDA.variantValue, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.variantValue, RDFS.domain, OPDA.DPVMappingRefinement))
    g.add((OPDA.variantValue, RDFS.range, XSD.string))
    g.add((OPDA.variantValue, RDFS.label,
           Literal("variant value", lang="en")))
    g.add((OPDA.variantValue, RDFS.comment, Literal(
        "The specific value of opda:variantPredicate this refinement "
        "applies to (e.g. \"title\"/\"marketing\"/\"inspire\" for "
        "opda:addressVariant) — ODR-0018 §3a.",
        lang="en",
    )))
    g.add((OPDA.variantValue, DCTERMS.source, _ODR_0018_RULE4))
    g.add((OPDA.variantValue, SKOS.definition, Literal(
        "The specific value of the variant predicate that this mapping "
        "refinement applies to.",
        lang="en",
    )))
    g.add((OPDA.variantValue, RDFS.isDefinedBy, _MODULE_IRI))

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
    g.add((OPDA.baselineCategory, SKOS.definition, Literal(
        "Relates a DPV mapping record to the DPV-PD personal-data category "
        "that every instance of the target Kind bears by default, citing the "
        "category without importing the DPV vocabulary.",
        lang="en",
    )))
    g.add((OPDA.baselineCategory, RDFS.isDefinedBy, _MODULE_IRI))

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
