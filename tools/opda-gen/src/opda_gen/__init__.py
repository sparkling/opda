"""
Package opda_gen.

Realises:
- ADR-0008 §"Repository structure" — Python package root for the OPDA ontology generator.
- ADR-0007 §"Architecture" — generator implementation entry point.
- ADR-0010 — SKOS vocabulary emission (minor version bump 0.1.0 → 0.2.0;
  the SKOS substrate is a substantive addition to the emitted corpus and
  warrants a minor version per the `owl:versionIRI` scheme established in
  ADR-0009).
- ADR-0011 — Module TBox emission (minor version bump 0.2.0 → 0.3.0;
  the six per-module TBoxes plus the three UFO meta-classes added to the
  foundation (RoleMixin / Role / Relator) constitute a substantive
  extension of the emitted corpus).
- ADR-0012 — SHACL + DPV annotation emission (minor version bump
  0.3.0 → 0.4.0; twelve new TTL files — six per-module shape graphs +
  six per-module annotation graphs — plus extended foundation shapes
  carrying the three-rule interface-contract meta-shapes constitute the
  substrate's largest substantive expansion since Phase 1).
- ODR-0004 §6a — generator-first contract owner.
"""

__version__ = "0.4.0"
