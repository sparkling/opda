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


OPDA = Namespace("https://w3id.org/opda/#")
VCARD = Namespace("http://www.w3.org/2006/vcard/ns#")
PROV = Namespace("http://www.w3.org/ns/prov#")
TIME = Namespace("http://www.w3.org/2006/time#")


# Data-dictionary schema-leaf-path dct:source (ODR-0022 G2). Mirrors the
# `_dd_source` helper in emitters/vocabularies.py (kept local so this module
# carries no cross-emitter import for a one-liner): the per-property G2 IRI is
# `<https://w3id.org/opda/data-dictionary#<leaf_path>>`, the same form the SKOS
# member sources use, with array `[]` markers preserved one-to-one and
# whitespace percent-encoded.
def _dd_source(leaf_path: str) -> URIRef:
    """Return the data-dictionary schema-leaf-path `dct:source` IRI (G2)."""
    safe = leaf_path.replace(" ", "%20").replace("'", "%27")
    return URIRef(f"https://w3id.org/opda/data-dictionary#{safe}")


# ADR-0031 work-item 1 — the six G11∩candidate-G overlap leaves carry their
# G2 schema-leaf-path `dct:source` (the canonical data-dictionary leaf), per
# the ODR-0008 §Q1a reconciliation register (dispositions applied 2026-05-31).
# `propertyType` is a C+G spanning leaf → an array of two paths (§Q3a). These
# tighten the prior generic `<ODR-0008#section-Q5a>` anchor to the leaf-path.
_G2_BUILT_FORM = _dd_source("propertyPack.buildInformation.building.builtForm")
_G2_CURRENT_ENERGY_RATING = _dd_source(
    "propertyPack.energyEfficiency.certificate.currentEnergyRating"
)
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
_ODR_0005_S2A = URIRef("https://w3id.org/opda/odr/ODR-0005#section-2a")
_ODR_0005_S3B = URIRef("https://w3id.org/opda/odr/ODR-0005#section-3b")
_ODR_0005_S3C = URIRef("https://w3id.org/opda/odr/ODR-0005#section-3c")
_ODR_0005_S6A = URIRef("https://w3id.org/opda/odr/ODR-0005#section-6a")
_ODR_0005_S6B = URIRef("https://w3id.org/opda/odr/ODR-0005#section-6b")
_ODR_0007_S5 = URIRef("https://w3id.org/opda/odr/ODR-0007#section-Q5-lease-term")
_ODR_0008_S5A = URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q5a")
_ODR_0015_S2A = URIRef("https://w3id.org/opda/odr/ODR-0015#section-2a")
_ODR_0015_S3A = URIRef("https://w3id.org/opda/odr/ODR-0015#section-3a")


# Module catalogue — classes + properties this module mints. Tests
# introspect this to verify §Confirmation #6 coverage without re-parsing.
CLASSES = (
    OPDA.Address,
    OPDA.LeaseExtensionEvent,
    OPDA.LeaseTerm,
    OPDA.LegalEstate,
    OPDA.Property,
    OPDA.RegisteredTitle,
    OPDA.UPRNSuccessionEvent,
)

OBJECT_PROPERTIES = (
    OPDA.hasAddress,
    OPDA.identifiesSameProperty,
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
    module_iri = URIRef("https://w3id.org/opda/property/")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title, Literal("OPDA Property Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/1.0.0/")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/property/1.0.0/")))

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
    g.add((OPDA.Address, DCTERMS.source, _ODR_0015_S2A))

    # --- opda:UPRNSuccessionEvent — provenance event (ODR-0005 §6a) -----
    g.add((OPDA.UPRNSuccessionEvent, RDF.type, OWL.Class))
    g.add((OPDA.UPRNSuccessionEvent, RDFS.subClassOf, PROV.Activity))
    g.add((OPDA.UPRNSuccessionEvent, RDFS.label,
           Literal("UPRN Succession Event", lang="en")))
    g.add((OPDA.UPRNSuccessionEvent, RDFS.comment, Literal(
        "Reified PROV-O activity recording an administrative re-numbering "
        "of UPRN for a single physical Property (the Property's identity "
        "PERSISTS through UPRN succession per ODR-0005 Rule 6). Canonical "
        "succession form per Gandon W3C-side recommendation (S005 Q4) — "
        "own URI, dereferenceable identity, audit trail. Coexists with "
        "the denormalised opda:previousUPRN literal-pair convenience "
        "(authoritative form: this reified event).",
        lang="en",
    )))
    g.add((OPDA.UPRNSuccessionEvent, SKOS.scopeNote, Literal(
        "UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7 — perdurant). "
        "DOLCE: Achievement / Accomplishment (Masolo et al. 2003 D18 §4.4 "
        "— here an Achievement: instantaneous administrative re-issuance).",
        lang="en",
    )))
    g.add((OPDA.UPRNSuccessionEvent, DCTERMS.source, _ODR_0005_S6A))

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
    g.add((OPDA.LeaseTerm, DCTERMS.source, _ODR_0007_S5))

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
    g.add((OPDA.LeaseExtensionEvent, DCTERMS.source, _ODR_0005_S3B))

    # --- DatatypeProperty: opda:addressVariant (ODR-0015 §Rule 6) -------
    g.add((OPDA.addressVariant, RDF.type, OWL.DatatypeProperty))
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
    g.add((OPDA.addressVariant, DCTERMS.source,
           URIRef("https://w3id.org/opda/odr/ODR-0015#section-Rule-6")))

    # --- DatatypeProperty: opda:builtForm (ODR-0008 §Q5a) ---------------
    # ADR-0031 register: STANDS on opda:Property; Quale-in-Region; flat
    # (§Q6a — no named consumer query); range opda:BuiltFormScheme; dct:source
    # tightened to the G2 schema-leaf-path.
    g.add((OPDA.builtForm, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.builtForm, RDFS.domain, OPDA.Property))
    g.add((OPDA.builtForm, RDFS.range, XSD.string))
    g.add((OPDA.builtForm, RDFS.label, Literal("built form", lang="en")))
    g.add((OPDA.builtForm, RDFS.comment, Literal(
        "Property built-form classification per opda:BuiltFormScheme "
        "(SKOS scheme in opda-vocabularies.ttl). UFO Quale-in-Region. "
        "Constrained by SHACL sh:in to the BuiltForm scheme members "
        "(ADR-0012 emits the constraint).",
        lang="en",
    )))
    g.add((OPDA.builtForm, DCTERMS.source, _G2_BUILT_FORM))

    # --- DatatypeProperty: opda:currentEnergyRating (ODR-0008 §Q5a) -----
    # ADR-0031 register: STANDS on opda:Property; Quale-in-Region (EPC band
    # A–G, DESNZ-governed); range opda:CurrentEnergyRatingScheme; dct:source
    # tightened to the G2 schema-leaf-path.
    g.add((OPDA.currentEnergyRating, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.currentEnergyRating, RDFS.domain, OPDA.Property))
    g.add((OPDA.currentEnergyRating, RDFS.range, XSD.string))
    g.add((OPDA.currentEnergyRating, RDFS.label,
           Literal("current energy rating", lang="en")))
    g.add((OPDA.currentEnergyRating, RDFS.comment, Literal(
        "EPC current energy rating band (A–G) per "
        "opda:CurrentEnergyRatingScheme. UFO Quale-in-Region. Regulator-"
        "sourced enum (DESNZ-governed). Constrained by SHACL sh:in to "
        "the scheme members (ADR-0012 emits the constraint).",
        lang="en",
    )))
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
    g.add((OPDA.hasUPRN, DCTERMS.source, _ODR_0005_S6A))

    # --- DatatypeProperty: opda:tenureKind (ODR-0008 §Q5a) ---------------
    g.add((OPDA.tenureKind, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.tenureKind, RDFS.domain, OPDA.LegalEstate))
    g.add((OPDA.tenureKind, RDFS.range, XSD.string))
    g.add((OPDA.tenureKind, RDFS.label, Literal("tenure kind", lang="en")))
    g.add((OPDA.tenureKind, RDFS.comment, Literal(
        "Tenure classification per opda:TenureKindScheme — Substance "
        "Kind label (Freehold / Leasehold / Commonhold). Each member "
        "binds to its corresponding OWL sub-class via skos:exactMatch "
        "per ODR-0011 §8a (NEVER owl:sameAs per ODR-0005 Anti-pattern §5).",
        lang="en",
    )))
    g.add((OPDA.tenureKind, DCTERMS.source, _ODR_0008_S5A))

    # --- ObjectProperty: opda:hasAddress (ODR-0015 §3a; ODR-0005 §6b) ---
    g.add((OPDA.hasAddress, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasAddress, RDFS.domain, OPDA.Property))
    g.add((OPDA.hasAddress, RDFS.range, OPDA.Address))
    g.add((OPDA.hasAddress, RDFS.label, Literal("has address", lang="en")))
    g.add((OPDA.hasAddress, RDFS.comment, Literal(
        "Canonical Property → Address join predicate. Per ODR-0005 §6b "
        "pre-commitment and ODR-0015 §3a, opda:hasAddress is uniform "
        "across variants — one Property may hasAddress multiple Address "
        "instances differing on opda:addressVariant (title / marketing / "
        "inspire).",
        lang="en",
    )))
    g.add((OPDA.hasAddress, DCTERMS.source, _ODR_0015_S3A))

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
    g.add((OPDA.recordsEstate, DCTERMS.source, _ODR_0005_S3C))

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
        ),
        (
            OPDA.ownershipType,
            OPDA.LegalEstate,
            "ownership type",
            "Ownership-type classification per opda:OwnershipTypeScheme "
            "(Freehold / Leasehold / Commonhold / Managed Freehold / "
            "Other). UFO Quale-in-Region of LegalEstate. Constrained by "
            "SHACL sh:in to the scheme members in the BASPI5 profile.",
        ),
        (
            OPDA.heatingType,
            OPDA.Property,
            "heating type",
            "Property heating-system arrangement per opda:HeatingTypeScheme "
            "(Central heating / Communal heating system / Room heaters "
            "only / None). UFO Quale-in-Region. Constrained by SHACL "
            "sh:in to the scheme members in the BASPI5 profile.",
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
        ),
        (
            OPDA.offMainsDrainageSystemType,
            OPDA.Property,
            "off-mains drainage system type",
            "Off-mains drainage classification per "
            "opda:OffMainsDrainageSystemTypeScheme (SuDS / Septic tank / "
            "Cesspit / Sewerage treatment plant / Other / Not known). "
            "Applies when not connected to mains sewerage.",
        ),
        (
            OPDA.areBoundariesUniform,
            OPDA.Property,
            "are boundaries uniform",
            "Yes/No discriminator: are the Property's legal and physical "
            "boundaries uniform (i.e. do they match)? Bound to "
            "opda:YesNoScheme via SHACL sh:in in the BASPI5 profile.",
        ),
        (
            OPDA.isLocatedOverCommercialPremises,
            OPDA.Property,
            "is located over commercial premises",
            "Yes/No discriminator: is the Property located over "
            "commercial premises? Applies to Flats and Maisonettes per "
            "BASPI5 question A1.8.6.1. Bound to opda:YesNoScheme.",
        ),
        (
            OPDA.isSharedOwnership,
            OPDA.LegalEstate,
            "is shared ownership",
            "Yes/No discriminator: is the LegalEstate a shared-ownership "
            "lease? Applies to Leasehold ownership per BASPI5 question "
            "A1.3.1. Bound to opda:YesNoScheme.",
        ),
        (
            OPDA.isGroundRentPayable,
            OPDA.LegalEstate,
            "is ground rent payable",
            "Yes/No discriminator: is ground rent payable on the "
            "Leasehold? BASPI5 ground-rent question. Bound to "
            "opda:YesNoScheme.",
        ),
        (
            OPDA.sellerContributesToServiceCharge,
            OPDA.LegalEstate,
            "seller contributes to service charge",
            "Yes/No discriminator: does the Seller contribute to a "
            "service charge for the Property? Applies to Leasehold / "
            "Managed Freehold / Commonhold per BASPI5. Bound to "
            "opda:YesNoScheme.",
        ),
        (
            OPDA.hasSprayFoamInstalled,
            OPDA.Property,
            "has spray foam installed",
            "Yes/No discriminator: has spray-foam insulation been "
            "installed in the Property? Relevant for mortgage-eligibility "
            "per BASPI5. Bound to opda:YesNoScheme.",
        ),
        (
            OPDA.isSupplyMetered,
            OPDA.Property,
            "is supply metered",
            "Yes/No discriminator: is the Property's utility supply "
            "(electricity / water / gas) metered? BASPI5 utility questions. "
            "Bound to opda:YesNoScheme.",
        ),
        (
            OPDA.isInsured,
            OPDA.Property,
            "is insured",
            "Yes/No discriminator: is the Property currently insured? "
            "BASPI5 insurance question. Bound to opda:YesNoScheme.",
        ),
        (
            OPDA.hasBeenFlooded,
            OPDA.Property,
            "has been flooded",
            "Yes/No discriminator: has the Property been flooded? BASPI5 "
            "environmental-issue question. Bound to opda:YesNoScheme.",
        ),
        (
            OPDA.hasSmartHomeSystems,
            OPDA.Property,
            "has smart home systems",
            "Yes/No discriminator: does the Property have smart-home "
            "systems installed? BASPI5 smart-home question. Bound to "
            "opda:YesNoScheme.",
        ),
        (
            OPDA.hasValidGuaranteesOrWarranties,
            OPDA.Property,
            "has valid guarantees or warranties",
            "Yes/No discriminator: does the Property carry valid "
            "guarantees, warranties, or indemnity insurances? BASPI5 "
            "guarantees question. Bound to opda:YesNoScheme.",
        ),
        (
            OPDA.soldWithVacantPossession,
            OPDA.Property,
            "sold with vacant possession",
            "Yes/No discriminator: is the Property sold with vacant "
            "possession (vs sold subject to existing tenancies)? BASPI5 "
            "completion question. Bound to opda:YesNoScheme.",
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
    for prop, domain, label, comment in _g11_properties:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, domain))
        g.add((prop, RDFS.range, XSD.string))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
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
    _walk_b1: list[tuple[URIRef, URIRef, str, str, tuple[str, ...]]] = [
        (
            OPDA.bedrooms, XSD.integer, "bedrooms",
            "Number of bedrooms in the Property — a countable UFO Quality of "
            "the physical Property. Plain integer datatype (no enumerated "
            "value-space) per ODR-0008 §Q5a; flat per §Q6a.",
            (
                "propertyPack.residentialPropertyFeatures.bedrooms",
                "valuationComparisonData.propertyDetails[].basicDetails.bedrooms",
            ),
        ),
        (
            OPDA.bathrooms, XSD.integer, "bathrooms",
            "Number of bathrooms in the Property — a countable UFO Quality. "
            "Plain integer datatype per ODR-0008 §Q5a; flat per §Q6a.",
            (
                "propertyPack.residentialPropertyFeatures.bathrooms",
                "valuationComparisonData.propertyDetails[].basicDetails.bathrooms",
            ),
        ),
        (
            OPDA.receptions, XSD.integer, "receptions",
            "Number of reception rooms in the Property. Plain integer datatype "
            "per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.residentialPropertyFeatures.receptions",),
        ),
        (
            OPDA.kitchens, XSD.integer, "kitchens",
            "Number of kitchens in the Property. Plain integer datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.residentialPropertyFeatures.kitchens",),
        ),
        (
            OPDA.diningAreas, XSD.integer, "dining areas",
            "Number of dining areas in the Property. Plain integer datatype "
            "per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.residentialPropertyFeatures.diningAreas",),
        ),
        (
            OPDA.numberOfFloors, XSD.integer, "number of floors",
            "Number of floors (storeys) the Property comprises. Plain integer "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.buildInformation.building.numberOfFloors",),
        ),
        (
            OPDA.entranceFloor, XSD.integer, "entrance floor",
            "Floor (storey) on which the Property's entrance is located "
            "(0 = ground). Plain integer datatype per ODR-0008 §Q5a; flat "
            "per §Q6a.",
            ("propertyPack.buildInformation.building.entranceFloor",),
        ),
        (
            OPDA.yearOfBuild, XSD.gYear, "year of build",
            "Calendar year the Property was built. xsd:gYear — the data "
            "dictionary types it as a year value; plain datatype per "
            "ODR-0008 §Q5a, flat per §Q6a.",
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
            (
                "propertyPack.buildInformation.internalArea.area",
                "valuationComparisonData.propertyDetails[].basicDetails."
                "buildInformation.internalArea.area",
            ),
        ),
    ]
    for prop, rng, label, comment, paths in _walk_b1:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, OPDA.Property))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
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
    _walk_a_property: list[tuple[URIRef, URIRef, str, str, tuple[str, ...]]] = [
        (
            OPDA.councilTaxBand, XSD.string, "council tax band",
            "Council-tax valuation band of the Property per "
            "opda:CouncilTaxBandSchemeEW (A–H / Not banded) or "
            "opda:CouncilTaxBandSchemeScotland. UFO Quale-in-Region; "
            "regulator-sourced enum (VOA / Scottish Assessors). Constrained "
            "by SHACL sh:in to the scheme members in the overlay profile, "
            "mirroring opda:currentEnergyRating. Flat per §Q6a.",
            ("propertyPack.councilTax.councilTaxBand",),
        ),
        (
            OPDA.supplyClassification, XSD.string, "supply classification",
            "Classification of the Property's water supply (e.g. metered / "
            "unmetered / rateable). A UFO Quale-in-Region of the physical "
            "Property. Plain string datatype per ODR-0008 §Q5a (no "
            "ontology-governed enum in the data dictionary); flat per §Q6a.",
            ("propertyPack.waterAndDrainage.water.supplyClassification",),
        ),
        (
            OPDA.centralHeatingInstalled, XSD.string, "central heating installed",
            "Central-heating installation indicator for the Property "
            "(typed as a string in the data dictionary — a Yes/No-style "
            "response). Plain string datatype per ODR-0008 §Q5a; flat per "
            "§Q6a. A physical-system attribute of the Property.",
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
            ("propertyPack.buildInformation.building.otherType",),
        ),
        (
            OPDA.otherCentralHeatingFuelType, XSD.string,
            "other central heating fuel type",
            "Free-text fuel classifier captured when the central-heating "
            "fuel is 'Other' (the open-ended companion to "
            "opda:centralHeatingFuelType). Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
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
            ("propertyPack.heating.otherHeatingFeatures",),
        ),
        (
            OPDA.accessibilityAndAdaptations, XSD.string,
            "accessibility and adaptations",
            "Accessibility features and adaptations of the Property (a "
            "multi-valued list — each value an xsd:string). UFO Quality of "
            "the physical Property. Plain multi-valued string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.typeOfConstruction.accessibilityAndAdaptations",),
        ),
        (
            OPDA.outsideAreas, XSD.string, "outside areas",
            "Outside areas of the Property — garden / yard / balcony / etc. "
            "(a multi-valued list — each value an xsd:string). UFO Quality "
            "of the physical Property. Plain multi-valued string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.residentialPropertyFeatures.outsideAreas",),
        ),
        (
            OPDA.parkingArrangements, XSD.string, "parking arrangements",
            "Parking arrangements for the Property — allocated / on-street / "
            "garage / etc. (a multi-valued list — each value an xsd:string). "
            "UFO Quality of the physical Property. Plain multi-valued string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.parking.parkingArrangements",),
        ),
        (
            OPDA.mpan, XSD.string, "MPAN",
            "Meter Point Administration Number — the electricity supply-point "
            "identifier for the Property. xsd:string (a fixed-width numeric "
            "identifier whose leading zeros are significant — the same "
            "convention opda:hasUPRN follows, NOT xsd:integer despite the "
            "data-dictionary typing). Flat per §Q6a.",
            ("propertyPack.electricity.mainsElectricity.electricityMeter.mpan",),
        ),
        (
            OPDA.mprn, XSD.string, "MPRN",
            "Meter Point Reference Number — the gas supply-point identifier "
            "for the Property. xsd:string (a fixed-width numeric identifier, "
            "per the opda:hasUPRN / opda:mpan convention, NOT xsd:integer). "
            "Flat per §Q6a.",
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
            ("propertyPack.waterAndDrainage.maps.publicSewerMapAttached",),
        ),
        (
            OPDA.waterworksMapAttached, XSD.string, "waterworks map attached",
            "Whether the waterworks map is attached for the Property "
            "(a Yes/No-style string response). Plain string datatype per "
            "ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.waterAndDrainage.maps.waterworksMapAttached",),
        ),
        (
            OPDA.waterProvider, XSD.string, "water provider",
            "Name of the Property's water-supply provider. Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.waterAndDrainage.charging.waterProvider",),
        ),
        (
            OPDA.sewerageProvider, XSD.string, "sewerage provider",
            "Name of the Property's sewerage provider. Plain string datatype "
            "per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.waterAndDrainage.charging.sewerageProvider",),
        ),
        (
            OPDA.waterBills, XSD.string, "water bills",
            "Free-text water-billing description for the Property. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.waterAndDrainage.charging.waterBills",),
        ),
        (
            OPDA.sewerageBills, XSD.string, "sewerage bills",
            "Free-text sewerage-billing description for the Property. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.waterAndDrainage.charging.sewerageBills",),
        ),
        (
            OPDA.currentChargingBasis, XSD.string, "current charging basis",
            "Current basis on which the Property's water/sewerage is charged. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.waterAndDrainage.charging.currentChargingBasis",),
        ),
        (
            OPDA.consequentialChargingBasis, XSD.string,
            "consequential charging basis",
            "Charging basis that would apply consequentially (e.g. on a "
            "change of circumstances) for the Property's water/sewerage. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
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
            ("propertyPack.location.googleStreetViewPOV.heading",),
        ),
        (
            OPDA.pitch, XSD.decimal, "pitch",
            "Google Street View point-of-view pitch (degrees) for the "
            "Property's map locator. xsd:decimal numeric camera parameter. "
            "Flat per §Q6a.",
            ("propertyPack.location.googleStreetViewPOV.pitch",),
        ),
        (
            OPDA.zoom, XSD.decimal, "zoom",
            "Google Street View point-of-view zoom level for the Property's "
            "map locator. xsd:decimal numeric camera parameter. Flat per "
            "§Q6a.",
            ("propertyPack.location.googleStreetViewPOV.zoom",),
        ),
        (
            OPDA.dateInstalled, XSD.date, "date installed",
            "Date a Property system was installed (heat pump / off-mains "
            "drainage system). xsd:date (a date-valued string in the data "
            "dictionary). Flat per §Q6a.",
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
            (
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "offMainsDrainageSystem.dateLastEmptied",
            ),
        ),
        (
            OPDA.dateLastServiced, XSD.date, "date last serviced",
            "Date the Property's off-mains drainage system was last serviced. "
            "xsd:date. Flat per §Q6a.",
            (
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "offMainsDrainageSystem.dateLastServiced",
            ),
        ),
        (
            OPDA.dateReplaced, XSD.date, "date replaced",
            "Date the Property's off-mains drainage system was last replaced. "
            "xsd:date. Flat per §Q6a.",
            (
                "propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
                "offMainsDrainageSystem.dateReplaced",
            ),
        ),
        (
            OPDA.heatingLastServicedDate, XSD.date, "heating last serviced date",
            "Date the Property's central-heating system was last serviced. "
            "xsd:date. Flat per §Q6a.",
            (
                "propertyPack.heating.heatingSystem.centralHeatingDetails."
                "heatingLastServicedDate",
            ),
        ),
        (
            OPDA.lastMaintained, XSD.date, "last maintained",
            "Date the Property's solar-panel system was last maintained. "
            "xsd:date. Flat per §Q6a.",
            ("propertyPack.electricity.solarPanels.lastMaintained",),
        ),
        (
            OPDA.yearInstalled, XSD.gYear, "year installed",
            "Calendar year the Property's solar-panel system was installed. "
            "xsd:gYear (a year value in the data dictionary). Flat per §Q6a.",
            ("propertyPack.electricity.solarPanels.yearInstalled",),
        ),
        (
            OPDA.yearTested, XSD.gYear, "year tested",
            "Calendar year the Property's electrical installation was last "
            "tested by a qualified electrician. xsd:gYear. Flat per §Q6a.",
            (
                "propertyPack.electricalWorks.testedByQualifiedElectrician."
                "yearTested",
            ),
        ),
        (
            OPDA.yearWorkCarriedOut, XSD.gYear, "year work carried out",
            "Calendar year electrical work was carried out on the Property "
            "(since 2005). xsd:gYear. Flat per §Q6a.",
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
            ("propertyPack.smartHomeSystems.handoverOnCompletion",),
        ),
        (
            OPDA.willHandoverLogbook, XSD.boolean, "will handover logbook",
            "Whether the seller will hand over the digital property logbook "
            "on completion. xsd:boolean. Flat per §Q6a.",
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
            ("propertyPack.environmentalIssues.flooding.historicalFlooding."
             "typeOfFlooding",),
        ),
    ]
    for prop, rng, label, comment, paths in _walk_a_property:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, OPDA.Property))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

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
    _walk_b_estate: list[tuple[URIRef, URIRef, str, str, tuple[str, ...]]] = [
        (
            OPDA.groundRentFrequency, XSD.string, "ground rent frequency",
            "Frequency at which ground rent is payable on the leasehold "
            "LegalEstate (typed as a string in the data dictionary — a "
            "free-form frequency label). Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
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
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.leaseTerm.lengthOfLeaseInYears",
            ),
        ),
        (
            OPDA.startYearOfLease, XSD.gYear, "start year of lease",
            "Calendar year the leasehold term commenced. xsd:gYear (a year "
            "value in the data dictionary). Flat per §Q6a.",
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
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.buildingsInsurance."
                "buildingsReinstatementCostAssessment",
            ),
        ),
        (
            OPDA.titleNumber, XSD.string, "title number",
            "HMLR title number of the LegalEstate / title to be sold. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a. A title "
            "identifier on the estate side (distinct from opda:RegisteredTitle "
            "the record-entity — this is the estate's cited title number).",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[].titleNumber",
                "propertyPack.titlesToBeSold[].registerExtract.ocSummaryData."
                "title.titleNumber",
                "propertyPack.titlesToBeSold[].titleNumber",
            ),
        ),
        (
            OPDA.titleExtents, XSD.string, "title extents",
            "Statement of the extents covered by a title to be sold. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.titlesToBeSold[].titleExtents",),
        ),
        (
            OPDA.titlePropertyDescription, XSD.string,
            "title property description",
            "The property description as recorded on the title for the "
            "LegalEstate to be transferred. Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
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
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.adHocExpenses",
            ),
        ),
    ]
    for prop, rng, label, comment, paths in _walk_b_estate:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, OPDA.LegalEstate))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    return g
