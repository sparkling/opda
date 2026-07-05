"""
Module property.

Realises:
- ADR-0011 §"Per-module detail — opda-property.ttl" — Property + LegalEstate
  + RegisteredTitle (3-class commitment per S005 Q5) + Address (Substance
  Kind per S015 Q1) + UPRNSuccessionEvent + LeaseExtensionEvent.
- ADR-0007 §"A9 per-kind discipline output" — every emitted owl:Class
  carries rdfs:label + rdfs:comment + skos:scopeNote + dct:source.
- ODR-0005 §Rules + §2a/§3a/§3b/§3c/§6a — Property + LegalEstate +
  RegisteredTitle 3-class identity-crux pattern; UPRN as contingent
  identifier with PROV-O succession; core join predicates hasUPRN +
  identifiesSameProperty + recordsEstate.
- ODR-0015 §Rules + §2a/§3a — opda:Address as UFO Substance Kind
  subclassing vcard:Address; addressVariant Quality; hasAddress join
  predicate.
- ODR-0008 §Rules + §Q5a — descriptive attributes attach to Property /
  LegalEstate; the minimum binding table for the diagnostic exemplars
  emits here plus G11 expansion bound to BASPI5 (closed by ADR-0013).
- ADR-0013 G11 closure — additional Property-domain DatatypeProperties
  required by the BASPI5 overlay: propertyType, ownershipType,
  heatingType, areBoundariesUniform, isLocatedOverCommercialPremises,
  isSharedOwnership, isGroundRentPayable, hasSprayFoamInstalled,
  isSupplyMetered, isInsured, hasBeenFlooded, hasSmartHomeSystems,
  hasValidGuaranteesOrWarranties, soldWithVacantPossession,
  offMainsDrainageSystemType, riskIndicator, sellerContributesToServiceCharge.

LeaseExtensionEvent placement decision (within-engineering, per
ADR-0011 §"Surfaced ambiguity routing"): emitted in opda-property.ttl
because (i) the event mutates the LeaseTerm (a property/estate attribute)
and the RegisteredTitle (a property-side record) — both property-domain;
(ii) the same exemplar (lease-extension-transaction.ttl) types the same
node as both opda:LeaseExtensionEvent AND opda:Transaction, so the
Transaction-side typing is captured by opda-transaction.ttl, the
property-side typing by opda-property.ttl. The event is a property-
lifecycle event; the Transaction-typing reflects the relator perspective.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD


OPDA = Namespace("https://opda.org.uk/pdtf/")
VCARD = Namespace("http://www.w3.org/2006/vcard/ns#")
PROV = Namespace("http://www.w3.org/ns/prov#")
TIME = Namespace("http://www.w3.org/2006/time#")


# Data-dictionary schema-leaf-path dct:source (ODR-0022 G2). Mirrors the
# `_dd_source` helper in emitters/vocabularies.py (kept local so this module
# carries no cross-emitter import for a one-liner): the per-property G2 IRI is
# `<https://opda.org.uk/pdtf/harness/data-dictionary/<leaf_path>>`, the same form the SKOS
# member sources use, with array `[]` markers preserved one-to-one and
# whitespace percent-encoded.
def _dd_source(leaf_path: str) -> URIRef:
    """Return the data-dictionary schema-leaf-path `dct:source` IRI (G2)."""
    safe = leaf_path.replace(" ", "%20").replace("'", "%27")
    return URIRef(f"https://opda.org.uk/pdtf/harness/data-dictionary/{safe}")


# ADR-0031 work-item 1 — the six G11∩candidate-G overlap leaves carry their
# G2 schema-leaf-path `dct:source` (the canonical data-dictionary leaf), per
# the ODR-0008 §Q1a reconciliation register (dispositions applied 2026-05-31).
# `propertyType` is a C+G spanning leaf → an array of two paths (§Q3a). These
# tighten the prior generic `<ODR-0008#section-Q5a>` anchor to the leaf-path.
_G2_BUILT_FORM = _dd_source("propertyPack.buildInformation.building.builtForm")
_G2_CURRENT_ENERGY_RATING = _dd_source(
    "propertyPack.energyEfficiency.certificate.currentEnergyRating"
)
_G2_EPC_CERTIFICATE = _dd_source(
    "propertyPack.energyEfficiency.certificate"
)
_G2_SURVEY = _dd_source("propertyPack.surveys[]")
_G2_CENTRAL_HEATING_FUEL_TYPE = _dd_source(
    "propertyPack.heating.heatingSystem.centralHeatingDetails."
    "centralHeatingFuel.centralHeatingFuelType"
)
_G2_HEATING_TYPE = _dd_source("propertyPack.heating.heatingSystem.heatingType")
_G2_OWNERSHIP_TYPE = _dd_source(
    "propertyPack.ownership.ownershipsToBeTransferred[].ownershipType"
)
# propertyType spans Category C (buildInformation) + Category G
# (valuationComparisonData) — both paths attach to the one property (§Q3a).
_G2_PROPERTY_TYPE_C = _dd_source(
    "propertyPack.buildInformation.building.propertyType"
)
_G2_PROPERTY_TYPE_G = _dd_source(
    "valuationComparisonData.propertyDetails[].propertyType"
)


# Per-class dct:source URIs — every class cites the ratifying ODR section.
_ODR_0005_S2A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-2a")
_ODR_0005_S3B = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3b")
_ODR_0005_S3C = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3c")
_ODR_0005_S6A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-6a")
_ODR_0005_S6B = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-6b")
_ODR_0007_S5 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q5-lease-term")
_ODR_0008_S5A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q5a")
_ODR_0015_S2A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-2a")
_ODR_0015_S3A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-3a")
_ODR_0015_S3B = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-3b")
_ODR_0015_S4A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-4a")


# Module catalogue — classes + properties this module mints. Tests
# introspect this to verify §Confirmation #6 coverage without re-parsing.
CLASSES = (
    OPDA.Address,
    OPDA.LeaseExtensionEvent,
    OPDA.LeaseTerm,
    OPDA.LegalEstate,
    OPDA.Property,
    OPDA.RegisteredTitle,
)

OBJECT_PROPERTIES = (
    OPDA.hasAddress,
    OPDA.hasEPCCertificate,
    OPDA.hasSurvey,
    OPDA.identifiesSameProperty,
    OPDA.leaseTerm,
    OPDA.recordsEstate,
)

DATATYPE_PROPERTIES = (
    OPDA["from"],
    OPDA.abilityToResideAtProperty,
    OPDA.accessibilityAndAdaptations,
    OPDA.adHocExpenses,
    OPDA.addressVariant,
    OPDA.area,
    OPDA.areBoundariesUniform,
    OPDA.bathrooms,
    OPDA.bedrooms,
    OPDA.buildingsReinstatementCostAssessment,
    OPDA.builtForm,
    OPDA.centralHeatingFuelType,
    OPDA.centralHeatingInstalled,
    OPDA.consequentialChargingBasis,
    OPDA.councilTaxBand,
    OPDA.country,
    OPDA.currentChargingBasis,
    OPDA.currentEnergyRating,
    OPDA.dateInstalled,
    OPDA.dateLastEmptied,
    OPDA.dateLastServiced,
    OPDA.dateReplaced,
    OPDA.dateToBeConnected,
    OPDA.diningAreas,
    OPDA.distanceToNearestSewerageTreatment,
    OPDA.entranceFloor,
    OPDA.groundRentFrequency,
    OPDA.handoverOnCompletion,
    OPDA.hasBeenFlooded,
    OPDA.hasFixedRentcharge,
    OPDA.hasSmartHomeSystems,
    OPDA.hasSprayFoamInstalled,
    OPDA.hasUPRN,
    OPDA.hasValidGuaranteesOrWarranties,
    OPDA.heading,
    OPDA.heatingLastServicedDate,
    OPDA.heatingType,
    OPDA.isGroundRentPayable,
    OPDA.isInsured,
    OPDA.isLocatedOverCommercialPremises,
    OPDA.isSharedOwnership,
    OPDA.isSupplyMetered,
    OPDA.kitchens,
    OPDA.lastMaintained,
    OPDA.lengthOfLeaseInYears,
    OPDA.line1,
    OPDA.line2,
    OPDA.location,
    OPDA.logbookProvider,
    OPDA.mpan,
    OPDA.mprn,
    OPDA.numberOfFloors,
    OPDA.numberOfPropertiesSharing,
    OPDA.offMainsDrainageSystemType,
    OPDA.otherCentralHeatingFuelType,
    OPDA.otherHeatingFeatures,
    OPDA.otherOwnershipDetails,
    OPDA.otherPropertiesInManagedArea,
    OPDA.otherType,
    OPDA.outsideAreas,
    OPDA.ownershipType,
    OPDA.parkingArrangements,
    OPDA.personWhoDealsWithTheDeedOfCovenant,
    OPDA.pitch,
    OPDA.postcode,
    OPDA.postTown,
    OPDA.procedureForObtainingCertificate,
    OPDA.propertiesContributingToMaintenanceOfManagedArea,
    OPDA.propertyType,
    OPDA.publicSewerMapAttached,
    OPDA.receptions,
    OPDA.rentIncreaseCalculated,
    OPDA.rentReviewFrequency,
    OPDA.requirements,
    OPDA.sellerContributesToServiceCharge,
    OPDA.sewerageBills,
    OPDA.sewerageProvider,
    OPDA.sharedOwnershipPercentage,
    OPDA.soldWithVacantPossession,
    OPDA.startYearOfLease,
    OPDA.supplier,
    OPDA.supplyClassification,
    OPDA.tenureKind,
    OPDA.titleExtents,
    OPDA.titleNumber,
    OPDA.titlePropertyDescription,
    OPDA.to,
    OPDA.typeOfFlooding,
    OPDA.waterBills,
    OPDA.waterProvider,
    OPDA.waterworksMapAttached,
    OPDA.willHandoverLogbook,
    OPDA.year,
    OPDA.yearCompleted,
    OPDA.yearInstalled,
    OPDA.yearOfBuild,
    OPDA.yearTested,
    OPDA.yearWorkCarriedOut,
    OPDA.zoom,
)

# opda:DescriptiveProperty membership (ODR-0008 §Q7a) — every genuine
# ODR-0008 Property/LegalEstate descriptive datatype property this module
# mints, so the Q7a CI test can assert the base-cardinality clause (NO
# sh:minCount on a descriptive property in opda-shapes.ttl; per-form minCount
# lives only in the ODR-0010 overlay profiles). Excludes: ODR-0015 identity/
# address properties (hasUPRN, addressVariant — out of ODR-0008's own
# declared scope) and every SKOS-Concept-valued / structural-join
# owl:ObjectProperty above (builtForm, currentEnergyRating, tenureKind,
# ownershipType, heatingType, centralHeatingFuelType, propertyType,
# offMainsDrainageSystemType, the BASPI5 Yes/No discriminators, hasAddress,
# hasEPCCertificate, identifiesSameProperty, recordsEstate) — Q6a's floor is
# explicitly "datatype property", not object property.
DESCRIPTIVE_PROPERTIES = (
    OPDA.abilityToResideAtProperty,
    OPDA.accessibilityAndAdaptations,
    OPDA.adHocExpenses,
    OPDA.area,
    OPDA.bathrooms,
    OPDA.bedrooms,
    OPDA.buildingsReinstatementCostAssessment,
    OPDA.centralHeatingInstalled,
    OPDA.consequentialChargingBasis,
    OPDA.councilTaxBand,
    OPDA.currentChargingBasis,
    OPDA.dateInstalled,
    OPDA.dateLastEmptied,
    OPDA.dateLastServiced,
    OPDA.dateReplaced,
    OPDA.dateToBeConnected,
    OPDA.diningAreas,
    OPDA.distanceToNearestSewerageTreatment,
    OPDA.entranceFloor,
    OPDA["from"],
    OPDA.groundRentFrequency,
    OPDA.handoverOnCompletion,
    OPDA.hasFixedRentcharge,
    OPDA.heading,
    OPDA.heatingLastServicedDate,
    OPDA.kitchens,
    OPDA.lastMaintained,
    OPDA.lengthOfLeaseInYears,
    OPDA.location,
    OPDA.logbookProvider,
    OPDA.mpan,
    OPDA.mprn,
    OPDA.numberOfFloors,
    OPDA.numberOfPropertiesSharing,
    OPDA.otherCentralHeatingFuelType,
    OPDA.otherHeatingFeatures,
    OPDA.otherOwnershipDetails,
    OPDA.otherPropertiesInManagedArea,
    OPDA.otherType,
    OPDA.outsideAreas,
    OPDA.parkingArrangements,
    OPDA.personWhoDealsWithTheDeedOfCovenant,
    OPDA.pitch,
    OPDA.procedureForObtainingCertificate,
    OPDA.propertiesContributingToMaintenanceOfManagedArea,
    OPDA.publicSewerMapAttached,
    OPDA.receptions,
    OPDA.rentIncreaseCalculated,
    OPDA.rentReviewFrequency,
    OPDA.requirements,
    OPDA.sewerageBills,
    OPDA.sewerageProvider,
    OPDA.sharedOwnershipPercentage,
    OPDA.startYearOfLease,
    OPDA.supplier,
    OPDA.supplyClassification,
    OPDA.titleExtents,
    OPDA.titlePropertyDescription,
    OPDA.to,
    OPDA.typeOfFlooding,
    OPDA.waterBills,
    OPDA.waterProvider,
    OPDA.waterworksMapAttached,
    OPDA.willHandoverLogbook,
    OPDA.year,
    OPDA.yearCompleted,
    OPDA.yearInstalled,
    OPDA.yearOfBuild,
    OPDA.yearTested,
    OPDA.yearWorkCarriedOut,
    OPDA.zoom,
)


def build_graph() -> Graph:
    """Build the Property module class + property graph.

    Per ADR-0011 §"Module emission template": classes alphabetised by URI,
    DatatypeProperties alphabetised, ObjectProperties alphabetised. The
    canonical serialiser handles final ordering deterministically.
    """
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("owl", OWL)
    g.bind("rdfs", RDFS)
    g.bind("skos", SKOS)
    g.bind("dct", DCTERMS)
    g.bind("xsd", XSD)
    g.bind("vcard", VCARD)
    g.bind("prov", PROV)
    g.bind("time", TIME)

    # --- Module ontology header per ADR-0011 §"Module emission template" --
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/property")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title, Literal("OPDA Property Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://opda.org.uk/pdtf/harness/release/property/1.1.0/")))
    # The "any-of" documentary-domain/range convention (Council session-050 Q1
    # binding rider; ADR-0049; ODR-0032 §R1 session-050 amendment). opda:has-
    # Address carries MULTIPLE rdfs:domain triples (opda:Property , opda:Person ,
    # opda:Organisation) read as "any-of" (the schema.org domainIncludes / hm
    # ODR-0014 idiom), NOT the RDF Schema 1.1 §3.2 conjunction. Authored as
    # documentary AI-signal per ODR-0026 §R2 and NEVER entailed — the frozen
    # 7-rule closure (ODR-0025 §R1) consumes no rdfs:domain/range, so ADR-0035
    # proves zero domain/range triples materialise. The authoritative
    # disjunction is SHACL sh:or (opda:HasAddressBearerShape); owl:unionOf is
    # NOT used (excluded construct, ODR-0030).
    g.add((module_iri, SKOS.editorialNote, Literal(
        "Documentary domain/range convention (ODR-0026 §R2; ODR-0032 §R1; "
        "Council session-050 Q1): rdfs:domain/rdfs:range on the object "
        "properties of this module are authored as documentary AI-signal and "
        "are NEVER entailed (the frozen 7-rule closure, ODR-0025 §R1, consumes "
        "no domain/range; ADR-0035 proves zero domain/range triples "
        "materialise). Where one property carries MULTIPLE rdfs:domain or "
        "rdfs:range triples (opda:hasAddress — rdfs:domain opda:Property , "
        "opda:Person , opda:Organisation) they read as \"any-of\" (the "
        "schema.org domainIncludes idiom; hm ODR-0014), NOT the RDF Schema 1.1 "
        "§3.2 conjunction. SHACL sh:or is the authoritative disjunction "
        "(opda:HasAddressBearerShape); owl:unionOf is NOT used (excluded "
        "construct, ODR-0030).",
        lang="en",
    )))

    # --- opda:Property — UFO Substance Kind (ODR-0005 §2a) --------------
    g.add((OPDA.Property, RDF.type, OWL.Class))
    g.add((OPDA.Property, RDFS.label, Literal("Property", lang="en")))
    g.add((OPDA.Property, RDFS.comment, Literal(
        "Physical property. UFO Substance Kind; DOLCE Endurant / "
        "PhysicalObject. IC: spatial-material continuity with "
        "Kendall+Davis legal-record-discontinuity-override hybrid "
        "(ODR-0005 §3a). Hard cases: demolition; subdivision; merger; "
        "replacement; first-registration; flat with split UPRN.",
        lang="en",
    )))
    g.add((OPDA.Property, SKOS.scopeNote, Literal(
        "DOLCE: Endurant / PhysicalObject (Masolo et al. 2003 D18 §4.1). "
        "UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2 — Sortal, Rigid, "
        "supplies own IC).",
        lang="en",
    )))
    g.add((OPDA.Property, SKOS.definition, Literal(
        "A physical immovable property whose identity is fixed by spatial-"
        "material continuity (with a legal-record-discontinuity override) and "
        "persists through re-numbering, repair, and re-registration, as "
        "distinct from the legal estate vested in it and the registered title "
        "that records it.",
        lang="en",
    )))
    g.add((OPDA.Property, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.Property, DCTERMS.source, _ODR_0005_S2A))

    # --- opda:LegalEstate — UFO Substance Kind (ODR-0005 §3b) -----------
    g.add((OPDA.LegalEstate, RDF.type, OWL.Class))
    g.add((OPDA.LegalEstate, RDFS.label, Literal("Legal Estate", lang="en")))
    g.add((OPDA.LegalEstate, RDFS.comment, Literal(
        "Legal rights-bundle vested in a Property. UFO Substance Kind; "
        "DOLCE NonPhysicalEndurant (Searle 1995 legal-institutional "
        "object). IC: rights-bundle persistence — same individual through "
        "grant, transfer, registration, and discharge events; "
        "distinguishable from coexisting RegisteredTitle and physical "
        "Property by extent of property rights. Hard cases: tenure change; "
        "lease grant; lease termination; commonhold conversion; first "
        "registration of pre-existing common-law estate.",
        lang="en",
    )))
    g.add((OPDA.LegalEstate, SKOS.scopeNote, Literal(
        "DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2; Searle "
        "1995 institutional fact grounding). UFO: Substance Kind "
        "(Guizzardi 2005 Ch. 4 §4.2).",
        lang="en",
    )))
    g.add((OPDA.LegalEstate, SKOS.definition, Literal(
        "A bundle of legal rights in land (such as a freehold or leasehold "
        "estate) vested in a physical property, whose identity persists "
        "through grant, transfer, registration, and discharge and is "
        "distinguished from any coexisting registered title and the physical "
        "property by the extent of the property rights it confers.",
        lang="en",
    )))
    g.add((OPDA.LegalEstate, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.LegalEstate, DCTERMS.source, _ODR_0005_S3B))

    # --- opda:RegisteredTitle — UFO Substance Kind (ODR-0005 §3c) -------
    g.add((OPDA.RegisteredTitle, RDF.type, OWL.Class))
    g.add((OPDA.RegisteredTitle, RDFS.label,
           Literal("Registered Title", lang="en")))
    g.add((OPDA.RegisteredTitle, RDFS.comment, Literal(
        "HMLR title-register record. UFO Substance Kind (informational); "
        "DOLCE NonPhysicalEndurant. IC: title-number lineage + "
        "registry-event history (every lifecycle event captured as a "
        "reified prov:Activity with explicit prov:wasDerivedFrom / "
        "prov:wasInvalidatedBy triples). Hard cases: first registration "
        "(title opening); title closure; title merger; transfer between "
        "registers; title reissue on corrupt-plan replacement.",
        lang="en",
    )))
    g.add((OPDA.RegisteredTitle, SKOS.scopeNote, Literal(
        "DOLCE: NonPhysicalEndurant (HMLR record-entity per Masolo et al. "
        "2003 D18 §4.2). UFO: Substance Kind, informational "
        "(Guizzardi 2005 Ch. 4 §4.2).",
        lang="en",
    )))
    g.add((OPDA.RegisteredTitle, SKOS.definition, Literal(
        "An informational record entity maintained in the HM Land Registry "
        "title register, whose identity is fixed by its title-number lineage "
        "and registry-event history, as distinct from the legal estate it "
        "documents and the physical property it identifies.",
        lang="en",
    )))
    g.add((OPDA.RegisteredTitle, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.RegisteredTitle, DCTERMS.source, _ODR_0005_S3C))

    # --- opda:Address — UFO Substance Kind (ODR-0015 §2a) ---------------
    # rdfs:subClassOf vcard:Address per S015 Q4 alignment (machine-readable
    # binding so external vCard consumers see structural compatibility).
    g.add((OPDA.Address, RDF.type, OWL.Class))
    g.add((OPDA.Address, RDFS.subClassOf, VCARD.Address))
    g.add((OPDA.Address, RDFS.label, Literal("Address", lang="en")))
    g.add((OPDA.Address, RDFS.comment, Literal(
        "Socially-recognised locator constructed by an authority "
        "(Royal Mail / OS AddressBase / HMLR / INSPIRE) and persisting as "
        "a record-entity in that authority's stewardship. UFO Substance "
        "Kind; DOLCE NonPhysicalEndurant. IC over five hard cases per "
        "ODR-0015 §3a: cosmetic re-format; authority-internal succession; "
        "cross-variant identity-claim never collapses; Property-side "
        "change; INSPIRE-only locatedness. NOT a Mode (S015 Q1 commitment).",
        lang="en",
    )))
    g.add((OPDA.Address, SKOS.scopeNote, Literal(
        "DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2; Searle "
        "1995 institutional fact grounding). UFO: Substance Kind "
        "(Guizzardi 2005 Ch. 4 §4.2). Subclass of vcard:Address for "
        "structural compatibility with vCard consumers.",
        lang="en",
    )))
    g.add((OPDA.Address, SKOS.definition, Literal(
        "A socially-recognised locator constructed and stewarded by an "
        "addressing authority (Royal Mail, OS AddressBase, HM Land Registry, "
        "or INSPIRE) as a record entity, whose identity persists through "
        "cosmetic re-formatting and authority-internal succession and never "
        "collapses across variants stewarded by different authorities.",
        lang="en",
    )))
    g.add((OPDA.Address, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.Address, DCTERMS.source, _ODR_0015_S2A))

    # opda:UPRNSuccessionEvent REMOVED 2026-07-05 (RML gap-closing session).
    # Ratified ODR-0005 §6a, but confirmed to have zero basis anywhere in
    # the PDTF v3 schema family (transaction schema, verifiedClaims,
    # trust-framework, v1/v2 trees — exhaustively grepped for
    # "succession"/"supersede"/"uprnHistory": no hits). This is not merely
    # an unpopulated field: UPRN succession is cross-transaction history,
    # which a single PDTF transaction instance structurally cannot carry.
    # No SHACL shape targeted this class (zero domain/range connections
    # confirmed before removal), so removal is a clean, non-breaking
    # deletion. See ODR-0005's own removal amendment for the governance
    # record.

    # --- opda:LeaseTerm — OWL-Time-typed interval (ODR-0007 §Q5) --------
    g.add((OPDA.LeaseTerm, RDF.type, OWL.Class))
    g.add((OPDA.LeaseTerm, RDFS.subClassOf, TIME.ProperInterval))
    g.add((OPDA.LeaseTerm, RDFS.label, Literal("Lease Term", lang="en")))
    g.add((OPDA.LeaseTerm, RDFS.comment, Literal(
        "OWL-Time ProperInterval representing a leasehold term. Carries "
        "time:hasBeginning + time:hasDurationDescription (or time:hasEnd) "
        "per S007 Q5. Belongs to opda:LegalEstate of leasehold tenure "
        "(opda:leaseTerm join predicate). Modified by opda:"
        "LeaseExtensionEvent on statutory extension — extension produces "
        "a successor LeaseTerm with prov:wasDerivedFrom chain.",
        lang="en",
    )))
    g.add((OPDA.LeaseTerm, SKOS.scopeNote, Literal(
        "OWL-Time: ProperInterval (W3C Time Ontology REC §4.2). UFO: "
        "Information particular bounding a leasehold tenure perdurant.",
        lang="en",
    )))
    g.add((OPDA.LeaseTerm, SKOS.definition, Literal(
        "A bounded time interval defining the duration of a leasehold legal "
        "estate, carrying a beginning and either a duration or an end, and "
        "succeeded by a derived interval when the lease is statutorily "
        "extended.",
        lang="en",
    )))
    g.add((OPDA.LeaseTerm, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.LeaseTerm, DCTERMS.source, _ODR_0007_S5))

    # --- ObjectProperty: opda:leaseTerm ----------------------------------
    # LegalEstate -> LeaseTerm join predicate, named in opda:LeaseTerm's own
    # rdfs:comment above ("Belongs to opda:LegalEstate of leasehold tenure
    # (opda:leaseTerm join predicate)") but never actually declared — a
    # plain oversight (unlike opda:TransactionChain's dependsOnTransaction/
    # chainMembers, this carries no "Council picks the shape" flag anywhere;
    # it is a single, uncontroversial join with no alternative mechanism to
    # choose between).
    g.add((OPDA.leaseTerm, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.leaseTerm, RDFS.domain, OPDA.LegalEstate))
    g.add((OPDA.leaseTerm, RDFS.range, OPDA.LeaseTerm))
    g.add((OPDA.leaseTerm, RDFS.label, Literal("lease term", lang="en")))
    g.add((OPDA.leaseTerm, RDFS.comment, Literal(
        "Join from a leasehold opda:LegalEstate to the opda:LeaseTerm "
        "OWL-Time interval bounding its duration (S007 Q5).",
        lang="en",
    )))
    g.add((OPDA.leaseTerm, DCTERMS.source, _ODR_0007_S5))
    g.add((OPDA.leaseTerm, SKOS.definition, Literal(
        "Relates a leasehold legal estate to the bounded time interval "
        "defining the duration of its lease.",
        lang="en",
    )))
    g.add((OPDA.leaseTerm, RDFS.isDefinedBy, module_iri))

    # --- opda:LeaseExtensionEvent — provenance event ---------------------
    # Cross-domain — exemplar uses both opda:Transaction AND opda:
    # LeaseExtensionEvent on the same node. The Transaction-side typing
    # belongs to opda-transaction.ttl (founds Seller/Buyer Roles per
    # S007 Q1); this typing captures the property-lifecycle event side.
    g.add((OPDA.LeaseExtensionEvent, RDF.type, OWL.Class))
    g.add((OPDA.LeaseExtensionEvent, RDFS.subClassOf, PROV.Activity))
    g.add((OPDA.LeaseExtensionEvent, RDFS.label,
           Literal("Lease Extension Event", lang="en")))
    g.add((OPDA.LeaseExtensionEvent, RDFS.comment, Literal(
        "Reified PROV-O activity recording a statutory lease extension "
        "(LRHUDA 1993 in England & Wales). Mutates the LeaseTerm of an "
        "existing leasehold LegalEstate (ODR-0005 §3b Rule 1 — LegalEstate "
        "identity PERSISTS through extension; rights-bundle is modified, "
        "not dissolved) and updates the RegisteredTitle's registry record. "
        "The same node may co-type as opda:Transaction (S007 Q1 "
        "Transaction-as-Relator); the dual typing reflects the property-"
        "lifecycle vs relator perspectives on the same event.",
        lang="en",
    )))
    g.add((OPDA.LeaseExtensionEvent, SKOS.scopeNote, Literal(
        "UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7). DOLCE: "
        "Accomplishment (Masolo et al. 2003 D18 §4.4 — temporally extended "
        "with culmination at the registry-event timestamp). Hendler S005 "
        "Q5 'lease extension' consumer-fails case — the property of "
        "being-extended attaches to the registry-event lifecycle, not to "
        "the LegalEstate (which retains identity) and not to the Property.",
        lang="en",
    )))
    g.add((OPDA.LeaseExtensionEvent, SKOS.definition, Literal(
        "A reified provenance activity recording a statutory extension of a "
        "leasehold term, which produces a successor lease term and updates "
        "the registered title while the leasehold legal estate retains its "
        "identity.",
        lang="en",
    )))
    g.add((OPDA.LeaseExtensionEvent, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.LeaseExtensionEvent, DCTERMS.source, _ODR_0005_S3B))

    # --- DatatypeProperty: opda:addressVariant (ODR-0015 §Rule 6) -------
    g.add((OPDA.addressVariant, RDF.type, OWL.DatatypeProperty))
    # Also explicitly typed rdf:Property (standard OWL/RDFS: every
    # DatatypeProperty IS one — a true, uncontroversial fact, asserted
    # explicitly per this ontology's documentary-not-entailed doctrine,
    # ADR-0049) so opda:variantPredicate's closed-world rdfs:range check
    # (ODR-0029 R3) sees this as a valid value where it's used as one
    # (ODR-0018 §3a's DPVMappingRefinement).
    g.add((OPDA.addressVariant, RDF.type, RDF.Property))
    g.add((OPDA.addressVariant, RDFS.domain, OPDA.Address))
    g.add((OPDA.addressVariant, RDFS.range, XSD.string))
    g.add((OPDA.addressVariant, RDFS.label, Literal("address variant", lang="en")))
    g.add((OPDA.addressVariant, RDFS.comment, Literal(
        "Required tag identifying the authority and lifecycle for this "
        "Address instance (one of 'title' | 'marketing' | 'inspire'). "
        "UFO Quality particularising the Address Substance Kind within "
        "Guarino's S001 Q4 'mode of presentation' framing.",
        lang="en",
    )))
    g.add((OPDA.addressVariant, SKOS.definition, Literal(
        "The authority-and-lifecycle tag of an Address (one of 'title', "
        "'marketing', or 'inspire') identifying which addressing authority "
        "stewards the locator and the lifecycle it follows.",
        lang="en",
    )))
    g.add((OPDA.addressVariant, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.addressVariant, DCTERMS.source,
           URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-Rule-6")))

    # --- DatatypeProperties: opda:Address's 5 structural fields ---------
    # (ODR-0015 §3b, S015 Q3) — ratified alongside addressVariant/
    # identifiesSameProperty but never previously declared here; all
    # sh:minCount 0 / sh:maxCount 1 per the ODR's own SHACL property shape
    # spec (graceful degradation, e.g. the INSPIRE-only case with sparse
    # structural fields, ODR-0015 §3a Rule 5). Q3's "held-as-live dissent"
    # (Allemang DA) does NOT block this — the ODR's own Consequences say so
    # explicitly ("the dissent does not block the verdict... it preserves a
    # falsifiable re-open path"), and the dissent's own re-open trigger is a
    # future, conditional one (18 months / zero shared-Address evidence),
    # not a current implementation blocker.
    for _local_name, _label in (
        ("line1", "line 1"),
        ("line2", "line 2"),
        ("postTown", "post town"),
        ("postcode", "postcode"),
        ("country", "country"),
    ):
        _prop = OPDA[_local_name]
        g.add((_prop, RDF.type, OWL.DatatypeProperty))
        g.add((_prop, RDFS.domain, OPDA.Address))
        g.add((_prop, RDFS.range, XSD.string))
        g.add((_prop, RDFS.label, Literal(_label, lang="en")))
        g.add((_prop, RDFS.comment, Literal(
            f"Structural field of an opda:Address (ODR-0015 §3b, S015 Q3) — "
            f"{_label}. sh:minCount 0: absent when the addressing authority "
            f"has not populated it (e.g. an INSPIRE-only locator's sparse "
            f"structural fields, ODR-0015 §3a Rule 5).",
            lang="en",
        )))
        g.add((_prop, SKOS.definition, Literal(
            f"The {_label} component of a structured postal address.",
            lang="en",
        )))
        g.add((_prop, RDFS.isDefinedBy, module_iri))
        g.add((_prop, DCTERMS.source, _ODR_0015_S3B))

    # opda:inspireFeatureId REMOVED 2026-07-05 (RML gap-closing session).
    # Ratified ODR-0015 §4a, but confirmed to have zero basis anywhere in
    # the PDTF v3 schema family — "inspire"/"INSPIRE" appears nowhere in
    # any schema file, and opda:addressVariant itself (the field this
    # property's domain depends on) is not a real schema field either; no
    # PDTF instance can ever assert the "inspire" variant. The "inspire"
    # opda-v:AddressVariantScheme member and the dependent
    # INSPIRESuccessionRule SHACL-AF rule are removed alongside this for
    # the same reason (the rule's trigger condition, addressVariant =
    # "inspire", could never be satisfied by any real data). See
    # ODR-0015's own removal amendment for the governance record.

    # --- DatatypeProperty: opda:builtForm (ODR-0008 §Q5a) ---------------
    # ADR-0031 register: STANDS on opda:Property; Quale-in-Region; flat
    # (§Q6a — no named consumer query); range opda:BuiltFormScheme; dct:source
    # tightened to the G2 schema-leaf-path.
    g.add((OPDA.builtForm, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.builtForm, RDFS.domain, OPDA.Property))
    g.add((OPDA.builtForm, RDFS.range, SKOS.Concept))
    g.add((OPDA.builtForm, RDFS.label, Literal("built form", lang="en")))
    g.add((OPDA.builtForm, RDFS.comment, Literal(
        "Property built-form classification per opda:BuiltFormScheme "
        "(SKOS scheme in opda-vocabularies.ttl). UFO Quale-in-Region. "
        "Constrained by SHACL sh:in to the BuiltForm scheme members "
        "(ADR-0012 emits the constraint).",
        lang="en",
    )))
    g.add((OPDA.builtForm, SKOS.definition, Literal(
        "The built-form classification of a Property (such as detached, semi-"
        "detached, terraced, or end-terrace) drawn from the BuiltForm "
        "controlled scheme, describing how the building is structurally "
        "attached to neighbouring buildings.",
        lang="en",
    )))
    g.add((OPDA.builtForm, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.builtForm, DCTERMS.source, _G2_BUILT_FORM))

    # --- DatatypeProperty: opda:currentEnergyRating (ODR-0008 §Q5a) -----
    # ADR-0031 register: STANDS on opda:Property; Quale-in-Region (EPC band
    # A–G, DESNZ-governed); range opda:CurrentEnergyRatingScheme; dct:source
    # tightened to the G2 schema-leaf-path.
    g.add((OPDA.currentEnergyRating, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.currentEnergyRating, RDFS.domain, OPDA.Property))
    g.add((OPDA.currentEnergyRating, RDFS.range, SKOS.Concept))
    g.add((OPDA.currentEnergyRating, RDFS.label,
           Literal("current energy rating", lang="en")))
    g.add((OPDA.currentEnergyRating, RDFS.comment, Literal(
        "EPC current energy rating band (A–G) per "
        "opda:CurrentEnergyRatingScheme. UFO Quale-in-Region. Regulator-"
        "sourced enum (DESNZ-governed). Constrained by SHACL sh:in to "
        "the scheme members (ADR-0012 emits the constraint).",
        lang="en",
    )))
    g.add((OPDA.currentEnergyRating, SKOS.definition, Literal(
        "The current energy-efficiency rating band (A to G) of a Property as "
        "recorded on its Energy Performance Certificate, drawn from the "
        "DESNZ-governed CurrentEnergyRating scheme.",
        lang="en",
    )))
    g.add((OPDA.currentEnergyRating, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.currentEnergyRating, DCTERMS.source, _G2_CURRENT_ENERGY_RATING))

    # --- DatatypeProperty: opda:hasUPRN (ODR-0005 §6a) -------------------
    g.add((OPDA.hasUPRN, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.hasUPRN, RDFS.domain, OPDA.Property))
    g.add((OPDA.hasUPRN, RDFS.range, XSD.string))
    g.add((OPDA.hasUPRN, RDFS.label, Literal("has UPRN", lang="en")))
    g.add((OPDA.hasUPRN, RDFS.comment, Literal(
        "Unique Property Reference Number — OS AddressBase identifier. "
        "Per ODR-0005 §6a a contingent administrative identifier under "
        "PROV-O succession; NOT a load-bearing identity criterion. "
        "Operationally checkable via dash:uniqueValueForClass (ADR-0012 "
        "emits the shape).",
        lang="en",
    )))
    g.add((OPDA.hasUPRN, SKOS.definition, Literal(
        "The Unique Property Reference Number assigned to a Property in OS "
        "AddressBase: a contingent administrative identifier subject to "
        "provenance-tracked succession, not a load-bearing identity "
        "criterion for the property.",
        lang="en",
    )))
    g.add((OPDA.hasUPRN, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.hasUPRN, DCTERMS.source, _ODR_0005_S6A))

    # --- DatatypeProperty: opda:tenureKind (ODR-0008 §Q5a) ---------------
    g.add((OPDA.tenureKind, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.tenureKind, RDFS.domain, OPDA.LegalEstate))
    g.add((OPDA.tenureKind, RDFS.range, SKOS.Concept))
    g.add((OPDA.tenureKind, RDFS.label, Literal("tenure kind", lang="en")))
    g.add((OPDA.tenureKind, RDFS.comment, Literal(
        "Tenure classification per opda:TenureKindScheme — Substance "
        "Kind label (Freehold / Leasehold / Commonhold), a coded facet on "
        "opda:LegalEstate enforced by SHACL sh:in. Per the ODR-0011 §8a "
        "load-bearing cascade (Council session-036), tenure is +R but −I "
        "(no distinct identity criterion; tenure-change is a value change, "
        "not a re-typing) → classification, NOT a subclass: opda does NOT "
        "mint Freehold/Leasehold/Commonhold OWL sub-classes, and no "
        "skos:exactMatch-to-subclass is emitted (the §8a subclass binding "
        "applies only to load-bearing +I labels).",
        lang="en",
    )))
    g.add((OPDA.tenureKind, SKOS.definition, Literal(
        "The tenure classification of a LegalEstate (freehold, leasehold, or "
        "commonhold) drawn from the TenureKind scheme: a coded facet, not a "
        "subclass, since tenure change is a value change rather than a re-"
        "typing.",
        lang="en",
    )))
    g.add((OPDA.tenureKind, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.tenureKind, DCTERMS.source, _ODR_0008_S5A))

    # --- ObjectProperty: opda:hasAddress (ODR-0015 §3a; ODR-0005 §6b; ODR-0032) -
    # Bearer → Address join, bearer-extended to Property/Person/Organisation
    # (Council session-047 Q6). Documentary "any-of" domain (ODR-0032 §R1/§R2
    # session-050 amendment; the schema.org domainIncludes idiom, hm ODR-0014):
    # rdfs:domain opda:Property , opda:Person , opda:Organisation — three triples
    # read DISJUNCTIVELY per the module-header convention, NOT the RDFS §3.2
    # conjunction. Authored as documentary AI-signal and NEVER entailed (the
    # frozen closure consumes no domain — ADR-0035 proves zero domain/range
    # triples materialise, so `rdfs:domain opda:Property , …` does NOT entail
    # every addressed Person/Organisation is a Property). The AUTHORITATIVE
    # bearer disjunction stays in SHACL sh:or (opda:HasAddressBearerShape,
    # sh:or [Property|Person|Organisation]); owl:unionOf is NOT used (excluded
    # construct, ODR-0030). rdfs:range opda:Address is KEPT (single co-domain →
    # plain), with its auto-derived opda:hasAddressRangeShape retained. The
    # opda:Address class/IC is NOT re-settled here — Mode-vs-Resource stays
    # ODR-0015's open question (RESIDUE-PENDING; the coverage gate must not
    # manufacture an Address class). NB: the multi-domain "any-of" is EXCLUDED
    # from the single-sh:class auto-derivation (build_domain_range_constraint_-
    # shapes skips multi-domain/range predicates — a conjunctive multi-sh:class
    # shape would be wrong for an any-of predicate); opda:HasAddressBearerShape
    # is the authoritative bearer dual.
    g.add((OPDA.hasAddress, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasAddress, RDFS.domain, OPDA.Property))
    g.add((OPDA.hasAddress, RDFS.domain, OPDA.Person))
    g.add((OPDA.hasAddress, RDFS.domain, OPDA.Organisation))
    g.add((OPDA.hasAddress, RDFS.range, OPDA.Address))
    g.add((OPDA.hasAddress, RDFS.label, Literal("has address", lang="en")))
    g.add((OPDA.hasAddress, RDFS.comment, Literal(
        "Canonical bearer → Address join predicate. Per ODR-0005 §6b "
        "pre-commitment and ODR-0015 §3a, opda:hasAddress is uniform "
        "across variants — one bearer may hasAddress multiple Address "
        "instances differing on opda:addressVariant (title / marketing / "
        "inspire). Per Council session-047 Q6 the predicate is bearer-extended "
        "to Person/Organisation. Documentary \"any-of\" domain (ODR-0032 §R2 "
        "session-050 amendment): rdfs:domain opda:Property , opda:Person , "
        "opda:Organisation — three triples read DISJUNCTIVELY per the "
        "module-header convention, NOT the RDFS §3.2 conjunction; authored as "
        "AI-signal, NEVER entailed (zero domain/range triples materialise, "
        "ADR-0035 — so the domain does NOT entail every addressed Person is a "
        "Property). The authoritative bearer disjunction lives in SHACL sh:or "
        "(opda:HasAddressBearerShape), NOT owl:unionOf. rdfs:range opda:Address "
        "kept (single co-domain); the Address class/IC stays ODR-0015-pending "
        "(Mode-vs-Resource open).",
        lang="en",
    )))
    g.add((OPDA.hasAddress, SKOS.definition, Literal(
        "Relates an address-bearing entity (a Property, Person, or "
        "Organisation) to an Address that locates it, uniformly across "
        "address variants so that one bearer may hold several Addresses "
        "differing on their variant.",
        lang="en",
    )))
    g.add((OPDA.hasAddress, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.hasAddress, DCTERMS.source, _ODR_0015_S3A))

    # --- ObjectProperty: opda:hasEPCCertificate (ODR-0008 §Q4a) ---------
    # Property → EPCCertificate join. The EPC rating leaf is a Property
    # attribute (opda:currentEnergyRating, rdfs:domain opda:Property); the
    # certificate itself is a distinct PROV-O Entity reached by this join,
    # NOT a re-homed Property-domain predicate (handover 2026-06-01 §8 /
    # ODR-0025 §R7 / ADR-0035 §"EPCCertificate emitter fix"). Carries the
    # BASPI5 certificate-container leaf path so Baspi5_PropertyShape can
    # round-trip question A1.8.3.1 by a domain-correct sh:path (ODR-0022 §2 G3).
    g.add((OPDA.hasEPCCertificate, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasEPCCertificate, RDFS.domain, OPDA.Property))
    g.add((OPDA.hasEPCCertificate, RDFS.range, OPDA.EPCCertificate))
    g.add((OPDA.hasEPCCertificate, RDFS.label,
           Literal("has EPC certificate", lang="en")))
    g.add((OPDA.hasEPCCertificate, RDFS.comment, Literal(
        "Property → opda:EPCCertificate join predicate. The energy rating "
        "band stays on the Property as opda:currentEnergyRating (its "
        "rdfs:domain); this join reaches the certificate Entity as a "
        "distinct PROV-O artefact (10-year lifecycle, DESNZ register).",
        lang="en",
    )))
    g.add((OPDA.hasEPCCertificate, SKOS.definition, Literal(
        "Relates a Property to the Energy Performance Certificate issued for "
        "it: a distinct certificate entity in the DESNZ register with its "
        "own ten-year lifecycle, reached separately from the property's own "
        "current energy rating.",
        lang="en",
    )))
    g.add((OPDA.hasEPCCertificate, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.hasEPCCertificate, DCTERMS.source, _G2_EPC_CERTIFICATE))

    # --- ObjectProperty: opda:hasSurvey (ODR-0008 §Q4a / ODR-0008d) -------
    # Property → Survey join, matching opda:hasEPCCertificate's exact
    # pattern: opda:constructionType stays flat on the Property (its
    # rdfs:domain, M18 in the RML mapping); this join additionally reaches
    # the RICS Level 2 survey report itself as a distinct PROV-O Entity
    # (SurveyIdentityKeyShape's minCount 1 prov:wasGeneratedBy), not a
    # re-homed Property-domain predicate.
    g.add((OPDA.hasSurvey, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasSurvey, RDFS.domain, OPDA.Property))
    g.add((OPDA.hasSurvey, RDFS.range, OPDA.Survey))
    g.add((OPDA.hasSurvey, RDFS.label,
           Literal("has survey", lang="en")))
    g.add((OPDA.hasSurvey, RDFS.comment, Literal(
        "Property → opda:Survey join predicate. The survey's construction-"
        "type observation stays on the Property as opda:constructionType "
        "(its rdfs:domain); this join reaches the survey report itself as "
        "a distinct PROV-O artefact (RICS Level 2 professional survey, "
        "issued/superseded/re-issued/withdrawn lifecycle, ODR-0008d Rule 3).",
        lang="en",
    )))
    g.add((OPDA.hasSurvey, SKOS.definition, Literal(
        "Relates a Property to a professional survey report retrieved for "
        "it: a distinct survey entity with its own provenance chain and "
        "issue/supersession lifecycle, reached separately from the "
        "property's own construction-type observation.",
        lang="en",
    )))
    g.add((OPDA.hasSurvey, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.hasSurvey, DCTERMS.source, _G2_SURVEY))

    # --- ObjectProperty: opda:identifiesSameProperty (ODR-0005 §Rule 5) -
    g.add((OPDA.identifiesSameProperty, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.identifiesSameProperty, RDFS.range, OPDA.Property))
    g.add((OPDA.identifiesSameProperty, RDFS.label,
           Literal("identifies same property", lang="en")))
    g.add((OPDA.identifiesSameProperty, RDFS.comment, Literal(
        "Co-reference predicate from any identity-bearing surface "
        "(RegisteredTitle, LegalEstate, Address) to the physical "
        "Property they identify. Per ODR-0005 Rule 5: NEVER use "
        "owl:sameAs (which would propagate every context's properties "
        "onto every other under inference). Domain intentionally "
        "unconstrained — any class with co-reference responsibility "
        "may emit this predicate.",
        lang="en",
    )))
    g.add((OPDA.identifiesSameProperty, SKOS.definition, Literal(
        "Relates an identity-bearing surface (a RegisteredTitle, LegalEstate, "
        "or Address) to the physical Property it identifies, asserting co-"
        "reference without the property-propagating force of owl:sameAs.",
        lang="en",
    )))
    g.add((OPDA.identifiesSameProperty, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.identifiesSameProperty, DCTERMS.source, _ODR_0005_S2A))

    # --- ObjectProperty: opda:recordsEstate (ODR-0005 §3c) --------------
    g.add((OPDA.recordsEstate, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.recordsEstate, RDFS.domain, OPDA.RegisteredTitle))
    g.add((OPDA.recordsEstate, RDFS.range, OPDA.LegalEstate))
    g.add((OPDA.recordsEstate, RDFS.label,
           Literal("records estate", lang="en")))
    g.add((OPDA.recordsEstate, RDFS.comment, Literal(
        "Title-to-estate join: the RegisteredTitle's HMLR record names "
        "the LegalEstate it documents. Per ODR-0005 §3c, this is the "
        "three-way structural seam (RegisteredTitle recordsEstate "
        "LegalEstate; LegalEstate vests in Property; RegisteredTitle "
        "identifiesSameProperty Property).",
        lang="en",
    )))
    g.add((OPDA.recordsEstate, SKOS.definition, Literal(
        "Relates a RegisteredTitle to the LegalEstate that its HM Land "
        "Registry record documents, forming one seam of the title-estate-"
        "property structural triangle.",
        lang="en",
    )))
    g.add((OPDA.recordsEstate, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.recordsEstate, DCTERMS.source, _ODR_0005_S3C))

    # --- ObjectProperty: opda:appliesTo (2026-07-05, RML gap-closing) ---
    # MINTED to close a real "ratified but never implemented" gap: THREE
    # ratified diagnostic exemplars already USE opda:appliesTo —
    # person-with-name-change.ttl (NameChangeEvent -> Person),
    # lease-extension-transaction.ttl (LeaseExtensionEvent -> LegalEstate),
    # and flat-with-split-uprn.ttl (UPRNSuccessionEvent -> Property, found
    # only after the first pass at this declaration caused a real CI
    # regression by checking only the first two) — but the predicate was
    # never actually declared anywhere in the emitted ontology, confirmed by
    # direct grep across the whole corpus. Shared, domain-less object
    # property (same "any-of" documentary convention as opda:founds /
    # opda:playedBy, ODR-0026 §R2 module-header idiom): one
    # Activity-targets-its-subject-Entity edge reused by three distinct
    # provenance-event Kinds, each aiming at a different Entity Kind.
    g.add((OPDA.appliesTo, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.appliesTo, RDF.type, RDF.Property))
    g.add((OPDA.appliesTo, RDFS.range, OPDA.Person))
    g.add((OPDA.appliesTo, RDFS.range, OPDA.LegalEstate))
    g.add((OPDA.appliesTo, RDFS.range, OPDA.Property))
    g.add((OPDA.appliesTo, RDFS.label, Literal("applies to", lang="en")))
    g.add((OPDA.appliesTo, RDFS.comment, Literal(
        "Provenance-activity-to-subject-entity join: relates a reified "
        "PROV-O Activity to the Entity it acted upon — opda:NameChangeEvent "
        "to the opda:Person whose name changed (ODR-0006 §Q1), "
        "opda:LeaseExtensionEvent to the opda:LegalEstate whose term was "
        "extended (ODR-0005 §3b), or opda:UPRNSuccessionEvent to the "
        "opda:Property whose UPRN was re-issued (ODR-0005 Rule 6). Domain "
        "intentionally unconstrained (same convention as "
        "opda:identifiesSameProperty, above) — any reified provenance-"
        "activity Kind may emit this predicate. Documentary \"any-of\" "
        "rdfs:range opda:Person, opda:LegalEstate, opda:Property "
        "(module-header disjunctive-not-conjunctive convention, ADR-0035 — "
        "never entailed).",
        lang="en",
    )))
    g.add((OPDA.appliesTo, SKOS.definition, Literal(
        "Relates a reified provenance activity to the entity it acted "
        "upon — a name-change event to the person renamed, or a lease-"
        "extension event to the legal estate extended.",
        lang="en",
    )))
    g.add((OPDA.appliesTo, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.appliesTo, DCTERMS.source, _ODR_0005_S3B))

    # --- DatatypeProperty: opda:leaseExtensionDetails (2026-07-05) ------
    # CLOSED alongside opda:appliesTo, above, same "ratified but never
    # implemented" gap class. Real JSON hook confirmed:
    # propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation
    # .enfranchisement.enfranchisementSteps.details (free text, present only
    # when enfranchisementSteps.yesNo == "Yes" — TA7/LPE1 §6.3/10 "steps
    # taken... to extend the term of the lease... or anything similar").
    # opda:legalBasis / opda:premiumPaid / opda:premiumCurrency /
    # opda:updatesRegistryRecord from the exemplar are DELIBERATELY NOT
    # minted — no source data honestly populates them (flag, don't
    # fabricate, this mapping's established discipline).
    g.add((OPDA.leaseExtensionDetails, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.leaseExtensionDetails, RDF.type, RDF.Property))
    g.add((OPDA.leaseExtensionDetails, RDFS.domain, OPDA.LeaseExtensionEvent))
    g.add((OPDA.leaseExtensionDetails, RDFS.range, XSD.string))
    g.add((OPDA.leaseExtensionDetails, RDFS.label,
           Literal("lease extension details", lang="en")))
    g.add((OPDA.leaseExtensionDetails, RDFS.comment, Literal(
        "Free-text detail elaborating the steps taken to extend a "
        "leasehold's term (TA7/LPE1 enfranchisement §6.3/§10), supplied "
        "when the seller discloses such steps were taken. Plain string "
        "datatype per ODR-0008 §Q5a; flat per §Q6a.",
        lang="en",
    )))
    g.add((OPDA.leaseExtensionDetails, SKOS.definition, Literal(
        "Free-text narrative elaborating the steps taken to extend a "
        "leasehold's term, as disclosed by the seller.",
        lang="en",
    )))
    g.add((OPDA.leaseExtensionDetails, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.leaseExtensionDetails, DCTERMS.source, _ODR_0005_S3B))

    # ==== G11 expansion (ADR-0013) ======================================
    # Additional Property/LegalEstate DatatypeProperties required by the
    # BASPI5 overlay. Each property carries rdfs:domain + rdfs:range +
    # rdfs:label @en + rdfs:comment @en + dct:source. Constrained by
    # `sh:in <scheme>` in profiles/baspi5.ttl per ODR-0008 §Q5a binding
    # table + ODR-0010 §Q5 build-step replacement.
    _g11_properties = [
        (
            OPDA.propertyType,
            OPDA.Property,
            "property type",
            "Substance Kind label classifying the physical-form Kind of a "
            "Property per opda:PropertyTypeScheme (House / Bungalow / "
            "Park home / Flat / Maisonette / Other). Distinct from "
            "opda:builtForm (Quale-in-Region structural classification). "
            "Constrained by SHACL sh:in to the scheme members in the "
            "BASPI5 profile.",
            "The property-type classification of a Property (house, bungalow, "
            "park home, flat, maisonette, or other) drawn from the "
            "PropertyType scheme, naming its physical-form kind as distinct "
            "from its built form.",
        ),
        (
            OPDA.ownershipType,
            OPDA.LegalEstate,
            "ownership type",
            "Ownership-type classification per opda:OwnershipTypeScheme "
            "(Freehold / Leasehold / Commonhold / Managed Freehold / "
            "Other). UFO Quale-in-Region of LegalEstate. Constrained by "
            "SHACL sh:in to the scheme members in the BASPI5 profile.",
            "The ownership-type classification of a LegalEstate (freehold, "
            "leasehold, commonhold, managed freehold, or other) drawn from "
            "the OwnershipType scheme.",
        ),
        (
            OPDA.heatingType,
            OPDA.Property,
            "heating type",
            "Property heating-system arrangement per opda:HeatingTypeScheme "
            "(Central heating / Communal heating system / Room heaters "
            "only / None). UFO Quale-in-Region. Constrained by SHACL "
            "sh:in to the scheme members in the BASPI5 profile.",
            "The heating-system arrangement of a Property (central heating, "
            "communal heating, room heaters only, or none) drawn from the "
            "HeatingType scheme.",
        ),
        (
            OPDA.centralHeatingFuelType,
            OPDA.Property,
            "central heating fuel type",
            "Fuel classification for a Property's central heating system "
            "per opda:CentralHeatingFuelTypeScheme (Mains gas / "
            "Electricity / Oil / LPG / Biomass / Other). UFO "
            "Quale-in-Region. Constrained by SHACL sh:in to the scheme "
            "members in the BASPI5 profile.",
            "The fuel powering a Property's central heating system (mains "
            "gas, electricity, oil, LPG, biomass, or other) drawn from the "
            "CentralHeatingFuelType scheme.",
        ),
        (
            OPDA.offMainsDrainageSystemType,
            OPDA.Property,
            "off-mains drainage system type",
            "Off-mains drainage classification per "
            "opda:OffMainsDrainageSystemTypeScheme (SuDS / Septic tank / "
            "Cesspit / Sewerage treatment plant / Other / Not known). "
            "Applies when not connected to mains sewerage.",
            "The off-mains drainage arrangement of a Property not connected "
            "to mains sewerage (SuDS, septic tank, cesspit, sewerage "
            "treatment plant, other, or not known) drawn from the "
            "OffMainsDrainageSystemType scheme.",
        ),
        (
            OPDA.areBoundariesUniform,
            OPDA.Property,
            "are boundaries uniform",
            "Yes/No discriminator: are the Property's legal and physical "
            "boundaries uniform (i.e. do they match)? Bound to "
            "opda:YesNoScheme via SHACL sh:in in the BASPI5 profile.",
            "A coded yes/no value recording whether a Property's legal and "
            "physical boundaries coincide.",
        ),
        (
            OPDA.isLocatedOverCommercialPremises,
            OPDA.Property,
            "is located over commercial premises",
            "Yes/No discriminator: is the Property located over "
            "commercial premises? Applies to Flats and Maisonettes per "
            "BASPI5 question A1.8.6.1. Bound to opda:YesNoScheme.",
            "A coded yes/no value recording whether a Property (typically a "
            "flat or maisonette) is situated over commercial premises.",
        ),
        (
            OPDA.isSharedOwnership,
            OPDA.LegalEstate,
            "is shared ownership",
            "Yes/No discriminator: is the LegalEstate a shared-ownership "
            "lease? Applies to Leasehold ownership per BASPI5 question "
            "A1.3.1. Bound to opda:YesNoScheme.",
            "A coded yes/no value recording whether a LegalEstate is held "
            "under a shared-ownership lease.",
        ),
        (
            OPDA.isGroundRentPayable,
            OPDA.LegalEstate,
            "is ground rent payable",
            "Yes/No discriminator: is ground rent payable on the "
            "Leasehold? BASPI5 ground-rent question. Bound to "
            "opda:YesNoScheme.",
            "A coded yes/no value recording whether ground rent is payable on "
            "a leasehold LegalEstate.",
        ),
        (
            OPDA.sellerContributesToServiceCharge,
            OPDA.LegalEstate,
            "seller contributes to service charge",
            "Yes/No discriminator: does the Seller contribute to a "
            "service charge for the Property? Applies to Leasehold / "
            "Managed Freehold / Commonhold per BASPI5. Bound to "
            "opda:YesNoScheme.",
            "A coded yes/no value recording whether the seller contributes to "
            "a service charge on a leasehold, managed-freehold, or commonhold "
            "LegalEstate.",
        ),
        (
            OPDA.hasSprayFoamInstalled,
            OPDA.Property,
            "has spray foam installed",
            "Yes/No discriminator: has spray-foam insulation been "
            "installed in the Property? Relevant for mortgage-eligibility "
            "per BASPI5. Bound to opda:YesNoScheme.",
            "A coded yes/no value recording whether spray-foam insulation has "
            "been installed in a Property.",
        ),
        (
            OPDA.isSupplyMetered,
            OPDA.Property,
            "is supply metered",
            "Yes/No discriminator: is the Property's utility supply "
            "(electricity / water / gas) metered? BASPI5 utility questions. "
            "Bound to opda:YesNoScheme.",
            "A coded yes/no value recording whether a Property's utility "
            "supply (electricity, water, or gas) is metered.",
        ),
        (
            OPDA.isInsured,
            OPDA.Property,
            "is insured",
            "Yes/No discriminator: is the Property currently insured? "
            "BASPI5 insurance question. Bound to opda:YesNoScheme.",
            "A coded yes/no value recording whether a Property is currently "
            "insured.",
        ),
        (
            OPDA.hasBeenFlooded,
            OPDA.Property,
            "has been flooded",
            "Yes/No discriminator: has the Property been flooded? BASPI5 "
            "environmental-issue question. Bound to opda:YesNoScheme.",
            "A coded yes/no value recording whether a Property has been "
            "flooded.",
        ),
        (
            OPDA.hasSmartHomeSystems,
            OPDA.Property,
            "has smart home systems",
            "Yes/No discriminator: does the Property have smart-home "
            "systems installed? BASPI5 smart-home question. Bound to "
            "opda:YesNoScheme.",
            "A coded yes/no value recording whether a Property has smart-home "
            "systems installed.",
        ),
        (
            OPDA.hasValidGuaranteesOrWarranties,
            OPDA.Property,
            "has valid guarantees or warranties",
            "Yes/No discriminator: does the Property carry valid "
            "guarantees, warranties, or indemnity insurances? BASPI5 "
            "guarantees question. Bound to opda:YesNoScheme.",
            "A coded yes/no value recording whether a Property carries valid "
            "guarantees, warranties, or indemnity insurances.",
        ),
        (
            OPDA.soldWithVacantPossession,
            OPDA.Property,
            "sold with vacant possession",
            "Yes/No discriminator: is the Property sold with vacant "
            "possession (vs sold subject to existing tenancies)? BASPI5 "
            "completion question. Bound to opda:YesNoScheme.",
            "A coded yes/no value recording whether a Property is sold with "
            "vacant possession rather than subject to existing tenancies.",
        ),
    ]
    # ADR-0031 register dispositions (applied 2026-05-31): the four G11∩
    # candidate-G §Q5a Quale/Substance-Kind-label leaves in this loop carry
    # their G2 schema-leaf-path dct:source; `propertyType` is C+G spanning, so
    # it gets BOTH paths (§Q3a array). Every other G11 leaf (the Yes/No
    # discriminators + offMainsDrainageSystemType) keeps the §Q5a ODR anchor
    # until its own curation batch lands.
    _g2_sources: dict[URIRef, tuple[URIRef, ...]] = {
        OPDA.propertyType: (_G2_PROPERTY_TYPE_C, _G2_PROPERTY_TYPE_G),
        OPDA.ownershipType: (_G2_OWNERSHIP_TYPE,),
        OPDA.heatingType: (_G2_HEATING_TYPE,),
        OPDA.centralHeatingFuelType: (_G2_CENTRAL_HEATING_FUEL_TYPE,),
    }
    # Properties whose range is a SKOS concept (scheme-valued enums).
    _g11_scheme_valued = {
        OPDA.propertyType,
        OPDA.ownershipType,
        OPDA.heatingType,
        OPDA.centralHeatingFuelType,
        OPDA.offMainsDrainageSystemType,
        # Council-046 Q3b: the BASPI5 yes/no discriminators are bound to a
        # YesNo* scheme via the overlay `sh:in` (concept IRIs), so their range
        # is skos:Concept like every other coded value (uniform with
        # opda:riskIndicator) — NOT xsd:string. Operator-ratified 2026-06-16.
        OPDA.areBoundariesUniform,
        OPDA.hasBeenFlooded,
        OPDA.hasSmartHomeSystems,
        OPDA.hasSprayFoamInstalled,
        OPDA.hasValidGuaranteesOrWarranties,
        OPDA.isGroundRentPayable,
        OPDA.isInsured,
        OPDA.isLocatedOverCommercialPremises,
        OPDA.isSharedOwnership,
        OPDA.isSupplyMetered,
        OPDA.sellerContributesToServiceCharge,
        OPDA.soldWithVacantPossession,
    }
    for prop, domain, label, comment, definition in _g11_properties:
        if prop in _g11_scheme_valued:
            g.add((prop, RDF.type, OWL.ObjectProperty))
            g.add((prop, RDFS.domain, domain))
            g.add((prop, RDFS.range, SKOS.Concept))
        else:
            g.add((prop, RDF.type, OWL.DatatypeProperty))
            g.add((prop, RDFS.domain, domain))
            g.add((prop, RDFS.range, XSD.string))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(definition, lang="en")))
        g.add((prop, RDFS.isDefinedBy, module_iri))
        for src in _g2_sources.get(prop, (_ODR_0008_S5A,)):
            g.add((prop, DCTERMS.source, src))

    # ==== Category-G curated walk — batch 1: residential dimensions & ====
    # counts (ADR-0031 work-item 2). Each is a countable/measurable feature of
    # the physical Property with NO enumerated value-space, so a plain datatype
    # range per ODR-0008 §Q5a, flat per §Q6a (no rdfs:subPropertyOf). Each
    # carries its G2 schema-leaf-path dct:source array (§Q3a — one per overlay
    # occurrence). Coverage is tracked by ci-category-g-coverage; emission is
    # regenerated by `opda-gen emit`, never hand-edited (ci-byte-identity).
    # (length / width / roomName deferred — they bear on the held-as-live
    # opda:Room promotion, ODR-0008 §Q4a / ADR-0011.)
    _walk_b1: list[tuple[URIRef, URIRef, str, str, str, tuple[str, ...]]] = [
        (
            OPDA.bedrooms, XSD.integer, "bedrooms",
            "Number of bedrooms in the Property — a countable UFO Quality of "
            "the physical Property. Plain integer datatype (no enumerated "
            "value-space) per ODR-0008 §Q5a; flat per §Q6a.",
            "The count of bedrooms in a Property.",
            (
                "propertyPack.residentialPropertyFeatures.bedrooms",
                "valuationComparisonData.propertyDetails[].basicDetails.bedrooms",
            ),
        ),
        (
            OPDA.bathrooms, XSD.integer, "bathrooms",
            "Number of bathrooms in the Property — a countable UFO Quality. "
            "Plain integer datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The count of bathrooms in a Property.",
            (
                "propertyPack.residentialPropertyFeatures.bathrooms",
                "valuationComparisonData.propertyDetails[].basicDetails.bathrooms",
            ),
        ),
        (
            OPDA.receptions, XSD.integer, "receptions",
            "Number of reception rooms in the Property. Plain integer datatype "
            "per ODR-0008 §Q5a; flat per §Q6a.",
            "The count of reception rooms in a Property.",
            ("propertyPack.residentialPropertyFeatures.receptions",),
        ),
        (
            OPDA.kitchens, XSD.integer, "kitchens",
            "Number of kitchens in the Property. Plain integer datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            "The count of kitchens in a Property.",
            ("propertyPack.residentialPropertyFeatures.kitchens",),
        ),
        (
            OPDA.diningAreas, XSD.integer, "dining areas",
            "Number of dining areas in the Property. Plain integer datatype "
            "per ODR-0008 §Q5a; flat per §Q6a.",
            "The count of dining areas in a Property.",
            ("propertyPack.residentialPropertyFeatures.diningAreas",),
        ),
        (
            OPDA.numberOfFloors, XSD.integer, "number of floors",
            "Number of floors (storeys) the Property comprises. Plain integer "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The count of floors (storeys) a Property comprises.",
            ("propertyPack.buildInformation.building.numberOfFloors",),
        ),
        (
            OPDA.entranceFloor, XSD.integer, "entrance floor",
            "Floor (storey) on which the Property's entrance is located "
            "(0 = ground). Plain integer datatype per ODR-0008 §Q5a; flat "
            "per §Q6a.",
            "The storey on which a Property's entrance is located, counted "
            "from the ground floor as zero.",
            ("propertyPack.buildInformation.building.entranceFloor",),
        ),
        (
            OPDA.yearOfBuild, XSD.gYear, "year of build",
            "Calendar year the Property was built. xsd:gYear — the data "
            "dictionary types it as a year value; plain datatype per "
            "ODR-0008 §Q5a, flat per §Q6a.",
            "The calendar year in which a Property was built.",
            (
                "propertyPack.buildInformation.yearOfBuild",
                "valuationComparisonData.propertyDetails[].basicDetails."
                "buildInformation.yearOfBuild",
            ),
        ),
        (
            OPDA.area, XSD.decimal, "area",
            "Internal floor area of the Property — a measured UFO Quality (the "
            "unit of measure is carried alongside in the source structure). "
            "Plain decimal datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The measured internal floor area of a Property.",
            (
                "propertyPack.buildInformation.internalArea.area",
                "valuationComparisonData.propertyDetails[].basicDetails."
                "buildInformation.internalArea.area",
            ),
        ),
    ]
    for prop, rng, label, comment, definition, paths in _walk_b1:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, OPDA.Property))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(definition, lang="en")))
        g.add((prop, RDFS.isDefinedBy, module_iri))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    # ==== Category-G curated walk — Family A: Property physical / services ===
    # attributes (ADR-0031 work-item 2). Heating / electricity / water-&-
    # drainage / connectivity / parking / council-tax / location features of
    # the physical Property. Each is a flat datatype property on opda:Property
    # (the nearest existing Substance Kind) per ODR-0008 §Q5a, flat per §Q6a.
    # Range follows the data-dictionary `type`: string→xsd:string,
    # integer→xsd:integer, number→xsd:decimal, boolean→xsd:boolean; date-named
    # string leaves → xsd:date; year-named integer leaves → xsd:gYear; array
    # leaves are multi-valued xsd:string (each element a value). The two
    # meter-point identifiers (mpan / mprn) take xsd:string despite their
    # data-dictionary integer typing — they are fixed-width numeric identifiers
    # whose leading-zero significance the existing opda:hasUPRN string treatment
    # establishes as the corpus convention. `councilTaxBand` is an enum leaf:
    # its value-space is the already-emitted opda:CouncilTaxBandSchemeEW /
    # opda:CouncilTaxBandSchemeScotland (sh:in-restricted in the overlay
    # profile, mirroring opda:currentEnergyRating). Each carries its G2
    # schema-leaf-path dct:source array (§Q3a — one per overlay occurrence).
    _walk_a_property: list[
        tuple[URIRef, URIRef, str, str, str, tuple[str, ...]]
    ] = [
        (
            OPDA.councilTaxBand, XSD.string, "council tax band",
            "Council-tax valuation band of the Property per "
            "opda:CouncilTaxBandSchemeEW (A–H / Not banded) or "
            "opda:CouncilTaxBandSchemeScotland. UFO Quale-in-Region; "
            "regulator-sourced enum (VOA / Scottish Assessors). Constrained "
            "by SHACL sh:in to the scheme members in the overlay profile, "
            "mirroring opda:currentEnergyRating. Flat per §Q6a.",
            "The council-tax valuation band of a Property (A to H, or not "
            "banded) assigned by the Valuation Office Agency or the Scottish "
            "Assessors.",
            ("propertyPack.councilTax.councilTaxBand",),
        ),
        (
            OPDA.supplyClassification, XSD.string, "supply classification",
            "Classification of the Property's water supply (e.g. metered / "
            "unmetered / rateable). A UFO Quale-in-Region of the physical "
            "Property. Plain string datatype per ODR-0008 §Q5a (no "
            "ontology-governed enum in the data dictionary); flat per §Q6a.",
            "The classification of a Property's water supply, such as "
            "metered, unmetered, or rateable.",
            ("propertyPack.waterAndDrainage.water.supplyClassification",),
        ),
        (
            OPDA.centralHeatingInstalled, XSD.string, "central heating installed",
            "Central-heating installation indicator for the Property "
            "(typed as a string in the data dictionary — a Yes/No-style "
            "response). Plain string datatype per ODR-0008 §Q5a; flat per "
            "§Q6a. A physical-system attribute of the Property.",
            "An indicator of whether central heating is installed in a "
            "Property.",
            (
                "propertyPack.heating.heatingSystem.centralHeatingDetails."
                "centralHeatingInstalled",
            ),
        ),
        (
            OPDA.otherType, XSD.string, "other type",
            "Free-text classifier captured when the Property's built-form / "
            "property-type is 'Other' (the open-ended companion to "
            "opda:propertyType). Plain string datatype per ODR-0008 §Q5a; "
            "flat per §Q6a.",
            "The free-text property-type classifier captured for a Property "
            "whose property type is recorded as 'Other'.",
            ("propertyPack.buildInformation.building.otherType",),
        ),
        (
            OPDA.otherCentralHeatingFuelType, XSD.string,
            "other central heating fuel type",
            "Free-text fuel classifier captured when the central-heating "
            "fuel is 'Other' (the open-ended companion to "
            "opda:centralHeatingFuelType). Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            "The free-text fuel classifier captured for a Property whose "
            "central-heating fuel is recorded as 'Other'.",
            (
                "propertyPack.heating.heatingSystem.centralHeatingDetails."
                "centralHeatingFuel.otherCentralHeatingFuelType",
            ),
        ),
        (
            OPDA.otherHeatingFeatures, XSD.string, "other heating features",
            "Additional heating features of the Property (a multi-valued "
            "list in the data dictionary — each value an xsd:string). UFO "
            "Quality of the physical Property. Plain multi-valued string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "An additional heating feature of a Property beyond its primary "
            "heating system.",
            ("propertyPack.heating.otherHeatingFeatures",),
        ),
        (
            OPDA.accessibilityAndAdaptations, XSD.string,
            "accessibility and adaptations",
            "Accessibility features and adaptations of the Property (a "
            "multi-valued list — each value an xsd:string). UFO Quality of "
            "the physical Property. Plain multi-valued string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            "An accessibility feature or adaptation present in a Property.",
            ("propertyPack.typeOfConstruction.accessibilityAndAdaptations",),
        ),
        (
            OPDA.outsideAreas, XSD.string, "outside areas",
            "Outside areas of the Property — garden / yard / balcony / etc. "
            "(a multi-valued list — each value an xsd:string). UFO Quality "
            "of the physical Property. Plain multi-valued string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            "An outside area belonging to a Property, such as a garden, yard, "
            "or balcony.",
            ("propertyPack.residentialPropertyFeatures.outsideAreas",),
        ),
        (
            OPDA.parkingArrangements, XSD.string, "parking arrangements",
            "Parking arrangements for the Property — allocated / on-street / "
            "garage / etc. (a multi-valued list — each value an xsd:string). "
            "UFO Quality of the physical Property. Plain multi-valued string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "A parking arrangement available to a Property, such as "
            "allocated, on-street, or garage parking.",
            ("propertyPack.parking.parkingArrangements",),
        ),
        (
            OPDA.mpan, XSD.string, "MPAN",
            "Meter Point Administration Number — the electricity supply-point "
            "identifier for the Property. xsd:string (a fixed-width numeric "
            "identifier whose leading zeros are significant — the same "
            "convention opda:hasUPRN follows, NOT xsd:integer despite the "
            "data-dictionary typing). Flat per §Q6a.",
            "The Meter Point Administration Number identifying a Property's "
            "electricity supply point.",
            ("propertyPack.electricity.mainsElectricity.electricityMeter.mpan",),
        ),
        (
            OPDA.mprn, XSD.string, "MPRN",
            "Meter Point Reference Number — the gas supply-point identifier "
            "for the Property. xsd:string (a fixed-width numeric identifier, "
            "per the opda:hasUPRN / opda:mpan convention, NOT xsd:integer). "
            "Flat per §Q6a.",
            "The Meter Point Reference Number identifying a Property's gas "
            "supply point.",
            (
                "propertyPack.heating.heatingSystem.centralHeatingDetails."
                "centralHeatingFuel.gasMeter.mprn",
            ),
        ),
        (
            OPDA.numberOfPropertiesSharing, XSD.integer,
            "number of properties sharing",
            "Number of other properties sharing the Property's off-mains "
            "drainage system. Plain integer datatype per ODR-0008 §Q5a; flat "
            "per §Q6a.",
            "The count of other properties sharing a Property's off-mains "
            "drainage system.",
            (
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "offMainsDrainageSystem.otherConnectedProperties."
                "numberOfPropertiesSharing",
            ),
        ),
        (
            OPDA.distanceToNearestSewerageTreatment, XSD.string,
            "distance to nearest sewerage treatment",
            "Distance from the Property to the nearest sewerage-treatment "
            "works (typed as a string in the data dictionary — a free-form "
            "distance band). Plain string datatype per ODR-0008 §Q5a; flat "
            "per §Q6a.",
            "The distance from a Property to the nearest sewerage-treatment "
            "works.",
            (
                "propertyPack.waterAndDrainage.drainage."
                "distanceToNearestSewerageTreatment",
            ),
        ),
        (
            OPDA.publicSewerMapAttached, XSD.string, "public sewer map attached",
            "Whether the public-sewer map is attached for the Property "
            "(a Yes/No-style string response in the data dictionary). Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "An indicator of whether the public-sewer map is attached for a "
            "Property.",
            ("propertyPack.waterAndDrainage.maps.publicSewerMapAttached",),
        ),
        (
            OPDA.waterworksMapAttached, XSD.string, "waterworks map attached",
            "Whether the waterworks map is attached for the Property "
            "(a Yes/No-style string response). Plain string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            "An indicator of whether the waterworks map is attached for a "
            "Property.",
            ("propertyPack.waterAndDrainage.maps.waterworksMapAttached",),
        ),
        (
            OPDA.waterProvider, XSD.string, "water provider",
            "Name of the Property's water-supply provider. Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The name of the undertaker supplying water to a Property.",
            ("propertyPack.waterAndDrainage.charging.waterProvider",),
        ),
        (
            OPDA.sewerageProvider, XSD.string, "sewerage provider",
            "Name of the Property's sewerage provider. Plain string datatype "
            "per ODR-0008 §Q5a; flat per §Q6a.",
            "The name of the undertaker providing sewerage services to a "
            "Property.",
            ("propertyPack.waterAndDrainage.charging.sewerageProvider",),
        ),
        (
            OPDA.waterBills, XSD.string, "water bills",
            "Free-text water-billing description for the Property. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "A description of the water-billing arrangements for a Property.",
            ("propertyPack.waterAndDrainage.charging.waterBills",),
        ),
        (
            OPDA.sewerageBills, XSD.string, "sewerage bills",
            "Free-text sewerage-billing description for the Property. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "A description of the sewerage-billing arrangements for a "
            "Property.",
            ("propertyPack.waterAndDrainage.charging.sewerageBills",),
        ),
        (
            OPDA.currentChargingBasis, XSD.string, "current charging basis",
            "Current basis on which the Property's water/sewerage is charged. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The basis on which a Property's water and sewerage charges are "
            "currently levied.",
            ("propertyPack.waterAndDrainage.charging.currentChargingBasis",),
        ),
        (
            OPDA.consequentialChargingBasis, XSD.string,
            "consequential charging basis",
            "Charging basis that would apply consequentially (e.g. on a "
            "change of circumstances) for the Property's water/sewerage. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The basis on which a Property's water and sewerage charges would "
            "be levied consequentially, such as following a change of "
            "circumstances.",
            ("propertyPack.waterAndDrainage.charging.consequentialChargingBasis",),
        ),
        (
            OPDA.supplier, XSD.string, "supplier",
            "Name of the supplier for a Property utility / service "
            "(electricity, gas-fuel, heat-pump, solar, water, drainage, "
            "telephone, cable/satellite TV). ONE shared supplier-name "
            "property reused across the utility blocks (the data dictionary "
            "repeats the same `supplier` leaf under each). Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The name of the supplier of a Property utility or service, such "
            "as electricity, gas, water, drainage, telephone, or television.",
            (
                "propertyPack.connectivity.cableSatelliteTV.supplier",
                "propertyPack.connectivity.telephone.supplier",
                "propertyPack.electricity.heatPump.supplier",
                "propertyPack.electricity.mainsElectricity.supplier",
                "propertyPack.electricity.otherSources.supplier",
                "propertyPack.electricity.solarPanels.supplier",
                "propertyPack.heating.heatingSystem.centralHeatingDetails."
                "centralHeatingFuel.supplier",
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage.supplier",
                "propertyPack.waterAndDrainage.water.mainsWater.supplier",
            ),
        ),
        (
            OPDA.logbookProvider, XSD.string, "logbook provider",
            "Name of the digital-property-logbook provider for the Property. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The name of the provider of a Property's digital property "
            "logbook.",
            (
                "propertyPack.completionAndMoving.digitalPropertyLogbook."
                "logbookProvider",
            ),
        ),
        (
            OPDA.location, XSD.string, "location",
            "Physical-location description of a Property fixture or "
            "measurement point — electricity / gas / water meter, stopcock, "
            "or survey/charge locus (typed as a free-form string in the data "
            "dictionary). ONE shared location-description property reused "
            "across those points. Plain string datatype per ODR-0008 §Q5a; "
            "flat per §Q6a. (FLAG: `propertyPack.location` is itself a "
            "structured geo block, not this leaf-level string; the structured "
            "locator is opda:Address territory — ODR-0015 — and is out of "
            "this leaf's scope.)",
            "A free-text description of the physical position of a Property "
            "fixture or measurement point, such as a meter or stopcock.",
            (
                "propertyPack.electricity.mainsElectricity.electricityMeter."
                "location",
                "propertyPack.heating.heatingSystem.centralHeatingDetails."
                "centralHeatingFuel.gasMeter.location",
                "propertyPack.waterAndDrainage.water.mainsWater.stopcock.location",
                "propertyPack.waterAndDrainage.water.mainsWater.waterMeter."
                "location",
            ),
        ),
        (
            OPDA.heading, XSD.decimal, "heading",
            "Google Street View point-of-view compass heading (degrees) for "
            "the Property's map locator. xsd:decimal — a numeric camera "
            "parameter, NOT a free-text tail (FLAG: deviates from the generic "
            "free-text-collapse expectation; the data dictionary types it as "
            "a number). Flat per §Q6a.",
            "The compass heading, in degrees, of the Google Street View "
            "camera position for a Property's map locator.",
            ("propertyPack.location.googleStreetViewPOV.heading",),
        ),
        (
            OPDA.pitch, XSD.decimal, "pitch",
            "Google Street View point-of-view pitch (degrees) for the "
            "Property's map locator. xsd:decimal numeric camera parameter. "
            "Flat per §Q6a.",
            "The vertical pitch, in degrees, of the Google Street View "
            "camera position for a Property's map locator.",
            ("propertyPack.location.googleStreetViewPOV.pitch",),
        ),
        (
            OPDA.zoom, XSD.decimal, "zoom",
            "Google Street View point-of-view zoom level for the Property's "
            "map locator. xsd:decimal numeric camera parameter. Flat per "
            "§Q6a.",
            "The zoom level of the Google Street View camera position for a "
            "Property's map locator.",
            ("propertyPack.location.googleStreetViewPOV.zoom",),
        ),
        (
            OPDA.dateInstalled, XSD.date, "date installed",
            "Date a Property system was installed (heat pump / off-mains "
            "drainage system). xsd:date (a date-valued string in the data "
            "dictionary). Flat per §Q6a.",
            "The date on which a Property system, such as a heat pump or off-"
            "mains drainage system, was installed.",
            (
                "propertyPack.electricity.heatPump.dateInstalled",
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "offMainsDrainageSystem.dateInstalled",
            ),
        ),
        (
            OPDA.dateToBeConnected, XSD.date, "date to be connected",
            "Expected connection date for a not-yet-connected Property "
            "utility / service. ONE shared date property reused across the "
            "utility blocks. xsd:date. Flat per §Q6a.",
            "The expected date on which a not-yet-connected Property utility "
            "or service is to be connected.",
            (
                "propertyPack.connectivity.cableSatelliteTV.dateToBeConnected",
                "propertyPack.connectivity.telephone.dateToBeConnected",
                "propertyPack.electricity.heatPump.dateToBeConnected",
                "propertyPack.electricity.mainsElectricity.dateToBeConnected",
                "propertyPack.electricity.otherSources.dateToBeConnected",
                "propertyPack.electricity.solarPanels.dateToBeConnected",
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "dateToBeConnected",
                "propertyPack.waterAndDrainage.drainage."
                "mainsSurfaceWaterDrainage.dateToBeConnected",
                "propertyPack.waterAndDrainage.water.mainsWater.dateToBeConnected",
            ),
        ),
        (
            OPDA.dateLastEmptied, XSD.date, "date last emptied",
            "Date the Property's off-mains drainage system was last emptied. "
            "xsd:date. Flat per §Q6a.",
            "The date on which a Property's off-mains drainage system was "
            "last emptied.",
            (
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "offMainsDrainageSystem.dateLastEmptied",
            ),
        ),
        (
            OPDA.dateLastServiced, XSD.date, "date last serviced",
            "Date the Property's off-mains drainage system was last serviced. "
            "xsd:date. Flat per §Q6a.",
            "The date on which a Property's off-mains drainage system was "
            "last serviced.",
            (
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "offMainsDrainageSystem.dateLastServiced",
            ),
        ),
        (
            OPDA.dateReplaced, XSD.date, "date replaced",
            "Date the Property's off-mains drainage system was last replaced. "
            "xsd:date. Flat per §Q6a.",
            "The date on which a Property's off-mains drainage system was "
            "last replaced.",
            (
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "offMainsDrainageSystem.dateReplaced",
            ),
        ),
        (
            OPDA.heatingLastServicedDate, XSD.date, "heating last serviced date",
            "Date the Property's central-heating system was last serviced. "
            "xsd:date. Flat per §Q6a.",
            "The date on which a Property's central-heating system was last "
            "serviced.",
            (
                "propertyPack.heating.heatingSystem.centralHeatingDetails."
                "heatingLastServicedDate",
            ),
        ),
        (
            OPDA.lastMaintained, XSD.date, "last maintained",
            "Date the Property's solar-panel system was last maintained. "
            "xsd:date. Flat per §Q6a.",
            "The date on which a Property's solar-panel system was last "
            "maintained.",
            ("propertyPack.electricity.solarPanels.lastMaintained",),
        ),
        (
            OPDA.yearInstalled, XSD.gYear, "year installed",
            "Calendar year the Property's solar-panel system was installed. "
            "xsd:gYear (a year value in the data dictionary). Flat per §Q6a.",
            "The calendar year in which a Property's solar-panel system was "
            "installed.",
            ("propertyPack.electricity.solarPanels.yearInstalled",),
        ),
        (
            OPDA.yearTested, XSD.gYear, "year tested",
            "Calendar year the Property's electrical installation was last "
            "tested by a qualified electrician. xsd:gYear. Flat per §Q6a.",
            "The calendar year in which a Property's electrical installation "
            "was last tested by a qualified electrician.",
            (
                "propertyPack.electricalWorks.testedByQualifiedElectrician."
                "yearTested",
            ),
        ),
        (
            OPDA.yearWorkCarriedOut, XSD.gYear, "year work carried out",
            "Calendar year electrical work was carried out on the Property "
            "(since 2005). xsd:gYear. Flat per §Q6a.",
            "The calendar year in which electrical work was carried out on a "
            "Property.",
            (
                "propertyPack.electricalWorks.electricalWorkSince2005."
                "yearWorkCarriedOut",
            ),
        ),
        (
            OPDA.yearCompleted, XSD.gYear, "year completed",
            "Calendar year a Property alteration / change was completed "
            "(change of use, conservatory addition, window replacement since "
            "2002). xsd:gYear. Flat per §Q6a.",
            "The calendar year in which an alteration or change to a Property, "
            "such as a change of use, conservatory addition, or window "
            "replacement, was completed.",
            (
                "propertyPack.alterationsAndChanges.changeOfUse.yearCompleted",
                "propertyPack.alterationsAndChanges.hasAddedConservatory."
                "yearCompleted",
                "propertyPack.alterationsAndChanges.windowReplacementsSince2002."
                "yearCompleted",
            ),
        ),
        (
            OPDA.handoverOnCompletion, XSD.boolean, "handover on completion",
            "Whether the Property's smart-home systems will be handed over on "
            "completion. xsd:boolean. Flat per §Q6a.",
            "A boolean recording whether a Property's smart-home systems will "
            "be handed over to the buyer on completion.",
            ("propertyPack.smartHomeSystems.handoverOnCompletion",),
        ),
        (
            OPDA.willHandoverLogbook, XSD.boolean, "will handover logbook",
            "Whether the seller will hand over the digital property logbook "
            "on completion. xsd:boolean. Flat per §Q6a.",
            "A boolean recording whether the seller will hand over a "
            "Property's digital property logbook on completion.",
            (
                "propertyPack.completionAndMoving.digitalPropertyLogbook."
                "willHandoverLogbook",
            ),
        ),
        (
            OPDA.abilityToResideAtProperty, XSD.string,
            "ability to reside at property",
            "Building-safety statement on whether occupiers can reside at the "
            "Property given any identified safety issues (typed as a string "
            "in the data dictionary). A physical-safety attribute of the "
            "Property. Plain string datatype per ODR-0008 §Q5a; flat per "
            "§Q6a.",
            "A building-safety statement on whether occupiers can reside at a "
            "Property given any identified safety issues.",
            (
                "propertyPack.typeOfConstruction.buildingSafety."
                "abilityToResideAtProperty",
            ),
        ),
        (
            OPDA.typeOfFlooding, XSD.string, "type of flooding",
            "Type(s) of historical flooding the Property has experienced "
            "(a multi-valued list — each value an xsd:string). UFO Quality of "
            "the physical Property. Plain multi-valued string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a. (The per-peril flood RISK ASSESSMENT "
            "is opda:RiskAssessment territory; this is the factual "
            "historical-flooding-type attribute.)",
            "A type of historical flooding a Property has experienced, such "
            "as river, surface-water, or groundwater flooding.",
            ("propertyPack.environmentalIssues.flooding.historicalFlooding."
             "typeOfFlooding",),
        ),
    ]
    for prop, rng, label, comment, definition, paths in _walk_a_property:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, OPDA.Property))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(definition, lang="en")))
        g.add((prop, RDFS.isDefinedBy, module_iri))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    # --- opda:titleNumber — RegisteredTitle identifier (ODR-0024 R8) -----
    # ODR-0024 R8 (council session-028 Q6): a title number identifies the HMLR
    # REGISTER RECORD, not the legal estate — so rdfs:domain is
    # opda:RegisteredTitle (whose own IC is "title-number lineage + registry-
    # event history"), NOT opda:LegalEstate (corrected from the ADR-0031 walk's
    # estate-side placement). Reach the estate via the existing
    # opda:recordsEstate join (RegisteredTitle -> LegalEstate). Allemang's
    # estate-side-cited-identifier reading is recorded as dissent; if wanted, a
    # separate co-reference predicate — never an overload of the identifier's
    # domain. Plain string datatype per ODR-0008 §Q5a; flat per §Q6a. The three
    # G2 schema-leaf-paths (§Q3a) include the unambiguous register-record path
    # `…registerExtract.ocSummaryData.title.titleNumber`.
    g.add((OPDA.titleNumber, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.titleNumber, RDFS.domain, OPDA.RegisteredTitle))
    g.add((OPDA.titleNumber, RDFS.range, XSD.string))
    g.add((OPDA.titleNumber, RDFS.label, Literal("title number", lang="en")))
    g.add((OPDA.titleNumber, RDFS.comment, Literal(
        "HMLR title number — identifies the registered-title RECORD "
        "(opda:RegisteredTitle), not the legal estate (ODR-0024 R8 / "
        "session-028 Q6). The estate has no title number; the record does — "
        "reach the estate via opda:recordsEstate. Plain string datatype per "
        "ODR-0008 §Q5a; flat per §Q6a.",
        lang="en",
    )))
    g.add((OPDA.titleNumber, SKOS.definition, Literal(
        "The HM Land Registry title number identifying a RegisteredTitle "
        "record (not the legal estate it documents), unique within the "
        "register.",
        lang="en",
    )))
    g.add((OPDA.titleNumber, RDFS.isDefinedBy, module_iri))
    for _p in (
        "propertyPack.ownership.ownershipsToBeTransferred[].titleNumber",
        "propertyPack.titlesToBeSold[].registerExtract.ocSummaryData."
        "title.titleNumber",
        "propertyPack.titlesToBeSold[].titleNumber",
    ):
        g.add((OPDA.titleNumber, DCTERMS.source, _dd_source(_p)))

    # ==== Category-G curated walk — Family B: LegalEstate tenure / lease ====
    # / ground-rent / service-charge / title attributes (ADR-0031 work-item 2).
    # Each is a flat datatype property on opda:LegalEstate (the rights-bundle
    # Substance Kind these leasehold / managed-freehold / commonhold / title
    # attributes characterise) per ODR-0008 §Q5a, flat per §Q6a. Range follows
    # the data-dictionary `type` (string→xsd:string, integer→xsd:integer,
    # number→xsd:decimal); period-boundary date strings → xsd:date; the
    # decorated-period `year` → xsd:gYear. Monetary leaves (ground rent, service
    # charges, deed costs, fees, reserve-fund contributions) are NOT here — they
    # COLLAPSE to opda:price (ODR-0022 §4; inputs/category_g_curation). Each
    # carries its G2 schema-leaf-path dct:source array (§Q3a).
    _walk_b_estate: list[
        tuple[URIRef, URIRef, str, str, str, tuple[str, ...]]
    ] = [
        (
            OPDA.groundRentFrequency, XSD.string, "ground rent frequency",
            "Frequency at which ground rent is payable on the leasehold "
            "LegalEstate (typed as a string in the data dictionary — a "
            "free-form frequency label). Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            "The frequency at which ground rent is payable on a leasehold "
            "LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.groundRent.groundRentFrequency",
            ),
        ),
        (
            OPDA.rentReviewFrequency, XSD.string, "rent review frequency",
            "Frequency at which ground rent is reviewed on the leasehold "
            "LegalEstate. Plain string datatype per ODR-0008 §Q5a; flat per "
            "§Q6a.",
            "The frequency at which ground rent is reviewed on a leasehold "
            "LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.groundRent.rentSubjectToIncrease."
                "rentReviewFrequency",
            ),
        ),
        (
            OPDA.rentIncreaseCalculated, XSD.string, "rent increase calculated",
            "How a ground-rent increase is calculated on the leasehold "
            "LegalEstate (e.g. RPI-linked, doubling). Plain string datatype "
            "per ODR-0008 §Q5a; flat per §Q6a.",
            "How a ground-rent increase is calculated on a leasehold "
            "LegalEstate, such as by RPI-linking or doubling.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.groundRent.rentSubjectToIncrease."
                "rentIncreaseCalculated",
            ),
        ),
        (
            OPDA.hasFixedRentcharge, XSD.string, "has fixed rentcharge",
            "Whether the managed-freehold / commonhold LegalEstate carries a "
            "fixed rentcharge (a Yes/No-style string response). Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "An indicator of whether a managed-freehold or commonhold "
            "LegalEstate carries a fixed rentcharge.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.serviceCharge."
                "hasFixedRentcharge",
            ),
        ),
        (
            OPDA.lengthOfLeaseInYears, XSD.integer, "length of lease in years",
            "Length of the leasehold term in years (the granted term). Plain "
            "integer datatype per ODR-0008 §Q5a; flat per §Q6a. Complements "
            "opda:LeaseTerm (the OWL-Time interval) with the headline "
            "term-length figure.",
            "The length in years of the term granted on a leasehold "
            "LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.leaseTerm.lengthOfLeaseInYears",
            ),
        ),
        (
            OPDA.startYearOfLease, XSD.gYear, "start year of lease",
            "Calendar year the leasehold term commenced. xsd:gYear (a year "
            "value in the data dictionary). Flat per §Q6a.",
            "The calendar year in which the term of a leasehold LegalEstate "
            "commenced.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.leaseTerm.startYearOfLease",
            ),
        ),
        (
            OPDA.sharedOwnershipPercentage, XSD.decimal,
            "shared ownership percentage",
            "Percentage of the Property owned under a shared-ownership "
            "leasehold LegalEstate. xsd:decimal (a number in the data "
            "dictionary). Flat per §Q6a.",
            "The percentage of a Property owned under a shared-ownership "
            "leasehold LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.sharedOwnership.sharedOwnershipPercentage",
            ),
        ),
        (
            OPDA.otherPropertiesInManagedArea, XSD.decimal,
            "other properties in managed area",
            "Count of other properties in the managed area sharing the "
            "leasehold LegalEstate's service arrangements. xsd:decimal (typed "
            "as a number in the data dictionary). Flat per §Q6a.",
            "The count of other properties in the managed area sharing a "
            "leasehold LegalEstate's service arrangements.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.general.otherPropertiesInManagedArea",
            ),
        ),
        (
            OPDA.propertiesContributingToMaintenanceOfManagedArea, XSD.decimal,
            "properties contributing to maintenance of managed area",
            "Count of properties contributing to maintenance of the managed "
            "area for the leasehold LegalEstate. xsd:decimal (a number in the "
            "data dictionary). Flat per §Q6a.",
            "The count of properties contributing to maintenance of the "
            "managed area for a leasehold LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge."
                "propertiesContributingToMaintenanceOfManagedArea",
            ),
        ),
        (
            OPDA.buildingsReinstatementCostAssessment, XSD.string,
            "buildings reinstatement cost assessment",
            "Buildings reinstatement-cost-assessment statement for the "
            "leasehold LegalEstate's buildings insurance (typed as a string "
            "in the data dictionary). Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            "A buildings reinstatement-cost-assessment statement for a "
            "leasehold LegalEstate's buildings insurance.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.buildingsInsurance."
                "buildingsReinstatementCostAssessment",
            ),
        ),
        (
            OPDA.titleExtents, XSD.string, "title extents",
            "Statement of the extents covered by a title to be sold. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "A statement of the extents covered by a title to be sold.",
            ("propertyPack.titlesToBeSold[].titleExtents",),
        ),
        (
            OPDA.titlePropertyDescription, XSD.string,
            "title property description",
            "The property description as recorded on the title for the "
            "LegalEstate to be transferred. Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            "The property description recorded on the title for a LegalEstate "
            "to be transferred.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "titlePropertyDescription",
            ),
        ),
        (
            OPDA.otherOwnershipDetails, XSD.string, "other ownership details",
            "Free-text ownership details captured when the ownership type is "
            "'Other' for the LegalEstate. Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            "The free-text ownership details captured for a LegalEstate whose "
            "ownership type is recorded as 'Other'.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "otherOwnershipDetails",
            ),
        ),
        (
            OPDA.requirements, XSD.string, "requirements",
            "Requirements stated for a licence-to-assign on the leasehold "
            "LegalEstate. Plain string datatype per ODR-0008 §Q5a; flat per "
            "§Q6a.",
            "The requirements stated for a licence to assign a leasehold "
            "LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.transferAndRegistration."
                "licenceToAssignRequired.requirements",
            ),
        ),
        (
            OPDA.procedureForObtainingCertificate, XSD.string,
            "procedure for obtaining certificate",
            "Procedure for obtaining a transfer/registration certificate on "
            "the leasehold / managed-freehold LegalEstate. Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The procedure for obtaining a transfer or registration "
            "certificate on a leasehold or managed-freehold LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.transferAndRegistration."
                "procedureForObtainingCertificate",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.transferAndRegistration."
                "procedureForObtainingCertificate",
            ),
        ),
        (
            OPDA.personWhoDealsWithTheDeedOfCovenant, XSD.string,
            "person who deals with the deed of covenant",
            "Name/role of the person who deals with the deed of covenant for "
            "the leasehold / managed-freehold LegalEstate. Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The name or role of the person who deals with the deed of "
            "covenant on a leasehold or managed-freehold LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.transferAndRegistration."
                "deedOfCovenantRequired.personWhoDealsWithTheDeedOfCovenant",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.transferAndRegistration."
                "deedOfCovenantRequired.personWhoDealsWithTheDeedOfCovenant",
            ),
        ),
        (
            OPDA["from"], XSD.date, "from",
            "Start date of a demand / decoration period on the leasehold / "
            "managed-freehold LegalEstate (ground-rent, service-charge, or "
            "buildings-insurance last-demand period; service-charge "
            "last-decorated period). xsd:date. ONE shared period-start "
            "property reused across those periods; flat per §Q6a. (FLAG: "
            "`from` is a generic period-boundary name; reused across the "
            "estate's recurring date-range blocks rather than minted per "
            "block.)",
            "The start date of a demand or decoration period on a leasehold "
            "or managed-freehold LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.buildingsInsurance.lastDemandPeriod.from",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.groundRent.lastDemandPeriod.from",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.lastDecoratedPeriod."
                "externally.from",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.lastDecoratedPeriod."
                "internally.from",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.lastDemandPeriod.from",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.insurance."
                "managedAreaInsured.lastDemandPeriod.from",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.serviceCharge."
                "lastDecoratedPeriod.externally.from",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.serviceCharge."
                "lastDecoratedPeriod.internally.from",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.serviceCharge."
                "lastDemandPeriod.from",
            ),
        ),
        (
            OPDA.to, XSD.date, "to",
            "End date of a demand / decoration period on the leasehold / "
            "managed-freehold LegalEstate (mirror of opda:from). xsd:date. "
            "ONE shared period-end property reused across those periods; flat "
            "per §Q6a. (FLAG: `to` is a generic period-boundary name; reused "
            "across the estate's recurring date-range blocks.)",
            "The end date of a demand or decoration period on a leasehold or "
            "managed-freehold LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.buildingsInsurance.lastDemandPeriod.to",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.groundRent.lastDemandPeriod.to",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.lastDecoratedPeriod."
                "externally.to",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.lastDecoratedPeriod."
                "internally.to",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.lastDemandPeriod.to",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.insurance."
                "managedAreaInsured.lastDemandPeriod.to",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.serviceCharge."
                "lastDecoratedPeriod.externally.to",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.serviceCharge."
                "lastDecoratedPeriod.internally.to",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.serviceCharge."
                "lastDemandPeriod.to",
            ),
        ),
        (
            OPDA.year, XSD.gYear, "year",
            "Calendar year of a service-charge last-decorated period "
            "(externally / internally) on the leasehold LegalEstate. "
            "xsd:gYear. Flat per §Q6a.",
            "The calendar year of a service-charge last-decorated period on a "
            "leasehold LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.lastDecoratedPeriod."
                "externally.year",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.lastDecoratedPeriod."
                "internally.year",
            ),
        ),
        (
            OPDA.adHocExpenses, XSD.string, "ad hoc expenses",
            "Statement of ad-hoc service-charge expenses on the leasehold "
            "LegalEstate (typed as a string in the data dictionary). Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "A statement of ad-hoc service-charge expenses on a leasehold "
            "LegalEstate.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.adHocExpenses",
            ),
        ),
    ]
    for prop, rng, label, comment, definition, paths in _walk_b_estate:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, OPDA.LegalEstate))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(definition, lang="en")))
        g.add((prop, RDFS.isDefinedBy, module_iri))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    # opda:DescriptiveProperty membership (ODR-0008 §Q7a) — see
    # DESCRIPTIVE_PROPERTIES above for scope/exclusion rationale.
    for prop in DESCRIPTIVE_PROPERTIES:
        g.add((prop, RDF.type, OPDA.DescriptiveProperty))

    return g
