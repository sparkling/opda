# Validation of the 451-item Property Pack seed scope

**Validation date:** 2026-08-03<br>
**Purpose:** establish the closed evidence baseline for greenfield ontology modelling.<br>
**Result:** structurally complete against the workbook; semantically incomplete and not yet
proven to have final DPMSG approval.

## Authority and evidence hierarchy

| Level | Evidence | What it establishes | What it does not establish |
|---|---|---|---|
| 1 | [`PDTF base schema.xlsx`](../../source/04-governance-bodies/working-groups/regulator/PDTF%20base%20schema.xlsx), `Sheet1` | The exact inventory: 451 rows whose normalised status is `Required` | Complete semantics, lineage or final governance approval |
| 2 | Maria Harris, “Knowledge base - mandated standard request”, 2026-07-27, Gmail message `19fa335e793d641b` | The intended starting scope is “principally the c.450 ‘required’ data fields” | The individual field list; the email says consensus and DPMSG approval are still to follow |
| 2 | Maria Harris, “Re: PDTF schema updates”, 2026-06-04, Gmail message `19e937b0c7d8d5c1` | Schema updates were being reviewed and were intended for approval and merge | That the local v3.5 schema is the later approved v3.6 release |
| 3 | [`OPDA all member update May 2026.pptx`](../../source/04-governance-bodies/working-groups/engagement/OPDA%20all%20member%20update%20May%202026.pptx), slide 6 | Mandatory Property Pack fields were being mapped against regulator and industry guidance | That mapping or approval was complete |
| 3 | [`DPMSG Data Standards & Interoperability Report`](../../source/04-governance-bodies/working-groups/comms-pr/DPMSG-Data-Standards-Interoperability-Report-Spring-2025-FINAL-1-1.pdf), p.14 | Property Pack breadth includes BASPI, title, EPC, searches and licensed form sources | A 451-item enumeration or ontology structure |
| 4 | [`pdtf-transaction.json`](../../source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json) | Structural corroboration: paths, source types, formats and selected restrictions | Semantic authority for the new ontology |

The workbook is the only located source containing a complete enumeration. Maria's emails
corroborate the approximate count and intended use, but explicitly describe consensus and
approval as future work.

## Extraction receipt

| Check | Result |
|---|---:|
| Workbook data rows | 1,702 |
| Rows marked `Required` | **451** |
| Rows marked `Optional` | 1,251 |
| Unique full JSON paths among required rows | **451** |
| Exact, case-normalised or whitespace-normalised duplicate paths | 0 |
| Missing path, field name, datatype or status | 0 |
| Required paths absent from the local v3.5 schema | 0 |
| Source datatype mismatches against v3.5 | 0 |

Workbook SHA-256:
`8c12fc79383bff355d545a5530418dcf908541f4064bae2ca44eb76fe0b8d28f`

Legacy-schema SHA-256:
`60f7a864e1aa49a13863b7d51032ca78a440130421ce87a2a0e3cbb29c495a74`

The machine-readable receipt is
[`validation-report.json`](../../src/data/property-pack/validation-report.json).

## What the 451 rows actually contain

| Characteristic | Count |
|---|---:|
| String source type | 410 |
| Boolean source type | 37 |
| Integer source type | 2 |
| Number source type | 2 |
| Unconditionally required | 168 |
| Conditional via `oneOf` / discriminator | 283 |
| Paths traversing an array | 133 |
| Rows with a workbook description | 211 |
| Rows without a workbook description | 240 |
| Rows with legacy-schema permitted values | 320 |
| Rows with a legacy-schema format | 17 |
| Rows with a legacy-schema `minLength` | 23 |
| Rows with a legacy-schema numeric minimum | 2 |

There are only 100 distinct terminal field names. Sixteen repeated names account for 367
rows; `yesNo` alone occurs 183 times. Full source path—not terminal name—is therefore the
coverage identity. Conversely, a unique path is not proof that the new ontology needs a
unique predicate.

The 133 array-traversing paths occur under 28 distinct array containers. The current schema
has explicit array cardinality metadata for only five of those containers. The catalogue
therefore records leaf cardinality relative to its immediate parent and flags repeatable
context separately; it must not invent missing collection cardinalities.

## Semantic and modelling caveats

1. **“Required” does not always mean always present.** For 283 rows it means required only
   in a branch selected by an unresolved discriminator condition. These are represented
   with minimum count zero plus conditional-requiredness, not unconditional `sh:minCount 1`.
2. **Source datatype is not ontology role.** All 451 workbook rows are primitive leaves.
   They still need classification as attributes, relationships, controlled concepts or
   validation rules, and their parent resources must be modelled independently.
3. **String is not automatically free text.** At least 320 rows carry permitted values in
   the legacy schema. These are controlled-vocabulary candidates, not automatically 320
   separate concept schemes.
4. **Question-like names are not boolean proof.** 119 required strings begin with forms such
   as `is` or `has`; many are tri-state or controlled values and cannot be coerced to RDF
   booleans without review.
5. **Legacy annotations are evidence, not authority.** The local schema is v3.5.0 while the
   June 2026 email discusses v3.6 changes still in review. Its constraints are retained with
   provenance and must be reconciled before release.
6. **One date-like anomaly needs review.** `propertyPack.titlesToBeSold[].registerExtract.`
   `ocSummaryData.lease.leaseEntry[].leaseDate` lacks a `date` format in the legacy schema.

## Meaning of “sound and complete”

The defensible claim is:

> The catalogue is complete against the 451-row `Required` workbook baseline, with every
> row uniquely identified and structurally reconciled to the local v3.5 schema.

It is not yet defensible to claim that the catalogue is semantically complete, reconciled
to an approved v3.6 schema, complete for every Property Pack use case, or approved by
DPMSG. Those are explicit review and governance gates in
[`ADR-0066`](../adr/ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md).

## Generated artefacts

- Maintained TOML manifest:
  [`catalogue.toml`](../../src/data/property-pack/catalogue.toml)
- Maintained TOML records:
  [`properties/`](../../src/data/property-pack/properties/)
- Deterministic 451-item JSON projection:
  [`required-properties.json`](../../src/data/property-pack/required-properties.json)
- Deterministic validation receipt:
  [`validation-report.json`](../../src/data/property-pack/validation-report.json)
- Canonical web view: `/spdtf-2/property-pack/definition-and-scope` (the former
  `/modelling/property-pack` route is removed without a redirect).
