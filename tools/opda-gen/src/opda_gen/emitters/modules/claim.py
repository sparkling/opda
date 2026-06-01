"""
Module claim.

Realises:
- ADR-0011 §"Per-module detail — opda-claim.ttl" — Claim (subclass of
  prov:Entity) + Evidence (a RoleMixin over prov:Entity) + the neutral
  document Kind AttachedDocument + VerificationActivity + AssuranceLevel +
  TrustFramework.
- ADR-0007 §"A9 per-kind discipline output" — every class carries
  rdfs:label + rdfs:comment + skos:scopeNote + dct:source.
- ODR-0009 §Rules + S009 Q1 80%-PROV-O / 5-residue mapping —
  Claim → prov:Entity; Evidence → a role over prov:Entity;
  VerificationActivity → prov:Activity. Local terms minted here per
  S009 5-residue: opda:digest, opda:assuranceLevel, opda:TrustFramework.
- ODR-0018 §Rule 1 — class-level DPV baseline declaration lives in
  opda-annotations.ttl (ADR-0012); only the Kind classes emit here.

Evidence-kind modelling (ODR-0027 §R6; directing-authority adoption of the hm
approach; supersedes session-035/036's keep-the-subclasses disposition):
"evidence is a role a document plays, not every document's Kind" → a Role is
NEVER rdfs:subClassOf a Kind (ODR-0027 §R3; hm ODR-0010/0025/0026). So evidence
KIND is a coded `isMemberOf` classification — opda:evidenceType over
opda:EvidenceMethodScheme (the OIDC4IDA evidence.type value-space: Document /
Electronic-Record / Vouch) — NOT a subclass tree. The former
DocumentEvidence / ElectronicRecordEvidence / VouchEvidence subclasses are
RETIRED; their short names are skos:Concept notations in the scheme, never
opda: classes. opda:AttachedDocument is the one genuine Kind (own IC); a
document plays the evidence role via the coded value. Kind-specific attributes
(opda:attestedBy …) are facets borne by opda:Evidence (ODR-0027 §R2), validated
value-keyed on opda:evidenceType (opda:EvidenceFacetShape, ADR-0012).
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

# ODR-0024 R7 (council session-028 Q7) — the neutral opda:AttachedDocument
# bearer. A registry-attached document (titlesToBeSold[].additionalDocuments[])
# is NOT evidence: treating every attached doc as evidence would entail
# eIDAS-Substantial assurance on all of them. R7 keeps a neutral document Kind;
# a document plays the evidence role via opda:evidenceType (ODR-0027 §R6), not by
# subclassing into evidence.
_ODR_0024_R7 = URIRef("https://w3id.org/opda/odr/ODR-0024#section-Rules-R7")


CLASSES = (
    OPDA.AssuranceLevel,
    OPDA.AttachedDocument,
    OPDA.Claim,
    OPDA.Evidence,
    OPDA.TrustFramework,
    OPDA.VerificationActivity,
)

OBJECT_PROPERTIES = (
    OPDA.attestedBy,
    OPDA.supportedBy,
)

# Council session-036 / ODR-0027 §R6: evidence-KIND is a coded `isMemberOf`
# classification (opda:evidenceType → opda:EvidenceMethodScheme), NOT a subclass
# tree. "Evidence is a role a document plays" → a Role is never rdfs:subClassOf a
# Kind (ODR-0027 §R3; hm ODR-0010/0025/0026). The DocumentEvidence /
# ElectronicRecordEvidence / VouchEvidence subclasses are RETIRED; opda:Evidence
# is the role, opda:AttachedDocument the one genuine Kind. Kind-specific
# attributes are facets borne by the role (ODR-0027 §R2).

DATATYPE_PROPERTIES = (
    OPDA.digest,
    OPDA.evidenceType,
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
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/1.0.0/")))
    g.add((module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")))
    g.add((module_iri, OWL.versionIRI,
           URIRef("https://w3id.org/opda/claim/1.0.0/")))

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

    # --- opda:Evidence — a RoleMixin over prov:Entity (ODR-0009 §Q1;
    #     ODR-0027 §R6) ---------------------------------------------------
    # Evidence-hood is anti-rigid (a thing is evidence only qua a
    # VerificationActivity using it) → opda:Evidence is a cross-categorial
    # RoleMixin founded by the verification (the ODR-0006 Seller/Buyer pattern),
    # additively typed alongside owl:Class (punning, as Seller/Buyer). Evidence
    # KIND is a coded isMemberOf classification — opda:evidenceType →
    # opda:EvidenceMethodScheme — NOT a subclass tree (ODR-0027 §R3/§R6; the
    # former …Evidence subclasses are RETIRED). Per-kind obligations are facets
    # borne by the role, validated VALUE-keyed.
    g.add((OPDA.Evidence, RDF.type, OWL.Class))
    g.add((OPDA.Evidence, RDF.type, OPDA.RoleMixin))
    g.add((OPDA.Evidence, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Evidence, RDFS.label, Literal("Evidence", lang="en")))
    g.add((OPDA.Evidence, RDFS.comment, Literal(
        "Evidence supporting a Claim. UFO RoleMixin (anti-rigid, "
        "cross-categorial — a bearer is evidence only qua a "
        "VerificationActivity using it; ODR-0006 Seller/Buyer pattern); "
        "PROV-O Entity. Evidence KIND is a coded isMemberOf classification — "
        "opda:evidenceType over opda:EvidenceMethodScheme (the OIDC4IDA "
        "evidence.type value-space: Document / Electronic-Record / Vouch) — "
        "NOT a subclass tree (ODR-0027 §R6; the former …Evidence subclasses "
        "are retired, since 'evidence is a role a document plays' and a Role "
        "is never rdfs:subClassOf a Kind). The three kinds are NOT collapsed "
        "(S009 R5): they remain distinct scheme concepts. Kind-specific "
        "attributes (opda:attestedBy for vouches; document/record specifics) "
        "are facets borne by the role; per-kind obligations are validated "
        "VALUE-KEYED by opda:EvidenceFacetShape (sh:targetSubjectsOf "
        "opda:evidenceType + sh:or material implication; ADR-0012).",
        lang="en",
    )))
    g.add((OPDA.Evidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). The three evidence kinds "
        "(Document / Electronic-Record / Vouch) are OIDC4IDA / eIDAS "
        "evidence.type concepts in opda:EvidenceMethodScheme (S009 Rule 5), "
        "carried as the coded opda:evidenceType value (ODR-0027 §R6).",
        lang="en",
    )))
    g.add((OPDA.Evidence, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:AttachedDocument — neutral document Kind (ODR-0024 R7) -----
    # The neutral bearer for registry-attached document filing-metadata
    # (titlesToBeSold[].additionalDocuments[]: documentDate / documentTypeCode /
    # filedUnder / retrievedOn). NOT evidence — binding those props to
    # opda:DocumentEvidence (≡ opda:Document) would entail eIDAS-Substantial
    # assurance on every attached doc (session-028 Q7 blocker). opda:Document-
    # Evidence is its evidence-playing subclass (below): an attached document
    # BECOMES evidence only when it actually stands as evidence under ODR-0009;
    # plain filing metadata does not. Explicit IC: a document Kind individuated
    # by its CONTENT + its issuing activity (the document a registry holds),
    # NOT by documentTypeCode / documentDate (those are mutable descriptive
    # facets, not an identity principle — Guizzardi's S028 caveat).
    g.add((OPDA.AttachedDocument, RDF.type, OWL.Class))
    g.add((OPDA.AttachedDocument, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.AttachedDocument, RDFS.label,
           Literal("Attached Document", lang="en")))
    g.add((OPDA.AttachedDocument, RDFS.comment, Literal(
        "A document attached to a transaction record (e.g. the registry "
        "additionalDocuments[] filed against a title to be sold). UFO "
        "Information Object; PROV-O Entity. A NEUTRAL document Kind — NOT "
        "evidence: it bears filing metadata (opda:documentDate / "
        "opda:documentTypeCode / opda:filedUnder / opda:retrievedOn) without "
        "the eIDAS-assurance commitment a document playing the evidence role "
        "carries (ODR-0024 R7 / session-028 Q7 — entailing every attached doc "
        "is Substantial-tier evidence). "
        "IC: individuated by its content + issuing activity (the artefact the "
        "registry holds), NOT by documentTypeCode / documentDate (mutable "
        "descriptive facets, not an identity principle). A document BECOMES "
        "evidence by playing the evidence role — recorded as "
        "opda:evidenceType 'Document' on an opda:Evidence (ODR-0027 §R6), NOT "
        "by an rdfs:subClassOf into evidence; an attached document stands as "
        "evidence only under ODR-0009, never by mere attachment.",
        lang="en",
    )))
    g.add((OPDA.AttachedDocument, SKOS.scopeNote, Literal(
        "UFO: Information Object (Guizzardi 2005 Ch. 4 §4.2 — an information "
        "artefact). PROV-O: Entity (W3C PROV-O REC §3.2). The neutral "
        "document bearer per ODR-0024 R7 — the one genuine Kind in the "
        "evidence family (ODR-0027 §R6); a document plays the evidence role "
        "(opda:evidenceType), it is not sub-classed into it.",
        lang="en",
    )))
    g.add((OPDA.AttachedDocument, DCTERMS.source, _ODR_0024_R7))

    # --- Evidence kind: a coded isMemberOf classification, NOT subclasses ---
    # ODR-0027 §R6 (directing-authority adoption of the hm approach;
    # supersedes session-036): "evidence is a role a document plays" → a Role is
    # never rdfs:subClassOf a Kind (ODR-0027 §R3). The former
    # DocumentEvidence / ElectronicRecordEvidence / VouchEvidence subclasses are
    # RETIRED. Evidence-kind is the coded opda:evidenceType facet (→
    # opda:EvidenceMethodScheme, the OIDC4IDA evidence.type value-space);
    # kind-specific attributes (opda:attestedBy for vouches, document/record
    # specifics) are facets borne by opda:Evidence (ODR-0027 §R2), enforced
    # value-keyed on opda:evidenceType (opda:EvidenceFacetShape, ADR-0012). The
    # short names Document/Electronic-Record/Vouch live as skos:Concept notations
    # in opda:EvidenceMethodScheme, never as opda: classes.

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
    # A facet borne by an opda:Evidence playing the vouch role (ODR-0027 §R2);
    # rdfs:domain opda:Evidence (documentary, ODR-0026 §R2) — the vouch-only
    # obligation is enforced VALUE-keyed on opda:evidenceType="Vouch" by
    # opda:EvidenceFacetShape (ADR-0012), not by a VouchEvidence subclass.
    g.add((OPDA.attestedBy, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.attestedBy, RDFS.domain, OPDA.Evidence))
    g.add((OPDA.attestedBy, RDFS.range, PROV.Agent))
    g.add((OPDA.attestedBy, RDFS.label, Literal("attested by", lang="en")))
    g.add((OPDA.attestedBy, RDFS.comment, Literal(
        "Vouch → Agent attestation join. A facet borne by evidence playing "
        "the vouch role (opda:evidenceType 'Vouch'); mirror of "
        "prov:wasAttributedTo for vouch-specific use. The voucher's role (e.g. "
        "opda:VoucherRole) is captured via prov:qualifiedAttribution → "
        "prov:Attribution → prov:hadRole per S009 Q2 qualified-form "
        "discipline. Presence is required value-keyed when evidenceType='Vouch' "
        "(opda:EvidenceFacetShape, ADR-0012).",
        lang="en",
    )))
    g.add((OPDA.attestedBy, DCTERMS.source, _ODR_0009_Q1))

    # --- DatatypeProperty: opda:evidenceType (the isMemberOf classifier) -
    # ODR-0027 §R6: the coded evidence-KIND classification that replaced both
    # the retired short-name aliases (session-035) AND the retired …Evidence
    # subclass tree. Value = an opda:EvidenceMethodScheme member notation
    # (OIDC4IDA evidence.type). Validated by opda:EvidenceTypeValueShape (sh:in
    # the scheme, via sh:targetSubjectsOf — the opda:ownerType value-space
    # idiom) + opda:EvidenceFacetShape (the value-keyed per-kind obligations).
    # rdfs:range is documentary (ODR-0026 §R2); the real constraint is SHACL.
    g.add((OPDA.evidenceType, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.evidenceType, RDFS.domain, OPDA.Evidence))
    g.add((OPDA.evidenceType, RDFS.range, XSD.string))
    g.add((OPDA.evidenceType, RDFS.label, Literal("evidence type", lang="en")))
    g.add((OPDA.evidenceType, RDFS.comment, Literal(
        "The OIDC4IDA acquisition kind of a piece of evidence — the "
        "opda:EvidenceMethodScheme member notation (Document / "
        "Electronic-Record / Vouch). The governed isMemberOf classifier "
        "(ODR-0027 §R6) that states the evidence kind WITHOUT a subclass tree "
        "(a Role is never rdfs:subClassOf a Kind); it replaced the retired "
        "short-name aliases and the retired …Evidence subclasses. Validated by "
        "opda:EvidenceTypeValueShape (sh:in the scheme, via "
        "sh:targetSubjectsOf — the opda:ownerType value-space idiom). "
        "rdfs:domain/range are documentary (ODR-0026 §R2); the real "
        "constraint is SHACL.",
        lang="en",
    )))
    g.add((OPDA.evidenceType, DCTERMS.source, _ODR_0009_Q1))

    return g
