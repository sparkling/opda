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
- ODR-0022 §Rules.1 Category A — the ~407 free-text disclosure tails
  (`details` / `comments` / `summary`) collapse to ONE reusable annotation
  property `opda:disclosureDetail` (rdfs:comment-grade, range xsd:string);
  the question is carried by the subject + instance-level `dct:source`,
  NEVER by a per-question detail property (ODR-0022 §Rules.6 anti-pattern).
- ODR-0008d (Authority-Retrieved Artefacts) Rules 1–5 — Category E. Mints
  the sixth class `opda:RiskAssessment` (UFO Information Object on the
  PROV-O backbone) + its properties `opda:peril` (→ opda:PerilScheme),
  `opda:riskIndicator`, `opda:actionAlertRating` (→ their rating schemes in
  vocabularies.py), and `opda:hasSubAssessment` (self-referential part-of
  for riskSubcategories[]). `datasetAttribution` REUSES prov:wasAttributedTo
  (Rule 5 — NOT minted). Rule 3 retro-corrects the five existing classes'
  UFO meta-category from "Substance Kind" to "Information Object".
- ODR-0022 §4 + session-027 R4 — Category D. `opda:inclusionStatus` is a
  Mode/Relator of the SALE TRANSACTION (ODR-0007), ranging over the
  already-emitted opda:InclusionStatusScheme — never rdfs:domain
  opda:Property. `opda:price` is ONE shared monetary-amount property reused
  across all fixtures items (NOT 89 price props); the fixtures comment
  reuses `opda:disclosureDetail`. The ~89-item opda:FixtureItemScheme is
  built in vocabularies.py; both bind on a transaction-scoped fixtures-list
  node shape (shapes.py). NO FixtureItem class is minted.

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


# Data-dictionary schema-leaf-path dct:source (ODR-0022 G2); same form as the
# property-module helper (module-local to avoid a cross-emitter import).
def _dd_source(leaf_path: str) -> URIRef:
    """Return the data-dictionary schema-leaf-path `dct:source` IRI (G2)."""
    safe = leaf_path.replace(" ", "%20").replace("'", "%27")
    return URIRef(f"https://w3id.org/opda/data-dictionary#{safe}")


_ODR_0008_Q4A = URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q4a")
_ODR_0008_Q5A = URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q5a")

# ODR-0008d (Authority-Retrieved Artefacts) section anchors — the Category-E
# RiskAssessment class + its peril/rating-bearing properties cite the Rule
# that mints them (mirrors the §Q4a/§Q5a anchor convention above).
_ODR_0008D_RULE_1 = URIRef("https://w3id.org/opda/odr/ODR-0008d#section-Rule-1")
_ODR_0008D_RULE_3 = URIRef("https://w3id.org/opda/odr/ODR-0008d#section-Rule-3")
_ODR_0008D_RULE_4 = URIRef("https://w3id.org/opda/odr/ODR-0008d#section-Rule-4")
_ODR_0008D_RULE_5 = URIRef("https://w3id.org/opda/odr/ODR-0008d#section-Rule-5")

# ODR-0022 §4 / session-027 R4 — the Category-D inclusion-as-transaction-Mode
# anchor. opda:inclusionStatus is a Mode/Relator of the sale transaction
# (ODR-0007), confirmed by session-027 R4; its `dct:source` cites ODR-0022 §4
# (the deciding record), per the same convention disclosureDetail uses.
_ODR_0022_S4 = URIRef("https://w3id.org/opda/odr/ODR-0022#section-Rules-4")

# Category A (ODR-0022 §Rules.1) — the single reusable disclosure-detail
# annotation property is decided by ODR-0022 §1 itself; its `dct:source`
# points at that deciding section, NOT a schema leaf path. (The leaf-path
# `dct:source` of ODR-0022 G2 governs the per-question descriptive *leaves*
# of the deferred Category-G walk — a reusable annotation property is not
# one of those leaves; the question is carried by the subject + the
# instance-level `dct:source` per ODR-0022 §Rules.1 / §Rules.6.)
_ODR_0022_S1 = URIRef("https://w3id.org/opda/odr/ODR-0022#section-Rules-1")


CLASSES = (
    OPDA.Comparable,
    OPDA.EPCCertificate,
    # ADR-0031 walk — the nearby-facilities bearer hierarchy (object-typed
    # leaf promotions per ODR-0008 §Q4a).
    OPDA.HealthCareFacility,
    OPDA.NearbyFacility,
    # ODR-0008d Rule 1 — the sixth class: the per-peril authority-retrieved
    # search/environmental result (an Information Object on the PROV-O
    # backbone).
    OPDA.RiskAssessment,
    OPDA.School,
    OPDA.Search,
    OPDA.Survey,
    OPDA.Valuation,
)

# ODR-0008d Rule 3 §4 — opda:hasSubAssessment is the self-referential
# mereological part-of (a riskSubcategories[] entry is itself a leaf
# RiskAssessment). opda:peril is the object property linking a RiskAssessment
# to its opda:PerilScheme concept. Both are object properties (their ranges
# are the RiskAssessment class / a SKOS Concept).
OBJECT_PROPERTIES = (
    # ADR-0031 Family-E nearby-school schoolType buckets (object-typed
    # sub-structures; domain opda:School, range-less — see _school_type_buckets).
    OPDA.college,
    OPDA.hasSubAssessment,
    OPDA.nursery,
    OPDA.peril,
    OPDA.primary,
    OPDA.private,
    OPDA.secondary,
)

# Category A reusable disclosure-detail annotation property (ODR-0022 §1) +
# the ODR-0008d Category-E rating-bearing datatype properties (riskIndicator,
# actionAlertRating) + the ODR-0022 Category-D sale-transaction fixtures
# properties (inclusionStatus = a transaction Mode, price = a single shared
# monetary-amount property). The ~181 genuine Category-G descriptive datatype
# properties remain DEFERRED to the curated WG walk (ODR-0022 §Rules.6).
#
# `opda:datasetAttribution` is DELIBERATELY NOT minted: ODR-0008d Rule 5
# says "datasetAttribution REUSES prov:wasAttributedTo (do not mint)", and
# Rule 1(c)'s "opda:datasetAttribution ≡ prov:wasAttributedTo" means the
# RiskAssessment shape binds prov:wasAttributedTo directly (see shapes.py).
DATATYPE_PROPERTIES = (
    OPDA["yield"],
    OPDA.actionAlertRating,
    OPDA.ageRange,
    OPDA.applicationDate,
    OPDA.applicationType,
    OPDA.buildingControlStartDate,
    OPDA.councilSearchTurnaroundTimeInWorkingDays,
    OPDA.countyCouncil,
    OPDA.credibilitySources,
    OPDA.dateRemedialActionRequired,
    OPDA.decision,
    OPDA.decisionDate,
    OPDA.designationType,
    OPDA.disclosureDetail,
    OPDA.displayName,
    OPDA.distanceInMiles,
    OPDA.districtCouncil,
    OPDA.documentDate,
    OPDA.documentTypeCode,
    OPDA.expectedDeliveryDate,
    OPDA.filedUnder,
    OPDA.inclusionStatus,
    OPDA.listedDate,
    OPDA.localAuthorityName,
    OPDA.localAuthorityReference,
    OPDA.mediaUrl,
    OPDA.orderDate,
    OPDA.otherRating,
    OPDA.planningStartDate,
    OPDA.price,
    OPDA.pricingMethodology,
    OPDA.productCode,
    OPDA.providerName,
    OPDA.providerReference,
    OPDA.pupils,
    OPDA.refNumber,
    OPDA.regulatedSearchTurnaroundTimeInWorkingDays,
    OPDA.religiousCharacter,
    OPDA.reportDate,
    OPDA.retrievedOn,
    OPDA.riskIndicator,
    OPDA.soldDate,
    OPDA.specialties,
    OPDA.status,
    OPDA.statusDate,
    OPDA.subCategory,
    OPDA.typeOfHealthCare,
    OPDA.unitaryAuthority,
    OPDA.url,
)


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
        "Authority-retrieved professional survey report. UFO Information "
        "Object (a report — an information artefact existentially dependent "
        "on its generating activity; NOT a Substance Kind, per ODR-0008d "
        "Rule 3 A9 retro-correction); PROV-O Entity. IC: distinct provenance "
        "chain per S008 Q4 three-criterion test (authority-retrieved "
        "provenance via prov:wasGeneratedBy chain to professional-issued "
        "activity; distinct lifecycle — issued / superseded / re-issued / "
        "withdrawn). Hard cases: re-survey; supersession; withdrawal.",
        lang="en",
    )))
    g.add((OPDA.Survey, SKOS.scopeNote, Literal(
        "UFO: Information Object (Guizzardi 2005 Ch. 4 §4.2 — an information "
        "artefact, corrected from \"Substance Kind\" per ODR-0008d Rule 3). "
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
        "retrieved artefact. UFO Information Object (a certificate is an "
        "information artefact, NOT a Substance Kind, per ODR-0008d Rule 3 "
        "A9 retro-correction); PROV-O Entity. Class-promoted per S008 Q4 "
        "three-criterion test: authority-retrieved provenance (DESNZ "
        "register); distinct lifecycle (10-year validity; supersession on "
        "re-assessment); distinct PII regime per ODR-0018 (address + "
        "owner-identifiable).",
        lang="en",
    )))
    g.add((OPDA.EPCCertificate, SKOS.scopeNote, Literal(
        "UFO: Information Object (Guizzardi 2005 Ch. 4 — corrected from "
        "\"Substance Kind\" per ODR-0008d Rule 3). DESNZ Energy Performance "
        "Certificate Guidance (regulator-cited per ODR-0011 §4a).",
        lang="en",
    )))
    g.add((OPDA.EPCCertificate, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:Search — class promotion (ODR-0008 §Q4a) ------------------
    g.add((OPDA.Search, RDF.type, OWL.Class))
    g.add((OPDA.Search, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Search, RDFS.label, Literal("Search", lang="en")))
    g.add((OPDA.Search, RDFS.comment, Literal(
        "Local-authority or environmental search result (CON29R, LLC1, "
        "etc.). UFO Information Object (a search result is an information "
        "artefact, NOT a Substance Kind, per ODR-0008d Rule 3 A9 retro-"
        "correction); PROV-O Entity. Class-promoted per S008 Q4 three-"
        "criterion test (local-authority issuance chain; distinct "
        "lifecycle: ordered / returned / superseded; not a flat datatype "
        "bag). A Search prov:wasGeneratedBy the activity that also "
        "generates the per-peril opda:RiskAssessments it carries (one "
        "search yields many assessments, ODR-0008d Rule 3).",
        lang="en",
    )))
    g.add((OPDA.Search, SKOS.scopeNote, Literal(
        "UFO: Information Object (corrected from \"Substance Kind\" per "
        "ODR-0008d Rule 3). Covers CON29R / LLC1 / environmental / flood / "
        "coal-mining searches per PDTF v3 propertyPack.localSearches.",
        lang="en",
    )))
    g.add((OPDA.Search, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:Valuation — class promotion (ODR-0008 §Q4a) ---------------
    g.add((OPDA.Valuation, RDF.type, OWL.Class))
    g.add((OPDA.Valuation, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Valuation, RDFS.label, Literal("Valuation", lang="en")))
    g.add((OPDA.Valuation, RDFS.comment, Literal(
        "Property valuation — RICS-regulated professional or "
        "automated-model output. UFO Information Object (a valuation report "
        "is an information artefact, NOT a Substance Kind, per ODR-0008d "
        "Rule 3 A9 retro-correction); PROV-O Entity. Class-promoted per "
        "S008 Q4 three-criterion test (RICS-regulated provenance chain; "
        "distinct lifecycle: instructed / delivered / superseded).",
        lang="en",
    )))
    g.add((OPDA.Valuation, SKOS.scopeNote, Literal(
        "UFO: Information Object (corrected from \"Substance Kind\" per "
        "ODR-0008d Rule 3). RICS Red Book (regulator-cited per ODR-0011 "
        "§4a).",
        lang="en",
    )))
    g.add((OPDA.Valuation, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:Comparable — class promotion (ODR-0008 §Q4a) --------------
    g.add((OPDA.Comparable, RDF.type, OWL.Class))
    g.add((OPDA.Comparable, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Comparable, RDFS.label, Literal("Comparable", lang="en")))
    g.add((OPDA.Comparable, RDFS.comment, Literal(
        "Comparable-sale or comparable-rental record supporting a "
        "Valuation. UFO Information Object (a comparable record is an "
        "information artefact, NOT a Substance Kind, per ODR-0008d Rule 3 "
        "A9 retro-correction); PROV-O Entity. Class-promoted per S008 Q4 "
        "three-criterion test (Land Registry or VOA sourced provenance; "
        "supports prov:wasInformedBy chains from Valuation to its "
        "underlying market data).",
        lang="en",
    )))
    g.add((OPDA.Comparable, SKOS.scopeNote, Literal(
        "UFO: Information Object (corrected from \"Substance Kind\" per "
        "ODR-0008d Rule 3). Land Registry Price Paid Data + VOA records "
        "(regulator-cited per ODR-0011 §4a).",
        lang="en",
    )))
    g.add((OPDA.Comparable, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:NearbyFacility — Category-G class promotion (ODR-0008 §Q4a) -
    # Class-promoted from the object-typed nearbyFacilities.{schools,
    # healthCare,transport}[] leaves (ADR-0031 walk): a real-world
    # point-of-interest near the Property, referenced for amenity context — a
    # distinct entity, NOT a Quality of the Property (the same school
    # neighbours many properties). Bears the proximity relation
    # opda:distanceInMiles; opda:School and opda:HealthCareFacility are bands.
    g.add((OPDA.NearbyFacility, RDF.type, OWL.Class))
    g.add((OPDA.NearbyFacility, RDFS.label,
           Literal("Nearby Facility", lang="en")))
    g.add((OPDA.NearbyFacility, RDFS.comment, Literal(
        "A point-of-interest near the Property — a school, health-care "
        "facility, or transport node listed in propertyPack.nearbyFacilities "
        "for amenity context. UFO Substance Kind: a real-world social-physical "
        "facility with its own identity, distinct from the Property being "
        "transacted (NOT a Quality of opda:Property — the same facility "
        "neighbours many properties). Class-promoted from the object-typed "
        "nearbyFacilities.{schools,healthCare,transport}[] leaves per ODR-0008 "
        "§Q4a; bears opda:distanceInMiles (proximity to the Property).",
        lang="en",
    )))
    g.add((OPDA.NearbyFacility, SKOS.scopeNote, Literal(
        "UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2 — a social-physical "
        "facility). Promoted from an object-typed leaf per ODR-0008 §Q4a "
        "(the 'which object-typed leaves become intermediate classes' test).",
        lang="en",
    )))
    g.add((OPDA.NearbyFacility, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:School — band of opda:NearbyFacility (ODR-0008 §Q4a) -------
    g.add((OPDA.School, RDF.type, OWL.Class))
    g.add((OPDA.School, RDFS.subClassOf, OPDA.NearbyFacility))
    g.add((OPDA.School, RDFS.label, Literal("School", lang="en")))
    g.add((OPDA.School, RDFS.comment, Literal(
        "A nearby school — the schools[] band of opda:NearbyFacility. Bears "
        "the school-specific descriptive attributes (opda:pupils, "
        "opda:ageRange, opda:religiousCharacter, opda:otherRating) and the "
        "schoolType bands (opda:college / opda:nursery / opda:primary / "
        "opda:secondary / opda:private). UFO Substance Kind, a subkind of "
        "opda:NearbyFacility; class-promoted per ODR-0008 §Q4a.",
        lang="en",
    )))
    g.add((OPDA.School, SKOS.scopeNote, Literal(
        "UFO: Substance Kind, subkind of opda:NearbyFacility (Guizzardi 2005 "
        "Ch. 4 §4.2). PDTF propertyPack.nearbyFacilities.schools[].",
        lang="en",
    )))
    g.add((OPDA.School, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:HealthCareFacility — band of opda:NearbyFacility (§Q4a) ----
    g.add((OPDA.HealthCareFacility, RDF.type, OWL.Class))
    g.add((OPDA.HealthCareFacility, RDFS.subClassOf, OPDA.NearbyFacility))
    g.add((OPDA.HealthCareFacility, RDFS.label,
           Literal("Health Care Facility", lang="en")))
    g.add((OPDA.HealthCareFacility, RDFS.comment, Literal(
        "A nearby health-care facility — the healthCare[] band of "
        "opda:NearbyFacility. Bears opda:typeOfHealthCare and "
        "opda:specialties. UFO Substance Kind, a subkind of "
        "opda:NearbyFacility; class-promoted per ODR-0008 §Q4a.",
        lang="en",
    )))
    g.add((OPDA.HealthCareFacility, SKOS.scopeNote, Literal(
        "UFO: Substance Kind, subkind of opda:NearbyFacility (Guizzardi 2005 "
        "Ch. 4 §4.2). PDTF propertyPack.nearbyFacilities.healthCare[].",
        lang="en",
    )))
    g.add((OPDA.HealthCareFacility, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:RiskAssessment — Category E sixth class (ODR-0008d Rule 1) -
    # The per-peril authority-retrieved search/environmental result. UFO
    # Information Object (DOLCE Non-Physical Object; gUFO Object artefact),
    # rdfs:subClassOf prov:Entity. IC (Rule 1b): individuated by the tuple
    # ⟨generating activity, source peril/dataset, subject property,
    # generation time⟩ — identity grounded in the ACTIVITY, not the result
    # values (a re-run search is a NEW RiskAssessment, prov:wasDerivedFrom
    # the prior). One class instantiated per peril (NOT 12 subclasses, NOT
    # 72 datatype properties).
    g.add((OPDA.RiskAssessment, RDF.type, OWL.Class))
    g.add((OPDA.RiskAssessment, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.RiskAssessment, RDFS.label, Literal("Risk Assessment", lang="en")))
    g.add((OPDA.RiskAssessment, RDFS.comment, Literal(
        "Per-peril authority-retrieved search / environmental result (the "
        "six-field block riskIndicator / actionAlertRating / result / "
        "summary / recommendations / datasetAttribution recurring across the "
        "environmental perils and CON29-style local searches). UFO "
        "Information Object (a report — an information artefact existentially "
        "dependent on its generating activity; NOT a Substance Kind and NOT "
        "a Quality of opda:Property, ODR-0008d Rule 1a); PROV-O Entity. IC "
        "(Rule 1b): individuated by the tuple ⟨generating activity "
        "(prov:wasGeneratedBy), source peril/dataset, subject property, "
        "generation time (prov:generatedAtTime)⟩ — identity grounded in "
        "the activity, not the result values. Hard cases: a re-run search is "
        "a DISTINCT RiskAssessment (new activity + generatedAtTime), "
        "prov:wasDerivedFrom the prior; two providers' assessments for one "
        "property are distinct (distinct prov:wasAttributedTo); a "
        "riskSubcategories[] entry is itself a leaf RiskAssessment "
        "(opda:hasSubAssessment); otherEnvironmental is a valid leaf with "
        "optional Qualities absent. One class instantiated per peril, NOT 12 "
        "subclasses and NOT 72 datatype properties.",
        lang="en",
    )))
    g.add((OPDA.RiskAssessment, SKOS.scopeNote, Literal(
        "UFO: Information Object (Guizzardi 2005 Ch. 4 — an information "
        "artefact existentially dependent on its generating activity). "
        "DOLCE: Non-Physical Object (Masolo et al. 2003 D18). gUFO: "
        "gufo:Object (artefact). PROV-O: Entity (W3C PROV-O REC §3.2). "
        "Hangs off the ODR-0009 PROV-O backbone (prov:wasGeneratedBy / "
        "wasAttributedTo / generatedAtTime / wasDerivedFrom).",
        lang="en",
    )))
    g.add((OPDA.RiskAssessment, DCTERMS.source, _ODR_0008D_RULE_1))

    # --- opda:peril — RiskAssessment → PerilScheme concept (Rule 1c) ----
    # The dataset/peril axis: links a RiskAssessment to its opda:PerilScheme
    # concept (sh:in the scheme, enforced in the node shape). An object
    # property (its range is a skos:Concept), NOT a datatype property — the
    # peril is a dereferenceable concept, never an opaque string (Rule 2).
    g.add((OPDA.peril, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.peril, RDFS.domain, OPDA.RiskAssessment))
    g.add((OPDA.peril, RDFS.range, SKOS.Concept))
    g.add((OPDA.peril, RDFS.label, Literal("peril", lang="en")))
    g.add((OPDA.peril, RDFS.comment, Literal(
        "The environmental / search peril a RiskAssessment reports on — a "
        "dereferenceable opda:PerilScheme concept (ODR-0008d Rule 1c / "
        "Rule 2), NEVER an opaque string. The node shape restricts the value "
        "to the PerilScheme concepts via sh:in.",
        lang="en",
    )))
    g.add((OPDA.peril, DCTERMS.source, _ODR_0008D_RULE_1))

    # --- opda:riskIndicator — RiskAssessment Quale (Rule 1c) ------------
    # The \"is action recommended? / is the property at risk?\" indicator,
    # ranging over opda:YesNoNotKnownScheme (No / Not known / Yes). A
    # Quale-in-Region datatype property; the node shape sh:in-restricts it to
    # the scheme value-space. (Already attested as a flat datatype property
    # in the data dictionary; here it is given its RiskAssessment home.)
    g.add((OPDA.riskIndicator, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.riskIndicator, RDFS.domain, OPDA.RiskAssessment))
    g.add((OPDA.riskIndicator, RDFS.range, XSD.string))
    g.add((OPDA.riskIndicator, RDFS.label, Literal("risk indicator", lang="en")))
    g.add((OPDA.riskIndicator, RDFS.comment, Literal(
        "Whether action is recommended / the property is at risk for the "
        "RiskAssessment's peril (No / Not known / Yes). Value-space reuses "
        "opda:YesNoNotKnownScheme (a duplicate scheme would violate ODR-0022 "
        "Category C); the node shape sh:in-restricts it (ODR-0008d Rule 1c / "
        "Rule 4).",
        lang="en",
    )))
    g.add((OPDA.riskIndicator, DCTERMS.source, _ODR_0008D_RULE_4))

    # --- opda:actionAlertRating — RiskAssessment Quale (Rule 1c) --------
    # The 1–5 ordinal action-alert rating (1 Green … 5 Red),
    # ranging over opda:ActionAlertRatingScheme. The data dictionary types
    # the leaf as integer; the value-space is the 5-level scheme.
    g.add((OPDA.actionAlertRating, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.actionAlertRating, RDFS.domain, OPDA.RiskAssessment))
    g.add((OPDA.actionAlertRating, RDFS.range, XSD.integer))
    g.add((OPDA.actionAlertRating, RDFS.label,
           Literal("action alert rating", lang="en")))
    g.add((OPDA.actionAlertRating, RDFS.comment, Literal(
        "The ordinal action-alert rating for the RiskAssessment's peril: an "
        "integer 1–5 where 1 is Green (lowest risk) and 5 is Red "
        "(highest). Value-space is opda:ActionAlertRatingScheme; the node "
        "shape sh:in-restricts it (ODR-0008d Rule 1c / Rule 4).",
        lang="en",
    )))
    g.add((OPDA.actionAlertRating, DCTERMS.source, _ODR_0008D_RULE_4))

    # --- opda:hasSubAssessment — self-referential part-of (Rule 4) ------
    # The riskSubcategories[] recursion: a sub-result is itself a first-class
    # (leaf) RiskAssessment. A mereological part-of (NOT the peril →
    # sub-peril taxonomy, which is skos:narrower within PerilScheme —
    # two distinct axes per Rule 4).
    g.add((OPDA.hasSubAssessment, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasSubAssessment, RDFS.domain, OPDA.RiskAssessment))
    g.add((OPDA.hasSubAssessment, RDFS.range, OPDA.RiskAssessment))
    g.add((OPDA.hasSubAssessment, RDFS.label,
           Literal("has sub-assessment", lang="en")))
    g.add((OPDA.hasSubAssessment, RDFS.comment, Literal(
        "Self-referential mereological part-of: a riskSubcategories[] entry "
        "is itself a leaf opda:RiskAssessment (ODR-0008d Rule 4). The node "
        "shape realises the recursion via sh:node opda:RiskAssessment. This "
        "is the RESULT-recursion axis; the peril → sub-peril TAXONOMY "
        "axis is skos:narrower within opda:PerilScheme — two distinct "
        "axes (Rule 4).",
        lang="en",
    )))
    g.add((OPDA.hasSubAssessment, DCTERMS.source, _ODR_0008D_RULE_4))

    # NOTE on datasetAttribution (ODR-0008d Rule 5 / Rule 1c): the sixth
    # field \"datasetAttribution\" is NOT minted as opda:datasetAttribution.
    # Rule 5 is explicit — \"datasetAttribution REUSES
    # prov:wasAttributedTo (do not mint)\" — and Rule 1c's
    # \"opda:datasetAttribution ≡ prov:wasAttributedTo\" means the
    # RiskAssessment node shape binds prov:wasAttributedTo directly for
    # attribution (see emitters/shapes.py build_descriptive_shapes). result /
    # summary / recommendations reuse opda:disclosureDetail (A-grade strings,
    # below); they are NOT per-question properties either (ODR-0022 §Rules.6).

    # --- opda:inclusionStatus — Category D sale-transaction Mode --------
    # ODR-0022 §4 + session-027 R4: the inclusion of a fixtures item
    # (\"Included / Excluded / None\") is a Mode/Relator of the SALE
    # TRANSACTION (ODR-0007 territory), NOT a Quality of opda:Property —
    # the same boiler is included in one sale and absent from the next, so
    # inclusion has no rigid bearer in the brick-and-mortar. Ranges over the
    # already-emitted opda:InclusionStatusScheme (Included / Excluded /
    # None). It is therefore NEVER rdfs:domain opda:Property; it is bound on
    # a transaction-scoped fixtures-list node (see shapes.py).
    g.add((OPDA.inclusionStatus, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.inclusionStatus, RDFS.range, XSD.string))
    g.add((OPDA.inclusionStatus, RDFS.label,
           Literal("inclusion status", lang="en")))
    g.add((OPDA.inclusionStatus, RDFS.comment, Literal(
        "Whether a fixtures-and-fittings item is Included in, Excluded from, "
        "or absent (None) from a sale. A UFO Mode/Relator of the sale "
        "TRANSACTION (ODR-0007), confirmed by session-027 R4 — NOT a "
        "Quality of opda:Property (the same item is included in one sale and "
        "absent from the next, so inclusion has no rigid bearer in the "
        "brick-and-mortar). Bound on a transaction-scoped fixtures-list node "
        "(NEVER rdfs:domain opda:Property), ranging over the "
        "opda:InclusionStatusScheme value-space (Included / Excluded / "
        "None). The full sale-transaction Relator identity criterion is "
        "owned by ODR-0007.",
        lang="en",
    )))
    g.add((OPDA.inclusionStatus, DCTERMS.source, _ODR_0022_S4))

    # --- opda:price — Category D shared monetary-amount property --------
    # ODR-0022 §1 row D / §4: price \"reuses a MonetaryAmount
    # pattern, NOT 89 price props\" — ONE shared datatype property (the
    # data dictionary types the fixtures price leaf as a number), bound on
    # the transaction-scoped fixtures-list node alongside inclusionStatus. A
    # single property, never one per item.
    g.add((OPDA.price, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.price, RDFS.range, XSD.decimal))
    g.add((OPDA.price, RDFS.label, Literal("price", lang="en")))
    g.add((OPDA.price, RDFS.comment, Literal(
        "Monetary amount asked for a fixtures-and-fittings item included in "
        "a sale (a number in the data dictionary). ONE shared "
        "monetary-amount property reused across all fixtures items — "
        "ODR-0022 §4 mandates reusing a MonetaryAmount pattern, NEVER "
        "minting one price property per item. Bound on the "
        "transaction-scoped fixtures-list node alongside opda:inclusionStatus.",
        lang="en",
    )))
    g.add((OPDA.price, DCTERMS.source, _ODR_0022_S4))

    # --- opda:disclosureDetail — Category A (ODR-0022 §Rules.1) ---------
    # ONE reusable rdfs:comment-grade annotation property absorbing the
    # ~407 free-text disclosure tails (`details` ×269, `comments` ×96,
    # `summary` …). Per ODR-0022 §Rules.1 + §Rules.6: NEVER mint a
    # per-question detail property — the question is carried by the subject
    # node + the instance-level `dct:source` (the schema-leaf-path of the
    # question being elaborated). Range xsd:string; flat (no
    # rdfs:subPropertyOf). `dct:source` points at ODR-0022 §1 (the deciding
    # record for this reusable property), not at any one leaf.
    g.add((OPDA.disclosureDetail, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.disclosureDetail, RDFS.range, XSD.string))
    g.add((OPDA.disclosureDetail, RDFS.label,
           Literal("disclosure detail", lang="en")))
    g.add((OPDA.disclosureDetail, RDFS.comment, Literal(
        "Reusable free-text elaboration slot for a disclosure question "
        "(the generic `details` / `comments` / `summary` tail). "
        "rdfs:comment-grade — NOT a domain entity and carries no identity "
        "criterion (ODR-0022 §Rules.1 Category A). The question being "
        "elaborated is carried by the subject node and the instance-level "
        "dct:source pointing at that question's schema leaf path; a "
        "per-question detail property is NEVER minted (ODR-0022 §Rules.6).",
        lang="en",
    )))
    g.add((OPDA.disclosureDetail, DCTERMS.source, _ODR_0022_S1))

    # ==== Category-G curated walk — Family D: search / planning / building- =
    # control / local-authority / risk-assessment / artefact-reference results
    # (ADR-0031 work-item 2). Most attach to opda:Search (the Q4a search-result
    # Information Object) or opda:RiskAssessment (the per-peril result, for the
    # riskSubcategories / remedial-action leaves). Document- and media-reference
    # leaves are domain-less artefact references (no opda:Document Kind is
    # minted — flat references, a dedicated Kind would be speculative). Each a
    # flat datatype property per ODR-0008 §Q5a, flat per §Q6a; range from the
    # data-dictionary `type` (date-named strings → xsd:date). `domain=None`
    # emits NO rdfs:domain (shared reference property, opda:price convention).
    #
    # FLAGGED domain calls (surfaced for review):
    #   - status: polysemous across planning-permission / plan / road-adoption /
    #     search status (8 occurrences, all in search/local-authority result
    #     contexts) — placed on opda:Search; overlay shapes sh:in-restrict
    #     per-context. Plain string (the data dictionary's three status enums
    #     are context-specific; no single value-space).
    #   - document / media / url references (documentDate / documentTypeCode /
    #     filedUnder / retrievedOn / displayName / mediaUrl / url): domain-less
    #     artefact-reference attributes (titlesToBeSold documents, media, search
    #     templates) — no opda:Document Kind minted.
    _walk_d_search: list[
        tuple[URIRef, URIRef | None, URIRef, str, str, tuple[str, ...]]
    ] = [
        (
            OPDA.applicationType, OPDA.Search, XSD.string, "application type",
            "Type of a planning / building-control application recorded in a "
            "local-authority Search result (across the planning-permission, "
            "building-regulations, listed-building, conservation, and "
            "certificate-of-lawfulness decision blocks). ONE shared property "
            "reused across those blocks. Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "buildingRegulationsApproval[].applicationType",
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "planningPermission[].applicationType",
            ),
        ),
        (
            OPDA.applicationDate, OPDA.Search, XSD.date, "application date",
            "Date a planning / building-control application was made (across "
            "the local-authority-search decision blocks). xsd:date. ONE shared "
            "property; flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "buildingRegulationsApproval[].applicationDate",
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "planningPermission[].applicationDate",
            ),
        ),
        (
            OPDA.decision, OPDA.Search, XSD.string, "decision",
            "Decision recorded on a planning / building-control application "
            "in a local-authority Search result. ONE shared property reused "
            "across the decision blocks. Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "buildingRegulationsApproval[].decision",
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "planningPermission[].decision",
            ),
        ),
        (
            OPDA.decisionDate, OPDA.Search, XSD.date, "decision date",
            "Date a decision was made on a planning / building-control "
            "application. xsd:date. ONE shared property; flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "buildingRegulationsApproval[].decisionDate",
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "planningPermission[].decisionDate",
            ),
        ),
        (
            OPDA.refNumber, OPDA.Search, XSD.string, "reference number",
            "Application/case reference number on a planning / "
            "building-control result. ONE shared property; flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "buildingRegulationsApproval[].refNumber",
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "planningPermission[].refNumber",
            ),
        ),
        (
            OPDA.status, OPDA.Search, XSD.string, "status",
            "Status of a search-derived result item — planning permission, "
            "designation plan, road-adoption status, or search-order status. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a. (FLAG: "
            "polysemous across those contexts; placed on opda:Search; the "
            "data dictionary's three context-specific status enums are "
            "sh:in-restricted per-context in the overlay profile, not unified "
            "into one value-space.)",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "planningPermission[].status",
                "propertyPack.localSearches.localAuthoritySearches."
                "roadsAndPublicRightsOfWay.roadsFootwaysAndFootpaths."
                "subjectToAdoption[].status",
                "propertyPack.searches[].status",
            ),
        ),
        (
            OPDA.statusDate, OPDA.Search, XSD.date, "status date",
            "Date a designation plan's status was set in a local-authority "
            "Search result. xsd:date. Flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.designationsAndProposals."
                "plans[].statusDate",
            ),
        ),
        (
            OPDA.designationType, OPDA.Search, XSD.string, "designation type",
            "Type of a planning designation recorded in a local-authority "
            "Search result (e.g. conservation area, tree preservation order). "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.designationsAndProposals."
                "plans[].designations[].designationType",
            ),
        ),
        (
            OPDA.planningStartDate, OPDA.Search, XSD.date, "planning start date",
            "Start date of a planning matter in a local-authority Search "
            "result. xsd:date. Flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "planningStartDate",
            ),
        ),
        (
            OPDA.buildingControlStartDate, OPDA.Search, XSD.date,
            "building control start date",
            "Start date of a building-control matter in a local-authority "
            "Search result. xsd:date. Flat per §Q6a.",
            (
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "buildingControlStartDate",
            ),
        ),
        (
            OPDA.localAuthorityName, OPDA.Search, XSD.string,
            "local authority name",
            "Name of the local authority that issued / governs a Search. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.localAuthority.localAuthorityName",),
        ),
        (
            OPDA.localAuthorityReference, OPDA.Search, XSD.string,
            "local authority reference",
            "Reference identifying a Search within the local authority's "
            "system. Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.localAuthority.localAuthorityReference",),
        ),
        (
            OPDA.countyCouncil, OPDA.Search, XSD.string, "county council",
            "Name of the county council for the Property's locality "
            "(local-authority Search context). Plain string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.localAuthority.countyCouncil",),
        ),
        (
            OPDA.districtCouncil, OPDA.Search, XSD.string, "district council",
            "Name of the district council for the Property's locality. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.localAuthority.districtCouncil",),
        ),
        (
            OPDA.unitaryAuthority, OPDA.Search, XSD.string, "unitary authority",
            "Name of the unitary authority for the Property's locality. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.localAuthority.unitaryAuthority",),
        ),
        (
            OPDA.councilSearchTurnaroundTimeInWorkingDays, OPDA.Search,
            XSD.integer, "council search turnaround time in working days",
            "Quoted turnaround time (working days) for a council search. "
            "Plain integer datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.localAuthority.councilSearchTurnaroundTimeInWorkingDays",),
        ),
        (
            OPDA.regulatedSearchTurnaroundTimeInWorkingDays, OPDA.Search,
            XSD.integer, "regulated search turnaround time in working days",
            "Quoted turnaround time (working days) for a regulated search. "
            "Plain integer datatype per ODR-0008 §Q5a; flat per §Q6a.",
            (
                "propertyPack.localAuthority."
                "regulatedSearchTurnaroundTimeInWorkingDays",
            ),
        ),
        (
            OPDA.orderDate, OPDA.Search, XSD.date, "order date",
            "Date a Search was ordered. xsd:date. Flat per §Q6a.",
            ("propertyPack.searches[].orderDate",),
        ),
        (
            OPDA.expectedDeliveryDate, OPDA.Search, XSD.date,
            "expected delivery date",
            "Expected delivery date for an ordered Search. xsd:date. Flat "
            "per §Q6a.",
            ("propertyPack.searches[].expectedDeliveryDate",),
        ),
        (
            OPDA.reportDate, OPDA.Search, XSD.date, "report date",
            "Date a Search / survey report was produced. xsd:date. ONE shared "
            "property reused across search and survey reports; flat per §Q6a.",
            (
                "propertyPack.searches[].reportDate",
                "propertyPack.surveys[].misc.reportDate",
            ),
        ),
        (
            OPDA.productCode, OPDA.Search, XSD.string, "product code",
            "Provider product code identifying a Search product. Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.searches[].productCode",),
        ),
        (
            OPDA.providerName, OPDA.Search, XSD.string, "provider name",
            "Name of the Search provider. Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            ("propertyPack.searches[].providerName",),
        ),
        (
            OPDA.providerReference, OPDA.Search, XSD.string,
            "provider reference",
            "Provider's reference for a Search. Plain string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.searches[].providerReference",),
        ),
        (
            OPDA.subCategory, OPDA.RiskAssessment, XSD.string, "sub-category",
            "Sub-category of an environmental-peril RiskAssessment "
            "(riskSubcategories[] across the climate / coal-mining / flooding "
            "/ ground-stability / radon / etc. peril blocks). ONE shared "
            "property on opda:RiskAssessment. Plain string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            (
                "propertyPack.environmentalIssues.climate.climateRisk."
                "riskSubcategories[].subCategory",
                "propertyPack.environmentalIssues.flooding.floodRisk."
                "riskSubcategories[].subCategory",
            ),
        ),
        (
            OPDA.dateRemedialActionRequired, OPDA.RiskAssessment, XSD.date,
            "date remedial action required",
            "Date by which remedial action is required following a "
            "buildings-insurance RiskAssessment. xsd:date. Flat per §Q6a.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.buildingsInsurance."
                "managedAreasCoveredByPolicy.riskAssessments."
                "dateRemedialActionRequired",
            ),
        ),
        (
            OPDA.documentDate, OPDA.Document, XSD.date, "document date",
            "Date of a title / additional document. xsd:date. Domain "
            "opda:Document (the ODR-0009 document-evidence artefact); flat "
            "per §Q6a.",
            (
                "propertyPack.titlesToBeSold[].additionalDocuments[]."
                "documentDate",
                "propertyPack.titlesToBeSold[].registerExtract.ocSummaryData."
                "documentDetails.document.documentDate",
            ),
        ),
        (
            OPDA.documentTypeCode, OPDA.Document, XSD.string,
            "document type code",
            "Type code of a title / additional document. Domain opda:Document "
            "(the ODR-0009 document-evidence artefact); flat per §Q6a.",
            (
                "propertyPack.titlesToBeSold[].additionalDocuments[]."
                "documentTypeCode",
            ),
        ),
        (
            OPDA.filedUnder, OPDA.Document, XSD.string, "filed under",
            "Filing reference under which a title / additional document is "
            "held. Domain opda:Document (ODR-0009 document-evidence); flat "
            "per §Q6a.",
            (
                "propertyPack.titlesToBeSold[].additionalDocuments[].filedUnder",
                "propertyPack.titlesToBeSold[].registerExtract.ocSummaryData."
                "documentDetails.document.filedUnder",
            ),
        ),
        (
            OPDA.retrievedOn, OPDA.Document, XSD.date, "retrieved on",
            "Date a title / additional document was retrieved from the "
            "registry. xsd:date. Domain opda:Document (ODR-0009 "
            "document-evidence); flat per §Q6a.",
            (
                "propertyPack.titlesToBeSold[].additionalDocuments[]."
                "retrievedOn",
            ),
        ),
        (
            OPDA.displayName, None, XSD.string, "display name",
            "Human-readable display name of a document or Search artefact. "
            "Domain-less artefact-reference attribute; flat per §Q6a.",
            (
                "propertyPack.documents[].displayName",
                "propertyPack.searches[].displayName",
            ),
        ),
        (
            OPDA.mediaUrl, None, XSD.anyURI, "media URL",
            "URL of a media item (property image / floorplan / etc.). "
            "xsd:anyURI. Domain-less artefact-reference attribute; flat per "
            "§Q6a.",
            (
                "propertyPack.media[].mediaUrl",
                "valuationComparisonData.propertyDetails[].media[].mediaUrl",
            ),
        ),
        (
            OPDA.url, None, XSD.anyURI, "URL",
            "URL of an external artefact (contract template, planning-"
            "permission page). xsd:anyURI. Domain-less artefact-reference "
            "attribute; flat per §Q6a.",
            (
                "contracts[].contract.template.url",
                "propertyPack.localSearches.localAuthoritySearches."
                "planningAndBuildingRegulations.decisionsAndPendingApplications."
                "planningPermission[].url",
            ),
        ),
    ]
    for prop, domain, rng, label, comment, paths in _walk_d_search:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        if domain is not None:
            g.add((prop, RDFS.domain, domain))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    # ==== Category-G curated walk — Family E (descriptive side): Valuation ==
    # pricing + nearby-facilities datatype leaves (ADR-0031 work-item 2). The
    # valuation-pricing leaves attach to opda:Valuation (the Q4a Information
    # Object that bears them). The nearby-facilities leaves attach to the
    # opda:NearbyFacility hierarchy minted above: the shared proximity relation
    # opda:distanceInMiles on the genus, school attributes on opda:School, and
    # health-care attributes on opda:HealthCareFacility.
    _walk_e_descriptive: list[
        tuple[URIRef, URIRef | None, URIRef, str, str, tuple[str, ...]]
    ] = [
        # --- Valuation pricing (opda:Valuation domain) ---------------------
        (
            OPDA.soldDate, OPDA.Valuation, XSD.date, "sold date",
            "Date a comparable property was sold (valuation comparable "
            "listing info). xsd:date. Flat per §Q6a.",
            (
                "valuationComparisonData.propertyDetails[].propertyListingInfo."
                "soldDate",
            ),
        ),
        (
            OPDA.listedDate, OPDA.Valuation, XSD.date, "listed date",
            "Date a comparable property was listed for sale. xsd:date. Flat "
            "per §Q6a.",
            (
                "valuationComparisonData.propertyDetails[].propertyListingInfo."
                "listedDate",
            ),
        ),
        (
            OPDA["yield"], OPDA.Valuation, XSD.decimal, "yield",
            "Rental yield in a Valuation's pricing analysis. xsd:decimal. "
            "Flat per §Q6a.",
            ("valuationComparisonData.propertyPricing.yield",),
        ),
        (
            OPDA.pricingMethodology, OPDA.Valuation, XSD.string,
            "pricing methodology",
            "Methodology used to derive a Valuation's price estimate. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            (
                "valuationComparisonData.propertyPricing.priceEstimationDetails."
                "pricingMethodology",
            ),
        ),
        (
            OPDA.credibilitySources, OPDA.Valuation, XSD.string,
            "credibility sources",
            "Sources lending credibility to a Valuation's price estimate (a "
            "multi-valued list — each value an xsd:string). Plain multi-valued "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            (
                "valuationComparisonData.propertyPricing.priceEstimationDetails."
                "credibilitySources",
            ),
        ),
        # --- Nearby facilities (opda:NearbyFacility / School / HealthCare) -
        (
            OPDA.distanceInMiles, OPDA.NearbyFacility, XSD.decimal,
            "distance in miles",
            "Distance in miles from the Property to a nearby facility (school "
            "/ health-care / transport). xsd:decimal. Domain "
            "opda:NearbyFacility (the proximity relation on the genus), reused "
            "across the amenity bands; flat per §Q6a.",
            (
                "propertyPack.nearbyFacilities.healthCare[].distanceInMiles",
                "propertyPack.nearbyFacilities.schools[].distanceInMiles",
                "propertyPack.nearbyFacilities.transport[].distanceInMiles",
            ),
        ),
        (
            OPDA.ageRange, OPDA.School, XSD.string, "age range",
            "Age range of a nearby school. Domain opda:School. Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].ageRange",),
        ),
        (
            OPDA.pupils, OPDA.School, XSD.integer, "pupils",
            "Number of pupils at a nearby school. Domain opda:School. Plain "
            "integer datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].pupils",),
        ),
        (
            OPDA.religiousCharacter, OPDA.School, XSD.string,
            "religious character",
            "Religious character of a nearby school. Domain opda:School. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].religiousCharacter",),
        ),
        (
            OPDA.otherRating, OPDA.School, XSD.string, "other rating",
            "Other (non-Ofsted) rating of a nearby school. Domain opda:School. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].otherRating",),
        ),
        (
            OPDA.typeOfHealthCare, OPDA.HealthCareFacility, XSD.string,
            "type of health care",
            "Type of a nearby health-care facility. Domain "
            "opda:HealthCareFacility. Plain string datatype per ODR-0008 §Q5a; "
            "flat per §Q6a.",
            ("propertyPack.nearbyFacilities.healthCare[].typeOfHealthCare",),
        ),
        (
            OPDA.specialties, OPDA.HealthCareFacility, XSD.string, "specialties",
            "Specialties of a nearby health-care facility (a multi-valued "
            "list — each value an xsd:string). Domain opda:HealthCareFacility. "
            "Plain multi-valued string datatype per ODR-0008 §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.nearbyFacilities.healthCare[].specialties",),
        ),
    ]
    for prop, domain, rng, label, comment, paths in _walk_e_descriptive:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        if domain is not None:
            g.add((prop, RDFS.domain, domain))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    # --- Nearby-school schoolType buckets (DOMAIN-LESS ObjectProperties) ----
    # The five schoolType.* leaves (college / nursery / primary / secondary /
    # private) are OBJECT-typed sub-structures in the data dictionary, not
    # value leaves — each groups the nearby schools of that band. They are
    # minted as DOMAIN-LESS, RANGE-LESS opda: ObjectProperties (a relation to a
    # school-band sub-structure) rather than datatype properties, since their
    # value is a structured node, not a literal. FLAGGED for the same future
    # opda:NearbyFacility / opda:School cluster as the datatype leaves above.
    _school_type_buckets: list[tuple[URIRef, str, str]] = [
        (
            OPDA.college, "college",
            "Nearby college(s) — a band of the schoolType structure of "
            "opda:School (object-typed). Domain opda:School, range-less object "
            "property (the value is a structured school-band node).",
        ),
        (
            OPDA.nursery, "nursery",
            "Nearby nursery(ies) — a band of the schoolType structure of "
            "opda:School. Domain opda:School, range-less object property.",
        ),
        (
            OPDA.primary, "primary",
            "Nearby primary school(s) — a band of the schoolType structure of "
            "opda:School. Domain opda:School, range-less object property.",
        ),
        (
            OPDA.secondary, "secondary",
            "Nearby secondary school(s) — a band of the schoolType structure "
            "of opda:School. Domain opda:School, range-less object property.",
        ),
        (
            OPDA.private, "private",
            "Nearby private school(s) — a band of the schoolType structure of "
            "opda:School. Domain opda:School, range-less object property.",
        ),
    ]
    for prop, slug, comment in _school_type_buckets:
        g.add((prop, RDF.type, OWL.ObjectProperty))
        g.add((prop, RDFS.domain, OPDA.School))
        g.add((prop, RDFS.label, Literal(slug, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, DCTERMS.source, _dd_source(
            f"propertyPack.nearbyFacilities.schools[].schoolType.{slug}"
        )))

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
