"""
Module agent.

Realises:
- ADR-0011 §"Per-module detail — opda-agent.ttl" — Person + Organisation
  + Seller/Buyer (RoleMixin) + Proprietor (Role) + Proprietorship
  (Relator) + NameChangeEvent (Person name-change provenance).
- ADR-0007 §"A9 per-kind discipline output" — every class carries
  rdfs:label + rdfs:comment + skos:scopeNote + dct:source.
- ODR-0006 §Rules (Kind layer + Role layer + Capacity split) — Person /
  Organisation Kinds; Seller / Buyer RoleMixins; Proprietor Role;
  Proprietorship Relator; assertedCapacity / evidencedAuthority seam.
- ODR-0006 §Operational specifications + S006 Q6 9-1 verdict —
  Organisation subClassOf org:Organization (Allemang held-as-live).
- ADR-0013 G11 closure — additional Agent-domain DatatypeProperties
  required by the BASPI5 overlay: ownerType (Seller / legal owner
  discriminator), hasOthersAged17OrOver (occupier discriminator on
  Seller).
- ADR-0014 G18 closure — `opda:role` declared as `owl:DatatypeProperty`
  with domain `opda:RoleMixin` and range `xsd:string`. Constrained by
  per-overlay profile shapes via `sh:in` over the SKOS `RoleScheme`
  members. The role-bearing PATTERN remains encoded by
  `opda:Seller`/`opda:Buyer`/`opda:Proprietor` typing per ODR-0006 §Q2;
  this predicate exposes the notation for DASH editor ergonomics and
  SPARQL convenience without overriding the typed encoding.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD


OPDA = Namespace("https://w3id.org/opda/#")
ORG = Namespace("http://www.w3.org/ns/org#")
PROV = Namespace("http://www.w3.org/ns/prov#")


_ODR_0006_Q1 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q1")
_ODR_0006_Q2 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q2")
_ODR_0006_Q3 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q3")
_ODR_0006_Q4 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q4")
_ODR_0006_Q6 = URIRef("https://w3id.org/opda/odr/ODR-0006#section-Q6")


CLASSES = (
    OPDA.Buyer,
    OPDA.NameChangeEvent,
    OPDA.Organisation,
    OPDA.Person,
    OPDA.Proprietor,
    OPDA.Proprietorship,
    OPDA.Seller,
)

OBJECT_PROPERTIES = (
    OPDA.hasEvidencedAuthority,
)

DATATYPE_PROPERTIES = (
    OPDA.hasAssertedCapacity,
    OPDA.hasOthersAged17OrOver,
    OPDA.ownerType,
    OPDA.role,
)


def build_graph() -> Graph:
    """Build the Agent module class + property graph."""
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("owl", OWL)
    g.bind("rdfs", RDFS)
    g.bind("skos", SKOS)
    g.bind("dct", DCTERMS)
    g.bind("xsd", XSD)
    g.bind("org", ORG)
    g.bind("prov", PROV)

    # --- Module ontology header --------------------------------------------
    module_iri = URIRef("https://w3id.org/opda/agent/")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title, Literal("OPDA Agent Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/1.0.0/")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/agent/1.0.0/")))

    # --- opda:Person — UFO Substance Kind (ODR-0006 §Q1) -----------------
    g.add((OPDA.Person, RDF.type, OWL.Class))
    g.add((OPDA.Person, RDFS.label, Literal("Person", lang="en")))
    g.add((OPDA.Person, RDFS.comment, Literal(
        "Natural person. UFO Substance Kind; DOLCE Endurant. IC: "
        "FIBO-style multi-identifier persistence (date-of-birth + "
        "state-issued ID + name) over name-change, gender-recognition, "
        "and death hard cases. Anchors PII regimes (DPV co-annotation "
        "lands per ODR-0018 in opda-annotations.ttl; ADR-0012 emits).",
        lang="en",
    )))
    g.add((OPDA.Person, SKOS.scopeNote, Literal(
        "DOLCE: Endurant / Agent (Masolo et al. 2003 D18 §4.1). UFO: "
        "Substance Kind (Guizzardi 2005 Ch. 4 §4.2 — Sortal, Rigid).",
        lang="en",
    )))
    g.add((OPDA.Person, DCTERMS.source, _ODR_0006_Q1))

    # --- opda:Organisation — UFO Substance Kind (ODR-0006 §Q1 + S006 Q6) -
    # rdfs:subClassOf org:Organization per S006 Q6 9-1 verdict (Allemang
    # held-as-live; interop with W3C Org Ontology).
    g.add((OPDA.Organisation, RDF.type, OWL.Class))
    g.add((OPDA.Organisation, RDFS.subClassOf, ORG.Organization))
    g.add((OPDA.Organisation, RDFS.label, Literal("Organisation", lang="en")))
    g.add((OPDA.Organisation, RDFS.comment, Literal(
        "Corporate or unincorporated organisation. UFO Substance Kind; "
        "DOLCE NonPhysicalEndurant (Searle 1995 legal-institutional "
        "object). IC over merger / demerger / dissolution hard cases: "
        "FIBO LegalEntity pattern — multiple jurisdiction-issued "
        "identifiers (CRN, LEI) for one Kind; entity-merger produces a "
        "new individual via prov:wasDerivedFrom (S006 Q1 + Kendall S005 "
        "Q4 framing). Subclass of org:Organization per S006 Q6 9-1 verdict.",
        lang="en",
    )))
    g.add((OPDA.Organisation, SKOS.scopeNote, Literal(
        "DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2). UFO: "
        "Substance Kind (Guizzardi 2005 Ch. 4 §4.2). W3C Org Ontology "
        "alignment per S006 Q6 9-1 verdict (Allemang held-as-live).",
        lang="en",
    )))
    g.add((OPDA.Organisation, DCTERMS.source, _ODR_0006_Q6))

    # --- opda:Seller — UFO RoleMixin (ODR-0006 §Q2 Role layer) ----------
    # 'a opda:RoleMixin' uses the foundation RoleMixin meta-class — the
    # exemplars use 'a opda:Seller' (instance-of-class), so we also
    # declare Seller itself as an owl:Class for instance-level OWL
    # consistency. Its UFO RoleMixin status is expressed via
    # rdfs:subClassOf opda:RoleMixin.
    g.add((OPDA.Seller, RDF.type, OWL.Class))
    g.add((OPDA.Seller, RDFS.subClassOf, OPDA.RoleMixin))
    g.add((OPDA.Seller, RDFS.label, Literal("Seller", lang="en")))
    g.add((OPDA.Seller, RDFS.comment, Literal(
        "UFO RoleMixin (anti-rigid; cross-sortal — borne by Person OR "
        "Organisation). Founded by an opda:Transaction Relator "
        "(ODR-0006 §Q2 + ODR-0007 §Q1). An instance of opda:Seller is "
        "borne by a specific Person or Organisation in the context of a "
        "specific Transaction; the role identity is parasitic on the "
        "(Transaction, bearer) tuple.",
        lang="en",
    )))
    g.add((OPDA.Seller, SKOS.scopeNote, Literal(
        "UFO: RoleMixin (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, "
        "externally founded, cross-sortal). Sub-Roles PersonSeller / "
        "OrganisationSeller may sortalise the RoleMixin where downstream "
        "use requires (per ODR-0006 §Role layer).",
        lang="en",
    )))
    g.add((OPDA.Seller, DCTERMS.source, _ODR_0006_Q2))

    # --- opda:Buyer — UFO RoleMixin -------------------------------------
    g.add((OPDA.Buyer, RDF.type, OWL.Class))
    g.add((OPDA.Buyer, RDFS.subClassOf, OPDA.RoleMixin))
    g.add((OPDA.Buyer, RDFS.label, Literal("Buyer", lang="en")))
    g.add((OPDA.Buyer, RDFS.comment, Literal(
        "UFO RoleMixin (anti-rigid; cross-sortal — borne by Person OR "
        "Organisation). Founded by an opda:Transaction Relator. The "
        "Buyer role of one transaction may correspond to the Seller role "
        "of the next in a TransactionChain (cf. exemplar "
        "chain-of-transactions.ttl).",
        lang="en",
    )))
    g.add((OPDA.Buyer, SKOS.scopeNote, Literal(
        "UFO: RoleMixin (Guizzardi 2005 Ch. 4 §4.4). Mirror of opda:Seller "
        "founded by the same Transaction.",
        lang="en",
    )))
    g.add((OPDA.Buyer, DCTERMS.source, _ODR_0006_Q2))

    # --- opda:Proprietor — UFO Role (ODR-0006 §Q2) ----------------------
    g.add((OPDA.Proprietor, RDF.type, OWL.Class))
    g.add((OPDA.Proprietor, RDFS.subClassOf, OPDA.Role))
    g.add((OPDA.Proprietor, RDFS.label, Literal("Proprietor", lang="en")))
    g.add((OPDA.Proprietor, RDFS.comment, Literal(
        "UFO Role (anti-rigid; sortal — borne by Person; sub-Role for "
        "Organisation-proprietorship under a named specialisation). "
        "Founded by an opda:Proprietorship Relator (ODR-0006 §Q3 Role "
        "layer). NEVER keyed (per ODR-0005 Anti-pattern §3 — a Proprietor "
        "has no identity qua Proprietor; identity borrows from bearer).",
        lang="en",
    )))
    g.add((OPDA.Proprietor, SKOS.scopeNote, Literal(
        "UFO: Role (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, externally "
        "founded, sortal). Distinguished from RoleMixin by sortal "
        "commitment to a single bearer Kind.",
        lang="en",
    )))
    g.add((OPDA.Proprietor, DCTERMS.source, _ODR_0006_Q2))

    # --- opda:Proprietorship — UFO Relator (ODR-0006 §Q3) ---------------
    g.add((OPDA.Proprietorship, RDF.type, OWL.Class))
    g.add((OPDA.Proprietorship, RDFS.subClassOf, OPDA.Relator))
    g.add((OPDA.Proprietorship, RDFS.label,
           Literal("Proprietorship", lang="en")))
    g.add((OPDA.Proprietorship, RDFS.comment, Literal(
        "UFO Relator (relational endurant) mediating Property + "
        "Proprietor instances against a RegisteredTitle. IC: the "
        "(Title, Persons-set) tuple per S006 Q3. Joint-tenancy vs "
        "tenants-in-common is a property of the Relator, NOT of the "
        "Roles. Founding event recorded via prov:wasGeneratedBy on the "
        "registration activity.",
        lang="en",
    )))
    g.add((OPDA.Proprietorship, SKOS.scopeNote, Literal(
        "UFO: Relator (Guizzardi 2005 Ch. 4 §4.4 — relational endurant; "
        "founded by an event; mediates two or more bearers). HMLR "
        "Practice Guide 24 (joint tenancy / tenants in common).",
        lang="en",
    )))
    g.add((OPDA.Proprietorship, DCTERMS.source, _ODR_0006_Q3))

    # --- opda:NameChangeEvent — provenance event -------------------------
    # Required for person-with-name-change.ttl exemplar; supports Person
    # IC over name-change hard case (S006 Q1).
    g.add((OPDA.NameChangeEvent, RDF.type, OWL.Class))
    g.add((OPDA.NameChangeEvent, RDFS.subClassOf, PROV.Activity))
    g.add((OPDA.NameChangeEvent, RDFS.label,
           Literal("Name Change Event", lang="en")))
    g.add((OPDA.NameChangeEvent, RDFS.comment, Literal(
        "Reified PROV-O activity recording a Person's name change "
        "(deed-poll, marriage, gender recognition, etc.). The Person's "
        "identity PERSISTS through the name change per S006 Q1 — one "
        "Person individual with a name-attribute provenance chain via "
        "prov:wasRevisionOf, NOT two distinct Persons. Anti-pattern: "
        "owl:sameAs across the former/current names (cross-context "
        "inference propagation).",
        lang="en",
    )))
    g.add((OPDA.NameChangeEvent, SKOS.scopeNote, Literal(
        "UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7). DOLCE: "
        "Achievement (Masolo et al. 2003 D18 §4.4 — instantaneous "
        "administrative event).",
        lang="en",
    )))
    g.add((OPDA.NameChangeEvent, DCTERMS.source, _ODR_0006_Q1))

    # --- DatatypeProperty: opda:hasAssertedCapacity (ODR-0006 §Q4) ------
    g.add((OPDA.hasAssertedCapacity, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.hasAssertedCapacity, RDFS.domain, OPDA.Seller))
    g.add((OPDA.hasAssertedCapacity, RDFS.range, XSD.string))
    g.add((OPDA.hasAssertedCapacity, RDFS.label,
           Literal("has asserted capacity", lang="en")))
    g.add((OPDA.hasAssertedCapacity, RDFS.comment, Literal(
        "Seller-side asserted capacity per opda:SellersCapacityScheme "
        "(SKOS in opda-vocabularies.ttl). Sales-context seam in the "
        "two-predicate Capacity/Authority split per S006 Q4 (Evans + "
        "Vernon load-bearing). The assertion lives on the Sales side; "
        "the evidence link lives on the Conveyancing side via "
        "opda:hasEvidencedAuthority.",
        lang="en",
    )))
    g.add((OPDA.hasAssertedCapacity, DCTERMS.source, _ODR_0006_Q4))

    # --- ObjectProperty: opda:hasEvidencedAuthority (ODR-0006 §Q4) ------
    g.add((OPDA.hasEvidencedAuthority, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasEvidencedAuthority, RDFS.domain, OPDA.Seller))
    g.add((OPDA.hasEvidencedAuthority, RDFS.range, OPDA.Claim))
    g.add((OPDA.hasEvidencedAuthority, RDFS.label,
           Literal("has evidenced authority", lang="en")))
    g.add((OPDA.hasEvidencedAuthority, RDFS.comment, Literal(
        "Conveyancing-side seam linking a Seller's asserted capacity to "
        "an opda:Claim of authority (e.g. probate, power of attorney). "
        "The founding grant is modelled as the missing Relator per "
        "ODR-0006 §Capacity split + ODR-0009 §Claim. Co-annotation with "
        "DPV lawful-basis lands per ODR-0018 in opda-annotations.ttl.",
        lang="en",
    )))
    g.add((OPDA.hasEvidencedAuthority, DCTERMS.source, _ODR_0006_Q4))

    # ==== G11 expansion (ADR-0013) ======================================
    # --- DatatypeProperty: opda:ownerType (BASPI5 legalOwners[].ownerType) -
    g.add((OPDA.ownerType, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.ownerType, RDFS.domain, OPDA.Proprietor))
    g.add((OPDA.ownerType, RDFS.range, XSD.string))
    g.add((OPDA.ownerType, RDFS.label, Literal("owner type", lang="en")))
    g.add((OPDA.ownerType, RDFS.comment, Literal(
        "Substance Kind label discriminating Private individual "
        "(opda:Person) from Organisation (opda:Organisation) for a "
        "Proprietor (legal owner). Bound to opda:OwnerTypeScheme via "
        "SHACL sh:in in the BASPI5 profile. Distinct from opda:role "
        "(transactional role) and opda:tenureKind (sub-Kind of "
        "LegalEstate).",
        lang="en",
    )))
    g.add((OPDA.ownerType, DCTERMS.source,
           URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q5a")))

    # --- DatatypeProperty: opda:hasOthersAged17OrOver (occupier) ---------
    g.add((OPDA.hasOthersAged17OrOver, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.hasOthersAged17OrOver, RDFS.domain, OPDA.Seller))
    g.add((OPDA.hasOthersAged17OrOver, RDFS.range, XSD.string))
    g.add((OPDA.hasOthersAged17OrOver, RDFS.label,
           Literal("has others aged 17 or over", lang="en")))
    g.add((OPDA.hasOthersAged17OrOver, RDFS.comment, Literal(
        "Yes/No discriminator: does the Seller's household include "
        "occupiers aged 17 or over (other than the Seller)? BASPI5 "
        "occupiers question. Bound to opda:YesNoScheme.",
        lang="en",
    )))
    g.add((OPDA.hasOthersAged17OrOver, DCTERMS.source,
           URIRef("https://w3id.org/opda/odr/ODR-0008#section-Q5a")))

    # --- ADR-0014 G18 — opda:role DatatypeProperty (DASH ergonomics) -----
    # Domain: foundation opda:RoleMixin (cross-sortal role pattern).
    # Range: xsd:string (notation value; per-overlay shapes constrain
    # via sh:in over opda:RoleScheme members). The role-bearing PATTERN
    # remains encoded by opda:Seller/opda:Buyer/opda:Proprietor sub-typing
    # of opda:RoleMixin/opda:Role per ODR-0006 §Q2; this predicate
    # exposes the notation so DASH editors render the role enum and
    # SPARQL queries can filter on `?seller opda:role "Seller"` without
    # forcing a class-membership query. The TBox carries no
    # `rdfs:domain` other than opda:RoleMixin so the predicate may
    # also be borne by Buyer / Proprietor / Conveyancer / etc. without
    # additional axioms.
    g.add((OPDA.role, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.role, RDFS.domain, OPDA.RoleMixin))
    g.add((OPDA.role, RDFS.range, XSD.string))
    g.add((OPDA.role, RDFS.label, Literal("role", lang="en")))
    g.add((OPDA.role, RDFS.comment, Literal(
        "Notation value naming the transactional role borne by a "
        "Seller / Buyer / Proprietor / Conveyancer / etc. Constrained "
        "by per-overlay profile shapes via SHACL `sh:in` over the "
        "SKOS RoleScheme members. Per ODR-0006 §Q2 the role-bearing "
        "pattern is encoded by `opda:Seller` / `opda:Buyer` / "
        "`opda:Proprietor` sub-classes of `opda:RoleMixin`; this "
        "predicate exposes the notation for DASH editor ergonomics "
        "and SPARQL convenience.",
        lang="en",
    )))
    g.add((OPDA.role, SKOS.scopeNote, Literal(
        "Notation companion to the class-membership role encoding. "
        "Both surfaces coexist: `?s a opda:Seller` AND "
        "`?s opda:role \"Seller\"` are non-redundant — the typed "
        "encoding is the canonical IC; the predicate is the notation "
        "surface BASPI5 and other JSON-based overlays consume.",
        lang="en",
    )))
    g.add((OPDA.role, DCTERMS.source, _ODR_0006_Q2))

    return g
