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
| `mapping/opda-pdtf.rml.ttl` | The mapping (`rml:` + `rr:` + `ql:JSONPath`, classic `fnml:functionValue` for enum/date functions). **Canonical deliverable.** |
| `mapping/functions/` | FnO `functions.ttl` + Java UDF sources (`OpdaFunctions.java`) RMLMapper loads via `-f`. |
| `README.md` | This file. |

Ground-truth inputs owned by other agents: `provenance-index.json` (A1, leaf→predicate
map), `testdata/*.json` (A2, instances), `harness/*` + `Makefile` + `tests/` (A3, runner).

## How to run

Engine: **RMLMapper** (Java reference implementation; ADR-0057 Amendments — migrated
from morph-kgc). Self-provisioned by `harness/run_mapping.py` (downloaded +
sha256-verified into the repo-root `.rmlmapper/` cache on first use — needs a JDK, no
other setup). Jena `shacl` for validation.

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
JSONPath role-filter on the iterator (`[?(@.role=="Seller")]` — double-quoted,
no spaces):

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
- **`opda:Address` — RESOLVED at both the ontology level and the RML-mapping level
  (2026-07-05).** ODR-0015 (accepted) ratifies `opda:Address` with structural fields
  `opda:line1` / `opda:line2` / `opda:postTown` / `opda:postcode` / `opda:country` /
  `opda:inspireFeatureId`, but `opda-gen` had only ever emitted `opda:addressVariant`
  of those seven — a real, confirmed ontology-generation gap. When first flagged, this
  was characterised as blocked pending "an ontology-owner decision" citing ODR-0015's
  Q3 "held-as-live dissent" — but per the user's instruction to critique any
  intractability finding before accepting it: the ODR's own Consequences section
  states the dissent *"does not block the verdict... it preserves a falsifiable
  re-open path"* (a future, conditional trigger, not a current blocker). The 6 missing
  properties plus a matching SHACL shape were declared directly (`tools/opda-gen`,
  regenerated corpus, all `ci-ontology` gates pass) — the same "ratified but never
  implemented" pattern as this session's `opda:leaseTerm`/`opda:dependsOnTransaction`
  fixes.

  **RML binding (M34, `mapping/opda-pdtf.rml.ttl`)**: of the ~9 real PDTF address
  occurrences, exactly 2 honestly fit one of the 3 closed `addressVariant` values —
  `propertyPack.address` (`"marketing"`, by elimination against the other two variants
  and real-world PDTF convention — no literal `titleAddress`/`marketingAddress` field
  exists in the current v3 schema, ODR-0015's naming predates this schema revision) and
  `propertyPack.titlesToBeSold[].registerExtract.ocSummaryData.propertyAddress`
  (`"title"` — confirmed via schema traversal: "HMLR Official Copy Register Extract").
  `"inspire"` has zero real source data anywhere in `pdtf-transaction.json` (confirmed
  by direct grep — no `inspireId`/`inspireFeatureId` leaf exists in v3) and is not
  attempted. Both mint via M4's own `$.propertyPack` iterator (avoiding the ancestor-
  context-jump limitation M33 already documents) and join `opda:Property opda:hasAddress`
  the new node, same idiom as `<#PropertyEPCJoin>`. The register-extract's own
  `propertyAddress` is schema `oneOf(object|array)` and the one fixture exercising it
  (`01-conformant-full`) has a genuinely heterogeneous 2-item array (postcode facet and
  address-line facet on separate items) — handled with the ADR-0057 Amendment 1
  existence-filter technique rather than a fragile fixed-index assumption. Verified
  materialising correctly in `01-conformant-full` and `03-multi-participant`;
  `make rml-test` / `make rml-pytest` / `make provenance-test` / `make dct-audit` all
  green.

  **Left unmapped, checked against real schema text (not assumed from field names)**:
  `participants[].address`, `nearbyFacilities.{schools,healthCare}[*].contact.address`
  — schema title is the generic "Address" with no HMLR/listing-agent/INSPIRE framing,
  so none honestly fit the 3 closed variant values; and
  `localLandCharges[*].applicantAddress` / `leaseParty[*].address` /
  `charityDetails.charityAddress` / `surveys[*].declaration.companyAddress` — party-
  contact addresses embedded inside the HMLR register extract's own substructure
  (not the Property's address), which would additionally need Person/Organisation
  nodes minted for each party — a separate, deeper gap, out of this batch's scope.
  None of these force a plausible-sounding tag to satisfy `addressVariant`'s required-
  field constraint; see M34's own comment in the mapping file for the full reasoning.
- **`opda:Survey` has zero domain/range connections anywhere in `opda-merged.ttl`** —
  confirmed by direct search (no property has `rdfs:domain opda:Survey` or
  `rdfs:range opda:Survey`). The two real `propertyPack.surveys[]` leaves that DO have
  predicates (`constructionType`, `reportDate`) are deliberately bound flat onto
  `opda:Property` and `opda:Search` respectively ("flat per §Q6a" — confirmed in each
  predicate's own `rdfs:comment`), not onto a `Survey` node. Minting `rr:class
  opda:Survey` on the `$.propertyPack.surveys[*]` iterator would therefore produce an
  isolated `rdf:type` triple with no other properties and no predicate anywhere to
  join it to the `Property` it describes — not meaningful mapping output. Left
  unmapped; matches the (separately-run, now re-confirmed) ontology-coverage audit's
  category-C classification of `Survey` as architecturally out of RML's reach until
  the ontology gains a real Survey-domain property or join predicate.

## Known deviations (candid)

1. **One `opda:Transaction`, carrying its declaration booleans + `hasParticipant`
   directly; one remaining untyped signature record.** Output contains **exactly one
   `opda:Transaction`** (`txn/{transactionId}`). Under morph-kgc, the deep
   Transaction-domain declaration leaves (`sellerWillEnsure` /
   `confirmationOfAccuracyByOwners` / CPR booleans) and `opda:hasParticipant`
   (Transaction → each Seller/Buyer) could not bind onto that subject: morph-kgc's
   JSONPath multi-select pulled the *entire* `propertyPack` subtree per reference
   (~15-20s/rule), and a role-filter (`[?(@.role==...)]`) embedded mid-path (rather
   than as the whole iterator) resolved to nothing. Since migrating to **RMLMapper**
   (ADR-0057 Amendments): neither limitation applies — merging the declaration
   booleans onto M1 cost no measurable time, and RMLMapper's JSONPath engine (Jayway
   JsonPath) supports a role-filter embedded in a template placeholder. Both are now
   mapped directly onto the single `opda:Transaction` node. One record remains
   **untyped**: `signature/{contractHash}` (`opda:signedOn`) — its iterator
   (`contracts[*].signatures[*]`) didn't resolve when embedded inside RMLMapper's FNML
   input value map (needed for the date-truncation function); a real, but unpursued,
   remaining opportunity, not a hard limitation.
2. **Nested-node IRIs are keyed on locally-stable natural keys** (`titleNumber`,
   `productCode`, `uprn`, `firstName-lastName`, `email`, `contractHash`), not on
   `transactionId + JSONPath`. These keys are unique within one transaction file.
3. **`opda:signedOn`'s record (M1c) and the occupiers/aged-17+ record (M12) stay
   untyped.** M1c per (1) above. M12 is untyped for an *independent* reason, not
   performance: A1's index gives its two properties (`aged17OrOverNames`,
   `hasOthersAged17OrOver`) domain `opda:Seller`, but the occupiers/aged-17+ JSON
   block is not itself a Seller party — typing it `opda:Seller` would mint a spurious
   individual. OPDA domains are documentary, never entailed (ODR-0025/0026), so an
   untyped bearer is fully consistent.
