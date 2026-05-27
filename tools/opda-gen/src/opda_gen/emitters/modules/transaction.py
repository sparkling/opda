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


OPDA = Namespace("https://w3id.org/opda/#")
PROV = Namespace("http://www.w3.org/ns/prov#")
TIME = Namespace("http://www.w3.org/2006/time#")


_ODR_0007_Q1 = URIRef("https://w3id.org/opda/odr/ODR-0007#section-Q1")
_ODR_0007_Q2 = URIRef("https://w3id.org/opda/odr/ODR-0007#section-Q2")
_ODR_0007_Q4 = URIRef("https://w3id.org/opda/odr/ODR-0007#section-Q4")
_ODR_0007_Q6 = URIRef("https://w3id.org/opda/odr/ODR-0007#section-Q6")


CLASSES = (
    OPDA.Milestone,
    OPDA.Transaction,
    OPDA.TransactionChain,
)

OBJECT_PROPERTIES = (
    OPDA.hasChainPosition,
)

DATATYPE_PROPERTIES = (
    OPDA.occurredAtTime,
    OPDA.plannedAtTime,
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
    module_iri = URIRef("https://w3id.org/opda/transaction/")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title,
           Literal("OPDA Transaction Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/1.0.0/")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/transaction/1.0.0/")))

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

    return g
