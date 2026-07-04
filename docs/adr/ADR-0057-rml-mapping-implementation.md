---
status: accepted
date: 2026-07-04
tags: [rml, morph-kgc, jena, sparql, skos, provenance, validation]
supersedes: []
depends-on: [ODR-0035, ODR-0011, ADR-0037]
implements: []
---

# RML Mapping Implementation

## Context and Problem Statement

[ODR-0035](../ontology/odr/ODR-0035-rml-schema-provenance-verification.md) adopts RML as OPDA's independent, bidirectional schema-provenance verification mechanism, used as documentation, not executable ETL. This ADR records the concrete engineering realising that decision: which RML engine, how the mapping is validated, where it lives in the repository, and how JSON enum values are represented as SKOS concept IRIs given RML has no built-in string-transform primitive for that.

Three engineering questions needed resolving, each with a real, non-obvious answer surfaced during implementation:

1. **Which RML engine, and how is the mapping validated** — without instance data (per ODR-0035) and without violating [ADR-0037](./ADR-0037-apache-jena-sole-rdf-shacl-sparql-toolchain.md) (Apache Jena as opda's sole RDF parse/serialise/validate/infer/query toolchain; rdflib and pyshacl are prohibited from those paths).
2. **Where does the mapping live** — a tooling directory, or alongside the standards it traces.
3. **How does a JSON enum value (a raw string, often containing spaces/apostrophes, e.g. `"Legal Owner"`) become a SKOS concept IRI (`opda:scheme/sellersCapacity/Legal-Owner`) in RML** — R2RML mandates percent-encoding of `rr:template`-substituted values outside RFC 3987 `iunreserved`, so a naive template produces `.../Legal%20Owner`, never the ontology's hyphenated slug. This is a hard spec constraint, not a style choice.

## Decision Drivers

* Must not require or produce PDTF transaction instance data (ODR-0035).
* Must not introduce rdflib/pyshacl into any RDF parse/validate path (ADR-0037).
* Must keep the enum-value → SKOS-concept correspondence auditable from the mapping file alone, matching RML's documentation purpose here (not merely "whatever is most compact").

## Considered Options

**Engine:**
* **morph-kgc (chosen)** — Python RML engine; supports RML-FNML (including Python UDFs), RML-star, JSON via `ql:JSONPath`. Confirmed installed and working.
* RMLMapper (Java reference implementation) — rejected: introduces a JVM dependency alongside the already-adopted Jena JVM toolchain for no functional gain here; morph-kgc's Python UDF path covers the same FNML ground if ever needed.

**Validation (RML mapping's own structure + the ontology's `dct:source` citations, both against the canonical schema dictionary):**
* **rdflib graph-walking (initial implementation)** — parses the `.rml.ttl` and `opda-merged.ttl` files directly via rdflib's Turtle parser. Rejected on discovery it violates ADR-0037's explicit prohibition on rdflib in opda's parse paths, even though empirically verified to produce correct results for this content (neither file uses any RDF-star/RDF-1.2-only syntax, so no actual parsing divergence was found — the objection is architectural/policy, not a demonstrated bug).
* **Apache Jena `arq` (chosen)** — SPARQL SELECT queries against the mapping and ontology files, shelled out via the same subprocess pattern `opda_gen.jena_shacl` already uses for SHACL validation. CSV results parsed with the stdlib `csv` module — no rdflib anywhere in the query path. Verified to produce byte-identical results to the rejected rdflib prototype before it was replaced, confirming the port introduced no regression.

**File location:**
* **`tools/rml-mapping/` (initial placement)** — rejected on reflection: this is a standards artefact tracing the ontology to its source schemas, not a build tool; grouping it with `tools/opda-gen/` misrepresented its role.
* **`source/03-standards/rml/` (chosen)** — alongside `source/03-standards/ontology/` and `source/03-standards/schemas/`, the artefacts it traces between.

**Enum → SKOS concept IRI in RML:**
* **`rr:template` on the raw field directly** — disqualified outright: R2RML mandates percent-encoding of template-substituted characters outside `iunreserved`, so `"Legal Owner"` yields `.../Legal%20Owner`, never `.../Legal-Owner`. Not a style choice; the spec forbids the shortcut.
* **RML-FnO/FNML transform (e.g. a `slugify` function)** — more compact (one `TriplesMap` + one function per enum, instead of one `TriplesMap` per value), but morph-kgc does **not** ship `slugify` or `lookup` as built-in functions (verified directly against the installed `morph_kgc/fnml/built_in_functions.py` — confirmed absent); would require writing and registering a custom Python UDF, and the value↔IRI correspondence would then live in that function's code rather than in the mapping file itself — weakening the single-file auditability ODR-0035 requires of this artefact.
* **Lookup/code-list table** (`rr:parentTriplesMap` + `rr:joinCondition`, or the IDLab `lookup()` FnO function) — the closest thing to a community-standard answer for coded/reference data generally, but externalises the value↔IRI correspondence into a separate CSV/logical source; a reviewer would need two artefacts to audit one enum.
* **Per-value `TriplesMap` + JSONPath filter, emitting a constant scheme-member IRI (chosen)** — one `rr:TriplesMap` per enum value, using `rml:iterator "$.field[?(@.subfield==\"Raw Value\")]"` to select matching rows, then `rr:object <scheme-member-IRI>` as a constant. Verbose (N maps per N-value enum) but the only pattern where every raw-value → concept-IRI correspondence is spelled out explicitly in the mapping file, matching its documentation purpose.

## Decision Outcome

Chosen: morph-kgc as the engine; Apache Jena `arq` for all mapping/ontology querying (no rdflib, no pyshacl); `source/03-standards/rml/` as the file location; per-value `TriplesMap` + JSONPath filter for enum → SKOS concept IRI mapping.

The validation harness implements three checks against the mapping and the ontology, with no instance data and no morph-kgc execution as part of validation:

1. **RML → OWL consistency** — every `rr:class`/`rr:predicate` the mapping uses is a real declared term in `opda-merged.ttl` (external vocabulary, e.g. `prov:wasGeneratedBy`, is excluded from this check and audited by hand against its own owning spec instead — see Consequences).
2. **Resource → Schema location** — every OWL resource the mapping addresses cites a JSON Schema location that resolves in the canonical data dictionary. Object properties whose range is an `opda:` class (join/relationship predicates, e.g. `opda:hasEPCCertificate`) are tracked in a separate `mapped_relationally` bucket rather than attributed a false content-location from their join-key template placeholder — their real location is the range class's own `TriplesMap`.
3. **Schema location → Resource** — every canonical dictionary location that has been referenced by the mapping is recorded, against the honest denominator (paths actually cited by *some* term's `dct:source` across the whole ontology, not the raw dictionary size, which is inflated by structural scaffolding no term will ever cite).

### Consequences

* Good, because auditing the ontology's own `dct:source` citations against the canonical dictionary (a capability this harness enabled) found 8 citations with a precise, locatable path drift and 16 with no matching field anywhere in the current v3 schema — defects invisible to the generator's own emission process.
* Good, because a cross-check between the RML mapping's resource-to-schema-location claims and the ontology's own `dct:source` citations (68 of 73 directly comparable predicates agree) caught a genuine bug in the validator itself — join-key template placeholders were being mis-attributed as content locations for relationship predicates — fixed and re-verified.
* Good, because auditing `prov:wasGeneratedBy` (the one external-vocabulary term in use) against its own PROV-O definition, rather than exempting it from checking as "just external", found it was used soundly in direction (`Entity wasGeneratedBy Activity`) but incompletely: the target `.../run` node was never typed `a prov:Activity` anywhere. Fixed by adding a companion `TriplesMap` at each of the three usage sites.
* Good, because the per-value-filter enum pattern keeps every raw-value → concept-IRI correspondence auditable from the mapping file alone, matching ODR-0035's documentation purpose, at the cost of verbosity that is a feature (an exhaustive, greppable enumeration) rather than a defect for this specific use.
* Bad, because the per-value-filter pattern does not scale gracefully if this mapping is ever repurposed for real ETL execution at the full ~30+-enum-scheme scale (~300 `TriplesMap`s); the documented escape hatch is a Python-UDF `slugify` FNML transform at that point, accepting the auditability trade-off only then.
* Neutral, because full coverage of the schema-generated ontology surface remains partial (roughly a third of resources traced as of this record); closing the remainder is ongoing work tracked separately from this engineering decision.

### Confirmation

`make -C source/03-standards/rml provenance-test` runs checks 1–2–3; `make -C source/03-standards/rml dct-audit` runs the independent `dct:source` citation audit. Both are Jena-`arq`-only (verified: zero `rdflib` imports in either script).

## More Information

- [ODR-0035](../ontology/odr/ODR-0035-rml-schema-provenance-verification.md) — the ontology-level policy this ADR implements.
- [ODR-0011](../ontology/odr/ODR-0011-enumeration-vocabularies.md) — SKOS concept scheme convention for enums; this ADR's enum-mapping technique expresses that convention in RML.
- [ADR-0037](./ADR-0037-apache-jena-sole-rdf-shacl-sparql-toolchain.md) — the toolchain-purity constraint this ADR's Jena-`arq` port satisfies.
- [ADR-0036](./ADR-0036-shacl-1-2-validation-via-apache-jena.md) — the direct sibling decision on the SHACL side (Jena `jena-shacl` replacing pyshacl); this ADR is the SPARQL-query-side analogue (Jena `arq` replacing rdflib).
- `source/03-standards/rml/harness/jena_query.py`, `validate_provenance.py`, `audit_dct_source.py` — the concrete implementation.
