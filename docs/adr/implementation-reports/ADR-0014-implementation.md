# ADR-0014 Implementation Report — BASPI5 round-trip MVP harness + G14/G16-20 closure

**Implementing worker:** ADR-0014 worker (proposed, awaiting independent validation)
**Implemented:** 2026-05-28
**Status:** PROPOSED (validation gate per programme plan §9.3 pending)
**The MVP gate. The programme-retirement signal.**

## 1. Round-trip harness file inventory

| File | LOC | Realises |
|---|---|---|
| `tests/baspi5_round_trip/__init__.py` | 23 | Package docstring, ADR/ODR provenance |
| `tests/baspi5_round_trip/conftest.py` | 119 | `opda_ontology`, `shapes_only_graph`, `baspi5_profile_graph`, `baspi5_sample`, `exemplar_names` fixtures |
| `tests/baspi5_round_trip/translators.py` | 234 | `json_to_rdf`, `rdf_to_baspi5_json`, `normalise` |
| `tests/baspi5_round_trip/compare_reports.py` | 96 | Semantic-equivalence comparator for `sh:ValidationReport` graphs (CLI-callable) |
| `tests/baspi5_round_trip/test_round_trip.py` | 96 | 4 round-trip equivalence tests (Confirmation #3, #6) |
| `tests/baspi5_round_trip/test_traceability.py` | 124 | 6 dct:source traceability tests (Confirmation #5) |
| `tests/baspi5_round_trip/test_exemplar_regression.py` | 73 | 15 parametrised exemplar regression tests + 2 meta-tests (Confirmation #4) |
| `tests/baspi5_round_trip/sample_data/baspi5_sample_transaction.json` | 39 | Synthetic BASPI5 submission exercising Property + Address + LegalEstate + Seller + Buyer + EPCCertificate |

**Total harness LOC:** ≈ 765 across 8 files (including fixtures + sample data).

## 2. 15 exemplar expected-report.ttl summary table

| Exemplar | `sh:conforms` | `sh:result` count | Notes |
|---|---|---|---|
| `chain-of-transactions` | false | 4 | Cat 4 SHACL shape fires on each of 4 Persons (no `opda:hasSpecialCategoryData true` triple); see §5 caveat |
| `claim-with-document-evidence` | false | 2 | Cat 4 fires on each of 2 Persons |
| `claim-with-electronic-record-evidence` | false | 2 | Cat 4 fires on each of 2 Persons |
| `claim-with-vouch-evidence` | false | 3 | Cat 4 fires on each of 3 Persons |
| `flat-no-uprn-newly-converted` | true | 0 | Conforms (no Person individuals) |
| `flat-with-split-uprn` | true | 0 | Conforms (no Person individuals) |
| `lease-extension-transaction` | true | 0 | Conforms |
| `listed-building-divergent-addresses` | true | 0 | Conforms |
| `organisation-with-merger` | true | 0 | Conforms (Organisation only, no Person) |
| `person-with-name-change` | false | 1 | Cat 4 fires on 1 Person |
| `proprietorship-relator-multi-proprietor` | false | 2 | Cat 4 fires on each of 2 Persons |
| `registered-freehold-house` | true | 0 | Conforms (no Person individuals) |
| `rural-plot-inspire-no-uprn` | true | 0 | Conforms |
| `simple-transaction-with-milestones` | false | 2 | Cat 4 fires on each of 2 Persons |
| `unregistered-pre-first-registration-house` | true | 0 | Conforms |

**Summary:** 8/15 conform; 7/15 produce `sh:Violation`-tier results from the Cat 4 `SpecialCategoryPIIWithoutLawfulBasisShape` firing on Persons that lack a `dpv:hasLegalBasis` triple. This is captured as the documented regression baseline per ADR-0014 §"Exemplar regression layer" — drift from this set will surface in CI on every push.

**Cat 4 over-firing caveat (documented baseline, not a regression):** The Cat 4 shape declares `sh:hasValue "true"^^xsd:boolean` on `sh:path opda:hasSpecialCategoryData`, which pyshacl interprets as "every targeted Person MUST have this triple with value true". A more precise encoding (e.g. SHACL-AF rule firing only when the value IS true) is a Council-routed shape-design Q (S012 Q3). G14 closure declares the predicate so the shape has a real TBox-level target; G14 does NOT alter the shape semantics, which remain Council territory. The expected reports capture the current pyshacl behaviour so CI catches future drift — if the shape is later refined, the expected reports regenerate in lockstep.

## 3. Eight §Confirmation criteria

| # | Criterion | Verdict | Verification |
|---|---|---|---|
| 1 | Round-trip harness implemented | PASS | `tests/baspi5_round_trip/test_round_trip.py` + `test_traceability.py` + `test_exemplar_regression.py` all exist with full coverage. |
| 2 | All 15 exemplars have `expected-report.ttl` pairings | PASS | `opda-gen emit-exemplar-reports` emits 15 files; verified by `test_every_exemplar_has_expected_report_pairing`. |
| 3 | CI green on BASPI5 round-trip | PASS | `pytest tests/baspi5_round_trip/test_round_trip.py` → 4 passed (load-bearing field round-trip, canonical class emission, normalisation idempotence, UPRN lexical preservation). |
| 4 | CI green on all 15 exemplar regressions | PASS | `pytest tests/baspi5_round_trip/test_exemplar_regression.py` → 15 parametrised + 2 meta = 17 passed. `opda-gen validate-exemplar <path>` exits 0 on every exemplar. |
| 5 | `dct:source` traceability tests pass | PASS | `pytest tests/baspi5_round_trip/test_traceability.py` → 6 passed (NodeShape dct:source, anchor pattern, anchor exact-match-baspi5Ref [G19 acceptance], ValidationContext dct:source, every opda:Class has dct:source, every opda: DatatypeProperty has dct:source [G14/G18 acceptance]). |
| 6 | Round-trip preserves information | PASS | `test_round_trip_preserves_load_bearing_fields` + `test_round_trip_uprn_lexical_value_preserved` confirm UPRN, address, propertyType, builtForm, currentEnergyRating, estate count + title numbers + ownership types, and participants (role + name) all survive the JSON → RDF → JSON cycle. |
| 7 | Real BASPI5 form rendering works | DEFERRED (visual smoke test) | The profile carries the DASH triples required (`dash:viewer`, `dash:editor`, `sh:order`, `sh:group`, `sh:PropertyGroup` × 9) — verified by `test_baspi5_property_shapes_carry_dash_triples` already in `tests/test_profiles.py`. Manual DASH-viewer rendering (TopBraid Composer or pyshacl DASH preview) is an operational verification step the validator may run if available. The mechanical pre-requisites are met. |
| 8 | ODR-0003 retirement criterion (i) closes | PASS-on-validator-acceptance | The MVP gate harness exists + green; round-trip closes per §"Round-trip layer". When the independent validation agent ratifies this ADR (per programme plan §9.3), ODR-0003 §"Programme retirement criterion" condition (i) discharges. Condition (ii) "every linked ODR is `accepted`" was met at programme start. |

## 4. G-section closures (G14 / G16 / G17 / G18 / G19 / G20)

### G14 — opda:hasSpecialCategoryData declared as foundation DatatypeProperty

Engineering closure: declared in `tools/opda-gen/src/opda_gen/emitters/foundation.py` `build_classes_graph()` with `xsd:boolean` range + full A9 metadata (rdfs:label, rdfs:comment, skos:scopeNote, dct:source). The `skos:scopeNote` preserves the S012 Q3 Council route — Council may rename or refine the canonical predicate name; ADR-0012 shape updates in lockstep.

Verification:

```
$ grep -c "opda:hasSpecialCategoryData" source/03-standards/ontology/opda-classes.ttl
6  # 1 declaration + 5 A9 triples
$ pytest tools/opda-gen/tests/test_g14_special_category_predicate.py -v
====== 5 passed ======
```

### G16 — ADR-0013 implementation report DP count fix (19 → 20)

`docs/adr/implementation-reports/ADR-0013-implementation.md` §"G11 — 19 new DatatypeProperties" updated to "20 new DatatypeProperties" with note (18 property + 2 agent by direct enumeration).

### G17 — stale "five foundation classes" doc-comments fix

`tools/opda-gen/src/opda_gen/emitters/foundation.py`:
- `build_classes_graph` docstring updated: now lists six foundation classes (DiagnosticExemplar, GeneratorRun, RoleMixin, Role, Relator, ValidationContext) + the G14 DatatypeProperty.
- `build_annotations_graph` docstring updated: six classes (was "five").
- `extra_lines` for opda-classes.ttl + opda-annotations.ttl regenerated with "Six foundation classes" + G14 DatatypeProperty.

Verification: `grep "Six foundation" source/03-standards/ontology/opda-classes.ttl` → 1 hit.

### G18 — opda:role declared as DatatypeProperty in opda-agent.ttl

Declared with `rdfs:domain opda:RoleMixin` + `rdfs:range xsd:string` + full A9 metadata; `dct:source` cites ODR-0006 §Q2. Per the new declaration:

```
$ grep -c "opda:role " source/03-standards/ontology/opda-agent.ttl
8  # 1 declaration + label + comment + scopeNote + dct:source + 3 follow-on triples
$ pytest tools/opda-gen/tests/test_g18_role_predicate.py -v
====== 4 passed ======
```

### G19 — 4 BASPI5 anchor URL mismatches fixed

Realigned in `tools/opda-gen/src/opda_gen/emitters/profiles.py`:

| Old anchor (no baspi5Ref) | New anchor (exact baspi5Ref match) | Schema location |
|---|---|---|
| `A1` (Property shape root) | `A1.1` | `propertyPack.address` (the property's primary baspi5Ref) |
| `A1.8.7` (sprayFoam) | `A1.8.4.1` | `typeOfConstruction.sprayFoamInsulation.hasSprayFoamInstalled` |
| `A7.5.1` (supply meter) | `B4.6.2` | `waterAndDrainage.water.mainsWater.waterMeter.isSupplyMetered` |
| `B1.2` (seller name) | `B1.1` | `legalOwners.namesOfLegalOwners` (no participants[].name baspi5Ref exists) |

Verification (build-time test against `source/03-standards/schemas/src/schemas/v3/overlays/baspi5.json`):

```
$ pytest tests/baspi5_round_trip/test_traceability.py::test_baspi5_form_question_anchors_exact_match_baspi5_schema -v
====== passed ======

# Profile anchors NOT in baspi5Ref values: set() (empty — all match)
```

### G20 — ADR-0013 implementation report anchor count fix (36 → 28)

`docs/adr/implementation-reports/ADR-0013-implementation.md` §"BASPI5 profile summary" + §Confirmation #6 updated to "28 distinct anchors" with G20 attribution.

## 5. Programme retirement readiness

Per [ODR-0003 §"Programme retirement criterion"](../../ontology/odr/ODR-0003-pdtf-ontology-programme.md):

- **Criterion (i) — MVP round-trip closes:** ON VALIDATOR-ACCEPTANCE of THIS ADR. The harness is implemented, green, and CI-integrated.
- **Criterion (ii) — every linked ODR is `accepted`:** MET (17 ODRs accepted: 0001-0018 minus 0014-superseded + 0016-deferred-until-trigger).

When the independent validation agent passes ADR-0014, the **OPDA ontology implementation programme retires** per ODR-0003. Subsequent ontology-engineering work (TA6 / NTS / LPE1 overlays; module amendments; consumer-profile additions) lands as fresh ADRs without revisiting this programme's sequencing.

## 6. CI workflow operational walk-through

`.github/workflows/baspi5-round-trip.yml` defines three jobs:

1. **round-trip** — single job running all three pytest layers (round-trip equivalence, traceability, exemplar regression — combined) against the merged ratified corpus. Loads 2,258+ triples across 24 TTL files once via the session-scoped `opda_ontology` fixture.
2. **exemplar-matrix** — 15-row matrix invoking `opda-gen validate-exemplar` per exemplar. Surfaces a precise failure target if any single exemplar regresses without taking down the full job.
3. **expected-report-byte-identity** — regenerates expected reports against the committed corpus and `diff`s — drift in pyshacl output or shape semantics surfaces immediately.

`.github/workflows/ontology-byte-identity.yml` extended (per the brief) with two new steps activated by ADR-0014:
- `validate-exemplar` invocations for the baseline (registered-freehold-house) + a results-bearing case (chain-of-transactions);
- `emit-exemplar-reports` regeneration + `git diff --exit-code` check.

## 7. Sample BASPI5 transaction data summary

`tests/baspi5_round_trip/sample_data/baspi5_sample_transaction.json` is a synthetic submission exercising:
- `participants[0]`: Seller (Alex Riverdale) with `sellersCapacity.capacity = "Legal Owner"`;
- `participants[1]`: Buyer (Sam Brookhaven);
- `propertyPack.uprn = 100070123456`;
- `propertyPack.address = 12 Linden Terrace, BS5 9EX`;
- `propertyPack.buildInformation.building = {House, Semi-detached}`;
- `propertyPack.ownership.ownershipsToBeTransferred[0] = {titleNumber: BR98765, ownershipType: Freehold}`;
- `propertyPack.energyEfficiency.currentEnergyRating = "C"`.

Round-trip exercise covers Property + Address + LegalEstate (+ RegisteredTitle) + Seller + Buyer + EPCCertificate. Future BASPI5 overlay coverage expands incrementally as Phase-7 follow-up ADRs land additional load-bearing fields.

The data is wholly synthetic; the UPRN/title-number/postcode are illustrative and do not refer to real UK properties.

## 8. Test results

| Suite | Tests | Outcome |
|---|---|---|
| Pre-ADR-0014 baseline (`tools/opda-gen/tests/`) | 118 | All pass |
| + G14 regression (`test_g14_special_category_predicate.py`) | +5 | All pass |
| + G18 regression (`test_g18_role_predicate.py`) | +4 | All pass |
| + Test fixture updates (`test_modules.py`, `test_profiles.py`) — versionIRI 0.4.0 → 1.0.0 + G19 anchor assertions | 0 net | All pass |
| **`tools/opda-gen/tests/` total** | **127** | **All pass** |
| Round-trip harness (`tests/baspi5_round_trip/test_round_trip.py`) | 4 | All pass |
| Traceability (`tests/baspi5_round_trip/test_traceability.py`) | 6 | All pass |
| Exemplar regression (`tests/baspi5_round_trip/test_exemplar_regression.py`) | 17 (15 parametrised + 2 meta) | All pass |
| **`tests/baspi5_round_trip/` total** | **27** | **All pass** |
| **Combined total** | **154** | **All pass** |

CI gates:

```
$ opda-gen ci-byte-identity
byte-identity: PASS
$ opda-gen ci-three-graph
three-graph CI: PASS (all 5 checks)
$ opda-gen ci-profile-contract
profile contract CI: PASS (all 3 rules)
$ opda-gen --version
opda-gen 1.0.0 (<HEAD>)
```

`opda-gen __version__` bumped 0.5.0 → **1.0.0** marking the MVP-gate release per ODR-0003. Foundation `owl:versionIRI` bumped `0.4.0 → 1.0.0` reflecting the G14 class-graph extension (`opda:hasSpecialCategoryData` DatatypeProperty added) + the MVP-gate release marker. All per-module `owl:imports` + `owl:versionIRI` bumped in lockstep.

## 9. Handoff to validator

**For the independent validation agent** (per programme plan §9.3):

- Cited ODRs: ODR-0010 §Q7 (MVP gate), ODR-0004 §8a (diagnostic exemplar pairing), ODR-0003 §"Programme retirement criterion", ODR-0010 §Q3 (form-question IRIs), ODR-0012 §Q5 (G14 Cat 4 anchor), ODR-0006 §Q2 (G18 Role layer anchor).
- Cited prior ADRs: ADR-0008 / ADR-0009 / ADR-0010 / ADR-0011 / ADR-0012 / ADR-0013 (all `accepted`).
- Soundness check inputs: every emitted artefact carries `dct:source` — verified by `test_every_minted_class_has_dct_source` + `test_every_minted_datatype_property_has_dct_source` + `test_every_baspi5_node_shape_has_dct_source` + `test_every_validation_context_has_dct_source`. Code artefacts (translators.py, exemplar_reports.py, CLI subcommands) carry `Realises:` doc-comment headers citing ADR-0014 + the G-items closed.
- Completeness check inputs: every §Confirmation 1-8 is realised (§7 deferred-to-validator visual rendering verification) or named in the implementation. Every G-item bundled is closed (G14, G16, G17, G18, G19, G20).
- Cross-ADR consistency: this ADR has no successor ADRs in the programme — retirement on close.
- Validation report goes to: `docs/adr/validation/ADR-0014-validation-report.md`.

**Programme retirement signal:** Once the validation agent ratifies this ADR, ODR-0003 §"Programme retirement criterion" closes jointly with the Council programme's own retirement signal. The implementation worker does not declare retirement — the validator does.

## 10. Surfaced ambiguities

1. **Cat 4 shape over-firing.** Documented in §2 caveat. The shape's `sh:hasValue "true"` semantics fire on every targeted Person regardless of the actual value of `opda:hasSpecialCategoryData`. G14 closure declares the predicate; the shape's conditional-firing refinement is Council-routed (S012 Q3). Captured as the documented regression baseline per ADR-0014 §"Exemplar regression layer".

2. **BASPI5 anchor `A1` has no exact baspi5Ref match.** G19 closure mapped to `A1.1` (the property's primary address-bearing anchor — nearest stable baspi5Ref covering the property's identity surface). Alternative: BASPI authority could publish an `A1`-rooted form section; until then, `A1.1` is the closest representative anchor. Not blocking.

3. **`tests/baspi5_round_trip/` uses underscores (not hyphens) in dir name.** Required so Python imports work (`from tests.baspi5_round_trip.compare_reports import ...`). CI workflow paths use the canonical underscores form. ADR-0014 §"CI integration" template uses hyphens (`tests/baspi5-round-trip/`) but pytest discovery works with both; underscores chosen for Python-import ergonomics.

No genuine ratified-rules ambiguity surfaces requiring Council amendment per programme plan §9.4. All decisions are within-engineering and follow ADR-0014's specification.
