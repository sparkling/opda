"""
Tests for the term-sourcing five-line precedence resolver.

Realises:
- ADR-0008 §"Confirmation" #3 — term-sourcing test in the test suite.
- ADR-0007 §"Term-sourcing five-line precedence" — five-tier resolver
  invariants verified here.
- ODR-0004 §7a — five-line precedence (W3C > OPDA TF > regulator >
  glossary > schema-leaf).

Five precedence cases:
  1. tier 1 — W3C term resolves to W3C_REGISTRY.
  2. tier 2 — OPDA TF term resolves to OPDA_TF_REGISTRY.
  3. tier 3 — glossary-only term resolves to glossary record.
  4. tier 4 — dictionary-only term resolves to dictionary record.
  5. tier 5 — external regulator term resolves with kind="contextual".
Plus: unsourceable term raises `UnsourceableTerm`.
"""

from __future__ import annotations

import pytest

from opda_gen.inputs.data_dictionary import DictionaryLeaf
from opda_gen.inputs.glossary import GlossaryTerm
from opda_gen.term_sourcing import (
    UnsourceableTerm,
    resolve_term,
)


def test_tier1_w3c() -> None:
    r = resolve_term("rdfs:label")
    assert r.tier == 1
    assert r.kind == "authoritative"
    assert "rdf-schema" in r.source_url


def test_tier2_opda_tf() -> None:
    r = resolve_term("pdtf:aggregator")
    assert r.tier == 2
    assert r.kind == "authoritative"
    assert "trust.propdata.org.uk" in r.source_url


def test_tier3_glossary() -> None:
    glossary = {
        "opda-glossary:propertyPack": GlossaryTerm(
            term_id="opda-glossary:propertyPack",
            pref_label="Property Pack",
            definition="An OPDA-canonical bundle.",
            source_iri="https://openpropdata.org.uk/glossary/propertyPack",
        )
    }
    r = resolve_term("opda-glossary:propertyPack", glossary=glossary)
    assert r.tier == 3
    assert r.kind == "authoritative"
    assert "openpropdata" in r.source_url


def test_tier4_dictionary() -> None:
    dictionary = {
        "propertyPack.uprn": DictionaryLeaf(
            leaf_path="propertyPack.uprn",
            datatype="xsd:string",
            comment="Unique Property Reference Number.",
            cardinality="0..1",
            source_iri="https://openpropdata.org.uk/dict/propertyPack.uprn",
        )
    }
    r = resolve_term("propertyPack.uprn", dictionary=dictionary)
    assert r.tier == 4
    assert r.kind == "authoritative"


def test_tier5_external_regulator_contextual() -> None:
    r = resolve_term("fca:ConductOfBusinessRule")
    assert r.tier == 5
    assert r.kind == "contextual"
    assert "fca" in r.source_url


def test_unsourceable_raises() -> None:
    with pytest.raises(UnsourceableTerm):
        resolve_term("nonexistent:term-not-anywhere")


def test_precedence_w3c_beats_glossary() -> None:
    """If a term is in W3C registry AND in glossary, W3C wins (tier 1)."""
    glossary = {
        "rdfs:label": GlossaryTerm(
            term_id="rdfs:label",
            pref_label="Should-not-win",
            definition="Glossary version.",
            source_iri="https://example.invalid/should-not-win",
        )
    }
    r = resolve_term("rdfs:label", glossary=glossary)
    assert r.tier == 1
    assert "example.invalid" not in r.source_url
