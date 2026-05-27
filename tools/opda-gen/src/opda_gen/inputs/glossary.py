"""
Module glossary.

Realises:
- ADR-0007 §"Input layer" — parses `business-glossary.ttl` + `glossary-merged.json`
  as the project-internal ubiquitous-language authority (term-sourcing tier 3 of
  the ODR-0004 §7a five-line precedence).
- ADR-0008 §"Repository structure" — `inputs/glossary.py` per the package layout.
- ODR-0004 §Rules.7 — every minted term draws `rdfs:label` / `skos:prefLabel` /
  `skos:definition` from the glossary when not pre-empted by a higher tier.

The parser is intentionally minimal: it loads one or both inputs and exposes a
dict-of-records by term id. Emitters (ADR-0009+) consume the records.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from rdflib import Graph, Namespace
from rdflib.namespace import RDF, SKOS


PDTF = Namespace("https://trust.propdata.org.uk/vocab/")


@dataclass(frozen=True)
class GlossaryTerm:
    """A single glossary entry. Tier-3 source per ODR-0004 §7a."""

    term_id: str
    pref_label: str | None
    definition: str | None
    source_iri: str


def load_ttl(path: Path) -> dict[str, GlossaryTerm]:
    """Parse `business-glossary.ttl` and return term-id → GlossaryTerm."""
    g = Graph()
    g.parse(str(path), format="turtle")
    terms: dict[str, GlossaryTerm] = {}
    for subj in g.subjects(RDF.type, SKOS.Concept):
        term_id = str(subj).split("/")[-1]
        pref = g.value(subj, SKOS.prefLabel)
        defn = g.value(subj, SKOS.definition)
        terms[term_id] = GlossaryTerm(
            term_id=term_id,
            pref_label=str(pref) if pref is not None else None,
            definition=str(defn) if defn is not None else None,
            source_iri=str(subj),
        )
    return terms


def load_merged_json(path: Path) -> dict[str, GlossaryTerm]:
    """Parse `glossary-merged.json` and return term-id → GlossaryTerm.

    Tolerates two common shapes:
      - flat list of `{id, prefLabel, definition}` records
      - dict keyed by term id with value-records
    """
    data = json.loads(path.read_text(encoding="utf-8"))
    records: Iterable[dict]
    if isinstance(data, dict):
        records = (
            {"id": k, **(v if isinstance(v, dict) else {"prefLabel": v})}
            for k, v in data.items()
        )
    else:
        records = data
    terms: dict[str, GlossaryTerm] = {}
    for record in records:
        term_id = record.get("id") or record.get("term_id") or record.get("key")
        if not term_id:
            continue
        terms[term_id] = GlossaryTerm(
            term_id=term_id,
            pref_label=record.get("prefLabel") or record.get("label"),
            definition=record.get("definition") or record.get("comment"),
            source_iri=record.get("source") or f"glossary:{term_id}",
        )
    return terms
