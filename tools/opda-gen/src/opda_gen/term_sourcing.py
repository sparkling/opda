"""
Module term_sourcing.

Realises:
- ADR-0007 §"Term-sourcing five-line precedence" — five-tier resolver: W3C spec
  > OPDA Trust Framework > business glossary > data dictionary > external
  regulator. Generator MUST resolve each term against this precedence and emit
  `dct:source` to the authoritative origin.
- ADR-0008 §"Repository structure" — `term_sourcing.py` per layout.
- ODR-0004 §Rules.7 — every minted term carries `dct:source`; precedence:
  W3C spec > business glossary > schema text.
- ODR-0004 §7a — five-line precedence (Knublauch DA's full demand): W3C >
  OPDA TF > regulator (contextual) > glossary > schema-leaf. NOTE: ODR-0004
  §7a re-orders Knublauch's five lines such that "other regulatory authorities"
  is tier 3 *but is contextual, not authoritative*. The resolver below treats
  the five tiers as the canonical lookup order; downstream emitters
  (ADR-0009+) emit `skos:scopeNote` for tier-5 contextual sources per the
  programme plan's authoritative/contextual distinction.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping


class UnsourceableTerm(Exception):
    """Raised when no precedence tier can supply a source for a term.

    Per ADR-0007 §"Term-sourcing five-line precedence" the generator MUST fail
    on unresolved terms; the build-pipeline error names the term verbatim.
    """


@dataclass(frozen=True)
class SourceRecord:
    """The result of a term-sourcing lookup."""

    term_id: str
    source_url: str
    source_text: str
    tier: int
    kind: str  # "authoritative" | "contextual"


# --- Tier-1 W3C / external standard registry (minimal bootstrap) ---------
# Each entry pins an authoritative source URI per ODR-0004 §7a `dct:source`
# discipline (version-IRI preferred; generic "latest" IRIs are forbidden by
# the §7a `dct:source` URI rule).
W3C_REGISTRY: Mapping[str, tuple[str, str]] = {
    "dct:source": (
        "http://purl.org/dc/terms/source",
        "DCMI Terms — source",
    ),
    "dct:title": (
        "http://purl.org/dc/terms/title",
        "DCMI Terms — title",
    ),
    "dct:creator": (
        "http://purl.org/dc/terms/creator",
        "DCMI Terms — creator",
    ),
    "dct:issued": (
        "http://purl.org/dc/terms/issued",
        "DCMI Terms — issued",
    ),
    "dct:modified": (
        "http://purl.org/dc/terms/modified",
        "DCMI Terms — modified",
    ),
    "dct:relation": (
        "http://purl.org/dc/terms/relation",
        "DCMI Terms — relation",
    ),
    "rdfs:label": (
        "http://www.w3.org/2000/01/rdf-schema#label",
        "RDF Schema 1.1 — label",
    ),
    "rdfs:comment": (
        "http://www.w3.org/2000/01/rdf-schema#comment",
        "RDF Schema 1.1 — comment",
    ),
    "rdfs:domain": (
        "http://www.w3.org/2000/01/rdf-schema#domain",
        "RDF Schema 1.1 — domain",
    ),
    "rdfs:range": (
        "http://www.w3.org/2000/01/rdf-schema#range",
        "RDF Schema 1.1 — range",
    ),
    "rdfs:subClassOf": (
        "http://www.w3.org/2000/01/rdf-schema#subClassOf",
        "RDF Schema 1.1 — subClassOf",
    ),
    "owl:Class": (
        "http://www.w3.org/2002/07/owl#Class",
        "OWL 2 — Class",
    ),
    "owl:Ontology": (
        "http://www.w3.org/2002/07/owl#Ontology",
        "OWL 2 — Ontology",
    ),
    "owl:DatatypeProperty": (
        "http://www.w3.org/2002/07/owl#DatatypeProperty",
        "OWL 2 — DatatypeProperty",
    ),
    "owl:ObjectProperty": (
        "http://www.w3.org/2002/07/owl#ObjectProperty",
        "OWL 2 — ObjectProperty",
    ),
    "owl:versionIRI": (
        "http://www.w3.org/2002/07/owl#versionIRI",
        "OWL 2 — versionIRI",
    ),
    "owl:imports": (
        "http://www.w3.org/2002/07/owl#imports",
        "OWL 2 — imports",
    ),
    "skos:prefLabel": (
        "http://www.w3.org/2004/02/skos/core#prefLabel",
        "SKOS — prefLabel",
    ),
    "skos:definition": (
        "http://www.w3.org/2004/02/skos/core#definition",
        "SKOS — definition",
    ),
    "skos:scopeNote": (
        "http://www.w3.org/2004/02/skos/core#scopeNote",
        "SKOS — scopeNote",
    ),
    "skos:Concept": (
        "http://www.w3.org/2004/02/skos/core#Concept",
        "SKOS — Concept",
    ),
    "sh:NodeShape": (
        "https://www.w3.org/TR/2017/REC-shacl-20170720/#NodeShape",
        "SHACL 1.0 — NodeShape",
    ),
    "sh:PropertyShape": (
        "https://www.w3.org/TR/2017/REC-shacl-20170720/#PropertyShape",
        "SHACL 1.0 — PropertyShape",
    ),
    "sh:targetClass": (
        "https://www.w3.org/TR/2017/REC-shacl-20170720/#targetClass",
        "SHACL 1.0 — targetClass",
    ),
    "vann:preferredNamespacePrefix": (
        "http://purl.org/vocab/vann/preferredNamespacePrefix",
        "VANN — preferredNamespacePrefix",
    ),
    "vann:preferredNamespaceUri": (
        "http://purl.org/vocab/vann/preferredNamespaceUri",
        "VANN — preferredNamespaceUri",
    ),
}


# --- Tier-2 OPDA Trust Framework registry (bootstrap) --------------------
# Per ODR-0004 §7a: "treated as W3C-equivalent for terms the TF defines".
# Sample terms drawn from `source/00-deliverables/semantic-models/
# business-glossary.ttl` Trust Framework header block (terms tagged
# trust-framework-poc + technical-working-group). The full registry is
# expected to grow as ADR-0011 (module emission) lands; the bootstrap below is
# sufficient for the term-sourcing test fixtures and any downstream emitter
# wanting to resolve a TF-canonical term.
OPDA_TF_REGISTRY: Mapping[str, tuple[str, str]] = {
    "pdtf:GlossaryScheme": (
        "https://trust.propdata.org.uk/vocab/GlossaryScheme",
        "OPDA Trust Framework — Glossary Scheme",
    ),
    "pdtf:aggregator": (
        "https://trust.propdata.org.uk/vocab/aggregator",
        "OPDA Trust Framework — Aggregator",
    ),
    "pdtf:api": (
        "https://trust.propdata.org.uk/vocab/api",
        "OPDA Trust Framework — API",
    ),
    "pdtf:api-provider": (
        "https://trust.propdata.org.uk/vocab/api-provider",
        "OPDA Trust Framework — API Provider",
    ),
    "pdtf:application": (
        "https://trust.propdata.org.uk/vocab/application",
        "OPDA Trust Framework — Application",
    ),
    "pdtf:authentication": (
        "https://trust.propdata.org.uk/vocab/authentication",
        "OPDA Trust Framework — Authentication",
    ),
    "pdtf:authorisation": (
        "https://trust.propdata.org.uk/vocab/authorisation",
        "OPDA Trust Framework — Authorisation",
    ),
    "pdtf:certificate": (
        "https://trust.propdata.org.uk/vocab/certificate",
        "OPDA Trust Framework — Certificate",
    ),
    "pdtf:scheme-operator": (
        "https://trust.propdata.org.uk/vocab/scheme-operator",
        "OPDA Trust Framework — Scheme Operator",
    ),
    "pdtf:data-provider": (
        "https://trust.propdata.org.uk/vocab/data-provider",
        "OPDA Trust Framework — Data Provider",
    ),
    "pdtf:data-recipient": (
        "https://trust.propdata.org.uk/vocab/data-recipient",
        "OPDA Trust Framework — Data Recipient",
    ),
    "pdtf:participant": (
        "https://trust.propdata.org.uk/vocab/participant",
        "OPDA Trust Framework — Participant",
    ),
    "pdtf:role": (
        "https://trust.propdata.org.uk/vocab/role",
        "OPDA Trust Framework — Role",
    ),
    "pdtf:lei": (
        "https://trust.propdata.org.uk/vocab/lei",
        "OPDA Trust Framework — LEI (ISO 17442)",
    ),
}


# --- Tier-5 external regulator registry (contextual; not authoritative) --
# Per ODR-0004 §7a tier-5 entries become `skos:scopeNote` / `skos:closeMatch`
# rather than `dct:source`. The kind is recorded explicitly so emitters can
# branch on it.
EXTERNAL_REGULATORS: Mapping[str, tuple[str, str]] = {
    "fca:ConductOfBusinessRule": (
        "https://www.handbook.fca.org.uk/handbook/COBS/",
        "FCA Handbook — Conduct of Business Sourcebook",
    ),
    "ico:DataProtectionPrinciple": (
        "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/",
        "ICO UK GDPR guidance",
    ),
    "hmlr:RegisteredTitle": (
        "https://www.gov.uk/government/organisations/land-registry",
        "HM Land Registry — Registered Title",
    ),
}


def resolve_term(
    term_id: str,
    glossary: Mapping[str, object] | None = None,
    dictionary: Mapping[str, object] | None = None,
) -> SourceRecord:
    """Resolve `term_id` against the five-tier precedence.

    Order (ADR-0007 §"Term-sourcing five-line precedence"):
      1. W3C / external standard registry — authoritative.
      2. OPDA Trust Framework registry — authoritative.
      3. Business glossary (dict mapping term_id → record with `source_iri`).
      4. Data dictionary (dict mapping term_id → record with `source_iri`).
      5. External regulator registry — contextual.

    Raises `UnsourceableTerm` when no tier matches.
    """
    if term_id in W3C_REGISTRY:
        url, text = W3C_REGISTRY[term_id]
        return SourceRecord(term_id, url, text, tier=1, kind="authoritative")
    if term_id in OPDA_TF_REGISTRY:
        url, text = OPDA_TF_REGISTRY[term_id]
        return SourceRecord(term_id, url, text, tier=2, kind="authoritative")
    if glossary and term_id in glossary:
        record = glossary[term_id]
        url = getattr(record, "source_iri", None) or f"glossary:{term_id}"
        text = getattr(record, "pref_label", None) or term_id
        return SourceRecord(term_id, url, text, tier=3, kind="authoritative")
    if dictionary and term_id in dictionary:
        record = dictionary[term_id]
        url = getattr(record, "source_iri", None) or f"dict:{term_id}"
        text = getattr(record, "comment", None) or term_id
        return SourceRecord(term_id, url, text, tier=4, kind="authoritative")
    if term_id in EXTERNAL_REGULATORS:
        url, text = EXTERNAL_REGULATORS[term_id]
        return SourceRecord(term_id, url, text, tier=5, kind="contextual")
    raise UnsourceableTerm(
        f"No precedence tier supplies a source for term: {term_id!r}"
    )
