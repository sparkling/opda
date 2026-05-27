"""
Module claim.

Realises:
- ADR-0011 §"Per-module detail — opda-claim.ttl" — Claim (subclass of
  prov:Entity) + Evidence (subclass of prov:Entity) + DocumentEvidence +
  ElectronicRecordEvidence + VouchEvidence + VerificationActivity +
  AssuranceLevel + TrustFramework + the three short-name aliases
  (Document / ElectronicRecord / Vouch) via owl:equivalentClass.
- ADR-0007 §"A9 per-kind discipline output" — every class carries
  rdfs:label + rdfs:comment + skos:scopeNote + dct:source.
- ODR-0009 §Rules + S009 Q1 80%-PROV-O / 5-residue mapping —
  Claim → prov:Entity; Evidence subtypes → prov:Entity subclasses;
  VerificationActivity → prov:Activity. Local terms minted here per
  S009 5-residue: opda:digest, opda:assuranceLevel, opda:TrustFramework.
- ODR-0018 §Rule 1 — class-level DPV baseline declaration lives in
  opda-annotations.ttl (ADR-0012); only the Kind classes emit here.

Short-name / long-name decision (within-engineering, per ADR-0011
§"Surfaced ambiguity routing"): option (b) — emit both the long names
(DocumentEvidence / ElectronicRecordEvidence / VouchEvidence) AND the
short names (Document / ElectronicRecord / Vouch) used in the exemplars,
linked by owl:equivalentClass. This is the cleanest UFO-aligned approach
without touching the exemplar source (which is a nested git repo under
source/03-standards/) and preserves the longer, more discriminating names
for downstream use in shapes + annotations.
"""

from __future__ import annotations

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD


OPDA = Namespace("https://w3id.org/opda/#")
PROV = Namespace("http://www.w3.org/ns/prov#")


_ODR_0009_Q1 = URIRef("https://w3id.org/opda/odr/ODR-0009#section-Q1")
_ODR_0009_Q3 = URIRef("https://w3id.org/opda/odr/ODR-0009#section-Q3")
_ODR_0009_Q4 = URIRef("https://w3id.org/opda/odr/ODR-0009#section-Q4")
_ODR_0009_Q5 = URIRef("https://w3id.org/opda/odr/ODR-0009#section-Q5")


CLASSES = (
    OPDA.AssuranceLevel,
    OPDA.Claim,
    OPDA.Document,
    OPDA.DocumentEvidence,
    OPDA.ElectronicRecord,
    OPDA.ElectronicRecordEvidence,
    OPDA.Evidence,
    OPDA.TrustFramework,
    OPDA.VerificationActivity,
    OPDA.Vouch,
    OPDA.VouchEvidence,
)

OBJECT_PROPERTIES = (
    OPDA.attestedBy,
    OPDA.supportedBy,
)

DATATYPE_PROPERTIES = (
    OPDA.digest,
)


def build_graph() -> Graph:
    """Build the Claim module class + property graph."""
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("owl", OWL)
    g.bind("rdfs", RDFS)
    g.bind("skos", SKOS)
    g.bind("dct", DCTERMS)
    g.bind("xsd", XSD)
    g.bind("prov", PROV)

    # --- Module ontology header --------------------------------------------
    module_iri = URIRef("https://w3id.org/opda/claim/")
    g.add((module_iri, RDF.type, OWL.Ontology))
    g.add((module_iri, DCTERMS.title, Literal("OPDA Claim Module", lang="en")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/0.3.0/")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/claim/0.3.0/")))

    # --- opda:Claim — subclass of prov:Entity (ODR-0009 §Q1) ------------
    g.add((OPDA.Claim, RDF.type, OWL.Class))
    g.add((OPDA.Claim, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Claim, RDFS.label, Literal("Claim", lang="en")))
    g.add((OPDA.Claim, RDFS.comment, Literal(
        "Verifiable claim entity. UFO Information particular; PROV-O "
        "Entity. Per S009 Q1 80%-PROV-O mapping. Hard cases: contested "
        "assertion (multiple verifications with divergent verdicts); "
        "multi-method verification (electronic-record + vouch corroboration); "
        "assurance-level downgrade (vouch-only evidence caps at eIDAS Low).",
        lang="en",
    )))
    g.add((OPDA.Claim, SKOS.scopeNote, Literal(
        "UFO: Information particular (Guizzardi 2005 Ch. 4 §4.7). PROV-O: "
        "Entity (W3C PROV-O REC §3.2). The verified claim (claim plus "
        "verification bundle) is a derived entity per S009 Rule 1.",
        lang="en",
    )))
    g.add((OPDA.Claim, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:Evidence — subclass of prov:Entity (ODR-0009 §Q1) --------
    g.add((OPDA.Evidence, RDF.type, OWL.Class))
    g.add((OPDA.Evidence, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Evidence, RDFS.label, Literal("Evidence", lang="en")))
    g.add((OPDA.Evidence, RDFS.comment, Literal(
        "Generic evidence supertype. PROV-O Entity. Three named subtypes "
        "per S009 Rule 5 (do NOT collapse): DocumentEvidence (paper or "
        "scanned artefacts); ElectronicRecordEvidence (API-retrieved "
        "structured records); VouchEvidence (formal attestations by "
        "regulated professionals). Each subtype carries type-specific "
        "facets; SHACL sh:xone dispatches on subtype at validation time "
        "(ADR-0012 emits the shape).",
        lang="en",
    )))
    g.add((OPDA.Evidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). The three subtypes "
        "correspond to OIDC4IDA / eIDAS evidence categories (S009 Rule 5).",
        lang="en",
    )))
    g.add((OPDA.Evidence, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:DocumentEvidence + opda:Document equivalence --------------
    g.add((OPDA.DocumentEvidence, RDF.type, OWL.Class))
    g.add((OPDA.DocumentEvidence, RDFS.subClassOf, OPDA.Evidence))
    g.add((OPDA.DocumentEvidence, RDFS.label,
           Literal("Document Evidence", lang="en")))
    g.add((OPDA.DocumentEvidence, RDFS.comment, Literal(
        "Document-evidence subtype — paper or scanned artefacts issued by "
        "authoritative source (e.g. grant of probate by HMCTS). eIDAS "
        "Substantial-tier assurance for court-issued instruments. "
        "Equivalent class: opda:Document (short-name used by exemplars).",
        lang="en",
    )))
    g.add((OPDA.DocumentEvidence, OWL.equivalentClass, OPDA.Document))
    g.add((OPDA.DocumentEvidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). OIDC4IDA / eIDAS "
        "document-evidence category (S009 Rule 5).",
        lang="en",
    )))
    g.add((OPDA.DocumentEvidence, DCTERMS.source, _ODR_0009_Q1))

    g.add((OPDA.Document, RDF.type, OWL.Class))
    g.add((OPDA.Document, RDFS.label, Literal("Document", lang="en")))
    g.add((OPDA.Document, RDFS.comment, Literal(
        "Alias for opda:DocumentEvidence retained for exemplar "
        "compatibility (the diagnostic exemplar set uses the short name). "
        "owl:equivalentClass binding ensures one OWL identity; downstream "
        "shapes + annotations target the long name (DocumentEvidence) "
        "for clarity.",
        lang="en",
    )))
    g.add((OPDA.Document, SKOS.scopeNote, Literal(
        "Short-name alias for opda:DocumentEvidence per ADR-0011 "
        "within-engineering option (b) — owl:equivalentClass binding "
        "preserves OWL identity without renaming exemplars.",
        lang="en",
    )))
    g.add((OPDA.Document, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:ElectronicRecordEvidence + opda:ElectronicRecord ----------
    g.add((OPDA.ElectronicRecordEvidence, RDF.type, OWL.Class))
    g.add((OPDA.ElectronicRecordEvidence, RDFS.subClassOf, OPDA.Evidence))
    g.add((OPDA.ElectronicRecordEvidence, RDFS.label,
           Literal("Electronic Record Evidence", lang="en")))
    g.add((OPDA.ElectronicRecordEvidence, RDFS.comment, Literal(
        "Electronic-record evidence subtype — API-retrieved structured "
        "records from authoritative source (e.g. HMRC tax-record API). "
        "eIDAS Substantial-tier assurance via real-time API verification. "
        "Equivalent class: opda:ElectronicRecord (short-name used by "
        "exemplars).",
        lang="en",
    )))
    g.add((OPDA.ElectronicRecordEvidence, OWL.equivalentClass,
           OPDA.ElectronicRecord))
    g.add((OPDA.ElectronicRecordEvidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). OIDC4IDA "
        "electronic-record evidence category (S009 Rule 5).",
        lang="en",
    )))
    g.add((OPDA.ElectronicRecordEvidence, DCTERMS.source, _ODR_0009_Q1))

    g.add((OPDA.ElectronicRecord, RDF.type, OWL.Class))
    g.add((OPDA.ElectronicRecord, RDFS.label,
           Literal("Electronic Record", lang="en")))
    g.add((OPDA.ElectronicRecord, RDFS.comment, Literal(
        "Alias for opda:ElectronicRecordEvidence retained for exemplar "
        "compatibility. owl:equivalentClass binding ensures one OWL "
        "identity; downstream shapes + annotations target the long name.",
        lang="en",
    )))
    g.add((OPDA.ElectronicRecord, SKOS.scopeNote, Literal(
        "Short-name alias for opda:ElectronicRecordEvidence per ADR-0011 "
        "within-engineering option (b).",
        lang="en",
    )))
    g.add((OPDA.ElectronicRecord, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:VouchEvidence + opda:Vouch --------------------------------
    g.add((OPDA.VouchEvidence, RDF.type, OWL.Class))
    g.add((OPDA.VouchEvidence, RDFS.subClassOf, OPDA.Evidence))
    g.add((OPDA.VouchEvidence, RDFS.label,
           Literal("Vouch Evidence", lang="en")))
    g.add((OPDA.VouchEvidence, RDFS.comment, Literal(
        "Vouch evidence subtype — formal attestation by a regulated "
        "professional (e.g. SRA-licensed solicitor). Qualitatively "
        "weaker than document or electronic-record evidence; eIDAS Low "
        "assurance regardless of voucher quality (Q3 SKOS scheme). The "
        "vouch is prov:wasAttributedTo an Agent — an attestation, not a "
        "document derivation. Equivalent class: opda:Vouch.",
        lang="en",
    )))
    g.add((OPDA.VouchEvidence, OWL.equivalentClass, OPDA.Vouch))
    g.add((OPDA.VouchEvidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). OIDC4IDA / eIDAS "
        "vouch-evidence category (S009 Rule 5). Vouch is "
        "prov:wasAttributedTo an Agent — an attestation, not a document.",
        lang="en",
    )))
    g.add((OPDA.VouchEvidence, DCTERMS.source, _ODR_0009_Q1))

    g.add((OPDA.Vouch, RDF.type, OWL.Class))
    g.add((OPDA.Vouch, RDFS.label, Literal("Vouch", lang="en")))
    g.add((OPDA.Vouch, RDFS.comment, Literal(
        "Alias for opda:VouchEvidence retained for exemplar "
        "compatibility. owl:equivalentClass binding ensures one OWL "
        "identity.",
        lang="en",
    )))
    g.add((OPDA.Vouch, SKOS.scopeNote, Literal(
        "Short-name alias for opda:VouchEvidence per ADR-0011 "
        "within-engineering option (b).",
        lang="en",
    )))
    g.add((OPDA.Vouch, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:VerificationActivity — subclass of prov:Activity ----------
    g.add((OPDA.VerificationActivity, RDF.type, OWL.Class))
    g.add((OPDA.VerificationActivity, RDFS.subClassOf, PROV.Activity))
    g.add((OPDA.VerificationActivity, RDFS.label,
           Literal("Verification Activity", lang="en")))
    g.add((OPDA.VerificationActivity, RDFS.comment, Literal(
        "Verification activity recording the production of a verified "
        "claim from evidence. PROV-O Activity. The OIDC4IDA single 'time' "
        "is the completion instant → prov:endedAtTime. Uses qualified "
        "form prov:qualifiedAttribution → prov:Attribution with "
        "prov:hadRole so validation_method / verification_method are not "
        "discarded.",
        lang="en",
    )))
    g.add((OPDA.VerificationActivity, SKOS.scopeNote, Literal(
        "PROV-O: Activity (W3C PROV-O REC §3.2). UFO: Event particular "
        "(Guizzardi 2005 Ch. 4 §4.7).",
        lang="en",
    )))
    g.add((OPDA.VerificationActivity, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:AssuranceLevel — backed by SKOS scheme --------------------
    g.add((OPDA.AssuranceLevel, RDF.type, OWL.Class))
    g.add((OPDA.AssuranceLevel, RDFS.label,
           Literal("Assurance Level", lang="en")))
    g.add((OPDA.AssuranceLevel, RDFS.comment, Literal(
        "Quality judgement on a Claim's verification — eIDAS Level of "
        "Assurance (Low / Substantial / High) per OIDC trust tiering. "
        "Backed by opda:AssuranceLevelScheme SKOS scheme in "
        "opda-vocabularies.ttl. Local term per S009 5-residue (PROV-O "
        "carries no notion of assurance grading).",
        lang="en",
    )))
    g.add((OPDA.AssuranceLevel, SKOS.scopeNote, Literal(
        "UFO: Quale-in-Region (Guizzardi 2005 Ch. 4 §4.3 — quality "
        "particular). eIDAS Regulation (EU) 910/2014 Article 8.",
        lang="en",
    )))
    g.add((OPDA.AssuranceLevel, DCTERMS.source, _ODR_0009_Q3))

    # --- opda:TrustFramework --------------------------------------------
    g.add((OPDA.TrustFramework, RDF.type, OWL.Class))
    g.add((OPDA.TrustFramework, RDFS.label,
           Literal("Trust Framework", lang="en")))
    g.add((OPDA.TrustFramework, RDFS.comment, Literal(
        "Trust framework citation — a governance regime that scopes "
        "claim validity (e.g. the UK Property Data Trust Framework). Per "
        "S009 5-residue mapped to dct:conformsTo on the verification "
        "activity (NOT a PROV-O primitive). Authoritative within scope "
        "per Session 003c Item 3 (OPDA TF authoritative scope).",
        lang="en",
    )))
    g.add((OPDA.TrustFramework, SKOS.scopeNote, Literal(
        "UFO: Information Particular (governance regime as informational "
        "artefact). dct:conformsTo binding per S009 Rule 5 (PROV-O "
        "residue).",
        lang="en",
    )))
    g.add((OPDA.TrustFramework, DCTERMS.source, _ODR_0009_Q5))

    # --- DatatypeProperty: opda:digest (S009 Q4) ------------------------
    g.add((OPDA.digest, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.digest, RDFS.range, XSD.string))
    g.add((OPDA.digest, RDFS.label, Literal("digest", lang="en")))
    g.add((OPDA.digest, RDFS.comment, Literal(
        "Cryptographic digest of a Claim or Evidence (algorithm + value, "
        "e.g. 'sha256:e3b0...'). Local term per S009 5-residue (PROV-O "
        "has no notion of signature or hash). Algorithm validation by "
        "opda:DigestAlgorithmScheme SKOS scheme (ADR-0012 emits the "
        "constraint).",
        lang="en",
    )))
    g.add((OPDA.digest, DCTERMS.source, _ODR_0009_Q4))

    # --- ObjectProperty: opda:supportedBy -------------------------------
    g.add((OPDA.supportedBy, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.supportedBy, RDFS.domain, OPDA.Claim))
    g.add((OPDA.supportedBy, RDFS.range, OPDA.Evidence))
    g.add((OPDA.supportedBy, RDFS.label, Literal("supported by", lang="en")))
    g.add((OPDA.supportedBy, RDFS.comment, Literal(
        "Claim → Evidence join. Convenience predicate alongside the "
        "canonical PROV-O prov:wasDerivedFrom chain (Claim "
        "prov:wasDerivedFrom Evidence). opda:supportedBy is the "
        "opda-namespaced inverse-style predicate for downstream "
        "consumers that prefer an opda: name; both directions emit so "
        "consumers can query from either end.",
        lang="en",
    )))
    g.add((OPDA.supportedBy, DCTERMS.source, _ODR_0009_Q1))

    # --- ObjectProperty: opda:attestedBy --------------------------------
    g.add((OPDA.attestedBy, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.attestedBy, RDFS.domain, OPDA.VouchEvidence))
    g.add((OPDA.attestedBy, RDFS.range, PROV.Agent))
    g.add((OPDA.attestedBy, RDFS.label, Literal("attested by", lang="en")))
    g.add((OPDA.attestedBy, RDFS.comment, Literal(
        "Vouch → Agent attestation join. Mirror of prov:wasAttributedTo "
        "for vouch-specific use. The voucher's role (e.g. "
        "opda:VoucherRole) is captured via prov:qualifiedAttribution → "
        "prov:Attribution → prov:hadRole per S009 Q2 qualified-form "
        "discipline.",
        lang="en",
    )))
    g.add((OPDA.attestedBy, DCTERMS.source, _ODR_0009_Q1))

    return g
