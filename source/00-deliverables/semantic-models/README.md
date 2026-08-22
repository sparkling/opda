# Semantic Models

Generated 2026-05-14 from the PDTF schema v3 corpus and OPDA glossaries. These are source-analysis artefacts for the separate draft schema-derived ontology, not an endorsed scheme.

## ⚠️ Audit correction (May 2026)

The previous version of this dictionary reported **14,287 properties**. That number was inflated by:
- Counting `combined.json` (a derived merged schema) alongside the source schemas
- Counting `skeleton.json` (a structural template)
- Counting older overlay versions (`baspi4`, `nts`, `ntsl`) alongside the newer (`baspi5`, `nts2`, `ntsl2`)
- Counting every appearance of reusable structural patterns (e.g. `yesNo` appears 1,135 times via `$ref`)

After deduplication: **8,458 property-path entries across 16 canonical schemas**, representing **1,557 unique leaf property names** — the actual PDTF vocabulary. See [`audit.json`](audit.json) for the full breakdown.

## Files

| File | What it is |
|---|---|
| `data-dictionary-canonical.json` | Machine-readable: 8,458 entries from 16 canonical v3 schemas. Source `combined.json` and superseded overlay versions excluded. |
| `data-dictionary.json` | Original extraction (14,287 entries). Kept for transparency; do not use for headline counts. |
| `data-dictionary.md` | Human-readable: per-schema tables of unique leaf names with type and description. |
| `glossary-merged.json` | 54 terms from the two OPDA `Glossary.xlsx` files, deduplicated. |
| `business-glossary.md` | Human glossary: OPDA terms A–Z + key PDTF concepts + external vocab (W3C VC, DID, ToIP). |
| `business-glossary.ttl` | SKOS Concept Scheme for the schema-derived ontology work. 554 concepts. |
| `audit.json` | The inflation audit — what was counted twice and why. |

## Headline numbers

- **16** canonical schemas
- **1,557** unique leaf property names (the real PDTF vocabulary)
- **389** cross-context concepts (appear in 3+ schemas — need ontology reconciliation)
- **754** context-specific concepts (appear in 1 schema only)
- **54** OPDA Glossary terms
- **554** SKOS concepts in the TTL

## Schema inventory

| Schema | Bounded context | Unique leaves |
|---|---|---|
| `pdtf-transaction.json` | Base — spans all contexts | 1,557 |
| `baspi5.json` | Estate Agency | 318 |
| `rds.json` | Property Data Services | 196 |
| `piq.json` | Surveying | 184 |
| `ta6.json` | Conveyancing | 178 |
| `nts2.json` | Estate Agency | 160 |
| `lpe1.json` | Conveyancing | 136 |
| `con29R.json` | Property Data Services | 125 |
| `ntsl2.json` | Estate Agency | 124 |
| `ta7.json` | Conveyancing | 98 |
| `ta10.json` | Conveyancing | 90 |
| `fme1.json` | Mortgage Lending | 78 |
| `oc1.json` | Property Data Services | 68 |
| `con29DW.json` | Property Data Services | 34 |
| `sr24.json` | Property Data Services | 7 |
| `llc1.json` | Property Data Services | 3 |

## Excluded sources (with reasons)

- `combined.json` — derived merge of base + all overlays
- `skeleton.json` — structural template
- `baspi4.json` — superseded by baspi5
- `nts.json` — superseded by nts2
- `ntsl.json` — superseded by ntsl2

## Sources

- PDTF Schemas: `source/03-standards/schemas/src/schemas/v3/`
- OPDA Glossary (PoC): `source/06-research/trust-framework-poc/Glossary.xlsx`
- OPDA Glossary (Technical WG): `source/04-governance-bodies/working-groups/technical/Glossary.xlsx`
- External: W3C VCDM 2.0, W3C DID 1.0, Trust Over IP Foundation
