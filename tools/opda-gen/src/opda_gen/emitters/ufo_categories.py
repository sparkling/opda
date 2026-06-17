"""
UFO meta-category facet — `opda:ufoCategory` + `opda:UFOCategoryScheme`.

**ODR-0031 / council session-041 (realised by ADR-0045).** The
`opda:ufoCategory` facet is an INERT, annotation-graph-only documentary
annotation. This module emits the WHOLE facet block into the foundation
annotation graph (`opda-annotations.ttl`), via
`foundation.build_annotations_graph()`:

  1. the `opda:ufoCategory` **`owl:AnnotationProperty`** declaration — retyped
     from `owl:DatatypeProperty` (ADR-0045). OWL 2 §10.1: annotation properties
     carry no model-theoretic consequence, so inertness is *intrinsic to the
     term*, not contingent on the ODR-0029 shallow regime;
  2. one `opda:ufoCategory` **string** tag per `owl:Class` (the 9-term UFO
     endurant/perdurant axis) — the value stays a literal keyed to the
     concept's `skos:notation` (ODR-0031 R1 string range; the resource is the
     mapping anchor);
  3. `opda:UFOCategoryScheme` — a SKOS ConceptScheme of 9 category concepts,
     each bearing its OntoClean signature (`skos:definition`), a
     `skos:notation` matching the string tag, and a `skos:closeMatch` to the
     gUFO IRI where one exists.

**OntoClean per-type markup (ADR-0046 / council session-042).** Conditionally
adopted: the `opda:ontoCleanRigidity` / `opda:ontoCleanIdentity` /
`opda:ontoCleanDependence` `owl:AnnotationProperty` declarations and per-type
tags are emitted into `opda-annotations.ttl` (annotation-graph-only;
NEVER the class or shapes graphs; OWL 2 §10.1 inert). SCOPE: the subsumption
lattice the TBox OntoClean meta-shape (emitted in `shapes.py`) ranges over, plus
its contrast set — the five subclass-bearing types (Transaction, Proprietorship,
Proprietor, Buyer, Seller) and their three direct supers (Relator, Role,
RoleMixin). Values DERIVE from each type's `opda:ufoCategory` signature; ±D is
emitted ONLY for the Relator family (Relator, Transaction, Proprietorship) where
the Relator-founds topology turned on dependence. NEVER `opda:ontoCleanUnity`.
Atomic with the meta-shape: CI fails if tags exist without the consuming shape.

**Why here, not in the class graph.** ADR-0044 Phase 5c declared the predicate
`owl:DatatypeProperty` and asserted the tags inline in the reasoned class graphs
— breaching ODR-0030 Rule 1 ("annotation-graph-only; retention lapses if
breached") and firing Cagle's session-040 re-open trigger (i). ADR-0045
relocates the whole block here and adds a sixth three-graph CI gate forbidding
the advisory-predicate family in the classes graph.

**Red line (ODR-0031 R2).** The `skos:closeMatch`→gUFO edges are
referenced-not-imported and NEVER reasoned over: `gufo:Kind` carries
`rdfs:subClassOf` axioms and ODR-0029 closes over `rdfs:subClassOf`, so an
alignment edge in a reasoned graph would re-import contested metaphysics. The
scheme lives only in the annotation graph; no `owl:imports gufo:`.

**Register-deference scheme axis.** The ODR-0011 §8a scheme-level tags
("Quale-in-Region" etc.) are NO LONGER carried on `opda:ufoCategory`
(ODR-0030 Rule 2 — register-deference, not UFO categorial work); see
`emitters/vocabularies.py`.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

OPDA = Namespace("https://opda.org.uk/pdtf/")
# gUFO (Almeida, Guizzardi, Sales & Fonseca) — referenced (reference-not-import);
# bound only on the annotation graph this module writes to.
GUFO = Namespace("http://purl.org/nemo/gufo#")

_ODR_0011_8A = OPDA["harness/odr/ODR-0011/section-8a"]
_ODR_0031 = OPDA["harness/odr/ODR-0031"]


# class local-name -> UFO meta-category string (the inert facet value).
UFO_CATEGORY: dict[str, str] = {
    # Substance Kinds — rigid sortals supplying their own identity criterion.
    "Address": "Substance Kind",
    "LegalEstate": "Substance Kind",
    "NearbyFacility": "Substance Kind",
    "Organisation": "Substance Kind",
    "Person": "Substance Kind",
    "Property": "Substance Kind",
    "RegisteredTitle": "Substance Kind",
    "DiagnosticExemplar": "Substance Kind",
    "ValidationContext": "Substance Kind",
    # Information Objects — informational artefacts.
    "AttachedDocument": "Information Object",
    "Claim": "Information Object",
    "Comparable": "Information Object",
    "DPVMappingRecord": "Information Object",
    "EPCCertificate": "Information Object",
    "GeneratorRun": "Information Object",
    "LeaseTerm": "Information Object",
    "RiskAssessment": "Information Object",
    "Search": "Information Object",
    "Survey": "Information Object",
    "TrustFramework": "Information Object",
    "Valuation": "Information Object",
    # Events — perdurants.
    "LeaseExtensionEvent": "Event",
    "Milestone": "Event",
    "NameChangeEvent": "Event",
    "UPRNSuccessionEvent": "Event",
    "VerificationActivity": "Event",
    # Relators — relational endurants mediating two or more bearers.
    "Proprietorship": "Relator",
    "Relator": "Relator",
    "Transaction": "Relator",
    # RoleMixins — anti-rigid, externally founded, cross-sortal roles.
    "Buyer": "RoleMixin",
    "Evidence": "RoleMixin",
    "RoleMixin": "RoleMixin",
    "Seller": "RoleMixin",
    # Roles — anti-rigid, sortal roles.
    "Proprietor": "Role",
    "Role": "Role",
    # Qualities and quality-value structures.
    "AssuranceLevel": "Quality",
    "MonetaryAmount": "Quality Value",
    "RoomDimension": "Quality Value",
    # Collectives — aggregates of endurants.
    "TransactionChain": "Collective",
    # opda:SpecialCategoryScheme — a SKOS ConceptScheme container, not UFO-typed.
}


# category string -> (concept local-name, gUFO local-name | None, OntoClean
# signature definition). The concept is the dereferenceable anchor that carries
# the gUFO alignment + the OntoClean signature; the class tag stays a plain
# string keyed to the concept's skos:notation (ODR-0031 R1). gUFO local-name is
# None where no faithful gUFO endurant type exists (Information Object is a
# domain/IAO notion; Quality Value is a quale-in-region structure, not a class).
UFO_CATEGORY_CONCEPTS: dict[str, tuple[str, str | None, str]] = {
    "Substance Kind": (
        "SubstanceKindCategory", "Kind",
        "A rigid sortal (OntoClean +R, +O) that supplies its own principle of "
        "identity — instances are necessarily of this type, and it carries an "
        "identity criterion its instances inherit.",
    ),
    "Information Object": (
        "InformationObjectCategory", None,
        "An informational artefact / information content entity (documentary). "
        "An OPDA domain category rather than a core UFO endurant universal — "
        "cf. IAO information content entity (ODR-0030 Rule 4 crosswalk).",
    ),
    "Event": (
        "EventCategory", "Event",
        "A perdurant (occurrent): an entity that unfolds in time and has "
        "temporal parts.",
    ),
    "Relator": (
        "RelatorCategory", "Relator",
        "A relational endurant founded by an event, mediating two or more "
        "bearers (OntoClean +R, +I, +D). The relational-reification primitive "
        "(ODR-0030): it owns the relation's aggregation/modal attributes.",
    ),
    "RoleMixin": (
        "RoleMixinCategory", "RoleMixin",
        "An anti-rigid, externally-founded, dispersive (cross-sortal) role "
        "(OntoClean −R, +D) that spans more than one Kind.",
    ),
    "Role": (
        "RoleCategory", "Role",
        "An anti-rigid, externally-founded sortal role played by a single Kind "
        "(OntoClean −R, +D).",
    ),
    "Quality": (
        "QualityCategory", "Quality",
        "An individualised quality inhering in an endurant. Descends from "
        "DOLCE's Quality (Masolo et al., WonderWeb D18, 2003).",
    ),
    "Quality Value": (
        "QualityValueCategory", None,
        "The value of a quality — its position (Quale) in a quality region / "
        "space. Descends from DOLCE's Quale-in-Region (Masolo et al., "
        "WonderWeb D18, 2003).",
    ),
    "Collective": (
        "CollectiveCategory", "Collection",
        "An aggregate of endurants with uniform membership (cf. "
        "gufo:Collection).",
    ),
}


_DECL_COMMENT = (
    "The UFO foundational meta-category of an ontology class — one of "
    "Substance Kind / Information Object / Event / Relator / RoleMixin / Role / "
    "Quality / Quality Value / Collective. A documentary annotation "
    "(owl:AnnotationProperty — no logical axioms, OWL 2 §10.1): it records the "
    "design-time foundational commitment without entailing anything (the "
    "classification doctrine keeps kinds as facets, not subclass trees — "
    "ODR-0027). The category resource (opda:UFOCategoryScheme) carries the gUFO "
    "alignment and the OntoClean signature; this predicate carries the inert "
    "string tag, keyed to the concept's skos:notation (ODR-0031)."
)

_DECL_SCOPE_NOTE = (
    "UFO-informed, not UFO-grounded — the wire format reasons with nothing "
    "UFO-shaped (ODR-0030 Rule 7). (i) The categories are UFO's (Guizzardi "
    "2005). (ii) UFO's quality categories (Quality, Quality Value) descend from "
    "DOLCE's Quality / Quale / Region (Masolo et al., WonderWeb D18, 2003). "
    "(iii) The majority of OPDA's quality-tagged properties fall under that "
    "DOLCE-derived apparatus. Annotation-graph-only and referenced-not-imported "
    "to gUFO; never reasoned over (ODR-0031 R2; ODR-0030 Rule 1)."
)

_SCHEME = OPDA.UFOCategoryScheme


def emit_ufo_category_annotations(graph: Graph) -> None:
    """Emit the whole `opda:ufoCategory` facet into ``graph``.

    ``graph`` is the foundation annotation graph (`opda-annotations.ttl`).
    Adds the `owl:AnnotationProperty` declaration, the per-class string tags,
    and the `opda:UFOCategoryScheme` concept anchors. Mutates ``graph`` in
    place. ODR-0031 / ADR-0045.
    """
    graph.bind("gufo", GUFO)

    # (1) Declaration — owl:AnnotationProperty (inert by OWL 2 §10.1).
    graph.add((OPDA.ufoCategory, RDF.type, OWL.AnnotationProperty))
    graph.add((OPDA.ufoCategory, RDFS.range, XSD.string))
    graph.add((OPDA.ufoCategory, RDFS.label, Literal("UFO category", lang="en")))
    graph.add((OPDA.ufoCategory, RDFS.comment, Literal(_DECL_COMMENT, lang="en")))
    graph.add((OPDA.ufoCategory, SKOS.scopeNote, Literal(_DECL_SCOPE_NOTE, lang="en")))
    graph.add((OPDA.ufoCategory, DCTERMS.source, _ODR_0011_8A))
    graph.add((OPDA.ufoCategory, DCTERMS.source, _ODR_0031))

    # (2) Per-class inert string tags (the 9-term UFO endurant/perdurant axis).
    for local, category in UFO_CATEGORY.items():
        graph.add((OPDA[local], OPDA.ufoCategory, Literal(category)))

    # (3) opda:UFOCategoryScheme — the dereferenceable category anchors that
    # bear the gUFO alignment + OntoClean signature (ODR-0031 R1).
    graph.add((_SCHEME, RDF.type, SKOS.ConceptScheme))
    graph.add((_SCHEME, DCTERMS.title, Literal("UFO Category Scheme", lang="en")))
    graph.add((_SCHEME, SKOS.prefLabel, Literal("UFO Category Scheme", lang="en")))
    graph.add((_SCHEME, SKOS.definition, Literal(
        "The nine UFO foundational meta-categories OPDA classifies its classes "
        "under. Each concept carries its OntoClean signature and a "
        "skos:closeMatch to the corresponding gUFO type where one exists. "
        "Referenced-not-imported; never reasoned over (ODR-0031 R2).",
        lang="en",
    )))
    graph.add((_SCHEME, DCTERMS.source, _ODR_0031))
    for category, (cname, gufo_local, definition) in UFO_CATEGORY_CONCEPTS.items():
        concept = OPDA[cname]
        graph.add((concept, RDF.type, SKOS.Concept))
        graph.add((concept, SKOS.inScheme, _SCHEME))
        graph.add((concept, SKOS.prefLabel, Literal(category, lang="en")))
        graph.add((concept, SKOS.notation, Literal(category)))
        graph.add((concept, SKOS.definition, Literal(definition, lang="en")))
        if gufo_local is not None:
            graph.add((concept, SKOS.closeMatch, GUFO[gufo_local]))
        graph.add((concept, DCTERMS.source, _ODR_0031))

    # (4) OntoClean per-type markup (ADR-0046 / session-042). Annotation-graph-
    # only; NEVER class or shapes graphs; NEVER opda:ontoCleanUnity.
    emit_ontoclean_annotations(graph)


# ---------------------------------------------------------------------------
# ADR-0046: OntoClean per-type markup (annotation-graph-only, OWL 2 §10.1).
# ---------------------------------------------------------------------------
# Scope: the subsumption lattice the TBox OntoClean meta-shape ranges over
# + its contrast set — the five subclass-bearing OPDA types and their three
# direct supers. Values derive from each type's opda:ufoCategory signature.
# ±D emitted ONLY for the Relator family where the Relator-founds decision
# turned on dependence. NEVER opda:ontoCleanUnity.
#
# Rigidity values:
#   "rigid"       = +R  (instances necessarily of this type)
#   "anti-rigid"  = −R  (instances contingently of this type)
#   "semi-rigid"  = neither (some instances necessarily, some contingently)
#   "non-rigid"   = ¬+R (no instance is necessarily of this type)
#
# Identity values:
#   "supplies-IC"  = +I (the type supplies an identity criterion for its instances)
#   "carries-IC"   = inherits IC from its supertype/category
#   "no-own-IC"    = −I (no own IC; borrows from bearer — Roles/RoleMixins)
#
# Per-type tags (annotating opda classes; lattice + contrast set):
#
# Relator — RelatorCategory sig (+R, +I, +D); supplies IC = (bearers, event) tuple.
# Transaction subClassOf Relator — inherits +R+D from Relator; carries IC from category.
# Proprietorship subClassOf Relator — same as Transaction.
# Role — RoleCategory sig (−R, +D implicit); never supplies own IC (borrows from bearer).
# Proprietor subClassOf Role — inherits −R; no own IC.
# RoleMixin — RoleMixinCategory sig (−R); never supplies own IC.
# Buyer subClassOf RoleMixin — inherits −R; no own IC.
# Seller subClassOf RoleMixin — inherits −R; no own IC.
#
# Canonical-query invariant (ADR-0046 §Confirmation):
#   SELECT ?sub ?super WHERE { ?sub rdfs:subClassOf ?super .
#     ?super opda:ontoCleanRigidity "anti-rigid" }
# MUST return EMPTY — no anti-rigid type is a superclass of anything here.

_ADR_0046 = OPDA["harness/adr/ADR-0046"]

# ---------------------------------------------------------------------------
# ADR-0050: g(ufoCategory) — the OntoClean rigidity/identity/dependence
# projection is a real FUNCTION of the single canonical typing axis
# (opda:ufoCategory), no longer a hand-maintained value-table.
# ---------------------------------------------------------------------------
# Council session-049 (matches hm ODR-0100): ufoCategory is the single
# canonical typing axis; the OntoClean (±R, ±I, ±D) triple is a DERIVED VIEW
# of it, never an independent assertion. This made the hand-table's
# "Derived from each type's opda:ufoCategory signature" docstring true in
# extension but false in mechanism (Allemang's verified bug, session-049).
# `g` closes that gap: it computes the triple from the closed
# UFOCategoryScheme signatures, so single-valued-ness holds BY CONSTRUCTION.
#
# `_UFO_CATEGORY_SIGNATURE` is g itself: the closed category → (rigidity,
# identity-baseline, dependence) map, transcribed from the OntoClean
# signatures the UFO_CATEGORY_CONCEPTS skos:definitions already carry
# (RelatorCategory "+R, +I, +D"; Role/RoleMixin "−R, +D"; etc.). Non-sortal
# categories (Information Object, Quality, Quality Value, Collective) — and
# the perdurant Event — get rigidity "non-rigid" with NO identity / NO
# dependence: g NEVER coerces a ±R/±I onto a category whose nature does not
# carry one (the corpus-wide ±R coercion session-049 REJECTED 4–0).
#
#   rigidity:  "rigid" (+R) | "anti-rigid" (−R) | "non-rigid" (¬+R)
#   identity:  "supplies-IC" (+I) | "no-own-IC" (−I) | None (non-sortal)
#   dependence:"dependent" (+D) | None
_UFO_CATEGORY_SIGNATURE: dict[str, tuple[str, str | None, str | None]] = {
    # Rigid sortals.
    "Substance Kind": ("rigid", "supplies-IC", None),
    "Relator": ("rigid", "supplies-IC", "dependent"),
    # Anti-rigid roles — never supply their own IC (borrow from a bearer).
    "Role": ("anti-rigid", "no-own-IC", None),
    "RoleMixin": ("anti-rigid", "no-own-IC", None),
    # Non-sortals + perdurant — no ±R/±I/±D coercion (session-049).
    "Information Object": ("non-rigid", None, None),
    "Event": ("non-rigid", None, None),
    "Quality": ("non-rigid", None, None),
    "Quality Value": ("non-rigid", None, None),
    "Collective": ("non-rigid", None, None),
}


def ontoclean_signature(
    local: str, *, is_subkind: bool
) -> tuple[str, str | None, str | None]:
    """Project a class's OntoClean (rigidity, identity, dependence) triple.

    g(ufoCategory) yields the *category* signature (the rigidity/identity/
    dependence the category root bears); ``is_subkind`` carries the one
    structural bit g(category) cannot: a subkind within a `supplies-IC`
    category INHERITS rather than supplies its IC, so its identity downgrades
    `supplies-IC → carries-IC` (e.g. Transaction ⊑ Relator). Rigidity and
    dependence pass straight through (a subkind is as rigid / as dependent as
    its category). This keeps the OntoClean triple a derived function of the
    single canonical axis (ADR-0050 / session-049). Raises ``KeyError`` if
    ``local`` carries no ufoCategory or its category is outside the closed
    scheme (a fail-loud guard, never a silent default).
    """
    category = UFO_CATEGORY[local]
    rigidity, identity, dependence = _UFO_CATEGORY_SIGNATURE[category]
    if is_subkind and identity == "supplies-IC":
        identity = "carries-IC"
    return rigidity, identity, dependence


# Emission SCOPE for the OntoClean tags — the intra-`opda:` rdfs:subClassOf
# edge participants + contrast set (Davis's edge-participant scope;
# session-042/049): the five subclass-bearing OPDA types and their three
# direct supers. This is a SCOPE decision (which classes get tagged), NOT the
# tag VALUES — the values derive from g (above). It is NOT corpus-wide: the
# ~31 edgeless classes stay untagged by design (session-049 REJECTED 4–0 the
# corpus-wide rigidity-vector population). `is_subkind` marks the five
# subkinds whose IC inherits from a supplies-IC super.
_ONTOCLEAN_SCOPE: dict[str, bool] = {
    # Relator family — the rigid Relator super + its two founded subkinds.
    "Relator": False,
    "Transaction": True,
    "Proprietorship": True,
    # Role family — the anti-rigid Role super + its subkind.
    "Role": False,
    "Proprietor": True,
    # RoleMixin family — the anti-rigid RoleMixin super + its two subkinds.
    "RoleMixin": False,
    "Buyer": True,
    "Seller": True,
}

# (local-name → (rigidity, identity, dependence | None)), DERIVED via g — no
# longer hand-typed. dependence surfaces ONLY for the Relator family (the
# session-042 ±D rule), because g returns it ONLY for the Relator signature.
_ONTOCLEAN_TAGS: dict[str, tuple[str, str, str | None]] = {
    local: ontoclean_signature(local, is_subkind=is_subkind)  # type: ignore[misc]
    for local, is_subkind in _ONTOCLEAN_SCOPE.items()
}

_RIGIDITY_COMMENT = (
    "OntoClean rigidity meta-property (ADR-0046 / council session-042). "
    "owl:AnnotationProperty — annotation-graph-only, OWL 2 §10.1 inert. "
    "Values: 'rigid' (+R), 'anti-rigid' (−R), 'semi-rigid', 'non-rigid'. "
    "Scope: the subsumption lattice the TBox OntoClean meta-shape ranges over "
    "(Relator, Transaction, Proprietorship, Role, Proprietor, RoleMixin, "
    "Buyer, Seller) + their contrast set. Derived from each type's "
    "opda:ufoCategory signature; NEVER opda:ontoCleanUnity. Consumed by the "
    "TBox OntoClean meta-shape CI gate (ADR-0046 §change 3+4)."
)

_IDENTITY_COMMENT = (
    "OntoClean identity meta-property (ADR-0046 / council session-042). "
    "owl:AnnotationProperty — annotation-graph-only, OWL 2 §10.1 inert. "
    "Values: 'supplies-IC' (+I, the type supplies an IC), 'carries-IC' "
    "(inherits IC from supertype/category), 'no-own-IC' (−I, borrows IC "
    "from bearer — Roles and RoleMixins). Derived from each type's "
    "opda:ufoCategory signature."
)

_DEPENDENCE_COMMENT = (
    "OntoClean dependence meta-property (ADR-0046 / council session-042). "
    "owl:AnnotationProperty — annotation-graph-only, OWL 2 §10.1 inert. "
    "Value: 'dependent' (+D, externally founded). Emitted ONLY for the "
    "Relator family (Relator, Transaction, Proprietorship) where the "
    "Relator-founds-RoleMixin topology turned on dependence (session-042 ±D "
    "rule: ±D only where a Relator decision turned on it). "
    "NEVER opda:ontoCleanUnity."
)


def emit_ontoclean_annotations(graph: Graph) -> None:
    """Emit the ADR-0046 OntoClean per-type annotation-property tags.

    Emits three `owl:AnnotationProperty` declarations
    (`opda:ontoCleanRigidity`, `opda:ontoCleanIdentity`,
    `opda:ontoCleanDependence`) and per-type tags for the eight types in
    the subsumption lattice + contrast set. All triples land in ``graph``
    (the annotation graph — `opda-annotations.ttl`). NEVER the class or
    shapes graphs. NEVER `opda:ontoCleanUnity`. ADR-0046 / session-042.
    """
    # Annotation-property declarations.
    graph.add((OPDA.ontoCleanRigidity, RDF.type, OWL.AnnotationProperty))
    graph.add((OPDA.ontoCleanRigidity, RDFS.label,
               Literal("OntoClean rigidity", lang="en")))
    graph.add((OPDA.ontoCleanRigidity, RDFS.comment,
               Literal(_RIGIDITY_COMMENT, lang="en")))
    graph.add((OPDA.ontoCleanRigidity, DCTERMS.source, _ADR_0046))
    graph.add((OPDA.ontoCleanRigidity, DCTERMS.source, _ODR_0031))

    graph.add((OPDA.ontoCleanIdentity, RDF.type, OWL.AnnotationProperty))
    graph.add((OPDA.ontoCleanIdentity, RDFS.label,
               Literal("OntoClean identity", lang="en")))
    graph.add((OPDA.ontoCleanIdentity, RDFS.comment,
               Literal(_IDENTITY_COMMENT, lang="en")))
    graph.add((OPDA.ontoCleanIdentity, DCTERMS.source, _ADR_0046))
    graph.add((OPDA.ontoCleanIdentity, DCTERMS.source, _ODR_0031))

    graph.add((OPDA.ontoCleanDependence, RDF.type, OWL.AnnotationProperty))
    graph.add((OPDA.ontoCleanDependence, RDFS.label,
               Literal("OntoClean dependence", lang="en")))
    graph.add((OPDA.ontoCleanDependence, RDFS.comment,
               Literal(_DEPENDENCE_COMMENT, lang="en")))
    graph.add((OPDA.ontoCleanDependence, DCTERMS.source, _ADR_0046))
    graph.add((OPDA.ontoCleanDependence, DCTERMS.source, _ODR_0031))

    # Per-type tags — annotation-graph-only (ADR-0046 §confirmation criterion 1).
    for local, (rigidity, identity, dependence) in _ONTOCLEAN_TAGS.items():
        subj = OPDA[local]
        graph.add((subj, OPDA.ontoCleanRigidity, Literal(rigidity)))
        graph.add((subj, OPDA.ontoCleanIdentity, Literal(identity)))
        if dependence is not None:
            graph.add((subj, OPDA.ontoCleanDependence, Literal(dependence)))
