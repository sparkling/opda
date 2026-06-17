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


OPDA = Namespace("https://opda.org.uk/pdtf/")
PROV = Namespace("http://www.w3.org/ns/prov#")


# Data-dictionary schema-leaf-path dct:source (ODR-0022 G2); same form as the
# property-module helper (module-local to avoid a cross-emitter import).
def _dd_source(leaf_path: str) -> URIRef:
    """Return the data-dictionary schema-leaf-path `dct:source` IRI (G2)."""
    safe = leaf_path.replace(" ", "%20").replace("'", "%27")
    return URIRef(f"https://opda.org.uk/pdtf/harness/data-dictionary/{safe}")


_ODR_0008_Q4A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q4a")
_ODR_0008_Q5A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q5a")

# ODR-0024 R4 (council session-028 Q1) — the UFO Substance-Kind re-warrant of
# opda:NearbyFacility. §Q4a (a provenance / lifecycle / PII test) does NOT
# license a real-world facility bearer; ODR-0024 R4 supplies the correct
# warrant (a referenced facility is a mind-independent social-physical endurant
# with its own IC, not a Property Quality) and the schoolType→SKOS rule.
_ODR_0024_R3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0024/section-Rules-R3")
_ODR_0024_R4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0024/section-Rules-R4")
_ODR_0024_R10 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0024/section-Rules-R10")

# ODR-0008d (Authority-Retrieved Artefacts) section anchors — the Category-E
# RiskAssessment class + its peril/rating-bearing properties cite the Rule
# that mints them (mirrors the §Q4a/§Q5a anchor convention above).
_ODR_0008D_RULE_1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008d/section-Rule-1")
_ODR_0008D_RULE_3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008d/section-Rule-3")
_ODR_0008D_RULE_4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008d/section-Rule-4")
_ODR_0008D_RULE_5 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008d/section-Rule-5")

# ODR-0022 §4 / session-027 R4 — the Category-D inclusion-as-transaction-Mode
# anchor. opda:inclusionStatus is a Mode/Relator of the sale transaction
# (ODR-0007), confirmed by session-027 R4; its `dct:source` cites ODR-0022 §4
# (the deciding record), per the same convention disclosureDetail uses.
_ODR_0022_S4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0022/section-Rules-4")

# Category A (ODR-0022 §Rules.1) — the single reusable disclosure-detail
# annotation property is decided by ODR-0022 §1 itself; its `dct:source`
# points at that deciding section, NOT a schema leaf path. (The leaf-path
# `dct:source` of ODR-0022 G2 governs the per-question descriptive *leaves*
# of the deferred Category-G walk — a reusable annotation property is not
# one of those leaves; the question is carried by the subject + the
# instance-level `dct:source` per ODR-0022 §Rules.1 / §Rules.6.)
_ODR_0022_S1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0022/section-Rules-1")


# skos:definition (ISO-704 genus–differentia) for every property emitted via
# the table-driven walks below (_walk_d_search / _walk_e_descriptive /
# _walk_monetary / _walk_r5 / _walk_room). Keyed by the property IRI; each loop
# emits g.add((prop, SKOS.definition, _DEFINITIONS[prop]@en)) + isDefinedBy.
# Standalone (non-loop) terms carry their skos:definition inline in build_graph.
_DEFINITIONS: dict[URIRef, str] = {
    # --- Family D: search / planning / building-control / local-authority ---
    OPDA.applicationType:
        "The kind of a planning or building-control application recorded in a "
        "local-authority search result.",
    OPDA.applicationDate:
        "The date a planning or building-control application was made, as "
        "recorded in a local-authority search result.",
    OPDA.decision:
        "The determination reached on a planning or building-control "
        "application in a local-authority search result.",
    OPDA.decisionDate:
        "The date a determination was reached on a planning or "
        "building-control application.",
    OPDA.refNumber:
        "The application or case reference identifying a planning or "
        "building-control matter in a search result.",
    OPDA.status:
        "The current state of a search-derived item — a planning permission, "
        "designation plan, road-adoption entry, or search order.",
    OPDA.statusDate:
        "The date on which a designation plan's status was set in a "
        "local-authority search result.",
    OPDA.designationType:
        "The kind of planning designation recorded in a local-authority "
        "search result, such as a conservation area or tree-preservation "
        "order.",
    OPDA.planningStartDate:
        "The date a planning matter commenced, as recorded in a "
        "local-authority search result.",
    OPDA.buildingControlStartDate:
        "The date a building-control matter commenced, as recorded in a "
        "local-authority search result.",
    OPDA.localAuthorityName:
        "The name of the local authority that issued or governs a search.",
    OPDA.localAuthorityReference:
        "The reference identifying a search within its local authority's "
        "record system.",
    OPDA.countyCouncil:
        "The name of the county council for the locality of the property "
        "searched.",
    OPDA.districtCouncil:
        "The name of the district council for the locality of the property "
        "searched.",
    OPDA.unitaryAuthority:
        "The name of the unitary authority for the locality of the property "
        "searched.",
    OPDA.councilSearchTurnaroundTimeInWorkingDays:
        "The quoted turnaround time, in working days, for a council search.",
    OPDA.regulatedSearchTurnaroundTimeInWorkingDays:
        "The quoted turnaround time, in working days, for a regulated search.",
    OPDA.orderDate:
        "The date a search was ordered.",
    OPDA.expectedDeliveryDate:
        "The date by which an ordered search is expected to be delivered.",
    OPDA.reportDate:
        "The date a search or survey report was produced.",
    OPDA.productCode:
        "The provider's product code identifying a particular search product.",
    OPDA.providerName:
        "The name of the organisation that supplied a search.",
    OPDA.providerReference:
        "The provider's own reference for a search.",
    OPDA.subCategory:
        "The named sub-division of an environmental-peril risk assessment, "
        "drawn from the peril's riskSubcategories list.",
    OPDA.dateRemedialActionRequired:
        "The date by which remedial action is required following a "
        "buildings-insurance risk assessment of a managed area.",
    OPDA.documentDate:
        "The date borne by a title or additional document attached to a "
        "property pack.",
    OPDA.documentTypeCode:
        "The type code classifying a title or additional document attached to "
        "a property pack.",
    OPDA.filedUnder:
        "The filing reference under which a title or additional document is "
        "held.",
    OPDA.retrievedOn:
        "The date a title or additional document was retrieved from the "
        "registry.",
    OPDA.displayName:
        "The human-readable name of a document or search artefact.",
    OPDA.mediaUrl:
        "The web address locating a media item such as a property image or "
        "floorplan.",
    OPDA.url:
        "The web address locating an external artefact such as a contract "
        "template or planning-permission page.",
    # --- Family E (descriptive side): Valuation pricing + nearby facilities -
    OPDA.soldDate:
        "The date a comparable property was sold, as recorded in valuation "
        "comparable listing information.",
    OPDA.listedDate:
        "The date a comparable property was listed for sale, as recorded in "
        "valuation comparable listing information.",
    OPDA["yield"]:
        "The rental yield computed in a valuation's pricing analysis.",
    OPDA.pricingMethodology:
        "The method used to derive a valuation's price estimate.",
    OPDA.credibilitySources:
        "The sources cited as lending credibility to a valuation's price "
        "estimate.",
    OPDA.distanceInMiles:
        "The distance in miles from a property to a nearby facility.",
    OPDA.ageRange:
        "The range of pupil ages catered for by a nearby school.",
    OPDA.pupils:
        "The number of pupils enrolled at a nearby school.",
    OPDA.religiousCharacter:
        "The religious affiliation, if any, of a nearby school.",
    OPDA.otherRating:
        "The rating of a nearby school awarded by a body other than Ofsted.",
    OPDA.typeOfHealthCare:
        "The category of a nearby health-care facility.",
    OPDA.specialties:
        "The clinical specialties offered by a nearby health-care facility.",
    # --- Monetary walk: per-economic-kind amounts (range MonetaryAmount) ----
    OPDA.annualGroundRent:
        "The yearly ground rent payable under a leasehold estate.",
    OPDA.annualServiceCharge:
        "The yearly service charge payable under a leasehold or managed "
        "freehold/commonhold estate.",
    OPDA.certificateOfComplianceFee:
        "The fee charged for a certificate of compliance required on a "
        "leasehold transfer.",
    OPDA.sharedOwnershipRent:
        "The rent payable on the retained share under a shared-ownership "
        "lease.",
    OPDA.councilTaxAnnualCharge:
        "The yearly council-tax charge levied on a property.",
    OPDA.annualCostOfPermit:
        "The yearly cost of a controlled-parking permit for a property.",
    OPDA.rent:
        "The rent stated in a property's letting information.",
    OPDA.holdingDeposit:
        "The refundable holding deposit stated in a property's letting "
        "information.",
    OPDA.securityDeposit:
        "The refundable security deposit stated in a property's letting "
        "information.",
    OPDA.potentialCost:
        "The estimated cost of potential remediation disclosed in a "
        "property's building-safety information.",
    OPDA.estimatedPrice:
        "The estimated sale price stated in a valuation's pricing analysis.",
    OPDA.estimatedAmount:
        "The estimated rental amount stated in a valuation's rental-estimate "
        "analysis.",
    OPDA.listPrice:
        "The price at which a comparable property was listed for sale.",
    OPDA.soldPrice:
        "The price at which a comparable property was sold.",
    OPDA.costsApplicableToTheDeed:
        "The costs payable for a deed of covenant required on a transfer.",
    OPDA.feeIncludingVAT:
        "The VAT-inclusive fee charged by a party for serving a notice of "
        "transfer, assignment, or charge during conveyancing.",
    # --- R5 follow-on: enum leaves (→ SKOS schemes) -------------------------
    OPDA.constructionType:
        "The structural construction method of a property, drawn from the "
        "opda:ConstructionTypeScheme value-space.",
    OPDA.priceQualifier:
        "The qualifier attached to a marketed price, such as Guide price or "
        "Offers over, drawn from the opda:PriceQualifierScheme value-space.",
    OPDA.typeOfConnection:
        "The broadband connection technology serving a property, drawn from "
        "the opda:BroadbandConnectionTypeScheme value-space.",
    OPDA.marketingTenure:
        "The tenure under which a property is marketed, drawn from the "
        "opda:TenureKindScheme value-space.",
    OPDA.transportType:
        "The kind of a nearby transport facility, such as a rail station or "
        "bus stop, drawn from the opda:TransportTypeScheme value-space.",
    OPDA.ofstedRating:
        "The Ofsted rating of a nearby school, drawn from the "
        "opda:OfstedRatingScheme value-space.",
    # --- R5 follow-on: Yes/No disclosure flags + references -----------------
    OPDA.hasLift:
        "Whether the building containing a property has a lift.",
    OPDA.isHMO:
        "Whether a property is a House in Multiple Occupation.",
    OPDA.isStudentAccommodation:
        "Whether a property is student accommodation.",
    OPDA.hasFloorplan:
        "Whether a floorplan is available for a property.",
    OPDA.loftInsulated:
        "Whether a property's loft is insulated.",
    OPDA.loftBoarded:
        "Whether a property's loft is boarded.",
    OPDA.hasFloodDefences:
        "Whether a property has flood defences.",
    OPDA.isConnectedToNationalGrid:
        "Whether a property's solar panels are connected to the national "
        "grid.",
    OPDA.isFirstRegistration:
        "Whether a sale constitutes the first registration of the title.",
    OPDA.isLimitedCompanySale:
        "Whether the seller in a sale is a limited company.",
    OPDA.hasHelpToBuyEquityLoan:
        "Whether a property is subject to a Help to Buy equity loan.",
    OPDA.saleAtUndervalue:
        "Whether a sale is being made at undervalue.",
    OPDA.landlordInsuresIfFlat:
        "Whether the landlord arranges buildings insurance for a flat.",
    OPDA.willingToInsure:
        "Whether an insurer is willing to insure against an unresolved "
        "planning issue affecting a property.",
    OPDA.managementPlanInPlace:
        "Whether a management plan is in place for Japanese knotweed affecting "
        "a property.",
    OPDA.consentsObtained:
        "Whether the required consents were obtained for work carried out "
        "under a tree-preservation order.",
    OPDA.dischargeCompliesWithGBR:
        "Whether a property's off-mains drainage discharge complies with the "
        "General Binding Rules.",
    OPDA.isLeaseQualifying:
        "Whether a lease is a qualifying lease under the Building Safety Act.",
    OPDA.landlordNotifiedOfSale:
        "Whether the landlord has been notified of a sale under the Building "
        "Safety Act.",
    OPDA.sellerCompletedDeedOfCertificate:
        "Whether the seller completed a deed of certificate under the Building "
        "Safety Act.",
    OPDA.dangerousCladdingOrDefects:
        "Whether a property has dangerous cladding or building-safety "
        "defects.",
    OPDA.contributionIncludedInServiceCharge:
        "Whether a reserve-fund contribution is included within the service "
        "charge.",
    OPDA.isManagingAgentEmployed:
        "Whether a managing agent is employed to manage an estate.",
    OPDA.hasTenantCompanyDissolved:
        "Whether the tenant management company for an estate has been "
        "dissolved.",
    OPDA.headLeaseholderControlled:
        "Whether the head lease of an estate is leaseholder-controlled.",
    OPDA.organisesBuildingInsurance:
        "Whether a service contact organises buildings insurance for an "
        "estate.",
    OPDA.sellerOwnedProperty:
        "Whether the seller has owned the property long enough to satisfy "
        "enfranchisement qualification.",
    OPDA.outstandingEnforcementAction:
        "Whether there is outstanding enforcement action recorded in a "
        "managed-area risk assessment.",
    OPDA.urgentWorksCarriedOut:
        "Whether urgent works were carried out, as recorded in a managed-area "
        "risk assessment.",
    OPDA.urgentWorksRecommended:
        "Whether urgent works were recommended, as recorded in a managed-area "
        "risk assessment.",
    OPDA.dealsWithDayToDayMaintenanceOfManagedArea:
        "Whether a contact is responsible for the day-to-day maintenance of a "
        "managed area.",
    OPDA.freeholdOwner:
        "The named freehold owner recorded in a leasehold ownership-and-"
        "management block.",
    OPDA.forTheManagedAreas:
        "The portion of a service-charge reserve fund attributable to the "
        "managed areas.",
    OPDA.fromTheOwners:
        "The portion of a service-charge reserve fund contributed by the "
        "owners.",
    # --- Room-dimension by-value fields -------------------------------------
    OPDA.length:
        "The length of a room in metres, recorded as a field of an "
        "opda:RoomDimension value structure.",
    OPDA.width:
        "The width of a room in metres, recorded as a field of an "
        "opda:RoomDimension value structure.",
    OPDA.roomName:
        "The non-rigid label naming a room within an opda:RoomDimension value "
        "structure, never an identity principle or key.",
}


CLASSES = (
    OPDA.Comparable,
    OPDA.EPCCertificate,
    # ADR-0031 walk + ODR-0024 R3 — the monetary value structure. A by-value
    # quality-value (magnitude + ISO-4217 currency) reused as the RANGE across
    # the distinct per-economic-kind monetary properties, each on its own
    # bearer (NEVER a shared bearer; session-028 Q3 / ODR-0024 R3).
    OPDA.MonetaryAmount,
    # ADR-0031 walk + ODR-0024 R4 — the nearby-facilities bearer. The genus
    # opda:NearbyFacility is a UFO Substance Kind (a mind-independent endurant
    # with its own IC, NOT a Property Quality); the precise-bearer subkinds
    # (School / HealthCareFacility / TransportNode) are COLLAPSED into the genus
    # for the first cut (Guizzardi's subkind split held-as-live dissent).
    OPDA.NearbyFacility,
    # ODR-0008d Rule 1 — the sixth class: the per-peril authority-retrieved
    # search/environmental result (an Information Object on the PROV-O
    # backbone).
    OPDA.RiskAssessment,
    # ODR-0023 R3 / session-030 — the room-dimension value structure. An
    # ANONYMOUS by-value bundle (no IC, no key — the opda:MonetaryAmount
    # pattern), NOT a Substance Kind: the council ruled opda:Room / opda:Building
    # do NOT earn classes (Room has no data-realisable IC; Building's +O IC is
    # genuine but latent), so length/width/roomName attach to opda:Property via
    # this value node.
    OPDA.RoomDimension,
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
    # ODR-0024 R3 monetary walk — the per-economic-kind monetary properties
    # (each rdfs:range opda:MonetaryAmount, on its own bearer) + opda:currency
    # (the value type's currency dimension → opda:CurrencyScheme concept).
    OPDA.annualCostOfPermit,
    OPDA.annualGroundRent,
    OPDA.annualServiceCharge,
    OPDA.certificateOfComplianceFee,
    OPDA.costsApplicableToTheDeed,
    OPDA.councilTaxAnnualCharge,
    OPDA.currency,
    OPDA.estimatedAmount,
    OPDA.estimatedPrice,
    OPDA.feeIncludingVAT,
    OPDA.hasRoomDimension,
    OPDA.hasSubAssessment,
    OPDA.holdingDeposit,
    OPDA.listPrice,
    OPDA.peril,
    OPDA.potentialCost,
    OPDA.rent,
    OPDA.securityDeposit,
    OPDA.sharedOwnershipRent,
    OPDA.soldPrice,
    # Council-046 Q3b: enum properties flipped to ObjectProperty/skos:Concept.
    OPDA.constructionType,
    OPDA.priceQualifier,
    OPDA.typeOfConnection,
    OPDA.marketingTenure,
    OPDA.transportType,
    OPDA.ofstedRating,
    OPDA.riskIndicator,
    OPDA.inclusionStatus,
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
    OPDA.amount,
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
    OPDA.schoolType,
    OPDA.soldDate,
    OPDA.specialties,
    OPDA.status,
    OPDA.statusDate,
    OPDA.subCategory,
    OPDA.typeOfHealthCare,
    OPDA.unitaryAuthority,
    OPDA.url,
    # ODR-0024 R5/R6 follow-on walk (ADR-0005 §G23) — the Yes/No
    # Property/estate attributes (enum properties moved to OBJECT_PROPERTIES
    # by Council-046 Q3b).
    OPDA.hasLift,
    OPDA.isHMO,
    OPDA.isStudentAccommodation,
    OPDA.hasFloorplan,
    OPDA.loftInsulated,
    OPDA.loftBoarded,
    OPDA.hasFloodDefences,
    OPDA.isConnectedToNationalGrid,
    OPDA.isFirstRegistration,
    OPDA.isLimitedCompanySale,
    OPDA.hasHelpToBuyEquityLoan,
    OPDA.saleAtUndervalue,
    OPDA.landlordInsuresIfFlat,
    OPDA.willingToInsure,
    OPDA.managementPlanInPlace,
    OPDA.consentsObtained,
    OPDA.dischargeCompliesWithGBR,
    OPDA.isLeaseQualifying,
    OPDA.landlordNotifiedOfSale,
    OPDA.sellerCompletedDeedOfCertificate,
    OPDA.dangerousCladdingOrDefects,
    OPDA.contributionIncludedInServiceCharge,
    OPDA.isManagingAgentEmployed,
    OPDA.hasTenantCompanyDissolved,
    OPDA.headLeaseholderControlled,
    OPDA.organisesBuildingInsurance,
    OPDA.sellerOwnedProperty,
    OPDA.outstandingEnforcementAction,
    OPDA.urgentWorksCarriedOut,
    OPDA.urgentWorksRecommended,
    OPDA.dealsWithDayToDayMaintenanceOfManagedArea,
    OPDA.freeholdOwner,
    OPDA.forTheManagedAreas,
    OPDA.fromTheOwners,
    # ODR-0023 R3 / session-030 — opda:RoomDimension value-structure fields.
    OPDA.length,
    OPDA.width,
    OPDA.roomName,
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
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/descriptive")
    _DEFINED_BY = module_iri  # rdfs:isDefinedBy target for every term below
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title,
           Literal("OPDA Descriptive Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://opda.org.uk/pdtf/harness/release/descriptive/1.0.0/")))

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
    g.add((OPDA.Survey, SKOS.definition, Literal(
        "An information artefact recording the findings of a professional "
        "physical inspection of a property, retrieved from its issuing "
        "authority and individuated by a distinct provenance chain back to "
        "the professional-issued generating activity and a lifecycle of "
        "issue, supersession, re-issue, and withdrawal.",
        lang="en",
    )))
    g.add((OPDA.Survey, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.EPCCertificate, SKOS.definition, Literal(
        "An information artefact certifying the energy-efficiency rating of a "
        "dwelling, issued under the DESNZ register and individuated by a "
        "ten-year validity lifecycle, supersession on re-assessment, and an "
        "address-and-owner-identifiable PII regime.",
        lang="en",
    )))
    g.add((OPDA.EPCCertificate, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.Search, SKOS.definition, Literal(
        "An information artefact returning the result of a local-authority or "
        "environmental enquiry against a property (CON29R, LLC1, flood, "
        "coal-mining, and similar), individuated by its issuing-authority "
        "provenance chain and an ordered/returned/superseded lifecycle, and "
        "carrying the per-peril risk assessments its generating activity "
        "produces.",
        lang="en",
    )))
    g.add((OPDA.Search, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.Valuation, SKOS.definition, Literal(
        "An information artefact stating an estimate of a property's market or "
        "rental value, produced by a RICS-regulated professional or an "
        "automated model and individuated by a regulated provenance chain and "
        "an instructed/delivered/superseded lifecycle.",
        lang="en",
    )))
    g.add((OPDA.Valuation, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.Comparable, SKOS.definition, Literal(
        "An information artefact recording a sale or rental of a comparable "
        "property that supports a Valuation, sourced from Land Registry or VOA "
        "data and individuated by that market-data provenance feeding the "
        "valuation's derivation chain.",
        lang="en",
    )))
    g.add((OPDA.Comparable, RDFS.isDefinedBy, _DEFINED_BY))
    g.add((OPDA.Comparable, SKOS.scopeNote, Literal(
        "UFO: Information Object (corrected from \"Substance Kind\" per "
        "ODR-0008d Rule 3). Land Registry Price Paid Data + VOA records "
        "(regulator-cited per ODR-0011 §4a).",
        lang="en",
    )))
    g.add((OPDA.Comparable, DCTERMS.source, _ODR_0008_Q4A))

    # --- opda:NearbyFacility — UFO Substance Kind (ODR-0024 R4) ----------
    # The nearby-facilities bearer for the object-typed
    # nearbyFacilities.{schools,healthCare,transport}[] leaves (ADR-0031 walk):
    # a real-world point-of-interest near the Property, referenced for amenity
    # context. ODR-0024 R4 (session-028 Q1) re-warrants it: §Q4a does NOT
    # license it (that test's named promotions are all Information Objects); a
    # referenced facility is instead a UFO Substance Kind — a mind-independent
    # social-physical endurant with its OWN identity criterion, NOT a Quality
    # of opda:Property (the same facility neighbours many properties). For the
    # first cut the genus bears ALL band attributes (school: opda:pupils /
    # ageRange / religiousCharacter / otherRating / schoolType; health-care:
    # opda:typeOfHealthCare / specialties; shared: opda:distanceInMiles),
    # band-scoped via SHACL in the overlay profiles. The precise-bearer subkind
    # split (opda:School / opda:HealthCareFacility / opda:TransportNode) is
    # HELD-AS-LIVE (Guizzardi dissent; re-open trigger: a consumer query needing
    # per-band typing, or the ODR-0023 R2 axis review).
    g.add((OPDA.NearbyFacility, RDF.type, OWL.Class))
    g.add((OPDA.NearbyFacility, RDFS.label,
           Literal("Nearby Facility", lang="en")))
    g.add((OPDA.NearbyFacility, RDFS.comment, Literal(
        "A point-of-interest near the Property — a school, health-care "
        "facility, or transport node listed in propertyPack.nearbyFacilities "
        "for amenity context. UFO Substance Kind: a mind-independent social-"
        "physical endurant with its own identity criterion (a real-world "
        "facility persists through renaming, re-rating, and change of "
        "operator), distinct from the Property being transacted — NOT a "
        "Quality of opda:Property, since the same facility neighbours many "
        "properties (ODR-0024 R4 / session-028 Q1). Warranted on that UFO "
        "Substance-Kind basis, NOT ODR-0008 §Q4a (a provenance / lifecycle / "
        "PII test whose promotions are all Information Objects, which does not "
        "license a real-world facility). The genus bears all band attributes "
        "for the first cut (school / health-care / transport), band-scoped via "
        "SHACL in the overlay profiles; the per-band subkind split is "
        "held-as-live (Guizzardi dissent). Bears opda:distanceInMiles "
        "(proximity to the Property).",
        lang="en",
    )))
    g.add((OPDA.NearbyFacility, SKOS.definition, Literal(
        "A mind-independent social-physical endurant near a property — a "
        "school, health-care facility, or transport node — listed for amenity "
        "context and bearing its own identity criterion independent of the "
        "property being transacted, since the same facility neighbours many "
        "properties.",
        lang="en",
    )))
    g.add((OPDA.NearbyFacility, RDFS.isDefinedBy, _DEFINED_BY))
    g.add((OPDA.NearbyFacility, SKOS.scopeNote, Literal(
        "UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2 — a Sortal, Rigid "
        "social-physical endurant supplying its own IC). Warranted per "
        "ODR-0024 R4 on that UFO basis (NOT ODR-0008 §Q4a — §Q4a's object-"
        "promotion test licenses Information Objects, not mind-independent "
        "facilities).",
        lang="en",
    )))
    g.add((OPDA.NearbyFacility, DCTERMS.source, _ODR_0024_R4))

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
    g.add((OPDA.RiskAssessment, SKOS.definition, Literal(
        "An information artefact reporting the authority-retrieved result for "
        "one environmental or search peril against a property (its indicator, "
        "alert rating, result, summary, recommendations, and attribution), "
        "individuated by the tuple of generating activity, source "
        "peril/dataset, subject property, and generation time rather than by "
        "its result values.",
        lang="en",
    )))
    g.add((OPDA.RiskAssessment, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.peril, SKOS.definition, Literal(
        "The environmental or search hazard a risk assessment reports on: the "
        "opda:PerilScheme concept naming the dataset or peril whose result the "
        "assessment records.",
        lang="en",
    )))
    g.add((OPDA.peril, RDFS.isDefinedBy, _DEFINED_BY))
    g.add((OPDA.peril, DCTERMS.source, _ODR_0008D_RULE_1))

    # --- opda:riskIndicator — RiskAssessment Quale (Rule 1c) ------------
    # The \"is action recommended? / is the property at risk?\" indicator,
    # ranging over opda:YesNoNotKnownScheme (No / Not known / Yes). A
    # Quale-in-Region datatype property; the node shape sh:in-restricts it to
    # the scheme value-space. (Already attested as a flat datatype property
    # in the data dictionary; here it is given its RiskAssessment home.)
    g.add((OPDA.riskIndicator, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.riskIndicator, RDFS.domain, OPDA.RiskAssessment))
    g.add((OPDA.riskIndicator, RDFS.range, SKOS.Concept))
    g.add((OPDA.riskIndicator, RDFS.label, Literal("risk indicator", lang="en")))
    g.add((OPDA.riskIndicator, RDFS.comment, Literal(
        "Whether action is recommended / the property is at risk for the "
        "RiskAssessment's peril (No / Not known / Yes). Value-space reuses "
        "opda:YesNoNotKnownScheme (a duplicate scheme would violate ODR-0022 "
        "Category C); the node shape sh:in-restricts it (ODR-0008d Rule 1c / "
        "Rule 4).",
        lang="en",
    )))
    g.add((OPDA.riskIndicator, SKOS.definition, Literal(
        "The at-risk indicator of a risk assessment: whether action is "
        "recommended or the property is at risk for the assessed peril, drawn "
        "from the No / Not known / Yes value-space.",
        lang="en",
    )))
    g.add((OPDA.riskIndicator, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.actionAlertRating, SKOS.definition, Literal(
        "The action-alert severity of a risk assessment: an ordinal integer "
        "from 1 (Green, lowest risk) to 5 (Red, highest risk) grading the "
        "assessed peril.",
        lang="en",
    )))
    g.add((OPDA.actionAlertRating, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.hasSubAssessment, SKOS.definition, Literal(
        "The result-recursion link of a risk assessment to a constituent leaf "
        "risk assessment: a mereological part-of holding between a parent "
        "assessment and each of its riskSubcategories entries.",
        lang="en",
    )))
    g.add((OPDA.hasSubAssessment, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.inclusionStatus, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.inclusionStatus, RDFS.range, SKOS.Concept))
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
    g.add((OPDA.inclusionStatus, SKOS.definition, Literal(
        "The disposition of a fixtures-and-fittings item in a sale: whether "
        "the item is Included in, Excluded from, or absent (None) from the "
        "transaction, held as a mode of the sale rather than a quality of the "
        "property.",
        lang="en",
    )))
    g.add((OPDA.inclusionStatus, RDFS.isDefinedBy, _DEFINED_BY))
    g.add((OPDA.inclusionStatus, DCTERMS.source, _ODR_0022_S4))

    # --- opda:price — Category D shared fixtures monetary amount --------
    # ODR-0022 §4: price is the Category-D FIXTURES amount only — ONE shared
    # datatype property (the data dictionary types the fixtures price leaf as a
    # number), bound on the transaction-scoped fixtures-list node alongside
    # inclusionStatus. A single property, never one per item. opda:MonetaryAmount
    # now EXISTS (the Category-G monetary walk, ODR-0024 R3); opda:price
    # deliberately stays a single-currency interim decimal for the Category-D
    # fixtures amount and is NOT migrated to it. The Category-G headline /
    # recurring monetary leaves do NOT reuse this property (they bind
    # opda:MonetaryAmount on their own bearers; ODR-0022 §1 / G1).
    g.add((OPDA.price, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.price, RDFS.range, XSD.decimal))
    g.add((OPDA.price, RDFS.label, Literal("price", lang="en")))
    g.add((OPDA.price, RDFS.comment, Literal(
        "Monetary amount asked for a fixtures-and-fittings item included in "
        "a sale (a number in the data dictionary). A single shared fixtures "
        "monetary amount reused across all fixtures items — ODR-0022 §4 "
        "forbids minting one price property per item. Bound on the "
        "transaction-scoped fixtures-list node alongside opda:inclusionStatus. "
        "The Category-D fixtures amount ONLY — the Category-G headline / "
        "recurring / refundable monetary leaves (asking price, ground rent, "
        "deposit, service charge, fee …) do NOT reuse it (ODR-0022 §1 / G1). "
        "The value-structured opda:MonetaryAmount value type now EXISTS (the "
        "Category-G monetary walk, ODR-0024 R3); opda:price deliberately "
        "remains a single-currency interim decimal for the fixtures amount and "
        "is NOT migrated to it.",
        lang="en",
    )))
    g.add((OPDA.price, SKOS.definition, Literal(
        "The amount asked for a fixtures-and-fittings item included in a sale: "
        "a single shared single-currency monetary figure scoped to "
        "fixtures-and-fittings only, distinct from the headline and recurring "
        "monetary leaves.",
        lang="en",
    )))
    g.add((OPDA.price, RDFS.isDefinedBy, _DEFINED_BY))
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
    g.add((OPDA.disclosureDetail, SKOS.definition, Literal(
        "The free-text elaboration of a disclosure answer: a reusable "
        "comment-grade note whose governing question is fixed by the subject "
        "node and the instance-level source, not by the property itself.",
        lang="en",
    )))
    g.add((OPDA.disclosureDetail, RDFS.isDefinedBy, _DEFINED_BY))
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
            OPDA.documentDate, OPDA.AttachedDocument, XSD.date, "document date",
            "Date of a title / additional document. xsd:date. Domain "
            "opda:AttachedDocument (the neutral document bearer; ODR-0024 R7 — "
            "an attached doc is NOT evidence by mere attachment; a document "
            "plays the evidence role via opda:evidenceType, ODR-0027 §R6); "
            "flat per §Q6a.",
            (
                "propertyPack.titlesToBeSold[].additionalDocuments[]."
                "documentDate",
                "propertyPack.titlesToBeSold[].registerExtract.ocSummaryData."
                "documentDetails.document.documentDate",
            ),
        ),
        (
            OPDA.documentTypeCode, OPDA.AttachedDocument, XSD.string,
            "document type code",
            "Type code of a title / additional document. Domain "
            "opda:AttachedDocument (the neutral document bearer; ODR-0024 R7). "
            "Plain string datatype per ODR-0008 §Q5a (no in-data enum; "
            "session-028 Q-SKOS keeps it bare); flat per §Q6a.",
            (
                "propertyPack.titlesToBeSold[].additionalDocuments[]."
                "documentTypeCode",
            ),
        ),
        (
            OPDA.filedUnder, OPDA.AttachedDocument, XSD.string, "filed under",
            "Filing reference under which a title / additional document is "
            "held. Domain opda:AttachedDocument (the neutral document bearer; "
            "ODR-0024 R7); flat per §Q6a.",
            (
                "propertyPack.titlesToBeSold[].additionalDocuments[].filedUnder",
                "propertyPack.titlesToBeSold[].registerExtract.ocSummaryData."
                "documentDetails.document.filedUnder",
            ),
        ),
        (
            OPDA.retrievedOn, OPDA.AttachedDocument, XSD.date, "retrieved on",
            "Date a title / additional document was retrieved from the "
            "registry. xsd:date. Domain opda:AttachedDocument (the neutral "
            "document bearer; ODR-0024 R7); flat per §Q6a.",
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
        g.add((prop, SKOS.definition, Literal(_DEFINITIONS[prop], lang="en")))
        g.add((prop, RDFS.isDefinedBy, _DEFINED_BY))
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
            OPDA.ageRange, OPDA.NearbyFacility, XSD.string, "age range",
            "Age range of a nearby school. Domain opda:NearbyFacility (the "
            "genus bearer; the school band is SHACL-scoped per ODR-0024 R4). "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].ageRange",),
        ),
        (
            OPDA.pupils, OPDA.NearbyFacility, XSD.integer, "pupils",
            "Number of pupils at a nearby school. Domain opda:NearbyFacility "
            "(the genus bearer; the school band is SHACL-scoped per ODR-0024 "
            "R4). Plain integer datatype per ODR-0008 §Q5a; flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].pupils",),
        ),
        (
            OPDA.religiousCharacter, OPDA.NearbyFacility, XSD.string,
            "religious character",
            "Religious character of a nearby school. Domain "
            "opda:NearbyFacility (the genus bearer; the school band is "
            "SHACL-scoped per ODR-0024 R4). Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].religiousCharacter",),
        ),
        (
            OPDA.otherRating, OPDA.NearbyFacility, XSD.string, "other rating",
            "Other (non-Ofsted) rating of a nearby school. Domain "
            "opda:NearbyFacility (the genus bearer; the school band is "
            "SHACL-scoped per ODR-0024 R4). Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].otherRating",),
        ),
        (
            OPDA.typeOfHealthCare, OPDA.NearbyFacility, XSD.string,
            "type of health care",
            "Type of a nearby health-care facility. Domain "
            "opda:NearbyFacility (the genus bearer; the health-care band is "
            "SHACL-scoped per ODR-0024 R4). Plain string datatype per ODR-0008 "
            "§Q5a (no ontology-governed enum in the data dictionary); flat per "
            "§Q6a.",
            ("propertyPack.nearbyFacilities.healthCare[].typeOfHealthCare",),
        ),
        (
            OPDA.specialties, OPDA.NearbyFacility, XSD.string, "specialties",
            "Specialties of a nearby health-care facility (a multi-valued "
            "list — each value an xsd:string). Domain opda:NearbyFacility (the "
            "genus bearer; the health-care band is SHACL-scoped per ODR-0024 "
            "R4). Plain multi-valued string datatype per ODR-0008 §Q5a; flat "
            "per §Q6a.",
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
        g.add((prop, SKOS.definition, Literal(_DEFINITIONS[prop], lang="en")))
        g.add((prop, RDFS.isDefinedBy, _DEFINED_BY))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    # --- opda:schoolType — nearby-school band (ODR-0024 R4 schoolType→SKOS) --
    # The five schoolType.* leaves (college / nursery / primary / secondary /
    # private) were previously minted as five range-less generic opda:
    # ObjectProperties (opda:primary / opda:private / …) — namespace landmines
    # pointing at no emitted node (session-028 Q1, all seats objected). ODR-0024
    # R4 collapses them to ONE opda:schoolType DATATYPE property on the genus
    # opda:NearbyFacility, value-space the opda:SchoolTypeScheme SKOS scheme
    # (College / Nursery / Primary / Secondary / Private), sh:in-restricted in
    # the overlay profile (the schoolType bands are NOT a data-dictionary enum —
    # they are structural sub-keys, so the scheme is minted from the band set,
    # not a live enum). The five collapsed leaf-paths are its §Q3a dct:source
    # array, so each band name stays covered by ci-category-g-coverage. Plain
    # string datatype per ODR-0008 §Q5a (scheme via SHACL); flat per §Q6a.
    g.add((OPDA.schoolType, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.schoolType, RDFS.domain, OPDA.NearbyFacility))
    g.add((OPDA.schoolType, RDFS.range, XSD.string))
    g.add((OPDA.schoolType, RDFS.label, Literal("school type", lang="en")))
    g.add((OPDA.schoolType, RDFS.comment, Literal(
        "Band of a nearby school per opda:SchoolTypeScheme (College / Nursery "
        "/ Primary / Secondary / Private). Domain opda:NearbyFacility (the "
        "genus bearer; the school band is SHACL-scoped per ODR-0024 R4). ONE "
        "shared datatype property over the SchoolTypeScheme value-space — "
        "replaces the five range-less generic object properties "
        "(opda:college / nursery / primary / secondary / private) the council "
        "rejected as permanent-namespace landmines (session-028 Q1). "
        "Constrained by SHACL sh:in to the scheme members in the overlay "
        "profile. Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
        lang="en",
    )))
    g.add((OPDA.schoolType, SKOS.definition, Literal(
        "The educational stage of a nearby school: its band within the "
        "opda:SchoolTypeScheme value-space (College, Nursery, Primary, "
        "Secondary, or Private).",
        lang="en",
    )))
    g.add((OPDA.schoolType, RDFS.isDefinedBy, _DEFINED_BY))
    for _slug in ("college", "nursery", "primary", "secondary", "private"):
        g.add((OPDA.schoolType, DCTERMS.source, _dd_source(
            f"propertyPack.nearbyFacilities.schools[].schoolType.{_slug}"
        )))

    # ==== Category-G curated walk — the MONETARY walk (ADR-0005 §G22) =======
    # ODR-0024 R3 / Council session-028 Q3 / ODR-0008d item-3. The headline /
    # recurring / refundable monetary leaves are NOT collapsed onto the
    # Category-D fixtures opda:price (that conflates incompatible value
    # semantics — ODR-0022 §1/§4/G1). Instead a value-structured
    # opda:MonetaryAmount (magnitude + ISO-4217 currency) is reused as the
    # RANGE across distinct per-economic-kind properties, each on its OWN
    # bearer — "reuse the value type, NEVER the bearer" (Guizzardi-required).
    #
    # --- opda:MonetaryAmount — the value structure (ODR-0024 R3) ---------
    g.add((OPDA.MonetaryAmount, RDF.type, OWL.Class))
    g.add((OPDA.MonetaryAmount, RDFS.label, Literal("Monetary Amount", lang="en")))
    g.add((OPDA.MonetaryAmount, RDFS.comment, Literal(
        "A monetary amount as a value structure: a magnitude (opda:amount, "
        "xsd:decimal) in a currency (opda:currency, an opda:CurrencyScheme "
        "ISO-4217 concept). UFO: a quality value / abstract value structure — "
        "NOT an endurant with independent existence and NOT a Quality of any "
        "bearer. IC (by-value): two opda:MonetaryAmount nodes denote the same "
        "amount iff equal magnitude AND equal currency. Reused as the rdfs:range "
        "across the distinct per-economic-kind monetary properties "
        "(annualGroundRent / annualServiceCharge / rent / holdingDeposit / "
        "securityDeposit / fees / estimatedPrice / soldPrice / listPrice / …), "
        "each bound to its OWN bearer — reuse the value type, NEVER the bearer "
        "(session-028 Q3 / ODR-0024 R3, Guizzardi-required). Distinct from the "
        "Category-D fixtures opda:price (a single-currency interim decimal "
        "scoped to fixtures-and-fittings only, ODR-0022 §4/§1/G1). Follows the "
        "FIBO / schema.org MonetaryAmount pattern (amount + currency).",
        lang="en",
    )))
    g.add((OPDA.MonetaryAmount, SKOS.definition, Literal(
        "A sum of money as a value structure: a numeric magnitude paired with "
        "an ISO-4217 currency, individuated by-value (equal magnitude and "
        "equal currency) and reused as the range of the per-economic-kind "
        "monetary properties.",
        lang="en",
    )))
    g.add((OPDA.MonetaryAmount, RDFS.isDefinedBy, _DEFINED_BY))
    g.add((OPDA.MonetaryAmount, SKOS.scopeNote, Literal(
        "UFO: quality value / abstract individual (Guizzardi 2005 — a value in "
        "a quality structure, not an endurant). DOLCE: Abstract / "
        "Quality-Region (Masolo et al. 2003 D18). Value identity is structural "
        "(magnitude + currency); the currency value-space is governed by "
        "ISO 4217 (opda:CurrencyScheme).",
        lang="en",
    )))
    g.add((OPDA.MonetaryAmount, DCTERMS.source, _ODR_0024_R3))

    # --- opda:amount — the magnitude dimension (covers the `amount` leaf) -
    g.add((OPDA.amount, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.amount, RDFS.domain, OPDA.MonetaryAmount))
    g.add((OPDA.amount, RDFS.range, XSD.decimal))
    g.add((OPDA.amount, RDFS.label, Literal("amount", lang="en")))
    g.add((OPDA.amount, RDFS.comment, Literal(
        "The magnitude of an opda:MonetaryAmount (xsd:decimal) — the numeric "
        "dimension of the value structure (the currency dimension is "
        "opda:currency). Covers the data-dictionary `amount` leaf (estate "
        "rentcharge / service-charge reserve-fund / local-land-charge "
        "amounts). Flat per ODR-0008 §Q6a.",
        lang="en",
    )))
    g.add((OPDA.amount, SKOS.definition, Literal(
        "The numeric magnitude of a monetary amount: the decimal-valued size "
        "dimension of an opda:MonetaryAmount value structure, paired with its "
        "currency.",
        lang="en",
    )))
    g.add((OPDA.amount, RDFS.isDefinedBy, _DEFINED_BY))
    for _p in (
        "propertyPack.ownership.ownershipsToBeTransferred[].estateRentcharges.amount",
        "propertyPack.ownership.ownershipsToBeTransferred[]."
        "managedFreeholdOrCommonholdInformation.serviceCharge.reserveFund.amount",
        "propertyPack.localSearches.localLandCharges[].amount",
    ):
        g.add((OPDA.amount, DCTERMS.source, _dd_source(_p)))

    # --- opda:currency — the currency dimension (→ opda:CurrencyScheme) --
    g.add((OPDA.currency, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.currency, RDFS.domain, OPDA.MonetaryAmount))
    g.add((OPDA.currency, RDFS.range, SKOS.Concept))
    g.add((OPDA.currency, RDFS.label, Literal("currency", lang="en")))
    g.add((OPDA.currency, RDFS.comment, Literal(
        "The currency of an opda:MonetaryAmount — a dereferenceable "
        "opda:CurrencyScheme concept (ISO-4217 alpha-3), NEVER an opaque "
        "string. The MonetaryAmount node shape makes it sh:minCount 1 (never "
        "absent on the value type) and sh:in-restricts it to the scheme; the "
        "overlay profile supplies GBP as the default (ODR-0024 R3).",
        lang="en",
    )))
    g.add((OPDA.currency, SKOS.definition, Literal(
        "The currency of a monetary amount: the ISO-4217 opda:CurrencyScheme "
        "concept denominating an opda:MonetaryAmount value structure.",
        lang="en",
    )))
    g.add((OPDA.currency, RDFS.isDefinedBy, _DEFINED_BY))
    g.add((OPDA.currency, DCTERMS.source, _ODR_0024_R3))

    # --- The 16 per-economic-kind monetary properties (range MonetaryAmount)
    # Bearer per the data-dictionary path: LegalEstate (lease/estate tenure
    # charges), Property (council-tax / parking / letting / building-safety),
    # Valuation (comparable + estimate pricing), Transaction (transfer/notice
    # fees + deed costs). Each flat per §Q6a; rdfs:range opda:MonetaryAmount.
    _fee_base = "propertyPack.ownership.ownershipsToBeTransferred[]"
    _fee_paths = tuple(
        f"{_fee_base}.{branch}.{party}.feeIncludingVAT"
        for branch, parties in (
            (
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "noticeOfTransferAndCharge",
                ("rentchargeOwner", "managementCompany", "managingAgent",
                 "legalRepresentative", "other"),
            ),
            (
                "leaseholdInformation.contactDetails.serviceContactAssignments."
                "noticeOfAssignmentAndCharge",
                ("landlord", "managementCompany", "managingAgent", "other"),
            ),
            (
                "leaseholdInformation.contactDetails.serviceContactAssignments."
                "noticeOfTransferAndCharge",
                ("rentchargeOwner", "managementCompany", "managingAgent",
                 "legalRepresentative", "other"),
            ),
        )
        for party in parties
    )
    _walk_monetary: list[tuple[URIRef, URIRef, str, str, tuple[str, ...]]] = [
        # --- LegalEstate-borne (lease / estate tenure charges) ------------
        (
            OPDA.annualGroundRent, OPDA.LegalEstate, "annual ground rent",
            "Annual ground rent payable under a leasehold estate. Bearer "
            "opda:LegalEstate (a tenure charge of the leasehold, not a "
            "Quality of the brick-and-mortar Property). → opda:MonetaryAmount "
            "(ODR-0024 R3); flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.groundRent.annualGroundRent",),
        ),
        (
            OPDA.annualServiceCharge, OPDA.LegalEstate, "annual service charge",
            "Annual service charge payable under a leasehold or managed "
            "freehold/commonhold estate. Bearer opda:LegalEstate. → "
            "opda:MonetaryAmount (ODR-0024 R3); flat per §Q6a.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.serviceCharge."
                "annualServiceCharge",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.serviceCharge.annualServiceCharge",
            ),
        ),
        (
            OPDA.certificateOfComplianceFee, OPDA.LegalEstate,
            "certificate of compliance fee",
            "Fee for a certificate of compliance required on a leasehold "
            "transfer (required-documents block). Bearer opda:LegalEstate. → "
            "opda:MonetaryAmount (ODR-0024 R3); flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.requiredDocuments.certificateOfComplianceFee",),
        ),
        (
            OPDA.sharedOwnershipRent, OPDA.LegalEstate, "shared ownership rent",
            "Rent payable on the retained share under a shared-ownership "
            "lease. Bearer opda:LegalEstate. → opda:MonetaryAmount (ODR-0024 "
            "R3); flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.sharedOwnership.sharedOwnershipRent",),
        ),
        # --- Property-borne (council tax / parking / letting / safety) ----
        (
            OPDA.councilTaxAnnualCharge, OPDA.Property,
            "council tax annual charge",
            "Annual council-tax charge for the Property. Bearer opda:Property "
            "(a recurring liability of the dwelling). → opda:MonetaryAmount "
            "(ODR-0024 R3); flat per §Q6a.",
            ("propertyPack.councilTax.councilTaxAnnualCharge",),
        ),
        (
            OPDA.annualCostOfPermit, OPDA.Property, "annual cost of permit",
            "Annual cost of a controlled-parking permit for the Property. "
            "Bearer opda:Property. → opda:MonetaryAmount (ODR-0024 R3); flat "
            "per §Q6a.",
            ("propertyPack.parking.controlledParking.annualCostOfPermit",),
        ),
        (
            OPDA.rent, OPDA.Property, "rent",
            "Rent in the Property's letting information. Bearer opda:Property "
            "(letting terms of the dwelling; no Tenancy Kind is minted — "
            "promote on a named query). → opda:MonetaryAmount (ODR-0024 R3); "
            "flat per §Q6a.",
            ("propertyPack.lettingInformation.rent",),
        ),
        (
            OPDA.holdingDeposit, OPDA.Property, "holding deposit",
            "Holding deposit in the Property's letting information (refundable "
            "— distinct value semantics from a sale price). Bearer "
            "opda:Property. → opda:MonetaryAmount (ODR-0024 R3); flat per §Q6a.",
            ("propertyPack.lettingInformation.holdingDeposit",),
        ),
        (
            OPDA.securityDeposit, OPDA.Property, "security deposit",
            "Security/tenancy deposit in the Property's letting information "
            "(refundable). Bearer opda:Property. → opda:MonetaryAmount "
            "(ODR-0024 R3); flat per §Q6a.",
            ("propertyPack.lettingInformation.securityDeposit",),
        ),
        (
            OPDA.potentialCost, OPDA.Property, "potential cost",
            "Potential remediation cost in the Property's building-safety "
            "disclosure (council session-028 Q3 re-filed this monetary leaf "
            "from free-text to the monetary walk; the data-dictionary source "
            "is free text, so the magnitude is best-effort). Bearer "
            "opda:Property. → opda:MonetaryAmount (ODR-0024 R3); flat per §Q6a.",
            ("propertyPack.typeOfConstruction.buildingSafety.potentialCost",),
        ),
        # --- Valuation-borne (comparable + estimate pricing) --------------
        (
            OPDA.estimatedPrice, OPDA.Valuation, "estimated price",
            "Estimated sale price in a Valuation's pricing analysis. Bearer "
            "opda:Valuation. → opda:MonetaryAmount (ODR-0024 R3); flat per "
            "§Q6a.",
            ("valuationComparisonData.propertyPricing.estimatedPrice",),
        ),
        (
            OPDA.estimatedAmount, OPDA.Valuation, "estimated amount",
            "Estimated rental amount in a Valuation's rental-estimate "
            "analysis. Bearer opda:Valuation. → opda:MonetaryAmount (ODR-0024 "
            "R3); flat per §Q6a.",
            ("valuationComparisonData.propertyPricing.rentalEstimate."
             "estimatedAmount",),
        ),
        (
            OPDA.listPrice, OPDA.Valuation, "list price",
            "List price of a comparable property (valuation comparable "
            "listing info). Bearer opda:Valuation. → opda:MonetaryAmount "
            "(ODR-0024 R3); flat per §Q6a.",
            ("valuationComparisonData.propertyDetails[].propertyListingInfo."
             "listPrice",),
        ),
        (
            OPDA.soldPrice, OPDA.Valuation, "sold price",
            "Sold price of a comparable property (valuation comparable "
            "listing info). Bearer opda:Valuation. → opda:MonetaryAmount "
            "(ODR-0024 R3); flat per §Q6a.",
            ("valuationComparisonData.propertyDetails[].propertyListingInfo."
             "soldPrice",),
        ),
        # --- Transaction-borne (transfer / notice fees + deed costs) ------
        (
            OPDA.costsApplicableToTheDeed, OPDA.Transaction,
            "costs applicable to the deed",
            "Costs applicable to a deed of covenant required on transfer. "
            "Bearer opda:Transaction (a completion/transfer cost, not a "
            "standing estate charge). → opda:MonetaryAmount (ODR-0024 R3); "
            "flat per §Q6a.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.transferAndRegistration."
                "deedOfCovenantRequired.costsApplicableToTheDeed",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.transferAndRegistration."
                "deedOfCovenantRequired.costsApplicableToTheDeed",
            ),
        ),
        (
            OPDA.feeIncludingVAT, OPDA.Transaction, "fee including VAT",
            "Fee (including VAT) charged by a party for serving a notice of "
            "transfer / assignment / charge during conveyancing. Bearer "
            "opda:Transaction (a transfer-process fee). → opda:MonetaryAmount "
            "(ODR-0024 R3); ONE shared property across the notice-fee blocks; "
            "flat per §Q6a.",
            _fee_paths,
        ),
    ]
    for prop, domain, label, comment, paths in _walk_monetary:
        g.add((prop, RDF.type, OWL.ObjectProperty))
        g.add((prop, RDFS.domain, domain))
        g.add((prop, RDFS.range, OPDA.MonetaryAmount))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(_DEFINITIONS[prop], lang="en")))
        g.add((prop, RDFS.isDefinedBy, _DEFINED_BY))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    # ==== Category-G curated walk — the R5-surfaced follow-on (§G23) ========
    # ODR-0024 R5/R6: the structural C-vs-G rule grew candidate-G 188→239 by
    # surfacing enum-bearing attributes + substantive yes/no Property/estate
    # facts the old 7-name allow-list mis-binned to Category C. Each is a flat
    # datatype property per ODR-0008 §Q5a, flat per §Q6a; range from the
    # data-dictionary `type` (xsd:string for the Yes/No/Not-known disclosure
    # answers + the enum labels; xsd:decimal for the two reserve-fund splits).
    # SIX enum leaves are value-spaced over their ODR-0024 R6 SKOS schemes
    # (construction / price-qualifier / transport / broadband / Ofsted) +
    # marketingTenure over the existing TenureKindScheme (reuse-before-mint) —
    # sh:in-restricted via the descriptive enum shapes (shapes.py, the
    # sh:targetSubjectsOf idiom; no overlay required).
    _walk_r5: list[
        tuple[URIRef, URIRef, URIRef, str, str, tuple[str, ...]]
    ] = [
        # --- Property-borne enum leaves (→ ODR-0024 R6 SKOS schemes) -------
        (
            OPDA.constructionType, OPDA.Property, XSD.string,
            "construction type",
            "Structural construction type of the Property (brick-and-block / "
            "timber frame / SIP / …) — value-space opda:ConstructionTypeScheme "
            "(ODR-0024 R6), sh:in-restricted via the descriptive enum shape. "
            "A Quale of opda:Property; flat per §Q6a.",
            ("propertyPack.surveys[].misc.constructionType",),
        ),
        (
            OPDA.priceQualifier, OPDA.Property, XSD.string, "price qualifier",
            "Qualifier on the marketed price (Guide price / Offers over / …) — "
            "value-space opda:PriceQualifierScheme (ODR-0024 R6), "
            "sh:in-restricted via the descriptive enum shape. Borne on "
            "opda:Property (the marketing price information); the Mode-vs-"
            "Quality nuance is held by session-029. Flat per §Q6a.",
            ("propertyPack.priceInformation.priceQualifier",),
        ),
        (
            OPDA.typeOfConnection, OPDA.Property, XSD.string,
            "type of connection",
            "Broadband connection type of the Property (FTTP / FTTC / cable / "
            "…) — value-space opda:BroadbandConnectionTypeScheme (ODR-0024 R6), "
            "sh:in-restricted via the descriptive enum shape. Flat per §Q6a.",
            ("propertyPack.connectivity.broadband.typeOfConnection",),
        ),
        (
            OPDA.marketingTenure, OPDA.Property, XSD.string, "marketing tenure",
            "Marketed tenure of the Property (Freehold / Leasehold / "
            "Commonhold) — value-space the existing opda:TenureKindScheme "
            "(ODR-0024 R6: reuse-before-mint, NOT a third tenure scheme), "
            "sh:in-restricted via the descriptive enum shape. Flat per §Q6a.",
            ("propertyPack.marketingTenure",),
        ),
        # --- NearbyFacility-borne enum leaves (genus bearer, as schoolType) -
        (
            OPDA.transportType, OPDA.NearbyFacility, XSD.string,
            "transport type",
            "Type of a nearby transport facility (rail station / bus stop / "
            "…) — value-space opda:TransportTypeScheme (ODR-0024 R6), "
            "sh:in-restricted via the descriptive enum shape. Domain "
            "opda:NearbyFacility (the genus bearer, as opda:schoolType). Flat "
            "per §Q6a.",
            ("propertyPack.nearbyFacilities.transport[].transportType",),
        ),
        (
            OPDA.ofstedRating, OPDA.NearbyFacility, XSD.string, "Ofsted rating",
            "Ofsted rating of a nearby school (Outstanding / Good / …) — "
            "value-space opda:OfstedRatingScheme (ODR-0024 R6), "
            "sh:in-restricted via the descriptive enum shape. Domain "
            "opda:NearbyFacility (the genus bearer). Flat per §Q6a.",
            ("propertyPack.nearbyFacilities.schools[].ofstedRating",),
        ),
        # --- Property-borne Yes/No / disclosure flags (xsd:string) --------
        (
            OPDA.hasLift, OPDA.Property, XSD.string, "has lift",
            "Whether the Property (building) has a lift. Yes/No disclosure; "
            "xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.buildInformation.building.hasLift",),
        ),
        (
            OPDA.isHMO, OPDA.Property, XSD.string, "is HMO",
            "Whether the Property is a House in Multiple Occupation. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.buildInformation.isHMO",),
        ),
        (
            OPDA.isStudentAccommodation, OPDA.Property, XSD.string,
            "is student accommodation",
            "Whether the Property is student accommodation. Yes/No disclosure; "
            "xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.buildInformation.isStudentAccommodation",),
        ),
        (
            OPDA.hasFloorplan, OPDA.Property, XSD.string, "has floorplan",
            "Whether a floorplan is available for the Property. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.buildInformation.roomDimensions.hasFloorplan",),
        ),
        (
            OPDA.loftInsulated, OPDA.Property, XSD.string, "loft insulated",
            "Whether the Property's loft is insulated. Yes/No disclosure; "
            "xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.typeOfConstruction.loft.loftInsulated",),
        ),
        (
            OPDA.loftBoarded, OPDA.Property, XSD.string, "loft boarded",
            "Whether the Property's loft is boarded. Yes/No disclosure; "
            "xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.typeOfConstruction.loft.loftBoarded",),
        ),
        (
            OPDA.hasFloodDefences, OPDA.Property, XSD.string,
            "has flood defences",
            "Whether the Property has flood defences. Yes/No disclosure; "
            "xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.environmentalIssues.flooding.floodDefences."
             "hasFloodDefences",),
        ),
        (
            OPDA.isConnectedToNationalGrid, OPDA.Property, XSD.string,
            "is connected to national grid",
            "Whether the Property's solar panels are connected to the national "
            "grid. Yes/No disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.electricity.solarPanels.isConnectedToNationalGrid",),
        ),
        (
            OPDA.isFirstRegistration, OPDA.Property, XSD.string,
            "is first registration",
            "Whether the sale is a first registration of the title. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.isFirstRegistration",),
        ),
        (
            OPDA.isLimitedCompanySale, OPDA.Property, XSD.string,
            "is limited company sale",
            "Whether the seller is a limited company. Yes/No disclosure; "
            "xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.isLimitedCompanySale",),
        ),
        (
            OPDA.hasHelpToBuyEquityLoan, OPDA.Property, XSD.string,
            "has Help to Buy equity loan",
            "Whether the Property has a Help to Buy equity loan. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.hasHelpToBuyEquityLoan",),
        ),
        (
            OPDA.saleAtUndervalue, OPDA.Property, XSD.string,
            "sale at undervalue",
            "Whether the sale is at undervalue. Yes/No disclosure (price "
            "information); xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.priceInformation.saleAtUndervalue",),
        ),
        (
            OPDA.landlordInsuresIfFlat, OPDA.Property, XSD.string,
            "landlord insures if flat",
            "Whether the landlord arranges buildings insurance (flat). Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.insurance.landlordInsuresIfFlat",),
        ),
        (
            OPDA.willingToInsure, OPDA.Property, XSD.string, "willing to insure",
            "Whether an insurer is willing to insure against an unresolved "
            "planning issue. Yes/No disclosure; xsd:string per §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.alterationsAndChanges.unresolvedPlanningIssues."
             "willingToInsure",),
        ),
        (
            OPDA.managementPlanInPlace, OPDA.Property, XSD.string,
            "management plan in place",
            "Whether a Japanese-knotweed management plan is in place. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.specialistIssues.japaneseKnotweed."
             "managementPlanInPlace",),
        ),
        (
            OPDA.consentsObtained, OPDA.Property, XSD.string,
            "consents obtained",
            "Whether consents were obtained for work under a tree-preservation "
            "order. Yes/No disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.listingAndConservation.hasTreePreservationOrder."
             "workCarriedOut.consentsObtained",),
        ),
        (
            OPDA.dischargeCompliesWithGBR, OPDA.Property, XSD.string,
            "discharge complies with GBR",
            "Whether off-mains drainage discharge complies with the General "
            "Binding Rules. Yes/No disclosure; xsd:string per §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.waterAndDrainage.drainage.mainsFoulDrainage."
             "offMainsDrainageSystem.plantDrainsIntoWaterway."
             "dischargeCompliesWithGBR",),
        ),
        # --- LegalEstate-borne flags + references (lease / estate) ---------
        (
            OPDA.isLeaseQualifying, OPDA.LegalEstate, XSD.string,
            "is lease qualifying",
            "Whether the lease is a qualifying lease under the Building Safety "
            "Act. Yes/No disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.buildingSafetyAct.isLeaseQualifying",),
        ),
        (
            OPDA.landlordNotifiedOfSale, OPDA.LegalEstate, XSD.string,
            "landlord notified of sale",
            "Whether the landlord has been notified of the sale (Building "
            "Safety Act). Yes/No disclosure; xsd:string per §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.buildingSafetyAct.landlordNotifiedOfSale",),
        ),
        (
            OPDA.sellerCompletedDeedOfCertificate, OPDA.LegalEstate, XSD.string,
            "seller completed deed of certificate",
            "Whether the seller completed a deed of certificate (Building "
            "Safety Act). Yes/No disclosure; xsd:string per §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.buildingSafetyAct.deedOfCertificateServed."
             "sellerCompletedDeedOfCertificate",),
        ),
        (
            OPDA.dangerousCladdingOrDefects, OPDA.LegalEstate, XSD.string,
            "dangerous cladding or defects",
            "Whether there is dangerous cladding or building-safety defects. "
            "Yes/No disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.serviceCharge.dangerousCladdingOrDefects",),
        ),
        (
            OPDA.contributionIncludedInServiceCharge, OPDA.LegalEstate,
            XSD.string, "contribution included in service charge",
            "Whether a reserve-fund contribution is included in the service "
            "charge. Yes/No disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.serviceCharge.reserveFund."
             "contributionIncludedInServiceCharge",),
        ),
        (
            OPDA.isManagingAgentEmployed, OPDA.LegalEstate, XSD.string,
            "is managing agent employed",
            "Whether a managing agent is employed for the estate. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.ownershipAndManagement."
             "isManagingAgentEmployed",),
        ),
        (
            OPDA.hasTenantCompanyDissolved, OPDA.LegalEstate, XSD.string,
            "has tenant company dissolved",
            "Whether the tenant management company has been dissolved. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.ownershipAndManagement."
             "hasTenantCompanyDissolved",),
        ),
        (
            OPDA.headLeaseholderControlled, OPDA.LegalEstate, XSD.string,
            "head leaseholder controlled",
            "Whether the head lease is leaseholder-controlled. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.ownershipAndManagement.hasHeadlease."
             "headLeaseholderControlled",),
        ),
        (
            OPDA.organisesBuildingInsurance, OPDA.LegalEstate, XSD.string,
            "organises building insurance",
            "Whether the service contact organises buildings insurance. Yes/No "
            "disclosure; xsd:string per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.contactDetails.serviceContactAssignments."
             "organisesBuildingInsurance",),
        ),
        (
            OPDA.sellerOwnedProperty, OPDA.LegalEstate, XSD.string,
            "seller owned property",
            "Whether the seller owned the property for enfranchisement "
            "qualification. Yes/No disclosure; xsd:string per §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.enfranchisement.sellerOwnedProperty",),
        ),
        (
            OPDA.outstandingEnforcementAction, OPDA.LegalEstate, XSD.string,
            "outstanding enforcement action",
            "Whether there is outstanding enforcement action (managed-area "
            "risk assessment). Yes/No disclosure; xsd:string per §Q5a; flat "
            "per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.buildingsInsurance."
             "managedAreasCoveredByPolicy.riskAssessments."
             "outstandingEnforcementAction",),
        ),
        (
            OPDA.urgentWorksCarriedOut, OPDA.LegalEstate, XSD.string,
            "urgent works carried out",
            "Whether urgent works were carried out (managed-area risk "
            "assessment). Yes/No disclosure; xsd:string per §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.buildingsInsurance."
             "managedAreasCoveredByPolicy.riskAssessments."
             "urgentWorksCarriedOut",),
        ),
        (
            OPDA.urgentWorksRecommended, OPDA.LegalEstate, XSD.string,
            "urgent works recommended",
            "Whether urgent works were recommended (managed-area risk "
            "assessment). Yes/No disclosure; xsd:string per §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.buildingsInsurance."
             "managedAreasCoveredByPolicy.riskAssessments."
             "urgentWorksRecommended",),
        ),
        (
            OPDA.dealsWithDayToDayMaintenanceOfManagedArea, OPDA.LegalEstate,
            XSD.string, "deals with day-to-day maintenance of managed area",
            "Whether the contact deals with day-to-day maintenance of the "
            "managed area. Yes/No disclosure; xsd:string per §Q5a; flat per "
            "§Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "managedFreeholdOrCommonholdInformation.contactDetails."
             "dealsWithDayToDayMaintenanceOfManagedArea",),
        ),
        (
            OPDA.freeholdOwner, OPDA.LegalEstate, XSD.string, "freehold owner",
            "Freehold owner named in the leasehold ownership-and-management "
            "block (a reference/name string, not a Yes/No flag). xsd:string "
            "per §Q5a; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "leaseholdInformation.ownershipAndManagement.freeholdOwner",),
        ),
        (
            OPDA.forTheManagedAreas, OPDA.LegalEstate, XSD.decimal,
            "for the managed areas",
            "Portion of the service-charge reserve-fund amount attributable to "
            "the managed areas (a numeric split of the reserve fund). "
            "xsd:decimal; flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "managedFreeholdOrCommonholdInformation.serviceCharge.reserveFund."
             "amount.forTheManagedAreas",),
        ),
        (
            OPDA.fromTheOwners, OPDA.LegalEstate, XSD.decimal, "from the owners",
            "Portion of the service-charge reserve-fund amount contributed by "
            "the owners (a numeric split of the reserve fund). xsd:decimal; "
            "flat per §Q6a.",
            ("propertyPack.ownership.ownershipsToBeTransferred[]."
             "managedFreeholdOrCommonholdInformation.serviceCharge.reserveFund."
             "amount.fromTheOwners",),
        ),
    ]
    # The 6 enum properties are now ObjectProperty/skos:Concept (Council-046 Q3b).
    _r5_scheme_valued = {
        OPDA.constructionType, OPDA.priceQualifier, OPDA.typeOfConnection,
        OPDA.marketingTenure, OPDA.transportType, OPDA.ofstedRating,
    }
    for prop, domain, rng, label, comment, paths in _walk_r5:
        if prop in _r5_scheme_valued:
            g.add((prop, RDF.type, OWL.ObjectProperty))
            g.add((prop, RDFS.domain, domain))
            g.add((prop, RDFS.range, SKOS.Concept))
        else:
            g.add((prop, RDF.type, OWL.DatatypeProperty))
            g.add((prop, RDFS.domain, domain))
            g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(_DEFINITIONS[prop], lang="en")))
        g.add((prop, RDFS.isDefinedBy, _DEFINED_BY))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    # ==== Category-G curated walk — the ROOM-DIMENSION model (session-030) ==
    # ODR-0023 R3 / Council session-030 (ODR-0024 R10): opda:Room and
    # opda:Building are NOT promoted to classes — Room has no data-realisable
    # identity (roomName is a non-rigid label, no positional token), and
    # opda:Building's +O IC (the ODR-0005 §3a-4 Replacement witness) is genuine
    # but latent/unexercised. The roomDimensions.rooms[] repeating group is
    # modelled as an ANONYMOUS by-value structure (the opda:MonetaryAmount
    # pattern, ODR-0024 R3) on opda:Property — reuse the value structure, mint
    # no Kind.
    g.add((OPDA.RoomDimension, RDF.type, OWL.Class))
    g.add((OPDA.RoomDimension, RDFS.label, Literal("Room Dimension", lang="en")))
    g.add((OPDA.RoomDimension, RDFS.comment, Literal(
        "A room's dimensions as a value structure — a length + width "
        "(xsd:decimal, metres) and a non-rigid roomName, one per room in a "
        "Property's roomDimensions.rooms[] repeating group. An ANONYMOUS "
        "by-value structure (no identity criterion, no key — individuated by "
        "its values), NOT a Substance Kind: Council session-030 ruled neither "
        "opda:Room nor opda:Building earns a class (Room has no data-realisable "
        "identity — roomName non-rigid, no positional token; opda:Building's +O "
        "IC via the ODR-0005 §3a-4 Replacement witness is genuine but latent). "
        "Reuses the opda:MonetaryAmount by-value pattern (ODR-0024 R3); attached "
        "to opda:Property via opda:hasRoomDimension (characterisation, NOT "
        "parthood — no mereology, no transitivity). Re-homes losslessly onto a "
        "future opda:Room/opda:Building if an identity fact ever earns the Kind.",
        lang="en",
    )))
    g.add((OPDA.RoomDimension, SKOS.definition, Literal(
        "The dimensions of a single room as a value structure: a length and "
        "width in metres together with a non-rigid room name, individuated "
        "by-value and characterising a property without asserting any room "
        "individual.",
        lang="en",
    )))
    g.add((OPDA.RoomDimension, RDFS.isDefinedBy, _DEFINED_BY))
    g.add((OPDA.RoomDimension, SKOS.scopeNote, Literal(
        "UFO: a quality-value structure (a bundle of Quale-in-Region values), "
        "not an endurant (Guizzardi 2005); the dimensions are Qualities of a "
        "room-feature of the Property (DOLCE feature). Value identity is "
        "structural (by-value); no instance identity is claimed (session-030).",
        lang="en",
    )))
    g.add((OPDA.RoomDimension, DCTERMS.source, _ODR_0024_R10))

    # opda:hasRoomDimension — opda:Property -> opda:RoomDimension (0..*)
    g.add((OPDA.hasRoomDimension, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasRoomDimension, RDFS.domain, OPDA.Property))
    g.add((OPDA.hasRoomDimension, RDFS.range, OPDA.RoomDimension))
    g.add((OPDA.hasRoomDimension, RDFS.label,
           Literal("has room dimension", lang="en")))
    g.add((OPDA.hasRoomDimension, RDFS.comment, Literal(
        "Relates an opda:Property to a room-dimension value structure (one per "
        "room in roomDimensions.rooms[]). Characterisation of a value, NOT "
        "mereological parthood (no opda:Room individual is asserted) and NOT "
        "transitive (Council session-030 / ODR-0024 R10).",
        lang="en",
    )))
    g.add((OPDA.hasRoomDimension, SKOS.definition, Literal(
        "The link from a property to one of its room-dimension value "
        "structures: a non-transitive characterisation relating a property to "
        "a room's length, width, and name, one per room.",
        lang="en",
    )))
    g.add((OPDA.hasRoomDimension, RDFS.isDefinedBy, _DEFINED_BY))
    g.add((OPDA.hasRoomDimension, DCTERMS.source, _ODR_0024_R10))

    # the three by-value room-dimension fields (no key; roomName non-rigid)
    _walk_room: list[tuple[URIRef, URIRef, str, str, str]] = [
        (
            OPDA.length, XSD.decimal, "length",
            "Length of a room in metres (xsd:decimal) — a Quale-in-Region field "
            "of the opda:RoomDimension value structure. Metres by convention "
            "(NO opda:UnitOfLengthScheme — session-030 / ODR-0024 R10, reusing "
            "the opda:area no-unit-scheme precedent). Flat per ODR-0008 §Q6a.",
            "propertyPack.buildInformation.roomDimensions.rooms[].length",
        ),
        (
            OPDA.width, XSD.decimal, "width",
            "Width of a room in metres (xsd:decimal) — a Quale-in-Region field "
            "of the opda:RoomDimension value structure. Metres by convention "
            "(no opda:UnitOfLengthScheme). Flat per ODR-0008 §Q6a.",
            "propertyPack.buildInformation.roomDimensions.rooms[].width",
        ),
        (
            OPDA.roomName, XSD.string, "room name",
            "Name of a room (xsd:string) — a NON-RIGID label on the "
            "opda:RoomDimension value structure, NOT an identity principle and "
            "never a key (ODR-0024 R10 / session-030). Flat per ODR-0008 §Q6a.",
            "propertyPack.buildInformation.roomDimensions.rooms[].roomName",
        ),
    ]
    for prop, rng, label, comment, path in _walk_room:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, OPDA.RoomDimension))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(_DEFINITIONS[prop], lang="en")))
        g.add((prop, RDFS.isDefinedBy, _DEFINED_BY))
        g.add((prop, DCTERMS.source, _dd_source(path)))

    # --- opda:Room / opda:Building classes: NOT minted (session-030) -----
    # Council session-030 (ODR-0023 R3 / ODR-0024 R10) ruled NEITHER opda:Room
    # nor opda:Building earns a class: Room has no data-realisable identity
    # (roomName non-rigid, no positional token); opda:Building's +O IC
    # (ODR-0005 §3a-4 Replacement) is genuine but LATENT. The room data is
    # modelled above as the anonymous by-value opda:RoomDimension structure;
    # the classes are NOT emitted as triples.
    #
    # Re-open trigger (an IDENTITY FACT, not a calendar gate): opda:Building on
    # a built structure shared across Properties / re-identified across dated
    # surveys; opda:Room on a stable room positional-or-structural token in
    # source + a query that re-identifies a room as an individual.

    return g
