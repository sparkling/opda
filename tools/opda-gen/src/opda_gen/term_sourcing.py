"""
Module term_sourcing.

Realises:
- ADR-0007 §"Term-sourcing five-line precedence" (amended 2026-05-27 per
  G1) — five-tier resolver implementing ODR-0004 §7a slot ordering exactly:
  slot 1 = W3C / external spec (authoritative); slot 2 = OPDA Trust Framework
  (authoritative); slot 3 = other regulatory authorities (**contextual, not
  authoritative**); slot 4 = OPDA business glossary (authoritative);
  slot 5 = data-dictionary schema-leaf (authoritative).
- ADR-0008 §"Repository structure" — `term_sourcing.py` per layout.
- ODR-0004 §Rules.7 — every minted term carries `dct:source`; precedence:
  W3C spec > business glossary > schema text.
- ODR-0004 §7a — five-line precedence (Knublauch DA's full demand); G1
  closure-amendment 2026-05-27 corrected the slot order in this module
  to match §7a verbatim. Prior (pre-G1) code wrongly placed glossary at
  tier 3 and regulators at tier 5 and marked regulators "tier 5";
  §7a places regulators at slot 3 (contextual) and glossary at slot 4
  (authoritative). This module now matches.

Contract:

- `resolve_term(...)` returns a `ResolvedTerm` dataclass with:
  - `primary` (`SourceRecord | None`) — the chosen authoritative slot's
    record from slots 1 / 2 / 4 / 5 (whichever wins). Resolution stops at
    the highest-tier match.
  - `contextual` (`list[SourceRecord]`) — slot-3 regulator records, always
    evaluated and appended when the term appears in the regulator registry
    (zero or more entries; an empty list when no regulator citation
    exists). Always evaluated regardless of whether the primary resolved,
    so the emitter can attach `skos:scopeNote` / `skos:closeMatch`
    citations even when primary came from W3C / TF / glossary.
  - `term_id` — the input term id (for traceability).
- `SourceRecord.kind` is `"authoritative"` for tiers 1, 2, 4, 5 and
  `"contextual"` for tier 3.
- `UnsourceableTerm` is raised only when neither a primary slot resolves
  nor any contextual slot matches (i.e. the term is completely unknown).
  A term known only as a slot-3 regulator entry resolves successfully:
  `primary` is None, `contextual` has the regulator record, and downstream
  emitters render it as `skos:closeMatch`/`skos:scopeNote` per the
  consuming ODR's discipline (most commonly ODR-0011 §4a regulator-citation
  pattern).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Mapping

from opda_gen.inputs.data_dictionary import DictionaryLeaf


class UnsourceableTerm(Exception):
    """Raised when no precedence slot can supply a source for a term.

    Per ADR-0007 §"Term-sourcing five-line precedence" the generator MUST
    fail on unresolved terms; the build-pipeline error names the term
    verbatim. Slot-3-only (regulator-only) terms do NOT raise — they
    resolve with `primary=None` and a non-empty `contextual` list.
    """


@dataclass(frozen=True)
class SourceRecord:
    """The result of a single-slot term-sourcing lookup."""

    term_id: str
    source_url: str
    source_text: str
    tier: int
    kind: str  # "authoritative" | "contextual"


@dataclass(frozen=True)
class ResolvedTerm:
    """The result of a multi-slot `resolve_term` lookup.

    Per ODR-0004 §7a, primary and contextual citations are emitted into
    different RDF predicates: the primary's `source_url` becomes
    `dct:source` on the minted term; each contextual entry becomes
    `skos:scopeNote` or `skos:closeMatch` by the emitter's discretion.
    """

    term_id: str
    primary: SourceRecord | None
    contextual: list[SourceRecord] = field(default_factory=list)


# --- Slot-1 W3C / external standard registry (minimal bootstrap) ---------
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


# --- Slot-2 OPDA Trust Framework registry (bootstrap) --------------------
# Per ODR-0004 §7a: "treated as W3C-equivalent for terms the TF defines".
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


# --- Slot-3 external regulator registry (contextual; not authoritative) --
# Per ODR-0004 §7a: contextual citations rendered via `skos:scopeNote` or
# `skos:closeMatch`, never as `dct:source`. The kind is recorded
# explicitly so emitters can branch on it. These entries are appended to
# `ResolvedTerm.contextual` even when primary resolved from slot 1, 2, 4,
# or 5 — slot-3 is always evaluated.
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


def _primary_lookup(
    term_id: str,
    glossary: Mapping[str, object] | None,
    dictionary: Mapping[str, object] | None,
) -> SourceRecord | None:
    """Resolve `term_id` against slots 1, 2, 4, 5 (in that order).

    Returns the first authoritative hit or `None`. Slot 3 (regulator) is
    explicitly skipped here because it is contextual, never primary.
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
        return SourceRecord(term_id, url, text, tier=4, kind="authoritative")
    if dictionary and term_id in dictionary:
        record = dictionary[term_id]
        url = getattr(record, "source_iri", None) or f"dict:{term_id}"
        text = getattr(record, "comment", None) or term_id
        return SourceRecord(term_id, url, text, tier=5, kind="authoritative")
    return None


def _contextual_lookup(term_id: str) -> list[SourceRecord]:
    """Resolve `term_id` against slot 3 (regulator registry).

    Returns a list of contextual records (zero or more). Always evaluated
    regardless of whether the primary resolved. Currently the registry
    maps one term to one record so the list is at most one element; the
    multi-element shape is preserved for forward-compatibility with
    regulators that may publish overlapping citations (e.g. ICO + FCA on
    AML rule X).
    """
    if term_id in EXTERNAL_REGULATORS:
        url, text = EXTERNAL_REGULATORS[term_id]
        return [SourceRecord(term_id, url, text, tier=3, kind="contextual")]
    return []


def resolve_term(
    term_id: str,
    glossary: Mapping[str, object] | None = None,
    dictionary: Mapping[str, object] | None = None,
) -> ResolvedTerm:
    """Resolve `term_id` against ODR-0004 §7a's five-slot precedence.

    Slot order (per §7a verbatim):
      1. W3C / external spec — authoritative.
      2. OPDA Trust Framework — authoritative.
      3. Other regulatory authorities — **contextual** (skos:scopeNote /
         skos:closeMatch). Always evaluated; appended to
         `ResolvedTerm.contextual`.
      4. OPDA business glossary — authoritative.
      5. Data-dictionary schema-leaf — authoritative.

    The chosen `primary` is the highest-tier authoritative slot that
    matched (resolution stops at first hit). Slot 3 is **always** evaluated
    so emitters can attach regulator citations regardless of where the
    primary came from.

    Raises `UnsourceableTerm` when no slot matches at all (i.e. the term
    appears in neither the W3C/TF/glossary/dictionary slots nor the
    regulator slot).
    """
    primary = _primary_lookup(term_id, glossary, dictionary)
    contextual = _contextual_lookup(term_id)
    if primary is None and not contextual:
        raise UnsourceableTerm(
            f"No precedence slot supplies a source for term: {term_id!r}"
        )
    return ResolvedTerm(
        term_id=term_id, primary=primary, contextual=contextual
    )


# --- Schema-leaf-path sourcing (ODR-0022 gate G2 / ODR-0008 §Q3a) --------
# A descriptive datatype property's `dct:source` MUST point at its **schema
# leaf path** (the form-question IRI), NOT at the deciding ODR section. For
# a leaf that spans overlays, `dct:source` is a **per-overlay array** — one
# form-question IRI per `(overlay, leaf-path)` pair — giving the lossless
# audit in both directions that ODR-0008 §Q3a requires. The IRI follows the
# `…/forms/<overlay>#<leaf.path>` shape ratified for per-leaf provenance
# (ADR-0029 §"ODR-0010 canonical mapping" Rule 4; ADR-0028 §"the walk"),
# minted under the stable `w3id.org/opda` redirect (ODR-0004 §1 base).
_SCHEMA_LEAF_AUTHORITY = "https://opda.org.uk/pdtf/harness/forms"


def schema_leaf_source(overlay: str, leaf_path: str) -> str:
    """Mint the schema-leaf-path (form-question) IRI for one overlay leaf.

    `overlay` is the data-dictionary `source` (e.g. ``"baspi5"``,
    ``"pdtf-transaction"``); `leaf_path` is its dotted JSON path (e.g.
    ``"propertyPack.buildInformation.building.builtForm"``). Per ODR-0022
    G2 this is what a descriptive property's `dct:source` points at — never
    the deciding ODR section.
    """
    return f"{_SCHEMA_LEAF_AUTHORITY}/{overlay}#{leaf_path}"


def schema_leaf_sources(
    name: str, dictionary: Mapping[str, DictionaryLeaf]
) -> list[str]:
    """Resolve the per-overlay-leaf-path `dct:source` array for `name`.

    Returns every `(overlay, leaf-path)` form-question IRI whose leaf-path's
    last segment is `name` — the spanning-leaf array of ODR-0008 §Q3a ("one
    per overlay leaf-path"). The leaf's recorded `source` overlay is read
    from `DictionaryLeaf.source_iri` (where `load_canonical` deposits the
    canonical `source` field). The result is sorted for deterministic
    (byte-identical) emission. An empty list means the dictionary carries no
    leaf for `name` (the caller decides whether that is a defect or an
    out-of-dictionary term).
    """
    sources: set[str] = set()
    for leaf in dictionary.values():
        if leaf.leaf_path.split(".")[-1] != name:
            continue
        # `source_iri` holds the canonical `source` overlay id (e.g.
        # "baspi5") for canonical leaves; fall back to the dict: stub form
        # when a leaf predates the overlay annotation.
        overlay = leaf.source_iri
        sources.add(schema_leaf_source(overlay, leaf.leaf_path))
    return sorted(sources)
