"""
Package opda_gen.emitters.modules.

Realises:
- ADR-0011 §"Per-module detail" — six per-module TBox emitters
  (property, agent, transaction, claim, governance, descriptive). Each
  sub-module exposes a `build_graph()` returning an `rdflib.Graph` for
  the module's OWL Class + Datatype/Object Property declarations, plus
  module-level constants documenting which classes the module mints (so
  tests can assert coverage without re-parsing the TTL).
- ADR-0011 §"Module emission template" — every module file declares its
  own `owl:Ontology` with `dct:title`, `owl:imports` foundation +
  vocabularies, and `owl:versionIRI` pinned to the generator version.
- ADR-0007 §"A9 per-kind discipline output" — every emitted owl:Class
  carries `rdfs:label @en`, `rdfs:comment @en` (UFO/DOLCE + IC + hard
  cases), `skos:scopeNote @en` (UFO/DOLCE source citation), and
  `dct:source` resolving to the ratifying ODR section.
- ADR-0007 §"Deterministic emission rules" — canonical serialiser handles
  ordering; this package just builds the rdflib graph.
- ODR-0005, ODR-0006, ODR-0007, ODR-0008, ODR-0009, ODR-0012, ODR-0015,
  ODR-0018 — the ratified `## Rules` corpus this package realises.

Module dispatch is via `emit_module(name, output_dir)`; the dispatching
orchestrator lives in `opda_gen.emitters.classes`. This package exposes
just the per-module graph builders + their module-level catalogues so
tests can introspect what each module declares without re-parsing.
"""

from __future__ import annotations

from opda_gen.emitters.modules import (
    agent,
    claim,
    descriptive,
    governance,
    property,
    transaction,
)

__all__ = [
    "agent",
    "claim",
    "descriptive",
    "governance",
    "property",
    "transaction",
]

# Module catalogue — name → builder module. The orchestrator uses this to
# validate `emit-module <name>` CLI calls.
MODULE_REGISTRY = {
    "property": property,
    "agent": agent,
    "transaction": transaction,
    "claim": claim,
    "governance": governance,
    "descriptive": descriptive,
}
