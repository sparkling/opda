"""
Module descriptive.

Realises:
- ADR-0011 §"Per-module detail — opda-descriptive.ttl" — Survey + EPCCertificate
  + Search + Valuation + Comparable (S008 Q4 three-criterion class
  promotions) + the held-as-live Building/Room conditional stubs
  (commented per ADR-0011 §"Per-module detail").
- ADR-0007 §"A9 per-kind discipline output" — every class carries the
  per-kind triple set.
- ODR-0008 §Rules + §Operational specifications — descriptive properties
  attach to Property + LegalEstate; data dictionary is the leaf inventory;
  spanning leaves reconcile to one ontology property.
- ODR-0008 §Q4a three-criterion class-promotion test — Survey /
  EPCCertificate / Search / Valuation / Comparable are definite Class
  promotions (each retrofits implements: [ODR-0007, ODR-0017, ODR-0018]).
- ODR-0008 §Q5a — datatype-vs-SKOS per-leaf binding table; minimum
  descriptive properties (builtForm, councilTaxBand, currentEnergyRating,
  tenureKind) live in opda-property.ttl (where the domain Kind lives);
  this module focuses on the Q4a class promotions.

Q5a binding-table coverage: this module emits Survey / EPCCertificate /
Search / Valuation / Comparable as classes. The full ~50-leaf
datatype-property binding table is DEFERRED to G11 (queued in ADR-0005
§G; trigger: 'as downstream module ADR or overlay profile needs each
leaf'). The minimum set needed for diagnostic exemplars lives in
opda-property.ttl (builtForm, currentEnergyRating, tenureKind, hasUPRN,
hasAddress, addressVariant) — chosen because the exemplars never use
opda:Survey / opda:EPCCertificate as a typed individual, only as
authority-retrieved artefact targets that downstream BASPI5 round-trip
will exercise.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD


OPDA = Namespace("https://w3id.org/opda/#")
PROV = Namespace("http://www.w3.org/ns/prov#")


_ODR_0008_Q4A = URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q4a")
_ODR_0008_Q5A = URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q5a")


CLASSES = (
    OPDA.Comparable,
    OPDA.EPCCertificate,
    OPDA.Search,
    OPDA.Survey,
    OPDA.Valuation,
)

OBJECT_PROPERTIES = ()

DATATYPE_PROPERTIES = ()


def build_graph() -> Graph:
    """Build the Descriptive module class graph."""
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("owl", OWL)
    g.bind("rdfs", RDFS)
    g.bind("skos", SKOS)
    g.bind("dct", DCTERMS)
    g.bind("xsd", XSD)
    g.bind("prov", PROV)

    # --- Module ontology header --------------------------------------------
    module_iri = URIRef("https://w3id.org/opda/descriptive/")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title,
           Literal("OPDA Descriptive Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/1.0.0/")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/descriptive/1.0.0/")))

    # --- opda:Survey — class promotion (ODR-0008 §Q4a) ------------------
    g.add((OPDA.Survey, RDF.type, OWL.Class))
    g.add((OPDA.Survey, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Survey, RDFS.label, Literal("Survey", lang="en")))
    g.add((OPDA.Survey, RDFS.comment, Literal(
        "Authority-retrieved professional survey report. UFO Substance "
        "Kind (informational); PROV-O Entity. IC: distinct provenance "
        "chain per S008 Q4 three-criterion test (authority-retrieved "
        "provenance via prov:wasGeneratedBy chain to professional-issued "
        "activity; distinct lifecycle — issued / superseded / re-issued / "
        "withdrawn). Hard cases: re-survey; supersession; withdrawal.",
        lang="en",
    )))
    g.add((OPDA.Survey, SKOS.scopeNote, Literal(
        "UFO: Substance Kind, informational (Guizzardi 2005 Ch. 4 §4.2). "
        "DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2). "
        "PROV-O: Entity (W3C PROV-O REC §3.2).",
        lang="en",
    )))
    g.add((OPDA.Survey, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:EPCCertificate — class promotion (ODR-0008 §Q4a) ----------
    g.add((OPDA.EPCCertificate, RDF.type, OWL.Class))
    g.add((OPDA.EPCCertificate, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.EPCCertificate, RDFS.label,
           Literal("EPC Certificate", lang="en")))
    g.add((OPDA.EPCCertificate, RDFS.comment, Literal(
        "Energy Performance Certificate — DESNZ-governed authority-"
        "retrieved artefact. UFO Substance Kind (informational); PROV-O "
        "Entity. Class-promoted per S008 Q4 three-criterion test: "
        "authority-retrieved provenance (DESNZ register); distinct "
        "lifecycle (10-year validity; supersession on re-assessment); "
        "distinct PII regime per ODR-0018 (address + owner-identifiable).",
        lang="en",
    )))
    g.add((OPDA.EPCCertificate, SKOS.scopeNote, Literal(
        "UFO: Substance Kind, informational (Guizzardi 2005 Ch. 4). "
        "DESNZ Energy Performance Certificate Guidance (regulator-cited "
        "per ODR-0011 §4a).",
        lang="en",
    )))
    g.add((OPDA.EPCCertificate, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:Search — class promotion (ODR-0008 §Q4a) ------------------
    g.add((OPDA.Search, RDF.type, OWL.Class))
    g.add((OPDA.Search, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Search, RDFS.label, Literal("Search", lang="en")))
    g.add((OPDA.Search, RDFS.comment, Literal(
        "Local-authority or environmental search result (CON29R, LLC1, "
        "etc.). UFO Substance Kind (informational); PROV-O Entity. "
        "Class-promoted per S008 Q4 three-criterion test (local-"
        "authority issuance chain; distinct lifecycle: ordered / "
        "returned / superseded; not a flat datatype bag).",
        lang="en",
    )))
    g.add((OPDA.Search, SKOS.scopeNote, Literal(
        "UFO: Substance Kind, informational. Covers CON29R / LLC1 / "
        "environmental / flood / coal-mining searches per "
        "PDTF v3 propertyPack.localSearches.",
        lang="en",
    )))
    g.add((OPDA.Search, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:Valuation — class promotion (ODR-0008 §Q4a) ---------------
    g.add((OPDA.Valuation, RDF.type, OWL.Class))
    g.add((OPDA.Valuation, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Valuation, RDFS.label, Literal("Valuation", lang="en")))
    g.add((OPDA.Valuation, RDFS.comment, Literal(
        "Property valuation — RICS-regulated professional or "
        "automated-model output. UFO Substance Kind (informational); "
        "PROV-O Entity. Class-promoted per S008 Q4 three-criterion test "
        "(RICS-regulated provenance chain; distinct lifecycle: instructed "
        "/ delivered / superseded).",
        lang="en",
    )))
    g.add((OPDA.Valuation, SKOS.scopeNote, Literal(
        "UFO: Substance Kind, informational. RICS Red Book (regulator-"
        "cited per ODR-0011 §4a).",
        lang="en",
    )))
    g.add((OPDA.Valuation, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:Comparable — class promotion (ODR-0008 §Q4a) --------------
    g.add((OPDA.Comparable, RDF.type, OWL.Class))
    g.add((OPDA.Comparable, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Comparable, RDFS.label, Literal("Comparable", lang="en")))
    g.add((OPDA.Comparable, RDFS.comment, Literal(
        "Comparable-sale or comparable-rental record supporting a "
        "Valuation. UFO Substance Kind (informational); PROV-O Entity. "
        "Class-promoted per S008 Q4 three-criterion test (Land Registry "
        "or VOA sourced provenance; supports prov:wasInformedBy chains "
        "from Valuation to its underlying market data).",
        lang="en",
    )))
    g.add((OPDA.Comparable, SKOS.scopeNote, Literal(
        "UFO: Substance Kind, informational. Land Registry Price Paid "
        "Data + VOA records (regulator-cited per ODR-0011 §4a).",
        lang="en",
    )))
    g.add((OPDA.Comparable, DCTERMS.source, _ODR_0008_Q4A))

    # --- Held-as-live conditional stubs (Davis S008 Q4 dissent) ---------
    # Per ADR-0011 §"Per-module detail" — Building and Room class
    # promotions are HELD-AS-LIVE pending first named BASPI5 round-trip
    # query exercising sub-Property reasoning. The generator-comment
    # block in the emitted TTL header notes the held-as-live status;
    # the classes themselves are not emitted as triples until the
    # named trigger fires.
    #
    # Commented-out stubs (do NOT activate without ODR amendment):
    #
    # opda:Building
    #     rdf:type owl:Class ;
    #     rdfs:subClassOf opda:Property ;
    #     dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> .
    #
    # opda:Room
    #     rdf:type owl:Class ;
    #     rdfs:subClassOf opda:Building ;
    #     dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> .
    #
    # Re-open trigger: first named BASPI5 round-trip query that requires
    # sub-Property reasoning (per ADR-0011 §"Held-as-live tracking").

    return g
