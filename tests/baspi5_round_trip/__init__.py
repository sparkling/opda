"""
Package baspi5_round_trip.

Realises:
- ADR-0014 §"Round-trip layer" — BASPI5 JSON ↔ RDF translation
  exercises the BASPI5 overlay profile + the ratified ontology stack
  end-to-end. Round-trip equivalence after normalisation is the MVP
  gate per ODR-0010 §Q7 and ODR-0003 §"Programme retirement
  criterion" (condition i).
- ADR-0014 §"Exemplar regression layer" — pyshacl validates each of
  the 15 diagnostic exemplars against the foundation + module shape
  graph and compares the resulting sh:ValidationReport to its
  committed expected-report.ttl pairing per ODR-0004 §8a.
- ADR-0014 §"`dct:source` traceability layer" — SPARQL queries verify
  every minted form question + every shape's sh:path resolves to a
  data-dictionary leaf URI per ODR-0010 §Q3.

The harness deliberately lives in the repo root `tests/` directory
(per CLAUDE.md "Use `/tests` for test files") rather than nested
under `tools/opda-gen/tests/` because it exercises the merged
ratified corpus on disk, not the generator's emission contract.
The generator's per-unit tests stay in `tools/opda-gen/tests/`.
"""
