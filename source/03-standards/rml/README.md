# OPDA RML mapping — PDTF v3 JSON → OPDA RDF

An [RML](https://rml.io) mapping that consumes a **PDTF v3 transaction instance**
(`@pdtf/schemas` v3, e.g. `source/03-standards/schemas/src/examples/v3/exampleTransaction.json`)
and materialises **RDF conforming to the OPDA ontology**, validating with **0 `sh:Violation`**
against `public/ontology/artefacts/opda-shapes-merged.ttl`.

RML always runs *source → RDF*. This mapping is the **inverse of the `dct:source`
provenance** that `opda-gen` minted (see "Provenance mirror" below).

## Files

| File | Role |
|---|---|
| `mapping/opda-pdtf.rml.ttl` | The mapping (morph-kgc dialect: `rml:` + `rr:` + `ql:JSONPath`). **Canonical deliverable.** |
| `mapping/morph-config.ini` | morph-kgc config to run the mapping stand-alone. |
| `README.md` | This file. |

Ground-truth inputs owned by other agents: `provenance-index.json` (A1, leaf→predicate
map), `testdata/*.json` (A2, instances), `harness/*` + `Makefile` + `tests/` (A3, runner).

## How to run

Engine: **morph-kgc 2.10** (in `tools/opda-gen/.venv`) with `jsonpath-python`. Jena
`shacl` for validation.

```bash
cd source/03-standards/rml
make rml-test      # map -> SHACL validate -> layer-1 completeness (01-conformant-full.json)
make rml-map       # just materialise -> build/out.nt
make rml-shacl     # validate build/out.nt against opda-shapes-merged.ttl
make rml-complete  # layer-1 completeness gate + gap register
make rml-pytest    # tests/test_rml_mapping.py (sound / complete / negative)
```

Run against any instance directly:

```bash
../opda-gen/.venv/bin/python harness/run_mapping.py \
  --mapping mapping/opda-pdtf.rml.ttl \
  --data ../../source/03-standards/schemas/src/examples/v3/exampleTransaction.json \
  --out build/out.nt
bash harness/validate_shacl.sh build/out.nt
```

`run_mapping.py` rewrites the mapping's `rml:source` literal to the chosen instance,
so the one mapping runs against any conformant PDTF file.

## Provenance mirror (the `dct:source` inversion)

`opda-gen` minted every OPDA predicate carrying its origin:

```
opda:<pred> dct:source <https://opda.org.uk/pdtf/harness/data-dictionary/{leaf_path}> .
```

This mapping walks that arrow **backwards**: for each layer-1 predicate it reads the JSON
leaf at `{leaf_path}` and emits `opda:<pred>`. Every predicate-object map in the `.ttl`
is annotated `# <- {leaf_path}` — that comment *is* the `dct:source` it inverts. A1's
`provenance-index.json` is the machine-readable form of the same inversion.

## Scope & coverage (honest ledger)

The "sound AND complete" claim is scoped to **layer-1 provenance-anchored leaves that
actually occur in the conformant instance** (CONTRACT §"Definitions of done").

- The conformant instance surfaces **69 layer-1 leaf occurrences → 61 distinct predicates**.
- **All 69 are covered** (`layer-1 DROPPED = 0`); SHACL reports **0 violations**.
- The other **264 of A1's 333 distinct layer-1 leaf_paths do not occur** in this instance (they belong
  to schema branches the example omits: `valuationComparisonData`, `chain`, the
  `serviceContactAssignments.*.feeIncludingVAT` fan-out, `lettingInformation`, etc.). They
  are **not** mapped here — mapping them would be untestable against this instance. Adding
  them is mechanical (same patterns) once an instance exercises those branches.
- **Layer-2** (shared/collapsed leaves that are not themselves a `dct:source`) is not
  claimed; `layer-2 covered = 0`.

### Participant role → class (conditional typing)

Role-specific SHACL shapes only fire if a participant node carries the role class
as `rdf:type`. The mapping types participants by their JSON `role` via a
JSONPath role-filter on the iterator (jsonpath-python form `[?(@.role=="Seller")]`
— double-quoted, no spaces):

- `role == "Seller"` → `a opda:Seller`
- `role == "Buyer"`  → `a opda:Buyer`

Seller/Buyer nodes are keyed **separately** (`seller/{email}`, `buyer/{email}`)
from the `person/{email}` node (M2). This is deliberate: the merged
`PersonIdentityKeyShape` requires `opda:hasAssertedCapacity` be an `xsd:string`
on `opda:Person`, whereas the BASPI5 `Baspi5_SellersCapacityShape` requires it be
a scheme IRI on `opda:Seller` — unsatisfiable on one node, so the two roles never
share an IRI.

`participants[].sellersCapacity.capacity` → `opda:hasAssertedCapacity` as a
**controlled scheme IRI**. The BASPI5 `sh:xone` needs `sh:nodeKind sh:IRI` drawn
from `opda:CapacityScheme` (branch (a) `Legal-Owner` requires nothing further;
branch (b) `Under-Power-of-Attorney` / `Personal-Representative-…` / … require an
evidenced authority). A template IRI would percent-encode the space
(`Legal Owner` → `Legal%20Owner`) and miss the hyphenated scheme member, so each
of the **6 PDTF capacity enum values** is filtered and mapped to its exact
constant scheme IRI. This makes the negative fixture (`04-negative-invalid.json`:
PoA seller, no evidenced authority) trip the **intended**
`Baspi5_SellersCapacityShape` xone ("Xone has 0 conforming shapes"), not just
incidental BASPI5 Property shapes.

**Roles left untyped (candid):** only "Seller" and "Buyer" have a dedicated OPDA
class. "Seller's Conveyancer" is carried as an `opda:Organisation` (M3), not a
role class; other roles (Estate Agent, etc.) are not role-typed — there is no
`opda:` class for them. This is faithful to the ontology, not an omission to hide.

### SHACL traps handled

- **MonetaryAmount** (`opda:annualGroundRent`, `opda:annualServiceCharge`,
  `opda:sharedOwnershipRent`): each routes to a **minted `opda:MonetaryAmount` node**
  bearing `opda:amount` (xsd:decimal) + `opda:currency`
  `<…/scheme/currency/GBP>` — never a bare decimal on the predicate
  (`MonetaryAmountShape` requires both, `sh:minCount 1`).
- **`opda:Search` class-promotion** (`SearchIdentityKeyShape`): every Search node carries
  `prov:wasGeneratedBy` (a minted GeneratorRun IRI) — the shared class-promotion shape
  makes this a `sh:Violation` otherwise.
- **`opda:url`** (`UrlShape`, `sh:targetSubjectsOf`): emitted as `xsd:anyURI` matching
  `^https?://`.
- **Value-space `sh:in`** on `opda:typeOfConnection` ("FTTC (Fibre to the Cabinet)") and
  `opda:priceQualifier` ("Offers over") — instance values are in-scheme.
- All other Violation-tier shapes are `sh:maxCount 1` identity surfaces; every property is
  single-valued per node, so none fire.

## Genuine ontology gaps (NOT silently dropped)

Every instance leaf that has no layer-1 predicate is captured in the gap register
(`build/gap-register.json`) by `check_completeness.py` — nothing vanishes silently.
Two high-value leaves are worth calling out because they surprise reviewers:

- **`propertyPack.priceInformation.price` (the headline asking price) is a genuine
  gap.** A1's index has NO predicate whose `dct:source` is this leaf, and there is no
  semantically-correct monetary predicate to collapse onto: `opda:soldPrice` /
  `opda:listPrice` / `opda:estimatedPrice` are `opda:Valuation`-domain comparable
  prices, and `opda:price` is the Category-D *fixtures* amount — none mean "this
  property's asking price". Force-binding it would be exactly the mis-binding the
  layer-1 discipline forbids. It stays in the gap register; closing it needs an
  **ontology addition** (e.g. `opda:askingPrice` with `dct:source …priceInformation.price`),
  which is A1/ontology territory, not the mapping's. (Note: `testdata/03`'s MANIFEST
  claims `price 450000 → MonetaryAmount`; that overclaims relative to A1's index — 03
  materialises 0 MonetaryAmount because no such predicate exists.)
- **`propertyPack.connectivity.broadband.supplier` ("BT")** is likewise not a
  `dct:source` of `opda:supplier` in A1's index, but it IS semantically the shared
  supplier property, so it is mapped **best-effort as layer-2** onto `opda:supplier`
  (CONTRACT §Layer-2) rather than left in the gap register.

## Known deviations (candid)

1. **One `opda:Transaction`, plus untyped declaration/signature records.** Output
   contains **exactly one `opda:Transaction`** (`txn/{transactionId}`). The deep
   Transaction-domain leaves (`sellerWillEnsure` / `confirmationOfAccuracyByOwners` / CPR
   booleans; `signedOn`) cannot be attached to that subject because of a specific
   morph-kgc limitation: for a root-`$` iterator, morph-kgc selects `reference.split('.')[0]`
   as the subtree (so a reference `propertyPack.X` pulls the *entire* propertyPack) and
   then **drops the whole record if any selected value is `null`**
   (`data_file.py`: `pd.json_normalize([… if None not in json_object.values()])`).
   Real PDTF propertyPacks always contain nulls, so root-`$` nested references yield **0
   triples** (reproduced: a single `null` sibling in propertyPack drops the record). The
   root `transactionId` is likewise unreachable from a nested iterator. Rather than mint
   extra identity-less `opda:Transaction` individuals (asserting N transactions for 1),
   those leaves are emitted on **untyped** records — `declaration/{uprn}` (read under the
   `$.propertyPack` iterator, whose *narrow* subtree selection is null-free and does
   resolve) and `signature/{contractHash}`. Untyped ⇒ no SHACL target; completeness is
   predicate-level, so nothing is dropped. A production engine (or a morph-kgc without the
   null-record filter) would fold these onto the single transaction.
2. **Nested-node IRIs are keyed on locally-stable natural keys** (`titleNumber`,
   `productCode`, `uprn`, `firstName-lastName`, `email`, `contractHash`), not on
   `transactionId + JSONPath` — same root cause as (1). These keys are unique within one
   transaction file.
