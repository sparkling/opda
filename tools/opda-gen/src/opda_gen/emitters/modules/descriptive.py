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
    # ODR-0008d Rule 1 — the sixth class: the per-peril authority-retrieved
    # search/environmental result (an Information Object on the PROV-O
    # backbone).
    OPDA.RiskAssessment,
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
    OPDA.hasSubAssessment,
    OPDA.peril,
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
    OPDA.actionAlertRating,
    OPDA.disclosureDetail,
    OPDA.inclusionStatus,
    OPDA.price,
    OPDA.riskIndicator,
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
    # ranging over opda:RiskIndicatorScheme (No / Not known / Yes). A
    # Quale-in-Region datatype property; the node shape sh:in-restricts it to
    # the scheme value-space. (Already attested as a flat datatype property
    # in the data dictionary; here it is given its RiskAssessment home.)
    g.add((OPDA.riskIndicator, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.riskIndicator, RDFS.domain, OPDA.RiskAssessment))
    g.add((OPDA.riskIndicator, RDFS.range, XSD.string))
    g.add((OPDA.riskIndicator, RDFS.label, Literal("risk indicator", lang="en")))
    g.add((OPDA.riskIndicator, RDFS.comment, Literal(
        "Whether action is recommended / the property is at risk for the "
        "RiskAssessment's peril (No / Not known / Yes). Value-space is "
        "opda:RiskIndicatorScheme; the node shape sh:in-restricts it "
        "(ODR-0008d Rule 1c / Rule 4).",
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
