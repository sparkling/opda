# RML Mapping — build contract (shared across swarm agents)

**Goal:** an RML mapping that consumes **PDTF JSON instances** (conforming to
`@pdtf/schemas` v3) and produces **RDF conforming to the OPDA ontology**, validating
against the emitted SHACL shapes. RML always runs *source → RDF*; this mapping captures
the ontology↔schema correspondence that `opda-gen` minted.

## Ground-truth inputs (read-only — never edit these)
- Merged ontology (TBox): `public/ontology/artefacts/opda-merged.ttl` (40 classes, 221 datatype props, 30 object props)
- Merged SHACL shapes:      `public/ontology/artefacts/opda-shapes-merged.ttl`
- Canonical data dictionary: `source/00-deliverables/semantic-models/data-dictionary-canonical.json` (8458 leaf records, `path`/`name`/`source`/`type`/`enum`)
- Example instance (v3):    `source/03-standards/schemas/src/examples/v3/exampleTransaction.json`
- v3 transaction schema:     `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json`

## Naming / namespace law (namespaces.py — DO NOT invent IRIs)
- Base term ns:  `https://opda.org.uk/pdtf/`  (classes + properties, e.g. `opda:soldPrice`)
- Instances:     `https://opda.org.uk/pdtf/harness/data/{suffix}`  ← ALL minted instance nodes live here
- Provenance:    `https://opda.org.uk/pdtf/harness/data-dictionary/{leaf_path}`  (this is `dct:source`, NOT the predicate)
- Never mint a predicate that is not already declared in `opda-merged.ttl`.

## The authoritative leaf→predicate map = invert `dct:source`
Every OPDA predicate declares `dct:source <…/harness/data-dictionary/{leaf_path}>`.
Parse `opda-merged.ttl` and build: `leaf_path → { predicate, kind (Datatype|Object), domain, range }`.
This is **layer 1 (provenance-anchored)** — authoritative, unambiguous. The mapping claim of
"sound AND complete" applies to **layer-1 leaves only**.

## Traps (why this is not mechanical — devil's advocate hunting ground)
- Monetary leaves (soldPrice, rent, groundRent, deposit, serviceCharge, fees, price-*) are
  **ObjectProperties → `opda:MonetaryAmount`** (a value node with `opda:amount` xsd:decimal +
  `opda:currency`), NOT plain decimals. RML must build the MonetaryAmount node.
- `opda:name` = ONE domain-less property shared across ~46 occurrences. `opda:price` = ONE
  shared fixtures property (Category-D only). Do NOT mint per-occurrence variants.
- Array leaves use `[]` in the dictionary path (`participants[].name.title`); JSONPath iterator strips indices.
- Some leaves are **GAPs** (no sound predicate — "bind-only-what-exists", S034/ODR-0022). GAPs are
  EXPECTED, logged in the gap register, and are NOT completeness failures.

## Layer 2 (shared/collapsed leaves) = documented extension, NOT claimed complete
Leaves that are semantically the shared props (name/price/address parts/MonetaryAmount fields)
but are not themselves a `dct:source`. Map on a best-effort basis with an explicit coverage
report. Honesty over coverage.

## Deliverable file layout (each agent owns disjoint files)
```
source/03-standards/rml/
  CONTRACT.md                     (this file)
  provenance-index.json           A1  leaf_path -> {predicate,kind,domain,range,layer}
  provenance-index.md             A1  human summary + counts + trap inventory
  testdata/*.json                 A2  instances (conformant + edge + negative)
  testdata/MANIFEST.md            A2  what each file exercises + expected SHACL outcome
  mapping/opda-pdtf.rml.ttl       B1  canonical RML (Turtle, rml: vocabulary)
  mapping/functions/              B1  RMLMapper FnO functions.ttl + Java UDF sources
  harness/run_mapping.py          A3  RMLMapper RML -> build/out.nt
  harness/validate_shacl.sh       A3  Jena shacl validate (data vs shapes) -> report
  harness/check_completeness.py   A3  scalar leaves in instance vs mapped predicates; emits gap register
  tests/test_rml_mapping.py       A3  pytest: run mapping, assert sound + completeness contract
  gap-register.md                 C1  devil's advocate: honest gaps + soundness/completeness verdict
  Makefile                        A3  `make rml-test` runs the full pipeline
  README.md                       B1/main  usage
```

## Engine
`RMLMapper` (Java reference implementation; ADR-0057 Amendments — migrated from morph-kgc),
self-provisioned into `.rmlmapper/` by `harness/run_mapping.py`. JSON via `rml:referenceFormulation ql:JSONPath`.
SHACL via `.jena/apache-jena-6.1.0/bin/shacl validate --shapes <shapes> --data <data>`.

## Definitions of done
- **Sound:** conformant test data → Jena SHACL reports 0 violations against `opda-shapes-merged.ttl`.
- **Complete (layer 1):** every layer-1 scalar leaf present in the conformant instance yields its
  expected predicate triple; none silently dropped. Gaps/collapses documented, not hidden.
- **Negative test:** a deliberately-malformed instance MUST produce SHACL violation(s).
