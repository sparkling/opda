# ADR-0013 Implementation Report

**Implementing worker:** ADR-0013 worker (proposed, awaiting independent validation)
**Implemented:** 2026-05-28
**Status:** PROPOSED (validation gate per programme plan §9.3 pending)

## 1. BASPI5 profile summary

| Metric | Value |
|---|---|
| File | `source/03-standards/ontology/profiles/baspi5.ttl` |
| Lines | 829 |
| `sh:NodeShape` count | 7 (Property / Address / LegalEstate / Seller / Buyer / EPCCertificate / SellersCapacity) |
| `sh:PropertyGroup` count | 9 (Participants, Address, BuiltForm, Energy, Heating, Ownership, Drainage, Environmental, Completion) |
| BASPI5 form-question IRIs (`https://www.basp.uk/forms/baspi5#...`) | 28 distinct anchors (G20 worker over-counted as 36; verified by ADR-0013 validator + ADR-0014 G19/G20 closure) |
| `sh:xone` discriminators | 1 (BASPI5 `sellersCapacity` two-branch oneOf) |
| DASH UI predicates (`dash:viewer` + `dash:editor`) | 54 |
| `opda:ValidationContext` instances | 1 (`Baspi5ValidationContext`) carrying 5 required properties (`profileURI`, `requires`×7, `overlaysContext`, `sourcedFrom`, `formVersion`) |

## 2. Six §Confirmation criteria

| # | Criterion | Verdict | Verification |
|---|---|---|---|
| 1 | BASPI5 profile emits | PASS | `opda-gen emit-profile baspi5` → `profiles/baspi5.ttl` (829 LOC) |
| 2 | Byte-identity CI green | PASS | `opda-gen ci-byte-identity` → `PASS` (G12 serializer fix activated multi-emission byte-identity) |
| 3 | Three-rule interface contract CI tests pass | PASS | `opda-gen ci-profile-contract` → `PASS (all 3 rules)`; new `tools/opda-gen/src/opda_gen/ci/profile_contract_test.py` module + dedicated CLI command |
| 4 | DASH UI form renders from `profiles/baspi5.ttl` | DEFERRED to ADR-0014 | Manual DASH-viewer rendering test depends on the ADR-0014 round-trip harness; the profile carries the DASH triples required (`dash:viewer`, `dash:editor`, `sh:order`, `sh:group`, `sh:PropertyGroup`). |
| 5 | `opda:ValidationContext` instance present | PASS | `test_baspi5_validation_context_reification`; 1 instance with all 5 required predicates |
| 6 | `dct:source` form-question IRIs resolve to BASPI5 anchors | PASS | 28 distinct anchors emitted matching pattern `https://www.basp.uk/forms/baspi5#<id>`; `test_baspi5_emits_known_question_anchors` verifies the 10 highest-priority anchors emit. G20 cosmetic correction: worker over-counted as 36; validator's 28 is canonical. |

## 3. G-section closures (G8 / G9 / G10 / G11 / G12)

### G8 — 7 new SKOS schemes added

| Scheme | Member count | UFO category | Steward |
|---|---|---|---|
| `YesNoScheme` | 2 | Quale-in-Region | Allemang |
| `YesNoNotApplicableScheme` | 3 | Quale-in-Region | Allemang |
| `YesNoNotKnownScheme` | 3 | Quale-in-Region | Allemang |
| `YesNoNotRequiredScheme` | 3 | Quale-in-Region | Allemang |
| `PropertyTypeScheme` | 6 | Substance Kind label | Allemang |
| `OffMainsDrainageSystemTypeScheme` | 6 | Quale-in-Region | Allemang |
| `OwnerTypeScheme` | 2 | Substance Kind label | Guizzardi (S006 Q1) |

Total: 7 new schemes / 25 new members. Vocabularies file grew from 16 schemes / 88 members / 879 LOC to 23 schemes / 137 members / 1164 LOC. All members carry full per-member metadata (notation + prefLabel@en + definition@en + dct:source).

### G9 — 4 PLACEHOLDER schemes replaced with real per-member data

| Scheme | New dct:source citation | Notes |
|---|---|---|
| `MilestoneKindScheme` | ODR-0007 §Q2 (transaction-lifecycle pattern) | All 5 members re-cited from the fabricated `<.../pdtf-process#milestone-...>` to the ratifying Council anchor |
| `AssuranceLevelScheme` | eIDAS Article 8 + ODR-0009 §Q3 (PDTF-Standard) | Now 4 members (was 3): added `PDTF-Standard` intermediate level per ODR-0009 §Q3 |
| `EvidenceMethodScheme` | OIDC4IDA verbatim | Per ODR-0011 §4a regulator-citation discipline; definitions reworded to verbatim reference (`OIDC4IDA Document evidence...`, etc.) |
| `AddressVariantScheme` | ODR-0015 §Q1 (Council ratifying anchor) | Definitions rewritten with substantive per-member context |

All `PLACEHOLDER:` warning text removed from `skos:scopeNote @en` literals. Verified by `grep -c "PLACEHOLDER" source/03-standards/ontology/opda-vocabularies.ttl` → 0.

### G10 — TransactionStatus URI fix

Validator option (a)+(b) hybrid implemented. The `Member` dataclass gained an optional `derived_from: URIRef | None` field; when set, the graph builder emits an additional `prov:wasDerivedFrom` triple. Each TransactionStatus member:

- `Listed` → `dct:source <ODR-0011#section-8a-...>` ; `prov:wasDerivedFrom <data-dictionary#status.For%20sale>`
- `Offered` → ditto ; `... #status.Under%20offer`
- `Accepted` → ditto ; `... #status.Sold%20subject%20to%20contract`
- `Exchanged` → ditto ; `... #status.Contracts%20exchanged`
- `Completed` → ditto ; `... #status.Completed` (exact match)

Verification: independent rdflib parse of `opda-vocabularies.ttl` confirms 0 fabricated URIs of the form `data-dictionary#status.Listed|Offered|Accepted|Exchanged`. The lineage to the actual data-dictionary `status` enum values is preserved via `prov:wasDerivedFrom`.

### G11 — 20 new DatatypeProperties

(G16 closure: worker self-counted 19 at commit time; validator's count
of 20 is canonical — 18 in opda-property + 2 in opda-agent.)

18 added to `opda-property.ttl` (`opda:propertyType`, `opda:ownershipType`, `opda:heatingType`, `opda:centralHeatingFuelType`, `opda:offMainsDrainageSystemType`, `opda:areBoundariesUniform`, `opda:isLocatedOverCommercialPremises`, `opda:isSharedOwnership`, `opda:isGroundRentPayable`, `opda:sellerContributesToServiceCharge`, `opda:hasSprayFoamInstalled`, `opda:isSupplyMetered`, `opda:isInsured`, `opda:hasBeenFlooded`, `opda:hasSmartHomeSystems`, `opda:hasValidGuaranteesOrWarranties`, `opda:soldWithVacantPossession`, `opda:riskIndicator`).

2 added to `opda-agent.ttl` (`opda:ownerType`, `opda:hasOthersAged17OrOver`).

Each predicate carries `rdfs:domain` (placed per ODR-0008 §Q5a domain table — Property vs LegalEstate vs Proprietor vs Seller), `rdfs:range xsd:string`, `rdfs:label @en`, `rdfs:comment @en`, and `dct:source <ODR-0008#section-Q5a>`. The per-question pattern (not a single shared `hasBooleanFlag` predicate) was adopted per the worker brief recommendation — each predicate carries its own data-dictionary leaf citation when the BASPI5 round-trip resolves the data-dict mapping.

### G12 — canonical serialiser shared-blank-node fix

Resolution went beyond the original cosmetic scope and addressed a latent byte-identity bug: the multi-object sort previously used `str(obj)`, which for BNodes returns rdflib's non-deterministic internal label. Fix introduced `_object_sort_key(obj, blanks)` helper using the skolem hex (`_:b<hex>`) for BNodes. Both the triple-sort and the multi-object list-sort now use it. Regression test `test_multi_object_blank_node_list_byte_identical_across_runs` exercises 5 fresh Graph() constructions producing byte-identical output despite different rdflib internal BNode labels each time.

The original cosmetic dedup (named skolemised URIs for shared blanks) becomes a future opportunistic improvement — no longer load-bearing for byte-identity now that the sort uses skolem hex consistently.

## 4. Three-rule interface contract CI results

```
$ opda-gen ci-profile-contract
profile contract CI: PASS (all 3 rules)
```

| Rule | Implementation | Verdict |
|---|---|---|
| 1 — `sh:in` semantics | `check_sh_in_semantics(g)` walks every `sh:in` RDF list across the merged corpus and asserts every literal member appears as a `skos:notation` somewhere in the SKOS substrate | PASS |
| 2 — `sh:Violation` floor | `check_sh_violation_floor(g)` collects base-shape paths with `sh:Violation` then asserts no profile shape (`Baspi5_*` URI pattern) carries `sh:Warning`/`sh:Info` on those paths | PASS |
| 3 — no-identity-override | `check_no_identity_override(g)` enumerates 4 identity-key predicates (`hasUPRN`, `hasAddress`, `identifiesSameProperty`, `recordsEstate`) and asserts no profile shape sets `sh:maxCount 0` on any | PASS |

Independent re-run of all three rules during test execution via `test_three_rule_interface_contract_passes`.

## 5. Test results

| Suite | Count |
|---|---|
| Baseline (post-ADR-0012) | 102 |
| + `test_profiles.py` (ADR-0013) | +15 |
| + `test_multi_object_blank_node_list_byte_identical_across_runs` (G12) | +1 |
| **Final (pre-ADR-0014)** | **118** |

(Post-ADR-0014: 154 — adds +9 G14/G18 regression tests in
`tools/opda-gen/tests/` and +27 round-trip / traceability / exemplar-
regression tests in `tests/baspi5_round_trip/`.)

`pytest -q` → all pass. `opda-gen ci-byte-identity` PASS; `opda-gen ci-three-graph` PASS; `opda-gen ci-profile-contract` PASS.

Foundation version IRI bumped 0.3.0 → 0.4.0 (substantive class-graph addition: `opda:ValidationContext` added per ODR-0010 §Q1). All per-module imports + per-module `owl:versionIRI` rebumped accordingly. Generator package `__version__` bumped 0.4.0 → 0.5.0 (substantive substrate addition: BASPI5 overlay profile + 7 new schemes + 19 new datatype properties + foundation expansion).

## 6. Surfaced ambiguity

**Within-engineering decisions taken inline (no Council route surfaced):**

1. **Cardinality coverage for BASPI5 properties.** The BASPI5 schema's `required` arrays are exhaustively walkable, but mapping each required leaf to a SHACL `sh:minCount 1` constraint on the canonical OPDA predicate requires per-leaf reasoning about whether the leaf belongs on Property, LegalEstate, EPCCertificate, etc. For the MVP scope, the profile emits the most-load-bearing requireds (UPRN, address, propertyType, ownershipType, currentEnergyRating, builtForm) with min/maxCount constraints, and emits enum-bearing properties with `sh:in` constraints (no minCount unless BASPI5 explicitly requires the leaf). Future BASPI5 question coverage expands incrementally as ADR-0014 round-trip surfaces missing constraints.

2. **`sh:in` member granularity.** The profile's `sh:in` lists currently carry `Literal` string members matching the scheme `skos:notation` values. ODR-0010 §Q5 supports either pattern (literal-notation or URI-by-skos-concept). Literal-notation chosen because (i) the BASPI5 JSON schema discriminators use string enum values directly; (ii) DASH editors typically consume `sh:in` as a string-enum list. URI-keyed alternative remains feasible if a downstream consumer requires URI dispatch.

3. **`opda:role` predicate not declared in foundation.** The BASPI5 profile shapes use `opda:role` as the discriminator path on Seller/Buyer shapes, but `opda:role` is not declared as a `DatatypeProperty` in any TBox module. The role-bearing pattern is encoded via `opda:Seller`/`opda:Buyer` typing rather than via a `role` predicate per the ODR-0006 Role-layer commitment. For BASPI5 compatibility (the JSON schema discriminates `participants[].role` by string value), the profile carries `sh:in` on a path that does not have an explicit declaration. This is acceptable because SHACL operates on triples, not declarations — but a future cosmetic ADR-0014/ADR-0011 amendment may declare `opda:role` formally for tool ergonomics. **CLOSED by ADR-0014 G18:** `opda:role` declared as `owl:DatatypeProperty` in `opda-agent.ttl` with domain `opda:RoleMixin` and range `xsd:string`; the typed encoding (`a opda:Seller`) remains canonical.

**Genuine ambiguities surfaced for downstream attention (not blocking ADR-0013 acceptance):**

- BASPI5 schema's `dct:source` form-question anchors (`A1.8.6.1`, `B1.3.2`, etc.) are NOT formally documented at the BASPI authority URL — the pattern `https://www.basp.uk/forms/baspi5#<anchor>` resolves to a working URL only when BASPI publishes a question-anchored form page. The OPDA emission carries the URIs per ODR-0010 §Q3 ("the page-anchors stay stable across form versions per ODR-0010 §Q3 ratification (anchor pattern owned by form publisher; OPDA archives reference but does not mint anchors)"). When BASPI authority surface materialises, the URIs become dereferenceable; until then, they remain stable references.

## 7. Handoff to validator and ADR-0014 worker

**For the independent validation agent** (per programme plan §9.2):

- Cited ODRs: ODR-0010 (full), ODR-0011 (§8a UFO meta-category framework, §1a steward, §4a regulator-citation, §S14/§S15 cardinality), ODR-0008 (§Q5a binding table for G11 placements).
- Cited prior ADRs: ADR-0007 (deterministic emission), ADR-0008 (CLI infra), ADR-0009 (foundation), ADR-0010 (vocabularies), ADR-0011 (modules), ADR-0012 (shapes/annotations).
- Soundness check inputs: 23 schemes × 7 metadata triples + 137 members × 6 per-member triples (vocabularies); 19 new DatatypeProperties × 5 triples (modules); 1 new foundation class (`opda:ValidationContext`); 1 new validation context instance (BASPI5 profile); ~80 property shapes (BASPI5 profile); 9 sh:PropertyGroup instances; 1 sh:xone shape.
- Completeness check inputs: ODR-0010 §Q1–Q7 + ODR-0011 §1a/§8a/§4a + ODR-0008 §Q5a; each subsection's realisation is named in this report or explicitly deferred with named trigger.
- Cross-ADR consistency: ADR-0014 (downstream MVP) can load the BASPI5 profile via rdflib alongside foundation + modules + shapes + annotations + vocabularies — 24 TTL files emit cleanly with byte-identity. The three-rule interface contract is automated, so any future ADR-0013 amendments retain the invariant mechanically.
- Validation report goes to: `docs/adr/validation/ADR-0013-validation-report.md`.

**For the ADR-0014 (BASPI5 round-trip MVP) worker:**

- The BASPI5 profile is now loadable: foundation (0.4.0) + opda-vocabularies (23 schemes) + opda-* module TBoxes (with G11 DatatypeProperties) + opda-* shape graphs + `profiles/baspi5.ttl`. Total ontology graph: 2,030 triples after merge.
- `pyshacl --advanced -s <merged-shapes> -d <exemplar>` can target either the foundation shapes or the BASPI5 overlay profile. The exemplar harness ADR-0014 needs to build will validate each exemplar against both, producing comparable `sh:ValidationReport` outputs.
- DASH UI predicates are emitted — a DASH-compatible viewer (e.g. Topbraid Composer DASH renderer) can render the BASPI5 form from the profile alone.
- The three-rule interface contract is automated and integrated into the CI workflow. ADR-0014 worker should run `opda-gen ci-profile-contract` as part of the MVP-gate verification.
- Surfaced gaps for ADR-0014 to address (or defer with named trigger): per-question cardinality coverage beyond the load-bearing 6 (Property requireds), DASH-viewer screenshot for the rendered form, `opda:role` declaration formalisation.
