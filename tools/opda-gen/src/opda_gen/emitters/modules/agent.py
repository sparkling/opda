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


OPDA = Namespace("https://opda.org.uk/pdtf/")
ORG = Namespace("http://www.w3.org/ns/org#")
PROV = Namespace("http://www.w3.org/ns/prov#")


_ODR_0006_Q1 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q1")
_ODR_0006_Q2 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q2")
_ODR_0006_Q3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q3")
_ODR_0006_Q4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q4")
_ODR_0006_Q6 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q6")


# Data-dictionary schema-leaf-path dct:source (ODR-0022 G2); same form as the
# property-module helper (module-local to avoid a cross-emitter import).
def _dd_source(leaf_path: str) -> URIRef:
    """Return the data-dictionary schema-leaf-path `dct:source` IRI (G2)."""
    safe = leaf_path.replace(" ", "%20").replace("'", "%27")
    return URIRef(f"https://opda.org.uk/pdtf/harness/data-dictionary/{safe}")


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
    OPDA.hasRegisteredTitle,
    OPDA.mediates,
    OPDA.founds,
    OPDA.playedBy,
    OPDA.plays,
)

DATATYPE_PROPERTIES = (
    OPDA.accountName,
    OPDA.accountNumber,
    OPDA.aged17OrOverNames,
    OPDA.dateOfBirth,
    OPDA.hasAssertedCapacity,
    OPDA.hasOthersAged17OrOver,
    OPDA.middleNames,
    OPDA.name,
    OPDA.numberOfNonUkResidentSellers,
    OPDA.numberOfSellers,
    OPDA.organisationName,
    OPDA.organisationReference,
    OPDA.ownerType,
    OPDA.reference,
    OPDA.roleNotation,
    OPDA.sellersCapacityDetails,
    OPDA.sortCode,
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
    module_iri = URIRef("https://opda.org.uk/pdtf/graph/agent")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title, Literal("OPDA Agent Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.imports, URIRef("https://opda.org.uk/pdtf/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://opda.org.uk/pdtf/harness/release/agent/1.1.0/")))
    # The "any-of" documentary-domain/range convention (Council session-050 Q1
    # binding rider; ADR-0049; ODR-0032 §R1 session-050 amendment). Some object
    # properties in this module (opda:founds, opda:playedBy, opda:plays) carry
    # MULTIPLE rdfs:domain and/or rdfs:range triples. These are read as "any-of"
    # (the schema.org domainIncludes / hm ODR-0014 idiom), NOT the RDF Schema 1.1
    # §3.2 conjunction. They are authored as documentary AI-signal per ODR-0026
    # §R2 and are NEVER entailed — OPDA's frozen 7-rule closure (ODR-0025 §R1)
    # consumes no rdfs:domain/range, so ADR-0035 proves zero domain/range triples
    # materialise. The authoritative disjunction is SHACL sh:or
    # (opda:FoundsRangeShape / opda:RolePlayShape / opda:RolePlaySubjectShape).
    g.add((module_iri, SKOS.editorialNote, Literal(
        "Documentary domain/range convention (ODR-0026 §R2; ODR-0032 §R1; "
        "Council session-050 Q1): rdfs:domain/rdfs:range on the object "
        "properties of this module are authored as documentary AI-signal and "
        "are NEVER entailed (the frozen 7-rule closure, ODR-0025 §R1, consumes "
        "no domain/range; ADR-0035 proves zero domain/range triples "
        "materialise). Where one property carries MULTIPLE rdfs:domain or "
        "rdfs:range triples (opda:founds, opda:playedBy, opda:plays) they read "
        "as \"any-of\" (the schema.org domainIncludes idiom; hm ODR-0014), NOT "
        "the RDF Schema 1.1 §3.2 conjunction. SHACL sh:or is the authoritative "
        "disjunction (opda:FoundsRangeShape / opda:RolePlayShape / "
        "opda:RolePlaySubjectShape); owl:unionOf is NOT used (excluded "
        "construct, ODR-0030).",
        lang="en",
    )))

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
    g.add((OPDA.Person, SKOS.definition, Literal(
        "A natural person — a human individual party to a property "
        "transaction — whose identity persists rigidly through name change, "
        "gender recognition, and death, and is fixed by a multi-identifier "
        "criterion (date of birth, state-issued identifier, and name) rather "
        "than by any single attribute.",
        lang="en",
    )))
    g.add((OPDA.Person, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.Person, DCTERMS.source, _ODR_0006_Q1))
    # opda:Person owl:disjointWith opda:Organisation — the ONE standing class
    # disjointness pair (ADR-0049 Q3; Council session-050 5–0, three-part bar).
    # Documentary AI-signal, NEVER entailed: the frozen 7-rule closure (ODR-0025
    # §R1) consumes no owl:disjointWith, so it materialises ZERO type triples
    # (ADR-0035 zero-triple proof holds). It is CONSUMED by the disjointness
    # CONSISTENCY gate (validation-not-materialisation): scripts/fuseki-load.mjs
    # consistencyGate + ci/inference_closure_test.py clause 4 each query
    # `?c1 owl:disjointWith ?c2 . ?x a ?c1 . ?x a ?c2` directly — arming the
    # previously-vacuous ADR-0035 disjointness gate (zero authored before this).
    # Authored ONCE (canonical direction Person→Organisation): the gate binds
    # ?c1/?c2 from the single triple, so a both-typed `?x a Person, Organisation`
    # violation fires without a reciprocal axiom — owl:AllDisjointClasses is NOT
    # used (no rule walks the list; session-050 verified pairwise consumption).
    # Both pass the three-part bar (session-050): (i) Person & Organisation are
    # rigid Substance Kinds each with its OWN identity criterion (ODR-0006 §Q1/§Q6
    # — multi-identifier persistence vs LegalEntity registration); (ii) their ICs
    # are INCOMPATIBLE, not merely distinct, not complementary (a natural person
    # is not a legal-institutional object — the opposite of the co-referring
    # Property/LegalEstate/RegisteredTitle Kinds, ODR-0005); (iii) a real,
    # occurring master-data misclassification hazard (a node typed as BOTH a
    # Person and an Organisation). SHACL dual: opda:PersonNotOrganisationDisjoint
    # Shape + opda:OrganisationNotPersonDisjointShape (sh:not, both directions) in
    # shapes.py is the closed-world enforcement.
    g.add((OPDA.Person, OWL.disjointWith, OPDA.Organisation))

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
    g.add((OPDA.Organisation, SKOS.definition, Literal(
        "A corporate or unincorporated organisation — a legal-institutional "
        "object party to a property transaction — whose identity is fixed by "
        "jurisdiction-issued registration identifiers (e.g. CRN, LEI) and "
        "persists through merger, demerger, and dissolution, a new individual "
        "arising on entity-merger via prov:wasDerivedFrom.",
        lang="en",
    )))
    g.add((OPDA.Organisation, RDFS.isDefinedBy, module_iri))
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
    g.add((OPDA.Seller, SKOS.definition, Literal(
        "An anti-rigid, cross-sortal party role — borne by a Person or an "
        "Organisation — that is founded by a specific Transaction and "
        "identifies the party disposing of the interest in the Property, the "
        "role's identity being parasitic on the (Transaction, bearer) tuple.",
        lang="en",
    )))
    g.add((OPDA.Seller, RDFS.isDefinedBy, module_iri))
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
    g.add((OPDA.Buyer, SKOS.definition, Literal(
        "An anti-rigid, cross-sortal party role — borne by a Person or an "
        "Organisation — that is founded by a specific Transaction and "
        "identifies the party acquiring the interest in the Property; in a "
        "TransactionChain its bearer may bear the Seller role of the next "
        "transaction.",
        lang="en",
    )))
    g.add((OPDA.Buyer, RDFS.isDefinedBy, module_iri))
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
    g.add((OPDA.Proprietor, SKOS.definition, Literal(
        "An anti-rigid, sortal ownership role — borne by a Person — that is "
        "founded by a Proprietorship Relator and identifies a registered "
        "legal owner of the Property; it carries no identity of its own (it "
        "borrows identity from its bearer) and is never independently keyed.",
        lang="en",
    )))
    g.add((OPDA.Proprietor, RDFS.isDefinedBy, module_iri))
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
    g.add((OPDA.Proprietorship, SKOS.definition, Literal(
        "A relational endurant (UFO Relator) that binds one or more "
        "Proprietor roles to a Property against a RegisteredTitle, founded by "
        "the registration event and identified by the (Title, owner-set) "
        "tuple; the holding type — joint tenancy or tenancy in common — is a "
        "property of this relator, not of the roles it mediates.",
        lang="en",
    )))
    g.add((OPDA.Proprietorship, RDFS.isDefinedBy, module_iri))
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
    g.add((OPDA.NameChangeEvent, SKOS.definition, Literal(
        "A reified provenance activity (PROV-O Activity) recording a change "
        "to a Person's name — by deed poll, marriage, gender recognition, or "
        "the like — through which the Person's identity persists; it relates "
        "former and current name attributes by prov:wasRevisionOf rather than "
        "asserting two distinct persons.",
        lang="en",
    )))
    g.add((OPDA.NameChangeEvent, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.NameChangeEvent, DCTERMS.source, _ODR_0006_Q1))

    # --- DatatypeProperty: opda:hasAssertedCapacity (ODR-0006 §Q4) ------
    g.add((OPDA.hasAssertedCapacity, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasAssertedCapacity, RDFS.domain, OPDA.Seller))
    g.add((OPDA.hasAssertedCapacity, RDFS.range, SKOS.Concept))
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
    g.add((OPDA.hasAssertedCapacity, SKOS.definition, Literal(
        "Relates a Seller to the coded capacity in which it asserts it is "
        "selling (a member of opda:SellersCapacityScheme) — the sales-side "
        "half of the Capacity/Authority split, recording the claimed basis "
        "of authority to sell prior to its conveyancing-side evidencing.",
        lang="en",
    )))
    g.add((OPDA.hasAssertedCapacity, RDFS.isDefinedBy, module_iri))
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
    g.add((OPDA.hasEvidencedAuthority, SKOS.definition, Literal(
        "Relates a Seller to an opda:Claim evidencing its authority to sell "
        "(e.g. a grant of probate or power of attorney) — the conveyancing-"
        "side half of the Capacity/Authority split, linking the asserted "
        "capacity to the verifiable evidence of the founding grant.",
        lang="en",
    )))
    g.add((OPDA.hasEvidencedAuthority, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.hasEvidencedAuthority, DCTERMS.source, _ODR_0006_Q4))

    # --- ObjectProperty: opda:mediates (ODR-0006 §Q3 — Relator spine) ----
    # The Relator's existential mediation of the Roles it founds (council
    # session-045 Q2 / session-046): asserted design-time, SHACL-validated
    # (opda:ProprietorshipMediationShape — sh:minCount 2; a Relator binds ≥2
    # bearers, Guizzardi 2005 Ch.4 §4.4), NEVER reasoned (ODR-0029/0031 — the
    # UFO layer is inert at load). Single-class relator-spine edge:
    # rdfs:domain opda:Proprietorship + rdfs:range opda:Proprietor are authored
    # as documentary domain/range (ODR-0032 §R2 session-050 amendment — both
    # endpoints single-class). Documentary domain/range is fully consistent with
    # the "NEVER reasoned" commitment (the closure adds zero domain/range
    # triples, ADR-0035), so this does NOT override ODR-0029/0031. SHACL carries
    # the cardinality + co-domain class pin. Realises ODR-0006 §Q3, previously
    # specified-but-unemitted. Categorially distinct from rdfs:subClassOf —
    # relator→role, not role-under-Kind.
    g.add((OPDA.mediates, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.mediates, RDFS.domain, OPDA.Proprietorship))
    g.add((OPDA.mediates, RDFS.range, OPDA.Proprietor))
    g.add((OPDA.mediates, RDFS.label, Literal("mediates", lang="en")))
    g.add((OPDA.mediates, RDFS.comment, Literal(
        "Relator → Role mediation. A Relator (e.g. opda:Proprietorship) "
        "existentially mediates the ≥2 Role instances it founds (e.g. the "
        "opda:Proprietor roles of a joint tenancy). Per UFO a Relator just IS "
        "that which binds ≥2 relata (Guizzardi 2005 Ch.4 §4.4); "
        "opda:ProprietorshipMediationShape enforces sh:minCount 2 closed-world. "
        "Single-class relator-spine edge: rdfs:domain opda:Proprietorship + "
        "rdfs:range opda:Proprietor authored as documentary domain/range "
        "(ODR-0032 §R2 session-050 amendment). Design-time + SHACL-validated, "
        "NEVER reasoned (ODR-0029/0031) — the documentary axioms are AI-signal, "
        "not entailed (the closure adds zero domain/range triples, ADR-0035).",
        lang="en",
    )))
    g.add((OPDA.mediates, SKOS.definition, Literal(
        "Relates a Relator to a Role it existentially binds — specifically a "
        "Proprietorship to each of the two-or-more Proprietor roles of a "
        "joint holding — expressing the UFO mediation by which a relator just "
        "is that which connects its relata.",
        lang="en",
    )))
    g.add((OPDA.mediates, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.mediates, DCTERMS.source, _ODR_0006_Q3))

    # --- ObjectProperty: opda:founds (ODR-0006 §Q3 — Relator spine) ------
    # Relator → Role founding edge: an opda:Transaction relator founds the
    # opda:Seller / opda:Buyer RoleMixins; an opda:Proprietorship founds its
    # opda:Proprietor roles. Per UFO anti-rigidity every Role is externally
    # founded by its Relator (Guizzardi 2005 Ch.4 §4.4; ODR-0006 §Q3 Role
    # layer). Design-time, NEVER reasoned (ODR-0030 Rule 1 / ODR-0031). Relator
    # spine only — not a general roleOf.
    # Documentary domain/range (ODR-0032 §R2 session-050 amendment): a single
    # PLAIN rdfs:domain opda:Relator (Transaction & Proprietorship are BOTH
    # ⊑ opda:Relator, so the subject-type is universally true → plain, not
    # any-of), and an "any-of" rdfs:range opda:Role , opda:RoleMixin (two
    # triples read disjunctively per the module-header convention — Proprietor
    # is a Role, Seller/Buyer are RoleMixins; the authoritative co-domain
    # disjunction is opda:FoundsRangeShape sh:or). Authored as AI-signal, never
    # entailed (ADR-0035 — zero domain/range triples materialise), so the
    # "NEVER reasoned" commitment is preserved.
    g.add((OPDA.founds, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.founds, RDFS.domain, OPDA.Relator))
    g.add((OPDA.founds, RDFS.range, OPDA.Role))
    g.add((OPDA.founds, RDFS.range, OPDA.RoleMixin))
    g.add((OPDA.founds, RDFS.label, Literal("founds", lang="en")))
    g.add((OPDA.founds, RDFS.comment, Literal(
        "Relator → Role founding. A Transaction relator founds the Seller and "
        "Buyer RoleMixins; a Proprietorship founds its Proprietor roles. Per "
        "UFO anti-rigidity every Role is externally founded by its Relator "
        "(Guizzardi 2005 Ch.4 §4.4; ODR-0006 §Q3). Documentary domain/range: "
        "plain rdfs:domain opda:Relator (Transaction & Proprietorship are both "
        "⊑ opda:Relator — universally true) + \"any-of\" rdfs:range opda:Role , "
        "opda:RoleMixin (read disjunctively per the module-header convention — "
        "Proprietor is a Role, Seller/Buyer are RoleMixins; authoritative "
        "disjunction in opda:FoundsRangeShape sh:or, NOT owl:unionOf). "
        "Design-time, NEVER reasoned (ODR-0030 Rule 1 / ODR-0031) — the axioms "
        "are AI-signal, not entailed (zero domain/range triples materialise, "
        "ADR-0035). Relator spine only; not a general roleOf.",
        lang="en",
    )))
    g.add((OPDA.founds, SKOS.definition, Literal(
        "Relates a Relator to a Role it externally founds — a Transaction to "
        "its Seller and Buyer RoleMixins, or a Proprietorship to its "
        "Proprietor roles — capturing the UFO anti-rigidity dependence by "
        "which every role owes its existence to its founding relator.",
        lang="en",
    )))
    g.add((OPDA.founds, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.founds, DCTERMS.source, _ODR_0006_Q3))

    # --- ObjectProperty: opda:playedBy / opda:plays (ODR-0006 §Q2; ODR-0032) -
    # The qua-individual navigable edge from a Role to the Person/Organisation
    # bearer that plays it (Council session-047 Q4). Distinct from role
    # co-typing (`?x a opda:Person, opda:Seller`, ODR-0006 §Q2): playedBy names
    # the role-instance's one link home to its bearer, for the cases where the
    # bearer and the role-instance are distinct nodes (Guizzardi 2005 Ch.4
    # §4.3.2 — the qua-individual is a relationally-dependent particular, not a
    # denormalised copy). Documentary "any-of" domain/range (ODR-0032 §R1/§R2
    # session-050 amendment; the schema.org domainIncludes idiom, hm ODR-0014):
    # rdfs:domain opda:Role , opda:RoleMixin (the role-instance subject is drawn
    # from BOTH role meta-classes — opda:Role for the sortal Proprietor AND
    # opda:RoleMixin for the cross-sortal Seller/Buyer, which are SIBLINGS per
    # ODR-0006 §Q2, not a parent-child pair) and rdfs:range opda:Person ,
    # opda:Organisation (the bearer). Both are MULTIPLE triples read
    # DISJUNCTIVELY ("any-of") per the module-header convention, NOT the RDFS
    # §3.2 conjunction; authored as documentary AI-signal and NEVER entailed
    # (the frozen closure consumes no domain/range — ADR-0035 proves zero
    # domain/range triples materialise, so `rdfs:range opda:Person ,
    # opda:Organisation` does NOT entail every bearer is a Person). The
    # AUTHORITATIVE disjunction stays in SHACL `sh:or` (subject:
    # opda:RolePlaySubjectShape; bearer: opda:RolePlayShape / opda:SellerShape /
    # opda:BuyerShape); owl:unionOf is NOT used (excluded construct, ODR-0030).
    # OPTIONAL / distinct-node-only: the SHACL shapes carry NO sh:minCount, so a
    # co-typed role with no distinct bearer node is conformant and no vacuous
    # self-edge `?x playedBy ?x` is forced (Council session-047 Q4 / Davis
    # condition). opda:plays is the owl:inverseOf for query-from-either-end
    # without inverse inference.
    g.add((OPDA.playedBy, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.playedBy, OWL.inverseOf, OPDA.plays))
    g.add((OPDA.playedBy, RDFS.domain, OPDA.Role))
    g.add((OPDA.playedBy, RDFS.domain, OPDA.RoleMixin))
    g.add((OPDA.playedBy, RDFS.range, OPDA.Person))
    g.add((OPDA.playedBy, RDFS.range, OPDA.Organisation))
    g.add((OPDA.playedBy, RDFS.label, Literal("played by", lang="en")))
    g.add((OPDA.playedBy, RDFS.comment, Literal(
        "Role → bearer navigable edge: the Person or Organisation that plays "
        "this Role qua-individual. Documentary \"any-of\" domain/range "
        "(ODR-0032 §R2 session-050 amendment; schema.org domainIncludes idiom): "
        "rdfs:domain opda:Role , opda:RoleMixin (the subject is an opda:Role — "
        "Proprietor — OR an opda:RoleMixin — Seller/Buyer — sibling role "
        "meta-classes) and rdfs:range opda:Person , opda:Organisation (the "
        "bearer), each MULTIPLE triples read DISJUNCTIVELY per the module-header "
        "convention, NOT the RDFS §3.2 conjunction. Authored as AI-signal, "
        "NEVER entailed (zero domain/range triples materialise, ADR-0035 — so "
        "the range does NOT entail every bearer is a Person). The authoritative "
        "disjunctions live in SHACL sh:or (subject: opda:RolePlaySubjectShape; "
        "bearer: opda:RolePlayShape / opda:SellerShape / opda:BuyerShape), NOT "
        "owl:unionOf (excluded construct). OPTIONAL / distinct-node-only per "
        "Council session-047 Q4: emitted only where the role qua-individual is "
        "a node distinct from its bearer; never a self-edge. Coexists with role "
        "co-typing (ODR-0006 §Q2) — the typed encoding is the canonical IC, "
        "this is the navigable link for the distinct-node case (a qua-individual, "
        "prov:Agent-attested participant). Inverse: opda:plays.",
        lang="en",
    )))
    g.add((OPDA.playedBy, SKOS.scopeNote, Literal(
        "UFO: the role qua-individual is a relationally-dependent particular, "
        "externally founded and distinct from the rigid bearer (Guizzardi 2005 "
        "Ch. 4 §4.3.2; Masolo, Guizzardi, Vieu, Bottazzi, Ferrario KR 2004). "
        "Not redundant with co-typing — different entailments. The sh:path the "
        "ODR-0006 §SHACL SellerShape names.",
        lang="en",
    )))
    g.add((OPDA.playedBy, SKOS.definition, Literal(
        "Relates a Role qua-individual (a Seller, Buyer, or Proprietor) to "
        "the Person or Organisation that bears it — the navigable link home "
        "from a role-instance to its bearer, emitted only where the two are "
        "distinct nodes. Inverse of opda:plays.",
        lang="en",
    )))
    g.add((OPDA.playedBy, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.playedBy, DCTERMS.source, _ODR_0006_Q2))

    g.add((OPDA.plays, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.plays, OWL.inverseOf, OPDA.playedBy))
    g.add((OPDA.plays, RDFS.domain, OPDA.Person))
    g.add((OPDA.plays, RDFS.domain, OPDA.Organisation))
    g.add((OPDA.plays, RDFS.range, OPDA.Role))
    g.add((OPDA.plays, RDFS.range, OPDA.RoleMixin))
    g.add((OPDA.plays, RDFS.label, Literal("plays", lang="en")))
    g.add((OPDA.plays, RDFS.comment, Literal(
        "Bearer → Role inverse of opda:playedBy: the Role a Person or "
        "Organisation plays. Documentary \"any-of\" domain/range (the mirror "
        "of opda:playedBy; ODR-0032 §R2 session-050 amendment): rdfs:domain "
        "opda:Person , opda:Organisation (the bearer subject) and rdfs:range "
        "opda:Role , opda:RoleMixin (the role object), each MULTIPLE triples "
        "read DISJUNCTIVELY per the module-header convention, NOT the RDFS §3.2 "
        "conjunction. Authored as AI-signal, NEVER entailed (zero domain/range "
        "triples materialise, ADR-0035 — so the domain does NOT entail every "
        "bearer is a Person). The authoritative subject/object disjunctions are "
        "carried by the opda:playedBy SHACL shapes (the inverse direction "
        "shares the same closed-world constraints); owl:unionOf is NOT used. "
        "Emitted as the navigable inverse so consumers query from either end "
        "without inverse-property inference (ODR-0029/0030 — UFO layer inert at "
        "load).",
        lang="en",
    )))
    g.add((OPDA.plays, SKOS.scopeNote, Literal(
        "Inverse companion to opda:playedBy (UFO qua-individual edge, Guizzardi "
        "2005 Ch. 4 §4.3.2). Bearer-side surface; both directions emitted per "
        "the opda:hasChainPosition / opda:chainMembers bidirectional convention.",
        lang="en",
    )))
    g.add((OPDA.plays, SKOS.definition, Literal(
        "Relates a Person or Organisation to a Role qua-individual it bears "
        "(a Seller, Buyer, or Proprietor) — the bearer-side navigable surface "
        "letting consumers query from either end without inverse-property "
        "inference. Inverse of opda:playedBy.",
        lang="en",
    )))
    g.add((OPDA.plays, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.plays, DCTERMS.source, _ODR_0006_Q2))

    # --- ObjectProperty: opda:hasRegisteredTitle (ODR-0006 §Q3; ODR-0032) ---
    # Proprietorship → RegisteredTitle: the Relator's title arm (ODR-0006 §Q3
    # "mediating … against a RegisteredTitle"; Council session-047 GATED).
    # Single-domain edge with NO never-reasoned commitment, so rdfs:domain +
    # rdfs:range are BOTH asserted (the subject-type entailment opda:Proprietorship
    # is universally true; contrast founds/mediates which carry the design-time
    # commitment and are SHACL-pinned instead). Distinct from opda:mediates
    # (Proprietorship → Proprietor roles): this arm binds the title the
    # proprietorship is registered against.
    g.add((OPDA.hasRegisteredTitle, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasRegisteredTitle, RDFS.domain, OPDA.Proprietorship))
    g.add((OPDA.hasRegisteredTitle, RDFS.range, OPDA.RegisteredTitle))
    g.add((OPDA.hasRegisteredTitle, RDFS.label,
           Literal("has registered title", lang="en")))
    g.add((OPDA.hasRegisteredTitle, RDFS.comment, Literal(
        "Proprietorship → RegisteredTitle join: the HMLR title-register record "
        "the Proprietorship Relator is registered against (ODR-0006 §Q3 — the "
        "Relator mediates Property + Proprietor instances against a "
        "RegisteredTitle). Single-domain edge with no never-reasoned "
        "commitment, so rdfs:domain opda:Proprietorship + rdfs:range "
        "opda:RegisteredTitle are both asserted (Council session-047 Q5 "
        "carrier ruling). The Proprietor arm is opda:mediates; the property "
        "arm reaches opda:Property via opda:RegisteredTitle "
        "opda:identifiesSameProperty.",
        lang="en",
    )))
    g.add((OPDA.hasRegisteredTitle, SKOS.definition, Literal(
        "Relates a Proprietorship to the RegisteredTitle it is registered "
        "against — the HMLR title-register record naming the title arm of "
        "the holding, distinct from the Proprietor arm carried by "
        "opda:mediates.",
        lang="en",
    )))
    g.add((OPDA.hasRegisteredTitle, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.hasRegisteredTitle, DCTERMS.source, _ODR_0006_Q3))

    # ==== G11 expansion (ADR-0013) ======================================
    # --- DatatypeProperty: opda:ownerType (BASPI5 legalOwners[].ownerType) -
    g.add((OPDA.ownerType, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.ownerType, RDFS.domain, OPDA.Proprietor))
    g.add((OPDA.ownerType, RDFS.range, SKOS.Concept))
    g.add((OPDA.ownerType, RDFS.label, Literal("owner type", lang="en")))
    g.add((OPDA.ownerType, RDFS.comment, Literal(
        "Substance Kind label discriminating Private individual "
        "(opda:Person) from Organisation (opda:Organisation) for a "
        "Proprietor (legal owner). Bound to opda:OwnerTypeScheme via "
        "SHACL sh:in in the BASPI5 profile. Distinct from opda:roleNotation "
        "(transactional role) and opda:tenureKind (sub-Kind of "
        "LegalEstate).",
        lang="en",
    )))
    g.add((OPDA.ownerType, SKOS.definition, Literal(
        "Relates a Proprietor to a coded Substance-Kind discriminator "
        "(a member of opda:OwnerTypeScheme) distinguishing whether the legal "
        "owner is a private individual (a Person) or an organisation, as "
        "reported by the BASPI5 legal-owners block.",
        lang="en",
    )))
    g.add((OPDA.ownerType, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.ownerType, DCTERMS.source,
           URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q5a")))

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
    g.add((OPDA.hasOthersAged17OrOver, SKOS.definition, Literal(
        "Relates a Seller to a Yes/No value recording whether the Property's "
        "household includes occupiers aged 17 or over other than the Seller "
        "— the BASPI5 occupiers discriminator gating disclosure of those "
        "occupiers' names.",
        lang="en",
    )))
    g.add((OPDA.hasOthersAged17OrOver, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.hasOthersAged17OrOver, DCTERMS.source,
           URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0008/section-Q5a")))

    # --- ADR-0014 G18 — opda:roleNotation DatatypeProperty (DASH ergonomics) -
    # Renamed from opda:role (ADR-0044) to remove the case-only clash with the
    # opda:Role class on case-insensitive hosts; the name now also matches its
    # "Notation value" semantics.
    # Domain: foundation opda:RoleMixin (cross-sortal role pattern).
    # Range: skos:Concept (Council-046 Q3b — coded values are concept IRIs
    # from opda:RoleScheme, joining via skos:inScheme like every other coded
    # property; per-overlay shapes constrain via sh:in over the scheme member
    # IRIs). The IRI is held stable (renamed from opda:role per ADR-0044) and
    # is NOT re-renamed despite now carrying a concept. The role-bearing PATTERN
    # remains encoded by opda:Seller/opda:Buyer/opda:Proprietor sub-typing
    # of opda:RoleMixin/opda:Role per ODR-0006 §Q2; this predicate
    # exposes the notation so DASH editors render the role enum and
    # SPARQL queries can filter on `?seller opda:roleNotation "Seller"`
    # without forcing a class-membership query. The TBox carries no
    # `rdfs:domain` other than opda:RoleMixin so the predicate may
    # also be borne by Buyer / Proprietor / Conveyancer / etc. without
    # additional axioms.
    g.add((OPDA.roleNotation, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.roleNotation, RDFS.domain, OPDA.RoleMixin))
    g.add((OPDA.roleNotation, RDFS.range, SKOS.Concept))
    g.add((OPDA.roleNotation, RDFS.label, Literal("role notation", lang="en")))
    g.add((OPDA.roleNotation, RDFS.comment, Literal(
        "Notation value naming the transactional role borne by a "
        "Seller / Buyer / Proprietor / Conveyancer / etc. Constrained "
        "by per-overlay profile shapes via SHACL `sh:in` over the "
        "SKOS RoleScheme members. Per ODR-0006 §Q2 the role-bearing "
        "pattern is encoded by `opda:Seller` / `opda:Buyer` / "
        "`opda:Proprietor` sub-classes of `opda:RoleMixin`; this "
        "predicate exposes the notation for DASH editor ergonomics "
        "and SPARQL convenience. Renamed from opda:role (ADR-0044) to "
        "avoid the case-clash with the opda:Role class.",
        lang="en",
    )))
    g.add((OPDA.roleNotation, SKOS.scopeNote, Literal(
        "Notation companion to the class-membership role encoding. "
        "Both surfaces coexist: `?s a opda:Seller` AND "
        "`?s opda:roleNotation \"Seller\"` are non-redundant — the typed "
        "encoding is the canonical IC; the predicate is the notation "
        "surface BASPI5 and other JSON-based overlays consume.",
        lang="en",
    )))
    g.add((OPDA.roleNotation, SKOS.definition, Literal(
        "Relates a role-bearer to a coded notation naming the transactional "
        "role it bears (a member of opda:RoleScheme — Seller, Buyer, "
        "Proprietor, Conveyancer, etc.) — the notation surface exposing the "
        "role for editor and SPARQL ergonomics alongside the canonical "
        "class-membership encoding.",
        lang="en",
    )))
    g.add((OPDA.roleNotation, RDFS.isDefinedBy, module_iri))
    g.add((OPDA.roleNotation, DCTERMS.source, _ODR_0006_Q2))

    # ==== Category-G curated walk — Family C: Agent attributes ===============
    # (ADR-0031 work-item 2). Person / Organisation / Seller / Proprietorship
    # attributes. Each a flat datatype property per ODR-0008 §Q5a, flat per
    # §Q6a, on the nearest existing Agent-module Kind/Role/Relator. Range from
    # the data-dictionary `type`; `dateOfBirth` (a date string) → xsd:date;
    # `accountNumber` → xsd:string (a bank-account identifier — leading-zero
    # significant, per the opda:hasUPRN identifier convention, NOT xsd:integer).
    # `domain=None` emits NO rdfs:domain (a shared property reused across node
    # types, the convention opda:price / opda:inclusionStatus follow).
    #
    # FLAGGED ambiguous domains (most-defensible call made, surfaced for review):
    #   - bank-details (accountName / accountNumber / sortCode / reference):
    #     placed on opda:Organisation (the managing-agent / landlord / RTA /
    #     rentcharge-owner / management-company *contact* whose account it is).
    #     No opda:BankAccount Substance Kind is minted — these are flat
    #     attributes of the contact organisation; a dedicated account object
    #     would be speculative for a 4-leaf cluster.
    #   - numberOfSellers / numberOfNonUkResidentSellers: RETARGETED to
    #     opda:Transaction (2026-07-05, resolving this flag). Re-verified
    #     against the RML gap-closing sweep: the field's own schema
    #     description ("This may differ from the number of legal owners, for
    #     example if the property is being sold by executors of a deceased
    #     owner") confirms these are a SALES-context aggregate, not a
    #     legal-ownership aggregate — binding them onto opda:Proprietorship
    #     (whose opda:mediates edges name the registered legal owners) would
    #     silently conflate the two. opda:Transaction already founds the
    #     Seller role-group (opda:founds / opda:hasParticipant) and is the
    #     natural bearer of a seller-count aggregate; they still sit under
    #     propertyPack.ownership.
    #   - name: domain-less — 46 polysemous occurrences (participant / school /
    #     road / contract-template / health-care / plan name); a single shared
    #     naming property, no rigid bearer Kind.
    #   - formerName / currentName / previousName / newName (2026-07-05,
    #     RML gap-closing session): CLOSE a "ratified but never implemented"
    #     gap — the ratified exemplar person-with-name-change.ttl already
    #     uses all four, but none were ever declared. Real JSON hook:
    #     participants[].name.maidenName (former surname) / .lastName
    #     (current surname). Scoped to SURNAME ONLY, not a constructed full
    #     name — the source data only ever tells us a marriage-style surname
    #     change happened, never that the first name also changed, so
    #     asserting formerName/currentName as {firstName} {lastName}
    #     concatenations would fabricate a first-name-inclusive claim the
    #     data doesn't support. formerName/currentName sit on the persistent
    #     opda:Person (its current descriptive state); previousName/newName
    #     sit on the opda:NameChangeEvent (the activity's own record of what
    #     changed) — non-redundant per the exemplar's own PROV-O framing,
    #     both honestly populable from the same two source fields.
    #     opda:nameChangeDate / opda:nameChangeMechanism from the exemplar
    #     are DELIBERATELY NOT minted — no deed-poll/marriage-date field
    #     exists anywhere in the schema (flag, don't fabricate).
    _walk_c_agent: list[
        tuple[URIRef, URIRef | None, URIRef, str, str, str, tuple[str, ...]]
    ] = [
        (
            OPDA.dateOfBirth, OPDA.Person, XSD.date, "date of birth",
            "Date of birth of a Person participant. xsd:date. Flat per §Q6a. "
            "Part of the Person multi-identifier IC (ODR-0006 §Q1); PII under "
            "ODR-0018 (DPV co-annotation in opda-annotations.ttl).",
            "The calendar date on which a Person was born — one component of "
            "the Person's multi-identifier identity criterion and an item of "
            "personal data.",
            ("participants[].dateOfBirth",),
        ),
        (
            OPDA.middleNames, OPDA.Person, XSD.string, "middle names",
            "Middle name(s) of a Person legal owner. Plain string datatype "
            "per ODR-0008 §Q5a; flat per §Q6a.",
            "The middle name or names of a Person, between the given name and "
            "the surname, as recorded for a legal owner.",
            ("propertyPack.legalOwners.namesOfLegalOwners[].middleNames",),
        ),
        (
            OPDA.organisationName, OPDA.Organisation, XSD.string,
            "organisation name",
            "Name of an Organisation — a legal owner's registered/trading "
            "name, or the organisation a participant is acting for / belongs "
            "to. ONE shared property: the same opda:organisationName serves "
            "both leaves (Linked-Data shared-property pattern; supersedes the "
            "former opda:organisation, renamed-by-merge per ADR-0044 to remove "
            "the case-clash with the opda:Organisation class). Plain string "
            "datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The registered or trading name of an Organisation — whether a "
            "legal owner or the organisation a participant acts for or belongs "
            "to.",
            (
                "propertyPack.legalOwners.namesOfLegalOwners[].organisationName",
                "participants[].organisation",
            ),
        ),
        (
            OPDA.organisationReference, OPDA.Organisation, XSD.string,
            "organisation reference",
            "Reference identifying an Organisation participant within an "
            "external system. Plain string datatype per ODR-0008 §Q5a; flat "
            "per §Q6a.",
            "An identifier by which an Organisation participant is referenced "
            "within an external system.",
            ("participants[].organisationReference",),
        ),
        (
            OPDA.aged17OrOverNames, OPDA.Seller, XSD.string,
            "aged 17 or over names",
            "Names of occupiers aged 17 or over (other than the Seller) in "
            "the Property. Plain string datatype per ODR-0008 §Q5a; flat per "
            "§Q6a. Companion to opda:hasOthersAged17OrOver (the Yes/No "
            "discriminator).",
            "The names of the occupiers aged 17 or over, other than the "
            "Seller, residing in the Property, as disclosed when "
            "opda:hasOthersAged17OrOver is affirmative.",
            ("propertyPack.occupiers.othersAged17OrOver.aged17OrOverNames",),
        ),
        (
            OPDA.sellersCapacityDetails, OPDA.Seller, XSD.string,
            "sellers capacity details",
            "Free-text detail elaborating a Seller's asserted capacity "
            "(companion to opda:hasAssertedCapacity, ODR-0006 §Q4). Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "Free-text narrative elaborating the capacity in which a Seller "
            "is selling, supplementing the coded value carried by "
            "opda:hasAssertedCapacity.",
            ("participants[].sellersCapacity.sellersCapacityDetails",),
        ),
        (
            OPDA.numberOfSellers, OPDA.Transaction, XSD.integer,
            "number of sellers",
            "Count of the selling parties in the transaction. Plain integer "
            "datatype per ODR-0008 §Q5a; flat per §Q6a. Domain retargeted "
            "from opda:Proprietorship to opda:Transaction (2026-07-05, RML "
            "gap-closing session) — the field's own schema description "
            "('may differ from the number of legal owners, for example if "
            "the property is being sold by executors of a deceased owner') "
            "makes this a sales-context count, distinct from the "
            "Proprietorship Relator's legal-ownership mediation; "
            "opda:Transaction already founds the Seller role-group.",
            "The number of selling parties in the transaction — a "
            "sales-context count that may differ from the cardinality of "
            "the registered legal-owner set.",
            ("propertyPack.ownership.numberOfSellers",),
        ),
        (
            OPDA.numberOfNonUkResidentSellers, OPDA.Transaction, XSD.integer,
            "number of non-UK-resident sellers",
            "Count of selling parties who are non-UK-resident (relevant to "
            "SDLT / withholding). Plain integer datatype per ODR-0008 §Q5a; "
            "flat per §Q6a. Domain retargeted from opda:Proprietorship to "
            "opda:Transaction (2026-07-05, RML gap-closing session) — same "
            "sales-context-vs-legal-ownership reasoning as "
            "opda:numberOfSellers, above.",
            "The number of selling parties in the transaction who are not "
            "resident in the UK — a subset of the sales-context seller count "
            "bearing on tax and withholding obligations.",
            ("propertyPack.ownership.numberOfNonUkResidentSellers",),
        ),
        (
            OPDA.formerName, OPDA.Person, XSD.string, "former name",
            "A Person's surname before a marriage-style name change (ODR-0006 "
            "§Q1 name-change hard case). Plain string datatype per ODR-0008 "
            "§Q5a; flat per §Q6a. Scoped to surname, not a constructed full "
            "name (see the ambiguous-domains note above this list).",
            "The surname a Person held before a marriage-style name change, "
            "preserved alongside their current surname per the name-change "
            "identity-persistence rule.",
            ("participants[].name.maidenName",),
        ),
        (
            OPDA.currentName, OPDA.Person, XSD.string, "current name",
            "A Person's current surname, asserted alongside opda:formerName "
            "when a marriage-style name change is on record (ODR-0006 §Q1). "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The surname a Person currently holds, asserted alongside their "
            "former surname when a name change is on record.",
            ("participants[].name.lastName",),
        ),
        (
            OPDA.previousName, OPDA.NameChangeEvent, XSD.string,
            "previous name",
            "The surname the opda:NameChangeEvent activity changed FROM — "
            "the activity's own record of the prior state, distinct from "
            "opda:formerName's Person-level assertion (ODR-0006 §Q1). Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The surname that a name-change event changed from, as the "
            "activity's own record of the prior state.",
            ("participants[].name.maidenName",),
        ),
        (
            OPDA.newName, OPDA.NameChangeEvent, XSD.string, "new name",
            "The surname the opda:NameChangeEvent activity changed TO — the "
            "activity's own record of the resulting state, distinct from "
            "opda:currentName's Person-level assertion (ODR-0006 §Q1). Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a.",
            "The surname that a name-change event changed to, as the "
            "activity's own record of the resulting state.",
            ("participants[].name.lastName",),
        ),
        (
            OPDA.accountName, OPDA.Organisation, XSD.string, "account name",
            "Name on the bank account of a leasehold / managed-freehold "
            "contact organisation (landlord / managing agent / management "
            "company / rentcharge owner / resident-tenants' association). "
            "ONE shared property reused across those contact blocks. Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a. (FLAG: "
            "bank-details domain — placed on opda:Organisation, no "
            "opda:BankAccount Kind minted.)",
            "The name in which a contact Organisation's bank account is held "
            "— the account holder for a landlord, managing agent, management "
            "company, rentcharge owner, or resident-tenants' association.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.landlord."
                "bankDetails.accountName",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.managementCompany."
                "bankDetails.accountName",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.managingAgent."
                "bankDetails.accountName",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.rentchargeOwner."
                "bankDetails.accountName",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts."
                "residentTenantsAssociation.bankDetails.accountName",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "managementCompany.bankDetails.accountName",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "managingAgent.bankDetails.accountName",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "rentchargeOwner.bankDetails.accountName",
            ),
        ),
        (
            OPDA.accountNumber, OPDA.Organisation, XSD.string, "account number",
            "Bank-account number of a contact organisation. xsd:string (a "
            "fixed-width numeric identifier — leading zeros significant, per "
            "the opda:hasUPRN convention, NOT xsd:integer). ONE shared "
            "property; flat per §Q6a. (FLAG: bank-details domain.)",
            "The account number of a contact Organisation's bank account, "
            "held as a string so that leading zeros remain significant.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.landlord."
                "bankDetails.accountNumber",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.managementCompany."
                "bankDetails.accountNumber",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.managingAgent."
                "bankDetails.accountNumber",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.rentchargeOwner."
                "bankDetails.accountNumber",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts."
                "residentTenantsAssociation.bankDetails.accountNumber",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "managementCompany.bankDetails.accountNumber",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "managingAgent.bankDetails.accountNumber",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "rentchargeOwner.bankDetails.accountNumber",
            ),
        ),
        (
            OPDA.sortCode, OPDA.Organisation, XSD.string, "sort code",
            "Bank sort code of a contact organisation. xsd:string. ONE shared "
            "property; flat per §Q6a. (FLAG: bank-details domain.)",
            "The six-digit UK bank sort code identifying the branch holding a "
            "contact Organisation's bank account.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.landlord."
                "bankDetails.sortCode",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.managementCompany."
                "bankDetails.sortCode",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.managingAgent."
                "bankDetails.sortCode",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.rentchargeOwner."
                "bankDetails.sortCode",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts."
                "residentTenantsAssociation.bankDetails.sortCode",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "managementCompany.bankDetails.sortCode",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "managingAgent.bankDetails.sortCode",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "rentchargeOwner.bankDetails.sortCode",
            ),
        ),
        (
            OPDA.reference, OPDA.Organisation, XSD.string, "reference",
            "Payment reference for a contact organisation's bank account. "
            "Plain string datatype per ODR-0008 §Q5a; flat per §Q6a. (FLAG: "
            "bank-details domain.)",
            "The payment reference to quote when remitting funds to a contact "
            "Organisation's bank account.",
            (
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.landlord."
                "bankDetails.reference",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.managementCompany."
                "bankDetails.reference",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.managingAgent."
                "bankDetails.reference",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts.rentchargeOwner."
                "bankDetails.reference",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "leaseholdInformation.contactDetails.contacts."
                "residentTenantsAssociation.bankDetails.reference",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "managementCompany.bankDetails.reference",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "managingAgent.bankDetails.reference",
                "propertyPack.ownership.ownershipsToBeTransferred[]."
                "managedFreeholdOrCommonholdInformation.contactDetails."
                "rentchargeOwner.bankDetails.reference",
            ),
        ),
        (
            OPDA.name, None, XSD.string, "name",
            "Generic name/label of a named entity — a participant, school, "
            "road, contract template, health-care facility, transport node, "
            "or planning designation. ONE shared naming property with NO "
            "rdfs:domain: it recurs across 46 polysemous occurrences with no "
            "single rigid bearer Kind (the domain-less shared-property "
            "convention opda:price / opda:inclusionStatus follow). Plain "
            "string datatype per ODR-0008 §Q5a; flat per §Q6a. (FLAG: "
            "polysemous; left domain-less by design rather than forcing one "
            "bearer.)",
            "The proper name or label of a named entity — used across "
            "polysemous contexts (participant, school, road, contract "
            "template, health-care facility, transport node, or planning "
            "designation) as a shared naming property with no single bearer "
            "kind.",
            (
                "contracts[].contract.template.name",
                "participants[].name",
                "propertyPack.nearbyFacilities.healthCare[].name",
                "propertyPack.nearbyFacilities.schools[].name",
                "propertyPack.nearbyFacilities.transport[].name",
            ),
        ),
    ]
    for prop, domain, rng, label, comment, definition, paths in _walk_c_agent:
        g.add((prop, RDF.type, OWL.DatatypeProperty))
        if domain is not None:
            g.add((prop, RDFS.domain, domain))
        g.add((prop, RDFS.range, rng))
        g.add((prop, RDFS.label, Literal(label, lang="en")))
        g.add((prop, RDFS.comment, Literal(comment, lang="en")))
        g.add((prop, SKOS.definition, Literal(definition, lang="en")))
        g.add((prop, RDFS.isDefinedBy, module_iri))
        for p in paths:
            g.add((prop, DCTERMS.source, _dd_source(p)))

    return g
