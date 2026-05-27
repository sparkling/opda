# ADR-0010 Implementation Report

**Implementing worker:** general-purpose agent (Claude Code)
**Date:** 2026-05-27
**ADR:** [ADR-0010 — SKOS vocabulary emission](../ADR-0010-skos-vocabulary-emission.md)
**Status at submission:** `proposed` (independent validation pending per programme plan §9.3)

## 1. Emitted artefact

One new TTL file under `source/03-standards/ontology/`:

| File | LOC | Triples | Schemes | Members |
|---|---|---|---|---|
| `opda-vocabularies.ttl` | 879 | 656 | 16 | 88 |

Prefixes bound by the canonical serialiser (after referenced-IRI filter): `dct`, `opda`, `rdf`, `skos`. The `prov`, `opda-v`, `owl`, and `xsd` prefixes are bound on the rdflib graph but filtered out at emission because no triple references them — that filter is the G2-compliant behaviour established by ADR-0009.

Foundation files **regenerated** as a downstream effect of the `__version__` bump 0.1.0 → 0.2.0:

| File | LOC | Change |
|---|---|---|
| `foundation.ttl` | 34 | `owl:versionIRI <https://w3id.org/opda/0.2.0/>`; `owl:versionInfo "0.2.0 — foundation + SKOS vocabularies (ADR-0009 + ADR-0010)"`; `opda:generatorVersion "opda-gen-0.2.0"`; generator-comment "Generator version: opda-gen-0.2.0". |
| `opda-classes.ttl` | 30 | Header-only update (generator-comment line). No class-graph content change. |
| `opda-shapes.ttl` | 21 | Header-only update + new version-IRI in `opda:targetsClassGraph`. |
| `opda-annotations.ttl` | 21 | Header-only update + new version-IRI in `opda:targetsClassGraph`. |

Python files **modified**:

| File | Change |
|---|---|
| `tools/opda-gen/src/opda_gen/__init__.py` | `__version__` 0.1.0 → 0.2.0; `Realises:` header notes the ADR-0010 minor-bump rationale. |
| `tools/opda-gen/src/opda_gen/emitters/vocabularies.py` | Replaced ADR-0008 stub (raising `NotImplementedError`) with full implementation (760 LOC). 16 scheme builders + dataclasses for `Scheme`/`Member` + URI-safe slugifier + canonical-graph assembly. Holds the Cagle SHACL-AF deprecation-chain rule body as a documented constant string (deferred to ADR-0012 for shape emission). |
| `tools/opda-gen/src/opda_gen/emitters/foundation.py` | `_VERSION_IRI` 0.1.0 → 0.2.0 with a comment explaining the per-substrate version bump. `_VERSION_INFO` updated to "foundation + SKOS vocabularies (ADR-0009 + ADR-0010)". |
| `tools/opda-gen/src/opda_gen/cli.py` | `emit-vocabularies` body wired to call `emit_vocabularies()`; made `--output` optional with the same canonical-dir default as `emit-foundation`. The `emit` umbrella now sequentially calls foundation + vocabularies. `Realises:` header adds ADR-0010 §Confirmation #1/#2. |
| `tools/opda-gen/src/opda_gen/ci/byte_identity.py` | `run()` now emits both foundation + vocabularies before diffing, so byte-identity covers the full Phase-2 corpus. `Realises:` header adds ADR-0010 §Confirmation #2. |
| `tools/opda-gen/src/opda_gen/serialiser/ordering.py` | Inserted `skos:ConceptScheme` before `skos:Concept` in `TERM_TYPE_ORDER` so each scheme block emits ahead of its member blocks in the canonical Turtle output. Added explanatory comment naming the ADR-0010 motivation. |
| `.github/workflows/ontology-byte-identity.yml` | Added two ADR-0010 steps after the existing byte-identity diff: regenerate vocabularies-only into a temp dir and `diff -q` it against the committed file. The umbrella `emit` step already regenerates `opda-vocabularies.ttl` as part of the directory-level diff — the additional step exercises the per-file `emit-vocabularies` subcommand contract independently. |
| `docs/adr/ADR-0005-deferred-work-register.md` | Marked G7 closed (regression tests landed); added G8 (ADR-0010 scope expansion — admit additional schemes case-by-case per downstream demand) and G9 (data-dictionary enums for MilestoneKind / AssuranceLevel / EvidenceMethod / AddressVariant — currently emitted with `PLACEHOLDER:` warnings). Added a 2026-05-27 amendment line. |

Tests **added** (17 new — 15 vocabularies + 2 G7 regression; total 34 → 51):

| Test | File | Purpose |
|---|---|---|
| `test_emit_vocabularies_produces_file` | `test_vocabularies.py` | Confirmation #1: emitted file exists; return-value contract honoured. |
| `test_emit_vocabularies_produces_16_schemes` | `test_vocabularies.py` | Confirmation #1 + §"Scheme catalogue": exactly the 16 named schemes appear. |
| `test_byte_identical_across_two_runs` | `test_vocabularies.py` | Confirmation #2: second-run regeneration produces zero diff. |
| `test_no_shacl_triples_in_vocabularies` | `test_vocabularies.py` | Confirmation #3 + ODR-0004 §3a: no `sh:*` triples in the vocabularies file. |
| `test_every_scheme_has_ufo_category` | `test_vocabularies.py` | Confirmation #4: every scheme carries `opda:ufoCategory`. |
| `test_ufo_category_value_is_in_seven_category_framework` | `test_vocabularies.py` | ODR-0011 §"odr-review lint extension contract" item (ii): `opda:ufoCategory` value in the seven-category vocabulary. |
| `test_every_scheme_has_dct_source` | `test_vocabularies.py` | Confirmation #5 (scheme half): every scheme carries `dct:source`. |
| `test_every_scheme_has_steward` | `test_vocabularies.py` | ODR-0011 §1a + S008 Q2: every scheme carries `opda:hasSteward`. |
| `test_every_scheme_has_pref_label_title_definition_scope_note` | `test_vocabularies.py` | ADR-0010 per-scheme MUST-haves: prefLabel + title + definition + scopeNote, exactly 1 each, all `@en`. |
| `test_every_member_has_required_fields` | `test_vocabularies.py` | ADR-0010 per-member MUST-haves: inScheme + prefLabel + notation + definition + dct:source. |
| `test_member_label_cardinality` | `test_vocabularies.py` | ODR-0011 §S14/§S15: exactly one prefLabel @en, one notation, one definition @en per member. |
| `test_member_inScheme_points_at_emitted_scheme` | `test_vocabularies.py` | No dangling `skos:inScheme` references. |
| `test_every_member_has_dct_source` | `test_vocabularies.py` | Confirmation #5 (member half). |
| `test_scheme_local_names_and_member_count` | `test_vocabularies.py` | Cross-check: each in-code Scheme produces its declared member count. |
| `test_total_member_count_matches_in_code_registry` | `test_vocabularies.py` | Regression guard against silent member loss. |
| `test_literal_url_inside_scope_note_does_not_bind_new_prefix` | `test_serialiser.py` | G7 case (i): URL inside a sentence-prose Literal MUST NOT bind a new prefix for an unbound namespace. |
| `test_literal_url_lexical_value_does_not_bind_unbound_namespace` | `test_serialiser.py` | G7 case (ii): URL as the sole Literal lexical value MUST NOT bind a new prefix for an unbound namespace. |

Existing tests **modified** (1):

| File | Change |
|---|---|
| `test_byte_identity.py` | `test_byte_identity_runner_reports_match` now also emits vocabularies into the reference dir (so the runner's emit-both-then-diff path is exercised cleanly). Module docstring extended to cite ADR-0010 §Confirmation #2. |

## 2. Confirmation criteria coverage (ADR-0010 §Confirmation)

| # | Criterion | Verification | Verdict |
|---|---|---|---|
| 1 | Emission lands — `opda-gen emit-vocabularies` produces `opda-vocabularies.ttl` | `opda-gen emit-vocabularies` → file written at canonical path; 879 LOC. | **PASS** |
| 2 | Byte-identity CI green — regeneration produces zero diff | `opda-gen ci-byte-identity` → `byte-identity: PASS` against the committed 5-file corpus. Confirmed manually with `opda-gen emit --output /tmp/x && diff -rq /tmp/x source/03-standards/ontology --exclude=exemplars` → no output. | **PASS** |
| 3 | Three-graph CI green — no `sh:*` in vocabularies | `opda-gen ci-three-graph` → `three-graph CI: PASS (all 5 checks)`. Test `test_no_shacl_triples_in_vocabularies` confirms the vocabularies graph itself contains zero `sh:*` triples. The Cagle SHACL-AF deprecation-chain rule body is held in `emitters/vocabularies.py` as a documented constant string only (TODO note points at ADR-0012 for shape emission). | **PASS** |
| 4 | Every scheme carries `opda:ufoCategory` — SPARQL `SELECT ?s WHERE { ?s a skos:ConceptScheme . FILTER NOT EXISTS { ?s opda:ufoCategory ?c } }` returns empty | Verified inline (see Verification block in the implementation brief) — output: `schemes missing ufoCategory: []`. Test `test_every_scheme_has_ufo_category` enforces. | **PASS** |
| 5 | Every scheme + member carries `dct:source` | Verified inline — `schemes missing dct:source: []`. Tests `test_every_scheme_has_dct_source` + `test_every_member_has_dct_source` enforce both halves. | **PASS** |
| 6 | Cardinality discipline — exactly 1 `skos:prefLabel @en`, 1 `skos:notation`, 1 `skos:definition @en` per concept | Test `test_member_label_cardinality` enforces; passes. SHACL validation (manual `pyshacl -s opda-shapes.ttl -d opda-vocabularies.ttl`) deferred until ADR-0012 ships the shape bodies — at present `opda-shapes.ttl` is header-only. The cardinality contract is enforced in code by the deterministic builders + asserted in tests. | **PASS** (test-asserted; SHACL-shape assertion deferred to ADR-0012) |

## 3. Scheme-by-scheme mapping table

For each of the 16 emitted schemes: data-dictionary leaf path (or external-only marker), UFO category, member count, and `dct:source` URI for the scheme.

| Scheme | Data dictionary leaf | UFO category | Members | Scheme `dct:source` |
|---|---|---|---|---|
| `BuiltFormScheme` | `propertyPack.buildInformation.building.builtForm` | Quale-in-Region | 5 | ODR-0011 §8a |
| `CouncilTaxBandSchemeEW` | `propertyPack.councilTax.councilTaxBand` (A–H filtered) | Quale-in-Region | 8 | https://www.gov.uk/council-tax-bands |
| `CouncilTaxBandSchemeScotland` | `propertyPack.councilTax.councilTaxBand` (A–I filtered — Scotland-specific) | Quale-in-Region | 9 | https://www.saa.gov.uk/council-tax/council-tax-bands/ |
| `CurrentEnergyRatingScheme` | `propertyPack.energyEfficiency.certificate.currentEnergyRating` (A–G filtered; excludes 'Exempt Property', 'Survey Instructed', 'No Certificate' which are status markers) | Quale-in-Region | 7 | DESNZ EPC guidance |
| `CentralHeatingFuelTypeScheme` | `propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.centralHeatingFuelType` | Quale-in-Region | 6 | ODR-0011 §8a |
| `HeatingTypeScheme` | `propertyPack.heating.heatingSystem.heatingType` | Quale-in-Region | 4 | ODR-0011 §8a |
| `OwnershipTypeScheme` | `propertyPack.ownership.ownershipsToBeTransferred[].ownershipType` (NTS2 canonical 4-set; the pdtf-transaction source adds 'Managed Freehold' which is treated as a downstream extension) | Quale-in-Region | 4 | ODR-0011 §8a |
| `TenureKindScheme` | `propertyPack.marketingTenure` (Freehold/Leasehold/Commonhold subset; 'Share of Freehold' + 'Shared Ownership' are marketing tenures, NOT UFO Substance Kinds) | Substance Kind label | 3 | ODR-0011 §8a |
| `RoleScheme` | `participants[].role` | Role label | 12 | ODR-0011 §8a |
| `ParticipantStatusScheme` | `participants[].participantStatus` | Phase label | 4 | ODR-0011 §8a |
| `TransactionStatusScheme` | `status` (top-level; ADR-named 5-phase subset emitted; broader 9-value enum surfaced as ambiguity §8) | Phase label | 5 | ODR-0011 §8a |
| `MilestoneKindScheme` | **external-only** (no data-dictionary enum; codes per PDTF transaction-lifecycle process) | Method/plan code | 5 | ODR-0011 §8a |
| `SellersCapacityScheme` | `participants[].sellersCapacity.capacity` | Method/plan code | 6 | ODR-0011 §8a |
| `AssuranceLevelScheme` | **external-only** (no data-dictionary enum; eIDAS Article 8 Levels of Assurance) | Quality Value | 3 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0910 |
| `EvidenceMethodScheme` | **external-only** (no data-dictionary enum; OIDC4IDA `evidence` taxonomy) | Quality Value | 3 | https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html |
| `AddressVariantScheme` | **external-only** (no data-dictionary enum; variants per ODR-0015 §S015 Q1) | Quality Value | 4 | https://w3id.org/opda/odr/ODR-0015#section-2a-address-variant |

**Data dictionary vs external-only split:** **12** schemes sourced from the data dictionary; **4** schemes external-only (`MilestoneKindScheme`, `AssuranceLevelScheme`, `EvidenceMethodScheme`, `AddressVariantScheme`). The four external-only schemes carry a `PLACEHOLDER:` warning in their `skos:scopeNote @en` per the implementation brief's option (a) routing (conceptually well-defined despite missing dictionary leaf). G9 follow-up queued to populate the dictionary enums.

## 4. Soundness self-check

### Emitted Turtle artefacts — `dct:source` provenance

**Per-scheme** (16 schemes; all carry `dct:source`):
- 11 schemes cite `<https://w3id.org/opda/odr/ODR-0011#section-8a-ufo-meta-category>` (ODR-0011 §8a — the Council-authored SKOS-binding for the seven-category UFO framework). These are the project-owned schemes whose category/steward are ODR-ratified.
- 3 schemes cite regulator URLs per ODR-0011 §4a verbatim-citation discipline: `CouncilTaxBandSchemeEW` → gov.uk; `CouncilTaxBandSchemeScotland` → saa.gov.uk; `CurrentEnergyRatingScheme` → DESNZ EPC guidance.
- 2 schemes cite external standard specs: `AssuranceLevelScheme` → eIDAS Regulation (EU) 910/2014; `EvidenceMethodScheme` → OIDC4IDA spec.

**Per-member** (88 members; all carry `dct:source`):
- Data-dictionary-sourced members cite `<https://w3id.org/opda/data-dictionary#<leaf>.<value>>` (whitespace + apostrophes percent-encoded). One leaf per scheme; member URI fragment carries the verbatim enum value.
- Regulator-cited members repeat the scheme's regulator URL (council-tax-band members all cite gov.uk / saa.gov.uk; EPC members cite DESNZ).
- External-spec members cite the upstream spec URI (eIDAS / OIDC4IDA / ODR-0015 §2a).
- Process-defined members (MilestoneKindScheme) cite a PDTF-process IRI `<https://w3id.org/opda/pdtf-process#milestone-<code>>` as a forward placeholder until the data dictionary populates the enum.

### Modified Python files — `Realises:` doc-comment headers

All seven modified files have their `Realises:` headers updated to add ADR-0010 sections newly realised:

| File | New citations added |
|---|---|
| `__init__.py` | ADR-0010 (minor-bump rationale). |
| `emitters/vocabularies.py` | ADR-0010 §"Scheme catalogue", §"Per-scheme MUST-haves", §"Per-member MUST-haves", §"Emission structure", §"SHACL-AF rule emission (Cagle's deprecation-chain rule)"; ADR-0007 §"Deterministic emission rules" + §"A9 per-kind discipline output"; ADR-0008 §"CLI design"; ODR-0004 §3a/§6a/§7a; ODR-0011 §1a/§S14/§S15/§4a/§5a/§7a/§8a. |
| `emitters/foundation.py` | Comment-block updates noting the ADR-0010 version-IRI bump rationale; ADR-0010 citation in the `_VERSION_IRI` + `_VERSION_INFO` comments. |
| `cli.py` | ADR-0010 §Confirmation #1/#2. |
| `ci/byte_identity.py` | ADR-0010 §Confirmation #2. |
| `serialiser/ordering.py` | Comment noting the ADR-0010-motivated insertion of `skos:ConceptScheme` before `skos:Concept` in `TERM_TYPE_ORDER`. |
| `tests/test_byte_identity.py` | ADR-0010 §Confirmation #2 citation in module docstring. |

## 5. Completeness self-check

### Cited ODR-0011 — `## Rules` subsection coverage

| Subsection | Status | How realised |
|---|---|---|
| §Rules.1 "Each enum is a `skos:ConceptScheme`" | **REALISED** | 16 `skos:ConceptScheme` subjects emitted in `opda-vocabularies.ttl`; 88 members carry `skos:inScheme`, `skos:prefLabel @en`, `skos:notation`, `skos:definition @en`. |
| §Rules.2 "Labels and definitions sourced from glossary verbatim where the term exists" | **PARTIAL — REALISED for ratified glossary terms, otherwise short authored definition** | The 2026-05-14 business glossary (54 trust-framework terms) does not carry entries for the first-batch enum members (no `pdtf:detached`, `pdtf:freehold`, etc.). Definitions emitted here are short authored definitions citing the data-dictionary leaf as `dct:source`. When the glossary is extended (G5/G9 follow-up class) to carry per-enum-member definitions, regenerate. |
| §Rules.3 "Every concept carries `dct:source`" | **REALISED** | All 88 members carry `dct:source` — split: data-dictionary-leaf (most), regulator URL (council-tax + EPC), external spec (eIDAS / OIDC4IDA), process IRI (Milestone), or ODR-section URL (Address Variant). |
| §Rules.4 "Hierarchical enums use `skos:broader`/`skos:narrower`" | **DEFERRED — N/A for first batch** | First-batch schemes are all flat (no broader/narrower hierarchy). Trigger: when a future scheme (e.g. `typeOfConnection` broadband hierarchy or `transportType` modal hierarchy) is admitted, emit broader/narrower per the ODR-0011 §Rules.4 contract. |
| §Rules.5 "Closed vs open-ended flagged per scheme" | **DEFERRED to ADR-0012** | The closed/open flag drives SHACL `sh:in` membership in ADR-0012; not emitted here (would violate three-graph separation — shapes belong in `opda-shapes.ttl`). The in-code Scheme registry has no closed/open flag yet; ADR-0012 worker will add it when emitting shapes. |
| §Rules.6 "Per-scheme namespace convention `opda:` single hash" | **REALISED** | All schemes and members are under `https://w3id.org/opda/#`. |
| §Rules.7 "External schemes reused via `skos:exactMatch`" | **DEFERRED to Phase-3.5 audit** | Per ADR-0010 §"More Information": cross-vocab `skos:exactMatch` is deferred to per-scheme Author-only mini-sessions. Initial emission does NOT include cross-vocab mappings. |
| §Rules.8 "Domain ownership — provenance schemes owned by ODR-0009; governance schemes by ODR-0012" | **REALISED via steward declarations** | Each scheme's `opda:hasSteward` Literal names the steward per the ADR-0010 §"Scheme catalogue" table. `AssuranceLevelScheme` + `EvidenceMethodScheme` steward = Moreau (S009 Q3); `RoleScheme` + `ParticipantStatusScheme` etc. steward = Guizzardi. |
| §Rules.9 "One register, three consumers" | **REALISED for the SKOS register (consumer 1); SHACL `sh:in` deferred to ADR-0012; DASH editor deferred to ADR-0013** | The register lands here; downstream consumers attach via ADR-0012/0013. |

### Cited ODR-0011 — `## Operational specifications` subsection coverage

| Subsection | Status | How realised |
|---|---|---|
| §1a Every JSON enum becomes a `skos:ConceptScheme` + steward declaration | **REALISED** | All 16 schemes carry `opda:hasSteward` Literal. SHACL invariant (Cagle amendment — Concept-in-exactly-one-primary-scheme) deferred to ADR-0012 shape emission (would violate three-graph separation here). |
| §2a Cardinality per SKOS §S14/§S15 + Pandit PII-strict amendment | **REALISED in code; SHACL shape deferred to ADR-0012** | The in-code builders emit exactly 1 `skos:prefLabel @en`, 1 `skos:notation`, 1 `skos:definition @en` per member; tests enforce. PII-strict differentiation (`sh:Violation` for PII; `sh:Warning` for non-PII) lands in ADR-0012. |
| §4a Definition source — verbatim regulator-citation | **PARTIAL — REALISED for scheme-level `dct:source` on regulator-cited schemes; verbatim definition text deferred** | Schemes (`CouncilTaxBandSchemeEW`, `CouncilTaxBandSchemeScotland`, `CurrentEnergyRatingScheme`) carry the regulator URL as `dct:source`. The verbatim regulator-text-as-`skos:definition` discipline is partially realised — definitions are short ADR-authored summaries citing the regulator. Full verbatim citation (with version-pinned regulator IRI per ODR-0004 §7a) deferred to when DPV-PD-inherited schemes are emitted (G9 follow-up). |
| §5a Three-case lifecycle discipline + Cagle SHACL-AF deprecation rule | **DEFERRED to ADR-0012** | No first-batch member is deprecated; the rule body is held as `_DEPRECATION_CHAIN_RULE_SPARQL` constant string in `vocabularies.py` with a `TODO(ADR-0012)` comment pointing at the shape-emission ADR. Lifecycle predicates (`dct:isReplacedBy` / `prov:wasDerivedFrom` / `dct:modified`) emit when the first member retires. |
| §7a Notation typing — `xsd:string` + `sh:pattern` default | **REALISED** | All notations are plain `xsd:string` Literals (no `^^xsd:string` printed per ADR-0007 #5). `sh:pattern` constraint emission deferred to ADR-0012 shape emission. |
| §8a UFO meta-category per scheme — seven-category framework | **REALISED** | Every scheme carries `opda:ufoCategory` Literal from the seven-category vocabulary. Test `test_ufo_category_value_is_in_seven_category_framework` enforces the closed-set constraint. UFO + DOLCE source citations (Guizzardi 2005 Ch. 4; Masolo D18 §4.3) land in the `skos:scopeNote @en`. Dual `dct:source` (Q8 withdrawal condition (b) — upstream UFO + ODR-0011 SKOS-binding) is partially realised: schemes citing `ODR-0011 §8a` for the SKOS-binding carry only that one URL (upstream UFO/DOLCE citation is folded into the scope-note text rather than a second `dct:source` triple). If full dual-URL discipline is required by the validator, the registry can be extended without scheme-by-scheme deliberation. |

### Cited ADR-0008 — `## Confirmation` / interface coverage

| Subsection | Status | How realised |
|---|---|---|
| `emit-vocabularies` CLI subcommand exists | **REALISED** | `cli.py` `emit_vocabularies` Click command wired; `opda-gen emit-vocabularies --help` shows the documented surface. |
| `emit` umbrella exercises full corpus | **REALISED** | `cli.py emit` now sequentially invokes `emit_foundation()` + `emit_vocabularies()`; emitted 5 files. |
| Byte-identity CI gate covers vocabularies | **REALISED** | `ci/byte_identity.py` `run()` emits both before diffing; CI workflow's `diff -rq` already covers the full directory. |

### Cited ADR-0009 — `## Confirmation` / interface coverage

| Subsection | Status | How realised |
|---|---|---|
| Foundation TTLs remain byte-identical (when no version bump) | **N/A — VERSION BUMPED** | ADR-0010 deliberately bumps `__version__` 0.1.0 → 0.2.0 + `owl:versionIRI` 0.1.0 → 0.2.0 per the brief. All four foundation TTLs were regenerated to track the new version; the byte-identity gate now runs against the new committed bytes. Per the G6 pinning convention, this is the expected lifecycle event (version IRI advances when the substrate materially extends). |

## 6. G7 closure

ADR-0009 §G G7 ("prefix-filter edge cases for embedded URLs in `rdfs:comment` / `dct:description`") is closed by this ADR-0010 worker. The closure rationale: ADR-0010's regulator-cited schemes carry gov.uk URLs inside `skos:scopeNote @en` Literals — exactly the surface G7 was queued to guard.

Two new regression tests added to `tests/test_serialiser.py`:

1. **`test_literal_url_inside_scope_note_does_not_bind_new_prefix`** — Constructs a `skos:ConceptScheme` with a `skos:scopeNote @en` Literal containing the gov.uk URL inside surrounding prose. The serialiser's referenced-IRI scan picks up the literal value (because it starts with "Verbatim source: VOA..." not "http") but no gov.uk prefix is bound on the graph, so the scan's `startswith(ns_str)` walk over `graph.namespaces()` finds no match and no spurious `@prefix gov.uk:` is emitted. Test asserts no `gov.uk` substring in any `@prefix` line; asserts `@prefix opda:` IS present (the scheme IRI references it).

2. **`test_literal_url_lexical_value_does_not_bind_unbound_namespace`** — The more aggressive case: a Literal whose lexical value IS exactly the gov.uk URL (not surrounding prose). The scan adds the URL to the referenced-IRI set; the prefix walk still finds no match because gov.uk is unbound. Same assertions as above.

The contract these tests cement: the literal-IRI scan widens the *reference set*, never the *binding set*. Only prefixes already bound on the graph are eligible for retention.

ADR-0005 §G updated to mark G7 closed (commit-current state of this implementation).

## 7. Test results

```
$ cd tools/opda-gen && pytest -q
...................................................                      [100%]
51 passed
```

51 tests; 51 passing. Up from 34 (ADR-0009 baseline): 15 vocabularies tests + 2 G7 regression tests = 17 new tests.

Per-file counts:

| File | Tests |
|---|---|
| `test_blank_nodes.py` | 4 |
| `test_byte_identity.py` | 3 |
| `test_serialiser.py` | 10 (8 + 2 G7) |
| `test_term_sourcing.py` | 7 |
| `test_three_graph.py` | 12 |
| `test_vocabularies.py` | 15 (new) |
| **Total** | **51** |

CI commands:

```
$ opda-gen ci-byte-identity
byte-identity: PASS

$ opda-gen ci-three-graph
three-graph CI: PASS (all 5 checks)
```

## 8. Surfaced ambiguity

### 8.1 TransactionStatusScheme members vs data-dictionary `status` enum (NOT Council-routed)

ADR-0010 §"Scheme catalogue" names the `TransactionStatusScheme` members as **Listed, Offered, Accepted, Exchanged, Completed** (a five-phase canonical set). The data dictionary's `status` leaf carries a broader nine-value enum: `['active', 'For sale', 'Under offer', 'Sold subject to contract', 'Contracts exchanged', 'Completed', 'Cancelled', 'To let', 'Let agreed']`. The data-dictionary enum mixes marketing-side phases ('For sale', 'To let', 'Let agreed') with transaction-side phases ('Under offer', 'Sold subject to contract', 'Contracts exchanged', 'Completed') and lifecycle markers ('active', 'Cancelled').

**Decision (within-engineering, not Council-routed):** emit the ADR-named five-phase canonical set; flag the broader 9-value enum in `skos:scopeNote @en` so downstream consumers can see it; queue follow-up if a future ADR or consumer demands admission of additional members. The five-phase set IS the UFO Phase label structure for the sale lifecycle; the broader enum mixes UFO categories (Phases + cancellation State + marketing Mode) and would need Council deliberation to admit cleanly as a single SKOS scheme.

This is a within-engineering interpretation per programme plan §9.4 (the ADR's `## Rules` text — naming the five members explicitly — is unambiguous; the question is what to do with the *additional* data-dictionary values, which is a scope question not a Rules ambiguity).

### 8.2 Dual `dct:source` on schemes (NOT Council-routed)

ODR-0011 §8a names a "dual `dct:source`" requirement (Gandon DA Q8 withdrawal condition (b)): upstream UFO/DOLCE source + the Council-authored ODR-0011 SKOS-binding source. ADR-0010 §"Emission structure" template line 76 shows a single `dct:source` per scheme.

**Decision (within-engineering):** emit one `dct:source` per scheme — the ratifying ODR section URL (`<https://w3id.org/opda/odr/ODR-0011#section-8a-ufo-meta-category>`) for project-owned schemes, or the regulator URL for regulator-cited schemes. The upstream UFO/DOLCE citations land in the `skos:scopeNote @en` Literal text (`"UFO: Quale-in-Region (Guizzardi 2005 Ch. 4). DOLCE: Quality-Region (Masolo D18 §4.3)."`). The current OPDA registry does not yet have stable W3ID-resolvable IRIs for the Guizzardi 2005 chapter / Masolo D18 PDF — minting them is a separate piece of work.

If the ADR-0010 validator surfaces this as a real `## Rules` violation (rather than an engineering convention), the registry is single-source-of-truth and can grow a second `dct:source` triple without re-deliberation. The placeholder note in the implementation report flags it for the validator.

### 8.3 OwnershipTypeScheme variant ('Managed Freehold')

The data-dictionary `ownershipType` leaf has two variants: pdtf-transaction (5 members including 'Managed Freehold'); NTS2 (4 members matching the ADR-0010 brief). The ADR-named set (Freehold/Leasehold/Commonhold/Other) is emitted; 'Managed Freehold' is excluded as an overlay-specific extension. Within-engineering; not Council-routed.

### 8.4 CurrentEnergyRatingScheme filter ('Exempt Property' etc.)

The data-dictionary `currentEnergyRating` leaf carries 10 values: `['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Exempt Property', 'Survey Instructed', 'No Certificate']`. The ADR-named set is A-G only. 'Exempt Property' / 'Survey Instructed' / 'No Certificate' are status markers (the property has no rating), not band values; they would belong in a separate `EnergyRatingStatusScheme` if admitted. Within-engineering; not Council-routed.

### 8.5 Surfaced for the validator (no decision needed here)

- Cardinality discipline test (`test_member_label_cardinality`) is assertion-based, not SHACL-shape-based. ADR-0010 §Confirmation #6 names a "SHACL validates" gate; that gate fires once ADR-0012 shapes land. The current PASS verdict is "deterministic-builder + test-asserted" — defensible per programme plan §9.2 (explicit deferral to ADR-0012 with named trigger).

## 9. Handoff to validator

The validator (an independent agent spawned per programme plan §8.3) should run:

1. `pytest -q` in `tools/opda-gen/` — expects 51 passing.
2. `opda-gen ci-byte-identity` — expects `byte-identity: PASS`.
3. `opda-gen ci-three-graph` — expects `three-graph CI: PASS (all 5 checks)`.
4. Soundness check — walk every emitted `skos:ConceptScheme` and `skos:Concept` in `source/03-standards/ontology/opda-vocabularies.ttl`; verify each `dct:source` URI resolves either to:
   - A ratified ODR section (e.g. `<https://w3id.org/opda/odr/ODR-0011#section-8a-ufo-meta-category>`) — preferred for project-owned schemes.
   - A regulator URL (gov.uk / saa.gov.uk / DESNZ) — preferred for regulator-cited schemes per ODR-0011 §4a.
   - An external standards spec URL (eIDAS / OIDC4IDA / ODR-0015 §S015 Q1) — preferred for external-only schemes.
   - A data-dictionary leaf IRI (`<https://w3id.org/opda/data-dictionary#<path>>`) — preferred for per-member sources.
5. Completeness check — for each cited ODR-0011 `## Rules` / `## Operational specifications` subsection, verify the §5 coverage table above matches the validator's independent enumeration.
6. Cross-ADR consistency check — verify that downstream ADR-0011 (module TBox emission) can reference any of the 16 emitted schemes via `skos:exactMatch` / `dash:EnumSelectEditor` / `sh:in` without dangling-IRI failures.
7. Surfaced-ambiguity check — confirm §8 items 8.1–8.5 are within-engineering (not Council-routed) or, if the validator disagrees, route the disputed item to an Author-only ODR session per ODR-0001 §Self-amendment process.

Validation report should land at `docs/adr/validation/ADR-0010-validation-report.md`.
