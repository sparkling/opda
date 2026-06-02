"""
Tests for the descriptive-layer import (ODR-0022) — Category A reusable
disclosure-detail property + gate G2 schema-leaf-path `dct:source`.

Realises:
- ODR-0022 §Rules.1 Category A — ONE reusable `opda:disclosureDetail`
  annotation property (rdfs:comment-grade, range xsd:string) absorbing the
  ~407 free-text disclosure tails; NO per-question detail property.
- ODR-0022 §Rules.2 gate G2 / ODR-0008 §Q3a — descriptive datatype
  properties carry `dct:source` to their **schema leaf path** (the
  form-question IRI), as a per-overlay-leaf-path array for spanning leaves,
  NEVER to the deciding ODR section.
"""

from __future__ import annotations

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, XSD

from opda_gen.emitters.modules import descriptive
from opda_gen.inputs.data_dictionary import DictionaryLeaf
from opda_gen.term_sourcing import schema_leaf_source, schema_leaf_sources


OPDA = Namespace("https://opda.org.uk/pdtf/")


# ---------------------------------------------------------------------------
# Category A — opda:disclosureDetail (ODR-0022 §Rules.1)
# ---------------------------------------------------------------------------
def test_disclosure_detail_emitted_once() -> None:
    """ODR-0022 §Rules.1 Category A: exactly one reusable disclosure-detail
    datatype property, rdfs:comment-grade with range xsd:string."""
    g = descriptive.build_graph()
    assert (OPDA.disclosureDetail, RDF.type, OWL.DatatypeProperty) in g
    assert (OPDA.disclosureDetail, RDFS.range, XSD.string) in g
    assert (OPDA.disclosureDetail, RDFS.label, None) in g
    assert (OPDA.disclosureDetail, RDFS.comment, None) in g


def test_disclosure_detail_is_flat_no_subproperty() -> None:
    """ODR-0022 §Rules.6: the disclosure tail collapses to ONE flat
    property — never a per-question detail property, never a subproperty
    hierarchy. The flatness invariant (§Q6a) holds for EVERY descriptive
    datatype property: none carries rdfs:subPropertyOf."""
    g = descriptive.build_graph()
    assert (OPDA.disclosureDetail, RDFS.subPropertyOf, None) not in g
    # The original descriptive datatype properties — disclosureDetail
    # (Category A) + the ODR-0008d Category-E rating-bearing pair
    # (riskIndicator, actionAlertRating) + the ODR-0022 Category-D
    # sale-transaction fixtures pair (inclusionStatus, price) — plus the
    # ADR-0031 Category-G curated-walk search / planning / building-control /
    # risk-assessment / artefact-reference datatype properties (Family D), all
    # flat per §Q6a.
    dtps = set(g.subjects(RDF.type, OWL.DatatypeProperty))
    assert {
        OPDA.disclosureDetail,
        OPDA.riskIndicator,
        OPDA.actionAlertRating,
        OPDA.inclusionStatus,
        OPDA.price,
    } <= dtps
    # §Q6a flatness: NO descriptive datatype property is a subproperty.
    for dtp in dtps:
        assert (dtp, RDFS.subPropertyOf, None) not in g


def test_disclosure_detail_sources_to_odr_0022_not_a_leaf() -> None:
    """The reusable property's own `dct:source` points at ODR-0022 §1 (its
    deciding record) — it is NOT a per-question descriptive leaf, so it is
    not subject to the G2 schema-leaf-path rule. (Per ODR-0022 §Rules.1 the
    question is carried by the subject + the INSTANCE-level dct:source.)"""
    g = descriptive.build_graph()
    sources = list(g.objects(OPDA.disclosureDetail, DCTERMS.source))
    assert len(sources) == 1
    assert str(sources[0]) == "https://opda.org.uk/pdtf/harness/odr/ODR-0022/section-Rules-1"


def test_disclosure_detail_in_module_catalogue() -> None:
    """The module catalogue advertises disclosureDetail so coverage tests
    can introspect it without re-parsing."""
    assert OPDA.disclosureDetail in descriptive.DATATYPE_PROPERTIES


# ---------------------------------------------------------------------------
# Gate G2 — schema-leaf-path dct:source (ODR-0022 §Rules.2 / ODR-0008 §Q3a)
# ---------------------------------------------------------------------------
def test_schema_leaf_source_mints_form_question_iri() -> None:
    """G2: the minted source is a `…/forms/<overlay>#<leaf.path>`
    form-question IRI under the stable w3id base — NOT an ODR section."""
    iri = schema_leaf_source(
        "baspi5", "propertyPack.buildInformation.building.builtForm"
    )
    assert iri == (
        "https://w3id.org/opda/forms/baspi5"
        "#propertyPack.buildInformation.building.builtForm"
    )
    # Crucially: it must NOT be a deciding-ODR section anchor (the G2 defect).
    assert "/odr/ODR-" not in iri


def test_schema_leaf_sources_is_per_overlay_array() -> None:
    """G2 / §Q3a: a leaf spanning multiple overlay leaf-paths produces an
    ARRAY of schema-leaf-path sources (one per overlay leaf-path), sorted
    for deterministic emission, and never the deciding ODR."""
    dictionary = {
        "propertyPack.buildInformation.building.builtForm": DictionaryLeaf(
            leaf_path="propertyPack.buildInformation.building.builtForm",
            datatype="xsd:string",
            comment="Built form.",
            cardinality="0..1",
            source_iri="nts2",
        ),
        "propertyPack.energyEfficiency.certificate.builtForm": DictionaryLeaf(
            leaf_path="propertyPack.energyEfficiency.certificate.builtForm",
            datatype="xsd:string",
            comment="Built form (EPC).",
            cardinality="0..1",
            source_iri="pdtf-transaction",
        ),
        # An unrelated leaf the resolver must ignore.
        "propertyPack.councilTax.councilTaxBand": DictionaryLeaf(
            leaf_path="propertyPack.councilTax.councilTaxBand",
            datatype="xsd:string",
            comment="Council tax band.",
            cardinality="0..1",
            source_iri="baspi5",
        ),
    }
    sources = schema_leaf_sources("builtForm", dictionary)
    assert sources == [
        "https://w3id.org/opda/forms/nts2"
        "#propertyPack.buildInformation.building.builtForm",
        "https://w3id.org/opda/forms/pdtf-transaction"
        "#propertyPack.energyEfficiency.certificate.builtForm",
    ]
    # Every source is a schema leaf path, never a deciding ODR section.
    assert all("/odr/ODR-" not in s for s in sources)


def test_schema_leaf_sources_empty_for_unknown_name() -> None:
    """A name with no matching leaf yields an empty array (the caller
    decides whether that is a defect)."""
    dictionary = {
        "propertyPack.uprn": DictionaryLeaf(
            leaf_path="propertyPack.uprn",
            datatype="xsd:string",
            comment="UPRN.",
            cardinality="0..1",
            source_iri="baspi5",
        ),
    }
    assert schema_leaf_sources("builtForm", dictionary) == []


# ---------------------------------------------------------------------------
# ODR-0008d Category E — opda:RiskAssessment class + properties
# ---------------------------------------------------------------------------
PROV = Namespace("http://www.w3.org/ns/prov#")
SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")
SH = Namespace("http://www.w3.org/ns/shacl#")


def test_risk_assessment_class_emitted() -> None:
    """ODR-0008d Rule 1: opda:RiskAssessment is the sixth class — an
    Information Object, rdfs:subClassOf prov:Entity, sourced to ODR-0008d."""
    g = descriptive.build_graph()
    assert (OPDA.RiskAssessment, RDF.type, OWL.Class) in g
    assert (OPDA.RiskAssessment, RDFS.subClassOf, PROV.Entity) in g
    assert (OPDA.RiskAssessment, RDFS.label, None) in g
    scope = " ".join(str(s) for s in g.objects(OPDA.RiskAssessment, SKOS.scopeNote))
    assert "Information Object" in scope
    sources = [str(s) for s in g.objects(OPDA.RiskAssessment, DCTERMS.source)]
    assert any("ODR-0008d" in s for s in sources)


def test_risk_assessment_in_class_catalogue() -> None:
    """The module catalogue advertises RiskAssessment + the nearby-facilities
    genus bearer + the monetary and room-dimension value structures (nine now:
    the original six Q4a / Category-E promotions + opda:NearbyFacility (ODR-0024
    R4) + opda:MonetaryAmount (ODR-0024 R3) + opda:RoomDimension (ODR-0024 R10 /
    session-030)). Per ODR-0024 R4 the opda:School / opda:HealthCareFacility
    subkinds COLLAPSE into the genus (held-as-live subkind split), so they are
    NO LONGER in the catalogue; per session-030 opda:Room / opda:Building are
    NOT classes (modelled as the opda:RoomDimension by-value structure)."""
    assert OPDA.RiskAssessment in descriptive.CLASSES
    assert OPDA.NearbyFacility in descriptive.CLASSES
    assert OPDA.MonetaryAmount in descriptive.CLASSES
    assert OPDA.RoomDimension in descriptive.CLASSES
    # ODR-0024 R4: the subkinds are collapsed into the genus — not emitted.
    assert OPDA.School not in descriptive.CLASSES
    assert OPDA.HealthCareFacility not in descriptive.CLASSES
    # session-030: Room / Building are NOT classes.
    assert OPDA.Room not in descriptive.CLASSES
    assert OPDA.Building not in descriptive.CLASSES
    assert len(descriptive.CLASSES) == 9


def test_room_dimension_emitted() -> None:
    """ODR-0024 R10 / session-030 — the room-dimension model. opda:Room and
    opda:Building are NOT classes; the roomDimensions.rooms[] repeating group is
    an anonymous by-value opda:RoomDimension structure (no IC, no key — the
    MonetaryAmount pattern) on opda:Property, bearing length/width (xsd:decimal)
    + a non-rigid roomName, attached via opda:hasRoomDimension. No mereology,
    no transitivity, no UnitOfLengthScheme, no identity key."""
    from rdflib.namespace import SH

    from opda_gen.emitters import shapes

    g = descriptive.build_graph()
    assert (OPDA.RoomDimension, RDF.type, OWL.Class) in g
    # the three by-value fields on RoomDimension
    for prop, dt in ((OPDA.length, XSD.decimal), (OPDA.width, XSD.decimal),
                     (OPDA.roomName, XSD.string)):
        assert (prop, RDF.type, OWL.DatatypeProperty) in g, prop
        assert (prop, RDFS.domain, OPDA.RoomDimension) in g, prop
        assert (prop, RDFS.range, dt) in g, prop
    # attachment: Property -> RoomDimension (characterisation, not parthood)
    assert (OPDA.hasRoomDimension, RDF.type, OWL.ObjectProperty) in g
    assert (OPDA.hasRoomDimension, RDFS.domain, OPDA.Property) in g
    assert (OPDA.hasRoomDimension, RDFS.range, OPDA.RoomDimension) in g
    # NOT classes; no UnitOfLengthScheme minted
    assert (OPDA.Room, RDF.type, OWL.Class) not in g
    assert (OPDA.Building, RDF.type, OWL.Class) not in g
    # keyless shape (no owl:hasKey on the value structure)
    sg = shapes.build_descriptive_shapes()
    assert (OPDA.RoomDimensionShape, SH.targetClass, OPDA.RoomDimension) in sg
    assert (OPDA.RoomDimension, OWL.hasKey, None) not in g


def test_monetary_walk_emitted() -> None:
    """ODR-0024 R3 / ADR-0005 §G22 — the monetary walk. opda:MonetaryAmount is
    a by-value structure (opda:amount magnitude + opda:currency → CurrencyScheme
    concept) reused as the rdfs:range across 16 per-economic-kind monetary
    properties, each on its OWN bearer (reuse the value type, never the bearer;
    never collapsed onto the Category-D fixtures opda:price)."""
    g = descriptive.build_graph()
    assert (OPDA.MonetaryAmount, RDF.type, OWL.Class) in g
    assert (OPDA.amount, RDF.type, OWL.DatatypeProperty) in g
    assert (OPDA.amount, RDFS.domain, OPDA.MonetaryAmount) in g
    assert (OPDA.amount, RDFS.range, XSD.decimal) in g
    assert (OPDA.currency, RDF.type, OWL.ObjectProperty) in g
    assert (OPDA.currency, RDFS.domain, OPDA.MonetaryAmount) in g
    comment = " ".join(str(c) for c in g.objects(OPDA.MonetaryAmount, RDFS.comment))
    assert "magnitude" in comment and "currency" in comment

    expected_bearers = {
        OPDA.annualGroundRent: OPDA.LegalEstate,
        OPDA.annualServiceCharge: OPDA.LegalEstate,
        OPDA.certificateOfComplianceFee: OPDA.LegalEstate,
        OPDA.sharedOwnershipRent: OPDA.LegalEstate,
        OPDA.councilTaxAnnualCharge: OPDA.Property,
        OPDA.annualCostOfPermit: OPDA.Property,
        OPDA.rent: OPDA.Property,
        OPDA.holdingDeposit: OPDA.Property,
        OPDA.securityDeposit: OPDA.Property,
        OPDA.potentialCost: OPDA.Property,
        OPDA.estimatedPrice: OPDA.Valuation,
        OPDA.estimatedAmount: OPDA.Valuation,
        OPDA.listPrice: OPDA.Valuation,
        OPDA.soldPrice: OPDA.Valuation,
        OPDA.costsApplicableToTheDeed: OPDA.Transaction,
        OPDA.feeIncludingVAT: OPDA.Transaction,
    }
    monetary = set(g.subjects(RDFS.range, OPDA.MonetaryAmount))
    assert monetary == set(expected_bearers), monetary ^ set(expected_bearers)
    for prop, bearer in expected_bearers.items():
        assert (prop, RDF.type, OWL.ObjectProperty) in g, prop
        assert (prop, RDFS.domain, bearer) in g, prop
        assert (prop, RDFS.range, OPDA.MonetaryAmount) in g, prop
    # the monetary leaves are NOT collapsed onto the fixtures opda:price
    assert (OPDA.price, RDFS.range, OPDA.MonetaryAmount) not in g


def test_r5_followon_walk_emitted() -> None:
    """ODR-0024 R5/R6 / ADR-0005 §G23 — the R5-surfaced follow-on. 40 enum +
    Yes/No Property/estate attributes minted as flat datatype properties on
    their bearers; the six enum leaves (+ ownerType) wired to their SKOS schemes
    via base value shapes (sh:targetSubjectsOf + sh:in) — no overlay needed."""
    from rdflib.namespace import SH

    from opda_gen.emitters import shapes

    g = descriptive.build_graph()
    cases = {
        OPDA.constructionType: (OPDA.Property, XSD.string),
        OPDA.transportType: (OPDA.NearbyFacility, XSD.string),
        OPDA.ofstedRating: (OPDA.NearbyFacility, XSD.string),
        OPDA.marketingTenure: (OPDA.Property, XSD.string),
        OPDA.hasLift: (OPDA.Property, XSD.string),
        OPDA.isLeaseQualifying: (OPDA.LegalEstate, XSD.string),
        OPDA.freeholdOwner: (OPDA.LegalEstate, XSD.string),
        OPDA.forTheManagedAreas: (OPDA.LegalEstate, XSD.decimal),
        OPDA.fromTheOwners: (OPDA.LegalEstate, XSD.decimal),
    }
    for prop, (dom, rng) in cases.items():
        assert (prop, RDF.type, OWL.DatatypeProperty) in g, prop
        assert (prop, RDFS.domain, dom) in g, prop
        assert (prop, RDFS.range, rng) in g, prop
        assert prop in descriptive.DATATYPE_PROPERTIES, prop

    # the six R6 enum properties are wired to their schemes (base value shapes)
    sg = shapes.build_descriptive_shapes()
    for shape, prop in (
        (OPDA.ConstructionTypeValueShape, OPDA.constructionType),
        (OPDA.PriceQualifierValueShape, OPDA.priceQualifier),
        (OPDA.TransportTypeValueShape, OPDA.transportType),
        (OPDA.BroadbandConnectionValueShape, OPDA.typeOfConnection),
        (OPDA.OfstedRatingValueShape, OPDA.ofstedRating),
        (OPDA.MarketingTenureValueShape, OPDA.marketingTenure),
    ):
        assert (shape, SH.targetSubjectsOf, prop) in sg, shape
        assert list(sg.objects(shape, SH.property)), shape

    # ownerType wired in agent-shapes — closes the §G23 Proprietor-overlay gap
    ag = shapes.build_agent_shapes()
    assert (OPDA.OwnerTypeValueShape, SH.targetSubjectsOf, OPDA.ownerType) in ag


def test_category_e_properties_emitted() -> None:
    """ODR-0008d Rule 3: opda:peril (object property → skos:Concept),
    opda:riskIndicator + opda:actionAlertRating (datatype), and
    opda:hasSubAssessment (self-referential object property) are minted with
    a RiskAssessment domain."""
    g = descriptive.build_graph()
    # peril — object property, range skos:Concept
    assert (OPDA.peril, RDF.type, OWL.ObjectProperty) in g
    assert (OPDA.peril, RDFS.range, SKOS.Concept) in g
    assert (OPDA.peril, RDFS.domain, OPDA.RiskAssessment) in g
    # riskIndicator / actionAlertRating — datatype properties
    assert (OPDA.riskIndicator, RDF.type, OWL.DatatypeProperty) in g
    assert (OPDA.actionAlertRating, RDF.type, OWL.DatatypeProperty) in g
    assert (OPDA.actionAlertRating, RDFS.range, XSD.integer) in g
    # hasSubAssessment — self-referential mereological part-of
    assert (OPDA.hasSubAssessment, RDF.type, OWL.ObjectProperty) in g
    assert (OPDA.hasSubAssessment, RDFS.domain, OPDA.RiskAssessment) in g
    assert (OPDA.hasSubAssessment, RDFS.range, OPDA.RiskAssessment) in g


def test_dataset_attribution_not_minted() -> None:
    """ODR-0008d Rule 5: datasetAttribution REUSES prov:wasAttributedTo —
    opda:datasetAttribution is NEVER minted as a local term."""
    g = descriptive.build_graph()
    assert (OPDA.datasetAttribution, None, None) not in g
    # And it is not advertised in the catalogue either.
    assert OPDA.datasetAttribution not in descriptive.DATATYPE_PROPERTIES
    assert OPDA.datasetAttribution not in descriptive.OBJECT_PROPERTIES


# ---------------------------------------------------------------------------
# ODR-0008d Rule 3 — the five existing classes retro-corrected to
# "Information Object" (from "Substance Kind")
# ---------------------------------------------------------------------------
def test_five_classes_retro_corrected_to_information_object() -> None:
    """ODR-0008d Rule 3 (normative A9 fix): the five §Q4a classes' rdfs:comment
    AND skos:scopeNote say "Information Object", NOT "Substance Kind" — a
    report is not a Substance Kind."""
    g = descriptive.build_graph()
    five = (
        OPDA.Survey, OPDA.EPCCertificate, OPDA.Search,
        OPDA.Valuation, OPDA.Comparable,
    )
    for cls in five:
        comment = " ".join(str(c) for c in g.objects(cls, RDFS.comment))
        scope = " ".join(str(s) for s in g.objects(cls, SKOS.scopeNote))
        assert "Information Object" in comment, (
            f"{cls} rdfs:comment not retro-corrected to Information Object"
        )
        assert "Information Object" in scope, (
            f"{cls} skos:scopeNote not retro-corrected to Information Object"
        )
        # The stale "Substance Kind" label must be gone from the scopeNote
        # (it may survive only inside a "corrected from \"Substance Kind\""
        # phrase in the comment, which is acceptable provenance).
        assert "Substance Kind, informational" not in scope, (
            f"{cls} scopeNote still carries the stale Substance Kind label"
        )


# ---------------------------------------------------------------------------
# ODR-0022 §4 / session-027 R4 — Category D inclusion-as-transaction-Mode
# ---------------------------------------------------------------------------
def test_inclusion_status_is_transaction_mode_not_property_domain() -> None:
    """ODR-0022 §4 / S027 R4: opda:inclusionStatus is minted but is NEVER
    rdfs:domain opda:Property (it is a Mode/Relator of the sale transaction);
    its comment states the Mode binding."""
    g = descriptive.build_graph()
    assert (OPDA.inclusionStatus, RDF.type, OWL.DatatypeProperty) in g
    assert (OPDA.inclusionStatus, RDFS.domain, OPDA.Property) not in g
    comment = " ".join(str(c) for c in g.objects(OPDA.inclusionStatus, RDFS.comment))
    assert "Mode" in comment and "transaction" in comment.lower()


def test_price_is_single_shared_property() -> None:
    """ODR-0022 §4: opda:price is ONE shared monetary-amount property
    (xsd:decimal), never one-per-item; and the fixtures comment reuses
    opda:disclosureDetail (no new comment property)."""
    g = descriptive.build_graph()
    assert (OPDA.price, RDF.type, OWL.DatatypeProperty) in g
    assert (OPDA.price, RDFS.range, XSD.decimal) in g
    # No per-item price property family was minted.
    dtps = set(g.subjects(RDF.type, OWL.DatatypeProperty))
    price_like = {p for p in dtps if str(p).rsplit("#", 1)[-1].lower().endswith("price")}
    assert price_like == {OPDA.price}


# ---------------------------------------------------------------------------
# ODR-0008d Rule 1c / Rule 6b — descriptive SHACL shapes
# ---------------------------------------------------------------------------
def _descriptive_shapes_graph() -> Graph:
    from opda_gen.emitters.shapes import build_descriptive_shapes

    return build_descriptive_shapes()


def test_risk_assessment_node_shape_present() -> None:
    """ODR-0008d Rule 1c: opda:RiskAssessmentShape targets opda:RiskAssessment
    and constrains opda:peril, opda:riskIndicator, opda:actionAlertRating,
    opda:disclosureDetail, prov:wasAttributedTo, and recurses via
    opda:hasSubAssessment (sh:node)."""
    g = _descriptive_shapes_graph()
    assert (OPDA.RiskAssessmentShape, RDF.type, SH.NodeShape) in g
    assert (OPDA.RiskAssessmentShape, SH.targetClass, OPDA.RiskAssessment) in g
    paths = {
        str(p)
        for pshape in g.objects(OPDA.RiskAssessmentShape, SH.property)
        for p in g.objects(pshape, SH.path)
    }
    assert str(OPDA.peril) in paths
    assert str(OPDA.riskIndicator) in paths
    assert str(OPDA.actionAlertRating) in paths
    assert str(OPDA.disclosureDetail) in paths
    assert str(PROV.wasAttributedTo) in paths
    assert str(OPDA.hasSubAssessment) in paths
    # The recursion is realised via sh:node back onto the same shape.
    sub = [
        pshape
        for pshape in g.objects(OPDA.RiskAssessmentShape, SH.property)
        if (pshape, SH.path, OPDA.hasSubAssessment) in g
    ]
    assert sub and (sub[0], SH.node, OPDA.RiskAssessmentShape) in g


def test_peril_property_shape_pins_the_12_concepts() -> None:
    """The opda:peril property shape's sh:in lists exactly the 12 PerilScheme
    concept IRIs (a dereferenceable peril, never an opaque string)."""
    from rdflib.collection import Collection

    g = _descriptive_shapes_graph()
    peril_shape = [
        pshape
        for pshape in g.objects(OPDA.RiskAssessmentShape, SH.property)
        if (pshape, SH.path, OPDA.peril) in g
    ]
    assert len(peril_shape) == 1
    in_list = list(g.objects(peril_shape[0], SH["in"]))
    assert len(in_list) == 1
    members = list(Collection(g, in_list[0]))
    assert len(members) == 12
    assert all(str(m).startswith("https://opda.org.uk/pdtf/peril/") for m in members)


def test_five_classes_have_internal_structure_shapes() -> None:
    """ODR-0008d Rule 6b: each of the five Information Objects has a
    per-class internal-structure node shape with the IC ⟨issuing authority,
    authority reference, issue date⟩ → prov:wasAttributedTo,
    opda:disclosureDetail, prov:generatedAtTime."""
    g = _descriptive_shapes_graph()
    for cls in (
        OPDA.Survey, OPDA.EPCCertificate, OPDA.Search,
        OPDA.Valuation, OPDA.Comparable,
    ):
        shape = URIRef(f"{str(cls)}InternalStructureShape")
        assert (shape, RDF.type, SH.NodeShape) in g
        assert (shape, SH.targetClass, cls) in g
        paths = {
            str(p)
            for pshape in g.objects(shape, SH.property)
            for p in g.objects(pshape, SH.path)
        }
        assert str(PROV.wasAttributedTo) in paths  # issuing authority
        assert str(OPDA.disclosureDetail) in paths  # authority reference
        assert str(PROV.generatedAtTime) in paths   # issue date


def test_fixtures_list_shape_is_transaction_scoped() -> None:
    """ODR-0022 §4 / S027 R4: the fixtures-list node shape is
    transaction-scoped (targets opda:Transaction, NOT opda:Property), ties
    opda:FixtureItemScheme, and constrains opda:inclusionStatus (sh:in) +
    opda:price + opda:disclosureDetail. NO FixtureItem class is targeted."""
    g = _descriptive_shapes_graph()
    assert (OPDA.FixturesListShape, RDF.type, SH.NodeShape) in g
    assert (OPDA.FixturesListShape, SH.targetClass, OPDA.Transaction) in g
    assert (OPDA.FixturesListShape, SH.targetClass, OPDA.Property) not in g
    # No FixtureItem class is invented as a target anywhere in the shapes.
    targets = {str(t) for t in g.objects(None, SH.targetClass)}
    assert "https://opda.org.uk/pdtf/FixtureItem" not in targets
    # Ties the controlled item vocabulary.
    assert (OPDA.FixturesListShape, DCTERMS.references, OPDA.FixtureItemScheme) in g
    paths = {
        str(p)
        for pshape in g.objects(OPDA.FixturesListShape, SH.property)
        for p in g.objects(pshape, SH.path)
    }
    assert str(OPDA.inclusionStatus) in paths
    assert str(OPDA.price) in paths
    assert str(OPDA.disclosureDetail) in paths
