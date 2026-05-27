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
"""

from __future__ import annotations

from pathlib import Path

from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, XSD

from opda_gen import __version__
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces -----------------------------------------------------------
OPDA = Namespace("https://w3id.org/opda/#")
DPV = Namespace("https://w3id.org/dpv#")
DPV_PD_NS = Namespace("https://w3id.org/dpv/pd#")


# --- Sentinel-pinned constants per the G6 convention ---------------------
_ANNOTATIONS_LAST_MODIFIED = "2026-05-27"
_ANNOTATIONS_SOURCE_COMMIT = "pinned-by-ADR-0012"


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
_ODR_0005_S3C = URIRef("https://w3id.org/opda/odr/ODR-0005#section-3c")
_ODR_0006_Q1 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q1")
_ODR_0006_Q6 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q6")
_ODR_0009_Q6 = URIRef("https://w3id.org/opda/odr/ODR-0009#section-Q6")
_ODR_0012_PHASE1 = URIRef("https://w3id.org/opda/odr/ODR-0012#section-Phase-1")
_ODR_0015_S7A = URIRef("https://w3id.org/opda/odr/ODR-0015#section-7a")
_ODR_0018_RULE1 = URIRef("https://w3id.org/opda/odr/ODR-0018#section-Rule1")
_ODR_0018_RULE3 = URIRef("https://w3id.org/opda/odr/ODR-0018#section-Rule3")
_ODR_0018_3A = URIRef("https://w3id.org/opda/odr/ODR-0018#section-3a")

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
         URIRef("https://w3id.org/opda/0.3.0/")),
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
        dpv-pd:hasPersonalDataCategory <DPV-PD category URI> ;
        dct:source <ODR-XXXX#section-Y> .
    ```
    """
    g.add((kind, URIRef(
        "https://w3id.org/dpv/pd#hasPersonalDataCategory"
    ), category))
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
    module_iri = URIRef("https://w3id.org/opda/property-annotations/")
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
    module_iri = URIRef("https://w3id.org/opda/agent-annotations/")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Agent Annotations",
    ):
        g.add(t)

    # --- opda:Person baseline + property-level refinements --------------
    _add_dpv_baseline(
        g, kind=OPDA.Person, category=DPV_PD_NAME,
        source_iri=_ODR_0006_Q1,
    )
    # Property-level co-annotations per ODR-0018 §Rule 4 (both
    # class-level and property-level admissible). Variant refinements
    # for email and date-of-birth predicates if/when they materialise
    # on opda:Person are stubbed as DPVMappingRefinement records so the
    # consuming generator (ADR-0013) can dispatch lawful basis.
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.PersonEmailRefinement,
        kind=OPDA.Person,
        variant_predicate=OPDA.hasEmail,
        variant_value="email",
        lawful_basis=DPV_PD_EMAILADDRESS,
        regulator_source=URIRef(
            "https://ico.org.uk/for-organisations/guide-to-data-protection/"
        ),
        source_iri=_ODR_0018_3A,
    )
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.PersonDateOfBirthRefinement,
        kind=OPDA.Person,
        variant_predicate=OPDA.hasDateOfBirth,
        variant_value="dob",
        lawful_basis=DPV_PD_DATEOFBIRTH,
        regulator_source=URIRef(
            "https://ico.org.uk/for-organisations/guide-to-data-protection/"
        ),
        source_iri=_ODR_0018_3A,
    )

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
    module_iri = URIRef("https://w3id.org/opda/transaction-annotations/")
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
    module_iri = URIRef("https://w3id.org/opda/claim-annotations/")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Claim Annotations",
    ):
        g.add(t)

    # --- opda:Claim baseline (per ODR-0009 §Q6 + ODR-0018 §Rule 1) ----
    _add_dpv_baseline(
        g, kind=OPDA.Claim, category=DPV_PD_OFFICIALID,
        source_iri=_ODR_0009_Q6,
    )

    # --- Evidence subclass refinements per ODR-0009 §Q6 ---------------
    # DocumentEvidence — regulated-profession provenance → PublicTask
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.DocumentEvidenceRefinement,
        kind=OPDA.DocumentEvidence,
        variant_predicate=RDF.type,
        variant_value="document-evidence",
        lawful_basis=DPV_PUBLICTASK,
        regulator_source=URIRef(
            "https://ico.org.uk/for-organisations/guide-to-data-protection/"
        ),
        source_iri=_ODR_0009_Q6,
    )
    # ElectronicRecordEvidence — statutory provenance → LegalObligation
    # (we use DPV_LEGITIMATEINTEREST as the closest DPV term currently
    # in the bootstrap registry; full DPV namespace expansion is
    # deferred to ADR-0013).
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.ElectronicRecordEvidenceRefinement,
        kind=OPDA.ElectronicRecordEvidence,
        variant_predicate=RDF.type,
        variant_value="electronic-record-evidence",
        lawful_basis=DPV_LEGITIMATEINTEREST,
        regulator_source=URIRef(
            "https://ico.org.uk/for-organisations/guide-to-data-protection/"
        ),
        source_iri=_ODR_0009_Q6,
    )
    # VouchEvidence — private grant → Consent
    _add_dpv_variant_refinement(
        g,
        map_iri=OPDA.VouchEvidenceRefinement,
        kind=OPDA.VouchEvidence,
        variant_predicate=RDF.type,
        variant_value="vouch-evidence",
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
    module_iri = URIRef("https://w3id.org/opda/governance-annotations/")
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
    module_iri = URIRef("https://w3id.org/opda/descriptive-annotations/")
    for t in _module_annotations_header(
        module_iri=module_iri, title="OPDA Descriptive Annotations",
    ):
        g.add(t)

    # --- opda:EPCCertificate baseline ----------------------------------
    _add_dpv_baseline(
        g, kind=OPDA.EPCCertificate, category=DPV_PD_POSTALADDRESS,
        source_iri=_ODR_0018_RULE1,
    )
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
        "https://openpropdata.org.uk/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://openpropdata.org.uk/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://openpropdata.org.uk/adr/ADR-0012-shacl-and-dpv-annotation-emission",
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
