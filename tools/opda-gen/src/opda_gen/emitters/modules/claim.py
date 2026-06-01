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

# ODR-0024 R7 (council session-028 Q7) — the neutral opda:AttachedDocument
# bearer. A registry-attached document (titlesToBeSold[].additionalDocuments[])
# is NOT evidence: binding its filing-metadata to opda:DocumentEvidence (≡
# opda:Document) would entail eIDAS-Substantial assurance on EVERY attached doc.
# R7 introduces a neutral document Kind; DocumentEvidence becomes its
# evidence-playing subclass.
_ODR_0024_R7 = URIRef("https://w3id.org/opda/odr/ODR-0024#section-Rules-R7")


CLASSES = (
    OPDA.AssuranceLevel,
    OPDA.AttachedDocument,
    OPDA.Claim,
    OPDA.DocumentEvidence,
    OPDA.ElectronicRecordEvidence,
    OPDA.Evidence,
    OPDA.TrustFramework,
    OPDA.VerificationActivity,
    OPDA.VouchEvidence,
)

OBJECT_PROPERTIES = (
    OPDA.attestedBy,
    OPDA.supportedBy,
)

# Council session-035: the OIDC4IDA evidence-kind facet is the existing
# opda:EvidenceMethodScheme; each evidence subclass binds to its scheme concept
# by skos:exactMatch (ODR-0011 §8a Substance-Kind-label — NEVER owl:sameAs).
_EVIDENCE_KIND_DOCUMENT = OPDA["evidenceMethod/Document"]
_EVIDENCE_KIND_RECORD = OPDA["evidenceMethod/Electronic-Record"]
_EVIDENCE_KIND_VOUCH = OPDA["evidenceMethod/Vouch"]

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

    # --- opda:Evidence — RoleMixin over prov:Entity (ODR-0009 §Q1;
    #     recast per Council session-035) --------------------------------
    # session-035: evidence-hood is anti-rigid (a document is evidence only
    # qua a VerificationActivity using it) → opda:Evidence is a cross-categorial
    # RoleMixin founded by the verification (the ODR-0006 Seller/Buyer pattern),
    # additively typed alongside owl:Class (punning, as Seller/Buyer). The three
    # subtypes stay as rigid structure-bearers (they partition by provenance
    # ORIGIN). The evidence-KIND discriminator is the SKOS facet opda:evidenceType
    # → opda:EvidenceMethodScheme, with per-subtype validation emitted by
    # ADR-0012 (opda:EvidenceFacetShape). Short names retired (were
    # owl:equivalentClass aliases) → skos:altLabel on each canonical class.
    g.add((OPDA.Evidence, RDF.type, OWL.Class))
    g.add((OPDA.Evidence, RDF.type, OPDA.RoleMixin))
    g.add((OPDA.Evidence, RDFS.subClassOf, PROV.Entity))
    g.add((OPDA.Evidence, RDFS.label, Literal("Evidence", lang="en")))
    g.add((OPDA.Evidence, RDFS.comment, Literal(
        "Evidence supporting a Claim. UFO RoleMixin (anti-rigid, "
        "cross-categorial — a bearer is evidence only qua a "
        "VerificationActivity using it; ODR-0006 Seller/Buyer pattern); "
        "PROV-O Entity. Three named subtypes per S009 Rule 5 (do NOT "
        "collapse): DocumentEvidence (paper/scanned artefacts); "
        "ElectronicRecordEvidence (API-retrieved structured records); "
        "VouchEvidence (an Agent-founded attestation, a Relator — not a "
        "document). The acquisition method is a coded facet "
        "(opda:evidenceType → opda:EvidenceMethodScheme, OIDC4IDA); per-kind "
        "obligations are validated VALUE-KEYED by opda:EvidenceFacetShape "
        "(sh:targetSubjectsOf opda:evidenceType + sh:or material implication; "
        "ADR-0012; Council session-036), with type↔value coherence enforced by "
        "the opda:*CoherenceShape family.",
        lang="en",
    )))
    g.add((OPDA.Evidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). The three subtypes "
        "correspond to OIDC4IDA / eIDAS evidence categories (S009 Rule 5).",
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
        "the eIDAS-assurance commitment opda:DocumentEvidence carries "
        "(ODR-0024 R7 / session-028 Q7 — reusing the evidence class as the "
        "bearer would entail every attached doc is Substantial-tier evidence). "
        "IC: individuated by its content + issuing activity (the artefact the "
        "registry holds), NOT by documentTypeCode / documentDate (mutable "
        "descriptive facets, not an identity principle). opda:DocumentEvidence "
        "is its evidence-playing subclass — an attached document stands as "
        "evidence only under ODR-0009, never by mere attachment.",
        lang="en",
    )))
    g.add((OPDA.AttachedDocument, SKOS.scopeNote, Literal(
        "UFO: Information Object (Guizzardi 2005 Ch. 4 §4.2 — an information "
        "artefact). PROV-O: Entity (W3C PROV-O REC §3.2). The neutral "
        "document bearer per ODR-0024 R7; opda:DocumentEvidence ⊑ "
        "opda:AttachedDocument (evidence is a role a document plays, not the "
        "document's Kind).",
        lang="en",
    )))
    g.add((OPDA.AttachedDocument, DCTERMS.source, _ODR_0024_R7))

    # --- opda:DocumentEvidence + opda:Document equivalence --------------
    # ODR-0024 R7: DocumentEvidence ⊑ opda:AttachedDocument (the neutral
    # bearer above) — the evidence-playing subclass. The owl:equivalentClass
    # opda:Document alias is PRESERVED (exemplar short-name; ADR-0011); only the
    # bearer of the four filing-metadata props moved to opda:AttachedDocument so
    # plain attached docs are no longer entailed to be eIDAS evidence.
    g.add((OPDA.DocumentEvidence, RDF.type, OWL.Class))
    g.add((OPDA.DocumentEvidence, RDFS.subClassOf, OPDA.Evidence))
    g.add((OPDA.DocumentEvidence, RDFS.subClassOf, OPDA.AttachedDocument))
    g.add((OPDA.DocumentEvidence, RDFS.label,
           Literal("Document Evidence", lang="en")))
    g.add((OPDA.DocumentEvidence, RDFS.comment, Literal(
        "Document-evidence subtype — paper or scanned artefacts issued by "
        "authoritative source (e.g. grant of probate by HMCTS). eIDAS "
        "Substantial-tier assurance for court-issued instruments. A subclass "
        "of opda:AttachedDocument (the neutral document Kind; ODR-0024 R7) — "
        "evidence is a role a document plays, not every document's Kind. "
        "Evidence kind 'Document' is carried as the opda:evidenceType facet "
        "(skos:exactMatch the OIDC4IDA scheme concept); the short name "
        "'Document' is a skos:altLabel, not a class (Council session-035 "
        "retired the owl:equivalentClass alias).",
        lang="en",
    )))
    g.add((OPDA.DocumentEvidence, SKOS.altLabel, Literal("Document", lang="en")))
    g.add((OPDA.DocumentEvidence, SKOS.exactMatch, _EVIDENCE_KIND_DOCUMENT))
    g.add((OPDA.DocumentEvidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). OIDC4IDA / eIDAS "
        "document-evidence category (S009 Rule 5).",
        lang="en",
    )))
    g.add((OPDA.DocumentEvidence, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:ElectronicRecordEvidence + opda:ElectronicRecord ----------
    g.add((OPDA.ElectronicRecordEvidence, RDF.type, OWL.Class))
    g.add((OPDA.ElectronicRecordEvidence, RDFS.subClassOf, OPDA.Evidence))
    g.add((OPDA.ElectronicRecordEvidence, RDFS.label,
           Literal("Electronic Record Evidence", lang="en")))
    g.add((OPDA.ElectronicRecordEvidence, RDFS.comment, Literal(
        "Electronic-record evidence subtype — API-retrieved structured "
        "records from authoritative source (e.g. HMRC tax-record API). "
        "eIDAS Substantial-tier assurance via real-time API verification. "
        "Evidence kind 'Electronic-Record' is carried as the opda:evidenceType "
        "facet (skos:exactMatch the OIDC4IDA scheme concept); the short name "
        "'ElectronicRecord' is a skos:altLabel, not a class (Council "
        "session-035 retired the owl:equivalentClass alias).",
        lang="en",
    )))
    g.add((OPDA.ElectronicRecordEvidence, SKOS.altLabel,
           Literal("ElectronicRecord", lang="en")))
    g.add((OPDA.ElectronicRecordEvidence, SKOS.exactMatch, _EVIDENCE_KIND_RECORD))
    g.add((OPDA.ElectronicRecordEvidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). OIDC4IDA "
        "electronic-record evidence category (S009 Rule 5).",
        lang="en",
    )))
    g.add((OPDA.ElectronicRecordEvidence, DCTERMS.source, _ODR_0009_Q1))

    # --- opda:VouchEvidence — an Agent-founded attestation Relator ------
    # Council session-035: categorially ≠ the document/record evidences — a
    # vouch is prov:wasAttributedTo an Agent (an attestation binding Agent ↔
    # Claim = a Relator, two-relata dependence), NOT an Information Object.
    # Additively typed opda:Relator (punning, as Transaction/Proprietorship).
    # This is WHY S009 R5 "do NOT collapse the three" is correct.
    g.add((OPDA.VouchEvidence, RDF.type, OWL.Class))
    g.add((OPDA.VouchEvidence, RDF.type, OPDA.Relator))
    g.add((OPDA.VouchEvidence, RDFS.subClassOf, OPDA.Evidence))
    g.add((OPDA.VouchEvidence, RDFS.label,
           Literal("Vouch Evidence", lang="en")))
    g.add((OPDA.VouchEvidence, RDFS.comment, Literal(
        "Vouch evidence subtype — formal attestation by a regulated "
        "professional (e.g. SRA-licensed solicitor). Qualitatively "
        "weaker than document or electronic-record evidence; eIDAS Low "
        "assurance regardless of voucher quality (Q3 SKOS scheme). The "
        "vouch is prov:wasAttributedTo an Agent — an attestation (a UFO "
        "Relator binding Agent ↔ Claim), NOT a document derivation; this is "
        "why the three evidence subtypes must not be collapsed (S009 R5). "
        "Evidence kind 'Vouch' is carried as the opda:evidenceType facet "
        "(skos:exactMatch the OIDC4IDA scheme concept); the short name "
        "'Vouch' is a skos:altLabel, not a class (session-035 retired the "
        "owl:equivalentClass alias).",
        lang="en",
    )))
    g.add((OPDA.VouchEvidence, SKOS.altLabel, Literal("Vouch", lang="en")))
    g.add((OPDA.VouchEvidence, SKOS.exactMatch, _EVIDENCE_KIND_VOUCH))
    g.add((OPDA.VouchEvidence, SKOS.scopeNote, Literal(
        "PROV-O: Entity (W3C PROV-O REC §3.2). UFO: Relator (Guizzardi 2005 "
        "Ch. 4 §4.5 — agent-founded attestation). OIDC4IDA / eIDAS "
        "vouch-evidence category (S009 Rule 5).",
        lang="en",
    )))
    g.add((OPDA.VouchEvidence, DCTERMS.source, _ODR_0009_Q1))

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

    # --- ObjectProperty: opda:evidenceType (Council session-035) --------
    # The governed evidence-KIND facet: replaces the retired short-name
    # owl:equivalentClass aliases. Range is a skos:Concept from
    # opda:EvidenceMethodScheme (OIDC4IDA evidence.type). Validated by
    # opda:EvidenceFacetShape (sh:in the scheme members + per-kind
    # sh:qualifiedValueShape dispatch; ADR-0012). rdfs:range is documentary
    # under ODR-0026 §R2 (model-but-don't-evaluate); the real constraint is SHACL.
    g.add((OPDA.evidenceType, RDF.type, OWL.DatatypeProperty))
    g.add((OPDA.evidenceType, RDFS.domain, OPDA.Evidence))
    g.add((OPDA.evidenceType, RDFS.range, XSD.string))
    g.add((OPDA.evidenceType, RDFS.label, Literal("evidence type", lang="en")))
    g.add((OPDA.evidenceType, RDFS.comment, Literal(
        "The OIDC4IDA acquisition kind of a piece of evidence — the "
        "opda:EvidenceMethodScheme member notation (Document / "
        "Electronic-Record / Vouch). The governed, extensible discriminator "
        "that replaced the retired short-name owl:equivalentClass aliases "
        "(Council session-035), validated by opda:EvidenceTypeValueShape "
        "(sh:in the scheme, via sh:targetSubjectsOf — the opda:ownerType "
        "value-space idiom). Each evidence subclass skos:exactMatch-es its "
        "scheme concept (ODR-0011 §8a), so rdf:type dispatch and coded-value "
        "dispatch stay interoperable. rdfs:domain is documentary "
        "(ODR-0026 §R2); the real constraint is SHACL.",
        lang="en",
    )))
    g.add((OPDA.evidenceType, DCTERMS.source, _ODR_0009_Q1))

    return g
