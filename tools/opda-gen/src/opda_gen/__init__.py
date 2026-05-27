"""
Package opda_gen.

Realises:
- ADR-0008 §"Repository structure" — Python package root for the OPDA ontology generator.
- ADR-0007 §"Architecture" — generator implementation entry point.
- ADR-0010 — SKOS vocabulary emission (minor version bump 0.1.0 → 0.2.0;
  the SKOS substrate is a substantive addition to the emitted corpus and
  warrants a minor version per the `owl:versionIRI` scheme established in
  ADR-0009).
- ODR-0004 §6a — generator-first contract owner.
"""

__version__ = "0.2.0"
