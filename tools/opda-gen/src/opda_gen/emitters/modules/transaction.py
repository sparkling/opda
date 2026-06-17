"""
Module transaction.

Realises:
- ADR-0011 §"Per-module detail — opda-transaction.ttl" — Transaction
  (Relator) + Milestone + TransactionChain + LeaseTerm placement (LeaseTerm
  itself lives in opda-property.ttl as it's a property-side endurant;
  this module emits only the Transaction-relator perspective).
- ADR-0007 §"A9 per-kind discipline output" — every class carries
  rdfs:label + rdfs:comment + skos:scopeNote + dct:source.
- ODR-0007 §Rules — Transaction-as-Relator founding Seller/Buyer Roles;
  Chain as relation between Transactions; Milestones + status as Phases;
  OWL-Time intervals; prov:atTime for instants; PROV-O Plan-vs-Activity
  reification (S007 Q6); five-tuple IC over party-substitution / estate-
  change / transaction-id-reissuance / chain-link-break / aborted (Q1).

Core join predicates emitted here:
- opda:plannedAtTime (S007 Q6 PROV-O Plan)
- opda:occurredAtTime (informational completion-instant)
- opda:hasChainPosition (TransactionChain position)
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD


OPDA = Namespace("https://opda.org.uk/pdtf/")
PROV = Namespace("http://www.w3.org/ns/prov#")
TIME = Namespace("http://www.w3.org/2006/time#")


_ODR_0007_Q1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q1")
_ODR_0007_Q2 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q2")
_ODR_0007_Q4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q4")
_ODR_0007_Q6 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q6")
_ODR_0008_Q5A = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q5a")


# Data-dictionary schema-leaf-path dct:source (ODR-0022 G2); same form as the
# property-module helper (module-local to avoid a cross-emitter import).
def _dd_source(leaf_path: str) -> URIRef:
    """Return the data-dictionary schema-leaf-path `dct:source` IRI (G2)."""
    safe = leaf_path.replace(" ", "%20").replace("'", "%27")
    return URIRef(f"https://opda.org.uk/pdtf/harness/data-dictionary/{safe}")


CLASSES = (
    OPDA.Milestone,
    OPDA.Transaction,
    OPDA.TransactionChain,
)

OBJECT_PROPERTIES = (
    OPDA.concernsProperty,
    OPDA.hasChainPosition,
    OPDA.hasParticipant,
)

DATATYPE_PROPERTIES = (
    OPDA.authorisationToShare,
    OPDA.authorisedToActOnBehalfOfAllSellers,
    OPDA.confirmInformationIsAccurate,
    OPDA.confirmWillProvideAdditionalDocumentation,
    OPDA.confirmation,
    OPDA.consumerProtectionRegulationsResponse,
    OPDA.leaveKeys,
    OPDA.occurredAtTime,
    OPDA.plannedAtTime,
    OPDA.removeRubbish,
    OPDA.replaceLightFittings,
    OPDA.response,
    OPDA.sellingAgent,
    OPDA.signedOn,
    OPDA.takeReasonableCare,
    OPDA.transactionId,
)


def build_graph() -> Graph:
    """Build the Transaction module class + property graph."""
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("owl", OWL)
    g.bind("rdfs", RDFS)
    g.bind("skos", SKOS)
    g.bind("dct", DCTERMS)
    g.bind("xsd", XSD)
    g.bind("prov", PROV)
    g.bind("time", TIME)

    # --- Module ontology header --------------------------------------------
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/transaction")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title,
           Literal("OPDA Transaction Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://opda.org.uk/pdtf/harness/release/transaction/1.1.0/")))
    # The "any-of" documentary-domain/range convention (Council session-050 Q1
    # binding rider; ADR-0049; ODR-0032 §R1 session-050 amendment). opda:has-
    # Participant carries MULTIPLE rdfs:range triples (opda:Seller , opda:Buyer)
    # read as "any-of" (the schema.org domainIncludes / hm ODR-0014 idiom), NOT
    # the RDF Schema 1.1 §3.2 conjunction. Authored as documentary AI-signal per
    # ODR-0026 §R2 and NEVER entailed — the frozen 7-rule closure (ODR-0025 §R1)
    # consumes no rdfs:domain/range, so ADR-0035 proves zero domain/range
    # triples materialise. The authoritative disjunction is SHACL sh:or
    # (opda:HasParticipantRangeShape); owl:unionOf is NOT used (ODR-0030).
    g.add((module_iri, SKOS.editorialNote, Literal(
        "Documentary domain/range convention (ODR-0026 §R2; ODR-0032 §R1; "
        "Council session-050 Q1): rdfs:domain/rdfs:range on the object "
        "properties of this module are authored as documentary AI-signal and "
        "are NEVER entailed (the frozen 7-rule closure, ODR-0025 §R1, consumes "
        "no domain/range; ADR-0035 proves zero domain/range triples "
        "materialise). Where one property carries MULTIPLE rdfs:domain or "
        "rdfs:range triples (opda:hasParticipant — rdfs:range opda:Seller , "
        "opda:Buyer) they read as \"any-of\" (the schema.org domainIncludes "
        "idiom; hm ODR-0014), NOT the RDF Schema 1.1 §3.2 conjunction. SHACL "
        "sh:or is the authoritative disjunction (opda:HasParticipantRangeShape); "
        "owl:unionOf is NOT used (excluded construct, ODR-0030).",
        lang="en",
    )))

    # --- opda:Transaction — UFO Relator (ODR-0007 §Q1) ------------------
    g.add((OPDA.Transaction, RDF.type, OWL.Class))
    g.add((OPDA.Transaction, RDFS.subClassOf, OPDA.Relator))
    g.add((OPDA.Transaction, RDFS.label, Literal("Transaction", lang="en")))
    g.add((OPDA.Transaction, RDFS.comment, Literal(
        "Property-transaction Relator. UFO Relator (relational endurant). "
        "FIBO Arrangement precedent. Founds opda:Seller and opda:Buyer "
        "RoleMixins (ODR-0006 §Q2). IC: 5-tuple (LegalEstate-concerned, "
        "Sellers-set, Buyers-set, transaction-id-lineage, founding-event). "
        "Hard cases per S007 Q1: party-substitution; estate-change; "
        "transaction-id reissuance; chain-link-break; aborted-transaction. "
        "Carries transactionId via dct:identifier and external-system refs "
        "via opda:externalIds.",
        lang="en",
    )))
    g.add((OPDA.Transaction, SKOS.scopeNote, Literal(
        "UFO: Relator (Guizzardi 2005 Ch. 4 §4.4). FIBO: Arrangement "
        "precedent (FIBO-FND Arrangements module).",
        lang="en",
    )))
    g.add((OPDA.Transaction, DCTERMS.source, _ODR_0007_Q1))
    g.add((OPDA.Transaction, SKOS.definition, Literal(
        "Relational endurant binding the seller and buyer parties to the "
        "conveyance of a single legal estate, persisting and accumulating "
        "identity across the lifecycle of a property sale.",
        lang="en",
    )))
    g.add((OPDA.Transaction, RDFS.isDefinedBy, module_iri))

    # --- opda:Milestone — Transaction lifecycle event (ODR-0007 §Q2) ----
    g.add((OPDA.Milestone, RDF.type, OWL.Class))
    g.add((OPDA.Milestone, RDFS.subClassOf, PROV.Activity))
    g.add((OPDA.Milestone, RDFS.label, Literal("Milestone", lang="en")))
    g.add((OPDA.Milestone, RDFS.comment, Literal(
        "Transaction lifecycle milestone. UFO Event particular; PROV-O "
        "Activity. Hybrid PROV-O typing per S007 Q2: instant milestones "
        "(instruction, offerAccepted, exchange) carry prov:atTime; "
        "interval milestones (completion-process, registration-process) "
        "carry prov:startedAtTime + prov:endedAtTime per Moreau W3C-grade "
        "discipline. Each Milestone Activity may pair with a prov:Plan "
        "carrying opda:plannedAtTime for expected-vs-actual variance "
        "(S007 Q6 Plan-vs-Activity reification).",
        lang="en",
    )))
    g.add((OPDA.Milestone, SKOS.scopeNote, Literal(
        "UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7). DOLCE: "
        "Achievement (instant) or Accomplishment (interval) per Masolo "
        "et al. 2003 D18 §4.4. PROV-O: Activity (W3C PROV-O REC §3.2).",
        lang="en",
    )))
    g.add((OPDA.Milestone, DCTERMS.source, _ODR_0007_Q2))
    g.add((OPDA.Milestone, SKOS.definition, Literal(
        "Lifecycle event marking a significant point or stage in the "
        "progression of a property transaction, occurring either at a "
        "single instant or over a bounded interval.",
        lang="en",
    )))
    g.add((OPDA.Milestone, RDFS.isDefinedBy, module_iri))

    # --- opda:TransactionChain — Aggregate of dependent Transactions ----
    g.add((OPDA.TransactionChain, RDF.type, OWL.Class))
    g.add((OPDA.TransactionChain, RDFS.label,
           Literal("Transaction Chain", lang="en")))
    g.add((OPDA.TransactionChain, RDFS.comment, Literal(
        "Aggregate of dependent Transactions linked by buyer-also-seller "
        "participant overlap. S007 Q4 dual-mechanism: (a) recursive "
        "opda:dependsOnTransaction predicate between Transactions; "
        "(b) opda:chainMembers list-of-Transactions on a TransactionChain "
        "parent. Chain-length cap: sh:maxInclusive 7 per CLC data "
        "(ADR-0012 emits the SHACL constraint). Chain status is derived "
        "(any-blocked → chain-blocked).",
        lang="en",
    )))
    g.add((OPDA.TransactionChain, SKOS.scopeNote, Literal(
        "UFO: Aggregate (Guizzardi 2005 Ch. 4 §4.6 — collective of "
        "Relator instances). Dual modelling per S007 Q4 (recursive "
        "predicate + Aggregate) chosen because both shapes appear in "
        "real-world chain queries.",
        lang="en",
    )))
    g.add((OPDA.TransactionChain, DCTERMS.source, _ODR_0007_Q4))
    g.add((OPDA.TransactionChain, SKOS.definition, Literal(
        "Aggregate of interdependent property transactions linked where a "
        "buyer in one is concurrently a seller in the next, such that the "
        "completion of each is contingent on completion of the others.",
        lang="en",
    )))
    g.add((OPDA.TransactionChain, RDFS.isDefinedBy, module_iri))

    # --- DatatypeProperty: opda:occurredAtTime ---------------------------
    g.add((OPDA.occurredAtTime, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.occurredAtTime, RDFS.range, XSD.dateTime))
    g.add((OPDA.occurredAtTime, RDFS.label,
           Literal("occurred at time", lang="en")))
    g.add((OPDA.occurredAtTime, RDFS.comment, Literal(
        "Actual completion instant of an event (informational alias for "
        "prov:atTime on opda:Milestone Activities where the consumer "
        "prefers an opda-namespaced predicate). PROV-O prov:atTime is "
        "the canonical W3C form; this predicate sits alongside for "
        "round-trip convenience with PDTF v3 schemas that use "
        "'occurredAt' naming.",
        lang="en",
    )))
    g.add((OPDA.occurredAtTime, DCTERMS.source, _ODR_0007_Q2))
    g.add((OPDA.occurredAtTime, SKOS.definition, Literal(
        "Records the actual instant at which a transaction milestone event "
        "took place.",
        lang="en",
    )))
    g.add((OPDA.occurredAtTime, RDFS.isDefinedBy, module_iri))

    # --- DatatypeProperty: opda:plannedAtTime (S007 Q6) -----------------
    g.add((OPDA.plannedAtTime, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.plannedAtTime, RDFS.domain, PROV.Plan))
    g.add((OPDA.plannedAtTime, RDFS.range, XSD.dateTime))
    g.add((OPDA.plannedAtTime, RDFS.label,
           Literal("planned at time", lang="en")))
    g.add((OPDA.plannedAtTime, RDFS.comment, Literal(
        "Expected completion timestamp on a prov:Plan companion to an "
        "opda:Milestone Activity. Per S007 Q6 PROV-O Plan-vs-Activity "
        "reification, the planned time lives on the Plan resource and "
        "the actual time lives on the Activity; the Plan is linked from "
        "the Activity via prov:qualifiedAssociation → prov:Association "
        "→ prov:hadPlan. The Cagle opda:MilestoneVarianceRule (ADR-0012) "
        "materialises variance into the validation report at sh:Info "
        "(under 14 days) or sh:Warning (over 14 days).",
        lang="en",
    )))
    g.add((OPDA.plannedAtTime, DCTERMS.source, _ODR_0007_Q6))
    g.add((OPDA.plannedAtTime, SKOS.definition, Literal(
        "Records the expected instant at which a planned transaction "
        "milestone is forecast to occur, carried on the plan companion to "
        "the milestone for expected-versus-actual variance.",
        lang="en",
    )))
    g.add((OPDA.plannedAtTime, RDFS.isDefinedBy, module_iri))

    # --- ObjectProperty: opda:hasChainPosition --------------------------
    g.add((OPDA.hasChainPosition, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasChainPosition, RDFS.domain, OPDA.Transaction))
    g.add((OPDA.hasChainPosition, RDFS.range, OPDA.TransactionChain))
    g.add((OPDA.hasChainPosition, RDFS.label,
           Literal("has chain position", lang="en")))
    g.add((OPDA.hasChainPosition, RDFS.comment, Literal(
        "Join from a Transaction to its TransactionChain (S007 Q4 "
        "Aggregate side). Mirror of opda:chainMembers (Chain → "
        "Transactions). Both directions emitted so consumers can query "
        "from either end without inverse-property inference dependency.",
        lang="en",
    )))
    g.add((OPDA.hasChainPosition, DCTERMS.source, _ODR_0007_Q4))
    g.add((OPDA.hasChainPosition, SKOS.definition, Literal(
        "Relates a property transaction to the transaction chain of which "
        "it forms a part.",
        lang="en",
    )))
    g.add((OPDA.hasChainPosition, RDFS.isDefinedBy, module_iri))

    # --- ObjectProperty: opda:hasParticipant (ODR-0007 §Q1; ODR-0032) -------
    # Transaction → Seller/Buyer: the parties to the transaction (Council
    # session-047 GATED). rdfs:domain opda:Transaction is universally true (only
    # a Transaction has participants in this sense) and is asserted plain. The
    # Seller/Buyer co-domain is now authored as documentary "any-of" rdfs:range
    # opda:Seller , opda:Buyer (ODR-0032 §R1/§R2 session-050 amendment; the
    # schema.org domainIncludes idiom) — two triples read DISJUNCTIVELY per the
    # module-header convention, NOT the RDFS §3.2 conjunction. Authored as
    # AI-signal, NEVER entailed (the frozen closure consumes no domain/range —
    # ADR-0035 proves zero domain/range triples materialise, so the range does
    # NOT entail every participant is a Seller). The AUTHORITATIVE disjunction
    # stays in SHACL sh:or (opda:HasParticipantRangeShape); owl:unionOf is NOT
    # used (excluded construct, ODR-0030). Distinct from opda:founds (the Relator
    # → Role design-time founding spine): hasParticipant is the navigable
    # parties-of-transaction edge a consumer queries.
    g.add((OPDA.hasParticipant, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasParticipant, RDFS.domain, OPDA.Transaction))
    g.add((OPDA.hasParticipant, RDFS.range, OPDA.Seller))
    g.add((OPDA.hasParticipant, RDFS.range, OPDA.Buyer))
    g.add((OPDA.hasParticipant, RDFS.label,
           Literal("has participant", lang="en")))
    g.add((OPDA.hasParticipant, RDFS.comment, Literal(
        "Transaction → Seller/Buyer join: the parties to the transaction "
        "(ODR-0007; Council session-047 GATED). rdfs:domain opda:Transaction "
        "is asserted plain (universally true). The Seller/Buyer co-domain is "
        "documentary \"any-of\" rdfs:range opda:Seller , opda:Buyer (two "
        "triples read DISJUNCTIVELY per the module-header convention, NOT the "
        "RDFS §3.2 conjunction; schema.org domainIncludes idiom). Authored as "
        "AI-signal, NEVER entailed (zero domain/range triples materialise, "
        "ADR-0035 — so the range does NOT entail every participant is a "
        "Seller). The authoritative disjunction stays in SHACL sh:or "
        "(opda:HasParticipantRangeShape), NOT owl:unionOf. The navigable "
        "parties-of-transaction edge; distinct from the opda:founds Relator → "
        "Role founding spine (design-time, never reasoned).",
        lang="en",
    )))
    g.add((OPDA.hasParticipant, DCTERMS.source, _ODR_0007_Q1))
    g.add((OPDA.hasParticipant, SKOS.definition, Literal(
        "Relates a property transaction to a seller or buyer party to it.",
        lang="en",
    )))
    g.add((OPDA.hasParticipant, RDFS.isDefinedBy, module_iri))

    # --- ObjectProperty: opda:concernsProperty (ODR-0007 §Q1; ODR-0032) -----
    # Transaction → Property: the property the transaction is about (Council
    # session-047 GATED). Single-domain edge with no never-reasoned commitment,
    # so rdfs:domain opda:Transaction + rdfs:range opda:Property are BOTH
    # asserted (Council Q5 carrier ruling). Distinct from the milestone-side
    # opda:concerns (estate-typed) used in the diagnostic exemplars: this is the
    # Transaction-level join to the physical Property.
    g.add((OPDA.concernsProperty, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.concernsProperty, RDFS.domain, OPDA.Transaction))
    g.add((OPDA.concernsProperty, RDFS.range, OPDA.Property))
    g.add((OPDA.concernsProperty, RDFS.label,
           Literal("concerns property", lang="en")))
    g.add((OPDA.concernsProperty, RDFS.comment, Literal(
        "Transaction → Property join: the physical Property the transaction is "
        "about (ODR-0007; Council session-047 GATED). Single-domain edge with "
        "no never-reasoned commitment, so rdfs:domain opda:Transaction + "
        "rdfs:range opda:Property are both asserted (Council Q5 carrier "
        "ruling). The Transaction-level property join; the conveyed "
        "opda:LegalEstate is reached via opda:Property and "
        "opda:RegisteredTitle opda:recordsEstate.",
        lang="en",
    )))
    g.add((OPDA.concernsProperty, DCTERMS.source, _ODR_0007_Q1))
    g.add((OPDA.concernsProperty, SKOS.definition, Literal(
        "Relates a property transaction to the physical property that is "
        "its subject.",
        lang="en",
    )))
    g.add((OPDA.concernsProperty, RDFS.isDefinedBy, module_iri))

    # ==== Category-G curated walk — Family E: sale / completion / moving / ==
    # chain / sale-ready-declaration attributes (ADR-0031 work-item 2). Each
    # attaches to opda:Transaction — the Relator whose sale these completion
    # undertakings, declarations, and chain links concern (ODR-0007). Each a
    # flat datatype property per ODR-0008 §Q5a, flat per §Q6a; range from the
    # data-dictionary `type` (booleans → xsd:boolean, `signedOn` date string →
    # xsd:date). `response` (no data-dictionary type) is a confirmation
    # response → xsd:boolean by structure. (Valuation pricing leaves — soldDate
    # / listedDate / yield / pricingMethodology / credibilitySources — live in
    # opda-descriptive.ttl on opda:Valuation, where that Kind is declared.)
    _walk_e_txn: list[tuple[URIRef, URIRef, str, str, str, tuple[str, ...]]] = [
        (
            OPDA.leaveKeys, XSD.boolean, "leave keys",
            "Completion undertaking: will the seller leave the keys? "
            "xsd:boolean. Flat per §Q6a. A sale-Transaction completion "
            "attribute (ODR-0007).",
            "Records a seller's undertaking to leave keys for all door and "
            "window locks, with any alarm codes, for the buyer on the day of "
            "completion.",
            ("propertyPack.completionAndMoving.sellerWillEnsure.leaveKeys",),
        ),
        (
            OPDA.removeRubbish, XSD.boolean, "remove rubbish",
            "Completion undertaking: will the seller remove rubbish? "
            "xsd:boolean. Flat per §Q6a.",
            "Records a seller's undertaking to remove all rubbish and items "
            "not included in the sale and to leave the property in a clean "
            "and tidy condition on completion.",
            ("propertyPack.completionAndMoving.sellerWillEnsure.removeRubbish",),
        ),
        (
            OPDA.replaceLightFittings, XSD.boolean, "replace light fittings",
            "Completion undertaking: will the seller replace removed light "
            "fittings? xsd:boolean. Flat per §Q6a.",
            "Records a seller's undertaking to replace any removed light "
            "fittings with a ceiling rose, flex, bulb holder and bulb on "
            "completion.",
            (
                "propertyPack.completionAndMoving.sellerWillEnsure."
                "replaceLightFittings",
            ),
        ),
        (
            OPDA.takeReasonableCare, XSD.boolean, "take reasonable care",
            "Completion undertaking: will the seller take reasonable care of "
            "the Property until completion? xsd:boolean. Flat per §Q6a.",
            "Records a seller's undertaking to take reasonable care when "
            "removing fittings or contents from the property before "
            "completion.",
            (
                "propertyPack.completionAndMoving.sellerWillEnsure."
                "takeReasonableCare",
            ),
        ),
        (
            OPDA.authorisationToShare, XSD.boolean, "authorisation to share",
            "Sale-ready declaration: authorisation to share the property "
            "pack. xsd:boolean. Flat per §Q6a.",
            "Records a seller's consent to share the information in the "
            "sale-ready pack with their legal representative and with the "
            "buyer and the buyer's legal representatives.",
            ("propertyPack.saleReadyDeclarations.authorisationToShare",),
        ),
        (
            OPDA.authorisedToActOnBehalfOfAllSellers, XSD.boolean,
            "authorised to act on behalf of all sellers",
            "Sale-ready declaration: is the declarant authorised to act on "
            "behalf of all sellers? xsd:boolean. Flat per §Q6a.",
            "Records a declarant's confirmation of authority to supply data "
            "and documents relating to the property on behalf of all of its "
            "owners.",
            (
                "propertyPack.saleReadyDeclarations."
                "authorisedToActOnBehalfOfAllSellers",
            ),
        ),
        (
            OPDA.confirmInformationIsAccurate, XSD.boolean,
            "confirm information is accurate",
            "Declaration confirming the supplied information is accurate "
            "(owners' confirmation-of-accuracy + fixtures confirmation). "
            "xsd:boolean. ONE shared property; flat per §Q6a.",
            "Records a declarant's confirmation that the supplied information "
            "is accurate to the best of their knowledge, with an undertaking "
            "to notify any change before exchange of contracts.",
            (
                "propertyPack.confirmationOfAccuracyByOwners."
                "confirmInformationIsAccurate",
                "propertyPack.fixturesAndFittings.confirmationOfAccuracy."
                "confirmInformationIsAccurate",
            ),
        ),
        (
            OPDA.confirmWillProvideAdditionalDocumentation, XSD.boolean,
            "confirm will provide additional documentation",
            "Declaration confirming the owner will provide additional "
            "documentation. xsd:boolean. Flat per §Q6a.",
            "Records a declarant's undertaking to provide their property "
            "lawyer with additional documentation in support of the "
            "information supplied.",
            (
                "propertyPack.confirmationOfAccuracyByOwners."
                "confirmWillProvideAdditionalDocumentation",
            ),
        ),
        (
            OPDA.confirmation, XSD.boolean, "confirmation",
            "Confirmation flag on a leasehold / managed-freehold "
            "confirmation-of-accuracy declaration. xsd:boolean. Flat per "
            "§Q6a.",
            "Records a declarant's confirmation on a leasehold or "
            "managed-freehold/commonhold confirmation-of-accuracy "
            "declaration.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.confirmationOfAccuracy.confirmation",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.confirmation",
            ),
        ),
        (
            OPDA.response, XSD.boolean, "response",
            "Response flag on a managed-freehold / commonhold confirmation. "
            "xsd:boolean (a confirmation response; the data dictionary leaves "
            "the type unset — it is a yes/no confirmation by structure). Flat "
            "per §Q6a.",
            "Records a declarant's affirmation, on a managed-freehold or "
            "commonhold confirmation, of authority to provide the information "
            "on behalf of the selected parties and that a buyer may rely on "
            "it.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.confirmation.response",
            ),
        ),
        (
            OPDA.consumerProtectionRegulationsResponse, XSD.boolean,
            "consumer protection regulations response",
            "Declaration response to the Consumer Protection Regulations "
            "question. xsd:boolean. Flat per §Q6a.",
            "Records a seller's affirmation, under the Consumer Protection "
            "Regulations, that the disclosure answers are truthful and "
            "accurate to the best of their knowledge.",
            (
                "propertyPack.consumerProtectionRegulationsDeclaration."
                "consumerProtectionRegulationsResponse",
            ),
        ),
        (
            OPDA.signedOn, XSD.date, "signed on",
            "Date a contract / sale-ready declaration was signed. xsd:date. "
            "ONE shared property reused across contract and seller "
            "signatures; flat per §Q6a.",
            "Records the date on which a contract or sale-ready declaration "
            "was signed.",
            (
                "contracts[].signatures[].signedOn",
                "propertyPack.saleReadyDeclarations.sellerSignatures[].signedOn",
            ),
        ),
        (
            OPDA.sellingAgent, XSD.string, "selling agent",
            "Name of the selling agent on an onward-purchase link in the "
            "transaction chain. Plain string datatype per ODR-0008 §Q5a; flat "
            "per §Q6a.",
            "Names the estate agent selling the property on an "
            "onward-purchase link of a transaction chain.",
            ("chain.onwardPurchase[].sellingAgent",),
        ),
        (
            OPDA.transactionId, XSD.string, "transaction ID",
            "External transaction identifier (the PDTF transaction id; also "
            "carried on onward-purchase chain links). Plain string datatype "
            "per ODR-0008 §Q5a; flat per §Q6a. Complements the opda:Transaction "
            "IC's transaction-id-lineage (ODR-0007 §Q1) — the notation surface "
            "for the identifier.",
            "Identifies a property transaction by its externally assigned "
            "PDTF identifier, a UUID also carried on onward-purchase chain "
            "links.",
            (
                "chain.onwardPurchase[].transactionId",
                "transactionId",
            ),
        ),
    ]
    for prop, rng, label, comment, definition, paths in _walk_e_txn:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        g.add((prop, RDFS.domain, OPDA.Transaction))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(definition, lang="en")))
        g.add((prop, RDFS.isDefinedBy, module_iri))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    return g
