# Darwin genome proof-of-concept scripts

Historical record of the two experiments that established the "RML mapping as
a Darwin genome, scored by our real Jena harness" pattern (see ADR-0058).
Kept as evidence the method works, **not as a live, repeatable tool**.

**Important**: both scripts APPEND candidate `TriplesMap` blocks on top of
whatever is currently in `mapping/opda-pdtf.rml.ttl` at the time they're run.
When originally run, the base mapping did NOT yet contain `opda:EPCCertificate`
or `opda:NearbyFacility` bindings, so the candidates were genuinely competing
to fill a real gap. Since then, the winning genome from each experiment was
folded into the real mapping (see the mapping file's M4a and M14 sections) —
so re-running these scripts now duplicates/confounds against content that's
already there, and will NOT reproduce the original documented results.

To use this pattern for a NEW gap (a class/property not yet in the mapping),
copy one of these scripts as a starting template, adjust the candidate
genomes for the new target, and run it against the mapping as it stands
*before* any winning candidate is folded in.

- `darwin-genome-epccertificate.mjs` — the case WITH a SHACL shape
  (`EPCCertificateIdentityKeyShape`, hard `minCount 1` on `prov:wasGeneratedBy`).
  3 of 4 candidates failed the shape; `paretoFront` correctly selected the
  sole conforming one.
- `darwin-genome-nearbyfacility.mjs` — the deliberate contrast case, WITHOUT
  any SHACL shape on the class. `paretoFront` discriminated on coverage
  instead (node count + field count), and along the way caught an invented
  test value (`"Rail"`, not a real `TransportTypeScheme` member).
