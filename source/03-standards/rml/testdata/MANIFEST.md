# RML mapping — test-data suite (A2)

PDTF v3 JSON fixtures for the `opda-pdtf` RML mapping (see `../CONTRACT.md`).
Files 01–03 are the soundness/completeness corpus; file 04 is the negative
(ontology-level) case.

## Provenance of inputs

- Schema: `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json`
  (JSON Schema draft-07, self-contained — zero `$ref`). Version 3.4.0.
- Canonical instance: `source/03-standards/schemas/src/examples/v3/exampleTransaction.json`.
- BASPI5 overlay (defines the `sellersCapacity` `oneOf`): `.../overlays/baspi5.json`.

## How each file was validated

The schemas repo ships **no** ajv/validate npm script (only `jest`), and its
`node_modules` were not installed, so I validated with a standalone AJV 8
(`strict:false`, `ajv-formats`) compiling the base v3 schema directly (it has no
cross-file refs). Command output pasted in the swarm summary.

| File | Exercises | base-v3 schema-valid? | How checked |
|---|---|---|---|
| `01-conformant-full.json` | Primary soundness fixture — full canonical transaction (2 participants incl. Seller + Seller's Conveyancer, complete `propertyPack`, leasehold, titles, searches, contracts, monetary leaves). | **Y** | Byte-identical `cp` of shipped `exampleTransaction.json` (`diff -q` clean); AJV compile+validate against base v3 → valid. |
| `02-minimal.json` | Missing-optional resilience — smallest sensible transaction: `transactionId`, `status` (enum), one participant (`name` + `role` enum). No `propertyPack`. | **Y** | AJV → valid. Base v3 declares **no** `required` at transaction or participant level, so this is the floor; `status`/`role` values are exact enum members. |
| `03-multi-participant.json` | Array iteration + role handling + build info — 3 participants of distinct roles (Seller w/ `sellersCapacity` Legal Owner, Buyer, Seller's Conveyancer w/ organisation), `propertyPack.buildInformation` (`propertyType`/`builtForm`/`yearOfBuild`). NB `propertyPack.priceInformation.price` is a **documented gap**, not a mapping target: it has no `dct:source` predicate in the ontology (headline price was never provenance-anchored — the `opda:MonetaryAmount` price predicates `listPrice`/`soldPrice`/`estimatedPrice` bind to `valuationComparisonData.*` comparables only), so mapping it would fabricate a binding (bind-only-what-exists). Real `opda:MonetaryAmount` construction is regression-tested on `01`'s ground-rent/service-charge leaves instead. | **Y** | AJV → valid. `status` `"Under offer"`, all three `role` values, and every leaf checked against base enums. |
| `04-negative-invalid.json` | Deliberate **ontology-level** defect (see below). Structurally valid JSON that must trip a SHACL violation once mapped. | **Y** (intentionally) | AJV against base v3 → **valid** (that is the point). Against the BASPI5 overlay's `sellersCapacity` `oneOf` → **invalid** (proof pasted in summary). |

## File 04 — exact expected SHACL violation

**Defect:** participant[0] is a `Seller` whose `sellersCapacity.capacity` is
`"Under Power of Attorney"` with **no** `sellersCapacityDetails` and **no**
`attachments`. Everything else in the transaction is conformant, so this is the
single intended failure. This mirrors `source/03-standards/ontology/exemplars/
baspi5-transaction-nonconformant.ttl` (the hand-authored ODR-0010 §Rules (b)
fixture).

**Expected violation once mapped to OPDA RDF:**

- **Shape:** `<https://opda.org.uk/pdtf/shape/Baspi5_SellersCapacityShape>`
  (`sh:NodeShape`, `sh:targetClass opda:Seller`, `sh:xone`, `sh:severity
  sh:Violation`).
- **Form question / trace:** `dct:source` →
  `<https://www.basp.uk/forms/baspi5#B1.3.2>`.
- **Why it fires:** `"Under Power of Attorney"` is branch (b) of the
  `sellersCapacity` `xone` (alongside `Personal Representative for a Deceased
  Owner`, `Assistant`, `Other`). Branch (b) requires an evidenced-authority
  surface (`sellersCapacityDetails` + `attachments`, i.e.
  `opda:hasEvidencedAuthority` on the mapped `opda:Seller`); branch (a)
  (`Legal Owner`, `Mortgagee in Possession`) does not. With neither branch
  satisfiable, the `xone` fails.
- **Message (verbatim from `baspi5.ttl`):** *"BASPI5 question B1.3.2-3: Personal
  Representative / Power of Attorney / Assistant / Other capacity requires
  sellersCapacityDetails + attachments."*

### ⚠ Harness caveat for A3 (validation scope) — read before wiring the negative test

`Baspi5_SellersCapacityShape` lives in the **BASPI5 profile**
(`source/03-standards/ontology/profiles/baspi5.ttl`), **not** in
`public/ontology/artefacts/opda-shapes-merged.ttl`. I confirmed the merged
foundation shapes contain **no** `sh:xone` and **no** Seller-targeting node
shape; their only `hasAssertedCapacity` handling is `CapacityAuthorityMatchRule`
(`sh:severity sh:Info` — it materialises an `unevidenced-capacity` status, it
does **not** raise a Violation).

Consequences:

- The soundness DoD (files 01–03 → 0 violations) is validated against
  `opda-shapes-merged.ttl` as the CONTRACT states.
- The negative DoD ("MUST produce SHACL violation(s)") is **not** pinned to the
  merged shapes by the CONTRACT. For file 04 to fire, `validate_shacl.sh` must
  load **base shapes + the BASPI5 profile** (`profiles/baspi5.ttl`) — exactly
  what the existing `ci-baspi5-roundtrip` gate does
  (`tools/opda-gen/src/opda_gen/ci/baspi5_roundtrip_test.py`). Validating file
  04 against merged-only shapes would report **zero** violations (a false
  negative).

### Foundation-shape fallback (if A3 can only load merged shapes)

If loading the profile is undesirable, the merged shapes **do** carry
Violation-severity controlled-value shapes reachable from layer-1 leaves — e.g.
`BroadbandConnectionValueShape` (`sh:targetSubjectsOf opda:typeOfConnection`,
`sh:in ("None" "ADSL copper wire" "Cable" "FTTC (Fibre to the Cabinet)"
"FTTP (Fibre to the Premises)")`), fed by leaf
`propertyPack.connectivity.broadband.typeOfConnection`. An out-of-list value
there trips that shape against `opda-shapes-merged.ttl` with no profile.

**Caveat on the fallback:** the base v3 JSON schema enumerates that same leaf
with the *identical* list, so an out-of-list broadband value also fails **base
JSON-schema validation** — it is therefore a weaker demonstration (a
well-behaved pipeline would reject it before mapping), which is why I did **not**
use it as file 04's primary defect. The PoA/B1.3.2 pattern is the clean case:
base-v3-valid, ontology-invalid.
