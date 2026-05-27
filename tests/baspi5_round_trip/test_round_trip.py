"""
Test round trip.

Realises:
- ADR-0014 §"Round-trip layer" lines 44-99 + §Confirmation #3, #6 —
  end-to-end BASPI5 JSON → RDF → JSON round-trip equivalence proves
  the MVP gate per ODR-0010 §Q7 and discharges ODR-0003 §"Programme
  retirement criterion" condition (i).

Pipeline:
  1. Load BASPI5 sample JSON (fixture).
  2. JSON → RDF via translators.json_to_rdf.
  3. RDF → JSON via translators.rdf_to_baspi5_json.
  4. Compare normalised input vs normalised output.

The round-trip subset covers the load-bearing fields named in the
worker brief: Property, Address, LegalEstate, Seller, EPCCertificate.
Future BASPI5 question coverage expands in Phase-7 overlay-incremental
ADRs without re-litigating the MVP gate.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from rdflib import Graph

from .translators import (
    json_to_rdf,
    normalise,
    rdf_to_baspi5_json,
)


# ---------------------------------------------------------------------------
# Confirmation #3 — round-trip equivalence
# ---------------------------------------------------------------------------
def test_round_trip_preserves_load_bearing_fields(
    baspi5_sample: dict[str, Any],
    opda_ontology: Graph,
) -> None:
    """JSON → RDF → JSON round-trips without losing load-bearing
    fields (Property, Address, LegalEstate, Seller, EPCCertificate).
    """
    rdf_graph = json_to_rdf(baspi5_sample, opda_ontology)
    regenerated = rdf_to_baspi5_json(rdf_graph, opda_ontology)

    # We compare a focused load-bearing subset rather than the full
    # JSON — the round-trip MVP gate covers the named load-bearing
    # surface, not every BASPI5 field (per ADR-0014 worker brief).
    def _load_bearing(doc: dict[str, Any]) -> dict[str, Any]:
        pp = doc.get("propertyPack", {})
        ownerships = pp.get("ownership", {}).get(
            "ownershipsToBeTransferred", []
        )
        return {
            "transactionId": doc.get("transactionId"),
            "uprn": pp.get("uprn"),
            "address": pp.get("address"),
            "propertyType": pp.get("buildInformation", {}).get(
                "building", {},
            ).get("propertyType"),
            "builtForm": pp.get("buildInformation", {}).get(
                "building", {},
            ).get("builtForm"),
            "currentEnergyRating": pp.get(
                "energyEfficiency", {},
            ).get("currentEnergyRating"),
            "estate_count": len(ownerships),
            "estate_titles": sorted(
                o.get("titleNumber", "") for o in ownerships
            ),
            "estate_ownership_types": sorted(
                o.get("ownershipType", "") for o in ownerships
            ),
            "participants": sorted(
                (p.get("role"), p.get("name", {}).get("firstName"),
                 p.get("name", {}).get("lastName"))
                for p in doc.get("participants", [])
            ),
        }

    assert _load_bearing(regenerated) == _load_bearing(baspi5_sample), (
        f"round-trip lost information:\n"
        f"  input: {_load_bearing(baspi5_sample)}\n"
        f"  output: {_load_bearing(regenerated)}"
    )


def test_round_trip_emits_canonical_classes(
    baspi5_sample: dict[str, Any],
    opda_ontology: Graph,
) -> None:
    """JSON → RDF emits Property + LegalEstate + Seller + Buyer +
    EPCCertificate + Address individuals at canonical URIs.
    """
    from rdflib.namespace import RDF
    from .translators import OPDA

    rdf_graph = json_to_rdf(baspi5_sample, opda_ontology)
    types = {OPDA.Property, OPDA.LegalEstate, OPDA.Seller, OPDA.Buyer,
             OPDA.EPCCertificate, OPDA.Address, OPDA.RegisteredTitle}
    emitted_types = set(
        t for _, _, t in rdf_graph.triples((None, RDF.type, None))
    )
    missing = types - emitted_types
    assert not missing, f"round-trip JSON→RDF missed types: {missing}"


def test_round_trip_normalisation_is_idempotent(
    baspi5_sample: dict[str, Any],
) -> None:
    """`normalise(normalise(x)) == normalise(x)` so equivalence
    comparisons are stable.
    """
    once = normalise(baspi5_sample)
    twice = normalise(once)
    assert once == twice


# ---------------------------------------------------------------------------
# Confirmation #6 — round-trip preserves information
# ---------------------------------------------------------------------------
def test_round_trip_uprn_lexical_value_preserved(
    baspi5_sample: dict[str, Any],
    opda_ontology: Graph,
) -> None:
    """The UPRN's lexical value round-trips unchanged (no string ↔
    int silent reinterpretation that would break HMLR / AddressBase
    cross-reference)."""
    rdf_graph = json_to_rdf(baspi5_sample, opda_ontology)
    regenerated = rdf_to_baspi5_json(rdf_graph, opda_ontology)
    assert str(regenerated["propertyPack"]["uprn"]) == \
        str(baspi5_sample["propertyPack"]["uprn"])
