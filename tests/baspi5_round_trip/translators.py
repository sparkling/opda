"""
Module translators.

Realises:
- ADR-0014 §"Round-trip layer" lines 71-97 — JSON ↔ RDF translation
  for a focused BASPI5 submission subset (Property + Address +
  LegalEstate + Seller + EPCCertificate; the core load-bearing
  fields per the worker brief).
- ODR-0010 §Q7 — round-trip closure is the MVP gate.

Scope:
- JSON → RDF: walks a BASPI5 sample JSON document and emits OPDA
  TBox-typed individuals at canonical URIs under
  https://opda.org.uk/pdtf/harness/data/baspi5/<txid>/.
- RDF → JSON: reverses the walk by reading the BASPI5 profile
  `sh:property` blocks and reconstructing the JSON shape.

Out of scope (deferred — Phase-7 overlay-incremental ADRs):
- Full BASPI5 schema coverage (only the load-bearing fields).
- TA6 / NTS / LPE1 / CON29R overlays.
- VC / DID wallet binding (ODR-0016 deferred-until-trigger).
"""

from __future__ import annotations

from typing import Any

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import RDF, XSD


# --- Namespaces -----------------------------------------------------------
OPDA = Namespace("https://opda.org.uk/pdtf/")
VCARD = Namespace("http://www.w3.org/2006/vcard/ns#")
OPDA_SCHEME = Namespace("https://opda.org.uk/pdtf/scheme/")


# --- Concept IRI helpers (Council-046 Q3b) --------------------------------
def _concept_iri(slug_base: str, notation: str) -> URIRef:
    """Return the concept IRI for a scheme member by slug_base and notation.

    Uses the same slugify logic as vocabularies.Member.uri_slug() so the
    translated IRI matches the emitted SKOS concept exactly.
    """
    from opda_gen.emitters.vocabularies import _slugify_for_uri
    return URIRef(f"https://opda.org.uk/pdtf/scheme/{slug_base}/{_slugify_for_uri(notation)}")


def _notation_from_concept_iri(slug_base: str, concept_iri: URIRef) -> str:
    """Recover the skos:notation string for a concept IRI.

    Looks up the IRI in the scheme registry so the exact notation (which
    may differ from the slug — e.g. "Seller's Conveyancer" vs
    "Seller-s-Conveyancer") is returned.
    """
    from opda_gen.emitters.vocabularies import _all_schemes
    target = str(concept_iri)
    for scheme in _all_schemes():
        if scheme.slug_base == slug_base:
            for member in scheme.members:
                if str(scheme.member_uri(member)) == target:
                    return member.notation
    # Fallback: extract slug from URI path (good enough for simple notations)
    return target.rsplit("/", 1)[-1]


def _data_ns(tx_id: str) -> Namespace:
    """Return the per-transaction data namespace."""
    return Namespace(f"https://opda.org.uk/pdtf/harness/data/baspi5/{tx_id}/")


# ---------------------------------------------------------------------------
# JSON → RDF
# ---------------------------------------------------------------------------
def json_to_rdf(
    json_doc: dict[str, Any],
    _ontology_graph: Graph | None = None,
) -> Graph:
    """Translate a BASPI5 JSON document into an OPDA RDF graph.

    `_ontology_graph` is currently unused but kept in the signature
    per the ADR-0014 template — future overlays may use it for
    sh:path lookup; this MVP impl uses fixed canonical predicates.

    Walks the load-bearing fields:
    - participants[] (Seller / Buyer roles)
    - propertyPack.address
    - propertyPack.uprn
    - propertyPack.buildInformation.building.{propertyType, builtForm}
    - propertyPack.ownership.ownershipsToBeTransferred[]
    - propertyPack.energyEfficiency.currentEnergyRating
    """
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("vcard", VCARD)

    tx_id = json_doc.get("transactionId", "tx-unknown")
    ns = _data_ns(tx_id)
    g.bind("data", ns)

    # --- Property ----------------------------------------------------------
    property_pack = json_doc.get("propertyPack", {})
    prop_uri = URIRef(ns["property"])
    g.add((prop_uri, RDF.type, OPDA.Property))

    if "uprn" in property_pack:
        # Preserve the JSON number's lexical representation per BASPI5.
        g.add((prop_uri, OPDA.hasUPRN, Literal(str(property_pack["uprn"]))))

    # --- Address (per propertyPack.address) -------------------------------
    addr = property_pack.get("address", {})
    if addr:
        addr_uri = URIRef(ns["address"])
        g.add((addr_uri, RDF.type, OPDA.Address))
        g.add((prop_uri, OPDA.hasAddress, addr_uri))
        if "line1" in addr:
            g.add((addr_uri, VCARD["street-address"],
                   Literal(addr["line1"])))
        if "postcode" in addr:
            g.add((addr_uri, VCARD["postal-code"], Literal(addr["postcode"])))

    # --- buildInformation.building.{propertyType, builtForm} --------------
    build = property_pack.get("buildInformation", {}).get("building", {})
    if "propertyType" in build:
        g.add((prop_uri, OPDA.propertyType,
               _concept_iri("propertyType", build["propertyType"])))
    if "builtForm" in build:
        g.add((prop_uri, OPDA.builtForm,
               _concept_iri("builtForm", build["builtForm"])))

    # --- energyEfficiency.currentEnergyRating + EPCCertificate ------------
    # opda:currentEnergyRating has rdfs:domain opda:Property, so it is asserted
    # on the Property, never on the opda:EPCCertificate node — under rdfs domain
    # entailment the latter would mis-type the certificate as a Property
    # (handover 2026-06-01 §8 / ODR-0025 §R7 / ADR-0035 §"EPCCertificate emitter
    # fix"). The EPCCertificate node stays a typed, linked artefact carrying no
    # Property-domain predicate.
    energy = property_pack.get("energyEfficiency", {})
    if "currentEnergyRating" in energy:
        epc_uri = URIRef(ns["epc"])
        g.add((epc_uri, RDF.type, OPDA.EPCCertificate))
        g.add((prop_uri, OPDA.hasEPCCertificate, epc_uri))
        g.add((prop_uri, OPDA.currentEnergyRating,
               _concept_iri("currentEnergyRating", energy["currentEnergyRating"])))

    # --- LegalEstate (ownershipsToBeTransferred[]) ------------------------
    ownerships = property_pack.get("ownership", {}).get(
        "ownershipsToBeTransferred", []
    )
    for idx, ownership in enumerate(ownerships):
        estate_uri = URIRef(ns[f"estate-{idx}"])
        g.add((estate_uri, RDF.type, OPDA.LegalEstate))
        if "ownershipType" in ownership:
            g.add((estate_uri, OPDA.ownershipType,
                   _concept_iri("ownershipType", ownership["ownershipType"])))
        if "titleNumber" in ownership:
            title_uri = URIRef(ns[f"title-{idx}"])
            g.add((title_uri, RDF.type, OPDA.RegisteredTitle))
            g.add((title_uri, OPDA.titleNumber,
                   Literal(ownership["titleNumber"])))
            g.add((title_uri, OPDA.recordsEstate, estate_uri))
        # Identity link (per ODR-0005 Rule 5: identifiesSameProperty).
        g.add((estate_uri, OPDA.identifiesSameProperty, prop_uri))

    # --- participants[] (Seller / Buyer roles) ----------------------------
    for idx, p in enumerate(json_doc.get("participants", [])):
        role = p.get("role")
        if role == "Seller":
            seller_uri = URIRef(ns[f"seller-{idx}"])
            g.add((seller_uri, RDF.type, OPDA.Seller))
            g.add((seller_uri, OPDA.role, Literal("Seller")))
            name = p.get("name", {})
            fullname = " ".join(
                v for v in (name.get("firstName"), name.get("lastName"))
                if v
            )
            if fullname:
                g.add((seller_uri, VCARD.fn, Literal(fullname)))
            if "email" in p:
                g.add((seller_uri, VCARD.email, Literal(p["email"])))
            capacity = p.get("sellersCapacity", {}).get("capacity")
            if capacity:
                g.add((seller_uri, OPDA.hasAssertedCapacity,
                       _concept_iri("sellersCapacity", capacity)))
        elif role == "Buyer":
            buyer_uri = URIRef(ns[f"buyer-{idx}"])
            g.add((buyer_uri, RDF.type, OPDA.Buyer))
            g.add((buyer_uri, OPDA.role, Literal("Buyer")))
            name = p.get("name", {})
            fullname = " ".join(
                v for v in (name.get("firstName"), name.get("lastName"))
                if v
            )
            if fullname:
                g.add((buyer_uri, VCARD.fn, Literal(fullname)))

    return g


# ---------------------------------------------------------------------------
# RDF → JSON
# ---------------------------------------------------------------------------
def rdf_to_baspi5_json(
    rdf_graph: Graph,
    _ontology_graph: Graph | None = None,
) -> dict[str, Any]:
    """Reverse the JSON → RDF walk to reconstruct a BASPI5 submission.

    Walks the canonical predicates emitted by `json_to_rdf` and
    rebuilds the load-bearing field subset. The output is not
    expected to byte-match the input JSON (default keys may shuffle),
    but normalised it is equivalent to the input subset.
    """
    out: dict[str, Any] = {}

    # Recover the transaction-id by inspecting any data-namespace URI.
    tx_id = "tx-unknown"
    for s in rdf_graph.subjects():
        s_str = str(s)
        if s_str.startswith("https://opda.org.uk/pdtf/harness/data/baspi5/"):
            tx_id = s_str.split(
                "https://opda.org.uk/pdtf/harness/data/baspi5/", 1
            )[1].split("/", 1)[0]
            break
    out["transactionId"] = tx_id

    ns = _data_ns(tx_id)
    prop_uri = URIRef(ns["property"])
    property_pack: dict[str, Any] = {}

    # UPRN.
    for uprn in rdf_graph.objects(prop_uri, OPDA.hasUPRN):
        try:
            property_pack["uprn"] = int(str(uprn))
        except ValueError:
            property_pack["uprn"] = str(uprn)
        break

    # Address.
    addr_uri = URIRef(ns["address"])
    if (addr_uri, RDF.type, OPDA.Address) in rdf_graph:
        address: dict[str, Any] = {}
        for s in rdf_graph.objects(addr_uri, VCARD["street-address"]):
            address["line1"] = str(s)
        for s in rdf_graph.objects(addr_uri, VCARD["postal-code"]):
            address["postcode"] = str(s)
        if address:
            property_pack["address"] = address

    # buildInformation.building.
    build: dict[str, Any] = {}
    for v in rdf_graph.objects(prop_uri, OPDA.propertyType):
        build["propertyType"] = _notation_from_concept_iri("propertyType", URIRef(str(v)))
    for v in rdf_graph.objects(prop_uri, OPDA.builtForm):
        build["builtForm"] = _notation_from_concept_iri("builtForm", URIRef(str(v)))
    if build:
        property_pack["buildInformation"] = {"building": build}

    # energyEfficiency.currentEnergyRating.
    for v in rdf_graph.objects(prop_uri, OPDA.currentEnergyRating):
        property_pack["energyEfficiency"] = {
            "currentEnergyRating": _notation_from_concept_iri(
                "currentEnergyRating", URIRef(str(v))
            )
        }
        break

    # ownership.ownershipsToBeTransferred[].
    estates: list[dict[str, Any]] = []
    idx = 0
    while True:
        estate_uri = URIRef(ns[f"estate-{idx}"])
        if (estate_uri, RDF.type, OPDA.LegalEstate) not in rdf_graph:
            break
        e: dict[str, Any] = {}
        for v in rdf_graph.objects(estate_uri, OPDA.ownershipType):
            e["ownershipType"] = _notation_from_concept_iri(
                "ownershipType", URIRef(str(v))
            )
        title_uri = URIRef(ns[f"title-{idx}"])
        for v in rdf_graph.objects(title_uri, OPDA.titleNumber):
            e["titleNumber"] = str(v)
        estates.append(e)
        idx += 1
    if estates:
        property_pack["ownership"] = {
            "ownershipsToBeTransferred": estates,
        }

    if property_pack:
        out["propertyPack"] = property_pack

    # participants[] — walk Seller-typed and Buyer-typed individuals.
    participants: list[dict[str, Any]] = []
    for seller_uri in sorted(rdf_graph.subjects(RDF.type, OPDA.Seller),
                             key=str):
        p: dict[str, Any] = {"role": "Seller"}
        for v in rdf_graph.objects(seller_uri, VCARD.fn):
            parts = str(v).split(" ", 1)
            p["name"] = (
                {"firstName": parts[0], "lastName": parts[1]}
                if len(parts) == 2
                else {"firstName": parts[0]}
            )
        for v in rdf_graph.objects(seller_uri, VCARD.email):
            p["email"] = str(v)
        for v in rdf_graph.objects(seller_uri, OPDA.hasAssertedCapacity):
            p["sellersCapacity"] = {
                "capacity": _notation_from_concept_iri("sellersCapacity", URIRef(str(v)))
            }
        participants.append(p)
    for buyer_uri in sorted(rdf_graph.subjects(RDF.type, OPDA.Buyer),
                            key=str):
        p = {"role": "Buyer"}
        for v in rdf_graph.objects(buyer_uri, VCARD.fn):
            parts = str(v).split(" ", 1)
            p["name"] = (
                {"firstName": parts[0], "lastName": parts[1]}
                if len(parts) == 2
                else {"firstName": parts[0]}
            )
        participants.append(p)
    if participants:
        out["participants"] = participants

    return out


# ---------------------------------------------------------------------------
# Normalisation helper (sort lists; lower keys; consistent types).
# ---------------------------------------------------------------------------
def normalise(doc: dict[str, Any]) -> Any:
    """Recursively normalise a BASPI5 JSON document for equivalence
    comparison. Lists of dicts are sorted by their tuple of keys for
    stability; primitive lists are sorted lexicographically.
    """
    if isinstance(doc, dict):
        return {k: normalise(v) for k, v in sorted(doc.items())}
    if isinstance(doc, list):
        items = [normalise(v) for v in doc]
        try:
            return sorted(
                items,
                key=lambda x: (
                    str(type(x).__name__),
                    str(sorted(x.items()) if isinstance(x, dict) else x),
                ),
            )
        except TypeError:
            return items
    return doc
