"""
Module data_dictionary.

Realises:
- ADR-0007 §"Input layer" — parses `data-dictionary-canonical.json` as the
  schema-leaf authority (term-sourcing tier 4 of the ODR-0004 §7a five-line
  precedence).
- ADR-0008 §"Repository structure" — `inputs/data_dictionary.py` per layout.
- ODR-0004 §Rules.7 — the dictionary supplies `rdfs:comment`, datatype ranges,
  and cardinality for the mechanical slot → DatatypeProperty emission half
  (ODR-0004 §Rules.6 generator-first).
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class DictionaryLeaf:
    """A single canonical leaf. Tier-4 source per ODR-0004 §7a."""

    leaf_path: str
    datatype: str | None
    comment: str | None
    cardinality: str | None
    source_iri: str
    extras: dict = field(default_factory=dict)


def load_canonical(path: Path) -> dict[str, DictionaryLeaf]:
    """Parse `data-dictionary-canonical.json` → leaf-path → DictionaryLeaf.

    Tolerates two common shapes:
      - flat list of leaf records each with `path`/`type`/`comment`
      - dict keyed by leaf path with value-records
    """
    data = json.loads(path.read_text(encoding="utf-8"))
    leaves: dict[str, DictionaryLeaf] = {}
    if isinstance(data, dict):
        items = (
            (k, v if isinstance(v, dict) else {"comment": v}) for k, v in data.items()
        )
    else:
        items = ((rec.get("path") or rec.get("leaf"), rec) for rec in data)
    for leaf_path, rec in items:
        if not leaf_path:
            continue
        leaves[leaf_path] = DictionaryLeaf(
            leaf_path=leaf_path,
            datatype=rec.get("type") or rec.get("datatype"),
            comment=rec.get("comment") or rec.get("description"),
            cardinality=rec.get("cardinality"),
            source_iri=rec.get("source") or f"dict:{leaf_path}",
            extras={
                k: v
                for k, v in rec.items()
                if k
                not in {"path", "leaf", "type", "datatype", "comment", "description",
                        "cardinality", "source"}
            },
        )
    return leaves
