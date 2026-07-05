"""
Module annotations.

Realises:
- ADR-0012 — DPV annotation graph emission (six per-module annotation
  TTLs). Reference-not-import discipline: this module cites DPV terms
  via `dct:source` and `dpv-pd:hasPersonalDataCategory` URIRef triples;
  does NOT add `owl:imports <https://w3id.org/dpv/pd>`.
- ADR-0008 §"Repository structure" — `emitters/annotations.py` per layout.
- ADR-0007 §"Deterministic emission rules" — canonical serialiser owns
  ordering; this module builds rdflib.Graph instances.
- ODR-0004 §3a — three-graph separation; advisory annotations live in
  the annotation graph, NOT the class or shapes graphs.
- ODR-0010 §Q1–Q6 — annotation-graph contract realised here.
- ODR-0012 — DPV Phase-1 + Article 10 discipline; mapping tables
  consumed from `opda-governance.ttl`.
- ODR-0018 §Rule 1–3 — class-level baseline DPV co-annotation; variant-
  conditional refinements via mapping tables; DPV triples MUST live in
  `opda-annotations.ttl`.

Co-annotation placement per ADR-0012 §"DPV co-annotation emission":

- `opda:Person` → `opda-agent-annotations.ttl` carries baseline
  `dpv-pd:hasPersonalDataCategory dpv-pd:Name` + variant refinements
  (email → EmailAddress; dob → DateOfBirth).
- `opda:Organisation` → `opda-agent-annotations.ttl` documents no PII
  category baseline (sole-trader/individual-director surface yields
  Person co-annotation, not Organisation).
- `opda:Property` → `opda-property-annotations.ttl` baseline
  `dpv-pd:hasPersonalDataCategory dpv-pd:PostalAddress`.
- `opda:RegisteredTitle` → `opda-property-annotations.ttl`
  `dpv-pd:hasPersonalDataCategory dpv-pd:PublicData` (S005 §3c
  published-PII regime under HMLR open-register).
- `opda:Address` → `opda-property-annotations.ttl` baseline
  `dpv-pd:hasPersonalDataCategory dpv-pd:PostalAddress` + three
  variant-conditional refinements per ODR-0015 §7a (title → PublicTask
  HMLR; marketing → Consent/LegitimateInterest; inspire → PublicTask
  INSPIRE Directive).
- `opda:Claim` → `opda-claim-annotations.ttl` baseline
  `dpv-pd:hasPersonalDataCategory dpv-pd:OfficialID` + variant
  refinements per claim subject (DocumentEvidence variant; ElectronicRecord
  variant; Vouch variant).
- `opda:EPCCertificate` → `opda-descriptive-annotations.ttl` baseline
  PostalAddress + owner-identifiable hint per ODR-0018 §References.
- Transaction / governance modules — header-only annotations files
  documenting no baseline DPV co-annotation (transactions are events
  not PII bearers per ODR-0007; governance classes are themselves
  meta-DPV records, not PII bearers).

IAO information-artefact crosswalk (ODR-0030 Rule 4, ADOPT-NOW):
a thin, external, referenced-not-imported `skos:closeMatch` from OPDA's
document/record family to `obo:IAO` — never `owl:imports`, never reasoned
over. `skos:closeMatch` (not `rdfs:subClassOf`) is the deliberate predicate
choice: the production loader's OWL-RL-safe closure (`scripts/fuseki-load.mjs`)
runs its `rdfs:subClassOf` type-propagation rule over `urn:x-arq:UnionGraph`
— the union of *every* named graph in the dataset, so an `rdfs:subClassOf`
triple placed in the annotation graph would still be reasoned over. SKOS
mapping properties are not touched by any of the seven safe RDFS-Plus rules
(ODR-0029), so `closeMatch` stays inert regardless of graph placement — the
same reasoning ODR-0031 R2 applies to the gUFO alignment edges.
- `opda:EPCCertificate` / `opda:Search` → `obo:IAO_0000310` (document).
- `opda:AttachedDocument` → `obo:IAO_0000310` (document) — its own class
  comment already calls it "A NEUTRAL document Kind".
- `opda:RegisteredTitle` → `obo:IAO_0000030` (information content entity) —
  an HMLR title-register RECORD (open-ended registry-event history), not a
  single fixed "document" in IAO's collection-of-ICEs sense.
- "Requisitions" (ODR-0030 Rule 4's fifth named family member) has no
  corresponding OPDA class — grep of the corpus found none — and Rule 7 of
  the same ODR keeps the Hohfeldian deontic core (charges, covenants,
  easements, requisitions) UFO-L-shaped, explicitly stating "the bridge
  never touches it". No crosswalk edge is emitted for it; this is a
  deliberate scope gap, not an oversight.
- `obo:IAO_0000033` (directive information entity) is verified (OBO
  Foundry / OLS4, cross-checked against the Ontobee PURL redirect) but
  UNUSED: no current OPDA class is a directive information entity, and
  Rule 7 keeps the deontic instruments that might have wanted it out of
  the bridge's scope.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

from opda_gen import __version__
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces -----------------------------------------------------------
OPDA = Namespace("https://opda.org.uk/pdtf/")
DPV = Namespace("https://w3id.org/dpv#")
DPV_PD_NS = Namespace("https://w3id.org/dpv/pd#")
# gUFO (Almeida, Guizzardi et al. 2019) — referenced (reference-not-import)
# by the ADR-0034 gated typing pass; bound ONLY in the descriptive graph.
GUFO = Namespace("http://purl.org/nemo/gufo#")
# OBO / IAO (Information Artifact Ontology) — referenced (reference-not-
# import) per ODR-0030 Rule 4. IRIs verified 2026-07-05 against OLS4
# (https://www.ebi.ac.uk/ols4) and cross-checked via the Ontobee PURL
# redirect (purl.obolibrary.org/obo/IAO_XXXXXXX → ontobee.org/browser).
OBO = Namespace("http://purl.obolibrary.org/obo/")


# --- Sentinel-pinned constants per the G6 convention ---------------------
# ADR-0014: opda:targetsClassGraph refs bump 0.4.0 → 1.0.0 (post G14).
_ANNOTATIONS_LAST_MODIFIED = "2026-05-28"
_ANNOTATIONS_SOURCE_COMMIT = "pinned-by-ADR-0014"


# --- Per-module annotation file metadata ---------------------------------
ANNOTATION_MODULE_METADATA: dict[str, tuple[str, str, str]] = {
    "property": (
        "opda-property-annotations.ttl",
        "OPDA Property Annotations",
        "ODR-0005 + ODR-0012 + ODR-0015 + ODR-0018",
    ),
    "agent": (
        "opda-agent-annotations.ttl",
        "OPDA Agent Annotations",
        "ODR-0006 + ODR-0012 + ODR-0018",
    ),
    "transaction": (
        "opda-transaction-annotations.ttl",
        "OPDA Transaction Annotations",
        "ODR-0007 + ODR-0012",
    ),
    "claim": (
        "opda-claim-annotations.ttl",
        "OPDA Claim Annotations",
        "ODR-0009 + ODR-0012 + ODR-0018",
    ),
    "governance": (
        "opda-governance-annotations.ttl",
        "OPDA Governance Annotations",
        "ODR-0012 + ODR-0018",
    ),
    "descriptive": (
        "opda-descriptive-annotations.ttl",
        "OPDA Descriptive Annotations",
        "ODR-0008 + ODR-0018",
    ),
}


# --- dct:source URIs ----------------------------------------------------
_ODR_0005_S3C = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3c")
_ODR_0006_Q1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q1")
_ODR_0006_Q6 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q6")
_ODR_0009_Q6 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q6")
_ODR_0012_PHASE1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Phase-1")
_ODR_0015_S7A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-7a")
_ODR_0018_RULE1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule1")
_ODR_0018_RULE3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule3")
_ODR_0018_3A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-3a")
_ODR_0008_Q5A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q5a")
_ODR_0030_RULE_4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0030/section-Rule-4")

# IAO term URIs (reference-not-import: verified against OLS4 + the Ontobee
# PURL redirect, 2026-07-05 — see module docstring). ODR-0030 Rule 4.
IAO_DOCUMENT = OBO["IAO_0000310"]
IAO_INFORMATION_CONTENT_ENTITY = OBO["IAO_0000030"]
IAO_DIRECTIVE_INFORMATION_ENTITY = OBO["IAO_0000033"]  # verified, unused — see docstring

# DPV term URIs (reference-not-import: we cite via URIRef, never imports).
DPV_PD_NAME = URIRef("https://w3id.org/dpv/pd#Name")
DPV_PD_EMAILADDRESS = URIRef("https://w3id.org/dpv/pd#EmailAddress")
DPV_PD_DATEOFBIRTH = URIRef("https://w3id.org/dpv/pd#DateOfBirth")
DPV_PD_POSTALADDRESS = URIRef("https://w3id.org/dpv/pd#PostalAddress")
DPV_PD_PUBLICDATA = URIRef("https://w3id.org/dpv/pd#PublicData")
DPV_PD_OFFICIALID = URIRef("https://w3id.org/dpv/pd#OfficialID")
DPV_PD = URIRef("https://w3id.org/dpv/pd")
DPV_PUBLICTASK = URIRef("https://w3id.org/dpv#PublicTask")
DPV_CONSENT = URIRef("https://w3id.org/dpv#Consent")
DPV_LEGITIMATEINTEREST = URIRef("https://w3id.org/dpv#LegitimateInterest")


# --- Common helpers -------------------------------------------------------
def _bind_common(graph: Graph) -> None:
    """Bind the prefixes used by annotation graphs."""
    graph.bind("opda", OPDA)
    graph.bind("owl", OWL)
    graph.bind("rdfs", RDFS)
    graph.bind("dct", DCTERMS)
    graph.bind("xsd", XSD)
    graph.bind("dpv", DPV)
    graph.bind("dpv-pd", DPV_PD_NS)
    graph.bind("skos", SKOS)
    graph.bind("obo", OBO)


def _module_annotations_header(
    *,
    module_iri: URIRef,
    title: str,
) -> list[tuple]:
    """Build the per-module ontology-header triples for an annotations
    graph. Per ODR-0004 §3a, the annotations file is its own ontology
    pointing at the class-graph via `opda:targetsClassGraph`. Per
    ADR-0012 + ODR-0018 §Rule 3, it MUST NOT import DPV. The
    `dct:references` triple documents the DPV vocabulary cited by the
    URIRef triples below (reference-not-import).
    """
    return [
        (module_iri, RDF.type, OWL.Ontology),
        (module_iri, DCTERMS.title, Literal(title, lang="en")),
        (module_iri, OPDA.targetsClassGraph,
         URIRef("https://opda.org.uk/pdtf/")),
        (module_iri, DCTERMS.references, DPV_PD),
    ]


def _add_dpv_baseline(
    g: Graph,
    *,
    kind: URIRef,
    category: URIRef,
    source_iri: URIRef,
) -> None:
    """Emit a class-level DPV baseline triple per ODR-0018 §Rule 1.

    Pattern:

    ```turtle
    opda:<Kind>
        opda:isPIIBearing true ;
        dpv-pd:hasPersonalDataCategory <DPV-PD category URI> ;
        dct:source <ODR-XXXX#section-Y> .
    ```

    The `opda:isPIIBearing true` flag (ADR-0005 §G D3) marks the Kind as a
    target for the Phase-1 PII-floor rule `PIIWithoutDPVCoAnnotationRule`;
    asserting it on exactly the class-level-baseline Kinds keeps the rule's
    target set in lockstep with the set of co-annotated Kinds, so the floor
    is enforced rather than firing on the empty set.
    """
    g.add((kind, OPDA.isPIIBearing, Literal(True)))
    g.add((kind, URIRef(
        "https://w3id.org/dpv/pd#hasPersonalDataCategory"
    ), category))
    g.add((kind, DCTERMS.source, source_iri))


def _add_dpv_property_category(
    g: Graph,
    *,
    predicate: URIRef,
    category: URIRef,
    source_iri: URIRef,
) -> None:
    """Emit a property-level DPV PII-category co-annotation per ODR-0018
    §Rule 4 (property-level co-annotation is admissible alongside the
    class-level baseline).

    Pattern:

    ```turtle
    opda:<predicate>
        dpv-pd:hasPersonalDataCategory <DPV-PD category URI> ;
        dct:source <ODR-XXXX#section-Y> .
    ```

    Distinct from `_add_dpv_variant_refinement` (which maps a Kind+variant
    tuple to a DPV *lawful basis* via `opda:lawfulBasis`): this attaches a
    DPV-PD *category* directly to a declared predicate.
    """
    g.add((predicate, URIRef(
        "https://w3id.org/dpv/pd#hasPersonalDataCategory"
    ), category))
    g.add((predicate, DCTERMS.source, source_iri))


def _add_iao_crosswalk(
    g: Graph,
    *,
    kind: URIRef,
    iao_term: URIRef,
    source_iri: URIRef = _ODR_0030_RULE_4,
) -> None:
    """Emit a `skos:closeMatch` IAO crosswalk edge per ODR-0030 Rule 4.

    `skos:closeMatch`, never `rdfs:subClassOf`: the production closure's
    subClassOf type-propagation rule reads `urn:x-arq:UnionGraph` — every
    named graph in the dataset — so `rdfs:subClassOf` is NOT inert merely
    by living in the annotation graph. SKOS mapping properties are outside
    all seven safe RDFS-Plus rules (ODR-0029), which is what makes this
    edge referenced-not-imported and genuinely never-reasoned-over.
    """
    g.add((kind, SKOS.closeMatch, iao_term))
    g.add((kind, DCTERMS.source, source_iri))


def _add_dpv_variant_refinement(
    g: Graph,
    *,
    map_iri: URIRef,
    kind: URIRef,
    variant_predicate: URIRef,
    variant_value: str,
    lawful_basis: URIRef,
    regulator_source: URIRef,
    source_iri: URIRef,
) -> None:
    """Emit a variant-conditional refinement per ODR-0018 §3a mapping
    table pattern. Each refinement is its own subject (the map_iri) so
    consumers can query the map by Kind + variant value to retrieve the
    lawful basis.
    """
    g.add((map_iri, RDF.type, OPDA.DPVMappingRefinement))
    g.add((map_iri, OPDA.targetsKind, kind))
    g.add((map_iri, OPDA.variantPredicate, variant_predicate))
    g.add((map_iri, OPDA.variantValue, Literal(variant_value)))
    g.add((map_iri, OPDA.lawfulBasis, lawful_basis))
    g.add((map_iri, DCTERMS.references, regulator_source))
    g.add((map_iri, DCTERMS.source, source_iri))


# --- Per-module annotation builders --------------------------------------
def build_property_annotations() -> Graph:
    """Property module annotations: Property + Address (baseline +
    three variant refinements) + RegisteredTitle (published-PII).
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/property-annotations")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Property Annotations",
    ):
        g.add(t)

    # --- opda:Property baseline -----------------------------------------
    _add_dpv_baseline(
        g, kind=OPDA.Property, category=DPV_PD_POSTALADDRESS,
        source_iri=_ODR_0018_RULE1,
    )

    # --- opda:Address baseline -----------------------------------------
    _add_dpv_baseline(
        g, kind=OPDA.Address, category=DPV_PD_POSTALADDRESS,
        source_iri=_ODR_0015_S7A,
    )

    # --- opda:RegisteredTitle published-PII (S005 §3c) -----------------
    _add_dpv_baseline(
        g, kind=OPDA.RegisteredTitle, category=DPV_PD_PUBLICDATA,
        source_iri=_ODR_0005_S3C,
    )

    # --- IAO information-artefact crosswalk (ODR-0030 Rule 4) -----------
    # RegisteredTitle is an open-ended HMLR registry RECORD (title-number
    # lineage + registry-event history), not a single fixed "document" in
    # IAO's collection-of-ICEs sense — closeMatch to the broader
    # information content entity, not obo:IAO_0000310 document.
    _add_iao_crosswalk(
        g, kind=OPDA.RegisteredTitle, iao_term=IAO_INFORMATION_CONTENT_ENTITY,
    )

    # --- Address variant refinements (ODR-0015 §7a + ODR-0018 §3a) -----
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.AddressVariantTitleRefinement,
        kind=OPDA.Address,
        variant_predicate=OPDA.addressVariant,
        variant_value="title",
        lawful_basis=DPV_PUBLICTASK,
        regulator_source=URIRef(
            "https://www.gov.uk/government/organisations/land-registry"
        ),
        source_iri=_ODR_0015_S7A,
    )
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.AddressVariantMarketingRefinement,
        kind=OPDA.Address,
        variant_predicate=OPDA.addressVariant,
        variant_value="marketing",
        lawful_basis=DPV_CONSENT,
        regulator_source=URIRef(
            "https://ico.org.uk/for-organisations/guide-to-data-protection/"
        ),
        source_iri=_ODR_0015_S7A,
    )
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.AddressVariantInspireRefinement,
        kind=OPDA.Address,
        variant_predicate=OPDA.addressVariant,
        variant_value="inspire",
        lawful_basis=DPV_PUBLICTASK,
        regulator_source=URIRef(
            "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32007L0002"
        ),
        source_iri=_ODR_0015_S7A,
    )

    return g


def build_agent_annotations() -> Graph:
    """Agent module annotations: Person (baseline Name + email/DOB
    refinements) + Organisation (documented as not PII baseline).
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/agent-annotations")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Agent Annotations",
    ):
        g.add(t)

    # --- opda:Person baseline + property-level refinements --------------
    _add_dpv_baseline(
        g, kind=OPDA.Person, category=DPV_PD_NAME,
        source_iri=_ODR_0006_Q1,
    )
    # Property-level PII-category co-annotations per ODR-0018 §Rule 4
    # (both class-level and property-level admissible). These attach a
    # DPV-PD *category* to the bearing predicate — NOT a lawful basis;
    # they are emphatically not opda:lawfulBasis triples (which carry core
    # dpv: lawful-basis terms). ADR-0005 §G D2.
    #
    # opda:dateOfBirth IS declared on opda:Person (opda-agent.ttl, the
    # Category-G walk), so its DateOfBirth category attaches at the
    # property level.
    _add_dpv_property_category(
        g,
        predicate=OPDA.dateOfBirth,
        category=DPV_PD_DATEOFBIRTH,
        source_iri=_ODR_0018_3A,
    )
    # No email predicate is declared on opda:Person anywhere in the class
    # graph (neither opda:email nor opda:hasEmail exists — the prior
    # opda:hasEmail refinement referenced a non-existent predicate). Per
    # the ADR-0005 §G D2 fallback ("if neither exists, add the category as
    # an extra class-level dpv-pd:hasPersonalDataCategory value on
    # opda:Person"), the EmailAddress category is carried class-level on
    # opda:Person rather than invented onto a fictional predicate.
    g.add((OPDA.Person, URIRef(
        "https://w3id.org/dpv/pd#hasPersonalDataCategory"
    ), DPV_PD_EMAILADDRESS))

    # --- opda:Organisation — no baseline PII category (documented) -----
    # Per ODR-0006 §Q6: Organisation qua-Org is not a personal data
    # subject; sole-trader / individual-director surface yields Person
    # co-annotation, not Organisation. We document this with rdfs:comment
    # so consumers know the absence is intentional, not a missing record.
    g.add((OPDA.Organisation, RDFS.comment, Literal(
        "No DPV class-level PII baseline for opda:Organisation per "
        "ODR-0006 §Q6 + ODR-0018 §Rule 4. Organisations are not data "
        "subjects; the sole-trader / individual-director surface "
        "produces an opda:Person co-annotation (linked via the actor's "
        "ownership / control relationship), not an Organisation "
        "co-annotation.",
        lang="en",
    )))
    g.add((OPDA.Organisation, DCTERMS.source, _ODR_0006_Q6))

    return g


def build_transaction_annotations() -> Graph:
    """Transaction module annotations — header-only.

    Per ODR-0007: Transactions are events (Relators), not PII-bearing
    Substance Kinds. The participating Person/Organisation Roles bear
    DPV via the agent-annotations file; the Transaction-as-Relator
    itself has no DPV baseline.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/transaction-annotations")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Transaction Annotations",
    ):
        g.add(t)

    # Document the deliberate absence of DPV baselines.
    g.add((module_iri, RDFS.comment, Literal(
        "Transactions, Milestones, and TransactionChains are UFO Relators "
        "and event particulars — they are not personal data themselves. "
        "DPV co-annotations attach to the participating Person / "
        "Organisation roles (see opda-agent-annotations.ttl) and to the "
        "Property side (see opda-property-annotations.ttl).",
        lang="en",
    )))
    g.add((module_iri, DCTERMS.source, _ODR_0012_PHASE1))

    return g


def build_claim_annotations() -> Graph:
    """Claim module annotations: Claim baseline + Evidence variants
    per ODR-0009 §Q6 + ODR-0018 §Rule 4.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/claim-annotations")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Claim Annotations",
    ):
        g.add(t)

    # --- opda:Claim baseline (per ODR-0009 §Q6 + ODR-0018 §Rule 1) ----
    _add_dpv_baseline(
        g, kind=OPDA.Claim, category=DPV_PD_OFFICIALID,
        source_iri=_ODR_0009_Q6,
    )

    # --- IAO information-artefact crosswalk (ODR-0030 Rule 4) -----------
    # AttachedDocument's own class comment already calls it "A NEUTRAL
    # document Kind" — closeMatch to obo:IAO_0000310 document.
    _add_iao_crosswalk(g, kind=OPDA.AttachedDocument, iao_term=IAO_DOCUMENT)

    # --- Evidence-KIND refinements per ODR-0009 §Q6 (value-keyed) ------
    # ODR-0027 §R6: the …Evidence subclasses are retired; evidence-kind is the
    # coded opda:evidenceType classification. Each refinement keys on
    # kind=opda:Evidence + variantPredicate=opda:evidenceType + the OIDC4IDA
    # notation value (matching opda:EvidenceMethodScheme + the exemplars), so the
    # per-kind lawful-basis distinction is preserved on the coded value, not a
    # subclass rdf:type.
    # Document-kind — regulated-profession provenance → PublicTask
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.DocumentEvidenceRefinement,
        kind=OPDA.Evidence,
        variant_predicate=OPDA.evidenceType,
        variant_value="Document",
        lawful_basis=DPV_PUBLICTASK,
        regulator_source=URIRef(
            "https://ico.org.uk/for-organisations/guide-to-data-protection/"
        ),
        source_iri=_ODR_0009_Q6,
    )
    # Electronic-Record kind — statutory provenance → LegitimateInterest
    # (closest DPV term in the bootstrap registry; full DPV expansion
    # deferred to ADR-0013).
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.ElectronicRecordEvidenceRefinement,
        kind=OPDA.Evidence,
        variant_predicate=OPDA.evidenceType,
        variant_value="Electronic-Record",
        lawful_basis=DPV_LEGITIMATEINTEREST,
        regulator_source=URIRef(
            "https://ico.org.uk/for-organisations/guide-to-data-protection/"
        ),
        source_iri=_ODR_0009_Q6,
    )
    # Vouch kind — private grant → Consent
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.VouchEvidenceRefinement,
        kind=OPDA.Evidence,
        variant_predicate=OPDA.evidenceType,
        variant_value="Vouch",
        lawful_basis=DPV_CONSENT,
        regulator_source=URIRef(
            "https://ico.org.uk/for-organisations/guide-to-data-protection/"
        ),
        source_iri=_ODR_0009_Q6,
    )

    return g


def build_governance_annotations() -> Graph:
    """Governance module annotations — header-only.

    DPVMappingRecord and SpecialCategoryScheme are meta-records about
    the DPV regime, not PII themselves. The actual PII categories they
    declare appear in the per-Kind annotation files.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/governance-annotations")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Governance Annotations",
    ):
        g.add(t)
    g.add((module_iri, RDFS.comment, Literal(
        "Governance classes (DPVMappingRecord, SpecialCategoryScheme) "
        "are meta-records declaring the DPV regime; they themselves "
        "carry no DPV class-level baseline (the categories they declare "
        "appear in the per-Kind annotation files). Per ODR-0012 + "
        "ODR-0018 §Rule 1 — the DPV co-annotation pattern applies to "
        "PII-bearing Substance Kinds, not to the meta-records that "
        "describe the DPV scheme itself.",
        lang="en",
    )))
    g.add((module_iri, DCTERMS.source, _ODR_0012_PHASE1))
    return g


def build_descriptive_annotations() -> Graph:
    """Descriptive module annotations: EPCCertificate carries
    PostalAddress + owner-identifiable PII per ODR-0018 §References.
    """
    g = Graph()
    _bind_common(g)
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/descriptive-annotations")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Descriptive Annotations",
    ):
        g.add(t)

    # --- opda:EPCCertificate baseline ----------------------------------
    _add_dpv_baseline(
        g, kind=OPDA.EPCCertificate, category=DPV_PD_POSTALADDRESS,
        source_iri=_ODR_0018_RULE1,
    )

    # --- IAO information-artefact crosswalk (ODR-0030 Rule 4) -----------
    # EPCCertificate and Search are both single, formally-issued documents
    # (a certificate; a search report) — closeMatch to obo:IAO_0000310
    # document.
    _add_iao_crosswalk(g, kind=OPDA.EPCCertificate, iao_term=IAO_DOCUMENT)
    _add_iao_crosswalk(g, kind=OPDA.Search, iao_term=IAO_DOCUMENT)

    # Survey / Search / Valuation / Comparable: not PII-bearing in their
    # own right (the address attached to each gets PII coverage via the
    # opda:Property baseline). Document with rdfs:comment to make the
    # decision explicit per ODR-0018 §Rule 1.
    for cls in (OPDA.Survey, OPDA.Search, OPDA.Valuation, OPDA.Comparable):
        g.add((cls, RDFS.comment, Literal(
            "No DPV class-level baseline; PII coverage flows transitively "
            "via the linked opda:Property (which carries the postal-"
            "address baseline). Per ODR-0018 §Rule 1: only direct PII-"
            "bearing Kinds declare a baseline; transitively-linked Kinds "
            "do not duplicate the upstream baseline.",
            lang="en",
        )))
        g.add((cls, DCTERMS.source, _ODR_0018_RULE1))

    # --- ADR-0034 — gated gUFO rdf:type typing pass (session-029 Q5, 6–0–0)
    # The uncontested Quale-in-Region Property descriptive leaves carry a
    # gufo:Quality classification *as a typing* — preserved in this
    # annotation graph, NEVER the shapes graph (ODR-0010 §Q7a), and never as
    # an owl:Class declaration. It preserves the UFO Quality insight without
    # minting the rejected ODR-0008a/b/c namespaces, and is conjunct (i) of
    # the ODR-0023 R2 re-open trigger. The triple is an advisory meta-category
    # marker on the attribute (NOT a claim that the datatype property is a
    # quality particular; the IC stays ODR-0008 §Q5a's). OMITTED pending a
    # rigid one-cell adjudication: the straddlers priceQualifier /
    # marketingTenure (Mode/Quality) and the re-sorter ownershipType
    # (quality-by-type vs legal-estate-by-bearer); and tenureKind (a
    # Substance-Kind label, not a Quality/Mode).
    g.bind("gufo", GUFO)
    g.add((module_iri, RDFS.comment, Literal(
        "gUFO typing pass (ADR-0034 / session-029 Q5): the uncontested "
        "Quale-in-Region Property descriptive leaves are classified "
        "gufo:Quality as an advisory UFO meta-category typing — preserved "
        "here in the annotation graph, never the shapes graph (ODR-0010 "
        "§Q7a), and never as an owl:Class declaration. This is a "
        "classification marker on the attribute, not a claim that the "
        "datatype property is a quality particular; the identity criterion "
        "remains ODR-0008 §Q5a's. The straddlers (priceQualifier, "
        "marketingTenure) and the re-sorter (ownershipType) are omitted "
        "pending a rigid one-cell adjudication; tenureKind is a "
        "Substance-Kind label, not a Quality.",
        lang="en",
    )))
    for leaf in (
        OPDA.currentEnergyRating,
        OPDA.councilTaxBand,
        OPDA.builtForm,
        OPDA.centralHeatingFuelType,
        OPDA.heatingType,
    ):
        g.add((leaf, RDF.type, GUFO.Quality))
        g.add((leaf, DCTERMS.source, _ODR_0008_Q5A))

    return g


# --- Module-registry dispatcher -----------------------------------------
ANNOTATIONS_MODULE_REGISTRY: dict[str, callable] = {
    "property": build_property_annotations,
    "agent": build_agent_annotations,
    "transaction": build_transaction_annotations,
    "claim": build_claim_annotations,
    "governance": build_governance_annotations,
    "descriptive": build_descriptive_annotations,
}


# --- Public API: emit_annotations ---------------------------------------
def _comment_header(
    *,
    filename: str,
    title: str,
    ratifying_odrs: str,
    emission_date: str,
    git_sha: str,
) -> str:
    """Build the generator-comment block prepended to every annotations TTL."""
    lines = [
        f"# {filename} — {title}",
        f"# Generated by opda-gen {__version__} at {emission_date}; "
        f"DO NOT HAND-EDIT.",
        "# Specification: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0012-shacl-and-dpv-annotation-emission",
        f"# Ratifying ODR(s): {ratifying_odrs}",
        f"# Generator version: opda-gen-{__version__}",
        f"# Source commit: {git_sha}",
        "# MUST NOT contain sh:* or owl:Class triples",
        "# (ODR-0004 §3a three-graph separation).",
        "# Reference-not-import for DPV per ODR-0018 §Rule 3: DPV terms",
        "# cited via dct:references + URIRef triples; no owl:imports.",
        "",
    ]
    return "\n".join(lines) + "\n"


def emit_annotations(
    output_dir: Path,
    *,
    module: str | None = None,
    emission_date: str | None = None,
    git_sha: str | None = None,
) -> dict[Path, str]:
    """Emit per-module DPV annotation TTLs into ``output_dir``.

    When ``module`` is None, emits all six per-module annotation files.
    When ``module="property"`` (etc.), emits only that module's file.
    The foundation annotations graph (`opda-annotations.ttl`) is emitted
    via `opda_gen.emitters.foundation.emit_foundation()` and remains
    header-only.

    Returns a dict mapping written Path → Turtle content (utf-8 str).

    Raises ValueError if ``module`` is not one of the six known names.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = emission_date or _ANNOTATIONS_LAST_MODIFIED
    sha_str = git_sha or _ANNOTATIONS_SOURCE_COMMIT

    if module is not None:
        if module not in ANNOTATIONS_MODULE_REGISTRY:
            valid = ", ".join(sorted(ANNOTATIONS_MODULE_REGISTRY))
            raise ValueError(
                f"unknown annotations module {module!r}; valid: {valid}"
            )
        names = [module]
    else:
        names = ["property", "agent", "transaction", "claim",
                 "governance", "descriptive"]

    written: dict[Path, str] = {}
    for name in names:
        builder = ANNOTATIONS_MODULE_REGISTRY[name]
        filename, title, ratifying_odrs = ANNOTATION_MODULE_METADATA[name]
        graph = builder()
        header = _comment_header(
            filename=filename,
            title=title,
            ratifying_odrs=ratifying_odrs,
            emission_date=date_str,
            git_sha=sha_str,
        )
        body = to_canonical_turtle(graph).decode("utf-8")
        content = header + body
        out_path = output_dir / filename
        out_path.write_text(content, encoding="utf-8", newline="")
        written[out_path] = content
    return written


# --- Legacy stub kept for backward compat with any pre-ADR-0012 caller ---
def emit(output_dir: Path) -> dict[Path, str]:
    """Backward-compatible alias for `emit_annotations(output_dir)`."""
    return emit_annotations(output_dir)
