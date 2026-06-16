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
- ADR-0013 — Overlay profile emission (minor version bump 0.4.0 → 0.5.0;
  BASPI5 overlay profile + G8 scheme expansion (7 new schemes) + G9
  placeholder replacement (4 schemes) + G10 TransactionStatus URI fix
  + G11 DatatypeProperty expansion + ValidationContext class added to
  foundation + class-graph version-IRI bump 0.3.0 → 0.4.0).
- ADR-0014 — BASPI5 round-trip MVP harness + diagnostic exemplar
  regression (MAJOR version bump 0.5.0 → 1.0.0; the MVP gate is the
  v1.0 release marker per ODR-0003 §"Programme retirement criterion").
  Bundled G14 / G16-G20 closures; foundation class-graph version-IRI
  bump 0.4.0 → 1.0.0 (opda:hasSpecialCategoryData DatatypeProperty
  added). Per-module owl:imports + owl:versionIRI bumped in lockstep.
  Round-trip harness, 15 expected-report.ttl pairings, and CI workflow
  land in this version.
- ODR-0004 §6a — generator-first contract owner.
"""

__version__ = "1.0.1"
