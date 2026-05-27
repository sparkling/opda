"""
Module profiles.

Realises:
- ADR-0013 §"Profile emission template" — overlay profile shapes graph
  with `owl:Ontology` header + `opda:ValidationContext` reification +
  per-class SHACL `sh:NodeShape`s carrying `sh:property` blocks +
  per-class `sh:xone` patterns for nested `oneOf` discriminators +
  DASH UI predicates per ODR-0010 §Q4 + form-question `dct:source` IRIs
  per ODR-0010 §Q3.
- ADR-0013 §"Three-rule interface contract — CI enforcement" — every
  emitted overlay profile honours the three rules (sh:in semantics;
  sh:Violation floor; no-identity-override gate). Enforced by
  `tools/opda-gen/src/opda_gen/ci/profile_contract_test.py`.
- ADR-0013 §"`dct:source` form-question IRI minting" — every property
  shape carries `dct:source <https://www.basp.uk/forms/baspi5#...>`.
- ADR-0013 G11 closure (bundled) — BASPI5-required DatatypeProperties
  emit in opda-property.ttl / opda-agent.ttl per ODR-0008 §Q5a binding
  table; this module's per-class shapes bind them to schemes via
  `sh:in` (no new predicates declared here — declarations live in the
  TBox modules).
- ADR-0008 §"CLI design" — `emit-profile <overlay>` subcommand.
- ADR-0007 §"Deterministic emission rules" — canonical serialiser
  produces byte-identical output across runs.
- ODR-0010 §Rules + §Q1 (ValidationContext reification) + §Q3
  (dct:source form-question IRIs) + §Q4 (DASH UI) + §Q5
  (oneOf → sh:xone) + §Q6 (no-identity-override) + §Q7 (BASPI5 round-trip).

Pipeline:
  1. Load BASPI5 JSON schema (`source/03-standards/schemas/src/schemas/v3/
     overlays/baspi5.json`).
  2. Build per-class shapes (Baspi5_PropertyShape, Baspi5_AddressShape,
     Baspi5_LegalEstateShape, Baspi5_SellerShape, etc.) by walking
     well-known top-level structures in the schema + the SKOS scheme
     registry.
  3. Build `opda:ValidationContext` reification node with 5 properties.
  4. Build DASH `sh:PropertyGroup` instances for the major form sections.
  5. Build `sh:xone` shape for the sellersCapacity nested oneOf.
  6. Serialise via canonical serialiser; prepend generator-comment header.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

from opda_gen import __version__
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces -----------------------------------------------------------
OPDA = Namespace("https://w3id.org/opda/#")
SH = Namespace("http://www.w3.org/ns/shacl#")
DASH = Namespace("http://datashapes.org/dash#")
PROV = Namespace("http://www.w3.org/ns/prov#")


# --- Sentinel-pinned constants per ADR-0013 + G6 convention --------------
_PROFILE_LAST_MODIFIED = "2026-05-28"
_PROFILE_SOURCE_COMMIT = "pinned-by-ADR-0013"


# --- BASPI5 form-question authority -------------------------------------
BASPI5_FORMS_AUTHORITY = "https://www.basp.uk/forms/baspi5"


def _baspi5_question(anchor: str) -> URIRef:
    """Mint a BASPI5 form-question URI per ODR-0010 §Q3 anchor pattern."""
    return URIRef(f"{BASPI5_FORMS_AUTHORITY}#{anchor}")


# --- ODR/ADR anchor URIs (dct:source on shapes) --------------------------
_ODR_0010 = URIRef("https://w3id.org/opda/odr/ODR-0010#section-Q1")
_ODR_0010_Q3 = URIRef("https://w3id.org/opda/odr/ODR-0010#section-Q3")
_ODR_0010_Q4 = URIRef("https://w3id.org/opda/odr/ODR-0010#section-Q4")
_ODR_0010_Q5 = URIRef("https://w3id.org/opda/odr/ODR-0010#section-Q5")
_ADR_0013 = URIRef(
    "https://openpropdata.org.uk/adr/ADR-0013-overlay-profile-emission"
)


# --- Profile catalogue ----------------------------------------------------
PROFILE_FILENAMES: dict[str, str] = {
    "baspi5": "baspi5.ttl",
}


def _scheme_members(scheme_local_name: str) -> list[str]:
    """Return the notation values of an emitted SKOS scheme by local name.

    Used to compute `sh:in` lists for profile shapes — the profile cites
    the scheme members as a closed enumeration per ODR-0010 §Rule 2
    (build-step replacement, NOT entailment). The members are pulled
    from the in-code scheme registry rather than re-parsing the emitted
    Turtle so this module remains a pure emitter (no I/O dependency on
    the vocabularies file at profile-emit time).
    """
    from opda_gen.emitters.vocabularies import _all_schemes

    for scheme in _all_schemes():
        if scheme.local_name == scheme_local_name:
            return [m.notation for m in scheme.members]
    raise ValueError(f"unknown scheme: {scheme_local_name}")


def _add_in_list(g: Graph, blank: BNode, items: list[str]) -> None:
    """Attach a SHACL `sh:in` RDF list of string literals to ``blank``."""
    rdf_list = BNode()
    g.add((blank, SH["in"], rdf_list))
    Collection(g, rdf_list, [Literal(v) for v in items])


def _add_property_shape(
    g: Graph,
    parent_shape: URIRef,
    *,
    path: URIRef,
    min_count: int | None = None,
    max_count: int | None = None,
    in_scheme_members: list[str] | None = None,
    severity: URIRef = SH.Violation,
    dash_viewer: URIRef | None = None,
    dash_editor: URIRef | None = None,
    sh_order: int | None = None,
    sh_group: URIRef | None = None,
    form_question_anchor: str | None = None,
    message: str | None = None,
) -> BNode:
    """Attach a `sh:property` block to ``parent_shape`` with the given
    constraints. Returns the blank node so callers can extend.

    Per ADR-0013 §"Profile emission template" lines 84-107 the canonical
    property-shape carries: sh:path, sh:minCount/maxCount, sh:in,
    sh:severity, dash:viewer/editor, sh:order, sh:group, dct:source,
    sh:message. Each argument is honoured iff supplied; the helper does
    NOT inject defaults beyond `severity = sh:Violation`.
    """
    prop = BNode()
    g.add((parent_shape, SH.property, prop))
    g.add((prop, SH.path, path))
    if min_count is not None:
        g.add((prop, SH.minCount, Literal(min_count)))
    if max_count is not None:
        g.add((prop, SH.maxCount, Literal(max_count)))
    if in_scheme_members is not None:
        _add_in_list(g, prop, in_scheme_members)
    g.add((prop, SH.severity, severity))
    if dash_viewer is not None:
        g.add((prop, DASH.viewer, dash_viewer))
    if dash_editor is not None:
        g.add((prop, DASH.editor, dash_editor))
    if sh_order is not None:
        g.add((prop, SH.order, Literal(sh_order)))
    if sh_group is not None:
        g.add((prop, SH.group, sh_group))
    if form_question_anchor is not None:
        g.add((prop, DCTERMS.source, _baspi5_question(form_question_anchor)))
    if message is not None:
        g.add((prop, SH.message, Literal(message, lang="en")))
    return prop


def _add_property_group(
    g: Graph, group_uri: URIRef, *, label: str, order: int,
) -> None:
    """Emit a `sh:PropertyGroup` per ODR-0010 §Q4 DASH-driven sectioning."""
    g.add((group_uri, RDF.type, SH.PropertyGroup))
    g.add((group_uri, RDFS.label, Literal(label, lang="en")))
    g.add((group_uri, SH.order, Literal(order)))


# --- BASPI5 profile builder ----------------------------------------------
def _build_baspi5_profile() -> Graph:
    """Build the BASPI5 overlay profile graph.

    Realises ADR-0013 §"Profile emission template" + ODR-0010 §Q1-Q7.

    Coverage:
    - Ontology header with owl:imports foundation + vocabularies; owl:versionIRI.
    - opda:ValidationContext reification per ODR-0010 §Q1 with 5 properties.
    - Per-class Baspi5_* NodeShapes:
        * Baspi5_PropertyShape    — built form / energy / heating /
                                     drainage / flood / smart-home /
                                     boundaries / spray-foam / vacant
                                     possession / property type / etc.
        * Baspi5_AddressShape     — line1 + postcode required.
        * Baspi5_LegalEstateShape — ownership type / tenure / shared-
                                     ownership / ground rent.
        * Baspi5_SellerShape      — name/email/role; sellersCapacity oneOf.
        * Baspi5_EPCCertificateShape — currentEnergyRating required.
    - sh:PropertyGroup instances for the major DASH groups.
    - sh:xone shape for the BASPI5 sellersCapacity oneOf discriminator.
    """
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("sh", SH)
    g.bind("dash", DASH)
    g.bind("dct", DCTERMS)
    g.bind("rdf", RDF)
    g.bind("rdfs", RDFS)
    g.bind("owl", OWL)
    g.bind("skos", SKOS)
    g.bind("xsd", XSD)
    g.bind("prov", PROV)

    # --- Ontology header per ADR-0013 §"Profile emission template" -----
    profile_iri = URIRef("https://w3id.org/opda/profiles/baspi5")
    g.add((profile_iri, RDF.type, OWL.Ontology))
    g.add((profile_iri, DCTERMS.title,
           Literal("BASPI5 overlay profile", lang="en")))
    g.add((profile_iri, DCTERMS.description, Literal(
        "SHACL profile graph for the BASPI5 (British Association of "
        "Surveyors Property Information) version 5 form. Per-form "
        "cardinality, enum subsets, DASH UI rendering. Composes over "
        "the foundation + module TBox + base shapes per ODR-0010.",
        lang="en",
    )))
    g.add((profile_iri, OWL.imports, URIRef("https://w3id.org/opda/0.4.0/")))
    g.add((profile_iri, OWL.imports,
           URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((profile_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/profiles/baspi5/0.1.0/")))
    g.add((profile_iri, DCTERMS.source, _ADR_0013))

    # --- opda:ValidationContext reification per ODR-0010 §Q1 -----------
    vctx = OPDA.Baspi5ValidationContext
    g.add((vctx, RDF.type, OPDA.ValidationContext))
    g.add((vctx, OPDA.profileURI, profile_iri))
    # opda:requires — the OPDA classes BASPI5 binds.
    for cls in [
        OPDA.Property, OPDA.Address, OPDA.LegalEstate,
        OPDA.Seller, OPDA.Buyer, OPDA.EPCCertificate, OPDA.Survey,
    ]:
        g.add((vctx, OPDA.requires, cls))
    g.add((vctx, OPDA.overlaysContext,
           URIRef("https://w3id.org/opda/profiles/foundation")))
    g.add((vctx, OPDA.sourcedFrom, URIRef(BASPI5_FORMS_AUTHORITY)))
    g.add((vctx, OPDA.formVersion, Literal("5.0.3")))
    g.add((vctx, DCTERMS.source, _ODR_0010))

    # --- DASH PropertyGroups per ODR-0010 §Q4 --------------------------
    grp_participants = OPDA.Baspi5_Participants_Group
    grp_address = OPDA.Baspi5_Address_Group
    grp_built = OPDA.Baspi5_BuiltForm_Group
    grp_energy = OPDA.Baspi5_Energy_Group
    grp_heating = OPDA.Baspi5_Heating_Group
    grp_ownership = OPDA.Baspi5_Ownership_Group
    grp_drainage = OPDA.Baspi5_Drainage_Group
    grp_environmental = OPDA.Baspi5_Environmental_Group
    grp_completion = OPDA.Baspi5_Completion_Group
    _add_property_group(g, grp_participants, label="Participants", order=1)
    _add_property_group(g, grp_address, label="Address", order=2)
    _add_property_group(g, grp_built, label="Built form", order=3)
    _add_property_group(g, grp_energy, label="Energy & EPC", order=4)
    _add_property_group(g, grp_heating, label="Heating & utilities", order=5)
    _add_property_group(g, grp_ownership, label="Ownership & tenure", order=6)
    _add_property_group(g, grp_drainage, label="Water & drainage", order=7)
    _add_property_group(
        g, grp_environmental, label="Environmental issues", order=8,
    )
    _add_property_group(g, grp_completion, label="Completion", order=9)

    # --- Baspi5_AddressShape (BASPI5 A1.1) -----------------------------
    addr_shape = OPDA.Baspi5_AddressShape
    g.add((addr_shape, RDF.type, SH.NodeShape))
    g.add((addr_shape, SH.targetClass, OPDA.Address))
    g.add((addr_shape, DCTERMS.source, _baspi5_question("A1.1")))
    _add_property_shape(
        g, addr_shape,
        path=URIRef("http://www.w3.org/2006/vcard/ns#street-address"),
        min_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=1, sh_group=grp_address,
        form_question_anchor="A1.1.1",
        message="BASPI5 question A1.1.1: address line 1 is required.",
    )
    _add_property_shape(
        g, addr_shape,
        path=URIRef("http://www.w3.org/2006/vcard/ns#postal-code"),
        min_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=5, sh_group=grp_address,
        form_question_anchor="A1.1.5",
        message="BASPI5 question A1.1.5: postcode is required.",
    )

    # --- Baspi5_PropertyShape (BASPI5 propertyPack.*) ------------------
    prop_shape = OPDA.Baspi5_PropertyShape
    g.add((prop_shape, RDF.type, SH.NodeShape))
    g.add((prop_shape, SH.targetClass, OPDA.Property))
    g.add((prop_shape, DCTERMS.source, _baspi5_question("A1")))

    # UPRN required (BASPI5 propertyPack.uprn — A1.1.5)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.hasUPRN,
        min_count=1, max_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=1, sh_group=grp_built,
        form_question_anchor="A1.1.5",
        message="BASPI5: UPRN is required (identity key).",
    )
    # Address (object-property; multiplicity 1 in BASPI5 — propertyPack.address)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.hasAddress,
        min_count=1,
        dash_viewer=DASH.URIViewer,
        dash_editor=DASH.DetailsEditor,
        sh_order=2, sh_group=grp_address,
        form_question_anchor="A1.1",
    )
    # propertyType (sub-set: House/Bungalow/Park home/Flat/Maisonette/Other)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.propertyType,
        min_count=1, max_count=1,
        in_scheme_members=_scheme_members("PropertyTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=3, sh_group=grp_built,
        form_question_anchor="A1.8",
        message="BASPI5 question A1.8: property type is required.",
    )
    # builtForm (Detached/Semi/Mid-terrace/End-terrace/Other)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.builtForm,
        min_count=1,
        in_scheme_members=_scheme_members("BuiltFormScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=4, sh_group=grp_built,
        form_question_anchor="A1.8.1",
    )
    # currentEnergyRating (A-G)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.currentEnergyRating,
        min_count=1, max_count=1,
        in_scheme_members=_scheme_members("CurrentEnergyRatingScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=10, sh_group=grp_energy,
        form_question_anchor="A1.8.3.1.1",
        message="BASPI5 question A1.8.3.1.1: EPC current energy rating.",
    )
    # heatingType
    _add_property_shape(
        g, prop_shape,
        path=OPDA.heatingType,
        min_count=1,
        in_scheme_members=_scheme_members("HeatingTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=11, sh_group=grp_heating,
        form_question_anchor="A7.1",
    )
    # centralHeatingFuelType
    _add_property_shape(
        g, prop_shape,
        path=OPDA.centralHeatingFuelType,
        in_scheme_members=_scheme_members("CentralHeatingFuelTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=12, sh_group=grp_heating,
        form_question_anchor="A7.4.0.2",
    )
    # offMainsDrainageSystemType
    _add_property_shape(
        g, prop_shape,
        path=OPDA.offMainsDrainageSystemType,
        in_scheme_members=_scheme_members("OffMainsDrainageSystemTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=20, sh_group=grp_drainage,
        form_question_anchor="A6.2.1",
    )
    # Yes/No discriminators
    yes_no_members = _scheme_members("YesNoScheme")
    yes_no_na_members = _scheme_members("YesNoNotApplicableScheme")
    for path, anchor, group, order, label in [
        (OPDA.areBoundariesUniform, "A1.2.1", grp_built, 5, "boundaries uniform"),
        (OPDA.isLocatedOverCommercialPremises, "A1.8.6.1",
         grp_built, 6, "over commercial premises"),
        (OPDA.hasSprayFoamInstalled, "A1.8.7", grp_built, 7,
         "spray foam installed"),
        (OPDA.hasBeenFlooded, "A4.1.1", grp_environmental, 21,
         "has been flooded"),
        (OPDA.hasSmartHomeSystems, "A8.1.1", grp_built, 8,
         "has smart home systems"),
        (OPDA.hasValidGuaranteesOrWarranties, "A9.1", grp_built, 9,
         "has valid guarantees or warranties"),
        (OPDA.isInsured, "A10.1.1", grp_built, 14, "is insured"),
        (OPDA.isSupplyMetered, "A7.5.1", grp_heating, 13, "supply metered"),
        (OPDA.soldWithVacantPossession, "A11.1.1", grp_completion, 30,
         "vacant possession"),
    ]:
        _add_property_shape(
            g, prop_shape,
            path=path,
            in_scheme_members=yes_no_members,
            dash_viewer=DASH.LabelViewer,
            dash_editor=DASH.EnumSelectEditor,
            sh_order=order, sh_group=group,
            form_question_anchor=anchor,
            message=f"BASPI5 question {anchor}: {label} (Yes/No).",
        )

    # --- Baspi5_LegalEstateShape (BASPI5 ownership / tenure) -----------
    estate_shape = OPDA.Baspi5_LegalEstateShape
    g.add((estate_shape, RDF.type, SH.NodeShape))
    g.add((estate_shape, SH.targetClass, OPDA.LegalEstate))
    g.add((estate_shape, DCTERMS.source, _baspi5_question("A1.3")))

    # ownershipType (Freehold/Leasehold/Commonhold/Managed Freehold/Other)
    _add_property_shape(
        g, estate_shape,
        path=OPDA.ownershipType,
        min_count=1, max_count=1,
        in_scheme_members=_scheme_members("OwnershipTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=1, sh_group=grp_ownership,
        form_question_anchor="A1.3",
        message="BASPI5 question A1.3: ownership type is required.",
    )
    # tenureKind (Freehold/Leasehold/Commonhold)
    _add_property_shape(
        g, estate_shape,
        path=OPDA.tenureKind,
        in_scheme_members=_scheme_members("TenureKindScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=2, sh_group=grp_ownership,
        form_question_anchor="A1.3",
    )
    for path, anchor, label in [
        (OPDA.isSharedOwnership, "A1.3.1", "shared ownership"),
        (OPDA.isGroundRentPayable, "A1.4.2", "ground rent payable"),
        (OPDA.sellerContributesToServiceCharge, "A1.5.1",
         "seller contributes to service charge"),
    ]:
        _add_property_shape(
            g, estate_shape,
            path=path,
            in_scheme_members=yes_no_members,
            dash_viewer=DASH.LabelViewer,
            dash_editor=DASH.EnumSelectEditor,
            sh_group=grp_ownership,
            form_question_anchor=anchor,
            message=f"BASPI5 question {anchor}: {label} (Yes/No).",
        )

    # --- Baspi5_SellerShape (BASPI5 participants[].role==Seller) ------
    seller_shape = OPDA.Baspi5_SellerShape
    g.add((seller_shape, RDF.type, SH.NodeShape))
    g.add((seller_shape, SH.targetClass, OPDA.Seller))
    g.add((seller_shape, DCTERMS.source, _baspi5_question("B1")))
    # role (Seller-only branch — discriminator)
    _add_property_shape(
        g, seller_shape,
        path=OPDA.role,
        min_count=1, max_count=1,
        in_scheme_members=["Seller"],
        sh_order=1, sh_group=grp_participants,
        form_question_anchor="B1.1",
    )
    # name + email required per BASPI5 participants[].required
    _add_property_shape(
        g, seller_shape,
        path=URIRef("http://www.w3.org/2006/vcard/ns#fn"),
        min_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=2, sh_group=grp_participants,
        form_question_anchor="B1.2",
    )
    _add_property_shape(
        g, seller_shape,
        path=URIRef("http://www.w3.org/2006/vcard/ns#email"),
        min_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=3, sh_group=grp_participants,
        form_question_anchor="B1.3",
    )

    # --- Baspi5_SellersCapacityShape (BASPI5 sellersCapacity oneOf) ---
    # Per ODR-0010 §Q5: oneOf → sh:xone. Two branches:
    #   (a) Legal Owner / Mortgagee in Possession (no extra requirements)
    #   (b) Personal Representative / Power of Attorney / Assistant /
    #       Other → REQUIRE sellersCapacityDetails + attachments.
    capacity_shape = OPDA.Baspi5_SellersCapacityShape
    g.add((capacity_shape, RDF.type, SH.NodeShape))
    g.add((capacity_shape, SH.targetClass, OPDA.Seller))
    g.add((capacity_shape, SH.severity, SH.Violation))
    g.add((capacity_shape, DCTERMS.source, _baspi5_question("B1.3")))

    # xone list
    xone_list = BNode()
    g.add((capacity_shape, SH.xone, xone_list))

    # Branch (a) — Legal Owner / Mortgagee in Possession
    branch_a = BNode()
    branch_a_prop = BNode()
    g.add((branch_a, SH.property, branch_a_prop))
    g.add((branch_a_prop, SH.path, OPDA.hasAssertedCapacity))
    _add_in_list(g, branch_a_prop, ["Legal Owner", "Mortgagee in Possession"])
    g.add((branch_a_prop, SH.minCount, Literal(1)))

    # Branch (b) — Personal Rep / PoA / Assistant / Other
    branch_b = BNode()
    branch_b_prop = BNode()
    g.add((branch_b, SH.property, branch_b_prop))
    g.add((branch_b_prop, SH.path, OPDA.hasAssertedCapacity))
    _add_in_list(g, branch_b_prop, [
        "Personal Representative for a Deceased Owner",
        "Under Power of Attorney",
        "Assistant",
        "Other",
    ])
    g.add((branch_b_prop, SH.minCount, Literal(1)))
    # Branch (b) ALSO requires evidenced authority (sellersCapacityDetails +
    # attachments per BASPI5 B1.3.2 + B1.3.3).
    branch_b_evidence = BNode()
    g.add((branch_b, SH.property, branch_b_evidence))
    g.add((branch_b_evidence, SH.path, OPDA.hasEvidencedAuthority))
    g.add((branch_b_evidence, SH.minCount, Literal(1)))
    g.add((branch_b_evidence, SH.message, Literal(
        "BASPI5 question B1.3.2-3: Personal Representative / Power of "
        "Attorney / Assistant / Other capacity requires sellersCapacity"
        "Details + attachments.",
        lang="en",
    )))

    # Attach branches to the xone RDF list (deterministic order)
    Collection(g, xone_list, [branch_a, branch_b])

    # --- Baspi5_BuyerShape (participants[].role==Buyer) ----------------
    buyer_shape = OPDA.Baspi5_BuyerShape
    g.add((buyer_shape, RDF.type, SH.NodeShape))
    g.add((buyer_shape, SH.targetClass, OPDA.Buyer))
    g.add((buyer_shape, DCTERMS.source, _baspi5_question("B1")))
    # role-branch admission (non-seller branch of participants oneOf)
    _add_property_shape(
        g, buyer_shape,
        path=OPDA.role,
        min_count=1, max_count=1,
        in_scheme_members=[
            "Buyer", "Seller's Conveyancer", "Prospective Buyer",
            "Buyer's Conveyancer", "Estate Agent", "Buyer's Agent",
            "Surveyor", "Mortgage Broker", "Lender", "Landlord", "Tenant",
        ],
        sh_order=1, sh_group=grp_participants,
        form_question_anchor="B1.1",
    )

    # --- Baspi5_EPCCertificateShape (BASPI5 A1.8.3.1) -----------------
    epc_shape = OPDA.Baspi5_EPCCertificateShape
    g.add((epc_shape, RDF.type, SH.NodeShape))
    g.add((epc_shape, SH.targetClass, OPDA.EPCCertificate))
    g.add((epc_shape, DCTERMS.source, _baspi5_question("A1.8.3.1")))
    _add_property_shape(
        g, epc_shape,
        path=OPDA.currentEnergyRating,
        min_count=1, max_count=1,
        in_scheme_members=_scheme_members("CurrentEnergyRatingScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=1, sh_group=grp_energy,
        form_question_anchor="A1.8.3.1.1",
        message="BASPI5: EPC current energy rating (A-G) required.",
    )

    return g


# --- Generator-comment header --------------------------------------------
def _comment_header(
    filename: str, emission_date: str, git_sha: str,
) -> str:
    """Build the generator-comment block prepended to the profile file."""
    lines = [
        f"# profiles/{filename} — BASPI5 overlay profile",
        f"# Generated by opda-gen {__version__} at {emission_date}; "
        f"DO NOT HAND-EDIT.",
        "# Specification: "
        "https://openpropdata.org.uk/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://openpropdata.org.uk/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://openpropdata.org.uk/adr/ADR-0013-overlay-profile-emission",
        f"# Generator version: opda-gen-{__version__}",
        f"# Source commit: {git_sha}",
        "# Ratifying ODR: ODR-0010 (overlay profile mechanism); §Q1 "
        "ValidationContext reification, §Q3 dct:source IRIs, §Q4 DASH UI, "
        "§Q5 oneOf-as-xone, §Q6 no-identity-override, §Q7 BASPI5 MVP gate.",
        "# Three-rule interface contract enforced by "
        "tools/opda-gen/src/opda_gen/ci/profile_contract_test.py.",
        "",
    ]
    return "\n".join(lines) + "\n"


# --- Public API ----------------------------------------------------------
def emit_profile(
    overlay: str,
    output_dir: Path,
    *,
    emission_date: str | None = None,
    git_sha: str | None = None,
) -> dict[Path, str]:
    """Emit one overlay profile under ``output_dir/profiles/``.

    Returns a dict mapping written ``Path`` → Turtle content (utf-8 str)
    matching the foundation/vocabularies emitter interface.

    ``emission_date`` and ``git_sha`` default to the pinned constants
    per the G6 convention; CI MUST regenerate with the pinned defaults
    so the byte-identity diff is zero. Override in tests to exercise
    alternate values.
    """
    if overlay not in PROFILE_FILENAMES:
        raise ValueError(
            f"unknown overlay {overlay!r}; supported: {sorted(PROFILE_FILENAMES)}"
        )
    profiles_dir = output_dir / "profiles"
    profiles_dir.mkdir(parents=True, exist_ok=True)

    date_str = emission_date or _PROFILE_LAST_MODIFIED
    sha_str = git_sha or _PROFILE_SOURCE_COMMIT

    if overlay == "baspi5":
        graph = _build_baspi5_profile()
    else:  # pragma: no cover - guarded above
        raise NotImplementedError(f"profile builder for {overlay!r} not implemented")

    filename = PROFILE_FILENAMES[overlay]
    header = _comment_header(filename, date_str, sha_str)
    body = to_canonical_turtle(graph).decode("utf-8")
    content = header + body

    out_path = profiles_dir / filename
    out_path.write_text(content, encoding="utf-8", newline="")
    return {out_path: content}


# Backwards-compat alias kept for the ADR-0008 stub-importers (none
# in production code, but the docstring promised this symbol).
def emit(overlay: str, output_dir: Path) -> dict[Path, str]:
    """Alias for :func:`emit_profile`; preserved for ADR-0008 stub callers."""
    return emit_profile(overlay, output_dir)
