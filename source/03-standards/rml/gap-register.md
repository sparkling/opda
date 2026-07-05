# Gap register & adversarial audit — `opda-pdtf` RML mapping (C1, devil's advocate)

> **SUPERSEDED — 2026-07-05.** The body below is a point-in-time audit from
> when the mapping covered ~15% of the ontology surface; it predates many
> sessions of gap-closing work and its numbers are stale. The current,
> authoritative, mechanically-regenerable coverage state is
> `source/03-standards/rml/build/final-gap.json` (regenerate with
> `python3 build/final_scope2.py` from this directory): **465/472
> schema-generated resources mapped (98.5%)**.
>
> This session's closures, in two rounds. Round 1 reopened items an earlier
> pass had wrongly written off as "zero JSON basis": `opda:NameChangeEvent`
> and `opda:LeaseExtensionEvent` (real hooks:
> `participants[].name.maidenName`/`.lastName`;
> `ownershipsToBeTransferred[].leaseholdInformation.enfranchisement.
> enfranchisementSteps`), plus `opda:roleNotation`,
> `opda:numberOfSellers`/`numberOfNonUkResidentSellers` (domain retargeted
> `Proprietorship`→`Transaction`), `opda:hasRegisteredTitle`, and
> `opda:identifiesSameProperty`. Round 2, prompted by a direct challenge not
> to trust prior ADR/ODR reasoning or the "leaves" framing at face value,
> found that `opda:evidenceType`/`opda:digest`/`opda:attestedBy`/
> `opda:Verifier` were marked "out of ODR-0035's mapping scope" for a real
> but WRONG reason: the data lives in a genuinely separate, real PDTF schema
> (`verifiedClaims/pdtf-verified-claims.json`, OIDC4IDA-shaped, correlated to
> a transaction via its own `transactionId`) that this mapping's own harness
> had never been extended to trace — not a fact about the data. Extended
> `harness/run_mapping.py` with an optional second logical source and closed
> all four. The same pass also found `opda:potentialCost`'s `MonetaryAmount`
> range was a genuine ontology-generator bug — a batch decision (ODR-0024 R3)
> that swept ~18 monetary leaves into one range convention without
> re-checking that this ONE field is `type: string` in the schema, unlike
> its ~17 numeric siblings — fixed by retargeting the range to `xsd:string`
> in the generator and mapping it directly.
>
> The remaining 7 (2 classes: `AssuranceLevel`, `UPRNSuccessionEvent`; 5
> properties: `inspireFeatureId`, `founds`, `playedBy`, `plays`,
> `hasEvidencedAuthority`) were re-verified against the FULL invariant JSON
> schema corpus (not just `pdtf-transaction.json` — also `verifiedClaims/`,
> `trust-framework/`, and the v1/v2 schema trees) — confirmed genuine,
> permanent exclusions: zero data anywhere for the first three; a real
> structural mismatch (a distinct qua-individual Role node the ontology's
> actual co-typing convention never mints) for `founds`/`playedBy`/`plays`;
> and a schema-less, free-form `claims` bag with no field name concretely
> specified for capacity/authority for `hasEvidencedAuthority`. See
> `HANDOVER-2026-07-05-rml-mapping-and-ontology-gap-closing.md` and
> `docs/adr/ADR-0057-rml-mapping-implementation.md`'s Amendments for full
> per-item reasoning.

Audit of the claim that the PDTF v3 JSON → OPDA RDF mapping at
`source/03-standards/rml/` is **"sound AND complete"**. Every finding below is backed
by materialised triples and command output. I own only this file; I changed no
mapping, harness, index, or test data.

---

## (i) Executive verdict — is "sound and complete" honest?

**Partly, and only under a scope qualifier that the phrase does not carry on its
own.** The mapping is genuinely *sound in the narrow SHACL sense the CONTRACT
defines*: the conformant instance CONFORMS against `opda-shapes-merged.ttl` with
0 violations, every one of the 64 emitted predicates and all 10 emitted classes
is declared in `opda-merged.ttl` (zero invented IRIs), every instance node lives
under `…/harness/data/` (zero namespace violations), and the date literals are
lexically valid `xsd:date` (morph-kgc truncates the source dateTimes — the
README's self-flagged "dateTime tagged xsd:date" defect does **not** exist in the
output). But three things make the bare phrase "sound and complete" misleading:
(1) the **negative test is hollow** — the intended `Baspi5_SellersCapacityShape`
never fires because the mapping emits **no `opda:Seller` node** for the offending
participant; the test passes only on *accidental, unrelated* violations that also
fire on conformant data, so the pipeline is **not shown to catch the ontology
defect it claims to catch**; (2) "complete" describes **69 of 454 instance
scalar leaves (15%)** — honest only with the ever-attached "layer-1 leaves that
occur in the instance" qualifier, and it silently drops real values (e.g.
broadband `supplier` = "BT"); (3) the RDF **fragments one logical transaction
into three `opda:Transaction` individuals**, two of which carry no
`transactionId` — SHACL-clean but a misrepresentation of reality. "Sound" holds;
"complete" is a scoped term of art, not the plain-English claim; and the negative
half of the definition-of-done is not genuinely demonstrated.

---

## (ii) Completeness triage — all 385 unmapped leaves

Denominator: the conformant instance (`01-conformant-full.json`) has **454
distinct scalar leaf paths** / 518 occurrences (from
`build/completeness-report.json`). 69 are layer-1 mapped and covered; **385 are
unmapped**. Triage (script: last-path-segment vs. the set of `owl:Datatype/Object`
property local names declared in `opda-merged.ttl`):

| Category | Count | Meaning |
|---|---:|---|
| (a) LAYER-2 SHOULD-MAP | **29 occ / 24 distinct predicates** | leaf's last segment IS an existing OPDA property (shared/collapsed) but the leaf was not mapped |
| (b) GENUINE GAP | **348** | no OPDA predicate exists for the leaf — legitimately unmappable (bind-only-what-exists) |
| (c) STRUCTURAL / ID | **8** | `$schema`, `externalIds.*`, `role`, `uprn`, `transactionId` (identity/keys, not data) |

**(a) Shared/collapsed predicates left unmapped** (real under-coverage the word
"complete" hides): `opda:riskIndicator` ×5, `opda:name` ×2 (signature names),
`opda:price` (`propertyPack.priceInformation.price` — the **headline sale
price**), `opda:amount`, `opda:status` (top-level transaction status),
`opda:supplier` (`connectivity.broadband.supplier` = "BT"), plus 18 boolean
`has*/is*` disclosures (`hasBeenFlooded`, `isInsured`, `isSharedOwnership`,
`isGroundRentPayable`, `hasSmartHomeSystems`, `soldWithVacantPossession`, …). All
have a sound predicate in the ontology and could be bound.

**Concrete silent-drop proof — `opda:supplier`:** A1's index collapses **9**
leaf_paths onto `opda:supplier`; the mapping binds the 4 that occur in the
instance (electricity/water/telephone/cableSatelliteTV). But
`propertyPack.connectivity.broadband.supplier` (value **"BT"**, present in the
instance) is **absent from A1's index** and produces **no triple** — a real value
dropped with no gap-register entry.

### Honest completeness metric

- Leaves with **any** sound ontology predicate: **69 (layer-1) + 29 (layer-2
  name-match) = 98**.
- **Coverage of mappable leaves: 69 / 98 = 70.4 %.**
- **Coverage of all instance leaves: 69 / 454 = 15.2 %.**
- Layer-1-only coverage (the mapping's own scoped claim): **69 / 69 = 100 %**,
  0 dropped — true, but a denominator of the mapping's own choosing.

"Complete" is defensible **only** as "100 % of the layer-1 leaves A1's index
happens to contain that also occur in this instance". As a bare adjective on the
mapping it is misleading; ~85 % of the instance's data content produces no RDF.

---

## (iii) Findings

| # | Front | Severity | Evidence | Recommendation |
|---|---|---|---|---|
| F1 | Negative-test integrity | **BLOCKER** | `build/neg.nt`: 0 nodes typed `opda:Seller`, 0 `capacity/hasAsserted/hasEvidenced` triples; `pat.attorney` typed `opda:Person`. `validate_shacl.sh neg.nt baspi5.ttl` returns violations, but they are `opda:builtForm` NodeKind-IRI and `opda:propertyType` A1.8 `sh:in` — **not** `Baspi5_SellersCapacityShape`. The same two violations fire on the **conformant** `out.nt` against baspi5, so they do not isolate the injected defect. `test_negative_reports_violation` only asserts `returncode==1` + `"sh:Violation" in stdout` — it never checks *which* shape fired. | The mapping needs a triples-map that reads `participants[*]` with `role == "Seller"`, types the node `opda:Seller`, and emits the `sellersCapacity`/`hasAssertedCapacity` surface. Then the test must assert the specific `Baspi5_SellersCapacityShape` focus node/message, not any violation. Until then the negative DoD is unmet. |
| F2 | Transaction fragmentation | **MAJOR** | `grep type Transaction build/out.nt` → **3** individuals: `txn/LnRdGiBUkLbnuNJ89p4CEj` (has `transactionId`), `txn/declarations/1241304304`, `txn/signature/IYnBjUI8…` (neither carries `transactionId`). No Transaction shape has a minCount/uniqueness/functional-key that fragmentation breaks (`opda-shapes-merged.ttl`: `TransactionIdentityKeyShape`, `FixturesShape` — neither constrains identity/cardinality), so it is SHACL-clean. | Post-merge the three fragments to one IRI (json_normalize-deep from root, or a second pass that rewrites the declaration/signature subjects to `txn/{transactionId}`). Asserting three transaction individuals — two identity-less — is a semantic defect even though no shape catches it. |
| F3 | Completeness honesty | **MAJOR** | Section (ii): 69/454 (15 %) of leaves mapped; 24 shared predicates + the broadband `supplier`="BT" value silently unmapped; `opda:price` (sale price) never mapped in any fixture. | Never surface "complete" without the "layer-1 / this-instance" qualifier. Add the 24 name-matched layer-2 predicates (esp. `price`, top-level `status`, broadband `supplier`, the boolean disclosures) and add broadband `supplier` to A1's index. Report the 70 %/15 % metric in README. |
| F4 | Date lexical honesty | **MINOR** | `grep -E '"[^"]*T[^"]*"\^\^…#date>' build/out.nt` → **none**. Source has `2022-10-06T08:55:49.483`; output has `"2022-10-06"^^xsd:date` (valid). README "Known deviation #3" claims the emitted literal is "lexically a dateTime tagged xsd:date" — **false**; morph-kgc truncated it. | Correct README deviation #3: the datetimes are truncated to valid `xsd:date`; there is no ill-typed literal. (This is soundness in the mapping's favour; only the doc is wrong.) |
| F5 | Enum soundness vs. profile | **MINOR / ACCEPTED** | `out.nt` emits `opda:builtForm "Detached"`, `opda:propertyType "Park home"`, `opda:centralHeatingFuelType "Other"` as plain string literals. Against `baspi5.ttl` these trip NodeKind-IRI / `sh:in` violations (they are the accidental violations behind F1). In-scope per CONTRACT (validated only vs. merged shapes, where they pass). | If BASPI5 conformance is ever claimed, route these enums to scheme IRIs (`…/scheme/{prop}/{value}`) as done for `opda:currency`. Today it is a documented scope boundary, not a merged-shapes defect. |
| F6 | Test-data adequacy | **MINOR** | `make rml-test` runs **only** `01-conformant-full.json` (Makefile `INSTANCE`); `02-minimal.json` and `03-multi-participant.json` are never materialised, validated, or asserted by the harness or pytest. Materialising 03 by hand: 13 triples, 3 `opda:Person` (array iteration works), but **0** MonetaryAmount / **0** `price`/`amount` / no `450000` — contradicting MANIFEST's "price 450000 → opda:MonetaryAmount". | Either wire 02/03 into the pytest matrix (they exercise multi-participant iteration and the minimal floor) or delete them as dead fixtures. Correct MANIFEST's 03 claim — `priceInformation.price` is not mapped anywhere. |

**Fronts that survived attack (ACCEPTED — no defect):**

- **Invented / unsanctioned IRIs:** none. All 64 `opda:` predicates + `prov:wasGeneratedBy` + all 10 rdf:type classes are declared in `opda-merged.ttl`.
- **Namespace law:** every subject IRI is under `https://opda.org.uk/pdtf/harness/data/`; the only non-`harness/data` object IRIs are the sanctioned `…/scheme/currency/GBP`.
- **`localAuthority → opda:Search` typing:** faithful — `opda:localAuthorityName rdfs:domain opda:Search` (line 1281 of `opda-merged.ttl`). The typing mirrors the ontology's own domain; any objection is with the ontology, not the mapping.
- **Soundness (merged shapes):** conformant instance → CONFORMS, 0 violations (re-verified).

---

## (iv) Genuine gap register (category-b — legitimately unmappable, 348 leaves)

These instance leaves have **no** sound predicate in `opda-merged.ttl`; emitting
them would require minting predicates (forbidden by CONTRACT / bind-only-what-
exists, S034/ODR-0022). They are **expected** and are **not** completeness
failures. Grouped by last path segment (152 distinct segments); representative
clusters:

- **Register-extract / OC-summary (HMLR) indicators** — `bankruptcyIndicator`,
  `cautionIndicator`, `chargeIndicator`, `creditorsNoticeIndicator`,
  `deathOfProprietorIndicator`, `classOfTitleCode`, `editionDate`,
  `currentProprietorshipDate`, `chargeDate`, `chargeID`, `chargeParty`,
  `documentType`, `entryNumber`, … (the deepest, densest gap cluster — the
  ontology models none of the raw HMLR register surface).
- **Estate-agency fee schedule** — `additionalChargeForBrochureExVat`,
  `additionalChargeForEpcExVat`, `additionalFeesOnSale`,
  `additionalChargeForPremiumPhotosExVat`, … (fee fixtures ⇒ ODR-sourced
  `opda:price`, not data-dictionary leaves).
- **Address components** — `line1`, `town`, `postcode`, `countryCode`,
  `administrativeArea`, `districtName` (no flat address predicates minted;
  address is modelled as a node the mapping does not build).
  **UPDATE 2026-07-05**: this finding is superseded for `line1`/`town`/`postcode` —
  `opda:Address`'s structural properties are now real (ODR-0015, declared in
  `opda-gen`) and M34 (`mapping/opda-pdtf.rml.ttl`) binds `propertyPack.address` and
  the HMLR register-extract `propertyAddress` onto them. `countryCode` maps to
  `opda:country`; `administrativeArea`/`districtName` remain unmapped (no OPDA
  structural-field target beyond line1/line2/postTown/postcode/country/
  inspireFeatureId — a genuine, smaller, still-current sub-gap). See README.md's
  `opda:Address` entry for the full account.
- **Seller-capacity evidence surface** — `capacity`, `attachments`, `details`
  (these are exactly what F1 needs but are currently gaps because the Seller
  node is never minted).
- Misc booleans/enums with no ontology term — `certificateIsSupplied`,
  `agreedNoticeIndicator`, `commonholdIndicator`, `eeDataIndoor`, …

Full machine-readable list: `build/gap-register.json` (`groups`, 385 entries
incl. the 29 layer-2 name-matches and 8 structural — the 348 here are the subset
with no predicate).

---

## Reproduction

```bash
cd source/03-standards/rml
make rml-test                                   # 01: map -> CONFORMS -> layer-1 100%
python3 -c "import json;print(json.load(open('build/completeness-report.json'))['totals'])"
# negative — proves F1:
../opda-gen/.venv/bin/python harness/run_mapping.py --mapping mapping/opda-pdtf.rml.ttl \
  --data testdata/04-negative-invalid.json --out build/neg.nt
grep -c 'pdtf/Seller>' build/neg.nt                         # -> 0  (no Seller target)
bash harness/validate_shacl.sh build/neg.nt \
  ../../source/03-standards/ontology/profiles/baspi5.ttl    # violations are builtForm/propertyType, NOT SellersCapacity
bash harness/validate_shacl.sh build/out.nt \
  ../../source/03-standards/ontology/profiles/baspi5.ttl    # SAME violations fire on the CONFORMANT instance
grep 'type> <https://opda.org.uk/pdtf/Transaction>' build/out.nt | wc -l   # -> 3  (F2)
```

---

## Resolution status (post-audit — verified by the coordinator)

The findings above were **true at audit time**. After remediation and independent
re-verification (full rdflib re-run of all four fixtures), the state is:

| Finding | Audit severity | Resolution |
|---|---|---|
| **F1** negative test hollow (no `opda:Seller` target) | BLOCKER | **FIXED.** Mapping now types `participants[?role=="Seller"]` as `opda:Seller` + emits `opda:hasAssertedCapacity` (controlled-scheme IRI); the negative test now parses the SHACL graph and asserts a Violation whose `sh:sourceShape` **is** `Baspi5_SellersCapacityShape`. Verified firing on the specific shape. |
| **F2** 3 `opda:Transaction` for 1 | MAJOR | **FIXED** (exactly 1 `opda:Transaction` node now). Fix method: the two extra nodes (`declaration/{uprn}`, `signature/{contractHash}`) had their spurious `rdf:type opda:Transaction` **dropped** — they remain as untyped records bearing the declaration booleans / `signedOn`. NB: morph-kgc genuinely **cannot** reach nested scalar refs from the root `$` iterator on the real deeply-nested, array-bearing instance (verified: `propertyPack.uprn` from `$` → 0 triples), so consolidating everything onto one node is not achievable in this engine — the coordinator's earlier claim that root nested-refs work was based on an unrepresentative shallow toy JSON and does **not** hold on the real data. Mild residual: the declaration/signature records are not graph-linked to the transaction node (documented in README "Known deviations" #1). |
| **F3** "silent drops" / 15% coverage | MAJOR | **RE-RULED — not a defect.** No drops are silent: the runtime `build/gap-register.json` captures all unmapped leaves. The named leaves (headline `priceInformation.price`, `broadband.supplier`) are **genuine gaps** — no `dct:source` predicate exists; mapping them would fabricate a binding (bind-only-what-exists). Honest scoped completeness (layer-1, provenance-anchored) stands. |
| yearOfBuild dropped (surfaced later by wiring fixture 03) | MAJOR | **FIXED.** `buildInformation.yearOfBuild → opda:yearOfBuild` added; completeness 0-dropped across 01/02/03. |
| README "date deviation #3" factually wrong | MINOR | **FIXED** (removed). |
| 02/03 dead fixtures; MANIFEST 03 price claim | MINOR | **FIXED.** 02/03 now materialised + SHACL + completeness asserted; MANIFEST corrected (price = documented gap). |

Final independent verification: `make rml-test` PASS (01/02/03 sound + layer-1
complete, 04 violates); pytest **8/8**; 1 Transaction node; 0 invented
predicates/classes; MonetaryAmount construction (amount+currency) present; every
node under `…/harness/data/`.

### New finding — ontology-internal contradiction the mapping exposed
`opda:hasAssertedCapacity` is declared `owl:DatatypeProperty` (objects must be
literals), yet the merged `PersonIdentityKeyShape`/Organisation shapes require it
be `xsd:string` (sh:Violation) **while** `profiles/baspi5.ttl` requires it
`sh:nodeKind sh:IRI` from `opda:SellersCapacityScheme`. These three constraints
on one property are mutually unsatisfiable on a single node. The mapping worked
around it by keying the `opda:Seller` node separately from the `opda:Person` node
(so the IRI-valued capacity never lands on a Person). **This is an ontology bug,
not a mapping defect** — flagged for the ontology owners (OPDA does not evaluate
OWL-DL entailment, so it currently passes the SHACL gate, but the DatatypeProperty
declaration and the `nodeKind IRI` shape are contradictory).
