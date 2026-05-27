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
    OPDA.addressVariant,
    OPDA.areBoundariesUniform,
    OPDA.builtForm,
    OPDA.centralHeatingFuelType,
    OPDA.currentEnergyRating,
    OPDA.hasBeenFlooded,
    OPDA.hasSmartHomeSystems,
    OPDA.hasSprayFoamInstalled,
    OPDA.hasUPRN,
    OPDA.hasValidGuaranteesOrWarranties,
    OPDA.heatingType,
    OPDA.isGroundRentPayable,
    OPDA.isInsured,
    OPDA.isLocatedOverCommercialPremises,
    OPDA.isSharedOwnership,
    OPDA.isSupplyMetered,
    OPDA.offMainsDrainageSystemType,
    OPDA.ownershipType,
    OPDA.propertyType,
    OPDA.riskIndicator,
    OPDA.sellerContributesToServiceCharge,
    OPDA.soldWithVacantPossession,
    OPDA.tenureKind,
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
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/0.4.0/")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/property/0.4.0/")))

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
    # Minimum descriptive datatype property to support exemplar coverage;
    # full Q5a binding table deferred to G11.
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
    g.add((OPDA.builtForm, DCTERMS.source, _ODR_0008_S5A))

    # --- DatatypeProperty: opda:currentEnergyRating (ODR-0008 §Q5a) -----
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
    g.add((OPDA.currentEnergyRating, DCTERMS.source, _ODR_0008_S5A))

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
        (
            OPDA.riskIndicator,
            OPDA.Property,
            "risk indicator",
            "Yes/No-bearing risk indicator on a Property (e.g. flood "
            "risk, radon risk, coal-mining risk). BASPI5 environmental "
            "issues. Bound to opda:YesNoScheme variants.",
        ),
    ]
    for prop, domain, label, comment in _g11_properties:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, domain))
        g.add((prop, RDFS.range, XSD.string))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, DCTERMS.source, _ODR_0008_S5A))

    return g
