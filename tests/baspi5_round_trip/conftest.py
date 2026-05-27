"""
Module conftest.

Realises:
- ADR-0014 §"Round-trip layer" lines 53-69 — `opda_ontology` fixture
  loads the full ratified corpus (24 TTL files) into a single rdflib
  Graph so the round-trip tests can query the merged TBox + shape
  graph + annotation graph + SKOS substrate + BASPI5 profile.
- ADR-0014 §"Exemplar regression layer" — `shapes_only_graph` fixture
  provides just the shape graph (foundation + 6 per-module) for the
  exemplar regression layer; the exemplars were authored against this
  surface and the regression compares pyshacl's actual report to the
  committed expected-report.ttl pairing.
- ADR-0014 §"Round-trip layer" — `baspi5_sample` fixture loads the
  synthetic BASPI5 submission used to exercise the JSON ↔ RDF
  translation.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
from rdflib import Graph


# ---------------------------------------------------------------------------
# Repo paths (anchored on this file so the suite works from any cwd).
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[2]
ONTOLOGY_DIR = REPO_ROOT / "source" / "03-standards" / "ontology"
EXEMPLARS_DIR = ONTOLOGY_DIR / "exemplars"
PROFILES_DIR = ONTOLOGY_DIR / "profiles"


# Class-graph files (TBox + foundation).
CLASS_TTLS = (
    "foundation.ttl",
    "opda-classes.ttl",
    "opda-vocabularies.ttl",
    "opda-property.ttl",
    "opda-agent.ttl",
    "opda-transaction.ttl",
    "opda-claim.ttl",
    "opda-governance.ttl",
    "opda-descriptive.ttl",
)

# Shape graphs (foundation + 6 per-module).
SHAPE_TTLS = (
    "opda-shapes.ttl",
    "opda-property-shapes.ttl",
    "opda-agent-shapes.ttl",
    "opda-transaction-shapes.ttl",
    "opda-claim-shapes.ttl",
    "opda-governance-shapes.ttl",
    "opda-descriptive-shapes.ttl",
)

# Annotation graphs (foundation + 6 per-module).
ANNOTATION_TTLS = (
    "opda-annotations.ttl",
    "opda-property-annotations.ttl",
    "opda-agent-annotations.ttl",
    "opda-transaction-annotations.ttl",
    "opda-claim-annotations.ttl",
    "opda-governance-annotations.ttl",
    "opda-descriptive-annotations.ttl",
)

# Overlay profiles (BASPI5 only for now; TA6/NTS/LPE1 land as
# Phase-2 follow-up overlay ADRs per ADR-0013 §"Overlay catalogue").
PROFILE_TTLS = (
    "profiles/baspi5.ttl",
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def opda_ontology() -> Graph:
    """Load the full ratified ontology corpus into one rdflib Graph.

    Realises ADR-0014 §"Round-trip layer" fixture template (lines
    53-69). Loaded once per test session for performance — parsing
    2,000+ triples across 24 files would dominate the suite otherwise.
    """
    g = Graph()
    for rel in (*CLASS_TTLS, *SHAPE_TTLS, *ANNOTATION_TTLS, *PROFILE_TTLS):
        path = ONTOLOGY_DIR / rel
        assert path.exists(), f"missing ontology file: {path}"
        g.parse(path, format="turtle")
    return g


@pytest.fixture(scope="session")
def shapes_only_graph() -> Graph:
    """Load the shape graphs (foundation + 6 per-module) for the
    exemplar regression layer.

    Excludes BASPI5 profile shapes — the exemplars were authored as
    TBox/foundation-level fixtures; validating them against the BASPI5
    overlay would surface cardinality failures that belong to the
    BASPI5 submission contract, not to the diagnostic exemplar
    contract (ODR-0004 §8a).
    """
    g = Graph()
    # Class graphs are needed for sh:targetClass resolution.
    for rel in (*CLASS_TTLS, *SHAPE_TTLS, *ANNOTATION_TTLS):
        path = ONTOLOGY_DIR / rel
        g.parse(path, format="turtle")
    return g


@pytest.fixture(scope="session")
def baspi5_profile_graph() -> Graph:
    """Load the BASPI5 overlay profile (just `profiles/baspi5.ttl`)."""
    g = Graph()
    g.parse(ONTOLOGY_DIR / "profiles" / "baspi5.ttl", format="turtle")
    return g


@pytest.fixture(scope="session")
def baspi5_sample() -> dict[str, Any]:
    """Load the synthetic BASPI5 sample transaction JSON."""
    sample_path = Path(__file__).parent / "sample_data" / \
        "baspi5_sample_transaction.json"
    with sample_path.open() as f:
        return json.load(f)


@pytest.fixture(scope="session")
def exemplar_names() -> list[str]:
    """The 15 canonical diagnostic exemplar names (no `.ttl` suffix)."""
    return [
        "registered-freehold-house",
        "unregistered-pre-first-registration-house",
        "flat-with-split-uprn",
        "flat-no-uprn-newly-converted",
        "rural-plot-inspire-no-uprn",
        "listed-building-divergent-addresses",
        "person-with-name-change",
        "organisation-with-merger",
        "proprietorship-relator-multi-proprietor",
        "simple-transaction-with-milestones",
        "lease-extension-transaction",
        "chain-of-transactions",
        "claim-with-document-evidence",
        "claim-with-electronic-record-evidence",
        "claim-with-vouch-evidence",
    ]
