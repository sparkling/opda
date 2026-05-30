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


OPDA = Namespace("https://w3id.org/opda/#")


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
    hierarchy."""
    g = descriptive.build_graph()
    assert (OPDA.disclosureDetail, RDFS.subPropertyOf, None) not in g
    # The descriptive datatype properties minted today are disclosureDetail
    # (Category A) + the ODR-0008d Category-E rating-bearing pair
    # (riskIndicator, actionAlertRating) + the ODR-0022 Category-D
    # sale-transaction fixtures pair (inclusionStatus, price). The ~181
    # genuine Category-G descriptive datatype properties remain DEFERRED
    # (ODR-0022 §Rules.6).
    dtps = set(g.subjects(RDF.type, OWL.DatatypeProperty))
    assert dtps == {
        OPDA.disclosureDetail,
        OPDA.riskIndicator,
        OPDA.actionAlertRating,
        OPDA.inclusionStatus,
        OPDA.price,
    }


def test_disclosure_detail_sources_to_odr_0022_not_a_leaf() -> None:
    """The reusable property's own `dct:source` points at ODR-0022 §1 (its
    deciding record) — it is NOT a per-question descriptive leaf, so it is
    not subject to the G2 schema-leaf-path rule. (Per ODR-0022 §Rules.1 the
    question is carried by the subject + the INSTANCE-level dct:source.)"""
    g = descriptive.build_graph()
    sources = list(g.objects(OPDA.disclosureDetail, DCTERMS.source))
    assert len(sources) == 1
    assert str(sources[0]) == "https://w3id.org/opda/odr/ODR-0022#section-Rules-1"


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
    """The module catalogue advertises RiskAssessment (six classes now)."""
    assert OPDA.RiskAssessment in descriptive.CLASSES
    assert len(descriptive.CLASSES) == 6


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
    assert all(str(m).startswith("https://w3id.org/opda/#peril/") for m in members)


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
    assert "https://w3id.org/opda/#FixtureItem" not in targets
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
