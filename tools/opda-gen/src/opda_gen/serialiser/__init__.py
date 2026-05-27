"""
Package opda_gen.serialiser.

Realises:
- ADR-0007 §"Deterministic emission rules" — canonical N-Triples → Turtle
  emission pipeline with byte-identical output across runs and machines.
- ADR-0008 §"Repository structure" — `serialiser/` subpackage per layout.
- ODR-0004 §6a #1 — deterministic emission ordering (the byte-identity CI
  contract).
"""

from opda_gen.serialiser.canonical import to_canonical_turtle  # noqa: F401
